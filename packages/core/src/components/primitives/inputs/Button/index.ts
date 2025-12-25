/**
 * Button - Engine Router
 * Exports the engine-routed Button component
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { ButtonProps } from './types';
import { ButtonGroup, ButtonIcon } from './compound';

export { type ButtonProps, type ButtonVariant, type ButtonSize, BUTTON_DEFAULTS } from './types';

// Export compound components
export { ButtonGroup, ButtonIcon };
export type { ButtonGroupProps, ButtonIconProps } from './compound';

// Export base component
export { BaseButton } from './base';

// Create engine-aware Button component with compound components attached
export const Button = Object.assign(
  createEngineComponent<ButtonProps>('Button', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    Group: ButtonGroup,
    Icon: ButtonIcon,
  }
);
