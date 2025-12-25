/**
 * Radio - Engine Router
 * Exports the engine-routed Radio component
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { RadioProps } from './types';

export {
  type RadioProps,
  type RadioSize,
  type RadioVariant,
  type RadioOption,
  type RadioGroupProps,
  RADIO_DEFAULTS,
  RADIO_GROUP_DEFAULTS,
} from './types';

export { BaseRadio } from './base';

export const Radio = createEngineComponent<RadioProps>('Radio', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
