/**
 * BhFeedbackEditor - Main Export
 * Candidate Feedback Composer for the BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhFeedbackEditorProps } from './core';
import { BH_FEEDBACK_EDITOR_DEFAULTS } from './core';
import { BH_FEEDBACK_EDITOR_PRESETS } from './presets';

export {
  type BhFeedbackEditorProps,
  type BhFeedbackEditorPreset,
  type FeedbackChannel,
  type FeedbackTone,
  type FeedbackTemplate,
  type FeedbackTemplateCategory,
  type DecisionContext,
  BH_FEEDBACK_EDITOR_DEFAULTS,
} from './core';
export {
  getChannelConfig,
  getToneConfig,
  getTemplateCategoryConfig,
  getDecisionBadgeColors,
  substituteVariables,
  FEEDBACK_VARIABLES,
} from './core';
export * from './presets';

/**
 * BhFeedbackEditor component
 * Renders the appropriate preset based on the preset prop
 */
export function BhFeedbackEditor(props: BhFeedbackEditorProps): React.ReactElement {
  const preset = props.preset ?? BH_FEEDBACK_EDITOR_DEFAULTS.preset ?? 'standard';
  const PresetComponent = BH_FEEDBACK_EDITOR_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhFeedbackEditor.displayName = 'BhFeedbackEditor';

export { StandardBhFeedbackEditor, CompactBhFeedbackEditor } from './presets';
