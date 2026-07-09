"use client";

import AdminResource, { type ResourceConfig } from "@/components/admin/AdminResource";
import { money, boolBadge } from "@/components/admin/cells";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";

interface AdminPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  duration_days: number;
  discount_percent: string;
  max_bookings_month: number;
  benefits: string[];
  is_active: boolean;
  sort_order: number;
}

const config: ResourceConfig<AdminPlan> = {
  title: "Paket Membership",
  description: "Paket langganan akses fasilitas.",
  queryKey: "admin-plans",
  addLabel: "Paket",
  list: () => apiGet<AdminPlan[]>("/membership/plans"),
  idOf: (r) => r.id,
  columns: [
    { key: "name", label: "Nama" },
    { key: "price", label: "Harga", render: (r) => money(r.price) },
    { key: "duration_days", label: "Durasi", render: (r) => `${r.duration_days} hari` },
    { key: "discount_percent", label: "Diskon", render: (r) => `${Number(r.discount_percent)}%` },
    { key: "is_active", label: "Status", render: (r) => boolBadge(r.is_active) },
  ],
  fields: [
    { name: "name", label: "Nama", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", optional: true, help: "Kosongkan untuk auto." },
    { name: "price", label: "Harga", type: "number", required: true },
    { name: "duration_days", label: "Durasi (hari)", type: "number", required: true },
    { name: "discount_percent", label: "Diskon (%)", type: "number" },
    { name: "max_bookings_month", label: "Maks booking/bulan (0=tak terbatas)", type: "number" },
    { name: "benefits", label: "Benefit (pisahkan koma)", type: "csv", optional: true },
    { name: "description", label: "Deskripsi", type: "textarea", optional: true },
    { name: "is_active", label: "Aktif", type: "boolean" },
    { name: "sort_order", label: "Urutan", type: "number" },
  ],
  defaults: { discount_percent: 0, max_bookings_month: 0, is_active: true, sort_order: 0, benefits: [] },
  toForm: (r) => ({
    name: r.name,
    slug: r.slug,
    price: Number(r.price),
    duration_days: r.duration_days,
    discount_percent: Number(r.discount_percent),
    max_bookings_month: r.max_bookings_month,
    benefits: r.benefits,
    description: r.description ?? "",
    is_active: r.is_active,
    sort_order: r.sort_order,
  }),
  create: (body) => apiPost("/membership/plans", body),
  update: (id, body) => apiPatch(`/membership/plans/${id}`, body),
  remove: (id) => apiDelete(`/membership/plans/${id}`),
  confirmDelete: (r) => `Nonaktifkan paket "${r.name}"?`,
};

export default function AdminMembershipPage() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">Admin</p>
      <h1 className="mt-2 mb-8 text-3xl font-semibold tracking-tight text-ink-900">Membership</h1>
      <AdminResource config={config} />
    </div>
  );
}
