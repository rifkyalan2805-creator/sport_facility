/* eslint-disable @typescript-eslint/no-var-requires */
// Akun admin untuk panel /admin. Idempoten. Jalankan: node prisma/seed-admin.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const EMAIL = "admin@sporthub.test";
const PASSWORD = "admin12345";

async function main() {
  const password_hash = bcrypt.hashSync(PASSWORD, 10);
  const admin = await prisma.users.upsert({
    where: { email: EMAIL },
    update: { role: "admin", password_hash, is_active: true },
    create: {
      email: EMAIL,
      phone: "081100000001",
      full_name: "Admin SportHub",
      password_hash,
      role: "admin",
      is_active: true,
    },
  });
  console.log(`✅ Admin siap → ${admin.email} / ${PASSWORD} (role: ${admin.role})`);
}

main()
  .catch((e) => {
    console.error("Gagal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
