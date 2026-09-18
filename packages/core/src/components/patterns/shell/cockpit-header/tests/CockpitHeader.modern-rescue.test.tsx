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

/** Every bone the shared renderer drew, in document order, by the part it read. */
const boneParts = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-part="bone"]')).map((bone) =>
    bone.getAttribute('data-source-part'),
  );

/**
 * The loading state must stand in for the header the caller actually asked for.
 * It is no longer a hand-written reserve that has to be kept in step with the
 * chrome: the shared renderer walks this header's own parts, so the two cannot
 * drift.
 */
describe('CockpitHeader modern — skeleton IS the requested anatomy', () => {
  it('reserves only the title for a title-only header', () => {
    const { container } = render(<ModernCockpitHeader title="Detail" loading />);

    expect(boneParts(container)).toEqual(['title']);
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
        onBack={() => {}}
        loading
      />,
    );

    // One bone per crumb, the back control's own box, the framed tile, and the
    // copy column -- all measured from the chrome rather than declared here.
    expect(boneParts(container)).toEqual([
      'crumb',
      'crumb',
      'trigger',
      'header-icon',
      'eyebrow',
      'title',
      'subtitle',
    ]);
  });

  it('announces the busy state and keeps the anatomy stamps across the swap', () => {
    const { container } = render(
      <ModernCockpitHeader title="Detail" icon={<span />} loading />,
    );

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(root).toHaveAttribute('role', 'status');
    expect(root).toHaveAttribute('aria-label', 'Loading');
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
    // Focus is a kernel state update now (the crumb stamps `data-state`), so the
    // move is committed inside `act` rather than left for React to warn about.
    act(() => home.focus());
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
