/**
 * CrmTable - Main Export
 * Automatically selects preset based on props
 */

import type { CrmTableProps } from './core';
import { CRM_TABLE_DEFAULTS } from './core';
import { CRM_TABLE_PRESETS } from './presets';

export { type CrmTableProps, type CrmTablePreset, type CrmColumn, type CrmColumnType, type CompanySizeCategory, type ContextMenuItem, type BreadcrumbItem, CRM_TABLE_DEFAULTS } from './core';
export * from './presets';

/**
 * CrmTable component
 * Renders the appropriate preset based on the preset prop
 */
export function CrmTable(props: CrmTableProps): React.ReactElement {
  const preset = props.preset ?? CRM_TABLE_DEFAULTS.preset ?? 'standard';
  const PresetComponent = CRM_TABLE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

CrmTable.displayName = 'CrmTable';

export { StandardCrmTable, EnrichedCrmTable } from './presets';
