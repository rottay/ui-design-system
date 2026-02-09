/**
 * EvFloorPlanEditor - All Presets
 */

export { DesignerEvFloorPlanEditor } from './designer';
export { ViewerEvFloorPlanEditor } from './viewer';

import type { EvFloorPlanEditorPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvFloorPlanEditorProps } from '../core';
import { DesignerEvFloorPlanEditor } from './designer';
import { ViewerEvFloorPlanEditor } from './viewer';

export const EV_FLOOR_PLAN_EDITOR_PRESETS: Record<EvFloorPlanEditorPreset, ComponentType<EvFloorPlanEditorProps>> = {
  designer: DesignerEvFloorPlanEditor,
  viewer: ViewerEvFloorPlanEditor,
};
