import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import { renderWithEngine, STABLE_ENGINES } from '../../../../_internal/testing/helpers/engine-test-utils';

const items = [
  { key: 'overview', label: 'Overview', children: <div>Overview content</div> },
  { key: 'details', label: 'Details', children: <div>Details content</div> },
  { key: 'settings', label: 'Settings', children: <div>Settings content</div>, disabled: true },
];

describe('Tabs integration', () => {
  it.each(STABLE_ENGINES)('renders the live tabs with the %s engine', async (engine) => {
    const { Tabs } = await import('..');

    renderWithEngine(<Tabs engine={engine} items={items} defaultActiveKey="overview" />, engine);

    expect(await screen.findByRole('tablist', undefined, { timeout: 10000 })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Overview content');
  }, 15000);

  it('supports keyboard navigation in the rustic engine', async () => {
    const { Tabs } = await import('..');

    renderWithEngine(<Tabs engine="rustic" items={items} defaultActiveKey="overview" />, 'rustic');

    const overviewTab = await screen.findByRole('tab', { name: 'Overview' }, { timeout: 10000 });
    overviewTab.focus();
    fireEvent.keyDown(overviewTab, { key: 'ArrowRight' });

    expect(screen.getByRole('tab', { name: 'Details' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Details content');
  });

  it('supports keyboard navigation in the modern engine', async () => {
    const { Tabs } = await import('..');

    renderWithEngine(<Tabs engine="modern" items={items} defaultActiveKey="overview" />, 'modern');

    const overviewTab = await screen.findByRole('tab', { name: 'Overview' }, { timeout: 10000 });
    overviewTab.focus();
    fireEvent.keyDown(overviewTab, { key: 'End' });

    // End should skip the disabled tab and land on the last enabled one.
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Details content');
  });
});
