/**
 * BhCandidateImport - Main Export
 * Import Wizard for BitHire ATS platform
 */

import type { BhCandidateImportProps } from './core';
import { BH_CANDIDATE_IMPORT_DEFAULTS } from './core';
import { BH_CANDIDATE_IMPORT_PRESETS } from './presets';

export {
  type BhCandidateImportProps,
  type BhCandidateImportPreset,
  type ImportMethod,
  type ImportStep,
  type FieldMapping,
  type DedupMatch,
  type ValidationResult,
  type ImportProgress,
  BH_CANDIDATE_IMPORT_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhCandidateImport component
 * Renders the appropriate preset based on the preset prop
 */
export function BhCandidateImport(props: BhCandidateImportProps): React.ReactElement {
  const preset = props.preset ?? BH_CANDIDATE_IMPORT_DEFAULTS.preset ?? 'standard';
  const PresetComponent = BH_CANDIDATE_IMPORT_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhCandidateImport.displayName = 'BhCandidateImport';

export { StandardBhCandidateImport } from './presets';
