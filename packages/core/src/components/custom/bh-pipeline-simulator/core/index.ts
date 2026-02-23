/**
 * BhPipelineSimulator - Core Interface
 * Monte Carlo pipeline simulation for BitHire ATS platform - forecasts
 * hiring outcomes with configurable parameters, distribution visualization,
 * bottleneck detection, and scenario management.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhPipelineSimulatorPreset = 'interactive' | 'library';

// =============================================================================
// SIMULATION DATA TYPES
// =============================================================================

/**
 * Conversion rate between two pipeline stages
 */
export interface StageConversionRate {
  fromStage: string;
  toStage: string;
  rate: number;
  variance: number;
}

/**
 * A source channel entry with quality weighting
 */
export interface SourceMixEntry {
  source: string;
  percentage: number;
  qualityMultiplier: number;
}

/**
 * A dropoff factor at a given stage
 */
export interface DropoffFactor {
  stage: string;
  factor: number;
  reason: string;
}

/**
 * Full simulation parameters
 */
export interface SimulationParameters {
  conversionRates: StageConversionRate[];
  timeToFillDays: { min: number; max: number; median: number };
  sourceMix: SourceMixEntry[];
  dropoffFactors?: DropoffFactor[];
  openPositions: number;
  targetHireDate?: string;
}

/**
 * Aggregate outcome metrics
 */
export interface SimulationOutcome {
  expectedHires: number;
  expectedTimeToFill: number;
  probabilityOfMeetingTarget: number;
  expectedCost: number;
  bestCase: number;
  worstCase: number;
}

/**
 * A confidence interval
 */
export interface ConfidenceInterval {
  lower: number;
  upper: number;
  confidence: number;
}

/**
 * A bucket in the distribution histogram
 */
export interface DistributionBucket {
  value: number;
  frequency: number;
  cumulative: number;
}

/**
 * A bottleneck identified in the pipeline
 */
export interface BottleneckResult {
  stage: string;
  severity: 'low' | 'medium' | 'high';
  impact: number;
  suggestion: string;
}

/**
 * Full simulation result payload
 */
export interface SimulationResultData {
  iterations: number;
  outcomes: SimulationOutcome;
  confidence: ConfidenceInterval;
  distribution: DistributionBucket[];
  bottlenecks: BottleneckResult[];
  recommendations: string[];
}

/**
 * A saved scenario entity for display
 */
export interface ScenarioItem {
  id: string;
  name: string;
  description?: string;
  jobId: string;
  jobTitle?: string;
  parameters: SimulationParameters;
  results?: SimulationResultData;
  status: 'draft' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

/**
 * Historical conversion rate data
 */
export interface HistoricalRateData {
  stages: StageConversionRate[];
  sampleSize: number;
  dateRange: { from: string; to: string };
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhPipelineSimulatorProps extends EngineAwareProps {
  preset?: BhPipelineSimulatorPreset;

  /** Saved scenarios */
  scenarios?: ScenarioItem[];

  /** Current simulation results */
  simulationResults?: SimulationResultData | null;

  /** Historical conversion rate data */
  historicalRates?: HistoricalRateData | null;

  /** Callback to run a simulation */
  onRunSimulation?: (params: SimulationParameters, iterations?: number) => void;

  /** Callback to save a scenario */
  onSaveScenario?: (data: {
    name: string;
    description?: string;
    jobId: string;
    parameters: SimulationParameters;
    results?: SimulationResultData;
  }) => void;

  /** Callback to delete a scenario */
  onDeleteScenario?: (scenarioId: string) => void;

  /** Callback to clone a scenario */
  onCloneScenario?: (scenarioId: string, newName: string) => void;

  /** Callback to compare scenarios */
  onCompareScenarios?: (scenarioIds: string[]) => void;

  /** Callback to load a scenario into the simulator */
  onLoadScenario?: (scenario: ScenarioItem) => void;

  /** Whether data is loading */
  loading?: boolean;

  /** Whether a simulation is currently running */
  simulating?: boolean;

  /** Current job ID context */
  jobId?: string;

  /** Current job title for display */
  jobTitle?: string;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_PIPELINE_SIMULATOR_DEFAULTS: Partial<BhPipelineSimulatorProps> = {
  preset: 'interactive',
};

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get a color intent for a bottleneck severity level
 */
export function getBottleneckColor(severity: 'low' | 'medium' | 'high'): 'success' | 'warning' | 'error' {
  switch (severity) {
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'success';
  }
}

/**
 * Get a color intent for a probability value
 */
export function getProbabilityColor(probability: number): 'success' | 'warning' | 'error' {
  if (probability >= 0.8) return 'success';
  if (probability >= 0.5) return 'warning';
  return 'error';
}

/**
 * Format a number as a percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
