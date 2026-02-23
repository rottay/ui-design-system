/**
 * BhCandidateBulkEmail - All Presets
 */

import type { BhCandidateBulkEmailPreset, BhCandidateBulkEmailProps } from '../core';
import type { ComponentType } from 'react';
import { FullBhCandidateBulkEmail } from './full';
import { CompactBhCandidateBulkEmail } from './compact';

export { FullBhCandidateBulkEmail } from './full';
export { CompactBhCandidateBulkEmail } from './compact';

export const BH_CANDIDATE_BULK_EMAIL_PRESETS: Record<BhCandidateBulkEmailPreset, ComponentType<BhCandidateBulkEmailProps>> = {
  'full': FullBhCandidateBulkEmail,
  'compact': CompactBhCandidateBulkEmail,
};
