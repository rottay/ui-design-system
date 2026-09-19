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
 * ANATOMY-DERIVED SKELETON. A family's loading state is drawn by the one shared
 * renderer (`SKELETON_RENDERER_PATH`) from the family's stamped `data-part`
 * anatomy. The BLOCKING arm refuses a hand-made skeleton inside a family -- a
 * skeleton-named owner path, declaration or element, a skeleton part, selector,
 * keyframe or animation in its skin -- and refuses a stamped part the renderer's
 * `SKELETON_PART_ROLES` vocabulary has no role for.
 *
 * LAYOUT-SENSITIVE FAMILIES. A rostered family declared in the adaptation
 * contract's `LAYOUT_SENSITIVE_FAMILIES` also holds the BLOCKING `adaptSlot`
 * arm, measured by `./adapt-slot`: it accepts `adapt` and stamps
 * `data-posture`, or its cut is not done.
 *
 * ONE MEASUREMENT, NEVER TWO. The read-without-producer arm imports
 * `check/engine/read-without-producer` and `libraries/tokens/producers`; the
 * skin corpus comes from `libraries/engine/skins/files`; the fan-out comes
 * from `libraries/theme-catalog`. A second measurement of any of them would be
 * a second truth about the same tree. What this gate adds on top is a FILTER,
 * not a second count: `producersReaching` removes the producers whose selector
 * scope cannot reach the family being measured (see its own note).
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
 * sandbox copy of the family -- an inline `style={{ color }}` however it is
 * wrapped, a `--ds-button-x` read nobody writes, a second class vocabulary, an
 * `--ant-*` read, a mechanically suppressed test suite -- and asserts each one
 * turns this command red. There is no `--drill` flag: a switch
 * that mutates the measurement is a second way to be told the tree is broken,
 * and the first one is the tree.
 *
 * Exit 0 = every blocking arm holds and every ratchet is exactly its pin.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import postcss from 'postcss';
import ts from 'typescript';

import {
  measureAdaptSlot,
  readLayoutSensitiveFamilies,
  readPostureVocabulary,
} from './adapt-slot/index.mjs';
import { classifyReadWithoutProducer } from '../engine/read-without-producer/index.mjs';
import { collectSkinFiles } from '../../libraries/engine/skins/files/index.mjs';
import { packageRoot as findPackageRoot } from '../../libraries/repo-root/index.mjs';
import { readThemeCatalog } from '../../libraries/theme-catalog/index.mjs';
import {
  collectAuthoredStylesheets,
  collectChannelProducers,
} from '../../libraries/tokens/producers/index.mjs';

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
 * The shared loading-state renderer. A family's skeleton is drawn by it from the
 * family's stamped `data-part` anatomy, and it can only draw a part its
 * `SKELETON_PART_ROLES` vocabulary gives a role.
 */
export const SKELETON_RENDERER_PATH =
  'src/components/primitives/feedback/skeleton/runtime/anatomy-renderer/index.tsx';
const SKELETON_RENDERER_EXPORT = 'AnatomySkeleton';
const SKELETON_ROLES = new Set(['frame', 'pass', 'block', 'line', 'round', 'omit']);
const SKELETON_WORD = /skeleton/iu;
const SKELETON_MOTION_WORD = /skeleton|shimmer/iu;

/**
 * Arms the template requires and this gate cannot yet measure, each with the
 * work order that makes it measurable. Printed on every run.
 */
export const OWED_ARMS = Object.freeze([
  {
    id: 'layout-animation-kernel',
    owner: 'WO-INV-08',
    reason:
      'presence/enter animation must route through `runtime/motion/layout`, which WO-INV-08 creates; measuring adoption of a kernel that does not exist would fail every family for someone else\'s work',
  },
  {
    id: 'axe-per-family',
    owner: 'WO-INV-03',
    reason:
      'axe needs a rendered DOM; a static gate cannot run it. The live acceptance is WO-INV-03: axe per family over the Modern x bithire matrix in CI, on a baseline carrying zero `critical` rows -- the shipped run measures eight flagship galleries, which is not one cut per family. What this gate CAN prove, and does, is the blocking arm `a11yAssertions`: the family EXECUTES at least one accessibility assertion of its own -- an assertion inside a suppressed suite is text, not evidence',
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
/**
 * The UI tier a class carries between its vocabulary and the family name. A
 * pattern paints `.ds-pattern-<family>`, a structure `.ds-structure-<family>`,
 * and its skin directory is named for the class, not for the owner. Neither
 * the token nor the directory names the family until this comes off.
 */
const TIER_PREFIXES = Object.freeze(['pattern', 'structure']);

const withoutTier = (name) => {
  for (const tier of TIER_PREFIXES) {
    if (name.startsWith(`${tier}-`)) return name.slice(tier.length + 1);
  }
  return name;
};

function skinBelongsToFamily(file, family) {
  const owner = withoutTier(basename(dirname(file)));
  return owner === family || owner.startsWith(`${family}-`);
}

/**
 * A prefixed skin leaves the family's measurement only when it selects no class
 * of the family: every family class it selects must belong to the skin's own
 * name (`input-number` beside `input`) and be unnamed by the family's sources.
 * A directory with the skin's name never discharges a rule that paints the
 * measured family, and every exclusion is reported.
 */
function foreignCompoundReason(file, family, ownerNames, familyClassTokens) {
  const owner = withoutTier(basename(dirname(file)));
  if (owner === family) return undefined;
  const underName = (token, name) => {
    const remainder = withoutTier(token.slice(token.indexOf('-') + 1));
    return remainder === name || remainder.startsWith(`${name}-`) || remainder.startsWith(`${name}_`);
  };
  // A token belongs to ANOTHER family when some other component owner carries
  // its name. The skin's own directory is not the only candidate: a skin may be
  // named anything (`tree-view-connector` paints `tree-view`), so asking only
  // `underName(token, owner)` swallowed a sibling's classes into this family.
  const claimedByOtherOwner = (token) =>
    [...ownerNames].some((name) => name !== family && underName(token, name));
  const selected = [...analyzeSkin(file).classTokens].filter((token) => underName(token, family));
  const targetsFamily = selected.filter(
    (token) => familyClassTokens.has(token)
      || (!underName(token, owner) && !claimedByOtherOwner(token)),
  );
  if (targetsFamily.length > 0) return undefined;
  const sibling = ownerNames.has(owner) ? `sibling family \`${owner}\` has its own component owner; ` : '';
  return `${sibling}selects no class of the family (${JSON.stringify(selected.slice(0, 4))})`;
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

/**
 * One word, two meanings. Inside `primitives/`, `patterns/` and `structures/`
 * a `presentation/` segment is a sub-owner of the owner above it. Inside
 * `surfaces/` it is the tier's own first-level dependency BRANCH -- the tier
 * declares `foundation/`, `runtime/` and `presentation/pages/`, and every page
 * owner lives below the third of them. Reading the branch as a sub-owner hid
 * the whole tier from the census, so the branch segment is forgiven exactly
 * once, at the tier's first level: `surfaces/presentation/pages/forms/form` is
 * an owner, `surfaces/presentation` itself is a branch and never an owner, and
 * a nested-owner segment deeper down (`.../form/tests`) still excludes.
 */
const TIER_BRANCH_PREFIX = '/surfaces/presentation/';

const withoutTierBranch = (rel) =>
  (rel.startsWith(TIER_BRANCH_PREFIX) && rel.length > TIER_BRANCH_PREFIX.length
    ? `/surfaces/${rel.slice(TIER_BRANCH_PREFIX.length)}`
    : rel);

function collectOwnerDirs(root) {
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
      if (!NESTED_OWNER_SEGMENT.test(withoutTierBranch(rel))) dirs.push(full);
      walk(full);
    }
  };
  walk(componentRoot);
  return dirs;
}

function findComponentDirs(root, family, ownerDirs = collectOwnerDirs(root)) {
  const dirs = [];
  for (const dir of ownerDirs) {
    if (basename(dir) !== family) continue;
    // An owner is the outermost directory of that name; its own subtree is its parts.
    if (dirs.some((found) => dir.startsWith(`${found}${sep}`))) continue;
    dirs.push(dir);
  }
  return dirs;
}

/**
 * The authored TSX/TS of a family: its engine-agnostic owners and its MODERN
 * engine. Classic and Rustic are frozen and never enter a Modern measurement;
 * tests, stories and fixtures are evidence, not the family's source.
 */
const FROZEN_ENGINE_SEGMENT = /\/engines\/(?:classic|rustic)\//u;

/** Every authored module of the family, frozen engines included. */
function isFamilyModule(file) {
  const posix = toPosix(file);
  if (/\/(?:tests|__snapshots__|fixtures)\//u.test(posix)) return false;
  if (/\.stories\.tsx?$/u.test(posix)) return false;
  if (/\.test\.tsx?$/u.test(posix)) return false;
  return /\.tsx?$/u.test(posix);
}

/** The file a relative specifier names, trying the four shapes the tree uses. */
function resolveSpecifier(fromFile, specifier) {
  const base = resolve(dirname(fromFile), specifier);
  for (const candidate of [`${base}.ts`, `${base}.tsx`, join(base, 'index.ts'), join(base, 'index.tsx')]) {
    if (existsSync(candidate)) return candidate;
  }
  return undefined;
}

/**
 * A module whose only remaining importers are FROZEN engines is not the live
 * family's source: classic and rustic are already out of the census by name,
 * and what they alone still paint through is theirs. A module with no importer
 * at all, or with one live importer, stays -- the exclusion is earned by the
 * consumer graph, never by a path.
 */
function collectFrozenOnlyModules(componentDirs) {
  const files = componentDirs.flatMap((dir) => walkFiles(dir, isFamilyModule));
  const importers = new Map();
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/from\s+['"](\.[^'"]+)['"]/gu)) {
      const target = resolveSpecifier(file, match[1]);
      if (!target) continue;
      if (!importers.has(target)) importers.set(target, new Set());
      importers.get(target).add(file);
    }
  }
  const frozenOnly = new Set();
  for (const [target, from] of importers) {
    if (FROZEN_ENGINE_SEGMENT.test(toPosix(target))) continue;
    if ([...from].every((file) => FROZEN_ENGINE_SEGMENT.test(toPosix(file)))) frozenOnly.add(target);
  }
  return frozenOnly;
}

function isFamilySource(file) {
  const posix = toPosix(file);
  if (/\/(?:tests|__snapshots__|fixtures)\//u.test(posix)) return false;
  if (/\.stories\.tsx?$/u.test(posix)) return false;
  if (/\.test\.tsx?$/u.test(posix)) return false;
  if (/\/engines\/(?:classic|rustic)\//u.test(posix)) return false;
  return /\.tsx?$/u.test(posix);
}

// ---------------------------------------------------------------------------
// Accessibility evidence: assertions that RUN, never text in a file
// ---------------------------------------------------------------------------

/**
 * The assertion vocabulary that constitutes accessibility evidence: a query by
 * accessible role or label, a name/description/focus matcher, or an axe run.
 * `aria-*` string arguments count too -- asserting on an ARIA attribute is an
 * accessibility assertion however it is spelled.
 */
const A11Y_CALLEE =
  /(?:^|\.)(?:axe|toHaveNoViolations|toHaveAccessibleName|toHaveAccessibleDescription|toHaveFocus|toHaveRole|(?:get|find|query|getAll|findAll|queryAll)By(?:Role|LabelText|Title))$/u;
const A11Y_ARGUMENT = /^aria-[a-z-]+$/u;

/** `describe`/`it`/`test` and the prefixed spellings of a suppressed one. */
const SUITE_ROOTS = new Set(['describe', 'suite', 'context']);
const CASE_ROOTS = new Set(['it', 'test']);
const SUPPRESSED_ROOTS = new Set(['xdescribe', 'xit', 'xtest', 'fdescribe.skip']);
/** Modifiers that stop a suite or case from executing. `skipIf` is conditional, so it cannot be evidence either. */
const SUPPRESSING_MODIFIERS = new Set(['skip', 'todo', 'skipIf', 'runIf']);

/** `describe.skip.each` -> { root: 'describe', modifiers: ['skip', 'each'] }. */
function callerChain(expression) {
  const modifiers = [];
  let current = expression;
  for (;;) {
    if (ts.isCallExpression(current)) { current = current.expression; continue; }
    if (ts.isPropertyAccessExpression(current)) {
      modifiers.unshift(current.name.text);
      current = current.expression;
      continue;
    }
    if (ts.isTaggedTemplateExpression(current)) { current = current.tag; continue; }
    break;
  }
  if (!ts.isIdentifier(current)) return undefined;
  return { root: current.text, modifiers };
}

function classifyRunner(node) {
  if (!ts.isCallExpression(node)) return undefined;
  const chain = callerChain(node.expression);
  if (!chain) return undefined;
  const { root, modifiers } = chain;
  const kind = SUITE_ROOTS.has(root) ? 'suite' : CASE_ROOTS.has(root) ? 'case' : undefined;
  if (!kind) {
    if (!SUPPRESSED_ROOTS.has(root)) return undefined;
    return { kind: root.startsWith('xdescribe') ? 'suite' : 'case', suppressed: true };
  }
  return { kind, suppressed: modifiers.some((name) => SUPPRESSING_MODIFIERS.has(name)) };
}

/** A body that runs only when something calls it. */
function isFunctionLike(node) {
  return ts.isArrowFunction(node) || ts.isFunctionExpression(node)
    || ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node);
}

/** `((() => {}))()` -- a callee or a callback reached through parentheses is still invoked. */
function unwrapParentheses(node) {
  let current = node;
  while (current && ts.isParenthesizedExpression(current)) current = current.expression;
  return current;
}

/**
 * The a11y assertions and the helper names reachable inside one node.
 *
 * A function body is entered only where reaching it MEANS running it: the
 * callback of a call, an immediately invoked expression, the case body itself.
 * A function that is only written down -- a `const` nobody calls, an event
 * handler nobody fires -- executes nothing, so the assertions inside it are
 * text of the kind this gate exists to refuse. They still count when an
 * executing case reaches the function BY NAME, which is the `helpers`
 * resolution in `countExecutableA11yAssertions`.
 */
function scanForA11y(node, source) {
  let assertions = 0;
  const calls = new Set();
  const enter = (fn) => {
    if (fn.body) visit(fn.body);
  };
  const visit = (current) => {
    if (isFunctionLike(current)) return;
    if (ts.isCallExpression(current)) {
      const callee = current.expression.getText(source);
      if (A11Y_CALLEE.test(callee)) assertions += 1;
      for (const argument of current.arguments) {
        if ((ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument))
          && A11Y_ARGUMENT.test(argument.text)) assertions += 1;
      }
      const chain = callerChain(current.expression);
      if (chain && chain.modifiers.length === 0) calls.add(chain.root);
      const invoked = unwrapParentheses(current.expression);
      if (isFunctionLike(invoked)) enter(invoked);
      else visit(current.expression);
      for (const argument of current.arguments) {
        const value = unwrapParentheses(argument);
        if (isFunctionLike(value)) enter(value);
        else visit(argument);
      }
      return;
    }
    ts.forEachChild(current, visit);
  };
  visit(node);
  return { assertions, calls };
}

/**
 * How many accessibility assertions this test file actually EXECUTES.
 *
 * A gate that counted matching text would accept a file whose every suite is
 * `describe.skip`: the text is still there and nothing runs. So an assertion
 * counts only when it sits inside a case that executes -- directly, or inside a
 * module-scope helper that an executing case reaches.
 */
export function countExecutableA11yAssertions(file, text = readFileSync(file, 'utf8')) {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const helpers = new Map();
  const executingCases = [];

  const declareHelper = (name, body) => {
    if (!name || !body) return;
    helpers.set(name, scanForA11y(body, source));
  };

  const walk = (node, suppressed) => {
    const runner = classifyRunner(node);
    if (runner) {
      const blocked = suppressed || runner.suppressed;
      if (runner.kind === 'case') {
        if (!blocked) executingCases.push(node);
        // A case body holds assertions, never nested cases.
        if (blocked) return;
      }
      for (const argument of node.arguments) ts.forEachChild(argument, (child) => walk(child, blocked));
      return;
    }
    if (ts.isFunctionDeclaration(node) && node.name && node.body) {
      declareHelper(node.name.text, node.body);
    } else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer
      && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))
      && node.initializer.body) {
      declareHelper(node.name.text, node.initializer.body);
    }
    ts.forEachChild(node, (child) => walk(child, suppressed));
  };
  walk(source, false);

  let total = 0;
  const reached = new Set();
  const queue = [];
  for (const testCase of executingCases) {
    const scan = scanForA11y(testCase, source);
    total += scan.assertions;
    for (const name of scan.calls) queue.push(name);
  }
  while (queue.length > 0) {
    const name = queue.pop();
    if (reached.has(name)) continue;
    reached.add(name);
    const helper = helpers.get(name);
    if (!helper) continue;
    total += helper.assertions;
    for (const next of helper.calls) queue.push(next);
  }
  return total;
}

/**
 * `pin.owner` names the family's one owner directory. Two jobs: it selects
 * among same-named candidates when a folder name is shared with another tier
 * (`form` is both the primitive and the FormHeader structure), and it resolves
 * a family whose id is not its folder name (`form-header` is owned by
 * `structures/headers/form`; a rename is a different lot). It never invents an
 * owner: the pin must name a directory the owner walk admits, or the family
 * resolves to zero owners, which is a BLOCKING refusal.
 *
 * `pin.skins` names the skin directories that ARE this family's paint, for the
 * families whose skin is not named after them (`header-surface` is painted by
 * `skin/layout-header`). It is exact: name inference and the foreign-compound
 * filter both step aside, a pinned name that matches no skin file is reported,
 * and a skin outside the list is not this family's.
 */
export function resolveFamily(family, root = DEFAULT_ROOT, pin = {}) {
  const ownerDirs = collectOwnerDirs(root);
  const candidates = findComponentDirs(root, family, ownerDirs);
  const componentDirs = pin.owner
    ? ownerDirs.filter((dir) => toPosix(relative(root, dir)) === pin.owner)
    : candidates;
  const frozenOnly = collectFrozenOnlyModules(componentDirs);
  const sources = componentDirs
    .flatMap((dir) => walkFiles(dir, isFamilySource))
    .filter((file) => !frozenOnly.has(file))
    .sort();
  const ownerNames = new Set(ownerDirs.map((dir) => basename(dir)));
  const familyClassTokens = new Set(sources.flatMap((file) => [...readFileSync(file, 'utf8')
    .matchAll(new RegExp(`(?<![\\w-])(?:${CLASS_PREFIXES.join('|')})-[a-z0-9]+(?:-{1,2}[a-z0-9]+)*`, 'gu'))]
    .map((match) => match[0])));
  const foreignSkins = [];
  const pinnedSkins = pin.skins ? new Set(pin.skins) : undefined;
  const modernScope = collectSkinFiles(root)
    .filter((file) => file.includes(MODERN_SKIN_SEGMENT) || toPosix(file).includes('/presentation/components/skin/'));
  const skins = (pinnedSkins
    ? modernScope.filter((file) => pinnedSkins.has(basename(dirname(file))))
    : modernScope
      .filter((file) => skinBelongsToFamily(file, family))
      .filter((file) => {
        const reason = foreignCompoundReason(file, family, ownerNames, familyClassTokens);
        if (reason) foreignSkins.push({ skin: toPosix(relative(root, file)), reason });
        return !reason;
      })
  ).sort();
  const unmatchedPinnedSkins = pinnedSkins
    ? [...pinnedSkins].filter((name) => !skins.some((file) => basename(dirname(file)) === name)).sort()
    : [];
  const recipe = join(
    root,
    'src/infrastructure/runtime/foundation/recipes/contracts/families',
    family,
    'index.ts',
  );
  const a11yEvidence = componentDirs
    .flatMap((dir) => walkFiles(dir, (file) => /\.test\.tsx?$/u.test(file)))
    .sort()
    .map((file) => ({ file, assertions: countExecutableA11yAssertions(file) }))
    .filter((entry) => entry.assertions > 0);
  return {
    family,
    root,
    skins,
    foreignSkins,
    ownerCandidates: candidates.map((dir) => toPosix(relative(root, dir))),
    pinnedOwner: pin.owner,
    pinnedSkins: pin.skins ? [...pin.skins] : undefined,
    unmatchedPinnedSkins,
    componentDirs,
    sources,
    recipe: existsSync(recipe) ? recipe : undefined,
    a11yProbes: a11yEvidence.map((entry) => entry.file),
    a11yAssertions: a11yEvidence.reduce((total, entry) => total + entry.assertions, 0),
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
 * Strips the wrappers that change a type and never a value. `x as CSSProperties`,
 * `(x)`, `x satisfies CSSProperties`, `<CSSProperties>x` and `x!` all paint
 * exactly what `x` paints, so a reader that stopped at any of them would let an
 * authored colour through under a cast.
 */
function unwrapTransparent(node) {
  let current = node;
  while (current) {
    if (ts.isParenthesizedExpression(current)
      || ts.isAsExpression(current)
      || ts.isNonNullExpression(current)
      || current.kind === ts.SyntaxKind.SatisfiesExpression
      || current.kind === ts.SyntaxKind.TypeAssertionExpression) {
      current = current.expression;
      continue;
    }
    return current;
  }
  return current;
}

/**
 * Every object literal a `style` expression can evaluate to: through casts and
 * parentheses, through a named local, through both arms of a conditional or a
 * logical guard, and through an object spread of any of those.
 */
function collectStyleObjects(expression, namedObjects, out = new Set(), seen = new Set()) {
  const node = unwrapTransparent(expression);
  if (!node || seen.has(node)) return out;
  seen.add(node);
  if (ts.isObjectLiteralExpression(node)) {
    out.add(node);
    for (const property of node.properties) {
      if (ts.isSpreadAssignment(property)) {
        collectStyleObjects(property.expression, namedObjects, out, seen);
      }
    }
    return out;
  }
  if (ts.isIdentifier(node)) {
    const resolved = namedObjects.get(node.text);
    if (resolved) collectStyleObjects(resolved, namedObjects, out, seen);
    return out;
  }
  if (ts.isConditionalExpression(node)) {
    collectStyleObjects(node.whenTrue, namedObjects, out, seen);
    collectStyleObjects(node.whenFalse, namedObjects, out, seen);
    return out;
  }
  if (ts.isBinaryExpression(node)
    && [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken]
      .includes(node.operatorToken.kind)) {
    collectStyleObjects(node.left, namedObjects, out, seen);
    collectStyleObjects(node.right, namedObjects, out, seen);
    return out;
  }
  return out;
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
  const componentAnchors = [];
  const inlineStyleViolations = [];
  const visualLiterals = [];
  let usesPartAttributes = false;
  let dynamicParts = 0;
  let stampsPartAttribute = false;
  let stampsStateAttribute = false;
  let stampsVariantAttribute = false;

  const styleObjects = new Set();
  const namedObjects = new Map();
  const skeletonSigns = [];
  const lineOf = (node) => source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;

  const anchorOn = (entries) => {
    const parts = entries.filter(([key]) => key === 'data-part').flatMap(([, values]) => values);
    const components = entries.filter(([key]) => key === 'data-component').flatMap(([, values]) => values);
    for (const part of parts) for (const component of components) componentAnchors.push({ part, component });
  };

  const visit = (node) => {
    if (ts.isObjectLiteralExpression(node)) {
      anchorOn(node.properties.filter(ts.isPropertyAssignment).map((property) => [
        property.name.getText(source).replace(/^['"]|['"]$/gu, ''),
        literalsIn(property.initializer),
      ]));
    }
    if (ts.isJsxAttributes(node)) {
      anchorOn(node.properties.filter(ts.isJsxAttribute).map((attribute) => [
        attributeName(attribute),
        attributeLiterals(attribute),
      ]));
    }
    if ((ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)
      || (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)))
      && node.name && SKELETON_WORD.test(node.name.text)) {
      skeletonSigns.push({ what: `declaration \`${node.name.text}\``, line: lineOf(node) });
    }
    if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node))) {
      const tag = node.tagName.getText(source);
      if (SKELETON_WORD.test(tag) && tag !== SKELETON_RENDERER_EXPORT) {
        skeletonSigns.push({ what: `element \`<${tag}>\``, line: lineOf(node) });
      }
    }
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const initializer = unwrapTransparent(node.initializer);
      if (ts.isObjectLiteralExpression(initializer)) namedObjects.set(node.name.text, initializer);
      const annotation = [
        node.type ? node.type.getText(source) : '',
        ts.isAsExpression(node.initializer) ? node.initializer.type.getText(source) : '',
      ].join(' ');
      if (/CSSProperties/u.test(annotation)) {
        for (const objectLiteral of collectStyleObjects(node.initializer, namedObjects)) {
          styleObjects.add(objectLiteral);
        }
      }
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
        if (expression) {
          for (const objectLiteral of collectStyleObjects(expression, namedObjects)) {
            styleObjects.add(objectLiteral);
          }
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
    componentAnchors,
    inlineStyleViolations,
    visualLiterals: visualLiterals.map((entry) => ({ ...entry, file })),
    skeletonSigns: skeletonSigns.map((entry) => ({ ...entry, file })),
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
  const components = new Set();
  let selectsVariant = false;

  for (const match of text.matchAll(/\[data-part\s*[~^*$|]?=\s*['"]([^'"]+)['"]/gu)) parts.add(match[1]);
  for (const match of text.matchAll(/\[data-state\s*[~^*$|]?=\s*['"]([^'"]+)['"]/gu)) {
    for (const token of match[1].split(/\s+/u).filter(Boolean)) states.add(token);
  }
  for (const match of text.matchAll(/\[data-component\s*=\s*['"]([^'"]+)['"]/gu)) components.add(match[1]);
  if (/\[data-variant/u.test(text)) selectsVariant = true;
  const variantCompounds = [...text.matchAll(/\[data-variant/gu)]
    .map((match) => compoundClassTokensBefore(text, match.index));
  for (const prefix of CLASS_PREFIXES) {
    for (const match of text.matchAll(
      new RegExp(`\\.(${prefix}-[a-zA-Z0-9]+(?:-{1,2}[a-zA-Z0-9]+)*)`, 'gu'),
    )) {
      classTokens.add(match[1]);
    }
  }

  const maskValues = maskImageValueRanges(text);
  const colorLiterals = [];
  const maskAlphaStops = [];
  for (const match of text.matchAll(
    /(?<![\w-])(#[0-9a-fA-F]{3,8}\b|(?:rgba?|hsla?|oklch|oklab|lab|lch)\s*\()/gu,
  )) {
    const inMask = maskValues.some(([start, end]) => match.index >= start && match.index < end);
    (inMask ? maskAlphaStops : colorLiterals).push({
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

  const lineAt = (index) => text.slice(0, index).split('\n').length;
  const skeletonSigns = [];
  for (const match of text.matchAll(/@keyframes\s+([\w-]+)/gu)) {
    if (SKELETON_MOTION_WORD.test(match[1])) {
      skeletonSigns.push({ what: `keyframes \`${match[1]}\``, line: lineAt(match.index), file });
    }
  }
  for (const match of text.matchAll(/animation(?:-name)?\s*:\s*([^;}]+)/gu)) {
    if (SKELETON_MOTION_WORD.test(match[1].replace(/--ds-[\w-]+/gu, ''))) {
      skeletonSigns.push({ what: `animation \`${match[1].trim().slice(0, 80)}\``, line: lineAt(match.index), file });
    }
  }
  for (const match of text.matchAll(/(?:\.[\w-]*skeleton[\w-]*|\[data-part\s*[~^*$|]?=\s*['"][^'"]*skeleton[^'"]*['"]\])/giu)) {
    skeletonSigns.push({ what: `selector \`${match[0]}\``, line: lineAt(match.index), file });
  }

  return { file, parts, states, classTokens, components, selectsVariant, variantCompounds, colorLiterals, maskAlphaStops, unpairedPseudo, antReads, skeletonSigns };
}

/** The prefixed classes of the compound selector that ends at `index`, outside any parentheses. */
function compoundClassTokensBefore(text, index) {
  let start = index;
  let depth = 0;
  while (start > 0) {
    const char = text[start - 1];
    if (char === ')') depth += 1;
    else if (char === '(') {
      if (depth === 0) break;
      depth -= 1;
    } else if (depth === 0 && /[\s,>+~{};]/u.test(char)) break;
    start -= 1;
  }
  let compound = text.slice(start, index);
  while (/\([^()]*\)/u.test(compound)) compound = compound.replace(/\([^()]*\)/gu, '');
  const tokens = [];
  for (const prefix of CLASS_PREFIXES) {
    for (const match of compound.matchAll(new RegExp(`\\.(${prefix}-[a-zA-Z0-9]+(?:-{1,2}[a-zA-Z0-9]+)*)`, 'gu'))) {
      tokens.push(match[1]);
    }
  }
  return tokens;
}

// ---------------------------------------------------------------------------
// Which producers a family can actually reach
// ---------------------------------------------------------------------------

/**
 * A `--ds-x: …` written under a component selector is NOT a package-wide
 * producer. `--ds-kbd-frame` is declared in exactly one place --
 * `.ds-pattern-command-palette.ds-engine-modern [data-part='shortcut']` -- and
 * `collection-header` reads it for its own key cap, where that rule can never
 * match. Counting it cleared a real unproduced read and moved the row's ratchet
 * from 10 to 9: the count fell without a line of paint changing, which is a
 * classifier artifact and not progress.
 *
 * So: a declaration is PACKAGE-WIDE when at least one of its selectors names no
 * component at all (`:root`, `html`, `[data-engine='modern']`, `*`), and SCOPED
 * otherwise. A scoped declaration still produces for the family it is scoped to
 * -- the family whose class the selector names, or whose corpus holds the file
 * -- and for nobody else.
 */
const COMPONENT_SCOPE_RE = new RegExp(
  `\\.(?:${CLASS_PREFIXES.join('|')})-[a-zA-Z0-9-]+|\\[data-(?:part|component)\\b`,
  'u',
);
const SELECTOR_CLASS_RE = new RegExp(
  `\\.((?:${CLASS_PREFIXES.join('|')})-[a-zA-Z0-9]+(?:-{1,2}[a-zA-Z0-9]+)*)`,
  'gu',
);

/** The chain of selectors a declaration sits under, outermost first. */
function selectorChain(decl) {
  const chain = [];
  for (let node = decl.parent; node; node = node.parent) {
    if (node.type === 'rule' && typeof node.selector === 'string') chain.unshift(node.selector);
  }
  return chain;
}

/**
 * Every authored `--ds-*` declaration, indexed by channel: whether any of its
 * declarations is package-wide, which family classes scope the rest, and which
 * files they live in.
 */
export function collectDeclarationScopes({ files } = {}) {
  const corpus = files ?? collectAuthoredStylesheets(DEFAULT_ROOT);
  const scopes = new Map();
  for (const file of corpus) {
    let root;
    try {
      root = postcss.parse(readFileSync(file, 'utf8'), { from: file });
    } catch {
      /* An unparseable sheet states no scope; the producer set still counts its
       * text-level declarations, so this fails OPEN rather than inventing debt. */
      continue;
    }
    root.walkDecls((decl) => {
      if (!decl.prop.startsWith('--ds-')) return;
      const entry = scopes.get(decl.prop) ?? { packageWide: false, classTokens: new Set(), files: new Set() };
      const chain = selectorChain(decl);
      if (chain.length === 0) {
        entry.packageWide = true;
      } else {
        const parts = chain[chain.length - 1].split(',').map((part) => part.trim()).filter(Boolean);
        if (parts.length === 0 || parts.some((part) => !COMPONENT_SCOPE_RE.test(part))) {
          entry.packageWide = true;
        }
        for (const selector of chain) {
          for (const match of selector.matchAll(SELECTOR_CLASS_RE)) entry.classTokens.add(match[1]);
        }
      }
      entry.files.add(toPosix(file));
      scopes.set(decl.prop, entry);
    });
  }
  return scopes;
}

let defaultDeclarationScopes = null;
function sharedDeclarationScopes() {
  defaultDeclarationScopes ??= collectDeclarationScopes();
  return defaultDeclarationScopes;
}

/* One walk of the producer corpus per process: every family asks the same
 * question of the same tree, and two walks would be two truths about it. */
let defaultChannelProducers = null;
function sharedChannelProducers() {
  defaultChannelProducers ??= collectChannelProducers();
  return defaultChannelProducers;
}

/**
 * The producer set as THIS family sees it: every package-wide producer, plus
 * the scoped declarations whose scope can reach it. Compiler emissions are
 * always package-wide -- the compiler writes on the theme root -- so only
 * authored declarations are ever demoted.
 */
export function producersReaching({ producers, scopes, compiled, ownsClass, corpus }) {
  const reaching = new Set(producers);
  const owned = new Set(corpus.map((file) => toPosix(file)));
  for (const [name, scope] of scopes) {
    if (scope.packageWide) continue;
    if (compiled?.has(name)) continue;
    if (!reaching.has(name)) continue;
    const reaches =
      [...scope.classTokens].some((token) => ownsClass(token))
      || [...scope.files].some((file) => owned.has(file));
    if (!reaches) reaching.delete(name);
  }
  return reaching;
}

const composedVariantStampCache = new Map();

/**
 * A composed primitive owns the `data-variant` it stamps: a family skin that
 * reaches it through the primitive's class reads that stamp, not a family one.
 */
function composedPrimitiveStampsVariant(token, root) {
  const name = withoutTier(token.slice(token.indexOf('-') + 1)).replace(/--.*$/u, '');
  const key = `${root}\0${name}`;
  if (!composedVariantStampCache.has(key)) {
    const owners = findComponentDirs(root, name);
    const frozenOnly = collectFrozenOnlyModules(owners);
    composedVariantStampCache.set(key, owners.length === 1 && walkFiles(owners[0], isFamilySource)
      .filter((file) => !frozenOnly.has(file))
      .some((file) => analyzeSource(file).stampsVariantAttribute)
      ? name
      : undefined);
  }
  return composedVariantStampCache.get(key);
}

/**
 * The value spans of `mask-image` / `-webkit-mask-image` declarations. A mask
 * reads only alpha, so its gradient stops are not paint and no decision moves them.
 */
function maskImageValueRanges(text) {
  const ranges = [];
  for (const match of text.matchAll(/(?<![\w-])(?:-webkit-)?mask-image\s*:/gu)) {
    const start = match.index + match[0].length;
    let depth = 0;
    let end = start;
    for (; end < text.length; end += 1) {
      const char = text[end];
      if (char === '(') depth += 1;
      else if (char === ')') depth = Math.max(0, depth - 1);
      else if (depth === 0 && (char === ';' || char === '}' || char === '{')) break;
    }
    ranges.push([start, end]);
  }
  return ranges;
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
    // A data-only row reaches its families as runtime data, not as a cascade
    // channel, so it cannot be an unreached fan-out claim.
    if (row.effect === 'data-only') continue;
    if (!(minimum.families ?? []).includes(family)) continue;
    const channels = row.produces?.channels ?? [];
    const reached = channels.filter((channel) => readNames.has(channel));
    rows.push({ control: row.id, channels, reached, unreached: reached.length === 0 });
  }
  return rows;
}

/**
 * Every family id the catalog declares in a fan-out, and the controls that
 * declare it. A declaration names a family the cut contract is supposed to
 * measure; an id that matches no roster row is a claim nobody can ever check,
 * so `collectFindings` refuses one that is not registered as routed.
 */
export function declaredFanOutFamilies(catalog = readThemeCatalog()) {
  const declared = new Map();
  for (const row of catalog) {
    const minimum = row.minimumFamilies ?? {};
    if (minimum.kind !== 'declared-fan-out') continue;
    for (const family of minimum.families ?? []) {
      if (!declared.has(family)) declared.set(family, { controls: [], channels: new Set() });
      const entry = declared.get(family);
      entry.controls.push(row.id);
      for (const channel of row.produces?.channels ?? []) entry.channels.add(channel);
    }
  }
  return declared;
}

// ---------------------------------------------------------------------------
// The anatomy-derived skeleton
// ---------------------------------------------------------------------------

/**
 * The part vocabulary the shared skeleton renderer can draw, read from its
 * source: the keys of `SKELETON_PART_ROLES`. `undefined` when the renderer or
 * its vocabulary is missing -- which is a finding, never an empty pass.
 */
export function readSkeletonPartRoles(root = DEFAULT_ROOT) {
  const file = join(root, SKELETON_RENDERER_PATH);
  if (!existsSync(file)) return undefined;
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let roles;
  const visit = (node) => {
    if (roles) return;
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)
      && node.name.text === 'SKELETON_PART_ROLES' && node.initializer) {
      let value = unwrapTransparent(node.initializer);
      if (ts.isCallExpression(value) && value.arguments[0]) value = unwrapTransparent(value.arguments[0]);
      if (!ts.isObjectLiteralExpression(value)) return;
      roles = new Map();
      for (const property of value.properties) {
        if (!ts.isPropertyAssignment(property)) continue;
        const name = property.name.getText(source).replace(/^['"]|['"]$/gu, '');
        const role = unwrapTransparent(property.initializer);
        roles.set(name, ts.isStringLiteral(role) ? role.text : undefined);
      }
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  if (!roles) return undefined;
  return roles;
}

/** Everything under a family owner whose path says it is a skeleton of its own. */
function skeletonPathSigns(resolved) {
  const signs = [];
  for (const dir of resolved.componentDirs) {
    for (const file of walkFiles(dir, isFamilySource)) {
      const rel = toPosix(relative(dir, file));
      if (SKELETON_WORD.test(rel)) signs.push({ what: `owner path \`${rel}\``, line: 1, file });
    }
  }
  return signs;
}

export function measureSkeletonArm(resolved, sources, skins, stampedParts) {
  const roles = readSkeletonPartRoles(resolved.root);
  const handMade = [
    ...skeletonPathSigns(resolved),
    ...sources.flatMap((entry) => entry.skeletonSigns),
    ...skins.flatMap((entry) => entry.skeletonSigns),
    ...[...stampedParts].filter((part) => SKELETON_WORD.test(part))
      .map((part) => ({ what: `\`data-part\` \`${part}\``, line: 0, file: '' })),
  ];
  const invalidRoles = roles
    ? [...roles].filter(([, role]) => !SKELETON_ROLES.has(role)).map(([part]) => part).sort()
    : [];
  const partsWithoutRole = roles
    ? [...stampedParts].filter((part) => !roles.has(part) && !SKELETON_WORD.test(part)).sort()
    : [];
  return {
    renderer: roles !== undefined && roles.size > 0,
    invalidRoles,
    handMade,
    partsWithoutRole,
  };
}

// ---------------------------------------------------------------------------
// The measurement
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// F-69: the DnD admission arm
// ---------------------------------------------------------------------------

/**
 * The props the DnD kernel owns. JSX resolves later attributes over earlier
 * spreads, so ANY later mention of one of these names discards what the kernel
 * put there -- which is why the attachment predicate below is positional and
 * per key rather than "the bag was spread somewhere".
 */
const KERNEL_OWNED_PROPS = new Set([
  'draggable',
  'onDragStart',
  'onDragEnd',
  'onDragOver',
  'onDragLeave',
  'onDrop',
  'onPointerCancel',
  'onKeyDown',
]);

const KERNEL_HOOKS = new Set(['useDragSession', 'useFileDropZone']);
const KERNEL_BAG_CALL = /(?:^|\.)(?:getSourceProps|getTargetProps)$/u;
const KERNEL_BAG_VALUE = /(?:^|\.)dropZoneProps$/u;

/**
 * The keys each kernel-bag contract REQUIRES on the DOM element. A bag whose
 * members are attached BY NAME (`onX={bag.onX}`) is effectively attached only
 * when every one of these names is bound to a member of that same bag --
 * naming most of the bag and hand-writing one handler still discards what the
 * kernel put on the slot the hand-written attribute took.
 */
const NAMED_BAG_CONTRACT = {
  source: ['draggable', 'onDragStart', 'onDragEnd'],
  target: ['onDragOver', 'onDrop'],
  dropZone: ['onDragOver', 'onDragLeave', 'onDrop'],
};
const DRAG_HANDLER_ATTRIBUTES = new Set([
  'onDragStart',
  'onDragOver',
  'onDragEnd',
  'onDragLeave',
  'onDrop',
]);

const isFunctionNode = (node) => !!node && (
  ts.isArrowFunction(node) || ts.isFunctionExpression(node) || ts.isFunctionDeclaration(node)
);

/**
 * Every authored owner of the family, frozen engines INCLUDED. The frozen
 * copies are never accused -- they are reported, so a frozen re-implementation
 * stays a named exception instead of disappearing from the census.
 */
function familyFrozenModules(componentDirs) {
  return componentDirs
    .flatMap((dir) => walkFiles(dir, isFamilyModule))
    .filter((file) => FROZEN_ENGINE_SEGMENT.test(toPosix(file)))
    .sort();
}

/**
 * The DnD shape of ONE authored file: whether it carries an independent HTML5
 * transport, whether it carries an independent external-file drop zone,
 * whether it brings the kernel in at all, and -- per JSX element -- whether
 * what the kernel handed it actually reaches the DOM.
 */
export function analyzeDragAndDrop(file, source = ts.createSourceFile(
  file,
  readFileSync(file, 'utf8'),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
)) {
  const functionsByName = new Map();
  const objectsByName = new Map();
  const initializersByName = new Map();
  const typeMembersByName = new Map();
  const statePairs = [];
  const refNames = new Set();
  const attributeNames = new Set();
  const propBindings = new Map();
  const handlerAttributes = [];
  const elements = [];
  let declaresKernel = false;
  let readsTransfer = false;
  let readsTransferFiles = false;

  const lineOf = (node) => source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
  const text = (node) => node.getText(source);

  const collect = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      const initializer = node.initializer ? unwrapTransparent(node.initializer) : undefined;
      if (isFunctionNode(initializer)) functionsByName.set(node.name.text, initializer);
      /* `useCallback(fn, deps)` and `React.memo(fn)` are the same function
       * under a wrapper; a reader that stopped here would miss every handler
       * the tree actually writes. */
      if (initializer && ts.isCallExpression(initializer) && isFunctionNode(unwrapTransparent(initializer.arguments[0]))) {
        functionsByName.set(node.name.text, unwrapTransparent(initializer.arguments[0]));
      }
      if (initializer && ts.isObjectLiteralExpression(initializer)) objectsByName.set(node.name.text, initializer);
      if (initializer) initializersByName.set(node.name.text, initializer);
      if (node.type && ts.isTypeLiteralNode(node.type)) {
        typeMembersByName.set(
          node.name.text,
          node.type.members.map((member) => (member.name ? text(member.name).replace(/^['"]|['"]$/gu, '') : '')),
        );
      }
    }
    if (ts.isFunctionDeclaration(node) && node.name) functionsByName.set(node.name.text, node);
    if (ts.isVariableDeclaration(node) && ts.isArrayBindingPattern(node.name) && node.initializer) {
      const callee = ts.isCallExpression(node.initializer) ? text(node.initializer.expression) : '';
      if (/(?:^|\.)useState$/u.test(callee)) {
        const [value, setter] = node.name.elements;
        if (value && setter && ts.isBindingElement(value) && ts.isBindingElement(setter)) {
          statePairs.push({ value: text(value.name), setter: text(setter.name) });
        }
      }
    }
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer
      && ts.isCallExpression(node.initializer) && /(?:^|\.)useRef$/u.test(text(node.initializer.expression))) {
      refNames.add(node.name.text);
    }
    if (ts.isCallExpression(node)) {
      const callee = text(node.expression).split('.').pop();
      if (KERNEL_HOOKS.has(callee)) declaresKernel = true;
    }
    /* An import declares the kernel too: the arm accuses "you brought it in
     * and did not attach it", and an unused import is the first way to do
     * exactly that. */
    if (ts.isImportDeclaration(node) && node.importClause?.namedBindings
      && ts.isNamedImports(node.importClause.namedBindings)) {
      for (const element of node.importClause.namedBindings.elements) {
        if (KERNEL_HOOKS.has(element.name.text)) declaresKernel = true;
      }
    }
    if (ts.isPropertyAccessExpression(node)) {
      const name = node.name.text;
      if (name === 'dataTransfer') readsTransfer = true;
      if ((name === 'files' || name === 'items') && /dataTransfer$/u.test(text(node.expression))) {
        readsTransferFiles = true;
      }
    }
    if (ts.isPropertyAssignment(node) && node.name) {
      const key = text(node.name).replace(/^['"]|['"]$/gu, '');
      if (KERNEL_OWNED_PROPS.has(key)) attributeNames.add(key);
    }
    if (ts.isJsxAttribute(node)) {
      const name = attributeName(node);
      attributeNames.add(name);
      if (node.initializer && ts.isJsxExpression(node.initializer) && node.initializer.expression) {
        if (!propBindings.has(name)) propBindings.set(name, []);
        propBindings.get(name).push(node.initializer.expression);
        if (DRAG_HANDLER_ATTRIBUTES.has(name)) {
          handlerAttributes.push({ name, expression: node.initializer.expression });
        }
      }
    }
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      elements.push(node);
    }
    ts.forEachChild(node, collect);
  };
  ts.forEachChild(source, collect);

  /**
   * The function(s) an attribute actually runs. A handler reaches its body
   * through a gate (`cond ? fn : undefined`), through a named local, through
   * `useCallback`, and through ONE PROP HOP -- a row element calling the
   * handler its own component received. All four shapes are live in this tree,
   * and a reader that stopped at the first would measure zero owners.
   */
  const handlerBodies = (expression, depth = 0, seen = new Set()) => {
    const found = [];
    const current = unwrapTransparent(expression);
    if (!current || depth > 3 || seen.has(current)) return found;
    seen.add(current);
    if (ts.isConditionalExpression(current)) {
      return [...handlerBodies(current.whenTrue, depth, seen), ...handlerBodies(current.whenFalse, depth, seen)];
    }
    if (ts.isBinaryExpression(current)) {
      return [...handlerBodies(current.left, depth, seen), ...handlerBodies(current.right, depth, seen)];
    }
    if (isFunctionNode(current)) {
      found.push(current);
      const nested = (node) => {
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
          found.push(...handlerBodies(node.expression, depth + 1, seen));
        }
        ts.forEachChild(node, nested);
      };
      ts.forEachChild(current, nested);
      return found;
    }
    if (ts.isIdentifier(current)) {
      const local = functionsByName.get(current.text);
      if (local) {
        found.push(local);
        return found;
      }
      for (const bound of propBindings.get(current.text) ?? []) {
        found.push(...handlerBodies(bound, depth + 1, seen));
      }
      return found;
    }
    if (ts.isCallExpression(current)) return handlerBodies(current.arguments[0], depth + 1, seen);
    return found;
  };

  const namesCalledIn = (node) => {
    const out = new Set();
    const visit = (current) => {
      if (ts.isCallExpression(current) && ts.isIdentifier(current.expression)) out.add(current.expression.text);
      if (ts.isBinaryExpression(current) && current.operatorToken.kind === ts.SyntaxKind.EqualsToken
        && ts.isPropertyAccessExpression(current.left) && current.left.name.text === 'current'
        && ts.isIdentifier(current.left.expression)) {
        out.add(current.left.expression.text);
      }
      ts.forEachChild(current, visit);
    };
    visit(node);
    return out;
  };

  const namesReadIn = (node) => {
    const out = new Set();
    const visit = (current) => {
      if (ts.isIdentifier(current)) out.add(current.text);
      ts.forEachChild(current, visit);
    };
    visit(node);
    return out;
  };

  const roleBodies = (role) => handlerAttributes
    .filter((attribute) => attribute.name === role)
    .flatMap((attribute) => handlerBodies(attribute.expression));

  const startBodies = roleBodies('onDragStart');
  const dropBodies = roleBodies('onDrop');
  const writtenAtStart = new Set(startBodies.flatMap((body) => [...namesCalledIn(body)]));
  const readAtDrop = new Set(dropBodies.flatMap((body) => [...namesReadIn(body)]));

  /* The session bridge, detected BY SHAPE: a value written in a drag-start
   * handler and read in a drop handler. A renamed quartet, an inline arrow and
   * a brand-new file all satisfy it; a `handle*Drag*` name pattern misses all
   * three. */
  const sessionState = [
    ...statePairs
      .filter(({ value, setter }) => writtenAtStart.has(setter) && readAtDrop.has(value))
      .map(({ value }) => value),
    ...[...refNames].filter((name) => writtenAtStart.has(name) && readAtDrop.has(name)),
  ];

  const hasDragVocabulary = attributeNames.has('draggable')
    || attributeNames.has('onDragStart')
    || readsTransfer;
  const transportOwner = hasDragVocabulary && sessionState.length > 0;
  const dropZoneOwner = !transportOwner
    && attributeNames.has('onDragOver')
    && attributeNames.has('onDrop')
    && readsTransferFiles
    && !attributeNames.has('draggable')
    && !attributeNames.has('onDragStart');

  /** The keys a later spread carries, or `null` when they cannot be enumerated. */
  const enumerableKeys = (expression) => {
    const current = unwrapTransparent(expression);
    if (!current) return null;
    const literal = ts.isObjectLiteralExpression(current)
      ? current
      : (ts.isIdentifier(current) ? objectsByName.get(current.text) : undefined);
    if (literal) {
      const keys = [];
      for (const property of literal.properties) {
        if (ts.isSpreadAssignment(property)) {
          const nested = enumerableKeys(property.expression);
          if (nested === null) return null;
          keys.push(...nested);
          continue;
        }
        if (!property.name) return null;
        keys.push(text(property.name).replace(/^['"]|['"]$/gu, ''));
      }
      return keys;
    }
    if (ts.isIdentifier(current) && typeMembersByName.has(current.text)) {
      return typeMembersByName.get(current.text);
    }
    return null;
  };

  const isKernelBag = (expression) => {
    const current = unwrapTransparent(expression);
    if (!current) return false;
    if (ts.isCallExpression(current)) return KERNEL_BAG_CALL.test(text(current.expression));
    if (ts.isPropertyAccessExpression(current)) return KERNEL_BAG_VALUE.test(text(current));
    return false;
  };

  /**
   * The NAMED_BAG_CONTRACT kind a kernel-bag expression belongs to, or `null`.
   * Resolves THROUGH one local (`const props = drag.getTargetProps(...)`) and
   * through the conditional that detaches a surface (`collapsed ? null :
   * drag.getTargetProps(...)`); every live branch must reach the SAME kind or
   * the walk fails closed. An unrelated receiver resolves to `null` and earns
   * nothing, which is what keeps `onDrop={handlers.onDrop}` a plain pass-through.
   */
  const bagKindOf = (expression, seen = new Set()) => {
    const current = unwrapTransparent(expression);
    if (!current) return null;
    if (ts.isCallExpression(current) && KERNEL_BAG_CALL.test(text(current.expression))) {
      return /getSourceProps$/u.test(text(current.expression)) ? 'source' : 'target';
    }
    if (ts.isPropertyAccessExpression(current) && KERNEL_BAG_VALUE.test(text(current))) {
      return 'dropZone';
    }
    if (ts.isIdentifier(current) && !seen.has(current.text)) {
      seen.add(current.text);
      const initializer = initializersByName.get(current.text);
      return initializer ? bagKindOf(initializer, seen) : null;
    }
    if (ts.isConditionalExpression(current)) {
      const kinds = [current.whenTrue, current.whenFalse]
        .filter((branch) => unwrapTransparent(branch)?.kind !== ts.SyntaxKind.NullKeyword)
        .map((branch) => bagKindOf(branch, seen));
      if (kinds.length === 0 || kinds.some((kind) => kind === null)) return null;
      return kinds.every((kind) => kind === kinds[0]) ? kinds[0] : null;
    }
    return null;
  };

  /** A local assembled FROM a kernel bag, with the keys it overrides. */
  const mergedKernelBag = (expression) => {
    const current = unwrapTransparent(expression);
    if (!current || !ts.isIdentifier(current)) return undefined;
    const literal = objectsByName.get(current.text);
    if (!literal) return undefined;
    let seen = false;
    const overridden = [];
    for (const property of literal.properties) {
      if (ts.isSpreadAssignment(property)) {
        if (isKernelBag(property.expression)) { seen = true; continue; }
        if (!seen) continue;
        const keys = enumerableKeys(property.expression);
        if (keys === null) return { kernel: true, overridden, unverified: true };
        overridden.push(...keys.filter((key) => KERNEL_OWNED_PROPS.has(key)));
        continue;
      }
      if (!seen || !property.name) continue;
      const key = text(property.name).replace(/^['"]|['"]$/gu, '');
      if (KERNEL_OWNED_PROPS.has(key)) overridden.push(key);
    }
    return seen ? { kernel: true, overridden, unverified: false } : undefined;
  };

  /** The kernel bag spread at ONE position, raw or assembled into a local. */
  const kernelSpreadAt = (properties, position) => {
    const property = properties[position];
    if (!property || !ts.isJsxSpreadAttribute(property)) return undefined;
    if (isKernelBag(property.expression)) return { overridden: [], unverified: false };
    return mergedKernelBag(property.expression);
  };

  const attachments = [];
  const namedAttachments = [];
  const delegations = [];
  for (const element of elements) {
    const properties = element.attributes.properties;
    let index = -1;
    let overwritten = [];
    let unverified = false;
    for (let position = 0; position < properties.length; position += 1) {
      const bag = kernelSpreadAt(properties, position);
      if (!bag) continue;
      index = position;
      overwritten = [...bag.overridden];
      unverified = bag.unverified;
      break;
    }
    /* The contract's sanctioned shape puts the source bag and the target bag
     * on the SAME element; their keys are disjoint, so neither overwrites the
     * other and a RUN of adjacent kernel bags is one attachment. Reading the
     * second bag as an opaque later spread reported every row that is both
     * source and target as unverified. Adjacency is the whole licence: a bag
     * separated from the run by any other property is measured where it lands.
     */
    if (index !== -1) {
      for (let bag = kernelSpreadAt(properties, index + 1); bag; bag = kernelSpreadAt(properties, index + 1)) {
        overwritten.push(...bag.overridden);
        unverified = unverified || bag.unverified;
        index += 1;
      }
    }
    if (index === -1) {
      /* Named-member attachment: `onX={bag.onX}` for every key the bag
       * contract requires. The member must be read FROM a receiver the walk
       * resolves to a kernel bag of that contract kind and the accessed name
       * must BE the attribute name; anything else earns nothing, so a named
       * attachment of an unrelated expression is not a kernel claim. */
      const named = new Map();
      for (const property of properties) {
        if (!ts.isJsxAttribute(property)) continue;
        const name = attributeName(property);
        if (!KERNEL_OWNED_PROPS.has(name)) continue;
        if (!property.initializer || !ts.isJsxExpression(property.initializer) || !property.initializer.expression) {
          continue;
        }
        const access = unwrapTransparent(property.initializer.expression);
        if (!ts.isPropertyAccessExpression(access) || access.name.text !== name) continue;
        const kind = bagKindOf(access.expression);
        if (!kind) continue;
        if (!named.has(kind)) named.set(kind, new Set());
        named.get(kind).add(name);
      }
      for (const [kind, keys] of named) {
        namedAttachments.push({
          element: text(element.tagName),
          line: lineOf(element),
          kind,
          missing: NAMED_BAG_CONTRACT[kind].filter((key) => !keys.has(key)),
        });
      }
      for (const property of properties) {
        if (!ts.isJsxAttribute(property)) continue;
        if (!property.initializer || !ts.isJsxExpression(property.initializer)) continue;
        if (!property.initializer.expression) continue;
        if (!isKernelBag(property.initializer.expression)) continue;
        delegations.push({
          component: text(element.tagName),
          prop: attributeName(property),
          line: lineOf(element),
        });
      }
      continue;
    }
    for (let position = index + 1; position < properties.length; position += 1) {
      const property = properties[position];
      if (ts.isJsxAttribute(property)) {
        const name = attributeName(property);
        if (KERNEL_OWNED_PROPS.has(name)) overwritten.push(name);
        continue;
      }
      const keys = enumerableKeys(property.expression);
      if (keys === null) { unverified = true; continue; }
      overwritten.push(...keys.filter((key) => KERNEL_OWNED_PROPS.has(key)));
    }
    attachments.push({
      element: text(element.tagName),
      line: lineOf(element),
      overwritten: [...new Set(overwritten)].sort(),
      unverified,
      effective: overwritten.length === 0 && !unverified,
    });
  }

  /** The components this file declares, for resolving a delegated bag. */
  const declaredComponents = new Set(
    [...functionsByName.keys()].filter((name) => /^[A-Z]/u.test(name)),
  );

  return {
    file,
    transportOwner,
    dropZoneOwner,
    declaresKernel,
    sessionState,
    attachments,
    namedAttachments,
    delegations,
    declaredComponents,
    spreadsProp: (prop) => elements.some((element) => {
      const properties = element.attributes.properties;
      let index = -1;
      for (let position = 0; position < properties.length; position += 1) {
        const property = properties[position];
        if (!ts.isJsxSpreadAttribute(property)) continue;
        if (!new RegExp(`(?:^|\\.)${prop}$`, 'u').test(text(property.expression))) continue;
        index = position;
        break;
      }
      if (index === -1) return false;
      for (let position = index + 1; position < properties.length; position += 1) {
        const property = properties[position];
        if (ts.isJsxAttribute(property) && KERNEL_OWNED_PROPS.has(attributeName(property))) return false;
        if (ts.isJsxSpreadAttribute(property)) {
          const keys = enumerableKeys(property.expression);
          if (keys === null || keys.some((key) => KERNEL_OWNED_PROPS.has(key))) return false;
        }
      }
      return true;
    }),
  };
}

/**
 * The family-level arm. Two decrease-only counts -- independent transports and
 * independent drop zones -- plus the blocking pair: a family that DECLARED the
 * kernel and never effectively attached it. What the walk cannot resolve is
 * printed and fails closed, because a gate that credits what it cannot see
 * certifies an adoption nobody measured.
 */
export function measureDragAndDropArm(resolved, parsed) {
  const { root, componentDirs } = resolved;
  const rel = (file) => toPosix(relative(root, file));
  const analyses = parsed.map(({ file, source }) => analyzeDragAndDrop(file, source));

  const rows = [];
  let wired = analyses.some((entry) => entry.attachments.some((element) => element.effective))
    || analyses.some((entry) => entry.namedAttachments.some((attachment) => attachment.missing.length === 0));

  for (const entry of analyses) {
    for (const attachment of entry.namedAttachments) {
      if (attachment.missing.length > 0) {
        rows.push(
          `OVERWRITTEN ${rel(entry.file)}:${attachment.line} <${attachment.element}> ${attachment.missing.join(',')}`,
        );
      }
    }
    for (const delegation of entry.delegations) {
      const owner = analyses.find((candidate) => candidate.declaredComponents.has(delegation.component));
      if (owner && owner.spreadsProp(delegation.prop)) {
        wired = true;
        continue;
      }
      rows.push(`DELEGATED-UNVERIFIED ${rel(entry.file)}:${delegation.line} <${delegation.component}>`);
    }
    for (const element of entry.attachments) {
      if (element.unverified) {
        rows.push(`SPREAD-UNVERIFIED ${rel(entry.file)}:${element.line} <${element.element}>`);
        continue;
      }
      if (!element.effective) {
        rows.push(
          `OVERWRITTEN ${rel(entry.file)}:${element.line} <${element.element}> ${element.overwritten.join(',')}`,
        );
      }
    }
  }

  const frozen = familyFrozenModules(componentDirs)
    .map((file) => ({ file, ...analyzeDragAndDrop(file) }))
    .filter((entry) => entry.transportOwner || entry.dropZoneOwner)
    .map((entry) => ({
      file: rel(entry.file),
      reason: entry.transportOwner ? 'frozen engine, transport owner' : 'frozen engine, drop zone owner',
    }));

  return {
    transportOwners: analyses.filter((entry) => entry.transportOwner).map((entry) => rel(entry.file)),
    dropZoneOwners: analyses.filter((entry) => entry.dropZoneOwner).map((entry) => rel(entry.file)),
    declared: analyses.some((entry) => entry.declaresKernel),
    wired,
    rows,
    frozen,
  };
}

export function measureFamily(resolved, { producers, compiled, scopes } = {}) {
  const { family, root } = resolved;
  const measured = producers && compiled ? null : sharedChannelProducers();
  const producerSet = producers ?? measured.producers;
  const compiledSet = compiled ?? measured?.compiled ?? new Set();
  const declarationScopes = scopes ?? sharedDeclarationScopes();

  /* One parse per source: the anatomy reader and the DnD arm read the same
   * tree rather than building it twice. */
  const parsed = resolved.sources.map((file) => ({
    file,
    source: ts.createSourceFile(
      file,
      readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    ),
  }));
  const sources = parsed.map(({ file, source }) => analyzeSource(file, source));
  const skins = resolved.skins.map((file) => analyzeSkin(file));
  const dnd = measureDragAndDropArm(resolved, parsed);
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
  /* A default part a caller may rename (P-79) is read through the owned
   * `data-component` stamped on the same element, never through the part. */
  const consumedComponents = union(skins, 'components');
  const anchoredParts = new Set(sources.flatMap((entry) => entry.componentAnchors)
    .filter((anchor) => consumedComponents.has(anchor.component))
    .map((anchor) => anchor.part));
  const consumedParts = new Set([...union(skins, 'parts'), ...anchoredParts]);
  const consumedStates = union(skins, 'states');
  const skinSelectsVariant = skins.some((skin) => skin.selectsVariant);
  const ownsClass = (token) => {
    const remainder = withoutTier(token.slice(token.indexOf('-') + 1));
    return remainder === family || remainder.startsWith(`${family}-`);
  };
  const variantComposedFrom = new Set();
  let familyVariantSelections = 0;
  for (const tokens of skins.flatMap((skin) => skin.variantCompounds)) {
    const backer = tokens
      .filter((token) => !ownsClass(token))
      .map((token) => composedPrimitiveStampsVariant(token, root))
      .find(Boolean);
    if (backer) variantComposedFrom.add(backer);
    else familyVariantSelections += 1;
  }
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

  /* The whole Modern-scope skin corpus `resolveFamily` admitted -- engine skins
   * AND presentation-tier skins -- exactly the corpus every other arm reads. A
   * narrower filter here understated the debt of any family whose channels are
   * read from a presentation skin (data-table read 1 of its 4). */
  /* Only the producers whose scope can reach THIS family: a channel declared
   * solely under another family's selector is not written for this one. */
  const reachableProducers = producersReaching({
    producers: producerSet,
    scopes: declarationScopes,
    compiled: compiledSet,
    ownsClass,
    corpus: resolved.skins,
  });
  const readWithoutProducer = classifyReadWithoutProducer(resolved.skins, reachableProducers);
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
  const maskAlphaStops = skins.flatMap((skin) => skin.maskAlphaStops);
  const antReads = skins.flatMap((skin) => skin.antReads);
  const inlineStyleViolations = sources.flatMap((entry) => entry.inlineStyleViolations);
  const visualLiterals = sources.flatMap((entry) => entry.visualLiterals);
  const skeleton = measureSkeletonArm(resolved, sources, skins, stampedParts);
  const fanOut = fanOutFor(family, readNames);
  const layoutSensitive = readLayoutSensitiveFamilies().find((entry) => entry.family === family);
  const adaptSlot = layoutSensitive
    ? measureAdaptSlot(layoutSensitive, root, readPostureVocabulary()).findings
    : [];
  const measuredOwners = resolved.componentDirs.map((dir) => toPosix(relative(root, dir)));
  if (layoutSensitive && measuredOwners.length === 1 && measuredOwners[0] !== layoutSensitive.owner) {
    adaptSlot.push(
      `${family}: owner -- the cut measures ${measuredOwners[0]} but the adaptation contract declares ${layoutSensitive.owner}`,
    );
  }

  return {
    family,
    root,
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
      variantContract: stampsVariantAttribute ? skinSelectsVariant : familyVariantSelections === 0,
      stateContract: stampsStateAttribute === skinUsesStateAttribute,
      stateGoverned: skinUsesStateAttribute ? usesPartAttributes : true,
      a11yProbes: resolved.a11yProbes.length,
      a11yAssertions: resolved.a11yAssertions ?? 0,
      unmatchedPinnedSkins: resolved.unmatchedPinnedSkins ?? [],
      dndKernelDeclared: dnd.declared,
      dndKernelWired: dnd.wired,
      adaptSlot,
      skeleton,
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
      dndTransportOwners: dnd.transportOwners.length,
      dndDropZoneOwners: dnd.dropZoneOwners.length,
    },
    detail: {
      vocabularies,
      legacyNamespaceClasses,
      partsStampedNotConsumed,
      partsConsumedNotStamped,
      statesConsumedNotStamped,
      unpairedStatePseudo,
      colorLiteralsInSkin,
      maskAlphaStops,
      variantComposedFrom: [...variantComposedFrom].sort(),
      partsReadThroughComponent: [...anchoredParts].sort(),
      readWithoutProducer: readWithoutProducer.debt,
      readChannels: [...readNames].sort(),
      fanOut,
      dndTransportOwners: dnd.transportOwners,
      dndDropZoneOwners: dnd.dropZoneOwners,
      dndUnverified: dnd.rows,
      dndFrozen: dnd.frozen,
      owners: resolved.componentDirs.map((dir) => toPosix(relative(root, dir))),
      ownerCandidates: resolved.ownerCandidates ?? [],
      pinnedOwner: resolved.pinnedOwner,
      pinnedSkins: resolved.pinnedSkins,
      unmatchedPinnedSkins: resolved.unmatchedPinnedSkins ?? [],
      foreignSkins: resolved.foreignSkins ?? [],
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
  dndTransportOwners: 'files carrying their own HTML5 drag transport instead of the shared kernel (F-69)',
  dndDropZoneOwners: 'files carrying their own external-file drop zone instead of the shared kernel (F-69)',
});

/**
 * The BLOCKING arms a row may carry as declared opening debt while its cut is
 * open, and the count each one measures. Everything NOT in this table is
 * unwaivable: an ambiguous owner, an empty corpus, a missing or invalid
 * skeleton vocabulary and a skin pin that names no file all break the
 * measurement itself, and a broken measurement is never a state a work order
 * may declare.
 */
const OPEN_CUT_LABEL = Object.freeze({
  inlineStyleViolations: 'inline paints in the family source',
  visualLiterals: 'colour literals in the family source',
  antReads: 'Ant Design private variables read by the family skin (F-67)',
  anatomyStamped: 'the family stamps no `data-part`',
  skinReadsAnatomy: 'the family skin selects no `[data-part]`',
  variantContract: '`data-variant` is on exactly one side of the contract',
  stateContract: '`data-state` is on exactly one side of the contract',
  stateGoverned: 'the skin decides state through `[data-state]` with no `partAttributes` call (F-37)',
  adaptSlot: 'adapt-slot findings on a layout-sensitive family',
  skeletonHandMade: 'hand-made skeleton constructs',
  skeletonPartsWithoutRole: '`data-part` values the shared skeleton renderer has no role for',
  dndKernelUnwired: 'the DnD kernel declared and never effectively attached (F-69)',
  a11yAssertions: 'the family owns no executable accessibility assertion',
});

export function blockingDebt(measured) {
  const b = measured.blocking;
  return {
    inlineStyleViolations: b.inlineStyleViolations.length,
    visualLiterals: b.visualLiterals.length,
    antReads: b.antReads.length,
    anatomyStamped: b.stampsAnatomy ? 0 : 1,
    skinReadsAnatomy: b.skinReadsAnatomy ? 0 : 1,
    variantContract: b.variantContract ? 0 : 1,
    stateContract: b.stateContract ? 0 : 1,
    stateGoverned: b.stateGoverned ? 0 : 1,
    adaptSlot: (b.adaptSlot ?? []).length,
    skeletonHandMade: (b.skeleton?.handMade ?? []).length,
    skeletonPartsWithoutRole: (b.skeleton?.partsWithoutRole ?? []).length,
    dndKernelUnwired: b.dndKernelDeclared && !b.dndKernelWired ? 1 : 0,
    a11yAssertions: b.a11yAssertions === 0 ? 1 : 0,
  };
}

const OPEN_CUT_ARMS = Object.freeze(Object.keys(blockingDebt({
  blocking: {
    inlineStyleViolations: [], visualLiterals: [], antReads: [], stampsAnatomy: true,
    skinReadsAnatomy: true, variantContract: true, stateContract: true, stateGoverned: true,
    a11yAssertions: 1, dndKernelDeclared: false, dndKernelWired: false, adaptSlot: [], skeleton: undefined,
  },
})));

/**
 * What an open row carries today, for the run's own output. A row is OPEN when
 * its work order has admitted it at a measured debt; the notes are evidence,
 * not a pass, and `judgeFamily` still reddens the moment a declared count and
 * the tree disagree in either direction.
 */
export function describeOpenDebt(measured, pinned) {
  const open = pinned?.openCut;
  if (!open) return [];
  const measuredDebt = blockingDebt(measured);
  const carried = OPEN_CUT_ARMS
    .filter((arm) => (measuredDebt[arm] ?? 0) > 0)
    .map((arm) => `${arm}=${measuredDebt[arm]}`);
  return [
    `${measured.family}: admitted by ${open.workOrder} at a declared opening debt of `
      + `${carried.length > 0 ? carried.join(' ') : '(none)'} -- ${open.note}`,
  ];
}

export function judgeFamily(measured, pinned) {
  const findings = [];
  const { family, blocking, ratchets, denominators, detail } = measured;
  const open = pinned?.openCut;
  const declaredDebt = open?.debt ?? {};
  const measuredDebt = blockingDebt(measured);

  /* A waivable BLOCKING arm. With no open cut it speaks exactly as it always
   * has, one finding per violation. With one, the arm's COUNT is pinned like a
   * ratchet: growth is the family's to fix, and a shrink has to be written
   * down, so an open row can never drift in either direction unnoticed. */
  const waivable = (arm, emit) => {
    const count = measuredDebt[arm] ?? 0;
    if (!open) {
      findings.push(...emit());
      return;
    }
    const pin = declaredDebt[arm] ?? 0;
    if (count > pin) {
      findings.push(
        `${family}: open-cut debt \`${arm}\` GREW from ${pin} to ${count} -- ${OPEN_CUT_LABEL[arm]}. `
          + `An open cut declares the debt it inherited, never debt it added: ${JSON.stringify(emit().slice(0, 3))}`,
      );
    } else if (count < pin) {
      findings.push(
        `${family}: open-cut debt \`${arm}\` SHRANK from ${pin} to ${count} -- good news that still has to be `
          + 'written down: lower it in the row\'s `openCut.debt` (an open cut is decrease-only too)',
      );
    }
  };

  if (denominators.skinFiles === 0) {
    findings.push(`${family}: resolves to zero Modern skin files -- an empty corpus is never a pass`);
  }
  if (denominators.sourceFiles === 0) {
    findings.push(`${family}: resolves to zero authored source files -- an empty corpus is never a pass`);
  }
  for (const name of detail.unmatchedPinnedSkins ?? []) {
    findings.push(
      `${family}: the roster pins skin \`${name}\` and no skin directory of that name exists -- `
        + 'a skin pin declares which paint IS the family, so a pin that names nothing is a claim with no file behind it',
    );
  }
  if ((pinned?.skins || (pinned?.owner && basename(pinned.owner) !== family)) && !pinned?.namingNote) {
    findings.push(
      `${family}: the roster pins an owner or skin whose name is not the family id and states no \`namingNote\` -- `
        + 'a divergence between the family id, its owner folder and its skin folder is admitted only with its reason written down',
    );
  }

  waivable('inlineStyleViolations', () => blocking.inlineStyleViolations.map((violation) =>
    `${family}: BLOCKING inline paint -- \`style\` sets \`${violation.property}\` at ${toPosix(violation.file)}:${violation.line}. `
      + 'The skin paints; the TSX stamps state. Only a runtime-computed `--ds-*` custom property may travel inline'));
  waivable('visualLiterals', () => blocking.visualLiterals.map((literal) =>
    `${family}: BLOCKING visual literal \`${literal.value}\` at ${toPosix(literal.file)}:${literal.line} -- a colour belongs to a channel, not to a component source`));
  waivable('antReads', () => blocking.antReads.map((read) =>
    `${family}: BLOCKING \`${read.name}\` in ${toPosix(read.file)} -- an Ant Design private variable is not a channel of this design system (F-67)`));
  if (blocking.owners !== 1) {
    findings.push(
      `${family}: BLOCKING resolves to ${blocking.owners} component owner(s) ${JSON.stringify(detail.owners)} -- `
        + 'a family has exactly one source owner; resolution is exact or refused, never a guess between two',
    );
  }
  waivable('anatomyStamped', () => (blocking.stampsAnatomy
    ? []
    : [`${family}: BLOCKING the family stamps no \`data-part\`; the anatomy contract is mandatory`]));
  waivable('skinReadsAnatomy', () => (blocking.skinReadsAnatomy
    ? []
    : [`${family}: BLOCKING the family skin selects no \`[data-part]\`; it paints something this contract cannot see`]));
  waivable('variantContract', () => (blocking.variantContract
    ? []
    : [`${family}: BLOCKING \`data-variant\` is on exactly one side of the contract -- stamped without a rule, or painted without a stamp`]));
  waivable('stateContract', () => (blocking.stateContract
    ? []
    : [`${family}: BLOCKING \`data-state\` is on exactly one side of the contract -- stamped with no rule, or painted with no stamp`]));
  waivable('stateGoverned', () => (blocking.stateGoverned
    ? []
    : [`${family}: BLOCKING the skin decides state through \`[data-state]\` but the source never calls \`partAttributes\` -- `
      + 'one place decides when a part is pressed, or none does (F-37)']));
  waivable('adaptSlot', () => (blocking.adaptSlot ?? []).map((finding) => `${family}: BLOCKING adapt-slot ${finding}`));
  const skeleton = blocking.skeleton;
  if (skeleton) {
    if (!skeleton.renderer) {
      findings.push(
        `${family}: BLOCKING anatomy-derived-skeleton -- the shared renderer ${SKELETON_RENDERER_PATH} is missing or declares no \`SKELETON_PART_ROLES\``,
      );
    }
    for (const part of skeleton.invalidRoles) {
      findings.push(`${family}: BLOCKING anatomy-derived-skeleton -- the renderer gives \`${part}\` a role outside ${JSON.stringify([...SKELETON_ROLES])}`);
    }
    waivable('skeletonHandMade', () => skeleton.handMade.map((sign) => {
      const where = sign.file ? ` at ${toPosix(relative(measured.root ?? DEFAULT_ROOT, sign.file))}:${sign.line}` : '';
      return `${family}: BLOCKING anatomy-derived-skeleton -- hand-made skeleton: ${sign.what}${where}. `
        + 'A family does not draw its own loading state; `AnatomySkeleton` derives it from the family anatomy';
    }));
    waivable('skeletonPartsWithoutRole', () => skeleton.partsWithoutRole.map((part) =>
      `${family}: BLOCKING anatomy-derived-skeleton -- \`data-part\` \`${part}\` has no role in the shared skeleton renderer; `
        + `give it one in \`SKELETON_PART_ROLES\` (${SKELETON_RENDERER_PATH}) with the anatomy change, or the loading state drifts from the component`));
  }
  /* F-69: the arm means exactly one thing -- you brought the kernel in and did
   * not attach it. The `declared` conjunct is what keeps it silent on a family
   * that has not adopted yet; the two ratchets carry the "must reach zero"
   * half, and reaching zero is the consolidation criterion. */
  waivable('dndKernelUnwired', () => (blocking.dndKernelDeclared && !blocking.dndKernelWired
    ? [`${family}: BLOCKING the DnD kernel is declared and never effectively attached -- `
      + 'JSX resolves later attributes and later spreads over an earlier one, so a spread bag whose '
      + 'kernel-owned props are overwritten (or followed by a spread this gate cannot enumerate) never '
      + `reaches the DOM${detail.dndUnverified?.length ? `: ${JSON.stringify(detail.dndUnverified).slice(0, 400)}` : ''}`]
    : []));
  waivable('a11yAssertions', () => (blocking.a11yAssertions === 0
    ? [`${family}: BLOCKING the family owns no executable accessibility assertion; a cut without an a11y probe is not verified`]
    : []));

  if (!pinned) {
    findings.push(
      `${family}: is not in baseline/index.json. A family enters the cut contract by being pinned, `
        + `with its cut's work order: ${JSON.stringify(ratchets)}`,
    );
    return findings;
  }

  if (open) {
    if (typeof open.workOrder !== 'string' || typeof open.note !== 'string') {
      findings.push(
        `${family}: \`openCut\` states no \`workOrder\` and \`note\` -- an admitted family says which work order owns its debt and why`,
      );
    }
    for (const arm of Object.keys(declaredDebt)) {
      if (!OPEN_CUT_ARMS.includes(arm)) {
        findings.push(
          `${family}: \`openCut.debt\` declares \`${arm}\`, which is no BLOCKING arm this gate measures `
            + `(${JSON.stringify(OPEN_CUT_ARMS)}) -- a declaration the gate cannot read waives nothing and hides that it waives nothing`,
        );
      }
    }
    if (OPEN_CUT_ARMS.every((arm) => (measuredDebt[arm] ?? 0) === 0)) {
      findings.push(
        `${family}: \`openCut\` is declared and the family now holds every BLOCKING arm -- close the row by removing \`openCut\``,
      );
    }
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
  const channelProducers = sharedChannelProducers();
  const producerSet = producers ?? channelProducers.producers;
  const scopes = sharedDeclarationScopes();
  const findings = [];
  const measurements = [];
  const open = [];
  for (const family of families) {
    const pinned = baseline.families?.[family];
    const measured = measureFamily(resolveFamily(family, root, pinned ?? {}), {
      producers: producerSet,
      compiled: channelProducers.compiled,
      scopes,
    });
    measurements.push(measured);
    findings.push(...judgeFamily(measured, pinned));
    open.push(...describeOpenDebt(measured, pinned));
  }
  const routed = judgeRoutedDeclarations(baseline, roster, only ? [] : measurements);
  findings.push(...routed.findings);
  return { findings, measurements, baseline, open, routed: routed.evidence };
}

/**
 * A catalog fan-out declaration names a family id. When that id is a roster
 * row the `fanOutUnreached` ratchet checks the claim every run. When it is
 * NOT, nobody checks it and nobody ever will -- so the id has to be registered
 * in `baseline.routed` with the owner it belongs to. The registration is a
 * measurement, not a waiver: the evidence line states, from this run's own
 * measurements, which roster families actually read the declared channels.
 */
export function judgeRoutedDeclarations(baseline, roster, measurements = [], declared = declaredFanOutFamilies()) {
  const findings = [];
  const evidence = [];
  const registered = new Map((baseline.routed ?? []).map((entry) => [entry.family, entry]));
  for (const [family, { controls, channels }] of declared) {
    if (roster.includes(family)) continue;
    const entry = registered.get(family);
    if (!entry) {
      findings.push(
        `family-cut: the control catalog declares family \`${family}\` in the fan-out of ${controls.join(', ')}, `
          + 'and no roster row and no `routed` entry owns that id -- a fan-out claim no family measures is a claim '
          + 'nobody can ever check. Register it in baseline/index.json `routed` with the owner it belongs to, '
          + 'or make it a roster row',
      );
      continue;
    }
    if (typeof entry.route !== 'string' || typeof entry.note !== 'string') {
      findings.push(`family-cut: \`routed\` entry \`${family}\` states no \`route\` and \`note\``);
    }
    const readers = measurements
      .filter((measured) => (measured.detail.readChannels ?? []).some((channel) => channels.has(channel)))
      .map((measured) => measured.family);
    evidence.push(
      `${family} declared by ${controls.join(', ')} -> ${entry.route}: ${entry.note}`
        + ` [channels ${[...channels].sort().join(' ')}; read today by ${readers.length > 0 ? readers.join(', ') : '(no roster family)'}]`,
    );
  }
  for (const entry of baseline.routed ?? []) {
    if (roster.includes(entry.family)) {
      findings.push(
        `family-cut: \`routed\` entry \`${entry.family}\` is now a roster row -- the gate measures its fan-out itself; remove the entry`,
      );
    } else if (!declared.has(entry.family)) {
      findings.push(
        `family-cut: \`routed\` entry \`${entry.family}\` matches no catalog fan-out declaration -- `
          + 'the registration outlived the claim it records; remove it',
      );
    }
  }
  return { findings, evidence };
}

function main() {
  const args = process.argv.slice(2);
  const familyArg = args.find((arg) => arg.startsWith('--family='));
  const only = familyArg ? familyArg.slice('--family='.length) : undefined;

  const { findings, measurements, open, routed } = collectFindings({ only });

  if (args.includes('--json')) {
    console.log(JSON.stringify({ findings, measurements, open, routed }, null, 2));
    process.exit(findings.length > 0 ? 1 : 0);
  }

  for (const arm of OWED_ARMS) {
    console.log(`family-cut OWED ${arm.id} -> ${arm.owner}: ${arm.reason}`);
  }
  for (const entry of routed ?? []) {
    console.log(`family-cut ROUTED ${entry}`);
  }
  /* Printed before the verdict, because what the DnD walk cannot resolve is
   * evidence whether or not the run goes red. */
  for (const measured of measurements) {
    for (const row of measured.detail.dndUnverified ?? []) {
      console.log(`family-cut DND ${measured.family}: ${row}`);
    }
    for (const frozen of measured.detail.dndFrozen ?? []) {
      console.log(`family-cut EXCLUDED -- ${measured.family}: ${frozen.file} (${frozen.reason})`);
    }
  }
  if (findings.length > 0) {
    console.error('family-cut FAILED:');
    for (const finding of findings) console.error(`  - ${finding}`);
    process.exit(1);
  }
  for (const entry of open ?? []) {
    console.log(`family-cut OPEN -- ${entry}`);
  }
  for (const measured of measurements) {
    for (const foreign of measured.detail.foreignSkins ?? []) {
      console.log(`family-cut EXCLUDED -- ${measured.family}: ${foreign.skin} (${foreign.reason})`);
    }
    const ratchets = Object.entries(measured.ratchets)
      .map(([key, value]) => `${key}=${value}`)
      .join(' ');
    console.log(
      `family-cut OK -- ${measured.family}: ${measured.denominators.skinFiles} skin file(s), `
        + `${measured.denominators.sourceFiles} source file(s), ${measured.denominators.channelsRead} channels read; ${ratchets}`,
    );
  }
  /* Two numbers, never one: a family admitted at a declared opening debt has
   * NOT passed the cut contract, and a summary that folded it into the held
   * count would read as a green the tree has not earned. */
  const admitted = (open ?? []).length;
  console.log(
    `family-cut OK -- ${measurements.length - admitted} family cut(s) hold their contract; `
      + `${admitted} admitted with declared opening debt (${measurements.length} rows)`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
