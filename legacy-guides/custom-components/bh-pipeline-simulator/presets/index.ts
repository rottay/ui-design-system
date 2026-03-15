/**
 * BhPipelineSimulator - All Presets
 */

export { InteractiveBhPipelineSimulator } from './interactive';
export { LibraryBhPipelineSimulator } from './library';

import type { BhPipelineSimulatorPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhPipelineSimulatorProps } from '../core';
import { InteractiveBhPipelineSimulator } from './interactive';
import { LibraryBhPipelineSimulator } from './library';

export const BH_PIPELINE_SIMULATOR_PRESETS: Record<BhPipelineSimulatorPreset, ComponentType<BhPipelineSimulatorProps>> = {
  interactive: InteractiveBhPipelineSimulator,
  library: LibraryBhPipelineSimulator,
};
