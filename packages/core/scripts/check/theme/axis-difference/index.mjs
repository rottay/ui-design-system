#!/usr/bin/env node
/**
 * axis-difference — the per-axis tenant-difference probe of
 * `roadmap/kit-2026-09.md` section 5 rule 4, measured in a browser.
 *
 * THE RULE, quoted rather than paraphrased: "Given two tenant documents of the
 * same vertical that differ in exactly one group of the kit, measure per family
 * the percentage with a computed-style difference attributable to that axis:
 * shape (`border-radius`), typography (`font-family`, `font-size`,
 * `font-weight`), rhythm (`padding`, `gap`, `margin`), depth (`box-shadow`,
 * `border-width`), states (the `*-hover`, `*-active`, `*-selected` channels
 * computed under `:hover` and `[data-state]`), motion (`transition-duration`,
 * `animation-duration`)."
 *
 * WHY A BROWSER. Every cheaper instrument in this repository answers a
 * different question. `artifact-coverage` asks whether a channel is declared.
 * `read-without-producer` asks whether a name has a writer. `transport-parity`
 * asks whether two doors emit the same bytes. None of them can answer "did the
 * painted `border-radius` of the card change", because that answer depends on
 * the cascade, on specificity, on layer order and on which of several
 * declarations wins, and a string comparison cannot see any of it. The failure
 * this closes is the one the audit found everywhere: a channel that is emitted,
 * digested, validated and inert.
 *
 * THE TWO NEGATIVE CONTROLS ARE NOT OPTIONAL, and they are the reason this is a
 * measurement and not a formality. Both are quoted from the same rule: "two
 * documents differing only in palette must give 0 % on the six non-chromatic
 * axes, and two differing only in `states.emphasis` must give 0 % on shape and
 * typography". A palette move repaints nearly everything, so an instrument
 * without the first control would report every axis at threshold while
 * measuring colour. They are implemented here as first-class scenarios and run
 * exactly like the positive ones.
 *
 * THE DENOMINATOR IS NOT THIS FILE'S. It comes from `check/theme/population`,
 * read at a recorded catalog revision and published with every run, because
 * "a percentage whose denominator moved between runs is not comparable"
 * (WO-EVI-02, R4 amendment 3). This file may not compute, widen or shrink one.
 *
 * WHAT THIS GATE DOES NOT DO. It does not certify the fleet. The
 * 80-per-cent-per-axis threshold is `WO-EVI-02`'s own acceptance and is
 * owner-gated; `--threshold` exists so the same instrument can be pointed at it
 * when the family cuts have landed, and the default run PUBLISHES the
 * percentages without passing judgement on them. Reporting a pilot percentage
 * as a fleet percentage is explicitly forbidden by `WO-EVI-05`.
 *
 * Usage:
 *   node scripts/check/theme/axis-difference/index.mjs                  measure and publish
 *   node scripts/check/theme/axis-difference/index.mjs --json           the full measurement
 *   node scripts/check/theme/axis-difference/index.mjs --vertical=evnto one vertical
 *   node scripts/check/theme/axis-difference/index.mjs --threshold=80   fail below 80 % per axis
 *   node scripts/check/theme/axis-difference/index.mjs --families=button,card
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';
import { launchBrowser } from '../../tokens/cascade/probe/runtime/browser/index.mjs';
import { resolveBundle } from '../../tokens/cascade/probe/runtime/bundle/index.mjs';
import {
  rootAttributes,
  rootAttributesToHtml,
} from '../../tokens/cascade/probe/foundation/scope/index.mjs';
import {
  AXES,
  AXIS_IDS,
  axisPopulations,
  catalogRevision,
  skinFamilies,
  stripCssComments,
} from '../population/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);

/** The published DB door, exactly the one `runtime/ingress` binds; never a deep path. */
export const COMPILER_MODULE = 'dist/server.js';
export const COMPILER_EXPORT = 'compileTenantThemeDocumentV2';

/**
 * The scenarios, positive and negative, each a PAIR of documents differing in
 * exactly one group of the kit.
 *
 * Values are chosen because they MOVE and because they sit inside the
 * per-vertical envelope. A pair a vertical refuses is reported as a refusal and
 * never counted as "no difference", which would make a negative control pass by
 * never running.
 */
export const SCENARIOS = Object.freeze([
  {
    id: 'shape',
    kind: 'positive',
    axis: 'shape',
    a: { 'shape.radius-scale': 0.8, 'shape.button-style': 'sharp', 'shape.control-height': 'compact' },
    b: { 'shape.radius-scale': 1.15, 'shape.button-style': 'pill', 'shape.control-height': 'tall' },
  },
  {
    id: 'typography',
    kind: 'positive',
    axis: 'typography',
    a: { 'typography.scale': 0.95, 'typography.role-weights': 'light' },
    b: { 'typography.scale': 1.05, 'typography.role-weights': 'strong' },
  },
  {
    id: 'rhythm',
    kind: 'positive',
    axis: 'rhythm',
    a: { 'density.mode': 'compact', 'spacing.rhythm': 'tight' },
    b: { 'density.mode': 'spacious', 'spacing.rhythm': 'airy' },
  },
  {
    id: 'depth',
    kind: 'positive',
    axis: 'depth',
    a: { 'surfaces.elevation-posture': 'flat', 'surfaces.border-style': 'none' },
    b: { 'surfaces.elevation-posture': 'elevated', 'surfaces.border-style': 'strong' },
  },
  {
    id: 'states',
    kind: 'positive',
    axis: 'states',
    a: { 'states.emphasis': 'subtle', 'states.focus-style': 'ring' },
    b: { 'states.emphasis': 'strong', 'states.focus-style': 'glow' },
  },
  {
    // Both motion rows, not just the character: the axis is measured on
    // `transition-duration` and `animation-duration`, and `motion.dial` is the
    // row that owns the duration scale. A pair that moved only the character
    // would be asking the axis about easing and reading it about duration.
    id: 'motion',
    kind: 'positive',
    axis: 'motion',
    // Inside the envelope every vertical publishes (motionDurationScale
    // 0.75..1.35, motionIntensity 0..0.8): the catalog's own bounds are wider,
    // and a pair outside the envelope is refused before it is measured.
    a: { 'motion.character': 'mechanical', 'motion.dial': { durationScale: 0.8, intensity: 0.2 } },
    b: { 'motion.character': 'playful', 'motion.dial': { durationScale: 1.3, intensity: 0.8 } },
  },
  {
    // NEGATIVE CONTROL 1, quoted: "two documents differing only in palette must
    // give 0 % on the six non-chromatic axes".
    id: 'palette-only',
    kind: 'negative',
    expectZeroOn: AXIS_IDS,
    a: { 'palette.seeds': { primary: '#1F4FA8', secondary: '#3C6E71', accent: '#B26B2E' } },
    b: { 'palette.seeds': { primary: '#7A2E6B', secondary: '#2E6B5A', accent: '#A8471F' } },
  },
  {
    // NEGATIVE CONTROL 2, quoted: "two differing only in `states.emphasis` must
    // give 0 % on shape and typography".
    id: 'states-emphasis-only',
    kind: 'negative',
    expectZeroOn: ['shape', 'typography'],
    a: { 'states.emphasis': 'subtle' },
    b: { 'states.emphasis': 'strong' },
  },
]);

/**
 * The DOM shape a family is measured on, derived from the family's OWN skin.
 *
 * A fixture invented by hand is a fixture that stops matching in silence: the
 * browser returns the initial value for every property and the run looks green,
 * which is a lying counter and the reason the sibling probe's roster carries
 * `requiresSelectors`. Here the shape is READ OFF the selector, so it matches by
 * construction, and a family whose skin publishes no mountable selector is
 * reported as unmountable rather than counted as "no difference".
 */
const SELECTOR_RULE = /(^|\})([^{}@]+)\{/gu;
const CLASS_TOKEN = /\.([A-Za-z][\w-]*)/gu;
const ATTRIBUTE_TOKEN = /\[([\w-]+)(?:\s*=\s*['"]?([^\]'"]+)['"]?)?\]/gu;

/** The compound selectors a stylesheet declares, one per comma-separated part. */
export function selectorParts(css) {
  const parts = [];
  for (const match of stripCssComments(css).matchAll(SELECTOR_RULE)) {
    for (const part of match[2].split(',')) {
      const trimmed = part.trim();
      if (trimmed.length > 0) parts.push(trimmed);
    }
  }
  return parts;
}

/** True for a selector this probe can materialise as ONE element. */
export function isSingleElement(selector) {
  const withoutAttributes = selector.replace(/\[[^\]]*\]/gu, '');
  if (/[>~+]/u.test(withoutAttributes)) return false;
  if (/\s/u.test(withoutAttributes.trim())) return false;
  if (/:/u.test(withoutAttributes)) return false;
  if (withoutAttributes.includes('*')) return false;
  return /^\.(ds|rt|rottay)-/u.test(selector.trim());
}

/**
 * The element a family is measured on: its most-decorated single-element
 * selector, preferring a `data-part="root"` when the skin publishes one.
 */
export function familyElement(css) {
  const candidates = selectorParts(css)
    .map((selector) =>
      selector
        .replace(/:where\(([^()]*)\)/gu, '$1')
        .replace(/:is\(([^()]*)\)/gu, '$1')
        .trim())
    .filter((selector) => isSingleElement(selector));
  if (candidates.length === 0) return null;
  const score = (selector) => {
    const classes = [...selector.matchAll(CLASS_TOKEN)].length;
    const attributes = [...selector.matchAll(ATTRIBUTE_TOKEN)].length;
    const isRoot = /data-part\s*=\s*['"]?root/u.test(selector) ? 10 : 0;
    return classes + attributes * 2 + isRoot;
  };
  const best = [...candidates].sort((a, b) => score(b) - score(a))[0];
  const classes = [...best.matchAll(CLASS_TOKEN)].map((match) => match[1]);
  const attributes = {};
  for (const match of best.matchAll(ATTRIBUTE_TOKEN)) attributes[match[1]] = match[2] ?? '';
  return { selector: best, classes, attributes };
}

/** family -> its element, or null when the skin publishes no mountable selector. */
export function familyElements(root = CORE_ROOT, only = null) {
  const elements = new Map();
  for (const [family, files] of skinFamilies(root)) {
    if (only && !only.includes(family)) continue;
    const css = files.map((file) => readFileSync(file, 'utf8')).join('\n');
    elements.set(family, familyElement(css));
  }
  return elements;
}

/**
 * Pairs whose compiled artifact carries ZERO variables on a vertical: the door
 * admits the document, the admission reports the decision `lit: true`, and the
 * published delta is empty.
 *
 * This is a PRODUCT fact, not an instrument fact, and the difference is the
 * whole reason it is a list rather than a failure. Measured 2026-09-11 through
 * `compileTenantThemeDocumentV2` on `dist/server.js`: a `palette.seeds`
 * document that produces 40 variables on bithire and 42 on evnto produces 0 on
 * rottay, while `shape.radius-scale` produces 1 on all three. The admission
 * reports `lit: true` and a patch at `modes.light.palette.*`; the artifact
 * carries nothing.
 *
 * Consequences, both stated rather than left implicit:
 *  - a NEW inert pair fails this gate, so the list may only shrink;
 *  - a cell whose pair is inert proves NOTHING, so its 0 % is published with
 *    `evidential: false` and a negative control may not be credited from it.
 *
 * Owner: the derivation lane (rottay receives identity by decisions, D-14 /
 * kit section 5 rule 5). Not this lot's to fix, and not this lot's to hide.
 */
export const INERT_PAIRS = Object.freeze([
  {
    vertical: 'rottay',
    scenario: 'palette-only',
    note:
      'palette.seeds compiles to an empty artifact delta on rottay while the door reports the decision lit; '
      + 'the same document moves 40 channels on bithire and 42 on evnto',
  },
]);

const isDeclaredInert = (vertical, scenario) =>
  INERT_PAIRS.some((entry) => entry.vertical === vertical && entry.scenario === scenario);

/** The compiled tenant variable map for one document, through the published door. */
async function compileDocument({ compile, vertical, slug, decisions }) {
  const compilation = compile({
    document: { version: 2, plan: 'pro', decisions },
    tenantId: `tenant_axis_${slug}`,
    slug,
    verticalKey: vertical,
    rowVersion: 1,
  });
  return compilation.artifact.variables;
}

/** The page HTML: the bundle, the scope attributes, and one node per family. */
export function sceneHtml({ css, vertical, theme, elements }) {
  const attributes = rootAttributesToHtml(rootAttributes({ vertical, theme }));
  const nodes = [...elements]
    .filter(([, element]) => element !== null)
    .map(([family, element]) => {
      const classAttribute = element.classes.join(' ');
      const extra = Object.entries(element.attributes)
        .map(([name, value]) => ` ${name}="${value}"`)
        .join('');
      return `<div data-axis-family="${family}" class="${classAttribute}"${extra}></div>`;
    })
    .join('\n');
  return `<!doctype html><html ${attributes}><head><style>${css}</style></head>`
    + `<body><div id="axis-scene">${nodes}</div></body></html>`;
}

/**
 * States are measured under `[data-state]`, per the rule.
 *
 * `:hover` is deliberately not simulated by writing a class, because a
 * fabricated hover measures the fabrication. Playwright's real hover moves one
 * element at a time, which would turn one whole-page read into several hundred;
 * `[data-state]` is stamped by the anatomy kernel on every family and read by
 * the same skin rules, so it is the half of the rule a whole-page read can
 * answer honestly. The `:hover` half is NAMED in the artifact as unmeasured
 * rather than implied.
 */
export const STATE_VARIANTS = Object.freeze(['hovered', 'pressed', 'selected']);

/** Every property read in one pass; each axis owns which of them it counts. */
export function allProperties() {
  return [...new Set(AXIS_IDS.flatMap((axis) => AXES[axis].computed))];
}

const readComputed = (properties) => {
  // FORCE A STYLE FLUSH BEFORE READING. Not defensive padding: writing custom
  // properties on the document element and calling getComputedStyle in the next
  // CDP round trip returns the STALE value on a document this size. Measured
  // here, not inherited as folklore -- one family's box-shadow read identical
  // under two different palettes with 4 nodes on the page and different with 3,
  // which is a reading that describes nothing.
  void document.documentElement.offsetHeight;
  const out = {};
  for (const node of document.querySelectorAll('[data-axis-family]')) {
    const family = node.getAttribute('data-axis-family');
    const computed = getComputedStyle(node);
    const values = {};
    for (const property of properties) values[property] = computed.getPropertyValue(property);
    out[family] = values;
  }
  return out;
};

const applyVariables = (variables) => {
  const root = document.documentElement;
  for (const name of [...root.style]) {
    if (name.startsWith('--ds-')) root.style.removeProperty(name);
  }
  for (const [name, value] of Object.entries(variables)) root.style.setProperty(name, value);
  return [...root.style].filter((name) => name.startsWith('--ds-')).length;
};

const stampState = (state) => {
  for (const node of document.querySelectorAll('[data-axis-family]')) {
    if (state === null) node.removeAttribute('data-state');
    else node.setAttribute('data-state', state);
  }
};

/**
 * The style invalidation between two readings.
 *
 * The nudge property is deliberately NOT in the `--ds-` namespace: the variable
 * application above clears every `--ds-*` inline property, so a nudge inside it
 * would be erased by the next arm and the two arms would be invalidated a
 * different number of times.
 */
const invalidateStyles = () => {
  const root = document.documentElement;
  const marker = root.style.getPropertyValue('--axis-probe-nudge');
  root.style.setProperty('--axis-probe-nudge', marker === '1' ? '0' : '1');
  void root.offsetHeight;
};

/** How many invalidate-and-reread round trips a scene gets to settle. */
export const SETTLE_ATTEMPTS = 6;

/**
 * The families whose computed values converge asymptotically instead of
 * settling, excluded from every denominator by NAME.
 *
 * They are declared rather than discovered per run, and that is the whole
 * point: which of them a given run happens to catch varies (`card` in one run,
 * `input` in the next), so a per-run exclusion would move the denominator
 * between runs -- the precise thing `WO-EVI-02` R4 amendment 3 forbids.
 * Declared, the denominator is the same number every time and a family that
 * BECOMES unsettled outside this list is a failure rather than a silent
 * shrinkage.
 *
 * Measured 2026-09-11 on bithire/evnto/rottay, light and dark: each resolves
 * padding through a container query over its own box, so every recalculation
 * nudges the value a little less than the last (9.66599px, 9.62545px,
 * 9.61983px, 9.61875px) without ever repeating.
 */
export const UNSETTLED_FAMILIES = Object.freeze([
  'affix',
  'card',
  'cockpit-header',
  'detail-header',
  'input',
  'layout-primitives',
  'mobile-header',
]);

/**
 * A reading the page has stopped changing under, PER FAMILY, plus the families
 * it never stopped changing for.
 *
 * WHY NOT the sibling probe's `readUntilStable`. That helper is all-or-nothing
 * over a small hand-built plan: it demands two consecutive identical readings
 * of the WHOLE plan and throws otherwise. On a 248-family scene it never
 * returns, and running it established why -- two families
 * (`cockpit-header`, `layout-primitives`) resolve their padding through a
 * container query over their own box, so each recalculation nudges the value a
 * little less than the last: 9.66599px, 9.62545px, 9.61983px, 9.61875px. That
 * is convergence, not settlement, and no number of round trips makes it exact.
 *
 * Averaging or rounding it away would be worse than the problem: a 0.04px drift
 * between the two arms of a pair is indistinguishable from a real difference,
 * so it would inflate every positive percentage AND break both negative
 * controls. So the unsettled families are NAMED, excluded from every
 * denominator, and published with the run. An exclusion nobody can see is how a
 * denominator gets shrunk to reach a threshold.
 */
export async function readSettled(page, properties) {
  let previous = await page.evaluate(readComputed, properties);
  let unsettled = new Set(Object.keys(previous));
  let current = previous;
  for (let attempt = 0; attempt < SETTLE_ATTEMPTS && unsettled.size > 0; attempt += 1) {
    await page.evaluate(invalidateStyles);
    current = await page.evaluate(readComputed, properties);
    const stillMoving = new Set();
    for (const family of unsettled) {
      for (const property of properties) {
        if (previous[family]?.[property] !== current[family]?.[property]) {
          stillMoving.add(family);
          break;
        }
      }
    }
    unsettled = stillMoving;
    previous = current;
  }
  return { values: current, unsettled: [...unsettled].sort() };
}

/** One document's readings: the resting paint plus one per stamped state. */
export async function measureCell({ page, variables, properties }) {
  const applied = await page.evaluate(applyVariables, variables);
  const unsettled = new Set();
  const collect = async () => {
    const reading = await readSettled(page, properties);
    for (const family of reading.unsettled) unsettled.add(family);
    return reading.values;
  };
  const base = await collect();
  const states = {};
  for (const state of STATE_VARIANTS) {
    await page.evaluate(stampState, state);
    states[state] = await collect();
  }
  await page.evaluate(stampState, null);
  return { applied, base, states, unsettled: [...unsettled].sort() };
}

/**
 * Colour tokens, in every form a computed value can carry them.
 *
 * WHY THIS EXISTS, and it is the rule's own wording rather than a convenience:
 * a difference counts only when it is "attributable to that axis". A
 * `box-shadow` is a depth property whose value EMBEDS a colour, so a
 * palette-only pair changes its string -- measured on bithire, where
 * `detail-header` read `oklab(0.5367 ...) 0px 12px 28px` against
 * `oklab(0.5150 ...) 0px 12px 28px`: identical geometry, different tint. That
 * is a difference attributable to colour, and counting it would have put the
 * first negative control of the rule at 1.6 % on depth for a reason that has
 * nothing to do with depth.
 *
 * Stripping is applied on the six NON-chromatic axes only, and it is safe in
 * the other direction: a real depth move changes offsets, blur or spread, all
 * of which survive it.
 */
const COLOUR_TOKEN =
  /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)\([^()]*(?:\([^()]*\)[^()]*)*\)/giu;

export function stripColour(value) {
  return typeof value === 'string' ? value.replace(COLOUR_TOKEN, '<colour>') : value;
}

/**
 * Did this family's paint move on this axis, and on which property.
 *
 * The states axis is scoped to the STATE readings on purpose: a family whose
 * resting paint changed has moved on whatever axis owns that property, not on
 * `states`. And its property set is the whole vocabulary, because what a state
 * changes is not confined to one axis's longhands.
 */
export function differsOnAxis(axis, before, after, family) {
  const readings = axis === 'states'
    ? STATE_VARIANTS.map((state) => [before.states[state], after.states[state]])
    : [[before.base, after.base]];
  const properties = axis === 'states' ? allProperties() : AXES[axis].computed;
  for (const [left, right] of readings) {
    const a = left?.[family];
    const b = right?.[family];
    if (!a || !b) continue;
    for (const property of properties) {
      if (stripColour(a[property]) !== stripColour(b[property])) return property;
    }
  }
  return null;
}

export async function run({
  verticals = ['bithire', 'evnto', 'rottay'],
  themes = ['light', 'dark'],
  families = null,
  root = CORE_ROOT,
  /* The drill's only injection point. It exists so a NULL pair (two identical
   * documents) can be driven through the same browser, the same bundle and the
   * same comparison as a real one: an instrument that reports a difference
   * between a document and itself is reporting noise, and no amount of
   * unit-testing the comparator would catch it. */
  scenarios = SCENARIOS,
} = {}) {
  const module = await import(pathToFileURL(resolve(root, COMPILER_MODULE)).href);
  const compile = module[COMPILER_EXPORT];
  if (typeof compile !== 'function') {
    throw new Error(`axis-difference: ${COMPILER_MODULE} exports no callable ${COMPILER_EXPORT}`);
  }

  const elements = familyElements(root, families);
  const mountable = [...elements].filter(([, element]) => element !== null).map(([family]) => family);
  const unmountable = [...elements].filter(([, element]) => element === null).map(([family]) => family);
  const populations = axisPopulations(root);
  const properties = allProperties();

  const { browser, close, provenance } = await launchBrowser();
  const cells = [];
  const refusals = [];
  const observedUnsettled = new Set();
  const newlyUnsettled = new Set();
  try {
    const context = await browser.newContext();
    for (const vertical of verticals) {
      const bundle = await resolveBundle({ vertical, mode: 'fresh' });
      for (const theme of themes) {
        const page = await context.newPage();
        await page.setContent(sceneHtml({ css: bundle.css, vertical, theme, elements }), {
          waitUntil: 'load',
        });
        for (const scenario of scenarios) {
          let before;
          let after;
          let compiledA = 0;
          let compiledB = 0;
          try {
            const variablesA = await compileDocument({
              compile, vertical, slug: `${scenario.id}-a`, decisions: scenario.a,
            });
            const variablesB = await compileDocument({
              compile, vertical, slug: `${scenario.id}-b`, decisions: scenario.b,
            });
            compiledA = Object.keys(variablesA).length;
            compiledB = Object.keys(variablesB).length;
            before = await measureCell({ page, variables: variablesA, properties });
            after = await measureCell({ page, variables: variablesB, properties });
          } catch (error) {
            refusals.push({
              vertical,
              theme,
              scenario: scenario.id,
              reason: error instanceof Error ? error.message : String(error),
            });
            continue;
          }
          for (const family of [...before.unsettled, ...after.unsettled]) {
            if (!UNSETTLED_FAMILIES.includes(family)) newlyUnsettled.add(family);
            observedUnsettled.add(family);
          }
          const axes = scenario.kind === 'positive' ? [scenario.axis] : scenario.expectZeroOn;
          for (const axis of axes) {
            const denominator = populations
              .get(axis)
              .filter((family) => mountable.includes(family) && !UNSETTLED_FAMILIES.includes(family));
            const moved = [];
            for (const family of denominator) {
              const property = differsOnAxis(axis, before, after, family);
              if (property) moved.push({ family, property });
            }
            cells.push({
              vertical,
              theme,
              scenario: scenario.id,
              kind: scenario.kind,
              axis,
              compiledA,
              compiledB,
              appliedA: before.applied,
              appliedB: after.applied,
              // A pair that compiles to nothing cannot be evidence FOR anything,
              // in either direction. Publishing the zero and refusing to credit
              // it is the only honest handling.
              evidential: compiledA > 0 && compiledB > 0,
              denominator: denominator.length,
              excludedUnsettled: UNSETTLED_FAMILIES.filter((family) => populations.get(axis).includes(family)),
              moved: moved.length,
              percent: denominator.length === 0 ? 0 : (moved.length / denominator.length) * 100,
              movedFamilies: moved.slice(0, 12),
            });
          }
        }
        await page.close();
      }
    }
  } finally {
    await close();
  }

  return {
    revision: catalogRevision(),
    browser: provenance,
    bundleMode: 'fresh',
    verticals,
    themes,
    families: {
      mountable: mountable.length,
      unmountable,
      excludedUnsettled: [...UNSETTLED_FAMILIES],
      observedUnsettled: [...observedUnsettled].sort(),
      newlyUnsettled: [...newlyUnsettled].sort(),
    },
    populations: Object.fromEntries(AXIS_IDS.map((axis) => [
      axis,
      populations
        .get(axis)
        .filter((family) => mountable.includes(family) && !UNSETTLED_FAMILIES.includes(family))
        .length,
    ])),
    refusals,
    cells,
    statesNote:
      'The states axis is measured under [data-state] only. The :hover half of the rule needs one real '
      + 'pointer move per element and is NOT measured here; it is named rather than implied.',
    unsettledNote:
      'A family whose computed values converge asymptotically under repeated style invalidation (a container '
      + 'query over its own box) is excluded from every denominator of the run it was unsettled in, and named '
      + 'here. Its drift is indistinguishable from a real difference at the sizes involved.',
  };
}

export function evaluate(result, { threshold = null } = {}) {
  const failures = [];
  if (result.cells.length === 0) failures.push('no cell measured — the probe ran nothing');
  if (result.families.mountable === 0) {
    failures.push('no family could be mounted — the selector reader is broken');
  }
  for (const family of result.families.newlyUnsettled ?? []) {
    failures.push(
      `${family}: its readings never settle and it is NOT in UNSETTLED_FAMILIES. A family whose paint converges `
      + 'asymptotically cannot be compared between two arms; name it there with the measurement, or fix the '
      + 'self-referential container query that causes it',
    );
  }
  for (const refusal of result.refusals) {
    failures.push(
      `${refusal.vertical}/${refusal.theme} ${refusal.scenario}: the pair was REFUSED and therefore not `
      + `measured — ${refusal.reason}`,
    );
  }
  // Two different verdicts that look alike, separated on purpose.
  //
  // An arm that COMPILED variables but applied none is an INSTRUMENT failure:
  // the page never received the pair, and every reading in the cell is of the
  // base bundle twice. It always fails.
  //
  // An arm that compiled NOTHING is a PRODUCT fact: the decision moves no
  // channel on that vertical. It fails unless it is a declared, named entry of
  // `INERT_PAIRS`, so the first one is a finding and the next one cannot hide
  // behind it.
  for (const cell of result.cells) {
    if (cell.compiledA > 0 && cell.compiledB > 0 && (cell.appliedA === 0 || cell.appliedB === 0)) {
      failures.push(
        `${cell.vertical}/${cell.theme} ${cell.scenario}: the pair compiled `
        + `${cell.compiledA}/${cell.compiledB} variables and the page applied `
        + `${cell.appliedA}/${cell.appliedB}; the instrument lost them`,
      );
      continue;
    }
    if ((cell.compiledA === 0 || cell.compiledB === 0) && !isDeclaredInert(cell.vertical, cell.scenario)) {
      failures.push(
        `${cell.vertical} ${cell.scenario}: the pair compiles to an EMPTY artifact delta `
        + `(${cell.compiledA}/${cell.compiledB} variables) — the decision moves no channel on this vertical. `
        + 'Fix the derivation, or have the owner record it in INERT_PAIRS with the measurement',
      );
    }
  }
  for (const entry of INERT_PAIRS) {
    const cells = result.cells.filter(
      (cell) => cell.vertical === entry.vertical && cell.scenario === entry.scenario,
    );
    if (cells.length > 0 && cells.every((cell) => cell.compiledA > 0 && cell.compiledB > 0)) {
      failures.push(
        `${entry.vertical} ${entry.scenario}: declared inert and is no longer; remove it from INERT_PAIRS`,
      );
    }
  }

  // The negative controls are checked on EVERY run, threshold or not: they are
  // what make a positive percentage mean anything.
  const negatives = result.cells.filter((entry) => entry.kind === 'negative');
  if (negatives.length > 0 && !negatives.some((cell) => cell.evidential)) {
    failures.push(
      'every negative-control cell in this run is non-evidential (its pair compiled to nothing), so the run '
      + 'carries no negative control at all',
    );
  }
  for (const cell of negatives) {
    if (cell.moved > 0) {
      failures.push(
        `NEGATIVE CONTROL ${cell.scenario} moved ${cell.moved}/${cell.denominator} families on ${cell.axis} `
        + `(${cell.vertical}/${cell.theme}); the rule requires 0 %. Families: `
        + `${cell.movedFamilies.map((entry) => `${entry.family}(${entry.property})`).join(', ')}`,
      );
    }
  }

  if (threshold !== null) {
    for (const axis of AXIS_IDS) {
      const positive = result.cells.filter((cell) => cell.kind === 'positive' && cell.axis === axis);
      if (positive.length === 0) {
        failures.push(`${axis}: no positive scenario measured it`);
        continue;
      }
      const evidential = positive.filter((cell) => cell.evidential);
      if (evidential.length === 0) {
        failures.push(`${axis}: every positive cell is non-evidential; no percentage can be read from this run`);
        continue;
      }
      const worst = evidential.reduce((low, cell) => (cell.percent < low.percent ? cell : low));
      if (worst.percent < threshold) {
        failures.push(
          `${axis}: ${worst.percent.toFixed(1)} % < ${threshold} % on ${worst.vertical}/${worst.theme} `
          + `(${worst.moved}/${worst.denominator} families)`,
        );
      }
    }
  }
  return failures;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const argument = (name) =>
    process.argv.find((entry) => entry.startsWith(`--${name}=`))?.slice(`--${name}=`.length);
  const thresholdArgument = argument('threshold');
  const result = await run({
    verticals: argument('vertical')?.split(',') ?? ['bithire', 'evnto', 'rottay'],
    themes: argument('theme')?.split(',') ?? ['light', 'dark'],
    families: argument('families')?.split(',') ?? null,
  });
  if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));

  console.log(
    `axis-difference — catalog ${result.revision.digest}, ${result.families.mountable} mountable famil(ies), `
    + `${result.verticals.length} vertical(s) x ${result.themes.length} mode(s); bundle ${result.bundleMode}; `
    + `chromium ${result.browser.browserVersion}`,
  );
  console.log(
    `  denominators: ${Object.entries(result.populations).map(([axis, n]) => `${axis} ${n}`).join(', ')}`,
  );
  console.log(
    `  excluded as unsettled (declared, named): ${result.families.excludedUnsettled.join(', ')}`
    + ` — observed this run: ${result.families.observedUnsettled.join(', ') || 'none'}`,
  );
  for (const kind of ['positive', 'negative']) {
    for (const cell of result.cells.filter((entry) => entry.kind === kind)) {
      console.log(
        `  ${kind === 'negative' ? 'NEG ' : '    '}${cell.vertical}/${cell.theme} `
        + `${cell.scenario.padEnd(22)} ${cell.axis.padEnd(11)} `
        + `${cell.moved}/${cell.denominator} = ${cell.percent.toFixed(1)}%`
        + (cell.evidential ? '' : '  [NON-EVIDENTIAL: the pair compiles to an empty delta]'),
      );
    }
  }
  const failures = evaluate(result, {
    threshold: thresholdArgument === undefined ? null : Number(thresholdArgument),
  });
  if (failures.length > 0) {
    for (const failure of failures) console.error(`axis-difference FAIL — ${failure}`);
    process.exit(1);
  }
  console.log(
    'axis-difference OK — both negative controls at 0 %'
    + (thresholdArgument === undefined
      ? '; no threshold applied (the fleet bar is WO-EVI-02 acceptance, not this run)'
      : `, every axis at or above ${thresholdArgument} %`),
  );
}
