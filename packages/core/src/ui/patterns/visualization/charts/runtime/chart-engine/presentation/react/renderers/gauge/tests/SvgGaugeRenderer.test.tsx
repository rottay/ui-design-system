import React, { act } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SvgGaugeRenderer } from '..';

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

describe('SvgGaugeRenderer presentation', () => {
  it('server-renders finite segmented geometry with a semantic SVG name', () => {
    const html = renderToString(
      <SvgGaugeRenderer
        ariaLabel="Readiness score"
        ariaDescription="Candidate readiness against the expected range"
        value={72}
        min={0}
        max={100}
        responsive={false}
        animate
        width={360}
        height={240}
        label="Readiness"
        segments={[
          { from: 0, to: 50, color: '#c2410c', label: 'Needs work' },
          { from: 50, to: 100, color: '#15803d', label: 'Ready' },
        ]}
      />,
    );

    expect(html).toContain('Readiness score');
    expect(html).toContain('Candidate readiness against the expected range');
    expect(html.match(/data-part="segment"/g)).toHaveLength(2);
    expect(html).toContain('data-part="needle"');
    // SSR deliberately starts at the settled state until the browser knows
    // the user's motion preference, preventing a hydration-time motion flash.
    expect(html).toContain('data-animate="false"');
    expect(html).not.toContain('<animate');
    expect(html).not.toMatch(/NaN|Infinity/);
  });

  it('exposes action semantics and an anchored tooltip for a selected threshold', async () => {
    const onAction = vi.fn();
    const { container } = render(
      <SvgGaugeRenderer
        ariaLabel="Readiness score"
        value={72}
        responsive={false}
        animate
        interaction={{
          mode: 'select',
          defaultActiveKey: 'gauge-segment-1',
          actionLabel: 'Inspect threshold',
          onAction,
          renderTooltip: (active) => `Active ${active.datum.label}`,
        }}
        segments={[
          { from: 0, to: 50, color: '#c2410c', label: 'Needs work' },
          { from: 50, to: 100, color: '#15803d', label: 'Ready' },
        ]}
      />,
    );

    await waitFor(() => {
      expect(container.querySelector('[data-part="gauge-motion"]')).toHaveAttribute(
        'data-animate',
        'true',
      );
    });
    expect(container.querySelectorAll('animate').length).toBeGreaterThan(0);

    const ready = screen.getByRole('button', {
      name: 'Ready: 50 to 100. Inspect threshold',
    });
    expect(ready).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tooltip')).toHaveTextContent('Active Ready');

    fireEvent.click(ready);
    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'gauge-segment-1',
        datum: expect.objectContaining({ label: 'Ready' }),
      }),
      expect.objectContaining({ reason: 'action' }),
    );
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
      <SvgGaugeRenderer
        ariaLabel="Responsive readiness"
        value={55}
        width={480}
        height={220}
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
