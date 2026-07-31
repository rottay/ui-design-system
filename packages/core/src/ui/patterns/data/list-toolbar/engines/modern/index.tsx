"use client";

/**
 * @fileoverview ListToolbar -- Modern (Hermes) engine implementation.
 *
 * Premium command-bar toolbar inspired by Linear/Vercel. Unified horizontal
 * bar with clearly separated sections, segmented controls for view/density,
 * and a dedicated bulk-action strip when filters are active.
 *
 * Layout (desktop):
 *   Left:    Search input (with active filter count badge)
 *   Center:  Saved views bar (if present, stretches)
 *   Right:   Density toggle | View mode | Export | Column settings | Primary CTA
 *
 * Layout (mobile):
 *   Row 1: Title + count | overflow menu + primary CTA
 *   Row 2: Full-width search
 *   Row 3: Horizontal-scrolling filter pills
 *
 * Active filter chips render in a secondary strip below the main bar.
 *
 * Uses only DS primitives (Box, Flex, Stack, Text, Button, Badge, Input,
 * Popover, Tabs, Tag, Tooltip) and DS tokens (--ds-*) throughout.
 * Zero DaisyUI classes.
 */

import { useState, useCallback, useEffect, useMemo, useRef } from "react";

import {
  Box,
  Flex,
  Stack,
  Text,
  Button,
  Badge,
  Input,
  Popover,
  Segmented,
  Tabs,
  Tag,
  Tooltip,
} from "../../../../../primitives";
import {
  SearchIcon as Search,
  ListIcon as List,
  LayoutGridIcon as LayoutGrid,
  DownloadIcon as Download,
  PlusIcon as Plus,
  Settings2Icon as Settings2,
  FilterIcon as Filter,
  XIcon as X,
  AlignJustifyIcon as AlignJustify,
  AlignCenterIcon as AlignCenter,
  AlignLeftIcon as AlignLeft,
  ChevronDownIcon as ChevronDown,
  MoreHorizontalIcon as MoreHorizontal,
  CheckIcon as Check,
} from "../../../../../../graphics/icons";

import type {
  ListToolbarProps,
  ListToolbarMessages,
  FilterPillConfig,
  DensityKey,
} from "../../contracts";
import { useBreakpoints } from "@/infrastructure/runtime/responsive/composition/react/provider/breakpoint-state";
import { useOptionalTranslation } from "@/infrastructure/runtime/i18n";

// ============================================================================
// DESIGN TOKENS (local aliases for readability)
// ============================================================================

const COMPACT_CONTAINER_MAX = 1080;

const DEFAULT_MESSAGES: ListToolbarMessages = {
  compact: "Compact",
  comfortable: "Comfortable",
  spacious: "Spacious",
  densitySuffix: "density",
  rowDensity: "Row density",
  viewMode: "View mode",
  listView: "List view",
  cardView: "Card view",
  columns: "Columns",
  density: "Density",
  views: "Views",
  noColumnSettings: "No column settings available.",
  noSavedViews: "No saved views available.",
  columnSettings: "Column settings",
  settings: "Settings",
  moreOptions: "More options",
  export: "Export",
  active: "active",
  clearAll: "Clear all",
};

/**
 * Keys of `ListToolbarMessages` mirrored in the i18n catalogs under
 * `components.listToolbar.*` (en/es/ar; fr/pt resolve through the documented
 * partial-locale fallback chain). `searchLabel` and the classic-only density
 * descriptions stay prop-only and are intentionally NOT catalog keys.
 */
const CATALOG_MESSAGE_KEYS = [
  "compact",
  "comfortable",
  "spacious",
  "densitySuffix",
  "rowDensity",
  "viewMode",
  "listView",
  "cardView",
  "columns",
  "density",
  "views",
  "noColumnSettings",
  "noSavedViews",
  "columnSettings",
  "settings",
  "moreOptions",
  "export",
  "active",
  "clearAll",
] as const satisfies readonly (keyof ListToolbarMessages)[];

/**
 * Container posture, with the historical viewport breakpoint as its SSR and
 * non-ResizeObserver fallback. The toolbar often lives in a split pane, where
 * viewport width says nothing about the space the pattern actually owns.
 *
 * An unmeasurable container (width 0: hidden subtree, SSR-first paint, or an
 * environment whose ResizeObserver never publishes) must not latch the first
 * fallback forever: posture then tracks the viewport fallback, and the first
 * real measurement still wins the moment the container gains size.
 */
function useContainerCompact(fallbackCompact: boolean) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [compact, setCompact] = useState(fallbackCompact);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof ResizeObserver === "undefined") {
      setCompact(fallbackCompact);
      return undefined;
    }

    const update = (width: number) => {
      if (width > 0) {
        setCompact(width <= COMPACT_CONTAINER_MAX);
      } else {
        setCompact(fallbackCompact);
      }
    };
    update(node.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) update(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [fallbackCompact]);

  return { containerRef, compact };
}

// ============================================================================
// DENSITY OPTIONS
// ============================================================================

const DENSITY_OPTIONS: {
  key: DensityKey;
  icon: React.ReactNode;
  labelKey: "compact" | "comfortable" | "spacious";
}[] = [
  { key: "compact", icon: <AlignJustify size={14} />, labelKey: "compact" },
  {
    key: "comfortable",
    icon: <AlignCenter size={14} />,
    labelKey: "comfortable",
  },
  { key: "spacious", icon: <AlignLeft size={14} />, labelKey: "spacious" },
];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * IconButton -- standalone ghost icon button with tooltip.
 *
 * Unknown props (including the `aria-controls` / `aria-expanded` /
 * `aria-haspopup` triplet the enclosing Popover clones onto its direct
 * child) are forwarded to the underlying Button so disclosure semantics
 * always reach the DOM node the Popover actually controls. The Popover's
 * own `aria-label`/`title` injection is deliberately dropped: this button
 * names itself through `ariaLabel` (camelCase), and the clone would
 * otherwise overwrite it with `undefined`.
 */
function IconButton({
  onClick,
  ariaLabel,
  tooltipText,
  children,
  ...rest
}: {
  onClick: () => void;
  ariaLabel: string;
  tooltipText?: string;
  children: React.ReactNode;
} & Record<string, unknown>) {
  const {
    'aria-label': _popoverLabel,
    title: _popoverTitle,
    ...forwarded
  } = rest as Record<string, unknown>;

  const btn = (
    <Button
      variant="ghost"
      size="sm"
      icon={children}
      data-part="icon-button"
      className="ds-list-toolbar__icon-button"
      onClick={onClick}
      aria-label={ariaLabel}
      {...forwarded}
    />
  );

  if (tooltipText) {
    return (
      <Tooltip content={tooltipText} placement="bottom">
        {btn}
      </Tooltip>
    );
  }

  return btn;
}

/**
 * Vertical thin divider used to separate toolbar sections.
 */
function ToolbarDivider() {
  return (
    <Box
      data-part="divider"
      className="ds-list-toolbar__divider"
    />
  );
}

// ── Filter Button ──────────────────────────────────────────────────────────

function FilterButton({
  pill,
  onFilterChange,
}: {
  pill: FilterPillConfig;
  onFilterChange?: (key: string, value: unknown) => void;
}) {
  const [open, setOpen] = useState(false);
  const isActive = pill.value && pill.value !== "" && pill.value !== "all";
  const activeLabel = pill.options.find((o) => o.value === pill.value)?.label;

  return (
    <Popover
      trigger="click"
      placement="bottomLeft"
      open={open}
      onOpenChange={setOpen}
      arrow={false}
      content={
        <Box
          className="ds-list-toolbar__filter-menu"
          data-part="filter-menu"
          role="listbox"
          aria-label={pill.label}
        >
          {pill.options.map((option) => {
            const isSelected = option.value === pill.value;
            return (
              <FilterDropdownItem
                key={option.value}
                label={option.label}
                selected={isSelected}
                onClick={() => {
                  onFilterChange?.(pill.key, option.value);
                  setOpen(false);
                }}
              />
            );
          })}
        </Box>
      }
    >
      <Button
        variant="ghost"
        size="sm"
        data-part="filter-trigger"
        className="ds-list-toolbar__filter-trigger"
        data-active={!!isActive}
        data-open={open}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={activeLabel ? `${pill.label}: ${activeLabel}` : pill.label}
        suffix={<ChevronDown size={12} aria-hidden="true" />}
      >
        {pill.label}
        {isActive && activeLabel && (
          <Badge
            tone="primary"
            badgeStyle="soft"
            size="xs"
            content={1}
            data-part="filter-badge"
            className="ds-list-toolbar__filter-badge"
          />
        )}
      </Button>
    </Popover>
  );
}

/**
 * Single option row inside a filter dropdown.
 */
function FilterDropdownItem({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      fullWidth
      data-part="filter-dropdown-item"
      className="ds-list-toolbar__filter-dropdown-item"
      data-selected={selected}
      onClick={onClick}
      role="option"
      aria-selected={selected}
      suffix={selected ? <Box as="span" data-part="filter-checkmark"><Check size={13} aria-hidden="true" /></Box> : undefined}
    >
      {label}
    </Button>
  );
}

// ── View Mode Toggle ───────────────────────────────────────────────────────

function ViewSwitch({
  viewMode,
  onViewModeChange,
  messages,
}: {
  viewMode: "list" | "cards";
  onViewModeChange: (mode: "list" | "cards") => void;
  messages: ListToolbarMessages;
}) {
  const modes: {
    key: "list" | "cards";
    icon: React.ReactNode;
    label: string;
  }[] = [
    { key: "list", icon: <List size={15} />, label: messages.listView },
    { key: "cards", icon: <LayoutGrid size={15} />, label: messages.cardView },
  ];

  return (
    <Tooltip content={messages.viewMode} placement="bottom">
      <Segmented
        ariaLabel={messages.viewMode}
        className="ds-list-toolbar__segmented-control"
        size="small"
        value={viewMode}
        onChange={(value) => onViewModeChange(value as "list" | "cards")}
        options={modes.map((mode) => ({
          value: mode.key,
          label: <span className="ds-sr-only">{mode.label}</span>,
          ariaLabel: mode.label,
          icon: mode.icon,
        }))}
      />
    </Tooltip>
  );
}

// ── Density Toggle ─────────────────────────────────────────────────────────

function DensitySwitch({
  density,
  onDensityChange,
  messages,
}: {
  density: DensityKey;
  onDensityChange: (d: DensityKey) => void;
  messages: ListToolbarMessages;
}) {
  return (
    <Tooltip content={messages.rowDensity} placement="bottom">
      <Segmented
        ariaLabel={messages.rowDensity}
        className="ds-list-toolbar__segmented-control"
        size="small"
        value={density}
        onChange={(value) => onDensityChange(value as DensityKey)}
        options={DENSITY_OPTIONS.map((opt) => {
          const label = `${messages[opt.labelKey]} ${messages.densitySuffix}`;
          return {
            value: opt.key,
            label: <span className="ds-sr-only">{label}</span>,
            ariaLabel: label,
            icon: opt.icon,
          };
        })}
      />
    </Tooltip>
  );
}

// ── Settings Dropdown ──────────────────────────────────────────────────────

function SettingsDropdown({
  columnSettingsContent,
  savedViewsContent,
  density,
  onDensityChange,
  open,
  onOpenChange,
  messages,
}: {
  columnSettingsContent?: React.ReactNode;
  savedViewsContent?: React.ReactNode;
  density: DensityKey;
  onDensityChange: (d: DensityKey) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: ListToolbarMessages;
}) {
  return (
    <Popover
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={onOpenChange}
      arrow={false}
      content={
        <Box
          className="ds-list-toolbar__settings-panel"
          data-part="settings-panel"
        >
          <Tabs
            defaultActiveKey="columns"
            size="sm"
            items={[
              {
                key: "columns",
                label: messages.columns,
                children: columnSettingsContent ?? (
                  <Text
                    data-part="settings-empty"
                    className="ds-list-toolbar__settings-empty"
                  >
                    {messages.noColumnSettings}
                  </Text>
                ),
              },
              {
                key: "density",
                label: messages.density,
                children: (
                  <Stack
                    spacing="sm"
                    className="ds-list-toolbar__density-options"
                  >
                    {DENSITY_OPTIONS.map((opt) => {
                      const isActive = density === opt.key;
                      return (
                        <DensityOptionRow
                          key={opt.key}
                          label={messages[opt.labelKey]}
                          icon={opt.icon}
                          active={isActive}
                          onClick={() => onDensityChange(opt.key)}
                        />
                      );
                    })}
                  </Stack>
                ),
              },
              {
                key: "views",
                label: messages.views,
                children: savedViewsContent ?? (
                  <Text
                    data-part="settings-empty"
                    className="ds-list-toolbar__settings-empty"
                  >
                    {messages.noSavedViews}
                  </Text>
                ),
              },
            ]}
          />
        </Box>
      }
    >
      <IconButton
        onClick={() => onOpenChange(!open)}
        ariaLabel={messages.columnSettings}
        tooltipText={open ? undefined : messages.settings}
      >
        <Settings2 size={15} />
      </IconButton>
    </Popover>
  );
}

/**
 * Single density option inside the settings dropdown.
 */
function DensityOptionRow({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      fullWidth
      data-part="density-option"
      className="ds-list-toolbar__density-option"
      data-active={active}
      onClick={onClick}
      aria-pressed={active}
      icon={icon}
      suffix={active ? <Check size={13} aria-hidden="true" /> : undefined}
    >
      {label}
    </Button>
  );
}

// ── Mobile Overflow Menu ───────────────────────────────────────────────────

function MobileOverflow({
  density,
  onDensityChange,
  viewMode,
  onViewModeChange,
  onExport,
  messages,
}: {
  density: DensityKey;
  onDensityChange: (d: DensityKey) => void;
  viewMode: "list" | "cards";
  onViewModeChange: (mode: "list" | "cards") => void;
  onExport?: () => void;
  messages: ListToolbarMessages;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
      arrow={false}
      content={
        <Stack
          spacing="sm"
          className="ds-list-toolbar__mobile-overflow-panel"
          data-part="mobile-overflow-panel"
        >
          {/* View mode */}
          <Box className="ds-list-toolbar__mobile-overflow-group">
            <Text
              data-part="mobile-overflow-label"
              className="ds-list-toolbar__mobile-overflow-label"
            >
              {messages.viewMode}
            </Text>
            <ViewSwitch
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
              messages={messages}
            />
          </Box>

          {/* Density */}
          <Box className="ds-list-toolbar__mobile-overflow-group">
            <Text
              data-part="mobile-overflow-label"
              className="ds-list-toolbar__mobile-overflow-label"
            >
              {messages.density}
            </Text>
            <DensitySwitch
              density={density}
              onDensityChange={onDensityChange}
              messages={messages}
            />
          </Box>

          {/* Divider */}
          {onExport && (
            <Box
              data-part="divider"
              className="ds-list-toolbar__divider ds-list-toolbar__divider--horizontal"
            />
          )}

          {/* Export */}
          {onExport && (
            <MobileOverflowItem
              icon={<Download size={14} />}
              label={messages.export}
              onClick={() => {
                onExport();
                setOpen(false);
              }}
            />
          )}
        </Stack>
      }
    >
      <IconButton
        onClick={() => setOpen(!open)}
        ariaLabel={messages.moreOptions}
      >
        <MoreHorizontal size={15} />
      </IconButton>
    </Popover>
  );
}

/**
 * Single row item in the mobile overflow popover.
 */
function MobileOverflowItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      fullWidth
      data-part="mobile-overflow-item"
      className="ds-list-toolbar__mobile-overflow-item"
      onClick={onClick}
      icon={icon}
    >
      {label}
    </Button>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Modern engine implementation of the ListToolbar pattern.
 *
 * A premium, Linear/Vercel-quality command bar sitting above every list/table.
 *
 * Desktop layout:
 *   Left:   [Icon] Title (count) | Search input (+ filter count badge)
 *   Center: Filter pills (stretch)
 *   Right:  Density toggle | View mode | Export | Settings | Primary CTA
 *
 * Conditional second row:
 *   Active filter chips strip with dismiss buttons.
 *
 * On mobile, secondary controls collapse into a "More" dropdown.
 */
export default function ModernListToolbar({
  title,
  showTitleSection = true,
  icon,
  totalCount,
  search,
  onSearchChange,
  searchPlaceholder: searchPlaceholderProp,
  messages: messageOverrides,
  filterPills,
  activeFilters,
  onFilterChange,
  onClearFilters,
  activeFilterCount = 0,
  viewMode,
  onViewModeChange,
  density,
  onDensityChange,
  columnSettingsContent,
  savedViewsContent,
  primaryAction,
  onExport,
  className,
  style,
}: ListToolbarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { isMobile } = useBreakpoints();
  const { containerRef, compact: isCompact } = useContainerCompact(isMobile);
  const i18n = useOptionalTranslation("components");
  /**
   * Catalog lookup with an honest English floor: when the provider is absent
   * or echoes the raw key (missing entry), the historical default wins.
   * Unlike the Rate guard, an empty catalog string IS honored — es/ar land
   * `densitySuffix` as "" because their density adjectives already agree
   * with "densidad"/"كثافة" and need no suffix.
   */
  const tOr = (key: string, fallback: string): string => {
    const resolved = i18n?.t(key);
    if (resolved === undefined || resolved === key || resolved === `components.${key}`) {
      return fallback;
    }
    return resolved;
  };
  // Props win over the catalog; the catalog wins over the English floor.
  const messages = useMemo(
    () => {
      const catalogDefaults = {} as ListToolbarMessages;
      for (const key of CATALOG_MESSAGE_KEYS) {
        catalogDefaults[key] = tOr(`listToolbar.${key}`, DEFAULT_MESSAGES[key]);
      }
      return { ...catalogDefaults, ...messageOverrides };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [messageOverrides, i18n?.t]
  );
  const searchPlaceholder =
    searchPlaceholderProp ?? tOr("listToolbar.searchPlaceholder", "Search...");

  const handleSearchChange = useCallback(
    (value: string) => {
      onSearchChange(value);
    },
    [onSearchChange]
  );

  /** Build the list of active filter chips for display. */
  const activeFilterChips = useMemo(() => {
    if (!activeFilters || !filterPills) return [];
    const chips: { key: string; label: string; value: string }[] = [];
    for (const pill of filterPills) {
      const active = activeFilters[pill.key];
      if (active && active !== "" && active !== "all") {
        const option = pill.options.find((o) => o.value === String(active));
        chips.push({
          key: pill.key,
          label: pill.label,
          value: option?.label ?? String(active),
        });
      }
    }
    return chips;
  }, [activeFilters, filterPills]);

  const hasActiveFilters = activeFilterChips.length > 0;
  // `showTitleSection` alone gates the cluster. The historical
  // `Boolean(title || totalCount >= 0)` term was tautological (any count
  // passes `>= 0`) and is preserved here as documentation of that falsified
  // behavior, not as logic.
  const showTitleCluster = showTitleSection;
  const searchAriaLabel = messages.searchLabel ?? searchPlaceholder;

  return (
    <Box
      ref={containerRef}
      data-part="root"
      data-mobile={isCompact}
      data-container-layout={isCompact ? "compact" : "full"}
      data-has-active-filters={hasActiveFilters}
      data-has-title={showTitleCluster}
      data-has-primary-action={!!primaryAction}
      className={`ds-pattern-list-toolbar ds-engine-modern ${className ?? ""}`}
      style={{
        ...style,
      }}
    >
      {isCompact ? (
        /* ================================================================ */
        /* MOBILE LAYOUT                                                    */
        /* ================================================================ */
        <Stack
          data-part="mobile-layout"
          className="ds-list-toolbar__mobile-layout"
          spacing="sm"
        >
          {/* Row 1: Title + actions */}
          <Flex
            data-part="mobile-header"
            className="ds-list-toolbar__mobile-header"
            align="center"
            justify="between"
          >
            <Flex
              data-part="title-section"
              className="ds-list-toolbar__title-section"
              align="center"
            >
              {showTitleCluster && (
                <>
                  {icon && (
                    <Box
                      data-part="title-icon"
                      className="ds-list-toolbar__title-icon"
                    >
                      {icon}
                    </Box>
                  )}
                  <Text
                    data-part="title"
                    className="ds-list-toolbar__title"
                  >
                    {title}
                  </Text>
                  <Badge variant="secondary">
                    {totalCount.toLocaleString()}
                  </Badge>
                </>
              )}
            </Flex>
            <Flex
              data-part="mobile-actions"
              className="ds-list-toolbar__mobile-actions"
              align="center"
            >
              <MobileOverflow
                density={density}
                onDensityChange={onDensityChange}
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
                onExport={onExport}
                messages={messages}
              />
              {primaryAction && (
                <Button
                  aria-label={primaryAction.label}
                  className="ds-list-toolbar__primary-action-mobile"
                  data-part="primary-action-mobile"
                  variant="primary"
                  size="sm"
                  onClick={primaryAction.onClick}
                  icon={primaryAction.icon ?? <Plus size={15} />}
                >
                  <Box
                    as="span"
                    className="ds-list-toolbar__primary-action-mobile-label"
                    data-part="primary-action-mobile-label"
                  >
                    {primaryAction.label}
                  </Box>
                </Button>
              )}
            </Flex>
          </Flex>

          {/* Row 2: Search */}
          <Box
            data-part="search-section"
            className="ds-list-toolbar__search-section"
          >
            <Input
              size="sm"
              aria-label={searchAriaLabel}
              placeholder={searchPlaceholder}
              value={search}
              onChange={handleSearchChange}
              clearable
              prefix={
                <Search
                  data-part="search-icon"
                  className="ds-list-toolbar__search-icon"
                  size={14}
                />
              }
              suffix={
                activeFilterCount > 0 ? (
                  <FilterCountBadge count={activeFilterCount} />
                ) : undefined
              }
            />
          </Box>

          {/* Row 3: Filter pills (horizontal scroll) */}
          {filterPills && filterPills.length > 0 && (
            <Box
              data-part="filter-rail"
              className="ds-list-toolbar__filter-rail"
            >
              <Flex
                align="center"
                className="ds-list-toolbar__filter-rail-track"
              >
                {filterPills.map((pill) => (
                  <FilterButton
                    key={pill.key}
                    pill={pill}
                    onFilterChange={onFilterChange}
                  />
                ))}
              </Flex>
            </Box>
          )}
        </Stack>
      ) : (
        /* ================================================================ */
        /* DESKTOP LAYOUT                                                   */
        /* ================================================================ */
        <Flex
          data-part="main-row"
          className="ds-list-toolbar__main-row"
          align="center"
        >
          {/* ── Left section: Title + Count ────────────────────────── */}
          {showTitleCluster && (
            <>
              <Flex
                data-part="title-section"
                className="ds-list-toolbar__title-section"
                align="center"
              >
                {icon && (
                  <Box
                    data-part="title-icon"
                    className="ds-list-toolbar__title-icon"
                  >
                    {icon}
                  </Box>
                )}
                <Text
                  data-part="title"
                  className="ds-list-toolbar__title"
                >
                  {title}
                </Text>
                <Badge variant="secondary">{totalCount.toLocaleString()}</Badge>
              </Flex>

              <ToolbarDivider />
            </>
          )}

          {/* ── Search input ───────────────────────────────────────── */}
          <Box
            data-part="search-section"
            className="ds-list-toolbar__search-section"
          >
            <Input
              size="sm"
              aria-label={searchAriaLabel}
              placeholder={searchPlaceholder}
              value={search}
              onChange={handleSearchChange}
              clearable
              prefix={
                <Search
                  data-part="search-icon"
                  className="ds-list-toolbar__search-icon"
                  size={14}
                />
              }
              suffix={
                activeFilterCount > 0 ? (
                  <FilterCountBadge count={activeFilterCount} />
                ) : undefined
              }
            />
          </Box>

          {/* ── Filter pills ──────────────────────────────────────── */}
          {filterPills && filterPills.length > 0 && (
            <>
              <ToolbarDivider />
              <Flex
                data-part="filter-rail"
                className="ds-list-toolbar__filter-rail"
                align="center"
              >
                {filterPills.map((pill) => (
                  <FilterButton
                    key={pill.key}
                    pill={pill}
                    onFilterChange={onFilterChange}
                  />
                ))}
              </Flex>
            </>
          )}

          {/* ── Saved views bar (center stretch) ──────────────────── */}
          {savedViewsContent && (
            <>
              <ToolbarDivider />
              <Box
                data-part="saved-views"
                className="ds-list-toolbar__saved-views"
              >
                {savedViewsContent}
              </Box>
            </>
          )}

          {/* ── Spacer (pushes right section to end) ──────────────── */}
          {!savedViewsContent && (
            <Box className="ds-list-toolbar__flex-spacer" aria-hidden="true" />
          )}

          {/* ── Right section: Controls ────────────────────────────── */}
          <Flex
            data-part="controls"
            className="ds-list-toolbar__controls"
            align="center"
          >
            {/* Density toggle */}
            <DensitySwitch
              density={density}
              onDensityChange={onDensityChange}
              messages={messages}
            />

            {/* View mode toggle */}
            <ViewSwitch
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
              messages={messages}
            />

            {/* Export */}
            {onExport && (
              <IconButton
                onClick={onExport}
                ariaLabel={messages.export}
                tooltipText={messages.export}
              >
                <Download size={15} />
              </IconButton>
            )}

            {/* Column settings */}
            <SettingsDropdown
              columnSettingsContent={columnSettingsContent}
              savedViewsContent={savedViewsContent}
              density={density}
              onDensityChange={onDensityChange}
              open={settingsOpen}
              onOpenChange={setSettingsOpen}
              messages={messages}
            />

            {/* Primary action */}
            {primaryAction && (
              <>
                <ToolbarDivider />
                <Button
                  variant="primary"
                  size="sm"
                  className="ds-list-toolbar__primary-action"
                  data-part="primary-action"
                  onClick={primaryAction.onClick}
                  icon={primaryAction.icon ?? <Plus size={15} />}
                >
                  {primaryAction.label}
                </Button>
              </>
            )}
          </Flex>
        </Flex>
      )}

      {/* ================================================================ */}
      {/* Active filter chips strip (bulk-action-like bar)                 */}
      {/* ================================================================ */}
      {hasActiveFilters && (
        <Flex
          data-part="filter-chips-strip"
          className="ds-list-toolbar__filter-chips-strip"
          align="center"
          wrap="wrap"
          role="region"
          aria-live="polite"
          aria-label={`${activeFilterChips.length} ${messages.active}`}
        >
          <Flex
            align="center"
            className="ds-list-toolbar__filter-chips-summary"
          >
            <Filter
              data-part="filter-chips-icon"
              className="ds-list-toolbar__filter-chips-icon"
              size={12}
            />
            <Text
              data-part="filter-chips-count"
              className="ds-list-toolbar__filter-chips-count"
            >
              {activeFilterChips.length} {messages.active}
            </Text>
          </Flex>

          <Box
            data-part="divider"
            className="ds-list-toolbar__divider ds-list-toolbar__divider--compact"
          />

          {activeFilterChips.map((chip) => (
            <Tag
              key={chip.key}
              data-part="filter-chip"
              className="ds-list-toolbar__filter-chip"
              closable
              onClose={() => onFilterChange?.(chip.key, "")}
              size="sm"
            >
              <Text
                data-part="filter-chip-label"
                className="ds-list-toolbar__filter-chip-label"
                as="span"
              >
                {chip.label}:
              </Text>{" "}
              <Text
                data-part="filter-chip-value"
                className="ds-list-toolbar__filter-chip-value"
                as="span"
              >
                {chip.value}
              </Text>
            </Tag>
          ))}

          {activeFilterCount > 0 && onClearFilters && (
            <>
              <Box className="ds-list-toolbar__flex-spacer" aria-hidden="true" />
              <Button
                variant="ghost"
                size="xs"
                data-part="clear-all"
                className="ds-list-toolbar__clear-all"
                onClick={onClearFilters}
                icon={<X size={12} aria-hidden="true" />}
              >
                {messages.clearAll}
              </Button>
            </>
          )}
        </Flex>
      )}
    </Box>
  );
}

// ============================================================================
// SMALL HELPER COMPONENTS
// ============================================================================

/**
 * Compact badge showing the number of active filters, displayed inside the
 * search input suffix area.
 */
function FilterCountBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <Badge
      tone="primary"
      badgeStyle="solid"
      size="xs"
      count={count}
      data-part="count-badge"
      className="ds-list-toolbar__count-badge"
    />
  );
}
