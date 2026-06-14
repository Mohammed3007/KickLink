import { describe, expect, it } from 'vitest';
import {
  eventDraftSchema,
  organizerApplicationSchema,
  registrationIntentSchema,
  signUpSchema,
} from '../src';

describe('validation schemas', () => {
  it('validates sign-up requirements', () => {
    const parsed = signUpSchema.parse({
      email: 'DANIEL@example.ca',
      password: 'soccer123',
      confirmPassword: 'soccer123',
      displayName: 'Daniel Osei',
      acceptedTerms: true,
    });
    expect(parsed.email).toBe('daniel@example.ca');
  });

  it('rejects weak passwords and mismatched confirmation', () => {
    expect(() =>
      signUpSchema.parse({
        email: 'daniel@example.ca',
        password: 'soccer',
        confirmPassword: 'different',
        displayName: 'Daniel Osei',
        acceptedTerms: true,
      }),
    ).toThrow();
  });

  it('requires idempotency keys for registration intents', () => {
    expect(() =>
      registrationIntentSchema.parse({
        eventId: 'evt_1',
        userId: 'usr_1',
        idempotencyKey: 'short',
      }),
    ).toThrow();
  });

  it('requires pay-later games to include a payment deadline', () => {
    expect(() =>
      eventDraftSchema.parse({
        title: 'Saturday Morning 11s',
        format: '11-a-side',
        startAt: '2026-06-20T14:00:00.000Z',
        arriveAt: '2026-06-20T13:40:00.000Z',
        durationMin: 90,
        venueName: "Mooney's Bay Fields",
        venueAddress: '2960 Riverside Dr, Ottawa',
        capacity: 22,
        waitlistCapacity: 6,
        model: 'pay_later',
        price: 15,
        allowGuests: true,
        maxGuests: 1,
        transfers: 'allowed',
        transferApproval: 'manual',
        refundDeadlineHrs: 24,
      }),
    ).toThrow();
  });

  it('validates organizer application minimum data', () => {
    const parsed = organizerApplicationSchema.parse({
      legalName: 'Lena Park',
      displayName: 'Lena Park',
      email: 'lena@example.ca',
      phone: '+16135550119',
      orgName: 'Glebe Indoor 5s',
      city: 'Ottawa',
      description: 'Weekly indoor pickup group with paid court rentals.',
      expectedPlayers: 32,
      expectedGames: 8,
      collectsMoney: true,
      agreementAccepted: true,
    });
    expect(parsed.orgName).toBe('Glebe Indoor 5s');
  });
});
