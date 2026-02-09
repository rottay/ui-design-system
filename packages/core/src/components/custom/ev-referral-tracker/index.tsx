import type { ReferralTrackerProps } from './core';
import { REFERRAL_TRACKER_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type {
  ReferralTrackerProps,
  Ambassador,
  ReferralChain,
  ReferralTrackerPreset,
} from './core';

export type EvReferralTrackerProps = ReferralTrackerProps;

export function ReferralTracker(props: ReferralTrackerProps) {
  const { preset = REFERRAL_TRACKER_DEFAULTS.preset, ...rest } = props;
  const Component = PRESETS[preset];
  return <Component {...rest} />;
}

ReferralTracker.displayName = 'ReferralTracker';

export const EvReferralTracker = ReferralTracker;
export { ReferralTrackerAmbassador, ReferralTrackerAdmin } from './presets';
