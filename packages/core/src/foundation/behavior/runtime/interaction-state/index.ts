'use client';

/**
 * @fileoverview The hover / press / focus triad, decided once.
 *
 * Both interactive engines re-implemented this with four `useState` calls each,
 * and they disagreed: the modern Button drew its focus ring from
 * `data-focus-visible`, which it set on ANY focus — including a mouse click.
 * A focus ring on a clicked button is noise; it is a keyboard affordance.
 *
 * The ring follows the platform. A focus is visible when the element it landed
 * on matches `:focus-visible`: the browser's own modality heuristic, which also
 * judges a focus that script moved or a label forwarded. Two guards keep that
 * honest. A pointer press on the part itself never rings. And the platform is
 * asked only about a focus that really happened: DOM runners answer the selector
 * as plain `:focus`, a dispatched focus event has no answer at all, and an old
 * runtime throws on it, so each of those counts as visible rather than silently
 * costing every keyboard focus its ring.
 *
 * Hover is a pointer that RESTS on the part, which a finger never does: a tap's
 * `pointerenter` may never get its leave, so touch presses without hovering.
 */

import { useCallback, useMemo, useRef, useState } from 'react';

import type { InteractionState } from '../../kernel/anatomy';

type PressModality = 'mouse' | 'pen' | 'touch' | 'keyboard';

/**
 * No `pointerType` means no pointer made the call: a press synthesized from a
 * key lands here, and it is its own modality -- never touch.
 */
function modalityOf(event?: { pointerType?: string }): PressModality {
  const pointerType = event?.pointerType;
  if (!pointerType) return 'keyboard';
  if (pointerType === 'touch' || pointerType === 'pen') return pointerType;
  return 'mouse';
}

/** The platform's answer for a focus that really landed on `target`; visible when it has none. */
function platformShowsFocus(target: Element | null | undefined): boolean {
  if (!target || typeof target.matches !== 'function') return true;
  try {
    const root = target.getRootNode();
    if (!('activeElement' in root) || root.activeElement !== target) return true;
    return target.matches(':focus-visible');
  } catch {
    return true;
  }
}

export interface UseInteractionStateOptions {
  /** A disabled part reports no hover, no press and no focus ring. */
  disabled?: boolean;
  /**
   * The states the part's skin reads off the stamp; every state when omitted.
   *
   * A state left out never enters React state: it reports `false`, and the
   * event that would have raised it re-renders nothing. A part whose skin only
   * paints a focus ring has no reason to re-render its owner on every pointer
   * enter, press, release and leave. The press is still remembered, so a focus
   * that a pointer press brought still does not ring.
   *
   * Keep the list fixed for the life of the part: a state dropped from it
   * while raised is never cleared.
   */
  tracks?: readonly Exclude<keyof InteractionState, 'disabled'>[];
}

export interface UseInteractionStateResult {
  state: InteractionState;
  /**
   * Handlers to spread onto the interactive element. They do NOT chain: a
   * spread REPLACES a colliding handler the caller passed. Spread them before
   * the caller's own props, or compose explicitly (see `composeHandlers` in
   * `../compose-handlers`).
   */
  handlers: {
    onPointerEnter: (event: React.PointerEvent) => void;
    onPointerLeave: (event: React.PointerEvent) => void;
    onPointerDown: (event: React.PointerEvent) => void;
    onPointerUp: (event: React.PointerEvent) => void;
    onFocus: (event: React.FocusEvent) => void;
    onBlur: (event: React.FocusEvent) => void;
  };
}

export function useInteractionState(
  options: UseInteractionStateOptions = {}
): UseInteractionStateResult {
  const { disabled = false, tracks } = options;
  const tracksHover = !tracks || tracks.includes('hovered');
  const tracksPress = !tracks || tracks.includes('pressed');
  const tracksFocus = !tracks || tracks.includes('focused');
  const tracksFocusVisible = !tracks || tracks.includes('focusVisible');

  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);

  /**
   * A pointer press that lands on the element focuses it. A focus that arrives
   * while a pointer is down did not arrive from the keyboard.
   */
  const pointerDownRef = useRef(false);
  /** Which input opened the live press, or null while nothing is pressed. */
  const pressModalityRef = useRef<PressModality | null>(null);

  const onPointerEnter = useCallback(
    (event?: React.PointerEvent) => {
      if (disabled) return;
      if (modalityOf(event) === 'touch') return;
      if (tracksHover) setHovered(true);
    },
    [disabled, tracksHover]
  );

  /** Every way a press ends with no click: leave, cancel, blur, disable. */
  const cancelPress = useCallback(() => {
    pointerDownRef.current = false;
    pressModalityRef.current = null;
    if (tracksPress) setPressed(false);
  }, [tracksPress]);

  // A part disabled mid-press never sees the pointerup or keyup that ends the
  // gesture, so cancel it rather than latch a press until the part returns.
  const [wasDisabled, setWasDisabled] = useState(disabled);
  if (disabled !== wasDisabled) {
    setWasDisabled(disabled);
    if (disabled) cancelPress();
  }

  const onPointerLeave = useCallback(() => {
    if (tracksHover) setHovered(false);
    cancelPress();
  }, [cancelPress, tracksHover]);

  const onPointerDown = useCallback(
    (event?: React.PointerEvent) => {
      if (disabled) return;
      pointerDownRef.current = true;
      pressModalityRef.current = modalityOf(event);
      if (tracksPress) setPressed(true);
    },
    [disabled, tracksPress]
  );

  // Release, and the pointercancel callers wire here too. A touch release ends
  // the gesture, so a hover it finds latched goes with the finger.
  const onPointerUp = useCallback(
    (event?: React.PointerEvent) => {
      const touchRelease =
        pressModalityRef.current === 'touch' || modalityOf(event) === 'touch';
      cancelPress();
      if (touchRelease && tracksHover) setHovered(false);
    },
    [cancelPress, tracksHover]
  );

  const onFocus = useCallback(
    (event?: React.FocusEvent) => {
      if (disabled) return;
      if (tracksFocus) setFocused(true);
      // A focus that script moved or a label forwarded lands on a part nobody
      // pressed: the platform's answer for the focused element decides its ring.
      if (tracksFocusVisible) {
        setFocusVisible(!pointerDownRef.current && platformShowsFocus(event?.target));
      }
    },
    [disabled, tracksFocus, tracksFocusVisible]
  );

  const onBlur = useCallback(() => {
    if (tracksFocus) setFocused(false);
    if (tracksFocusVisible) setFocusVisible(false);
    // Focus is gone, so the keyup that would end a keyboard press lands on
    // whatever took it and never here.
    cancelPress();
  }, [cancelPress, tracksFocus, tracksFocusVisible]);

  const state = useMemo<InteractionState>(
    () => ({
      hovered: hovered && !disabled,
      pressed: pressed && !disabled,
      focused: focused && !disabled,
      focusVisible: focusVisible && !disabled,
      disabled,
    }),
    [hovered, pressed, focused, focusVisible, disabled]
  );

  const handlers = useMemo(
    () => ({ onPointerEnter, onPointerLeave, onPointerDown, onPointerUp, onFocus, onBlur }),
    [onPointerEnter, onPointerLeave, onPointerDown, onPointerUp, onFocus, onBlur]
  );

  return { state, handlers };
}
