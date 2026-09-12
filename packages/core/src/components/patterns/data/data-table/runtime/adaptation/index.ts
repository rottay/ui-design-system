/**
 * @fileoverview The data-table column model under an adaptation: one model,
 * projected once for the table and once for cards and lists.
 */

import type { DataTableColumnAdaptation } from "@/foundation/contracts/kernel/adaptation";
import type { ColumnDef } from "@/foundation/contracts/runtime/components/patterns/core";

export function declaresColumnAdaptation(adaptation: DataTableColumnAdaptation): boolean {
  return Boolean(adaptation.keep || adaptation.priority || adaptation.shrink);
}

function keptColumns<T>(columns: ColumnDef<T>[], adaptation: DataTableColumnAdaptation): ColumnDef<T>[] {
  if (!adaptation.keep) return columns;
  const keep = new Set(adaptation.keep);
  return columns.filter((column) => keep.has(column.key));
}

/**
 * The table projection. Unkept columns leave; with a `priority` list every
 * unlisted column yields to the named table container first; `shrink` columns
 * give up their reserved width and size to content.
 */
export function adaptTableColumns<T>(
  columns: ColumnDef<T>[],
  adaptation: DataTableColumnAdaptation,
): ColumnDef<T>[] {
  if (!declaresColumnAdaptation(adaptation)) return columns;
  const priority = adaptation.priority ? new Set(adaptation.priority) : null;
  const shrink = new Set(adaptation.shrink ?? []);
  return keptColumns(columns, adaptation).map((column) => {
    let next = column;
    if (priority) {
      next = { ...next, priority: priority.has(column.key) ? undefined : "low" };
    }
    if (shrink.has(column.key)) {
      next = { ...next, width: undefined, minWidth: undefined };
    }
    return next;
  });
}

export interface RecordColumnProjection<T> {
  /** The column that names the record. */
  readonly title?: ColumnDef<T>;
  /** Shrunk columns, rendered unlabelled beside the title. */
  readonly meta: ColumnDef<T>[];
  /** Labelled fields, in priority order. */
  readonly fields: ColumnDef<T>[];
}

/** The card and list projection of the same column model. */
export function projectRecordColumns<T>(
  columns: ColumnDef<T>[],
  adaptation: DataTableColumnAdaptation,
): RecordColumnProjection<T> {
  const kept = keptColumns(columns, adaptation);
  const leading = (adaptation.priority ?? [])
    .map((key) => kept.find((column) => column.key === key))
    .filter((column): column is ColumnDef<T> => column !== undefined);
  const ordered = [...leading, ...kept.filter((column) => !leading.includes(column))];
  const shrink = new Set(adaptation.shrink ?? []);
  const [title, ...fields] = ordered.filter((column) => !shrink.has(column.key));
  return {
    title,
    meta: ordered.filter((column) => shrink.has(column.key)),
    fields,
  };
}
