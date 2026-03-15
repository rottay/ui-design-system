/**
 * SsoConnectionCard - Main Export
 * Automatically selects preset based on props
 */

import type { SsoConnectionCardProps } from './core';
import { SSO_CONNECTION_CARD_DEFAULTS } from './core';
import { SSO_CONNECTION_CARD_PRESETS } from './presets';

export { type SsoConnectionCardProps, type SsoConnectionCardPreset, type SsoConnection, type SsoProtocol, type SsoConnectionStatus, SSO_CONNECTION_CARD_DEFAULTS } from './core';
export { getSsoStatusColors, getProtocolLabel, getProviderIcon } from './core';
export * from './presets';

export function SsoConnectionCard(props: SsoConnectionCardProps): React.ReactElement {
  const preset = props.preset ?? SSO_CONNECTION_CARD_DEFAULTS.preset ?? 'standard';
  const PresetComponent = SSO_CONNECTION_CARD_PRESETS[preset];
  return <PresetComponent {...props} />;
}

SsoConnectionCard.displayName = 'SsoConnectionCard';

export { StandardSsoConnectionCard, CompactSsoConnectionCard, DetailSsoConnectionCard } from './presets';
