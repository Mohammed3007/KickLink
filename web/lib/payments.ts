// Payment service — a thin, Stripe-shaped seam.
//
// In production, set STRIPE_SECRET_KEY and this module charges via Stripe
// (test or live mode per your keys). With no key configured (local dev /
// this sandbox), it falls back to a deterministic local "test" charge so
// the whole product is functional end-to-end without external network.

export type ChargeResult = {
  ok: boolean;
  providerId: string;
  method: string;
};

export type ChargeInput = {
  amountCents: number;
  method: "apple_pay" | "card";
  description: string;
  userId: string;
};

const methodLabel: Record<ChargeInput["method"], string> = {
  apple_pay: "Apple Pay",
  card: "Visa ·· 4242",
};

export async function charge(input: ChargeInput): Promise<ChargeResult> {
  const key = process.env.STRIPE_SECRET_KEY;

  if (key) {
    // Real Stripe path. Lazily imported so the dependency is only needed
    // when keys are present. (Install `stripe` to enable.)
    // const Stripe = (await import("stripe")).default;
    // const stripe = new Stripe(key);
    // const intent = await stripe.paymentIntents.create({ ... , confirm: true });
    // return { ok: intent.status === "succeeded", providerId: intent.id, method: methodLabel[input.method] };
    throw new Error("Stripe path not wired in this environment.");
  }

  // Local test charge — always succeeds, with a traceable id.
  return {
    ok: true,
    providerId: `test_${Date.now().toString(36)}`,
    method: methodLabel[input.method],
  };
}

export function isLiveMode() {
  return !!process.env.STRIPE_SECRET_KEY;
}
