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
 * AND THE REACH OF THAT SCENE WAS STILL SHORT IN THREE PLACES, each measured
 * by the rhythm census (`evidence/rhythm-wiring-census/`) and each repaired
 * here. The ROOT was mounted without the attributes the DEFAULT RENDER always
 * stamps, so paint behind `[data-size='md']` or `[data-structure='record']`
 * was unseen -- `AS_RENDERED_ROOT_STAMPS` is the mount source the root law
 * below says this probe does not have, and it is a roster checked against the
 * tree rather than a heuristic. The PART VOCABULARY listed no logical edge
 * longhand, so a rule writing `margin-inline-start` was not a part source even
 * though the probe reads the physical longhands the browser resolves it into.
 * And a rule written WITHOUT an ancestor -- the family's own `block__element`
 * -- built no node at all, while a `:has()` rule was refused as a pseudo
 * although its condition is on the SCENE and not on an interaction this probe
 * never enters. `--no-as-rendered` and `--no-part-reach` reproduce the two
 * halves of the pre-repair reading on the same tree.
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
 * THE STATES AXIS IS READ IN TWO HALVES. The stamped half is the kernel's
 * `[data-state]` tokens (plus `[data-disabled]`) written on the scene, as
 * before. The NATIVE half is `:hover`, `:active` and `:focus-visible` forced by
 * the browser itself through the DevTools protocol on a second page of the same
 * scene -- the browser's own pseudo matching, not a class. A pass forces one
 * depth of every family at once: each node at that depth plus its ancestor
 * chain (`:hover`, `:active`), or the node plus `:focus-within` on its chain
 * (focus), and reads only that depth, so the read stays whole-page and every
 * node is read in the state a pointer or keyboard ON it produces. A forced
 * calibration scene must reach its paint before any family is read.
 * THE COMBINATION RULE: a family moves on states when EITHER half, each
 * compared arm against arm, shows an attributable computed difference; both
 * halves and their union are published per cell. What neither half reaches
 * (`:disabled`, `[aria-*]`, a pseudo inside `:has()`, a pseudo-element other
 * than a `::before`/`::after` on a host already in the scene, a forced pseudo
 * driving a sibling -- withheld, not credited) is counted and named per run.
 * `--no-native-pseudos` reproduces the stamped half alone.
 *
 * AND A FAMILY WHOSE PAINT IS NOT UNDER ITS DEFAULT ROOT AT ALL -- an open
 * dropdown's surface, a present tooltip's bubble, the text-variant skeleton's
 * blocks -- is mounted as the markup its engine renders in that shipped
 * configuration, beside the root, on the axes where the root provably paints
 * nothing. The law, the roster and the witness door are at
 * `REAL_RENDER_MOUNTS`; `--no-real-render-mounts` reproduces the pre-lot scene.
 *
 * AND SINCE S1 THE STATES AXIS REACHES THOSE MOUNTS TOO. A row may declare
 * `states`, and its nodes are then read under BOTH halves -- stamped and
 * forced -- with the withholding laws the default scene already obeys; the
 * four resting axes are read exactly as before. The scene also stamps
 * `focused`, the one kernel token it used to leave out, and
 * `--no-focused-stamp` reproduces the five-state set on the same tree.
 *
 * AND A `::before`/`::after` THE FAMILY PAINTS AN AXIS ON IS READ ON ITS HOST.
 * The part law refuses a pseudo-element as a NODE and still does; what this
 * lot adds is the browser's computed style of the box it generates, read on a
 * host the DEFAULT scene already holds, for the axis whose own rule wrote the
 * property, and only where `content` is generated. Every other `::` is refused
 * by name (`ua-shadow-pseudo`), real-render mounts are out of scope, every
 * refusal entry publishes its outcome and the credits that rest on a pseudo
 * alone are pinned. That is instrument visibility of paint already there, not
 * fleet improvement. The law is at `pseudoReadEntry`; `--no-pseudo-reads`
 * reproduces the pre-lot reading on the same tree.
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
 *   node scripts/check/theme/axis-difference/index.mjs                  measure and publish indicator 7
 *   node scripts/check/theme/axis-difference/index.mjs --json           the full measurement
 *   node scripts/check/theme/axis-difference/index.mjs --vertical=evnto one vertical
 *   node scripts/check/theme/axis-difference/index.mjs --threshold=80   fail below 80 % per axis
 *   node scripts/check/theme/axis-difference/index.mjs --families=button,card
 *   node scripts/check/theme/axis-difference/index.mjs --no-part-mounts   the pre-lot reading
 *   node scripts/check/theme/axis-difference/index.mjs --collapsed-roots  the pre-repair root
 *   node scripts/check/theme/axis-difference/index.mjs --no-write         publishes nothing (pilot record, indicator 7)
 *   AXIS_DIFFERENCE_NO_WRITE=1 vitest ...axis-difference-pilot              the same, from a vitest
 *   node scripts/check/theme/axis-difference/index.mjs --no-states-disabled  the pre-lot state set
 *   node scripts/check/theme/axis-difference/index.mjs --no-as-rendered   the pre-roster root
 *   node scripts/check/theme/axis-difference/index.mjs --no-part-reach    the pre-lot part law
 *   node scripts/check/theme/axis-difference/index.mjs --no-native-pseudos  the stamped states half alone
 *   node scripts/check/theme/axis-difference/index.mjs --no-real-render-mounts  the default mounts alone
 *   node scripts/check/theme/axis-difference/index.mjs --no-focused-stamp  the pre-S1 five-state set
 *   node scripts/check/theme/axis-difference/index.mjs --no-pseudo-reads  no ::before/::after read on any host
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
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
  axisUnobservable,
  catalogRevision,
  cssRules,
  groupControls,
  skinFamilies,
  stripCssComments,
} from '../population/index.mjs';
import {
  INDICATOR_PATH,
  buildIndicator,
  indicatorRefusal,
  negativeControlsOf,
  writeIndicator,
} from './indicator/index.mjs';

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
/** The kernel's state stamp, which the scene supplies rather than the selector. */
const STATE_ATTRIBUTE = /(^|-)state$/u;

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
 * skin -- `AS_RENDERED_ROOT_STAMPS` below is that mount source, one checked
 * row per family, and every prop gate without a row is still unseen exactly as
 * this paragraph describes.
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

/**
 * THE MOUNT SOURCE THE COMMENT ABOVE SAYS THIS PROBE DOES NOT HAVE.
 *
 * `familyElement` admits a root attribute only when it is STRUCTURAL -- one
 * every root compound of the skin names -- and that is the right law for a
 * reading taken off the stylesheet alone, because mounting one arbitrary value
 * of `[data-size]` is a guess. But a component that stamps `data-size={size}`
 * with `size = KBD_DEFAULTS.size` does not leave the value open: the DEFAULT
 * RENDER carries `md` and nothing else, so paint behind `[data-size='md']` is
 * paint the family always has and the probe was reading a node the component
 * never renders. That is the `WHAT THIS UNDER-COUNTS` paragraph above, and the
 * reason it stopped there was that the default lives in the TSX, not the skin.
 *
 * This roster IS that mount source, and it is deliberately not a heuristic
 * over the TSX. Each row names the attribute, the value the DEFAULT render
 * stamps, and the two source lines that make it so -- the stamp site and the
 * default it resolves from -- so `asRenderedRosterFailures` can fail the run
 * the day either line stops existing. Three rules bound it:
 *
 *  1. The attribute must be stamped UNCONDITIONALLY by the default render. An
 *     attribute a component writes only when a prop is supplied -- `Flex`'s
 *     `data-gap-preset`, written inside `if (props.gap !== undefined)` -- is
 *     NOT part of the default render, and a row for it would be the
 *     fabricated configuration law 1 refuses. Those families keep reading
 *     whatever the bare root paints. `Grid` is the same attribute on the other
 *     side of the line and the reason the law is read per family rather than
 *     per attribute name: its root stamps
 *     `gridGapPresetSpelling(adaptation.gap ?? GRID_DEFAULTS.gap)`
 *     unconditionally, so the rung IS what a default `<Grid>` renders.
 *  2. The value is the default the component resolves, not the value that
 *     makes a number move. `anchor` is the row that proves it: its skin paints
 *     a rhythm `gap` only under `[data-direction='horizontal']`, and
 *     `ANCHOR_DEFAULTS.direction` is `vertical`, so the honest as-rendered
 *     mount leaves anchor with no root rhythm paint at all.
 *  3. `data-state` and any `*-state` attribute is refused outright, for the
 *     reason the mount law strips it: the SCENE stamps state. A family whose
 *     paint lives behind `[data-state='error']` is reached by a state
 *     vocabulary, never by a root that was born in it.
 *
 * `--no-as-rendered` reproduces the pre-roster reading on the same tree, which
 * is how the before/after of this repair is measured with one browser.
 */
export const AS_RENDERED_ROOT_STAMPS = Object.freeze({
  record: Object.freeze([
    Object.freeze({
      attribute: 'data-structure',
      value: 'record',
      source: 'src/components/structures/record/summary-strip/index.tsx',
      stamp: 'data-structure="record"',
      // The summary strip IS the family's mounted root, and it stamps the
      // family's private density hook on every render.
      resolves: 'data-part="summary-strip"',
    }),
    Object.freeze({
      attribute: 'data-variant',
      value: 'default',
      source: 'src/components/structures/record/summary-strip/index.tsx',
      stamp: 'data-variant={variant}',
      resolves: "variant = 'default',",
    }),
  ]),
  button: Object.freeze([
    Object.freeze({
      attribute: 'data-variant',
      value: 'primary',
      source: 'src/components/primitives/inputs/button/engines/modern/index.tsx',
      stamp: "'data-variant': effectiveVariant,",
      resolves: 'BUTTON_DEFAULTS.variant;',
    }),
    Object.freeze({
      attribute: 'data-size',
      value: 'md',
      source: 'src/components/primitives/inputs/button/engines/modern/index.tsx',
      stamp: "'data-size': size,",
      resolves: 'BUTTON_DEFAULTS.size;',
    }),
  ]),
  kbd: Object.freeze([Object.freeze({
    attribute: 'data-size',
    value: 'md',
    source: 'src/components/primitives/display/kbd/engines/modern/index.tsx',
    stamp: 'data-size={size}',
    resolves: 'size = KBD_DEFAULTS.size,',
  })]),
  textarea: Object.freeze([Object.freeze({
    attribute: 'data-size',
    value: 'md',
    source: 'src/components/primitives/inputs/textarea/engines/modern/index.tsx',
    stamp: 'data-size={size}',
    resolves: 'size = TEXTAREA_DEFAULTS.size,',
  })]),
  'action-dock': Object.freeze([
    Object.freeze({
      attribute: 'data-placement',
      value: 'bottom',
      source: 'src/components/structures/workspace/action-dock/runtime/rendering/index.tsx',
      stamp: 'data-placement={position}',
      resolves: "position = 'bottom',",
    }),
    Object.freeze({
      attribute: 'data-mode',
      value: 'fixed',
      source: 'src/components/structures/workspace/action-dock/runtime/rendering/index.tsx',
      stamp: 'data-mode={mode}',
      resolves: "mode = 'fixed',",
    }),
  ]),
  anchor: Object.freeze([Object.freeze({
    attribute: 'data-direction',
    value: 'vertical',
    source: 'src/components/primitives/navigation/anchor/engines/modern/index.tsx',
    stamp: 'data-direction={direction}',
    resolves: 'direction = ANCHOR_DEFAULTS.direction,',
  })]),
  'grid-view': Object.freeze([Object.freeze({
    attribute: 'data-empty',
    value: 'false',
    source: 'src/components/patterns/data/grid-view/presentation/grid/index.tsx',
    // Every branch of this renderer stamps the attribute; `false` is the one
    // the loaded grid carries, and it is the branch the family exists for.
    stamp: 'data-empty="false"',
    resolves: 'data-empty="true"',
  })]),
  'tag-compounds': Object.freeze([Object.freeze({
    attribute: 'data-gap',
    value: 'sm',
    source: 'src/components/primitives/display/tag/compound/group/index.tsx',
    stamp: 'data-gap={gap}',
    resolves: "gap = 'sm',",
  })]),
  grid: Object.freeze([Object.freeze({
    attribute: 'data-gap-preset',
    value: 'md',
    source: 'src/components/primitives/layout/grid/engines/modern/index.tsx',
    // The rung is written on every root, from the family's own default, so the
    // dial-scaled rule behind it is the DEFAULT render and not a
    // configuration. `flex` is the sibling that fails law 1 on the same
    // attribute: it stamps `data-gap-preset` only inside
    // `if (props.gap !== undefined)`.
    stamp: '"data-gap-preset": gridGapPresetSpelling(',
    resolves: 'adaptation.gap ?? GRID_DEFAULTS.gap',
  })]),
  'auto-complete': Object.freeze([Object.freeze({
    attribute: 'data-size',
    value: 'md',
    source: 'src/components/primitives/inputs/auto-complete/engines/modern/index.tsx',
    // `AUTOCOMPLETE_DEFAULTS.size` is the legacy spelling `middle`, which
    // `toCanonicalSize` resolves to the `md` the skin keys on.
    stamp: 'data-size={size}',
    resolves: 'const size = toCanonicalSize(sizeProp);',
  })]),
  avatar: Object.freeze([
    Object.freeze({
      attribute: 'data-shape',
      value: 'circle',
      source: 'src/components/primitives/display/avatar/engines/modern/index.tsx',
      stamp: 'data-shape={shape}',
      resolves: 'shape = AVATAR_DEFAULTS.shape,',
    }),
  ]),
  'cell-renderers': Object.freeze([
    Object.freeze({
      attribute: 'data-variant',
      value: 'secondary',
      source: 'src/components/patterns/runtime/cell-renderers/index.tsx',
      stamp: '\'data-variant\': resolvedVariant,',
      resolves: 'variant: CellBadgeVariant = \'secondary\',',
    }),
  ]),
  'chart-foundation': Object.freeze([
    Object.freeze({
      attribute: 'data-variant',
      value: 'detailed',
      source: 'src/components/patterns/visualization/charts/presentation/tooltip/index.tsx',
      stamp: 'data-variant={variant}',
      resolves: 'variant = \'detailed\',',
    }),
  ]),
  'collection-shell': Object.freeze([
    Object.freeze({
      attribute: 'data-continuity',
      value: 'seamless',
      source: 'src/components/structures/shell/workspace-shell/index.tsx',
      stamp: 'data-continuity={continuity}',
      resolves: 'continuity = \'seamless\',',
    }),
  ]),
  'data-terminal-card': Object.freeze([
    Object.freeze({
      attribute: 'data-variant',
      value: '1',
      source: 'src/components/structures/dashboard/data-terminal-card/index.tsx',
      stamp: 'data-variant="1"',
      resolves: 'const DEFAULT_PAGE_VARIANT = 1 as const;',
    }),
  ]),
  'file-manager': Object.freeze([
    Object.freeze({
      attribute: 'data-loading',
      value: 'false',
      source: 'src/components/patterns/data/file-manager/engines/modern/index.tsx',
      stamp: 'data-loading={false}',
      resolves: 'if (loading) {',
    }),
  ]),
  'invoice-template': Object.freeze([
    Object.freeze({
      attribute: 'data-loading',
      value: 'false',
      source: 'src/components/patterns/forms/invoice-template/engines/modern/index.tsx',
      stamp: 'data-loading="false"',
      resolves: 'if (loading) {',
    }),
  ]),
  radio: Object.freeze([
    Object.freeze({
      attribute: 'data-checked',
      value: 'false',
      source: 'src/components/primitives/inputs/radio/engines/modern/index.tsx',
      stamp: 'data-checked={isChecked ? \'true\' : \'false\'}',
      resolves: 'defaultChecked = RADIO_DEFAULTS.defaultChecked,',
    }),
  ]),
  result: Object.freeze([
    Object.freeze({
      attribute: 'data-tone',
      value: 'info',
      source: 'src/components/primitives/feedback/result/engines/modern/index.tsx',
      stamp: 'data-tone={status}',
      resolves: 'status = RESULT_DEFAULTS.status,',
    }),
  ]),
  'saved-views-menu': Object.freeze([
    Object.freeze({
      attribute: 'data-open',
      value: 'false',
      source: 'src/components/structures/workspace/saved-views-menu/index.tsx',
      stamp: 'data-open={isOpen}',
      resolves: 'const [isOpen, setIsOpen] = useState(false);',
    }),
  ]),
  'scroll-area': Object.freeze([
    Object.freeze({
      attribute: 'data-scrollbar-size',
      value: 'normal',
      source: 'src/components/primitives/layout/scroll-area/engines/modern/index.tsx',
      stamp: 'data-scrollbar-size={scrollbarSize}',
      resolves: 'scrollbarSize = SCROLL_AREA_DEFAULTS.scrollbarSize,',
    }),
  ]),
  'search-command-bar': Object.freeze([
    Object.freeze({
      attribute: 'data-embedded',
      value: 'false',
      source: 'src/components/structures/workspace/search-command-bar/index.tsx',
      stamp: 'data-embedded={embedded}',
      resolves: 'surfaceVariant = \'default\',',
    }),
  ]),
  'sidebar-surface': Object.freeze([
    Object.freeze({
      attribute: 'data-bordered',
      value: 'true',
      source: 'src/components/structures/shell/navigation/sidebar-surface/index.tsx',
      stamp: 'data-bordered={config.visual.bordered === false ? \'false\' : \'true\'}',
      resolves: 'config.visual.bordered === false ? \'false\' : \'true\'',
    }),
  ]),
  'stepper-compounds': Object.freeze([
    Object.freeze({
      attribute: 'data-direction',
      value: 'horizontal',
      source: 'src/components/primitives/navigation/stepper/compound/step/index.tsx',
      stamp: 'data-direction={direction}',
      resolves: 'direction = \'horizontal\',',
    }),
  ]),
  'tag-input': Object.freeze([
    Object.freeze({
      attribute: 'data-size',
      value: 'md',
      source: 'src/components/primitives/inputs/tag-input/engines/modern/index.tsx',
      stamp: 'data-size={size}',
      resolves: 'size = TAGINPUT_DEFAULTS.size,',
    }),
  ]),
  // R2a (WO-EVI-02, rhythm reach). Each row was measured moving by the R1
  // census before it was written, and each is the DEFAULT render's value.
  descriptions: Object.freeze([
    Object.freeze({
      attribute: 'data-layout',
      value: 'horizontal',
      source: 'src/components/primitives/display/descriptions/engines/modern/index.tsx',
      // `DESCRIPTIONS_DEFAULTS.layout` is `'horizontal' as const` (contracts),
      // and the root stamps the resolved layout on every render; the rows'
      // dial-read padding and gap sit behind it.
      stamp: 'data-layout={layout}',
      resolves: 'layout = DESCRIPTIONS_DEFAULTS.layout,',
    }),
  ]),
  'input-number': Object.freeze([
    Object.freeze({
      attribute: 'data-size',
      value: 'md',
      source: 'src/components/primitives/inputs/input-number/engines/modern/index.tsx',
      // The default `size` is the legacy spelling `'default'`, which
      // `toCanonicalSize` maps to `md` (`CANON_SIZE_BY_LEGACY.default`); both
      // lines are pinned, so a re-spelled default fails the row.
      stamp: 'data-size={sizeKey}',
      resolves: Object.freeze(["size = 'default',", "const sizeKey = toCanonicalSize(size) ?? 'md';"]),
    }),
  ]),
  progress: Object.freeze([
    Object.freeze({
      attribute: 'data-type',
      value: 'line',
      source: 'src/components/primitives/feedback/progress/engines/modern/index.tsx',
      // `PROGRESS_DEFAULTS.type` is `'line'` (contracts); every non-circle
      // render returns the line branch, which writes the attribute literally.
      stamp: 'data-type="line"',
      resolves: 'type = PROGRESS_DEFAULTS.type,',
    }),
  ]),
  // S10 (WO-EVI-02, shape reach). Measured moving on shape with the stamp
  // alone (SC1 census), and the DEFAULT render's value: the root writes
  // `data-radius={radius}` on every render, resolved from `TAG_DEFAULTS.radius`
  // ('md', contracts) when neither the caller nor a recipe profile names one.
  // CAVEAT: all three recipe profiles override it (technical-sharp `none`,
  // network-professional and editorial-round `full`), so an app that mounts a
  // RecipeProfileProvider paints a corner this row does not read.
  tag: Object.freeze([
    Object.freeze({
      attribute: 'data-radius',
      value: 'md',
      source: 'src/components/primitives/display/tag/engines/modern/index.tsx',
      stamp: 'data-radius={radius}',
      resolves: 'TAG_DEFAULTS.radius;',
    }),
  ]),
  // R3 (WO-EVI-02, depth reach). Each row was measured moving on depth with
  // the stamp alone before it was written, and each is the DEFAULT render's value.
  'table-toolbar': Object.freeze([
    Object.freeze({
      attribute: 'data-structure',
      value: 'table-toolbar',
      source: 'src/components/structures/workspace/table-toolbar/runtime/rendering/index.tsx',
      // The family's own "always-present specificity hook", written literally
      // on the one root every render returns; the root keyline sits behind it.
      stamp: 'data-structure="table-toolbar"',
      resolves: 'className="ds-structure ds-table-toolbar"',
    }),
  ]),
  'user-profile-card': Object.freeze([
    Object.freeze({
      attribute: 'data-loading',
      value: 'false',
      source: 'src/components/patterns/identity/profile/user-profile-card/engines/modern/index.tsx',
      // `loading` has no default, so the default render skips the loading
      // branch and both remaining branches write the literal `false`.
      stamp: 'data-loading={false}',
      resolves: 'if (loading) {',
    }),
    Object.freeze({
      attribute: 'data-variant',
      value: 'full',
      source: 'src/components/patterns/identity/profile/user-profile-card/engines/modern/index.tsx',
      // The default variant is `full`; the card's resting elevation sits
      // behind `[data-loading='false'][data-variant='full']`.
      stamp: 'data-variant={variant}',
      resolves: "variant = 'full',",
    }),
  ]),
});

/**
 * One family's root with the attributes its default render stamps, or the same
 * element unchanged when the roster has no row for it.
 *
 * A stamped attribute REPLACES the value the mount law read off the skin:
 * `kbd`'s scored candidate carries a bare `[data-size]`, which mounts as
 * `data-size=''` and matches none of the three size rules.
 */
export function withAsRenderedStamps(element, rows = []) {
  if (element === null || rows.length === 0) return element;
  const attributes = { ...element.attributes };
  for (const row of rows) {
    if (STATE_ATTRIBUTE.test(row.attribute)) continue;
    attributes[row.attribute] = row.value;
  }
  const selector = element.classes.map((name) => `.${name}`).join('')
    + Object.entries(attributes).map(([name, value]) => `[${name}='${value}']`).join('');
  return { ...element, attributes, selector };
}

/**
 * family -> its element, or null when the skin publishes no mountable selector.
 *
 * `asRendered` adds the roster's default-render stamps. It is off under
 * `collapsedRoots`, which exists to reproduce a run that predates them.
 */
export function familyElements(root = CORE_ROOT, only = null, {
  collapsedRoots = false,
  asRendered = true,
  asRenderedRoster = AS_RENDERED_ROOT_STAMPS,
} = {}) {
  const elements = new Map();
  for (const [family, files] of skinFamilies(root)) {
    if (only && !only.includes(family)) continue;
    const css = files.map((file) => readFileSync(file, 'utf8')).join('\n');
    const element = familyElement(css, { collapsedRoots });
    elements.set(
      family,
      asRendered && !collapsedRoots
        ? withAsRenderedStamps(element, asRenderedRoster[family] ?? [])
        : element,
    );
  }
  return elements;
}

/**
 * Every way a roster row can be wrong, read against the tree rather than
 * trusted: a row whose source moved, whose default was re-spelled, whose
 * attribute the skin does not gate on any more, or which names a state.
 *
 * This is the whole reason the roster is allowed to exist. A hand-written
 * fixture that stops matching in silence is the defect this file opens by
 * naming; a hand-written fixture that FAILS THE RUN when it stops matching is
 * a pin like any other in this instrument.
 */
export function asRenderedRosterFailures(root = CORE_ROOT, roster = AS_RENDERED_ROOT_STAMPS) {
  const failures = [];
  const skins = skinFamilies(root);
  for (const [family, rows] of Object.entries(roster)) {
    const files = skins.get(family);
    if (files === undefined) {
      failures.push(`${family}: no Modern skin family`);
      continue;
    }
    const css = files.map((file) => readFileSync(file, 'utf8')).join('\n');
    if (familyElement(css) === null) {
      failures.push(`${family}: no mountable root to stamp`);
      continue;
    }
    const gated = new Set(selectorParts(css).flatMap((selector) =>
      [...selector.matchAll(ATTRIBUTE_TOKEN)].map((match) => match[1])));
    for (const row of rows) {
      const where = `${family}/${row.attribute}`;
      if (STATE_ATTRIBUTE.test(row.attribute)) {
        failures.push(`${where}: a state is stamped by the scene, never by the root`);
      }
      if (!gated.has(row.attribute)) {
        failures.push(`${where}: the skin no longer gates on this attribute`);
      }
      const file = resolve(root, row.source);
      if (!existsSync(file)) {
        failures.push(`${where}: ${row.source} does not exist`);
        continue;
      }
      const source = readFileSync(file, 'utf8');
      // `resolves` may name more than one line when the default is resolved in
      // two steps (a legacy spelling, then its canonical mapping).
      for (const [label, text] of [['stamp', row.stamp], ...texts(row.resolves).map((line) => ['resolves', line])]) {
        if (!source.includes(text)) failures.push(`${where}: ${row.source} no longer carries the ${label} \`${text}\``);
      }
    }
  }
  return failures;
}

/** The roster as a run publishes it: which families were mounted as rendered, and with what. */
export function asRenderedReport(elements, { applied = true, roster = AS_RENDERED_ROOT_STAMPS } = {}) {
  const map = {};
  for (const [family, rows] of Object.entries(roster)) {
    if (!elements.has(family)) continue;
    map[family] = Object.fromEntries(rows.map((row) => [row.attribute, row.value]));
  }
  return { applied, families: Object.keys(map).length, map };
}

/**
 * THE REAL-RENDER MOUNTS: the markup a family's Modern engine renders in the
 * configuration that carries its paint, mounted BESIDE the family's root when
 * that root provably paints nothing on an axis the render owns.
 *
 * WHAT WAS BROKEN. Every node this scene builds is read off the skin: the root
 * compound, the part chains grafted under it, the as-rendered stamps. A family
 * whose paint lives on a node that is not under its default root is therefore
 * unreachable by construction, and it reads as a NON-MOVER on channels that
 * are wired end to end. Measured: `dropdown` paints its radius, elevation and
 * enter animation on `.ds-dropdown-surface`, which exists only while
 * `usePresence` reports the menu open; `tooltip` paints them on
 * `.ds-tooltip-bubble`, which exists only while `present && mounted`;
 * `skeleton`'s mounted root is the shape-variant block whose radius arrives as
 * an inline hatch the scene never stamps, while the blocks a tenant sees are
 * the text variant's avatar/title/line under `.rottay-skeleton-wrapper`.
 *
 * WHY THE OLD REFUSAL IS RETIRED. The part law refused such a node as "an
 * interaction state this probe does not enter". That conflated two things. An
 * open menu, a present bubble and a text-variant skeleton are STATIC
 * configurations the product ships: once opened or configured they sit at rest
 * as ordinary DOM, which is exactly what the showroom's skin-coverage section
 * mounts for the dead-selector audit. The interaction itself -- the pointer on
 * the node -- is the native-pseudo half's business, and it is measured there by
 * forcing, not here. The distinction this law keeps is the one that matters:
 * REAL markup against FABRICATED markup.
 *
 * THE LAW, and every clause is checked rather than trusted:
 *
 *  1. THE MARKUP IS THE ENGINE'S. Every token of a mount -- tag, class,
 *     attribute value, inline custom property -- must be witnessed in the
 *     engine source: literally (`data-part="title"`, `'ds-dropdown-surface'`,
 *     `<li`), or by a `stamps` row naming the dynamic stamp AND the default it
 *     resolves from, the discipline `AS_RENDERED_ROOT_STAMPS` holds (a stamp a
 *     sibling component of the same render writes names its own `source`). A mount
 *     may OMIT what the engine writes (ids, handlers, runtime layer
 *     attributes); it may never ADD a token the engine does not write. A stamp
 *     row nobody's markup uses is refused too, so the roster cannot rot into a
 *     list of claims. `realRenderRosterFailures` is the door, and `run` refuses
 *     to mount a roster that does not pass it.
 *  2. THE CONFIGURATION IS NAMED. `state` names the configuration and the
 *     engine source that gates it; the published record resolves it to
 *     `file:line` on every run, so a gate that moves is re-read, not re-typed.
 *     `host` is the one foreign structure admitted: bare elements the HTML
 *     content model requires (a `<tr>` parses only inside `<table><tbody>`),
 *     carrying no class and no attribute.
 *  3. THE FAMILY QUALIFIES PER AXIS, IN THE BROWSER. A mount is read on an
 *     axis only where the family's default mount -- root plus the parts that
 *     axis grafted -- paints nothing THAT MOVES on it: every property of the
 *     axis computes the same value in both arms of the cell, and the real
 *     render computes a different one. The unit of this instrument is an
 *     attributable difference, so a root painting a FIXED constant (a literal
 *     enter animation, say) carries no axis signal and does not block the
 *     mount, while a root that already MOVES on the axis does -- there the
 *     mount could only restate a move the family already has. Anything less
 *     is a refusal, published per cell with what the real render alone would
 *     have read, failed by `evaluate`, and the refused axis is read on the
 *     default mount alone. The resting axes are the four whose properties do
 *     not inherit (shape, rhythm, depth, motion); typography inherits, so
 *     every default root already moves with the tenant's type. States is
 *     admitted on its own two halves, under law 5.
 *  4. THE READING IS A STRICT SUPERSET. On the four resting axes the mount is
 *     read at REST, on its declared axes only, beside the default mount --
 *     never instead of it -- so nothing that moved before can stop moving,
 *     and no denominator changes.
 *  5. STATES IS NOT READ AT REST (S1). A row that declares `states` has its
 *     nodes read under both halves of the axis: the stamp half (every value
 *     the scene writes, on the nodes a mounted anatomy is stamped on --
 *     `[data-part]` and the top node) and the native half (the same depth
 *     passes, each node forced with its ancestor chain). The withholding laws
 *     are the default scene's, unchanged: the stamp enters only a rule whose
 *     gate carries a value the scene writes, a family whose forced pseudo
 *     drives a sibling has that variant withheld on its mount too, and a
 *     family unsettled under a pass is dropped with its mount. Law 3 holds per
 *     cell with states read as its two halves: the default mount must move on
 *     NEITHER half and the real render on at least one, or the row is refused
 *     there and published. A row that declares no resting axis is never read
 *     at rest; a row that does not declare `states` is never stamped, forced
 *     or read under a state -- so the four resting readings are the pre-S1
 *     ones to the node.
 *
 * A FAMILY MAY CARRY MORE THAN ONE ROW when its engine renders two static
 * configurations one mount cannot hold at once (a tooltip is interactive or it
 * is not): a row keyed apart names its `family`, both mounts are read as that
 * family's real render, and law 3 is decided over their union.
 *
 * AT MOST ONE ROW PER FAMILY DECLARES `states` (Fable S1 review, decision 2).
 * Law 3 over a union is sound for the resting axes, but the states halves are
 * published per family (`movedStamped`, `movedNative`): two states rows moving
 * on different halves would be two configurations conflated into one split.
 * Today the two-row families (tooltip, stats-grid) carry one resting row and
 * one states row, read on disjoint axes; a second states row is refused by the
 * roster door until per-row halves exist.
 *
 * `--no-real-render-mounts` reproduces the pre-lot reading on the same tree.
 */
export const REAL_RENDER_AXES = Object.freeze(['shape', 'rhythm', 'depth', 'motion', 'states']);

/** The axes a real-render mount is read on at rest: every admitted axis but `states` (law 5). */
export const REAL_RENDER_RESTING_AXES = Object.freeze(REAL_RENDER_AXES.filter((axis) => axis !== 'states'));

/** The family a roster row is a real render OF: its own key, unless it names another. */
export const realRenderFamily = (row, entry) => entry.family ?? row;

/**
 * THE CHART LEGEND SHAPE ROWS (S9, WO-EVI-02). D1 named chart-bullet,
 * chart-waterfall and chart-c identical-but-unreached on shape: the probe
 * mounts no node their corners are painted on. A ready chart given `legend`
 * renders those swatches, and S8 measured these rows reaching every one of
 * them -- then refused them, because the corners were authored literals the
 * dial could not move. S9 bound the literals to
 * `calc(<px> * var(--ds-radius-scale-normalized, 1))` (byte-identical at rest
 * in all 12 cells, 12x12 swatches never clamp across 0.75-1.25), and the rows
 * now qualify under law 3 in all four bithire/evnto cells (measured
 * 2026-10-01: default mounts still, real renders move, 0 refusals).
 */
const CHARTS_ROOT = 'src/components/patterns/visualization/charts';
const CHART_SCAFFOLD = `${CHARTS_ROOT}/presentation/scaffold/index.tsx`;
const BULLET_FAMILY = `${CHARTS_ROOT}/families/bullet/index.tsx`;
const WATERFALL_FAMILY = `${CHARTS_ROOT}/families/waterfall/index.tsx`;
const HISTOGRAM_FAMILY = `${CHARTS_ROOT}/families/histogram/index.tsx`;

const chartScaffoldStamps = () => [
  Object.freeze({ token: 'class:ds-chart-scaffold', stamp: "const scaffoldClassName = ['ds-chart-scaffold', className]", source: CHART_SCAFFOLD }),
  Object.freeze({ token: 'attr:data-part=chart-scaffold', stamp: 'data-part="chart-scaffold"', source: CHART_SCAFFOLD }),
  Object.freeze({ token: 'attr:data-state=ready', stamp: 'data-state="ready"', source: CHART_SCAFFOLD }),
];
const legendItem = (attributes, label) =>
  `<div data-part="legend-item"><span data-part="legend-swatch"${attributes}></span><span data-part="legend-label">${label}</span></div>`;

const CHART_LEGEND_SHAPE_ROWS = Object.freeze({
  'chart-bullet': Object.freeze({
    state: Object.freeze({
      name: 'a ready BulletChart given `legend` -- the range and value swatches carry the dialed family corners (:9, :13); the target tick stays square (:5)',
      source: BULLET_FAMILY,
      anchors: Object.freeze(['const legendNode = legend && canRender ? (']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['shape']),
    markup: '<div class="ds-chart-scaffold ds-chart-bullet" data-part="chart-scaffold" data-state="ready"><div data-part="legend">'
      + legendItem(' data-variant="range"', 'Poor') + legendItem(' data-variant="value"', 'Actual')
      + legendItem(' data-variant="target"', 'Target') + '</div></div>',
    stamps: Object.freeze([
      ...chartScaffoldStamps(),
      ...['range', 'value', 'target'].map((variant) => Object.freeze({
        token: `attr:data-variant=${variant}`,
        stamp: 'data-variant={item.variant}',
        resolves: Object.freeze([Object.freeze({ source: BULLET_FAMILY, text: `variant: '${variant}' }` })]),
      })),
    ]),
  }),
  'chart-waterfall': Object.freeze({
    state: Object.freeze({
      name: 'a ready WaterfallChart given `legend` -- every swatch carries `data-status`, so the dialed status corners (:11, :15) and the '
        + 'square total (:20) win and the bare :4 is never what the real render paints',
      source: WATERFALL_FAMILY,
      anchors: Object.freeze(['const legendNode = legend ? (']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['shape']),
    markup: '<div class="ds-chart-scaffold ds-chart-waterfall" data-part="chart-scaffold" data-state="ready"><div data-part="legend">'
      + legendItem(' data-status="increase"', 'Increase') + legendItem(' data-status="decrease"', 'Decrease')
      + legendItem(' data-status="total"', 'Total') + '</div></div>',
    stamps: Object.freeze([
      ...chartScaffoldStamps(),
      ...[['increase', 'Increase'], ['decrease', 'Decrease'], ['total', 'Total']].map(([status, label]) => Object.freeze({
        token: `attr:data-status=${status}`,
        stamp: 'data-status={item.label.toLowerCase()}',
        resolves: Object.freeze([Object.freeze({ source: WATERFALL_FAMILY, text: `{ label: '${label}',` })]),
      })),
    ]),
  }),
  'chart-c-histogram-legend': Object.freeze({
    family: 'chart-c',
    state: Object.freeze({
      name: 'a ready Histogram given `legend` -- the histogram series swatch carries the dialed slice corner (:14); the mounted chart-c root is the sparkline',
      source: HISTOGRAM_FAMILY,
      anchors: Object.freeze(['const legendNode = legend ? (']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['shape']),
    markup: '<div class="ds-chart-scaffold ds-chart-histogram" data-part="chart-scaffold" data-state="ready"><div data-part="legend">'
      + '<div data-part="legend-item" data-series="histogram"><span data-part="legend-swatch"></span>'
      + '<span data-part="legend-label">Frequency</span></div></div></div>',
    stamps: Object.freeze(chartScaffoldStamps()),
  }),
});

const COLLAPSE_ENGINE = 'src/components/primitives/layout/collapse/engines/modern/index.tsx';
const FORM_ENGINE = 'src/components/primitives/inputs/form/engines/modern/index.tsx';
const TYPOGRAPHY_ENGINE = 'src/components/primitives/display/typography/engines/modern/index.tsx';
const TYPOGRAPHY_CONTRACT = 'src/components/primitives/display/typography/contracts/index.ts';
const AVATAR_ENGINE = 'src/components/primitives/display/avatar/engines/modern/index.tsx';
const AVATAR_CONTRACT = 'src/components/primitives/display/avatar/contracts/index.ts';
const IMAGE_ENGINE = 'src/components/primitives/display/image/engines/modern/index.tsx';
const BOX_ENGINE = 'src/components/primitives/layout/box/engines/modern/index.tsx';
const BOX_CONTRACT = 'src/components/primitives/layout/box/contracts/index.ts';
const FLOAT_BUTTON_ENGINE = 'src/components/primitives/navigation/float-button/engines/modern/index.tsx';
const FLOAT_BUTTON_CONTRACT = 'src/components/primitives/navigation/float-button/contracts/index.ts';

/**
 * THE SHAPE REACH ROWS (S10, WO-EVI-02). The SC1 census measured each family
 * a shape non-mover only because no mounted node carries its dial-read corner.
 * `collapse` is the DEFAULT render (`ghost = false`; the probe's root is the
 * ghost compound, whose panel corner is forced to 0). The rest are the DT's
 * prop-configuration ruling on the R2a/Flex precedent: a public prop the
 * engine ships, named and gated like any row -- `badge` is excluded as a fleet
 * truth, and `stepper-compounds` has no row here. Its clickable paint is NOT
 * dead (owner ruling 2026-10-01): it is reachable through the standalone
 * public `<StepperStep onClick>` path and unreachable through the container
 * path, because every Stepper engine flattens `Stepper.Step` children into
 * items and drops their `onClick`, so `.ds-stepper-step[data-clickable]` is
 * never rendered INSIDE a Stepper. Both paths are pinned in the suite and
 * measured in the stepper family tests; whether the standalone path joins
 * this roster is the DT's row decision, not this file's.
 * Each row declares shape alone, so every other axis reads as before.
 */
const SHAPE_REACH_ROWS = Object.freeze({
  collapse: Object.freeze({
    state: Object.freeze({
      name: 'a default Collapse (bordered, not ghost) with one Panel -- the panel carries the dial-read corner; the mounted root is the '
        + '`--ghost` compound, whose panel corner is forced to 0',
      source: COLLAPSE_ENGINE,
      anchors: Object.freeze(['ghost = false,', "className={`rottay-collapse${ghost ? ' rottay-collapse--ghost' : ''}"]),
      resolves: Object.freeze([
        Object.freeze({ source: 'src/components/primitives/layout/collapse/contracts/index.ts', text: 'bordered: true,' }),
      ]),
    }),
    axes: Object.freeze(['shape']),
    markup: '<div class="rottay-collapse" data-part="root" data-size="md"><div data-part="panel"></div></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-size=md',
        stamp: 'data-size={normalizeCollapseSize(size)}',
        resolves: Object.freeze([
          Object.freeze({ source: COLLAPSE_ENGINE, text: 'size = COLLAPSE_DEFAULTS.size,' }),
          Object.freeze({ source: 'src/components/primitives/layout/collapse/contracts/index.ts', text: "size: 'middle' as const," }),
          Object.freeze({ source: COLLAPSE_ENGINE, text: "    default:\n      return 'md';" }),
        ]),
      }),
    ]),
  }),
  'form-error-list': Object.freeze({
    family: 'form',
    state: Object.freeze({
      name: 'a default (vertical) Form with a field in error and a Form.ErrorList -- the list renders only while validation errors exist, '
        + 'and its `var(--ds-radius-lg)` corner is a separate rule from the depth graft the default scene holds',
      source: FORM_ENGINE,
      anchors: Object.freeze(['if (!errors || errors.length === 0) return null;', 'ErrorList: FormErrorList']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['shape']),
    markup: '<form role="form" class="ds-form ds-form--modern" data-part="root" data-layout="vertical">'
      + '<ul data-part="error-list" role="alert" class="ds-form-error-list ds-form-error-list--modern"><li data-part="error-item"></li></ul></form>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-layout=vertical',
        stamp: 'data-layout={adaptation.layout}',
        resolves: Object.freeze([
          Object.freeze({ source: FORM_ENGINE, text: 'layout = FORM_DEFAULTS.layout' }),
          Object.freeze({ source: 'src/components/primitives/inputs/form/contracts/index.ts', text: 'layout: \'vertical\',' }),
        ]),
      }),
    ]),
  }),
  'typography-code': Object.freeze({
    family: 'typography',
    state: Object.freeze({
      name: 'a Typography.Text given `as="code"` -- the engine renders `as` as the element, and the inline-code chip corner is gated on `:is(code)`',
      source: TYPOGRAPHY_ENGINE,
      anchors: Object.freeze(['export const ModernText = forwardRef<HTMLElement, TextProps>(', 'const Component = as;']),
      resolves: Object.freeze([Object.freeze({ source: TYPOGRAPHY_CONTRACT, text: "    | 'code'" })]),
    }),
    axes: Object.freeze(['shape']),
    markup: '<code class="rottay-typography rottay-typography--modern" data-part="root" data-color="default" data-size="md">code</code>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'tag:code',
        stamp: 'const Component = as;',
        resolves: Object.freeze([Object.freeze({ source: TYPOGRAPHY_CONTRACT, text: "    | 'code'" })]),
      }),
      Object.freeze({ token: 'attr:data-part=root', stamp: 'data-part={dataPart ?? "root"}' }),
      Object.freeze({
        token: 'attr:data-color=default',
        stamp: 'data-color={color}',
        resolves: Object.freeze([
          Object.freeze({ source: TYPOGRAPHY_ENGINE, text: 'color = TYPOGRAPHY_DEFAULTS.text.color,' }),
          Object.freeze({ source: TYPOGRAPHY_CONTRACT, text: "color: 'default' as const," }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-size=md',
        stamp: 'data-size={size}',
        resolves: Object.freeze([
          Object.freeze({ source: TYPOGRAPHY_ENGINE, text: 'const size = scalarOrUndefined(sizeProp) ?? TYPOGRAPHY_DEFAULTS.text.size;' }),
          Object.freeze({ source: TYPOGRAPHY_CONTRACT, text: "size: 'md' as const," }),
        ]),
      }),
    ]),
  }),
  'avatar-square': Object.freeze({
    family: 'avatar',
    state: Object.freeze({
      name: 'an Avatar given `shape="square"` -- the mask corner reads `var(--ds-radius-md)`; the default circle paints a fixed pill',
      source: AVATAR_ENGINE,
      anchors: Object.freeze(['data-shape={shape}', 'data-part="mask"']),
      resolves: Object.freeze([Object.freeze({ source: AVATAR_CONTRACT, text: 'shape?: AvatarShape;' })]),
    }),
    axes: Object.freeze(['shape']),
    markup: '<div class="rottay-avatar rottay-avatar--modern" data-part="root" data-variant="default" data-shape="square" data-size="md">'
      + '<div data-part="mask"></div></div>',
    stamps: Object.freeze([
      Object.freeze({ token: 'attr:data-part=root', stamp: '{...partAttributes(dataPart ?? "root", isInteractive ? interaction : {})}' }),
      Object.freeze({
        token: 'attr:data-variant=default',
        stamp: 'data-variant={variant}',
        resolves: Object.freeze([
          Object.freeze({ source: AVATAR_ENGINE, text: 'variant: variantProp = AVATAR_DEFAULTS.variant,' }),
          Object.freeze({ source: AVATAR_CONTRACT, text: "variant: 'default' as const," }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-shape=square',
        stamp: 'data-shape={shape}',
        resolves: Object.freeze([
          Object.freeze({ source: 'src/foundation/contracts/kernel/common/index.ts', text: "export type Shape = 'circle' | 'square' | 'rounded';" }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-size=md',
        stamp: 'data-size={size}',
        resolves: Object.freeze([
          Object.freeze({ source: AVATAR_ENGINE, text: 'size = AVATAR_DEFAULTS.size,' }),
          Object.freeze({ source: AVATAR_CONTRACT, text: "size: 'md' as const," }),
        ]),
      }),
    ]),
  }),
  'image-radius': Object.freeze({
    family: 'image',
    state: Object.freeze({
      name: 'an Image given `radius="lg"` (the engine\'s own usage example) -- the root stamps the rung, the gate its dial-read corner sits '
        + 'behind; the default `none` paints 0',
      source: IMAGE_ENGINE,
      anchors: Object.freeze(['radius = IMAGE_DEFAULTS.radius as ImageRadius,', 'data-radius={radius}']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['shape']),
    markup: '<div class="rottay-image rottay-image--modern" data-radius="lg" data-part="root"></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-radius=lg',
        stamp: 'data-radius={radius}',
        resolves: Object.freeze([
          Object.freeze({ source: 'src/components/primitives/display/image/contracts/index.ts', text: "radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';" }),
        ]),
      }),
      Object.freeze({ token: 'attr:data-part=root', stamp: "{...partAttributes(dataPart ?? 'root', interaction)}" }),
    ]),
  }),
  'box-rounded': Object.freeze({
    family: 'box',
    state: Object.freeze({
      name: 'a Box given `rounded="md"` -- a radius rung is the only configuration that stamps `data-radius`, the gate every corner rule of '
        + 'the family sits behind; the default Box writes none',
      source: BOX_ENGINE,
      anchors: Object.freeze(['const radiusValue = props.borderRadius || props.rounded;', '!callerOwnsRadius && radiusValue && radiusValue !== "none"']),
      resolves: Object.freeze([Object.freeze({ source: BOX_CONTRACT, text: 'rounded?: BoxBorderRadius;' })]),
    }),
    axes: Object.freeze(['shape']),
    markup: '<div data-part="box-surface" class="rottay-box rottay-box--modern" data-radius="md" data-component="box"></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'tag:div',
        stamp: 'React.createElement(ElementType, elementProps)',
        resolves: Object.freeze([
          Object.freeze({ source: BOX_ENGINE, text: 'as: Component = BOX_DEFAULTS.as,' }),
          Object.freeze({ source: BOX_CONTRACT, text: 'as: "div",' }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-radius=md',
        stamp: '? radiusValue',
        resolves: Object.freeze([Object.freeze({ source: BOX_CONTRACT, text: 'export type BoxBorderRadius =\n  | "none"\n  | "xs"\n  | "sm"\n  | "md"' })]),
      }),
    ]),
  }),
  'float-button-square': Object.freeze({
    family: 'float-button',
    state: Object.freeze({
      name: 'a standalone FloatButton given `shape="square"` (button branch, type default) -- the trigger corner reads `var(--ds-radius-lg)`; '
        + 'the default circle paints a fixed 50%',
      source: FLOAT_BUTTON_ENGINE,
      anchors: Object.freeze(['const buttonElement = href ? (']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['shape']),
    markup: '<button type="button" class="rottay-float-button rottay-float-button--modern" data-part="trigger" data-variant="default" data-shape="square">'
      + '</button>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-variant=default',
        stamp: 'data-variant={type}',
        resolves: Object.freeze([
          Object.freeze({ source: FLOAT_BUTTON_ENGINE, text: 'type = FLOAT_BUTTON_DEFAULTS.type,' }),
          Object.freeze({ source: FLOAT_BUTTON_CONTRACT, text: 'type: \'default\' as const,' }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-shape=square',
        stamp: 'data-shape={shape}',
        resolves: Object.freeze([Object.freeze({ source: FLOAT_BUTTON_CONTRACT, text: "shape?: 'circle' | 'square';" })]),
      }),
    ]),
  }),
});

const SKELETON_ENGINE = 'src/components/primitives/feedback/skeleton/engines/modern/index.tsx';
const SKELETON_CONTRACT = 'src/components/primitives/feedback/skeleton/contracts/index.ts';
const SKELETON_ANATOMY = 'src/components/primitives/feedback/skeleton/runtime/anatomy-renderer/index.tsx';
const TOOLTIP_ENGINE = 'src/components/primitives/display/tooltip/engines/modern/index.tsx';
const TOOLTIP_CONTRACT = 'src/components/primitives/display/tooltip/contracts/index.ts';
const DROPDOWN_ENGINE = 'src/components/primitives/overlay/dropdown/engines/modern/index.tsx';
const DROPDOWN_CONTRACT = 'src/components/primitives/overlay/dropdown/contracts/index.ts';

const SKELETON_ROWS_MARKUP = Array.from({ length: 4 }, () =>
  '<tr class="ds-skeleton-anatomy-rows" data-part="skeleton-row" data-loading="true" data-animation="shimmer" aria-hidden="true">'
  + '<td data-part="skeleton-cell"><span data-part="skeleton-bar" data-bone="line"></span></td></tr>').join('');

export const REAL_RENDER_MOUNTS = Object.freeze({
  skeleton: Object.freeze({
    state: Object.freeze({
      name: 'the default text variant with `avatar`, `title` and `paragraph` -- the blocks a loading region shows; '
        + 'the mounted root is the shape-variant block, whose radius is an inline hatch the scene never stamps',
      source: SKELETON_ENGINE,
      anchors: Object.freeze(['className={`rottay-skeleton-wrapper rottay-skeleton--modern ${className}`}']),
      resolves: Object.freeze([Object.freeze({ source: SKELETON_CONTRACT, text: "variant: 'text'," })]),
    }),
    axes: Object.freeze(['shape', 'rhythm', 'motion']),
    markup: '<div data-part="root" class="rottay-skeleton-wrapper rottay-skeleton--modern" aria-hidden="true">'
      + '<div data-part="avatar" data-animation="pulse" style="width:40px;height:40px;--ds-skeleton-avatar-radius:50%"></div>'
      + '<div data-part="content"><div data-part="title" data-animation="pulse"></div>'
      + '<div data-part="line" data-animation="pulse"></div><div data-part="line" data-animation="pulse"></div>'
      + '<div data-part="line" data-animation="pulse"></div></div></div>',
    stamps: Object.freeze([
      Object.freeze({ token: 'attr:data-part=root', stamp: "data-part={dataPart ?? 'root'}" }),
      Object.freeze({
        token: 'attr:data-animation=pulse',
        stamp: 'data-animation={resolvedStyle}',
        resolves: Object.freeze([
          Object.freeze({ source: SKELETON_ENGINE, text: "(animation === 'pulse' ? 'pulse' : 'shimmer')" }),
          Object.freeze({ source: SKELETON_CONTRACT, text: "animation: 'pulse'," }),
        ]),
      }),
      Object.freeze({
        token: 'style:width=40px',
        stamp: 'width: avatarSize,',
        resolves: Object.freeze([Object.freeze({ source: SKELETON_CONTRACT, text: 'avatarSize: 40,' })]),
      }),
      Object.freeze({
        token: 'style:height=40px',
        stamp: 'height: avatarSize,',
        resolves: Object.freeze([Object.freeze({ source: SKELETON_CONTRACT, text: 'avatarSize: 40,' })]),
      }),
      Object.freeze({
        token: 'style:--ds-skeleton-avatar-radius=50%',
        stamp: "'--ds-skeleton-avatar-radius': avatarShape === 'circle' ? '50%'",
        resolves: Object.freeze([Object.freeze({ source: SKELETON_CONTRACT, text: "avatarShape: 'circle'," })]),
      }),
    ]),
  }),
  'skeleton-anatomy': Object.freeze({
    state: Object.freeze({
      name: "the public `mode=\"table-rows\"` render in a consumer's own table -- the rows ARE the skeleton, so its "
        + 'cell rhythm lives on a root the block-mode root never contains',
      source: SKELETON_ANATOMY,
      anchors: Object.freeze(["if (mode === 'table-rows') {"]),
      resolves: Object.freeze([
        Object.freeze({ source: 'src/components/primitives/feedback/skeleton/index.tsx', text: 'AnatomySkeleton,' }),
      ]),
    }),
    axes: Object.freeze(['rhythm']),
    host: Object.freeze(['table', 'tbody']),
    markup: SKELETON_ROWS_MARKUP,
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-loading=true',
        stamp: "data-loading={loading ? 'true' : 'false'}",
        resolves: Object.freeze([Object.freeze({ source: SKELETON_ANATOMY, text: '{ loading = true, busy = true,' })]),
      }),
      Object.freeze({
        token: 'attr:data-animation=shimmer',
        stamp: 'data-animation={animationStyle}',
        resolves: Object.freeze([
          Object.freeze({ source: SKELETON_ANATOMY, text: "resolvedAnimation === 'pulse' ? 'pulse' : 'shimmer'" }),
          Object.freeze({ source: SKELETON_ANATOMY, text: ": 'wave');" }),
        ]),
      }),
    ]),
  }),
  tooltip: Object.freeze({
    state: Object.freeze({
      name: 'the present bubble of a default tooltip (anchor-css branch: inline under its root) -- the node that '
        + 'carries radius, padding, elevation and the enter transition',
      source: TOOLTIP_ENGINE,
      anchors: Object.freeze([
        'hasRenderableContent &&\n      present &&\n      mounted ? (',
        'strategy === "anchor-css" ? (\n          bubbleNode',
      ]),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['shape', 'rhythm', 'depth', 'motion']),
    markup: '<div class="ds-tooltip ds-tooltip--modern" data-part="root" data-disabled="false" data-open="true" '
      + 'data-trigger="hover"><div role="tooltip" class="ds-tooltip-bubble" data-part="bubble" data-tone="default" '
      + 'data-variant="bordered" data-placement="top" data-preferred-placement="top" data-radius="md" '
      + 'data-interactive="false" data-has-shortcut="false" data-has-arrow="true" data-arrow-tracked="false" '
      + 'data-touch-behavior="long-press" data-open="true" data-layer-kind="tooltip">'
      + '<div data-part="content">Tooltip</div><span data-part="arrow" aria-hidden="true"></span></div></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-disabled=false',
        stamp: 'data-disabled={disabled ? "true" : "false"}',
        resolves: Object.freeze([Object.freeze({ source: TOOLTIP_CONTRACT, text: 'disabled: false,' })]),
      }),
      Object.freeze({
        token: 'attr:data-open=true',
        stamp: 'data-open={isVisible ? "true" : "false"}',
        resolves: Object.freeze([Object.freeze({ source: TOOLTIP_ENGINE, text: 'const isVisible = isControlled ? visible : internalVisible;' })]),
      }),
      Object.freeze({
        token: 'attr:data-trigger=hover',
        stamp: 'data-trigger={Array.from(triggers).join(" ")}',
        resolves: Object.freeze([Object.freeze({ source: TOOLTIP_CONTRACT, text: 'trigger: "hover" as const,' })]),
      }),
      Object.freeze({ token: 'attr:role=tooltip', stamp: 'role={interactive ? "dialog" : "tooltip"}' }),
      Object.freeze({
        token: 'attr:data-tone=default',
        stamp: 'data-tone={color}',
        resolves: Object.freeze([Object.freeze({ source: TOOLTIP_CONTRACT, text: 'color: "default" as const,' })]),
      }),
      Object.freeze({
        token: 'attr:data-variant=bordered',
        stamp: 'data-variant={recipe}',
        resolves: Object.freeze([Object.freeze({ source: TOOLTIP_CONTRACT, text: 'recipe: "bordered" as const,' })]),
      }),
      Object.freeze({
        token: 'attr:data-placement=top',
        stamp: 'data-placement={placementAttribute}',
        resolves: Object.freeze([Object.freeze({ source: TOOLTIP_CONTRACT, text: 'placement: "top" as const,' })]),
      }),
      Object.freeze({
        token: 'attr:data-preferred-placement=top',
        stamp: 'data-preferred-placement={preferredPlacementAttribute}',
        resolves: Object.freeze([Object.freeze({ source: TOOLTIP_CONTRACT, text: 'placement: "top" as const,' })]),
      }),
      Object.freeze({
        token: 'attr:data-radius=md',
        stamp: 'data-radius={radius}',
        resolves: Object.freeze([Object.freeze({ source: TOOLTIP_CONTRACT, text: 'radius: "md" as const,' })]),
      }),
      Object.freeze({
        token: 'attr:data-interactive=false',
        stamp: 'data-interactive={interactive}',
        resolves: Object.freeze([Object.freeze({ source: TOOLTIP_ENGINE, text: 'interactive = false,' })]),
      }),
      Object.freeze({ token: 'attr:data-has-shortcut=false', stamp: 'data-has-shortcut={Boolean(shortcut)}' }),
      Object.freeze({
        token: 'attr:data-has-arrow=true',
        stamp: 'data-has-arrow={Boolean(arrow)}',
        resolves: Object.freeze([Object.freeze({ source: TOOLTIP_CONTRACT, text: 'arrow: true,' })]),
      }),
      Object.freeze({ token: 'attr:data-arrow-tracked=false', stamp: 'data-arrow-tracked={arrowOffset ? "true" : "false"}' }),
      Object.freeze({
        token: 'attr:data-touch-behavior=long-press',
        stamp: 'data-touch-behavior={touchBehavior}',
        resolves: Object.freeze([Object.freeze({ source: TOOLTIP_CONTRACT, text: 'touchBehavior: "long-press" as const,' })]),
      }),
    ]),
  }),
  dropdown: Object.freeze({
    state: Object.freeze({
      name: 'the open menu of a default dropdown (in-tree surface: no `getPopupContainer`) with a group label, two '
        + 'items and a divider -- the surface and items carry radius, padding, elevation and the enter animation',
      source: DROPDOWN_ENGINE,
      anchors: Object.freeze([
        'const { shouldRender, dataState, ref: presenceRef } = usePresence(isOpen && hasItems);',
        'const surface = shouldRender ? (',
        ') : surface}',
      ]),
      resolves: Object.freeze([
        Object.freeze({ source: 'src/graphics/motion/react/runtime/presence/index.ts', text: "dataState: present ? 'open' : 'closed'," }),
      ]),
    }),
    axes: Object.freeze(['shape', 'rhythm', 'depth', 'motion']),
    markup: '<div data-part="trigger" data-open="true" data-placement="bottomLeft" class="ds-dropdown ds-dropdown--modern">'
      + '<span data-part="trigger-content"></span>'
      + '<div data-part="surface" data-open="true" data-placement="bottomLeft" class="ds-dropdown-surface">'
      + '<ul role="menu" data-part="menu" aria-orientation="vertical">'
      + '<li role="presentation" data-part="group-label" data-depth="0"><span>Group</span></li>'
      + '<li role="none" data-part="item-shell" data-depth="0"><button type="button" role="menuitem" data-part="item" '
      + 'data-tone="neutral"><span data-part="selection-indicator" aria-hidden="true"></span>'
      + '<span data-part="label">First</span></button></li>'
      + '<li role="none" data-part="item-shell" data-depth="0"><button type="button" role="menuitem" data-part="item" '
      + 'data-tone="neutral"><span data-part="selection-indicator" aria-hidden="true"></span>'
      + '<span data-part="label">Second</span></button></li>'
      + '<li role="separator" data-part="divider" data-depth="0"></li></ul></div></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-open=true',
        stamp: Object.freeze(["data-open={isOpen ? 'true' : 'false'}", "data-open={dataState === 'open' ? 'true' : 'false'}"]),
      }),
      Object.freeze({
        token: 'attr:data-placement=bottomLeft',
        stamp: Object.freeze(['data-placement={placement}', 'data-placement={surfacePlacement}']),
        resolves: Object.freeze([
          Object.freeze({ source: DROPDOWN_CONTRACT, text: "placement: 'bottomLeft'," }),
          Object.freeze({ source: DROPDOWN_ENGINE, text: 'const surfacePlacement = portalHost ? resolvedPlacement : placement;' }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-depth=0',
        stamp: 'data-depth={depth}',
        resolves: Object.freeze([Object.freeze({ source: DROPDOWN_ENGINE, text: 'onClick, depth = 0 }' })]),
      }),
      Object.freeze({ token: 'attr:data-part=item', stamp: "{...partAttributes('item', interaction.state)}" }),
      Object.freeze({ token: 'attr:data-tone=neutral', stamp: "data-tone={item.danger ? 'danger' : 'neutral'}" }),
    ]),
  }),
  'column-menu': Object.freeze({
    state: Object.freeze({
      name: 'the open panel of a default column menu (Popover surface carrying the family overlay class) with one visible and one hidden column -- the surface, count pill and rows carry radius, keyline and elevation; '
        + 'the engine focuses the panel on open, so its focus ring (`--ds-focus-ring-width`) is the states reading (S7)',
      source: 'src/components/structures/workspace/column-menu/index.tsx',
      anchors: Object.freeze([
        'open={isOpen}',
        'overlayClassName="ds-structure ds-column-menu-panel"',
        'window.requestAnimationFrame(() => panelRef.current?.focus());',
      ]),
      resolves: Object.freeze([
        Object.freeze({
          source: 'src/components/primitives/overlay/popover/engines/modern/index.tsx',
          text: 'const surfaceNode = present && mounted ? (',
        }),
      ]),
    }),
    axes: Object.freeze(['shape', 'rhythm', 'depth', 'motion', 'states']),
    markup: '<div data-part="surface" class="ds-structure ds-column-menu-panel"><div data-part="panel">'
      + '<div data-part="header"><div><div data-part="header-copy"></div><div>'
      + '<div data-part="count-pill">1/2</div></div></div></div><div data-part="scroll-region"><div>'
      + '<div data-visible="true" data-part="row"><div data-part="row-content">Name</div></div>'
      + '<div data-visible="false" data-part="row"><div data-part="row-content">Owner</div></div></div>'
      + '</div><div data-part="footer"></div></div></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'tag:div',
        stamp: Object.freeze(['<Box', '<Flex']),
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/primitives/layout/box/engines/modern/index.tsx',
            text: 'as: Component = BOX_DEFAULTS.as,',
          }),
          Object.freeze({
            source: 'src/components/primitives/layout/box/contracts/index.ts',
            text: 'as: "div",',
          }),
          Object.freeze({
            source: 'src/components/primitives/layout/flex/engines/modern/index.tsx',
            text: '<div\n          // P-79: the default part precedes the spread',
          }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-part=surface',
        stamp: 'overlayClassName="ds-structure ds-column-menu-panel"',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/primitives/overlay/popover/engines/modern/index.tsx',
            text: 'data-part="surface"',
          }),
          Object.freeze({
            source: 'src/components/primitives/overlay/popover/engines/modern/index.tsx',
            text: 'className={overlayClassName || undefined}',
          }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-part=panel',
        stamp: '{...partAttributes("panel", panelInteraction.state)}',
      }),
      Object.freeze({
        token: 'attr:data-part=row',
        stamp: '{...partAttributes("row", interaction.state)}',
      }),
      Object.freeze({
        token: 'attr:data-visible=true',
        stamp: 'data-visible={isVisible}',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/structures/workspace/column-menu/index.tsx',
            text: 'const isVisible = draftVisible.includes(column.key);',
          }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-visible=false',
        stamp: 'data-visible={isVisible}',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/structures/workspace/column-menu/index.tsx',
            text: 'const isVisible = draftVisible.includes(column.key);',
          }),
        ]),
      }),
    ]),
  }),
  'column-settings': Object.freeze({
    state: Object.freeze({
      name: 'the default render: header and footer are written unconditionally under the root and carry the hairline rules',
      source: 'src/components/patterns/data/column-settings/engines/modern/index.tsx',
      anchors: Object.freeze(['<div data-part="header">', '<div data-part="footer">']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['depth']),
    markup: '<div class="ds-column-settings ds-column-settings--modern" data-part="root">'
      + '<div data-part="header"><span data-part="title">Columns</span></div>'
      + '<div data-part="list" role="list"></div><div data-part="footer"></div></div>',
    stamps: Object.freeze([]),
  }),
  'command-palette': Object.freeze({
    state: Object.freeze({
      name: 'the open palette (Modal surface carrying the palette classes) with two ungrouped items, the first active by default -- the search rule and the active ring',
      source: 'src/components/patterns/navigation/command-palette/engines/modern/index.tsx',
      anchors: Object.freeze(['open={open}', '<div data-part="search">']),
      resolves: Object.freeze([
        Object.freeze({
          source: 'src/components/primitives/feedback/modal/engines/modern/index.tsx',
          text: 'className={className || undefined}',
        }),
      ]),
    }),
    axes: Object.freeze(['depth']),
    markup: '<div class="ds-pattern-command-palette ds-engine-modern"><div data-part="content">'
      + '<div data-part="search"></div><div data-part="list" role="listbox"><div>'
      + '<div role="option" data-active="true" data-part="item"><div data-part="item-main">'
      + '<div data-part="item-text"><div data-part="label">Open</div></div></div></div>'
      + '<div role="option" data-active="false" data-part="item"><div data-part="item-main">'
      + '<div data-part="item-text"><div data-part="label">Close</div></div></div></div></div></div>'
      + '</div></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-part=item',
        stamp: '{...partAttributes(\'item\', state)}',
      }),
      Object.freeze({
        token: 'attr:data-active=true',
        stamp: 'data-active={active}',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/patterns/navigation/command-palette/engines/modern/index.tsx',
            text: 'const [activeIndex, setActiveIndex] = useState(0);',
          }),
          Object.freeze({
            source: 'src/components/patterns/navigation/command-palette/engines/modern/index.tsx',
            text: 'active={activeIndex === idx}',
          }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-active=false',
        stamp: 'data-active={active}',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/patterns/navigation/command-palette/engines/modern/index.tsx',
            text: 'active={activeIndex === idx}',
          }),
        ]),
      }),
    ]),
  }),
  'date-picker': Object.freeze({
    state: Object.freeze({
      name: 'the open calendar of a default DatePicker (date mode, `showToday`) beside its trigger -- the trigger input always carries `data-status`, and the panel carries the elevation and hairlines',
      source: 'src/components/primitives/inputs/date-picker/engines/modern/index.tsx',
      anchors: Object.freeze(['{isOpen && (', 'const PANEL_CLASS = \'ds-date-picker-panel ds-date-picker-panel--modern\';', '{showToday && (']),
      resolves: Object.freeze([
        Object.freeze({
          source: 'src/components/primitives/inputs/date-picker/engines/modern/index.tsx',
          text: 'showToday = true,',
        }),
      ]),
    }),
    axes: Object.freeze(['depth']),
    markup: '<div data-part="root" class="ds-date-picker ds-date-picker--modern">'
      + '<input type="text" data-part="trigger-input" data-status="default"></div><div data-part="popup">'
      + '<div data-part="panel" data-mode="date" class="ds-date-picker-panel ds-date-picker-panel--modern" role="dialog">'
      + '<div data-part="header"></div><div data-part="grid" role="grid">'
      + '<div data-part="week-row" role="row">'
      + '<button type="button" data-part="cell" role="gridcell">1</button>'
      + '<button type="button" data-part="cell" role="gridcell">2</button></div></div>'
      + '<div data-part="footer"><button type="button" data-part="today-button">Today</button></div>'
      + '</div></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-part=trigger-input',
        stamp: '{...partAttributes(\'trigger-input\', trigger.state)}',
      }),
      Object.freeze({
        token: 'attr:data-status=default',
        stamp: 'data-status={status ?? \'default\'}',
      }),
      Object.freeze({
        token: 'attr:data-part=cell',
        stamp: '{...partAttributes(\'cell\', cell.state)}',
      }),
      Object.freeze({
        token: 'attr:data-part=today-button',
        stamp: '{...partAttributes(\'today-button\', today.state)}',
      }),
    ]),
  }),
  'drawer-compounds': Object.freeze({
    state: Object.freeze({
      name: 'a default Drawer.Header given `onClose` (closable defaults true) -- the close button that carries the compound radius and its feedback transition lives only inside that header',
      source: 'src/components/primitives/feedback/drawer/compound/header/index.tsx',
      anchors: Object.freeze(['{closable && onClose && (']),
      resolves: Object.freeze([
        Object.freeze({
          source: 'src/components/primitives/feedback/drawer/compound/header/index.tsx',
          text: 'closable = true,',
        }),
      ]),
    }),
    axes: Object.freeze(['shape', 'motion', 'states']),
    markup: '<div data-part="header" data-divider="false" class="ds-drawer-header">'
      + '<div data-part="title" role="heading">Settings</div>'
      + '<button type="button" data-part="close-button" class="ds-drawer-close"></button></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-divider=false',
        stamp: 'data-divider={divider ? \'true\' : \'false\'}',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/primitives/feedback/drawer/compound/header/index.tsx',
            text: 'divider = false,',
          }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-part=close-button',
        stamp: '{...partAttributes(\'close-button\', close.state)}',
      }),
    ]),
  }),
  'edit-fields': Object.freeze({
    state: Object.freeze({
      name: 'the canonical inline editor: a group holding one editor with an icon header, a primary grid with one field, and the footer -- every node below the group root; '
        + 'the editor icon\'s keyline is the family\'s depth paint (R3: the default root is flat on depth)',
      source: 'src/components/structures/record/edit-fields/index.tsx',
      anchors: Object.freeze(['{!headerless ? (', '{Icon ? (', '{hasFooter ? <InlineEditFooter {...footerProps}>{footer}</InlineEditFooter> : null}']),
      resolves: Object.freeze([
        Object.freeze({
          source: 'src/components/structures/record/edit-fields/index.tsx',
          text: 'headerless = false,',
        }),
      ]),
    }),
    axes: Object.freeze(['shape', 'rhythm', 'depth', 'motion']),
    markup: '<div class="ds-structure ds-edit-fields" data-part="group">'
      + '<div class="ds-structure ds-edit-fields" data-part="editor"><div data-part="editor-header">'
      + '<div data-part="editor-lead"><div data-part="editor-icon"></div><div data-part="editor-copy">'
      + '</div></div></div><div class="ds-structure ds-edit-fields" data-part="grid" data-kind="primary">'
      + '<div class="ds-structure ds-edit-fields" data-part="field" data-requirement="recommended">'
      + '<div data-part="field-label-row"><label data-part="field-label">Name</label></div></div></div>'
      + '<div class="ds-structure ds-edit-fields" data-part="footer" data-saving="false">'
      + '<div data-part="footer-actions"></div></div></div></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'tag:div',
        stamp: Object.freeze(['<Stack', '<Box', '<Flex']),
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/primitives/layout/box/contracts/index.ts',
            text: 'as: "div",',
          }),
          Object.freeze({
            source: 'src/components/primitives/layout/stack/contracts/index.ts',
            text: 'as: "div",',
          }),
          Object.freeze({
            source: 'src/components/primitives/layout/flex/engines/modern/index.tsx',
            text: 'data-component="flex"',
          }),
        ]),
      }),
      Object.freeze({
        token: 'tag:label',
        stamp: 'as="label"',
      }),
      Object.freeze({
        token: 'attr:data-kind=primary',
        stamp: 'data-kind={kind}',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/structures/record/edit-fields/index.tsx',
            text: 'kind = \'primary\',',
          }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-requirement=recommended',
        stamp: 'data-requirement={requirement}',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/structures/record/edit-fields/index.tsx',
            text: 'requirement = \'recommended\',',
          }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-saving=false',
        stamp: 'data-saving={Boolean(isSaving)}',
      }),
    ]),
  }),
  'export-button': Object.freeze({
    state: Object.freeze({
      name: 'the open export panel (portalled menu) -- the node carrying the elevation and the open keyline',
      source: 'src/components/structures/workspace/export-button/index.tsx',
      anchors: Object.freeze(['{open && dropdownPos && (']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['depth']),
    markup: '<div data-part="panel" data-open="true" class="ds-structure ds-export-button-panel" role="menu">'
      + '</div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'tag:div',
        stamp: Object.freeze(['<Box', '<Flex']),
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/primitives/layout/box/engines/modern/index.tsx',
            text: 'as: Component = BOX_DEFAULTS.as,',
          }),
          Object.freeze({
            source: 'src/components/primitives/layout/box/contracts/index.ts',
            text: 'as: "div",',
          }),
          Object.freeze({
            source: 'src/components/primitives/layout/flex/engines/modern/index.tsx',
            text: '<div\n          // P-79: the default part precedes the spread',
          }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-open=true',
        stamp: 'data-open={open}',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/structures/workspace/export-button/index.tsx',
            text: '{open && dropdownPos && (',
          }),
        ]),
      }),
    ]),
  }),
  'feature-workspace-frame': Object.freeze({
    state: Object.freeze({
      name: 'the public `loading` render of a default frame (no navigation, fluid width) -- the three skeleton cards carry the card radius, the shimmer '
        + 'and (R3) the card keyline; the idle root never contains them',
      source: 'src/components/patterns/shell/feature-workspace-frame/engines/foundation/index.tsx',
      anchors: Object.freeze(['{loading ? (']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['shape', 'depth', 'motion']),
    markup: '<section class="ds-pattern-feature-workspace-frame" data-part="root" data-width="fluid" data-has-navigation="false" data-loading="true">'
      + '<div class="ds-feature-workspace-frame__frame" data-part="frame">'
      + '<div class="ds-feature-workspace-frame__content" data-part="content">'
      + '<div class="ds-feature-workspace-frame__skeleton" data-part="loading-skeleton" aria-hidden="true">'
      + '<span></span><span></span><span></span></div></div></div></section>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-width=fluid',
        stamp: 'data-width={width}',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/patterns/shell/feature-workspace-frame/engines/foundation/index.tsx',
            text: 'width = "fluid",',
          }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-has-navigation=false',
        stamp: 'data-has-navigation={navigation ? "true" : "false"}',
      }),
      Object.freeze({
        token: 'attr:data-loading=true',
        stamp: 'data-loading={loading ? "true" : "false"}',
      }),
    ]),
  }),
  'filter-panel': Object.freeze({
    state: Object.freeze({
      name: 'the option badge a select filter hands each option it enriches (no caller icon, no caller tone, wording matching no inference arm -> neutral) -- the node carrying the badge keyline',
      source: 'src/components/patterns/forms/filter-panel/engines/modern/index.tsx',
      anchors: Object.freeze(['options={filter.options?.map((option) => enrichFilterOption(filter, option)) ?? []}', 'icon: renderOptionIcon(filter, option),']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['depth']),
    markup: '<span aria-hidden="true" class="ds-pattern-filter-panel__option-icon" data-part="option-icon-badge" data-tone="neutral">'
      + '</span>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:aria-hidden=true',
        stamp: '<span\n      aria-hidden\n      className="ds-pattern-filter-panel__option-icon"',
      }),
      Object.freeze({
        token: 'attr:data-tone=neutral',
        stamp: 'data-tone={tone}',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/patterns/forms/filter-panel/engines/modern/index.tsx',
            text: '  return \'neutral\';\n}',
          }),
        ]),
      }),
    ]),
  }),
  'float-button': Object.freeze({
    state: Object.freeze({
      name: 'a default standalone FloatButton (button branch, type default, shape circle) -- the trigger that carries the elevation; the mounted root is the Group container',
      source: 'src/components/primitives/navigation/float-button/engines/modern/index.tsx',
      anchors: Object.freeze(['const buttonElement = href ? (']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['depth', 'states']),
    markup: '<button type="button" class="rottay-float-button rottay-float-button--modern" data-part="trigger" data-variant="default" data-shape="circle">'
      + '</button>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-variant=default',
        stamp: 'data-variant={type}',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/primitives/navigation/float-button/engines/modern/index.tsx',
            text: 'type = FLOAT_BUTTON_DEFAULTS.type,',
          }),
          Object.freeze({
            source: 'src/components/primitives/navigation/float-button/contracts/index.ts',
            text: 'type: \'default\' as const,',
          }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-shape=circle',
        stamp: 'data-shape={shape}',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/primitives/navigation/float-button/engines/modern/index.tsx',
            text: 'shape = FLOAT_BUTTON_DEFAULTS.shape,',
          }),
          Object.freeze({
            source: 'src/components/primitives/navigation/float-button/contracts/index.ts',
            text: 'shape: \'circle\' as const,',
          }),
        ]),
      }),
    ]),
  }),
  form: Object.freeze({
    state: Object.freeze({
      name: 'a default (vertical) Form with one labelled Form.Item carrying a `tooltip` -- the item, label and tooltip affordance are nodes the bare form root never contains',
      source: 'src/components/primitives/inputs/form/engines/modern/index.tsx',
      anchors: Object.freeze(['{tooltip && <FormItemTooltip tooltip={tooltip} />}', '{label && (']),
      resolves: Object.freeze([
        Object.freeze({
          source: 'src/components/primitives/inputs/form/contracts/index.ts',
          text: 'layout: \'vertical\',',
        }),
      ]),
    }),
    axes: Object.freeze(['rhythm', 'depth', 'motion']),
    markup: '<form role="form" class="ds-form ds-form--modern" data-part="root" data-layout="vertical">'
      + '<div class="ds-form-item ds-form-item--modern" data-part="item" data-layout="vertical" data-validation="neutral">'
      + '<label data-part="label"><span data-part="label-text">Name</span><span data-part="tooltip-icon">'
      + '</span></label><div data-part="field"><div data-part="control-row"><div data-part="control">'
      + '</div></div></div></div></form>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-layout=vertical',
        stamp: Object.freeze(['data-layout={adaptation.layout}', 'data-layout={layout}']),
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/primitives/inputs/form/engines/modern/index.tsx',
            text: 'layout = FORM_DEFAULTS.layout',
          }),
          Object.freeze({
            source: 'src/components/primitives/inputs/form/contracts/index.ts',
            text: 'layout: \'vertical\',',
          }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-validation=neutral',
        stamp: 'data-validation={feedbackStatus ?? \'neutral\'}',
      }),
      Object.freeze({
        token: 'attr:data-part=tooltip-icon',
        stamp: '{...partAttributes(\'tooltip-icon\', state)}',
      }),
    ]),
  }),
  'guided-draft-form': Object.freeze({
    state: Object.freeze({
      name: 'the default render: the title bar and the sticky-bottom submit bar under the surface root',
      source: 'src/components/surfaces/presentation/pages/forms/guided-draft-form/index.tsx',
      anchors: Object.freeze(['data-part="title-bar"', '<Box data-part="submit-bar" data-action-bar={actionBarPosture}>']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['depth']),
    markup: '<div class="ds-surface ds-guided-draft-form" data-part="root"><div data-part="title-bar">'
      + '<div data-part="title-copy"></div></div>'
      + '<div data-part="submit-bar" data-action-bar="sticky-bottom"><div data-part="submit-bar-panel">'
      + '</div></div></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'tag:div',
        stamp: Object.freeze(['<Stack', '<Box', '<Flex']),
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/primitives/layout/box/contracts/index.ts',
            text: 'as: "div",',
          }),
          Object.freeze({
            source: 'src/components/primitives/layout/stack/contracts/index.ts',
            text: 'as: "div",',
          }),
          Object.freeze({
            source: 'src/components/primitives/layout/flex/engines/modern/index.tsx',
            text: 'data-component="flex"',
          }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-action-bar=sticky-bottom',
        stamp: 'data-action-bar={actionBarPosture}',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/surfaces/presentation/pages/forms/guided-draft-form/index.tsx',
            text: 'actionBar: posture.actionBar ?? \'sticky-bottom\',',
          }),
        ]),
      }),
    ]),
  }),
  'image-compounds': Object.freeze({
    state: Object.freeze({
      name: 'the default `Image.Skeleton` (animate on, radius `none`) -- a standalone compound the mounted fallback root never contains; its pulse is the family\'s only motion paint',
      source: 'src/components/primitives/display/image/compound/skeleton/index.tsx',
      anchors: Object.freeze(['className={`rottay-image-skeleton ${className}`}']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['motion']),
    markup: '<div class="rottay-image-skeleton" data-part="skeleton" data-animate="true" style="--ds-image-resolved-radius:0" aria-hidden="true">'
      + '</div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-animate=true',
        stamp: 'data-animate={animate ? \'true\' : undefined}',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/primitives/display/image/compound/skeleton/index.tsx',
            text: 'animate = true,',
          }),
        ]),
      }),
      Object.freeze({
        token: 'style:--ds-image-resolved-radius=0',
        stamp: '\'--ds-image-resolved-radius\': radiusValue,',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/primitives/display/image/compound/skeleton/index.tsx',
            text: 'radius = \'none\',',
          }),
          Object.freeze({
            source: 'src/components/primitives/display/image/contracts/index.ts',
            text: 'none: \'0\',',
          }),
        ]),
      }),
    ]),
  }),
  'modal-compounds': Object.freeze({
    state: Object.freeze({
      name: 'the default Modal.CloseButton (size md) -- rendered by every Modal.Header given `onClose` (closable defaults true) and exported as Modal.CloseButton',
      source: 'src/components/primitives/feedback/modal/compound/header/close-button/index.tsx',
      anchors: Object.freeze(['export const ModalCloseButton = forwardRef']),
      resolves: Object.freeze([
        Object.freeze({
          source: 'src/components/primitives/feedback/modal/compound/header/index.tsx',
          text: '{closable && onClose && (\n          <ModalCloseButton onClose={onClose} />',
        }),
        Object.freeze({
          source: 'src/components/primitives/feedback/modal/compound/header/index.tsx',
          text: 'closable = true,',
        }),
      ]),
    }),
    axes: Object.freeze(['shape', 'motion', 'states']),
    markup: '<button type="button" data-part="close-button" data-size="md" class="ds-modal-close"></button>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-part=close-button',
        stamp: '{...partAttributes(\'close-button\', interaction.state)}',
      }),
      Object.freeze({
        token: 'attr:data-size=md',
        stamp: 'data-size={size}',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/primitives/feedback/modal/compound/header/close-button/index.tsx',
            text: 'size = \'md\',',
          }),
        ]),
      }),
    ]),
  }),
  presence: Object.freeze({
    state: Object.freeze({
      name: 'a LiveCursor (the collaboration cursor the presence pattern exports) -- its name badge carries the radius and elevation, and exists only under the cursor root',
      source: 'src/components/patterns/communication/presence/index.tsx',
      anchors: Object.freeze(['export function LiveCursor({']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['shape', 'depth']),
    markup: '<div class="ds-presence-live-cursor" data-part="root" aria-hidden="true">'
      + '<div data-part="cursor-badge">Ana</div></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'tag:div',
        stamp: '<Box',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/primitives/layout/box/engines/modern/index.tsx',
            text: 'as: Component = BOX_DEFAULTS.as,',
          }),
          Object.freeze({
            source: 'src/components/primitives/layout/box/contracts/index.ts',
            text: 'as: "div",',
          }),
        ]),
      }),
    ]),
  }),
  'search-command-bar': Object.freeze({
    state: Object.freeze({
      name: 'the default render: the search shell is written unconditionally and always stamps `data-voice-status` (idle before the voice hook reports support), the gate its radius, keyline and elevation sit behind',
      source: 'src/components/structures/workspace/search-command-bar/index.tsx',
      anchors: Object.freeze(['data-part="search-shell"', 'data-voice-status={voiceStatusForSkin}']),
      resolves: Object.freeze([
        Object.freeze({
          source: 'src/infrastructure/runtime/application/automation/voice/composition/react/input/index.ts',
          text: 'useState<VoiceStatus>(\'unsupported\')',
        }),
      ]),
    }),
    axes: Object.freeze(['shape', 'depth']),
    markup: '<div data-part="root" data-embedded="false" data-editorial-tech="false" data-has-top-rail="false" class="ds-structure ds-search-command-bar">'
      + '<div data-part="frame"><div data-part="bar-row"><div data-part="input-column">'
      + '<div data-part="search-shell" class="ds-search-command-bar__search-shell" data-voice-status="idle" data-voice-active="false" data-editorial-tech="false" data-embedded="false">'
      + '<div data-part="search-icon" class="ds-search-command-bar__search-icon"></div></div></div></div>'
      + '</div></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'tag:div',
        stamp: Object.freeze(['<Box', '<Flex']),
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/primitives/layout/box/engines/modern/index.tsx',
            text: 'as: Component = BOX_DEFAULTS.as,',
          }),
          Object.freeze({
            source: 'src/components/primitives/layout/box/contracts/index.ts',
            text: 'as: "div",',
          }),
          Object.freeze({
            source: 'src/components/primitives/layout/flex/engines/modern/index.tsx',
            text: '<div\n          // P-79: the default part precedes the spread',
          }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-embedded=false',
        stamp: 'data-embedded={embedded}',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/structures/workspace/search-command-bar/index.tsx',
            text: 'surfaceVariant = \'default\',',
          }),
          Object.freeze({
            source: 'src/components/structures/workspace/search-command-bar/index.tsx',
            text: 'const embedded = surfaceVariant === \'embedded\';',
          }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-editorial-tech=false',
        stamp: 'data-editorial-tech={editorialTech}',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/structures/workspace/search-command-bar/index.tsx',
            text: 'layoutVariant = \'default\',',
          }),
          Object.freeze({
            source: 'src/components/structures/workspace/search-command-bar/index.tsx',
            text: 'const editorialTech = layoutVariant === \'editorial-tech\';',
          }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-has-top-rail=false',
        stamp: 'data-has-top-rail={Boolean(topRailSlot)}',
      }),
      Object.freeze({
        token: 'attr:data-voice-status=idle',
        stamp: 'data-voice-status={voiceStatusForSkin}',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/structures/workspace/search-command-bar/index.tsx',
            text: ': \'idle\';',
          }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-voice-active=false',
        stamp: 'data-voice-active={isVoiceActive}',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/structures/workspace/search-command-bar/index.tsx',
            text: 'const isVoiceActive = voiceStatus === \'listening\' || voiceStatus === \'transcribing\';',
          }),
        ]),
      }),
    ]),
  }),
  'stats-grid': Object.freeze({
    state: Object.freeze({
      name: 'a default loaded stats grid with one card (variant "default", no onClick) -- the card carries the default-variant elevation',
      source: 'src/components/patterns/data/stats-grid/engines/modern/index.tsx',
      anchors: Object.freeze(['data-variant={variant || "default"}']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['depth']),
    markup: '<div class="ds-pattern-stats-grid ds-engine-modern" data-part="root" data-loading="false" data-variant="default">'
      + '<div class="ds-stats-grid__card" data-part="card" data-variant="default" data-interactive="false">'
      + '<div data-part="label-row"><div data-part="statistic">Revenue</div></div></div></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-variant=default',
        stamp: Object.freeze(['data-variant={variant}', 'data-variant={variant || "default"}']),
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/patterns/data/stats-grid/engines/modern/index.tsx',
            text: 'variant = "default",',
          }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-interactive=false',
        stamp: 'data-interactive={onClick ? "true" : "false"}',
      }),
    ]),
  }),
  'time-picker': Object.freeze({
    state: Object.freeze({
      name: 'the open panel of a default TimePicker (`showNow`) beside its trigger -- the trigger input always carries `data-status`, and the panel carries the elevation and hairlines',
      source: 'src/components/primitives/inputs/time-picker/engines/modern/index.tsx',
      anchors: Object.freeze(['{isOpen && (', 'className="ds-time-picker-panel"', '{showNow && (']),
      resolves: Object.freeze([
        Object.freeze({
          source: 'src/components/primitives/inputs/time-picker/engines/modern/index.tsx',
          text: 'showNow = true,',
        }),
      ]),
    }),
    axes: Object.freeze(['depth']),
    markup: '<div data-part="root" class="ds-time-picker ds-time-picker--modern">'
      + '<input type="text" data-part="trigger-input" data-status="default"></div><div data-part="popup">'
      + '<div data-part="panel" class="ds-time-picker-panel" role="dialog"><div data-part="header">'
      + '<span data-part="column-label">HH</span></div><div data-part="columns">'
      + '<div data-part="time-column" role="listbox">'
      + '<button type="button" role="option" data-part="time-option">00</button>'
      + '<button type="button" role="option" data-part="time-option">01</button></div></div>'
      + '<div data-part="footer"><button type="button" data-part="now-button">Now</button></div></div>'
      + '</div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-part=trigger-input',
        stamp: '{...partAttributes(\'trigger-input\', trigger.state)}',
      }),
      Object.freeze({
        token: 'attr:data-status=default',
        stamp: 'data-status={status ?? \'default\'}',
      }),
      Object.freeze({
        token: 'attr:data-part=time-option',
        stamp: '{...partAttributes(\'time-option\', cell.state)}',
      }),
      Object.freeze({
        token: 'attr:data-part=now-button',
        stamp: '{...partAttributes(\'now-button\', action.state)}',
      }),
    ]),
  }),  // ---- S1: the named interactive configurations, read under the states axis
  // (law 5). Each is a static configuration the engine ships once a caller
  // hands it the named prop; the gate that makes the node state-gated is the
  // anchor, and every other token is literal or stamped from its default.
  'stats-grid-interactive': Object.freeze({
    family: 'stats-grid',
    state: Object.freeze({
      name: 'a loaded stats grid given `onStatClick` (variant "default") -- every card becomes a button, `data-interactive="true"`, the node the lift, press and ring rules are gated on',
      source: 'src/components/patterns/data/stats-grid/engines/modern/index.tsx',
      anchors: Object.freeze(['onClick={onStatClick ? () => onStatClick(stat) : undefined}', 'data-interactive={onClick ? "true" : "false"}']),
      resolves: Object.freeze([
        Object.freeze({ source: 'src/components/patterns/data/stats-grid/contracts/index.ts', text: 'onStatClick?: (stat: StatDef) => void;' }),
      ]),
    }),
    axes: Object.freeze(['states']),
    markup: '<div class="ds-pattern-stats-grid ds-engine-modern" data-part="root" data-loading="false" data-variant="default">'
      + '<div class="ds-stats-grid__card" data-part="card" data-variant="default" data-interactive="true" role="button" tabindex="0">'
      + '<div data-part="label-row"><div data-part="statistic">Revenue</div></div></div></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-variant=default',
        stamp: Object.freeze(['data-variant={variant}', 'data-variant={variant || "default"}']),
        resolves: Object.freeze([
          Object.freeze({ source: 'src/components/patterns/data/stats-grid/engines/modern/index.tsx', text: 'variant = "default",' }),
        ]),
      }),
      Object.freeze({ token: 'attr:data-interactive=true', stamp: 'data-interactive={onClick ? "true" : "false"}' }),
      Object.freeze({ token: 'attr:role=button', stamp: 'role={onClick ? "button" : undefined}' }),
      Object.freeze({ token: 'attr:tabindex=0', stamp: 'tabIndex={onClick ? 0 : undefined}' }),
    ]),
  }),
  'tooltip-interactive': Object.freeze({
    family: 'tooltip',
    state: Object.freeze({
      name: 'the present bubble of an `interactive` tooltip (anchor-css branch: inline under its root) -- a non-modal dialog, `data-interactive="true"`, the node the focus-within ring is gated on',
      source: TOOLTIP_ENGINE,
      anchors: Object.freeze([
        'hasRenderableContent &&\n      present &&\n      mounted ? (',
        'strategy === "anchor-css" ? (\n          bubbleNode',
        'data-interactive={interactive}',
      ]),
      resolves: Object.freeze([Object.freeze({ source: TOOLTIP_CONTRACT, text: 'interactive?: boolean;' })]),
    }),
    axes: Object.freeze(['states']),
    markup: '<div class="ds-tooltip ds-tooltip--modern" data-part="root" data-disabled="false" data-open="true" '
      + 'data-trigger="hover focus"><div role="dialog" tabindex="-1" class="ds-tooltip-bubble" data-part="bubble" data-tone="default" '
      + 'data-variant="bordered" data-placement="top" data-preferred-placement="top" data-radius="md" '
      + 'data-interactive="true" data-has-shortcut="false" data-has-arrow="true" data-arrow-tracked="false" '
      + 'data-touch-behavior="long-press" data-open="true" data-layer-kind="tooltip">'
      + '<div data-part="content">Tooltip</div><span data-part="arrow" aria-hidden="true"></span></div></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-disabled=false',
        stamp: 'data-disabled={disabled ? "true" : "false"}',
        resolves: Object.freeze([Object.freeze({ source: TOOLTIP_CONTRACT, text: 'disabled: false,' })]),
      }),
      Object.freeze({
        token: 'attr:data-open=true',
        stamp: 'data-open={isVisible ? "true" : "false"}',
        resolves: Object.freeze([Object.freeze({ source: TOOLTIP_ENGINE, text: 'const isVisible = isControlled ? visible : internalVisible;' })]),
      }),
      Object.freeze({
        token: 'attr:data-trigger=hover focus',
        stamp: 'data-trigger={Array.from(triggers).join(" ")}',
        resolves: Object.freeze([
          Object.freeze({ source: TOOLTIP_CONTRACT, text: 'trigger: "hover" as const,' }),
          Object.freeze({ source: TOOLTIP_ENGINE, text: 'if (requested.has("hover")) requested.add("focus");' }),
        ]),
      }),
      Object.freeze({ token: 'attr:role=dialog', stamp: 'role={interactive ? "dialog" : "tooltip"}' }),
      Object.freeze({ token: 'attr:tabindex=-1', stamp: 'tabIndex={interactive ? -1 : undefined}' }),
      Object.freeze({
        token: 'attr:data-tone=default',
        stamp: 'data-tone={color}',
        resolves: Object.freeze([Object.freeze({ source: TOOLTIP_CONTRACT, text: 'color: "default" as const,' })]),
      }),
      Object.freeze({
        token: 'attr:data-variant=bordered',
        stamp: 'data-variant={recipe}',
        resolves: Object.freeze([Object.freeze({ source: TOOLTIP_CONTRACT, text: 'recipe: "bordered" as const,' })]),
      }),
      Object.freeze({
        token: 'attr:data-placement=top',
        stamp: 'data-placement={placementAttribute}',
        resolves: Object.freeze([Object.freeze({ source: TOOLTIP_CONTRACT, text: 'placement: "top" as const,' })]),
      }),
      Object.freeze({
        token: 'attr:data-preferred-placement=top',
        stamp: 'data-preferred-placement={preferredPlacementAttribute}',
        resolves: Object.freeze([Object.freeze({ source: TOOLTIP_CONTRACT, text: 'placement: "top" as const,' })]),
      }),
      Object.freeze({
        token: 'attr:data-radius=md',
        stamp: 'data-radius={radius}',
        resolves: Object.freeze([Object.freeze({ source: TOOLTIP_CONTRACT, text: 'radius: "md" as const,' })]),
      }),
      Object.freeze({ token: 'attr:data-interactive=true', stamp: 'data-interactive={interactive}' }),
      Object.freeze({ token: 'attr:data-has-shortcut=false', stamp: 'data-has-shortcut={Boolean(shortcut)}' }),
      Object.freeze({
        token: 'attr:data-has-arrow=true',
        stamp: 'data-has-arrow={Boolean(arrow)}',
        resolves: Object.freeze([Object.freeze({ source: TOOLTIP_CONTRACT, text: 'arrow: true,' })]),
      }),
      Object.freeze({ token: 'attr:data-arrow-tracked=false', stamp: 'data-arrow-tracked={arrowOffset ? "true" : "false"}' }),
      Object.freeze({
        token: 'attr:data-touch-behavior=long-press',
        stamp: 'data-touch-behavior={touchBehavior}',
        resolves: Object.freeze([Object.freeze({ source: TOOLTIP_CONTRACT, text: 'touchBehavior: "long-press" as const,' })]),
      }),
    ]),
  }),
  'stats-header': Object.freeze({
    state: Object.freeze({
      name: 'a one-stat header whose stat carries `onClick` -- the stat card becomes a button, `data-clickable="true"`, the node the lift, press and ring rules are gated on (kernel-stamped); '
        + 'every stat card stamps `data-accent` (clickable or not), the gate its keyline sits behind -- the family\'s depth paint (R3)',
      source: 'src/components/structures/dashboard/stats-header/runtime/rendering/index.tsx',
      anchors: Object.freeze(['const isClickable = !!stat.onClick;', '<StatCard key={stat.key} stat={stat} />']),
      resolves: Object.freeze([
        Object.freeze({ source: 'src/components/structures/dashboard/stats-header/contracts/index.ts', text: 'onClick?: () => void;' }),
      ]),
    }),
    axes: Object.freeze(['depth', 'states']),
    markup: '<div class="ds-stats-header" data-part="root" data-columns="1" data-loading="false">'
      + '<div data-part="card-grid"><div data-part="stat-card" data-accent="primary" data-clickable="true" role="button" tabindex="0">'
      + '</div></div></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-columns=1',
        stamp: 'data-columns={columns}',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/structures/dashboard/stats-header/runtime/rendering/index.tsx',
            text: 'const columns = Math.max(Math.min(stats.length, 4), 1);',
          }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-loading=false',
        stamp: "data-loading={loading ? 'true' : 'false'}",
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/structures/dashboard/stats-header/runtime/rendering/index.tsx',
            text: 'function StatsHeaderImpl({ stats, loading = false }: StatsHeaderProps) {',
          }),
        ]),
      }),
      Object.freeze({ token: 'attr:data-part=stat-card', stamp: "{...partAttributes('stat-card', interaction.state)}" }),
      Object.freeze({
        token: 'attr:data-accent=primary',
        stamp: 'data-accent={accent}',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/structures/dashboard/stats-header/runtime/rendering/index.tsx',
            text: "const accent = stat.accentColor ?? 'primary';",
          }),
        ]),
      }),
      Object.freeze({ token: 'attr:data-clickable=true', stamp: 'data-clickable={isClickable}' }),
      Object.freeze({ token: 'attr:role=button', stamp: "role={isClickable ? 'button' : undefined}" }),
      Object.freeze({ token: 'attr:tabindex=0', stamp: 'tabIndex={isClickable ? 0 : undefined}' }),
    ]),
  }),
  'pattern-timeline': Object.freeze({
    state: Object.freeze({
      name: 'a one-item timeline given `onItemClick` (mode "left", ungrouped) -- the item card becomes a button, `data-clickable="true"`, the node the hover and ring rules are gated on',
      source: 'src/components/patterns/visualization/timeline/engines/modern/index.tsx',
      anchors: Object.freeze(['const clickable = Boolean(onItemClick);', 'data-clickable={clickable || undefined}']),
      resolves: Object.freeze([
        Object.freeze({ source: 'src/components/patterns/visualization/timeline/contracts/index.ts', text: 'onItemClick?: (item: TimelineItem<T>) => void;' }),
      ]),
    }),
    axes: Object.freeze(['states']),
    markup: '<div data-part="root" data-loading="false" data-empty="false" data-mode="left" data-grouped="false" class="ds-pattern-timeline ds-engine-modern">'
      + '<ul data-part="list" class="ds-timeline-modern__list"><li data-part="item" data-type="default" class="ds-timeline-modern__item">'
      + '<div data-part="item-card" data-side="left" data-clickable="true" class="ds-timeline-modern__item-card" role="button" tabindex="0">'
      + '<div data-part="item-meta" class="ds-timeline-modern__item-meta"></div>'
      + '<div data-part="item-title" class="ds-timeline-modern__item-title">Deployed</div></div></li></ul></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-mode=left',
        stamp: 'data-mode={mode}',
        resolves: Object.freeze([
          Object.freeze({ source: 'src/components/patterns/visualization/timeline/engines/modern/index.tsx', text: "mode = 'left'," }),
        ]),
      }),
      Object.freeze({ token: 'attr:data-grouped=false', stamp: 'data-grouped={Boolean(grouped)}' }),
      Object.freeze({ token: 'attr:data-type=default', stamp: "data-type={item.type ?? 'default'}" }),
      Object.freeze({
        token: 'attr:data-side=left',
        stamp: "data-side={isRight ? 'right' : 'left'}",
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/patterns/visualization/timeline/engines/modern/index.tsx',
            text: "const isRight = mode === 'right' || (isAlternate && index % 2 === 1);",
          }),
        ]),
      }),
      Object.freeze({ token: 'attr:data-clickable=true', stamp: 'data-clickable={clickable || undefined}' }),
      Object.freeze({ token: 'attr:role=button', stamp: "role: 'button' as const," }),
      Object.freeze({ token: 'attr:tabindex=0', stamp: 'tabIndex: 0,' }),
    ]),
  }),
  'activity-log': Object.freeze({
    state: Object.freeze({
      name: 'a loaded activity log given `onActivityClick` -- each item body becomes a button, `data-interactive="true"`, the node the ring rule is gated on (the Timeline wrappers between root and body are omitted: the rule is a descendant match)',
      source: 'src/components/patterns/communication/activity-log/engines/modern/index.tsx',
      anchors: Object.freeze(["data-interactive={onActivityClick ? 'true' : 'false'}"]),
      resolves: Object.freeze([
        Object.freeze({ source: 'src/components/patterns/communication/activity-log/contracts/index.ts', text: 'onActivityClick?: (activity: Activity) => void;' }),
      ]),
    }),
    axes: Object.freeze(['states']),
    markup: '<div data-part="root" class="ds-pattern-activity-log ds-engine-modern" data-loading="false">'
      + '<div data-part="item-body" data-interactive="true" role="button" tabindex="0"></div></div>',
    stamps: Object.freeze([
      Object.freeze({ token: 'attr:data-interactive=true', stamp: "data-interactive={onActivityClick ? 'true' : 'false'}" }),
      Object.freeze({ token: 'attr:role=button', stamp: "role={onActivityClick ? 'button' : undefined}" }),
      Object.freeze({ token: 'attr:tabindex=0', stamp: 'tabIndex={onActivityClick ? 0 : undefined}' }),
    ]),
  }),
  avatar: Object.freeze({
    state: Object.freeze({
      name: 'a default Avatar given `onClick` -- the root becomes a button, `data-interactive="true"`, the node (and its mask) the hover, press and ring rules are gated on (kernel-stamped)',
      source: 'src/components/primitives/display/avatar/engines/modern/index.tsx',
      anchors: Object.freeze(['const isInteractive = Boolean(clickable || onClick);']),
      resolves: Object.freeze([
        Object.freeze({ source: 'src/components/primitives/display/avatar/contracts/index.ts', text: 'onClick?: () => void;' }),
      ]),
    }),
    axes: Object.freeze(['states']),
    markup: '<div class="rottay-avatar rottay-avatar--modern" data-part="root" data-variant="default" data-shape="circle" data-size="md" '
      + 'data-interactive="true" role="button" tabindex="0"><div data-part="mask"></div></div>',
    stamps: Object.freeze([
      Object.freeze({ token: 'attr:data-part=root', stamp: '{...partAttributes(dataPart ?? "root", isInteractive ? interaction : {})}' }),
      Object.freeze({
        token: 'attr:data-variant=default',
        stamp: 'data-variant={variant}',
        resolves: Object.freeze([
          Object.freeze({ source: 'src/components/primitives/display/avatar/engines/modern/index.tsx', text: 'variant: variantProp = AVATAR_DEFAULTS.variant,' }),
          Object.freeze({ source: 'src/components/primitives/display/avatar/contracts/index.ts', text: "variant: 'default' as const," }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-shape=circle',
        stamp: 'data-shape={shape}',
        resolves: Object.freeze([
          Object.freeze({ source: 'src/components/primitives/display/avatar/engines/modern/index.tsx', text: 'shape = AVATAR_DEFAULTS.shape,' }),
          Object.freeze({ source: 'src/components/primitives/display/avatar/contracts/index.ts', text: "shape: 'circle' as const," }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-size=md',
        stamp: 'data-size={size}',
        resolves: Object.freeze([
          Object.freeze({ source: 'src/components/primitives/display/avatar/engines/modern/index.tsx', text: 'size = AVATAR_DEFAULTS.size,' }),
          Object.freeze({ source: 'src/components/primitives/display/avatar/contracts/index.ts', text: "size: 'md' as const," }),
        ]),
      }),
      Object.freeze({ token: 'attr:data-interactive=true', stamp: 'data-interactive={isInteractive ? "true" : undefined}' }),
      Object.freeze({ token: 'attr:role=button', stamp: 'role={isInteractive ? "button" : undefined}' }),
      Object.freeze({ token: 'attr:tabindex=0', stamp: 'tabIndex={isInteractive ? 0 : undefined}' }),
    ]),
  }),
  layout: Object.freeze({
    state: Object.freeze({
      name: 'a `collapsible` Layout.Sider (expanded by default, light theme) -- the trigger button exists only under that prop; its ring rule is the family\'s state paint, '
        + 'and its dial-read inline padding and block-start margin are the family\'s rhythm paint (R2a: the default root is flat on rhythm); '
        + 'its `var(--ds-radius-md)` corner is the family\'s shape paint (S10: the default root paints no radius)',
      source: 'src/components/primitives/layout/system/engines/modern/index.tsx',
      anchors: Object.freeze(['{collapsible && (']),
      resolves: Object.freeze([
        Object.freeze({ source: 'src/components/primitives/layout/system/engines/modern/index.tsx', text: 'collapsible = false,' }),
      ]),
    }),
    axes: Object.freeze(['shape', 'rhythm', 'states']),
    markup: '<aside class="rottay-layout-sider rottay-layout-sider--modern" data-part="sider" data-theme="light" data-collapsed="false">'
      + '<button type="button" data-part="trigger" data-collapsed="false" aria-expanded="true">'
      + '<span data-part="trigger-icon" aria-hidden="true"></span></button></aside>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-theme=light',
        stamp: 'data-theme={theme}',
        resolves: Object.freeze([
          Object.freeze({ source: 'src/components/primitives/layout/system/engines/modern/index.tsx', text: "theme = 'light'," }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-collapsed=false',
        stamp: "data-collapsed={isCollapsed ? 'true' : 'false'}",
        resolves: Object.freeze([
          Object.freeze({ source: 'src/components/primitives/layout/system/engines/modern/index.tsx', text: 'defaultCollapsed = false,' }),
        ]),
      }),
      Object.freeze({
        token: 'attr:aria-expanded=true',
        stamp: 'aria-expanded={!isCollapsed}',
        resolves: Object.freeze([
          Object.freeze({ source: 'src/components/primitives/layout/system/engines/modern/index.tsx', text: 'defaultCollapsed = false,' }),
        ]),
      }),
    ]),
  }),
  record: Object.freeze({
    state: Object.freeze({
      name: 'a RecordField given `href` and a non-empty value, inside a RecordFieldGrid -- the field (kernel-stamped, `focused` on any focus inside it) and the link body wrapping the anchor (kernel-stamped) are the nodes the ring and focus rules are gated on',
      source: 'src/components/structures/record/field/index.tsx',
      anchors: Object.freeze(['href && !resolved.empty ? (', "{...partAttributes('field', fieldInteraction.state)}"]),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['states']),
    markup: '<div class="ds-structure ds-record" data-part="field-grid" data-structure="record">'
      + '<div data-part="field" class="ds-structure ds-record" data-structure="record" data-span="1" data-empty="false" data-mono="false">'
      + '<div><div><div data-part="field-body"><div data-part="field-link-body"><a class="ds-record__field-link"></a></div></div></div></div>'
      + '</div></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'tag:div',
        stamp: Object.freeze(['<Stack', '<Box', '<Flex']),
        resolves: Object.freeze([
          Object.freeze({ source: 'src/components/primitives/layout/box/contracts/index.ts', text: 'as: "div",' }),
          Object.freeze({ source: 'src/components/primitives/layout/stack/contracts/index.ts', text: 'as: "div",' }),
          Object.freeze({ source: 'src/components/primitives/layout/flex/engines/modern/index.tsx', text: 'data-component="flex"' }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-part=field-grid',
        stamp: 'data-part="field-grid"',
        source: 'src/components/structures/record/field-grid/index.tsx',
      }),
      Object.freeze({ token: 'attr:data-part=field', stamp: "{...partAttributes('field', fieldInteraction.state)}" }),
      Object.freeze({
        token: 'attr:data-span=1',
        stamp: 'data-span={resolvedSpan}',
        resolves: Object.freeze([Object.freeze({ source: 'src/components/structures/record/field/index.tsx', text: 'span = 1,' })]),
      }),
      Object.freeze({ token: 'attr:data-empty=false', stamp: 'data-empty={resolved.empty}' }),
      Object.freeze({
        token: 'attr:data-mono=false',
        stamp: 'data-mono={mono}',
        resolves: Object.freeze([Object.freeze({ source: 'src/components/structures/record/field/index.tsx', text: 'mono = false,' })]),
      }),
      Object.freeze({ token: 'attr:data-part=field-link-body', stamp: "{...partAttributes('field-link-body', linkInteraction.state)}" }),
    ]),
  }),
  anchor: Object.freeze({
    state: Object.freeze({
      name: 'a default Anchor (vertical, affixed) holding one inactive Anchor.Link -- the link item is the node the ring rule is gated on; the default root is the anchor rail, which never contains it',
      source: 'src/components/primitives/navigation/anchor/engines/modern/index.tsx',
      anchors: Object.freeze(['<div data-part="link-wrapper">']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['states']),
    markup: '<div class="rottay-anchor rottay-anchor--modern" data-part="root" data-direction="vertical" data-affix="true" role="navigation">'
      + '<div data-part="link-wrapper"><a class="rottay-anchor-link rottay-anchor-link--modern" data-part="item" data-selected="false">Section</a></div></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-direction=vertical',
        stamp: 'data-direction={direction}',
        resolves: Object.freeze([
          Object.freeze({ source: 'src/components/primitives/navigation/anchor/engines/modern/index.tsx', text: 'direction = ANCHOR_DEFAULTS.direction,' }),
          Object.freeze({ source: 'src/components/primitives/navigation/anchor/contracts/index.ts', text: "direction: 'vertical' as const," }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-affix=true',
        stamp: "data-affix={affix ? 'true' : 'false'}",
        resolves: Object.freeze([
          Object.freeze({ source: 'src/components/primitives/navigation/anchor/engines/modern/index.tsx', text: 'affix = ANCHOR_DEFAULTS.affix,' }),
          Object.freeze({ source: 'src/components/primitives/navigation/anchor/contracts/index.ts', text: 'affix: true,' }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-selected=false',
        stamp: 'data-selected={isActive}',
        resolves: Object.freeze([
          Object.freeze({ source: 'src/components/primitives/navigation/anchor/engines/modern/index.tsx', text: 'const isActive = context?.activeKey === href;' }),
        ]),
      }),
    ]),
  }),
  'tree-view-connector': Object.freeze({
    state: Object.freeze({
      name: 'a single-root TreeViewConnector whose node carries `href` -- the label renders the link the ring rule is gated on',
      source: 'src/components/patterns/visualization/tree-view/presentation/connector/index.tsx',
      anchors: Object.freeze(['{node.href ? (']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['states']),
    markup: '<ul class="rt-tree-view" data-part="root" role="list"><li class="rt-tree-view__item" data-part="item" role="listitem">'
      + '<span class="rt-tree-view__row" data-part="row"><span class="rt-tree-view__label" data-part="label">'
      + '<a class="rt-tree-view__link" data-part="link">Docs</a></span></span></li></ul>',
    stamps: Object.freeze([]),
  }),
  'breadcrumb-compounds': Object.freeze({
    state: Object.freeze({
      name: 'a Breadcrumb.Item given `href` -- the non-current crumb anchor (kernel-stamped) is the node the ring rule is gated on; without `href` the item is the current page and renders no child crumb',
      source: 'src/components/primitives/navigation/breadcrumb/compound/item/index.tsx',
      anchors: Object.freeze(['if (href) {']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['states']),
    markup: '<span class="ds-breadcrumb-item"><a data-part="crumb" data-current="false">Home</a></span>',
    stamps: Object.freeze([
      Object.freeze({ token: 'attr:data-part=crumb', stamp: "{...partAttributes('crumb', interaction.state)}" }),
      Object.freeze({ token: 'attr:data-current=false', stamp: 'data-current={false}' }),
    ]),
  }),
  typography: Object.freeze({
    state: Object.freeze({
      name: 'a default Typography.Link -- the only node the `a.rottay-typography` ring rule can select (the probe mounts the family root as a `div`); kernel-stamped',
      source: 'src/components/primitives/display/typography/engines/modern/index.tsx',
      anchors: Object.freeze(['export const ModernLink = forwardRef<HTMLAnchorElement, LinkProps>(']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['states']),
    markup: '<a class="rottay-typography rottay-typography--modern hover:underline transition-colors" data-part="root" data-color="primary" data-size="md">Docs</a>',
    stamps: Object.freeze([
      Object.freeze({ token: 'attr:data-part=root', stamp: "{...partAttributes(dataPart ?? 'root', interaction.state)}" }),
      Object.freeze({
        token: 'attr:data-color=primary',
        stamp: 'data-color={color}',
        resolves: Object.freeze([
          Object.freeze({ source: 'src/components/primitives/display/typography/engines/modern/index.tsx', text: 'color = TYPOGRAPHY_DEFAULTS.link.color,' }),
          Object.freeze({ source: 'src/components/primitives/display/typography/contracts/index.ts', text: "color: 'primary' as const," }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-size=md',
        stamp: 'data-size={size}',
        resolves: Object.freeze([
          Object.freeze({ source: 'src/components/primitives/display/typography/engines/modern/index.tsx', text: 'const size = scalarOrUndefined(sizeProp) ?? TYPOGRAPHY_DEFAULTS.link.size;' }),
          Object.freeze({ source: 'src/components/primitives/display/typography/contracts/index.ts', text: "size: 'md' as const," }),
        ]),
      }),
    ]),
  }),
  // R2a (WO-EVI-02, rhythm reach): the rows the R1 census measured moving on
  // rhythm with the mount alone. Each declares rhythm and nothing else, so
  // every other axis reads exactly as before.
  'chart-c': Object.freeze({
    state: Object.freeze({
      name: 'a FunnelChart given a stage it cannot draw (a negative value) -- the scaffold renders ready and the funnel overlays its '
        + '`data-fallback` status in place of the plot; the mounted family root is the sparkline, which never contains it',
      source: 'src/components/patterns/visualization/charts/families/funnel-chart/index.tsx',
      anchors: Object.freeze(['overlay={fallbackMessage ? (']),
      resolves: Object.freeze([
        Object.freeze({
          source: 'src/components/patterns/visualization/charts/runtime/chart-engine/foundation/renderers/geometry/index.ts',
          text: "return 'Funnel charts cannot represent negative stages.';",
        }),
        Object.freeze({ source: 'src/components/patterns/visualization/charts/presentation/scaffold/index.tsx', text: "return 'ready';" }),
      ]),
    }),
    axes: Object.freeze(['rhythm']),
    markup: '<div class="ds-chart-scaffold ds-chart-funnel" data-part="chart-scaffold" data-state="ready">'
      + '<div data-part="data-fallback" role="status">Funnel charts cannot represent negative stages.</div></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'class:ds-chart-scaffold',
        stamp: "const scaffoldClassName = ['ds-chart-scaffold', className]",
        source: 'src/components/patterns/visualization/charts/presentation/scaffold/index.tsx',
      }),
      Object.freeze({
        token: 'attr:data-part=chart-scaffold',
        stamp: 'data-part="chart-scaffold"',
        source: 'src/components/patterns/visualization/charts/presentation/scaffold/index.tsx',
      }),
      Object.freeze({
        token: 'attr:data-state=ready',
        stamp: 'data-state="ready"',
        source: 'src/components/patterns/visualization/charts/presentation/scaffold/index.tsx',
      }),
    ]),
  }),
  detail: Object.freeze({
    state: Object.freeze({
      name: 'a DetailSurface given an `error` -- the error branch renders the root with the domain lifecycle value `data-state="error"` '
        + '(not a value the scene stamps), the node whose state gap is the family\'s only rhythm paint',
      source: 'src/components/surfaces/presentation/pages/data/detail/index.tsx',
      anchors: Object.freeze(['if (hasSurfaceError(error)) {']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['rhythm']),
    markup: '<div class="ds-surface ds-detail-surface" data-part="root" data-state="error">'
      + '<div data-part="error-state" aria-live="polite"></div></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'tag:div',
        stamp: '<Box',
        resolves: Object.freeze([
          Object.freeze({ source: 'src/components/primitives/layout/box/engines/modern/index.tsx', text: 'as: Component = BOX_DEFAULTS.as,' }),
          Object.freeze({ source: 'src/components/primitives/layout/box/contracts/index.ts', text: 'as: "div",' }),
        ]),
      }),
    ]),
  }),
  flex: Object.freeze({
    state: Object.freeze({
      name: 'a Flex given `gap="md"` -- a preset gap is the only configuration that stamps `data-gap` and `data-gap-preset`, '
        + 'the gates every dial-scaled gap rule sits behind; the default Flex writes neither (law 1 keeps it off the as-rendered roster)',
      source: 'src/components/primitives/layout/flex/engines/modern/index.tsx',
      anchors: Object.freeze(['{...presentationAttributes}', 'const parameterStyle = resolveFlexParameterStyle(props, { motion: "stamped" });']),
      resolves: Object.freeze([
        Object.freeze({
          source: 'src/components/primitives/layout/flex/runtime/presentation/index.ts',
          text: 'if (props.gap !== undefined && !isResponsiveValue(props.gap)) {',
        }),
      ]),
    }),
    axes: Object.freeze(['rhythm']),
    markup: '<div data-part="root" class="rottay-flex rottay-flex--modern" style="--ds-flex-gap:var(--ds-spacing-4, 1rem)" '
      + 'data-gap="uniform" data-gap-preset="md" data-component="flex"></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-gap=uniform',
        stamp: 'attributes["data-gap"] = "uniform";',
        source: 'src/components/primitives/layout/flex/runtime/presentation/index.ts',
      }),
      Object.freeze({
        token: 'attr:data-gap-preset=md',
        stamp: 'attributes["data-gap-preset"] = flexGapPresetSpelling(scalarGap);',
        source: 'src/components/primitives/layout/flex/runtime/presentation/index.ts',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/primitives/layout/flex/contracts/index.ts',
            text: 'return (FLEX_GAP_RHYTHM_PRESETS as readonly string[]).includes(value)',
          }),
        ]),
      }),
      Object.freeze({
        token: 'style:--ds-flex-gap=var(--ds-spacing-4, 1rem)',
        stamp: 'style["--ds-flex-gap"] = resolveFlexGapValue(scalarGap);',
        source: 'src/components/primitives/layout/flex/runtime/presentation/index.ts',
        resolves: Object.freeze([
          Object.freeze({ source: 'src/components/primitives/layout/flex/contracts/index.ts', text: 'md: "var(--ds-spacing-4, 1rem)",' }),
        ]),
      }),
    ]),
  }),
  'presence-typing': Object.freeze({
    family: 'presence',
    state: Object.freeze({
      name: 'a PresenceTypingIndicator with no one typing -- the live region renders unconditionally (`isTyping` gates only its dots and label), '
        + 'and its gap is the family\'s rhythm paint; a second row because a cursor and an indicator are two components one mount cannot be',
      source: 'src/components/patterns/communication/presence/index.tsx',
      anchors: Object.freeze(['export function PresenceTypingIndicator({']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['rhythm']),
    markup: '<div class="ds-presence-typing-indicator" data-part="root" role="status" aria-live="polite"></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'tag:div',
        stamp: '<Box',
        resolves: Object.freeze([
          Object.freeze({ source: 'src/components/primitives/layout/box/engines/modern/index.tsx', text: 'as: Component = BOX_DEFAULTS.as,' }),
          Object.freeze({ source: 'src/components/primitives/layout/box/contracts/index.ts', text: 'as: "div",' }),
        ]),
      }),
    ]),
  }),
  'visual-excellence-preview': Object.freeze({
    state: Object.freeze({
      name: 'the tenant-theme preview fixture\'s command bar, rendered unconditionally at its head -- every rhythm rule of the family is headed by a '
        + '`.ds-visual-excellence__*` element, none of which is the mounted root',
      source: 'src/components/patterns/customization/brand-studio/runtime/tenant-theme-preview/fixtures/visual-excellence/index.tsx',
      anchors: Object.freeze(['export function VisualExcellencePreviewFixture(): React.ReactElement {', '<header className="ds-visual-excellence__command-bar">']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['rhythm']),
    markup: '<main class="ds-visual-excellence" data-part="visual-excellence-fixture">'
      + '<header class="ds-visual-excellence__command-bar">'
      + '<div class="ds-visual-excellence__command-context"><span aria-hidden="true"></span></div>'
      + '<button class="ds-visual-excellence__command-search" type="button"><span></span><kbd></kbd></button>'
      + '<div class="ds-visual-excellence__command-account"></div></header></main>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'tag:div',
        stamp: '<Box',
        resolves: Object.freeze([
          Object.freeze({ source: 'src/components/primitives/layout/box/engines/modern/index.tsx', text: 'as: Component = BOX_DEFAULTS.as,' }),
          Object.freeze({ source: 'src/components/primitives/layout/box/contracts/index.ts', text: 'as: "div",' }),
        ]),
      }),
    ]),
  }),
  // R3 (WO-EVI-02, depth reach): the rows the R3 census measured moving on
  // depth with the mount alone. Each declares depth and nothing else, so every
  // other axis reads exactly as before. Default renders first, then the
  // configurations a public prop ships, each with its gate cited.
  'sidebar-surface': Object.freeze({
    state: Object.freeze({
      name: 'the default render at a desktop viewport (not stacked, `bordered` unset) -- the main region is written unconditionally, and its '
        + 'inline-start separator (a `border-inline-start` shorthand the part vocabulary does not list) is the family\'s depth paint',
      source: 'src/components/structures/shell/navigation/sidebar-surface/index.tsx',
      anchors: Object.freeze(['<Box data-part="main">']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['depth']),
    markup: '<div class="ds-structure ds-sidebar-surface" data-part="root" data-stacked="false" data-bordered="true">'
      + '<div data-part="main"></div></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'tag:div',
        stamp: '<Box',
        resolves: Object.freeze([
          Object.freeze({ source: 'src/components/primitives/layout/box/engines/modern/index.tsx', text: 'as: Component = BOX_DEFAULTS.as,' }),
          Object.freeze({ source: 'src/components/primitives/layout/box/contracts/index.ts', text: 'as: "div",' }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-stacked=false',
        stamp: "data-stacked={adaptation.stacked ? 'true' : 'false'}",
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/structures/shell/navigation/sidebar-surface/index.tsx',
            text: 'const BASE_ADAPTATION: ResolvedSidebarSurfaceAdaptation = { stacked: false };',
          }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-bordered=true',
        stamp: "data-bordered={config.visual.bordered === false ? 'false' : 'true'}",
      }),
    ]),
  }),
  'saved-views-menu': Object.freeze({
    state: Object.freeze({
      name: 'the open panel of a default SavedViewsMenu (portalled dialog with its header) -- the panel keyline and the header rule; '
        + 'the mounted root is the closed trigger, which never contains the panel',
      source: 'src/components/structures/workspace/saved-views-menu/index.tsx',
      anchors: Object.freeze(['{isOpen && (']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['depth']),
    markup: '<div data-part="panel" data-open="true" class="ds-structure ds-saved-views-menu-panel" role="dialog">'
      + '<div data-part="header"></div></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'tag:div',
        stamp: '<Box',
        resolves: Object.freeze([
          Object.freeze({ source: 'src/components/primitives/layout/box/engines/modern/index.tsx', text: 'as: Component = BOX_DEFAULTS.as,' }),
          Object.freeze({ source: 'src/components/primitives/layout/box/contracts/index.ts', text: 'as: "div",' }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-open=true',
        stamp: 'data-open={isOpen}',
        resolves: Object.freeze([
          Object.freeze({ source: 'src/components/structures/workspace/saved-views-menu/index.tsx', text: '{isOpen && (' }),
        ]),
      }),
    ]),
  }),
  'skeleton-anatomy-block': Object.freeze({
    family: 'skeleton-anatomy',
    state: Object.freeze({
      name: 'the default `mode="block"` render, loading and measured, over a child whose root stamps `data-part="root"` (every DS root does) -- '
        + 'that part reads as a `frame` bone, the node the outline hairline is gated on; a second row because the table-rows render is another root',
      source: SKELETON_ANATOMY,
      anchors: Object.freeze(['{bones && (', "mode = 'block',"]),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['depth']),
    markup: '<div data-part="root" data-loading="true" data-measured="true" data-animation="shimmer" class="ds-skeleton-anatomy">'
      + '<div data-part="bones" aria-hidden="true"><span data-part="bone" data-bone="frame"></span></div></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-loading=true',
        stamp: "data-loading={loading ? 'true' : 'false'}",
        resolves: Object.freeze([Object.freeze({ source: SKELETON_ANATOMY, text: '{ loading = true, busy = true,' })]),
      }),
      Object.freeze({
        token: 'attr:data-measured=true',
        stamp: "data-measured={bones ? 'true' : 'false'}",
        resolves: Object.freeze([Object.freeze({ source: SKELETON_ANATOMY, text: 'if (loading) measure();' })]),
      }),
      Object.freeze({
        token: 'attr:data-animation=shimmer',
        stamp: 'data-animation={animationStyle}',
        resolves: Object.freeze([
          Object.freeze({ source: SKELETON_ANATOMY, text: "resolvedAnimation === 'pulse' ? 'pulse' : 'shimmer'" }),
          Object.freeze({ source: SKELETON_ANATOMY, text: ": 'wave');" }),
        ]),
      }),
      Object.freeze({
        token: 'attr:data-bone=frame',
        stamp: 'data-bone={bone.role}',
        resolves: Object.freeze([Object.freeze({ source: SKELETON_ANATOMY, text: "  root: 'frame'," })]),
      }),
    ]),
  }),
  table: Object.freeze({
    state: Object.freeze({
      name: 'a default Table with one column (`headerBordered` defaults true) -- every header cell carries `data-hairline`, the gate the '
        + 'header/body rule sits behind; the mounted root is the wrapper, and the table, header and cells are nodes the bare root never contains',
      source: 'src/components/primitives/display/table/engines/modern/index.tsx',
      anchors: Object.freeze(['{showHeader && (', 'const showHeaderHairline = bordered || headerBordered;']),
      resolves: Object.freeze([
        Object.freeze({ source: 'src/components/primitives/display/table/engines/modern/index.tsx', text: 'headerBordered = true,' }),
      ]),
    }),
    axes: Object.freeze(['depth']),
    markup: '<div class="ds-table ds-table--modern"><table role="grid" data-part="table"><thead><tr>'
      + '<th data-part="header-cell" data-hairline="true"></th></tr></thead></table></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'attr:data-part=header-cell',
        stamp: "{...partAttributes('header-cell', state)}",
        source: 'src/components/primitives/display/table/engines/modern/parts/presentation/header-cell/index.tsx',
      }),
      Object.freeze({
        token: 'attr:data-hairline=true',
        stamp: "data-hairline={showHeaderHairline ? 'true' : undefined}",
      }),
    ]),
  }),
  tree: Object.freeze({
    state: Object.freeze({
      name: 'a Tree given `showLine` with one expanded parent and one (last) child -- the connectors exist only under that prop and only for a '
        + 'node below the top level; their line width is the family\'s depth paint (the parent node is omitted: the rules are descendant matches)',
      source: 'src/components/primitives/display/tree/engines/modern/index.tsx',
      anchors: Object.freeze(['{showLine && level > 0 && (']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['depth']),
    markup: '<div class="rottay-tree rottay-tree--modern" data-part="root" role="tree">'
      + '<div class="rottay-tree-node" data-part="node"><div data-part="connector" data-axis="horizontal"></div>'
      + '<div data-part="connector" data-axis="vertical" data-span="half"></div></div></div>',
  }),
  descriptions: Object.freeze({
    state: Object.freeze({
      name: 'a Descriptions given a `title` -- the header exists only then, and the root stamps `data-has-header="true"`, the gate its keyline sits behind',
      source: 'src/components/primitives/display/descriptions/engines/modern/index.tsx',
      anchors: Object.freeze(['{(title || extra) && (']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['depth']),
    markup: '<div class="rottay-descriptions rottay-descriptions--modern" data-part="root" data-has-header="true">'
      + '<div class="rottay-descriptions-title" data-part="header"></div></div>',
    stamps: Object.freeze([
      Object.freeze({ token: 'attr:data-part=root', stamp: "data-part={dataPart ?? 'root'}" }),
      Object.freeze({
        token: 'attr:data-has-header=true',
        stamp: 'data-has-header={hasHeader}',
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/primitives/display/descriptions/engines/modern/index.tsx',
            text: 'const hasHeader = !!(title || extra);',
          }),
        ]),
      }),
    ]),
  }),
  carousel: Object.freeze({
    state: Object.freeze({
      name: 'a Carousel given `arrows` (infinite by default, so neither arrow is disabled) -- the prev/next buttons exist only under that prop and their '
        + 'keyline is the family\'s depth paint',
      source: 'src/components/primitives/display/carousel/engines/modern/index.tsx',
      anchors: Object.freeze(['{arrows && (']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['depth']),
    markup: '<div class="rottay-carousel rottay-carousel--modern" data-part="root">'
      + '<button data-part="arrow" data-direction="prev" type="button"></button></div>',
    stamps: Object.freeze([
      Object.freeze({ token: 'attr:data-part=arrow', stamp: "{...partAttributes('arrow', prevArrowState.state)}" }),
    ]),
  }),
  image: Object.freeze({
    state: Object.freeze({
      name: 'an Image given `shadow` (the engine\'s own usage example) -- the root stamps `data-shadow="true"` only then, the gate its elevation sits behind',
      source: 'src/components/primitives/display/image/engines/modern/index.tsx',
      anchors: Object.freeze(["data-shadow={shadow ? 'true' : undefined}"]),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['depth']),
    markup: '<div class="rottay-image rottay-image--modern" data-shadow="true" data-part="root"></div>',
    stamps: Object.freeze([
      Object.freeze({ token: 'attr:data-shadow=true', stamp: "data-shadow={shadow ? 'true' : undefined}" }),
      Object.freeze({ token: 'attr:data-part=root', stamp: "{...partAttributes(dataPart ?? 'root', interaction)}" }),
    ]),
  }),
  box: Object.freeze({
    state: Object.freeze({
      name: 'a Box given `shadow="md"` -- a shadow rung is the only configuration that stamps `data-shadow`, the gate every elevation rule of the '
        + 'family sits behind; the default Box writes none',
      source: 'src/components/primitives/layout/box/engines/modern/index.tsx',
      anchors: Object.freeze(['!callerOwnsShadow && props.shadow && props.shadow !== "none"']),
      resolves: Object.freeze([
        Object.freeze({
          source: 'src/components/primitives/layout/box/contracts/index.ts',
          text: 'export type BoxShadow = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";',
        }),
      ]),
    }),
    axes: Object.freeze(['depth']),
    markup: '<div data-part="box-surface" class="rottay-box rottay-box--modern" data-shadow="md" data-component="box"></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'tag:div',
        stamp: 'React.createElement(ElementType, elementProps)',
        resolves: Object.freeze([
          Object.freeze({ source: 'src/components/primitives/layout/box/engines/modern/index.tsx', text: 'as: Component = BOX_DEFAULTS.as,' }),
          Object.freeze({ source: 'src/components/primitives/layout/box/contracts/index.ts', text: 'as: "div",' }),
        ]),
      }),
      Object.freeze({ token: 'attr:data-shadow=md', stamp: '? props.shadow' }),
    ]),
  }),
  list: Object.freeze({
    state: Object.freeze({
      name: 'a List given `bordered` (the engine\'s own usage example) -- the root stamps `data-bordered="true"` only then, the gate its frame '
        + 'and its `--ds-list-border-radius` corner (S10: shape) sit behind',
      source: 'src/components/primitives/display/list/engines/modern/index.tsx',
      anchors: Object.freeze(["data-bordered={bordered ? 'true' : 'false'}"]),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['shape', 'depth']),
    markup: '<div class="rottay-list rottay-list--modern" data-part="root" data-bordered="true"></div>',
    stamps: Object.freeze([
      Object.freeze({ token: 'attr:data-part=root', stamp: "data-part={dataPart ?? 'root'}" }),
      Object.freeze({ token: 'attr:data-bordered=true', stamp: "data-bordered={bordered ? 'true' : 'false'}" }),
    ]),
  }),
  'drawer-compounds-divider': Object.freeze({
    family: 'drawer-compounds',
    state: Object.freeze({
      name: 'a Drawer.Header given `divider` -- the header stamps `data-divider="true"` only then, the gate its block-end rule sits behind; '
        + 'a second row because the close-button row is a header without it',
      source: 'src/components/primitives/feedback/drawer/compound/header/index.tsx',
      anchors: Object.freeze(['divider = false,']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['depth']),
    markup: '<div data-part="header" data-divider="true" class="ds-drawer-header"></div>',
    stamps: Object.freeze([
      Object.freeze({ token: 'attr:data-divider=true', stamp: "data-divider={divider ? 'true' : 'false'}" }),
    ]),
  }),
  'modal-compounds-divider': Object.freeze({
    family: 'modal-compounds',
    state: Object.freeze({
      name: 'a Modal.Header given `divider` -- the header stamps `data-divider="true"` only then, the gate its block-end rule sits behind; '
        + 'a second row because the close-button row is a different node',
      source: 'src/components/primitives/feedback/modal/compound/header/index.tsx',
      anchors: Object.freeze(['divider = false,']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['depth']),
    markup: '<div data-part="header" data-divider="true" class="ds-modal-header"></div>',
    stamps: Object.freeze([
      Object.freeze({ token: 'attr:data-divider=true', stamp: "data-divider={divider ? 'true' : 'false'}" }),
    ]),
  }),
  'assistant-preview-diff': Object.freeze({
    family: 'assistant',
    state: Object.freeze({
      name: 'a PreviewDiffCard with one row (the assistant pattern exports it beside the streaming text the family root mounts) -- every diff row '
        + 'carries the hairline rule that is the family\'s depth paint; the card and its body wrappers are omitted (the rule is a descendant match)',
      source: 'src/components/patterns/communication/assistant/index.tsx',
      anchors: Object.freeze(['export function PreviewDiffCard({', '{rows.map((row, index) => {']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['depth']),
    markup: '<div class="ds-assistant-preview-diff-card"><div data-part="diff-row"></div></div>',
    stamps: Object.freeze([
      Object.freeze({
        token: 'tag:div',
        stamp: Object.freeze(['<Card className="ds-assistant-preview-diff-card"', '<Stack']),
        resolves: Object.freeze([
          Object.freeze({
            source: 'src/components/primitives/display/card/engines/modern/index.tsx',
            text: '<div\n      {...rest}\n      ref={setRootElement}\n      className={cardClassName}',
          }),
          Object.freeze({ source: 'src/components/primitives/layout/stack/contracts/index.ts', text: 'as: "div",' }),
        ]),
      }),
    ]),
  }),
  'data-table-actions': Object.freeze({
    state: Object.freeze({
      name: 'a DataTable given `actions` (the row-actions column) -- the root stamps `data-has-actions="true"` only then, and the actions header '
        + 'cell exists only then; its inline-start keyline is the family\'s depth paint (the wrappers between root and table are omitted)',
      source: 'src/components/patterns/data/data-table/engines/modern/index.tsx',
      anchors: Object.freeze(['{/* Actions column header */}\n                  {actions && (']),
      resolves: Object.freeze([]),
    }),
    axes: Object.freeze(['depth']),
    markup: '<div class="ds-pattern-data-table" data-has-actions="true" data-part="root"><table><thead><tr>'
      + '<th data-cell-kind="actions" data-part="header-cell"></th></tr></thead></table></div>',
    stamps: Object.freeze([
      Object.freeze({ token: 'attr:data-has-actions=true', stamp: 'data-has-actions={actions ? "true" : "false"}' }),
    ]),
  }),
  ...CHART_LEGEND_SHAPE_ROWS,
  ...SHAPE_REACH_ROWS,
});

/**
 * The roster rows MEASURED under law 5 and REFUSED on states: the real render
 * moves on neither half, or law 3 refuses it because the default mount
 * already moves (S7), so the row may not declare `states`. Published in the
 * record (`realRender.statesRefused`) and in the indicator with the reach the
 * run read, so a refusal is evidence in the artifact and not only in a receipt
 * (Fable S1 review, overstated claim 2). Pinned: the roster door refuses a
 * pinned row that is missing, declares `states`, or is a real render of a
 * family outside the states population, and `evaluate` refuses a full run that
 * does not publish every pinned row.
 */
export const REAL_RENDER_STATES_REFUSALS = Object.freeze({
  // column-menu left on 2026-09-30 (S7): with 40a9f2862 its panel ring reads
  // `--ds-focus-ring-width`, the engine focuses the panel on open, and the row
  // is credited on states in all four bithire/evnto cells.
  'command-palette': 'measured 2026-09-30 (S7): the real render moves (opacity, the disabled item rule under the stamp) but the '
    + 'default mount already moves on the stamp half since 8be7fd02e -- law 3 refuses the restatement; the family is a states mover on its default mount',
});

/**
 * THE SHAPE ROWS MEASURED AND REFUSED (S8, WO-EVI-02). A row that reaches a
 * family's shape paint under every clause of the roster law, but that law 3
 * refuses -- the real render computes the same corner in both arms because the
 * corner is an authored literal, not a read of `--ds-radius-scale-normalized`
 * -- is kept here rather than in a receipt, for the reason
 * `REAL_RENDER_STATES_REFUSALS` exists: the refusal is evidence about the
 * family, and a row that would qualify the day its skin reads the channel must
 * not rot meanwhile. `realRenderRefusedRowFailures` holds them to the same door
 * as the shipped roster, refuses one that also sits in it, and `run` refuses a
 * tree where either fails. They are never mounted.
 *
 * S8 landed three rows here (chart-bullet, chart-waterfall, chart-c's
 * histogram legend); S9 bound their corners to the channel and they left for
 * the roster. The other three D1 families are STOPs, not rows:
 * `dashboard-activity-interactions` and `dashboard-metrics-interactions` paint
 * shape only on `::-webkit-scrollbar-thumb` (a UA pseudo the read law refuses
 * by name, never a node), and `statistic-compounds` has no mountable root to
 * mount beside; all three are in `UNMOUNTABLE_FAMILIES`, outside the effective
 * denominator.
 */
export const REAL_RENDER_SHAPE_REFUSALS = Object.freeze({
  // chart-bullet, chart-waterfall and chart-c-histogram-legend left on
  // 2026-10-01 (S9): their skins now read --ds-radius-scale-normalized, and
  // each row is credited on shape in all four bithire/evnto cells -- they are
  // REAL_RENDER_MOUNTS rows (CHART_LEGEND_SHAPE_ROWS).
});

/** The refused rows held to the shipped roster's door, and refused if any of them is also a roster row. */
export function realRenderRefusedRowFailures(root = CORE_ROOT, {
  refusals = REAL_RENDER_SHAPE_REFUSALS,
  roster = REAL_RENDER_MOUNTS,
  readSource,
} = {}) {
  const failures = Object.keys(refusals)
    .filter((row) => roster[row] !== undefined)
    .map((row) => `${row}: a measured shape refusal is also a REAL_RENDER_MOUNTS row -- re-measure, and drop it from REAL_RENDER_SHAPE_REFUSALS if it now qualifies`);
  return [
    ...failures,
    ...realRenderRosterFailures(root, refusals, { statesRefusals: {}, ...(readSource === undefined ? {} : { readSource }) }),
  ];
}

/**
 * The declaring families the probe cannot observe, per axis, as
 * `check/theme/population`'s `axisUnobservable` derives them: family -> class.
 * A REPORTED number beside every denominator, NEVER subtracted from it (Fable
 * exclusion review 2026-09-30, item A4). Pinned so it cannot drift silently: a
 * family that gains a read property under a state leaves the set, one that
 * whose last read property under a state goes enters, and a full run refuses either until the pin
 * moves with it.
 *
 * Measured on this tree (2e0f83953): 8 on states. Fable's enumeration at
 * a25d4f828 named command-palette where this names scope-switcher; the same
 * derivation over an isolated archive of a25d4f828 reads 9 (both of them).
 * command-palette left when S0 wired `--ds-state-disabled-opacity` (a states
 * head channel) into its disabled item; scope-switcher is colour-only on both
 * trees (Fable's own section-2 table reads it so).
 */
export const UNOBSERVABLE_FAMILIES = Object.freeze({
  shape: Object.freeze({}),
  typography: Object.freeze({}),
  rhythm: Object.freeze({}),
  depth: Object.freeze({}),
  states: Object.freeze({
    'button-group': 'no-vocabulary',
    list: 'colour-only',
    'metrics-chart': 'colour-only',
    'metrics-rows': 'no-vocabulary',
    'operational-ledger': 'colour-only',
    'overlay-modal-compounds': 'colour-only',
    'record-facts': 'colour-only',
    'scope-switcher': 'colour-only',
  }),
  motion: Object.freeze({}),
});

/** Where the live unobservable set and a pin disagree, one line per family and axis. */
export function unobservableDrift(live, pin = UNOBSERVABLE_FAMILIES) {
  const failures = [];
  for (const axis of AXIS_IDS) {
    const measured = Object.fromEntries((live[axis] ?? []).map((entry) => [entry.family, entry.class]));
    const pinned = pin[axis] ?? {};
    for (const family of [...new Set([...Object.keys(measured), ...Object.keys(pinned)])].sort()) {
      if (measured[family] === pinned[family]) continue;
      failures.push(pinned[family] === undefined
        ? `${axis}: ${family} is unobservable (${measured[family]}) and not in UNOBSERVABLE_FAMILIES -- re-pin it; it is reported, never subtracted`
        : measured[family] === undefined
          ? `${axis}: ${family} is pinned unobservable (${pinned[family]}) and the probe can now observe it -- re-pin UNOBSERVABLE_FAMILIES`
          : `${axis}: ${family} is unobservable as ${measured[family]}, pinned as ${pinned[family]}`);
    }
  }
  return failures;
}

const HTML_TAG = /<([a-z][a-z0-9-]*)((?:\s+[a-zA-Z_:][-\w:.]*(?:\s*=\s*"[^"]*")?)*)\s*\/?>/gu;
const HTML_ATTRIBUTE = /([a-zA-Z_:][-\w:.]*)(?:\s*=\s*"([^"]*)")?/gu;

/**
 * Every token a mount's markup carries, in the vocabulary the witness law
 * reads: `tag:li`, `class:ds-dropdown-surface`, `attr:data-part=title`,
 * `style:--ds-skeleton-avatar-radius=50%`.
 */
export function markupTokens(markup) {
  const tokens = new Set();
  for (const [, tag, attributes] of markup.matchAll(HTML_TAG)) {
    tokens.add(`tag:${tag}`);
    for (const [, name, value = ''] of attributes.matchAll(HTML_ATTRIBUTE)) {
      if (name === 'class') {
        for (const token of value.split(/\s+/u).filter(Boolean)) tokens.add(`class:${token}`);
      } else if (name === 'style') {
        for (const declaration of value.split(';').map((entry) => entry.trim()).filter(Boolean)) {
          const colon = declaration.indexOf(':');
          tokens.add(`style:${declaration.slice(0, colon).trim()}=${declaration.slice(colon + 1).trim()}`);
        }
      } else {
        tokens.add(`attr:${name}=${value}`);
      }
    }
  }
  return [...tokens].sort();
}

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');

/** The literal spellings a JSX source writes a token with; a dynamic value needs a `stamps` row instead. */
export function literalWitness(token, source) {
  const [kind, rest] = [token.slice(0, token.indexOf(':')), token.slice(token.indexOf(':') + 1)];
  if (kind === 'tag') return source.includes(`<${rest}`) && new RegExp(`<${escapeRegExp(rest)}[\\s>]`, 'u').test(source);
  if (kind === 'class') return new RegExp(`['"\`\\s]${escapeRegExp(rest)}['"\`\\s$]`, 'u').test(source);
  if (kind === 'attr') {
    const equals = rest.indexOf('=');
    const [name, value] = [rest.slice(0, equals), rest.slice(equals + 1)];
    return [`${name}="${value}"`, `${name}='${value}'`, `'${name}': '${value}'`, `"${name}": "${value}"`,
      `${name}={'${value}'}`, `${name}={"${value}"}`].some((form) => source.includes(form));
  }
  return false;
}

/** The first line of `source` a text starts on, 1-based, or null. */
const lineOf = (source, text) => {
  const at = source.indexOf(text);
  return at < 0 ? null : source.slice(0, at).split('\n').length;
};

const texts = (stamp) => (Array.isArray(stamp) ? stamp : [stamp]);

/**
 * Every way a real-render row can be wrong, read against the tree: a token the
 * engine does not write, a stamp or default that moved, a gate that is gone,
 * a stamp row no markup uses, a host that carries anything, an axis the law
 * does not admit or the family does not declare.
 *
 * `readSource` exists so a drill can hand in a drifted engine without writing
 * one to disk.
 */
export function realRenderRosterFailures(root = CORE_ROOT, roster = REAL_RENDER_MOUNTS, {
  readSource = (file) => readFileSync(file, 'utf8'),
  statesRefusals = roster === REAL_RENDER_MOUNTS ? REAL_RENDER_STATES_REFUSALS : {},
} = {}) {
  const failures = [];
  const skins = skinFamilies(root);
  const populations = axisPopulations(root);
  // At most one row per family declares `states` (the single-states-row law).
  const statesRows = new Map();
  for (const [row, entry] of Object.entries(roster)) {
    if (!entry.axes.includes('states')) continue;
    const owner = realRenderFamily(row, entry);
    statesRows.set(owner, [...(statesRows.get(owner) ?? []), row]);
  }
  for (const [owner, rows] of statesRows) {
    if (rows.length > 1) {
      failures.push(`${owner}: ${rows.length} rows declare states (${rows.join(', ')}) -- at most one row per family may, `
        + 'because the states halves are published per family and two rows would conflate two configurations');
    }
  }
  for (const [row, reason] of Object.entries(statesRefusals)) {
    const entry = roster[row];
    if (entry === undefined) {
      failures.push(`${row}: pinned as a measured states refusal and no longer a roster row -- ${reason}`);
    } else if (entry.axes.includes('states')) {
      failures.push(`${row}: pinned as a measured states refusal and declares states -- re-measure and drop it from REAL_RENDER_STATES_REFUSALS`);
    } else if (!populations.get('states').includes(realRenderFamily(row, entry))) {
      failures.push(`${row}: pinned as a states refusal, but ${realRenderFamily(row, entry)} does not declare states -- not a refusal`);
    }
  }
  const read = (relative) => {
    const file = resolve(root, relative);
    return existsSync(file) ? readSource(file) : null;
  };
  // `family` labels the row in every message; `owner` is the family it is a
  // real render OF, which is the one the skin, the root and the population
  // are read for.
  for (const [family, entry] of Object.entries(roster)) {
    const owner = realRenderFamily(family, entry);
    const files = skins.get(owner);
    if (files === undefined) {
      failures.push(`${family}: no Modern skin family${owner === family ? '' : ` ${owner}`}`);
      continue;
    }
    if (familyElement(files.map((file) => readFileSync(file, 'utf8')).join('\n')) === null) {
      failures.push(`${family}: no mountable root to mount a real render beside`);
    }
    for (const axis of entry.axes) {
      if (!REAL_RENDER_AXES.includes(axis)) {
        failures.push(`${family}/${axis}: a real-render mount is read only on ${REAL_RENDER_AXES.join(', ')}`);
      } else if (!populations.get(axis).includes(owner)) {
        failures.push(`${family}/${axis}: the family does not declare this axis in check/theme/population`);
      }
    }
    for (const tag of entry.host ?? []) {
      if (!/^[a-z][a-z0-9-]*$/u.test(tag)) failures.push(`${family}: host \`${tag}\` must be a bare element name`);
    }
    const engine = read(entry.state.source);
    if (engine === null) {
      failures.push(`${family}: ${entry.state.source} does not exist`);
      continue;
    }
    for (const anchor of entry.state.anchors) {
      if (!engine.includes(anchor)) failures.push(`${family}: ${entry.state.source} no longer carries the gate \`${anchor}\``);
    }
    const resolvesFailures = (where, rows) => {
      for (const row of rows ?? []) {
        const text = read(row.source);
        if (text === null) failures.push(`${where}: ${row.source} does not exist`);
        else if (!text.includes(row.text)) failures.push(`${where}: ${row.source} no longer carries the resolves \`${row.text}\``);
      }
    };
    resolvesFailures(`${family}/state`, entry.state.resolves);
    const tokens = markupTokens(entry.markup);
    const stamped = new Map((entry.stamps ?? []).map((row) => [row.token, row]));
    for (const token of tokens) {
      const row = stamped.get(token);
      if (row !== undefined) continue;
      if (!literalWitness(token, engine)) {
        failures.push(`${family}: \`${token}\` is not written by ${entry.state.source} -- a mount may omit what the engine renders, never add to it`);
      }
    }
    for (const row of entry.stamps ?? []) {
      const where = `${family}/${row.token}`;
      if (!tokens.includes(row.token)) failures.push(`${where}: a stamp row no mount token uses`);
      // A stamp written by a SIBLING component of the same render (a record
      // field's grid) names the file it is written in; it is read there, and
      // held to it exactly as the engine's own stamps are.
      const stampSource = row.source ?? entry.state.source;
      const writer = row.source === undefined ? engine : read(row.source);
      if (writer === null) {
        failures.push(`${where}: ${row.source} does not exist`);
        continue;
      }
      for (const text of texts(row.stamp)) {
        if (!writer.includes(text)) failures.push(`${where}: ${stampSource} no longer carries the stamp \`${text}\``);
      }
      resolvesFailures(where, row.resolves);
    }
  }
  return failures;
}

/**
 * The parts of a row the anatomy kernel stamps: a `data-part` token whose
 * stamp row is a `partAttributes(...)` spread, which is the only way a node of
 * real markup acquires `data-state` (`foundation/behavior/kernel/anatomy`).
 * The stamp half of law 5 writes the state on these nodes and on no other: a
 * `data-part` the engine writes literally never carries `data-state`, so a
 * stamp there would be a fabricated configuration, and that node is reached
 * by forcing alone.
 */
export function realRenderStampedParts(entry) {
  return [...new Set((entry.stamps ?? [])
    .filter((row) => row.token.startsWith('attr:data-part=') && texts(row.stamp).some((text) => text.includes('partAttributes(')))
    .map((row) => row.token.slice('attr:data-part='.length)))].sort();
}

/** The mounts a run applies: roster rows of the families it measures, each with its host-wrapped markup. */
export function realRenderMountList(elements, { applied = true, roster = REAL_RENDER_MOUNTS } = {}) {
  if (!applied) return [];
  return Object.entries(roster)
    .map(([row, entry]) => [row, entry, realRenderFamily(row, entry)])
    .filter(([, , family]) => elements.get(family) !== null && elements.get(family) !== undefined)
    .map(([row, entry, family]) => ({
      family,
      row,
      axes: [...entry.axes],
      stampedParts: realRenderStampedParts(entry),
      markup: (entry.host ?? []).map((tag) => `<${tag} data-axis-real-host="">`).join('')
        + entry.markup
        + [...(entry.host ?? [])].reverse().map((tag) => `</${tag}>`).join(''),
    }));
}

/** The roster as a run publishes it, with every gate resolved to the `file:line` it sits on in this tree. */
export function realRenderReport(mounts, {
  applied = true, roster = REAL_RENDER_MOUNTS, root = CORE_ROOT, statesReach = null, statesRefusals = REAL_RENDER_STATES_REFUSALS,
} = {}) {
  const map = {};
  for (const mount of mounts) {
    const entry = roster[mount.row ?? mount.family];
    const file = resolve(root, entry.state.source);
    const source = existsSync(file) ? readFileSync(file, 'utf8') : '';
    map[mount.row ?? mount.family] = {
      family: mount.family,
      state: entry.state.name,
      gates: entry.state.anchors.map((anchor) => `${entry.state.source}:${lineOf(source, anchor) ?? '?'}`),
      axes: [...entry.axes],
      host: [...(entry.host ?? [])],
      tokens: markupTokens(entry.markup).length,
      stampedParts: realRenderStampedParts(entry),
      // How many of the family's state rules select a node of THIS mount, per
      // half, read off the scene: the evidence a row may declare `states`, or
      // the reason it does not.
      ...(statesReach?.[mount.row ?? mount.family] === undefined ? {} : { statesReach: statesReach[mount.row ?? mount.family] }),
    };
  }
  // The measured refusals, in the record itself: the row, the family, why, and
  // the reach this run read on it.
  const statesRefused = Object.entries(statesRefusals)
    .filter(([row]) => map[row] !== undefined)
    .map(([row, reason]) => ({ row, family: map[row].family, reason, statesReach: map[row].statesReach ?? null }));
  return { applied, families: new Set(mounts.map((mount) => mount.family)).size, rows: Object.keys(map).length, map, statesRefused };
}

/** The pseudo-family keys a reading carries for a mounted family: its default mount alone, and its real render alone. */
export const REAL_RENDER_KEY = Object.freeze({ default: '#default', real: '#real' });

/**
 * One family's reading as ONE of its keys sees it -- the default mount alone
 * (`REAL_RENDER_KEY.default`) or the real render alone (`.real`) -- in the
 * shape `differsOnAxis` reads: the resting reading, every stamped state and
 * every native variant, each re-keyed onto the family.
 */
export function realRenderView(reading, family, key) {
  const pick = (byFamily) => ({ [family]: byFamily?.[`${family}${key}`] });
  const each = (byState) => (byState === undefined
    ? undefined
    : Object.fromEntries(Object.entries(byState).map(([state, byFamily]) => [state, pick(byFamily)])));
  return { base: pick(reading?.base), states: each(reading?.states), native: each(reading?.native) };
}

const halfOf = (halves) => (halves.stamped ? `the stamp half, ${halves.stamped}` : `the forced half, ${halves.native}`);

/**
 * Law 3 over one cell: is the default mount's paint on the axis identical in
 * both arms, while the real render's differs? Returns the verdict and, when
 * refused, the reading that refused it.
 *
 * States is read as its two halves (law 5): the default mount must move on
 * NEITHER, and the real render on at least one.
 */
export function realRenderQualification({ before, after, family, axis }) {
  if (axis === 'states') {
    const carries = (reading) => [...Object.values(reading?.states ?? {}), ...Object.values(reading?.native ?? {})]
      .some((byFamily) => byFamily?.[`${family}${REAL_RENDER_KEY.real}`] !== undefined);
    if (!carries(before) || !carries(after)) return { qualified: false, reason: 'a cell arm carries no real-render reading under a state' };
    const own = statesHalves(realRenderView(before, family, REAL_RENDER_KEY.default), realRenderView(after, family, REAL_RENDER_KEY.default), family);
    if (own.stamped || own.native) {
      return {
        qualified: false,
        reason: `its default mount already MOVES on states (${halfOf(own)}); the mount could only restate a move the family has`,
      };
    }
    const real = statesHalves(realRenderView(before, family, REAL_RENDER_KEY.real), realRenderView(after, family, REAL_RENDER_KEY.real), family);
    return real.stamped || real.native
      ? { qualified: true }
      : { qualified: false, reason: 'the real render does not move on states under either half -- the mount carries no signal for the axis it was declared for' };
  }
  const at = (reading, key) => reading?.base?.[`${family}${key}`];
  const [ownA, ownB, realA, realB] = [
    at(before, REAL_RENDER_KEY.default), at(after, REAL_RENDER_KEY.default),
    at(before, REAL_RENDER_KEY.real), at(after, REAL_RENDER_KEY.real),
  ];
  if (!ownA || !ownB || !realA || !realB) return { qualified: false, reason: 'a cell arm carries no real-render reading' };
  let realMoves = false;
  for (const property of AXES[axis].computed) {
    if (ownA[property] !== ownB[property]) {
      return {
        qualified: false,
        reason: `its default mount already MOVES on ${property} (${ownA[property]} -> ${ownB[property]}); the mount could only restate a move the family has`,
      };
    }
    if (realA[property] !== realB[property]) realMoves = true;
  }
  return realMoves
    ? { qualified: true }
    : { qualified: false, reason: `the real render does not move on ${axis} either -- the mount carries no signal for the axis it was declared for` };
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
 *     a selector would read a hover rule as resting paint. A pseudo-element is
 *     still never a NODE; since the pseudo-element read law (`pseudoReadEntry`)
 *     a `::before`/`::after` refused here is READ as its host's pseudo when that
 *     host is already in the scene, and every such refusal publishes its
 *     outcome, so `pseudo-element` in the refusal count keeps its meaning.
 *
 * THE FIRST OF THE TWO LIMITS THAT LOT NAMED IS LIFTED at `rootCompound`
 * above: a merged root carried its LAST compound's attribute values, so a
 * genuinely root-headed part rule was refused by law 1 as `head-variant-gated`
 * against attributes the family's real root never carried, and the published
 * count overstated the prop-gated cluster the wiring lots own. The root is now
 * the head compound, and those chains pass law 1 because the head IS the
 * mounted node.
 *
 * THE SECOND LIMIT STANDS FOR THIS LAW and is lifted by another: a family
 * whose part rules are headed by a root class of their OWN is out of reach of
 * law 1. `tooltip`'s bubble is headed by `.ds-tooltip-bubble`, not by a
 * compound under the mounted `.ds-tooltip.ds-tooltip--modern[data-part='root']`,
 * so its part rules are still refused as `head-not-the-family-root` here. This
 * law synthesizes nodes from selectors, and a second root synthesized from a
 * selector would be fabricated markup. The bubble is reached by
 * `REAL_RENDER_MOUNTS` instead, as the markup the engine renders when the
 * bubble is present -- a shipped static configuration, not an interaction; the
 * earlier refusal of it as "an interaction state this probe does not enter" is
 * retired there, with the reasoning.
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

/**
 * The LOGICAL EDGE longhands of an authored property, which the population
 * vocabulary does not list and the browser hands back as the physical ones.
 *
 * `tree-select` is the measured case: it paints `margin-inline-start:
 * var(--ds-tree-select-clear-gap)` on its arrow icon, a value that moves
 * 18.75px -> 21.56px between the rhythm arms in all three verticals. The
 * reading side already sees it -- the probe reads `margin-left`/`margin-right`
 * and the browser resolves the logical form into them -- but the PART side did
 * not, because `margin-inline-start` is not in `AXES.rhythm.authored`, so the
 * rule was never a part source and the node it paints was mounted for the
 * `transition` beside it, carrying `axes: ['motion']` alone.
 *
 * This expansion is used for the part vocabulary ONLY. The denominator is
 * `check/theme/population`'s and stays exactly the list that file publishes: a
 * family enters an axis's population on the authored names that file names,
 * and nothing here can add one.
 */
export function logicalEdgeLonghands(properties) {
  const edges = [];
  for (const property of properties) {
    const border = /^border-(block|inline)-width$/u.exec(property);
    if (border !== null) {
      edges.push(`border-${border[1]}-start-width`, `border-${border[1]}-end-width`);
      continue;
    }
    const box = /^(padding|margin)-(block|inline)$/u.exec(property);
    if (box !== null) edges.push(`${box[1]}-${box[2]}-start`, `${box[1]}-${box[2]}-end`);
  }
  return edges;
}

/** The authored properties whose declaration makes a rule a part source for `axis`. */
const partAuthored = (axis, { reach = true } = {}) => {
  const authored = AXES[axis].authored.length > 0 ? AXES[axis].authored : PART_STATE_AUTHORED;
  return reach ? [...authored, ...logicalEdgeLonghands(authored)] : [...authored];
};

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
 *
 * Two readings this used to get wrong, both measured on the Modern skins:
 *
 *  - A branch may carry its own parentheses (`:is([data-state~='x'],
 *    :has(> input:focus-visible))`, the radio-group option). The list is found
 *    by balancing parentheses, so a nested `:has()` no longer hides it and the
 *    branches are read as the ALTERNATIVES they are.
 *  - A branch that names an ELEMENT leads its compound rather than being glued
 *    onto the text before it: `.t.t--modern:is(a)` is `a.t.t--modern`, not the
 *    class `.t.t--moderna` no node carries. A branch naming a different element
 *    than the compound already does can never match and is dropped.
 */
export function expandAlternatives(selector, limit = ALTERNATIVE_LIMIT) {
  let list = [selector.trim()];
  for (let round = 0; round < 3; round += 1) {
    const next = [];
    let changed = false;
    for (const entry of list) {
      const found = alternativeList(entry);
      if (found === null) {
        next.push(entry);
        continue;
      }
      changed = true;
      const before = entry.slice(0, found.start);
      const after = entry.slice(found.end);
      for (const alternative of selectorList(found.body)) {
        const spliced = spliceAlternative(before, alternative, after);
        if (spliced !== null) next.push(spliced);
      }
    }
    list = next.slice(0, limit);
    if (!changed) break;
  }
  return list.map((entry) => entry.replace(/\s+/gu, ' ').trim());
}

/** The first `:is(...)`/`:where(...)` in a selector, its parentheses balanced, or `null`. */
function alternativeList(selector) {
  const opener = /:(?:is|where)\(/gu;
  for (let match = opener.exec(selector); match !== null; match = opener.exec(selector)) {
    let depth = 1;
    let quote = null;
    for (let index = match.index + match[0].length; index < selector.length; index += 1) {
      const character = selector[index];
      if (quote !== null) {
        if (character === quote) quote = null;
        continue;
      }
      if (character === '\'' || character === '"') quote = character;
      else if (character === '(') depth += 1;
      else if (character === ')') {
        depth -= 1;
        if (depth === 0) {
          return { start: match.index, end: index + 1, body: selector.slice(match.index + match[0].length, index) };
        }
      }
    }
  }
  return null;
}

const LEADING_TYPE = /^(\*|[A-Za-z][\w-]*)/u;

/** Where the compound that ends `text` starts: after its last top-level combinator, whitespace or open parenthesis. */
function compoundStart(text) {
  let depth = 0;
  for (let index = text.length - 1; index >= 0; index -= 1) {
    const character = text[index];
    if (character === ']' || character === ')') depth += 1;
    else if (character === '[') depth -= 1;
    else if (character === '(') {
      if (depth === 0) return index + 1;
      depth -= 1;
    } else if (depth === 0 && /[\s>+~,]/u.test(character)) return index + 1;
  }
  return 0;
}

/** Whether a selector is more than one compound (a combinator outside brackets and parentheses). */
function isComplex(selector) {
  let depth = 0;
  for (const character of selector.trim()) {
    if (character === '[' || character === '(') depth += 1;
    else if (character === ']' || character === ')') depth -= 1;
    else if (depth === 0 && /[\s>+~]/u.test(character)) return true;
  }
  return false;
}

/** One branch put where its `:is()` stood, an element branch leading the compound it joins; `null` when it cannot match. */
function spliceAlternative(before, alternative, after) {
  const branch = alternative.trim();
  const start = compoundStart(before);
  const head = before.slice(start);
  const type = LEADING_TYPE.exec(branch);
  if (head.length === 0 || type === null || isComplex(branch)) return `${before}${branch}${after}`;
  const rest = branch.slice(type[1].length);
  const headType = LEADING_TYPE.exec(head);
  if (headType === null) return `${before.slice(0, start)}${type[1]}${head}${rest}${after}`;
  if (type[1] === '*' || headType[1] === type[1]) return `${before}${rest}${after}`;
  if (headType[1] === '*') return `${before.slice(0, start)}${type[1]}${head.slice(1)}${rest}${after}`;
  return null;
}

const PART_CLASS_TOKEN = /\.([A-Za-z][\w-]*)/gu;
const PART_ATTRIBUTE_TOKEN = /\[([\w-]+)(?:\s*([~^|$*]?=)\s*['"]?([^\]'"]*)['"]?)?\]/gu;
const PART_TAG = /^([a-z][a-z0-9]*)/u;
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
 * The class prefixes a family's own block token may carry, longest first.
 *
 * Read off the corpus rather than invented: `rottay-bottom-tab-bar`,
 * `rt-terminal-block`, `ds-feature-workspace-frame` and the tier-prefixed
 * `ds-pattern-feature-workspace-frame` are all the same family's block.
 */
export const FAMILY_CLASS_PREFIXES = Object.freeze([
  'ds-pattern-', 'ds-structure-', 'ds-surface-', 'rottay-', 'rt-', 'ds-',
]);

/** True when `block` is the class token of `family` itself, under any admitted prefix. */
export function familyOwnsBlock(block, family) {
  if (family === null) return false;
  return FAMILY_CLASS_PREFIXES.some((prefix) => block === `${prefix}${family}`);
}

/**
 * A ROOT-LEVEL selector that is really the family's own BEM ELEMENT, mounted
 * as the descendant it is, or `null`.
 *
 * WHAT WAS UNREACHED. `terminal-block` paints every rhythm value it has on
 * `.rt-terminal-block__title-bar` and `.rt-terminal-block__body`, written
 * WITHOUT an ancestor: one compound, so `projectPartChain` returns `root-level`
 * and the selector is not even counted as a refusal. The family root wins the
 * mount on score, those nodes are never built, and a family whose body padding
 * is `1rem 1.25rem` under a fluid root that the density mode moves reads as a
 * rhythm non-mover. `bottom-tab-bar` (`__tab`, `__list`, `__icon-wrap`,
 * `__badge`) and `feature-workspace-frame` (`__frame`) are the same shape.
 *
 * WHY THIS IS NOT A FABRICATION, and the law is narrow for the same reason law
 * 1 is. `block__element` is a descendant of `block` by the convention that
 * names it, and the three families above stamp exactly that in their own TSX --
 * `<div className="rt-terminal-block__body" data-part="body">` inside
 * `<div className="rt-terminal-block" data-part="root">`. The selector itself
 * carries NO ancestor requirement, so hanging it under the root cannot make it
 * match something it would not match standing alone; what the graft buys is
 * the inheritance a private channel declared on the root needs
 * (`--_ds-bottom-tab-bar-tab-lead` is declared there and read on the tab).
 *
 * REFUSED, for the reasons the rest of this law refuses things:
 *  - a class that is not the family's own block element (`.ds-tooltip-bubble`,
 *    `.ds-auto-complete-panel`, `.ds-saved-views-menu-panel`): a separate
 *    block, and in every measured case a PORTAL the default render does not
 *    mount until an interaction opens it;
 *  - any attribute other than `data-part`, which is a variant gate;
 *  - the node the family is already mounted as.
 */
export function familyElementPart(selector, family, rootElement) {
  if (family === null) return null;
  const compound = partCompound(selector);
  if (compound.rejected !== undefined) return null;
  if (Object.keys(compound.attributes).some((name) => name !== 'data-part')) return null;
  const owned = compound.classes.filter((name) => {
    const bem = /^(.+?)__/u.exec(name);
    return bem !== null && familyOwnsBlock(bem[1], family);
  });
  if (owned.length === 0) return null;
  if (!compound.classes.every((name) => owned.includes(name) || rootElement.classes.includes(name))) return null;
  if (compoundKey(compound) === compoundKey({ tag: null, classes: rootElement.classes, attributes: rootElement.attributes })) {
    return null;
  }
  return compound;
}

const STRUCTURAL_HAS = ':has(';

/** The same selector with every `:has(...)` removed, parentheses balanced. */
export function withoutStructuralHas(selector) {
  let text = selector;
  for (;;) {
    const start = text.indexOf(STRUCTURAL_HAS);
    if (start < 0) return text.replace(/\s+/gu, ' ').trim();
    let depth = 0;
    let end = start + STRUCTURAL_HAS.length - 1;
    for (let index = start + STRUCTURAL_HAS.length - 1; index < text.length; index += 1) {
      if (text[index] === '(') depth += 1;
      else if (text[index] === ')') {
        depth -= 1;
        if (depth === 0) { end = index; break; }
      }
    }
    text = text.slice(0, start) + text.slice(end + 1);
  }
}

/**
 * True when the ONLY pseudo-class in the selector is `:has()`.
 *
 * `:has()` is a condition on the SCENE — it asks whether an element the page
 * already contains is there — so a node it gates is reachable at REST, which
 * is the opposite of `:hover`, the pseudo law 4 refuses because this probe
 * does not enter an interaction. So a `:has()` selector is not mounted; it is
 * retried against the anatomy the first pass built, and the browser decides
 * whether the condition holds. `tree-select` is the measured case: its moving
 * `margin-inline-start` is declared under
 * `[data-part='root']:has([data-part='clear-button'])`, and the clear button
 * is a node the scene builds from the family's own rules. A selector ending in
 * a pseudo-element is never retried here: it builds no node, and the
 * pseudo-element read law reads it on its host instead.
 */
export function hasOnlyStructuralHas(selector) {
  if (!selector.includes(STRUCTURAL_HAS)) return false;
  if (selector.includes('::')) return false;
  return !withoutStructuralHas(selector).includes(':');
}

/**
 * The native pseudo-classes the browser can be told to match through the
 * DevTools protocol (`CSS.forcePseudoState`), and so the only ones the native
 * half of the states axis enters. `:disabled`, `:checked` and every other
 * native pseudo are NOT in this list: nothing forces them, and a synthesized
 * `div` cannot acquire them.
 */
export const FORCED_PSEUDO_CLASSES = Object.freeze(['hover', 'active', 'focus-visible', 'focus-within', 'focus']);

const FORCED_PSEUDO = /:(?:hover|active|focus-visible|focus-within|focus)(?![\w-])/u;
const FORCED_PSEUDO_AT = /^:(?:hover|active|focus-visible|focus-within|focus)(?![\w(-])/u;

/**
 * The selector with every TOP-LEVEL forced pseudo-class removed, brackets,
 * parentheses and quotes respected.
 *
 * This is the native half's `data-state` strip (law 3 of the part law): a part
 * whose rule paints it under `:hover` is mounted AT REST, and the browser --
 * not the selector -- supplies the pseudo when a pass forces it. A resting
 * read of that node cannot match the rule, because nothing is forced at rest.
 * A pseudo inside `:not()` or `:has()` is left where it is, so the part law
 * still refuses it as a pseudo: `:not(:hover)` is a condition on the node's
 * own state and `:has(x:hover)` a condition on a node this pass does not read.
 */
export function withoutForcedPseudos(selector) {
  let out = '';
  let brackets = 0;
  let parens = 0;
  let quote = null;
  for (let index = 0; index < selector.length; index += 1) {
    const character = selector[index];
    if (quote !== null) {
      out += character;
      if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (character === '[') brackets += 1;
    else if (character === ']') brackets -= 1;
    else if (character === '(') parens += 1;
    else if (character === ')') parens -= 1;
    if (character === ':' && brackets === 0 && parens === 0) {
      const match = FORCED_PSEUDO_AT.exec(selector.slice(index));
      if (match !== null) {
        index += match[0].length - 1;
        continue;
      }
    }
    out += character;
  }
  return out.replace(/\s+/gu, ' ').trim();
}

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

/** Which native variants force a given pseudo-class, per `NATIVE_PSEUDO_FORCING`. */
const VARIANTS_OF_PSEUDO = Object.freeze({
  hover: ['hover', 'active'],
  active: ['active'],
  focus: ['focus-visible'],
  'focus-visible': ['focus-visible'],
  'focus-within': ['focus-visible'],
});

/**
 * The native variants under which ONE selector would be read in a state no
 * single pointer or keyboard produces, or an empty set.
 *
 * A pass forces its pseudo on every node at one depth of the scene at once --
 * that is what keeps the read whole-page. For the node being read that is
 * exactly a real pointer: the node and its ancestor chain match `:hover`, and
 * no descendant does. What it is NOT is the state of that node's SIBLINGS,
 * which a real pointer never hovers beside it. So a rule whose forced pseudo
 * sits on a compound followed by `+` or `~`, or inside a `:has()` that reaches
 * a sibling, can fire in a pass on a combination nothing real produces.
 * Those are measured (6 families on this tree: checkbox, input-compounds,
 * input-number, radio, slider, toggle) and their reading under the variant is
 * WITHHELD rather than credited -- under-counting is the fail-closed direction.
 */
export function forcedPseudoHazards(selector) {
  const variants = new Set();
  const text = withoutNegations(selector).replace(/\[[^\]]*\]/gu, '[]');
  for (const match of text.matchAll(new RegExp(FORCED_PSEUDO.source, 'gu'))) {
    const pseudo = match[0].slice(1);
    const tail = text.slice(match.index + match[0].length);
    const before = text.slice(0, match.index);
    const hasOpen = before.lastIndexOf(':has(');
    let insideHas = false;
    if (hasOpen >= 0) {
      let depth = 0;
      for (const character of text.slice(hasOpen + 4, match.index)) {
        if (character === '(') depth += 1;
        else if (character === ')') depth -= 1;
      }
      insideHas = depth > 0;
    }
    const hasContent = insideHas ? text.slice(hasOpen) : '';
    if (/[+~]/u.test(tail) || (insideHas && /[+~]/u.test(hasContent))) {
      for (const variant of VARIANTS_OF_PSEUDO[pseudo]) variants.add(variant);
    }
  }
  return variants;
}

/** family -> variant -> the selectors that make that variant's reading unreal for the family. */
export function familyForcedPseudoHazards(css) {
  const hazards = {};
  for (const rule of cssRules(css)) {
    for (const listed of selectorList(rule.selector)) {
      for (const selector of expandAlternatives(listed)) {
        for (const variant of forcedPseudoHazards(selector)) {
          (hazards[variant] ??= []).push(selector);
        }
      }
    }
  }
  return hazards;
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
export function familyParts(css, rootElement, axes, { family = null, partReach = true, nativePseudos = false } = {}) {
  const rules = cssRules(css);
  const parts = new Map();
  const rejected = {};
  const deferred = [];
  const pseudoEntries = [];
  const admit = (chain, selector, axis) => {
    const id = chain.map(compoundKey).join(' > ');
    if (!parts.has(id)) parts.set(id, { id, selector, chain, axes: new Set() });
    parts.get(id).axes.add(axis);
    return id;
  };
  for (const axis of axes) {
    const authored = new Set(partAuthored(axis, { reach: partReach }));
    for (const rule of rules) {
      if (!rule.declarations.some((declaration) => authored.has(declaration.property))) continue;
      for (const listed of selectorList(rule.selector)) {
        for (const authoredSelector of expandAlternatives(listed)) {
          // The NATIVE scene mounts a node whose rule is gated on a forced
          // pseudo, with the pseudo stripped exactly as law 3 strips
          // `data-state`; the stamped scene never does, so its part map is the
          // one the pre-lot run built, to the node. A pseudo-element selector
          // is left whole in both, so both scenes derive the same pseudo reads.
          const selector = nativePseudos && !authoredSelector.includes('::')
            ? withoutForcedPseudos(authoredSelector)
            : authoredSelector;
          const projection = projectPartChain(selector, rootElement);
          if (projection.rejected !== undefined) {
            const element = partReach && projection.rejected === 'root-level'
              ? familyElementPart(selector, family, rootElement)
              : null;
            if (element !== null) {
              admit([element], authoredSelector, axis);
              continue;
            }
            // A `:has()` is a condition on the SCENE, so it is retried below
            // against the anatomy this pass actually built.
            if (partReach && hasOnlyStructuralHas(selector)) deferred.push({ selector, axis });
            else if (projection.rejected !== 'root-level') {
              rejected[projection.rejected] = (rejected[projection.rejected] ?? 0) + 1;
              // Still a node refusal; the PSEUDO-ELEMENT READ LAW below decides
              // whether the paint is read on the host instead, one entry per
              // refusal so the census reconciles with the count above.
              if (projection.rejected === 'pseudo-element') pseudoEntries.push(pseudoReadEntry(authoredSelector, axis));
            }
            continue;
          }
          admit(projection.chain, authoredSelector, axis);
        }
      }
    }
  }
  // THE SECOND PASS, and it MOUNTS NOTHING: it may only add an axis to a node
  // the first pass already built.
  const built = new Set();
  for (const part of parts.values()) {
    part.chain.forEach((_, index) => built.add(part.chain.slice(0, index + 1).map(compoundKey).join(' > ')));
  }
  for (const { selector, axis } of deferred) {
    const projection = projectPartChain(withoutStructuralHas(selector), rootElement);
    if (projection.rejected !== undefined) {
      rejected[projection.rejected === 'root-level' ? 'has-root-level' : `has-${projection.rejected}`] =
        (rejected[projection.rejected === 'root-level' ? 'has-root-level' : `has-${projection.rejected}`] ?? 0) + 1;
      continue;
    }
    const id = projection.chain.map(compoundKey).join(' > ');
    if (!built.has(id)) {
      rejected['has-node-not-in-scene'] = (rejected['has-node-not-in-scene'] ?? 0) + 1;
      continue;
    }
    admit(projection.chain, selector, axis);
  }
  return {
    parts: [...parts.values()].map((part) => ({ ...part, axes: [...part.axes].sort() })),
    rejected,
    pseudoReads: pseudoReadsOf(pseudoEntries),
  };
}

/**
 * THE PSEUDO-ELEMENT READ LAW (WO-EVI-02 instrument lot, Fable review
 * 2026-10-01, ACCEPT-WITH-CHANGES). A rule that paints an axis on `::before` or
 * `::after` paints a box the BROWSER generates from the family's own CSS; the
 * part law refuses it as a node (law 4, and it still does -- `pseudo-element`
 * in `partMounts.refused` keeps that meaning), and until this lot nothing read
 * it at all. `stepper` is the measured case: its circle is
 * `[data-part='item']::after { border: var(--ds-edge-standard-width) ... }`,
 * the WIDTH channel moves 0px -> 1.5px between the depth arms (the style
 * channel reads `solid` in both), the pseudo computes 0px -> 1px, and the host
 * `item` itself paints no border at all. That is instrument visibility of
 * paint the family already ships, not a fleet change.
 *
 * WHAT IS READ, and the bounds are the law:
 *
 *  1. `::before` / `::after` at the END of the selector, and nothing else.
 *     Every other `::` -- `::placeholder`, `::marker`, `::-webkit-*`,
 *     `::-moz-*`, `::view-transition-*`, or `::after:hover` with a trailing
 *     pseudo-class -- is refused BY NAME as `ua-shadow-pseudo`:
 *     `getComputedStyle(input, '::-webkit-slider-thumb')` returns the HOST's
 *     style, so reading it would credit the host's paint to a box nobody read.
 *  2. The host is the selector minus its pseudo-element, forced pseudo-classes
 *     stripped, and it is read only where it matches a node ALREADY IN THE
 *     DEFAULT SCENE -- the family root, a part mount, a block-element part
 *     (or a supplied anatomy mount) -- under whatever law mounted that node.
 *     Nothing is mounted for a pseudo, and the host gains no axis: a pseudo is
 *     read for the axis whose OWN rule wrote the property and for no other
 *     (the per-axis law of the part mounts, unchanged). `record-facts`' shimmer
 *     is read because the block-element law already mounts
 *     `__skeleton-line`; the read inherits that law's reach and nothing more.
 *     A host the scene does not hold is `host-absent`, published, not silent.
 *  3. Credited only when `content` computes GENERATED. Chrome hands back full
 *     computed values for an ungenerated pseudo (a `content: none` box still
 *     returns its `box-shadow`), so a box that is not painted reads
 *     `ungenerated` and moves nothing.
 *  4. State reaches the pseudo THROUGH THE HOST: the stamp is written on the
 *     host and the host is matched with forced pseudo-classes stripped, so the
 *     cascade -- not this file -- decides whether `[data-state~='disabled']
 *     ::after` or `:hover::after` holds; a native pass reads a pseudo at its
 *     host's depth. `forcedPseudoHazards` withholds exactly as before.
 *  5. REAL-RENDER MOUNTS ARE OUT OF SCOPE in this lot: pseudos are read inside
 *     the default scene only, never inside a `REAL_RENDER_MOUNTS` container.
 *     The pseudo reading IS part of the default mount's reading, so law 3 of
 *     those mounts now sees it: a default mount whose pseudo moves on an axis
 *     refuses a real-render row declaring that axis, which is the correct
 *     direction and `evaluate` fails such a refusal loudly.
 *
 * Every refusal entry gets an outcome per run (`read`, `host-absent`,
 * `ungenerated`, `ua-shadow-pseudo`) and the four sum to the `pseudo-element`
 * node refusals. The families credited through a pseudo ALONE are pinned in
 * `PSEUDO_ONLY_CREDITS`. `--no-pseudo-reads` reproduces the pre-lot reading.
 */
const PSEUDO_READ = /::(before|after)\s*$/u;

/** One `pseudo-element` refusal of the part law, as the read the law permits on it, or the reason it permits none. */
export function pseudoReadEntry(selector, axis) {
  const match = PSEUDO_READ.exec(selector);
  if (match === null) return { axis, selector, refused: 'ua-shadow-pseudo' };
  return { axis, selector, host: withoutForcedPseudos(selector.slice(0, match.index)), pseudo: `::${match[1]}` };
}

/** The entries of one family as its published reads (one per axis, host and pseudo) and its census rows. */
export function pseudoReadsOf(entries) {
  const reads = [];
  const rows = entries.map((entry) => {
    if (entry.refused !== undefined) return { axis: entry.axis, selector: entry.selector, read: null, refused: entry.refused };
    let at = reads.findIndex((read) => read.axis === entry.axis && read.host === entry.host && read.pseudo === entry.pseudo);
    if (at < 0) {
      at = reads.length;
      reads.push({ axis: entry.axis, host: entry.host, pseudo: entry.pseudo });
    }
    return { axis: entry.axis, selector: entry.selector, read: at, refused: null };
  });
  return { reads, entries: rows };
}

/** The outcome of each census row, in the order a reader is told why: refused by name, never matched, matched but not painted, read. */
export const PSEUDO_READ_OUTCOMES = Object.freeze(['read', 'host-absent', 'ungenerated', 'ua-shadow-pseudo']);

/** What the page reports per read: 1 = a host matched and the box was not generated, 2 = a generated box was read. */
const PSEUDO_SEEN_UNGENERATED = 1;
const PSEUDO_SEEN_READ = 2;

/**
 * THE PSEUDO-ONLY CREDITS, pinned for exact equality on a full run in both
 * directions, exactly as `UNMOUNTABLE_FAMILIES` is: a pinned family that stops
 * moving through its pseudo alone fails, and a new one that starts fails until
 * it is pinned here with its measurement.
 *
 * "Pseudo-only" is the family's HOST reading not moving, its real render (if a
 * row credited one) not moving, and its pseudo reading moving. Each entry
 * names the property that reading must move first, the channel that must move
 * between the arms (and, for stepper, the one that must NOT), read on the root
 * of the same page in every positive cell of the axis.
 *
 * Measured 2026-10-01 (P1, Fable-reproduced) in all six cells: depth crosses
 * the 80 % bar by ONE family on the declared denominator (160/199), and this
 * pin is what makes losing it loud.
 */
export const PSEUDO_ONLY_CREDITS = Object.freeze({
  depth: Object.freeze({
    stepper: Object.freeze({
      pseudo: ".ds-stepper--modern[data-part='root'] [data-part='item'][data-part='item']::after",
      property: 'border-top-width',
      moves: '--ds-edge-standard-width',
      holds: '--ds-edge-standard-style',
    }),
  }),
  motion: Object.freeze({
    'record-facts': Object.freeze({
      pseudo: '.ds-pattern-record-facts .ds-record-facts__skeleton-line::after',
      property: 'animation-duration',
      moves: '--ds-motion-duration-scale',
    }),
  }),
});

/** family -> the reads a page takes, off a part map; `null` when the law is off or nothing is read. */
export function pseudoReadPlan(byFamily, { applied = true } = {}) {
  if (!applied) return null;
  const plan = {};
  for (const [family, record] of byFamily) {
    const reads = record.pseudoReads?.reads ?? [];
    if (reads.length > 0) plan[family] = reads;
  }
  return Object.keys(plan).length === 0 ? null : plan;
}

const pseudoReadKey = (family, read) => `${family}\u0000${read.axis}\u0000${read.host}\u0000${read.pseudo}`;

/** In the page: what every read of this page saw over all its readings, `family -> read index -> 1 | 2`. */
const takePseudoSeen = () => window.__axisPseudoSeen ?? {};

/** Folds one page's sightings into `into` (read key -> strongest sighting), keyed by the read, not its index. */
export async function collectPseudoSeen(page, plan, into) {
  if (plan === null) return into;
  const seen = await page.evaluate(takePseudoSeen);
  for (const [family, byIndex] of Object.entries(seen)) {
    for (const [index, mark] of Object.entries(byIndex)) {
      const read = plan[family]?.[Number(index)];
      if (read === undefined) continue;
      const key = pseudoReadKey(family, read);
      into.set(key, Math.max(into.get(key) ?? 0, mark));
    }
  }
  return into;
}

/**
 * The per-entry census: every `pseudo-element` refusal of the part law with
 * the outcome the read law gave it this run, reconciled against the node
 * refusal count it was taken from. A reader can see from this alone that the
 * lot read pseudos without un-refusing a single node.
 */
export function pseudoReadCensus(byFamily, seen, { applied = true, nodeRefusals = 0 } = {}) {
  const entries = [];
  for (const [family, record] of byFamily) {
    const { reads = [], entries: rows = [] } = record.pseudoReads ?? {};
    for (const row of rows) {
      let outcome;
      if (row.refused !== null) outcome = row.refused;
      else if (!applied) outcome = 'not-read';
      else {
        const mark = seen.get(pseudoReadKey(family, reads[row.read])) ?? 0;
        outcome = mark >= PSEUDO_SEEN_READ ? 'read' : mark >= PSEUDO_SEEN_UNGENERATED ? 'ungenerated' : 'host-absent';
      }
      entries.push({ family, axis: row.axis, selector: row.selector, outcome });
    }
  }
  const census = Object.fromEntries([...PSEUDO_READ_OUTCOMES, ...(applied ? [] : ['not-read'])].map((outcome) => [outcome, 0]));
  for (const entry of entries) census[entry.outcome] = (census[entry.outcome] ?? 0) + 1;
  return {
    census,
    reconciliation: { nodeRefusals, entries: entries.length, equal: nodeRefusals === entries.length },
    entries,
  };
}

/**
 * One family's three sources on one axis of one cell: its host reading, its
 * pseudo reading and its real render, each compared arm against arm. A credit
 * is pseudo-ONLY when the pseudo source alone moves.
 */
export function pseudoSources({ before, after, family, axis, real = false }) {
  const source = (key) => differsOnAxis(axis, realRenderView(before, family, key), realRenderView(after, family, key), family);
  return {
    family,
    hosts: source('#hosts'),
    pseudo: source('#pseudo'),
    real: real ? source(REAL_RENDER_KEY.real) : null,
  };
}

const PENDING_PSEUDO = Symbol('pending pseudo-only verdicts');

/** After law 3 has settled a cell's credits: which of its movers moved through the pseudo reading alone. */
export function resolvePseudoOnly(cells) {
  for (const cell of cells) {
    const record = cell[PENDING_PSEUDO];
    if (record === undefined) continue;
    delete cell[PENDING_PSEUDO];
    resolvePseudoOnlyFrom(cell, record);
  }
}

/** One cell's verdict off its pending sources; it reads `movedIds` and never edits it. */
export function resolvePseudoOnlyFrom(cell, { sources, channels }) {
  const credited = cell.realRender?.credited ?? [];
  cell.pseudoMoved = sources.filter((entry) => entry.pseudo !== null).map((entry) => entry.family);
  cell.pseudoOnly = sources
    .filter((entry) => (cell.movedIds ?? []).includes(entry.family) && entry.pseudo !== null && entry.hosts === null
      && !(entry.real !== null && credited.includes(entry.family)))
    .map((entry) => ({ family: entry.family, property: entry.pseudo }));
  cell.pseudoChannels = channels;
  return cell;
}

/** Every channel a pseudo-only pin names, read on each arm's root beside the pair's own. */
export const pseudoPinChannels = (pins = PSEUDO_ONLY_CREDITS) => [...new Set(Object.values(pins)
  .flatMap((byFamily) => Object.values(byFamily))
  .flatMap((pin) => [pin.moves, pin.holds].filter(Boolean)))].sort();

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
export function familyAxisParts(root = CORE_ROOT, only = null, elements = null, { partReach = true, nativePseudos = false } = {}) {
  const resolved = elements ?? familyElements(root, only);
  const populations = axisPopulations(root);
  const byFamily = new Map();
  for (const [family, files] of skinFamilies(root)) {
    if (only && !only.includes(family)) continue;
    const rootElement = resolved.get(family);
    if (!rootElement) continue;
    const declared = AXIS_IDS.filter((axis) => populations.get(axis).includes(family));
    const css = files.map((file) => readFileSync(file, 'utf8')).join('\n');
    const record = familyParts(css, rootElement, declared, { family, partReach, nativePseudos });
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
 * `pseudo-element` is a NODE refusal and stays one: the pseudo-element read law
 * reads the box on its host instead, and `pseudoReads` (here per family, and
 * the run's census) accounts for every one of those refusals. The
 * `has-*` reasons are the second pass's own: a `:has()` selector that still
 * does not project (`has-head-variant-gated`) or whose target node the scene
 * never built (`has-node-not-in-scene`), which is the fail-closed direction --
 * that pass may add an axis to a node, never a node to the scene.
 */
export function partMountReport(byFamily, { applied = true, partReach = true, unmountableCandidates = [] } = {}) {
  const perAxis = Object.fromEntries(AXIS_IDS.map((axis) => [axis, { families: 0, parts: 0 }]));
  const refused = {};
  const map = {};
  const pseudoReads = {};
  let nodes = 0;
  for (const [family, record] of byFamily) {
    for (const [reason, count] of Object.entries(record.rejected)) {
      refused[reason] = (refused[reason] ?? 0) + count;
    }
    // The hosts the pseudo-element read law derived for this family, beside
    // its parts: `axis -> host::pseudo`, the reads a run may take.
    for (const read of record.pseudoReads?.reads ?? []) {
      ((pseudoReads[family] ??= {})[read.axis] ??= []).push(`${read.host}${read.pseudo}`);
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
    partReach,
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
    pseudoReads,
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
export function sceneHtml({ css, vertical, theme, elements, mounts = null, partMounts = null, realRenders = [] }) {
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
  const real = realRenders.map((mount) =>
    `\n<div data-axis-real-render="${mount.family}" data-axis-real-axes="${mount.axes.join(' ')}"`
    + ` data-axis-real-row="${mount.row ?? mount.family}" data-axis-real-stamped="${(mount.stampedParts ?? []).join(' ')}">`
    + `${mount.markup}</div>`).join('');
  return `<!doctype html><html ${attributes}><head><style>${css}</style></head>`
    + `<body><div id="axis-scene">${nodes}${real}</div></body></html>`;
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
export const STATE_VARIANTS = Object.freeze(['hovered', 'pressed', 'selected', 'focus-visible', 'disabled', 'focused']);

/*
 * `focused` is the sixth, since S1, and the one the scene used to leave out.
 * The anatomy kernel serializes it (`foundation/behavior/kernel/anatomy`,
 * `STATE_FLAG_ORDER`: disabled, hovered, pressed, focused, focusVisible) and
 * `useInteractionState` sets it on every focus, pointer or keyboard -- a
 * pointer focus writes `focused` alone, a keyboard focus `focused
 * focus-visible` -- so a node stamped `focused` alone is the state a click
 * leaves, not a fabrication. S0 measured 37 skin rules gated on it and reached
 * by neither half (`unstamped-state`). It is appended LAST so every state
 * read before it is read in the order, and reports the first property, it
 * always did. `--no-focused-stamp` reproduces the five-state set.
 */

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

/**
 * True when a scenario's cells read the states axis -- its positive, a control
 * that must hold it at zero, or a witness taken on it -- and so need the
 * native half. Every other arm is never compared under a state.
 */
export function readsStatesAxis(scenario) {
  if (scenario.kind === 'positive') return scenario.axis === 'states';
  return (scenario.expectZeroOn ?? []).includes('states') || scenario.witness?.axis === 'states';
}

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

const readComputed = ({
  properties, axisOf, depth = null, realRender = false, realStates = false, keys = null, pseudoReads = null,
}) => {
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
      // A native pass reads only the nodes it forced, one entry per target so
      // the passes merge back into the stamped reading's shape.
      values[property] = depth === null
        ? targets.map((target) => styleOf(target).getPropertyValue(property)).join(' | ')
        : targets.map((target) => (Number(target.getAttribute('data-axis-depth')) === depth
          ? styleOf(target).getPropertyValue(property)
          : null));
    }
    out[family] = values;
    // THE PSEUDO-ELEMENT READ LAW (`pseudoReadsOf`): a `::before`/`::after`
    // the family's own rule paints an axis on, read on a host the DEFAULT
    // scene already holds -- the root, a part, or a supplied anatomy -- for
    // that axis alone, and credited only where its box is generated. The
    // family's reading gains it; the host reading alone (`#hosts`) and the
    // pseudo reading alone (`#pseudo`) are kept beside it so a credit that
    // rests on the pseudo ALONE can be told apart and pinned.
    const reads = pseudoReads?.[family];
    if (reads !== undefined && reads.length > 0) {
      const seen = (window.__axisPseudoSeen ??= {});
      const hosts = mounted ? anatomy : [node, ...parts];
      const matched = reads.map((read) => hosts.filter((host) => {
        try {
          return host.matches(read.host);
        } catch {
          return false;
        }
      }));
      const boxes = new Map();
      const boxOf = (host, pseudo) => {
        const key = boxes.get(host) ?? {};
        key[pseudo] ??= getComputedStyle(host, pseudo);
        boxes.set(host, key);
        return key[pseudo];
      };
      const pseudoValues = {};
      out[`${family}#hosts`] = { ...values };
      for (const property of properties) {
        const axis = axisOf[property];
        const taken = [];
        reads.forEach((read, index) => {
          if (read.axis !== axis) return;
          for (const host of matched[index]) {
            if (depth !== null && Number(host.getAttribute('data-axis-depth')) !== depth) {
              taken.push(null);
              continue;
            }
            const box = boxOf(host, read.pseudo);
            const content = box.getPropertyValue('content');
            const generated = content !== 'none' && content !== 'normal' && content !== '';
            const mark = generated ? 2 : 1;
            const familySeen = (seen[family] ??= {});
            familySeen[index] = Math.max(familySeen[index] ?? 0, mark);
            taken.push(generated ? `${read.pseudo}=${box.getPropertyValue(property)}` : `${read.pseudo}=ungenerated`);
          }
        });
        pseudoValues[property] = depth === null ? taken.join(' | ') : taken;
        if (taken.length === 0) continue;
        values[property] = depth === null ? `${values[property]} || ${taken.join(' | ')}` : [...values[property], ...taken];
      }
      out[`${family}#pseudo`] = pseudoValues;
    }
  }
  // The real-render mounts. At REST (`realRender`) a mount is read on the
  // resting axes its row declares; under a stamped state or a forced pass
  // (`realStates`) only a row that declares `states` is read, on every
  // property, because a state may change any of them (law 5). The family's own
  // reading gains them; its default mount alone and the real render alone are
  // published beside it so law 3 is decided off the same reading the
  // numerator is taken from. A family with two rows reads both as ONE real
  // render, in document order.
  if (realRender || realStates) {
    const byFamily = new Map();
    for (const container of document.querySelectorAll('[data-axis-real-render]')) {
      const family = container.getAttribute('data-axis-real-render');
      if (out[family] === undefined) continue;
      const axes = container.getAttribute('data-axis-real-axes').split(' ');
      const readable = realStates
        ? (axes.includes('states') ? () => true : () => false)
        : (property) => axisOf[property] !== 'states' && axes.includes(axisOf[property]);
      if (!properties.some(readable)) continue;
      const nodes = [...container.querySelectorAll('*')].filter((node) => !node.hasAttribute('data-axis-real-host'));
      if (!byFamily.has(family)) {
        byFamily.set(family, { own: Object.fromEntries(properties.map((property) => [property, out[family][property]])), real: {} });
      }
      const { real } = byFamily.get(family);
      for (const property of properties) {
        if (!readable(property)) continue;
        if (depth === null) {
          const value = nodes.map((node) => styleOf(node).getPropertyValue(property)).join(' | ');
          real[property] = real[property] === undefined ? value : `${real[property]} | ${value}`;
        } else {
          real[property] = [...(real[property] ?? []), ...nodes.map((node) => (Number(node.getAttribute('data-axis-depth')) === depth
            ? styleOf(node).getPropertyValue(property)
            : null))];
        }
      }
    }
    for (const [family, { own, real }] of byFamily) {
      for (const property of Object.keys(real)) {
        out[family][property] = depth === null ? `${own[property]} | ${real[property]}` : [...own[property], ...real[property]];
      }
      out[`${family}${keys.default}`] = own;
      out[`${family}${keys.real}`] = real;
    }
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

const stampState = ({ state, stampAttributes, realStates = false }) => {
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
  const groups = [...document.querySelectorAll('[data-axis-family]')].map((node) => (
    // A synthesized family is stamped on its root AND its mounted parts. A part
    // is mounted at rest with its `data-state` stripped precisely so the scene,
    // not the selector, supplies the state -- and a part nobody stamped could
    // never move on an axis whose rules are state-gated. Real anatomy already
    // carries its resting state tokens, and the skins match with `~=`, so the
    // probed state is ADDED to them and later restored.
    node.hasAttribute('data-axis-mount')
      ? [...node.querySelectorAll(':scope > *, [data-part]')]
      : [node, ...node.querySelectorAll('[data-axis-part]')]));
  // A real-render mount that declares `states` (law 5) is stamped on the parts
  // its engine hands the kernel's `partAttributes` -- the only nodes of that
  // markup that ever carry `data-state` -- and on no other.
  if (realStates) {
    for (const container of document.querySelectorAll('[data-axis-real-render]')) {
      if (!container.getAttribute('data-axis-real-axes').split(' ').includes('states')) continue;
      const parts = (container.getAttribute('data-axis-real-stamped') ?? '').split(' ').filter(Boolean);
      groups.push([...container.querySelectorAll('[data-part]')].filter((node) => parts.includes(node.getAttribute('data-part'))));
    }
  }
  for (const targets of groups) {
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
        if (JSON.stringify(previous[family]?.[property]) !== JSON.stringify(current[family]?.[property])) {
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
  realRender = false,
  pseudoReads = null,
}) {
  const applied = await page.evaluate(applyVariables, variables);
  const unsettled = new Set();
  const collect = async (plan = {}) => {
    const reading = await readSettled(page, { properties, axisOf, pseudoReads, ...plan });
    for (const key of reading.unsettled) unsettled.add(key.split('#')[0]);
    return reading.values;
  };
  const base = await collect(realRender ? { realRender: true, keys: REAL_RENDER_KEY } : {});
  const states = {};
  const stampAttributes = STATE_STAMP_ATTRIBUTES;
  // Law 5: a mount that declares `states` is stamped and read under every
  // state; the rest of the real renders are neither.
  const realStates = realRender;
  for (const state of variants) {
    await page.evaluate(stampState, { state, stampAttributes, realStates });
    states[state] = await collect(realStates ? { realStates: true, keys: REAL_RENDER_KEY } : {});
  }
  await page.evaluate(stampState, { state: null, stampAttributes, realStates });
  return { applied, base, states, unsettled: [...unsettled].sort() };
}

/**
 * THE NATIVE-PSEUDO HALF of the states axis: `:hover`, `:active` and
 * `:focus-visible` matched by the browser itself, forced through the DevTools
 * protocol (`CSS.forcePseudoState`) -- never a class, never a rewritten rule.
 *
 * Each variant forces what a real pointer or keyboard produces on the node it
 * lands on. `:hover` and `:active` also match every ANCESTOR of that node, so
 * the chain is forced with it; a pressed pointer is a hovered one, so `active`
 * carries `hover`. Focus is the exception: one element holds it, and its
 * ancestors match `:focus-within` and nothing else.
 */
export const NATIVE_PSEUDO_VARIANTS = Object.freeze(['hover', 'active', 'focus-visible']);

export const NATIVE_PSEUDO_FORCING = Object.freeze({
  hover: Object.freeze({ target: Object.freeze(['hover']), ancestors: Object.freeze(['hover']) }),
  active: Object.freeze({ target: Object.freeze(['hover', 'active']), ancestors: Object.freeze(['hover', 'active']) }),
  'focus-visible': Object.freeze({
    target: Object.freeze(['focus', 'focus-visible', 'focus-within']),
    ancestors: Object.freeze(['focus-within']),
  }),
});

/**
 * Stamps every node of every family with its depth below the family root and
 * returns, in document order, the family, the depth and the ancestor chain of
 * each. A mounted anatomy starts at the wrapper's children: the wrapper is the
 * probe's, and no skin rule selects it.
 */
const indexNativeNodes = (realStates = false) => {
  const nodes = [];
  const walk = (element, family, depth, ancestors) => {
    const index = nodes.length;
    element.setAttribute('data-axis-depth', String(depth));
    element.setAttribute('data-axis-native-node', String(index));
    nodes.push({ family, depth, ancestors });
    for (const child of element.children) walk(child, family, depth + 1, [...ancestors, index]);
  };
  for (const node of document.querySelectorAll('[data-axis-family]')) {
    const family = node.getAttribute('data-axis-family');
    const top = node.hasAttribute('data-axis-mount') ? [...node.children] : [node];
    for (const element of top) walk(element, family, 0, []);
  }
  // A real-render mount that declares `states` is forced like a mounted
  // anatomy (law 5): from the container's children down, its host elements
  // included -- they are real ancestors a pointer on the node hovers too --
  // though a host is never read.
  if (realStates) {
    for (const container of document.querySelectorAll('[data-axis-real-render]')) {
      if (!container.getAttribute('data-axis-real-axes').split(' ').includes('states')) continue;
      const family = container.getAttribute('data-axis-real-render');
      for (const element of container.children) walk(element, family, 0, []);
    }
  }
  return nodes;
};

/**
 * One pass per depth, merged back into one reading per family.
 *
 * The node read in a pass is the node the pointer is ON: it and its ancestors
 * are forced, nothing below it is. Every target of the family at that depth is
 * forced together, so the pass stays whole-page; siblings are the one relation
 * where that is not a single pointer, which is what `forcedPseudoHazards`
 * withholds.
 */
export function mergeDepthPasses(passes) {
  const merged = {};
  for (const reading of passes) {
    for (const [family, values] of Object.entries(reading)) {
      merged[family] ??= {};
      for (const [property, list] of Object.entries(values)) {
        const into = merged[family][property] ?? list.map(() => null);
        list.forEach((value, index) => {
          if (into[index] === null && value !== null) into[index] = value;
        });
        merged[family][property] = into;
      }
    }
  }
  for (const values of Object.values(merged)) {
    for (const [property, list] of Object.entries(values)) values[property] = list.join(' | ');
  }
  return merged;
}

/**
 * The native readings of every arm, keyed by `arm.key`, taken on a page whose
 * scene is already set: `variant -> family -> property -> value`, in the shape
 * `measureCell` returns its stamped states in.
 *
 * The loop is variant, then depth, then arm, so a node is forced once per pass
 * and every arm is read under the same forcing. `withheld` is `family ->
 * variants` whose reading is dropped rather than credited, and a family that
 * never settles under a pass is dropped from every variant of that arm too.
 */
export async function measureNativeHalf({
  page,
  arms,
  properties,
  axisOf = axisByProperty(),
  variants = NATIVE_PSEUDO_VARIANTS,
  withheld = new Map(),
  realRender = false,
  pseudoReads = null,
}) {
  const nodes = await page.evaluate(indexNativeNodes, realRender);
  const cdp = await page.context().newCDPSession(page);
  const unsettled = new Set();
  const passes = new Map(arms.map((arm) => [arm.key, Object.fromEntries(variants.map((variant) => [variant, []]))]));
  let forced = 0;
  const depths = [...new Set(nodes.map((node) => node.depth))].sort((left, right) => left - right);
  try {
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');
    const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
    const { nodeIds } = await cdp.send('DOM.querySelectorAll', {
      nodeId: root.nodeId,
      selector: '[data-axis-native-node]',
    });
    if (nodeIds.length !== nodes.length) {
      throw new Error(`axis-difference: the protocol resolved ${nodeIds.length} of the ${nodes.length} scene nodes`);
    }
    const force = (indices, classes) => Promise.all(indices.map((index) =>
      cdp.send('CSS.forcePseudoState', { nodeId: nodeIds[index], forcedPseudoClasses: [...classes] })));
    for (const variant of variants) {
      const forcing = NATIVE_PSEUDO_FORCING[variant];
      if (forcing === undefined) throw new Error(`axis-difference: no forcing is declared for ${variant}`);
      for (const depth of depths) {
        const targets = nodes.flatMap((node, index) => (node.depth === depth ? [index] : []));
        const ancestors = [...new Set(targets.flatMap((index) => nodes[index].ancestors))];
        await force(ancestors, forcing.ancestors);
        await force(targets, forcing.target);
        forced += targets.length;
        try {
          for (const arm of arms) {
            await page.evaluate(applyVariables, arm.variables);
            const reading = await readSettled(page, {
              properties, axisOf, depth, pseudoReads, ...(realRender ? { realStates: true, keys: REAL_RENDER_KEY } : {}),
            });
            for (const family of reading.unsettled) unsettled.add(family.split('#')[0]);
            passes.get(arm.key)[variant].push(reading.values);
          }
        } finally {
          await force([...ancestors, ...targets], []);
        }
      }
    }
  } finally {
    await cdp.detach().catch(() => {});
  }
  const readings = new Map();
  for (const arm of arms) {
    const byVariant = {};
    for (const variant of variants) {
      const merged = mergeDepthPasses(passes.get(arm.key)[variant]);
      // A family's mount keys go with it: a withheld or unsettled family is
      // withheld or dropped on its real render too.
      for (const key of Object.keys(merged)) {
        const family = key.split('#')[0];
        if (unsettled.has(family) || (withheld.get(family) ?? []).includes(variant)) delete merged[key];
      }
      byVariant[variant] = merged;
    }
    readings.set(arm.key, byVariant);
  }
  return { readings, unsettled: [...unsettled].sort(), nodes: nodes.length, depths: depths.length, forced };
}

/**
 * THE POSITIVE CONTROL OF THE FORCING, run through the same code path before
 * any family is read: a scene whose knob paints under an ANCESTOR's `:hover`,
 * its own `:active` and its own `:focus-visible`. A variant whose forced
 * reading does not reach that paint, or whose resting reading afterwards is
 * not the resting reading before, is refused for the whole run.
 */
export const NATIVE_CALIBRATION = Object.freeze({
  css: [
    ".ds-calibration[data-part='root']:hover > [data-part='knob'] { opacity: 0.25; }",
    ".ds-calibration[data-part='root'] > [data-part='knob']:active { transform: scale(0.5); }",
    ".ds-calibration[data-part='root'] > [data-part='knob']:focus-visible { outline-offset: 5px; }",
  ].join('\n'),
  element: Object.freeze({ classes: ['ds-calibration'], attributes: { 'data-part': 'root' } }),
  parts: Object.freeze([{ chain: [{ tag: null, classes: [], attributes: { 'data-part': 'knob' } }], axes: ['states'] }]),
  expected: Object.freeze({
    hover: Object.freeze({ property: 'opacity', value: '1 | 0.25' }),
    active: Object.freeze({ property: 'transform', value: 'none | matrix(0.5, 0, 0, 0.5, 0, 0)' }),
    'focus-visible': Object.freeze({ property: 'outline-offset', value: '0px | 5px' }),
  }),
});

export async function calibrateNativeForcing(context, { variants = NATIVE_PSEUDO_VARIANTS } = {}) {
  const page = await context.newPage();
  const properties = allProperties();
  const axisOf = axisByProperty();
  try {
    await page.setContent(sceneHtml({
      css: NATIVE_CALIBRATION.css,
      vertical: 'bithire',
      theme: 'light',
      elements: new Map([['calibration', NATIVE_CALIBRATION.element]]),
      partMounts: new Map([['calibration', { parts: NATIVE_CALIBRATION.parts }]]),
    }), { waitUntil: 'load' });
    const rest = (await readSettled(page, { properties, axisOf })).values.calibration;
    const native = await measureNativeHalf({ page, arms: [{ key: 'calibration', variables: {} }], properties, axisOf, variants });
    const after = (await readSettled(page, { properties, axisOf })).values.calibration;
    const reading = native.readings.get('calibration');
    const out = {};
    for (const variant of variants) {
      const { property, value } = NATIVE_CALIBRATION.expected[variant];
      const forcedValue = reading[variant]?.calibration?.[property] ?? null;
      out[variant] = {
        property,
        expected: value,
        rest: rest[property],
        forced: forcedValue,
        restAfter: after[property],
        reached: forcedValue === value && rest[property] !== value && after[property] === rest[property],
      };
    }
    return out;
  } finally {
    await page.close();
  }
}

/** One `[data-state ...]`/`[data-disabled ...]` attribute selector: name, operator, value (in one of three quotings). */
const STAMP_TOKEN = /\[(data-state|data-disabled)(?:\s*([~*^$|]?=)\s*(?:'([^']*)'|"([^"]*)"|([^\]\s]*)))?\s*\]/gu;

/**
 * Whether a stamped state of the scene writes a value that satisfies one
 * attribute selector. The scene writes `data-state` from `STATE_VARIANTS` and
 * the extra attributes of `STATE_STAMP_ATTRIBUTES`, and nothing else: a rule
 * gated on `[data-state='error']`, `'empty'`, `'buttons'` is gated on a DOMAIN
 * value a component writes about its data, and the stamp never enters it.
 * Stripping every `data-state` token regardless of its value credited two
 * families (branding-preview-sandbox, detail) with reach through exactly that
 * hole (census 2026-09-30).
 */
function stampWrites(name, operator, value, stamped = STATE_VARIANTS) {
  if (operator === undefined) return true;
  const written = name === 'data-state'
    ? stamped
    : Object.values(STATE_STAMP_ATTRIBUTES).flatMap((attributes) => (Object.hasOwn(attributes, name) ? [attributes[name]] : []));
  return written.some((candidate) => {
    if (operator === '=' || operator === '~=') return candidate === value;
    if (operator === '*=') return candidate.includes(value);
    if (operator === '^=') return candidate.startsWith(value);
    if (operator === '$=') return candidate.endsWith(value);
    return candidate === value || candidate.startsWith(`${value}-`);
  });
}

/**
 * Whether the stamp can enter a stamped selector (negations already removed).
 * It needs one token a stamp writes. A DOMAIN token beside it is kept in the
 * probe when a node could carry it at rest alongside the stamp (`~=`, `*=`,
 * `^=` over a space-separated list that the stamp only appends to); an exact,
 * suffix or dash match on a domain value cannot hold once the stamp is added.
 */
function stampGate(selector, stamped = STATE_VARIANTS) {
  let stamps = 0;
  let enterable = true;
  let kernel = false;
  for (const [, name, operator, single, double, bareValue] of selector.matchAll(STAMP_TOKEN)) {
    const value = single ?? double ?? bareValue;
    if (stampWrites(name, operator, value, stamped)) stamps += 1;
    else {
      if (name === 'data-state' && KERNEL_STATE_TOKENS.includes(value)) kernel = true;
      if (!['~=', '*=', '^='].includes(operator)) enterable = false;
    }
  }
  if (enterable && stamps > 0) return { enterable: true, reason: null };
  return { enterable: false, reason: kernel ? 'unstamped-state' : 'domain-state-value' };
}

/**
 * Every token the anatomy kernel serializes into `data-state`
 * (`foundation/behavior/kernel/anatomy`, `STATE_FLAG_ORDER` through
 * `serializeState`). Since S1 every one of them is in `STATE_VARIANTS`; a rule
 * gated on one a run does NOT stamp (`--no-focused-stamp`,
 * `--no-states-disabled`) is a real interaction state that run leaves out
 * (`unstamped-state`), which is a different finding from a rule gated on a
 * value the component writes about its DATA (`domain-state-value`).
 */
export const KERNEL_STATE_TOKENS = Object.freeze(['disabled', 'hovered', 'pressed', 'focused', 'focus-visible']);

/**
 * The state rules one family's skin writes, each read as a selector the scene
 * can be asked about: `vocabulary` says which half could enter it, `reason`
 * why neither can when that is decided before the browser is asked, and
 * `owners` the axes whose properties it declares (`null` when it writes a
 * custom property, which may feed any of them).
 */
export function stateRuleProbes(css, { stamped = STATE_VARIANTS, pseudoReads = true } = {}) {
  const probes = [];
  const authoredOwner = new Map();
  for (const axis of AXIS_IDS) {
    for (const property of partAuthored(axis)) authoredOwner.set(property, axis);
  }
  for (const rule of cssRules(css)) {
    const owners = new Set();
    let custom = false;
    for (const declaration of rule.declarations) {
      if (declaration.property.startsWith('--')) custom = true;
      else if (authoredOwner.has(declaration.property)) owners.add(authoredOwner.get(declaration.property));
    }
    for (const listed of selectorList(rule.selector)) {
      for (const authored of expandAlternatives(listed)) {
        // Under the pseudo-element read law a `::before`/`::after` state rule
        // is asked about through its HOST, and the page says whether the box
        // is generated there; any other `::` is refused by name.
        const pseudoMatch = pseudoReads && authored.includes('::') ? PSEUDO_READ.exec(authored) : null;
        const pseudo = pseudoMatch === null ? null : `::${pseudoMatch[1]}`;
        const selector = pseudo === null ? authored : authored.slice(0, pseudoMatch.index).trim();
        const bare = withoutNegations(selector);
        const forced = FORCED_PSEUDO.test(bare);
        const stampedRule = /\[data-state\b|\[data-disabled\b/u.test(bare);
        if (!forced && !stampedRule) continue;
        const gate = forced || !stampedRule ? null : stampGate(bare, stamped);
        let reason = null;
        if (forced && stampedRule) reason = 'needs-pseudo-and-stamp';
        else if (gate !== null && !gate.enterable) reason = gate.reason;
        else if (selector.includes('::')) reason = pseudoReads ? 'ua-shadow-pseudo' : 'pseudo-element';
        else if (!custom && owners.size === 0) reason = 'unread-property';
        else if (forced && forcedPseudoHazards(selector).size > 0) reason = 'relational';
        else if (forced && FORCED_PSEUDO.test(withoutNegations(withoutForcedPseudos(selector)))) reason = 'pseudo-inside-has';
        // A negation OF the stamp holds on every stamped state but one, so it
        // goes with the stamp rather than leaving an empty `:not()` behind.
        const probe = forced
          ? withoutForcedPseudos(selector)
          : selector
            .replace(/:not\([^()]*\[data-(?:state|disabled)\b[^()]*\)/gu, '')
            .replace(STAMP_TOKEN, (token, name, operator, single, double, bareValue) =>
              (stampWrites(name, operator, single ?? double ?? bareValue, stamped) ? '' : token));
        probes.push({
          vocabulary: forced ? 'native' : 'stamped',
          selector: authored,
          probe: probe.trim().length === 0 ? '*' : probe,
          owners: custom ? null : [...owners].sort(),
          reason,
          ...(pseudo === null ? {} : { pseudo }),
        });
      }
    }
  }
  return probes;
}

/** In the page: which probes select a node the half actually READS for an axis the rule writes. */
const censusReach = (entries) => {
  // The stamp reaches a node of a real mount only through a part the kernel
  // stamps: the node itself or an ancestor inside the mount (law 5).
  const stampedPartOn = (container, node) => {
    const parts = (container.getAttribute('data-axis-real-stamped') ?? '').split(' ').filter(Boolean);
    for (let at = node; at !== null && at !== container; at = at.parentElement) {
      if (parts.includes(at.getAttribute('data-part'))) return true;
    }
    return false;
  };
  // A pseudo-element probe is reached only where its host's box is GENERATED;
  // a host that matches and paints nothing is not reach (the read law, 3).
  const generated = (node, pseudo) => {
    const content = getComputedStyle(node, pseudo).getPropertyValue('content');
    return content !== 'none' && content !== 'normal' && content !== '';
  };
  const out = {};
  for (const { family, probes } of entries) {
    const result = probes.map((probe) => (probe.pseudo === undefined ? 'no-node' : 'pseudo-element-host-absent'));
    probes.forEach((probe, index) => {
      if (probe.reason !== null) {
        result[index] = probe.reason;
        return;
      }
      let matched;
      try {
        matched = [...document.querySelectorAll(probe.probe)];
      } catch {
        result[index] = 'invalid-selector';
        return;
      }
      for (const node of matched) {
        // A real-render mount that declares `states` is read under both halves
        // (law 5), every node but a host; one that does not is never read
        // under a state.
        const container = node.closest('[data-axis-real-render]');
        if (container !== null) {
          // The read law is bounded to the default scene: a pseudo inside a
          // real-render mount is never read.
          if (probe.pseudo !== undefined) continue;
          if (container.getAttribute('data-axis-real-render') !== family || node.hasAttribute('data-axis-real-host')) continue;
          if (container.getAttribute('data-axis-real-axes').split(' ').includes('states')
            && (probe.vocabulary !== 'stamped' || stampedPartOn(container, node))) {
            result[index] = 'reached';
            return;
          }
          result[index] = 'node-not-read';
          continue;
        }
        const owner = node.closest('[data-axis-family]');
        if (owner === null || owner.getAttribute('data-axis-family') !== family) continue;
        if (probe.pseudo !== undefined) {
          // The host must be a node the scene reads -- root, part or anatomy --
          // and the box must be generated on it.
          if (node !== owner && !owner.hasAttribute('data-axis-mount') && !node.hasAttribute('data-axis-part')) continue;
          if (generated(node, probe.pseudo)) {
            result[index] = 'reached';
            return;
          }
          result[index] = 'pseudo-element-ungenerated';
          continue;
        }
        const read = node === owner
          || owner.hasAttribute('data-axis-mount')
          || (node.hasAttribute('data-axis-part') && (probe.owners === null
            || node.getAttribute('data-axis-part').split(' ').some((axis) => probe.owners.includes(axis))));
        if (read) {
          result[index] = 'reached';
          return;
        }
        result[index] = 'node-not-read';
      }
    });
    out[family] = result;
  }
  return out;
};

/**
 * In the page: per real-render ROW, how many of its family's state rules
 * (by half, refused rules left out) select a node of that mount -- whether or
 * not the row declares `states`. It is the evidence a row may declare the
 * axis, and the reason one does not.
 */
const censusRealReach = (entries) => {
  const out = {};
  for (const container of document.querySelectorAll('[data-axis-real-render]')) {
    const family = container.getAttribute('data-axis-real-render');
    const row = container.getAttribute('data-axis-real-row') ?? family;
    const probes = entries[family] ?? [];
    const counts = { declared: container.getAttribute('data-axis-real-axes').split(' ').includes('states'), stamped: 0, native: 0 };
    const parts = (container.getAttribute('data-axis-real-stamped') ?? '').split(' ').filter(Boolean);
    const stampable = (node) => {
      for (let at = node; at !== null && at !== container; at = at.parentElement) {
        if (parts.includes(at.getAttribute('data-part'))) return true;
      }
      return false;
    };
    for (const probe of probes) {
      // A pseudo is read in the default scene only, never in a real render.
      if (probe.reason !== null || probe.pseudo !== undefined) continue;
      let matched = [];
      try {
        matched = [...container.querySelectorAll(probe.probe)];
      } catch {
        continue;
      }
      if (matched.some((node) => !node.hasAttribute('data-axis-real-host')
        && (probe.vocabulary !== 'stamped' || stampable(node)))) counts[probe.vocabulary] += 1;
    }
    out[row] = counts;
  }
  return out;
};

export const readRealReachCensus = (page, probesByFamily) =>
  page.evaluate(censusRealReach, Object.fromEntries(probesByFamily));

/** family -> the per-probe verdicts, for the probes of one vocabulary, read off the page as it stands. */
export async function readReachCensus(page, probesByFamily, vocabulary) {
  const entries = [...probesByFamily]
    .map(([family, probes]) => ({ family, probes: probes.filter((probe) => probe.vocabulary === vocabulary) }))
    .filter((entry) => entry.probes.length > 0);
  return page.evaluate(censusReach, entries);
}

/**
 * The reach of both halves over the states population the run measured, and
 * the families NEITHER reaches, each with the reasons its state rules gave.
 */
export function statesReachReport({ population, probesByFamily, stamped, native, applied }) {
  const reached = (census, family) => (census?.[family] ?? []).includes('reached');
  const reasons = { native: {}, stamped: {} };
  for (const [vocabulary, census] of [['native', native], ['stamped', stamped]]) {
    for (const family of population) {
      for (const verdict of census?.[family] ?? []) reasons[vocabulary][verdict] = (reasons[vocabulary][verdict] ?? 0) + 1;
    }
  }
  const declaring = (vocabulary) => population.filter((family) =>
    (probesByFamily.get(family) ?? []).some((probe) => probe.vocabulary === vocabulary));
  const byStamp = population.filter((family) => reached(stamped, family));
  const byNative = applied ? population.filter((family) => reached(native, family)) : [];
  const neither = population.filter((family) => !byStamp.includes(family) && !byNative.includes(family));
  return {
    applied,
    population: population.length,
    declaring: { native: declaring('native').length, stamped: declaring('stamped').length },
    reached: {
      stamped: byStamp.length,
      native: byNative.length,
      either: population.length - neither.length,
      nativeOnly: byNative.filter((family) => !byStamp.includes(family)).length,
    },
    ruleVerdicts: reasons,
    neither: neither.map((family) => {
      const probes = probesByFamily.get(family) ?? [];
      const verdicts = {};
      for (const [vocabulary, census] of [['native', native], ['stamped', stamped]]) {
        (census?.[family] ?? []).forEach((verdict) => {
          const key = `${vocabulary}:${verdict}`;
          verdicts[key] = (verdicts[key] ?? 0) + 1;
        });
      }
      return {
        family,
        why: probes.length === 0
          ? 'no rule gated on a forceable pseudo or a stamped state: it declares states through a channel, '
            + ':disabled, [aria-*] or a namespaced state alone'
          : Object.entries(verdicts).map(([key, count]) => `${key} ${count}`).join(', '),
      };
    }),
  };
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
  if (axis === 'states') {
    const halves = statesHalves(before, after, family);
    return halves.stamped ?? halves.native;
  }
  return firstDifference([[before.base, after.base]], AXES[axis].computed, family);
}

function firstDifference(readings, properties, family) {
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
 * The states axis read as its TWO halves, each against its own readings: the
 * stamped `[data-state]` scene and the forced native pseudos. The published
 * rule is the union -- a family moves on states when EITHER half shows an
 * attributable difference -- and each half is published beside it.
 */
export function statesHalves(before, after, family) {
  const properties = allProperties();
  return {
    stamped: firstDifference(
      STATE_VARIANTS.map((state) => [before.states?.[state], after.states?.[state]]),
      properties,
      family,
    ),
    native: firstDifference(
      NATIVE_PSEUDO_VARIANTS.map((variant) => [before.native?.[variant], after.native?.[variant]]),
      properties,
      family,
    ),
  };
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
export function witnessReading({ witness, before, after, denominator, variablesA, variablesB, readingsOf = null }) {
  if (witness.kind === 'effective-map') {
    return {
      kind: witness.kind,
      control: witness.control,
      ...effectiveMapDifference(variablesA ?? {}, variablesB ?? {}),
    };
  }
  const moved = [];
  for (const family of denominator) {
    // `readingsOf` hands a family the pair law 3 admits for it in this cell:
    // a real render the positive did not credit is not a witness either.
    const [left, right] = readingsOf === null ? [before, after] : readingsOf(family);
    const property = differsOnAxis(witness.axis, left, right, family);
    if (property) moved.push({ family, property });
  }
  return {
    kind: witness.kind ?? 'axis-positive',
    axis: witness.axis,
    control: witness.control,
    positive: witness.positive,
    moved: moved.length,
    denominator: denominator.length,
    // IN FULL, never a preview: a capped list read as a loss (Fable S1 review,
    // decision 3 -- form and form-field fell off a 12-entry cap and looked
    // lost). `evaluate` refuses a witness whose list is shorter than its count.
    movedFamilies: moved,
    movedIds: moved.map((entry) => entry.family),
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

const PENDING_REAL = Symbol('pending real-render verdicts');

/**
 * A control cell reads a real-render mount exactly where the axis's positive,
 * in the same vertical and mode, credited it -- so the control's 0 % covers the
 * mounted nodes too. Where no positive of that axis ran, the mount is left
 * unread and named `undecided`, which is the pre-lot reading.
 */
function resolvePendingRealRenders(cells) {
  for (const cell of cells) {
    const record = cell[PENDING_REAL];
    if (record === undefined) continue;
    delete cell[PENDING_REAL];
    const positives = cells.filter((entry) => entry.kind === 'positive' && entry.axis === cell.axis && entry.realRender);
    for (const { family, combined, alone, split } of record.pending) {
      const refused = positives.some((entry) => entry.realRender.refused.some((row) => row.family === family));
      if (!refused && positives.some((entry) => entry.realRender.credited.includes(family))) {
        cell.realRender.credited.push(family);
        if (combined && !alone) cell.realRender.rescued.push(family);
        const at = record.moved.findIndex((entry) => entry.family === family);
        if (combined && at < 0) record.moved.push({ family, property: combined });
        if (!combined && at >= 0) record.moved.splice(at, 1);
        // The states halves were split on the default mount alone; a
        // credited mount is split on the whole reading, as the positive was.
        if (record.halves !== null && record.halves !== undefined && split !== undefined) {
          for (const half of ['stamped', 'native']) {
            record.halves[half] = record.halves[half].filter((entry) => entry !== family);
            if (split[half]) record.halves[half].push(family);
          }
        }
      } else if (!refused) {
        cell.realRender.undecided.push(family);
      }
    }
    if (record.halves !== null && record.halves !== undefined && cell.movedStamped !== undefined) {
      cell.movedStamped = record.halves.stamped.length;
      cell.movedNative = record.halves.native.length;
      cell.rescuedByNative = record.halves.native.filter((family) => !record.halves.stamped.includes(family));
    }
    cell.moved = record.moved.length;
    cell.percent = cell.denominator === 0 ? 0 : (record.moved.length / cell.denominator) * 100;
    cell.movedFamilies = record.moved.slice(0, 12);
    cell.movedIds = record.moved.map((entry) => entry.family);
  }
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
  /* `false` reproduces the pre-roster root: the mount law's structural
   * attributes alone, without the values the DEFAULT RENDER stamps. Same tree,
   * same catalog revision, same browser. */
  asRendered = true,
  /* `false` reproduces the pre-lot part law: no BEM element part, no `:has()`
   * retry against the built anatomy, and no logical edge longhand in the part
   * vocabulary. */
  partReach = true,
  /* `false` reproduces the pre-lot state set -- the four runtime-only states --
   * on the SAME tree. `disabled` is the fifth, and it is the one a component
   * receives as a prop rather than acquires by being touched; before the EVI-02
   * instrument lot the scene never stamped it, so disabled paint was outside
   * the instrument by construction and its zero was arithmetic. */
  statesDisabled = true,
  /* `false` reproduces the pre-S1 state set: the five states before `focused`
   * joined, on the SAME tree. */
  statesFocused = true,
  /* `false` reproduces the pre-lot states axis: the stamped `[data-state]`
   * half alone, with `:hover`, `:active` and `:focus-visible` never entered. */
  nativePseudos = true,
  /* `false` reproduces the pre-lot scene: no family's real-render mount, so a
   * family whose paint lives outside its default root reads as it did before
   * `REAL_RENDER_MOUNTS` existed. */
  realRenderMounts = true,
  /* `false` reproduces the pre-lot reading: no `::before`/`::after` is read on
   * any host, exactly the scene and numerator before the pseudo-element read
   * law. The hosts and the census are still derived and published, with every
   * readable entry `not-read`. */
  pseudoReads = true,
  /* The roster those mounts come from; a drill hands in its own, and it passes
   * the same door the shipped one does before anything is mounted. */
  realRenderRoster = REAL_RENDER_MOUNTS,
  /* The default-render stamps, likewise: a drill or a same-tree before/after
   * hands in its own, and it passes the same door the shipped one does. */
  asRenderedRoster = AS_RENDERED_ROOT_STAMPS,
  /* The same export of the same compiler, handed in by a runner that reads the
   * source tree instead of `dist/`; absent, the published door is imported. */
  compile: compileOverride = null,
} = {}) {
  const compile = compileOverride
    ?? (await import(pathToFileURL(resolve(root, COMPILER_MODULE)).href))[COMPILER_EXPORT];
  if (typeof compile !== 'function') {
    throw new Error(`axis-difference: ${COMPILER_MODULE} exports no callable ${COMPILER_EXPORT}`);
  }

  if (asRendered && !collapsedRoots && asRenderedRoster !== AS_RENDERED_ROOT_STAMPS) {
    const rosterFailures = asRenderedRosterFailures(root, asRenderedRoster);
    if (rosterFailures.length > 0) {
      throw new Error(`axis-difference: the as-rendered roster does not match the tree it names -- ${rosterFailures.join(' | ')}`);
    }
  }
  const elements = familyElements(root, families, { collapsedRoots, asRendered, asRenderedRoster });
  for (const family of Object.keys(mounts ?? {})) {
    if (!elements.has(family)) {
      throw new Error(`axis-difference: a mount was supplied for ${family}, which has no Modern skin family`);
    }
  }
  const isMounted = (family) => mounts?.[family] !== undefined;
  if (realRenderMounts) {
    const rosterFailures = [
      ...realRenderRosterFailures(root, realRenderRoster),
      ...(realRenderRoster === REAL_RENDER_MOUNTS ? realRenderRefusedRowFailures(root) : []),
    ];
    if (rosterFailures.length > 0) {
      throw new Error(`axis-difference: the real-render roster does not match the engines it names -- ${rosterFailures.join(' | ')}`);
    }
  }
  const realRenders = realRenderMountList(elements, { applied: realRenderMounts, roster: realRenderRoster })
    .filter((mount) => !isMounted(mount.family));
  // family -> the union of the axes its rows declare; law 3 is decided per
  // family over every row it has.
  const realRenderAxes = new Map();
  for (const mount of realRenders) {
    realRenderAxes.set(mount.family, [...new Set([...(realRenderAxes.get(mount.family) ?? []), ...mount.axes])]);
  }
  const mountable = [...elements]
    .filter(([family, element]) => element !== null || isMounted(family))
    .map(([family]) => family);
  const unmountable = [...elements]
    .filter(([family, element]) => element === null && !isMounted(family))
    .map(([family]) => family);
  const populations = axisPopulations(root);
  const notApplicable = axisNotApplicable(root);
  const unobservable = axisUnobservable(root);
  const properties = allProperties();
  const axisOf = axisByProperty();
  // The pins are read first and honoured: a family with no mountable root
  // gains no parts, so `UNMOUNTABLE_FAMILIES` and every denominator below it
  // are exactly the ones the pre-lot run published.
  const mountedParts = partMounts === false ? new Map() : familyAxisParts(root, families, elements, { partReach });
  // Read from the same skins the denominator is, so the reach of the disabled
  // stamp is republished every run rather than asserted once in a comment.
  const disabledCensus = disabledVocabularyCensus(root, families);
  const stampedStates = STATE_VARIANTS
    .filter((state) => statesDisabled || state !== 'disabled')
    .filter((state) => statesFocused || state !== 'focused');
  const effective = (axis) => populations
    .get(axis)
    .filter((family) => mountable.includes(family) && !UNSETTLED_FAMILIES.includes(family));
  // The native scene is the stamped one plus the parts a forced pseudo gates;
  // the stamped scene is not touched, so its half is the pre-lot reading.
  const nativeParts = nativePseudos && partMounts !== false
    ? familyAxisParts(root, families, elements, { partReach, nativePseudos: true })
    : new Map();
  // The pseudo-element read law: hosts derived HERE, off the same part maps,
  // one plan per scene. The default scene only -- never a real-render mount.
  const pseudoPlan = pseudoReadPlan(mountedParts, { applied: pseudoReads });
  const nativePseudoPlan = pseudoReadPlan(nativeParts, { applied: pseudoReads });
  const pseudoSeen = new Map();
  const pinChannels = pseudoPinChannels();
  const stateRules = new Map();
  const withheld = new Map();
  for (const [family, files] of skinFamilies(root)) {
    if (!elements.has(family)) continue;
    const css = files.map((file) => readFileSync(file, 'utf8')).join('\n');
    stateRules.set(family, stateRuleProbes(css, { stamped: stampedStates, pseudoReads: pseudoReads && partMounts !== false }));
    const hazards = Object.keys(familyForcedPseudoHazards(css));
    if (hazards.length > 0) withheld.set(family, hazards.sort());
  }
  let stampedCensus = null;
  let nativeCensus = null;
  let realReachCensus = null;
  let calibration = null;
  let nativeVariants = [];
  const nativeUnsettled = new Set();
  let nativeShape = null;

  const { browser, close, provenance } = await launchBrowser();
  const cells = [];
  const partReadings = [];
  const refusals = [];
  const observedUnsettled = new Set();
  const newlyUnsettled = new Set();
  try {
    const context = await browser.newContext();
    if (nativePseudos) {
      calibration = await calibrateNativeForcing(context);
      nativeVariants = NATIVE_PSEUDO_VARIANTS.filter((variant) => calibration[variant].reached);
    }
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
        let nativeHalf = null;
        if (nativeVariants.length > 0) {
          const arms = new Map();
          for (const scenario of scenarios) {
            const artifacts = compiled.get(scenario.id);
            if (artifacts.reason !== undefined || !readsStatesAxis(scenario)) continue;
            for (const artifact of [artifacts.a, artifacts.b]) {
              const variables = effectiveVariables(artifact, theme);
              arms.set(JSON.stringify(variables), { key: JSON.stringify(variables), variables });
            }
          }
          const nativePage = await context.newPage();
          try {
            await nativePage.setContent(
              sceneHtml({ css: bundle.css, vertical, theme, elements, mounts, partMounts: nativeParts, realRenders }),
              { waitUntil: 'load' },
            );
            nativeCensus ??= await readReachCensus(nativePage, stateRules, 'native');
            nativeHalf = await measureNativeHalf({
              page: nativePage,
              arms: [...arms.values()],
              properties,
              axisOf,
              variants: nativeVariants,
              withheld,
              realRender: realRenders.length > 0,
              pseudoReads: nativePseudoPlan,
            });
            await collectPseudoSeen(nativePage, nativePseudoPlan, pseudoSeen);
            for (const family of nativeHalf.unsettled) nativeUnsettled.add(family);
            nativeShape ??= { nodes: nativeHalf.nodes, depths: nativeHalf.depths };
          } finally {
            await nativePage.close();
          }
        }
        const page = await context.newPage();
        await page.setContent(
          sceneHtml({ css: bundle.css, vertical, theme, elements, mounts, partMounts: mountedParts, realRenders }),
          { waitUntil: 'load' },
        );
        stampedCensus ??= await readReachCensus(page, stateRules, 'stamped');
        realReachCensus ??= realRenders.length > 0 ? await readRealReachCensus(page, stateRules) : {};
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
          let paintA;
          let paintB;
          // The pair's own channels plus the ones a pseudo-only pin names, so
          // the pin can be held to the channel it claims moves (or holds).
          const armChannels = [...new Set([...pairChannels, ...pinChannels])];
          try {
            before = await measureCell({
              page, variables: variablesA, properties, axisOf, states: stampedStates, realRender: realRenders.length > 0,
              pseudoReads: pseudoPlan,
            });
            partsA = parts ? await page.evaluate(readParts, parts) : null;
            // Arm A is still on the root here, and arm B there: each read is
            // that arm's own computed value for every channel of the pair, so
            // an alias is compared as what it paints and not as its string.
            paintA = await readArmChannels(page, armChannels);
            after = await measureCell({
              page, variables: variablesB, properties, axisOf, states: stampedStates, realRender: realRenders.length > 0,
              pseudoReads: pseudoPlan,
            });
            partsB = parts ? await page.evaluate(readParts, parts) : null;
            paintB = await readArmChannels(page, armChannels);
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
          if (nativeHalf !== null && readsStatesAxis(scenario)) {
            before.native = nativeHalf.readings.get(JSON.stringify(variablesA));
            after.native = nativeHalf.readings.get(JSON.stringify(variablesB));
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
          const witnessPositive = scenario.witness?.axis === undefined
            ? undefined
            : cells.find((entry) => entry.vertical === vertical && entry.theme === theme
              && entry.kind === 'positive' && entry.axis === scenario.witness.axis);
          const witness = scenario.witness === undefined
            ? null
            : witnessReading({
              witness: scenario.witness,
              before,
              after,
              denominator: scenario.witness.axis === undefined ? [] : effective(scenario.witness.axis),
              variablesA,
              variablesB,
              // A family's real render witnesses only where the axis's positive
              // in this cell credited it; elsewhere its default mount alone.
              readingsOf: (family) => (realRenderAxes.get(family)?.includes(scenario.witness.axis)
                && !(witnessPositive?.realRender?.credited ?? []).includes(family)
                ? [realRenderView(before, family, REAL_RENDER_KEY.default), realRenderView(after, family, REAL_RENDER_KEY.default)]
                : [before, after]),
            });
          const axes = scenario.kind === 'positive' ? [scenario.axis] : scenario.expectZeroOn;
          for (const axis of axes) {
            const denominator = effective(axis);
            const moved = [];
            const halves = axis === 'states' ? { stamped: [], native: [] } : null;
            const real = { credited: [], rescued: [], refused: [], undecided: [] };
            const pending = [];
            const sources = [];
            for (const family of denominator) {
              if (pseudoPlan?.[family]?.some((read) => read.axis === axis || axis === 'states')) {
                sources.push(pseudoSources({
                  before, after, family, axis, real: realRenderAxes.get(family)?.includes(axis) === true,
                }));
              }
              let property;
              // The readings the states halves are split on: the family's
              // whole reading where its real render counts, its default
              // mount alone where it does not.
              let splitOn = [before, after];
              if (realRenderAxes.get(family)?.includes(axis)) {
                const alone = [realRenderView(before, family, REAL_RENDER_KEY.default), realRenderView(after, family, REAL_RENDER_KEY.default)];
                const withoutReal = differsOnAxis(axis, alone[0], alone[1], family);
                splitOn = alone;
                // Law 3 is decided on the axis's OWN positive pair: a control
                // moves nothing by design, so it takes that verdict below.
                const verdict = scenario.kind === 'positive' && scenario.axis === axis
                  ? realRenderQualification({ before, after, family, axis })
                  : null;
                if (verdict === null) {
                  pending.push({
                    family,
                    combined: differsOnAxis(axis, before, after, family),
                    alone: withoutReal,
                    ...(halves === null ? {} : { split: statesHalves(before, after, family) }),
                  });
                  property = withoutReal;
                } else if (verdict.qualified) {
                  real.credited.push(family);
                  property = differsOnAxis(axis, before, after, family);
                  splitOn = [before, after];
                  if (property && !withoutReal) real.rescued.push(family);
                } else {
                  // What the refused mount WOULD have read, published so a
                  // refusal is evidence about the family and not only a gap.
                  real.refused.push({
                    family,
                    reason: verdict.reason,
                    realMoved: differsOnAxis(
                      axis,
                      realRenderView(before, family, REAL_RENDER_KEY.real),
                      realRenderView(after, family, REAL_RENDER_KEY.real),
                      family,
                    ),
                  });
                  property = withoutReal;
                }
              } else {
                property = differsOnAxis(axis, before, after, family);
              }
              if (property) moved.push({ family, property });
              if (halves !== null) {
                const split = statesHalves(splitOn[0], splitOn[1], family);
                if (split.stamped) halves.stamped.push(family);
                if (split.native) halves.native.push(family);
              }
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
              // The real-render mounts this cell read (law 3 passed), the
              // families that moved ONLY through them, and every refusal.
              ...(realRenders.length === 0 ? {} : { realRender: real }),
              ...(pending.length === 0 ? {} : { [PENDING_REAL]: { pending, moved, halves } }),
              // Decided after law 3 settles this cell's real-render credits.
              ...(pseudoPlan === null ? {} : {
                [PENDING_PSEUDO]: {
                  sources,
                  channels: Object.fromEntries(Object.entries(PSEUDO_ONLY_CREDITS[axis] ?? {}).map(([family, pin]) => [family, {
                    moves: { channel: pin.moves, a: paintA?.[pin.moves] ?? null, b: paintB?.[pin.moves] ?? null },
                    ...(pin.holds === undefined ? {} : {
                      holds: { channel: pin.holds, a: paintA?.[pin.holds] ?? null, b: paintB?.[pin.holds] ?? null },
                    }),
                  }])),
                },
              }),
              // The two halves of the states axis, each published beside the
              // union the percentage is taken from.
              ...(halves === null ? {} : {
                movedStamped: halves.stamped.length,
                movedNative: halves.native.length,
                rescuedByNative: halves.native.filter((family) => !halves.stamped.includes(family)),
                nativeMeasured: nativeHalf !== null,
              }),
            });
          }
        }
        resolvePendingRealRenders(cells.filter((entry) => entry.vertical === vertical && entry.theme === theme));
        resolvePseudoOnly(cells.filter((entry) => entry.vertical === vertical && entry.theme === theme));
        await collectPseudoSeen(page, pseudoPlan, pseudoSeen);
        await page.close();
      }
    }
  } finally {
    await close();
  }

  markVacuousControls(cells);

  const statesPopulation = effective('states');
  const reach = statesReachReport({
    population: statesPopulation,
    probesByFamily: stateRules,
    stamped: stampedCensus,
    native: nativeCensus,
    applied: nativeVariants.length > 0,
  });
  const nativeReport = {
    applied: nativePseudos,
    variants: nativeVariants,
    refusedVariants: nativePseudos
      ? NATIVE_PSEUDO_VARIANTS.filter((variant) => !nativeVariants.includes(variant))
      : [],
    forcing: NATIVE_PSEUDO_FORCING,
    calibration,
    scene: nativeShape,
    // Parts the native scene gained over the stamped one: nodes gated on a
    // forced pseudo alone, mounted at rest with the pseudo stripped.
    addedParts: [...nativeParts].reduce((total, [family, record]) =>
      total + record.parts.length - (mountedParts.get(family)?.parts.length ?? 0), 0),
    withheld: Object.fromEntries([...withheld].filter(([family]) => statesPopulation.includes(family))),
    unsettled: [...nativeUnsettled].sort(),
    reach,
  };
  const partMountsReport = partMountReport(mountedParts, {
    applied: partMounts !== false,
    partReach,
    unmountableCandidates: families === null ? unmountablePartCandidates(root, unmountable) : [],
  });
  const pseudoCensus = pseudoReadCensus(mountedParts, pseudoSeen, {
    applied: pseudoReads,
    nodeRefusals: partMountsReport.refused['pseudo-element'] ?? 0,
  });
  const pseudoOnlyByAxis = Object.fromEntries(AXIS_IDS.map((axis) => [axis, [...new Set(cells
    .filter((cell) => cell.kind === 'positive' && cell.axis === axis && cell.evidential)
    .flatMap((cell) => (cell.pseudoOnly ?? []).map((entry) => entry.family)))].sort()]));
  const pseudoReadReport = {
    applied: pseudoReads,
    scope: 'the default scene only: ::before/::after at the end of a selector, on a host the root, a part mount or a '
      + 'block-element part already put in the scene, for the axis whose own rule wrote the property, credited only '
      + 'where content computes generated; real-render mounts are out of scope in this lot',
    families: Object.keys(partMountsReport.pseudoReads).length,
    reads: Object.values(partMountsReport.pseudoReads).reduce((total, byAxis) =>
      total + Object.values(byAxis).reduce((sum, list) => sum + list.length, 0), 0),
    perAxis: Object.fromEntries(AXIS_IDS.map((axis) => [axis, Object.values(partMountsReport.pseudoReads)
      .filter((byAxis) => byAxis[axis] !== undefined).length])),
    census: pseudoCensus.census,
    reconciliation: pseudoCensus.reconciliation,
    pseudoOnly: pseudoOnlyByAxis,
    pinned: PSEUDO_ONLY_CREDITS,
    entries: pseudoCensus.entries,
  };
  const statesUnreachable = STATES_AXIS_LIMITS.unreachable.filter((line) => !line.startsWith(':hover and :focus-visible'));
  if (nativeVariants.length > 0) {
    statesUnreachable.splice(2, 0,
      `:${nativeVariants.join(', :')} are forced through the DevTools protocol on each node and its ancestor chain; `
      + `${reach.reached.either} of the ${reach.population} measured states families have a state rule that selects `
      + `a node one half reads (${reach.reached.stamped} by the stamp, ${reach.reached.native} by forcing, `
      + `${reach.reached.nativeOnly} by forcing alone), and ${reach.neither.length} reach neither `
      + '(named at nativePseudos.reach.neither)',
      `${Object.keys(nativeReport.withheld).length} famil(ies) read under a forced pseudo that drives a SIBLING `
      + '(+, ~, or :has() over one): a whole-depth pass hovers the siblings too, so that variant is withheld for '
      + 'them (nativePseudos.withheld); a pseudo inside :has() over a descendant, '
      + (pseudoReads
        ? 'a pseudo-element other than ::before/::after on a host already in the scene (pseudoReads), '
        : 'a pseudo-element, ')
      + 'and a rule needing a pseudo AND a stamped state are still outside both halves',
    );
  } else {
    statesUnreachable.splice(2, 0, STATES_AXIS_LIMITS.unreachable.find((line) => line.startsWith(':hover and :focus-visible')));
  }

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
    // THE DEFAULT-RENDER STAMPS this run mounted, published beside the roots
    // for the same reason: an attribute the probe added is part of the node
    // the numerator was read on, and a reader must be able to see it.
    asRendered: asRenderedReport(elements, { applied: asRendered && !collapsedRoots, roster: asRenderedRoster }),
    // THE REAL-RENDER MOUNTS this run read, each with the configuration it is
    // and the engine lines that gate it, resolved on this tree.
    realRender: realRenderReport(realRenders, {
      applied: realRenderMounts, roster: realRenderRoster, root, statesReach: realReachCensus,
    }),
    // WHICH ELEMENT EACH FAMILY WAS MEASURED ON, per axis, published so the
    // numerator this run reports can be read against the element it was read
    // from. A mount map nobody can see is a numerator nobody can audit.
    partMounts: partMountsReport,
    // THE PSEUDO-ELEMENT READ LAW, as this run applied it: the hosts derived
    // per family (also at partMounts.pseudoReads), every refusal entry with
    // its outcome, the reconciliation against partMounts.refused
    // ['pseudo-element'], and the credits that rest on a pseudo alone.
    pseudoReads: pseudoReadReport,
    populations: Object.fromEntries(AXIS_IDS.map((axis) => [axis, effective(axis).length])),
    // The families a reviewed exclusion withdrew from each axis, counted beside
    // every denominator so no line of this run can be read without them.
    notApplicable: Object.fromEntries(AXIS_IDS.map((axis) => [axis, notApplicable.get(axis).length])),
    // The declaring families this probe cannot observe, per axis, beside every
    // denominator and NEVER subtracted from it; pinned in UNOBSERVABLE_FAMILIES.
    unobservable: Object.fromEntries(AXIS_IDS.map((axis) => [axis, unobservable.get(axis)
      .map((entry) => ({ family: entry.family, class: entry.class, properties: entry.properties }))])),
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
      states: { ...STATES_AXIS_LIMITS, stampedStates, unreachable: statesUnreachable },
      disabled: { ...disabledCensus, stamped: statesDisabled },
    },
    nativePseudos: nativeReport,
    statesNote: nativeVariants.length > 0
      ? 'The states axis is measured in two halves, published per cell: the attributes a component stamps '
        + `([data-state] for every stamped state -- ${stampedStates.join(', ')} -- and [data-disabled] beside it for `
        + 'the one that comes from a prop), and the native :hover, :active and :focus-visible forced by the browser '
        + 'on each node and its ancestor chain; a real-render mount that declares states is read under both. '
        + 'A family moves on states when EITHER half differs. :disabled and [aria-disabled] are reached by '
        + 'neither and are named; what else is outside both halves is enumerated in limits.states, '
        + 'limits.disabled and nativePseudos.reach.'
      : `The states axis is measured under the attributes a component stamps: [data-state] for ${stampedStates.join(', ')} `
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

/**
 * The pseudo-only pin over a run: every evidential positive cell of an axis
 * credits through a pseudo alone EXACTLY the pinned families, each first on
 * its pinned property, with its pinned channel moving between the arms (and
 * the channel it pins as steady not moving). Checked on a full run with the
 * read law and the part mounts on; any other run reproduces another reading.
 */
export function pseudoOnlyDrift(result, pins = PSEUDO_ONLY_CREDITS) {
  if (result.familiesFiltered === true || result.pseudoReads?.applied !== true || result.partMounts?.applied === false) return [];
  const failures = [];
  for (const cell of result.cells) {
    if (cell.kind !== 'positive' || !cell.evidential) continue;
    const where = `${cell.vertical}/${cell.theme} ${cell.axis}`;
    const pinned = pins[cell.axis] ?? {};
    // A cell that carries no verdict credits nothing, which a pin then names.
    const pseudoOnly = cell.pseudoOnly ?? [];
    const observed = pseudoOnly.map((entry) => entry.family);
    for (const family of observed) {
      if (!Object.hasOwn(pinned, family)) {
        failures.push(
          `${family}: credited on ${where} through a ::before/::after reading ALONE and NOT pinned in PSEUDO_ONLY_CREDITS; `
          + 'pin it with the measurement in this commit, or find why its host stopped carrying the paint',
        );
      }
    }
    for (const [family, pin] of Object.entries(pinned)) {
      const entry = pseudoOnly.find((candidate) => candidate.family === family);
      if (entry === undefined) {
        failures.push(
          `${family}: pinned in PSEUDO_ONLY_CREDITS on ${cell.axis} and NOT credited through its pseudo alone on ${where} `
          + `(${pin.pseudo}); the pin is the margin -- restore the paint or re-pin with the measurement`,
        );
        continue;
      }
      if (entry.property !== pin.property) {
        failures.push(`${family}: its pseudo moved first on ${entry.property} on ${where}; the pin reads ${pin.property}`);
      }
      const channels = cell.pseudoChannels?.[family];
      if (channels?.moves === undefined || channels.moves.a === channels.moves.b) {
        failures.push(`${family}: ${pin.moves} did not move between the arms on ${where} (${channels?.moves?.a} / ${channels?.moves?.b}); the pin names the channel that carries the credit`);
      }
      if (pin.holds !== undefined && (channels?.holds === undefined || channels.holds.a !== channels.holds.b)) {
        failures.push(`${family}: ${pin.holds} moved between the arms on ${where} (${channels?.holds?.a} / ${channels?.holds?.b}); the pin says the credit is NOT that channel`);
      }
    }
  }
  return failures;
}

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
  pseudoOnlyCredits = PSEUDO_ONLY_CREDITS,
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
    // THE UNOBSERVABLE SET IS PINNED BESIDE THE DENOMINATOR, never subtracted.
    failures.push(...unobservableDrift(result.unobservable ?? {}));
    // THE PSEUDO-ONLY CREDITS ARE PINNED, both directions, cell by cell.
    failures.push(...pseudoOnlyDrift(result, pseudoOnlyCredits));
    // THE MEASURED REFUSALS ARE PUBLISHED, every pinned row of them.
    if (result.realRender?.applied === true) {
      const published = (result.realRender.statesRefused ?? []).map((entry) => entry.row);
      for (const row of Object.keys(REAL_RENDER_STATES_REFUSALS)) {
        if (!published.includes(row)) failures.push(`${row}: a pinned states refusal the run did not publish in realRender.statesRefused`);
      }
    }
  }
  // A FAMILY COUNTS ONCE PER CELL. The pseudo reads append to a family's
  // reading; they never add an entry, and a numerator that disagrees with its
  // own id list -- or names a family twice -- is not a count of families.
  for (const cell of result.cells) {
    if (cell.movedIds === undefined) continue;
    const unique = new Set(cell.movedIds);
    if (cell.moved !== cell.movedIds.length || unique.size !== cell.movedIds.length) {
      failures.push(
        `${cell.vertical}/${cell.theme} ${cell.scenario} ${cell.axis}: moved ${cell.moved} over ${cell.movedIds.length} `
        + `id(s), ${unique.size} distinct -- a family is counted once per cell`,
      );
    }
  }
  // THE PSEUDO CENSUS RECONCILES with the node refusals it was taken from.
  if (result.pseudoReads?.applied === true) {
    const { reconciliation, census } = result.pseudoReads;
    const sum = PSEUDO_READ_OUTCOMES.reduce((total, outcome) => total + (census?.[outcome] ?? 0), 0);
    if (reconciliation?.equal !== true || sum !== reconciliation.nodeRefusals) {
      failures.push(
        `pseudo-element read law: ${reconciliation?.nodeRefusals ?? '?'} node refusal(s) and ${sum} census entr(ies) `
        + `(${PSEUDO_READ_OUTCOMES.map((outcome) => `${outcome} ${census?.[outcome] ?? 0}`).join(', ')}); every refusal `
        + 'must carry exactly one outcome',
      );
    }
  }
  // A WITNESS IS PUBLISHED IN FULL: a list shorter than its count reads as a loss.
  for (const cell of result.cells) {
    const witness = cell.witness;
    if (witness === null || witness === undefined || witness.kind === 'effective-map') continue;
    if ((witness.movedIds?.length ?? -1) !== witness.moved || (witness.movedFamilies?.length ?? -1) !== witness.moved) {
      failures.push(
        `${cell.vertical}/${cell.theme} ${cell.scenario}: its ${witness.control} witness moved ${witness.moved} and published `
        + `${witness.movedIds?.length ?? 'no'} id(s) / ${witness.movedFamilies?.length ?? 'no'} famil(ies) -- the witness list is published in full`,
      );
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
  for (const variant of result.nativePseudos?.refusedVariants ?? []) {
    const reading = result.nativePseudos.calibration?.[variant];
    failures.push(
      `native :${variant} failed its calibration — forced ${reading?.forced ?? 'nothing'}, expected `
      + `${reading?.expected}, rest ${reading?.rest} then ${reading?.restAfter}; the forcing is not the browser's `
      + 'own match, so that half of the states axis was not measured',
    );
  }
  for (const family of result.families.newlyUnsettled ?? []) {
    failures.push(
      `${family}: its readings never settle and it is NOT in UNSETTLED_FAMILIES. A family whose paint converges `
      + 'asymptotically cannot be compared between two arms; name it there with the measurement, or fix the '
      + 'self-referential container query that causes it',
    );
  }
  // A REAL-RENDER ROW THAT DOES NOT QUALIFY is a roster defect, never a
  // quieter number: the refused axis was read on the default mount alone, and
  // the row that claimed it has to be corrected or removed.
  for (const cell of result.cells) {
    for (const refusal of cell.realRender?.refused ?? []) {
      failures.push(
        `${refusal.family}: its real-render mount was REFUSED on ${cell.axis} in ${cell.vertical}/${cell.theme} `
        + `${cell.scenario} -- ${refusal.reason}; REAL_RENDER_MOUNTS may declare an axis only where the default `
        + 'mount paints nothing that moves between the arms and the real render moves',
      );
    }
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

function headCommit() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: CORE_ROOT, encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
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
    // The pre-roster root and the pre-lot part law, on demand: the two halves
    // of the EVI-02 reach repair, each A/B-able on ONE tree.
    asRendered: !process.argv.includes('--no-as-rendered'),
    partReach: !process.argv.includes('--no-part-reach'),
    // The pre-lot states axis, on demand: the stamped half alone.
    nativePseudos: !process.argv.includes('--no-native-pseudos'),
    // The pre-lot scene, on demand: no family's real-render mount.
    realRenderMounts: !process.argv.includes('--no-real-render-mounts'),
    // The pre-S1 state set, on demand: `focused` never stamped.
    statesFocused: !process.argv.includes('--no-focused-stamp'),
    // The pre-lot reading, on demand: no `::before`/`::after` read on a host.
    pseudoReads: !process.argv.includes('--no-pseudo-reads'),
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
    `  unobservable (reported, NEVER subtracted; pinned in UNOBSERVABLE_FAMILIES): ${AXIS_IDS
      .map((axis) => `${axis} ${result.unobservable[axis].length}`).join(', ')}`,
  );
  for (const axis of AXIS_IDS) {
    for (const entry of result.unobservable[axis]) console.log(`    ${axis} ${entry.family} -- ${entry.class} (${entry.properties.join(', ')})`);
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
  const pseudo = result.pseudoReads;
  console.log(
    `  pseudo-element reads: ${pseudo.applied ? 'ON' : 'OFF (no ::before/::after read -- the pre-lot reading)'}`
    + `, ${pseudo.reads} read(s) over ${pseudo.families} famil(ies), default scene only (real-render mounts out of scope)`,
  );
  console.log(
    `    census of the ${pseudo.reconciliation.nodeRefusals} pseudo-element node refusal(s): `
    + `${Object.entries(pseudo.census).map(([outcome, count]) => `${outcome} ${count}`).join(', ')}`
    + ` -- reconciled: ${pseudo.reconciliation.equal ? 'yes' : 'NO'}`,
  );
  console.log(
    `    credited through a pseudo ALONE (pinned in PSEUDO_ONLY_CREDITS): ${AXIS_IDS
      .filter((axis) => pseudo.pseudoOnly[axis].length > 0)
      .map((axis) => `${axis} ${pseudo.pseudoOnly[axis].join(', ')}`).join('; ') || 'none'}`,
  );
  console.log(
    `  real-render mounts: ${result.realRender.applied ? 'ON' : 'OFF (default mounts only -- the pre-lot reading)'}`
    + `, ${result.realRender.families} famil(ies)`,
  );
  for (const [key, row] of Object.entries(result.realRender.map)) {
    console.log(
      `    ${key}${row.family === key ? '' : ` (${row.family})`} [${row.axes.join(', ')}] ${row.gates[0]} -- ${row.state}`
      + (row.statesReach === undefined
        ? ''
        : `; state rules selecting a node of it: stamp ${row.statesReach.stamped}, forcing ${row.statesReach.native}`
          + `${row.statesReach.declared ? '' : ' (states not declared)'}`),
    );
  }
  for (const entry of result.realRender.statesRefused) {
    console.log(`    states REFUSED ${entry.row}${entry.row === entry.family ? '' : ` (${entry.family})`} -- ${entry.reason}`);
  }
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
  const native = result.nativePseudos;
  console.log(
    `  native pseudos: ${native.applied ? `ON — ${native.variants.map((variant) => `:${variant}`).join(', ')}` : 'OFF (the stamped half alone — the pre-lot reading)'}`
    + (native.applied && native.scene !== null
      ? `, ${native.scene.nodes} node(s) over ${native.scene.depths} depth pass(es), ${native.addedParts} part(s) mounted for a forced pseudo alone`
      : ''),
  );
  if (native.applied) {
    console.log(`    calibration: ${Object.entries(native.calibration).map(([variant, reading]) =>
      `:${variant} ${reading.reached ? 'reached' : 'REFUSED'} (${reading.property} ${reading.rest} -> ${reading.forced} -> ${reading.restAfter})`).join('; ')}`);
    console.log(`    withheld (a forced pseudo drives a sibling): ${Object.entries(native.withheld)
      .map(([family, variants]) => `${family}(${variants.join('/')})`).join(', ') || 'none'}`);
    console.log(`    unsettled under a forced pseudo (native reading dropped): ${native.unsettled.join(', ') || 'none'}`);
  }
  console.log(
    `    reach over ${native.reach.population} states famil(ies): stamp ${native.reach.reached.stamped}, `
    + `forcing ${native.reach.reached.native} (${native.reach.reached.nativeOnly} alone), either ${native.reach.reached.either}, `
    + `NEITHER ${native.reach.neither.length}`,
  );
  for (const entry of native.reach.neither) console.log(`      neither: ${entry.family} — ${entry.why}`);
  for (const cell of result.cells.filter((entry) => entry.axis === 'states' && entry.movedStamped !== undefined)) {
    console.log(
      `    states halves ${cell.vertical}/${cell.theme} ${cell.scenario}: stamped ${cell.movedStamped}, native `
      + (cell.nativeMeasured
        ? `${cell.movedNative}, union ${cell.moved}/${cell.denominator} (${cell.rescuedByNative.length} by the native half alone)`
        : `NOT MEASURED, union ${cell.moved}/${cell.denominator}`),
    );
  }
  for (const line of result.limits.states.unreachable) console.log(`  states axis limit: ${line}`);
  // `--no-focused-stamp` reproduces an older reading exactly as the flags the
  // indicator already names do, so nothing is published under it either.
  const refusal = publicationRefusal({ argv: process.argv, env: process.env })
    ?? (process.argv.includes('--no-focused-stamp') ? '--no-focused-stamp reproduces an older reading' : null);
  console.log(
    '  publication of the pilot record (test-artifacts/gates/axis-difference-pilot): '
    + `${refusal === null ? 'permitted under this invocation' : `REFUSED — ${refusal}`}`
    + ' — this CLI does not write it',
  );
  const indicatorBlocked = indicatorRefusal(result, {
    argv: process.argv,
    instrumentFailures: evaluate(result),
    writeRefusal: refusal,
  });
  if (indicatorBlocked === null) {
    const indicator = buildIndicator(result, {
      negativeControls: negativeControlsOf(SCENARIOS),
      producedAt: new Date().toISOString(),
      commit: headCommit(),
    });
    console.log(`  indicator ${INDICATOR_PATH}: ${indicator.value}`);
    writeIndicator(indicator, CORE_ROOT);
  } else {
    console.log(`  indicator ${INDICATOR_PATH}: NOT PUBLISHED — ${indicatorBlocked}`);
  }
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
