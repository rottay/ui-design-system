'use client';

/**
 * @fileoverview Steps Rustic Engine - Rottay Design System
 * @description Vanilla HTML/CSS implementation of the Steps component.
 * Zero external dependencies for maximum accessibility and customization.
 *
 * @remarks
 * The Rustic engine provides a pure HTML/CSS implementation, offering:
 * - Zero external dependencies
 * - Maximum accessibility compliance
 * - Complete styling control via inline styles
 * - Semantic HTML structure (ordered list)
 * - No CSS framework requirements
 *
 * This implementation is ideal for projects requiring full control over
 * styling or those that cannot include external UI libraries.
 *
 * @example
 * ```tsx
 * // Use Rustic engine for vanilla implementation
 * <Steps
 *   engine="rustic"
 *   items={[
 *     { title: 'Step 1', description: 'First step' },
 *     { title: 'Step 2', description: 'Second step' },
 *   ]}
 *   current={0}
 * />
 * ```
 *
 * @see {@link StepsProps} for prop documentation
 *
 * @module Steps/Engines/Rustic
 * @category Navigation
 * @package @rottay/design-system
 */

import React, { useMemo } from 'react';
import type { StepsProps, StepStatus, ProgressDotInfo } from '../Steps.types';
import { STEPS_DEFAULTS } from '../Steps.types';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Gets the color scheme for a step based on its status.
 *
 * @param status - The step status
 * @returns Object containing background, border, and text colors
 */
const getStatusColors = (status: StepStatus) => {
  switch (status) {
    case 'finish':
      return {
        bg: 'var(--ds-steps-finish-bg, var(--ds-color-primary-500, var(--ds-color-primary)))',
        border: 'var(--ds-steps-finish-border, var(--ds-color-primary-500, var(--ds-color-primary)))',
        text: 'var(--ds-steps-finish-text, var(--ds-color-text-on-primary, var(--ds-color-text-inverse)))'
      };
    case 'process':
      return {
        bg: 'var(--ds-steps-process-bg, var(--ds-color-bg-elevated, var(--ds-color-bg-primary)))',
        border: 'var(--ds-steps-process-border, var(--ds-color-primary-500, var(--ds-color-primary)))',
        text: 'var(--ds-steps-process-text, var(--ds-color-primary-500, var(--ds-color-primary)))'
      };
    case 'error':
      return {
        bg: 'var(--ds-steps-error-bg, var(--ds-color-bg-elevated, var(--ds-color-bg-primary)))',
        border: 'var(--ds-steps-error-border, var(--ds-color-error-500, var(--ds-color-error)))',
        text: 'var(--ds-steps-error-text, var(--ds-color-error-500, var(--ds-color-error)))'
      };
    default:
      return {
        bg: 'var(--ds-steps-wait-bg, var(--ds-color-bg-elevated, var(--ds-color-bg-primary)))',
        border: 'var(--ds-steps-wait-border, var(--ds-color-border-secondary, var(--ds-color-neutral-300)))',
        text: 'var(--ds-steps-wait-text, var(--ds-color-text-tertiary, var(--ds-color-text-secondary)))'
      };
  }
};

/**
 * Calculates the effective status for a step based on its position.
 *
 * @param index - Step index
 * @param current - Current active step
 * @param itemStatus - Optional explicit status for the step
 * @param overallStatus - Overall status applied to current step
 * @returns The effective status to display
 */
const getEffectiveStatus = (
  index: number,
  current: number,
  itemStatus?: StepStatus,
  overallStatus?: StepStatus
): StepStatus => {
  // Explicit status takes precedence
  if (itemStatus) return itemStatus;
  // Steps before current are finished
  if (index < current) return 'finish';
  // Current step uses overall status
  if (index === current) return overallStatus ?? 'process';
  // Future steps are waiting
  return 'wait';
};

// ============================================================================
// Rustic Engine Component
// ============================================================================

/**
 * Steps component - Rustic Engine (Vanilla HTML/CSS)
 *
 * @description
 * Pure HTML/CSS implementation with zero dependencies.
 * Provides semantic markup and full accessibility support.
 *
 * @remarks
 * Features supported:
 * - Horizontal and vertical layouts
 * - Size variants (default, small)
 * - All status types with appropriate colors
 * - Progress dot mode (boolean and function)
 * - Custom icons
 * - Clickable steps with onChange
 * - Connecting lines between steps
 * - Disabled step styling
 *
 * Uses semantic <ol> element for proper accessibility.
 *
 * @param props - {@link StepsProps}
 * @returns Steps component rendered with vanilla HTML/CSS
 */
export const Steps = React.forwardRef<HTMLOListElement, StepsProps>(
  (props, ref) => {
    // ========================================================================
    // Props Destructuring with Defaults
    // ========================================================================

    const {
      current = STEPS_DEFAULTS.current!,
      direction = STEPS_DEFAULTS.direction,
      size = STEPS_DEFAULTS.size,
      status: overallStatus = STEPS_DEFAULTS.status,
      progressDot,
      onChange,
      items,
      className,
      style,
    } = props;

    // ========================================================================
    // Computed Values
    // ========================================================================

    /** Whether layout is vertical */
    const isVertical = direction === 'vertical';

    /** Whether using small size variant */
    const isSmall = size === 'small';

    // ========================================================================
    // Memoized Step Computation
    // ========================================================================

    /**
     * Compute effective status for each step.
     * Memoized to prevent unnecessary recalculations.
     */
    const computedSteps = useMemo(() => {
      return items.map((item, index) => ({
        ...item,
        effectiveStatus: getEffectiveStatus(index, current, item.status, overallStatus),
      }));
    }, [items, current, overallStatus]);

    // ========================================================================
    // Event Handlers
    // ========================================================================

    /**
     * Handle step click for navigation.
     * Only triggers onChange if step is not disabled.
     */
    const handleStepClick = (index: number, disabled?: boolean) => {
      if (!disabled && onChange) onChange(index);
    };

    // ========================================================================
    // Container Styles
    // ========================================================================

    /** Styles for the root container */
    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: isVertical ? 'column' : 'row',
      listStyle: 'none',
      margin: 0,
      padding: 0,
      width: '100%',
      ...style,
    };

    // ========================================================================
    // Render
    // ========================================================================

    return (
      <ol ref={ref} className={className} style={containerStyle}>
        {computedSteps.map((step, index) => {
          const colors = getStatusColors(step.effectiveStatus);
          const isLast = index === items.length - 1;
          const isClickable = !step.disabled && onChange;

          // ====================================================================
          // Icon Rendering Logic
          // ====================================================================

          /**
           * Renders the step icon based on configuration.
           * Handles: custom progressDot function, boolean progressDot,
           * custom icon, or default numbered step.
           */
          const renderIcon = () => {
            // Custom progress dot render function
            if (typeof progressDot === 'function') {
              const dotInfo: ProgressDotInfo = {
                index,
                status: step.effectiveStatus,
                title: step.title ?? '',
                description: step.description ?? '',
              };
              return (
                <span style={{ width: 8, height: 8, borderRadius: '50%', marginRight: 8 }}>
                  {progressDot(dotInfo)}
                </span>
              );
            }

            // Boolean progress dot - simple circle
            if (progressDot) {
              return (
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: colors.border,
                    marginRight: 8,
                    marginTop: 4,
                  }}
                />
              );
            }

            // Custom icon provided
            if (step.icon) {
              return (
                <span
                  style={{
                    width: isSmall ? 24 : 32,
                    height: isSmall ? 24 : 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8,
                    border: '2px solid',
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                    color: colors.text,
                    fontSize: isSmall ? 12 : 14,
                    fontWeight: 500,
                  }}
                >
                  {step.icon}
                </span>
              );
            }

            // Default: numbered step with status indicator
            const displayNumber = step.effectiveStatus === 'finish'
              ? '✓'
              : step.effectiveStatus === 'error'
                ? '✕'
                : index + 1;

            return (
              <span
                style={{
                  width: isSmall ? 24 : 32,
                  height: isSmall ? 24 : 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8,
                  border: '2px solid',
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                  fontSize: isSmall ? 12 : 14,
                  fontWeight: 500,
                }}
              >
                {displayNumber}
              </span>
            );
          };

          // ====================================================================
          // Step Item Render
          // ====================================================================

          return (
            <li
              key={index}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'flex-start',
                position: 'relative',
                opacity: step.disabled ? 0.5 : 1,
                cursor: isClickable ? 'pointer' : 'default',
                ...(isVertical && { flex: 'none', minHeight: 64, marginBottom: 8 }),
              }}
              onClick={() => handleStepClick(index, step.disabled)}
            >
              {/* Step icon */}
              {renderIcon()}

              {/* Step content */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Title and subtitle */}
                <span
                  style={{
                    fontSize: isSmall ? 12 : 14,
                    fontWeight: 500,
                    color: step.effectiveStatus === 'error'
                      ? 'var(--ds-steps-error-text, var(--ds-color-error-500, var(--ds-color-error)))'
                      : 'var(--ds-steps-title-color, var(--ds-color-text-primary, var(--ds-color-text)))',
                  }}
                >
                  {step.title}
                  {step.subTitle && (
                    <span style={{ fontSize: 12, color: 'var(--ds-steps-subtitle-color, var(--ds-color-text-tertiary, var(--ds-color-text-secondary)))', marginLeft: 8 }}>
                      {step.subTitle}
                    </span>
                  )}
                </span>

                {/* Description */}
                {step.description && (
                  <span style={{ fontSize: 12, color: 'var(--ds-steps-description-color, var(--ds-color-text-tertiary, var(--ds-color-text-secondary)))', marginTop: 4 }}>
                    {step.description}
                  </span>
                )}
              </div>

              {/* Connecting line to next step */}
              {!isLast && (
                <span
                  style={{
                    position: 'absolute',
                    height: isVertical ? 'calc(100% - 32px)' : 2,
                    width: isVertical ? 2 : undefined,
                    top: isVertical ? 40 : 15,
                    left: isVertical ? 15 : 40,
                    right: isVertical ? 'auto' : 8,
                    backgroundColor: index < current
                      ? 'var(--ds-steps-connector-finish, var(--ds-color-primary-500, var(--ds-color-primary)))'
                      : 'var(--ds-steps-connector-wait, var(--ds-color-border-primary, var(--ds-color-neutral-200)))',
                  }}
                />
              )}
            </li>
          );
        })}
      </ol>
    );
  }
);

// ============================================================================
// Display Name
// ============================================================================

Steps.displayName = 'Steps.Rustic';

export default Steps;
