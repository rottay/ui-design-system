import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { FieldFiltersPanel } from '..';
import type { FieldFilterDefinition, FieldFilterPreset, FieldFilterVisual } from '..';
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
// WO-ARC-09 checkpoint 2 — the field-filters-panel skin is a real stylesheet,
// asserted here, mirroring Table.real-engines.test.tsx.
//
// The screenshot + focus-suppression pins prove the shipped panel looks
// identical. They cannot prove the STRUCTURAL contract the migration created:
// that the paint lives in the unlayered skin (not inline), that every painting
// border rule clears the P-48 tenant `*` floor at (0,3,1) — i.e. reaches
// specificity (0,4,0) — that the rustic-input suppression rule outranks the
// engine's own (0,6,0) focused rules, and that the DOM carries the data-part
// contract with no inline paint left behind on any part.
// ---------------------------------------------------------------------------

const SKIN = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../../foundation/tokens/css/presentation/components/skin/field-filters-panel.css'
  ),
  'utf8'
);

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
 * (comma-free) selector. The skin carries no id and no inline style, so this column
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

describe('FieldFiltersPanel skin — structural contract', () => {
  const rules = cssRules(SKIN);

  it('parses into a non-trivial set of rules (guards against a broken read)', () => {
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
      `these painting-border rules sit below (0,4,0) and lose their color to the tenant * floor (P-48):\n${offenders.join('\n')}`
    ).toEqual([]);
  });

  it('buys the 4th unit from data-part, never role/aria-label/placeholder', () => {
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

  it('carries the rustic-input suppression rule outranking the focused (0,6,0) input rules', () => {
    const suppression = rules.filter(
      ({ selector }) =>
        selector.includes('.ds-field-filters-panel__control') &&
        selector.includes("[data-part='root']") &&
        bColumn(selector) >= 7
    );
    expect(
      suppression.length,
      'the rustic-input suppression rule (>= (0,7,0), self-selecting via [data-part=root]) is missing'
    ).toBeGreaterThan(0);
    for (const { body } of suppression) {
      expect(/(?:^|[\s;{])border\s*:/.test(body), 'suppression must declare border').toBe(true);
      expect(/(?:^|[\s;{])background\s*:/.test(body), 'suppression must declare background').toBe(true);
      expect(/(?:^|[\s;{])box-shadow\s*:/.test(body), 'suppression must declare box-shadow').toBe(true);
      expect(/(?:^|[\s;{])border-radius\s*:/.test(body), 'suppression must declare border-radius').toBe(
        true
      );
    }
  });
});

const FILTERS: FieldFilterDefinition[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'All statuses',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
      { value: 'archived', label: 'Archived' },
      { value: 'draft', label: 'Draft' },
      { value: 'review', label: 'In review' },
      { value: 'expired', label: 'Expired' },
    ],
  },
  {
    key: 'region',
    label: 'Region',
    type: 'enum',
    placeholder: 'All regions',
    options: [
      { value: 'emea', label: 'EMEA' },
      { value: 'amer', label: 'AMER' },
      { value: 'apac', label: 'APAC' },
    ],
  },
  {
    key: 'joinedAt',
    label: 'Joined',
    type: 'date-range',
    placeholder: 'Any time',
    options: [
      { value: '7d', label: 'Last 7 days' },
      { value: '30d', label: 'Last 30 days' },
    ],
  },
  {
    key: 'owner',
    label: 'Owner',
    type: 'multi-select',
    placeholder: 'Search owner',
  },
];

const PRESETS: FieldFilterPreset[] = [
  { key: 'active-emea', label: 'Active in EMEA', values: { status: 'active', region: 'emea' } },
  { key: 'new-joins', label: 'New joins', values: { joinedAt: '30d', status: 'active' } },
];

const VALUES: Record<string, string> = { status: 'active', region: '', joinedAt: '', owner: '' };

const VISUALS: Record<string, FieldFilterVisual> = {
  status: { icon: <span data-testid="status-icon" />, description: 'Filter by lifecycle status.' },
};

// Parts that must leave background/border/box-shadow/border-radius to the skin.
const NO_PAINT_PARTS = [
  'root',
  'title-pill',
  'presets-pill',
  'signal',
  'preset-chip',
  'preset-chip-icon',
  'filter-card',
  'filter-card-icon',
] as const;

// Box-based parts whose deleted `color` key must not resurface inline (Text parts
// keep engine-inline color via the color PROP — by design, not asserted here).
const NO_COLOR_PARTS = ['signal', 'preset-chip', 'preset-chip-icon', 'filter-card-icon'] as const;

describe.each(['modern', 'rustic'] as const)(
  'FieldFiltersPanel %s — the DOM carries the contract, not the paint',
  (engine) => {
    it('leaves background/border/box-shadow/border-radius (and Box color) to the skin', async () => {
      const { container } = renderWithEngine(
        <FieldFiltersPanel
          filters={FILTERS}
          presets={PRESETS}
          values={VALUES}
          onChange={() => undefined}
          filterVisuals={VISUALS}
        />,
        engine
      );

      expect(await screen.findByText('Advanced filters')).toBeTruthy();

      for (const part of NO_PAINT_PARTS) {
        const nodes = ownParts(container, part);
        expect(nodes.length, `data-part="${part}" did not render`).toBeGreaterThan(0);
        nodes.forEach((el) => {
          expect(el.style.background, `${part} paints background inline`).toBe('');
          expect(el.style.border, `${part} paints border inline`).toBe('');
          expect(el.style.boxShadow, `${part} paints box-shadow inline`).toBe('');
          expect(el.style.borderRadius, `${part} paints border-radius inline`).toBe('');
        });
      }

      for (const part of NO_COLOR_PARTS) {
        const nodes = ownParts(container, part);
        nodes.forEach((el) => {
          expect(el.style.color, `${part} (Box) paints color inline`).toBe('');
        });
      }
    });
  }
);
