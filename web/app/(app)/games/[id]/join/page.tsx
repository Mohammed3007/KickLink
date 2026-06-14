import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getGame } from "@/lib/queries";
import { BackHeader } from "@/components/app/back-header";
import { Checkout } from "@/components/app/checkout";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const game = await getGame(id, user.id);
  if (!game) notFound();

  // Free games don't go through checkout.
  if (game.model === "FREE") redirect(`/games/${id}`);

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <BackHeader title="Checkout" />
      <Checkout
        game={{
          id: game.id,
          title: game.title,
          org: game.org.name,
          venue: game.venue,
          startsAt: game.startsAt.toISOString(),
          priceCents: game.priceCents,
        }}
      />
    </div>
  );
}
