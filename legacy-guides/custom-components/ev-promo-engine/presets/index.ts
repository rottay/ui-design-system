/**
 * EvPromoEngine - All Presets
 */

export { BuilderEvPromoEngine } from './builder';
export { TrackerEvPromoEngine } from './tracker';

import type { EvPromoEnginePreset } from '../core';
import type { ComponentType } from 'react';
import type { EvPromoEngineProps } from '../core';
import { BuilderEvPromoEngine } from './builder';
import { TrackerEvPromoEngine } from './tracker';

export const EV_PROMO_ENGINE_PRESETS: Record<EvPromoEnginePreset, ComponentType<EvPromoEngineProps>> = {
  builder: BuilderEvPromoEngine,
  tracker: TrackerEvPromoEngine,
};
