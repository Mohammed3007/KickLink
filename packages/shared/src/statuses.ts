import { z } from 'zod';

export const eventStatuses = [
  'draft',
  'published',
  'almost_full',
  'full',
  'registration_closed',
  'cancelled',
  'completed',
] as const;
export const eventStatusSchema = z.enum(eventStatuses);
export type EventStatus = z.infer<typeof eventStatusSchema>;

export const registrationStatuses = [
  'pending',
  'provisional',
  'confirmed',
  'waitlisted',
  'spot_offered',
  'transfer_pending',
  'cancelled',
  'attended',
  'no_show',
] as const;
export const registrationStatusSchema = z.enum(registrationStatuses);
export type RegistrationStatus = z.infer<typeof registrationStatusSchema>;

export const paymentStatuses = [
  'not_required',
  'unpaid',
  'payment_due',
  'processing',
  'paid',
  'failed',
  'partially_refunded',
  'refunded',
  'disputed',
] as const;
export const paymentStatusSchema = z.enum(paymentStatuses);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const refundStatuses = [
  'not_requested',
  'requested',
  'under_review',
  'approved',
  'rejected',
  'processing',
  'completed',
  'failed',
] as const;
export const refundStatusSchema = z.enum(refundStatuses);
export type RefundStatus = z.infer<typeof refundStatusSchema>;

export const transferStatuses = [
  'transfer_pending',
  'approval_pending',
  'replacement_pending',
  'complete',
  'failed',
  'expired',
  'cancelled',
] as const;
export const transferStatusSchema = z.enum(transferStatuses);
export type TransferStatus = z.infer<typeof transferStatusSchema>;

export const waitlistOfferStatuses = [
  'waitlisted',
  'spot_offered',
  'offer_accepted',
  'offer_declined',
  'offer_expired',
  'removed',
] as const;
export const waitlistOfferStatusSchema = z.enum(waitlistOfferStatuses);
export type WaitlistOfferStatus = z.infer<typeof waitlistOfferStatusSchema>;

export const membershipStatuses = ['pending', 'active', 'removed', 'suspended'] as const;
export const membershipStatusSchema = z.enum(membershipStatuses);
export type MembershipStatus = z.infer<typeof membershipStatusSchema>;

export const organizerApplicationPlayerStatuses = [
  'not_started',
  'draft',
  'submitted',
  'under_review',
  'more_info_requested',
  'approved',
  'rejected',
  'suspended',
] as const;
export const organizerApplicationPlayerStatusSchema = z.enum(organizerApplicationPlayerStatuses);
export type OrganizerApplicationPlayerStatus = z.infer<
  typeof organizerApplicationPlayerStatusSchema
>;

export const organizerApplicationAdminStatuses = [
  'new',
  'under_review',
  'verification_pending',
  'more_info_requested',
  'approved',
  'rejected',
  'suspended',
] as const;
export const organizerApplicationAdminStatusSchema = z.enum(organizerApplicationAdminStatuses);
export type OrganizerApplicationAdminStatus = z.infer<typeof organizerApplicationAdminStatusSchema>;

export const organizerPermissions = [
  'manage_events',
  'manage_members',
  'manage_registrations',
  'manage_waitlist',
  'manage_attendance',
  'send_announcements',
  'view_finances',
  'manage_payments',
  'issue_refunds',
  'manage_staff',
  'manage_organization',
] as const;
export const organizerPermissionSchema = z.enum(organizerPermissions);
export type OrganizerPermission = z.infer<typeof organizerPermissionSchema>;

export const notificationKinds = [
  'offer',
  'reminder',
  'announce',
  'waitlist',
  'receipt',
  'transfer',
  'refund',
  'reschedule',
  'cancel',
  'organizer_app',
] as const;
export const notificationKindSchema = z.enum(notificationKinds);
export type NotificationKind = z.infer<typeof notificationKindSchema>;

type Tone =
  | 'statusConfirmed'
  | 'statusProvisional'
  | 'statusPaymentDue'
  | 'statusWaitlisted'
  | 'statusOffered'
  | 'statusCancelled'
  | 'statusRefunded'
  | 'statusInfo'
  | 'statusWarning'
  | 'statusError'
  | 'statusNeutral';

export type StatusMeta = Readonly<{
  label: string;
  tone: Tone;
  icon: string;
}>;

export const registrationStatusMeta: Record<RegistrationStatus, StatusMeta> = {
  pending: { label: 'Pending', tone: 'statusNeutral', icon: 'clock' },
  provisional: { label: 'Provisional', tone: 'statusProvisional', icon: 'clock' },
  confirmed: { label: 'Confirmed', tone: 'statusConfirmed', icon: 'check-circle' },
  waitlisted: { label: 'Waitlisted', tone: 'statusWaitlisted', icon: 'swap' },
  spot_offered: { label: 'Spot offered', tone: 'statusOffered', icon: 'ball' },
  transfer_pending: { label: 'Transfer pending', tone: 'statusOffered', icon: 'swap' },
  cancelled: { label: 'Cancelled', tone: 'statusCancelled', icon: 'x' },
  attended: { label: 'Attended', tone: 'statusConfirmed', icon: 'check' },
  no_show: { label: 'No-show', tone: 'statusCancelled', icon: 'x' },
};

export const paymentStatusMeta: Record<PaymentStatus, StatusMeta> = {
  not_required: { label: 'Not required', tone: 'statusConfirmed', icon: 'check' },
  unpaid: { label: 'Unpaid', tone: 'statusWarning', icon: 'clock' },
  payment_due: { label: 'Payment due', tone: 'statusPaymentDue', icon: 'clock' },
  processing: { label: 'Processing', tone: 'statusNeutral', icon: 'spinner' },
  paid: { label: 'Paid', tone: 'statusConfirmed', icon: 'check' },
  failed: { label: 'Failed', tone: 'statusError', icon: 'alert' },
  partially_refunded: { label: 'Partially refunded', tone: 'statusRefunded', icon: 'minus' },
  refunded: { label: 'Refunded', tone: 'statusRefunded', icon: 'minus' },
  disputed: { label: 'Disputed', tone: 'statusError', icon: 'alert' },
};

export function isActiveRegistrationStatus(status: RegistrationStatus): boolean {
  return ['pending', 'provisional', 'confirmed', 'waitlisted', 'spot_offered', 'transfer_pending'].includes(
    status,
  );
}

export function statusDisplayLabel(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
