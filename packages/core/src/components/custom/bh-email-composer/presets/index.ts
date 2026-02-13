/**
 * BhEmailComposer - All Presets
 */

import type { BhEmailComposerPreset } from '../core';
import { FullBhEmailComposer } from './full';
import { MinimalBhEmailComposer } from './minimal';

export { FullBhEmailComposer } from './full';
export { MinimalBhEmailComposer } from './minimal';

export const BH_EMAIL_COMPOSER_PRESETS: Record<BhEmailComposerPreset, React.ComponentType<any>> = {
  'full': FullBhEmailComposer,
  'minimal': MinimalBhEmailComposer,
};
