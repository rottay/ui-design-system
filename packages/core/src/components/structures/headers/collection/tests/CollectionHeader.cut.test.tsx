/**
 * CollectionHeader, WO-FAM-10 sub-lot D2 — the DOM contract the family cut changed.
 *
 * What this suite owns, and the browser suite beside it does not: the drained
 * runtime. The family stamps a closed anatomy and every posture/variant
 * attribute the skin keys on, carries ZERO inline paint (only composed
 * primitives may emit their own `--ds-*` channels), decides the two lifting
 * chrome surfaces' hover/press once in the shared kernel, keeps the
 * primary-first partition / overflow law / C0 labelled collapse intact, and
 * renders its loading state through the shared anatomy renderer. The a11y
 * assertions of the family's own: the loading region is named, icon-only
 * actions keep accessible names, and the page has exactly one h1.
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor, within } from '@testing-library/react';

import { CollectionHeader } from '..';
import { renderWithEngine } from '@tests/support/engine';

const WAIT_TIMEOUT = 2000;

const Icon = (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="qa-icon" {...props} />;

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

const FULL = {
  eyebrow: 'Workspace',
  title: 'Candidates',
  subtitle: 'All active candidates',
  layoutVariant: 'editorial-tech' as const,
  compact: false,
  metaItems: [
    { key: 'a', label: '12 active', tone: 'primary' as const },
    { key: 'b', label: 'Neutral', tone: 'neutral' as const },
  ],
  shortcuts: [{ key: 's', label: 'Command K' }],
  quickActions: [
    { key: 'q1', label: 'Invite', onClick: vi.fn(), variant: 'primary' as const },
    { key: 'q2', label: 'Export', onClick: vi.fn(), variant: 'secondary' as const, icon: <Icon /> },
  ],
};

describe('CollectionHeader (WO-FAM-10 sub-lot D2 cut)', () => {
  it('stamps the closed part vocabulary, and every rule has a stamp', async () => {
    const { container } = renderWithEngine(<CollectionHeader {...FULL} />, 'modern');
    const root = await waitForPart(container, 'root');

    // The family's own part vocabulary (composed primitives stamp their own
    // internals — those are the Button/Dropdown kernel's, not this census).
    const familyParts = [
      'identity',
      'title',
      'eyebrow',
      'subtitle',
      'subtitle-row',
      'subtitle-divider',
      'editorial-tech-rule',
      'meta-item',
      'secondary-rail',
      'quick-actions',
      'quick-action-icon',
      'action-divider',
      'shortcuts-label',
      'shortcuts-label-icon',
      'shortcut-pill',
    ];
    for (const part of familyParts) {
      expect(root.querySelectorAll(`[data-part="${part}"]`).length, part).toBeGreaterThan(0);
    }
    // No hand-made loading parts: the loading state is the shared renderer's.
    expect(root.querySelector('[data-part="skeleton"]')).toBeNull();
    expect(root.querySelector('[data-block]')).toBeNull();
  });

  it('carries zero inline paint: every styled node sets only --ds-* custom properties', async () => {
    const { container } = renderWithEngine(<CollectionHeader {...FULL} />, 'modern');
    const root = await waitForPart(container, 'root');

    const styled = Array.from(root.querySelectorAll<HTMLElement>('[style]'));
    for (const node of styled) {
      const inline = node.getAttribute('style') ?? '';
      for (const declaration of inline.split(';')) {
        const property = declaration.split(':')[0]?.trim() ?? '';
        if (!property) continue;
        expect(
          property.startsWith('--ds-'),
          `inline property ${property} on <${node.tagName.toLowerCase()} data-part="${node.getAttribute('data-part')}">`,
        ).toBe(true);
      }
    }
    // The family's own stamped parts carry no style attribute at all.
    for (const part of ['identity', 'title', 'eyebrow', 'subtitle', 'meta-item', 'shortcut-pill', 'quick-actions', 'secondary-rail']) {
      for (const node of Array.from(root.querySelectorAll<HTMLElement>(`[data-part="${part}"]`))) {
        expect(node.getAttribute('style'), part).toBeNull();
      }
    }
  });

  it('stamps the closed variant domains: tone, subtitle variant, treatments, posture', async () => {
    const { container } = renderWithEngine(
      <CollectionHeader
        {...FULL}
        titleTreatment="dotted"
        subtitleTreatment="mono-technical"
        metaItems={[
          { key: 'a', label: '12 active', tone: 'primary' as const },
          { key: 'b', label: '3 flagged', tone: 'success' as const },
          { key: 'c', label: 'Neutral', tone: 'neutral' as const },
        ]}
      />,
      'modern',
    );
    const root = await waitForPart(container, 'root');

    expect(root.getAttribute('data-embedded')).toBe('false');
    expect(root.getAttribute('data-compact')).toBe('false');
    expect(root.getAttribute('data-minimal')).toBe('false');
    expect(root.getAttribute('data-editorial-tech')).toBe('true');
    expect(root.getAttribute('data-loading')).toBe('false');

    for (const tone of ['primary', 'success', 'neutral']) {
      expect(
        root.querySelector(`[data-part="meta-item"][data-tone="${tone}"]`),
        `tone ${tone}`,
      ).not.toBeNull();
    }
    const title = await waitForPart(container, 'title');
    expect(title.getAttribute('data-title-treatment')).toBe('dotted');
    const subtitle = root.querySelector('[data-part="subtitle"][data-variant="editorial-tech"]');
    expect(subtitle).not.toBeNull();
    expect(subtitle?.getAttribute('data-subtitle-treatment')).toBe('mono-technical');
  });

  it('decides the root card and the quick-actions pill once, in the kernel, read off data-state', async () => {
    const { container } = renderWithEngine(<CollectionHeader {...FULL} />, 'modern');
    const root = await waitForPart(container, 'root');
    const pill = await waitForPart(container, 'quick-actions');

    expect(root.getAttribute('data-state')).toBeNull();
    fireEvent.pointerEnter(root);
    await waitFor(() => expect(root.getAttribute('data-state')).toBe('hovered'));
    fireEvent.pointerLeave(root);
    await waitFor(() => expect(root.getAttribute('data-state')).toBeNull());

    expect(pill.getAttribute('data-state')).toBeNull();
    fireEvent.pointerEnter(pill);
    await waitFor(() => expect(pill.getAttribute('data-state')).toBe('hovered'));
    fireEvent.pointerDown(pill);
    await waitFor(() => expect(pill.getAttribute('data-state')).toContain('pressed'));
    fireEvent.pointerUp(pill);
    fireEvent.pointerLeave(pill);
    await waitFor(() => expect(pill.getAttribute('data-state')).toBeNull());
  });

  it('keeps the stable primary-first partition in every posture', async () => {
    const { container } = renderWithEngine(
      <CollectionHeader
        {...FULL}
        quickActions={[
          { key: 'q2', label: 'Export', onClick: vi.fn(), variant: 'secondary' as const },
          { key: 'q1', label: 'Invite', onClick: vi.fn(), variant: 'primary' as const },
        ]}
      />,
      'modern',
    );
    await waitForPart(container, 'quick-actions');
    const buttons = Array.from(
      container.querySelectorAll<HTMLElement>('.ds-collection-header__quick-action'),
    ).map((node) => node.textContent ?? '');
    expect(buttons[0]).toContain('Invite');
    expect(buttons[1]).toContain('Export');
  });

  it('applies the overflow law: compact, >2 actions with a primary, quiet actions move to a labelled menu', async () => {
    const { container, getByRole } = renderWithEngine(
      <CollectionHeader
        {...FULL}
        compact
        quickActions={[
          { key: 'q1', label: 'Invite', onClick: vi.fn(), variant: 'primary' as const },
          { key: 'q2', label: 'Export', onClick: vi.fn(), variant: 'secondary' as const },
          { key: 'q3', label: 'Import', onClick: vi.fn(), icon: <Icon /> },
        ]}
      />,
      'modern',
    );
    await waitForPart(container, 'quick-actions');

    const labelled = within(container as HTMLElement);
    // The primary keeps its full label and leads; the quiet actions live in
    // the menu behind the labelled overflow trigger (the Dropdown mounts its
    // trigger lazily, so the name is waited for).
    const primary = labelled.getByRole('button', { name: 'Invite' });
    expect(primary).toBeTruthy();
    await waitFor(
      () => expect(labelled.getByRole('button', { name: 'More actions' })).toBeTruthy(),
      { timeout: WAIT_TIMEOUT },
    );
    expect(labelled.queryByRole('button', { name: 'Export' })).toBeNull();
    expect(getByRole('heading', { level: 1 }).textContent).toBe('Candidates');
  });

  it('keeps the C0 labelled icon-only collapse: a collapsed action never becomes an unlabeled glyph', async () => {
    const { container } = renderWithEngine(
      <CollectionHeader
        {...FULL}
        compact
        quickActions={[
          { key: 'q1', label: 'Invite', onClick: vi.fn(), variant: 'primary' as const },
          { key: 'q2', label: 'Export', onClick: vi.fn(), icon: <Icon /> },
        ]}
      />,
      'modern',
    );
    await waitForPart(container, 'quick-actions');

    const collapsed = container.querySelector<HTMLElement>(
      '.ds-collection-header__quick-action--default',
    );
    expect(collapsed).not.toBeNull();
    expect(collapsed?.getAttribute('aria-label')).toBe('Export');
    expect(collapsed?.getAttribute('title')).toBe('Export');
    // The primary never loses its label.
    const primary = container.querySelector<HTMLElement>(
      '.ds-collection-header__quick-action--primary',
    );
    expect(primary?.textContent).toContain('Invite');
    expect(primary?.getAttribute('aria-label')).toBeNull();
  });

  it('names the loading region and builds it from the anatomy with the shared renderer', async () => {
    const { container } = renderWithEngine(<CollectionHeader {...FULL} loading />, 'modern');

    await waitFor(() => {
      expect(container.querySelector('[data-loading="true"]')).not.toBeNull();
    });
    const root = container.querySelector('[data-loading="true"]') as HTMLElement;
    expect(root.getAttribute('role')).toBe('status');
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(root.getAttribute('aria-label')).toBeTruthy();

    // The shared renderer's own anatomy: a hidden source copy plus positioned
    // bones — no hand-made blocks anywhere.
    await waitFor(
      () => {
        expect(root.querySelector('[data-part="bones"]')).not.toBeNull();
      },
      { timeout: WAIT_TIMEOUT },
    );
    expect(root.querySelector('[data-part="source"]')).not.toBeNull();
    expect(root.querySelectorAll('[data-part="bone"]').length).toBeGreaterThan(0);
    expect(root.querySelector('[data-part="skeleton"]')).toBeNull();
  });

  it('serves exactly one h1 and keeps the rail reachable under a right-to-left reading', async () => {
    const { container, getByRole } = renderWithEngine(
      <div dir="rtl">
        <CollectionHeader
          {...FULL}
          quickActions={[{ key: 'q1', label: 'Invite', onClick: vi.fn(), variant: 'primary' as const }]}
        />
      </div>,
      'modern',
    );
    await waitForPart(container, 'quick-actions');

    const headings = container.querySelectorAll('h1');
    expect(headings.length).toBe(1);
    expect(getByRole('heading', { level: 1 }).textContent).toBe('Candidates');
    // The action is reachable and named in either reading direction.
    expect(within(container as HTMLElement).getByRole('button', { name: 'Invite' })).toBeTruthy();
  });
});
