'use client';

/**
 * @fileoverview The hover / press / focus triad, decided once.
 *
 * Both interactive engines re-implemented this with four `useState` calls each,
 * and they disagreed: the modern Button drew its focus ring from
 * `data-focus-visible`, which it set on ANY focus — including a mouse click.
 * A focus ring on a clicked button is noise; it is a keyboard affordance.
 *
 * The ring is decided by input modality, not by `element.matches(':focus-visible')`.
 * Several DOM implementations answer that selector without implementing it, so a
 * probe that only checks whether it throws reports support and every keyboard
 * focus silently loses its ring. Skins that want the platform's own answer still
 * have `:focus-visible` available in CSS.
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

export interface UseInteractionStateOptions {
  /** A disabled part reports no hover, no press and no focus ring. */
  disabled?: boolean;
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
  const { disabled = false } = options;

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
      setHovered(true);
    },
    [disabled]
  );

  /** Every way a press ends with no click: leave, cancel, blur, disable. */
  const cancelPress = useCallback(() => {
    pointerDownRef.current = false;
    pressModalityRef.current = null;
    setPressed(false);
  }, []);

  // A part disabled mid-press never sees the pointerup or keyup that ends the
  // gesture, so cancel it rather than latch a press until the part returns.
  const [wasDisabled, setWasDisabled] = useState(disabled);
  if (disabled !== wasDisabled) {
    setWasDisabled(disabled);
    if (disabled) cancelPress();
  }

  const onPointerLeave = useCallback(() => {
    setHovered(false);
    cancelPress();
  }, [cancelPress]);

  const onPointerDown = useCallback(
    (event?: React.PointerEvent) => {
      if (disabled) return;
      pointerDownRef.current = true;
      pressModalityRef.current = modalityOf(event);
      setPressed(true);
    },
    [disabled]
  );

  // Release, and the pointercancel callers wire here too. A touch release ends
  // the gesture, so a hover it finds latched goes with the finger.
  const onPointerUp = useCallback(
    (event?: React.PointerEvent) => {
      const touchRelease =
        pressModalityRef.current === 'touch' || modalityOf(event) === 'touch';
      cancelPress();
      if (touchRelease) setHovered(false);
    },
    [cancelPress]
  );

  const onFocus = useCallback(() => {
    if (disabled) return;
    setFocused(true);
    // Input modality decides the ring, not `element.matches(':focus-visible')`.
    setFocusVisible(!pointerDownRef.current);
  }, [disabled]);

  const onBlur = useCallback(() => {
    setFocused(false);
    setFocusVisible(false);
    // Focus is gone, so the keyup that would end a keyboard press lands on
    // whatever took it and never here.
    cancelPress();
  }, [cancelPress]);

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
