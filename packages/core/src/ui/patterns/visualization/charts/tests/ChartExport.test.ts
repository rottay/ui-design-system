import { afterEach, describe, expect, it, vi } from 'vitest';

import { exportChart } from '../../../../../index';
import {
  CHART_PNG_RASTER_BUDGET,
  resolvePngRasterPlan,
} from '../runtime/exporting/foundation/file';

function chartSvg(): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '120');
  svg.setAttribute('height', '60');
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('class', 'export-mark');
  rect.setAttribute('width', '120');
  rect.setAttribute('height', '60');
  svg.appendChild(rect);
  document.body.appendChild(svg);
  return svg;
}

function installDownloadStubs() {
  const createObjectURL = vi.fn(() => 'blob:chart-export-test');
  vi.stubGlobal('URL', {
    createObjectURL,
    revokeObjectURL: vi.fn(),
  });
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
  vi.spyOn(globalThis, 'setTimeout').mockImplementation(((handler: TimerHandler) => {
    if (typeof handler === 'function') handler();
    return 0;
  }) as typeof setTimeout);
  return createObjectURL;
}

function installRasterStubs() {
  const events: string[] = [];
  let fillStyle = '';
  const context = {
    get fillStyle() {
      return fillStyle;
    },
    set fillStyle(value: string | CanvasGradient | CanvasPattern) {
      fillStyle = String(value);
      events.push(`fillStyle:${fillStyle}`);
    },
    fillRect: vi.fn(() => events.push('fillRect')),
    scale: vi.fn(() => events.push('scale')),
    drawImage: vi.fn(() => events.push('drawImage')),
  };
  let rasterCanvas: HTMLCanvasElement | null = null;

  class ImmediateImage {
    crossOrigin = '';
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;

    set src(_value: string) {
      queueMicrotask(() => this.onload?.());
    }
  }

  vi.stubGlobal('Image', ImmediateImage);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (callback) {
    rasterCanvas = this;
    callback(new Blob(['png'], { type: 'image/png' }));
  });

  return { events, context, rasterCanvas: () => rasterCanvas };
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('chart export paint fidelity', () => {
  it('uses the same exact white PNG default when the wrapper omits backgroundColor', async () => {
    installDownloadStubs();
    const { events, context } = installRasterStubs();

    await exportChart(chartSvg(), { format: 'png', scale: 2, filename: 'default' });

    expect(context.fillStyle).toBe('#ffffff');
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 240, 120);
    expect(events.indexOf('fillRect')).toBeLessThan(events.indexOf('drawImage'));
  });

  it('keeps an explicit PNG background override authoritative', async () => {
    installDownloadStubs();
    const { context } = installRasterStubs();

    await exportChart(chartSvg(), {
      format: 'png',
      backgroundColor: '#123456',
      filename: 'override',
    });

    expect(context.fillStyle).toBe('#123456');
  });

  it('caps scale, dimensions and total pixels before allocating a PNG canvas', async () => {
    installDownloadStubs();
    const raster = installRasterStubs();
    const svg = chartSvg();
    svg.setAttribute('width', '20000');
    svg.setAttribute('height', '10000');

    await exportChart(svg, { format: 'png', scale: 999, filename: 'bounded' });

    const canvas = raster.rasterCanvas();
    expect(canvas).not.toBeNull();
    expect(canvas!.width).toBeLessThanOrEqual(CHART_PNG_RASTER_BUDGET.maxDimension);
    expect(canvas!.height).toBeLessThanOrEqual(CHART_PNG_RASTER_BUDGET.maxDimension);
    expect(canvas!.width * canvas!.height).toBeLessThanOrEqual(
      CHART_PNG_RASTER_BUDGET.maxPixels,
    );
  });

  it('normalizes non-finite or non-positive raster requests without NaN allocations', () => {
    expect(resolvePngRasterPlan({ width: Infinity, height: Number.NaN }, -5)).toEqual({
      scale: 2,
      pixelWidth: 1600,
      pixelHeight: 1200,
      pixelCount: 1_920_000,
    });
    expect(resolvePngRasterPlan({ width: 120, height: 60 }, 999)).toEqual({
      scale: 4,
      pixelWidth: 480,
      pixelHeight: 240,
      pixelCount: 115_200,
    });
  });

  it('copies stylesheet-owned SVG paint into standalone export attributes', async () => {
    const createObjectURL = installDownloadStubs();
    const style = document.createElement('style');
    style.textContent = '.export-mark { fill: rgb(18, 52, 86); stroke: rgb(101, 67, 33); }';
    document.head.appendChild(style);

    await exportChart(chartSvg(), { format: 'svg', filename: 'stylesheet-paint' });

    const blob = createObjectURL.mock.calls[0]?.[0];
    expect(blob).toBeInstanceOf(Blob);
    const exported = await (blob as Blob).text();
    expect(exported).toContain('fill="rgb(18, 52, 86)"');
    expect(exported).toContain('stroke="rgb(101, 67, 33)"');
    style.remove();
  });

  it('bakes owner-scoped nested variables into SVG paint with no var() residue', async () => {
    const createObjectURL = installDownloadStubs();
    const svg = chartSvg();
    const rect = svg.querySelector('.export-mark') as SVGRectElement;
    svg.style.setProperty('--export-background', '#f4f5f6');
    rect.style.setProperty('--export-base', 'rgb(12, 34, 56)');
    rect.style.setProperty('--export-paint', 'var(--export-base)');
    rect.setAttribute('fill', 'var(--export-paint, #000000)');
    rect.setAttribute('stroke', 'var(--missing-stroke, rgb(65, 43, 21))');

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const embeddedStyle = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    embeddedStyle.textContent = '.unused { fill: var(--stylesheet-residue); }';
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop.style.setProperty('--export-stop', '#789abc');
    stop.setAttribute('stop-color', 'var(--export-stop)');
    gradient.appendChild(stop);
    defs.append(embeddedStyle, gradient);
    svg.insertBefore(defs, rect);
    const computedStyle = vi.spyOn(window, 'getComputedStyle');

    await exportChart(svg, {
      format: 'svg',
      filename: 'tenant-paint',
      backgroundColor: 'var(--export-background)',
    });

    const blob = createObjectURL.mock.calls[0]?.[0];
    const exported = await (blob as Blob).text();
    expect(exported).toContain('fill="rgb(12, 34, 56)"');
    expect(exported).toContain('stroke="rgb(65, 43, 21)"');
    expect(exported).toContain('fill="#f4f5f6"');
    expect(exported).toContain('stop-color="#789abc"');
    expect(exported).not.toContain('<style');
    expect(exported).not.toContain('var(');
    expect(computedStyle).not.toHaveBeenCalledWith(document.documentElement);
  });
});
