"use client";

import { useEffect, useState } from "react";

export type FieldType =
  | "text"
  | "number"
  | "boolean"
  | "select"
  | "time"
  | "date"
  | "datetime"
  | "textarea"
  | "csv";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  required?: boolean;
  optional?: boolean; // bila kosong → tidak dikirim (untuk field opsional backend)
  placeholder?: string;
  help?: string;
}

type FormValue = string | boolean;

interface Props {
  open: boolean;
  title: string;
  fields: FieldDef[];
  initial: Record<string, unknown>;
  submitting: boolean;
  error?: string;
  onSubmit: (body: Record<string, unknown>) => void;
  onClose: () => void;
}

const inputCls =
  "mt-1 w-full rounded-xl border border-ink-900/15 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition-colors focus:border-neon-purple";

function toInitial(fields: FieldDef[], initial: Record<string, unknown>): Record<string, FormValue> {
  const v: Record<string, FormValue> = {};
  for (const f of fields) {
    const raw = initial[f.name];
    if (f.type === "boolean") v[f.name] = Boolean(raw);
    else if (f.type === "csv") v[f.name] = Array.isArray(raw) ? raw.join(", ") : (raw as string) ?? "";
    else v[f.name] = raw == null ? "" : String(raw);
  }
  return v;
}

/** Ubah nilai form → body API (typed + omit optional kosong). */
function toBody(fields: FieldDef[], values: Record<string, FormValue>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const f of fields) {
    const val = values[f.name];
    if (f.type === "boolean") {
      body[f.name] = Boolean(val);
      continue;
    }
    const str = String(val ?? "").trim();
    if (f.type === "csv") {
      const arr = str ? str.split(",").map((s) => s.trim()).filter(Boolean) : [];
      if (arr.length || !f.optional) body[f.name] = arr;
      continue;
    }
    if (str === "" && f.optional) continue; // jangan kirim optional kosong
    body[f.name] = f.type === "number" ? Number(str) : str;
  }
  return body;
}

export default function AdminForm({
  open,
  title,
  fields,
  initial,
  submitting,
  error,
  onSubmit,
  onClose,
}: Props) {
  const [values, setValues] = useState<Record<string, FormValue>>(() => toInitial(fields, initial));

  useEffect(() => {
    if (open) setValues(toInitial(fields, initial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, submitting, onClose]);

  if (!open) return null;

  const set = (name: string, v: FormValue) => setValues((s) => ({ ...s, [name]: v }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8">
        <h3 className="text-xl font-semibold text-ink-900">{title}</h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(toBody(fields, values));
          }}
          className="mt-5 space-y-4"
        >
          {fields.map((f) => (
            <div key={f.name}>
              {f.type === "boolean" ? (
                <label className="flex items-center gap-2.5 text-sm font-medium text-ink-700">
                  <input
                    type="checkbox"
                    checked={Boolean(values[f.name])}
                    onChange={(e) => set(f.name, e.target.checked)}
                    className="h-4 w-4 rounded border-ink-900/30 accent-neon-purple"
                  />
                  {f.label}
                </label>
              ) : (
                <label className="block text-sm font-medium text-ink-700">
                  {f.label}
                  {f.type === "select" ? (
                    <select
                      required={f.required}
                      value={String(values[f.name] ?? "")}
                      onChange={(e) => set(f.name, e.target.value)}
                      className={inputCls}
                    >
                      <option value="">— pilih —</option>
                      {f.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "textarea" ? (
                    <textarea
                      rows={2}
                      required={f.required}
                      value={String(values[f.name] ?? "")}
                      onChange={(e) => set(f.name, e.target.value)}
                      placeholder={f.placeholder}
                      className={inputCls}
                    />
                  ) : (
                    <input
                      type={
                        f.type === "number"
                          ? "number"
                          : f.type === "time"
                            ? "time"
                            : f.type === "date"
                              ? "date"
                              : f.type === "datetime"
                                ? "datetime-local"
                                : "text"
                      }
                      required={f.required}
                      value={String(values[f.name] ?? "")}
                      onChange={(e) => set(f.name, e.target.value)}
                      placeholder={f.placeholder}
                      className={inputCls}
                    />
                  )}
                </label>
              )}
              {f.help && <p className="mt-1 text-xs text-ink-400">{f.help}</p>}
            </div>
          ))}

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
          )}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row-reverse">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white outline-none transition-colors duration-200 hover:bg-neon-pink focus-visible:ring-4 focus-visible:ring-neon-purple/40 disabled:opacity-50"
            >
              {submitting ? "Menyimpan…" : "Simpan"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-ink-900/15 px-6 py-3 text-sm font-medium text-ink-700 outline-none transition-colors duration-200 hover:bg-ink-900/5 disabled:opacity-50"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
