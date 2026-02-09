import type { BadgeNftProps } from './core';
import { BADGE_NFT_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type {
  BadgeNftProps,
  DigitalBadge,
  BadgeProgress,
  BadgeNftPreset,
} from './core';

export type EvBadgeNftProps = BadgeNftProps;

export function BadgeNft(props: BadgeNftProps) {
  const { preset = BADGE_NFT_DEFAULTS.preset, ...rest } = props;
  const Component = PRESETS[preset];
  return <Component {...rest} />;
}

BadgeNft.displayName = 'BadgeNft';

export const EvBadgeNft = BadgeNft;
export { BadgeNftGallery, BadgeNftAdmin } from './presets';
