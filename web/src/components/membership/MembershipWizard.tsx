"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Stepper from "@/components/booking/Stepper";
import CheckoutPanel from "@/components/booking/CheckoutPanel";
import PhotoUpload from "@/components/membership/PhotoUpload";
import MemberCard from "@/components/membership/MemberCard";
import { useAuth } from "@/lib/auth-context";
import { useMembershipPlans, useMyMemberships, type MembershipPlan } from "@/lib/queries";
import { makeMembershipRunner } from "@/lib/membership-checkout";
import type { CheckoutRunner } from "@/lib/checkout";
import { formatRupiah, formatDateID } from "@/lib/format";

const STEPS = ["Pilih Paket", "Data Member", "Review"];

const GENDERS = [
  { value: "laki_laki", label: "Laki-laki" },
  { value: "perempuan", label: "Perempuan" },
  { value: "lainnya", label: "Lainnya" },
];

const inputCls =
  "mt-1 w-full rounded-xl border border-ink-900/15 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition-colors focus:border-neon-purple";

interface Form {
  member_name: string;
  phone: string;
  email: string;
  birth_date: string;
  gender: string;
  city: string;
  photo_url: string;
  medical_notes: string;
  start_date: string;
  terms_accepted: boolean;
  marketing_opt_in: boolean;
}

const emptyForm: Form = {
  member_name: "",
  phone: "",
  email: "",
  birth_date: "",
  gender: "",
  city: "",
  photo_url: "",
  medical_notes: "",
  start_date: "",
  terms_accepted: false,
  marketing_opt_in: false,
};

function addDays(dateStr: string, days: number): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function MembershipWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: plans = [], isLoading } = useMembershipPlans();

  const [step, setStep] = useState(0);
  const [planId, setPlanId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [showErrors, setShowErrors] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [done, setDone] = useState(false);
  const runnerRef = useRef<CheckoutRunner | null>(null);

  // Membership hasil aktivasi (untuk kartu) — di-refetch usai bayar.
  const { data: myMemberships = [] } = useMyMemberships();
  const activated = done ? myMemberships[0] : undefined;

  const today = new Date().toISOString().slice(0, 10);

  // Prefill dari akun saat user tersedia (hanya jika field masih kosong).
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      member_name: f.member_name || user.full_name,
      phone: f.phone || user.phone,
      email: f.email || user.email,
    }));
  }, [user]);

  const plan = useMemo<MembershipPlan | undefined>(
    () => plans.find((p) => p.id === planId),
    [plans, planId],
  );
  const endDate = plan ? addDays(form.start_date, plan.duration_days) : "";

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const dataValid = Boolean(
    form.member_name.trim() &&
      form.birth_date &&
      form.gender &&
      form.city.trim() &&
      form.photo_url &&
      form.start_date >= today &&
      form.terms_accepted,
  );

  function goFromPlan() {
    if (!planId) return;
    if (!user) {
      router.push("/login?redirect=/membership/daftar");
      return;
    }
    setStep(1);
  }

  function goFromData() {
    if (!dataValid) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setStep(2);
  }

  function onPay() {
    if (!plan) return;
    runnerRef.current = makeMembershipRunner({
      planId: plan.id,
      memberData: {
        member_name: form.member_name.trim(),
        birth_date: form.birth_date,
        gender: form.gender,
        city: form.city.trim(),
        photo_url: form.photo_url,
        medical_notes: form.medical_notes.trim() || undefined,
        start_date: form.start_date,
        terms_accepted: form.terms_accepted,
        marketing_opt_in: form.marketing_opt_in,
      },
      qc,
    });
    setCheckoutOpen(true);
  }

  const err = (bad: boolean) => (showErrors && bad ? "border-red-400" : "");

  return (
    <div>
      <header className="max-w-2xl">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-pink" />
          Membership
        </span>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
          Daftar <span className="text-gradient-neon">Membership</span>
        </h1>
      </header>

      <div className="mt-8">
        <Stepper steps={STEPS} current={step} />
      </div>

      {/* ---- Langkah 1: Pilih Paket ---- */}
      {step === 0 && (
        <section className="mt-10">
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-52 animate-pulse rounded-2xl bg-ink-900/5" />
              ))}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((p) => {
                const active = p.id === planId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlanId(p.id)}
                    aria-pressed={active}
                    className={`flex flex-col rounded-2xl border p-6 text-left outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-neon-purple/30 ${
                      active
                        ? "border-neon-purple bg-neon-purple/[0.04]"
                        : "border-ink-900/10 bg-white hover:border-neon-purple/50"
                    }`}
                  >
                    <h3 className="text-lg font-semibold text-ink-900">{p.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-ink-900">{formatRupiah(p.price)}</span>
                      <span className="text-sm text-ink-400">/{p.duration_days} hari</span>
                    </div>
                    {Number(p.discount_percent) > 0 && (
                      <p className="mt-1 text-xs text-neon-purple">Diskon {Number(p.discount_percent)}% booking</p>
                    )}
                    <ul className="mt-4 space-y-1.5 text-sm text-ink-500">
                      {p.benefits.slice(0, 4).map((b, i) => (
                        <li key={i}>• {b}</li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={goFromPlan}
              disabled={!planId}
              className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white outline-none transition-colors duration-200 hover:bg-neon-pink focus-visible:ring-4 focus-visible:ring-neon-purple/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Lanjut →
            </button>
          </div>
        </section>
      )}

      {/* ---- Langkah 2: Data Member ---- */}
      {step === 1 && plan && (
        <section className="mt-10 max-w-2xl space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-ink-700">
              Nama Lengkap
              <input
                value={form.member_name}
                onChange={(e) => set("member_name", e.target.value)}
                className={`${inputCls} ${err(!form.member_name.trim())}`}
                placeholder="Nama tercetak di kartu"
              />
            </label>
            <label className="block text-sm font-medium text-ink-700">
              Kota / Kecamatan
              <input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                className={`${inputCls} ${err(!form.city.trim())}`}
                placeholder="mis. Bandung"
              />
            </label>
            <label className="block text-sm font-medium text-ink-400">
              No. HP / WhatsApp
              <input value={form.phone} readOnly disabled className={`${inputCls} bg-ink-900/[0.03]`} />
              <span className="mt-1 block text-xs text-ink-400">Dari akun</span>
            </label>
            <label className="block text-sm font-medium text-ink-400">
              Email
              <input value={form.email} readOnly disabled className={`${inputCls} bg-ink-900/[0.03]`} />
              <span className="mt-1 block text-xs text-ink-400">Dari akun</span>
            </label>
            <label className="block text-sm font-medium text-ink-700">
              Tanggal Lahir
              <input
                type="date"
                max={today}
                value={form.birth_date}
                onChange={(e) => set("birth_date", e.target.value)}
                className={`${inputCls} ${err(!form.birth_date)}`}
              />
            </label>
            <label className="block text-sm font-medium text-ink-700">
              Jenis Kelamin
              <select
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
                className={`${inputCls} ${err(!form.gender)}`}
              >
                <option value="">— pilih —</option>
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <p className="text-sm font-medium text-ink-700">Foto Member</p>
            <div className="mt-2">
              <PhotoUpload value={form.photo_url} onChange={(url) => set("photo_url", url)} invalid={showErrors && !form.photo_url} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-ink-700">
              Tanggal Mulai
              <input
                type="date"
                min={today}
                value={form.start_date}
                onChange={(e) => set("start_date", e.target.value)}
                className={`${inputCls} ${err(!form.start_date || form.start_date < today)}`}
              />
            </label>
            <label className="block text-sm font-medium text-ink-700">
              Berlaku Sampai
              <input
                value={endDate ? formatDateID(endDate) : "—"}
                readOnly
                disabled
                className={`${inputCls} bg-ink-900/[0.03]`}
              />
              <span className="mt-1 block text-xs text-ink-400">Otomatis = mulai + {plan.duration_days} hari</span>
            </label>
          </div>

          <label className="block text-sm font-medium text-ink-700">
            Catatan Kondisi Medis <span className="text-ink-400">(opsional)</span>
            <textarea
              rows={2}
              value={form.medical_notes}
              onChange={(e) => set("medical_notes", e.target.value)}
              className={inputCls}
              placeholder="Alergi, asma, cedera, dll."
            />
          </label>

          <div className="space-y-3 rounded-2xl bg-ink-900/[0.03] p-4">
            <label className="flex items-start gap-2.5 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={form.terms_accepted}
                onChange={(e) => set("terms_accepted", e.target.checked)}
                className={`mt-0.5 h-4 w-4 rounded accent-neon-purple ${showErrors && !form.terms_accepted ? "ring-2 ring-red-400" : ""}`}
              />
              <span>
                Saya menyetujui <b>Syarat &amp; Ketentuan</b> dan <b>waiver risiko</b> keanggotaan.
                {showErrors && !form.terms_accepted && (
                  <span className="ml-1 font-medium text-red-600">Wajib disetujui.</span>
                )}
              </span>
            </label>
            <label className="flex items-start gap-2.5 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={form.marketing_opt_in}
                onChange={(e) => set("marketing_opt_in", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-neon-purple"
              />
              <span>Saya bersedia menerima info promo &amp; acara (opsional).</span>
            </label>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="rounded-full border border-ink-900/15 px-6 py-3 text-sm font-medium text-ink-700 outline-none transition-colors hover:bg-ink-900/5"
            >
              ← Kembali
            </button>
            <button
              type="button"
              onClick={goFromData}
              className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white outline-none transition-colors duration-200 hover:bg-neon-pink focus-visible:ring-4 focus-visible:ring-neon-purple/40"
            >
              Lanjut ke Review →
            </button>
          </div>
        </section>
      )}

      {/* ---- Langkah 3: Review ---- */}
      {step === 2 && plan && !done && (
        <section className="mt-10 grid gap-8 lg:grid-cols-[1fr,380px]">
          <div className="space-y-5">
            <div className="rounded-2xl border border-ink-900/10 p-6">
              <h2 className="text-lg font-semibold text-ink-900">Ringkasan</h2>
              <dl className="mt-4 space-y-2.5 text-sm">
                {[
                  ["Paket", `${plan.name} · ${formatRupiah(plan.price)} / ${plan.duration_days} hari`],
                  ["Nama", form.member_name],
                  ["No. HP", form.phone],
                  ["Email", form.email],
                  ["Tanggal lahir", form.birth_date ? formatDateID(form.birth_date) : "—"],
                  ["Jenis kelamin", GENDERS.find((g) => g.value === form.gender)?.label ?? "—"],
                  ["Kota", form.city],
                  ["Periode", `${formatDateID(form.start_date)} – ${formatDateID(endDate)}`],
                  ["Catatan medis", form.medical_notes || "—"],
                  ["Marketing", form.marketing_opt_in ? "Ya" : "Tidak"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-ink-400">{k}</dt>
                    <dd className="text-right font-medium text-ink-800">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-full border border-ink-900/15 px-6 py-3 text-sm font-medium text-ink-700 outline-none transition-colors hover:bg-ink-900/5"
              >
                ← Ubah Data
              </button>
              <button
                type="button"
                onClick={onPay}
                className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white outline-none transition-colors duration-200 hover:bg-neon-pink focus-visible:ring-4 focus-visible:ring-neon-purple/40"
              >
                Bayar {formatRupiah(plan.price)}
              </button>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-ink-400">Pratinjau Kartu</p>
            <MemberCard
              memberName={form.member_name}
              planName={plan.name}
              photoUrl={form.photo_url}
              cardNumber={null}
              startDate={form.start_date}
              endDate={endDate}
              status="pending"
            />
          </div>
        </section>
      )}

      {/* ---- Sukses: membership aktif + kartu ---- */}
      {done && plan && (
        <section className="mt-10 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
            ✓
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-ink-900">Membership Aktif!</h2>
          <p className="mt-1 text-sm text-ink-500">
            Kartu member kamu siap. Tunjukkan saat masuk fasilitas.
          </p>
          <div className="mt-8">
            <MemberCard
              memberName={activated?.member_name ?? form.member_name}
              planName={activated?.membership_plans?.name ?? plan.name}
              photoUrl={activated?.photo_url ?? form.photo_url}
              cardNumber={activated?.card_number ?? null}
              startDate={activated?.start_date ?? form.start_date}
              endDate={activated?.end_date ?? endDate}
              status={activated?.status ?? "active"}
            />
          </div>
          <Link
            href="/dashboard"
            className="mt-8 rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-neon-pink"
          >
            Lihat di Dashboard →
          </Link>
        </section>
      )}

      {checkoutOpen && runnerRef.current && plan && (
        <CheckoutPanel
          open
          variant="modal"
          subtitle={`Membership · ${plan.name}`}
          lines={[{ label: `${plan.name} · ${plan.duration_days} hari`, amount: Number(plan.price) }]}
          subtotal={Number(plan.price)}
          total={Number(plan.price)}
          itemNoun="membership"
          run={runnerRef.current}
          onDone={() => setDone(true)}
          successHref="/dashboard"
          successLabel="Lihat di Dashboard"
          onClose={() => setCheckoutOpen(false)}
        />
      )}
    </div>
  );
}
