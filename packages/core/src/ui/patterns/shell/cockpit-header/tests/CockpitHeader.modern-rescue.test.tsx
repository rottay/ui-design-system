import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import ModernCockpitHeader from '../engines/modern';

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', {
    value,
    configurable: true,
    writable: true,
  });
}

afterEach(() => setScrollY(0));

describe('CockpitHeader modern — rescue drills', () => {
  it('adopts the compact posture when mounted into an already-scrolled document', () => {
    setScrollY(400);
    const { container } = render(
      <ModernCockpitHeader title="Detail" subtitle="Meta" sticky />,
    );

    // Before: the listener was registered but never run once, so the header
    // painted the resting posture until the user scrolled again.
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute(
      'data-compact',
      'true',
    );
    expect(container.querySelector('[data-part="subtitle"]')).toBeNull();
  });

  it('leaves a non-sticky header at rest regardless of scroll offset', () => {
    setScrollY(400);
    const { container } = render(<ModernCockpitHeader title="Detail" subtitle="Meta" />);

    expect(container.querySelector('[data-part="root"]')).toHaveAttribute(
      'data-compact',
      'false',
    );
  });
});

/**
 * The skeleton must reserve the footprint the caller actually asked for. A
 * skeleton that always draws breadcrumb + icon + subtitle + two actions
 * collapses on hydrate for every header that does not use them.
 */
describe('CockpitHeader modern — skeleton mirrors the requested anatomy', () => {
  it('reserves only the title for a title-only header', () => {
    const { container } = render(<ModernCockpitHeader title="Detail" loading />);

    const skeletons = container.querySelectorAll('[data-part="skeleton"]');
    expect(skeletons.length).toBe(1);
    expect(skeletons[0].getAttribute('data-size')).toBe('title');

    expect(container.querySelector('[data-size="crumb"]')).toBeNull();
    expect(container.querySelector('[data-size="icon"]')).toBeNull();
    expect(container.querySelector('[data-size="subtitle"]')).toBeNull();
    expect(container.querySelector('[data-part="skeleton-actions"]')).toBeNull();
  });

  it('grows each reserved block only when the matching prop is supplied', () => {
    const { container } = render(
      <ModernCockpitHeader
        title="Detail"
        subtitle="Meta"
        eyebrow="Section"
        icon={<span data-testid="icon" />}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Detail' }]}
        actions={<button type="button">Save</button>}
        loading
      />,
    );

    expect(container.querySelectorAll('[data-size="crumb"]').length).toBe(2);
    expect(container.querySelector('[data-size="icon"]')).not.toBeNull();
    expect(container.querySelector('[data-size="subtitle"]')).not.toBeNull();
    expect(container.querySelectorAll('[data-size="action"]').length).toBe(2);
  });

  it('announces the busy state and keeps the anatomy stamps across the swap', () => {
    const { container } = render(
      <ModernCockpitHeader title="Detail" icon={<span />} loading />,
    );

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('aria-busy', 'true');
    // The loading root carries the same anatomy stamps the loaded root does,
    // so the skin cannot paint a different lead footprint across the swap.
    expect(root).toHaveAttribute('data-has-icon', 'true');
    expect(root).toHaveAttribute('data-has-actions', 'false');
  });
});

describe('CockpitHeader modern — the compact posture never drops navigation', () => {
  const CRUMBS = [{ label: 'Home', href: '/' }, { label: 'Detail' }];

  it('keeps keyboard focus alive when the sticky header goes compact', () => {
    setScrollY(0);
    const { container } = render(
      <ModernCockpitHeader title="Detail" subtitle="Meta" breadcrumbs={CRUMBS} sticky />,
    );

    const home = screen.getByRole('link', { name: 'Home' });
    home.focus();
    expect(document.activeElement).toBe(home);

    act(() => {
      setScrollY(400);
      window.dispatchEvent(new Event('scroll'));
    });

    // Before: `!isCompact` unmounted the whole <nav>, so a scroll — which is
    // NOT a dismissal — destroyed the focused link and dropped focus to body.
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute(
      'data-compact',
      'true',
    );
    expect(document.activeElement).toBe(home);
  });

  it('keeps the trail reachable while the secondary copy still collapses', () => {
    setScrollY(400);
    const { container } = render(
      <ModernCockpitHeader
        title="Detail"
        eyebrow="Workspace"
        subtitle="Meta"
        breadcrumbs={CRUMBS}
        sticky
      />,
    );

    // The trail is the header's only navigation affordance: it survives.
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(container.querySelector('[data-part="crumb"][data-last="true"]')).toHaveAttribute(
      'aria-current',
      'page',
    );

    // Secondary copy still yields the vertical room the compact posture buys.
    expect(container.querySelector('[data-part="eyebrow"]')).toBeNull();
    expect(container.querySelector('[data-part="subtitle"]')).toBeNull();
  });
});
