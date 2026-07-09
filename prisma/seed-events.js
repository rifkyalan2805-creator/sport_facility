/* eslint-disable @typescript-eslint/no-var-requires */
// Seed event (2 gratis + 3 berbayar), published, banner reuse gambar sport-club. Idempoten.
// Jalankan: node prisma/seed-events.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const day = (n) => new Date(Date.now() + n * 86400000);

// category name → detail event
const EVENTS = [
  {
    category: "Turnamen",
    title: "Turnamen Padel Amatir Cup",
    slug: "turnamen-padel-amatir-cup",
    description: "Turnamen padel terbuka untuk pemain amatir. Sistem gugur, hadiah menarik.",
    banner_url: "/images/sport club/padel/paddle 5.jpg",
    location: "Padel Court A & B",
    price: 150000,
    quota: 32,
    organizer_name: "SportHub Community",
    inDays: 21,
  },
  {
    category: "Fun & Game",
    title: "Fun Swim & BBQ Night",
    slug: "fun-swim-bbq-night",
    description: "Renang santai bersama komunitas dilanjutkan BBQ di tepi kolam. Gratis!",
    banner_url: "/images/sport club/swimming pools/swimming 4.jpg",
    location: "Olympic Pool",
    price: 0,
    quota: 50,
    organizer_name: "SportHub",
    inDays: 10,
  },
  {
    category: "Workshop",
    title: "Workshop Teknik Servis Tenis",
    slug: "workshop-teknik-servis-tenis",
    description: "Pelatihan servis tenis bersama pelatih bersertifikat. Kuota terbatas.",
    banner_url: "/images/sport club/Tennis/tennis 3.jpg",
    location: "Tennis Court 1",
    price: 100000,
    quota: 20,
    organizer_name: "Coach Rendy",
    inDays: 14,
  },
  {
    category: "Kelas Renang",
    title: "Kelas Renang Anak (Pemula)",
    slug: "kelas-renang-anak-pemula",
    description: "Kelas renang dasar untuk anak usia 5–10 tahun. Gratis untuk member.",
    banner_url: "/images/sport club/swimming pools/swimming 5.jpg",
    location: "Leisure Pool",
    price: 0,
    quota: 15,
    organizer_name: "SportHub Aquatic",
    inDays: 7,
  },
  {
    category: "Seminar",
    title: "Seminar Nutrisi untuk Atlet",
    slug: "seminar-nutrisi-atlet",
    description: "Bahas pola makan & recovery untuk performa optimal bersama ahli gizi olahraga.",
    banner_url: "/images/sport club/Tennis/tennis 5.jpg",
    location: "Function Hall",
    price: 75000,
    quota: 40,
    organizer_name: "Nutritionist Dinda",
    inDays: 28,
  },
];

async function main() {
  const cats = await prisma.event_categories.findMany({ select: { id: true, name: true } });
  const byName = new Map(cats.map((c) => [c.name, c.id]));

  for (const e of EVENTS) {
    const category_id = byName.get(e.category);
    if (!category_id) {
      console.warn(`  ⚠ kategori "${e.category}" tidak ada — dilewati`);
      continue;
    }
    const event_date = day(e.inDays);
    const registration_deadline = day(e.inDays - 2);
    const data = {
      category_id,
      title: e.title,
      description: e.description,
      banner_url: e.banner_url,
      event_date,
      location: e.location,
      quota: e.quota,
      price: e.price,
      organizer_name: e.organizer_name,
      registration_deadline,
      status: "published",
    };
    await prisma.events.upsert({
      where: { slug: e.slug },
      update: data,
      create: { slug: e.slug, ...data },
    });
    console.log(`  ✓ ${e.title} — ${e.price === 0 ? "GRATIS" : "Rp" + e.price.toLocaleString("id-ID")}`);
  }
  console.log(`✅ ${EVENTS.length} event di-seed (published).`);
}

main()
  .catch((e) => {
    console.error("Gagal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
