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
  it('floors the auto track at 100% of the container so it cannot overflow a narrow parent', async () => {
    const { container } = renderWithEngine(
      <PatternGridView data={data} renderCard={renderCard} rowKey="id" minColumnWidth={320} />,
      'modern',
    );

    // The track model rides the family channel the skin consumes; the TSX
    // paints nothing itself.
    const grid = await root(container);
    const columns = grid.style.getPropertyValue('--ds-grid-view-columns');
    // Without the min(..., 100%) floor the track resolves to a bare 320px
    // minimum and overflows any container narrower than that.
    expect(columns).toContain('min(var(--ds-listing-grid-min-compact-width, 320px), 100%)');
    expect(grid.style.gridTemplateColumns).toBe('');
  });

  it('leaves both layout channels unstamped when the caller states no number', async () => {
    const { container } = renderWithEngine(
      <PatternGridView data={data} renderCard={renderCard} rowKey="id" />,
      'modern',
    );

    // Negative control for the case above: an unconditional stamp would shadow
    // the skin's resting declaration on every render.
    const grid = await root(container);
    expect(grid.style.getPropertyValue('--ds-grid-view-columns')).toBe('');
    expect(grid.style.getPropertyValue('--ds-grid-view-gap')).toBe('');
  });

  it('stamps the gap channel when the caller states one', async () => {
    const { container } = renderWithEngine(
      <PatternGridView data={data} renderCard={renderCard} rowKey="id" gap={24} />,
      'modern',
    );

    expect((await root(container)).style.getPropertyValue('--ds-grid-view-gap')).toBe('24px');
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
