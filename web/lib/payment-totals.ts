/** Collected money comes from actual successful payments, not the regular ticket price. */
export function collectedPayments(payments: { status: string; amountCents: number; refundDue: boolean }[]) {
  return payments.filter((payment) => payment.status === "SUCCEEDED" && !payment.refundDue)
    .reduce((sum, payment) => sum + payment.amountCents, 0);
}

export function pendingSessionPayments(registrations: { status: string; payStatus: string; priceCents: number | null }[], regularPrice: number) {
  return registrations.filter((entry) => entry.payStatus === "UNPAID" && ["PROVISIONAL", "CONFIRMED"].includes(entry.status))
    .reduce((sum, entry) => sum + (entry.priceCents ?? regularPrice), 0);
}
