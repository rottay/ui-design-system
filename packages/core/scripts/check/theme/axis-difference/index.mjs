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
 * WHAT THE SCENE MOUNTS, because the percentage means nothing without it. Each
 * family is mounted as the most-decorated ROOT COMPOUND its Modern skin
 * requires, AND -- since the EVI-02 instrument lot -- as the descendant parts
 * that skin paints each axis on, grafted onto that same element. The probe used
 * to mount the bare element alone, so a family whose radius lives on
 * `activity-log`'s `[data-part='item-body']` and whose elevation lives on
 * `popover`'s `[data-part='surface']` read as a NON-MOVER on an axis its parts
 * genuinely resolve differently for two tenants. That was the instrument
 * failing to reach the paint, not the fleet failing to be reachable. The law
 * for what may be grafted, and every reason a selector is refused, is at
 * `familyAxisParts` below; the map is published with every run and
 * `--no-part-mounts` reproduces the older, narrower reading on the same tree.
 *
 * AND THE ROOT ITSELF WAS A FABRICATION for 113 of the 255 mounted families:
 * a descendant chain squashed onto ONE node carrying the union of its classes
 * and the LAST compound's attribute values, so `breadcrumb` -- which paints a
 * dial-fed `border-radius` on its own root -- was measured on a node called
 * `data-part="label"` that its root rule cannot match, and read as a shape
 * non-mover. The root is now the chain's HEAD, the tail is grafted as the parts
 * it always was, and `--collapsed-roots` reproduces the merge on the same tree.
 * The candidate set, the mountable set, the pins and every denominator are
 * unchanged by that repair: only the node a candidate becomes changed.
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
 *   node scripts/check/theme/axis-difference/index.mjs --no-part-mounts   the pre-lot reading
 *   node scripts/check/theme/axis-difference/index.mjs --collapsed-roots  the pre-repair root
 *   node scripts/check/theme/axis-difference/index.mjs --no-write         no run may publish the pilot record
 *   AXIS_DIFFERENCE_NO_WRITE=1 vitest ...axis-difference-pilot              the same, from a vitest
 *   node scripts/check/theme/axis-difference/index.mjs --no-states-disabled  the pre-lot state set
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
  axisNotApplicable,
  axisPopulations,
  catalogRevision,
  cssRules,
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
 * One selector cut into the compounds a combinator separates, with brackets,
 * parentheses and quotes respected.
 *
 * `split(/\s*>\s*|\s+/u)` is the reading this replaces, and it cuts INSIDE an
 * attribute value: `[data-state~='is open']` becomes two pieces and the chain
 * after it is projected against a compound that does not exist. No Modern skin
 * writes a spaced attribute value today (measured over the corpus, 0
 * selectors), so this changes no number on this tree — it is the reason the
 * reading cannot start lying the day a skin writes one.
 */
export function compoundPieces(selector) {
  const pieces = [];
  let current = '';
  let brackets = 0;
  let parens = 0;
  let quote = null;
  for (const character of selector) {
    if (quote !== null) {
      current += character;
      if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      current += character;
      continue;
    }
    if (character === '[') brackets += 1;
    else if (character === ']') brackets -= 1;
    else if (character === '(') parens += 1;
    else if (character === ')') parens -= 1;
    if (brackets === 0 && parens === 0 && (/\s/u.test(character) || character === '>')) {
      if (current.trim().length > 0) pieces.push(current.trim());
      current = '';
      continue;
    }
    current += character;
  }
  if (current.trim().length > 0) pieces.push(current.trim());
  return pieces;
}

/**
 * THE ROOT IS THE SELECTOR'S HEAD, never the chain merged into one node.
 *
 * WHAT WAS BROKEN, measured rather than asserted. `isSingleElement` strips
 * every `[...]` BEFORE it looks for whitespace, so a descendant chain whose
 * compounds after the head are attribute-only survives
 * as "single" and the reader below used to build ONE node carrying the union of
 * the chain's classes and the LAST compound's attribute values. Measured on
 * this tree: 113 of the 255 mounted roots were such a merge.
 *
 * That node is a fabrication, and `breadcrumb` is the clean case. Its skin
 * paints `border-radius: var(--ds-breadcrumb-radius, var(--ds-radius-lg))` at
 * ROOT level, on `.ds-breadcrumb.ds-breadcrumb--modern[data-part='root']` — a
 * dial-fed declaration on the family's own root — and the family still measured
 * as a shape NON-MOVER. The merged node was
 * `class="ds-breadcrumb--modern" data-part="label" data-clickable="true"`: it
 * carries the LAST compound's `data-part`, so the root rule does not match it,
 * the `.ds-breadcrumb` class is not on it either, and all 59 of the family's
 * part chains were refused as `head-variant-gated` against attributes its real
 * root never carried. The family was mounted as a node its own skin paints
 * nothing on.
 *
 * So a candidate is read as the compound a selector requires of the family's
 * OWN root node — its head — and the tail is left to `familyAxisParts`, which
 * grafts it as the descendant parts it always was. The CANDIDATE SET does not
 * change: the same selectors `isSingleElement` admits are the same selectors
 * scored here, so a family that mounted still mounts, a family that did not
 * still does not, `UNMOUNTABLE_FAMILIES` is the same pin and every denominator
 * is the one the pre-lot run published. What changes is the NODE a candidate
 * becomes.
 *
 * `collapsedRoots` reproduces the merge, so the before/after of this repair is
 * read on ONE tree at one catalog revision with one browser.
 */
export const rootCompound = (selector) => compoundPieces(selector)[0] ?? selector.trim();

/**
 * THE ROOT IS AN IDENTITY, NOT A CONFIGURATION — the same law law 1 applies to
 * a part, applied to the node those parts hang off.
 *
 * A root compound may gate on a prop the family only SOMETIMES carries, and
 * the most-decorated candidate is then a configuration the default render does
 * not produce. `checkbox` is the measured case and it is not conservative in
 * either direction: mounted as
 * `.ds-checkbox.ds-checkbox--modern[data-part='root'][data-standalone='true']`
 * its box is painted by the standalone rule, `border-radius:
 * var(--ds-radius-full)` — a deliberate non-dial rung — so the family reads as
 * a shape NON-MOVER while the checkbox a tenant actually renders reads
 * `var(--ds-checkbox-radius-sm, var(--ds-radius-sm))` and moves. A fabricated
 * prop can suppress paint as easily as it can invent it.
 *
 * So a root attribute is admitted only when it is STRUCTURAL: `data-part`,
 * which names the anatomy rather than a configuration, plus every attribute
 * name the family's own skin declares on EVERY one of its root compounds — a
 * skin that never writes a rule for this family without `[data-component]` or
 * `[role]` is a skin whose root always carries it. `flex`'s
 * `[data-component='flex']` and `segmented`'s `[role='radiogroup']` survive
 * that reading; `[data-standalone='true']`, `[data-loading='true']`,
 * `[data-variant]` and 127 other per-family gates do not, and the rules behind
 * them stay unseen exactly as a prop-gated part does.
 *
 * `data-state` is stripped here for the reason `partCompound` strips it: the
 * SCENE stamps the state, and a root that baked one in would be measured in a
 * state the probe never asked for.
 *
 * A candidate whose selector IS that compound wins a tie against one that only
 * heads a chain: a rule whose whole selector is the compound paints the root
 * directly, and an inferred head is the weaker claim.
 *
 * WHAT THIS UNDER-COUNTS, named rather than left in the percentage. A family
 * whose real root always carries SOME value of a prop -- `[data-size]`,
 * `[data-layout]`, `[data-animation]` -- is mounted here without it, so paint
 * that lives only behind that gate is unseen: measured on this tree, 18
 * (family, axis) readings that the fabricated root happened to reach stop being
 * reached, among them `textarea`/rhythm behind `[data-size='sm']` and
 * `skeleton`/motion behind `[data-animation='pulse']`. Under-counting is the
 * fail-closed direction and mounting one arbitrary value is not conservative in
 * either direction, so the reading stops here. Reaching that paint honestly
 * needs the DEFAULT the component renders, which is in the TSX and not in the
 * skin; it is a mount source this probe does not have.
 */
export function familyElement(css, { collapsedRoots = false } = {}) {
  const heads = selectorParts(css)
    .map((selector) =>
      selector
        .replace(/:where\(([^()]*)\)/gu, '$1')
        .replace(/:is\(([^()]*)\)/gu, '$1')
        .trim())
    .filter((selector) => isSingleElement(selector))
    .map((selector) => ({
      text: collapsedRoots ? selector : rootCompound(selector),
      whole: compoundPieces(selector).length === 1,
    }));
  if (heads.length === 0) return null;
  const names = (text) => [...text.matchAll(ATTRIBUTE_TOKEN)]
    .map((match) => match[1])
    .filter((name) => !STATE_ATTRIBUTE.test(name));
  const structural = new Set(
    names(heads[0].text).filter((name) => heads.every((head) => names(head.text).includes(name))),
  );
  const read = (text) => {
    const attributes = {};
    for (const match of text.matchAll(ATTRIBUTE_TOKEN)) {
      if (!collapsedRoots && match[1] !== 'data-part' && !structural.has(match[1])) continue;
      if (!collapsedRoots && STATE_ATTRIBUTE.test(match[1])) continue;
      attributes[match[1]] = match[2] ?? '';
    }
    return { classes: [...text.matchAll(CLASS_TOKEN)].map((match) => match[1]), attributes };
  };
  // Scored on the compound as ADMITTED, so a gate that will be dropped cannot
  // win the mount for a variant and then vanish from the node. The merged
  // reading keeps the pre-repair scoring to the letter -- it exists to
  // reproduce that run, not to improve on it.
  const score = (candidate) => (collapsedRoots
    ? [...candidate.text.matchAll(CLASS_TOKEN)].length
      + [...candidate.text.matchAll(ATTRIBUTE_TOKEN)].length * 2
      + (/data-part\s*=\s*['"]?root/u.test(candidate.text) ? 10 : 0)
    : candidate.element.classes.length
      + Object.keys(candidate.element.attributes).length * 2
      + (candidate.element.attributes['data-part'] === 'root' ? 10 : 0));
  const candidates = heads.map((head) => ({ ...head, element: read(head.text) }));
  const best = [...candidates].sort((a, b) =>
    score(b) - score(a)
    || (collapsedRoots ? 0 : Number(b.whole) - Number(a.whole)))[0];
  const selector = best.element.classes.map((name) => `.${name}`).join('')
    + Object.entries(best.element.attributes).map(([name, value]) => `[${name}='${value}']`).join('');
  return { selector: collapsedRoots ? best.text : selector, ...best.element };
}

/** family -> its element, or null when the skin publishes no mountable selector. */
export function familyElements(root = CORE_ROOT, only = null, { collapsedRoots = false } = {}) {
  const elements = new Map();
  for (const [family, files] of skinFamilies(root)) {
    if (only && !only.includes(family)) continue;
    const css = files.map((file) => readFileSync(file, 'utf8')).join('\n');
    elements.set(family, familyElement(css, { collapsedRoots }));
  }
  return elements;
}

/**
 * THE PART MOUNTS: the element a family actually PAINTS the axis on.
 *
 * WHAT WAS BROKEN, measured rather than asserted. `familyElement` above mounts
 * exactly ONE node per family -- the most-decorated selector `isSingleElement`
 * admits -- so every OTHER rule that skin writes paints on a node the scene
 * never built, whatever the shape of that rule's selector.
 *
 * And `isSingleElement` admits more than its name reads. It STRIPS every
 * `[...]` from the selector FIRST, then refuses `>`, `~`, `+`, whitespace that
 * SURVIVED the strip, `:` and `*`. A descendant chain whose compounds after the
 * head are attribute-only is therefore erased down to its head and passes as
 * "single"; `familyElement` USED TO collapse the whole chain onto one node
 * carrying the union of its classes and the LAST compound's attribute values --
 * 113 of the 255 mounted roots were such a merge -- and now reads the chain's
 * HEAD instead, leaving the tail to the parts below. Only a chain that keeps a
 * class or a tag after its head is actually refused as a candidate.
 *
 * Either way the paint is unreached: a skin that paints its radius on
 * `activity-log`'s `[data-part='item-body']`, its elevation on `popover`'s
 * `[data-part='surface']` or its transition on `checkbox`'s `[data-part='box']`
 * declared that paint in a rule the scene never mounted, and the family read as
 * a NON-MOVER on an axis whose channels its parts genuinely resolve differently
 * for two tenants. That is the instrument failing to reach the paint, not the
 * fleet failing to be reachable, and the two are indistinguishable in the
 * published percentage until the mount is repaired. The fleet-axis analysis of
 * 2026-09-17 counted 73 unique families in that condition across four axes
 * (shape, rhythm, depth, motion).
 *
 * WHAT A PART MOUNT IS, and the law is deliberately narrow:
 *
 *  1. The chain's HEAD must be the family's OWN root element -- the node the
 *     scene already mounts. Its classes must be a subset of the root's and
 *     every attribute it names must be one the root already carries. A head
 *     that adds `[data-variant='outlined']` is a PROP gate, not a part gate:
 *     mounting it would measure a configuration the default render does not
 *     produce, which is making a number move rather than measuring what the
 *     family paints. Those are counted, named and left to the wiring lots.
 *  2. Every following compound is a DESCENDANT PART: classes, an optional tag
 *     and `data-part` only. Another attribute on a part is again a variant gate
 *     and is refused for the same reason.
 *  3. `data-state` (and any `*-state`) is STRIPPED rather than baked in, so a
 *     state-gated part is mounted at REST and reached by the same
 *     `[data-state]` stamp every other node of the scene is reached by. A
 *     fabricated resting state would measure the fabrication.
 *  4. Pseudo-classes, pseudo-elements, sibling combinators and `*` are refused
 *     outright -- exactly as `isSingleElement` refuses them for the root. This
 *     probe does not simulate `:hover`, and a mount that dropped `:hover` from
 *     a selector would read a hover rule as resting paint.
 *
 * THE FIRST OF THE TWO LIMITS THAT LOT NAMED IS LIFTED at `rootCompound`
 * above: a merged root carried its LAST compound's attribute values, so a
 * genuinely root-headed part rule was refused by law 1 as `head-variant-gated`
 * against attributes the family's real root never carried, and the published
 * count overstated the prop-gated cluster the wiring lots own. The root is now
 * the head compound, and those chains pass law 1 because the head IS the
 * mounted node.
 *
 * THE SECOND LIMIT STANDS, and it stands on the law rather than on effort: a
 * family whose part rules are headed by a root class of their OWN is out of
 * reach of law 1. `tooltip`'s bubble is headed by `.ds-tooltip-bubble`, not by
 * a compound under the mounted
 * `.ds-tooltip.ds-tooltip--modern[data-part='root']`, so its part rules are
 * refused as `head-not-the-family-root` and tooltip gains no parts. That bubble
 * is a portal the default render does not mount until the tooltip opens;
 * building a second root for it would measure an interaction state this probe
 * does not enter, which is the same refusal law 1 applies to a prop gate.
 *
 * The chain is then GRAFTED onto the family's existing root node, one nested
 * element per compound, so the scene holds the anatomy the skin describes
 * instead of a merged single node. Merging the chain onto one element -- the
 * cheaper move -- does not work and is not a detail: a descendant combinator
 * needs an ANCESTOR, and `.ds-tabs [data-part='tab-button']` does not match a
 * node carrying both tokens.
 *
 * THE READING IS PER AXIS, which is what keeps this a repair and not a
 * widening. A mounted part is stamped with the axes whose OWN authored
 * vocabulary its declaring rule wrote, and each property is read over the root
 * plus the parts of that property's axis alone. So a part that declares only
 * `gap` cannot lend the shape axis a node it never asked for. The root element
 * is in every axis's target set, so the reading is a strict SUPERSET of the
 * pre-lot one: nothing that moved before can stop moving, and the two runs are
 * comparable family by family.
 *
 * THE PINS ARE UNTOUCHED. A family with no mountable root gains no parts and
 * stays in `UNMOUNTABLE_FAMILIES`; a reviewed N/A stays withdrawn from its
 * axis. Every denominator this run publishes is the denominator the pre-lot
 * run published, so the before/after is a change in the NUMERATOR only.
 */

/** The states axis's part vocabulary: it declares no authored list, so its own computed longhands are it, plus the shorthand a skin writes them with. */
export const PART_STATE_AUTHORED = Object.freeze([
  'transform', 'opacity', 'outline', 'outline-width', 'outline-offset', 'outline-style',
]);

/** The authored properties whose declaration makes a rule a part source for `axis`. */
const partAuthored = (axis) => (AXES[axis].authored.length > 0 ? AXES[axis].authored : PART_STATE_AUTHORED);

/** property -> the axis that owns it. The six vocabularies are disjoint, so one owner each. */
export function axisByProperty() {
  const owner = {};
  for (const axis of AXIS_IDS) {
    for (const property of AXES[axis].computed) owner[property] ??= axis;
  }
  return owner;
}

/** A selector list split on its TOP-LEVEL commas, so `:is(a, b)` survives as one selector. */
export function selectorList(selector) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const character of selector) {
    if (character === '(') depth += 1;
    else if (character === ')') depth -= 1;
    if (character === ',' && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += character;
  }
  parts.push(current);
  return parts.map((part) => part.trim()).filter((part) => part.length > 0);
}

/** How many alternatives one `:is()`/`:where()` selector may expand to before the rest are dropped. */
export const ALTERNATIVE_LIMIT = 12;

/**
 * `:is(a, b) c` read as the selectors it stands for.
 *
 * Unwrapping it to `a, b c` -- the naive replace -- is not the same selector
 * and produced fragments like `:focus-visible)` when the list was split on
 * every comma. Expanding is the reading that stays true to the rule, and it is
 * bounded because a nested list multiplies.
 */
export function expandAlternatives(selector, limit = ALTERNATIVE_LIMIT) {
  let list = [selector.trim()];
  for (let round = 0; round < 3; round += 1) {
    const next = [];
    let changed = false;
    for (const entry of list) {
      const match = /:(?:is|where)\(([^()]*)\)/u.exec(entry);
      if (match === null) {
        next.push(entry);
        continue;
      }
      changed = true;
      for (const alternative of selectorList(match[1])) {
        next.push(`${entry.slice(0, match.index)}${alternative}${entry.slice(match.index + match[0].length)}`);
      }
    }
    list = next.slice(0, limit);
    if (!changed) break;
  }
  return list.map((entry) => entry.replace(/\s+/gu, ' ').trim());
}

const PART_CLASS_TOKEN = /\.([A-Za-z][\w-]*)/gu;
const PART_ATTRIBUTE_TOKEN = /\[([\w-]+)(?:\s*([~^|$*]?=)\s*['"]?([^\]'"]*)['"]?)?\]/gu;
const PART_TAG = /^([a-z][a-z0-9]*)/u;
/** The kernel's state stamp, which the scene supplies rather than the selector. */
const STATE_ATTRIBUTE = /(^|-)state$/u;
/** Elements with no content model: mounted as leaves, never as scaffolding. */
const VOID_TAGS = Object.freeze(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

/**
 * One compound selector as a node this scene can build, or the reason it is not
 * one. The reason is returned rather than `null` so a run can publish WHY a
 * part was refused instead of a reader having to guess.
 */
export function partCompound(text) {
  const withoutAttributes = text.replace(/\[[^\]]*\]/gu, '');
  if (/:/u.test(withoutAttributes)) return { rejected: 'pseudo' };
  if (withoutAttributes.includes('*')) return { rejected: 'universal' };
  const classes = [...text.matchAll(PART_CLASS_TOKEN)].map((match) => match[1]);
  const attributes = {};
  for (const match of text.matchAll(PART_ATTRIBUTE_TOKEN)) {
    if (STATE_ATTRIBUTE.test(match[1])) continue;
    // `^=`, `*=` and friends match a set of values; a node built from one of
    // them would be a guess at which member the component stamps.
    if (match[2] !== undefined && match[2] !== '=' && match[2] !== '~=') return { rejected: 'substring-operator' };
    attributes[match[1]] = match[3] ?? '';
  }
  const tag = PART_TAG.exec(text.trim());
  return { tag: tag === null ? null : tag[1], classes, attributes };
}

/** The key two compounds share exactly when they build the same node. */
export const compoundKey = (compound) =>
  `${compound.tag ?? 'div'}|${[...compound.classes].sort().join('.')}`
  + `|${Object.entries(compound.attributes).sort().map(([name, value]) => `${name}=${value}`).join(';')}`;

/**
 * A skin selector read as a chain of parts hanging off the family's own root,
 * or the reason it is not one.
 */
export function projectPartChain(selector, rootElement) {
  if (/[~+]/u.test(selector.replace(/\[[^\]]*\]/gu, ''))) return { rejected: 'sibling-combinator' };
  if (selector.includes('::')) return { rejected: 'pseudo-element' };
  const pieces = compoundPieces(selector);
  if (pieces.length < 2) return { rejected: 'root-level' };
  const head = partCompound(pieces[0]);
  if (head.rejected !== undefined) return { rejected: `head-${head.rejected}` };
  if (!head.classes.every((name) => rootElement.classes.includes(name))) return { rejected: 'head-not-the-family-root' };
  if (!Object.entries(head.attributes).every(([name, value]) => rootElement.attributes[name] === value)) {
    return { rejected: 'head-variant-gated' };
  }
  const chain = [];
  for (const piece of pieces.slice(1)) {
    const compound = partCompound(piece);
    if (compound.rejected !== undefined) return { rejected: `part-${compound.rejected}` };
    if (Object.keys(compound.attributes).some((name) => name !== 'data-part')) return { rejected: 'part-variant-gated' };
    if (compound.tag === null && compound.classes.length === 0 && Object.keys(compound.attributes).length === 0) {
      return { rejected: 'part-empty' };
    }
    if (chain.some((entry) => VOID_TAGS.includes(entry.tag))) return { rejected: 'part-under-void-element' };
    chain.push(compound);
  }
  return { chain, selector };
}

/**
 * One family's parts, read off the rules of ONE stylesheet.
 *
 * `axes` is the set the family is in the population of: a part may only be
 * mounted for an axis the family already DECLARES, so a reviewed N/A exclusion
 * cannot be re-entered through the scene. `rejected` counts (axis, selector)
 * refusals, so a selector refused for four axes is counted four times -- the
 * unit is the reading that was refused, not the string.
 */
export function familyParts(css, rootElement, axes) {
  const rules = cssRules(css);
  const parts = new Map();
  const rejected = {};
  for (const axis of axes) {
    const authored = new Set(partAuthored(axis));
    for (const rule of rules) {
      if (!rule.declarations.some((declaration) => authored.has(declaration.property))) continue;
      for (const listed of selectorList(rule.selector)) {
        for (const selector of expandAlternatives(listed)) {
          const projection = projectPartChain(selector, rootElement);
          if (projection.rejected !== undefined) {
            if (projection.rejected !== 'root-level') {
              rejected[projection.rejected] = (rejected[projection.rejected] ?? 0) + 1;
            }
            continue;
          }
          const id = projection.chain.map(compoundKey).join(' > ');
          if (!parts.has(id)) parts.set(id, { id, selector, chain: projection.chain, axes: new Set() });
          parts.get(id).axes.add(axis);
        }
      }
    }
  }
  return {
    parts: [...parts.values()].map((part) => ({ ...part, axes: [...part.axes].sort() })),
    rejected,
  };
}

/**
 * family -> the parts its own Modern skin paints each axis on, plus the
 * selectors refused and why.
 *
 * Read from the SAME source and the SAME authored vocabulary
 * `check/theme/population` reads the denominator from, so the family that is
 * in shape's population because a rule writes `border-radius` is measured on
 * the element THAT rule paints. One vocabulary, one source, both halves.
 *
 * A family whose skin publishes no mountable root element gets NO parts: the
 * graft has nothing to hang on, and inventing a root for it would move a
 * denominator this lot is not entitled to move.
 */
export function familyAxisParts(root = CORE_ROOT, only = null, elements = null) {
  const resolved = elements ?? familyElements(root, only);
  const populations = axisPopulations(root);
  const byFamily = new Map();
  for (const [family, files] of skinFamilies(root)) {
    if (only && !only.includes(family)) continue;
    const rootElement = resolved.get(family);
    if (!rootElement) continue;
    const declared = AXIS_IDS.filter((axis) => populations.get(axis).includes(family));
    const css = files.map((file) => readFileSync(file, 'utf8')).join('\n');
    const record = familyParts(css, rootElement, declared);
    if (record.parts.length === 0 && Object.keys(record.rejected).length === 0) continue;
    byFamily.set(family, record);
  }
  return byFamily;
}

/**
 * The mount map as a run publishes it: per axis, how many families gained a
 * part and how many parts in total; per family, the parts and the axes each
 * one is read for; and the selectors this law refused, by reason.
 *
 * The refusals are published because they are the BOUNDARY of this lot, not
 * noise. `head-variant-gated` and `part-variant-gated` are the prop-gated
 * cluster the wiring lots own -- mounting them here would measure a
 * configuration the default render does not produce -- and `part-pseudo` is the
 * `:hover` half of the states rule this probe already names as unmeasured.
 */
export function partMountReport(byFamily, { applied = true, unmountableCandidates = [] } = {}) {
  const perAxis = Object.fromEntries(AXIS_IDS.map((axis) => [axis, { families: 0, parts: 0 }]));
  const refused = {};
  const map = {};
  let nodes = 0;
  for (const [family, record] of byFamily) {
    for (const [reason, count] of Object.entries(record.rejected)) {
      refused[reason] = (refused[reason] ?? 0) + count;
    }
    if (record.parts.length === 0) continue;
    const byAxis = {};
    for (const part of record.parts) {
      for (const axis of part.axes) (byAxis[axis] ??= []).push(part.selector);
    }
    for (const [axis, selectors] of Object.entries(byAxis)) {
      perAxis[axis].families += 1;
      perAxis[axis].parts += selectors.length;
    }
    nodes += record.parts.reduce((total, part) => total + part.chain.length, 0);
    map[family] = byAxis;
  }
  return {
    applied,
    families: Object.keys(map).length,
    parts: [...byFamily.values()].reduce((total, record) => total + record.parts.length, 0),
    maxChainNodes: nodes,
    perAxis,
    refused,
    // What the unmountable pin costs, now that parts are mounted: these
    // families paint an axis on a descendant ONLY, and stay out of every
    // denominator because they publish no root to graft it onto.
    pinnedUnmountableWithPartPaint: unmountableCandidates,
    map,
  };
}

/**
 * The root each family was measured on, and how many of them the merge used to
 * fabricate.
 *
 * `merged` is the count a reader needs to tell the two readings apart: under
 * `collapsedRoots` it is the number of roots that are a whole chain squashed
 * onto one node, and under the repaired law it is 0 by construction because a
 * root IS a single compound. Publishing it makes the A/B legible from the
 * artifact alone.
 */
export function rootReport(elements, { collapsedRoots = false } = {}) {
  const map = {};
  let merged = 0;
  for (const [family, element] of elements) {
    if (element === null) continue;
    map[family] = element.selector;
    if (compoundPieces(element.selector).length > 1) merged += 1;
  }
  return { collapsedRoots, families: Object.keys(map).length, merged, map };
}

/**
 * The families a pin now costs something, named rather than left implicit.
 *
 * A family with no mountable root gains no parts, by law -- the graft has
 * nothing to hang on. These are the ones that WOULD have gained one: their
 * skin paints an axis on a descendant and nothing else. They stay out of every
 * denominator, exactly as `UNMOUNTABLE_FAMILIES` pins them, and this count is
 * what a later lot would be buying by giving them a root.
 */
export function unmountablePartCandidates(root = CORE_ROOT, unmountable = UNMOUNTABLE_FAMILIES) {
  const populations = axisPopulations(root);
  const candidates = [];
  for (const [family, files] of skinFamilies(root)) {
    if (!unmountable.includes(family)) continue;
    const declared = AXIS_IDS.filter((axis) => populations.get(axis).includes(family));
    if (declared.length === 0) continue;
    const rules = cssRules(files.map((file) => readFileSync(file, 'utf8')).join('\n'));
    const paints = rules.some((rule) => {
      if (!declared.some((axis) => {
        const authored = new Set(partAuthored(axis));
        return rule.declarations.some((declaration) => authored.has(declaration.property));
      })) return false;
      return selectorList(rule.selector).some((selector) => compoundPieces(selector).length > 1);
    });
    if (paints) candidates.push(family);
  }
  return candidates.sort();
}

const escapeAttribute = (value) => String(value).replace(/&/gu, '&amp;').replace(/"/gu, '&quot;').replace(/</gu, '&lt;');

/**
 * The parts of one family as nested markup, sharing every ancestor they share.
 *
 * Only the node a rule actually TARGETS carries `data-axis-part`; the
 * compounds above it are scaffolding the selector requires and are not read.
 */
export function partTreeHtml(parts) {
  const root = { children: new Map() };
  for (const part of parts) {
    let node = root;
    part.chain.forEach((compound, index) => {
      const key = compoundKey(compound);
      if (!node.children.has(key)) node.children.set(key, { compound, children: new Map(), axes: new Set() });
      node = node.children.get(key);
      if (index === part.chain.length - 1) for (const axis of part.axes) node.axes.add(axis);
    });
  }
  const render = (node) => [...node.children.values()].map((child) => {
    const tag = child.compound.tag ?? 'div';
    const classes = child.compound.classes.length > 0 ? ` class="${escapeAttribute(child.compound.classes.join(' '))}"` : '';
    const attributes = Object.entries(child.compound.attributes)
      .map(([name, value]) => ` ${name}="${escapeAttribute(value)}"`)
      .join('');
    const axes = child.axes.size > 0 ? ` data-axis-part="${[...child.axes].sort().join(' ')}"` : '';
    const open = `<${tag}${classes}${attributes}${axes}>`;
    return VOID_TAGS.includes(tag) ? open : `${open}${render(child)}</${tag}>`;
  }).join('');
  return render(root);
}

/**
 * Pairs whose two arms reach the page as the SAME PAINT in the CELL being
 * measured: every channel either arm compiles resolves -- against the
 * vertical's own baseline, for a name the arm does not carry -- to the value
 * the other arm resolves to.
 *
 * AN EMPTY ARM IS NOT THAT, and the emptiness test this replaces read one for
 * the other. `applyVariables` clears every inline `--ds-*` before it sets an
 * arm, so an arm that compiles nothing is not "nothing applied": it is the
 * vertical bundle's own baseline, which is precisely the paint a tenant who
 * re-states the vertical's own value receives. Measured 2026-09-19 on bithire
 * (`evidence/bithire-inert-pairs/`): its preset states `density.mode: compact`,
 * `spacing.rhythm: tight` and `states.emphasis: strong`, the artifact is by
 * definition the delta against that preset's compile, and so the arm that
 * authors those values compiles 0 channels while painting `0.85 / 0.85` and
 * the six strong state values. The same run measured the rhythm cell at
 * 45/209 = 21.5 %, byte-identical to rottay's and evnto's, while calling the
 * pair inert. Recording those cells here would have pinned a false statement:
 * the entry asserts the decision moves no channel, and the run measures 45
 * families moving.
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
 *  - a pair whose two arms resolve to ONE paint is a PRODUCT fact and fails
 *    this gate unless the owner records it here WITH the measurement, so the
 *    first one is a finding and the next cannot hide behind it;
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
 *
 * A family with PART MOUNTS keeps that single element and gains, nested inside
 * it, the descendant parts its own skin paints the axes on -- so the same node
 * the pre-lot run read is still read, and the parts are read BESIDE it.
 */
export function sceneHtml({ css, vertical, theme, elements, mounts = null, partMounts = null }) {
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
      const parts = partMounts?.get?.(family)?.parts ?? partMounts?.[family]?.parts ?? [];
      return `<div data-axis-family="${family}" class="${classAttribute}"${extra}>${partTreeHtml(parts)}</div>`;
    })
    .join('\n');
  return `<!doctype html><html ${attributes}><head><style>${css}</style></head>`
    + `<body><div id="axis-scene">${nodes}</div></body></html>`;
}

/**
 * States are measured under the attributes a component stamps, per the rule.
 *
 * `:hover` is deliberately not simulated by writing a class, because a
 * fabricated hover measures the fabrication. Playwright's real hover moves one
 * element at a time, which would turn one whole-page read into several hundred;
 * `[data-state]` is stamped by the anatomy kernel on every family and read by
 * the same skin rules, so it is the half of the rule a whole-page read can
 * answer honestly. The `:hover` half is NAMED in the artifact as unmeasured
 * rather than implied.
 *
 * `disabled` is the fifth and the odd one: the other four are acquired by
 * being touched, and this one arrives as a PROP. `STATE_STAMP_ATTRIBUTES`
 * below is what a component that received it writes, and why the stamp is two
 * attributes rather than one.
 */
export const STATE_VARIANTS = Object.freeze(['hovered', 'pressed', 'selected', 'focus-visible', 'disabled']);

/**
 * THE DOM CONTRACT OF A STAMPED STATE, which for `disabled` is wider than one
 * attribute — and that is why `disabled` was unmeasurable rather than inert.
 *
 * `disabled` joined the list above in the EVI-02 instrument lot. Until then the
 * probe stamped four states and never stamped this one, so every declaration
 * the fleet gates on being disabled — the press-scale pair, the disabled
 * opacity, the disabled shadow — was outside the instrument BY CONSTRUCTION.
 * A zero on those channels was not a fleet reading; nothing had asked.
 *
 * WHY IT NEEDS A SECOND ATTRIBUTE, measured rather than assumed. The other
 * four states exist only at runtime, so the only thing a component can say
 * about them is the kernel's `data-state` token list
 * (`foundation/behavior/kernel/anatomy`, `serializeState`). `disabled` is a
 * PROP, and a component that receives it stamps BOTH: `partAttributes(part,
 * interaction)` writes `data-state~='disabled'`, and the component's own root
 * props write `data-disabled='true'` beside it. The modern Button is the
 * reference — `useInteractionState({ disabled })` feeds the first and
 * `'data-disabled': disabled ? 'true' : undefined` writes the second on the
 * same node — and the skins consume both vocabularies. Measured over the
 * Modern + agnostic skin corpus on 2026-09-20 and republished by
 * `disabledVocabularyCensus` on every run, so this comment cannot go stale
 * silently.
 *
 * Stamping only the kernel token would therefore have reached under half the
 * corpus and reported the rest as a fleet non-mover, which is the exact
 * confusion between "the decision moves nothing" and "the instrument cannot
 * see what it moved" this file exists to keep apart. Both attributes are the
 * state; neither is a fabricated configuration, because a disabled component
 * carries both and carries them together.
 *
 * WHAT IS STILL NOT REACHED, named rather than implied: `:disabled` (the
 * native pseudo-class — the synthesized scene builds `div`s, which no
 * `disabled` content attribute can make match) and `[aria-disabled]`. They are
 * counted by the census and published with the run exactly as the `:hover`
 * half of this axis is.
 */
export const STATE_STAMP_ATTRIBUTES = Object.freeze({
  disabled: Object.freeze({ 'data-disabled': 'true' }),
});

/** Every attribute name any stamped state writes beside `data-state`. */
export const STATE_STAMP_ATTRIBUTE_NAMES = Object.freeze([
  ...new Set(Object.values(STATE_STAMP_ATTRIBUTES).flatMap((attributes) => Object.keys(attributes))),
]);

/** The four vocabularies a Modern skin gates disabled paint on, as selector probes. */
const DISABLED_VOCABULARIES = Object.freeze({
  dataState: /\[data-state\s*[~*^$|]?=\s*['"]?[^\]'"]*\bdisabled\b/u,
  dataDisabled: /\[data-disabled(?:\s*[~*^$|]?=\s*['"]?true['"]?)?\]/u,
  nativePseudo: /:disabled\b/u,
  ariaDisabled: /\[aria-disabled/u,
});

/**
 * The selector with every `:not(...)` removed, because the census counts rules
 * that paint WHEN disabled and `:not([data-disabled='true'])` paints when NOT.
 *
 * Not a nicety: the Modern corpus writes 123 of those exclusions -- a hover
 * rule that declines to fire on a dead control -- and counting them would have
 * credited the stamp with reaching families whose only mention of the word is a
 * refusal. Applied repeatedly so a nested `:not(:is(...))` is removed whole.
 */
const withoutNegations = (selector) => {
  let text = selector;
  for (let pass = 0; pass < 4; pass += 1) {
    const next = text.replace(/:not\([^()]*\)/gu, '');
    if (next === text) return text;
    text = next;
  }
  return text;
};

/**
 * How much of the disabled corpus this scene's stamp can reach, read out of the
 * same skins the denominator is read from.
 *
 * Counted per FAMILY and per DECLARING RULE, because the two answer different
 * questions: how many families would notice the stamp at all, and how much of
 * what they wrote it enters. `reached` is the union of the two vocabularies the
 * stamp writes; `unreached` is the set of families that gate disabled paint
 * ONLY through a pseudo-class or `aria-disabled`, which no attribute stamp can
 * produce.
 */
export function disabledVocabularyCensus(root = CORE_ROOT, only = null) {
  const families = { dataState: [], dataDisabled: [], nativePseudo: [], ariaDisabled: [] };
  const rules = { dataState: 0, dataDisabled: 0, nativePseudo: 0, ariaDisabled: 0 };
  const reached = new Set();
  const gated = new Set();
  for (const [family, files] of skinFamilies(root)) {
    if (only && !only.includes(family)) continue;
    const css = files.map((file) => readFileSync(file, 'utf8')).join('\n');
    const seen = new Set();
    for (const rule of cssRules(css)) {
      const selector = withoutNegations(rule.selector);
      for (const [vocabulary, pattern] of Object.entries(DISABLED_VOCABULARIES)) {
        if (!pattern.test(selector)) continue;
        rules[vocabulary] += 1;
        seen.add(vocabulary);
        gated.add(family);
        if (vocabulary === 'dataState' || vocabulary === 'dataDisabled') reached.add(family);
      }
    }
    for (const vocabulary of seen) families[vocabulary].push(family);
  }
  const unreached = [...gated].filter((family) => !reached.has(family)).sort();
  return {
    families: Object.fromEntries(Object.entries(families).map(([key, list]) => [key, list.length])),
    rules,
    gatedFamilies: gated.size,
    reachedFamilies: reached.size,
    unreachedFamilies: unreached,
  };
}

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
    'disabled is stamped as the two attributes a disabled component writes; a family that gates its disabled '
    + 'paint on :disabled or [aria-disabled] alone is still outside the scene (counted per run at limits.disabled)',
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

const readComputed = ({ properties, axisOf }) => {
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
  const styles = new Map();
  const styleOf = (element) => {
    let style = styles.get(element);
    if (style === undefined) {
      style = getComputedStyle(element);
      styles.set(element, style);
    }
    return style;
  };
  for (const node of document.querySelectorAll('[data-axis-family]')) {
    const family = node.getAttribute('data-axis-family');
    // A mounted family reads every element of its anatomy, in document order,
    // so a move on any part is a move of the family.
    const mounted = node.hasAttribute('data-axis-mount');
    const anatomy = mounted ? [...node.querySelectorAll('*')] : null;
    // A PART is read for the axes whose own authored vocabulary its declaring
    // rule wrote, and for no others: a part that declares only `gap` must not
    // lend the shape axis a node that axis never asked for. The family's root
    // element is in every axis's set, so this reading contains the one taken
    // before the parts existed.
    const parts = mounted ? [] : [...node.querySelectorAll('[data-axis-part]')];
    const values = {};
    for (const property of properties) {
      const axis = axisOf[property];
      const targets = mounted
        ? anatomy
        : [node, ...parts.filter((part) => part.getAttribute('data-axis-part').split(' ').includes(axis))];
      values[property] = targets.map((target) => styleOf(target).getPropertyValue(property)).join(' | ');
    }
    out[family] = values;
  }
  return out;
};

/**
 * The computed values of named parts inside mounted families, read under
 * whatever arm is applied. A part is a selector below the family mount, so a
 * reviewed exclusion can be held to the geometry it was reviewed with.
 */
const readParts = (parts) => {
  void document.documentElement.offsetHeight;
  const out = {};
  for (const probe of parts) {
    const node = document.querySelector(`[data-axis-family="${probe.family}"]`);
    const targets = node ? [...node.querySelectorAll(probe.selector)] : [];
    out[probe.family] = out[probe.family] ?? {};
    out[probe.family][probe.part] = {};
    for (const property of probe.properties) {
      out[probe.family][probe.part][property] = targets.map((target) => getComputedStyle(target).getPropertyValue(property));
    }
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

/**
 * The scene's OWN value for a set of channels, read with no arm applied.
 *
 * This is what an absent channel resolves to: the arm clears every inline
 * `--ds-*` before it sets its own, so a name it does not carry is painted by
 * the vertical bundle underneath. Read once per (vertical, mode), before the
 * first arm, over every name any scenario of the run compiles.
 */
const readRootChannels = (names) => {
  const style = getComputedStyle(document.documentElement);
  const out = {};
  for (const name of names) out[name] = style.getPropertyValue(name).trim();
  return out;
};

/**
 * The same read, one arm later: the root's channels AS THIS ARM COMPUTES THEM.
 *
 * `applyVariables` has already cleared the previous arm and set this one, so a
 * name the arm does not carry reads the bundle underneath and a name it
 * aliases reads what the alias computes to. This is what makes
 * `resolvedDifference` a paint comparison rather than a string comparison, and
 * it is deliberately the SAME evaluation as the scene baseline so the two
 * halves of a channel cannot be measured by two different rules.
 */
export const readArmChannels = (page, names) => page.evaluate(readRootChannels, names);

const stampState = ({ state, stampAttributes }) => {
  // Every attribute ANY state writes, not just this one's: a state that carries
  // `data-disabled` must have it cleared again when the next state is stamped,
  // and the only way to clear what a previous call wrote is to know its name.
  const names = [...new Set(Object.values(stampAttributes).flatMap((entry) => Object.keys(entry)))];
  const extras = state === null ? {} : stampAttributes[state] ?? {};
  // A node's RESTING value, recorded on first stamp and restored on every state
  // that does not carry it. Real anatomy arrives with its own resting tokens
  // and a synthesized node arrives with none; both are read the same way, so
  // neither can keep a leftover from the state before it.
  const rest = (target, attribute) => {
    const key = `data-axis-rest-${attribute}`;
    if (!target.hasAttribute(key)) target.setAttribute(key, target.getAttribute(attribute) ?? '');
    return target.getAttribute(key);
  };
  const write = (target, attribute, value) => {
    if (value === '') target.removeAttribute(attribute);
    else target.setAttribute(attribute, value);
  };
  for (const node of document.querySelectorAll('[data-axis-family]')) {
    // A synthesized family is stamped on its root AND its mounted parts. A part
    // is mounted at rest with its `data-state` stripped precisely so the scene,
    // not the selector, supplies the state -- and a part nobody stamped could
    // never move on an axis whose rules are state-gated. Real anatomy already
    // carries its resting state tokens, and the skins match with `~=`, so the
    // probed state is ADDED to them and later restored.
    const targets = node.hasAttribute('data-axis-mount')
      ? [...node.querySelectorAll(':scope > *, [data-part]')]
      : [node, ...node.querySelectorAll('[data-axis-part]')];
    for (const target of targets) {
      const resting = rest(target, 'data-state');
      write(target, 'data-state', state === null ? resting : `${resting} ${state}`.trim());
      for (const name of names) {
        const resatt = rest(target, name);
        write(target, name, Object.hasOwn(extras, name) ? extras[name] : resatt);
      }
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
  'data-terminal-card-keyframes',
  'decision-inbox',
  'empty-state-surface',
  'file-browser',
  'form-placeholders',
  'import-export',
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
export async function readSettled(page, plan) {
  const { properties } = plan;
  let previous = await page.evaluate(readComputed, plan);
  let unsettled = new Set(Object.keys(previous));
  let current = previous;
  for (let attempt = 0; attempt < SETTLE_ATTEMPTS && unsettled.size > 0; attempt += 1) {
    await page.evaluate(invalidateStyles);
    current = await page.evaluate(readComputed, plan);
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
export async function measureCell({
  page,
  variables,
  properties,
  axisOf = axisByProperty(),
  states: variants = STATE_VARIANTS,
}) {
  const applied = await page.evaluate(applyVariables, variables);
  const unsettled = new Set();
  const collect = async () => {
    const reading = await readSettled(page, { properties, axisOf });
    for (const family of reading.unsettled) unsettled.add(family);
    return reading.values;
  };
  const base = await collect();
  const states = {};
  const stampAttributes = STATE_STAMP_ATTRIBUTES;
  for (const state of variants) {
    await page.evaluate(stampState, { state, stampAttributes });
    states[state] = await collect();
  }
  await page.evaluate(stampState, { state: null, stampAttributes });
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
 * How far apart the two arms of a pair land ON THE PAGE, which is the only
 * place the question can be answered.
 *
 * `effectiveMapDifference` above compares the two compiled maps and therefore
 * reads an absent name as different from a present one. That is the safe
 * direction for a witness and the WRONG one for a standing rule, because the
 * reverse case is real: an arm that compiles nothing paints the vertical's
 * baseline, and an arm that authors the vertical's own value compiles nothing.
 * bithire's `rhythm` pair is that case in both directions -- 0/2 compiled
 * channels, 45 of 209 families moving on the page.
 *
 * So a name each arm does not carry is resolved to the scene's own value, and
 * the pair is inert exactly when nothing is left over. A pair whose two arms
 * genuinely paint the same still reads 0 and still fails.
 *
 * THAT WAS HALF THE REPAIR. Resolving the ABSENT name against the scene left
 * the PRESENT name as the compiler's uncomputed string, so an arm that writes
 * `var(--ds-alias)` where the alias carries the value the other arm writes
 * literally read as a differing channel while Chromium painted the two arms
 * the same. Measured against this function on 2026-09-19
 * (`docs-engineering/archive/audits/2026-09-19-ds-4267a2904-davila/axis-alias-probe.json`,
 * chromium 149.0.7827.55): scene `--ds-state-disabled-opacity: 0.5`, arm B
 * assigning `var(--ds-alias-opacity)` which is also 0.5 -- instrument 1
 * differing, page `opacity: 0.5` in BOTH arms. A lexical string is not paint.
 *
 * So the reading is taken from the arm's OWN browser context. `resolvedA` /
 * `resolvedB` are the root's channels as that arm COMPUTES them, read by the
 * same `readRootChannels` the scene baseline is read with, once per arm while
 * that arm is on the root -- and a computed custom property has no `var()`
 * left in it. That is the path `run` takes, and it is the only one entitled to
 * the word "paint".
 *
 * Called WITHOUT them the function is OFFLINE: it closes each `var()` against
 * the arm's own map over the scene baseline, and a reference it cannot close
 * is INDETERMINATE -- counted in `unresolved`, never in `differing`.
 * Under-counting is the fail-closed direction and over-counting is not:
 * `differing > 0` is what grants a cell its standing, so a channel nobody
 * resolved must not be allowed to buy one. A genuinely different value is
 * still different, offline and on the page.
 */
export function resolvedDifference(variablesA, variablesB, baselineRoot = {}, { resolvedA = null, resolvedB = null } = {}) {
  const names = [...new Set([...Object.keys(variablesA), ...Object.keys(variablesB)])].sort();
  const measured = resolvedA !== null && resolvedB !== null;
  const reading = (name, variables, computed) => {
    if (measured) return { value: String(computed[name] ?? '').trim(), resolved: true };
    const own = Object.hasOwn(variables, name) ? variables[name] : baselineRoot[name] ?? '';
    return substituteReferences(own, { ...baselineRoot, ...variables });
  };
  const differing = [];
  const unresolved = [];
  for (const name of names) {
    const a = reading(name, variablesA, resolvedA);
    const b = reading(name, variablesB, resolvedB);
    if (!a.resolved || !b.resolved) unresolved.push(name);
    else if (a.value !== b.value) differing.push(name);
  }
  return {
    channels: names.length,
    differing: differing.length,
    differingChannels: differing.slice(0, 12),
    unresolved: unresolved.length,
    unresolvedChannels: unresolved.slice(0, 12),
    source: measured ? 'browser' : 'offline',
  };
}

/** How deep a chain of `var()` the offline reading follows before it gives up. */
const REFERENCE_DEPTH_LIMIT = 16;

/** The `var(` opening at `from`, read as its name, its fallback and its closing paren. */
function readReference(value, from) {
  let depth = 0;
  for (let index = from + 3; index < value.length; index += 1) {
    if (value[index] === '(') depth += 1;
    else if (value[index] === ')') {
      depth -= 1;
      if (depth > 0) continue;
      const inner = value.slice(from + 4, index);
      let nested = 0;
      let comma = -1;
      for (let at = 0; at < inner.length && comma === -1; at += 1) {
        if (inner[at] === '(') nested += 1;
        else if (inner[at] === ')') nested -= 1;
        else if (inner[at] === ',' && nested === 0) comma = at;
      }
      return {
        name: (comma === -1 ? inner : inner.slice(0, comma)).trim(),
        fallback: comma === -1 ? null : inner.slice(comma + 1).trim(),
        end: index,
      };
    }
  }
  return null;
}

/**
 * One channel's value with every `var()` closed against `declarations`.
 *
 * `resolved: false` is the honest answer, not a value to guess at: a reference
 * to a name this map does not carry, a cycle, or a chain deeper than the limit
 * has no reading here, and the caller must not count it either way. The
 * browser path never reaches this -- it is for a caller holding maps rather
 * than a page, and for the probe that found the defect.
 */
export function substituteReferences(value, declarations, seen = new Set(), depth = 0) {
  const text = String(value ?? '').trim();
  const at = text.indexOf('var(');
  if (at === -1) return { value: text, resolved: true };
  if (depth >= REFERENCE_DEPTH_LIMIT) return { value: text, resolved: false };
  const reference = readReference(text, at);
  if (reference === null) return { value: text, resolved: false };
  // A name nobody declares and a name declared empty are ONE case to the
  // cascade -- guaranteed-invalid -- so both fall through to the fallback.
  const declared = !seen.has(reference.name)
    && Object.hasOwn(declarations, reference.name)
    && String(declarations[reference.name]).trim() !== '';
  const source = declared ? declarations[reference.name] : reference.fallback;
  if (source === null || source === undefined) return { value: text, resolved: false };
  const inner = substituteReferences(
    source,
    declarations,
    declared ? new Set([...seen, reference.name]) : seen,
    depth + 1,
  );
  if (!inner.resolved) return { value: text, resolved: false };
  return substituteReferences(
    `${text.slice(0, at)}${inner.value}${text.slice(reference.end + 1)}`,
    declarations,
    seen,
    depth + 1,
  );
}

/**
 * Why a cell's pair proves nothing, stated once so the published cell and the
 * failure that follows it cannot drift apart.
 */
export function inertReason({ vertical, theme, channels, compiledA, compiledB }) {
  return `the two arms of the pair resolve to the SAME paint in ${vertical}/${theme} `
    + `(${channels} channel(s), 0 differing once every channel is read as the value it COMPUTES to in that arm's `
    + `own context, the vertical's own baseline included; the arms compiled ${compiledA}/${compiledB}) — the `
    + 'decision moves nothing this cell can read';
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
      byCell.set(where, cell.nonEvidentialReason ?? 'its two arms resolve to the same paint');
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
  /* [{ family, part, selector, properties }]: parts below a mount whose computed
   * values are published per arm, for invariants the verdict does not read. */
  parts = null,
  /* The per-axis part mounts, derived from the same skins the denominator is.
   * `false` reproduces the pre-lot reading -- the family's root element alone --
   * which is how the before/after of this instrument repair is measured on one
   * tree rather than compared across two. */
  partMounts = true,
  /* `true` reproduces the pre-repair root: a descendant chain merged onto one
   * node carrying the union of its classes and the LAST compound's attribute
   * values. It is how the before/after of the root repair is measured on ONE
   * tree. */
  collapsedRoots = false,
  /* `false` reproduces the pre-lot state set -- the four runtime-only states --
   * on the SAME tree. `disabled` is the fifth, and it is the one a component
   * receives as a prop rather than acquires by being touched; before the EVI-02
   * instrument lot the scene never stamped it, so disabled paint was outside
   * the instrument by construction and its zero was arithmetic. */
  statesDisabled = true,
  /* The same export of the same compiler, handed in by a runner that reads the
   * source tree instead of `dist/`; absent, the published door is imported. */
  compile: compileOverride = null,
} = {}) {
  const compile = compileOverride
    ?? (await import(pathToFileURL(resolve(root, COMPILER_MODULE)).href))[COMPILER_EXPORT];
  if (typeof compile !== 'function') {
    throw new Error(`axis-difference: ${COMPILER_MODULE} exports no callable ${COMPILER_EXPORT}`);
  }

  const elements = familyElements(root, families, { collapsedRoots });
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
  const notApplicable = axisNotApplicable(root);
  const properties = allProperties();
  const axisOf = axisByProperty();
  // The pins are read first and honoured: a family with no mountable root
  // gains no parts, so `UNMOUNTABLE_FAMILIES` and every denominator below it
  // are exactly the ones the pre-lot run published.
  const mountedParts = partMounts === false ? new Map() : familyAxisParts(root, families, elements);
  // Read from the same skins the denominator is, so the reach of the disabled
  // stamp is republished every run rather than asserted once in a comment.
  const disabledCensus = disabledVocabularyCensus(root, families);
  const stampedStates = statesDisabled
    ? [...STATE_VARIANTS]
    : STATE_VARIANTS.filter((state) => state !== 'disabled');
  const effective = (axis) => populations
    .get(axis)
    .filter((family) => mountable.includes(family) && !UNSETTLED_FAMILIES.includes(family));

  const { browser, close, provenance } = await launchBrowser();
  const cells = [];
  const partReadings = [];
  const refusals = [];
  const observedUnsettled = new Set();
  const newlyUnsettled = new Set();
  try {
    const context = await browser.newContext();
    for (const vertical of verticals) {
      const bundle = await resolveBundle({ vertical, mode: 'fresh' });
      // Compiled once per vertical because the door does not read the mode: the
      // two arms are the same two documents in both. Hoisting them is what lets
      // the scene baseline be read for every channel the run will apply, before
      // the first arm touches the root.
      const compiled = new Map();
      for (const scenario of scenarios) {
        try {
          compiled.set(scenario.id, {
            a: await compileDocument({ compile, vertical, slug: `${scenario.id}-a`, decisions: scenario.a }),
            b: await compileDocument({ compile, vertical, slug: `${scenario.id}-b`, decisions: scenario.b }),
          });
        } catch (error) {
          compiled.set(scenario.id, { reason: error instanceof Error ? error.message : String(error) });
        }
      }
      const channelNames = [...new Set(scenarios.flatMap((scenario) => {
        const artifacts = compiled.get(scenario.id);
        if (artifacts.reason !== undefined) return [];
        return themes.flatMap((mode) => [
          ...Object.keys(effectiveVariables(artifacts.a, mode)),
          ...Object.keys(effectiveVariables(artifacts.b, mode)),
        ]);
      }))].sort();
      for (const theme of themes) {
        const page = await context.newPage();
        await page.setContent(
          sceneHtml({ css: bundle.css, vertical, theme, elements, mounts, partMounts: mountedParts }),
          { waitUntil: 'load' },
        );
        // Before the first arm, so it is the bundle's own paint and not an
        // arm's leftovers: the value every channel an arm does not carry
        // resolves to in this cell.
        const baselineRoot = await page.evaluate(readRootChannels, channelNames);
        for (const scenario of scenarios) {
          const artifacts = compiled.get(scenario.id);
          if (artifacts.reason !== undefined) {
            refusals.push({ vertical, theme, scenario: scenario.id, reason: artifacts.reason });
            continue;
          }
          let before;
          let after;
          let partsA = null;
          let partsB = null;
          // The cell is ONE mode of the artifact, so it carries that mode's
          // block over the base one -- the same winner the shipped selector
          // order produces. Reading `variables` alone measured the base block
          // twice and called a routed palette inert.
          const variablesA = effectiveVariables(artifacts.a, theme);
          const variablesB = effectiveVariables(artifacts.b, theme);
          const baseA = Object.keys(artifacts.a.variables).length;
          const baseB = Object.keys(artifacts.b.variables).length;
          const compiledA = Object.keys(variablesA).length;
          const compiledB = Object.keys(variablesB).length;
          // The two comparators, published side by side: the map difference the
          // witness reads, and the paint difference the standing rule reads.
          // The second one cannot be computed yet -- it is taken from each
          // arm's own browser context, so it waits for the arms.
          const mapDifference = effectiveMapDifference(variablesA, variablesB);
          const pairChannels = [...new Set([...Object.keys(variablesA), ...Object.keys(variablesB)])].sort();
          let paintDifference;
          try {
            before = await measureCell({ page, variables: variablesA, properties, axisOf, states: stampedStates });
            partsA = parts ? await page.evaluate(readParts, parts) : null;
            // Arm A is still on the root here, and arm B there: each read is
            // that arm's own computed value for every channel of the pair, so
            // an alias is compared as what it paints and not as its string.
            const paintA = await readArmChannels(page, pairChannels);
            after = await measureCell({ page, variables: variablesB, properties, axisOf, states: stampedStates });
            partsB = parts ? await page.evaluate(readParts, parts) : null;
            const paintB = await readArmChannels(page, pairChannels);
            paintDifference = resolvedDifference(variablesA, variablesB, baselineRoot, {
              resolvedA: paintA,
              resolvedB: paintB,
            });
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
          for (const probe of parts ?? []) {
            for (const property of probe.properties) {
              partReadings.push({
                vertical,
                theme,
                scenario: scenario.id,
                kind: scenario.kind,
                family: probe.family,
                part: probe.part,
                selector: probe.selector,
                property,
                a: partsA?.[probe.family]?.[probe.part]?.[property] ?? [],
                b: partsB?.[probe.family]?.[probe.part]?.[property] ?? [],
              });
            }
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
              // The union of both arms' channels, and how many of them the two
              // arms DISAGREE on -- once as compiled maps (`differing`), once
              // as the value each channel COMPUTES to with that arm on the
              // root (`resolvedDiffering`). The gap between the two names
              // either a baseline-coincident arm or an alias that paints what
              // the other arm writes literally; `compiledA`/`compiledB` beside
              // them tell those two apart.
              channels: paintDifference.channels,
              differing: mapDifference.differing,
              resolvedDiffering: paintDifference.differing,
              resolvedDifferingChannels: paintDifference.differingChannels,
              // WHERE the resolved reading came from, published so a run that
              // silently fell back to comparing strings cannot pass for one
              // that measured the page. Every cell of a real run is `browser`.
              resolvedSource: paintDifference.source,
              // A pair whose two arms paint the same cannot be evidence FOR
              // anything, in either direction. Publishing the zero and refusing
              // to credit it is the only honest handling. An EMPTY arm is not
              // that case: it paints the vertical's baseline.
              evidential: paintDifference.differing > 0,
              nonEvidentialReason: paintDifference.differing > 0 ? undefined : inertReason({
                vertical, theme, ...paintDifference, compiledA, compiledB,
              }),
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
    // THE NODE EACH FAMILY'S ROOT ACTUALLY IS, published for the same reason
    // the part map is: a root nobody can see is a numerator nobody can audit,
    // and the merge this repair removed was invisible in every artifact the
    // probe ever published.
    roots: rootReport(elements, { collapsedRoots }),
    // WHICH ELEMENT EACH FAMILY WAS MEASURED ON, per axis, published so the
    // numerator this run reports can be read against the element it was read
    // from. A mount map nobody can see is a numerator nobody can audit.
    partMounts: partMountReport(mountedParts, {
      applied: partMounts !== false,
      unmountableCandidates: families === null ? unmountablePartCandidates(root, unmountable) : [],
    }),
    populations: Object.fromEntries(AXIS_IDS.map((axis) => [axis, effective(axis).length])),
    // The families a reviewed exclusion withdrew from each axis, counted beside
    // every denominator so no line of this run can be read without them.
    notApplicable: Object.fromEntries(AXIS_IDS.map((axis) => [axis, notApplicable.get(axis).length])),
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
    partReadings,
    limits: {
      states: { ...STATES_AXIS_LIMITS, stampedStates },
      disabled: { ...disabledCensus, stamped: statesDisabled },
    },
    statesNote:
      'The states axis is measured under the attributes a component stamps: [data-state] for all five states '
      + 'and [data-disabled] beside it for the one that comes from a prop. The :hover, :focus-visible and '
      + ':disabled halves of the rule need a real pointer, keyboard or native control and are NOT measured '
      + 'here; they are named rather than implied. What else this probe cannot see on that axis is '
      + 'enumerated with its measurements in limits.states and limits.disabled.',
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

/** The opt-out a measurement takes when it must not touch a published artifact. */
export const NO_WRITE_FLAG = '--no-write';
export const NO_WRITE_ENV = 'AXIS_DIFFERENCE_NO_WRITE';

/**
 * MAY THIS RUN REPUBLISH THE ARTIFACT, and the answer is no more often than it
 * used to be.
 *
 * The friction the press/disabled lot registered: every run of the pilot
 * rewrote `test-artifacts/gates/axis-difference-pilot/index.json`, including a
 * run taken to answer one question about one family during a review. The
 * published record then carried a reading nobody had reviewed and the diff
 * carried a file nobody had meant to change — and the reviewer could no longer
 * tell an artifact the lot MOVED from one an ad-hoc measurement had brushed.
 *
 * The opt-out is `--no-write` on the command line, or
 * `AXIS_DIFFERENCE_NO_WRITE=1` in the environment -- the second because a
 * vitest run has no argv of its own to pass a flag through, and the pilot
 * record is written from a vitest.
 *
 * WHAT IT DELIBERATELY DOES NOT DO: refuse a `--families=` run on its own.
 * `evaluate` may skip the pinned-denominator check on a filtered run, but the
 * pilot ALWAYS filters -- to its own declared roster -- so "filtered" does not
 * separate the published run from an ad-hoc one. The reader says which it is;
 * the probe does not guess.
 *
 * Returns the reason a run may not publish, or `null` when it may.
 *
 * @param {{ argv?: readonly string[], env?: Record<string, string | undefined> }} [options]
 * @returns {string | null}
 */
export function publicationRefusal({ argv = [], env = {} } = {}) {
  if (argv.includes(NO_WRITE_FLAG)) return `${NO_WRITE_FLAG} was passed`;
  const opt = env[NO_WRITE_ENV];
  if (opt !== undefined && opt !== '' && opt !== '0' && opt !== 'false') return `${NO_WRITE_ENV}=${opt} is set`;
  return null;
}

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
  // A ROOT THAT IS A CHAIN IS A FABRICATION, and the run that published 113 of
  // them read a family's own root rule against a node called `data-part=label`.
  // The `--collapsed-roots` reading is allowed to carry them -- reproducing
  // that run is what it is for -- and nothing else is.
  if (result.roots !== undefined && result.roots.collapsedRoots !== true && result.roots.merged > 0) {
    failures.push(
      `${result.roots.merged} famil(ies) were measured on a descendant chain MERGED onto one node, which is a node `
      + 'no rule of their skin selects; the root must be the compound the skin requires, not the chain',
    );
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
  // the page never received that arm, and its half of the cell is a reading of
  // the base bundle. It always fails. The test is PER ARM: ANDing the
  // precondition across both arms let a pair with one empty arm skip the guard
  // entirely, so an arm that compiled 2 and applied 0 beside an empty one was
  // never caught.
  //
  // A pair whose two arms resolve to ONE paint is a PRODUCT fact: the decision
  // moves nothing this cell can read. It fails unless it is a declared, named
  // entry of `INERT_PAIRS`, so the first one is a finding and the next one
  // cannot hide behind it.
  for (const cell of result.cells) {
    const lost = [['A', cell.compiledA, cell.appliedA], ['B', cell.compiledB, cell.appliedB]]
      .filter(([, compiled, applied]) => compiled > 0 && applied === 0);
    for (const [arm, compiled] of lost) {
      failures.push(
        `${cell.vertical}/${cell.theme} ${cell.scenario}: arm ${arm} compiled ${compiled} variables and the page `
        + `applied 0 (the pair compiled ${cell.compiledA}/${cell.compiledB}, applied `
        + `${cell.appliedA}/${cell.appliedB}); the instrument lost them`,
      );
    }
    if (lost.length > 0) continue;
    if (cell.resolvedDiffering === 0
      && !isDeclaredInert(inertPairs, cell.vertical, cell.theme, cell.scenario)) {
      failures.push(
        // The measurement, not the cell's published reason: a witnessed control
        // that ALSO lost its witness carries that sentence instead, and this
        // accusation is about the paint.
        `${cell.vertical}/${cell.theme} ${cell.scenario}: ${inertReason(cell)}. `
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
    // Against the PAINT, not against the compiled maps. `compiledA > 0 &&
    // compiledB > 0` could never be satisfied by a baseline-coincident arm, so
    // an entry recorded for one would have been permanent by construction.
    if (cells.length > 0 && cells.every((cell) => cell.resolvedDiffering > 0)) {
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
        ?? 'its two arms resolve to the same paint'}`,
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
        + `${cell.nonEvidentialReason ?? 'its two arms resolve to the same paint'}`,
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

/**
 * The failures of a computed invariant over mounted parts: every element the
 * part selector matched, in every measured arm, must read exactly the expected
 * value, and a part nobody measured is a failure rather than a pass.
 */
export function partInvariantFailures(result, invariants) {
  const failures = [];
  for (const invariant of invariants) {
    const readings = (result.partReadings ?? []).filter((reading) =>
      reading.family === invariant.family
      && reading.part === invariant.part
      && (invariant.properties === undefined || invariant.properties.includes(reading.property)));
    const where = `${invariant.family}/${invariant.part}`;
    if (readings.length === 0) {
      failures.push(`${where}: not measured — no reading was taken for ${invariant.selector ?? 'its selector'}`);
      continue;
    }
    for (const reading of readings) {
      const cell = `${reading.vertical}/${reading.theme} ${reading.scenario}`;
      for (const [arm, values] of [['A', reading.a], ['B', reading.b]]) {
        if (values.length === 0) {
          failures.push(`${where}: ${reading.property} not measured in ${cell} arm ${arm} — no element matched ${reading.selector}`);
          continue;
        }
        const off = [...new Set(values.filter((value) => value !== invariant.expected))];
        if (off.length > 0) {
          failures.push(`${where}: ${reading.property} computed ${off.join(', ')} != ${invariant.expected} in ${cell} arm ${arm}`);
        }
      }
    }
  }
  return failures;
}

/** One denominator per axis with the N/A of that axis beside it, as every printed line of this run states them. */
export function denominatorLine(result, key = 'populations') {
  return Object.entries(result[key] ?? {})
    .map(([axis, count]) => `${axis} ${count} (${result.notApplicable?.[axis] ?? 0} N/A)`)
    .join(', ');
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
    // The pre-lot reading, on demand: the family's root element alone. It is
    // how the before/after of the mount repair is measured on ONE tree, at one
    // catalog revision, with one browser.
    partMounts: !process.argv.includes('--no-part-mounts'),
    // The pre-repair root, on demand: the descendant chain merged onto one
    // node. Same tree, same catalog revision, same browser — the only way the
    // before/after of a mount repair is a measurement and not a comparison
    // across two trees.
    collapsedRoots: process.argv.includes('--collapsed-roots'),
    // The pre-lot state set, on demand: the four states a component only ever
    // acquires at runtime. It is how the before/after of the disabled stamp is
    // read on ONE tree at one catalog revision with one browser.
    statesDisabled: !process.argv.includes('--no-states-disabled'),
  });
  if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));

  console.log(
    `axis-difference — catalog ${result.revision.digest}, ${result.families.mountable} mountable famil(ies), `
    + `${result.verticals.length} vertical(s) x ${result.themes.length} mode(s); bundle ${result.bundleMode}; `
    + `chromium ${result.browser.browserVersion}`,
  );
  console.log(`  denominators (effective): ${denominatorLine(result)}`);
  console.log(`  denominators (declared by check/theme/population): ${denominatorLine(result, 'declaredPopulations')}`);
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
    `  roots: ${result.roots.families} famil(ies) measured on `
    + `${result.roots.collapsedRoots ? 'the MERGED chain (the pre-repair reading)' : 'the head compound their own skin requires'}`
    + ` — ${result.roots.merged} of them a chain squashed onto one node`,
  );
  console.log(
    `  part mounts: ${result.partMounts.applied ? 'ON' : 'OFF (root element only — the pre-lot reading)'}`
    + `, ${result.partMounts.families} famil(ies) / ${result.partMounts.parts} part(s) / `
    + `${result.partMounts.maxChainNodes} node(s) grafted onto the roots already mounted`,
  );
  console.log(
    `    per axis (families/parts): ${Object.entries(result.partMounts.perAxis)
      .map(([axis, row]) => `${axis} ${row.families}/${row.parts}`).join(', ')}`,
  );
  console.log(
    `    pinned UNMOUNTABLE and painting an axis on a descendant only (no root to graft onto, still excluded): `
    + `${result.partMounts.pinnedUnmountableWithPartPaint.length} — `
    + `${result.partMounts.pinnedUnmountableWithPartPaint.join(', ') || 'none'}`,
  );
  console.log(
    `    selectors refused by the part law, by reason: ${Object.entries(result.partMounts.refused)
      .sort((left, right) => right[1] - left[1]).map(([reason, count]) => `${reason} ${count}`).join(', ') || 'none'}`,
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
          ?? 'its two arms resolve to the same paint'}]`),
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
  // The arms whose artifact delta is empty BECAUSE the arm authors the value
  // the vertical's own preset already states. Printed because it is the one
  // reading a compiled-map count cannot show: the delta is empty and the paint
  // is not, and a reader who only saw `0/2` would call the pair inert.
  const coincident = [...new Set(result.cells
    .filter((cell) => cell.evidential && (cell.compiledA === 0 || cell.compiledB === 0))
    .map((cell) => `${cell.vertical}/${cell.theme} ${cell.scenario} arm `
      + `${cell.compiledA === 0 ? 'A' : 'B'} (${cell.resolvedDiffering}/${cell.channels} differing on the page)`))];
  if (coincident.length > 0) {
    console.log(`  baseline-coincident arms (empty delta, NOT empty paint): ${coincident.join(', ')}`);
  }
  console.log(
    `  states stamped: ${result.limits.states.stampedStates.join(', ')}`
    + ` — disabled reaches ${result.limits.disabled.reachedFamilies}/${result.limits.disabled.gatedFamilies}`
    + ' famil(ies) that gate disabled paint (rules by vocabulary: '
    + `${Object.entries(result.limits.disabled.rules).map(([name, count]) => `${name} ${count}`).join(', ')})`,
  );
  console.log(
    `    gating disabled paint on :disabled or [aria-disabled] ALONE (unreached): `
    + `${result.limits.disabled.unreachedFamilies.length} — `
    + `${result.limits.disabled.unreachedFamilies.join(', ') || 'none'}`,
  );
  for (const line of result.limits.states.unreachable) console.log(`  states axis limit: ${line}`);
  const refusal = publicationRefusal({ argv: process.argv, env: process.env });
  console.log(
    '  publication of the pilot record (test-artifacts/gates/axis-difference-pilot): '
    + `${refusal === null ? 'permitted under this invocation' : `REFUSED — ${refusal}`}`
    + ' — this CLI writes no artifact of its own',
  );
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
            ?? 'its two arms resolve to the same paint'}`
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
