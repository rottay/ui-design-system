import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';

import { PatternFilterPanel } from '..';
import type { FilterDef } from '..';
import { renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';

// ---------------------------------------------------------------------------
// WO-ARC-09 checkpoint 3 — the filter-panel skins are real stylesheets, one per
// engine, asserted here, mirroring FieldFiltersPanel.real-engines.test.tsx.
//
// The screenshot baselines prove the shipped panel looks identical at rest and
// in the photographed focus/hover states. They cannot prove the STRUCTURAL
// contract the migration created: that the paint lives in the two unlayered
// engine skins (not inline), that every painting border rule clears the P-48
// tenant `*` floor at (0,3,1) — i.e. reaches (0,4,0) — that the interaction
// paint the imperative handlers used to own now lives as `:focus`/`:hover`
// rules, and that the DOM carries the data-part contract with no inline paint
// left behind on any stamped part.
// ---------------------------------------------------------------------------

const here = dirname(fileURLToPath(import.meta.url));
const SKINS: Record<'modern' | 'rustic', string> = {
  modern: readFileSync(
    join(here, '../../../../../tokens/css/engines/modern/skin/filter-panel.css'),
    'utf8',
  ),
  rustic: readFileSync(
    join(here, '../../../../../tokens/css/engines/rustic/skin/filter-panel.css'),
    'utf8',
  ),
};

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
    0,
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

describe.each(['modern', 'rustic'] as const)(
  'FilterPanel %s skin — structural contract',
  (engine) => {
    const rules = cssRules(SKINS[engine]);

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
        `these painting-border rules sit below (0,4,0) and lose their color to the tenant * floor (P-48):\n${offenders.join('\n')}`,
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
        `painting border specificity must not depend on an incidental attribute a refactor could move:\n${incidental.join('\n')}`,
      ).toEqual([]);
    });

    it('carries the reset-button hover rule the imperative handler pair used to own', () => {
      expect(
        /\[data-part='reset-button'\][^{]*:hover/.test(SKINS[engine]),
        'the reset-button :hover rule (replacing onMouseEnter/onMouseLeave) is missing',
      ).toBe(true);
    });
  },
);

describe('FilterPanel modern skin — engine-specific interaction rules', () => {
  it('replaces the imperative input focus handlers with a [data-part=input]:focus rule', () => {
    expect(
      /\[data-part='input'\][^{]*:focus/.test(SKINS.modern),
      'the modern input :focus rule (replacing the shared focus/blur handlers) is missing',
    ).toBe(true);
  });
});

describe('FilterPanel rustic skin — engine-specific interaction rules', () => {
  const rules = cssRules(SKINS.rustic);

  it('replaces the imperative chip hover with a [data-part=filter-chip]:hover transform rule', () => {
    const hover = rules.filter(
      ({ selector }) => /\[data-part='filter-chip'\][^{]*:hover/.test(selector),
    );
    expect(hover.length, 'the rustic filter-chip :hover rule is missing').toBeGreaterThan(0);
    expect(
      hover.every(({ body }) => /(?:^|[\s;{])transform\s*:/.test(body)),
      'the rustic filter-chip :hover rule must declare transform',
    ).toBe(true);
  });

  it('carries the native-select chevron as a [data-part=select] background-image rule', () => {
    const selectBg = rules.filter(
      ({ selector, body }) =>
        selector.includes("[data-part='select']") &&
        /(?:^|[\s;{])background-image\s*:/.test(body),
    );
    expect(
      selectBg.length,
      'the rustic select background-image (chevron data-URI) rule is missing',
    ).toBeGreaterThan(0);
  });
});

const FILTERS: FilterDef[] = [
  { key: 'query', label: 'Query', type: 'text', placeholder: 'Search owner' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'All statuses',
    // One option per inferOptionTone branch (modern-only option-icon-badge coverage).
    options: [
      { value: 'rejected', label: 'Rejected candidate' }, // danger
      { value: 'needs-review', label: 'Needs review' }, // warning
      { value: 'completed', label: 'Completed' }, // success
      { value: 'scheduled', label: 'Scheduled' }, // primary
      { value: 'remote', label: 'Remote' }, // info
      { value: 'other', label: 'Other' }, // neutral
    ],
  },
  {
    key: 'tags',
    label: 'Tags',
    type: 'multi-select',
    options: [
      { value: 'vip', label: 'VIP' },
      { value: 'indoor', label: 'Indoor' },
    ],
  },
  { key: 'enabled', label: 'Enabled', type: 'boolean' },
  { key: 'window', label: 'Window', type: 'date-range' },
  { key: 'capacity', label: 'Capacity', type: 'number-range' },
];

const VALUES: Record<string, unknown> = {
  query: 'ada',
  status: 'scheduled',
  tags: ['vip'],
  enabled: true,
  window: ['2026-01-01', '2026-02-01'],
  capacity: [10, 50],
};

// Stamped parts that must leave background/border/box-shadow/border-radius to
// the skin, per engine. Every filter-panel part is a native element (no DS Text),
// so `color` moved to the skin for every painted part too.
const NO_PAINT_PARTS: Record<'modern' | 'rustic', readonly string[]> = {
  modern: [
    'root',
    'collapse-toggle',
    'title',
    'active-count-badge',
    'reset-button',
    'field-label',
    'input',
    'range-separator',
    'apply-button',
  ],
  rustic: [
    'root',
    'collapse-toggle',
    'title',
    'active-count-badge',
    'reset-button',
    'field-label',
    'input',
    'range-separator',
    'apply-button',
    'select',
    'filter-chip',
  ],
};

// Painted parts whose deleted `color` key must not resurface inline. `root` has
// no color of its own, so it is excluded.
const NO_COLOR_PARTS: Record<'modern' | 'rustic', readonly string[]> = {
  modern: NO_PAINT_PARTS.modern.filter((p) => p !== 'root'),
  rustic: NO_PAINT_PARTS.rustic.filter((p) => p !== 'root'),
};

describe.each(['modern', 'rustic'] as const)(
  'FilterPanel %s — the DOM carries the contract, not the paint',
  (engine) => {
    it('leaves background/border/box-shadow/border-radius (and color) to the skin', async () => {
      const { container } = renderWithEngine(
        <PatternFilterPanel
          engine={engine}
          filters={FILTERS}
          values={VALUES}
          onChange={vi.fn()}
          onApply={vi.fn()}
          onReset={vi.fn()}
          layout="inline"
          collapsible
          title="Filters"
          activeCount={6}
          showApply
          showReset
        />,
        engine,
      );

      expect(await screen.findByText('Filters')).toBeInTheDocument();

      for (const part of NO_PAINT_PARTS[engine]) {
        const nodes = container.querySelectorAll<HTMLElement>(`[data-part="${part}"]`);
        expect(nodes.length, `${engine}: data-part="${part}" did not render`).toBeGreaterThan(0);
        nodes.forEach((el) => {
          expect(el.style.background, `${engine}: ${part} paints background inline`).toBe('');
          expect(el.style.backgroundImage, `${engine}: ${part} paints background-image inline`).toBe('');
          expect(el.style.border, `${engine}: ${part} paints border inline`).toBe('');
          expect(el.style.boxShadow, `${engine}: ${part} paints box-shadow inline`).toBe('');
          expect(el.style.borderRadius, `${engine}: ${part} paints border-radius inline`).toBe('');
        });
      }

      for (const part of NO_COLOR_PARTS[engine]) {
        const nodes = container.querySelectorAll<HTMLElement>(`[data-part="${part}"]`);
        nodes.forEach((el) => {
          expect(el.style.color, `${engine}: ${part} paints color inline`).toBe('');
        });
      }

      // The modern collapse-toggle rotate is a state transform that moved to the
      // skin (`[data-part='collapse-toggle'][data-collapsed]`); no inline transform.
      if (engine === 'modern') {
        const toggle = container.querySelector<HTMLElement>('[data-part="collapse-toggle"]');
        expect(toggle?.style.transform, 'modern: collapse-toggle paints transform inline').toBe('');
      }
    });
  },
);

describe('FilterPanel modern — option-icon-badge leaves its per-tone paint to the skin', () => {
  it('the dropdown swatch carries no inline background/border/color/border-radius', async () => {
    renderWithEngine(
      <PatternFilterPanel engine="modern" filters={FILTERS} values={VALUES} onChange={vi.fn()} />,
      'modern',
    );

    expect(await screen.findByText('Status')).toBeInTheDocument();

    const combobox = document.querySelector('[role="combobox"]');
    if (!(combobox instanceof HTMLElement)) {
      throw new Error('Expected the modern Select combobox trigger to render');
    }
    fireEvent.click(combobox);

    await waitFor(() => {
      expect(document.querySelectorAll('[data-part="option-icon-badge"]').length).toBeGreaterThan(0);
    });

    document.querySelectorAll<HTMLElement>('[data-part="option-icon-badge"]').forEach((el) => {
      expect(el.style.background, 'option-icon-badge paints background inline').toBe('');
      expect(el.style.border, 'option-icon-badge paints border inline').toBe('');
      expect(el.style.color, 'option-icon-badge paints color inline').toBe('');
      expect(el.style.borderRadius, 'option-icon-badge paints border-radius inline').toBe('');
    });
  });
});
