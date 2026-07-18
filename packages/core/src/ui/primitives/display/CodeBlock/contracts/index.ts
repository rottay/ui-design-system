/**
 * @fileoverview Type definitions for the CodeBlock primitive and its
 * HighlighterAdapter port.
 *
 * CodeBlock renders source code with an honest, dependency-free default: a
 * `pre`/`code` block with optional line numbers and a selection-safe copy
 * control. Syntax highlighting is provided by an app-registered
 * {@link HighlighterAdapter}, mirroring the icon-supplier law -- the design
 * system never imports a highlighter (shiki/prism/etc.) itself. This keeps the
 * DS bundle free of any tokenizer and lets each app choose (or omit) one.
 */

import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Highlighter port
// ---------------------------------------------------------------------------

/** A single styled run of characters within a highlighted line. */
export interface HighlightTokenSpan {
  /** Verbatim characters of the token. */
  content: string;
  /**
   * Resolved color for the token. Adapters SHOULD prefer DS CSS custom
   * properties (e.g. `var(--ds-code-token-keyword)`) but may emit any CSS
   * color string. When omitted the token inherits the block's text color.
   */
  color?: string;
  /** Font style applied to the token. */
  fontStyle?: 'normal' | 'italic' | 'bold';
}

/** A single line of highlighted tokens. */
export interface HighlightTokenLine {
  tokens: HighlightTokenSpan[];
}

/**
 * Adapter port for a syntax highlighter. Apps register an implementation with
 * {@link registerHighlighter}; the design system ships none. The contract
 * mirrors the icon adapter law: the supplier (shiki, prism, highlight.js) stays
 * an app dependency behind this boundary and never crosses into the DS.
 */
export interface HighlighterAdapter {
  /** Stable identifier used for diagnostics and adapter replacement. */
  id: string;
  /**
   * When `true`, the adapter is safe to run during server rendering and its
   * output is emitted on the server. Otherwise the block renders plain on the
   * server and upgrades on the client after mount. Defaults to `false`.
   */
  ssr?: boolean;
  /**
   * Tokenize source into styled lines. May be synchronous or asynchronous; an
   * async adapter resolves after mount and the block swaps from plain to
   * highlighted without layout shift.
   */
  highlight(code: string, language?: string): HighlightTokenLine[] | Promise<HighlightTokenLine[]>;
}

// ---------------------------------------------------------------------------
// Component contract
// ---------------------------------------------------------------------------

/** Props for the CodeBlock primitive. */
export interface CodeBlockProps {
  /** The source code to render. Rendered verbatim; never parsed as markup. */
  code: string;
  /** Language hint passed to the registered highlighter (if any). */
  language?: string;
  /** Show a line-number gutter. @default false */
  showLineNumbers?: boolean;
  /** 1-based line numbers to emphasize with a highlight band. */
  highlightLines?: number[];
  /** Soft-wrap long lines instead of horizontal scrolling. @default false */
  wrap?: boolean;
  /** Maximum block height before vertical scrolling engages. */
  maxHeight?: number | string;
  /**
   * Accessible label for the copy button in its idle state. Required: the DS
   * hardcodes no copy, so the consuming app supplies localized labels.
   */
  copyLabel: string;
  /** Accessible label shown briefly after a successful copy. Required. */
  copiedLabel: string;
  /** Accessible label for the code region. Defaults to a generic role name. */
  ariaLabel?: string;
  /** Optional slot rendered in the block header (e.g. a filename). */
  title?: ReactNode;
  /** Additional class applied to the root element. */
  className?: string;
}

/** Default values for CodeBlock. */
export const CODE_BLOCK_DEFAULTS = {
  showLineNumbers: false,
  wrap: false,
  /** Milliseconds the "copied" confirmation stays visible. */
  copiedResetMs: 1600,
} as const;
