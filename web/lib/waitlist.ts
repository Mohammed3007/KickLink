import { db } from "@/lib/db";

const OCCUPYING = ["CONFIRMED", "PROVISIONAL", "OFFERED"] as const;

type Tx = Parameters<Parameters<typeof db.$transaction>[0]>[0];

/**
 * When a spot frees up, offer it to the next person on the waitlist
 * (status → OFFERED with a 15-minute window) and notify them.
 * Call inside a transaction after the freeing change has been applied.
 */
export async function promoteWaitlist(tx: Tx, gameId: string) {
  const game = await tx.game.findUnique({
    where: { id: gameId },
    select: { capacity: true, title: true },
  });
  if (!game) return;

  const taken = await tx.registration.count({
    where: { gameId, status: { in: [...OCCUPYING] } },
  });
  if (taken >= game.capacity) return; // still full, nothing to offer

  const next = await tx.registration.findFirst({
    where: { gameId, status: "WAITLISTED" },
    orderBy: [{ waitlistPos: "asc" }, { createdAt: "asc" }],
  });
  if (!next) return;

  await tx.registration.update({
    where: { id: next.id },
    data: {
      status: "OFFERED",
      waitlistPos: null,
      offerExpiresAt: new Date(Date.now() + 15 * 60_000),
    },
  });
  await tx.notification.create({
    data: {
      userId: next.userId,
      kind: "OFFER",
      title: `A spot opened up — ${game.title}`,
      body: "You're next in line. Accept within the window to claim it.",
      href: `/games/${gameId}`,
    },
  });
}
