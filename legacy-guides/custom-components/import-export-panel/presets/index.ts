import type { ImportExportPanelPreset, ImportExportPanelProps } from '../core';
import type { ComponentType } from 'react';
import { Standard } from './standard';
import { Compact } from './compact';

export const PRESETS: Record<ImportExportPanelPreset, ComponentType<ImportExportPanelProps>> = {
  'standard': Standard,
  'compact': Compact,
};
