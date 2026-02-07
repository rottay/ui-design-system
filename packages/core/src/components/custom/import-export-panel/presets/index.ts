import type { ImportExportPanelPreset } from '../core';
import { Standard } from './standard';
import { Compact } from './compact';

export const PRESETS: Record<ImportExportPanelPreset, React.ComponentType<any>> = {
  'standard': Standard,
  'compact': Compact,
};
