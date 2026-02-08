/**
 * BhPanelCoordinator - Main Export
 * Multi-round panel view + score aggregation
 */

import type { BhPanelCoordinatorProps } from './core';
import { BH_PANEL_COORDINATOR_DEFAULTS } from './core';
import { BH_PANEL_COORDINATOR_PRESETS } from './presets';

export { type BhPanelCoordinatorProps, type BhPanelCoordinatorPreset, type PanelMember, type InterviewStage, type PanelConsensus, type AggregationStrategy, type Recommendation, type StageStatus, BH_PANEL_COORDINATOR_DEFAULTS } from './core';
export * from './presets';

export function BhPanelCoordinator(props: BhPanelCoordinatorProps): React.ReactElement {
  const preset = props.preset ?? BH_PANEL_COORDINATOR_DEFAULTS.preset ?? 'timeline';
  const PresetComponent = BH_PANEL_COORDINATOR_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhPanelCoordinator.displayName = 'BhPanelCoordinator';

export { TimelineBhPanelCoordinator, SummaryBhPanelCoordinator } from './presets';
