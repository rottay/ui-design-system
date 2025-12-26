/**
 * Typography - Type Definitions
 *
 * Core type definitions for the Typography component family.
 * Includes types for Heading, Text, and Paragraph subcomponents.
 *
 * @module Typography/types
 */

import type { BaseComponentProps } from '../../../../../types/common';
import type { EngineAwareProps } from '../../../../../types/engine';

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
 * Combined Typography component props.
 * Used when working with the Typography namespace directly.
 */
export interface TypographyProps extends BaseComponentProps, EngineAwareProps {
  /** Typography variant to render */
  variant?: 'heading' | 'text' | 'paragraph';
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
} as const;

/**
 * Size mapping to CSS values for typography.
 * Used by base components for consistent sizing.
 */
export const SIZE_MAP = {
  heading: {
    xs: '1rem',
    sm: '1.25rem',
    md: '1.5rem',
    lg: '1.875rem',
    xl: '2.25rem',
    '2xl': '3rem',
    '3xl': '3.75rem',
  },
  text: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
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
  default: 'var(--color-text-primary)',
  muted: 'var(--color-text-secondary)',
  primary: 'var(--color-primary)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
} as const;
