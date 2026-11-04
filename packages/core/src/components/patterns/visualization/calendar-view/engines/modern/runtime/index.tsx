import React from 'react';
import { partAttributes, serializeState, useInteractionState } from '@/foundation/behavior';

/**
 * The day cell (a part) and the read-only event chip (named by its class hook,
 * no part) are STATEFUL: the shared interaction kernel alone decides when they
 * are hovered, pressed or focus-visible, and the skin pairs every platform
 * pseudo-class with the kernel token it stands for. At rest the kernel
 * serializes nothing, so `[data-state]` never matches a resting element and the
 * pseudo-class stays the fallback of one decision, not a second one (F-37).
 *
 * The caller's own `onFocus` / `onBlur` still run: the kernel owns the
 * element's state, the pattern owns the roving tab stop.
 */
type StatefulDivProps = React.HTMLAttributes<HTMLDivElement> & {
  [key: `data-${string}`]: string | number | boolean | undefined;
};

export const DayCell = React.forwardRef<HTMLDivElement, StatefulDivProps>(function DayCell(
  { children, onFocus, onBlur, ...rest },
  ref,
) {
  const interaction = useInteractionState();
  return (
    <div
      {...rest}
      {...interaction.handlers}
      onFocus={(event) => {
        interaction.handlers.onFocus(event);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        interaction.handlers.onBlur(event);
        onBlur?.(event);
      }}
      {...partAttributes('day-cell', interaction.state)}
      ref={ref}
    >
      {children}
    </div>
  );
});

export const EventChip = React.forwardRef<HTMLDivElement, StatefulDivProps>(function EventChip(
  { children, onFocus, onBlur, ...rest },
  ref,
) {
  const interaction = useInteractionState();
  return (
    <div
      {...rest}
      {...interaction.handlers}
      onFocus={(event) => {
        interaction.handlers.onFocus(event);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        interaction.handlers.onBlur(event);
        onBlur?.(event);
      }}
      data-state={serializeState(interaction.state)}
      ref={ref}
    >
      {children}
    </div>
  );
});
