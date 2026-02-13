/**
 * BhCandidateBulkEmail - All Presets
 */

import type { BhCandidateBulkEmailPreset } from '../core';
import { FullBhCandidateBulkEmail } from './full';
import { CompactBhCandidateBulkEmail } from './compact';

export { FullBhCandidateBulkEmail } from './full';
export { CompactBhCandidateBulkEmail } from './compact';

export const BH_CANDIDATE_BULK_EMAIL_PRESETS: Record<BhCandidateBulkEmailPreset, React.ComponentType<any>> = {
  'full': FullBhCandidateBulkEmail,
  'compact': CompactBhCandidateBulkEmail,
};
