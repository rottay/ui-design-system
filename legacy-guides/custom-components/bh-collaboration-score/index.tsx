/**
 * BhCollaborationScore - Main Export
 * Dashboard widget displaying hiring team collaboration metrics.
 */

import type { BhCollaborationScoreProps } from './core';
import { BH_COLLABORATION_SCORE_DEFAULTS } from './core';
import { BH_COLLABORATION_SCORE_PRESETS } from './presets';

export {
  type BhCollaborationScoreProps,
  type BhCollaborationScorePreset,
  type CollaborationData,
  type CollabDimension,
  BH_COLLABORATION_SCORE_DEFAULTS,
} from './core';
export * from './presets';

export function BhCollaborationScore(props: BhCollaborationScoreProps): React.ReactElement {
  const preset = props.preset ?? BH_COLLABORATION_SCORE_DEFAULTS.preset ?? 'compact';
  const PresetComponent = BH_COLLABORATION_SCORE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhCollaborationScore.displayName = 'BhCollaborationScore';

export { CompactBhCollaborationScore } from './presets';
