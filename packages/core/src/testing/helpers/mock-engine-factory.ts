/**
 * @fileoverview Shared engine factory mock for unit tests.
 * Instead of each test file duplicating the vi.mock() call with inline
 * mock implementations, tests can import this helper for consistent behavior.
 */
import { vi } from 'vitest';

/**
 * Sets up the engine factory mock. Call at the top of your test file.
 * The mock makes createEngineComponent return a simple forwardRef component
 * that renders the rustic/fallback implementation directly.
 */
export function mockEngineFactory() {
  vi.mock('../../engines/factory', () => ({
    createEngineComponent: (_name: string, _loaders: any, _opts?: any) => {
      // Return a forwardRef component that renders children with props pass-through
      const React = require('react');
      return React.forwardRef((props: any, ref: any) => {
        const { engine: _, ...rest } = props;
        return React.createElement('div', { ...rest, ref, 'data-testid': _name });
      });
    },
  }));
}
