/* eslint-disable @typescript-eslint/no-var-requires */
// Seed paket abonemen tenis (sumber pilihan layanan pada form registrasi). Idempoten.
// Jalankan: node prisma/seed-abonemen-packages.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const packages = [
    {
      name: "Abonemen Tenis Bulanan (2x/minggu)",
      description: "8 sesi per bulan, 2 kali seminggu. Cocok untuk latihan rutin.",
      sessions_per_week: 2,
      duration_weeks: 4,
      price: 1040000, // ~8 sesi × 130.000
      valid_courts: ["tennis"],
    },
    {
      name: "Abonemen Tenis Bulanan (3x/minggu)",
      description: "12 sesi per bulan, 3 kali seminggu. Untuk peningkatan performa.",
      sessions_per_week: 3,
      duration_weeks: 4,
      price: 1500000, // ~12 sesi × 125.000
      valid_courts: ["tennis"],
    },
    {
      name: "Abonemen Tenis Triwulan (2x/minggu)",
      description: "24 sesi selama 3 bulan. Hemat untuk komitmen jangka panjang.",
      sessions_per_week: 2,
      duration_weeks: 12,
      price: 2880000, // ~24 sesi × 120.000
      valid_courts: ["tennis"],
    },
  ];

  for (const p of packages) {
    const existing = await prisma.abonemen_packages.findFirst({ where: { name: p.name } });
    if (existing) {
      await prisma.abonemen_packages.update({ where: { id: existing.id }, data: p });
    } else {
      await prisma.abonemen_packages.create({ data: p });
    }
  }

  console.log(`✅ Paket abonemen di-seed (${packages.length} paket tenis).`);
}

main()
  .catch((e) => {
    console.error("Gagal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
