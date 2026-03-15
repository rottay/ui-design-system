/**
 * BhOutreachResponse - Main Export
 * Response rate charts, best time analysis for BitHire ATS platform
 */

import type { BhOutreachResponseProps } from './core';
import { BH_OUTREACH_RESPONSE_DEFAULTS } from './core';
import { BH_OUTREACH_RESPONSE_PRESETS } from './presets';

export {
  type BhOutreachResponseProps,
  type BhOutreachResponsePreset,
  type ResponseData,
  BH_OUTREACH_RESPONSE_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhOutreachResponse component
 * Renders the appropriate preset based on the preset prop
 */
export function BhOutreachResponse(props: BhOutreachResponseProps): React.ReactElement {
  const preset = props.preset ?? BH_OUTREACH_RESPONSE_DEFAULTS.preset ?? 'analytics';
  const PresetComponent = BH_OUTREACH_RESPONSE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhOutreachResponse.displayName = 'BhOutreachResponse';

export { AnalyticsBhOutreachResponse, CompactBhOutreachResponse } from './presets';
