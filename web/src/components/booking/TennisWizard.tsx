"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import PageNav from "@/components/PageNav";
import { useQueryClient } from "@tanstack/react-query";
import {
  useTennisCourts,
  useTennisPrices,
  useAvailability,
  useMyAbonemenRegistrations,
  useJoinWaitingList,
  type Slot,
} from "@/lib/queries";
import { formatRupiah, buildDatePills } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";
import { getErrorMessage } from "@/lib/error";
import { makeCourtRunner, type CheckoutLine, type CheckoutRunner } from "@/lib/checkout";
import Stepper from "./Stepper";
import CourtCard from "./CourtCard";
import DatePicker from "./DatePicker";
import ScheduleGrid from "./ScheduleGrid";
import CheckoutPanel from "./CheckoutPanel";
import WaitlistDialog from "./WaitlistDialog";

const STEPS = ["Lapangan", "Jadwal & Tarif", "Review", "Pay"];
type BookingType = "insidentil" | "abonemen";
type Phase = "review" | "processing" | "paid" | "failed" | "error";

interface CheckoutMeta {
  runner: CheckoutRunner;
  subtitle: string;
  lines: CheckoutLine[];
  total: number;
}

export default function TennisWizard() {
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const checkoutRef = useRef<CheckoutMeta | null>(null);
  const [panelPhase, setPanelPhase] = useState<Phase>("review");
  const { data: courts = [], isLoading: courtsLoading } = useTennisCourts();
  const { data: tennisPrices = [] } = useTennisPrices();
  // Hanya panggil endpoint ber-auth bila sudah login (hindari 401 sia-sia).
  const { data: registrations = [] } = useMyAbonemenRegistrations(Boolean(user));

  const pills = useMemo(() => buildDatePills(14), []);
  const [step, setStep] = useState(0);
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(pills[0]?.iso ?? "");
  const [bookingType, setBookingType] = useState<BookingType>("insidentil");
  const [withLight, setWithLight] = useState(true);
  const [selected, setSelected] = useState<Record<string, Slot>>({});
  const [animated, setAnimated] = useState(false);
  const [waitlistSlot, setWaitlistSlot] = useState<Slot | null>(null);
  const joinWaitlist = useJoinWaitingList();

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

  // ---- Koordinasi hover: lebar antar kartu saling bergantung (flexGrow) ----
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

  const selectedCourt = useMemo(
    () => courts.find((c) => c.id === selectedCourtId),
    [courts, selectedCourtId],
  );

  // "Mulai dari" = tarif INSIDENTIL termurah (yang bisa dipesan siapa pun).
  // Tarif abonemen (lebih murah) butuh registrasi approved → tak dijadikan klaim.
  const priceFrom = useMemo(() => {
    const insidentil = tennisPrices
      .filter((p) => p.booking_type === "insidentil")
      .map((p) => Number(p.price));
    return insidentil.length ? Math.min(...insidentil) : undefined;
  }, [tennisPrices]);

  const priceOf = useCallback(
    (bt: BookingType, wl: boolean) =>
      tennisPrices.find((p) => p.booking_type === bt && p.with_light === wl)?.price,
    [tennisPrices],
  );

  // ---- Gating abonemen ----
  const hasApproved = registrations.some((r) => r.status === "approved");
  const hasPending = registrations.some((r) => r.status === "pending");
  const needsRegistration = bookingType === "abonemen" && !hasApproved;

  // Slot: harga bergantung tarif → re-fetch tiap court/tanggal/tarif berubah.
  const { data: availability, isLoading: slotsLoading } = useAvailability(
    selectedCourtId,
    selectedDate,
    { bookingType, withLight },
  );

  // Pilihan slot direset saat apa pun yang memengaruhi harga berubah.
  useEffect(() => {
    setSelected({});
  }, [selectedCourtId, selectedDate, bookingType, withLight]);

  const toggleSlot = useCallback((slot: Slot) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[slot.id]) delete next[slot.id];
      else next[slot.id] = slot;
      return next;
    });
  }, []);

  // Slot booked → masuk antrean (wajib login dulu).
  const onJoinWaitlist = useCallback(
    (slot: Slot) => {
      if (!user) {
        router.push("/login?redirect=/booking/tennis");
        return;
      }
      joinWaitlist.reset();
      setWaitlistSlot(slot);
    },
    [user, router, joinWaitlist],
  );

  const closeWaitlist = useCallback(() => {
    setWaitlistSlot(null);
    joinWaitlist.reset();
  }, [joinWaitlist]);

  const confirmWaitlist = useCallback(() => {
    if (!selectedCourt || !waitlistSlot) return;
    joinWaitlist.mutate({
      court_id: selectedCourt.id,
      preferred_date: selectedDate,
      preferred_start: waitlistSlot.start,
      preferred_end: waitlistSlot.end,
    });
  }, [selectedCourt, waitlistSlot, selectedDate, joinWaitlist]);

  const chosen = Object.values(selected);
  const total = useMemo(() => chosen.reduce((sum, s) => sum + s.price, 0), [chosen]);
  const selectedIds = useMemo(() => new Set(Object.keys(selected)), [selected]);

  const canProceed =
    step === 0 ? Boolean(selectedCourtId) : step === 1 ? chosen.length > 0 && !needsRegistration : false;

  const dateLabel = useMemo(() => {
    const p = pills.find((x) => x.iso === selectedDate);
    return p ? `${p.dayShort}, ${p.dayNum} ${p.month}` : selectedDate;
  }, [pills, selectedDate]);

  // Stepper: langkah 0/1 dari state; layar checkout dipetakan dari fase panel.
  const stepIndex = step < 2 ? step : panelPhase === "review" ? 2 : 3;

  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  const next = useCallback(() => {
    if (!canProceed) return;
    if (step === 0) {
      setStep(1);
      return;
    }
    // step 1 → checkout: wajib login, lalu bangun runner + snapshot ringkasan.
    if (!user) {
      router.push("/login?redirect=/booking/tennis");
      return;
    }
    if (!selectedCourt) return;

    checkoutRef.current = {
      runner: makeCourtRunner({
        court: { id: selectedCourt.id, name: selectedCourt.name },
        date: selectedDate,
        slots: chosen,
        qc,
        onConsumed: () => setSelected({}),
        tariff: { bookingType, withLight },
      }),
      subtitle: `${selectedCourt.name} · ${dateLabel} · ${bookingType}${withLight ? "" : " (tanpa lampu)"}`,
      lines: chosen.map((s) => ({
        label: `${s.start}–${s.end}`,
        amount: s.price,
        strikethrough: s.basePrice > s.price ? s.basePrice : undefined,
      })),
      total,
    };
    setPanelPhase("review");
    setStep(2);
  }, [canProceed, step, user, router, selectedCourt, selectedDate, chosen, qc, bookingType, withLight, dateLabel, total]);

  const meta = checkoutRef.current;

  return (
    <div className="mx-auto max-w-6xl px-6 pb-40 pt-28">
      <PageNav variant="cta" className="mb-6" />
      <header className="max-w-2xl">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-purple" />
          Tenis
        </span>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
          Booking Lapangan <span className="text-gradient-neon">Tenis</span>
        </h1>
        <p className="mt-3 text-ink-500">
          Pilih lapangan, tanggal, lalu tarif (insidentil/abonemen, dengan atau tanpa lampu).
        </p>
      </header>

      <div className="mt-8">
        <Stepper steps={STEPS} current={stepIndex} />
      </div>

      {/* ============ STEP ① — PILIH LAPANGAN (GSAP accordion) ============ */}
      {step === 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-ink-900">Pilih Lapangan</h2>
          <p className="mt-1 text-sm text-ink-400">
            Arahkan kursor ke kartu untuk melihat detail lapangan.
          </p>

          {courtsLoading ? (
            <div className="mt-4 flex gap-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-[300px] flex-1 animate-pulse rounded-3xl bg-ink-900/5" />
              ))}
            </div>
          ) : !courts.length ? (
            <p className="mt-4 rounded-2xl bg-ink-900/5 p-6 text-center text-ink-500">
              Belum ada lapangan tenis tersedia.
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
                  sportLabel="Tenis"
                  priceFrom={priceFrom}
                  defaultSurface="Hard court"
                  onSelect={setSelectedCourtId}
                  onHover={handleHover}
                  onLeave={handleLeave}
                  registerRef={registerRef}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ============ STEP ② — JADWAL & TARIF ============ */}
      {step === 1 && (
        <div className="mt-10 space-y-10">
          {/* Tanggal */}
          <section>
            <h2 className="text-lg font-semibold text-ink-900">Pilih Tanggal</h2>
            <div className="mt-4">
              <DatePicker pills={pills} selected={selectedDate} onSelect={setSelectedDate} />
            </div>
          </section>

          {/* Tarif + lampu */}
          <section>
            <h2 className="text-lg font-semibold text-ink-900">Tarif</h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {(["insidentil", "abonemen"] as BookingType[]).map((bt) => {
                const active = bookingType === bt;
                const p = priceOf(bt, withLight);
                const locked = bt === "abonemen" && !hasApproved;
                return (
                  <button
                    key={bt}
                    type="button"
                    onClick={() => setBookingType(bt)}
                    aria-pressed={active}
                    className={`rounded-2xl border p-5 text-left outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-neon-purple/30 ${
                      active
                        ? "border-neon-pink bg-neon-pink/[0.04] ring-2 ring-neon-pink"
                        : "cursor-pointer border-ink-900/10 hover:border-ink-900/25"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <p className="font-semibold capitalize text-ink-900">{bt}</p>
                      {locked && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                          butuh registrasi
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-2xl font-bold text-ink-900">
                      {p ? formatRupiah(p) : "—"}
                      <span className="text-sm font-normal text-ink-400">/jam</span>
                    </p>
                    <p className="mt-1 text-sm text-ink-500">
                      {bt === "insidentil" ? "Tarif reguler, bebas dipesan." : "Tarif anggota terdaftar."}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Toggle lampu */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-ink-700">Pencahayaan:</span>
              <div className="inline-flex rounded-full border border-ink-900/10 p-1" role="radiogroup" aria-label="Pencahayaan">
                {[true, false].map((wl) => (
                  <button
                    key={String(wl)}
                    type="button"
                    role="radio"
                    aria-checked={withLight === wl}
                    onClick={() => setWithLight(wl)}
                    className={`rounded-full px-4 py-2 text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-neon-purple/30 ${
                      withLight === wl ? "bg-ink-900 text-white" : "text-ink-600 hover:text-ink-900"
                    }`}
                  >
                    {wl ? "Dengan lampu" : "Tanpa lampu"}
                  </button>
                ))}
              </div>
              <span className="text-sm text-ink-400">
                {priceOf(bookingType, true) && priceOf(bookingType, false)
                  ? `Hemat ${formatRupiah(Number(priceOf(bookingType, true)) - Number(priceOf(bookingType, false)))}/jam tanpa lampu`
                  : null}
              </span>
            </div>

            {/* Gating abonemen */}
            {needsRegistration && (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="font-semibold text-amber-800">Tarif abonemen butuh registrasi</p>
                <p className="mt-1 text-sm text-amber-800/80">
                  {!user
                    ? "Masuk dulu, lalu ajukan registrasi abonemen untuk memakai tarif ini."
                    : hasPending
                      ? "Pengajuanmu sedang menunggu persetujuan admin. Sementara ini gunakan tarif insidentil."
                      : "Ajukan registrasi abonemen dan tunggu persetujuan admin."}
                </p>
                <Link
                  href={user ? "/harga/tenis/abonemen/registration" : "/login?redirect=/booking/tennis"}
                  className="mt-3 inline-flex rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white outline-none transition-colors duration-200 hover:bg-neon-pink focus-visible:ring-4 focus-visible:ring-neon-purple/40"
                >
                  {user ? (hasPending ? "Lihat Pengajuan" : "Registrasi Abonemen") : "Masuk"}
                </Link>
              </div>
            )}
          </section>

          {/* Slot */}
          <section>
            <h2 className="text-lg font-semibold text-ink-900">Pilih Slot</h2>
            <div className="mt-5">
              <ScheduleGrid
                court={selectedCourt}
                result={availability}
                loading={slotsLoading}
                selectedIds={selectedIds}
                onToggle={toggleSlot}
                onJoinWaitlist={onJoinWaitlist}
              />
            </div>
          </section>
        </div>
      )}

      {/* ============ STEP ③–④ — REVIEW + PAY (panel generik, inline) ============ */}
      {step === 2 && meta && (
        <div className="mt-10">
          <CheckoutPanel
            open
            variant="inline"
            subtitle={meta.subtitle}
            lines={meta.lines}
            subtotal={meta.total}
            total={meta.total}
            itemNoun="booking"
            run={meta.runner}
            allowSimulateFailure
            successHref="/dashboard"
            successLabel="Lihat Booking Saya"
            onPhase={setPanelPhase}
            onClose={() => {
              setStep(1);
              setPanelPhase("review");
            }}
          />
        </div>
      )}

      {/* ============ Footer navigasi (disembunyikan di layar checkout) ============ */}
      {step < 2 && (
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-900/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-sm text-ink-500">
              {step === 0
                ? (selectedCourt?.name ?? "Belum pilih lapangan")
                : chosen.length > 0
                  ? `${chosen.length} slot · ${selectedCourt?.name ?? ""} · ${bookingType}${withLight ? "" : " (tanpa lampu)"}`
                  : "Belum ada slot dipilih"}
            </p>
            {step === 0 ? (
              <p className="text-sm font-medium text-ink-900">
                {priceFrom ? `Mulai ${formatRupiah(priceFrom)}/jam` : "—"}
              </p>
            ) : (
              <p className="text-2xl font-semibold text-ink-900">{formatRupiah(total)}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={back}
                className="rounded-full border border-ink-900/15 px-6 py-3 text-sm font-medium text-ink-700 outline-none transition-colors duration-200 hover:bg-ink-900/5 focus-visible:ring-4 focus-visible:ring-neon-purple/30"
              >
                Kembali
              </button>
            )}
            <button
              type="button"
              onClick={next}
              disabled={!canProceed}
              className={`inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-neon-purple/40 ${
                !canProceed
                  ? "cursor-not-allowed bg-ink-900/10 text-ink-400"
                  : "bg-ink-900 text-white hover:bg-neon-pink"
              }`}
            >
              Lanjut <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Dialog masuk antrean untuk slot yang sudah dibooking */}
      {waitlistSlot && selectedCourt && (
        <WaitlistDialog
          open
          courtName={selectedCourt.name}
          dateLabel={dateLabel}
          start={waitlistSlot.start}
          end={waitlistSlot.end}
          submitting={joinWaitlist.isPending}
          success={joinWaitlist.isSuccess}
          error={joinWaitlist.isError ? getErrorMessage(joinWaitlist.error) : ""}
          onConfirm={confirmWaitlist}
          onClose={closeWaitlist}
        />
      )}
    </div>
  );
}
