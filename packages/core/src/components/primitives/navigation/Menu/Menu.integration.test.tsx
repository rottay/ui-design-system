import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import { renderWithEngine, STABLE_ENGINES } from '../../../../_internal/testing/helpers/engine-test-utils';

const items = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'reports', label: 'Reports' },
  {
    key: 'settings',
    label: 'Settings',
    children: [{ key: 'profile', label: 'Profile' }],
  },
];

describe('Menu integration', () => {
  it.each(STABLE_ENGINES)('renders the live menu with the %s engine', async (engine) => {
    const { Menu } = await import('..');

    renderWithEngine(<Menu engine={engine} items={items} mode="vertical" />, engine);

    expect(await screen.findByText('Dashboard', undefined, { timeout: 10000 })).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  }, 15000);

  it('routes live selection callbacks through the rustic engine', async () => {
    const { Menu } = await import('..');
    const onSelect = vi.fn();

    renderWithEngine(<Menu engine="rustic" items={items} onSelect={onSelect} />, 'rustic');

    fireEvent.click(await screen.findByText('Reports', undefined, { timeout: 10000 }));

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'reports',
        selectedKeys: ['reports'],
      })
    );
  });
});
