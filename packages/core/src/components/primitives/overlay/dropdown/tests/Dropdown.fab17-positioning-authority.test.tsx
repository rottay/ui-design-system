/**
 * @fileoverview FAB-17 observable contract -- Dropdown (modern engine).
 *
 * The surface's position, layer and the coordinates its placement computes are
 * anatomy the skin owns, and `overlayStyle` is a public, unrestricted hatch.
 * The engine drops the caller's `position` and `zIndex`, the measured
 * `top`/`left` of a portaled surface, and the one block end and inline edge an
 * in-tree placement claims. The ends a placement does not compute, and every
 * other property the caller paints, still reach the surface.
 */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Dropdown as ModernDropdown } from '../engines/modern';

const SURFACE = '.ds-dropdown-surface';
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

function CommitProbe({ sink }: { sink: Array<{ measured: string | null; visibility: string }> }): React.ReactElement {
  return (
    <span
      ref={(node) => {
        const surface = node?.closest<HTMLElement>(SURFACE);
        if (!surface) return;
        sink.push({ measured: surface.getAttribute('data-measured'), visibility: surface.style.visibility });
      }}
    />
  );
}

function surfaceEl(): HTMLElement {
  const surface = document.querySelector(SURFACE) as HTMLElement | null;
  expect(surface).not.toBeNull();
  return surface as HTMLElement;
}

describe('FAB-17 / Dropdown modern: the caller never strands the surface', () => {
  it('in-tree branch: position, layer and the claimed coordinate never reach the surface', () => {
    render(
      <ModernDropdown open overlayStyle={CALLER_HATCH} menu={MENU}>
        <button type="button">trigger</button>
      </ModernDropdown>,
    );
    const surface = surfaceEl();

    expect(surface).toHaveAttribute('data-placement', 'bottomLeft');
    expect(surface.style.position).toBe('');
    expect(surface.style.zIndex).toBe('');
    expect(surface.style.top).toBe('');
  });

  it('portal branch: the measured coordinates travel as channels and the caller offsets are gone', async () => {
    render(
      <ModernDropdown open overlayStyle={CALLER_HATCH} getPopupContainer={() => document.body} menu={MENU}>
        <button type="button">trigger</button>
      </ModernDropdown>,
    );
    await waitFor(() => expect(document.querySelector(SURFACE)).not.toBeNull());
    const surface = surfaceEl();

    await waitFor(() => expect(surface.style.getPropertyValue('--ds-dropdown-position-top')).toBe('8px'));
    expect(surface).toHaveAttribute('data-portaled', 'true');
    expect(surface.style.getPropertyValue('--ds-dropdown-position-left')).toBe('8px');
    expect(surface.style.position).toBe('');
    expect(surface.style.top).toBe('');
    expect(surface.style.left).toBe('');
    expect(surface.style.zIndex).toBe('');
  });
});

const PLACEMENT_MATRIX = [
  { placement: 'bottomLeft', blockProp: 'top', inlineProp: 'inset-inline-start' },
  { placement: 'bottomRight', blockProp: 'top', inlineProp: 'inset-inline-end' },
  { placement: 'topLeft', blockProp: 'bottom', inlineProp: 'inset-inline-start' },
  { placement: 'topRight', blockProp: 'bottom', inlineProp: 'inset-inline-end' },
  { placement: 'bottom', blockProp: 'top', inlineProp: 'left' },
  { placement: 'top', blockProp: 'bottom', inlineProp: 'left' },
] as const;

const COORDINATE_HATCH: React.CSSProperties = {
  top: '999px',
  bottom: '777px',
  left: '888px',
  insetInlineStart: '911px',
  insetInlineEnd: '922px',
};

describe('FAB-17 / Dropdown modern: each in-tree placement claims exactly its own ends', () => {
  it.each(PLACEMENT_MATRIX)('$placement: the caller loses $blockProp and $inlineProp', ({ placement, blockProp, inlineProp }) => {
    render(
      <ModernDropdown open placement={placement} overlayStyle={COORDINATE_HATCH} menu={MENU}>
        <button type="button">trigger</button>
      </ModernDropdown>,
    );
    const style = surfaceEl().style;

    expect(style.getPropertyValue(blockProp)).toBe('');
    expect(style.getPropertyValue(inlineProp)).toBe('');
  });

  it.each(PLACEMENT_MATRIX)('$placement: the ends it does not compute stay with the caller', ({ placement, blockProp, inlineProp }) => {
    render(
      <ModernDropdown open placement={placement} overlayStyle={COORDINATE_HATCH} menu={MENU}>
        <button type="button">trigger</button>
      </ModernDropdown>,
    );
    const style = surfaceEl().style;

    expect(style.getPropertyValue(blockProp === 'top' ? 'bottom' : 'top')).toBe(blockProp === 'top' ? '777px' : '999px');
    if (inlineProp === 'inset-inline-start') expect(style.getPropertyValue('inset-inline-end')).toBe('922px');
    if (inlineProp === 'inset-inline-end') expect(style.getPropertyValue('inset-inline-start')).toBe('911px');
  });
});

describe('FAB-17 / Dropdown modern: the guard does not over-reach', () => {
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
      <ModernDropdown open overlayStyle={CALLER_HATCH} getPopupContainer={() => document.body} menu={MENU}>
        <button type="button">trigger</button>
      </ModernDropdown>,
    );
    await waitFor(() => expect(document.querySelector(SURFACE)).not.toBeNull());

    expect(surfaceEl().style.background).toBe('rgb(1, 2, 3)');
    expect(surfaceEl().style.padding).toBe('77px');
  });

  it('`visibility` remains caller-overridable in the pre-measurement commit', async () => {
    const sink: Array<{ measured: string | null; visibility: string }> = [];
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

    const preMeasurement = sink.find((entry) => entry.measured === 'false');
    expect(preMeasurement).toBeDefined();
    expect(preMeasurement?.visibility).toBe('visible');
  });

  it('control: with no caller `visibility`, the pre-measurement commit is only marked unmeasured', async () => {
    const sink: Array<{ measured: string | null; visibility: string }> = [];
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

    const preMeasurement = sink.find((entry) => entry.measured === 'false');
    expect(preMeasurement).toBeDefined();
    expect(preMeasurement?.visibility).toBe('');
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
