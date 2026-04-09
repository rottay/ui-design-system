'use client';

/**
 * @fileoverview ColumnSettingsDropdown pattern -- engine-aware panel for
 * managing table column visibility, ordering, and pinning.
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { ColumnSettingsProps } from './ColumnSettings.types';

export type { ColumnSettingsProps, ColumnSettingItem } from './ColumnSettings.types';

export const PatternColumnSettings = createEngineComponent<ColumnSettingsProps>(
  'PatternColumnSettings',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);

/** Convenience alias without the Pattern prefix. */
export const ColumnSettingsDropdown = PatternColumnSettings;
