/**
 * EditHeader, WO-FAM-10 sub-lot C.
 *
 * What this suite owns, and the browser suite beside it does not: the DOM contract
 * the family cut changed. Both toned slots stamp from the one header-tone resolver
 * instead of each computing its own inline tone, the back chip's hover and press
 * are the shared kernel's decision, and the loading state is BUILT from this
 * header's own anatomy by the shared renderer rather than hand-written as a glyph.
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor, within } from '@testing-library/react';

import { HEADER_TONES } from '../../../foundation/chrome/runtime/header-tone';
import { EditHeader } from '..';
import { renderWithEngine } from '@tests/support/engine';

const WAIT_TIMEOUT = 2000;

const Icon = (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="edit-icon" {...props} />;

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

describe('EditHeader (WO-FAM-10 cut)', () => {
  it('stamps the badge tone through the shared resolver and paints none of it inline', async () => {
    for (const tone of ['primary', 'secondary', 'success', 'warning', 'info', 'error'] as const) {
      const { container, unmount } = renderWithEngine(
        <EditHeader icon={Icon} title="X" backHref="/x" colorVariant={tone} />,
        'modern',
      );
      const badge = await waitForPart(container, 'icon-badge');
      expect(badge.getAttribute('data-variant'), `tone ${tone}`).toBe(tone);
      expect(badge.getAttribute('style') ?? '', `tone ${tone}`).not.toContain('--ds-header-icon-tone');
      expect(HEADER_TONES).toContain(tone);
      unmount();
    }
  });

  it('tones the status pill from the same resolver, over the narrower status domain', async () => {
    for (const tone of ['success', 'warning', 'error', 'info', 'secondary'] as const) {
      const { container, unmount } = renderWithEngine(
        <EditHeader title="X" backHref="/x" status={{ label: 'State', color: tone }} />,
        'modern',
      );
      const pill = await waitForPart(container, 'status-pill');
      expect(pill.getAttribute('data-variant'), `tone ${tone}`).toBe(tone);
      expect(pill.getAttribute('style') ?? '', `tone ${tone}`).not.toContain('--ds-edit-header-status-tone');
      unmount();
    }
  });

  it('decides the back chip hover and press once, in the kernel, and reads them off data-state', async () => {
    const { container } = renderWithEngine(
      <EditHeader title="X" backHref="/x" />,
      'modern',
    );
    const chip = await waitForPart(container, 'back-button');
    expect(chip.getAttribute('data-state')).toBeNull();

    fireEvent.pointerEnter(chip);
    await waitFor(() => expect(chip.getAttribute('data-state')).toBe('hovered'));

    fireEvent.pointerDown(chip);
    await waitFor(() => expect(chip.getAttribute('data-state')).toContain('pressed'));

    fireEvent.pointerUp(chip);
    fireEvent.pointerLeave(chip);
    await waitFor(() => expect(chip.getAttribute('data-state')).toBeNull());
  });

  /**
   * The R4 amendment's skeleton clause, as a DOM fact: the wait is the shared
   * anatomy renderer standing in for THIS header's parts, and the announcement is
   * the root's alone so the region is named once rather than twice.
   */
  it('builds the loading state from its own anatomy, announced once', async () => {
    const { container } = renderWithEngine(
      <EditHeader icon={Icon} title="Loading" backHref="/x" status={{ label: 'S', color: 'info' }} loading />,
      'modern',
    );
    const root = await waitForPart(container, 'root');
    expect(root.getAttribute('data-loading')).toBe('true');
    expect(root.getAttribute('role')).toBe('status');
    expect(root.getAttribute('aria-busy')).toBe('true');
    expect((root.getAttribute('aria-label') ?? '').length).toBeGreaterThan(0);

    const skeleton = container.querySelector('.ds-skeleton-anatomy');
    expect(skeleton).not.toBeNull();
    // The host owns the single announcement, so the renderer makes none.
    expect(skeleton!.getAttribute('aria-busy')).toBeNull();
    // It stands in for the real chrome: the family's own parts are what it reads.
    const source = skeleton!.querySelector('[data-part="source"]')!;
    expect(source.getAttribute('aria-hidden')).toBe('true');
    for (const part of ['top-bar', 'hero-panel', 'icon-badge', 'title', 'actions']) {
      expect(source.querySelector(`[data-part="${part}"]`), part).not.toBeNull();
    }
  });

  it('renders the same chrome outside the loading state, with no skeleton left behind', async () => {
    const { container } = renderWithEngine(
      <EditHeader icon={Icon} title="Ready" backHref="/x" onSave={vi.fn()} />,
      'modern',
    );
    const root = await waitForPart(container, 'root');
    expect(root.getAttribute('data-loading')).toBe('false');
    expect(root.getAttribute('role')).toBeNull();
    expect(root.getAttribute('aria-busy')).toBeNull();
    expect(container.querySelector('.ds-skeleton-anatomy')).toBeNull();
  });

  it('names the rail and its built-in commits for assistive tech, with the English floor', async () => {
    const { container, getByRole } = renderWithEngine(
      <EditHeader title="Edit entity" backHref="/x" onSave={vi.fn()} onCancel={vi.fn()} />,
      'modern',
    );
    await waitForPart(container, 'actions');
    const rail = getByRole('group', { name: 'Actions' });
    await waitFor(
      () => {
        expect(within(rail).getByRole('button', { name: /save changes/iu })).toBeTruthy();
        expect(within(rail).getByRole('button', { name: /cancel/iu })).toBeTruthy();
      },
      { timeout: WAIT_TIMEOUT },
    );
    expect(getByRole('heading', { level: 1 }).textContent).toBe('Edit entity');
  });

  it('keeps the dirty state readable as text, not as a tint alone', async () => {
    const { container } = renderWithEngine(
      <EditHeader title="X" backHref="/x" dirty />,
      'modern',
    );
    const label = await waitForPart(container, 'dirty-label');
    expect(label.textContent).toBe('Unsaved changes');
    // The dot is decoration beside the sentence, never the sentence itself.
    const dot = await waitForPart(container, 'dirty-dot');
    expect(dot.getAttribute('aria-hidden')).toBe('true');
  });

  it('paints the rail gap from the skin, with no geometry left on the hero row', async () => {
    const { container } = renderWithEngine(
      <EditHeader title="X" backHref="/x" onSave={vi.fn()} />,
      'modern',
    );
    const row = await waitForPart(container, 'hero-row');
    expect(row.getAttribute('style') ?? '').not.toContain('--ds-flex-gap');
    expect(row.getAttribute('data-gap')).toBeNull();
  });
});
