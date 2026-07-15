"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { usePoolSessions, usePoolTicketTypes, usePoolGroupDiscount } from "@/lib/queries";
import { formatRupiah, formatDateID } from "@/lib/format";
import { resolveGroupDiscount } from "@/lib/groupDiscount";
import { makePoolTicketRunner } from "@/lib/pool-checkout";
import type { CheckoutLine, CheckoutRunner } from "@/lib/checkout";
import { useAuth } from "@/lib/auth-context";
import PageNav from "@/components/PageNav";
import Stepper from "./Stepper";
import PoolSessionCard from "./PoolSessionCard";
import CheckoutPanel from "./CheckoutPanel";

type Mode = "satuan" | "group";
type Phase = "review" | "processing" | "paid" | "failed" | "error";
const STEPS = ["Pilih", "Review", "Pay"];

const MODES: { id: Mode; label: string; desc: string }[] = [
  { id: "satuan", label: "Beli Satuan", desc: "Tiket untuk diri sendiri / sedikit orang." },
  { id: "group", label: "Group", desc: "Rombongan — diskon otomatis 15+, 30+, 50+ orang." },
];

const TIER_HINT = [
  { q: "15+ orang", d: "−10%" },
  { q: "30+ orang", d: "−12,5%" },
  { q: "50+ orang", d: "−20%" },
];

interface CheckoutMeta {
  runner: CheckoutRunner;
  subtitle: string;
  lines: CheckoutLine[];
  subtotal: number;
  discount: { label: string; amount: number } | null;
  total: number;
  itemNoun: string;
  allowFailure: boolean;
  successLabel: string;
}

function QtyButton({ sign, onClick, disabled }: { sign: "−" | "+"; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={sign === "+" ? "Tambah" : "Kurangi"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-900/15 text-lg font-semibold text-ink-700 outline-none transition-colors duration-200 hover:border-ink-900/40 focus-visible:ring-4 focus-visible:ring-neon-purple/30 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {sign}
    </button>
  );
}

export default function PoolWizard() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: sessions = [], isLoading: sessionsLoading } = usePoolSessions();
  const { data: ticketTypes = [] } = usePoolTicketTypes();
  const { data: tiers = [] } = usePoolGroupDiscount();

  const [screen, setScreen] = useState<"pilih" | "checkout">("pilih");
  const [panelPhase, setPanelPhase] = useState<Phase>("review");
  const [mode, setMode] = useState<Mode>("satuan");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const checkoutRef = useRef<CheckoutMeta | null>(null);

  useEffect(() => {
    if (selectedSessionId || !sessions.length) return;
    const firstOpen = sessions.find((s) => s.status === "open" && s.capacity - s.booked_count > 0);
    if (firstOpen) setSelectedSessionId(firstOpen.id);
  }, [sessions, selectedSessionId]);

  const selectedSession = useMemo(
    () => sessions.find((s) => s.id === selectedSessionId),
    [sessions, selectedSessionId],
  );
  const remaining = selectedSession ? Math.max(0, selectedSession.capacity - selectedSession.booked_count) : 0;

  const totalPeople = useMemo(() => Object.values(quantities).reduce((a, b) => a + b, 0), [quantities]);
  const ticketTotal = useMemo(
    () => ticketTypes.reduce((sum, t) => sum + (quantities[t.id] ?? 0) * Number(t.price), 0),
    [ticketTypes, quantities],
  );
  const canAdd = totalPeople < remaining;

  const canProceed = Boolean(selectedSessionId) && totalPeople > 0;
  const summaryText =
    totalPeople > 0 ? `${totalPeople} orang · ${selectedSession?.name ?? ""}` : "Belum ada tiket dipilih";

  const setQty = useCallback((typeId: string, next: number) => {
    setQuantities((q) => ({ ...q, [typeId]: Math.max(0, next) }));
  }, []);

  const stepIndex = screen === "pilih" ? 0 : panelPhase === "review" ? 1 : 2;

  // "Lanjut" dari Pilih → login gate → bangun runner tiket + meta → masuk checkout.
  const goCheckout = useCallback(() => {
    if (!canProceed || !selectedSession) return;
    if (!user) {
      router.push("/login?redirect=/booking/pool");
      return;
    }
    const chosen = ticketTypes.filter((t) => (quantities[t.id] ?? 0) > 0);
    const items = chosen.map((t) => ({ ticketTypeId: t.id, quantity: quantities[t.id] }));
    const lines = chosen.map((t) => ({
      label: `${t.name} × ${quantities[t.id]}`,
      amount: quantities[t.id] * Number(t.price),
    }));
    const preview = resolveGroupDiscount(totalPeople, ticketTotal, tiers);
    checkoutRef.current = {
      runner: makePoolTicketRunner({
        sessionId: selectedSession.id,
        items,
        qc,
        onConsumed: () => setQuantities({}),
      }),
      subtitle: `${selectedSession.name} · ${formatDateID(selectedSession.session_date)}`,
      lines,
      subtotal: ticketTotal,
      discount:
        preview.percent > 0
          ? {
              label: `Diskon grup ${String(preview.percent).replace(".", ",")}% (${totalPeople} orang)`,
              amount: preview.discount,
            }
          : null,
      total: ticketTotal - preview.discount,
      itemNoun: "tiket",
      allowFailure: true,
      successLabel: "Lihat Tiket Saya",
    };
    setPanelPhase("review");
    setScreen("checkout");
  }, [canProceed, user, router, selectedSession, ticketTypes, quantities, totalPeople, ticketTotal, tiers, qc]);

  const meta = checkoutRef.current;

  return (
    <div className="mx-auto max-w-4xl px-6 pb-40 pt-28">
      <PageNav variant="cta" className="mb-6" />
      <header className="max-w-2xl">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-blue" />
          Kolam Renang
        </span>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
          Booking <span className="text-gradient-neon">Kolam Renang</span>
        </h1>
        <p className="mt-3 text-ink-500">
          Beli tiket satuan atau rombongan. Ingin langganan?{" "}
          <a href="/membership/daftar" className="font-medium text-neon-purple hover:text-neon-pink">
            Daftar membership →
          </a>
        </p>
      </header>

      <div className="mt-8">
        <Stepper steps={STEPS} current={stepIndex} />
      </div>

      {/* ============ CHECKOUT (Review + Pay) ============ */}
      {screen === "checkout" && meta ? (
        <div className="mt-10">
          <CheckoutPanel
            open
            variant="inline"
            subtitle={meta.subtitle}
            lines={meta.lines}
            discount={meta.discount}
            subtotal={meta.subtotal}
            total={meta.total}
            itemNoun={meta.itemNoun}
            run={meta.runner}
            allowSimulateFailure={meta.allowFailure}
            successHref="/dashboard"
            successLabel={meta.successLabel}
            onPhase={setPanelPhase}
            onClose={() => {
              setScreen("pilih");
              setPanelPhase("review");
            }}
          />
        </div>
      ) : (
        /* ============ STEP 1 — PILIH ============ */
        <div className="mt-10 space-y-10">
          <section>
            <h2 className="text-lg font-semibold text-ink-900">1. Pilih Tanggal Sesi</h2>
            {sessionsLoading ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-36 animate-pulse rounded-2xl bg-ink-900/5" />
                ))}
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sessions.map((s) => (
                  <PoolSessionCard
                    key={s.id}
                    session={s}
                    selected={s.id === selectedSessionId}
                    onSelect={setSelectedSessionId}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ink-900">2. Jenis Penyewaan</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  aria-pressed={mode === m.id}
                  className={`rounded-2xl border p-5 text-left outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-neon-purple/30 ${
                    mode === m.id
                      ? "border-neon-pink bg-neon-pink/[0.04] ring-2 ring-neon-pink"
                      : "cursor-pointer border-ink-900/10 hover:border-ink-900/25"
                  }`}
                >
                  <p className="font-semibold text-ink-900">{m.label}</p>
                  <p className="mt-1 text-sm text-ink-500">{m.desc}</p>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ink-900">3. Jumlah Tiket</h2>
            <div className="mt-4 space-y-3">
              {mode === "group" && (
                <div className="flex flex-wrap gap-2 rounded-2xl bg-neon-purple/[0.06] p-4 text-sm">
                  <span className="font-semibold text-ink-700">Diskon grup otomatis:</span>
                  {TIER_HINT.map((t) => (
                    <span key={t.q} className="text-ink-600">
                      {t.q} <b className="text-neon-purple">{t.d}</b>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-sm text-ink-500">
                Sisa kuota sesi ini: <b className="text-ink-900">{remaining}</b> orang
              </p>
              {ticketTypes.map((t) => {
                const qty = quantities[t.id] ?? 0;
                return (
                  <div
                    key={t.id}
                    className="flex flex-col gap-3 rounded-2xl border border-ink-900/10 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-ink-900">{t.name}</p>
                      <p className="text-sm text-ink-400">{formatRupiah(t.price)} / orang</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <QtyButton sign="−" onClick={() => setQty(t.id, qty - 1)} disabled={qty === 0} />
                        <span className="w-8 text-center text-lg font-semibold text-ink-900">{qty}</span>
                        <QtyButton sign="+" onClick={() => setQty(t.id, qty + 1)} disabled={!canAdd} />
                      </div>
                      <span className="w-28 text-right font-semibold text-ink-900">
                        {formatRupiah(qty * Number(t.price))}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* ============ Footer (hanya di layar Pilih) ============ */}
      {screen === "pilih" && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-900/10 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4">
            <div>
              <p className="text-sm text-ink-500">{summaryText}</p>
              <p className="text-2xl font-semibold text-ink-900">{formatRupiah(ticketTotal)}</p>
            </div>
            <button
              type="button"
              onClick={goCheckout}
              disabled={!canProceed}
              className={`inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-neon-purple/40 ${
                !canProceed ? "cursor-not-allowed bg-ink-900/10 text-ink-400" : "bg-ink-900 text-white hover:bg-neon-pink"
              }`}
            >
              Lanjut <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
