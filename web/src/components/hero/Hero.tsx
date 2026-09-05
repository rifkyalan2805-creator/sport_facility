import { Eyebrow } from "@/components/brand/Button";

/**
 * Hero foto gelap full-bleed (DESIGN.md).
 *
 * Tanpa tombol: viewport pertama hanya berisi foto, judul, dan satu paragraf.
 * Ajakan bertindak diserahkan ke bar navigasi yang selalu menempel di atas,
 * jadi memasangnya lagi di sini hanya mengulang tujuan yang sama.
 *
 * Konsekuensinya viewport pertama kini sepenuhnya monokrom — tidak ada lagi
 * isian gradient di sini. Fotonya tetap didesaturasi penuh dan digelapkan,
 * sekarang murni supaya teks putih terbaca. Teks rata kiri, bukan tengah —
 * mengikuti karakter broadsheet.
 *
 * Menggantikan hero React Three Fiber sebelumnya: DESIGN.md melarang 3D render,
 * dan homepage kini tidak lagi memuat bundle WebGL di jalur render awal.
 */

const HERO_IMAGE = "/images/sport club/Tennis/tennis 3.jpg";

export default function Hero() {
  return (
    <section className="relative isolate min-h-[92vh] w-full overflow-hidden bg-obsidian">
      {/* Foto — grayscale penuh, menjaga viewport pertama tetap monokrom */}
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
        {/* Dilebarkan dari 3xl: "Berstandar Internasional" 50% lebih panjang
            daripada baris terpanjang judul sebelumnya, dan pada 3xl ia pecah
            jadi tiga baris — merusak pemenggalan dua baris yang dimaksud.
            Paragraf di bawah tidak ikut melebar karena punya max-w-xl sendiri. */}
        <div className="max-w-5xl">
          <Eyebrow tone="light">Padel · Tenis · Kolam Renang</Eyebrow>

          <h1 className="mt-5 font-display text-5xl font-black leading-none tracking-hero text-paper-white sm:text-6xl md:text-7xl lg:text-8xl">
            Tempat olahraga
            <br />
            Berstandar Internasional
          </h1>

          <p className="mt-8 max-w-xl font-display text-base leading-relaxed text-paper-white/70 sm:text-lg">
            Lapangan berstandar kompetisi, kolam yang terjaga kualitas airnya,
            dan satu sistem reservasi yang menunjukkan ketersediaan sebenarnya —
            tanpa perlu menelepon lebih dulu.
          </p>
        </div>
      </div>
    </section>
  );
}
