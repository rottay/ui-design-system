/**
 * Stepper.Content - Compound Component
 * Content panel for each step
 */

'use client';

import React, { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import type { StepContentProps } from '../../types';

interface StepContentInternalProps extends StepContentProps {
  /** Current active step */
  currentStep?: number;
  /** Previous step (for animation direction) */
  previousStep?: number;
}

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
  const [shouldRender, setShouldRender] = useState(stepIndex === currentStep);
  const [animationState, setAnimationState] = useState<'entering' | 'visible' | 'exiting' | 'hidden'>(
    stepIndex === currentStep ? 'visible' : 'hidden'
  );

  const isActive = stepIndex === currentStep;
  const direction = currentStep > previousStep ? 'forward' : 'backward';

  useEffect(() => {
    if (isActive) {
      setShouldRender(true);
      // Small delay to trigger enter animation
      requestAnimationFrame(() => {
        setAnimationState('entering');
        // After animation completes
        setTimeout(() => {
          setAnimationState('visible');
        }, 200);
      });
    } else {
      setAnimationState('exiting');
      // Wait for exit animation
      setTimeout(() => {
        setAnimationState('hidden');
        if (!keepMounted) {
          setShouldRender(false);
        }
      }, 200);
    }
  }, [isActive, keepMounted]);

  // Don't render if not active and not keeping mounted
  if (!shouldRender && !keepMounted) {
    return null;
  }

  // Get animation styles
  const getAnimationStyles = (): CSSProperties => {
    if (animation === 'none') {
      return {
        display: isActive ? 'block' : 'none',
      };
    }

    const baseTransition = 'opacity 0.2s ease, transform 0.2s ease';

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

    if (animation === 'slide') {
      const translateValue = direction === 'forward' ? '20px' : '-20px';
      const reverseTranslate = direction === 'forward' ? '-20px' : '20px';

      switch (animationState) {
        case 'entering':
          return {
            opacity: 0,
            transform: `translateX(${translateValue})`,
            transition: baseTransition,
          };
        case 'visible':
          return {
            opacity: 1,
            transform: 'translateX(0)',
            transition: baseTransition,
          };
        case 'exiting':
          return {
            opacity: 0,
            transform: `translateX(${reverseTranslate})`,
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

  const contentStyle: CSSProperties = {
    ...getAnimationStyles(),
    ...style,
  };

  return (
    <div
      className={`rottay-stepper-content ${isActive ? 'rottay-stepper-content--active' : ''} ${className}`}
      style={contentStyle}
      role="tabpanel"
      aria-hidden={!isActive}
      data-step={stepIndex}
    >
      {children}
    </div>
  );
}

StepperContent.displayName = 'Stepper.Content';
