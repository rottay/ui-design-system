/**
 * Tests for the engine registry: metadata lookup, stable/available engine
 * listing and engine name validation. Which engine renders is not this
 * registry's question — `resolveEngine` owns it, alone.
 */
import { describe, expect, it } from 'vitest';

import {
  ENGINE_REGISTRY,
  getAvailableEngines,
  getEngine,
  getStableEngines,
  isValidEngine,
} from '../../..';

describe('engine registry', () => {
  it('returns known engine metadata by name', () => {
    expect(getEngine('modern')).toEqual(
      expect.objectContaining({
        name: 'modern',
        library: 'rottay-native',
        status: 'stable',
      })
    );
    expect(getEngine('classic')).toEqual(
      expect.objectContaining({
        name: 'classic',
        library: 'antd',
        status: 'stable',
      })
    );
    expect(getEngine('custom')).toEqual(
      expect.objectContaining({
        name: 'custom',
        library: 'custom',
        status: 'experimental',
      })
    );
  });

  it('lists all and stable engines consistently with the registry', () => {
    expect(getAvailableEngines()).toEqual(Object.keys(ENGINE_REGISTRY));
    expect(getStableEngines()).toEqual(['classic', 'modern', 'rustic']);
  });

  it('validates engine names', () => {
    expect(isValidEngine('classic')).toBe(true);
    expect(isValidEngine('modern')).toBe(true);
    expect(isValidEngine('rustic')).toBe(true);
    expect(isValidEngine('custom')).toBe(true);
    expect(isValidEngine('legacy')).toBe(false);
  });
});
