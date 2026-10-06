import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  it("renders an onClick-only ancestor crumb as the Breadcrumb primitive's native button, operable from the keyboard", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ModernDetailPanel
        {...createProps({
          breadcrumbs: [{ label: 'Customers', onClick }, { label: 'Acme Corp' }],
        })}
      />,
    );

    const crumb = screen.getByRole('button', { name: 'Customers' });
    expect(crumb.tagName).toBe('BUTTON');
    expect(crumb).toHaveAttribute('type', 'button');
    expect(crumb).toHaveAttribute('data-part', 'crumb');
    expect(crumb.closest('[data-part="breadcrumbs"] nav.ds-breadcrumb.ds-breadcrumb--modern')).not.toBeNull();

    crumb.focus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);

    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('exposes one breadcrumb navigation landmark, named by the primitive', () => {
    render(
      <ModernDetailPanel
        {...createProps({
          breadcrumbs: [{ label: 'Customers', onClick: vi.fn() }, { label: 'Acme Corp' }],
        })}
      />,
    );

    const landmarks = screen.getAllByRole('navigation', { name: 'Breadcrumb' });
    expect(landmarks).toHaveLength(1);
    expect(landmarks[0]!.closest('[data-part="breadcrumbs"]')).not.toBeNull();
  });

  it('marks the trailing crumb as the current page', () => {
    render(
      <ModernDetailPanel
        {...createProps({
          breadcrumbs: [{ label: 'Customers', onClick: vi.fn() }, { label: 'Acme Corp' }],
        })}
      />,
    );

    const current = screen
      .getByText('Acme Corp', { selector: '[data-part="breadcrumbs"] [data-part="label"]' })
      .closest('[data-part="crumb"]');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current?.tagName).not.toBe('BUTTON');
  });

  it('announces the skeleton branch as busy', () => {
    const { container } = render(<ModernDetailPanel {...createProps()} loading />);

    const root = container.querySelector('[data-part="root"]');
    expect(root).toHaveAttribute('aria-busy', 'true');
  });
});
