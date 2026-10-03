import React from 'react';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ChartDataAccess } from '..';
import type {
  ChartDataAccessColumn,
  ChartDataAccessLabels,
} from '../../../../foundation/access';

interface Row {
  readonly id: string;
  readonly name: string;
}

const labels: ChartDataAccessLabels = {
  summaryHeading: 'Key facts',
  openTable: 'View data table',
  closeTable: 'Close data table',
  exportCsv: 'Export all rows as CSV',
  tableCaption: 'Candidate evidence',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  emptyTable: 'No evidence available',
  pageStatus: ({ page, pageCount }) => `Page ${page} of ${pageCount}`,
};

const columns = [
  { id: 'name', label: 'Candidate', getValue: (row: Row) => row.name },
] as const satisfies readonly [ChartDataAccessColumn<Row>];

const rows: readonly Row[] = Array.from({ length: 60 }, (_, index) => ({
  id: `row-${index + 1}`,
  name: `Candidate ${index + 1}`,
}));

const SKIN = readFileSync(
  resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../../../../../../../foundation/tokens/css/presentation/components/skin/chart-foundation/index.css',
  ),
  'utf8',
);

interface SkinRule {
  readonly selectors: readonly string[];
  readonly body: string;
}

const SKIN_RULES: readonly SkinRule[] = Array.from(
  SKIN.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g),
  (match) => ({
    selectors: match[1].split(',').map((selector) => selector.replace(/\s+/g, ' ').trim()),
    body: match[2],
  }),
);

const ROOT = ".ds-chart-data-access.ds-chart-data-access[data-part='chart-data-access']";
const FOCUS_TARGETS = [
  `${ROOT} [data-part='data-trigger']:focus-visible`,
  `${ROOT} [data-part='data-action']:focus-visible`,
  `${ROOT} [data-part='data-pagination'] button:focus-visible`,
  `${ROOT} [data-part='data-table-scroll']:focus-visible`,
];

const focusRules = (): SkinRule[] =>
  SKIN_RULES.filter((rule) => rule.selectors.some((selector) => FOCUS_TARGETS.includes(selector)));

function open(): HTMLElement {
  const { container } = render(
    <ChartDataAccess
      summary={[{ id: 'fact', label: 'Fact', value: 'Value' }]}
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.id}
      labels={labels}
      csvFilename="candidate-evidence"
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: labels.openTable }));
  return container;
}

describe('ChartDataAccess keyboard focus targets', () => {
  it('owns its tab stops: native buttons and the scrollable table region', () => {
    const container = open();
    const stops = Array.from(
      container.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex]'),
    ).filter((node) => node.tabIndex >= 0 && !(node as HTMLButtonElement).disabled);

    expect(
      stops.map((node) => node.getAttribute('data-part') ?? node.parentElement?.getAttribute('data-part')),
    ).toEqual(['data-trigger', 'data-action', 'data-action', 'data-table-scroll', 'data-pagination']);
    for (const node of stops) {
      expect(node.closest('.ds-button')).toBeNull();
      expect(node).toHaveAccessibleName();
    }

    const scroller = container.querySelector<HTMLElement>('[data-part="data-table-scroll"]');
    expect(scroller).toHaveAttribute('tabindex', '0');
    expect(scroller).toHaveAttribute('role', 'region');
  });

  it('stamps every focus target with the anatomy the skin focus rule selects', () => {
    const container = open();
    const root = container.querySelector('[data-part="chart-data-access"]');
    expect(root).toHaveClass('ds-chart-data-access');

    for (const target of FOCUS_TARGETS) {
      const resting = target.slice(ROOT.length + 1).replace(':focus-visible', '');
      expect(root?.querySelector(resting), resting).not.toBeNull();
    }
  });

  it('wears the tenant focus signature, never a solid outline built from width and colour', () => {
    const [signature, forced, ...rest] = focusRules();
    expect(rest).toHaveLength(0);

    for (const rule of [signature, forced]) {
      expect([...rule.selectors].sort()).toEqual([...FOCUS_TARGETS].sort());
    }
    expect(signature.body).toMatch(/box-shadow:\s*var\(--ds-focus-ring\);/);
    expect(signature.body).toMatch(/outline:\s*var\(--ds-focus-ring-width\) solid transparent;/);
    expect(signature.body).toMatch(/outline-offset:\s*var\(--ds-focus-ring-offset\);/);
    expect(signature.body).not.toMatch(/--ds-color-focus|--ds-color-primary|--ds-shadow-focus-ring/);
  });

  it('keeps a system-colour outline for forced colors, where the signature is dropped', () => {
    const forced = focusRules()[1];

    expect(SKIN.indexOf('@media (forced-colors: active)')).toBeGreaterThan(-1);
    expect(forced.body).toMatch(/outline:\s*max\(2px, var\(--ds-focus-ring-width\)\) solid Highlight;/);
    expect(forced.body).toMatch(/box-shadow:\s*none;/);
  });
});
