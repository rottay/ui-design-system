import type { AlertRuleBuilderProps } from './core';
import { ALERT_RULE_BUILDER_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type {
  AlertRuleBuilderProps,
  AlertRuleBuilderPreset,
  AlertRule,
  AlertCondition,
  AlertAction,
} from './core';
export { ALERT_RULE_BUILDER_DEFAULTS } from './core';

export function AlertRuleBuilder(props: AlertRuleBuilderProps): React.ReactElement {
  const preset = props.preset ?? ALERT_RULE_BUILDER_DEFAULTS.preset ?? 'standard';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

AlertRuleBuilder.displayName = 'AlertRuleBuilder';
