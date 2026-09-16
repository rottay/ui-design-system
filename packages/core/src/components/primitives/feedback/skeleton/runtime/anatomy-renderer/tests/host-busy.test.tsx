/**
 * The host-owned busy announcement.
 *
 * A host that already announces its own loading state must not get a second
 * `aria-busy` from the skeleton it mounts. The opt-out is additive, so the
 * shapes below are the ones every consumer rendered BEFORE it existed, pinned
 * byte for byte: a default render that differs from these is a regression in
 * someone else's component, not a new feature in this one.
 */
import type { ReactElement } from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '..';

const PINNED: ReadonlyArray<readonly [string, ReactElement, string]> = [
  [
    'children only (LocaleSwitcher)',
    <AnatomySkeleton><button type="button">x</button></AnatomySkeleton>,
    '<div data-part="root" data-loading="true" data-measured="true" data-animation="shimmer" aria-busy="true" class="ds-skeleton-anatomy"><div data-part="source" aria-hidden="true" inert=""><button type="button">x</button></div><div data-part="bones" aria-hidden="true"></div></div>',
  ],
  [
    'className + children (GridView)',
    <AnatomySkeleton className="ds-grid-view__skeleton"><div data-part="title">t</div></AnatomySkeleton>,
    '<div data-part="root" data-loading="true" data-measured="true" data-animation="shimmer" aria-busy="true" class="ds-skeleton-anatomy ds-grid-view__skeleton"><div data-part="source" aria-hidden="true" inert=""><div data-part="title">t</div></div><div data-part="bones" aria-hidden="true"><span data-part="bone" data-bone="line" data-source-part="title" style="--ds-skeleton-bone-x: 0px; --ds-skeleton-bone-y: 0px; --ds-skeleton-bone-width: 0px; --ds-skeleton-bone-height: 0px;"></span></div></div>',
  ],
  [
    'loading={false}',
    <AnatomySkeleton loading={false}><span>y</span></AnatomySkeleton>,
    '<div data-part="root" data-loading="false" data-measured="false" data-animation="shimmer" class="ds-skeleton-anatomy"><div data-part="source"><span>y</span></div></div>',
  ],
  [
    'animation={false}',
    <AnatomySkeleton animation={false}><span>y</span></AnatomySkeleton>,
    '<div data-part="root" data-loading="true" data-measured="true" aria-busy="true" class="ds-skeleton-anatomy"><div data-part="source" aria-hidden="true" inert=""><span>y</span></div><div data-part="bones" aria-hidden="true"></div></div>',
  ],
  [
    'mode="table-rows" (Table)',
    <AnatomySkeleton mode="table-rows" rowCount={2} cells={[{ key: 'a', kind: 'control' }, { key: 'b' }]} />,
    '<tr class="ds-skeleton-anatomy-rows" data-part="skeleton-row" data-loading="true" data-animation="shimmer" aria-hidden="true"><td data-part="skeleton-cell" data-kind="control"><span data-part="skeleton-bar" data-bone="line"></span></td><td data-part="skeleton-cell"><span data-part="skeleton-bar" data-bone="line"></span></td></tr><tr class="ds-skeleton-anatomy-rows" data-part="skeleton-row" data-loading="true" data-animation="shimmer" aria-hidden="true"><td data-part="skeleton-cell" data-kind="control"><span data-part="skeleton-bar" data-bone="line"></span></td><td data-part="skeleton-cell"><span data-part="skeleton-bar" data-bone="line"></span></td></tr>',
  ],
];

describe('AnatomySkeleton -- the busy announcement', () => {
  for (const [label, element, html] of PINNED) {
    it(`renders ${label} exactly as it did before the opt-out existed`, () => {
      expect(render(element).container.innerHTML).toBe(html);
    });
  }

  it('drops only aria-busy when the host owns the announcement', () => {
    const withBusy = render(
      <AnatomySkeleton><span>y</span></AnatomySkeleton>,
    ).container.innerHTML;
    const hostOwned = render(
      <AnatomySkeleton busy={false}><span>y</span></AnatomySkeleton>,
    ).container.innerHTML;

    expect(hostOwned).not.toContain('aria-busy');
    expect(hostOwned).toBe(withBusy.replace(' aria-busy="true"', ''));
  });

  it('leaves the skeleton silent when the host stops loading, in both directions', () => {
    const { container, rerender } = render(
      <AnatomySkeleton busy={false} loading><span>y</span></AnatomySkeleton>,
    );
    expect(container.querySelectorAll('[aria-busy]')).toHaveLength(0);
    rerender(<AnatomySkeleton busy={false} loading={false}><span>y</span></AnatomySkeleton>);
    expect(container.querySelectorAll('[aria-busy]')).toHaveLength(0);
  });
});
