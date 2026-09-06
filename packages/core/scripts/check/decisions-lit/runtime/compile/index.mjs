/**
 * @fileoverview Two artifacts per decision, through the v2 door and nowhere else.
 *
 * The probe compiles the SAME tenant twice, differing in exactly one decision,
 * through `documentThemeIntent` -> `compileThemeIntent` -> `emitThemeCss`. That
 * is the production publish path, not a harness reimplementation of it: if the
 * v2 door ever grew a second lowering, this leg would measure the second one
 * and say so, because it has no other way to produce CSS.
 *
 * WHY `dist` AND NOT `src`. The door is TypeScript with path aliases; an .mjs
 * probe cannot import it. `dist` is the built form of the same source and is
 * what a consumer receives. The freshness of that build is asserted by the
 * caller, never assumed here.
 *
 * A COMPILE MAY LEGITIMATELY REFUSE. A vertical envelope can reject a stop and
 * the governed contrast floor can reject a colour pair. Those throws are
 * recorded per (decision, vertical) as `excluded` with the compiler's own
 * message; they are never swallowed into "moved nothing", which would publish a
 * refusal as an inert control.
 *
 * @module Tooling/DecisionsLit/Runtime/Compile
 */

import { createRequire } from 'node:module';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { relative as relativePath, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
export const CORE_ROOT = resolve(
  require.resolve('../../foundation/catalog/index.mjs'),
  '../../../../../..',
);
export const REPO_ROOT = resolve(CORE_ROOT, '../..');

const DIST_SERVER = resolve(CORE_ROOT, 'dist/server.js');

/**
 * Every source tree the compiled door can depend on.
 *
 * The narrow pair this used to carry (the v2 contract and the ingress owner)
 * proved nothing: a dist stale against the lowering, the brand-theme compiler
 * or the token sources passes that check and publishes yesterday's fan-out as
 * today's. The two roots below are the whole of what `dist/server.js` is built
 * from that can move a compiled channel.
 */
export const DOOR_SOURCES = Object.freeze([
  'src/foundation',
  'src/infrastructure/compilers',
]);

/**
 * The newest FILE under a path. Directory mtimes are deliberately ignored:
 * they move when any entry is added or removed, which would make the guard red
 * after a `mkdir` that changed no source the build reads.
 */
function newestMtime(path) {
  const stat = statSync(path);
  if (!stat.isDirectory()) return { at: stat.mtimeMs, path };
  let newest = { at: 0, path };
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const child = newestMtime(resolve(path, entry.name));
    if (child.at > newest.at) newest = child;
  }
  return newest;
}

/** A path a tracked artifact may carry: relative to the repo, never to a machine. */
export function repoRelative(path) {
  return relativePath(REPO_ROOT, path);
}

/**
 * Throws unless the built door is newer than every source it is built from.
 *
 * The roots are injectable so the guard itself can be exercised on a temp tree:
 * a check that has never been seen failing is a check nobody has tested.
 */
export function assertDoorBuildIsFresh({
  coreRoot = CORE_ROOT,
  distServer = resolve(coreRoot, 'dist/server.js'),
  sources = DOOR_SOURCES,
} = {}) {
  if (!existsSync(distServer)) {
    throw new Error(
      `decisions-lit: ${repoRelative(distServer)} is missing. The probe measures the BUILT door; run \`npx vite build\` in packages/core first.`,
    );
  }
  const built = statSync(distServer).mtimeMs;
  const stale = [];
  for (const source of sources) {
    const path = resolve(coreRoot, source);
    if (!existsSync(path)) continue;
    const newest = newestMtime(path);
    if (newest.at > built) stale.push(`${source} (newest: ${repoRelative(newest.path)})`);
  }
  if (stale.length > 0) {
    throw new Error(
      'decisions-lit: dist/server.js is older than the door it must measure:\n  - ' +
        stale.join('\n  - ') +
        '\nRun `npx vite build` in packages/core and re-run.',
    );
  }
  return { dist: repoRelative(distServer), builtAt: new Date(built).toISOString() };
}

let doorPromise = null;

/** The built door, loaded once. */
export function loadDoor() {
  if (!doorPromise) doorPromise = import(pathToFileURL(DIST_SERVER).href);
  return doorPromise;
}

/** The compiled tenant CSS for one decision value, or a recorded exclusion. */
export async function compileDecisionValue({ vertical, slug, tier, id, value }) {
  const door = await loadDoor();
  const document = {
    version: 2,
    // Every probe document is written on the `pro` plan so a Pro-tier decision
    // is entitled. The plan is an entitlement, not a value: it changes nothing
    // a Standard decision compiles to, which the byte comparison of the two
    // arms would show if it ever did.
    plan: 'pro',
    decisions: { [id]: value },
  };
  try {
    const intent = door.documentThemeIntent({ vertical, slug, document });
    const compiled = door.compileThemeIntent(intent);
    return {
      css: door.emitThemeCss(compiled.compiled, door.tenantArtifactScope(vertical, slug)),
      patch: intent.patch,
    };
  } catch (error) {
    return { excluded: `${error?.name ?? 'Error'}: ${error?.message ?? String(error)}`, tier };
  }
}

/** Both arms of one decision, in one vertical. */
export async function compileDecisionArms({ vertical, slug, decision }) {
  const [a, b] = await Promise.all(
    decision.values.map((value) =>
      compileDecisionValue({ vertical, slug, tier: decision.tier, id: decision.id, value }),
    ),
  );
  return { a, b };
}
