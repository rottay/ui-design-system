import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useFileDropZone, type UseFileDropZoneOptions } from '../index';

function fileStore(files: File[]) {
  return { files, types: files.length > 0 ? ['Files'] : [] };
}

type ZoneEvent = 'dragOver' | 'dragLeave' | 'drop';

const ZONE_EVENTS = {
  dragOver: createEvent.dragOver,
  dragLeave: createEvent.dragLeave,
  drop: createEvent.drop,
} as const;

function fire(
  node: Element,
  type: ZoneEvent,
  init: { files?: File[]; relatedTarget?: EventTarget | null } = {}
) {
  const event = ZONE_EVENTS[type](node);
  Object.defineProperty(event, 'dataTransfer', {
    value: fileStore(init.files ?? []),
    configurable: true,
  });
  Object.defineProperty(event, 'relatedTarget', {
    value: init.relatedTarget ?? null,
    configurable: true,
  });
  fireEvent(node, event);
  return event;
}

function Zone(props: UseFileDropZoneOptions) {
  const zone = useFileDropZone(props);
  return (
    <div data-testid="zone" data-drag-over={zone.isDragOver} {...zone.dropZoneProps}>
      <span data-testid="child" />
    </div>
  );
}

const zone = () => screen.getByTestId('zone');
const hovering = () => zone().getAttribute('data-drag-over') === 'true';
const file = (name: string) => new File(['x'], name, { type: 'text/plain' });

describe('file drop zone kernel', () => {
  it('the dragover handler cancels the event and raises the hover state', () => {
    render(<Zone onFiles={() => {}} />);

    const event = fire(zone(), 'dragOver');

    expect(event.defaultPrevented).toBe(true);
    expect(hovering()).toBe(true);
  });

  it('a dragleave into a descendant is not an exit', () => {
    render(<Zone onFiles={() => {}} />);
    fire(zone(), 'dragOver');

    fire(zone(), 'dragLeave', { relatedTarget: screen.getByTestId('child') });

    expect(hovering()).toBe(true);
  });

  it('a dragleave outside the zone, or out of the window, IS an exit', () => {
    render(<Zone onFiles={() => {}} />);

    fire(zone(), 'dragOver');
    fire(zone(), 'dragLeave', { relatedTarget: document.body });
    expect(hovering()).toBe(false);

    fire(zone(), 'dragOver');
    fire(zone(), 'dragLeave', { relatedTarget: null });
    expect(hovering()).toBe(false);
  });

  it('the drop order is prevent, clear, raw event, files', () => {
    const order: string[] = [];
    const dropped = [file('one.txt'), file('two.txt')];
    render(
      <Zone
        onDropEvent={() => order.push('event')}
        onFiles={(files) => order.push(`files:${files.map((entry) => entry.name).join(',')}`)}
      />
    );
    fire(zone(), 'dragOver');

    const event = fire(zone(), 'drop', { files: dropped });

    expect(event.defaultPrevented).toBe(true);
    expect(hovering()).toBe(false);
    expect(order).toEqual(['event', 'files:one.txt,two.txt']);
  });

  it('onFiles is called unconditionally, so each consumer keeps its own guard', () => {
    const onFiles = vi.fn();
    render(<Zone onFiles={onFiles} />);

    fire(zone(), 'drop', { files: [] });

    expect(onFiles).toHaveBeenCalledTimes(1);
    expect(onFiles).toHaveBeenCalledWith([]);
  });

  it('a disabled zone cancels the drop before clearing its hover state', () => {
    const onFiles = vi.fn();
    const onDropEvent = vi.fn();
    const view = render(<Zone onFiles={onFiles} />);
    fire(zone(), 'dragOver');
    expect(hovering()).toBe(true);

    view.rerender(<Zone onFiles={onFiles} onDropEvent={onDropEvent} disabled />);
    const event = fire(zone(), 'drop', { files: [file('one.txt')] });

    expect(event.defaultPrevented).toBe(true);
    expect(onFiles).not.toHaveBeenCalled();
    expect(onDropEvent).not.toHaveBeenCalled();
    expect(hovering()).toBe(true);
  });

  it('a disabled zone still cancels dragover, and raises no hover state', () => {
    render(<Zone onFiles={() => {}} disabled />);

    const event = fire(zone(), 'dragOver');
    fire(zone(), 'dragLeave', { relatedTarget: null });

    expect(event.defaultPrevented).toBe(true);
    expect(hovering()).toBe(false);
  });

  it('the file list passes through untouched, so the hook identifies nothing', () => {
    const dropped = [file('one.txt')];
    const seen: File[][] = [];
    render(<Zone onFiles={(files) => seen.push(files)} />);

    fire(zone(), 'drop', { files: dropped });

    expect(seen[0][0]).toBe(dropped[0]);
  });
});
