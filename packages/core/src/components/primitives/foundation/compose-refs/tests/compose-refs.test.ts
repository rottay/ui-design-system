/**
 * @fileoverview Direct, component-free tests of composeRefs's central
 * invariant: the composed callback returns `undefined` on every call, on
 * attach and on detach, whatever kind of ref was forwarded.
 *
 * WHY DIRECT. React owns the call site of a real ref callback inside a
 * component and discards whatever it returns, so mounting a component and
 * asserting on the RESULT of composeRefs is not possible -- only a direct
 * call is. That is also why this file needs no render, no DOM environment
 * feature beyond `document.createElement`, and no React import: composeRefs
 * is a plain function over two structural cells (see ../index.ts), and the
 * plain HTMLElement instances below stand in for whatever `T` a real caller
 * would use, purely as distinguishable identities to assert on.
 */

import { describe, expect, it, vi } from 'vitest';

import { composeRefs, type ComposedRefBinding, type RefCell } from '../index';

function makeBinding<T>(): ComposedRefBinding<T> {
  return {
    own: { current: null },
    forwardedCleanup: { current: undefined },
  };
}

describe('composeRefs: the composed callback always returns undefined', () => {
  it('forwarded callback returning a cleanup: undefined on attach and detach, cleanup runs exactly once, consumer is never called with null', () => {
    const binding = makeBinding<HTMLElement>();
    const cleanup = vi.fn();
    const forwarded = vi.fn((node: HTMLElement | null): (() => void) | undefined =>
      node ? cleanup : undefined
    );
    const composed = composeRefs(forwarded, binding);
    const node = document.createElement('div');

    expect(composed(node)).toBeUndefined();
    expect(binding.own.current).toBe(node);
    expect(cleanup).not.toHaveBeenCalled();

    expect(composed(null)).toBeUndefined();
    expect(binding.own.current).toBeNull();
    expect(cleanup).toHaveBeenCalledTimes(1);
    // The cleanup IS the whole detach protocol here: a wrapper that also
    // re-invoked the consumer with null would notify it of detach twice.
    expect(forwarded).toHaveBeenCalledTimes(1);
    expect(forwarded).not.toHaveBeenCalledWith(null);
  });

  it('forwarded callback returning nothing: undefined on attach and detach, consumer IS called with null on detach', () => {
    const binding = makeBinding<HTMLElement>();
    const received: Array<HTMLElement | null> = [];
    const forwarded = (node: HTMLElement | null): void => {
      received.push(node);
    };
    const composed = composeRefs(forwarded, binding);
    const node = document.createElement('div');

    expect(composed(node)).toBeUndefined();
    expect(binding.own.current).toBe(node);
    expect(received).toEqual([node]);

    expect(composed(null)).toBeUndefined();
    expect(binding.own.current).toBeNull();
    expect(received).toEqual([node, null]);
  });

  it('forwarded object ref: undefined on attach and detach, .current set on attach and nulled on detach', () => {
    const binding = makeBinding<HTMLElement>();
    const forwarded: RefCell<HTMLElement | null> = { current: null };
    const composed = composeRefs(forwarded, binding);
    const node = document.createElement('div');

    expect(composed(node)).toBeUndefined();
    expect(forwarded.current).toBe(node);
    expect(binding.own.current).toBe(node);

    expect(composed(null)).toBeUndefined();
    expect(forwarded.current).toBeNull();
    expect(binding.own.current).toBeNull();
  });

  it.each([null, undefined] as const)(
    'no forwarded ref (%s): undefined on attach and detach, and the own cell is still tracked',
    (forwarded) => {
      const binding = makeBinding<HTMLElement>();
      const composed = composeRefs(forwarded, binding);
      const node = document.createElement('div');

      expect(composed(node)).toBeUndefined();
      expect(binding.own.current).toBe(node);

      expect(composed(null)).toBeUndefined();
      expect(binding.own.current).toBeNull();
    }
  );

  it('re-attaches after detach without the cleanup latch sticking to the previous node', () => {
    const binding = makeBinding<HTMLElement>();
    const cleanupA = vi.fn();
    const cleanupB = vi.fn();
    let attachCount = 0;
    const forwarded = (node: HTMLElement | null): (() => void) | undefined => {
      if (!node) return undefined;
      attachCount += 1;
      return attachCount === 1 ? cleanupA : cleanupB;
    };
    const composed = composeRefs(forwarded, binding);
    const nodeA = document.createElement('div');
    const nodeB = document.createElement('span');

    expect(composed(nodeA)).toBeUndefined();
    expect(composed(null)).toBeUndefined();
    expect(cleanupA).toHaveBeenCalledTimes(1);
    expect(binding.forwardedCleanup.current).toBeUndefined();

    expect(composed(nodeB)).toBeUndefined();
    expect(binding.own.current).toBe(nodeB);
    expect(composed(null)).toBeUndefined();
    expect(cleanupB).toHaveBeenCalledTimes(1);
    // The first cleanup must not be re-invoked by the second node's detach.
    expect(cleanupA).toHaveBeenCalledTimes(1);
    expect(binding.own.current).toBeNull();
  });
});
