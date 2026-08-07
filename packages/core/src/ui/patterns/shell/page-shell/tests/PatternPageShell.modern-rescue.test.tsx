import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernPageShell from '../engines/modern';
import type { PageShellProps } from '../contracts';

function buildProps(overrides: Partial<PageShellProps> = {}): PageShellProps {
  return {
    title: 'Launchpad',
    tabs: [
      { key: 'overview', label: 'Overview', content: <div>Overview content</div> },
      { key: 'activity', label: 'Activity', content: <div>Activity content</div> },
    ],
    activeTab: 'overview',
    onTabChange: vi.fn(),
    children: <div>Fallback content</div>,
    ...overrides,
  };
}

describe('PatternPageShell modern — rescue drills', () => {
  it('drops tabpanel semantics when hideHeader removes the tablist', () => {
    const { container } = render(<ModernPageShell {...buildProps({ hideHeader: true })} />);
    const content = container.querySelector('[data-part="content"]') as HTMLElement;

    expect(screen.queryByRole('tablist')).toBeNull();
    // Before: the content kept role="tabpanel" and pointed aria-labelledby at
    // tab ids that were never rendered.
    expect(content).not.toHaveAttribute('role');
    expect(content).not.toHaveAttribute('aria-labelledby');
    expect(content).not.toHaveAttribute('id');

    // The routed tab content is untouched by the semantics fix.
    expect(screen.getByText('Overview content')).toBeInTheDocument();
  });

  it('keeps the tab/tabpanel pairing intact when the header renders', () => {
    render(<ModernPageShell {...buildProps()} />);

    const panel = screen.getByRole('tabpanel');
    const overview = screen.getByRole('tab', { name: 'Overview' });

    expect(panel).toHaveAttribute('aria-labelledby', overview.id);
    expect(overview).toHaveAttribute('aria-controls', panel.id);
  });
});
