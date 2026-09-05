import type { KanalId } from "@/lib/contact";

/**
 * Ikon halaman kontak.
 *
 * Lambang WhatsApp dan Instagram ditulis sebagai isian penuh, bukan garis:
 * lambang merek hanya dikenali dalam bentuk aslinya, dan menggambar ulangnya
 * sebagai outline justru membuatnya tidak terbaca. Telepon dan email menyusul
 * bentuk yang sama supaya bobot optis satu baris ikon tetap rata.
 *
 * Ikon kemudi (salin, centang, chevron) tetap bergaya garis 1.6 — sama dengan
 * ikon di LocationSection — karena fungsinya menunjuk aksi, bukan merek.
 */

/** Dipakai bersama oleh kartu kanal dan tombol sosial di Footer. */
export const WA_PATH =
  "M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 1.8c2.17 0 4.2.84 5.74 2.38a8.06 8.06 0 0 1 2.37 5.73c0 4.47-3.64 8.11-8.11 8.11a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.06.8.82-3-.19-.31a8.05 8.05 0 0 1-1.24-4.29c0-4.47 3.64-8.11 8.1-8.11zm4.66 10.28c-.25-.13-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.13-.17.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.23a7.5 7.5 0 0 1-1.38-1.72c-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.44.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.02 2.57c.12.16 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.11-.23-.17-.48-.29z";

export const IG_PATH =
  "M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.37 1.06.42 2.23.06 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.05 1.17-.25 1.8-.42 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.17-1.06.37-2.23.42-1.27.06-1.65.07-4.85.07s-3.58 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.42a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.17-.42-.37-1.06-.42-2.23C2.2 15.58 2.2 15.2 2.2 12s0-3.58.07-4.85c.05-1.17.25-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.17 1.06-.37 2.23-.42C8.42 2.2 8.8 2.2 12 2.2zm0 1.8c-3.15 0-3.5 0-4.74.07-.9.04-1.38.2-1.7.32-.43.17-.74.37-1.06.7-.32.32-.52.63-.7 1.06-.12.32-.28.8-.32 1.7C3.4 8.5 3.4 8.85 3.4 12s0 3.5.07 4.74c.04.9.2 1.38.32 1.7.17.43.37.74.7 1.06.32.32.63.52 1.06.7.32.12.8.28 1.7.32 1.24.07 1.6.07 4.74.07s3.5 0 4.74-.07c.9-.04 1.38-.2 1.7-.32.43-.17.74-.37 1.06-.7.32-.32.52-.63.7-1.06.12-.32.28-.8.32-1.7.07-1.24.07-1.6.07-4.74s0-3.5-.07-4.74c-.04-.9-.2-1.38-.32-1.7a2.9 2.9 0 0 0-.7-1.06 2.9 2.9 0 0 0-1.06-.7c-.32-.12-.8-.28-1.7-.32C15.5 4 15.15 4 12 4zm0 3.06A4.94 4.94 0 1 1 12 16.94 4.94 4.94 0 0 1 12 7.06zm0 1.8a3.14 3.14 0 1 0 0 6.28 3.14 3.14 0 0 0 0-6.28zm5.13-1.15a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0z";

const TEL_PATH =
  "M4.6 3.2 8 2.4a1.3 1.3 0 0 1 1.5.8l1.3 3.1a1.3 1.3 0 0 1-.4 1.5L8.9 9.1a11.6 11.6 0 0 0 6 6l1.3-1.5a1.3 1.3 0 0 1 1.5-.4l3.1 1.3a1.3 1.3 0 0 1 .8 1.5l-.8 3.4a1.3 1.3 0 0 1-1.3 1C10.1 20.4 3.6 13.9 3.6 4.5a1.3 1.3 0 0 1 1-1.3z";

const MAIL_PATH =
  "M3 5.6A1.6 1.6 0 0 1 4.6 4h14.8A1.6 1.6 0 0 1 21 5.6v.5l-9 5.3-9-5.3zM3 8.3l8.6 5.1a.8.8 0 0 0 .8 0L21 8.3v10.1A1.6 1.6 0 0 1 19.4 20H4.6A1.6 1.6 0 0 1 3 18.4z";

const KANAL_PATH: Record<KanalId, string> = {
  whatsapp: WA_PATH,
  telepon: TEL_PATH,
  email: MAIL_PATH,
  instagram: IG_PATH,
};

/**
 * `width`/`height` sengaja ditulis sebagai atribut, bukan hanya diserahkan ke
 * kelas utilitas. SVG tanpa ukuran intrinsik akan melar selebar induknya bila
 * kelas ukurannya gagal termuat — dan itu benar-benar terjadi saat berkas ini
 * baru dibuat: `h-5 w-5` belum ada di bundel CSS yang sedang dipegang peramban,
 * sehingga ikon 20px terbit sebesar kartunya. Atribut ini menjadi jaring
 * pengaman; kelas CSS tetap menang bila ada.
 */
export function KanalIcon({
  id,
  className = "",
}: {
  id: KanalId;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      className={`fill-current ${className}`}
      aria-hidden
    >
      <path d={KANAL_PATH[id]} />
    </svg>
  );
}

/** Kerangka bersama ikon garis — menjaga bobot goresan seragam. */
function Line({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function CopyIcon({ className = "" }: { className?: string }) {
  return (
    <Line className={className}>
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M15 5.5A1.5 1.5 0 0 0 13.5 4h-8A1.5 1.5 0 0 0 4 5.5v8A1.5 1.5 0 0 0 5.5 15" />
    </Line>
  );
}

export function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <Line className={className}>
      <path d="m4.5 12.5 5 5 10-11" />
    </Line>
  );
}

export function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <Line className={className}>
      <path d="m6 9.5 6 6 6-6" />
    </Line>
  );
}

export function ClockIcon({ className = "" }: { className?: string }) {
  return (
    <Line className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </Line>
  );
}

export function AlertIcon({ className = "" }: { className?: string }) {
  return (
    <Line className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.8v4.6" />
      <path d="M12 16.1h.01" />
    </Line>
  );
}
