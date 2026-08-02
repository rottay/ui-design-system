"use client";

/**
 * @fileoverview Table - embedded tabular-document primitive.
 * Supports row selection (checkbox/radio), expandable rows, virtual scrolling,
 * fixed columns, and custom cell renderers. No compound sub-components.
 * Operational collection screens (toolbar + bulk workflow + mobile cards +
 * product filtering) belong to `PatternDataTable`; applications must not
 * reconstruct that pattern by adding route CSS around this primitive.
 *
 * @example
 * ```tsx
 * import { Table } from '@rottay/design-system';
 *
 * const columns = [
 *   { title: 'Name', dataIndex: 'name', sorter: true },
 *   { title: 'Email', dataIndex: 'email' },
 * ];
 *
 * <Table dataSource={users} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
 * ```
 *
 * @module Table
 * @category Display
 */

import React from "react";
import { createEngineComponent } from "../../../../infrastructure/runtime/engines/presentation/component-factory";
import type { TableProps } from "./contracts";
import type { EngineName } from "../../../../foundation/contracts/runtime/engine";

export type {
  TableProps,
  ColumnType,
  TablePaginationConfig,
  TableRowSelection,
  ExpandableConfig,
  TableSize,
  TableLayout,
  SortOrder,
  FilterMode,
  TableCellFieldType,
  EditingCell,
} from "./contracts";

export { TABLE_DEFAULTS } from "./contracts";

/**
 * Engine-aware Table.
 *
 * GENERIC-PRESERVING EXPORT. `createEngineComponent<TableProps>` instantiates
 * the row type once, at `unknown`, and returns a NON-generic component — so
 * every consumer was forced through `ColumnType<unknown>`. That is not a
 * cosmetic loss: `ColumnType.sorter` is `(a: T, b: T) => number`, a
 * contravariant position, which makes `ColumnType<T>` invariant. A perfectly
 * correct `ColumnType<Row>[]` is therefore REJECTED against
 * `ColumnType<unknown>[]`, and an app's only escape was to widen its own row
 * type or cast. (The previous docblock here claimed generic safety "is
 * preserved at the public prop level". It was not; that claim is what this
 * comment replaces.)
 *
 * The factory stays non-generic internally — the lazy() boundary genuinely
 * erases P — so the generic lives on the EXPORT: the runtime value is
 * unchanged (same object, `displayName` and all), and the call signature
 * re-introduces the row type. Untyped calls still infer `unknown` exactly as
 * before, so existing callers are unaffected.
 */
const TableComponent = createEngineComponent<TableProps<any>>("Table", {
  classic: () =>
    import("./engines/classic") as Promise<{
      default: React.ComponentType<TableProps>;
    }>,
  modern: () =>
    import("./engines/modern") as Promise<{
      default: React.ComponentType<TableProps>;
    }>,
  rustic: () =>
    import("./engines/rustic") as Promise<{
      default: React.ComponentType<TableProps>;
    }>,
});

export const Table = TableComponent as (<T = unknown>(
  props: TableProps<T> & {
    engine?: EngineName;
    ref?: React.Ref<any>;
  }
) => React.ReactElement | null) & { displayName?: string };
