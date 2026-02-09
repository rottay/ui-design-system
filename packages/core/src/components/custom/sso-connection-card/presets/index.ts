/**
 * SsoConnectionCard - All Presets
 */

import type { SsoConnectionCardPreset } from '../core';
import { StandardSsoConnectionCard } from './standard';
import { CompactSsoConnectionCard } from './compact';
import { DetailSsoConnectionCard } from './detail';

export { StandardSsoConnectionCard } from './standard';
export { CompactSsoConnectionCard } from './compact';
export { DetailSsoConnectionCard } from './detail';

export const SSO_CONNECTION_CARD_PRESETS: Record<SsoConnectionCardPreset, React.ComponentType<any>> = {
  standard: StandardSsoConnectionCard,
  compact: CompactSsoConnectionCard,
  detail: DetailSsoConnectionCard,
};
