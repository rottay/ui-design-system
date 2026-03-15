/**
 * BhAuditTrail - All Presets
 */

import type { BhAuditTrailPreset, BhAuditTrailProps } from '../core';
import type { ComponentType } from 'react';
import { TimelineBhAuditTrail } from './timeline';
import { TableBhAuditTrail } from './table';

export { TimelineBhAuditTrail } from './timeline';
export { TableBhAuditTrail } from './table';

export const BH_AUDIT_TRAIL_PRESETS: Record<BhAuditTrailPreset, ComponentType<BhAuditTrailProps>> = {
  timeline: TimelineBhAuditTrail,
  table: TableBhAuditTrail,
};
