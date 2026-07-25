/**
 * ScrollArea modern-engine contract tests (K3-C pass 1).
 *
 * The family shipped with NO modern engine skin: its only paint lived in the
 * engine-agnostic presentation skin, keyed on the legacy
 * `.rottay-scroll-area-modern` class, and the engine carried Tailwind
 * overflow utilities plus a stale docblock claiming DaisyUI `--b2`/`--bc`
 * tokens that the CSS never used. These tests pin the K3-C anatomy the new
 * modern skin (`runtime/engines/modern/skin/scroll-area.css`) anchors on:
 *
 *  - the canonical class pair `rottay-scroll-area rottay-scroll-area--modern`
 *    plus `data-part='root'` (the legacy class stays one release);
 *  - `data-orientation` stamped for every orientation value (the skin owns
 *    the overflow contract now — no `overflow-*` utility may remain);
 *  - `data-scrollbar-size` / `data-hide-scrollbar` closed-enum stamps;
 *  - runtime-measured maxHeight/maxWidth stay inline.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernScrollArea from '../engines/modern';

function renderArea(props: Record<string, unknown> = {}) {
  return render(
    <ModernScrollArea data-testid="sa" {...props}>
      <p>Scrollable body</p>
    </ModernScrollArea>
  );
}

describe('ScrollArea modern contract: anatomy', () => {
  it('carries the canonical class pair, the legacy class, and data-part=root', () => {
    renderArea();
    const root = screen.getByTestId('sa');
    expect(root.className).toContain('rottay-scroll-area');
    expect(root.className).toContain('rottay-scroll-area--modern');
    // Legacy class retained one release so the presentation skin degrades gracefully.
    expect(root.className).toContain('rottay-scroll-area-modern');
    expect(root.getAttribute('data-part')).toBe('root');
  });

  it('stamps no overflow-* utility class — the skin owns the overflow contract', () => {
    renderArea({ orientation: 'both' });
    expect(screen.getByTestId('sa').className).not.toMatch(/overflow-[a-z-]*/);
  });

  it.each(['vertical', 'horizontal', 'both'] as const)(
    'stamps data-orientation="%s"',
    (orientation) => {
      renderArea({ orientation });
      expect(screen.getByTestId('sa').getAttribute('data-orientation')).toBe(orientation);
    }
  );

  it('defaults data-orientation to vertical', () => {
    renderArea();
    expect(screen.getByTestId('sa').getAttribute('data-orientation')).toBe('vertical');
  });

  it.each(['thin', 'normal', 'wide'] as const)(
    'stamps data-scrollbar-size="%s"',
    (scrollbarSize) => {
      renderArea({ scrollbarSize });
      expect(screen.getByTestId('sa').getAttribute('data-scrollbar-size')).toBe(scrollbarSize);
    }
  );

  it('stamps data-hide-scrollbar only as the closed true/false pair', () => {
    renderArea({ hideScrollbar: true });
    expect(screen.getByTestId('sa').getAttribute('data-hide-scrollbar')).toBe('true');
  });

  it('defaults data-hide-scrollbar to false', () => {
    renderArea();
    expect(screen.getByTestId('sa').getAttribute('data-hide-scrollbar')).toBe('false');
  });
});

describe('ScrollArea modern contract: keyboard access (axe scrollable-region-focusable)', () => {
  it('the unnamed root stays keyboard-focusable but is NOT a landmark', () => {
    renderArea();
    const root = screen.getByTestId('sa');
    // A scroll container is not a landmark by default (axe landmark-unique):
    // no role, no blanket accessible name — only keyboard reachability.
    expect(root.getAttribute('role')).toBeNull();
    expect(root.getAttribute('aria-label')).toBeNull();
    expect(root.getAttribute('aria-labelledby')).toBeNull();
    expect(root.tabIndex).toBe(0);
  });

  it('keyboard focus reaches the root and the ring part is the root itself', () => {
    renderArea();
    const root = screen.getByTestId('sa');
    root.focus();
    expect(document.activeElement).toBe(root);
  });

  it('a consumer aria-label promotes the root to a named role=region landmark', () => {
    renderArea({ 'aria-label': 'Candidate list' });
    const root = screen.getByTestId('sa');
    expect(root.getAttribute('role')).toBe('region');
    expect(root.getAttribute('aria-label')).toBe('Candidate list');
    expect(root.tabIndex).toBe(0);
  });

  it('a consumer aria-labelledby promotes the root to a named role=region landmark', () => {
    render(
      <>
        <span id="sa-title">Pipeline columns</span>
        <ModernScrollArea data-testid="sa" aria-labelledby="sa-title">
          <p>Scrollable body</p>
        </ModernScrollArea>
      </>
    );
    const root = screen.getByTestId('sa');
    expect(root.getAttribute('role')).toBe('region');
    expect(root.getAttribute('aria-labelledby')).toBe('sa-title');
  });

  it('a blank aria-label is not a meaningful name — no landmark is emitted', () => {
    renderArea({ 'aria-label': '   ' });
    const root = screen.getByTestId('sa');
    expect(root.getAttribute('role')).toBeNull();
    expect(root.getAttribute('aria-label')).toBeNull();
  });
});

describe('ScrollArea modern contract: measured styles stay inline', () => {
  it('keeps maxHeight/maxWidth inline (runtime values, not paint)', () => {
    renderArea({ maxHeight: 240, maxWidth: '50%' });
    const root = screen.getByTestId('sa');
    expect(root.style.maxHeight).toBe('240px');
    expect(root.style.maxWidth).toBe('50%');
  });

  it('consumer inline style still merges (and wins over skin paint)', () => {
    renderArea({ style: { backgroundColor: 'rgb(1, 2, 3)' } });
    expect(screen.getByTestId('sa').style.backgroundColor).toBe('rgb(1, 2, 3)');
  });
});
