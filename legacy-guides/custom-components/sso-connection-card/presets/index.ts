/**
 * SsoConnectionCard - All Presets
 */

import type { SsoConnectionCardPreset, SsoConnectionCardProps } from '../core';
import type { ComponentType } from 'react';
import { StandardSsoConnectionCard } from './standard';
import { CompactSsoConnectionCard } from './compact';
import { DetailSsoConnectionCard } from './detail';

export { StandardSsoConnectionCard } from './standard';
export { CompactSsoConnectionCard } from './compact';
export { DetailSsoConnectionCard } from './detail';

export const SSO_CONNECTION_CARD_PRESETS: Record<SsoConnectionCardPreset, ComponentType<SsoConnectionCardProps>> = {
  standard: StandardSsoConnectionCard,
  compact: CompactSsoConnectionCard,
  detail: DetailSsoConnectionCard,
};
