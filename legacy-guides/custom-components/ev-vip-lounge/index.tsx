import type { VipLoungeProps } from './core';
import { VIP_LOUNGE_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type {
  VipLoungeProps,
  VipGuest,
  ConciergeRequest,
  VipLoungePreset,
} from './core';

export type EvVipLoungeProps = VipLoungeProps;

export function VipLounge(props: VipLoungeProps) {
  const { preset = VIP_LOUNGE_DEFAULTS.preset, ...rest } = props;
  const Component = PRESETS[preset];
  return <Component {...rest} />;
}

VipLounge.displayName = 'VipLounge';

export const EvVipLounge = VipLounge;
export { VipLoungeHost, VipLoungeConcierge } from './presets';
