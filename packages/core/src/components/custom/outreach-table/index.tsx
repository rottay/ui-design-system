/**
 * OutreachTable - Main Export
 * Pin/CRM-style outreach contact list with status badges,
 * sidebar filters with counts, and progress steps.
 */

import type { OutreachTableProps } from './core';
import { OUTREACH_TABLE_DEFAULTS } from './core';
import { OUTREACH_TABLE_PRESETS } from './presets';

export {
  type OutreachTableProps,
  type OutreachTablePreset,
  type Contact,
  type ContactStatus,
  type OutreachFilterItem,
  type OutreachStat,
  OUTREACH_TABLE_DEFAULTS,
} from './core';
export * from './presets';

export function OutreachTable(props: OutreachTableProps): React.ReactElement {
  const preset = props.preset ?? OUTREACH_TABLE_DEFAULTS.preset ?? 'standard';
  const PresetComponent = OUTREACH_TABLE_PRESETS[preset];
  return <PresetComponent {...props} />;
}

OutreachTable.displayName = 'OutreachTable';

export { StandardOutreachTable, PipelineOutreachTable } from './presets';
