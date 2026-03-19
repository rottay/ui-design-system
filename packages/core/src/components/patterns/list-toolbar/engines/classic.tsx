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
 * Tabs, Tag, Tooltip) so the implementation is identical across all engines.
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
} from '../../../primitives';
import {
  Search,
  List,
  LayoutGrid,
  Download,
  Plus,
  Settings2,
  Filter,
  AlignJustify,
  AlignCenter,
  AlignLeft,
} from 'lucide-react';

import type { ListToolbarProps, FilterPillConfig, DensityKey } from '../ListToolbar.types';
import { useBreakpoints } from '../../../../hooks/responsive/useBreakpoints';

// ============================================================================
// CONSTANTS
// ============================================================================

const TRANSITION_FAST = '150ms ease';

const DENSITY_OPTIONS: {
  key: DensityKey;
  icon: React.ReactNode;
  label: string;
  description: string;
}[] = [
  {
    key: 'compact',
    icon: <AlignJustify size={14} />,
    label: 'Compact',
    description: 'Tighter row spacing',
  },
  {
    key: 'comfortable',
    icon: <AlignCenter size={14} />,
    label: 'Comfortable',
    description: 'Default spacing',
  },
  {
    key: 'spacious',
    icon: <AlignLeft size={14} />,
    label: 'Spacious',
    description: 'More breathing room',
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
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 14px',
        borderRadius: 20,
        border: isActive
          ? '1.5px solid var(--ds-color-text-primary)'
          : '1.5px solid transparent',
        background: 'transparent',
        color: isActive
          ? 'var(--ds-color-text-primary)'
          : 'var(--ds-color-text-secondary)',
        fontSize: 13,
        fontWeight: isActive ? 500 : 400,
        cursor: 'pointer',
        transition: `color ${TRANSITION_FAST}, border-color ${TRANSITION_FAST}`,
        whiteSpace: 'nowrap' as const,
      }}
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
}: {
  viewMode: 'list' | 'cards';
  onViewModeChange: (mode: 'list' | 'cards') => void;
}) {
  const modes: { key: 'list' | 'cards'; label: string; icon: React.ReactNode }[] = [
    { key: 'list', label: 'List', icon: <List size={14} /> },
    { key: 'cards', label: 'Cards', icon: <LayoutGrid size={14} /> },
  ];

  return (
    <Box
      style={{
        display: 'inline-flex',
        border: '1px solid color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent)',
        borderRadius: 6,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {modes.map((mode) => {
        const isActive = viewMode === mode.key;
        return (
          <Box
            key={mode.key}
            as="button"
            onClick={() => onViewModeChange(mode.key)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              border: 'none',
              background: isActive
                ? 'var(--ds-color-bg-secondary)'
                : 'transparent',
              borderRight:
                mode.key === 'list' ? '1px solid color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent)' : 'none',
              color: isActive
                ? 'var(--ds-color-text-primary)'
                : 'var(--ds-color-text-secondary)',
              fontWeight: isActive ? 500 : 400,
              fontSize: 12,
              cursor: 'pointer',
              transition: `background ${TRANSITION_FAST}, color ${TRANSITION_FAST}`,
            }}
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
}: {
  density: DensityKey;
  onDensityChange: (d: DensityKey) => void;
}) {
  return (
    <Flex direction="column" gap={4}>
      {DENSITY_OPTIONS.map((opt) => {
        const isActive = density === opt.key;
        return (
          <Box
            key={opt.key}
            as="button"
            onClick={() => onDensityChange(opt.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              borderRadius: 6,
              border: isActive
                ? '1px solid var(--ds-color-primary)'
                : '1px solid color-mix(in srgb, var(--ds-color-text-primary) 6%, transparent)',
              background: isActive
                ? 'var(--ds-color-bg-secondary)'
                : 'transparent',
              cursor: 'pointer',
              transition: `background ${TRANSITION_FAST}, border-color ${TRANSITION_FAST}`,
              width: '100%',
              textAlign: 'left' as const,
            }}
          >
            <Box
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: isActive
                  ? '5px solid var(--ds-color-primary)'
                  : '2px solid var(--ds-color-border)',
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
                  ? 'var(--ds-color-text-primary)'
                  : 'var(--ds-color-text-secondary)',
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
                  {opt.label}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: 'var(--ds-color-text-muted)',
                    lineHeight: 1.2,
                  }}
                >
                  {opt.description}
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
}: {
  columnSettingsContent?: React.ReactNode;
  savedViewsContent?: React.ReactNode;
  density: DensityKey;
  onDensityChange: (d: DensityKey) => void;
}) {
  return (
    <Box style={{ width: 320 }}>
      <Tabs
        defaultActiveKey="columns"
        size="sm"
        items={[
          {
            key: 'columns',
            label: 'Columns',
            children: columnSettingsContent ?? (
              <Text
                style={{
                  fontSize: 13,
                  color: 'var(--ds-color-text-muted)',
                  padding: '12px 0',
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
              <DensitySection
                density={density}
                onDensityChange={onDensityChange}
              />
            ),
          },
          {
            key: 'views',
            label: 'Views',
            children: savedViewsContent ?? (
              <Text
                style={{
                  fontSize: 13,
                  color: 'var(--ds-color-text-muted)',
                  padding: '12px 0',
                }}
              >
                No saved views available.
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

  return (
    <Box
      className={className}
      style={{
        background: 'var(--ds-color-bg-primary)',
        border: '1px solid color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent)',
        borderRadius: 8,
        overflow: 'hidden',
        ...style,
      }}
    >
      {isMobile ? (
        <>
          <Stack spacing="md" style={{ padding: '14px 14px 12px' }}>
            <Flex align="center" justify="between" gap={12}>
              <Flex align="center" gap={10} style={{ minWidth: 0 }}>
                {icon && (
                  <Box
                    style={{
                      color: 'var(--ds-color-text-secondary)',
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
                      color: 'var(--ds-color-text-primary)',
                      lineHeight: 1.2,
                    }}
                  >
                    {title}
                  </Text>
                  <Badge variant="secondary">{totalCount.toLocaleString()}</Badge>
                </Flex>
              </Flex>

              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
              />
            </Flex>

            <Input
              size="sm"
              placeholder={searchPlaceholder}
              value={search}
              onChange={handleSearchChange}
              prefix={
                <Search
                  size={14}
                  style={{ color: 'var(--ds-color-text-muted)' }}
                />
              }
              style={{ height: 38 }}
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
                  />
                }
              >
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Settings"
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
                  aria-label="Export"
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
                borderTop: '1px solid color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent)',
              }}
            >
              <Filter
                size={12}
                style={{ color: 'var(--ds-color-text-muted)', flexShrink: 0 }}
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
                    color: 'var(--ds-color-text-muted)',
                  }}
                >
                  Clear All
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
          padding: '10px 16px',
          borderBottom: '1px solid color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent)',
          flexWrap: 'wrap',
          minWidth: 0,
          gap: 10,
        }}
      >
        {/* Left: Title + count */}
        <Flex align="center" gap={10} style={{ flexShrink: 0 }}>
          {icon && (
            <Box
              style={{
                color: 'var(--ds-color-text-secondary)',
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
              color: 'var(--ds-color-text-primary)',
            }}
          >
            {title}
          </Text>
          <Badge variant="secondary">{totalCount.toLocaleString()}</Badge>
        </Flex>

        {/* Spacer: pushes filter pills + view toggle to the right */}
        <Box style={{ flex: 1 }} />

        {/* Filter pills */}
        {filterPills && filterPills.length > 0 && (
          <Flex align="center" gap={4} style={{ flexShrink: 0 }}>
            <Box
              style={{
                width: 1,
                height: 16,
                background: 'color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent)',
                flexShrink: 0,
                marginRight: 4,
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
                background: 'color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent)',
                flexShrink: 0,
                marginLeft: 4,
              }}
            />
          </Flex>
        )}

        {/* Right: View mode toggle */}
        <ViewModeToggle
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
      </Flex>

      {/* ------------------------------------------------------------------ */}
      {/* ROW 2: Search | Settings | Export | Primary Action                 */}
      {/* ------------------------------------------------------------------ */}
      <Flex
        align="center"
        style={{
          padding: '10px 16px',
          flexWrap: 'wrap',
          minWidth: 0,
          gap: 10,
        }}
      >
        <Flex align="center" gap={10} style={{ width: '100%', minWidth: 0 }}>
          {/* Search */}
          <Box style={{ flex: 1, maxWidth: 480, minWidth: 0 }}>
            <Input
              size="sm"
              placeholder={searchPlaceholder}
              value={search}
              onChange={handleSearchChange}
              prefix={
                <Search
                  size={14}
                  style={{ color: 'var(--ds-color-text-muted)' }}
                />
              }
              style={{ height: 36 }}
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
              />
            }
          >
            <Button
              variant="ghost"
              size="sm"
              aria-label="Settings"
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
              aria-label="Export"
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
            borderTop: '1px solid color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent)',
          }}
        >
          <Filter
            size={12}
            style={{ color: 'var(--ds-color-text-muted)', flexShrink: 0 }}
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
                color: 'var(--ds-color-text-muted)',
              }}
            >
              Clear All
            </Button>
          )}
        </Flex>
      )}
        </>
      )}
    </Box>
  );
}
