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
 * publishes `evidential` per cell and the verdict names the two SEPARATELY.
 * WHAT the witness is differs, because what each control isolates differs: the
 * `states.emphasis` pair needs the states positive to have moved in the same
 * cell AND its own row to have moved there, while the `palette.seeds` pair --
 * already a one-row pair -- needs only its two arms to reach the page as
 * DIFFERENT effective maps. A non-empty map is not a witness; neither is a
 * positive that moved in another cell.
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
  EXCLUDED_GROUP,
  axisControls,
  axisPopulations,
  catalogRevision,
  groupControls,
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
    // What has to have moved, in THIS cell, for this control's zero to be
    // evidence: the two documents must reach the page as DIFFERENT effective
    // maps. This control isolates one catalog row already -- its pair differs
    // in `palette.seeds` alone -- so its own compiled pair is the witness, and
    // the reading that matters is not "both maps are non-empty" but "the two
    // maps differ at all".
    //
    // Measured 2026-09-12 through `compileTenantThemeDocumentV2` on a dist
    // built from this tree, as differing/channels per cell: bithire 39/41
    // light and 20/44 dark, evnto 39/42 and 17/44, rottay 18/23 and 18/23.
    // Every cell carries a witness today, so the law downgrades nothing here.
    // It is the law rather than an observation because the reading it replaces
    // could not tell that apart from a mode whose seeds are routed elsewhere:
    // a cell that stops differing now loses its standing by itself.
    witness: { kind: 'effective-map', control: 'palette.seeds' },
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
    witness: { kind: 'axis-positive', axis: 'states', control: 'states.emphasis', positive: 'states' },
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

/**
 * The page HTML: the bundle, the scope attributes, and one node per family.
 *
 * A family with a MOUNT is measured on its own server-rendered anatomy instead
 * of the one element read off its skin: a skin that paints a part below the
 * root (a checkbox box, a segmented option) is invisible to a single element.
 */
export function sceneHtml({ css, vertical, theme, elements, mounts = null }) {
  const attributes = rootAttributesToHtml(rootAttributes({ vertical, theme }));
  const nodes = [...elements]
    .filter(([family, element]) => element !== null || mounts?.[family] !== undefined)
    .map(([family, element]) => {
      if (mounts?.[family] !== undefined) {
        return `<div data-axis-family="${family}" data-axis-mount="">${mounts[family].markup}</div>`;
      }
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
export const STATE_VARIANTS = Object.freeze(['hovered', 'pressed', 'selected', 'focus-visible']);

/**
 * WHAT THIS PROBE CANNOT SEE ON THE STATES AXIS, measured rather than asserted.
 *
 * A zero on this axis has two causes that read alike: the decision moves
 * nothing, or the instrument cannot see what it moved. This block enumerates
 * the second, so a low fleet reading is publishable without being read as the
 * first. It also bounds NEGATIVE CONTROL 2: that control is evidence in a cell
 * only where the states positive, and `states.emphasis` alone, moved there.
 *
 * Measured 2026-09-13 over the Modern skin corpus and the 28 channels catalog
 * rows `states.emphasis` and `states.focus-style` produce, after the axis gained
 * the non-chromatic longhands state channels paint and the `focus-visible`
 * stamp (WO-EVI-05):
 *
 *  - 16 of the 28 have ZERO readers in any Modern skin, among them
 *    `--ds-state-active-shift`, `--ds-state-selected-shift`,
 *    `--ds-state-disabled-mix` and the three `--ds-material-*-focus-ring`.
 *  - 7 are read only to paint `background`/`background-color`, which is colour
 *    and excluded from the six axes by the rule itself.
 *  - 5 paint inside the vocabulary: `--ds-state-press-scale` (17 skins,
 *    `transform`), `--ds-state-disabled-opacity` (5, `opacity`),
 *    `--ds-focus-ring` (24, `box-shadow`), `--ds-focus-ring-width` (73,
 *    `outline`/`box-shadow`) and `--ds-focus-ring-offset` (56, `outline-offset`).
 *  - The declaration side: of the 156 families in the states population, 133
 *    declare the axis through pseudo-classes ONLY, 19 through `[data-state=`
 *    and 4 through a state channel alone. A stamped attribute cannot produce
 *    `:hover` or `:focus-visible`, so the whole-page scene reaches 23 of 156
 *    before a single value is compared.
 *
 * What would have to change for the fleet number to cover the axis: a
 * per-element pointer/keyboard pass, and skins that pair their pseudo-classes
 * with the stamped state (the family cuts do this).
 */
export const STATES_AXIS_LIMITS = Object.freeze({
  measuredOn: '2026-09-13',
  channels: { total: 28, withoutReaders: 16, paintingColourOnly: 7, paintingInsideVocabulary: 5 },
  declarations: { population: 156, pseudoClassOnly: 133, byDataState: 19, byChannelOnly: 4 },
  stampedStates: [...STATE_VARIANTS],
  unreachable: [
    '16 of the 28 states channels have no reader in any Modern skin',
    '7 states channels paint only background colour, which the six non-chromatic axes exclude',
    ':hover and :focus-visible are not simulated, so 133 of the 156 states families declare the axis in a way '
    + 'this scene never enters',
  ],
});

/** The negative control the states-axis limits make vacuous wherever that axis reads zero. */
export const STATES_DEPENDENT_CONTROL = 'states-emphasis-only';

/** The ids of the two negative controls of kit rule 4, as shipped. */
export const NEGATIVE_CONTROLS = Object.freeze(
  SCENARIOS.filter((scenario) => scenario.kind === 'negative').map((scenario) => scenario.id),
);

const sameValue = (left, right) => JSON.stringify(left) === JSON.stringify(right);

/**
 * The scenarios of kit rule 4 cut from a PAIR of complete tenant documents.
 *
 * Each positive keeps `base` and takes `other`'s rows of exactly one axis group;
 * the two negative controls take `other`'s colour group, and its
 * `states.emphasis` alone, carrying the witnesses the shipped controls declare.
 * A cut in which the two documents agree moves nothing by construction and is
 * refused rather than published as a zero.
 */
export function pairScenarios({
  base,
  other,
  controls = axisControls(),
  colour = groupControls(EXCLUDED_GROUP),
}) {
  const cut = (id, rows) => {
    const b = { ...base };
    for (const row of rows) {
      if (Object.hasOwn(other, row)) b[row] = other[row];
      else delete b[row];
    }
    if (rows.every((row) => sameValue(base[row], b[row]))) {
      throw new Error(`axis-difference: the pair agrees on every row of ${id} (${rows.join(', ')}), so it cannot measure it`);
    }
    return { ...SCENARIOS.find((scenario) => scenario.id === id), a: base, b };
  };
  const palette = cut('palette-only', colour);
  return [
    ...AXIS_IDS.map((axis) => cut(axis, controls.get(axis))),
    { ...palette, witness: { ...palette.witness, control: `${EXCLUDED_GROUP} group` } },
    cut('states-emphasis-only', ['states.emphasis']),
  ];
}

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
  // A stamped state starts the skin's transitions, and a reading taken while one
  // runs is a frame of it: a document then differs from itself on `transform`.
  // Each is moved to its end state; one that never ends is held at its start.
  for (const animation of document.getAnimations()) {
    try {
      animation.finish();
    } catch {
      animation.pause();
      animation.currentTime = 0;
    }
  }
  const out = {};
  for (const node of document.querySelectorAll('[data-axis-family]')) {
    const family = node.getAttribute('data-axis-family');
    // A mounted family reads every element of its anatomy, in document order,
    // so a move on any part is a move of the family.
    const targets = node.hasAttribute('data-axis-mount') ? [...node.querySelectorAll('*')] : [node];
    const styles = targets.map((target) => getComputedStyle(target));
    const values = {};
    for (const property of properties) {
      values[property] = styles.map((style) => style.getPropertyValue(property)).join(' | ');
    }
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
    if (!node.hasAttribute('data-axis-mount')) {
      if (state === null) node.removeAttribute('data-state');
      else node.setAttribute('data-state', state);
      continue;
    }
    // Real anatomy already carries its resting state tokens, and the skins
    // match with `~=`, so the probed state is ADDED to them and later restored.
    for (const target of node.querySelectorAll(':scope > *, [data-part]')) {
      if (!target.hasAttribute('data-axis-rest-state')) {
        target.setAttribute('data-axis-rest-state', target.getAttribute('data-state') ?? '');
      }
      const rest = target.getAttribute('data-axis-rest-state');
      const next = state === null ? rest : `${rest} ${state}`.trim();
      if (next === '') target.removeAttribute('data-state');
      else target.setAttribute('data-state', next);
    }
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
 * Measured 2026-09-12 (WO-INV-04): 26 of 275 skin families. `brand-studio`
 * left the set: its preview cut was an `@container` query with no declared
 * container at all, and naming that container put a single-element rule
 * (`.ds-pattern-brand-studio { container: ds-brand-studio / inline-size }`) on
 * the family root, which is exactly what "mountable" means here.
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
export function witnessReading({ witness, before, after, denominator, variablesA, variablesB }) {
  if (witness.kind === 'effective-map') {
    return {
      kind: witness.kind,
      control: witness.control,
      ...effectiveMapDifference(variablesA ?? {}, variablesB ?? {}),
    };
  }
  const moved = [];
  for (const family of denominator) {
    const property = differsOnAxis(witness.axis, before, after, family);
    if (property) moved.push({ family, property });
  }
  return {
    kind: witness.kind ?? 'axis-positive',
    axis: witness.axis,
    control: witness.control,
    positive: witness.positive,
    moved: moved.length,
    denominator: denominator.length,
    movedFamilies: moved.slice(0, 12),
  };
}

/**
 * How far apart the two arms of a pair actually land, as CHANNELS rather than
 * as a count of channels.
 *
 * `compiledA > 0 && compiledB > 0` was the reading this replaces, and it
 * answers a question nobody asked: whether the door emitted anything. On the
 * cells where a decision is routed to the mode the tenant does NOT render, both
 * arms emit a full map and the two maps are the SAME map, so the page receives
 * one document twice and the 0 % that follows is arithmetic, not evidence.
 * `differing` is the reading that separates them: it is the number of names on
 * which the two documents disagree, and it is zero exactly when this probe has
 * nothing to read.
 */
export function effectiveMapDifference(variablesA, variablesB) {
  const names = [...new Set([...Object.keys(variablesA), ...Object.keys(variablesB)])].sort();
  const differing = names.filter((name) => variablesA[name] !== variablesB[name]);
  return {
    channels: names.length,
    differing: differing.length,
    differingChannels: differing.slice(0, 12),
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
 *
 * THE SAME LAW COVERS `palette-only`, and the third wrong reading it refuses is
 * the one this control shipped with:
 *
 *  - NON-EMPTY. A pair whose two arms both compile a full map was read as
 *    evidential because neither map was empty. On twelve of the thirty-six
 *    cells those two maps are the SAME map -- rottay/light and evnto/dark emit
 *    the seeds into the mode the vertical does not render, so both arms carry
 *    0 differing channels -- and a 0 % measured by applying one document twice
 *    is guaranteed by construction. The witness is the DIFFERENCE between the
 *    two effective maps, not the size of either.
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
  if (witness.kind === 'effective-map') {
    if (witness.differing > 0) return null;
    return `the two documents of the ${witness.control} pair compile to an IDENTICAL effective map in ${where} `
      + `(${witness.channels} channel(s), 0 differing) — identical map = no witness this probe can read, because `
      + 'both arms apply the same document and a 0 % between a document and itself certifies nothing';
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

/** `vertical/mode (axis, axis)` for each cell named, so a verdict names WHICH cells it lost. */
export function namedCells(cells) {
  const byCell = new Map();
  for (const cell of cells) {
    const where = `${cell.vertical}/${cell.theme}`;
    byCell.set(where, [...(byCell.get(where) ?? []), cell.axis]);
  }
  return [...byCell].map(([where, axes]) => `${where} (${axes.join(', ')})`).join('; ');
}

/** One `[vertical/mode, reason]` per cell that lost its standing, deduplicated over the axes. */
export function vacuousReasonsByCell(cells) {
  const byCell = new Map();
  for (const cell of cells) {
    const where = `${cell.vertical}/${cell.theme}`;
    if (!byCell.has(where)) {
      byCell.set(where, cell.nonEvidentialReason ?? 'its pair compiles to an empty delta');
    }
  }
  return [...byCell];
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
  /* family -> { markup }: the family's own server-rendered anatomy, measured in
   * place of the single element read off its skin. */
  mounts = null,
  /* The same export of the same compiler, handed in by a runner that reads the
   * source tree instead of `dist/`; absent, the published door is imported. */
  compile: compileOverride = null,
} = {}) {
  const compile = compileOverride
    ?? (await import(pathToFileURL(resolve(root, COMPILER_MODULE)).href))[COMPILER_EXPORT];
  if (typeof compile !== 'function') {
    throw new Error(`axis-difference: ${COMPILER_MODULE} exports no callable ${COMPILER_EXPORT}`);
  }

  const elements = familyElements(root, families);
  for (const family of Object.keys(mounts ?? {})) {
    if (!elements.has(family)) {
      throw new Error(`axis-difference: a mount was supplied for ${family}, which has no Modern skin family`);
    }
  }
  const isMounted = (family) => mounts?.[family] !== undefined;
  const mountable = [...elements]
    .filter(([family, element]) => element !== null || isMounted(family))
    .map(([family]) => family);
  const unmountable = [...elements]
    .filter(([family, element]) => element === null && !isMounted(family))
    .map(([family]) => family);
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
        await page.setContent(sceneHtml({ css: bundle.css, vertical, theme, elements, mounts }), {
          waitUntil: 'load',
        });
        for (const scenario of scenarios) {
          let before;
          let after;
          let compiledA = 0;
          let compiledB = 0;
          let baseA = 0;
          let baseB = 0;
          let variablesA = {};
          let variablesB = {};
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
            variablesA = effectiveVariables(artifactA, theme);
            variablesB = effectiveVariables(artifactB, theme);
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
              denominator: scenario.witness.axis === undefined ? [] : effective(scenario.witness.axis),
              variablesA,
              variablesB,
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
              movedIds: moved.map((entry) => entry.family),
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
      mounted: Object.keys(mounts ?? {}).sort(),
      unmountable,
      pinnedUnmountable: [...UNMOUNTABLE_FAMILIES],
      excludedUnsettled: [...UNSETTLED_FAMILIES],
      observedUnsettled: [...observedUnsettled].sort(),
      newlyUnsettled: [...newlyUnsettled].sort(),
    },
    populations: Object.fromEntries(AXIS_IDS.map((axis) => [axis, effective(axis).length])),
    effectiveFamilies: Object.fromEntries(AXIS_IDS.map((axis) => [axis, effective(axis)])),
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

/**
 * The one negative control this run may carry with NO standing cell, and the
 * only one.
 *
 * `states-emphasis-only` stands only where the states positive moves, and the
 * limits in `STATES_AXIS_LIMITS` bound how often that can be on the fleet;
 * dropping the control instead of publishing it vacuous would hide that
 * measurement. Every OTHER
 * negative control must keep at least one evidential cell, because a control
 * that has gone wholly vacuous is indistinguishable from a control that was
 * never run, and a run with no negative control has nothing holding its
 * positives honest. The list is declared here so that becoming vacuous is a
 * FAILURE for a control nobody adjudicated, not a quieter verdict.
 */
export const VACUITY_PERMITTED_CONTROLS = Object.freeze([STATES_DEPENDENT_CONTROL]);

export function evaluate(result, {
  threshold = null,
  inertPairs = INERT_PAIRS,
  vacuityPermitted = VACUITY_PERMITTED_CONTROLS,
} = {}) {
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
  // FAIL CLOSED, PER CONTROL. Marking cells non-evidential is what makes the
  // verdict honest; it must not also be what makes it green. A control whose
  // every cell lost its standing has stopped being a control, and only the one
  // whose vacuity is measured and enumerated may say so without failing.
  for (const control of [...new Set(negatives.map((cell) => cell.scenario))]) {
    if (vacuityPermitted.includes(control)) continue;
    const own = negatives.filter((cell) => cell.scenario === control);
    if (own.some((cell) => cell.evidential)) continue;
    failures.push(
      `NEGATIVE CONTROL ${control}: all ${own.length} of its cell(s) are NON-EVIDENTIAL, so this run carries no `
      + `${control} control at all — e.g. ${own[0].vertical}/${own[0].theme}: ${own[0].nonEvidentialReason
        ?? 'its pair compiles to an empty delta'}`,
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

/**
 * The pilot verdict of `WO-EVI-05`, on top of `evaluate`: every family of the
 * pilot population moves in every measured cell on every axis it declares, and
 * both negative controls stand on every cell. No threshold is read -- the pilot
 * denominators are not the fleet's -- and no control may be vacuous.
 */
export function evaluatePilot(result, pilot) {
  const failures = evaluate(result, { vacuityPermitted: [] });
  const members = Object.keys(pilot.families ?? {});
  if (members.length === 0) failures.push('the pilot population names no family');
  if (result.revision.digest !== pilot.catalogRevision) {
    failures.push(
      `the run measured catalog ${result.revision.digest} and the pilot population is published at `
      + `${pilot.catalogRevision}; re-publish both at one revision`,
    );
  }
  for (const axis of AXIS_IDS) {
    const declared = members.filter((family) => pilot.families[family].includes(axis)).length;
    if (pilot.denominators?.[axis] !== declared) {
      failures.push(`${axis}: pilot denominator ${pilot.denominators?.[axis]} != ${declared} declaring families`);
    }
  }
  for (const family of members) {
    for (const axis of pilot.families[family]) {
      if (!(result.effectiveFamilies?.[axis] ?? []).includes(family)) {
        failures.push(`${family}: declares ${axis} and is outside the measured ${axis} denominator (unmountable or unsettled)`);
        continue;
      }
      const positives = result.cells.filter((cell) => cell.kind === 'positive' && cell.axis === axis);
      if (positives.length === 0) failures.push(`${family}: declares ${axis} and no positive cell measured it`);
      for (const cell of positives) {
        if (!cell.evidential) {
          failures.push(`${family}: the ${axis} positive in ${cell.vertical}/${cell.theme} is NON-EVIDENTIAL`);
        } else if (!cell.movedIds.includes(family)) {
          failures.push(`${family}: declares ${axis} and did not move on it in ${cell.vertical}/${cell.theme}`);
        }
      }
    }
  }
  for (const control of NEGATIVE_CONTROLS) {
    const own = result.cells.filter((cell) => cell.scenario === control);
    if (own.length === 0) failures.push(`NEGATIVE CONTROL ${control}: not run`);
    for (const cell of own.filter((entry) => !entry.evidential)) {
      failures.push(
        `NEGATIVE CONTROL ${control} ${cell.vertical}/${cell.theme} ${cell.axis}: NON-EVIDENTIAL — `
        + `${cell.nonEvidentialReason ?? 'its pair compiles to an empty delta'}`,
      );
    }
  }
  return failures;
}

/** Pilot family `moved/denominator` per positive cell with the axis's reviewed N/A beside it, labelled as the pilot's so it cannot pass for a fleet figure. */
export function pilotReadings(result, pilot) {
  return result.cells.filter((cell) => cell.kind === 'positive').map((cell) => {
    const declaring = Object.keys(pilot.families).filter((family) => pilot.families[family].includes(cell.axis));
    return {
      scope: 'pilot',
      vertical: cell.vertical,
      theme: cell.theme,
      axis: cell.axis,
      moved: declaring.filter((family) => cell.movedIds.includes(family)).length,
      denominator: declaring.length,
      notApplicable: Object.values(pilot.notApplicable ?? {}).filter((axes) => Object.hasOwn(axes, cell.axis)).length,
    };
  });
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
  // The witness READINGS, published beside the percentages they license. A run
  // that printed only the verdict would leave a reader unable to tell an
  // evidential 0 % from one nobody had checked.
  for (const control of [...new Set(result.cells
    .filter((cell) => cell.witness?.kind === 'effective-map')
    .map((cell) => cell.scenario))]) {
    const seen = new Set();
    const readings = [];
    for (const cell of result.cells.filter((entry) => entry.scenario === control && entry.witness !== null)) {
      const where = `${cell.vertical}/${cell.theme}`;
      if (seen.has(where)) continue;
      seen.add(where);
      readings.push(`${where} ${cell.witness.differing}/${cell.witness.channels}`);
    }
    console.log(`  witness ${control} (effective-map, differing/channels): ${readings.join(', ')}`);
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
    const vacuous = own.filter((cell) => !cell.evidential);
    // Cell by cell, because the standing is now per cell: a control can be
    // evidence in one (vertical, mode) and vacuous in the next, and a single
    // run-wide adjective would hide exactly that.
    console.log(
      evidential.length === 0
        ? `  NEGATIVE CONTROL ${control}: NON-EVIDENTIAL on all ${own.length} cell(s) — e.g. `
          + `${own[0].vertical}/${own[0].theme}: ${own[0].nonEvidentialReason
            ?? 'its pair compiles to an empty delta'}`
        : `  NEGATIVE CONTROL ${control}: 0 % on ${evidential.length} evidential cell(s) of ${own.length}`
          + (vacuous.length === 0
            ? ''
            : ` — NON-EVIDENTIAL on ${vacuous.length}: ${namedCells(vacuous)}`),
    );
    // The reason once per (vertical, mode), not once per axis: the six axes of
    // one cell lose their standing for the same single reason, and printing it
    // six times would read as six findings.
    for (const [where, reason] of vacuousReasonsByCell(vacuous)) {
      console.log(`    ${control} ${where}: ${reason}`);
    }
  }
  console.log(
    'axis-difference OK — every evidential negative-control cell at 0 %'
    + (thresholdArgument === undefined
      ? '; no threshold applied (the fleet bar is WO-EVI-02 acceptance, not this run)'
      : `, every axis at or above ${thresholdArgument} %`),
  );
}
