import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React, { act } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SvgRadarRenderer } from '..';

const RADAR_SKIN_CSS = readFileSync(
  join(__dirname, '../../../../../../../../../../../foundation/tokens/css/presentation/components/skin/chart-radar/index.css'),
  'utf8',
);

const defaultResizeObserver = globalThis.ResizeObserver;

function measuredRect(width: number, height = 240): DOMRect {
  return {
    x: 0,
    y: 0,
    width,
    height,
    top: 0,
    right: width,
    bottom: height,
    left: 0,
    toJSON: () => ({}),
  };
}

afterEach(() => {
  globalThis.ResizeObserver = defaultResizeObserver;
  vi.restoreAllMocks();
});

describe('SvgRadarRenderer presentation', () => {
  it('server-renders finite geometry with a semantic SVG name and settled motion', () => {
    const html = renderToString(
      <SvgRadarRenderer
        ariaLabel="Capability balance"
        ariaDescription="Candidate operational capability across three dimensions"
        responsive={false}
        animate
        width={360}
        height={300}
        levels={4}
        data={[
          { axis: 'Safety', value: 8 },
          { axis: 'Speed', value: 6 },
          { axis: 'Quality', value: 9 },
        ]}
      />,
    );

    expect(html).toContain('Capability balance');
    expect(html).toContain('Candidate operational capability across three dimensions');
    expect(html.match(/data-part="grid-level"/g)).toHaveLength(4);
    expect(html.match(/data-part="series-area"/g)).toHaveLength(1);
    // SSR stays settled until the browser can resolve the motion preference.
    expect(html).toContain('data-animate="false"');
    expect(html).not.toContain('<animate');
    expect(html).not.toMatch(/NaN|Infinity/);
  });

  it('exposes vertex-level select semantics and an anchored tooltip', async () => {
    const onAction = vi.fn();
    const { container } = render(
      <SvgRadarRenderer
        ariaLabel="Capability balance"
        responsive={false}
        animate
        data={[]}
        series={[
          {
            name: 'Ops',
            data: [
              { axis: 'Safety', value: 8 },
              { axis: 'Speed', value: 6 },
              { axis: 'Quality', value: 9 },
            ],
          },
          {
            name: 'Support',
            data: [
              { axis: 'Safety', value: 7 },
              { axis: 'Speed', value: 9 },
              { axis: 'Quality', value: 8 },
            ],
          },
        ]}
        interaction={{
          mode: 'select',
          defaultActiveKey: 'radar-series-1-point-2',
          actionLabel: 'Inspect capability',
          onAction,
          renderTooltip: (active) => `Active ${active.datum.series.name}: ${active.datum.point.axis}`,
        }}
      />,
    );

    await waitFor(() => {
      expect(container.querySelector('[data-part="radar-motion"]')).toHaveAttribute(
        'data-animate',
        'true',
      );
    });
    expect(container.querySelectorAll('animate').length).toBeGreaterThan(0);

    const point = screen.getByRole('button', {
      name: 'Support, Quality: 8. Inspect capability',
    });
    expect(point).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tooltip')).toHaveTextContent('Active Support: Quality');

    fireEvent.click(point);
    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'radar-series-1-point-2',
        datum: expect.objectContaining({
          series: expect.objectContaining({ name: 'Support' }),
          point: { axis: 'Quality', value: 8 },
        }),
      }),
      expect.objectContaining({ reason: 'action' }),
    );
  });

  it('stamps the paint slot and the dash cadence as two quantities', () => {
    const axes = [
      { axis: 'Safety', value: 8 },
      { axis: 'Speed', value: 6 },
      { axis: 'Quality', value: 9 },
    ];
    const html = renderToString(
      <SvgRadarRenderer
        ariaLabel="Capability balance"
        responsive={false}
        width={360}
        height={300}
        data={axes}
        series={Array.from({ length: 12 }, (_, seriesIndex) => ({
          name: `Team ${seriesIndex}`,
          data: axes,
        }))}
      />,
    );

    const groups = html.match(/data-part="series"[^>]*/gu) ?? [];
    expect(groups).toHaveLength(12);
    const stamped = groups.map((group) => ({
      slot: /data-series-index="(\d+)"/u.exec(group)?.[1],
      cadence: /data-series-cadence="(\d+)"/u.exec(group)?.[1],
    }));
    expect(stamped.map((entry) => entry.slot)).toEqual(
      ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '1'],
    );
    expect(stamped.map((entry) => entry.cadence)).toEqual(
      ['0', '1', '2', '3', '4', '0', '1', '2', '3', '4', '0', '1'],
    );

    // The dash rhythm is keyed on the cadence, so unifying the paint slot to
    // ten cannot silently retire it.
    expect(RADAR_SKIN_CSS).toContain(
      "[data-part='series'][data-series-cadence='1'] [data-part='series-area']",
    );
    expect(RADAR_SKIN_CSS).not.toContain('data-series-index');
  });

  it('recomputes the viewBox through the shared responsive owner observer', async () => {
    let observerCallback: ResizeObserverCallback | undefined;
    class ControlledResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        observerCallback = callback;
      }

      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    globalThis.ResizeObserver = ControlledResizeObserver as unknown as typeof ResizeObserver;
    let ownerWidth = 288;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(() => measuredRect(ownerWidth));

    const { container } = render(
      <SvgRadarRenderer
        ariaLabel="Responsive capability balance"
        width={480}
        height={220}
        data={[
          { axis: 'Safety', value: 8 },
          { axis: 'Speed', value: 6 },
          { axis: 'Quality', value: 9 },
        ]}
      />,
    );

    const svg = container.querySelector('[data-part="chart-svg"]');
    await waitFor(() => {
      expect(svg).toHaveAttribute('viewBox', '0 0 288 220');
    });

    ownerWidth = 344;
    await act(async () => {
      observerCallback?.([] as ResizeObserverEntry[], {} as ResizeObserver);
    });
    await waitFor(() => {
      expect(svg).toHaveAttribute('viewBox', '0 0 344 220');
    });
  });
});
