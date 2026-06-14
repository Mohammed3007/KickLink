import { z } from 'zod';
import {
  eventStatusSchema,
  organizerPermissionSchema,
  paymentStatusSchema,
  refundStatusSchema,
  registrationStatusSchema,
  transferStatusSchema,
  waitlistOfferStatusSchema,
} from './statuses';

export const emailSchema = z.string().trim().email().toLowerCase();
export const passwordSchema = z
  .string()
  .min(8)
  .regex(/[A-Za-z]/, 'Password must contain at least one letter.')
  .regex(/\d/, 'Password must contain at least one digit.');
export const phoneSchema = z.string().regex(/^\+[1-9]\d{7,14}$/);
export const displayNameSchema = z.string().trim().min(2).max(40);

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    displayName: displayNameSchema,
    acceptedTerms: z.literal(true),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords must match.',
    path: ['confirmPassword'],
  });

export const profileSchema = z.object({
  displayName: displayNameSchema,
  phone: phoneSchema.optional(),
  position: z.string().trim().max(40).optional(),
  skillLevel: z.string().trim().max(40).optional(),
  city: z.string().trim().min(2).max(80),
});

export const moneySchema = z.object({
  gross: z.number().min(0),
  fee: z.number().min(0),
  net: z.number(),
  currency: z.literal('CAD'),
});

export const eventDraftSchema = z
  .object({
    title: z.string().trim().min(3).max(80),
    status: eventStatusSchema.default('draft'),
    format: z.string().trim().min(1),
    startAt: z.string().datetime(),
    arriveAt: z.string().datetime(),
    durationMin: z.number().int().min(15).max(240),
    venueName: z.string().trim().min(2),
    venueAddress: z.string().trim().min(5),
    capacity: z.number().int().min(1),
    waitlistCapacity: z.number().int().min(0),
    model: z.enum(['free', 'pay_now', 'pay_later']),
    price: z.number().min(0),
    paymentDeadlineHrs: z.number().int().min(1).optional(),
    allowGuests: z.boolean(),
    maxGuests: z.number().int().min(0),
    transfers: z.enum(['none', 'allowed']),
    transferApproval: z.enum(['manual', 'auto']),
    refundDeadlineHrs: z.number().int().min(0),
  })
  .refine((event) => new Date(event.arriveAt).getTime() <= new Date(event.startAt).getTime(), {
    message: 'Arrival time must be before kickoff.',
    path: ['arriveAt'],
  })
  .refine((event) => event.model !== 'pay_later' || event.paymentDeadlineHrs !== undefined, {
    message: 'Pay-later games need a payment deadline.',
    path: ['paymentDeadlineHrs'],
  })
  .refine((event) => event.price > 0 || event.model === 'free', {
    message: 'A zero-dollar game must use the free model.',
    path: ['model'],
  });

export const registrationIntentSchema = z.object({
  eventId: z.string().min(1),
  userId: z.string().min(1),
  idempotencyKey: z.string().min(8),
  guestNames: z.array(displayNameSchema).max(6).default([]),
});

export const paymentIntentSchema = z.object({
  registrationId: z.string().min(1),
  idempotencyKey: z.string().min(8),
  amount: moneySchema,
  method: z.enum(['apple_pay', 'card', 'offline']),
});

export const refundRequestSchema = z.object({
  paymentId: z.string().min(1),
  amount: moneySchema,
  reason: z.string().trim().min(3).max(300),
});

export const organizerApplicationSchema = z.object({
  legalName: displayNameSchema,
  displayName: displayNameSchema,
  email: emailSchema,
  phone: phoneSchema,
  orgName: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  description: z.string().trim().min(20).max(1000),
  expectedPlayers: z.number().int().min(1),
  expectedGames: z.number().int().min(1),
  collectsMoney: z.boolean(),
  agreementAccepted: z.literal(true),
});

export const statusWriteSchema = z.object({
  eventStatus: eventStatusSchema.optional(),
  registrationStatus: registrationStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  refundStatus: refundStatusSchema.optional(),
  transferStatus: transferStatusSchema.optional(),
  waitlistStatus: waitlistOfferStatusSchema.optional(),
});

export const staffPermissionGrantSchema = z.object({
  orgId: z.string().min(1),
  userId: z.string().min(1),
  permissions: z.array(organizerPermissionSchema),
  reason: z.string().trim().min(3).max(300),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type RegistrationIntentInput = z.infer<typeof registrationIntentSchema>;
