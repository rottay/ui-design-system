import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { DetailPanelProps, DetailTab } from '../contracts';
import ModernDetailPanel from '../engines/modern';

type Customer = { id: string };

function createProps(
  overrides: Partial<DetailPanelProps<Customer>> = {},
): DetailPanelProps<Customer> {
  return {
    data: { id: 'customer-1' },
    title: 'Acme Corp',
    ...overrides,
  };
}

const TABS: DetailTab[] = [
  { key: 'overview', label: 'Overview', content: <div>Overview tab</div> },
  { key: 'billing', label: 'Billing', content: <div>Billing tab</div> },
  { key: 'audit', label: 'Audit', content: <div>Audit tab</div> },
];

describe('Modern DetailPanel — tab relationship integrity', () => {
  it('never points aria-controls at an id that is absent from the document', () => {
    render(<ModernDetailPanel {...createProps({ tabs: TABS })} />);

    for (const tab of screen.getAllByRole('tab')) {
      const controls = tab.getAttribute('aria-controls');
      if (controls === null) continue;
      // aria-controls must never reference an id that isn't rendered — only
      // the active tab's panel exists in the DOM.
      expect(document.getElementById(controls)).not.toBeNull();
    }
  });

  it('keeps aria-controls on the active tab only, and follows the selection', () => {
    render(<ModernDetailPanel {...createProps({ tabs: TABS })} />);

    const [overview, billing] = screen.getAllByRole('tab');
    expect(overview.getAttribute('aria-controls')).toBe('panel-overview');
    expect(billing.getAttribute('aria-controls')).toBeNull();

    fireEvent.click(billing);
    expect(screen.getByRole('tab', { name: 'Billing' }).getAttribute('aria-controls'))
      .toBe('panel-billing');
    expect(screen.getByRole('tab', { name: 'Overview' }).getAttribute('aria-controls'))
      .toBeNull();
  });

  it('makes the tab panel keyboard-reachable', () => {
    render(<ModernDetailPanel {...createProps({ tabs: TABS })} />);

    // The panel content carries no focusable descendant, so without a tab stop
    // of its own it could not be reached at all.
    expect(screen.getByRole('tabpanel')).toHaveAttribute('tabindex', '0');
  });
});

describe('Modern DetailPanel — disabled seed tab', () => {
  it('does not seed onto a disabled first tab', () => {
    const tabs: DetailTab[] = [
      { key: 'locked', label: 'Locked', content: <div>Locked tab</div>, disabled: true },
      { key: 'open', label: 'Open', content: <div>Open tab</div> },
    ];
    render(<ModernDetailPanel {...createProps({ tabs })} />);

    // The initial seed must skip a disabled tab; landing on one leaves the
    // tablist with no reachable tab stop at all.
    const stops = screen
      .getAllByRole('tab')
      .filter((tab) => tab.getAttribute('tabindex') === '0');
    expect(stops).toHaveLength(1);
    expect(stops[0]).not.toBeDisabled();
    expect(stops[0]).toHaveAccessibleName('Open');
    expect(screen.getByText('Open tab')).toBeInTheDocument();
  });

  it('still honours an explicit controlled tab', () => {
    const tabs: DetailTab[] = [
      { key: 'locked', label: 'Locked', content: <div>Locked tab</div>, disabled: true },
      { key: 'open', label: 'Open', content: <div>Open tab</div> },
    ];
    render(<ModernDetailPanel {...createProps({ tabs, activeTab: 'locked' })} />);

    expect(screen.getByText('Locked tab')).toBeInTheDocument();
  });
});

describe('Modern DetailPanel — instance-scoped tab focus', () => {
  it('keeps arrow-key focus inside the panel that received the key', () => {
    render(
      <>
        <div data-testid="first">
          <ModernDetailPanel {...createProps({ tabs: TABS })} />
        </div>
        <div data-testid="second">
          <ModernDetailPanel {...createProps({ tabs: TABS })} />
        </div>
      </>,
    );

    const second = screen.getByTestId('second');
    const secondTabs = within(second).getAllByRole('tab');
    fireEvent.keyDown(within(second).getByRole('tablist'), { key: 'ArrowRight' });

    // Arrow-key focus must stay scoped to the panel instance that received
    // the key, not fall through to the first DOM match across panels.
    expect(secondTabs[1]).toHaveFocus();
    expect(second.contains(document.activeElement)).toBe(true);
  });
});

describe('Modern DetailPanel — status colour parity with rustic', () => {
  it('stamps the status custom properties the rustic engine already honoured', () => {
    const { container } = render(
      <ModernDetailPanel
        {...createProps({ status: { label: 'On Leave', color: '#f59e0b' } })}
      />,
    );

    const badge = container.querySelector<HTMLElement>('[data-part="status-badge"]')!;
    const names: string[] = [];
    for (let i = 0; i < badge.style.length; i += 1) names.push(badge.style[i]);

    expect(names.sort()).toEqual([
      '--ds-detail-panel-status-bg',
      '--ds-detail-panel-status-fg',
    ]);
    expect(badge.style.getPropertyValue('--ds-detail-panel-status-bg')).toBe('#f59e0b');
    expect(badge.style.background, 'the badge must not carry a background literal inline').toBe('');
    expect(badge.style.color, 'the badge must not carry a color literal inline').toBe('');
  });

  it('stamps no status custom-property when status.color is absent', () => {
    const { container } = render(
      <ModernDetailPanel {...createProps({ status: { label: 'Draft' } })} />,
    );

    const badge = container.querySelector<HTMLElement>('[data-part="status-badge"]')!;
    expect(badge.style.length, 'no-color badge must carry no inline style keys').toBe(0);
  });
});

describe('Modern DetailPanel — loading branch', () => {
  it('gives the busy skeleton real prose to announce', () => {
    const { container } = render(<ModernDetailPanel {...createProps()} loading />);

    const root = container.querySelector('[data-part="root"]')!;
    expect(root).toHaveAttribute('aria-busy', 'true');
    // A busy subtree needs real announced text, not only textless skeleton shapes.
    expect(root.textContent).toContain('Loading details');
  });
});
