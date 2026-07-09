"use client";

import AdminResource, { type ResourceConfig } from "@/components/admin/AdminResource";
import { money, boolBadge, pill } from "@/components/admin/cells";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";

interface AdminCourt {
  id: string;
  name: string;
  code: string;
  type: string;
  price_per_hour: string;
  capacity: number;
  is_indoor: boolean;
  facilities: string[];
  description: string | null;
  is_active: boolean;
  sort_order: number;
}

const config: ResourceConfig<AdminCourt> = {
  title: "Lapangan",
  description: "Kelola lapangan padel & tenis. Gambar diatur lewat seed.",
  queryKey: "admin-courts",
  addLabel: "Lapangan",
  list: () => apiGet<AdminCourt[]>("/courts"),
  idOf: (r) => r.id,
  columns: [
    { key: "name", label: "Nama" },
    { key: "code", label: "Kode" },
    { key: "type", label: "Jenis", render: (r) => pill(r.type === "paddle" ? "Padel" : "Tenis") },
    { key: "price_per_hour", label: "Harga/jam", render: (r) => money(r.price_per_hour) },
    { key: "capacity", label: "Kapasitas" },
    { key: "is_active", label: "Status", render: (r) => boolBadge(r.is_active) },
  ],
  fields: [
    { name: "name", label: "Nama", type: "text", required: true },
    { name: "code", label: "Kode unik", type: "text", required: true },
    {
      name: "type",
      label: "Jenis",
      type: "select",
      required: true,
      options: [
        { value: "paddle", label: "Padel" },
        { value: "tennis", label: "Tenis" },
      ],
    },
    { name: "price_per_hour", label: "Harga/jam (fallback)", type: "number", required: true },
    { name: "capacity", label: "Kapasitas", type: "number", required: true },
    { name: "is_indoor", label: "Indoor", type: "boolean" },
    { name: "facilities", label: "Fasilitas (pisahkan koma)", type: "csv", optional: true, placeholder: "Indoor, Hard court" },
    { name: "description", label: "Deskripsi", type: "textarea", optional: true },
    { name: "is_active", label: "Aktif", type: "boolean" },
    { name: "sort_order", label: "Urutan", type: "number" },
  ],
  defaults: { type: "paddle", capacity: 4, is_indoor: true, is_active: true, sort_order: 0, facilities: [] },
  toForm: (r) => ({
    name: r.name,
    code: r.code,
    type: r.type,
    price_per_hour: Number(r.price_per_hour),
    capacity: r.capacity,
    is_indoor: r.is_indoor,
    facilities: r.facilities,
    description: r.description ?? "",
    is_active: r.is_active,
    sort_order: r.sort_order,
  }),
  create: (body) => apiPost("/courts", body),
  update: (id, body) => apiPatch(`/courts/${id}`, body),
  remove: (id) => apiDelete(`/courts/${id}`),
  confirmDelete: (r) => `Nonaktifkan lapangan "${r.name}"?`,
};

export default function AdminCourtsPage() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">Admin</p>
      <h1 className="mt-2 mb-8 text-3xl font-semibold tracking-tight text-ink-900">Master Data</h1>
      <AdminResource config={config} />
    </div>
  );
}
