import { apiPost } from "./api";
import type { Slot } from "./queries";

export interface CreatedBooking {
  id: string;
  slot: Slot;
  totalPrice: number; // total_price hasil hitung server
}

export interface CreateBookingsResult {
  bookings: CreatedBooking[];
  failedCount: number;
}

export interface PaymentInfo {
  paymentId: string;
  referenceId: string | null;
  finalAmount: number;
}

export interface SettleResult {
  status: string;
  invoiceNumber: string | null;
  referenceId: string | null;
  finalAmount: number;
}

interface BookingCreated {
  id: string;
  total_price: string | number;
}

interface PaymentResponse {
  id: string;
  reference_id: string | null;
  final_amount: string | number;
  status: string;
  invoices?: { invoice_number: string } | null;
}

/**
 * Fase 1 — buat 1 booking per slot (paralel, toleran sebagian gagal karena 409).
 * Dipisah dari pembayaran agar retry pembayaran TIDAK membuat booking ganda.
 */
export async function createBookings(
  courtId: string,
  date: string,
  slots: Slot[],
): Promise<CreateBookingsResult> {
  const settled = await Promise.allSettled(
    slots.map((s) =>
      apiPost<BookingCreated>("/bookings", {
        court_id: courtId,
        booking_type: "insidentil",
        with_light: true,
        booking_date: date,
        start_time: s.start,
        end_time: s.end,
      }).then((b) => ({ id: b.id, slot: s, totalPrice: Number(b.total_price) })),
    ),
  );

  const bookings = settled
    .filter((r): r is PromiseFulfilledResult<CreatedBooking> => r.status === "fulfilled")
    .map((r) => r.value);

  if (!bookings.length) {
    throw new Error(
      "Semua slot gagal dibooking (kemungkinan sudah dipesan). Silakan pilih slot lain.",
    );
  }

  return { bookings, failedCount: settled.length - bookings.length };
}

/**
 * Fase 2 — satu pembayaran (status pending) mencakup semua booking (multi-item) → 1 invoice.
 * Selalu buat payment baru tiap percobaan (payment gagal tak bisa disettle ulang).
 */
export async function createPayment(
  bookings: CreatedBooking[],
  courtName: string,
  date: string,
): Promise<PaymentInfo> {
  const idempotencyKey =
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  const p = await apiPost<PaymentResponse>(
    "/payments",
    {
      items: bookings.map((b) => ({
        item_type: "booking",
        item_id: b.id,
        item_name: `Padel ${courtName} · ${date} ${b.slot.start}-${b.slot.end}`,
        quantity: 1,
        unit_price: b.totalPrice,
      })),
    },
    { headers: { "Idempotency-Key": idempotencyKey } },
  );
  return { paymentId: p.id, referenceId: p.reference_id, finalAmount: Number(p.final_amount) };
}

/**
 * Fase 3 — simulasikan hasil pembayaran (pengganti webhook gateway).
 * success → booking di-confirm + invoice dibuat; failure → booking tetap pending.
 */
export async function settlePayment(
  paymentId: string,
  outcome: "success" | "failure",
): Promise<SettleResult> {
  const body = outcome === "failure" ? { reason: "Disimulasikan gagal" } : undefined;
  const p = await apiPost<PaymentResponse>(
    `/payments/${paymentId}/simulate/${outcome}`,
    body,
  );
  return {
    status: p.status,
    invoiceNumber: p.invoices?.invoice_number ?? null,
    referenceId: p.reference_id,
    finalAmount: Number(p.final_amount),
  };
}
