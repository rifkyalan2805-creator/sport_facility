"use client";

import AdminResource, { type ResourceConfig } from "@/components/admin/AdminResource";
import { money, boolBadge, pill } from "@/components/admin/cells";
import { apiGet, apiPost, apiPatch } from "@/lib/api";

interface AdminPromo {
  id: string;
  code: string;
  name: string;
  type: string;
  discount_value: string;
  min_purchase: string;
  max_discount: string | null;
  quota: number;
  used_count: number;
  applicable_to: string[];
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

const dt = (iso: string) => (iso ? iso.slice(0, 16) : "");

const config: ResourceConfig<AdminPromo> = {
  title: "Promo",
  description: "Kode promo (persentase / nominal tetap).",
  queryKey: "admin-promos",
  addLabel: "Promo",
  list: () => apiGet<AdminPromo[]>("/promos"),
  idOf: (r) => r.id,
  columns: [
    { key: "code", label: "Kode", render: (r) => <span className="font-mono">{r.code}</span> },
    { key: "name", label: "Nama" },
    { key: "type", label: "Tipe", render: (r) => pill(r.type) },
    {
      key: "value",
      label: "Nilai",
      render: (r) => (r.type === "percentage" ? `${Number(r.discount_value)}%` : money(r.discount_value)),
    },
    { key: "quota", label: "Kuota", render: (r) => `${r.used_count}/${r.quota}` },
    { key: "is_active", label: "Status", render: (r) => boolBadge(r.is_active) },
  ],
  fields: [
    { name: "code", label: "Kode", type: "text", required: true },
    { name: "name", label: "Nama", type: "text", required: true },
    {
      name: "type",
      label: "Tipe",
      type: "select",
      required: true,
      options: [
        { value: "percentage", label: "Persentase (%)" },
        { value: "fixed_amount", label: "Nominal tetap (Rp)" },
        { value: "free_item", label: "Item gratis" },
      ],
    },
    { name: "discount_value", label: "Nilai diskon", type: "number", required: true },
    { name: "min_purchase", label: "Minimal pembelian", type: "number" },
    { name: "max_discount", label: "Diskon maksimal (opsional)", type: "number", optional: true },
    { name: "quota", label: "Kuota", type: "number", required: true },
    { name: "applicable_to", label: "Berlaku untuk (koma, 'all')", type: "csv", optional: true, placeholder: "all" },
    { name: "valid_from", label: "Berlaku dari", type: "datetime", required: true },
    { name: "valid_until", label: "Berlaku sampai", type: "datetime", required: true },
    { name: "description", label: "Deskripsi", type: "textarea", optional: true },
    { name: "is_active", label: "Aktif", type: "boolean" },
  ],
  defaults: { type: "percentage", min_purchase: 0, quota: 1, is_active: true, applicable_to: ["all"] },
  toForm: (r) => ({
    code: r.code,
    name: r.name,
    type: r.type,
    discount_value: Number(r.discount_value),
    min_purchase: Number(r.min_purchase),
    max_discount: r.max_discount ? Number(r.max_discount) : "",
    quota: r.quota,
    applicable_to: r.applicable_to,
    valid_from: dt(r.valid_from),
    valid_until: dt(r.valid_until),
    is_active: r.is_active,
  }),
  create: (body) => apiPost("/promos", body),
  update: (id, body) => apiPatch(`/promos/${id}`, body),
};

export default function AdminPromoPage() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">Admin</p>
      <h1 className="mt-2 mb-8 text-3xl font-semibold tracking-tight text-ink-900">Promo</h1>
      <AdminResource config={config} />
    </div>
  );
}
