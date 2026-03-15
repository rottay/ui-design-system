import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernDescriptions, { Item as ModernItem } from './engines/modern';

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

    const wrapper = container.querySelector('[data-engine="modern"] > div:last-child') as HTMLDivElement;
    expect(wrapper.className).toContain('border');
    expect(wrapper.className).toContain('text-sm');

    const grid = container.querySelector('.grid') as HTMLDivElement;
    expect(grid.style.gridTemplateColumns).toBe('repeat(2, 1fr)');
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
    expect(container.querySelector('.divide-y')).toBeTruthy();
    expect(screen.getByText('Standalone')).toBeInTheDocument();
  });
});
