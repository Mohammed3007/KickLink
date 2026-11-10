// Organizer-side server actions (lib/actions/manage.ts, clubs.ts,
// payments.ts Connect onboarding) exercised against a real Postgres.
import test, { after, before, beforeEach, describe } from "node:test";
import assert from "node:assert/strict";
import { actAs, expectRedirect, fixtures, form, harness, installMocks } from "../helpers/harness";

let db: Awaited<ReturnType<typeof installMocks>>;
let fx: ReturnType<typeof fixtures>;
let manage: typeof import("../../../lib/actions/manage");
let clubs: typeof import("../../../lib/actions/clubs");
let games: typeof import("../../../lib/actions/games");
let payments: typeof import("../../../lib/actions/payments");

let organizer: { id: string };
let orgId = "";
let otherOrganizer: { id: string };

before(async () => {
  db = await installMocks();
  fx = fixtures(db);
  manage = await import("../../../lib/actions/manage");
  clubs = await import("../../../lib/actions/clubs");
  games = await import("../../../lib/actions/games");
  payments = await import("../../../lib/actions/payments");
  organizer = await fx.user("organizer", { organizerApproved: true });
  orgId = (await fx.club(organizer.id)).id;
  otherOrganizer = await fx.user("rival", { organizerApproved: true });
  await fx.club(otherOrganizer.id);
});

after(async () => {
  await fx.cleanup();
  await db.$disconnect();
});

beforeEach(() => harness.reset());

/** Next week at 19:00 as a datetime-local string. */
function wallTime(daysAhead = 7, hhmm = "19:00") {
  const d = new Date(Date.now() + daysAhead * 86_400_000);
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  return `${ymd}T${hhmm}`;
}

function gameForm(over: Record<string, string | number> = {}) {
  return form({
    orgId,
    title: "Sunday Night 7s",
    sport: "Soccer",
    venue: "Brewer Park Turf",
    address: "",
    startsAt: wallTime(),
    durationMins: 90,
    format: "7-a-side",
    skill: "Intermediate",
    price: "12",
    capacity: 14,
    model: "PAY",
    recurrenceMode: "SINGLE",
    ...over,
  });
}

describe("createGame", () => {
  test("creates a single game and redirects to it", async () => {
    const url = await expectRedirect(actAs(organizer.id, () => manage.createGame(undefined, gameForm())));
    const id = url.split("/").pop()!;
    const g = await db.game.findUnique({ where: { id } });
    assert.equal(g?.title, "Sunday Night 7s");
    assert.equal(g?.priceCents, 1200);
    assert.equal(g?.capacity, 14);
    assert.equal(g?.orgId, orgId);
  });

  test("weekly series: one game per week at the same local time, across the DST change", async () => {
    // Starting mid-October crosses the November clock change in Toronto.
    const url = await expectRedirect(
      actAs(organizer.id, () =>
        manage.createGame(undefined, gameForm({ recurrenceMode: "WEEKLY", occurrenceCount: 6, startsAt: "2027-10-17T19:00", title: "Weekly 7s" }))
      )
    );
    const first = await db.game.findUnique({ where: { id: url.split("/").pop()! } });
    const series = await db.game.findMany({ where: { seriesId: first!.seriesId! }, orderBy: { occurrenceIndex: "asc" } });
    assert.equal(series.length, 6);
    assert.deepEqual(series.map((g) => g.occurrenceIndex), [1, 2, 3, 4, 5, 6]);
    const local = series.map((g) =>
      new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(g.startsAt)
    );
    assert.ok(local.every((l) => l === local[0]), `every game at the same local time: ${local.join(", ")}`);
    const rec = await db.recurringEventSeries.findUnique({ where: { id: first!.seriesId! } });
    assert.equal(rec?.occurrenceCount, 6);
    assert.equal(rec?.endsAt.getTime(), series[5].startsAt.getTime());
  });

  test("players and organizers of other clubs can't create games here", async () => {
    const player = await fx.member(orgId, "player");
    assert.deepEqual(await actAs(player.id, () => manage.createGame(undefined, gameForm())), { error: "Not authorized for this club." });
    assert.deepEqual(await actAs(otherOrganizer.id, () => manage.createGame(undefined, gameForm())), { error: "Not authorized for this club." });
  });

  test("rejects past start times, bad prices and tiny capacities", async () => {
    const past = await actAs(organizer.id, () => manage.createGame(undefined, gameForm({ startsAt: wallTime(-1) })));
    assert.deepEqual(past, { error: "Choose a future start time." });
    const neg = await actAs(organizer.id, () => manage.createGame(undefined, gameForm({ price: "-5" })));
    assert.ok(neg?.error);
    const junk = await actAs(organizer.id, () => manage.createGame(undefined, gameForm({ price: "abc" })));
    assert.ok(junk?.error, "non-numeric price");
    const cap = await actAs(organizer.id, () => manage.createGame(undefined, gameForm({ capacity: 1 })));
    assert.ok(cap?.error);
  });

  test("a pay-now game must have a price (a $0 pay-now game can't be joined at all)", async () => {
    const res = await actAs(organizer.id, () =>
      manage.createGame(undefined, gameForm({ price: "0", model: "PAY", title: "Zero pay" })).catch((e) => e)
    );
    // Correct behaviour: the form is rejected. If it was accepted, prove the game is a dead end.
    if (res && typeof res === "object" && "url" in res) {
      const g = await db.game.findUnique({ where: { id: (res as { url: string }).url.split("/").pop()! } });
      const p = await fx.member(orgId, "zeropay");
      const reserve = await actAs(p.id, () => games.reserveSpot(g!.id));
      const pay = await actAs(p.id, () => payments.devCompletePayment(g!.id));
      assert.fail(`$0 PAY game was created; reserve → ${JSON.stringify(reserve)}, pay → ${JSON.stringify(pay)}`);
    }
    assert.ok((res as { error?: string })?.error, "expected a validation error");
  });

  test("a free game can't carry a price", async () => {
    const res = await actAs(organizer.id, () =>
      manage.createGame(undefined, gameForm({ price: "15", model: "FREE", title: "Free but priced" })).catch((e) => e)
    );
    if (res && typeof res === "object" && "url" in res) {
      const g = await db.game.findUnique({ where: { id: (res as { url: string }).url.split("/").pop()! } });
      assert.equal(g?.priceCents, 0, "FREE game stored with a price");
    } else {
      assert.ok((res as { error?: string })?.error);
    }
  });
});

describe("roster: markPaid", () => {
  test("cash at the field confirms a held spot and records an in-person payment", async () => {
    const g = await fx.game(orgId, { model: "LATER", priceCents: 1000 });
    const p = await fx.member(orgId, "cash");
    await actAs(p.id, () => games.reserveSpot(g.id));
    const r = await fx.reg(g.id, p.id);
    assert.deepEqual(await actAs(organizer.id, () => manage.markPaid(r!.id)), { ok: true });
    const after = await fx.reg(g.id, p.id);
    assert.equal(after?.status, "CONFIRMED");
    assert.equal(after?.payStatus, "PAID");
    const pay = await db.payment.findFirst({ where: { gameId: g.id, userId: p.id } });
    assert.equal(pay?.amountCents, 1000);
    assert.equal(pay?.stripeId, null);
  });

  test("a hold that lapsed is released, not confirmed, and the organizer is told why", async () => {
    const g = await fx.game(orgId, { model: "PAY", capacity: 1 });
    const [a, w] = await Promise.all(["lapa", "lapw"].map((l) => fx.member(orgId, l)));
    const hold = await db.registration.create({
      data: { gameId: g.id, userId: a.id, status: "PROVISIONAL", payStatus: "UNPAID", offerExpiresAt: new Date(Date.now() - 1000) },
    });
    await db.registration.create({ data: { gameId: g.id, userId: w.id, status: "WAITLISTED", payStatus: "UNPAID", waitlistPos: 1 } });
    const res = await actAs(organizer.id, () => manage.markPaid(hold.id));
    assert.equal(res.ok, false);
    assert.match((res as { error: string }).error, /released/);
    assert.equal((await fx.reg(g.id, w.id))?.status, "OFFERED");
    assert.equal(await fx.occupied(g.id), 1);
    assert.equal(await db.payment.count({ where: { gameId: g.id } }), 0);
  });

  test("can't mark confirmed or waitlisted players paid", async () => {
    const g = await fx.game(orgId, { model: "LATER", capacity: 1 });
    const a = await fx.member(orgId, "mpa");
    await actAs(a.id, () => games.reserveSpot(g.id));
    const ra = await fx.reg(g.id, a.id);
    await actAs(organizer.id, () => manage.markPaid(ra!.id));
    assert.equal((await actAs(organizer.id, () => manage.markPaid(ra!.id))).ok, false, "already paid");
    const w = await fx.member(orgId, "mpw");
    await actAs(w.id, () => games.joinWaitlist(g.id));
    const rw = await fx.reg(g.id, w.id);
    assert.equal((await actAs(organizer.id, () => manage.markPaid(rw!.id))).ok, false, "waitlisted");
  });

  test("an offered spot in a FREE game can't be 'marked paid' as a $0 payment", async () => {
    const g = await fx.game(orgId, { model: "FREE", capacity: 1 });
    const holder = await fx.member(orgId, "fh");
    await actAs(holder.id, () => games.reserveSpot(g.id));
    const w = await fx.member(orgId, "fw");
    await actAs(w.id, () => games.joinWaitlist(g.id));
    await actAs(holder.id, () => games.cancelRegistration(g.id));
    const rw = await fx.reg(g.id, w.id);
    assert.equal(rw?.status, "OFFERED");
    const res = await actAs(organizer.id, () => manage.markPaid(rw!.id));
    const pay = await db.payment.count({ where: { gameId: g.id, userId: w.id } });
    assert.ok(!res.ok || pay === 0, `free game got a payment row (${pay}) and payStatus ${(await fx.reg(g.id, w.id))?.payStatus}`);
  });

  test("organizer of another club is refused with an error, not a crash", async () => {
    const g = await fx.game(orgId, { model: "LATER" });
    const p = await fx.member(orgId, "xclub");
    await actAs(p.id, () => games.reserveSpot(g.id));
    const r = await fx.reg(g.id, p.id);
    const res = await actAs(otherOrganizer.id, () => manage.markPaid(r!.id)).catch((e: Error) => ({ threw: e.message }));
    assert.equal((await fx.reg(g.id, p.id))?.payStatus, "UNPAID", "data untouched");
    assert.deepEqual(res, { ok: false, error: "Not authorized for this club." }, "should return an error the UI can show");
  });
});

describe("roster: removePlayer", () => {
  test("removing a paid player refunds them, notifies them and offers the spot on", async () => {
    const g = await fx.game(orgId, { model: "PAY", capacity: 1 });
    const p = await fx.member(orgId, "rm");
    await actAs(p.id, () => payments.devCompletePayment(g.id));
    const w = await fx.member(orgId, "rmw");
    await actAs(w.id, () => games.joinWaitlist(g.id));
    const r = await fx.reg(g.id, p.id);
    assert.deepEqual(await actAs(organizer.id, () => manage.removePlayer(r!.id)), { ok: true });
    const after = await fx.reg(g.id, p.id);
    assert.equal(after?.status, "CANCELLED");
    assert.equal(after?.payStatus, "REFUNDED");
    assert.equal((await fx.reg(g.id, w.id))?.status, "OFFERED");
    assert.equal(await db.notification.count({ where: { userId: p.id, title: { startsWith: "Removed from" } } }), 1);
  });

  test("removing a waitlisted player closes the gap", async () => {
    const g = await fx.game(orgId, { capacity: 1 });
    const h = await fx.member(orgId, "rh");
    await actAs(h.id, () => games.reserveSpot(g.id));
    const [a, b] = await Promise.all(["ra", "rb"].map((l) => fx.member(orgId, l)));
    await actAs(a.id, () => games.joinWaitlist(g.id));
    await actAs(b.id, () => games.joinWaitlist(g.id));
    await actAs(organizer.id, async () => manage.removePlayer((await fx.reg(g.id, a.id))!.id));
    assert.equal((await fx.reg(g.id, b.id))?.waitlistPos, 1);
    assert.equal(await fx.occupied(g.id), 1);
  });

  test("players and other clubs' organizers can't remove anyone", async () => {
    const g = await fx.game(orgId);
    const [p, q] = await Promise.all(["rp", "rq"].map((l) => fx.member(orgId, l)));
    await actAs(p.id, () => games.reserveSpot(g.id));
    const r = await fx.reg(g.id, p.id);
    assert.deepEqual(await actAs(q.id, () => manage.removePlayer(r!.id)), { ok: false, error: "Not authorized for this club." });
    assert.deepEqual(await actAs(otherOrganizer.id, () => manage.removePlayer(r!.id)), { ok: false, error: "Not authorized for this club." });
    assert.equal((await fx.reg(g.id, p.id))?.status, "CONFIRMED");
  });
});

describe("roster: offerWaitlistedSpot", () => {
  test("offers a specific waitlisted player when a spot is open", async () => {
    const g = await fx.game(orgId, { capacity: 2 });
    const h = await fx.member(orgId, "oh");
    await actAs(h.id, () => games.reserveSpot(g.id));
    const h2 = await fx.member(orgId, "oh2");
    await actAs(h2.id, () => games.reserveSpot(g.id));
    const [a, b] = await Promise.all(["owa", "owb"].map((l) => fx.member(orgId, l)));
    await actAs(a.id, () => games.joinWaitlist(g.id));
    await actAs(b.id, () => games.joinWaitlist(g.id));
    // Free a spot without promoting, as if the organizer bumped capacity.
    await db.game.update({ where: { id: g.id }, data: { capacity: 3 } });
    await actAs(organizer.id, async () => manage.offerWaitlistedSpot((await fx.reg(g.id, b.id))!.id));
    assert.equal((await fx.reg(g.id, b.id))?.status, "OFFERED");
    assert.equal((await fx.reg(g.id, a.id))?.waitlistPos, 1);
  });

  test("does nothing when the game is full", async () => {
    const g = await fx.game(orgId, { capacity: 1 });
    const h = await fx.member(orgId, "fullh");
    await actAs(h.id, () => games.reserveSpot(g.id));
    const w = await fx.member(orgId, "fullw");
    await actAs(w.id, () => games.joinWaitlist(g.id));
    const res = await actAs(organizer.id, async () => manage.offerWaitlistedSpot((await fx.reg(g.id, w.id))!.id));
    assert.deepEqual(res, { ok: false, error: "The game is full. Free up a spot first." });
    assert.equal((await fx.reg(g.id, w.id))?.status, "WAITLISTED");
  });

  test("doesn't send a 'spot opened up' offer for a game that has already started", async () => {
    const g = await fx.game(orgId, { capacity: 2 });
    const h = await fx.member(orgId, "sh");
    await actAs(h.id, () => games.reserveSpot(g.id));
    const h2 = await fx.member(orgId, "sh2");
    await actAs(h2.id, () => games.reserveSpot(g.id));
    const w = await fx.member(orgId, "sw");
    await actAs(w.id, () => games.joinWaitlist(g.id));
    await db.game.update({ where: { id: g.id }, data: { capacity: 3, startsAt: new Date(Date.now() - 10 * 60_000) } });
    await actAs(organizer.id, async () => manage.offerWaitlistedSpot((await fx.reg(g.id, w.id))!.id));
    const rw = await fx.reg(g.id, w.id);
    const offers = await db.notification.count({ where: { userId: w.id, kind: "OFFER" } });
    assert.equal(rw?.status, "WAITLISTED", `got ${rw?.status} with offer expiring ${rw?.offerExpiresAt?.toISOString()} and ${offers} offer notification(s)`);
  });
});

describe("attendance", () => {
  test("records present / no-show and lets the organizer change it", async () => {
    const g = await fx.game(orgId);
    const p = await fx.member(orgId, "att");
    await actAs(p.id, () => games.reserveSpot(g.id));
    const r = await fx.reg(g.id, p.id);
    await actAs(organizer.id, () => manage.recordAttendance(r!.id, "NO_SHOW"));
    await actAs(organizer.id, () => manage.recordAttendance(r!.id, "PRESENT"));
    const recs = await db.attendanceRecord.findMany({ where: { registrationId: r!.id } });
    assert.equal(recs.length, 1);
    assert.equal(recs[0].status, "PRESENT");
    assert.equal(recs[0].recordedById, organizer.id);
  });

  test("ignored for waitlisted / cancelled players and bogus statuses", async () => {
    const g = await fx.game(orgId, { capacity: 1 });
    const h = await fx.member(orgId, "ah");
    await actAs(h.id, () => games.reserveSpot(g.id));
    const w = await fx.member(orgId, "aw");
    await actAs(w.id, () => games.joinWaitlist(g.id));
    const rw = await fx.reg(g.id, w.id);
    await actAs(organizer.id, () => manage.recordAttendance(rw!.id, "PRESENT"));
    const rh = await fx.reg(g.id, h.id);
    await actAs(organizer.id, () => manage.recordAttendance(rh!.id, "LATE" as never));
    assert.equal(await db.attendanceRecord.count({ where: { gameId: g.id } }), 0);
  });

  test("only the club's organizers can record it", async () => {
    const g = await fx.game(orgId);
    const p = await fx.member(orgId, "apl");
    await actAs(p.id, () => games.reserveSpot(g.id));
    const r = await fx.reg(g.id, p.id);
    assert.deepEqual(await actAs(p.id, () => manage.recordAttendance(r!.id, "PRESENT")), { ok: false, error: "Not authorized for this club." });
    assert.deepEqual(await actAs(otherOrganizer.id, () => manage.recordAttendance(r!.id, "PRESENT")), { ok: false, error: "Not authorized for this club." });
    assert.equal(await db.attendanceRecord.count({ where: { gameId: g.id } }), 0);
  });
});

describe("announcements", () => {
  test("notifies every member except the author", async () => {
    const o = await fx.user("ann-o", { organizerApproved: true });
    const club = await fx.club(o.id);
    const ms = await Promise.all(["m1", "m2", "m3"].map((l) => fx.member(club.id, l)));
    const res = await actAs(o.id, () => manage.postAnnouncement(undefined, form({ orgId: club.id, title: "Venue change", body: "Field 2 tonight" })));
    assert.equal(res, undefined);
    for (const m of ms) assert.equal(await db.notification.count({ where: { userId: m.id, kind: "ANNOUNCE" } }), 1);
    assert.equal(await db.notification.count({ where: { userId: o.id, kind: "ANNOUNCE" } }), 0);
  });

  test("players can't post", async () => {
    const p = await fx.member(orgId, "annp");
    const res = await actAs(p.id, () => manage.postAnnouncement(undefined, form({ orgId, title: "Hello all", body: "Free beer" })));
    assert.deepEqual(res, { error: "Not authorized for this club." });
    assert.equal(await db.announcement.count({ where: { orgId, title: "Hello all" } }), 0);
  });
});

describe("clubs and invites", () => {
  test("createClub needs organizer approval", async () => {
    const u = await fx.user("unapproved");
    const res = await actAs(u.id, () => clubs.createClub(undefined, form({ name: "Rogue FC", city: "Ottawa", sport: "Soccer" })));
    assert.deepEqual(res, { error: "Organizer approval is required before creating a club." });
  });

  test("createClub makes the creator an organizer, picks a unique handle and audits it", async () => {
    const u = await fx.user("founder", { organizerApproved: true });
    const name = `Founders ${fx.runId}`;
    const url1 = await expectRedirect(actAs(u.id, () => clubs.createClub(undefined, form({ name, city: "Ottawa", sport: "Soccer" }))));
    const url2 = await expectRedirect(actAs(u.id, () => clubs.createClub(undefined, form({ name, city: "Ottawa", sport: "Soccer" }))));
    assert.notEqual(url1, url2);
    const created = await db.organization.findMany({ where: { name } });
    assert.equal(created.length, 2);
    for (const c of created) {
      const m = await db.membership.findUnique({ where: { userId_orgId: { userId: u.id, orgId: c.id } } });
      assert.equal(m?.role, "ORGANIZER");
      assert.match(c.inviteCode, /^[A-Z0-9]{1,4}-[A-HJ-KM-NP-Z2-9]{8}$/);
      assert.equal(await db.auditLogEntry.count({ where: { action: "ORGANIZATION_CREATED", targetId: c.id } }), 1);
    }
    await db.organization.deleteMany({ where: { name } });
  });

  test("joinClub: code is case-insensitive, members can't join twice", async () => {
    const club = await db.organization.findUnique({ where: { id: orgId } });
    const p = await fx.user("joiner");
    const ok = await actAs(p.id, () => clubs.joinClub(undefined, form({ code: club!.inviteCode.toLowerCase() })));
    assert.equal(ok?.ok, true);
    const again = await actAs(p.id, () => clubs.joinClub(undefined, form({ code: club!.inviteCode })));
    assert.deepEqual(again, { error: "You're already in this club." });
    const bad = await actAs(p.id, () => clubs.joinClub(undefined, form({ code: "NOPE-NOPE" })));
    assert.deepEqual(bad, { error: "No club found for that code." });
  });

  test("joinClub throttles code guessing", async () => {
    const p = await fx.user("guesser");
    let blocked = false;
    for (let i = 0; i < 30 && !blocked; i++) {
      const res = await actAs(p.id, () => clubs.joinClub(undefined, form({ code: `GUESS-${i}AAAA` })));
      blocked = res?.error !== "No club found for that code.";
    }
    assert.ok(blocked, "guessing was never throttled");
  });

  test("rotating the invite code kills the old one; players can't rotate", async () => {
    const o = await fx.user("rot-o", { organizerApproved: true });
    const club = await fx.club(o.id);
    const old = club.inviteCode;
    const p = await fx.member(club.id, "rotp");
    await actAs(p.id, () => clubs.rotateInviteCode(form({ orgId: club.id })));
    assert.equal((await db.organization.findUnique({ where: { id: club.id } }))?.inviteCode, old, "player can't rotate");
    await actAs(o.id, () => clubs.rotateInviteCode(form({ orgId: club.id })));
    const fresh = (await db.organization.findUnique({ where: { id: club.id } }))!.inviteCode;
    assert.notEqual(fresh, old);
    const newbie = await fx.user("newbie");
    assert.deepEqual(await actAs(newbie.id, () => clubs.joinClub(undefined, form({ code: old }))), { error: "No club found for that code." });
  });
});

describe("Stripe Connect", () => {
  test("only organizers can start onboarding or refresh status", async () => {
    harness.stripeEnabled = true;
    const p = await fx.member(orgId, "conn");
    assert.deepEqual(await actAs(p.id, () => payments.connectStripe(orgId)), { error: "Not authorized." });
    assert.deepEqual(await actAs(otherOrganizer.id, () => payments.connectStripe(orgId)), { error: "Not authorized." });
    const ok = await actAs(organizer.id, () => payments.connectStripe(orgId));
    assert.equal(ok.url, "https://connect.stripe.test/onboard");
    assert.equal((await db.organization.findUnique({ where: { id: orgId } }))?.stripeAccountId, "acct_test_1");

    harness.accountChargesEnabled = true;
    await actAs(p.id, () => payments.refreshConnectStatus(orgId));
    assert.equal((await db.organization.findUnique({ where: { id: orgId } }))?.chargesEnabled, false, "player can't flip it");
    await actAs(organizer.id, () => payments.refreshConnectStatus(orgId));
    assert.equal((await db.organization.findUnique({ where: { id: orgId } }))?.chargesEnabled, true);
  });
});
