/**
 * The back chip's keyboard ring, on both header twins.
 *
 * The ring is declared once, in `header-hero-shared`, and the focusable element
 * is the app-injected anchor ABOVE the chip — so before this the rule had only
 * `a:focus-visible` and no DOM token could reach it. `NavigationLinkProps` now
 * admits the kernel's stamp, each header observes the anchor's focus, and the
 * chip carries `focus-visible` in its own `data-state` while the anchor arm
 * stays as the platform's fallback for a host Link that drops the stamp.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, waitFor } from '@testing-library/react';
import { renderWithEngine } from '@tests/support/engine';

import { FormHeader } from '..';

const HERE = dirname(fileURLToPath(import.meta.url));
const skin = readFileSync(
  resolve(
    HERE,
    '../../../../../foundation/tokens/css/presentation/components/skin/header-hero-shared/index.css',
  ),
  'utf8',
);

const Icon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} viewBox="0 0 24 24" />;

const header = () => <FormHeader icon={Icon} title="Form" backHref="/back" />;

afterEach(cleanup);

describe('form-header back-chip focus ring stamp', () => {
  it('form-header renders the anchor and the chip this suite reads', async () => {
    const { container } = renderWithEngine(header(), 'modern');
    await waitFor(() => expect(container.querySelector('[data-part="back-button"]')).not.toBeNull());
    expect(container.querySelector('a[href="/back"]')).not.toBeNull();
    expect(container.querySelector('[data-part="back-label"]')).not.toBeNull();
  });

  it('pairs the kernel arm on the chip with the platform arm on the anchor', () => {
    for (const family of ['ds-edit-header', 'ds-form-header']) {
      expect(skin).toContain(
        `.ds-structure.${family} [data-part='back-button'][data-state~='focus-visible']`,
      );
      expect(skin).toContain(`.ds-structure.${family} a:focus-visible [data-part='back-button']`);
    }
    expect(skin).toContain(
      'box-shadow: var(--ds-header-back-focus-ring, var(--ds-focus-ring,',
    );
  });

  it('form-header leaves the chip silent at rest', async () => {
    const { container } = renderWithEngine(header(), 'modern');
    await waitFor(() => expect(container.querySelector('[data-part="back-button"]')).not.toBeNull());

    const chip = container.querySelector<HTMLElement>('[data-part="back-button"]')!;
    expect(chip.hasAttribute('data-state')).toBe(false);
  });

  it('form-header forwards the anchor keyboard focus onto the chip', async () => {
    const { container } = renderWithEngine(header(), 'modern');
    await waitFor(() => expect(container.querySelector('[data-part="back-button"]')).not.toBeNull());

    const anchor = container.querySelector<HTMLElement>('a[href="/back"]')!;
    const chip = container.querySelector<HTMLElement>('[data-part="back-button"]')!;

    fireEvent.focus(anchor);
    expect(chip.getAttribute('data-state')?.split(' ')).toContain('focus-visible');

    fireEvent.blur(anchor);
    expect(chip.hasAttribute('data-state')).toBe(false);
  });

  it('form-header withholds the ring from a pointer-driven anchor focus', async () => {
    const { container } = renderWithEngine(header(), 'modern');
    await waitFor(() => expect(container.querySelector('[data-part="back-button"]')).not.toBeNull());

    const anchor = container.querySelector<HTMLElement>('a[href="/back"]')!;
    const chip = container.querySelector<HTMLElement>('[data-part="back-button"]')!;

    fireEvent.pointerDown(anchor);
    fireEvent.focus(anchor);
    expect(chip.getAttribute('data-state')?.split(' ') ?? []).not.toContain('focus-visible');
  });

  it('form-header writes the stamp onto the anchor itself, so a host Link receives it', async () => {
    const { container } = renderWithEngine(header(), 'modern');
    await waitFor(() => expect(container.querySelector('[data-part="back-button"]')).not.toBeNull());

    const anchor = container.querySelector<HTMLElement>('a[href="/back"]')!;
    expect(anchor.hasAttribute('data-state')).toBe(false);

    fireEvent.focus(anchor);
    // `renderHrefAnchor` spreads this same object onto an injected Link, whose
    // contract admits it; `NavLinkAnchor.focus-stamp` drills that half.
    expect(anchor.getAttribute('data-state')?.split(' ')).toContain('focus-visible');
  });

  it('form-header keeps the chip hover/press on the chip, not on the anchor', async () => {
    const { container } = renderWithEngine(header(), 'modern');
    await waitFor(() => expect(container.querySelector('[data-part="back-button"]')).not.toBeNull());

    const anchor = container.querySelector<HTMLElement>('a[href="/back"]')!;
    const chip = container.querySelector<HTMLElement>('[data-part="back-button"]')!;

    fireEvent.pointerEnter(chip);
    expect(chip.getAttribute('data-state')?.split(' ')).toContain('hovered');
    // The anchor's own hover is not the chip's: only focus crosses the boundary.
    fireEvent.pointerLeave(chip);
    fireEvent.pointerEnter(anchor);
    expect(chip.getAttribute('data-state')?.split(' ') ?? []).not.toContain('hovered');
  });
});
