import React from 'react';
import { act, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import ModernCockpitHeader from '../engines/modern';

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', {
    value,
    configurable: true,
    writable: true,
  });
}

function scrollTo(value: number) {
  act(() => {
    setScrollY(value);
    window.dispatchEvent(new Event('scroll'));
  });
}

afterEach(() => setScrollY(0));

const CRUMBS = [
  { label: 'Home', href: '/' },
  { label: 'Events', href: '/events' },
  { label: 'Detail' },
];

describe('CockpitHeader modern — breadcrumb is a real list', () => {
  it('exposes the trail as an ordered list of items', () => {
    render(<ModernCockpitHeader title="Detail" breadcrumbs={CRUMBS} />);

    const trail = screen.getByRole('navigation');
    const list = within(trail).getByRole('list');

    expect(list.tagName).toBe('OL');
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
  });

  it('keeps each chevron inside the item it introduces', () => {
    const { container } = render(<ModernCockpitHeader title="Detail" breadcrumbs={CRUMBS} />);

    const items = container.querySelectorAll('[data-part="crumb-item"]');
    expect(items[0].querySelector('[data-part="separator"]')).toBeNull();
    expect(items[1].querySelector('[data-part="separator"]')).not.toBeNull();
    expect(items[2].querySelector('[data-part="separator"]')).not.toBeNull();
  });

  it('gives the scrollable trail a keyboard tab stop', () => {
    // overflow-x: auto with a hidden scrollbar and no tab stop left the
    // overflowed tail unreachable — the terminal crumb is not a link.
    render(<ModernCockpitHeader title="Detail" breadcrumbs={CRUMBS} />);

    expect(screen.getByRole('navigation')).toHaveAttribute('tabindex', '0');
  });

  it('keeps the terminal crumb marked as the current page', () => {
    const { container } = render(<ModernCockpitHeader title="Detail" breadcrumbs={CRUMBS} />);

    expect(container.querySelector('[data-part="crumb"][data-last="true"]')).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});

describe('CockpitHeader modern — bidi isolation', () => {
  it('isolates every caller-owned string in the header', () => {
    const { container } = render(
      <ModernCockpitHeader
        title="Detail"
        subtitle="Meta"
        breadcrumbs={CRUMBS}
        status={[{ label: 'Active', variant: 'success' }]}
      />,
    );

    for (const part of ['title', 'subtitle', 'status']) {
      expect(container.querySelector(`[data-part="${part}"] bdi`)).toBeInTheDocument();
    }
    expect(container.querySelectorAll('[data-part="crumb"] bdi')).toHaveLength(3);
  });
});

describe('CockpitHeader modern — compact posture hysteresis', () => {
  it('does not thrash the title block around the entry threshold', () => {
    setScrollY(0);
    const { container } = render(
      <ModernCockpitHeader title="Detail" subtitle="Meta" sticky />,
    );
    const root = () => container.querySelector('[data-part="root"]');

    scrollTo(61);
    expect(root()).toHaveAttribute('data-compact', 'true');

    // Inside the band: a single threshold flipped the subtitle back in here,
    // then straight out again on the next pixel of scroll.
    scrollTo(50);
    expect(root()).toHaveAttribute('data-compact', 'true');
    expect(container.querySelector('[data-part="subtitle"]')).toBeNull();

    scrollTo(30);
    expect(root()).toHaveAttribute('data-compact', 'false');
    expect(container.querySelector('[data-part="subtitle"]')).not.toBeNull();

    // Coming back up the band, the resting posture holds until the entry
    // threshold is crossed again.
    scrollTo(50);
    expect(root()).toHaveAttribute('data-compact', 'false');
  });
});

describe('CockpitHeader modern — the skeleton holds the loaded posture', () => {
  it('keeps a sticky header stuck while it is still loading', () => {
    const { container } = render(<ModernCockpitHeader title="Detail" sticky loading />);

    // Without data-sticky the skeleton scrolled away and the header snapped
    // back into place the moment the content arrived.
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-sticky', 'true');
  });

  it('stamps the resting posture on a non-sticky skeleton', () => {
    const { container } = render(<ModernCockpitHeader title="Detail" loading />);
    const root = container.querySelector('[data-part="root"]');

    expect(root).toHaveAttribute('data-sticky', 'false');
    expect(root).toHaveAttribute('data-compact', 'false');
  });
});
