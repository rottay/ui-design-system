/**
 * BhPipelineSimulator - Main Export
 * Monte Carlo pipeline simulation for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhPipelineSimulatorProps } from './core';
import { BH_PIPELINE_SIMULATOR_DEFAULTS } from './core';
import { BH_PIPELINE_SIMULATOR_PRESETS } from './presets';

export {
  type BhPipelineSimulatorProps,
  type BhPipelineSimulatorPreset,
  type StageConversionRate,
  type SourceMixEntry,
  type DropoffFactor,
  type SimulationParameters,
  type SimulationOutcome,
  type ConfidenceInterval,
  type DistributionBucket,
  type BottleneckResult,
  type SimulationResultData,
  type ScenarioItem,
  type HistoricalRateData,
  BH_PIPELINE_SIMULATOR_DEFAULTS,
  getBottleneckColor,
  getProbabilityColor,
  formatPercentage,
} from './core';
export * from './presets';

/**
 * BhPipelineSimulator component
 * Renders the appropriate preset based on the preset prop
 */
export function BhPipelineSimulator(props: BhPipelineSimulatorProps): React.ReactElement {
  const preset = props.preset ?? BH_PIPELINE_SIMULATOR_DEFAULTS.preset ?? 'interactive';
  const PresetComponent = BH_PIPELINE_SIMULATOR_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhPipelineSimulator.displayName = 'BhPipelineSimulator';

export { InteractiveBhPipelineSimulator, LibraryBhPipelineSimulator } from './presets';
