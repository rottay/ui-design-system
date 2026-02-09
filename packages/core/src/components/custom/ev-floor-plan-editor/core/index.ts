/**
 * EvFloorPlanEditor - Core Interface
 * Drag-and-drop floor plan editor with tables, stages, bars, and occupancy heatmap
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvFloorPlanEditorPreset = 'designer' | 'viewer';

export interface FloorElement {
  id: string;
  type: 'round-table' | 'rect-table' | 'booth' | 'bar' | 'stage' | 'entrance' | 'restroom' | 'wall';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  label: string;
  capacity?: number;
  zone?: string;
  occupancy?: number;
  revenue?: number;
}

export interface FloorPlan {
  id: string;
  name: string;
  width: number;
  height: number;
  gridSize: number;
  elements: FloorElement[];
}

export interface EvFloorPlanEditorProps extends EngineAwareProps {
  preset?: EvFloorPlanEditorPreset;
  floorPlan?: FloorPlan;
  selectedElementId?: string;
  onElementSelect?: (elementId: string | null) => void;
  onElementMove?: (elementId: string, x: number, y: number) => void;
  onElementAdd?: (element: FloorElement) => void;
  onElementRemove?: (elementId: string) => void;
  onSave?: (plan: FloorPlan) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_FLOOR_PLAN_EDITOR_DEFAULTS: Partial<EvFloorPlanEditorProps> = {
  preset: 'designer',
};
