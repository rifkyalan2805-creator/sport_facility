import type { QueryClient } from "@tanstack/react-query";
import { apiPost } from "./api";
import { settlePayment, type CheckoutRunner } from "./checkout";

interface RegisterResp {
  registration: { id: string; status: string };
  payment: { id: string } | null;
}

/**
 * Runner registrasi event BERBAYAR: register SEKALI (buat registrasi + payment,
 * di-cache di closure) → settle per percobaan. Register dipisah dari settle
 * karena constraint unik (user, event) membuat register ulang → 409.
 */
export function makeEventRunner(opts: { eventId: string; qc: QueryClient }): CheckoutRunner {
  let paymentId: string | null = null;
  let registered = false;

  return async (outcome) => {
    try {
      if (!registered) {
        const res = await apiPost<RegisterResp>(`/events/${opts.eventId}/register`);
        registered = true;
        paymentId = res.payment?.id ?? null;
      }
      if (!paymentId) {
        // Event gratis (tak lewat jalur ini) → sudah confirmed.
        return { status: "paid", invoiceNumber: null, referenceId: null, finalAmount: 0, confirmedCount: 1 };
      }
      const settled = await settlePayment(paymentId, outcome);
      return { ...settled, confirmedCount: 1 };
    } finally {
      opts.qc.invalidateQueries({ queryKey: ["my-event-registrations"] });
      opts.qc.invalidateQueries({ queryKey: ["events"] });
      opts.qc.invalidateQueries({ queryKey: ["event"] });
    }
  };
}
