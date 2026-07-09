import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost } from "./api";
import type { DiscountTier } from "./groupDiscount";

// Tipe ringkas sesuai respons backend (bisa diperluas nanti).
export interface MembershipPlan {
  id: string;
  name: string;
  slug: string;
  price: string;
  duration_days: number;
  discount_percent: string;
  benefits: string[];
}

export interface Court {
  id: string;
  name: string;
  code: string;
  type: string;
  price_per_hour: string;
  is_indoor: boolean;
  image_url: string | null;
  description: string | null;
  facilities: string[];
}

// Slot ketersediaan (GET /courts/:id/availability?date=)
export interface Slot {
  id: string;
  start: string; // "12:00"
  end: string; // "13:00"
  durationMin: number;
  basePrice: number;
  price: number;
  status: "available" | "booked";
}

export interface AvailabilityResult {
  date: string;
  closed: boolean;
  slots: Slot[];
}

// Booking milik user (GET /bookings) — sudah include ringkasan court.
export interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_hours: string;
  total_price: string;
  status: "pending" | "confirmed" | "checked_in" | "completed" | "cancelled";
  booking_type: string;
  courts?: { name: string; code: string } | null;
}

export interface EventCategoryRef {
  name: string;
  slug: string;
  color: string | null;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  banner_url: string | null;
  event_date: string;
  end_date: string | null;
  location: string | null;
  price: string;
  quota: number;
  registered_count: number;
  organizer_name: string | null;
  registration_deadline: string | null;
  category_id: string;
  event_categories?: EventCategoryRef | null;
}

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

// Hook data siap pakai (publik — tanpa auth).
export function useMembershipPlans() {
  return useQuery({
    queryKey: ["membership-plans"],
    queryFn: () => apiGet<MembershipPlan[]>("/membership/plans"),
  });
}

export function useCourts() {
  return useQuery({
    queryKey: ["courts"],
    queryFn: () => apiGet<Court[]>("/courts"),
  });
}

// Hanya lapangan padel (type 'paddle' di backend).
export function usePadelCourts() {
  return useQuery({
    queryKey: ["courts", "padel"],
    queryFn: async () => {
      const all = await apiGet<Court[]>("/courts");
      return all.filter((c) => c.type === "paddle");
    },
  });
}

export function useTennisCourts() {
  return useQuery({
    queryKey: ["courts", "tennis"],
    queryFn: async () => {
      const all = await apiGet<Court[]>("/courts");
      return all.filter((c) => c.type === "tennis");
    },
  });
}

// Matriks tarif tenis (booking_type × lampu) dari GET /pricing.
export interface TennisPrice {
  id: string;
  booking_type: "insidentil" | "abonemen";
  with_light: boolean;
  price: string;
  is_active: boolean;
}

export function useTennisPrices() {
  return useQuery({
    queryKey: ["pricing", "tennis"],
    queryFn: async () => {
      const all = await apiGet<{ tennis: TennisPrice[] }>("/pricing");
      return (all.tennis ?? []).filter((t) => t.is_active);
    },
  });
}

/**
 * Jadwal slot 1 court untuk 1 tanggal. Refetch tiap court/tanggal/tarif berubah.
 *
 * `bookingType` & `withLight` hanya berpengaruh untuk TENIS (tennis_prices);
 * padel mengabaikannya. Elemen key ditambahkan di BELAKANG agar invalidasi
 * dengan prefix ["availability", courtId, date] tetap cocok.
 */
export function useAvailability(
  courtId: string | null,
  date: string,
  opts?: { bookingType?: "insidentil" | "abonemen"; withLight?: boolean },
) {
  const bookingType = opts?.bookingType ?? "insidentil";
  const withLight = opts?.withLight ?? true;
  return useQuery({
    queryKey: ["availability", courtId, date, bookingType, withLight],
    queryFn: () =>
      apiGet<AvailabilityResult>(
        `/courts/${courtId}/availability?date=${date}&booking_type=${bookingType}&with_light=${withLight}`,
      ),
    enabled: Boolean(courtId) && Boolean(date),
  });
}

// Daftar booking milik user yang login (butuh token — dipakai di dashboard).
export function useMyBookings() {
  return useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => apiGet<Booking[]>("/bookings?limit=50"),
  });
}

// Batalkan booking (pending/confirmed) → refresh daftar setelahnya.
export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiPatch(`/bookings/${id}/cancel`, { reason: "Dibatalkan oleh user" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-bookings"] }),
  });
}

// ---- Tiket kolam milik user ----
export interface PoolTicket {
  id: string;
  quantity: number;
  total_price: string;
  qr_code: string;
  status: "active" | "used" | "cancelled" | "expired";
  created_at: string;
  pool_sessions?: { name: string; session_date: string } | null;
  pool_ticket_types?: { name: string } | null;
}

export function useMyPoolTickets() {
  return useQuery({
    queryKey: ["my-pool-tickets"],
    queryFn: () => apiGet<PoolTicket[]>("/pool/tickets/me"),
  });
}

export function useCancelPoolTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPatch(`/pool/tickets/${id}/cancel`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-pool-tickets"] }),
  });
}

// ---- Membership milik user ----
export interface Membership {
  id: string;
  status: "active" | "pending" | "expired" | "cancelled";
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  membership_plans?: { name: string; slug: string } | null;
}

export function useMyMemberships() {
  return useQuery({
    queryKey: ["my-memberships"],
    queryFn: () => apiGet<Membership[]>("/membership/me"),
  });
}

export function useCancelMembership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPatch(`/membership/${id}/cancel`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-memberships"] }),
  });
}

// ---- Abonemen tenis: paket & registrasi ----
export interface AbonemenPackage {
  id: string;
  name: string;
  description: string | null;
  sessions_per_week: number;
  duration_weeks: number;
  price: string;
}

export function useAbonemenPackages() {
  return useQuery({
    queryKey: ["abonemen-packages"],
    queryFn: () => apiGet<AbonemenPackage[]>("/abonemen/packages"),
  });
}

export interface AbonemenRegistration {
  id: string;
  full_name: string;
  phone: string;
  communication_email: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  abonemen_packages?: { id: string; name: string; price: string } | null;
}

/**
 * Registrasi abonemen milik user. `enabled` dipakai agar tidak memanggil
 * endpoint ber-auth saat user belum login (mis. di wizard tenis yang publik).
 */
export function useMyAbonemenRegistrations(enabled = true) {
  return useQuery({
    queryKey: ["my-abonemen-registrations"],
    queryFn: () => apiGet<AbonemenRegistration[]>("/abonemen/registrations/me"),
    enabled,
  });
}

export interface CreateRegistrationBody {
  package_id: string;
  full_name: string;
  phone: string;
  communication_email: string;
  notes?: string;
}

export function useCreateAbonemenRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateRegistrationBody) =>
      apiPost<AbonemenRegistration>("/abonemen/registrations", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-abonemen-registrations"] }),
  });
}

// ---- Admin: ringkasan dashboard ----
export interface AdminSummary {
  bookingsToday: number;
  pendingAbonemen: number;
  totalBookings: number;
  revenueTotal: number;
  revenue7d: { date: string; revenue: number; count: number }[];
}

export function useAdminSummary() {
  return useQuery({
    queryKey: ["admin-summary"],
    queryFn: () => apiGet<AdminSummary>("/reports/summary"),
  });
}

// ---- Admin: transaksi (semua booking & payment) ----
export interface AdminBooking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: string;
  status: string;
  booking_type: string;
  courts?: { name: string; code: string } | null;
  users?: { full_name: string; email: string } | null;
}

export function useAllBookings(filters: { status?: string; date?: string }) {
  const qs = new URLSearchParams({ scope: "all", limit: "100" });
  if (filters.status) qs.set("status", filters.status);
  if (filters.date) qs.set("booking_date", filters.date);
  return useQuery({
    queryKey: ["admin-bookings", filters.status ?? "", filters.date ?? ""],
    queryFn: () => apiGet<AdminBooking[]>(`/bookings?${qs.toString()}`),
  });
}

export interface AdminPayment {
  id: string;
  final_amount: string;
  amount: string;
  discount_amount: string;
  status: string;
  reference_id: string | null;
  created_at: string;
  users?: { full_name: string; email: string } | null;
  invoices?: { invoice_number: string } | null;
  payment_items?: { item_type: string }[];
}

export function useAllPayments(filters: { status?: string }) {
  const qs = new URLSearchParams({ scope: "all", limit: "100" });
  if (filters.status) qs.set("status", filters.status);
  return useQuery({
    queryKey: ["admin-payments", filters.status ?? ""],
    queryFn: () => apiGet<AdminPayment[]>(`/payments?${qs.toString()}`),
  });
}

// ---- Admin: review registrasi abonemen ----
export function useAdminRegistrations(status?: AbonemenRegistration["status"]) {
  return useQuery({
    queryKey: ["admin-registrations", status ?? "all"],
    queryFn: () =>
      apiGet<AbonemenRegistration[]>(
        `/abonemen/registrations${status ? `?status=${status}` : ""}`,
      ),
  });
}

export function useReviewRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; action: "approve" | "reject"; notes?: string }) =>
      apiPatch(`/abonemen/registrations/${v.id}/review`, {
        action: v.action,
        notes: v.notes,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-registrations"] }),
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: () => apiGet<EventItem[]>("/events"),
  });
}

export function useEventCategories() {
  return useQuery({
    queryKey: ["event-categories"],
    queryFn: () => apiGet<EventCategory[]>("/events/categories"),
  });
}

export function useEvent(slug: string) {
  return useQuery({
    queryKey: ["event", slug],
    queryFn: () => apiGet<EventItem>(`/events/slug/${slug}`),
    enabled: Boolean(slug),
  });
}

export interface EventRegistration {
  id: string;
  event_id: string;
  status: "registered" | "confirmed" | "checked_in" | "cancelled" | "waitlisted";
  qr_code?: string;
  created_at: string;
  events?: { title: string; event_date: string } | null;
}

export function useMyEventRegistrations(enabled = true) {
  return useQuery({
    queryKey: ["my-event-registrations"],
    queryFn: () => apiGet<EventRegistration[]>("/events/registrations/me"),
    enabled,
  });
}

export interface RegisterEventResult {
  registration: { id: string; status: string };
  payment: { id: string } | null;
}

export function useRegisterEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) =>
      apiPost<RegisterEventResult>(`/events/${eventId}/register`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-event-registrations"] });
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["event"] });
    },
  });
}

export function useCancelEventRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPatch(`/events/registrations/${id}/cancel`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-event-registrations"] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

// ---- Waiting list (antrean slot court penuh — padel & tennis) ----
export type WaitingStatus = "waiting" | "notified" | "booked" | "expired" | "cancelled";

export interface WaitingEntry {
  id: string;
  court_id: string;
  preferred_date: string;
  preferred_start: string;
  preferred_end: string;
  status: WaitingStatus;
  notified_at: string | null;
  created_at: string;
  courts?: { name: string; code: string } | null;
}

export interface JoinWaitingListInput {
  court_id: string;
  preferred_date: string; // YYYY-MM-DD
  preferred_start: string; // HH:mm
  preferred_end: string; // HH:mm
}

export function useMyWaitingList(enabled = true) {
  return useQuery({
    queryKey: ["my-waiting-list"],
    queryFn: () => apiGet<WaitingEntry[]>("/waiting-list"),
    enabled,
  });
}

export function useJoinWaitingList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: JoinWaitingListInput) => apiPost<WaitingEntry>("/waiting-list", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-waiting-list"] }),
  });
}

export function useCancelWaitingList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPatch(`/waiting-list/${id}/cancel`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-waiting-list"] }),
  });
}

// ---- Daftar harga (site_settings.pricing) untuk halaman /harga ----
export interface PricingData {
  tennis: {
    insidentil: { with_light: number; without_light: number };
    abonemen: { with_light: number; without_light: number };
    close_time: string;
  };
  padel: {
    insidentil: number;
    off_peak: { price: number; window: string };
    close_time: string;
  };
  pool: { htm_per_person: number; close_time: string };
}

export function usePricing() {
  return useQuery({
    queryKey: ["pricing"],
    queryFn: async () => {
      const row = await apiGet<{ value: PricingData }>("/settings/pricing");
      return row.value;
    },
  });
}

// ---- Tipe tiket kolam (HTM) — sumber harga pool ----
export interface PoolTicketType {
  id: string;
  name: string;
  price: string;
  age_min: number;
  age_max: number;
}

export function usePoolTicketTypes() {
  return useQuery({
    queryKey: ["pool-ticket-types"],
    queryFn: () => apiGet<PoolTicketType[]>("/pool/ticket-types"),
  });
}

// ---- Sesi kolam (tanggal + kuota) untuk booking ----
export interface PoolSession {
  id: string;
  name: string;
  session_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
  status: "open" | "full" | "closed" | "cancelled";
}

export function usePoolSessions() {
  return useQuery({
    queryKey: ["pool-sessions"],
    queryFn: () => apiGet<PoolSession[]>("/pool/sessions"),
  });
}

// Tier diskon grup (site_settings) untuk preview di Review.
export function usePoolGroupDiscount() {
  return useQuery({
    queryKey: ["pool-group-discount"],
    queryFn: async () => {
      const row = await apiGet<{ value: { tiers: DiscountTier[] } }>(
        "/settings/pool_group_discount",
      );
      return row.value?.tiers ?? [];
    },
  });
}
