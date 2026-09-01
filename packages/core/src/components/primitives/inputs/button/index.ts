'use client';

/**
 * @fileoverview Button - Rottay Design System
 * @description Primary interactive element for user actions and form submissions.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Button component is one of the most fundamental UI elements, designed for
 * triggering actions or navigating within an application. It supports multiple
 * visual variants, sizes, shapes, and states to accommodate various use cases.
 *
 * **Multi-Engine Architecture:**
 * - **Classic** (Ant Design): Full-featured enterprise button with rich animations
 * - **Modern** (DaisyUI/Tailwind): Lightweight utility-first button styling
 * - **Rustic** (Vanilla HTML/CSS): Headless implementation with maximum accessibility
 *
 * **Multi-Tenant Support:**
 * Button appearance automatically adapts to the active tenant's theme through
 * CSS custom properties (--ds-button-*), ensuring consistent branding across tenants.
 *
 * @example Basic Usage
 * ```tsx
 * import { Button } from '@rottay/design-system';
 *
 * // Primary button (default)
 * <Button onClick={handleClick}>Click Me</Button>
 *
 * // Different variants
 * <Button variant="secondary">Secondary</Button>
 * <Button variant="outline">Outline</Button>
 * <Button variant="danger">Delete</Button>
 * ```
 *
 * @example With Icons and Loading State
 * ```tsx
 * import { Button } from '@rottay/design-system';
 * import { SaveIcon, TrashIcon } from '@rottay/icons';
 *
 * // Button with leading icon
 * <Button icon={<SaveIcon />}>Save Changes</Button>
 *
 * // Button with trailing icon
 * <Button icon={<TrashIcon />} iconPosition="end">Delete</Button>
 *
 * // Loading state
 * <Button loading>Processing...</Button>
 * ```
 *
 * @example Button Group
 * ```tsx
 * import { Button } from '@rottay/design-system';
 *
 * // Horizontal button group
 * <Button.Group>
 *   <Button>Left</Button>
 *   <Button>Center</Button>
 *   <Button>Right</Button>
 * </Button.Group>
 *
 * // Connected buttons (no gaps)
 * <Button.Group connected>
 *   <Button variant="outline">One</Button>
 *   <Button variant="outline">Two</Button>
 *   <Button variant="outline">Three</Button>
 * </Button.Group>
 * ```
 *
 * @example Icon-Only Button
 * ```tsx
 * import { Button } from '@rottay/design-system';
 * import { SettingsIcon } from '@rottay/icons';
 *
 * <Button.Icon
 *   icon={<SettingsIcon />}
 *   aria-label="Open settings"
 *   onClick={openSettings}
 * />
 * ```
 *
 * @see {@link ButtonGroup} for grouping multiple buttons
 * @see {@link ButtonIcon} for icon-only buttons
 * @see {@link Link} for navigation-focused actions
 * @module Button
 * @category Inputs
 * @package @rottay/design-system
 */

import { createElement, forwardRef } from 'react';

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import { useOptionalTokens } from '@/infrastructure/runtime/theming/composition/react/tokens';
import {
  mergePersonalityStyle,
  resolveButtonPersonalityStyle,
} from '@/foundation/tokens/ts/runtime/personality';
import type { ButtonProps } from './contracts';
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
} from './contracts';
export { BUTTON_DEFAULTS, SIZE_MAP, VARIANT_MAP, SHAPE_MAP } from './contracts';

// Export compound components
export { ButtonGroup, ButtonIcon };
export type { ButtonGroupProps, ButtonIconProps } from './compound';

/**
 * Internal engine-routed button primitive.
 *
 * Keeping the engine selection isolated here makes it easier to layer tenant
 * personality on top without leaking that resolution into each engine file.
 */
const ButtonBase = createEngineComponent<ButtonProps>('Button', {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  });

/**
 * Public Button wrapper.
 *
 * This is the seam where global token context can tune hover behavior or
 * motion without each engine needing direct access to the full token object.
 */
const ButtonComponent = forwardRef<any, ButtonProps>((props, ref) => {
  const tokens = useOptionalTokens();
  const { style, ...rest } = props;

  return createElement(ButtonBase, {
    ref,
    ...rest,
    // Personality-driven interaction styles are merged once here so every
    // engine inherits the same behavioral contract.
    style: tokens ? mergePersonalityStyle(style, resolveButtonPersonalityStyle(tokens)) : style,
  });
});

ButtonComponent.displayName = 'Button';

export const Button = Object.assign(
  ButtonComponent,
  {
    /** Layout helper for grouping related actions under the same visual rhythm. */
    Group: ButtonGroup,
    /** Compact icon-only button that still participates in Button sizing rules. */
    Icon: ButtonIcon,
  }
);
