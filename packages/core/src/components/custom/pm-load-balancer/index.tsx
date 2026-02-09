/**
 * PmLoadBalancer - Main Export
 * Configure payment provider load balancing with weights, failover, and traffic split
 */

import type { PmLoadBalancerProps } from './core';
import { PM_LOAD_BALANCER_DEFAULTS } from './core';
import { PM_LOAD_BALANCER_PRESETS } from './presets';

export { type PmLoadBalancerProps, type PmLoadBalancerPreset, PM_LOAD_BALANCER_DEFAULTS } from './core';
export * from './presets';

export function PmLoadBalancer(props: PmLoadBalancerProps): React.ReactElement {
  const preset = props.preset ?? PM_LOAD_BALANCER_DEFAULTS.preset ?? 'panel';
  const PresetComponent = PM_LOAD_BALANCER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmLoadBalancer.displayName = 'PmLoadBalancer';
