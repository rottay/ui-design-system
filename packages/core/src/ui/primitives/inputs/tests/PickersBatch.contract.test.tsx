import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';

import { DatePicker } from '../DatePicker';
import { TimePicker } from '../TimePicker';
import { Upload } from '../Upload';
import { Transfer } from '../Transfer';
import { ColorPicker } from '../ColorPicker';
import { renderWithEngine } from '../../../../tooling/testing/helpers/engine';

// ---------------------------------------------------------------------------
// WO-SKIN-02 checkpoint C -- the pickers-and-movers family (DatePicker,
// TimePicker, Upload, Transfer, ColorPicker) data-part contract evidence.
//
// The pre-step stamps `data-part` (plus data-today/data-selected/
// data-in-range/data-disabled/data-status/data-state) onto all five
// components without moving any paint: every imperative handler stays
// exactly where it was. This file proves the stamp reached the DOM for each
// component under every engine it supports, both closed and open where an
// open state exists, and pins portal posture -- which is per-component and
// NOT symmetric (DatePicker portals in both engines; TimePicker portals only
// in modern, rustic has no panel at all -- native <input type="time">;
// Upload's PreviewModal portals in neither engine; ColorPicker portals only
// in rustic, matching the checkpoint contract's documented cross-engine
// asymmetry). It does not assert paint (that is pickers-batch.spec.ts's job).
//
// Every render goes through `createEngineComponent`'s Suspense-wrapped lazy
// engine loader, so a synchronous `container.querySelector(...)` right after
// `render()` can race the still-pending engine chunk -- same idiom as
// DropdownsBatch.contract.test.tsx's waitForPart helper.
// ---------------------------------------------------------------------------

const ENGINES = ['modern', 'rustic'] as const;

async function waitForPart(container: HTMLElement, part: string): Promise<Element> {
  await waitFor(() => {
    expect(container.querySelector(`[data-part="${part}"]`)).not.toBeNull();
  });
  return container.querySelector(`[data-part="${part}"]`) as Element;
}

/** Waits for a `data-part="panel"` to appear anywhere in `document` (portaled
 * panels render under `document.body`, outside the render container). */
async function waitForDocumentPanel(): Promise<HTMLElement> {
  await waitFor(() => {
    expect(document.querySelectorAll('[data-part="panel"]').length).toBeGreaterThan(0);
  });
  return document.querySelector('[data-part="panel"]') as HTMLElement;
}

const UPLOAD_FILES = [
  { uid: 'f-done', name: 'report.pdf', status: 'done' as const, percent: 100 },
  { uid: 'f-uploading', name: 'deck.pptx', status: 'uploading' as const, percent: 42 },
  { uid: 'f-error', name: 'budget.xlsx', status: 'error' as const, percent: 0 },
];

const TRANSFER_ITEMS = [
  { key: 'design', title: 'Design' },
  { key: 'engineering', title: 'Engineering' },
];

describe('Pickers-and-movers data-part contract (WO-SKIN-02 checkpoint C)', () => {
  describe('DatePicker', () => {
    it.each(ENGINES)(
      'closed: stamps root/trigger-input/calendar-icon; open: stamps panel/header/nav-button/grid/cell, portaled in both engines under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(<DatePicker onChange={vi.fn()} />, engine);

        const root = await waitForPart(container, 'root');
        expect(container.querySelectorAll('[data-part="trigger-input"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="calendar-icon"]')).toHaveLength(1);
        expect(document.querySelectorAll('[data-part="panel"]')).toHaveLength(0);

        const trigger = container.querySelector('[data-part="trigger-input"]') as HTMLElement;
        fireEvent.click(trigger);

        const panel = await waitForDocumentPanel();
        // DatePicker portals in both engines -- the panel is never a
        // descendant of the render container.
        expect(container.contains(panel)).toBe(false);
        expect(root.contains(panel)).toBe(false);
        expect(panel.getAttribute('data-mode')).toBe('date');
        expect(panel.querySelectorAll('[data-part="header"]')).toHaveLength(1);
        expect(panel.querySelectorAll('[data-part="nav-button"]').length).toBeGreaterThan(0);
        expect(panel.querySelectorAll('[data-part="grid"]')).toHaveLength(1);
        expect(panel.querySelectorAll('[data-part="cell"]').length).toBeGreaterThan(0);
      },
    );
  });

  describe('TimePicker', () => {
    it('closed: stamps root/trigger-input; open: stamps panel/time-column/time-option, portaled under modern', async () => {
      const { container } = renderWithEngine(<TimePicker onChange={vi.fn()} />, 'modern');

      const root = await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="trigger-input"]')).toHaveLength(1);
      expect(document.querySelectorAll('[data-part="panel"]')).toHaveLength(0);

      const trigger = container.querySelector('[data-part="trigger-input"]') as HTMLElement;
      fireEvent.click(trigger);

      const panel = await waitForDocumentPanel();
      expect(container.contains(panel)).toBe(false);
      expect(root.contains(panel)).toBe(false);
      // Unlike DatePicker's panel, TimePicker's carries no data-mode.
      expect(panel.hasAttribute('data-mode')).toBe(false);
      expect(panel.querySelectorAll('[data-part="time-column"]').length).toBeGreaterThan(0);
      expect(panel.querySelectorAll('[data-part="time-option"]').length).toBeGreaterThan(0);
    });

    it('rustic: stamps root/trigger-input on the native time input; no panel exists to open', async () => {
      const { container } = renderWithEngine(<TimePicker onChange={vi.fn()} />, 'rustic');

      await waitForPart(container, 'root');
      const trigger = container.querySelector('[data-part="trigger-input"]');
      expect(trigger).not.toBeNull();
      expect(trigger?.tagName).toBe('INPUT');
      expect((trigger as HTMLInputElement).type).toBe('time');
      // Rustic delegates to the UA's own time control -- there is no
      // isOpen/panel concept in this engine at all.
      expect(document.querySelectorAll('[data-part="panel"]')).toHaveLength(0);
    });
  });

  describe('Upload', () => {
    it.each(ENGINES)(
      'stamps root/file-list/file-item with data-status per file under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Upload fileList={UPLOAD_FILES} onChange={vi.fn()} />,
          engine,
        );

        await waitForPart(container, 'root');
        expect(container.querySelectorAll('[data-part="file-list"]')).toHaveLength(1);

        const items = container.querySelectorAll('[data-part="file-item"]');
        expect(items).toHaveLength(3);
        const statuses = Array.from(items).map((el) => el.getAttribute('data-status'));
        expect(statuses.sort()).toEqual(['done', 'error', 'uploading']);
      },
    );

    it.each(ENGINES)(
      'Dragger: stamps root/dropzone with data-state, flips to "dragging" on dragover under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Upload.Dragger fileList={UPLOAD_FILES} onChange={vi.fn()} />,
          engine,
        );

        await waitForPart(container, 'root');
        const dropzone = await waitForPart(container, 'dropzone');
        expect(dropzone.getAttribute('data-state')).toBe('idle');

        fireEvent.dragOver(dropzone);
        await waitFor(() => {
          expect(dropzone.getAttribute('data-state')).toBe('dragging');
        });

        fireEvent.dragLeave(dropzone);
        await waitFor(() => {
          expect(dropzone.getAttribute('data-state')).toBe('idle');
        });
      },
    );
  });

  describe('Transfer', () => {
    it.each(ENGINES)(
      'stamps root/panel(data-panel=source|target)/panel-list/panel-item/panel-item-checkbox/operations/move-button under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Transfer dataSource={TRANSFER_ITEMS} defaultTargetKeys={['engineering']} onChange={vi.fn()} />,
          engine,
        );

        await waitForPart(container, 'root');
        const panels = container.querySelectorAll('[data-part="panel"]');
        expect(panels).toHaveLength(2);
        const sides = Array.from(panels).map((el) => el.getAttribute('data-panel'));
        expect(sides.sort()).toEqual(['source', 'target']);

        expect(container.querySelectorAll('[data-part="panel-list"]')).toHaveLength(2);
        expect(container.querySelectorAll('[data-part="panel-item"]').length).toBeGreaterThan(0);
        expect(container.querySelectorAll('[data-part="panel-item-checkbox"]').length).toBeGreaterThan(0);
        expect(container.querySelectorAll('[data-part="operations"]')).toHaveLength(1);

        const moveButtons = container.querySelectorAll('[data-part="move-button"]');
        expect(moveButtons).toHaveLength(2);
        const directions = Array.from(moveButtons).map((el) => el.getAttribute('data-direction'));
        expect(directions.sort()).toEqual(['left', 'right']);
      },
    );
  });

  describe('ColorPicker', () => {
    it('modern: stamps root/trigger/swatch; open on trigger click: stamps dropdown in-tree', async () => {
      const { container } = renderWithEngine(<ColorPicker defaultValue="#1677ff" onChange={vi.fn()} />, 'modern');

      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="trigger"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="swatch"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="dropdown"]')).toHaveLength(0);

      const trigger = container.querySelector('[data-part="trigger"]') as HTMLElement;
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(container.querySelectorAll('[data-part="dropdown"]').length).toBeGreaterThan(0);
      });
      // Modern never portals its dropdown -- it stays in-tree.
      const dropdown = container.querySelector('[data-part="dropdown"]') as HTMLElement;
      expect(container.contains(dropdown)).toBe(true);
    });

    it('rustic: stamps the fused root (trigger+swatch); open on root click: stamps dropdown, portaled', async () => {
      const { container } = renderWithEngine(<ColorPicker defaultValue="#1677ff" onChange={vi.fn()} />, 'rustic');

      const root = await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="swatch"]')).toHaveLength(1);
      expect(document.querySelectorAll('[data-part="dropdown"]')).toHaveLength(0);

      fireEvent.click(root);

      await waitFor(() => {
        expect(document.querySelectorAll('[data-part="dropdown"]').length).toBeGreaterThan(0);
      });
      // Rustic portals its dropdown -- the documented cross-engine asymmetry
      // (decision 2 in the checkpoint contract): rustic portals, modern
      // stays in-tree. Nowhere else in this batch do the two engines
      // disagree on portal usage this way.
      const dropdown = document.querySelector('[data-part="dropdown"]') as HTMLElement;
      expect(container.contains(dropdown)).toBe(false);
    });
  });
});
