/**
 * BhCandidateBulkEmail - Main Export
 * Multi-candidate email with per-candidate preview
 */

import type { BhCandidateBulkEmailProps } from './core';
import { BH_CANDIDATE_BULK_EMAIL_DEFAULTS } from './core';
import { BH_CANDIDATE_BULK_EMAIL_PRESETS } from './presets';

export {
  type BhCandidateBulkEmailProps,
  type BhCandidateBulkEmailPreset,
  type BulkEmailRecipient,
  BH_CANDIDATE_BULK_EMAIL_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhCandidateBulkEmail component
 * Renders the appropriate preset based on the preset prop
 */
export function BhCandidateBulkEmail(props: BhCandidateBulkEmailProps): React.ReactElement {
  const preset = props.preset ?? BH_CANDIDATE_BULK_EMAIL_DEFAULTS.preset ?? 'full';
  const PresetComponent = BH_CANDIDATE_BULK_EMAIL_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhCandidateBulkEmail.displayName = 'BhCandidateBulkEmail';
