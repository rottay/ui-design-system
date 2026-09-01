import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { LedgerEntry } from '../contracts';
import ModernOperationalLedger from '../engines/modern';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/operational-ledger/index.css',
  ),
  'utf8',
);

const ENTRIES: LedgerEntry[] = [
  {
    id: '1',
    timestamp: '2026-03-18T10:00:00.000Z',
    description: 'Stock received',
    quantity: 50,
    type: 'credit',
    actor: 'Warehouse Bot',
    reason: 'PO-1234',
    reference: 'REF-9',
  },
];

const realMatchMedia = window.matchMedia;

/** Forces the viewport-range hooks into their narrow answer. */
function forceNarrowViewport(): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string): MediaQueryList =>
      ({
        matches: query.includes('width'),
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }) as MediaQueryList,
  });
}

afterEach(() => {
  Object.defineProperty(window, 'matchMedia', { writable: true, value: realMatchMedia });
});

describe('Modern OperationalLedger — narrow posture keeps every field', () => {
  it('stacks actor, reason and reference instead of dropping them', () => {
    const { container } = render(<ModernOperationalLedger entries={ENTRIES} />);

    // Before: the narrow container query set `display: none` on the actor,
    // reason and reference columns — the content was DELETED from the render,
    // not deprioritised, so a phone user never saw who did what or why.
    const detail = container.querySelector('[data-part="entry-detail"]');
    expect(detail).not.toBeNull();
    expect(detail?.textContent).toContain('Warehouse Bot');
    expect(detail?.textContent).toContain('PO-1234');
    expect(detail?.textContent).toContain('REF-9');

    // Each folded field keeps a visible label, so the value is never orphaned.
    const labels = Array.from(
      container.querySelectorAll('[data-part="detail-label"]'),
    ).map((node) => node.textContent);
    expect(labels).toEqual(['Actor', 'Reason', 'Reference']);
  });

  it('never re-arms the container-query hide: no cell stamps data-priority', () => {
    const { container } = render(<ModernOperationalLedger entries={ENTRIES} />);

    expect(container.querySelectorAll('[data-part="header-cell"]')).toHaveLength(6);
    expect(container.querySelectorAll('[data-priority]')).toHaveLength(0);
    expect(container.querySelector('[data-part="cell-actor"]')?.textContent).toBe(
      'Warehouse Bot',
    );
  });
});

describe('Modern OperationalLedger — the fold is container-driven, not viewport-driven', () => {
  it('renders both postures under a narrow viewport so the container can choose', () => {
    // The fold used to run off `useBreakpoints().isMobile`, so a NARROW
    // viewport deleted the three columns outright (3 header cells) and a
    // narrow ledger inside a WIDE viewport never folded at all. Both postures
    // now ship; `display: none` keeps exactly one in the a11y tree.
    forceNarrowViewport();
    const { container } = render(<ModernOperationalLedger entries={ENTRIES} />);

    expect(container.querySelectorAll('[data-part="header-cell"]')).toHaveLength(6);
    expect(container.querySelector('[data-part="cell"][data-column="actor"]')).not.toBeNull();
    expect(container.querySelector('[data-part="entry-detail"]')).not.toBeNull();
  });

  it('drops the dormant data-priority rule and folds by column instead', () => {
    // Nothing has stamped `data-priority` since the stack landed, so the rule
    // could never fire — a dormant rung, now deleted.
    expect(SKIN).not.toContain('data-priority');

    const fold = SKIN.slice(SKIN.indexOf('@container ds-operational-ledger'));
    for (const column of ['actor', 'reason', 'reference']) {
      expect(fold).toContain(`[data-part='cell'][data-column='${column}']`);
      expect(fold).toContain(`[data-part='header-cell'][data-column='${column}']`);
    }
  });

  it('paints the folded stack instead of leaving it on UA-default blocks', () => {
    // The stack rendered content-correct but entirely unstyled: none of its
    // three parts had a single declaration in the skin.
    for (const part of ['entry-detail', 'detail-item', 'detail-label']) {
      expect(SKIN).toContain(`[data-part='${part}']`);
    }
    // Hidden in the wide posture, revealed by the container query.
    expect(SKIN).toMatch(/\[data-part='entry-detail'\] \{\n {2}display: none;/);
  });
});
