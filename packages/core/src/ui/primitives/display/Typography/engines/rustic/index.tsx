/**
 * @fileoverview Typography Apollo Engine - Rottay Design System
 * @description Pure CSS typography implementation with zero dependencies.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine provides lightweight, dependency-free typography using
 * only CSS variables and semantic HTML elements.
 *
 * **Available Components:**
 * - `ApolloHeading` - Pure CSS heading (h1-h6)
 * - `ApolloText` - Pure CSS inline text
 * - `ApolloParagraph` - Pure CSS paragraph
 *
 * **Implementation Details:**
 * - Self-contained implementation using CSS variables
 * - Semantic HTML elements for accessibility
 * - All styling via var(--ds-*) tokens
 *
 * **CSS Custom Properties:**
 * - `--ds-color-text-primary` - Default text color
 * - `--ds-color-text-secondary` - Muted text color
 * - `--ds-color-primary-500` - Primary accent color
 * - `--ds-color-success-500`, etc.
 *
 * @example Basic Usage
 * ```tsx
 * import { Typography } from '@rottay/design-system';
 *
 * <Typography.Heading engine="rustic" level="h1">
 *   Lightweight Heading
 * </Typography.Heading>
 * ```
 *
 * @see {@link Typography} for the main component
 * @module Typography/engines/rustic
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useId } from 'react';
import type { HeadingProps, TextProps, ParagraphProps, LinkProps, TextSize } from '../../contracts';
import { TYPOGRAPHY_DEFAULTS, SIZE_MAP, WEIGHT_MAP, LINE_HEIGHT_MAP } from '../../contracts';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '@/infrastructure/runtime/responsive/runtime/style-properties';
import type { ResponsiveValue } from '@/foundation/contracts/kernel/responsive/values';
import {
  resolveFluidTypographySize,
  resolveTypographyCraftStyle,
  typographyDataAttributes,
} from '../../runtime';

/**
 * Scope class carried by all four exports. Text color is selected from
 * `data-color` by `foundation/tokens/css/runtime/engines/rustic/skin/typography.css`, which resolves
 * an unrecognised value to the `default` color -- except on Link, whose
 * `rottay-typography--link` modifier resolves it to `primary`. Both the class and
 * `data-color` must reach the root for the color to paint.
 */
const SCOPE_CLASSES = 'rottay-typography rottay-typography--rustic';

/**
 * Extracts the scalar value from a prop that may be a ResponsiveValue.
 * Returns undefined if the prop is a responsive object.
 */
function scalarOrUndefined<T>(value: ResponsiveValue<T> | undefined): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (isResponsiveValue(value)) return undefined;
  return value as T;
}

/**
 * Apollo (Vanilla/CSS) implementation of Heading component.
 *
 * Pure CSS implementation using CSS variables and inline styles.
 * Provides maximum accessibility and zero external dependencies.
 */
export const ApolloHeading = forwardRef<HTMLHeadingElement, HeadingProps>(
  (props, ref) => {
    const {
      level = TYPOGRAPHY_DEFAULTS.heading.level,
      size,
      weight = TYPOGRAPHY_DEFAULTS.heading.weight,
      align = TYPOGRAPHY_DEFAULTS.heading.align,
      color = TYPOGRAPHY_DEFAULTS.heading.color,
      truncate = TYPOGRAPHY_DEFAULTS.heading.truncate,
      lineClamp,
      textStyle,
      family,
      fluid,
      leading,
      tracking,
      wrap = 'balance',
      hyphenate,
      contrast,
      motion = 'none',
      lang,
      dir,
      translate,
      title,
      children,
      className = '',
      style,
      ...restProps
    } = props;

    // Cast to IntrinsicElements key so TypeScript allows dynamic element creation.
    const Tag = level as keyof React.JSX.IntrinsicElements;

    // When the consumer omits `size`, we derive a sensible default from
    // the heading level so h1 is naturally the largest and h6 the smallest.
    const defaultSizeMap: Record<string, keyof typeof SIZE_MAP.heading> = {
      h1: '3xl',
      h2: '2xl',
      h3: 'xl',
      h4: 'lg',
      h5: 'md',
      h6: 'sm',
    };

    // Responsive size handling
    const reactId = useId();
    const responsiveEntries: ResponsivePropEntry<any>[] = [];
    const sizeIsResponsive = isResponsiveValue(size);

    if (sizeIsResponsive) {
      responsiveEntries.push({
        cssProperty: 'font-size',
        value: size,
        resolve: (v: TextSize) =>
          fluid ? resolveFluidTypographySize('heading', v) : SIZE_MAP.heading[v] || SIZE_MAP.heading.md,
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
    const effectiveSize = scalarSize || defaultSizeMap[level];

    // Visual properties use token-backed style objects referencing DS CSS
    // variables (var(--ds-*)) with hardcoded fallbacks, ensuring the heading
    // renders correctly without a theme provider (SSR, email, etc.).
    const craftProps = {
      textStyle,
      family,
      fluid,
      leading,
      tracking,
      wrap,
      hyphenate,
      contrast,
      motion,
    };
    const headingStyle: React.CSSProperties = {
      // Only set font-size/line-height inline when NOT responsive
      ...(!sizeIsResponsive && !textStyle && {
        fontSize: SIZE_MAP.heading[effectiveSize] || SIZE_MAP.heading.md,
        lineHeight: 1.2,
      }),
      fontWeight: WEIGHT_MAP[weight] || WEIGHT_MAP.bold,
      textAlign: align,
      // Reset margin to zero; DS layout components handle spacing.
      margin: 0,
      ...resolveTypographyCraftStyle({
        ...craftProps,
        kind: 'heading',
        size: effectiveSize,
        align,
        truncate,
        lineClamp,
        responsive: sizeIsResponsive,
      }),
      ...style,
    };

    const HeadingElement = Tag as React.ElementType;
    return (
      <>
        {responsive && responsive.css && (
          <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
        )}
        <HeadingElement
          ref={ref}
          className={`rottay-heading ${SCOPE_CLASSES} rottay-heading--${level} ${className}`.trim()}
          lang={lang}
          dir={dir}
          translate={translate}
          title={title}
          {...restProps}
          {...(responsive ? responsive.attrs : {})}
          data-part="root"
          data-color={color}
          {...typographyDataAttributes(craftProps)}
          style={headingStyle}
        >
          {children}
        </HeadingElement>
      </>
    );
  }
);

ApolloHeading.displayName = 'ApolloHeading';

/**
 * Apollo (Vanilla/CSS) implementation of Text component.
 *
 * Pure CSS implementation using CSS variables and inline styles.
 * Supports all text decorations without external dependencies.
 */
export const ApolloText = forwardRef<HTMLElement, TextProps>(
  (props, ref) => {
    const {
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
      textStyle,
      family,
      fluid,
      leading,
      tracking,
      wrap = 'pretty',
      hyphenate,
      contrast,
      motion = 'none',
      lang,
      dir,
      translate,
      title,
      children,
      className = '',
      style,
      ...restProps
    } = props;

    const Tag = as as keyof React.JSX.IntrinsicElements;

    // Responsive size handling
    const reactId = useId();
    const responsiveEntries: ResponsivePropEntry<any>[] = [];
    const sizeIsResponsive = isResponsiveValue(sizeProp);

    if (sizeIsResponsive) {
      responsiveEntries.push({
        cssProperty: 'font-size',
        value: sizeProp,
        resolve: (v: TextSize) =>
          fluid ? resolveFluidTypographySize('text', v) : SIZE_MAP.text[v] || SIZE_MAP.text.md,
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

    // Multiple text decorations can be combined in a single CSS value
    // (e.g. "underline line-through"), so we collect them into an array
    // and join with a space. An empty array produces `undefined`.
    const decorations: string[] = [];
    if (underline) decorations.push('underline');
    if (strikethrough) decorations.push('line-through');

    const craftProps = {
      textStyle,
      family: monospace ? ('mono' as const) : family,
      fluid,
      leading,
      tracking,
      wrap,
      hyphenate,
      contrast,
      motion,
    };
    const resolvedTextStyle: React.CSSProperties = {
      // Only set font-size inline when NOT responsive
      ...(!sizeIsResponsive && {
        fontSize: SIZE_MAP.text[size] || SIZE_MAP.text.md,
      }),
      fontWeight: WEIGHT_MAP[weight] || WEIGHT_MAP.normal,
      textAlign: align,
      fontStyle: italic ? 'italic' : undefined,
      fontFamily: monospace ? 'var(--ds-font-mono, monospace)' : undefined,
      textDecoration: decorations.length > 0 ? decorations.join(' ') : undefined,
      ...resolveTypographyCraftStyle({
        ...craftProps,
        kind: 'text',
        size,
        align,
        truncate,
        lineClamp,
        responsive: sizeIsResponsive,
      }),
      ...style,
    };

    const TextElement = Tag as React.ElementType;
    return (
      <>
        {responsive && responsive.css && (
          <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
        )}
        <TextElement
          ref={ref}
          className={`rottay-text ${SCOPE_CLASSES}${numeric === 'tabular' ? ' ds-nums-tabular' : ''} ${className}`.trim()}
          lang={lang}
          dir={dir}
          translate={translate}
          title={title}
          {...restProps}
          {...(responsive ? responsive.attrs : {})}
          data-part="root"
          data-color={color}
          {...typographyDataAttributes(craftProps)}
          style={resolvedTextStyle}
        >
          {children}
        </TextElement>
      </>
    );
  }
);

ApolloText.displayName = 'ApolloText';

/**
 * Apollo (Vanilla/CSS) implementation of Paragraph component.
 *
 * Pure CSS implementation using CSS variables and inline styles.
 * Provides optimized line-height and spacing for readability.
 */
export const ApolloParagraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  (props, ref) => {
    const {
      size: sizeProp = TYPOGRAPHY_DEFAULTS.paragraph.size,
      weight = TYPOGRAPHY_DEFAULTS.paragraph.weight,
      color = TYPOGRAPHY_DEFAULTS.paragraph.color,
      align = TYPOGRAPHY_DEFAULTS.paragraph.align,
      truncate = TYPOGRAPHY_DEFAULTS.paragraph.truncate,
      lineClamp,
      textStyle,
      family,
      fluid,
      leading,
      tracking,
      wrap = 'pretty',
      hyphenate,
      contrast,
      motion = 'none',
      lang,
      dir,
      translate,
      title,
      children,
      className = '',
      style,
      ...restProps
    } = props;

    const reactId = useId();
    const sizeIsResponsive = isResponsiveValue(sizeProp);
    const responsiveEntries: ResponsivePropEntry<any>[] = [];
    if (sizeIsResponsive) {
      responsiveEntries.push(
        {
          cssProperty: 'font-size',
          value: sizeProp,
          resolve: (value: TextSize) =>
            fluid ? resolveFluidTypographySize('text', value) : SIZE_MAP.text[value] || SIZE_MAP.text.md,
        } as ResponsivePropEntry<any>,
        {
          cssProperty: 'line-height',
          value: sizeProp,
          resolve: (value: TextSize) => LINE_HEIGHT_MAP.text[value] || '1.5',
        } as ResponsivePropEntry<any>,
      );
    }
    const responsive = responsiveEntries.length
      ? generateResponsiveCSS(`paragraph-${reactId.replace(/:/g, '')}`, responsiveEntries)
      : null;
    const size = scalarOrUndefined(sizeProp) ?? TYPOGRAPHY_DEFAULTS.paragraph.size;
    const craftProps = {
      textStyle,
      family,
      fluid,
      leading,
      tracking,
      wrap,
      hyphenate,
      contrast,
      motion,
    };

    // Paragraphs use a relaxed line-height (1.625) for readability in
    // longer text blocks. Margin is reset to zero so DS layout components
    // (Stack, Flex) are solely responsible for vertical rhythm.
    const paragraphStyle: React.CSSProperties = {
      ...(!sizeIsResponsive && !textStyle
        ? { fontSize: SIZE_MAP.text[size] || SIZE_MAP.text.md }
        : {}),
      fontWeight: WEIGHT_MAP[weight] || WEIGHT_MAP.normal,
      textAlign: align,
      lineHeight: 'var(--ds-line-height-relaxed, 1.625)',
      margin: 0,
      ...resolveTypographyCraftStyle({
        ...craftProps,
        kind: 'text',
        size,
        align,
        truncate,
        lineClamp,
        responsive: sizeIsResponsive,
      }),
      ...style,
    };

    return (
      <>
        {responsive?.css && <style dangerouslySetInnerHTML={{ __html: responsive.css }} />}
        <p
          ref={ref}
          className={`rottay-paragraph ${SCOPE_CLASSES} ${className}`.trim()}
          lang={lang}
          dir={dir}
          translate={translate}
          title={title}
          {...restProps}
          {...(responsive ? responsive.attrs : {})}
          data-part="root"
          data-color={color}
          {...typographyDataAttributes(craftProps)}
          style={paragraphStyle}
        >
          {children}
        </p>
      </>
    );
  }
);

ApolloParagraph.displayName = 'ApolloParagraph';

/**
 * Apollo (Vanilla/CSS) implementation of Link component.
 *
 * Pure CSS implementation using CSS variables and inline styles.
 * Provides styled anchor elements with hover effects.
 */
export const ApolloLink = forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => {
    const {
      href,
      target,
      rel,
      size: sizeProp = TYPOGRAPHY_DEFAULTS.link.size,
      weight,
      color = TYPOGRAPHY_DEFAULTS.link.color,
      underlineOnHover = TYPOGRAPHY_DEFAULTS.link.underlineOnHover,
      underline = TYPOGRAPHY_DEFAULTS.link.underline,
      disabled = TYPOGRAPHY_DEFAULTS.link.disabled,
      strong = TYPOGRAPHY_DEFAULTS.link.strong,
      textStyle,
      family,
      fluid,
      leading,
      tracking,
      wrap = 'auto',
      hyphenate,
      contrast,
      motion = 'none',
      lang,
      dir,
      translate,
      title,
      onClick,
      children,
      className = '',
      style,
      ...restProps
    } = props;

    // Security: external links get noopener noreferrer to prevent the
    // opened page from accessing the opener's window.opener reference.
    const computedRel = rel || (target === '_blank' ? 'noopener noreferrer' : undefined);

    const reactId = useId();
    const sizeIsResponsive = isResponsiveValue(sizeProp);
    const responsiveEntries: ResponsivePropEntry<any>[] = [];
    if (sizeIsResponsive) {
      responsiveEntries.push(
        {
          cssProperty: 'font-size',
          value: sizeProp,
          resolve: (value: TextSize) =>
            fluid ? resolveFluidTypographySize('text', value) : SIZE_MAP.text[value] || SIZE_MAP.text.md,
        } as ResponsivePropEntry<any>,
        {
          cssProperty: 'line-height',
          value: sizeProp,
          resolve: (value: TextSize) => LINE_HEIGHT_MAP.text[value] || '1.5',
        } as ResponsivePropEntry<any>,
      );
    }
    const responsive = responsiveEntries.length
      ? generateResponsiveCSS(`link-${reactId.replace(/:/g, '')}`, responsiveEntries)
      : null;
    const size = scalarOrUndefined(sizeProp) ?? TYPOGRAPHY_DEFAULTS.link.size;
    const craftProps = {
      textStyle,
      family,
      fluid,
      leading,
      tracking,
      wrap,
      hyphenate,
      contrast,
      motion,
    };

    // Link color defaults to the primary accent (not default text color)
    // because links should be visually distinguishable from surrounding text.
    const linkStyle: React.CSSProperties = {
      ...(!sizeIsResponsive && !textStyle
        ? { fontSize: SIZE_MAP.text[size] || SIZE_MAP.text.md }
        : {}),
      // `strong` prop takes precedence over `weight` for bold link text.
      fontWeight: strong ? WEIGHT_MAP.semibold : (weight ? WEIGHT_MAP[weight] : WEIGHT_MAP.normal),
      textDecoration: underline ? 'underline' : 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition:
        'color var(--ds-type-motion-duration, 160ms) var(--ds-type-motion-easing, ease), text-decoration-color var(--ds-type-motion-duration, 160ms) var(--ds-type-motion-easing, ease)',
      textDecorationThickness: 'var(--ds-type-decoration-thickness, 0.08em)',
      textUnderlineOffset: 'var(--ds-type-decoration-offset, 0.18em)',
      ...resolveTypographyCraftStyle({
        ...craftProps,
        kind: 'text',
        size,
        responsive: sizeIsResponsive,
      }),
      ...style,
    };

    // Disabled links still need a click handler to preventDefault,
    // because removing href alone does not prevent programmatic clicks
    // or form submissions that might bubble up to the anchor.
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    return (
      <>
        {responsive?.css && <style dangerouslySetInnerHTML={{ __html: responsive.css }} />}
        <a
          ref={ref}
          href={disabled ? undefined : href}
          target={target}
          rel={computedRel}
          onClick={handleClick}
          className={`rottay-link ${SCOPE_CLASSES} rottay-typography--link ${className}`.trim()}
          lang={lang}
          dir={dir}
          translate={translate}
          title={title}
          {...restProps}
          {...(responsive ? responsive.attrs : {})}
          data-part="root"
          data-color={color}
          data-disabled={disabled || undefined}
          {...typographyDataAttributes(craftProps)}
          style={linkStyle}
          aria-disabled={disabled || undefined}
        >
          {children}
        </a>
      </>
    );
  }
);

ApolloLink.displayName = 'ApolloLink';

/**
 * Default export for engine factory compatibility.
 * Exports the primary Heading component for the Typography namespace.
 */
// Rustic aliases provide a consistent naming convention across all engines
// (ClassicX, ModernX, RusticX) while the internal "Apollo" names are preserved
// for backward compatibility with early adopters of the design system.
export { ApolloHeading as RusticHeading };
export { ApolloText as RusticText };
export { ApolloParagraph as RusticParagraph };
export { ApolloLink as RusticLink };

export default ApolloHeading;
