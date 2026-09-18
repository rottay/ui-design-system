/**
 * FormHeader, WO-FAM-10 sub-lot C.
 *
 * What this suite owns, and the browser suite beside it does not: the DOM contract
 * the family cut changed. The tone is a stamp from the one header-tone resolver
 * instead of three inline custom properties, the back chip's hover and press are
 * the shared kernel's decision read off `data-state`, and the accessible names the
 * chrome ships survive with an English floor under either reading direction.
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor, within } from '@testing-library/react';

import { HEADER_TONES } from '../../../foundation/chrome/runtime/header-tone';
import { FormHeader } from '..';
import { renderWithEngine } from '@tests/support/engine';

const WAIT_TIMEOUT = 2000;

const Icon = (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="form-icon" {...props} />;

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

describe('FormHeader (WO-FAM-10 cut)', () => {
  it('stamps the badge tone through the shared resolver and paints none of it inline', async () => {
    for (const tone of ['primary', 'secondary', 'success', 'warning', 'info'] as const) {
      const { container, unmount } = renderWithEngine(
        <FormHeader icon={Icon} title="X" backHref="/x" colorVariant={tone} />,
        'modern',
      );
      const badge = await waitForPart(container, 'icon-badge');
      expect(badge.getAttribute('data-variant'), `tone ${tone}`).toBe(tone);
      // The retired hatch wrote three custom properties here; nothing does now.
      expect(badge.getAttribute('style') ?? '', `tone ${tone}`).not.toContain('--ds-header-icon-tone');
      expect(HEADER_TONES).toContain(tone);
      unmount();
    }
  });

  it('resolves an unstated tone to the contract default rather than leaving the slot unstamped', async () => {
    const { container } = renderWithEngine(
      <FormHeader icon={Icon} title="X" backHref="/x" />,
      'modern',
    );
    const badge = await waitForPart(container, 'icon-badge');
    expect(badge.getAttribute('data-variant')).toBe('secondary');
  });

  it('decides the back chip hover and press once, in the kernel, and reads them off data-state', async () => {
    const { container } = renderWithEngine(
      <FormHeader icon={Icon} title="X" backHref="/x" />,
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

  it('names the rail and the back destination for assistive tech, with the English floor', async () => {
    const { container, getByRole } = renderWithEngine(
      <FormHeader
        icon={Icon}
        title="Create entity"
        backHref="/entities"
        actions={[{ label: 'Create', onClick: vi.fn() }]}
      />,
      'modern',
    );

    await waitForPart(container, 'actions');
    const rail = getByRole('group', { name: 'Actions' });
    // The rail's buttons arrive through a lazily mounted Tooltip, so the name is
    // waited for rather than read on the first frame.
    await waitFor(
      () => expect(within(rail).getByRole('button', { name: /create/iu })).toBeTruthy(),
      { timeout: WAIT_TIMEOUT },
    );
    // The heading is the page's own, on the h1 the skin owns.
    expect(getByRole('heading', { level: 1 }).textContent).toBe('Create entity');
    // The back chip's label is the anchor's accessible name.
    const back = await waitForPart(container, 'back-button');
    expect(back.closest('a')?.textContent).toContain('Back');
  });

  it('keeps the rail reachable and named under a right-to-left reading', async () => {
    const { container, getByRole } = renderWithEngine(
      <div dir="rtl">
        <FormHeader
          icon={Icon}
          title="Create entity"
          backHref="/entities"
          breadcrumb={[{ label: 'Entities', href: '/entities' }]}
          actions={[{ label: 'Create', onClick: vi.fn() }]}
        />
      </div>,
      'modern',
    );
    await waitForPart(container, 'actions');
    expect(getByRole('group', { name: 'Actions' })).toBeTruthy();
    // The back arrow is the governed `navigation.back` role, which mirrors itself;
    // the family stamps no transform of its own for either direction.
    const icon = await waitForPart(container, 'back-icon');
    expect(icon.getAttribute('data-icon-name')).toBe('navigation.back');
    expect(icon.getAttribute('style') ?? '').not.toContain('scaleX');
  });

  it('paints the rail gap from the skin, with no geometry left on the hero row', async () => {
    const { container } = renderWithEngine(
      <FormHeader icon={Icon} title="X" backHref="/x" action={{ label: 'Go', onClick: vi.fn() }} />,
      'modern',
    );
    const row = await waitForPart(container, 'hero-row');
    // The `gap={20}` prop wrote `--ds-flex-gap` here; the channel is the skin's now.
    expect(row.getAttribute('style') ?? '').not.toContain('--ds-flex-gap');
    expect(row.getAttribute('data-gap')).toBeNull();
  });
});
