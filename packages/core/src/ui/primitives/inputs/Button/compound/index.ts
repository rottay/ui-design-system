/**
 * @fileoverview Button Compound Components - Rottay Design System
 * @description Compound components that extend Button functionality.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module exports compound components that work with the Button component
 * to provide enhanced functionality:
 *
 * - **ButtonGroup**: Groups multiple buttons with consistent spacing or connected styling
 * - **ButtonIcon**: Specialized icon-only button with required accessibility label
 *
 * These compound components can be accessed via `Button.Group` and `Button.Icon`
 * after importing the main Button component.
 *
 * @example Using Compound Components
 * ```tsx
 * import { Button } from '@rottay/design-system';
 *
 * // Button Group
 * <Button.Group orientation="horizontal" connected>
 *   <Button>First</Button>
 *   <Button>Second</Button>
 *   <Button>Third</Button>
 * </Button.Group>
 *
 * // Icon Button
 * <Button.Icon
 *   icon={<EditIcon />}
 *   aria-label="Edit item"
 *   onClick={handleEdit}
 * />
 * ```
 *
 * @see {@link Button} for the main component
 * @see {@link ButtonGroup} for grouping buttons
 * @see {@link ButtonIcon} for icon-only buttons
 * @module ButtonCompound
 * @category Inputs
 * @package @rottay/design-system
 */

// ============================================================================
// COMPOUND COMPONENT EXPORTS
// ============================================================================

export { ButtonGroup } from './Group';
export { ButtonIcon } from './Icon';

export type { ButtonGroupProps } from './Group';
export type { ButtonIconProps } from './Icon';
