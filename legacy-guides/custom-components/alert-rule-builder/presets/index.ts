import type { AlertRuleBuilderPreset, AlertRuleBuilderProps } from '../core';
import { StandardPreset } from './standard';
import { CompactPreset } from './compact';

export const PRESETS: Record<
  AlertRuleBuilderPreset,
  React.ComponentType<AlertRuleBuilderProps>
> = {
  standard: StandardPreset,
  compact: CompactPreset,
};
