/**
 * SessionManager - Main Export
 * Automatically selects preset based on props
 */

import type { SessionManagerProps } from './core';
import { SESSION_MANAGER_DEFAULTS } from './core';
import { SESSION_MANAGER_PRESETS } from './presets';

export { type SessionManagerProps, type SessionManagerPreset, type Session, type SessionDevice, type SessionStatus, SESSION_MANAGER_DEFAULTS } from './core';
export { getSessionStatusColors, getDeviceIcon, formatSessionDuration } from './core';
export * from './presets';

/**
 * SessionManager component
 * Renders the appropriate preset based on the preset prop
 */
export function SessionManager(props: SessionManagerProps): React.ReactElement {
  const preset = props.preset ?? SESSION_MANAGER_DEFAULTS.preset ?? 'table';
  const PresetComponent = SESSION_MANAGER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

SessionManager.displayName = 'SessionManager';

export { TableSessionManager, CardsSessionManager, TimelineSessionManager } from './presets';
