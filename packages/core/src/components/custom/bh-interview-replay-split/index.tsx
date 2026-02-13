/**
 * BhInterviewReplaySplit - Main Export
 * Waveform + synced transcript + evidence markers
 */

import type { BhInterviewReplaySplitProps } from './core';
import { BH_INTERVIEW_REPLAY_SPLIT_DEFAULTS } from './core';
import { BH_INTERVIEW_REPLAY_SPLIT_PRESETS } from './presets';

export {
  type BhInterviewReplaySplitProps,
  type BhInterviewReplaySplitPreset,
  type ReplayTranscriptSegment,
  type ReplayEvidenceMarker,
  BH_INTERVIEW_REPLAY_SPLIT_DEFAULTS,
} from './core';
export * from './presets';

export function BhInterviewReplaySplit(props: BhInterviewReplaySplitProps): React.ReactElement {
  const preset = props.preset ?? BH_INTERVIEW_REPLAY_SPLIT_DEFAULTS.preset ?? 'split';
  const PresetComponent = BH_INTERVIEW_REPLAY_SPLIT_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhInterviewReplaySplit.displayName = 'BhInterviewReplaySplit';
