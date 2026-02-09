/**
 * EvAuditTrail - All Presets
 */

export { TableEvAuditTrail } from './table';
export { TimelineEvAuditTrail } from './timeline';

import type { EvAuditTrailPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvAuditTrailProps } from '../core';
import { TableEvAuditTrail } from './table';
import { TimelineEvAuditTrail } from './timeline';

export const EV_AUDIT_TRAIL_PRESETS: Record<EvAuditTrailPreset, ComponentType<EvAuditTrailProps>> = {
  table: TableEvAuditTrail,
  timeline: TimelineEvAuditTrail,
};
