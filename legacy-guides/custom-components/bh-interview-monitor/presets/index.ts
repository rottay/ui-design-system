/**
 * BhInterviewMonitor - All Presets
 */

import type { BhInterviewMonitorPreset, BhInterviewMonitorProps } from '../core';
import type { ComponentType } from 'react';
import { StandardBhInterviewMonitor } from './standard';

export { StandardBhInterviewMonitor } from './standard';

export const BH_INTERVIEW_MONITOR_PRESETS: Record<BhInterviewMonitorPreset, ComponentType<BhInterviewMonitorProps>> = {
  standard: StandardBhInterviewMonitor,
};
