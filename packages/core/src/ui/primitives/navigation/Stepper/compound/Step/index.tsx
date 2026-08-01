/**
 * @fileoverview Stepper.Step Compound Component - Rottay Design System
 * @description Individual step component for use within a Stepper.
 * Renders the step indicator, title, description, and connector line.
 *
 * @remarks
 * This component is designed to be used as a child of the Stepper component.
 * It receives internal props from the parent Stepper for proper rendering.
 * The component supports all step statuses (wait, process, finish, error)
 * and provides visual feedback through colors and icons.
 *
 * @example
 * ```tsx
 * <Stepper current={1}>
 *   <Stepper.Step title="Account" description="Create your account" />
 *   <Stepper.Step title="Profile" description="Complete profile" />
 *   <Stepper.Step title="Done" description="All finished" />
 * </Stepper>
 * ```
 *
 * @example With Custom Icon
 * ```tsx
 * <Stepper.Step
 *   title="Upload"
 *   description="Upload your files"
 *   icon={<CloudUploadIcon />}
 * />
 * ```
 *
 * @example With Status Override
 * ```tsx
 * <Stepper.Step
 *   title="Validation"
 *   description="Error in form"
 *   status="error"
 * />
 * ```
 *
 * @see {@link StepProps} for complete prop documentation
 * @see {@link Stepper} for parent component
 *
 * @module Stepper/Step
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { StepProps } from '../../contracts';
import { SIZE_MAP } from '../../contracts';
import { ActionConfirmIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-confirm';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';

// ============================================================================
// Internal Props Interface
// ============================================================================

/**
 * Extended props including internal properties set by parent Stepper.
 * @internal
 */
interface StepInternalProps extends StepProps {
  /** Size inherited from Stepper */
  size?: 'sm' | 'md' | 'lg';
  /** Step number (1-based) for display */
  stepNumber?: number;
  /** Direction inherited from Stepper */
  direction?: 'horizontal' | 'vertical';
  /** Variant inherited from Stepper */
  variant?: 'default' | 'simple' | 'circles';
  /** Label placement relative to icon */
  labelPlacement?: 'horizontal' | 'vertical';
  /** Whether this is the last step (no connector) */
  isLast?: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Individual step component for the Stepper.
 *
 * @description
 * Renders a single step with:
 * - Step indicator (number, icon, or status icon)
 * - Title and optional subtitle
 * - Optional description
 * - Connector line to next step
 *
 * @remarks
 * - Supports keyboard navigation (Enter/Space to activate)
 * - Includes ARIA attributes for accessibility
 * - Status glyphs are the governed `action.confirm` / `action.close` facade
 *   roles (the former local SVG pair violated the icons law); the indicator
 *   geometry, typography, connector and every state transition live in
 *   `stepper-compounds.css`, keyed on the stamped `data-size` /
 *   `data-direction` / `data-label-placement` / `data-status` hooks — no
 *   inline paint, no raw durations, logical properties only.
 *
 * @param props - {@link StepInternalProps}
 * @returns Individual step element with indicator and content
 */
export function StepperStep({
  title,
  description,
  subTitle,
  icon,
  status = 'wait',
  disabled = false,
  stepIndex = 0,
  active = false,
  onClick,
  size = 'md',
  stepNumber = 1,
  direction = 'horizontal',
  variant = 'default',
  labelPlacement = 'horizontal',
  isLast = false,
  className = '',
  style,
  children,
  // Caller passthrough (id / aria-* / data-* / data-testid): forwarded to the
  // step root element, BEFORE the engine's own stamps.
  ...rest
}: StepInternalProps): React.ReactElement {
  // Get size values from mappings
  const iconSize = SIZE_MAP[size];

  const isClickable = Boolean(onClick) && !disabled;

  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Handles click events on the step.
   * Only triggers if step is not disabled and has an onClick handler.
   */
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  /**
   * Handles keyboard events for accessibility.
   * Supports Enter and Space key activation.
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  // ============================================================================
  // Icon Renderer
  // ============================================================================

  /**
   * Renders the step icon based on status and custom icon prop. The default
   * status glyphs are the governed facade roles (`action.confirm` checks a
   * finished step, `action.close` crosses an errored one — the bare-glyph
   * equivalents of the former local SVG pair, sized from the contract's
   * SIZE_MAP as instance geometry, never paint).
   */
  const renderIcon = () => {
    if (icon) {
      return icon;
    }

    if (status === 'finish' && variant !== 'simple') {
      return <ActionConfirmIcon decorative size={iconSize * 0.5} />;
    }

    if (status === 'error') {
      return <ActionCloseIcon decorative size={iconSize * 0.5} />;
    }

    return <span>{stepNumber}</span>;
  };

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <>
      <div
        {...rest}
        className={`rottay-stepper-step rottay-stepper-step--${status} ${active ? 'rottay-stepper-step--active' : ''} ${disabled ? 'rottay-stepper-step--disabled' : ''} ${className}`}
        style={style}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={onClick ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        aria-disabled={disabled}
        aria-current={status === 'process' ? 'step' : undefined}
        data-step={stepIndex}
        data-part="item"
        data-status={status}
        data-active={active || undefined}
        data-disabled={disabled || undefined}
        data-clickable={isClickable || undefined}
        data-size={size}
        data-direction={direction}
        data-label-placement={labelPlacement}
        data-last={isLast || undefined}
      >
        {/* Step Icon/Number */}
        <div className="rottay-stepper-step__icon" data-part="icon" data-variant={variant}>
          {renderIcon()}
        </div>

        {/* Step Content */}
        <div className="rottay-stepper-step__content">
          <div className="rottay-stepper-step__title" data-part="label">
            {title}
            {subTitle && (
              <span className="rottay-stepper-step__subtitle" data-part="subtitle">
                {subTitle}
              </span>
            )}
          </div>
          {description && (
            <div className="rottay-stepper-step__description" data-part="description">
              {description}
            </div>
          )}
        </div>

        {/* Additional Children */}
        {children}
      </div>

      {/* Connector line (never after the last step). The skin owns the box
          and the fill per `data-direction`/`data-status`; the vertical
          orientation used to be a dead inline branch — it renders now. */}
      {!isLast && (
        <div
          className="rottay-stepper-connector"
          data-part="connector"
          data-status={status}
          data-direction={direction}
          data-size={size}
        />
      )}
    </>
  );
}

// Set display name for compound component identification
StepperStep.displayName = 'Stepper.Step';
