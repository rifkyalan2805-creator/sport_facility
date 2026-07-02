import { useQuery } from "@tanstack/react-query";
import { apiGet } from "./api";

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
