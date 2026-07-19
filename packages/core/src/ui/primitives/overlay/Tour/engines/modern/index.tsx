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
 * - The step surface is positioned by the shared overlay runtime
 *   (`runtime/overlay/positioning`), pinned to its measured branch
 * - The spotlight cutout is measured by `Tour/runtime/spotlight-rect`
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
import {
  OverlayPortalBoundary,
  useOverlayPosition,
} from '../../../../runtime/overlay/positioning';
import { useTourSpotlightRect } from '../../runtime/spotlight-rect';

/** Breathing room the spotlight cutout keeps around the target element. */
const SPOTLIGHT_PADDING = 8;
/** Gap between the spotlight's padded edge and the step surface. */
const SURFACE_GAP = 8;

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

interface ModernTourChromeProps {
  forwardedRef: React.ForwardedRef<HTMLDivElement>;
  className?: string;
  zIndex: number;
  mask: TourProps['mask'];
  type: TourProps['type'];
  step: TourStepProps | undefined;
  steps: TourStepProps[];
  currentStep: number;
  targetEl: HTMLElement | null;
  onClose?: () => void;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * The portaled tour chrome. Rendered inside OverlayPortalBoundary, so its
 * useOverlayPosition call always resolves the measured (js) branch.
 */
const ModernTourChrome = ({
  forwardedRef,
  className,
  zIndex,
  mask,
  type,
  step,
  steps,
  currentStep,
  targetEl,
  onClose,
  onPrev,
  onNext,
}: ModernTourChromeProps): React.ReactElement => {
  const spotlightRect = useTourSpotlightRect(targetEl, SPOTLIGHT_PADDING);
  const [surfaceEl, setSurfaceEl] = useState<HTMLDivElement | null>(null);

  // The `placement` prop is inert in this engine (the classic engine honors
  // it): the surface is fixed to bottom-center, the shipped behavior. The
  // offset clears the spotlight's padded edge (cutout padding + gap).
  const { strategy, style: positionStyle } = useOverlayPosition({
    anchor: targetEl,
    overlay: targetEl ? surfaceEl : null,
    placement: 'bottom',
    offset: SPOTLIGHT_PADDING + SURFACE_GAP,
  });

  const maskStyle = typeof mask === 'object' ? mask.style : {};
  // Written as a statement, not a ternary: `mask.color : <default>` reads as an
  // object key `color:` to the inline-paint lexer and counts as a phantom site.
  let maskColor: string | undefined = 'var(--ds-color-alpha-black-50)';
  if (typeof mask === 'object') {
    maskColor = mask.color;
  }

  return (
    <div
      ref={forwardedRef}
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
      {spotlightRect && (
        <div
          data-part="spotlight"
          className="fixed rounded-lg pointer-events-none"
          style={{
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height,
            zIndex: zIndex + 1,
          }}
        />
      )}

      {/* Step popover: placed by the shared overlay runtime when a target
          exists (bottom-centered, flip + clamp), centered in the viewport
          otherwise. The runtime's positioning keys spread last so they win. */}
      <div
        ref={setSurfaceEl}
        data-part="surface"
        data-open="true"
        data-type={type}
        data-anchored={targetEl ? 'true' : 'false'}
        data-ds-position-strategy={strategy}
        style={{
          padding: 16,
          maxWidth: 384,
          zIndex: zIndex + 2,
          ...(targetEl
            ? positionStyle
            : { position: 'fixed' as const, top: '50%', left: '50%' }),
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
                onClick={onPrev}
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
              onClick={onNext}
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
    </div>
  );
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
      zIndex = TOUR_DEFAULTS.zIndex,
      className,
    } = props;

    // Controlled/uncontrolled step index -- external current takes precedence
    const [internalCurrent, setInternalCurrent] = useState(0);
    // The live target element of the active step: the shared overlay runtime
    // and the spotlight measurement both position against it.
    const [targetEl, setTargetEl] = useState<HTMLElement | null>(null);

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

    // Resolve the target element for the active step; released on close so a
    // detached node cannot be retained across sessions.
    useEffect(() => {
      if (open && step) {
        setTargetEl(getTargetElement(step.target));
        return;
      }
      setTargetEl(null);
    }, [open, step, currentStep]);

    // Return an empty placeholder when closed to preserve ref stability
    if (!open || typeof document === 'undefined') return <div ref={ref} className={className} />;

    // Tour is js-branch-only by construction: the chrome is ONE open chain of
    // three stacked parts (backdrop scrim, spotlight cutout, step surface)
    // that must stack in a single rendering world. Promoting only the surface
    // to the top layer would split that chain across the top-layer and
    // portal/z-index worlds, and the anchor branch would stamp `anchor-name`
    // inline on app-owned target elements Tour does not render. The boundary
    // pins every useOverlayPosition call in this portaled subtree -- the
    // surface's, and any overlay a consumer nests inside step content -- to
    // the measured branch.
    return createPortal(
      <OverlayPortalBoundary>
        <ModernTourChrome
          forwardedRef={ref}
          className={className}
          zIndex={zIndex!}
          mask={mask}
          type={type}
          step={step}
          steps={steps}
          currentStep={currentStep}
          targetEl={targetEl}
          onClose={onClose}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </OverlayPortalBoundary>,
      document.body
    );
  }
);

Tour.displayName = 'Tour.Modern';

export default Tour;
