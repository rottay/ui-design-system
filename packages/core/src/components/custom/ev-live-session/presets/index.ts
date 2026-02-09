/**
 * EvLiveSession - All Presets
 */

export { PerformerEvLiveSession } from './performer';
export { AudienceEvLiveSession } from './audience';

import type { EvLiveSessionPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvLiveSessionProps } from '../core';
import { PerformerEvLiveSession } from './performer';
import { AudienceEvLiveSession } from './audience';

export const EV_LIVE_SESSION_PRESETS: Record<EvLiveSessionPreset, ComponentType<EvLiveSessionProps>> = {
  performer: PerformerEvLiveSession,
  audience: AudienceEvLiveSession,
};
