"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import AdminTable from "@/components/admin/AdminTable";
import { pill } from "@/components/admin/cells";

interface Setting {
  id: string;
  key: string;
  value: unknown;
  description: string | null;
  group_name: string;
  updated_at: string;
}

export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const { data: rows = [], isLoading, isError } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => apiGet<Setting[]>("/settings"),
  });

  const [editing, setEditing] = useState<Setting | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editing) {
      setText(JSON.stringify(editing.value, null, 2));
      setError("");
    }
  }, [editing]);

  const save = useMutation({
    mutationFn: (v: { key: string; value: unknown }) => apiPut(`/settings/${v.key}`, { value: v.value }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      setEditing(null);
    },
    onError: (e) => setError(getErrorMessage(e)),
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setError("JSON tidak valid. Periksa tanda kurung/koma.");
      return;
    }
    setError("");
    save.mutate({ key: editing.key, value: parsed });
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">Admin</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">Pengaturan</h1>
      <p className="mt-1 text-ink-500">
        Konfigurasi situs (harga, diskon grup, aturan pembatalan, dll). Nilai berupa JSON.
      </p>

      <AdminTable<Setting>
        idOf={(r) => r.id}
        loading={isLoading}
        isError={isError}
        rows={rows}
        emptyText="Belum ada pengaturan."
        onEdit={(r) => setEditing(r)}
        columns={[
          { key: "key", label: "Kunci", render: (r) => <span className="font-mono text-sm">{r.key}</span> },
          { key: "group_name", label: "Grup", render: (r) => pill(r.group_name) },
          {
            key: "value",
            label: "Nilai",
            render: (r) => (
              <span className="block max-w-md truncate font-mono text-xs text-ink-500">
                {JSON.stringify(r.value)}
              </span>
            ),
          },
        ]}
      />

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !save.isPending) setEditing(null);
          }}
        >
          <form
            onSubmit={onSubmit}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8"
          >
            <h3 className="font-mono text-lg font-semibold text-ink-900">{editing.key}</h3>
            {editing.description && <p className="mt-1 text-sm text-ink-500">{editing.description}</p>}

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
              rows={14}
              className="mt-4 w-full rounded-xl border border-ink-900/15 bg-ink-900/[0.02] px-4 py-3 font-mono text-sm text-ink-900 outline-none focus:border-neon-purple"
            />

            {error && (
              <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row-reverse">
              <button
                type="submit"
                disabled={save.isPending}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white outline-none transition-colors duration-200 hover:bg-neon-pink focus-visible:ring-4 focus-visible:ring-neon-purple/40 disabled:opacity-50"
              >
                {save.isPending ? "Menyimpan…" : "Simpan"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                disabled={save.isPending}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-ink-900/15 px-6 py-3 text-sm font-medium text-ink-700 outline-none transition-colors duration-200 hover:bg-ink-900/5 disabled:opacity-50"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
