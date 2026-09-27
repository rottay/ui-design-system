import React from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { LayoutGroup, useFlipLayout } from '..';
import { installWaapi, stubRect, statChannels, uninstallWaapi, type WaapiStub } from './support';
import { mockMatchMedia } from '@tests/support/browser/match-media';

let waapi: WaapiStub;

beforeEach(() => {
  waapi = installWaapi();
  mockMatchMedia(1280, false);
});

afterEach(() => {
  uninstallWaapi();
});

/** One flip-registered box whose rect the test drives through the `x` prop. */
function FlipHarness({ x }: { x: number }) {
  const { register, measure } = useFlipLayout<'box'>();

  return (
    <button type="button" data-testid="measure-button" onClick={() => measure()}>
      <div
        data-testid="box"
        ref={(node) => {
          register('box')(node);
          stubRect(node, { x });
        }}
      />
    </button>
  );
}

describe('useFlipLayout (layout kernel reflow arm)', () => {
  it('plays a transform-only invert on the move channels when a registered node moves', () => {
    const { rerender, getByTestId } = render(<FlipHarness x={0} />);
    const box = getByTestId('box');
    statChannels(box);

    act(() => {
      getByTestId('measure-button').click();
    });
    rerender(<FlipHarness x={100} />);

    expect(waapi.calls).toHaveLength(1);
    const [call] = waapi.calls;
    expect(call.target).toBe(box);
    expect(call.options).toMatchObject({
      duration: 200,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
      fill: 'backwards',
    });
    const keyframes = call.keyframes as Array<{ transform: string }>;
    expect(keyframes[0].transform).toContain('translate(-100px, 0px)');
    expect(keyframes[1].transform).toBe('none');
    expect(JSON.stringify(keyframes)).not.toMatch(/inlineSize|blockSize|width|height|top|left/);
  });

  it('reads the rearrange channel, not the calm/ease-out pair the pre-kernel hook defaulted to', () => {
    const { rerender, getByTestId } = render(<FlipHarness x={0} />);
    const box = getByTestId('box');
    box.style.setProperty('--ds-motion-normal', '900ms');
    box.style.setProperty('--ds-motion-ease-out', 'ease-out');

    act(() => {
      getByTestId('measure-button').click();
    });
    rerender(<FlipHarness x={100} />);

    // The legacy pair carries a value and the move pair does not, so a hook that
    // still defaulted to `normal`/`ease-out` would have animated here.
    expect(waapi.calls).toHaveLength(0);
  });

  it('does not animate when the node did not move', () => {
    const { rerender, getByTestId } = render(<FlipHarness x={50} />);
    statChannels(getByTestId('box'));

    act(() => {
      getByTestId('measure-button').click();
    });
    rerender(<FlipHarness x={50} />);

    expect(waapi.calls).toHaveLength(0);
  });

  it('does nothing when measure() was not called before the update', () => {
    const { rerender, getByTestId } = render(<FlipHarness x={0} />);
    statChannels(getByTestId('box'));
    rerender(<FlipHarness x={100} />);

    expect(waapi.calls).toHaveLength(0);
  });

  it('cancels an animation already in flight, without committing it, before starting a new one', () => {
    uninstallWaapi();
    waapi = installWaapi([{ cancel: () => {}, commitStyles: () => {} }]);
    const stub = waapi;
    Element.prototype.getAnimations = (() => [
      { cancel: stub.cancel, commitStyles: stub.commitStyles },
    ]) as unknown as typeof Element.prototype.getAnimations;

    const { rerender, getByTestId } = render(<FlipHarness x={0} />);
    statChannels(getByTestId('box'));

    act(() => {
      getByTestId('measure-button').click();
    });
    rerender(<FlipHarness x={100} />);

    expect(waapi.commitStyles).not.toHaveBeenCalled();
    expect(waapi.cancel).toHaveBeenCalledTimes(1);
  });

  it('does not animate a newly-appeared key it has no prior measurement for', () => {
    function TwoKeys({ withSecond }: { withSecond: boolean }) {
      const { register, measure } = useFlipLayout<'a' | 'b'>();
      return (
        <button type="button" data-testid="measure" onClick={() => measure()}>
          <div data-testid="a" ref={(node) => { register('a')(node); stubRect(node, { x: withSecond ? 10 : 0 }); }} />
          {withSecond && <div data-testid="b" ref={(node) => { register('b')(node); stubRect(node, { x: 200 }); }} />}
        </button>
      );
    }

    const { rerender, getByTestId } = render(<TwoKeys withSecond={false} />);
    statChannels(getByTestId('a'));
    act(() => {
      getByTestId('measure').click();
    });
    rerender(<TwoKeys withSecond={true} />);

    expect(waapi.calls).toHaveLength(1);
    expect(waapi.calls[0].target).toBe(getByTestId('a'));
  });

  it('arms every consumer in a LayoutGroup from one measure(), so siblings play on one commit', () => {
    function Sibling({ testId, x }: { testId: string; x: number }) {
      const { register } = useFlipLayout<'box'>();
      return <div data-testid={testId} ref={(node) => { register('box')(node); stubRect(node, { x }); }} />;
    }

    function Trigger() {
      const { measure } = useFlipLayout<'none'>();
      return <button type="button" data-testid="measure" onClick={() => measure()} />;
    }

    function Grouped({ x }: { x: number }) {
      return (
        <LayoutGroup id="collection">
          <Trigger />
          <Sibling testId="left" x={x} />
          <Sibling testId="right" x={x + 10} />
        </LayoutGroup>
      );
    }

    const { rerender, getByTestId } = render(<Grouped x={0} />);
    // The channels are read from the group root, once, for every consumer.
    statChannels(getByTestId('left').parentElement as HTMLElement);

    act(() => {
      getByTestId('measure').click();
    });
    rerender(<Grouped x={100} />);

    expect(waapi.calls.map((call) => call.target)).toEqual([
      getByTestId('left'),
      getByTestId('right'),
    ]);
  });
});
