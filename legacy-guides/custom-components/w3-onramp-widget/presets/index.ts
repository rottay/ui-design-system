/**
 * W3OnrampWidget - All Presets
 */

export { WidgetW3OnrampWidget } from './widget';
export { FormW3OnrampWidget } from './form';

import type { W3OnrampWidgetPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3OnrampWidgetProps } from '../core';
import { WidgetW3OnrampWidget } from './widget';
import { FormW3OnrampWidget } from './form';

export const W3_ONRAMP_WIDGET_PRESETS: Record<W3OnrampWidgetPreset, ComponentType<W3OnrampWidgetProps>> = {
  widget: WidgetW3OnrampWidget,
  form: FormW3OnrampWidget,
};
