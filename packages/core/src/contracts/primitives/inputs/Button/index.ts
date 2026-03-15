import type { ReactNode, MouseEvent, ButtonHTMLAttributes } from 'react';
import type { BaseComponentProps, Size, Variant, LoadableProps, DisableableProps } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

/**
 * Button specific sizes.
 */
export type ButtonSize = Size;

/**
 * Button variants.
 */
export type ButtonVariant = Variant | 'text' | 'link' | 'ghost' | 'dashed' | 'danger';

/**
 * Button shapes.
 */
export type ButtonShape = 'default' | 'circle' | 'round';

/**
 * Button HTML types.
 */
export type ButtonHtmlType = 'button' | 'submit' | 'reset';

/**
 * Button component props.
 */
export interface ButtonProps extends BaseComponentProps, EngineAwareProps, LoadableProps, DisableableProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'onClick' | 'prefix'> {
  /**
   * Button size.
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Button color variant.
   * @default 'default'
   */
  variant?: ButtonVariant;

  /**
   * Button shape.
   * @default 'default'
   */
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
   * Whether the button should render as a different component.
   * Useful for composition (e.g., render as <Link>).
   */
  asChild?: boolean;

  /**
   * URL if the button acts as a link.
   */
  href?: string;

  /**
   * Target if the button acts as a link.
   */
  target?: '_blank' | '_self' | '_parent' | '_top';

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
export interface IconButtonProps extends Omit<ButtonProps, 'icon' | 'iconPosition' | 'children'> {
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

/**
 * Button loading configuration.
 */
export interface ButtonLoadingConfig {
  /** Whether loading */
  loading: boolean;
  /** Text during loading */
  loadingText?: string;
  /** Custom loading icon */
  loadingIcon?: ReactNode;
  /** Whether to disable during loading */
  disableWhileLoading?: boolean;
}
