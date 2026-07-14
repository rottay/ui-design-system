import { afterEach, describe, expect, it, vi } from 'vitest';

import { exportChart } from '../utils/export';

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
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => {
    callback(new Blob(['png'], { type: 'image/png' }));
  });

  return { events, context };
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
});
