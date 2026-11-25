export function hasPaidMembership(subscription: { paidThrough: Date | null } | null | undefined, now = new Date()) {
  return !!subscription?.paidThrough && subscription.paidThrough > now;
}

export function sessionPrice(
  game: { model: string; priceCents: number; memberPriceCents?: number | null },
  paidMember: boolean
) {
  if (game.model === "FREE") return 0;
  return paidMember && game.memberPriceCents != null ? game.memberPriceCents : game.priceCents;
}
