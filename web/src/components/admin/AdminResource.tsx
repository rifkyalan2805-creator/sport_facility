"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "@/lib/error";
import AdminTable, { type Column } from "./AdminTable";
import AdminForm, { type FieldDef } from "./AdminForm";

export interface ResourceConfig<T> {
  title: string;
  description?: string;
  queryKey: string;
  list: () => Promise<T[]>;
  columns: Column<T>[];
  idOf: (row: T) => string;
  addLabel?: string;
  emptyText?: string;
  // CRUD (opsional → read-only bila tak diisi)
  fields?: FieldDef[];
  defaults?: Record<string, unknown>;
  toForm?: (row: T) => Record<string, unknown>;
  create?: (body: Record<string, unknown>) => Promise<unknown>;
  update?: (id: string, body: Record<string, unknown>) => Promise<unknown>;
  remove?: (id: string) => Promise<unknown>;
  confirmDelete?: (row: T) => string;
}

type EditState<T> = { mode: "new" } | { mode: "edit"; row: T } | null;

export default function AdminResource<T>({ config }: { config: ResourceConfig<T> }) {
  const qc = useQueryClient();
  const [edit, setEdit] = useState<EditState<T>>(null);
  const [formError, setFormError] = useState("");

  const { data: rows = [], isLoading, isError } = useQuery({
    queryKey: [config.queryKey],
    queryFn: config.list,
  });

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      if (edit?.mode === "edit") return config.update!(config.idOf(edit.row), body);
      return config.create!(body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [config.queryKey] });
      setEdit(null);
      setFormError("");
    },
    onError: (e) => setFormError(getErrorMessage(e)),
  });

  const del = useMutation({
    mutationFn: (id: string) => config.remove!(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [config.queryKey] }),
    onError: (e) => window.alert(getErrorMessage(e)),
  });

  const canCreate = Boolean(config.create && config.fields);
  const canEdit = Boolean(config.update && config.fields);
  const canDelete = Boolean(config.remove);

  function onDelete(row: T) {
    const msg = config.confirmDelete?.(row) ?? "Hapus data ini?";
    if (window.confirm(msg)) del.mutate(config.idOf(row));
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink-900">{config.title}</h2>
          {config.description && <p className="mt-1 text-sm text-ink-500">{config.description}</p>}
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => {
              setFormError("");
              setEdit({ mode: "new" });
            }}
            className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white outline-none transition-colors duration-200 hover:bg-neon-pink focus-visible:ring-4 focus-visible:ring-neon-purple/40"
          >
            + {config.addLabel ?? "Tambah"}
          </button>
        )}
      </div>

      <AdminTable
        columns={config.columns}
        rows={rows}
        loading={isLoading}
        isError={isError}
        idOf={config.idOf}
        onEdit={canEdit ? (row) => { setFormError(""); setEdit({ mode: "edit", row }); } : undefined}
        onDelete={canDelete ? onDelete : undefined}
        busyId={del.isPending ? (del.variables as string) : undefined}
        emptyText={config.emptyText}
      />

      {config.fields && (
        <AdminForm
          open={edit !== null}
          title={edit?.mode === "edit" ? `Edit ${config.title}` : `Tambah ${config.title}`}
          fields={config.fields}
          initial={
            edit?.mode === "edit" && config.toForm ? config.toForm(edit.row) : config.defaults ?? {}
          }
          submitting={save.isPending}
          error={formError}
          onSubmit={(body) => save.mutate(body)}
          onClose={() => setEdit(null)}
        />
      )}
    </section>
  );
}
