export { CrowdFlowLive } from './live';
export { CrowdFlowPredictive } from './predictive';

import type { CrowdFlowPreset } from '../core';
import type { ComponentType } from 'react';
import type { CrowdFlowProps } from '../core';
import { CrowdFlowLive } from './live';
import { CrowdFlowPredictive } from './predictive';

export const PRESETS: Record<CrowdFlowPreset, ComponentType<CrowdFlowProps>> =
  {
    live: CrowdFlowLive,
    predictive: CrowdFlowPredictive,
  };
