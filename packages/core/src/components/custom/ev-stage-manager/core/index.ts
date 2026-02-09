/**
 * EvStageManager - Core Interface
 * Stage configuration manager
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvStageManagerPreset = 'visual' | 'table';

export interface StageConfig {
  id: string;
  name: string;
  zoneName: string;
  capacity: number;
  dimensions?: string;
  technicalSpecs?: string;
  isActive: boolean;
  currentAct?: string;
  nextAct?: string;
}

export interface StageSchedule {
  stageId: string;
  slots: Array<{ time: string;
  artistName: string;
  duration: number }>;
}

export interface EvStageManagerProps extends EngineAwareProps {
  preset?: EvStageManagerPreset;
  stages?: StageConfig[];
  schedules?: StageSchedule[];
  onStageClick?: (stageId: string) => void;
  onEditStage?: (stageId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_STAGE_MANAGER_DEFAULTS: Partial<EvStageManagerProps> = {
  preset: 'visual',

};
