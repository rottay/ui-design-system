/**
 * PolicyRuleEditor - All Presets
 */

import type { PolicyRuleEditorPreset } from '../core';
import { VisualPolicyRuleEditor } from './visual';
import { JsonPolicyRuleEditor } from './json';
import { SummaryPolicyRuleEditor } from './summary';

export { VisualPolicyRuleEditor } from './visual';
export { JsonPolicyRuleEditor } from './json';
export { SummaryPolicyRuleEditor } from './summary';

export const POLICY_RULE_EDITOR_PRESETS: Record<PolicyRuleEditorPreset, React.ComponentType<any>> = {
  visual: VisualPolicyRuleEditor,
  json: JsonPolicyRuleEditor,
  summary: SummaryPolicyRuleEditor,
};
