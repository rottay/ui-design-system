import React from 'react';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, expect, vi } from 'vitest';

// Re-runs Input.submit-intent.test with every Modern Input rendered chrome="none" (api-proposal v2 §2.2).
vi.mock('../engines/modern', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../engines/modern')>();
  const Original = actual.default;
  const Chromeless = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Original>>((props, ref) => <Original chrome="none" {...props} ref={ref} />);
  Chromeless.displayName = Original.displayName;
  return { ...actual, default: Chromeless };
});

import './Input.submit-intent.test';

let shells = 0;
afterEach(() => {
  const stamps = [...document.querySelectorAll('.ds-input-shell--modern')].map((shell) => shell.getAttribute('data-chrome'));
  cleanup();
  shells += stamps.length;
  expect(stamps.filter((stamp) => stamp !== 'none')).toEqual([]);
});
afterAll(() => expect(shells).toBeGreaterThan(0));
