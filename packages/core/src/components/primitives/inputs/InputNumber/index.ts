/**
 * InputNumber - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { InputNumberProps } from './types';

export {
  type InputNumberProps,
  type InputNumberSize,
  type InputNumberStatus,
  INPUT_NUMBER_DEFAULTS,
} from './types';

export const InputNumber = createEngineComponent<InputNumberProps>('InputNumber', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
