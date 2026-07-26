/**
 * @fileoverview ButtonIcon - Rottay Design System
 * @description Icon-only button variant with required accessibility label.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * ButtonIcon provides a specialized button designed for icon-only actions.
 * Unlike regular buttons with text, this component requires an `aria-label`
 * prop to ensure accessibility for screen reader users.
 *
 * **Key Features:**
 * - Square aspect ratio (width equals height)
 * - Required aria-label for accessibility
 * - Optional tooltip for sighted users
 * - All standard button states (hover, active, disabled, loading)
 * - Size and variant customization
 *
 * **Accessibility Requirements:**
 * - `aria-label` is REQUIRED and enforced via TypeScript
 * - Use descriptive labels that explain the action, not the icon
 * - Good: "Delete item", Bad: "Trash icon"
 *
 * **CSS Custom Properties:**
 * - `--ds-button-spinner-size-{size}` - Loading spinner size per button size
 *
 * @example Basic Icon Button
 * ```tsx
 * import { Button } from '@rottay/design-system';
 * import { EditIcon } from '@rottay/icons';
 *
 * <Button.Icon
 *   icon={<EditIcon />}
 *   aria-label="Edit document"
 *   onClick={handleEdit}
 * />
 * ```
 *
 * @example With Tooltip and Variants
 * ```tsx
 * import { Button } from '@rottay/design-system';
 * import { TrashIcon, SettingsIcon } from '@rottay/icons';
 *
 * // Danger variant with tooltip
 * <Button.Icon
 *   icon={<TrashIcon />}
 *   aria-label="Delete item"
 *   variant="danger"
 *   tooltip="Delete this item permanently"
 *   onClick={handleDelete}
 * />
 *
 * // Ghost variant for subtle actions
 * <Button.Icon
 *   icon={<SettingsIcon />}
 *   aria-label="Open settings"
 *   variant="ghost"
 *   size="sm"
 * />
 * ```
 *
 * @see {@link Button} for the main component
 * @see {@link ButtonGroup} for grouping buttons
 * @module ButtonIcon
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { ReactNode, CSSProperties, MouseEvent, PointerEvent } from 'react';
import type { ButtonSize, ButtonVariant } from '../../contracts';
import ModernButton from '../../engines/modern';
import { ModernTooltip } from '../../../../facade';
import { useOptionalTokens } from '@/infrastructure/runtime/theming/composition/react/tokens';
import {
  mergePersonalityStyle,
  resolveButtonPersonalityStyle,
} from '@/foundation/tokens/ts/runtime/personality';

export interface ButtonIconProps {
  /** Icon to display */
  icon: ReactNode;
  /** Click handler */
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  /**
   * Pointer-down handler. An icon button inside a draggable surface needs it
   * to shield itself from the surrounding drag gesture; the primitive still
   * owns its own press motion either way.
   */
  onPointerDown?: (e: PointerEvent<HTMLButtonElement>) => void;
  /** Button size */
  size?: ButtonSize;
  /** Button variant */
  variant?: ButtonVariant;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Whether button is loading */
  loading?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Accessibility label (required) */
  'aria-label': string;
  /** Tooltip text */
  tooltip?: string;
}

/**
 * Icon-only button component. It intentionally composes the same Modern
 * primitive as labelled Button instead of maintaining a second paint engine:
 * focus, busy, forced-colors, tenant chrome and motion therefore cannot drift.
 */
export const ButtonIcon = forwardRef<HTMLButtonElement, ButtonIconProps>(
  (
    {
      icon,
      onClick,
      onPointerDown,
      size = 'md',
      variant = 'default',
      disabled = false,
      loading = false,
      className = '',
      style,
      'aria-label': ariaLabel,
      tooltip,
    },
    ref
  ) => {
    const tokens = useOptionalTokens();
    const resolvedStyle = tokens
      ? mergePersonalityStyle(style, resolveButtonPersonalityStyle(tokens))
      : style;

    const control = (
      <ModernButton
        ref={ref as React.ForwardedRef<HTMLButtonElement | HTMLAnchorElement>}
        className={`rottay-button-icon ds-button-icon ${className}`}
        size={size}
        variant={variant}
        shape="default"
        icon={icon}
        loading={loading}
        disabled={disabled}
        onClick={onClick}
        onPointerDown={onPointerDown}
        style={resolvedStyle}
        aria-label={ariaLabel}
      />
    );

    return tooltip ? (
      <ModernTooltip content={tooltip} recipe="bordered" placement="top">
        {control}
      </ModernTooltip>
    ) : control;
  }
);

ButtonIcon.displayName = 'Button.Icon';
