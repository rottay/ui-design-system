import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { SvgScatterRenderer } from '..';

const DATA = [
  { id: 'alpha', label: 'Alpha', x: 1, y: 2, size: 4, series: 'Current' },
  { id: 'beta', label: 'Beta', x: 5, y: 8, size: 16, series: 'Forecast' },
] as const;

const CHART_FOUNDATION_CSS = readFileSync(
  join(__dirname, '../../../../../../../../../../../foundation/tokens/css/presentation/components/skin/chart-foundation.css'),
  'utf8',
);

describe('SvgScatterRenderer', () => {
  it('server-renders stable semantic bubble marks without runtime SVG paint', () => {
    const html = renderToString(
      <SvgScatterRenderer
        ariaLabel="Opportunity landscape"
        ariaDescription="Value by confidence and reach"
        data={DATA}
        variant="bubble"
        responsive={false}
        showLabels
      />,
    );

    expect(html).toContain('<title');
    expect(html).toContain('Opportunity landscape');
    expect(html).toContain('Value by confidence and reach');
    expect(html.match(/data-part="scatter-point"/g)).toHaveLength(2);
    expect(html).toContain('data-variant="bubble"');
    expect(html).toContain('data-series-index="0"');
    expect(html).toContain('data-series-index="1"');
    expect(html).not.toMatch(/<(?:circle|line|text)[^>]+(?:fill|stroke)=/u);
  });

  it.each(['explore', 'select', 'drill'] as const)(
    'exposes shared %s keyboard semantics and anchored tooltip state',
    (mode) => {
      const onAction = vi.fn();
      render(
        <SvgScatterRenderer
          ariaLabel="Opportunity landscape"
          data={DATA}
          responsive={false}
          interaction={mode === 'explore'
            ? {
                mode,
                defaultActiveKey: 'alpha',
                renderTooltip: (active) => `Active ${active.datum.label}`,
              }
            : {
                mode,
                defaultActiveKey: 'alpha',
                actionLabel: mode === 'select' ? 'Select opportunity' : 'Open opportunity',
                onAction,
                renderTooltip: (active) => `Active ${active.datum.label}`,
              }}
        />,
      );

      const alphaName = mode === 'explore'
        ? 'Current, Alpha: x 1, y 2'
        : `Current, Alpha: x 1, y 2. ${mode === 'select' ? 'Select opportunity' : 'Open opportunity'}`;
      const alpha = screen.getByRole(mode === 'explore' ? 'img' : 'button', {
        name: alphaName,
      });
      expect(alpha).toHaveAttribute('tabindex', '0');
      expect(screen.getByRole('tooltip')).toHaveTextContent('Active Alpha');

      fireEvent.keyDown(alpha, { key: 'ArrowRight' });
      const betaName = mode === 'explore'
        ? 'Forecast, Beta: x 5, y 8'
        : `Forecast, Beta: x 5, y 8. ${mode === 'select' ? 'Select opportunity' : 'Open opportunity'}`;
      expect(screen.getByRole(mode === 'explore' ? 'img' : 'button', { name: betaName }))
        .toHaveAttribute('tabindex', '0');

      if (mode !== 'explore') {
        fireEvent.click(alpha);
        expect(onAction).toHaveBeenCalledWith(
          expect.objectContaining({
            key: 'alpha',
            datum: expect.objectContaining({ id: 'alpha' }),
          }),
          expect.objectContaining({ reason: 'action' }),
        );
      }
    },
  );

  it('keeps static marks out of the tab order and exposes empty state truthfully', () => {
    const { rerender } = render(
      <SvgScatterRenderer
        ariaLabel="Static landscape"
        data={DATA}
        responsive={false}
      />,
    );

    expect(screen.getByRole('img', { name: 'Static landscape' })).toBeInTheDocument();
    expect(document.querySelectorAll('[data-part="scatter-point-mark"][tabindex]')).toHaveLength(0);

    rerender(
      <SvgScatterRenderer
        ariaLabel="Empty landscape"
        data={[{ id: 'invalid', label: 'Invalid', x: Number.NaN, y: 1 }]}
        responsive={false}
      />,
    );
    expect(screen.getByRole('img', { name: 'Empty landscape' }).closest('[data-part="chart-renderer"]'))
      .toHaveAttribute('data-empty', 'true');
  });

  it('owns palette, forced-colour and reduced-motion presentation in the skin', () => {
    expect(CHART_FOUNDATION_CSS).toContain('.ds-chart-renderer-scatter.ds-chart-renderer-scatter');
    expect(CHART_FOUNDATION_CSS).toContain("[data-part='scatter-point-mark'][data-series-index='9']");
    expect(CHART_FOUNDATION_CSS).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*\[data-part='scatter-point-mark'\]/u,
    );
    expect(CHART_FOUNDATION_CSS).toMatch(
      /@media \(forced-colors: active\)[\s\S]*\[data-part='scatter-point'\]/u,
    );
  });
});
