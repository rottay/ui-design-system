/**
 * BhQuestionAbTest - Main Export
 * Interview Question A/B Testing for the BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhQuestionAbTestProps } from './core';
import { BH_QUESTION_AB_TEST_DEFAULTS } from './core';
import { BH_QUESTION_AB_TEST_PRESETS } from './presets';

export {
  type BhQuestionAbTestProps,
  type BhQuestionAbTestPreset,
  type QuestionVariant,
  type ExperimentData,
  type ExperimentAnalytics,
  type AssignmentRecord,
  BH_QUESTION_AB_TEST_DEFAULTS,
} from './core';
export {
  getExperimentStatusConfig,
  getConfidenceDisplay,
  getSampleProgress,
  formatExperimentScore,
  getLeadingVariant,
} from './core';
export * from './presets';

/**
 * BhQuestionAbTest component
 * Renders the appropriate preset based on the preset prop
 */
export function BhQuestionAbTest(props: BhQuestionAbTestProps): React.ReactElement {
  const preset = props.preset ?? BH_QUESTION_AB_TEST_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = BH_QUESTION_AB_TEST_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhQuestionAbTest.displayName = 'BhQuestionAbTest';

export { DashboardBhQuestionAbTest, DetailBhQuestionAbTest, AnalyticsBhQuestionAbTest } from './presets';
