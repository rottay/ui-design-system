/**
 * BhOutreachResponse - All Presets
 */

export { AnalyticsBhOutreachResponse } from './analytics';
export { CompactBhOutreachResponse } from './compact';

import type { BhOutreachResponsePreset } from '../core';
import type { ComponentType } from 'react';
import type { BhOutreachResponseProps } from '../core';
import { AnalyticsBhOutreachResponse } from './analytics';
import { CompactBhOutreachResponse } from './compact';

export const BH_OUTREACH_RESPONSE_PRESETS: Record<BhOutreachResponsePreset, ComponentType<BhOutreachResponseProps>> = {
  analytics: AnalyticsBhOutreachResponse,
  compact: CompactBhOutreachResponse,
};
