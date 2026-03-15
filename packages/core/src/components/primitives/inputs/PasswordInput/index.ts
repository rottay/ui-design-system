'use client';

/**
 * @fileoverview PasswordInput - Rottay Design System
 * @description Password input field with visibility toggle and optional strength indicator.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The PasswordInput component wraps a standard text input with password-specific
 * features: a show/hide toggle button (eye icon), and an optional password strength
 * indicator bar. It supports controlled and uncontrolled modes.
 *
 * **Multi-Engine Architecture:**
 * - **Classic**: Wraps Ant Design Input.Password with strength indicator
 * - **Modern**: DaisyUI input with toggle button and strength bar
 * - **Rustic**: Pure CSS implementation with full a11y support
 *
 * @example Basic PasswordInput
 * ```tsx
 * import { PasswordInput } from '@rottay/design-system';
 *
 * <PasswordInput
 *   placeholder="Enter password"
 *   onChange={(value) => setPassword(value)}
 * />
 * ```
 *
 * @example With Strength Indicator
 * ```tsx
 * <PasswordInput
 *   placeholder="Create password"
 *   strengthIndicator
 *   strengthLevel="good"
 *   onChange={(value) => setPassword(value)}
 * />
 * ```
 *
 * @module PasswordInput
 * @category Inputs
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../engines/factory';
import type { PasswordInputProps } from './PasswordInput.types';

export {
  type PasswordInputProps,
  type PasswordInputSize,
  type PasswordInputVariant,
  type PasswordStrengthLevel,
  PASSWORD_INPUT_DEFAULTS,
  STRENGTH_COLORS,
  STRENGTH_WIDTHS,
} from './PasswordInput.types';


export const PasswordInput = createEngineComponent<PasswordInputProps>('PasswordInput', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

PasswordInput.displayName = 'PasswordInput';
