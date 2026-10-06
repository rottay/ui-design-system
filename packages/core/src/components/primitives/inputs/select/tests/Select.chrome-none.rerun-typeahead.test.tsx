import React from 'react';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeEach, expect, vi } from 'vitest';

// Re-runs Select.typeahead.test with every Modern Select rendered chrome="none" (api-proposal v2 §3.3).
vi.mock('../engines/modern', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../engines/modern')>();
  const Original = actual.default;
  const Chromeless = React.forwardRef<HTMLElement, React.ComponentProps<typeof Original>>((props, ref) => {
    const merged = { chrome: 'none' as const, ...props };
    const counts = (globalThis as { __selectRenders?: [number, number] }).__selectRenders!;
    counts[0] += 1;
    if (merged.chrome === 'none') counts[1] += 1;
    return <Original {...merged} ref={ref} />;
  });
  Chromeless.displayName = Original.displayName;
  return { ...actual, default: Chromeless };
});

import './Select.typeahead.test';

let triggers = 0;
const counts: [number, number] = [0, 0];
(globalThis as { __selectRenders?: [number, number] }).__selectRenders = counts;
beforeEach(() => {
  counts[0] = 0;
  counts[1] = 0;
});
afterEach(() => {
  const stamps = [...document.querySelectorAll(".ds-select-shell--modern [data-part='trigger']")].map((trigger) => trigger.getAttribute('data-chrome'));
  const [rendered, chromeless] = counts;
  cleanup();
  triggers += stamps.length;
  expect(chromeless).toBe(rendered);
  expect(stamps.filter((stamp) => stamp !== 'none')).toEqual([]);
});
afterAll(() => expect(triggers).toBeGreaterThan(0));
