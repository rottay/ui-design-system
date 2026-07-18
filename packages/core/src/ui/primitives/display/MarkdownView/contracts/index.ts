/**
 * @fileoverview Type definitions for the MarkdownView pattern.
 *
 * MarkdownView is a leaf display primitive that renders a bounded CommonMark
 * subset. The parser (runtime/parser) emits the {@link MarkdownNode} abstract
 * syntax tree defined here; the view walks that tree and, as a leaf primitive,
 * constructs token-governed raw DOM elements directly (`<h1 data-part>`,
 * `<a data-part>`, `<code data-part>`, ...) rather than composing sibling
 * primitives -- the same tier at which Text/Heading/Link themselves bottom out.
 * There is no raw-HTML passthrough and no `dangerouslySetInnerHTML` anywhere in
 * the component, so the surface is XSS-safe by construction: hostile source can
 * only ever become inert text nodes, never markup or executable code.
 *
 * The supported subset is deliberately narrow (headings, emphasis/strong,
 * inline code, links, ordered/unordered/task lists, fenced code, blockquotes,
 * GFM pipe tables, thematic breaks). Anything outside the subset -- raw HTML,
 * autolinks, images, reference links -- degrades to literal text.
 */

import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Inline AST
// ---------------------------------------------------------------------------

/** Literal run of text. Always rendered as inert characters. */
export interface MarkdownTextNode {
  type: 'text';
  value: string;
}

/** Emphasis span (`*text*` / `_text_`). Rendered italic. */
export interface MarkdownEmphasisNode {
  type: 'emphasis';
  children: MarkdownInlineNode[];
}

/** Strong span (`**text**` / `__text__`). Rendered bold. */
export interface MarkdownStrongNode {
  type: 'strong';
  children: MarkdownInlineNode[];
}

/** Inline code span (`` `code` ``). Rendered monospace, never parsed further. */
export interface MarkdownInlineCodeNode {
  type: 'inlineCode';
  value: string;
}

/**
 * Inline link (`[label](href)`). `href` is the RAW destination as authored;
 * the view sanitizes it against the active link policy before rendering, and
 * downgrades disallowed destinations to plain text. Never trust `href` as a
 * safe navigation target without running it through the view's sanitizer.
 */
export interface MarkdownLinkNode {
  type: 'link';
  href: string;
  children: MarkdownInlineNode[];
}

/** Any inline-level node. */
export type MarkdownInlineNode =
  | MarkdownTextNode
  | MarkdownEmphasisNode
  | MarkdownStrongNode
  | MarkdownInlineCodeNode
  | MarkdownLinkNode;

// ---------------------------------------------------------------------------
// Block AST
// ---------------------------------------------------------------------------

/** ATX heading (`#`..`######`). `level` is clamped to 1..6. */
export interface MarkdownHeadingNode {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: MarkdownInlineNode[];
}

/** Paragraph of inline content. */
export interface MarkdownParagraphNode {
  type: 'paragraph';
  children: MarkdownInlineNode[];
}

/** Fenced code block. `value` is verbatim; `language` is the info string. */
export interface MarkdownCodeBlockNode {
  type: 'code';
  language?: string;
  value: string;
}

/** Blockquote (`>`). Contains nested block content. */
export interface MarkdownBlockquoteNode {
  type: 'blockquote';
  children: MarkdownBlockNode[];
}

/**
 * List item. `checked` is `null` for plain items, `true`/`false` for GFM task
 * list items (`- [x]` / `- [ ]`).
 */
export interface MarkdownListItemNode {
  type: 'listItem';
  checked: boolean | null;
  children: MarkdownBlockNode[];
}

/** Ordered or unordered list. */
export interface MarkdownListNode {
  type: 'list';
  ordered: boolean;
  /** Starting number for ordered lists (defaults to 1). */
  start: number;
  items: MarkdownListItemNode[];
}

/** Column alignment for a GFM table. */
export type MarkdownTableAlign = 'left' | 'center' | 'right' | null;

/** Single table cell of inline content. */
export interface MarkdownTableCellNode {
  type: 'tableCell';
  children: MarkdownInlineNode[];
}

/** GFM pipe table. */
export interface MarkdownTableNode {
  type: 'table';
  align: MarkdownTableAlign[];
  header: MarkdownTableCellNode[];
  rows: MarkdownTableCellNode[][];
}

/** Thematic break (`---`, `***`, `___`). */
export interface MarkdownThematicBreakNode {
  type: 'thematicBreak';
}

/** Any block-level node. */
export type MarkdownBlockNode =
  | MarkdownHeadingNode
  | MarkdownParagraphNode
  | MarkdownCodeBlockNode
  | MarkdownBlockquoteNode
  | MarkdownListNode
  | MarkdownTableNode
  | MarkdownThematicBreakNode;

/** Root document node produced by the parser. */
export type MarkdownNode = MarkdownBlockNode;

// ---------------------------------------------------------------------------
// Component contract
// ---------------------------------------------------------------------------

/** URL schemes the view is allowed to emit as real links. */
export type MarkdownLinkScheme = 'http' | 'https' | 'mailto';

/**
 * Link-handling policy. Destinations whose (case-insensitive, control-char and
 * entity-normalized) scheme is not in `allow` render as plain text, closing the
 * `javascript:`/`data:`/`vbscript:` injection class. Relative destinations
 * (`/path`, `#anchor`, `./x`) are always allowed; protocol-relative `//host`
 * destinations are treated as disallowed for safety.
 */
export interface MarkdownLinkPolicy {
  /** Allowed URL schemes. Defaults to `['http', 'https', 'mailto']`. */
  allow?: MarkdownLinkScheme[];
  /**
   * Invoked when a rendered link is activated. When provided, default
   * navigation is suppressed and the (already-sanitized) href is handed to the
   * app so it can route through its own navigation layer.
   */
  onNavigate?: (href: string) => void;
}

/** Props handed to a custom fenced-code slot. */
export interface MarkdownCodeSlotProps {
  /** Verbatim code content of the fence. */
  code: string;
  /** Info-string language of the fence, if any. */
  language?: string;
}

/** Rendering-density posture for the document rhythm. */
export type MarkdownDensity = 'compact' | 'comfortable';

/**
 * Props for the MarkdownView pattern.
 *
 * @example
 * ```tsx
 * <MarkdownView source={message} density="comfortable" />
 * ```
 */
export interface MarkdownViewProps {
  /** The markdown source string to parse and render. */
  source: string;
  /**
   * Vertical rhythm between blocks.
   * @default 'comfortable'
   */
  density?: MarkdownDensity;
  /** Link-handling policy (scheme allowlist + navigation hook). */
  linkPolicy?: MarkdownLinkPolicy;
  /**
   * Render-slot overrides. The `code` slot replaces the default plain fenced
   * code renderer, letting an app mount the interactive `CodeBlock` primitive
   * (with its own required copy labels) without the DS hardcoding any copy.
   */
  slots?: {
    code?: (props: MarkdownCodeSlotProps) => ReactNode;
  };
  /** Additional class applied to the root element. */
  className?: string;
}
