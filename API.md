# Sport Facility — Dokumentasi Backend & API

Base URL: `http://localhost:3000/api/v1`
Auth: `Authorization: Bearer <accessToken>` (didapat dari `/auth/login`).
Swagger UI: `http://localhost:3000/api/docs` · OpenAPI JSON: `/api/docs.json`

Peran (role): `member` (default) · `staff` · `admin` · `superadmin`.
Pembayaran memakai **dummy gateway lokal** (bukan Midtrans) — status diubah via endpoint simulasi.

Legenda akses: **[PUB]** publik · **[USER]** user login · **[ADMIN]** admin/superadmin · **[STAFF]** staff/admin/superadmin.

---

## 1. Fitur backend yang sudah dibuat (19 domain)

| Domain | Inti fitur |
|---|---|
| Auth | Register, login, refresh-token rotation, logout, profil (JWT) |
| Courts & Schedules | CRUD lapangan + jadwal operasional per hari |
| Bookings | Booking insidentil & abonemen, anti double-booking (lock), cancel, check-in |
| Waiting list | Antre saat slot penuh, cancel |
| Membership | Plan + langganan (subscribe -> pending -> aktif saat lunas) |
| Pool (renang) | Sesi kolam berkuota + tipe tiket, beli tiket (reservasi), cancel |
| Tickets / HTM | Kategori tiket masuk + beli + scan QR di pintu masuk |
| Events | Kategori + event, registrasi (gratis/berbayar), check-in QR |
| Promos | Validasi kode promo + hitung diskon (percentage/fixed/free_item) |
| Loyalty | Earn poin otomatis saat bayar, saldo + riwayat |
| Reviews | Ulasan polimorfik (rating 1-5), anti-duplikat |
| Payments | Pembayaran multi-item polimorfik, invoice, simulasi sukses/gagal, idempotency, fee, diskon promo |
| Notifications | In-app, push token (FCM), email log (dummy) |
| Staff | Data staff + jadwal shift |
| Inventory | Kategori + produk + pergerakan stok (in/out/adjustment/sale/return) |
| Reports | Occupancy lapangan per jam |
| CMS | Banner, FAQ, galeri, halaman statis |
| Settings | Konfigurasi situs (key-value) |
| Fulfillment | Registry handler per item_type (booking/membership/pool/ticket/event) |

Kualitas: **95 unit test** + integration e2e (Supertest), Swagger, validasi Zod, transaksi + advisory lock untuk anti-oversell.

> Belum dibuat: `audit_logs`, `admins` (ditunda), dan seluruh **frontend**.

---

## 2. "Tiket olahraga" yang tersedia

Sistem ini multi-fasilitas. Jenis transaksi/olahraga yang bisa dibeli:

1. **Booking lapangan** (`court_type`, tetap di enum): `paddle`, `badminton`, `tennis`, `basketball`, `futsal`, `other`.
2. **Tiket kolam renang** (Pool): per **sesi** + **tipe tiket** (mis. Dewasa/Anak/Lansia by umur). Tipe tiket dibuat admin — belum ada seed.
3. **Tiket masuk / HTM**: kategori tiket fasilitas + QR scan. Kategori dibuat admin — belum ada seed.
4. **Event** (kategori ter-seed): `Turnamen`, `Fun & Game`, `Workshop`, `Kelas Renang`, `Seminar`.
5. **Membership** (plan ter-seed): `Basic`, `Silver`, `Gold`, `Platinum`.

Yang otomatis terisi dari schema SQL: court_type (enum), event_categories, membership_plans, payment_methods, site_settings. Pool ticket types & HTM categories harus dibuat lewat endpoint admin.

---

## 3. Katalog endpoint (yang bisa di-fetch frontend)

### Auth — `/auth`
| Method | Path | Akses |
|---|---|---|
| POST | `/auth/register` | PUB |
| POST | `/auth/login` | PUB |
| POST | `/auth/refresh` | PUB |
| POST | `/auth/logout` | PUB |
| GET | `/auth/me` | USER |

### Courts — `/courts`
| Method | Path | Akses |
|---|---|---|
| GET | `/courts` | PUB |
| GET | `/courts/:id` | PUB |
| GET | `/courts/:id/schedules` | PUB |
| POST | `/courts` | ADMIN |
| PATCH | `/courts/:id` | ADMIN |
| DELETE | `/courts/:id` | ADMIN |
| PUT | `/courts/:id/schedules` | ADMIN |
| DELETE | `/courts/:id/schedules/:scheduleId` | ADMIN |

### Bookings — `/bookings` (semua USER)
| Method | Path |
|---|---|
| POST | `/bookings` |
| GET | `/bookings` |
| GET | `/bookings/:id` |
| PATCH | `/bookings/:id/cancel` |
| PATCH | `/bookings/:id/check-in` |

### Waiting list — `/waiting-list` (USER)
| POST `/waiting-list` · GET `/waiting-list` · PATCH `/waiting-list/:id/cancel` |

### Membership — `/membership`
| Method | Path | Akses |
|---|---|---|
| GET | `/membership/plans` | PUB |
| GET | `/membership/plans/:id` | PUB |
| POST | `/membership/plans` | ADMIN |
| PATCH | `/membership/plans/:id` | ADMIN |
| DELETE | `/membership/plans/:id` | ADMIN |
| GET | `/membership/me` | USER |
| POST | `/membership/subscribe` | USER |
| PATCH | `/membership/:id/cancel` | USER |

### Pool (renang) — `/pool`
| Method | Path | Akses |
|---|---|---|
| GET | `/pool/sessions` | PUB |
| GET | `/pool/sessions/:id` | PUB |
| GET | `/pool/ticket-types` | PUB |
| POST | `/pool/sessions` | ADMIN |
| PATCH | `/pool/sessions/:id` | ADMIN |
| POST | `/pool/ticket-types` | ADMIN |
| PATCH | `/pool/ticket-types/:id` | ADMIN |
| POST | `/pool/tickets` (beli) | USER |
| GET | `/pool/tickets/me` | USER |
| PATCH | `/pool/tickets/:id/cancel` | USER |

### Tickets / HTM — `/tickets`
| Method | Path | Akses |
|---|---|---|
| GET | `/tickets/categories` | PUB |
| GET | `/tickets/categories/:id` | PUB |
| POST | `/tickets/categories` | ADMIN |
| PATCH | `/tickets/categories/:id` | ADMIN |
| DELETE | `/tickets/categories/:id` | ADMIN |
| POST | `/tickets` (beli) | USER |
| GET | `/tickets/me` | USER |
| PATCH | `/tickets/:id/cancel` | USER |
| POST | `/tickets/scan` (check-in QR) | STAFF |

### Events — `/events`
| Method | Path | Akses |
|---|---|---|
| GET | `/events` | PUB |
| GET | `/events/:id` | PUB |
| GET | `/events/categories` | PUB |
| POST | `/events` | ADMIN |
| PATCH | `/events/:id` | ADMIN |
| POST | `/events/categories` | ADMIN |
| PATCH | `/events/categories/:id` | ADMIN |
| POST | `/events/:id/register` | USER |
| GET | `/events/registrations/me` | USER |
| PATCH | `/events/registrations/:id/cancel` | USER |
| POST | `/events/registrations/scan` (check-in QR) | STAFF |

### Promos — `/promos`
| Method | Path | Akses |
|---|---|---|
| POST | `/promos/validate` (preview diskon) | USER |
| GET | `/promos` | ADMIN |
| POST | `/promos` | ADMIN |
| GET | `/promos/:id` | ADMIN |
| PATCH | `/promos/:id` | ADMIN |

### Loyalty — `/loyalty` (USER)
| GET `/loyalty/me` · GET `/loyalty/transactions` |

### Reviews — `/reviews`
| Method | Path | Akses |
|---|---|---|
| GET | `/reviews?item_type=&item_id=` | PUB |
| POST | `/reviews` | USER |
| PATCH | `/reviews/:id` | USER |
| DELETE | `/reviews/:id` | USER |

### Payments — `/payments` (USER)
| Method | Path |
|---|---|
| POST | `/payments` (buat) |
| GET | `/payments` |
| GET | `/payments/:id` |
| POST | `/payments/:id/simulate/success` (dummy lunas) |
| POST | `/payments/:id/simulate/failure` (dummy gagal) |

### Notifications — `/notifications`
| Method | Path | Akses |
|---|---|---|
| GET | `/notifications` | USER |
| PATCH | `/notifications/read-all` | USER |
| PATCH | `/notifications/:id/read` | USER |
| POST | `/notifications` (kirim ke user) | ADMIN |
| GET | `/notifications/push-tokens` | USER |
| POST | `/notifications/push-tokens` | USER |
| DELETE | `/notifications/push-tokens/:id` | USER |
| GET | `/notifications/email-logs` | ADMIN |

### Staff — `/staff` (semua ADMIN)
| GET `/staff` · POST `/staff` · PATCH `/staff/:id` · GET `/staff/:id/schedules` · PUT `/staff/:id/schedules` |

### Inventory — `/inventory` (semua STAFF)
| Method | Path |
|---|---|
| GET/POST | `/inventory/categories` |
| PATCH | `/inventory/categories/:id` |
| GET/POST | `/inventory/products` |
| GET/PATCH | `/inventory/products/:id` |
| POST | `/inventory/products/:id/stock` (pergerakan stok) |
| GET | `/inventory/products/:id/logs` |

### Reports — `/reports` (ADMIN)
| GET `/reports/occupancy?court_id=&date=` · POST `/reports/occupancy` |

### Settings — `/settings`
| Method | Path | Akses |
|---|---|---|
| GET | `/settings` | PUB |
| GET | `/settings/:key` | PUB |
| PUT | `/settings/:key` | ADMIN |

### CMS — `/cms`
| Method | Path | Akses |
|---|---|---|
| GET | `/cms/banners` | PUB |
| POST | `/cms/banners` | ADMIN |
| PATCH/DELETE | `/cms/banners/:id` | ADMIN |
| GET | `/cms/faqs` | PUB |
| POST | `/cms/faqs` | ADMIN |
| PATCH/DELETE | `/cms/faqs/:id` | ADMIN |
| GET | `/cms/galleries` | PUB |
| POST | `/cms/galleries` | ADMIN |
| PATCH/DELETE | `/cms/galleries/:id` | ADMIN |
| GET | `/cms/pages` | PUB |
| GET | `/cms/pages/:slug` | PUB |
| POST | `/cms/pages` | ADMIN |
| PATCH | `/cms/pages/:id` | ADMIN |

### Lainnya
| GET `/api/v1/health` (PUB) · GET `/api/docs` (Swagger UI) · GET `/api/docs.json` |

---

## 4. Contoh alur fetch dari frontend

```
1. POST /auth/login            -> simpan accessToken + refreshToken
2. GET  /courts                -> tampilkan daftar lapangan (publik)
3. POST /bookings (Bearer)     -> buat booking (status pending)
4. POST /payments (Bearer)     -> buat pembayaran (item_type=booking, item_id=bookingId)
5. POST /payments/:id/simulate/success -> booking confirmed + invoice + poin loyalty
```

Format response standar:
`{ "success": true, "data": ... }` atau `{ "success": false, "message": "...", "errors": {...} }`.
