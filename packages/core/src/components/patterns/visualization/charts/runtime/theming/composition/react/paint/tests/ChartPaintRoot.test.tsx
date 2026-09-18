/**
 * Root-or-read: whichever component IS the chart root resolves, and a family
 * above it always wins.
 *
 * The published package has two mount shapes, not one. `family -> renderer` is
 * the shape the original contract assumed; `ChartFrame -> renderer` mounts a
 * renderer with no family above it, and there the renderer is the chart root.
 * These legs pin both, plus the refusal that keeps them from diverging.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useResolvedChartPersonality } from '@/infrastructure/runtime/personality';
import { useTokens } from '@/infrastructure/runtime/theming/composition/react/tokens';
import { renderSurface } from '@ui/surfaces/foundation/common/test-utils';

import { BarChart } from '../../../../../../families/bar-chart';
import { ChartFrame } from '../../../../../chart-engine/presentation/react/projection/frame';
import { SvgBarRenderer } from '../../../../../chart-engine/presentation/react/renderers/bar';
import { ChartImperativePlot } from '../../../../../chart-engine/presentation/react/renderers/imperative';
import { resolveChartPaint } from '../../../foundation/paint';
import { ChartPaintProvider, useChartPaintRoot, useChartTokenScheme } from '../index';

const BAR_DATA = [{ id: 'q1', category: 'Q1', value: 12 }];

const IMPERATIVE_PROPS = {
  rendererId: 'app.flow',
  ariaLabel: 'Deal flow',
  width: 480,
  height: 240,
  responsive: false,
} as const;

function scopeOf(container: HTMLElement): HTMLElement | null {
  return container.querySelector<HTMLElement>('[data-part="chart-renderer"]');
}

describe('a renderer with no family above it is the chart root', () => {
  it('resolves and stamps its own decision when mounted bare', () => {
    const { container } = render(
      <SvgBarRenderer ariaLabel="Profit by quarter" data={BAR_DATA} />,
    );

    const root = scopeOf(container);
    expect(root).not.toBeNull();
    expect(root?.getAttribute('data-chart-color-scheme')).toBe(
      resolveChartPaint({ family: 'bar-chart' }).scheme,
    );
    expect(root?.getAttribute('data-chart-paint-model')).toBe('categorical');
  });

  it('mounts inside ChartFrame without a family and stamps the same scope', () => {
    const { container } = render(
      <ChartFrame
        title="Quarterly profit"
        projection={{
          desktop: { mode: 'full', rendererId: 'profit.svg-bar' },
          phone: { mode: 'summary', rendererId: 'profit.summary', summaryId: 'profit.total' },
        }}
        deviceClass="desktop"
        renderView={() => <SvgBarRenderer ariaLabel="Profit by quarter" data={BAR_DATA} />}
      />,
    );

    expect(scopeOf(container)?.getAttribute('data-chart-color-scheme')).toBe('default');
  });
});

describe('a family above wins by construction', () => {
  it('stamps the family scheme on the renderer, not the token tier', async () => {
    const { container } = renderSurface(
      <BarChart data={[{ label: 'A', value: 10 }]} colorScheme="vibrant" responsive={false} />,
    );

    await screen.findByRole('img');
    expect(scopeOf(container)?.getAttribute('data-chart-color-scheme')).toBe('vibrant');
  });

  it('refuses to let a published decision be overridden by a root prop', () => {
    const published = resolveChartPaint({ family: 'sankey', scheme: 'monochrome' });
    const { container } = render(
      <ChartPaintProvider decision={published}>
        <ChartImperativePlot {...IMPERATIVE_PROPS} colorScheme="vibrant" draw={() => {}} />
      </ChartPaintProvider>,
    );

    expect(scopeOf(container)?.getAttribute('data-chart-color-scheme')).toBe('monochrome');
  });

  it('hands an imperative body the slots of the family above it', () => {
    const published = resolveChartPaint({ family: 'sankey', scheme: 'monochrome' });
    const seen: string[] = [];
    render(
      <ChartPaintProvider decision={published}>
        <ChartImperativePlot
          {...IMPERATIVE_PROPS}
          colorScheme="vibrant"
          draw={(context) => {
            seen.push(context.seriesPaint[0] as string);
          }}
        />
      </ChartPaintProvider>,
    );

    expect(seen[0]).toBe(published.categorical?.paintFor(0));
  });
});

describe('the unowned root', () => {
  it('lets the published imperative bridge resolve its own prop tier standalone', () => {
    const seen: string[] = [];
    const { container } = render(
      <ChartImperativePlot
        {...IMPERATIVE_PROPS}
        colorScheme="vibrant"
        draw={(context) => {
          seen.push(context.seriesPaint[0] as string);
        }}
      />,
    );

    const expected = resolveChartPaint({ family: null, scheme: 'vibrant' });
    expect(scopeOf(container)?.getAttribute('data-chart-color-scheme')).toBe('vibrant');
    expect(scopeOf(container)?.getAttribute('data-chart-paint-model')).toBe('categorical');
    expect(seen[0]).toBe(expected.categorical?.paintFor(0));
  });

  it('is not a registry row', () => {
    const unowned = resolveChartPaint({ family: null });
    expect(unowned.family).toBeNull();
    expect(unowned.model).toBe('categorical');
    expect(unowned.overridden).toBe(false);
    // An unregistered STRING is still refused by name.
    expect(() => resolveChartPaint({ family: 'pie' as never })).toThrow(/unknown family/);
  });
});

describe('the token tier', () => {
  it('is the same value the token bag would have reported', async () => {
    const seen: Array<{ bag: string | undefined; canonical: string | undefined }> = [];
    function Probe() {
      seen.push({
        bag: useTokens().personality.chart.colorScheme,
        canonical: useResolvedChartPersonality().colorScheme,
      });
      return <div data-testid="probe" />;
    }

    renderSurface(<Probe />);
    await screen.findByTestId('probe');
    expect(seen.length).toBeGreaterThan(0);
    for (const sample of seen) expect(sample.canonical).toBe(sample.bag);
  });

  it('is readable with no TenantProvider mounted, which the token bag is not', () => {
    function Probe() {
      return <div data-testid="scheme">{useChartTokenScheme()}</div>;
    }
    const { container } = render(<Probe />);
    expect(container.querySelector('[data-testid="scheme"]')?.textContent).toBe('default');

    function TokenBagProbe() {
      return <div>{useTokens().personality.chart.colorScheme ?? 'none'}</div>;
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<TokenBagProbe />)).toThrow(/TenantProvider/);
    } finally {
      spy.mockRestore();
    }
  });
});

describe('the frame resolves but never publishes', () => {
  it('leaves a family inside it free to resolve its own decision', async () => {
    const { container } = renderSurface(
      <ChartFrame
        title="Quarterly profit"
        projection={{
          desktop: { mode: 'full', rendererId: 'profit.family' },
          phone: { mode: 'summary', rendererId: 'profit.summary', summaryId: 'profit.total' },
        }}
        deviceClass="desktop"
        renderView={() => (
          <BarChart data={[{ label: 'A', value: 10 }]} colorScheme="vibrant" responsive={false} />
        )}
      />,
    );

    await screen.findByRole('img');
    expect(
      container
        .querySelector('[data-part="chart-frame"]')
        ?.getAttribute('data-chart-color-scheme'),
    ).toBe('default');
    expect(scopeOf(container)?.getAttribute('data-chart-color-scheme')).toBe('vibrant');
  });
});

describe('useChartPaintRoot is typed as a root, not a reader', () => {
  it('accepts a registered family and the unowned root, and nothing else', () => {
    function Typed() {
      const owned = useChartPaintRoot('bar-chart');
      const unowned = useChartPaintRoot(null, { scheme: 'pastel' });
      // @ts-expect-error an unregistered family id is refused at the door
      const refused = useChartPaintRoot('pie');
      return <div>{[owned.scheme, unowned.scheme, refused.scheme].join(' ')}</div>;
    }
    expect(Typed).toBeTypeOf('function');
  });
});
