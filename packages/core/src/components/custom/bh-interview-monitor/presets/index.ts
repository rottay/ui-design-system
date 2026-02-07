/**
 * BhInterviewMonitor - All Presets
 */

import type { BhInterviewMonitorPreset } from '../core';
import { StandardBhInterviewMonitor } from './standard';

export { StandardBhInterviewMonitor } from './standard';

export const BH_INTERVIEW_MONITOR_PRESETS: Record<BhInterviewMonitorPreset, React.ComponentType<any>> = {
  standard: StandardBhInterviewMonitor,
};
