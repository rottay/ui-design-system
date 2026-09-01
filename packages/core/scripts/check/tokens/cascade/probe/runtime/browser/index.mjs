/**
 * @fileoverview Getting a browser without adding a dependency, and saying
 * where it came from.
 *
 * The repository already pays for Chromium: `@playwright/test` is a devDep of
 * `packages/showroom` and pnpm has it under the workspace store. Nothing is
 * installed here. This module resolves it through Node's own resolver from a
 * short, ordered list of roots and RECORDS which one answered, so a run's
 * artifact says which binary produced its numbers instead of leaving a reader
 * to guess.
 *
 * NO SERVER. This is the whole point of the decoupling: there is no dev server
 * to start, no port to hold, no `reuseExistingServer` to silently attach a run
 * to yesterday's process. The page is `about:blank` plus one injected
 * stylesheet. A run is safe to start cold and safe to run alone.
 *
 * SINGLETON DISCIPLINE. One browser, one context, pages opened and closed in
 * sequence. Concurrency here would buy seconds and cost determinism, and this
 * programme has already been bitten by parallel browser work.
 *
 * @module Tooling/ResolutionProbe/Runtime/Browser
 */

import { createRequire } from 'node:module';

import { CORE_ROOT } from '../../foundation/paths/index.mjs';

/**
 * Resolution roots, in order of preference. The first is core itself (so the
 * harness picks up a local install if one is ever added); the rest walk out to
 * the workspace packages that actually declare Playwright today.
 */
const RESOLUTION_ROOTS = [
  `${CORE_ROOT}/package.json`,
  `${CORE_ROOT}/../../package.json`,
  `${CORE_ROOT}/../showroom/package.json`,
];

const CANDIDATE_SPECIFIERS = ['playwright', '@playwright/test'];

/**
 * Finds Playwright's `chromium` launcher.
 *
 * @returns {{chromium: object, provenance: {specifier: string, root: string, resolved: string}}}
 */
export function resolvePlaywright() {
  const attempts = [];
  for (const root of RESOLUTION_ROOTS) {
    for (const specifier of CANDIDATE_SPECIFIERS) {
      try {
        const require = createRequire(root);
        const resolved = require.resolve(specifier);
        const module = require(specifier);
        if (!module?.chromium) {
          attempts.push(`${specifier} from ${root}: resolved but exports no chromium`);
          continue;
        }
        return {
          chromium: module.chromium,
          provenance: { specifier, root, resolved },
        };
      } catch (error) {
        attempts.push(`${specifier} from ${root}: ${error.code ?? error.message}`);
      }
    }
  }
  throw new Error(
    'resolution-probe: no Playwright install reachable. This harness deliberately adds no ' +
      'dependency; it borrows the one packages/showroom already declares. Run `pnpm install` ' +
      'at the workspace root.\nAttempts:\n  ' +
      attempts.join('\n  '),
  );
}

/**
 * Launches the single browser a run is allowed.
 *
 * @returns {Promise<{browser: object, close: () => Promise<void>, provenance: object}>}
 */
export async function launchBrowser() {
  const { chromium, provenance } = resolvePlaywright();
  const browser = await chromium.launch({ headless: true });
  return {
    browser,
    close: () => browser.close(),
    provenance: { ...provenance, browserVersion: browser.version() },
  };
}
