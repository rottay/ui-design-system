/**
 * EvSeatingChart - All Presets
 */

export { EditorEvSeatingChart } from './editor';
export { AssignmentEvSeatingChart } from './assignment';

import type { EvSeatingChartPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvSeatingChartProps } from '../core';
import { EditorEvSeatingChart } from './editor';
import { AssignmentEvSeatingChart } from './assignment';

export const EV_SEATING_CHART_PRESETS: Record<EvSeatingChartPreset, ComponentType<EvSeatingChartProps>> = {
  editor: EditorEvSeatingChart,
  assignment: AssignmentEvSeatingChart,
};
