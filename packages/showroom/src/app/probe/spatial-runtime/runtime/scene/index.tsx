'use client';

import { useEffect, useRef } from 'react';
import type {
  SpatialSceneModule,
  SpatialSceneRuntimeProps,
} from '@rottay/design-system/spatial';

const MAX_BACKING_DIMENSION = 2_560;
const MAX_BACKING_PIXELS = 4_194_304;

function resolveBackingStore(
  canvas: HTMLCanvasElement,
  maxDpr: number,
): { readonly dpr: number; readonly height: number; readonly width: number } {
  const rect = canvas.getBoundingClientRect();
  const cssWidth = Math.max(1, Math.floor(rect.width));
  const cssHeight = Math.max(1, Math.floor(rect.height));
  const requestedDpr = Math.max(1, Math.min(window.devicePixelRatio || 1, maxDpr));
  const dimensionDpr = Math.min(
    requestedDpr,
    MAX_BACKING_DIMENSION / cssWidth,
    MAX_BACKING_DIMENSION / cssHeight,
  );
  const pixelDpr = Math.sqrt(MAX_BACKING_PIXELS / (cssWidth * cssHeight));
  const dpr = Math.max(0.25, Math.min(dimensionDpr, pixelDpr));

  return {
    dpr,
    height: Math.max(1, Math.floor(cssHeight * dpr)),
    width: Math.max(1, Math.floor(cssWidth * dpr)),
  };
}

function SpatialProbeScene({
  id,
  quality,
  registerCanvas,
  reportError,
  reportPerformance,
  reportReady,
}: SpatialSceneRuntimeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let context: WebGL2RenderingContext | null = null;
    try {
      context = canvas.getContext('webgl2', {
        alpha: true,
        antialias: quality.antialias,
        powerPreference: quality.powerPreference,
      });
    } catch {
      context = null;
    }
    if (!context) {
      reportError(new Error('webgl2-context-unavailable'));
      return undefined;
    }

    let disposed = false;
    let frame = 0;
    let rafId = 0;
    const startedAt = performance.now();

    const resize = (): void => {
      if (disposed) return;
      const allocation = resolveBackingStore(canvas, quality.maxDpr);
      canvas.width = allocation.width;
      canvas.height = allocation.height;
      canvas.dataset.spatialProbeDpr = allocation.dpr.toFixed(3);
      canvas.dataset.spatialProbePixels = String(allocation.width * allocation.height);
      context?.viewport(0, 0, allocation.width, allocation.height);
    };

    const draw = (timestamp: number): void => {
      if (disposed || !context) return;
      const callbackStartedAt = performance.now();
      const phase = (Math.sin((timestamp - startedAt) * 0.0007) + 1) / 2;
      context.clearColor(
        id === 'spatial-primary' ? 0.075 : 0.78,
        id === 'spatial-primary' ? 0.44 : 0.27,
        id === 'spatial-primary' ? 0.42 : 0.21,
        0.22 + phase * 0.16,
      );
      context.clear(context.COLOR_BUFFER_BIT);
      frame += 1;
      canvas.dataset.spatialProbeFrames = String(frame);
      reportPerformance({ frameTimeMs: performance.now() - callbackStartedAt });
      rafId = window.requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const unregister = registerCanvas(canvas, () => {
      if (disposed) return;
      disposed = true;
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      context = null;
    });
    reportReady();
    rafId = window.requestAnimationFrame(draw);

    return unregister;
  }, [id, quality, registerCanvas, reportError, reportPerformance, reportReady]);

  return (
    <canvas
      ref={canvasRef}
      data-spatial-probe-canvas={id}
      style={{ display: 'block', height: '100%', width: '100%' }}
    />
  );
}

export const SPATIAL_PROBE_SCENE_MODULE: SpatialSceneModule = {
  backend: 'webgl2',
  Scene: SpatialProbeScene,
  version: 1,
};
