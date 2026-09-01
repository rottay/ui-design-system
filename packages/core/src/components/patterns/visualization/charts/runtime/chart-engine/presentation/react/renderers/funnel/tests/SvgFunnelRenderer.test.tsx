import React, { act } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SvgFunnelRenderer } from '..';

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

describe('SvgFunnelRenderer presentation', () => {
  it('server-renders finite tapered geometry with semantic SVG naming and settled motion', () => {
    const html = renderToString(
      <SvgFunnelRenderer
        ariaLabel="Pipeline conversion"
        ariaDescription="Recruiting stages from sourced candidates through hires"
        responsive={false}
        animate
        width={420}
        height={280}
        showConversion
        data={[
          { label: 'Sourced', value: 120 },
          { label: 'Qualified', value: 60 },
          { label: 'Interviewed', value: 18 },
        ]}
      />,
    );

    expect(html).toContain('Pipeline conversion');
    expect(html).toContain('Recruiting stages from sourced candidates through hires');
    expect(html.match(/data-part="segment"/g)).toHaveLength(3);
    expect(html).toContain('50.0%');
    expect(html).toContain('data-animate="false"');
    expect(html).not.toContain('<animate');
    expect(html).not.toMatch(/NaN|Infinity/);
  });

  it('exposes stage-level select semantics and an anchored tooltip', async () => {
    const onAction = vi.fn();
    const { container } = render(
      <SvgFunnelRenderer
        ariaLabel="Pipeline conversion"
        responsive={false}
        animate
        data={[
          { label: 'Sourced', value: 120 },
          { label: 'Qualified', value: 60 },
          { label: 'Interviewed', value: 18 },
        ]}
        interaction={{
          mode: 'select',
          defaultActiveKey: 'funnel-segment-1',
          actionLabel: 'Inspect stage',
          onAction,
          renderTooltip: (active) => `Active ${active.datum.label}`,
        }}
      />,
    );

    await waitFor(() => {
      expect(container.querySelector('[data-part="funnel-motion"]')).toHaveAttribute(
        'data-animate',
        'true',
      );
    });
    expect(container.querySelectorAll('animate').length).toBeGreaterThan(0);

    const stage = screen.getByRole('button', {
      name: 'Qualified: 60. Inspect stage',
    });
    expect(stage).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tooltip')).toHaveTextContent('Active Qualified');

    fireEvent.click(stage);
    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'funnel-segment-1',
        datum: { label: 'Qualified', value: 60 },
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
      <SvgFunnelRenderer
        ariaLabel="Responsive pipeline"
        width={480}
        height={220}
        data={[
          { label: 'Sourced', value: 120 },
          { label: 'Qualified', value: 60 },
          { label: 'Interviewed', value: 18 },
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
