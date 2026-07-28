/**
 * Pattern Timeline modern engine — skin ownership, keyboard a11y and i18n
 * floor pins (R2+R3 batch E).
 *
 * The engine stamps parts/state; `skin/pattern-timeline.css` owns every
 * painted and micro-layout channel that used to ride Tailwind utilities and
 * inline styles (timestamp type, meta row, badge geometry, avatar, spinner
 * motion, clickable-card states).
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import ModernTimeline from '../engines/modern';
import type { TimelineItem } from '../contracts';

const items: TimelineItem[] = [
  {
    key: 'created',
    timestamp: new Date('2026-03-01T10:00:00Z'),
    title: 'Created',
    description: 'Record was created',
    type: 'success',
    user: { name: 'Ana', avatar: 'https://example.com/a.png' },
  },
];

const UTILITY_CLASS_RE =
  /(?:^|\s)(font-mono|text-xs|text-sm|opacity-\d+|flex|items-center|justify-center|gap-\d+|mb-\d+|mt-\d+|py-\d+|text-center|cursor-pointer|hover:\S+|transition-shadow|w-\d+|h-\d+|font-semibold)(?=\s|$)/;

function expectNoUtilityClasses(root: ParentNode) {
  const offenders: string[] = [];
  root.querySelectorAll('[class]').forEach((el) => {
    const cls = el.getAttribute('class') ?? '';
    if (UTILITY_CLASS_RE.test(cls)) offenders.push(cls);
  });
  expect(offenders, `utility classes leaked into the modern engine: ${offenders.join(' | ')}`).toEqual([]);
}

describe('PatternTimeline modern — skin ownership', () => {
  it('renders parts free of Tailwind utilities and inline paint', () => {
    const { container } = render(<ModernTimeline items={items} />);

    expectNoUtilityClasses(container);

    const timestamp = container.querySelector("[data-part='timestamp']") as HTMLElement;
    expect(timestamp.tagName).toBe('TIME');
    expect(timestamp.getAttribute('class')).toBe('ds-timeline-modern__timestamp');

    const avatar = container.querySelector("[data-part='avatar']") as HTMLElement;
    expect(avatar.getAttribute('style')).toBeNull();
    expect(avatar.querySelector('img')?.getAttribute('style')).toBeNull();

    const badge = container.querySelector("[data-part='type-badge']") as HTMLElement;
    expect(badge.getAttribute('style')).toBeNull();

    const title = container.querySelector("[data-part='item-title']") as HTMLElement;
    expect(title.textContent).toBe('Created');
    const description = container.querySelector("[data-part='item-description']") as HTMLElement;
    expect(description.textContent).toBe('Record was created');
  });

  it('owns the loading spinner geometry in the skin (no inline size or animation)', () => {
    const { container } = render(<ModernTimeline items={items} loading />);

    const spinner = container.querySelector("[data-part='spinner']") as HTMLElement;
    expect(spinner).not.toBeNull();
    expect(spinner.getAttribute('style')).toBeNull();
    expect(container.querySelector("[data-part='root']")?.getAttribute('data-loading')).toBe('true');
  });
});

describe('PatternTimeline modern — keyboard a11y on clickable cards', () => {
  it('exposes role=button + tabIndex and activates on Enter and Space', () => {
    const onItemClick = vi.fn();
    render(<ModernTimeline items={items} onItemClick={onItemClick} />);

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('data-part', 'item-card');
    expect(card).toHaveAttribute('tabindex', '0');

    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onItemClick).toHaveBeenCalledTimes(1);
    expect(onItemClick.mock.calls[0][0].key).toBe('created');

    fireEvent.keyDown(card, { key: ' ' });
    expect(onItemClick).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(card, { key: 'Escape' });
    expect(onItemClick).toHaveBeenCalledTimes(2);
  });

  it('stays inert (no button role, no tab stop) without onItemClick', () => {
    const { container } = render(<ModernTimeline items={items} />);

    const card = container.querySelector("[data-part='item-card']") as HTMLElement;
    expect(card.getAttribute('role')).toBeNull();
    expect(card.getAttribute('tabindex')).toBeNull();
    expect(card.getAttribute('data-clickable')).toBeNull();
  });
});

describe('PatternTimeline modern — i18n English floor (no I18nProvider)', () => {
  it('renders the empty state with the English floor text', () => {
    render(<ModernTimeline items={[]} />);

    expect(screen.getByText('No timeline items')).toBeInTheDocument();
    expect(screen.getByText('No timeline items')).toHaveAttribute('data-part', 'empty');
  });
});
