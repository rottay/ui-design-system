import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';

import { SelectionPreviewRail } from '..';
import type { SelectionPreviewRailColumn } from '..';
import { renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';

// ---------------------------------------------------------------------------
// WO-ARC-09 checkpoint 4 — the selection-preview-rail skin is a real stylesheet,
// asserted here, mirroring FieldFiltersPanel.real-engines.test.tsx.
//
// The screenshot pins prove the shipped rail looks identical. They cannot prove
// the STRUCTURAL contract the migration created: that the paint lives in the
// unlayered skin (not inline), that every painting border rule clears the P-48
// tenant `*` floor at (0,3,1) — i.e. reaches (0,4,0) — that the customPreview
// close-button suppression outranks the engine button skin's ghost hover rule at
// (0,5,0), that the two data-preview roots stay distinct (their card tints
// differ), and that the DOM carries the data-part contract with no inline paint
// left behind on any Box/svg part (Text parts keep engine-inline color via the
// `color` PROP, by design, so their color is NOT asserted here).
// ---------------------------------------------------------------------------

const SKIN = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../../tokens/css/components/skin/selection-preview-rail.css'
  ),
  'utf8'
);

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
 * (comma-free) selector. The skin carries no id and no inline style, so this column
 * is what a rule must push to >= 4 to clear the (0,3,1) tenant border floor.
 */
function bColumn(selector: string): number {
  const classes = (selector.match(/\.[A-Za-z_-][\w-]*/g) || []).length;
  const attrs = (selector.match(/\[[^\]]*\]/g) || []).length;
  const pseudos = (selector.match(/(?<!:):[A-Za-z-]+/g) || []).length;
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

describe('SelectionPreviewRail skin — structural contract', () => {
  const rules = cssRules(SKIN);

  it('parses into a non-trivial set of rules (guards against a broken read)', () => {
    expect(rules.length).toBeGreaterThan(8);
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

  it('buys the 4th unit from data-part/data-preview, never role/aria-label/placeholder', () => {
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

  it('carries the close-button suppression rule outranking the ghost hover (0,5,0) button rule', () => {
    const suppression = rules.filter(
      ({ selector }) => selector.includes('.ds-selection-preview-rail__close') && bColumn(selector) >= 6
    );
    expect(
      suppression.length,
      'the close-button suppression rule (>= (0,6,0), self-selecting via the repeated close class) is missing'
    ).toBeGreaterThan(0);
    for (const { body } of suppression) {
      expect(/(?:^|[\s;{])background\s*:/.test(body), 'suppression must declare background').toBe(true);
      expect(/(?:^|[\s;{])backdrop-filter\s*:/.test(body), 'suppression must declare backdrop-filter').toBe(
        true
      );
    }
  });

  it('keys the two data-preview roots as distinct, never-merged rules', () => {
    const customRoot = rules.filter(
      ({ selector }) => selector.includes("[data-preview='custom']") && selector.includes("[data-part='root']")
    );
    const defaultRoot = rules.filter(
      ({ selector }) => selector.includes("[data-preview='default']") && selector.includes("[data-part='root']")
    );
    expect(customRoot.length, "the [data-preview='custom'] root rule is missing").toBeGreaterThan(0);
    expect(defaultRoot.length, "the [data-preview='default'] root rule is missing").toBeGreaterThan(0);
    // Their card treatments differ; the two roots must never collapse to one rule.
    expect(customRoot[0].selector).not.toBe(defaultRoot[0].selector);
    expect(customRoot[0].body).not.toBe(defaultRoot[0].body);
  });
});

interface RailFixtureRow {
  id: string;
  fullName: string;
  email: string;
  statusLabel: string;
  role: string;
  active: boolean;
  notes: string | null;
}

const FULL_ITEM: RailFixtureRow = {
  id: 'row-1',
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  statusLabel: 'Active',
  role: 'Engineer',
  active: true,
  notes: null,
};

const FULL_COLUMNS: SelectionPreviewRailColumn<RailFixtureRow>[] = [
  { key: 'role', title: 'Role', dataIndex: 'role' },
  { key: 'active', title: 'Active', dataIndex: 'active' },
  { key: 'notes', title: 'Notes', dataIndex: 'notes' },
];

// Box/svg parts whose background/border/box-shadow/border-radius moved to the
// skin. Text parts are excluded: they keep engine-inline color via the color
// PROP, which is by design and would show up as inline paint.
const DEFAULT_NO_PAINT_PARTS = [
  'root',
  'identity-card',
  'identity-card-accent',
  'match-reason-panel',
  'snapshot-card',
  'snapshot-header',
  'snapshot-row',
] as const;

const CUSTOM_NO_PAINT_PARTS = ['root', 'custom-sticky-card'] as const;

const PAINT_CHANNELS = [
  'background',
  'border',
  'borderTop',
  'borderBottom',
  'borderLeft',
  'borderRadius',
  'boxShadow',
] as const;

/**
 * The rail's OWN scope. `data-part` is a shared vocabulary, not an identifier:
 * the rail composes Badges, and every migrated primitive stamps `data-part` of
 * its own, so a bare `[data-part="x"]` query inside this container also matches
 * the parts of the components the rail is BUILT FROM — which paint inline
 * legitimately until their own batch migrates them. Every query below is
 * therefore anchored to `.ds-selection-preview-rail`'s direct ownership.
 */
const RAIL = '.ds-selection-preview-rail';

/** Elements the RAIL itself stamps -- not those of any component it composes. */
function railParts(container: HTMLElement, part: string): HTMLElement[] {
  const root = container.querySelector<HTMLElement>(RAIL);
  if (!root) return [];
  const owned = [...root.querySelectorAll<HTMLElement>(`[data-part="${part}"]`)].filter((el) => {
    // A composed component (the rail renders Badges) stamps its OWN root, so any
    // descendant root belongs to that component, not to the rail...
    if (el.getAttribute('data-part') === 'root') return false;
    // ...and so does any part sitting underneath one.
    for (let p = el.parentElement; p && p !== root; p = p.parentElement) {
      if (p.getAttribute('data-part') === 'root') return false;
    }
    return true;
  });
  if (root.matches(`[data-part="${part}"]`)) owned.unshift(root);
  return owned;
}

async function waitForRoot(container: HTMLElement): Promise<void> {
  await waitFor(() => {
    expect(container.querySelector(`${RAIL}[data-part="root"]`)).not.toBeNull();
  });
}

function expectNoInlinePaint(el: HTMLElement, part: string): void {
  for (const channel of PAINT_CHANNELS) {
    expect(el.style[channel], `${part} paints ${channel} inline`).toBe('');
  }
}

describe.each(['modern', 'rustic'] as const)(
  'SelectionPreviewRail %s — the DOM carries the contract, not the paint',
  (engine) => {
    it('leaves the default-branch Box/svg parts to the skin', async () => {
      const { container } = renderWithEngine(
        <SelectionPreviewRail
          item={FULL_ITEM}
          itemKey={FULL_ITEM.id}
          itemIndex={0}
          columns={FULL_COLUMNS}
          onClose={() => undefined}
          getMatchReason={() => 'Matched because status is Active'}
          mode="selection"
        />,
        engine
      );

      await waitForRoot(container);

      for (const part of DEFAULT_NO_PAINT_PARTS) {
        const nodes = railParts(container, part);
        expect(nodes.length, `data-part="${part}" did not render`).toBeGreaterThan(0);
        nodes.forEach((el) => expectNoInlinePaint(el, part));
      }

      // The intrinsic icon wrapper owns skin color and the nested glyph inherits
      // currentColor, so no inline color survives on the stamped node.
      const icons = container.querySelectorAll<HTMLElement>('[data-part="match-reason-icon"]');
      expect(icons.length, 'match-reason-icon did not render').toBeGreaterThan(0);
      icons.forEach((el) => expect(el.style.color, 'match-reason-icon paints color inline').toBe(''));
    });

    it('leaves the customPreview-branch parts and the ghost close button to the skin', async () => {
      const { container } = renderWithEngine(
        <SelectionPreviewRail
          item={FULL_ITEM}
          itemKey={FULL_ITEM.id}
          itemIndex={0}
          columns={FULL_COLUMNS}
          onClose={() => undefined}
          mode="selection"
          preview={{ render: () => <span data-testid="custom-content">Custom preview content</span> }}
        />,
        engine
      );

      await waitForRoot(container);

      for (const part of CUSTOM_NO_PAINT_PARTS) {
        const nodes = container.querySelectorAll<HTMLElement>(`[data-part="${part}"]`);
        expect(nodes.length, `data-part="${part}" did not render`).toBeGreaterThan(0);
        nodes.forEach((el) => expectNoInlinePaint(el, part));
      }

      let closeButtons: NodeListOf<HTMLElement> = container.querySelectorAll('.ds-selection-preview-rail__close');
      await waitFor(() => {
        closeButtons = container.querySelectorAll('.ds-selection-preview-rail__close');
        expect(closeButtons).toHaveLength(1);
      });
      const close = closeButtons[0];
      expect(close.style.background, 'close button paints background inline').toBe('');
      expect(close.style.backdropFilter, 'close button paints backdrop-filter inline').toBe('');
    });
  }
);
