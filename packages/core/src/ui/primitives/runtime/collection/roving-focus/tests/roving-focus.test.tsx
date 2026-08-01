import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  resolveNavigationIntent,
  resolveNavigationTarget,
  useRovingFocus,
  type CollectionOrientation,
  type RovingFocusOptions,
} from '../index';

/** Minimal collection harness: the kernel owns tabIndex, keys and focus. */
function Collection(props: Omit<RovingFocusOptions, 'orientation'> & { orientation?: CollectionOrientation }) {
  const { ids, orientation = 'vertical', ...rest } = props;
  const roving = useRovingFocus({ ids, orientation, ...rest });

  return (
    <ul>
      {ids.map((id) => (
        <li key={id} {...roving.getItemProps(id)} data-testid={id}>
          {id}
        </li>
      ))}
    </ul>
  );
}

const tabStops = () =>
  screen
    .getAllByRole('listitem')
    .filter((node) => node.getAttribute('tabindex') === '0');

const ids = ['a', 'b', 'c', 'd'];

describe('roving-focus kernel: key mapping law', () => {
  it('maps the horizontal axis logically, so RTL never flips a key name', () => {
    const ltr = { orientation: 'horizontal' as const, rtl: false };
    const rtl = { orientation: 'horizontal' as const, rtl: true };

    expect(resolveNavigationIntent('ArrowRight', ltr)).toBe('next');
    expect(resolveNavigationIntent('ArrowLeft', ltr)).toBe('previous');
    expect(resolveNavigationIntent('ArrowRight', rtl)).toBe('previous');
    expect(resolveNavigationIntent('ArrowLeft', rtl)).toBe('next');
  });

  it('keeps the vertical axis and Home/End direction-neutral', () => {
    for (const rtl of [false, true]) {
      const axis = { orientation: 'both' as const, rtl };
      expect(resolveNavigationIntent('ArrowDown', axis)).toBe('next');
      expect(resolveNavigationIntent('ArrowUp', axis)).toBe('previous');
      expect(resolveNavigationIntent('Home', axis)).toBe('first');
      expect(resolveNavigationIntent('End', axis)).toBe('last');
    }
  });

  it('leaves cross-axis keys to the family', () => {
    expect(resolveNavigationIntent('ArrowRight', { orientation: 'vertical', rtl: false })).toBeNull();
    expect(resolveNavigationIntent('ArrowLeft', { orientation: 'vertical', rtl: true })).toBeNull();
    expect(resolveNavigationIntent('ArrowDown', { orientation: 'horizontal', rtl: false })).toBeNull();
    expect(resolveNavigationIntent('ArrowUp', { orientation: 'horizontal', rtl: false })).toBeNull();
    expect(resolveNavigationIntent('Enter', { orientation: 'both', rtl: false })).toBeNull();
  });

  it('holds the edges without wrap and cycles with it', () => {
    const edges = { index: 3, length: 4 };
    expect(resolveNavigationTarget('next', { ...edges, wrap: false })).toBe(3);
    expect(resolveNavigationTarget('next', { ...edges, wrap: true })).toBe(0);
    expect(resolveNavigationTarget('previous', { index: 0, length: 4, wrap: false })).toBe(0);
    expect(resolveNavigationTarget('previous', { index: 0, length: 4, wrap: true })).toBe(3);
  });
});

describe('roving-focus kernel: tab model', () => {
  it('exposes exactly one tab stop, whatever the collection does', () => {
    const { rerender } = render(<Collection ids={ids} />);
    expect(tabStops()).toHaveLength(1);
    expect(tabStops()[0]).toHaveTextContent('a');

    fireEvent.keyDown(screen.getByTestId('a'), { key: 'ArrowDown' });
    expect(tabStops()).toHaveLength(1);
    expect(tabStops()[0]).toHaveTextContent('b');

    rerender(<Collection ids={ids} disabledIds={['a', 'b']} />);
    expect(tabStops()).toHaveLength(1);
  });

  it('gives no tab stop when every id is disabled', () => {
    render(<Collection ids={ids} disabledIds={ids} />);
    expect(tabStops()).toHaveLength(0);
  });

  it('moves the tab stop with focus without reporting navigation', () => {
    const onActiveChange = vi.fn();
    render(<Collection ids={ids} onActiveChange={onActiveChange} />);

    fireEvent.focus(screen.getByTestId('c'));
    expect(tabStops()[0]).toHaveTextContent('c');
    expect(onActiveChange).not.toHaveBeenCalled();
  });
});

describe('roving-focus kernel: navigation', () => {
  it('walks the vertical axis and wraps by default', () => {
    render(<Collection ids={ids} />);

    fireEvent.keyDown(screen.getByTestId('a'), { key: 'ArrowUp' });
    expect(screen.getByTestId('d')).toHaveFocus();

    fireEvent.keyDown(screen.getByTestId('d'), { key: 'ArrowDown' });
    expect(screen.getByTestId('a')).toHaveFocus();
  });

  it('holds the edges when wrap is off', () => {
    render(<Collection ids={ids} wrap={false} />);

    fireEvent.keyDown(screen.getByTestId('a'), { key: 'ArrowUp' });
    expect(tabStops()[0]).toHaveTextContent('a');

    fireEvent.keyDown(screen.getByTestId('a'), { key: 'End' });
    expect(screen.getByTestId('d')).toHaveFocus();
    fireEvent.keyDown(screen.getByTestId('d'), { key: 'ArrowDown' });
    expect(screen.getByTestId('d')).toHaveFocus();
  });

  it('jumps to the enabled edges with Home and End', () => {
    render(<Collection ids={ids} disabledIds={['a', 'd']} />);

    fireEvent.keyDown(screen.getByTestId('b'), { key: 'End' });
    expect(screen.getByTestId('c')).toHaveFocus();

    fireEvent.keyDown(screen.getByTestId('c'), { key: 'Home' });
    expect(screen.getByTestId('b')).toHaveFocus();
  });

  it('skips disabled ids in both directions', () => {
    render(<Collection ids={ids} disabledIds={['b', 'c']} />);

    fireEvent.keyDown(screen.getByTestId('a'), { key: 'ArrowDown' });
    expect(screen.getByTestId('d')).toHaveFocus();

    fireEvent.keyDown(screen.getByTestId('d'), { key: 'ArrowUp' });
    expect(screen.getByTestId('a')).toHaveFocus();
  });

  it('ignores keys off the declared axis', () => {
    render(<Collection ids={ids} orientation="vertical" />);

    const first = screen.getByTestId('a');
    const event = fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(event).toBe(true); // not prevented: the key stays with the family
    expect(tabStops()[0]).toHaveTextContent('a');
  });

  it('mirrors the horizontal axis under dir="rtl"', () => {
    const { unmount } = render(
      <div dir="ltr">
        <Collection ids={ids} orientation="horizontal" />
      </div>
    );

    fireEvent.keyDown(screen.getByTestId('a'), { key: 'ArrowRight' });
    expect(screen.getByTestId('b')).toHaveFocus();
    unmount();

    render(
      <div dir="rtl">
        <Collection ids={ids} orientation="horizontal" />
      </div>
    );

    fireEvent.keyDown(screen.getByTestId('a'), { key: 'ArrowRight' });
    expect(screen.getByTestId('d')).toHaveFocus();

    fireEvent.keyDown(screen.getByTestId('d'), { key: 'ArrowLeft' });
    expect(screen.getByTestId('a')).toHaveFocus();
  });

  it('lets an explicit rtl flag override the DOM probe', () => {
    render(
      <div dir="ltr">
        <Collection ids={ids} orientation="horizontal" rtl />
      </div>
    );

    fireEvent.keyDown(screen.getByTestId('a'), { key: 'ArrowRight' });
    expect(screen.getByTestId('d')).toHaveFocus();
  });
});

describe('roving-focus kernel: focus stability', () => {
  it('moves the tab stop to the nearest enabled neighbour when the active is disabled', () => {
    const { rerender } = render(<Collection ids={ids} />);

    fireEvent.focus(screen.getByTestId('c'));
    expect(tabStops()[0]).toHaveTextContent('c');

    rerender(<Collection ids={ids} disabledIds={['c']} />);
    expect(tabStops()).toHaveLength(1);
    expect(tabStops()[0]).toHaveTextContent('d');
  });

  it('keeps the tab stop beside the removed active id', () => {
    const { rerender } = render(<Collection ids={ids} />);

    fireEvent.focus(screen.getByTestId('d'));
    rerender(<Collection ids={['a', 'b', 'c']} />);

    expect(tabStops()).toHaveLength(1);
    expect(tabStops()[0]).toHaveTextContent('c');
  });

  it('anchors on the previous id, not on a position that now means another row', () => {
    // A collapsing branch removes several ids at once, so every index below it
    // shifts: position 2 was 'child-1' and is 'z' afterwards.
    const expanded = ['a', 'parent', 'child-1', 'child-2', 'z'];
    const { rerender } = render(<Collection ids={expanded} />);

    fireEvent.focus(screen.getByTestId('child-1'));
    rerender(<Collection ids={['a', 'parent', 'z']} />);

    expect(tabStops()[0]).toHaveTextContent('parent');
  });

  it('falls back to the first enabled id for a fresh collection', () => {
    render(<Collection ids={ids} disabledIds={['a', 'b']} />);
    expect(tabStops()[0]).toHaveTextContent('c');
  });
});

describe('roving-focus kernel: controlled active', () => {
  it('follows the owner and reports navigation without storing it', () => {
    const onActiveChange = vi.fn();
    const { rerender } = render(
      <Collection ids={ids} activeId="b" onActiveChange={onActiveChange} />
    );
    expect(tabStops()[0]).toHaveTextContent('b');

    fireEvent.keyDown(screen.getByTestId('b'), { key: 'ArrowDown' });
    expect(onActiveChange).toHaveBeenCalledWith('c');
    // The owner has not published the change yet: the tab stop must not drift.
    expect(tabStops()[0]).toHaveTextContent('b');

    rerender(<Collection ids={ids} activeId="c" onActiveChange={onActiveChange} />);
    expect(tabStops()[0]).toHaveTextContent('c');
  });

  it('resolves a disabled controlled id to the first enabled one', () => {
    render(<Collection ids={ids} activeId="b" disabledIds={['b']} />);
    expect(tabStops()[0]).toHaveTextContent('a');
  });
});
