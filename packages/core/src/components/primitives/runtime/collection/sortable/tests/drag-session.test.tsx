import React, { useState } from 'react';
import { act, createEvent, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  useDragSession,
  type DragSession,
  type MoveIntent,
  type SortableAnnounceEvent,
  type SortableSourceProps,
  type SortableTargetProps,
  type TargetResolver,
  type UseDragSessionResult,
} from '../index';

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------

type Key = { key: string };
type Announce = SortableAnnounceEvent<Key, Key>;
type Api = UseDragSessionResult<Key, Key>;

/**
 * A drag data store stub. `getData` answers the empty string while the store
 * is in protected mode, which is what a real `dragover` does; the tests that
 * care set `protectedMode` themselves.
 */
function transfer(seed: Record<string, string> = {}) {
  const data = new Map<string, string>(Object.entries(seed));
  return {
    effectAllowed: 'uninitialized',
    dropEffect: 'none',
    get types() {
      return [...data.keys()];
    },
    setData(format: string, value: string) {
      data.set(format, value);
    },
    getData(format: string) {
      return data.get(format) ?? '';
    },
  };
}

type DragInit = { dataTransfer?: unknown; clientY?: number; cancelable?: boolean };

const DRAG_EVENTS = {
  dragStart: createEvent.dragStart,
  dragOver: createEvent.dragOver,
  drop: createEvent.drop,
  dragEnd: createEvent.dragEnd,
} as const;

/**
 * Fires a drag event carrying a data store, and returns the event fired. The
 * store is defined on the event rather than passed through the event init,
 * which the DOM implementation would copy onto a real `DataTransfer`.
 */
function fire(node: Element, type: keyof typeof DRAG_EVENTS, init: DragInit = {}) {
  const { dataTransfer = transfer(), ...rest } = init;
  const event = DRAG_EVENTS[type](node, rest as never);
  Object.defineProperty(event, 'dataTransfer', { value: dataTransfer, configurable: true });
  fireEvent(node, event);
  return event;
}

interface ListProps {
  items: string[];
  expose?: (api: Api) => void;
  onDrop?: (payload: Key, target: Key) => void;
  onCancel?: (payload: Key) => void;
  onDragStarted?: (payload: Key) => void;
  onAnnounce?: (event: Announce) => void;
  pressCancel?: (event: React.PointerEvent) => void;
  resolveTarget?: TargetResolver<Key, Key, Key>;
  keyboard?: Parameters<typeof useDragSession<Key, Key>>[0]['keyboard'];
  disabled?: boolean;
  sourceEligible?: (key: string) => boolean | undefined;
  targetEligible?: (key: string) => boolean | undefined;
}

/** One element is both the source and the target, which is the common shape. */
function List(props: ListProps) {
  const drag = useDragSession<Key, Key>({
    disabled: props.disabled,
    onDrop: (payload, target) => props.onDrop?.(payload, target),
    onCancel: props.onCancel,
    onDragStarted: props.onDragStarted,
    onAnnounce: props.onAnnounce,
    pressCancel: props.pressCancel,
    resolveTarget: props.resolveTarget,
    keyboard: props.keyboard,
  });
  props.expose?.(drag);

  return (
    <ul>
      {props.items.map((key) => (
        <li
          key={key}
          data-testid={key}
          tabIndex={0}
          ref={drag.registerItem(key)}
          data-dragging={drag.session?.payload.key === key}
          data-drop-target={drag.session?.target?.key === key}
          {...drag.getSourceProps({ key }, { eligible: props.sourceEligible?.(key) })}
          {...drag.getTargetProps({ key }, { eligible: props.targetEligible?.(key) })}
        />
      ))}
    </ul>
  );
}

function listApi() {
  const api: { current: Api | null } = { current: null };
  return {
    api,
    expose: (value: Api) => {
      api.current = value;
    },
  };
}

const item = (key: string) => screen.getByTestId(key);
const holds = (key: string) => item(key).getAttribute('data-drop-target') === 'true';

/** Hold the indicator on a self-hover, refuse the commit on a self-drop. */
const holdAndRefuse: TargetResolver<Key, Key, Key> = ({ phase, payload, target, current }) =>
  target.key === payload.key ? (phase === 'hover' ? current : null) : target;

// ---------------------------------------------------------------------------
// The transport laws
// ---------------------------------------------------------------------------

describe('drag-session kernel: the transport laws', () => {
  it('the dragover handler cancels the event', () => {
    render(<List items={['a', 'b']} />);

    const event = fire(item('b'), 'dragOver');

    expect(event.defaultPrevented).toBe(true);
  });

  it('the dragover handler negotiates the move operation', () => {
    render(<List items={['a', 'b']} />);
    const store = transfer();

    fire(item('b'), 'dragOver', { dataTransfer: store });

    expect(store.dropEffect).toBe('move');
  });

  it('dragstart writes the drag data store and opens the session', () => {
    const onDragStarted = vi.fn();
    const store = transfer();
    render(<List items={['a', 'b']} onDragStarted={onDragStarted} />);

    fire(item('a'), 'dragStart', { dataTransfer: store });

    expect(store.effectAllowed).toBe('move');
    expect(store.getData('text/plain')).toBe('a');
    expect(onDragStarted).toHaveBeenCalledWith({ key: 'a' });
    expect(item('a').getAttribute('data-dragging')).toBe('true');
  });

  it('an aborted drag leaves no session and no stamp', () => {
    const onCancel = vi.fn();
    const onDrop = vi.fn();
    render(<List items={['a', 'b']} onCancel={onCancel} onDrop={onDrop} />);

    fire(item('a'), 'dragStart');
    fire(item('b'), 'dragOver');
    expect(holds('b')).toBe(true);

    fire(item('a'), 'dragEnd');

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledWith({ key: 'a' });
    expect(holds('b')).toBe(false);
    expect(item('a').getAttribute('data-dragging')).toBe('false');
    fire(item('b'), 'drop');
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('leaving every target holds the destination until dragend', () => {
    const onCancel = vi.fn();
    render(<List items={['a', 'b']} onCancel={onCancel} />);

    fire(item('a'), 'dragStart');
    fire(item('b'), 'dragOver');
    // Dragging away fires nothing: no owner has an onDragLeave, so the last
    // destination is HELD.
    expect(holds('b')).toBe(true);

    fire(item('a'), 'dragEnd');

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(holds('b')).toBe(false);
  });

  it('a caller-prevented dragend still clears the session', () => {
    const onCancel = vi.fn();
    const onDrop = vi.fn();
    render(<List items={['a', 'b']} onCancel={onCancel} onDrop={onDrop} />);
    fire(item('a'), 'dragStart');
    fire(item('b'), 'dragOver');

    const end = createEvent.dragEnd(item('a'), { cancelable: true } as never);
    Object.defineProperty(end, 'dataTransfer', { value: transfer(), configurable: true });
    end.preventDefault();
    expect(end.defaultPrevented).toBe(true);
    fireEvent(item('a'), end);

    expect(onCancel).toHaveBeenCalledTimes(1);
    fire(item('b'), 'drop');
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('a caller-prevented drop still obeys the target guard', () => {
    const onDrop = vi.fn();
    render(<List items={['a', 'b']} onDrop={onDrop} resolveTarget={() => null} />);
    fire(item('a'), 'dragStart');

    const drop = createEvent.drop(item('b'), { cancelable: true } as never);
    Object.defineProperty(drop, 'dataTransfer', { value: transfer(), configurable: true });
    drop.preventDefault();
    fireEvent(item('b'), drop);

    expect(onDrop).not.toHaveBeenCalled();
  });

  it('a source with pressCancel is routed on dragEnd and pointerCancel', () => {
    const pressCancel = vi.fn();
    render(<List items={['a']} pressCancel={pressCancel} />);

    fire(item('a'), 'dragStart');
    fire(item('a'), 'dragEnd');
    expect(pressCancel).toHaveBeenCalledTimes(1);

    fireEvent.pointerCancel(item('a'));
    expect(pressCancel).toHaveBeenCalledTimes(2);
  });

  it('a source without pressCancel attaches no pointerCancel handler', () => {
    const bags: SortableSourceProps[] = [];
    function Probe() {
      const drag = useDragSession<Key, Key>({ onDrop: () => {} });
      bags.push(drag.getSourceProps({ key: 'a' }));
      return null;
    }
    render(<Probe />);

    expect(bags[0].onPointerCancel).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// The terminal sequence
// ---------------------------------------------------------------------------

describe('drag-session kernel: the terminal sequence', () => {
  it('a drop commits the receiving element, not the held indicator', () => {
    const onDrop = vi.fn();
    render(<List items={['a', 'b', 'c']} onDrop={onDrop} resolveTarget={holdAndRefuse} />);

    fire(item('a'), 'dragStart');
    fire(item('b'), 'dragOver');
    fire(item('c'), 'drop');

    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onDrop).toHaveBeenCalledWith({ key: 'a' }, { key: 'c' });
  });

  it('a re-hovered source is not committed as the destination', () => {
    // drag a -> hover b -> hover a -> DROP ON a. Every owner that refuses a
    // self-drop does nothing here; committing the held indicator would
    // reorder to [b,a,c].
    const onDrop = vi.fn();
    render(<List items={['a', 'b', 'c']} onDrop={onDrop} resolveTarget={holdAndRefuse} />);

    fire(item('a'), 'dragStart');
    fire(item('b'), 'dragOver');
    fire(item('a'), 'dragOver');
    expect(holds('b')).toBe(true);
    fire(item('a'), 'drop');

    expect(onDrop).not.toHaveBeenCalled();
  });

  it('a drop on a non-target is a no-op', () => {
    const onDrop = vi.fn();
    render(<List items={['a', 'b']} onDrop={onDrop} resolveTarget={() => null} />);

    fire(item('a'), 'dragStart');
    fire(item('b'), 'drop');

    expect(onDrop).not.toHaveBeenCalled();
  });

  it('a drop commits when the indicator is null and the receiving target resolves', () => {
    // Three of the four owners never read the hover stamp at drop time, so a
    // null indicator must not gate the commit.
    const onDrop = vi.fn();
    render(<List items={['a', 'b']} onDrop={onDrop} />);

    fire(item('a'), 'dragStart');
    fire(item('b'), 'drop');

    expect(onDrop).toHaveBeenCalledWith({ key: 'a' }, { key: 'b' });
  });

  it('a refused drop closes the session and the following dragend is a no-op', () => {
    const onCancel = vi.fn();
    const onAnnounce = vi.fn();
    const { api, expose } = listApi();
    render(
      <List
        items={['a', 'b']}
        expose={expose}
        onCancel={onCancel}
        onAnnounce={onAnnounce}
        resolveTarget={({ phase, target }) => (phase === 'drop' ? null : target)}
      />
    );

    fire(item('a'), 'dragStart');
    fire(item('b'), 'drop');

    expect(api.current?.session).toBeNull();
    expect(onAnnounce).toHaveBeenCalledTimes(1);
    expect(onAnnounce.mock.calls[0][0]).toMatchObject({ kind: 'blocked', reason: 'no-destination' });

    fire(item('a'), 'dragEnd');
    expect(onCancel).not.toHaveBeenCalled();
    expect(onAnnounce).toHaveBeenCalledTimes(1);
  });

  it('a drop on nested targets commits exactly once', () => {
    const onDrop = vi.fn();
    function Nested({ stopPropagation }: { stopPropagation: boolean }) {
      const drag = useDragSession<Key, Key>({ onDrop });
      return (
        <div data-testid="outer" {...drag.getTargetProps({ key: 'outer' })}>
          <div
            data-testid="source"
            {...drag.getSourceProps({ key: 'a' })}
            {...drag.getTargetProps({ key: 'inner' }, { stopPropagation })}
          />
        </div>
      );
    }

    for (const stopPropagation of [false, true]) {
      onDrop.mockClear();
      const view = render(<Nested stopPropagation={stopPropagation} />);
      fire(screen.getByTestId('source'), 'dragStart');
      fire(screen.getByTestId('source'), 'drop');

      expect(onDrop).toHaveBeenCalledTimes(1);
      expect(onDrop).toHaveBeenCalledWith({ key: 'a' }, { key: 'inner' });
      view.unmount();
    }
  });

  it('a re-entrant commit during onDrop commits exactly once', () => {
    const { api, expose } = listApi();
    const onDrop = vi.fn(() => {
      api.current?.commit({ key: 'c' });
    });
    render(<List items={['a', 'b', 'c']} expose={expose} onDrop={onDrop} />);

    fire(item('a'), 'dragStart');
    fire(item('b'), 'drop');

    expect(onDrop).toHaveBeenCalledTimes(1);
  });

  it('onDrop receives the payload and destination the session held at commit time', () => {
    const seen: Array<[Key, Key]> = [];
    render(
      <List
        items={['a', 'b']}
        onDrop={(payload, target) => {
          seen.push([payload, target]);
        }}
      />
    );

    fire(item('a'), 'dragStart');
    fire(item('b'), 'drop');

    expect(seen).toEqual([[{ key: 'a' }, { key: 'b' }]]);
  });

  it('a throwing onDrop leaves no half-open session', () => {
    // The reservation runs BEFORE the consumer call, so an exception
    // propagates with no session left behind. Driven through `commit()`
    // because React's event delegation reports a handler throw itself.
    const { api, expose } = listApi();
    const onDrop = vi.fn(() => {
      throw new Error('consumer');
    });
    render(
      <List items={['a', 'b']} expose={expose} keyboard={{ mode: 'delegated' }} onDrop={onDrop} />
    );

    act(() => {
      api.current?.start({ key: 'a' });
    });
    expect(() => {
      act(() => {
        api.current?.commit({ key: 'b' });
      });
    }).toThrow();

    // The session was reserved before the consumer ran, so nothing can commit
    // a second time on it.
    let second = true;
    act(() => {
      second = api.current?.commit({ key: 'b' }) ?? true;
    });
    expect(second).toBe(false);
    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(api.current?.session).toBeNull();
  });

  it('a pointer commit announces with the pointer origin and moves no focus', () => {
    const onAnnounce = vi.fn();
    render(<List items={['a', 'b']} onAnnounce={onAnnounce} />);

    fire(item('a'), 'dragStart');
    fire(item('b'), 'drop');

    expect(onAnnounce).toHaveBeenCalledTimes(1);
    expect(onAnnounce.mock.calls[0][0]).toMatchObject({ kind: 'dropped', origin: 'pointer' });
    expect(document.activeElement).not.toBe(item('a'));
  });

  it('a pointer dragover announces nothing', () => {
    const onAnnounce = vi.fn();
    render(<List items={['a', 'b']} onAnnounce={onAnnounce} />);

    fire(item('a'), 'dragStart');
    fire(item('b'), 'dragOver');

    expect(onAnnounce).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Payload authority
// ---------------------------------------------------------------------------

describe('drag-session kernel: payload authority', () => {
  it('a foreign drag whose text/plain MATCHES an existing key commits nothing', () => {
    const onDrop = vi.fn();
    render(<List items={['a', 'b', 'c']} onDrop={onDrop} />);

    const foreign = transfer({ 'text/plain': 'a' });
    fire(item('c'), 'dragOver', { dataTransfer: foreign });
    fire(item('c'), 'drop', { dataTransfer: foreign });

    expect(onDrop).not.toHaveBeenCalled();
    expect(holds('c')).toBe(false);
  });

  it('a live session commits its OWN payload when the transfer names a different key', () => {
    const onDrop = vi.fn();
    render(<List items={['a', 'b', 'c']} onDrop={onDrop} />);

    fire(item('a'), 'dragStart');
    fire(item('c'), 'drop', { dataTransfer: transfer({ 'text/plain': 'b' }) });

    expect(onDrop).toHaveBeenCalledWith({ key: 'a' }, { key: 'c' });
  });

  it('the session holds the payload captured at dragstart', () => {
    // The payload is copied INTO the session inside onDragStart, so a
    // controlled parent that re-renders mid-drag cannot change it.
    const { api, expose } = listApi();
    function Board() {
      const [column, setColumn] = useState('todo');
      const drag = useDragSession<{ key: string; fromColumn: string }, Key>({
        onDrop: () => {},
      });
      expose(drag as unknown as Api);
      return (
        <div>
          <div data-testid="a" {...drag.getSourceProps({ key: 'a', fromColumn: column })} />
          <button type="button" data-testid="reparent" onClick={() => setColumn('doing')} />
        </div>
      );
    }
    render(<Board />);

    fire(item('a'), 'dragStart');
    fireEvent.click(screen.getByTestId('reparent'));

    expect(
      (api.current?.session as unknown as DragSession<{ key: string; fromColumn: string }, Key>)
        .payload.fromColumn
    ).toBe('todo');
  });
});

// ---------------------------------------------------------------------------
// The indicator
// ---------------------------------------------------------------------------

describe('drag-session kernel: the indicator', () => {
  it('a hover resolver returning current HOLDS the indicator', () => {
    render(<List items={['a', 'b', 'c']} resolveTarget={holdAndRefuse} />);

    fire(item('a'), 'dragStart');
    fire(item('b'), 'dragOver');
    fire(item('a'), 'dragOver');

    expect(holds('b')).toBe(true);
    expect(holds('a')).toBe(false);
  });

  it('a hover resolver returning null CLEARS the indicator', () => {
    const clearOnSelf: TargetResolver<Key, Key, Key> = ({ payload, target }) =>
      payload.key === target.key ? null : target;
    render(<List items={['a', 'b', 'c']} resolveTarget={clearOnSelf} />);

    fire(item('a'), 'dragStart');
    fire(item('b'), 'dragOver');
    fire(item('a'), 'dragOver');

    expect(holds('b')).toBe(false);
  });

  it('the resolver receives the phase, the bound target and the current indicator', () => {
    const seen: Array<{ phase: string; target: string; current: string | null }> = [];
    render(
      <List
        items={['a', 'b']}
        resolveTarget={({ phase, target, current }) => {
          seen.push({ phase, target: target.key, current: current?.key ?? null });
          return target;
        }}
      />
    );

    fire(item('a'), 'dragStart');
    fire(item('b'), 'dragOver');
    fire(item('b'), 'drop');

    expect(seen).toEqual([
      { phase: 'hover', target: 'b', current: null },
      { phase: 'drop', target: 'b', current: 'b' },
    ]);
  });
});

// ---------------------------------------------------------------------------
// Eligibility
// ---------------------------------------------------------------------------

describe('drag-session kernel: eligibility on both axes', () => {
  function bags(props: {
    disabled?: boolean;
    sourceEligible?: boolean;
    targetEligible?: boolean;
    pressCancel?: () => void;
  }) {
    const captured: { source: SortableSourceProps; target: SortableTargetProps }[] = [];
    function Probe() {
      const drag = useDragSession<Key, Key>({
        onDrop: () => {},
        disabled: props.disabled,
        pressCancel: props.pressCancel,
      });
      captured.push({
        source: drag.getSourceProps({ key: 'a' }, { eligible: props.sourceEligible }),
        target: drag.getTargetProps({ key: 'a' }, { eligible: props.targetEligible }),
      });
      return null;
    }
    const view = render(<Probe />);
    view.unmount();
    return captured[0];
  }

  it('a session-disabled source returns draggable:false alone', () => {
    expect(Object.keys(bags({ disabled: true }).source)).toEqual(['draggable']);
    expect(bags({ disabled: true }).source.draggable).toBe(false);
  });

  it('a session-disabled source keeps the TARGET handlers attached', () => {
    const target = bags({ disabled: true }).target;

    expect(typeof target.onDragOver).toBe('function');
    expect(typeof target.onDrop).toBe('function');
  });

  it('an ineligible source is not draggable and opens no session', () => {
    const source = bags({ sourceEligible: false }).source;
    expect(source.draggable).toBe(false);
    expect(source.onDragStart).toBeUndefined();
    expect(typeof source.onDragEnd).toBe('function');

    const onDrop = vi.fn();
    render(<List items={['a', 'b']} onDrop={onDrop} sourceEligible={(key) => key === 'b'} />);
    fire(item('a'), 'dragStart');
    fire(item('b'), 'drop');

    expect(onDrop).not.toHaveBeenCalled();
    expect(item('a').getAttribute('draggable')).toBe('false');
  });

  it('an eligible source returns the full bag', () => {
    const source = bags({ sourceEligible: true }).source;

    expect(source.draggable).toBe(true);
    expect(typeof source.onDragStart).toBe('function');
    expect(typeof source.onDragEnd).toBe('function');
  });

  it('a target with eligible:false attaches no handlers and does not cancel dragover', () => {
    expect(bags({ targetEligible: false }).target).toEqual({});

    const onDrop = vi.fn();
    render(<List items={['a', 'b']} onDrop={onDrop} targetEligible={(key) => key !== 'b'} />);
    fire(item('a'), 'dragStart');
    const over = fire(item('b'), 'dragOver');

    expect(over.defaultPrevented).toBe(false);
    fire(item('b'), 'drop');
    expect(onDrop).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Lifetime
// ---------------------------------------------------------------------------

describe('drag-session kernel: session lifetime', () => {
  it('a source disabled mid-session clears the session and commits nothing', () => {
    const onCancel = vi.fn();
    const onDrop = vi.fn();
    const { api, expose } = listApi();
    const view = render(
      <List items={['a', 'b']} expose={expose} onCancel={onCancel} onDrop={onDrop} />
    );

    fire(item('a'), 'dragStart');
    view.rerender(
      <List
        items={['a', 'b']}
        expose={expose}
        onCancel={onCancel}
        onDrop={onDrop}
        disabled
      />
    );

    expect(api.current?.session).toBeNull();
    expect(onCancel).toHaveBeenCalledWith({ key: 'a' });
    fire(item('b'), 'drop');
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('a target that unmounts mid-session leaves no session after dragend', () => {
    const onDrop = vi.fn();
    const { api, expose } = listApi();
    const view = render(<List items={['a', 'b']} expose={expose} onDrop={onDrop} />);

    fire(item('a'), 'dragStart');
    fire(item('b'), 'dragOver');
    view.rerender(<List items={['a']} expose={expose} onDrop={onDrop} />);
    fire(item('a'), 'dragEnd');

    expect(api.current?.session).toBeNull();
    expect(onDrop).not.toHaveBeenCalled();
    expect(screen.queryByTestId('b')).toBeNull();
  });

  it('the session outlives a source that unmounts, and the next dragstart reserves a fresh one', () => {
    // The browser fires dragend on a detached node, so React's handler never
    // runs. Every adopting family keeps its drag state set here, and the
    // kernel must not invent a window listener to differ.
    const onDrop = vi.fn();
    const { api, expose } = listApi();
    const view = render(<List items={['a', 'b', 'c']} expose={expose} onDrop={onDrop} />);

    fire(item('a'), 'dragStart');
    view.rerender(<List items={['b', 'c']} expose={expose} onDrop={onDrop} />);

    expect(api.current?.session).not.toBeNull();
    expect(api.current?.session?.payload).toEqual({ key: 'a' });

    act(() => {
      api.current?.cancel();
    });
    expect(api.current?.session).toBeNull();

    fire(item('c'), 'dragStart');
    expect(api.current?.session?.payload).toEqual({ key: 'c' });
  });

  it('commit passes a removed destination through unvalidated', () => {
    // `session.target` is a VALUE, not a live node: the kernel performs no
    // liveness check and the family's own guard decides.
    const onDrop = vi.fn();
    const { api, expose } = listApi();
    render(
      <List items={['a', 'c']} expose={expose} onDrop={onDrop} keyboard={{ mode: 'delegated' }} />
    );

    act(() => {
      api.current?.start({ key: 'a' });
      api.current?.commit({ key: 'gone' });
    });

    expect(onDrop).toHaveBeenCalledWith({ key: 'a' }, { key: 'gone' });
  });
});

// ---------------------------------------------------------------------------
// Keyboard
// ---------------------------------------------------------------------------

function indexResolver(order: string[]) {
  return ({ payload, intent, candidate }: {
    payload: Key;
    intent: MoveIntent;
    candidate: Key | null;
  }) => {
    const from = order.indexOf(candidate ? candidate.key : payload.key);
    const step = intent === 'next-item' ? 1 : intent === 'prev-item' ? -1 : 0;
    const to = from + step;
    if (step === 0 || from < 0 || to < 0 || to >= order.length) {
      return { kind: 'blocked' as const };
    }
    return { kind: 'target' as const, target: { key: order[to] } };
  };
}

describe('drag-session kernel: immediate mode', () => {
  const immediate = (order: string[]) =>
    ({
      mode: 'immediate',
      orientation: 'vertical',
      crossAxis: 'horizontal',
      resolveKeyboardTarget: indexResolver(order),
    }) as const;

  it('immediate mode commits without a session', () => {
    const order = ['a', 'b', 'c'];
    const events: string[] = [];
    const onDrop = vi.fn(() => events.push('drop'));
    const { api, expose } = listApi();
    render(
      <List
        items={order}
        expose={expose}
        onDrop={onDrop}
        onAnnounce={(event) => events.push(event.kind)}
        keyboard={immediate(order)}
      />
    );

    expect(api.current?.session).toBeNull();
    fireEvent.keyDown(item('b'), { key: 'ArrowDown' });

    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onDrop).toHaveBeenCalledWith({ key: 'b' }, { key: 'c' });
    expect(api.current?.session).toBeNull();
    expect(events).toEqual(['drop', 'dropped']);
  });

  it('immediate mode never opens a session, and no grabbed state is observable', () => {
    const order = ['a', 'b'];
    const seen: Array<DragSession<Key, Key> | null> = [];
    const { api, expose } = listApi();
    render(
      <List
        items={order}
        expose={(value) => {
          expose(value);
          seen.push(value.session);
        }}
        onDrop={() => seen.push(api.current?.session ?? null)}
        keyboard={immediate(order)}
      />
    );

    fireEvent.keyDown(item('a'), { key: 'ArrowDown' });

    expect(seen.every((value) => value === null)).toBe(true);
  });

  it('a blocked arrow commits nothing and announces the edge once', () => {
    const order = ['a', 'b'];
    const onDrop = vi.fn();
    const onAnnounce = vi.fn();
    render(
      <List
        items={order}
        onDrop={onDrop}
        onAnnounce={onAnnounce}
        keyboard={immediate(order)}
      />
    );

    fireEvent.keyDown(item('a'), { key: 'ArrowUp' });

    expect(onDrop).not.toHaveBeenCalled();
    expect(onAnnounce).toHaveBeenCalledTimes(1);
    expect(onAnnounce.mock.calls[0][0]).toMatchObject({
      kind: 'blocked',
      origin: 'keyboard',
      reason: 'edge',
    });
  });

  it('every keyboard move announces, and a committed one restores focus', () => {
    const order = ['a', 'b', 'c'];
    const onAnnounce = vi.fn();
    render(<List items={order} onAnnounce={onAnnounce} keyboard={immediate(order)} />);

    fireEvent.keyDown(item('a'), { key: 'ArrowDown' });

    expect(onAnnounce).toHaveBeenCalledTimes(1);
    expect(onAnnounce.mock.calls[0][0]).toMatchObject({
      kind: 'dropped',
      origin: 'keyboard',
      payload: { key: 'a' },
      target: { key: 'b' },
    });
    expect(document.activeElement).toBe(item('a'));
  });

  it('a key pressed on a control inside the source belongs to that control', () => {
    const order = ['a', 'b'];
    const onDrop = vi.fn();
    function Scene() {
      const drag = useDragSession<Key, Key>({
        onDrop,
        keyboard: immediate(order),
      });
      return (
        <li data-testid="a" {...drag.getSourceProps({ key: 'a' })}>
          <button type="button" data-testid="inner" />
        </li>
      );
    }
    render(<Scene />);

    fireEvent.keyDown(screen.getByTestId('inner'), { key: 'ArrowDown' });

    expect(onDrop).not.toHaveBeenCalled();
  });

  it('Home and End are not move keys', () => {
    const order = ['a', 'b', 'c'];
    const onDrop = vi.fn();
    const onAnnounce = vi.fn();
    render(
      <List items={order} onDrop={onDrop} onAnnounce={onAnnounce} keyboard={immediate(order)} />
    );

    fireEvent.keyDown(item('b'), { key: 'Home' });
    fireEvent.keyDown(item('b'), { key: 'End' });

    expect(onDrop).not.toHaveBeenCalled();
    expect(onAnnounce).not.toHaveBeenCalled();
  });
});

describe('drag-session kernel: grab mode', () => {
  const grab = (order: string[]) =>
    ({
      mode: 'grab',
      orientation: 'vertical',
      resolveKeyboardTarget: indexResolver(order),
    }) as const;

  it('grab mode commits once', () => {
    const order = ['a', 'b', 'c'];
    const onDrop = vi.fn();
    const { api, expose } = listApi();
    render(<List items={order} expose={expose} onDrop={onDrop} keyboard={grab(order)} />);

    fireEvent.keyDown(item('a'), { key: ' ' });
    expect(api.current?.session).toMatchObject({ phase: 'grabbed', origin: 'keyboard' });
    fireEvent.keyDown(item('a'), { key: 'ArrowDown' });
    fireEvent.keyDown(item('a'), { key: 'ArrowDown' });
    fireEvent.keyDown(item('a'), { key: ' ' });

    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onDrop).toHaveBeenCalledWith({ key: 'a' }, { key: 'c' });
    expect(api.current?.session).toBeNull();
  });

  it('escape cancels a grab and commits nothing', () => {
    const order = ['a', 'b', 'c'];
    const onDrop = vi.fn();
    const onCancel = vi.fn();
    const onAnnounce = vi.fn();
    const { api, expose } = listApi();
    render(
      <List
        items={order}
        expose={expose}
        onDrop={onDrop}
        onCancel={onCancel}
        onAnnounce={onAnnounce}
        keyboard={grab(order)}
      />
    );

    fireEvent.keyDown(item('a'), { key: ' ' });
    fireEvent.keyDown(item('a'), { key: 'ArrowDown' });
    fireEvent.keyDown(item('a'), { key: 'Escape' });

    expect(onDrop).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(api.current?.session).toBeNull();
    expect(onAnnounce.mock.calls.map(([event]) => event.kind)).toEqual([
      'grabbed',
      'moved',
      'cancelled',
    ]);
  });

  it('the candidate advances from the candidate, not from the payload', () => {
    const order = ['a', 'b', 'c', 'd'];
    const { api, expose } = listApi();
    render(<List items={order} expose={expose} onDrop={() => {}} keyboard={grab(order)} />);

    fireEvent.keyDown(item('a'), { key: ' ' });
    fireEvent.keyDown(item('a'), { key: 'ArrowDown' });
    expect(api.current?.session?.target).toEqual({ key: 'b' });
    fireEvent.keyDown(item('a'), { key: 'ArrowDown' });
    expect(api.current?.session?.target).toEqual({ key: 'c' });
  });

  it('a cancel with no candidate announces nothing', () => {
    const order = ['a', 'b'];
    const onAnnounce = vi.fn();
    render(
      <List items={order} onDrop={() => {}} onAnnounce={onAnnounce} keyboard={grab(order)} />
    );

    fireEvent.keyDown(item('a'), { key: ' ' });
    fireEvent.keyDown(item('a'), { key: 'Escape' });

    expect(onAnnounce.mock.calls.map(([event]) => event.kind)).toEqual(['grabbed']);
  });
});

describe('drag-session kernel: delegated mode', () => {
  it('a delegated move/commit round trip announces grabbed, moved, dropped', () => {
    const order = ['a', 'b', 'c'];
    const onDrop = vi.fn();
    const kinds: string[] = [];
    const { api, expose } = listApi();
    render(
      <List
        items={order}
        expose={expose}
        onDrop={onDrop}
        onAnnounce={(event) => kinds.push(event.kind)}
        keyboard={{ mode: 'delegated', resolveKeyboardTarget: indexResolver(order) }}
      />
    );

    act(() => {
      api.current?.start({ key: 'b' });
      if (api.current?.move('next-item')) api.current?.commit();
      else api.current?.cancel();
    });

    expect(kinds).toEqual(['grabbed', 'moved', 'dropped']);
    expect(onDrop).toHaveBeenCalledWith({ key: 'b' }, { key: 'c' });
    expect(api.current?.session).toBeNull();
  });

  it('a blocked delegated move closes the session and announces once', () => {
    const order = ['a', 'b', 'c'];
    const onDrop = vi.fn();
    const kinds: string[] = [];
    const { api, expose } = listApi();
    render(
      <List
        items={order}
        expose={expose}
        onDrop={onDrop}
        onAnnounce={(event) => kinds.push(event.kind)}
        keyboard={{ mode: 'delegated', resolveKeyboardTarget: indexResolver(order) }}
      />
    );

    act(() => {
      api.current?.start({ key: 'a' });
      if (api.current?.move('prev-item')) api.current?.commit();
      else api.current?.cancel();
    });

    expect(kinds).toEqual(['grabbed', 'blocked']);
    expect(onDrop).not.toHaveBeenCalled();
    expect(api.current?.session).toBeNull();
  });

  it('start() then commit() with no destination ends with one blocked message and a closed session', () => {
    const announced: Array<{ kind: string; reason?: string }> = [];
    const { api, expose } = listApi();
    render(
      <List
        items={['a']}
        expose={expose}
        onDrop={() => {}}
        onAnnounce={(event) => announced.push(event as { kind: string; reason?: string })}
        keyboard={{ mode: 'delegated' }}
      />
    );

    let committed = true;
    act(() => {
      api.current?.start({ key: 'a' });
      committed = api.current?.commit() ?? true;
    });

    expect(committed).toBe(false);
    expect(announced.map((event) => event.kind)).toEqual(['grabbed', 'blocked']);
    expect(announced[1].reason).toBe('no-destination');
    expect(api.current?.session).toBeNull();
  });

  it('an explicit destination overrides the candidate', () => {
    const order = ['a', 'b', 'c'];
    const onDrop = vi.fn();
    const { api, expose } = listApi();
    render(
      <List
        items={order}
        expose={expose}
        onDrop={onDrop}
        keyboard={{ mode: 'delegated', resolveKeyboardTarget: indexResolver(order) }}
      />
    );

    act(() => {
      api.current?.start({ key: 'a' });
      api.current?.move('next-item');
      api.current?.commit({ key: 'c' });
    });

    expect(onDrop).toHaveBeenCalledWith({ key: 'a' }, { key: 'c' });
  });

  it('a delegated source binds no key', () => {
    const bags: SortableSourceProps[] = [];
    function Probe() {
      const drag = useDragSession<Key, Key>({
        onDrop: () => {},
        keyboard: { mode: 'delegated' },
      });
      bags.push(drag.getSourceProps({ key: 'a' }));
      return null;
    }
    render(<Probe />);

    expect(bags[0].onKeyDown).toBeUndefined();
  });

  it('a keyboard commit restores focus to the moved item', () => {
    const order = ['a', 'b', 'c'];
    const { api, expose } = listApi();
    render(
      <List
        items={order}
        expose={expose}
        onDrop={() => {}}
        keyboard={{ mode: 'delegated', resolveKeyboardTarget: indexResolver(order) }}
      />
    );

    act(() => {
      api.current?.start({ key: 'a' });
      api.current?.move('next-item');
      api.current?.commit();
    });

    expect(document.activeElement).toBe(item('a'));
  });
});
