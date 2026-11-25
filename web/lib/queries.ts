import { db } from "@/lib/db";
import { sportSlug } from "@/lib/sports";
import { hasPaidMembership, sessionPrice } from "@/lib/membership-policy";
import { sessionTerms } from "@/lib/session-terms";
import { sweepGameHolds } from "@/lib/waitlist";

// Registration statuses that occupy a spot in the game.
export function clubVisibility(userId: string) {
  return { userId, OR: [{ clubAccess: true }, { subscription: { is: { paidThrough: { gt: new Date() } } } }] };
}

const OCCUPYING = ["CONFIRMED", "PROVISIONAL", "OFFERED"] as const;

export type GameMeta = Awaited<ReturnType<typeof getGame>>;

/**
 * A game with computed roster/capacity info and the viewer's registration.
 * Returns null unless the viewer belongs to the game's club: clubs are
 * private, so rosters and details are members-only.
 */
export async function getGame(gameId: string, viewerId: string) {
  // Release lapsed offers/holds first so the roster and CTA are accurate even
  // between scheduled sweeps.
  await sweepGameHolds(gameId);
  const game = await db.game.findFirst({
    where: { id: gameId, OR: [{ org: { memberships: { some: clubVisibility(viewerId) } } }, { access: { in: ["OPEN", "MEMBERS"] } }, { registrations: { some: { userId: viewerId } } }] },
    include: {
      org: true,
      series: {
        select: {
          id: true,
          title: true,
          occurrenceCount: true,
          paymentMode: true,
          cadence: true,
        },
      },
      registrations: {
        include: {
          user: { select: { id: true, name: true, avatarColor: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!game) return null;

  const terms = await sessionTerms(db, viewerId, game);
  const ownRegistration = game.registrations.find((entry) => entry.userId === viewerId);
  const organizer = await db.membership.findFirst({ where: { orgId: game.orgId, userId: viewerId, role: "ORGANIZER" } });
  const collected = organizer ? await db.payment.aggregate({ where: { gameId, status: "SUCCEEDED", refundDue: false }, _sum: { amountCents: true } }) : null;
  const canSeeRoster = !terms.error || !!organizer || (ownRegistration && ["CONFIRMED", "PROVISIONAL"].includes(ownRegistration.status));
  const visibleRegistrations = canSeeRoster ? game.registrations : game.registrations.filter((entry) => entry.userId === viewerId);
  const occupied = game.registrations.filter((entry) => OCCUPYING.includes(entry.status as typeof OCCUPYING[number])).length;

  let attendanceByRegistrationId = new Map<
    string,
    { status: "PRESENT" | "NO_SHOW" }
  >();
  try {
    const records = await db.attendanceRecord.findMany({
      where: { gameId },
      select: { registrationId: true, status: true },
    });
    attendanceByRegistrationId = new Map(
      records.map((record) => [record.registrationId, { status: record.status }])
    );
  } catch (error) {
    // Production may briefly run new code before the attendance migration is applied.
    console.warn("Attendance records unavailable", error);
  }

  const registrations = visibleRegistrations.map((registration) => ({
    ...registration,
    attendance: attendanceByRegistrationId.get(registration.id) ?? null,
  }));

  const confirmed = registrations.filter((r) =>
    OCCUPYING.includes(r.status as (typeof OCCUPYING)[number])
  );
  const waitlist = registrations
    .filter((r) => r.status === "WAITLISTED")
    .sort((a, b) => (a.waitlistPos ?? 999) - (b.waitlistPos ?? 999));

  const taken = occupied;
  const spotsLeft = Math.max(0, game.capacity - taken);
  const isFull = spotsLeft <= 0;
  const myReg = registrations.find((r) => r.userId === viewerId) ?? null;
  const viewerPrice = myReg && ["CONFIRMED", "PROVISIONAL"].includes(myReg.status) && myReg.priceCents != null ? myReg.priceCents : terms.priceCents;

  return {
    ...game,
    priceCents: viewerPrice,
    regularPriceCents: game.priceCents,
    collectedCents: collected?._sum.amountCents ?? 0,
    paidMember: terms.paidMember,
    accessError: terms.error,
    canSeeRoster: !!canSeeRoster,
    effectiveModel: viewerPrice === 0 ? "FREE" as const : game.model,
    registrations,
    confirmed,
    waitlist,
    taken,
    spotsLeft,
    isFull,
    myReg,
  };
}

/** Lightweight game card data for lists. */
export async function listClubGames(
  userId: string,
  filters: { sport?: string; query?: string } = {}
) {
  const memberships = await db.membership.findMany({
    where: clubVisibility(userId),
    select: { orgId: true, org: { select: { membershipEnabled: true } }, subscription: true },
  });
  const orgIds = memberships.map((m) => m.orgId);
  const paidOrgIds = new Set(memberships.filter((m) => m.org.membershipEnabled && hasPaidMembership(m.subscription)).map((m) => m.orgId));

  const query = filters.query?.trim();
  const games = await db.game.findMany({
    where: {
      AND: [{ OR: [{ orgId: { in: orgIds } }, { access: "OPEN" }, { registrations: { some: { userId } } }] }],
      startsAt: { gte: new Date(Date.now() - 3600_000) },
      ...(filters.sport && filters.sport !== "all"
        ? { sport: { equals: filters.sport, mode: "insensitive" as const } }
        : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" as const } },
              { sport: { contains: query, mode: "insensitive" as const } },
              { venue: { contains: query, mode: "insensitive" as const } },
              { org: { name: { contains: query, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    },
    include: {
      org: { select: { name: true, handle: true, color: true } },
      registrations: { select: { userId: true, status: true, priceCents: true } },
    },
    orderBy: { startsAt: "asc" },
  });

  return games.map((g) => decorate(g, userId, paidOrgIds.has(g.orgId)));
}

/** Player registration history, including past and cancelled registrations. */
export async function listPlayerGameHistory(
  userId: string,
  filters: { sport?: string; query?: string } = {}
) {
  const query = filters.query?.trim();
  const gameFilter = {
    ...(filters.sport && filters.sport !== "all"
      ? { sport: { equals: filters.sport, mode: "insensitive" as const } }
      : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { sport: { contains: query, mode: "insensitive" as const } },
            { venue: { contains: query, mode: "insensitive" as const } },
            { org: { name: { contains: query, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };
  const registrations = await db.registration.findMany({
    where: {
      userId,
      ...(Object.keys(gameFilter).length > 0 ? { game: gameFilter } : {}),
    },
    include: {
      game: {
        include: {
          org: { select: { name: true, handle: true, color: true } },
          registrations: { select: { userId: true, status: true, priceCents: true } },
        },
      },
    },
    orderBy: [{ game: { startsAt: "desc" } }, { updatedAt: "desc" }],
    take: 40,
  });

  return registrations.map((registration) => {
    const decorated = decorate(registration.game, userId);
    return {
      ...decorated,
      myStatus: registration.status,
      payStatus: registration.payStatus,
      waitlistPos: registration.waitlistPos,
      registeredAt: registration.createdAt,
      updatedAt: registration.updatedAt,
      isPast: registration.game.startsAt < new Date(),
    };
  });
}

export async function listAvailableSports(userId: string) {
  const memberships = await db.membership.findMany({
    where: clubVisibility(userId),
    select: { orgId: true, org: { select: { membershipEnabled: true } }, subscription: true },
  });
  const orgIds = memberships.map((m) => m.orgId);
  const [gameSports, orgSports] = await Promise.all([
    db.game.findMany({
      where: { OR: [{ orgId: { in: orgIds } }, { access: "OPEN" }] },
      distinct: ["sport"],
      select: { sport: true },
      orderBy: { sport: "asc" },
    }),
    db.organization.findMany({
      where: { id: { in: orgIds } },
      distinct: ["sport"],
      select: { sport: true },
      orderBy: { sport: "asc" },
    }),
  ]);

  const bySlug = new Map<string, string>();
  for (const item of [...orgSports, ...gameSports]) {
    if (item.sport) bySlug.set(sportSlug(item.sport), item.sport);
  }
  return [...bySlug.values()].sort((a, b) => a.localeCompare(b));
}

function decorate<
  T extends {
    capacity: number;
    registrations: { userId: string; status: string; priceCents?: number | null }[];
    model: string; priceCents: number; memberPriceCents: number | null;
  }
>(g: T, userId: string, paidMember = false) {
  const taken = g.registrations.filter((r) =>
    OCCUPYING.includes(r.status as (typeof OCCUPYING)[number])
  ).length;
  const spotsLeft = Math.max(0, g.capacity - taken);
  const myReg = g.registrations.find((r) => r.userId === userId) ?? null;
  return {
    ...g,
    regularPriceCents: g.priceCents,
    priceCents: myReg && ["CONFIRMED", "PROVISIONAL"].includes(myReg.status) && myReg.priceCents != null ? myReg.priceCents : sessionPrice(g, paidMember),
    paidMember,
    taken,
    spotsLeft,
    isFull: spotsLeft <= 0,
    myStatus: myReg?.status ?? null,
  };
}

/** Home dashboard: things needing attention + upcoming + open games. */
export async function getDashboard(userId: string) {
  const games = await listClubGames(userId);

  const mine = games.filter((g) => g.myStatus && g.myStatus !== "CANCELLED");
  const open = games.filter((g) => !g.myStatus);

  const offers = await db.registration.findMany({
    where: { userId, status: { in: ["OFFERED", "WAITLISTED"] } },
    include: { game: { include: { org: true } } },
  });

  const unpaid = mine.filter(
    (g) => g.myStatus === "PROVISIONAL"
  );

  const announcements = await db.announcement.findMany({
    where: { org: { memberships: { some: clubVisibility(userId) } } },
    include: { org: { select: { name: true, handle: true, color: true } } },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return { mine, open, offers, unpaid, announcements };
}

export async function listClubs(userId: string) {
  return db.organization.findMany({
    // Keep a subscribed club discoverable for renewal after paid access expires.
    where: { memberships: { some: { userId } } },
    include: {
      _count: { select: { memberships: true, games: true } },
      memberships: { where: { userId }, include: { subscription: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getClub(handle: string, userId: string) {
  const club = await db.organization.findUnique({
    where: { handle },
    include: {
      _count: { select: { memberships: true } },
      memberships: { where: { userId }, include: { subscription: true } },
    },
  });
  if (!club) return null;
  // Non-members only get the public card (name, sport, blurb) and a join form.
  const paidMember = club.membershipEnabled && hasPaidMembership(club.memberships[0]?.subscription);
  const isMember = !!club.memberships[0]?.clubAccess || paidMember;

  const announcements = await db.announcement.findMany({
    where: { orgId: club.id, ...(isMember ? {} : { id: "" }) },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  const games = await db.game.findMany({
    where: { orgId: club.id, ...(isMember ? {} : { access: { in: ["OPEN" as const, "MEMBERS" as const] } }), startsAt: { gte: new Date(Date.now() - 3600_000) } },
    include: { registrations: { select: { userId: true, status: true, priceCents: true } } },
    orderBy: { startsAt: "asc" },
  });
  return { ...club, isMember, announcements, paidMember, games: games.map((g) => decorate(g, userId, paidMember)) };
}

export async function getNotifications(userId: string) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUnreadCount(userId: string) {
  return db.notification.count({ where: { userId, read: false } });
}

export async function getProfileData(userId: string) {
  const [attended, payments, memberships] = await Promise.all([
    db.registration.count({ where: { userId, status: "CONFIRMED" } }),
    db.payment.findMany({
      where: { userId },
      include: { game: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.membership.count({ where: { userId } }),
  ]);
  return { attended, payments, clubCount: memberships };
}
