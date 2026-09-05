/**
 * Ikon garis untuk kartu fasilitas.
 *
 * Digambar sendiri (bukan pustaka ikon) supaya bobot garisnya seragam dengan
 * sistem broadsheet: stroke 1.5, ujung bulat, tanpa isian. Warnanya selalu
 * `currentColor` sehingga kartu cukup mengatur `text-*` untuk mengubah ikon.
 */

type IconProps = { className?: string };

const BASE = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

/** Pancuran — kamar mandi dengan pengatur air panas. */
export function ShowerIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M12 3.4v3.3" />
      <path d="M6 10.6a6 6 0 0 1 12 0z" />
      <path d="M8 14.4v1.7" />
      <path d="M12 14.4v3.4" />
      <path d="M16 14.4v1.7" />
    </svg>
  );
}

/** Botol pompa + batang sabun — perlengkapan mandi. */
export function SoapIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <rect x="10" y="10.5" width="6.5" height="10.5" rx="2" />
      <path d="M12.2 10.5V7h2v3.5" />
      <path d="M14.2 8h2a1.3 1.3 0 0 1 1.3 1.3v.6" />
      <path d="M11.7 14.6h3.1" />
      <rect x="2.6" y="16.5" width="5.6" height="4.5" rx="1.5" />
      <circle cx="4.7" cy="13" r="1.1" />
      <circle cx="7.3" cy="10.4" r="0.7" />
    </svg>
  );
}

/** Kubah + mihrab — musholla. */
export function MosqueIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M3.5 21h17" />
      <path d="M6 21v-9.2h12V21" />
      <path d="M8 11.8a4 4 0 0 1 8 0" />
      <path d="M12 5.4v2.4" />
      <path d="M10 21v-4a2 2 0 0 1 4 0v4" />
    </svg>
  );
}

/** Mobil tampak samping — area parkir. */
export function ParkingIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M4.5 16.6v-3.1l1.8-4.3A2 2 0 0 1 8.15 8h7.7a2 2 0 0 1 1.85 1.2l1.8 4.3v3.1" />
      <path d="M4.5 13.5h15" />
      <circle cx="8" cy="16.6" r="1.5" />
      <circle cx="16" cy="16.6" r="1.5" />
      <path d="M9.5 16.6h5" />
    </svg>
  );
}

/** Pendopo beratap limas — gazebo tepi kolam. */
export function GazeboIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M3 10.5 12 4.5l9 6" />
      <path d="M3.2 10.5h17.6" />
      <path d="M6.2 10.5V20" />
      <path d="M17.8 10.5V20" />
      <path d="M6.2 14h11.6" />
      <path d="M3 20h18" />
    </svg>
  );
}

/** Kotak berpalang — pertolongan pertama. */
export function FirstAidIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <rect x="2.8" y="7" width="18.4" height="13" rx="2.5" />
      <path d="M9 7V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8V7" />
      <path d="M12 10.6v6" />
      <path d="M9 13.6h6" />
    </svg>
  );
}
