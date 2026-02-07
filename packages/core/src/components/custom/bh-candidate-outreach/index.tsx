/**
 * BhCandidateOutreach - Main Export
 * Multi-channel outreach composer and campaign tracker for BitHire ATS
 */

import type { BhCandidateOutreachProps } from './core';
import { BH_CANDIDATE_OUTREACH_DEFAULTS } from './core';
import { BH_CANDIDATE_OUTREACH_PRESETS } from './presets';

export {
  type BhCandidateOutreachProps,
  type BhCandidateOutreachPreset,
  type OutreachChannel,
  type OutreachRecipient,
  type OutreachTemplate,
  type CampaignMetrics,
  type ABVariant,
  type ScheduleConfig,
  BH_CANDIDATE_OUTREACH_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhCandidateOutreach component
 * Renders the appropriate preset based on the preset prop
 */
export function BhCandidateOutreach(props: BhCandidateOutreachProps): React.ReactElement {
  const preset = props.preset ?? BH_CANDIDATE_OUTREACH_DEFAULTS.preset ?? 'composer';
  const PresetComponent = BH_CANDIDATE_OUTREACH_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhCandidateOutreach.displayName = 'BhCandidateOutreach';

export { ComposerBhCandidateOutreach, TrackerBhCandidateOutreach } from './presets';
