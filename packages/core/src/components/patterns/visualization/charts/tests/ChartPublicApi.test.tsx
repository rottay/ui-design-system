import React, { useRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';

import {
  exportChart,
  useChartBrush,
  useChartExport,
  useChartTheme,
  type ChartColorOwner,
  type ChartColorScheme,
  type ChartTheme,
  type ChartThemeOwner,
} from '../../../../../index';

function BrushHarness({
  onBrush,
  onBrushEnd,
}: {
  onBrush: (selection: { start: number; end: number } | null) => void;
  onBrushEnd: (selection: { start: number; end: number } | null) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const brush = useChartBrush({
    svgRef,
    width: 200,
    height: 100,
    margin: { top: 0, right: 20, bottom: 0, left: 20 },
    enabled: true,
    xScale: { invert: (pixel) => pixel * 2 },
    onBrush,
    onBrushEnd,
  });

  return (
    <div>
      <svg ref={svgRef} data-testid="brush-svg" width={200} height={130}>
        {brush.renderBrush()}
      </svg>
      <output data-testid="brush-selection">
        {brush.selection ? `${brush.selection.start}:${brush.selection.end}` : 'none'}
      </output>
    </div>
  );
}

describe('public chart api', () => {
  it('exports the interaction, export, and provider-scoped theme contract from the package root', () => {
    expect(useChartBrush).toBeTypeOf('function');
    expect(useChartExport).toBeTypeOf('function');
    expect(exportChart).toBeTypeOf('function');
    expect(useChartTheme).toBeTypeOf('function');

    expectTypeOf<ReturnType<typeof useChartTheme>>().toEqualTypeOf<ChartTheme>();
    expectTypeOf<HTMLElement>().toMatchTypeOf<ChartColorOwner>();

    const scheme: ChartColorScheme = 'accessible';
    const owner: ChartThemeOwner = document.createElement('div');
    expect(scheme).toBe('accessible');
    expect(owner).toBeInstanceOf(HTMLElement);
  });

  it('creates an inverted-domain brush selection and clears it through public interaction handlers', () => {
    const onBrush = vi.fn();
    const onBrushEnd = vi.fn();
    render(<BrushHarness onBrush={onBrush} onBrushEnd={onBrushEnd} />);

    const svg = screen.getByTestId('brush-svg') as unknown as SVGSVGElement;
    svg.getBoundingClientRect = vi.fn(() => ({
      x: 10,
      y: 0,
      left: 10,
      top: 0,
      right: 210,
      bottom: 130,
      width: 200,
      height: 130,
      toJSON: () => ({}),
    }));

    const interaction = screen
      .getByTestId('chart-brush')
      .querySelector<SVGRectElement>('[data-part="brush-interaction"]');
    expect(interaction).not.toBeNull();
    if (!interaction) return;

    interaction.setPointerCapture = vi.fn();
    interaction.releasePointerCapture = vi.fn();

    fireEvent.pointerDown(interaction, { clientX: 50, pointerId: 7 });
    fireEvent.pointerMove(interaction, { clientX: 110, pointerId: 7 });

    expect(onBrush).toHaveBeenLastCalledWith({ start: 40, end: 160 });
    expect(screen.getByTestId('brush-selection')).toHaveTextContent('40:160');
    expect(screen.getByTestId('chart-brush')).toHaveAttribute('data-state', 'brushing');

    fireEvent.pointerUp(interaction, { clientX: 110, pointerId: 7 });

    expect(onBrushEnd).toHaveBeenLastCalledWith({ start: 40, end: 160 });
    expect(screen.getByTestId('chart-brush')).toHaveAttribute('data-state', 'selected');
    expect(screen.getByTestId('chart-brush').querySelector('[data-part="brush-selection"]'))
      .toHaveAttribute('width', '60');

    fireEvent.doubleClick(
      screen.getByTestId('chart-brush').querySelector('[data-part="brush-interaction"]')!,
    );

    expect(onBrush).toHaveBeenLastCalledWith(null);
    expect(onBrushEnd).toHaveBeenLastCalledWith(null);
    expect(screen.getByTestId('brush-selection')).toHaveTextContent('none');
    expect(screen.getByTestId('chart-brush')).toHaveAttribute('data-state', 'idle');
  });
});
