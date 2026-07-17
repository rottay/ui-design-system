import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, waitFor } from '@testing-library/react';

import { PatternDataTable } from '..';
import type { ColumnDef } from '../../../../../foundation/contracts/runtime/components/patterns/core';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

/**
 * `data-part` is a shared VOCABULARY, not an identifier. This component composes
 * other components (Badge, Card, Input, ...), and every migrated primitive stamps
 * parts of its own -- so a bare `[data-part="x"]` query inside this container also
 * matches the anatomy of the components this one is BUILT FROM, which paint inline
 * legitimately until their own batch migrates them. Ownership is therefore decided
 * structurally: a node belongs to THIS component iff no other `data-part="root"`
 * sits between it and this component's root.
 */
function ownParts(scope: HTMLElement, part: string): HTMLElement[] {
  // This component's OWN root is the outermost `data-part="root"` in the tree.
  const own = scope.querySelector('[data-part="root"]') as HTMLElement | null;
  if (!own) return [];
  if (part === 'root') return [own];
  const all = own.querySelectorAll(`[data-part="${part}"]`) as NodeListOf<HTMLElement>;
  return [...all].filter((el) => {
    // Anything under a NESTED root belongs to a component this one is built FROM
    // (a Badge, a Card, an Input) -- and that component paints inline legitimately
    // until its own batch migrates it.
    for (let p = el.parentElement; p && p !== own; p = p.parentElement) {
      if (p.getAttribute('data-part') === 'root') return false;
    }
    return true;
  });
}

// ---------------------------------------------------------------------------
// WO-ARC-09 checkpoint 6 — the data-table paint now lives in three unlayered
// skins (modern + rustic engine skins + one agnostic mobile/editor skin),
// asserted here. The visual baselines prove the shipped table looks identical at
// rest and in the photographed states; they cannot prove the STRUCTURAL contract
// the migration created: that the paint lives in the skins (not inline), that
// every painting border rule clears the P-48 tenant `*` floor (0,3,1) by reaching
// (0,4,0), that the removed imperative row-hover handlers are now ONE modern
// `:hover` rule (and rustic still paints no hover), that the mobile Card
// suppression outranks card.css, and that the DOM carries the data-part contract
// with no inline paint left behind except runtime-measured residuals. Static
// interaction rules and keyframes now live in one additional unlayered skin.
// ---------------------------------------------------------------------------

const here = dirname(fileURLToPath(import.meta.url));
const tokens = (p: string) => join(here, '../../../../../foundation/tokens/css', p);
const engineSrc = (p: string) => readFileSync(join(here, '..', p), 'utf8');

const SKINS = {
  modern: readFileSync(tokens('runtime/engines/modern/skin/data-table.css'), 'utf8'),
  rustic: readFileSync(tokens('runtime/engines/rustic/skin/data-table.css'), 'utf8'),
  mobile: readFileSync(tokens('presentation/components/skin/data-table-mobile.css'), 'utf8'),
};
const CARD_CSS = [
  readFileSync(tokens('runtime/engines/modern/skin/card.css'), 'utf8'),
  readFileSync(tokens('runtime/engines/rustic/skin/card.css'), 'utf8'),
];
const INTERACTION_CSS = readFileSync(tokens('presentation/components/skin/data-table-interactions.css'), 'utf8');

/** Strip comments and `@keyframes` blocks, then return every `{selector, body}` rule. */
function cssRules(css: string): Array<{ selector: string; body: string }> {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const noAtRules = noComments.replace(/@[\w-]+[^{]*\{(?:[^{}]|\{[^}]*\})*\}/g, '');
  const rules: Array<{ selector: string; body: string }> = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(noAtRules)) !== null) {
    rules.push({ selector: m[1].trim(), body: m[2].trim() });
  }
  return rules;
}

/** The specificity "b" column (classes + attributes + pseudo-classes) for one comma-free selector. */
function bColumn(selector: string): number {
  const classes = (selector.match(/\.[A-Za-z_-][\w-]*/g) || []).length;
  const attrs = (selector.match(/\[[^\]]*\]/g) || []).length;
  const pseudos = (selector.match(/(?<!:):[A-Za-z-]+/g) || []).length;
  const notArgs = (selector.match(/:not\(([^)]*)\)/g) || []).reduce((n, frag) => n + bColumn(frag.slice(5, -1)), 0);
  return classes + attrs + pseudos + notArgs;
}

/** Max b-column across the comma-separated parts of a selector list. */
function maxB(selector: string): number {
  return Math.max(...selector.split(',').map((s) => bColumn(s.trim())));
}

/** True if the declaration block sets a border COLOR (paints), not a `none`/`0` reset. */
function paintsBorder(body: string): boolean {
  const re =
    /(?:^|[\s;{])border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?(?:-color)?\s*:\s*([^;]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const value = m[1].trim().toLowerCase();
    if (value.startsWith('none') || value.startsWith('0') || value === 'unset' || value === 'inherit') continue;
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Every skin parses, and every painting border rule clears the tenant floor.
// ---------------------------------------------------------------------------

describe.each(['modern', 'rustic', 'mobile'] as const)('DataTable %s skin — structural contract', (skin) => {
  const rules = cssRules(SKINS[skin]);

  it('parses into a non-trivial set of rules (guards a broken read)', () => {
    expect(rules.length).toBeGreaterThan(5);
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
      `these border rules sit below (0,4,0) and lose their color to the tenant * floor (P-48):\n${offenders.join('\n')}`
    ).toEqual([]);
  });

  it('buys the 4th unit from data-part/data-variant/data-invalid, never role/aria-label/placeholder', () => {
    const incidental: string[] = [];
    for (const { selector, body } of rules) {
      if (!paintsBorder(body)) continue;
      if (/\[(?:role|aria-label|placeholder)\b/.test(selector)) incidental.push(selector);
    }
    expect(incidental).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Modern: the interaction paint the removed React state / imperative handlers
// used to own now lives as CSS rules keyed on the stamped contract.
// ---------------------------------------------------------------------------

describe('DataTable modern skin — engine-specific rules', () => {
  it('replaces both imperative row-hover handler pairs with ONE hover rule, gated on hoverable and not-selected', () => {
    expect(
      /\[data-part='body-row'\]\[data-hoverable='true'\]:not\(\[data-selected='true'\]\):hover/.test(SKINS.modern),
      'the modern body-row hover rule (hoverable && !selected) is missing'
    ).toBe(true);
  });

  it('carries the rest fill rules for selected and striped rows', () => {
    expect(/\[data-part='body-row'\]\[data-selected='true'\]/.test(SKINS.modern)).toBe(true);
    expect(/\[data-part='body-row'\]\[data-striped='true'\]/.test(SKINS.modern)).toBe(true);
  });

  it('keys the header-cell 3-way background on data-pinned and data-drag-over', () => {
    expect(/\[data-part='header-cell'\]\[data-pinned='true'\]/.test(SKINS.modern)).toBe(true);
    expect(/\[data-part='header-cell'\]\[data-drag-over='true'\]/.test(SKINS.modern)).toBe(true);
  });

  it('rotates the group chevron on data-collapsed and paints the current page button on data-current', () => {
    expect(
      /\[data-part='group-header-chevron'\]\[data-collapsed='true'\][^{]*\{[^}]*transform:\s*rotate\(-90deg\)/.test(
        SKINS.modern
      )
    ).toBe(true);
    expect(/\[data-part='pagination-page-button'\]\[data-current='true'\]/.test(SKINS.modern)).toBe(true);
  });

  it('carries the bulk-action per-variant rules and the sticky thead shadow', () => {
    for (const variant of ['default', 'danger', 'primary']) {
      expect(
        new RegExp(`\\[data-part='bulk-bar-action'\\]\\[data-variant='${variant}'\\]`).test(SKINS.modern),
        `missing bulk-bar-action data-variant='${variant}' rule`
      ).toBe(true);
    }
    expect(/\[data-part='table-head'\]\[data-sticky='true'\][^{]*\{[^}]*box-shadow/.test(SKINS.modern)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Rustic: zero hover paint (divergence), the data-state enum, and the verbatim
// hardcoded resize-bar rgba residual.
// ---------------------------------------------------------------------------

describe('DataTable rustic skin — engine-specific rules', () => {
  it('has ZERO :hover rules (rustic paints no hover — divergence preserved)', () => {
    const hoverRules = cssRules(SKINS.rustic).filter((r) => r.selector.includes(':hover'));
    expect(hoverRules.map((r) => r.selector)).toEqual([]);
  });

  it('keys body-row and pinned-td fill on the data-state enum (one rule set, not the 3x ternary)', () => {
    expect(/\[data-part='body-row'\]\[data-state='selected'\]/.test(SKINS.rustic)).toBe(true);
    expect(/\[data-part='body-row'\]\[data-state='striped'\]/.test(SKINS.rustic)).toBe(true);
    // the collapsed pinned-td rule is a descendant of the row's data-state
    expect(/\[data-state='selected'\]\s+\[data-part='data-cell'\]\[data-pinned='true'\]/.test(SKINS.rustic)).toBe(true);
  });

  it('transcribes the hardcoded resize-bar rgba(0, 0, 0, 0.12) verbatim (token-purity residual)', () => {
    expect(
      /\[data-part='resize-handle-bar'\][^{]*\{[^}]*background:\s*rgba\(0,\s*0,\s*0,\s*0\.12\)/.test(SKINS.rustic)
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Mobile / editor agnostic skin: the Card suppression escalates above card.css,
// the --selected modifier + state panel exist, and the editor error border sits
// on the stamped data-invalid at (0,4,0).
// ---------------------------------------------------------------------------

describe('DataTable mobile skin — suppression + editor', () => {
  it('escalates the Card suppression above card.css MAX specificity (FFP idiom)', () => {
    // MAX b-column across every card.css rule that paints a chrome channel.
    const cardMaxB = Math.max(...CARD_CSS.flatMap((css) => cssRules(css)).map((r) => maxB(r.selector)));
    expect(cardMaxB).toBeGreaterThanOrEqual(9); // guards the measurement itself

    const suppression = cssRules(SKINS.mobile).find(
      (r) => r.selector.includes('.ds-data-table__mobile-card') && !r.selector.includes('--selected')
    );
    expect(suppression, 'the mobile card suppression rule is missing').toBeDefined();
    expect(
      maxB(suppression!.selector),
      `the suppression rule (bColumn ${maxB(suppression!.selector)}) must outrank card.css MAX (${cardMaxB})`
    ).toBeGreaterThan(cardMaxB);
  });

  it('carries the --selected modifier rule and the shared mobile-state-panel rule', () => {
    expect(cssRules(SKINS.mobile).some((r) => r.selector.includes('.ds-data-table__mobile-card--selected'))).toBe(true);
    expect(/\[data-part='mobile-state-panel'\]/.test(SKINS.mobile)).toBe(true);
  });

  it('paints the editor error border on data-invalid at (0,4,0)', () => {
    const invalid = cssRules(SKINS.mobile).find(
      (r) => r.selector.includes("[data-invalid='true']") && paintsBorder(r.body)
    );
    expect(invalid, 'the editor data-invalid border rule is missing').toBeDefined();
    expect(bColumn(invalid!.selector)).toBeGreaterThanOrEqual(4);
  });
});

// ---------------------------------------------------------------------------
// The static interaction styles and keyframes have one canonical stylesheet;
// neither engine may recreate a per-instance producer.
// ---------------------------------------------------------------------------

describe('DataTable engines — embedded CSS recovery contract', () => {
  const modernSrc = engineSrc('engines/modern/index.tsx');
  const rusticSrc = engineSrc('engines/rustic/index.tsx');

  it('moves modern inline-edit/shimmer and dirty-cell rules to the canonical skin', () => {
    expect(INTERACTION_CSS).toContain('@keyframes ds-inline-edit-enter');
    expect(INTERACTION_CSS).toContain('@keyframes ds-data-table-shimmer');
    expect(INTERACTION_CSS).toContain("td[data-cell-dirty='true']::before");
    expect(INTERACTION_CSS).toContain('background: var(--ds-color-primary) !important');
    expect(modernSrc).not.toContain('<style>');
    expect(modernSrc).not.toContain('dangerouslySetInnerHTML');
  });

  it('moves rustic spin + bulk-slide-down keyframes to the same canonical skin', () => {
    expect(INTERACTION_CSS).toContain('@keyframes ds-spin');
    expect(INTERACTION_CSS).toContain('@keyframes ds-bulk-slide-down');
    expect(rusticSrc).not.toContain('<style>');
    expect(rusticSrc).not.toContain('dangerouslySetInnerHTML');
  });
});

// ---------------------------------------------------------------------------
// The DOM carries the contract, not the paint. No stamped part paints
// background/border/box-shadow/border-radius (or color, for text parts) inline.
// ---------------------------------------------------------------------------

interface Row {
  id: string;
  name: string;
  amount: number;
  status: string;
}

const ROWS: Row[] = [
  { id: 'r1', name: 'Alpha', amount: 100, status: 'active' },
  { id: 'r2', name: 'Bravo', amount: 200, status: 'inactive' },
  { id: 'r3', name: 'Charlie', amount: 300, status: 'active' },
];

const COLUMNS: ColumnDef<Row>[] = [
  {
    key: 'name',
    header: 'Name',
    accessorKey: 'name',
    sortable: true,
    pin: 'left',
  },
  { key: 'amount', header: 'Amount', accessorKey: 'amount' },
  { key: 'status', header: 'Status', accessorKey: 'status' },
];

// Parts that render in the rich desktop fixture below, per engine. Each must
// leave background/border/box-shadow/border-radius to the skin.
const NO_PAINT_PARTS: Record<'modern' | 'rustic', readonly string[]> = {
  modern: [
    'card',
    'header-cell',
    'body-row',
    'data-cell',
    'actions-cell',
    'expand-button',
    'pagination-bar',
    'pagination-nav-button',
    'pagination-page-button',
    'bulk-bar',
    'bulk-bar-action',
  ],
  rustic: [
    'root',
    'wrap',
    'header-cell',
    'body-row',
    'data-cell',
    'actions-cell',
    'expand-button',
    'pagination-bar',
    'pagination-button',
    'bulk-bar-action',
  ],
};

// Painted text parts whose deleted `color` key must not resurface inline.
const NO_COLOR_PARTS: Record<'modern' | 'rustic', readonly string[]> = {
  modern: ['header-cell', 'data-cell', 'bulk-bar-count', 'pagination-bar'],
  rustic: ['root', 'header-cell', 'pagination-bar'],
};

describe.each(['modern', 'rustic'] as const)('DataTable %s — the DOM carries the contract, not the paint', (engine) => {
  afterEach(() => cleanup());

  it('leaves background/border/box-shadow/border-radius (and color) to the skin', async () => {
    const { container } = renderWithEngine(
      <PatternDataTable<Row>
        engine={engine}
        data={ROWS}
        rowKey="id"
        columns={COLUMNS}
        striped
        selectedKeys={['r1']}
        expandedRow={(row) => <div>detail {row.id}</div>}
        actions={() => <button type="button">act</button>}
        bulkActions={[
          {
            key: 'del',
            label: 'Delete',
            variant: 'danger',
            onExecute: vi.fn(),
          },
          { key: 'flag', label: 'Flag', onExecute: vi.fn() },
        ]}
        pagination={{ current: 2, pageSize: 1, total: 3, onChange: vi.fn() }}
      />,
      engine
    );

    await waitFor(() => {
      expect(container.querySelector('[data-part="root"]')).not.toBeNull();
    });

    for (const part of NO_PAINT_PARTS[engine]) {
      const nodes = ownParts(container, part);
      expect(nodes.length, `${engine}: data-part="${part}" did not render`).toBeGreaterThan(0);
      nodes.forEach((el) => {
        expect(el.style.background, `${engine}: ${part} paints background inline`).toBe('');
        expect(el.style.backgroundColor, `${engine}: ${part} paints background-color inline`).toBe('');
        expect(el.style.border, `${engine}: ${part} paints border inline`).toBe('');
        expect(el.style.boxShadow, `${engine}: ${part} paints box-shadow inline`).toBe('');
        expect(el.style.borderRadius, `${engine}: ${part} paints border-radius inline`).toBe('');
      });
    }

    for (const part of NO_COLOR_PARTS[engine]) {
      ownParts(container, part).forEach((el) => {
        expect(el.style.color, `${engine}: ${part} paints color inline`).toBe('');
      });
    }
  });
});
