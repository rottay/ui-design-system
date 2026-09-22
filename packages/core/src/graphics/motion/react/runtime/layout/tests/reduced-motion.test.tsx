import React from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useLayoutAnimation } from '..';
import { installWaapi, stubRect, statChannels, uninstallWaapi, type WaapiStub } from './support';
import { mockMatchMedia } from '@tests/support/browser/match-media';

let waapi: WaapiStub;

beforeEach(() => {
  waapi = installWaapi();
  vi.stubGlobal('CSS', { supports: () => true });
});

afterEach(() => {
  uninstallWaapi();
  vi.unstubAllGlobals();
  mockMatchMedia(1280, false);
});

/**
 * The same scene on both arms: `reduce` is the negative control. If BOTH arms
 * report zero animations the fixture is broken, not compliant -- which is why
 * every case below asserts its own counterpart.
 */
function Stage({ register, measure, x, height }: {
  register: (key: 'node') => (node: HTMLElement | null) => void;
  measure: () => void;
  x: number;
  height: number;
}) {
  return (
    <button type="button" data-testid="measure" onClick={() => measure()}>
      <div
        data-testid="node"
        ref={(node) => { register('node')(node); stubRect(node, { x, height }); }}
      />
    </button>
  );
}

function ReflowScene(props: { x: number; height: number }) {
  const { register, measure } = useLayoutAnimation<'node'>({ kind: 'reflow' });
  return <Stage register={register} measure={measure} {...props} />;
}

function SizeScene(props: { x: number; height: number }) {
  const { register, measure } = useLayoutAnimation<'node'>({ kind: 'size' });
  return <Stage register={register} measure={measure} {...props} />;
}

const SCENES = { reflow: ReflowScene, size: SizeScene };

function playScene(kind: 'reflow' | 'size'): { animations: number; node: HTMLElement } {
  const Scene = SCENES[kind];
  const view = render(<Scene x={0} height={40} />);
  const node = view.getByTestId('node');
  statChannels(node);

  act(() => {
    view.getByTestId('measure').click();
  });
  view.rerender(<Scene x={100} height={160} />);
  const animations = waapi.calls.length;
  view.unmount();

  return { animations, node };
}

describe('the reduced-motion law', () => {
  it('creates no animation for a reflow under reduce, and one without it', () => {
    mockMatchMedia(1280, false);
    expect(playScene('reflow').animations).toBeGreaterThan(0);

    waapi.calls.length = 0;
    mockMatchMedia(1280, true);
    expect(playScene('reflow').animations).toBe(0);
  });

  it('creates no animation for a size change under reduce, and one without it', () => {
    mockMatchMedia(1280, false);
    expect(playScene('size').animations).toBeGreaterThan(0);

    waapi.calls.length = 0;
    mockMatchMedia(1280, true);
    expect(playScene('size').animations).toBe(0);
  });

  it('commits the final state on the same frame: no inline transform or size is left behind', () => {
    mockMatchMedia(1280, true);
    const { node } = playScene('size');

    // Nothing to reverse and nothing mid-flight: the committed DOM IS the target.
    expect(node.style.transform).toBe('');
    expect(node.style.blockSize).toBe('');
    expect(node.style.inlineSize).toBe('');
    expect(waapi.calls).toHaveLength(0);
    expect(waapi.commitStyles).not.toHaveBeenCalled();
    expect(waapi.cancel).not.toHaveBeenCalled();
  });
});
