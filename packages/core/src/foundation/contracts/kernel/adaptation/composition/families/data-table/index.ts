/**
 * @fileoverview The data-table adaptation: which columns stay, how the rows
 * present, and where the row actions go, per posture.
 *
 * @module Contracts/Kernel/Adaptation/Families/DataTable
 * @category Types
 * @package @rottay/design-system
 */

import type { Adapt } from '../../../foundation';

export const DATA_TABLE_PRESENTATIONS = ['table', 'cards', 'list'] as const;

export type DataTablePresentation = (typeof DATA_TABLE_PRESENTATIONS)[number];

export const DATA_TABLE_ROW_ACTIONS = ['inline', 'menu', 'swipe'] as const;

export type DataTableRowActions = (typeof DATA_TABLE_ROW_ACTIONS)[number];

/** Column deltas, by `ColumnDef.key`. Every presentation reads the same column model. */
export interface DataTableColumnAdaptation {
  /** The columns that stay. Omitted: every visible column stays. */
  readonly keep?: readonly string[];
  /**
   * The columns that outrank the rest, most important first. They lead the
   * card and list projections; in the table every other column yields to the
   * named table container first.
   */
  readonly priority?: readonly string[];
  /**
   * The columns that give up their reserved width. The table sizes them to
   * content; cards and lists render them as unlabelled meta beside the title.
   */
  readonly shrink?: readonly string[];
}

export interface DataTableAdaptation {
  readonly columns?: DataTableColumnAdaptation;
  readonly presentation?: DataTablePresentation;
  readonly rowActions?: DataTableRowActions;
}

export interface ResolvedDataTableAdaptation {
  readonly columns: DataTableColumnAdaptation;
  readonly presentation: DataTablePresentation;
  readonly rowActions: DataTableRowActions;
}

export const DATA_TABLE_ADAPTATION_BASE: ResolvedDataTableAdaptation = Object.freeze({
  columns: Object.freeze({}),
  presentation: 'table',
  rowActions: 'inline',
});

/** A phone request and a compact box both present rows as cards. */
export const DATA_TABLE_ADAPT_DEFAULTS: Adapt<DataTableAdaptation> = Object.freeze({
  phone: Object.freeze({ presentation: 'cards' }),
  compact: Object.freeze({ presentation: 'cards' }),
});
