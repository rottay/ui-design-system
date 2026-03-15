/**
 * EvWaitlistManager - Main Export
 * Waitlist and presale management
 * Automatically selects preset based on props
 */

import type { EvWaitlistManagerProps } from './core';
import { EV_WAITLIST_MANAGER_DEFAULTS } from './core';
import { EV_WAITLIST_MANAGER_PRESETS } from './presets';

export {
  type EvWaitlistManagerProps,
  type EvWaitlistManagerPreset,
  type WaitlistEntry as EvWaitlistManagerWaitlistEntry,
  type PresaleCode as EvWaitlistManagerPresaleCode,
  EV_WAITLIST_MANAGER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvWaitlistManager component
 * Renders the appropriate preset based on the preset prop
 */
export function EvWaitlistManager(props: EvWaitlistManagerProps): React.ReactElement {
  const preset = props.preset ?? EV_WAITLIST_MANAGER_DEFAULTS.preset ?? 'standard';
  const PresetComponent = EV_WAITLIST_MANAGER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvWaitlistManager.displayName = 'EvWaitlistManager';

export { StandardEvWaitlistManager, PriorityEvWaitlistManager } from './presets';
