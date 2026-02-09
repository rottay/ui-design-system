/**
 * PlSecurityEventLog - All Presets
 */

export { TimelinePlSecurityEventLog } from './timeline';
export { TablePlSecurityEventLog } from './table';

import type { PlSecurityEventLogPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlSecurityEventLogProps } from '../core';
import { TimelinePlSecurityEventLog } from './timeline';
import { TablePlSecurityEventLog } from './table';

export const PL_SECURITY_EVENT_LOG_PRESETS: Record<PlSecurityEventLogPreset, ComponentType<PlSecurityEventLogProps>> = {
  timeline: TimelinePlSecurityEventLog,
  table: TablePlSecurityEventLog,
};
