/**
 * BhInterviewPrep - All Presets
 */

import type { BhInterviewPrepPreset } from '../core';
import { StandardBhInterviewPrep } from './standard';

export { StandardBhInterviewPrep } from './standard';

export const BH_INTERVIEW_PREP_PRESETS: Record<BhInterviewPrepPreset, React.ComponentType<any>> = {
  standard: StandardBhInterviewPrep,
};
