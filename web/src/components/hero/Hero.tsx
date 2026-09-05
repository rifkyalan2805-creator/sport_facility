import Button, { Eyebrow } from "@/components/brand/Button";

/**
 * Hero foto gelap full-bleed (DESIGN.md).
 *
 * Fotonya sengaja didesaturasi mendekati monokrom lalu digelapkan, sehingga
 * tombol gradient menjadi SATU-SATUNYA sumber warna di viewport pertama.
 * Teks rata kiri, bukan tengah — mengikuti karakter broadsheet.
 *
 * Menggantikan hero React Three Fiber sebelumnya: DESIGN.md melarang 3D render,
 * dan homepage kini tidak lagi memuat bundle WebGL di jalur render awal.
 */

const HERO_IMAGE = "/images/sport club/Tennis/tennis 3.jpg";

export default function Hero() {
  return (
    <section className="relative isolate min-h-[92vh] w-full overflow-hidden bg-obsidian">
      {/* Foto — grayscale penuh agar tak bersaing dengan gradient CTA */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={encodeURI(HERO_IMAGE)}
        alt="Lapangan tenis ISTANA DIENG CLUB HOUSE"
        // Hero adalah LCP → jangan di-lazy-load.
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover opacity-60 grayscale"
      />
      {/* Gelapkan sisi kiri agar teks putih tetap terbaca di atas foto apa pun */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/25" />

      {/* Bloom ungu ambient — atmosfer, bukan isian fungsional */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 55% at 0% 4%, rgba(161,98,255,0.28) 0%, rgba(161,98,255,0) 100%)",
        }}
      />

      <div className="relative mx-auto flex min-h-[92vh] max-w-[1200px] flex-col justify-center px-6 py-32">
        <div className="max-w-3xl">
          {/* Eyebrow netral — tombol gradient di bawah harus jadi satu-satunya
              sumber warna di viewport pertama. */}
          <Eyebrow tone="light">Padel · Tenis · Kolam Renang</Eyebrow>

          <h1 className="mt-5 font-display text-5xl font-black leading-none tracking-hero text-paper-white sm:text-6xl md:text-7xl lg:text-8xl">
            Tempat bermain
            <br />
            yang dirawat
            <br />
            sungguh-sungguh.
          </h1>

          <p className="mt-8 max-w-xl font-display text-base leading-relaxed text-paper-white/70 sm:text-lg">
            Lapangan berstandar kompetisi, kolam yang terjaga kualitas airnya,
            dan satu sistem reservasi yang menunjukkan ketersediaan sebenarnya —
            tanpa perlu menelepon lebih dulu.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button href="/harga" variant="gradient" size="lg">
              Reservasi Lapangan
            </Button>
            <Button
              href="#fasilitas"
              variant="ghost"
              size="lg"
              className="border-paper-white/25 text-paper-white hover:border-paper-white/60 hover:bg-paper-white/5"
            >
              Lihat Fasilitas
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
