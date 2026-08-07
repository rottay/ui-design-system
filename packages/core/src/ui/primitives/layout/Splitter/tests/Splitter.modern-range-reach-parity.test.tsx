import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Splitter, Panel } from '../engines/modern';

/**
 * The advertised ARIA window and the Home/End endpoints run through one helper,
 * so every gutter must actually REACH the range it announces.
 */
function renderMixedFour() {
  return render(
    <Splitter>
      <Panel defaultSize={25} min={10}>Alpha</Panel>
      <Panel defaultSize={25} min={15} collapsible>Beta</Panel>
      <Panel defaultSize={25} max={40}>Gamma</Panel>
      <Panel defaultSize={25} min={5}>Delta</Panel>
    </Splitter>
  );
}

const separators = (c: HTMLElement) =>
  [...c.querySelectorAll<HTMLElement>('[role="separator"]')];

const read = (s: HTMLElement) => ({
  now: Number(s.getAttribute('aria-valuenow')),
  min: Number(s.getAttribute('aria-valuemin')),
  max: Number(s.getAttribute('aria-valuemax')),
});

describe('Modern Splitter advertised range is reachable on every gutter', () => {
  it('lands Home exactly on the advertised minimum', () => {
    const { container } = render(<div />);
    container.remove();

    separators(renderMixedFour().container).forEach((sep) => {
      const advertised = read(sep).min;
      fireEvent.keyDown(sep, { key: 'Home' });
      expect(read(sep).now).toBe(advertised);
    });
  });

  it('lands End exactly on the advertised maximum', () => {
    separators(renderMixedFour().container).forEach((sep) => {
      const advertised = read(sep).max;
      fireEvent.keyDown(sep, { key: 'End' });
      expect(read(sep).now).toBe(advertised);
    });
  });

  it('keeps every gutter inside a valid, ordered ARIA window at rest', () => {
    separators(renderMixedFour().container).forEach((sep) => {
      const { now, min, max } = read(sep);
      expect(min).toBeLessThanOrEqual(max);
      expect(now).toBeGreaterThanOrEqual(min);
      expect(now).toBeLessThanOrEqual(max);
    });
  });

  it('advertises a wider floor for the gutter whose leading panel may collapse', () => {
    const seps = separators(renderMixedFour().container);
    // Gutter 1 leads Beta (collapsible, min 15): its floor drops to Alpha's
    // own reach, while gutter 0 leads Alpha (min 10, not collapsible).
    expect(read(seps[0]).min).toBe(10);
    expect(read(seps[1]).min).toBeLessThan(read(seps[1]).now);
  });
});
