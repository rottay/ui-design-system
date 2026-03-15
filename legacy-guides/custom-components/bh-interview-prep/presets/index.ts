/**
 * BhInterviewPrep - All Presets
 */

import type { BhInterviewPrepPreset, BhInterviewPrepProps } from '../core';
import type { ComponentType } from 'react';
import { StandardBhInterviewPrep } from './standard';

export { StandardBhInterviewPrep } from './standard';

export const BH_INTERVIEW_PREP_PRESETS: Record<BhInterviewPrepPreset, ComponentType<BhInterviewPrepProps>> = {
  standard: StandardBhInterviewPrep,
};
