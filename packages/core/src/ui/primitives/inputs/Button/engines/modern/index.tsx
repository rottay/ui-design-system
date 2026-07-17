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
 * `data-size-responsive`, and the `data-part` / `data-state` anatomy attributes
 * from `behavior/anatomy.ts`. No DaisyUI btn-* classes are used. A caller's own
 * `style` prop is the only inline declaration on the element.
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
 * - Secondary: Bordered with transparent bg, subtle fill on hover
 * - Ghost: No border, minimal hover bg
 * - Danger: Red-tinted, same interaction model as primary
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
import type { ButtonProps, ButtonSize } from '../../contracts';
import { BUTTON_DEFAULTS, SIZE_MAP as BUTTON_SIZE_MAP, resolveButtonBusyState } from '../../contracts';
import {
  generateResponsiveCSS,
  isResponsiveValue,
  scalarOrUndefined,
  type ResponsivePropEntry,
} from '@/infrastructure/runtime/responsive/runtime/style-properties';
import type { ResponsiveValue } from '@/foundation/contracts/kernel/responsive/values';

/**
 * The variants the modern skin paints. An unknown variant falls back to
 * `primary` for the className, the `data-variant` attribute and therefore the
 * paint, all three together.
 *
 * The paint itself lives in `foundation/tokens/css/runtime/engines/modern/skin/button.css`, keyed
 * on `data-variant`. This set is the contract those rules answer to; a variant
 * added here without a rule there renders unpainted, and the state matrix in
 * `packages/showroom/e2e/visual/states.spec.ts` is what says so.
 */
const KNOWN_VARIANTS: ReadonlySet<string> = new Set([
  'primary',
  'secondary',
  'default',
  'outline',
  'ghost',
  'text',
  'dashed',
  'danger',
  'success',
  'warning',
  'info',
  'link',
]);

// ---------------------------------------------------------------------------
// Loading spinner
// ---------------------------------------------------------------------------
/**
 * Custom SVG loading spinner. Uses currentColor so it inherits the button's
 * text color. Size-aware: smaller buttons get a smaller spinner.
 */
const LoadingSpinner: React.FC<{ size?: string }> = ({ size = 'md' }) => {
  const spinnerSize =
    size === 'xs' ? 12
    : size === 'sm' ? 14
    : size === 'lg' || size === 'xl' ? 18
    : 16;

  return (
    <svg
      width={spinnerSize}
      height={spinnerSize}
      viewBox="0 0 24 24"
      fill="none"
      style={{
        animation: 'rottay-button-spin var(--ds-motion-glacial) linear infinite',
        flexShrink: 0,
      }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="31.416"
        strokeDashoffset="10"
        opacity="0.2"
      />
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2.5"
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
const ModernButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    children,
    variant = BUTTON_DEFAULTS.variant,
    size: sizeProp = BUTTON_DEFAULTS.size,
    shape = BUTTON_DEFAULTS.shape,
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
    onClick,
    className = '',
    style,
    ...nativeButtonProps
  } = props;

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
  const isFocused = interaction.focusVisible;

  const isFullWidth = fullWidth ?? block;
  const isIconOnly = !children && (icon || prefix || suffix);

  // -------------------------------------------------------------------------
  // Responsive size handling
  // -------------------------------------------------------------------------
  const reactId = useId();
  const responsiveEntries: ResponsivePropEntry<any>[] = [];
  const sizeIsResponsive = isResponsiveValue(sizeProp);

  if (sizeIsResponsive) {
    responsiveEntries.push({
      cssProperty: 'height',
      value: sizeProp,
      resolve: (v: ButtonSize) => (BUTTON_SIZE_MAP[v as keyof typeof BUTTON_SIZE_MAP] || BUTTON_SIZE_MAP.md).height,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'padding',
      value: sizeProp,
      resolve: (v: ButtonSize) => (BUTTON_SIZE_MAP[v as keyof typeof BUTTON_SIZE_MAP] || BUTTON_SIZE_MAP.md).padding,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'font-size',
      value: sizeProp,
      resolve: (v: ButtonSize) => (BUTTON_SIZE_MAP[v as keyof typeof BUTTON_SIZE_MAP] || BUTTON_SIZE_MAP.md).fontSize,
    } as ResponsivePropEntry<any>);
  }

  const needsResponsiveCSS = responsiveEntries.length > 0;
  const elementId = needsResponsiveCSS ? `btn-${reactId.replace(/:/g, '')}` : '';
  const responsive = needsResponsiveCSS
    ? generateResponsiveCSS(elementId, responsiveEntries)
    : null;

  const size = scalarOrUndefined(sizeProp) ?? BUTTON_DEFAULTS.size;

  // Explicit `danger` prop takes priority over `variant`.
  // Unknown variants fall back to the public primary contract for className,
  // data attributes, and inline styles consistently.
  const requestedVariant = variant || 'primary';
  const effectiveVariant = danger
    ? 'danger'
    : KNOWN_VARIANTS.has(requestedVariant)
      ? requestedVariant
      : 'primary';

  // -------------------------------------------------------------------------
  // Class names (no DaisyUI btn-* classes)
  // -------------------------------------------------------------------------
  const classes = [
    'rottay-button',
    'rottay-button--modern',
    `rottay-button--${effectiveVariant}`,
    `rottay-button--${size}`,
    `rottay-button--${shape}`,
    isFullWidth && 'rottay-button--block',
    loading && 'rottay-button--loading',
    pending && 'rottay-button--pending',
    disabled && 'rottay-button--disabled',
    shadow && 'rottay-button--shadow',
    className,
  ].filter(Boolean).join(' ');

  // `busy` (pending or the deprecated loading) shares the inert interaction
  // model (no press/hover/focus affordance) but keeps its variant colour —
  // only true `disabled` dims to the disabled token.
  const isInert = disabled || busy;

  // -------------------------------------------------------------------------
  // Paint
  // -------------------------------------------------------------------------
  // Every variant, size, shape, state and inert posture is painted by
  // `foundation/tokens/css/runtime/engines/modern/skin/button.css`, keyed on the `data-*` contract
  // stamped below. Only a caller's own `style` prop survives as an inline
  // declaration, which is the precedence it has always had.
  const interactiveStyle: React.CSSProperties | undefined = style;

  // -------------------------------------------------------------------------
  // Content
  // -------------------------------------------------------------------------
  const startContent = iconPosition === 'start' ? icon : undefined;
  const endContent = iconPosition === 'end' ? icon : undefined;
  const renderedChildren = React.Children.toArray(children);

  // Content opacity when busy (smooth fade)
  const contentOpacity: React.CSSProperties = busy ? {
    opacity: 0,
    position: 'absolute' as const,
    pointerEvents: 'none' as const,
  } : {};

  // Single source of truth for the resting content's layout, shared by the
  // resting/loading render path (visible) and the `pending` width-stable
  // overlay's hidden layer (invisible but in flow). Keeping ONE copy means
  // the two can never drift apart and silently break width stability.
  const restingContentStyle: React.CSSProperties = {
    display: isFullWidth ? 'flex' : 'inline-flex',
    alignItems: 'center',
    justifyContent: isFullWidth ? 'inherit' : undefined,
    gap: 'var(--ds-spacing-2, 8px)',
    width: isFullWidth ? '100%' : undefined,
    minWidth: 0,
    whiteSpace: isFullWidth ? 'normal' : 'nowrap',
  };

  const restingContentNode = (
    <>
      {startContent || prefix}
      {renderedChildren.length > 0 && (
        <span
          style={{
            display: isFullWidth ? 'block' : 'inline',
            flex: isFullWidth ? '1 1 auto' : undefined,
            width: isFullWidth ? '100%' : undefined,
            minWidth: 0,
            whiteSpace: isFullWidth ? 'normal' : 'inherit',
          }}
        >
          {renderedChildren}
        </span>
      )}
      {endContent || suffix}
    </>
  );

  return (
    <>
      {responsive && responsive.css && (
        <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
      )}
      <button
        {...nativeButtonProps}
        ref={ref}
        type={htmlType}
        className={classes}
        disabled={disabled || busy}
        onClick={onClick}
        style={interactiveStyle}
        {...interactionHandlers}
        aria-disabled={disabled || busy}
        aria-busy={busy}
        data-variant={effectiveVariant}
        data-size={size}
        data-shape={shape}
        data-loading={loading ? 'true' : undefined}
        data-pending={pending ? 'true' : undefined}
        data-full-width={isFullWidth ? 'true' : undefined}
        data-focus-visible={isFocused && !isInert ? 'true' : undefined}
        // The `disabled` PROP, which the DOM `disabled` attribute above cannot
        // stand in for: that attribute is `disabled || busy`, and a pending
        // button keeps its variant colour while a disabled one dims.
        data-disabled={disabled ? 'true' : undefined}
        data-icon-only={isIconOnly ? 'true' : undefined}
        // A responsively-sized button takes its box from the generated
        // breakpoint rules below, not from the skin's static size rules.
        data-size-responsive={sizeIsResponsive ? 'true' : undefined}
        {...partAttributes('trigger', interaction)}
        {...(responsive ? responsive.attrs : {})}
      >
        {widthStable ? (
          // Width-stable busy posture (`pending`): the resting content renders
          // at `visibility: hidden` in normal flow, so it ALONE determines this
          // wrapper's box. The spinner + resolved label render in an
          // absolutely-positioned overlay inside that box, which cannot grow
          // it. A `resolvedBusyLabel` wider than the resting content clips
          // (`overflow: hidden`) instead of reflowing the button -- this is
          // what makes the width guarantee unconditional, not just true for
          // short labels.
          <span
            style={{
              position: 'relative',
              display: isFullWidth ? 'flex' : 'inline-flex',
              alignItems: 'center',
              justifyContent: isFullWidth ? 'inherit' : undefined,
              width: isFullWidth ? '100%' : undefined,
              minWidth: 0,
            }}
          >
            <span aria-hidden="true" style={{ ...restingContentStyle, visibility: 'hidden' }}>
              {restingContentNode}
            </span>
            <span
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--ds-spacing-2, 8px)',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              <LoadingSpinner size={size} />
              {resolvedBusyLabel != null && (
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{resolvedBusyLabel}</span>
              )}
            </span>
          </span>
        ) : (
          <>
            {/* Busy spinner - centered, replaces content. Label-less busy still
                lets the button shrink to spinner-only width -- use `pending`
                instead when the box must never reflow. */}
            {busy && <LoadingSpinner size={size} />}
            {busy && resolvedBusyLabel != null && <span>{resolvedBusyLabel}</span>}

            {/* Content wrapper - hidden (but in DOM) during busy for layout stability */}
            <span
              style={{
                ...restingContentStyle,
                transition: `opacity var(--ds-motion-fast) var(--ds-motion-ease-out)`,
                ...contentOpacity,
              }}
            >
              {restingContentNode}
            </span>
          </>
        )}
      </button>
    </>
  );
});

ModernButton.displayName = 'ModernButton';

export default ModernButton;
