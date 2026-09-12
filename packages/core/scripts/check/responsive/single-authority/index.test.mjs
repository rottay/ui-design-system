import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  DECLARED_EXCEPTIONS,
  DECLARED_UNNAMED_QUERY,
  RESPONSIVE_AUTHORITY,
  perInstanceStylesheets,
  run,
  secondDerivations,
  staticViewportUnits,
  surfaceAdoption,
  unnamedContainerQueries,
} from './index.mjs';

// The gate measures the tree it ships with. These assertions are the CLAIM:
// each is a number a regression moves, not a tautology over its own output.

test('no responsive primitive injects a stylesheet per instance', () => {
  assert.deepEqual(perInstanceStylesheets(), []);
});

test('no static viewport unit survives anywhere under src', () => {
  assert.deepEqual(staticViewportUnits(), []);
});

test('exactly one module derives viewport state', () => {
  assert.deepEqual(secondDerivations(), []);
  assert.equal(RESPONSIVE_AUTHORITY, 'src/infrastructure/runtime/responsive');
});

test('every width-query exception is declared WITH a reason', () => {
  const reasons = Object.values(DECLARED_EXCEPTIONS);
  assert.ok(reasons.length > 0, 'the exception list must not be empty-by-accident');
  for (const reason of reasons) {
    assert.ok(reason.length > 60, `a one-word reason is not a reason: ${reason}`);
  }
});

test('every responsive surface reaches the one authority', () => {
  const { adopted, responsiveSurfaces, unadopted } = run();
  assert.deepEqual(unadopted.map((surface) => surface.id), []);
  assert.equal(adopted.length, responsiveSurfaces.length);
  // The denominator is an observation, and a vacuous one would pass the line
  // above: a tree with no responsive surface at all is not adoption.
  assert.ok(responsiveSurfaces.length >= 30, `only ${responsiveSurfaces.length} responsive surfaces found`);
});

test('the surface census sees every page owner, responsive or not', () => {
  const surfaces = surfaceAdoption();
  assert.ok(surfaces.length >= 35, `only ${surfaces.length} surface owners found`);
  assert.ok(surfaces.some((surface) => !surface.responsive), 'a surface that needs no viewport must still be counted');
});

test('the only unnamed container query is the declared one', () => {
  const unnamed = unnamedContainerQueries();
  assert.equal(unnamed.length, 1, `unnamed queries: ${unnamed.join(', ')}`);
  assert.ok(unnamed[0].startsWith(DECLARED_UNNAMED_QUERY));
});

test('the run summary is the union of the individual measurements', () => {
  const result = run();
  assert.deepEqual(result.stylesheets, perInstanceStylesheets());
  assert.deepEqual(result.viewportUnits, staticViewportUnits());
  assert.deepEqual(result.derivations, secondDerivations());
});
