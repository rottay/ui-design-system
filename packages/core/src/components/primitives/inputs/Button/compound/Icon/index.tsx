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
import type { ReactNode, CSSProperties, MouseEvent } from 'react';
import type { ButtonSize, ButtonVariant } from '../../Button.types';
import { SIZE_MAP, VARIANT_MAP } from '../../Button.types';

export interface ButtonIconProps {
  /** Icon to display */
  icon: ReactNode;
  /** Click handler */
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
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
 * Spinner size mapping to CSS variables
 */
const SPINNER_SIZE_MAP = {
  xs: 'var(--ds-button-spinner-size-xs)',
  sm: 'var(--ds-button-spinner-size-sm)',
  md: 'var(--ds-button-spinner-size-md)',
  lg: 'var(--ds-button-spinner-size-lg)',
  xl: 'var(--ds-button-spinner-size-xl)',
};

/**
 * Loading spinner for icon button
 */
const LoadingSpinner: React.FC<{ size: keyof typeof SPINNER_SIZE_MAP }> = ({ size }) => {
  const spinnerSize = SPINNER_SIZE_MAP[size] || SPINNER_SIZE_MAP.md;
  return (
    <svg
      data-part="spinner"
      width={spinnerSize}
      height={spinnerSize}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'rottay-button-spin 1s linear infinite' }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.416"
        strokeDashoffset="25"
      />
    </svg>
  );
};

/**
 * Icon-only button component
 */
export const ButtonIcon = forwardRef<HTMLButtonElement, ButtonIconProps>(
  (
    {
      icon,
      onClick,
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
    // Get size configuration
    const sizeConfig = SIZE_MAP[size as keyof typeof SIZE_MAP] || SIZE_MAP.md;
    const buttonSize = sizeConfig.height;

    // Get variant colors
    const variantConfig = VARIANT_MAP[variant as keyof typeof VARIANT_MAP] || VARIANT_MAP.default;

    const buttonStyle: CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: buttonSize,
      height: buttonSize,
      minWidth: buttonSize,
      padding: 0,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.2s ease',
      ...({
        '--ds-button-icon-bg': variantConfig.bg,
        '--ds-button-icon-hover-bg': variantConfig.hoverBg,
        '--ds-button-icon-border': variant === 'ghost' || variant === 'text' || variant === 'link'
          ? 'none'
          : `1px solid ${variantConfig.borderColor}`,
        '--ds-button-icon-color': variantConfig.color,
      } as CSSProperties),
      ...style,
    };

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        className={`rottay-button-icon ds-button-icon rottay-button-icon--${size} rottay-button-icon--${variant} ${className}`}
        data-part="trigger"
        data-variant={variant}
        data-disabled={disabled || loading ? 'true' : 'false'}
        data-loading={loading ? 'true' : 'false'}
        style={buttonStyle}
        onClick={handleClick}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        title={tooltip}
      >
        {loading ? <LoadingSpinner size={size as keyof typeof SPINNER_SIZE_MAP} /> : icon}
      </button>
    );
  }
);

ButtonIcon.displayName = 'Button.Icon';
