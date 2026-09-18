import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderSurface } from '@ui/surfaces/foundation/common/test-utils';
import { resolveChartPaint, type ChartPaintDecision } from '../../../foundation/paint';
import { ChartPaintProvider, useChartPaint, useChartPaintDecision } from '../index';

/** A renderer reads; it never resolves and never takes a scheme prop. */
function Renderer() {
  const decision = useChartPaintDecision();
  return (
    <div {...decision.rootAttributes} data-part="chart-renderer" data-testid="renderer">
      {decision.categorical?.paintFor(0) ?? 'no-slots'}
    </div>
  );
}

function Family({
  scheme,
  colors,
  family = 'bar-chart' as const,
}: {
  scheme?: 'default' | 'monochrome' | 'vibrant';
  colors?: readonly string[];
  family?: 'bar-chart' | 'gauge';
}) {
  const decision = useChartPaint({ family, scheme, override: colors });
  return (
    <ChartPaintProvider decision={decision}>
      <Renderer />
    </ChartPaintProvider>
  );
}

/** Silence the expected React error logging for a deliberately throwing render. */
function withSilencedRenderError(run: () => void): void {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    run();
  } finally {
    spy.mockRestore();
  }
}

describe('the family resolves, everyone else reads', () => {
  it('stamps the scope the family resolved, for every scheme', async () => {
    for (const scheme of ['default', 'monochrome', 'vibrant'] as const) {
      const { unmount } = renderSurface(<Family scheme={scheme} />);
      const root = await screen.findByTestId('renderer');
      expect(root.getAttribute('data-chart-color-scheme'), scheme).toBe(scheme);
      unmount();
    }
  });

  it('stamps the paint model beside the scope', async () => {
    renderSurface(<Family family="gauge" />);
    const root = await screen.findByTestId('renderer');
    expect(root.getAttribute('data-chart-paint-model')).toBe('semantic');
    expect(root.textContent).toBe('no-slots');
  });

  it('publishes the resolved slots to a renderer that never saw the props', async () => {
    renderSurface(<Family scheme="vibrant" />);
    const root = await screen.findByTestId('renderer');
    expect(root.textContent).toBe(
      resolveChartPaint({ family: 'bar-chart', scheme: 'vibrant' }).categorical?.paintFor(0),
    );
  });

  it('carries the colors override through the context', async () => {
    renderSurface(<Family colors={['#ff0000']} />);
    await waitFor(() => expect(screen.getByTestId('renderer').textContent).toBe('#ff0000'));
  });
});

describe('the refusals that make divergence unrepresentable', () => {
  it('refuses a read with no decision in scope', () => {
    withSilencedRenderError(() => {
      expect(() => renderSurface(<Renderer />)).toThrow(/no chart paint decision in scope/);
    });
  });

  it('refuses a second resolution below a published decision', () => {
    function Nested() {
      const decision = useChartPaint({ family: 'bar-chart' });
      return (
        <ChartPaintProvider decision={decision}>
          <Family scheme="monochrome" />
        </ChartPaintProvider>
      );
    }
    withSilencedRenderError(() => {
      expect(() => renderSurface(<Nested />)).toThrow(/resolved paint below "bar-chart"/);
    });
  });
});

describe('decision stability', () => {
  it('hands the same decision object back across re-renders', async () => {
    const seen: ChartPaintDecision[] = [];
    function Probe() {
      seen.push(useChartPaint({ family: 'pie-chart', scheme: 'pastel' }));
      return <div data-testid="probe" />;
    }
    const { rerender } = renderSurface(<Probe />);
    await screen.findByTestId('probe');
    const before = seen.length;
    rerender(<Probe />);
    await waitFor(() => expect(seen.length).toBeGreaterThan(before));
    expect(new Set(seen).size).toBe(1);
  });
});
