"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { Court } from "@/lib/queries";
import { formatRupiah } from "@/lib/format";

interface CourtCardProps {
  court: Court;
  index: number;
  selected: boolean;
  animated: boolean; // false → mobile / prefers-reduced-motion (tanpa GSAP)
  onSelect: (id: string) => void;
  onHover: (index: number) => void; // parent koordinasikan flexGrow saudara kartu
  onLeave: () => void;
  registerRef: (index: number, node: HTMLElement | null) => void;
}

export default function CourtCard({
  court,
  index,
  selected,
  animated,
  onSelect,
  onHover,
  onLeave,
  registerRef,
}: CourtCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const card = cardRef.current;
    const img = imgRef.current;
    const text = textRef.current;
    if (!card) return;

    // Tanpa animasi: detail selalu tampak, tidak ada listener GSAP.
    if (!animated) {
      if (text) gsap.set(text, { autoAlpha: 1, y: 0 });
      return;
    }

    // State awal: kartu setara, detail tersembunyi & sedikit turun.
    gsap.set(card, { flexGrow: 1 });
    if (text) gsap.set(text, { autoAlpha: 0, y: 14 });

    const enter = () => {
      onHover(index); // parent: kartu ini membesar, saudaranya menyempit
      if (img) gsap.to(img, { scale: 1.12, duration: 0.6, ease: "power2.out" });
      if (text) gsap.to(text, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" });
    };
    const leave = () => {
      onLeave();
      if (img) gsap.to(img, { scale: 1, duration: 0.6, ease: "power2.out" });
      if (text) gsap.to(text, { autoAlpha: 0, y: 14, duration: 0.4, ease: "power2.out" });
    };

    // mouse (hover) + keyboard (focus) memicu efek yang sama.
    card.addEventListener("mouseenter", enter);
    card.addEventListener("mouseleave", leave);
    card.addEventListener("focus", enter);
    card.addEventListener("blur", leave);

    return () => {
      card.removeEventListener("mouseenter", enter);
      card.removeEventListener("mouseleave", leave);
      card.removeEventListener("focus", enter);
      card.removeEventListener("blur", leave);
      gsap.killTweensOf([card, img, text].filter(Boolean) as Element[]);
    };
  }, [animated, index, onHover, onLeave]);

  const surface = court.description ?? "Rumput sintetis";

  return (
    <article
      ref={(n) => {
        cardRef.current = n;
        registerRef(index, n);
      }}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={() => onSelect(court.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(court.id);
        }
      }}
      style={{ minHeight: 300 }}
      className={`group relative min-w-0 flex-1 cursor-pointer overflow-hidden rounded-3xl border-2 outline-none transition-colors duration-300 focus-visible:ring-4 focus-visible:ring-neon-purple/40 md:h-full ${
        selected ? "border-neon-pink" : "border-transparent"
      }`}
    >
      {/* Gambar lapangan (aset asli) — di dalam overflow-hidden untuk efek zoom */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={encodeURI(court.image_url ?? "")}
        alt={`Lapangan ${court.name}`}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

      {/* Badge terpilih (warna via CSS transition) */}
      <span
        className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold text-white transition-opacity duration-300 ${
          selected ? "bg-neon-pink opacity-100" : "opacity-0"
        }`}
      >
        Dipilih
      </span>

      {/* Nama court selalu tampak */}
      <div className="absolute left-5 top-5 pr-4">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">
          {court.is_indoor ? "Indoor" : "Outdoor"} · Padel
        </p>
        <h3 className="mt-1 text-2xl font-semibold text-white drop-shadow">{court.name}</h3>
      </div>

      {/* Detail: fade + slide-up saat hover/focus (autoAlpha via GSAP) */}
      <div ref={textRef} className="absolute inset-x-0 bottom-0 p-5">
        <p className="text-sm text-white/85">{surface}</p>
        {court.facilities?.length ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {court.facilities.slice(0, 3).map((f) => (
              <span
                key={f}
                className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur"
              >
                {f}
              </span>
            ))}
          </div>
        ) : null}
        <p className="mt-3 text-sm text-white/70">
          Mulai <span className="font-semibold text-white">{formatRupiah(court.price_per_hour)}</span>/jam
        </p>
        {/* Affordance visual (bukan tombol nyata → hindari nested interactive).
            Warna berubah via CSS transition saat hover kartu, bukan GSAP. */}
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-sm font-semibold text-ink-900 transition-colors duration-200 group-hover:bg-neon-pink group-hover:text-white">
          {selected ? "Terpilih" : "Pilih Lapangan"} <span aria-hidden>→</span>
        </span>
      </div>
    </article>
  );
}
