import { Ionicons } from '@expo/vector-icons';
import type { PaymentStatus, RegistrationStatus } from '@kicklink/shared';
import { paymentStatusMeta, registrationStatusMeta, statusDisplayLabel } from '@kicklink/shared';
import { Link } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors, radii, spacing, typeScale } from '../theme/tokens';

export function Screen({
  children,
  title,
  subtitle,
}: PropsWithChildren<{ title: string; subtitle?: string | undefined }>) {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Row({
  title,
  subtitle,
  detail,
  href,
  icon,
}: {
  title: string;
  subtitle?: string;
  detail?: string;
  href?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const body = (
    <View style={styles.row}>
      {icon ? (
        <View style={styles.iconBubble}>
          <Ionicons name={icon} size={18} color={colors.violet} />
        </View>
      ) : null}
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      {href ? <Ionicons name="chevron-forward" size={18} color={colors.ink3} /> : null}
    </View>
  );

  if (!href) {
    return body;
  }

  return (
    <Link href={href} asChild>
      <Pressable>{body}</Pressable>
    </Link>
  );
}

export function Button({
  label,
  href,
  onPress,
  variant = 'primary',
}: {
  label: string;
  href?: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const buttonStyle = [styles.button, variant === 'secondary' && styles.buttonSecondary, variant === 'danger' && styles.buttonDanger];
  const textStyle = [styles.buttonText, variant === 'secondary' && styles.buttonSecondaryText];
  const body = <Text style={textStyle}>{label}</Text>;

  if (href) {
    return (
      <Link href={href} asChild>
        <Pressable style={buttonStyle}>{body}</Pressable>
      </Link>
    );
  }

  return (
    <Pressable style={buttonStyle} onPress={onPress}>
      {body}
    </Pressable>
  );
}

export function StatusBadge({
  status,
  kind,
}: {
  status: RegistrationStatus | PaymentStatus;
  kind: 'registration' | 'payment';
}) {
  const meta = kind === 'registration' ? registrationStatusMeta[status as RegistrationStatus] : paymentStatusMeta[status as PaymentStatus];
  const tone = statusTone(status);
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
      <View style={[styles.dot, { backgroundColor: tone.fg }]} />
      <Text style={[styles.badgeText, { color: tone.fg }]}>{meta?.label ?? statusDisplayLabel(status)}</Text>
    </View>
  );
}

export function Money({ amount }: { amount: number }) {
  return <Text style={styles.money}>${amount.toFixed(2)}</Text>;
}

export function statusTone(status: string): { fg: string; bg: string } {
  if (['confirmed', 'paid', 'attended', 'not_required'].includes(status)) {
    return { fg: colors.green, bg: colors.greenBg };
  }
  if (['waitlisted', 'full'].includes(status)) {
    return { fg: colors.blue, bg: colors.blueBg };
  }
  if (['spot_offered', 'transfer_pending'].includes(status)) {
    return { fg: colors.orange, bg: colors.orangeBg };
  }
  if (['cancelled', 'failed', 'disputed', 'no_show'].includes(status)) {
    return { fg: colors.red, bg: colors.redBg };
  }
  if (['provisional', 'payment_due', 'unpaid'].includes(status)) {
    return { fg: colors.amber, bg: colors.amberBg };
  }
  return { fg: colors.gray, bg: colors.grayBg };
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.screen,
    paddingTop: 18,
  },
  header: {
    paddingBottom: spacing.lg,
  },
  title: {
    color: colors.ink,
    fontSize: typeScale.title,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.ink2,
    fontSize: typeScale.body,
    marginTop: 4,
    lineHeight: 21,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 56,
  },
  iconBubble: {
    alignItems: 'center',
    backgroundColor: colors.violetTint,
    borderRadius: radii.control,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    color: colors.ink,
    fontSize: typeScale.body,
    fontWeight: '700',
  },
  rowSubtitle: {
    color: colors.ink2,
    fontSize: typeScale.meta,
    marginTop: 3,
  },
  detail: {
    color: colors.ink3,
    fontSize: typeScale.meta,
    fontWeight: '700',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.violet,
    borderRadius: radii.cta,
    minHeight: 52,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  buttonDanger: {
    backgroundColor: colors.red,
  },
  buttonSecondary: {
    backgroundColor: colors.violetTint,
  },
  buttonText: {
    color: colors.card,
    fontSize: typeScale.body,
    fontWeight: '800',
  },
  buttonSecondaryText: {
    color: colors.violet,
  },
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: typeScale.caption,
    fontWeight: '800',
  },
  dot: {
    borderRadius: 5,
    height: 7,
    width: 7,
  },
  money: {
    color: colors.ink,
    fontSize: typeScale.cardTitle,
    fontWeight: '800',
  },
});
