/**
 * DetailHeader, WO-FAM-10 sub-lot D2.
 *
 * What this suite owns, and the browser suite beside it does not: the DOM
 * contract the family cut changed. The two hero wrappers are stamped parts
 * (`hero-cluster`, `hero-copy`) so the skin owns the retired inline flex
 * shares; the back chip and the tabs decide hover / press / the keyboard ring
 * once, in the shared kernel, and read them off `data-state`; and the family's
 * own accessibility evidence — the APG tab contract, the named metadata
 * region, the decorative avatar — survives under either reading direction.
 */

import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor, within } from '@testing-library/react';

import { DetailHeader } from '..';
import { renderWithEngine } from '@tests/support/engine';

const WAIT_TIMEOUT = 2000;

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    'src/foundation/tokens/css/presentation/components/skin/detail-header/index.css',
  ),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

const Icon = (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="cut-icon" {...props} />;

const TABS = [
  { id: 'overview', label: 'Overview', count: 3, icon: Icon },
  { id: 'activity', label: 'Activity' },
  { id: 'settings', label: 'Settings' },
];

function fullProps() {
  return {
    title: 'Acme Corp',
    subtitle: 'The acme corporation',
    avatar: '/acme.png',
    status: { label: 'Active', variant: 'success' as const },
    backHref: '/customers',
    breadcrumb: [{ label: 'Customers', href: '/customers' }, { label: 'Acme Corp' }],
    actions: [{ label: 'Edit', onClick: vi.fn() }],
    tabs: TABS,
    activeTab: 'overview',
    onTabChange: vi.fn(),
    metadata: [
      { label: 'ID', value: '12345', icon: Icon, mono: true },
      { label: 'Owner', value: 'Ada' },
    ],
    eyebrow: 'Customer',
    contextRail: <span>context</span>,
    children: <span>extra</span>,
  };
}

async function waitForPart(container: HTMLElement, part: string): Promise<HTMLElement> {
  await waitFor(
    () => {
      if (!container.querySelector(`[data-part="${part}"]`)) {
        throw new Error(`expected [data-part="${part}"] in <container>`);
      }
    },
    { timeout: WAIT_TIMEOUT },
  );
  return container.querySelector(`[data-part="${part}"]`) as HTMLElement;
}

/** Every element the family stamps, keyed by part name (all instances). */
function stampedParts(container: HTMLElement): Set<string> {
  return new Set(
    Array.from(container.querySelectorAll<HTMLElement>('[data-part]')).map(
      (element) => element.getAttribute('data-part') ?? '',
    ),
  );
}

/**
 * The family's own part vocabulary. The two hero wrappers joined the 30
 * pre-cut parts when the skin took over their flex shares. Names stamped by
 * composed primitives (Breadcrumb, Button, Text, …) are not the family's
 * anatomy and are not counted.
 */
const FAMILY_PARTS = [
  'root',
  'top-bar',
  'back-button',
  'back-icon',
  'back-label',
  'breadcrumb-trail',
  'breadcrumb-divider',
  'actions',
  'hero-panel',
  'hero-spine',
  'hero-cluster',
  'hero-copy',
  'avatar',
  'avatar-initials',
  'eyebrow',
  'title',
  'subtitle',
  'context-rail',
  'metadata-card',
  'metadata-chip',
  'metadata-chip-icon',
  'metadata-chip-label',
  'metadata-chip-value',
  'metadata-card-children',
  'tab-strip',
  'tab-list',
  'tab',
  'tab-icon',
  'tab-label',
  'tab-count',
  'tab-count-text',
  'tab-rail',
] as const;

/**
 * Parts stamped on the family's own layout primitives. Composed `Text` parts
 * resolve their ink and weight through the typography system inline (the
 * skin's own header says so), which is composition, not family paint.
 */
const LAYOUT_PARTS = new Set(
  FAMILY_PARTS.filter(
    (part) =>
      !['back-label', 'avatar-initials', 'eyebrow', 'subtitle', 'metadata-chip-label', 'metadata-chip-value', 'tab-label', 'tab-count-text'].includes(part),
  ),
);

/** Non-custom-property declarations in an element's style attribute. */
function inlinePaint(element: HTMLElement): string[] {
  return (element.getAttribute('style') ?? '')
    .split(';')
    .map((declaration) => declaration.trim())
    .filter((declaration) => declaration.length > 0 && !declaration.startsWith('--'));
}

describe('DetailHeader (WO-FAM-10 cut)', () => {
  it('stamps exactly the anatomy the skin paints, and the skin paints exactly what is stamped', async () => {
    // The initials variant stamps `avatar-initials`; the image variant stamps
    // the portrait instead. Union the two renders for the stamped side.
    const stamped = new Set<string>();
    for (const avatar of ['AC', '/acme.png'] as const) {
      const { container, unmount } = renderWithEngine(
        <DetailHeader {...fullProps()} avatar={avatar} />,
        'modern',
      );
      await waitForPart(container, 'root');
      for (const part of stampedParts(container)) stamped.add(part);
      unmount();
    }

    for (const part of FAMILY_PARTS) {
      expect(stamped.has(part), `stamps [data-part="${part}"]`).toBe(true);
    }
    // Everything else the render stamps belongs to a composed primitive
    // (Breadcrumb crumbs, Button, Tooltip, …), whose anatomy those families
    // own; the family's own vocabulary is exactly the list above.

    const consumed = new Set(
      [...SKIN.matchAll(/\[data-part='([a-z-]+)'\]/g)].map((match) => match[1]),
    );
    expect([...consumed].sort()).toEqual([...FAMILY_PARTS].sort());
  });

  it('carries no inline paint on the family layout parts: only --ds-* custom properties travel', async () => {
    const { container } = renderWithEngine(<DetailHeader {...fullProps()} />, 'modern');
    await waitForPart(container, 'root');

    for (const part of LAYOUT_PARTS) {
      for (const element of Array.from(
        container.querySelectorAll<HTMLElement>(`[data-part="${part}"]`),
      )) {
        expect(inlinePaint(element), `${part} inline paint`).toEqual([]);
      }
    }
  });

  it('moves the hero flex shares behind stamped parts', async () => {
    const { container } = renderWithEngine(<DetailHeader {...fullProps()} />, 'modern');
    const cluster = await waitForPart(container, 'hero-cluster');
    const copy = await waitForPart(container, 'hero-copy');
    // The geometry the two wrappers used to carry inline lives in the skin
    // now; what still travels is the flex gap custom property, which is
    // primitive composition and never a `flex`/`min-width` paint value.
    for (const element of [cluster, copy]) {
      const style = element.getAttribute('style') ?? '';
      expect(style).not.toContain('min-width');
      expect(style).not.toMatch(/(?:^|;)\s*flex\s*:/);
    }
  });

  it('stamps the archetype on the root and the title for every member of the closed domain', async () => {
    for (const archetype of ['control', 'editorial', 'technical', 'governance'] as const) {
      const { container, unmount } = renderWithEngine(
        <DetailHeader title="X" backHref="/x" archetype={archetype} />,
        'modern',
      );
      const root = await waitForPart(container, 'root');
      const title = await waitForPart(container, 'title');
      expect(root.getAttribute('data-archetype'), archetype).toBe(archetype);
      expect(title.getAttribute('data-archetype'), archetype).toBe(archetype);
      unmount();
    }

    const { container } = renderWithEngine(<DetailHeader title="X" backHref="/x" />, 'modern');
    const root = await waitForPart(container, 'root');
    expect(root.getAttribute('data-archetype')).toBe('control');
  });

  it('stamps variant, active and mono attributes on both sides of each contract', async () => {
    const { container, unmount } = renderWithEngine(
      <DetailHeader {...fullProps()} avatar="AC" />,
      'modern',
    );
    await waitForPart(container, 'root');
    expect((await waitForPart(container, 'avatar')).getAttribute('data-variant')).toBe('initials');
    const monoValues = Array.from(
      container.querySelectorAll('[data-part="metadata-chip-value"]'),
    ).map((element) => element.getAttribute('data-mono'));
    expect(monoValues).toEqual(['true', 'false']);
    const actives = Array.from(container.querySelectorAll('[data-part="tab"]')).map((element) =>
      element.getAttribute('data-active'),
    );
    expect(actives).toEqual(['true', 'false', 'false']);
    unmount();

    const image = renderWithEngine(<DetailHeader {...fullProps()} />, 'modern');
    await waitForPart(image.container, 'root');
    expect((await waitForPart(image.container, 'avatar')).getAttribute('data-variant')).toBe(
      'image',
    );
  });

  it('decides the back chip hover and press once, in the kernel, and leaves the ring to the platform', async () => {
    const { container } = renderWithEngine(<DetailHeader title="X" backHref="/x" />, 'modern');
    const chip = await waitForPart(container, 'back-button');
    expect(chip.getAttribute('data-state')).toBeNull();

    fireEvent.pointerEnter(chip);
    await waitFor(() => expect(chip.getAttribute('data-state')).toBe('hovered'));

    fireEvent.pointerDown(chip);
    await waitFor(() => expect(chip.getAttribute('data-state')).toContain('pressed'));

    fireEvent.pointerUp(chip);
    fireEvent.pointerLeave(chip);
    await waitFor(() => expect(chip.getAttribute('data-state')).toBeNull());

    // The ring has no kernel twin, measured rather than omitted: the focusable
    // element is the anchor ABOVE the chip and the chip sits inside it, so
    // anchor focus never reaches the chip's handlers and no state is stamped.
    const anchor = chip.closest('a');
    expect(anchor).not.toBeNull();
    fireEvent.focusIn(anchor!);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(chip.getAttribute('data-state')).toBeNull();
  });

  it('decides the tab hover and press once, in the kernel, and reads them off data-state', async () => {
    const { container } = renderWithEngine(
      <DetailHeader title="X" backHref="/x" tabs={TABS} activeTab="activity" onTabChange={vi.fn()} />,
      'modern',
    );
    const tabs = Array.from(container.querySelectorAll<HTMLElement>('[data-part="tab"]'));
    expect(tabs.length).toBe(TABS.length);
    const inactive = tabs[0];
    expect(inactive.getAttribute('data-state')).toBeNull();

    fireEvent.pointerEnter(inactive);
    await waitFor(() => expect(inactive.getAttribute('data-state')).toBe('hovered'));

    fireEvent.pointerDown(inactive);
    await waitFor(() => expect(inactive.getAttribute('data-state')).toContain('pressed'));

    fireEvent.pointerUp(inactive);
    fireEvent.pointerLeave(inactive);
    await waitFor(() => expect(inactive.getAttribute('data-state')).toBeNull());
  });

  it('serves the APG tab contract: roles, selection state and a roving tabindex', async () => {
    const onTabChange = vi.fn();
    const { container, getByRole } = renderWithEngine(
      <DetailHeader title="X" backHref="/x" tabs={TABS} activeTab="activity" onTabChange={onTabChange} />,
      'modern',
    );
    await waitForPart(container, 'tab-strip');

    const tablist = getByRole('tablist', { name: 'Tabs' });
    const tabs = within(tablist).getAllByRole('tab');
    expect(tabs.map((tab) => tab.getAttribute('aria-selected'))).toEqual([
      'false',
      'true',
      'false',
    ]);
    expect(tabs.map((tab) => tab.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);

    // Enter and Space activate without moving focus.
    tabs[1].focus();
    expect(document.activeElement).toBe(tabs[1]);
    fireEvent.keyDown(tabs[1], { key: 'Enter' });
    expect(onTabChange).toHaveBeenCalledWith('activity');
    fireEvent.keyDown(tabs[1], { key: ' ' });
    expect(onTabChange).toHaveBeenCalledWith('activity');
    expect(document.activeElement).toBe(tabs[1]);

    // Arrow keys move focus without activating; Home/End reach the edges.
    fireEvent.keyDown(tabs[1], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tabs[2]);
    expect(onTabChange).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(tabs[2], { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(tabs[1]);

    fireEvent.keyDown(tabs[1], { key: 'Home' });
    expect(document.activeElement).toBe(tabs[0]);

    fireEvent.keyDown(tabs[0], { key: 'End' });
    expect(document.activeElement).toBe(tabs[2]);
  });

  it('flips the arrow-key direction under a right-to-left reading', async () => {
    const { container, getByRole } = renderWithEngine(
      <div dir="rtl">
        <DetailHeader title="X" backHref="/x" tabs={TABS} activeTab="activity" onTabChange={vi.fn()} />
      </div>,
      'modern',
    );
    await waitForPart(container, 'tab-strip');

    const tablist = getByRole('tablist', { name: 'Tabs' });
    const tabs = within(tablist).getAllByRole('tab');
    expect(tabs[1].getAttribute('tabindex')).toBe('0');

    // In RTL the inline-end (ArrowRight) points at the PREVIOUS sibling.
    fireEvent.keyDown(tabs[1], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tabs[0]);

    fireEvent.keyDown(tabs[0], { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(tabs[1]);
  });

  it('names the metadata region and hides the decorative avatar, with the English floor', async () => {
    const { container, getByRole } = renderWithEngine(
      <DetailHeader title="Acme Corp" backHref="/customers" metadata={[{ label: 'ID', value: '1' }]} avatar="/acme.png" />,
      'modern',
    );
    await waitForPart(container, 'root');

    expect(getByRole('group', { name: 'Details' })).toBeTruthy();
    expect(getByRole('heading', { level: 1 }).textContent).toBe('Acme Corp');

    const image = container.querySelector<HTMLImageElement>(
      '[data-part="avatar"][data-variant="image"] img',
    );
    expect(image?.getAttribute('alt')).toBe('');
    expect(image?.getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps the tab contract and the named regions under a right-to-left reading', async () => {
    const { container, getByRole } = renderWithEngine(
      <div dir="rtl">
        <DetailHeader
          title="Acme Corp"
          backHref="/customers"
          tabs={TABS}
          activeTab="overview"
          onTabChange={vi.fn()}
          metadata={[{ label: 'ID', value: '1' }]}
        />
      </div>,
      'modern',
    );
    await waitForPart(container, 'root');

    const tablist = getByRole('tablist', { name: 'Tabs' });
    expect(within(tablist).getAllByRole('tab').length).toBe(TABS.length);
    expect(getByRole('group', { name: 'Details' })).toBeTruthy();
  });
});
