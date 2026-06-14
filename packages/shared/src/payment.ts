import type { Money } from './types';
import type { PaymentStatus } from './statuses';

export type MockPaymentMode = 'not_required' | 'succeeds' | 'fails' | 'processing';

export type PaymentProviderResult = Readonly<{
  idempotencyKey: string;
  providerIntentId: string;
  status: PaymentStatus;
  receiptUrl?: string;
}>;

export interface PaymentProvider {
  createIntent(input: {
    registrationId: string;
    idempotencyKey: string;
    amount: Money;
    mode?: MockPaymentMode;
  }): Promise<PaymentProviderResult>;
}

export class MockPaymentProvider implements PaymentProvider {
  private readonly intents = new Map<string, PaymentProviderResult>();

  async createIntent(input: {
    registrationId: string;
    idempotencyKey: string;
    amount: Money;
    mode?: MockPaymentMode;
  }): Promise<PaymentProviderResult> {
    const existing = this.intents.get(input.idempotencyKey);
    if (existing) {
      return existing;
    }

    const status = paymentModeToStatus(input.mode ?? (input.amount.gross === 0 ? 'not_required' : 'succeeds'));
    const result: PaymentProviderResult = {
      idempotencyKey: input.idempotencyKey,
      providerIntentId: `mock_pi_${input.registrationId}`,
      status,
    };
    if (status === 'paid') {
      this.intents.set(input.idempotencyKey, {
        ...result,
        receiptUrl: `mock://receipts/${input.registrationId}`,
      });
      return this.intents.get(input.idempotencyKey) as PaymentProviderResult;
    }

    this.intents.set(input.idempotencyKey, result);
    return result;
  }
}

export function paymentModeToStatus(mode: MockPaymentMode): PaymentStatus {
  switch (mode) {
    case 'not_required':
      return 'not_required';
    case 'fails':
      return 'failed';
    case 'processing':
      return 'processing';
    case 'succeeds':
      return 'paid';
  }
}
