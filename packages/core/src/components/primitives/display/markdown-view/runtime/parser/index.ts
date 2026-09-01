/**
 * @fileoverview Vendored, zero-dependency CommonMark-subset parser.
 *
 * Pure functions only -- no React, no DOM -- so the whole module is
 * unit-testable in isolation and reusable by any renderer. `parseMarkdown`
 * turns a source string into a {@link MarkdownBlockNode} array; the view then
 * renders that AST onto token-governed raw DOM elements.
 *
 * Security posture: the parser never emits HTML. Every construct outside the
 * supported subset (raw HTML tags, autolinks, images, reference definitions)
 * degrades to literal text nodes. Link destinations are captured VERBATIM into
 * the AST; scheme validation is the renderer's responsibility (it depends on
 * the runtime link policy). The parser therefore cannot, on its own, produce an
 * executable or markup-bearing node -- XSS-safety is a structural property of
 * the AST, not a runtime check.
 *
 * The subset is intentionally narrow and its algorithms are linear or
 * near-linear over the input so hostile/pathological AI output cannot trigger
 * catastrophic backtracking.
 */

import type {
  MarkdownBlockNode,
  MarkdownInlineNode,
  MarkdownListItemNode,
  MarkdownTableAlign,
  MarkdownTableCellNode,
} from '../../contracts';

// ---------------------------------------------------------------------------
// Block-level parsing
// ---------------------------------------------------------------------------

const ATX_HEADING = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?[ \t]*#*[ \t]*$/;
const FENCE_OPEN = /^( {0,3})(`{3,}|~{3,})[ \t]*([^`\n]*?)[ \t]*$/;
const THEMATIC_BREAK = /^ {0,3}(?:(?:\*[ \t]*){3,}|(?:-[ \t]*){3,}|(?:_[ \t]*){3,})$/;
const BLOCKQUOTE = /^ {0,3}>[ \t]?/;
const UNORDERED_ITEM = /^( {0,3})([-*+])([ \t]+)(.*)$/;
const ORDERED_ITEM = /^( {0,3})(\d{1,9})([.)])([ \t]+)(.*)$/;
const TASK_MARKER = /^\[([ xX])\][ \t]+(.*)$/;
const TABLE_DELIMITER = /^ {0,3}\|?[ \t]*:?-+:?[ \t]*(\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*$/;

/** Normalize line endings and strip a UTF-8 BOM. */
function normalizeSource(source: string): string[] {
  return source
    .replace(/^﻿/, '')
    .replace(/\r\n?/g, '\n')
    .replace(/\t/g, '    ')
    .split('\n');
}

/**
 * Parse a markdown source string into a block AST.
 */
export function parseMarkdown(source: string): MarkdownBlockNode[] {
  if (typeof source !== 'string' || source.length === 0) {
    return [];
  }
  return parseBlocks(normalizeSource(source));
}

function isBlank(line: string): boolean {
  return /^[ \t]*$/.test(line);
}

/** Number of leading spaces (tabs already expanded). */
function indentOf(line: string): number {
  const match = /^ */.exec(line);
  return match ? match[0].length : 0;
}

function parseBlocks(lines: string[]): MarkdownBlockNode[] {
  const nodes: MarkdownBlockNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (isBlank(line)) {
      i += 1;
      continue;
    }

    // Fenced code block.
    const fence = FENCE_OPEN.exec(line);
    if (fence) {
      const [, indent, marker, info] = fence;
      const fenceChar = marker[0];
      const fenceLen = marker.length;
      const closeRe = new RegExp(`^ {0,3}${'\\' + fenceChar}{${fenceLen},}[ \\t]*$`);
      const stripIndent = indent.length;
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !closeRe.test(lines[i])) {
        // Strip up to the opening fence's indentation, no more.
        const raw = lines[i];
        const cut = Math.min(stripIndent, indentOf(raw));
        body.push(raw.slice(cut));
        i += 1;
      }
      if (i < lines.length) {
        i += 1; // consume closing fence
      }
      const language = info.trim().split(/\s+/)[0] || undefined;
      nodes.push({ type: 'code', language, value: body.join('\n') });
      continue;
    }

    // Thematic break (checked before list so `- - -` is a rule, not a list).
    if (THEMATIC_BREAK.test(line)) {
      nodes.push({ type: 'thematicBreak' });
      i += 1;
      continue;
    }

    // ATX heading.
    const heading = ATX_HEADING.exec(line);
    if (heading) {
      const level = Math.min(6, heading[1].length) as 1 | 2 | 3 | 4 | 5 | 6;
      nodes.push({
        type: 'heading',
        level,
        children: parseInline((heading[2] ?? '').trim()),
      });
      i += 1;
      continue;
    }

    // Blockquote (contiguous `>`-prefixed lines; lazy continuation of a
    // following non-blank, non-block line is folded in).
    if (BLOCKQUOTE.test(line)) {
      const inner: string[] = [];
      while (i < lines.length && !isBlank(lines[i])) {
        if (BLOCKQUOTE.test(lines[i])) {
          inner.push(lines[i].replace(BLOCKQUOTE, ''));
          i += 1;
        } else if (
          !FENCE_OPEN.test(lines[i]) &&
          !ATX_HEADING.test(lines[i]) &&
          !THEMATIC_BREAK.test(lines[i]) &&
          !UNORDERED_ITEM.test(lines[i]) &&
          !ORDERED_ITEM.test(lines[i])
        ) {
          inner.push(lines[i]);
          i += 1;
        } else {
          break;
        }
      }
      nodes.push({ type: 'blockquote', children: parseBlocks(inner) });
      continue;
    }

    // Table (pipe row followed by a delimiter row).
    if (
      line.includes('|') &&
      i + 1 < lines.length &&
      TABLE_DELIMITER.test(lines[i + 1]) &&
      lines[i + 1].includes('-')
    ) {
      const table = parseTable(lines, i);
      if (table) {
        nodes.push(table.node);
        i = table.next;
        continue;
      }
    }

    // Lists.
    if (UNORDERED_ITEM.test(line) || ORDERED_ITEM.test(line)) {
      const list = parseList(lines, i);
      nodes.push(list.node);
      i = list.next;
      continue;
    }

    // Paragraph: accumulate until a blank line or a block-starting line.
    const para: string[] = [];
    while (i < lines.length && !isBlank(lines[i])) {
      const l = lines[i];
      if (
        ATX_HEADING.test(l) ||
        FENCE_OPEN.test(l) ||
        THEMATIC_BREAK.test(l) ||
        BLOCKQUOTE.test(l) ||
        UNORDERED_ITEM.test(l) ||
        ORDERED_ITEM.test(l) ||
        (l.includes('|') &&
          i + 1 < lines.length &&
          TABLE_DELIMITER.test(lines[i + 1]) &&
          lines[i + 1].includes('-'))
      ) {
        if (para.length > 0) break;
      }
      para.push(l.trim());
      i += 1;
    }
    if (para.length > 0) {
      nodes.push({ type: 'paragraph', children: parseInline(para.join('\n')) });
    }
  }

  return nodes;
}

// ---------------------------------------------------------------------------
// Lists
// ---------------------------------------------------------------------------

interface ItemMatch {
  indent: number;
  ordered: boolean;
  delimiter: string;
  start: number;
  contentIndent: number;
  content: string;
}

function matchItem(line: string): ItemMatch | null {
  const ordered = ORDERED_ITEM.exec(line);
  if (ordered) {
    const [, indent, num, delim, spaces, content] = ordered;
    return {
      indent: indent.length,
      ordered: true,
      delimiter: delim,
      start: Number.parseInt(num, 10),
      contentIndent: indent.length + num.length + delim.length + spaces.length,
      content,
    };
  }
  const unordered = UNORDERED_ITEM.exec(line);
  if (unordered) {
    const [, indent, bullet, spaces, content] = unordered;
    return {
      indent: indent.length,
      ordered: false,
      delimiter: bullet,
      start: 1,
      contentIndent: indent.length + bullet.length + spaces.length,
      content,
    };
  }
  return null;
}

function parseList(lines: string[], startIndex: number): { node: MarkdownBlockNode; next: number } {
  const first = matchItem(lines[startIndex])!;
  const ordered = first.ordered;
  const items: MarkdownListItemNode[] = [];
  let i = startIndex;

  while (i < lines.length) {
    const marker = matchItem(lines[i]);
    // Same-list membership: a marker at the base indentation of the same kind.
    if (!marker || marker.ordered !== ordered || marker.indent > first.indent + 1) {
      break;
    }
    if (marker.indent < first.indent) {
      break;
    }

    const contentIndent = marker.contentIndent;
    const itemLines: string[] = [marker.content];
    i += 1;

    // Gather continuation lines: blanks, or lines indented into the item body.
    while (i < lines.length) {
      const l = lines[i];
      if (isBlank(l)) {
        // Blank belongs to the item only if a following line continues it.
        const next = lines[i + 1];
        if (next !== undefined && !isBlank(next) && indentOf(next) >= contentIndent) {
          itemLines.push('');
          i += 1;
          continue;
        }
        break;
      }
      // A new sibling marker at the base indent ends this item.
      const siblingMarker = matchItem(l);
      if (siblingMarker && siblingMarker.indent <= first.indent + 1 && indentOf(l) < contentIndent) {
        break;
      }
      if (indentOf(l) >= contentIndent) {
        itemLines.push(l.slice(contentIndent));
        i += 1;
        continue;
      }
      break;
    }

    let checked: boolean | null = null;
    const task = TASK_MARKER.exec(itemLines[0]);
    if (task) {
      checked = task[1].toLowerCase() === 'x';
      itemLines[0] = task[2];
    }

    items.push({
      type: 'listItem',
      checked,
      children: parseBlocks(itemLines),
    });
  }

  return {
    node: { type: 'list', ordered, start: first.start, items },
    next: i,
  };
}

// ---------------------------------------------------------------------------
// Tables (GFM pipe tables)
// ---------------------------------------------------------------------------

/** Split a table row on unescaped pipes, trimming the outer pipes. */
function splitRow(row: string): string[] {
  const cells: string[] = [];
  let current = '';
  let escaped = false;
  const trimmed = row.trim().replace(/^\|/, '').replace(/\|$/, '');
  for (let k = 0; k < trimmed.length; k += 1) {
    const ch = trimmed[k];
    if (escaped) {
      current += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      current += ch;
      escaped = true;
      continue;
    }
    if (ch === '|') {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

function parseAlignment(cell: string): MarkdownTableAlign {
  const left = cell.startsWith(':');
  const right = cell.endsWith(':');
  if (left && right) return 'center';
  if (right) return 'right';
  if (left) return 'left';
  return null;
}

function parseTable(
  lines: string[],
  startIndex: number,
): { node: MarkdownBlockNode; next: number } | null {
  const headerCells = splitRow(lines[startIndex]);
  const delimiterCells = splitRow(lines[startIndex + 1]);
  if (delimiterCells.length !== headerCells.length) {
    return null;
  }
  const align = delimiterCells.map(parseAlignment);
  const header: MarkdownTableCellNode[] = headerCells.map((c) => ({
    type: 'tableCell',
    children: parseInline(c),
  }));

  const rows: MarkdownTableCellNode[][] = [];
  let i = startIndex + 2;
  while (i < lines.length && !isBlank(lines[i]) && lines[i].includes('|')) {
    if (
      ATX_HEADING.test(lines[i]) ||
      FENCE_OPEN.test(lines[i]) ||
      THEMATIC_BREAK.test(lines[i])
    ) {
      break;
    }
    const cells = splitRow(lines[i]);
    const normalized: MarkdownTableCellNode[] = [];
    for (let c = 0; c < headerCells.length; c += 1) {
      normalized.push({ type: 'tableCell', children: parseInline(cells[c] ?? '') });
    }
    rows.push(normalized);
    i += 1;
  }

  return {
    node: { type: 'table', align, header, rows },
    next: i,
  };
}

// ---------------------------------------------------------------------------
// Inline parsing
// ---------------------------------------------------------------------------

const ASCII_PUNCTUATION = /[!-/:-@[-`{-~]/;

type InlineToken =
  | { kind: 'text'; value: string }
  | { kind: 'code'; value: string }
  | { kind: 'link'; href: string; children: MarkdownInlineNode[] }
  | { kind: 'delim'; char: string; length: number; canOpen: boolean; canClose: boolean; active: boolean };

function isPunct(ch: string | undefined): boolean {
  return ch !== undefined && ASCII_PUNCTUATION.test(ch);
}

function isWhitespaceChar(ch: string | undefined): boolean {
  return ch === undefined || /\s/.test(ch);
}

/**
 * Tokenize inline text into a flat token stream. Code spans and links are
 * resolved eagerly (highest precedence); emphasis delimiters are recorded as
 * runs and matched in a second pass.
 */
function tokenizeInline(text: string, allowLinks: boolean): InlineToken[] {
  const tokens: InlineToken[] = [];
  let buffer = '';
  let i = 0;

  const flush = (): void => {
    if (buffer) {
      tokens.push({ kind: 'text', value: buffer });
      buffer = '';
    }
  };

  while (i < text.length) {
    const ch = text[i];

    // Backslash escape of ASCII punctuation.
    if (ch === '\\' && i + 1 < text.length && isPunct(text[i + 1])) {
      buffer += text[i + 1];
      i += 2;
      continue;
    }

    // Code span: run of N backticks closed by an identical run.
    if (ch === '`') {
      let run = 0;
      while (text[i + run] === '`') run += 1;
      const close = findClosingBackticks(text, i + run, run);
      if (close !== -1) {
        flush();
        let code = text.slice(i + run, close);
        // A single leading+trailing space is stripped when content is not all
        // spaces (CommonMark code-span rule).
        if (code.length > 1 && code.startsWith(' ') && code.endsWith(' ') && code.trim() !== '') {
          code = code.slice(1, -1);
        }
        tokens.push({ kind: 'code', value: code.replace(/\n/g, ' ') });
        i = close + run;
        continue;
      }
      buffer += '`'.repeat(run);
      i += run;
      continue;
    }

    // Inline link: [label](destination). Images and reference links degrade.
    // Links do not nest, so inside a link label `allowLinks` is false.
    if (ch === '[' && allowLinks) {
      const link = parseLinkAt(text, i);
      if (link) {
        flush();
        tokens.push({
          kind: 'link',
          href: link.href,
          children: processEmphasis(tokenizeInline(link.label, false)),
        });
        i = link.next;
        continue;
      }
      buffer += ch;
      i += 1;
      continue;
    }

    // Emphasis delimiter run.
    if (ch === '*' || ch === '_') {
      let run = 0;
      while (text[i + run] === ch) run += 1;
      const before = text[i - 1];
      const after = text[i + run];
      const leftFlanking =
        !isWhitespaceChar(after) && (!isPunct(after) || isWhitespaceChar(before) || isPunct(before));
      const rightFlanking =
        !isWhitespaceChar(before) && (!isPunct(before) || isWhitespaceChar(after) || isPunct(after));
      let canOpen = leftFlanking;
      let canClose = rightFlanking;
      if (ch === '_') {
        // Underscore cannot open/close intraword.
        canOpen = leftFlanking && (!rightFlanking || isPunct(before));
        canClose = rightFlanking && (!leftFlanking || isPunct(after));
      }
      flush();
      tokens.push({ kind: 'delim', char: ch, length: run, canOpen, canClose, active: true });
      i += run;
      continue;
    }

    buffer += ch;
    i += 1;
  }

  flush();
  return tokens;
}

function findClosingBackticks(text: string, from: number, run: number): number {
  let i = from;
  while (i < text.length) {
    if (text[i] === '`') {
      let len = 0;
      while (text[i + len] === '`') len += 1;
      if (len === run) return i;
      i += len;
    } else {
      i += 1;
    }
  }
  return -1;
}

interface LinkMatch {
  label: string;
  href: string;
  next: number;
}

/** Parse `[label](dest)` starting at an opening `[`. Returns null if it is not a link. */
function parseLinkAt(text: string, start: number): LinkMatch | null {
  // Match the label with bracket-depth tracking (no nested links inside).
  let depth = 0;
  let i = start;
  let labelEnd = -1;
  for (; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '\\') {
      i += 1;
      continue;
    }
    if (ch === '[') depth += 1;
    else if (ch === ']') {
      depth -= 1;
      if (depth === 0) {
        labelEnd = i;
        break;
      }
    }
  }
  if (labelEnd === -1 || text[labelEnd + 1] !== '(') {
    return null;
  }
  const label = text.slice(start + 1, labelEnd);

  // Match the destination, balancing parens, up to a closing ')'. An optional
  // "title" (quoted) is tolerated and discarded.
  let j = labelEnd + 2;
  let dest = '';
  let parenDepth = 1;
  let angle = false;
  if (text[j] === '<') {
    angle = true;
    j += 1;
  }
  for (; j < text.length; j += 1) {
    const ch = text[j];
    if (ch === '\\' && j + 1 < text.length) {
      dest += text[j + 1];
      j += 1;
      continue;
    }
    if (angle) {
      if (ch === '>') {
        j += 1;
        break;
      }
      if (ch === '\n') return null;
      dest += ch;
      continue;
    }
    if (ch === '(') parenDepth += 1;
    if (ch === ')') {
      parenDepth -= 1;
      if (parenDepth === 0) break;
    }
    if (/\s/.test(ch)) {
      // Whitespace begins an optional title; consume to the closing paren.
      break;
    }
    dest += ch;
  }

  // Skip an optional title, then require the closing ')'.
  while (j < text.length && text[j] !== ')') j += 1;
  if (text[j] !== ')') {
    return null;
  }
  return { label, href: dest.trim(), next: j + 1 };
}

/**
 * Process the delimiter stack, producing the nested inline AST. A compact
 * implementation of the CommonMark emphasis algorithm (single/double `*`/`_`,
 * flanking rules, rule of three).
 */
function processEmphasis(tokens: InlineToken[]): MarkdownInlineNode[] {
  // Work on a mutable copy where delimiter tokens carry residual length.
  for (let closerIdx = 0; closerIdx < tokens.length; closerIdx += 1) {
    const closer = tokens[closerIdx];
    if (closer.kind !== 'delim' || !closer.canClose || closer.length === 0) continue;

    for (let openerIdx = closerIdx - 1; openerIdx >= 0; openerIdx -= 1) {
      const opener = tokens[openerIdx];
      if (opener.kind !== 'delim' || !opener.canOpen || opener.length === 0) continue;
      if (opener.char !== closer.char) continue;

      // Rule of three.
      const oddMatch =
        (closer.canOpen || opener.canClose) &&
        closer.length % 3 !== 0 &&
        (opener.length + closer.length) % 3 === 0;
      if (oddMatch) continue;

      const use = opener.length >= 2 && closer.length >= 2 ? 2 : 1;
      const inner = tokens.slice(openerIdx + 1, closerIdx);
      const node: MarkdownInlineNode = {
        type: use === 2 ? 'strong' : 'emphasis',
        children: buildInline(inner),
      } as MarkdownInlineNode;

      opener.length -= use;
      closer.length -= use;

      // Replace [opener..closer] region with the collapsed node.
      const collapsed: InlineToken = { kind: 'text', value: '' };
      // Store the built node on a synthetic token by re-tokenizing: represent
      // the produced node as a resolved token.
      (collapsed as unknown as { resolved: MarkdownInlineNode }).resolved = node;
      const before: InlineToken[] = [];
      if (opener.length > 0) {
        before.push(opener);
      }
      const after: InlineToken[] = [];
      if (closer.length > 0) {
        after.push(closer);
      }
      const replacement = [...before, collapsed, ...after];
      tokens.splice(openerIdx, closerIdx - openerIdx + 1, ...replacement);
      // Restart scanning from the opener region.
      closerIdx = openerIdx + before.length;
      break;
    }
  }
  return buildInline(tokens);
}

/** Convert a resolved token stream into inline nodes. */
function buildInline(tokens: InlineToken[]): MarkdownInlineNode[] {
  const nodes: MarkdownInlineNode[] = [];
  const pushText = (value: string): void => {
    if (!value) return;
    const last = nodes[nodes.length - 1];
    if (last && last.type === 'text') {
      last.value += value;
    } else {
      nodes.push({ type: 'text', value });
    }
  };

  for (const token of tokens) {
    const resolved = (token as unknown as { resolved?: MarkdownInlineNode }).resolved;
    if (resolved) {
      nodes.push(resolved);
      continue;
    }
    switch (token.kind) {
      case 'text':
        pushText(token.value);
        break;
      case 'code':
        nodes.push({ type: 'inlineCode', value: token.value });
        break;
      case 'link':
        nodes.push({ type: 'link', href: token.href, children: token.children });
        break;
      case 'delim':
        // Unmatched delimiter runs are literal text.
        pushText(token.char.repeat(token.length));
        break;
      default:
        break;
    }
  }
  return nodes;
}

/**
 * Parse inline markdown into an inline AST.
 */
export function parseInline(text: string): MarkdownInlineNode[] {
  if (!text) return [];
  // Soft line breaks collapse to spaces (hard breaks are out of the subset).
  const normalized = text.replace(/\n/g, ' ');
  return processEmphasis(tokenizeInline(normalized, true));
}
