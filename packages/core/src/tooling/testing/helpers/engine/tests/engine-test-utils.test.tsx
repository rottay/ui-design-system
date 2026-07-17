/**
 * @fileoverview Tests for engine test utilities: renderWithEngine,
 * renderWithAllEngines, describeEachEngine, and assertAcrossEngines.
 */

import React from 'react';
import { describe, expect, it, vi, afterEach } from 'vitest';

import {
  STABLE_ENGINES,
  assertAcrossEngines,
  describeEachEngine,
  getEngineDisplayName,
  isStableEngine,
  itEachEngine,
  renderWithAllEngines,
  renderWithEngine,
} from '..';

describe('engine-test-utils', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders a node through a specific engine wrapper', () => {
    const result = renderWithEngine(<div>Engine ready</div>, 'modern');

    expect(result.getByText('Engine ready')).toBeInTheDocument();
  });

  it('renders the same node through all stable engines', () => {
    const results = renderWithAllEngines(<div>Every engine</div>);

    expect(results.classic.container).toHaveTextContent('Every engine');
    expect(results.modern.container).toHaveTextContent('Every engine');
    expect(results.rustic.container).toHaveTextContent('Every engine');
  });

  it('asserts across all engines and unmounts each render', async () => {
    const seen: string[] = [];

    await assertAcrossEngines(<div>Across engines</div>, (result, engine) => {
      expect(result.getByText('Across engines')).toBeInTheDocument();
      seen.push(engine);
    });

    expect(seen).toEqual(['classic', 'modern', 'rustic']);
  });

  it('registers describe.each for every stable engine', () => {
    const eachRegistrar = vi.fn();
    const describeEachSpy = vi.fn(() => eachRegistrar);
    const originalDescribe = globalThis.describe;

    Object.defineProperty(globalThis, 'describe', {
      configurable: true,
      value: Object.assign(vi.fn(), { each: describeEachSpy }),
    });

    const callback = vi.fn();
    describeEachEngine('Example', callback);

    expect(describeEachSpy).toHaveBeenCalledWith(STABLE_ENGINES);
    expect(eachRegistrar).toHaveBeenCalledWith('Example - %s engine', callback);

    Object.defineProperty(globalThis, 'describe', {
      configurable: true,
      value: originalDescribe,
    });
  });

  it('registers it.each for every stable engine', () => {
    const eachRegistrar = vi.fn();
    const itEachSpy = vi.fn(() => eachRegistrar);
    const originalIt = globalThis.it;

    Object.defineProperty(globalThis, 'it', {
      configurable: true,
      value: Object.assign(vi.fn(), { each: itEachSpy }),
    });

    const callback = vi.fn();
    itEachEngine('Example case', callback);

    expect(itEachSpy).toHaveBeenCalledWith(STABLE_ENGINES);
    expect(eachRegistrar).toHaveBeenCalledWith('Example case (%s)', callback);

    Object.defineProperty(globalThis, 'it', {
      configurable: true,
      value: originalIt,
    });
  });

  it('validates stable engine names and display labels', () => {
    expect(isStableEngine('classic')).toBe(true);
    expect(isStableEngine('modern')).toBe(true);
    expect(isStableEngine('rustic')).toBe(true);
    expect(isStableEngine('custom')).toBe(false);
    expect(isStableEngine('unknown')).toBe(false);

    expect(getEngineDisplayName('classic')).toContain('Classic');
    expect(getEngineDisplayName('modern')).toContain('Modern');
    expect(getEngineDisplayName('rustic')).toContain('Rustic');
    expect(getEngineDisplayName('custom')).toContain('Custom');
  });
});
