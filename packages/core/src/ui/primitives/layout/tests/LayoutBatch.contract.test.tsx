import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { waitFor, fireEvent } from '@testing-library/react';

import { Box } from '../Box';
import { Layout } from '../Layout';
import { Collapse } from '../Collapse';
import { Divider } from '../Divider';
import { Splitter } from '../Splitter';
import { renderWithEngine } from '../../../../tooling/testing/helpers/engine';

// ---------------------------------------------------------------------------
// WO-SKIN-05 checkpoint L -- the layout family (Box, Layout, Collapse,
// Divider, Splitter) data-part contract evidence.
//
// The pre-step stamps `data-part` (plus data-has-sider/data-theme/
// data-collapsed/data-expanded/data-disabled/data-orientation/data-with-text/
// data-dragging) onto all five components without moving any paint. Box is
// the one exception to a hardcoded stamp: it is reused as OTHER components'
// own anatomy node (including structure-tier ActionDock, BottomTabBar, and
// MobileHeader internals) via an explicit `data-part` prop, so its
// default of 'root' only applies when no caller-supplied part is present --
// covered explicitly below, since a naive unconditional stamp would have
// silently overwritten every one of those already-shipped contracts. This
// file proves the stamp reached the DOM for each component under every
// engine it supports, mirroring NavigationBatch.contract.test.tsx's
// structure. It does not assert paint (that is layout-batch.spec.ts's job).
//
// Every base component here renders through `createEngineComponent`'s
// Suspense-wrapped lazy engine loader, so a synchronous
// `container.querySelector(...)` right after `render()` can race the still-
// pending engine chunk -- same `waitForPart` idiom as
// NavigationBatch/StatusBatch/PickersBatch.
// ---------------------------------------------------------------------------

const ENGINES = ['modern', 'rustic'] as const;

async function waitForPart(container: HTMLElement, part: string): Promise<Element> {
  await waitFor(() => {
    expect(container.querySelector(`[data-part="${part}"]`)).not.toBeNull();
  });
  return container.querySelector(`[data-part="${part}"]`) as Element;
}

describe('Layout-family data-part contract (WO-SKIN-05 checkpoint L)', () => {
  describe('Box', () => {
    // Box stamps NO part of its own. It is the escape hatch every other component
    // composes with, so a default part would put `data-part="root"` on every nested
    // Box in the fleet: a skin rule of the form `.rottay-x [data-part='root']` would
    // reach into X's Boxes, and any query for X's own root would match them too.
    it.each(ENGINES)('stamps no data-part of its own under the %s engine', async (engine) => {
      const { container } = renderWithEngine(<Box data-testid="bare-box">content</Box>, engine);
      await waitFor(() => {
        expect(container.querySelector('[data-testid="bare-box"]')).not.toBeNull();
      });
      expect(container.querySelector('[data-part]')).toBeNull();
    });

    it.each(ENGINES)(
      'passes a caller-supplied data-part through under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(<Box data-part="icon">content</Box>, engine);
        await waitFor(() => {
          expect(container.querySelector('[data-part="icon"]')).not.toBeNull();
        });
        expect(container.querySelector('[data-part="root"]')).toBeNull();
      },
    );
  });

  describe('Layout', () => {
    it.each(ENGINES)('root: stamps data-has-sider under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Layout hasSider>
          <div>content</div>
        </Layout>,
        engine,
      );
      const root = await waitForPart(container, 'root');
      expect(root.getAttribute('data-has-sider')).toBe('true');
    });

    it.each(ENGINES)('root: data-has-sider is false without the hasSider prop under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Layout>
          <div>content</div>
        </Layout>,
        engine,
      );
      const root = await waitForPart(container, 'root');
      expect(root.getAttribute('data-has-sider')).toBe('false');
    });

    it.each(ENGINES)('stamps header/content/footer under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Layout>
          <Layout.Header>Header</Layout.Header>
          <Layout.Content>Content</Layout.Content>
          <Layout.Footer>Footer</Layout.Footer>
        </Layout>,
        engine,
      );
      await waitForPart(container, 'root');
      expect(container.querySelector('[data-part="header"]')).not.toBeNull();
      expect(container.querySelector('[data-part="content"]')).not.toBeNull();
      expect(container.querySelector('[data-part="footer"]')).not.toBeNull();
    });

    it.each(ENGINES)(
      'Sider: stamps sider(data-theme/data-collapsed) + trigger(data-collapsed) under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Layout.Sider theme="dark" collapsible collapsed onCollapse={vi.fn()}>
            <div>nav</div>
          </Layout.Sider>,
          engine,
        );
        const sider = await waitForPart(container, 'sider');
        expect(sider.getAttribute('data-theme')).toBe('dark');
        expect(sider.getAttribute('data-collapsed')).toBe('true');
        const trigger = container.querySelector('[data-part="trigger"]');
        expect(trigger).not.toBeNull();
        expect(trigger?.getAttribute('data-collapsed')).toBe('true');
      },
    );

    it.each(ENGINES)('Sider: data-collapsed reflects the expanded state under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Layout.Sider collapsible collapsed={false} onCollapse={vi.fn()}>
          <div>nav</div>
        </Layout.Sider>,
        engine,
      );
      const sider = await waitForPart(container, 'sider');
      expect(sider.getAttribute('data-collapsed')).toBe('false');
    });
  });

  describe('Collapse', () => {
    it.each(ENGINES)(
      'stamps root/panel(data-expanded/data-disabled)/header(data-expanded)/arrow/label/content/content-inner under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Collapse defaultActiveKey={['open']}>
            <Collapse.Panel header="Open" panelKey="open">
              Open content
            </Collapse.Panel>
            <Collapse.Panel header="Closed" panelKey="closed">
              Closed content
            </Collapse.Panel>
            <Collapse.Panel header="Disabled" panelKey="disabled" disabled>
              Disabled content
            </Collapse.Panel>
          </Collapse>,
          engine,
        );

        await waitForPart(container, 'root');
        expect(container.querySelector('[data-part="panel"][data-expanded="true"]')).not.toBeNull();
        expect(container.querySelector('[data-part="panel"][data-expanded="false"]')).not.toBeNull();
        expect(container.querySelector('[data-part="panel"][data-disabled="true"]')).not.toBeNull();
        expect(container.querySelector('[data-part="header"][data-expanded="true"]')).not.toBeNull();
        expect(container.querySelectorAll('[data-part="arrow"]').length).toBeGreaterThan(0);
        expect(container.querySelector('[data-part="label"]')).not.toBeNull();
        expect(container.querySelector('[data-part="content"][data-expanded="true"]')).not.toBeNull();
        expect(container.querySelector('[data-part="content-inner"][data-expanded="true"]')).not.toBeNull();
      },
    );

    it.each(ENGINES)('toggling a panel flips data-expanded on panel/header/content under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Collapse>
          <Collapse.Panel header="Only" panelKey="only">
            Content
          </Collapse.Panel>
        </Collapse>,
        engine,
      );
      const header = await waitForPart(container, 'header');
      expect(header.getAttribute('data-expanded')).toBe('false');

      fireEvent.click(header);

      await waitFor(() => {
        expect(container.querySelector('[data-part="header"]')?.getAttribute('data-expanded')).toBe('true');
      });
      expect(container.querySelector('[data-part="panel"]')?.getAttribute('data-expanded')).toBe('true');
      expect(container.querySelector('[data-part="content"]')?.getAttribute('data-expanded')).toBe('true');
    });
  });

  describe('Divider', () => {
    it.each(ENGINES)('plain horizontal: stamps root(data-orientation/data-with-text) under the %s engine', async (engine) => {
      const { container } = renderWithEngine(<Divider />, engine);
      const root = await waitForPart(container, 'root');
      expect(root.getAttribute('data-orientation')).toBe('horizontal');
      expect(root.getAttribute('data-with-text')).toBe('false');
    });

    it.each(ENGINES)(
      'with-text horizontal: stamps root(data-orientation/data-with-text)/text/line-before/line-after under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(<Divider orientation="horizontal">Tag</Divider>, engine);
        const root = await waitForPart(container, 'root');
        expect(root.getAttribute('data-orientation')).toBe('horizontal');
        expect(root.getAttribute('data-with-text')).toBe('true');
        expect(container.querySelector('[data-part="text"]')).not.toBeNull();
        expect(container.querySelector('[data-part="line-before"]')).not.toBeNull();
        expect(container.querySelector('[data-part="line-after"]')).not.toBeNull();
      },
    );

    // Pre-existing component behavior, not introduced by this pre-step:
    // `hasChildren = !!children && isHorizontal` -- a vertical divider drops
    // inline text unconditionally, so it always takes the plain-line render
    // path regardless of whether children were passed. data-with-text
    // reflects that real rendering decision, not the caller's intent.
    it.each(ENGINES)('vertical: data-with-text stays "false" even when children are passed under the %s engine', async (engine) => {
      const { container } = renderWithEngine(<Divider orientation="vertical">Tag</Divider>, engine);
      const root = await waitForPart(container, 'root');
      expect(root.getAttribute('data-orientation')).toBe('vertical');
      expect(root.getAttribute('data-with-text')).toBe('false');
      expect(container.querySelector('[data-part="text"]')).toBeNull();
    });
  });

  describe('Splitter', () => {
    it.each(ENGINES)(
      'horizontal: stamps root(data-orientation)/panel/gutter(data-orientation/data-dragging) under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Splitter layout="horizontal">
            <Splitter.Panel>A</Splitter.Panel>
            <Splitter.Panel>B</Splitter.Panel>
          </Splitter>,
          engine,
        );
        const root = await waitForPart(container, 'root');
        expect(root.getAttribute('data-orientation')).toBe('horizontal');
        expect(container.querySelectorAll('[data-part="panel"]').length).toBe(2);
        const gutter = container.querySelector('[data-part="gutter"]');
        expect(gutter).not.toBeNull();
        expect(gutter?.getAttribute('data-orientation')).toBe('horizontal');
        expect(gutter?.getAttribute('data-dragging')).toBe('false');
      },
    );

    it.each(ENGINES)('vertical: root/gutter report data-orientation="vertical" under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Splitter layout="vertical">
          <Splitter.Panel>A</Splitter.Panel>
          <Splitter.Panel>B</Splitter.Panel>
        </Splitter>,
        engine,
      );
      const root = await waitForPart(container, 'root');
      expect(root.getAttribute('data-orientation')).toBe('vertical');
      expect(container.querySelector('[data-part="gutter"]')?.getAttribute('data-orientation')).toBe('vertical');
    });

    it.each(ENGINES)('mousedown on the gutter sets data-dragging="true" until mouseup under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Splitter layout="horizontal">
          <Splitter.Panel>A</Splitter.Panel>
          <Splitter.Panel>B</Splitter.Panel>
        </Splitter>,
        engine,
      );
      await waitForPart(container, 'root');
      const gutter = container.querySelector('[data-part="gutter"]') as HTMLElement;

      fireEvent.mouseDown(gutter);
      await waitFor(() => {
        expect(container.querySelector('[data-part="gutter"]')?.getAttribute('data-dragging')).toBe('true');
      });

      fireEvent.mouseUp(document);
      await waitFor(() => {
        expect(container.querySelector('[data-part="gutter"]')?.getAttribute('data-dragging')).toBe('false');
      });
    });
  });
});
