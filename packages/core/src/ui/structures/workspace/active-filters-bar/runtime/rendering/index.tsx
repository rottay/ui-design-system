"use client";

/**
 * @fileoverview ActiveFiltersBar — structures-tier horizontal active filter
 * chip row with clear-all and add-filter affordances.
 *
 * @description
 * Structures family that renders a row of active filter chips.
 *
 * ONE SILHOUETTE PER ROLE. The rail carries three different jobs and each one
 * now has its own form, because a row in which the heading, the removable
 * objects and the expand affordance are all the same rounded micro-pill is a
 * row nobody can read:
 *   - the count is an EYEBROW — typography and a rule, never a pill (the skin
 *     retires its capsule in the modern engine);
 *   - each filter is an OBJECT — the certified Tag primitive in its `closable`
 *     form, designed, dismissible and keyboard-reachable;
 *   - "+N more" / "Show less" is an ACTION — the Button primitive in its text
 *     variant with `aria-expanded`, not a third pill pretending to be an
 *     object that can be removed.
 *
 * COMPOSITION LAW (S16): the close button's accessible name is a parametric
 * i18n message (`Remove filter {field}`), never a translated fragment
 * concatenated with the field name. Every glyph is a governed semantic role
 * at a named size token (`action-close` / `action-add` / `status-draft` /
 * `status-error`) — never a literal pixel size.
 *
 * FILTER LIFECYCLE (C-05): `ActiveFilter.state` renders the applied / draft /
 * invalid grammar — the governed `status-draft` / `status-error` glyph in
 * the Tag's icon slot (shape), the skin's underline treatment on the value
 * (form), and a visually hidden localized state word (text), so the state
 * never depends on hue and survives forced colors. Absent means applied,
 * which keeps every existing caller byte-identical.
 *
 * KEYBOARD (APG toolbar, `action-dock` freeform precedent): the chip group is
 * a `role='toolbar'`; direction-aware ArrowLeft/ArrowRight plus Home/End move
 * across the chips' dismiss controls and the disclosure toggle, so a rail
 * carrying twenty filters is traversable without twenty tab stops.
 *
 * Returns null when no filters are active, so consumers can mount it
 * unconditionally without dealing with empty-state logic; the rail's
 * entrance transition is skin-owned (coordinated, silenced under
 * reduced-motion).
 *
 * Long filter sets wrap onto multiple rows by default; the optional
 * `maxVisible` prop collapses the overflow behind the governed "+N more"
 * disclosure that expands the rail in place — no chip is ever hidden behind
 * an unnamed menu. Long values ellipsize inside the chip with native `title`
 * disclosure (skin-owned truncation).
 *
 * The family stays domain-agnostic. Each chip's label and displayValue are
 * consumer-supplied, so the rail knows nothing about tenants, users, or any
 * specific entity.
 */

import { useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactElement } from "react";

import { useOptionalTranslation } from "@/infrastructure/runtime/i18n";
import { Box } from "../../../../../primitives/layout/Box";
import { Button } from "../../../../../primitives/inputs/Button";
import { Flex } from "../../../../../primitives/layout/Flex";
import { Tag } from "../../../../../primitives/display/Tag";
import { ActionAddIcon } from "@/graphics/icons/presentation/semantic/generated/roles/action-add";
import { ActionCloseIcon } from "@/graphics/icons/presentation/semantic/generated/roles/action-close";
import { StatusDraftIcon } from "@/graphics/icons/presentation/semantic/generated/roles/status-draft";
import { StatusErrorIcon } from "@/graphics/icons/presentation/semantic/generated/roles/status-error";
import type { ActiveFiltersBarProps } from "../../contracts";

/** Controls participating in the chip group's arrow-key model. */
const FOCUSABLE_SELECTOR =
  'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

const ARROW_KEYS = new Set(["ArrowRight", "ArrowLeft", "Home", "End"]);

/** Resolve writing direction from semantic markup before computed CSS (Tabs precedent). */
function elementDirection(element: HTMLElement): "ltr" | "rtl" {
  const directionOwner = element.closest<HTMLElement>("[dir]");
  if (directionOwner?.dir === "rtl") return "rtl";
  return getComputedStyle(element).direction === "rtl" ? "rtl" : "ltr";
}

export function ActiveFiltersBar({
  activeFilters,
  onRemoveFilter,
  onClearAll,
  onAddFilter,
  surfaceVariant = "default",
  maxVisible,
  chipsLabel,
}: ActiveFiltersBarProps): ReactElement | null {
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

  const handleChipsKeyDown = (event: ReactKeyboardEvent<HTMLElement>): void => {
    if (!ARROW_KEYS.has(event.key)) return;
    const container = event.currentTarget;
    const items = Array.from(
      container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    );
    if (items.length === 0) return;
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    if (currentIndex === -1) return;

    const isRtl = elementDirection(container) === "rtl";
    const forwardKey = isRtl ? "ArrowLeft" : "ArrowRight";
    const backwardKey = isRtl ? "ArrowRight" : "ArrowLeft";
    let nextIndex: number | undefined;

    if (event.key === forwardKey) nextIndex = (currentIndex + 1) % items.length;
    else if (event.key === backwardKey)
      nextIndex = (currentIndex - 1 + items.length) % items.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = items.length - 1;

    if (nextIndex === undefined || nextIndex === currentIndex) return;
    event.preventDefault();
    items[nextIndex]?.focus();
  };

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
  const resolvedChipsLabel =
    chipsLabel ?? tOr("activeFiltersBar.chipsLabel", "Applied filters");

  return (
    <Box
      data-part="root"
      data-embedded={embedded}
      className="ds-structure ds-active-filters-bar"
      role="region"
      aria-label={tOr("activeFiltersBar.regionLabel", "Active filters")}
    >
      <Flex data-part="rail" align="center" gap={12} justify="between" wrap="wrap">
        <Box data-part="chips-region">
          <Flex
            align="center"
            gap={8}
            wrap="wrap"
            data-part="chips"
            role="toolbar"
            aria-label={resolvedChipsLabel}
            onKeyDown={handleChipsKeyDown}
          >
            <Box as="span" data-part="pill">
              {tOr("activeFiltersBar.active_count", "{count} active", {
                count: activeFilters.length,
              })}
            </Box>
            {visibleFilters.map((filter) => {
              /* Lifecycle state (ActiveFilter.state, absent = applied). The
                 state reaches the chip three ways at once: the governed
                 status glyph in the Tag's icon slot (shape), a skin-owned
                 underline grammar on the value (form), and a visually hidden
                 localized word (text) — never hue alone. The chip chrome
                 itself stays the Tag primitive's paint. */
              const state = filter.state ?? "applied";
              const stateLabel =
                state === "draft"
                  ? tOr("activeFiltersBar.state_draft", "draft")
                  : state === "invalid"
                    ? tOr("activeFiltersBar.state_invalid", "invalid")
                    : null;
              return (
              /* Composed Tag (closable): chrome, focus ring and the close
                 button's semantics belong to the primitive; the pattern
                 keeps only the label/value typography inside. */
              <Tag
                key={filter.key}
                tone="primary"
                closable
                data-part="chip"
                data-state={state !== "applied" ? state : undefined}
                onClose={() => onRemoveFilter(filter.key)}
                closeLabel={tOr(
                  "activeFiltersBar.remove_filter_named",
                  "Remove filter {field}",
                  {
                    field: filter.label,
                  }
                )}
                icon={
                  state === "draft" ? (
                    <StatusDraftIcon decorative size="xs" />
                  ) : state === "invalid" ? (
                    <StatusErrorIcon decorative size="xs" />
                  ) : undefined
                }
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
                {stateLabel && (
                  <Box as="span" className="ds-sr-only">
                    {stateLabel}
                  </Box>
                )}
              </Tag>
              );
            })}
            {hiddenCount > 0 && (
              /* Governed "more": an ACTION, so it is the Button primitive in
                 its text variant with `aria-expanded` — not a third pill in a
                 row that already carries an eyebrow and removable objects.
                 Chips are never dropped behind a menu without a visible,
                 keyboard-operable disclosure. */
              <Button
                variant="text"
                size="sm"
                data-part="more-toggle"
                aria-expanded={false}
                onClick={() => setExpanded(true)}
              >
                {tOr("activeFiltersBar.more_count", "+{count} more", {
                  count: hiddenCount,
                })}
              </Button>
            )}
            {canCollapse && (
              <Button
                variant="text"
                size="sm"
                data-part="less-toggle"
                aria-expanded
                onClick={() => setExpanded(false)}
              >
                {tOr("activeFiltersBar.show_less", "Show less")}
              </Button>
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
            icon={<ActionCloseIcon decorative size="xs" />}
            onClick={onClearAll}
          >
            {tOr("activeFiltersBar.clearAll", "Clear all")}
          </Button>

          {onAddFilter && (
            <Button
              variant="outline"
              size="sm"
              data-part="add-filter"
              icon={<ActionAddIcon decorative size="xs" />}
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

ActiveFiltersBar.displayName = "ActiveFiltersBar";

export default ActiveFiltersBar;
