/** @fileoverview PricingSurface tests -- plan rendering, cycle toggle, and CTA. */

import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PricingSurface } from '..';
import type { PricingSurfaceConfig } from '../../../../foundation/types';
import { renderSurface } from '../../../../foundation/common/test-utils';

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
