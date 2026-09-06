/**
 * The roster is one list, and every other set in this package is derived from
 * it. These assertions are structural: they compare derived sets against the
 * roster rather than against a second hand-written list, so adding or retiring
 * an engine cannot leave two answers behind.
 */

import { describe, expect, it } from 'vitest';

import {
  ADMITTED_ENGINE_NAMES,
  ENGINE_NAMES,
  EXTENSION_ENGINE,
  FROZEN_ENGINE_NAMES,
  IMPLEMENTED_ENGINE_NAMES,
  PRIMARY_ENGINE,
  isAdmittedEngineName,
  isFrozenEngineName,
  isImplementedEngineName,
  isValidEngineName,
} from '..';

describe('the roster is the single source', () => {
  it('states each name exactly once', () => {
    expect(new Set(ENGINE_NAMES).size).toBe(ENGINE_NAMES.length);
  });

  it('partitions the roster into admitted and frozen', () => {
    expect([...ADMITTED_ENGINE_NAMES, ...FROZEN_ENGINE_NAMES].sort()).toEqual(
      [...ENGINE_NAMES].sort()
    );
    for (const name of ADMITTED_ENGINE_NAMES)
      expect(FROZEN_ENGINE_NAMES).not.toContain(name);
  });

  it('admits the primary engine and the extension seam, and nothing else', () => {
    expect([...ADMITTED_ENGINE_NAMES].sort()).toEqual(
      [PRIMARY_ENGINE, EXTENSION_ENGINE].sort()
    );
  });

  it('derives the implemented roster as the roster minus the extension seam', () => {
    expect([...IMPLEMENTED_ENGINE_NAMES, EXTENSION_ENGINE].sort()).toEqual(
      [...ENGINE_NAMES].sort()
    );
  });
});

describe('the guards agree with the sets they are derived from', () => {
  it('accepts every roster name and refuses anything else', () => {
    for (const name of ENGINE_NAMES) expect(isValidEngineName(name)).toBe(true);
    expect(isValidEngineName('titan')).toBe(false);
    expect(isValidEngineName(undefined)).toBe(false);
    expect(isValidEngineName(7)).toBe(false);
  });

  it('classifies every roster name into exactly one posture', () => {
    for (const name of ENGINE_NAMES) {
      expect(isImplementedEngineName(name)).toBe(
        IMPLEMENTED_ENGINE_NAMES.includes(name as never)
      );
      expect(isFrozenEngineName(name)).toBe(FROZEN_ENGINE_NAMES.includes(name));
      expect(isAdmittedEngineName(name)).toBe(ADMITTED_ENGINE_NAMES.includes(name));
      expect(isFrozenEngineName(name)).toBe(!isAdmittedEngineName(name));
    }
  });

  it('refuses an off-roster name from every guard', () => {
    expect(isImplementedEngineName('titan')).toBe(false);
    expect(isFrozenEngineName('titan')).toBe(false);
    expect(isAdmittedEngineName('titan')).toBe(false);
  });
});
