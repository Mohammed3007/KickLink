import { describe, expect, it } from 'vitest';
import {
  eventStatusSchema,
  isActiveRegistrationStatus,
  paymentModeToStatus,
  paymentStatusSchema,
  registrationStatusMeta,
  registrationStatusSchema,
  statusWriteSchema,
} from '../src';

describe('status model', () => {
  it('accepts documented status strings', () => {
    expect(eventStatusSchema.parse('registration_closed')).toBe('registration_closed');
    expect(registrationStatusSchema.parse('transfer_pending')).toBe('transfer_pending');
    expect(paymentStatusSchema.parse('partially_refunded')).toBe('partially_refunded');
  });

  it('rejects unknown free-text statuses', () => {
    expect(() => registrationStatusSchema.parse('booked')).toThrow();
    expect(() => statusWriteSchema.parse({ paymentStatus: 'settled' })).toThrow();
  });

  it('keeps registration and payment states independent', () => {
    const parsed = statusWriteSchema.parse({
      registrationStatus: 'confirmed',
      paymentStatus: 'refunded',
    });
    expect(parsed.registrationStatus).toBe('confirmed');
    expect(parsed.paymentStatus).toBe('refunded');
  });

  it('classifies active registrations for duplicate prevention', () => {
    expect(isActiveRegistrationStatus('confirmed')).toBe(true);
    expect(isActiveRegistrationStatus('cancelled')).toBe(false);
  });

  it('has label metadata for player-facing status badges', () => {
    expect(registrationStatusMeta.spot_offered.label).toBe('Spot offered');
  });

  it('maps mock payment modes to payment statuses', () => {
    expect(paymentModeToStatus('not_required')).toBe('not_required');
    expect(paymentModeToStatus('processing')).toBe('processing');
    expect(paymentModeToStatus('fails')).toBe('failed');
    expect(paymentModeToStatus('succeeds')).toBe('paid');
  });
});
