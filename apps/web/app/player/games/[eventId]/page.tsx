import { notFound } from 'next/navigation';
import { RegisterForFreeEventForm } from '../../../../components/registrations/RegisterForFreeEventForm';
import { requireCompletedProfile } from '../../../../lib/auth/guards';
import { createUserServerSupabaseClient } from '../../../../lib/supabase/server';

export default async function PlayerGameDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  await requireCompletedProfile('/player/games');
  const { eventId } = await params;
  const supabase = await createUserServerSupabaseClient();
  const { data: event } = await supabase
    .from('events')
    .select('id, title, start_at, arrive_at, duration_min, venue, capacity, payment_model, price_gross, currency, organization:organizations(name, city)')
    .eq('id', eventId)
    .single();

  if (!event) {
    notFound();
  }

  const venue = event.venue as { name?: string; address?: string } | null;

  return (
    <section className="card">
      <p className="eyebrow">{event.organization?.name}</p>
      <h2>{event.title}</h2>
      <div className="detail-grid">
        <p>
          <strong>Kickoff</strong>
          <span>{new Date(event.start_at).toLocaleString()}</span>
        </p>
        <p>
          <strong>Arrive by</strong>
          <span>{new Date(event.arrive_at).toLocaleString()}</span>
        </p>
        <p>
          <strong>Venue</strong>
          <span>
            {venue?.name ?? 'Venue'} · {venue?.address ?? 'Address pending'}
          </span>
        </p>
        <p>
          <strong>Fee</strong>
          <span>
            {event.payment_model === 'free' ? 'Free' : `${event.price_gross} ${event.currency}`}
          </span>
        </p>
      </div>
      {event.payment_model === 'free' ? (
        <RegisterForFreeEventForm eventId={event.id} />
      ) : (
        <p className="muted">Paid registration is intentionally deferred until Stripe Connect is added.</p>
      )}
    </section>
  );
}
