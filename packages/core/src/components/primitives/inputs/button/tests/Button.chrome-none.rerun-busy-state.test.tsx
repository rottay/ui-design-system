import React from 'react';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeEach, expect, vi } from 'vitest';

// Re-runs Button.busy-state.test with every Modern Button rendered chrome="none" (api-proposal v2 §4.3).
vi.mock('../engines/modern', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../engines/modern')>();
  const Original = actual.default;
  const Chromeless = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, React.ComponentProps<typeof Original>>((props, ref) => {
    const merged = { chrome: 'none' as const, ...props };
    const counts = (globalThis as { __buttonRenders?: [number, number] }).__buttonRenders!;
    counts[0] += 1;
    if (merged.chrome === 'none') counts[1] += 1;
    return <Original {...merged} ref={ref} />;
  });
  Chromeless.displayName = Original.displayName;
  return { ...actual, default: Chromeless };
});

import './Button.busy-state.test';

let buttons = 0;
const counts: [number, number] = [0, 0];
(globalThis as { __buttonRenders?: [number, number] }).__buttonRenders = counts;
beforeEach(() => {
  counts[0] = 0;
  counts[1] = 0;
});
afterEach(() => {
  const stamps = [...document.querySelectorAll('.ds-button--modern')].map((button) => button.getAttribute('data-chrome'));
  const [rendered, chromeless] = counts;
  cleanup();
  buttons += stamps.length;
  expect(chromeless).toBe(rendered);
  expect(stamps.filter((stamp) => stamp !== 'none')).toEqual([]);
});
afterAll(() => expect(buttons).toBeGreaterThan(0));
