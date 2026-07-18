import React from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ChartFamilyFrame } from '../presentation/family-frame';
import type { ChartSummaryTable } from '../presentation/scaffold';
import {
  CHART_METRIC_TREND_RENDERER_ID,
  CHART_RANKED_ROWS_RENDERER_ID,
  type ChartProjectionSpec,
} from '../runtime/chart-engine';

const SUMMARY: ChartSummaryTable = {
  caption: 'Funnel data summary',
  headers: ['Stage', 'Value'],
  rows: [
    ['Visits', 1200],
    ['Signups', 480],
  ],
};

const RANKED_PROJECTION: ChartProjectionSpec = {
  desktop: { mode: 'full', rendererId: 'funnel' },
  phone: {
    mode: 'ranked-rows',
    rendererId: CHART_RANKED_ROWS_RENDERER_ID,
    fieldIds: ['Stage', 'Value'],
  },
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ChartFamilyFrame', () => {
  it('renders the family renderer for the resolved desktop full view', () => {
    const renderFull = vi.fn(() => <div data-testid="family-plot">Funnel marks</div>);

    render(
      <ChartFamilyFrame
        projection={RANKED_PROJECTION}
        title="Signup funnel"
        deviceClass="desktop"
        summary={SUMMARY}
        rankedRowsLabel="Funnel stages"
        renderFull={renderFull}
      />,
    );

    expect(renderFull).toHaveBeenCalledWith(RANKED_PROJECTION.desktop);
    expect(screen.getByTestId('family-plot')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Funnel stages' })).toBeNull();
  });

  it('projects the accessible summary table as ranked rows on phone', () => {
    const renderFull = vi.fn(() => <div data-testid="family-plot" />);

    render(
      <ChartFamilyFrame
        projection={RANKED_PROJECTION}
        title="Signup funnel"
        deviceClass="phone"
        summary={SUMMARY}
        rankedRowsLabel="Funnel stages"
        renderFull={renderFull}
      />,
    );

    expect(renderFull).not.toHaveBeenCalled();
    const list = screen.getByRole('list', { name: 'Funnel stages' });
    expect(list).toHaveAttribute('data-renderer-id', CHART_RANKED_ROWS_RENDERER_ID);
    expect(screen.getByText('Visits')).toBeInTheDocument();
    expect(screen.getByText('480')).toBeInTheDocument();
  });

  it('renders the generic metric renderer for a micro projection', () => {
    render(
      <ChartFamilyFrame
        projection={{
          desktop: { mode: 'full', rendererId: 'funnel' },
          phone: {
            mode: 'micro',
            rendererId: CHART_METRIC_TREND_RENDERER_ID,
            metricId: 'total-signups',
          },
        }}
        title="Signup funnel"
        deviceClass="phone"
        metric={{
          label: 'Signups',
          value: '480',
          delta: '+12%',
          deltaTone: 'positive',
          ariaLabel: 'Signups, 480, up 12 percent',
        }}
        renderFull={() => <div data-testid="family-plot" />}
      />,
    );

    const metric = screen.getByRole('group', { name: 'Signups, 480, up 12 percent' });
    expect(metric).toHaveAttribute('data-metric-id', 'total-signups');
    expect(screen.getByText('480')).toBeInTheDocument();
  });

  it('delegates summary and alternate projections to app renderers', () => {
    const renderSummaryView = vi.fn(() => <p data-testid="app-summary">Narrative</p>);

    render(
      <ChartFamilyFrame
        projection={{
          desktop: { mode: 'full', rendererId: 'funnel' },
          phone: { mode: 'summary', rendererId: 'app.narrative', summaryId: 'funnel-story' },
        }}
        title="Signup funnel"
        deviceClass="phone"
        renderFull={() => <div />}
        renderSummaryView={renderSummaryView}
      />,
    );

    expect(renderSummaryView).toHaveBeenCalledWith({
      mode: 'summary',
      rendererId: 'app.narrative',
      summaryId: 'funnel-story',
    });
    expect(screen.getByTestId('app-summary')).toBeInTheDocument();
  });

  it('fails closed when a projection points at content the caller did not supply', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() =>
      render(
        <ChartFamilyFrame
          projection={RANKED_PROJECTION}
          title="Signup funnel"
          deviceClass="phone"
          rankedRowsLabel="Funnel stages"
          renderFull={() => <div />}
        />,
      ),
    ).toThrowError(/requires the family `summary` table/);

    expect(() =>
      render(
        <ChartFamilyFrame
          projection={RANKED_PROJECTION}
          title="Signup funnel"
          deviceClass="phone"
          summary={SUMMARY}
          renderFull={() => <div />}
        />,
      ),
    ).toThrowError(/requires app-supplied `rankedRowsLabel` copy/);
  });

  it('routes typed-required state copy to the frame without mounting any renderer', () => {
    const renderFull = vi.fn(() => <div data-testid="family-plot" />);

    render(
      <ChartFamilyFrame
        projection={RANKED_PROJECTION}
        title="Signup funnel"
        deviceClass="desktop"
        summary={SUMMARY}
        rankedRowsLabel="Funnel stages"
        renderFull={renderFull}
        state="error"
        errorLabel="Funnel failed to load"
        errorDescription="Try again shortly."
      />,
    );

    expect(renderFull).not.toHaveBeenCalled();
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Funnel failed to load');
    expect(alert).toHaveTextContent('Try again shortly.');
  });

  it('routes the loading state through the frame with app copy', () => {
    render(
      <ChartFamilyFrame
        projection={RANKED_PROJECTION}
        title="Signup funnel"
        deviceClass="desktop"
        renderFull={() => <div data-testid="family-plot" />}
        state="loading"
        loadingLabel="Loading funnel"
      />,
    );

    expect(screen.queryByTestId('family-plot')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('Loading funnel');
  });
});
