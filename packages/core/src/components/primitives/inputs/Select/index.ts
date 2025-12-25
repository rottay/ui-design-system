/**
 * Select - Engine Router
 * Exports the engine-routed Select component
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { SelectProps } from './types';

export {
  type SelectProps,
  type SelectVariant,
  type SelectSize,
  type SelectStatus,
  type SelectMode,
  type SelectOption,
  type SelectOptionGroup,
  SELECT_DEFAULTS,
} from './types';

export { BaseSelect } from './base';

export const Select = createEngineComponent<SelectProps>('Select', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
