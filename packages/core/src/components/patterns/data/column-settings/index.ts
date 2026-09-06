'use client';

/**
 * @fileoverview ColumnSettingsDropdown pattern -- engine-aware panel for
 * managing table column visibility, ordering, and pinning.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { ColumnSettingsProps } from './contracts';

export type { ColumnSettingsProps, ColumnSettingItem } from './contracts';

export const PatternColumnSettings = createEngineComponent<ColumnSettingsProps>(
  'PatternColumnSettings',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    // Rustic is frozen and ships no implementation for this pattern; the
    // declared absence refuses by name at resolution, with no module loaded.
    rustic: null,
  }
);

/** Convenience alias without the Pattern prefix. */
export const ColumnSettingsDropdown = PatternColumnSettings;
