/**
 * @fileoverview Engine Test Utilities
 * @description Utilities for testing components across multiple engines (Classic, Modern, Rustic)
 */

import React, { ReactElement, Suspense } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { DesignSystemProvider } from '../../../src/infrastructure/runtime/bootstrap';
import { EngineProvider } from '../../../src/infrastructure/runtime/engines/composition/react/provider';
import { firstPartyEngineVisual } from '../../../src/infrastructure/compilers/runtime/theme';
import type { EngineName, TenantConfig } from '../../../src/foundation/contracts';

/**
 * Stable engines for testing (excludes experimental 'custom').
 *
 * `as const satisfies` rather than a `readonly EngineName[]` annotation: the
 * annotation widened the value back to the full `EngineName` union, so
 * `StableEngineName` below silently included `'custom'` — the very engine this
 * list exists to exclude — and every consumer that indexed the tuple lost its
 * literal type. `satisfies` still checks membership without widening.
 */
export const STABLE_ENGINES = ['classic', 'modern', 'rustic'] as const satisfies readonly EngineName[];
export type StableEngineName = (typeof STABLE_ENGINES)[number];

/**
 * The shared engine fixture carries NO runtime visual payload.
 *
 * `censusRuntimeVisualPayload` counts every `branding` colour and font field as
 * runtime paint. A tenant that carries paint without a verified, mounted,
 * compiled artifact is refused by `resolveVisualAuthority`, and
 * `DesignSystemProvider` fails closed on that conflict: it renders
 * `<LoadingScreen />` and never mounts its children. This fixture used to
 * declare six brand colours that no assertion in any engine suite ever read —
 * decorative payload that would block every render through this helper.
 *
 * Engine suites assert engine-switched anatomy, not tenant paint, so the
 * fixture stops claiming a paint authority it never had. `companyName` is
 * deliberately kept: it is identity, not paint, and the census ignores it. A
 * suite that genuinely needs compiled tenant paint must mount a verified
 * artifact and declare `visualAuthority`; it must not re-add raw colours here.
 */
const TEST_TENANT_CONFIG: TenantConfig = {
  slug: 'test-tenant',
  name: 'Test Tenant',
  engine: 'modern',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: ['testing'],
  branding: {
    companyName: 'Test Tenant',
  },
};

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
  // `classic` seeds antd from a compiled projection and refuses to guess one.
  // The fixture tenant authors no theme, so the reference vertical's compile for
  // the selected engine is the projection this stack renders with. `custom` has
  // no first-party compile, and asking for one throws here — ahead of the
  // refusal the suite is actually testing — so it publishes none.
  const engineVisual =
    engine === 'custom' ? undefined : firstPartyEngineVisual('rottay', engine);

  return function EngineWrapper({ children }) {
    // skipCssLoading avoids fetching tenant CSS files during tests, which would
    // fail in jsdom/happy-dom environments without a real network.
    // forceEngine overrides the tenant config's engine field so the test
    // controls which engine renders regardless of the fixture tenant.
    return (
      <DesignSystemProvider
        tenantConfig={{ ...TEST_TENANT_CONFIG, engine }}
        forceEngine={engine}
        {...(engineVisual ? { engineVisual } : {})}
        skipCssLoading
      >
        <Suspense fallback={suspenseFallback}>{children}</Suspense>
      </DesignSystemProvider>
    );
  };
}

/**
 * Render with nothing but a DECLARED engine.
 *
 * A design-system component resolves which implementation renders from context,
 * and an undeclared engine is refused rather than defaulted. A unit suite that
 * asserts markup needs exactly that declaration and none of the tenant, theme
 * or product-profile stack `renderWithEngine` mounts.
 *
 * `engine` is REQUIRED. A default here would be the same silent substitution
 * the runtime refuses, reintroduced in the one tier no gate sweeps, and it
 * would let a suite claim an engine it never declared.
 */
export function renderWithEngineContext(
  ui: ReactElement,
  engine: EngineName,
  options: RenderOptions = {}
): RenderResult {
  const Wrapper = ({ children }: { children: React.ReactNode }): ReactElement => (
    <EngineProvider defaultEngine={engine}>{children}</EngineProvider>
  );
  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Renders a component with a specific engine
 *
 * @example
 * ```tsx
 * import { renderWithEngine } from '@/tooling/testing/helpers/engine';
 * import { Button } from '@/components/primitives/inputs/button';
 *
 * it('renders button with classic engine', () => {
 *   const { getByRole } = renderWithEngine(<Button>Click me</Button>, 'classic');
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
  classic: RenderResult;
  modern: RenderResult;
  rustic: RenderResult;
}

/**
 * Renders a component with all stable engines
 *
 * @example
 * ```tsx
 * import { renderWithAllEngines } from '@/tooling/testing/helpers/engine';
 *
 * it('all engines render button', () => {
 *   const results = renderWithAllEngines(<Button>Click</Button>);
 *
 *   expect(results.classic.getByRole('button')).toBeInTheDocument();
 *   expect(results.modern.getByRole('button')).toBeInTheDocument();
 *   expect(results.rustic.getByRole('button')).toBeInTheDocument();
 * });
 * ```
 */
export function renderWithAllEngines(
  ui: ReactElement,
  options: RenderWithEngineOptions = {}
): MultiEngineRenderResult {
  return {
    classic: renderWithEngine(ui, 'classic', options),
    modern: renderWithEngine(ui, 'modern', options),
    rustic: renderWithEngine(ui, 'rustic', options),
  };
}

/**
 * Creates a describe.each block for testing across all engines
 *
 * @example
 * ```tsx
 * import { describeEachEngine } from '@/tooling/testing/helpers/engine';
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
    classic: 'Classic (Ant Design)',
    modern: 'Modern',
    rustic: 'Rustic (HTML)',
    custom: 'Custom (Pluggable)',
  };
  return names[engine];
}
