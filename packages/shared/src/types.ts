import type {
  EventStatus,
  MembershipStatus,
  NotificationKind,
  OrganizerApplicationAdminStatus,
  OrganizerPermission,
  PaymentStatus,
  RefundStatus,
  RegistrationStatus,
  TransferStatus,
  WaitlistOfferStatus,
} from './statuses';

export type ID = string;
export type Currency = 'CAD';
export type Money = Readonly<{
  gross: number;
  fee: number;
  net: number;
  currency: Currency;
}>;

export type Profile = Readonly<{
  id: ID;
  displayName: string;
  legalName?: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  position?: string;
  skillLevel?: string;
  city: string;
  memberSince: string;
  roles: readonly ('player' | 'organizer' | 'admin')[];
  reliability: Readonly<{
    indicator: 'new_participant' | 'good_standing' | 'attendance_concern' | 'payment_concern';
    gamesAttended: number;
    lateCancels: number;
    noShows: number;
    missedPayments: number;
  }>;
}>;

export type Organization = Readonly<{
  id: ID;
  name: string;
  handle: string;
  city: string;
  venueDefault?: string;
  blurb: string;
  membersCount: number;
  isPrivate: boolean;
  requiresApproval: boolean;
  ownerId: ID;
}>;

export type Membership = Readonly<{
  id: ID;
  orgId: ID;
  userId: ID;
  status: MembershipStatus;
  role: 'player' | 'organizer_staff' | 'owner';
  permissions: readonly OrganizerPermission[];
  joinedAt: string;
}>;

export type EventGame = Readonly<{
  id: ID;
  orgId: ID;
  title: string;
  status: EventStatus;
  format: string;
  skillLevel: string;
  startAt: string;
  arriveAt: string;
  durationMin: number;
  venueTimeZone: string;
  venue: Readonly<{
    name: string;
    address: string;
    directionsNote?: string;
  }>;
  capacity: number;
  filledCount: number;
  waitlistCapacity: number;
  waitlistMode: 'manual' | 'automatic';
  model: 'free' | 'pay_now' | 'pay_later';
  price: Money;
  paymentDeadlineHrs?: number;
  allowGuests: boolean;
  maxGuests: number;
  transfers: 'none' | 'allowed';
  transferApproval: 'manual' | 'auto';
  refundPolicy: Readonly<{
    type: 'full_before' | 'partial_before' | 'no_refund_after' | 'organizer_review';
    deadlineHrs: number;
    partialPct?: number;
    onlyIfFilled?: boolean;
  }>;
  visibility: 'full' | 'first_photo' | 'name_only' | 'count_only' | 'hidden';
  rules: string;
  equipmentNote?: string;
  publicCode: string;
}>;

export type Registration = Readonly<{
  id: ID;
  eventId: ID;
  userId: ID;
  regStatus: RegistrationStatus;
  payStatus: PaymentStatus;
  waitlistPosition?: number;
  offerExpiresAt?: string;
  paymentDeadlineAt?: string;
  amountPaid?: Money;
  paymentMethod?: 'apple_pay' | 'card' | 'offline';
  idempotencyKey: string;
  guestCount: number;
  createdAt: string;
  updatedAt: string;
}>;

export type RegistrationGuest = Readonly<{
  id: ID;
  registrationId: ID;
  displayName: string;
}>;

export type Payment = Readonly<{
  id: ID;
  registrationId: ID;
  userId: ID;
  eventId: ID;
  orgId: ID;
  amount: Money;
  method: 'apple_pay' | 'card' | 'offline';
  status: PaymentStatus;
  providerIntentId?: string;
  receiptUrl?: string;
  createdAt: string;
}>;

export type Refund = Readonly<{
  id: ID;
  paymentId: ID;
  amount: Money;
  reason?: string;
  status: RefundStatus;
  requestedBy: ID;
  decidedBy?: ID;
  decisionReason?: string;
  createdAt: string;
}>;

export type WaitlistEntry = Readonly<{
  id: ID;
  eventId: ID;
  userId: ID;
  position: number;
  status: WaitlistOfferStatus;
  offerExpiresAt?: string;
  createdAt: string;
}>;

export type Transfer = Readonly<{
  id: ID;
  eventId: ID;
  fromUserId: ID;
  toTarget: 'waitlist' | ID;
  status: TransferStatus;
  deadlineAt: string;
  createdAt: string;
}>;

export type Notification = Readonly<{
  id: ID;
  userId: ID;
  kind: NotificationKind;
  title: string;
  body: string;
  unread: boolean;
  deepLink: string;
  createdAt: string;
}>;

export type OrganizerApplication = Readonly<{
  id: ID;
  userId: ID;
  legalName: string;
  displayName: string;
  email: string;
  phone: string;
  orgName: string;
  city: string;
  description: string;
  expectedPlayers: number;
  expectedGames: number;
  collectsMoney: boolean;
  verificationStatus: 'provider_stub';
  status: OrganizerApplicationAdminStatus;
  createdAt: string;
}>;
