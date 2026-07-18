import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ChartImperativePlot, type ChartImperativePlotContext } from '..';
import { resolveChartSeriesPaint } from '../../../../../foundation/grammar/palette';

const BASE_PROPS = {
  rendererId: 'sankey',
  ariaLabel: 'Deal flow',
  ariaDescription: 'Sankey chart of deal flow.',
  width: 480,
  height: 240,
  responsive: false,
} as const;

describe('ChartImperativePlot', () => {
  it('hands the body an empty mount group inside the stable renderer surface', () => {
    const contexts: ChartImperativePlotContext[] = [];
    const draw = vi.fn((context: ChartImperativePlotContext) => {
      contexts.push(context);
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('data-testid', 'imperative-node');
      context.mount.appendChild(circle);
    });

    const { container } = render(<ChartImperativePlot {...BASE_PROPS} draw={draw} />);

    expect(draw).toHaveBeenCalledTimes(1);
    const context = contexts[0];
    expect(context.mount.tagName.toLowerCase()).toBe('g');
    expect(context.mount).toHaveAttribute('data-part', 'imperative-mount');
    expect(context.width).toBe(480);
    expect(context.height).toBe(240);

    const svg = container.querySelector('[data-part="chart-svg"]');
    expect(svg).not.toBeNull();
    expect(svg?.contains(context.mount)).toBe(true);
    expect(svg?.querySelector('[data-testid="imperative-node"]')).not.toBeNull();

    const surface = container.querySelector('[data-part="chart-renderer"]');
    expect(surface).toHaveAttribute('data-renderer-id', 'sankey');
  });

  it('keeps the surface-owned accessible name out of the imperative subtree', () => {
    const draw = vi.fn((context: ChartImperativePlotContext) => {
      while (context.mount.firstChild) context.mount.removeChild(context.mount.firstChild);
    });

    const { container } = render(<ChartImperativePlot {...BASE_PROPS} draw={draw} />);

    const title = container.querySelector('svg > title');
    expect(title).toHaveTextContent('Deal flow');
    const desc = container.querySelector('svg > desc');
    expect(desc).toHaveTextContent('Sankey chart of deal flow.');
  });

  it('resolves series paint through the canonical consumption chain', () => {
    let receivedPaint: readonly string[] = [];
    const draw = vi.fn((context: ChartImperativePlotContext) => {
      receivedPaint = context.seriesPaint;
    });

    render(<ChartImperativePlot {...BASE_PROPS} colorScheme="vibrant" draw={draw} />);

    expect(receivedPaint).toEqual(resolveChartSeriesPaint('vibrant'));
    expect(receivedPaint[0]).toContain('--ds-chart-category-1');
    expect(receivedPaint[0]).toContain('--ds-chart-series-1');
    expect(receivedPaint[0]).toContain('--ds-chart-vibrant-1');
  });

  it('runs the body cleanup and clears the mount when the draw identity changes', () => {
    const cleanup = vi.fn();
    const firstDraw = vi.fn((context: ChartImperativePlotContext) => {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('data-generation', 'first');
      context.mount.appendChild(rect);
      return cleanup;
    });
    const secondDraw = vi.fn((context: ChartImperativePlotContext) => {
      expect(context.mount.childNodes.length).toBe(0);
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('data-generation', 'second');
      context.mount.appendChild(rect);
    });

    const { container, rerender } = render(
      <ChartImperativePlot {...BASE_PROPS} draw={firstDraw} />,
    );
    expect(container.querySelector('[data-generation="first"]')).not.toBeNull();

    rerender(<ChartImperativePlot {...BASE_PROPS} draw={secondDraw} />);

    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(secondDraw).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[data-generation="first"]')).toBeNull();
    expect(container.querySelector('[data-generation="second"]')).not.toBeNull();
  });

  it('runs the body cleanup on unmount', () => {
    const cleanup = vi.fn();
    const draw = vi.fn(() => cleanup);

    const { unmount } = render(<ChartImperativePlot {...BASE_PROPS} draw={draw} />);
    unmount();

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('stamps data-empty on the surface without touching the body contract', () => {
    const draw = vi.fn();
    const { container } = render(<ChartImperativePlot {...BASE_PROPS} empty draw={draw} />);

    expect(container.querySelector('[data-part="chart-renderer"]')).toHaveAttribute(
      'data-empty',
      'true',
    );
    expect(draw).toHaveBeenCalledTimes(1);
  });
});
