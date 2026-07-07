/* eslint-disable @typescript-eslint/no-var-requires */
// 3 lapangan padel (Blue/Pink/Green) + jadwal 06:00–23:00 + gambar warna. Idempoten.
// Gambar: web/public/images/sport club/Padle Court/. Jalankan:
//   node prisma/seed-padel-courts.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const OPEN = new Date("1970-01-01T06:00:00.000Z");
const CLOSE = new Date("1970-01-01T23:00:00.000Z");

const courts = [
  { code: "PDL-A", name: "Padel Court 1 · Blue", image: "/images/sport club/Padle Court/Blue Court .jpeg", sort: 1 },
  { code: "PDL-B", name: "Padel Court 2 · Pink", image: "/images/sport club/Padle Court/pink Court .jpeg", sort: 2 },
  { code: "PDL-C", name: "Padel Court 3 · Green", image: "/images/sport club/Padle Court/Green Court .jpeg", sort: 3 },
];

const base = {
  type: "paddle",
  price_per_hour: 200000,
  capacity: 4,
  is_indoor: true,
  facilities: ["Indoor", "Pencahayaan LED", "Rumput sintetis"],
  description: "Rumput sintetis premium",
  is_active: true,
};

async function main() {
  for (const c of courts) {
    const court = await prisma.courts.upsert({
      where: { code: c.code },
      update: {
        name: c.name,
        image_url: c.image,
        sort_order: c.sort,
        is_active: true,
        facilities: base.facilities,
        description: base.description,
      },
      create: { code: c.code, name: c.name, image_url: c.image, sort_order: c.sort, ...base },
    });

    // 7 jadwal (0=Minggu .. 6=Sabtu), 06:00–23:00.
    for (let d = 0; d < 7; d++) {
      await prisma.court_schedules.upsert({
        where: { court_id_day_of_week: { court_id: court.id, day_of_week: d } },
        update: { open_time: OPEN, close_time: CLOSE, is_holiday_closed: false },
        create: { court_id: court.id, day_of_week: d, open_time: OPEN, close_time: CLOSE, is_holiday_closed: false },
      });
    }
    console.log(`  ✓ ${c.code} → ${c.name}`);
  }
  console.log("✅ 3 padel court + jadwal + gambar warna siap.");
}

main()
  .catch((e) => {
    console.error("Gagal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
