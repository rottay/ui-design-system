import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  CHART_RANKED_ROWS_RENDERER_ID,
  ChartRankedRowsView,
  projectChartSummaryRows,
} from '..';

const SOURCE = {
  headers: ['Stage', 'Value', 'Percentage'],
  rows: [
    ['Visits', 1200, '100%'],
    ['Signups', 480, '40%'],
    ['Purchases', 96, '8%'],
  ],
} as const;

describe('projectChartSummaryRows', () => {
  it('binds declared fields to summary columns in declaration order', () => {
    const projection = projectChartSummaryRows(SOURCE, ['Value', 'Stage']);

    expect(projection.columns).toEqual([
      { fieldId: 'Value', index: 1 },
      { fieldId: 'Stage', index: 0 },
    ]);
    expect(projection.rows[0]).toEqual([1200, 'Visits']);
  });

  it('fails closed on an unknown field instead of rendering an empty projection', () => {
    expect(() => projectChartSummaryRows(SOURCE, ['Stage', 'Revenue'])).toThrowError(
      /Unknown field "Revenue"\. Available fields: Stage, Value, Percentage\./,
    );
  });
});

describe('ChartRankedRowsView', () => {
  const view = {
    mode: 'ranked-rows',
    rendererId: CHART_RANKED_ROWS_RENDERER_ID,
    fieldIds: ['Stage', 'Value'],
  } as const;

  it('renders the summary rows as an ordered, labelled list', () => {
    const { container } = render(
      <ChartRankedRowsView view={view} source={SOURCE} ariaLabel="Top funnel stages" />,
    );

    const list = screen.getByRole('list', { name: 'Top funnel stages' });
    expect(list.tagName.toLowerCase()).toBe('ol');
    expect(list).toHaveAttribute('data-renderer-id', CHART_RANKED_ROWS_RENDERER_ID);

    const rows = container.querySelectorAll('[data-part="row"]');
    expect(rows).toHaveLength(3);

    const firstRow = rows[0];
    expect(firstRow.querySelector('[data-part="rank"]')).toHaveTextContent('1');
    const label = firstRow.querySelector('[data-part="row-label"]');
    expect(label).toHaveTextContent('Visits');
    expect(label).toHaveAttribute('data-field', 'Stage');
    const value = firstRow.querySelector('[data-part="row-value"]');
    expect(value).toHaveTextContent('1200');
    expect(value).toHaveAttribute('data-field', 'Value');
  });

  it('caps visible rows at maxRows while preserving source order', () => {
    const { container } = render(
      <ChartRankedRowsView view={view} source={SOURCE} ariaLabel="Top funnel stages" maxRows={2} />,
    );

    const labels = [...container.querySelectorAll('[data-part="row-label"]')].map(
      (node) => node.textContent,
    );
    expect(labels).toEqual(['Visits', 'Signups']);
  });
});
