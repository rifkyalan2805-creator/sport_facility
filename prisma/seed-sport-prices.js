/* eslint-disable @typescript-eslint/no-var-requires */
// Migrasi harga per-sport ke tabel relational (Fase 1). Idempoten.
// Jalankan: node prisma/seed-sport-prices.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const t = (hhmm) => new Date(`1970-01-01T${hhmm}:00.000Z`);

async function main() {
  // Tenis: 4 baris (insidentil/abonemen × dengan/tanpa lampu).
  const tennis = [
    { booking_type: "insidentil", with_light: true, price: 175000, sort_order: 1 },
    { booking_type: "insidentil", with_light: false, price: 155000, sort_order: 2 },
    { booking_type: "abonemen", with_light: true, price: 165000, sort_order: 3 },
    { booking_type: "abonemen", with_light: false, price: 145000, sort_order: 4 },
  ];
  for (const row of tennis) {
    await prisma.tennis_prices.upsert({
      where: { booking_type_with_light: { booking_type: row.booking_type, with_light: row.with_light } },
      update: { price: row.price, sort_order: row.sort_order },
      create: row,
    });
  }

  // Padel: normal + off-peak (06:00–15:00).
  const padel = [
    { label: "normal", price: 200000, time_start: null, time_end: null, sort_order: 1 },
    { label: "off_peak", price: 150000, time_start: t("06:00"), time_end: t("15:00"), sort_order: 2 },
  ];
  for (const row of padel) {
    const existing = await prisma.padel_prices.findFirst({ where: { label: row.label } });
    if (existing) await prisma.padel_prices.update({ where: { id: existing.id }, data: row });
    else await prisma.padel_prices.create({ data: row });
  }

  console.log("✅ Harga per-sport dimigrasi (tennis_prices 4 baris, padel_prices 2 baris).");
}

main()
  .catch((e) => {
    console.error("Gagal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
