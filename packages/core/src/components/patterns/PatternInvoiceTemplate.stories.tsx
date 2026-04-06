import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { PatternInvoiceTemplate } from './invoice-template';
import { createSurfaceStoryDecorator } from '../surfaces/common/story-helpers';

const meta: Meta<typeof PatternInvoiceTemplate> = {
  title: 'Patterns/InvoiceTemplate',
  component: PatternInvoiceTemplate,
  decorators: [createSurfaceStoryDecorator({ productProfile: 'events.organizer', engine: 'rustic' })],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof PatternInvoiceTemplate>;

export const Default: Story = {
  args: {
    invoice: {
      number: 'INV-2026-0042',
      date: 'March 14, 2026',
      dueDate: 'April 14, 2026',
      status: 'sent',
      company: {
        name: 'Rottay Inc.',
        address: '123 Innovation Blvd',
        city: 'San Francisco, CA 94105',
        country: 'United States',
        taxId: 'US-12345678',
        email: 'billing@rottay.com',
        phone: '+1 (555) 123-4567',
      },
      client: {
        name: 'Acme Corporation',
        address: '456 Enterprise Ave, Suite 200',
        city: 'New York, NY 10001',
        country: 'United States',
        taxId: 'US-87654321',
        email: 'accounts@acme.com',
      },
      items: [
        { id: '1', description: 'Platform License - Enterprise', quantity: 1, unitPrice: 2400, total: 2400 },
        { id: '2', description: 'Premium Support Plan (Annual)', quantity: 1, unitPrice: 600, total: 600 },
        { id: '3', description: 'Custom Integration Setup', quantity: 3, unitPrice: 150, total: 450 },
        { id: '4', description: 'Training Sessions (2h each)', quantity: 5, unitPrice: 200, total: 1000 },
      ],
      subtotal: 4450,
      tax: 445,
      taxRate: 10,
      total: 4895,
      currency: '$',
      notes: 'Payment is due within 30 days of invoice date.\nPlease include the invoice number in your payment reference.\n\nThank you for your business!',
    },
    onPrint: () => window.print(),
    onExport: () => console.log('Export clicked'),
  },
};

export const Paid: Story = {
  args: {
    ...Default.args,
    invoice: {
      ...Default.args!.invoice!,
      status: 'paid',
    },
  },
};
