/**
 * DetailHeader tab keyboard navigation does not depend on carrier parts.
 *
 * The strip and the tabs are layout carriers (Box/Flex) whose `data-part` a
 * caller hands them. The arrow-key handler must find its tablist and its tabs
 * through the APG roles the header stamps, so the parts are removed here
 * before any key is pressed: a handler keyed on the parts finds nothing and
 * focus stays put.
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor, within } from '@testing-library/react';

import { DetailHeader } from '..';
import { renderWithEngine } from '@tests/support/engine';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity' },
  { id: 'notes', label: 'Notes' },
];

describe('DetailHeader tab navigation on a bare strip', () => {
  it('moves focus through the tablist by role when the carriers hold no part', async () => {
    const onTabChange = vi.fn();
    const { getByRole } = renderWithEngine(
      <DetailHeader title="Acme" backHref="/x" tabs={TABS} activeTab="overview" onTabChange={onTabChange} />,
      'modern',
    );
    const tablist = await waitFor(() => getByRole('tablist', { name: 'Tabs' }));
    for (const element of [tablist, ...Array.from(tablist.querySelectorAll('[data-part]'))]) {
      element.removeAttribute('data-part');
    }
    const tabs = within(tablist).getAllByRole('tab');

    // Controls: the strip is really bare, and the roles are really there.
    expect(tablist.closest('[data-part="tab-strip"]')).toBeNull();
    expect(tablist.querySelectorAll('[data-part="tab"]')).toHaveLength(0);
    expect(tabs).toHaveLength(3);

    tabs[0]!.focus();
    fireEvent.keyDown(tabs[0]!, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tabs[1]);
    fireEvent.keyDown(tabs[1]!, { key: 'End' });
    expect(document.activeElement).toBe(tabs[2]);
    fireEvent.keyDown(tabs[2]!, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tabs[0]);
    fireEvent.keyDown(tabs[0]!, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(tabs[2]);
    fireEvent.keyDown(tabs[2]!, { key: 'Home' });
    expect(document.activeElement).toBe(tabs[0]);
    // Arrows move focus only; activation stays on Enter/Space.
    expect(onTabChange).not.toHaveBeenCalled();
    fireEvent.keyDown(tabs[1]!, { key: 'Enter' });
    expect(onTabChange).toHaveBeenCalledWith('activity');
  });

  it('stays inside its own tablist when an outer tablist wraps the header', async () => {
    const { getByRole } = renderWithEngine(
      <div role="tablist" aria-label="Outer">
        <DetailHeader title="Acme" backHref="/x" tabs={TABS} activeTab="overview" onTabChange={vi.fn()} />
      </div>,
      'modern',
    );
    const tablist = await waitFor(() => getByRole('tablist', { name: 'Tabs' }));
    const tabs = within(tablist).getAllByRole('tab');

    tabs[2]!.focus();
    fireEvent.keyDown(tabs[2]!, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tabs[0]);
  });
});
