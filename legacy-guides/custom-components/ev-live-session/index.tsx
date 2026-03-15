/**
 * EvLiveSession - Main Export
 * Live DJ session control panel
 * Automatically selects preset based on props
 */

import type { EvLiveSessionProps } from './core';
import { EV_LIVE_SESSION_DEFAULTS } from './core';
import { EV_LIVE_SESSION_PRESETS } from './presets';

export {
  type EvLiveSessionProps,
  type EvLiveSessionPreset,
  type SessionInfo as EvLiveSessionSessionInfo,
  type ChatMessage as EvLiveSessionChatMessage,
  type SongRequest as EvLiveSessionSongRequest,
  type TipNotification as EvLiveSessionTipNotification,
  EV_LIVE_SESSION_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvLiveSession component
 * Renders the appropriate preset based on the preset prop
 */
export function EvLiveSession(props: EvLiveSessionProps): React.ReactElement {
  const preset = props.preset ?? EV_LIVE_SESSION_DEFAULTS.preset ?? 'performer';
  const PresetComponent = EV_LIVE_SESSION_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvLiveSession.displayName = 'EvLiveSession';

export { PerformerEvLiveSession, AudienceEvLiveSession } from './presets';
