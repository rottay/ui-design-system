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

function renderLinkedCards() {
  return renderSurface(
    <CollectionRenderDispatch
      viewMode="cards"
      data={rows}
      columns={columns as any}
      rowKey="id"
      rowHref={((row: (typeof rows)[number]) => `/records/${row.id}`) as any}
      rowActivationLabel={(() => 'Open record') as any}
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

  /* ---- the fallback card's own open link: its keyboard ring ---- */

  it('pairs the open-link ring with the stamped state', () => {
    expect(skin).toContain('[data-part="fallback-open-link"]:is(');
    expect(skin).toContain('[data-state~="focus-visible"]');
    expect(skin).toContain('outline: var(--ds-focus-ring-width, 2px) solid');
    expect(skin).toContain('outline-offset: var(--ds-focus-ring-offset, 2px);');
    expect(skin).not.toMatch(/\[data-part="fallback-open-link"\]:focus-visible\s*\{/u);
  });

  it('leaves the open link silent at rest and stamps focus-visible for a keyboard focus', async () => {
    const { container } = renderLinkedCards();
    await waitFor(() =>
      expect(container.querySelectorAll('[data-part="fallback-open-link"]')).toHaveLength(rows.length),
    );

    const link = container.querySelector<HTMLAnchorElement>('[data-part="fallback-open-link"]')!;
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/records/1');
    expect(link.getAttribute('aria-label')).toBe('Open record');
    expect(link.hasAttribute('data-state')).toBe(false);

    fireEvent.focus(link);
    expect(link.getAttribute('data-state')?.split(' ')).toContain('focus-visible');

    fireEvent.blur(link);
    expect(link.hasAttribute('data-state')).toBe(false);
  });

  it('withholds the open-link ring from a pointer-driven focus', async () => {
    const { container } = renderLinkedCards();
    await waitFor(() =>
      expect(container.querySelector('[data-part="fallback-open-link"]')).not.toBeNull(),
    );

    const link = container.querySelector<HTMLElement>('[data-part="fallback-open-link"]')!;
    fireEvent.pointerDown(link);
    fireEvent.focus(link);
    expect(link.getAttribute('data-state')?.split(' ') ?? []).not.toContain('focus-visible');
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
