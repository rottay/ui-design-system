/**
 * BhClientCard - Main Export
 * Client summary card with tier/contract badges for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhClientCardProps } from './core';
import { BH_CLIENT_CARD_DEFAULTS } from './core';
import { BH_CLIENT_CARD_PRESETS } from './presets';

export {
  type BhClientCardProps,
  type BhClientCardPreset,
  BH_CLIENT_CARD_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhClientCard component
 * Renders the appropriate preset based on the preset prop
 */
export function BhClientCard(props: BhClientCardProps): React.ReactElement {
  const preset = props.preset ?? BH_CLIENT_CARD_DEFAULTS.preset ?? 'standard';
  const PresetComponent = BH_CLIENT_CARD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhClientCard.displayName = 'BhClientCard';

export { StandardBhClientCard, CompactBhClientCard } from './presets';
