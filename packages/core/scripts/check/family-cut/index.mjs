#!/usr/bin/env node
/**
 * family-cut — the per-family gate of the vertical cut.
 *
 * WHAT A VERTICAL CUT IS. `roadmap/family-cut-template.md` is the written
 * template: one work order owns a family's deriver, its Modern skin, its
 * shared runtime and its tests, so no family is written twice. This file is
 * the executable half of that template. The template states the contract in
 * words; this states the same contract as a command that can fail.
 *
 * WHY IT IS NOT ONE NUMBER. A family cut has arms that are already true of a
 * calibrated family and arms that are today's measured debt. Collapsing both
 * into one verdict would either paint the debt green or make the gate
 * unrunnable on the day it lands. So every arm is declared as exactly one of:
 *
 *   BLOCKING  an invariant the calibration family already satisfies. It is 0,
 *             it stays 0, and it fails the moment a family breaks it.
 *   RATCHET   a measured debt, pinned in `baseline/index.json`. Growth is red;
 *             shrinkage is red with an instruction to lower the pin, which is
 *             how the pin follows the tree DOWN and never up.
 *   OWED      an arm this gate cannot yet measure because the kernel it would
 *             measure against does not exist. Each one names its owning work
 *             order and is PRINTED ON EVERY RUN. There is no silent third
 *             state: an arm nobody can measure is not an arm that passes.
 *
 * ONE MEASUREMENT, NEVER TWO. The read-without-producer arm imports
 * `check/engine/read-without-producer` and `libraries/tokens/producers`; the
 * skin corpus comes from `libraries/engine/skins/files`; the fan-out comes
 * from `libraries/theme-catalog`. A second measurement of any of them would be
 * a second truth about the same tree.
 *
 * SCOPE: MODERN ONLY. Classic and Rustic are frozen by owner decision
 * (2026-09-05); no work order adds content to them, so counting their paint
 * would put frozen debt in a ratchet that exists to fall.
 *
 * Usage:
 *   node scripts/check/family-cut/index.mjs                  every roster family
 *   node scripts/check/family-cut/index.mjs --family=button   one family
 *   node scripts/check/family-cut/index.mjs --json            the measurement
 *
 * Its teeth are proven in `index.test.mjs`, which plants real defects into a
 * sandbox copy of the family -- an inline `style={{ color }}`, a `--ds-button-x`
 * read nobody writes, a second class vocabulary, an `--ant-*` read -- and
 * asserts each one turns this command red. There is no `--drill` flag: a switch
 * that mutates the measurement is a second way to be told the tree is broken,
 * and the first one is the tree.
 *
 * Exit 0 = every blocking arm holds and every ratchet is exactly its pin.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, join, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import ts from 'typescript';

import { classifyReadWithoutProducer } from '../engine/read-without-producer/index.mjs';
import { collectSkinFiles } from '../../libraries/engine/skins/files/index.mjs';
import { packageRoot as findPackageRoot } from '../../libraries/repo-root/index.mjs';
import { readThemeCatalog } from '../../libraries/theme-catalog/index.mjs';
import { collectChannelProducers } from '../../libraries/tokens/producers/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = findPackageRoot(HERE);
export const BASELINE_PATH = join(HERE, 'baseline/index.json');

const COMPONENT_ROOT = 'src/components';
const MODERN_SKIN_SEGMENT = `${sep}engines${sep}modern${sep}`;

/** Class prefixes any owner in this package has ever emitted. */
const CLASS_PREFIXES = Object.freeze(['ds', 'rottay', 'rt', 'ant']);

/**
 * The states the anatomy kernel serializes. A family that calls
 * `partAttributes` can stamp any of them, so a skin rule on one of them is
 * never dead paint even when this file cannot see a literal for it.
 */
const KERNEL_STATES = Object.freeze([
  'disabled',
  'hovered',
  'pressed',
  'focused',
  'focus-visible',
]);

/** The pseudo-class each kernel state replaces, for the pairing check. */
const PSEUDO_STATE_TWIN = Object.freeze({
  ':hover': 'hovered',
  ':active': 'pressed',
  ':focus-visible': 'focus-visible',
  ':disabled': 'disabled',
});

/**
 * Arms the template requires and this gate cannot yet measure, each with the
 * work order that makes it measurable. Printed on every run.
 */
export const OWED_ARMS = Object.freeze([
  {
    id: 'adapt-slot',
    owner: 'WO-INV-07',
    reason:
      'the typed `adapt` contract and the `data-posture` stamp do not exist yet; WO-INV-07 adds the contract, the reference implementation and this arm',
  },
  {
    id: 'anatomy-derived-skeleton',
    owner: 'WO-FAM-14',
    reason:
      'the shared skeleton renderer that builds a loading skeleton FROM the family `data-part` anatomy does not exist yet; WO-FAM-14 creates it, retires the nine hand-made compounds and flips this arm to blocking as its own close act. Measuring it now would fail every family for a kernel nobody has written',
  },
  {
    id: 'layout-animation-kernel',
    owner: 'WO-INV-08',
    reason:
      'presence/enter animation must route through `runtime/motion/layout`, which WO-INV-08 creates; measuring adoption of a kernel that does not exist would fail every family for someone else\'s work',
  },
  {
    id: 'axe-per-family',
    owner: 'WO-GAT-04',
    reason:
      'axe needs a rendered DOM. WO-GAT-04 owns the axe run and its decrease-only baseline over the per-state galleries; a static gate cannot run it. What this gate CAN prove, and does, is the blocking arm `a11yProbes`: the family owns at least one executable accessibility assertion of its own',
  },
]);

const stripCssComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '');

const toPosix = (value) => value.split(sep).join('/');

// ---------------------------------------------------------------------------
// Resolution: family name -> the files that ARE the family
// ---------------------------------------------------------------------------

/**
 * A skin belongs to a family when its owning directory IS the family or is a
 * compound of it (`button` owns `button-group`, `button-icon`; it does NOT own
 * `export-button`, which is a different family that merely ends in the word).
 */
function skinBelongsToFamily(file, family) {
  const owner = basename(dirname(file));
  return owner === family || owner.startsWith(`${family}-`);
}

function walkFiles(dir, predicate, found = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, predicate, found);
    else if (entry.isFile() && predicate(full)) found.push(full);
  }
  return found;
}

/**
 * A directory named after the family is only the family's OWNER when it is not
 * itself a part of some other owner: `feedback/skeleton/compound/button` is the
 * skeleton's button-shaped compound, not the button family. Resolution is
 * exact-or-refuse; a family that resolves to two owners is an ambiguity the
 * gate reports rather than one it silently picks a side of.
 */
const NESTED_OWNER_SEGMENT = /\/(?:compound|engines|contracts|tests|runtime|foundation|composition|presentation)\//u;

function findComponentDirs(root, family) {
  const dirs = [];
  const componentRoot = join(root, COMPONENT_ROOT);
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const full = join(dir, entry.name);
      const rel = `/${toPosix(relative(componentRoot, full))}/`;
      if (entry.name === family && !NESTED_OWNER_SEGMENT.test(rel)) dirs.push(full);
      else walk(full);
    }
  };
  walk(componentRoot);
  return dirs;
}

/**
 * The authored TSX/TS of a family: its engine-agnostic owners and its MODERN
 * engine. Classic and Rustic are frozen and never enter a Modern measurement;
 * tests, stories and fixtures are evidence, not the family's source.
 */
function isFamilySource(file) {
  const posix = toPosix(file);
  if (/\/(?:tests|__snapshots__|fixtures)\//u.test(posix)) return false;
  if (/\.stories\.tsx?$/u.test(posix)) return false;
  if (/\.test\.tsx?$/u.test(posix)) return false;
  if (/\/engines\/(?:classic|rustic)\//u.test(posix)) return false;
  return /\.tsx?$/u.test(posix);
}

export function resolveFamily(family, root = DEFAULT_ROOT) {
  const skins = collectSkinFiles(root)
    .filter((file) => file.includes(MODERN_SKIN_SEGMENT) || toPosix(file).includes('/presentation/components/skin/'))
    .filter((file) => skinBelongsToFamily(file, family))
    .sort();
  const componentDirs = findComponentDirs(root, family);
  const sources = componentDirs
    .flatMap((dir) => walkFiles(dir, isFamilySource))
    .sort();
  const recipe = join(
    root,
    'src/infrastructure/runtime/foundation/recipes/contracts/families',
    family,
    'index.ts',
  );
  const a11yProbes = componentDirs
    .flatMap((dir) => walkFiles(dir, (file) => /\.test\.tsx?$/u.test(file)))
    .filter((file) => {
      const text = readFileSync(file, 'utf8');
      return /\baxe\b/u.test(text)
        || /toHaveAccessibleName|toHaveAccessibleDescription|getByRole|toHaveFocus|aria-/u.test(text);
    })
    .sort();
  return {
    family,
    root,
    skins,
    componentDirs,
    sources,
    recipe: existsSync(recipe) ? recipe : undefined,
    a11yProbes,
  };
}

// ---------------------------------------------------------------------------
// The TSX side of the contract
// ---------------------------------------------------------------------------

/** Every string literal reachable inside an expression, however nested. */
function literalsIn(node) {
  const out = [];
  const visit = (current) => {
    if (!current) return;
    if (ts.isStringLiteral(current) || ts.isNoSubstitutionTemplateLiteral(current)) {
      out.push(current.text);
      return;
    }
    ts.forEachChild(current, visit);
  };
  visit(node);
  return out;
}

function attributeName(attribute) {
  return ts.isJsxAttribute(attribute) && attribute.name ? attribute.name.getText() : '';
}

function attributeLiterals(attribute) {
  if (!attribute.initializer) return [];
  if (ts.isStringLiteral(attribute.initializer)) return [attribute.initializer.text];
  if (ts.isJsxExpression(attribute.initializer) && attribute.initializer.expression) {
    return literalsIn(attribute.initializer.expression);
  }
  return [];
}

/**
 * A `style` object literal is a paint decision in the wrong layer UNLESS every
 * property it sets is a `--ds-*` custom property computed at runtime. Spreads
 * are opaque and allowed: they carry a caller's own `style` prop and the
 * recipe's custom-property block, neither of which is a literal authored here.
 */
function styleObjectViolations(objectLiteral, source) {
  const violations = [];
  for (const property of objectLiteral.properties) {
    if (ts.isSpreadAssignment(property)) continue;
    let name;
    if (ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) {
      name = property.name.getText(source).replace(/^['"]|['"]$/gu, '');
    } else if (ts.isMethodDeclaration(property)) {
      name = property.name.getText(source);
    }
    if (name === undefined) continue;
    if (name.startsWith('--ds-')) continue;
    violations.push({
      property: name,
      line: source.getLineAndCharacterOfPosition(property.getStart(source)).line + 1,
    });
  }
  return violations;
}

const COLOR_FUNCTION_LITERAL =
  /(?<![\w-])(?:#[0-9a-fA-F]{3,8}\b|(?:rgba?|hsla?|oklch|oklab|lab|lch|color-mix)\s*\()/u;

export function analyzeSource(file, source = ts.createSourceFile(
  file,
  readFileSync(file, 'utf8'),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
)) {
  const parts = new Set();
  const states = new Set();
  const variants = new Set();
  const classTokens = new Set();
  const inlineStyleViolations = [];
  const visualLiterals = [];
  let usesPartAttributes = false;
  let dynamicParts = 0;
  let stampsPartAttribute = false;
  let stampsStateAttribute = false;
  let stampsVariantAttribute = false;

  const styleObjects = [];
  const namedObjects = new Map();

  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer
      && ts.isObjectLiteralExpression(node.initializer)) {
      namedObjects.set(node.name.text, node.initializer);
      const annotation = node.type ? node.type.getText(source) : '';
      if (/CSSProperties/u.test(annotation)) styleObjects.push(node.initializer);
    }
    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(source);
      if (callee === 'partAttributes' || callee.endsWith('.partAttributes')) {
        usesPartAttributes = true;
        const first = node.arguments[0];
        if (first) {
          const found = literalsIn(first);
          if (found.length === 0) dynamicParts += 1;
          for (const value of found) parts.add(value);
        }
      }
    }
    /* An anatomy attribute is as often authored as a property of a spread
     * object (`{ 'data-variant': v, ...partAttributes(...) }`) as it is written
     * on the element. A reader that only saw JSX attributes would report a
     * family that stamps nothing. */
    if (ts.isPropertyAssignment(node)) {
      const key = node.name.getText(source).replace(/^['"]|['"]$/gu, '');
      if (key === 'data-part') {
        stampsPartAttribute = true;
        const found = literalsIn(node.initializer);
        if (found.length === 0) dynamicParts += 1;
        for (const value of found) parts.add(value);
      } else if (key === 'data-state') {
        stampsStateAttribute = true;
        for (const value of literalsIn(node.initializer)) {
          for (const token of value.split(/\s+/u).filter(Boolean)) states.add(token);
        }
      } else if (key === 'data-variant') {
        stampsVariantAttribute = true;
        for (const value of literalsIn(node.initializer)) variants.add(value);
      }
    }
    if (ts.isJsxAttribute(node)) {
      const name = attributeName(node);
      if (name === 'data-part') {
        stampsPartAttribute = true;
        const found = attributeLiterals(node);
        if (found.length === 0) dynamicParts += 1;
        for (const value of found) parts.add(value);
      } else if (name === 'data-state') {
        stampsStateAttribute = true;
        for (const value of attributeLiterals(node)) {
          for (const token of value.split(/\s+/u).filter(Boolean)) states.add(token);
        }
      } else if (name === 'data-variant') {
        stampsVariantAttribute = true;
        for (const value of attributeLiterals(node)) variants.add(value);
      } else if (name === 'style' && node.initializer && ts.isJsxExpression(node.initializer)) {
        const expression = node.initializer.expression;
        if (expression && ts.isObjectLiteralExpression(expression)) styleObjects.push(expression);
        else if (expression && ts.isIdentifier(expression)) {
          const resolved = namedObjects.get(expression.text);
          if (resolved) styleObjects.push(resolved);
        }
      }
    }
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      for (const prefix of CLASS_PREFIXES) {
        for (const match of node.text.matchAll(
          new RegExp(`(?<![\\w-])${prefix}-[a-z0-9]+(?:-{1,2}[a-z0-9]+)*`, 'gu'),
        )) {
          classTokens.add(match[0]);
        }
      }
      if (COLOR_FUNCTION_LITERAL.test(node.text)) {
        visualLiterals.push({
          value: node.text,
          line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);

  for (const objectLiteral of styleObjects) {
    for (const violation of styleObjectViolations(objectLiteral, source)) {
      inlineStyleViolations.push({ ...violation, file });
    }
  }
  if (usesPartAttributes) for (const state of KERNEL_STATES) states.add(state);

  return {
    file,
    parts,
    states,
    variants,
    classTokens,
    inlineStyleViolations,
    visualLiterals: visualLiterals.map((entry) => ({ ...entry, file })),
    usesPartAttributes,
    dynamicParts,
    stampsPartAttribute,
    stampsStateAttribute: stampsStateAttribute || usesPartAttributes,
    stampsVariantAttribute,
  };
}

// ---------------------------------------------------------------------------
// The skin side of the contract
// ---------------------------------------------------------------------------

export function analyzeSkin(file) {
  const text = stripCssComments(readFileSync(file, 'utf8'));
  const parts = new Set();
  const states = new Set();
  const classTokens = new Set();
  let selectsVariant = false;

  for (const match of text.matchAll(/\[data-part\s*[~^*$|]?=\s*['"]([^'"]+)['"]/gu)) parts.add(match[1]);
  for (const match of text.matchAll(/\[data-state\s*[~^*$|]?=\s*['"]([^'"]+)['"]/gu)) {
    for (const token of match[1].split(/\s+/u).filter(Boolean)) states.add(token);
  }
  if (/\[data-variant/u.test(text)) selectsVariant = true;
  for (const prefix of CLASS_PREFIXES) {
    for (const match of text.matchAll(
      new RegExp(`\\.(${prefix}-[a-zA-Z0-9]+(?:-{1,2}[a-zA-Z0-9]+)*)`, 'gu'),
    )) {
      classTokens.add(match[1]);
    }
  }

  const colorLiterals = [];
  for (const match of text.matchAll(
    /(?<![\w-])(#[0-9a-fA-F]{3,8}\b|(?:rgba?|hsla?|oklch|oklab|lab|lch)\s*\()/gu,
  )) {
    colorLiterals.push({
      value: match[1],
      line: text.slice(0, match.index).split('\n').length,
      file,
    });
  }

  /**
   * A state pseudo-class is GOVERNED when the very selector it sits in also
   * matches the kernel state it stands for: `:is([data-state~='hovered'], :hover)`
   * is one decision plus its native fallback, while a bare `:hover` is a second
   * place deciding the same state -- which is F-37 exactly.
   */
  const unpairedPseudo = [];
  for (const chunk of text.split('{')) {
    const selector = (chunk.split('}').pop() ?? '').trim();
    if (selector.length === 0) continue;
    for (const [pseudo, twin] of Object.entries(PSEUDO_STATE_TWIN)) {
      if (!selector.includes(pseudo)) continue;
      if (selector.includes(`data-state~='${twin}'`) || selector.includes(`data-state~="${twin}"`)) continue;
      unpairedPseudo.push({
        pseudo,
        selector: selector.replace(/\s+/gu, ' ').slice(0, 160),
        file,
      });
    }
  }

  const antReads = [...text.matchAll(/--ant-[a-zA-Z0-9-]+/gu)].map((match) => ({
    name: match[0],
    file,
  }));

  return { file, parts, states, classTokens, selectsVariant, colorLiterals, unpairedPseudo, antReads };
}

// ---------------------------------------------------------------------------
// The catalog fan-out
// ---------------------------------------------------------------------------

/**
 * Which controls declare this family in their fan-out, and whether the family's
 * skin actually reads a channel the control produces. A control that names a
 * family it never reaches is a fan-out claim with no cascade behind it.
 */
export function fanOutFor(family, readNames, catalog = readThemeCatalog()) {
  const rows = [];
  for (const row of catalog) {
    const minimum = row.minimumFamilies ?? {};
    if (minimum.kind !== 'declared-fan-out') continue;
    if (!(minimum.families ?? []).includes(family)) continue;
    const channels = row.produces?.channels ?? [];
    const reached = channels.filter((channel) => readNames.has(channel));
    rows.push({ control: row.id, channels, reached, unreached: reached.length === 0 });
  }
  return rows;
}

// ---------------------------------------------------------------------------
// The measurement
// ---------------------------------------------------------------------------

export function measureFamily(resolved, { producers } = {}) {
  const { family, root } = resolved;
  const producerSet = producers ?? collectChannelProducers().producers;

  const sources = resolved.sources.map((file) => analyzeSource(file));
  const skins = resolved.skins.map((file) => analyzeSkin(file));
  const recipeTokens = new Set();
  if (resolved.recipe) {
    for (const token of analyzeSource(resolved.recipe).classTokens) recipeTokens.add(token);
  }

  const union = (list, key) => {
    const out = new Set();
    for (const entry of list) for (const value of entry[key]) out.add(value);
    return out;
  };

  const stampedParts = union(sources, 'parts');
  const stampedStates = union(sources, 'states');
  const stampedVariants = union(sources, 'variants');
  const consumedParts = union(skins, 'parts');
  const consumedStates = union(skins, 'states');
  const skinSelectsVariant = skins.some((skin) => skin.selectsVariant);
  const usesPartAttributes = sources.some((entry) => entry.usesPartAttributes);
  const dynamicParts = sources.reduce((total, entry) => total + entry.dynamicParts, 0);
  const skinUsesStateAttribute = consumedStates.size > 0;
  const stampsPartAttribute = sources.some((entry) => entry.stampsPartAttribute) || usesPartAttributes;
  const stampsStateAttribute = sources.some((entry) => entry.stampsStateAttribute);
  const stampsVariantAttribute = sources.some((entry) => entry.stampsVariantAttribute);

  const classTokens = new Set([...union(sources, 'classTokens'), ...union(skins, 'classTokens'), ...recipeTokens]);
  const ownClassTokens = [...classTokens].filter((token) => {
    const remainder = token.slice(token.indexOf('-') + 1);
    return remainder === family || remainder.startsWith(`${family}-`);
  }).sort();
  const vocabularies = [...new Set(ownClassTokens.map((token) => token.slice(0, token.indexOf('-'))))].sort();
  const legacyNamespaceClasses = ownClassTokens.filter((token) => !token.startsWith('ds-'));

  const readWithoutProducer = classifyReadWithoutProducer(
    resolved.skins.filter((file) => file.includes(MODERN_SKIN_SEGMENT)),
    producerSet,
  );
  const readNames = new Set(readWithoutProducer.denominator);

  const partsStampedNotConsumed = [...stampedParts].filter((part) => !consumedParts.has(part)).sort();
  const partsConsumedNotStamped = dynamicParts > 0
    ? []
    : [...consumedParts].filter((part) => !stampedParts.has(part)).sort();
  const statesConsumedNotStamped = [...consumedStates]
    .filter((state) => !stampedStates.has(state))
    .sort();

  const unpairedStatePseudo = skins.flatMap((skin) => skin.unpairedPseudo);
  const colorLiteralsInSkin = skins.flatMap((skin) => skin.colorLiterals);
  const antReads = skins.flatMap((skin) => skin.antReads);
  const inlineStyleViolations = sources.flatMap((entry) => entry.inlineStyleViolations);
  const visualLiterals = sources.flatMap((entry) => entry.visualLiterals);
  const fanOut = fanOutFor(family, readNames);

  return {
    family,
    denominators: {
      skinFiles: resolved.skins.length,
      sourceFiles: resolved.sources.length,
      channelsRead: readWithoutProducer.denominator.length,
      classTokens: ownClassTokens.length,
      partsStamped: stampedParts.size,
      partsConsumed: consumedParts.size,
    },
    blocking: {
      inlineStyleViolations,
      visualLiterals,
      antReads,
      owners: resolved.componentDirs.length,
      stampsAnatomy: stampsPartAttribute,
      skinReadsAnatomy: consumedParts.size > 0,
      variantContract: stampsVariantAttribute === skinSelectsVariant,
      stateContract: stampsStateAttribute === skinUsesStateAttribute,
      stateGoverned: skinUsesStateAttribute ? usesPartAttributes : true,
      a11yProbes: resolved.a11yProbes.length,
    },
    ratchets: {
      readWithoutProducer: readWithoutProducer.debt.length,
      classVocabularies: vocabularies.length,
      legacyNamespaceClasses: legacyNamespaceClasses.length,
      partsStampedNotConsumed: partsStampedNotConsumed.length,
      partsConsumedNotStamped: partsConsumedNotStamped.length,
      statesConsumedNotStamped: statesConsumedNotStamped.length,
      unpairedStatePseudoSelectors: unpairedStatePseudo.length,
      colorLiteralsInSkin: colorLiteralsInSkin.length,
      fanOutUnreached: fanOut.filter((row) => row.unreached).length,
    },
    detail: {
      vocabularies,
      legacyNamespaceClasses,
      partsStampedNotConsumed,
      partsConsumedNotStamped,
      statesConsumedNotStamped,
      unpairedStatePseudo,
      readWithoutProducer: readWithoutProducer.debt,
      fanOut,
      owners: resolved.componentDirs.map((dir) => toPosix(relative(root, dir))),
      skins: resolved.skins.map((file) => toPosix(relative(root, file))),
      sources: resolved.sources.map((file) => toPosix(relative(root, file))),
    },
  };
}

// ---------------------------------------------------------------------------
// The verdict
// ---------------------------------------------------------------------------

export function readBaseline(baselinePath = BASELINE_PATH) {
  if (!existsSync(baselinePath)) throw new Error('family-cut: baseline/index.json is missing');
  return JSON.parse(readFileSync(baselinePath, 'utf8'));
}

const RATCHET_LABEL = Object.freeze({
  readWithoutProducer: 'names the Modern skin reads that nobody writes',
  classVocabularies: 'distinct class vocabularies for one family',
  legacyNamespaceClasses: 'family classes outside the `ds-` namespace',
  partsStampedNotConsumed: '`data-part` values stamped with no rule in the skin',
  partsConsumedNotStamped: '`data-part` values the skin paints and nobody stamps',
  statesConsumedNotStamped: '`data-state` values the skin paints and nobody stamps',
  unpairedStatePseudoSelectors: 'state pseudo-classes deciding state without their `data-state` twin',
  colorLiteralsInSkin: 'colour literals in the family skin',
  fanOutUnreached: 'catalog controls that declare this family and reach none of its channels',
});

export function judgeFamily(measured, pinned) {
  const findings = [];
  const { family, blocking, ratchets, denominators, detail } = measured;

  if (denominators.skinFiles === 0) {
    findings.push(`${family}: resolves to zero Modern skin files -- an empty corpus is never a pass`);
  }
  if (denominators.sourceFiles === 0) {
    findings.push(`${family}: resolves to zero authored source files -- an empty corpus is never a pass`);
  }

  for (const violation of blocking.inlineStyleViolations) {
    findings.push(
      `${family}: BLOCKING inline paint -- \`style\` sets \`${violation.property}\` at ${toPosix(violation.file)}:${violation.line}. `
        + 'The skin paints; the TSX stamps state. Only a runtime-computed `--ds-*` custom property may travel inline',
    );
  }
  for (const literal of blocking.visualLiterals) {
    findings.push(
      `${family}: BLOCKING visual literal \`${literal.value}\` at ${toPosix(literal.file)}:${literal.line} -- a colour belongs to a channel, not to a component source`,
    );
  }
  for (const read of blocking.antReads) {
    findings.push(
      `${family}: BLOCKING \`${read.name}\` in ${toPosix(read.file)} -- an Ant Design private variable is not a channel of this design system (F-67)`,
    );
  }
  if (blocking.owners !== 1) {
    findings.push(
      `${family}: BLOCKING resolves to ${blocking.owners} component owner(s) ${JSON.stringify(detail.owners)} -- `
        + 'a family has exactly one source owner; resolution is exact or refused, never a guess between two',
    );
  }
  if (!blocking.stampsAnatomy) {
    findings.push(`${family}: BLOCKING the family stamps no \`data-part\`; the anatomy contract is mandatory`);
  }
  if (!blocking.skinReadsAnatomy) {
    findings.push(`${family}: BLOCKING the family skin selects no \`[data-part]\`; it paints something this contract cannot see`);
  }
  if (!blocking.variantContract) {
    findings.push(
      `${family}: BLOCKING \`data-variant\` is on exactly one side of the contract -- stamped without a rule, or painted without a stamp`,
    );
  }
  if (!blocking.stateContract) {
    findings.push(
      `${family}: BLOCKING \`data-state\` is on exactly one side of the contract -- stamped with no rule, or painted with no stamp`,
    );
  }
  if (!blocking.stateGoverned) {
    findings.push(
      `${family}: BLOCKING the skin decides state through \`[data-state]\` but the source never calls \`partAttributes\` -- `
        + 'one place decides when a part is pressed, or none does (F-37)',
    );
  }
  if (blocking.a11yProbes === 0) {
    findings.push(
      `${family}: BLOCKING the family owns no executable accessibility assertion; a cut without an a11y probe is not verified`,
    );
  }

  if (!pinned) {
    findings.push(
      `${family}: is not in baseline/index.json. A family enters the cut contract by being pinned, `
        + `with its cut's work order: ${JSON.stringify(ratchets)}`,
    );
    return findings;
  }

  for (const [key, value] of Object.entries(ratchets)) {
    const pin = pinned[key];
    if (typeof pin !== 'number') {
      findings.push(`${family}: baseline pins no numeric \`${key}\` (got ${JSON.stringify(pin ?? null)})`);
      continue;
    }
    if (value > pin) {
      findings.push(
        `${family}: \`${key}\` GREW from ${pin} to ${value} -- ${RATCHET_LABEL[key]}. `
          + `Fix the family instead of raising the pin${detail[key]?.length ? `: ${JSON.stringify(detail[key]).slice(0, 400)}` : ''}`,
      );
    } else if (value < pin) {
      findings.push(
        `${family}: \`${key}\` SHRANK from ${pin} to ${value} -- good news that still has to be written down: `
          + 'lower it in scripts/check/family-cut/baseline/index.json (decrease-only means the pin follows the tree DOWN, never up)',
      );
    }
  }
  const pinnedDenominators = pinned.denominators ?? {};
  for (const [key, value] of Object.entries(denominators)) {
    const pin = pinnedDenominators[key];
    if (typeof pin === 'number' && pin !== value) {
      findings.push(
        `${family}: denominator \`${key}\` moved from ${pin} to ${value}; re-read the census before touching a ratchet`,
      );
    }
  }
  return findings;
}

export function collectFindings({ baselinePath = BASELINE_PATH, root = DEFAULT_ROOT, only, producers } = {}) {
  const baseline = readBaseline(baselinePath);
  const roster = Object.keys(baseline.families ?? {});
  if (roster.length === 0) {
    /* One return shape, always. An empty roster that returned a bare array
     * would leave `main`'s destructuring with `findings === undefined` and the
     * gate would exit 0 on the one input that most deserves a red. */
    return {
      findings: ['family-cut: the roster is empty -- a gate with nothing to check is not a pass'],
      measurements: [],
      baseline,
    };
  }
  const families = only ? [only] : roster;
  const producerSet = producers ?? collectChannelProducers().producers;
  const findings = [];
  const measurements = [];
  for (const family of families) {
    const measured = measureFamily(resolveFamily(family, root), { producers: producerSet });
    measurements.push(measured);
    findings.push(...judgeFamily(measured, baseline.families?.[family]));
  }
  return { findings, measurements, baseline };
}

function main() {
  const args = process.argv.slice(2);
  const familyArg = args.find((arg) => arg.startsWith('--family='));
  const only = familyArg ? familyArg.slice('--family='.length) : undefined;

  const { findings, measurements } = collectFindings({ only });

  if (args.includes('--json')) {
    console.log(JSON.stringify({ findings, measurements }, null, 2));
    process.exit(findings.length > 0 ? 1 : 0);
  }

  for (const arm of OWED_ARMS) {
    console.log(`family-cut OWED ${arm.id} -> ${arm.owner}: ${arm.reason}`);
  }
  if (findings.length > 0) {
    console.error('family-cut FAILED:');
    for (const finding of findings) console.error(`  - ${finding}`);
    process.exit(1);
  }
  for (const measured of measurements) {
    const ratchets = Object.entries(measured.ratchets)
      .map(([key, value]) => `${key}=${value}`)
      .join(' ');
    console.log(
      `family-cut OK -- ${measured.family}: ${measured.denominators.skinFiles} skin file(s), `
        + `${measured.denominators.sourceFiles} source file(s), ${measured.denominators.channelsRead} channels read; ${ratchets}`,
    );
  }
  console.log(`family-cut OK -- ${measurements.length} family cut(s) hold their contract`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
