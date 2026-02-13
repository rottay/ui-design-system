/**
 * BhPipelineStageDrawer - All Presets
 */

import type { BhPipelineStageDrawerPreset } from '../core';
import { DrawerBhPipelineStageDrawer } from './drawer';
import { ModalBhPipelineStageDrawer } from './modal';

export { DrawerBhPipelineStageDrawer } from './drawer';
export { ModalBhPipelineStageDrawer } from './modal';

export const BH_PIPELINE_STAGE_DRAWER_PRESETS: Record<BhPipelineStageDrawerPreset, React.ComponentType<any>> = {
  'drawer': DrawerBhPipelineStageDrawer,
  'modal': ModalBhPipelineStageDrawer,
};
