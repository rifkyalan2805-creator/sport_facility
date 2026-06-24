# Folder gambar (aset statis)

Letakkan file gambar di sini (atau langsung di `web/public/`).

Cara akses dari kode — pakai path mulai dari `/` (tanpa "public"):

- File: `web/public/images/logo.png`
- URL/path: `/images/logo.png`

Contoh:

```tsx
import Image from "next/image";

<Image src="/images/logo.png" alt="Logo SportHub" width={120} height={32} />
// atau tag biasa:
<img src="/images/hero-court.jpg" alt="Lapangan" />
```

Format disarankan: `.webp` / `.avif` (ringan), `.png` (logo transparan), `.svg` (ikon/vektor).
