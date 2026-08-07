// The jump is one confined, offset-aware write on the resolved container, never
// `scrollIntoView`; a horizontal scrollport reveals the link it reports.
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { Anchor, Link } from '../engines/modern';

const originalScrollTo = window.scrollTo;

afterEach(() => {
  window.scrollTo = originalScrollTo;
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Anchor modern: confined, offset-aware jump', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 120 });
  });

  it('lands the section offsetTop below the viewport edge instead of flush against it', () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo;

    const section = document.createElement('section');
    section.id = 'pricing';
    vi.spyOn(section, 'getBoundingClientRect').mockReturnValue({
      top: 400,
      bottom: 800,
    } as DOMRect);
    document.body.appendChild(section);

    render(
      <Anchor affix offsetTop={64}>
        <Link href="#pricing" title="Pricing" />
      </Anchor>
    );

    fireEvent.click(screen.getByText('Pricing'));

    // 400 (viewport-relative top) + 120 (current offset) - 64 (declared clearance)
    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: 456 })
    );
  });

  it('writes the scroll offset on the nominated container and never touches the page', () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo;

    const container = document.createElement('div');
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 700,
    } as DOMRect);
    Object.defineProperty(container, 'scrollTop', { configurable: true, value: 30 });
    const containerScrollTo = vi.fn();
    container.scrollTo = containerScrollTo as unknown as typeof container.scrollTo;
    document.body.appendChild(container);

    const section = document.createElement('section');
    section.id = 'details';
    vi.spyOn(section, 'getBoundingClientRect').mockReturnValue({
      top: 500,
      bottom: 900,
    } as DOMRect);
    container.appendChild(section);

    render(
      <Anchor getContainer={() => container} offsetTop={16}>
        <Link href="#details" title="Details" />
      </Anchor>
    );

    fireEvent.click(screen.getByText('Details'));

    // 30 (container offset) + 500 - 100 (section relative to container) - 16
    expect(containerScrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: 414 })
    );
    // The page itself is left exactly where the reader put it.
    expect(scrollTo).not.toHaveBeenCalled();
  });
});

describe('Anchor modern: horizontal scrollport reveal', () => {
  // Lays out a horizontal root as a 260px window over 480px of links, with `Delta`
  // parked outside the visible band.
  function layoutOverflowingRoot(root: HTMLElement): void {
    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 260,
      width: 260,
    } as DOMRect);

    const geometry: Record<string, { left: number; right: number }> = {
      Alpha: { left: 0, right: 120 },
      Bravo: { left: 120, right: 240 },
      Charlie: { left: 240, right: 360 },
      Delta: { left: 360, right: 480 },
    };
    for (const item of Array.from(
      root.querySelectorAll<HTMLElement>("[data-part='item']")
    )) {
      const box = geometry[item.textContent ?? ''];
      if (!box) continue;
      vi.spyOn(item, 'getBoundingClientRect').mockReturnValue({
        left: box.left,
        right: box.right,
        width: box.right - box.left,
      } as DOMRect);
    }
  }

  function renderHorizontal(activeKey: string) {
    const result = render(
      <Anchor direction="horizontal" activeKey={activeKey}>
        <Link href="#a" title="Alpha" />
        <Link href="#b" title="Bravo" />
        <Link href="#c" title="Charlie" />
        <Link href="#d" title="Delta" />
      </Anchor>
    );
    const root = result.container.querySelector(
      "[data-part='root']"
    ) as HTMLElement;
    return { ...result, root };
  }

  it('brings the selected link inside the scrollport when it starts outside it', () => {
    const { root, rerender } = renderHorizontal('#a');
    layoutOverflowingRoot(root);
    expect(root.scrollLeft).toBe(0);

    rerender(
      <Anchor direction="horizontal" activeKey="#d">
        <Link href="#a" title="Alpha" />
        <Link href="#b" title="Bravo" />
        <Link href="#c" title="Charlie" />
        <Link href="#d" title="Delta" />
      </Anchor>
    );

    // Delta ends at 480, the window ends at 260: the root scrolls its own
    // inline offset by exactly the shortfall, and nothing else moves.
    expect(root.scrollLeft).toBe(220);
  });

  it('reveals the link the arrow keys focus', () => {
    const { root } = renderHorizontal('#a');
    layoutOverflowingRoot(root);
    root.scrollLeft = 0;

    const charlie = screen.getByText('Charlie');
    charlie.focus();
    fireEvent.keyDown(root, { key: 'ArrowRight' });

    expect(document.activeElement).toBe(screen.getByText('Delta'));
    expect(root.scrollLeft).toBe(220);
  });

  it('leaves a vertical root alone: it is not an inline scrollport', () => {
    const { container } = render(
      <Anchor activeKey="#b">
        <Link href="#a" title="Alpha" />
        <Link href="#b" title="Bravo" />
      </Anchor>
    );
    const root = container.querySelector("[data-part='root']") as HTMLElement;
    expect(root.dataset.direction).toBe('vertical');
    expect(root.scrollLeft).toBe(0);
  });
});

describe('Anchor modern: direction resolution', () => {
  it('mirrors the horizontal arrows from the dir markup, not only computed style', () => {
    const { container } = render(
      <div dir="rtl">
        <Anchor direction="horizontal">
          <Link href="#a" title="Alpha" />
          <Link href="#b" title="Bravo" />
          <Link href="#c" title="Charlie" />
        </Anchor>
      </div>
    );
    const root = container.querySelector("[data-part='root']") as HTMLElement;

    screen.getByText('Bravo').focus();
    fireEvent.keyDown(root, { key: 'ArrowRight' });

    // Under RTL the physical right arrow walks toward the logical START.
    expect(document.activeElement).toBe(screen.getByText('Alpha'));
  });
});
