/**
 * BhCareerCoach - All Presets
 */

export { CandidateFacingBhCareerCoach } from './candidate-facing';
export { OptInBhCareerCoach } from './opt-in';

import type { BhCareerCoachPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhCareerCoachProps } from '../core';
import { CandidateFacingBhCareerCoach } from './candidate-facing';
import { OptInBhCareerCoach } from './opt-in';

export const BH_CAREER_COACH_PRESETS: Record<BhCareerCoachPreset, ComponentType<BhCareerCoachProps>> = {
  'candidate-facing': CandidateFacingBhCareerCoach,
  'opt-in': OptInBhCareerCoach,
};
