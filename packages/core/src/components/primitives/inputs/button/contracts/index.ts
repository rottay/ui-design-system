/**
 * @fileoverview Button Types - Rottay Design System
 * @description Type definitions, interfaces, and constants for the Button component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module provides comprehensive type definitions for the Button component,
 * including all props, variants, sizes, shapes, and configuration objects.
 *
 * **Available Types:**
 * - `ButtonProps` - Main component props interface
 * - `ButtonSize` - Size variants (xs, sm, md, lg, xl)
 * - `ButtonVariant` - Visual style variants (primary, secondary, outline, etc.)
 * - `ButtonShape` - Shape options (default, round, circle)
 * - `ButtonGroupProps` - Props for Button.Group compound component
 * - `IconButtonProps` - Props for icon-only buttons
 *
 * **CSS Custom Properties:**
 * The type definitions include mappings to CSS variables for consistent theming:
 * - Size: `--ds-button-{size}-height`, `--ds-button-{size}-padding`, `--ds-button-{size}-font-size`
 * - Variant: `--ds-button-{variant}-bg`, `--ds-button-{variant}-color`, etc.
 * - Shape: `--ds-button-border-radius`, `--ds-button-border-radius-round`, etc.
 *
 * @example Using Types
 * ```tsx
 * import type { ButtonProps, ButtonSize, ButtonVariant } from '@rottay/design-system';
 *
 * // Custom button wrapper with typed props
 * const MyButton: React.FC<ButtonProps> = (props) => {
 *   return <Button {...props} />;
 * };
 *
 * // Typed size and variant
 * const size: ButtonSize = 'lg';
 * const variant: ButtonVariant = 'primary';
 * ```
 *
 * @example Using Constants
 * ```tsx
 * import { BUTTON_DEFAULTS, SIZE_MAP, VARIANT_MAP } from '@rottay/design-system';
 *
 * // Access default values
 * console.log(BUTTON_DEFAULTS.variant); // 'primary'
 * console.log(BUTTON_DEFAULTS.size);    // 'md'
 *
 * // Access CSS variable mappings
 * console.log(SIZE_MAP.lg.height); // 'var(--ds-button-lg-height)'
 * ```
 *
 * @see {@link Button} for the main component
 * @see {@link ButtonGroup} for grouping buttons
 * @module ButtonTypes
 * @category Inputs
 * @package @rottay/design-system
 */

import type { ReactNode, MouseEvent, ButtonHTMLAttributes } from 'react';
import type { BaseComponentProps, ControlChrome, DisableableProps } from '../../../../../foundation/contracts/kernel/common';
import type { EngineAwareProps } from '../../../../../foundation/contracts/runtime/engine';
import type { ResponsiveValue } from '@/foundation/contracts/kernel/responsive/values';
import type { ButtonRecipeSizeValue } from '@/infrastructure/runtime/foundation/recipes/contracts/families';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Button size steps backed by the public Button token contract and both
 * first-party skins. Larger display-scale steps belong to components that
 * actually publish `2xl`/`3xl` geometry rather than falling back silently.
 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Button variants.
 */
export type ButtonVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'gradient'
  | 'outline'
  | 'info'
  | 'text'
  | 'link'
  | 'ghost'
  | 'dashed'
  | 'danger'
  | 'ai';

/**
 * Button shapes.
 */
export type ButtonShape = 'default' | 'circle' | 'round';

/**
 * Button HTML types.
 */
export type ButtonHtmlType = 'button' | 'submit' | 'reset';

/**
 * Button component props: the contract the family publishes as `ButtonProps`.
 *
 * The inherited `data-part` and a caller `data-state` are accepted but never
 * stamped by the modern and rustic engines: the Button owns `trigger` and its
 * own state (P-88). Compose through `className`.
 */
export interface ButtonPublicProps extends BaseComponentProps, EngineAwareProps, DisableableProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'onClick' | 'prefix' | 'dir'> {
  /**
   * @deprecated No engine renders a caller part since ARC-12 step 3 (P-88). Use `className`.
   */
  'data-part'?: string;
  /**
   * @deprecated No engine renders a caller state since ARC-12 step 3 (P-88). Use `className`.
   */
  'data-state'?: string | number | boolean | undefined;
  /**
   * Button size. Accepts a plain value or a responsive breakpoint object.
   * @default 'md'
   * @example
   * ```tsx
   * <Button size="lg" />
   * <Button size={{ base: 'sm', md: 'md', xl: 'lg' }} />
   * ```
   */
  size?: ResponsiveValue<ButtonSize>;

  /**
   * Button color variant.
   * @default 'default'
   */
  variant?: ButtonVariant;

  /**
   * Button shape.
   * @default 'default'
   */
  /**
   * `none` renders the Modern button without its chrome (height floor, padding, paint) for a host that
   * paints it; behaviour, focus ring, forced-colours state arms and touch floor are kept. Modern only.
   * @internal
   * @default 'standard'
   */
  chrome?: ControlChrome;
  shape?: ButtonShape;

  /**
   * Button HTML type.
   * @default 'button'
   */
  htmlType?: ButtonHtmlType;

  /**
   * Icon to show in the button.
   */
  icon?: ReactNode;

  /**
   * Icon position.
   * @default 'start'
   */
  iconPosition?: 'start' | 'end';

  /**
   * Whether the button takes full available width.
   */
  block?: boolean;

  /**
   * Whether the button takes full width of its container.
   * Alias for `block` prop.
   */
  fullWidth?: boolean;

  /**
   * Whether the button has danger/destructive state.
   *
   * @remarks
   * `danger` with no explicit `variant` (or on a solid variant) resolves to
   * the solid `danger` recipe — the primary destructive commitment. `danger`
   * combined with an explicitly requested QUIET variant (`ghost`, `text`,
   * `link`, `default`, `outline`, `dashed`) keeps that variant and stamps
   * `data-tone="danger"` instead: the modern skin paints the low-volume
   * destructive grammar (error ink + tempered wash) from the governed error
   * channels. The DOM tree is identical either way; only the state
   * attributes differ.
   */
  danger?: boolean;

  /**
   * Click callback.
   */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;

  /**
   * Button content (text, nodes, etc).
   */
  children?: ReactNode;

  /**
   * URL if the button acts as a link.
   */
  href?: string;

  /**
   * Target if the button acts as a link.
   */
  target?: '_blank' | '_self' | '_parent' | '_top';

  /**
   * Relationship hints for link buttons. When `target="_blank"` is used and
   * no value is provided, Modern adds `noopener noreferrer` defensively.
   */
  rel?: string;

  /**
   * Button border radius.
   * @default 'md'
   */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';

  /**
   * Whether the button has a shadow.
   */
  shadow?: boolean;

  /**
   * Whether the button has a gradient effect.
   */
  gradient?: boolean;

  /**
   * Whether the button pulses (animation).
   */
  pulse?: boolean;

  /**
   * Whether the button has a border.
   * Only applies to certain variants.
   */
  bordered?: boolean;

  /**
   * Prefix before content (alternative to icon with position='start').
   */
  prefix?: ReactNode;

  /**
   * Suffix after content (alternative to icon with position='end').
   */
  suffix?: ReactNode;

  /**
   * Pending posture for mutation-triggering buttons: swaps the label for a
   * spinner WITHOUT a width jump, keeps the button `disabled` and
   * `aria-busy`, and transitions on the state motion tokens. This is the
   * only busy prop.
   *
   * @remarks
   * The resting label's box is always reserved: a hidden layer holds the
   * original content in normal flow, and the spinner plus resolved label
   * render in an absolutely-positioned overlay inside that reserved box. The
   * button's width is therefore IDENTICAL whether `pending` is true or
   * false -- even when the resolved label is longer than the resting label,
   * in which case the overlay clips (`overflow: hidden`) instead of growing
   * the button. This holds unconditionally, not only for short labels.
   *
   * The modern engine implements the full width-stable posture; the classic
   * and rustic engines map `pending` onto their own busy state (width
   * stability is modern-only).
   */
  pending?: boolean;

  /**
   * Optional label shown beside the spinner while the button is `pending`.
   * When it is not set, the button's existing children are kept, so the busy
   * swap never changes the button's size.
   */
  pendingLabel?: ReactNode;
}

/**
 * Props the engines receive. Family-internal and not published: it adds to
 * the public contract the two busy members the Classic and Rustic engines
 * read; the family entry publishes {@link ButtonPublicProps} as `ButtonProps`.
 */
export interface ButtonProps extends ButtonPublicProps {
  loading?: boolean;
  loadingText?: string;
}

/**
 * Resolved busy state for a Button, computed from the busy fields of the
 * engine props. Every engine calls this instead of reading the raw props, so
 * the precedence below cannot drift between engines. The public contract
 * states `pending` / `pendingLabel` only; `loading` / `loadingText` reach
 * this resolver from the Classic and Rustic engines alone.
 *
 * Resolution order (highest precedence first):
 * 1. `widthStable` is true only when `pending` is true.
 * 2. `busy` is true when EITHER `pending` or `loading` is true: two ways to
 *    request the same "disabled + aria-busy" posture.
 * 3. `label` is `pendingLabel` if set, else `loadingText` if set, else
 *    `undefined`.
 */
export interface ResolvedButtonBusyState {
  /** True when the button should render `disabled` + `aria-busy` (from `pending` or `loading`). */
  busy: boolean;
  /** True only when the width-stable render path applies (`pending`; never `loading` alone). */
  widthStable: boolean;
  /** Resolved label to show alongside the spinner, or `undefined` to keep the resting content. */
  label: ReactNode | undefined;
}

/**
 * Resolves the busy state and label for a Button from its overlapping busy
 * props. See {@link ResolvedButtonBusyState} for the precedence rules this
 * function implements.
 *
 * @param props - The `pending`, `pendingLabel`, `loading`, and `loadingText`
 * fields of {@link ButtonProps} (already defaulted by the caller where
 * applicable).
 */
export function resolveButtonBusyState(
  props: Pick<ButtonProps, 'pending' | 'pendingLabel' | 'loading' | 'loadingText'>
): ResolvedButtonBusyState {
  const pending = Boolean(props.pending);
  const loading = Boolean(props.loading);
  return {
    busy: pending || loading,
    widthStable: pending,
    label: props.pendingLabel ?? props.loadingText ?? undefined,
  };
}

/**
 * Button.Group component props.
 */
export interface ButtonGroupProps extends BaseComponentProps {
  /**
   * Button group size.
   */
  size?: ButtonSize;

  /**
   * Button group variant.
   */
  variant?: ButtonVariant;

  /**
   * Button group shape.
   */
  shape?: ButtonShape;

  /**
   * Button group children.
   */
  children: ReactNode;

  /**
   * Group orientation.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Whether buttons are connected (no space between them).
   * @default true
   */
  connected?: boolean;
}

/**
 * IconButton component props (icon-only button).
 */
export interface IconButtonProps extends Omit<ButtonPublicProps, 'icon' | 'iconPosition' | 'children'> {
  /**
   * Button icon.
   */
  icon: ReactNode;

  /**
   * Accessibility label.
   */
  'aria-label': string;

  /**
   * Tooltip to show on hover.
   */
  tooltip?: string;
}

// ============================================================================
// DEFAULT VALUES
// Default configuration values for the Button component
// ============================================================================

/**
 * Default values for Button component props.
 * These are applied when no explicit value is provided.
 *
 * @constant
 * @type {Object}
 * @property {string} variant - Default visual style ('primary')
 * @property {string} size - Default size ('md')
 * @property {string} htmlType - Default HTML button type ('button')
 * @property {string} iconPosition - Default icon position ('start')
 * @property {string} shape - Default shape ('default')
 * @property {boolean} disabled - Default disabled state (false)
 * @property {boolean} loading - Default loading state (false)
 * @property {boolean} block - Default full-width mode (false)
 * @property {boolean} danger - Default danger mode (false)
 */
export const BUTTON_DEFAULTS = {
  variant: 'primary' as const,
  size: 'md' as const,
  htmlType: 'button' as const,
  iconPosition: 'start' as const,
  shape: 'default' as const,
  disabled: false,
  loading: false,
  block: false,
  danger: false,
};

// ============================================================================
// SIZE MAPPING
// Maps size variants to CSS custom properties
// ============================================================================

/**
 * Size configuration mapping to CSS custom properties.
 * Each size variant maps to height, padding, and font-size CSS variables
 * that are defined in the tenant's theme.
 *
 * The key domain is the recipe's authored size axis, so the map and the
 * public recipe manifest can never state different sizes.
 *
 * @constant
 * @type {Record<string, { height: string; padding: string; fontSize: string }>}
 *
 * @example
 * ```css
 * :root {
 *   --ds-button-md-height: 40px;
 *   --ds-button-md-padding: 0 16px;
 *   --ds-button-md-font-size: 14px;
 * }
 * ```
 */
export const SIZE_MAP: Record<
  ButtonRecipeSizeValue,
  { height: string; padding: string; fontSize: string }
> = {
  xs: { height: 'var(--ds-button-xs-height)', padding: 'var(--ds-button-xs-padding)', fontSize: 'var(--ds-button-xs-font-size)' },
  sm: { height: 'var(--ds-button-sm-height)', padding: 'var(--ds-button-sm-padding)', fontSize: 'var(--ds-button-sm-font-size)' },
  md: { height: 'var(--ds-button-md-height)', padding: 'var(--ds-button-md-padding)', fontSize: 'var(--ds-button-md-font-size)' },
  lg: { height: 'var(--ds-button-lg-height)', padding: 'var(--ds-button-lg-padding)', fontSize: 'var(--ds-button-lg-font-size)' },
  xl: { height: 'var(--ds-button-xl-height)', padding: 'var(--ds-button-xl-padding)', fontSize: 'var(--ds-button-xl-font-size)' },
};

// ============================================================================
// VARIANT MAPPING
// Maps visual variants to the same canonical CSS custom properties consumed by
// the engine skins. Defaults belong to the token bundle, never to this TS map:
// otherwise an unmounted stylesheet silently paints a non-tenant fallback.
// ============================================================================

/**
 * Variant color configuration mapping to CSS custom properties.
 * Each variant defines background, text color, border, and hover states
 * without embedding a second palette in TypeScript.
 *
 * @constant
 * @type {Record<string, { bg: string; color: string; borderColor: string; hoverBg: string }>}
 *
 * @example
 * ```css
 * :root {
 *   --ds-button-primary-bg: #0066CC;
 *   --ds-button-primary-color: #FFFFFF;
 *   --ds-button-primary-hover-bg: #0052A3;
 * }
 * ```
 */
export const VARIANT_MAP = {
  primary: {
    bg: 'var(--ds-button-primary-bg)',
    color: 'var(--ds-button-primary-color)',
    borderColor: 'var(--ds-button-primary-border)',
    hoverBg: 'var(--ds-button-primary-bg-hover)',
  },
  secondary: {
    bg: 'var(--ds-button-secondary-bg)',
    color: 'var(--ds-button-secondary-color)',
    borderColor: 'var(--ds-button-secondary-border)',
    hoverBg: 'var(--ds-button-secondary-bg-hover)',
  },
  outline: {
    bg: 'var(--ds-button-default-bg)',
    color: 'var(--ds-button-default-color)',
    borderColor: 'var(--ds-button-default-border)',
    hoverBg: 'var(--ds-button-default-bg-hover)',
  },
  ghost: {
    bg: 'var(--ds-button-ghost-bg)',
    color: 'var(--ds-button-ghost-color)',
    borderColor: 'var(--ds-button-ghost-border)',
    hoverBg: 'var(--ds-button-ghost-bg-hover)',
  },
  link: {
    bg: 'var(--ds-button-link-bg)',
    color: 'var(--ds-button-link-color)',
    borderColor: 'var(--ds-button-link-border)',
    hoverBg: 'var(--ds-button-link-bg-hover)',
  },
  danger: {
    bg: 'var(--ds-button-error-bg)',
    color: 'var(--ds-button-error-color)',
    borderColor: 'var(--ds-button-error-border)',
    hoverBg: 'var(--ds-button-error-bg-hover)',
  },
  error: {
    bg: 'var(--ds-button-error-bg)',
    color: 'var(--ds-button-error-color)',
    borderColor: 'var(--ds-button-error-border)',
    hoverBg: 'var(--ds-button-error-bg-hover)',
  },
  success: {
    bg: 'var(--ds-button-success-bg)',
    color: 'var(--ds-button-success-color)',
    borderColor: 'var(--ds-button-success-border)',
    hoverBg: 'var(--ds-button-success-bg-hover)',
  },
  warning: {
    bg: 'var(--ds-button-warning-bg)',
    color: 'var(--ds-button-warning-color)',
    borderColor: 'var(--ds-button-warning-border)',
    hoverBg: 'var(--ds-button-warning-bg-hover)',
  },
  info: {
    bg: 'var(--ds-button-info-bg)',
    color: 'var(--ds-button-info-color)',
    borderColor: 'var(--ds-button-info-border)',
    hoverBg: 'var(--ds-button-info-bg-hover)',
  },
  ai: {
    bg: 'var(--ds-button-ai-bg)',
    color: 'var(--ds-button-ai-color)',
    borderColor: 'var(--ds-button-ai-border)',
    hoverBg: 'var(--ds-button-ai-bg-hover)',
  },
  default: {
    bg: 'var(--ds-button-default-bg)',
    color: 'var(--ds-button-default-color)',
    borderColor: 'var(--ds-button-default-border)',
    hoverBg: 'var(--ds-button-default-bg-hover)',
  },
  text: {
    bg: 'var(--ds-button-text-bg)',
    color: 'var(--ds-button-text-color)',
    borderColor: 'var(--ds-button-text-border)',
    hoverBg: 'var(--ds-button-text-bg-hover)',
  },
  dashed: {
    bg: 'var(--ds-button-dashed-bg)',
    color: 'var(--ds-button-dashed-color)',
    borderColor: 'var(--ds-button-dashed-border)',
    hoverBg: 'var(--ds-button-dashed-bg-hover)',
  },
  gradient: {
    bg: 'var(--ds-button-gradient)',
    color: 'var(--ds-button-primary-color)',
    borderColor: 'var(--ds-button-primary-border)',
    hoverBg: 'var(--ds-button-gradient)',
  },
};

// ============================================================================
// SHAPE MAPPING
// Maps shape variants to border-radius CSS custom properties
// ============================================================================

/**
 * Shape configuration mapping to border-radius CSS custom properties.
 * Controls the corner rounding of buttons for different visual styles.
 *
 * @constant
 * @type {Record<string, string>}
 *
 * @property {string} default - Tenant-authored standard corners
 * @property {string} round - Fully rounded ends (pill shape)
 * @property {string} circle - Perfect circle for icon-only buttons
 *
 * @example
 * ```css
 * :root {
 *   --ds-button-md-radius: var(--ds-radius-md);
 *   --ds-radius-full: 9999px;
 * }
 * ```
 */
export const SHAPE_MAP = {
  default: 'var(--ds-button-md-radius)',
  round: 'var(--ds-radius-full)',
  circle: 'var(--ds-radius-full)',
};
