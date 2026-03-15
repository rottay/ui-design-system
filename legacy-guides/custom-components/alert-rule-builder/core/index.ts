import type { EngineAwareProps } from '../../../../types';

export type AlertRuleBuilderPreset = 'standard' | 'compact';

export interface AlertCondition {
  field: string;
  operator: string;
  value: string;
  conjunction?: 'and' | 'or';
}

export interface AlertAction {
  type: string;
  config: Record<string, unknown>;
}

export interface AlertRule {
  id: string;
  name: string;
  conditions: AlertCondition[];
  actions: AlertAction[];
  enabled: boolean;
}

export interface AlertRuleBuilderProps extends EngineAwareProps {
  preset?: AlertRuleBuilderPreset;
  rules: AlertRule[];
  onSave?: (rule: AlertRule) => void;
  onDelete?: (id: string) => void;
  onToggle?: (id: string, enabled: boolean) => void;
  fields?: { key: string; label: string; type: string }[];
  className?: string;
  style?: React.CSSProperties;
}

export const ALERT_RULE_BUILDER_DEFAULTS = {
  preset: 'standard' as AlertRuleBuilderPreset,
  fields: [
    { key: 'cpu', label: 'CPU Usage', type: 'number' },
    { key: 'memory', label: 'Memory Usage', type: 'number' },
    { key: 'status', label: 'Status', type: 'string' },
  ],
};
