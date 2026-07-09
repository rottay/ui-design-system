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

// happy-dom's CSSOM cannot parse a style value containing a nested var()
// fallback (e.g. `var(--a, var(--b))`) -- it silently drops the whole
// declaration, so `.style.borderBottom` reads back empty even when the
// element genuinely carries it. React's SSR serializer writes the literal
// value straight into the `style="..."` attribute string with no CSS parsing
// involved, so these tests assert against that string instead of the DOM.
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

function styleOf(html: string, tag: 'th' | 'td', role: string): string {
  const match = new RegExp(`<${tag}[^>]*\\sstyle="([^"]*)"[^>]*role="${role}"`).exec(html);
  if (!match) throw new Error(`No <${tag} role="${role}"> found in markup`);
  return match[1];
}

function tableStyle(html: string): string {
  const match = /<table[^>]*\sstyle="([^"]*)"/.exec(html);
  if (!match) throw new Error('No <table style="..."> found in markup');
  return match[1];
}

const MODERN_HEADER_HAIRLINE = 'border-bottom:1px solid var(--ds-table-border, var(--ds-color-border))';
const MODERN_TABLE_BORDER = 'border:1px solid var(--ds-table-border, var(--ds-color-border))';
const RUSTIC_HEADER_HAIRLINE = 'border-bottom:1px solid var(--ds-table-border, var(--ds-color-border-primary))';

describe('Table modern engine -- header hairline default (WO-ENG-16)', () => {
  it('draws the header bottom hairline by default, with no cell or outer table border', () => {
    const html = renderMarkup(
      'modern',
      <ModernTable columns={COLUMNS} dataSource={DATA} pagination={false} />
    );

    expect(styleOf(html, 'th', 'columnheader')).toContain(MODERN_HEADER_HAIRLINE);

    // Only the header/body separator is on by default -- no per-row cell
    // borders and no outer table border. Those stay behind `bordered`.
    expect(styleOf(html, 'td', 'gridcell')).not.toContain(MODERN_HEADER_HAIRLINE);
    expect(tableStyle(html)).not.toContain(MODERN_TABLE_BORDER);
  });

  it('removes the header hairline only via the explicit headerBordered={false} opt-out', () => {
    const html = renderMarkup(
      'modern',
      <ModernTable columns={COLUMNS} dataSource={DATA} pagination={false} headerBordered={false} />
    );

    expect(styleOf(html, 'th', 'columnheader')).not.toContain(MODERN_HEADER_HAIRLINE);
  });

  it('keeps the full bordered treatment: outer border, header hairline, and per-cell borders', () => {
    const html = renderMarkup(
      'modern',
      <ModernTable columns={COLUMNS} dataSource={DATA} pagination={false} bordered />
    );

    expect(tableStyle(html)).toContain(MODERN_TABLE_BORDER);
    expect(styleOf(html, 'th', 'columnheader')).toContain(MODERN_HEADER_HAIRLINE);
    expect(styleOf(html, 'td', 'gridcell')).toContain(MODERN_HEADER_HAIRLINE);
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

    expect(styleOf(html, 'th', 'columnheader')).toContain(MODERN_HEADER_HAIRLINE);
  });

  it('does not change the rustic engine, whose header separator is unconditional', () => {
    // Rustic's <th> bottom border comes from a static style object that never
    // reads `bordered` or `headerBordered` -- it renders identically either way.
    const defaultHtml = renderMarkup(
      'rustic',
      <RusticTable columns={COLUMNS} dataSource={DATA} pagination={false} />
    );
    expect(styleOf(defaultHtml, 'th', 'columnheader')).toContain(RUSTIC_HEADER_HAIRLINE);

    const optOutHtml = renderMarkup(
      'rustic',
      <RusticTable columns={COLUMNS} dataSource={DATA} pagination={false} headerBordered={false} />
    );
    expect(styleOf(optOutHtml, 'th', 'columnheader')).toContain(RUSTIC_HEADER_HAIRLINE);
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
