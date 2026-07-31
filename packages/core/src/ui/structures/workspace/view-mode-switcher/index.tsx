'use client';

/**
 * @fileoverview ViewModeSwitcher -- structures-tier segmented control for
 * toggling between collection render modes.
 *
 * @description
 * COMPOSITION LAW (S25): the switcher IS the certified Segmented primitive
 * (the same lossless composition scope-switcher S22 landed — there is no
 * per-option paint channel to preserve here). The retired hand-rolled
 * icon-buttons took with them a real APG gap: their arrow handler activated
 * without moving focus and never mirrored under RTL; the primitive owns
 * role=radiogroup/radio, aria-checked, the roving tab stop WITH focus
 * movement and the RTL-aware arrow contract. Every mode carries a governed
 * semantic icon role (never a raw barrel icon) plus an accessible name —
 * disabled modes keep the reason discoverable through a parametric
 * accessible name (a tooltip cannot wrap a radio inside the radiogroup
 * anatomy; the retired `title` attribute never fired reliably on disabled
 * elements anyway).
 *
 * The default icon/label maps are exported as a convenience for surfaces;
 * the defaults ARE the English floor — localization flows through the
 * `modes` prop (consumer-supplied labels), never through hardcoded chrome.
 */

import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { Box } from '../../../primitives';
import ModernSegmented from '../../../primitives/navigation/Segmented/engines/modern';
import { DataTableIcon } from '@/graphics/icons/presentation/semantic/generated/roles/data-table';
import { LayoutCardsIcon } from '@/graphics/icons/presentation/semantic/generated/roles/layout-cards';
import { LayoutGridIcon } from '@/graphics/icons/presentation/semantic/generated/roles/layout-grid';
import { LayoutColumnsIcon } from '@/graphics/icons/presentation/semantic/generated/roles/layout-columns';
import { ContentImageIcon } from '@/graphics/icons/presentation/semantic/generated/roles/content-image';
import { TimeDateIcon } from '@/graphics/icons/presentation/semantic/generated/roles/time-date';
import type { ReactNode } from 'react';

import type { CollectionViewMode } from '@/foundation/contracts/runtime/components/patterns/data';

// ---------------------------------------------------------------------------
// Default icon mapping (convenience export — governed semantic roles)
// ---------------------------------------------------------------------------

/** Default icon mapping for standard collection view modes. */
export const defaultViewModeIcons: Record<CollectionViewMode, ReactNode> = {
  table: <DataTableIcon decorative size={16} />,
  cards: <LayoutCardsIcon decorative size={16} />,
  grid: <LayoutGridIcon decorative size={16} />,
  kanban: <LayoutColumnsIcon decorative size={16} />,
  gallery: <ContentImageIcon decorative size={16} />,
  calendar: <TimeDateIcon decorative size={16} />,
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
  /** Reason shown to assistive technology when the mode is disabled. */
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
  const i18n = useOptionalTranslation('components');
  /**
   * Catalog lookup with an honest English floor (parametric): a missing
   * entry never echoes a raw key and fragments are never concatenated.
   */
  const tOr = (key: string, floor: string, params?: Record<string, string | number>): string =>
    i18n?.tOr(key, floor, params) ?? floor;

  if (!modes.length) return null;

  return (
    <Box
      data-part="root"
      data-structure="view-mode-switcher"
      className={`ds-structure ds-view-mode-switcher ${className ?? ''}`}
    >
      {/* Composed Segmented (P81): radiogroup semantics, roving keyboard
          with focus movement, RTL-aware arrows and option chrome all belong
          to the primitive. Each option shows the governed mode icon plus
          the mode label; a disabled option's accessible name carries its
          reason as ONE parametric message. */}
      <ModernSegmented
        data-part="switcher"
        options={modes.map((mode) => ({
          value: mode.key,
          label: mode.label,
          icon: mode.icon,
          disabled: mode.disabled,
          ariaLabel:
            mode.disabled && mode.disabledReason
              ? tOr('viewModeSwitcher.disabledWithReason', '{label} (unavailable: {reason})', {
                  label: mode.label,
                  reason: mode.disabledReason,
                })
              : mode.label,
        }))}
        value={value}
        onChange={(next) => onChange(next as CollectionViewMode)}
        size={size === 'sm' ? 'small' : 'middle'}
        ariaLabel={tOr('viewModeSwitcher.groupLabel', 'View mode')}
      />
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
