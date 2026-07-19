'use client';

/**
 * @fileoverview Tour Rustic Engine - Rottay Design System
 * @description Rustic (Pure HTML/CSS) implementation of the Tour component.
 * Uses inline CSS styles with portal rendering for proper z-index stacking.
 *
 * @remarks
 * The Rustic engine provides:
 * - Pure inline CSS with no external dependencies
 * - Portal rendering to document.body via createPortal
 * - Keyboard navigation support (Escape to close)
 * - Accessible dialog with proper ARIA attributes
 * - Box-shadow spotlight technique
 *
 * Implementation details:
 * - getTargetElement resolves selectors, refs, and functions
 * - The step surface is positioned by the shared overlay runtime
 *   (`runtime/overlay/positioning`), pinned to its measured branch
 * - The spotlight cutout is measured by `Tour/runtime/spotlight-rect`
 * - useEffect adds keyboard listener for Escape key
 * - Spotlight uses box-shadow: 0 0 0 9999px for mask effect
 * - Primary type adds a semantic primary border to the dialog
 * - Step indicators are circular divs with conditional colors
 *
 * This implementation is ideal for:
 * - Embedded applications without CSS framework dependencies
 * - Server-side rendering without CSS extraction
 * - Maximum browser compatibility scenarios
 *
 * @example Using Rustic Engine
 * ```tsx
 * import { Tour, Button } from '@rottay/design-system';
 *
 * const steps = [
 *   { target: '#welcome', title: 'Welcome', description: 'Start here' },
 *   { target: '#action', title: 'Action', description: 'Click to proceed' },
 * ];
 *
 * <Tour
 *   engine="rustic"
 *   steps={steps}
 *   open={isOpen}
 *   type="primary"
 *   zIndex={2000}
 *   onFinish={() => saveTourState()}
 * />
 * ```
 *
 * @see {@link Tour} - The main engine-aware component
 * @module Tour/Engines/Rustic
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
/** Gap between the spotlight's padded edge and the step dialog. */
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

interface RusticTourChromeProps {
  forwardedRef: React.ForwardedRef<HTMLDivElement>;
  className?: string;
  style?: React.CSSProperties;
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
const RusticTourChrome = ({
  forwardedRef,
  className,
  style,
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
}: RusticTourChromeProps): React.ReactElement => {
  const spotlightRect = useTourSpotlightRect(targetEl, SPOTLIGHT_PADDING);
  const [surfaceEl, setSurfaceEl] = useState<HTMLDivElement | null>(null);

  // The `placement` prop is inert in this engine (the classic engine honors
  // it): the dialog is fixed to bottom-center, the shipped behavior. The
  // offset clears the spotlight's padded edge (cutout padding + gap).
  const { strategy, style: positionStyle } = useOverlayPosition({
    anchor: targetEl,
    overlay: targetEl ? surfaceEl : null,
    placement: 'bottom',
    offset: SPOTLIGHT_PADDING + SURFACE_GAP,
  });

  // Written as a statement, not a ternary: `mask.color : <default>` reads as an
  // object key `color:` to the inline-paint lexer and counts as a phantom site.
  let maskColor: string | undefined = 'rgba(0, 0, 0, 0.5)';
  if (typeof mask === 'object') {
    maskColor = mask.color;
  }

  return (
    <div
      ref={forwardedRef}
      data-part="root"
      className={`rottay-tour--rustic ${className || ''}`}
      // The mask colour is consumer-supplied and templated into the spotlight's
      // box-shadow, which also carries runtime geometry; the skin reads this custom
      // property (not a paint key) for both surfaces. Left unset when the caller
      // passes a `mask` object with no `color`, exactly as before: the dependent
      // declarations then drop, painting no scrim and no cutout.
      style={{ ...style, position: 'relative', zIndex, ['--ds-tour-mask-color' as any]: maskColor }}
    >
      {/* Mask */}
      {mask && (
        <div
          data-part="backdrop"
          style={{
            position: 'fixed',
            inset: 0,
          }}
          onClick={onClose}
        />
      )}

      {/* Spotlight: a huge box-shadow creates the "cutout" mask effect around the target.
          The 9999px spread covers the entire viewport while the element itself stays transparent. */}
      {spotlightRect && (
        <div
          data-part="spotlight"
          style={{
            position: 'fixed',
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height,
            pointerEvents: 'none',
            zIndex: zIndex + 1,
          }}
        />
      )}

      {/* Step dialog: placed by the shared overlay runtime when a target
          exists (bottom-centered, flip + clamp), centered in the viewport
          otherwise. The runtime's positioning keys spread last so they win.
          All visual tokens use --ds-tour-* CSS custom properties for theming. */}
      <div
        ref={setSurfaceEl}
        role="dialog"
        aria-modal="true"
        data-part="surface"
        data-open="true"
        className={`rottay-tour-dialog rottay-tour-dialog--${type}`}
        data-type={type}
        data-anchored={targetEl ? 'true' : 'false'}
        data-ds-position-strategy={strategy}
        style={{
          padding: 'var(--ds-tour-padding, 20px)',
          maxWidth: 'var(--ds-tour-max-width, 360px)',
          minWidth: 'var(--ds-tour-min-width, 280px)',
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
            right: '12px',
            top: '12px',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '16px',
          }}
        >
          ✕
        </button>

        {/* Content */}
        {step?.cover && <div style={{ marginBottom: '12px' }}>{step.cover}</div>}
        <h3 data-part="title" style={{ margin: 0, fontSize: 'var(--ds-tour-title-size, 18px)', fontWeight: 600 }}>
          {step?.title}
        </h3>
        {step?.description && (
          <p data-part="description" style={{ margin: '8px 0 0', fontSize: 'var(--ds-tour-description-size, 14px)' }}>
            {step.description}
          </p>
        )}

        {/* Footer */}
        <div
          data-part="footer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '20px',
          }}
        >
          {/* Indicators */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {steps.map((_, index) => (
              <div
                key={index}
                data-part="indicator"
                data-current={index === currentStep ? 'true' : 'false'}
                style={{
                  width: '8px',
                  height: '8px',
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {currentStep > 0 && (
              <button
                type="button"
                data-part="action"
                data-action="prev"
                onClick={onPrev}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
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
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
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
 * Rustic engine implementation of Tour using vanilla HTML/CSS.
 *
 * Features:
 * - Zero external dependencies (no UI library required)
 * - Keyboard navigation support (Escape to close)
 * - Accessible dialog with proper ARIA attributes
 * - Portal rendering for proper z-index stacking
 * - Spotlight effect with box-shadow technique
 *
 * @component
 * @example
 * ```tsx
 * <Tour steps={steps} open={isOpen} engine="rustic" />
 * ```
 *
 * @param props - Tour configuration props
 * @param ref - Forwarded ref to the container div
 * @returns Guided tour using vanilla HTML/CSS
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
      style,
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

    // Handle escape key
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && open) {
          onClose?.();
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [open, onClose]);

    // Return an empty placeholder when closed to preserve ref stability
    if (!open || typeof document === 'undefined') {
      return <div ref={ref} className={className} style={style} />;
    }

    // Tour is js-branch-only by construction: the chrome is ONE open chain of
    // three stacked parts (backdrop scrim, spotlight cutout, step dialog)
    // that must stack in a single rendering world. Promoting only the dialog
    // to the top layer would split that chain across the top-layer and
    // portal/z-index worlds, and the anchor branch would stamp `anchor-name`
    // inline on app-owned target elements Tour does not render. The boundary
    // pins every useOverlayPosition call in this portaled subtree -- the
    // dialog's, and any overlay a consumer nests inside step content -- to
    // the measured branch.
    return createPortal(
      <OverlayPortalBoundary>
        <RusticTourChrome
          forwardedRef={ref}
          className={className}
          style={style}
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

Tour.displayName = 'Tour.Rustic';

export default Tour;
