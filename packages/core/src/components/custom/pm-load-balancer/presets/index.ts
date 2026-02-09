/**
 * PmLoadBalancer - All Presets
 */

export { PanelPmLoadBalancer } from './panel';
export { VisualPmLoadBalancer } from './visual';

import type { PmLoadBalancerPreset } from '../core';
import type { ComponentType } from 'react';
import type { PmLoadBalancerProps } from '../core';
import { PanelPmLoadBalancer } from './panel';
import { VisualPmLoadBalancer } from './visual';

export const PM_LOAD_BALANCER_PRESETS: Record<PmLoadBalancerPreset, ComponentType<PmLoadBalancerProps>> = {
  panel: PanelPmLoadBalancer,
  visual: VisualPmLoadBalancer,
};
