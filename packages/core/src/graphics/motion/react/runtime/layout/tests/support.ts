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

/**
 * A WAAPI stand-in that models what the recording stub cannot: which animations
 * stay in effect after they finish (fill), and what `commitStyles()` writes
 * inline. The rendered transform is the in-effect animation's pose, else the
 * inline style, else the stylesheet -- the cascade a real browser applies.
 */
export interface ModeledWaapi {
  /** Runs every live animation to its end, as a completed reflow would. */
  finishAll: () => void;
  /** The transform a real browser would render on the node right now. */
  renderedTransform: (node: HTMLElement) => string;
  /** Animations still in effect on the node (`getAnimations()`). */
  inEffect: (node: Element) => number;
}

interface ModeledAnimation {
  node: Element;
  keyframes: Array<{ transform?: string }>;
  fill: FillMode;
  state: 'running' | 'finished' | 'idle';
}

export function installModeledWaapi(): ModeledWaapi {
  const live: ModeledAnimation[] = [];
  const holdsEndPose = (animation: ModeledAnimation) => animation.fill === 'forwards' || animation.fill === 'both';
  const effective = (node: Element) => live.filter((animation) => animation.node === node
    && (animation.state === 'running' || (animation.state === 'finished' && holdsEndPose(animation))));
  const pose = (animation: ModeledAnimation) => {
    const frame = animation.state === 'finished' ? animation.keyframes[animation.keyframes.length - 1] : animation.keyframes[0];
    return frame?.transform;
  };

  Element.prototype.animate = function (this: Element, keyframes: unknown, options: unknown) {
    const record: ModeledAnimation = {
      node: this,
      keyframes: keyframes as ModeledAnimation['keyframes'],
      fill: ((options as KeyframeAnimationOptions).fill ?? 'auto') as FillMode,
      state: 'running',
    };
    live.push(record);
    return {
      cancel() { record.state = 'idle'; },
      commitStyles() {
        const value = pose(record);
        if (value !== undefined) (record.node as HTMLElement).style.transform = value;
      },
      finished: Promise.resolve(),
    } as unknown as Animation;
  } as typeof Element.prototype.animate;

  Element.prototype.getAnimations = function (this: Element) {
    return effective(this).map((record) => ({
      cancel() { record.state = 'idle'; },
      commitStyles() {
        const value = pose(record);
        if (value !== undefined) (record.node as HTMLElement).style.transform = value;
      },
    }));
  } as unknown as typeof Element.prototype.getAnimations;

  return {
    finishAll() {
      for (const animation of live) if (animation.state === 'running') animation.state = 'finished';
    },
    renderedTransform(node) {
      const animated = effective(node).map(pose).filter((value) => value !== undefined).pop();
      return animated ?? (node.style.transform || getComputedStyle(node).transform);
    },
    inEffect: (node) => effective(node).length,
  };
}
