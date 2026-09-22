import React from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useLayoutAnimation, useSizeAnimation } from '..';
import { installWaapi, stubRect, statChannels, uninstallWaapi, type WaapiStub } from './support';
import { mockMatchMedia } from '@tests/support/browser/match-media';

let waapi: WaapiStub;

function stubSupports(supported: boolean): void {
  vi.stubGlobal('CSS', { supports: (...args: string[]) => (args.join(' ').includes('interpolate-size') ? supported : false) });
}

beforeEach(() => {
  waapi = installWaapi();
  mockMatchMedia(1280, false);
});

afterEach(() => {
  uninstallWaapi();
  vi.unstubAllGlobals();
});

/** A card whose measured height the test drives through the `height` prop. */
function SizeHarness({ height, strategy }: { height: number; strategy?: 'auto' | 'measured' }) {
  const { register, measure } = useSizeAnimation<'card'>({ sizeStrategy: strategy });
  return (
    <button type="button" data-testid="measure" onClick={() => measure()}>
      <div
        data-testid="card"
        ref={(node) => { register('card')(node); stubRect(node, { height }); }}
      />
    </button>
  );
}

describe('useSizeAnimation', () => {
  it('interpolates the layout property to the content keyword where the feature is supported', () => {
    stubSupports(true);
    const { rerender, getByTestId } = render(<SizeHarness height={40} />);
    statChannels(getByTestId('card'));

    act(() => {
      getByTestId('measure').click();
    });
    rerender(<SizeHarness height={160} />);

    expect(waapi.calls).toHaveLength(1);
    expect(waapi.calls[0].keyframes).toEqual([{ blockSize: '40px' }, { blockSize: 'auto' }]);
    // Backwards fill: the resting size stays the one the stylesheet states.
    expect(waapi.calls[0].options).toMatchObject({ duration: 200, fill: 'backwards' });
  });

  it('falls back to a compositor-only scale invert where the feature is absent', () => {
    stubSupports(false);
    const { rerender, getByTestId } = render(<SizeHarness height={40} />);
    statChannels(getByTestId('card'));

    act(() => {
      getByTestId('measure').click();
    });
    rerender(<SizeHarness height={160} />);

    expect(waapi.calls).toHaveLength(1);
    expect(waapi.calls[0].keyframes).toEqual([{ transform: 'scale(1, 0.25)' }, { transform: 'none' }]);
    expect(waapi.calls[0].options).toMatchObject({ fill: 'both' });
  });

  it('forces the measured fallback when the call site asks for it, feature support notwithstanding', () => {
    stubSupports(true);
    const { rerender, getByTestId } = render(<SizeHarness height={40} strategy="measured" />);
    statChannels(getByTestId('card'));

    act(() => {
      getByTestId('measure').click();
    });
    rerender(<SizeHarness height={160} strategy="measured" />);

    expect(waapi.calls[0].keyframes).toEqual([{ transform: 'scale(1, 0.25)' }, { transform: 'none' }]);
  });

  it('reports the strategy actually in force, so the gate can run the same fixture twice', () => {
    stubSupports(true);
    function Probe({ strategy }: { strategy?: 'auto' | 'measured' }) {
      const { strategy: resolved } = useLayoutAnimation({ kind: 'size', sizeStrategy: strategy });
      return <span data-testid="strategy">{resolved}</span>;
    }

    const supported = render(<Probe />);
    expect(supported.getByTestId('strategy').textContent).toBe('interpolate-size');
    supported.rerender(<Probe strategy="measured" />);
    expect(supported.getByTestId('strategy').textContent).toBe('measured');
    supported.unmount();

    stubSupports(false);
    const unsupported = render(<Probe />);
    expect(unsupported.getByTestId('strategy').textContent).toBe('measured');
  });

  it('does not animate a size that did not change', () => {
    stubSupports(true);
    const { rerender, getByTestId } = render(<SizeHarness height={40} />);
    statChannels(getByTestId('card'));

    act(() => {
      getByTestId('measure').click();
    });
    rerender(<SizeHarness height={40} />);

    expect(waapi.calls).toHaveLength(0);
  });
});
