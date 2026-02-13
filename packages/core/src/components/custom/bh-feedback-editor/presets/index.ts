/**
 * BhFeedbackEditor - All Presets
 */

import type { BhFeedbackEditorPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhFeedbackEditorProps } from '../core';
import { StandardBhFeedbackEditor } from './standard';
import { CompactBhFeedbackEditor } from './compact';

export { StandardBhFeedbackEditor } from './standard';
export { CompactBhFeedbackEditor } from './compact';

export const BH_FEEDBACK_EDITOR_PRESETS: Record<BhFeedbackEditorPreset, ComponentType<BhFeedbackEditorProps>> = {
  standard: StandardBhFeedbackEditor,
  compact: CompactBhFeedbackEditor,
};
