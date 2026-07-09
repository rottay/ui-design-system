'use client';

/**
 * @fileoverview Tour Modern Engine - Rottay Design System
 * @description Modern (token-driven) implementation of the Tour component.
 * Uses Tailwind utility classes with DS token inline styles.
 *
 * @remarks
 * The Modern engine provides:
 * - Card structural classes for step content
 * - Button structural classes for navigation
 * - Tailwind utility classes for layout
 * - Portal rendering via createPortal
 * - Box-shadow spotlight technique
 *
 * Implementation details:
 * - getTargetElement resolves selectors, refs, and functions
 * - useEffect updates targetRect when step changes
 * - Spotlight uses box-shadow: 0 0 0 9999px for mask effect
 * - Step indicators use DS token inline styles (--ds-color-primary / --ds-surface-panel)
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Tour, Button } from '@rottay/design-system';
 *
 * const steps = [
 *   { target: '#feature', title: 'New Feature', description: 'Try it!' },
 *   { target: '.settings', title: 'Settings', description: 'Configure' },
 * ];
 *
 * <Tour
 *   engine="modern"
 *   steps={steps}
 *   open={isOpen}
 *   type="primary"
 *   onClose={() => setIsOpen(false)}
 * />
 * ```
 *
 * @see {@link Tour} - The main engine-aware component
 * @module Tour/Engines/Modern
 * @category Overlay
 * @package @rottay/design-system
 */
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { TourProps, TourStepProps } from '../Tour.types';
import { TOUR_DEFAULTS } from '../Tour.types';

/**
 * Resolves target element from various input formats.
 *
 * @param target - CSS selector, ref, or getter function
 * @returns The resolved HTMLElement or null
 * @internal
 */
const getTargetElement = (target: TourStepProps['target']): HTMLElement | null => {
  if (!target) return null;
  if (typeof target === 'string') return document.querySelector(target);
  if (typeof target === 'function') return target();
  if ('current' in target) return target.current;
  return null;
};

/**
 * Modern engine implementation of Tour using Tailwind CSS.
 *
 * Features:
 * - Card and button structural classes with DS token styles
 * - Tailwind utility classes for layout
 * - Portal rendering for proper z-index stacking
 * - Spotlight effect with box-shadow technique
 *
 * @component
 * @example
 * ```tsx
 * <Tour steps={steps} open={isOpen} engine="modern" />
 * ```
 *
 * @param props - Tour configuration props
 * @param ref - Forwarded ref to the container div
 * @returns Guided tour using Tailwind CSS
 */
export const Tour = React.forwardRef<HTMLDivElement, TourProps>(
  (props, ref) => {
    const {
      steps,
      current: controlledCurrent,
      open,
      onChange,
      onClose,
      onFinish,
      type = TOUR_DEFAULTS.type,
      mask = TOUR_DEFAULTS.mask,
      placement: _placement = TOUR_DEFAULTS.placement,
      zIndex = TOUR_DEFAULTS.zIndex,
      className,
    } = props;

    // Controlled/uncontrolled step index -- external current takes precedence
    const [internalCurrent, setInternalCurrent] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const currentStep = controlledCurrent ?? internalCurrent;
    const step = steps[currentStep];

    const handleChange = useCallback((newCurrent: number) => {
      setInternalCurrent(newCurrent);
      onChange?.(newCurrent);
    }, [onChange]);

    // On the last step, "Next" becomes "Finish" and triggers both callbacks
    const handleNext = () => {
      if (currentStep < steps.length - 1) {
        handleChange(currentStep + 1);
      } else {
        onFinish?.();
        onClose?.();
      }
    };

    const handlePrev = () => {
      if (currentStep > 0) {
        handleChange(currentStep - 1);
      }
    };

    // Update target position
    useEffect(() => {
      if (open && step) {
        const element = getTargetElement(step.target);
        if (element) {
          setTargetRect(element.getBoundingClientRect());
        } else {
          setTargetRect(null);
        }
      }
    }, [open, step, currentStep]);

    // Return an empty placeholder when closed to preserve ref stability
    if (!open || typeof document === 'undefined') return <div ref={ref} className={className} />;

    // Padding around the spotlight cutout so the target element has visual breathing room
    const padding = 8;
    const maskStyle = typeof mask === 'object' ? mask.style : {};
    const maskColor = typeof mask === 'object' ? mask.color : 'var(--ds-color-alpha-black-50)';

    return createPortal(
      <div ref={ref} className={className} style={{ zIndex }}>
        {/* Mask */}
        {mask && (
          <div
            className="fixed inset-0"
            style={{
              backgroundColor: maskColor,
              ...maskStyle,
            }}
            onClick={onClose}
          />
        )}

        {/* Spotlight: a huge box-shadow creates the "cutout" mask effect around the target.
            The 9999px spread covers the entire viewport while the element itself stays transparent. */}
        {targetRect && (
          <div
            className="fixed rounded-lg pointer-events-none"
            style={{
              top: targetRect.top - padding,
              left: targetRect.left - padding,
              width: targetRect.width + padding * 2,
              height: targetRect.height + padding * 2,
              boxShadow: `0 0 0 9999px ${maskColor}`,
              zIndex: zIndex! + 1,
            }}
          />
        )}

        {/* Step popover: positioned below the target when available, centered in viewport otherwise */}
        <div
          style={{
            position: 'fixed',
            padding: 16,
            maxWidth: 384,
            background: 'var(--ds-surface-card)',
            borderRadius: 'var(--ds-radius-lg)',
            border: type === 'primary' ? '2px solid var(--ds-color-primary)' : '1px solid var(--ds-color-border-subtle)',
            boxShadow: 'var(--ds-elevation-3)',
            top: targetRect ? targetRect.bottom + padding + 8 : '50%',
            left: targetRect ? targetRect.left + targetRect.width / 2 : '50%',
            transform: targetRect ? 'translateX(-50%)' : 'translate(-50%, -50%)',
            zIndex: zIndex! + 2,
          }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              right: 8,
              top: 8,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              color: 'var(--ds-color-text-primary)',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            ✕
          </button>

          {/* Content */}
          {step?.cover && <div className="mb-3">{step.cover}</div>}
          <h3 className="font-bold text-lg">{step?.title}</h3>
          {step?.description && (
            <p className="mt-2" style={{ color: 'var(--ds-color-text-secondary)' }}>{step.description}</p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-4">
            {/* Indicators */}
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 rounded-full"
                  style={{ background: index === currentStep ? 'var(--ds-color-primary)' : 'var(--ds-surface-panel)' }}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  style={{
                    height: 32,
                    padding: '0 12px',
                    fontSize: 13,
                    borderRadius: 'var(--ds-radius-md)',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--ds-color-text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  Previous
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                style={{
                  height: 32,
                  padding: '0 12px',
                  fontSize: 13,
                  borderRadius: 'var(--ds-radius-md)',
                  border: 'none',
                  cursor: 'pointer',
                  ...(type === 'primary'
                    ? { background: 'var(--ds-color-primary)', color: 'var(--ds-color-text-on-primary)' }
                    : { background: 'var(--ds-color-neutral)', color: 'var(--ds-color-text-on-primary)' }),
                }}
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  }
);

Tour.displayName = 'Tour.Modern';

export default Tour;
