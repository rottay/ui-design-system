/**
 * The four compounds resolve their implementation from a TOTAL map, and refuse
 * anything the map does not answer for.
 *
 * These owners bypass `createEngineComponent`, so the factory's own fail-closed
 * drills say nothing about them: their engine selection is a plain lookup in a
 * module-local record. That lookup has to keep two properties at once — every
 * implemented engine resolves, and `custom`, an unknown name and an undeclared
 * engine each refuse BY NAME rather than falling through to classic. A shape
 * that satisfied only the first would still render, silently, on the wrong
 * engine, which is the exact defect the compounds were rewritten to end.
 *
 * The refusal message is asserted to carry the offending engine, so a future
 * rewrite cannot satisfy this file with a bare `throw new Error()`.
 */

import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { EngineName } from '@/foundation/contracts';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import { Heading, Link, Paragraph, Text } from '..';

const IMPLEMENTED: readonly EngineName[] = ['classic', 'modern', 'rustic'];

const COMPOUNDS = [
  ['TypographyText', (engine?: EngineName) => <Text engine={engine}>t</Text>],
  ['TypographyHeading', (engine?: EngineName) => <Heading engine={engine}>h</Heading>],
  ['TypographyParagraph', (engine?: EngineName) => <Paragraph engine={engine}>p</Paragraph>],
  ['TypographyLink', (engine?: EngineName) => <Link engine={engine} href="/x">l</Link>],
] as const satisfies readonly (readonly [string, (engine?: EngineName) => ReactElement])[];

afterEach(() => {
  vi.restoreAllMocks();
});

/** React logs a render throw; the assertion is the throw, not the log. */
function expectRefusal(element: ReactElement, name: string, engine: unknown): void {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  expect(() => render(element)).toThrow(
    `${name}: no implementation for engine ${JSON.stringify(engine)}.`,
  );
}

describe.each(COMPOUNDS)('%s engine resolution', (name, build) => {
  it.each(IMPLEMENTED)('renders the %s implementation', (engine) => {
    const { container } = render(
      <EngineProvider defaultEngine={engine}>{build()}</EngineProvider>,
    );
    expect(container.firstElementChild).not.toBeNull();
  });

  it('refuses `custom`, which packs cannot register a compound for', () => {
    expectRefusal(
      <EngineProvider defaultEngine="modern">{build('custom')}</EngineProvider>,
      name,
      'custom',
    );
  });

  it('refuses an engine name outside the roster instead of substituting one', () => {
    expectRefusal(
      <EngineProvider defaultEngine="modern">
        {build('titan' as EngineName)}
      </EngineProvider>,
      name,
      'titan',
    );
  });

  it('refuses an undeclared engine rather than defaulting to classic', () => {
    expectRefusal(build(), name, null);
  });
});
