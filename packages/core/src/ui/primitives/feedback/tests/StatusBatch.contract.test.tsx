import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';

import { Alert } from '../Alert';
import { Progress } from '../Progress';
import { Skeleton } from '../Skeleton';
import { Spinner } from '../Spinner';
import { Rate } from '../Rate';
import { renderWithEngine } from '../../../../tooling/testing/helpers/engine';

// ---------------------------------------------------------------------------
// WO-SKIN-03 checkpoint S -- the status family (Skeleton, Alert, Progress,
// Spinner, Rate) data-part contract evidence.
//
// The pre-step stamps `data-part` (plus data-tone/data-status/data-state/
// data-active) onto all five components without moving any paint. This file
// proves the stamp reached the DOM for each component under every engine it
// supports, mirroring PickersBatch.contract.test.tsx's structure. It does
// not assert paint (that is status-batch.spec.ts's job).
//
// Every base component (Alert, Progress, Skeleton, Spinner, Rate) renders
// through `createEngineComponent`'s Suspense-wrapped lazy engine loader, so a
// synchronous `container.querySelector(...)` right after `render()` can race
// the still-pending engine chunk -- same `waitForPart` idiom as
// PickersBatch.contract.test.tsx. The compound sub-components (Skeleton.*,
// Progress.Line/.Circle) are plain synchronous components, not
// engine-switched, but the same helper is reused for consistency.
// ---------------------------------------------------------------------------

const ENGINES = ['modern', 'rustic'] as const;

async function waitForPart(container: HTMLElement, part: string): Promise<Element> {
  await waitFor(() => {
    expect(container.querySelector(`[data-part="${part}"]`)).not.toBeNull();
  });
  return container.querySelector(`[data-part="${part}"]`) as Element;
}

describe('Status-family data-part contract (WO-SKIN-03 checkpoint S)', () => {
  describe('Alert', () => {
    it.each(ENGINES)(
      'stamps root(data-tone)/icon/label/description/action when all optional parts are present under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Alert type="warning" message="Heads up" description="Details" showIcon closable onClose={vi.fn()} />,
          engine,
        );

        const root = await waitForPart(container, 'root');
        expect(root.getAttribute('data-tone')).toBe('warning');
        expect(container.querySelectorAll('[data-part="icon"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="label"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="description"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="action"]')).toHaveLength(1);
      },
    );

    it.each(ENGINES)(
      'omits description/action/icon parts that the JSX branches skip under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(<Alert type="info" message="Simple" showIcon={false} />, engine);

        await waitForPart(container, 'root');
        expect(container.querySelectorAll('[data-part="icon"]')).toHaveLength(0);
        expect(container.querySelectorAll('[data-part="description"]')).toHaveLength(0);
        expect(container.querySelectorAll('[data-part="action"]')).toHaveLength(0);
      },
    );
  });

  describe('Progress', () => {
    it.each(ENGINES)('line: stamps root(data-status)/fill/label under the %s engine', async (engine) => {
      const { container } = renderWithEngine(<Progress percent={42} type="line" status="success" />, engine);

      const root = await waitForPart(container, 'root');
      expect(root.getAttribute('data-status')).toBe('success');
      expect(container.querySelectorAll('[data-part="fill"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="label"]')).toHaveLength(1);
      // Rustic's line renders separate track+bar divs; modern's native
      // <progress> element fuses track+fill into one node (no track part).
      if (engine === 'rustic') {
        expect(container.querySelectorAll('[data-part="track"]')).toHaveLength(1);
      } else {
        expect(container.querySelectorAll('[data-part="track"]')).toHaveLength(0);
      }
    });

    it.each(ENGINES)('circle: stamps root(data-status) under the %s engine', async (engine) => {
      const { container } = renderWithEngine(<Progress percent={60} type="circle" status="error" />, engine);

      const root = await waitForPart(container, 'root');
      expect(root.getAttribute('data-status')).toBe('error');
      // Rustic's circle renders two <circle> nodes (track+fill); modern's
      // DaisyUI radial-progress is a single conic-gradient div (root only).
      if (engine === 'rustic') {
        expect(container.querySelectorAll('[data-part="track"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="fill"]')).toHaveLength(1);
      } else {
        expect(container.querySelectorAll('[data-part="track"]')).toHaveLength(0);
        expect(container.querySelectorAll('[data-part="fill"]')).toHaveLength(0);
      }
    });

    it('Progress.Line compound: stamps root/track/fill/label with no data-status (compound has no status prop)', async () => {
      const { container } = renderWithEngine(<Progress.Line percent={30} />, 'modern');

      const root = await waitForPart(container, 'root');
      expect(root.hasAttribute('data-status')).toBe(false);
      expect(container.querySelectorAll('[data-part="track"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="fill"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="label"]')).toHaveLength(1);
    });

    it('Progress.Circle compound: stamps root/track/fill/label', async () => {
      const { container } = renderWithEngine(<Progress.Circle percent={30} />, 'modern');

      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="track"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="fill"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="label"]')).toHaveLength(1);
    });
  });

  describe('Spinner', () => {
    it.each(ENGINES)('stamps root/indicator/label under the %s engine', async (engine) => {
      const { container } = renderWithEngine(<Spinner label="Loading" />, engine);

      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="indicator"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="label"]')).toHaveLength(1);
    });

    it.each(ENGINES)('omits the label part when no label is provided under the %s engine', async (engine) => {
      const { container } = renderWithEngine(<Spinner />, engine);

      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="indicator"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="label"]')).toHaveLength(0);
    });
  });

  describe('Rate', () => {
    it.each(ENGINES)(
      'stamps root + one data-part="star" per star with data-state full/half/empty under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Rate defaultValue={2.5} allowHalf count={5} onChange={vi.fn()} />,
          engine,
        );

        await waitForPart(container, 'root');
        const stars = container.querySelectorAll('[data-part="star"]');
        expect(stars).toHaveLength(5);
        const states = Array.from(stars).map((el) => el.getAttribute('data-state'));
        expect(states).toEqual(['full', 'full', 'half', 'empty', 'empty']);
      },
    );
  });

  describe('Skeleton', () => {
    it.each(ENGINES)('shape-variant branch: stamps root under the %s engine', async (engine) => {
      const { container } = renderWithEngine(<Skeleton variant="circular" width={40} height={40} />, engine);

      await waitForPart(container, 'root');
    });

    it.each(ENGINES)(
      'text/default-variant branch: stamps root/avatar/title/line under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Skeleton avatar title paragraph={{ rows: 3 }} />,
          engine,
        );

        const root = await waitForPart(container, 'root');
        // Only rustic's engine reads the `active` prop (modern has no
        // active/animation branch at all -- it relies on DaisyUI's class).
        if (engine === 'rustic') {
          expect(root.getAttribute('data-active')).toBe('true');
        } else {
          expect(root.hasAttribute('data-active')).toBe(false);
        }
        expect(container.querySelectorAll('[data-part="avatar"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="title"]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-part="line"]')).toHaveLength(3);
      },
    );

    it('Avatar compound: stamps root', async () => {
      const { container } = renderWithEngine(<Skeleton.Avatar />, 'modern');
      await waitForPart(container, 'root');
    });

    it('Button compound: stamps root', async () => {
      const { container } = renderWithEngine(<Skeleton.Button />, 'modern');
      await waitForPart(container, 'root');
    });

    it('Text compound: stamps root + one line per configured line', async () => {
      const { container } = renderWithEngine(<Skeleton.Text lines={4} />, 'modern');
      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="line"]')).toHaveLength(4);
    });

    it('Paragraph compound: stamps root + one line per configured line', async () => {
      const { container } = renderWithEngine(<Skeleton.Paragraph lines={4} />, 'modern');
      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="line"]')).toHaveLength(4);
    });

    it('Card compound: stamps root/image/title/line', async () => {
      const { container } = renderWithEngine(<Skeleton.Card hasImage lines={3} />, 'modern');
      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="image"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="title"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="line"]')).toHaveLength(3);
    });

    it('Card compound: omits the image part when hasImage is false', async () => {
      const { container } = renderWithEngine(<Skeleton.Card lines={2} />, 'modern');
      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="image"]')).toHaveLength(0);
    });

    it('ListItem compound: stamps root/avatar/line', async () => {
      const { container } = renderWithEngine(<Skeleton.ListItem hasAvatar lines={3} />, 'modern');
      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="avatar"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="line"]')).toHaveLength(3);
    });

    it('Form compound: stamps root/field/label/input/action', async () => {
      const { container } = renderWithEngine(<Skeleton.Form fields={3} />, 'modern');
      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="field"]')).toHaveLength(3);
      expect(container.querySelectorAll('[data-part="label"]')).toHaveLength(3);
      expect(container.querySelectorAll('[data-part="input"]')).toHaveLength(3);
      expect(container.querySelectorAll('[data-part="action"]')).toHaveLength(1);
    });

    it('Table compound: stamps root/row(data-row=header|body)/cell', async () => {
      const { container } = renderWithEngine(<Skeleton.Table rows={3} columns={4} />, 'modern');
      await waitForPart(container, 'root');

      const rows = container.querySelectorAll('[data-part="row"]');
      expect(rows).toHaveLength(4); // 1 header row + 3 body rows

      const headerRows = container.querySelectorAll('[data-part="row"][data-row="header"]');
      expect(headerRows).toHaveLength(1);

      const bodyRows = container.querySelectorAll('[data-part="row"][data-row="body"]');
      expect(bodyRows).toHaveLength(3);

      // (1 header row + 3 body rows) * 4 columns
      expect(container.querySelectorAll('[data-part="cell"]')).toHaveLength(16);
    });
  });
});
