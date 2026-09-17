/**
 * @fileoverview Two handlers on one prop, without one of them disappearing.
 *
 * `useInteractionState().handlers` is a prop bag, and a JSX spread replaces a
 * colliding prop instead of chaining it: `{...rest} {...handlers}` drops the
 * caller's `onPointerDown`, and `{...handlers} {...rest}` drops the kernel's.
 * A part that owns state on a prop the caller also passes must take that prop
 * out of the spread and compose it here.
 */

/** The only event shape this needs: the flag that stops the chain. */
interface PreventableEvent {
  defaultPrevented?: boolean;
}

/**
 * Returns a handler that calls `first` and then `second`. `second` is skipped
 * when `first` prevented the event's default, so a caller can opt out of the
 * part's own reaction the same way it opts out of the platform's.
 */
export function composeHandlers<E extends PreventableEvent>(
  first: ((event: E) => void) | undefined,
  second: ((event: E) => void) | undefined
): (event: E) => void {
  return (event: E) => {
    first?.(event);
    if (event?.defaultPrevented) return;
    second?.(event);
  };
}
