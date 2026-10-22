// Client-safe refund policy constants (no database imports).

/** Players get a full refund when they cancel at least this long before kickoff. */
export const REFUND_CUTOFF_HOURS = 24;

export const DEFAULT_REFUND_POLICY = `Full refund up to ${REFUND_CUTOFF_HOURS}h before kickoff. No refund after.`;

/** True when a player cancelling now is still owed a refund under the policy. */
export function isRefundable(startsAt: Date, now = new Date()) {
  return startsAt.getTime() - now.getTime() >= REFUND_CUTOFF_HOURS * 3_600_000;
}
