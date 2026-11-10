// Dashboard data: player-facing queries (lib/queries.ts) and the numbers the
// organizer dashboards compute (app/(app)/manage/**), checked against real
// registrations created through the server actions.
import test, { after, before, beforeEach, describe } from "node:test";
import assert from "node:assert/strict";
import { isValidElement, type ReactNode } from "react";
import { actAs, fixtures, harness, installMocks } from "../helpers/harness";

let db: Awaited<ReturnType<typeof installMocks>>;
let fx: ReturnType<typeof fixtures>;
let queries: typeof import("../../../lib/queries");
let games: typeof import("../../../lib/actions/games");
let payments: typeof import("../../../lib/actions/payments");
let FinancesPage: (props: { searchParams: Promise<Record<string, string>> }) => Promise<ReactNode>;
let ManageGamePage: (props: { params: Promise<{ id: string }> }) => Promise<ReactNode>;

before(async () => {
  db = await installMocks();
  fx = fixtures(db);
  queries = await import("../../../lib/queries");
  games = await import("../../../lib/actions/games");
  payments = await import("../../../lib/actions/payments");
  FinancesPage = (await import("../../../app/(app)/manage/finances/page")).default;
  ManageGamePage = (await import("../../../app/(app)/manage/games/[id]/page")).default;
});

after(async () => {
  await fx.cleanup();
  await db.$disconnect();
});

beforeEach(() => harness.reset());

/** Find the `value` prop of the stat element with the given label. */
function statValue(tree: ReactNode, label: string): string | undefined {
  const seen = new Set<unknown>();
  const walk = (node: unknown): string | undefined => {
    if (!node || typeof node !== "object" || seen.has(node)) return undefined;
    seen.add(node);
    if (Array.isArray(node)) {
      for (const child of node) {
        const hit = walk(child);
        if (hit !== undefined) return hit;
      }
      return undefined;
    }
    if (isValidElement(node)) {
      const props = node.props as Record<string, unknown>;
      if (props.label === label && typeof props.value === "string") return props.value;
      for (const v of Object.values(props)) {
        const hit = walk(v);
        if (hit !== undefined) return hit;
      }
    }
    return undefined;
  };
  return walk(tree);
}

describe("player queries", () => {
  test("getGame: members only, with live counts and the viewer's registration", async () => {
    const o = await fx.user("gg-o", { organizerApproved: true });
    const club = await fx.club(o.id);
    const g = await fx.game(club.id, { capacity: 2 });
    const [a, b, c] = await Promise.all(["gga", "ggb", "ggc"].map((l) => fx.member(club.id, l)));
    await actAs(a.id, () => games.reserveSpot(g.id));
    await actAs(b.id, () => games.reserveSpot(g.id));
    await actAs(c.id, () => games.joinWaitlist(g.id));

    const outsider = await fx.user("gg-out");
    assert.equal(await queries.getGame(g.id, outsider.id), null, "non-members see nothing");

    const view = await queries.getGame(g.id, c.id);
    assert.equal(view?.taken, 2);
    assert.equal(view?.spotsLeft, 0);
    assert.equal(view?.isFull, true);
    assert.equal(view?.waitlist.length, 1);
    assert.equal(view?.myReg?.status, "WAITLISTED");
  });

  test("getGame releases a lapsed hold before showing the roster", async () => {
    const o = await fx.user("gs-o", { organizerApproved: true });
    const club = await fx.club(o.id, { chargesEnabled: true });
    const g = await fx.game(club.id, { capacity: 1, model: "PAY" });
    const p = await fx.member(club.id, "gs-p");
    harness.stripeEnabled = true;
    await actAs(p.id, () => payments.createCheckout(g.id));
    harness.stripeEnabled = false;
    const w = await fx.member(club.id, "gs-w");
    await db.registration.create({ data: { gameId: g.id, userId: w.id, status: "WAITLISTED", payStatus: "UNPAID", waitlistPos: 1 } });
    await db.registration.updateMany({ where: { gameId: g.id, userId: p.id }, data: { offerExpiresAt: new Date(Date.now() - 1000) } });

    const view = await queries.getGame(g.id, w.id);
    assert.equal(view?.myReg?.status, "OFFERED");
    assert.equal(view?.taken, 1);
  });

  test("listClubGames: only my clubs, upcoming only, search and sport filters", async () => {
    const o = await fx.user("lc-o", { organizerApproved: true });
    const mine = await fx.club(o.id);
    const other = await fx.club(o.id);
    const p = await fx.member(mine.id, "lc-p");
    await fx.game(mine.id, { title: `Upcoming ${fx.runId}` });
    await fx.game(mine.id, { title: `Ancient ${fx.runId}`, startsInHours: -5 });
    await fx.game(other.id, { title: `Elsewhere ${fx.runId}` });
    await db.game.create({
      data: { orgId: mine.id, title: `Hoops ${fx.runId}`, venue: "Gym", sport: "Basketball", startsAt: new Date(Date.now() + 86_400_000) },
    });

    const titles = (await queries.listClubGames(p.id)).map((g) => g.title);
    assert.ok(titles.includes(`Upcoming ${fx.runId}`));
    assert.ok(!titles.includes(`Ancient ${fx.runId}`), "past games hidden");
    assert.ok(!titles.includes(`Elsewhere ${fx.runId}`), "other clubs hidden");
    assert.deepEqual((await queries.listClubGames(p.id, { sport: "basketball" })).map((g) => g.title), [`Hoops ${fx.runId}`]);
    assert.deepEqual((await queries.listClubGames(p.id, { query: "hoops" })).map((g) => g.title), [`Hoops ${fx.runId}`]);
  });

  test("getDashboard: my games, open games and pay-later spots that still need paying", async () => {
    const o = await fx.user("db-o", { organizerApproved: true });
    const club = await fx.club(o.id);
    const p = await fx.member(club.id, "db-p");
    const free = await fx.game(club.id, { model: "FREE" });
    const later = await fx.game(club.id, { model: "LATER" });
    const open = await fx.game(club.id);
    await actAs(p.id, () => games.reserveSpot(free.id));
    await actAs(p.id, () => games.reserveSpot(later.id));

    const d = await queries.getDashboard(p.id);
    const ids = (xs: { id: string }[]) => xs.map((x) => x.id).sort();
    assert.deepEqual(ids(d.mine), [free.id, later.id].sort());
    assert.ok(d.open.some((g) => g.id === open.id));
    assert.deepEqual(ids(d.unpaid), [later.id]);
  });

  test("getDashboard: a game the player cancelled stays visible so they can rejoin", async () => {
    const o = await fx.user("dc-o", { organizerApproved: true });
    const club = await fx.club(o.id);
    const p = await fx.member(club.id, "dc-p");
    const g = await fx.game(club.id);
    await actAs(p.id, () => games.reserveSpot(g.id));
    await actAs(p.id, () => games.cancelRegistration(g.id));
    const d = await queries.getDashboard(p.id);
    const visible = d.mine.some((x) => x.id === g.id) || d.open.some((x) => x.id === g.id);
    assert.ok(visible, "game disappears from the home dashboard after cancelling");
  });
});

test("profile 'games' counts games actually played, not upcoming ones or no-shows", async () => {
  const o = await fx.user("pf-o", { organizerApproved: true });
  const club = await fx.club(o.id);
  const p = await fx.member(club.id, "pf-p");
  const played = await fx.game(club.id, { startsInHours: -48 });
  const noShow = await fx.game(club.id, { startsInHours: -24 });
  const upcoming = await fx.game(club.id);
  for (const g of [played, noShow, upcoming]) {
    await db.registration.create({ data: { gameId: g.id, userId: p.id, status: "CONFIRMED", payStatus: "FREE" } });
  }
  const r = await fx.reg(noShow.id, p.id);
  await db.attendanceRecord.create({ data: { registrationId: r!.id, gameId: noShow.id, userId: p.id, status: "NO_SHOW" } });
  assert.equal((await queries.getProfileData(p.id)).attended, 1);
});

describe("organizer dashboards", () => {
  test("Finances 'Pending' only counts money players actually owe", async () => {
    const o = await fx.user("fin-o", { organizerApproved: true });
    const club = await fx.club(o.id, { chargesEnabled: true });

    // Game 1 ($10, 1 spot): A paid, B is on the waitlist (owes nothing).
    const g1 = await fx.game(club.id, { model: "PAY", priceCents: 1000, capacity: 1 });
    const [a, b] = await Promise.all(["fa", "fb"].map((l) => fx.member(club.id, l)));
    await actAs(a.id, () => payments.devCompletePayment(g1.id));
    await actAs(b.id, () => games.joinWaitlist(g1.id));

    // Game 2 ($10): C abandoned checkout and the hold was released.
    const g2 = await fx.game(club.id, { model: "PAY", priceCents: 1000, capacity: 4 });
    const c = await fx.member(club.id, "fc");
    harness.stripeEnabled = true;
    await actAs(c.id, () => payments.createCheckout(g2.id));
    harness.stripeEnabled = false;
    await db.registration.updateMany({ where: { gameId: g2.id, userId: c.id }, data: { offerExpiresAt: new Date(Date.now() - 1000) } });
    await queries.getGame(g2.id, c.id); // sweep

    // Game 3 ($10, pay later): D reserved and genuinely owes $10.
    const g3 = await fx.game(club.id, { model: "LATER", priceCents: 1000 });
    const d = await fx.member(club.id, "fd");
    await actAs(d.id, () => games.reserveSpot(g3.id));

    const tree = await actAs(o.id, () => FinancesPage({ searchParams: Promise.resolve({}) }));
    assert.equal(statValue(tree, "Collected"), "$10.00");
    assert.equal(statValue(tree, "Pending"), "$10.00", "waitlisted and released players were counted as owing money");
  });

  test("Game page 'Collected' matches the money the club actually holds", async () => {
    const o = await fx.user("gc-o", { organizerApproved: true });
    const club = await fx.club(o.id);
    const g = await fx.game(club.id, { model: "PAY", priceCents: 1000, capacity: 3, startsInHours: 48 });
    const [a, b] = await Promise.all(["gca", "gcb"].map((l) => fx.member(club.id, l)));
    await actAs(a.id, () => payments.devCompletePayment(g.id));
    await actAs(b.id, () => payments.devCompletePayment(g.id));
    await actAs(b.id, () => games.cancelRegistration(g.id)); // refunded
    const tree = await actAs(o.id, () => ManageGamePage({ params: Promise.resolve({ id: g.id }) }));
    assert.equal(statValue(tree, "Filled"), "1/3");
    assert.equal(statValue(tree, "Collected"), "$10.00");
  });
});
