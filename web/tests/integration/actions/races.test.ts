// Concurrency probes for organizer roster actions that don't take the game lock.
import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { actAs, fixtures, harness, installMocks } from "../helpers/harness";

let db: Awaited<ReturnType<typeof installMocks>>;
let fx: ReturnType<typeof fixtures>;
let manage: typeof import("../../../lib/actions/manage");
let games: typeof import("../../../lib/actions/games");
let waitlist: typeof import("../../../lib/waitlist");

before(async () => {
  db = await installMocks();
  fx = fixtures(db);
  manage = await import("../../../lib/actions/manage");
  games = await import("../../../lib/actions/games");
  waitlist = await import("../../../lib/waitlist");
});
after(async () => {
  await fx.cleanup();
  await db.$disconnect();
});

test("marking a lapsed hold paid while the sweep releases it never overfills the game", async () => {
  harness.reset();
  const o = await fx.user("race-o", { organizerApproved: true });
  const club = await fx.club(o.id);
  let overfilled = 0;
  const trials = 25;
  for (let i = 0; i < trials; i++) {
    const g = await fx.game(club.id, { model: "PAY", capacity: 1 });
    const [a, w] = await Promise.all([fx.member(club.id, `ra${i}`), fx.member(club.id, `rw${i}`)]);
    const hold = await db.registration.create({
      data: { gameId: g.id, userId: a.id, status: "PROVISIONAL", payStatus: "UNPAID", offerExpiresAt: new Date(Date.now() - 1000) },
    });
    await db.registration.create({ data: { gameId: g.id, userId: w.id, status: "WAITLISTED", payStatus: "UNPAID", waitlistPos: 1 } });
    await Promise.allSettled([actAs(o.id, () => manage.markPaid(hold.id)), waitlist.sweepGameHolds(g.id)]);
    if ((await fx.occupied(g.id)) > 1) overfilled += 1;
  }
  assert.equal(overfilled, 0, `${overfilled}/${trials} trials ended with 2 players in a 1-spot game`);
});

test("cancel racing an organizer's mark-paid leaves a consistent registration", async () => {
  const o = await fx.user("race2-o", { organizerApproved: true });
  const club = await fx.club(o.id);
  let bad = 0;
  const trials = 25;
  for (let i = 0; i < trials; i++) {
    const g = await fx.game(club.id, { model: "LATER", capacity: 4 });
    const p = await fx.member(club.id, `rc${i}`);
    await actAs(p.id, () => games.reserveSpot(g.id));
    const r = await fx.reg(g.id, p.id);
    await Promise.allSettled([actAs(o.id, () => manage.markPaid(r!.id)), actAs(p.id, () => games.cancelRegistration(g.id))]);
    const after = await fx.reg(g.id, p.id);
    const kept = await db.payment.count({ where: { gameId: g.id, userId: p.id, status: "SUCCEEDED" } });
    // Either: cancelled with no payment recorded, or confirmed+paid with one payment.
    const ok = (after?.status === "CANCELLED" && kept === 0 && after.payStatus !== "PAID") || (after?.status === "CONFIRMED" && kept === 1);
    if (!ok) bad += 1;
  }
  assert.equal(bad, 0, `${bad}/${trials} trials left a cancelled player marked paid (or a paid player with no payment)`);
});
