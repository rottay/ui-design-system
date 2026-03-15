/**
 * BhCandidateImport - All Presets
 */

import type { BhCandidateImportPreset, BhCandidateImportProps } from '../core';
import type { ComponentType } from 'react';
import { StandardBhCandidateImport } from './standard';

export { StandardBhCandidateImport } from './standard';

export const BH_CANDIDATE_IMPORT_PRESETS: Record<BhCandidateImportPreset, ComponentType<BhCandidateImportProps>> = {
  standard: StandardBhCandidateImport,
};
