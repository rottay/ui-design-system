'use client';

/**
 * @fileoverview OTPInput - Rottay Design System
 * @description One-time password / verification code input with auto-advance.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The OTPInput component provides individual digit input boxes that
 * auto-advance on type and support paste for verification codes.
 *
 * **Multi-Engine Architecture:**
 * - **Classic**: Styled with Ant Design tokens
 * - **Modern**: custom skin-painted inputs (no DaisyUI), density-scaled sizing
 * - **Rustic**: Pure CSS with comprehensive a11y support
 *
 * @example Basic Usage
 * ```tsx
 * import { OTPInput } from '@rottay/design-system';
 *
 * const [code, setCode] = useState('');
 *
 * <OTPInput
 *   length={6}
 *   value={code}
 *   onChange={setCode}
 *   onComplete={(value) => verifyCode(value)}
 *   autoFocus
 * />
 * ```
 *
 * @module OTPInput
 * @category Inputs
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { OTPInputProps } from './contracts';

export {
  type OTPInputProps,
  type OTPInputType,
  type OTPInputSize,
  OTPINPUT_DEFAULTS,
} from './contracts';

export const OTPInput = createEngineComponent<OTPInputProps>('OTPInput', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

OTPInput.displayName = 'OTPInput';
