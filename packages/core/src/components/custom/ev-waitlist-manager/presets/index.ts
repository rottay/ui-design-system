/**
 * EvWaitlistManager - All Presets
 */

export { StandardEvWaitlistManager } from './standard';
export { PriorityEvWaitlistManager } from './priority';

import type { EvWaitlistManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvWaitlistManagerProps } from '../core';
import { StandardEvWaitlistManager } from './standard';
import { PriorityEvWaitlistManager } from './priority';

export const EV_WAITLIST_MANAGER_PRESETS: Record<EvWaitlistManagerPreset, ComponentType<EvWaitlistManagerProps>> = {
  standard: StandardEvWaitlistManager,
  priority: PriorityEvWaitlistManager,
};
