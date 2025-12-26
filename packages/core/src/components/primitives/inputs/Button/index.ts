/**
 * Button - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { ButtonProps } from './types';
import { ButtonGroup, ButtonIcon } from './compound';

// Export types
export type {
  ButtonProps,
  ButtonSize,
  ButtonVariant,
  ButtonShape,
  ButtonHtmlType,
  ButtonGroupProps as ButtonGroupPropsType,
  IconButtonProps,
  ButtonLoadingConfig,
} from './types';
export { BUTTON_DEFAULTS, SIZE_MAP, VARIANT_MAP, SHAPE_MAP } from './types';

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
