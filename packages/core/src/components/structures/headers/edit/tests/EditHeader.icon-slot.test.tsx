/**
 * EditHeader icon slots. The header stamps `icon-badge-glyph` and
 * `action-icon` on elements it owns, so the anatomy the skin sizes renders
 * whatever the icon component renders -- including nothing. The title and the
 * action labels name the page and its actions; the glyphs are decorative.
 */
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, waitFor } from '@testing-library/react';

import { renderWithEngine } from '@tests/support/engine';
import { PlusIcon } from '@/graphics/icons';
import { StatusErrorIcon } from '@/graphics/icons/semantic/generated/roles/status-error';
import { screen } from '@testing-library/react';

import { EditHeader } from '..';

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

describe('EditHeader icon slots', () => {
  it.each(ICONS)('stamps the badge glyph slot for %s', async (_name, Icon, glyphs) => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = renderWithEngine(<EditHeader icon={Icon} title="Edit workspace" backHref="/w" />, 'modern');
    const [slot] = await slots(container, 'icon-badge-glyph', 1);
    expectOwnedSlot(slot, 'icon-badge-glyph', glyphs);
    expect(slot.parentElement).toHaveAttribute('data-part', 'icon-badge');
    expect(screen.getByRole('heading', { name: 'Edit workspace' })).toBeInTheDocument();
  });

  it.each(ICONS)('stamps the action icon slot for a caller action carrying %s', async (_name, Icon, glyphs) => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = renderWithEngine(
      <EditHeader
        title="Edit workspace"
        backHref="/w"
        actions={[{ label: 'Publish', kind: 'secondary', icon: Icon, onClick: vi.fn() }]}
      />,
      'modern',
    );
    const [slot] = await slots(container, 'action-icon', 1);
    expectOwnedSlot(slot, 'action-icon', glyphs);
    expect(slot.closest('button')).toBe(screen.getByRole('button', { name: 'Publish' }));
  });

  it('stamps one slot per rail action, each around a rendered glyph', async () => {
    const { container } = renderWithEngine(
      <EditHeader
        title="Edit workspace"
        backHref="/w"
        actions={[{ label: 'Create', onClick: vi.fn() }]}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
      'modern',
    );
    const rail = await slots(container, 'action-icon', 3);
    for (const slot of rail) expectOwnedSlot(slot, 'action-icon', 1);
    expect(rail.map((slot) => slot.closest('button')?.textContent)).toEqual(['Create', 'Cancel', 'Save Changes']);
    // Save and Cancel stay on the semantic facade, decorative inside the slot.
    for (const slot of rail.slice(1)) {
      expect(slot.querySelector('svg')).toHaveAttribute('data-asset-class', 'semantic-icon');
      expect(slot.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('renders no slot without an icon or an action icon', async () => {
    const { container } = renderWithEngine(
      <EditHeader title="Edit workspace" backHref="/w" actions={[{ label: 'Publish', kind: 'secondary', onClick: vi.fn() }]} />,
      'modern',
    );
    await screen.findByRole('button', { name: 'Publish' });
    expect(container.querySelector('[data-part="icon-badge-glyph"]')).toBeNull();
    expect(container.querySelector('[data-part="action-icon"]')).toBeNull();
  });
});
