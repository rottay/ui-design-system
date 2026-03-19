/**
 * @fileoverview Typography Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind-based typography with utility classes.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine uses Tailwind CSS utility classes and DaisyUI colors
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
 * - Color: `text-base-content`, `text-primary`, `text-success`, etc.
 * - Decoration: `underline`, `line-through`, `italic`, `font-mono`
 * - Truncation: `truncate`, `line-clamp-{n}`
 *
 * **Advantages:**
 * - Lightweight CSS-only approach
 * - Tailwind utility compatibility
 * - DaisyUI theme integration
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
 * @see {@link https://daisyui.com/} DaisyUI
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
const HEADING_SIZE_CLASSES: Record<string, string> = {
  xs: 'text-base',
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
  '2xl': 'text-4xl',
  '3xl': 'text-5xl',
};

/**
 * Text sizes map 1:1 to Tailwind's type scale so consumers get
 * predictable results without needing to know the underlying utility names.
 */
const TEXT_SIZE_CLASSES: Record<string, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
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
 * Colors use DaisyUI semantic tokens so they automatically adapt when
 * the theme changes (e.g. light to dark mode). "muted" uses a 70%
 * opacity modifier instead of a separate color to maintain contrast ratio.
 */
const COLOR_CLASSES: Record<string, string> = {
  default: 'text-base-content',
  muted: 'text-base-content/70',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
};

/**
 * Modern (DaisyUI/Tailwind) implementation of Heading component.
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
    }

    const needsResponsiveCSS = responsiveEntries.length > 0;
    const elementId = needsResponsiveCSS ? `heading-${reactId.replace(/:/g, '')}` : '';
    const responsive = needsResponsiveCSS
      ? generateResponsiveCSS(elementId, responsiveEntries)
      : null;

    const scalarSize = scalarOrUndefined(size);

    // Class list is assembled as an array and filtered to avoid
    // stray spaces from falsy entries (e.g. when size is undefined).
    // When size is responsive, do NOT emit a Tailwind size class -- the
    // injected <style> tag handles sizing via @media queries instead.
    const classes = [
      !sizeIsResponsive && scalarSize ? HEADING_SIZE_CLASSES[scalarSize] : '',
      WEIGHT_CLASSES[weight],
      ALIGN_CLASSES[align],
      COLOR_CLASSES[color],
      truncate ? 'truncate' : '',
      lineClamp ? `line-clamp-${lineClamp}` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <>
        {responsive && responsive.css && (
          <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
        )}
        <Component
          ref={ref as React.Ref<HTMLHeadingElement>}
          className={classes}
          style={style}
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
 * Modern (DaisyUI/Tailwind) implementation of Text component.
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
    // When size is responsive, do NOT emit a Tailwind size class -- the
    // injected <style> tag handles sizing via @media queries instead.
    const classes = [
      !sizeIsResponsive ? TEXT_SIZE_CLASSES[size] : '',
      WEIGHT_CLASSES[weight],
      ALIGN_CLASSES[align],
      COLOR_CLASSES[color],
      underline ? 'underline' : '',
      strikethrough ? 'line-through' : '',
      italic ? 'italic' : '',
      monospace ? 'font-mono' : '',
      truncate ? 'truncate' : '',
      lineClamp ? `line-clamp-${lineClamp}` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <>
        {responsive && responsive.css && (
          <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
        )}
        <Component
          ref={ref as any}
          className={classes}
          style={style}
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
 * Modern (DaisyUI/Tailwind) implementation of Paragraph component.
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
    const classes = [
      TEXT_SIZE_CLASSES[size],
      WEIGHT_CLASSES[weight],
      ALIGN_CLASSES[align],
      COLOR_CLASSES[color],
      'leading-relaxed',
      'mb-4',
      truncate ? 'truncate' : '',
      lineClamp ? `line-clamp-${lineClamp}` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <p ref={ref} className={classes} style={style} {...props}>
        {children}
      </p>
    );
  }
);

ModernParagraph.displayName = 'ModernParagraph';

/**
 * Modern (DaisyUI/Tailwind) implementation of Link component.
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
    const classes = [
      TEXT_SIZE_CLASSES[size],
      weight ? WEIGHT_CLASSES[weight] : '',
      COLOR_CLASSES[color],
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
        style={style}
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
