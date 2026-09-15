/**
 * Recipe-profile single resolution path.
 *
 * The selection (a profile id) travels ONE way: the compiler validates it into
 * the runtime payload, the artifact runtime block and the provider carry it as
 * data, and components read the React context published by
 * `RecipeProfileProvider`. The catalog row is `data-only`: it declares no
 * channel, so no compiler mints `--ds-recipe-profile` and no production source
 * names it. Two representations of one decision is exactly the shape a second
 * authority takes, and this suite pins that the second one does not exist.
 *
 * A custom property of that name can still appear in a document -- a stale
 * artifact, an author's hand -- and the truth pinned here is that it is INERT:
 * components read the context and nothing else, so a planted variable that
 * disagrees with the mounted context cannot move a single component.
 *
 * `recipe-profile.integration.test.tsx` already proves the context path itself
 * (static FlatTheme selection, DB Appearance override, fail-closed on an
 * unpublished id); none of that is repeated here.
 */

import React from 'react';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { lowerFlatThemeFixture } from "@tests/support/theme-lowering";
import { themeControl } from '@/contracts/theme/runtime/catalog';
import ModernButton from '@/components/primitives/inputs/button/engines/modern';
import { RecipeProfileProvider } from '..';

const RECIPE_PROFILE_VARIABLE = '--ds-recipe-profile';
const PROFILE_ID = 'rottay/technical-sharp@1';
const SOURCE_ROOT = resolve(process.cwd(), 'src');
const STYLE_ID = 'planted-recipe-profile-variable';

function isProductionSource(path: string): boolean {
  if (!path.endsWith('.ts') && !path.endsWith('.tsx')) return false;
  if (path.endsWith('.d.ts') || path.includes('.test.') || path.includes('.stories.')) return false;
  return !path.split(sep).includes('tests');
}

function collectSources(directory: string, found: string[] = []): string[] {
  for (const entry of readdirSync(directory)) {
    const absolute = join(directory, entry);
    if (statSync(absolute).isDirectory()) collectSources(absolute, found);
    else if (isProductionSource(absolute)) found.push(absolute);
  }
  return found;
}

const SOURCES = collectSources(SOURCE_ROOT);
const MENTIONS = SOURCES.filter((absolute) =>
  readFileSync(absolute, 'utf8').includes(RECIPE_PROFILE_VARIABLE),
).map((absolute) => relative(SOURCE_ROOT, absolute).split(sep).join('/'));

/** Declares the variable in the document, the way a mounted artifact does. */
function plantVariable(profileId: string): void {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `:root { ${RECIPE_PROFILE_VARIABLE}: "${profileId}"; }`;
  document.head.appendChild(style);
}

function buttonAttributes(): Record<string, string | null> {
  const button = document.querySelector('button');
  return {
    variant: button?.getAttribute('data-variant') ?? null,
    shape: button?.getAttribute('data-shape') ?? null,
    size: button?.getAttribute('data-size') ?? null,
  };
}

afterEach(() => {
  cleanup();
  document.getElementById(STYLE_ID)?.remove();
});

describe('recipe profile — one resolution path', () => {
  it('is no longer emitted by the compilers: the selection is a runtime payload, not a channel', () => {
    // The census below is not looking for nothing: a valid selection still
    // resolves, and it reaches the product through the payload alone.
    const compiled = lowerFlatThemeFixture({
      flatTheme: {
        id: 'recipe-profile-probe',
        name: 'Recipe profile probe',
        recipes: { schemaVersion: 1, profile: PROFILE_ID },
      },
      tenantSlug: 'recipe-profile-probe',
    });

    expect(compiled.recipeProfile).toBe(PROFILE_ID);
    expect(compiled.cssVariables[RECIPE_PROFILE_VARIABLE]).toBeUndefined();
    expect(SOURCES.length).toBeGreaterThan(1500);
  });

  it('is declared by the catalog as data-only: the row produces no channel', () => {
    const row = themeControl('recipe-profile');
    expect(row.effect).toBe('data-only');
    expect([...row.produces.channels]).toEqual([]);
    expect(row.minimumFamilies.kind).toBe('declared-fan-out');
  });

  it('is named by no production source, so no consumer can exist', () => {
    // A reader would have to name the variable to read it — `var()`,
    // `getPropertyValue`, or a computed-style probe all require the literal.
    // The compilers dropped the emitter, the admission exemption and the
    // adapters' evidence strings, and the catalog row declares no channel, so
    // the census measures exactly what the data-only row states: nothing.
    expect(MENTIONS).toEqual([]);
  });

  it('moves no component when the artifact disagrees with the mounted context', () => {
    // The decisive property. The document declares a profile; the context
    // declares none. If the variable were a second authority the button would
    // follow it.
    plantVariable(PROFILE_ID);

    render(
      <RecipeProfileProvider>
        <ModernButton>Action</ModernButton>
      </RecipeProfileProvider>,
    );

    expect(document.getElementById(STYLE_ID)?.textContent).toContain(PROFILE_ID);
    expect(buttonAttributes()).toEqual({ variant: 'primary', shape: 'default', size: 'md' });
  });

  it('follows the context when the artifact declares a different profile', () => {
    // Anti-cheat for the test above: the probe CAN observe a profile change, so
    // the previous result is inertness of the variable, not blindness of the
    // assertion. The document still says `technical-sharp`; the context wins.
    plantVariable('rottay/editorial-round@1');

    render(
      <RecipeProfileProvider profileId={PROFILE_ID} schemaVersion={1}>
        <ModernButton>Action</ModernButton>
      </RecipeProfileProvider>,
    );

    expect(buttonAttributes()).toEqual({ variant: 'outline', shape: 'default', size: 'sm' });
  });
});
