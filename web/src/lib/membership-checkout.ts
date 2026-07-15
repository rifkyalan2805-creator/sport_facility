import type { QueryClient } from "@tanstack/react-query";
import { apiPost } from "./api";
import { settlePayment, type CheckoutRunner } from "./checkout";

export interface MemberData {
  member_name: string;
  birth_date: string; // YYYY-MM-DD
  gender: string;
  city: string;
  photo_url: string;
  medical_notes?: string;
  start_date: string; // YYYY-MM-DD
  terms_accepted: boolean;
  marketing_opt_in: boolean;
}

interface SubscribeResp {
  membership: { id: string; card_number: string | null };
  payment: { id: string } | null;
}

/**
 * Runner membership BERBAYAR: subscribe SEKALI (buat membership pending + payment,
 * di-cache di closure) → settle per percobaan. Subscribe dipisah dari settle karena
 * constraint aktif/pending → 409 bila subscribe diulang.
 */
export function makeMembershipRunner(opts: {
  planId: string;
  memberData: MemberData;
  qc: QueryClient;
}): CheckoutRunner {
  let paymentId: string | null = null;
  let subscribed = false;

  return async (outcome) => {
    try {
      if (!subscribed) {
        const res = await apiPost<SubscribeResp>("/membership/subscribe", {
          plan_id: opts.planId,
          auto_renew: false,
          ...opts.memberData,
        });
        subscribed = true;
        paymentId = res.payment?.id ?? null;
      }
      if (!paymentId) {
        // Plan gratis (tak lewat jalur ini) → sudah aktif.
        return { status: "paid", invoiceNumber: null, referenceId: null, finalAmount: 0, confirmedCount: 1 };
      }
      const settled = await settlePayment(paymentId, outcome);
      return { ...settled, confirmedCount: 1 };
    } finally {
      opts.qc.invalidateQueries({ queryKey: ["my-memberships"] });
    }
  };
}
