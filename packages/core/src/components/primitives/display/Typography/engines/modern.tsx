/**
 * @fileoverview Typography Modern Engine - Rottay Design System
 * @description Token-driven typography with Tailwind utility classes and --ds-* CSS custom properties.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine uses Tailwind CSS utility classes and DS token inline styles
 * for lightweight, customizable typography rendering.
 *
 * **Available Components:**
 * - `ModernHeading` - Tailwind-styled heading
 * - `ModernText` - Tailwind-styled inline text
 * - `ModernParagraph` - Tailwind-styled paragraph
 *
 * **Class Mappings:**
 * - Size: `text-xs`, `text-sm`, `text-base`, `text-lg`, etc.
 * - Weight: `font-normal`, `font-medium`, `font-semibold`, `font-bold`
 * - Align: `text-left`, `text-center`, `text-right`, `text-justify`
 * - Color: DS token inline styles via --ds-color-text-primary, --ds-color-primary, etc.
 * - Decoration: `underline`, `line-through`, `italic`, `font-mono`
 * - Truncation: `truncate`, `line-clamp-{n}`
 *
 * **Advantages:**
 * - Lightweight CSS-only approach
 * - Tailwind utility compatibility
 * - DS token theme integration
 * - Responsive design support
 *
 * @example Basic Usage
 * ```tsx
 * import { Typography } from '@rottay/design-system';
 *
 * <Typography.Heading engine="modern" level="h1" size="3xl">
 *   Tailwind Heading
 * </Typography.Heading>
 * ```
 *
 * @see {@link Typography} for the main component
 * @see {@link Typography} for the main component
 * @module Typography/engines/modern
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useId } from 'react';
import type { HeadingProps, TextProps, ParagraphProps, LinkProps, TextSize } from '../Typography.types';
import { TYPOGRAPHY_DEFAULTS, SIZE_MAP, LINE_HEIGHT_MAP } from '../Typography.types';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '../../../layout/shared/responsive-props';
import type { ResponsiveValue } from '../../../layout/shared/types';

/**
 * Heading sizes are intentionally one step larger than text sizes (e.g.
 * "xs" maps to text-base, not text-xs) so headings always appear visually
 * distinct from body text at the same nominal size value.
 */
/**
 * Heading sizes mapped to DS font-size tokens via inline styles.
 * Each entry returns the CSS custom property with a Tailwind-equivalent fallback.
 * The one-step-up offset (xs -> base, sm -> lg, etc.) is preserved.
 */
const HEADING_SIZE_STYLES: Record<string, string> = {
  xs: 'var(--ds-font-size-base, 0.9375rem)',
  sm: 'var(--ds-font-size-lg, 1rem)',
  md: 'var(--ds-font-size-xl, 1.125rem)',
  lg: 'var(--ds-font-size-2xl, 1.25rem)',
  xl: 'var(--ds-font-size-3xl, 1.5rem)',
  '2xl': 'var(--ds-font-size-4xl, 2rem)',
  '3xl': 'var(--ds-font-size-5xl, 2.5rem)',
};

/**
 * Negative letter-spacing for larger heading sizes creates the tight,
 * editorial feel found in premium interfaces (Linear, Vercel, Stripe).
 * Smaller sizes use normal (0) tracking to preserve readability.
 */
const HEADING_LETTER_SPACING: Record<string, string> = {
  xs: '0',
  sm: '0',
  md: '-0.01em',
  lg: '-0.015em',
  xl: '-0.02em',
  '2xl': '-0.025em',
  '3xl': '-0.025em',
};

/**
 * Tighter line-heights for headings create a more compact, authoritative
 * appearance. Larger sizes get tighter leading since the letterforms
 * themselves provide enough vertical clearance.
 */
const HEADING_LINE_HEIGHT: Record<string, string> = {
  xs: '1.4',
  sm: '1.3',
  md: '1.25',
  lg: '1.2',
  xl: '1.15',
  '2xl': '1.1',
  '3xl': '1.1',
};

/**
 * Default heading level to semantic weight mapping.
 * h1-h2 use bold (700) for maximum impact; h3-h6 use semibold (600)
 * to create a clear visual hierarchy without being overpowering.
 */
const HEADING_LEVEL_WEIGHTS: Record<string, string> = {
  h1: 'font-bold',
  h2: 'font-bold',
  h3: 'font-semibold',
  h4: 'font-semibold',
  h5: 'font-semibold',
  h6: 'font-semibold',
};

/**
 * Text sizes mapped to DS font-size tokens via inline styles.
 * Each entry returns the CSS custom property with a Tailwind-equivalent fallback.
 */
const TEXT_SIZE_STYLES: Record<string, string> = {
  xs: 'var(--ds-font-size-xs, 0.75rem)',
  sm: 'var(--ds-font-size-sm, 0.875rem)',
  md: 'var(--ds-font-size-base, 0.9375rem)',
  lg: 'var(--ds-font-size-lg, 1rem)',
  xl: 'var(--ds-font-size-xl, 1.125rem)',
  '2xl': 'var(--ds-font-size-2xl, 1.25rem)',
  '3xl': 'var(--ds-font-size-3xl, 1.5rem)',
};

/**
 * Tailwind CSS weight classes.
 */
const WEIGHT_CLASSES: Record<string, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

/**
 * Tailwind CSS alignment classes.
 */
const ALIGN_CLASSES: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

/**
 * Colors use DS tokens so they automatically adapt when the theme changes
 * (e.g. light to dark mode). "muted" maps to text-secondary for reduced emphasis.
 */
const COLOR_STYLES: Record<string, React.CSSProperties> = {
  default: { color: 'var(--ds-color-text-primary)' },
  secondary: { color: 'var(--ds-color-text-secondary)' },
  tertiary: { color: 'var(--ds-color-text-tertiary)' },
  muted: { color: 'var(--ds-color-text-secondary)' },
  primary: { color: 'var(--ds-color-primary)' },
  success: { color: 'var(--ds-color-success)' },
  warning: { color: 'var(--ds-color-warning)' },
  error: { color: 'var(--ds-color-error)' },
};

/**
 * Modern (token-driven) implementation of Heading component.
 *
 * Uses Tailwind CSS utility classes for styling.
 * Provides semantic heading elements with responsive design support.
 *
 * @example
 * ```tsx
 * <ModernHeading level="h1" size="3xl" color="primary">
 *   Welcome to the Dashboard
 * </ModernHeading>
 * ```
 */
/**
 * Extracts the scalar value from a prop that may be a ResponsiveValue.
 * Returns undefined if the prop is a responsive object.
 */
function scalarOrUndefined<T>(value: ResponsiveValue<T> | undefined): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (isResponsiveValue(value)) return undefined;
  return value as T;
}

export const ModernHeading = forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      level = TYPOGRAPHY_DEFAULTS.heading.level,
      size,
      weight = TYPOGRAPHY_DEFAULTS.heading.weight,
      align = TYPOGRAPHY_DEFAULTS.heading.align,
      color = TYPOGRAPHY_DEFAULTS.heading.color,
      truncate = TYPOGRAPHY_DEFAULTS.heading.truncate,
      lineClamp,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    // Use the heading level directly as the JSX element tag (h1-h6)
    // so the output is semantically correct without extra mapping.
    const Component = level;

    // Responsive size handling
    const reactId = useId();
    const responsiveEntries: ResponsivePropEntry<any>[] = [];
    const sizeIsResponsive = isResponsiveValue(size);

    if (sizeIsResponsive) {
      responsiveEntries.push({
        cssProperty: 'font-size',
        value: size,
        resolve: (v: TextSize) => SIZE_MAP.heading[v] || SIZE_MAP.heading.md,
      } as ResponsivePropEntry<any>);
      responsiveEntries.push({
        cssProperty: 'line-height',
        value: size,
        resolve: (v: TextSize) => LINE_HEIGHT_MAP.heading[v] || '1.2',
      } as ResponsivePropEntry<any>);
      responsiveEntries.push({
        cssProperty: 'letter-spacing',
        value: size,
        resolve: (v: TextSize) => HEADING_LETTER_SPACING[v] || '0',
      } as ResponsivePropEntry<any>);
    }

    const needsResponsiveCSS = responsiveEntries.length > 0;
    const elementId = needsResponsiveCSS ? `heading-${reactId.replace(/:/g, '')}` : '';
    const responsive = needsResponsiveCSS
      ? generateResponsiveCSS(elementId, responsiveEntries)
      : null;

    const scalarSize = scalarOrUndefined(size);

    // Resolve the effective weight class. When the consumer explicitly
    // passes a weight we honour it; otherwise fall back to the
    // level-aware default (bold for h1/h2, semibold for h3-h6).
    const resolvedWeightClass =
      weight !== TYPOGRAPHY_DEFAULTS.heading.weight
        ? WEIGHT_CLASSES[weight]
        : HEADING_LEVEL_WEIGHTS[level] || WEIGHT_CLASSES[weight];

    // Class list is assembled as an array and filtered to avoid
    // stray spaces from falsy entries (e.g. when size is undefined).
    // Heading size is now applied via inline fontSize (DS token), not
    // a Tailwind text-* class.
    const classes = [
      resolvedWeightClass,
      ALIGN_CLASSES[align],
      truncate ? 'truncate' : '',
      lineClamp ? `line-clamp-${lineClamp}` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const colorStyle = COLOR_STYLES[color] || COLOR_STYLES.default;

    // Apply premium typographic refinements: font-size from DS tokens,
    // negative letter-spacing, and tighter line-height for larger heading
    // sizes. These inline styles give headings the editorial feel of
    // Linear/Vercel/Stripe typography.
    const typographyStyle: React.CSSProperties = {};
    if (scalarSize && !sizeIsResponsive) {
      typographyStyle.fontSize = HEADING_SIZE_STYLES[scalarSize] || HEADING_SIZE_STYLES.md;
      const ls = HEADING_LETTER_SPACING[scalarSize];
      if (ls && ls !== '0') {
        typographyStyle.letterSpacing = ls;
      }
      typographyStyle.lineHeight = HEADING_LINE_HEIGHT[scalarSize] || '1.25';
    }

    return (
      <>
        {responsive && responsive.css && (
          <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
        )}
        <Component
          ref={ref as React.Ref<HTMLHeadingElement>}
          className={classes}
          style={{ textWrap: 'balance', ...typographyStyle, ...colorStyle, ...style }}
          {...(responsive ? responsive.attrs : {})}
          {...props}
        >
          {children}
        </Component>
      </>
    );
  }
);

ModernHeading.displayName = 'ModernHeading';

/**
 * Modern (token-driven) implementation of Text component.
 *
 * Uses Tailwind CSS utility classes for styling and decorations.
 * Supports all text decorations through utility classes.
 *
 * @example
 * ```tsx
 * <ModernText color="success" underline>
 *   Successfully saved!
 * </ModernText>
 * ```
 */
export const ModernText = forwardRef<HTMLElement, TextProps>(
  (
    {
      size: sizeProp = TYPOGRAPHY_DEFAULTS.text.size,
      weight = TYPOGRAPHY_DEFAULTS.text.weight,
      color = TYPOGRAPHY_DEFAULTS.text.color,
      align = TYPOGRAPHY_DEFAULTS.text.align,
      as = TYPOGRAPHY_DEFAULTS.text.as,
      truncate = TYPOGRAPHY_DEFAULTS.text.truncate,
      lineClamp,
      underline = TYPOGRAPHY_DEFAULTS.text.underline,
      strikethrough = TYPOGRAPHY_DEFAULTS.text.strikethrough,
      italic = TYPOGRAPHY_DEFAULTS.text.italic,
      monospace = TYPOGRAPHY_DEFAULTS.text.monospace,
      numeric,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    // The `as` prop controls the rendered HTML tag (span, em, strong, etc.)
    // giving consumers semantic flexibility without additional wrappers.
    const Component = as;

    // Responsive size handling
    const reactId = useId();
    const responsiveEntries: ResponsivePropEntry<any>[] = [];
    const sizeIsResponsive = isResponsiveValue(sizeProp);

    if (sizeIsResponsive) {
      responsiveEntries.push({
        cssProperty: 'font-size',
        value: sizeProp,
        resolve: (v: TextSize) => SIZE_MAP.text[v] || SIZE_MAP.text.md,
      } as ResponsivePropEntry<any>);
      responsiveEntries.push({
        cssProperty: 'line-height',
        value: sizeProp,
        resolve: (v: TextSize) => LINE_HEIGHT_MAP.text[v] || '1.5',
      } as ResponsivePropEntry<any>);
    }

    const needsResponsiveCSS = responsiveEntries.length > 0;
    const elementId = needsResponsiveCSS ? `text-${reactId.replace(/:/g, '')}` : '';
    const responsive = needsResponsiveCSS
      ? generateResponsiveCSS(elementId, responsiveEntries)
      : null;

    const size = scalarOrUndefined(sizeProp) ?? TYPOGRAPHY_DEFAULTS.text.size;

    // Text decorations and style modifiers are each a single Tailwind class,
    // keeping the compiled output minimal compared to inline style equivalents.
    // Text size is now applied via inline fontSize (DS token), not a Tailwind
    // text-* class.
    const classes = [
      WEIGHT_CLASSES[weight],
      ALIGN_CLASSES[align],
      underline ? 'underline' : '',
      strikethrough ? 'line-through' : '',
      italic ? 'italic' : '',
      monospace ? 'font-mono' : '',
      truncate ? 'truncate' : '',
      lineClamp ? `line-clamp-${lineClamp}` : '',
      numeric === 'tabular' ? 'ds-nums-tabular' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const colorStyle = COLOR_STYLES[color] || COLOR_STYLES.default;

    // Apply DS token-based font-size for non-responsive sizes
    const textSizeStyle: React.CSSProperties = !sizeIsResponsive
      ? { fontSize: TEXT_SIZE_STYLES[size] || TEXT_SIZE_STYLES.md }
      : {};

    return (
      <>
        {responsive && responsive.css && (
          <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
        )}
        <Component
          ref={ref as any}
          className={classes}
          style={{ textWrap: 'pretty', ...textSizeStyle, ...colorStyle, ...style }}
          {...(responsive ? responsive.attrs : {})}
          {...props}
        >
          {children}
        </Component>
      </>
    );
  }
);

ModernText.displayName = 'ModernText';

/**
 * Modern (token-driven) implementation of Paragraph component.
 *
 * Uses Tailwind CSS utility classes for styling.
 * Includes relaxed line-height and bottom margin for readability.
 *
 * @example
 * ```tsx
 * <ModernParagraph color="muted" align="justify">
 *   Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * </ModernParagraph>
 * ```
 */
export const ModernParagraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  (
    {
      size = TYPOGRAPHY_DEFAULTS.paragraph.size,
      weight = TYPOGRAPHY_DEFAULTS.paragraph.weight,
      color = TYPOGRAPHY_DEFAULTS.paragraph.color,
      align = TYPOGRAPHY_DEFAULTS.paragraph.align,
      truncate = TYPOGRAPHY_DEFAULTS.paragraph.truncate,
      lineClamp,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    // Paragraphs include "leading-relaxed" and "mb-4" by default because
    // body text needs generous line-height and vertical rhythm to remain
    // readable at longer lengths. These can be overridden via className.
    // Paragraph size is now applied via inline fontSize (DS token).
    const classes = [
      WEIGHT_CLASSES[weight],
      ALIGN_CLASSES[align],
      'leading-relaxed',
      'mb-4',
      truncate ? 'truncate' : '',
      lineClamp ? `line-clamp-${lineClamp}` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const colorStyle = COLOR_STYLES[color] || COLOR_STYLES.default;
    const paragraphSizeStyle: React.CSSProperties = {
      fontSize: TEXT_SIZE_STYLES[size] || TEXT_SIZE_STYLES.md,
    };

    return (
      <p ref={ref} className={classes} style={{ ...paragraphSizeStyle, ...colorStyle, ...style }} {...props}>
        {children}
      </p>
    );
  }
);

ModernParagraph.displayName = 'ModernParagraph';

/**
 * Modern (token-driven) implementation of Link component.
 *
 * Uses Tailwind CSS utility classes for styling.
 * Provides styled anchor elements with hover effects.
 *
 * @example
 * ```tsx
 * <ModernLink href="/about">Learn more</ModernLink>
 * <ModernLink href="https://example.com" target="_blank">External link</ModernLink>
 * ```
 */
export const ModernLink = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      href,
      target,
      rel,
      size = TYPOGRAPHY_DEFAULTS.link.size,
      weight,
      color = TYPOGRAPHY_DEFAULTS.link.color,
      underlineOnHover = TYPOGRAPHY_DEFAULTS.link.underlineOnHover,
      underline = TYPOGRAPHY_DEFAULTS.link.underline,
      disabled = TYPOGRAPHY_DEFAULTS.link.disabled,
      strong = TYPOGRAPHY_DEFAULTS.link.strong,
      onClick,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    // Security: external links automatically receive noopener noreferrer
    // to prevent reverse tabnabbing attacks.
    const computedRel = rel || (target === '_blank' ? 'noopener noreferrer' : undefined);

    // Disabled links use pointer-events-none + reduced opacity so they
    // cannot be clicked or focused, matching native disabled behavior.
    // The "transition-colors" class is always present for smooth color shifts.
    // Link size is now applied via inline fontSize (DS token).
    const classes = [
      weight ? WEIGHT_CLASSES[weight] : '',
      strong ? 'font-semibold' : '',
      underline ? 'underline' : '',
      // hover:underline only applies when the link is not already underlined.
      underlineOnHover && !underline ? 'hover:underline' : '',
      disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
      'transition-colors',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const colorStyle = COLOR_STYLES[color] || COLOR_STYLES.default;
    const linkSizeStyle: React.CSSProperties = {
      fontSize: TEXT_SIZE_STYLES[size] || TEXT_SIZE_STYLES.md,
    };

    return (
      /* Disabled links have href removed entirely so they are not
          navigable via keyboard or assistive technology. */
      <a
        ref={ref}
        href={disabled ? undefined : href}
        target={target}
        rel={computedRel}
        onClick={disabled ? undefined : onClick}
        className={classes}
        style={{ ...linkSizeStyle, ...colorStyle, ...style }}
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </a>
    );
  }
);

ModernLink.displayName = 'ModernLink';

/**
 * Default export for engine factory compatibility.
 * Exports the primary Heading component for the Typography namespace.
 */
export default ModernHeading;
