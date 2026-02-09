export { CanvasEvAutomationBuilder } from './canvas';
export { ListEvAutomationBuilder } from './list';

import type { AutomationBuilderPreset } from '../core';
import type { ComponentType } from 'react';
import type { AutomationBuilderProps } from '../core';
import { CanvasEvAutomationBuilder } from './canvas';
import { ListEvAutomationBuilder } from './list';

export const PRESETS: Record<
  AutomationBuilderPreset,
  ComponentType<AutomationBuilderProps>
> = {
  canvas: CanvasEvAutomationBuilder,
  list: ListEvAutomationBuilder,
};
