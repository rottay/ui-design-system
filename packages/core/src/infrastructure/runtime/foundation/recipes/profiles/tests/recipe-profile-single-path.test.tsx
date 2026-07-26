/**
 * Recipe-profile single resolution path.
 *
 * The selection exists in TWO places at runtime: the React context published by
 * `RecipeProfileProvider`, and a `--ds-recipe-profile` custom property the brand
 * and tenant-theme compilers write into every artifact. Two representations of
 * one decision is exactly the shape a second authority takes.
 *
 * The truth this suite pins is that the CSS variable is INERT — a provenance
 * label carried by the artifact, never a resolution input. Components read the
 * context and nothing else, so an artifact whose variable disagrees with the
 * mounted context cannot move a single component.
 *
 * `recipe-profile.integration.test.tsx` already proves the context path itself
 * (static BrandTheme selection, DB Appearance override, fail-closed on an
 * unpublished id); none of that is repeated here.
 */

import React from 'react';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { compileBrandTheme } from '@/infrastructure/compilers/kernel/runtime/brand-theme';
import ModernButton from '@/ui/primitives/inputs/Button/engines/modern';
import { RecipeProfileProvider } from '..';

const RECIPE_PROFILE_VARIABLE = '--ds-recipe-profile';
const PROFILE_ID = 'rottay/technical-sharp@1';
const SOURCE_ROOT = resolve(process.cwd(), 'src');
const STYLE_ID = 'planted-recipe-profile-variable';

/** Files allowed to mention the variable, and why. */
const EMITTERS = [
  'infrastructure/compilers/kernel/runtime/brand-theme/index.ts',
  'infrastructure/compilers/composition/tenant-theme/index.ts',
];

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
  it('is emitted by the compilers, so the census is not looking for nothing', () => {
    // Anti-cheat for the census below: the variable must actually exist in
    // compiled output, otherwise "nobody reads it" is a statement about a
    // string that was never written.
    const compiled = compileBrandTheme({
      brandTheme: {
        id: 'recipe-profile-probe',
        name: 'Recipe profile probe',
        recipes: { schemaVersion: 1, profile: PROFILE_ID },
      },
      tenantSlug: 'recipe-profile-probe',
    });

    expect(compiled.cssVariables[RECIPE_PROFILE_VARIABLE]).toBe(`"${PROFILE_ID}"`);
    expect(SOURCES.length).toBeGreaterThan(1500);
  });

  it('is mentioned only by its emitters, never by a consumer', () => {
    // A reader would have to name the variable to read it — `var()`,
    // `getPropertyValue`, or a computed-style probe all require the literal.
    expect(MENTIONS.sort()).toEqual([...EMITTERS].sort());
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
