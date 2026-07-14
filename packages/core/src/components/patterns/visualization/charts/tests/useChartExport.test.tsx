import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useChartExport } from '../hooks/use-chart-export';
import { exportChart } from '../utils/export';

vi.mock('../utils/export', () => ({
  exportChart: vi.fn().mockResolvedValue(undefined),
}));

const exportChartMock = vi.mocked(exportChart);

beforeEach(() => {
  exportChartMock.mockClear();
});

describe('useChartExport PNG defaults', () => {
  it('delegates the utility-owned white default without duplicating paint', async () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const { result } = renderHook(() => useChartExport({ current: svg }));

    await act(async () => {
      await result.current.exportPng();
    });

    expect(exportChartMock).toHaveBeenCalledWith(svg, {
      format: 'png',
      scale: 2,
      filename: 'chart',
    });
  });

  it('keeps an explicit caller background override authoritative', async () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const { result } = renderHook(() => useChartExport({ current: svg }));

    await act(async () => {
      await result.current.exportPng({ backgroundColor: '#123456', scale: 3 });
    });

    expect(exportChartMock).toHaveBeenCalledWith(svg, {
      format: 'png',
      scale: 3,
      filename: 'chart',
      backgroundColor: '#123456',
    });
  });
});
