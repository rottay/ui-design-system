/**
 * BhPipelineBottleneck - Core Interface
 * Stage bottleneck indicator showing where candidates are
 * getting stuck in the pipeline for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhPipelineBottleneckPreset = 'visual' | 'list';

export interface BottleneckStage {
  id: string;
  name: string;
  candidateCount: number;
  avgDaysInStage: number;
  expectedDays: number;
  isBottleneck: boolean;
}

export interface BhPipelineBottleneckProps extends EngineAwareProps {
  preset?: BhPipelineBottleneckPreset;

  /** Pipeline stages with bottleneck data */
  stages?: BottleneckStage[];

  /** Total candidates across all stages */
  totalCandidates?: number;

  /** Callback when a stage is clicked */
  onStageClick?: (stageId: string) => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_PIPELINE_BOTTLENECK_DEFAULTS: Partial<BhPipelineBottleneckProps> = {
  preset: 'visual',
};
