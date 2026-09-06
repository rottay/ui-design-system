/**
 * The four compounds resolve their implementation through the SYNC engine
 * factory, and refuse anything it cannot answer for.
 *
 * They used to bypass the factory entirely: engine selection was a plain lookup
 * in a module-local three-name record, so the factory's fail-closed drills said
 * nothing about them and `custom` could not resolve AT ALL -- a white-label pack
 * that registered `Text` rendered nothing while the same pack's `Button`
 * rendered. `createSyncEngineComponent` answers the same three questions the
 * lazy factory answers, synchronously, because typography renders inside every
 * other component's tree and a Suspense boundary around it would flash the page.
 *
 * Three properties, at once: every implemented engine resolves; a registered
 * pack resolves under `custom`; and an unregistered pack, an unknown name and an
 * undeclared engine each refuse BY NAME rather than falling through to classic.
 *
 * The refusal message is asserted to carry the offending name, so a future
 * rewrite cannot satisfy this file with a bare `throw new Error()`.
 */

import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { EngineName } from '@/foundation/contracts';
import {
  EXTENSION_ENGINE,
  IMPLEMENTED_ENGINE_NAMES,
  PRIMARY_ENGINE,
} from '@/foundation/contracts/kernel/engine-identity';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import {
  clearCustomRegistry,
  registerCustomComponent,
} from '@/infrastructure/runtime/engines/runtime/customization/component-registry';
import { Heading, Link, Paragraph, Text } from '..';

/**
 * `[displayName, packName, build]`. The pack name is the identity the factory
 * looks up, and it is deliberately the SHORT one: a pack author registers
 * `Text`, not `TypographyText`.
 */
const COMPOUNDS = [
  ['Text', (engine?: EngineName) => <Text engine={engine}>t</Text>],
  ['Heading', (engine?: EngineName) => <Heading engine={engine}>h</Heading>],
  ['Paragraph', (engine?: EngineName) => <Paragraph engine={engine}>p</Paragraph>],
  ['Link', (engine?: EngineName) => <Link engine={engine} href="/x">l</Link>],
] as const satisfies readonly (readonly [string, (engine?: EngineName) => ReactElement])[];

afterEach(() => {
  clearCustomRegistry();
  vi.restoreAllMocks();
});

/** React logs a render throw; the assertion is the throw, not the log. */
function expectRefusal(element: ReactElement, pattern: RegExp): void {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  expect(() => render(element)).toThrow(pattern);
}

describe.each(COMPOUNDS)('%s engine resolution', (name, build) => {
  it.each(IMPLEMENTED_ENGINE_NAMES)('renders the %s implementation', (engine) => {
    const { container } = render(
      <EngineProvider defaultEngine={engine}>{build()}</EngineProvider>,
    );
    expect(container.firstElementChild).not.toBeNull();
  });

  it('renders a registered pack under `custom`', () => {
    registerCustomComponent(name, () => <b data-testid="pack">pack</b>);
    const { getByTestId } = render(
      <EngineProvider defaultEngine={EXTENSION_ENGINE}>{build()}</EngineProvider>,
    );
    expect(getByTestId('pack')).toBeTruthy();
  });

  it('refuses `custom` when the pack registered no implementation for it', () => {
    expectRefusal(
      <EngineProvider defaultEngine={PRIMARY_ENGINE}>
        {build(EXTENSION_ENGINE)}
      </EngineProvider>,
      new RegExp(`No custom implementation registered for "${name}"`),
    );
  });

  it('refuses an engine name outside the roster instead of substituting one', () => {
    expectRefusal(
      <EngineProvider defaultEngine={PRIMARY_ENGINE}>
        {build('titan' as EngineName)}
      </EngineProvider>,
      new RegExp(`${name} has no titan implementation`),
    );
  });

  it('refuses an undeclared engine rather than defaulting to classic', () => {
    expectRefusal(build(), new RegExp(`${name}: no engine is declared`));
  });
});
