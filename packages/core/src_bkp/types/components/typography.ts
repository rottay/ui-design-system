/**
 * Typography Component Types
 *
 * Unified type definitions for the Typography component.
 * Works with titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { ReactNode, CSSProperties, HTMLAttributes, AnchorHTMLAttributes } from 'react';

/**
 * Typography Type Variants
 */
export type TypographyType = 'secondary' | 'success' | 'warning' | 'danger';

/**
 * Base Typography Props
 */
export interface BaseTypographyProps {
  /** Additional CSS class */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;

  /** Content type styling */
  type?: TypographyType;

  /** Disabled state */
  disabled?: boolean;

  /** Mark styling */
  mark?: boolean;

  /** Code styling */
  code?: boolean;

  /** Keyboard styling */
  keyboard?: boolean;

  /** Underline styling */
  underline?: boolean;

  /** Delete/strikethrough styling */
  delete?: boolean;

  /** Strong/bold styling */
  strong?: boolean;

  /** Italic styling */
  italic?: boolean;
}

/**
 * Copyable Configuration
 */
export interface CopyableConfig {
  /** Text to copy (defaults to content) */
  text?: string;

  /** Callback when copied */
  onCopy?: () => void;

  /** Custom copy icon */
  icon?: ReactNode;

  /** Custom tooltip text */
  tooltips?: [ReactNode, ReactNode]; // [copy, copied]

  /** Format to copy */
  format?: 'text/plain' | 'text/html';
}

/**
 * Editable Configuration
 */
export interface EditableConfig {
  /** Callback when editing starts */
  onStart?: () => void;

  /** Callback when editing changes */
  onChange?: (value: string) => void;

  /** Callback when editing ends */
  onEnd?: () => void;

  /** Max length */
  maxLength?: number;

  /** Auto size */
  autoSize?: boolean | { minRows?: number; maxRows?: number };

  /** Trigger type */
  triggerType?: ('icon' | 'text')[];

  /** Enter icon */
  enterIcon?: ReactNode;

  /** Custom editing icon */
  icon?: ReactNode;

  /** Tooltip text */
  tooltip?: ReactNode;
}

/**
 * Ellipsis Configuration
 */
export interface EllipsisConfig {
  /** Number of rows before ellipsis */
  rows?: number;

  /** Expandable */
  expandable?: boolean;

  /** Suffix text */
  suffix?: string;

  /** Symbol to show */
  symbol?: ReactNode;

  /** Callback when expand state changes */
  onExpand?: (event: React.MouseEvent, expanded: boolean) => void;

  /** Tooltip */
  tooltip?: ReactNode;
}

/**
 * Title Props
 */
export interface TitleProps extends BaseTypographyProps {
  /** Heading level (1-5) */
  level?: 1 | 2 | 3 | 4 | 5;

  /** Content */
  children?: ReactNode;

  /** Copyable */
  copyable?: boolean | CopyableConfig;

  /** Editable */
  editable?: boolean | EditableConfig;

  /** Ellipsis */
  ellipsis?: boolean | EllipsisConfig;
}

/**
 * Paragraph Props
 */
export interface ParagraphProps extends BaseTypographyProps {
  /** Content */
  children?: ReactNode;

  /** Copyable */
  copyable?: boolean | CopyableConfig;

  /** Editable */
  editable?: boolean | EditableConfig;

  /** Ellipsis */
  ellipsis?: boolean | EllipsisConfig;
}

/**
 * Text Props
 */
export interface TextProps extends BaseTypographyProps {
  /** Content */
  children?: ReactNode;

  /** Copyable */
  copyable?: boolean | CopyableConfig;

  /** Editable */
  editable?: boolean | EditableConfig;

  /** Ellipsis */
  ellipsis?: boolean | EllipsisConfig;
}

/**
 * Link Props
 */
export interface LinkProps extends BaseTypographyProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'type'> {
  /** Content */
  children?: ReactNode;

  /** Link URL */
  href?: string;

  /** Link target */
  target?: string;

  /** Ellipsis */
  ellipsis?: boolean | EllipsisConfig;
}

/**
 * Typography Container Props
 */
export interface TypographyProps extends HTMLAttributes<HTMLDivElement> {
  /** Content */
  children?: ReactNode;

  /** Additional CSS class */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get type color classes
 */
export function getTypeColorClass(type?: TypographyType, engine: 'titan' | 'hermes' | 'apollo' = 'apollo'): string {
  if (!type) return '';

  if (engine === 'hermes') {
    const colorMap: Record<TypographyType, string> = {
      secondary: 'text-base-content/60',
      success: 'text-success',
      warning: 'text-warning',
      danger: 'text-error',
    };
    return colorMap[type];
  }

  // Apollo (Tailwind)
  const colorMap: Record<TypographyType, string> = {
    secondary: 'text-gray-500',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
  };
  return colorMap[type];
}

/**
 * Build typography class names
 */
export function buildTypographyClasses(
  props: BaseTypographyProps,
  baseClass: string = '',
  engine: 'titan' | 'hermes' | 'apollo' = 'apollo'
): string {
  const classes = [baseClass];

  if (props.className) {
    classes.push(props.className);
  }

  const typeColor = getTypeColorClass(props.type, engine);
  if (typeColor) {
    classes.push(typeColor);
  }

  if (props.disabled) {
    classes.push(engine === 'hermes' ? 'opacity-50 cursor-not-allowed' : 'opacity-50 cursor-not-allowed');
  }

  if (props.mark) {
    classes.push(engine === 'hermes' ? 'bg-warning/20 px-1' : 'bg-yellow-200 px-1');
  }

  if (props.code) {
    classes.push(engine === 'hermes'
      ? 'font-mono bg-base-200 px-1.5 py-0.5 rounded text-sm'
      : 'font-mono bg-gray-100 px-1.5 py-0.5 rounded text-sm border border-gray-200'
    );
  }

  if (props.keyboard) {
    classes.push(engine === 'hermes'
      ? 'font-mono bg-base-200 px-1.5 py-0.5 rounded border border-base-300 shadow-sm text-sm'
      : 'font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-300 shadow-sm text-sm'
    );
  }

  if (props.underline) {
    classes.push('underline');
  }

  if (props.delete) {
    classes.push('line-through');
  }

  if (props.strong) {
    classes.push('font-semibold');
  }

  if (props.italic) {
    classes.push('italic');
  }

  return classes.filter(Boolean).join(' ');
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    return successful;
  } catch (err) {
    console.error('Failed to copy text:', err);
    return false;
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
}

/**
 * Get text content from ReactNode
 */
export function getTextContent(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getTextContent).join('');
  }

  if (node && typeof node === 'object' && 'props' in node) {
    return getTextContent((node as any).props.children);
  }

  return '';
}
