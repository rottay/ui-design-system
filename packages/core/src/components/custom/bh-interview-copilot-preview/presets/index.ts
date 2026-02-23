/**
 * BhInterviewCopilotPreview - All Presets
 */

import type { BhInterviewCopilotPreviewPreset, BhInterviewCopilotPreviewProps } from '../core';
import type { ComponentType } from 'react';
import { CompactBhInterviewCopilotPreview } from './compact';

export { CompactBhInterviewCopilotPreview } from './compact';

export const BH_INTERVIEW_COPILOT_PREVIEW_PRESETS: Record<BhInterviewCopilotPreviewPreset, ComponentType<BhInterviewCopilotPreviewProps>> = {
  compact: CompactBhInterviewCopilotPreview,
};
