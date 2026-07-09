"use client";

import AdminResource, { type ResourceConfig } from "@/components/admin/AdminResource";
import { money, boolBadge } from "@/components/admin/cells";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";

interface TennisPrice {
  id: string;
  booking_type: string;
  with_light: boolean;
  price: string;
  is_active: boolean;
  sort_order: number;
}
interface PadelPrice {
  id: string;
  label: string;
  price: string;
  time_start: string | null;
  time_end: string | null;
  is_active: boolean;
  sort_order: number;
}

const t = (iso: string | null) => (iso ? iso.slice(11, 16) : "");

const tennis: ResourceConfig<TennisPrice> = {
  title: "Tarif Tenis",
  description: "Insidentil/abonemen × dengan/tanpa lampu.",
  queryKey: "admin-price-tennis",
  addLabel: "Tarif Tenis",
  list: async () => (await apiGet<{ tennis: TennisPrice[] }>("/pricing")).tennis,
  idOf: (r) => r.id,
  columns: [
    { key: "booking_type", label: "Jenis", render: (r) => <span className="capitalize">{r.booking_type}</span> },
    { key: "with_light", label: "Lampu", render: (r) => (r.with_light ? "Dengan" : "Tanpa") },
    { key: "price", label: "Harga/jam", render: (r) => money(r.price) },
    { key: "is_active", label: "Status", render: (r) => boolBadge(r.is_active) },
  ],
  fields: [
    {
      name: "booking_type",
      label: "Jenis",
      type: "select",
      required: true,
      options: [
        { value: "insidentil", label: "Insidentil" },
        { value: "abonemen", label: "Abonemen" },
      ],
    },
    { name: "with_light", label: "Dengan lampu", type: "boolean" },
    { name: "price", label: "Harga/jam", type: "number", required: true },
    { name: "is_active", label: "Aktif", type: "boolean" },
    { name: "sort_order", label: "Urutan", type: "number" },
  ],
  defaults: { with_light: true, is_active: true, sort_order: 0 },
  toForm: (r) => ({
    booking_type: r.booking_type,
    with_light: r.with_light,
    price: Number(r.price),
    is_active: r.is_active,
    sort_order: r.sort_order,
  }),
  create: (body) => apiPost("/pricing/tennis", body),
  update: (id, body) => apiPatch(`/pricing/tennis/${id}`, body),
  remove: (id) => apiDelete(`/pricing/tennis/${id}`),
};

const padel: ResourceConfig<PadelPrice> = {
  title: "Tarif Padel",
  description: "Normal / off-peak (rentang jam).",
  queryKey: "admin-price-padel",
  addLabel: "Tarif Padel",
  list: async () => (await apiGet<{ padel: PadelPrice[] }>("/pricing")).padel,
  idOf: (r) => r.id,
  columns: [
    { key: "label", label: "Label" },
    { key: "price", label: "Harga/jam", render: (r) => money(r.price) },
    { key: "window", label: "Rentang", render: (r) => (r.time_start ? `${t(r.time_start)}–${t(r.time_end)}` : "sepanjang hari") },
    { key: "is_active", label: "Status", render: (r) => boolBadge(r.is_active) },
  ],
  fields: [
    { name: "label", label: "Label", type: "text", required: true, placeholder: "normal / off_peak" },
    { name: "price", label: "Harga/jam", type: "number", required: true },
    { name: "time_start", label: "Jam mulai (off-peak)", type: "time", optional: true },
    { name: "time_end", label: "Jam selesai (off-peak)", type: "time", optional: true },
    { name: "is_active", label: "Aktif", type: "boolean" },
    { name: "sort_order", label: "Urutan", type: "number" },
  ],
  defaults: { is_active: true, sort_order: 0 },
  toForm: (r) => ({
    label: r.label,
    price: Number(r.price),
    time_start: t(r.time_start),
    time_end: t(r.time_end),
    is_active: r.is_active,
    sort_order: r.sort_order,
  }),
  create: (body) => apiPost("/pricing/padel", body),
  update: (id, body) => apiPatch(`/pricing/padel/${id}`, body),
  remove: (id) => apiDelete(`/pricing/padel/${id}`),
};

export default function AdminPricingPage() {
  return (
    <div className="space-y-12">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">Harga</h1>
      </div>
      <AdminResource config={tennis} />
      <AdminResource config={padel} />
    </div>
  );
}
