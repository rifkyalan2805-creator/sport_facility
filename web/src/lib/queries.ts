import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "./api";
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

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  event_date: string;
  location: string | null;
  price: string;
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

// Jadwal slot 1 court untuk 1 tanggal. Refetch tiap court/tanggal berubah.
export function useAvailability(courtId: string | null, date: string) {
  return useQuery({
    queryKey: ["availability", courtId, date],
    queryFn: () =>
      apiGet<AvailabilityResult>(
        `/courts/${courtId}/availability?date=${date}`,
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

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: () => apiGet<EventItem[]>("/events"),
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
