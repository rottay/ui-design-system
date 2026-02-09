export { SocialWallDisplay } from './display';
export { SocialWallModerate } from './moderate';

import type { SocialWallPreset } from '../core';
import type { ComponentType } from 'react';
import type { SocialWallProps } from '../core';
import { SocialWallDisplay } from './display';
import { SocialWallModerate } from './moderate';

export const PRESETS: Record<SocialWallPreset, ComponentType<SocialWallProps>> =
  {
    display: SocialWallDisplay,
    moderate: SocialWallModerate,
  };
