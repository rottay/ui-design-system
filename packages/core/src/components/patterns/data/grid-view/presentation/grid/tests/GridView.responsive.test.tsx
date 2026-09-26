import React from 'react';
import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { PatternGridView } from '..';

interface Row {
  id: string;
  name: string;
}

const data: Row[] = [
  { id: 'a', name: 'Row A' },
  { id: 'b', name: 'Row B' },
];

const renderCard = (item: Row): React.ReactElement => <div>{item.name}</div>;

async function root(container: HTMLElement): Promise<HTMLElement> {
  return (await waitFor(() => {
    const node = container.querySelector('.ds-pattern-grid-view[data-part="root"]');
    if (!node) throw new Error('grid root not found');
    return node;
  })) as HTMLElement;
}

describe('PatternGridView responsive + style pass-through', () => {
  it('lays out as the auto-fit Grid and ignores the legacy column model', async () => {
    const { container } = renderWithEngine(
      <PatternGridView data={data} renderCard={renderCard} rowKey="id" columns={3} minColumnWidth={320} />,
      'modern',
    );

    // The root IS the Grid primitive in its auto-fit mode: the track model and
    // its min(100%, ...) overflow floor are the Grid skin's recipe, so neither
    // a number nor a family channel is written here.
    const grid = await root(container);
    expect(grid.getAttribute('data-component')).toBe('grid');
    expect(grid.getAttribute('data-auto-fit')).toBe('true');
    expect(grid.style.gridTemplateColumns).toBe('');
    expect(grid.style.getPropertyValue('--ds-grid-view-columns')).toBe('');
    expect(grid.getAttribute('style') ?? '').not.toMatch(/320|minmax|auto-fill/);
  });

  it('writes no gap of its own when the caller states none: the Grid md rung applies', async () => {
    const { container } = renderWithEngine(
      <PatternGridView data={data} renderCard={renderCard} rowKey="id" />,
      'modern',
    );

    const grid = await root(container);
    expect(grid.getAttribute('data-gap-preset')).toBe('md');
    expect(grid.style.getPropertyValue('--ds-grid-view-gap')).toBe('');
    expect(grid.style.gap).toBe('');
  });

  it('hands a stated gap to the Grid: a number exact, a rung by name, any other length on --ds-grid-gap', async () => {
    const exact = await root(
      renderWithEngine(<PatternGridView data={data} renderCard={renderCard} rowKey="id" gap={24} />, 'modern').container,
    );
    expect(exact.style.gap).toBe('24px');
    expect(exact.hasAttribute('data-gap-preset')).toBe(false);

    const rung = await root(
      renderWithEngine(<PatternGridView data={data} renderCard={renderCard} rowKey="id" gap="lg" />, 'modern').container,
    );
    expect(rung.getAttribute('data-gap-preset')).toBe('lg');

    const length = await root(
      renderWithEngine(<PatternGridView data={data} renderCard={renderCard} rowKey="id" gap="1.5rem" />, 'modern').container,
    );
    expect(length.style.getPropertyValue('--ds-grid-gap')).toBe('1.5rem');
  });

  it('keeps an explicit templateColumns sovereign over the recipe', async () => {
    const grid = await root(
      renderWithEngine(
        <PatternGridView data={data} renderCard={renderCard} rowKey="id" templateColumns="200px 1fr" />,
        'modern',
      ).container,
    );
    expect(grid.style.gridTemplateColumns).toBe('200px 1fr');
  });

  it('carries the minItem preset to the Grid and stamps the resolved posture', async () => {
    const grid = await root(
      renderWithEngine(<PatternGridView data={data} renderCard={renderCard} rowKey="id" minItem="lg" />, 'modern')
        .container,
    );
    expect(grid.getAttribute('data-min-item')).toBe('lg');
    expect(grid.getAttribute('data-posture')).toMatch(/^(phone|tablet|desktop)( (compact|regular|expanded))?$/);
  });

  it('keeps the caller style on the empty state, not only on the populated grid', async () => {
    const { container } = renderWithEngine(
      <PatternGridView<Row>
        data={[]}
        renderCard={renderCard}
        rowKey="id"
        style={{ minHeight: '320px' }}
      />,
      'modern',
    );

    const empty = (await root(container));
    expect(empty.getAttribute('data-empty')).toBe('true');
    expect(empty.style.minHeight).toBe('320px');
  });
});
