import { randomUUID } from 'crypto';

/**
 * Abstraksi payment gateway. Business logic (PaymentService) HANYA bergantung
 * pada interface ini, sehingga DummyPaymentGateway bisa ditukar dengan
 * implementasi Midtrans/Xendit/Stripe di masa depan tanpa mengubah service.
 */
export interface ChargeInput {
  amount: number;
  referenceHint?: string;
}

export interface ChargeResult {
  referenceId: string;
  raw: Record<string, unknown>;
}

export interface PaymentGateway {
  /** Membuat charge dan mengembalikan reference id transaksi. */
  createCharge(input: ChargeInput): Promise<ChargeResult>;
}

/**
 * Implementasi DUMMY — sepenuhnya lokal, tanpa panggilan jaringan.
 * Perubahan status (paid/failed) dilakukan via endpoint simulasi, yang
 * pada gateway asli akan digantikan oleh webhook/callback.
 */
export class DummyPaymentGateway implements PaymentGateway {
  async createCharge(input: ChargeInput): Promise<ChargeResult> {
    const referenceId = `DUMMY-${Date.now()}-${randomUUID().slice(0, 8)}`;
    return {
      referenceId,
      raw: {
        provider: 'dummy',
        amount: input.amount,
        created_at: new Date().toISOString(),
      },
    };
  }
}

export const dummyPaymentGateway = new DummyPaymentGateway();
