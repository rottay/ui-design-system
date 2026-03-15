/**
 * BhInterviewCopilotPreview - Main Export
 * Dashboard widget showing interviewer copilot stats at a glance.
 */

import type { BhInterviewCopilotPreviewProps } from './core';
import { BH_INTERVIEW_COPILOT_PREVIEW_DEFAULTS } from './core';
import { BH_INTERVIEW_COPILOT_PREVIEW_PRESETS } from './presets';

export {
  type BhInterviewCopilotPreviewProps,
  type BhInterviewCopilotPreviewPreset,
  type RecentCopilotSession,
  type TalkTimeAverage,
  BH_INTERVIEW_COPILOT_PREVIEW_DEFAULTS,
} from './core';
export * from './presets';

export function BhInterviewCopilotPreview(props: BhInterviewCopilotPreviewProps): React.ReactElement {
  const preset = props.preset ?? BH_INTERVIEW_COPILOT_PREVIEW_DEFAULTS.preset ?? 'compact';
  const PresetComponent = BH_INTERVIEW_COPILOT_PREVIEW_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhInterviewCopilotPreview.displayName = 'BhInterviewCopilotPreview';

export { CompactBhInterviewCopilotPreview } from './presets';
