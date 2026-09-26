import React, { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  useDragSession,
  type DragPreview,
  type DragSession,
  type PointerTargetResolver,
  type SortableAnnounceEvent,
  type UseDragSessionResult,
} from '../index';

type Key = { key: string };
type Api = UseDragSessionResult<Key, Key>;

interface HarnessProps {
  readonly onDrop?: (payload: Key, target: Key) => void;
  readonly onCancel?: (payload: Key) => void;
  readonly onDragStarted?: (payload: Key) => void;
  readonly onAnnounce?: (event: SortableAnnounceEvent<Key, Key>) => void;
  readonly resolve?: PointerTargetResolver<Key, Key>;
  readonly activationDistance?: number;
  readonly disabled?: boolean;
  readonly withPointer?: boolean;
  readonly eligible?: boolean;
  readonly observe?: (api: Api) => void;
}

/** Slots every 100px along x: the point's slot is the target, off the row is none. */
const byColumn: PointerTargetResolver<Key, Key> = ({ point }) =>
  point.y < 0 || point.y > 100 ? null : { key: `slot-${Math.floor(point.x / 100)}` };

function Harness({
  onDrop = () => {},
  onCancel,
  onDragStarted,
  onAnnounce,
  resolve = byColumn,
  activationDistance,
  disabled,
  withPointer = true,
  eligible,
  observe,
}: HarnessProps) {
  const api = useDragSession<Key, Key>({
    onDrop,
    onCancel,
    onDragStarted,
    onAnnounce,
    disabled,
    pointer: withPointer ? { resolvePointerTarget: resolve, activationDistance } : undefined,
  });
  observe?.(api);
  return (
    <button type="button" data-testid="handle" {...api.getPointerSourceProps({ key: 'a' }, { eligible })}>
      a
    </button>
  );
}

const handle = () => screen.getByTestId('handle');
const down = (x = 50, y = 50, pointerId = 1) => fireEvent.pointerDown(handle(), { pointerId, clientX: x, clientY: y });
const move = (x: number, y = 50, pointerId = 1) => fireEvent.pointerMove(window, { pointerId, clientX: x, clientY: y });
const up = (x: number, y = 50, pointerId = 1) => fireEvent.pointerUp(window, { pointerId, clientX: x, clientY: y });

describe('pointer transport: opt-in, never a change to the HTML5 contract', () => {
  it('without the pointer option the bag is empty, and so is an ineligible or disabled source', () => {
    const cases: HarnessProps[] = [{ withPointer: false }, { eligible: false }, { disabled: true }];
    for (const props of cases) {
      let api!: Api;
      const { unmount } = render(<Harness {...props} observe={(next) => (api = next)} />);
      expect(api.getPointerSourceProps({ key: 'a' }, { eligible: props.eligible })).toEqual({});
      unmount();
    }
    let live!: Api;
    render(<Harness observe={(next) => (live = next)} />);
    expect(Object.keys(live.getPointerSourceProps({ key: 'a' }))).toEqual(['onPointerDown']);
  });

  it('the HTML5 source bag is untouched by the pointer option', () => {
    let api!: Api;
    render(<Harness observe={(next) => (api = next)} />);
    expect(Object.keys(api.getSourceProps({ key: 'a' })).sort()).toEqual(['draggable', 'onDragEnd', 'onDragStart']);
    expect(api.preview).toBeNull();
  });
});

describe('pointer transport: activation distance', () => {
  it('a press is not a drag until the pointer travels the default 6px', () => {
    let api!: Api;
    const onDragStarted = vi.fn();
    render(<Harness onDragStarted={onDragStarted} observe={(next) => (api = next)} />);

    down(50, 50);
    move(53, 54);
    expect(api.session).toBeNull();
    expect(api.preview).toBeNull();
    expect(onDragStarted).not.toHaveBeenCalled();

    move(54, 55);
    expect(api.session).toEqual<DragSession<Key, Key>>({
      payload: { key: 'a' },
      target: { key: 'slot-0' },
      origin: 'pointer',
      phase: 'dragging',
    });
    expect(onDragStarted).toHaveBeenCalledWith({ key: 'a' });
  });

  it('a release before activation is a click: no commit, no cancel, no announcement', () => {
    const onDrop = vi.fn();
    const onCancel = vi.fn();
    const onAnnounce = vi.fn();
    render(<Harness onDrop={onDrop} onCancel={onCancel} onAnnounce={onAnnounce} />);

    down(50, 50);
    move(52, 52);
    up(52, 52);

    expect(onDrop).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
    expect(onAnnounce).not.toHaveBeenCalled();
  });

  it('honours a declared activation distance', () => {
    let api!: Api;
    render(<Harness activationDistance={20} observe={(next) => (api = next)} />);
    down(0, 50);
    move(19, 50);
    expect(api.session).toBeNull();
    move(20, 50);
    expect(api.session?.origin).toBe('pointer');
  });
});

describe('pointer transport: the preview a ghost is painted from', () => {
  it('follows source, target and delta, and clears at release', () => {
    let api!: Api;
    const previews: (DragPreview<Key, Key> | null)[] = [];
    render(<Harness observe={(next) => { api = next; previews.push(next.preview); }} />);

    down(50, 50);
    move(60, 50);
    expect(api.preview).toEqual({ payload: { key: 'a' }, target: { key: 'slot-0' }, delta: { x: 10, y: 0 } });
    move(250, 70);
    expect(api.preview).toEqual({ payload: { key: 'a' }, target: { key: 'slot-2' }, delta: { x: 200, y: 20 } });
    move(250, 300);
    expect(api.preview).toEqual({ payload: { key: 'a' }, target: null, delta: { x: 200, y: 250 } });
    up(250, 70);
    expect(api.preview).toBeNull();
    expect(previews[0]).toBeNull();
  });
});

describe('pointer transport: the terminal sequence', () => {
  it('commits the destination resolved at the release point, once, through onDrop', () => {
    const onDrop = vi.fn();
    const onAnnounce = vi.fn();
    const resolve = vi.fn(byColumn);
    let api!: Api;
    render(<Harness onDrop={onDrop} onAnnounce={onAnnounce} resolve={resolve} observe={(next) => (api = next)} />);

    down(50, 50);
    move(150, 50);
    up(350, 50);
    up(350, 50);

    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onDrop).toHaveBeenCalledWith({ key: 'a' }, { key: 'slot-3' });
    expect(resolve).toHaveBeenLastCalledWith({
      phase: 'drop',
      payload: { key: 'a' },
      point: { x: 350, y: 50 },
      delta: { x: 300, y: 0 },
      current: { key: 'slot-1' },
    });
    expect(onAnnounce.mock.calls.map(([event]) => `${event.kind}:${event.origin}`)).toEqual(['dropped:pointer']);
    expect(api.session).toBeNull();
  });

  it('a release with no destination is refused and announced as blocked', () => {
    const onDrop = vi.fn();
    const onAnnounce = vi.fn();
    render(<Harness onDrop={onDrop} onAnnounce={onAnnounce} />);

    down(50, 50);
    move(150, 50);
    up(150, 400);

    expect(onDrop).not.toHaveBeenCalled();
    expect(onAnnounce).toHaveBeenCalledWith({
      kind: 'blocked',
      origin: 'pointer',
      payload: { key: 'a' },
      reason: 'no-destination',
    });
  });

  it('ignores another pointer', () => {
    let api!: Api;
    const onDrop = vi.fn();
    render(<Harness onDrop={onDrop} observe={(next) => (api = next)} />);

    down(50, 50, 1);
    move(250, 50, 2);
    expect(api.session).toBeNull();
    move(150, 50, 1);
    up(250, 50, 2);
    expect(onDrop).not.toHaveBeenCalled();
    expect(api.session?.target).toEqual({ key: 'slot-1' });
  });

  it('a second press during a live drag opens nothing', () => {
    const onDragStarted = vi.fn();
    render(<Harness onDragStarted={onDragStarted} />);
    down(50, 50);
    move(150, 50);
    down(150, 50, 2);
    move(250, 50, 2);
    expect(onDragStarted).toHaveBeenCalledTimes(1);
  });
});

describe('pointer transport: cancellation', () => {
  it('Escape cancels an activated drag: onCancel, one cancelled announcement, nothing committed', () => {
    const onDrop = vi.fn();
    const onCancel = vi.fn();
    const onAnnounce = vi.fn();
    let api!: Api;
    render(<Harness onDrop={onDrop} onCancel={onCancel} onAnnounce={onAnnounce} observe={(next) => (api = next)} />);

    down(50, 50);
    move(150, 50);
    const escape = fireEvent.keyDown(window, { key: 'Escape' });
    up(150, 50);

    expect(escape).toBe(false);
    expect(onCancel).toHaveBeenCalledWith({ key: 'a' });
    expect(onDrop).not.toHaveBeenCalled();
    expect(onAnnounce.mock.calls.map(([event]) => `${event.kind}:${event.origin}`)).toEqual(['cancelled:pointer']);
    expect(api.session).toBeNull();
    expect(api.preview).toBeNull();
  });

  it('pointercancel is the same cancellation', () => {
    const onCancel = vi.fn();
    render(<Harness onCancel={onCancel} />);
    down(50, 50);
    move(150, 50);
    fireEvent.pointerCancel(window, { pointerId: 1 });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('Escape before activation ends the press silently, and other keys do nothing', () => {
    const onCancel = vi.fn();
    const onDrop = vi.fn();
    render(<Harness onCancel={onCancel} onDrop={onDrop} />);
    down(50, 50);
    fireEvent.keyDown(window, { key: 'Enter' });
    fireEvent.keyDown(window, { key: 'Escape' });
    move(250, 50);
    up(250, 50);
    expect(onCancel).not.toHaveBeenCalled();
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('disabling mid-drag closes the session and detaches the window listeners', () => {
    const onDrop = vi.fn();
    const onCancel = vi.fn();
    function Toggle() {
      const [disabled, setDisabled] = useState(false);
      return (
        <>
          <Harness disabled={disabled} onDrop={onDrop} onCancel={onCancel} />
          <button type="button" data-testid="off" onClick={() => setDisabled(true)} />
        </>
      );
    }
    render(<Toggle />);
    down(50, 50);
    move(150, 50);
    fireEvent.click(screen.getByTestId('off'));
    up(250, 50);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('unmounting mid-drag removes every window listener, so a later release reaches nothing', () => {
    const onDrop = vi.fn();
    const onCancel = vi.fn();
    const spy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<Harness onDrop={onDrop} onCancel={onCancel} />);
    down(50, 50);
    move(150, 50);
    spy.mockClear();
    act(() => unmount());
    const removed = spy.mock.calls.map(([type]) => String(type));
    spy.mockRestore();
    up(250, 50);

    expect(removed.filter((type) => ['pointermove', 'pointerup', 'pointercancel', 'keydown'].includes(type)).sort()).toEqual(
      ['keydown', 'pointercancel', 'pointermove', 'pointerup']
    );
    expect(onDrop).not.toHaveBeenCalled();
  });
});
