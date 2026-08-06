import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ModernWatermark from '../engines/modern';

function countCanvases(spy: ReturnType<typeof vi.spyOn>): number {
  return spy.mock.calls.filter(([tag]) => tag === 'canvas').length;
}

describe('Watermark modern — raster stability across parent renders', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not re-rasterise when a parent re-renders with equal literal props', () => {
    const createElement = vi.spyOn(document, 'createElement');

    function Host() {
      const [tick, setTick] = React.useState(0);
      return (
        <div>
          <button type="button" onClick={() => setTick((value) => value + 1)}>
            bump
          </button>
          <ModernWatermark content="Draft" gap={[100, 100]} font={{ fontSize: 16 }}>
            <span>Tick {tick}</span>
          </ModernWatermark>
        </div>
      );
    }

    render(<Host />);
    const afterMount = countCanvases(createElement);
    expect(afterMount).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'bump' }));
    expect(screen.getByText('Tick 1')).toBeInTheDocument();

    expect(countCanvases(createElement)).toBe(afterMount);
  });

  it('re-rasterises when a real input changes', () => {
    const createElement = vi.spyOn(document, 'createElement');

    function Host() {
      const [size, setSize] = React.useState(16);
      return (
        <div>
          <button type="button" onClick={() => setSize(24)}>
            grow
          </button>
          <ModernWatermark content="Draft" gap={[100, 100]} font={{ fontSize: size }}>
            <span>Document</span>
          </ModernWatermark>
        </div>
      );
    }

    render(<Host />);
    const afterMount = countCanvases(createElement);

    fireEvent.click(screen.getByRole('button', { name: 'grow' }));

    expect(countCanvases(createElement)).toBe(afterMount + 1);
  });
});
