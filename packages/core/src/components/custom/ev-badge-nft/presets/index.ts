export { BadgeNftGallery } from './gallery';
export { BadgeNftAdmin } from './admin';

import type { BadgeNftPreset } from '../core';
import type { ComponentType } from 'react';
import type { BadgeNftProps } from '../core';
import { BadgeNftGallery } from './gallery';
import { BadgeNftAdmin } from './admin';

export const PRESETS: Record<BadgeNftPreset, ComponentType<BadgeNftProps>> = {
  gallery: BadgeNftGallery,
  admin: BadgeNftAdmin,
};
