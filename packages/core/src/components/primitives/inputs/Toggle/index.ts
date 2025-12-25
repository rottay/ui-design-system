/**
 * Toggle - Engine Router
 * Exports the engine-routed Toggle component
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { ToggleProps } from './types';

export { type ToggleProps, type ToggleSize, TOGGLE_DEFAULTS } from './types';

export { BaseToggle } from './base';

export const Toggle = createEngineComponent<ToggleProps>('Toggle', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
