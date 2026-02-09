import type { AutomationBuilderProps } from './core';
import { AUTOMATION_BUILDER_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type {
  AutomationBuilderProps,
  AutomationRule,
  AutomationTrigger,
  AutomationAction,
  AutomationBuilderPreset,
} from './core';

export type EvAutomationBuilderProps = AutomationBuilderProps;

export function AutomationBuilder(props: AutomationBuilderProps) {
  const { preset = AUTOMATION_BUILDER_DEFAULTS.preset, ...rest } = props;
  const Component = PRESETS[preset];
  return <Component {...rest} />;
}

AutomationBuilder.displayName = 'AutomationBuilder';

export const EvAutomationBuilder = AutomationBuilder;
export { CanvasEvAutomationBuilder, ListEvAutomationBuilder } from './presets';
