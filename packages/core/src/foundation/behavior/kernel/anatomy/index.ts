/**
 * @fileoverview The anatomy contract: what a component is made of, and what
 * state each part is in.
 *
 * A component's BEHAVIOR — keyboard navigation, focus management, aria wiring,
 * open/close and selection state, and the hover/press/focus triad — belongs
 * here, once. Its SKIN reads the result off the DOM through `data-part` and
 * `data-state` attributes and paints. Two skins of the same component share the
 * behavior; they do not each re-implement it.
 *
 * The rule this exists to enforce: a state that one engine honours and its twin
 * silently drops is the defect this design system has found nine times. Today
 * the modern Button presses via `scale(var(--ds-state-press-scale))` and the
 * rustic Button presses via `var(--ds-button-active-transform, scale(0.97))` —
 * two engines, two different press semantics, one prop. A skin that reads
 * `[data-state~='pressed']` cannot diverge that way, because there is one place
 * that decides when a part is pressed.
 */

/**
 * A named part of a component, stamped onto the DOM as `data-part`.
 *
 * Parts are structural, never semantic: `trigger`, `content`, `indicator`. A
 * part name never encodes what the component means to a product ("candidate",
 * "invoice"); that would put domain vocabulary in the design system.
 */
export type PartName = string;

/**
 * The interaction states a part can be in, stamped onto the DOM as `data-state`
 * as a space-separated list so a skin can match `[data-state~='hovered']`.
 *
 * `focusVisible` is deliberately NOT `focused`. A focus ring that appears when a
 * mouse clicks the control is noise; the ring is a keyboard affordance. The
 * platform draws that line with `:focus-visible`, and so does this contract.
 */
export interface InteractionState {
  /** The pointer is over the part. */
  hovered: boolean;
  /** The primary pointer button, or the space/enter key, is held down on it. */
  pressed: boolean;
  /** The part has DOM focus, however it arrived. */
  focused: boolean;
  /** The part has focus AND the platform says a focus ring belongs on it. */
  focusVisible: boolean;
  /** The part cannot be interacted with. */
  disabled: boolean;
}

/** Every flag a skin may match on, in the order they are serialized. */
const STATE_FLAG_ORDER: readonly (keyof InteractionState)[] = [
  'disabled',
  'hovered',
  'pressed',
  'focused',
  'focusVisible',
];

/**
 * Serializes an interaction state into the `data-state` token list.
 *
 * Returns `undefined` rather than an empty string when nothing is active, so the
 * attribute is absent from the DOM instead of present-and-empty. `[data-state]`
 * must not match a part in its resting state.
 */
export function serializeState(state: Partial<InteractionState>): string | undefined {
  const active = STATE_FLAG_ORDER.filter((flag) => state[flag]);
  return active.length > 0 ? active.map(toKebab).join(' ') : undefined;
}

function toKebab(flag: keyof InteractionState): string {
  return flag === 'focusVisible' ? 'focus-visible' : flag;
}

/**
 * The DOM attributes a skin consumes. Spread onto the element that IS the part.
 */
export interface PartAttributes {
  'data-part': PartName;
  'data-state'?: string;
}

export function partAttributes(part: PartName, state: Partial<InteractionState>): PartAttributes {
  const serialized = serializeState(state);
  return serialized === undefined
    ? { 'data-part': part }
    : { 'data-part': part, 'data-state': serialized };
}
