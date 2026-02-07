import type { EngineAwareProps } from '../../../../types';

export type ImportExportPanelPreset = 'standard' | 'compact';

export interface ColumnMapping {
  source: string;
  target: string;
  transform?: string;
}

export interface ImportExportPanelProps extends EngineAwareProps {
  preset?: ImportExportPanelPreset;
  mode: 'import' | 'export';
  columns?: Array<{ key: string; label: string; type?: string }>;
  data?: any[];
  onImport?: (data: any[], mappings?: ColumnMapping[]) => void;
  onExport?: (format: string) => void;
  formats?: string[];
  className?: string;
  style?: React.CSSProperties;
}

export const IMPORT_EXPORT_PANEL_DEFAULTS = {
  preset: 'standard' as ImportExportPanelPreset,
  mode: 'import' as 'import' | 'export',
  formats: ['csv', 'json', 'xlsx'],
};
