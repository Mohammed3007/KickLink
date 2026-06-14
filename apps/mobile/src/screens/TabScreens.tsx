import { ScrollView, Text, View } from 'react-native';
import { mockStore, paymentStatusMeta, registrationStatusMeta } from '@kicklink/shared';
import { Button, Card, Money, Row, Screen, StatusBadge } from '../components/Primitives';
import { repo } from '../data/mockRepository';
import { colors } from '../theme/tokens';

export function HomeScreen() {
  const nextEvent = repo.events[0];
  const due = repo.registrations.find((registration) => registration.payStatus === 'payment_due');
  return (
    <Screen title={`Hi, ${repo.me.displayName.split(' ')[0]}`} subtitle="Your KickLink soccer week.">
      <ScrollView showsVerticalScrollIndicator={false}>
        {due ? (
          <Card>
            <Text style={styles.kicker}>Needs action</Text>
            <Text style={styles.cardTitle}>Payment due for Saturday Morning 11s</Text>
            <Text style={styles.body}>Pay $15.00 to keep your provisional spot.</Text>
            <Button label="Review registration" href="/games/evt_saturday_11s/registration" />
          </Card>
        ) : null}
        <Card>
          <Text style={styles.kicker}>Next game</Text>
          <Text style={styles.cardTitle}>{nextEvent?.title}</Text>
          <Text style={styles.body}>{nextEvent?.venue.name} - {formatDate(nextEvent?.startAt)}</Text>
          <Button label="Open game" href={`/games/${nextEvent?.id}`} variant="secondary" />
        </Card>
        <Card>
          <Row title="A spot opened up" subtitle="Tuesday Indoor 5s - accept before it expires." href="/games/evt_tuesday_5s/join" icon="football-outline" />
          <Row title="Westside announcement" subtitle="Bring light and dark this Sunday." href="/notifications" icon="megaphone-outline" />
        </Card>
      </ScrollView>
    </Screen>
  );
}

export function GamesScreen() {
  return (
    <Screen title="Games" subtitle="Open, full, free, and pay-later examples from the reference dataset.">
      <ScrollView showsVerticalScrollIndicator={false}>
        {repo.events.map((event) => (
          <Card key={event.id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{event.title}</Text>
                <Text style={styles.body}>{event.venue.name} - {formatDate(event.startAt)}</Text>
                <Text style={styles.body}>{event.filledCount}/{event.capacity} filled</Text>
              </View>
              <Money amount={event.price.gross} />
            </View>
            <Button label="View details" href={`/games/${event.id}`} variant="secondary" />
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

export function OrganizationsScreen() {
  return (
    <Screen title="Organizations" subtitle="Private clubs joined by invite link or organization ID.">
      <ScrollView showsVerticalScrollIndicator={false}>
        {repo.organizations.map((org) => (
          <Card key={org.id}>
            <Row title={org.name} subtitle={`${org.handle} - ${org.membersCount} members`} href={`/orgs/${org.id}`} icon="people-outline" />
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

export function NotificationsScreen() {
  return (
    <Screen title="Notifications" subtitle="Critical alerts remain visible in-app during Phase 1.">
      <ScrollView showsVerticalScrollIndicator={false}>
        {repo.notifications.map((notification) => (
          <Card key={notification.id}>
            <Text style={styles.kicker}>{notification.kind}</Text>
            <Text style={styles.cardTitle}>{notification.title}</Text>
            <Text style={styles.body}>{notification.body}</Text>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

export function ProfileScreen() {
  return (
    <Screen title="Profile" subtitle="Mock profile and private reliability indicator.">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={styles.cardTitle}>{repo.me.displayName}</Text>
          <Text style={styles.body}>{repo.me.position} - {repo.me.skillLevel}</Text>
          <Text style={styles.body}>{repo.me.city}</Text>
        </Card>
        <Card>
          <Row title="Payment history" subtitle="Receipts are mocked in Phase 1." icon="receipt-outline" />
          <Row title="Notification preferences" subtitle="Push production setup is later." icon="notifications-outline" />
          <Row title="Privacy settings" subtitle="Visibility defaults for private organizations." icon="lock-closed-outline" />
        </Card>
      </ScrollView>
    </Screen>
  );
}

export function GameDetailScreen({ gameId }: { gameId: string }) {
  const event = repo.findEvent(gameId) ?? repo.events[0];
  const org = event ? repo.findOrganization(event.orgId) : undefined;
  if (!event) {
    return <Screen title="Game not found" subtitle="This mock game does not exist." />;
  }

  return (
    <Screen title={event.title} subtitle={org?.name}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={styles.cardTitle}>{event.venue.name}</Text>
          <Text style={styles.body}>{event.venue.address}</Text>
          <Text style={styles.body}>{formatDate(event.startAt)} - arrive before kickoff</Text>
        </Card>
        <Card>
          <Text style={styles.kicker}>Capacity</Text>
          <Text style={styles.cardTitle}>{repo.spotsLeft(event)} spots left</Text>
          <Text style={styles.body}>{event.filledCount}/{event.capacity} filled. Client capacity is advisory only.</Text>
        </Card>
        <Card>
          <Text style={styles.kicker}>Rules and policy</Text>
          <Text style={styles.body}>{event.rules}</Text>
          <Text style={styles.body}>Refund deadline: {event.refundPolicy.deadlineHrs}h before kickoff.</Text>
        </Card>
        <Button label={event.status === 'full' ? 'Review waitlist offer' : 'Join game'} href={`/games/${event.id}/join`} />
      </ScrollView>
    </Screen>
  );
}

export function JoinReviewScreen({ gameId }: { gameId: string }) {
  const event = repo.findEvent(gameId) ?? repo.events[0];
  if (!event) {
    return <Screen title="Join review" subtitle="Game not found." />;
  }
  const paymentCopy = event.model === 'free' ? 'No payment required' : event.model === 'pay_later' ? 'Payment due later' : 'Mock checkout required';
  return (
    <Screen title="Join review" subtitle="Review policy before any payment-like action.">
      <Card>
        <Text style={styles.cardTitle}>{event.title}</Text>
        <Text style={styles.body}>{paymentCopy}</Text>
        <Text style={styles.body}>Price: ${event.price.gross.toFixed(2)} CAD</Text>
        <Text style={styles.body}>Guests are stored as guest records, not fake users.</Text>
      </Card>
      <Button label={event.model === 'free' ? 'Confirm free registration' : 'Continue to mock checkout'} href={`/games/${event.id}/checkout`} />
    </Screen>
  );
}

export function CheckoutScreen({ gameId }: { gameId: string }) {
  const event = repo.findEvent(gameId) ?? repo.events[0];
  return (
    <Screen title="Mock checkout" subtitle="No card data, Stripe secret keys, or live payment integration.">
      <Card>
        <Text style={styles.cardTitle}>{event?.title}</Text>
        <Text style={styles.body}>Payment provider: MockPaymentProvider</Text>
        <Text style={styles.body}>Supported states: not required, unpaid, payment due, processing, paid, failed, partially refunded, refunded, disputed.</Text>
        <Button label="Simulate server-confirmed success" href={`/games/${event?.id}/success`} />
      </Card>
    </Screen>
  );
}

export function SuccessScreen({ gameId }: { gameId: string }) {
  const event = repo.findEvent(gameId) ?? repo.events[0];
  return (
    <Screen title="You're in" subtitle="This confirmation represents the future server-confirmed result.">
      <Card>
        <Text style={styles.cardTitle}>{event?.title}</Text>
        <StatusBadge status={event?.model === 'free' ? 'not_required' : 'paid'} kind="payment" />
        <Text style={styles.body}>Receipt and registration details are mocked for Phase 1.</Text>
        <Button label="View registration" href={`/games/${event?.id}/registration`} />
      </Card>
    </Screen>
  );
}

export function RegistrationDetailsScreen({ gameId }: { gameId: string }) {
  const event = repo.findEvent(gameId) ?? repo.events[0];
  const registration =
    repo.registrations.find((item) => item.eventId === event?.id) ?? repo.registrations[0];
  if (!event || !registration) {
    return <Screen title="Registration" subtitle="Registration not found." />;
  }
  return (
    <Screen title="Registration" subtitle="Registration and payment badges stay independent.">
      <Card>
        <Text style={styles.cardTitle}>{event.title}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          <StatusBadge status={registration.regStatus} kind="registration" />
          <StatusBadge status={registration.payStatus} kind="payment" />
        </View>
        <Text style={styles.body}>Registration: {registrationStatusMeta[registration.regStatus].label}</Text>
        <Text style={styles.body}>Payment: {paymentStatusMeta[registration.payStatus].label}</Text>
      </Card>
      <Button label="Back to games" href="/games" variant="secondary" />
    </Screen>
  );
}

export function OrganizationDetailScreen({ orgId }: { orgId: string }) {
  const org = repo.findOrganization(orgId) ?? repo.organizations[0];
  const games = mockStore.events.filter((event) => event.orgId === org?.id);
  if (!org) {
    return <Screen title="Organization" subtitle="Organization not found." />;
  }
  return (
    <Screen title={org.name} subtitle={`${org.handle} - ${org.city}`}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={styles.cardTitle}>{org.blurb}</Text>
          <Text style={styles.body}>{org.membersCount} members. Private by default.</Text>
        </Card>
        {games.map((event) => (
          <Card key={event.id}>
            <Row title={event.title} subtitle={formatDate(event.startAt)} href={`/games/${event.id}`} icon="football-outline" />
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = {
  kicker: { color: colors.violet, fontSize: 12, fontWeight: '800' as const, textTransform: 'uppercase' as const },
  cardTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' as const, marginTop: 6 },
  body: { color: colors.ink2, fontSize: 14, lineHeight: 20, marginTop: 6 },
};

function formatDate(value?: string): string {
  if (!value) {
    return 'Scheduled';
  }
  return new Intl.DateTimeFormat('en-CA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}
