'use client';

/**
 * @fileoverview Sortable kernel -- the single owner of the HTML5 drag session
 * a reorderable collection runs on, and of the pure resolvers that decide
 * where a move may land.
 *
 * Before this owner existed the same quartet -- `dragstart`, `dragover`,
 * `drop`, `dragend` -- was hand-rolled per family, and the copies had drifted
 * into three incompatible keyboard models, four spellings of the same order
 * normalizer and a set of guards no two families agreed on. The transport is
 * not a per-family opinion, so the laws below live here and nowhere else.
 *
 * TWO LAYERS. The session core owns WHEN something happened; the consumer owns
 * WHAT it means, WHERE it may land and WHAT it is called. Nothing here knows
 * what a column, a view, a candidate or a node is.
 *
 * PREVENT-DEFAULT LAW. An attached `dragover` handler cancels the event before
 * any consumer code runs. Without it the browser never fires `drop`. The only
 * way not to cancel is to attach no handler, which is
 * `getTargetProps(target, { eligible: false })`.
 *
 * TARGET LAW. The identity is bound at the call site: `getTargetProps(target)`
 * takes the consumer's own value, so the kernel never recovers an identity it
 * was not handed and never compares two targets. `resolveTarget` runs in two
 * phases: `'hover'` decides what the INDICATOR shows, `'drop'` decides what is
 * COMMITTED, and it is told which. `session.target` is the indicator -- on the
 * pointer path it is not the destination.
 *
 * TERMINAL LAW. Two entrypoints, two destination rules, one tail. The pointer
 * `drop` resolves the receiving element (P1-P3); `commit()` takes
 * `explicit ?? session.target` and invokes no resolver (K1-K3); both continue
 * into the shared tail (T1-T5), whose first step reserves the session BEFORE
 * any external call, so a commit is exactly-once and a throwing consumer
 * leaves no half-open session. `'immediate'` keyboard mode opens no session at
 * all and therefore has its own straight-line branch.
 *
 * STAMP LAW. The kernel returns event handlers and session state. It stamps no
 * `data-*`, writes no style and names no role: the four adopting families'
 * anatomies genuinely differ, and each derives its own stamps from `session`.
 *
 * COMPOSITION LAW. The returned bags are the ONLY handlers on the drag props.
 * A family that needs its own reaction declares it as an option, because the
 * repository's `composeHandlers` skips its second handler on a prevented
 * event and this kernel always prevents.
 *
 * SCOPE. This is the HTML5 transport session and nothing else. Pointer-transport
 * move/resize, auto-scroll, `setDragImage`, cross-window drags and D3 pointer
 * drags are outside it; the pure resolvers below are transport-neutral and are
 * what another transport may consume. External file drops are the second
 * capability in this owner, `useFileDropZone`.
 *
 * @module Primitives/Runtime/Collection/Sortable
 * @package @rottay/design-system
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  DragEvent as ReactDragEvent,
  DragEventHandler,
  KeyboardEvent as ReactKeyboardEvent,
  KeyboardEventHandler,
  PointerEvent as ReactPointerEvent,
  PointerEventHandler,
} from 'react';

import { useReadingDirectionIsRtl } from '@/infrastructure/runtime/i18n';

import { resolveNavigationIntent } from '../roving-focus';

// ============================================================================
// Vocabulary
// ============================================================================

/**
 * An item identity. `string | number` because a family key may be a React key
 * and the kernel must not force a lossy `String()` on the family's own
 * identity.
 */
export type DragKey = string | number;

/** What the consumer is dragging. The kernel never inspects it beyond `key`. */
export interface DragPayload {
  readonly key: DragKey;
}

/** Which entrypoint opened a session. Decides focus restoration. */
export type SortableOrigin = 'pointer' | 'keyboard';

/** The axis whose arrows a sortable owns. `'both'` is excluded by design. */
export type SortableAxis = 'horizontal' | 'vertical';

/**
 * A move that has not been committed, expressed on the logical axes. `first`
 * and `last` are deliberately absent: `Home`/`End` are not move keys.
 */
export type MoveIntent = 'prev-item' | 'next-item' | 'prev-container' | 'next-container';

/** The zone an edge rule resolves the cursor into. */
export type SortableDropZone = 'before' | 'inside' | 'after';

/** How many zones an edge rule splits a row into. */
export type SortableZoneModel = 'before-after' | 'before-inside-after';

/** Why a move was refused. */
export type SortableBlockedReason = 'edge' | 'no-destination';

/**
 * Every string literal this module may contain in expression position. A new
 * literal is therefore a compile-visible decision: protocol words, the two
 * transport values, the keys the keyboard modes bind and the one named
 * refusal. Product vocabulary -- a label, a role, a message -- is the
 * consumer's and can never be added here.
 */
export const SORTABLE_PROTOCOL_VOCABULARY = Object.freeze([
  ' ',
  'Enter',
  'Escape',
  'after',
  'before',
  'before-after',
  'before-inside-after',
  'blocked',
  'cancelled',
  'delegated',
  'drag-session/ambiguous-axis',
  'drop',
  'dropped',
  'dragging',
  'edge',
  'first',
  'grab',
  'grabbed',
  'hover',
  'immediate',
  'inside',
  'keyboard',
  'last',
  'move',
  'moved',
  'next',
  'next-container',
  'next-item',
  'no-destination',
  'pointer',
  'prev-container',
  'prev-item',
  'previous',
  'target',
  'text/plain',
] as const);

const DEFAULT_EDGE_RATIO = 0.25;
const DEFAULT_GRAB_KEYS = Object.freeze([' ', 'Enter']);
const CANCEL_KEY = 'Escape';
const TRANSFER_FORMAT = 'text/plain';
const TRANSFER_OPERATION = 'move';

/**
 * The named refusal for an axis pair that cannot tell an item move from a
 * container move. Unconditional rather than development-only: an ambiguous
 * pair is a static configuration error and must never resolve a key.
 */
const AMBIGUOUS_AXIS = 'drag-session/ambiguous-axis';

// ============================================================================
// Layer 2 -- the pure resolvers
// ============================================================================

/**
 * The 3-zone (or 2-zone) edge rule, stated once and testable without a DOM.
 *
 * The comparisons are STRICT: exact equality at either boundary is `inside`,
 * which is the arithmetic the hierarchical families already ship.
 */
export function resolveEdgeZone(
  rect: { top: number; height: number },
  clientY: number,
  options: { zones: SortableZoneModel; edgeRatio?: number }
): SortableDropZone {
  const { zones, edgeRatio = DEFAULT_EDGE_RATIO } = options;
  const offset = clientY - rect.top;

  if (zones === 'before-after') {
    return offset < rect.height / 2 ? 'before' : 'after';
  }
  if (offset < rect.height * edgeRatio) {
    return 'before';
  }
  if (offset > rect.height * (1 - edgeRatio)) {
    return 'after';
  }
  return 'inside';
}

/**
 * The one order normalizer. Never mutates: the source leaves its position and
 * is inserted at the target's index in the ORIGINAL order, so moving forward
 * and moving backward are deliberately asymmetric.
 */
export function reorderByKey(
  order: readonly string[],
  sourceKey: string,
  targetKey: string
): string[] {
  const next = [...order];
  const from = next.indexOf(sourceKey);
  const to = next.indexOf(targetKey);
  if (from === -1 || to === -1 || from === to) {
    return next;
  }
  next.splice(from, 1);
  next.splice(to, 0, sourceKey);
  return next;
}

/**
 * A key becomes a MOVE intent on the logical axes. The reading-direction law
 * is delegated to the navigation authority and never restated here: the
 * resolver is called once per declared axis, and the axis that answers
 * non-`null` decides item versus container.
 */
export function resolveMoveIntent(
  key: string,
  options: { orientation: SortableAxis; rtl: boolean; crossAxis?: SortableAxis }
): MoveIntent | null {
  const { orientation, rtl, crossAxis } = options;

  if (crossAxis !== undefined && crossAxis === orientation) {
    throw new Error(AMBIGUOUS_AXIS);
  }

  const primary = resolveNavigationIntent(key, { orientation, rtl });
  if (primary === 'next') return 'next-item';
  if (primary === 'previous') return 'prev-item';
  if (primary !== null) return null;

  if (crossAxis === undefined) return null;
  const cross = resolveNavigationIntent(key, { orientation: crossAxis, rtl });
  if (cross === 'next') return 'next-container';
  if (cross === 'previous') return 'prev-container';
  return null;
}

// ============================================================================
// Layer 1 -- the HTML5 session core
// ============================================================================

export interface DragSession<TPayload extends DragPayload, TDestination> {
  readonly payload: TPayload;
  /** Where the move would land if it committed now. `null` = no destination. */
  readonly target: TDestination | null;
  readonly origin: SortableOrigin;
  /** `grabbed` exists only in `'grab'` and `'delegated'` sessions. */
  readonly phase: 'dragging' | 'grabbed';
}

export interface SortableSourceProps {
  readonly draggable: boolean;
  readonly onDragStart?: DragEventHandler<Element>;
  readonly onDragEnd?: DragEventHandler<Element>;
  readonly onPointerCancel?: PointerEventHandler<Element>;
  readonly onKeyDown?: KeyboardEventHandler<Element>;
}

/**
 * Both handlers are optional so an ineligible target can return an EMPTY bag:
 * a family that detaches its drop surface entirely attaches no `onDragOver`,
 * and therefore cancels nothing.
 */
export interface SortableTargetProps {
  readonly onDragOver?: DragEventHandler<Element>;
  readonly onDrop?: DragEventHandler<Element>;
}

/**
 * The resolver runs in TWO PHASES and is told which.
 *
 * `'hover'` decides what the indicator shows on `dragover`; returning `current`
 * HOLDS the previous one and `null` CLEARS it. `'drop'` decides what is
 * committed and receives the identity bound on the element the drop landed on,
 * never the held indicator; `null` REFUSES the commit. The two are different
 * questions and adopting families answer them differently for a self-target.
 */
export type TargetResolver<TPayload extends DragPayload, TTarget, TDestination> = (
  context: {
    readonly phase: 'hover' | 'drop';
    readonly event: ReactDragEvent;
    readonly payload: TPayload;
    /** The identity bound at THIS element's `getTargetProps(target)` call site. */
    readonly target: TTarget;
    /** The destination the session is holding right now -- the INDICATOR. */
    readonly current: TDestination | null;
  }
) => TDestination | null;

/**
 * The resolver is REQUIRED when the bound target cannot supply the
 * destination: a destination field the bound identity does not carry has no
 * other producer on the pointer path.
 */
export type ResolverRequirement<TPayload extends DragPayload, TTarget, TDestination> =
  [TTarget] extends [TDestination]
    ? { readonly resolveTarget?: TargetResolver<TPayload, TTarget, TDestination> }
    : { readonly resolveTarget: TargetResolver<TPayload, TTarget, TDestination> };

export type KeyboardTargetResolver<TPayload extends DragPayload, TDestination> = (
  context: {
    readonly payload: TPayload;
    readonly intent: MoveIntent;
    /**
     * The session's current candidate; `null` on the first move after `start`.
     * Successive arrows advance from HERE, because during a candidate phase
     * the committed data has not moved and the payload's index is stale.
     */
    readonly candidate: TDestination | null;
  }
) =>
  | { readonly kind: 'target'; readonly target: TDestination }
  | { readonly kind: 'blocked' };

/** An arrow moves the item NOW and announces the result. No grabbed state. */
export interface SortableImmediateKeyboard<TPayload extends DragPayload, TDestination> {
  readonly mode: 'immediate';
  readonly orientation: SortableAxis;
  readonly crossAxis?: SortableAxis;
  readonly resolveKeyboardTarget: KeyboardTargetResolver<TPayload, TDestination>;
}

/** A grab key opens a candidate session; arrows choose; the grab key commits. */
export interface SortableGrabKeyboard<TPayload extends DragPayload, TDestination> {
  readonly mode: 'grab';
  readonly orientation: SortableAxis;
  readonly crossAxis?: SortableAxis;
  /** Default `[' ', 'Enter']`; a source that already owns those MUST name others. */
  readonly grabKeys?: readonly string[];
  readonly resolveKeyboardTarget: KeyboardTargetResolver<TPayload, TDestination>;
}

/**
 * The kernel binds NO key. The family drives `start()` / `move()` /
 * `commit()` / `cancel()`. The resolver is required only if the family calls
 * `move()`; a family that commits an absolute destination needs none.
 * `orientation` and `crossAxis` are absent by construction, because the kernel
 * reads no key here and an axis would resolve nothing.
 */
export interface SortableDelegatedKeyboard<TPayload extends DragPayload, TDestination> {
  readonly mode: 'delegated';
  readonly resolveKeyboardTarget?: KeyboardTargetResolver<TPayload, TDestination>;
}

export type SortableKeyboardOptions<TPayload extends DragPayload, TDestination> =
  | SortableImmediateKeyboard<TPayload, TDestination>
  | SortableGrabKeyboard<TPayload, TDestination>
  | SortableDelegatedKeyboard<TPayload, TDestination>;

/**
 * The kernel owns the WHEN and the politeness; the consumer owns the TEXT and
 * the region. Every event carries its `origin`, which is how a family keeps a
 * keyboard-only announcement keyboard-only.
 */
export type SortableAnnounceEvent<TPayload extends DragPayload, TDestination> =
  | { readonly kind: 'grabbed'; readonly origin: SortableOrigin; readonly payload: TPayload }
  | {
      readonly kind: 'moved';
      readonly origin: SortableOrigin;
      readonly payload: TPayload;
      readonly target: TDestination;
    }
  | {
      readonly kind: 'dropped';
      readonly origin: SortableOrigin;
      readonly payload: TPayload;
      readonly target: TDestination;
    }
  | { readonly kind: 'cancelled'; readonly origin: SortableOrigin; readonly payload: TPayload }
  | {
      readonly kind: 'blocked';
      readonly origin: SortableOrigin;
      readonly payload: TPayload;
      readonly reason: SortableBlockedReason;
    };

export interface UseDragSessionBaseOptions<
  TPayload extends DragPayload,
  TTarget,
  TDestination = TTarget,
> {
  /**
   * Off switch: no source is draggable, no session opens, no commit runs. It
   * does NOT detach the target handlers -- a family may keep a drop surface
   * live while its own source is off. Detaching a target is
   * `getTargetProps`'s own `eligible`.
   */
  readonly disabled?: boolean;

  /**
   * THE SINGLE COMMIT POINT, for the pointer path and the keyboard path
   * alike. The kernel mutates no array and does not know whether the consumer
   * commits now or stages a draft. Called at most once per session.
   */
  readonly onDrop: (payload: TPayload, target: TDestination) => void;

  /** Fires on `dragend` WITHOUT a commit, and on `cancel()`. */
  readonly onCancel?: (payload: TPayload) => void;

  /** Fires after the kernel wrote `dataTransfer` and opened the session. */
  readonly onDragStarted?: (payload: TPayload) => void;

  /**
   * Press-cancel for a source that does NOT own a component-local cleanup
   * boundary. Where the source component owns its own interaction-state
   * instance the boundary belongs there and this option stays unset. When
   * supplied the kernel calls it from BOTH `onDragEnd` and the
   * `onPointerCancel` it then adds to the source bag: an HTML5 drag swallows
   * the `pointerup`, so drag end is the route that matters.
   */
  readonly pressCancel?: (event: ReactPointerEvent) => void;

  /** The keyboard contract, IN the API rather than beside it. */
  readonly keyboard?: SortableKeyboardOptions<TPayload, TDestination>;

  /** The announcement contract, IN the API rather than beside it. */
  readonly onAnnounce?: (event: SortableAnnounceEvent<TPayload, TDestination>) => void;
}

export type UseDragSessionOptions<
  TPayload extends DragPayload,
  TTarget,
  TDestination = TTarget,
> = UseDragSessionBaseOptions<TPayload, TTarget, TDestination> &
  ResolverRequirement<TPayload, TTarget, TDestination>;

export interface UseDragSessionResult<
  TPayload extends DragPayload,
  TTarget,
  TDestination = TTarget,
> {
  /** Null between sessions. Never a partial session. */
  readonly session: DragSession<TPayload, TDestination> | null;

  /**
   * Spread on the drag SOURCE. `eligible` is PER SOURCE and defaults to
   * `true`, because a family may compute it per row where a session-level
   * `disabled` cannot reach.
   */
  getSourceProps(
    payload: TPayload,
    options?: { readonly eligible?: boolean }
  ): SortableSourceProps;

  /**
   * Spread on a drop TARGET. `target` IS the bound identity, bound at the call
   * site exactly where the family's closure binds it today. Source and target
   * may be the same element, and the SAME bound value reaches both handlers,
   * which is what lets a `drop` resolve its own receiving element.
   *
   * `eligible: false` returns an EMPTY bag: no `onDragOver`, no `onDrop` and
   * therefore no `preventDefault`.
   */
  getTargetProps(
    target: TTarget,
    options?: { readonly stopPropagation?: boolean; readonly eligible?: boolean }
  ): SortableTargetProps;

  /** Focus restoration for keyboard commits. Optional to call. */
  registerItem(key: DragKey): (element: HTMLElement | null) => void;

  /** Opens a KEYBOARD session on `payload`, optionally seeded with a destination. */
  start(payload: TPayload, options?: { readonly target?: TDestination }): void;

  /**
   * Advances the candidate. Requires an open session and a keyboard resolver,
   * and RETURNS whether the candidate advanced, so a delegated family can tell
   * a refused move from an accepted one.
   */
  move(intent: MoveIntent): boolean;

  /**
   * Commits on the KEYBOARD branch of the terminal sequence: there is no
   * receiving element and no drop event here, so the `'drop'`-phase resolver
   * is NOT invoked and the destination is `explicit ?? session.target`. A null
   * destination closes the session and announces `blocked`. Returns whether
   * `onDrop` ran.
   */
  commit(destination?: TDestination): boolean;

  /**
   * Closes the session. Emits `cancelled` only when a candidate exists: a
   * cancel that abandons nothing announces nothing.
   */
  cancel(): void;
}

export function useDragSession<
  TPayload extends DragPayload,
  TTarget,
  TDestination = TTarget,
>(
  options: UseDragSessionOptions<TPayload, TTarget, TDestination>
): UseDragSessionResult<TPayload, TTarget, TDestination> {
  const {
    disabled = false,
    onDrop,
    onCancel,
    onDragStarted,
    pressCancel,
    keyboard,
    onAnnounce,
  } = options as UseDragSessionBaseOptions<TPayload, TTarget, TDestination>;
  const { resolveTarget } = options as {
    resolveTarget?: TargetResolver<TPayload, TTarget, TDestination>;
  };

  const rtl = useReadingDirectionIsRtl();

  const sessionRef = useRef<DragSession<TPayload, TDestination> | null>(null);
  const [session, setSession] = useState<DragSession<TPayload, TDestination> | null>(null);

  const elementsRef = useRef(new Map<DragKey, HTMLElement>());
  const registrationsRef = useRef(new Map<DragKey, (element: HTMLElement | null) => void>());
  const pendingFocusRef = useRef<DragKey | null>(null);
  const [pendingFocusKey, setPendingFocusKey] = useState<DragKey | null>(null);

  const writeSession = (next: DragSession<TPayload, TDestination> | null): void => {
    sessionRef.current = next;
    setSession(next);
  };

  const focusPending = useCallback((): void => {
    const key = pendingFocusRef.current;
    if (key === null) return;
    const element = elementsRef.current.get(key);
    if (!element) return;
    element.focus();
    pendingFocusRef.current = null;
    setPendingFocusKey(null);
  }, []);

  useEffect(() => {
    focusPending();
  }, [pendingFocusKey, focusPending]);

  const requestFocus = (key: DragKey): void => {
    pendingFocusRef.current = key;
    setPendingFocusKey(key);
  };

  const registerItem = useCallback(
    (key: DragKey) => {
      const cached = registrationsRef.current.get(key);
      if (cached) return cached;
      const registration = (element: HTMLElement | null): void => {
        if (element) {
          elementsRef.current.set(key, element);
          focusPending();
          return;
        }
        elementsRef.current.delete(key);
      };
      registrationsRef.current.set(key, registration);
      return registration;
    },
    [focusPending]
  );

  /**
   * T1-T5: reserve the session before any external call, clear the rendered
   * mirror, run the consumer's commit, restore focus for a keyboard origin,
   * announce. Nothing after T1 re-reads the ref, and no step is wrapped in a
   * `finally`: a throwing consumer propagates, and what the reservation buys
   * is that it still leaves no half-open session.
   */
  const finalize = (
    open: DragSession<TPayload, TDestination>,
    destination: TDestination
  ): boolean => {
    const { payload, origin } = open;
    sessionRef.current = null;
    setSession(null);
    onDrop(payload, destination);
    if (origin === 'keyboard') {
      requestFocus(payload.key);
    }
    onAnnounce?.({ kind: 'dropped', origin, payload, target: destination });
    return true;
  };

  const refuse = (open: DragSession<TPayload, TDestination>): boolean => {
    sessionRef.current = null;
    setSession(null);
    onAnnounce?.({
      kind: 'blocked',
      origin: open.origin,
      payload: open.payload,
      reason: 'no-destination',
    });
    return false;
  };

  const commit = (destination?: TDestination): boolean => {
    const open = sessionRef.current;
    if (!open) return false;
    const resolved = destination ?? open.target;
    if (resolved === null || resolved === undefined) return refuse(open);
    return finalize(open, resolved);
  };

  const cancel = (): void => {
    const open = sessionRef.current;
    if (!open) return;
    sessionRef.current = null;
    setSession(null);
    onCancel?.(open.payload);
    if (open.target !== null) {
      onAnnounce?.({ kind: 'cancelled', origin: open.origin, payload: open.payload });
    }
  };

  const move = (intent: MoveIntent): boolean => {
    const open = sessionRef.current;
    if (!open) return false;
    const resolver = keyboard?.resolveKeyboardTarget;
    if (!resolver) return false;
    const outcome = resolver({ payload: open.payload, intent, candidate: open.target });
    if (outcome.kind === 'blocked') {
      onAnnounce?.({
        kind: 'blocked',
        origin: open.origin,
        payload: open.payload,
        reason: 'edge',
      });
      return false;
    }
    writeSession({ ...open, target: outcome.target });
    if (open.origin === 'keyboard') {
      onAnnounce?.({
        kind: 'moved',
        origin: open.origin,
        payload: open.payload,
        target: outcome.target,
      });
    }
    return true;
  };

  const start = (payload: TPayload, startOptions?: { readonly target?: TDestination }): void => {
    if (disabled) return;
    writeSession({
      payload,
      target: startOptions?.target ?? null,
      origin: 'keyboard',
      phase: 'grabbed',
    });
    onAnnounce?.({ kind: 'grabbed', origin: 'keyboard', payload });
  };

  /**
   * `'immediate'` opens no session, so it cannot run the session sequence
   * whose first step returns on a null session. Its straight-line branch is
   * the shipped behaviour of the one family that has a keyboard move: resolve,
   * announce the blocked edge or commit, then focus, then announce.
   */
  const commitImmediate = (
    payload: TPayload,
    intent: MoveIntent,
    resolver: KeyboardTargetResolver<TPayload, TDestination>
  ): void => {
    const outcome = resolver({ payload, intent, candidate: null });
    if (outcome.kind === 'blocked') {
      onAnnounce?.({ kind: 'blocked', origin: 'keyboard', payload, reason: 'edge' });
      return;
    }
    onDrop(payload, outcome.target);
    requestFocus(payload.key);
    onAnnounce?.({
      kind: 'dropped',
      origin: 'keyboard',
      payload,
      target: outcome.target,
    });
  };

  const handleDragStart = (event: ReactDragEvent, payload: TPayload): void => {
    if (disabled) return;
    event.dataTransfer.effectAllowed = TRANSFER_OPERATION;
    event.dataTransfer.setData(TRANSFER_FORMAT, String(payload.key));
    writeSession({ payload, target: null, origin: 'pointer', phase: 'dragging' });
    onDragStarted?.(payload);
  };

  const handleDragEnd = (event: ReactDragEvent): void => {
    const open = sessionRef.current;
    if (open) {
      sessionRef.current = null;
      setSession(null);
      onCancel?.(open.payload);
      onAnnounce?.({ kind: 'cancelled', origin: open.origin, payload: open.payload });
    }
    pressCancel?.(event as unknown as ReactPointerEvent);
  };

  const handleKeyDown = (event: ReactKeyboardEvent, payload: TPayload): void => {
    // A key pressed on a control INSIDE the source belongs to that control.
    if (event.target !== event.currentTarget) return;
    if (!keyboard) return;

    if (keyboard.mode === 'immediate') {
      const intent = resolveMoveIntent(event.key, {
        orientation: keyboard.orientation,
        rtl,
        crossAxis: keyboard.crossAxis,
      });
      if (intent === null) return;
      event.preventDefault();
      commitImmediate(payload, intent, keyboard.resolveKeyboardTarget);
      return;
    }

    if (keyboard.mode !== 'grab') return;

    const grabKeys = keyboard.grabKeys ?? DEFAULT_GRAB_KEYS;
    const open = sessionRef.current;
    if (grabKeys.includes(event.key)) {
      event.preventDefault();
      if (open) commit();
      else start(payload);
      return;
    }
    if (!open) return;
    if (event.key === CANCEL_KEY) {
      event.preventDefault();
      cancel();
      return;
    }
    const intent = resolveMoveIntent(event.key, {
      orientation: keyboard.orientation,
      rtl,
      crossAxis: keyboard.crossAxis,
    });
    if (intent === null) return;
    event.preventDefault();
    move(intent);
  };

  const getSourceProps = (
    payload: TPayload,
    sourceOptions?: { readonly eligible?: boolean }
  ): SortableSourceProps => {
    if (disabled) return { draggable: false };
    if (sourceOptions?.eligible === false) {
      return { draggable: false, onDragEnd: handleDragEnd };
    }
    const bindsKeys = keyboard?.mode === 'immediate' || keyboard?.mode === 'grab';
    return {
      draggable: true,
      onDragStart: (event) => handleDragStart(event, payload),
      onDragEnd: handleDragEnd,
      ...(pressCancel ? { onPointerCancel: pressCancel } : {}),
      ...(bindsKeys ? { onKeyDown: (event) => handleKeyDown(event, payload) } : {}),
    };
  };

  const getTargetProps = (
    target: TTarget,
    targetOptions?: { readonly stopPropagation?: boolean; readonly eligible?: boolean }
  ): SortableTargetProps => {
    if (targetOptions?.eligible === false) return {};

    return {
      onDragOver: (event) => {
        if (targetOptions?.stopPropagation) event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = TRANSFER_OPERATION;
        const open = sessionRef.current;
        if (!open) return;
        const next = resolveTarget
          ? resolveTarget({
              phase: 'hover',
              event,
              payload: open.payload,
              target,
              current: open.target,
            })
          : (target as unknown as TDestination);
        if (next === open.target) return;
        writeSession({ ...open, target: next });
      },
      onDrop: (event) => {
        event.preventDefault();
        if (targetOptions?.stopPropagation) event.stopPropagation();
        // P1: no session is a foreign drag, or a drop already committed on an
        // inner target in the same event.
        const open = sessionRef.current;
        if (!open) return;
        // P2: the destination is the RECEIVING element's, never the indicator.
        const destination = resolveTarget
          ? resolveTarget({
              phase: 'drop',
              event,
              payload: open.payload,
              target,
              current: open.target,
            })
          : (target as unknown as TDestination);
        // P3: a refusal closes the session here, so the `dragend` that follows
        // finds none and is a no-op.
        if (destination === null) {
          refuse(open);
          return;
        }
        finalize(open, destination);
      },
    };
  };

  useEffect(() => {
    if (!disabled) return;
    const open = sessionRef.current;
    if (!open) return;
    sessionRef.current = null;
    setSession(null);
    onCancel?.(open.payload);
    if (open.target !== null) {
      onAnnounce?.({ kind: 'cancelled', origin: open.origin, payload: open.payload });
    }
  }, [disabled, onCancel, onAnnounce]);

  return {
    session,
    getSourceProps,
    getTargetProps,
    registerItem,
    start,
    move,
    commit,
    cancel,
  };
}

// ============================================================================
// Second capability: the external file drop zone
// ============================================================================

export interface FileDropZoneProps {
  readonly onDragOver: DragEventHandler<Element>;
  readonly onDragLeave: DragEventHandler<Element>;
  readonly onDrop: DragEventHandler<Element>;
}

export interface UseFileDropZoneOptions {
  readonly disabled?: boolean;
  /** The raw event, for consumers that expose it publicly. Called BEFORE onFiles. */
  readonly onDropEvent?: (event: ReactDragEvent) => void;
  readonly onFiles: (files: File[]) => void;
}

export interface UseFileDropZoneResult {
  readonly isDragOver: boolean;
  readonly dropZoneProps: FileDropZoneProps;
}

/**
 * The external-file half of the same transport. It owns the `dragover`
 * cancellation and the `dragleave` containment rule -- a `relatedTarget`
 * inside the zone is not an exit, a `null` one is (the pointer left the
 * window) -- and it identifies nothing: the file list passes through
 * untouched, so each consumer keeps its own acceptance rules inside `onFiles`.
 */
export function useFileDropZone(options: UseFileDropZoneOptions): UseFileDropZoneResult {
  const { disabled = false, onDropEvent, onFiles } = options;
  const [isDragOver, setIsDragOver] = useState(false);

  return {
    isDragOver,
    dropZoneProps: {
      onDragOver: (event) => {
        event.preventDefault();
        if (!disabled) setIsDragOver(true);
      },
      onDragLeave: (event) => {
        if (disabled) return;
        const next = event.relatedTarget as Node | null;
        if (next && event.currentTarget.contains(next)) return;
        setIsDragOver(false);
      },
      onDrop: (event) => {
        event.preventDefault();
        if (disabled) return;
        setIsDragOver(false);
        onDropEvent?.(event);
        onFiles(Array.from(event.dataTransfer.files));
      },
    },
  };
}
