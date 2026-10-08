import React from 'react';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeEach, expect, vi } from 'vitest';

// Re-runs Select.modern-id-forwarding.test with the render channel on every Modern Select (E-3 T-5).
const roster = vi.hoisted(() => ({
  /** Cases that assert the native <select>: the channel forces the custom path (R-4). */
  nativePath: new Set<string>([
    "Select modern id forwarding > still carries the id on the native path",
  ]),
  seen: new Set<string>(),
  counts: [0, 0] as [number, number],
}));

vi.mock('../engines/modern', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../engines/modern')>();
  const { expect: current } = await import('vitest');
  const Original = actual.default;
  const Channelled = React.forwardRef<HTMLElement, React.ComponentProps<typeof Original>>((props, ref) => {
    const name = current.getState().currentTestName ?? '';
    roster.counts[0] += 1;
    if (roster.nativePath.has(name)) {
      roster.seen.add(name);
      return <Original {...props} ref={ref} />;
    }
    roster.counts[1] += 1;
    return (
      <Original
        {...props}
        renderOption={(_option, content) => <span data-rc="">{content}</span>}
        renderValue={(_option, content) => <span data-rc="">{content}</span>}
        ref={ref}
      />
    );
  });
  Channelled.displayName = Original.displayName;
  return { ...actual, default: Channelled };
});

import './Select.modern-id-forwarding.test';

let channelled = 0;
beforeEach(() => {
  roster.counts[0] = 0;
  roster.counts[1] = 0;
});
afterEach(() => {
  const name = expect.getState().currentTestName ?? '';
  const natives = document.querySelectorAll('.ds-select-shell--modern select').length;
  const contents = [
    ...document.querySelectorAll(
      ".ds-select-shell__dropdown [data-part='option-content'], .ds-select-shell--modern :is([data-part='value'][data-mode='single'], [data-part='tag-label'])",
    ),
  ];
  const bare = contents.filter((node) => !node.querySelector(':scope > [data-rc]')).length;
  const [rendered, withChannel] = roster.counts;
  cleanup();
  if (roster.nativePath.has(name)) return;
  channelled += withChannel;
  expect(withChannel).toBe(rendered);
  expect(natives).toBe(0);
  expect(bare).toBe(0);
});
afterAll(() => {
  expect(channelled).toBeGreaterThan(0);
  expect([...roster.nativePath].filter((name) => !roster.seen.has(name))).toEqual([]);
});
