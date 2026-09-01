'use client';

import { useEffect, useRef, useState } from 'react';

import {
  PROVIDER_PAINT_ATTRIBUTE_FILTER,
  resolveCssColor,
} from '@/infrastructure/runtime/dom/runtime/css-color-resolution';
import type { WatermarkFont } from '../../contracts';
import { WATERMARK_DEFAULTS } from '../../contracts';

export const WATERMARK_CANVAS_BUDGET = Object.freeze({
  maxDpr: 2,
  maxDimension: 2_048,
  maxPixels: 4_194_304,
});

const DEFAULT_WIDTH = 120;
const DEFAULT_HEIGHT = 64;
const DEFAULT_GAP: [number, number] = [100, 100];
const DEFAULT_COLOR = 'rgba(0, 0, 0, 0.15)';

function finiteInRange(
  value: number | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  return Number.isFinite(value)
    ? Math.min(maximum, Math.max(minimum, value as number))
    : fallback;
}

export interface WatermarkCanvasMetrics {
  logicalWidth: number;
  logicalHeight: number;
  contentWidth: number;
  contentHeight: number;
  effectiveDpr: number;
  pixelWidth: number;
  pixelHeight: number;
  pixelCount: number;
}

/** Normalize hostile dimensions before an off-screen Canvas is allocated. */
export function resolveWatermarkCanvasMetrics(
  width: number | undefined,
  height: number | undefined,
  gap: [number, number] | undefined,
  devicePixelRatio: number | undefined,
): WatermarkCanvasMetrics {
  const contentWidth = finiteInRange(
    width,
    DEFAULT_WIDTH,
    1,
    WATERMARK_CANVAS_BUDGET.maxDimension,
  );
  const contentHeight = finiteInRange(
    height,
    DEFAULT_HEIGHT,
    1,
    WATERMARK_CANVAS_BUDGET.maxDimension,
  );
  const gapX = finiteInRange(
    gap?.[0],
    DEFAULT_GAP[0],
    0,
    WATERMARK_CANVAS_BUDGET.maxDimension,
  );
  const gapY = finiteInRange(
    gap?.[1],
    DEFAULT_GAP[1],
    0,
    WATERMARK_CANVAS_BUDGET.maxDimension,
  );
  const logicalWidth = Math.min(
    WATERMARK_CANVAS_BUDGET.maxDimension,
    contentWidth + gapX,
  );
  const logicalHeight = Math.min(
    WATERMARK_CANVAS_BUDGET.maxDimension,
    contentHeight + gapY,
  );
  const requestedDpr = finiteInRange(
    devicePixelRatio,
    1,
    1,
    WATERMARK_CANVAS_BUDGET.maxDpr,
  );
  const dimensionDpr = Math.min(
    WATERMARK_CANVAS_BUDGET.maxDimension / logicalWidth,
    WATERMARK_CANVAS_BUDGET.maxDimension / logicalHeight,
  );
  const pixelDpr = Math.sqrt(
    WATERMARK_CANVAS_BUDGET.maxPixels / (logicalWidth * logicalHeight),
  );
  const effectiveDpr = Math.max(1, Math.min(requestedDpr, dimensionDpr, pixelDpr));
  const pixelWidth = Math.max(1, Math.floor(logicalWidth * effectiveDpr));
  const pixelHeight = Math.max(1, Math.floor(logicalHeight * effectiveDpr));

  return {
    logicalWidth,
    logicalHeight,
    contentWidth: Math.min(contentWidth, logicalWidth),
    contentHeight: Math.min(contentHeight, logicalHeight),
    effectiveDpr,
    pixelWidth,
    pixelHeight,
    pixelCount: pixelWidth * pixelHeight,
  };
}

interface WatermarkCanvasPatternOptions {
  content?: string | string[];
  image?: string;
  width?: number;
  height?: number;
  rotate?: number;
  gap?: [number, number];
  font?: WatermarkFont;
}

export interface WatermarkCanvasPattern {
  backgroundImage: string;
  backgroundSize: string;
  patternRef: React.RefObject<HTMLDivElement | null>;
}

function canvasDataUrl(canvas: HTMLCanvasElement): string {
  try {
    return canvas.toDataURL('image/png');
  } catch {
    return '';
  }
}

/**
 * Produce one bounded, provider-scoped watermark tile. Image callbacks are
 * revoked on every regeneration and unmount, so stale loads cannot overwrite a
 * newer watermark or update state after the owner disappears.
 */
export function useWatermarkCanvasPattern({
  content,
  image,
  width,
  height,
  rotate = WATERMARK_DEFAULTS.rotate,
  gap,
  font,
}: WatermarkCanvasPatternOptions): WatermarkCanvasPattern {
  const patternRef = useRef<HTMLDivElement>(null);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [paintRevision, setPaintRevision] = useState(0);

  useEffect(() => {
    const owner = patternRef.current;
    if (!owner || typeof MutationObserver === 'undefined') return undefined;

    const observer = new MutationObserver(() => {
      setPaintRevision((revision) => revision + 1);
    });
    // Observe provider ancestors, not the generated pattern node itself: its
    // background-image/style changes are output, not a theme invalidation.
    let current: Element | null = owner.parentElement;
    while (current) {
      observer.observe(current, {
        attributes: true,
        attributeFilter: [...PROVIDER_PAINT_ATTRIBUTE_FILTER],
      });
      current = current.parentElement;
    }

    return () => observer.disconnect();
  }, []);

  const metrics = resolveWatermarkCanvasMetrics(
    width,
    height,
    gap,
    typeof window === 'undefined' ? 1 : window.devicePixelRatio,
  );

  useEffect(() => {
    let active = true;
    let pendingImage: HTMLImageElement | null = null;
    setBackgroundImage('');

    if (typeof document === 'undefined' || (!image && !content)) {
      return () => {
        active = false;
      };
    }

    const canvas = document.createElement('canvas');
    canvas.width = metrics.pixelWidth;
    canvas.height = metrics.pixelHeight;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      ctx = null;
    }
    if (!ctx) {
      canvas.width = 1;
      canvas.height = 1;
      return () => {
        active = false;
      };
    }

    ctx.scale(metrics.effectiveDpr, metrics.effectiveDpr);
    ctx.translate(metrics.logicalWidth / 2, metrics.logicalHeight / 2);
    ctx.rotate((finiteInRange(rotate, -22, -360, 360) * Math.PI) / 180);

    const commit = () => {
      if (!active) return;
      const dataUrl = canvasDataUrl(canvas);
      if (dataUrl) setBackgroundImage(`url(${dataUrl})`);
      canvas.width = 1;
      canvas.height = 1;
    };

    if (image) {
      const nextImage = new Image();
      pendingImage = nextImage;
      nextImage.crossOrigin = 'anonymous';
      nextImage.onload = () => {
        if (!active || pendingImage !== nextImage) return;
        try {
          ctx?.drawImage(
            nextImage,
            -metrics.contentWidth / 2,
            -metrics.contentHeight / 2,
            metrics.contentWidth,
            metrics.contentHeight,
          );
          commit();
        } catch {
          if (active) setBackgroundImage('');
          canvas.width = 1;
          canvas.height = 1;
        } finally {
          nextImage.onload = null;
          nextImage.onerror = null;
          pendingImage = null;
        }
      };
      nextImage.onerror = () => {
        if (active && pendingImage === nextImage) {
          setBackgroundImage('');
          canvas.width = 1;
          canvas.height = 1;
        }
        nextImage.onload = null;
        nextImage.onerror = null;
        pendingImage = null;
      };
      nextImage.src = image;
    } else if (content) {
      const mergedFont = { ...WATERMARK_DEFAULTS.font, ...font };
      const fontSize = finiteInRange(mergedFont.fontSize, 16, 1, 512);
      const fontStyle = mergedFont.fontStyle === 'none'
        ? 'normal'
        : (mergedFont.fontStyle ?? 'normal');
      const fontWeight = mergedFont.fontWeight ?? 'normal';
      const fontFamily = mergedFont.fontFamily || 'sans-serif';
      const owner = patternRef.current;
      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = resolveCssColor(
        mergedFont.color || DEFAULT_COLOR,
        owner,
        DEFAULT_COLOR,
      );
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const lines = (Array.isArray(content) ? content : [content]).slice(0, 32);
      const lineHeight = fontSize * 1.5;
      const startY = -((lines.length - 1) * lineHeight) / 2;
      lines.forEach((line, index) => {
        ctx?.fillText(line.slice(0, 1_024), 0, startY + index * lineHeight);
      });
      commit();
    }

    return () => {
      active = false;
      if (pendingImage) {
        pendingImage.onload = null;
        pendingImage.onerror = null;
        pendingImage = null;
      }
      canvas.width = 1;
      canvas.height = 1;
    };
    // paintRevision is the provider-chain invalidation signal.
  }, [content, font, gap, height, image, metrics.contentHeight, metrics.contentWidth,
    metrics.effectiveDpr, metrics.logicalHeight, metrics.logicalWidth,
    metrics.pixelHeight, metrics.pixelWidth, paintRevision, rotate, width]);

  return {
    backgroundImage,
    backgroundSize: `${metrics.logicalWidth}px ${metrics.logicalHeight}px`,
    patternRef,
  };
}
