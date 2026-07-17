/**
 * @fileoverview Stepper.Content Compound Component - Rottay Design System
 * @description Content panel component for use within a Stepper.
 * Displays content associated with a specific step and supports animations.
 *
 * @remarks
 * This component is designed to be used as a child of the Stepper component.
 * It automatically shows/hides based on the current step index.
 * Supports fade and slide animations for smooth transitions between steps.
 *
 * @example Basic Usage
 * ```tsx
 * <Stepper current={currentStep}>
 *   <Stepper.Step title="Step 1" />
 *   <Stepper.Step title="Step 2" />
 *
 *   <Stepper.Content stepIndex={0}>
 *     <FirstStepForm />
 *   </Stepper.Content>
 *   <Stepper.Content stepIndex={1}>
 *     <SecondStepForm />
 *   </Stepper.Content>
 * </Stepper>
 * ```
 *
 * @example With Slide Animation
 * ```tsx
 * <Stepper.Content stepIndex={0} animation="slide">
 *   <SlideTransitionContent />
 * </Stepper.Content>
 * ```
 *
 * @example Keep Mounted for Form State
 * ```tsx
 * <Stepper.Content stepIndex={0} keepMounted>
 *   <FormWithPersistedState />
 * </Stepper.Content>
 * ```
 *
 * @see {@link StepContentProps} for complete prop documentation
 * @see {@link Stepper} for parent component
 *
 * @module Stepper/Content
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React, { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import type { StepContentProps } from '../../contracts';

// ============================================================================
// Internal Props Interface
// ============================================================================

/**
 * Extended props including internal properties set by parent Stepper.
 * @internal
 */
interface StepContentInternalProps extends StepContentProps {
  /** Current active step (set by parent) */
  currentStep?: number;
  /** Previous step for animation direction */
  previousStep?: number;
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Content panel for a specific step in the Stepper.
 *
 * @description
 * Provides animated content panels that display based on the current step.
 * Features include:
 * - Fade or slide animations between steps
 * - Option to keep content mounted for state preservation
 * - Automatic show/hide based on step index
 *
 * @remarks
 * - Animation direction is determined by step navigation direction
 * - Uses CSS transitions for smooth animations
 * - Content is unmounted when inactive (unless keepMounted is true)
 *
 * @param props - {@link StepContentInternalProps}
 * @returns Content panel element or null when hidden
 */
export function StepperContent({
  stepIndex,
  animation = 'fade',
  keepMounted = false,
  currentStep = 0,
  previousStep = 0,
  children,
  className = '',
  style,
}: StepContentInternalProps): React.ReactElement | null {
  // ============================================================================
  // State Management
  // ============================================================================

  /** Controls whether the content should be rendered in the DOM */
  const [shouldRender, setShouldRender] = useState(stepIndex === currentStep);

  /** Animation state for managing transitions */
  const [animationState, setAnimationState] = useState<'entering' | 'visible' | 'exiting' | 'hidden'>(
    stepIndex === currentStep ? 'visible' : 'hidden'
  );

  /** Whether this content is for the active step */
  const isActive = stepIndex === currentStep;

  /** Direction of navigation for slide animation */
  const direction = currentStep > previousStep ? 'forward' : 'backward';

  // ============================================================================
  // Animation Effect
  // ============================================================================

  /**
   * Handles animation transitions when active state changes.
   * Manages entering/exiting animations and DOM mounting.
   */
  useEffect(() => {
    if (isActive) {
      // Content is becoming active - mount and animate in
      setShouldRender(true);
      // Small delay to trigger enter animation
      requestAnimationFrame(() => {
        setAnimationState('entering');
        // After animation completes, set to visible
        setTimeout(() => {
          setAnimationState('visible');
        }, 200);
      });
    } else {
      // Content is becoming inactive - animate out
      setAnimationState('exiting');
      // Wait for exit animation before unmounting
      setTimeout(() => {
        setAnimationState('hidden');
        if (!keepMounted) {
          setShouldRender(false);
        }
      }, 200);
    }
  }, [isActive, keepMounted]);

  // ============================================================================
  // Render Logic
  // ============================================================================

  // Don't render if not active and not keeping mounted
  if (!shouldRender && !keepMounted) {
    return null;
  }

  // ============================================================================
  // Animation Styles
  // ============================================================================

  /**
   * Computes animation styles based on current animation state and type.
   */
  const getAnimationStyles = (): CSSProperties => {
    // No animation - simple show/hide
    if (animation === 'none') {
      return {
        display: isActive ? 'block' : 'none',
      };
    }

    const baseTransition = 'opacity 0.2s ease, transform 0.2s ease';

    // Fade animation
    if (animation === 'fade') {
      switch (animationState) {
        case 'entering':
          return {
            opacity: 0,
            transition: baseTransition,
          };
        case 'visible':
          return {
            opacity: 1,
            transition: baseTransition,
          };
        case 'exiting':
          return {
            opacity: 0,
            transition: baseTransition,
            pointerEvents: 'none',
          };
        case 'hidden':
          return {
            opacity: 0,
            display: 'none',
          };
        default:
          return {};
      }
    }

    // Slide animation. The translate itself rides data-state/data-direction in
    // the skin; the 0.2s here must stay numerically in sync with the two
    // setTimeout(200) calls above, which is why it is not folded into a token.
    if (animation === 'slide') {
      switch (animationState) {
        case 'entering':
          return {
            opacity: 0,
            transition: baseTransition,
          };
        case 'visible':
          return {
            opacity: 1,
            transition: baseTransition,
          };
        case 'exiting':
          return {
            opacity: 0,
            transition: baseTransition,
            pointerEvents: 'none',
          };
        case 'hidden':
          return {
            opacity: 0,
            display: 'none',
          };
        default:
          return {};
      }
    }

    return {};
  };

  // ============================================================================
  // Final Styles
  // ============================================================================

  const contentStyle: CSSProperties = {
    ...getAnimationStyles(),
    ...style,
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      className={`rottay-stepper-content ${isActive ? 'rottay-stepper-content--active' : ''} ${className}`}
      style={contentStyle}
      role="tabpanel"
      aria-hidden={!isActive}
      data-step={stepIndex}
      data-part="panel"
      data-active={isActive || undefined}
      data-state={animationState}
      data-direction={direction}
      data-animation={animation}
    >
      {children}
    </div>
  );
}

// Set display name for compound component identification
StepperContent.displayName = 'Stepper.Content';
