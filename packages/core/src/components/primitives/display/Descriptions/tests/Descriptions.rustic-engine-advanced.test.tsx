import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { RusticDescriptions, RusticItem } from '../engines/rustic';

describe('Descriptions rustic engine advanced coverage', () => {
  it('renders horizontal bordered grids with responsive columns, spans, and header extras', () => {
    render(
      <RusticDescriptions
        title="Account details"
        extra={<button type="button">Edit</button>}
        bordered
        column={{ md: 2 }}
        layout="horizontal"
        size="small"
      >
        <RusticItem
          label="Name"
          span={2}
          styles={{
            label: { color: 'rgb(9, 9, 9)' },
            content: { fontWeight: 700 },
          }}
        >
          Jane Doe
        </RusticItem>
        <RusticItem label="Role">Organizer</RusticItem>
      </RusticDescriptions>
    );

    const region = screen.getByRole('region', { name: 'Account details' });
    const list = screen.getByRole('list');
    const items = screen.getAllByRole('listitem');

    expect(region).toHaveStyle({ fontSize: 'var(--ds-descriptions-font-size-small, 12px)' });
    expect(list).toHaveStyle({ gridTemplateColumns: 'repeat(2, 1fr)' });
    expect(items[0]).toHaveStyle({ gridColumn: 'span 2' });
    expect(items[0]).toHaveTextContent('Name:');
    expect(items[0]).toHaveTextContent('Jane Doe');
    expect(items[1]).toHaveTextContent('Role:');
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('renders vertical layouts without colons and falls back to the generic aria label for non-string titles', () => {
    render(
      <RusticDescriptions title={<span>Profile</span>} bordered={false} layout="vertical" colon={false}>
        <RusticItem label="Status">Active</RusticItem>
      </RusticDescriptions>
    );

    const region = screen.getByRole('region', { name: 'Description list' });
    const item = screen.getByRole('listitem');

    expect(region).toBeInTheDocument();
    expect(item).toHaveStyle({ display: 'flex' });
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.queryByText('Status:')).toBeNull();
  });
});
