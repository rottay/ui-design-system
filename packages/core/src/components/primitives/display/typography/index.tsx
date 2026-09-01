/**
 * @fileoverview Typography - Heading, Text, Paragraph, and Link primitives.
 * Available as a compound namespace (`Typography.Heading`) or standalone
 * exports (`Heading`, `Text`, `Paragraph`, `Link`). Unlike most display
 * components, Typography does not use `createEngineComponent` itself --
 * each sub-component is its own engine-routed unit.
 *
 * @example
 * ```tsx
 * import { Typography, Heading, Text } from '@rottay/design-system';
 *
 * <Typography.Heading level="h1" size="3xl">Page Title</Typography.Heading>
 * <Text color="muted">Subtitle text</Text>
 * <Typography.Paragraph lineClamp={3}>Long body...</Typography.Paragraph>
 * ```
 *
 * @module Typography
 * @category Display
 */

'use client';

import {
  TypographyHeading,
  TypographyText,
  TypographyParagraph,
  TypographyLink,
} from './compound';

export type {
  HeadingProps,
  TextProps,
  ParagraphProps,
  LinkProps,
  TypographyProps,
  HeadingLevel,
  TextSize,
  TextWeight,
  TextAlign,
  TextColor,
  TypographyAlign,
  TypographyStyle,
  TypographyFamily,
  TypographyLeading,
  TypographyTracking,
  TypographyWrap,
  TypographyContrast,
  TypographyMotion,
  TypographyLocaleProps,
  TypographyCraftProps,
} from './contracts';

export { TYPOGRAPHY_DEFAULTS, SIZE_MAP, WEIGHT_MAP, COLOR_MAP, LINE_HEIGHT_MAP } from './contracts';

export { TypographyHeading, TypographyText, TypographyParagraph, TypographyLink };

// Shorter aliases for direct import: `import { Heading, Text } from '...'`
export { TypographyHeading as Heading };
export { TypographyText as Text };
export { TypographyParagraph as Paragraph };
export { TypographyLink as Link };

/**
 * Typography namespace object.
 *
 * Unlike other display primitives, Typography is a plain object (not an
 * engine component) because each sub-component is independently engine-routed.
 * The namespace exists so consumers can use `Typography.Heading` for
 * organized, discoverable imports alongside standalone `Heading`/`Text`.
 */
export const Typography = {
  /** Semantic heading (h1-h6) with optional visual `size` override. */
  Heading: TypographyHeading,

  /** Inline text span with color, weight, and decoration props. */
  Text: TypographyText,

  /** Block-level paragraph with line-clamp and truncation support. */
  Paragraph: TypographyParagraph,

  /** Styled anchor element with visited/hover state handling. */
  Link: TypographyLink,
};

export default Typography;
