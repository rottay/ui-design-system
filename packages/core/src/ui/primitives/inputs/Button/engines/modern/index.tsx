/**
 * @fileoverview Button Modern Engine - Rottay Design System
 * @description Premium-quality button implementation using CSS custom properties
 * from the modern theme token system. Inspired by Linear, Vercel, and Stripe.
 *
 * @remarks
 * The Modern engine paints this button entirely from
 * `foundation/tokens/css/runtime/engines/modern/skin/button.css`, keyed on the `data-*` contract
 * this component stamps: `data-variant`, `data-size`, `data-shape`,
 * `data-disabled`, `data-loading`, `data-pending`, `data-icon-only`,
 * `data-size-responsive`, `data-tone` (the quiet-destructive grammar, only
 * when `danger` composes with an explicit quiet variant), the
 * `data-part` / `data-state` anatomy attributes
 * from `behavior/anatomy.ts`, and the `data-recipe` / `data-recipe-state`
 * motion vocabulary plus `--ds-recipe-*` variables from the feedback.press
 * recipe. No DaisyUI btn-* classes are used. Besides those variables, a
 * caller's own `style` prop is the only inline declaration on the element.
 *
 * **Design principles:**
 * - Precise, calm, expensive, editorial
 * - Every transition uses --ds-motion-* tokens
 * - Focus rings use --ds-focus-ring-* tokens
 * - Elevation uses --ds-elevation-* tokens
 * - Border radius uses --ds-radius-* tokens
 *
 * **Hierarchy:**
 * - Primary: Solid brand bg, high contrast, elevation on hover
 * - Secondary: Second-tier emphasis through the tenant-authored
 *   `--ds-button-secondary-*` channels, same interaction model as primary
 * - Ghost: No border, minimal hover bg
 * - Danger: Red-tinted, same interaction model as primary
 * - Quiet destructive (`danger` + an explicit quiet variant): error ink and a
 *   tempered wash at low volume, reserved for secondary destructive actions
 * - Link: Underline on hover, no background
 *
 * @see {@link Button} for the main component
 * @see {@link ClassicButton} for Ant Design implementation
 * @see {@link RusticButton} for vanilla implementation
 * @module ModernButton
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useId } from 'react';

import { partAttributes, useInteractionState } from '../../../../../../foundation/behavior';
import { VisuallyHidden } from '../../../../foundation';
import { useMotionRecipePresentation } from '@/infrastructure/runtime/foundation/motion/composition/react/preference/recipe';
import type { ButtonProps, ButtonSize } from '../../contracts';
import { defineRecipe } from '@/infrastructure/runtime/foundation/recipes/engine';
import {
  BUTTON_RECIPE_DEFINITION,
  BUTTON_VARIANT_VALUES,
} from '@/infrastructure/runtime/foundation/recipes/contracts/families';
import { useRecipeProfileDefaults } from '@/infrastructure/runtime/foundation/recipes/profiles';

import { BUTTON_DEFAULTS, SIZE_MAP as BUTTON_SIZE_MAP, resolveButtonBusyState } from '../../contracts';
import {
  generateResponsiveCSS,
  isResponsiveValue,
  scalarOrUndefined,
  type ResponsivePropEntry,
} from '@/infrastructure/runtime/responsive/runtime/style-properties';

/**
 * The variants the modern skin paints. An unknown variant falls back to
 * `primary` for the className, the `data-variant` attribute and therefore the
 * paint, all three together. The authored domain is the recipe definition's.
 */
const KNOWN_VARIANTS: ReadonlySet<string> = new Set(BUTTON_VARIANT_VALUES);
type ModernButtonVariant = (typeof BUTTON_VARIANT_VALUES)[number];

const isKnownVariant = (value: string): value is ModernButtonVariant =>
  KNOWN_VARIANTS.has(value);

/**
 * Variants whose paint is quiet (ink/wash/border, no solid fill). `danger`
 * composed with one of these keeps the variant and stamps `data-tone` —
 * see the resolution below.
 */
const QUIET_TONE_VARIANTS: ReadonlySet<string> = new Set([
  'ghost',
  'text',
  'link',
  'default',
  'outline',
  'dashed',
]);

/**
 * DS-S001 recipe: the same semantic classes the skin has always selected on,
 * resolved through the Rottay recipe engine. Axis order mirrors the historical
 * class order exactly (variant, size, shape, then the boolean states).
 */
export const modernButtonRecipe = defineRecipe(BUTTON_RECIPE_DEFINITION);

// ---------------------------------------------------------------------------
// Loading spinner
// ---------------------------------------------------------------------------
/**
 * Custom SVG loading spinner. Uses currentColor so it inherits the button's
 * text color. Size-aware: smaller buttons get a smaller spinner.
 */
const LoadingSpinner: React.FC<{ size?: string }> = ({ size = 'md' }) => {
  return (
    <svg
      data-part="spinner"
      data-size={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        data-part="spinner-track"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeDasharray="31.416"
        strokeDashoffset="10"
      />
      <circle
        data-part="spinner-indicator"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeDasharray="31.416"
        strokeDashoffset="25"
      />
    </svg>
  );
};

// ---------------------------------------------------------------------------
// ModernButton
// ---------------------------------------------------------------------------
/**
 * Premium modern button implementation.
 *
 * Every transition, shadow, and focus ring references --ds-* tokens for
 * consistent theming across tenants. The rules that consume them live in the
 * modern skin stylesheet; this component's job is to stamp the state that
 * selects them.
 *
 * @param props - Standardized ButtonProps from the DS type contract.
 * @param ref   - Forwarded ref attached to the native `<button>` element.
 * @returns A premium-styled button with token-driven interaction animations.
 */
const ModernButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>((props, ref) => {
  const {
    children,
    variant: variantProp,
    size: sizeProp,
    shape: shapeProp,
    htmlType = BUTTON_DEFAULTS.htmlType,
    disabled = BUTTON_DEFAULTS.disabled,
    loading = BUTTON_DEFAULTS.loading,
    loadingText,
    pending = false,
    pendingLabel,
    block = BUTTON_DEFAULTS.block,
    fullWidth,
    danger,
    icon,
    iconPosition = BUTTON_DEFAULTS.iconPosition,
    prefix,
    suffix,
    shadow,
    gradient,
    pulse,
    bordered,
    radius,
    href,
    target,
    rel,
    // Reserved for a future cross-engine Slot contract. It is consumed here
    // so it can never leak as a non-standard DOM attribute.
    asChild: _asChild,
    onClick,
    className = '',
    style,
    onPointerEnter,
    onPointerLeave,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onKeyDown,
    onKeyUp,
    onFocus,
    onBlur,
    // P-79: an explicit caller data-part wins over the default root anatomy
    // part ('trigger'); the default applies only when the caller passed none.
    'data-part': dataPart,
    ...nativeButtonProps
  } = props;

  void _asChild;

  // DS-S001: profile defaults apply only where the caller left the axis
  // unset; explicit props always win, then the engine default.
  const buttonProfileDefaults = useRecipeProfileDefaults('button');
  const variant =
    variantProp ??
    (typeof buttonProfileDefaults.variant === 'string'
      ? (buttonProfileDefaults.variant as ButtonProps['variant'])
      : undefined) ??
    BUTTON_DEFAULTS.variant;
  const shape =
    shapeProp ??
    (typeof buttonProfileDefaults.shape === 'string'
      ? (buttonProfileDefaults.shape as ButtonProps['shape'])
      : undefined) ??
    BUTTON_DEFAULTS.shape;
  const resolvedSizeProp =
    sizeProp ??
    (typeof buttonProfileDefaults.size === 'string'
      ? (buttonProfileDefaults.size as ButtonSize)
      : undefined) ??
    BUTTON_DEFAULTS.size;

  // Single documented resolution point for the overlapping busy props (see
  // `resolveButtonBusyState` in Button.types.ts for the precedence rules).
  const { busy, widthStable, label: resolvedBusyLabel } = resolveButtonBusyState({
    pending,
    pendingLabel,
    loading,
    loadingText,
  });

  // The hover/press/focus triad is decided once, in the behavior core. The rustic
  // skin reads the same state, so the two cannot drift apart on what a press is.
  const { state: interaction, handlers: interactionHandlers } = useInteractionState({
    disabled: disabled || busy,
  });

  // feedback.press recipe (motion canon): the skin reads the stamped
  // `--ds-recipe-*` variables for press geometry/timing. Under reduced motion
  // the resolver returns the settled state (scale 1, zero duration) and the skin's
  // `[data-recipe-state='final']` rule disables interpolation entirely.
  const pressMotion = useMotionRecipePresentation('feedback.press');
  const isFocused = interaction.focusVisible;

  const isFullWidth = fullWidth ?? block;
  // `toArray` drops null/undefined/booleans, so a conditional label that
  // resolved away is icon-only; `count` still sees the empty slot.
  const renderedChildren = React.Children.toArray(children);
  const hasLabel = renderedChildren.length > 0;
  const isIconOnly = !hasLabel && Boolean(icon || prefix || suffix);

  // -------------------------------------------------------------------------
  // Responsive size handling
  // -------------------------------------------------------------------------
  const reactId = useId();
  const responsiveEntries: ResponsivePropEntry<any>[] = [];
  const sizeIsResponsive = isResponsiveValue(resolvedSizeProp);

  if (sizeIsResponsive) {
    responsiveEntries.push({
      cssProperty: '--ds-button-resolved-height',
      value: resolvedSizeProp,
      resolve: (v: ButtonSize) => (BUTTON_SIZE_MAP[v as keyof typeof BUTTON_SIZE_MAP] || BUTTON_SIZE_MAP.md).height,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: '--ds-button-resolved-padding-y',
      value: resolvedSizeProp,
      resolve: (v: ButtonSize) => `var(--ds-button-${v}-padding-y)`,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'padding-inline',
      value: resolvedSizeProp,
      resolve: (v: ButtonSize) =>
        // --ds-density-effective-scale is always declared (base/density.css): bare reference.
        `calc(var(--ds-button-${v}-padding-x) * var(--ds-density-effective-scale))`,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'font-size',
      value: resolvedSizeProp,
      resolve: (v: ButtonSize) => (BUTTON_SIZE_MAP[v as keyof typeof BUTTON_SIZE_MAP] || BUTTON_SIZE_MAP.md).fontSize,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'line-height',
      value: resolvedSizeProp,
      resolve: (v: ButtonSize) => `var(--ds-button-${v}-line-height)`,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'gap',
      value: resolvedSizeProp,
      resolve: (v: ButtonSize) =>
        `calc(var(--ds-button-${v}-gap) * var(--ds-density-effective-scale))`,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: '--ds-button-resolved-icon-size',
      value: resolvedSizeProp,
      resolve: (v: ButtonSize) => `var(--ds-button-${v}-icon-size)`,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: '--_ds-button-resolved-radius',
      value: resolvedSizeProp,
      resolve: (v: ButtonSize) => `var(--ds-button-${v}-radius)`,
    } as ResponsivePropEntry<any>);
  }

  const needsResponsiveCSS = responsiveEntries.length > 0;
  const elementId = needsResponsiveCSS ? `btn-${reactId.replace(/:/g, '')}` : '';
  const responsive = needsResponsiveCSS
    ? generateResponsiveCSS(elementId, responsiveEntries)
    : null;

  const size = scalarOrUndefined(resolvedSizeProp) ?? BUTTON_DEFAULTS.size;

  // Unknown variants fall back to the public primary contract for className,
  // data attributes, and inline styles consistently. Explicit `danger` takes
  // priority over `variant` — with one refined exception: `danger` on an
  // explicitly requested QUIET variant prop (ghost, text, link, default,
  // outline, dashed) keeps the quiet variant and stamps `data-tone='danger'`
  // instead, so the skin paints the destructive grammar at low volume (red
  // ink plus a tempered wash) rather than the solid error fill. `danger`
  // with no explicit variant PROP — a profile default is not an explicit
  // request — or on a solid variant still resolves to the solid `danger`
  // recipe, unchanged.
  const requestedVariant = variant || 'primary';
  const normalizedVariant = requestedVariant === 'error'
    ? 'danger'
    : requestedVariant === 'gradient'
      ? 'primary'
      : requestedVariant;
  const quietDangerTone =
    danger && variantProp !== undefined && QUIET_TONE_VARIANTS.has(normalizedVariant)
      ? 'danger'
      : undefined;
  const effectiveVariant: ModernButtonVariant = danger
    ? quietDangerTone
      ? (normalizedVariant as ModernButtonVariant)
      : 'danger'
    : isKnownVariant(normalizedVariant)
      ? normalizedVariant
      : 'primary';
  const usesGradient = gradient || requestedVariant === 'gradient';

  // -------------------------------------------------------------------------
  // Class names (no DaisyUI btn-* classes)
  // -------------------------------------------------------------------------
  const classes = modernButtonRecipe.resolve(
    {
      variant: effectiveVariant,
      size,
      shape,
      block: isFullWidth,
      loading,
      pending,
      disabled,
      shadow,
      gradient: usesGradient,
      pulse,
      bordered,
    },
    { root: className }
  ).root;

  // `busy` (pending or the deprecated loading) shares the inert interaction
  // model (no press/hover/focus affordance) but keeps its variant colour —
  // only true `disabled` dims to the disabled token.
  const isInert = disabled || busy;

  // -------------------------------------------------------------------------
  // Paint
  // -------------------------------------------------------------------------
  // Every variant, size, shape, state and inert posture is painted by
  // `foundation/tokens/css/runtime/engines/modern/skin/button.css`, keyed on the `data-*` contract
  // stamped below. The `--ds-recipe-*` variables are custom-property inputs the
  // skin consumes, not paint; a caller's own `style` prop merges after them and
  // keeps the precedence it has always had.
  const interactiveStyle: React.CSSProperties = {
    ...pressMotion.variables,
    ...style,
  };

  // -------------------------------------------------------------------------
  // Content
  // -------------------------------------------------------------------------
  const startContent = iconPosition === 'start' ? icon : undefined;
  const endContent = iconPosition === 'end' ? icon : undefined;

  const restingContentNode = (
    <>
      {startContent ? (
        <span data-part="icon" data-position="start" aria-hidden={isIconOnly ? undefined : true}>
          {startContent}
        </span>
      ) : prefix ? (
        <span data-part="prefix">{prefix}</span>
      ) : null}
      {renderedChildren.length > 0 && (
        <span data-part="label">{renderedChildren}</span>
      )}
      {endContent ? (
        <span data-part="icon" data-position="end" aria-hidden={isIconOnly ? undefined : true}>
          {endContent}
        </span>
      ) : suffix ? (
        <span data-part="suffix">{suffix}</span>
      ) : null}
    </>
  );

  // `loading` (no explicit `pending`) used to take a different render path
  // than `pending`: no reserved frame, and no label at all unless the caller
  // also passed `loadingText`. On a button that HAS a resting label, that
  // path collapsed the footprint to spinner-only width and erased the label
  // (F10) -- two opposite busy behaviors for the same family depending on
  // which of the two overlapping busy props was used. The width-stable path
  // is now the only path whenever there IS a label to preserve, regardless of
  // which busy prop requested it; `resolveButtonBusyState` itself is
  // untouched (its `widthStable` field still means "pending" specifically for
  // every OTHER caller of that contract) -- this is a render-only decision.
  const useWidthStablePath = widthStable || (busy && hasLabel);
  // When busy did not supply its own label override, the width-stable path
  // keeps the button's OWN resting label visible next to the spinner instead
  // of showing nothing (G8's "conserva la etiqueta visible cuando existe").
  const displayedBusyLabel = resolvedBusyLabel ?? (hasLabel ? renderedChildren : undefined);
  // The hidden accessible-label duplicate is needed only when the resting
  // label disappears from the accessibility tree with nothing replacing it
  // visually (icon-only busy); once `displayedBusyLabel` shows the resting
  // label itself, it already carries the accessible name.
  const accessibleBusyLabel = resolvedBusyLabel == null && !hasLabel ? children : null;
  const content = useWidthStablePath ? (
    <span data-part="content-frame">
      {/* The reserve sizes the frame, so it must reserve the WIDEST of the two
          states, not just the resting one. Reserving only the resting content
          undersized the frame whenever the busy label was longer, and the busy
          content then ellipsized against `overflow: clip` — "Submitting"
          rendering as "Su..." at 1440px with abundant free space. Swapping the
          label on busy is correct; truncating a state label never is. Both rows
          are stacked in the same grid cell so the frame takes the max width and
          the taller of the two heights. */}
      <span data-part="content" data-layer="reserve" aria-hidden="true">
        {restingContentNode}
      </span>
      {displayedBusyLabel != null && (
        <span data-part="content" data-layer="reserve" data-reserve="busy" aria-hidden="true">
          <LoadingSpinner size={size} />
          <span data-part="label">{displayedBusyLabel}</span>
        </span>
      )}
      <span data-part="busy-content" aria-live="polite">
        <LoadingSpinner size={size} />
        {displayedBusyLabel != null && <span data-part="label">{displayedBusyLabel}</span>}
      </span>
      {accessibleBusyLabel != null && (
        <VisuallyHidden data-part="accessible-label">{accessibleBusyLabel}</VisuallyHidden>
      )}
    </span>
  ) : (
    <>
      {busy && (
        <span data-part="busy-content" aria-live="polite">
          <LoadingSpinner size={size} />
          {displayedBusyLabel != null && <span data-part="label">{displayedBusyLabel}</span>}
        </span>
      )}
      <span data-part="content" data-state={busy ? 'hidden' : 'visible'} aria-hidden={busy || undefined}>
        {restingContentNode}
      </span>
      {busy && accessibleBusyLabel != null && (
        <VisuallyHidden data-part="accessible-label">{accessibleBusyLabel}</VisuallyHidden>
      )}
    </>
  );

  const chain = <Event,>(
    internal: ((event: Event) => void) | undefined,
    consumer: ((event: Event) => void) | undefined
  ) => (event: Event) => {
    internal?.(event);
    consumer?.(event);
  };

  const interactionProps = {
    onPointerEnter: chain(interactionHandlers.onPointerEnter, onPointerEnter as never),
    onPointerLeave: chain(interactionHandlers.onPointerLeave, onPointerLeave as never),
    onPointerDown: chain(interactionHandlers.onPointerDown, onPointerDown as never),
    onPointerUp: chain(interactionHandlers.onPointerUp, onPointerUp as never),
    onPointerCancel: chain(interactionHandlers.onPointerUp, onPointerCancel as never),
    onKeyDown: (event: React.KeyboardEvent<Element>) => {
      if (event.key === ' ' || event.key === 'Enter') {
        interactionHandlers.onPointerDown(event as unknown as React.PointerEvent);
      }
      (onKeyDown as unknown as React.KeyboardEventHandler<Element> | undefined)?.(event);
    },
    onKeyUp: (event: React.KeyboardEvent<Element>) => {
      if (event.key === ' ' || event.key === 'Enter') {
        interactionHandlers.onPointerUp(event as unknown as React.PointerEvent);
      }
      (onKeyUp as unknown as React.KeyboardEventHandler<Element> | undefined)?.(event);
    },
    onFocus: chain(interactionHandlers.onFocus, onFocus as never),
    onBlur: (event: React.FocusEvent<Element>) => {
      interactionHandlers.onPointerUp(event as unknown as React.PointerEvent);
      interactionHandlers.onBlur(event);
      (onBlur as unknown as React.FocusEventHandler<Element> | undefined)?.(event);
    },
  };

  const anatomyProps = {
    ...pressMotion.attributes,
    'data-variant': effectiveVariant,
    'data-size': size,
    'data-shape': shape,
    'data-radius': radius,
    // Quiet destructive grammar: present only when `danger` composed with an
    // explicit quiet variant (see the resolution above); the skin owns the
    // low-volume destructive paint for this tone.
    'data-tone': quietDangerTone,
    // The behavioral `loading` prop is authoritative when active. A composing
    // family may still request an explicit false stamp for a stable state
    // contract (for example overlay actions); P-79 requires that semantic
    // caller hook to survive when it does not contradict behavior.
    'data-loading': loading ? 'true' : nativeButtonProps['data-loading'],
    'data-pending': pending ? 'true' : undefined,
    'data-full-width': isFullWidth ? 'true' : undefined,
    'data-focus-visible': isFocused && !isInert ? 'true' : undefined,
    'data-disabled': disabled ? 'true' : undefined,
    'data-icon-only': isIconOnly ? 'true' : undefined,
    'data-size-responsive': sizeIsResponsive ? 'true' : undefined,
    'data-gradient': usesGradient ? 'true' : undefined,
    'data-shadow': shadow ? 'true' : undefined,
    'data-pulse': pulse ? 'true' : undefined,
    'data-bordered': bordered ? 'true' : undefined,
    ...partAttributes(dataPart ?? 'trigger', interaction),
    ...(responsive ? responsive.attrs : {}),
  };

  const responsiveStyleTag = responsive?.css ? (
    <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
  ) : null;

  // A navigational action remains a native anchor so open-in-new-tab,
  // context-menu and assistive-technology semantics all work. Inert links use
  // the button path below because HTML anchors have no disabled primitive.
  if (href && !isInert) {
    const safeRel = target === '_blank' ? rel ?? 'noopener noreferrer' : rel;
    return (
      <>
        {responsiveStyleTag}
        <a
          {...(nativeButtonProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
          {...interactionProps}
          {...anatomyProps}
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
          href={href}
          target={target}
          rel={safeRel}
          className={classes}
          onClick={onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}
          style={interactiveStyle}
        >
          {content}
        </a>
      </>
    );
  }

  return (
    <>
      {responsiveStyleTag}
      <button
        {...nativeButtonProps}
        {...interactionProps}
        {...anatomyProps}
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
        type={htmlType}
        className={classes}
        disabled={disabled || busy}
        onClick={onClick}
        style={interactiveStyle}
        aria-disabled={disabled || busy}
        aria-busy={busy}
      >
        {content}
      </button>
    </>
  );
});

ModernButton.displayName = 'ModernButton';

export default ModernButton;
