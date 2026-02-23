/**
 * BhPanelCoordinator - All Presets
 */

import type { BhPanelCoordinatorPreset, BhPanelCoordinatorProps } from '../core';
import type { ComponentType } from 'react';
import { TimelineBhPanelCoordinator } from './timeline';
import { SummaryBhPanelCoordinator } from './summary';

export { TimelineBhPanelCoordinator } from './timeline';
export { SummaryBhPanelCoordinator } from './summary';

export const BH_PANEL_COORDINATOR_PRESETS: Record<BhPanelCoordinatorPreset, ComponentType<BhPanelCoordinatorProps>> = {
  timeline: TimelineBhPanelCoordinator,
  summary: SummaryBhPanelCoordinator,
};
