/**
 * The dropdown family in a real browser: every decision its paint consumes
 * moves the menu with a negative control; an inline-start placement mirrors
 * under RTL, the rows walk with the listbox keyboard, and loading and
 * accessibility hold.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { readAnatomyBones } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { Dropdown as ModernDropdown } from '../engines/modern';
import type { DropdownProps } from '../contracts';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

const MENU: DropdownProps['menu'] = {
  selectable: true,
  selectedKeys: ['edit'],
  items: [
    { key: 'edit', label: 'Edit' },
    { key: 'duplicate', label: 'Duplicate' },
    { key: 'archive', label: 'Archive', disabled: true },
    { type: 'divider', key: 'divider' },
    { key: 'delete', label: 'Delete', danger: true },
  ],
};

function dropdownMarkup(props: Partial<DropdownProps> = {}): string {
  const view = render(
    <ModernDropdown open menu={MENU} {...props}>
      <button type="button">Actions</button>
    </ModernDropdown>,
  );
  const html = view.container.innerHTML;
  view.unmount();
  return html;
}

const markup = dropdownMarkup();

const SURFACE = "[data-part='surface']";
const ROW = "[data-part='item-shell']:nth-child(2) [data-part='item']";

describeCausality({
  family: 'dropdown',
  markup,
  targets: [
    { id: 'hoverInk', selector: ROW, property: 'border-top-color', attributes: { 'data-state': 'hovered' } },
    { id: 'focusRing', selector: ROW, property: 'box-shadow', attributes: { 'data-state': 'focused focus-visible' } },
    { id: 'radius', selector: SURFACE, property: 'border-top-left-radius' },
    { id: 'edge', selector: SURFACE, property: 'border-top-width' },
    { id: 'rowHeight', selector: ROW, property: 'min-height' },
    { id: 'rowSize', selector: ROW, property: 'font-size' },
    { id: 'duration', selector: SURFACE, property: 'animation-duration' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['hoverInk', 'focusRing'], holds: 'radius', in: VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['focusRing'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'rowSize', in: VERTICALS },
    'density.mode': { value: 'compact', moves: ['rowHeight'], holds: 'radius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['rowSize'], holds: 'radius', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
  },
});

describe('dropdown direction, keyboard, loading and accessibility', () => {
  it('anchors an inline-start placement to the trigger reading-start edge in both directions', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup: `<div style="display:flex;justify-content:center">${markup}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'ltrTrigger', selector: "[data-part='trigger']", property: '@rect.left', dir: 'ltr' },
        { id: 'ltrSurface', selector: SURFACE, property: '@rect.left', dir: 'ltr' },
        { id: 'rtlTrigger', selector: "[data-part='trigger']", property: '@rect.right', dir: 'rtl' },
        { id: 'rtlSurface', selector: SURFACE, property: '@rect.right', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    expect(r.ltrSurface).toBe(r.ltrTrigger);
    expect(r.rtlSurface).toBe(r.rtlTrigger);
  }, 60_000);

  it('walks enabled rows with arrows, edges and type-ahead through the listbox kernel', () => {
    render(
      <ModernDropdown open menu={MENU}>
        <button type="button">Actions</button>
      </ModernDropdown>,
    );
    const edit = screen.getByRole('menuitem', { name: 'Edit' });
    edit.focus();
    fireEvent.keyDown(edit, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Duplicate' }));
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Delete' }));
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Home' });
    expect(document.activeElement).toBe(edit);
    fireEvent.keyDown(edit, { key: 'd' });
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Duplicate' }));
  });

  it('builds its loading state from its own anatomy', () => {
    const { container } = render(
      <ModernDropdown open menu={MENU}>
        <button type="button">Actions</button>
      </ModernDropdown>,
    );
    const bones = readAnatomyBones(container.querySelector<HTMLElement>("[data-part='trigger']")!);
    expect(bones.map((bone) => `${bone.part}:${bone.role}`)).toEqual(
      expect.arrayContaining(['surface:frame', 'label:line']),
    );
    expect(bones.some((bone) => bone.part === 'divider')).toBe(false);
  });

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup }));
      expect(findings, `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
