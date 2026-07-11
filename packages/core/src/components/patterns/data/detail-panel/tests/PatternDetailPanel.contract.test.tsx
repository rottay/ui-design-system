import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';

import { PatternDetailPanel } from '..';
import type { DetailPanelProps } from '..';
import { renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';

const ENGINES = ['modern', 'rustic'] as const;

type Customer = { id: string };

/**
 * Every render goes through `createEngineComponent`'s Suspense-wrapped lazy
 * engine loader, so a synchronous `container.querySelector(...)` right after
 * `render()` can race the still-pending engine chunk. Poll for the render's
 * own root landmark before making any other assertion against `container`.
 */
async function waitForRoot(container: HTMLElement): Promise<Element> {
  await waitFor(() => {
    expect(container.querySelector('[data-part="root"]')).not.toBeNull();
  });
  return container.querySelector('[data-part="root"]') as Element;
}

function createProps(overrides: Partial<DetailPanelProps<Customer>> = {}): DetailPanelProps<Customer> {
  return {
    data: { id: 'customer-1' },
    title: 'Acme Corp',
    subtitle: 'Enterprise customer',
    avatar: <div>AV</div>,
    status: { label: 'On Leave', color: '#f59e0b' },
    breadcrumbs: [
      { label: 'Customers', href: '/customers', onClick: vi.fn() },
      { label: 'Acme Corp' },
    ],
    tabs: [
      { key: 'overview', label: 'Overview', content: <div>Overview tab</div>, badge: 3 },
      { key: 'billing', label: 'Billing', content: <div>Billing tab</div> },
      { key: 'history', label: 'History', content: <div>History tab</div>, disabled: true, badge: 'New' },
    ],
    actions: [
      { key: 'edit', label: 'Edit', variant: 'primary', onClick: vi.fn() },
      { key: 'archive', label: 'Archive', variant: 'danger', onClick: vi.fn(), loading: true },
      { key: 'more', label: 'More', variant: 'ghost', onClick: vi.fn(), disabled: true },
      { key: 'default-action', label: 'Default', onClick: vi.fn() },
    ],
    onTabChange: vi.fn(),
    onBack: vi.fn(),
    sidebar: <div>Sidebar content</div>,
    footer: <div>Footer content</div>,
    ...overrides,
  };
}

/**
 * Non-loading render, keyed to the fixture above: 2 breadcrumbs (1 link + 1
 * current), 4 actions, 3 tabs (2 carrying badges).
 */
const COMMON_PART_COUNTS: Record<string, number> = {
  root: 1,
  breadcrumbs: 1,
  'breadcrumb-separator': 1,
  'breadcrumb-link': 1,
  header: 1,
  'back-button': 1,
  title: 1,
  'status-badge': 1,
  subtitle: 1,
  'action-button': 4,
  'tab-list': 1,
  'tab-button': 3,
  'tab-badge': 2,
  'tab-panel': 1,
  sidebar: 1,
  footer: 1,
};

const MODERN_ONLY_PART_COUNTS: Record<string, number> = {
  'breadcrumb-current': 1,
  'action-spinner': 1,
};

const MODERN_LOADING_PART_COUNTS: Record<string, number> = {
  root: 1,
  'skeleton-breadcrumb': 1,
  'skeleton-avatar': 1,
  'skeleton-title': 1,
  'skeleton-badge': 1,
  'skeleton-subtitle': 1,
  'skeleton-action': 2,
  'skeleton-tab': 3,
  'skeleton-content': 2,
  'skeleton-sidebar': 1,
};

const RUSTIC_LOADING_PART_COUNTS: Record<string, number> = {
  root: 1,
  'skeleton-avatar': 1,
  'skeleton-title': 1,
  'skeleton-subtitle': 1,
  'skeleton-tabs': 1,
  'skeleton-content': 1,
};

describe('PatternDetailPanel data-part contract', () => {
  it.each(ENGINES)('stamps the root pair and every anatomy part under the %s engine', async (engine) => {
    const { container } = renderWithEngine(<PatternDetailPanel {...createProps()} />, engine);

    const root = await waitForRoot(container);
    expect(root.className).toContain('ds-pattern-detail-panel');
    expect(root.className).toContain(`ds-engine-${engine}`);
    expect(root.getAttribute('data-loading'), 'the content root must not carry data-loading').toBeNull();

    const expectedCounts = {
      ...COMMON_PART_COUNTS,
      ...(engine === 'modern' ? MODERN_ONLY_PART_COUNTS : {}),
    };

    for (const [part, count] of Object.entries(expectedCounts)) {
      const nodes = container.querySelectorAll(`[data-part="${part}"]`);
      expect(nodes.length, `data-part="${part}" did not reach the DOM`).toBe(count);
    }

    if (engine === 'rustic') {
      expect(container.querySelectorAll('[data-part="breadcrumb-current"]')).toHaveLength(0);
      expect(container.querySelectorAll('[data-part="action-spinner"]')).toHaveLength(0);
    }

    // data-variant stamped on every action-button, including the unlabeled
    // ("default") variant -- order follows the `actions` fixture array.
    const actionButtons = container.querySelectorAll('[data-part="action-button"]');
    expect(Array.from(actionButtons).map((el) => el.getAttribute('data-variant'))).toEqual([
      'primary',
      'danger',
      'ghost',
      'default',
    ]);
    expect(Array.from(actionButtons).map((el) => el.getAttribute('data-loading'))).toEqual([
      'false',
      'true',
      'false',
      'false',
    ]);

    // data-active/data-disabled on every tab-button -- 'overview' is the
    // uncontrolled default active tab, 'history' is the disabled one.
    const tabButtons = container.querySelectorAll('[data-part="tab-button"]');
    expect(Array.from(tabButtons).map((el) => el.getAttribute('data-active'))).toEqual([
      'true',
      'false',
      'false',
    ]);
    expect(Array.from(tabButtons).map((el) => el.getAttribute('data-disabled'))).toEqual([
      'false',
      'false',
      'true',
    ]);
  });

  it.each(ENGINES)('stamps data-loading and the skeleton parts on the loading branch under the %s engine', async (engine) => {
    const { container } = renderWithEngine(<PatternDetailPanel {...createProps()} loading />, engine);

    const root = await waitForRoot(container);
    expect(root.className).toContain('ds-pattern-detail-panel');
    expect(root.className).toContain(`ds-engine-${engine}`);
    expect(root.getAttribute('data-loading'), 'the loading root must carry data-loading="true"').toBe('true');

    const expectedCounts = engine === 'modern' ? MODERN_LOADING_PART_COUNTS : RUSTIC_LOADING_PART_COUNTS;
    for (const [part, count] of Object.entries(expectedCounts)) {
      const nodes = container.querySelectorAll(`[data-part="${part}"]`);
      expect(nodes.length, `data-part="${part}" did not reach the DOM on the loading branch`).toBe(count);
    }

    // Loading branch renders none of the content-branch anatomy.
    for (const part of ['header', 'title', 'status-badge', 'tab-list', 'tab-button', 'footer']) {
      expect(container.querySelectorAll(`[data-part="${part}"]`)).toHaveLength(0);
    }
  });
});
