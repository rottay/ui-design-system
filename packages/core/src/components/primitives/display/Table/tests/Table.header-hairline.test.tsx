import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';

import ModernTable from '../engines/modern';
import RusticTable from '../engines/rustic';
import { renderWithEngine, STABLE_ENGINES } from '../../../../../_internal/testing/helpers/engine-test-utils';
import { DesignSystemProvider } from '../../../../../runtime/bootstrap';
import type { TenantConfig } from '../../../../../contracts';
import type { ColumnType } from '../Table.types';

interface Row {
  key: string;
  name: string;
}

const COLUMNS: ColumnType<Row>[] = [{ key: 'name', title: 'Name', dataIndex: 'name' }];

const DATA: Row[] = [
  { key: '1', name: 'Ada' },
  { key: '2', name: 'Bea' },
];

const TEST_TENANT_CONFIG: TenantConfig = {
  slug: 'test-tenant',
  name: 'Test Tenant',
  engine: 'modern',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: ['testing'],
  branding: {
    companyName: 'Test Tenant',
    primaryColor: '#2563eb',
    secondaryColor: '#0f766e',
    accentColor: '#7c3aed',
    darkPrimaryColor: '#93c5fd',
    darkSecondaryColor: '#5eead4',
    darkAccentColor: '#c4b5fd',
  },
};

function renderMarkup(engine: 'modern' | 'rustic', ui: React.ReactElement): string {
  return renderToStaticMarkup(
    <DesignSystemProvider
      tenantConfig={{ ...TEST_TENANT_CONFIG, engine }}
      forceEngine={engine}
      skipCssLoading
    >
      {ui}
    </DesignSystemProvider>
  );
}

/**
 * The full opening tag for the first `<tag>` (optionally matching a role).
 * Both engines' border treatment moved from an inline `style` to their
 * respective unlayered `table.css` skin (WO-ARC-09: modern, then rustic), so
 * these tests read the data attributes each engine stamps rather than a
 * style string.
 */
function openTag(html: string, tag: 'table' | 'th' | 'td', role?: string): string {
  const re = role
    ? new RegExp(`<${tag}\\b[^>]*role="${role}"[^>]*>`)
    : new RegExp(`<${tag}\\b[^>]*>`);
  const match = re.exec(html);
  if (!match) throw new Error(`No <${tag}${role ? ` role="${role}"` : ''}> found in markup`);
  return match[0];
}

describe('Table modern engine -- header hairline default (WO-ENG-16)', () => {
  it('flags the header bottom hairline by default, with no cell or outer table border', () => {
    const html = renderMarkup(
      'modern',
      <ModernTable columns={COLUMNS} dataSource={DATA} pagination={false} />
    );

    expect(openTag(html, 'th', 'columnheader')).toContain('data-hairline="true"');

    // Only the header/body separator is on by default -- no per-row cell
    // borders and no outer table border. Those stay behind `bordered`.
    expect(openTag(html, 'td', 'gridcell')).not.toContain('data-bordered="true"');
    expect(openTag(html, 'table', 'grid')).not.toContain('data-bordered="true"');
  });

  it('removes the header hairline only via the explicit headerBordered={false} opt-out', () => {
    const html = renderMarkup(
      'modern',
      <ModernTable columns={COLUMNS} dataSource={DATA} pagination={false} headerBordered={false} />
    );

    expect(openTag(html, 'th', 'columnheader')).not.toContain('data-hairline');
  });

  it('keeps the full bordered treatment: outer border, header hairline, and per-cell borders', () => {
    const html = renderMarkup(
      'modern',
      <ModernTable columns={COLUMNS} dataSource={DATA} pagination={false} bordered />
    );

    expect(openTag(html, 'table', 'grid')).toContain('data-bordered="true"');
    expect(openTag(html, 'th', 'columnheader')).toContain('data-hairline="true"');
    expect(openTag(html, 'td', 'gridcell')).toContain('data-bordered="true"');
  });

  it('keeps the header hairline when bordered=true even if headerBordered={false} is also passed', () => {
    // `bordered` is the stronger, more encompassing declaration: it always
    // implies the header separator regardless of `headerBordered`.
    const html = renderMarkup(
      'modern',
      <ModernTable
        columns={COLUMNS}
        dataSource={DATA}
        pagination={false}
        bordered
        headerBordered={false}
      />
    );

    expect(openTag(html, 'th', 'columnheader')).toContain('data-hairline="true"');
  });

  it('does not change the rustic engine, whose header separator is unconditional', () => {
    // Rustic's <th> stamps `data-hairline="true"` unconditionally -- it never
    // reads `bordered` or `headerBordered` -- so it renders identically either
    // way. The rustic table skin (WO-ARC-09) paints the border off that
    // attribute, same contract shape as modern's own `data-hairline`.
    const defaultHtml = renderMarkup(
      'rustic',
      <RusticTable columns={COLUMNS} dataSource={DATA} pagination={false} />
    );
    expect(openTag(defaultHtml, 'th', 'columnheader')).toContain('data-hairline="true"');

    const optOutHtml = renderMarkup(
      'rustic',
      <RusticTable columns={COLUMNS} dataSource={DATA} pagination={false} headerBordered={false} />
    );
    expect(openTag(optOutHtml, 'th', 'columnheader')).toContain('data-hairline="true"');
  });

  it.each(STABLE_ENGINES)(
    'accepts headerBordered on the %s engine without crashing (classic/rustic ignore it, only modern honors it)',
    async (engine) => {
      const { Table } = await import('..');
      renderWithEngine(
        <Table
          engine={engine}
          columns={COLUMNS}
          dataSource={DATA}
          pagination={false}
          headerBordered={false}
        />,
        engine
      );
      expect(await screen.findByText('Name', undefined, { timeout: 30000 })).toBeInTheDocument();
    },
    45000
  );
});
