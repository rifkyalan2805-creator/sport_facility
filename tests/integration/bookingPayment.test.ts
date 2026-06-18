import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/prisma';
import { timeToDate } from '../../src/utils/time';

/**
 * E2E: register → booking → payment → simulate success/failure.
 * Membutuhkan PostgreSQL test (DATABASE_URL). Schema di-push oleh globalSetup.
 */
const app = createApp();
const api = () => request(app);

const BOOKING_DATE = '2999-06-20';
const DAY_OF_WEEK = new Date(`${BOOKING_DATE}T00:00:00Z`).getUTCDay();
const unique = Date.now();

let token: string;
let userId: string;
let courtId: string;

beforeAll(async () => {
  // Seed court + schedule langsung (pembuatan court butuh role admin).
  const court = await prisma.courts.create({
    data: {
      name: 'IT Court',
      code: `IT-${unique}`,
      type: 'paddle',
      price_per_hour: 100000,
      court_schedules: {
        create: {
          day_of_week: DAY_OF_WEEK,
          open_time: timeToDate('06:00'),
          close_time: timeToDate('22:00'),
        },
      },
    },
  });
  courtId = court.id;

  const res = await api()
    .post('/api/v1/auth/register')
    .send({
      email: `it-${unique}@test.com`,
      phone: `0812${unique}`.slice(0, 15),
      full_name: 'Integration Tester',
      password: 'password123',
    });
  expect(res.status).toBe(201);
  token = res.body.data.accessToken;
  userId = res.body.data.user.id;
});

afterAll(async () => {
  // Bersihkan dalam urutan aman FK.
  try {
    await prisma.payments.deleteMany({ where: { user_id: userId } });
    await prisma.bookings.deleteMany({ where: { user_id: userId } });
    await prisma.waiting_list.deleteMany({ where: { user_id: userId } });
    await prisma.courts.delete({ where: { id: courtId } });
    await prisma.users.delete({ where: { id: userId } });
  } catch {
    /* abaikan error cleanup */
  }
  await prisma.$disconnect();
});

describe('Booking → Payment (success)', () => {
  it('booking confirmed setelah pembayaran disimulasikan berhasil', async () => {
    // 1) Buat booking → pending
    const booking = await api()
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        court_id: courtId,
        booking_date: BOOKING_DATE,
        start_time: '08:00',
        end_time: '10:00',
      });
    expect(booking.status).toBe(201);
    expect(booking.body.data.status).toBe('pending');
    expect(booking.body.data.total_price).toBe('200000');
    const bookingId = booking.body.data.id;

    // 2) Buat payment → pending
    const payment = await api()
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [
          {
            item_type: 'booking',
            item_id: bookingId,
            item_name: 'IT Court 2 jam',
            quantity: 1,
            unit_price: 200000,
          },
        ],
      });
    expect(payment.status).toBe(201);
    expect(payment.body.data.status).toBe('pending');
    const paymentId = payment.body.data.id;

    // 3) Simulasikan sukses → paid + invoice
    const sim = await api()
      .post(`/api/v1/payments/${paymentId}/simulate/success`)
      .set('Authorization', `Bearer ${token}`);
    expect(sim.status).toBe(200);
    expect(sim.body.data.status).toBe('paid');
    expect(sim.body.data.invoices).toBeTruthy();
    expect(sim.body.data.invoices.invoice_number).toMatch(/^INV-\d{6}-\d{5}$/);

    // 4) Booking kini confirmed
    const check = await api()
      .get(`/api/v1/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(check.status).toBe(200);
    expect(check.body.data.status).toBe('confirmed');
  });
});

describe('Booking → Payment (failure)', () => {
  it('booking tetap pending setelah pembayaran disimulasikan gagal', async () => {
    const booking = await api()
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        court_id: courtId,
        booking_date: BOOKING_DATE,
        start_time: '12:00',
        end_time: '14:00',
      });
    expect(booking.status).toBe(201);
    const bookingId = booking.body.data.id;

    const payment = await api()
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [
          {
            item_type: 'booking',
            item_id: bookingId,
            item_name: 'IT Court 2 jam',
            quantity: 1,
            unit_price: 200000,
          },
        ],
      });
    const paymentId = payment.body.data.id;

    const sim = await api()
      .post(`/api/v1/payments/${paymentId}/simulate/failure`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'kartu ditolak' });
    expect(sim.status).toBe(200);
    expect(sim.body.data.status).toBe('failed');

    const check = await api()
      .get(`/api/v1/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(check.body.data.status).toBe('pending');
  });
});

describe('Double booking ditolak (409)', () => {
  it('slot yang sama tidak bisa dibooking dua kali', async () => {
    // Slot 08:00-10:00 sudah dibooking di test pertama.
    const dup = await api()
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        court_id: courtId,
        booking_date: BOOKING_DATE,
        start_time: '09:00',
        end_time: '11:00',
      });
    expect(dup.status).toBe(409);
  });
});
