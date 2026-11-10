// Test harness for calling server actions directly against a real Postgres.
//
// Server actions depend on a request: the signed-in user (Auth.js), Next's
// cache/navigation helpers, Stripe and email. installMocks() swaps those for
// test doubles so the actions' own database logic runs unchanged. Call it in
// a `before()` hook BEFORE importing any app module, and run the file with
// `node --experimental-test-module-mocks --import tsx --test`.
import { mock } from "node:test";
import { AsyncLocalStorage } from "node:async_hooks";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "../../..");
const libUrl = (file: string) => pathToFileURL(path.join(root, "lib", file)).href;

export class RedirectSignal extends Error {
  constructor(public url: string) {
    super(`NEXT_REDIRECT:${url}`);
  }
}
export class NotFoundSignal extends Error {
  constructor() {
    super("NEXT_NOT_FOUND");
  }
}
export class NotSignedIn extends Error {
  constructor() {
    super("NOT_SIGNED_IN");
  }
}

export type FakeRefund = { payment_intent: string; idempotencyKey?: string };

/** Everything the doubles record, plus switches tests can flip. */
export const harness = {
  revalidated: [] as string[],
  refunds: [] as FakeRefund[],
  checkoutSessions: [] as Record<string, unknown>[],
  offerEmails: [] as { to: string; gameId: string }[],
  stripeEnabled: false,
  failRefunds: false,
  accountChargesEnabled: true,
  reset() {
    this.revalidated = [];
    this.refunds = [];
    this.checkoutSessions = [];
    this.offerEmails = [];
    this.stripeEnabled = false;
    this.failRefunds = false;
    this.accountChargesEnabled = true;
  },
};

const actor = new AsyncLocalStorage<string>();

/** Run fn as a signed-in user. Safe to use concurrently. */
export function actAs<T>(userId: string, fn: () => Promise<T>): Promise<T> {
  return actor.run(userId, fn);
}

const fakeStripe = {
  refunds: {
    async create(params: { payment_intent: string }, opts?: { idempotencyKey?: string }) {
      if (harness.failRefunds) throw new Error("Stripe refund failed (test)");
      // Stripe dedupes on the idempotency key: a repeat returns the same refund.
      const repeat = harness.refunds.find((r) => r.idempotencyKey && r.idempotencyKey === opts?.idempotencyKey);
      if (!repeat) harness.refunds.push({ payment_intent: params.payment_intent, idempotencyKey: opts?.idempotencyKey });
      return { id: `re_${harness.refunds.length}` };
    },
  },
  checkout: {
    sessions: {
      async create(params: Record<string, unknown>) {
        harness.checkoutSessions.push(params);
        const id = `cs_test_${harness.checkoutSessions.length}`;
        return { id, url: `https://checkout.stripe.test/${id}` };
      },
    },
  },
  accounts: {
    async create() {
      return { id: "acct_test_1" };
    },
    async retrieve() {
      return { charges_enabled: harness.accountChargesEnabled };
    },
  },
  accountLinks: {
    async create() {
      return { url: "https://connect.stripe.test/onboard" };
    },
  },
};

export async function installMocks() {
  const testUrl = process.env.TEST_DATABASE_URL;
  if (!testUrl) throw new Error("Set TEST_DATABASE_URL to a disposable, migrated Postgres database.");
  process.env.DATABASE_URL = testUrl;
  delete process.env.STRIPE_SECRET_KEY;

  mock.module("next/cache", {
    namedExports: {
      revalidatePath: (p: string) => harness.revalidated.push(p),
      revalidateTag: () => {},
      updateTag: () => {},
      refresh: () => {},
      unstable_cache: <T>(fn: T) => fn,
    },
  });
  mock.module("next/navigation", {
    namedExports: {
      redirect: (url: string) => {
        throw new RedirectSignal(url);
      },
      permanentRedirect: (url: string) => {
        throw new RedirectSignal(url);
      },
      notFound: () => {
        throw new NotFoundSignal();
      },
    },
  });

  const { db } = await import("../../../lib/db");

  const currentUser = async () => {
    const id = actor.getStore();
    if (!id) return null;
    return db.user.findUnique({ where: { id } });
  };
  const isOrganizer = async (userId: string, orgId: string) => {
    const m = await db.membership.findUnique({ where: { userId_orgId: { userId, orgId } } });
    return m?.role === "ORGANIZER";
  };
  mock.module(libUrl("session.ts"), {
    namedExports: {
      DatabaseUnavailableError: class extends Error {},
      getCurrentUser: currentUser,
      requireUser: async () => {
        const user = await currentUser();
        if (!user) throw new NotSignedIn();
        return user;
      },
      isOrganizer,
      hasOrganizerAccess: async (userId: string) =>
        Boolean(await db.membership.findFirst({ where: { userId, role: "ORGANIZER" } })),
      requireOrganizer: async (orgId: string) => {
        const user = await currentUser();
        if (!user) throw new NotSignedIn();
        if (!(await isOrganizer(user.id, orgId))) throw new RedirectSignal("/home");
        return user;
      },
    },
  });

  mock.module(libUrl("stripe.ts"), {
    namedExports: {
      getStripe: () => (harness.stripeEnabled ? fakeStripe : null),
      platformFeeBps: () => {
        const v = parseInt(process.env.PLATFORM_FEE_BPS || "0", 10);
        return Number.isFinite(v) && v > 0 ? v : 0;
      },
      appUrl: () => "http://localhost:3000",
    },
  });

  mock.module(libUrl("email.ts"), {
    namedExports: {
      appUrl: () => "http://localhost:3000",
      sendVerificationEmail: async () => {},
      sendPasswordResetEmail: async () => {},
      sendOrganizerLeadEmail: async () => {},
      sendSpotOfferEmail: async (opts: { to: string; gameId: string }) => {
        harness.offerEmails.push({ to: opts.to, gameId: opts.gameId });
      },
    },
  });

  return db;
}

/** Test data that cleans up after itself. */
export function fixtures(db: Awaited<ReturnType<typeof installMocks>>) {
  const runId = `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const userIds: string[] = [];
  const orgIds: string[] = [];
  let n = 0;

  async function user(label: string, extra: { organizerApproved?: boolean } = {}) {
    n += 1;
    const u = await db.user.create({
      data: {
        email: `${runId}-${n}-${label}@example.test`,
        name: label,
        emailVerified: new Date(),
        organizerApproved: extra.organizerApproved ?? false,
      },
    });
    userIds.push(u.id);
    return u;
  }

  async function club(ownerId: string, extra: { chargesEnabled?: boolean } = {}) {
    n += 1;
    const org = await db.organization.create({
      data: {
        name: `Club ${runId} ${n}`,
        handle: `${runId}-${n}`,
        inviteCode: `${runId}-${n}-CODE`.toUpperCase(),
        ownerId,
        stripeAccountId: extra.chargesEnabled ? "acct_test_club" : null,
        chargesEnabled: extra.chargesEnabled ?? false,
        memberships: { create: { userId: ownerId, role: "ORGANIZER" } },
      },
    });
    orgIds.push(org.id);
    return org;
  }

  async function join(userId: string, orgId: string, role: "PLAYER" | "ORGANIZER" = "PLAYER") {
    return db.membership.create({ data: { userId, orgId, role } });
  }

  /** A player who belongs to the club. */
  async function member(orgId: string, label: string) {
    const u = await user(label);
    await join(u.id, orgId);
    return u;
  }

  async function game(
    orgId: string,
    opts: {
      capacity?: number;
      model?: "PAY" | "LATER" | "FREE";
      priceCents?: number;
      startsInHours?: number;
      title?: string;
    } = {}
  ) {
    const model = opts.model ?? "FREE";
    return db.game.create({
      data: {
        orgId,
        title: opts.title ?? `Game ${runId}`,
        venue: "Brewer Park Turf",
        startsAt: new Date(Date.now() + (opts.startsInHours ?? 72) * 3_600_000),
        capacity: opts.capacity ?? 4,
        model,
        priceCents: opts.priceCents ?? (model === "FREE" ? 0 : 1200),
      },
    });
  }

  async function reg(gameId: string, userId: string) {
    return db.registration.findUnique({ where: { userId_gameId: { userId, gameId } } });
  }

  async function regs(gameId: string) {
    return db.registration.findMany({ where: { gameId }, orderBy: { createdAt: "asc" } });
  }

  async function occupied(gameId: string) {
    return db.registration.count({
      where: { gameId, status: { in: ["CONFIRMED", "PROVISIONAL", "OFFERED"] } },
    });
  }

  async function cleanup() {
    await db.organization.deleteMany({ where: { id: { in: orgIds } } });
    await db.user.deleteMany({ where: { id: { in: userIds } } });
  }

  return { runId, user, club, join, member, game, reg, regs, occupied, cleanup };
}

/** Build FormData from a plain object. */
export function form(values: Record<string, string | number>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.set(k, String(v));
  return fd;
}

/** Await a promise that should throw a redirect; returns the target URL. */
export async function expectRedirect(p: Promise<unknown>) {
  try {
    await p;
  } catch (error) {
    if (error instanceof RedirectSignal) return error.url;
    throw error;
  }
  throw new Error("Expected a redirect");
}
