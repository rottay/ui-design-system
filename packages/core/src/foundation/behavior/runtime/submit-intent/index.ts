/**
 * @fileoverview What an Enter key press means, decided once.
 *
 * Two decisions live here, and they are not the same decision. The FIELD-level
 * one (`resolveSubmitIntent`) reads key, composition and modifier state: an IME
 * confirming a candidate with Enter never commits the field. The DELEGATED one
 * (`resolveDelegatedSubmitIntent`) is for a form/surface root that listens on
 * the bubble path, where the press it sees may already belong to someone else.
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

/**
 * The extra facts a DELEGATED decision reads off a bubbled event: whether the
 * press was already consumed, and which element it started on.
 */
export interface DelegatedSubmitKeyEvent extends SubmitKeyEvent {
  readonly defaultPrevented?: boolean;
  readonly target?: EventTarget | null;
  readonly currentTarget?: EventTarget | null;
  readonly nativeEvent?: {
    readonly isComposing?: boolean;
    readonly keyCode?: number;
    readonly defaultPrevented?: boolean;
  };
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

/**
 * The elements whose Enter is their own. Native form and activation elements
 * were never an exhaustive boundary: a composite widget built from a `div` with
 * an interactive role owns Enter exactly as a `<button>` does.
 */
const INTERACTIVE_OWNER_SELECTOR = [
  'input',
  'textarea',
  'select',
  'button',
  'a',
  '[contenteditable]:not([contenteditable="false"])',
  '[role="button"]',
  '[role="link"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="option"]',
  '[role="treeitem"]',
  '[role="combobox"]',
  '[role="textbox"]',
  '[role="searchbox"]',
  '[role="spinbutton"]',
].join(', ');

function ownerOf(target: EventTarget | null | undefined, root: EventTarget | null | undefined) {
  if (!target || typeof (target as Element).closest !== 'function') return null;
  const owner = (target as Element).closest(INTERACTIVE_OWNER_SELECTOR);
  return owner && owner !== root ? owner : null;
}

/**
 * What an Enter press bubbling up to a form/surface ROOT means. It commits only
 * a press nobody below has claimed: a handled event (`defaultPrevented`) keeps
 * the meaning its own handler gave it, and a press that started inside a nested
 * interactive control belongs to that control, never to the implicit submit.
 */
export function resolveDelegatedSubmitIntent(
  event: DelegatedSubmitKeyEvent,
  options: SubmitIntentOptions = {},
): SubmitIntent {
  if (event.key !== 'Enter') return 'none';
  if (event.defaultPrevented || event.nativeEvent?.defaultPrevented) return 'none';
  const target = event.target as HTMLElement | null | undefined;
  if (target?.isContentEditable) return 'none';
  if (ownerOf(target, event.currentTarget)) return 'none';
  return resolveSubmitIntent(event, options);
}
