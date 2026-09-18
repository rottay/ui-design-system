import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernWorkbenchHeader from '../engines/modern';

const VIEWS = [
  { id: 'v1', label: 'Overview' },
  { id: 'v2', label: 'Exceptions' },
];

/** Every bone the shared renderer drew, in document order, by the part it read. */
const boneParts = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-part="bone"]')).map((bone) =>
    bone.getAttribute('data-source-part'),
  );

describe('WorkbenchHeader modern — the skeleton IS the requested anatomy', () => {
  it('reserves only the title for a title-only header', () => {
    const { container } = render(<ModernWorkbenchHeader title="Hub" loading />);

    // Not a hand-written reserve that happens to match: the renderer walked this
    // header's own parts, and a title-only header has exactly one to draw.
    expect(boneParts(container)).toEqual(['title']);
  });

  it('grows each reserved block only when the matching prop is supplied', () => {
    const { container } = render(
      <ModernWorkbenchHeader
        title="Hub"
        eyebrow="Intel"
        subtitle="Briefing"
        icon={<span />}
        quickActions={[
          { label: 'New', onClick: vi.fn() },
          { label: 'Export', onClick: vi.fn() },
          { label: 'Archive', onClick: vi.fn() },
        ]}
        savedViews={VIEWS}
        loading
      />,
    );

    // One bone per part the caller actually asked for, including one per action
    // and one per saved view -- never a fixed pair and never a flat tab block.
    expect(boneParts(container)).toEqual([
      'header-icon',
      'eyebrow',
      'title',
      'subtitle',
      'action',
      'action',
      'action',
      'tab-label',
      'tab-label',
    ]);
  });

  it('keeps the wait to one announcement: the root names it, the stand-in is hidden', () => {
    const { container } = render(<ModernWorkbenchHeader title="Hub" savedViews={VIEWS} loading />);

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('role', 'status');
    expect(root).toHaveAttribute('aria-label', 'Loading');

    // The renderer is told not to announce a second time, and the chrome it
    // measures is inert and out of the accessibility tree.
    const skeleton = container.querySelector('.ds-skeleton-anatomy') as HTMLElement;
    expect(skeleton.getAttribute('aria-busy')).toBeNull();
    const source = container.querySelector('[data-part="source"]') as HTMLElement;
    expect(source).toHaveAttribute('aria-hidden', 'true');
    expect(source).toHaveAttribute('inert');
    expect(container.querySelector('[data-part="bones"]')).toHaveAttribute('aria-hidden', 'true');
  });

  it('announces the busy state and keeps the anatomy stamps across the swap', () => {
    const props = {
      title: 'Hub',
      icon: <span />,
      savedViews: VIEWS,
    } as const;

    const { container: busy } = render(<ModernWorkbenchHeader {...props} loading />);
    const busyRoot = busy.querySelector('[data-part="root"]') as HTMLElement;

    expect(busyRoot).toHaveAttribute('aria-busy', 'true');

    const { container: settled } = render(<ModernWorkbenchHeader {...props} />);
    const settledRoot = settled.querySelector('[data-part="root"]') as HTMLElement;

    // The skin keys its footprint on these: a loading root that dropped them
    // painted a different lead and tab reserve than the loaded one.
    for (const stamp of ['data-has-icon', 'data-has-actions', 'data-has-tabs']) {
      expect(busyRoot.getAttribute(stamp)).toBe(settledRoot.getAttribute(stamp));
    }
  });
});

describe('WorkbenchHeader modern — the saved-views strip is not gated on a callback', () => {
  it('keeps the strip when the header is read-only', () => {
    render(<ModernWorkbenchHeader title="Hub" savedViews={VIEWS} activeViewId="v2" />);

    // A read-only header (no onViewChange) must still show the saved-views
    // strip, or it can't display which view is on screen.
    expect(screen.getByRole('tablist', { name: 'Saved views' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Exceptions' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('stamps the tab reserve on a read-only header', () => {
    const { container } = render(
      <ModernWorkbenchHeader title="Hub" savedViews={VIEWS} activeViewId="v1" />,
    );

    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-has-tabs', 'true');
  });

  it('still drives the callback when one is supplied', () => {
    const onViewChange = vi.fn();
    render(
      <ModernWorkbenchHeader
        title="Hub"
        savedViews={VIEWS}
        activeViewId="v1"
        onViewChange={onViewChange}
      />,
    );

    screen.getByRole('tab', { name: 'Exceptions' }).click();

    expect(onViewChange).toHaveBeenCalledWith('v2');
  });
});

describe('WorkbenchHeader modern — locale-correct content', () => {
  it('formats the exception count for the active locale', () => {
    const { container } = render(
      <I18nProvider locale="es" fallbackLocale="es">
        <ModernWorkbenchHeader title="Hub" exceptionCount={1234567} />
      </I18nProvider>,
    );

    const badge = container.querySelector('[data-part="exception"]') as HTMLElement;
    expect(badge).toHaveTextContent(new Intl.NumberFormat('es').format(1234567));
    expect(badge.textContent).not.toContain('1234567');
  });

  it('bidi-isolates the caller-owned header strings', () => {
    const { container } = render(
      <ModernWorkbenchHeader
        title="Hub"
        subtitle="Briefing"
        savedViews={VIEWS}
        activeViewId="v1"
      />,
    );

    expect(container.querySelector('[data-part="title"] bdi')).toBeInTheDocument();
    expect(container.querySelector('[data-part="subtitle"] bdi')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-part="tab"] bdi')).toHaveLength(2);
  });
});
