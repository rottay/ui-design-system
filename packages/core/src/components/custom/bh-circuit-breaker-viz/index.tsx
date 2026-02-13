/**
 * BhCircuitBreakerViz - Main Export
 * Network diagram of providers colored by circuit state
 */

import type { BhCircuitBreakerVizProps } from './core';
import { BH_CIRCUIT_BREAKER_VIZ_DEFAULTS } from './core';
import { BH_CIRCUIT_BREAKER_VIZ_PRESETS } from './presets';

export {
  type BhCircuitBreakerVizProps,
  type BhCircuitBreakerVizPreset,
  type CircuitNode,
  type CircuitConnection,
  BH_CIRCUIT_BREAKER_VIZ_DEFAULTS,
} from './core';
export * from './presets';

export function BhCircuitBreakerViz(props: BhCircuitBreakerVizProps): React.ReactElement {
  const preset = props.preset ?? BH_CIRCUIT_BREAKER_VIZ_DEFAULTS.preset ?? 'diagram';
  const PresetComponent = BH_CIRCUIT_BREAKER_VIZ_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhCircuitBreakerViz.displayName = 'BhCircuitBreakerViz';
