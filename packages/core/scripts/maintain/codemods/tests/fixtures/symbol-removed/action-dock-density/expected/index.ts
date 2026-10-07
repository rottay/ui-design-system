import type { DensityPosture, ActionDockProps } from '@rottay/design-system';

export function dockDensity(props: ActionDockProps): DensityPosture {
  return props.density ?? 'comfortable';
}
