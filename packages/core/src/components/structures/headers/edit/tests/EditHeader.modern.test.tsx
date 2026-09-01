/**
 * EditHeader modern-rescue contract tests (WO-CRA-23).
 *
 * The §4 anatomy evidence lives in the group-level
 * `headers/tests/HeadersBatch.contract.test.tsx`; this suite pins only what the
 * elevation pass owns and what a regression would silently undo:
 *
 * - the hero row is a named part, so the container ladder has something to
 *   reflow (the family shipped with no container query at all)
 * - the action rail is a named group, so assistive tech announces it
 * - the loading branch is an announced `status` region rather than an
 *   unlabelled spinning glyph
 * - the title and every action icon carry no inline geometry or typography
 *   (the page-title role chain and the icon size are skin-owned; an inline
 *   value would make every tenant's h1 identical and freeze the ladder)
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';

import { EditHeader } from '..';
import { renderWithEngine } from '@tests/support/engine';

const WAIT_TIMEOUT = 2000;

const Icon = (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="edit-icon" {...props} />;

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

describe('EditHeader (modern-rescue elevation)', () => {
  it('stamps the hero row that the container ladder reflows, holding both the copy and the rail', async () => {
    const { container } = renderWithEngine(
      <EditHeader title="Edit entity" backHref="/x" onSave={vi.fn()} onCancel={vi.fn()} />,
      'modern',
    );

    const heroRow = await waitForPart(container, 'hero-row');
    const heroCopy = container.querySelector('[data-part="hero-copy"]');
    const actions = container.querySelector('[data-part="actions"]');

    expect(heroCopy).not.toBeNull();
    expect(actions).not.toBeNull();
    expect(heroRow.contains(heroCopy!)).toBe(true);
    expect(heroRow.contains(actions!)).toBe(true);
  });

  it('names the action rail as a group for assistive tech (English i18n floor)', async () => {
    const { container } = renderWithEngine(
      <EditHeader title="Edit" backHref="/x" onSave={vi.fn()} />,
      'modern',
    );

    const actions = await waitForPart(container, 'actions');
    expect(actions.getAttribute('role')).toBe('group');
    expect(actions.getAttribute('aria-label')).toBe('Actions');
  });

  it('announces the loading branch as a named status region', async () => {
    const { container } = renderWithEngine(
      <EditHeader title="Loading" backHref="/x" loading />,
      'modern',
    );

    const root = await waitForPart(container, 'root');
    expect(root.getAttribute('data-loading')).toBe('true');
    expect(root.getAttribute('role')).toBe('status');
    expect(root.getAttribute('aria-busy')).toBe('true');
    // The name resolves through the shared `common.loading` catalog entry, so
    // this asserts a real translated name rather than the raw key — the exact
    // string is the locale merge's to own, not this family's.
    const name = root.getAttribute('aria-label') ?? '';
    expect(name.length).toBeGreaterThan(0);
    expect(name).not.toBe('loading');
  });

  it('leaves title typography and every icon geometry to the skin', async () => {
    const { container } = renderWithEngine(
      <EditHeader
        icon={Icon}
        title="Skin-owned type"
        subtitle="Sub"
        eyebrow="Entity"
        backHref="/x"
        actions={[{ label: 'Extra', kind: 'open', onClick: vi.fn() }]}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
      'modern',
    );

    const title = (await waitForPart(container, 'title')) as HTMLElement;
    expect(title.style.fontSize).toBe('');
    expect(title.style.fontWeight).toBe('');
    expect(title.style.letterSpacing).toBe('');
    expect(title.style.fontFamily).toBe('');

    const glyph = (await waitForPart(container, 'icon-badge-glyph')) as HTMLElement;
    expect(glyph.style.width).toBe('');
    expect(glyph.style.height).toBe('');

    const railIcons = Array.from(
      container.querySelectorAll<HTMLElement>('[data-part="actions"] svg'),
    );
    expect(railIcons.length).toBeGreaterThan(0);
    for (const icon of railIcons) {
      expect(icon.style.width).toBe('');
      expect(icon.style.height).toBe('');
    }
  });

  it('renders Save and Cancel through the semantic icon facade, not a supplier glyph', async () => {
    const { container } = renderWithEngine(
      <EditHeader title="Edit" backHref="/x" onSave={vi.fn()} onCancel={vi.fn()} />,
      'modern',
    );

    await waitForPart(container, 'actions');
    // Governed semantic icons stamp their role name; a compatibility-catalog
    // import would render a bare <svg> with no role identity.
    const names = Array.from(container.querySelectorAll('[data-part="actions"] svg')).map((svg) =>
      svg.getAttribute('data-icon-name'),
    );
    expect(names).toContain('action.close');
    expect(names).toContain('action.save');
  });
});
