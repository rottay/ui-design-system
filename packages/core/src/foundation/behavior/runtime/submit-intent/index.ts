/**
 * @fileoverview What an Enter key press means in a text field, decided once: an
 * IME confirming a candidate with Enter never commits the field.
 */

export type SubmitIntent = 'submit' | 'newline' | 'composing' | 'none';

/** The subset of a DOM or React keyboard event the decision reads. */
export interface SubmitKeyEvent {
  readonly key: string;
  readonly shiftKey?: boolean;
  readonly isComposing?: boolean;
  readonly keyCode?: number;
  readonly nativeEvent?: { readonly isComposing?: boolean; readonly keyCode?: number };
}

export interface SubmitIntentOptions {
  /** A multi-line field keeps Shift+Enter for a new line. @default false */
  readonly multiline?: boolean;
}

/** Safari reports the keydown that confirms a candidate with this legacy keyCode. */
const IME_PROCESS_KEY = 229;

export function isComposingKey(event: SubmitKeyEvent): boolean {
  return Boolean(
    event.isComposing
      || event.nativeEvent?.isComposing
      || event.keyCode === IME_PROCESS_KEY
      || event.nativeEvent?.keyCode === IME_PROCESS_KEY,
  );
}

export function resolveSubmitIntent(event: SubmitKeyEvent, options: SubmitIntentOptions = {}): SubmitIntent {
  if (event.key !== 'Enter') return 'none';
  if (isComposingKey(event)) return 'composing';
  if (options.multiline && event.shiftKey) return 'newline';
  return 'submit';
}
