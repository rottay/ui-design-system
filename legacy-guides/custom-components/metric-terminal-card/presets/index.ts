export { CommandMetricTerminalCard } from './command';
export { HudMetricTerminalCard } from './hud';
export { CircuitMetricTerminalCard } from './circuit';
export { MatrixMetricTerminalCard } from './matrix';

import type { MetricTerminalCardPreset } from '../core';
import type { ComponentType } from 'react';
import type { MetricTerminalCardProps } from '../core';
import { CommandMetricTerminalCard } from './command';
import { HudMetricTerminalCard } from './hud';
import { CircuitMetricTerminalCard } from './circuit';
import { MatrixMetricTerminalCard } from './matrix';

export const METRIC_TERMINAL_CARD_PRESETS: Record<MetricTerminalCardPreset, ComponentType<MetricTerminalCardProps>> = {
  command: CommandMetricTerminalCard,
  hud: HudMetricTerminalCard,
  circuit: CircuitMetricTerminalCard,
  matrix: MatrixMetricTerminalCard,
};
