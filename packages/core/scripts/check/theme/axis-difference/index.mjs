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
 * A CONTROL IS ONLY EVIDENCE IF ITS OWN DECISION MOVED SOMETHING IN THE CELL IT
 * CERTIFIES, which is the one thing a 0 % cannot tell you by itself. The
 * witness is therefore bound to the cell it stands for -- same vertical, same
 * mode, same kit control -- because neither of the looser readings is evidence:
 * one (vertical, mode) where the decision reaches paint says nothing about the
 * eleven where it does not, and a positive pair that moves two catalog rows at
 * once says nothing about the one row the control isolates. Each control
 * publishes `evidential` per cell and the verdict names the two SEPARATELY:
 * today the palette control is evidential on every cell, and no cell of the
 * `states.emphasis` control is, because the states positive reads 0 % in every
 * one of them for the reasons enumerated and measured in `STATES_AXIS_LIMITS`.
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
    // What has to have moved, in THIS cell, for this control's zero to be
    // evidence: the `states` positive in the same vertical and mode, AND the
    // `states.emphasis` row on its own -- the pair below -- on the `states`
    // axis there. The positive moves two catalog rows at once, so it alone
    // cannot tell emphasis from focus-style.
    witness: { axis: 'states', control: 'states.emphasis', positive: 'states' },
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
 * Pairs whose compiled artifact carries ZERO channels for the CELL being
 * measured: the door admits the document, the admission reports the decision
 * `lit: true`, and the published delta for that mode is empty.
 *
 * AN ENTRY IS PER MODE, not per vertical. The list used to carry
 * rottay / `palette-only` with no mode at all, which hid twelve cells behind
 * one observation and was wrong on its own terms: the probe was reading
 * `artifact.variables` alone, so on rottay -- default mode dark -- it never saw
 * the 22-channel light block the palette actually ships in. That entry is gone;
 * rottay's LIGHT cells now measure the control like every other vertical.
 *
 * The entry that survived it -- rottay / dark / `palette-only` -- is DISCHARGED.
 * It recorded a product fact, and the derivation lane it named has since fixed
 * that fact: `ingress/foundation/document-patch` read an absent `backgroundMode`
 * as `"light"`, so on the one vertical whose default mode is dark every seed
 * landed in `modes.light` and the mode the tenant renders was untouched. Seeds
 * now tune the mode the vertical renders. Measured 2026-09-11 through
 * `compileTenantThemeDocumentV2` on `dist/server.js`, before -> after:
 *
 *   rottay  palette.seeds                     base  0 -> 23, modeDeltas light 22 -> 23
 *   rottay  palette.seeds + dark-mode 'auto'  base  0 -> 23, modeDeltas light 22 -> 23
 *   rottay  palette.seeds + dark-mode 'dark'  APCA-refused -> base 23
 *   bithire palette.seeds                     base 40 -> 40, modeDeltas dark 39 -> 39
 *   evnto   palette.seeds                     base 42 -> 42, modeDeltas dark 42 -> 42
 *
 * This run therefore measures rottay's dark palette-only cells like every other
 * vertical's: the six of them move from non-evidential to evidential, and the
 * negative control goes from 30 of 36 evidential cells to 36 of 36.
 *
 * The MECHANISM is the point of the list, and it stays:
 *  - an arm that compiles nothing is a PRODUCT fact and fails this gate unless
 *    the owner records it here WITH the measurement, so the first one is a
 *    finding and the next cannot hide behind it;
 *  - a cell whose pair is inert proves NOTHING, so its 0 % is published with
 *    `evidential: false` and a negative control may not be credited from it.
 */
export const INERT_PAIRS = Object.freeze([]);

/**
 * An entry with no `theme` covers every mode of that pair; an entry WITH one
 * covers that mode alone, so declaring the mode that is genuinely empty cannot
 * excuse the mode that is not.
 */
const isDeclaredInert = (inertPairs, vertical, theme, scenario) =>
  inertPairs.some((entry) =>
    entry.vertical === vertical
    && entry.scenario === scenario
    && (entry.theme === undefined || entry.theme === theme));

/**
 * The compiled tenant artifact for one document, through the published door.
 *
 * BOTH halves are returned because both SHIP. The artifact is a base rule plus
 * one rule per mode the tenant changes, and a mode selector carries one
 * attribute more than the base, so wherever a mode speaks it wins. A probe that
 * applied `variables` alone would measure the base block in BOTH modes, which
 * reads every non-default mode's own block as if it did not exist and reports
 * live decisions inert.
 */
async function compileDocument({ compile, vertical, slug, decisions }) {
  const compilation = compile({
    document: { version: 2, plan: 'pro', decisions },
    tenantId: `tenant_axis_${slug}`,
    slug,
    verticalKey: vertical,
    rowVersion: 1,
  });
  const { variables, modeDeltas } = compilation.artifact;
  return { variables, modeDeltas: modeDeltas ?? [] };
}

/**
 * The channel map a scene must carry to reproduce ONE mode of that artifact:
 * the base block, overlaid by that mode's own block.
 *
 * Applied inline in this order, the winner is the one the shipped stylesheet's
 * specificity picks -- the mode block where it declares a channel, the base
 * block everywhere else.
 */
export function effectiveVariables(artifact, theme) {
  const delta = artifact.modeDeltas.find((block) => block.mode === theme);
  return { ...artifact.variables, ...(delta?.variables ?? {}) };
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

/**
 * WHAT THIS PROBE CANNOT SEE ON THE STATES AXIS, measured rather than asserted.
 *
 * The states positive reads 0 % on every vertical and both modes, and a zero is
 * the one reading that has two completely different causes: the decision moves
 * nothing, or the instrument cannot see what it moved. This block is the second
 * half, enumerated, so the zero is publishable without being read as either.
 *
 * It also settles what the run may claim about NEGATIVE CONTROL 2. That control
 * is "two documents differing only in `states.emphasis` give 0 % on shape and
 * typography" -- but a control is evidence only if the same decision MOVED
 * something IN THE SAME CELL. Wherever the states positive is zero, that cell's
 * 0 % on shape and typography is compatible with the decision reaching no
 * family at all, so the run marks that cell non-evidential and says why. A run
 * that claimed both controls green would be crediting a reading that cost
 * nothing.
 *
 * Measured 2026-09-11 over the 275 Modern skin families and the 28 channels
 * catalog rows `states.emphasis` and `states.focus-style` produce:
 *
 *  - 15 of the 28 have ZERO readers in any Modern skin, the four `*-shift`
 *    channels and `--ds-state-disabled-mix` among them. Nothing at all paints
 *    them, in any state.
 *  - Of the 13 that are read, 9 paint a property OUTSIDE this probe's
 *    vocabulary and are invisible to it by construction: `--ds-state-press-scale`
 *    (18 readers) paints `transform`, `--ds-state-disabled-opacity` (4) paints
 *    `opacity`, `--ds-focus-ring-offset` (57) paints `outline-offset`, and the
 *    six live `--ds-material-*-background-*` channels paint `background`. The
 *    six axes of kit rule 4 are non-chromatic and name none of these longhands.
 *  - The remaining 4 -- `--ds-focus-ring` (24 readers), `--ds-focus-ring-width`
 *    (74), `--ds-material-panel-focus-ring` (1), `--ds-material-control-focus-ring`
 *    (1) -- do paint `box-shadow`, which IS read. Every one of those reads is
 *    behind a focus condition: 33 of the 34 rules that carry one select on
 *    `:focus-visible`, `[data-focused]` or `[data-state~='focused']`, and the
 *    34th is a `@keyframes` stop. `focused` is not in `STATE_VARIANTS`, and a
 *    stamped attribute cannot produce `:focus-visible` anyway -- that needs real
 *    keyboard focus, one element at a time.
 *  - The declaration side agrees: of the 157 families in the states population,
 *    134 declare the axis through pseudo-classes ONLY, 19 through `[data-state=`
 *    and 4 through a state channel alone. So the half of the rule this scene can
 *    answer covers 19 families of 157 before a single value is compared.
 *
 * None of this is a reason to soften the axis. It is the reason the axis is
 * published at 0 % WITH its limits instead of being quietly dropped, and it
 * names exactly what would have to change for the number to mean something: a
 * per-element hover/focus pass, and skins that read the state channels.
 */
export const STATES_AXIS_LIMITS = Object.freeze({
  measuredOn: '2026-09-11',
  channels: { total: 28, withoutReaders: 15, outsideProbeVocabulary: 9, paintingBoxShadow: 4 },
  focusReads: { rules: 34, focusGuarded: 33, keyframeStop: 1 },
  declarations: { population: 157, pseudoClassOnly: 134, byDataState: 19, byChannelOnly: 4 },
  stampedStates: [...STATE_VARIANTS],
  unreachable: [
    'the four --ds-state-*-shift channels and --ds-state-disabled-mix have no reader in any Modern skin',
    '--ds-state-press-scale paints transform and --ds-state-disabled-opacity paints opacity; neither longhand '
    + 'belongs to any of the six non-chromatic axes',
    'the four focus channels that do paint box-shadow apply only under :focus-visible / [data-focused] / '
    + "[data-state~='focused']; this probe stamps hovered, pressed and selected, and never takes real focus",
    ':hover is not simulated, so 134 of the 157 states families declare the axis in a way this scene never enters',
  ],
});

/** The negative control the states-axis limits make vacuous wherever that axis reads zero. */
export const STATES_DEPENDENT_CONTROL = 'states-emphasis-only';

/** The controls that may not be credited without a witness bound to the cell. */
export const WITNESSED_CONTROLS = Object.freeze(
  SCENARIOS.filter((scenario) => scenario.witness !== undefined).map((scenario) => scenario.id),
);

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
 * The families whose Modern skin publishes NO selector this probe can
 * materialise as one element, excluded from every denominator by NAME.
 *
 * WHY THIS IS PINNED and not merely reported. The published population is
 * 221/183/216/197/157/202 families per axis; what a run measures is that set
 * MINUS the families it could not mount and MINUS the unsettled ones, which is
 * 206/175/199/182/148/191. That subtraction is legitimate -- a family with no
 * mountable selector has nothing to read a computed style off -- but a
 * subtraction nobody pinned is a denominator that shrinks silently: a skin
 * refactor that turns a single-element rule into a descendant rule removes the
 * family from the bottom of every fraction it was in, and every percentage
 * above it goes UP for a reason that has nothing to do with tenant reach.
 *
 * So the set is declared here, checked for exact equality on a full run, and
 * published beside the two denominators it separates. A family that STOPS
 * mounting is a failure with an instruction to re-pin in the same commit, not a
 * quieter fraction.
 *
 * Measured 2026-09-11: 27 of 275 skin families. They fall in three groups --
 * keyframe-only and motion-only skins that declare no element rule at all
 * (`primitive-motion`, `toast-animation-keyframes`, `stats-header-keyframes`,
 * `data-terminal-card-keyframes`), surface and workspace skins whose every rule
 * is a descendant selector (`record-workbench`, `wizard-surface`,
 * `detail-form-surface`, `empty-state-surface`), and vertical screen skins of
 * the same shape (`billing`, `audit`, `settings`, `team`).
 */
export const UNMOUNTABLE_FAMILIES = Object.freeze([
  'adaptive-overlay',
  'audit',
  'billing',
  'brand-studio',
  'command-center',
  'dashboard-activity-interactions',
  'dashboard-metrics-interactions',
  'data-table-interactions',
  'data-terminal-card-keyframes',
  'decision-inbox',
  'detail-form-surface',
  'empty-state-surface',
  'file-browser',
  'form-placeholders',
  'import-export',
  'input-residual',
  'integration',
  'navigation-static',
  'primitive-motion',
  'profile',
  'record-workbench',
  'settings',
  'statistic-compounds',
  'stats-header-keyframes',
  'team',
  'toast-animation-keyframes',
  'wizard-surface',
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

/**
 * Did the control's OWN decision move anything, in the cell being measured, on
 * the axis that decision owns.
 *
 * The reading is taken from the pair the control already ships -- two documents
 * differing in exactly one catalog row -- so it attributes to that row and to
 * nothing else. It is not published as a cell: the control's cells are the axes
 * its `expectZeroOn` names, and an axis where the control is SUPPOSED to move
 * would be accused by the 0 % rule if it were pushed through as one.
 */
export function witnessReading({ witness, before, after, denominator }) {
  const moved = [];
  for (const family of denominator) {
    const property = differsOnAxis(witness.axis, before, after, family);
    if (property) moved.push({ family, property });
  }
  return {
    axis: witness.axis,
    control: witness.control,
    positive: witness.positive,
    moved: moved.length,
    denominator: denominator.length,
    movedFamilies: moved.slice(0, 12),
  };
}

/**
 * THE WITNESS IS BOUND TO THE CELL, and this is the whole of the rule.
 *
 * `states-emphasis-only` reads 0 % on shape and typography, which is exactly
 * what the rule demands -- and a 0 % is worth nothing until something proves
 * the decision behind it could have moved that cell at all. Two looser readings
 * of "something moved" were both wrong, and each is refused here by name:
 *
 *  - RUN-GLOBAL. Summing the states positive over the whole run credits twelve
 *    (vertical, mode) cells because ONE of them moved. The day the first cell
 *    starts working is precisely the day this matters, so the witness is looked
 *    up in the same vertical and the same mode as the cell it certifies.
 *  - CROSS-CONTROL. The states positive moves `states.emphasis` AND
 *    `states.focus-style` in one pair, so its movement is equally explained by
 *    the row this control does not isolate. The control's own pair -- which
 *    differs in `states.emphasis` alone -- is measured on the same axis in the
 *    same cell, and that reading is what attributes the movement to emphasis.
 *
 * Both must hold. Where either is absent the cell keeps its published
 * percentage and loses its standing, with the half that failed named in the
 * reason. Mutating the cells rather than filtering them is deliberate: a reader
 * sees both the number and why it is not evidence.
 */
export function markVacuousControls(cells, { witnessedControls = WITNESSED_CONTROLS } = {}) {
  for (const cell of cells) {
    if (!witnessedControls.includes(cell.scenario)) continue;
    const reason = vacuousReason(cell, cells);
    if (reason === null) continue;
    cell.evidential = false;
    cell.nonEvidentialReason = reason;
  }
  return cells;
}

/** Why this cell's control carries no witness, or `null` when it carries one. */
function vacuousReason(cell, cells) {
  const where = `${cell.vertical}/${cell.theme}`;
  const witness = cell.witness ?? null;
  if (witness === null) {
    return `no witness was measured for ${where} ${cell.scenario}, and a 0 % standing on nothing is not evidence`;
  }
  const positive = cells.filter((entry) => entry.kind === 'positive'
    && entry.scenario === witness.positive
    && entry.vertical === cell.vertical
    && entry.theme === cell.theme);
  if (positive.length === 0) {
    return `the ${witness.positive} positive was not measured in ${where}, so this cell has no witness — a `
      + 'positive that moved in another cell says nothing about this one';
  }
  const positiveMoved = positive.reduce((total, entry) => total + entry.moved, 0);
  if (positiveMoved === 0) {
    return `the ${witness.positive} positive moved 0 famil(ies) in ${where} — the very cell this 0 % would `
      + 'certify — so it shows only that nothing this probe can read moved there — see limits.states';
  }
  if (witness.moved === 0) {
    return `the ${witness.positive} positive moved ${positiveMoved} famil(ies) in ${where}, but ${witness.control} `
      + `on its own moved 0 of ${witness.denominator} famil(ies) on the ${witness.axis} axis there, so that `
      + `movement is attributable to the other row of the positive pair and not to ${witness.control}`;
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
  const effective = (axis) => populations
    .get(axis)
    .filter((family) => mountable.includes(family) && !UNSETTLED_FAMILIES.includes(family));

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
          let baseA = 0;
          let baseB = 0;
          try {
            const artifactA = await compileDocument({
              compile, vertical, slug: `${scenario.id}-a`, decisions: scenario.a,
            });
            const artifactB = await compileDocument({
              compile, vertical, slug: `${scenario.id}-b`, decisions: scenario.b,
            });
            // The cell is ONE mode of the artifact, so it carries that mode's
            // block over the base one -- the same winner the shipped selector
            // order produces. Reading `variables` alone measured the base block
            // twice and called a routed palette inert.
            const variablesA = effectiveVariables(artifactA, theme);
            const variablesB = effectiveVariables(artifactB, theme);
            baseA = Object.keys(artifactA.variables).length;
            baseB = Object.keys(artifactB.variables).length;
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
          // Measured once per (vertical, mode, control) and carried by every
          // cell that control publishes there, because it is that cell's
          // standing that depends on it.
          const witness = scenario.witness === undefined
            ? null
            : witnessReading({
              witness: scenario.witness,
              before,
              after,
              denominator: effective(scenario.witness.axis),
            });
          const axes = scenario.kind === 'positive' ? [scenario.axis] : scenario.expectZeroOn;
          for (const axis of axes) {
            const denominator = effective(axis);
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
              // The base block alone, kept beside the effective count so a
              // reader can see which half of the artifact carried the pair.
              baseA,
              baseB,
              appliedA: before.applied,
              appliedB: after.applied,
              // A pair that compiles to nothing cannot be evidence FOR anything,
              // in either direction. Publishing the zero and refusing to credit
              // it is the only honest handling.
              evidential: compiledA > 0 && compiledB > 0,
              // What this cell's control moved with its OWN decision, here.
              // `null` for a control whose standing needs no witness.
              witness,
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

  markVacuousControls(cells);

  return {
    revision: catalogRevision(),
    browser: provenance,
    bundleMode: 'fresh',
    verticals,
    themes,
    familiesFiltered: families !== null,
    families: {
      mountable: mountable.length,
      unmountable,
      pinnedUnmountable: [...UNMOUNTABLE_FAMILIES],
      excludedUnsettled: [...UNSETTLED_FAMILIES],
      observedUnsettled: [...observedUnsettled].sort(),
      newlyUnsettled: [...newlyUnsettled].sort(),
    },
    populations: Object.fromEntries(AXIS_IDS.map((axis) => [axis, effective(axis).length])),
    // THE DENOMINATOR, RECONCILED. `populations` above is the EFFECTIVE bottom
    // of every fraction this run publishes; `declaredPopulations` is the pinned
    // set `check/theme/population` owns. The two differ, and a reader who only
    // saw the smaller one could not tell a legitimate exclusion from a silent
    // shrinkage -- so both are published with the subtraction spelled out.
    declaredPopulations: Object.fromEntries(
      AXIS_IDS.map((axis) => [axis, populations.get(axis).length]),
    ),
    denominatorReconciliation: Object.fromEntries(AXIS_IDS.map((axis) => {
      const declared = populations.get(axis);
      return [axis, {
        declared: declared.length,
        excludedUnmountable: declared.filter((family) => unmountable.includes(family)).length,
        excludedUnsettled: declared.filter((family) => UNSETTLED_FAMILIES.includes(family)).length,
        effective: effective(axis).length,
      }];
    })),
    refusals,
    cells,
    limits: { states: STATES_AXIS_LIMITS },
    statesNote:
      'The states axis is measured under [data-state] only. The :hover half of the rule needs one real '
      + 'pointer move per element and is NOT measured here; it is named rather than implied. What else this '
      + 'probe cannot see on that axis is enumerated with its measurements in limits.states.',
    unsettledNote:
      'A family whose computed values converge asymptotically under repeated style invalidation (a container '
      + 'query over its own box) is excluded from every denominator of the run it was unsettled in, and named '
      + 'here. Its drift is indistinguishable from a real difference at the sizes involved.',
    unmountableNote:
      'A family whose Modern skin publishes no single-element selector cannot be mounted and is excluded from '
      + 'every denominator. The set is PINNED in UNMOUNTABLE_FAMILIES and checked for exact equality on a full '
      + 'run, so a family that stops mounting is a failure rather than a smaller fraction.',
  };
}

export function evaluate(result, { threshold = null, inertPairs = INERT_PAIRS } = {}) {
  const failures = [];
  if (result.cells.length === 0) failures.push('no cell measured — the probe ran nothing');
  if (result.families.mountable === 0) {
    failures.push('no family could be mounted — the selector reader is broken');
  }
  // THE EXCLUDED SET IS PART OF THE DENOMINATOR. Checked only on a full run: a
  // `--families=` run measures a deliberate subset and its unmountable list is
  // that subset's, not the corpus's.
  if (result.familiesFiltered !== true) {
    const pinned = [...(result.families.pinnedUnmountable ?? UNMOUNTABLE_FAMILIES)].sort();
    const observed = [...result.families.unmountable].sort();
    for (const family of observed) {
      if (!pinned.includes(family)) {
        failures.push(
          `${family}: its Modern skin publishes no mountable selector and it is NOT in UNMOUNTABLE_FAMILIES, so `
          + 'it silently left every denominator it was in. Restore the single-element rule, or pin it there with '
          + 'the measurement in this commit',
        );
      }
    }
    for (const family of pinned) {
      if (!observed.includes(family)) {
        failures.push(`${family}: pinned as unmountable and now mounts; remove it from UNMOUNTABLE_FAMILIES in this commit`);
      }
    }
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
    if ((cell.compiledA === 0 || cell.compiledB === 0)
      && !isDeclaredInert(inertPairs, cell.vertical, cell.theme, cell.scenario)) {
      failures.push(
        `${cell.vertical}/${cell.theme} ${cell.scenario}: the pair compiles to an EMPTY artifact delta `
        + `(${cell.compiledA}/${cell.compiledB} variables) — the decision moves no channel on this vertical. `
        + 'Fix the derivation, or have the owner record it in INERT_PAIRS with the measurement',
      );
    }
  }
  for (const entry of inertPairs) {
    const cells = result.cells.filter(
      (cell) => cell.vertical === entry.vertical
        && cell.scenario === entry.scenario
        && (entry.theme === undefined || entry.theme === cell.theme),
    );
    if (cells.length > 0 && cells.every((cell) => cell.compiledA > 0 && cell.compiledB > 0)) {
      failures.push(
        `${entry.vertical}${entry.theme ? `/${entry.theme}` : ''} ${entry.scenario}: declared inert and is no `
        + 'longer; remove it from INERT_PAIRS',
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
    `  denominators (effective): ${Object.entries(result.populations).map(([axis, n]) => `${axis} ${n}`).join(', ')}`,
  );
  console.log(
    `  denominators (declared by check/theme/population): `
    + `${Object.entries(result.declaredPopulations).map(([axis, n]) => `${axis} ${n}`).join(', ')}`,
  );
  for (const [axis, row] of Object.entries(result.denominatorReconciliation)) {
    console.log(
      `    ${axis.padEnd(11)} ${row.declared} declared − ${row.excludedUnmountable} unmountable `
      + `− ${row.excludedUnsettled} unsettled = ${row.effective}`,
    );
  }
  console.log(
    `  excluded as unmountable (pinned, named): ${result.families.unmountable.length} famil(ies)`
    + ` — exactly the pin: ${result.familiesFiltered ? 'not checked (--families run)' : 'yes'}`,
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
        + (cell.evidential ? '' : `  [NON-EVIDENTIAL: ${cell.nonEvidentialReason
          ?? 'the pair compiles to an empty delta'}]`),
      );
    }
  }
  for (const line of result.limits.states.unreachable) console.log(`  states axis limit: ${line}`);
  const failures = evaluate(result, {
    threshold: thresholdArgument === undefined ? null : Number(thresholdArgument),
  });
  if (failures.length > 0) {
    for (const failure of failures) console.error(`axis-difference FAIL — ${failure}`);
    process.exit(1);
  }
  // The verdict names each control SEPARATELY. "Both negative controls green"
  // was the line this run is not entitled to while one of them is vacuous.
  const controls = [...new Set(result.cells.filter((cell) => cell.kind === 'negative').map((cell) => cell.scenario))];
  for (const control of controls) {
    const own = result.cells.filter((cell) => cell.scenario === control);
    const evidential = own.filter((cell) => cell.evidential);
    // Cell by cell, because the standing is now per cell: a control can be
    // evidence in one (vertical, mode) and vacuous in the next, and a single
    // run-wide adjective would hide exactly that.
    console.log(
      evidential.length === 0
        ? `  NEGATIVE CONTROL ${control}: NON-EVIDENTIAL on all ${own.length} cell(s) — e.g. `
          + `${own[0].vertical}/${own[0].theme}: ${own[0].nonEvidentialReason
            ?? 'its pair compiles to an empty delta'}`
        : `  NEGATIVE CONTROL ${control}: 0 % on ${evidential.length} evidential cell(s) of ${own.length}`,
    );
  }
  console.log(
    'axis-difference OK — every evidential negative-control cell at 0 %'
    + (thresholdArgument === undefined
      ? '; no threshold applied (the fleet bar is WO-EVI-02 acceptance, not this run)'
      : `, every axis at or above ${thresholdArgument} %`),
  );
}
