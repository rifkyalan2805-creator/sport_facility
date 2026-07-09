"use client";

import AdminResource, { type ResourceConfig } from "@/components/admin/AdminResource";
import { money, boolBadge, pill } from "@/components/admin/cells";
import { formatDateID } from "@/lib/format";
import { apiGet, apiPost, apiPatch } from "@/lib/api";

interface AdminSession {
  id: string;
  name: string;
  session_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
  status: string;
  notes: string | null;
}

interface AdminTicketType {
  id: string;
  name: string;
  price: string;
  age_min: number;
  age_max: number;
  is_active: boolean;
}

const t = (iso: string) => iso.slice(11, 16);

const sessions: ResourceConfig<AdminSession> = {
  title: "Sesi Kolam",
  description: "Jadwal sesi renang + kapasitas.",
  queryKey: "admin-pool-sessions",
  addLabel: "Sesi",
  list: () => apiGet<AdminSession[]>("/pool/sessions"),
  idOf: (r) => r.id,
  columns: [
    { key: "name", label: "Nama" },
    { key: "session_date", label: "Tanggal", render: (r) => formatDateID(r.session_date) },
    { key: "time", label: "Jam", render: (r) => `${t(r.start_time)}–${t(r.end_time)}` },
    { key: "kuota", label: "Kuota", render: (r) => `${r.booked_count}/${r.capacity}` },
    { key: "status", label: "Status", render: (r) => pill(r.status) },
  ],
  fields: [
    { name: "name", label: "Nama", type: "text", required: true },
    { name: "session_date", label: "Tanggal", type: "date", required: true },
    { name: "start_time", label: "Jam mulai", type: "time", required: true },
    { name: "end_time", label: "Jam selesai", type: "time", required: true },
    { name: "capacity", label: "Kapasitas", type: "number", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["open", "full", "closed", "cancelled"].map((s) => ({ value: s, label: s })),
    },
    { name: "notes", label: "Catatan", type: "textarea", optional: true },
  ],
  defaults: { capacity: 100, status: "open" },
  toForm: (r) => ({
    name: r.name,
    session_date: r.session_date.slice(0, 10),
    start_time: t(r.start_time),
    end_time: t(r.end_time),
    capacity: r.capacity,
    status: r.status,
    notes: r.notes ?? "",
  }),
  create: (body) => apiPost("/pool/sessions", body),
  update: (id, body) => apiPatch(`/pool/sessions/${id}`, body),
};

const ticketTypes: ResourceConfig<AdminTicketType> = {
  title: "Tipe Tiket (HTM)",
  description: "Harga tiket masuk kolam per kelompok usia.",
  queryKey: "admin-pool-tickettypes",
  addLabel: "Tipe Tiket",
  list: () => apiGet<AdminTicketType[]>("/pool/ticket-types"),
  idOf: (r) => r.id,
  columns: [
    { key: "name", label: "Nama" },
    { key: "price", label: "Harga", render: (r) => money(r.price) },
    { key: "usia", label: "Usia", render: (r) => `${r.age_min}–${r.age_max} th` },
    { key: "is_active", label: "Status", render: (r) => boolBadge(r.is_active) },
  ],
  fields: [
    { name: "name", label: "Nama", type: "text", required: true },
    { name: "price", label: "Harga", type: "number", required: true },
    { name: "age_min", label: "Usia min", type: "number" },
    { name: "age_max", label: "Usia max", type: "number" },
    { name: "is_active", label: "Aktif", type: "boolean" },
  ],
  defaults: { age_min: 0, age_max: 99, is_active: true },
  toForm: (r) => ({
    name: r.name,
    price: Number(r.price),
    age_min: r.age_min,
    age_max: r.age_max,
    is_active: r.is_active,
  }),
  create: (body) => apiPost("/pool/ticket-types", body),
  update: (id, body) => apiPatch(`/pool/ticket-types/${id}`, body),
};

export default function AdminPoolPage() {
  return (
    <div className="space-y-12">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">Kolam Renang</h1>
      </div>
      <AdminResource config={sessions} />
      <AdminResource config={ticketTypes} />
    </div>
  );
}
