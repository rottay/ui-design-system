/**
 * BhInterviewCopilot - All Presets
 */

import type { BhInterviewCopilotPreset, BhInterviewCopilotProps } from '../core';
import type { ComponentType } from 'react';
import { SidebarBhInterviewCopilot } from './sidebar';
import { ReviewBhInterviewCopilot } from './review';

export { SidebarBhInterviewCopilot } from './sidebar';
export { ReviewBhInterviewCopilot } from './review';

export const BH_INTERVIEW_COPILOT_PRESETS: Record<BhInterviewCopilotPreset, ComponentType<BhInterviewCopilotProps>> = {
  sidebar: SidebarBhInterviewCopilot,
  review: ReviewBhInterviewCopilot,
};
