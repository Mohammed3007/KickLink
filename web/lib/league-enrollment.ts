import { db } from "@/lib/db";
import { hasPaidMembership } from "@/lib/membership-policy";

export async function enrollMemberInLeague(userId: string, leagueId: string) {
  const league = await db.league.findUnique({ where: { id: leagueId }, include: { org: true } });
  if (!league) return { error: "League not found." };
  const membership = await db.membership.findUnique({
    where: { userId_orgId: { userId, orgId: league.orgId } }, include: { subscription: true },
  });
  if (!league.org.membershipEnabled || !hasPaidMembership(membership?.subscription)) {
    return { error: "An active paid club membership is required to join a league." };
  }
  await db.leagueEnrollment.upsert({
    where: { leagueId_userId: { leagueId, userId } }, update: {}, create: { leagueId, userId },
  });
  return { ok: true, handle: league.org.handle };
}
