import type { QueryClient } from "@tanstack/react-query";
import { apiPost } from "./api";
import { settlePayment, type CheckoutRunner } from "./checkout";

function newKey(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

interface PoolCheckoutResp {
  tickets: { id: string }[];
  payment: { id: string };
  discount: { percent: number; amount: number; totalQty: number };
}

/**
 * Runner mode TIKET (satuan/group): `POST /pool/checkout` (reservasi tiket +
 * diskon grup server-side + 1 payment) → settle. Diskon dihitung server.
 */
export function makePoolTicketRunner(opts: {
  sessionId: string;
  items: { ticketTypeId: string; quantity: number }[];
  qc: QueryClient;
  onConsumed?: () => void;
}): CheckoutRunner {
  return async (outcome) => {
    try {
      const res = await apiPost<PoolCheckoutResp>(
        "/pool/checkout",
        {
          session_id: opts.sessionId,
          items: opts.items.map((i) => ({ ticket_type_id: i.ticketTypeId, quantity: i.quantity })),
        },
        { headers: { "Idempotency-Key": newKey() } },
      );
      opts.onConsumed?.();
      const settled = await settlePayment(res.payment.id, outcome);
      return { ...settled, confirmedCount: res.tickets.length };
    } finally {
      // Refresh apa pun hasilnya: 422 kuota penuh atau gagal (onFailed) → kuota berubah.
      opts.qc.invalidateQueries({ queryKey: ["pool-sessions"] });
      opts.qc.invalidateQueries({ queryKey: ["my-pool-tickets"] });
    }
  };
}
