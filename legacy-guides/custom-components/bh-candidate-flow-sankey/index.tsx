/**
 * BhCandidateFlowSankey - Main Export
 * SVG Sankey diagram for visualizing candidate flow across pipeline stages.
 */

import type { BhCandidateFlowSankeyProps } from './core';
import { BH_CANDIDATE_FLOW_SANKEY_DEFAULTS } from './core';
import { BH_CANDIDATE_FLOW_SANKEY_PRESETS } from './presets';

export {
  type BhCandidateFlowSankeyProps,
  type BhCandidateFlowSankeyPreset,
  type SankeyNode,
  type SankeyLink,
  type SankeyData,
  BH_CANDIDATE_FLOW_SANKEY_DEFAULTS,
} from './core';
export * from './presets';

export function BhCandidateFlowSankey(props: BhCandidateFlowSankeyProps): React.ReactElement {
  const preset = props.preset ?? BH_CANDIDATE_FLOW_SANKEY_DEFAULTS.preset ?? 'standard';
  const PresetComponent = BH_CANDIDATE_FLOW_SANKEY_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhCandidateFlowSankey.displayName = 'BhCandidateFlowSankey';

export { StandardBhCandidateFlowSankey } from './presets';
