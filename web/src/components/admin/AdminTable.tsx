"use client";

import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  loading: boolean;
  isError?: boolean;
  idOf: (row: T) => string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  busyId?: string;
  emptyText?: string;
}

export default function AdminTable<T>({
  columns,
  rows,
  loading,
  isError,
  idOf,
  onEdit,
  onDelete,
  busyId,
  emptyText = "Belum ada data.",
}: Props<T>) {
  const hasActions = Boolean(onEdit || onDelete);

  if (loading) {
    return (
      <div className="mt-6 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-ink-900/5" />
        ))}
      </div>
    );
  }
  if (isError) {
    return (
      <p className="mt-6 rounded-2xl bg-red-50 p-6 text-center text-sm text-red-600">
        Gagal memuat. Pastikan login sebagai admin.
      </p>
    );
  }
  if (rows.length === 0) {
    return <p className="mt-6 rounded-2xl bg-ink-900/5 p-8 text-center text-ink-500">{emptyText}</p>;
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-900/10">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-ink-900/10 bg-ink-900/[0.02] text-left text-ink-500">
            {columns.map((c) => (
              <th key={c.key} className="whitespace-nowrap px-4 py-3 font-medium">
                {c.label}
              </th>
            ))}
            {hasActions && <th className="px-4 py-3 text-right font-medium">Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const id = idOf(row);
            const busy = busyId === id;
            return (
              <tr key={id} className="border-b border-ink-900/5 last:border-0 hover:bg-ink-900/[0.015]">
                {columns.map((c) => (
                  <td key={c.key} className="whitespace-nowrap px-4 py-3 text-ink-800">
                    {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "—")}
                  </td>
                ))}
                {hasActions && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(row)}
                          disabled={busy}
                          className="font-medium text-neon-purple outline-none transition-colors hover:text-neon-pink disabled:opacity-50"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(row)}
                          disabled={busy}
                          className="font-medium text-ink-400 outline-none transition-colors hover:text-red-600 disabled:opacity-50"
                        >
                          {busy ? "…" : "Hapus"}
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
