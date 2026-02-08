/**
 * BhPanelCoordinator - All Presets
 */

import type { BhPanelCoordinatorPreset } from '../core';
import { TimelineBhPanelCoordinator } from './timeline';
import { SummaryBhPanelCoordinator } from './summary';

export { TimelineBhPanelCoordinator } from './timeline';
export { SummaryBhPanelCoordinator } from './summary';

export const BH_PANEL_COORDINATOR_PRESETS: Record<BhPanelCoordinatorPreset, React.ComponentType<any>> = {
  timeline: TimelineBhPanelCoordinator,
  summary: SummaryBhPanelCoordinator,
};
