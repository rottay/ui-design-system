import type { GuestProfileProps } from './core';
import { GUEST_PROFILE_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type {
  GuestProfileProps,
  GuestProfile as GuestProfileData,
  GuestPreference,
  GuestProfilePreset,
} from './core';

export type EvGuestProfileProps = GuestProfileProps;

export function EvGuestProfile(props: GuestProfileProps) {
  const { preset = GUEST_PROFILE_DEFAULTS.preset, ...rest } = props;
  const Component = PRESETS[preset!];
  return <Component {...rest} />;
}

EvGuestProfile.displayName = 'EvGuestProfile';

export { GuestProfileFull, GuestProfileCard } from './presets';
