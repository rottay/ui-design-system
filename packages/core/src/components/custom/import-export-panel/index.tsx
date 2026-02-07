import type { ImportExportPanelProps } from './core';
import { IMPORT_EXPORT_PANEL_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { ImportExportPanelProps, ImportExportPanelPreset, ColumnMapping } from './core';
export { IMPORT_EXPORT_PANEL_DEFAULTS } from './core';

export function ImportExportPanel(props: ImportExportPanelProps): React.ReactElement {
  const preset = props.preset ?? IMPORT_EXPORT_PANEL_DEFAULTS.preset ?? 'standard';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

ImportExportPanel.displayName = 'ImportExportPanel';
