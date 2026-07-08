/* eslint-disable @typescript-eslint/no-var-requires */
// 2 lapangan tennis + jadwal 06:00–22:00 + gambar. Idempoten.
// Gambar: web/public/images/sport club/Tennis Court/. Jalankan:
//   node prisma/seed-tennis-courts.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const OPEN = new Date("1970-01-01T06:00:00.000Z");
const CLOSE = new Date("1970-01-01T22:00:00.000Z");

const courts = [
  { code: "TNS-1", name: "Tennis Court 1", image: "/images/sport club/Tennis Court/Tennis Court 1.jpeg", sort: 1 },
  { code: "TNS-2", name: "Tennis Court 2", image: "/images/sport club/Tennis Court/Tennis Court 2.jpeg", sort: 2 },
];

const base = {
  type: "tennis",
  price_per_hour: 175000, // fallback; harga riil dari tennis_prices (insidentil/abonemen × lampu)
  capacity: 4,
  is_indoor: true,
  facilities: ["Indoor", "Hard court", "Pencahayaan LED"],
  description: "Hard court profesional",
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
        price_per_hour: base.price_per_hour,
      },
      create: { code: c.code, name: c.name, image_url: c.image, sort_order: c.sort, ...base },
    });

    // 7 jadwal (0=Minggu .. 6=Sabtu), 06:00–22:00.
    for (let d = 0; d < 7; d++) {
      await prisma.court_schedules.upsert({
        where: { court_id_day_of_week: { court_id: court.id, day_of_week: d } },
        update: { open_time: OPEN, close_time: CLOSE, is_holiday_closed: false },
        create: { court_id: court.id, day_of_week: d, open_time: OPEN, close_time: CLOSE, is_holiday_closed: false },
      });
    }
    console.log(`  ✓ ${c.code} → ${c.name}`);
  }
  console.log("✅ 2 tennis court + jadwal + gambar siap.");
}

main()
  .catch((e) => {
    console.error("Gagal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
