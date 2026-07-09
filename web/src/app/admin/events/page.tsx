"use client";

import { useMemo, useState } from "react";
import AdminResource, { type ResourceConfig } from "@/components/admin/AdminResource";
import { money, pill } from "@/components/admin/cells";
import { formatDateID } from "@/lib/format";
import { apiGet, apiPost, apiPatch } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { useEventCategories } from "@/lib/queries";

interface AdminEvent {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  description: string | null;
  banner_url: string | null;
  event_date: string;
  end_date: string | null;
  location: string | null;
  quota: number;
  registered_count: number;
  price: string;
  organizer_name: string | null;
  registration_deadline: string | null;
  status: string;
  event_categories?: { name: string; color: string | null } | null;
}

interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
}

const dt = (iso: string | null) => (iso ? iso.slice(0, 16) : "");

const categoriesConfig: ResourceConfig<AdminCategory> = {
  title: "Kategori Event",
  queryKey: "event-categories",
  addLabel: "Kategori",
  list: () => apiGet<AdminCategory[]>("/events/categories"),
  idOf: (r) => r.id,
  columns: [
    {
      key: "name",
      label: "Nama",
      render: (r) => (
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: r.color ?? "#6366f1" }} />
          {r.name}
        </span>
      ),
    },
    { key: "slug", label: "Slug", render: (r) => <span className="font-mono text-xs">{r.slug}</span> },
  ],
  fields: [
    { name: "name", label: "Nama", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", optional: true, help: "Kosongkan untuk auto." },
    { name: "color", label: "Warna (hex)", type: "text", optional: true, placeholder: "#6366f1" },
    { name: "icon", label: "Ikon", type: "text", optional: true },
  ],
  defaults: {},
  toForm: (r) => ({ name: r.name, slug: r.slug, color: r.color ?? "", icon: r.icon ?? "" }),
  create: (b) => apiPost("/events/categories", b),
  update: (id, b) => apiPatch(`/events/categories/${id}`, b),
};

function ScanTool() {
  const [qr, setQr] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onScan(e: React.FormEvent) {
    e.preventDefault();
    if (!qr.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const reg = await apiPost<{ status: string }>("/events/registrations/scan", { qr_code: qr.trim() });
      setMsg({ ok: true, text: `Check-in berhasil (status: ${reg.status}).` });
      setQr("");
    } catch (err) {
      setMsg({ ok: false, text: getErrorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-ink-900">Check-in Peserta (QR)</h2>
      <p className="mt-1 text-sm text-ink-500">Tempel kode QR registrasi untuk check-in.</p>
      <form onSubmit={onScan} className="mt-4 flex flex-wrap gap-2">
        <input
          value={qr}
          onChange={(e) => setQr(e.target.value)}
          placeholder="EVT-…"
          className="min-w-[240px] flex-1 rounded-xl border border-ink-900/15 px-3 py-2.5 font-mono text-sm outline-none focus:border-neon-purple"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neon-pink disabled:opacity-50"
        >
          {busy ? "…" : "Check-in"}
        </button>
      </form>
      {msg && (
        <p className={`mt-3 text-sm font-medium ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>
      )}
    </section>
  );
}

export default function AdminEventsPage() {
  const { data: categories = [] } = useEventCategories();
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories],
  );

  const eventsConfig = useMemo<ResourceConfig<AdminEvent>>(
    () => ({
      title: "Event",
      description: "Kelola event (draft, published, lampau). Buat dengan status 'published' agar tampil di /events.",
      queryKey: "admin-events",
      addLabel: "Event",
      list: () => apiGet<AdminEvent[]>("/events/all"),
      idOf: (r) => r.id,
      columns: [
        { key: "title", label: "Judul" },
        { key: "category", label: "Kategori", render: (r) => (r.event_categories ? pill(r.event_categories.name) : "—") },
        { key: "event_date", label: "Tanggal", render: (r) => formatDateID(r.event_date) },
        { key: "price", label: "Harga", render: (r) => (Number(r.price) <= 0 ? "Gratis" : money(r.price)) },
        { key: "kuota", label: "Kuota", render: (r) => `${r.registered_count}/${r.quota}` },
        { key: "status", label: "Status", render: (r) => pill(r.status) },
      ],
      fields: [
        { name: "category_id", label: "Kategori", type: "select", required: true, options: categoryOptions },
        { name: "title", label: "Judul", type: "text", required: true },
        { name: "slug", label: "Slug", type: "text", optional: true, help: "Kosongkan untuk auto." },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["draft", "published", "ongoing", "completed", "cancelled"].map((s) => ({ value: s, label: s })),
        },
        { name: "event_date", label: "Tanggal & jam", type: "datetime", required: true },
        { name: "registration_deadline", label: "Batas pendaftaran", type: "datetime", optional: true },
        { name: "end_date", label: "Selesai", type: "datetime", optional: true },
        { name: "location", label: "Lokasi", type: "text", optional: true },
        { name: "quota", label: "Kuota", type: "number", required: true },
        { name: "price", label: "Harga (0 = gratis)", type: "number" },
        { name: "organizer_name", label: "Penyelenggara", type: "text", optional: true },
        { name: "banner_url", label: "URL Banner", type: "text", optional: true, placeholder: "https://…" },
        { name: "description", label: "Deskripsi", type: "textarea", optional: true },
      ],
      defaults: { status: "published", price: 0, quota: 20 },
      toForm: (r) => ({
        category_id: r.category_id,
        title: r.title,
        slug: r.slug,
        status: r.status,
        event_date: dt(r.event_date),
        registration_deadline: dt(r.registration_deadline),
        end_date: dt(r.end_date),
        location: r.location ?? "",
        quota: r.quota,
        price: Number(r.price),
        organizer_name: r.organizer_name ?? "",
        banner_url: r.banner_url ?? "",
        description: r.description ?? "",
      }),
      create: (b) => apiPost("/events", b),
      update: (id, b) => apiPatch(`/events/${id}`, b),
    }),
    [categoryOptions],
  );

  return (
    <div className="space-y-14">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">Event</h1>
      </div>
      <AdminResource config={eventsConfig} />
      <AdminResource config={categoriesConfig} />
      <ScanTool />
    </div>
  );
}
