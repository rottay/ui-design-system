import type { BaseComponentProps } from '../../../../../types/common';
import type { EngineAwareProps } from '../../../../../types/engine';

/**
 * Heading semantic levels.
 */
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

/**
 * Text size options.
 */
export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

/**
 * Font weight options.
 */
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';

/**
 * Text alignment options.
 */
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

/**
 * Text semantic colors.
 */
export type TextColor = 'default' | 'muted' | 'primary' | 'success' | 'warning' | 'error';

/**
 * Props for the Heading component.
 */
export interface HeadingProps extends BaseComponentProps, EngineAwareProps {
  /** Heading semantic level */
  level?: HeadingLevel;
  /** Visual size (can differ from semantic level) */
  size?: TextSize;
  /** Font weight */
  weight?: TextWeight;
  /** Text alignment */
  align?: TextAlign;
  /** Text color */
  color?: TextColor;
  /** Truncate with ellipsis */
  truncate?: boolean;
  /** Maximum lines before truncating */
  lineClamp?: number;
  /** Heading content */
  children: React.ReactNode;
}

/**
 * Props for the Text component.
 */
export interface TextProps extends BaseComponentProps, EngineAwareProps {
  /** Text size */
  size?: TextSize;
  /** Font weight */
  weight?: TextWeight;
  /** Text color */
  color?: TextColor;
  /** Text alignment */
  align?: TextAlign;
  /** Render as different element */
  as?: 'span' | 'p' | 'div' | 'label';
  /** Truncate with ellipsis */
  truncate?: boolean;
  /** Maximum lines before truncating */
  lineClamp?: number;
  /** Underline */
  underline?: boolean;
  /** Strikethrough */
  strikethrough?: boolean;
  /** Italic */
  italic?: boolean;
  /** Monospace font */
  monospace?: boolean;
  /** Text content */
  children: React.ReactNode;
}

/**
 * Props for the Paragraph component.
 */
export interface ParagraphProps extends BaseComponentProps, EngineAwareProps {
  /** Text size */
  size?: TextSize;
  /** Font weight */
  weight?: TextWeight;
  /** Text color */
  color?: TextColor;
  /** Text alignment */
  align?: TextAlign;
  /** Truncate with ellipsis */
  truncate?: boolean;
  /** Maximum lines before truncating */
  lineClamp?: number;
  /** Paragraph content */
  children: React.ReactNode;
}

/**
 * Combined Typography component props.
 */
export interface TypographyProps extends BaseComponentProps, EngineAwareProps {
  /** Typography variant */
  variant?: 'heading' | 'text' | 'paragraph';
  /** Children */
  children: React.ReactNode;
}
