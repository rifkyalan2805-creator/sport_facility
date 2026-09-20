# Deploy

Dua aplikasi, dua target berbeda:

| Aplikasi | Target | Alasan |
| --- | --- | --- |
| Backend API (root repo) | **Railway** atau **Render** | Express yang `app.listen()`, Prisma dengan koneksi persisten, `pg_advisory_xact_lock` di transaksi Serializable, dan rate limiter in-memory — semuanya mengasumsikan proses yang hidup terus. |
| Frontend (`web/`) | **Vercel** | Next.js 14 App Router, memang habitatnya. |

Backend **tidak cocok** di Vercel serverless: `src/server.ts` membuka port, sementara
fungsi Vercel tidak pernah listen. Ditambah cold start di tiap invocation dan rate
limiter yang jadi per-instance (tidak membatasi apa-apa secara efektif).

---

## Backend → Railway

Repo sudah membawa [`Dockerfile`](../Dockerfile) dan [`railway.json`](../railway.json),
jadi Railway langsung memakainya tanpa konfigurasi builder tambahan.

1. **New Project → Deploy from GitHub repo**, pilih repo ini, root directory `/`.
2. Isi environment variables (tabel di bawah) di **Variables**.
3. Deploy. Health check otomatis ke `/api/v1/health`.
4. **Settings → Networking → Generate Domain** untuk mendapat URL publik.
5. Set `CORS_ORIGINS` ke domain frontend, lalu set `NEXT_PUBLIC_API_URL` di Vercel
   ke `https://<domain-railway>/api/v1`.

`PORT` di-inject Railway sendiri — **jangan** diset manual.

## Backend → Render

1. **New → Web Service**, connect repo, **Runtime: Docker** (Dockerfile terdeteksi di root).
2. Health Check Path: `/api/v1/health`.
3. Isi environment variables yang sama.
4. `PORT` di-inject Render — jangan diset manual.

---

## Environment variables (backend, production)

Divalidasi Zod di [`src/config/env.ts`](../src/config/env.ts); proses **exit 1** saat boot
kalau ada yang tidak valid. Daftar lengkap beserta komentarnya ada di `.env.example`.

| Variable | Wajib | Catatan |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Supabase **connection pooler**, port `6543`, tambahkan `?pgbouncer=true`. |
| `DIRECT_URL` | ✅ | Koneksi langsung port `5432`. Dipakai `directUrl` di `prisma/schema.prisma`. |
| `JWT_ACCESS_SECRET` | ✅ | **≥48 karakter** di production, acak. |
| `JWT_REFRESH_SECRET` | ✅ | ≥48 karakter, **harus berbeda** dari access secret. |
| `SUPABASE_URL` | ✅ | `https://<project-ref>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | service_role key — backend only, mem-bypass RLS. |
| `SUPABASE_STORAGE_BUCKET` | ✅ | Nama bucket persis (case-sensitive). |
| `SUPABASE_AVATAR_BUCKET` | — | Default `avatar`. |
| `CORS_ORIGINS` | ✅ | Domain frontend, dipisah koma. **Kosong di production = semua request lintas-origin ditolak.** |
| `NODE_ENV` | — | Diisi platform (`production`). |
| `PORT` | — | Di-inject platform. Jangan diset manual. |
| `JWT_ACCESS_EXPIRES` | — | Default `15m`. |
| `JWT_REFRESH_EXPIRES_DAYS` | — | Default `7`. |
| `BCRYPT_ROUNDS` | — | Default `10`. |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` / `AUTH_RATE_LIMIT_MAX` | — | Default `900000` / `300` / `20`. |

Generate secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Dua jebakan yang paling sering memakan waktu

- **Jangan ikut menyalin tanda kutip.** Di `.env` nilainya ditulis `JWT_ACCESS_SECRET="abc…"`
  dan dotenv membuang kutipnya. Dashboard platform **tidak** — kutip tersimpan sebagai
  bagian dari secret, dan token yang diterbitkan jadi berbeda dari lokal.
- **Jangan meninggalkan entry kosong.** Variabel opsional yang dibuat tanpa nilai dulunya
  membuat boot gagal (`""` ≠ `undefined`, sehingga `.default()` Zod tidak jalan).
  `src/config/env.ts` sekarang memperlakukan nilai kosong sebagai tidak diisi, tapi lebih
  bersih kalau variabel yang tidak dipakai memang dihapus saja.

---

## Frontend (`web/`) → Vercel

- **Root Directory: `web`** (bukan root repo — kalau salah, Vercel akan mencoba
  membangun backend dan gagal di validasi env).
- Environment variable: `NEXT_PUBLIC_API_URL` = `https://<domain-backend>/api/v1`.

---

## Catatan operasional

- **`uploads/` bersifat ephemeral.** Isinya hilang setiap redeploy. Folder itu hanya
  melayani foto member legacy pra-Supabase; upload baru sudah langsung ke bucket.
  Kalau file lama masih dibutuhkan, migrasikan ke Supabase Storage sebelum deploy.
- **Rate limiter memakai in-memory store** ([`src/middlewares/rateLimit.ts`](../src/middlewares/rateLimit.ts)),
  jadi batasnya per-instance. Kalau nanti di-scale horizontal, butuh store bersama (Redis).
- **Skema database tidak di-migrate saat deploy.** Proyek ini introspection-first
  (`prisma db pull`) — perubahan skema diterapkan langsung ke Postgres, bukan lewat
  `prisma migrate deploy`.
- Health check: `GET /api/v1/health` → `{ "status": "ok" }`. Endpoint ini ada di bawah
  mount `/api/v1` sehingga ikut terhitung `globalLimiter` (default 300 request / 15 menit).
