# Revenue Analytics — Overview (`/admin/overview`)

Fitur: mengganti section "Revenue 7 Hari Terakhir" dengan **combo chart tren**
(bar revenue harian + line kumulatif) **+ donut komposisi** ("uang dari mana", Opsi C hybrid).
Di-gate untuk superadmin/owner.

---

## Fase 0 — Keputusan produk (LOCKED, approved 2026-07-17)

### Keputusan 1 — Peta kategori (Opsi C Hybrid)
Setiap `payment_item` dipetakan ke tepat satu label lewat `resolveCategory(item)`:

| Sumber (`item_type`) | Aturan | Label |
|---|---|---|
| `booking` | lookup `bookings → courts.type` | `paddle`→**Padel**, `tennis`→**Tennis**, `badminton`→**Badminton**, `basketball`→**Basket**, `futsal`→**Futsal**, `other`→**Lapangan Lain** |
| `pool_ticket` | konstan | **Kolam** |
| `abonemen` | konstan | **Abonemen** |
| `membership` | konstan | **Membership** |
| `event` | konstan | **Event** |
| `ticket` | konstan | **Tiket Masuk** |
| `product` | konstan | **Retail** |

- Konsolidasi tampilan: **6 slice terbesar**, sisanya digabung **"Lainnya"**.
- Anti double-count: booking abonemen `total_price=0` dan tak menghasilkan payment sendiri; revenue dihitung sekali sebagai `abonemen` → "Abonemen".
- Ketahanan: `item_type`/`court.type` tak dikenal → **"Lainnya"**.
- ⚠️ Nilai enum DB adalah `paddle` (bukan "padel"). Mapping `paddle → Padel` wajib di-unit-test.

### Keputusan 2 — Basis revenue = NET
Pie & tren memakai `final_amount` (net) yang **dialokasikan proporsional** ke tiap item:

```
faktor = final_amount / Σ(subtotal item pada payment)
kontribusi_net(item) = subtotal(item) × faktor
```

- Alasan: KPI card & combo memakai `final_amount`; agar Σ slice donut = total combo (AC#3).
- Edge `Σ subtotal = 0` & `final_amount > 0` → seluruh nilai masuk "Lainnya" (jaga rekonsiliasi).
- Pembulatan ke rupiah; residu pembulatan diberikan ke slice terbesar agar Σ = total persis.

### Keputusan 3 — Preset periode = `7d` & `30d`
- Bucket harian, basis UTC (mengikuti `getSummary` eksisting).
- Default `7d`.
- Ditunda (out of scope): mingguan/bulanan/tahunan, pembanding periode, drill-down.

---

## Fase 1 — Kontrak backend (implemented)

**Endpoint baru** (tidak menumpuk ke `/summary`):

```
GET /api/v1/reports/revenue?range=7d|30d      (admin, superadmin)
```

Response:
```jsonc
{
  "success": true,
  "data": {
    "range": "7d",
    "trend":       [{ "date": "2026-07-11", "revenue": 150000, "count": 2 }],
    "composition": [{ "label": "Padel", "amount": 100000, "pct": 52.6 }],
    "total": 190000
  }
}
```

Invarian (DoD): `Σ composition[].amount === total === Σ trend[].revenue`.

Berkas terkait:
- Resolver: `src/utils/revenueCategory.ts` (+ test `tests/revenueCategory.test.ts`)
- Agregasi: `ReportService.getRevenueBreakdown()` di `src/services/report.service.ts` (+ test `tests/report.service.test.ts`)
- Validator: `revenueQuerySchema` di `src/validators/report.validator.ts`
- Route/controller: `src/routes/report.routes.ts`, `src/controllers/report.controller.ts`

## Acceptance Criteria (keseluruhan fitur)
1. Ganti periode → dua chart berubah sinkron, ≤1 request per ganti.
2. Donut menampilkan Padel & Tennis terpisah (mapping `paddle→Padel` benar).
3. **Σ slice donut = total combo** (periode sama).
4. Hanya superadmin yang akses; periode kosong tampil anggun.
5. `tsc --noEmit` + lint bersih; unit test hijau.
