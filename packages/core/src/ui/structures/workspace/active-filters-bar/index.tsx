"use client";

/**
 * @fileoverview ActiveFiltersBar — structures-tier horizontal active filter chip
 * row with clear-all and add-filter affordances.
 *
 * @description
 * Engine-free structures family that renders a row of active filter chips.
 * COMPOSITION LAW (S16): each chip is the certified Tag primitive in its
 * `closable` form (the hand-rolled Box chip + Box-as-button remove are
 * retired) — the close button's accessible name is a parametric i18n
 * message (`Remove filter {field}`), never a translated fragment
 * concatenated with the field name. The clear-all and add-filter
 * affordances are the Button primitive with governed icon roles
 * (`action-close` / `action-add`). The count eyebrow is a parametric
 * `{count} active` message with tabular figures (skin-owned).
 *
 * Returns null when no filters are active, so consumers can mount it
 * unconditionally without dealing with empty-state logic; the rail's
 * entrance transition is skin-owned (coordinated, silenced under
 * reduced-motion).
 *
 * Long filter sets wrap onto multiple rows by default; the optional
 * `maxVisible` prop collapses the overflow behind a governed "+N more"
 * disclosure chip (a clickable Tag) that expands the rail in place — no
 * chip is ever hidden behind an unnamed menu. Long values ellipsize inside
 * the chip with native `title` disclosure (skin-owned truncation).
 *
 * The family stays domain-agnostic. Each chip's label and displayValue
 * are consumer-supplied, so the rail knows nothing about tenants, users,
 * or any specific entity.
 */

import { useState } from "react";

import { useOptionalTranslation } from "@/infrastructure/runtime/i18n";
import { Box, Button, Flex, Tag } from "../../../primitives";
import { ActionAddIcon } from "@/graphics/icons/presentation/semantic/generated/roles/action-add";
import { ActionCloseIcon } from "@/graphics/icons/presentation/semantic/generated/roles/action-close";
import type { ActiveFilter } from "@/foundation/contracts/runtime/components/patterns/data";

export type { ActiveFilter } from "@/foundation/contracts/runtime/components/patterns/data";

export interface ActiveFiltersBarProps {
  activeFilters: ActiveFilter[];
  onRemoveFilter: (filterKey: string) => void;
  onClearAll: () => void;
  onAddFilter?: () => void;
  /** When embedded, the rail becomes visually transparent to a parent shell. */
  surfaceVariant?: "default" | "embedded";
  /**
   * Governed overflow for long filter sets: at most `maxVisible` chips render
   * inline and the remainder collapses behind a "+N more" disclosure chip
   * (expandable in place, never a hidden action — every chip keeps its own
   * remove affordance once expanded). Omit to always render every chip.
   */
  maxVisible?: number;
}

export function ActiveFiltersBar({
  activeFilters,
  onRemoveFilter,
  onClearAll,
  onAddFilter,
  surfaceVariant = "default",
  maxVisible,
}: ActiveFiltersBarProps) {
  const i18n = useOptionalTranslation("components");
  // Optional channel with an English floor (parametric): a missing catalog
  // entry never echoes a raw key and fragments are never concatenated.
  const tOr = (
    key: string,
    floor: string,
    params?: Record<string, string | number>
  ): string => i18n?.tOr(key, floor, params) ?? floor;
  // "+N more" disclosure state. Local and uncontrolled: the overflow law is a
  // rendering concern, not filter state, so consumers stay unaware of it.
  const [expanded, setExpanded] = useState(false);

  if (!activeFilters.length) return null;

  const embedded = surfaceVariant === "embedded";
  const collapsible = typeof maxVisible === "number" && maxVisible > 0;
  const hiddenCount =
    collapsible && !expanded
      ? Math.max(activeFilters.length - (maxVisible as number), 0)
      : 0;
  const visibleFilters =
    hiddenCount > 0
      ? activeFilters.slice(0, maxVisible as number)
      : activeFilters;
  const canCollapse =
    collapsible && expanded && activeFilters.length > (maxVisible as number);

  return (
    <Box
      data-part="root"
      data-embedded={embedded}
      className="ds-structure ds-active-filters-bar"
      role="region"
      aria-label={tOr("activeFiltersBar.regionLabel", "Active filters")}
    >
      <Flex align="center" gap={12} justify="between" wrap="wrap">
        <Box data-part="chips-region">
          <Flex align="center" gap={8} wrap="wrap">
            <Box as="span" data-part="pill">
              {tOr("activeFiltersBar.active_count", "{count} active", {
                count: activeFilters.length,
              })}
            </Box>
            {visibleFilters.map((filter) => (
              /* Composed Tag (closable): chrome, focus ring and the close
                 button's semantics belong to the primitive; the pattern
                 keeps only the label/value typography inside. */
              <Tag
                key={filter.key}
                tone="primary"
                closable
                data-part="chip"
                onClose={() => onRemoveFilter(filter.key)}
                closeLabel={tOr(
                  "activeFiltersBar.remove_filter_named",
                  "Remove filter {field}",
                  {
                    field: filter.label,
                  }
                )}
              >
                <Box as="span" data-part="chip-label">
                  {filter.label}
                </Box>
                <Box
                  as="span"
                  data-part="chip-value"
                  /* Long values ellipsize (skin contract); disclose the full
                     value natively, mirroring the Tag truncated-label law. */
                  title={
                    typeof (filter.displayValue ?? filter.value) === "string"
                      ? String(filter.displayValue ?? filter.value)
                      : undefined
                  }
                >
                  {filter.displayValue ?? filter.value}
                </Box>
              </Tag>
            ))}
            {hiddenCount > 0 && (
              /* Governed "more": a clickable Tag (role=button via the
                 primitive's clickable contract) that expands the rail in
                 place — chips are never dropped behind a menu without a
                 visible, keyboard-operable disclosure. */
              <Tag
                tone="neutral"
                clickable
                data-part="more-chip"
                onClick={() => setExpanded(true)}
              >
                {tOr("activeFiltersBar.more_count", "+{count} more", {
                  count: hiddenCount,
                })}
              </Tag>
            )}
            {canCollapse && (
              <Tag
                tone="neutral"
                clickable
                data-part="less-chip"
                onClick={() => setExpanded(false)}
              >
                {tOr("activeFiltersBar.show_less", "Show less")}
              </Tag>
            )}
          </Flex>
        </Box>

        {/* Actions sit at the consistent END of the rail (documented rail
            contract: chips flow from the start edge, the clear/add
            affordances never move). */}
        <Flex
          data-part="actions"
          align="center"
          gap={8}
          wrap="wrap"
          justify="end"
        >
          <Button
            variant="ghost"
            size="sm"
            data-part="clear-all"
            icon={<ActionCloseIcon decorative size={12} />}
            onClick={onClearAll}
          >
            {tOr("activeFiltersBar.clearAll", "Clear all")}
          </Button>

          {onAddFilter && (
            <Button
              variant="outline"
              size="sm"
              data-part="add-filter"
              icon={<ActionAddIcon decorative size={12} />}
              onClick={onAddFilter}
            >
              {tOr("activeFiltersBar.addFilter", "Add filter")}
            </Button>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}

// Compatibility aliases for pre-Checkpoint-D names. Deprecated —
// migrate to the canonical new names above. Scheduled for removal
// in Checkpoint F if no consumers remain.
export { ActiveFiltersBar as WorkspaceFilterRail };
export type {
  ActiveFiltersBarProps as WorkspaceFilterRailProps,
  ActiveFilter as WorkspaceActiveFilter,
};
