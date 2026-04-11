import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { RecordWorkbenchSurface } from './index';
import { renderSurface } from '../common/test-utils';

describe('RecordWorkbenchSurface', () => {
  const baseTabs = [
    { key: 'overview', label: 'Overview', render: () => <div>Overview Content</div> },
    { key: 'history', label: 'History', badge: 5, render: () => <div>History Content</div> },
  ];

  it('renders title and first tab content', async () => {
    renderSurface(
      <RecordWorkbenchSurface title="John Doe" tabs={baseTabs} />,
    );
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(await screen.findByText('Overview Content')).toBeInTheDocument();
  });

  it('switches tabs and renders new content', async () => {
    renderSurface(
      <RecordWorkbenchSurface title="John Doe" tabs={baseTabs} />,
    );
    const historyTab = await screen.findByText('History');
    fireEvent.click(historyTab);
    expect(await screen.findByText('History Content')).toBeInTheDocument();
  });

  it('renders tabs with proper ARIA attributes', async () => {
    renderSurface(
      <RecordWorkbenchSurface title="John Doe" tabs={baseTabs} />,
    );
    const tablist = await screen.findByRole('tablist');
    expect(tablist).toBeInTheDocument();
    const tabs = await screen.findAllByRole('tab');
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('shows loading state', async () => {
    renderSurface(
      <RecordWorkbenchSurface title="John Doe" tabs={baseTabs} loading />,
    );
    // Loading should show skeletons or spinner, not the tab content
    expect(screen.queryByText('Overview Content')).not.toBeInTheDocument();
  });
});
