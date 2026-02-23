/**
 * BhEmailComposer - All Presets
 */

import type { BhEmailComposerPreset, BhEmailComposerProps } from '../core';
import type { ComponentType } from 'react';
import { FullBhEmailComposer } from './full';
import { MinimalBhEmailComposer } from './minimal';

export { FullBhEmailComposer } from './full';
export { MinimalBhEmailComposer } from './minimal';

export const BH_EMAIL_COMPOSER_PRESETS: Record<BhEmailComposerPreset, ComponentType<BhEmailComposerProps>> = {
  'full': FullBhEmailComposer,
  'minimal': MinimalBhEmailComposer,
};
