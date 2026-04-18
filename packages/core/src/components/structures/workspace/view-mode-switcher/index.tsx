'use client';

/**
 * @fileoverview ViewModeSwitcher -- structures-tier segmented control for
 * toggling between collection render modes.
 *
 * @description
 * Renders a horizontal icon-button group where each button maps to one
 * enabled CollectionViewMode. The active mode gets a highlighted background.
 * Uses DS CSS variables for all colors, radii, and spacing.
 *
 * The component itself does NOT hardcode icons -- the consuming surface or
 * app provides them via the `modes` array. A static `defaultIcons` mapping
 * is exported as a convenience for surfaces that want sensible defaults.
 */

import { List, LayoutGrid, Grid3x3, Columns3, GalleryHorizontalEnd, Calendar } from 'lucide-react';
import type { ReactNode } from 'react';

import { Box, Flex } from '../../../primitives';
import type { CollectionViewMode } from '../../../surfaces/foundation/contracts/collection';

// ---------------------------------------------------------------------------
// Default icon mapping (convenience export)
// ---------------------------------------------------------------------------

/** Default icon mapping for standard collection view modes. */
export const defaultViewModeIcons: Record<CollectionViewMode, ReactNode> = {
  table: <List size={16} />,
  cards: <LayoutGrid size={16} />,
  grid: <Grid3x3 size={16} />,
  kanban: <Columns3 size={16} />,
  gallery: <GalleryHorizontalEnd size={16} />,
  calendar: <Calendar size={16} />,
};

/** Default accessible labels for standard collection view modes. */
export const defaultViewModeLabels: Record<CollectionViewMode, string> = {
  table: 'Table view',
  cards: 'Cards view',
  grid: 'Grid view',
  kanban: 'Kanban view',
  gallery: 'Gallery view',
  calendar: 'Calendar view',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ViewModeSwitcherMode {
  /** Mode key matching CollectionViewMode. */
  key: CollectionViewMode;
  /** Icon rendered in the toggle button. */
  icon: ReactNode;
  /** Accessible label for screen readers and tooltip. */
  label: string;
  /** Disable this mode (e.g. no calendar field configured). */
  disabled?: boolean;
  /** Tooltip text when disabled. */
  disabledReason?: string;
}

export interface ViewModeSwitcherProps {
  /** Available modes to display. Order determines button order. */
  modes: ViewModeSwitcherMode[];
  /** Currently active mode. */
  value: CollectionViewMode;
  /** Called when user clicks a mode toggle. */
  onChange: (mode: CollectionViewMode) => void;
  /** Size variant. */
  size?: 'sm' | 'md';
  /** Optional class name. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ViewModeSwitcher({
  modes,
  value,
  onChange,
  size = 'sm',
  className,
}: ViewModeSwitcherProps) {
  if (!modes.length) return null;

  const isSm = size === 'sm';
  const btnSize = isSm ? 28 : 32;
  const iconPad = isSm ? 6 : 8;

  return (
    <Box
      role="radiogroup"
      aria-label="View mode"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 8,
        border: '1px solid var(--ds-color-border-secondary)',
        background: 'var(--ds-color-bg-primary)',
        padding: 2,
        gap: 2,
      }}
    >
      {modes.map((mode) => {
        const isActive = mode.key === value;
        const isDisabled = !!mode.disabled;

        return (
          <Box
            key={mode.key}
            as="button"
            role="radio"
            aria-checked={isActive}
            aria-label={mode.label}
            title={isDisabled ? mode.disabledReason : mode.label}
            aria-disabled={isDisabled || undefined}
            onClick={() => {
              if (!isDisabled && mode.key !== value) {
                onChange(mode.key);
              }
            }}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (isDisabled) return;

              const enabledModes = modes.filter((m) => !m.disabled);
              const currentIdx = enabledModes.findIndex((m) => m.key === value);
              if (currentIdx === -1) return;

              let nextIdx = -1;
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                nextIdx = (currentIdx + 1) % enabledModes.length;
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                nextIdx = (currentIdx - 1 + enabledModes.length) % enabledModes.length;
              }

              if (nextIdx >= 0) {
                onChange(enabledModes[nextIdx].key);
              }
            }}
            tabIndex={isActive ? 0 : -1}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: btnSize,
              height: btnSize,
              padding: iconPad,
              borderRadius: 6,
              border: 'none',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              outline: 'none',
              transition:
                'background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
              background: isActive
                ? 'color-mix(in srgb, var(--ds-color-primary) 14%, var(--ds-surface-card))'
                : 'transparent',
              color: isDisabled
                ? 'var(--ds-color-text-disabled)'
                : isActive
                  ? 'var(--ds-color-primary)'
                  : 'var(--ds-color-text-muted)',
              boxShadow: isActive
                ? '0 1px 3px color-mix(in srgb, var(--ds-color-primary) 12%, transparent)'
                : 'none',
              opacity: isDisabled ? 0.5 : 1,
            }}
          >
            <Flex
              align="center"
              justify="center"
              style={{ width: 16, height: 16, flexShrink: 0 }}
            >
              {mode.icon}
            </Flex>
          </Box>
        );
      })}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Convenience builder
// ---------------------------------------------------------------------------

/**
 * Builds a ViewModeSwitcherMode[] array from a simple list of
 * CollectionViewMode keys, using the default icons and labels.
 *
 * @example
 * const modes = buildViewModes(['table', 'cards', 'kanban']);
 * <ViewModeSwitcher modes={modes} value={current} onChange={set} />
 */
export function buildViewModes(
  keys: CollectionViewMode[],
  overrides?: Partial<Record<CollectionViewMode, Partial<ViewModeSwitcherMode>>>,
): ViewModeSwitcherMode[] {
  return keys.map((key) => ({
    key,
    icon: defaultViewModeIcons[key],
    label: defaultViewModeLabels[key],
    ...overrides?.[key],
  }));
}
