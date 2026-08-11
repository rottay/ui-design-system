/**
 * FormHeader modern-rescue contract tests (WO-CRA-23).
 *
 * The §4 anatomy evidence lives in the group-level
 * `headers/tests/HeadersBatch.contract.test.tsx`; this suite pins only what the
 * elevation pass owns and what a regression would silently undo:
 *
 * - the commit action lives in the HERO ROW, not in the top utility strip
 *   (the strip is navigation only: back + breadcrumb)
 * - the action rail is a named group, so assistive tech announces it
 * - the `mode` prop reaches the DOM as `data-mode` instead of being destructured
 *   into a discarded local
 * - the title carries no inline typography (the page-title role chain is
 *   skin-owned; an inline size would make every tenant's h1 identical)
 * - the back anchor carries no inline `text-decoration` (the skin owns it)
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';

import { FormHeader } from '..';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

const WAIT_TIMEOUT = 2000;

const Icon = (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="form-icon" {...props} />;

async function waitForPart(container: HTMLElement, part: string): Promise<Element> {
  await waitFor(
    () => {
      if (!container.querySelector(`[data-part="${part}"]`)) {
        throw new Error(`expected [data-part="${part}"] in <container>`);
      }
    },
    { timeout: WAIT_TIMEOUT },
  );
  return container.querySelector(`[data-part="${part}"]`) as Element;
}

describe('FormHeader (modern-rescue elevation)', () => {
  it('renders the action rail inside the hero row, never in the navigation strip', async () => {
    const { container } = renderWithEngine(
      <FormHeader
        icon={Icon}
        title="Create entity"
        backHref="/x"
        breadcrumb={[{ label: 'Entities', href: '/entities' }]}
        actions={[{ label: 'Create', onClick: vi.fn() }]}
      />,
      'modern',
    );

    const actions = await waitForPart(container, 'actions');
    const heroRow = container.querySelector('[data-part="hero-row"]');
    const topBar = container.querySelector('[data-part="top-bar"]');

    expect(heroRow).not.toBeNull();
    expect(heroRow!.contains(actions)).toBe(true);
    expect(topBar!.contains(actions)).toBe(false);
    // The strip keeps navigation only.
    expect(topBar!.querySelector('[data-part="back-button"]')).not.toBeNull();
    expect(topBar!.querySelector('[data-part="breadcrumb-divider"]')).not.toBeNull();
  });

  it('names the action rail as a group for assistive tech (English i18n floor)', async () => {
    const { container } = renderWithEngine(
      <FormHeader icon={Icon} title="Create" backHref="/x" action={{ label: 'Create', onClick: vi.fn() }} />,
      'modern',
    );

    const actions = await waitForPart(container, 'actions');
    expect(actions.getAttribute('role')).toBe('group');
    expect(actions.getAttribute('aria-label')).toBe('Actions');
  });

  it('omits the rail entirely when the consumer supplies no actions', async () => {
    const { container } = renderWithEngine(
      <FormHeader icon={Icon} title="Create" backHref="/x" />,
      'modern',
    );

    await waitForPart(container, 'root');
    expect(container.querySelector('[data-part="actions"]')).toBeNull();
  });

  it('stamps the mode discriminator on the root for every mode', async () => {
    for (const mode of ['create', 'edit', 'view'] as const) {
      const { container, unmount } = renderWithEngine(
        <FormHeader icon={Icon} title="X" backHref="/x" mode={mode} />,
        'modern',
      );
      const root = await waitForPart(container, 'root');
      expect(root.getAttribute('data-mode'), `mode ${mode}`).toBe(mode);
      unmount();
    }
  });

  it('defaults the mode discriminator to create', async () => {
    const { container } = renderWithEngine(
      <FormHeader icon={Icon} title="X" backHref="/x" />,
      'modern',
    );
    const root = await waitForPart(container, 'root');
    expect(root.getAttribute('data-mode')).toBe('create');
  });

  it('leaves typography and the anchor underline to the skin', async () => {
    const { container } = renderWithEngine(
      <FormHeader icon={Icon} title="Skin-owned type" subtitle="Sub" eyebrow="New" backHref="/x" />,
      'modern',
    );

    const title = (await waitForPart(container, 'title')) as HTMLElement;
    expect(title.style.fontSize).toBe('');
    expect(title.style.fontWeight).toBe('');
    expect(title.style.letterSpacing).toBe('');
    expect(title.style.fontFamily).toBe('');

    // The underline reset moved to `a:has(> [data-part='back-button'])`.
    const backAnchor = container.querySelector('[data-part="back-button"]')!.closest('a') as HTMLElement;
    expect(backAnchor.style.textDecoration).toBe('');
  });
});
