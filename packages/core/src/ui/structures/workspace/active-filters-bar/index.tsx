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
 * The family stays domain-agnostic. Each chip's label and displayValue
 * are consumer-supplied, so the rail knows nothing about tenants, users,
 * or any specific entity.
 */

import { useOptionalTranslation } from "@/infrastructure/runtime/i18n";
import { Box, Button, Flex, Tag, Text } from "../../../primitives";
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
}

export function ActiveFiltersBar({
  activeFilters,
  onRemoveFilter,
  onClearAll,
  onAddFilter,
  surfaceVariant = "default",
}: ActiveFiltersBarProps) {
  const i18n = useOptionalTranslation("components");
  // Optional channel with an English floor (parametric): a missing catalog
  // entry never echoes a raw key and fragments are never concatenated.
  const tOr = (
    key: string,
    floor: string,
    params?: Record<string, string | number>
  ): string => i18n?.tOr(key, floor, params) ?? floor;

  if (!activeFilters.length) return null;

  const embedded = surfaceVariant === "embedded";

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
            <Text data-part="pill" size="xs">
              {tOr("activeFiltersBar.active_count", "{count} active", {
                count: activeFilters.length,
              })}
            </Text>
            {activeFilters.map((filter) => (
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
                <Text data-part="chip-label" size="xs">
                  {filter.label}
                </Text>
                <Text data-part="chip-value" size="xs">
                  {filter.displayValue ?? filter.value}
                </Text>
              </Tag>
            ))}
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
