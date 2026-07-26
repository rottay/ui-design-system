import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ResizeHandle } from '..';
import type { ResizeHandleIntent } from '../contracts';

function intents(
  keys: string[],
  props: Partial<React.ComponentProps<typeof ResizeHandle>> = {},
  wrapper?: { dir: 'ltr' | 'rtl' }
): (ResizeHandleIntent | null)[] {
  const recorded: (ResizeHandleIntent | null)[] = [];
  const onAdjust = vi.fn((intent: ResizeHandleIntent) => recorded.push(intent));
  const handle = (
    <ResizeHandle
      orientation="vertical"
      label="Resize"
      min={0}
      max={100}
      value={50}
      onAdjust={onAdjust}
      {...props}
    />
  );
  // Scoped to this render's own container: the helper mounts several handles
  // per test and a document-wide role query would find all of them.
  const { container } = render(
    wrapper ? <div dir={wrapper.dir}>{handle}</div> : handle
  );
  const node = container.querySelector('[role="separator"]') as HTMLElement;
  for (const key of keys) {
    const before = onAdjust.mock.calls.length;
    fireEvent.keyDown(node, { key });
    if (onAdjust.mock.calls.length === before) recorded.push(null);
  }
  return recorded;
}

describe('ResizeHandle', () => {
  it('is an adjustable separator, not a button or a slider', () => {
    const { getByRole } = render(
      <ResizeHandle
        orientation="horizontal"
        label="Resize height"
        min={180}
        max={960}
        value={240}
        valueText="240 px"
        keyShortcuts="ArrowUp ArrowDown"
        className="skin-owned"
        anatomy={{ 'data-part': 'resize-handle', 'data-edge': 'block-end' }}
      />
    );

    const node = getByRole('separator', { name: 'Resize height' });
    expect(node.tagName).toBe('DIV');
    expect(node).toHaveAttribute('aria-orientation', 'horizontal');
    expect(node).toHaveAttribute('aria-valuemin', '180');
    expect(node).toHaveAttribute('aria-valuemax', '960');
    expect(node).toHaveAttribute('aria-valuenow', '240');
    expect(node).toHaveAttribute('aria-valuetext', '240 px');
    expect(node).toHaveAttribute('aria-keyshortcuts', 'ArrowUp ArrowDown');
    expect(node).toHaveAttribute('data-part', 'resize-handle');
    expect(node).toHaveAttribute('data-edge', 'block-end');
    expect(node.className).toBe('skin-owned');
    expect(node.tabIndex).toBe(0);
  });

  it('keeps a pointer-only handle out of the accessibility tree', () => {
    const onPointerDown = vi.fn();
    const { container } = render(
      <ResizeHandle
        orientation="horizontal"
        operable={false}
        label="Resize"
        onPointerDown={onPointerDown}
        anatomy={{ 'data-part': 'resize-handle' }}
      />
    );

    const node = container.querySelector<HTMLElement>('[data-part="resize-handle"]');
    expect(node).not.toBeNull();
    expect(node).toHaveAttribute('aria-hidden', 'true');
    expect(node).not.toHaveAttribute('role');
    expect(node?.tabIndex).toBe(-1);

    fireEvent.pointerDown(node as HTMLElement, { pointerId: 3 });
    expect(onPointerDown).toHaveBeenCalledTimes(1);
  });

  it('never adjusts through the keyboard when it is not operable', () => {
    const onAdjust = vi.fn();
    const { container } = render(
      <ResizeHandle
        orientation="vertical"
        operable={false}
        onAdjust={onAdjust}
        anatomy={{ 'data-part': 'resize-handle' }}
      />
    );

    fireEvent.keyDown(
      container.querySelector('[data-part="resize-handle"]') as HTMLElement,
      { key: 'ArrowRight' }
    );
    expect(onAdjust).not.toHaveBeenCalled();
  });

  it('reads a size handle as forward-or-up means more, on either axis', () => {
    expect(
      intents(['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'Home', 'End'])
    ).toEqual([
      'increase',
      'increase',
      'decrease',
      'decrease',
      'minimize',
      'maximize',
    ]);
  });

  it('restricts a position handle to the separator own axis', () => {
    expect(
      intents(['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'], {
        arrows: 'position',
      })
    ).toEqual(['increase', 'decrease', null, null]);

    expect(
      intents(['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'], {
        arrows: 'position',
        orientation: 'horizontal',
      })
    ).toEqual(['increase', 'decrease', null, null]);
  });

  it('mirrors the inline arrows in RTL so the keyboard agrees with the pointer', () => {
    expect(intents(['ArrowLeft', 'ArrowRight'], {}, { dir: 'rtl' })).toEqual([
      'increase',
      'decrease',
    ]);
    expect(
      intents(['ArrowLeft', 'ArrowRight'], { arrows: 'position' }, { dir: 'rtl' })
    ).toEqual(['increase', 'decrease']);
  });

  it('leaves unrelated keys to the page', () => {
    const onAdjust = vi.fn();
    const { getByRole } = render(
      <ResizeHandle orientation="vertical" label="Resize" onAdjust={onAdjust} />
    );
    const node = getByRole('separator');
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    fireEvent(node, event);

    expect(onAdjust).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });
});
