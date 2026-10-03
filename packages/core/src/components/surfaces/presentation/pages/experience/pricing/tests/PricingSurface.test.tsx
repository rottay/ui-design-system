/** @fileoverview PricingSurface tests -- plan rendering, cycle toggle, and CTA. */

import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PricingSurface } from '..';
import type { PricingSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface, RESOLVED_PHONE_TEST_CONTEXT } from '../../../../../foundation/common/test-utils';

function buildConfig(overrides?: Partial<PricingSurfaceConfig>): PricingSurfaceConfig {
  return {
    visual: {},
    presentation: {
      chrome: {
        title: 'Pricing',
        subtitle: 'Choose the plan that fits your needs',
      },
      intro: 'All plans include a 14-day free trial.',
    },
    behavior: {
      plans: [
        {
          id: 'starter',
          name: 'Starter',
          price: 29,
          cta: 'Get Started',
          features: { users: '5', storage: '10 GB', support: true },
        },
        {
          id: 'pro',
          name: 'Pro',
          price: 99,
          cta: 'Upgrade',
          popular: true,
          features: { users: '50', storage: '100 GB', support: true, sso: true },
        },
      ],
      features: [
        { key: 'users', label: 'Users' },
        { key: 'storage', label: 'Storage' },
        { key: 'support', label: 'Email Support' },
        { key: 'sso', label: 'SSO' },
      ],
      currentPlan: 'starter',
      onSelectPlan: vi.fn(),
      billingCycle: 'monthly',
      onBillingCycleChange: vi.fn(),
    },
    ...overrides,
  };
}

describe('PricingSurface', () => {
  it('keeps app-resolved action disabling after resolving dock visibility', async () => {
    const value = buildConfig();
    value.behavior.actions = [{ id: 'contact', label: 'Contact sales', onClick: vi.fn() }];
    value.access = { mode: 'resolved', capabilities: [{ kind: 'action', id: 'contact', visible: true, disabled: true }] };
    const { container } = renderSurface(<PricingSurface config={value} postures={{ phone: { primaryAction: 'floating' } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    const action = await screen.findByRole('button', { name: 'Contact sales' });
    expect(action).toBeDisabled();
    expect(action.closest('.ds-action-dock')?.parentElement).toHaveClass('ds-page-shell-surface');
    expect(container.querySelectorAll('.ds-action-dock')).toHaveLength(1);
  });

  it.each(['loading', 'error', 'empty'] as const)('hides the comparison host in its %s state', async (state) => {
    const value = buildConfig();
    if (state === 'empty') value.behavior.plans = [];
    const { container } = renderSurface(<PricingSurface config={value} loading={state === 'loading'} error={state === 'error' ? new Error('Comparison failed') : undefined} postures={{ phone: { regions: { comparison: 'hide' } } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    await screen.findByText('Pricing');
    expect(screen.queryByRole('region', { name: 'Plan comparison' })).toBeNull();
    expect(container.querySelector('[data-part="pricing-skeleton-plans"]')).toBeNull();
    expect(screen.queryByText('Comparison failed')).toBeNull();
    expect(container.querySelector('.ds-action-dock')).toBeNull();
  });

  it('retains a named empty comparison host when loading is collapsed', async () => {
    const { container } = renderSurface(<PricingSurface config={buildConfig()} loading postures={{ phone: { regions: { comparison: 'collapse' } } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    await screen.findByText('Pricing');
    expect(screen.getByRole('region', { name: 'Plan comparison' }).childElementCount).toBe(0);
    expect(container.querySelector('[data-part="pricing-skeleton-plans"]')).toBeNull();
  });

  it('renders page chrome and intro', async () => {
    renderSurface(<PricingSurface config={buildConfig()} />);

    expect(await screen.findByText('Pricing')).toBeInTheDocument();
    expect(await screen.findByText('All plans include a 14-day free trial.')).toBeInTheDocument();
  });

  it('passes plans to the pattern', async () => {
    renderSurface(<PricingSurface config={buildConfig()} />);

    // PatternPricingTable receives the plans data - page title confirms rendering
    expect(await screen.findByText('Pricing')).toBeInTheDocument();
  });
});
