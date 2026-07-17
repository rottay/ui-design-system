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
import type { TourProps, TourStepProps } from '../../contracts';
import { TOUR_DEFAULTS } from '../../contracts';

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
  (props: TourProps, ref) => {
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
    // Written as a statement, not a ternary: `mask.color : <default>` reads as an
    // object key `color:` to the inline-paint lexer and counts as a phantom site.
    let maskColor: string | undefined = 'var(--ds-color-alpha-black-50)';
    if (typeof mask === 'object') {
      maskColor = mask.color;
    }

    return createPortal(
      <div
        ref={ref}
        data-part="root"
        className={`rottay-tour--modern ${className || ''}`}
        // The mask colour is consumer-supplied and templated into the spotlight's
        // box-shadow, which also carries runtime geometry; the skin reads this
        // custom property (not a paint key) for both surfaces. Left unset when the
        // caller passes a `mask` object with no `color`, exactly as before: the
        // dependent declarations then drop, painting no scrim and no cutout.
        style={{ zIndex, ['--ds-tour-mask-color' as any]: maskColor }}
      >
        {/* Mask */}
        {mask && (
          <div
            data-part="backdrop"
            className="fixed inset-0"
            style={{
              ...maskStyle,
            }}
            onClick={onClose}
          />
        )}

        {/* Spotlight: a huge box-shadow creates the "cutout" mask effect around the target.
            The 9999px spread covers the entire viewport while the element itself stays transparent. */}
        {targetRect && (
          <div
            data-part="spotlight"
            className="fixed rounded-lg pointer-events-none"
            style={{
              top: targetRect.top - padding,
              left: targetRect.left - padding,
              width: targetRect.width + padding * 2,
              height: targetRect.height + padding * 2,
              zIndex: zIndex! + 1,
            }}
          />
        )}

        {/* Step popover: positioned below the target when available, centered in viewport otherwise */}
        <div
          data-part="surface"
          data-open="true"
          data-type={type}
          data-anchored={targetRect ? 'true' : 'false'}
          style={{
            position: 'fixed',
            padding: 16,
            maxWidth: 384,
            top: targetRect ? targetRect.bottom + padding + 8 : '50%',
            left: targetRect ? targetRect.left + targetRect.width / 2 : '50%',
            zIndex: zIndex! + 2,
          }}
        >
          {/* Close button */}
          <button
            type="button"
            data-part="close-button"
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
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            ✕
          </button>

          {/* Content */}
          {step?.cover && <div className="mb-3">{step.cover}</div>}
          <h3 data-part="title" className="font-bold text-lg">{step?.title}</h3>
          {step?.description && (
            <p data-part="description" className="mt-2">{step.description}</p>
          )}

          {/* Footer */}
          <div data-part="footer" className="flex items-center justify-between mt-4">
            {/* Indicators */}
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  data-part="indicator"
                  data-current={index === currentStep ? 'true' : 'false'}
                  className="w-2 h-2 rounded-full"
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  data-part="action"
                  data-action="prev"
                  onClick={handlePrev}
                  style={{
                    height: 32,
                    padding: '0 12px',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Previous
                </button>
              )}
              <button
                type="button"
                data-part="action"
                data-action="next"
                onClick={handleNext}
                style={{
                  height: 32,
                  padding: '0 12px',
                  fontSize: 13,
                  cursor: 'pointer',
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
