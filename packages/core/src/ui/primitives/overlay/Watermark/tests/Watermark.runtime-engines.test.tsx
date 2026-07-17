import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ModernWatermark from '../engines/modern';
import RusticWatermark from '../engines/rustic';
import { WATERMARK_CANVAS_BUDGET } from '../runtime/canvas-pattern';

const REAL_ENGINES = [
  ['modern', ModernWatermark],
  ['rustic', RusticWatermark],
] as const;

interface RecordedContext {
  fillStyle: string | CanvasGradient | CanvasPattern;
  font: string;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  scale: ReturnType<typeof vi.fn>;
  translate: ReturnType<typeof vi.fn>;
  rotate: ReturnType<typeof vi.fn>;
  drawImage: ReturnType<typeof vi.fn>;
  fillText: ReturnType<typeof vi.fn>;
}

function installCanvasRecorder() {
  const canvases: HTMLCanvasElement[] = [];
  const allocations: Array<{ width: number; height: number }> = [];
  const contexts: RecordedContext[] = [];

  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function () {
    const context: RecordedContext = {
      fillStyle: '',
      font: '',
      textAlign: 'start',
      textBaseline: 'alphabetic',
      scale: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      drawImage: vi.fn(),
      fillText: vi.fn(),
    };
    canvases.push(this);
    allocations.push({ width: this.width, height: this.height });
    contexts.push(context);
    return context as unknown as CanvasRenderingContext2D;
  });

  return { allocations, canvases, contexts };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe.each(REAL_ENGINES)('%s Watermark runtime', (_name, RuntimeWatermark) => {
  it('resolves provider-scoped color before painting functional text', async () => {
    const recorder = installCanvasRecorder();

    const { container } = render(
      <section>
        <RuntimeWatermark
          content="Confidential"
          font={{ color: 'var(--local-watermark)', fontSize: 18 }}
        >
          <p>Protected</p>
        </RuntimeWatermark>
      </section>,
    );

    await waitFor(() => expect(recorder.contexts[0]?.fillText).toHaveBeenCalled());
    const pattern = container.querySelector('[data-part="pattern"]') as HTMLDivElement;
    pattern.style.setProperty('--local-watermark', '#245c72');
    const provider = pattern.parentElement!;
    provider.setAttribute('data-theme', 'local-repaint');

    await waitFor(() => expect(recorder.contexts).toHaveLength(2));
    expect(recorder.contexts[1]?.fillStyle).toBe('#245c72');
    expect(pattern).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(pattern.style.backgroundSize).toBe('220px 164px');
  });

  it('bounds DPR, each dimension and total pixels for hostile inputs', async () => {
    const recorder = installCanvasRecorder();
    vi.spyOn(window, 'devicePixelRatio', 'get').mockReturnValue(12);

    render(
      <RuntimeWatermark
        content="Bounded"
        width={Number.MAX_SAFE_INTEGER}
        height={Number.MAX_SAFE_INTEGER}
        gap={[Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]}
      >
        <p>Protected</p>
      </RuntimeWatermark>,
    );

    await waitFor(() => expect(recorder.canvases).toHaveLength(1));
    const allocation = recorder.allocations[0]!;
    const scale = recorder.contexts[0]?.scale.mock.calls[0]?.[0] as number;
    expect(scale).toBeLessThanOrEqual(WATERMARK_CANVAS_BUDGET.maxDpr);
    expect(allocation.width).toBeLessThanOrEqual(WATERMARK_CANVAS_BUDGET.maxDimension);
    expect(allocation.height).toBeLessThanOrEqual(WATERMARK_CANVAS_BUDGET.maxDimension);
    expect(allocation.width * allocation.height).toBeLessThanOrEqual(
      WATERMARK_CANVAS_BUDGET.maxPixels,
    );
  });

  it('revokes stale image callbacks on replacement and unmount', async () => {
    installCanvasRecorder();
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      'data:image/png;base64,AAAA',
    );
    const images: ControlledImage[] = [];

    class ControlledImage {
      crossOrigin = '';
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      private source = '';

      constructor() {
        images.push(this);
      }

      set src(value: string) {
        this.source = value;
      }

      get src(): string {
        return this.source;
      }
    }

    vi.stubGlobal('Image', ControlledImage);
    const { container, rerender, unmount } = render(
      <RuntimeWatermark image="first.png"><p>Protected</p></RuntimeWatermark>,
    );

    await waitFor(() => expect(images).toHaveLength(1));
    const first = images[0]!;
    rerender(
      <RuntimeWatermark image="second.png"><p>Protected</p></RuntimeWatermark>,
    );

    await waitFor(() => expect(images).toHaveLength(2));
    expect(first.onload).toBeNull();
    expect(first.onerror).toBeNull();

    const second = images[1]!;
    act(() => {
      second.onload?.();
    });
    expect(
      (container.querySelector('[data-part="pattern"]') as HTMLDivElement).style.backgroundImage,
    ).toContain('data:image/png;base64,AAAA');

    unmount();
    expect(second.onload).toBeNull();
    expect(second.onerror).toBeNull();
  });
});
