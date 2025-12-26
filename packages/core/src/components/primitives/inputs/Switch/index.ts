/**
 * Switch - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { SwitchProps } from './types';

export {
  type SwitchProps,
  type SwitchSize,
  SWITCH_DEFAULTS,
} from './types';

export const Switch = createEngineComponent<SwitchProps>('Switch', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
