import React from 'react';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import ModernTable from '../engines/modern';
import { DesignSystemProvider } from '../../../../../runtime/bootstrap';
import type { TenantConfig } from '../../../../../contracts';
import type { ColumnType } from '../Table.types';

// ---------------------------------------------------------------------------
// WO-ARC-09 checkpoint 1 — the Table skins are a real stylesheet, asserted here.
//
// The screenshot + state-matrix gates prove the shipped table looks identical.
// They cannot prove the STRUCTURAL contract the migration created: that the paint
// lives in the skin (not inline), that every painting border rule clears the
// P-48 tenant `*` floor at (0,3,1) — i.e. reaches specificity (0,4,0) — and that
// the interaction-state rules the flagship never photographs actually exist. A
// component that copies this pattern for the other five workspace-tier components
// inherits those guarantees only if they are ratcheted, so they are ratcheted here.
// ---------------------------------------------------------------------------

const SKIN_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../../tokens/css/engines'
);
const SKINS = {
  modern: readFileSync(join(SKIN_DIR, 'modern/skin/table.css'), 'utf8'),
  rustic: readFileSync(join(SKIN_DIR, 'rustic/skin/table.css'), 'utf8'),
} as const;

/** Strip comments and `@keyframes` blocks, then return every `{selector, body}` rule. */
function cssRules(css: string): Array<{ selector: string; body: string }> {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove @-rules that carry nested braces (keyframes): match one level of nesting.
  const noAtRules = noComments.replace(/@[\w-]+[^{]*\{(?:[^{}]|\{[^}]*\})*\}/g, '');
  const rules: Array<{ selector: string; body: string }> = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(noAtRules)) !== null) {
    rules.push({ selector: m[1].trim(), body: m[2].trim() });
  }
  return rules;
}

/**
 * The specificity "b" column (classes + attributes + pseudo-classes) for a single
 * (comma-free) selector. The skins carry no id and no inline style, so this column
 * is what a rule must push to >= 4 to clear the (0,3,1) tenant border floor.
 */
function bColumn(selector: string): number {
  const classes = (selector.match(/\.[A-Za-z_-][\w-]*/g) || []).length;
  const attrs = (selector.match(/\[[^\]]*\]/g) || []).length;
  // pseudo-classes (`:hover`, `:not(...)`) but not pseudo-elements (`::before`).
  const pseudos = (selector.match(/(?<!:):[A-Za-z-]+/g) || []).length;
  // `:not(x)` counts its argument's specificity, not the `:not` itself.
  const notArgs = (selector.match(/:not\(([^)]*)\)/g) || []).reduce(
    (n, frag) => n + bColumn(frag.slice(5, -1)),
    0
  );
  return classes + attrs + pseudos + notArgs;
}

/** True if the declaration block sets a border COLOR (paints), not a `none`/`0` reset. */
function paintsBorder(body: string): boolean {
  const re =
    /(?:^|[\s;{])border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?(?:-color)?\s*:\s*([^;]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const value = m[1].trim().toLowerCase();
    if (value.startsWith('none') || value.startsWith('0') || value === 'unset' || value === 'inherit')
      continue;
    return true;
  }
  return false;
}

describe.each(['modern', 'rustic'] as const)('Table %s skin — structural contract', (engine) => {
  const rules = cssRules(SKINS[engine]);

  it('parses into a non-trivial set of rules (guards against a broken read)', () => {
    expect(rules.length).toBeGreaterThan(10);
  });

  it('every painting border rule reaches specificity (0,4,0)', () => {
    const offenders: string[] = [];
    for (const { selector, body } of rules) {
      if (!paintsBorder(body)) continue;
      for (const part of selector.split(',')) {
        if (bColumn(part) < 4) offenders.push(part.trim());
      }
    }
    expect(
      offenders,
      `these painting-border rules sit below (0,4,0) and lose their color to the tenant * floor (P-48):\n${offenders.join('\n')}`
    ).toEqual([]);
  });

  it('buys the 4th unit from data-part or an explicit attribute, never role/aria-label/placeholder', () => {
    const incidental: string[] = [];
    for (const { selector, body } of rules) {
      if (!paintsBorder(body)) continue;
      if (/\[(?:role|aria-label|placeholder)\b/.test(selector)) incidental.push(selector);
    }
    expect(
      incidental,
      `painting border specificity must not depend on an incidental attribute a refactor could move:\n${incidental.join('\n')}`
    ).toEqual([]);
  });
});

describe('Table skins — the interaction-state rules the flagship never photographs', () => {
  it('modern pins the row hover, selected row, and sort-descend rules', () => {
    const css = SKINS.modern;
    expect(css).toMatch(/\[data-part='row'\]\[data-selected='true'\]/);
    expect(css).toMatch(/\[data-part='row'\]\[data-hoverable='true'\][^{]*:hover/);
    expect(css).toMatch(/\[data-part='sort-indicator'\]\[data-order='descend'\][^{]*\{[^}]*rotate\(180deg\)/);
  });

  it('rustic pins the row hover, selected row, and pagination hover/active rules', () => {
    const css = SKINS.rustic;
    expect(css).toMatch(/\[data-part='row'\]\[data-selected='true'\]/);
    expect(css).toMatch(/\[data-part='row'\]\[data-hoverable='true'\][^{]*:hover/);
    expect(css).toMatch(/\[data-part='pagination-button'\][^{]*:hover/);
    expect(css).toMatch(/\[data-part='pagination-button'\][^{]*:active/);
  });
});

const TEST_TENANT_CONFIG: TenantConfig = {
  slug: 'test-tenant',
  name: 'Test Tenant',
  engine: 'modern',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: ['testing'],
  branding: {
    companyName: 'Test Tenant',
    primaryColor: '#2563eb',
    secondaryColor: '#0f766e',
    accentColor: '#7c3aed',
    darkPrimaryColor: '#93c5fd',
    darkSecondaryColor: '#5eead4',
    darkAccentColor: '#c4b5fd',
  },
};

const COLUMNS: ColumnType<{ key: string; name: string }>[] = [
  { key: 'name', title: 'Name', dataIndex: 'name' },
];
const DATA = [{ key: '1', name: 'Ada' }];

describe('Table modern — the DOM carries the contract, not the paint', () => {
  const html = renderToStaticMarkup(
    <DesignSystemProvider tenantConfig={TEST_TENANT_CONFIG} forceEngine="modern" skipCssLoading>
      <ModernTable columns={COLUMNS} dataSource={DATA} pagination={false} />
    </DesignSystemProvider>
  );

  it('scopes on the ds-table--modern root and stamps the row/cell parts', () => {
    expect(html).toContain('ds-table ds-table--modern');
    expect(html).toMatch(/<tr\b[^>]*data-part="row"/);
    expect(html).toMatch(/<td\b[^>]*data-part="cell"/);
    expect(html).toMatch(/<th\b[^>]*data-part="header-cell"/);
  });

  it('paints no row/cell background inline — that is the skin\'s job now', () => {
    const rowTag = /<tr\b[^>]*data-part="row"[^>]*>/.exec(html)?.[0] ?? '';
    const cellTag = /<td\b[^>]*data-part="cell"[^>]*>/.exec(html)?.[0] ?? '';
    // A `background` DECLARATION (`background:` / `background-color:`), not the
    // word inside the row's `transition: background-color ...` (motion, not paint).
    expect(rowTag).not.toMatch(/background(?:-color)?\s*:/);
    expect(cellTag).not.toMatch(/background(?:-color)?\s*:/);
  });
});
