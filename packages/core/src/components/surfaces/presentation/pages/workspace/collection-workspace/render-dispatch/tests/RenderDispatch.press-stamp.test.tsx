/**
 * The press stamp behind the fallback card's press rule.
 *
 * The skin cancels the hover lift under
 * `:is([data-state~="pressed"], :active)`. The `:active` arm is the platform's
 * fallback; the stamped arm is what a keyboard-driven press reaches. A twin
 * with no producer is a dead selector, so this pins the producer, and the card
 * row keeps the click contract that the stamp wiring had to preserve.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';

import { CollectionRenderDispatch } from '..';
import { renderSurface } from '../../../../../../foundation/common/test-utils';

const skin = readFileSync(
  join(
    __dirname,
    '../../../../../../../../foundation/tokens/css/presentation/components/skin/collection-workspace-render-dispatch/index.css',
  ),
  'utf8',
);

const rows = [
  { id: '1', name: 'Alpha' },
  { id: '2', name: 'Beta' },
];
const columns = [{ key: 'name', dataIndex: 'name', title: 'Name' }];

function renderCards(onRowClick?: (row: (typeof rows)[number], index: number) => void) {
  return renderSurface(
    <CollectionRenderDispatch
      viewMode="cards"
      data={rows}
      columns={columns as any}
      rowKey="id"
      onRowClick={onRowClick as any}
    />,
    { engine: 'modern' },
  );
}

describe('CollectionRenderDispatch card press stamp', () => {
  it('pairs the card press rule with the stamped state', () => {
    expect(skin).toContain('[data-activatable="true"]:is([data-state~="pressed"], :active)');
    expect(skin).not.toMatch(/\[data-activatable="true"\]:active\s/u);
  });

  it('carries no data-state at rest and stamps pressed on pointer down', async () => {
    const { container } = renderCards(() => undefined);
    await waitFor(() =>
      expect(container.querySelectorAll('[data-part="card-item"]')).toHaveLength(rows.length),
    );

    const card = container.querySelector<HTMLElement>('[data-part="card-item"]')!;
    expect(card.getAttribute('data-activatable')).toBe('true');
    expect(card.hasAttribute('data-state')).toBe(false);

    fireEvent.pointerDown(card);
    expect(card.getAttribute('data-state')?.split(' ')).toContain('pressed');

    fireEvent.pointerUp(card);
    expect(card.getAttribute('data-state')?.split(' ') ?? []).not.toContain('pressed');
  });

  it('keeps the row-click contract the stamp wiring had to carry through', async () => {
    const onRowClick = vi.fn();
    const { container } = renderCards(onRowClick);
    await waitFor(() =>
      expect(container.querySelectorAll('[data-part="card-item"]')).toHaveLength(rows.length),
    );

    const card = container.querySelector<HTMLElement>('[data-part="card-item"]')!;
    fireEvent.click(card);
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick.mock.calls[0][0]).toEqual(rows[0]);
    expect(onRowClick.mock.calls[0][1]).toBe(0);
  });

  it('marks the lone-final card and leaves non-activatable rows unstamped as activatable', async () => {
    const { container } = renderCards(undefined);
    await waitFor(() =>
      expect(container.querySelectorAll('[data-part="card-item"]')).toHaveLength(rows.length),
    );
    const card = container.querySelector<HTMLElement>('[data-part="card-item"]')!;
    expect(card.getAttribute('data-activatable')).toBe('false');
    expect(card.getAttribute('data-lone-final')).toBe('false');
  });
});
