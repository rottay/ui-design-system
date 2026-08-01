import { describe, expect, it } from 'vitest';

import {
  TYPEAHEAD_RESET_MS,
  advanceTypeahead,
  resolveTypeaheadPrefix,
} from '..';

const EMPTY = { buffer: '', lastKeyTime: 0 };

describe('advanceTypeahead', () => {
  it('accumulates consecutive keystrokes inside the window into one prefix', () => {
    const first = advanceTypeahead(EMPTY, 's', 1000);
    expect(first.prefix).toBe('s');

    const second = advanceTypeahead(first.state, 'a', 1100);
    expect(second.prefix).toBe('sa');

    const third = advanceTypeahead(second.state, 'n', 1200);
    expect(third.prefix).toBe('san');
  });

  it('restarts from the fresh character once the pause exceeds the window', () => {
    const first = advanceTypeahead(EMPTY, 's', 1000);
    const afterPause = advanceTypeahead(first.state, 'a', 1000 + TYPEAHEAD_RESET_MS + 1);

    expect(afterPause.prefix).toBe('a');
    expect(afterPause.state.buffer).toBe('a');
  });

  it('still extends when the gap is exactly the window', () => {
    const first = advanceTypeahead(EMPTY, 's', 1000);
    const atBoundary = advanceTypeahead(first.state, 'a', 1000 + TYPEAHEAD_RESET_MS);

    expect(atBoundary.prefix).toBe('sa');
  });

  it('repeats a held character into a same-letter run rather than resetting it', () => {
    const first = advanceTypeahead(EMPTY, 'a', 1000);
    const second = advanceTypeahead(first.state, 'a', 1100);
    const third = advanceTypeahead(second.state, 'a', 1200);

    expect(second.prefix).toBe('aa');
    expect(third.prefix).toBe('aaa');
  });

  it('lower-cases the prefix while keeping raw case in the buffer', () => {
    const first = advanceTypeahead(EMPTY, 'S', 1000);
    const second = advanceTypeahead(first.state, 'A', 1100);

    expect(second.prefix).toBe('sa');
    expect(second.state.buffer).toBe('SA');
  });

  it('is pure: the caller decides whether the advanced state is committed', () => {
    const state = { buffer: 'so', lastKeyTime: 1000 };
    const advanced = advanceTypeahead(state, 'x', 1100);

    expect(advanced.prefix).toBe('sox');
    // The input state is untouched, which is what lets a matcher reject a
    // dead prefix and roll the buffer back to a single character.
    expect(state).toEqual({ buffer: 'so', lastKeyTime: 1000 });
  });

  it('honors a caller-supplied window', () => {
    const first = advanceTypeahead(EMPTY, 's', 1000, 100);
    const afterPause = advanceTypeahead(first.state, 'a', 1101, 100);

    expect(afterPause.prefix).toBe('a');
  });
});

describe('resolveTypeaheadPrefix', () => {
  it('keeps one buffer per element', () => {
    const menu = document.createElement('ul');

    expect(resolveTypeaheadPrefix(menu, 's', 1000)).toBe('s');
    expect(resolveTypeaheadPrefix(menu, 'a', 1100)).toBe('sa');
  });

  it('never shares a buffer between two elements', () => {
    const first = document.createElement('ul');
    const second = document.createElement('ul');

    expect(resolveTypeaheadPrefix(first, 's', 1000)).toBe('s');
    expect(resolveTypeaheadPrefix(second, 'a', 1050)).toBe('a');
    expect(resolveTypeaheadPrefix(first, 'a', 1100)).toBe('sa');
  });

  it('resets an element buffer after a pause', () => {
    const menu = document.createElement('ul');

    expect(resolveTypeaheadPrefix(menu, 's', 1000)).toBe('s');
    expect(resolveTypeaheadPrefix(menu, 'a', 1000 + TYPEAHEAD_RESET_MS + 1)).toBe('a');
  });
});
