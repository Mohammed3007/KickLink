import { Text, TextInput, View } from 'react-native';
import { Button, Card, Screen } from '../components/Primitives';
import { colors } from '../theme/tokens';

export function SplashScreen() {
  return (
    <Screen title="KickLink" subtitle="Private pickup soccer, organized without the group-chat mess.">
      <Card>
        <Text style={{ color: colors.ink, fontSize: 30, fontWeight: '900' }}>KL</Text>
        <Text style={{ color: colors.ink2, marginTop: 8 }}>
          Games, registrations, waitlists, offers, and organizer announcements in one iOS-first app.
        </Text>
        <Button label="Sign in" href="/auth/sign-in" />
        <Button label="Create account" href="/auth/sign-up" variant="secondary" />
      </Card>
    </Screen>
  );
}

function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  return (
    <Screen
      title={mode === 'sign-in' ? 'Sign in' : 'Create account'}
      subtitle="Phase 1 uses mock authentication screens only."
    >
      <Card>
        {mode === 'sign-up' ? <Field label="Display name" placeholder="Daniel Osei" /> : null}
        <Field label="Email" placeholder="daniel@example.ca" />
        <Field label="Password" placeholder="At least 8 characters" secure />
        {mode === 'sign-up' ? <Field label="Confirm password" placeholder="Repeat password" secure /> : null}
        <Button label={mode === 'sign-in' ? 'Continue' : 'Create mock account'} href="/home" />
        <Button
          label={mode === 'sign-in' ? 'Use mock Apple sign in' : 'Review terms and continue'}
          href="/home"
          variant="secondary"
        />
      </Card>
    </Screen>
  );
}

function Field({ label, placeholder, secure }: { label: string; placeholder: string; secure?: boolean }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: colors.ink2, fontSize: 13, fontWeight: '700', marginBottom: 6 }}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        secureTextEntry={secure}
        style={{
          backgroundColor: colors.fill,
          borderRadius: 12,
          color: colors.ink,
          minHeight: 48,
          paddingHorizontal: 14,
        }}
      />
    </View>
  );
}

export function SignInScreen() {
  return <AuthForm mode="sign-in" />;
}

export function SignUpScreen() {
  return <AuthForm mode="sign-up" />;
}
