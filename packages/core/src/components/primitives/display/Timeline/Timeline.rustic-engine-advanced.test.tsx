import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import RusticTimeline, { Item as RusticItem } from './engines/rustic';

describe('Timeline rustic advanced coverage', () => {
  it('covers alternate mode, reverse ordering, pending states, labels, custom dots, and custom colors', () => {
    render(
      <RusticTimeline
        mode="alternate"
        reverse
        pending="Waiting approval"
        pendingDot={<span data-testid="pending-dot">…</span>}
        className="timeline-shell"
        style={{ marginTop: 4 }}
        items={[
          { label: '2026-03-01', color: 'green', children: 'Approved' },
          {
            label: '2026-03-02',
            color: '#123456',
            dot: <span data-testid="custom-dot">•</span>,
            children: 'Custom review',
          },
        ]}
      />
    );

    const list = screen.getByRole('list', { name: 'Timeline' });
    expect(list).toHaveClass('timeline-shell');
    expect(list).toHaveStyle({ marginTop: '4px' });

    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Custom review');
    expect(items[0]).toHaveStyle({ textAlign: 'left' });
    expect(items[1]).toHaveTextContent('Approved');
    expect(items[1]).toHaveStyle({ textAlign: 'right' });
    expect(screen.getByTestId('custom-dot')).toBeInTheDocument();
    expect(screen.getByTestId('pending-dot')).toBeInTheDocument();
    expect(screen.getByLabelText('Pending')).toHaveTextContent('Waiting approval');
  });

  it('covers child-based items, right mode, default colors, and no-label branches', () => {
    render(
      <RusticTimeline mode="right">
        <RusticItem label="2026-03-05">Ship review</RusticItem>
        <RusticItem color="rebeccapurple">Custom color event</RusticItem>
      </RusticTimeline>
    );

    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Ship review');
    expect(items[0]).toHaveStyle({ textAlign: 'right' });
    expect(items[1]).toHaveTextContent('Custom color event');
    expect(items[1]).toHaveStyle({ textAlign: 'right' });
  });
});
