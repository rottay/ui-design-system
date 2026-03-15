import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernList, { Item as ModernItem, Meta as ModernMeta } from './engines/modern';
import RusticList, { Item as RusticItem, Meta as RusticMeta } from './engines/rustic';

const team = [
  { name: 'Ada Lovelace', email: 'ada@rottay.dev' },
  { name: 'Grace Hopper', email: 'grace@rottay.dev' },
];

describe('List advanced engine coverage', () => {
  it('covers modern loading, grid layouts, actions, extras, headers, footers, and meta branches', () => {
    const { container, rerender } = render(
      <ModernList loading className="loading-shell" />
    );

    expect(container.querySelector('.animate-pulse')).toBeTruthy();

    rerender(
      <ModernList
        bordered
        header="Team"
        footer="2 members"
        size="large"
        itemLayout="vertical"
        grid={{ column: 2, gutter: 24 }}
        dataSource={team}
        renderItem={(user) => (
          <ModernItem
            extra={<button type="button">View</button>}
            actions={[<button key="mute" type="button">Mute</button>]}
          >
            <ModernMeta
              avatar={<span>•</span>}
              title={user.name}
              description={user.email}
            />
          </ModernItem>
        )}
      />
    );

    expect(screen.getByText('Team')).toBeInTheDocument();
    expect(screen.getByText('2 members')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Mute' })).toHaveLength(2);
    expect(container.querySelector('ul')?.className).toContain('grid');
    expect(container.querySelector('ul')?.getAttribute('style') ?? '').toContain('repeat(2, 1fr)');
  });

  it('covers rustic loading, split dividers, header/footer borders, child rendering, and meta branches', () => {
    const { container, rerender } = render(
      <RusticList loading className="loading-shell" />
    );

    expect(container.textContent).toBe('');
    expect(container.querySelectorAll('div[style*="border-radius: 50%"]').length).toBeGreaterThan(0);

    rerender(
      <RusticList bordered header="Team" footer="2 members" size="small" split>
        <RusticItem extra={<button type="button">View</button>} actions={[<button key="mute" type="button">Mute</button>]}>
          <RusticMeta avatar={<span>•</span>} title="Ada Lovelace" description="ada@rottay.dev" />
        </RusticItem>
        <RusticItem>
          <RusticMeta title="Grace Hopper" />
        </RusticItem>
      </RusticList>
    );

    expect(screen.getByText('Team')).toBeInTheDocument();
    expect(screen.getByText('2 members')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(container.querySelector('ul')?.getAttribute('style') ?? '').toContain('padding: 0px 16px');
    expect(container.querySelectorAll('div[style*="border-bottom"]').length).toBeGreaterThan(0);
  });
});
