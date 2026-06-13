/** @fileoverview BillingSurface integration tests -- subscription flow and payment methods. */

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BillingSurface } from '..';
import type { BillingSurfaceConfig } from '../../../../foundation/types';
import { renderSurface } from '../../../../foundation/common/test-utils';

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

function getText(container: HTMLElement): string {
  return container.textContent ?? '';
}

async function expectText(container: HTMLElement, text: string): Promise<void> {
  await waitFor(() => {
    expect(getText(container)).toContain(text);
  });
}

function countText(container: HTMLElement, text: string): number {
  return getText(container).split(text).length - 1;
}

function queryButton(container: HTMLElement, label: RegExp): HTMLButtonElement | undefined {
  return Array.from(container.querySelectorAll('button')).find((button) =>
    label.test(button.textContent ?? '')
  );
}

async function findButton(container: HTMLElement, label: RegExp): Promise<HTMLButtonElement> {
  let button: HTMLButtonElement | undefined;

  await waitFor(() => {
    button = queryButton(container, label);
    expect(button).toBeTruthy();
  });

  return button as HTMLButtonElement;
}

describe('BillingSurface integration', () => {
  describe('plan display', () => {
    it('renders plan name and price with interval', async () => {
      const { container } = renderSurface(<BillingSurface config={buildConfig()} />);
      await expectText(container, 'Enterprise');
      await expectText(container, '$299 / month');
    });

    it('renders all plan features', async () => {
      const { container } = renderSurface(<BillingSurface config={buildConfig()} />);
      await expectText(container, 'Unlimited users');
      await expectText(container, 'Priority support');
      await expectText(container, 'Custom integrations');
    });

    it('renders the chrome title and subtitle', async () => {
      const { container } = renderSurface(<BillingSurface config={buildConfig()} />);
      await expectText(container, 'Billing');
      await expectText(container, 'Manage your subscription');
    });
  });

  describe('usage bars', () => {
    it('renders all usage meters with labels', async () => {
      const { container } = renderSurface(<BillingSurface config={buildConfig()} />);
      await expectText(container, 'API Calls');
      await expectText(container, 'Storage');
      await expectText(container, 'Team Members');
    });

    it('renders usage values with current/limit format', async () => {
      const { container } = renderSurface(<BillingSurface config={buildConfig()} />);
      await expectText(container, '8500 / 10000 calls');
      await expectText(container, '45 / 100 GB');
      await expectText(container, '12 / 25 seats');
    });

    it('does not render usage section when usage is empty', async () => {
      const config = buildConfig({ behavior: { ...buildConfig().behavior, usage: [] } });
      const { container } = renderSurface(<BillingSurface config={config} />);
      await expectText(container, 'Enterprise');
      expect(getText(container)).not.toContain('Usage');
    });
  });

  describe('invoice list', () => {
    it('renders all invoices with dates and amounts', async () => {
      const { container } = renderSurface(<BillingSurface config={buildConfig()} />);
      await expectText(container, '2026-01-01');
      expect(getText(container)).toContain('2025-12-01');
      expect(getText(container)).toContain('2025-11-01');
      expect(countText(container, '$299.00')).toBe(2);
      expect(getText(container)).toContain('$149.00');
    });

    it('renders invoice statuses', async () => {
      const { container } = renderSurface(<BillingSurface config={buildConfig()} />);
      await expectText(container, 'paid');
      expect(countText(container, 'paid')).toBeGreaterThanOrEqual(2);
      expect(countText(container, 'pending')).toBeGreaterThanOrEqual(1);
    });

    it('renders download button for invoices with download URLs', async () => {
      const config = buildConfig();
      const { container } = renderSurface(<BillingSurface config={config} />);
      const downloadButton = await findButton(container, /download/i);
      fireEvent.click(downloadButton);
      expect(config.behavior.onDownloadInvoice).toHaveBeenCalledWith('inv-1');
    });

    it('does not render invoices section when empty', async () => {
      const config = buildConfig({ behavior: { ...buildConfig().behavior, invoices: [] } });
      const { container } = renderSurface(<BillingSurface config={config} />);
      await expectText(container, 'Enterprise');
      expect(getText(container)).not.toContain('Invoices');
    });
  });

  describe('payment methods', () => {
    it('renders payment methods with masked card numbers', async () => {
      const { container } = renderSurface(<BillingSurface config={buildConfig()} />);
      await expectText(container, '**** 4242');
      await expectText(container, '**** 5555');
    });

    it('shows card types', async () => {
      const { container } = renderSurface(<BillingSurface config={buildConfig()} />);
      await expectText(container, 'Visa');
      await expectText(container, 'Mastercard');
    });

    it('identifies the default payment method', async () => {
      const { container } = renderSurface(<BillingSurface config={buildConfig()} />);
      await expectText(container, 'Default');
    });
  });

  describe('actions', () => {
    it('fires upgrade callback', async () => {
      const config = buildConfig();
      const { container } = renderSurface(<BillingSurface config={config} />);
      const upgradeButton = await findButton(container, /upgrade/i);
      fireEvent.click(upgradeButton);
      expect(config.behavior.onUpgrade).toHaveBeenCalledTimes(1);
    });

    it('fires cancel callback', async () => {
      const config = buildConfig();
      const { container } = renderSurface(<BillingSurface config={config} />);
      const cancelButton = await findButton(container, /cancel/i);
      fireEvent.click(cancelButton);
      expect(config.behavior.onCancel).toHaveBeenCalledTimes(1);
    });

    it('does not render upgrade button when onUpgrade is not provided', async () => {
      const config = buildConfig({ behavior: { ...buildConfig().behavior, onUpgrade: undefined } });
      const { container } = renderSurface(<BillingSurface config={config} />);
      await expectText(container, 'Enterprise');
      expect(queryButton(container, /upgrade/i)).toBeUndefined();
    });

    it('does not render cancel button when onCancel is not provided', async () => {
      const config = buildConfig({ behavior: { ...buildConfig().behavior, onCancel: undefined } });
      const { container } = renderSurface(<BillingSurface config={config} />);
      await expectText(container, 'Enterprise');
      expect(queryButton(container, /cancel/i)).toBeUndefined();
    });
  });

  describe('tabs layout', () => {
    it('renders in tabs layout when configured', async () => {
      const config = buildConfig({ visual: { layout: 'tabs' } });
      const { container } = renderSurface(<BillingSurface config={config} />);
      await expectText(container, 'Enterprise');
    });
  });
});
