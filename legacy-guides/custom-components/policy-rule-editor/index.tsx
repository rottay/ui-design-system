/**
 * PolicyRuleEditor - Main Export
 * Automatically selects preset based on props
 */

import type { PolicyRuleEditorProps } from './core';
import { POLICY_RULE_EDITOR_DEFAULTS } from './core';
import { POLICY_RULE_EDITOR_PRESETS } from './presets';

export { type PolicyRuleEditorProps, type PolicyRuleEditorPreset, type PolicyRule, type PolicyCondition, type RuleOperator, POLICY_RULE_EDITOR_DEFAULTS } from './core';
export * from './presets';

/**
 * PolicyRuleEditor component
 * Renders the appropriate preset based on the preset prop
 */
export function PolicyRuleEditor(props: PolicyRuleEditorProps): React.ReactElement {
  const preset = props.preset ?? POLICY_RULE_EDITOR_DEFAULTS.preset ?? 'visual';
  const PresetComponent = POLICY_RULE_EDITOR_PRESETS[preset];

  return <PresetComponent {...props} />;
}

PolicyRuleEditor.displayName = 'PolicyRuleEditor';

export { VisualPolicyRuleEditor, JsonPolicyRuleEditor, SummaryPolicyRuleEditor } from './presets';
