/**
 * @fileoverview Typography Classic Engine - Rottay Design System
 * @description Ant Design-based typography with rich text features.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine wraps Ant Design's Typography components to provide
 * rich text features with consistent design system API.
 *
 * **Available Components:**
 * - `ClassicHeading` - Ant Design Title wrapper
 * - `ClassicText` - Ant Design Text wrapper
 * - `ClassicParagraph` - Ant Design Paragraph wrapper
 *
 * **Implementation Details:**
 * - Maps heading levels to Ant Design Title levels (1-5)
 * - Maps colors to Ant Design text types
 * - Uses built-in ellipsis for truncation
 * - h6 maps to level 5 (Ant Design limitation)
 *
 * **Ant Design Features:**
 * - Built-in copy to clipboard
 * - Editable text support
 * - Expandable truncation
 * - Typography context
 *
 * @example Basic Usage
 * ```tsx
 * import { Typography } from '@rottay/design-system';
 *
 * <Typography.Heading engine="classic" level="h1">
 *   Rich Heading
 * </Typography.Heading>
 * ```
 *
 * @see {@link Typography} for the main component
 * @see {@link https://ant.design/components/typography} Ant Design Typography
 * @module Typography/engines/classic
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import { forwardRef, useId } from 'react';
import React from 'react';
import { Typography as AntTypography } from 'antd';
import type { HeadingProps, TextProps, ParagraphProps, LinkProps, TextSize } from '../../contracts';
import { TYPOGRAPHY_DEFAULTS, SIZE_MAP, WEIGHT_MAP, COLOR_MAP, LINE_HEIGHT_MAP } from '../../contracts';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '@/infrastructure/runtime/responsive/runtime/style-properties';
import type { ResponsiveValue } from '@/foundation/contracts/kernel/responsive/values';
import {
  resolveFluidTypographySize,
  resolveTypographyCraftStyle,
  typographyDataAttributes,
} from '../../runtime';

const { Title, Text: AntText, Paragraph: AntParagraph, Link: AntLink } = AntTypography;

/**
 * Maps DS heading levels (h1-h6) to Ant Design Title levels (1-5).
 * AntD only supports 5 levels. `h6` is rendered through the native element
 * branch below so visual-engine choice never corrupts the document outline.
 */
const LEVEL_MAP: Record<string, 1 | 2 | 3 | 4 | 5> = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 5,
};

/**
 * Maps DS color names to AntD text types. "primary" maps to undefined
 * because AntD has no built-in "primary" text type -- the primary color
 * must be applied via custom CSS or theme tokens instead. "muted" maps
 * to "secondary" which provides the reduced-contrast treatment.
 */
const TYPE_MAP: Record<string, 'secondary' | 'success' | 'warning' | 'danger' | undefined> = {
  default: undefined,
  muted: 'secondary',
  subtle: 'secondary',
  inherit: undefined,
  primary: undefined,
  success: 'success',
  warning: 'warning',
  error: 'danger',
};

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
 * Classic (Ant Design) implementation of Heading component.
 *
 * Wraps Ant Design's Title component with design system props interface.
 * Supports all heading levels and color variants.
 *
 * @example
 * ```tsx
 * <ClassicHeading level="h1" color="primary">
 *   Welcome to the Dashboard
 * </ClassicHeading>
 * ```
 */
export const ClassicHeading = forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      level = TYPOGRAPHY_DEFAULTS.heading.level,
      size,
      weight,
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
      className,
      style,
      ...props
    },
    ref
  ) => {
    // AntD Title uses `ellipsis.rows` to control multi-line truncation.
    // When only `truncate` is set (no lineClamp), default to 1 row so
    // the heading clips to a single line with an ellipsis.
    const ellipsisConfig = truncate || lineClamp
      ? { rows: lineClamp || 1 }
      : undefined;

    // Responsive size handling
    const reactId = useId();
    const responsiveEntries: ResponsivePropEntry<any>[] = [];
    const sizeIsResponsive = isResponsiveValue(size);

    if (sizeIsResponsive) {
      // Use !important to override Ant Design's inline heading styles
      responsiveEntries.push({
        cssProperty: 'font-size',
        value: size,
        resolve: (v: TextSize) => `${fluid ? resolveFluidTypographySize('heading', v) : SIZE_MAP.heading[v] || SIZE_MAP.heading.md} !important`,
      } as ResponsivePropEntry<any>);
      responsiveEntries.push({
        cssProperty: 'line-height',
        value: size,
        resolve: (v: TextSize) => `${LINE_HEIGHT_MAP.heading[v] || '1.2'} !important`,
      } as ResponsivePropEntry<any>);
    }

    const needsResponsiveCSS = responsiveEntries.length > 0;
    const elementId = needsResponsiveCSS ? `heading-${reactId.replace(/:/g, '')}` : '';
    const responsive = needsResponsiveCSS
      ? generateResponsiveCSS(elementId, responsiveEntries)
      : null;
    const scalarSize = scalarOrUndefined(size);
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
    const resolvedStyle: React.CSSProperties = {
      ...(!sizeIsResponsive && scalarSize && !textStyle
        ? { fontSize: SIZE_MAP.heading[scalarSize] }
        : {}),
      ...(weight ? { fontWeight: WEIGHT_MAP[weight] } : {}),
      textAlign: align,
      // Reset AntD's default Title margin and mirror the same behavior in the
      // native h6 branch so layout primitives own vertical rhythm.
      margin: 0,
      ...resolveTypographyCraftStyle({
        ...craftProps,
        kind: 'heading',
        size: scalarSize,
        align,
        truncate,
        lineClamp,
        responsive: sizeIsResponsive,
      }),
      ...style,
    };
    const resolvedClassName =
      `rottay-typography rottay-typography--classic ${className ?? ''}`.trim();

    if (level === 'h6') {
      return (
        <>
          {responsive?.css && <style dangerouslySetInnerHTML={{ __html: responsive.css }} />}
          <h6
            ref={ref}
            lang={lang}
            dir={dir}
            translate={translate}
            title={title}
            {...props}
            {...(responsive ? responsive.attrs : {})}
            data-part="root"
            data-color={color}
            {...typographyDataAttributes(craftProps)}
            style={resolvedStyle}
            className={resolvedClassName}
          >
            {children}
          </h6>
        </>
      );
    }

    return (
      <>
        {responsive && responsive.css && (
          <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
        )}
        <Title
          ref={ref as React.Ref<HTMLElement>}
          level={LEVEL_MAP[level]}
          type={TYPE_MAP[color]}
          ellipsis={ellipsisConfig}
          lang={lang}
          dir={dir}
          translate={translate}
          title={title}
          {...props}
          {...(responsive ? responsive.attrs : {})}
          data-part="root"
          data-color={color}
          {...typographyDataAttributes(craftProps)}
          style={resolvedStyle}
          className={resolvedClassName}
        >
          {children}
        </Title>
      </>
    );
  }
);

ClassicHeading.displayName = 'ClassicHeading';

/**
 * Classic (Ant Design) implementation of Text component.
 *
 * Wraps Ant Design's Text component with design system props interface.
 * Supports text decorations, colors, and truncation.
 *
 * @example
 * ```tsx
 * <ClassicText color="success" underline>
 *   Successfully saved!
 * </ClassicText>
 * ```
 */
export const ClassicText = forwardRef<HTMLElement, TextProps>(
  (
    {
      size: sizeProp = TYPOGRAPHY_DEFAULTS.text.size,
      weight,
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
      className,
      style,
      ...props
    },
    ref
  ) => {
    // AntD Text uses a boolean (not an object) for ellipsis because inline
    // text elements cannot have multi-row truncation -- they are always
    // single-line. The `lineClamp` prop is accepted but effectively ignored.
    const ellipsisConfig = truncate || lineClamp ? true : undefined;

    // Responsive size handling
    const reactId = useId();
    const responsiveEntries: ResponsivePropEntry<any>[] = [];
    const sizeIsResponsive = isResponsiveValue(sizeProp);

    if (sizeIsResponsive) {
      // Use !important to override Ant Design's inline text styles
      responsiveEntries.push({
        cssProperty: 'font-size',
        value: sizeProp,
        resolve: (v: TextSize) => `${fluid ? resolveFluidTypographySize('text', v) : SIZE_MAP.text[v] || SIZE_MAP.text.md} !important`,
      } as ResponsivePropEntry<any>);
      responsiveEntries.push({
        cssProperty: 'line-height',
        value: sizeProp,
        resolve: (v: TextSize) => `${LINE_HEIGHT_MAP.text[v] || '1.5'} !important`,
      } as ResponsivePropEntry<any>);
    }

    const needsResponsiveCSS = responsiveEntries.length > 0;
    const elementId = needsResponsiveCSS ? `text-${reactId.replace(/:/g, '')}` : '';
    const responsive = needsResponsiveCSS
      ? generateResponsiveCSS(elementId, responsiveEntries)
      : null;
    const size = scalarOrUndefined(sizeProp) ?? TYPOGRAPHY_DEFAULTS.text.size;
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
    const resolvedClassName = [
      'rottay-typography',
      'rottay-typography--classic',
      className,
      numeric === 'tabular' ? 'ds-nums-tabular' : undefined,
    ].filter(Boolean).join(' ') || undefined;
    const resolvedStyle: React.CSSProperties = {
      ...(!sizeIsResponsive && !textStyle ? { fontSize: SIZE_MAP.text[size] } : {}),
      ...(weight ? { fontWeight: WEIGHT_MAP[weight] } : {}),
      ...(as !== 'span' ? { color: COLOR_MAP[color] } : {}),
      ...(underline || strikethrough
        ? {
            textDecoration: [underline ? 'underline' : '', strikethrough ? 'line-through' : '']
              .filter(Boolean)
              .join(' '),
          }
        : {}),
      ...(italic ? { fontStyle: 'italic' } : {}),
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

    if (as !== 'span') {
      const TextElement = as as React.ElementType;
      return (
        <>
          {responsive?.css && <style dangerouslySetInnerHTML={{ __html: responsive.css }} />}
          <TextElement
            ref={ref}
            lang={lang}
            dir={dir}
            translate={translate}
            title={title}
            {...props}
            {...(responsive ? responsive.attrs : {})}
            data-part="root"
            data-color={color}
            {...typographyDataAttributes(craftProps)}
            className={resolvedClassName}
            style={resolvedStyle}
          >
            {children}
          </TextElement>
        </>
      );
    }

    return (
      <>
        {responsive && responsive.css && (
          <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
        )}
        <AntText
          ref={ref as React.Ref<HTMLElement>}
          type={TYPE_MAP[color]}
          underline={underline}
          // AntD uses `delete` (not `strikethrough`) for line-through styling
          delete={strikethrough}
          italic={italic}
          // `code` renders a <code> tag with monospace font
          code={monospace}
          ellipsis={ellipsisConfig}
          lang={lang}
          dir={dir}
          translate={translate}
          title={title}
          {...props}
          {...(responsive ? responsive.attrs : {})}
          data-part="root"
          data-color={color}
          {...typographyDataAttributes(craftProps)}
          style={resolvedStyle}
          className={resolvedClassName}
        >
          {children}
        </AntText>
      </>
    );
  }
);

ClassicText.displayName = 'ClassicText';

/**
 * Classic (Ant Design) implementation of Paragraph component.
 *
 * Wraps Ant Design's Paragraph component with design system props interface.
 * Provides optimized line-height and spacing for body text.
 *
 * @example
 * ```tsx
 * <ClassicParagraph color="muted">
 *   Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * </ClassicParagraph>
 * ```
 */
export const ClassicParagraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  (
    {
      size: sizeProp = TYPOGRAPHY_DEFAULTS.paragraph.size,
      weight,
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
      className,
      style,
      ...props
    },
    ref
  ) => {
    // Paragraphs support multi-row truncation via AntD's expandable
    // ellipsis. Default to 1 row when only `truncate` is set.
    const ellipsisConfig = truncate || lineClamp
      ? { rows: lineClamp || 1 }
      : undefined;
    const reactId = useId();
    const sizeIsResponsive = isResponsiveValue(sizeProp);
    const responsiveEntries: ResponsivePropEntry<any>[] = [];
    if (sizeIsResponsive) {
      responsiveEntries.push(
        {
          cssProperty: 'font-size',
          value: sizeProp,
          resolve: (value: TextSize) => `${fluid ? resolveFluidTypographySize('text', value) : SIZE_MAP.text[value] || SIZE_MAP.text.md} !important`,
        } as ResponsivePropEntry<any>,
        {
          cssProperty: 'line-height',
          value: sizeProp,
          resolve: (value: TextSize) => `${LINE_HEIGHT_MAP.text[value] || '1.5'} !important`,
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

    return (
      <>
        {responsive?.css && <style dangerouslySetInnerHTML={{ __html: responsive.css }} />}
        <AntParagraph
          ref={ref as React.Ref<HTMLElement>}
          type={TYPE_MAP[color]}
          ellipsis={ellipsisConfig}
          lang={lang}
          dir={dir}
          translate={translate}
          title={title}
          {...props}
          {...(responsive ? responsive.attrs : {})}
          data-part="root"
          data-color={color}
          {...typographyDataAttributes(craftProps)}
          style={{
            ...(!sizeIsResponsive && !textStyle ? { fontSize: SIZE_MAP.text[size] } : {}),
            ...(weight ? { fontWeight: WEIGHT_MAP[weight] } : {}),
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
          }}
          className={`rottay-typography rottay-typography--classic ${className ?? ''}`.trim()}
        >
          {children}
        </AntParagraph>
      </>
    );
  }
);

ClassicParagraph.displayName = 'ClassicParagraph';

/**
 * Classic (Ant Design) implementation of Link component.
 *
 * Wraps Ant Design's Link component with design system props interface.
 * Provides styled anchor elements with consistent appearance.
 *
 * @example
 * ```tsx
 * <ClassicLink href="/about">Learn more</ClassicLink>
 * <ClassicLink href="https://example.com" target="_blank">External link</ClassicLink>
 * ```
 */
export const ClassicLink = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
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
      className,
      style,
      ...props
    },
    ref
  ) => {
    // Security best-practice: external links (_blank) get noopener noreferrer
    // automatically so the opened page cannot access window.opener.
    const computedRel = rel || (target === '_blank' ? 'noopener noreferrer' : undefined);
    const reactId = useId();
    const sizeIsResponsive = isResponsiveValue(sizeProp);
    const responsiveEntries: ResponsivePropEntry<any>[] = [];
    if (sizeIsResponsive) {
      responsiveEntries.push(
        {
          cssProperty: 'font-size',
          value: sizeProp,
          resolve: (value: TextSize) => `${fluid ? resolveFluidTypographySize('text', value) : SIZE_MAP.text[value] || SIZE_MAP.text.md} !important`,
        } as ResponsivePropEntry<any>,
        {
          cssProperty: 'line-height',
          value: sizeProp,
          resolve: (value: TextSize) => `${LINE_HEIGHT_MAP.text[value] || '1.5'} !important`,
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

    return (
      <>
        {responsive?.css && <style dangerouslySetInnerHTML={{ __html: responsive.css }} />}
        <AntLink
          ref={ref as React.Ref<HTMLElement>}
          href={disabled ? undefined : href}
          target={target}
          rel={computedRel}
          type={TYPE_MAP[color]}
          underline={underline || !underlineOnHover}
          disabled={disabled}
          strong={strong}
          onClick={disabled ? undefined : onClick}
          lang={lang}
          dir={dir}
          translate={translate}
          title={title}
          {...props}
          {...(responsive ? responsive.attrs : {})}
          data-part="root"
          data-color={color}
          data-disabled={disabled || undefined}
          {...typographyDataAttributes(craftProps)}
          aria-disabled={disabled || undefined}
          style={{
            ...(!sizeIsResponsive && !textStyle ? { fontSize: SIZE_MAP.text[size] } : {}),
            ...(weight ? { fontWeight: WEIGHT_MAP[weight] } : {}),
            ...resolveTypographyCraftStyle({
              ...craftProps,
              kind: 'text',
              size,
              responsive: sizeIsResponsive,
            }),
            ...style,
          }}
          className={`rottay-typography rottay-typography--classic ${className ?? ''}`.trim()}
        >
          {children}
        </AntLink>
      </>
    );
  }
);

ClassicLink.displayName = 'ClassicLink';

/**
 * Default export for engine factory compatibility.
 * Exports the primary Heading component for the Typography namespace.
 */
export default ClassicHeading;
