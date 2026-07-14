'use client';

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

import { useState, useCallback, useMemo } from 'react';

import {
  Box,
  Flex,
  Stack,
  Text,
  Button,
  Badge,
  Input,
  Popover,
  Tabs,
  Tag,
  Tooltip,
} from '../../../../primitives';
import {
  Search,
  List,
  LayoutGrid,
  Download,
  Plus,
  Settings2,
  Filter,
  X,
  AlignJustify,
  AlignCenter,
  AlignLeft,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react';

import type { ListToolbarProps, FilterPillConfig, DensityKey } from '../ListToolbar.types';
import { useBreakpoints } from '../../../../../hooks/responsive/useBreakpoints';
import {
  FILTER_PILL_ACTIVE_BG,
  FILTER_PILL_ACTIVE_BORDER,
  FILTER_PILL_ACTIVE_COLOR,
  FILTER_PILL_ACTIVE_SHADOW,
  FILTER_PILL_BG,
  FILTER_PILL_BORDER,
  FILTER_PILL_COLOR,
  FILTER_PILL_COUNT_ACTIVE_BG,
  FILTER_PILL_COUNT_ACTIVE_BORDER,
  FILTER_PILL_FOCUS_RING,
  FILTER_PILL_FRAME_BG,
  FILTER_PILL_HOVER_BG,
  FILTER_PILL_HOVER_BORDER,
  FILTER_PILL_SHADOW,
  SEARCH_ICON_COLOR,
  TOOLBAR_BG,
  TOOLBAR_BORDER,
  TOOLBAR_BORDER_BOTTOM,
  TOOLBAR_COLOR,
  TOOLBAR_CONTROL_BG,
  TOOLBAR_CONTROL_BORDER,
  TOOLBAR_CONTROL_COLOR,
  TOOLBAR_DIVIDER,
  TOOLBAR_GAP,
  TOOLBAR_PADDING,
  TOOLBAR_RADIUS,
  TOOLBAR_SHADOW,
  EASE_OUT,
  MOTION_FAST,
  searchInputStyle,
} from '../tokens';

// ============================================================================
// DESIGN TOKENS (local aliases for readability)
// ============================================================================

const T = `${MOTION_FAST} ${EASE_OUT}`;

const RADIUS_SM = 'var(--ds-radius-sm, 6px)';
const RADIUS_MD = TOOLBAR_RADIUS;

const COLOR_TEXT_PRIMARY = TOOLBAR_COLOR;
const COLOR_TEXT_SECONDARY = TOOLBAR_CONTROL_COLOR;
const COLOR_TEXT_MUTED = FILTER_PILL_COLOR;
const COLOR_TEXT_ON_PRIMARY = 'var(--ds-color-text-on-primary)';

// Spacing constants (px)
const GAP_INTRA = 6;   // within a group

// Shared icon-button dimensions
const ICON_BTN_SIZE = 32;

// ============================================================================
// SHARED STYLES
// ============================================================================

/** Reusable base for ghost icon buttons (view, density, export, settings). */
const iconButtonBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: ICON_BTN_SIZE,
  height: ICON_BTN_SIZE,
  border: `1px solid ${TOOLBAR_CONTROL_BORDER}`,
  borderRadius: RADIUS_SM,
  background: TOOLBAR_CONTROL_BG,
  color: TOOLBAR_CONTROL_COLOR,
  cursor: 'pointer',
  flexShrink: 0,
  transition: `background ${T}, color ${T}, border-color ${T}`,
  padding: 0,
  outline: 'none',
};

/** Hover style applied via onMouseEnter/Leave for icon buttons. */
const iconButtonHover: React.CSSProperties = {
  background: FILTER_PILL_HOVER_BG,
  color: COLOR_TEXT_PRIMARY,
};

// ============================================================================
// DENSITY OPTIONS
// ============================================================================

const DENSITY_OPTIONS: {
  key: DensityKey;
  icon: React.ReactNode;
  label: string;
}[] = [
  { key: 'compact', icon: <AlignJustify size={14} />, label: 'Compact' },
  { key: 'comfortable', icon: <AlignCenter size={14} />, label: 'Comfortable' },
  { key: 'spacious', icon: <AlignLeft size={14} />, label: 'Spacious' },
];

// ============================================================================
// HOOKS
// ============================================================================

/** Small helper for hover state on icon buttons. */
function useHover() {
  const [hovered, setHovered] = useState(false);
  const handlers = useMemo(
    () => ({
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
    }),
    [],
  );
  return { hovered, handlers };
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * SegmentedControl -- generic grouped button bar with shared border.
 * Renders children as side-by-side segments inside a pill-shaped container.
 */
function SegmentedControl({
  children,
  style: extraStyle,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <Box
      data-part="segmented-control"
      style={{
        display: 'inline-flex',
        borderRadius: RADIUS_SM,
        border: `1px solid ${TOOLBAR_CONTROL_BORDER}`,
        overflow: 'hidden',
        flexShrink: 0,
        background: TOOLBAR_CONTROL_BG,
        color: TOOLBAR_CONTROL_COLOR,
        ...extraStyle,
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Single segment inside a SegmentedControl.
 */
function Segment({
  active,
  onClick,
  ariaLabel,
  title: titleText,
  children,
  style: extraStyle,
}: {
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
  title?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const { hovered, handlers } = useHover();

  return (
    <Box
      as="button"
      data-part="segment"
      data-active={active}
      onClick={onClick}
      aria-label={ariaLabel}
      title={titleText}
      {...handlers}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: ICON_BTN_SIZE,
        height: 30,
        border: 'none',
        background: active ? FILTER_PILL_ACTIVE_BG : hovered ? FILTER_PILL_HOVER_BG : 'transparent',
        color: active ? FILTER_PILL_ACTIVE_COLOR : hovered ? COLOR_TEXT_PRIMARY : TOOLBAR_CONTROL_COLOR,
        cursor: 'pointer',
        transition: `background ${T}, color ${T}`,
        padding: 0,
        outline: 'none',
        position: 'relative' as const,
        ...extraStyle,
      }}
    >
      {children}
      {/* Active indicator bar at bottom */}
      {active && (
        <Box
          data-part="segment-indicator"
          style={{
            position: 'absolute',
            bottom: 0,
            left: '20%',
            right: '20%',
            height: 2,
            borderRadius: 1,
            background: FILTER_PILL_ACTIVE_COLOR,
            transition: `opacity ${T}`,
          }}
        />
      )}
    </Box>
  );
}

/**
 * IconButton -- standalone ghost icon button with tooltip.
 */
function IconButton({
  onClick,
  ariaLabel,
  tooltipText,
  children,
  style: extraStyle,
}: {
  onClick: () => void;
  ariaLabel: string;
  tooltipText?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const { hovered, handlers } = useHover();

  const btn = (
    <Box
      as="button"
      data-part="icon-button"
      onClick={onClick}
      aria-label={ariaLabel}
      {...handlers}
      style={{
        ...iconButtonBase,
        ...(hovered ? iconButtonHover : {}),
        borderColor: hovered ? FILTER_PILL_HOVER_BORDER : TOOLBAR_CONTROL_BORDER,
        ...extraStyle,
      }}
    >
      {children}
    </Box>
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
      style={{
        width: 1,
        height: 20,
        background: TOOLBAR_DIVIDER,
        flexShrink: 0,
        marginInline: 4,
        opacity: 0.6,
      }}
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
  const { hovered, handlers } = useHover();
  const isActive = pill.value && pill.value !== '' && pill.value !== 'all';
  const activeLabel = pill.options.find((o) => o.value === pill.value)?.label;

  return (
    <Popover
      trigger="click"
      placement="bottomLeft"
      open={open}
      onOpenChange={setOpen}
      arrow={false}
      content={
        <Box style={{ minWidth: 180, padding: '4px 0' }}>
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
      <Box
        as="button"
        data-part="filter-trigger"
        data-active={!!isActive}
        {...handlers}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          height: ICON_BTN_SIZE,
          padding: '0 12px',
          borderRadius: RADIUS_SM,
          border: isActive
            ? `1px solid ${FILTER_PILL_ACTIVE_BORDER}`
            : `1px solid ${hovered ? FILTER_PILL_HOVER_BORDER : FILTER_PILL_BORDER}`,
          background: isActive
            ? FILTER_PILL_ACTIVE_BG
            : hovered
              ? FILTER_PILL_HOVER_BG
              : FILTER_PILL_BG,
          color: isActive
            ? FILTER_PILL_ACTIVE_COLOR
            : hovered
              ? COLOR_TEXT_PRIMARY
              : FILTER_PILL_COLOR,
          boxShadow: isActive ? FILTER_PILL_ACTIVE_SHADOW : FILTER_PILL_SHADOW,
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          transition: `border-color ${T}, background ${T}, color ${T}`,
          whiteSpace: 'nowrap' as const,
          flexShrink: 0,
          outline: 'none',
          lineHeight: 1,
        }}
        onFocus={(event) => {
          event.currentTarget.style.boxShadow = FILTER_PILL_FOCUS_RING;
        }}
        onBlur={(event) => {
          event.currentTarget.style.boxShadow = isActive ? FILTER_PILL_ACTIVE_SHADOW : FILTER_PILL_SHADOW;
        }}
      >
        {pill.label}
        {isActive && activeLabel && (
          <Box
            as="span"
            data-part="filter-badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 18,
              height: 18,
              padding: '0 5px',
              borderRadius: 9,
              background: FILTER_PILL_COUNT_ACTIVE_BG,
              border: `1px solid ${FILTER_PILL_COUNT_ACTIVE_BORDER}`,
              color: COLOR_TEXT_ON_PRIMARY,
              fontSize: 11,
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            1
          </Box>
        )}
        <ChevronDown size={12} style={{ opacity: 0.5, flexShrink: 0 }} />
      </Box>
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
  const { hovered, handlers } = useHover();

  return (
    <Box
      as="button"
      data-part="filter-dropdown-item"
      data-selected={selected}
      onClick={onClick}
      {...handlers}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        padding: '8px 12px',
        border: 'none',
        background: selected
          ? FILTER_PILL_ACTIVE_BG
          : hovered
            ? FILTER_PILL_HOVER_BG
            : 'transparent',
        color: selected
          ? FILTER_PILL_ACTIVE_COLOR
          : FILTER_PILL_COLOR,
        fontWeight: selected ? 500 : 400,
        fontSize: 13,
        cursor: 'pointer',
        transition: `background ${T}`,
        textAlign: 'left' as const,
        borderRadius: RADIUS_SM,
        outline: 'none',
        lineHeight: 1.4,
      }}
    >
      <Text as="span" style={{ flex: 1, fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>
        {label}
      </Text>
      {selected && (
        <Text data-part="filter-checkmark" as="span" style={{ fontSize: 12, opacity: 0.6, color: FILTER_PILL_ACTIVE_COLOR, flexShrink: 0 }}>
          &#10003;
        </Text>
      )}
    </Box>
  );
}

// ── View Mode Toggle ───────────────────────────────────────────────────────

function ViewSwitch({
  viewMode,
  onViewModeChange,
}: {
  viewMode: 'list' | 'cards';
  onViewModeChange: (mode: 'list' | 'cards') => void;
}) {
  const modes: { key: 'list' | 'cards'; icon: React.ReactNode; label: string }[] = [
    { key: 'list', icon: <List size={15} />, label: 'List view' },
    { key: 'cards', icon: <LayoutGrid size={15} />, label: 'Card view' },
  ];

  return (
    <Tooltip content="View mode" placement="bottom">
      <SegmentedControl>
        {modes.map((mode) => (
          <Segment
            key={mode.key}
            active={viewMode === mode.key}
            onClick={() => onViewModeChange(mode.key)}
            ariaLabel={mode.label}
            title={mode.label}
          >
            {mode.icon}
          </Segment>
        ))}
      </SegmentedControl>
    </Tooltip>
  );
}

// ── Density Toggle ─────────────────────────────────────────────────────────

function DensitySwitch({
  density,
  onDensityChange,
}: {
  density: DensityKey;
  onDensityChange: (d: DensityKey) => void;
}) {
  return (
    <Tooltip content="Row density" placement="bottom">
      <SegmentedControl>
        {DENSITY_OPTIONS.map((opt) => (
          <Segment
            key={opt.key}
            active={density === opt.key}
            onClick={() => onDensityChange(opt.key)}
            ariaLabel={`${opt.label} density`}
            title={opt.label}
            style={{ width: 30 }}
          >
            {opt.icon}
          </Segment>
        ))}
      </SegmentedControl>
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
}: {
  columnSettingsContent?: React.ReactNode;
  savedViewsContent?: React.ReactNode;
  density: DensityKey;
  onDensityChange: (d: DensityKey) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Popover
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={onOpenChange}
      arrow={false}
      content={
        <Box style={{ width: 300 }}>
          <Tabs
            defaultActiveKey="columns"
            size="sm"
            items={[
              {
                key: 'columns',
                label: 'Columns',
                children: columnSettingsContent ?? (
                  <Text
                    data-part="settings-empty"
                    style={{
                      fontSize: 13,
                      color: COLOR_TEXT_MUTED,
                      padding: '16px 0',
                      textAlign: 'center' as const,
                    }}
                  >
                    No column settings available.
                  </Text>
                ),
              },
              {
                key: 'density',
                label: 'Density',
                children: (
                  <Stack spacing="sm" style={{ padding: '8px 0' }}>
                    {DENSITY_OPTIONS.map((opt) => {
                      const isActive = density === opt.key;
                      return (
                        <DensityOptionRow
                          key={opt.key}
                          label={opt.label}
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
                key: 'views',
                label: 'Views',
                children: savedViewsContent ?? (
                  <Text
                    data-part="settings-empty"
                    style={{
                      fontSize: 13,
                      color: COLOR_TEXT_MUTED,
                      padding: '16px 0',
                      textAlign: 'center' as const,
                    }}
                  >
                    No saved views available.
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
        ariaLabel="Column settings"
        tooltipText={open ? undefined : 'Settings'}
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
  const { hovered, handlers } = useHover();

  return (
    <Box
      as="button"
      data-part="density-option"
      data-active={active}
      onClick={onClick}
      {...handlers}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '8px 10px',
        borderRadius: RADIUS_SM,
        border: active
          ? `1px solid ${FILTER_PILL_ACTIVE_BORDER}`
          : `1px solid ${hovered ? FILTER_PILL_HOVER_BORDER : FILTER_PILL_BORDER}`,
        background: active
          ? FILTER_PILL_ACTIVE_BG
          : hovered
            ? FILTER_PILL_HOVER_BG
            : FILTER_PILL_BG,
        cursor: 'pointer',
        transition: `background ${T}, border-color ${T}`,
        textAlign: 'left' as const,
        color: active
          ? FILTER_PILL_ACTIVE_COLOR
          : FILTER_PILL_COLOR,
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        outline: 'none',
      }}
    >
      <Box
        data-part="density-option-icon"
        style={{
          display: 'flex',
          alignItems: 'center',
          color: 'inherit',
        }}
      >
        {icon}
      </Box>
      <Text as="span" style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>
        {label}
      </Text>
      {active && (
        <Text
          data-part="density-checkmark"
          as="span"
          style={{ marginLeft: 'auto', fontSize: 12, color: FILTER_PILL_ACTIVE_COLOR }}
        >
          &#10003;
        </Text>
      )}
    </Box>
  );
}

// ── Mobile Overflow Menu ───────────────────────────────────────────────────

function MobileOverflow({
  density,
  onDensityChange,
  viewMode,
  onViewModeChange,
  onExport,
}: {
  density: DensityKey;
  onDensityChange: (d: DensityKey) => void;
  viewMode: 'list' | 'cards';
  onViewModeChange: (mode: 'list' | 'cards') => void;
  onExport?: () => void;
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
        <Stack spacing="sm" style={{ padding: '8px 0', minWidth: 220 }}>
          {/* View mode */}
          <Box style={{ padding: '6px 14px' }}>
            <Text
              data-part="mobile-overflow-label"
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: COLOR_TEXT_MUTED,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
                marginBottom: 8,
              }}
            >
              View
            </Text>
            <ViewSwitch viewMode={viewMode} onViewModeChange={onViewModeChange} />
          </Box>

          {/* Density */}
          <Box style={{ padding: '6px 14px' }}>
            <Text
              data-part="mobile-overflow-label"
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: COLOR_TEXT_MUTED,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
                marginBottom: 8,
              }}
            >
              Density
            </Text>
            <DensitySwitch density={density} onDensityChange={onDensityChange} />
          </Box>

          {/* Divider */}
          {onExport && (
            <Box
              data-part="divider"
              style={{
                height: 1,
                background: TOOLBAR_DIVIDER,
                marginInline: 14,
                opacity: 0.5,
              }}
            />
          )}

          {/* Export */}
          {onExport && (
            <MobileOverflowItem
              icon={<Download size={14} />}
              label="Export"
              onClick={() => {
                onExport();
                setOpen(false);
              }}
            />
          )}
        </Stack>
      }
    >
      <IconButton onClick={() => setOpen(!open)} ariaLabel="More options">
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
  const { hovered, handlers } = useHover();

  return (
    <Box
      as="button"
      data-part="mobile-overflow-item"
      onClick={onClick}
      {...handlers}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '8px 14px',
        border: 'none',
        background: hovered ? FILTER_PILL_HOVER_BG : 'transparent',
        color: hovered ? COLOR_TEXT_PRIMARY : TOOLBAR_CONTROL_COLOR,
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        transition: `background ${T}, color ${T}`,
        textAlign: 'left' as const,
        outline: 'none',
      }}
    >
      <Box data-part="mobile-overflow-item-icon" style={{ display: 'flex', alignItems: 'center', color: 'inherit', flexShrink: 0 }}>
        {icon}
      </Box>
      <Text as="span" style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>
        {label}
      </Text>
    </Box>
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
  searchPlaceholder = 'Search...',
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

  const handleSearchChange = useCallback(
    (value: string) => {
      onSearchChange(value);
    },
    [onSearchChange],
  );

  /** Build the list of active filter chips for display. */
  const activeFilterChips = useMemo(() => {
    if (!activeFilters || !filterPills) return [];
    const chips: { key: string; label: string; value: string }[] = [];
    for (const pill of filterPills) {
      const active = activeFilters[pill.key];
      if (active && active !== '' && active !== 'all') {
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
  const showTitleCluster = showTitleSection && (title || totalCount >= 0);

  return (
    <Box
      data-part="root"
      className={`ds-pattern-list-toolbar ds-engine-modern ${className ?? ''}`}
      style={{
        background: TOOLBAR_BG,
        border: `1px solid ${TOOLBAR_BORDER}`,
        borderBottom: `1px solid ${TOOLBAR_BORDER_BOTTOM}`,
        borderRadius: `${RADIUS_MD} ${RADIUS_MD} 0 0`,
        color: TOOLBAR_COLOR,
        boxShadow: TOOLBAR_SHADOW,
        ...style,
      }}
    >
      {isMobile ? (
        /* ================================================================ */
        /* MOBILE LAYOUT                                                    */
        /* ================================================================ */
        <Stack spacing="sm" style={{ padding: 'var(--ds-toolbar-padding, 12px 16px)' }}>
          {/* Row 1: Title + actions */}
          <Flex align="center" justify="between" gap={8}>
            <Flex align="center" gap={8} style={{ minWidth: 0, flex: 1 }}>
              {showTitleCluster && (
                <>
                  {icon && (
                    <Box
                      data-part="title-icon"
                      style={{
                        color: COLOR_TEXT_SECONDARY,
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {icon}
                    </Box>
                  )}
                  <Text
                    data-part="title"
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: COLOR_TEXT_PRIMARY,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {title}
                  </Text>
                  <Badge variant="secondary">
                    {totalCount.toLocaleString()}
                  </Badge>
                </>
              )}
            </Flex>
            <Flex align="center" gap={GAP_INTRA} style={{ flexShrink: 0 }}>
              <MobileOverflow
                density={density}
                onDensityChange={onDensityChange}
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
                onExport={onExport}
              />
              {primaryAction && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={primaryAction.onClick}
                  icon={primaryAction.icon ?? <Plus size={15} />}
                  style={{ height: ICON_BTN_SIZE, flexShrink: 0 }}
                >
                  {primaryAction.label}
                </Button>
              )}
            </Flex>
          </Flex>

          {/* Row 2: Search */}
          <Box
            style={{
              position: 'relative',
            }}
          >
            <Input
              size="sm"
              placeholder={searchPlaceholder}
              value={search}
              onChange={handleSearchChange}
              prefix={
                <Search
                  data-part="search-icon"
                  size={14}
                  style={{ color: SEARCH_ICON_COLOR }}
                />
              }
              suffix={
                activeFilterCount > 0 ? (
                  <FilterCountBadge count={activeFilterCount} />
                ) : undefined
              }
              style={searchInputStyle({
                height: 36,
                borderRadius: RADIUS_SM,
              })}
            />
          </Box>

          {/* Row 3: Filter pills (horizontal scroll) */}
          {filterPills && filterPills.length > 0 && (
            <Box
              style={{
                overflowX: 'auto',
                marginInline: -4,
                paddingBottom: 2,
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <Flex align="center" gap={GAP_INTRA} style={{ width: 'max-content', paddingInline: 4 }}>
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
            align="center"
            style={{
              padding: TOOLBAR_PADDING,
              gap: TOOLBAR_GAP,
              flexWrap: 'nowrap',
              minWidth: 0,
            }}
          >
            {/* ── Left section: Title + Count ────────────────────────── */}
            {showTitleCluster && (
              <>
                <Flex align="center" gap={8} style={{ flexShrink: 0 }}>
                  {icon && (
                    <Box
                      data-part="title-icon"
                      style={{
                        color: COLOR_TEXT_SECONDARY,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {icon}
                    </Box>
                  )}
                  <Text
                    data-part="title"
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: COLOR_TEXT_PRIMARY,
                      whiteSpace: 'nowrap',
                      letterSpacing: 0,
                    }}
                  >
                    {title}
                  </Text>
                  <Badge variant="secondary">
                    {totalCount.toLocaleString()}
                  </Badge>
                </Flex>

                <ToolbarDivider />
              </>
            )}

            {/* ── Search input ───────────────────────────────────────── */}
            <Box
              style={{
                flex: showTitleCluster ? 1 : 2,
                maxWidth: showTitleCluster ? 320 : 460,
                minWidth: 180,
              }}
            >
            <Input
              size="sm"
              placeholder={searchPlaceholder}
              value={search}
              onChange={handleSearchChange}
              prefix={
                <Search
                  data-part="search-icon"
                  size={14}
                  style={{ color: SEARCH_ICON_COLOR }}
                />
              }
              suffix={
                activeFilterCount > 0 ? (
                  <FilterCountBadge count={activeFilterCount} />
                ) : undefined
              }
              style={searchInputStyle({
                height: ICON_BTN_SIZE,
                borderRadius: RADIUS_SM,
                fontSize: 13,
              })}
            />
          </Box>

          {/* ── Filter pills ──────────────────────────────────────── */}
          {filterPills && filterPills.length > 0 && (
            <>
              <ToolbarDivider />
              <Flex
                align="center"
                gap={GAP_INTRA}
                style={{
                  flexShrink: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                }}
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
              <Box style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                {savedViewsContent}
              </Box>
            </>
          )}

          {/* ── Spacer (pushes right section to end) ──────────────── */}
          {!savedViewsContent && <Box style={{ flex: 1 }} />}

          {/* ── Right section: Controls ────────────────────────────── */}
          <Flex align="center" gap={GAP_INTRA} style={{ flexShrink: 0 }}>
            <ToolbarDivider />

            {/* Density toggle */}
            <DensitySwitch density={density} onDensityChange={onDensityChange} />

            {/* View mode toggle */}
            <ViewSwitch viewMode={viewMode} onViewModeChange={onViewModeChange} />

            {/* Export */}
            {onExport && (
              <IconButton
                onClick={onExport}
                ariaLabel="Export"
                tooltipText="Export"
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
            />

            {/* Primary action */}
            {primaryAction && (
              <>
                <ToolbarDivider />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={primaryAction.onClick}
                  icon={primaryAction.icon ?? <Plus size={15} />}
                  style={{
                    height: ICON_BTN_SIZE,
                    flexShrink: 0,
                    borderRadius: RADIUS_SM,
                    fontWeight: 600,
                    fontSize: 13,
                    gap: 6,
                  }}
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
          align="center"
          gap={8}
          wrap="wrap"
          style={{
            padding: '8px 16px',
            borderTop: `1px solid ${TOOLBAR_BORDER_BOTTOM}`,
            background: FILTER_PILL_FRAME_BG,
          }}
        >
          <Flex align="center" gap={6} style={{ flexShrink: 0 }}>
            <Filter
              data-part="filter-chips-icon"
              size={12}
              style={{ color: FILTER_PILL_ACTIVE_COLOR, flexShrink: 0 }}
            />
            <Text
              data-part="filter-chips-count"
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: COLOR_TEXT_MUTED,
                whiteSpace: 'nowrap',
              }}
            >
              {activeFilterChips.length} active
            </Text>
          </Flex>

          <Box
            data-part="divider"
            style={{
              width: 1,
              height: 14,
              background: TOOLBAR_DIVIDER,
              flexShrink: 0,
              opacity: 0.5,
            }}
          />

          {activeFilterChips.map((chip) => (
            <Tag
              key={chip.key}
              data-part="filter-chip"
              closable
              onClose={() => onFilterChange?.(chip.key, '')}
              size="sm"
              style={{
                fontSize: 12,
                transition: `opacity ${T}`,
                borderRadius: RADIUS_SM,
              }}
            >
              <Text data-part="filter-chip-label" as="span" style={{ fontSize: 12, color: COLOR_TEXT_MUTED, fontWeight: 400 }}>
                {chip.label}:
              </Text>{' '}
              <Text data-part="filter-chip-value" as="span" style={{ fontSize: 12, fontWeight: 500, color: COLOR_TEXT_PRIMARY }}>
                {chip.value}
              </Text>
            </Tag>
          ))}

          {activeFilterCount > 0 && onClearFilters && (
            <>
              <Box style={{ flex: 1 }} />
              <Box
                as="button"
                data-part="clear-all"
                onClick={onClearFilters}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 10px',
                  border: 'none',
                  borderRadius: RADIUS_SM,
                  background: 'transparent',
                  color: COLOR_TEXT_MUTED,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: `color ${T}, background ${T}`,
                  outline: 'none',
                  flexShrink: 0,
                }}
              >
                <X size={12} />
                Clear all
              </Box>
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
    <Box
      data-part="count-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 18,
        height: 18,
        padding: '0 5px',
        borderRadius: 9,
        background: FILTER_PILL_COUNT_ACTIVE_BG,
        border: `1px solid ${FILTER_PILL_COUNT_ACTIVE_BORDER}`,
        color: COLOR_TEXT_ON_PRIMARY,
        fontSize: 10,
        fontWeight: 700,
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {count}
    </Box>
  );
}
