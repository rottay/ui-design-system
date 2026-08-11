/**
 * @fileoverview The measurement itself: mount, read, and — for a dial — read
 * again.
 *
 * This is the line the rest of the programme's instruments do not cross.
 * A reachability check answers "is there a path from this input to this
 * property". This function answers "what number is on the property", which is a
 * different question with a different answer often enough to be the reason this
 * lane exists.
 *
 * THE DIAL PROBE. `measureScope` can apply one or more custom properties as an
 * INLINE style — the highest-priority position any author has — and re-read
 * every property. Anything that did not change under an inline write at the
 * strongest possible position is not "probably inert"; it is inert, and the
 * reason is downstream of the dial, not upstream of it.
 *
 * WHERE THE DIAL IS APPLIED MATTERS, so it is a parameter and it is recorded.
 * `root` writes on the document element, which is where `resolveDocumentRootAttributes`
 * puts the tenant scope and where a compiled tenant artifact lands. It is the
 * position a real tenant occupies, and it is the only one whose verdicts
 * transfer to a consumer.
 *
 * `fixture` writes on the measured element itself. THAT IS NOT A STRONGER
 * POSITION — it is a different one, and for a derived token it is strictly
 * weaker. A custom property's `var()` references are substituted at
 * computed-value time ON THE ELEMENT WHERE THE DECLARATION APPLIES; descendants
 * inherit the already-substituted stream. `--ds-radius-md` is declared at
 * `:root` as `calc(var(--ds-radius-md-base) * var(--ds-radius-scale, 1))`, so
 * the root computes it to `calc(14px * 1)` and every descendant inherits that.
 * Writing `--ds-radius-scale` on a descendant cannot re-derive it. Measured at
 * HEAD 6a4a78b29 on one bundle sha: `card-modern-md` moves 18px -> 27px at
 * `root` and is INERT at `fixture`, in all six cells.
 *
 * So `fixture` answers exactly one question — does this element's own declared
 * value read the dial directly — and an inert verdict from it is evidence about
 * NOTHING ELSE. `base/density.css` carries a `:where(…:not(:root))`
 * redeclaration precisely because descendant re-derivation has to be authored
 * to exist.
 *
 * WHAT A CUSTOM PROPERTY READ MEANS. `getComputedStyle().getPropertyValue('--x')`
 * returns the substituted token stream, not an evaluated length: `--ds-radius-md`
 * reads back as `calc(8px * 1)`, not `8px`. That is diagnostic, not a verdict.
 * The verdict is always the painted longhand (`border-top-left-radius`), which
 * the browser resolves to pixels. Both are captured; only the painted one
 * settles an argument.
 *
 * @module Tooling/ResolutionProbe/Runtime/Measure
 */

import { rootAttributes, rootAttributesToHtml, rootClassNames } from '../../foundation/scope/index.mjs';
import { validateFixture } from '../../foundation/roster/index.mjs';

/** Deterministic viewport. Recorded in the artifact; changing it changes numbers. */
export const VIEWPORT = Object.freeze({ width: 1280, height: 800 });

/**
 * An origin that cannot exist. Both documents are served by an in-process
 * route handler, so nothing leaves the machine and no server is started.
 */
const PROBE_ORIGIN = 'http://resolution-probe.invalid';
const PAGE_URL = `${PROBE_ORIGIN}/probe.html`;
const CSS_URL = `${PROBE_ORIGIN}/bundle.css`;

/**
 * The applied-sheet canary.
 *
 * FIRST BUILD OF THIS HARNESS INJECTED THE STYLESHEET WITH `addStyleTag` and
 * read immediately. One run in four came back with the INITIAL value for every
 * property of a late fixture — `border-radius: 0px`, the exact reading a real
 * inert channel produces. A harness that reports "nothing is applied" as
 * "everything is zero" is worse than no harness, because zeros look like
 * findings.
 *
 * Two changes close it. The stylesheet is now a real subresource fetched
 * through a route handler, so `waitUntil: 'load'` cannot fire before it is
 * parsed and applied. And before any reading is taken, these tokens — which
 * only the bundle declares — must resolve non-empty. If they do not, the run
 * throws. It never publishes.
 */
const CANARY_PROPERTIES = ['--ds-radius-md', '--ds-radius-scale'];

function buildDocument(scope, fixtures) {
  const attributes = rootAttributes(scope);
  const classNames = rootClassNames(scope).join(' ');
  const body = fixtures.map((fixture) => fixture.html).join('\n');
  return [
    '<!doctype html>',
    `<html ${rootAttributesToHtml(attributes)} class="${classNames}">`,
    '<head><meta charset="utf-8"><title>resolution-probe</title>',
    `<link rel="stylesheet" href="${CSS_URL}">`,
    '</head>',
    `<body class="${classNames}">`,
    body,
    '</body></html>',
  ].join('\n');
}

/**
 * Measures every declared property of every fixture, once per scope.
 *
 * @param {object} input
 * @param {object} input.browser        a launched Playwright browser
 * @param {string} input.css            the exact CSS to measure (see foundation/bundle)
 * @param {object} input.scope          {vertical, theme, engine, arm}
 * @param {Array<object>} input.fixtures
 * @param {Record<string,string>|null} [input.dial]  custom properties to write inline
 * @param {'root'|'fixture'} [input.dialTarget]
 */
export async function measureScope({
  browser,
  css,
  scope,
  fixtures,
  dial = null,
  dialTarget = 'root',
}) {
  const validations = fixtures.map((fixture) => ({
    fixture,
    ...validateFixture(fixture, css),
  }));
  const matched = validations.filter((entry) => entry.matched).map((entry) => entry.fixture);

  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    colorScheme: scope.theme === 'dark' ? 'dark' : 'light',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  try {
    const document = buildDocument(scope, matched);
    // ONE handler, dispatching by URL. Playwright matches routes in reverse
    // registration order, so a separate catch-all would shadow the two
    // specific handlers and abort the navigation itself.
    await page.route(`${PROBE_ORIGIN}/**`, (route) => {
      const url = route.request().url();
      if (url === PAGE_URL) {
        return route.fulfill({ contentType: 'text/html; charset=utf-8', body: document });
      }
      if (url === CSS_URL) {
        return route.fulfill({ contentType: 'text/css; charset=utf-8', body: css });
      }
      // Fonts and background images the bundle references are not
      // computed-value inputs for this roster. Aborting them keeps every run
      // identical instead of letting each one fail differently on a timeout.
      return route.abort();
    });

    await page.goto(PAGE_URL, { waitUntil: 'load' });
    await assertStylesheetApplied(page, scope);

    const plan = matched.flatMap((fixture) =>
      fixture.targets.map((target) => ({
        fixtureId: fixture.id,
        targetId: target.id,
        selector: target.selector,
        properties: target.properties,
      })),
    );

    const baseline = await readAll(page, plan);
    if (!dial) {
      return { readings: baseline, unmatched: unmatchedRows(validations) };
    }

    await applyDial(page, plan, dial, dialTarget);
    const witness = await readDialWitness(page, plan, dial, dialTarget);
    const dialled = await readAll(page, plan);
    return { readings: baseline, dialled, witness, unmatched: unmatchedRows(validations) };
  } finally {
    await page.close();
    await context.close();
  }
}

/**
 * Refuses to measure a document whose stylesheet did not take effect.
 *
 * Throws rather than returning a flag: a caller that could ignore this would
 * eventually ignore it, and the readings it guards are indistinguishable from
 * real inertness.
 */
async function assertStylesheetApplied(page, scope) {
  const state = await page.evaluate((properties) => {
    const computed = getComputedStyle(document.documentElement);
    return {
      sheets: document.styleSheets.length,
      values: Object.fromEntries(
        properties.map((property) => [property, computed.getPropertyValue(property).trim()]),
      ),
    };
  }, CANARY_PROPERTIES);

  const empty = Object.entries(state.values)
    .filter(([, value]) => value === '')
    .map(([property]) => property);
  if (state.sheets === 0 || empty.length > 0) {
    throw new Error(
      `resolution-probe: the bundle did not apply for scope ${scope.vertical}/${scope.theme} ` +
        `(styleSheets=${state.sheets}, unresolved canary tokens: ${
          empty.join(', ') || 'none'
        }). Refusing to publish readings that would look like inert channels.`,
    );
  }
}

function unmatchedRows(validations) {
  return validations
    .filter((entry) => !entry.matched)
    .map((entry) => ({
      fixtureId: entry.fixture.id,
      missingSelectors: entry.missing,
      meaning:
        'The CSS being measured no longer contains this selector, so the fixture would have ' +
        'reported initial values as if they were the tenant paint. Readings withheld.',
    }));
}

async function readAll(page, plan) {
  return page.evaluate((rows) => {
    // FORCE A STYLE/LAYOUT FLUSH BEFORE READING. This is not defensive
    // padding. Writing a custom property on the document element and calling
    // getComputedStyle in the next CDP round trip returns the STALE value on a
    // document of this size — measured here as a dial that set
    // `--ds-radius-scale: 1.5`, had the descendant read it back as `1.5`, and
    // still reported the dependent `border-radius` at its pre-dial `4px`.
    // Every dependent property would have been recorded as inert. Reading
    // `offsetHeight` forces the pending recalculation first.
    void document.documentElement.offsetHeight;
    const output = {};
    for (const row of rows) {
      const element = document.querySelector(row.selector);
      const key = `${row.fixtureId}/${row.targetId}`;
      if (!element) {
        output[key] = { present: false, values: {} };
        continue;
      }
      const computed = getComputedStyle(element);
      const values = {};
      for (const property of row.properties) {
        values[property] = computed.getPropertyValue(property).trim();
      }
      output[key] = { present: true, values };
    }
    return output;
  }, plan);
}

async function applyDial(page, plan, dial, dialTarget) {
  await page.evaluate(
    ({ rows, properties, target }) => {
      const write = (element) => {
        for (const [name, value] of Object.entries(properties)) {
          element.style.setProperty(name, value);
        }
      };
      if (target === 'root') {
        write(document.documentElement);
        return;
      }
      for (const row of rows) {
        const element = document.querySelector(row.selector);
        if (element) write(element);
      }
    },
    { rows: plan, properties: dial, target: dialTarget },
  );

  // Settle the write before anything reads. `readAll` flushes as well; both are
  // kept because they close different halves of the same hazard — this one
  // lets the frame commit, that one forces the recalculation.
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve(null)));
      }),
  );
}

/**
 * Confirms the dial actually landed where it was aimed.
 *
 * Separates "the design system ignored this input" from "the input was never
 * written", which are the two readings a dial probe must never conflate.
 *
 * IT MUST READ THE ELEMENTS THAT WERE WRITTEN. This read used `document.body`
 * for the `fixture` target, and body is never a dial target — so every
 * fixture-target run reported the tenant artifact's own value as the witness and
 * `landedEverywhere: false`, which reads as "the input never landed" for a dial
 * that landed on every element it was aimed at. A witness that watches the wrong
 * element is worse than none: it converts a real inert verdict into a harness
 * failure, and would eventually be used to dismiss one.
 *
 * A `fixture` witness is one value per property only when every dialled element
 * agrees. Disagreement is reported, never averaged away.
 */
export async function readDialWitness(page, plan, dial, dialTarget) {
  return page.evaluate(
    ({ rows, properties, target }) => {
      const elements =
        target === 'root'
          ? [document.documentElement]
          : rows.map((row) => document.querySelector(row.selector)).filter(Boolean);
      return Object.fromEntries(
        Object.keys(properties).map((name) => {
          const seen = [
            ...new Set(
              elements.map((element) => getComputedStyle(element).getPropertyValue(name).trim()),
            ),
          ];
          if (seen.length === 0) return [name, 'no-dialled-element'];
          return [name, seen.length === 1 ? seen[0] : `mixed: ${seen.join(' | ')}`];
        }),
      );
    },
    { rows: plan, properties: dial, target: dialTarget },
  );
}
