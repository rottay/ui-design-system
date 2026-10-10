/**
 * The pill's icon slot. The pill stamps `pill-icon` on an element it owns, so
 * the anatomy the skin paints renders whatever the option's icon component
 * renders -- including nothing. The label names the pill; the glyph is
 * decorative.
 */
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, waitFor } from '@testing-library/react';

import { renderWithEngine } from '@tests/support/engine';
import { PlusIcon } from '@/graphics/icons';
import { StatusErrorIcon } from '@/graphics/icons/semantic/generated/roles/status-error';
import { screen } from '@testing-library/react';

import { StatusFilterPills } from '..';

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

describe('StatusFilterPills icon slot', () => {
  it.each(ICONS)('stamps the slot for %s', async (_name, Icon, glyphs) => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = renderWithEngine(
      <StatusFilterPills
        options={[
          { value: 'open', label: 'Open', icon: Icon },
          { value: 'closed', label: 'Closed', icon: Icon },
        ]}
        value="open"
        onChange={vi.fn()}
      />,
      'modern',
    );
    const [selected, resting] = await slots(container, 'pill-icon', 2);
    for (const slot of [selected, resting]) {
      expectOwnedSlot(slot, 'pill-icon', glyphs);
      expect(slot).toHaveClass('ds-status-filter-pills__pill-icon');
      expect(slot.closest("[data-part='icon']")).not.toBeNull();
    }
    expect(selected).toHaveAttribute('data-selected', 'true');
    expect(resting).toHaveAttribute('data-selected', 'false');
    // The icon never names the pill: the label does, with or without a glyph.
    expect(screen.getByRole('button', { name: 'Open', pressed: true })).toBe(selected.closest('button'));
    expect(screen.getByRole('button', { name: 'Closed', pressed: false })).toBe(resting.closest('button'));
  });

  it('hands the selection to the icon component and keeps a catalog glyph decorative', async () => {
    const { container } = renderWithEngine(
      <StatusFilterPills options={[{ value: 'open', label: 'Open', icon: Catalog }]} value="open" onChange={vi.fn()} />,
      'modern',
    );
    const [slot] = await slots(container, 'pill-icon', 1);
    const glyph = slot.querySelector('svg') as SVGElement;
    expect(glyph).toHaveClass('rottay-icon');
    expect(glyph).toHaveAttribute('data-selected', 'true');
    expect(glyph).toHaveAttribute('aria-hidden', 'true');
    expect(glyph).not.toHaveAttribute('data-part');
    expect(glyph).not.toHaveClass('ds-status-filter-pills__pill-icon');
  });

  it('renders no slot for an option without an icon', async () => {
    const { container } = renderWithEngine(
      <StatusFilterPills options={[{ value: 'open', label: 'Open' }]} value="open" onChange={vi.fn()} />,
      'modern',
    );
    await screen.findByRole('button', { name: 'Open' });
    expect(container.querySelector('[data-part="pill-icon"]')).toBeNull();
  });
});
