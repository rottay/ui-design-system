import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernWorkbenchHeader from '../engines/modern';

const VIEWS = [
  { id: 'v1', label: 'Overview' },
  { id: 'v2', label: 'Exceptions' },
];

describe('WorkbenchHeader modern — the skeleton mirrors the requested anatomy', () => {
  it('reserves only the title for a title-only header', () => {
    const { container } = render(<ModernWorkbenchHeader title="Hub" loading />);

    const skeletons = container.querySelectorAll('[data-part="skeleton"]');
    expect(skeletons).toHaveLength(1);
    expect(skeletons[0].getAttribute('data-size')).toBe('title');

    expect(container.querySelector('[data-size="avatar"]')).toBeNull();
    expect(container.querySelector('[data-size="subtitle"]')).toBeNull();
    expect(container.querySelector('[data-size="tabs"]')).toBeNull();
    expect(container.querySelector('[data-part="skeleton-actions"]')).toBeNull();
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

    expect(container.querySelector('[data-size="avatar"]')).not.toBeNull();
    expect(container.querySelector('[data-size="eyebrow"]')).not.toBeNull();
    expect(container.querySelector('[data-size="subtitle"]')).not.toBeNull();
    expect(container.querySelector('[data-size="tabs"]')).not.toBeNull();
    // One reserve per action, not a fixed pair.
    expect(container.querySelectorAll('[data-size="action"]')).toHaveLength(3);
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
