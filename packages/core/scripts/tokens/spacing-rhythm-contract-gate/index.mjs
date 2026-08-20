#!/usr/bin/env node

/**
 * Fail-closed contract gate for reads of the tenant rhythm channel.
 *
 * THE RULING THIS MECHANIZES (owner-decided; see
 * `scripts/quality-evidence/programs/modern-rescue/manifest/controls/spacing.rhythm.json`,
 * fields `compatibility` and `calibration.openContractQuestions`):
 *
 *   Density sizes the CONTROL. Rhythm sizes the ROOM AROUND it.
 *
 * So rhythm may move `gap`, `row-gap`, `column-gap`, and structural
 * separation/padding/margin -- the logical and block/inline longhands and the
 * `padding`/`margin` shorthands -- or a custom property whose name carries the
 * same semantic. It must never reach a size, capacity, touch target, icon,
 * type or motion channel; zero such reads is the bar. The physical inline
 * sides `padding-left`, `padding-right`, `margin-left` and `margin-right` are
 * forbidden even though they ARE spacing: an RTL-hostile spelling must be red.
 *
 * WHY IT DISCOVERS RATHER THAN ENUMERATES. A gate that ships a file list, a
 * count, or an expected-violations baseline cannot see growth: the ninth
 * offending reader lands and the gate stays green because it was only ever
 * asked about eight. So the corpus is WALKED from the authored source root,
 * the offending family identity is RESOLVED from the canonical
 * `family-inventory.json`, and the verdict is computed from what is actually
 * there. There is no allowlist anywhere in this file.
 *
 * TWO LEGS.
 *   1. DIRECT -- a declaration that names a rhythm channel in its value. Here
 *      the gate is fully fail-closed: anything that is not the enumerated
 *      spacing set is a violation, including a property it cannot classify.
 *   2. INDIRECT -- a declaration that consumes a custom property which is
 *      itself rhythm-carrying (transitively), without naming the channel. One
 *      rename (`--ds-panel-room`) would otherwise launder the exact defect
 *      this gate exists to catch. This leg is now fail-closed too: anything
 *      that is not the enumerated spacing set is a violation unless it proves
 *      it is DERIVED CONCENTRIC GEOMETRY.
 *
 * THE CONCENTRIC-RADIUS RULING (owner-decided, and the reason this leg stopped
 * recording an unblocking `indirectUnclassified` bucket):
 *
 *   `spacing.rhythm` does not govern visual/outer radius. It may affect only
 *   an INTERNAL DESCENDANT radius whose sole purpose is concentric geometry
 *   inside a parent with rhythm-scaled padding. It must NOT affect a
 *   component's own/outer `border-radius`, even when that component can be
 *   nested. A direct rhythm radius, a generic carrier, or an outer-radius
 *   change fails.
 *
 * Mechanized STRUCTURALLY, never as a name allowlist, in six clauses. A radius
 * declaration is concentric only when:
 *
 *   a. it is INTERNAL -- a custom property declaration must be private
 *      (`--_` prefixed); a public `--ds-*-radius` that republishes the value
 *      is the "generic carrier" the ruling forbids. Only a real
 *      `border-radius` longhand may be non-private, because it paints rather
 *      than redistributes.
 *   b. it is RADIUS-SEMANTIC -- rhythm reaching a non-radius property through
 *      a radius channel is not concentricity, it is leakage.
 *   c. it DERIVES rather than SCALES -- no rhythm-carrying reference may be an
 *      operand of `*` or `/`. Concentricity subtracts or clamps a scaled
 *      padding out of an UNSCALED parent radius, so the corner tracks the
 *      padding it must nest inside. A radius multiplied by the rhythm factor
 *      is an outer-radius change wearing a private name, and fails.
 *
 * The first three clauses were not enough, and the owner said so: they licensed
 * `--_surface-radius-current` -- a private, radius-semantic, non-scaling
 * channel -- being republished on `.ds-semantic-surface` and painted onto that
 * element's OWN `border-radius`. That is precisely the generic carrier and the
 * outer radius the ruling forbids, wearing a legal private name. "Internal"
 * had been read as "privately named" when the ruling means "inner geometry".
 * Three more clauses make the permitted case DEMONSTRABLE rather than merely
 * well-named:
 *
 *   d. it is DEMONSTRABLY CONTAINED -- a painting `border-radius` earns the
 *      allowance only when its SELECTOR proves the subject sits inside another
 *      element, through a descendant or child combinator. A bare compound
 *      (`.rottay-card-header { border-radius: var(--_nest) }`) proves nothing:
 *      it leans on inheritance and paints wherever the private happens to
 *      reach. Sibling combinators (`+`, `~`) prove nothing either -- a sibling
 *      is beside the padded parent, not inside it.
 *   e. it is NOT THE SUBJECT'S OWN ROOT -- the subject compound must not carry
 *      the `[data-part='root']` marker, and must not repeat a class of one of
 *      its own ancestors. Both shapes mean the rule paints a nested instance of
 *      a whole component, which is that component's own outer radius. This is
 *      the clause that reads "even when that component can be nested".
 *   f. a producing channel PUBLISHES FOR DESCENDANTS, NOT FOR SELF -- a private
 *      radius channel loses the allowance when a `border-radius` under the SAME
 *      selector drinks from it. Declaring a corner and immediately wearing it is
 *      republication, not publication; the concentric case declares the corner
 *      that its CHILDREN must wear.
 *
 * Everything that carries rhythm into a radius must therefore terminate in a
 * private, radius-semantic, subtractive chain that is published for descendants
 * and painted on demonstrably inner, non-root geometry; every other indirect
 * reach is a violation. Discovery still enumerates nothing: the concentric
 * channel set is COMPUTED from the corpus by the same fixed point that finds
 * carriers, and every clause is decided from selector and value structure.
 *
 * TWO CLOSED LOOPHOLES IN THAT MACHINERY (post-Fable/Kimi/triple-audit pass).
 *
 *   g. THE PRODUCER MUST BE REAL, NOT NAME-SHAPED -- a carrier whose name
 *      merely CONTAINS a spacing word is not evidence that it is this
 *      element's own padding. The RULE that declares the private radius
 *      channel must ALSO, under that exact selector, paint a real `padding`
 *      (or logical/longhand) property from the SAME carrier the radius
 *      subtracts. A same-named token applied as padding somewhere else in the
 *      corpus, or never applied as padding at all, licenses nothing.
 *   h. THE CONSUMER MUST DESCEND FROM THAT SAME RULE -- containment (clause d)
 *      is necessary but not sufficient: `.other-widget > .inner` reading a
 *      channel produced under `.card > .body` LOOKS contained, but proves
 *      nothing about `.other-widget`. The paint site's ancestor chain must
 *      literally carry the producing rule's own selector as a prefix, one or
 *      more containing combinators before the subject.
 *
 * Both are decided structurally from the corpus (which rule painted which
 * property under which selector), never by trusting a carrier's NAME or a
 * selector's superficial SHAPE. A multiplication hiding behind redundant
 * parentheses, or one hop upstream inside an intermediate carrier that is
 * itself multiplied, is walked and resolved rather than pattern-matched --
 * `scalesByReference` is balanced-paren aware, and a carrier that multiplies
 * ANOTHER carrier taints everything derived from it, so a corner cannot track
 * rhythm at 2x the true padding rate by laundering the extra factor one
 * indirection away from the site that would have caught it.
 *
 * SELECTOR IDENTITY IS STRUCTURAL, NOT TEXTUAL. The nested-own-root hazard
 * (clause e) is decided by PARSING each compound, not by sanitizing its text
 * and comparing strings: `:is()`, `:where()` and `:not()` arguments carry
 * their class/attribute conditions into the comparison instead of being
 * stripped, and `[class~="x"]` is folded to the class it is equivalent to.
 * A bare `*` (including a decorated spelling like `:not([hidden])`, which
 * excludes almost nothing in practice) carries no identity of its own and is
 * refused as a paint subject for the same reason a repeated component class
 * is: either could be painting a nested whole component's own root.
 *
 * SCOPE, AND THE HONESTY CHECK ON THAT SCOPE. Shared authored CSS and the
 * Modern engine. Classic, Rustic, generated artifacts, dist output, test
 * corpora and fixtures are not authored Modern paint;
 * `collectAuthoredModernStylesheets` proves at run time that the exclusion set
 * is not hiding a live rhythm read.
 *
 * "Authored CSS" is a CLAIM about where rhythm can reach paint, and it is only
 * true while no TypeScript module carries the channel into an inline style. So
 * `collectTypeScriptRhythmCarriers` measures the TS/TSX side rather than
 * letting this gate assert a CSS-only completeness it never checked. Three
 * distinctions keep that measurement truthful:
 *
 *   - a channel NAME is not a channel READ. A token vocabulary listing the
 *     channel, and a compiler doing `vars['--ds-rhythm-scale'] = x`, both
 *     mention it while painting nothing; only a `var(` reference consumes it.
 *   - a read whose target is a RECOGNIZED CSS property is judged by the same
 *     classifier the stylesheet legs use, so a TSX inline style can never be
 *     held to a softer rule than a stylesheet.
 *   - a read whose target is not a recognized CSS property, or is computed in
 *     a helper, is UNDECIDABLE, and an undecidable read BLOCKS. The capability
 *     registry legitimately stores the channel under `symbol:`/`consumer:` as
 *     evidence metadata, and a gap resolver legitimately builds its value
 *     before any caller picks a property -- but "the target is legitimate" is
 *     a claim this instrument cannot verify statically, and a gate that
 *     reports what it cannot decide as a benign disclosure while still
 *     exiting 0 is not fail-closed, it is a green disclosure wearing a
 *     diagnostic label. So every undecidable read is still ENUMERATED (file,
 *     line, and the fact that no property was decidable) and still fails the
 *     run; there is no count-based allowlist, because the finding is what
 *     blocks, not a comparison against a recorded expectation.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import postcssModule from 'postcss';
import { packageRoot as findPackageRoot } from '../../lib/repo-root/index.mjs';

const postcss = postcssModule.default ?? postcssModule;
const SCRIPT_PATH = fileURLToPath(import.meta.url);
const SCRIPTS_DIR = dirname(SCRIPT_PATH);

export const CORE_ROOT = findPackageRoot(SCRIPTS_DIR);
/**
 * The authored source tree, not just the token tree. A rhythm read that lands
 * in a component-local stylesheet under `src/ui/**` paints exactly as hard as
 * one in `src/foundation/tokens/css/**`; rooting the walk at the narrower path
 * would have made that read invisible.
 */
export const DEFAULT_SOURCE_ROOT = resolve(CORE_ROOT, 'src');
export const DEFAULT_FAMILY_INVENTORY = resolve(
  CORE_ROOT,
  'scripts/quality-evidence/programs/modern-rescue/family-inventory.json',
);

/** The clamped derivation every consumer is supposed to read. */
export const RHYTHM_CHANNEL = '--ds-rhythm-effective-scale';
/**
 * The raw tenant input. Reading it skips the 0.8..1.25 clamp the DS floor
 * declares, so it is still a rhythm read and still bound by this contract --
 * the same pair the DashboardInsights capacity contract pins.
 */
export const RAW_RHYTHM_CHANNEL = '--ds-rhythm-scale';
export const RHYTHM_CHANNELS = Object.freeze([
  RHYTHM_CHANNEL,
  RAW_RHYTHM_CHANNEL,
]);
export const DASHBOARD_PANEL_SIZE_SEAM = '--_ds-dashboard-panel-block-size';

export const CLASSIFICATIONS = Object.freeze({
  allowedSpacing: 'ALLOWED_SPACING_RHYTHM',
  forbiddenSize: 'FORBIDDEN_SIZE',
  forbiddenTouchTarget: 'FORBIDDEN_TOUCH_TARGET',
  forbiddenIcon: 'FORBIDDEN_ICON',
  forbiddenTypography: 'FORBIDDEN_TYPOGRAPHY',
  forbiddenMotion: 'FORBIDDEN_MOTION',
  forbiddenPhysicalInlineSide: 'FORBIDDEN_PHYSICAL_INLINE_SIDE',
  forbiddenOther: 'FORBIDDEN_OTHER_CAPABILITY',
  /**
   * Rhythm reaching a radius that the corpus cannot demonstrate is inner
   * geometry: an own-root radius, a nested whole component's radius, a bare
   * compound leaning on inheritance, or a radius that scales with the factor.
   */
  forbiddenOuterRadius: 'FORBIDDEN_OUTER_RADIUS',
  /**
   * A channel that republishes a concentric corner under a new name -- either
   * publicly, or privately onto its own selector's `border-radius`. The
   * ruling's named example (`--_surface-radius-current`) lands here.
   */
  forbiddenGenericRadiusCarrier: 'FORBIDDEN_GENERIC_RADIUS_CARRIER',
  /**
   * The single allowance the concentric ruling grants, and only on the
   * indirect leg. A declaration earns it by proving every clause in the
   * header; it is never granted by name.
   */
  derivedConcentricGeometry: 'DERIVED_CONCENTRIC_GEOMETRY',
});

/**
 * The capabilities the ruling names in so many words. The indirect leg blocks
 * on exactly these; `forbiddenOther` is deliberately absent from the set (see
 * the header). The two radius verdicts are named because the concentric ruling
 * adjudicated them explicitly -- reporting them as "unlicensed" would hide
 * WHICH clause a declaration broke.
 */
export const NAMED_FORBIDDEN_CAPABILITIES = Object.freeze([
  CLASSIFICATIONS.forbiddenSize,
  CLASSIFICATIONS.forbiddenTouchTarget,
  CLASSIFICATIONS.forbiddenIcon,
  CLASSIFICATIONS.forbiddenTypography,
  CLASSIFICATIONS.forbiddenMotion,
  CLASSIFICATIONS.forbiddenPhysicalInlineSide,
  CLASSIFICATIONS.forbiddenOuterRadius,
  CLASSIFICATIONS.forbiddenGenericRadiusCarrier,
]);

const ALLOWED_DIRECT_PROPERTY = /^(?:gap|row-gap|column-gap|padding(?:-(?:block|inline)(?:-(?:start|end))?|-(?:top|bottom))?|margin(?:-(?:block|inline)(?:-(?:start|end))?|-(?:top|bottom))?)$/u;
const PHYSICAL_INLINE_SIDE_PROPERTY = /^(?:padding|margin)-(?:left|right)$/u;
/**
 * The same RTL hostility spelled as a custom property. `--ds-card-padding-left`
 * carries a spacing word, so without this rule it would classify as allowed
 * spacing and the forbidden geometry would travel under a legal name.
 */
const PHYSICAL_INLINE_NAME_SEGMENT = /(?:^|-)(?:left|right)(?:-|$)/u;
const SPACING_NAME_SEGMENT = /(?:^|-)(?:gap|padding|margin|space|spacing|rhythm|room)(?:-|$)/u;
const SIZE_NAME_SEGMENT = /(?:^|-)(?:size|height|width|min|max|measure)(?:-|$)/u;
const TOUCH_NAME_SEGMENT = /(?:^|-)(?:touch|hit|target)(?:-|$)/u;
const ICON_NAME_SEGMENT = /(?:^|-)(?:icon|glyph)(?:-|$)/u;
const TYPE_NAME_SEGMENT = /(?:^|-)(?:font|type|typography|text-size|line-height)(?:-|$)/u;
const MOTION_NAME_SEGMENT = /(?:^|-)(?:motion|animation|transition|duration|delay|ease|easing|spring|stagger)(?:-|$)/u;
/**
 * Capacity, not just the obvious box metrics.
 *
 * `scale` and `zoom` multiply the RENDERED size of an element and everything
 * inside it, so rhythm reaching either is a size change with a different
 * spelling -- and `scale` in particular would otherwise fall to
 * `forbiddenOther`, which reports the harm without naming it. `aspect-ratio`
 * and `contain-intrinsic-size` set capacity from one axis, which is exactly the
 * DashboardInsights defect this control exists to prevent, reached sideways.
 */
const SIZE_PROPERTY = /^(?:height|width|block-size|inline-size|min-(?:height|width|block-size|inline-size)|max-(?:height|width|block-size|inline-size)|aspect-ratio|contain-intrinsic-(?:size|block-size|inline-size|height|width)|scale|zoom)$/u;
const TYPOGRAPHY_PROPERTY = /^(?:font(?:-.+)?|line-height|letter-spacing|word-spacing|text-indent)$/u;
/** `translate` and `rotate` are the longhand siblings of `transform`. */
const MOTION_PROPERTY = /^(?:animation(?:-.+)?|transition(?:-.+)?|transform|translate|rotate|offset(?:-.+)?|scroll-behavior)$/u;

/**
 * Not authored Modern paint. `classic`/`rustic` are read-only sibling engines,
 * `facade/artifacts` and `generated`/`dist` are build products, and
 * `tests`/`fixtures`/`__snapshots__` are corpora a drill may deliberately fill
 * with a violating read. `collectAuthoredModernStylesheets` refuses to trust
 * that reasoning blindly: it re-reads every excluded stylesheet and fails if
 * one of them carries a rhythm read after all.
 */
const EXCLUDED_PATH = /(?:^|\/)(?:classic|rustic|generated|dist|node_modules|coverage|__snapshots__|tests|fixtures)(?:\/|$)|(?:^|\/)facade\/artifacts(?:\/|$)/u;

/** `--ds-rhythm-scale` bounded on both sides so a longer name is not a read. */
const RHYTHM_READ = new RegExp(
  `(?<![-\\w])(?:${RHYTHM_CHANNELS.map((channel) =>
    channel.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'),
  ).join('|')})(?![-\\w])`,
  'gu',
);

/** Every `var(--name` reference in a value, fallback arms included. */
const VAR_REFERENCE = /var\(\s*(--[\w-]+)/gu;

function reportPath(file) {
  return relative(CORE_ROOT, file).split(sep).join('/');
}

/**
 * How many rhythm reads one value performs. N reads in one declaration are N
 * findings: a shorthand that scales three components reaches three times, and
 * collapsing them to one would under-report the escape.
 */
export function occurrenceCount(value) {
  return [...String(value ?? '').matchAll(RHYTHM_READ)].length;
}

function referencedCustomProperties(value) {
  return [...String(value ?? '').matchAll(VAR_REFERENCE)].map((match) =>
    match[1].toLowerCase(),
  );
}

const RADIUS_NAME_SEGMENT = /(?:^|-)(?:radius|corner)(?:-|$)/u;
const RADIUS_PROPERTY = /^border(?:-(?:start|end)-(?:start|end))?(?:-(?:top|bottom)-(?:left|right))?-radius$/u;
/**
 * A REAL rhythm-scaled padding paint, for clause (g). Restricted to actual
 * `padding`/`padding-*` CSS properties -- not `gap`, not `margin`, not a
 * custom-property NAME that merely contains the word. The producer must
 * paint this, on its own selector, from the same carrier the radius derives.
 */
const PADDING_PAINT_PROPERTY = /^padding(?:-(?:block|inline)(?:-(?:start|end))?|-(?:top|bottom))?$/u;

/** Clause (b). A radius channel by property name, private or public. */
export function isRadiusSemantic(property) {
  const normalized = property.trim().toLowerCase();
  if (!normalized.startsWith('--')) return RADIUS_PROPERTY.test(normalized);
  return RADIUS_NAME_SEGMENT.test(customPropertySemanticName(normalized));
}

/** Clause (a). `--_x-nest-radius` is internal; a public `--ds-x-radius` is not. */
export function isPrivateChannel(property) {
  return /^--_/u.test(property.trim().toLowerCase());
}

/**
 * Split a selector on top-level commas. Brackets, parens and quotes are
 * tracked, so `:is(.a, .b)` and `[data-x='a,b']` stay one selector.
 */
export function splitSelectorList(selector) {
  const out = [];
  let depth = 0;
  let quote = null;
  let current = '';
  for (let index = 0; index < selector.length; index += 1) {
    const character = selector[index];
    if (quote) {
      current += character;
      if (character === quote && selector[index - 1] !== '\\') quote = null;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      current += character;
    } else if (character === '(' || character === '[') {
      depth += 1;
      current += character;
    } else if (character === ')' || character === ']') {
      depth -= 1;
      current += character;
    } else if (character === ',' && depth === 0) {
      out.push(current);
      current = '';
    } else current += character;
  }
  out.push(current);
  return out.map((one) => one.trim()).filter((one) => one.length > 0);
}

/**
 * Split one complex selector into compound units, each tagged with the
 * combinator that PRECEDES it (`null` for the leftmost). The same bracket,
 * paren and quote tracking keeps `:not(.a .b)` from reading as a descendant
 * combinator, which would otherwise let a bare compound claim containment.
 */
export function splitComplexSelector(selector) {
  const units = [];
  let depth = 0;
  let quote = null;
  let current = '';
  let pending = null;

  const push = () => {
    const compound = current.trim();
    current = '';
    if (compound.length === 0) return;
    units.push({ compound, combinator: pending });
    pending = null;
  };

  for (let index = 0; index < selector.length; index += 1) {
    const character = selector[index];
    if (quote) {
      current += character;
      if (character === quote && selector[index - 1] !== '\\') quote = null;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      current += character;
      continue;
    }
    if (character === '(' || character === '[') {
      depth += 1;
      current += character;
      continue;
    }
    if (character === ')' || character === ']') {
      depth -= 1;
      current += character;
      continue;
    }
    if (depth > 0) {
      current += character;
      continue;
    }
    if (character === '>' || character === '+' || character === '~') {
      push();
      pending = character;
      continue;
    }
    if (/\s/u.test(character)) {
      if (current.trim().length > 0) {
        push();
        pending ??= ' ';
      }
      continue;
    }
    current += character;
  }
  push();
  return units;
}

/** Everything inside parentheses is functional argument, not a positive match. */
function stripPseudoArguments(compound) {
  let out = '';
  let depth = 0;
  for (const character of compound) {
    if (character === '(') depth += 1;
    else if (character === ')') depth = Math.max(0, depth - 1);
    else if (depth === 0) out += character;
  }
  return out;
}

/**
 * Defect 4 (Fable-reproduced bypasses). Recursively unwrap `:is()`, `:where()`
 * and `:not()`, replacing each with its OWN argument text (each arm parsed
 * again, so nesting resolves), instead of discarding the parens' content the
 * way `stripPseudoArguments` does. A class or a `[data-part='root']` marker
 * hidden behind a logical pseudo -- `:is(.ds-semantic-surface)`,
 * `:not([hidden])` -- is exactly as real a condition as writing it bare; a
 * sanitizer that drops it is the root cause of the bypass, not a defense
 * against it. A non-logical pseudo's arguments (`:nth-child(2)`) are still
 * dropped, matching `stripPseudoArguments`'s existing, narrower behavior.
 */
function flattenLogicalPseudos(compound) {
  const text = String(compound ?? '');
  let out = '';
  let index = 0;
  while (index < text.length) {
    if (text[index] === ':') {
      const nameMatch = /^:{1,2}([\w-]+)/u.exec(text.slice(index));
      if (nameMatch && text[index + nameMatch[0].length] === '(') {
        const argStart = index + nameMatch[0].length + 1;
        let depth = 1;
        let cursor = argStart;
        while (cursor < text.length && depth > 0) {
          if (text[cursor] === '(') depth += 1;
          else if (text[cursor] === ')') depth -= 1;
          cursor += 1;
        }
        if (/^(?:is|where|not)$/iu.test(nameMatch[1])) {
          out += ` ${flattenLogicalPseudos(text.slice(argStart, cursor - 1))} `;
        }
        index = cursor;
        continue;
      }
    }
    out += text[index];
    index += 1;
  }
  return out;
}

/**
 * The structural class/attribute conditions a compound carries, for the
 * fail-closed "does this compound repeat one of its own ancestors' classes"
 * check. Built from the LOGICAL-PSEUDO-AWARE flattening above (so a class
 * hidden inside `:is()`/`:where()`/`:not()` is visible), and treats
 * `[class~="x"]` -- and the plainer `[class="x"]` -- as equivalent to `.x`,
 * per the ruling. This is deliberately a "mentions" bar, not a "requires"
 * bar: a class named inside a `:not()` argument still counts, because
 * precision about negation is exactly the surface the reproduced bypass used
 * -- see the drills for the reasoning and the counterfactual (an UNRELATED
 * class inside `:not()` must not manufacture a false match).
 */
export function compoundConditions(compound) {
  const flat = flattenLogicalPseudos(compound);
  const conditions = new Set();
  for (const match of flat.matchAll(/\.([\w-]+)/gu)) conditions.add(match[1]);
  for (const match of flat.matchAll(
    /\[\s*class\s*[~]?=\s*(['"]?)([\w-]+)\1\s*\]/gu,
  )) {
    conditions.add(match[2]);
  }
  return [...conditions];
}

const ROOT_PART_ATTRIBUTE = /\[data-part\s*=\s*['"]?root['"]?\s*\]/u;

/** Sees a root marker hidden behind `:is()`/`:where()`/`:not()` too. */
function compoundHasRootMarker(compound) {
  return ROOT_PART_ATTRIBUTE.test(flattenLogicalPseudos(compound));
}

/**
 * Defect 4's `*` / `:scope > *` hazard. A compound built only from the
 * universal selector and pseudo-classes -- `*`, `*:hover`, or the reproduced
 * `:not([hidden])` decoration, which excludes almost nothing in practice --
 * carries no identity of its own, so it could paint literally anything
 * beneath the producer, including a nested whole component's own root.
 */
export function subjectHasNoIdentity(compound) {
  const stripped = stripPseudoArguments(String(compound ?? ''))
    .replace(/:{1,2}[\w-]+/gu, '')
    .replace(/\*/gu, '')
    .trim();
  return stripped.length === 0;
}

/** Selector-list version, fail-closed: one identity-less arm poisons the rest. */
export function subjectLacksIdentity(selector) {
  return splitSelectorList(String(selector ?? '')).some((one) => {
    const units = splitComplexSelector(one);
    const subject = units.at(-1)?.compound;
    return !subject || subjectHasNoIdentity(subject);
  });
}

/** Descendant and child prove containment. Siblings sit beside, not inside. */
const CONTAINING_COMBINATORS = new Set([' ', '>']);

/**
 * Clause (d). Does the selector PROVE the subject sits inside another element?
 * Fail-closed across a selector list: one arm that paints a bare compound is
 * enough to paint outside any padded parent, so every arm must prove it.
 */
export function subjectIsContained(selector) {
  const selectors = splitSelectorList(String(selector ?? ''));
  if (selectors.length === 0) return false;
  return selectors.every((one) => {
    const units = splitComplexSelector(one);
    // `.a > .b + .c` still contains `.c`: a sibling of a child is inside the
    // same parent. What must exist somewhere left of the subject is at least
    // one containing combinator.
    return units.slice(1).some((unit) => CONTAINING_COMBINATORS.has(unit.combinator));
  });
}

/**
 * Defect 3, second half. Generic containment (above) only proves the SHAPE of
 * a selector, not its relationship to any particular rule -- `.other > .inner`
 * "looks" contained no matter what it is nested under. This proves the
 * consumer is a permitted descendant of THE SPECIFIC RULE that produced a
 * channel: the consumer's own unit chain must carry the producer's unit chain
 * as an exact prefix (same compounds, same combinators), followed by at least
 * one more unit joined by a containing combinator. Fail-closed across both
 * sides' selector lists: every consumer arm must find at least one matching
 * producer arm.
 */
export function isDescendantOfSelector(producerSelector, consumerSelector) {
  const producerArms = splitSelectorList(String(producerSelector ?? ''));
  const consumerArms = splitSelectorList(String(consumerSelector ?? ''));
  if (producerArms.length === 0 || consumerArms.length === 0) return false;
  return consumerArms.every((consumerArm) => {
    const consumerUnits = splitComplexSelector(consumerArm);
    return producerArms.some((producerArm) => {
      const producerUnits = splitComplexSelector(producerArm);
      if (producerUnits.length === 0) return false;
      if (consumerUnits.length <= producerUnits.length) return false;
      const prefixMatches = producerUnits.every(
        (unit, index) =>
          compoundIsExactOrNarrower(unit.compound, consumerUnits[index].compound) &&
          unit.combinator === consumerUnits[index].combinator,
      );
      if (!prefixMatches) return false;
      return CONTAINING_COMBINATORS.has(consumerUnits[producerUnits.length].combinator);
    });
  });
}

/**
 * A consumer may narrow a producer compound without ceasing to descend from
 * that producer. For example, `.card[data-part='root']:not([data-tone])` is a
 * subset of `.card[data-part='root']`; requiring byte-identical compounds
 * rejects that valid same-producer arm. Keep the allowance deliberately
 * one-way and suffix-only: reordering, replacing or removing any producer
 * condition still fails closed, and an identifier continuation such as
 * `.cardinal` cannot masquerade as a refinement of `.card`.
 */
export function compoundIsExactOrNarrower(producerCompound, consumerCompound) {
  const producer = String(producerCompound ?? '').trim();
  const consumer = String(consumerCompound ?? '').trim();
  if (producer.length === 0 || consumer.length === 0) return false;
  if (producer === consumer) return true;
  if (!consumer.startsWith(producer)) return false;
  return /^(?:[.\[#:])/u.test(consumer.slice(producer.length));
}

/**
 * Clause (e). Is the subject a component's OWN root? Two structural shapes say
 * yes: the DS root part marker, and a class the subject shares with one of its
 * own ancestors -- `.ds-semantic-surface .ds-semantic-surface` is one component
 * nested in itself, so the inner `border-radius` is still that component's own.
 */
export function subjectIsComponentRoot(selector) {
  return splitSelectorList(String(selector ?? '')).some((one) => {
    const units = splitComplexSelector(one);
    const subject = units.at(-1)?.compound;
    if (!subject) return false;
    if (compoundHasRootMarker(subject)) return true;
    const own = new Set(compoundConditions(subject));
    if (own.size === 0) return false;
    return units
      .slice(0, -1)
      .some((unit) => compoundConditions(unit.compound).some((name) => own.has(name)));
  });
}

function normalizeSelector(selector) {
  return String(selector ?? '').replace(/\s+/gu, ' ').trim();
}

/**
 * Scan backward/forward from a boundary, skipping whitespace only, and return
 * the index of the first significant character (or -1 / text.length past the
 * end when none exists).
 */
function significantIndexBefore(text, fromIndex) {
  let index = fromIndex;
  while (index >= 0 && /\s/u.test(text[index])) index -= 1;
  return index;
}
function significantIndexAfter(text, fromIndex) {
  let index = fromIndex;
  while (index < text.length && /\s/u.test(text[index])) index += 1;
  return index;
}

/**
 * Clause (c). True when any reference in `names` is an operand of `*` or `/`.
 *
 * Concentricity SUBTRACTS a scaled padding from an unscaled parent radius, so
 * the rhythm-carrying reference may sit inside `calc(... - x)`, `min()` or
 * `max()`, but never multiply or divide. A textual "does the value contain a
 * `*`" test would be wrong in both directions: `calc(var(--radius) / 2)` is a
 * legitimate unscaled half-corner when the divided operand carries no rhythm,
 * and a nested multiplication would hide from a depth-blind scan. So the value
 * is walked and each reference is judged by its own adjacent operators, and
 * the check is balanced-paren AWARE rather than a naive adjacent-character
 * read: it peels matched pure-wrapping parens around the reference before
 * asking what operator sits next to it, so `((var(--x))) * 2` is not defeated
 * by the redundant grouping the way a raw-text check would be.
 */
export function scalesByReference(value, names) {
  const text = String(value ?? '');
  const wanted = new Set([...names].map((name) => name.toLowerCase()));
  for (let index = text.indexOf('var('); index !== -1; index = text.indexOf('var(', index + 1)) {
    const nameMatch = /^var\(\s*(--[\w-]+)/u.exec(text.slice(index));
    if (!nameMatch || !wanted.has(nameMatch[1].toLowerCase())) continue;

    let depth = 0;
    let close = index + 3;
    for (; close < text.length; close += 1) {
      if (text[close] === '(') depth += 1;
      else if (text[close] === ')') {
        depth -= 1;
        if (depth === 0) break;
      }
    }

    // Balanced-paren aware: a naive "adjacent character" check is defeated by
    // redundant grouping parens (`((var(--x))) * 2`), since the character
    // immediately outside the innermost wrap is `)`, not `*`. Peel matched
    // PURE wrapping parens -- a `(` immediately (mod whitespace) before the
    // current span and a `)` immediately after it -- one layer at a time.
    // In a balanced string this pair can only match each other (nothing else
    // sits between a boundary and its own immediate neighbor), so peeling
    // never crosses into an unrelated grouping, e.g. the `2 * ` prefix of
    // `calc(2 * (var(--x)))` halts the leftward peel at `*`, not at `calc(`.
    let left = index;
    let right = close + 1;
    for (;;) {
      const beforeIndex = significantIndexBefore(text, left - 1);
      const afterIndex = significantIndexAfter(text, right);
      const hasWrap =
        beforeIndex >= 0 &&
        text[beforeIndex] === '(' &&
        afterIndex < text.length &&
        text[afterIndex] === ')';
      if (!hasWrap) break;
      left = beforeIndex;
      right = afterIndex + 1;
    }
    const beforeIndex = significantIndexBefore(text, left - 1);
    const afterIndex = significantIndexAfter(text, right);
    const before = beforeIndex >= 0 ? text[beforeIndex] : undefined;
    const after = afterIndex < text.length ? text[afterIndex] : undefined;
    if (before === '*' || before === '/' || after === '*' || after === '/') return true;
  }
  return false;
}

/**
 * Does the value subtract or clamp rather than adopt? CSS `calc()` requires
 * whitespace around a binary `-`, which is what makes the subtraction test
 * safe against a hyphenated custom-property name.
 */
export function derivesConcentrically(value) {
  const text = String(value ?? '');
  return /\s-\s/u.test(text) || /(?:^|[^\w-])(?:min|max|clamp)\s*\(/u.test(text);
}

function customPropertySemanticName(property) {
  return property
    .toLowerCase()
    .replace(/^--_?ds-/u, '')
    .replace(/^--/u, '');
}

/** Classify the capability a declaration property belongs to. */
export function classifyRhythmProperty(property) {
  const normalized = property.trim().toLowerCase();

  if (!normalized.startsWith('--')) {
    if (PHYSICAL_INLINE_SIDE_PROPERTY.test(normalized)) {
      return CLASSIFICATIONS.forbiddenPhysicalInlineSide;
    }
    if (ALLOWED_DIRECT_PROPERTY.test(normalized)) {
      return CLASSIFICATIONS.allowedSpacing;
    }
    if (SIZE_PROPERTY.test(normalized)) return CLASSIFICATIONS.forbiddenSize;
    if (TYPOGRAPHY_PROPERTY.test(normalized)) {
      return CLASSIFICATIONS.forbiddenTypography;
    }
    if (MOTION_PROPERTY.test(normalized)) return CLASSIFICATIONS.forbiddenMotion;
    // Fail closed. An unclassifiable property is not evidence of innocence.
    return CLASSIFICATIONS.forbiddenOther;
  }

  const semanticName = customPropertySemanticName(normalized);
  // Forbidden capabilities outrank a coincidental spacing word. For example,
  // --ds-icon-gap is icon geometry, not a rhythm-owned layout relationship,
  // and --ds-card-padding-left is an RTL-hostile side, not room.
  if (PHYSICAL_INLINE_NAME_SEGMENT.test(semanticName)) {
    return CLASSIFICATIONS.forbiddenPhysicalInlineSide;
  }
  if (TOUCH_NAME_SEGMENT.test(semanticName)) {
    return CLASSIFICATIONS.forbiddenTouchTarget;
  }
  if (ICON_NAME_SEGMENT.test(semanticName)) return CLASSIFICATIONS.forbiddenIcon;
  if (TYPE_NAME_SEGMENT.test(semanticName)) {
    return CLASSIFICATIONS.forbiddenTypography;
  }
  if (MOTION_NAME_SEGMENT.test(semanticName)) {
    return CLASSIFICATIONS.forbiddenMotion;
  }
  if (SIZE_NAME_SEGMENT.test(semanticName)) return CLASSIFICATIONS.forbiddenSize;
  if (SPACING_NAME_SEGMENT.test(semanticName)) {
    return CLASSIFICATIONS.allowedSpacing;
  }
  return CLASSIFICATIONS.forbiddenOther;
}

function declarationContext(declaration) {
  let cursor = declaration.parent;
  let selector = '<stylesheet-root>';
  const atRules = [];

  while (cursor) {
    if (cursor.type === 'rule' && selector === '<stylesheet-root>') {
      selector = cursor.selector;
    } else if (cursor.type === 'atrule') {
      atRules.unshift(`@${cursor.name}${cursor.params ? ` ${cursor.params}` : ''}`);
    }
    cursor = cursor.parent;
  }

  const parts = [...selector.matchAll(/\[data-part\s*=\s*['"]?([^'"\]\s]+)/gu)]
    .map((match) => match[1]);
  return { selector, atRules, parts: [...new Set(parts)] };
}

/** Resolve the family from the canonical inventory rather than a file list. */
export function resolveDashboardInsightsFamilyId(
  inventoryPath = DEFAULT_FAMILY_INVENTORY,
) {
  const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'));
  const matches = inventory.rows?.filter(
    (row) => row.family === 'DashboardInsights',
  );
  if (!Array.isArray(matches) || matches.length !== 1 || !matches[0]?.id) {
    throw new Error(
      `canonical family inventory must contain exactly one DashboardInsights row: ${inventoryPath}`,
    );
  }
  return matches[0].id;
}

/**
 * Walk `sourceRoot` for authored stylesheets and, in the same pass, prove the
 * exclusion set is honest: an excluded stylesheet that carries a rhythm read
 * would mean the walk is hiding a productive read behind a folder name.
 */
export function collectAuthoredModernStylesheets(
  sourceRoot = DEFAULT_SOURCE_ROOT,
) {
  const root = resolve(sourceRoot);
  let rootStats;
  try {
    rootStats = statSync(root);
  } catch {
    throw new Error(`Modern authored CSS corpus is missing: ${root}`);
  }
  if (!rootStats.isDirectory()) {
    throw new Error(`Modern authored CSS corpus is not a directory: ${root}`);
  }

  const files = [];
  const excluded = [];
  const walk = (directory, insideExcluded) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const full = join(directory, entry.name);
      const corpusRelative = relative(root, full).split(sep).join('/');
      const skipped = insideExcluded || EXCLUDED_PATH.test(corpusRelative);
      if (entry.isDirectory()) {
        walk(full, skipped);
      } else if (entry.isFile() && entry.name.endsWith('.css')) {
        (skipped ? excluded : files).push(full);
      }
    }
  };
  walk(root, false);

  if (files.length === 0) {
    throw new Error(`Modern authored CSS corpus contains zero stylesheets: ${root}`);
  }

  const hidden = excluded.filter((file) =>
    occurrenceCount(readFileSync(file, 'utf8')) > 0,
  );
  if (hidden.length > 0) {
    throw new Error(
      `excluded paths are hiding ${hidden.length} rhythm read(s); the exclusion set is no longer honest: ${hidden
        .map((file) => reportPath(file))
        .join(', ')}`,
    );
  }

  return files.sort().map((file) => ({
    file,
    css: readFileSync(file, 'utf8'),
  }));
}

/**
 * Classify every read in an explicit stylesheet set. Exported for hermetic
 * positive/negative fixtures; production uses collectAuthoredModernStylesheets.
 *
 * `dashboardInsightsFamilyId` is null by default on purpose: the canonical id
 * is resolved from the inventory by `runGate`, and hard-coding it here as a
 * default would let a renamed family go unnoticed behind a stale literal.
 */
export function analyzeRhythmStylesheets(
  stylesheets,
  { dashboardInsightsFamilyId = null } = {},
) {
  const reads = [];
  const parseErrors = [];
  /** Every declaration in the corpus, kept for the indirect (laundering) leg. */
  const declarations = [];

  for (const stylesheet of stylesheets) {
    let root;
    try {
      root = postcss.parse(stylesheet.css, { from: stylesheet.file });
    } catch (error) {
      parseErrors.push({
        file: stylesheet.file,
        message: error instanceof Error ? error.message : String(error),
      });
      continue;
    }

    root.walkDecls((declaration) => {
      const value = declaration.value ?? '';
      const count = occurrenceCount(value);
      const property = declaration.prop.trim().toLowerCase();
      const context = declarationContext(declaration);
      const familyId = value.includes(DASHBOARD_PANEL_SIZE_SEAM)
        ? dashboardInsightsFamilyId
        : null;

      declarations.push({
        file: stylesheet.file,
        line: declaration.source?.start?.line ?? 0,
        property,
        rawProperty: declaration.prop,
        value,
        directReads: count,
        references: referencedCustomProperties(value),
        familyId,
        ...context,
      });

      if (count === 0) return;

      const classification = classifyRhythmProperty(declaration.prop);
      for (let occurrence = 1; occurrence <= count; occurrence += 1) {
        reads.push({
          file: stylesheet.file,
          line: declaration.source?.start?.line ?? 0,
          property: declaration.prop,
          classification,
          reach: 'direct',
          occurrence,
          familyId,
          ...context,
        });
      }
    });
  }

  // --- the indirect leg: which custom properties CARRY rhythm downstream ---
  const carriers = new Set(
    declarations
      .filter((entry) => entry.directReads > 0 && entry.property.startsWith('--'))
      .map((entry) => entry.property),
  );
  for (let changed = true; changed; ) {
    changed = false;
    for (const entry of declarations) {
      if (!entry.property.startsWith('--')) continue;
      if (carriers.has(entry.property)) continue;
      if (entry.references.some((name) => carriers.has(name))) {
        carriers.add(entry.property);
        changed = true;
      }
    }
  }

  // --- defect 2: which carriers are THEMSELVES multiplied one hop upstream ---
  // `--ds-card-padding-current: calc(1rem * rhythm)` legitimately multiplies
  // the RAW channel by a constant -- that IS what "rhythm-scaled padding"
  // means, and is invisible here on purpose (RHYTHM_CHANNELS is excluded from
  // the wanted set). What must NOT pass is an intermediate carrier that
  // multiplies ANOTHER CARRIER by a further factor: `--ds-padding-doubled:
  // calc(var(--ds-card-padding-current) * 2)` is fine to exist under its own
  // spacing-shaped name, but a radius that only ever SUBTRACTS it (never
  // multiplying it itself) would otherwise track the padding at 2x the true
  // rhythm rate while looking, at that one declaration, like a clean
  // derivation. Taint propagates transitively: anything that references an
  // already-tainted carrier is tainted too, regardless of its own operator.
  const nonBaseCarriers = new Set(
    [...carriers].filter((name) => !RHYTHM_CHANNELS.includes(name)),
  );
  const multipliedCarriers = new Set();
  for (let changed = true; changed; ) {
    changed = false;
    for (const entry of declarations) {
      if (!entry.property.startsWith('--') || !carriers.has(entry.property)) continue;
      if (multipliedCarriers.has(entry.property)) continue;
      const scalesAnotherCarrier =
        scalesByReference(entry.value, nonBaseCarriers) ||
        entry.references.some((name) => multipliedCarriers.has(name));
      if (scalesAnotherCarrier) {
        multipliedCarriers.add(entry.property);
        changed = true;
      }
    }
  }

  // --- which private radius channels earn DERIVED CONCENTRIC GEOMETRY ---
  // Computed by the same fixed point that found the carriers, so a new
  // concentric channel is discovered rather than registered. A channel that
  // derives straight from scaled padding must additionally SUBTRACT or CLAMP
  // it: `--_x-radius: var(--ds-card-padding-current)` adopts the scaled
  // padding wholesale, which is an outer radius that tracks rhythm 1:1.
  const paddingCarriers = new Set(
    [...carriers].filter((name) =>
      SPACING_NAME_SEGMENT.test(customPropertySemanticName(name)),
    ),
  );

  /**
   * Clause (g). A carrier's NAME containing a spacing word is not evidence it
   * is THIS element's own padding -- a global token borrowed from elsewhere in
   * the corpus, or never applied as padding at all, licenses nothing. The
   * producing RULE (the exact selector declaring the private radius channel)
   * must itself paint a real `padding`/`padding-*` property, under that SAME
   * selector, that reads at least one of the same carriers the radius does.
   */
  const selectorPaintsRealRhythmPadding = (selector, viaNames) => {
    const key = normalizeSelector(selector);
    return declarations.some(
      (candidate) =>
        !candidate.property.startsWith('--') &&
        PADDING_PAINT_PROPERTY.test(candidate.property) &&
        normalizeSelector(candidate.selector) === key &&
        candidate.references.some((name) => viaNames.includes(name)),
    );
  };
  // Clause (f) input: which private channels are drunk by a `border-radius`
  // under the SAME selector. Declaring a corner and immediately wearing it is
  // republication; the concentric case declares what its CHILDREN wear.
  const selfPaintedChannels = new Set();
  const radiusPaintReadsBySelector = new Map();
  for (const entry of declarations) {
    if (entry.property.startsWith('--')) continue;
    if (!RADIUS_PROPERTY.test(entry.property)) continue;
    const key = normalizeSelector(entry.selector);
    const reads = radiusPaintReadsBySelector.get(key) ?? new Set();
    for (const name of entry.references) reads.add(name);
    radiusPaintReadsBySelector.set(key, reads);
  }
  for (const entry of declarations) {
    if (!entry.property.startsWith('--')) continue;
    if (radiusPaintReadsBySelector.get(normalizeSelector(entry.selector))?.has(entry.property)) {
      selfPaintedChannels.add(entry.property);
    }
  }

  const concentric = new Set();
  const concentricCandidate = (entry) =>
    entry.property.startsWith('--') &&
    isPrivateChannel(entry.property) &&
    isRadiusSemantic(entry.property) &&
    !selfPaintedChannels.has(entry.property);
  for (let changed = true; changed; ) {
    changed = false;
    for (const entry of declarations) {
      if (!concentricCandidate(entry) || concentric.has(entry.property)) continue;
      const via = entry.references.filter((name) => carriers.has(name));
      if (via.length === 0 || scalesByReference(entry.value, carriers)) continue;
      // Defect 2: an upstream carrier that was itself multiplied must not
      // launder a compounded factor into the radius through mere subtraction.
      if (via.some((name) => multipliedCarriers.has(name))) continue;
      const fromConcentric = via.every((name) => concentric.has(name));
      // Defect 3 (clause g): chaining through an ALREADY-licensed concentric
      // channel needs no fresh padding proof (it inherited one when IT was
      // licensed); a fresh derivation from a raw carrier does, and that proof
      // is a real paint under THIS declaration's OWN selector, not a name.
      const fromPaddingProducer =
        via.every((name) => concentric.has(name) || paddingCarriers.has(name)) &&
        selectorPaintsRealRhythmPadding(entry.selector, via);
      if (!fromConcentric && !(fromPaddingProducer && derivesConcentrically(entry.value))) {
        continue;
      }
      concentric.add(entry.property);
      changed = true;
    }
  }

  // Defect 3 (clause h). Where each licensed channel was ACTUALLY produced,
  // so a later paint site can be checked against that SPECIFIC rule rather
  // than against selector shape alone.
  const producingSelectorsByProperty = new Map();
  for (const entry of declarations) {
    if (!entry.property.startsWith('--') || !concentric.has(entry.property)) continue;
    const set = producingSelectorsByProperty.get(entry.property) ?? new Set();
    set.add(entry.selector);
    producingSelectorsByProperty.set(entry.property, set);
  }
  // One disqualifying declaration disqualifies the channel everywhere. A
  // property that earns the allowance at one site and scales at another must
  // not launder the scaling site through its own good name.
  for (const entry of declarations) {
    if (!concentric.has(entry.property)) continue;
    const via = entry.references.filter((name) => carriers.has(name));
    if (via.length === 0) continue;
    if (scalesByReference(entry.value, carriers)) concentric.delete(entry.property);
  }

  /**
   * Judge one radius-semantic declaration that consumes rhythm, and say WHICH
   * clause it broke. A single "unlicensed" bucket would report the ruling's own
   * named counterexample and an honest inner corner with the same word.
   */
  const judgeRadiusReach = (entry, via) => {
    if (entry.property.startsWith('--')) {
      // (a) a public republication is a generic carrier by construction.
      if (!isPrivateChannel(entry.property)) {
        return CLASSIFICATIONS.forbiddenGenericRadiusCarrier;
      }
      // (f) a private channel painted on its own selector is the same defect
      // with a private name -- the ruling's `--_surface-radius-current` case.
      if (selfPaintedChannels.has(entry.property)) {
        return CLASSIFICATIONS.forbiddenGenericRadiusCarrier;
      }
      if (concentric.has(entry.property)) {
        return CLASSIFICATIONS.derivedConcentricGeometry;
      }
      // (c) left: it scaled, or adopted scaled padding wholesale, so the corner
      // tracks the factor. That is an outer-radius change.
      return CLASSIFICATIONS.forbiddenOuterRadius;
    }
    if (scalesByReference(entry.value, carriers)) {
      return CLASSIFICATIONS.forbiddenOuterRadius;
    }
    // (d) + (e): the paint must be demonstrably inner AND not a whole
    // component's own root, and (b) it must drink only from proven concentric
    // channels rather than raw rhythm.
    if (!subjectIsContained(entry.selector)) return CLASSIFICATIONS.forbiddenOuterRadius;
    // Defect 4: a subject built only from `*`/pseudo-classes (including a
    // `:not([hidden])` decoration) carries no identity, so it could paint a
    // nested whole component's own root exactly as clause (e) forbids.
    if (subjectLacksIdentity(entry.selector)) return CLASSIFICATIONS.forbiddenOuterRadius;
    if (subjectIsComponentRoot(entry.selector)) return CLASSIFICATIONS.forbiddenOuterRadius;
    if (!via.every((name) => concentric.has(name))) {
      return CLASSIFICATIONS.forbiddenOuterRadius;
    }
    // Defect 3 (clause h): contained is not the same as descended from THE
    // PRODUCER. `.other-widget > .inner` looks contained no matter what it is
    // nested under; it must specifically descend from the rule(s) that
    // declared each channel it drinks from.
    const descendsFromProducer = via.every((name) =>
      [...(producingSelectorsByProperty.get(name) ?? [])].some((producerSelector) =>
        isDescendantOfSelector(producerSelector, entry.selector),
      ),
    );
    if (!descendsFromProducer) return CLASSIFICATIONS.forbiddenOuterRadius;
    return CLASSIFICATIONS.derivedConcentricGeometry;
  };

  const indirectViolations = [];
  const indirectUnclassified = [];
  const concentricAllowances = [];
  const namedForbidden = new Set(NAMED_FORBIDDEN_CAPABILITIES);
  for (const entry of declarations) {
    // A declaration that names the channel is already judged by the direct leg.
    if (entry.directReads > 0) continue;
    const via = entry.references.filter((name) => carriers.has(name));
    if (via.length === 0) continue;
    let classification = classifyRhythmProperty(entry.rawProperty);
    if (classification === CLASSIFICATIONS.allowedSpacing) continue;
    // Clause (b) gates entry to the radius grammar at all: a non-radius
    // property drinking from a concentric channel stays whatever it is.
    if (isRadiusSemantic(entry.property)) {
      classification = judgeRadiusReach(entry, via);
    }
    const finding = {
      file: entry.file,
      line: entry.line,
      property: entry.rawProperty,
      classification,
      reach: 'indirect',
      via: [...new Set(via)],
      familyId: entry.familyId,
      selector: entry.selector,
      atRules: entry.atRules,
      parts: entry.parts,
    };
    if (classification === CLASSIFICATIONS.derivedConcentricGeometry) {
      concentricAllowances.push(finding);
    } else if (namedForbidden.has(classification)) indirectViolations.push(finding);
    else indirectUnclassified.push(finding);
  }

  const violations = reads.filter(
    (read) => read.classification !== CLASSIFICATIONS.allowedSpacing,
  );
  const byClassification = Object.fromEntries(
    Object.values(CLASSIFICATIONS).map((classification) => [classification, 0]),
  );
  for (const read of reads) byClassification[read.classification] += 1;

  const violationsByFamily = {};
  for (const violation of [...violations, ...indirectViolations]) {
    const family = violation.familyId ?? 'UNRESOLVED_FAMILY';
    violationsByFamily[family] ??= [];
    violationsByFamily[family].push(violation);
  }

  return {
    ok:
      parseErrors.length === 0 &&
      reads.length > 0 &&
      violations.length === 0 &&
      indirectViolations.length === 0 &&
      // Fail-closed: an indirect reach the concentric ruling does not license
      // is a violation, not a note. This is the clause that closed the bucket.
      indirectUnclassified.length === 0,
    reads,
    violations,
    indirectViolations,
    indirectUnclassified,
    concentricAllowances,
    concentricChannels: [...concentric].sort(),
    rhythmCarriers: [...carriers].sort(),
    parseErrors,
    byClassification,
    violationsByFamily,
  };
}

/**
 * THE HONESTY CHECK for this gate's own scope.
 *
 * Everything above walks `.css`. That is a CLAIM about where rhythm can reach
 * paint, and the claim is only true while no TypeScript module carries the
 * channel into an inline style. A component that writes
 * `style={{ blockSize: `calc(415px * var(--ds-rhythm-effective-scale))` }}`
 * paints exactly as hard as a stylesheet and is invisible to a CSS walk -- so
 * asserting "CSS-only completeness" without measuring the TS side would be a
 * claim the instrument cannot support.
 *
 * So the TS/TSX corpus is scanned for rhythm reads too. A read is reported with
 * the property it is assigned to when that is decidable from the surrounding
 * object key, and classified through the SAME classifier the CSS legs use, so a
 * TS carrier cannot be judged by a softer rule than a stylesheet.
 */
const TS_EXCLUDED_PATH = /(?:^|\/)(?:node_modules|dist|coverage|__snapshots__|tests|fixtures|generated)(?:\/|$)/u;

/**
 * A NAME is not a READ. `TENANT_THEME_OVERRIDE_TOKENS` listing the channel and
 * a compiler doing `vars['--ds-rhythm-scale'] = x` both mention the channel
 * while painting nothing -- one declares the vocabulary, the other WRITES it.
 * Only a `var(` reference consumes the channel, so only that can carry rhythm
 * into a property.
 */
const TS_VAR_READ = new RegExp(
  `var\\(\\s*(?:${RHYTHM_CHANNELS.map((channel) =>
    channel.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'),
  ).join('|')})(?![-\\w])`,
  'gu',
);

/**
 * The property key that OPENS the value the read sits inside.
 *
 * Anchored at the start of the value expression rather than immediately before
 * the read, because the read is usually wrapped: `blockSize: \`calc(415px *
 * var(--ds-rhythm-…))\`` puts `calc(415px * ` between the key and the channel.
 * The value is delimited by the previous `,`, `{` or `;`, so slicing there and
 * matching a leading `key:` finds the real target while a nested read inside
 * another property's value cannot borrow the wrong key.
 */
const INLINE_STYLE_KEY = /^\s*(["'`]?)([A-Za-z-][\w-]*)\1\s*:/u;
const VALUE_DELIMITER = /[,{;]/gu;

function camelToKebab(name) {
  return name.replace(/([a-z0-9])([A-Z])/gu, '$1-$2').toLowerCase();
}

/**
 * Is this key a CSS property this gate has an opinion about?
 *
 * Built from the SAME property sets the CSS legs classify with, so the TS leg
 * cannot recognize a different vocabulary than the stylesheet leg.
 */
export function isRecognizedCssProperty(property) {
  const normalized = String(property ?? '').trim().toLowerCase();
  return (
    /^--[\w-]+$/u.test(normalized)
    ||
    ALLOWED_DIRECT_PROPERTY.test(normalized)
    || PHYSICAL_INLINE_SIDE_PROPERTY.test(normalized)
    || SIZE_PROPERTY.test(normalized)
    || TYPOGRAPHY_PROPERTY.test(normalized)
    || MOTION_PROPERTY.test(normalized)
    || RADIUS_PROPERTY.test(normalized)
  );
}

export const UNDECIDABLE_TS_CARRIER = 'UNDECIDABLE_TS_CARRIER';

/**
 * Defect 1, "resolved structurally" half. A read mentioned only in a
 * documentation comment or a line comment explaining the channel paints
 * nothing and is not an ambiguous carrier at all; scanning raw source text
 * without this (as the original TS leg did) would make every doc comment
 * that illustrates a `var(--ds-rhythm-…)` example an UNDECIDABLE finding,
 * which is noise rather than the honest residue defect 1 means to surface.
 * Comments are blanked to same-length whitespace (newlines preserved) so
 * line numbers and every other offset stay correct. This is a best-effort
 * lexical pass -- a comment-opening sequence inside a string literal can
 * still confuse it -- which is an acceptable, narrow limitation for a
 * channel-name substring scan that is already explicit about not being a
 * type-aware analysis.
 */
function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/gu, (match) =>
    match.replace(/[^\n]/gu, ' '),
  );
}

function regexEscape(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

/** A textual `var(` prefix is not a CSS read until its function closes. */
function cssFunctionCloses(source, start) {
  const open = source.indexOf('(', start);
  if (open === -1) return false;
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === '(') depth += 1;
    else if (source[index] === ')') {
      depth -= 1;
      if (depth === 0) return true;
    }
  }
  return false;
}

function identifierOccurs(text, identifier) {
  return new RegExp(`(?<![\\w$])${regexEscape(identifier)}(?![\\w$])`, 'u').test(text);
}

function matchingBrace(source, open) {
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    else if (source[index] === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function functionSpans(source) {
  const spans = [];
  const declarations = /\bfunction\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)[^{]*\{/gu;
  for (const match of source.matchAll(declarations)) {
    const open = source.indexOf('{', match.index + match[0].length - 1);
    const close = matchingBrace(source, open);
    if (close !== -1) spans.push({ name: match[1], start: match.index, open, close });
  }
  return spans;
}

function variableInitializers(source) {
  const ranges = [];
  const declarations = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([^;]*);/gu;
  for (const match of source.matchAll(declarations)) {
    ranges.push({
      name: match[1],
      initializer: match[2],
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return ranges;
}

function containingBraceBlock(source, index) {
  const stack = [];
  for (let cursor = 0; cursor <= index; cursor += 1) {
    if (source[cursor] === '{') stack.push(cursor);
    else if (source[cursor] === '}') stack.pop();
  }
  const open = stack.at(-1);
  if (open === undefined) return null;
  const close = matchingBrace(source, open);
  if (close === -1) return null;
  return { open, close, text: source.slice(open + 1, close) };
}

function propertyKeyBefore(source, index) {
  const upTo = source.slice(0, index);
  const window = upTo.slice(Math.max(0, upTo.length - 200));
  let valueStart = 0;
  for (const delimiter of window.matchAll(VALUE_DELIMITER)) valueStart = delimiter.index + 1;
  const keyMatch = INLINE_STYLE_KEY.exec(window.slice(valueStart));
  return keyMatch ? camelToKebab(keyMatch[2]) : null;
}

function resolverSinkPropertyAt(source, index) {
  const block = containingBraceBlock(source, index);
  if (!block) return null;
  const relativeIndex = index - block.open - 1;
  const before = block.text.slice(0, relativeIndex);
  const resolveStart = before.lastIndexOf('resolve:');
  const boundary = Math.max(before.lastIndexOf(','), before.lastIndexOf('{'));
  if (resolveStart <= boundary) return null;
  const cssProperty = /\bcssProperty\s*:\s*(['"])([^'"]+)\1/u.exec(block.text)?.[2];
  return cssProperty ? camelToKebab(cssProperty) : null;
}

/**
 * Follow a module-level rhythm string through resolver functions/aliases to
 * every `ResponsivePropEntry.cssProperty` sink in the authored TS corpus.
 * This is intentionally conservative: any occurrence outside a declaration,
 * tainted function, import/export, alias, or structurally paired `resolve`
 * sink makes the origin undecidable. No symbol/file allowlist is involved.
 */
function traceTypeScriptCarrierTargets(corpus, binding) {
  const tainted = new Set([binding]);
  // Most source modules never mention the carrier. Parse structural ranges
  // lazily for matching files only; eagerly walking thousands of TS modules
  // for every live-gate assertion turns a static check into a CPU burner.
  const functionsByFile = new Map();
  const variablesByFile = new Map();
  const rangesFor = (file, source) => {
    if (!functionsByFile.has(file)) functionsByFile.set(file, functionSpans(source));
    if (!variablesByFile.has(file)) variablesByFile.set(file, variableInitializers(source));
    return {
      spans: functionsByFile.get(file),
      variables: variablesByFile.get(file),
    };
  };

  for (let changed = true; changed; ) {
    changed = false;
    // A stable frontier is essential. Symbols discovered while visiting one
    // function must not immediately taint its callers before the next pass has
    // had a chance to recognize aliases and terminal `cssProperty` sinks.
    const frontier = [...tainted];
    for (const { file, source } of corpus) {
      if (!frontier.some((name) => identifierOccurs(source, name))) continue;
      const { spans, variables } = rangesFor(file, source);
      // Resolve local aliases first. Otherwise a function containing
      // `const resolver = condition ? taintedResolver : plainResolver` is
      // prematurely tainted as a whole before the alias can be followed to its
      // concrete `cssProperty` sinks, exploding the graph through every caller.
      for (const variable of variables) {
        if (
          frontier.some((name) => identifierOccurs(variable.initializer, name))
          && !tainted.has(variable.name)
        ) {
          tainted.add(variable.name);
          changed = true;
        }
      }
      for (const span of spans) {
        const carriesIntoReturn = frontier.some((name) => {
          const occurrences = new RegExp(`(?<![\\w$])${regexEscape(name)}(?![\\w$])`, 'gu');
          for (const match of source.slice(span.open + 1, span.close).matchAll(occurrences)) {
            const absolute = span.open + 1 + match.index;
            if (resolverSinkPropertyAt(source, absolute)) continue;
            if (
              variables.some(
                (variable) =>
                  tainted.has(variable.name)
                  && absolute >= variable.start
                  && absolute < variable.end,
              )
            ) {
              continue;
            }
            return true;
          }
          return false;
        });
        if (carriesIntoReturn && !tainted.has(span.name)) {
          tainted.add(span.name);
          changed = true;
        }
      }
    }
  }

  const targets = new Set();
  let undecidable = false;
  for (const { file, source } of corpus) {
    if (![...tainted].some((name) => identifierOccurs(source, name))) continue;
    const { spans, variables } = rangesFor(file, source);
    for (const name of tainted) {
      const occurrences = new RegExp(`(?<![\\w$])${regexEscape(name)}(?![\\w$])`, 'gu');
      for (const match of source.matchAll(occurrences)) {
        const index = match.index;
        if (spans.some((span) => index >= span.start && index <= span.close && tainted.has(span.name))) {
          continue;
        }
        if (variables.some((variable) => index >= variable.start && index < variable.end && tainted.has(variable.name))) {
          continue;
        }
        const statementStart = source.lastIndexOf(';', index) + 1;
        const statementEnd = source.indexOf(';', index);
        const statement = source.slice(
          statementStart,
          statementEnd === -1 ? source.length : statementEnd + 1,
        );
        if (/^\s*(?:import|export)\b/u.test(statement)) continue;

        const sinkProperty = resolverSinkPropertyAt(source, index);
        if (sinkProperty) {
          targets.add(sinkProperty);
          continue;
        }

        // A direct call may still have a decidable inline-style target.
        const after = source.slice(index + name.length).match(/^\s*/u)?.[0].length ?? 0;
        if (source[index + name.length + after] === '(') {
          const property = propertyKeyBefore(source, index);
          if (property && isRecognizedCssProperty(property)) targets.add(property);
          else undecidable = true;
          continue;
        }
        undecidable = true;
      }
    }
  }
  return { targets: [...targets], undecidable };
}

export function collectTypeScriptRhythmCarriers(sourceRoot = DEFAULT_SOURCE_ROOT) {
  const root = resolve(sourceRoot);
  const findings = [];
  const corpus = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const full = join(directory, entry.name);
      const corpusRelative = relative(root, full).split(sep).join('/');
      if (TS_EXCLUDED_PATH.test(corpusRelative)) continue;
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!/\.tsx?$/u.test(entry.name)) continue;
      const source = stripComments(readFileSync(full, 'utf8'));
      corpus.push({ file: full, source });
    }
  };
  walk(root);

  for (const { file: full, source } of corpus) {
      for (const match of source.matchAll(TS_VAR_READ)) {
        if (!cssFunctionCloses(source, match.index)) continue;
        const upTo = source.slice(0, match.index);
        const line = upTo.split('\n').length;
        // The nearest enclosing object key, when the read sits directly in a
        // value position. A read built inside a helper has no key here, and is
        // reported as undecidable rather than assumed innocent.
        const window = upTo.slice(Math.max(0, upTo.length - 200));
        let valueStart = 0;
        for (const delimiter of window.matchAll(VALUE_DELIMITER)) {
          valueStart = delimiter.index + 1;
        }
        const keyMatch = INLINE_STYLE_KEY.exec(window.slice(valueStart));
        const candidate = keyMatch ? camelToKebab(keyMatch[2]) : null;
        // A key is only a STYLE target when it is a CSS property this gate
        // recognizes. TypeScript object keys are not typed here, and the
        // capability registry legitimately stores the channel under keys like
        // `symbol:` and `consumer:` as evidence metadata -- classifying those
        // as CSS would fail the gate on a registry entry that paints nothing.
        // Unrecognized keys are therefore DISCLOSED, not failed: this is the
        // stated limit of the TS leg, not a silent pass.
        let property = candidate && isRecognizedCssProperty(candidate) ? candidate : null;
        let classification = property
          ? classifyRhythmProperty(property)
          : UNDECIDABLE_TS_CARRIER;

        if (!property) {
          const bindingMatch = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*[^;\n]*$/u.exec(
            upTo.slice(Math.max(0, upTo.length - 300)),
          );
          if (bindingMatch) {
            const traced = traceTypeScriptCarrierTargets(corpus, bindingMatch[1]);
            const classifiedTargets = traced.targets.map((target) => ({
              target,
              classification: classifyRhythmProperty(target),
            }));
            const violating = classifiedTargets.find(
              (target) => target.classification !== CLASSIFICATIONS.allowedSpacing,
            );
            const resolved = violating ?? classifiedTargets[0];
            if (!traced.undecidable && resolved) {
              property = resolved.target;
              classification = resolved.classification;
            }
          }
        }
        findings.push({
          file: full,
          line,
          property,
          classification,
        });
      }
  }
  return findings;
}

export function runGate({
  sourceRoot = DEFAULT_SOURCE_ROOT,
  familyInventoryPath = DEFAULT_FAMILY_INVENTORY,
  extraStylesheets = [],
} = {}) {
  const dashboardInsightsFamilyId = resolveDashboardInsightsFamilyId(
    familyInventoryPath,
  );
  const stylesheets = [
    ...collectAuthoredModernStylesheets(sourceRoot),
    ...extraStylesheets,
  ];
  const result = analyzeRhythmStylesheets(stylesheets, {
    dashboardInsightsFamilyId,
  });
  const typeScriptCarriers = collectTypeScriptRhythmCarriers(sourceRoot);
  // A DECIDABLE non-spacing target is a violation on exactly the same terms as
  // a stylesheet declaration -- the classifier is shared, so a TS carrier is
  // never judged by a softer rule.
  const typeScriptViolations = typeScriptCarriers.filter(
    (finding) =>
      finding.classification !== CLASSIFICATIONS.allowedSpacing
      && finding.classification !== UNDECIDABLE_TS_CARRIER,
  );
  // An UNDECIDABLE carrier is the honest residue: the read is real, but its
  // target is computed in a helper and no static rule here can name it.
  // Defect 1: an undecidable read is not evidence of innocence, so it BLOCKS
  // rather than merely being disclosed while the run still exits 0. It is
  // still fully enumerated (file, line) rather than silently dropped, which
  // would let this gate claim a CSS-only completeness it has not measured.
  // The set is recomputed from the corpus every run; nothing here is an
  // allowlist or a recorded expected count.
  const typeScriptUndecidable = typeScriptCarriers.filter(
    (finding) => finding.classification === UNDECIDABLE_TS_CARRIER,
  );
  return {
    ...result,
    ok: result.ok && typeScriptViolations.length === 0 && typeScriptUndecidable.length === 0,
    typeScriptCarriers,
    typeScriptViolations,
    typeScriptUndecidable,
  };
}

function findingLine(finding) {
  return `  ${finding.familyId ?? 'UNRESOLVED_FAMILY'} ${reportPath(finding.file)}:${finding.line} ${finding.property} ${finding.classification} ${finding.selector}`;
}

export function formatReport(result) {
  const lines = [];
  if (result.parseErrors.length > 0) {
    lines.push(
      `spacing-rhythm-contract FAIL — ${result.parseErrors.length} stylesheet parse error(s)`,
    );
    for (const error of result.parseErrors) {
      lines.push(`  ${reportPath(error.file)}: ${error.message}`);
    }
  }
  if (result.reads.length === 0) {
    lines.push(
      `spacing-rhythm-contract FAIL — zero ${RHYTHM_CHANNEL} reads in the Modern authored corpus`,
    );
  }
  if (result.violations.length > 0) {
    lines.push(
      `spacing-rhythm-contract FAIL — ${result.violations.length}/${result.reads.length} read(s) escape spacing semantics`,
    );
    for (const [familyId, findings] of Object.entries(result.violationsByFamily)) {
      lines.push(`  family ${familyId}: ${findings.length}`);
    }
    for (const finding of result.violations) lines.push(findingLine(finding));
  }
  if (result.indirectViolations.length > 0) {
    lines.push(
      `spacing-rhythm-contract FAIL — ${result.indirectViolations.length} declaration(s) reach a forbidden capability through a rhythm-carrying channel`,
    );
    for (const finding of result.indirectViolations) {
      lines.push(`${findingLine(finding)} via ${finding.via.join(',')}`);
    }
  }
  if (result.indirectUnclassified.length > 0) {
    lines.push(
      `spacing-rhythm-contract FAIL — ${result.indirectUnclassified.length} declaration(s) reach an unlicensed capability through a rhythm-carrying channel; only DERIVED_CONCENTRIC_GEOMETRY is licensed`,
    );
    for (const finding of result.indirectUnclassified) {
      lines.push(`${findingLine(finding)} via ${finding.via.join(',')}`);
    }
  }
  if (result.typeScriptViolations?.length > 0) {
    lines.push(
      `spacing-rhythm-contract FAIL — ${result.typeScriptViolations.length} TypeScript inline-style carrier(s) reach a non-spacing property, which the CSS walk cannot see`,
    );
    for (const finding of result.typeScriptViolations) {
      lines.push(
        `  ${reportPath(finding.file)}:${finding.line} ${finding.property ?? '<undecidable target>'} ${finding.classification}`,
      );
    }
  }
  if (result.typeScriptUndecidable?.length > 0) {
    lines.push(
      `spacing-rhythm-contract FAIL — ${result.typeScriptUndecidable.length} TypeScript rhythm read(s) have an undecidable target; a channel this gate cannot classify is not evidence of innocence`,
    );
    for (const finding of result.typeScriptUndecidable) {
      lines.push(
        `  ${reportPath(finding.file)}:${finding.line} <undecidable target>`,
      );
    }
  }
  if (result.ok) {
    lines.push(
      `spacing-rhythm-contract OK — ${result.reads.length} authored read(s), all spacing/rhythm; ${result.rhythmCarriers.length} rhythm-carrying channel(s), none reaching a forbidden capability`,
    );
    lines.push(
      `  concentric radius: ${result.concentricAllowances.length} licensed declaration(s) through ${result.concentricChannels.length} private channel(s) [${result.concentricChannels.join(', ')}]`,
    );
  }
  if (result.typeScriptCarriers) {
    // Printed regardless of overall verdict: the TS leg's own honesty check
    // (defect 1) is a separate claim from the CSS leg's, and an operator
    // reading a FAIL report still needs to see that the CSS-only scope claim
    // was actually measured, not merely asserted.
    lines.push(
      `  TypeScript carriers: ${result.typeScriptCarriers.length} var() rhythm read(s) in .ts/.tsx, ${result.typeScriptViolations?.length ?? 0} reaching a decidable non-spacing property — the CSS-only scope is MEASURED, not claimed`,
    );
  }
  return lines.join('\n');
}

async function main() {
  try {
    const result = runGate();
    const report = formatReport(result);
    if (result.ok) console.log(report);
    else console.error(report);
    process.exitCode = result.ok ? 0 : 1;
  } catch (error) {
    console.error(
      `spacing-rhythm-contract FAIL — ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main();
}
