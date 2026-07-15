import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { exportChart, useChartExport } from '../../../../../index';

vi.mock('../utils/export', () => ({
  exportChart: vi.fn().mockResolvedValue(undefined),
}));

const exportChartMock = vi.mocked(exportChart);

beforeEach(() => {
  exportChartMock.mockReset();
  exportChartMock.mockResolvedValue(undefined);
});

describe('useChartExport public contract', () => {
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

  it('uses SVG defaults without inheriting PNG-only raster options', async () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const { result } = renderHook(() => useChartExport({ current: svg }));

    await act(async () => {
      await result.current.exportSvg();
    });

    expect(exportChartMock).toHaveBeenCalledWith(svg, {
      format: 'svg',
      filename: 'chart',
    });
  });

  it('exposes loading state for the whole async export and resets it on success', async () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    let resolveExport: (() => void) | undefined;
    exportChartMock.mockImplementationOnce(() => new Promise<void>((resolve) => {
      resolveExport = resolve;
    }));
    const { result } = renderHook(() => useChartExport({ current: svg }));
    let pendingExport: Promise<void> | undefined;

    act(() => {
      pendingExport = result.current.exportSvg();
    });

    expect(result.current.isExporting).toBe(true);

    await act(async () => {
      resolveExport?.();
      await pendingExport;
    });

    expect(result.current.isExporting).toBe(false);
  });

  it('rethrows exporter failures after resetting loading state', async () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const failure = new Error('SVG serialization failed');
    exportChartMock.mockRejectedValueOnce(failure);
    const { result } = renderHook(() => useChartExport({ current: svg }));

    await act(async () => {
      await expect(result.current.exportSvg()).rejects.toBe(failure);
    });

    expect(result.current.isExporting).toBe(false);
  });

  it('fails before entering loading state when the public hook ref is unattached', async () => {
    const { result } = renderHook(() => useChartExport({ current: null }));

    await expect(result.current.exportSvg()).rejects.toThrow(
      'useChartExport: SVG ref is not attached to an element',
    );

    expect(result.current.isExporting).toBe(false);
    expect(exportChartMock).not.toHaveBeenCalled();
  });
});
