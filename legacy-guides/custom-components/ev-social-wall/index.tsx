import type { SocialWallProps } from './core';
import { SOCIAL_WALL_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type {
  SocialWallProps,
  SocialPost,
  SocialWallPreset,
} from './core';

export type EvSocialWallProps = SocialWallProps;

export function SocialWall(props: SocialWallProps) {
  const { preset = SOCIAL_WALL_DEFAULTS.preset, ...rest } = props;
  const Component = PRESETS[preset];
  return <Component {...rest} />;
}

SocialWall.displayName = 'SocialWall';

export const EvSocialWall = SocialWall;
export { SocialWallDisplay, SocialWallModerate } from './presets';
