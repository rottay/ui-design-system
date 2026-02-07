/**
 * BhFeedbackEditor - All Presets
 */

export { StandardBhFeedbackEditor } from './standard';

import type { BhFeedbackEditorPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhFeedbackEditorProps } from '../core';
import { StandardBhFeedbackEditor } from './standard';

export const BH_FEEDBACK_EDITOR_PRESETS: Record<BhFeedbackEditorPreset, ComponentType<BhFeedbackEditorProps>> = {
  standard: StandardBhFeedbackEditor,
};
