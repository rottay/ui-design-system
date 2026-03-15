/**
 * BhPipelineStageDrawer - All Presets
 */

import type { BhPipelineStageDrawerPreset, BhPipelineStageDrawerProps } from '../core';
import type { ComponentType } from 'react';
import { DrawerBhPipelineStageDrawer } from './drawer';
import { ModalBhPipelineStageDrawer } from './modal';

export { DrawerBhPipelineStageDrawer } from './drawer';
export { ModalBhPipelineStageDrawer } from './modal';

export const BH_PIPELINE_STAGE_DRAWER_PRESETS: Record<BhPipelineStageDrawerPreset, ComponentType<BhPipelineStageDrawerProps>> = {
  'drawer': DrawerBhPipelineStageDrawer,
  'modal': ModalBhPipelineStageDrawer,
};
