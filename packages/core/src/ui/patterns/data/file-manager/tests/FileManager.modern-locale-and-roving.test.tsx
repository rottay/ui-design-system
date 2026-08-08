import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';

import type { FileManagerProps } from '../contracts';
import ModernFileManager from '../engines/modern';

function createProps(overrides: Partial<FileManagerProps> = {}): FileManagerProps {
  return {
    files: [
      { id: 'f1', name: 'report.pdf', type: 'file', mimeType: 'application/pdf', size: 4096, modifiedAt: '2026-03-15T10:00:00.000Z' },
      { id: 'f2', name: 'photo.jpg', type: 'file', mimeType: 'image/jpeg', size: 512 },
    ],
    folders: [{ id: 'd1', name: 'Documents', type: 'folder' }],
    ...overrides,
  };
}

const cells = (container: HTMLElement, part: string) =>
  Array.from(container.querySelectorAll<HTMLElement>(`[data-part="${part}"]`)).map(
    (node) => node.textContent
  );

describe('ModernFileManager metadata resilience', () => {
  it('renders an em-dash placeholder instead of the literal "Invalid Date"', () => {
    const { container } = render(
      <ModernFileManager
        {...createProps({
          files: [
            {
              id: 'f1',
              name: 'broken.txt',
              type: 'file',
              mimeType: 'text/plain',
              size: 10,
              modifiedAt: 'not-a-real-date',
            },
          ],
          folders: [],
        })}
      />
    );

    const dates = cells(container, 'date-cell');
    // An unparseable date must render the placeholder, not the literal string
    // `Date.toLocaleDateString()` produces for an invalid Date.
    expect(dates).not.toContain('Invalid Date');
    expect(dates).toContain('--');
  });

  it('keeps a missing size and a missing date on the same placeholder', () => {
    const { container } = render(
      <ModernFileManager
        {...createProps({
          files: [{ id: 'f1', name: 'unknown.bin', type: 'file' }],
          folders: [],
        })}
      />
    );

    expect(cells(container, 'size-cell')).toEqual(['--']);
    expect(cells(container, 'date-cell')).toEqual(['--']);
  });

  it('rejects a negative byte count rather than formatting it', () => {
    const { container } = render(
      <ModernFileManager
        {...createProps({
          files: [{ id: 'f1', name: 'weird.bin', type: 'file', size: -1 }],
          folders: [],
        })}
      />
    );

    expect(cells(container, 'size-cell')).toEqual(['--']);
  });

  it('formats a byte count through the governed locale-aware formatter', () => {
    const { container } = render(
      <ModernFileManager {...createProps({ folders: [] })} />
    );

    const sizes = cells(container, 'size-cell');
    // 4096 bytes must format as a locale-aware KiB size, not a fixed English
    // decimal mark regardless of locale.
    expect(sizes[0]).toMatch(/KB$/);
    expect(sizes[1]).toBe('512 Bytes');
  });
});

describe('ModernFileManager grid roving tab stop', () => {
  const gridCards = (container: HTMLElement) =>
    Array.from(container.querySelectorAll<HTMLElement>('[data-part="grid-card"]'));

  it('exposes exactly one tab stop for the whole grid', () => {
    const { container } = render(
      <ModernFileManager {...createProps({ viewMode: 'grid' })} />
    );

    const cards = gridCards(container);
    expect(cards).toHaveLength(3);
    // A grid of N items must expose exactly one tab stop; N focusable cards
    // would cost N Tab presses to step over.
    expect(cards.filter((card) => card.tabIndex === 0)).toHaveLength(1);
    expect(cards[0].tabIndex).toBe(0);
    expect(cards.slice(1).every((card) => card.tabIndex === -1)).toBe(true);
  });

  it('walks the grid with ArrowRight/ArrowLeft and moves the tab stop', () => {
    const { container } = render(
      <ModernFileManager {...createProps({ viewMode: 'grid' })} />
    );

    const cards = gridCards(container);
    act(() => cards[0].focus());
    fireEvent.keyDown(cards[0], { key: 'ArrowRight' });

    expect(gridCards(container)[1]).toHaveFocus();
    expect(gridCards(container)[1].tabIndex).toBe(0);
    expect(gridCards(container)[0].tabIndex).toBe(-1);

    fireEvent.keyDown(gridCards(container)[1], { key: 'ArrowLeft' });
    expect(gridCards(container)[0]).toHaveFocus();
  });

  it('jumps to the edges with Home and End', () => {
    const { container } = render(
      <ModernFileManager {...createProps({ viewMode: 'grid' })} />
    );

    const cards = gridCards(container);
    act(() => cards[0].focus());
    fireEvent.keyDown(cards[0], { key: 'End' });
    expect(gridCards(container)[2]).toHaveFocus();

    fireEvent.keyDown(gridCards(container)[2], { key: 'Home' });
    expect(gridCards(container)[0]).toHaveFocus();
  });

  it('stops at the edges instead of wrapping', () => {
    const { container } = render(
      <ModernFileManager {...createProps({ viewMode: 'grid' })} />
    );

    const cards = gridCards(container);
    act(() => cards[0].focus());
    fireEvent.keyDown(cards[0], { key: 'ArrowLeft' });
    expect(gridCards(container)[0]).toHaveFocus();

    act(() => gridCards(container)[2].focus());
    fireEvent.keyDown(gridCards(container)[2], { key: 'ArrowRight' });
    expect(gridCards(container)[2]).toHaveFocus();
  });

  it('still activates the focused card with Enter and Space', () => {
    const onNavigate = vi.fn();
    const onSelectionChange = vi.fn();
    const { container } = render(
      <ModernFileManager
        {...createProps({ viewMode: 'grid', onNavigate, onSelectionChange })}
      />
    );

    const cards = gridCards(container);
    fireEvent.keyDown(cards[0], { key: 'Enter' });
    expect(onNavigate).toHaveBeenCalledWith('d1');

    fireEvent.keyDown(cards[1], { key: ' ' });
    expect(onSelectionChange).toHaveBeenCalledWith(['f1']);
  });
});

describe('ModernFileManager standalone copy floors', () => {
  it('fills placeholders in the floor when no i18n provider is mounted', () => {
    render(<ModernFileManager {...createProps({ onSelectionChange: vi.fn() })} />);

    // A missing i18n provider must still fill the floor template, not
    // announce the raw "Select {name}" placeholder to assistive tech.
    expect(screen.getByLabelText('Select Documents')).toBeInTheDocument();
    expect(screen.getByLabelText('Select report.pdf')).toBeInTheDocument();
    expect(screen.queryByLabelText('Select {name}')).toBeNull();
  });

  it('fills the bulk-delete count floor standalone', () => {
    render(
      <ModernFileManager
        {...createProps({ onDelete: vi.fn(), selectedItems: ['f1', 'f2'] })}
      />
    );

    expect(screen.getByText('Delete (2)')).toBeInTheDocument();
    expect(screen.queryByText('Delete ({count})')).toBeNull();
  });
});

describe('ModernFileManager root paint ownership', () => {
  it('leaves background/border-radius/box-shadow to the skin', () => {
    const { container } = render(<ModernFileManager {...createProps()} />);

    const root = container.querySelector<HTMLElement>('[data-part="root"]')!;
    // The engine must not paint background/border-radius/box-shadow inline —
    // that would outrank both a caller `style` and the skin's forced-colors block.
    expect(root.style.background).toBe('');
    expect(root.style.borderRadius).toBe('');
    expect(root.style.boxShadow).toBe('');
  });

  it('no longer overrides a caller-supplied surface style', () => {
    const { container } = render(
      <ModernFileManager
        {...createProps()}
        style={{ background: 'rgb(1, 2, 3)', borderRadius: '2px' }}
      />
    );

    const root = container.querySelector<HTMLElement>('[data-part="root"]')!;
    // A caller-supplied style must win outright; spreading it before engine
    // overrides would clobber exactly the keys the caller set.
    expect(root.style.background).toBe('rgb(1, 2, 3)');
    expect(root.style.borderRadius).toBe('2px');
  });

  it('keeps the loaded/loading roots on the same data-loading channel', () => {
    const { container, rerender } = render(<ModernFileManager {...createProps()} />);
    expect(
      container.querySelector('[data-part="root"]')?.getAttribute('data-loading')
    ).toBe('false');

    rerender(<ModernFileManager {...createProps({ loading: true })} />);
    expect(
      container.querySelector('[data-part="root"]')?.getAttribute('data-loading')
    ).toBe('true');
  });
});

describe('ModernFileManager selection affordance', () => {
  it('disables the row checkbox when no selection handler can receive it', () => {
    render(<ModernFileManager {...createProps()} />);

    const boxes = screen.getAllByRole('checkbox');
    expect(boxes.length).toBeGreaterThan(0);
    // Without a selection handler, the checkbox must render disabled rather
    // than silently swallow clicks.
    for (const box of boxes) expect(box).toBeDisabled();
  });

  it('leaves the checkbox live once a selection handler arrives', () => {
    const onSelectionChange = vi.fn();
    render(<ModernFileManager {...createProps({ onSelectionChange })} />);

    const boxes = screen.getAllByRole('checkbox');
    for (const box of boxes) expect(box).not.toBeDisabled();

    fireEvent.click(boxes[0]);
    expect(onSelectionChange).toHaveBeenCalledWith(['d1']);
  });
});
