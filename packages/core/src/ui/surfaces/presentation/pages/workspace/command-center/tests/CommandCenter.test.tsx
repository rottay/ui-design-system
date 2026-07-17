import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { CommandCenterSurface } from '../index';
import { renderSurface } from '../../../../../foundation/common/test-utils';

describe('CommandCenterSurface', () => {
  it('renders title and greeting', async () => {
    renderSurface(
      <CommandCenterSurface title="Admin Hub" greeting="Good morning, Daniel" />,
    );
    expect(await screen.findByText('Admin Hub')).toBeInTheDocument();
    expect(await screen.findByText('Good morning, Daniel')).toBeInTheDocument();
  });

  it('renders stats when provided', async () => {
    renderSurface(
      <CommandCenterSurface
        title="Dashboard"
        stats={[
          { key: 'users', label: 'Total Users', value: 1234 },
          { key: 'revenue', label: 'Revenue', value: '$50K' },
        ]}
      />,
    );
    expect(await screen.findByText('Total Users')).toBeInTheDocument();
    expect(await screen.findByText('Revenue')).toBeInTheDocument();
  });

  it('renders viewAllHref as a link', async () => {
    renderSurface(
      <CommandCenterSurface
        title="Dashboard"
        recentActivity={{
          items: [{ id: '1', text: 'User logged in', timestamp: '2m ago' }],
          viewAllHref: '/activity',
        }}
      />,
    );
    expect(await screen.findByText('User logged in')).toBeInTheDocument();
    const viewAll = await screen.findByText('View all');
    expect(viewAll.closest('a')).toHaveAttribute('href', '/activity');
  });

  it('calls quickAction onClick', async () => {
    const onClick = vi.fn();
    renderSurface(
      <CommandCenterSurface
        title="Dashboard"
        quickActions={[{ key: 'create', label: 'Create New', onClick }]}
      />,
    );
    const btn = await screen.findByText('Create New');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });
});
