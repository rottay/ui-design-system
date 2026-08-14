import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { ColumnDef } from '@/foundation/contracts/runtime/components/patterns/core';
import type { SupportedLocale } from '@/foundation/i18n/kernel/contracts';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernDataTable from '../engines/modern';

interface Row {
  id: number;
  name: string;
}

const columns: ColumnDef<Row>[] = [{ key: 'name', header: 'Name', accessorKey: 'name' }];
const data: Row[] = [{ id: 1, name: 'Ada' }];

/** Renders the built-in pagination range floor under a given catalog locale. */
function renderRange(locale: SupportedLocale) {
  const { container } = render(
    <I18nProvider locale={locale} fallbackLocale={locale}>
      <ModernDataTable<Row>
        columns={columns}
        data={data}
        rowKey="id"
        /* Page 13 of 1000-row pages: every number in the range is 5+ digits,
           so it groups in both locales (es needs 5 to group, en needs 4). */
        pagination={{
          current: 13,
          pageSize: 1000,
          total: 1234567,
          onChange: () => {},
        }}
      />
    </I18nProvider>,
  );
  return container.querySelector('[data-part="pagination-range"]')?.textContent ?? '';
}

describe('PatternDataTable modern — pagination range follows the active catalog', () => {
  it('groups every number in the range with the catalog locale, not the host', () => {
    const text = renderRange('es');

    // Spanish groups with '.', so start, end, and total must all carry dots —
    // not just the total, and not the host locale's convention.
    expect(text).toContain('12.001');
    expect(text).toContain('13.000');
    expect(text).toContain('1.234.567');
    expect(text).not.toContain(',');
  });

  it('formats the whole range in one convention per locale', () => {
    const spanish = renderRange('es');
    const english = renderRange('en');

    expect(spanish).not.toBe(english);
    // en groups with ',' across all three numbers.
    expect(english).toContain('12,001');
    expect(english).toContain('13,000');
    expect(english).toContain('1,234,567');
    // No raw ungrouped number may appear anywhere in the formatted range.
    expect(english).not.toMatch(/(^|[^\d,])12001([^\d]|$)/);
  });
});

describe('PatternDataTable modern — aria-rowcount reflects the true dataset size', () => {
  it('reports pagination.total, not the rendered page length', () => {
    // `data` is a single-row page slice; a paginated table only ever
    // receives the current page, never the full dataset.
    const { container } = render(
      <I18nProvider locale="en" fallbackLocale="en">
        <ModernDataTable<Row>
          columns={columns}
          data={data}
          rowKey="id"
          pagination={{ current: 1, pageSize: 20, total: 200, onChange: () => {} }}
        />
      </I18nProvider>,
    );

    const table = container.querySelector('table[role="grid"]');
    expect(table?.getAttribute('aria-rowcount')).toBe('200');
  });

  it('falls back to data.length when pagination is not used', () => {
    const rows: Row[] = [
      { id: 1, name: 'Ada' },
      { id: 2, name: 'Bo' },
      { id: 3, name: 'Cy' },
    ];
    const { container } = render(
      <I18nProvider locale="en" fallbackLocale="en">
        <ModernDataTable<Row> columns={columns} data={rows} rowKey="id" />
      </I18nProvider>,
    );

    const table = container.querySelector('table[role="grid"]');
    expect(table?.getAttribute('aria-rowcount')).toBe('3');
  });
});
