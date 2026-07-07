/* eslint-disable @typescript-eslint/no-var-requires */
// Wiring aset gambar & info permukaan ke courts (image_url masih null). Idempoten.
// Gambar sudah tersedia di web/public/images/sport club/. Jalankan:
//   node prisma/seed-court-media.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// code court → media/info. Path relatif ke folder public frontend.
// Catatan: lapangan PADEL kini di-seed oleh prisma/seed-padel-courts.js
// (3 court Blue/Pink/Green). File ini fokus ke court non-padel.
const media = {
  "TNS-1": {
    image_url: "/images/sport club/Tennis/tennis 1.jpg",
    description: "Hard court profesional",
    facilities: ["Indoor", "Hard court"],
  },
};

async function main() {
  let updated = 0;
  for (const [code, data] of Object.entries(media)) {
    const court = await prisma.courts.findUnique({ where: { code } });
    if (!court) {
      console.warn(`  ⚠ court ${code} tidak ada — dilewati`);
      continue;
    }
    await prisma.courts.update({ where: { code }, data });
    updated++;
  }
  console.log(`✅ Media court diperbarui (${updated} court).`);
}

main()
  .catch((e) => {
    console.error("Gagal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
