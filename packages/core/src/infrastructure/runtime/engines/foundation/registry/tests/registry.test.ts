/**
 * Tests for the engine registry: metadata lookup, stable/available engine
 * listing, engine name validation, and default engine selection.
 */
import { describe, expect, it } from 'vitest';

import {
  ENGINE_REGISTRY,
  getAvailableEngines,
  getDefaultEngine,
  getEngine,
  getStableEngines,
  isValidEngine,
} from '../../..';

describe('engine registry', () => {
  it('returns known engine metadata by name', () => {
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

  it('validates engine names and exposes the default engine', () => {
    expect(isValidEngine('classic')).toBe(true);
    expect(isValidEngine('modern')).toBe(true);
    expect(isValidEngine('rustic')).toBe(true);
    expect(isValidEngine('custom')).toBe(true);
    expect(isValidEngine('legacy')).toBe(false);
    expect(getDefaultEngine()).toBe('classic');
  });
});
