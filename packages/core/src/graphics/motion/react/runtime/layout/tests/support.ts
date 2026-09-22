import { vi } from 'vitest';

/**
 * happy-dom implements no Web Animations API, so every kernel suite installs the
 * same recording stub on the prototype (per-file forks keep it local).
 */
export type AnimateCall = { keyframes: unknown; options: unknown; target: Element };

export interface WaapiStub {
  calls: AnimateCall[];
  cancel: ReturnType<typeof vi.fn>;
  commitStyles: ReturnType<typeof vi.fn>;
}

export function installWaapi(inFlight: unknown[] = []): WaapiStub {
  const stub: WaapiStub = { calls: [], cancel: vi.fn(), commitStyles: vi.fn() };

  Element.prototype.animate = function (this: Element, keyframes: unknown, options: unknown) {
    stub.calls.push({ keyframes, options, target: this });
    return {
      cancel: stub.cancel,
      commitStyles: stub.commitStyles,
      finished: Promise.resolve(),
    } as unknown as Animation;
  } as typeof Element.prototype.animate;

  Element.prototype.getAnimations = vi.fn(
    () => inFlight,
  ) as unknown as typeof Element.prototype.getAnimations;

  return stub;
}

export function uninstallWaapi(): void {
  // @ts-expect-error -- removing the test-local WAAPI stub installed above.
  delete Element.prototype.animate;
  // @ts-expect-error -- removing the test-local WAAPI stub installed above.
  delete Element.prototype.getAnimations;
}

/** A rect stub driven by props, so "first" and "last" differ without a layout engine. */
export function stubRect(
  node: HTMLElement | null,
  box: { x?: number; y?: number; width?: number; height?: number },
): void {
  if (!node) return;
  const { x = 0, y = 0, width = 100, height = 40 } = box;
  node.getBoundingClientRect = () => ({
    left: x, top: y, right: x + width, bottom: y + height, width, height, x, y, toJSON() {},
  }) as DOMRect;
}

/** Declares the move channels on the node the kernel reads them from. */
export function statChannels(node: HTMLElement, duration = '200ms', easing = 'cubic-bezier(0.2, 0, 0, 1)'): void {
  node.style.setProperty('--ds-motion-rearrange', duration);
  node.style.setProperty('--ds-motion-resize', duration);
  node.style.setProperty('--ds-motion-ease-move', easing);
}
