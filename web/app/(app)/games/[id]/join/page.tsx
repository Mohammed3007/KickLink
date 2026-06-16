import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getGame } from "@/lib/queries";
import { isStripeEnabled } from "@/lib/flags";
import { BackHeader } from "@/components/app/back-header";
import { Checkout } from "@/components/app/checkout";
import { PaymentSuccess } from "@/components/app/payment-success";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { id } = await params;
  const { success } = await searchParams;
  const user = await requireUser();
  const game = await getGame(id, user.id);
  if (!game) notFound();

  // Free games don't go through checkout.
  if (game.model === "FREE") redirect(`/games/${id}`);

  if (success) {
    return (
      <div className="mx-auto max-w-2xl pb-10">
        <PaymentSuccess
          gameId={game.id}
          title={game.title}
          registrationStatus={game.myReg?.status ?? null}
          paymentStatus={game.myReg?.payStatus ?? null}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <BackHeader title="Checkout" />
      <Checkout
        stripeEnabled={isStripeEnabled()}
        orgChargesEnabled={game.org.chargesEnabled}
        game={{
          id: game.id,
          title: game.title,
          org: game.org.name,
          startsAt: game.startsAt.toISOString(),
          priceCents: game.priceCents,
        }}
      />
    </div>
  );
}
