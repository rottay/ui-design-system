/**
 * EvLiveChat - All Presets
 */

export { StandardEvLiveChat } from './standard';
export { CompactEvLiveChat } from './compact';

import type { EvLiveChatPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvLiveChatProps } from '../core';
import { StandardEvLiveChat } from './standard';
import { CompactEvLiveChat } from './compact';

export const EV_LIVE_CHAT_PRESETS: Record<EvLiveChatPreset, ComponentType<EvLiveChatProps>> = {
  standard: StandardEvLiveChat,
  compact: CompactEvLiveChat,
};
