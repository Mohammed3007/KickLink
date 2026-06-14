import { requireCompletedProfile } from '../../../../lib/auth/guards';

export default async function NotificationSettingsPage() {
  await requireCompletedProfile('/player/settings/notifications');
  return (
    <section className="card">
      <h2>Notification preferences</h2>
      <p className="muted">Email preferences are stored with the profile; production push is deferred.</p>
    </section>
  );
}
