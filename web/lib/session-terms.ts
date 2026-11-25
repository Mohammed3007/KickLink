import type { Game, Prisma, PrismaClient } from "@/lib/generated/prisma/client";
import { hasPaidMembership, sessionPrice } from "@/lib/membership-policy";

export async function sessionTerms(client: PrismaClient | Prisma.TransactionClient, userId: string, game: Game) {
  const membership = await client.membership.findUnique({
    where: { userId_orgId: { userId, orgId: game.orgId } },
    include: { subscription: true },
  });
  const org = await client.organization.findUniqueOrThrow({ where: { id: game.orgId } });
  const paidMember = org.membershipEnabled && hasPaidMembership(membership?.subscription);
  let error: string | null = null;
  if (game.access === "CLUB" && !(membership?.clubAccess || membership?.role === "ORGANIZER" || paidMember)) error = "Join the club to register.";
  if ((game.access === "MEMBERS" || game.leagueId) && !paidMember) error = "An active paid club membership is required for this session.";
  if (!error && game.leagueId) {
    const enrolled = await client.leagueEnrollment.findUnique({
      where: { leagueId_userId: { leagueId: game.leagueId, userId } },
    });
    if (!enrolled) error = "Join this league from the club membership page first.";
  }
  return { paidMember, priceCents: sessionPrice(game, paidMember), error };
}
