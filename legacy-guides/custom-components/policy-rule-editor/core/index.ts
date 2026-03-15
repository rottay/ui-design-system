import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type PolicyRuleEditorPreset = 'visual' | 'json' | 'summary';

export type RuleOperator = 'equals' | 'not-equals' | 'contains' | 'in' | 'greater-than' | 'less-than' | 'matches';

export interface PolicyCondition {
  field: string;
  operator: RuleOperator;
  value: string | number | string[];
}

export interface PolicyRule {
  id: string;
  name: string;
  description?: string;
  conditions: PolicyCondition[];
  action: 'allow' | 'deny' | 'require-mfa' | 'notify';
  priority: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PolicyRuleEditorProps extends EngineAwareProps {
  preset?: PolicyRuleEditorPreset;
  rules: PolicyRule[];
  onCreateRule?: () => void;
  onEditRule?: (id: string) => void;
  onDeleteRule?: (id: string) => void;
  onToggleRule?: (id: string) => void;
  selectedRuleId?: string;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const POLICY_RULE_EDITOR_DEFAULTS: Partial<PolicyRuleEditorProps> = {
  preset: 'visual',
  title: 'Policy Rules',
};

export function getActionColors(tokens: DesignTokens) {
  return {
    allow: {
      color: tokens.colors.successScale[700],
      bgColor: tokens.colors.successScale[50],
      border: tokens.colors.successScale[200],
      dot: tokens.colors.successScale[500],
    },
    deny: {
      color: tokens.colors.errorScale[700],
      bgColor: tokens.colors.errorScale[50],
      border: tokens.colors.errorScale[200],
      dot: tokens.colors.errorScale[500],
    },
    'require-mfa': {
      color: tokens.colors.warningScale[700],
      bgColor: tokens.colors.warningScale[50],
      border: tokens.colors.warningScale[200],
      dot: tokens.colors.warningScale[500],
    },
    notify: {
      color: tokens.colors.infoScale[700],
      bgColor: tokens.colors.infoScale[50],
      border: tokens.colors.infoScale[200],
      dot: tokens.colors.infoScale[500],
    },
  };
}

export function getOperatorLabel(operator: RuleOperator): string {
  const labels: Record<RuleOperator, string> = {
    'equals': 'equals',
    'not-equals': 'does not equal',
    'contains': 'contains',
    'in': 'is in',
    'greater-than': 'is greater than',
    'less-than': 'is less than',
    'matches': 'matches',
  };
  return labels[operator];
}

export function getActionLabel(action: PolicyRule['action']): string {
  const labels: Record<PolicyRule['action'], string> = {
    allow: 'Allow',
    deny: 'Deny',
    'require-mfa': 'Require MFA',
    notify: 'Notify',
  };
  return labels[action];
}

export function formatConditionValue(value: string | number | string[]): string {
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}
