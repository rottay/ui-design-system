// An <img> that settled before its handlers attach (cache hit, SSR hydration)
// fires neither `load` nor `error`, so BOTH outcomes reconcile from `complete`.

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ModernAvatar from '../engines/modern';
import { renderWithEngine } from '@/tooling/testing/helpers/engine';

/** Pin the settled-image observables the way a real cache hit would report them. */
function stubSettledImage(naturalWidth: number) {
  const proto = HTMLImageElement.prototype;
  const original = {
    complete: Object.getOwnPropertyDescriptor(proto, 'complete'),
    naturalWidth: Object.getOwnPropertyDescriptor(proto, 'naturalWidth'),
  };
  Object.defineProperty(proto, 'complete', { configurable: true, get: () => true });
  Object.defineProperty(proto, 'naturalWidth', { configurable: true, get: () => naturalWidth });
  return () => {
    if (original.complete) Object.defineProperty(proto, 'complete', original.complete);
    else delete (proto as unknown as Record<string, unknown>).complete;
    if (original.naturalWidth) Object.defineProperty(proto, 'naturalWidth', original.naturalWidth);
    else delete (proto as unknown as Record<string, unknown>).naturalWidth;
  };
}

let restore: (() => void) | null = null;
afterEach(() => {
  restore?.();
  restore = null;
});

describe('Avatar modern settled-image reconcile', () => {
  it('falls back to initials when a cached image already failed', () => {
    restore = stubSettledImage(0);
    const onError = vi.fn();

    const { container } = renderWithEngine(
      <ModernAvatar src="/cached-404.png" name="Jane Doe" onError={onError} />,
      'modern',
    );

    expect(container.querySelector('[data-part="img"]')).toBeNull();
    const fallback = container.querySelector('[data-part="fallback"]');
    expect(fallback).toBeTruthy();
    expect(fallback?.textContent).toBe('JD');
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it('reports the cache-hit success through onLoad and the loaded stamp', () => {
    restore = stubSettledImage(128);
    const onLoad = vi.fn();

    const { container } = renderWithEngine(
      <ModernAvatar src="/cached-ok.png" name="Jane Doe" onLoad={onLoad} />,
      'modern',
    );

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root.getAttribute('data-loaded')).toBe('true');
    expect(container.querySelector('[data-part="img"]')).toBeTruthy();
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it('leaves a still-loading image alone', () => {
    const onError = vi.fn();
    const onLoad = vi.fn();

    const { container } = renderWithEngine(
      <ModernAvatar src="/slow.png" name="Jane Doe" onError={onError} onLoad={onLoad} />,
      'modern',
    );

    expect(container.querySelector('[data-part="img"]')).toBeTruthy();
    expect(container.querySelector('[data-part="root"]')?.getAttribute('data-loaded')).toBeNull();
    expect(onError).not.toHaveBeenCalled();
    expect(onLoad).not.toHaveBeenCalled();
  });
});
