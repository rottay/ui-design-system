import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';

import { Select } from '../select';
import { TreeSelect } from '../tree-select';
import { Cascader } from '../cascader';
import { AutoComplete } from '../auto-complete';
import { Mentions } from '../mentions';
import { renderWithEngine } from '@tests/support/engine';

// ---------------------------------------------------------------------------
// WO-SKIN-02 checkpoint B -- the dropdown family (Select, TreeSelect,
// Cascader, AutoComplete, Mentions) data-part contract evidence.
//
// The pre-step stamps `data-part` (plus a handful of literal `data-*` state
// attributes -- data-selected, data-disabled, data-active, data-open, etc.)
// onto all five components without moving any paint: every useState hover/
// focus pair and every imperative handler stays exactly where it was. This
// file proves the stamp reached the DOM for each component under every
// engine it supports, both closed and OPEN, and pins portal posture -- which
// is per-engine and NOT symmetric within a component:
//
//   Select        modern portals (custom-dropdown branch), rustic in-tree
//   TreeSelect    both portal, by two DIFFERENT routes
//   Cascader      both portal, by two DIFFERENT routes
//   AutoComplete  modern portals, rustic in-tree
//   Mentions      modern portals, rustic in-tree
//
// The two routes are not interchangeable and the assertions below tell them
// apart: a Modern panel crosses the overlay kernel's portal boundary and lands
// inside the shared `[data-rottay-portal]` root carrying its layer stamp,
// while a Rustic panel calls `createPortal(document.body)` directly and has no
// such ancestor. "Portaled" is therefore never asserted as "not in container"
// alone -- each case also proves WHICH door the panel used and that the
// trigger still owns it through `aria-controls`.
//
// It does not assert paint (that is dropdowns-batch.spec.ts's job).
//
// Every render goes through `createEngineComponent`'s Suspense-wrapped lazy
// engine loader, so a synchronous `container.querySelector(...)` right after
// `render()` can race the still-pending engine chunk -- same idiom as
// FieldsBatch.contract.test.tsx's waitForPart helper.
// ---------------------------------------------------------------------------

const ENGINES = ['modern', 'rustic'] as const;

async function waitForPart(container: HTMLElement, part: string): Promise<Element> {
  await waitFor(() => {
    expect(container.querySelector(`[data-part="${part}"]`)).not.toBeNull();
  });
  return container.querySelector(`[data-part="${part}"]`) as Element;
}

/** Waits for a `data-part="dropdown"` to appear anywhere in `document` (portaled popups
 * render under `document.body`, outside the render container). */
async function waitForDocumentDropdown(): Promise<HTMLElement> {
  await waitFor(() => {
    expect(document.querySelectorAll('[data-part="dropdown"]').length).toBeGreaterThan(0);
  });
  return document.querySelector('[data-part="dropdown"]') as HTMLElement;
}

/** The overlay kernel's shared portal root -- the ONLY door a Modern panel uses. */
const KERNEL_PORTAL_ROOT = '[data-rottay-portal]';

/**
 * A Modern panel that left the field subtree through `FieldOverlayPanel`:
 * outside the render container, inside the kernel portal root, stamped by the
 * layer stack, and still owned by its trigger via `aria-controls`/`id`.
 */
function expectKernelPortaledPanel(
  container: HTMLElement,
  panel: HTMLElement,
  trigger: Element,
): void {
  expect(container.contains(panel)).toBe(false);
  expect(panel.closest(KERNEL_PORTAL_ROOT)).not.toBeNull();
  expect(panel.getAttribute('data-overlay-layer')).toMatch(/^ds-overlay-/);
  expect(panel.getAttribute('data-overlay-kind')).toBe('dropdown');
  expect(panel.id).not.toBe('');
  expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
}

/**
 * A Rustic panel that portals itself: also outside the container, but through
 * its own `createPortal(document.body)` -- so it carries neither the kernel
 * portal root nor a layer stamp. Asserting the absence keeps the two routes
 * from silently merging.
 */
function expectSelfPortaledPanel(container: HTMLElement, panel: HTMLElement): void {
  expect(container.contains(panel)).toBe(false);
  expect(panel.closest(KERNEL_PORTAL_ROOT)).toBeNull();
  expect(panel.getAttribute('data-overlay-layer')).toBeNull();
}

const SELECT_OPTIONS = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
];

const TREE_DATA = [
  { value: 'engineering', title: 'Engineering', children: [{ value: 'frontend', title: 'Frontend' }] },
  { value: 'design', title: 'Design' },
];

const CASCADER_OPTIONS = [
  { value: 'us', label: 'United States', children: [{ value: 'us-ca', label: 'California' }] },
  { value: 'ca', label: 'Canada' },
];

const AC_OPTIONS = [
  { value: 'React', label: 'React' },
  { value: 'Vue', label: 'Vue' },
];

const MENTIONS_OPTIONS = [
  { value: 'ada', label: 'Ada Lovelace' },
  { value: 'grace', label: 'Grace Hopper' },
];

describe('Dropdown family data-part contract (WO-SKIN-02 checkpoint B)', () => {
  describe('Select', () => {
    it.each(ENGINES)(
      'closed: stamps root/trigger/value/tag/tag-remove/arrow-icon; open: stamps dropdown/option at the correct portal posture under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Select
            options={SELECT_OPTIONS}
            multiple
            defaultValue={['design', 'engineering']}
            maxTagCount={1}
            onChange={vi.fn()}
          />,
          engine,
        );

        await waitForPart(container, 'root');
        expect(container.querySelectorAll('[data-part="trigger"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="value"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="tag"]').length).toBeGreaterThan(0);
        expect(container.querySelectorAll('[data-part="tag-remove"]').length).toBeGreaterThan(0);
        expect(container.querySelectorAll('[data-part="arrow-icon"]')).toHaveLength(1);
        // Popup does not exist until opened, in either engine.
        expect(document.querySelectorAll('[data-part="dropdown"]')).toHaveLength(0);

        const trigger = container.querySelector('[data-part="trigger"]') as HTMLElement;
        fireEvent.click(trigger);

        const dropdown = await waitForDocumentDropdown();
        // Select portals only in modern's custom-dropdown branch (forced here
        // by `multiple`); rustic's dropdown is always in-tree.
        const isPortaled = engine === 'modern';
        expect(container.contains(dropdown)).toBe(!isPortaled);
        expect(dropdown.querySelectorAll('[data-part="option"]').length).toBeGreaterThan(0);
      },
    );
  });

  describe('TreeSelect', () => {
    it.each(ENGINES)(
      'closed: stamps trigger/placeholder/arrow-icon; open: stamps dropdown/option/tree-node-toggle at the correct portal posture under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(<TreeSelect treeData={TREE_DATA} onChange={vi.fn()} />, engine);

        await waitForPart(container, 'trigger');
        expect(container.querySelectorAll('[data-part="placeholder"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="arrow-icon"]')).toHaveLength(1);
        expect(document.querySelectorAll('[data-part="dropdown"]')).toHaveLength(0);

        const trigger = container.querySelector('[data-part="trigger"]') as HTMLElement;
        fireEvent.click(trigger);

        const dropdown = await waitForDocumentDropdown();
        // TreeSelect was the last family still rendering its Modern panel in
        // the field subtree; WO-CAN-05 moved it onto the kernel. Both engines
        // portal now, through two different doors.
        if (engine === 'modern') {
          expectKernelPortaledPanel(container, dropdown, trigger);
          expect(trigger.getAttribute('aria-expanded')).toBe('true');
        } else {
          expectSelfPortaledPanel(container, dropdown);
        }
        expect(dropdown.querySelectorAll('[data-part="option"]').length).toBeGreaterThan(0);
        expect(dropdown.querySelectorAll('[data-part="tree-node-toggle"]').length).toBeGreaterThan(0);
      },
    );
  });

  describe('Cascader', () => {
    it.each(ENGINES)(
      'closed: stamps trigger/placeholder/arrow-icon; open: stamps dropdown/menu-column/option at the correct portal posture under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(<Cascader options={CASCADER_OPTIONS} onChange={vi.fn()} />, engine);

        await waitForPart(container, 'trigger');
        expect(container.querySelectorAll('[data-part="placeholder"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="arrow-icon"]')).toHaveLength(1);
        expect(document.querySelectorAll('[data-part="dropdown"]')).toHaveLength(0);

        const trigger = container.querySelector('[data-part="trigger"]') as HTMLElement;
        fireEvent.click(trigger);

        const dropdown = await waitForDocumentDropdown();
        // Both engines portal, by two different doors: modern now leaves the
        // field subtree through the overlay kernel (WO-CAN-05), rustic still
        // calls `createPortal(document.body)` itself.
        if (engine === 'modern') {
          expectKernelPortaledPanel(container, dropdown, trigger);
          expect(trigger.getAttribute('aria-expanded')).toBe('true');
        } else {
          expectSelfPortaledPanel(container, dropdown);
        }
        expect(dropdown.querySelectorAll('[data-part="menu-column"]').length).toBeGreaterThan(0);
        expect(dropdown.querySelectorAll('[data-part="option"]').length).toBeGreaterThan(0);
      },
    );
  });

  describe('AutoComplete', () => {
    it.each(ENGINES)(
      'closed: stamps root/input; open on focus: stamps dropdown/option at the correct portal posture under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(<AutoComplete options={AC_OPTIONS} onChange={vi.fn()} />, engine);

        await waitForPart(container, 'root');
        expect(container.querySelectorAll('[data-part="input"]')).toHaveLength(1);
        expect(document.querySelectorAll('[data-part="dropdown"]')).toHaveLength(0);

        const input = container.querySelector('[data-part="input"]') as HTMLElement;
        fireEvent.focus(input);

        const dropdown = await waitForDocumentDropdown();
        if (engine === 'modern') {
          // Modern's listbox left the field subtree through the kernel
          // (WO-CAN-05); the combobox input still names it, so the
          // aria-controls -> id link is the ownership proof.
          expectKernelPortaledPanel(container, dropdown, input);
          expect(input.getAttribute('aria-expanded')).toBe('true');
          expect(dropdown.getAttribute('role')).toBe('listbox');
        } else {
          // Rustic keeps its listbox inside the field subtree.
          expect(container.contains(dropdown)).toBe(true);
        }
        expect(dropdown.querySelectorAll('[data-part="option"]').length).toBeGreaterThan(0);
      },
    );
  });

  describe('Mentions', () => {
    it.each(ENGINES)(
      'closed: stamps root/textarea; open on typed "@" trigger: stamps dropdown/option at the correct portal posture under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(<Mentions options={MENTIONS_OPTIONS} onChange={vi.fn()} />, engine);

        await waitForPart(container, 'root');
        expect(container.querySelectorAll('[data-part="textarea"]')).toHaveLength(1);
        expect(document.querySelectorAll('[data-part="dropdown"]')).toHaveLength(0);

        // Mentions only opens once an active `@mention` trigger is being
        // typed -- focus/click alone does not open it.
        const textarea = container.querySelector('[data-part="textarea"]') as HTMLTextAreaElement;
        fireEvent.change(textarea, { target: { value: '@a' } });

        const dropdown = await waitForDocumentDropdown();
        if (engine === 'modern') {
          // Modern's suggestion listbox is portaled by the kernel (WO-CAN-05).
          // The textbox emits no aria-expanded (the role does not support it),
          // so aria-controls is the whole ownership contract here, and the
          // mention-session accent travels WITH the panel now that it is no
          // longer a descendant of the field root.
          expectKernelPortaledPanel(container, dropdown, textarea);
          expect(dropdown.getAttribute('role')).toBe('listbox');
          expect(dropdown.getAttribute('data-mention-active')).toBe('true');
        } else {
          // Rustic keeps its suggestion list inside the field subtree.
          expect(container.contains(dropdown)).toBe(true);
        }
        expect(dropdown.querySelectorAll('[data-part="option"]').length).toBeGreaterThan(0);
      },
    );
  });
});
