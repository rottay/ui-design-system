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
 * REAL GEOMETRY, NOT JUST COMPUTED-STYLE STRINGS. `block-size`/`inline-size`/
 * `height`/`width` from `getComputedStyle` are the AUTHORED box, but a
 * `transform: scale(...)` or a `zoom` changes what the box actually occupies
 * on screen without moving any of those computed longhands at all — the
 * exact gap that let a control shrink or a touch target lose its footprint
 * while every declared property still read "unchanged". The two reserved
 * observable names `@rect-inline-size` and `@rect-block-size` (not real CSS
 * properties, so they can never collide with one) are read from
 * `Element.getBoundingClientRect()` instead: the browser's own answer to "how
 * big is this, actually, right now". A mutation of padding, border or
 * transform that changes the rendered box moves these even when it moves
 * nothing else declared, so a control/touch-target/icon assertion bound to
 * ONLY `block-size`/`height`-shaped strings can be fooled by exactly that
 * mutation; binding the rect names too closes it.
 *
 * @module Tooling/ResolutionProbe/Runtime/Measure
 */

/** Reserved observable names read from `getBoundingClientRect`, never from `getComputedStyle`. */
export const RECT_OBSERVABLES = Object.freeze(['@rect-inline-size', '@rect-block-size']);

import {
  rootAttributes,
  rootAttributesToHtml,
  rootClassNames,
  VERTICALS,
} from '../../foundation/scope/index.mjs';
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
 *
 * THE CANARY IS PER LAYER, because the bundle has two and they can fail
 * independently. `--ds-radius-md` is declared by `themes/default.css`, so it
 * certifies the BASE layer; `--ds-radius-scale` is declared only by a vertical
 * artifact, so it certifies the TENANT layer. The tenant-less scope has no
 * artifact and legitimately leaves the second empty — reading that as "the
 * bundle did not apply" is what blocked the scope from existing.
 *
 * The tempting fix is to make both canaries base-declared names so every scope
 * passes. That silently DROPS artifact certification from all six tenanted
 * cells: an artifact failing to load would then look like a tenant that
 * declares nothing, which is precisely the inert-looking-zeros failure this
 * canary exists to prevent. Certify each layer a scope actually has.
 */
const BASE_LAYER_CANARY = Object.freeze(['--ds-radius-md']);
const TENANT_LAYER_CANARY = Object.freeze(['--ds-radius-scale']);

/**
 * The canary tokens for one scope.
 *
 * Exported because a CAUSAL run reads the same tokens at a second position —
 * on each measured element, not only on the document root. An element can be in
 * the DOM while the inherited custom-property stream never reached it (a
 * detached subtree, a shadow boundary, a fixture mounted before the sheet
 * applied), and that element reports initial values that are indistinguishable
 * from a channel a tenant genuinely cannot move. Same tokens, wider read
 * position: one mechanism, not two.
 */
export function canaryProperties(scope) {
  const tenantLess = VERTICALS[scope.vertical]?.tenantSlug === null;
  return tenantLess ? [...BASE_LAYER_CANARY] : [...BASE_LAYER_CANARY, ...TENANT_LAYER_CANARY];
}

function buildDocument(scope, fixtures, cssUrl = CSS_URL) {
  const attributes = rootAttributes(scope);
  const classNames = rootClassNames(scope).join(' ');
  const body = fixtures.map((fixture) => fixture.html).join('\n');
  return [
    '<!doctype html>',
    `<html ${rootAttributesToHtml(attributes)} class="${classNames}">`,
    '<head><meta charset="utf-8"><title>resolution-probe</title>',
    `<link rel="stylesheet" href="${cssUrl}">`,
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
  }, canaryProperties(scope));

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

/**
 * How many separate round trips a reading may take before it must agree with
 * itself. Two consecutive identical reads is the stability condition; the extra
 * budget is for a document that needs more than one recalculation to settle.
 */
const READ_STABILITY_ATTEMPTS = 8;

/** Consecutive identical readings required before a measurement is accepted. */
const READ_STABILITY_AGREEMENTS = 2;

/**
 * Provokes a full style recalculation, the way a fresh navigation does.
 *
 * `offsetHeight` forces layout from whatever style state is current; it cannot
 * force style to be re-derived. Setting and removing an attribute on the
 * document element dirties the whole subtree's style, so the next read cannot
 * be served from a partially updated cascade.
 */
async function invalidateStyle(page) {
  await page.evaluate(() => {
    const element = document.documentElement;
    element.setAttribute('data-ds-probe-invalidate', '1');
    void element.offsetHeight;
    element.removeAttribute('data-ds-probe-invalidate');
    void element.offsetHeight;
  });
}

/**
 * Reads every declared property of every planned target, and does NOT trust the
 * first answer.
 *
 * H-3a. The in-page flush below is necessary and was not sufficient. Measured on
 * the full roster: after an inline write on the document element the DEPENDENT
 * computed properties came back one phase behind -- the mutation read returned
 * the baseline values, the removal read returned the mutation values -- while
 * the custom property itself was always current. A run built on that reports a
 * live control as inert, which is the worst thing this harness can say.
 *
 * The cure is a DECIDABLE CONDITION, not a longer wait: read, then read again in
 * a SEPARATE round trip, and accept only when two consecutive reads agree. A
 * fixed sleep would be a guess that gets shorter than the document one day; two
 * agreeing reads is a statement about the page. If it never agrees, this throws
 * rather than returning the last answer -- an unstable document is a finding,
 * not a measurement.
 */
async function readAll(page, plan) {
  return readUntilStable(
    () => readAllOnce(page, plan),
    () => invalidateStyle(page),
  );
}

/**
 * Accepts a reading only once it agrees with itself under provocation.
 *
 * Separated from the page so the LAW is drillable without a browser: what is
 * under test is which answers this refuses, and a drill that needed Chromium to
 * ask that would be testing Chromium.
 *
 * @param {() => Promise<unknown>} read       takes one reading
 * @param {() => Promise<void>} invalidate    provokes a full recalculation between readings
 */
export async function readUntilStable(read, invalidate, options = {}) {
  const attempts = options.attempts ?? READ_STABILITY_ATTEMPTS;
  const required = options.agreements ?? READ_STABILITY_AGREEMENTS;
  let previous = null;
  let agreements = 0;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const current = await read();
    if (previous !== null && JSON.stringify(previous) === JSON.stringify(current)) {
      agreements += 1;
      // TWO agreements, not one. A single repeat is not enough: the page
      // settles in STAGES, and a chain whose second hop has not recalculated
      // yet reads identically twice on the intermediate plateau -- measured as
      // a card title at one application of the dial (x0.94) where the settled
      // answer is two (x0.94 squared). Every agreement is separated by a full
      // style invalidation below, so agreeing twice means the page stopped
      // changing under provocation, not that it was polled too fast.
      if (agreements >= required) return current;
    } else {
      agreements = 0;
    }
    previous = current;
    await invalidate();
  }
  throw new Error(
    `resolution-probe: the measured document never produced two consecutive identical readings in ` +
      `${READ_STABILITY_ATTEMPTS} round trips. The page is still recalculating, so no reading here ` +
      'describes a settled state.',
  );
}

async function readAllOnce(page, plan) {
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
        // Reserved observables: the RENDERED box, not the authored longhand.
        // getComputedStyle cannot see a transform/zoom-driven size change;
        // getBoundingClientRect is the browser answering "how big is this,
        // actually, right now" and is read fresh per property so a control
        // that mutates the box between reads is never averaged away.
        if (property === '@rect-inline-size' || property === '@rect-block-size') {
          const rect = element.getBoundingClientRect();
          values[property] = String(property === '@rect-inline-size' ? rect.width : rect.height);
          continue;
        }
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
 * The three-phase causal measurement: baseline, mutation, removal.
 *
 * ONE SCENE. Both ingress arms are measured against the same fixture set, the
 * same scope and the same baseline CSS, so "static and DB are equivalent"
 * becomes a diff of two arms of one run instead of a comparison between two
 * runs that also differ in browser state and bundle sha.
 *
 * THE TWO ARMS REMOVE DIFFERENTLY, BECAUSE THEY LAND DIFFERENTLY.
 *
 *   root-inline-style   The provider's position. The mutation is applied with
 *                       setProperty on the document element of the SAME page,
 *                       and removal replays a plan built from an inline memo
 *                       taken BEFORE the write — so a preexisting inline
 *                       declaration comes back byte-identical with its
 *                       priority, and a property the harness introduced is
 *                       removed rather than zeroed to a "default" that only
 *                       happens to match today.
 *
 *   tenant-scoped-      The compiled artifact's position. A stylesheet cannot
 *   stylesheet-block    be un-declared inside a live document the way an
 *                       inline property can, and a tenant unsetting a static
 *                       control ships a bundle without the block. So the
 *                       mutation phase serves baseline+block and the removal
 *                       phase re-serves the BASELINE STRING UNCHANGED. That is
 *                       this arm's byte-identical restore: the removal
 *                       stylesheet is not merely equivalent, it is the same
 *                       bytes, and the artifact records both hashes.
 *
 * @param {object} input
 * @param {object} input.browser
 * @param {string} input.css        the baseline CSS
 * @param {object} input.scope
 * @param {Array<object>} input.fixtures
 * @param {object} input.arm        from runtime/ingress: composeStaticArm | composeDbArm
 * @param {(memo: object) => {write: object[], restore: object[]}} [input.planFromMemo]
 *   required for a root-inline-style arm. The memo is only observable inside the
 *   page, so the planner is handed in rather than the plan.
 */
export async function measureCausalScope({
  browser,
  css,
  scope,
  fixtures,
  arm,
  planFromMemo = null,
}) {
  const validations = fixtures.map((fixture) => ({
    fixture,
    ...validateFixture(fixture, css),
  }));
  const matched = validations.filter((entry) => entry.matched).map((entry) => entry.fixture);
  const canaries = canaryProperties(scope);

  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    colorScheme: scope.theme === 'dark' ? 'dark' : 'light',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  try {
    // ONE DOCUMENT AND ONE STYLESHEET URL PER PHASE. A stylesheet-arm run
    // navigates the same page three times, and a browser is entitled to serve
    // the second and third `bundle.css` from its memory cache without the route
    // handler being consulted. That would silently measure the BASELINE sheet
    // during the mutation phase and report the control as inert — the single
    // most convincing false negative this harness could produce. Distinct URLs
    // make each phase a distinct subresource, so the cache cannot answer.
    const cssByPhase = {
      baseline: css,
      // Removal deliberately re-serves the SAME BINDING as the baseline, not a
      // recomposition of it, so the two phases are byte-identical by
      // construction rather than by comparison.
      removal: css,
      mutation: arm.mutateCss(css),
    };
    const cssUrlFor = (phase) => `${CSS_URL}?phase=${phase}`;
    const pageUrlFor = (phase) => `${PAGE_URL}?phase=${phase}`;
    const documents = Object.fromEntries(
      Object.keys(cssByPhase).map((phase) => [
        phase,
        buildDocument(scope, matched, cssUrlFor(phase)),
      ]),
    );

    await page.route(`${PROBE_ORIGIN}/**`, (route) => {
      const url = new URL(route.request().url());
      const phase = url.searchParams.get('phase');
      const target = `${url.origin}${url.pathname}`;
      if (target === PAGE_URL && documents[phase]) {
        return route.fulfill({ contentType: 'text/html; charset=utf-8', body: documents[phase] });
      }
      if (target === CSS_URL && cssByPhase[phase]) {
        return route.fulfill({ contentType: 'text/css; charset=utf-8', body: cssByPhase[phase] });
      }
      return route.abort();
    });

    const plan = matched.flatMap((fixture) =>
      fixture.targets.map((target) => ({
        fixtureId: fixture.id,
        targetId: target.id,
        selector: target.selector,
        properties: target.properties,
      })),
    );

    const observe = async () => ({
      readings: await readAll(page, plan),
      rootAttributes: await readRootAttributes(page),
      canaryReadings: await readTargetCanaries(page, plan, canaries),
    });
    const load = async (phase) => {
      await page.goto(pageUrlFor(phase), { waitUntil: 'load' });
      await assertStylesheetApplied(page, scope);
    };

    await load('baseline');
    const baseline = await observe();

    let phases;
    let inline = null;
    if (arm.position === 'root-inline-style') {
      const memo = await readInlineMemo(page, Object.keys(arm.variables));
      if (typeof planFromMemo !== 'function') {
        throw new Error(
          'resolution-probe: a root-inline-style arm needs planFromMemo so the removal plan is ' +
            'built from the observed memo. Removing without a memo cannot tell "unset what I ' +
            'wrote" from "delete what was already there".',
        );
      }
      inline = { memo, ...planFromMemo(memo) };
      await applyInlineOps(page, inline.write);
      await settle(page);
      const mutation = await observe();
      await applyInlineOps(page, inline.restore);
      await settle(page);
      const removal = await observe();
      phases = { baseline, mutation, removal };
    } else {
      await load('mutation');
      const mutation = await observe();
      await load('removal');
      const removal = await observe();
      phases = { baseline, mutation, removal };
    }

    return {
      armId: arm.armId,
      position: arm.position,
      plan,
      canaries,
      phases,
      inline,
      // The caller hashes these; this unit must not import runtime/bundle,
      // which is its own peer and therefore off limits.
      cssByPhase,
      unmatched: unmatchedRows(validations),
    };
  } finally {
    await page.close();
    await context.close();
  }
}

/** Every attribute on the document element, plus its class list. */
export async function readRootAttributes(page) {
  return page.evaluate(() => {
    const element = document.documentElement;
    const attributes = {};
    for (const attribute of [...element.attributes]) attributes[attribute.name] = attribute.value;
    attributes['#classList'] = [...element.classList].sort().join(' ');
    return attributes;
  });
}

/**
 * What each property currently reads on the document element's OWN inline
 * style, before anything is written.
 *
 * `getPropertyValue` on `element.style` returns the inline declaration only —
 * not the computed cascade — which is exactly the distinction removal needs.
 */
export async function readInlineMemo(page, names) {
  return page.evaluate((properties) => {
    const element = document.documentElement;
    const style = element.style;
    const memo = {};
    for (const name of properties) {
      const value = style.getPropertyValue(name);
      memo[name] = {
        present: value !== '',
        value,
        priority: style.getPropertyPriority(name),
      };
    }
    // `removeProperty` empties the declarations but LEAVES `style=""` behind, and
    // the root-attribute comparison reads presence, not content — so a document
    // that had no style attribute does not get one back by removal alone. `#`
    // cannot begin a CSS property name, so this cannot collide with a channel.
    memo['#attribute'] = { present: element.hasAttribute('style') };
    return memo;
  }, names);
}

/** Executes a plan. The page decides nothing; every decision was made in foundation/causality. */
export async function applyInlineOps(page, ops) {
  await page.evaluate((operations) => {
    const element = document.documentElement;
    const style = element.style;
    for (const op of operations) {
      if (op.op === 'remove') {
        style.removeProperty(op.name);
        continue;
      }
      if (op.op === 'remove-attribute') {
        // Only when the write left nothing behind: a declaration that survived
        // is a restore defect the comparison must still see, not one to erase.
        if (style.length === 0) element.removeAttribute(op.name);
        continue;
      }
      style.setProperty(op.name, op.value, op.priority || '');
    }
  }, ops);
}

/** The layer canary tokens, read on every measured element rather than on the root. */
export async function readTargetCanaries(page, plan, canaries) {
  return page.evaluate(
    ({ rows, properties }) => {
      void document.documentElement.offsetHeight;
      const output = {};
      for (const row of rows) {
        const element = document.querySelector(row.selector);
        if (!element) continue;
        const computed = getComputedStyle(element);
        const values = {};
        for (const property of properties) {
          values[property] = computed.getPropertyValue(property).trim();
        }
        output[`${row.fixtureId}/${row.targetId}`] = values;
      }
      return output;
    },
    { rows: plan, properties: canaries },
  );
}

function settle(page) {
  return page.evaluate(
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
