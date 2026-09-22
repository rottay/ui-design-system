/**
 * @fileoverview The hover / press / focus triad is decided once (WO-ARC-02).
 *
 * The defect this pins: both interactive engines re-implemented these four
 * booleans, they disagreed on what a press means, and the modern Button raised
 * `data-focus-visible` on ANY focus — so clicking it with a mouse drew a
 * keyboard affordance.
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { partAttributes, serializeState } from '../../../kernel/anatomy';
import { composeHandlers } from '../../compose-handlers';
import { useInteractionState } from '..';

function Probe({ disabled = false }: { disabled?: boolean }) {
  const { state, handlers } = useInteractionState({ disabled });
  return (
    <button
      type="button"
      disabled={disabled}
      {...partAttributes('trigger', state)}
      {...handlers}
      // The table's part kernel wiring: cancel onto the release path, keyboard
      // activation through the pointer handlers (`parts/kernel/index.ts:101,110-119`).
      onPointerCancel={handlers.onPointerUp}
      onKeyDown={(event) => event.key === ' ' && handlers.onPointerDown(event as never)}
      onKeyUp={(event) => event.key === ' ' && handlers.onPointerUp(event as never)}
    >
      probe
    </button>
  );
}

const trigger = () => screen.getByRole('button', { name: 'probe' });

describe('serializeState', () => {
  it('is absent, not empty, when nothing is active', () => {
    // `[data-state]` must not match a part at rest.
    expect(serializeState({})).toBeUndefined();
    expect(serializeState({ hovered: false, pressed: false })).toBeUndefined();
  });

  it('serializes a token list a skin can match with [data-state~=...]', () => {
    expect(serializeState({ hovered: true, pressed: true })).toBe('hovered pressed');
  });

  it('spells focusVisible the way CSS does', () => {
    expect(serializeState({ focusVisible: true })).toBe('focus-visible');
  });
});

describe('the part carries its own state on the DOM', () => {
  it('rests with a part name and no state attribute', () => {
    render(<Probe />);
    expect(trigger()).toHaveAttribute('data-part', 'trigger');
    expect(trigger()).not.toHaveAttribute('data-state');
  });

  it('hovers, and un-hovers', () => {
    render(<Probe />);
    fireEvent.pointerEnter(trigger());
    expect(trigger().getAttribute('data-state')).toContain('hovered');
    fireEvent.pointerLeave(trigger());
    expect(trigger()).not.toHaveAttribute('data-state');
  });

  it('presses, and releases', () => {
    render(<Probe />);
    fireEvent.pointerDown(trigger());
    expect(trigger().getAttribute('data-state')).toContain('pressed');
    fireEvent.pointerUp(trigger());
    expect(trigger().getAttribute('data-state') ?? '').not.toContain('pressed');
  });

  it('cancels the press when the pointer leaves mid-press', () => {
    // The click will not fire, so the part must stop painting as if it will.
    render(<Probe />);
    fireEvent.pointerDown(trigger());
    fireEvent.pointerLeave(trigger());
    expect(trigger().getAttribute('data-state') ?? '').not.toContain('pressed');
  });
});

describe('a press that can no longer complete is cancelled', () => {
  it('cancels a keyboard press when focus leaves before the keyup', () => {
    // The keyup lands on whatever took the focus, so this part will never see
    // the end of its own press.
    render(<Probe />);
    fireEvent.focus(trigger());
    fireEvent.keyDown(trigger(), { key: ' ' });
    expect(trigger().getAttribute('data-state')).toContain('pressed');

    fireEvent.blur(trigger());
    expect(trigger()).not.toHaveAttribute('data-state');
  });

  it('cancels a pointer press when focus leaves mid-press', () => {
    render(<Probe />);
    fireEvent.pointerDown(trigger());
    fireEvent.focus(trigger());
    fireEvent.blur(trigger());
    expect(trigger().getAttribute('data-state') ?? '').not.toContain('pressed');
  });

  it('does not resurrect the press when the part is disabled mid-press and enabled again', () => {
    const { rerender } = render(<Probe />);
    fireEvent.pointerDown(trigger());
    expect(trigger().getAttribute('data-state')).toContain('pressed');

    rerender(<Probe disabled />);
    expect(trigger().getAttribute('data-state')).toBe('disabled');

    rerender(<Probe />);
    expect(trigger().getAttribute('data-state') ?? '').not.toContain('pressed');
  });

  it('rings the next keyboard focus after a press the pointer abandoned', () => {
    // The abandoned press must not keep claiming that the focus about to
    // arrive came from a pointer.
    render(<Probe />);
    fireEvent.pointerDown(trigger());
    fireEvent.pointerLeave(trigger());
    fireEvent.focus(trigger());
    expect(trigger().getAttribute('data-state')).toContain('focus-visible');
  });
});

describe('a focus ring is a keyboard affordance', () => {
  it('does not ring when focus arrives from a pointer press', () => {
    render(<Probe />);
    fireEvent.pointerDown(trigger());
    fireEvent.focus(trigger());

    const state = trigger().getAttribute('data-state') ?? '';
    expect(state, 'a mouse click drew a focus ring').not.toContain('focus-visible');
    expect(state).toContain('focused');
  });

  it('rings when focus arrives without a pointer', () => {
    render(<Probe />);
    fireEvent.focus(trigger());
    expect(trigger().getAttribute('data-state')).toContain('focus-visible');
  });

  it('drops the ring on blur', () => {
    render(<Probe />);
    fireEvent.focus(trigger());
    fireEvent.blur(trigger());
    expect(trigger()).not.toHaveAttribute('data-state');
  });
});

describe('a disabled part reports nothing', () => {
  it('never hovers, presses, or rings', () => {
    render(<Probe disabled />);
    fireEvent.pointerEnter(trigger());
    fireEvent.pointerDown(trigger());
    fireEvent.focus(trigger());

    const state = trigger().getAttribute('data-state') ?? '';
    expect(state).toBe('disabled');
  });
});

/**
 * The kernel's handlers are a prop bag, not a chain. Three family cuts in a row
 * lost a caller's `onPointerDown` to a naive spread, so the behaviour is pinned
 * here: changing it is then a declared decision, not a silent one.
 */
describe('the handlers do not chain to a caller', () => {
  function SpreadLast({ onPointerDown }: { onPointerDown: () => void }) {
    const { state, handlers } = useInteractionState();
    return (
      <button
        type="button"
        {...{ onPointerDown }}
        {...partAttributes('trigger', state)}
        {...handlers}
      >
        probe
      </button>
    );
  }

  function SpreadFirst({ onPointerDown }: { onPointerDown: () => void }) {
    const { state, handlers } = useInteractionState();
    return (
      <button
        type="button"
        {...handlers}
        {...partAttributes('trigger', state)}
        onPointerDown={onPointerDown}
      >
        probe
      </button>
    );
  }

  function Composed({ onPointerDown }: { onPointerDown: () => void }) {
    const { state, handlers } = useInteractionState();
    return (
      <button
        type="button"
        {...partAttributes('trigger', state)}
        {...handlers}
        onPointerDown={composeHandlers(onPointerDown, handlers.onPointerDown)}
      >
        probe
      </button>
    );
  }

  it('replaces a caller handler it is spread after', () => {
    const caller = vi.fn();
    render(<SpreadLast onPointerDown={caller} />);
    fireEvent.pointerDown(trigger());

    expect(caller, 'the spread started chaining; update the contract').not.toHaveBeenCalled();
    expect(trigger().getAttribute('data-state')).toContain('pressed');
  });

  it('loses its own handler to a caller handler spread after it', () => {
    const caller = vi.fn();
    render(<SpreadFirst onPointerDown={caller} />);
    fireEvent.pointerDown(trigger());

    expect(caller).toHaveBeenCalledTimes(1);
    expect(trigger()).not.toHaveAttribute('data-state');
  });

  it('keeps both sides when the colliding prop is composed explicitly', () => {
    const caller = vi.fn();
    render(<Composed onPointerDown={caller} />);
    fireEvent.pointerDown(trigger());

    expect(caller).toHaveBeenCalledTimes(1);
    expect(trigger().getAttribute('data-state')).toContain('pressed');
  });
});


/**
 * A tap raises `pointerenter` like a mouse does, but the matching leave may
 * never arrive -- so honouring it latched a hover that outlived the gesture.
 */
describe('a finger leaves no hover behind', () => {
  const touch = { pointerType: 'touch' } as const;

  it('reports the modality the test fires, so these drills are not vacuous', () => {
    // If the runner dropped `pointerType`, every touch leg below would pass by
    // reading `undefined` and prove nothing.
    const seen: string[] = [];
    function Sensor() {
      return (
        <button type="button" onPointerDown={(event) => seen.push(event.pointerType)}>
          probe
        </button>
      );
    }
    render(<Sensor />);
    fireEvent.pointerDown(trigger(), touch);
    expect(seen).toEqual(['touch']);
  });

  it('does not hover on a touch tap, and is back at rest after the release', () => {
    render(<Probe />);
    fireEvent.pointerEnter(trigger(), touch);
    expect(trigger().getAttribute('data-state') ?? '', 'a tap latched a hover').not.toContain(
      'hovered'
    );

    fireEvent.pointerDown(trigger(), touch);
    fireEvent.pointerUp(trigger(), touch);
    expect(trigger()).not.toHaveAttribute('data-state');
  });

  it('presses a touch hold, and releases it cleanly', () => {
    render(<Probe />);
    fireEvent.pointerEnter(trigger(), touch);
    fireEvent.pointerDown(trigger(), touch);

    const held = trigger().getAttribute('data-state') ?? '';
    expect(held).toContain('pressed');
    expect(held).not.toContain('hovered');

    fireEvent.pointerUp(trigger(), touch);
    expect(trigger()).not.toHaveAttribute('data-state');
  });

  it('drops a hover the release finds latched, whoever set it', () => {
    // A hybrid device: the mouse rested here, then a finger lifted off it.
    render(<Probe />);
    fireEvent.pointerEnter(trigger(), { pointerType: 'mouse' });
    expect(trigger().getAttribute('data-state')).toContain('hovered');

    fireEvent.pointerUp(trigger(), touch);
    expect(trigger()).not.toHaveAttribute('data-state');
  });

  it('releases press and hover when the gesture is cancelled', () => {
    render(<Probe />);
    fireEvent.pointerEnter(trigger(), touch);
    fireEvent.pointerDown(trigger(), touch);
    fireEvent.pointerCancel(trigger(), touch);
    expect(trigger()).not.toHaveAttribute('data-state');
  });

  it('ends a touch press through a release that carries no pointer type', () => {
    // A drag ends at `dragend`, which is not a PointerEvent at all
    // (`structures/workspace/column-menu/index.tsx:1226`).
    render(<Probe />);
    fireEvent.pointerEnter(trigger(), { pointerType: 'mouse' });
    fireEvent.pointerDown(trigger(), touch);
    fireEvent.pointerUp(trigger());
    expect(trigger(), 'the release could not tell it was ending a touch').not.toHaveAttribute(
      'data-state'
    );
  });

  it('does not let a touch press that already ended clear a later hover', () => {
    // The modality outlives its press only if nothing clears it: the leave
    // cancelled this press, so the mouse arriving after it keeps its hover.
    render(<Probe />);
    fireEvent.pointerDown(trigger(), touch);
    fireEvent.pointerLeave(trigger());
    fireEvent.pointerEnter(trigger(), { pointerType: 'mouse' });
    fireEvent.pointerUp(trigger());
    expect(
      trigger().getAttribute('data-state'),
      'a stale touch press cleared a hover it never set'
    ).toContain('hovered');
  });

  it('cancels a mouse press without disturbing its hover', () => {
    render(<Probe />);
    fireEvent.pointerEnter(trigger(), { pointerType: 'mouse' });
    fireEvent.pointerDown(trigger(), { pointerType: 'mouse' });
    fireEvent.pointerCancel(trigger(), { pointerType: 'mouse' });

    const state = trigger().getAttribute('data-state') ?? '';
    expect(state).not.toContain('pressed');
    expect(state, 'the mouse is still resting on the part').toContain('hovered');
  });
});

/** A pointer that rests on the part still hovers, and still keeps its hover. */
describe('a resting pointer hovers as it always did', () => {
  it.each(['mouse', 'pen'])('hovers for a %s, and keeps it across a press', (pointerType) => {
    render(<Probe />);
    fireEvent.pointerEnter(trigger(), { pointerType });
    expect(trigger().getAttribute('data-state')).toContain('hovered');

    fireEvent.pointerDown(trigger(), { pointerType });
    fireEvent.pointerUp(trigger(), { pointerType });
    expect(trigger().getAttribute('data-state'), 'the press ate the hover').toContain('hovered');
  });
});

/**
 * The table's part kernel activates a stamped part by passing its KeyboardEvent
 * into `onPointerDown`; carrying no `pointerType` must not read as a touch.
 */
describe('a keyboard activation is not a touch', () => {
  it('presses and releases through the pointer handlers', () => {
    render(<Probe />);
    fireEvent.focus(trigger());
    fireEvent.keyDown(trigger(), { key: ' ' });
    expect(trigger().getAttribute('data-state')).toContain('pressed');

    fireEvent.keyUp(trigger(), { key: ' ' });
    expect(trigger().getAttribute('data-state') ?? '').not.toContain('pressed');
  });

  it('does not clear the hover the pointer is still holding', () => {
    render(<Probe />);
    fireEvent.pointerEnter(trigger(), { pointerType: 'mouse' });
    fireEvent.focus(trigger());
    fireEvent.keyDown(trigger(), { key: ' ' });
    fireEvent.keyUp(trigger(), { key: ' ' });

    expect(trigger().getAttribute('data-state')).toContain('hovered');
  });
});
