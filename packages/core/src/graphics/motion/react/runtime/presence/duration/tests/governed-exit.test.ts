import { afterEach, describe, expect, it } from 'vitest';

import {
  governedExitMs,
  governedFlashMs,
  resolveExitFallbackMs,
  type ExitFallbackOptions,
} from '..';
import cases from './fixtures/css-time-cases.json';

/** Buffer the governed reading adds on top of the declared window. */
const BUFFER_MS = 50;

const GRACE_MS = 64;
const DETACHED_MS = 240;

const fallbackFor = (channel: 'animation' | 'transition'): ExitFallbackOptions => ({
  channel,
  graceMs: GRACE_MS,
  detachedFallbackMs: DETACHED_MS,
});

function mount(styles: Partial<CSSStyleDeclaration>): HTMLElement {
  const el = document.createElement('div');
  Object.assign(el.style, styles);
  document.body.appendChild(el);
  return el;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('governedExitMs', () => {
  for (const spec of cases.governedExit) {
    it(spec.name, () => {
      expect(
        governedExitMs(mount(spec.styles as Partial<CSSStyleDeclaration>))
      ).toBe(spec.baseMs + BUFFER_MS);
    });
  }

  it('governs a self-clearing cue on the same reading as an exit', () => {
    const el = mount(cases.flashParity.styles as Partial<CSSStyleDeclaration>);
    expect(governedFlashMs(el)).toBe(governedExitMs(el));
  });
});

describe('resolveExitFallbackMs', () => {
  it('applies the detached window when there is no element to measure', () => {
    expect(resolveExitFallbackMs(null, fallbackFor('animation'))).toBe(DETACHED_MS);
  });

  for (const spec of cases.exitFallback) {
    it(spec.name, () => {
      const el = mount(spec.styles as Partial<CSSStyleDeclaration>);
      const expected =
        'expected' in spec && spec.expected === 'same-tick'
          ? 0
          : (spec.baseMs ?? 0) + GRACE_MS;
      expect(
        resolveExitFallbackMs(el, fallbackFor(spec.channel as 'animation' | 'transition'))
      ).toBe(expected);
    });
  }
});
