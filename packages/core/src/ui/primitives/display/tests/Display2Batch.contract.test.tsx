import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';

import { Tree, type TreeDataNode } from '../Tree';
import { Calendar } from '../Calendar';
import { List } from '../List';
import { Timeline } from '../Timeline';
import { Descriptions } from '../Descriptions';
import { Statistic, Countdown as StatisticCompoundCountdown } from '../Statistic';
import { Heading, Text, Paragraph, Link } from '../Typography';
import { Tooltip } from '../Tooltip';
import { Callout } from '../Callout';
import { renderWithEngine } from '../../../../tooling/testing/helpers/engine';

// ---------------------------------------------------------------------------
// WO-SKIN-05 checkpoint D2 -- the data-display family (Tree, Calendar, List,
// Timeline, Descriptions, Statistic, Typography, Tooltip, Callout) data-part
// contract evidence.
//
// The pre-step stamps `data-part` (plus data-tone/data-selected/data-expanded/
// data-disabled/data-focused/data-drop-target/data-drop-position/data-today/
// data-mode/data-active/data-trend/data-color/data-side/data-pending/
// data-placement/data-open/data-loading) onto all nine components and their
// live compounds without moving any paint. It does not assert paint (that is
// display2-batch.spec.ts's job).
//
// Calendar's cell `data-today` value depends on the wall clock (Calendar
// reads a real `new Date()` internally with no override prop), so this file
// only asserts the ATTRIBUTE reaches the DOM (`[data-today]`, presence,
// either value) rather than asserting which specific cell carries
// `data-today="true"` -- that would make the suite flake once the real date
// moves past the fixture's pinned month, the same trap the e2e spec avoids
// with `page.clock.setFixedTime`. `data-selected`/`data-disabled` are safe to
// assert on an exact value: both derive from the controlled `value`/
// `disabledDate` props, never from the wall clock.
//
// Every base component here renders through `createEngineComponent`'s
// Suspense-wrapped lazy engine loader, so a synchronous
// `container.querySelector(...)` right after `render()` can race the still-
// pending engine chunk -- same `waitForPart` idiom as Display1Batch/
// StatusBatch/NavigationBatch. Typography's four exports are the one
// exception (engine-selected synchronously via context, no lazy import) but
// `waitForPart` is harmless to reuse there too since it resolves immediately.
// ---------------------------------------------------------------------------

const ENGINES = ['modern', 'rustic'] as const;

async function waitForPart(container: HTMLElement, part: string): Promise<Element> {
  await waitFor(() => {
    expect(container.querySelector(`[data-part="${part}"]`)).not.toBeNull();
  });
  return container.querySelector(`[data-part="${part}"]`) as Element;
}

describe('Display2 (data display) data-part contract (WO-SKIN-05 checkpoint D2)', () => {
  describe('Tree', () => {
    const treeData: TreeDataNode[] = [
      {
        key: '1',
        title: 'Parent',
        children: [
          { key: '1-1', title: 'Selected child' },
          { key: '1-2', title: 'Disabled child', disabled: true },
        ],
      },
    ];

    it.each(ENGINES)(
      'stamps root/node/row(data-selected/data-expanded/data-disabled)/tree-node-toggle/checkbox/tree-node-label/connector under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Tree
            treeData={treeData}
            defaultExpandedKeys={['1']}
            defaultSelectedKeys={['1-1']}
            checkable
            showLine
            onSelect={vi.fn()}
            onExpand={vi.fn()}
            onCheck={vi.fn()}
          />,
          engine,
        );

        await waitForPart(container, 'root');
        expect(container.querySelectorAll('[data-part="node"]').length).toBeGreaterThan(0);
        expect(container.querySelector('[data-part="row"][data-selected="true"]')).not.toBeNull();
        expect(container.querySelector('[data-part="row"][data-expanded="true"]')).not.toBeNull();
        expect(container.querySelector('[data-part="row"][data-disabled]')).not.toBeNull();
        expect(container.querySelector('[data-part="tree-node-toggle"]')).not.toBeNull();
        expect(container.querySelector('[data-part="checkbox"]')).not.toBeNull();
        expect(container.querySelectorAll('[data-part="tree-node-label"]').length).toBeGreaterThan(0);
        expect(container.querySelectorAll('[data-part="connector"]').length).toBeGreaterThan(0);
      },
    );

    it.each(ENGINES)('search: stamps tree-node-highlight under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Tree
          treeData={treeData}
          defaultExpandedKeys={['1']}
          searchValue="Selected"
          filterTreeNode={(value, node) => typeof node.title === 'string' && node.title.includes(value)}
          onSelect={vi.fn()}
        />,
        engine,
      );

      await waitForPart(container, 'root');
      await waitFor(() => {
        expect(container.querySelector('[data-part="tree-node-highlight"]')).not.toBeNull();
      });
    });
  });

  describe('Calendar', () => {
    it.each(ENGINES)(
      'month view: stamps root(data-mode)/header/nav-button(data-direction)/mode-toggle(data-mode/data-active)/weekday-header/grid/cell(data-selected/data-today/data-disabled)/cell-content under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Calendar
            value={new Date(2026, 6, 8)}
            disabledDate={(date) => date.getDay() === 0}
            dateCellRender={() => <span>note</span>}
            onChange={vi.fn()}
          />,
          engine,
        );

        const root = await waitForPart(container, 'root');
        expect(root.getAttribute('data-mode')).toBe('month');
        expect(container.querySelector('[data-part="header"]')).not.toBeNull();
        expect(container.querySelector('[data-part="nav-button"][data-direction="prev-year"]')).not.toBeNull();
        expect(container.querySelector('[data-part="nav-button"][data-direction="prev-month"]')).not.toBeNull();
        expect(container.querySelector('[data-part="nav-button"][data-direction="next-month"]')).not.toBeNull();
        expect(container.querySelector('[data-part="nav-button"][data-direction="next-year"]')).not.toBeNull();
        expect(container.querySelector('[data-part="mode-toggle"][data-mode="month"][data-active="true"]')).not.toBeNull();
        expect(container.querySelector('[data-part="mode-toggle"][data-mode="year"][data-active="false"]')).not.toBeNull();
        expect(container.querySelectorAll('[data-part="weekday-header"]').length).toBe(7);
        expect(container.querySelector('[data-part="grid"]')).not.toBeNull();
        expect(container.querySelector('[data-part="cell"][data-selected="true"]')).not.toBeNull();
        expect(container.querySelector('[data-part="cell"][data-today]')).not.toBeNull();
        expect(container.querySelectorAll('[data-part="cell"][data-disabled]').length).toBeGreaterThan(0);
        expect(container.querySelector('[data-part="cell-content"]')).not.toBeNull();
      },
    );

    it.each(ENGINES)(
      'year view: stamps grid/cell(data-today attribute present)/cell-content under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Calendar mode="year" monthCellRender={() => <span>note</span>} />,
          engine,
        );

        await waitForPart(container, 'root');
        expect(container.querySelector('[data-part="grid"]')).not.toBeNull();
        expect(container.querySelector('[data-part="cell"][data-today]')).not.toBeNull();
        expect(container.querySelector('[data-part="cell-content"]')).not.toBeNull();
      },
    );
  });

  describe('List', () => {
    it.each(ENGINES)(
      'stamps root(data-loading=false)/header/list/divider/footer under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <List
            header="Header"
            footer="Footer"
            bordered
            split
            dataSource={['A', 'B']}
            renderItem={(item) => <List.Item key={String(item)}>{String(item)}</List.Item>}
          />,
          engine,
        );

        const root = await waitForPart(container, 'root');
        expect(root.getAttribute('data-loading')).toBe('false');
        expect(container.querySelector('[data-part="header"]')).not.toBeNull();
        expect(container.querySelector('[data-part="list"]')).not.toBeNull();
        expect(container.querySelector('[data-part="divider"]')).not.toBeNull();
        expect(container.querySelector('[data-part="footer"]')).not.toBeNull();
      },
    );

    it.each(ENGINES)(
      'loading: stamps root(data-loading=true)/skeleton-row/skeleton-avatar/skeleton-line under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(<List loading />, engine);
        const root = await waitForPart(container, 'root');
        expect(root.getAttribute('data-loading')).toBe('true');
        expect(container.querySelectorAll('[data-part="skeleton-row"]').length).toBeGreaterThan(0);
        expect(container.querySelector('[data-part="skeleton-avatar"]')).not.toBeNull();
        expect(container.querySelectorAll('[data-part="skeleton-line"]').length).toBeGreaterThan(0);
      },
    );

    describe('compounds', () => {
      it.each(ENGINES)(
        'List.Item stamps item/item-content/item-extra/item-actions/item-action under the %s engine',
        async (engine) => {
          const { container } = renderWithEngine(
            <List.Item extra={<span>Extra</span>} actions={[<button key="a" type="button">A</button>]}>
              Content
            </List.Item>,
            engine,
          );

          await waitForPart(container, 'item');
          expect(container.querySelector('[data-part="item-content"]')).not.toBeNull();
          expect(container.querySelector('[data-part="item-extra"]')).not.toBeNull();
          expect(container.querySelector('[data-part="item-actions"]')).not.toBeNull();
          expect(container.querySelector('[data-part="item-action"]')).not.toBeNull();
        },
      );

      it.each(ENGINES)(
        'List.Item.Meta stamps meta/meta-avatar/meta-content/meta-title/meta-description under the %s engine',
        async (engine) => {
          const { container } = renderWithEngine(
            <List.Item.Meta avatar={<span>A</span>} title="Title" description="Description" />,
            engine,
          );

          await waitForPart(container, 'meta');
          expect(container.querySelector('[data-part="meta-avatar"]')).not.toBeNull();
          expect(container.querySelector('[data-part="meta-content"]')).not.toBeNull();
          expect(container.querySelector('[data-part="meta-title"]')).not.toBeNull();
          expect(container.querySelector('[data-part="meta-description"]')).not.toBeNull();
        },
      );
    });
  });

  describe('Timeline', () => {
    it.each(ENGINES)(
      'stamps root/item(data-side/data-tone)/connector/label/body/dot under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Timeline mode="alternate">
            <Timeline.Item color="success" label="09:00">Order placed</Timeline.Item>
            <Timeline.Item color="error" label="09:30">Payment failed</Timeline.Item>
          </Timeline>,
          engine,
        );

        await waitForPart(container, 'root');
        expect(container.querySelector('[data-part="item"][data-side="start"][data-tone="success"]')).not.toBeNull();
        expect(container.querySelector('[data-part="item"][data-side="end"][data-tone="error"]')).not.toBeNull();
        expect(container.querySelectorAll('[data-part="connector"]').length).toBeGreaterThan(0);
        expect(container.querySelectorAll('[data-part="label"]').length).toBe(2);
        expect(container.querySelectorAll('[data-part="body"]').length).toBeGreaterThanOrEqual(2);
        expect(container.querySelectorAll('[data-part="dot"]').length).toBeGreaterThanOrEqual(2);
      },
    );

    it.each(ENGINES)(
      'pending: stamps item(data-pending)/dot(data-pending)/body under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Timeline pending="Loading...">
            <Timeline.Item color="primary">Done</Timeline.Item>
          </Timeline>,
          engine,
        );

        await waitForPart(container, 'root');
        expect(container.querySelector('[data-part="item"][data-pending="true"]')).not.toBeNull();
        expect(container.querySelector('[data-part="dot"][data-pending="true"]')).not.toBeNull();
        expect(container.querySelectorAll('[data-part="body"]').length).toBeGreaterThan(0);
      },
    );
  });

  describe('Descriptions', () => {
    it.each(ENGINES)(
      'horizontal: stamps root/header/title/extra/body/rows/row/label/content under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Descriptions title="Order" extra={<button type="button">Extra</button>} bordered column={2}>
            <Descriptions.Item label="Status">Shipped</Descriptions.Item>
            <Descriptions.Item label="Total" span={2}>$1</Descriptions.Item>
          </Descriptions>,
          engine,
        );

        await waitForPart(container, 'root');
        expect(container.querySelector('[data-part="header"]')).not.toBeNull();
        expect(container.querySelector('[data-part="title"]')).not.toBeNull();
        expect(container.querySelector('[data-part="extra"]')).not.toBeNull();
        expect(container.querySelector('[data-part="body"]')).not.toBeNull();
        expect(container.querySelector('[data-part="rows"]')).not.toBeNull();
        expect(container.querySelectorAll('[data-part="row"]').length).toBeGreaterThanOrEqual(2);
        expect(container.querySelectorAll('[data-part="label"]').length).toBeGreaterThanOrEqual(2);
        expect(container.querySelectorAll('[data-part="content"]').length).toBeGreaterThanOrEqual(2);
      },
    );

    it.each(ENGINES)('vertical: stamps rows/row under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Descriptions layout="vertical">
          <Descriptions.Item label="A">1</Descriptions.Item>
        </Descriptions>,
        engine,
      );

      await waitForPart(container, 'root');
      expect(container.querySelector('[data-part="rows"]')).not.toBeNull();
      expect(container.querySelector('[data-part="row"]')).not.toBeNull();
    });
  });

  describe('Statistic', () => {
    it.each(ENGINES)(
      'stamps root(data-loading=false)/title/value(data-trend)/prefix/suffix under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Statistic title="Revenue" value={128000} prefix="$" suffix="usd" valueType="positive" />,
          engine,
        );

        const root = await waitForPart(container, 'root');
        expect(root.getAttribute('data-loading')).toBe('false');
        const value = container.querySelector('[data-part="value"]');
        expect(value?.getAttribute('data-trend')).toBe('positive');
        expect(container.querySelector('[data-part="title"]')).not.toBeNull();
        expect(container.querySelector('[data-part="prefix"]')).not.toBeNull();
        expect(container.querySelector('[data-part="suffix"]')).not.toBeNull();
      },
    );

    it.each(ENGINES)(
      'loading: stamps root(data-loading=true)/skeleton-line under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(<Statistic value={0} loading />, engine);
        const root = await waitForPart(container, 'root');
        expect(root.getAttribute('data-loading')).toBe('true');
        expect(container.querySelectorAll('[data-part="skeleton-line"]').length).toBeGreaterThan(0);
      },
    );

    it.each(ENGINES)(
      'Statistic.Countdown stamps root/title/value(data-trend)/prefix/suffix under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Statistic.Countdown title="Ends" value={Date.now() + 60_000} valueType="warning" prefix="in" suffix="left" />,
          engine,
        );

        await waitForPart(container, 'root');
        const value = container.querySelector('[data-part="value"]');
        expect(value?.getAttribute('data-trend')).toBe('warning');
        expect(container.querySelector('[data-part="title"]')).not.toBeNull();
        expect(container.querySelector('[data-part="prefix"]')).not.toBeNull();
        expect(container.querySelector('[data-part="suffix"]')).not.toBeNull();
      },
    );

    describe('compounds', () => {
      it('compound Countdown (engine-agnostic, bare export) stamps root(data-loading)/title/value(data-trend)/prefix/suffix', () => {
        const { container } = render(
          <StatisticCompoundCountdown
            title="Ends"
            value={Date.now() + 60_000}
            valueType="warning"
            prefix="in"
            suffix="left"
          />,
        );

        const root = container.querySelector('[data-part="root"]');
        expect(root).not.toBeNull();
        expect(root?.getAttribute('data-loading')).toBe('false');
        const value = container.querySelector('[data-part="value"]');
        expect(value?.getAttribute('data-trend')).toBe('warning');
        expect(container.querySelector('[data-part="title"]')).not.toBeNull();
        expect(container.querySelector('[data-part="prefix"]')).not.toBeNull();
        expect(container.querySelector('[data-part="suffix"]')).not.toBeNull();
      });
    });
  });

  describe('Typography', () => {
    it.each(ENGINES)('Heading stamps root(data-color) under the %s engine', async (engine) => {
      const { container } = renderWithEngine(<Heading level="h2" color="primary">Title</Heading>, engine);
      const root = await waitForPart(container, 'root');
      expect(root.tagName.toLowerCase()).toBe('h2');
      expect(root.getAttribute('data-color')).toBe('primary');
    });

    it.each(ENGINES)('Text stamps root(data-color) under the %s engine', async (engine) => {
      const { container } = renderWithEngine(<Text color="muted">Body</Text>, engine);
      const root = await waitForPart(container, 'root');
      expect(root.getAttribute('data-color')).toBe('muted');
    });

    it.each(ENGINES)('Paragraph stamps root(data-color) under the %s engine', async (engine) => {
      const { container } = renderWithEngine(<Paragraph color="secondary">Body</Paragraph>, engine);
      const root = await waitForPart(container, 'root');
      expect(root.tagName.toLowerCase()).toBe('p');
      expect(root.getAttribute('data-color')).toBe('secondary');
    });

    it.each(ENGINES)('Link stamps root(data-color/data-disabled) under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Link href="/x" color="primary" disabled>Go</Link>,
        engine,
      );
      const root = await waitForPart(container, 'root');
      expect(root.tagName.toLowerCase()).toBe('a');
      expect(root.getAttribute('data-color')).toBe('primary');
      expect(root.hasAttribute('data-disabled')).toBe(true);
    });
  });

  describe('Tooltip', () => {
    it.each(ENGINES)('stamps root under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Tooltip content="Tip" placement="bottom">
          <button type="button">Trigger</button>
        </Tooltip>,
        engine,
      );
      await waitForPart(container, 'root');
    });

    it.each(ENGINES)(
      'open: stamps bubble(data-placement/data-open)/shortcut-row/shortcut-chips/shortcut-key under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Tooltip content="Tip" placement="bottom" visible shortcut="ctrl+k">
            <button type="button">Trigger</button>
          </Tooltip>,
          engine,
        );
        await waitForPart(container, 'root');

        // Modern portals the bubble to document.body; rustic renders it
        // in-tree. document.body.querySelector reaches both without an
        // engine branch since the RTL container is itself inside document.body.
        await waitFor(() => {
          expect(document.body.querySelector('[data-part="bubble"]')).not.toBeNull();
        });
        const bubble = document.body.querySelector('[data-part="bubble"]') as Element;
        expect(bubble.getAttribute('data-placement')).toBe('bottom');
        expect(bubble.getAttribute('data-open')).toBe('true');
        expect(document.body.querySelector('[data-part="shortcut-row"]')).not.toBeNull();
        expect(document.body.querySelector('[data-part="shortcut-chips"]')).not.toBeNull();
        expect(document.body.querySelectorAll('[data-part="shortcut-key"]').length).toBeGreaterThan(0);
      },
    );
  });

  describe('Callout', () => {
    it.each(ENGINES)(
      'stamps root(data-tone)/icon/body/title/description/action/close-button under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Callout
            tone="danger"
            title="Heads up"
            closable
            onClose={vi.fn()}
            action={<button type="button">Retry</button>}
          >
            Something failed.
          </Callout>,
          engine,
        );

        const root = await waitForPart(container, 'root');
        expect(root.getAttribute('data-tone')).toBe('error');
        expect(container.querySelector('[data-part="icon"]')).not.toBeNull();
        expect(container.querySelector('[data-part="body"]')).not.toBeNull();
        expect(container.querySelector('[data-part="title"]')).not.toBeNull();
        expect(container.querySelector('[data-part="description"]')).not.toBeNull();
        expect(container.querySelector('[data-part="action"]')).not.toBeNull();
        expect(container.querySelector('[data-part="close-button"]')).not.toBeNull();
      },
    );
  });
});
