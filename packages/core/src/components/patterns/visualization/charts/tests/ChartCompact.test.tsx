import React, { createRef } from 'react';
import { render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '../../../../../runtime/bootstrap';
import type { TenantConfig } from '../../../../../contracts';
import { useChartCompact } from '../hooks';
import { ChartScaffold } from '../chart-scaffold';
import { DEFAULT_COMPACT_CONFIG } from '../Charts.types';
import { mockMatchMedia } from '../../../../../_internal/testing/helpers/match-media';

const TEST_TENANT: TenantConfig = {
  slug: 'compact-test',
  name: 'Compact Test',
  engine: 'rustic',
  theme: 'light',
  plan: 'enterprise',
  features: ['all'],
  branding: {
    companyName: 'Compact Test',
  },
};

function Wrapper({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <DesignSystemProvider
      tenantConfig={TEST_TENANT}
      productProfile="events.organizer"
      forceEngine="rustic"
      skipCssLoading
    >
      {children}
    </DesignSystemProvider>
  );
}

describe('useChartCompact', () => {
  it('returns inactive compact state when no compact props are provided', () => {
    mockMatchMedia(1440, false);

    const { result } = renderHook(() => useChartCompact(), { wrapper: Wrapper });

    expect(result.current.isCompact).toBe(false);
    expect(result.current.hideLegend).toBe(false);
    expect(result.current.compactTooltip).toBe(false);
    expect(result.current.maxTicks).toBe(Infinity);
  });

  it('keeps compact mode inactive when configuration is provided without activation', () => {
    mockMatchMedia(1440, false);

    const { result } = renderHook(
      () => useChartCompact({ compact: { hideLegend: true } }),
      { wrapper: Wrapper },
    );

    expect(result.current.isCompact).toBe(false);
    expect(result.current.hideLegend).toBe(false);
    expect(result.current.maxTicks).toBe(Infinity);
    expect(result.current.compactTooltip).toBe(false);
  });

  it('activates compact mode explicitly via compactMode', () => {
    mockMatchMedia(1440, false);

    const { result } = renderHook(
      () => useChartCompact({ compactMode: true }),
      { wrapper: Wrapper },
    );

    expect(result.current.isCompact).toBe(true);
    expect(result.current.hideLegend).toBe(DEFAULT_COMPACT_CONFIG.hideLegend);
    expect(result.current.maxTicks).toBe(DEFAULT_COMPACT_CONFIG.maxTicks);
    expect(result.current.compactTooltip).toBe(DEFAULT_COMPACT_CONFIG.compactTooltip);
  });

  it('activates compact mode via autoCompact on mobile breakpoint', () => {
    // Simulate a mobile viewport (< 640px)
    mockMatchMedia(480, false);

    const { result } = renderHook(
      () => useChartCompact({ autoCompact: true }),
      { wrapper: Wrapper },
    );

    expect(result.current.isCompact).toBe(true);
    expect(result.current.hideLegend).toBe(DEFAULT_COMPACT_CONFIG.hideLegend);
    expect(result.current.maxTicks).toBe(DEFAULT_COMPACT_CONFIG.maxTicks);
    expect(result.current.compactTooltip).toBe(DEFAULT_COMPACT_CONFIG.compactTooltip);
    expect(result.current.minHeight).toBe(DEFAULT_COMPACT_CONFIG.minHeight);
  });

  it('does not activate autoCompact on desktop breakpoint', () => {
    mockMatchMedia(1440, false);

    const { result } = renderHook(
      () => useChartCompact({ autoCompact: true }),
      { wrapper: Wrapper },
    );

    expect(result.current.isCompact).toBe(false);
  });

  it('uses container width over viewport breakpoint when provided', () => {
    // Desktop viewport, but container is narrow
    mockMatchMedia(1440, false);

    const { result } = renderHook(
      () => useChartCompact({ autoCompact: true, containerWidth: 500 }),
      { wrapper: Wrapper },
    );

    expect(result.current.isCompact).toBe(true);
  });

  it('respects custom compactBreakpoint', () => {
    mockMatchMedia(1440, false);

    const { result } = renderHook(
      () => useChartCompact({ autoCompact: true, containerWidth: 700, compactBreakpoint: 800 }),
      { wrapper: Wrapper },
    );

    expect(result.current.isCompact).toBe(true);
  });

  it('merges compact configuration only while compact mode is active', () => {
    mockMatchMedia(1440, false);

    const { result, rerender } = renderHook(
      ({ compactMode }: { compactMode: boolean }) => useChartCompact({
        compact: { maxTicks: 2, hideLegend: false },
        compactMode,
      }),
      { initialProps: { compactMode: false }, wrapper: Wrapper },
    );

    expect(result.current.isCompact).toBe(false);
    expect(result.current.maxTicks).toBe(Infinity);
    expect(result.current.hideLegend).toBe(false);
    expect(result.current.compactTooltip).toBe(false);

    rerender({ compactMode: true });

    expect(result.current.isCompact).toBe(true);
    expect(result.current.maxTicks).toBe(2);
    expect(result.current.hideLegend).toBe(false);
    // Defaults for unspecified fields
    expect(result.current.compactTooltip).toBe(DEFAULT_COMPACT_CONFIG.compactTooltip);
  });
});

describe('ChartScaffold compact integration', () => {
  it('hides legend when hideLegend is true', () => {
    const containerRef = createRef<HTMLDivElement>();
    const svgRef = createRef<SVGSVGElement>();

    render(
      <ChartScaffold
        containerRef={containerRef}
        svgRef={svgRef}
        height={300}
        loadingLabel="Loading"
        ariaLabel="Test chart"
        ariaDescription="Test chart description"
        legend={<div data-testid="chart-legend">Legend content</div>}
        hideLegend
      />,
    );

    expect(screen.queryByTestId('chart-legend')).toBeNull();
  });

  it('shows legend when hideLegend is false', () => {
    const containerRef = createRef<HTMLDivElement>();
    const svgRef = createRef<SVGSVGElement>();

    render(
      <ChartScaffold
        containerRef={containerRef}
        svgRef={svgRef}
        height={300}
        loadingLabel="Loading"
        ariaLabel="Test chart"
        ariaDescription="Test chart description"
        legend={<div data-testid="chart-legend">Legend content</div>}
        hideLegend={false}
      />,
    );

    expect(screen.getByTestId('chart-legend')).toBeInTheDocument();
  });

  it('default chart behavior unchanged without compact props', () => {
    const containerRef = createRef<HTMLDivElement>();
    const svgRef = createRef<SVGSVGElement>();

    render(
      <ChartScaffold
        containerRef={containerRef}
        svgRef={svgRef}
        height={300}
        loadingLabel="Loading"
        ariaLabel="Test chart"
        ariaDescription="Test chart description"
        legend={<div data-testid="chart-legend">Legend content</div>}
      />,
    );

    // Legend should be visible by default
    expect(screen.getByTestId('chart-legend')).toBeInTheDocument();
  });
});
