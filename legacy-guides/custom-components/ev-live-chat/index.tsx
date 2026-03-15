/**
 * EvLiveChat - Main Export
 * Live event chat
 * Automatically selects preset based on props
 */

import type { EvLiveChatProps } from './core';
import { EV_LIVE_CHAT_DEFAULTS } from './core';
import { EV_LIVE_CHAT_PRESETS } from './presets';

export {
  type EvLiveChatProps,
  type EvLiveChatPreset,
  type LiveMessage as EvLiveChatLiveMessage,
  EV_LIVE_CHAT_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvLiveChat component
 * Renders the appropriate preset based on the preset prop
 */
export function EvLiveChat(props: EvLiveChatProps): React.ReactElement {
  const preset = props.preset ?? EV_LIVE_CHAT_DEFAULTS.preset ?? 'standard';
  const PresetComponent = EV_LIVE_CHAT_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvLiveChat.displayName = 'EvLiveChat';

export { StandardEvLiveChat, CompactEvLiveChat } from './presets';
