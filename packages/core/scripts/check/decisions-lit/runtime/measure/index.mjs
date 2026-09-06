/**
 * @fileoverview What the browser actually paints when one decision moves.
 *
 * ONE PAGE PER VERTICAL, NOT ONE PER READING. The engine bundle is injected
 * once; only the tenant artifact style element is swapped between a decision's
 * two arms. That is both faster and stricter: both arms are read on the SAME
 * document, in the same browser state, so a difference cannot be an artefact of
 * two page loads.
 *
 * THE FIXTURE ROSTER IS BORROWED, AND ITS DENOMINATOR IS STATED. This probe
 * reuses `resolution-probe`'s roster because that roster is self-verifying: a
 * fixture whose selectors stopped matching the CSS is reported `unmatched` and
 * its readings are withheld rather than published as zeros. It covers eight
 * component/layout families of the twenty-five the cascade matrix enumerates,
 * so `familiesMoved` is a SAMPLE and every artifact this probe writes says so.
 * The whole-artifact byte comparison beside it is not a sample.
 *
 * @module Tooling/DecisionsLit/Runtime/Measure
 */

import { FIXTURES, validateFixture } from '../../../tokens/cascade/probe/foundation/roster/index.mjs';
import {
  rootAttributes,
  rootAttributesToHtml,
  rootClassNames,
} from '../../../tokens/cascade/probe/foundation/scope/index.mjs';
import { launchBrowser } from '../../../tokens/cascade/probe/runtime/browser/index.mjs';
import { resolveBundle } from '../../../tokens/cascade/probe/runtime/bundle/index.mjs';

/**
 * The synthetic readout is a CHANNEL instrument, not a family.
 *
 * It reads `--ds-*` custom properties directly, so it moves whenever a channel
 * moves even if nothing paints. Counting it as a family would turn "the
 * compiler wrote a variable" into "a component changed", which is precisely
 * the confusion the cascade audit found in the manifest.
 */
const CHANNEL_READOUT_FIXTURE = 'token-readout';

const ARTIFACT_STYLE_ID = 'ds-decisions-lit-artifact';

/**
 * Freezes interpolation, and ONLY interpolation.
 *
 * Both arms are read on one document, so swapping the artifact starts every
 * transition the new values trigger and `getComputedStyle` then returns an
 * INTERPOLATED value whose number depends on when the read happened. That is a
 * time-dependent reading published as a cascade fact, and it showed up as one
 * layout fixture "moving" for decisions whose two artifacts are byte-identical.
 *
 * `transition-property: none` and `animation-name: none` stop the interpolation
 * without touching `transition-duration` or `animation-duration`, which are the
 * longhands the motion decision is measured on. Freezing durations instead
 * would have silenced the very control it must observe.
 */
const FREEZE_INTERPOLATION_CSS =
  '*, *::before, *::after { transition-property: none !important; animation-name: none !important; }';

function sceneHtml({ vertical, bundleCss, fixtures }) {
  const attributes = rootAttributes({ vertical, theme: 'light', engine: 'modern', arm: 'both' });
  return `<!doctype html>
<html ${rootAttributesToHtml(attributes)} class="${rootClassNames({ theme: 'light' }).join(' ')}">
<head><meta charset="utf-8"><style id="ds-bundle">${bundleCss}</style><style id="${ARTIFACT_STYLE_ID}"></style><style id="ds-freeze">${FREEZE_INTERPOLATION_CSS}</style></head>
<body>${fixtures.map((fixture) => fixture.html).join('\n')}</body>
</html>`;
}

/** Reads every declared property of every matched fixture target. */
async function readScene(page, fixtures) {
  return page.evaluate((specs) => {
    /** @type {Record<string, Record<string, string>>} */
    const readings = {};
    for (const spec of specs) {
      const element = document.querySelector(spec.selector);
      if (!element) {
        readings[spec.key] = { '@missing': 'true' };
        continue;
      }
      const computed = getComputedStyle(element);
      /** @type {Record<string, string>} */
      const row = {};
      for (const property of spec.properties) {
        row[property] = property.startsWith('--')
          ? computed.getPropertyValue(property).trim()
          : computed.getPropertyValue(property);
      }
      readings[spec.key] = row;
    }
    return readings;
  }, fixtures);
}

function diffReadings(before, after) {
  /** @type {Record<string, string[]>} */
  const moved = {};
  for (const [key, row] of Object.entries(after)) {
    const previous = before[key] ?? {};
    const properties = Object.keys(row).filter((property) => row[property] !== previous[property]);
    if (properties.length > 0) moved[key] = properties;
  }
  return moved;
}

/**
 * Measures every decision in one vertical.
 *
 * @param {object} input
 * @param {string} input.vertical
 * @param {object} input.page
 * @param {ReadonlyArray<object>} input.decisions
 * @param {(decision: object) => Promise<{a: object, b: object}>} input.compileArms
 */
export async function measureVertical({ vertical, page, decisions, compileArms, fixtures }) {
  const specs = fixtures.flatMap((fixture) =>
    fixture.targets.map((target) => ({
      key: `${fixture.id}/${target.id}`,
      selector: target.selector,
      properties: target.properties,
    })),
  );
  const rows = [];
  for (const decision of decisions) {
    const { a, b } = await compileArms(decision);
    if (a.excluded || b.excluded) {
      rows.push({
        id: decision.id,
        vertical,
        excluded: a.excluded ?? b.excluded,
      });
      continue;
    }
    await setArtifact(page, a.css);
    const before = await readScene(page, specs);
    await setArtifact(page, b.css);
    const after = await readScene(page, specs);
    const moved = diffReadings(before, after);
    const familyKeys = Object.keys(moved).filter(
      (key) => !key.startsWith(`${CHANNEL_READOUT_FIXTURE}/`),
    );
    rows.push({
      id: decision.id,
      vertical,
      artifactBytesDiffer: a.css !== b.css,
      movedFamilies: [...new Set(familyKeys.map((key) => key.split('/')[0]))].sort(),
      movedTargets: moved,
      movedChannels: (moved[`${CHANNEL_READOUT_FIXTURE}/tokens`] ?? []).sort(),
    });
  }
  return rows;
}

async function setArtifact(page, css) {
  await page.evaluate(
    ([id, text]) => {
      const element = document.getElementById(id);
      element.textContent = text;
    },
    [ARTIFACT_STYLE_ID, css],
  );
}

/**
 * Opens one scene per vertical and measures every decision on it.
 *
 * Fixtures whose selectors no longer occur in the measured CSS are excluded by
 * name and reported; their readings are never published as zeros.
 */
export async function measure({ verticals, decisions, compileArms, bundleMode = 'fresh' }) {
  const { browser, close, provenance } = await launchBrowser();
  const context = await browser.newContext();
  const results = [];
  const rosterNotes = {};
  try {
    for (const vertical of verticals) {
      const bundle = await resolveBundle({ vertical, mode: bundleMode });
      const matched = [];
      const unmatched = [];
      for (const fixture of FIXTURES) {
        const check = validateFixture(fixture, bundle.css);
        (check.matched ? matched : unmatched).push(
          check.matched ? fixture : { id: fixture.id, missing: check.missing },
        );
      }
      rosterNotes[vertical] = {
        matched: matched.map((fixture) => fixture.id),
        unmatched,
        // `resolveBundle` carries the digest on `provenance`, not on the root:
        // reading `bundle.sha256` stored `undefined`, which JSON then dropped,
        // so the artifact named no bundle at all.
        bundleSha: bundle.provenance.sha256,
        bundleMode: bundle.mode,
      };
      const page = await context.newPage();
      await page.setContent(sceneHtml({ vertical, bundleCss: bundle.css, fixtures: matched }), {
        waitUntil: 'load',
      });
      results.push(
        ...(await measureVertical({
          vertical,
          page,
          decisions,
          fixtures: matched,
          compileArms: (decision) => compileArms({ vertical, decision }),
        })),
      );
      await page.close();
    }
  } finally {
    await context.close().catch(() => {});
    await close();
  }
  return { rows: results, roster: rosterNotes, browser: provenance };
}
