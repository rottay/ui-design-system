/**
 * BhCircuitBreakerViz - All Presets
 */

export { DiagramBhCircuitBreakerViz } from './diagram';
export { CompactBhCircuitBreakerViz } from './compact';

import type { BhCircuitBreakerVizPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhCircuitBreakerVizProps } from '../core';
import { DiagramBhCircuitBreakerViz } from './diagram';
import { CompactBhCircuitBreakerViz } from './compact';

export const BH_CIRCUIT_BREAKER_VIZ_PRESETS: Record<BhCircuitBreakerVizPreset, ComponentType<BhCircuitBreakerVizProps>> = {
  diagram: DiagramBhCircuitBreakerViz,
  compact: CompactBhCircuitBreakerViz,
};
