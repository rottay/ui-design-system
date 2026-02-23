/**
 * BhCandidateFlowSankey - All Presets
 */

import type { BhCandidateFlowSankeyPreset, BhCandidateFlowSankeyProps } from '../core';
import type { ComponentType } from 'react';
import { StandardBhCandidateFlowSankey } from './standard';

export { StandardBhCandidateFlowSankey } from './standard';

export const BH_CANDIDATE_FLOW_SANKEY_PRESETS: Record<BhCandidateFlowSankeyPreset, ComponentType<BhCandidateFlowSankeyProps>> = {
  standard: StandardBhCandidateFlowSankey,
};
