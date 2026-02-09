/**
 * EvFloorPlanEditor - Main Export
 * Drag-and-drop floor plan editor with tables, stages, bars, and occupancy heatmap
 */

import type { EvFloorPlanEditorProps } from './core';
import { EV_FLOOR_PLAN_EDITOR_DEFAULTS } from './core';
import { EV_FLOOR_PLAN_EDITOR_PRESETS } from './presets';

export {
  type EvFloorPlanEditorProps,
  type EvFloorPlanEditorPreset,
  type FloorElement as EvFloorPlanEditorFloorElement,
  type FloorPlan as EvFloorPlanEditorFloorPlan,
  EV_FLOOR_PLAN_EDITOR_DEFAULTS,
} from './core';
export * from './presets';

export function EvFloorPlanEditor(props: EvFloorPlanEditorProps): React.ReactElement {
  const preset = props.preset ?? EV_FLOOR_PLAN_EDITOR_DEFAULTS.preset ?? 'designer';
  const PresetComponent = EV_FLOOR_PLAN_EDITOR_PRESETS[preset];
  return <PresetComponent {...props} />;
}

EvFloorPlanEditor.displayName = 'EvFloorPlanEditor';

export { DesignerEvFloorPlanEditor, ViewerEvFloorPlanEditor } from './presets';
