/**
 * @fileoverview Typography Types - Rottay Design System
 * @description Type definitions for the Typography component family.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides comprehensive type definitions for Typography components,
 * including props interfaces for Heading, Text, and Paragraph subcomponents.
 *
 * **Exported Types:**
 * - `HeadingProps` - Semantic heading component properties
 * - `TextProps` - Inline text component properties
 * - `ParagraphProps` - Block-level paragraph properties
 * - `TypographyProps` - Combined namespace properties
 * - `HeadingLevel` - h1-h6 semantic levels
 * - `TextSize` - Size variants (xs to 3xl)
 * - `TextWeight` - Font weight options
 * - `TextAlign` - Text alignment options
 * - `TextColor` - Semantic color variants
 *
 * **Exported Constants:**
 * - `TYPOGRAPHY_DEFAULTS` - Default prop values
 * - `SIZE_MAP` - Size to CSS value mappings
 * - `WEIGHT_MAP` - Weight to numeric mappings
 * - `COLOR_MAP` - Color to CSS variable mappings
 *
 * @example Type Usage
 * ```tsx
 * import type { HeadingProps, TextSize, TextColor } from '@rottay/design-system';
 *
 * const size: TextSize = '2xl';
 * const color: TextColor = 'primary';
 *
 * const headingProps: HeadingProps = {
 *   level: 'h1',
 *   size,
 *   color,
 *   children: 'Title',
 * };
 * ```
 *
 * @see {@link Typography} for component implementation
 * @module Typography/types
 * @category Display
 * @package @rottay/design-system
 */

import type { BaseComponentProps } from '../../../../contracts/common';
import type { EngineAwareProps } from '../../../../contracts/engine';

/**
 * Semantic heading levels corresponding to HTML heading elements.
 * Used to maintain proper document outline and accessibility.
 */
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

/**
 * Available text size options.
 * Maps to consistent font-size values across all engines.
 */
export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

/**
 * Font weight options for typography components.
 * Provides consistent weight values across different font families.
 */
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';

/**
 * Text alignment options.
 * Controls horizontal text alignment within the container.
 */
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

/**
 * Semantic text color options.
 * Maps to design system color tokens for consistent theming.
 */
export type TextColor = 'default' | 'muted' | 'primary' | 'success' | 'warning' | 'error';

/**
 * Props for the Heading component.
 *
 * Heading provides semantic heading elements (h1-h6) with customizable
 * visual appearance independent of semantic level.
 *
 * @example
 * ```tsx
 * <Typography.Heading level="h1" size="3xl" weight="bold">
 *   Page Title
 * </Typography.Heading>
 * ```
 */
export interface HeadingProps extends BaseComponentProps, EngineAwareProps {
  /**
   * Semantic heading level (h1-h6).
   * Determines the HTML element rendered.
   * @default 'h2'
   */
  level?: HeadingLevel;

  /**
   * Visual size of the heading.
   * Can differ from semantic level for design flexibility.
   */
  size?: TextSize;

  /**
   * Font weight of the heading.
   * @default 'bold'
   */
  weight?: TextWeight;

  /**
   * Text alignment within the container.
   * @default 'left'
   */
  align?: TextAlign;

  /**
   * Semantic color variant.
   * @default 'default'
   */
  color?: TextColor;

  /**
   * Enable single-line truncation with ellipsis.
   * @default false
   */
  truncate?: boolean;

  /**
   * Maximum number of lines before truncating.
   * Takes precedence over `truncate` when specified.
   */
  lineClamp?: number;

  /** Heading content */
  children: React.ReactNode;
}

/**
 * Props for the Text component.
 *
 * Text provides inline text elements with customizable appearance,
 * decorations, and flexible element rendering.
 *
 * @example
 * ```tsx
 * <Typography.Text size="lg" color="primary" weight="semibold">
 *   Important text
 * </Typography.Text>
 * ```
 */
export interface TextProps extends BaseComponentProps, EngineAwareProps {
  /**
   * Text size.
   * @default 'md'
   */
  size?: TextSize;

  /**
   * Font weight.
   * @default 'normal'
   */
  weight?: TextWeight;

  /**
   * Semantic color variant.
   * @default 'default'
   */
  color?: TextColor;

  /**
   * Text alignment within the container.
   * @default 'left'
   */
  align?: TextAlign;

  /**
   * HTML element to render.
   * Allows semantic flexibility while maintaining consistent styling.
   * @default 'span'
   */
  as?: 'span' | 'p' | 'div' | 'label';

  /**
   * Enable single-line truncation with ellipsis.
   * @default false
   */
  truncate?: boolean;

  /**
   * Maximum number of lines before truncating.
   * Takes precedence over `truncate` when specified.
   */
  lineClamp?: number;

  /**
   * Apply underline text decoration.
   * @default false
   */
  underline?: boolean;

  /**
   * Apply strikethrough text decoration.
   * @default false
   */
  strikethrough?: boolean;

  /**
   * Apply italic font style.
   * @default false
   */
  italic?: boolean;

  /**
   * Use monospace font family.
   * Useful for code snippets or technical content.
   * @default false
   */
  monospace?: boolean;

  /** Text content */
  children: React.ReactNode;
}

/**
 * Props for the Paragraph component.
 *
 * Paragraph provides block-level text elements with optimized
 * line-height and spacing for readable body text.
 *
 * @example
 * ```tsx
 * <Typography.Paragraph size="md" color="muted">
 *   Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * </Typography.Paragraph>
 * ```
 */
export interface ParagraphProps extends BaseComponentProps, EngineAwareProps {
  /**
   * Text size.
   * @default 'md'
   */
  size?: TextSize;

  /**
   * Font weight.
   * @default 'normal'
   */
  weight?: TextWeight;

  /**
   * Semantic color variant.
   * @default 'default'
   */
  color?: TextColor;

  /**
   * Text alignment within the container.
   * @default 'left'
   */
  align?: TextAlign;

  /**
   * Enable single-line truncation with ellipsis.
   * @default false
   */
  truncate?: boolean;

  /**
   * Maximum number of lines before truncating.
   * Takes precedence over `truncate` when specified.
   */
  lineClamp?: number;

  /** Paragraph content */
  children: React.ReactNode;
}

/**
 * Props for the Link component.
 *
 * Link provides styled anchor elements with consistent appearance
 * and hover states across the design system.
 *
 * @example
 * ```tsx
 * <Typography.Link href="/about">Learn more</Typography.Link>
 * <Typography.Link href="https://example.com" target="_blank">External</Typography.Link>
 * ```
 */
export interface LinkProps extends BaseComponentProps, EngineAwareProps {
  /**
   * The URL the link points to.
   */
  href?: string;

  /**
   * Where to open the linked document.
   * @default undefined (same tab)
   */
  target?: '_blank' | '_self' | '_parent' | '_top';

  /**
   * Relationship between current document and linked document.
   * Automatically set to 'noopener noreferrer' when target="_blank".
   */
  rel?: string;

  /**
   * Text size.
   * @default 'md'
   */
  size?: TextSize;

  /**
   * Font weight.
   * @default 'normal'
   */
  weight?: TextWeight;

  /**
   * Semantic color variant.
   * @default 'primary'
   */
  color?: TextColor;

  /**
   * Show underline on hover only.
   * @default true
   */
  underlineOnHover?: boolean;

  /**
   * Always show underline.
   * @default false
   */
  underline?: boolean;

  /**
   * Disable the link.
   * @default false
   */
  disabled?: boolean;

  /**
   * Make the text bold/strong.
   * @default false
   */
  strong?: boolean;

  /**
   * Click handler for the link.
   */
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;

  /** Link content */
  children: React.ReactNode;
}

/**
 * Combined Typography component props.
 * Used when working with the Typography namespace directly.
 */
export interface TypographyProps extends BaseComponentProps, EngineAwareProps {
  /** Typography variant to render */
  variant?: 'heading' | 'text' | 'paragraph' | 'link';
  /** Children content */
  children: React.ReactNode;
}

/**
 * Default values for Typography components.
 * Provides consistent defaults across all engine implementations.
 */
export const TYPOGRAPHY_DEFAULTS = {
  heading: {
    level: 'h2' as const,
    weight: 'bold' as const,
    align: 'left' as const,
    color: 'default' as const,
    truncate: false,
  },
  text: {
    size: 'md' as const,
    weight: 'normal' as const,
    align: 'left' as const,
    color: 'default' as const,
    as: 'span' as const,
    truncate: false,
    underline: false,
    strikethrough: false,
    italic: false,
    monospace: false,
  },
  paragraph: {
    size: 'md' as const,
    weight: 'normal' as const,
    align: 'left' as const,
    color: 'default' as const,
    truncate: false,
  },
  link: {
    size: 'md' as const,
    weight: 'normal' as const,
    color: 'primary' as const,
    underlineOnHover: true,
    underline: false,
    disabled: false,
    strong: false,
  },
} as const;

/**
 * Size mapping to CSS variables for typography.
 * Uses design system tokens for consistent sizing across tenants.
 */
export const SIZE_MAP = {
  heading: {
    xs: 'var(--ds-font-size-base, 1rem)',
    sm: 'var(--ds-font-size-xl, 1.25rem)',
    md: 'var(--ds-font-size-2xl, 1.5rem)',
    lg: 'var(--ds-font-size-3xl, 1.875rem)',
    xl: 'var(--ds-font-size-4xl, 2.25rem)',
    '2xl': 'var(--ds-font-size-5xl, 3rem)',
    '3xl': 'var(--ds-font-size-6xl, 3.75rem)',
  },
  text: {
    xs: 'var(--ds-font-size-xs, 0.75rem)',
    sm: 'var(--ds-font-size-sm, 0.875rem)',
    md: 'var(--ds-font-size-base, 1rem)',
    lg: 'var(--ds-font-size-lg, 1.125rem)',
    xl: 'var(--ds-font-size-xl, 1.25rem)',
    '2xl': 'var(--ds-font-size-2xl, 1.5rem)',
    '3xl': 'var(--ds-font-size-3xl, 1.875rem)',
  },
} as const;

/**
 * Weight mapping to numeric values.
 */
export const WEIGHT_MAP = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/**
 * Color mapping to CSS variables.
 */
export const COLOR_MAP = {
  default: 'var(--ds-color-text-primary)',
  muted: 'var(--ds-color-text-secondary)',
  primary: 'var(--ds-color-primary-500)',
  success: 'var(--ds-color-success-500)',
  warning: 'var(--ds-color-warning-500)',
  error: 'var(--ds-color-error-500)',
} as const;
