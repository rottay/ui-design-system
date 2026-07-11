import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';

import { PatternDetailPanel } from '..';
import type { DetailPanelProps } from '..';
import { renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';

// ---------------------------------------------------------------------------
// WO-ARC-09 checkpoint 5 — the detail-panel skins are real stylesheets, one per
// engine, asserted here, mirroring FilterPanel.real-engines.test.tsx.
//
// The screenshot baselines prove the shipped panel looks identical at rest and
// in the photographed hover/focus states. They cannot prove the STRUCTURAL
// contract the migration created: that the paint lives in the two unlayered
// engine skins (not inline), that every painting border rule clears the P-48
// tenant `*` floor at (0,3,1) — i.e. reaches (0,4,0) — that the interaction
// paint the removed React state / imperative handlers used to own now lives as
// `:hover`/`:focus` rules, and that the DOM carries the data-part contract with
// no inline paint left behind except the rustic status custom-property hatch.
// ---------------------------------------------------------------------------

const here = dirname(fileURLToPath(import.meta.url));
const SKINS: Record<'modern' | 'rustic', string> = {
  modern: readFileSync(
    join(here, '../../../../../tokens/css/engines/modern/skin/detail-panel.css'),
    'utf8',
  ),
  rustic: readFileSync(
    join(here, '../../../../../tokens/css/engines/rustic/skin/detail-panel.css'),
    'utf8',
  ),
};

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

/**
 * The specificity "b" column (classes + attributes + pseudo-classes) for a single
 * (comma-free) selector — what a rule must push to >= 4 to clear the (0,3,1) tenant
 * border floor.
 */
function bColumn(selector: string): number {
  const classes = (selector.match(/\.[A-Za-z_-][\w-]*/g) || []).length;
  const attrs = (selector.match(/\[[^\]]*\]/g) || []).length;
  const pseudos = (selector.match(/(?<!:):[A-Za-z-]+/g) || []).length;
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
  'DetailPanel %s skin — structural contract',
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

    it('buys the 4th unit from data-part/data-variant, never role/aria-label/placeholder', () => {
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
  },
);

describe('DetailPanel modern skin — engine-specific interaction rules', () => {
  it('carries the action-button primary :hover rule the React state merge used to own', () => {
    expect(
      /\[data-part='action-button'\]\[data-variant='primary'\][^{]*:hover/.test(SKINS.modern),
      'the modern action-button primary :hover rule is missing',
    ).toBe(true);
  });

  it('gates the tab-button hover on :not([data-active]) (the !isActive gate)', () => {
    expect(
      /\[data-part='tab-button'\][^{]*:hover[^{]*:not\(\[data-active='true'\]\)/.test(SKINS.modern),
      'the modern tab-button hover must exclude the active tab',
    ).toBe(true);
  });

  it('replaces the imperative breadcrumb-link hover with a [data-part=breadcrumb-link]:hover rule', () => {
    expect(
      /\[data-part='breadcrumb-link'\][^{]*:hover/.test(SKINS.modern),
      'the modern breadcrumb-link :hover rule is missing',
    ).toBe(true);
  });
});

describe('DetailPanel rustic skin — engine-specific interaction rules', () => {
  it('tints hover ONLY for the ghost and default variants (never a blanket :hover)', () => {
    expect(
      /\[data-variant='ghost'\]:hover/.test(SKINS.rustic),
      'the rustic ghost hover guard is missing',
    ).toBe(true);
    expect(
      /\[data-variant='default'\]:hover/.test(SKINS.rustic),
      'the rustic default hover guard is missing',
    ).toBe(true);
    expect(
      /\[data-variant='primary'\]:hover/.test(SKINS.rustic),
      'primary must NOT get a hover tint (divergence preserved)',
    ).toBe(false);
    expect(
      /\[data-variant='danger'\]:hover/.test(SKINS.rustic),
      'danger must NOT get a hover tint (divergence preserved)',
    ).toBe(false);
  });

  it('carries one unconditional (all-variant) :focus double-ring rule', () => {
    expect(
      /\[data-part='action-button'\]:focus\b/.test(SKINS.rustic),
      'the rustic action-button :focus ring rule (unconditional) is missing',
    ).toBe(true);
  });

  it('renames its local pulse to ds-detail-panel-pulse and does not redefine the global @keyframes pulse', () => {
    expect(
      /@keyframes\s+ds-detail-panel-pulse\b/.test(SKINS.rustic),
      'the renamed ds-detail-panel-pulse keyframes are missing',
    ).toBe(true);
    expect(
      /@keyframes\s+pulse\b/.test(SKINS.rustic),
      'the rustic skin must NOT redefine the globally-loaded @keyframes pulse',
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// The DOM carries the data-part contract, not the paint.
// ---------------------------------------------------------------------------

type Customer = { id: string };

function createProps(): DetailPanelProps<Customer> {
  return {
    data: { id: 'customer-1' },
    title: 'Acme Corp',
    subtitle: 'Enterprise customer',
    avatar: <div>AV</div>,
    status: { label: 'On Leave', color: '#f59e0b' },
    breadcrumbs: [
      { label: 'Customers', href: '/customers', onClick: vi.fn() },
      { label: 'Acme Corp' },
    ],
    tabs: [
      { key: 'overview', label: 'Overview', content: <div>Overview tab</div>, badge: 3 },
      { key: 'billing', label: 'Billing', content: <div>Billing tab</div> },
      { key: 'history', label: 'History', content: <div>History</div>, disabled: true, badge: 'New' },
    ],
    actions: [
      { key: 'edit', label: 'Edit', variant: 'primary', onClick: vi.fn() },
      { key: 'archive', label: 'Archive', variant: 'danger', onClick: vi.fn(), loading: true },
      { key: 'more', label: 'More', variant: 'ghost', onClick: vi.fn(), disabled: true },
      { key: 'default-action', label: 'Default', onClick: vi.fn() },
    ],
    onTabChange: vi.fn(),
    onBack: vi.fn(),
    sidebar: <div>Sidebar content</div>,
    footer: <div>Footer content</div>,
  };
}

// Stamped parts that must leave background/border/box-shadow/border-radius to
// the skin, per engine.
const NO_PAINT_PARTS: Record<'modern' | 'rustic', readonly string[]> = {
  modern: [
    'root',
    'action-button',
    'action-spinner',
    'back-button',
    'tab-button',
    'tab-badge',
    'status-badge',
    'tab-list',
    'sidebar',
    'footer',
  ],
  rustic: [
    'root',
    'breadcrumb-link',
    'back-button',
    'status-badge',
    'action-button',
    'sidebar',
    'tab-list',
    'tab-button',
    'tab-badge',
    'footer',
  ],
};

// Painted parts whose deleted `color` key must not resurface inline (root excluded:
// its color, where it has one, cascades from a rule, not from an inline literal).
const NO_COLOR_PARTS: Record<'modern' | 'rustic', readonly string[]> = {
  modern: [
    'action-button',
    'back-button',
    'tab-button',
    'tab-badge',
    'status-badge',
    'subtitle',
    'title',
    'breadcrumb-separator',
    'breadcrumb-link',
    'breadcrumb-current',
  ],
  rustic: [
    'breadcrumbs',
    'breadcrumb-separator',
    'breadcrumb-link',
    'back-button',
    'subtitle',
    'action-button',
    'tab-button',
    'tab-badge',
  ],
};

describe.each(['modern', 'rustic'] as const)(
  'DetailPanel %s — the DOM carries the contract, not the paint',
  (engine) => {
    it('leaves background/border/box-shadow/border-radius (and color) to the skin', async () => {
      const { container } = renderWithEngine(
        <PatternDetailPanel engine={engine} {...createProps()} />,
        engine,
      );

      await waitFor(() => {
        expect(container.querySelector('[data-part="root"]')).not.toBeNull();
      });

      for (const part of NO_PAINT_PARTS[engine]) {
        const nodes = container.querySelectorAll<HTMLElement>(`[data-part="${part}"]`);
        expect(nodes.length, `${engine}: data-part="${part}" did not render`).toBeGreaterThan(0);
        nodes.forEach((el) => {
          expect(el.style.background, `${engine}: ${part} paints background inline`).toBe('');
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
    });
  },
);

describe('DetailPanel rustic — the status badge is the only inline paint hatch', () => {
  it('carries ONLY the two status custom-property keys (no background/color literal)', async () => {
    const { container } = renderWithEngine(
      <PatternDetailPanel
        engine="rustic"
        data={{ id: 'c' }}
        title="Acme"
        status={{ label: 'On Leave', color: '#f59e0b' }}
      />,
      'rustic',
    );

    await waitFor(() => {
      expect(container.querySelector('[data-part="status-badge"]')).not.toBeNull();
    });

    const badge = container.querySelector<HTMLElement>('[data-part="status-badge"]')!;
    const names: string[] = [];
    for (let i = 0; i < badge.style.length; i += 1) names.push(badge.style[i]);

    expect(names.sort()).toEqual([
      '--ds-detail-panel-status-bg',
      '--ds-detail-panel-status-fg',
    ]);
    expect(badge.style.getPropertyValue('--ds-detail-panel-status-bg')).toBe('#f59e0b');
    expect(badge.style.background, 'the badge must not carry a background literal inline').toBe('');
    expect(badge.style.color, 'the badge must not carry a color literal inline').toBe('');
  });

  it('stamps no status custom-property when status.color is absent', async () => {
    const { container } = renderWithEngine(
      <PatternDetailPanel engine="rustic" data={{ id: 'c' }} title="Acme" status={{ label: 'Draft' }} />,
      'rustic',
    );

    await waitFor(() => {
      expect(container.querySelector('[data-part="status-badge"]')).not.toBeNull();
    });

    const badge = container.querySelector<HTMLElement>('[data-part="status-badge"]')!;
    expect(badge.style.length, 'no-color badge must carry no inline style keys').toBe(0);
    expect(badge.style.getPropertyValue('--ds-detail-panel-status-bg')).toBe('');
  });
});
