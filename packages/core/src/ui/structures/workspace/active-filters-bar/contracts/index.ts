/**
 * @fileoverview ActiveFiltersBar contracts — the structures-tier filter rail.
 *
 * @description
 * Split out of the family entrypoint so the entrypoint and the rendering
 * owner share one contract instead of importing each other.
 */

import type { ActiveFilter } from '@/foundation/contracts/runtime/components/patterns/data';

export type { ActiveFilter } from '@/foundation/contracts/runtime/components/patterns/data';

export interface ActiveFiltersBarProps {
  activeFilters: ActiveFilter[];
  onRemoveFilter: (filterKey: string) => void;
  onClearAll: () => void;
  onAddFilter?: () => void;
  /** When embedded, the rail becomes visually transparent to a parent shell. */
  surfaceVariant?: 'default' | 'embedded';
  /**
   * Governed overflow for long filter sets: at most `maxVisible` chips render
   * inline and the remainder collapses behind a "+N more" disclosure
   * (expandable in place, never a hidden action — every chip keeps its own
   * remove affordance once expanded). Omit to always render every chip.
   */
  maxVisible?: number;
  /**
   * Accessible name for the chip group. Defaults to the localized floor; the
   * group is a `toolbar` of removable objects, so it needs its own name
   * distinct from the rail's region label.
   */
  chipsLabel?: string;
}
