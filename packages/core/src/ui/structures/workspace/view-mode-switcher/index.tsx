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

import {
  CalendarIcon as Calendar,
  Columns3Icon as Columns3,
  Grid3x3Icon as Grid3x3,
  ImageIcon as GalleryIcon,
  LayoutGridIcon as LayoutGrid,
  ListIcon as List,
} from '../../../../graphics/icons';
import type { ReactNode } from 'react';

import { Box, Flex } from '../../../primitives';
import type { CollectionViewMode } from '@/foundation/contracts/runtime/components/patterns/data';

// ---------------------------------------------------------------------------
// Default icon mapping (convenience export)
// ---------------------------------------------------------------------------

/** Default icon mapping for standard collection view modes. */
export const defaultViewModeIcons: Record<CollectionViewMode, ReactNode> = {
  table: <List size={16} />,
  cards: <LayoutGrid size={16} />,
  grid: <Grid3x3 size={16} />,
  kanban: <Columns3 size={16} />,
  gallery: <GalleryIcon size={16} />,
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
      data-part="root"
      className={`ds-structure ds-view-mode-switcher ${className ?? ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
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
            data-part="button"
            className="ds-view-mode-switcher__button"
            data-selected={isActive}
            data-disabled={isDisabled}
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
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              transition:
                'background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
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
