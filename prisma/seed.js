/* eslint-disable @typescript-eslint/no-var-requires */
// Seed data awal. Idempoten (pakai upsert) → aman dijalankan berulang.
// Jalankan: npx prisma db seed
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const t = (hhmm) => new Date(`1970-01-01T${hhmm}:00.000Z`);

async function main() {
  // ---- site_settings ----
  const settings = [
    ['operating_hours', { open: '06:00', close: '22:00' }, 'Jam operasional fasilitas', 'general'],
    ['booking_rules', { max_advance_days: 30, min_hours: 1 }, 'Aturan booking lapangan', 'booking'],
    ['point_earn_rate', { per_10000: 1 }, '1 poin per Rp10.000 transaksi', 'general'],
    ['payment_expiry', { minutes: 30 }, 'Batas waktu pembayaran pending', 'payment'],
    ['cancellation_rule', { hours_before: 2 }, 'Minimal 2 jam sebelum untuk cancel', 'booking'],
  ];
  for (const [key, value, description, group_name] of settings) {
    await prisma.site_settings.upsert({ where: { key }, update: { value }, create: { key, value, description, group_name } });
  }

  // ---- payment_methods ----
  const methods = [
    ['QRIS', 'QRIS', 'Dummy', 'qris', 0.7, 0, 1],
    ['Transfer BCA', 'BCA_VA', 'Dummy', 'bank_transfer', 0, 4000, 2],
    ['GoPay', 'GOPAY', 'Dummy', 'ewallet', 2.0, 0, 3],
    ['Tunai / Kasir', 'CASH', null, 'cash', 0, 0, 9],
  ];
  for (const [name, code, provider, type, fee_percent, fee_flat, sort_order] of methods) {
    await prisma.payment_methods.upsert({
      where: { code },
      update: {},
      create: { name, code, provider, type, fee_percent, fee_flat, sort_order },
    });
  }

  // ---- membership_plans ----
  const plans = [
    ['Basic', 'basic', 150000, 30, 4, 5, ['Diskon 5% booking', 'Akses loker']],
    ['Silver', 'silver', 350000, 30, 8, 10, ['Diskon 10% booking', 'Free 1x pool/bulan']],
    ['Gold', 'gold', 650000, 30, 15, 15, ['Diskon 15% booking', 'Free 4x pool/bulan']],
    ['Platinum', 'platinum', 1200000, 30, 0, 20, ['Unlimited booking', 'Unlimited pool']],
  ];
  for (const [name, slug, price, duration_days, max_bookings_month, discount_percent, benefits] of plans) {
    await prisma.membership_plans.upsert({
      where: { slug },
      update: {},
      create: { name, slug, price, duration_days, max_bookings_month, discount_percent, benefits },
    });
  }

  // ---- event_categories ----
  const cats = [
    ['Turnamen', 'turnamen', '#ef4444'],
    ['Fun & Game', 'fun-game', '#f97316'],
    ['Workshop', 'workshop', '#6366f1'],
    ['Kelas Renang', 'kelas-renang', '#0ea5e9'],
    ['Seminar', 'seminar', '#8b5cf6'],
  ];
  for (const [name, slug, color] of cats) {
    await prisma.event_categories.upsert({ where: { slug }, update: {}, create: { name, slug, color } });
  }

  // ---- courts (hanya paddle & tennis) + jadwal 06:00-22:00 tiap hari ----
  const courts = [
    ['Padel Court A', 'PDL-A', 'paddle', 150000, 4],
    ['Padel Court B', 'PDL-B', 'paddle', 150000, 4],
    ['Tennis Court 1', 'TNS-1', 'tennis', 120000, 4],
  ];
  for (const [name, code, type, price_per_hour, capacity] of courts) {
    const court = await prisma.courts.upsert({
      where: { code },
      update: {},
      create: { name, code, type, price_per_hour, capacity },
    });
    for (let d = 0; d <= 6; d++) {
      await prisma.court_schedules.upsert({
        where: { court_id_day_of_week: { court_id: court.id, day_of_week: d } },
        update: {},
        create: { court_id: court.id, day_of_week: d, open_time: t('06:00'), close_time: t('22:00') },
      });
    }
  }

  // ---- users: admin + member demo ----
  await prisma.users.upsert({
    where: { email: 'admin@sportfacility.test' },
    update: {},
    create: {
      email: 'admin@sportfacility.test',
      phone: '08110000001',
      full_name: 'Admin Utama',
      password_hash: await bcrypt.hash('Admin#12345', 10),
      role: 'admin',
      email_verified: true,
    },
  });
  await prisma.users.upsert({
    where: { email: 'member@sportfacility.test' },
    update: {},
    create: {
      email: 'member@sportfacility.test',
      phone: '08110000002',
      full_name: 'Member Demo',
      password_hash: await bcrypt.hash('Member#12345', 10),
      role: 'member',
      email_verified: true,
    },
  });

  console.log('✅ Seed selesai: settings, payment_methods, membership_plans, event_categories, 3 courts (paddle/tennis), admin & member demo.');
}

main()
  .catch((e) => {
    console.error('Seed gagal:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
