import { afterEach, describe, expect, it } from 'vitest';

import { getHighlighter, registerHighlighter } from '../index';
import type { HighlighterAdapter } from '../../../contracts';

const noop: HighlighterAdapter = { id: 'noop', highlight: () => [] };

afterEach(() => {
  registerHighlighter(null);
});

describe('highlighter registry', () => {
  it('defaults to no adapter', () => {
    expect(getHighlighter()).toBeNull();
  });

  it('registers an adapter and unregisters back to the prior value', () => {
    const off = registerHighlighter(noop);
    expect(getHighlighter()).toBe(noop);
    off();
    expect(getHighlighter()).toBeNull();
  });

  it('restores the previously active adapter on nested unregister', () => {
    const a: HighlighterAdapter = { id: 'a', highlight: () => [] };
    const b: HighlighterAdapter = { id: 'b', highlight: () => [] };
    const offA = registerHighlighter(a);
    const offB = registerHighlighter(b);
    expect(getHighlighter()).toBe(b);
    offB();
    expect(getHighlighter()).toBe(a);
    offA();
    expect(getHighlighter()).toBeNull();
  });
});
