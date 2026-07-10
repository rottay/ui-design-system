/**
 * @fileoverview Button Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Button component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Rustic engine provides a headless button implementation using only
 * native HTML elements and CSS custom properties. This offers maximum
 * flexibility for custom styling and ensures accessibility compliance.
 *
 * **Key Features:**
 * - Zero UI library dependencies
 * - Full CSS custom property theming
 * - Native HTML button and anchor element support
 * - Built-in hover, focus, and active states
 * - Loading spinner with CSS animation
 * - Link support via `href` prop (renders as anchor)
 *
 * **Additional Props (Rustic-specific):**
 * - `shadow` - Adds box-shadow for elevated appearance
 * - `gradient` - Applies gradient background
 * - `pulse` - Adds pulsing animation for attention
 * - `bordered` - Forces visible border
 *
 * **CSS Custom Properties:**
 * All styling is controlled via CSS variables, making it easy to theme:
 * - `--ds-button-{variant}-bg` - Background colors
 * - `--ds-button-{variant}-color` - Text colors
 * - `--ds-button-{size}-height` - Heights per size
 * - `--ds-button-transition` - Transition timing
 *
 * **Accessibility:**
 * - Proper ARIA attributes (aria-disabled, aria-busy)
 * - Keyboard navigation support
 * - Focus visible styles
 *
 * @example Using Rustic Engine
 * ```tsx
 * import { Button } from '@rottay/design-system';
 *
 * // Explicit Rustic engine
 * <Button engine="rustic" variant="primary">
 *   Vanilla Button
 * </Button>
 *
 * // With Rustic-specific features
 * <Button
 *   engine="rustic"
 *   variant="primary"
 *   shadow
 *   gradient
 *   pulse
 * >
 *   Attention!
 * </Button>
 *
 * // As a link
 * <Button
 *   engine="rustic"
 *   variant="link"
 *   href="/dashboard"
 *   target="_blank"
 * >
 *   Go to Dashboard
 * </Button>
 * ```
 *
 * @see {@link Button} for the main component
 * @see {@link ClassicButton} for Ant Design implementation
 * @see {@link ModernButton} for DaisyUI implementation
 * @module RusticButton
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useId, type AnchorHTMLAttributes } from 'react';

import { partAttributes, useInteractionState } from '../../../../../behavior';
import type { ButtonProps, ButtonSize } from '../Button.types';
import { BUTTON_DEFAULTS, SIZE_MAP, VARIANT_MAP, SHAPE_MAP, resolveButtonBusyState } from '../Button.types';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '../../../layout/shared/responsive-props';
import type { ResponsiveValue } from '../../../layout/shared/types';
import { scalarOrUndefined } from '../../../layout/shared/responsive-helpers.js';

/**
 * Loading spinner component for Rustic engine
 */
const LoadingSpinner: React.FC<{ size?: string }> = ({ size = 'md' }) => {
  const spinnerSize = size === 'xs' || size === 'sm' ? 12 : size === 'lg' || size === 'xl' ? 18 : 14;

  return (
    <svg
      className="rottay-button__spinner"
      width={spinnerSize}
      height={spinnerSize}
      viewBox="0 0 24 24"
      fill="none"
      style={{
        animation: 'rottay-button-spin 1s linear infinite',
      }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.416"
        strokeDashoffset="10"
        opacity="0.25"
      />
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.416"
        strokeDashoffset="25"
      />
    </svg>
  );
};

/**
 * Rustic (vanilla HTML/CSS) implementation of the DS Button.
 *
 * All styling is computed via inline styles referencing CSS custom properties,
 * so no Tailwind or Ant Design classes are needed. Hover, focus, and active
 * states are tracked in React state because inline styles override CSS
 * pseudo-classes. When `href` is provided, renders an `<a>` tag for proper
 * link semantics.
 *
 * @param props - Standardized ButtonProps from the DS type contract, plus
 *                rustic-specific extras: `shadow`, `gradient`, `pulse`, `bordered`.
 * @param ref   - Forwarded ref attached to the native `<button>` element.
 * @returns A fully themed button rendered without any UI library dependency.
 */
const RusticButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      children,
      variant = BUTTON_DEFAULTS.variant,
      size: sizeProp = BUTTON_DEFAULTS.size,
      shape = BUTTON_DEFAULTS.shape,
      htmlType = BUTTON_DEFAULTS.htmlType,
      disabled = BUTTON_DEFAULTS.disabled,
      loading: loadingProp = BUTTON_DEFAULTS.loading,
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
      href,
      target,
      onClick,
      className = '',
      style = {},
      ...rest
    } = props;

    // Single documented resolution point for the overlapping busy props (see
    // `resolveButtonBusyState` in Button.types.ts). `pending` maps onto the
    // rustic engine's existing busy state (spinner + blocked interaction);
    // the width-stable posture is modern-only, so only the merged `busy`
    // flag and resolved label are used here.
    const { busy, label: resolvedBusyLabel } = resolveButtonBusyState({
      pending,
      pendingLabel,
      loading: loadingProp,
      loadingText,
    });
    const loading = busy;
    const busyLabel = loading && resolvedBusyLabel != null ? resolvedBusyLabel : children;

    const isFullWidth = fullWidth ?? block;

    // Hover/focus/active are managed in React state because inline styles
    // take precedence over CSS pseudo-classes. This enables smooth
    // three-state transforms (idle -> hover -> active) without stylesheets.
    // Shared with the modern skin. The two engines paint a press differently --
    // modern uses --ds-state-press-scale, rustic --ds-button-active-transform --
    // but they no longer disagree about WHEN a part is pressed.
    // `busy` is inert, not merely styled inert: a control that cannot be
    // activated must not report hover or press. The modern engine constructs the
    // triad the same way, and `behavior/anatomy.ts` exists so the two cannot
    // answer this differently.
    const { state: interaction, handlers: interactionHandlers } = useInteractionState({
      disabled: disabled || busy,
    });
    const isHovered = interaction.hovered;
    const isFocused = interaction.focusVisible;
    const isActive = interaction.pressed;

    // Responsive size handling
    const reactId = useId();
    const responsiveEntries: ResponsivePropEntry<any>[] = [];
    const sizeIsResponsive = isResponsiveValue(sizeProp);

    if (sizeIsResponsive) {
      responsiveEntries.push({
        cssProperty: 'height',
        value: sizeProp,
        resolve: (v: ButtonSize) => (SIZE_MAP[v as keyof typeof SIZE_MAP] || SIZE_MAP.md).height,
      } as ResponsivePropEntry<any>);
      responsiveEntries.push({
        cssProperty: 'padding',
        value: sizeProp,
        resolve: (v: ButtonSize) => (SIZE_MAP[v as keyof typeof SIZE_MAP] || SIZE_MAP.md).padding,
      } as ResponsivePropEntry<any>);
      responsiveEntries.push({
        cssProperty: 'font-size',
        value: sizeProp,
        resolve: (v: ButtonSize) => (SIZE_MAP[v as keyof typeof SIZE_MAP] || SIZE_MAP.md).fontSize,
      } as ResponsivePropEntry<any>);
    }

    const needsResponsiveCSS = responsiveEntries.length > 0;
    const elementId = needsResponsiveCSS ? `btn-${reactId.replace(/:/g, '')}` : '';
    const responsive = needsResponsiveCSS
      ? generateResponsiveCSS(elementId, responsiveEntries)
      : null;

    const size = scalarOrUndefined(sizeProp) ?? BUTTON_DEFAULTS.size;

    // Resolve configuration objects from the shared type maps. These maps
    // live in Button.types.ts so all three engines share the same token
    // definitions for sizes, variants, and shapes.
    const sizeConfig = SIZE_MAP[size as keyof typeof SIZE_MAP] || SIZE_MAP.md;
    const effectiveVariant = danger ? 'danger' : (variant || 'primary');
    const variantConfig = VARIANT_MAP[effectiveVariant as keyof typeof VARIANT_MAP] || VARIANT_MAP.primary;
    const shapeRadius = SHAPE_MAP[shape as keyof typeof SHAPE_MAP] || SHAPE_MAP.default;

    // Compute effective background with hover state. The variant map already
    // includes token fallbacks, so avoid nesting the same CSS var inside another
    // var() call; that keeps both browsers and DOM test parsers on a simple path.
    const effectiveBg = isHovered && !disabled && !loading
      ? variantConfig.hoverBg
      : variantConfig.bg;

    // All button styles are computed inline because rustic engine cannot rely
    // on Tailwind/antd classes. Hover, focus, and active states are managed
    // through React state + inline style mutations (not CSS :hover/:focus)
    // since inline styles have higher specificity than pseudo-classes.
    const buttonStyle: React.CSSProperties = {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      // When size is responsive, height/padding/fontSize are handled by injected CSS
      ...(!sizeIsResponsive && {
        height: sizeConfig.height,
        ...(shape === 'circle'
          ? { paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0 }
          : { padding: sizeConfig.padding }),
        fontSize: sizeConfig.fontSize,
      }),
      width: isFullWidth ? '100%' : (shape === 'circle' ? sizeConfig.height : 'auto'),
      minWidth: shape === 'circle' ? sizeConfig.height : 'auto',
      fontWeight: 500,
      fontFamily: 'inherit',
      lineHeight: 1.5,
      textAlign: 'center',
      textDecoration: effectiveVariant === 'link' ? (isHovered ? 'underline' : 'none') : 'none',
      whiteSpace: 'nowrap',
      verticalAlign: 'middle',
      background: gradient
        ? `linear-gradient(135deg, ${variantConfig.bg} 0%, ${variantConfig.hoverBg} 100%)`
        : effectiveBg,
      color: variantConfig.color,
      border: effectiveVariant === 'dashed'
        ? `1px dashed ${variantConfig.borderColor}`
        : bordered || ['outline', 'secondary', 'default'].includes(effectiveVariant)
          ? `1px solid ${variantConfig.borderColor}`
          : '1px solid transparent',
      borderRadius: shapeRadius,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'var(--ds-button-transition, all 150ms ease)',
      outline: 'none',
      boxSizing: 'border-box',
      userSelect: 'none',
      // touchAction: manipulation disables double-tap zoom on mobile,
      // preventing the 300ms click delay on touch devices.
      touchAction: 'manipulation',
      boxShadow: isFocused
        ? 'var(--ds-button-focus-ring, 0 0 0 3px var(--ds-color-primary-200)), 0 0 12px rgba(0, 102, 204, 0.15)'
        : shadow || (isHovered && !disabled && !loading)
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          : 'none',
      // Three-state transform: active presses in (0.97), hover lifts up (-1px),
      // default is identity. translateY(0) scale(1) is explicit so the
      // transition property has a value to animate from.
      transform:
        isActive && !disabled && !loading
          ? 'var(--ds-button-active-transform, scale(0.97))'
          : isHovered && !disabled && !loading
            ? 'var(--ds-button-hover-transform, translateY(-1px) scale(1.01))'
            : 'translateY(0) scale(1)',
      animation: pulse ? 'rottay-button-pulse 2s infinite' : 'none',
      ...style,
    };

    // Build class names
    const classNames = [
      'rottay-button',
      'rottay-button--rustic',
      `rottay-button--${size}`,
      `rottay-button--${effectiveVariant}`,
      `rottay-button--${shape}`,
      isFullWidth && 'rottay-button--block',
      loading && 'rottay-button--loading',
      disabled && 'rottay-button--disabled',
      shadow && 'rottay-button--shadow',
      gradient && 'rottay-button--gradient',
      className,
    ].filter(Boolean).join(' ');

    // Guard click handler so disabled/loading buttons never fire onClick.
    // The native `disabled` attribute already blocks clicks on <button>,
    // but this guard is needed for the <a> branch and for extra safety.
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    // Icons and prefix are hidden during loading so the spinner is the
    // only visual indicator. Suffix remains visible because it often
    // contains contextual information (e.g., a keyboard shortcut hint).
    const renderIcon = icon && !loading ? icon : null;
    const renderPrefix = prefix && !loading ? prefix : null;
    const renderSuffix = suffix ? suffix : null;

    const responsiveAttrs = responsive ? responsive.attrs : {};
    const responsiveStyleTag = responsive && responsive.css ? (
      <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
    ) : null;
    const anchorProps = rest as AnchorHTMLAttributes<HTMLAnchorElement>;

    // When href is set, render an <a> instead of <button> for correct
    // semantics (screen readers announce it as a link, browser features like
    // Cmd+Click to open in new tab work). Disabled links stay as <button>.
    if (href && !disabled && !loading) {
      return (
        <>
          {responsiveStyleTag}
          <a
            {...anchorProps}
            href={href}
            target={target}
            className={classNames}
            style={buttonStyle}
            {...interactionHandlers}
            {...partAttributes('trigger', interaction)}
            {...responsiveAttrs}
          >
            {loading && <LoadingSpinner size={size} />}
            {!loading && iconPosition === 'start' && renderIcon}
            {!loading && renderPrefix}
            {busyLabel && <span className="rottay-button__content">{busyLabel}</span>}
            {renderSuffix}
            {!loading && iconPosition === 'end' && renderIcon}
          </a>
        </>
      );
    }

    return (
      <>
        {responsiveStyleTag}
        <button
          ref={ref}
          type={htmlType}
          className={classNames}
          style={buttonStyle}
          disabled={disabled || loading}
          onClick={handleClick}
          {...interactionHandlers}
          {...partAttributes('trigger', interaction)}
          aria-disabled={disabled || loading}
          aria-busy={loading}
          {...responsiveAttrs}
          {...rest}
        >
          {loading && <LoadingSpinner size={size} />}
          {!loading && iconPosition === 'start' && renderIcon}
          {!loading && renderPrefix}
          {busyLabel && <span className="rottay-button__content">{busyLabel}</span>}
          {renderSuffix}
          {!loading && iconPosition === 'end' && renderIcon}
        </button>
      </>
    );
  }
);

RusticButton.displayName = 'RusticButton';

export default RusticButton;
