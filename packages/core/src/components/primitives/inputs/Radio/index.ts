/**
 * Radio - Engine Router
 * Exports the engine-routed Radio component with compound components
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { RadioProps } from './types';
import { RadioGroup } from './compound';

export {
  type RadioProps,
  type RadioSize,
  type RadioVariant,
  type RadioLabelPlacement,
  type RadioOption,
  type RadioGroupProps,
  RADIO_DEFAULTS,
  RADIO_GROUP_DEFAULTS,
} from './types';

export { BaseRadio } from './base';
export { RadioGroup } from './compound';

export const Radio = Object.assign(
  createEngineComponent<RadioProps>('Radio', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    Group: RadioGroup,
  }
);
