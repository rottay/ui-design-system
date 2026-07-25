'use client';

/**
 * @fileoverview Tour Modern Engine - Rottay Design System
 * @description Modern (token-driven) implementation of the Tour component.
 * Self-contained `rottay-tour--modern` tree painted by the unlayered skin
 * `tour.css`; no DaisyUI or utility-framework classes.
 *
 * @remarks
 * The Modern engine provides:
 * - A self-contained `rottay-tour--modern` tree: no DaisyUI classes and no
 *   utility-framework classes (K4-A drained the last Tailwind utilities and
 *   static inline chrome into the unlayered skin `tour.css`)
 * - Portal rendering via createPortal (documented direct-body bypass)
 * - Box-shadow spotlight technique
 *
 * Implementation details:
 * - getTargetElement resolves selectors, refs, and functions
 * - The step surface is positioned by the shared overlay runtime
 *   (`runtime/overlay/positioning`), pinned to its measured branch
 * - The spotlight cutout is measured by `Tour/runtime/spotlight-rect`
 * - Spotlight uses box-shadow: 0 0 0 9999px for mask effect
 * - Step indicators/actions are skin-owned, keyed on data-part; close/prev/next
 *   copy uses the common locale (`close`/`previous`/`next`; `Finish` still
 *   lacks a key -- tracked in the family ficha)
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
import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import type { TourProps, TourStepProps } from '../../contracts';
import { TOUR_DEFAULTS } from '../../contracts';
import {
  OverlayPortalBoundary,
  useOverlayPosition,
} from '../../../../runtime/overlay/positioning';
import { useTourSpotlightRect } from '../../runtime/spotlight-rect';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';

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
  portalScope: TourPortalScope;
  onClose?: () => void;
  onPrev: () => void;
  onNext: () => void;
}

/** Tenant/locale attributes projected onto the portaled chrome root. */
interface TourPortalScope {
  'data-ds-root'?: string;
  'data-vertical'?: string;
  'data-tenant'?: string;
  'data-theme'?: string;
  'data-engine'?: string;
  'data-density'?: string;
  dir?: 'ltr' | 'rtl';
  lang?: string;
}

/**
 * Read the tenant/locale scope of the nearest DS owner chain (Popover's
 * readLocaleContext precedent). Tour portals DIRECTLY to document.body, which
 * escapes the `[data-ds-root]` provider scope carrying DB Appearance tokens
 * (and any wrapper-level `dir`/`lang`); the chrome re-stamps what this reads
 * so the portal computes the same tenant tokens and direction as the in-tree
 * app. Without it, a DB-tenant tour renders with base fallback tokens -- the
 * K4 remediation color-contrast failure on the TMM cells.
 */
function readPortalScope(source: HTMLElement | null): TourPortalScope {
  if (!source) return {};
  const readNearest = (attribute: string): string | undefined =>
    source.closest<HTMLElement>(`[${attribute}]`)?.getAttribute(attribute) ?? undefined;
  const directionOwner = source.closest<HTMLElement>('[dir]');
  const languageOwner = source.closest<HTMLElement>('[lang]');
  const computedDirection = window.getComputedStyle(source).direction;
  return {
    'data-ds-root': readNearest('data-ds-root'),
    'data-vertical': readNearest('data-vertical'),
    'data-tenant': readNearest('data-tenant'),
    'data-theme': readNearest('data-theme'),
    'data-engine': readNearest('data-engine'),
    'data-density': readNearest('data-density'),
    dir: directionOwner?.dir === 'rtl' || computedDirection === 'rtl' ? 'rtl' : 'ltr',
    lang: languageOwner?.lang || document.documentElement.lang || undefined,
  };
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
  portalScope,
  onClose,
  onPrev,
  onNext,
}: ModernTourChromeProps): React.ReactElement => {
  // Standalone-render safe: Tour can mount before an app's I18nProvider, so
  // the optional hook keeps the documented English fallbacks below.
  const translation = useOptionalTranslation('common');
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
      // Re-enter the tenant/locale scope the body portal escaped (read from
      // the target or the in-tree scope marker; empty outside a DS provider).
      {...portalScope}
      // The mask colour is consumer-supplied and templated into the spotlight's
      // box-shadow, which also carries runtime geometry; the skin reads this
      // custom property (not a paint key) for both surfaces. Left unset when the
      // caller passes a `mask` object with no `color`, exactly as before: the
      // dependent declarations then drop, painting no scrim and no cutout.
      style={{ zIndex, ['--ds-tour-mask-color' as any]: maskColor }}
    >
      {/* Mask. Fixed full-viewport positioning is skin-owned; only the
          consumer's mask.style spread stays inline (public API). */}
      {mask && (
        <div
          data-part="backdrop"
          style={{
            ...maskStyle,
          }}
          onClick={onClose}
        />
      )}

      {/* Spotlight: a huge box-shadow creates the "cutout" mask effect around the target.
          The 9999px spread covers the entire viewport while the element itself stays transparent.
          The scrim IS the mask: with mask={false} nothing may veil the page
          (classic/antd parity), so the whole cutout is gated on `mask` -- a
          plain boolean used to ship a 50%-black veil over the app anyway.
          Geometry is measured viewport geometry (getBoundingClientRect) and stays inline;
          fixed positioning/radius/pointer-events are skin-owned. */}
      {mask && spotlightRect && (
        <div
          data-part="spotlight"
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
          otherwise (the skin's translate centres it -- direction-neutral).
          The runtime's positioning keys spread last so they win. Chrome
          (padding/max-inline-size) is skin-owned. */}
      <div
        ref={setSurfaceEl}
        data-part="surface"
        data-open="true"
        data-type={type}
        data-anchored={targetEl ? 'true' : 'false'}
        data-ds-position-strategy={strategy}
        style={{
          zIndex: zIndex + 2,
          ...(targetEl
            ? positionStyle
            : { position: 'fixed' as const, top: '50%', left: '50%' }),
        }}
      >
        {/* Close button: geometry is skin-owned (logical inset-inline-end so
            it mirrors to the far corner under RTL); the glyph is the governed
            ActionCloseIcon (Modal/Toast/Notification pattern), decorative --
            the button carries the accessible name. */}
        <button
          type="button"
          data-part="close-button"
          onClick={onClose}
          aria-label={translation?.t('close') ?? 'Close'}
        >
          <ActionCloseIcon decorative size={16} />
        </button>

        {/* Content */}
        {step?.cover && <div data-part="cover">{step.cover}</div>}
        <h3 data-part="title">{step?.title}</h3>
        {step?.description && (
          <p data-part="description">{step.description}</p>
        )}

        {/* Footer */}
        <div data-part="footer">
          {/* Indicators */}
          <div data-part="indicators">
            {steps.map((_, index) => (
              <div
                key={index}
                data-part="indicator"
                data-current={index === currentStep ? 'true' : 'false'}
              />
            ))}
          </div>

          {/* Buttons. `Finish` has no common-locale key yet (listed in the
              family ficha); the literal ships until the key lands. */}
          <div data-part="actions">
            {currentStep > 0 && (
              <button
                type="button"
                data-part="action"
                data-action="prev"
                onClick={onPrev}
              >
                {translation?.t('previous') ?? 'Previous'}
              </button>
            )}
            <button
              type="button"
              data-part="action"
              data-action="next"
              onClick={onNext}
            >
              {currentStep === steps.length - 1 ? 'Finish' : (translation?.t('next') ?? 'Next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Modern engine implementation of Tour on a self-contained, skin-owned tree.
 *
 * Features:
 * - Skin-owned chrome (surface, close button, indicators, nav actions)
 * - No utility-framework classes (drained in K4-A)
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
 * @returns Guided tour on the modern Rottay-native skin
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
    // In-tree marker the tenant/locale scope is read from when the step has
    // no target element (the chrome portals to body, outside the provider).
    const [scopeMarkerEl, setScopeMarkerEl] = useState<HTMLSpanElement | null>(null);
    const [portalScope, setPortalScope] = useState<TourPortalScope>({});

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

    // Re-read the tenant/locale scope on open and on step change (the target
    // may live under a different scope owner than the previous one). No
    // MutationObserver, unlike Popover: a mid-tour tenant switch is out of
    // contract.
    useLayoutEffect(() => {
      if (!open) return;
      setPortalScope(readPortalScope(targetEl ?? scopeMarkerEl));
    }, [open, targetEl, scopeMarkerEl, currentStep]);

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
    return (
      <>
        <span ref={setScopeMarkerEl} data-part="scope-marker" hidden aria-hidden="true" />
        {createPortal(
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
              portalScope={portalScope}
              onClose={onClose}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          </OverlayPortalBoundary>,
          document.body
        )}
      </>
    );
  }
);

Tour.displayName = 'Tour.Modern';

export default Tour;
