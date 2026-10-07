import type { ActionDockDensity, ActionDockProps } from '@rottay/design-system';

export function dockDensity(props: ActionDockProps): ActionDockDensity {
  return props.density ?? 'comfortable';
}
