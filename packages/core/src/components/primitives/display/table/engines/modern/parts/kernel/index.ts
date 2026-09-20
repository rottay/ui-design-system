'use client';

/**
 * @fileoverview The table's state stamp, decided once.
 *
 * The modern table skin paints hover, press, focus-visible and disabled
 * through `:is([data-state~='x'], :x)` -- a kernel twin beside the pseudo-class
 * (F-37). Only the pseudo half was ever live: every painted part was a raw
 * `th`/`td`/`tr`/`button`/`input` with a literal `data-part` and no interaction
 * kernel behind it. This is the hook the table's part components use to close
 * that twin, so one place decides when a part of this family is pressed.
 *
 * `useInteractionState().handlers` REPLACE a colliding prop on a spread, and
 * the table hands consumer props straight through (`onRow`, `column.onCell`,
 * the inline editor's own `onBlur`). Every prop the kernel takes over is
 * therefore composed explicitly, kernel first (P-79).
 */

import type React from 'react';

import { useInteractionState, type InteractionState } from '@/foundation/behavior';
import { composeHandlers } from '@/foundation/behavior/runtime/compose-handlers';

/**
 * The props a stamping part takes over. Typed with `never` parameters so any
 * element's concrete handler type satisfies the constraint; the hook returns
 * the caller's own props type unchanged.
 */
export interface PartInteractionHandlers {
  onPointerEnter?: (event: never) => void;
  onPointerLeave?: (event: never) => void;
  onPointerDown?: (event: never) => void;
  onPointerUp?: (event: never) => void;
  onPointerCancel?: (event: never) => void;
  onFocus?: (event: never) => void;
  onBlur?: (event: never) => void;
  onKeyDown?: (event: never) => void;
  onKeyUp?: (event: never) => void;
}

export interface UsePartInteractionOptions {
  /**
   * Whether this instance EMITS its state. A part whose paint is gated
   * (`[data-sortable='true']`, `[data-hoverable='true']`, `[data-editable='true']`)
   * only stamps while its gate is open.
   *
   * The kernel keeps tracking either way, because a gate can close and reopen
   * under a mounted part: the editable cell drops `data-editable` for as long
   * as its inline editor is up, and a kernel that stopped listening there would
   * never see the pointer leave -- it would reopen holding a hover that ended,
   * and the skin would paint the ghost. Gate the output, never the listener.
   */
  stamped: boolean;
  /** Mirrors the element's own disabled state into the `disabled` token. */
  disabled?: boolean;
  /**
   * Native `<button>` parts only: the platform presses a button from the
   * keyboard, so the kernel's press follows Enter/Space the way the reference
   * Button does. A part that is not a button paints press from the pointer
   * alone, which is exactly what its `:active` twin already did.
   */
  keyboardPress?: boolean;
  /**
   * Whether this part can hold focus itself. React's focus events bubble, so a
   * CONTAINER part (the row, the cell) would otherwise report focus that
   * belongs to a control inside it -- and `:focus-visible`, the twin the stamp
   * exists to mirror, never matches an ancestor. Container parts paint hover
   * only, so they take no focus listener and their focus flags stay false.
   */
  focusable?: boolean;
}

export interface PartInteraction<P> {
  /** Feed to `partAttributes(part, state)`; empty while the part does not stamp. */
  state: Partial<InteractionState>;
  /** The caller's props with every taken-over handler composed, kernel first. */
  props: P;
}

export function usePartInteraction<P extends PartInteractionHandlers>(
  props: P,
  { stamped, disabled = false, keyboardPress = false, focusable = true }: UsePartInteractionOptions
): PartInteraction<P> {
  const { state, handlers } = useInteractionState({ disabled });

  const caller = props as PartInteractionHandlers;
  const pointer = handlers as unknown as {
    onPointerEnter: (event: never) => void;
    onPointerLeave: (event: never) => void;
    onPointerDown: (event: never) => void;
    onPointerUp: (event: never) => void;
    onFocus: (event: never) => void;
    onBlur: (event: never) => void;
  };

  const composed: PartInteractionHandlers = {
    onPointerEnter: composeHandlers(pointer.onPointerEnter, caller.onPointerEnter),
    onPointerLeave: composeHandlers(pointer.onPointerLeave, caller.onPointerLeave),
    onPointerDown: composeHandlers(pointer.onPointerDown, caller.onPointerDown),
    onPointerUp: composeHandlers(pointer.onPointerUp, caller.onPointerUp),
    onPointerCancel: composeHandlers(pointer.onPointerUp, caller.onPointerCancel),
  };

  if (focusable) {
    composed.onFocus = composeHandlers(pointer.onFocus, caller.onFocus);
    composed.onBlur = composeHandlers(pointer.onBlur, caller.onBlur);
  }

  if (keyboardPress) {
    const activates = (event: React.KeyboardEvent) => event.key === ' ' || event.key === 'Enter';
    composed.onKeyDown = composeHandlers(((event: React.KeyboardEvent) => {
      if (activates(event)) pointer.onPointerDown(event as never);
    }) as (event: never) => void, caller.onKeyDown);
    composed.onKeyUp = composeHandlers(((event: React.KeyboardEvent) => {
      if (activates(event)) pointer.onPointerUp(event as never);
    }) as (event: never) => void, caller.onKeyUp);
  }

  return { state: stamped ? state : {}, props: { ...props, ...composed } as P };
}
