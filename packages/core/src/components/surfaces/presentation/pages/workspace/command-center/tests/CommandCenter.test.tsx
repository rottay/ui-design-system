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

// F-1 RTL (owner ruling 2026-10-14): the engine default stays the physical `left`, so reading-order text passes
// align="start". jsdom loads no skin stylesheet, so the pair reads the stamped logical value and its utility
// class under each direction; that `text-align: start` lands on the right edge under dir=rtl is CSS's own rule.
function expectLogicalStart(container: ParentNode, hooks: readonly string[], dir: 'ltr' | 'rtl'): void {
  for (const hook of hooks) {
    const nodes = container.querySelectorAll(`.${hook}`);
    expect(nodes.length, hook).toBeGreaterThan(0);
    for (const node of nodes) {
      expect(node.getAttribute('data-align'), hook).toBe('start');
      expect(node.classList.contains('text-start'), hook).toBe(true);
      // the regression: the physical default pins the text to the left edge in RTL
      expect(node.classList.contains('text-left'), hook).toBe(false);
      expect(node.closest('[dir]')?.getAttribute('dir'), hook).toBe(dir);
    }
  }
}

describe('F-1 RTL semantic alignment', () => {
  it.each(['ltr', 'rtl'] as const)('stamps the logical start on the page title under dir=%s', async (dir) => {
    const { container } = renderSurface(
      <div dir={dir}>
        <CommandCenterSurface title="Admin Hub" />
      </div>,
      { engine: 'modern' },
    );
    await screen.findByText('Admin Hub');
    expectLogicalStart(container, ['ds-command-center__title'], dir);
  });
});
