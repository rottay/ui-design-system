/**
 * @fileoverview FAB-17 observable contract -- Dropdown (modern engine).
 *
 * FAB-17 ruled that the engine's POSITIONING BLOCK merges AFTER caller
 * `overlayStyle`. For Dropdown the block is `position`, the owned `zIndex`, and
 * the placement COORDINATES -- measured `popupPosition` in the portal branch,
 * `inTreePlacementStyle()` otherwise. The engine MEASURES those coordinates at
 * runtime and applies them against the position it sets, so `position: static`
 * from the public hatch detaches the menu from the trigger it tracks.
 *
 * `visibility` is deliberately NOT in the block. The pre-measurement guard was
 * hoisted ABOVE `...overlayStyle` so a caller can still control it. That
 * narrowness is asserted here in the ONE state that can discriminate it: the
 * commit where the surface is portaled but not yet measured, where the guard
 * would otherwise force `hidden`. Post-measurement the guard is inert and a
 * correct narrow implementation is indistinguishable from an over-broad one,
 * so asserting only there would be the cheaper question.
 */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Dropdown as ModernDropdown } from '../engines/modern';

const SURFACE = '.rottay-dropdown__surface';
const SUBMENU = "[data-part='submenu']";

const CALLER_HATCH: React.CSSProperties = {
  position: 'static',
  top: '999px',
  left: '888px',
  zIndex: 4,
  background: 'rgb(1, 2, 3)',
  padding: '77px',
};

const MENU = { items: [{ key: 'a', label: 'A' }] };

/**
 * Snapshots the enclosing surface's inline style during the commit that
 * inserts it into the portal. Child ref callbacks fire while that commit is
 * being applied -- before the measuring layout effect has published
 * `popupPosition` -- which is the only window in which the pre-measurement
 * visibility guard is observable.
 */
function CommitProbe({ sink }: { sink: string[] }): React.ReactElement {
  return (
    <span
      ref={(node) => {
        if (!node) return;
        sink.push(String(node.closest(SURFACE)?.getAttribute('style')));
      }}
    />
  );
}

function surfaceEl(): HTMLElement {
  const surface = document.querySelector(SURFACE) as HTMLElement | null;
  expect(surface).not.toBeNull();
  return surface as HTMLElement;
}

describe('FAB-17 / Dropdown modern: engine positioning block wins over caller style', () => {
  it('in-tree branch: engine `position`, owned zIndex and placement coordinates win', async () => {
    render(
      <ModernDropdown open overlayStyle={CALLER_HATCH} menu={MENU}>
        <button type="button">trigger</button>
      </ModernDropdown>,
    );
    const surface = surfaceEl();

    expect(surface.style.position).toBe('absolute');
    expect(surface.style.position).not.toBe('static');
    expect(surface.style.getPropertyValue('z-index')).toBe('var(--ds-z-dropdown)');
    expect(surface.style.getPropertyValue('z-index')).not.toBe('4');
    // The in-tree placement coordinate outranks the caller's competing offset.
    expect(surface.style.top).toBe('calc(100% + 8px)');
    expect(surface.style.top).not.toBe('999px');
  });

  it('portal branch: the MEASURED coordinates outrank the caller offsets', async () => {
    render(
      <ModernDropdown
        open
        overlayStyle={CALLER_HATCH}
        getPopupContainer={() => document.body}
        menu={MENU}
      >
        <button type="button">trigger</button>
      </ModernDropdown>,
    );
    await waitFor(() => expect(document.querySelector(SURFACE)).not.toBeNull());
    const surface = surfaceEl();

    // Precondition: the measured branch actually ran. Without this the test
    // could pass while silently asserting the in-tree branch instead.
    await waitFor(() => expect(surface.style.top).toBe('8px'));

    expect(surface.style.position).toBe('absolute');
    expect(surface.style.left).toBe('8px');
    expect(surface.style.top).not.toBe('999px');
    expect(surface.style.left).not.toBe('888px');
    expect(surface.style.getPropertyValue('z-index')).toBe('var(--ds-z-dropdown)');
  });
});

/**
 * `inTreePlacementStyle()` emits TWO coordinates per placement, and FAB-17's
 * "the placement coordinates it computes" covers BOTH:
 *
 *   block axis   `top`  (bottom* placements) / `bottom` (top* placements)
 *   inline axis  `insetInlineStart: 0` (*Left) / `insetInlineEnd: 0` (*Right)
 *                / `left: 50%` (+ a centring self-translate) for the neutral
 *
 * The inline axis uses LOGICAL properties deliberately -- they mirror under
 * RTL where physical `left` does not. A test that drives the hatch with `left`
 * while the engine emits `insetInlineStart` is comparing two properties that
 * never collide: it can neither observe the override nor notice the coordinate
 * being deleted, and it would pass an implementation that broke RTL placement
 * outright. So the hatch below is driven with the SAME logical properties.
 */
const PLACEMENT_MATRIX = [
  { placement: 'bottomLeft', blockProp: 'top', inlineProp: 'inset-inline-start', inlineValue: '0' },
  { placement: 'bottomRight', blockProp: 'top', inlineProp: 'inset-inline-end', inlineValue: '0' },
  { placement: 'topLeft', blockProp: 'bottom', inlineProp: 'inset-inline-start', inlineValue: '0' },
  { placement: 'topRight', blockProp: 'bottom', inlineProp: 'inset-inline-end', inlineValue: '0' },
  { placement: 'bottom', blockProp: 'top', inlineProp: 'left', inlineValue: '50%' },
  { placement: 'top', blockProp: 'bottom', inlineProp: 'left', inlineValue: '50%' },
] as const;

/** Every coordinate the engine might emit, all set to losing caller values. */
const COORDINATE_HATCH: React.CSSProperties = {
  top: '999px',
  bottom: '777px',
  left: '888px',
  insetInlineStart: '911px',
  insetInlineEnd: '922px',
};

const BLOCK_GAP = 'calc(100% + 8px)';

describe('FAB-17 / Dropdown modern: BOTH placement axes are engine-owned', () => {
  it.each(PLACEMENT_MATRIX)(
    '$placement: engine wins the block axis ($blockProp) over the caller',
    ({ placement, blockProp }) => {
      render(
        <ModernDropdown open placement={placement} overlayStyle={COORDINATE_HATCH} menu={MENU}>
          <button type="button">trigger</button>
        </ModernDropdown>,
      );
      const style = surfaceEl().style;

      expect(style.getPropertyValue(blockProp)).toBe(BLOCK_GAP);
      // The caller's competing value on the SAME property is gone.
      expect(style.getPropertyValue(blockProp)).not.toBe(blockProp === 'top' ? '999px' : '777px');
    },
  );

  it.each(PLACEMENT_MATRIX)(
    '$placement: engine wins the inline axis ($inlineProp) over the caller',
    ({ placement, inlineProp, inlineValue }) => {
      render(
        <ModernDropdown open placement={placement} overlayStyle={COORDINATE_HATCH} menu={MENU}>
          <button type="button">trigger</button>
        </ModernDropdown>,
      );
      const style = surfaceEl().style;

      expect(style.getPropertyValue(inlineProp)).toBe(inlineValue);
      // Deleting this coordinate from the engine block, or letting the caller
      // win it, both land here.
      const callerValue =
        inlineProp === 'inset-inline-start' ? '911px' : inlineProp === 'inset-inline-end' ? '922px' : '888px';
      expect(style.getPropertyValue(inlineProp)).not.toBe(callerValue);
    },
  );

  it.each(PLACEMENT_MATRIX)(
    '$placement: the OPPOSITE axis ends the engine does not compute stay with the caller',
    ({ placement, blockProp, inlineProp }) => {
      // Narrowness: each placement claims exactly one block end and one inline
      // end. An over-broad block that pinned all four would clobber these.
      render(
        <ModernDropdown open placement={placement} overlayStyle={COORDINATE_HATCH} menu={MENU}>
          <button type="button">trigger</button>
        </ModernDropdown>,
      );
      const style = surfaceEl().style;

      expect(style.getPropertyValue(blockProp === 'top' ? 'bottom' : 'top')).toBe(
        blockProp === 'top' ? '777px' : '999px',
      );
      if (inlineProp === 'inset-inline-start') expect(style.getPropertyValue('inset-inline-end')).toBe('922px');
      if (inlineProp === 'inset-inline-end') expect(style.getPropertyValue('inset-inline-start')).toBe('911px');
    },
  );
});

describe('FAB-17 / Dropdown modern: the guard did NOT over-reach', () => {
  it('caller-supplied non-positioning paint still wins (in-tree)', () => {
    render(
      <ModernDropdown open overlayStyle={CALLER_HATCH} menu={MENU}>
        <button type="button">trigger</button>
      </ModernDropdown>,
    );
    const surface = surfaceEl();

    expect(surface.style.background).toBe('rgb(1, 2, 3)');
    expect(surface.style.padding).toBe('77px');
  });

  it('caller-supplied non-positioning paint still wins (portal)', async () => {
    render(
      <ModernDropdown
        open
        overlayStyle={CALLER_HATCH}
        getPopupContainer={() => document.body}
        menu={MENU}
      >
        <button type="button">trigger</button>
      </ModernDropdown>,
    );
    await waitFor(() => expect(document.querySelector(SURFACE)).not.toBeNull());

    expect(surfaceEl().style.background).toBe('rgb(1, 2, 3)');
    expect(surfaceEl().style.padding).toBe('77px');
  });

  it('`visibility` remains caller-overridable in the PRE-MEASUREMENT commit', async () => {
    const sink: string[] = [];
    render(
      <ModernDropdown
        open
        overlayStyle={{ visibility: 'visible' }}
        getPopupContainer={() => document.body}
        menu={{ items: [{ key: 'a', label: <CommitProbe sink={sink} /> }] }}
      >
        <button type="button">trigger</button>
      </ModernDropdown>,
    );
    await waitFor(() => expect(document.querySelector(SURFACE)).not.toBeNull());

    // The portaled, not-yet-measured commit: `position` is already applied but
    // no coordinates are, which is the signature of `popupPosition === null`.
    // The portaled, not-yet-measured commit is the one carrying `position`
    // but NO placement coordinate at all. Keying on the absence of `top:`
    // alone was brittle: deleting the engine's block-axis coordinate made the
    // IN-TREE commit match this too, so the test failed for a coincidental
    // reason. Requiring every coordinate to be absent identifies the portal
    // commit uniquely, because the in-tree branch always emits an inline one.
    const preMeasurement = sink.find(
      (entry) =>
        entry.includes('position: absolute') &&
        !entry.includes('top:') &&
        !entry.includes('bottom:') &&
        !entry.includes('inset-inline-start:') &&
        !entry.includes('inset-inline-end:') &&
        !entry.includes('left:'),
    );
    expect(preMeasurement).toBeDefined();

    // The guard would have forced `hidden` here. The caller's value survives
    // because the guard sits ABOVE `...overlayStyle`, outside FAB-17's block.
    expect(preMeasurement).toContain('visibility: visible');
    expect(preMeasurement).not.toContain('visibility: hidden');
  });

  it('control: with no caller `visibility`, the pre-measurement guard DOES apply', async () => {
    // Proves the previous test observed a live guard rather than an absent one.
    const sink: string[] = [];
    render(
      <ModernDropdown
        open
        getPopupContainer={() => document.body}
        menu={{ items: [{ key: 'a', label: <CommitProbe sink={sink} /> }] }}
      >
        <button type="button">trigger</button>
      </ModernDropdown>,
    );
    await waitFor(() => expect(document.querySelector(SURFACE)).not.toBeNull());

    // The portaled, not-yet-measured commit is the one carrying `position`
    // but NO placement coordinate at all. Keying on the absence of `top:`
    // alone was brittle: deleting the engine's block-axis coordinate made the
    // IN-TREE commit match this too, so the test failed for a coincidental
    // reason. Requiring every coordinate to be absent identifies the portal
    // commit uniquely, because the in-tree branch always emits an inline one.
    const preMeasurement = sink.find(
      (entry) =>
        entry.includes('position: absolute') &&
        !entry.includes('top:') &&
        !entry.includes('bottom:') &&
        !entry.includes('inset-inline-start:') &&
        !entry.includes('inset-inline-end:') &&
        !entry.includes('left:'),
    );
    expect(preMeasurement).toBeDefined();
    expect(preMeasurement).toContain('visibility: hidden');
  });
});

describe('FAB-17 / Dropdown modern: submenu is a PROTECTED CONTROL', () => {
  /**
   * Kept free of any assertion about the surface so this control HOLDS STILL
   * under every mutation of the positioning block. A control that moves with
   * the thing it is controlling for is not a control.
   */
  function renderWithSubmenu(): void {
    render(
      <ModernDropdown
        open
        overlayStyle={CALLER_HATCH}
        menu={{ items: [{ key: 'a', label: 'A', children: [{ key: 'b', label: 'B' }] }] }}
      >
        <button type="button">trigger</button>
      </ModernDropdown>,
    );

    const item = document.querySelector("[data-part='item-shell']") as HTMLElement;
    expect(item).not.toBeNull();
    fireEvent.mouseEnter(item);
  }

  it('the submenu carries no inline positioning for the hatch to reach', () => {
    // Already protected: the submenu is positioned entirely by the modern skin
    // and takes no caller style, so it needed no FAB-17 change. This assertion
    // passes identically before the ruling, after it, and under an over-broad
    // variant of it -- which is exactly what makes it a control.
    renderWithSubmenu();

    const submenu = document.querySelector(SUBMENU) as HTMLElement | null;
    expect(submenu).not.toBeNull();
    expect(submenu?.getAttribute('style')).toBeNull();
    expect((submenu as HTMLElement).style.position).toBe('');
  });

  it('scoping evidence: the same caller payload DID reach the surface', () => {
    // Separated from the control above so the control stays inert. Without
    // this, the control could be passing merely because the hatch was dead in
    // that render rather than because the submenu is out of its reach.
    renderWithSubmenu();

    expect(surfaceEl().style.background).toBe('rgb(1, 2, 3)');
    expect(document.querySelector(SUBMENU)).not.toBeNull();
  });
});
