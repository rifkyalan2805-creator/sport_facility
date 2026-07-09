"use client";

import AdminResource, { type ResourceConfig } from "@/components/admin/AdminResource";
import { boolBadge, pill } from "@/components/admin/cells";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";

const truncate = (s: string, n = 50) => (s.length > n ? s.slice(0, n) + "…" : s);

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  position: string;
  is_active: boolean;
  sort_order: number;
}
interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  sort_order: number;
}
interface Gallery {
  id: string;
  title: string | null;
  image_url: string;
  category: string;
  alt_text: string | null;
  is_active: boolean;
  sort_order: number;
}
interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_title: string | null;
  meta_desc: string | null;
  status: string;
}

const banners: ResourceConfig<Banner> = {
  title: "Banner",
  queryKey: "cms-banners",
  addLabel: "Banner",
  list: () => apiGet<Banner[]>("/cms/banners"),
  idOf: (r) => r.id,
  columns: [
    { key: "title", label: "Judul" },
    { key: "position", label: "Posisi", render: (r) => pill(r.position) },
    { key: "is_active", label: "Status", render: (r) => boolBadge(r.is_active) },
  ],
  fields: [
    { name: "title", label: "Judul", type: "text", required: true },
    { name: "subtitle", label: "Subjudul", type: "text", optional: true },
    { name: "image_url", label: "URL Gambar", type: "text", required: true, placeholder: "https://…", help: "Harus URL lengkap." },
    { name: "link_url", label: "URL Tautan", type: "text", optional: true, placeholder: "https://…" },
    { name: "position", label: "Posisi", type: "text", placeholder: "hero" },
    { name: "is_active", label: "Aktif", type: "boolean" },
    { name: "sort_order", label: "Urutan", type: "number" },
  ],
  defaults: { position: "hero", is_active: true, sort_order: 0 },
  toForm: (r) => ({
    title: r.title,
    subtitle: r.subtitle ?? "",
    image_url: r.image_url,
    link_url: r.link_url ?? "",
    position: r.position,
    is_active: r.is_active,
    sort_order: r.sort_order,
  }),
  create: (b) => apiPost("/cms/banners", b),
  update: (id, b) => apiPatch(`/cms/banners/${id}`, b),
  remove: (id) => apiDelete(`/cms/banners/${id}`),
};

const faqs: ResourceConfig<Faq> = {
  title: "FAQ",
  queryKey: "cms-faqs",
  addLabel: "FAQ",
  list: () => apiGet<Faq[]>("/cms/faqs"),
  idOf: (r) => r.id,
  columns: [
    { key: "question", label: "Pertanyaan", render: (r) => truncate(r.question) },
    { key: "category", label: "Kategori", render: (r) => pill(r.category) },
    { key: "is_active", label: "Status", render: (r) => boolBadge(r.is_active) },
  ],
  fields: [
    { name: "question", label: "Pertanyaan", type: "textarea", required: true },
    { name: "answer", label: "Jawaban", type: "textarea", required: true },
    { name: "category", label: "Kategori", type: "text", placeholder: "general" },
    { name: "is_active", label: "Aktif", type: "boolean" },
    { name: "sort_order", label: "Urutan", type: "number" },
  ],
  defaults: { category: "general", is_active: true, sort_order: 0 },
  toForm: (r) => ({
    question: r.question,
    answer: r.answer,
    category: r.category,
    is_active: r.is_active,
    sort_order: r.sort_order,
  }),
  create: (b) => apiPost("/cms/faqs", b),
  update: (id, b) => apiPatch(`/cms/faqs/${id}`, b),
  remove: (id) => apiDelete(`/cms/faqs/${id}`),
};

const galleries: ResourceConfig<Gallery> = {
  title: "Galeri",
  queryKey: "cms-galleries",
  addLabel: "Foto",
  list: () => apiGet<Gallery[]>("/cms/galleries"),
  idOf: (r) => r.id,
  columns: [
    { key: "title", label: "Judul", render: (r) => r.title ?? "—" },
    { key: "category", label: "Kategori", render: (r) => pill(r.category) },
    { key: "is_active", label: "Status", render: (r) => boolBadge(r.is_active) },
  ],
  fields: [
    { name: "title", label: "Judul", type: "text", optional: true },
    { name: "image_url", label: "URL Gambar", type: "text", required: true, placeholder: "https://…" },
    { name: "category", label: "Kategori", type: "text", placeholder: "facility" },
    { name: "alt_text", label: "Alt text", type: "text", optional: true },
    { name: "is_active", label: "Aktif", type: "boolean" },
    { name: "sort_order", label: "Urutan", type: "number" },
  ],
  defaults: { category: "facility", is_active: true, sort_order: 0 },
  toForm: (r) => ({
    title: r.title ?? "",
    image_url: r.image_url,
    category: r.category,
    alt_text: r.alt_text ?? "",
    is_active: r.is_active,
    sort_order: r.sort_order,
  }),
  create: (b) => apiPost("/cms/galleries", b),
  update: (id, b) => apiPatch(`/cms/galleries/${id}`, b),
  remove: (id) => apiDelete(`/cms/galleries/${id}`),
};

const pages: ResourceConfig<Page> = {
  title: "Halaman",
  description: "Halaman statis (tentang, syarat, dll). Tanpa hapus — arsipkan via status.",
  queryKey: "cms-pages",
  addLabel: "Halaman",
  list: () => apiGet<Page[]>("/cms/pages"),
  idOf: (r) => r.id,
  columns: [
    { key: "title", label: "Judul" },
    { key: "slug", label: "Slug", render: (r) => <span className="font-mono text-xs">{r.slug}</span> },
    { key: "status", label: "Status", render: (r) => pill(r.status) },
  ],
  fields: [
    { name: "title", label: "Judul", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", optional: true, help: "Kosongkan untuk auto." },
    { name: "content", label: "Konten", type: "textarea", required: true },
    { name: "meta_title", label: "Meta title", type: "text", optional: true },
    { name: "meta_desc", label: "Meta description", type: "textarea", optional: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["draft", "published", "archived"].map((s) => ({ value: s, label: s })),
    },
  ],
  defaults: { status: "draft" },
  toForm: (r) => ({
    title: r.title,
    slug: r.slug,
    content: r.content,
    meta_title: r.meta_title ?? "",
    meta_desc: r.meta_desc ?? "",
    status: r.status,
  }),
  create: (b) => apiPost("/cms/pages", b),
  update: (id, b) => apiPatch(`/cms/pages/${id}`, b),
};

export default function AdminCmsPage() {
  return (
    <div className="space-y-14">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">Konten (CMS)</h1>
      </div>
      <AdminResource config={banners} />
      <AdminResource config={faqs} />
      <AdminResource config={galleries} />
      <AdminResource config={pages} />
    </div>
  );
}
