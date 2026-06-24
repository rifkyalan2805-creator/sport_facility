"use client";

import dynamic from "next/dynamic";

// 3D hanya di client (hindari SSR WebGL & hydration mismatch).
const Scene = dynamic(() => import("./Scene"), { ssr: false });

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* Canvas 3D mengisi hero, menerima pointer untuk parallax */}
      <div className="absolute inset-0">
        <Scene />
      </div>

      {/* Overlay teks — pointer-events-none agar mouse tembus ke canvas;
          tombol diaktifkan kembali pointer-eventsnya. */}
      <div className="pointer-events-none relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <span className="animate-fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-ink-900/10 bg-white/70 px-4 py-1.5 text-xs font-medium tracking-wide text-ink-500 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-purple" />
          Sport Facility Ecosystem
        </span>

        <h1
          className="animate-fade-up text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-ink-900 sm:text-6xl md:text-7xl"
          style={{ animationDelay: "80ms" }}
        >
          More Than Sports.
          <br />
          <span className="text-gradient-neon">A Community.</span>
        </h1>

        <p
          className="animate-fade-up mt-6 max-w-2xl text-balance text-base leading-relaxed text-ink-500 sm:text-lg"
          style={{ animationDelay: "160ms" }}
        >
          Temukan tempat di mana olahraga, persahabatan, dan gaya hidup sehat
          bertemu dalam satu ekosistem yang terus berkembang.
        </p>

        <div
          className="animate-fade-up pointer-events-auto mt-9 flex flex-col items-center gap-3 sm:flex-row"
          style={{ animationDelay: "240ms" }}
        >
          <a
            href="#"
            className="cursor-pointer rounded-full bg-ink-900 px-7 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-ink-700"
          >
            Mulai Booking
          </a>
          <a
            href="#"
            className="cursor-pointer rounded-full border border-ink-900/15 bg-white/70 px-7 py-3 text-sm font-medium text-ink-700 backdrop-blur transition-colors duration-200 hover:bg-white"
          >
            Jelajahi Fasilitas
          </a>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="flex h-9 w-5 items-start justify-center rounded-full border border-ink-900/20 p-1.5">
          <span className="h-2 w-1 animate-bounce rounded-full bg-ink-400" />
        </div>
      </div>
    </section>
  );
}
