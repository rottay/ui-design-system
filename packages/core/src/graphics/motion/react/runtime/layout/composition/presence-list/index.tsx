'use client';

/**
 * @fileoverview PresenceList -- Rottay Design System
 *
 * Keeps each REMOVED child of a keyed list mounted for the duration of its own
 * CSS exit motion, then drops it. `usePresence` documents itself as single-node;
 * this is the list equivalent, and it stays CSS-owned: the child receives
 * `data-ds-presence="closed"` and the stylesheet decides what closing looks like.
 * Key presence CSS on `[data-ds-presence]`, the list's own seam. The list still
 * stamps `data-state` for compatibility, but a child that keeps its own
 * `data-state` anatomy (P-88) never forwards it; migrate selectors off it.
 *
 * Children must carry stable React keys -- the key IS the identity this diffs --
 * and must spread unknown props onto the element that carries their motion,
 * which is how the list stamps its seam and observes the end event.
 *
 * @example
 * ```tsx
 * <PresenceList>
 *   {items.map((item) => <Row key={item.id} item={item} />)}
 * </PresenceList>
 * ```
 */

import React, {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import type { ReactElement, ReactNode, SyntheticEvent } from 'react';

import { readExitWindowMs } from '../../kernel/measure';
import { useReducedMotion } from '../../../foundation/preference';

/** Marks an exiting child so its own node is findable without holding a ref. */
export const PRESENCE_ITEM_ATTRIBUTE = 'data-ds-presence-item';

/** The list-owned presence state, `open` | `closed`; the selector presence CSS keys on. */
const PRESENCE_STATE_ATTRIBUTE = 'data-ds-presence';

export interface PresenceListProps {
  children?: ReactNode;
  /** Override the live `prefers-reduced-motion` reading (primarily for tests). */
  reducedMotion?: boolean;
  /** Fires per key, after that child has actually stopped rendering. */
  onExitComplete?: (key: string) => void;
}

type KeyedChild = { key: string; element: ReactElement };

function keyedChildren(children: ReactNode): KeyedChild[] {
  const entries: KeyedChild[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child) || child.key === null) return;
    entries.push({ key: String(child.key), element: child as ReactElement });
  });
  return entries;
}

/** Re-inserts each closing key after the nearest key that preceded it last render. */
function placeExiting(previous: string[], presentOrder: string[], closing: Set<string>): string[] {
  const order = [...presentOrder];
  previous.forEach((key, index) => {
    if (!closing.has(key) || order.includes(key)) return;
    let at = 0;
    for (let before = index - 1; before >= 0; before -= 1) {
      const anchor = order.indexOf(previous[before]);
      if (anchor !== -1) {
        at = anchor + 1;
        break;
      }
    }
    order.splice(at, 0, key);
  });
  return order;
}

export function PresenceList({
  children,
  reducedMotion: reducedMotionOverride,
  onExitComplete,
}: PresenceListProps): React.ReactElement {
  const systemReducedMotion = useReducedMotion();
  const reducedMotion = reducedMotionOverride ?? systemReducedMotion;
  const scope = useId();

  const present = keyedChildren(children);
  const presentKeys = new Set(present.map((entry) => entry.key));
  const renderedRef = useRef(new Map<string, ReactElement>());
  const orderRef = useRef<string[]>([]);
  const [exitingKeys, setExitingKeys] = useState<string[]>([]);
  const pendingExitsRef = useRef<string[]>([]);
  const onExitCompleteRef = useRef(onExitComplete);
  onExitCompleteRef.current = onExitComplete;

  // Keyed and idempotent, so a re-render cannot lose the markup an exiting child
  // still needs; a render-phase update of own state is what derives the list.
  for (const entry of present) renderedRef.current.set(entry.key, entry.element);
  const removed = [...renderedRef.current.keys()].filter(
    (key) => !presentKeys.has(key) && !exitingKeys.includes(key),
  );
  if (removed.length > 0) {
    if (reducedMotion) {
      for (const key of removed) {
        renderedRef.current.delete(key);
        if (!pendingExitsRef.current.includes(key)) pendingExitsRef.current.push(key);
      }
    } else setExitingKeys((keys) => [...keys, ...removed]);
  }

  const drop = useCallback((key: string) => {
    renderedRef.current.delete(key);
    setExitingKeys((keys) => keys.filter((candidate) => candidate !== key));
    onExitCompleteRef.current?.(key);
  }, []);

  // Under reduce the child is dropped on the SAME commit, so there is no exit
  // effect to notify from; the callback the contract promises fires from here.
  useEffect(() => {
    if (pendingExitsRef.current.length === 0) return;
    const notified = pendingExitsRef.current;
    pendingExitsRef.current = [];
    for (const key of notified) onExitCompleteRef.current?.(key);
  });

  const exiting = exitingKeys
    .filter((key) => !presentKeys.has(key))
    .map((key) => ({ key, element: renderedRef.current.get(key) }))
    .filter((entry): entry is KeyedChild => entry.element !== undefined);

  // A child that declares no exit motion is dropped on this commit; one that
  // does gets the window it declared as the fallback for a missing end event.
  useEffect(() => {
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    for (const { key } of exiting) {
      const node = document.querySelector<HTMLElement>(
        `[${PRESENCE_ITEM_ATTRIBUTE}="${scope}${key}"]`,
      );
      const windowMs = node ? readExitWindowMs(node) : 0;
      if (windowMs <= 0) drop(key);
      else timers.push(setTimeout(() => drop(key), windowMs + 100));
    }
    return () => {
      for (const timer of timers) clearTimeout(timer);
    };
  }, [drop, exiting.map((entry) => entry.key).join('\u0000'), scope]);

  const handleEnd = (key: string) => (event: SyntheticEvent) => {
    if (event.target !== event.currentTarget) return;
    drop(key);
  };

  // One keyed array in the last rendered order: an exiting child keeps its DOM
  // node (focus, ref, a transition from its open style) and its slot.
  const closing = new Set([...exiting.map((entry) => entry.key), ...(reducedMotion ? [] : removed)]);
  const order = placeExiting(orderRef.current, present.map((entry) => entry.key), closing);
  orderRef.current = order;

  return (
    <>
      {order.map((key) => {
        const element = renderedRef.current.get(key);
        if (!element) return null;
        if (presentKeys.has(key)) {
          return cloneElement(element, {
            [PRESENCE_STATE_ATTRIBUTE]: 'open',
            'data-state': 'open',
          } as never);
        }
        return cloneElement(element, {
          [PRESENCE_STATE_ATTRIBUTE]: 'closed',
          'data-state': 'closed',
          [PRESENCE_ITEM_ATTRIBUTE]: `${scope}${key}`,
          onTransitionEnd: handleEnd(key),
          onAnimationEnd: handleEnd(key),
        } as never);
      })}
    </>
  );
}
