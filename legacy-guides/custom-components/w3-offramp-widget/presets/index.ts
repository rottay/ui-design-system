/**
 * W3OfframpWidget - All Presets
 */

export { WidgetW3OfframpWidget } from './widget';
export { FormW3OfframpWidget } from './form';

import type { W3OfframpWidgetPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3OfframpWidgetProps } from '../core';
import { WidgetW3OfframpWidget } from './widget';
import { FormW3OfframpWidget } from './form';

export const W3_OFFRAMP_WIDGET_PRESETS: Record<W3OfframpWidgetPreset, ComponentType<W3OfframpWidgetProps>> = {
  widget: WidgetW3OfframpWidget,
  form: FormW3OfframpWidget,
};
