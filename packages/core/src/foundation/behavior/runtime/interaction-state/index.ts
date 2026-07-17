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
 */

import { useCallback, useMemo, useRef, useState } from 'react';

import type { InteractionState } from '../../kernel/anatomy';

export interface UseInteractionStateOptions {
  /** A disabled part reports no hover, no press and no focus ring. */
  disabled?: boolean;
}

export interface UseInteractionStateResult {
  state: InteractionState;
  /**
   * Handlers to spread onto the interactive element. They call through to any
   * handler the caller also passes, because a part owns its state and a product
   * owns its behaviour.
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

  const onPointerEnter = useCallback(() => {
    if (!disabled) setHovered(true);
  }, [disabled]);

  const onPointerLeave = useCallback(() => {
    setHovered(false);
    // A pointer that leaves mid-press cancels the press: the click will not
    // fire, so the part must not keep painting as if it will.
    setPressed(false);
  }, []);

  const onPointerDown = useCallback(() => {
    if (disabled) return;
    pointerDownRef.current = true;
    setPressed(true);
  }, [disabled]);

  const onPointerUp = useCallback(() => {
    pointerDownRef.current = false;
    setPressed(false);
  }, []);

  const onFocus = useCallback(() => {
    if (disabled) return;
    setFocused(true);
    // Input modality decides the ring, not `element.matches(':focus-visible')`.
    // Several DOM implementations answer that selector without implementing it:
    // they return `false` rather than throwing, so a "does it throw" support
    // probe reports support and every keyboard focus silently loses its ring.
    // Skins that want the platform's own answer still have `:focus-visible` in
    // CSS; this attribute is the behaviour layer's answer, and it is honest
    // about how it knows.
    setFocusVisible(!pointerDownRef.current);
  }, [disabled]);

  const onBlur = useCallback(() => {
    setFocused(false);
    setFocusVisible(false);
    pointerDownRef.current = false;
  }, []);

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
