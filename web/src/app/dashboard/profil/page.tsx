"use client";

import { useMemo, useState } from "react";
import PhotoUpload from "@/components/PhotoUpload";
import { Card, PageHeading } from "@/components/dashboard/common";
import { useAuth, type AuthUser } from "@/lib/auth-context";
import { useUpdateProfile, type UpdateProfileBody } from "@/lib/queries";
import { getErrorMessage } from "@/lib/error";

const inputCls =
  "mt-1 w-full rounded-xl border border-ink-900/15 px-4 py-3 text-sm outline-none transition-colors focus:border-neon-purple";
const readOnlyCls =
  "mt-1 w-full cursor-not-allowed rounded-xl border border-ink-900/10 bg-ink-900/[0.03] px-4 py-3 text-sm text-ink-500";

interface FormState {
  full_name: string;
  nickname: string;
  phone: string;
  photo_url: string | null;
}

function initialForm(user: AuthUser): FormState {
  return {
    full_name: user.full_name,
    nickname: user.nickname ?? "",
    phone: user.phone,
    photo_url: user.photo_url,
  };
}

function ProfileForm({ user }: { user: AuthUser }) {
  const { setUser } = useAuth();
  const update = useUpdateProfile();
  const [form, setForm] = useState<FormState>(() => initialForm(user));
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const awal = useMemo(() => initialForm(user), [user]);

  // Kirim HANYA field yang berubah — backend menolak body kosong (422) dan
  // mengirim ulang nomor yang sama tidak perlu memicu cek duplikat.
  const perubahan = useMemo<UpdateProfileBody>(() => {
    const d: UpdateProfileBody = {};
    if (form.full_name.trim() !== awal.full_name) d.full_name = form.full_name.trim();
    if (form.nickname.trim() !== (awal.nickname ?? "")) d.nickname = form.nickname.trim();
    if (form.phone.trim() !== awal.phone) d.phone = form.phone.trim();
    if (form.photo_url !== awal.photo_url) d.photo_url = form.photo_url;
    return d;
  }, [form, awal]);

  const adaPerubahan = Object.keys(perubahan).length > 0;

  function set<K extends keyof FormState>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setSaved(false);
      setError("");
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!adaPerubahan) return;
    setError("");
    try {
      const terbaru = await update.mutateAsync(perubahan);
      setUser(terbaru); // navbar & sapaan ikut berubah tanpa reload
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal menyimpan perubahan"));
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card title="Foto Profil">
        <p className="-mt-2 text-sm text-ink-500">
          Foto diperkecil otomatis di perangkatmu, lalu diunggah ke penyimpanan kami.
        </p>
        <div className="mt-4">
          <PhotoUpload
            value={form.photo_url}
            onChange={(url) => {
              setForm((f) => ({ ...f, photo_url: url }));
              setSaved(false);
              setError("");
            }}
            endpoint="/uploads/avatar"
            shape="round"
            alt="Foto profil"
            hint="JPG/PNG/WebP, maksimal 2 MB."
          />
        </div>
        {form.photo_url !== awal.photo_url && (
          <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Foto sudah terunggah, tapi <strong>belum terpasang</strong> ke akunmu. Tekan
            &ldquo;Simpan perubahan&rdquo; di bawah untuk memasangnya.
          </p>
        )}
        {form.photo_url && (
          <button
            type="button"
            onClick={() => {
              setForm((f) => ({ ...f, photo_url: null }));
              setSaved(false);
            }}
            className="mt-3 text-sm font-medium text-ink-400 outline-none transition-colors hover:text-red-600 focus-visible:text-red-600"
          >
            Hapus foto
          </button>
        )}
      </Card>

      <Card title="Data Pribadi">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Nama Lengkap
            <input
              required
              minLength={2}
              maxLength={150}
              autoComplete="name"
              value={form.full_name}
              onChange={set("full_name")}
              className={inputCls}
            />
          </label>

          <label className="block text-sm font-medium">
            Nama Panggilan
            <input
              required
              minLength={2}
              maxLength={60}
              autoComplete="nickname"
              value={form.nickname}
              onChange={set("nickname")}
              className={inputCls}
              placeholder="Nama sapaanmu"
            />
            <span className="mt-1 block text-xs font-normal text-ink-400">
              Dipakai staf untuk menyapa &amp; mengenalimu di meja depan.
            </span>
          </label>

          <label className="block text-sm font-medium">
            Telepon
            <input
              required
              inputMode="tel"
              autoComplete="tel"
              maxLength={20}
              value={form.phone}
              onChange={set("phone")}
              className={inputCls}
            />
          </label>

          <label className="block text-sm font-medium text-ink-500">
            Email
            <input value={user.email} readOnly disabled className={readOnlyCls} />
            <span className="mt-1 block text-xs font-normal text-ink-400">
              Email dan password tidak dapat diubah sendiri — hubungi staf bila perlu.
            </span>
          </label>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-ink-900/10 pt-6 text-sm">
          <div>
            <dt className="text-ink-400">Role</dt>
            <dd className="font-medium capitalize">{user.role}</dd>
          </div>
          <div>
            <dt className="text-ink-400">Email terverifikasi</dt>
            <dd className="font-medium">{user.email_verified ? "Ya" : "Belum"}</dd>
          </div>
        </dl>
      </Card>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
      {saved && !adaPerubahan && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          Perubahan tersimpan.
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={!adaPerubahan || update.isPending}
          className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neon-pink disabled:cursor-not-allowed disabled:opacity-40"
        >
          {update.isPending ? "Menyimpan…" : "Simpan perubahan"}
        </button>
        {adaPerubahan && !update.isPending && (
          <button
            type="button"
            onClick={() => {
              setForm(awal);
              setError("");
            }}
            className="text-sm font-medium text-ink-400 outline-none transition-colors hover:text-ink-900 focus-visible:text-ink-900"
          >
            Batalkan perubahan
          </button>
        )}
      </div>
    </form>
  );
}

export default function ProfilPage() {
  const { user } = useAuth();
  if (!user) return null; // gate login ada di layout /dashboard

  return (
    <div className="space-y-6">
      <PageHeading title="Profil Saya" desc="Ubah data akun dan foto profilmu." />
      {/* key: paksa form ter-reset kalau identitas user berganti (mis. logout→login) */}
      <ProfileForm key={user.id} user={user} />
    </div>
  );
}
