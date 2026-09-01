/**
 * A separator's `aria-valuenow` is its POSITION on the declared 0-100 scale,
 * not the size of the panel before it. With three panels those two readings
 * diverge: gutter 1 sits at 67% while panel 1 is only 33% wide, and the
 * engine used to announce the panel size for every gutter (so gutters 0 and 1
 * both reported 33%).
 */
import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Splitter, Panel } from '../engines/modern';

function renderThreePanels() {
  return render(
    <Splitter>
      <Panel>
        <span>panel-0</span>
      </Panel>
      <Panel>
        <span>panel-1</span>
      </Panel>
      <Panel>
        <span>panel-2</span>
      </Panel>
    </Splitter>
  );
}

function gutters(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[data-part="gutter"]'));
}

describe('Splitter modern engine: separator reports its boundary position', () => {
  it('each gutter of a 3-panel splitter announces its own cumulative position', () => {
    renderThreePanels();
    const [first, second] = gutters();

    expect(first.getAttribute('aria-valuenow')).toBe('33');
    expect(second.getAttribute('aria-valuenow')).toBe('67');
    expect(second.getAttribute('aria-valuenow')).not.toBe(first.getAttribute('aria-valuenow'));
  });

  it('valuetext matches the announced boundary position', () => {
    renderThreePanels();
    const [, second] = gutters();
    expect(second.getAttribute('aria-valuetext')).toBe('67%');
  });

  it('Home on the second gutter moves the boundary to 33, not to 0', () => {
    renderThreePanels();
    const [, second] = gutters();

    fireEvent.keyDown(second, { key: 'Home' });

    // The pair collapses panel 1 into panel 2, so the boundary slides from
    // 67% to 33% -- the separator never travels to the container origin.
    expect(second.getAttribute('aria-valuenow')).toBe('33');
    expect(second.getAttribute('aria-valuetext')).toBe('33%');
  });

  it('the two-panel reading is unchanged (boundary == leading panel size)', () => {
    render(
      <Splitter>
        <Panel>
          <span>panel-0</span>
        </Panel>
        <Panel>
          <span>panel-1</span>
        </Panel>
      </Splitter>
    );
    const [gutter] = gutters();
    expect(gutter.getAttribute('aria-valuenow')).toBe('50');
  });
});

describe('Modern Splitter panel flex contract', () => {
  it('divides the space left over by the gutters instead of overflowing them', () => {
    const { container } = render(
      <Splitter>
        <Panel defaultSize={33}>Alpha</Panel>
        <Panel defaultSize={34}>Beta</Panel>
        <Panel defaultSize={33}>Gamma</Panel>
      </Splitter>
    );

    const panels = [...container.querySelectorAll('[data-part="panel"]')] as HTMLElement[];
    expect(panels).toHaveLength(3);

    // A percentage basis summing to 100% plus N gutters cannot fit the container.
    for (const panel of panels) {
      expect(panel.style.flexBasis).toBe('0%');
      expect(panel.style.flexShrink).not.toBe('0');
    }

    // The declared ratio survives: grow factors carry the sizes.
    expect(panels.map((p) => p.style.flexGrow)).toEqual(['33', '34', '33']);
  });
});

describe('Modern Splitter separator reachable range', () => {
  const ranges = (c: HTMLElement) =>
    [...c.querySelectorAll('[role="separator"]')].map((s) => ({
      now: Number(s.getAttribute('aria-valuenow')),
      min: Number(s.getAttribute('aria-valuemin')),
      max: Number(s.getAttribute('aria-valuemax')),
    }));

  it('bounds each gutter by the pair it can actually move, not 0-100', () => {
    const { container } = render(
      <Splitter>
        <Panel defaultSize={33}>Alpha</Panel>
        <Panel defaultSize={34}>Beta</Panel>
        <Panel defaultSize={33}>Gamma</Panel>
      </Splitter>
    );

    const [first, second] = ranges(container);
    // gutter 0 moves the 33/34 pair: reachable 0..67
    expect(first).toEqual({ now: 33, min: 0, max: 67 });
    // gutter 1 moves the 34/33 pair, offset by Alpha: reachable 33..100
    expect(second).toEqual({ now: 67, min: 33, max: 100 });
  });

  it('narrows the range to the declared min/max of the adjacent panels', () => {
    const { container } = render(
      <Splitter>
        <Panel defaultSize={50} min={20} max={60}>Alpha</Panel>
        <Panel defaultSize={50} min={30}>Beta</Panel>
      </Splitter>
    );

    const [only] = ranges(container);
    // lead floor 20, lead ceiling min(60, 100-30) = 60
    expect(only.min).toBe(20);
    expect(only.max).toBe(60);
    expect(only.now).toBe(50);
  });
});

describe('Modern Splitter advertised range equals real reach', () => {
  it('resolves an impossible min pair the same way redistributePair does', () => {
    // minLead + minTrail > 100: redistributePair gives the trailing floor
    // precedence, so the advertised range must follow that same resolution.
    const { container } = render(
      <Splitter>
        <Panel defaultSize={50} min={70}>Alpha</Panel>
        <Panel defaultSize={50} min={70}>Beta</Panel>
      </Splitter>
    );

    const sep = container.querySelector('[role="separator"]') as HTMLElement;
    const now = Number(sep.getAttribute('aria-valuenow'));
    const min = Number(sep.getAttribute('aria-valuemin'));
    const max = Number(sep.getAttribute('aria-valuemax'));

    expect(min).toBeLessThanOrEqual(max);
    expect(now).toBeGreaterThanOrEqual(min);
    expect(now).toBeLessThanOrEqual(max);
    // the trailing floor wins on resize; the range still contains the current
    // boundary so the separator never advertises an invalid ARIA window
    expect(min).toBe(30);
    expect(max).toBe(50);
  });
});

describe('Modern Splitter collapsible endpoints', () => {
  const sep = (c: HTMLElement) => c.querySelector('[role="separator"]') as HTMLElement;

  it('Home stops at the declared min when the leading panel is not collapsible', () => {
    const { container } = render(
      <Splitter>
        <Panel defaultSize={50} min={20}>Alpha</Panel>
        <Panel defaultSize={50}>Beta</Panel>
      </Splitter>
    );
    expect(Number(sep(container).getAttribute('aria-valuemin'))).toBe(20);

    fireEvent.keyDown(sep(container), { key: 'Home' });
    expect(Number(sep(container).getAttribute('aria-valuenow'))).toBe(20);
    const lead = container.querySelectorAll('[data-part="panel"]')[0] as HTMLElement;
    expect(lead.style.flexGrow).toBe('20');
    expect(lead.hasAttribute('aria-hidden')).toBe(false);
  });

  it('Home passes the min to 0 when the leading panel is collapsible', () => {
    const { container } = render(
      <Splitter>
        <Panel defaultSize={50} min={20} collapsible>Alpha</Panel>
        <Panel defaultSize={50}>Beta</Panel>
      </Splitter>
    );
    expect(Number(sep(container).getAttribute('aria-valuemin'))).toBe(0);

    fireEvent.keyDown(sep(container), { key: 'Home' });
    expect(Number(sep(container).getAttribute('aria-valuenow'))).toBe(0);
    const lead = container.querySelectorAll('[data-part="panel"]')[0] as HTMLElement;
    expect(lead.style.flexGrow).toBe('0');
    expect(lead.getAttribute('aria-hidden')).toBe('true');
    expect(lead.hasAttribute('inert')).toBe(true);
  });

  it('End collapses the trailing panel only when it is collapsible', () => {
    const { container: locked } = render(
      <Splitter>
        <Panel defaultSize={50}>Alpha</Panel>
        <Panel defaultSize={50} min={20}>Beta</Panel>
      </Splitter>
    );
    expect(Number(sep(locked).getAttribute('aria-valuemax'))).toBe(80);

    const { container: free } = render(
      <Splitter>
        <Panel defaultSize={50}>Alpha</Panel>
        <Panel defaultSize={50} min={20} collapsible>Beta</Panel>
      </Splitter>
    );
    expect(Number(sep(free).getAttribute('aria-valuemax'))).toBe(100);
  });
});

describe('Modern Splitter End collapses the trailing panel', () => {
  it('drives the trailing panel to 0 and out of the a11y tree when collapsible', () => {
    const { container } = render(
      <Splitter>
        <Panel defaultSize={50}>Alpha</Panel>
        <Panel defaultSize={50} min={20} collapsible>Beta</Panel>
      </Splitter>
    );
    const sep = container.querySelector('[role="separator"]') as HTMLElement;

    fireEvent.keyDown(sep, { key: 'End' });

    expect(Number(sep.getAttribute('aria-valuenow'))).toBe(100);
    const trail = container.querySelectorAll('[data-part="panel"]')[1] as HTMLElement;
    expect(trail.style.flexGrow).toBe('0');
    expect(trail.getAttribute('aria-hidden')).toBe('true');
    expect(trail.hasAttribute('inert')).toBe(true);
  });
});
