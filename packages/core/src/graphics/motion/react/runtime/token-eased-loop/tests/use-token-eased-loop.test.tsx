import React, { useRef } from 'react';
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useTokenEasedLoop } from '..';
import type { UseTokenEasedLoopOptions } from '..';

type AnimateCall = { keyframes: unknown; options: KeyframeAnimationOptions };

let animateCalls: AnimateCall[];
let cancelSpy: ReturnType<typeof vi.fn>;
let rejectEasing: string | undefined;

beforeEach(() => {
  animateCalls = [];
  cancelSpy = vi.fn();
  rejectEasing = undefined;
  Element.prototype.animate = function (keyframes: unknown, options: unknown) {
    const resolved = options as KeyframeAnimationOptions;
    if (rejectEasing && resolved.easing === rejectEasing) throw new TypeError('invalid easing');
    animateCalls.push({ keyframes, options: resolved });
    return { cancel: cancelSpy } as unknown as Animation;
  } as typeof Element.prototype.animate;
});

afterEach(() => {
  // @ts-expect-error happy-dom ships no Web Animations API; remove the stub.
  delete Element.prototype.animate;
});

function Probe({ ease, ...props }: Omit<UseTokenEasedLoopOptions, 'keyframes'> & { ease?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useTokenEasedLoop(ref, { ...props, keyframes: [{ opacity: 0.5 }, { opacity: 1 }] });
  const style = ease ? ({ '--ds-motion-ease-in-out': ease } as React.CSSProperties) : undefined;
  return <div ref={ref} style={style} />;
}

describe('useTokenEasedLoop', () => {
  it('travels on the easing the token resolves to', () => {
    const { unmount } = render(
      <Probe durationMs={4000} easingToken="--ds-motion-ease-in-out" enabled ease="cubic-bezier(0.4, 0, 0.2, 1)" />
    );

    expect(animateCalls).toHaveLength(1);
    expect(animateCalls[0]?.options).toMatchObject({
      duration: 4000,
      iterations: Infinity,
      direction: 'alternate',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    });
    unmount();
    expect(cancelSpy).toHaveBeenCalledTimes(1);
  });

  it('never starts when disabled, which is how reduced motion reaches it', () => {
    render(<Probe durationMs={4000} easingToken="--ds-motion-ease-in-out" enabled={false} />);
    expect(animateCalls).toHaveLength(0);
  });

  it('runs on the browser default curve when the token is absent or unparseable', () => {
    render(<Probe durationMs={4000} easingToken="--ds-motion-ease-in-out" enabled />);
    expect(animateCalls[0]?.options.easing).toBeUndefined();

    animateCalls = [];
    rejectEasing = 'not-an-easing';
    render(<Probe durationMs={5000} easingToken="--ds-motion-ease-in-out" enabled ease="not-an-easing" />);
    expect(animateCalls).toHaveLength(1);
    expect(animateCalls[0]?.options.easing).toBeUndefined();
  });
});
