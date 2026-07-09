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
import type { HeadingProps, TextProps, ParagraphProps, LinkProps, TextSize } from '../Typography.types';
import { TYPOGRAPHY_DEFAULTS, SIZE_MAP, LINE_HEIGHT_MAP } from '../Typography.types';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '../../../layout/shared/responsive-props';
import type { ResponsiveValue } from '../../../layout/shared/types';

const { Title, Text: AntText, Paragraph: AntParagraph, Link: AntLink } = AntTypography;

/**
 * Maps DS heading levels (h1-h6) to Ant Design Title levels (1-5).
 * AntD only supports 5 levels, so h6 is collapsed into level 5.
 * This is an intentional tradeoff: semantic HTML still renders h6 via
 * AntD internals, but the visual size matches h5.
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
        resolve: (v: TextSize) => `${SIZE_MAP.heading[v] || SIZE_MAP.heading.md} !important`,
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
          style={{
            textWrap: 'balance',
            textAlign: align,
            // Reset AntD's default Title margin to let the DS layout
            // components (Stack, Flex) control spacing instead.
            margin: 0,
            ...style,
          }}
          className={className}
          {...(responsive ? responsive.attrs : {})}
          {...props}
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
      as,
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
        resolve: (v: TextSize) => `${SIZE_MAP.text[v] || SIZE_MAP.text.md} !important`,
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
          style={{
            textWrap: 'pretty',
            textAlign: align,
            ...style,
          }}
          className={[className, numeric === 'tabular' ? 'ds-nums-tabular' : undefined].filter(Boolean).join(' ') || undefined}
          {...(responsive ? responsive.attrs : {})}
          {...props}
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
      size = TYPOGRAPHY_DEFAULTS.paragraph.size,
      weight,
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
    // Paragraphs support multi-row truncation via AntD's expandable
    // ellipsis. Default to 1 row when only `truncate` is set.
    const ellipsisConfig = truncate || lineClamp
      ? { rows: lineClamp || 1 }
      : undefined;

    return (
      <AntParagraph
        ref={ref as React.Ref<HTMLElement>}
        type={TYPE_MAP[color]}
        ellipsis={ellipsisConfig}
        style={{
          textAlign: align,
          ...style,
        }}
        className={className}
        {...props}
      >
        {children}
      </AntParagraph>
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
    // Security best-practice: external links (_blank) get noopener noreferrer
    // automatically so the opened page cannot access window.opener.
    const computedRel = rel || (target === '_blank' ? 'noopener noreferrer' : undefined);

    return (
      <AntLink
        ref={ref as React.Ref<HTMLElement>}
        href={href}
        target={target}
        rel={computedRel}
        type={TYPE_MAP[color]}
        // When underlineOnHover is false we want the underline always
        // visible, so we pass true. AntD lacks a "hover-only" mode,
        // making this the closest approximation.
        underline={underline || !underlineOnHover}
        disabled={disabled}
        strong={strong}
        onClick={onClick}
        style={style}
        className={className}
        {...props}
      >
        {children}
      </AntLink>
    );
  }
);

ClassicLink.displayName = 'ClassicLink';

/**
 * Default export for engine factory compatibility.
 * Exports the primary Heading component for the Typography namespace.
 */
export default ClassicHeading;
