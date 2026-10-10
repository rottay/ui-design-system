/**
 * FormHeader icon slots. The header stamps `icon-badge-glyph` and
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

import { FormHeader } from '..';

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

describe('FormHeader icon slots', () => {
  it.each(ICONS)('stamps the badge glyph slot for %s', async (_name, Icon, glyphs) => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = renderWithEngine(<FormHeader icon={Icon} title="Create workspace" backHref="/w" />, 'modern');
    const [slot] = await slots(container, 'icon-badge-glyph', 1);
    expectOwnedSlot(slot, 'icon-badge-glyph', glyphs);
    expect(slot.parentElement).toHaveAttribute('data-part', 'icon-badge');
    expect(screen.getByRole('heading', { name: 'Create workspace' })).toBeInTheDocument();
  });

  it.each(ICONS)('stamps the action icon slot for a caller action carrying %s', async (_name, Icon, glyphs) => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = renderWithEngine(
      <FormHeader
        icon={Catalog}
        title="Create workspace"
        backHref="/w"
        actions={[{ label: 'Publish', kind: 'secondary', icon: Icon, onClick: vi.fn() }]}
      />,
      'modern',
    );
    const [slot] = await slots(container, 'action-icon', 1);
    expectOwnedSlot(slot, 'action-icon', glyphs);
    expect(slot.closest('button')).toBe(screen.getByRole('button', { name: 'Publish' }));
  });

  it('renders no action slot for an action without an icon', async () => {
    const { container } = renderWithEngine(
      <FormHeader
        icon={Catalog}
        title="Create workspace"
        backHref="/w"
        actions={[{ label: 'Publish', kind: 'secondary', onClick: vi.fn() }]}
      />,
      'modern',
    );
    await screen.findByRole('button', { name: 'Publish' });
    expect(container.querySelector('[data-part="action-icon"]')).toBeNull();
  });
});
