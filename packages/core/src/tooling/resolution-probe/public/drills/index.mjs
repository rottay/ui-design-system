/**
 * @fileoverview Drills — the instrument measured against known answers.
 *
 * This harness exists to say "this property did not move". That sentence is
 * worthless unless the harness has been SEEN to say "this property moved" on a
 * case where it must, and been SEEN to refuse on a case where it cannot know.
 * So each drill pairs an injected defect with a positive control, and the two
 * must disagree.
 *
 *   movement    a synthetic sheet whose radius derives from the dial. The
 *               dial must move it. Its shadowed twin — the real defect in
 *               miniature, a flat literal declared at the tenant scope above
 *               the derivation — must NOT move. One harness, both answers.
 *   canary      a sheet that declares nothing must THROW, not return zeros.
 *               Zeros are what a genuinely inert channel looks like, so a
 *               harness that returns them for an unapplied stylesheet
 *               manufactures findings.
 *   fixture     a renamed selector must be reported `unmatched`, not measured
 *               as initial values.
 *   projection  the scope vocabulary must still match the SSR projection it
 *               was derived from, which is TypeScript this harness cannot
 *               import.
 *   formula     the `fresh` composition claims to use the same formula as
 *               `scripts/vertical-css-staleness.gate.mjs`. That claim is
 *               checked by running the gate and comparing the line at which
 *               each side says the shipped bundle diverges from source.
 *
 * @module Tooling/ResolutionProbe/Public/Drills
 */

import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { CORE_ROOT } from '../../foundation/paths/index.mjs';
import { FIXTURES, validateFixture } from '../../foundation/roster/index.mjs';
import { rootAttributes } from '../../foundation/scope/index.mjs';
import { launchBrowser } from '../../runtime/browser/index.mjs';
import { resolveBundle } from '../../runtime/bundle/index.mjs';
import { measureScope } from '../../runtime/measure/index.mjs';

/**
 * A miniature of the whole programme's question.
 *
 * `.drill-live` derives its radius from the dial. `.drill-shadowed` is
 * identical except that the tenant scope flat-declares the derived token above
 * the derivation — which is exactly what each generated vertical artifact
 * (`src/foundation/tokens/css/facade/artifacts/<vertical>/index.css`) does to
 * `--ds-radius-md` today.
 */
export const DRILL_CSS = `
:root {
  --ds-radius-scale: 1;
  --ds-radius-md-base: 8px;
  --ds-radius-md: calc(var(--ds-radius-md-base) * var(--ds-radius-scale, 1));
}
:is(html[data-tenant='rottay'], :where([data-ds-root][data-vertical='platform'])) {
  /* The defect, in one line: a flat literal at the tenant scope, above the
     derivation, so the dial can never reach anything that reads it. */
  --ds-radius-md: 10px;
}
.drill-live { border-radius: calc(4px * var(--ds-radius-scale, 1)); }
.drill-shadowed { border-radius: var(--ds-radius-md); }
`;

export const DRILL_FIXTURES = Object.freeze([
  Object.freeze({
    id: 'drill-live',
    requiresSelectors: ['.drill-live'],
    html: '<div class="drill-live" data-probe="drill-live"></div>',
    targets: [
      {
        id: 'root',
        selector: "[data-probe='drill-live']",
        properties: ['border-top-left-radius'],
      },
    ],
  }),
  Object.freeze({
    id: 'drill-shadowed',
    requiresSelectors: ['.drill-shadowed'],
    html: '<div class="drill-shadowed" data-probe="drill-shadowed"></div>',
    targets: [
      {
        id: 'root',
        selector: "[data-probe='drill-shadowed']",
        properties: ['border-top-left-radius'],
      },
    ],
  }),
]);

const DRILL_SCOPE = Object.freeze({
  vertical: 'platform',
  theme: 'light',
  engine: 'modern',
  arm: 'both',
});

/**
 * Runs the movement drill and the canary drill against one browser.
 *
 * @returns {Promise<{movement: object, canary: object}>}
 */
export async function runBrowserDrills() {
  const { browser, close } = await launchBrowser();
  try {
    const measured = await measureScope({
      browser,
      css: DRILL_CSS,
      scope: DRILL_SCOPE,
      fixtures: DRILL_FIXTURES,
      dial: { '--ds-radius-scale': '2' },
      dialTarget: 'root',
    });

    const live = {
      before: measured.readings['drill-live/root'].values['border-top-left-radius'],
      after: measured.dialled['drill-live/root'].values['border-top-left-radius'],
    };
    const shadowed = {
      before: measured.readings['drill-shadowed/root'].values['border-top-left-radius'],
      after: measured.dialled['drill-shadowed/root'].values['border-top-left-radius'],
    };

    let canaryError = null;
    try {
      await measureScope({
        browser,
        // Declares neither canary token: the stylesheet is present but says
        // nothing this harness can key on.
        css: '.drill-live { color: red; }',
        scope: DRILL_SCOPE,
        fixtures: DRILL_FIXTURES,
      });
    } catch (error) {
      canaryError = error.message;
    }

    return {
      movement: {
        live,
        shadowed,
        liveMoved: live.before !== live.after,
        shadowedMoved: shadowed.before !== shadowed.after,
        witness: measured.witness,
      },
      canary: { threw: canaryError !== null, message: canaryError },
    };
  } finally {
    await close();
  }
}

/** A renamed selector must be reported, not measured as initial values. */
export function runFixtureDrill() {
  const fixture = FIXTURES.find((entry) => entry.id === 'card-modern-md');
  const intactCss = fixture.requiresSelectors.join('\n');
  const brokenCss = intactCss.replace(
    fixture.requiresSelectors[0],
    fixture.requiresSelectors[0].replace('ds-card', 'ds-card-renamed'),
  );
  return {
    intact: validateFixture(fixture, intactCss),
    broken: validateFixture(fixture, brokenCss),
  };
}

/**
 * Checks the transcribed composition formula against the repository's own.
 *
 * `runtime/bundle` restates the formula from `build-vertical-css.mjs`, so it
 * could drift from it silently and produce a "fresh" bundle that is fresh
 * only by its own definition. `scripts/vertical-css-staleness.gate.mjs`
 * independently recomposes the same bundles and reports the first line at
 * which each committed file diverges. If the two formulas agree, they must
 * name the SAME line.
 *
 * The gate's output includes whole bundles in its assertion messages — tens of
 * megabytes — so it is scanned line by line as it streams rather than
 * buffered.
 */
export async function runFormulaAgreementDrill() {
  const gateLines = await streamMatchingLines(
    process.execPath,
    ['--test', 'scripts/vertical-css-staleness.gate.mjs'],
    /^\s*(styles\/[a-z]+\.css is stale or hand-edited|line \d+)/,
  );

  /** @type {Record<string, number>} */
  const gate = {};
  let pending = null;
  for (const line of gateLines) {
    const stale = line.match(/^\s*styles\/([a-z]+)\.css is stale or hand-edited/);
    if (stale) {
      pending = stale[1];
      continue;
    }
    const lineNumber = line.match(/^\s*line (\d+)/);
    if (lineNumber && pending) {
      gate[pending] = Number(lineNumber[1]);
      pending = null;
    }
  }

  // The gate names bundles by their committed filename; `platform` is also
  // published as `rottay`, and `index` is the all-tenants bundle this harness
  // does not measure.
  const comparisons = [];
  for (const vertical of ['platform', 'bithire', 'evnto']) {
    const bundle = await resolveBundle({ vertical, mode: 'fresh' });
    comparisons.push({
      vertical,
      probeLine: bundle.provenance.shippedDistDrift?.firstDifferingLine ?? null,
      gateLine: gate[vertical] ?? null,
    });
  }
  return {
    gate,
    comparisons,
    agrees: comparisons.every(
      (row) => row.gateLine !== null && row.probeLine === row.gateLine,
    ),
  };
}

function streamMatchingLines(command, args, pattern) {
  // `node --test` sets NODE_TEST_CONTEXT on its children. A nested runner that
  // sees it switches off TAP and emits the serialized reporter instead, so the
  // scan below silently matches nothing and the drill "passes" by finding no
  // divergence — the exact false green this drill exists to prevent. The
  // variable is stripped so the child always speaks TAP.
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, { cwd: CORE_ROOT, env });
    const kept = [];
    let carry = '';
    child.stdout.on('data', (chunk) => {
      const text = carry + chunk.toString('utf8');
      const lines = text.split('\n');
      carry = lines.pop() ?? '';
      for (const line of lines) if (pattern.test(line)) kept.push(line);
    });
    child.on('error', rejectPromise);
    child.on('close', () => {
      if (pattern.test(carry)) kept.push(carry);
      resolvePromise(kept);
    });
  });
}

/**
 * The scope vocabulary was transcribed from a TypeScript projection this
 * harness cannot import. This drill reads that source as text and checks the
 * two still name the same attributes.
 */
export function runProjectionDrill() {
  const source = readFileSync(
    resolve(
      CORE_ROOT,
      'src/infrastructure/runtime/foundation/root-attributes/ssr/index.ts',
    ),
    'utf-8',
  );
  const declared = new Set(
    [...source.matchAll(/'(data-[a-z-]+)'\s*[?]?:/g)].map((match) => match[1]),
  );
  const projected = new Set(
    Object.keys(rootAttributes({ vertical: 'platform', theme: 'light' })).filter((name) =>
      name.startsWith('data-'),
    ),
  );
  const missingFromHarness = [...declared].filter((name) => !projected.has(name)).sort();
  const inventedByHarness = [...projected].filter((name) => !declared.has(name)).sort();
  return {
    declared: [...declared].sort(),
    projected: [...projected].sort(),
    missingFromHarness,
    inventedByHarness,
    agrees: missingFromHarness.length === 0 && inventedByHarness.length === 0,
  };
}
