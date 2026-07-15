"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageNav from "@/components/PageNav";
import EventCard from "@/components/events/EventCard";
import { useEvents, useEventCategories } from "@/lib/queries";

export default function EventsPage() {
  const { data: events = [], isLoading, isError } = useEvents();
  const { data: categories = [] } = useEventCategories();
  const [active, setActive] = useState<string>("all"); // slug kategori | "all"

  const filtered = useMemo(
    () => (active === "all" ? events : events.filter((e) => e.event_categories?.slug === active)),
    [events, active],
  );

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-32">
        <PageNav variant="cta" className="mb-6" />
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-pink" />
            Event
          </span>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
            Event &amp; <span className="text-gradient-neon">Komunitas</span>
          </h1>
          <p className="mt-4 text-ink-500">
            Turnamen, workshop, kelas, dan kegiatan seru. Daftar sekarang—ada yang gratis!
          </p>
        </div>

        {/* Filter kategori */}
        <div className="mt-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActive("all")}
            className={`rounded-full px-4 py-2 text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-neon-purple/30 ${
              active === "all" ? "bg-ink-900 text-white" : "bg-ink-900/5 text-ink-600 hover:bg-ink-900/10"
            }`}
          >
            Semua
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActive(c.slug)}
              className={`rounded-full px-4 py-2 text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-neon-purple/30 ${
                active === c.slug ? "bg-ink-900 text-white" : "bg-ink-900/5 text-ink-600 hover:bg-ink-900/10"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-3xl bg-ink-900/5" />
            ))}
          </div>
        ) : isError ? (
          <p className="mt-8 rounded-2xl bg-red-50 p-6 text-center text-red-600">
            Gagal memuat event. Pastikan backend aktif (port 3000).
          </p>
        ) : filtered.length === 0 ? (
          <p className="mt-8 rounded-2xl bg-ink-900/5 p-8 text-center text-ink-500">
            {events.length === 0 ? "Belum ada event." : "Tidak ada event di kategori ini."}
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
