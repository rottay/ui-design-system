import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { FilterGroup, FilterRule } from '../../../contracts';

const ALLOCATOR_KEY = Symbol.for('rottay.design-system.filter-builder.ids');

/** A module instance created after a page reload: no runtime state survives. */
async function newSession() {
  delete (globalThis as Record<symbol, unknown>)[ALLOCATOR_KEY];
  vi.resetModules();
  return import('../index');
}

/** A second copy of the module inside the SAME runtime (SSR + client chunk). */
async function newModuleInstance() {
  vi.resetModules();
  return import('../index');
}

function rule(id: string, field = 'status'): FilterRule {
  return { id, field, operator: 'equals', value: 'open' };
}

function collectIds(group: FilterGroup): string[] {
  return group.rules.flatMap((node) =>
    'rules' in node ? [node.id, ...collectIds(node)] : [node.id]
  );
}

describe('filter tree identity across module lifetimes', () => {
  beforeEach(() => {
    delete (globalThis as Record<symbol, unknown>)[ALLOCATOR_KEY];
    vi.resetModules();
  });

  it('never reissues an id carried by a restored tree', async () => {
    const restored: FilterGroup = {
      id: 'f-1',
      logic: 'and',
      rules: [rule('f-2'), { id: 'f-3', logic: 'or', rules: [rule('f-4', 'owner')] }],
    };

    const { generateFilterId } = await newSession();
    const issued = [
      generateFilterId(restored),
      generateFilterId(restored),
      generateFilterId(restored),
    ];

    expect(issued).toEqual(['f-5', 'f-6', 'f-7']);
    expect(new Set([...collectIds(restored), restored.id, ...issued]).size).toBe(7);
  });

  it('does not restart the sequence when a second module instance loads', async () => {
    const first = await newSession();
    const firstId = first.generateFilterId();

    const second = await newModuleInstance();
    const secondId = second.generateFilterId();

    expect(firstId).toBe('f-1');
    expect(secondId).toBe('f-2');
    expect(secondId).not.toBe(firstId);
  });

  it('restores records, allocates another identity, then updates and removes exactly one', async () => {
    const previousSession = await newSession();
    const persistedId = previousSession.generateFilterId();

    // The saved tree comes back in a new session; only then is a rule added.
    const restored: FilterGroup = {
      id: 'root',
      logic: 'and',
      rules: [rule(persistedId, 'status')],
    };

    const currentSession = await newSession();
    const addedId = currentSession.generateFilterId(restored);
    expect(addedId).not.toBe(persistedId);

    const withAdded = currentSession.updateFilterGroup(restored, 'root', (group) => ({
      ...group,
      rules: [...group.rules, rule(addedId, 'owner')],
    }));
    expect(collectIds(withAdded)).toEqual([persistedId, addedId]);

    const edited = currentSession.updateFilterRule(withAdded, addedId, (target) => ({
      ...target,
      value: 'closed',
    }));
    expect((edited.rules[0] as FilterRule).value).toBe('open');
    expect((edited.rules[1] as FilterRule).value).toBe('closed');

    const removed = currentSession.removeFilterNode(edited, addedId);
    expect(collectIds(removed)).toEqual([persistedId]);
    expect((removed.rules[0] as FilterRule).value).toBe('open');
  });
});

describe('filter tree operations touch a single node', () => {
  beforeEach(() => {
    delete (globalThis as Record<symbol, unknown>)[ALLOCATOR_KEY];
    vi.resetModules();
  });

  it('updates and removes one record even when a legacy tree already duplicates an id', async () => {
    const { updateFilterRule, removeFilterNode, updateFilterGroup } = await newSession();
    const collided: FilterGroup = {
      id: 'root',
      logic: 'and',
      rules: [
        rule('f-1', 'status'),
        { id: 'f-1', logic: 'or', rules: [rule('f-1', 'owner')] },
      ],
    };

    const edited = updateFilterRule(collided, 'f-1', (target) => ({ ...target, value: 'closed' }));
    expect((edited.rules[0] as FilterRule).value).toBe('closed');
    expect(((edited.rules[1] as FilterGroup).rules[0] as FilterRule).value).toBe('open');

    const removed = removeFilterNode(collided, 'f-1');
    expect(removed.rules).toHaveLength(1);
    expect((removed.rules[0] as FilterGroup).rules).toHaveLength(1);

    const toggled = updateFilterGroup(collided, 'f-1', (group) => ({ ...group, logic: 'and' }));
    expect((toggled.rules[1] as FilterGroup).logic).toBe('and');
    expect(toggled.rules[0]).toBe(collided.rules[0]);
  });
});
