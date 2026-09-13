'use client';

import type React from 'react';

import { useInteractionState } from '../../runtime/interaction-state';
import type { InteractionState } from '../../kernel/anatomy';

export interface FieldActionHandlers {
  onPointerEnter: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerLeave: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerCancel: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onFocus: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  onKeyUp: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}

export interface FieldAction {
  state: InteractionState;
  handlers: FieldActionHandlers;
}

/**
 * The interaction state of a button inside a text field (clear, search, reveal).
 * A pointer press never takes focus from the text control, so typing continues.
 */
export function useFieldAction({ disabled = false }: { disabled?: boolean } = {}): FieldAction {
  const { state, handlers } = useInteractionState({ disabled });
  const pressKey = (event: React.KeyboardEvent<HTMLButtonElement>, down: boolean) => {
    if (event.key !== ' ') return;
    if (down) handlers.onPointerDown(event as unknown as React.PointerEvent);
    else handlers.onPointerUp(event as unknown as React.PointerEvent);
  };
  return {
    state,
    handlers: {
      onPointerEnter: handlers.onPointerEnter,
      onPointerLeave: handlers.onPointerLeave,
      onPointerDown: (event) => {
        event.preventDefault();
        handlers.onPointerDown(event);
      },
      onPointerUp: handlers.onPointerUp,
      onPointerCancel: handlers.onPointerUp,
      onFocus: handlers.onFocus,
      onBlur: handlers.onBlur,
      onKeyDown: (event) => pressKey(event, true),
      onKeyUp: (event) => pressKey(event, false),
    },
  };
}
