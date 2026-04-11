/** @fileoverview BillingSurface integration tests -- subscription flow and payment methods. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BillingSurface } from '.';
import type { BillingSurfaceConfig } from '../../../foundation/types';
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
        { label: 'Team Members', current: 12, limit: 25, unit: 'seats' },
      ],
      invoices: [
        { id: 'inv-1', date: '2026-01-01', amount: '$299.00', status: 'paid', downloadUrl: '/invoices/1.pdf' },
        { id: 'inv-2', date: '2025-12-01', amount: '$299.00', status: 'paid' },
        { id: 'inv-3', date: '2025-11-01', amount: '$149.00', status: 'pending' },
      ],
      paymentMethods: [
        { id: 'pm-1', type: 'Visa', last4: '4242', expiry: '12/28', isDefault: true },
        { id: 'pm-2', type: 'Mastercard', last4: '5555', expiry: '06/27', isDefault: false },
      ],
      onUpgrade: vi.fn(),
      onCancel: vi.fn(),
      onDownloadInvoice: vi.fn(),
    },
    ...overrides,
  };
}

describe('BillingSurface integration', () => {
  describe('plan display', () => {
    it('renders plan name and price with interval', async () => {
      renderSurface(<BillingSurface config={buildConfig()} />);
      expect(await screen.findByText('Enterprise')).toBeInTheDocument();
      expect(await screen.findByText('$299 / month')).toBeInTheDocument();
    });

    it('renders all plan features', async () => {
      renderSurface(<BillingSurface config={buildConfig()} />);
      expect(await screen.findByText('Unlimited users')).toBeInTheDocument();
      expect(await screen.findByText('Priority support')).toBeInTheDocument();
      expect(await screen.findByText('Custom integrations')).toBeInTheDocument();
    });

    it('renders the chrome title and subtitle', async () => {
      renderSurface(<BillingSurface config={buildConfig()} />);
      expect(await screen.findByText('Billing')).toBeInTheDocument();
      expect(await screen.findByText('Manage your subscription')).toBeInTheDocument();
    });
  });

  describe('usage bars', () => {
    it('renders all usage meters with labels', async () => {
      renderSurface(<BillingSurface config={buildConfig()} />);
      expect(await screen.findByText('API Calls')).toBeInTheDocument();
      expect(await screen.findByText('Storage')).toBeInTheDocument();
      expect(await screen.findByText('Team Members')).toBeInTheDocument();
    });

    it('renders usage values with current/limit format', async () => {
      renderSurface(<BillingSurface config={buildConfig()} />);
      expect(await screen.findByText('8500 / 10000 calls')).toBeInTheDocument();
      expect(await screen.findByText('45 / 100 GB')).toBeInTheDocument();
      expect(await screen.findByText('12 / 25 seats')).toBeInTheDocument();
    });

    it('does not render usage section when usage is empty', async () => {
      const config = buildConfig({ behavior: { ...buildConfig().behavior, usage: [] } });
      renderSurface(<BillingSurface config={config} />);
      expect(await screen.findByText('Enterprise')).toBeInTheDocument();
      expect(screen.queryByText('Usage')).not.toBeInTheDocument();
    });
  });

  describe('invoice list', () => {
    it('renders all invoices with dates and amounts', async () => {
      renderSurface(<BillingSurface config={buildConfig()} />);
      expect(await screen.findByText('2026-01-01')).toBeInTheDocument();
      expect(await screen.findByText('2025-12-01')).toBeInTheDocument();
      expect(await screen.findByText('2025-11-01')).toBeInTheDocument();
      const amountElements = await screen.findAllByText('$299.00');
      expect(amountElements.length).toBe(2);
      expect(await screen.findByText('$149.00')).toBeInTheDocument();
    });

    it('renders invoice statuses', async () => {
      renderSurface(<BillingSurface config={buildConfig()} />);
      const paidElements = await screen.findAllByText('paid');
      expect(paidElements.length).toBeGreaterThanOrEqual(2);
      const pendingElements = await screen.findAllByText('pending');
      expect(pendingElements.length).toBeGreaterThanOrEqual(1);
    });

    it('renders download button for invoices with download URLs', async () => {
      const config = buildConfig();
      renderSurface(<BillingSurface config={config} />);
      const downloadButtons = await screen.findAllByRole('button', { name: /download/i });
      expect(downloadButtons.length).toBeGreaterThanOrEqual(1);
      fireEvent.click(downloadButtons[0]);
      expect(config.behavior.onDownloadInvoice).toHaveBeenCalledWith('inv-1');
    });

    it('does not render invoices section when empty', async () => {
      const config = buildConfig({ behavior: { ...buildConfig().behavior, invoices: [] } });
      renderSurface(<BillingSurface config={config} />);
      expect(await screen.findByText('Enterprise')).toBeInTheDocument();
      expect(screen.queryByText('Invoices')).not.toBeInTheDocument();
    });
  });

  describe('payment methods', () => {
    it('renders payment methods with masked card numbers', async () => {
      renderSurface(<BillingSurface config={buildConfig()} />);
      expect(await screen.findByText('**** 4242')).toBeInTheDocument();
      expect(await screen.findByText('**** 5555')).toBeInTheDocument();
    });

    it('shows card types', async () => {
      renderSurface(<BillingSurface config={buildConfig()} />);
      expect(await screen.findByText('Visa')).toBeInTheDocument();
      expect(await screen.findByText('Mastercard')).toBeInTheDocument();
    });

    it('identifies the default payment method', async () => {
      renderSurface(<BillingSurface config={buildConfig()} />);
      expect(await screen.findByText('Default')).toBeInTheDocument();
    });
  });

  describe('actions', () => {
    it('fires upgrade callback', async () => {
      const config = buildConfig();
      renderSurface(<BillingSurface config={config} />);
      const upgradeButton = await screen.findByRole('button', { name: /upgrade/i });
      fireEvent.click(upgradeButton);
      expect(config.behavior.onUpgrade).toHaveBeenCalledTimes(1);
    });

    it('fires cancel callback', async () => {
      const config = buildConfig();
      renderSurface(<BillingSurface config={config} />);
      const cancelButton = await screen.findByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);
      expect(config.behavior.onCancel).toHaveBeenCalledTimes(1);
    });

    it('does not render upgrade button when onUpgrade is not provided', async () => {
      const config = buildConfig({ behavior: { ...buildConfig().behavior, onUpgrade: undefined } });
      renderSurface(<BillingSurface config={config} />);
      expect(await screen.findByText('Enterprise')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /upgrade/i })).not.toBeInTheDocument();
    });

    it('does not render cancel button when onCancel is not provided', async () => {
      const config = buildConfig({ behavior: { ...buildConfig().behavior, onCancel: undefined } });
      renderSurface(<BillingSurface config={config} />);
      expect(await screen.findByText('Enterprise')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });
  });

  describe('tabs layout', () => {
    it('renders in tabs layout when configured', async () => {
      const config = buildConfig({ visual: { layout: 'tabs' } });
      renderSurface(<BillingSurface config={config} />);
      expect(await screen.findByText('Enterprise')).toBeInTheDocument();
    });
  });
});
