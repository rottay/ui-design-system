/**
 * Input - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { InputProps } from './types';
import { InputGroup, InputAddon, InputPassword, InputSearch, InputTextArea } from './compound';

// Export types
export type {
  InputProps,
  InputSize,
  InputVariant,
  InputStatus,
  InputType,
  InputGroupProps,
  InputAddonProps,
} from './types';
export { INPUT_DEFAULTS } from './types';

// Export compound components
export { InputGroup, InputAddon, InputPassword, InputSearch, InputTextArea };

// Export base component
export { BaseInput } from './base';

// Create engine-aware Input component
export const Input = Object.assign(
  createEngineComponent<InputProps>('Input', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    Group: InputGroup,
    Addon: InputAddon,
    Password: InputPassword,
    Search: InputSearch,
    TextArea: InputTextArea,
  }
);
