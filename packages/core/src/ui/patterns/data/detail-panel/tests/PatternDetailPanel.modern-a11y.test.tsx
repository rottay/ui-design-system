import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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

const LATE_TABS: DetailTab[] = [
  { key: 'overview', label: 'Overview', content: <div>Overview tab</div> },
  { key: 'billing', label: 'Billing', content: <div>Billing tab</div> },
];

describe('Modern DetailPanel — uncontrolled tab reconciliation', () => {
  it('selects the first tab when tabs arrive after the first render', () => {
    // Async detail load: the panel mounts before its tabs are known, so the
    // uncontrolled seed captured at mount names no tab.
    const { rerender } = render(<ModernDetailPanel {...createProps({ tabs: [] })} />);

    rerender(<ModernDetailPanel {...createProps({ tabs: LATE_TABS })} />);

    const tabButtons = screen.getAllByRole('tab');
    expect(tabButtons.map((el) => el.getAttribute('aria-selected'))).toEqual([
      'true',
      'false',
    ]);
    expect(screen.getByRole('tabpanel')).toHaveAttribute('id', 'panel-overview');
    expect(screen.getByText('Overview tab')).toBeInTheDocument();
  });

});

describe('Modern DetailPanel — breadcrumb and loading a11y', () => {
  it('makes an onClick-only ancestor crumb operable from the keyboard', () => {
    const onClick = vi.fn();
    render(
      <ModernDetailPanel
        {...createProps({
          breadcrumbs: [{ label: 'Customers', onClick }, { label: 'Acme Corp' }],
        })}
      />,
    );

    const crumb = screen.getByText('Customers');
    expect(crumb).toHaveAttribute('role', 'button');
    expect(crumb).toHaveAttribute('tabindex', '0');

    fireEvent.keyDown(crumb, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(crumb, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('marks the trailing crumb as the current page', () => {
    render(
      <ModernDetailPanel
        {...createProps({
          breadcrumbs: [{ label: 'Customers', onClick: vi.fn() }, { label: 'Acme Corp' }],
        })}
      />,
    );

    const current = screen.getByText('Acme Corp', { selector: '[data-part="breadcrumb-current"]' });
    expect(current).toHaveAttribute('aria-current', 'page');
  });

  it('announces the skeleton branch as busy', () => {
    const { container } = render(<ModernDetailPanel {...createProps()} loading />);

    const root = container.querySelector('[data-part="root"]');
    expect(root).toHaveAttribute('aria-busy', 'true');
  });
});
