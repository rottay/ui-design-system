'use client';

/**
 * @fileoverview ListToolbar -- Classic engine implementation.
 * A professional two-row toolbar for data tables. Row 1 contains the title,
 * count badge, status filter pills (right-aligned), and a list/cards view
 * mode toggle. Row 2 contains a full-width search input, a unified settings
 * gear dropdown (columns, density, views), an export button, and the primary
 * action button.
 *
 * Uses only DS primitives (Box, Flex, Text, Button, Badge, Input, Popover,
 * Tabs, Tag) and paints inline through the shared `--ds-toolbar-*` /
 * `--ds-filter-pill-*` token channels (foundation/tokens), which tenant
 * bundles define. Honors the full ListToolbarProps contract, including
 * `messages` chrome localization and `showTitleSection`.
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
} from '../../../../../primitives';
import {
  SearchIcon as Search,
  ListIcon as List,
  LayoutGridIcon as LayoutGrid,
  DownloadIcon as Download,
  PlusIcon as Plus,
  Settings2Icon as Settings2,
  FilterIcon as Filter,
  AlignJustifyIcon as AlignJustify,
  AlignCenterIcon as AlignCenter,
  AlignLeftIcon as AlignLeft,
} from '../../../../../../graphics/icons';

import type {
  ListToolbarProps,
  ListToolbarMessages,
  FilterPillConfig,
  DensityKey,
} from '../../contracts';
import { useBreakpoints } from '@/infrastructure/runtime/responsive/composition/react/provider/breakpoint-state';
import { useEngineContext } from '@/infrastructure/runtime/engines/composition/react/provider';
import { PATTERN_TRANSITION } from '@/ui/patterns/foundation/motion';
import {
  FILTER_PILL_ACTIVE_BG,
  FILTER_PILL_ACTIVE_BORDER,
  FILTER_PILL_ACTIVE_COLOR,
  FILTER_PILL_ACTIVE_SHADOW,
  FILTER_PILL_BG,
  FILTER_PILL_BORDER,
  FILTER_PILL_COLOR,
  FILTER_PILL_FOCUS_RING,
  FILTER_PILL_FRAME_BG,
  FILTER_PILL_FRAME_SHADOW,
  FILTER_PILL_HOVER_BG,
  FILTER_PILL_HOVER_BORDER,
  FILTER_PILL_RADIUS,
  FILTER_PILL_SHADOW,
  SEARCH_ICON_COLOR,
  TOOLBAR_BG,
  TOOLBAR_BORDER,
  TOOLBAR_BORDER_BOTTOM,
  TOOLBAR_COLOR,
  TOOLBAR_CONTROL_BG,
  TOOLBAR_CONTROL_BORDER,
  TOOLBAR_CONTROL_COLOR,
  TOOLBAR_CONTROL_RADIUS,
  TOOLBAR_DIVIDER,
  TOOLBAR_DIVIDER_SPACING,
  TOOLBAR_GAP,
  TOOLBAR_PADDING,
  TOOLBAR_RADIUS,
  TOOLBAR_SHADOW,
  searchInputStyle,
} from '../../foundation/tokens';

// ============================================================================
// CONSTANTS
// ============================================================================

const TRANSITION_FAST = PATTERN_TRANSITION;

/**
 * Historical English chrome copy. Callers localize every string through the
 * `messages` prop; the modern engine keeps the same defaults so both engines
 * resolve identical copy for identical overrides.
 */
const DEFAULT_MESSAGES: ListToolbarMessages = {
  compact: 'Compact',
  comfortable: 'Comfortable',
  spacious: 'Spacious',
  densitySuffix: 'density',
  rowDensity: 'Row density',
  viewMode: 'View mode',
  listView: 'List',
  cardView: 'Cards',
  columns: 'Columns',
  density: 'Density',
  views: 'Views',
  noColumnSettings: 'No column settings available.',
  noSavedViews: 'No saved views available.',
  columnSettings: 'Column settings',
  settings: 'Settings',
  moreOptions: 'More options',
  export: 'Export',
  active: 'active',
  clearAll: 'Clear all',
  compactDescription: 'Tighter row spacing',
  comfortableDescription: 'Default spacing',
  spaciousDescription: 'More breathing room',
};

/**
 * Focus-ring handlers for the inline-style interactive elements of this
 * engine. The ring only engages when the browser reports `:focus-visible`
 * (keyboard modality), so mouse users never see a persistent ring after
 * click, while keyboard users always get the token-painted indicator.
 */
function focusVisibleRingHandlers(baseShadow: string) {
  return {
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      if (event.currentTarget.matches(':focus-visible')) {
        event.currentTarget.style.boxShadow = FILTER_PILL_FOCUS_RING;
      }
    },
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      event.currentTarget.style.boxShadow = baseShadow;
    },
  };
}

const DENSITY_OPTIONS: {
  key: DensityKey;
  icon: React.ReactNode;
  labelKey: 'compact' | 'comfortable' | 'spacious';
  descriptionKey: 'compactDescription' | 'comfortableDescription' | 'spaciousDescription';
}[] = [
  {
    key: 'compact',
    icon: <AlignJustify size={14} />,
    labelKey: 'compact',
    descriptionKey: 'compactDescription',
  },
  {
    key: 'comfortable',
    icon: <AlignCenter size={14} />,
    labelKey: 'comfortable',
    descriptionKey: 'comfortableDescription',
  },
  {
    key: 'spacious',
    icon: <AlignLeft size={14} />,
    labelKey: 'spacious',
    descriptionKey: 'spaciousDescription',
  },
];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Individual filter pill button.
 * Active state: monochromatic dark border, rounded pill shape.
 * Inactive state: no border, secondary text color.
 */
function FilterPill({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      as="button"
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 14px',
        borderRadius: FILTER_PILL_RADIUS,
        border: `1.5px solid ${isActive ? FILTER_PILL_ACTIVE_BORDER : FILTER_PILL_BORDER}`,
        background: isActive ? FILTER_PILL_ACTIVE_BG : FILTER_PILL_BG,
        color: isActive ? FILTER_PILL_ACTIVE_COLOR : FILTER_PILL_COLOR,
        boxShadow: isActive ? FILTER_PILL_ACTIVE_SHADOW : FILTER_PILL_SHADOW,
        fontSize: 13,
        fontWeight: isActive ? 500 : 400,
        cursor: 'pointer',
        transition: `color ${TRANSITION_FAST}, border-color ${TRANSITION_FAST}, background ${TRANSITION_FAST}, box-shadow ${TRANSITION_FAST}`,
        whiteSpace: 'nowrap' as const,
        outline: 'none',
      }}
      onMouseEnter={(event) => {
        if (!isActive) {
          event.currentTarget.style.background = FILTER_PILL_HOVER_BG;
          event.currentTarget.style.borderColor = FILTER_PILL_HOVER_BORDER;
        }
      }}
      onMouseLeave={(event) => {
        if (!isActive) {
          event.currentTarget.style.background = FILTER_PILL_BG;
          event.currentTarget.style.borderColor = FILTER_PILL_BORDER;
        }
      }}
      {...focusVisibleRingHandlers(isActive ? FILTER_PILL_ACTIVE_SHADOW : FILTER_PILL_SHADOW)}
    >
      {label}
    </Box>
  );
}

/**
 * Filter pills row - renders options for a single filter pill config.
 */
function FilterPillsRow({
  pill,
  onFilterChange,
}: {
  pill: FilterPillConfig;
  onFilterChange?: (key: string, value: unknown) => void;
}) {
  return (
    <Flex align="center" gap={2}>
      {pill.options.map((option) => (
        <FilterPill
          key={option.value}
          label={option.label}
          isActive={option.value === pill.value}
          onClick={() => onFilterChange?.(pill.key, option.value)}
        />
      ))}
    </Flex>
  );
}

/**
 * View mode toggle with text labels and icons.
 * Container: rounded border, two segments.
 */
function ViewModeToggle({
  viewMode,
  onViewModeChange,
  messages,
}: {
  viewMode: 'list' | 'cards';
  onViewModeChange: (mode: 'list' | 'cards') => void;
  messages: ListToolbarMessages;
}) {
  const modes: { key: 'list' | 'cards'; label: string; icon: React.ReactNode }[] = [
    { key: 'list', label: messages.listView, icon: <List size={14} /> },
    { key: 'cards', label: messages.cardView, icon: <LayoutGrid size={14} /> },
  ];

  return (
    <Box
      role="group"
      aria-label={messages.viewMode}
      style={{
        display: 'inline-flex',
        border: `1px solid ${TOOLBAR_CONTROL_BORDER}`,
        borderRadius: TOOLBAR_CONTROL_RADIUS,
        overflow: 'hidden',
        flexShrink: 0,
        background: TOOLBAR_CONTROL_BG,
        color: TOOLBAR_CONTROL_COLOR,
        boxShadow: FILTER_PILL_FRAME_SHADOW,
      }}
    >
      {modes.map((mode, index) => {
        const isActive = viewMode === mode.key;
        return (
          <Box
            key={mode.key}
            as="button"
            type="button"
            onClick={() => onViewModeChange(mode.key)}
            aria-pressed={isActive}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              border: 'none',
              background: isActive ? FILTER_PILL_ACTIVE_BG : 'transparent',
              borderInlineEnd:
                index === 0 ? `1px solid ${TOOLBAR_DIVIDER}` : 'none',
              color: isActive ? FILTER_PILL_ACTIVE_COLOR : TOOLBAR_CONTROL_COLOR,
              fontWeight: isActive ? 500 : 400,
              fontSize: 12,
              cursor: 'pointer',
              outline: 'none',
              transition: `background ${TRANSITION_FAST}, color ${TRANSITION_FAST}, box-shadow ${TRANSITION_FAST}`,
            }}
            {...focusVisibleRingHandlers('none')}
          >
            {mode.icon}
            {mode.label}
          </Box>
        );
      })}
    </Box>
  );
}

/**
 * Density controls for the settings dropdown.
 * Three radio-style rows: compact, comfortable, spacious.
 */
function DensitySection({
  density,
  onDensityChange,
  messages,
}: {
  density: DensityKey;
  onDensityChange: (d: DensityKey) => void;
  messages: ListToolbarMessages;
}) {
  return (
    <Flex direction="column" gap={4} role="group" aria-label={messages.rowDensity}>
      {DENSITY_OPTIONS.map((opt) => {
        const isActive = density === opt.key;
        return (
          <Box
            key={opt.key}
            as="button"
            type="button"
            onClick={() => onDensityChange(opt.key)}
            aria-pressed={isActive}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              borderRadius: TOOLBAR_CONTROL_RADIUS,
              border: isActive
                ? `1px solid ${FILTER_PILL_ACTIVE_BORDER}`
                : `1px solid ${TOOLBAR_CONTROL_BORDER}`,
              background: isActive ? FILTER_PILL_ACTIVE_BG : TOOLBAR_CONTROL_BG,
              cursor: 'pointer',
              outline: 'none',
              transition: `background ${TRANSITION_FAST}, border-color ${TRANSITION_FAST}, box-shadow ${TRANSITION_FAST}`,
              width: '100%',
              textAlign: 'start' as const,
            }}
            {...focusVisibleRingHandlers('none')}
          >
            <Box
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: isActive
                  ? `5px solid ${FILTER_PILL_ACTIVE_COLOR}`
                  : `2px solid ${TOOLBAR_CONTROL_BORDER}`,
                flexShrink: 0,
                transition: `border ${TRANSITION_FAST}`,
              }}
            />
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: isActive
                  ? FILTER_PILL_ACTIVE_COLOR
                  : TOOLBAR_CONTROL_COLOR,
              }}
            >
              {opt.icon}
              <Flex direction="column" gap={1}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: isActive ? 500 : 400,
                    lineHeight: 1.2,
                  }}
                >
                  {messages[opt.labelKey]}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: FILTER_PILL_COLOR,
                    lineHeight: 1.2,
                  }}
                >
                  {messages[opt.descriptionKey]}
                </Text>
              </Flex>
            </Box>
          </Box>
        );
      })}
    </Flex>
  );
}

/**
 * Unified settings dropdown content with tabs for Columns, Density, and Views.
 */
function SettingsDropdownContent({
  columnSettingsContent,
  savedViewsContent,
  density,
  onDensityChange,
  messages,
}: {
  columnSettingsContent?: React.ReactNode;
  savedViewsContent?: React.ReactNode;
  density: DensityKey;
  onDensityChange: (d: DensityKey) => void;
  messages: ListToolbarMessages;
}) {
  return (
    <Box style={{ width: 320 }}>
      <Tabs
        defaultActiveKey="columns"
        size="sm"
        items={[
          {
            key: 'columns',
            label: messages.columns,
            children: columnSettingsContent ?? (
              <Text
                style={{
                  fontSize: 13,
                  color: FILTER_PILL_COLOR,
                  padding: '12px 0',
                }}
              >
                {messages.noColumnSettings}
              </Text>
            ),
          },
          {
            key: 'density',
            label: messages.density,
            children: (
              <DensitySection
                density={density}
                onDensityChange={onDensityChange}
                messages={messages}
              />
            ),
          },
          {
            key: 'views',
            label: messages.views,
            children: savedViewsContent ?? (
              <Text
                style={{
                  fontSize: 13,
                  color: FILTER_PILL_COLOR,
                  padding: '12px 0',
                }}
              >
                {messages.noSavedViews}
              </Text>
            ),
          },
        ]}
      />
    </Box>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Classic engine implementation of the ListToolbar pattern.
 *
 * Row 1: Title, count badge, (spacer), filter pills, view mode toggle.
 * Row 2: Search input, settings gear, export, primary action button.
 */
export default function ClassicListToolbar({
  title,
  showTitleSection = true,
  icon,
  totalCount,
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
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
  // The rustic engine re-exports this implementation; the scope class must
  // name the engine that is actually rendering, not the file that owns it.
  const { engine } = useEngineContext();
  const messages = useMemo(
    () => ({ ...DEFAULT_MESSAGES, ...messageOverrides }),
    [messageOverrides],
  );
  const searchAriaLabel = messages.searchLabel ?? searchPlaceholder;

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

  return (
    <Box
      data-part="root"
      data-mobile={isMobile}
      data-has-title={showTitleSection}
      className={`ds-pattern-list-toolbar ds-engine-${engine} ${className ?? ''}`}
      style={{
        background: TOOLBAR_BG,
        border: `1px solid ${TOOLBAR_BORDER}`,
        borderRadius: TOOLBAR_RADIUS,
        color: TOOLBAR_COLOR,
        boxShadow: TOOLBAR_SHADOW,
        overflow: 'hidden',
        ...style,
      }}
    >
      {isMobile ? (
        <>
          <Stack spacing="md" style={{ padding: 'var(--ds-toolbar-padding, 14px 14px 12px)' }}>
            <Flex align="center" justify="between" gap={12}>
              {showTitleSection && (
                <Flex align="center" gap={10} style={{ minWidth: 0 }}>
                  {icon && (
                    <Box
                      style={{
                        color: TOOLBAR_CONTROL_COLOR,
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {icon}
                    </Box>
                  )}
                  <Flex direction="column" gap={2} style={{ minWidth: 0 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: TOOLBAR_COLOR,
                        lineHeight: 1.2,
                      }}
                    >
                      {title}
                    </Text>
                    <Badge variant="secondary">{totalCount.toLocaleString()}</Badge>
                  </Flex>
                </Flex>
              )}

              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
                messages={messages}
              />
            </Flex>

            <Input
              size="sm"
              aria-label={searchAriaLabel}
              placeholder={searchPlaceholder}
              value={search}
              onChange={handleSearchChange}
              prefix={
                <Search
                  size={14}
                  style={{ color: SEARCH_ICON_COLOR }}
                />
              }
              style={searchInputStyle({ height: 38 })}
            />

            {filterPills && filterPills.length > 0 && (
              <Box
                style={{
                  overflowX: 'auto',
                  paddingBottom: 2,
                  marginInline: -2,
                }}
              >
                <Flex align="center" gap={8} style={{ width: 'max-content', minWidth: '100%' }}>
                  {filterPills.map((pill) => (
                    <FilterPillsRow
                      key={pill.key}
                      pill={pill}
                      onFilterChange={onFilterChange}
                    />
                  ))}
                </Flex>
              </Box>
            )}

            <Flex align="center" gap={8}>
              <Popover
                trigger="click"
                placement="bottomRight"
                open={settingsOpen}
                onOpenChange={setSettingsOpen}
                arrow={false}
                content={
                  <SettingsDropdownContent
                    columnSettingsContent={columnSettingsContent}
                    savedViewsContent={savedViewsContent}
                    density={density}
                    onDensityChange={onDensityChange}
                    messages={messages}
                  />
                }
              >
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={messages.settings}
                  aria-expanded={settingsOpen}
                  aria-haspopup="dialog"
                  icon={<Settings2 size={15} />}
                  style={{
                    minWidth: 36,
                    height: 36,
                    paddingInline: 10,
                    flexShrink: 0,
                  }}
                />
              </Popover>

              {onExport && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onExport}
                  aria-label={messages.export}
                  icon={<Download size={15} />}
                  style={{
                    minWidth: 36,
                    height: 36,
                    paddingInline: 10,
                    flexShrink: 0,
                  }}
                />
              )}

              {primaryAction && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={primaryAction.onClick}
                  icon={primaryAction.icon ?? <Plus size={15} />}
                  style={{ flex: 1, justifyContent: 'center', minHeight: 36 }}
                >
                  {primaryAction.label}
                </Button>
              )}
            </Flex>
          </Stack>

          {activeFilterChips.length > 0 && (
            <Flex
              align="center"
              gap={6}
              wrap="wrap"
              style={{
                padding: '0 14px 12px',
                borderTop: `1px solid ${TOOLBAR_BORDER_BOTTOM}`,
                background: FILTER_PILL_FRAME_BG,
              }}
            >
              <Filter
                size={12}
                style={{ color: FILTER_PILL_ACTIVE_COLOR, flexShrink: 0 }}
              />
              {activeFilterChips.map((chip) => (
                <Tag
                  key={chip.key}
                  closable
                  onClose={() => onFilterChange?.(chip.key, '')}
                  size="sm"
                  style={{
                    fontSize: 11,
                    transition: `opacity ${TRANSITION_FAST}`,
                  }}
                >
                  {chip.label}: {chip.value}
                </Tag>
              ))}
              {activeFilterCount > 0 && onClearFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  style={{
                    fontSize: 11,
                    height: 24,
                    padding: '0 8px',
                    color: FILTER_PILL_COLOR,
                  }}
                >
                  {messages.clearAll}
                </Button>
              )}
            </Flex>
          )}
        </>
      ) : (
        <>
      {/* ------------------------------------------------------------------ */}
      {/* ROW 1: Title + Count  (spacer)  Filter Pills  |  View Toggle      */}
      {/* ------------------------------------------------------------------ */}
      <Flex
        align="center"
        style={{
          padding: TOOLBAR_PADDING,
          borderBottom: `1px solid ${TOOLBAR_BORDER_BOTTOM}`,
          flexWrap: 'wrap',
          minWidth: 0,
          gap: TOOLBAR_GAP,
        }}
      >
        {/* Left: Title + count */}
        {showTitleSection && (
          <Flex align="center" gap={10} style={{ flexShrink: 0 }}>
            {icon && (
              <Box
                style={{
                  color: TOOLBAR_CONTROL_COLOR,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {icon}
              </Box>
            )}
            <Text
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: TOOLBAR_COLOR,
              }}
            >
              {title}
            </Text>
            <Badge variant="secondary">{totalCount.toLocaleString()}</Badge>
          </Flex>
        )}

        {/* Spacer: pushes filter pills + view toggle to the right */}
        <Box style={{ flex: 1 }} />

        {/* Filter pills */}
        {filterPills && filterPills.length > 0 && (
          <Flex align="center" gap={4} style={{ flexShrink: 0 }}>
            <Box
              style={{
                width: 1,
                height: 16,
                background: TOOLBAR_DIVIDER,
                flexShrink: 0,
                marginInlineEnd: TOOLBAR_DIVIDER_SPACING,
              }}
            />
            {filterPills.map((pill) => (
              <FilterPillsRow
                key={pill.key}
                pill={pill}
                onFilterChange={onFilterChange}
              />
            ))}
            <Box
              style={{
                width: 1,
                height: 16,
                background: TOOLBAR_DIVIDER,
                flexShrink: 0,
                marginInlineStart: TOOLBAR_DIVIDER_SPACING,
              }}
            />
          </Flex>
        )}

        {/* Right: View mode toggle */}
        <ViewModeToggle
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          messages={messages}
        />
      </Flex>

      {/* ------------------------------------------------------------------ */}
      {/* ROW 2: Search | Settings | Export | Primary Action                 */}
      {/* ------------------------------------------------------------------ */}
      <Flex
        align="center"
        style={{
          padding: TOOLBAR_PADDING,
          flexWrap: 'wrap',
          minWidth: 0,
          gap: TOOLBAR_GAP,
        }}
      >
        <Flex align="center" gap={10} style={{ width: '100%', minWidth: 0 }}>
          {/* Search */}
          <Box style={{ flex: 1, maxWidth: 480, minWidth: 0 }}>
            <Input
              size="sm"
              aria-label={searchAriaLabel}
              placeholder={searchPlaceholder}
              value={search}
              onChange={handleSearchChange}
              prefix={
                <Search
                  size={14}
                  style={{ color: SEARCH_ICON_COLOR }}
                />
              }
              style={searchInputStyle({ height: 36 })}
            />
          </Box>

          <Box style={{ flex: 1 }} />

          {/* Settings gear */}
          <Popover
            trigger="click"
            placement="bottomRight"
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            arrow={false}
            content={
              <SettingsDropdownContent
                columnSettingsContent={columnSettingsContent}
                savedViewsContent={savedViewsContent}
                density={density}
                onDensityChange={onDensityChange}
                messages={messages}
              />
            }
          >
            <Button
              variant="ghost"
              size="sm"
              aria-label={messages.settings}
              aria-expanded={settingsOpen}
              aria-haspopup="dialog"
              style={{
                minWidth: 32,
                height: 32,
                padding: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Settings2 size={15} />
            </Button>
          </Popover>

          {/* Export */}
          {onExport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExport}
              aria-label={messages.export}
              style={{
                minWidth: 32,
                height: 32,
                padding: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Download size={15} />
            </Button>
          )}

          {/* Primary action */}
          {primaryAction && (
            <Button
              variant="primary"
              size="sm"
              onClick={primaryAction.onClick}
              icon={primaryAction.icon ?? <Plus size={15} />}
            >
              {primaryAction.label}
            </Button>
          )}
        </Flex>
      </Flex>

      {/* ------------------------------------------------------------------ */}
      {/* ACTIVE FILTER CHIPS                                                */}
      {/* ------------------------------------------------------------------ */}
      {activeFilterChips.length > 0 && (
        <Flex
          align="center"
          gap={6}
          style={{
            padding: '6px 16px 10px',
            borderTop: `1px solid ${TOOLBAR_BORDER_BOTTOM}`,
            background: FILTER_PILL_FRAME_BG,
          }}
        >
          <Filter
            size={12}
            style={{ color: FILTER_PILL_ACTIVE_COLOR, flexShrink: 0 }}
          />
          {activeFilterChips.map((chip) => (
            <Tag
              key={chip.key}
              closable
              onClose={() => onFilterChange?.(chip.key, '')}
              size="sm"
              style={{
                fontSize: 11,
                transition: `opacity ${TRANSITION_FAST}`,
              }}
            >
              {chip.label}: {chip.value}
            </Tag>
          ))}
          {activeFilterCount > 0 && onClearFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              style={{
                fontSize: 11,
                height: 22,
                padding: '0 6px',
                color: FILTER_PILL_COLOR,
              }}
            >
              {messages.clearAll}
            </Button>
          )}
        </Flex>
      )}
        </>
      )}
    </Box>
  );
}
