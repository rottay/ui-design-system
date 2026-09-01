// The collapse trigger's `aria-expanded` needs an `aria-controls` target, so the <aside>
// it resizes must carry the id.
import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Sider } from '../engines/modern';

describe('Layout.Sider modern: the collapse trigger names the region it resizes', () => {
  it('points aria-controls at the sider element', () => {
    const { container } = render(
      <Sider collapsible>
        <nav>Navigation</nav>
      </Sider>,
    );

    const trigger = container.querySelector<HTMLElement>("[data-part='trigger']");
    const sider = container.querySelector<HTMLElement>("[data-part='sider']");
    expect(trigger).toBeTruthy();
    expect(sider).toBeTruthy();

    const controls = trigger?.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    expect(sider?.id).toBe(controls);
    expect(document.getElementById(controls as string)).toBe(sider);
  });

  it('keeps the relation stable across a collapse toggle', () => {
    const { container } = render(
      <Sider collapsible>
        <nav>Navigation</nav>
      </Sider>,
    );

    const trigger = container.querySelector<HTMLElement>("[data-part='trigger']") as HTMLElement;
    const before = trigger.getAttribute('aria-controls');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(trigger);

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBe(before);
    expect(document.getElementById(before as string)).toBeTruthy();
  });

  it('mints a distinct id per sider instance', () => {
    const { container } = render(
      <>
        <Sider collapsible>A</Sider>
        <Sider collapsible>B</Sider>
      </>,
    );

    const ids = Array.from(
      container.querySelectorAll<HTMLElement>("[data-part='sider']"),
    ).map((node) => node.id);
    expect(ids).toHaveLength(2);
    expect(ids[0]).toBeTruthy();
    expect(ids[0]).not.toBe(ids[1]);
  });
});
