/**
 * The shapes the contract must REFUSE.
 *
 * Every leg is an `@ts-expect-error`, so the check cannot pass by being
 * permissive: a contract that STOPPED refusing one of them reddens this file
 * on an unused directive, and a leg that never refused anything reddens it by
 * being absent. The compiler is the assertion; the runtime case below only
 * keeps the file inside the suite that runs.
 */

import { describe, expect, it } from 'vitest';

import {
  useDragSession,
  type DragPayload,
  type SortableAnnounceEvent,
  type SortableDropZone,
} from '../index';

type ViewKey = { key: string };
type TreeKey = { key: string | number };
type TreeDestination = { key: string | number; position: SortableDropZone };
type KanbanTarget = { columnId: string; position: number };

const noop = () => {};

// R-1: the bound target may not carry the resolved destination's shape.
function useBoundTargetIsNotTheDestination() {
  const drag = useDragSession<ViewKey, ViewKey>({ onDrop: noop });
  // @ts-expect-error R-1
  return drag.getTargetProps({ key: 'a', position: 1 });
}

// R-2: the key widen must not leak a `number` into a string-keyed family.
function useNumericKeyDoesNotLeak() {
  const drag = useDragSession<TreeKey, TreeKey, TreeDestination>({
    onDrop: noop,
    resolveTarget: ({ target }) => ({ key: target.key, position: 'inside' }),
  });
  if (!drag.session) return '';
  // @ts-expect-error R-2
  const key: string = drag.session.payload.key;
  return key;
}

// R-3: `commit` takes the DESTINATION, which carries the resolved position.
function useCommitTakesTheDestination() {
  const drag = useDragSession<TreeKey, TreeKey, TreeDestination>({
    onDrop: noop,
    resolveTarget: ({ target }) => ({ key: target.key, position: 'inside' }),
  });
  // @ts-expect-error R-3
  return drag.commit({ key: 'a' });
}

// R-4: `resolveKeyboardTarget` is required in `'grab'` mode.
function useGrabModeRequiresItsResolver() {
  return useDragSession<ViewKey, ViewKey>({
    onDrop: noop,
    // @ts-expect-error R-4
    keyboard: { mode: 'grab', orientation: 'vertical' },
  });
}

// R-5: a delegated mode reads no key, so an axis would resolve nothing.
function useDelegatedModeHasNoAxis() {
  return useDragSession<ViewKey, ViewKey>({
    onDrop: noop,
    // @ts-expect-error R-5
    keyboard: { mode: 'delegated', crossAxis: 'horizontal' },
  });
}

// R-6: the kernel does not know what a container is.
function crossedContainerIsNotAnAnnounceField(
  event: SortableAnnounceEvent<ViewKey, KanbanTarget>
): boolean {
  if (event.kind !== 'moved') return false;
  // @ts-expect-error R-6
  return event.crossedContainer === true;
}

// R-7: a destination the bound target cannot supply has no producer, so the
// resolver is required rather than optional.
function useDestinationWithoutAProducerIsRefused() {
  // @ts-expect-error R-7
  return useDragSession<{ key: number }, { key: number }, { key: number; position: 'inside' }>({
    onDrop: noop,
  });
}

// R-8: the announcement origin is a CLOSED domain of the two paths there are.
function originIsAClosedDomain(event: SortableAnnounceEvent<ViewKey, ViewKey>): boolean {
  // @ts-expect-error R-8
  return event.origin === 'touch';
}

// R-9: a start-column snapshot has no producer other than the payload.
function useStartColumnRidesInThePayload() {
  return useDragSession<ViewKey, KanbanTarget>({
    onDrop: (payload, target) => {
      // @ts-expect-error R-9
      void `${payload.fromColumn}${target.columnId}`;
    },
  });
}

// The control: the same payload DECLARED with the extra field compiles, so
// R-9 refuses the missing producer and not the field itself.
function useDeclaredStartColumnCompiles() {
  return useDragSession<ViewKey & { fromColumn: string }, KanbanTarget>({
    onDrop: (payload, target) => {
      void `${payload.fromColumn}${target.columnId}`;
    },
  });
}

const LEGS = [
  useBoundTargetIsNotTheDestination,
  useNumericKeyDoesNotLeak,
  useCommitTakesTheDestination,
  useGrabModeRequiresItsResolver,
  useDelegatedModeHasNoAxis,
  crossedContainerIsNotAnAnnounceField,
  useDestinationWithoutAProducerIsRefused,
  originIsAClosedDomain,
  useStartColumnRidesInThePayload,
];

describe('sortable contract: the negative legs', () => {
  it('declares nine refused shapes, each proved by the compiler', () => {
    expect(LEGS).toHaveLength(9);
    expect(LEGS.every((leg) => typeof leg === 'function')).toBe(true);
    expect(typeof useDeclaredStartColumnCompiles).toBe('function');
  });

  it('the payload constraint stays the kernel-side contract', () => {
    const payload: DragPayload = { key: 1 };
    expect(payload.key).toBe(1);
  });
});
