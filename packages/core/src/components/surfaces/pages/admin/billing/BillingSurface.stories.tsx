/** @fileoverview BillingSurface Storybook stories. */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { BillingSurface } from '.';
import { createSurfaceStoryDecorator } from '../common/story-helpers';

const meta: Meta<typeof BillingSurface> = {
  title: 'Surfaces/BillingSurface',
  component: BillingSurface,
  decorators: [
    createSurfaceStoryDecorator({
      productProfile: 'events.organizer',
      engine: 'rustic',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Subscription management surface with plan overview, usage meters, invoices, ' +
          'and payment methods. Supports tabbed and sectioned layouts.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BillingSurface>;

const basePlan = {
  name: 'Professional',
  price: '$49',
  interval: 'month',
  features: [
    'Unlimited events',
    '500 attendees per event',
    'Advanced analytics',
    'Custom branding',
  ],
};

const sampleUsage = [
  { label: 'Events', current: 12, limit: 50, unit: 'events' },
  { label: 'Storage', current: 3200, limit: 5000, unit: 'MB' },
  { label: 'API Calls', current: 8400, limit: 10000, unit: 'calls' },
];

const sampleInvoices = [
  { id: 'inv-1', date: 'Mar 1, 2026', amount: '$49.00', status: 'paid', downloadUrl: '#' },
  { id: 'inv-2', date: 'Feb 1, 2026', amount: '$49.00', status: 'paid', downloadUrl: '#' },
  { id: 'inv-3', date: 'Jan 1, 2026', amount: '$49.00', status: 'paid', downloadUrl: '#' },
  { id: 'inv-4', date: 'Dec 1, 2025', amount: '$29.00', status: 'paid', downloadUrl: '#' },
];

const samplePaymentMethods = [
  { id: 'pm-1', type: 'Visa', last4: '4242', expiry: '12/28', isDefault: true },
  { id: 'pm-2', type: 'Mastercard', last4: '8888', expiry: '06/27', isDefault: false },
];

export const Default: Story = {
  args: {
    config: {
      visual: { layout: 'sections' },
      presentation: {
        chrome: { title: 'Billing & Subscription', subtitle: 'Manage your plan and payment details' },
      },
      behavior: {
        currentPlan: basePlan,
        usage: sampleUsage,
        invoices: sampleInvoices,
        paymentMethods: samplePaymentMethods,
        onUpgrade: () => console.log('Upgrade clicked'),
        onCancel: () => console.log('Cancel clicked'),
        onDownloadInvoice: (id) => console.log('Download invoice:', id),
      },
    },
  },
};

export const TabbedLayout: Story = {
  args: {
    config: {
      visual: { layout: 'tabs' },
      presentation: {
        chrome: { title: 'Billing & Subscription', subtitle: 'Tabbed view' },
      },
      behavior: {
        currentPlan: basePlan,
        usage: sampleUsage,
        invoices: sampleInvoices,
        paymentMethods: samplePaymentMethods,
        onUpgrade: () => console.log('Upgrade clicked'),
        onDownloadInvoice: (id) => console.log('Download invoice:', id),
      },
    },
  },
};

export const PlanOnly: Story = {
  args: {
    config: {
      visual: { layout: 'sections' },
      presentation: {
        chrome: { title: 'Your Plan' },
      },
      behavior: {
        currentPlan: {
          name: 'Starter',
          price: 'Free',
          interval: 'forever',
          features: ['5 events', '50 attendees per event'],
        },
        onUpgrade: () => console.log('Upgrade clicked'),
      },
    },
  },
};
