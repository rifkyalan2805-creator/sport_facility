/* eslint-disable @typescript-eslint/no-var-requires */
// Tahap 0 modul pool: config promo grup + sesi kolam + tipe tiket HTM. Idempoten.
// Jalankan: node prisma/seed-pool.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const OPEN = new Date("1970-01-01T06:00:00.000Z");
const CLOSE = new Date("1970-01-01T20:30:00.000Z");
const CAPACITY = 100;
const DAYS = 14; // sesi harian 2 minggu ke depan

// "YYYY-MM-DD" (tanggal lokal) -> Date pada tengah malam UTC (kolom @db.Date).
function ymdToDate(y, m, d) {
  return new Date(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T00:00:00.000Z`);
}

async function main() {
  // 1) Config promo grup (site_settings, tanpa schema change).
  await prisma.site_settings.upsert({
    where: { key: "pool_group_discount" },
    update: {
      value: { tiers: [
        { minQty: 15, percent: 10 },
        { minQty: 30, percent: 12.5 },
        { minQty: 50, percent: 20 },
      ] },
    },
    create: {
      key: "pool_group_discount",
      group_name: "pricing",
      description: "Diskon grup tiket kolam berdasarkan jumlah orang dalam 1 transaksi.",
      value: { tiers: [
        { minQty: 15, percent: 10 },
        { minQty: 30, percent: 12.5 },
        { minQty: 50, percent: 20 },
      ] },
    },
  });
  console.log("  ✓ site_settings.pool_group_discount (15→10%, 30→12.5%, 50→20%)");

  // 2) Tipe tiket HTM (pastikan ada & aktif).
  const existingType = await prisma.pool_ticket_types.findFirst({ where: { name: "HTM Kolam Renang" } });
  if (existingType) {
    await prisma.pool_ticket_types.update({
      where: { id: existingType.id },
      data: { price: 50000, age_min: 0, age_max: 99, is_active: true },
    });
  } else {
    await prisma.pool_ticket_types.create({
      data: { name: "HTM Kolam Renang", price: 50000, age_min: 0, age_max: 99, is_active: true },
    });
  }
  console.log("  ✓ pool_ticket_types: HTM Kolam Renang Rp50.000 (aktif)");

  // 3) Sesi kolam harian, capacity 100, open, 06:00–20:30 (2 minggu ke depan).
  const today = new Date();
  let created = 0;
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const sessionDate = ymdToDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
    const name = "Sesi Reguler Kolam";

    const exists = await prisma.pool_sessions.findFirst({
      where: { name, session_date: sessionDate },
    });
    if (exists) {
      await prisma.pool_sessions.update({
        where: { id: exists.id },
        data: { capacity: CAPACITY, start_time: OPEN, end_time: CLOSE, status: "open" },
      });
    } else {
      await prisma.pool_sessions.create({
        data: {
          name,
          session_date: sessionDate,
          start_time: OPEN,
          end_time: CLOSE,
          capacity: CAPACITY,
          status: "open",
        },
      });
      created++;
    }
  }
  console.log(`  ✓ pool_sessions: ${DAYS} sesi (capacity ${CAPACITY}, 06:00–20:30), ${created} baru`);

  console.log("✅ Tahap 0 pool selesai.");
}

main()
  .catch((e) => {
    console.error("Gagal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
