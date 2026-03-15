import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BillingSurface } from '.';
import type { BillingSurfaceConfig } from '../types';
import { renderSurface } from '../common/test-utils';

function buildConfig(overrides?: Partial<BillingSurfaceConfig>): BillingSurfaceConfig {
  return {
    visual: {
      layout: 'sections',
    },
    presentation: {
      chrome: {
        title: 'Billing',
        subtitle: 'Manage your subscription',
      },
    },
    behavior: {
      currentPlan: {
        name: 'Enterprise',
        price: '$299',
        interval: 'month',
        features: ['Unlimited users', 'Priority support', 'Custom integrations'],
      },
      usage: [
        { label: 'API Calls', current: 8500, limit: 10000, unit: 'calls' },
        { label: 'Storage', current: 45, limit: 100, unit: 'GB' },
      ],
      invoices: [
        { id: 'inv-1', date: '2026-01-01', amount: '$299.00', status: 'paid', downloadUrl: '/invoices/1.pdf' },
        { id: 'inv-2', date: '2025-12-01', amount: '$299.00', status: 'paid' },
      ],
      paymentMethods: [
        { id: 'pm-1', type: 'Visa', last4: '4242', expiry: '12/28', isDefault: true },
      ],
      onUpgrade: vi.fn(),
      onCancel: vi.fn(),
      onDownloadInvoice: vi.fn(),
    },
    ...overrides,
  };
}

describe('BillingSurface', () => {
  it('renders plan details, usage, invoices, and payment methods', async () => {
    renderSurface(<BillingSurface config={buildConfig()} />);

    expect(await screen.findByText('Billing')).toBeInTheDocument();
    expect(await screen.findByText('Enterprise')).toBeInTheDocument();
    expect(await screen.findByText('$299 / month')).toBeInTheDocument();
    expect(await screen.findByText('Unlimited users')).toBeInTheDocument();
    expect(await screen.findByText('API Calls')).toBeInTheDocument();
    expect(await screen.findByText('2026-01-01')).toBeInTheDocument();
    expect(await screen.findByText('**** 4242')).toBeInTheDocument();
  });

  it('fires upgrade and cancel actions', async () => {
    const config = buildConfig();

    renderSurface(<BillingSurface config={config} />);

    const upgradeButton = await screen.findByRole('button', { name: /upgrade/i });
    fireEvent.click(upgradeButton);
    expect(config.behavior.onUpgrade).toHaveBeenCalledTimes(1);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    expect(config.behavior.onCancel).toHaveBeenCalledTimes(1);
  });
});
