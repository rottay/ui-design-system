/**
 * BhAuditTrail - All Presets
 */

import type { BhAuditTrailPreset } from '../core';
import { TimelineBhAuditTrail } from './timeline';
import { TableBhAuditTrail } from './table';

export { TimelineBhAuditTrail } from './timeline';
export { TableBhAuditTrail } from './table';

export const BH_AUDIT_TRAIL_PRESETS: Record<BhAuditTrailPreset, React.ComponentType<any>> = {
  timeline: TimelineBhAuditTrail,
  table: TableBhAuditTrail,
};
