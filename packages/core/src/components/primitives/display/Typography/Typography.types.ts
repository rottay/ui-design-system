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
import type { ResponsiveValue } from '../../layout/shared/types';

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
export type TextColor = 'default' | 'secondary' | 'tertiary' | 'muted' | 'subtle' | 'inherit' | 'primary' | 'success' | 'warning' | 'error';

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
   * Visual size of the heading. Accepts a plain value or a responsive breakpoint object.
   * Can differ from semantic level for design flexibility.
   * @example
   * ```tsx
   * <Heading size="3xl" />
   * <Heading size={{ base: 'lg', md: '2xl', xl: '3xl' }} />
   * ```
   */
  size?: ResponsiveValue<TextSize>;

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
   * Text size. Accepts a plain value or a responsive breakpoint object.
   * @default 'md'
   * @example
   * ```tsx
   * <Text size="lg" />
   * <Text size={{ base: 'sm', md: 'lg', xl: '2xl' }} />
   * ```
   */
  size?: ResponsiveValue<TextSize>;

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

  /** Figure style: 'tabular' aligns digits column-to-column for data. Default 'proportional'. */
  numeric?: 'tabular' | 'proportional';

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
  /** Defaults for `<Typography.Heading>`. */
  heading: {
    /** Renders as `<h2>` by default for a sensible document outline. */
    level: 'h2' as const,
    /** Bold weight for maximum heading visibility. */
    weight: 'bold' as const,
    /** Left-aligned by default, matching LTR reading direction. */
    align: 'left' as const,
    /** Standard high-contrast text color. */
    color: 'default' as const,
    /** No truncation by default; content flows naturally. */
    truncate: false,
  },
  /** Defaults for `<Typography.Text>`. */
  text: {
    /** Medium (base) font size for inline text. */
    size: 'md' as const,
    /** Normal weight (400) for body text readability. */
    weight: 'normal' as const,
    /** Left-aligned by default. */
    align: 'left' as const,
    /** Standard high-contrast text color. */
    color: 'default' as const,
    /** Renders as `<span>` for inline semantics. */
    as: 'span' as const,
    /** No truncation by default. */
    truncate: false,
    /** Underline decoration off by default. */
    underline: false,
    /** Strikethrough decoration off by default. */
    strikethrough: false,
    /** Not italic by default. */
    italic: false,
    /** Proportional (not monospace) font by default. */
    monospace: false,
    /** Proportional (not tabular) figure style by default. */
    numeric: 'proportional' as const,
  },
  /** Defaults for `<Typography.Paragraph>`. */
  paragraph: {
    /** Medium (base) font size for block text. */
    size: 'md' as const,
    /** Normal weight (400) for comfortable reading. */
    weight: 'normal' as const,
    /** Left-aligned by default. */
    align: 'left' as const,
    /** Standard high-contrast text color. */
    color: 'default' as const,
    /** No truncation by default. */
    truncate: false,
  },
  /** Defaults for `<Typography.Link>`. */
  link: {
    /** Medium (base) font size matching surrounding text. */
    size: 'md' as const,
    /** Normal weight so links blend with body copy. */
    weight: 'normal' as const,
    /** Primary brand color to distinguish links from plain text. */
    color: 'primary' as const,
    /** Underline appears on hover for discoverability. */
    underlineOnHover: true,
    /** No permanent underline by default. */
    underline: false,
    /** Links are enabled by default. */
    disabled: false,
    /** Not bold by default. */
    strong: false,
  },
} as const;

/**
 * Size mapping to CSS variables for typography.
 * Uses design system tokens for consistent sizing across tenants.
 */
export const SIZE_MAP = {
  /**
   * Heading sizes are shifted up relative to text sizes so that even
   * the smallest heading (`xs`) is visually larger than body text.
   */
  heading: {
    xs: 'var(--ds-font-size-base, 0.9375rem)',   // 15px
    sm: 'var(--ds-font-size-xl, 1.125rem)',      // 18px
    md: 'var(--ds-font-size-2xl, 1.25rem)',      // 20px
    lg: 'var(--ds-font-size-3xl, 1.5rem)',       // 24px
    xl: 'var(--ds-font-size-4xl, 2rem)',         // 32px
    '2xl': 'var(--ds-font-size-5xl, 2.5rem)',    // 40px
    '3xl': 'var(--ds-font-size-6xl, 3rem)',      // 48px
  },
  /**
   * Text sizes follow a standard typographic scale for inline
   * and body text. `md` matches the base font-size (0.9375rem / 15px).
   */
  text: {
    xs: 'var(--ds-font-size-xs, 0.75rem)',       // 12px
    sm: 'var(--ds-font-size-sm, 0.875rem)',      // 14px
    md: 'var(--ds-font-size-base, 0.9375rem)',   // 15px
    lg: 'var(--ds-font-size-lg, 1rem)',          // 16px
    xl: 'var(--ds-font-size-xl, 1.125rem)',      // 18px
    '2xl': 'var(--ds-font-size-2xl, 1.25rem)',   // 20px
    '3xl': 'var(--ds-font-size-3xl, 1.5rem)',    // 24px
  },
} as const;

/**
 * Weight mapping to numeric CSS `font-weight` values.
 * Provides a semantic-to-numeric lookup for consistent rendering
 * across all engine implementations.
 *
 * @constant
 */
export const WEIGHT_MAP = {
  /** Regular weight (400) - body text default. */
  normal: 400,
  /** Medium weight (500) - subtle emphasis. */
  medium: 500,
  /** Semi-bold weight (600) - subheadings and labels. */
  semibold: 600,
  /** Bold weight (700) - headings and strong emphasis. */
  bold: 700,
} as const;

/**
 * Color mapping from semantic color names to CSS variable references.
 * Used by all typography subcomponents to resolve the `color` prop
 * into a concrete CSS value that respects multi-tenant theming.
 *
 * @constant
 */
export const COLOR_MAP = {
  /** Standard text color - highest contrast, used for body content. */
  default: 'var(--ds-color-text-primary)',
  /** Secondary text color - medium contrast for supporting text. */
  secondary: 'var(--ds-color-text-secondary)',
  /** Tertiary text color - lowest contrast for metadata, timestamps, captions. */
  tertiary: 'var(--ds-color-text-tertiary)',
  /** Muted / secondary text color - lower contrast for supporting text. */
  muted: 'var(--ds-color-text-secondary)',
  /** Subtle text color - the text-muted token itself, for micro-labels and metadata. */
  subtle: 'var(--ds-color-text-muted)',
  /** Inherit the parent's color - for text inside a tone-colored container. */
  inherit: 'inherit',
  /** Primary brand color - links, key labels, and interactive highlights. */
  primary: 'var(--ds-color-primary-500)',
  /** Success / positive color - confirmation messages, status indicators. */
  success: 'var(--ds-color-success-500)',
  /** Warning / caution color - alerts, degraded-state notices. */
  warning: 'var(--ds-color-warning-500)',
  /** Error / danger color - validation errors, destructive actions. */
  error: 'var(--ds-color-error-500)',
} as const;

/**
 * Line-height mapping keyed by text size.
 * Provides proportional line-heights that scale with each size tier.
 * Used by responsive typography to set line-height alongside font-size.
 *
 * @constant
 */
export const LINE_HEIGHT_MAP = {
  heading: {
    xs: '1.4',
    sm: '1.3',
    md: '1.25',
    lg: '1.2',
    xl: '1.15',
    '2xl': '1.1',
    '3xl': '1.1',
  },
  text: {
    xs: '1.5',
    sm: '1.5',
    md: '1.5',
    lg: '1.5',
    xl: '1.45',
    '2xl': '1.4',
    '3xl': '1.35',
  },
} as const;
