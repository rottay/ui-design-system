import React from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { useFlipLayout, useSizeAnimation } from '..';
import { installModeledWaapi, stubRect, statChannels, uninstallWaapi, type ModeledWaapi } from './support';
import { mockMatchMedia } from '@tests/support/browser/match-media';

/** The consumer owns its transform: hover lifts, press scales (the board's case). */
const CONSUMER_SHEET = `
  .card { transform: translateY(var(--lift, 0px)) scale(var(--s, 1)); }
  .card.hover { --lift: -4px; }
  .card.press { --s: 0.96; }
`;
const HOVER_AND_PRESS = 'translateY(-4px) scale(0.96)';

let waapi: ModeledWaapi;

beforeAll(() => {
  const sheet = document.createElement('style');
  sheet.textContent = CONSUMER_SHEET;
  document.head.appendChild(sheet);
});

beforeEach(() => {
  waapi = installModeledWaapi();
  mockMatchMedia(1280, false);
});

afterEach(() => {
  uninstallWaapi();
  vi.unstubAllGlobals();
});

function FlipCard({ x }: { x: number }) {
  const { register, measure } = useFlipLayout<'card'>();
  return (
    <button type="button" data-testid="measure" onClick={() => measure()}>
      <div
        data-testid="card"
        className="card"
        ref={(node) => { register('card')(node); stubRect(node, { x }); }}
      />
    </button>
  );
}

function reflow(rerender: (ui: React.ReactElement) => void, click: () => void, x: number): void {
  act(() => click());
  rerender(<FlipCard x={x} />);
}

function expectPureCss(card: HTMLElement): void {
  expect(waapi.inEffect(card)).toBe(0);
  expect(card.style.transform).toBe('');
  card.classList.add('hover', 'press');
  expect(waapi.renderedTransform(card)).toBe(HOVER_AND_PRESS);
  card.classList.remove('hover', 'press');
}

describe('layout kernel end state: a finished animation leaves no trace', () => {
  it('hands a reflowed node back to its own CSS transform once the reflow completes', () => {
    const { rerender, getByTestId } = render(<FlipCard x={0} />);
    const card = getByTestId('card');
    statChannels(card);
    const click = () => getByTestId('measure').click();

    reflow(rerender, click, 100);
    expect(waapi.inEffect(card)).toBe(1);
    waapi.finishAll();

    expectPureCss(card);
  });

  it('leaves no inline transform behind when a later reflow replaces a completed or an in-flight one', () => {
    const { rerender, getByTestId } = render(<FlipCard x={0} />);
    const card = getByTestId('card');
    statChannels(card);
    const click = () => getByTestId('measure').click();

    reflow(rerender, click, 100);
    waapi.finishAll();
    reflow(rerender, click, 0);
    waapi.finishAll();
    expectPureCss(card);

    reflow(rerender, click, 100);
    reflow(rerender, click, 0);
    waapi.finishAll();
    expectPureCss(card);
  });

  it('hands a measured size invert back to the node CSS transform once it completes', () => {
    function SizeCard({ height }: { height: number }) {
      const { register, measure } = useSizeAnimation<'card'>({ sizeStrategy: 'measured' });
      return (
        <button type="button" data-testid="measure" onClick={() => measure()}>
          <div
            data-testid="card"
            className="card"
            ref={(node) => { register('card')(node); stubRect(node, { height }); }}
          />
        </button>
      );
    }

    const { rerender, getByTestId } = render(<SizeCard height={40} />);
    const card = getByTestId('card');
    statChannels(card);
    const click = () => getByTestId('measure').click();

    act(() => click());
    rerender(<SizeCard height={160} />);
    act(() => click());
    rerender(<SizeCard height={80} />);
    waapi.finishAll();

    expectPureCss(card);
  });
});
