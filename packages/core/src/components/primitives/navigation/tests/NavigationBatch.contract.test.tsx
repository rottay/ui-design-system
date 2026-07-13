import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';

import { Menu } from '../Menu';
import { FloatButton } from '../FloatButton';
import { Tabs } from '../Tabs';
import { Steps } from '../Steps';
import { Stepper } from '../Stepper';
import { Pagination } from '../Pagination';
import { Segmented } from '../Segmented';
import { BackTop } from '../BackTop';
import { Breadcrumb, BreadcrumbItem } from '../Breadcrumb';
import { BottomTabBar } from '../BottomTabBar';
import { Anchor } from '../Anchor';
import { MobileHeader } from '../MobileHeader';
import { ActionDock } from '../ActionDock';
import { Affix } from '../Affix';
import { Link } from '../Link';
import { renderWithEngine } from '../../../../_internal/testing/helpers/engine-test-utils';

// ---------------------------------------------------------------------------
// WO-SKIN-04 checkpoint N -- the navigation family (Menu, FloatButton, Tabs,
// Steps, Stepper, Pagination, Segmented, BackTop, Breadcrumb, BottomTabBar,
// Anchor, MobileHeader, ActionDock, Affix, Link) data-part contract evidence.
//
// The pre-step stamps `data-part` (plus data-status/data-selected/data-active/
// data-disabled/data-open/data-current/data-placement/data-variant/data-shape/
// data-tone/data-direction/data-sticky/data-state) onto all fifteen components
// and their compounds without moving any paint -- per P-73/N1, Steps and
// Stepper's DaisyUI pseudo-element mechanism is untouched; per N2, FloatButton's
// `btn` class list is untouched. This file proves the stamp reached the DOM for
// each component under every engine it supports, mirroring
// StatusBatch.contract.test.tsx's structure. It does not assert paint (that is
// navigation-batch.spec.ts's job).
//
// Every base component here renders through `createEngineComponent`'s
// Suspense-wrapped lazy engine loader, so a synchronous
// `container.querySelector(...)` right after `render()` can race the still-
// pending engine chunk -- same `waitForPart` idiom as StatusBatch/PickersBatch.
// ---------------------------------------------------------------------------

const ENGINES = ['modern', 'rustic'] as const;

async function waitForPart(container: HTMLElement, part: string): Promise<Element> {
  await waitFor(() => {
    expect(container.querySelector(`[data-part="${part}"]`)).not.toBeNull();
  });
  return container.querySelector(`[data-part="${part}"]`) as Element;
}

describe('Navigation-family data-part contract (WO-SKIN-04 checkpoint N)', () => {
  describe('Menu', () => {
    const items = [
      { key: 'a', label: 'A', icon: <span>icon</span> },
      { key: 'b', label: 'B', disabled: true },
      { key: 'c', label: 'C', danger: true },
      { key: 'divider', type: 'divider' as const },
      {
        key: 'group',
        type: 'group' as const,
        label: 'Group',
        children: [{ key: 'g1', label: 'G1' }],
      },
      { key: 'sub', label: 'Sub', children: [{ key: 'sub-child', label: 'Sub child' }] },
    ];

    it.each(ENGINES)(
      'stamps root/item(data-selected/data-disabled/data-tone)/icon/label/divider/group/group-label/trigger(data-open) under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Menu items={items} selectedKeys={['a']} defaultOpenKeys={['sub']} onSelect={vi.fn()} />,
          engine,
        );

        await waitForPart(container, 'root');
        expect(container.querySelector('[data-part="item"][data-selected="true"]')).not.toBeNull();
        expect(container.querySelector('[data-part="item"][data-disabled="true"]')).not.toBeNull();
        expect(container.querySelector('[data-part="item"][data-tone="danger"]')).not.toBeNull();
        expect(container.querySelectorAll('[data-part="icon"]').length).toBeGreaterThan(0);
        expect(container.querySelector('[data-part="label"]')).not.toBeNull();
        expect(container.querySelector('[data-part="divider"]')).not.toBeNull();
        expect(container.querySelector('[data-part="group"]')).not.toBeNull();
        expect(container.querySelector('[data-part="group-label"]')).not.toBeNull();
        expect(container.querySelector('[data-part="trigger"][data-open="true"]')).not.toBeNull();
      },
    );

    it('compound form: stamps item/icon/label/divider/group/group-label/trigger via Menu.Item/SubMenu/Divider/Group', async () => {
      const { container } = renderWithEngine(
        <Menu selectedKeys={['selected']} onSelect={vi.fn()}>
          <Menu.Item itemKey="selected" icon={<span>i</span>}>Selected</Menu.Item>
          <Menu.Item itemKey="disabled" disabled>Disabled</Menu.Item>
          <Menu.Item itemKey="danger" danger>Danger</Menu.Item>
          <Menu.Divider />
          <Menu.SubMenu itemKey="sub" title="Sub">
            <Menu.Item itemKey="sub-child">Sub child</Menu.Item>
          </Menu.SubMenu>
          <Menu.Group title="Group">
            <Menu.Item itemKey="group-child">Group child</Menu.Item>
          </Menu.Group>
        </Menu>,
        'modern',
      );

      await waitFor(() => {
        expect(container.querySelector('[data-part="item"]')).not.toBeNull();
      });
      expect(container.querySelector('[data-part="divider"]')).not.toBeNull();
      expect(container.querySelector('[data-part="group"]')).not.toBeNull();
      expect(container.querySelector('[data-part="group-label"]')).not.toBeNull();
      expect(container.querySelector('[data-part="trigger"]')).not.toBeNull();
    });
  });

  describe('FloatButton', () => {
    it.each(ENGINES)(
      'stamps trigger(data-variant/data-shape)/badge under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <FloatButton icon={<span>i</span>} type="primary" shape="circle" badge={{ count: 3 }} />,
          engine,
        );

        const trigger = await waitForPart(container, 'trigger');
        expect(trigger.getAttribute('data-variant')).toBe('primary');
        expect(trigger.getAttribute('data-shape')).toBe('circle');
        expect(container.querySelector('[data-part="badge"]')).not.toBeNull();
      },
    );

    it.each(ENGINES)('Group: stamps root(data-open)/trigger/panel(data-open) under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <FloatButton.Group open trigger="click" icon={<span>i</span>} onOpenChange={vi.fn()}>
          <FloatButton icon={<span>i</span>} />
        </FloatButton.Group>,
        engine,
      );

      const root = await waitForPart(container, 'root');
      expect(root.getAttribute('data-open')).toBe('true');
      expect(container.querySelector('[data-part="panel"][data-open="true"]')).not.toBeNull();
      expect(container.querySelectorAll('[data-part="trigger"]').length).toBeGreaterThan(0);
    });

    it.each(ENGINES)('BackTop: stamps trigger under the %s engine', async (engine) => {
      const { container } = renderWithEngine(<FloatButton.BackTop visibilityHeight={0} />, engine);
      await waitForPart(container, 'trigger');
    });
  });

  describe('Tabs', () => {
    const items = [
      { key: 't1', label: 'One', children: <div>One content</div> },
      { key: 't2', label: 'Two', disabled: true, children: <div>Two content</div> },
    ];

    it.each(ENGINES)(
      'stamps root/tab-list/tab-button(data-selected/data-disabled)/tab-panel under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Tabs items={items} activeKey="t1" type="line" onChange={vi.fn()} />,
          engine,
        );

        await waitForPart(container, 'root');
        expect(container.querySelector('[data-part="tab-list"]')).not.toBeNull();
        expect(container.querySelector('[data-part="tab-button"][data-selected="true"]')).not.toBeNull();
        expect(container.querySelector('[data-part="tab-button"][data-disabled="true"]')).not.toBeNull();
        expect(container.querySelector('[data-part="tab-panel"]')).not.toBeNull();
      },
    );

    it('modern: stamps indicator for line type', async () => {
      const { container } = renderWithEngine(
        <Tabs items={items} activeKey="t1" type="line" onChange={vi.fn()} />,
        'modern',
      );
      await waitForPart(container, 'root');
      await waitFor(() => {
        expect(container.querySelector('[data-part="indicator"]')).not.toBeNull();
      });
    });
  });

  describe('Steps', () => {
    const items = [
      { title: 'Finished', status: 'finish' as const },
      { title: 'In progress', status: 'process' as const },
      { title: 'Error', status: 'error' as const },
      { title: 'Waiting', status: 'wait' as const },
    ];

    it.each(ENGINES)(
      'stamps root/item(data-status) for every status under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(<Steps items={items} current={1} />, engine);

        await waitForPart(container, 'root');
        expect(container.querySelector('[data-part="item"][data-status="finish"]')).not.toBeNull();
        expect(container.querySelector('[data-part="item"][data-status="process"]')).not.toBeNull();
        expect(container.querySelector('[data-part="item"][data-status="error"]')).not.toBeNull();
        expect(container.querySelector('[data-part="item"][data-status="wait"]')).not.toBeNull();
        expect(container.querySelector('[data-part="label"]')).not.toBeNull();
      },
    );

    it('rustic: stamps icon/connector', async () => {
      const { container } = renderWithEngine(<Steps items={items} current={1} />, 'rustic');
      await waitForPart(container, 'root');
      expect(container.querySelector('[data-part="icon"]')).not.toBeNull();
      expect(container.querySelector('[data-part="connector"]')).not.toBeNull();
    });
  });

  describe('Stepper', () => {
    const items = [
      { title: 'Finished', status: 'finish' as const },
      { title: 'In progress', status: 'process' as const },
      { title: 'Error', status: 'error' as const },
    ];

    it.each(ENGINES)('items form: stamps root/item(data-status) under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Stepper items={items} current={1} clickable onChange={vi.fn()} />,
        engine,
      );

      await waitForPart(container, 'root');
      expect(container.querySelector('[data-part="item"][data-status="finish"]')).not.toBeNull();
      expect(container.querySelector('[data-part="item"][data-status="process"]')).not.toBeNull();
      expect(container.querySelector('[data-part="item"][data-status="error"]')).not.toBeNull();
    });

    // NOTE: `Stepper.Step`/`Stepper.Content` are plain (non-engine-switched)
    // components, but composing them as children of `<Stepper>` does NOT
    // render them directly -- both root engines convert `Stepper.Step`
    // children into a plain items array (`Children.forEach` extracting
    // title/description/subTitle/icon/status/disabled, NOT `active`) and
    // re-render through their own internal item-rendering path, exactly the
    // asymmetry documented in the WO-SKIN-04 navigation inventory (Menu
    // renders children directly when `items` is absent; Stepper does not).
    // `Stepper.Step`'s own `data-part="item"` stamp is therefore only
    // reachable when it is rendered standalone, as here -- matching the
    // "compound tested directly" idiom StatusBatch.contract.test.tsx uses
    // for `Skeleton.Card`/`Progress.Line`.
    it('compound form (standalone): Stepper.Step stamps item(data-status/data-active)/icon/label/connector', async () => {
      const { container } = renderWithEngine(
        <>
          <Stepper.Step title="Account" status="finish" active stepIndex={0} isLast={false} direction="horizontal" />
          <Stepper.Content stepIndex={0} currentStep={0}>
            <div>Account content</div>
          </Stepper.Content>
        </>,
        'rustic',
      );

      await waitFor(() => {
        expect(container.querySelector('[data-part="item"]')).not.toBeNull();
      });
      expect(container.querySelector('[data-part="item"][data-active="true"]')).not.toBeNull();
      expect(container.querySelector('[data-part="icon"]')).not.toBeNull();
      expect(container.querySelector('[data-part="label"]')).not.toBeNull();
      expect(container.querySelector('[data-part="connector"]')).not.toBeNull();
      expect(container.querySelector('[data-part="panel"][data-active="true"]')).not.toBeNull();
    });
  });

  describe('Pagination', () => {
    it.each(ENGINES)(
      'stamps root/pagination-nav-button/pagination-page-button(data-current)/pagination-range under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Pagination current={1} total={100} pageSize={10} showTotal onChange={vi.fn()} />,
          engine,
        );

        await waitForPart(container, 'root');
        expect(container.querySelectorAll('[data-part="pagination-nav-button"]').length).toBe(2);
        expect(container.querySelector('[data-part="pagination-page-button"][data-current="true"]')).not.toBeNull();
        expect(container.querySelector('[data-part="pagination-range"]')).not.toBeNull();
        expect(container.querySelector('[data-part="ellipsis"]')).not.toBeNull();
      },
    );
  });

  describe('Segmented', () => {
    const options = [
      { label: 'List', value: 'list', icon: <span>i</span> },
      { label: 'Grid', value: 'grid' },
      { label: 'Off', value: 'off', disabled: true },
    ];

    it.each(ENGINES)(
      'stamps root/option(data-selected/data-disabled) under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Segmented options={options} value="list" onChange={vi.fn()} />,
          engine,
        );

        await waitForPart(container, 'root');
        expect(container.querySelector('[data-part="option"][data-selected="true"]')).not.toBeNull();
        expect(container.querySelector('[data-part="option"][data-disabled="true"]')).not.toBeNull();
      },
    );
  });

  describe('BackTop', () => {
    it.each(ENGINES)('stamps trigger under the %s engine', async (engine) => {
      const { container } = renderWithEngine(<BackTop visibilityHeight={0} />, engine);
      await waitForPart(container, 'trigger');
    });
  });

  describe('Breadcrumb', () => {
    const items = [
      { key: 'home', label: 'Home', href: '/' },
      { key: 'docs', label: 'Docs', href: '/docs' },
      { key: 'current', label: 'Current' },
    ];

    it.each(ENGINES)(
      'stamps root/crumb(data-current) for link and current items under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(<Breadcrumb items={items} />, engine);

        await waitForPart(container, 'root');
        expect(container.querySelector('[data-part="crumb"][data-current="false"]')).not.toBeNull();
        expect(container.querySelector('[data-part="crumb"][data-current="true"]')).not.toBeNull();
      },
    );

    it('rustic: stamps separator', async () => {
      const { container } = renderWithEngine(<Breadcrumb items={items} />, 'rustic');
      await waitForPart(container, 'root');
      expect(container.querySelector('[data-part="separator"]')).not.toBeNull();
    });

    // NOTE: `BreadcrumbProps.children` is typed and documented (compound/Item's
    // own header comment shows `<Breadcrumb items={[]}><Breadcrumb.Item .../>`
    // as basic usage), but neither engine file destructures or renders
    // `children` at all -- a pre-existing gap, confirmed by reading both
    // engine files, not something this pre-step introduces or should paper
    // over. `Breadcrumb.Item` is a plain (non-engine-switched) component, so
    // its own stamp is proven by rendering it standalone, matching the
    // "compound tested directly" idiom used elsewhere in this file.
    it('compound form (standalone): Breadcrumb.Item stamps crumb(data-current)', () => {
      const { container } = render(
        <>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem>Current</BreadcrumbItem>
        </>,
      );

      expect(container.querySelector('[data-part="crumb"][data-current="false"]')).not.toBeNull();
      expect(container.querySelector('[data-part="crumb"][data-current="true"]')).not.toBeNull();
    });
  });

  describe('BottomTabBar', () => {
    const items = [
      { key: 'home', label: 'Home', icon: <span>i</span> },
      { key: 'search', label: 'Search', icon: <span>i</span>, badge: 3 },
    ];

    it('stamps root/tab-button(data-selected)/icon/badge/label', async () => {
      const { container } = renderWithEngine(
        <BottomTabBar items={items} activeKey="home" onChange={vi.fn()} />,
        'modern',
      );

      await waitForPart(container, 'root');
      expect(container.querySelector('[data-part="tab-button"][data-selected="true"]')).not.toBeNull();
      expect(container.querySelector('[data-part="icon"]')).not.toBeNull();
      expect(container.querySelector('[data-part="badge"]')).not.toBeNull();
      expect(container.querySelector('[data-part="label"]')).not.toBeNull();
    });
  });

  describe('Anchor', () => {
    it.each(ENGINES)('stamps root/item(data-selected) under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Anchor activeKey="#a" affix={false}>
          <Anchor.Link href="#a" title="A" />
          <Anchor.Link href="#b" title="B" />
        </Anchor>,
        engine,
      );

      await waitForPart(container, 'root');
      expect(container.querySelector('[data-part="item"][data-selected="true"]')).not.toBeNull();
      expect(container.querySelector('[data-part="item"][data-selected="false"]')).not.toBeNull();
    });
  });

  describe('MobileHeader', () => {
    it('stamps root/trigger/label', async () => {
      const { container } = renderWithEngine(
        <MobileHeader title="Title" onBack={vi.fn()} />,
        'modern',
      );

      await waitForPart(container, 'root');
      expect(container.querySelector('[data-part="trigger"]')).not.toBeNull();
      expect(container.querySelector('[data-part="label"]')).not.toBeNull();
    });
  });

  describe('ActionDock', () => {
    it.each((['top', 'bottom'] as const))('stamps root(data-placement=%s)', async (position) => {
      const { container } = renderWithEngine(
        <ActionDock position={position}>
          <button type="button">Action</button>
        </ActionDock>,
        'modern',
      );

      const root = await waitForPart(container, 'root');
      expect(root.getAttribute('data-placement')).toBe(position);
    });
  });

  describe('Affix', () => {
    it.each(ENGINES)('sticky mode: stamps root under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Affix offsetTop={0}>
          <div>content</div>
        </Affix>,
        engine,
      );
      await waitForPart(container, 'root');
    });

    it.each(ENGINES)('advanced mode: stamps root(data-sticky) under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Affix offsetTop={0} onChange={vi.fn()}>
          <div>content</div>
        </Affix>,
        engine,
      );
      const root = await waitForPart(container, 'root');
      // jsdom's getBoundingClientRect() always returns an all-zero rect, so
      // `measure()`'s distanceFromTop (placeholderRect.top - targetRect.top)
      // is 0 <= offsetTop (0) on every mount -- `affixed` resolves true
      // immediately in this environment, unlike a real browser where the
      // placeholder starts below the viewport top. data-sticky is a
      // presence-based boolean attribute (present only when affixed), so
      // this asserts the mechanism reaches the DOM under jsdom's own
      // deterministic (if unrealistic) measurement, not real scroll physics.
      expect(root.getAttribute('data-sticky')).toBe('true');
    });
  });

  describe('Link', () => {
    it.each(ENGINES)(
      'stamps root(data-variant/data-disabled) under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Link href="/x" type="primary" disabled>
            Link text
          </Link>,
          engine,
        );

        const root = await waitForPart(container, 'root');
        expect(root.getAttribute('data-variant')).toBe('primary');
        expect(root.getAttribute('data-disabled')).toBe('true');
      },
    );
  });
});
