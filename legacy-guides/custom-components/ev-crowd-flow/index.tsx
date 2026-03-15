import type { CrowdFlowProps } from './core';
import { CROWD_FLOW_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type {
  CrowdFlowProps,
  FlowVector,
  Bottleneck,
  FlowPrediction,
  CrowdFlowPreset,
} from './core';

export type EvCrowdFlowProps = CrowdFlowProps;

export function CrowdFlow(props: CrowdFlowProps) {
  const { preset = CROWD_FLOW_DEFAULTS.preset, ...rest } = props;
  const Component = PRESETS[preset];
  return <Component {...rest} />;
}

CrowdFlow.displayName = 'CrowdFlow';

export const EvCrowdFlow = CrowdFlow;
export { CrowdFlowLive, CrowdFlowPredictive } from './presets';
