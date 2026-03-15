import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type AutomationBuilderPreset = 'canvas' | 'list';

export interface AutomationTrigger {
  type: 'capacity' | 'time' | 'weather' | 'sales' | 'inventory';
  condition: string;
  value: string;
}

export interface AutomationAction {
  type: 'notify' | 'close-entry' | 'adjust-price' | 'assign-staff' | 'send-alert';
  target: string;
  params?: Record<string, string>;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  enabled: boolean;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface AutomationBuilderProps extends EngineAwareProps {
  preset?: AutomationBuilderPreset;
  rules?: AutomationRule[];
  onRuleToggle?: (ruleId: string, enabled: boolean) => void;
  onRuleClick?: (ruleId: string) => void;
  onCreateRule?: () => void;
  onDeleteRule?: (ruleId: string) => void;
  style?: CSSProperties;
  className?: string;
}

export const AUTOMATION_BUILDER_DEFAULTS: Required<
  Pick<AutomationBuilderProps, 'preset' | 'rules'>
> = {
  preset: 'canvas',
  rules: [],
};
