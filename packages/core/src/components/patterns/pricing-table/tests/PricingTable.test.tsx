import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import type { StableEngineName } from '../../../../testing/helpers/engine-test-utils';
import { STABLE_ENGINES, renderWithEngine } from '../../../../testing/helpers/engine-test-utils';
import type { PricingTableProps } from '../PricingTable.types';
import ClassicPricingTable from '../engines/classic';
import ModernPricingTable from '../engines/modern';
import RusticPricingTable from '../engines/rustic';

const COMPONENTS: Record<StableEngineName, React.ComponentType<PricingTableProps>> = {
  classic: ClassicPricingTable,
  modern: ModernPricingTable,
  rustic: RusticPricingTable,
};

function createProps(overrides: Partial<PricingTableProps> = {}): PricingTableProps {
  return {
    plans: [
      { id: 'free', name: 'Free', price: 0, cta: 'Get Started', features: { storage: '1 GB', users: '1', api: false, support: false } },
      { id: 'pro', name: 'Pro', price: 29, cta: 'Upgrade', popular: true, features: { storage: '100 GB', users: '10', api: true, support: true } },
      { id: 'enterprise', name: 'Enterprise', price: 99, cta: 'Contact Us', features: { storage: 'Unlimited', users: 'Unlimited', api: true, support: true } },
    ],
    features: [
      { key: 'storage', label: 'Storage' },
      { key: 'users', label: 'Team Members' },
      { key: 'api', label: 'API Access' },
      { key: 'support', label: 'Priority Support' },
    ],
    ...overrides,
  };
}

describe('PatternPricingTable', () => {
  it.each(STABLE_ENGINES)(
    'renders plan names with the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByText('Free')).toBeInTheDocument();
      expect(screen.getByText('Pro')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'renders feature labels with the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByText('Storage')).toBeInTheDocument();
      expect(screen.getByText('Team Members')).toBeInTheDocument();
      expect(screen.getByText('API Access')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'renders CTA buttons with the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByText('Get Started')).toBeInTheDocument();
      expect(screen.getByText('Upgrade')).toBeInTheDocument();
      expect(screen.getByText('Contact Us')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'fires onSelectPlan when CTA is clicked in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onSelectPlan = vi.fn();
      renderWithEngine(
        <Component {...createProps({ onSelectPlan })} />,
        engine,
      );

      fireEvent.click(screen.getByText('Upgrade'));
      expect(onSelectPlan).toHaveBeenCalledWith('pro');
    },
  );

  it.each(STABLE_ENGINES)(
    'shows popular badge in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByText('Most Popular')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'renders feature values as text in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByText('1 GB')).toBeInTheDocument();
      expect(screen.getByText('100 GB')).toBeInTheDocument();
      expect(screen.getAllByText('Unlimited')).toHaveLength(2);
    },
  );

  it.each(STABLE_ENGINES)(
    'renders loading state in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const { container } = renderWithEngine(<Component {...createProps({ loading: true })} />, engine);

      if (engine === 'modern') {
        expect(container.querySelector('.loading-spinner')).toBeTruthy();
        return;
      }

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'switches billing cycle and honors custom headers in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onBillingCycleChange = vi.fn();

      renderWithEngine(
        <Component
          {...createProps({
            billingCycle: 'monthly',
            onBillingCycleChange,
            renderPlanHeader: (plan) => <div data-testid={`custom-header-${plan.id}`}>{plan.name} header</div>,
          })}
        />,
        engine,
      );

      expect(screen.getByTestId('custom-header-free')).toBeInTheDocument();
      expect(screen.queryByText('Most Popular')).not.toBeInTheDocument();

      const billingToggle = screen.getByRole(engine === 'classic' ? 'switch' : 'checkbox');
      fireEvent.click(billingToggle);
      expect(onBillingCycleChange).toHaveBeenCalledWith('yearly');
    },
  );
});
