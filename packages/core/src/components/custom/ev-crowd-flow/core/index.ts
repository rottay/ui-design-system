import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type CrowdFlowPreset = 'live' | 'predictive';

export interface FlowVector {
  x: number;
  y: number;
  directionDeg: number;
  magnitude: number;
  speed: 'slow' | 'normal' | 'fast';
}

export interface Bottleneck {
  id: string;
  x: number;
  y: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface FlowPrediction {
  scenarioName: string;
  description: string;
  vectors: FlowVector[];
  bottlenecks: Bottleneck[];
}

export interface CrowdFlowProps extends EngineAwareProps {
  preset?: CrowdFlowPreset;
  vectors?: FlowVector[];
  bottlenecks?: Bottleneck[];
  predictions?: FlowPrediction[];
  onZoneClick?: (x: number, y: number) => void;
  selectedScenario?: string;
  style?: CSSProperties;
  className?: string;
}

export const CROWD_FLOW_DEFAULTS: Required<
  Pick<CrowdFlowProps, 'preset' | 'vectors' | 'bottlenecks' | 'predictions'>
> = {
  preset: 'live',
  vectors: [],
  bottlenecks: [],
  predictions: [],
};
