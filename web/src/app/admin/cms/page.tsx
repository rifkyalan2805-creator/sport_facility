"use client";

import AdminResource, { type ResourceConfig } from "@/components/admin/AdminResource";
import { boolBadge, pill, thumb } from "@/components/admin/cells";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { formatDateID } from "@/lib/format";

const truncate = (s: string, n = 50) => (s.length > n ? s.slice(0, n) + "…" : s);

// Panduan ukuran gambar — tampil sebagai hint di form upload. Dua macam,
// karena perlakuannya memang beda:
//  - `full`  : cover berita tampil UTUH (object-contain), rasio apa pun aman.
//  - `crop`  : banner & galeri mengisi kotak berasio, sisi lebihnya terpotong.
// Keduanya diperkecil ke 1600 px di browser sebelum diunggah.
const IMG_HINT = {
  full: "Tampil utuh — rasio bebas, tidak dipotong. Sisi terpanjang idealnya 1600 px.",
  crop: "Rasio 16:9 (idealnya 1600×900 px) — sisi lebihnya terpotong, taruh objek penting di tengah.",
} as const;

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
interface News {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_url: string | null;
  cover_alt: string | null;
  cover_layout: string;
  category: string;
  author: string | null;
  status: string;
  published_at: string | null;
}

const banners: ResourceConfig<Banner> = {
  title: "Banner",
  queryKey: "cms-banners",
  addLabel: "Banner",
  list: () => apiGet<Banner[]>("/cms/banners"),
  idOf: (r) => r.id,
  columns: [
    { key: "image_url", label: "Gambar", render: (r) => thumb(r.image_url, r.title) },
    { key: "title", label: "Judul" },
    { key: "position", label: "Posisi", render: (r) => pill(r.position) },
    { key: "is_active", label: "Status", render: (r) => boolBadge(r.is_active) },
  ],
  fields: [
    { name: "title", label: "Judul", type: "text", required: true },
    { name: "subtitle", label: "Subjudul", type: "text", optional: true },
    { name: "image_url", label: "Gambar", type: "image", required: true, placeholder: IMG_HINT.crop },
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
    { key: "image_url", label: "Foto", render: (r) => thumb(r.image_url, r.alt_text ?? "") },
    { key: "title", label: "Judul", render: (r) => r.title ?? "—" },
    { key: "category", label: "Kategori", render: (r) => pill(r.category) },
    { key: "is_active", label: "Status", render: (r) => boolBadge(r.is_active) },
  ],
  fields: [
    { name: "title", label: "Judul", type: "text", optional: true },
    { name: "image_url", label: "Gambar", type: "image", required: true, placeholder: IMG_HINT.crop },
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

const news: ResourceConfig<News> = {
  title: "Berita",
  description:
    "Tampil di halaman publik /berita. Hanya status “published” yang terlihat pengunjung — draft aman untuk disiapkan lebih dulu.",
  queryKey: "cms-news",
  addLabel: "Berita",
  list: () => apiGet<News[]>("/cms/news"),
  idOf: (r) => r.id,
  columns: [
    { key: "cover_url", label: "Cover", render: (r) => thumb(r.cover_url, r.cover_alt ?? r.title) },
    { key: "title", label: "Judul", render: (r) => truncate(r.title, 44) },
    { key: "category", label: "Kategori", render: (r) => pill(r.category) },
    { key: "status", label: "Status", render: (r) => pill(r.status) },
    {
      key: "published_at",
      label: "Terbit",
      render: (r) => (r.published_at ? formatDateID(r.published_at) : "—"),
    },
  ],
  fields: [
    { name: "title", label: "Judul", type: "text", required: true },
    {
      name: "slug",
      label: "Slug",
      type: "text",
      optional: true,
      placeholder: "turnamen-padel-2026",
      help: "Alamat halaman: /berita/<slug>. Kosongkan untuk dibuat otomatis dari judul.",
    },
    {
      name: "cover_url",
      label: "Cover",
      type: "image",
      optional: true,
      placeholder: IMG_HINT.full,
      orientationField: "cover_layout", // isi saran tata letak dari berkasnya
    },
    {
      name: "cover_layout",
      label: "Tata letak cover",
      type: "select",
      required: true, // cegah opsi kosong "— pilih —" terkirim → 422 dari Zod
      options: [
        { value: "landscape", label: "Melebar — teks di bawah gambar" },
        { value: "portrait", label: "Bersanding — gambar tinggi, teks di sampingnya" },
      ],
      help: "Terisi otomatis dari gambar yang kamu unggah; ubah kalau mau susunan lain. Hanya berlaku di kartu sorotan (berita terbaru).",
    },
    {
      name: "cover_alt",
      label: "Alt text cover",
      type: "text",
      optional: true,
      help: "Deskripsi singkat gambar untuk pembaca layar & saat gambar gagal dimuat.",
    },
    {
      name: "excerpt",
      label: "Ringkasan",
      type: "textarea",
      optional: true,
      rows: 3,
      help: "1–2 kalimat yang tampil di kartu daftar berita. Kosong → diambil dari awal isi.",
    },
    { name: "content", label: "Isi berita", type: "textarea", required: true, rows: 10, help: "Pisahkan paragraf dengan baris kosong." },
    { name: "category", label: "Kategori", type: "text", placeholder: "umum" },
    { name: "author", label: "Penulis", type: "text", optional: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: ["draft", "published", "archived"].map((s) => ({ value: s, label: s })),
      help: "Tanggal terbit terisi otomatis saat pertama kali dipublikasikan.",
    },
  ],
  defaults: { category: "umum", status: "draft", cover_layout: "landscape" },
  toForm: (r) => ({
    title: r.title,
    slug: r.slug,
    cover_url: r.cover_url ?? "",
    cover_layout: r.cover_layout,
    cover_alt: r.cover_alt ?? "",
    excerpt: r.excerpt ?? "",
    content: r.content,
    category: r.category,
    author: r.author ?? "",
    status: r.status,
  }),
  create: (b) => apiPost("/cms/news", b),
  update: (id, b) => apiPatch(`/cms/news/${id}`, b),
  remove: (id) => apiDelete(`/cms/news/${id}`),
  confirmDelete: (r) => `Hapus berita “${r.title}”? Tindakan ini permanen.`,
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
      {/* Berita ditaruh paling atas: satu-satunya konten yang rutin ditambah,
          sisanya cenderung sekali set lalu jarang disentuh. */}
      <AdminResource config={news} />
      <AdminResource config={banners} />
      <AdminResource config={faqs} />
      <AdminResource config={galleries} />
      <AdminResource config={pages} />
    </div>
  );
}
