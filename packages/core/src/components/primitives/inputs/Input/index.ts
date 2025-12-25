/**
 * Input - Engine Router
 * Exports the engine-routed Input component
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { InputProps } from './types';

export { type InputProps, type InputVariant, type InputSize, type InputStatus, INPUT_DEFAULTS } from './types';

export { BaseInput } from './base';

export const Input = createEngineComponent<InputProps>('Input', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
