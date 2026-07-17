import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';

import { Select } from '../Select';
import { TreeSelect } from '../TreeSelect';
import { Cascader } from '../Cascader';
import { AutoComplete } from '../AutoComplete';
import { Mentions } from '../Mentions';
import { renderWithEngine } from '../../../../tooling/testing/helpers/engine';

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
// is per-engine and NOT symmetric within a component (Select portals only in
// modern's custom-dropdown branch, TreeSelect and Cascader portal only in
// rustic, AutoComplete and Mentions never portal). It does not assert paint
// (that is dropdowns-batch.spec.ts's job).
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
        // TreeSelect is the mirror image of Select: it portals only in
        // rustic; modern's dropdown is in-tree.
        const isPortaled = engine === 'rustic';
        expect(container.contains(dropdown)).toBe(!isPortaled);
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
        // Cascader portals only in rustic -- modern's engine file has no
        // createPortal import (grep-verified), contradicting the checkpoint
        // contract's "Cascader both engines" note; the code is ground truth.
        const isPortaled = engine === 'rustic';
        expect(container.contains(dropdown)).toBe(!isPortaled);
        expect(dropdown.querySelectorAll('[data-part="menu-column"]').length).toBeGreaterThan(0);
        expect(dropdown.querySelectorAll('[data-part="option"]').length).toBeGreaterThan(0);
      },
    );
  });

  describe('AutoComplete', () => {
    it.each(ENGINES)(
      'closed: stamps root/input; open on focus: stamps dropdown/option in-tree under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(<AutoComplete options={AC_OPTIONS} onChange={vi.fn()} />, engine);

        await waitForPart(container, 'root');
        expect(container.querySelectorAll('[data-part="input"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="dropdown"]')).toHaveLength(0);

        const input = container.querySelector('[data-part="input"]') as HTMLElement;
        fireEvent.focus(input);

        await waitFor(() => {
          expect(container.querySelectorAll('[data-part="dropdown"]').length).toBeGreaterThan(0);
        });
        // AutoComplete never portals in either engine.
        const dropdown = container.querySelector('[data-part="dropdown"]') as HTMLElement;
        expect(container.contains(dropdown)).toBe(true);
        expect(dropdown.querySelectorAll('[data-part="option"]').length).toBeGreaterThan(0);
      },
    );
  });

  describe('Mentions', () => {
    it.each(ENGINES)(
      'closed: stamps root/textarea; open on typed "@" trigger: stamps dropdown/option in-tree under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(<Mentions options={MENTIONS_OPTIONS} onChange={vi.fn()} />, engine);

        await waitForPart(container, 'root');
        expect(container.querySelectorAll('[data-part="textarea"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="dropdown"]')).toHaveLength(0);

        // Mentions only opens once an active `@mention` trigger is being
        // typed -- focus/click alone does not open it.
        const textarea = container.querySelector('[data-part="textarea"]') as HTMLTextAreaElement;
        fireEvent.change(textarea, { target: { value: '@a' } });

        await waitFor(() => {
          expect(container.querySelectorAll('[data-part="dropdown"]').length).toBeGreaterThan(0);
        });
        // Mentions never portals in either engine.
        const dropdown = container.querySelector('[data-part="dropdown"]') as HTMLElement;
        expect(container.contains(dropdown)).toBe(true);
        expect(dropdown.querySelectorAll('[data-part="option"]').length).toBeGreaterThan(0);
      },
    );
  });
});
