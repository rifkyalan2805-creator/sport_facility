/* eslint-disable @typescript-eslint/no-var-requires */
// Terapkan harga & jam tutup sesuai spesifikasi (Opsi 1). Idempoten.
// Jalankan: node prisma/apply-pricing.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // 1) Harga dasar court (nilai representatif untuk perhitungan booking).
  await prisma.courts.updateMany({ where: { type: "paddle" }, data: { price_per_hour: 200000 } });
  await prisma.courts.updateMany({ where: { type: "tennis" }, data: { price_per_hour: 175000 } });

  // 2) Jam tutup per segmen (court_schedules.close_time).
  await prisma.$executeRawUnsafe(
    `UPDATE court_schedules cs SET close_time = TIME '23:00', updated_at = NOW()
     FROM courts c WHERE cs.court_id = c.id AND c.type = 'paddle'`,
  );
  await prisma.$executeRawUnsafe(
    `UPDATE court_schedules cs SET close_time = TIME '22:00', updated_at = NOW()
     FROM courts c WHERE cs.court_id = c.id AND c.type = 'tennis'`,
  );

  // 3) HTM kolam (pool_ticket_types) — idempoten berdasarkan nama.
  const htm = await prisma.pool_ticket_types.findFirst({ where: { name: "HTM Kolam Renang" } });
  if (htm) {
    await prisma.pool_ticket_types.update({ where: { id: htm.id }, data: { price: 50000 } });
  } else {
    await prisma.pool_ticket_types.create({
      data: { name: "HTM Kolam Renang", price: 50000, age_min: 0, age_max: 99 },
    });
  }

  // 4) Konten daftar harga untuk halaman /harga (site_settings.pricing).
  const pricing = {
    tennis: {
      insidentil: { with_light: 175000, without_light: 155000 },
      abonemen: { with_light: 165000, without_light: 145000 },
      close_time: "22:00",
    },
    padel: {
      insidentil: 200000,
      off_peak: { price: 150000, window: "06:00–15:00" },
      close_time: "23:00",
    },
    pool: { htm_per_person: 50000, close_time: "20:30" },
  };
  await prisma.site_settings.upsert({
    where: { key: "pricing" },
    update: { value: pricing },
    create: {
      key: "pricing",
      value: pricing,
      description: "Daftar harga untuk halaman /harga",
      group_name: "pricing",
    },
  });

  console.log("✅ Pricing & jadwal diterapkan (courts, court_schedules, pool HTM, site_settings.pricing).");
}

main()
  .catch((e) => {
    console.error("Gagal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
