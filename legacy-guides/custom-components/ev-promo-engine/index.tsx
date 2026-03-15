/**
 * EvPromoEngine - Main Export
 * Promotion engine with code builder, flash sales, bundles, referrals, and campaign tracking
 */

import type { EvPromoEngineProps } from './core';
import { EV_PROMO_ENGINE_DEFAULTS } from './core';
import { EV_PROMO_ENGINE_PRESETS } from './presets';

export {
  type EvPromoEngineProps,
  type EvPromoEnginePreset,
  type PromoCode as EvPromoEnginePromoCode,
  EV_PROMO_ENGINE_DEFAULTS,
} from './core';
export * from './presets';

export function EvPromoEngine(props: EvPromoEngineProps): React.ReactElement {
  const preset = props.preset ?? EV_PROMO_ENGINE_DEFAULTS.preset ?? 'builder';
  const PresetComponent = EV_PROMO_ENGINE_PRESETS[preset];
  return <PresetComponent {...props} />;
}

EvPromoEngine.displayName = 'EvPromoEngine';

export { BuilderEvPromoEngine, TrackerEvPromoEngine } from './presets';
