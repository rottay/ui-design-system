/**
 * PmTrialManager - All Presets
 */

export { OverviewPmTrialManager } from './overview';
export { TimelinePmTrialManager } from './timeline';

import type { PmTrialManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { PmTrialManagerProps } from '../core';
import { OverviewPmTrialManager } from './overview';
import { TimelinePmTrialManager } from './timeline';

export const PM_TRIAL_MANAGER_PRESETS: Record<PmTrialManagerPreset, ComponentType<PmTrialManagerProps>> = {
  overview: OverviewPmTrialManager,
  timeline: TimelinePmTrialManager,
};
