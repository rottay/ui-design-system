import React from 'react';
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { LedgerEntry } from '../contracts';
import ModernOperationalLedger from '../engines/modern';

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
    forceNarrowViewport();
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

    // The header drops to the three retained columns rather than keeping
    // headers whose cells no longer exist.
    expect(container.querySelectorAll('[data-part="header-cell"]')).toHaveLength(3);
  });

  it('never re-arms the container-query hide: no cell stamps data-priority', () => {
    const { container } = render(<ModernOperationalLedger entries={ENTRIES} />);

    // The wide posture keeps all six columns and stamps nothing the skin's
    // `[data-priority='low'] { display: none }` block can hide.
    expect(container.querySelectorAll('[data-part="header-cell"]')).toHaveLength(6);
    expect(container.querySelectorAll('[data-priority]')).toHaveLength(0);
    expect(container.querySelector('[data-part="cell-actor"]')?.textContent).toBe(
      'Warehouse Bot',
    );
  });
});
