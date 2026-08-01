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
 * @example
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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { StepContentProps } from '../../contracts';
import { governedExitMs } from '@/graphics/motion/react/runtime/presence/duration';

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
 * - The state paint (opacity / transform / display) lives in
 *   `stepper-compounds.css`, keyed on `data-state` / `data-animation` /
 *   `data-direction` — no inline animation styles, no raw durations
 * - The exit lifecycle is GOVERNED: `transitionend` on the panel is the
 *   primary path and the fallback timer reads the resolved duration from the
 *   element's computed style, replacing the two desynced `setTimeout(200)`
 *   literals (the P0 animationend + computed-fallback law; the enter side
 *   simply flips `entering → visible` on the next frame, so the fade starts
 *   immediately instead of idling 200ms first)
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
  // Caller passthrough (id / aria-* / data-* / data-testid): forwarded to the
  // panel element, BEFORE the engine's own stamps.
  ...rest
}: StepContentInternalProps): React.ReactElement | null {
  // ========================================================================
  // State Management
  // ========================================================================

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

  /** The panel element the governed exit reads its computed duration from */
  const panelRef = useRef<HTMLDivElement | null>(null);

  /** Computed-duration fallback for the exit (transitionend is primary) */
  const exitFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearExitFallback = useCallback(() => {
    if (exitFallbackRef.current) {
      clearTimeout(exitFallbackRef.current);
      exitFallbackRef.current = null;
    }
  }, []);

  /** Terminal exit: hide the panel and unmount unless kept mounted. */
  const finalizeExit = useCallback(() => {
    clearExitFallback();
    setAnimationState('hidden');
    if (!keepMounted) {
      setShouldRender(false);
    }
  }, [clearExitFallback, keepMounted]);

  // ========================================================================
  // Animation Effect
  // ========================================================================

  /**
   * Handles animation transitions when active state changes.
   * Enter: mount at `entering`, flip to `visible` on the next frame so the
   * skin's transition runs immediately (the former 200ms idle is gone).
   * Exit: play `exiting`, then let `transitionend` finalize — with a
   * computed-duration fallback for environments where the event never fires
   * (`animation='none'`, reduced motion, jsdom).
   */
  useEffect(() => {
    if (isActive) {
      // Content is becoming active - cancel any in-flight exit, mount, enter
      clearExitFallback();
      setShouldRender(true);
      setAnimationState((state) => (state === 'visible' ? 'visible' : 'entering'));
      const raf = requestAnimationFrame(() => {
        setAnimationState('visible');
      });
      return () => cancelAnimationFrame(raf);
    }

    // Content is becoming inactive - animate out, then hide/unmount
    setAnimationState((state) => (state === 'hidden' ? 'hidden' : 'exiting'));
    const el = panelRef.current;
    exitFallbackRef.current = setTimeout(finalizeExit, el ? governedExitMs(el) : 0);
    return clearExitFallback;
  }, [isActive, keepMounted, finalizeExit, clearExitFallback]);

  /**
   * Primary exit path: the panel's own opacity transition completing (the
   * one property fade and slide both animate). Bubbled child transitions and
   * non-exit states are ignored.
   */
  const handleTransitionEnd = useCallback(
    (event: React.TransitionEvent<HTMLDivElement>) => {
      if (animationState !== 'exiting') return;
      if (event.target !== panelRef.current) return;
      if (event.propertyName !== 'opacity') return;
      finalizeExit();
    },
    [animationState, finalizeExit]
  );

  // ========================================================================
  // Render Logic
  // ========================================================================

  // Don't render if not active and not keeping mounted
  if (!shouldRender && !keepMounted) {
    return null;
  }

  return (
    <div
      {...rest}
      ref={panelRef}
      className={`rottay-stepper-content ${isActive ? 'rottay-stepper-content--active' : ''} ${className}`}
      style={style}
      role="tabpanel"
      aria-hidden={!isActive}
      onTransitionEnd={handleTransitionEnd}
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
