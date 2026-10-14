import React from 'react';
import { screen, waitFor } from '@testing-library/react';
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

describe('PatternGridView accessibility', () => {
  it('names every selection checkbox after the row it selects', async () => {
    renderWithEngine(
      <PatternGridView data={data} renderCard={renderCard} rowKey="id" selectable />,
      'modern',
    );

    // A selectable grid used to render its checkboxes with no accessible name
    // at all, so a screen reader heard "checkbox" N times with nothing to tell
    // them apart.
    const boxes = await waitFor(() => {
      const found = screen.getAllByRole('checkbox');
      if (found.length !== data.length) throw new Error('checkboxes not mounted');
      return found;
    });
    expect(boxes[0]).toHaveAccessibleName('Select item a');
    expect(boxes[1]).toHaveAccessibleName('Select item b');
  });

  it('announces the loading state once, on the shared renderer', async () => {
    const { container } = renderWithEngine(
      <PatternGridView data={data} renderCard={renderCard} rowKey="id" loading />,
      'modern',
    );

    // The anatomy renderer owns the announcement; the grid it stands in for is
    // marked inert and hidden beneath it, so the surface announces once.
    const busy = await waitFor(() => {
      const node = container.querySelector('[aria-busy="true"]');
      if (!node) throw new Error('no busy region');
      return node;
    });
    expect(busy).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelector('[data-part="source"]')).toHaveAttribute('aria-hidden', 'true');
  });
});
