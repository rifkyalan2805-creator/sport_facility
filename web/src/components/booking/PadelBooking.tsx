"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { usePadelCourts, useAvailability, type Slot } from "@/lib/queries";
import { buildDatePills } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";
import CourtCard from "./CourtCard";
import DatePicker from "./DatePicker";
import ScheduleGrid from "./ScheduleGrid";
import SummaryBar from "./SummaryBar";
import CheckoutPanel from "./CheckoutPanel";

function StepLabel({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white">
        {n}
      </span>
      <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
    </div>
  );
}

export default function PadelBooking() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: courts = [], isLoading: courtsLoading } = usePadelCourts();

  const pills = useMemo(() => buildDatePills(14), []);
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(pills[0]?.iso ?? "");
  const [selected, setSelected] = useState<Record<string, Slot>>({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [animated, setAnimated] = useState(false);

  // Court pertama dipilih otomatis begitu data tersedia.
  useEffect(() => {
    if (!selectedCourtId && courts.length) setSelectedCourtId(courts[0].id);
  }, [courts, selectedCourtId]);

  // Animasi hover hanya di desktop & non reduce-motion.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setAnimated(desktop && !reduce);
  }, []);

  const { data: availability, isLoading: slotsLoading } = useAvailability(
    selectedCourtId,
    selectedDate,
  );

  // Reset pilihan slot tiap court/tanggal berubah.
  useEffect(() => {
    setSelected({});
  }, [selectedCourtId, selectedDate]);

  const selectedCourt = useMemo(
    () => courts.find((c) => c.id === selectedCourtId),
    [courts, selectedCourtId],
  );

  const dateLabel = useMemo(() => {
    const p = pills.find((x) => x.iso === selectedDate);
    return p ? `${p.dayShort}, ${p.dayNum} ${p.month}` : selectedDate;
  }, [pills, selectedDate]);

  // ---- Koordinasi hover kartu: lebar antar kartu saling bergantung ----
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const registerRef = useCallback((i: number, node: HTMLElement | null) => {
    cardRefs.current[i] = node;
  }, []);
  const handleHover = useCallback((idx: number) => {
    cardRefs.current.forEach((node, i) => {
      if (node) gsap.to(node, { flexGrow: i === idx ? 2.4 : 0.75, duration: 0.6, ease: "power2.out" });
    });
  }, []);
  const handleLeave = useCallback(() => {
    cardRefs.current.forEach((node) => {
      if (node) gsap.to(node, { flexGrow: 1, duration: 0.6, ease: "power2.out" });
    });
  }, []);
  useEffect(
    () => () => {
      gsap.killTweensOf(cardRefs.current.filter(Boolean) as Element[]);
    },
    [],
  );

  const toggleSlot = useCallback((slot: Slot) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[slot.id]) delete next[slot.id];
      else next[slot.id] = slot;
      return next;
    });
  }, []);

  const chosen = Object.values(selected);
  const total = useMemo(() => chosen.reduce((sum, s) => sum + s.price, 0), [chosen]);
  const selectedIds = useMemo(() => new Set(Object.keys(selected)), [selected]);

  // "Lanjut" → wajib login → buka panel checkout (pembuatan booking + bayar di panel).
  const onContinue = useCallback(() => {
    if (!chosen.length) return;
    if (!user) {
      router.push("/login?redirect=/booking/padel");
      return;
    }
    setCheckoutOpen(true);
  }, [chosen.length, user, router]);

  return (
    <>
      <div className="mx-auto max-w-6xl px-6 pb-40 pt-28">
        {/* Header */}
        <header className="max-w-2xl">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-pink" />
            Padel
          </span>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
            Booking Lapangan <span className="text-gradient-neon">Padel</span>
          </h1>
          <p className="mt-3 text-ink-500">
            Pilih lapangan, tanggal, lalu slot waktu favoritmu. Harga off-peak
            (06:00–15:00) otomatis lebih hemat.
          </p>
        </header>

        {/* Langkah 1 — Pilih lapangan */}
        <section className="mt-10">
          <StepLabel n={1} title="Pilih Lapangan" />
          {courtsLoading ? (
            <div className="mt-4 flex gap-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-[300px] flex-1 animate-pulse rounded-3xl bg-ink-900/5" />
              ))}
            </div>
          ) : !courts.length ? (
            <p className="mt-4 rounded-2xl bg-ink-900/5 p-6 text-center text-ink-500">
              Belum ada lapangan padel tersedia.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-3 md:h-[360px] md:flex-row">
              {courts.map((c, i) => (
                <CourtCard
                  key={c.id}
                  court={c}
                  index={i}
                  selected={c.id === selectedCourtId}
                  animated={animated}
                  onSelect={(id) => setSelectedCourtId(id)}
                  onHover={handleHover}
                  onLeave={handleLeave}
                  registerRef={registerRef}
                />
              ))}
            </div>
          )}
        </section>

        {/* Langkah 2 — Pilih tanggal */}
        <section className="mt-12">
          <StepLabel n={2} title="Pilih Tanggal" />
          <div className="mt-4">
            <DatePicker pills={pills} selected={selectedDate} onSelect={(iso) => setSelectedDate(iso)} />
          </div>
        </section>

        {/* Langkah 3 — Jadwal */}
        <section className="mt-10">
          <StepLabel n={3} title="Pilih Jadwal" />
          <div className="mt-5">
            <ScheduleGrid
              court={selectedCourt}
              result={availability}
              loading={slotsLoading}
              selectedIds={selectedIds}
              onToggle={toggleSlot}
            />
          </div>
        </section>
      </div>

      {/* Footer bar sticky (lebar penuh) */}
      <SummaryBar
        count={chosen.length}
        total={total}
        courtName={selectedCourt?.name}
        submitting={false}
        onContinue={onContinue}
      />

      {/* Panel checkout (review → bayar simulasi → struk) */}
      <CheckoutPanel
        open={checkoutOpen}
        court={selectedCourt}
        date={selectedDate}
        dateLabel={dateLabel}
        slots={chosen}
        total={total}
        onClose={() => setCheckoutOpen(false)}
        onConsumed={() => setSelected({})}
      />
    </>
  );
}
