/**
 * DetailHeader anatomy contract (WO-CRA-23 modern-rescue).
 *
 * The group-level HeadersBatch contract pins the parts that existed before this
 * lane. This suite pins what the elevation added and what its skin cannot paint
 * without: the scope classes every rule anchors on, the three new parts
 * (`hero-spine`, `tab-rail`, `breadcrumb-trail`, `tab-list`), the selection
 * state the rail tracks, the skin-owned tab wrapping, and the accessible names.
 *
 * The family is engine-free, so nothing here asserts an engine: the tenant axis
 * is what diverges, through the `--ds-detail-*` channels the skin reads.
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';

import { DetailHeader } from '..';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

const WAIT_TIMEOUT = 2000;

async function waitForRoot(container: HTMLElement): Promise<HTMLElement> {
  await waitFor(
    () => {
      if (!container.querySelector('.ds-detail-header[data-part="root"]')) {
        throw new Error('expected .ds-detail-header[data-part="root"] in <container>');
      }
    },
    { timeout: WAIT_TIMEOUT },
  );
  return container.querySelector('.ds-detail-header[data-part="root"]') as HTMLElement;
}

const TABS = [
  { id: 'overview', label: 'Overview', count: 3 },
  { id: 'activity', label: 'Activity' },
];

describe('DetailHeader anatomy contract', () => {
  it('carries the scope classes every skin rule anchors on', async () => {
    const { container } = renderWithEngine(
      <DetailHeader title="Acme Corp" backHref="/customers" />,
      'modern',
    );

    const root = await waitForRoot(container);
    expect(root.classList.contains('ds-structure')).toBe(true);
    expect(root.classList.contains('ds-detail-header')).toBe(true);
  });

  it('keeps the scope classes under every engine', async () => {
    for (const engine of ['classic', 'modern', 'rustic'] as const) {
      const { container, unmount } = renderWithEngine(
        <DetailHeader title="Acme Corp" backHref="/customers" />,
        engine,
      );

      const root = await waitForRoot(container);
      expect(root.classList.contains('ds-structure'), engine).toBe(true);
      expect(root.classList.contains('ds-detail-header'), engine).toBe(true);
      unmount();
    }
  });

  it('merges a caller className instead of replacing the scope classes', async () => {
    const { container } = renderWithEngine(
      <DetailHeader title="Acme Corp" backHref="/customers" className="app-detail-header" />,
      'modern',
    );

    const root = await waitForRoot(container);
    expect(root.classList.contains('ds-detail-header')).toBe(true);
    expect(root.classList.contains('app-detail-header')).toBe(true);
  });

  it('renders the parts the elevated skin paints: hero-spine, breadcrumb-trail, tab-list, tab-rail', async () => {
    const { container } = renderWithEngine(
      <DetailHeader
        title="Acme Corp"
        backHref="/customers"
        breadcrumb={[{ label: 'Customers', href: '/customers' }, { label: 'Acme Corp' }]}
        tabs={TABS}
        activeTab="overview"
        onTabChange={vi.fn()}
      />,
      'modern',
    );

    await waitForRoot(container);

    // The spine is the family's premium signature; without the part the
    // `--ds-detail-hero-spine` channel has nowhere to land.
    const spine = container.querySelector('[data-part="hero-spine"]');
    expect(spine).not.toBeNull();
    expect(spine?.getAttribute('aria-hidden')).toBe('true');

    // The trail is one addressable region so the narrow posture can retire the
    // whole ancestor path, divider included, in a single rule.
    const trail = container.querySelector('[data-part="breadcrumb-trail"]');
    expect(trail).not.toBeNull();
    expect(trail?.querySelector('[data-part="breadcrumb-divider"]')).not.toBeNull();

    // Wrapping is skin-owned: an inline flex-wrap would outrank the skin and
    // the swipeable narrow lane could never exist.
    const tabList = container.querySelector<HTMLElement>('[data-part="tab-list"]');
    expect(tabList).not.toBeNull();
    expect(tabList?.style.flexWrap).toBe('');
  });

  it('the tab rail tracks the selected tab', async () => {
    const { container } = renderWithEngine(
      <DetailHeader
        title="Acme Corp"
        backHref="/customers"
        tabs={TABS}
        activeTab="activity"
        onTabChange={vi.fn()}
      />,
      'modern',
    );

    await waitForRoot(container);

    const rails = Array.from(container.querySelectorAll<HTMLElement>('[data-part="tab-rail"]'));
    expect(rails.length).toBe(TABS.length);
    expect(rails.map((rail) => rail.getAttribute('data-active'))).toEqual(['false', 'true']);
    for (const rail of rails) {
      expect(rail.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('names the metadata region for assistive technology (i18n English floor)', async () => {
    const { container } = renderWithEngine(
      <DetailHeader
        title="Acme Corp"
        backHref="/customers"
        metadata={[{ label: 'ID', value: '12345' }]}
      />,
      'modern',
    );

    await waitForRoot(container);

    const region = container.querySelector('[data-part="metadata-card"]');
    expect(region?.getAttribute('role')).toBe('group');
    expect(region?.getAttribute('aria-label')).toBe('Details');
  });

  it('treats the avatar portrait as decorative: the h1 already names the record', async () => {
    const { container } = renderWithEngine(
      <DetailHeader title="Acme Corp" avatar="/acme.png" backHref="/customers" />,
      'modern',
    );

    await waitForRoot(container);

    const image = container.querySelector<HTMLImageElement>(
      '[data-part="avatar"][data-variant="image"] img',
    );
    expect(image).not.toBeNull();
    expect(image?.getAttribute('alt')).toBe('');
    expect(image?.getAttribute('aria-hidden')).toBe('true');
  });

  it('leaks no prop to the DOM root', async () => {
    const { container } = renderWithEngine(
      <DetailHeader
        title="Acme Corp"
        backHref="/customers"
        eyebrow="Customer"
        archetype="editorial"
      />,
      'modern',
    );

    const root = await waitForRoot(container);
    for (const attribute of ['archetype', 'eyebrow', 'backhref', 'contextrail', 'ontabchange']) {
      expect(root.hasAttribute(attribute)).toBe(false);
    }
    // The archetype travels as a stamped contract attribute, not as a prop.
    expect(root.getAttribute('data-archetype')).toBe('editorial');
  });
});
