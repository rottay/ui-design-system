/**
 * C6.5: static FlatTheme and DB Appearance must compile through ONE semantic
 * channel model, with no vertical-specific compiler branch.
 *
 * A per-vertical branch is the failure mode that makes a "shared" compiler a
 * fiction: bithire gets one derivation, evnto another, and the contract stops
 * describing what a customer can actually author. The property is asserted
 * behaviourally first — the compiler's output must depend on the THEME and not
 * on who is asking — and only then structurally, so a branch that hides behind
 * a lookup table rather than an `if` is still caught by the behavioural half.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';


import { firstPartyFixture } from "@tests/support/theme-lowering";
import { compileFlatThemeThroughDoor } from "@tests/support/theme-door";

const bithireFlatTheme = firstPartyFixture('bithire');
const evntoFlatTheme = firstPartyFixture('evnto');
const rottayFlatTheme = firstPartyFixture('rottay');

const VERTICAL_NAMES = ['bithire', 'evnto', 'rottay', 'platform', 'themanagement'];

const LOWERING_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const COMPILERS_ROOT = join(LOWERING_ROOT, '..', '..', '..', '..');
const CHROME_VARIABLES = join(COMPILERS_ROOT, 'kernel', 'foundation', 'css', 'chrome-variables', 'index.ts');

/** Every module of the lowering: each `index.ts` below its root, suites excluded. */
function loweringModules(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === 'tests' ? [] : loweringModules(path);
    return entry.name === 'index.ts' ? [path] : [];
  });
}

/** Comments legitimately discuss verticals by name; code must not. */
function codeOf(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

function verticalsNamedIn(code: string): string[] {
  return VERTICAL_NAMES.filter((name) =>
    new RegExp(`['"\`]${name}['"\`]|\\b${name}\\b\\s*[=:]`, 'i').test(code)
  );
}

function contextFields(source: string): string[] {
  const body = /export interface ChromeVariableContext \{\n([\s\S]*?)\n\}/.exec(source)?.[1] ?? '';
  return [...codeOf(body).matchAll(/^\s*(\w+)\??:/gm)].map((match) => match[1]);
}

const IDENTITY_WORD = /vertical|tenant|slug|brand/i;

/**
 * The one field that carries an identity word without carrying an identity: it
 * is the set of Theme PATHS a tenant authored, which ranks an assignment and
 * cannot tell one tenant from another.
 */
const PATHS_NOT_IDENTITY = ['tenantAuthoredPaths'];

function identityFieldsIn(fields: string[]): string[] {
  return fields.filter((field) => IDENTITY_WORD.test(field) && !PATHS_NOT_IDENTITY.includes(field));
}

describe('the brand compiler has no per-vertical branch', () => {
  it('produces identical channels for one theme under every tenant slug', () => {
    for (const theme of [bithireFlatTheme, evntoFlatTheme, rottayFlatTheme]) {
      const compiled = VERTICAL_NAMES.map((tenantSlug) =>
        compileFlatThemeThroughDoor({ flatTheme: theme, tenantSlug })
      );
      const [reference, ...rest] = compiled;
      for (const other of rest) {
        expect(other.cssVariables).toEqual(reference.cssVariables);
        expect(other.modeBlocks ?? []).toEqual(reference.modeBlocks ?? []);
      }
    }
  });

  it('swapping two verticals swaps their output exactly', () => {
    // The strongest form of the property: if the compiler knew who bithire was,
    // compiling bithire's theme under evnto's slug could not reproduce, channel
    // for channel, what compiling it under its own slug produces.
    const asBithire = compileFlatThemeThroughDoor({ flatTheme: bithireFlatTheme, tenantSlug: 'bithire' });
    const asEvnto = compileFlatThemeThroughDoor({ flatTheme: bithireFlatTheme, tenantSlug: 'evnto' });
    expect(asEvnto.cssVariables).toEqual(asBithire.cssVariables);

    const evntoOwn = compileFlatThemeThroughDoor({ flatTheme: evntoFlatTheme, tenantSlug: 'evnto' });
    expect(evntoOwn.cssVariables).not.toEqual(asEvnto.cssVariables);
  });

  it('names no vertical in the compiler source', () => {
    expect(verticalsNamedIn("if (vertical === 'rottay') vars['--ds-sidebar-bg'] = '#0C0C0E';")).toEqual(['rottay']);

    const modules = [...loweringModules(LOWERING_ROOT), CHROME_VARIABLES];
    expect(modules.length).toBeGreaterThan(1);
    const offenders = modules.flatMap((module) =>
      verticalsNamedIn(codeOf(readFileSync(module, 'utf-8'))).map(
        (name) => `${relative(COMPILERS_ROOT, module)}: ${name}`
      )
    );
    expect(offenders).toEqual([]);
  });

  it('hands the chrome emitter a context that carries no identity', () => {
    // A branch on a vertical needs a vertical to branch on. The emitter's
    // context is the only door one could arrive through.
    expect(identityFieldsIn(['radiusBaseline', 'vertical', 'tenantSlug', 'tenantAuthoredPaths'])).toEqual([
      'vertical',
      'tenantSlug',
    ]);

    const fields = contextFields(readFileSync(CHROME_VARIABLES, 'utf-8'));
    expect(fields).toEqual(['radiusBaseline', 'mode', 'tenantAuthoredPaths', 'modePrefix']);
    expect(identityFieldsIn(fields)).toEqual([]);
  });
});
