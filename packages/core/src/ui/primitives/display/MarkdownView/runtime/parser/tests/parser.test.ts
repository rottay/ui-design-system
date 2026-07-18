import { describe, expect, it } from 'vitest';

import { parseInline, parseMarkdown } from '../index';
import type { MarkdownBlockNode, MarkdownInlineNode } from '../../../contracts';

const ALLOWED_TYPES = new Set([
  'heading',
  'paragraph',
  'code',
  'blockquote',
  'list',
  'listItem',
  'table',
  'tableCell',
  'thematicBreak',
  'text',
  'emphasis',
  'strong',
  'inlineCode',
  'link',
]);

/** Recursively collect every node `type` present in a block tree. */
function collectTypes(nodes: unknown[], out: Set<string> = new Set()): Set<string> {
  for (const node of nodes as Array<Record<string, unknown>>) {
    if (node && typeof node.type === 'string') out.add(node.type);
    for (const value of Object.values(node ?? {})) {
      if (Array.isArray(value)) collectTypes(value, out);
    }
  }
  return out;
}

/** Concatenate all text/inlineCode/code content in a tree. */
function collectText(nodes: unknown[]): string {
  let text = '';
  for (const node of nodes as Array<Record<string, unknown>>) {
    if (node?.type === 'text' || node?.type === 'inlineCode' || node?.type === 'code') {
      text += String(node.value ?? '');
    }
    for (const value of Object.values(node ?? {})) {
      if (Array.isArray(value)) text += collectText(value);
    }
  }
  return text;
}

describe('parseMarkdown -- blocks', () => {
  it('parses ATX headings at every level', () => {
    const [h1] = parseMarkdown('# Title');
    expect(h1).toMatchObject({ type: 'heading', level: 1 });
    const [h6] = parseMarkdown('###### Deep');
    expect(h6).toMatchObject({ type: 'heading', level: 6 });
  });

  it('treats 7+ hashes as a paragraph (CommonMark caps headings at 6)', () => {
    const [node] = parseMarkdown('####### too deep');
    expect(node.type).toBe('paragraph');
  });

  it('does not treat # without a space as a heading', () => {
    const [node] = parseMarkdown('#nothashtag');
    expect(node.type).toBe('paragraph');
  });

  it('parses fenced code and does not parse its contents', () => {
    const [node] = parseMarkdown('```js\nconst x = **not bold**;\n```');
    expect(node).toEqual({ type: 'code', language: 'js', value: 'const x = **not bold**;' });
  });

  it('parses a fence with no language', () => {
    const [node] = parseMarkdown('```\nplain\n```') as MarkdownBlockNode[];
    expect(node).toMatchObject({ type: 'code', language: undefined, value: 'plain' });
  });

  it('parses blockquotes with nested inline', () => {
    const [node] = parseMarkdown('> quoted **strong**');
    expect(node.type).toBe('blockquote');
  });

  it('parses unordered and ordered lists', () => {
    const [ul] = parseMarkdown('- a\n- b');
    expect(ul).toMatchObject({ type: 'list', ordered: false });
    expect((ul as { items: unknown[] }).items).toHaveLength(2);

    const [ol] = parseMarkdown('3. first\n4. second');
    expect(ol).toMatchObject({ type: 'list', ordered: true, start: 3 });
  });

  it('parses task list items', () => {
    const [list] = parseMarkdown('- [x] done\n- [ ] todo') as unknown as [
      { items: Array<{ checked: boolean | null }> },
    ];
    expect(list.items[0].checked).toBe(true);
    expect(list.items[1].checked).toBe(false);
  });

  it('parses nested lists', () => {
    const [list] = parseMarkdown('- parent\n  - child') as unknown as [
      { items: Array<{ children: MarkdownBlockNode[] }> },
    ];
    const nested = list.items[0].children.find((c) => c.type === 'list');
    expect(nested).toBeTruthy();
  });

  it('parses a GFM pipe table with alignment', () => {
    const [table] = parseMarkdown('| a | b |\n| :-- | --: |\n| 1 | 2 |') as [
      { type: string; align: unknown[]; header: unknown[]; rows: unknown[][] },
    ];
    expect(table.type).toBe('table');
    expect(table.align).toEqual(['left', 'right']);
    expect(table.header).toHaveLength(2);
    expect(table.rows).toHaveLength(1);
  });

  it('parses thematic breaks', () => {
    expect(parseMarkdown('---')[0].type).toBe('thematicBreak');
    expect(parseMarkdown('***')[0].type).toBe('thematicBreak');
    expect(parseMarkdown('___')[0].type).toBe('thematicBreak');
  });

  it('returns an empty array for empty input', () => {
    expect(parseMarkdown('')).toEqual([]);
    expect(parseMarkdown('   \n  \n')).toEqual([]);
  });
});

describe('parseInline -- spans', () => {
  const first = (src: string): MarkdownInlineNode => parseInline(src)[0];

  it('parses strong and emphasis', () => {
    expect(first('**bold**')).toMatchObject({ type: 'strong' });
    expect(first('*em*')).toMatchObject({ type: 'emphasis' });
    expect(first('__bold__')).toMatchObject({ type: 'strong' });
    expect(first('_em_')).toMatchObject({ type: 'emphasis' });
  });

  it('nests strong inside emphasis for triple markers', () => {
    const nodes = parseInline('***x***');
    // Either em>strong or strong>em; both are valid CommonMark. Assert nesting.
    const outer = nodes[0] as { type: string; children: MarkdownInlineNode[] };
    expect(['emphasis', 'strong']).toContain(outer.type);
    expect(outer.children[0].type).toMatch(/emphasis|strong/);
  });

  it('does not apply underscore emphasis intraword', () => {
    const nodes = parseInline('a_b_c');
    expect(nodes.every((n) => n.type === 'text')).toBe(true);
  });

  it('parses inline code and does not parse markdown inside it', () => {
    expect(first('`a * b`')).toEqual({ type: 'inlineCode', value: 'a * b' });
  });

  it('captures the raw link destination verbatim (sanitization is the view job)', () => {
    expect(first('[label](https://a.com)')).toMatchObject({
      type: 'link',
      href: 'https://a.com',
    });
    // The parser does not reject dangerous schemes; it preserves them so the
    // renderer's sanitizer can decide.
    expect(first('[x](javascript:alert(1))')).toMatchObject({
      type: 'link',
      href: 'javascript:alert(1)',
    });
  });

  it('does not nest links', () => {
    const nodes = parseInline('[a [b](inner) c](outer)');
    const link = nodes.find((n) => n.type === 'link') as
      | { children: MarkdownInlineNode[] }
      | undefined;
    expect(link).toBeTruthy();
    expect(collectTypes(link ? link.children : [])).not.toContain('link');
  });

  it('leaves unmatched delimiters as literal text', () => {
    expect(parseInline('a * b').map((n) => n.type)).toEqual(['text']);
  });

  it('honors backslash escapes', () => {
    const nodes = parseInline('\\*not emphasis\\*');
    expect(nodes.every((n) => n.type === 'text')).toBe(true);
    expect(collectText(nodes)).toBe('*not emphasis*');
  });
});

describe('parseMarkdown -- XSS structural guarantees', () => {
  it('never produces a node type outside the allowed union', () => {
    const corpus = [
      '<script>alert(1)</script>',
      '<img src=x onerror=alert(1)>',
      '<iframe src="javascript:alert(1)"></iframe>',
      '<div onclick="steal()">hi</div>',
      '<!-- comment -->',
      '<svg><use href="#x"/></svg>',
      '**bold** and `code` and [l](https://a.com)',
      '> quote\n\n- item\n\n| a | b |\n|-|-|\n|1|2|',
    ].join('\n\n');
    const tree = parseMarkdown(corpus);
    for (const type of collectTypes(tree)) {
      expect(ALLOWED_TYPES.has(type)).toBe(true);
    }
  });

  it('keeps raw HTML as inert literal text', () => {
    const tree = parseMarkdown('<script>alert(1)</script>');
    expect(collectText(tree)).toContain('<script>alert(1)</script>');
    expect(collectTypes(tree).has('link')).toBe(false);
  });

  it('does not crash on pathological delimiter runs', () => {
    const bomb = '*'.repeat(2000) + '_'.repeat(2000) + '`'.repeat(500);
    expect(() => parseMarkdown(bomb)).not.toThrow();
  });
});
