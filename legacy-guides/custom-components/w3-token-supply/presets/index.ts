/**
 * W3TokenSupply - All Presets
 */

export { OverviewW3TokenSupply } from './overview';
export { ChartW3TokenSupply } from './chart';

import type { W3TokenSupplyPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3TokenSupplyProps } from '../core';
import { OverviewW3TokenSupply } from './overview';
import { ChartW3TokenSupply } from './chart';

export const W3_TOKEN_SUPPLY_PRESETS: Record<W3TokenSupplyPreset, ComponentType<W3TokenSupplyProps>> = {
  overview: OverviewW3TokenSupply,
  chart: ChartW3TokenSupply,
};
