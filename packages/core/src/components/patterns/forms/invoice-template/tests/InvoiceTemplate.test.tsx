import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import type { StableEngineName } from '../../../../../_internal/testing/helpers/engine-test-utils';
import { STABLE_ENGINES, renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';
import type { InvoiceTemplateProps } from '../InvoiceTemplate.types';
import ClassicInvoiceTemplate from '../engines/classic';
import ModernInvoiceTemplate from '../engines/modern';
import RusticInvoiceTemplate from '../engines/rustic';

const COMPONENTS: Record<StableEngineName, React.ComponentType<InvoiceTemplateProps>> = {
  classic: ClassicInvoiceTemplate,
  modern: ModernInvoiceTemplate,
  rustic: RusticInvoiceTemplate,
};

function createProps(overrides: Partial<InvoiceTemplateProps> = {}): InvoiceTemplateProps {
  return {
    invoice: {
      number: 'INV-2026-001',
      date: '2026-03-14',
      dueDate: '2026-04-14',
      status: 'sent',
      company: {
        name: 'Rottay Inc.',
        address: '123 Main St',
        city: 'San Francisco',
        country: 'US',
        email: 'billing@rottay.com',
      },
      client: {
        name: 'Acme Corp',
        address: '456 Oak Ave',
        city: 'New York',
        email: 'accounts@acme.com',
      },
      items: [
        { id: 'i1', description: 'Platform License', quantity: 1, unitPrice: 500, total: 500 },
        { id: 'i2', description: 'Support Plan', quantity: 1, unitPrice: 100, total: 100 },
      ],
      subtotal: 600,
      tax: 60,
      taxRate: 10,
      total: 660,
      notes: 'Thank you for your business.',
    },
    ...overrides,
  };
}

describe('PatternInvoiceTemplate', () => {
  it.each(STABLE_ENGINES)(
    'renders invoice number and company name with the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByText('INV-2026-001')).toBeInTheDocument();
      expect(screen.getByText('Rottay Inc.')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'renders client name with the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'renders line items with the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByText('Platform License')).toBeInTheDocument();
      expect(screen.getByText('Support Plan')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'renders totals with the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByText('$600.00')).toBeInTheDocument();
      expect(screen.getByText('$60.00')).toBeInTheDocument();
      expect(screen.getByText('$660.00')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'renders notes section with the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByText('Thank you for your business.')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'renders print and export buttons when handlers provided in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onPrint = vi.fn();
      const onExport = vi.fn();
      renderWithEngine(
        <Component {...createProps({ onPrint, onExport })} />,
        engine,
      );

      expect(screen.getByText('Print')).toBeInTheDocument();
      expect(screen.getByText('Export')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Print'));
      expect(onPrint).toHaveBeenCalled();
    },
  );

  it.each(STABLE_ENGINES)(
    'renders status badge with the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByText('SENT')).toBeInTheDocument();
    },
  );
});
