/**
 * @fileoverview Button Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Button component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Classic engine wraps Ant Design's Button component, providing enterprise-grade
 * features and polished animations. It maps Rottay's standardized props to Ant
 * Design's API while maintaining consistent behavior across all engines.
 *
 * **Ant Design Features Utilized:**
 * - Native button types (primary, default, dashed, link, text)
 * - Built-in loading state with spinner animation
 * - Size variants (small, middle, large)
 * - Shape options (default, circle, round)
 * - Block mode for full-width buttons
 * - Icon support with automatic positioning
 *
 * **Prop Mapping:**
 * - `variant="primary"` → `type="primary"`
 * - `variant="outline"` → `type="default"` with border
 * - `variant="ghost"` → `type="text"`
 * - `variant="danger"` → `type="primary" danger={true}`
 * - `size="sm"` → `size="small"`
 * - `size="lg"` → `size="large"`
 *
 * @example Using Classic Engine
 * ```tsx
 * import { Button } from '@rottay/design-system';
 *
 * // Explicit Classic engine (default)
 * <Button engine="classic" variant="primary">
 *   Ant Design Button
 * </Button>
 *
 * // With Ant Design-specific features
 * <Button
 *   engine="classic"
 *   variant="primary"
 *   loading
 *   icon={<SaveIcon />}
 * >
 *   Saving...
 * </Button>
 * ```
 *
 * @see {@link Button} for the main component
 * @see {@link ModernButton} for DaisyUI implementation
 * @see {@link RusticButton} for vanilla implementation
 * @module ClassicButton
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useId } from 'react';
import { Button as AntButton } from 'antd';
import type { ButtonProps, ButtonSize } from '../../contracts';
import { BUTTON_DEFAULTS, SIZE_MAP as BUTTON_SIZE_MAP, resolveButtonBusyState } from '../../contracts';
import {
  generateResponsiveCSS,
  isResponsiveValue,
  scalarOrUndefined,
  type ResponsivePropEntry,
} from '@/infrastructure/runtime/responsive/runtime/style-properties';
import type { ResponsiveValue } from '@/foundation/contracts/kernel/responsive/values';

// Translate DS variant tokens to Ant Design's `type` + `danger` props.
// "outline" maps to type="default" (Ant renders a bordered button by default).
// "ghost" maps to type="text" (borderless, transparent bg) rather than Ant's
// own `ghost` prop, which inverts colors for dark backgrounds.
const VARIANT_MAP: Record<string, { type?: 'primary' | 'default' | 'dashed' | 'link' | 'text'; danger?: boolean }> = {
  primary: { type: 'primary' },
  secondary: { type: 'default' },
  default: { type: 'default' },
  outline: { type: 'default' },
  ghost: { type: 'text' },
  text: { type: 'text' },
  dashed: { type: 'dashed' },
  danger: { type: 'primary', danger: true },
  link: { type: 'link' },
};

// DS supports 5 sizes (xs-xl) but Ant Design only has 3 (small/middle/large).
// xs and sm both collapse to "small"; lg and xl both expand to "large".
const SIZE_MAP: Record<string, 'small' | 'middle' | 'large'> = {
  xs: 'small',
  sm: 'small',
  md: 'middle',
  lg: 'large',
  xl: 'large',
};

// Shape mapping is 1:1 with Ant Design's shape options.
const SHAPE_MAP: Record<string, 'default' | 'circle' | 'round'> = {
  default: 'default',
  round: 'round',
  circle: 'circle',
};

/**
 * Classic (Ant Design) implementation of the DS Button.
 *
 * Normalizes Rottay DS props (variant, size, shape, iconPosition) into Ant
 * Design's API, then delegates all rendering and interaction to `antd/Button`.
 * The ref type is `any` because Ant's internal ref can be either an HTMLElement
 * or a component instance depending on the rendered element (button vs anchor).
 *
 * @param props - Standardized ButtonProps from the DS type contract.
 * @param ref   - Forwarded ref passed through to Ant Design's Button.
 * @returns An Ant Design Button with DS class-name hooks for external styling.
 */
const ClassicButton = forwardRef<any, ButtonProps>((props, ref) => {
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
    href,
    target,
    onClick,
    className = '',
    style,
    id,
    'aria-label': ariaLabel,
    'data-testid': dataTestId,
    tabIndex,
    ...nativeButtonProps
  } = props;

  // Single documented resolution point for the overlapping busy props (see
  // `resolveButtonBusyState` in Button.types.ts). `pending` maps onto the
  // classic engine's existing busy state (Ant renders a spinner and blocks
  // interaction); the width-stable posture is modern-only, so only the
  // merged `busy` flag and resolved label are used here.
  const { busy, label: resolvedBusyLabel } = resolveButtonBusyState({
    pending,
    pendingLabel,
    loading: loadingProp,
    loadingText,
  });
  const loading = busy;

  // `fullWidth` is the DS-preferred name; `block` is kept for backward
  // compatibility with Ant Design's naming convention.
  const isFullWidth = fullWidth ?? block;

  // Responsive size handling
  const reactId = useId();
  const responsiveEntries: ResponsivePropEntry<any>[] = [];
  const sizeIsResponsive = isResponsiveValue(sizeProp);

  if (sizeIsResponsive) {
    // Use !important to override Ant Design's inline button styles
    responsiveEntries.push({
      cssProperty: 'height',
      value: sizeProp,
      resolve: (v: ButtonSize) => `${(BUTTON_SIZE_MAP[v as keyof typeof BUTTON_SIZE_MAP] || BUTTON_SIZE_MAP.md).height} !important`,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'padding',
      value: sizeProp,
      resolve: (v: ButtonSize) => `${(BUTTON_SIZE_MAP[v as keyof typeof BUTTON_SIZE_MAP] || BUTTON_SIZE_MAP.md).padding} !important`,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'font-size',
      value: sizeProp,
      resolve: (v: ButtonSize) => `${(BUTTON_SIZE_MAP[v as keyof typeof BUTTON_SIZE_MAP] || BUTTON_SIZE_MAP.md).fontSize} !important`,
    } as ResponsivePropEntry<any>);
  }

  const needsResponsiveCSS = responsiveEntries.length > 0;
  const elementId = needsResponsiveCSS ? `btn-${reactId.replace(/:/g, '')}` : '';
  const responsive = needsResponsiveCSS
    ? generateResponsiveCSS(elementId, responsiveEntries)
    : null;

  const size = scalarOrUndefined(sizeProp) ?? BUTTON_DEFAULTS.size;

  // Explicit `danger` prop takes precedence over `variant="danger"` so
  // consumers can toggle danger mode independently of the base variant.
  const effectiveVariant = danger ? 'danger' : (variant || 'primary');
  const variantProps = VARIANT_MAP[effectiveVariant] || VARIANT_MAP.primary;

  // BEM class names allow external CSS to target engine-specific styles
  // without leaking into other engines.
  const classNames = [
    'rottay-button',
    `rottay-button--classic`,
    className,
  ].filter(Boolean).join(' ');

  // Ant Design's `icon` prop only supports start-positioned icons.
  // End-positioned icons are rendered manually after children.
  const startIcon = iconPosition === 'start' ? icon : undefined;
  const endIcon = iconPosition === 'end' ? icon : undefined;
  const passthroughProps = nativeButtonProps as Partial<React.ComponentProps<typeof AntButton>>;

  return (
    <>
      {responsive && responsive.css && (
        <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
      )}
      <AntButton
        {...passthroughProps}
        ref={ref}
        {...variantProps}
        size={SIZE_MAP[size || 'md']}
        shape={SHAPE_MAP[shape || 'default']}
        disabled={disabled}
        loading={loading}
        // `prefix` is an alternative to `icon` for non-icon start content
        // (e.g., a badge or avatar). Only one is used at a time.
        icon={startIcon || prefix}
        block={isFullWidth}
        htmlType={htmlType}
        href={href}
        target={target}
        onClick={onClick}
        className={classNames}
        style={style}
        id={id}
        aria-label={ariaLabel}
        data-testid={dataTestId}
        tabIndex={tabIndex}
        aria-busy={loading || undefined}
        {...(responsive ? responsive.attrs : {})}
      >
        {loading && resolvedBusyLabel != null ? resolvedBusyLabel : children}
        {/* End icon / suffix is rendered outside Ant's icon slot because Ant
            only supports a single icon position (start). The left margin is
            removed when there are no children to avoid asymmetric spacing. */}
        {(endIcon || suffix) && (
          <span style={{ marginLeft: children ? 8 : 0 }}>
            {endIcon || suffix}
          </span>
        )}
      </AntButton>
    </>
  );
});

ClassicButton.displayName = 'ClassicButton';

export default ClassicButton;
