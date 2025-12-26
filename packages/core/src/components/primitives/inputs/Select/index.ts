/**
 * Select - Engine Router
 * Exports the engine-routed Select component with compound components
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { SelectProps } from './types';
import { SelectOption, SelectOptGroup } from './compound';

// Export types
export type {
  SelectProps,
  SelectSize,
  SelectVariant,
  SelectStatus,
  SelectMode,
  SelectOption as SelectOptionType,
  SelectOptionGroup,
  SelectOptionProps,
  SelectOptGroupProps,
  SelectSearchState,
  SelectDropdownState,
} from './types';

// Export constants
export {
  SELECT_DEFAULTS,
  SIZE_MAP,
  SELECT_CSS_PREFIX,
  SELECT_CSS_VARS,
} from './types';

// Export compound components
export { SelectOption, SelectOptGroup };

// Export base component
export { BaseSelect } from './base';

// Create engine-aware Select component
export const Select = Object.assign(
  createEngineComponent<SelectProps>('Select', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    Option: SelectOption,
    OptGroup: SelectOptGroup,
  }
);
