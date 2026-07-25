import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernDescriptions, { Item as ModernItem } from '../engines/modern';

describe('Descriptions modern advanced coverage', () => {
  it('covers horizontal layout, bordered headers, responsive columns, spans, and shared item styles', () => {
    const { container } = render(
      <ModernDescriptions
        title="Profile"
        extra={<button type="button">Manage</button>}
        bordered
        column={{ md: 2, lg: 4 }}
        size="small"
        styles={{
          label: { color: 'rgb(255, 0, 0)' },
          content: { fontWeight: 700 },
        }}
      >
        <ModernItem label="Name" span={2} styles={{ label: { fontStyle: 'italic' } }}>
          Ada Lovelace
        </ModernItem>
        <ModernItem label="Email">ada@rottay.dev</ModernItem>
      </ModernDescriptions>
    );

    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage' })).toBeInTheDocument();

    // K3-A Pass 1: the bordered/size utility classes are gone from the body --
    // the skin paints those channels keyed on data-bordered / data-size, so the
    // DOM carries the hooks only.
    const wrapper = container.querySelector('[data-engine="modern"] > [data-part="body"]') as HTMLDivElement;
    expect(wrapper.className).not.toContain('border');
    expect(wrapper.className).not.toContain('text-sm');

    const root = container.querySelector('[data-engine="modern"]') as HTMLDivElement;
    expect(root).toHaveAttribute('data-bordered', 'true');
    expect(root).toHaveAttribute('data-size', 'small');
    const grid = container.querySelector('[data-part="rows"]') as HTMLDivElement;
    expect(root).toHaveAttribute('data-column-count', '2');
    expect(root).toHaveAttribute('data-item-count', '2');
    expect(root).toHaveAttribute('data-has-header', 'true');
    expect(root.style.getPropertyValue('--ds-descriptions-column-count')).toBe('2');
    expect(grid).toHaveAttribute('role', 'list');
    expect(grid.querySelector('[data-part="row"]')).toHaveAttribute('data-span', '2');
    expect(screen.getByText('Name:')).toHaveStyle({ color: 'rgb(255, 0, 0)', fontStyle: 'italic' });
    expect(screen.getByText('Ada Lovelace')).toHaveStyle({ fontWeight: '700' });
  });

  it('covers vertical layout, colon=false, unbordered rendering, and standalone item wrappers', () => {
    const { container } = render(
      <>
        <ModernDescriptions layout="vertical" bordered={false} colon={false} size="middle">
          <ModernItem label="Status">Live</ModernItem>
          {null}
        </ModernDescriptions>
        <ModernItem label="Detached">Standalone</ModernItem>
      </>
    );

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.queryByText('Status:')).not.toBeInTheDocument();
    // The vertical separator was a `divide-y` utility the bundle never
    // generated (dead class); it is gone -- the skin owns the row chrome.
    expect(container.querySelector('.divide-y')).toBeNull();
    // Vertical mode carries the data-layout hook the W6-D subgrid skin scopes to.
    expect(container.querySelector('[data-part="root"][data-layout="vertical"]')).toBeTruthy();
    expect(screen.getByText('Standalone')).toBeInTheDocument();
  });
});
