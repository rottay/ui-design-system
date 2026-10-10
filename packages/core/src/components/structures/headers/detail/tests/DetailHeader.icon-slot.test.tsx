/**
 * DetailHeader tab icon slot. The tab stamps `tab-icon` on an element it owns,
 * so the anatomy the skin sizes and inks renders whatever the tab's icon
 * component renders -- including nothing. The tab's label names it; the glyph
 * is decorative.
 */
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, waitFor } from '@testing-library/react';

import { renderWithEngine } from '@tests/support/engine';
import { PlusIcon } from '@/graphics/icons';
import { StatusErrorIcon } from '@/graphics/icons/semantic/generated/roles/status-error';
import { screen } from '@testing-library/react';

import { DetailHeader } from '..';

type IconComponent = React.ComponentType<Record<string, unknown>>;

/** A catalog icon: renders its svg whatever it is handed. */
const Catalog = PlusIcon as unknown as IconComponent;
/** A semantic icon passed bare: its accessibility guard renders nothing without a name or `decorative`. */
const SemanticBare = StatusErrorIcon as unknown as IconComponent;
/** A semantic icon wrapped by its consumer, which states the decorative intent. */
const SemanticDecorative: IconComponent = (props) => <StatusErrorIcon decorative {...props} />;
/** A consumer glyph that forwards nothing. */
const CustomGlyph: IconComponent = () => <svg data-testid="custom-glyph" />;

const ICONS: ReadonlyArray<readonly [string, IconComponent, number]> = [
  ['a catalog icon', Catalog, 1],
  ['a bare semantic icon', SemanticBare, 0],
  ['a decorative semantic icon', SemanticDecorative, 1],
  ['a consumer glyph', CustomGlyph, 1],
];

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function slots(container: HTMLElement, part: string, count: number): Promise<HTMLElement[]> {
  await waitFor(() => expect(container.querySelectorAll(`[data-part="${part}"]`)).toHaveLength(count), { timeout: 4000 });
  return Array.from(container.querySelectorAll<HTMLElement>(`[data-part="${part}"]`));
}

/** The slot is the family's own decorative element; the glyph inside carries no anatomy of its own. */
function expectOwnedSlot(slot: HTMLElement, part: string, glyphs: number): void {
  expect(slot.tagName).toBe('SPAN');
  expect(slot).toHaveAttribute('aria-hidden', 'true');
  expect(slot.style.width).toBe('');
  expect(slot.style.height).toBe('');
  expect(slot.querySelectorAll('svg')).toHaveLength(glyphs);
  expect(slot.querySelector(`[data-part="${part}"]`)).toBeNull();
  for (const glyph of slot.querySelectorAll<SVGElement>('svg')) {
    expect(glyph.parentElement).toBe(slot);
    expect(glyph.style.width).toBe('');
    expect(glyph.style.height).toBe('');
  }
}

describe('DetailHeader tab icon slot', () => {
  it.each(ICONS)('stamps the slot for %s', async (_name, Icon, glyphs) => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = renderWithEngine(
      <DetailHeader
        title="Acme"
        backHref="/c"
        tabs={[
          { id: 'overview', label: 'Overview', icon: Icon },
          { id: 'people', label: 'People', icon: Icon },
        ]}
        activeTab="overview"
        onTabChange={vi.fn()}
      />,
      'modern',
    );
    const [active, resting] = await slots(container, 'tab-icon', 2);
    for (const slot of [active, resting]) expectOwnedSlot(slot, 'tab-icon', glyphs);
    expect(active).toHaveAttribute('data-active', 'true');
    expect(resting).toHaveAttribute('data-active', 'false');
    // The icon never names the tab: the label does, with or without a glyph.
    expect(screen.getByRole('tab', { name: 'Overview', selected: true })).toBe(active.closest('[role="tab"]'));
    expect(screen.getByRole('tab', { name: 'People', selected: false })).toBe(resting.closest('[role="tab"]'));
  });

  it('hands the active state to the icon component', async () => {
    const { container } = renderWithEngine(
      <DetailHeader
        title="Acme"
        backHref="/c"
        tabs={[{ id: 'overview', label: 'Overview', icon: Catalog }]}
        activeTab="overview"
        onTabChange={vi.fn()}
      />,
      'modern',
    );
    const [slot] = await slots(container, 'tab-icon', 1);
    const glyph = slot.querySelector('svg') as SVGElement;
    expect(glyph).toHaveAttribute('data-active', 'true');
    expect(glyph).not.toHaveAttribute('data-part');
  });

  it('renders no slot for a tab without an icon', async () => {
    const { container } = renderWithEngine(
      <DetailHeader title="Acme" backHref="/c" tabs={[{ id: 'overview', label: 'Overview' }]} activeTab="overview" onTabChange={vi.fn()} />,
      'modern',
    );
    await screen.findByRole('tab', { name: 'Overview' });
    expect(container.querySelector('[data-part="tab-icon"]')).toBeNull();
  });
});
