/**
 * BhPipelineStageDrawer - Main Export
 * Drawer/panel with stage detail, conversion trend, bulk actions
 */

import type { BhPipelineStageDrawerProps } from './core';
import { BH_PIPELINE_STAGE_DRAWER_DEFAULTS } from './core';
import { BH_PIPELINE_STAGE_DRAWER_PRESETS } from './presets';

export {
  type BhPipelineStageDrawerProps,
  type BhPipelineStageDrawerPreset,
  type StageDetail,
  type StageCandidate,
  type CandidateStatus,
  type BulkActionType,
  BH_PIPELINE_STAGE_DRAWER_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhPipelineStageDrawer component
 * Renders the appropriate preset based on the preset prop
 */
export function BhPipelineStageDrawer(props: BhPipelineStageDrawerProps): React.ReactElement {
  const preset = props.preset ?? BH_PIPELINE_STAGE_DRAWER_DEFAULTS.preset ?? 'drawer';
  const PresetComponent = BH_PIPELINE_STAGE_DRAWER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhPipelineStageDrawer.displayName = 'BhPipelineStageDrawer';

export { DrawerBhPipelineStageDrawer, ModalBhPipelineStageDrawer } from './presets';
