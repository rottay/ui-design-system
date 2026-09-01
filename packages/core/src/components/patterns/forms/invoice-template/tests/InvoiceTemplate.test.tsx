import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import type { StableEngineName } from '@tests/support/engine';
import { STABLE_ENGINES, renderWithEngine } from '@tests/support/engine';
import type { InvoiceTemplateProps } from '../contracts';
import ClassicInvoiceTemplate from '../engines/classic';
import ModernInvoiceTemplate from '../engines/modern';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import RusticInvoiceTemplate from '../engines/rustic';

const COMPONENTS: Record<StableEngineName, React.ComponentType<InvoiceTemplateProps>> = {
  classic: ClassicInvoiceTemplate,
  modern: ModernInvoiceTemplate,
  rustic: RusticInvoiceTemplate,
};

const here = dirname(fileURLToPath(import.meta.url));
const modernSkin = readFileSync(
  join(
    here,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/invoice-template/index.css',
  ),
  'utf8',
);

/** Returns the body of the first at-rule block matching `prelude`. */
function atRuleBody(css: string, prelude: string): string {
  const start = css.indexOf(prelude);
  if (start < 0) throw new Error(`missing at-rule: ${prelude}`);
  let depth = 0;
  for (let i = css.indexOf('{', start); i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    else if (css[i] === '}') {
      depth -= 1;
      if (depth === 0) return css.slice(css.indexOf('{', start) + 1, i);
    }
  }
  throw new Error(`unterminated at-rule: ${prelude}`);
}

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
      taxRate: 0.1,
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

  it('renders a decimal tax rate as a whole percentage with the modern engine', () => {
    const base = createProps().invoice;
    renderWithEngine(
      <ModernInvoiceTemplate invoice={{ ...base, taxRate: 0.21 }} />,
      'modern',
    );

    expect(screen.getByText('Tax (21%)')).toBeInTheDocument();
  });

  it('renders a party country when no city is supplied with the modern engine', () => {
    const base = createProps().invoice;
    renderWithEngine(
      <ModernInvoiceTemplate
        invoice={{
          ...base,
          company: { name: 'Rottay Inc.', country: 'Portugal' },
          client: { name: 'Acme Corp', country: 'Brazil' },
        }}
      />,
      'modern',
    );

    expect(screen.getByText('Portugal')).toBeInTheDocument();
    expect(screen.getByText('Brazil')).toBeInTheDocument();
  });

  it('renders a company phone with the modern engine', () => {
    const base = createProps().invoice;
    renderWithEngine(
      <ModernInvoiceTemplate
        invoice={{ ...base, company: { name: 'Rottay Inc.', phone: '+1 (555) 123-4567' } }}
      />,
      'modern',
    );

    expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument();
  });

  it('formats currency through the active locale, not the host default', async () => {
    const { render } = await import('@testing-library/react');
    const base = createProps();
    const { container } = render(
      <I18nProvider locale="fr" fallbackLocale="fr">
        <ModernInvoiceTemplate
          invoice={{ ...base.invoice, currency: 'EUR', total: 1234.5 }}
        />
      </I18nProvider>,
    );

    // Source-bound: the rendered total must match what Intl produces for fr/EUR,
    // so a regression to the host locale or the '$' floor fails here.
    const expected = new Intl.NumberFormat('fr', { style: 'currency', currency: 'EUR' }).format(1234.5);
    const norm = (v: string) => v.replace(/\s/g, ' ').trim();
    const values = [...container.querySelectorAll('[data-part="totals-value"]')].map((el) =>
      norm(el.textContent ?? ''),
    );
    expect(values).toContain(norm(expected));
    expect(norm(expected)).not.toContain('$');
  });

  it.each(STABLE_ENGINES)('renders a decimal taxRate as a whole percent in the %s engine', (engine) => {
    const Component = COMPONENTS[engine as StableEngineName];
    const base = createProps();
    renderWithEngine(
      <Component invoice={{ ...base.invoice, taxRate: 0.21 }} />,
      engine as StableEngineName,
    );

    expect(screen.getByText((_, el) => el?.textContent?.trim() === 'Tax (21%)')).toBeInTheDocument();
  });
});

describe('PatternInvoiceTemplate modern document-table reachability', () => {
  it('exposes the horizontally scrollable line-item region as a named tab stop', () => {
    const { container } = renderWithEngine(
      <ModernInvoiceTemplate {...createProps()} />,
      'modern',
    );

    const wrapper = container.querySelector('[data-part="items-table-wrapper"]');
    expect(wrapper).not.toBeNull();

    // The wrapper is the scroll container and holds no focusable descendant,
    // so without its own tab stop the amount columns are keyboard-unreachable
    // on any composition where the document table overflows.
    expect(wrapper).toHaveAttribute('tabindex', '0');
    expect(wrapper?.querySelectorAll('a,button,input,select,textarea,[tabindex]')).toHaveLength(0);

    // A tab stop must be named, and the name must be the localized caption
    // already on the table -- not a second, untranslated string.
    const labelledBy = wrapper?.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    const caption = container.querySelector(`#${CSS.escape(labelledBy as string)}`);
    expect(caption?.tagName).toBe('CAPTION');
    expect(caption?.textContent).toBe('Invoice');

    (wrapper as HTMLElement).focus();
    expect(document.activeElement).toBe(wrapper);
  });

  it('gives the new tab stop the canonical focus ring in the modern skin', () => {
    expect(modernSkin).toContain(
      ".ds-pattern-invoice-template.ds-engine-modern [data-part='items-table-wrapper']:focus-visible",
    );
    expect(modernSkin).toContain('var(--ds-focus-ring-color, var(--ds-color-primary))');
  });

  it('releases the table scroll clip on paper so no amount column is lost in print', () => {
    const print = atRuleBody(modernSkin, '@media print');

    // Paper cannot scroll: `overflow-x: auto` silently truncates every column
    // past the page box, and the amount columns are last in reading order.
    expect(print).toMatch(
      /\[data-part='items-table-wrapper'\]\s*\{[^}]*overflow-x:\s*visible/,
    );
    // The screen elevation is not a paper material.
    expect(print).toMatch(/\[data-loading='false'\]\s*\{[^}]*box-shadow:\s*none/);
  });

  it('wraps unbroken party tokens instead of pushing them past the document frame', () => {
    // `min-inline-size: auto` on the header flex items resolves to min-content,
    // so a long billing email or URL-shaped client name overflows the card.
    expect(modernSkin).toMatch(
      /\[data-part='company'\],\s*\n?[^{]*\[data-part='metadata'\]\s*\{[^}]*min-inline-size:\s*0/,
    );
    expect(modernSkin).toMatch(
      /\[data-part='client-address-line'\]\s*\{\s*overflow-wrap:\s*anywhere/,
    );
  });
});
