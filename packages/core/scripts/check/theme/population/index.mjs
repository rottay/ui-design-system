/**
 * The POPULATION owner: which families are in the denominator of a causal
 * measurement, which axis each one declares it consumes, and the catalog
 * revision all of that was read at.
 *
 * WHY A DENOMINATOR NEEDS AN OWNER. `roadmap/kit-2026-09.md` section 5 rule 4
 * measures "the percentage of families with a computed-style difference
 * attributable to that axis", and the R4 amendment of `WO-EVI-02` adds the
 * only rule that makes such a percentage comparable: the denominator is the
 * set of families that DECLARE they consume the axis, read from the typed
 * catalog at a RECORDED revision and published with the run. A percentage
 * whose denominator moved between runs is not a measurement, and a denominator
 * that can be shrunk is not a threshold. So no gate in this lane computes its
 * own population; they all read this file, and this file states its revision.
 *
 * WHAT "DECLARES" MEANS HERE, STATED RATHER THAN ASSUMED. The catalog declares
 * a control's group (the axis) and its head channels. It does NOT carry a
 * per-family "I consume shape" flag, and inventing one in a gate would be a
 * second listing of the kind F-04 found five times. What a family DOES declare,
 * in its own authored source, is the painted property it takes a position on:
 * a skin that never writes a `border-radius` has not declared it consumes
 * shape, and counting it in shape's denominator would dilute the axis with
 * families that were never asked. The declaration is therefore read from the
 * family's own Modern skin, per axis, using the painted longhands kit rule 4
 * names verbatim -- the same properties the probe then reads back off the
 * browser. One vocabulary, declared in one place, used by both halves.
 *
 * SCOPE: MODERN ONLY (owner decision 2026-09-05). Classic and Rustic are
 * frozen; counting their paint would put frozen debt in a denominator that
 * exists to be certified against.
 *
 * Usage:
 *   node scripts/check/theme/population/index.mjs          the published report
 *   node scripts/check/theme/population/index.mjs --json    the same, machine-readable
 *   node scripts/check/theme/population/index.mjs --pilot   the WO-EVI-05 pilot population against its pin
 *   node scripts/check/theme/population/index.mjs --exclusions   the reviewed exclusion registry against the tree
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';
import {
  CATALOG_SOURCE,
  readThemeCatalog,
  readThemeCatalogAnnex,
  readThemeCatalogRetired,
} from '../../../libraries/theme-catalog/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = findPackageRoot(HERE);

/**
 * The six NON-CHROMATIC axes of kit section 5 rule 4, and the painted
 * longhands each one owns.
 *
 * Quoted from the rule rather than paraphrased: "shape (`border-radius`),
 * typography (`font-family`, `font-size`, `font-weight`), rhythm (`padding`,
 * `gap`, `margin`), depth (`box-shadow`, `border-width`), states (the
 * `*-hover`, `*-active`, `*-selected` channels computed under `:hover` and
 * `[data-state]`), motion (`transition-duration`, `animation-duration`)".
 *
 * `colour` is deliberately absent. The rule excludes it because a palette move
 * repaints everything and would carry every other axis over its threshold; the
 * two negative controls exist to prove exactly that it does not.
 *
 * `authored` is what a skin writes (shorthands included, because that is how a
 * stylesheet is authored); `computed` is what the browser hands back for the
 * same position. They differ on purpose: `border-radius` is authored once and
 * computed as four corners, `padding` as four sides. A gate that read one list
 * for both halves would either miss declarations or miss differences.
 */
export const AXES = Object.freeze({
  shape: {
    group: 'shape',
    authored: ['border-radius', 'border-start-start-radius', 'border-start-end-radius',
      'border-end-start-radius', 'border-end-end-radius', 'border-top-left-radius',
      'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius'],
    computed: ['border-top-left-radius', 'border-top-right-radius',
      'border-bottom-left-radius', 'border-bottom-right-radius'],
  },
  typography: {
    group: 'typography',
    authored: ['font-family', 'font-size', 'font-weight', 'font'],
    computed: ['font-family', 'font-size', 'font-weight'],
  },
  rhythm: {
    group: 'rhythm',
    authored: ['padding', 'padding-block', 'padding-inline', 'padding-top', 'padding-right',
      'padding-bottom', 'padding-left', 'gap', 'row-gap', 'column-gap',
      'margin', 'margin-block', 'margin-inline', 'margin-top', 'margin-right',
      'margin-bottom', 'margin-left'],
    computed: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left',
      'row-gap', 'column-gap', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
  },
  depth: {
    group: 'depth',
    authored: ['box-shadow', 'border-width', 'border', 'border-block-width', 'border-inline-width',
      'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width'],
    computed: ['box-shadow', 'border-top-width', 'border-right-width',
      'border-bottom-width', 'border-left-width'],
  },
  states: {
    group: 'states',
    authored: [],
    /**
     * The non-chromatic longhands the state channels paint, read ONLY under a
     * stamped state and never at rest. Measured on the WO-FAM-01 skins
     * (2026-09-13): `--ds-state-press-scale` paints `transform`,
     * `--ds-state-disabled-opacity` paints `opacity`, and the focus-ring width
     * and offset paint `outline-*`. Without them the axis read the resting
     * geometry under a state and could not see a state move at all.
     */
    computed: ['transform', 'opacity', 'outline-style', 'outline-width', 'outline-offset'],
    /**
     * States is the one axis whose declaration is not a property name. A
     * family declares it consumes states by having a rule that only applies in
     * a state -- `:hover`, `:active`, `[data-state='selected']` -- or by
     * reading a `*-hover`/`*-active`/`*-selected` channel. The probe reads the
     * same element twice, once in the state, which is why the declaration has
     * to be about the SELECTOR rather than about a longhand.
     */
    stateSelectors: [':hover', ':active', ':focus-visible', '[data-state='],
    stateChannelSuffixes: ['-hover', '-active', '-selected', '-pressed'],
  },
  motion: {
    group: 'motion',
    authored: ['transition-duration', 'transition', 'animation-duration', 'animation'],
    computed: ['transition-duration', 'animation-duration'],
  },
});

export const AXIS_IDS = Object.freeze(Object.keys(AXES));

/** The chromatic group the by-axis probe excludes, named so the exclusion is checkable. */
export const EXCLUDED_GROUP = 'color';

/**
 * The catalog revision every population is read at.
 *
 * It is a CONTENT digest of the authored catalog plus the row ids it declares,
 * not a git revision: a gate that needed git would be unrunnable on a tarball
 * (F-76), and a working tree with an edited catalog is a different population
 * from the commit it sits on however the commit is named. The git revision is
 * reported ALONGSIDE it when a checkout is present, because a reader comparing
 * two runs wants both, but nothing branches on it.
 */
export function catalogRevision(sourcePath = CATALOG_SOURCE) {
  const bytes = readFileSync(sourcePath);
  const rows = readThemeCatalog(sourcePath);
  return {
    source: sourcePath,
    digest: createHash('sha256').update(bytes).digest('hex').slice(0, 16),
    decisionRows: rows.length,
    annexRows: readThemeCatalogAnnex(sourcePath).length,
    retiredRows: readThemeCatalogRetired(sourcePath).length,
    rowIds: rows.map((row) => row.id),
  };
}

/** axis -> the head channels the catalog's rows of that group declare. */
export function axisChannels(sourcePath = CATALOG_SOURCE) {
  const byAxis = new Map(AXIS_IDS.map((axis) => [axis, new Set()]));
  for (const row of readThemeCatalog(sourcePath)) {
    const axis = AXIS_IDS.find((id) => AXES[id].group === row.group);
    if (!axis) continue;
    for (const channel of row.produces?.channels ?? []) byAxis.get(axis).add(channel);
  }
  return byAxis;
}

/** axis -> the catalog row ids of that group, in kit order. */
export function axisControls(sourcePath = CATALOG_SOURCE) {
  const byAxis = new Map(AXIS_IDS.map((axis) => [axis, []]));
  for (const row of readThemeCatalog(sourcePath)) {
    const axis = AXIS_IDS.find((id) => AXES[id].group === row.group);
    if (axis) byAxis.get(axis).push(row.id);
  }
  return byAxis;
}

/** The catalog row ids of one kit group, in kit order; how a pair is cut along a group outside the six axes. */
export function groupControls(group, sourcePath = CATALOG_SOURCE) {
  return readThemeCatalog(sourcePath).filter((row) => row.group === group).map((row) => row.id);
}

const MODERN_SKIN_ROOT = 'src/foundation/tokens/css/runtime/engines/modern/skin';
const AGNOSTIC_SKIN_ROOT = 'src/foundation/tokens/css/presentation/components/skin';

/**
 * Every Modern skin family on disk: the folder under `skin/` IS the family id,
 * which is the same resolution `check/family-cut` uses (`skinBelongsToFamily`).
 * A family with no skin folder paints nothing in Modern and is therefore in no
 * axis denominator -- it has not declared anything to measure.
 */
export function skinFamilies(root = DEFAULT_ROOT) {
  const families = new Map();
  for (const skinRoot of [MODERN_SKIN_ROOT, AGNOSTIC_SKIN_ROOT]) {
    const base = join(root, skinRoot);
    if (!existsSync(base)) continue;
    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const files = collectCss(join(base, entry.name));
      if (files.length === 0) continue;
      const existing = families.get(entry.name) ?? [];
      families.set(entry.name, [...existing, ...files]);
    }
  }
  return families;
}

function collectCss(dir, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) collectCss(full, found);
    else if (entry.name.endsWith('.css')) found.push(full);
  }
  return found;
}

/**
 * Strips comments before any declaration is counted.
 *
 * The exact defect this closes has already happened once in this tree: a `//`
 * comment documenting a DRAIN was read as a consumer and a gate certified the
 * opposite of what it measured (F-23, `buildConsumedClassSet`). A commented-out
 * `border-radius` is not a declaration that a family consumes shape.
 */
export function stripCssComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, ' ');
}

const DECLARATION = /(^|[;{])\s*([-a-zA-Z]+)\s*:/g;

/** The property names a stylesheet actually declares, comments removed. */
export function declaredProperties(css) {
  const declared = new Set();
  for (const match of stripCssComments(css).matchAll(DECLARATION)) declared.add(match[2].toLowerCase());
  return declared;
}

/** The `--ds-*` channels a stylesheet READS through `var()`. */
export function readChannels(css) {
  const read = new Set();
  for (const match of stripCssComments(css).matchAll(/var\(\s*(--[\w-]+)/g)) read.add(match[1]);
  return read;
}

/**
 * The style-rule prelude of `check/theme/axis-difference`: a run of text
 * without braces or `@` before an opening brace. The two instruments share
 * this one vocabulary so a selector the probe can read is a selector the
 * population can attribute a declaration to, and the population drill holds
 * the probe's source to the same literal.
 */
export const SELECTOR_RULE = /(^|\})([^{}@]+)\{/gu;

export const normalizeCssText = (text) => text.replace(/\s+/g, ' ').trim();

/**
 * The rules a stylesheet declares, comments removed, each with its selector,
 * the at-rules enclosing it and its declarations in order.
 *
 * Declarations are read at RULE level rather than off the joined text so a
 * declaration can be told apart by the part it paints: a `border-radius` on
 * the indicator of a radio and one on its root are different declarations,
 * and only the first has a semantic-identity review behind it. The scanner is
 * brace-aware because 929 at-rules enclose rules in the Modern corpus and ten
 * radius declarations sit inside them; a regex anchored on `}` never sees the
 * first rule after an at-rule's own brace. A declaration written directly
 * inside a block at-rule (`@font-face`) is attributed to that at-rule as its
 * selector, so the property set this yields is the one `declaredProperties`
 * yields and no family gains or loses an axis by the change of reader.
 */
export function cssRules(css) {
  const source = stripCssComments(css);
  const rules = [];
  const context = [];
  let prelude = '';
  let quote = null;
  let parentheses = 0;
  const top = () => context[context.length - 1];
  const ruleFor = (frame) => {
    if (frame.rule) return frame.rule;
    frame.rule = { selector: normalizeCssText(frame.prelude), atRules: frame.atRules, declarations: [] };
    rules.push(frame.rule);
    return frame.rule;
  };
  const flush = () => {
    const text = prelude;
    prelude = '';
    const frame = top();
    if (!frame) return;
    const colon = text.indexOf(':');
    if (colon < 0) return;
    const property = text.slice(0, colon).trim().toLowerCase();
    if (!/^[-a-z]+$/u.test(property)) return;
    ruleFor(frame).declarations.push({ property, value: normalizeCssText(text.slice(colon + 1)) });
  };
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quote !== null) {
      prelude += char;
      if (char === quote && source[index - 1] !== '\\') quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      prelude += char;
      continue;
    }
    if (char === '(') parentheses += 1;
    if (char === ')') parentheses = Math.max(0, parentheses - 1);
    if (parentheses > 0) {
      prelude += char;
      continue;
    }
    if (char === '{') {
      const text = prelude.trim();
      prelude = '';
      const atRules = context.filter((frame) => frame.kind === 'at').map((frame) => normalizeCssText(frame.prelude));
      if (text.startsWith('@')) {
        context.push({ kind: 'at', prelude: text, atRules, rule: null });
      } else {
        const frame = { kind: 'rule', prelude: text, atRules, rule: null };
        context.push(frame);
        ruleFor(frame);
      }
      continue;
    }
    if (char === '}') {
      flush();
      context.pop();
      continue;
    }
    if (char === ';') {
      flush();
      continue;
    }
    prelude += char;
  }
  return rules;
}

function relativeTo(root, file) {
  return file.startsWith(root + sep) ? file.slice(root.length + 1) : file;
}

/**
 * The reviewed semantic-identity exclusions: a closed registry of data, one
 * entry per (family, axis, skin file), each naming the exact declarations the
 * core review read. `admitted` pins which (family, axis) pairs the registry
 * may carry at all; a new pair returns to review before it can act.
 */
export const EXCLUSIONS_PATH = join(HERE, 'exclusions/index.json');
export const EXCLUSION_PATHS = Object.freeze(['byProperty']);

export function readExclusions(path = EXCLUSIONS_PATH) {
  const registry = JSON.parse(readFileSync(path, 'utf8'));
  return { ...registry, admitted: registry.admitted ?? [], entries: registry.entries ?? [] };
}

/** A content digest of the registry, so a publication can say which exclusion revision it was measured under. */
export function exclusionsRevision(path = EXCLUSIONS_PATH) {
  return createHash('sha256').update(readFileSync(path)).digest('hex').slice(0, 16);
}

const declarationKey = (declaration) =>
  `${normalizeCssText(declaration.selector)} { ${declaration.property.toLowerCase()}: ${normalizeCssText(declaration.value)} }`;

/**
 * The exclusion entry that names this exact declaration for this family, axis
 * and file, or null. Verbatim means selector, property AND value: a value that
 * gains a channel or changes token stops matching, and so does the same
 * selector authored again with another radius, because that second
 * declaration is a declaration of its own and nothing in the registry names it.
 */
function matchingExclusion(registry, family, axis, file, selector, declaration) {
  const key = declarationKey({ selector, ...declaration });
  for (const entry of registry.entries) {
    if (entry.family !== family || entry.axis !== axis || entry.skin !== file) continue;
    if ((entry.path ?? 'byProperty') !== 'byProperty') continue;
    if ((entry.declarations ?? []).some((reviewed) => declarationKey(reviewed) === key)) return entry;
  }
  return null;
}

/**
 * family -> the axes it DECLARES it consumes, with the evidence for each, and
 * the axes a reviewed exclusion withdrew it from, with the reason.
 *
 * The evidence is kept rather than collapsed to a boolean because a denominator
 * without evidence cannot be argued with, and this one will be argued with:
 * every percentage this lane publishes is a fraction of it.
 *
 * An exclusion acts on the byProperty path alone and only on a declaration
 * that matches an entry verbatim. A family is NOT APPLICABLE on an axis when
 * every authored declaration of that axis is excluded and no head channel of
 * the axis is read; a family that still authors the axis elsewhere keeps its
 * membership and the entry is reported as ineffective, never as a withdrawal.
 */
export function familyAxisDeclarations(root = DEFAULT_ROOT, sourcePath = CATALOG_SOURCE, exclusionsPath = EXCLUSIONS_PATH) {
  const channelsByAxis = axisChannels(sourcePath);
  const registry = readExclusions(exclusionsPath);
  const declarations = new Map();
  for (const [family, files] of skinFamilies(root)) {
    const sources = files.map((file) => ({ file: relativeTo(root, file), css: readFileSync(file, 'utf8') }));
    const css = sources.map((source) => source.css).join('\n');
    const rulesByFile = sources.map((source) => ({ file: source.file, rules: cssRules(source.css) }));
    const channels = readChannels(css);
    const stripped = stripCssComments(css);
    const axes = {};
    const notApplicable = {};
    for (const axis of AXIS_IDS) {
      const spec = AXES[axis];
      const authored = new Set(spec.authored);
      const declaredNames = new Set();
      const excluded = [];
      for (const { file, rules } of rulesByFile) {
        for (const rule of rules) {
          for (const declaration of rule.declarations) {
            if (!authored.has(declaration.property)) continue;
            const entry = matchingExclusion(registry, family, axis, file, rule.selector, declaration);
            if (entry) {
              excluded.push({ file, selector: rule.selector, property: declaration.property, value: declaration.value, review: entry.review });
            } else {
              declaredNames.add(declaration.property);
            }
          }
        }
      }
      const byProperty = spec.authored.filter((name) => declaredNames.has(name));
      const byHeadChannel = [...channelsByAxis.get(axis)].filter((channel) => channels.has(channel));
      const bySelector = axis === 'states'
        ? spec.stateSelectors.filter((needle) => stripped.includes(needle))
        : [];
      const byStateChannel = axis === 'states'
        ? [...channels].filter((channel) => spec.stateChannelSuffixes.some((suffix) => channel.endsWith(suffix)))
        : [];
      const declared = byProperty.length > 0 || byHeadChannel.length > 0
        || bySelector.length > 0 || byStateChannel.length > 0;
      if (declared) {
        axes[axis] = {
          properties: byProperty,
          headChannels: byHeadChannel,
          stateSelectors: bySelector,
          stateChannels: byStateChannel.slice(0, 8),
          ...(excluded.length > 0 ? { excludedDeclarations: excluded, exclusionEffective: false } : {}),
        };
      } else if (excluded.length > 0) {
        const entry = registry.entries.find((candidate) => candidate.family === family && candidate.axis === axis);
        notApplicable[axis] = {
          reason: entry.reason,
          review: entry.review,
          excludedDeclarations: excluded,
        };
      }
    }
    declarations.set(family, { family, files: sources.map((source) => source.file), axes, notApplicable });
  }
  return declarations;
}

/** axis -> the families in its denominator, sorted. The published (applicable) population. */
export function axisPopulations(root = DEFAULT_ROOT, sourcePath = CATALOG_SOURCE, exclusionsPath = EXCLUSIONS_PATH) {
  const declarations = familyAxisDeclarations(root, sourcePath, exclusionsPath);
  const populations = new Map(AXIS_IDS.map((axis) => [axis, []]));
  for (const [family, record] of declarations) {
    for (const axis of Object.keys(record.axes)) populations.get(axis).push(family);
  }
  for (const list of populations.values()) list.sort();
  return populations;
}

/** axis -> the families a reviewed exclusion withdrew from it, each with its reason; disjoint from `axisPopulations` by construction. */
export function axisNotApplicable(root = DEFAULT_ROOT, sourcePath = CATALOG_SOURCE, exclusionsPath = EXCLUSIONS_PATH) {
  const declarations = familyAxisDeclarations(root, sourcePath, exclusionsPath);
  const byAxis = new Map(AXIS_IDS.map((axis) => [axis, []]));
  for (const [family, record] of declarations) {
    for (const [axis, entry] of Object.entries(record.notApplicable)) {
      byAxis.get(axis).push({ family, reason: entry.reason, review: entry.review, excludedDeclarations: entry.excludedDeclarations });
    }
  }
  for (const list of byAxis.values()) list.sort((a, b) => a.family.localeCompare(b.family));
  return byAxis;
}

/**
 * The registry against the tree. Fails closed on every drift path the review
 * named: an unadmitted pair, a duplicate, a family or file the registry does
 * not own, a selector absent from the comment-stripped skin (a selector that
 * survives only in a comment is the F-23 class), and a reviewed declaration
 * the skin no longer authors verbatim -- that family has re-entered by itself
 * and the entry must return to review rather than sit stale.
 */
export function checkExclusionRegistry(root = DEFAULT_ROOT, exclusionsPath = EXCLUSIONS_PATH) {
  const failures = [];
  let registry;
  try {
    registry = readExclusions(exclusionsPath);
  } catch (error) {
    return { registry: null, failures: [`exclusion registry unreadable: ${error instanceof Error ? error.message : String(error)}`] };
  }
  const families = skinFamilies(root);
  const admitted = new Set(registry.admitted.map((pair) => `${pair.family}/${pair.axis}`));
  const seenEntries = new Set();
  registry.entries.forEach((entry, index) => {
    const label = `entry ${index} (${entry.family ?? '?'}/${entry.axis ?? '?'})`;
    const pair = `${entry.family}/${entry.axis}`;
    if (!admitted.has(pair)) failures.push(`${label}: ${pair} is not an admitted exclusion; a new pair returns to core review before it can act`);
    if (!AXIS_IDS.includes(entry.axis)) failures.push(`${label}: axis ${entry.axis} is not an axis of kit rule 4`);
    if (!EXCLUSION_PATHS.includes(entry.path)) failures.push(`${label}: path ${entry.path} is not byProperty; a head-channel read is never excluded`);
    for (const field of ['reason', 'review']) {
      if (typeof entry[field] !== 'string' || entry[field].trim().length === 0) failures.push(`${label}: ${field} is empty`);
    }
    const entryKey = `${entry.family}/${entry.axis}/${entry.skin}`;
    if (seenEntries.has(entryKey)) failures.push(`${label}: duplicate of an earlier entry for ${entryKey}`);
    seenEntries.add(entryKey);
    const files = families.get(entry.family);
    if (!files) {
      failures.push(`${label}: ${entry.family} is not a skin family`);
      return;
    }
    const owned = files.map((file) => relativeTo(root, file));
    if (!owned.includes(entry.skin)) {
      failures.push(`${label}: ${entry.skin} is not a skin file of ${entry.family} (${owned.join(', ')})`);
      return;
    }
    const rules = cssRules(readFileSync(join(root, entry.skin), 'utf8'));
    const selectors = new Set(rules.map((rule) => rule.selector));
    const authoredKeys = new Set();
    for (const rule of rules) {
      for (const declaration of rule.declarations) authoredKeys.add(declarationKey({ selector: rule.selector, ...declaration }));
    }
    const declarations = entry.declarations ?? [];
    if (declarations.length === 0) failures.push(`${label}: names no declaration`);
    const seenDeclarations = new Set();
    for (const reviewed of declarations) {
      const key = declarationKey(reviewed);
      if (seenDeclarations.has(key)) failures.push(`${label}: declaration listed twice: ${key}`);
      seenDeclarations.add(key);
      if (!AXES[entry.axis]?.authored.includes(reviewed.property.toLowerCase())) {
        failures.push(`${label}: ${reviewed.property} is not an authored longhand of ${entry.axis}`);
      }
      if (!selectors.has(normalizeCssText(reviewed.selector))) {
        failures.push(`${label}: selector not authored in ${entry.skin} (comments removed): ${reviewed.selector}`);
        continue;
      }
      if (!authoredKeys.has(key)) {
        failures.push(`${label}: STALE — ${entry.skin} no longer authors ${key} verbatim; the family has re-entered ${entry.axis} and the entry must be re-reviewed or removed`);
      }
    }
  });
  return { registry, failures };
}

/** The whole published population, in one object, revision and exclusions included. */
export function populationReport(root = DEFAULT_ROOT, sourcePath = CATALOG_SOURCE, exclusionsPath = EXCLUSIONS_PATH) {
  const revision = catalogRevision(sourcePath);
  const declarations = familyAxisDeclarations(root, sourcePath, exclusionsPath);
  const populations = new Map(AXIS_IDS.map((axis) => [axis, []]));
  const notApplicable = new Map(AXIS_IDS.map((axis) => [axis, []]));
  const ineffective = [];
  for (const [family, record] of declarations) {
    for (const [axis, evidence] of Object.entries(record.axes)) {
      populations.get(axis).push(family);
      if (evidence.exclusionEffective === false) {
        ineffective.push({ family, axis, stillDeclares: evidence.properties, headChannels: evidence.headChannels });
      }
    }
    for (const [axis, entry] of Object.entries(record.notApplicable)) {
      notApplicable.get(axis).push({ family, reason: entry.reason, review: entry.review });
    }
  }
  for (const list of populations.values()) list.sort();
  for (const list of notApplicable.values()) list.sort((a, b) => a.family.localeCompare(b.family));
  const controls = axisControls(sourcePath);
  const registry = readExclusions(exclusionsPath);
  return {
    revision,
    excludedGroup: EXCLUDED_GROUP,
    skinFamilies: declarations.size,
    exclusions: {
      source: relativeTo(root, exclusionsPath),
      revision: exclusionsRevision(exclusionsPath),
      entries: registry.entries.length,
      admitted: registry.admitted,
      ineffective,
    },
    axes: AXIS_IDS.map((axis) => ({
      axis,
      group: AXES[axis].group,
      controls: controls.get(axis),
      denominator: populations.get(axis).length,
      families: populations.get(axis),
      notApplicableCount: notApplicable.get(axis).length,
      notApplicable: notApplicable.get(axis),
    })),
  };
}

/** One line the runner prints so every run states the revision it measured at, with the N/A beside every denominator. */
export function populationLine(root = DEFAULT_ROOT, sourcePath = CATALOG_SOURCE, exclusionsPath = EXCLUSIONS_PATH) {
  const report = populationReport(root, sourcePath, exclusionsPath);
  const axes = report.axes.map((entry) => `${entry.axis} ${entry.denominator} (${entry.notApplicableCount} N/A)`).join(', ');
  return `population: theme catalog ${report.revision.digest} (${report.revision.decisionRows} decisions), `
    + `exclusions ${report.exclusions.revision} (${report.exclusions.entries} reviewed), `
    + `${report.skinFamilies} modern skin families; per-axis denominators — ${axes}`;
}

/**
 * The PILOT population of `WO-EVI-05`: the families of one family cut, the axes
 * each declares, the axes a reviewed exclusion withdrew, and the catalog and
 * exclusion revisions all of it was read at.
 *
 * Membership is read from the family-cut roster (`cut` names the owning work
 * order), and each family's axes from the same skin declarations every fleet
 * denominator uses, so the pilot is a subset of the fleet population and never
 * a second listing of it. Its denominators are the pilot's alone: a fleet claim
 * may not cite them (`WO-EVI-05`, Do NOT). `notApplicable` is published beside
 * every denominator so a pilot reading can never be read as 4/4 without it.
 */
export const PILOT_CUT = 'WO-FAM-01';
export const FAMILY_CUT_ROSTER = 'scripts/check/family-cut/baseline/index.json';
export const PILOT_PIN_PATH = join(HERE, 'pilot/index.json');

export function pilotPopulation(root = DEFAULT_ROOT, sourcePath = CATALOG_SOURCE, cut = PILOT_CUT, exclusionsPath = EXCLUSIONS_PATH) {
  const roster = JSON.parse(readFileSync(join(root, FAMILY_CUT_ROSTER), 'utf8')).families ?? {};
  const members = Object.keys(roster).filter((family) => roster[family].cut === cut).sort();
  const declarations = familyAxisDeclarations(root, sourcePath, exclusionsPath);
  const revision = catalogRevision(sourcePath);
  const families = Object.fromEntries(members.map((family) => [
    family,
    AXIS_IDS.filter((axis) => Object.hasOwn(declarations.get(family)?.axes ?? {}, axis)),
  ]));
  const notApplicable = {};
  for (const family of members) {
    const withdrawn = declarations.get(family)?.notApplicable ?? {};
    if (Object.keys(withdrawn).length === 0) continue;
    notApplicable[family] = Object.fromEntries(
      AXIS_IDS.filter((axis) => Object.hasOwn(withdrawn, axis))
        .map((axis) => [axis, { reason: withdrawn[axis].reason, review: withdrawn[axis].review }]),
    );
  }
  return {
    scope: 'pilot',
    cut,
    catalogRevision: revision.digest,
    decisionRows: revision.decisionRows,
    exclusionsRevision: exclusionsRevision(exclusionsPath),
    families,
    notApplicable,
    withoutSkin: members.filter((family) => !declarations.has(family)),
    denominators: Object.fromEntries(
      AXIS_IDS.map((axis) => [axis, members.filter((family) => families[family].includes(axis)).length]),
    ),
    notApplicableCounts: Object.fromEntries(
      AXIS_IDS.map((axis) => [axis, members.filter((family) => Object.hasOwn(notApplicable[family] ?? {}, axis)).length]),
    ),
  };
}

/** Pilot readings with the N/A of their axis beside `moved/denominator`; `denominator` stays the applicable count. */
export function withNotApplicable(readings, pilot) {
  return readings.map((reading) => ({
    ...reading,
    notApplicable: pilot.notApplicableCounts?.[reading.axis] ?? 0,
    declared: reading.denominator + (pilot.notApplicableCounts?.[reading.axis] ?? 0),
  }));
}

/**
 * The published pilot population against the tree. Families, axes,
 * denominators and the not-applicable set must match exactly; the revisions
 * are compared only when asked, because the pin names the revisions the last
 * pilot RUN was measured at and a catalog edit elsewhere makes that run stale
 * rather than this structure wrong.
 */
export function checkPilotPopulation(
  root = DEFAULT_ROOT,
  sourcePath = CATALOG_SOURCE,
  pinPath = PILOT_PIN_PATH,
  { revision = false, exclusionsPath = EXCLUSIONS_PATH } = {},
) {
  const live = pilotPopulation(root, sourcePath, PILOT_CUT, exclusionsPath);
  const pin = JSON.parse(readFileSync(pinPath, 'utf8'));
  const failures = checkExclusionRegistry(root, exclusionsPath).failures.map((line) => `exclusion registry: ${line}`);
  if (Object.keys(live.families).length === 0) {
    failures.push(`${live.cut}: the family-cut roster names no family, so the pilot population is empty`);
  }
  for (const family of live.withoutSkin) {
    failures.push(`${family}: rostered in ${live.cut} with no Modern skin, so it declares no axis to measure`);
  }
  if (pin.cut !== live.cut) failures.push(`pinned cut ${pin.cut} != ${live.cut}`);
  const names = [...new Set([...Object.keys(pin.families ?? {}), ...Object.keys(live.families)])].sort();
  for (const family of names) {
    const pinned = pin.families?.[family];
    const measured = live.families[family];
    if (pinned === undefined) failures.push(`${family}: in the ${live.cut} roster and not in the published pilot population`);
    else if (measured === undefined) failures.push(`${family}: published in the pilot population and no longer in the ${live.cut} roster`);
    else if (pinned.join(',') !== measured.join(',')) {
      failures.push(`${family}: published axes [${pinned.join(', ')}] != declared [${measured.join(', ')}]`);
    }
  }
  const pinnedNotApplicable = pin.notApplicable ?? {};
  for (const family of names) {
    for (const axis of AXIS_IDS) {
      const pinnedEntry = pinnedNotApplicable[family]?.[axis];
      const liveEntry = live.notApplicable[family]?.[axis];
      if (pinnedEntry && (pin.families?.[family] ?? []).includes(axis)) {
        failures.push(`${family}/${axis}: published BOTH applicable and not applicable; the two sets must be disjoint`);
      }
      if (pinnedEntry && !liveEntry) {
        failures.push(
          `${family}/${axis}: published NOT APPLICABLE and now declared — a configurable corner (or a changed reviewed `
          + 'declaration) restored applicability; re-publish the pilot population and re-review the exclusion',
        );
      } else if (!pinnedEntry && liveEntry) {
        failures.push(`${family}/${axis}: withdrawn by a reviewed exclusion (${liveEntry.review}) and the published pilot population still counts it`);
      } else if (pinnedEntry && liveEntry
        && (pinnedEntry.reason !== liveEntry.reason || pinnedEntry.review !== liveEntry.review)) {
        failures.push(`${family}/${axis}: the published not-applicable reason or review differs from the registry's`);
      }
    }
  }
  for (const axis of AXIS_IDS) {
    if (pin.denominators?.[axis] !== live.denominators[axis]) {
      failures.push(`${axis}: published pilot denominator ${pin.denominators?.[axis]} != ${live.denominators[axis]}`);
    }
    if ((pin.notApplicableCounts?.[axis] ?? 0) !== live.notApplicableCounts[axis]) {
      failures.push(`${axis}: published pilot not-applicable count ${pin.notApplicableCounts?.[axis] ?? 0} != ${live.notApplicableCounts[axis]}`);
    }
  }
  if (revision && pin.catalogRevision !== live.catalogRevision) {
    failures.push(
      `catalog revision ${live.catalogRevision} != published ${pin.catalogRevision}: the pilot run and its `
      + 'population must be re-published together at the revision they were measured at',
    );
  }
  if (revision && pin.exclusionsRevision !== live.exclusionsRevision) {
    failures.push(
      `exclusions revision ${live.exclusionsRevision} != published ${pin.exclusionsRevision}: the pilot run and its `
      + 'population must be re-published together under the exclusion review they were measured at',
    );
  }
  return { live, pin, failures };
}

export const FLOOR_PATH = join(HERE, 'baseline/index.json');

/**
 * The denominator floor, and the ONLY direction it may move.
 *
 * Every other baseline in this tree is decrease-only, because every other one
 * pins debt. This one pins a POPULATION, and the amendment it implements says
 * the opposite thing: "a denominator may never be shrunk to reach a
 * threshold" (`WO-EVI-02`, R4 amendment 3). A shrinking population makes every
 * percentage in this lane easier to pass, so shrinkage is the regression and
 * growth is the only free direction. Growth is still REPORTED, with the
 * instruction to raise the pin in the same commit, so the floor follows the
 * tree up and a silent drift in either direction is impossible. A reviewed
 * exclusion is the one lawful subtraction, and it is pinned beside the
 * denominator it subtracts from so the two can never drift apart silently.
 */
export function checkPopulationFloor(root = DEFAULT_ROOT, sourcePath = CATALOG_SOURCE, floorPath = FLOOR_PATH, exclusionsPath = EXCLUSIONS_PATH) {
  const report = populationReport(root, sourcePath, exclusionsPath);
  const floor = JSON.parse(readFileSync(floorPath, 'utf8'));
  const failures = checkExclusionRegistry(root, exclusionsPath).failures.map((line) => `exclusion registry: ${line}`);
  const pinned = floor.axes ?? {};
  for (const axis of AXIS_IDS) {
    if (!Object.hasOwn(pinned, axis)) {
      failures.push(`${axis}: no pinned denominator floor — an unpinned axis is an unbounded denominator`);
    }
  }
  for (const axis of Object.keys(pinned)) {
    if (!AXIS_IDS.includes(axis)) {
      failures.push(`${axis}: pinned floor names no axis of kit rule 4`);
    }
  }
  for (const entry of report.axes) {
    const min = pinned[entry.axis];
    if (typeof min !== 'number') continue;
    if (entry.denominator < min) {
      failures.push(
        `${entry.axis}: denominator ${entry.denominator} is BELOW its floor ${min} — a denominator may never be `
        + 'shrunk to reach a threshold; restore the families or have the owner lower the floor with a reason',
      );
    } else if (entry.denominator > min) {
      failures.push(
        `${entry.axis}: denominator ${entry.denominator} is ABOVE its pin ${min} — raise the pin in this commit so `
        + 'the published population and the floor keep naming the same set',
      );
    }
    const pinnedNotApplicable = floor.notApplicable?.[entry.axis] ?? 0;
    if (entry.notApplicableCount !== pinnedNotApplicable) {
      failures.push(
        `${entry.axis}: ${entry.notApplicableCount} famil(ies) not applicable != pinned ${pinnedNotApplicable} — a reviewed `
        + 'exclusion is published beside the denominator it subtracts from; re-pin both in the same commit with the review',
      );
    }
  }
  if (typeof floor.exclusionsRevision === 'string' && floor.exclusionsRevision !== report.exclusions.revision) {
    failures.push(
      `exclusions revision ${report.exclusions.revision} != pinned ${floor.exclusionsRevision} — the registry moved; `
      + 're-pin it here in the same commit with the review that changed it',
    );
  }
  if (typeof floor.skinFamilies === 'number' && report.skinFamilies !== floor.skinFamilies) {
    failures.push(
      `skin families ${report.skinFamilies} != pinned ${floor.skinFamilies} — the corpus every axis denominator `
      + 'is drawn from moved; re-pin it in the same commit',
    );
  }
  if (report.skinFamilies === 0) {
    failures.push('zero skin families found — a vacuous population is not a population');
  }
  return { report, failures };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain && process.argv.includes('--pilot')) {
  const { live, failures } = checkPilotPopulation(DEFAULT_ROOT, CATALOG_SOURCE, PILOT_PIN_PATH, {
    revision: process.argv.includes('--check'),
  });
  if (process.argv.includes('--json')) console.log(JSON.stringify(live, null, 2));
  console.log(`pilot population (${live.cut}) — catalog ${live.catalogRevision}, exclusions ${live.exclusionsRevision}, `
    + `${Object.keys(live.families).length} families; pilot denominators — `
    + `${AXIS_IDS.map((axis) => `${axis} ${live.denominators[axis]} (${live.notApplicableCounts[axis]} N/A)`).join(', ')}`);
  for (const [family, axes] of Object.entries(live.families)) {
    const withdrawn = Object.keys(live.notApplicable[family] ?? {});
    console.log(`  ${family.padEnd(11)} ${axes.join(', ')}${withdrawn.length > 0 ? `; N/A: ${withdrawn.join(', ')}` : ''}`);
  }
  for (const [family, axes] of Object.entries(live.notApplicable)) {
    for (const [axis, entry] of Object.entries(axes)) console.log(`  N/A ${family}/${axis} — ${entry.review}: ${entry.reason}`);
  }
  if (failures.length > 0) {
    for (const failure of failures) console.error(`theme-population pilot FAIL — ${failure}`);
    process.exit(1);
  }
} else if (isMain && process.argv.includes('--exclusions')) {
  const { registry, failures } = checkExclusionRegistry();
  const report = populationReport();
  console.log(`exclusion registry ${report.exclusions.revision} — ${registry?.entries.length ?? 0} entr(ies), `
    + `admitted: ${(registry?.admitted ?? []).map((pair) => `${pair.family}/${pair.axis}`).join(', ') || '(none)'}`);
  for (const entry of report.axes) {
    for (const withdrawn of entry.notApplicable) console.log(`  N/A ${withdrawn.family}/${entry.axis} — ${withdrawn.review}`);
  }
  for (const entry of report.exclusions.ineffective) {
    console.log(`  INEFFECTIVE ${entry.family}/${entry.axis} — still declares ${entry.stillDeclares.join(', ') || '(head channel)'}`);
  }
  if (failures.length > 0) {
    for (const failure of failures) console.error(`theme-population exclusions FAIL — ${failure}`);
    process.exit(1);
  }
  console.log('theme-population exclusions OK');
} else if (isMain && process.argv.includes('--check')) {
  const { report, failures } = checkPopulationFloor();
  console.log(populationLine());
  if (failures.length > 0) {
    for (const failure of failures) console.error(`theme-population FAIL — ${failure}`);
    process.exit(1);
  }
  console.log(`theme-population OK — ${report.axes.length} axes pinned at catalog ${report.revision.digest}, `
    + `exclusions ${report.exclusions.revision}`);
} else if (isMain) {
  const report = populationReport();
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`theme population — catalog ${report.revision.digest} at ${report.revision.source}`);
    console.log(`  ${report.revision.decisionRows} decisions, ${report.revision.annexRows} annex, `
      + `${report.revision.retiredRows} retired; excluded group: ${report.excludedGroup}`);
    console.log(`  ${report.skinFamilies} modern skin families in the corpus; exclusions ${report.exclusions.revision} `
      + `(${report.exclusions.entries} reviewed)`);
    for (const entry of report.axes) {
      console.log(`  ${entry.axis.padEnd(11)} denominator ${String(entry.denominator).padStart(4)} `
        + `(${entry.notApplicableCount} N/A) — controls: ${entry.controls.join(', ') || '(none)'}`);
      for (const withdrawn of entry.notApplicable) console.log(`${' '.repeat(14)}N/A ${withdrawn.family} — ${withdrawn.review}`);
    }
  }
}
