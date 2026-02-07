/**
 * BhCandidateImport - All Presets
 */

import type { BhCandidateImportPreset } from '../core';
import { StandardBhCandidateImport } from './standard';

export { StandardBhCandidateImport } from './standard';

export const BH_CANDIDATE_IMPORT_PRESETS: Record<BhCandidateImportPreset, React.ComponentType<any>> = {
  standard: StandardBhCandidateImport,
};
