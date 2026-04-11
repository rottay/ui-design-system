import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { StableEngineName } from '../../../../../_internal/testing/helpers/engine-test-utils';
import { STABLE_ENGINES } from '../../../../../_internal/testing/helpers/engine-test-utils';
import type { DetailPanelProps } from '../DetailPanel.types';
import ClassicDetailPanel from '../engines/classic';
import ModernDetailPanel from '../engines/modern';
import RusticDetailPanel from '../engines/rustic';

type Customer = { id: string };

const COMPONENTS: Record<StableEngineName, React.ComponentType<DetailPanelProps<Customer>>> = {
  classic: ClassicDetailPanel,
  modern: ModernDetailPanel,
  rustic: RusticDetailPanel,
};

function createProps(overrides: Partial<DetailPanelProps<Customer>> = {}): DetailPanelProps<Customer> {
  return {
    data: { id: 'customer-1' },
    title: 'Acme Corp',
    subtitle: 'Enterprise customer',
    avatar: <div>AV</div>,
    status: { label: 'Active', color: '#16a34a' },
    breadcrumbs: [
      { label: 'Customers', onClick: vi.fn() },
      { label: 'Acme Corp' },
    ],
    tabs: [
      { key: 'overview', label: 'Overview', content: <div>Overview tab</div>, badge: 3 },
      { key: 'billing', label: 'Billing', content: <div>Billing tab</div> },
      { key: 'history', label: 'History', content: <div>History tab</div>, disabled: true },
    ],
    actions: [
      { key: 'edit', label: 'Edit', variant: 'primary', onClick: vi.fn() },
      { key: 'archive', label: 'Archive', variant: 'danger', onClick: vi.fn(), loading: true },
      { key: 'more', label: 'More', variant: 'ghost', onClick: vi.fn(), disabled: true },
    ],
    onTabChange: vi.fn(),
    onBack: vi.fn(),
    headerExtra: <div>Header extra</div>,
    sidebar: <div>Sidebar content</div>,
    sidebarPosition: 'left',
    footer: <div>Footer content</div>,
    ...overrides,
  };
}

describe('PatternDetailPanel advanced engine coverage', () => {
  it.each(STABLE_ENGINES)('covers loading states through the %s engine', (engine) => {
    const Component = COMPONENTS[engine];

    render(<Component {...createProps()} loading />);

    expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument();
  });

  it.each(STABLE_ENGINES)('covers breadcrumbs, back navigation, actions, tabs, sidebar and footer through the %s engine', (engine) => {
    const Component = COMPONENTS[engine];
    const props = createProps();

    const { rerender } = render(<Component {...props} />);

    expect(screen.getAllByText('Acme Corp')).toHaveLength(2);
    expect(screen.getByText('Enterprise customer')).toBeInTheDocument();
    expect(screen.getByText('Header extra')).toBeInTheDocument();
    expect(screen.getByText('Sidebar content')).toBeInTheDocument();
    expect(screen.getByText('Footer content')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Customers'));
    expect(props.breadcrumbs?.[0].onClick).toHaveBeenCalled();

    const backButtons = screen.getAllByRole('button');
    fireEvent.click(backButtons[0]);
    expect(props.onBack).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Edit'));
    expect(props.actions?.[0].onClick).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Billing'));
    expect(props.onTabChange).toHaveBeenCalledWith('billing');
    expect(screen.getByText('Billing tab')).toBeInTheDocument();

    fireEvent.click(screen.getByText('History'));
    expect(screen.queryByText('History tab')).not.toBeInTheDocument();

    rerender(
      <Component
        {...createProps({
          activeTab: 'overview',
          sidebarPosition: 'right',
        })}
      />
    );

    expect(screen.getByText('Overview tab')).toBeInTheDocument();
  });
});
