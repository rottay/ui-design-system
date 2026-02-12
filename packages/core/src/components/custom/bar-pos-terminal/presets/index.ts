/**
 * BarPosTerminal - All Presets
 */

export { CompactBarPosTerminal } from './compact';
export { FullBarPosTerminal } from './full';

import type { BarPosTerminalPreset } from '../core';
import type { ComponentType } from 'react';
import type { BarPosTerminalProps } from '../core';
import { CompactBarPosTerminal } from './compact';
import { FullBarPosTerminal } from './full';

export const BAR_POS_TERMINAL_PRESETS: Record<BarPosTerminalPreset, ComponentType<BarPosTerminalProps>> = {
  compact: CompactBarPosTerminal,
  full: FullBarPosTerminal,
};
