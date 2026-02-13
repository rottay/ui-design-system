/**
 * BhClientCard - All Presets
 */

export { StandardBhClientCard } from './standard';
export { CompactBhClientCard } from './compact';

import type { BhClientCardPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhClientCardProps } from '../core';
import { StandardBhClientCard } from './standard';
import { CompactBhClientCard } from './compact';

export const BH_CLIENT_CARD_PRESETS: Record<BhClientCardPreset, ComponentType<BhClientCardProps>> = {
  standard: StandardBhClientCard,
  compact: CompactBhClientCard,
};
