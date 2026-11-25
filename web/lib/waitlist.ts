import { hasPaidMembership, sessionPrice } from "@/lib/membership-policy";
import type { Game } from "@/lib/generated/prisma/client";
import { after } from "next/server";
import { db } from "@/lib/db";
import { sendSpotOfferEmail } from "@/lib/email";
import { formatGameDate, formatTime, timeZoneLabel } from "@/lib/utils";

const OCCUPYING = ["CONFIRMED", "PROVISIONAL", "OFFERED"] as const;

/**
 * When an offered spot lapses: 2 hours to claim it, shrinking as kickoff
 * nears so the spot can still move down the line, and never past kickoff.
 */
export function offerExpiry(startsAt: Date, now = new Date()) {
  const untilKickoff = startsAt.getTime() - now.getTime();
  const hours = untilKickoff / 3_600_000;
  const windowMins = hours > 24 ? 120 : hours > 6 ? 60 : 30;
  return new Date(now.getTime() + Math.min(windowMins * 60_000, Math.max(untilKickoff, 0)));
}

/**
 * How long a spot is held while the player is in Stripe Checkout. Checkout
 * sessions expire after CHECKOUT_SESSION_MINUTES, so the hold outlives them
 * and a player can never pay for a spot that was already released.
 */
export const CHECKOUT_SESSION_MINUTES = 31;
export const CHECKOUT_HOLD_MINUTES = CHECKOUT_SESSION_MINUTES + 5;

type Tx = Parameters<Parameters<typeof db.$transaction>[0]>[0];

/** Live membership tiers; FIFO is preserved within each tier. Never displace an existing offer. */
export async function orderedWaitlist(tx: Tx, game: Game) {
  const org = await tx.organization.findUniqueOrThrow({ where: { id: game.orgId } });
  const entries = await tx.registration.findMany({
    where: { gameId: game.id, status: "WAITLISTED" },
    include: { user: { include: {
      memberships: { where: { orgId: game.orgId }, include: { subscription: true } },
      leagueEnrollments: { where: game.leagueId ? { leagueId: game.leagueId } : { id: "" } },
    } } },
    orderBy: [{ waitlistPos: "asc" }, { createdAt: "asc" }, { id: "asc" }],
  });
  return entries.map((entry) => {
    const member = entry.user.memberships[0];
    const paidMember = org.membershipEnabled && hasPaidMembership(member?.subscription);
    const eligible = (game.access === "OPEN" || !!member?.clubAccess || paidMember) &&
      (game.access !== "MEMBERS" || paidMember) &&
      (!game.leagueId || (paidMember && entry.user.leagueEnrollments.length > 0));
    return { ...entry, paidMember, eligible, priority: eligible && org.membershipEnabled && org.memberWaitlistPriority && paidMember };
  }).sort((a, b) => Number(b.eligible) - Number(a.eligible) || Number(b.priority) - Number(a.priority) ||
    (a.waitlistedAt ?? a.createdAt).getTime() - (b.waitlistedAt ?? b.createdAt).getTime() ||
    (a.waitlistPos ?? Number.MAX_SAFE_INTEGER) - (b.waitlistPos ?? Number.MAX_SAFE_INTEGER));
}

/**
 * Offer freed spots to the next people on the waitlist (status → OFFERED
 * with a time-limited window) and notify them. Fills every open spot.
 * Call inside a transaction holding the game lock, after the freeing change.
 */
export async function promoteWaitlist(tx: Tx, gameId: string) {
  const game = await tx.game.findUnique({
    where: { id: gameId },

  });
  if (!game || game.startsAt <= new Date()) return;

  const taken = await tx.registration.count({
    where: { gameId, status: { in: [...OCCUPYING] } },
  });
  const open = game.capacity - taken;
  if (open <= 0) return; // still full, nothing to offer

  const next = (await orderedWaitlist(tx, game)).filter((entry) => entry.eligible).slice(0, open);

  for (const entry of next) {
    await tx.registration.update({
      where: { id: entry.id },
      data: {
        status: "OFFERED",
        payStatus: sessionPrice(game, entry.paidMember) === 0 ? "FREE" : "UNPAID",
        priceCents: null,
        waitlistPos: null,
        offerExpiresAt: offerExpiry(game.startsAt),
        offerEmailedAt: null,
      },
    });
    await tx.notification.create({
      data: {
        userId: entry.userId,
        kind: "OFFER",
        title: `A spot opened up — ${game.title}`,
        body: "You're next in line. Accept within the window to claim it.",
        href: `/games/${gameId}`,
      },
    });
  }
  if (next.length > 0) {
    // Everyone still waiting moves up the line.
    await compactWaitlist(tx, gameId);
    queueOfferEmails(gameId);
  }
}

/**
 * Email the game's open offers once the current request finishes. The emails
 * are read from the database, so an offer rolled back with its transaction
 * is never sent. The scheduled sweep picks up any that didn't go out.
 */
export function queueOfferEmails(gameId: string) {
  try {
    after(() => sendOfferEmails(gameId));
  } catch {
    // Outside a request (scripts, tests): the sweep sends them instead.
  }
}

/** Send the email for each open offer that hasn't had one yet. */
export async function sendOfferEmails(gameId?: string) {
  const pending = await db.registration.findMany({
    where: {
      ...(gameId ? { gameId } : {}),
      status: "OFFERED",
      offerEmailedAt: null,
      offerExpiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      offerExpiresAt: true,
      user: { select: { email: true } },
      game: { select: { id: true, title: true, startsAt: true } },
    },
  });

  let sent = 0;
  for (const offer of pending) {
    // Claim the offer first so overlapping runs don't send it twice.
    const claimed = await db.registration.updateMany({
      where: { id: offer.id, status: "OFFERED", offerEmailedAt: null },
      data: { offerEmailedAt: new Date() },
    });
    if (claimed.count === 0) continue;
    try {
      await sendSpotOfferEmail({
        to: offer.user.email,
        gameId: offer.game.id,
        gameTitle: offer.game.title,
        gameWhen: `${formatGameDate(offer.game.startsAt)}, ${formatTime(offer.game.startsAt)}`,
        deadline: `${formatTime(offer.offerExpiresAt!)} ${timeZoneLabel(offer.offerExpiresAt!)}`,
      });
      sent += 1;
    } catch (error) {
      console.error(JSON.stringify({ level: "error", msg: "offer_email_failed", registrationId: offer.id, error: String(error) }));
      await db.registration.update({ where: { id: offer.id }, data: { offerEmailedAt: null } });
    }
  }
  return sent;
}

/** Renumber waitlist positions 1..n after someone leaves it. */
export async function compactWaitlist(tx: Tx, gameId: string) {
  const game = await tx.game.findUnique({ where: { id: gameId } });
  if (!game) return;
  const waitlist = await orderedWaitlist(tx, game);
  for (const [index, entry] of waitlist.entries()) {
    if (entry.waitlistPos === index + 1) continue;
    await tx.registration.update({
      where: { id: entry.id },
      data: { waitlistPos: index + 1 },
    });
  }
}

/**
 * Release spots whose offer window or checkout hold has lapsed, then offer
 * them on. Call inside a transaction holding the game lock.
 * Pay-later reservations have no expiry and are never released here.
 */
export async function expireStaleHolds(tx: Tx, gameId: string) {
  const now = new Date();
  const stale = await tx.registration.findMany({
    where: {
      gameId,
      offerExpiresAt: { lte: now },
      OR: [{ status: "OFFERED" }, { status: "PROVISIONAL", payStatus: "UNPAID" }],
    },
    select: { id: true, userId: true, status: true },
  });
  if (stale.length === 0) {
    await promoteWaitlist(tx, gameId);
    return 0;
  }

  await tx.registration.updateMany({
    where: { id: { in: stale.map((r) => r.id) } },
    data: { status: "CANCELLED", waitlistPos: null, offerExpiresAt: null },
  });

  const game = await tx.game.findUnique({ where: { id: gameId }, select: { title: true } });
  await tx.notification.createMany({
    data: stale.map((r) => ({
      userId: r.userId,
      kind: "WAITLIST" as const,
      title: `Spot released — ${game?.title ?? "Game"}`,
      body:
        r.status === "OFFERED"
          ? "Your offer window closed, so the spot went to the next player."
          : "Checkout wasn't completed in time, so your held spot was released.",
      href: `/games/${gameId}`,
    })),
  });

  await promoteWaitlist(tx, gameId);
  return stale.length;
}

/** Sweep one game's lapsed holds in its own locked transaction. */
export async function sweepGameHolds(gameId: string) {
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "Game" WHERE "id" = ${gameId} FOR UPDATE`;
    const expired = await expireStaleHolds(tx, gameId);
    await compactWaitlist(tx, gameId);
    return expired;
  });
}

/** True if a game has lapsed holds waiting to be released. */
export async function hasStaleHolds(gameId: string) {
  const stale = await db.registration.findFirst({
    where: {
      gameId,
      offerExpiresAt: { lte: new Date() },
      OR: [{ status: "OFFERED" }, { status: "PROVISIONAL", payStatus: "UNPAID" }],
    },
    select: { id: true },
  });
  return Boolean(stale);
}

/** Release lapsed holds across all games (scheduled job). */
export async function sweepAllHolds() {
  const games = await db.registration.findMany({
    where: {
      offerExpiresAt: { lte: new Date() },
      OR: [{ status: "OFFERED" }, { status: "PROVISIONAL", payStatus: "UNPAID" }],
    },
    select: { gameId: true },
    distinct: ["gameId"],
  });
  let released = 0;
  for (const { gameId } of games) released += await sweepGameHolds(gameId);
  return { games: games.length, released };
}
