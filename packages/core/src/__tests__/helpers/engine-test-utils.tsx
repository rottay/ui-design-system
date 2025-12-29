/**
 * @fileoverview Engine Test Utilities
 * @description Utilities for testing components across multiple engines (Titan, Hermes, Apollo)
 */

import React, { ReactElement, Suspense } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { EngineProvider } from '../../system/providers/engine';
import type { EngineName } from '../../types';

/**
 * Stable engines for testing (excludes experimental 'athena')
 */
export const STABLE_ENGINES: readonly EngineName[] = ['titan', 'hermes', 'apollo'] as const;
export type StableEngineName = (typeof STABLE_ENGINES)[number];

/**
 * Options for renderWithEngine
 */
export interface RenderWithEngineOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * Fallback component to show during lazy loading
   * @default <div data-testid="loading">Loading...</div>
   */
  suspenseFallback?: React.ReactNode;
}

/**
 * Wrapper component for engine tests
 */
function createEngineWrapper(
  engine: EngineName,
  suspenseFallback: React.ReactNode
): React.FC<{ children: React.ReactNode }> {
  return function EngineWrapper({ children }) {
    return (
      <EngineProvider defaultEngine={engine}>
        <Suspense fallback={suspenseFallback}>{children}</Suspense>
      </EngineProvider>
    );
  };
}

/**
 * Renders a component with a specific engine
 *
 * @example
 * ```tsx
 * import { renderWithEngine } from '@/__tests__/helpers/engine-test-utils';
 * import { Button } from '@/components/primitives/inputs/Button';
 *
 * it('renders button with titan engine', () => {
 *   const { getByRole } = renderWithEngine(<Button>Click me</Button>, 'titan');
 *   expect(getByRole('button')).toBeInTheDocument();
 * });
 * ```
 */
export function renderWithEngine(
  ui: ReactElement,
  engine: EngineName,
  options: RenderWithEngineOptions = {}
): RenderResult {
  const { suspenseFallback = <div data-testid="loading">Loading...</div>, ...renderOptions } =
    options;

  const Wrapper = createEngineWrapper(engine, suspenseFallback);

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Result of renderWithAllEngines
 */
export interface MultiEngineRenderResult {
  titan: RenderResult;
  hermes: RenderResult;
  apollo: RenderResult;
}

/**
 * Renders a component with all stable engines
 *
 * @example
 * ```tsx
 * import { renderWithAllEngines } from '@/__tests__/helpers/engine-test-utils';
 *
 * it('all engines render button', () => {
 *   const results = renderWithAllEngines(<Button>Click</Button>);
 *
 *   expect(results.titan.getByRole('button')).toBeInTheDocument();
 *   expect(results.hermes.getByRole('button')).toBeInTheDocument();
 *   expect(results.apollo.getByRole('button')).toBeInTheDocument();
 * });
 * ```
 */
export function renderWithAllEngines(
  ui: ReactElement,
  options: RenderWithEngineOptions = {}
): MultiEngineRenderResult {
  return {
    titan: renderWithEngine(ui, 'titan', options),
    hermes: renderWithEngine(ui, 'hermes', options),
    apollo: renderWithEngine(ui, 'apollo', options),
  };
}

/**
 * Creates a describe.each block for testing across all engines
 *
 * @example
 * ```tsx
 * import { describeEachEngine } from '@/__tests__/helpers/engine-test-utils';
 *
 * describeEachEngine('Button', (engine) => {
 *   it('renders correctly', () => {
 *     const { getByRole } = renderWithEngine(<Button>Click</Button>, engine);
 *     expect(getByRole('button')).toBeInTheDocument();
 *   });
 * });
 * ```
 */
export function describeEachEngine(
  name: string,
  fn: (engine: StableEngineName) => void
): void {
  describe.each(STABLE_ENGINES)(`${name} - %s engine`, fn);
}

/**
 * Creates an it.each block for testing the same assertion across all engines
 *
 * @example
 * ```tsx
 * itEachEngine('renders correctly', (engine) => {
 *   const { getByRole } = renderWithEngine(<Button>Click</Button>, engine);
 *   expect(getByRole('button')).toBeInTheDocument();
 * });
 * ```
 */
export function itEachEngine(
  name: string,
  fn: (engine: StableEngineName) => void | Promise<void>
): void {
  it.each(STABLE_ENGINES)(`${name} (%s)`, fn);
}

/**
 * Utility to assert same behavior across all engines
 *
 * @example
 * ```tsx
 * assertAcrossEngines(<Button disabled>Click</Button>, (result, engine) => {
 *   const button = result.getByRole('button');
 *   expect(button).toBeDisabled();
 * });
 * ```
 */
export async function assertAcrossEngines(
  ui: ReactElement,
  assertion: (result: RenderResult, engine: StableEngineName) => void | Promise<void>,
  options: RenderWithEngineOptions = {}
): Promise<void> {
  for (const engine of STABLE_ENGINES) {
    const result = renderWithEngine(ui, engine, options);
    await assertion(result, engine);
    result.unmount();
  }
}

/**
 * Type guard to check if a string is a valid stable engine name
 */
export function isStableEngine(engine: string): engine is StableEngineName {
  return STABLE_ENGINES.includes(engine as StableEngineName);
}

/**
 * Get display name for an engine
 */
export function getEngineDisplayName(engine: EngineName): string {
  const names: Record<EngineName, string> = {
    titan: 'Titan (Ant Design)',
    hermes: 'Hermes (DaisyUI)',
    apollo: 'Apollo (Vanilla)',
    athena: 'Athena (Custom)',
  };
  return names[engine];
}
