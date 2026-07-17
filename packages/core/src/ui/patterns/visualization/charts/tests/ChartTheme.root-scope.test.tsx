import { useRef, type CSSProperties } from 'react';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useChartTheme } from '../../../../../index';
import { resolveCssColor } from '../runtime/foundation/css-color-resolution';

vi.mock('../runtime/theming/composition/react/personality', () => ({
  useChartPersonality: () => ({
    animate: true,
    animationDuration: 180,
    lineMode: 'smooth',
    showDots: false,
    useGradientFill: true,
    tooltipStyle: 'minimal',
    colors: ['var(--chart-series)', 'var(--chart-nested)', '#123456'],
  }),
}));

function providerRoot(tenant: string, series: string): HTMLDivElement {
  const root = document.createElement('div');
  root.dataset.tenant = tenant;
  root.style.setProperty('--chart-series', series);
  root.style.setProperty('--chart-nested', `var(--chart-series)`);
  root.style.setProperty('--ds-color-border', series);
  root.style.setProperty('--ds-color-border-subtle', series);
  root.style.setProperty('--ds-color-text-secondary', series);
  root.style.setProperty('--ds-color-bg-primary', series);
  root.style.setProperty('--ds-color-bg-elevated', series);
  root.style.setProperty('--ds-color-text-primary', series);
  root.style.setProperty('--ds-color-text-muted', series);
  document.body.appendChild(root);
  return root;
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('useChartTheme provider-root scoping', () => {
  it('keeps sibling tenant roots isolated and never reads documentElement', () => {
    const tenantA = providerRoot('tenant-a', '#112233');
    const tenantB = providerRoot('tenant-b', '#aabbcc');
    const computedStyle = vi.spyOn(window, 'getComputedStyle');

    const chartA = renderHook(() => useChartTheme(tenantA));
    const chartB = renderHook(() => useChartTheme(tenantB));

    expect(chartA.result.current.palette).toEqual(['#112233', '#112233', '#123456']);
    expect(chartB.result.current.palette).toEqual(['#aabbcc', '#aabbcc', '#123456']);
    expect(chartA.result.current.axis.lineColor).toBe('#112233');
    expect(chartB.result.current.axis.lineColor).toBe('#aabbcc');
    expect(computedStyle).not.toHaveBeenCalledWith(document.documentElement);

    chartA.unmount();
    chartB.unmount();
  });

  it('re-resolves from the changed provider ancestry without changing a sibling', async () => {
    const tenantA = providerRoot('tenant-a', '#112233');
    const tenantB = providerRoot('tenant-b', '#aabbcc');
    const chartAOwner = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const chartBOwner = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    tenantA.appendChild(chartAOwner);
    tenantB.appendChild(chartBOwner);

    // happy-dom does not inherit custom properties into SVG. Model browser
    // inheritance while retaining the important assertion: computed style is
    // requested for the chart owner, never for its provider/global root.
    const computedOwners: Element[] = [];
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
      computedOwners.push(element);
      return {
        getPropertyValue: (name: string) => {
          let current: Element | null = element;
          while (current) {
            if (current instanceof HTMLElement || current instanceof SVGElement) {
              const value = current.style.getPropertyValue(name);
              if (value) return value;
            }
            current = current.parentElement;
          }
          return '';
        },
      } as CSSStyleDeclaration;
    });

    const chartA = renderHook(() => useChartTheme(chartAOwner));
    const chartB = renderHook(() => useChartTheme(chartBOwner));

    expect(chartA.result.current.palette[0]).toBe('#112233');
    expect(chartB.result.current.palette[0]).toBe('#aabbcc');

    const themeBeforeClassMutation = chartA.result.current;
    act(() => {
      tenantA.classList.add('high-contrast-provider');
    });

    await waitFor(() => {
      expect(chartA.result.current).not.toBe(themeBeforeClassMutation);
    });

    act(() => {
      tenantA.style.setProperty('--chart-series', '#445566');
      tenantA.dataset.theme = 'contrast';
    });

    await waitFor(() => {
      expect(chartA.result.current.palette[0]).toBe('#445566');
    });
    expect(chartB.result.current.palette[0]).toBe('#aabbcc');
    expect(computedOwners.every((owner) => owner === chartAOwner || owner === chartBOwner)).toBe(true);

    chartA.unmount();
    chartB.unmount();
  });

  it('resolves inline fallbacks and rejects cyclic or partially-invalid values', () => {
    const owner = providerRoot('cycles', '#112233');
    owner.style.setProperty('--cycle-a', 'var(--cycle-b)');
    owner.style.setProperty('--cycle-b', 'var(--cycle-a)');
    // Browser engines report cyclic computed custom properties as invalid.
    // happy-dom recursively computes them forever, so expose the raw authored
    // values here and exercise our resolver's own cycle guard directly.
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => ({
      getPropertyValue: (name: string) =>
        element === owner ? owner.style.getPropertyValue(name) : '',
    }) as CSSStyleDeclaration);

    expect(resolveCssColor('var(--missing, #abcdef)', null)).toBe('#abcdef');
    expect(resolveCssColor('var(--missing, var(--also-missing, #fedcba))', null)).toBe('#fedcba');
    expect(resolveCssColor('var(--cycle-a)', owner, '#010203')).toBe('#010203');
    expect(resolveCssColor('rgb(var(--missing) / 50%)', owner, '#040506')).toBe('#040506');
  });

  it('preserves concrete SSR colors and uses a non-constant categorical fallback', () => {
    expect(resolveCssColor('var(--missing)', null, '#fedcba')).toBe('#fedcba');
    expect(resolveCssColor('#123456', null, '#fedcba')).toBe('#123456');

    const chart = renderHook(() => useChartTheme(null));
    expect(chart.result.current.palette).toEqual(['#2F6B9A', '#A23B72', '#123456']);
    expect(new Set(chart.result.current.palette).size).toBe(3);
    chart.unmount();
  });

  it('resolves a RefObject whose owner is null during the initial render', async () => {
    function ChartHarness() {
      const ownerRef = useRef<HTMLDivElement>(null);
      const theme = useChartTheme(ownerRef);

      return (
        <div
          ref={ownerRef}
          data-testid="chart-owner"
          data-resolved-series={theme.palette[0]}
          style={{
            '--chart-series': '#765432',
            '--chart-nested': 'var(--chart-series)',
          } as CSSProperties}
        />
      );
    }

    const view = render(<ChartHarness />);
    await waitFor(() => {
      expect(view.getByTestId('chart-owner').dataset.resolvedSeries).toBe('#765432');
    });
  });
});
