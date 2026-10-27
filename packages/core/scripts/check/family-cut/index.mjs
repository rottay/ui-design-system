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
import { callerElementOf, callerPartIndex } from './p88/index.mjs';
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
    owner: 'WO-INV-03 (DONE 4bf21162e)',
    reason:
      'axe needs a rendered DOM; a static gate cannot run it. The live acceptance ran under WO-INV-03 (done 2026-09-22), and the per-family debt maps are measured by identity: the 2026-09-25 close audit read 16 of 18 FAM-08 maps empty and the remaining 4 nodes drained in 7abe19e52. What this gate CAN prove, and does, is the blocking arm `a11yAssertions`: the family EXECUTES at least one accessibility assertion of its own -- an assertion inside a suppressed suite is text, not evidence',
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

/**
 * `data-part={undefined}` renders no attribute on any engine, so it stamps no part,
 * literal or dynamic. Only the bare `undefined` identifier qualifies.
 */
function isStaticallyUndefined(initializer) {
  const value = initializer && ts.isJsxExpression(initializer) ? initializer.expression : initializer;
  const node = unwrapTransparent(value);
  return Boolean(node) && ts.isIdentifier(node) && node.text === 'undefined';
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
  const anatomyHandoffs = [];
  const imports = new Map();
  const composedRenders = [];
  /* G1: the same `parts`, split by where the literal is written. A JSX `data-part` attribute is
   * kept with its element's coordinates so it can be matched against the pass-through census's
   * caller enumeration; every other channel (partAttributes, a spread object's property) can
   * never be a caller-part element and is native anatomy by construction. */
  const partOccurrences = [];
  const nonElementParts = new Set();
  /* F1: the `'data-part'` property of an object handed to a COMPOSED tag is the composed
   * component's to stamp, so it is not native anatomy by construction (see measureFamily). */
  const handoffPartProperties = new Set();
  /* Non-enumerable, so the measured shapes never carry a syntax node. */
  const withElement = (entry, element) => Object.defineProperty(entry, 'element', { value: element });

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
      /* The anchors a skin can name this element by: the parts and classes
       * the family hands it literally, and the parts it hands down in an object
       * prop. A part becomes an anchor only once the composed component's own
       * source is shown to read it and stamp it (see `composedConsumption`). */
      let composedRender;
      if (/^[A-Z]/u.test(tag)) {
        const attributes = node.attributes.properties.filter(ts.isJsxAttribute);
        const literals = (name) => attributes.filter((attribute) => attributeName(attribute) === name)
          .flatMap((attribute) => attributeLiterals(attribute));
        composedRender = withElement({
          tag,
          parts: literals('data-part'),
          handoffs: [],
          classes: literals('className').flatMap((value) => value.split(/\s+/u)).filter(Boolean),
        }, node);
        composedRenders.push(composedRender);
      }
      if (SKELETON_WORD.test(tag) && tag !== SKELETON_RENDERER_EXPORT) {
        skeletonSigns.push({ what: `element \`<${tag}>\``, line: lineOf(node) });
      }
      /* A family can hand a part DOWN: `<ResizeHandle anatomy={{'data-part':
       * 'gutter'}} />` names the part but renders no element, so the stamp is
       * the composed component's to make. The prop NAME travels with the
       * hand-off -- it is what proves the spread order on the other side. */
      if (/^[A-Z]/u.test(tag)) {
        for (const attribute of node.attributes.properties.filter(ts.isJsxAttribute)) {
          const initializer = attribute.initializer;
          if (!initializer || !ts.isJsxExpression(initializer) || !initializer.expression) continue;
          const object = unwrapTransparent(initializer.expression);
          if (!ts.isObjectLiteralExpression(object)) continue;
          const keyed = new Map(object.properties.filter(ts.isPropertyAssignment)
            .map((property) => [property.name.getText(source).replace(/^['"]|['"]$/gu, ''), property]));
          const partProperty = keyed.get('data-part');
          if (!partProperty) continue;
          handoffPartProperties.add(partProperty);
          for (const part of literalsIn(partProperty.initializer)) {
            anatomyHandoffs.push(withElement({
              part,
              tag,
              prop: attributeName(attribute),
              decidesState: keyed.has('data-state'),
              line: lineOf(node),
            }, node));
            /* Kept on THIS instance only; it anchors the composed-part credit
             * once the component is shown to read this prop and stamp the part. */
            composedRender.handoffs.push({ prop: attributeName(attribute), part });
          }
        }
      }
    }
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const specifier = node.moduleSpecifier.text;
      const clause = node.importClause;
      if (clause?.name) imports.set(clause.name.text, specifier);
      const named = clause?.namedBindings;
      if (named && ts.isNamedImports(named)) {
        for (const element of named.elements) imports.set(element.name.text, specifier);
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
          for (const value of found) nonElementParts.add(value);
        }
      }
    }
    /* An anatomy attribute is as often authored as a property of a spread
     * object (`{ 'data-variant': v, ...partAttributes(...) }`) as it is written
     * on the element. A reader that only saw JSX attributes would report a
     * family that stamps nothing. */
    if (ts.isPropertyAssignment(node)) {
      const key = node.name.getText(source).replace(/^['"]|['"]$/gu, '');
      if (key === 'data-part' && !isStaticallyUndefined(node.initializer)) {
        stampsPartAttribute = true;
        const found = literalsIn(node.initializer);
        if (found.length === 0) dynamicParts += 1;
        for (const value of found) parts.add(value);
        if (!handoffPartProperties.has(node)) for (const value of found) nonElementParts.add(value);
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
      if (name === 'data-part' && !isStaticallyUndefined(node.initializer)) {
        stampsPartAttribute = true;
        const found = attributeLiterals(node);
        if (found.length === 0) dynamicParts += 1;
        for (const value of found) parts.add(value);
        const element = node.parent?.parent;
        if (element && (ts.isJsxOpeningElement(element) || ts.isJsxSelfClosingElement(element))) {
          const at = { line: lineOf(element), tag: element.tagName.getText(source) };
          for (const value of found) partOccurrences.push(withElement({ ...at, part: value }, element));
        } else {
          for (const value of found) nonElementParts.add(value);
        }
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
    partOccurrences,
    nonElementParts,
    states,
    variants,
    classTokens,
    componentAnchors,
    inlineStyleViolations,
    visualLiterals: visualLiterals.map((entry) => ({ ...entry, file })),
    skeletonSigns: skeletonSigns.map((entry) => ({ ...entry, file })),
    usesPartAttributes,
    dynamicParts,
    anatomyHandoffs,
    imports,
    composedRenders,
    propSpreads: readPropSpreads(source),
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
  /* Every part read keeps the parts and classes of the selector that reaches
   * it: they name the elements the read can sit on or under. */
  const partReads = [];
  for (const match of text.matchAll(/\[data-part\s*[~^*$|]?=\s*['"]([^'"]+)['"]\s*\]/gu)) {
    partReads.push({ part: match[1], ...selectorAnchors(text, match.index, match.index + match[0].length) });
  }
  /* Every state occurrence keeps the simple-selector-sequence that owns it:
   * whether a state is stamped is a question about the ELEMENT the rule lands
   * on, and only the owning compound names that element. */
  const stateCompounds = [];
  for (const match of text.matchAll(/\[data-state\s*[~^*$|]?=\s*['"]([^'"]+)['"]/gu)) {
    const compound = owningCompound(text, match.index);
    const tokens = prefixedClassesIn(compound);
    const parts = partValuesIn(compound);
    const line = text.slice(0, match.index).split('\n').length;
    for (const token of match[1].split(/\s+/u).filter(Boolean)) {
      states.add(token);
      stateCompounds.push({ state: token, tokens, parts, line, file });
    }
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

  return { file, parts, partReads, states, stateCompounds, classTokens, components, selectsVariant, variantCompounds, colorLiterals, maskAlphaStops, unpairedPseudo, antReads, skeletonSigns };
}

/**
 * Where each spread-in prop lands on the elements a component renders, and
 * whether a `partAttributes` spread already ran on that element when it did.
 *
 * Order is the whole question for a handed-down part: the kernel stamps
 * `data-part` itself, so only a prop spread AFTER it survives to the DOM. A
 * component that spread the prop first would render its own part name, the
 * skin's `[data-part='gutter']` rule would match nothing, and crediting the
 * family for that stamp would be crediting an element that does not exist.
 */
function readPropSpreads(source) {
  const isPartStampCall = (node) => {
    const expression = unwrapTransparent(node);
    if (!ts.isCallExpression(expression)) return false;
    const callee = expression.expression.getText(source);
    return callee === 'partAttributes' || callee.endsWith('.partAttributes');
  };
  /* What competes with the handed-down part is any `data-part` the component
   * writes itself, whether the kernel serializes it or the component spells it
   * out. Both forms are the same collision. */
  const declaresPart = (object) => object.properties.some((property) =>
    (ts.isSpreadAssignment(property) && isPartStampCall(property.expression))
    || (ts.isPropertyAssignment(property)
      && property.name.getText(source).replace(/^['"]|['"]$/gu, '') === 'data-part'));
  const stampObjects = new Set();
  const collect = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const initializer = unwrapTransparent(node.initializer);
      if (ts.isObjectLiteralExpression(initializer) && declaresPart(initializer)) {
        stampObjects.add(node.name.text);
      }
    }
    ts.forEachChild(node, collect);
  };
  collect(source);

  const spreads = [];
  const walk = (node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      let stamped = false;
      for (const attribute of node.attributes.properties) {
        if (!ts.isJsxSpreadAttribute(attribute)) continue;
        const expression = unwrapTransparent(attribute.expression);
        if (isPartStampCall(expression)
          || (ts.isObjectLiteralExpression(expression) && declaresPart(expression))
          || (ts.isIdentifier(expression) && stampObjects.has(expression.text))) {
          stamped = true;
          continue;
        }
        if (ts.isIdentifier(expression)) spreads.push({ name: expression.text, stampedBefore: stamped });
      }
    }
    ts.forEachChild(node, walk);
  };
  walk(source);
  return spreads;
}

/**
 * The simple-selector-sequence that owns the attribute at `index` -- the
 * compound that decides WHICH element the rule paints.
 *
 * `compoundClassTokensBefore` cannot answer this for a state: the governed
 * F-37 idiom nests the attribute inside `:is([data-state~='x'], :hover)`, so
 * the character to its left is `(` and a plain walk-back returns nothing on
 * every family in the tree. Stepping out of the functional pseudo and
 * continuing through its host is what recovers the compound -- and it must be
 * the compound, not the selector: in `.ds-button .ds-x[data-state~='x']` the
 * `.ds-button` is an ancestor, and an ancestor stamps nothing on `.ds-x`.
 */
function owningCompound(text, index) {
  let at = index;
  let depth = 0;
  let brackets = 0;
  let compound = '';
  /* The local compound is closed once a boundary is crossed; everything left
   * of it belongs to another element or another selector. */
  let closed = false;
  /* Whitespace is a descendant combinator only when a simple selector really
   * sits to its left -- beside a `,`, a `>` or a `(` it is only formatting. */
  let pendingDescendant = false;
  let descendant = false;
  let listComma = false;
  while (at > 0) {
    const char = text[at - 1];
    const keep = () => { if (!closed) compound = char + compound; at -= 1; };
    if (brackets > 0) {
      if (char === '[') brackets -= 1;
      keep();
      continue;
    }
    if (char === ']') { brackets += 1; keep(); continue; }
    if (char === ')') { depth += 1; keep(); continue; }
    if (char === '(' && depth > 0) { depth -= 1; keep(); continue; }
    if (char === '(') {
      /* An unmatched `(` is the functional pseudo this occurrence sits inside
       * -- `:is([data-state~='x'], :hover)`. Its host compound is the element
       * the rule paints, so drop the pseudo's name and measure the host. */
      at -= 1;
      while (at > 0 && /[\w-]/u.test(text[at - 1])) at -= 1;
      while (at > 0 && text[at - 1] === ':') at -= 1;
      const host = descendant ? '' : owningCompound(text, at);
      return `${host} ${withoutParens(compound)}`;
    }
    if (depth === 0) {
      if (/[{};]/u.test(char)) break;
      if (char === ',') { closed = true; listComma = true; pendingDescendant = false; at -= 1; continue; }
      if (/[>+~]/u.test(char)) { closed = true; descendant = true; pendingDescendant = false; at -= 1; continue; }
      if (/\s/u.test(char)) { closed = true; pendingDescendant = true; at -= 1; continue; }
      if (pendingDescendant) { descendant = true; pendingDescendant = false; }
    }
    keep();
  }
  if (listComma && compound === '') return '';
  return withoutParens(compound);
}

/**
 * The parts and classes of one complex selector up to and including the
 * compound that holds `[start, end)`, the read itself excluded. A `:not()`
 * group names an element the rule does NOT land on, so it anchors nothing.
 */
function selectorAnchors(text, start, end) {
  let from = start;
  let depth = 0;
  while (from > 0) {
    const char = text[from - 1];
    if (char === ')') depth += 1;
    else if (char === '(') depth = Math.max(0, depth - 1);
    else if (/[{};]/u.test(char) || (char === ',' && depth === 0)) break;
    from -= 1;
  }
  let to = end;
  depth = 0;
  while (to < text.length) {
    const char = text[to];
    if (char === '(' || char === '[') depth += 1;
    else if (char === ')' || char === ']') {
      if (depth === 0) break;
      depth -= 1;
    } else if (depth === 0 && /[\s>+~,{]/u.test(char)) break;
    to += 1;
  }
  let selector = `${text.slice(from, start)} ${text.slice(end, to)}`;
  while (/:not\([^()]*\)/u.test(selector)) selector = selector.replace(/:not\([^()]*\)/gu, '');
  return {
    anchorParts: [...selector.matchAll(/\[data-part\s*[~^*$|]?=\s*['"]([^'"]+)['"]/gu)].map((match) => match[1]),
    anchorClasses: [...selector.matchAll(/\.(-?[_a-zA-Z][\w-]*)/gu)].map((match) => match[1]),
  };
}

/** A compound with every parenthesised group removed. */
function withoutParens(text) {
  let compound = text;
  while (/\([^()]*\)/u.test(compound)) compound = compound.replace(/\([^()]*\)/gu, '');
  return compound;
}

/** The `data-part` values named in one compound. */
function partValuesIn(compound) {
  return [...compound.matchAll(/\[data-part\s*=\s*['"]([^'"]+)['"]/gu)].map((match) => match[1]);
}

/** The prefixed class tokens of one compound, ignoring anything inside parens. */
function prefixedClassesIn(text) {
  const compound = withoutParens(text);
  const tokens = [];
  for (const prefix of CLASS_PREFIXES) {
    for (const match of compound.matchAll(new RegExp(`\\.(${prefix}-[a-zA-Z0-9]+(?:-{1,2}[a-zA-Z0-9]+)*)`, 'gu'))) {
      tokens.push(match[1]);
    }
  }
  return tokens;
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
  return prefixedClassesIn(text.slice(start, index));
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

const partKeyedBackerCache = new Map();

/**
 * The states a component stamps on a part its CALLER named. `<ResizeHandle
 * anatomy={{'data-part': 'gutter'}} />` is the family declaring the part and
 * delegating the stamp; both halves are provable from source, so the credit is
 * too -- but only when the import names the component's own owner folder. A
 * barrel specifier resolves to a directory full of other people's stamps and
 * proves nothing about this tag.
 */
function composedComponentStampsPart(handoff, specifier, fromFile) {
  if (!specifier.startsWith('.')) return undefined;
  const dir = resolve(dirname(fromFile), specifier);
  if (basename(dir) !== kebabOf(handoff.tag)) return undefined;
  if (!['index.tsx', 'index.ts'].some((entry) => existsSync(join(dir, entry)))) return undefined;
  const key = `${dir}\0${handoff.prop}`;
  if (!partKeyedBackerCache.has(key)) {
    const analyzed = walkFiles(dir, isFamilySource).map((file) => analyzeSource(file));
    const stampers = analyzed.filter((entry) => entry.stampsStateAttribute);
    const spreads = analyzed.flatMap((entry) => entry.propSpreads)
      .filter((entry) => entry.name === handoff.prop);
    partKeyedBackerCache.set(key, stampers.length > 0
      && spreads.length > 0
      && spreads.every((entry) => entry.stampedBefore)
      ? { name: basename(dir), states: new Set(stampers.flatMap((entry) => [...entry.states])) }
      : undefined);
  }
  return partKeyedBackerCache.get(key);
}

const composedPartStampCache = new Map();
const consumptionCache = new Map();
const moduleSourceCache = new Map();

/** The parsed TSX of a module file, or undefined when it does not exist. */
function moduleSource(file) {
  if (!moduleSourceCache.has(file)) {
    moduleSourceCache.set(file, existsSync(file)
      ? ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
      : undefined);
  }
  return moduleSourceCache.get(file);
}

/** The module file a specifier names: relative, `@/` (src) or `@ui/` (src/components). A package is not followed. */
function resolveModuleSpecifier(specifier, fromFile, root) {
  let base;
  if (specifier.startsWith('.')) base = resolve(dirname(fromFile), specifier);
  else if (specifier.startsWith('@/')) base = join(root, 'src', specifier.slice(2));
  else if (specifier.startsWith('@ui/')) base = join(root, 'src', 'components', specifier.slice(4));
  else return undefined;
  return [`${base}.tsx`, `${base}.ts`, join(base, 'index.tsx'), join(base, 'index.ts')]
    .find((candidate) => existsSync(candidate));
}

const hasModifier = (node, kind) => node.modifiers?.some((modifier) => modifier.kind === kind) ?? false;
const isExportedStatement = (node) => hasModifier(node, ts.SyntaxKind.ExportKeyword);

/** The identifier a binding name declares as `name`, searching through destructuring patterns. */
function bindingNamed(nameNode, name) {
  if (!nameNode) return undefined;
  if (ts.isIdentifier(nameNode)) return nameNode.text === name ? nameNode : undefined;
  if (ts.isObjectBindingPattern(nameNode) || ts.isArrayBindingPattern(nameNode)) {
    for (const element of nameNode.elements) {
      const found = ts.isBindingElement(element) ? bindingNamed(element.name, name) : undefined;
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * The LEXICAL declaration `name` resolves to from `from`: the innermost
 * parameter, variable, function or import that declares it. Returns the
 * declaring identifier, so a nested callback's `item` never resolves to the
 * component's props and a shadowing name hides the outer one.
 */
function declarationOf(name, from) {
  for (let node = from.parent; node; node = node.parent) {
    if (ts.isFunctionLike(node) && node.parameters) {
      for (const parameter of node.parameters) {
        const found = bindingNamed(parameter.name, name);
        if (found) return found;
      }
    }
    const statements = ts.isSourceFile(node) || ts.isBlock(node) || ts.isModuleBlock(node)
      || ts.isCaseClause(node) || ts.isDefaultClause(node) ? node.statements : undefined;
    if (!statements) continue;
    for (const statement of statements) {
      if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          const found = bindingNamed(declaration.name, name);
          if (found) return found;
        }
      } else if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) && statement.name?.text === name) {
        return statement.name;
      } else if (ts.isImportDeclaration(statement) && statement.importClause && !statement.importClause.isTypeOnly) {
        const clause = statement.importClause;
        if (clause.name?.text === name) return clause.name;
        if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
          const element = clause.namedBindings.elements.find((entry) => entry.name.text === name);
          if (element) return element.name;
        }
      }
    }
  }
  return undefined;
}

/** `{ file, node }` for an EXPORTED name of a module, through `export { … } from`, `export *` and `export default X`. */
function resolveExport(file, name, root, seen = new Set()) {
  const key = `${file}\0${name}`;
  if (seen.has(key)) return undefined;
  seen.add(key);
  const source = moduleSource(file);
  if (!source) return undefined;
  for (const statement of source.statements) {
    if (name === 'default' && ts.isExportAssignment(statement) && !statement.isExportEquals) {
      const expression = unwrapTransparent(statement.expression);
      return ts.isIdentifier(expression) ? resolveModuleName(file, expression.text, root, seen) : { file, node: expression };
    }
    if (ts.isFunctionDeclaration(statement) && isExportedStatement(statement)) {
      const isDefault = hasModifier(statement, ts.SyntaxKind.DefaultKeyword);
      if (name === 'default' ? isDefault : !isDefault && statement.name?.text === name) return { file, node: statement };
    }
    if (ts.isVariableStatement(statement) && isExportedStatement(statement) && name !== 'default') {
      const declaration = statement.declarationList.declarations
        .find((entry) => ts.isIdentifier(entry.name) && entry.name.text === name);
      if (declaration) return { file, node: declaration };
    }
    if (ts.isExportDeclaration(statement) && !statement.isTypeOnly && statement.exportClause
      && ts.isNamedExports(statement.exportClause)) {
      const element = statement.exportClause.elements.find((entry) => entry.name.text === name && !entry.isTypeOnly);
      if (!element) continue;
      const local = (element.propertyName ?? element.name).text;
      if (!statement.moduleSpecifier) return resolveModuleName(file, local, root, seen);
      const target = resolveModuleSpecifier(statement.moduleSpecifier.text, file, root);
      return target ? resolveExport(target, local, root, seen) : undefined;
    }
  }
  if (name === 'default') return undefined;
  for (const statement of source.statements) {
    if (ts.isExportDeclaration(statement) && statement.moduleSpecifier && !statement.exportClause && !statement.isTypeOnly) {
      const target = resolveModuleSpecifier(statement.moduleSpecifier.text, file, root);
      const found = target && resolveExport(target, name, root, seen);
      if (found) return found;
    }
  }
  return undefined;
}

/** `{ file, node }` for a MODULE-scope name: its top-level declaration, or the export its import names. */
function resolveModuleName(file, name, root, seen = new Set()) {
  const source = moduleSource(file);
  if (!source) return undefined;
  const declared = declarationOf(name, source.statements[0] ?? source);
  return declared ? resolveDeclared(file, declared, root, seen) : undefined;
}

/** `{ file, node }` for a declaring identifier at module scope: a local declaration, or the import's target export. */
function resolveDeclared(file, identifier, root, seen = new Set()) {
  const holder = identifier.parent;
  if (ts.isFunctionDeclaration(holder)) return { file, node: holder };
  if (ts.isVariableDeclaration(holder) && holder.name === identifier && ts.isSourceFile(holder.parent.parent.parent)) {
    return { file, node: holder };
  }
  const importDeclaration = ts.isImportClause(holder) ? holder.parent
    : ts.isImportSpecifier(holder) ? holder.parent.parent.parent : undefined;
  if (!importDeclaration || !ts.isStringLiteral(importDeclaration.moduleSpecifier)) return undefined;
  const target = resolveModuleSpecifier(importDeclaration.moduleSpecifier.text, file, root);
  if (!target) return undefined;
  const exported = ts.isImportClause(holder) ? 'default' : (holder.propertyName ?? holder.name).text;
  return resolveExport(target, exported, root, seen);
}

/** The object literal an expression holds, directly or through a module-scope const. */
function objectLiteralOf(file, expression, root) {
  const node = expression && unwrapTransparent(expression);
  if (!node) return undefined;
  if (ts.isObjectLiteralExpression(node)) return { file, object: node };
  if (!ts.isIdentifier(node)) return undefined;
  const resolved = resolveModuleName(file, node.text, root);
  const initializer = resolved && ts.isVariableDeclaration(resolved.node) && resolved.node.initializer
    && unwrapTransparent(resolved.node.initializer);
  return initializer && ts.isObjectLiteralExpression(initializer) ? { file: resolved.file, object: initializer } : undefined;
}

const propertyNamed = (object, name) => object.properties
  .find((property) => (ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property))
    && property.name.getText().replace(/^['"]|['"]$/gu, '') === name);

/**
 * The render function a resolved component binding stands for, followed
 * through `forwardRef`/`memo`, `Object.assign`, an alias, and the engine
 * factories down to the MODERN implementation (`createSyncEngineComponent(n,
 * { modern: X })`, `createEngineComponent(n, { modern: () => import('…') })`).
 * A frozen engine, a loader it cannot read, or any other shape is undefined:
 * not followed, no consumption.
 */
function componentTarget(resolved, root, seen = new Set(), bindings = undefined) {
  if (!resolved || FROZEN_ENGINE_SEGMENT.test(toPosix(resolved.file))) return undefined;
  const { file, node } = resolved;
  if (seen.has(node)) return undefined;
  seen.add(node);
  const bound = (fn) => ({ file, fn, bindings, key: bindings ? `${toPosix(file)}:${fn.pos}|${bindings.key}` : fn });
  if (ts.isFunctionDeclaration(node)) return node.body ? bound(node) : undefined;
  const expression = unwrapTransparent(ts.isVariableDeclaration(node) ? node.initializer : node);
  if (!expression) return undefined;
  if (ts.isArrowFunction(expression) || ts.isFunctionExpression(expression)) return bound(expression);
  if (ts.isIdentifier(expression)) {
    const declared = declarationOf(expression.text, expression);
    /* Inside a factory, the returned component is a LOCAL const: follow it with the same bindings. */
    if (declared && ts.isVariableDeclaration(declared.parent) && !ts.isSourceFile(declared.parent.parent.parent)) {
      return componentTarget({ file, node: declared.parent }, root, seen, bindings);
    }
    return componentTarget(resolveModuleName(file, expression.text, root), root, seen);
  }
  if (!ts.isCallExpression(expression)) return undefined;
  const callee = expression.expression.getText();
  const [first, second] = expression.arguments;
  if (/(^|\.)(forwardRef|memo)$/u.test(callee) || callee === 'Object.assign') {
    return componentTarget({ file, node: first }, root, seen, bindings);
  }
  if (/(^|\.)(createSyncEngineComponent|createEngineComponent)$/u.test(callee)) {
    const holder = objectLiteralOf(file, second, root);
    const modern = holder && propertyNamed(holder.object, 'modern');
    if (!modern) return undefined;
    const value = ts.isShorthandPropertyAssignment(modern) ? modern.name : unwrapTransparent(modern.initializer);
    if (ts.isIdentifier(value)) return componentTarget(resolveModuleName(holder.file, value.text, root), root, seen);
    /* `() => import('./engines/modern')`, optionally `.then((m) => ({ default: m.X }))`. */
    if (!ts.isArrowFunction(value) || ts.isBlock(value.body)) return undefined;
    let call = unwrapTransparent(value.body);
    let exported = 'default';
    if (ts.isCallExpression(call) && ts.isPropertyAccessExpression(call.expression) && call.expression.name.text === 'then') {
      const mapper = call.arguments[0];
      const mapped = mapper && ts.isArrowFunction(mapper) && !ts.isBlock(mapper.body) && unwrapTransparent(mapper.body);
      const picked = mapped && ts.isObjectLiteralExpression(mapped) && propertyNamed(mapped, 'default');
      const access = picked && ts.isPropertyAssignment(picked) && unwrapTransparent(picked.initializer);
      if (!access || !ts.isPropertyAccessExpression(access)) return undefined;
      exported = access.name.text;
      call = unwrapTransparent(call.expression.expression);
    }
    if (!ts.isCallExpression(call) || call.expression.kind !== ts.SyntaxKind.ImportKeyword
      || !call.arguments[0] || !ts.isStringLiteralLike(call.arguments[0])) {
      return undefined;
    }
    const target = resolveModuleSpecifier(call.arguments[0].text, holder.file, root);
    return target ? componentTarget(resolveExport(target, exported, root), root, seen) : undefined;
  }
  /* A component FACTORY (`createSemanticIcon(SsrGlyph, …)`): an in-repo module function whose
   * `return` is a component. Its render function is read with the factory's parameters BOUND
   * to this call's arguments, so `const Glyph = glyph` resolves to the caller's `SsrGlyph`. */
  if (ts.isIdentifier(expression.expression)) {
    const factory = resolveModuleName(file, expression.expression.text, root);
    const factoryFn = factory && (ts.isFunctionDeclaration(factory.node) ? factory.node
      : ts.isVariableDeclaration(factory.node) && factory.node.initializer
        && [unwrapTransparent(factory.node.initializer)].find((value) => ts.isArrowFunction(value) || ts.isFunctionExpression(value)));
    if (!factoryFn?.body || !ts.isBlock(factoryFn.body) || FROZEN_ENGINE_SEGMENT.test(toPosix(factory.file))) return undefined;
    const parameters = new Map();
    factoryFn.parameters.forEach((parameter, index) => {
      if (ts.isIdentifier(parameter.name) && expression.arguments[index]) {
        parameters.set(parameter.name, { file, expression: expression.arguments[index] });
      }
    });
    const returned = factoryFn.body.statements.filter(ts.isReturnStatement).map((statement) => statement.expression);
    if (returned.length !== 1 || !returned[0]) return undefined;
    const factoryBindings = { parameters, key: `${toPosix(file)}:${expression.pos}` };
    return componentTarget({ file: factory.file, node: returned[0] }, root, seen, factoryBindings);
  }
  return undefined;
}

/**
 * The COMMITTED RUNTIME PIN that admits a package component as a stamp: the
 * icon system's contract test renders every exported semantic and catalog icon
 * and every package glyph it enumerates with a caller `data-part` and asserts
 * it lands on the rendered `<svg>`. A package hop counts as consumed only for a
 * glyph the manifest enumerates (`specifier#export`), and only while BOTH the
 * manifest and its contract test exist: no pin, no evidence, no stamp.
 */
export const CALLER_PART_PIN = 'src/graphics/icons/tests/caller-part-pin.json';
export const CALLER_PART_PIN_CONTRACT = 'src/graphics/icons/tests/caller-part-pin.contract.test.tsx';
const callerPartPinCache = new Map();
function pinnedPackageGlyphs(root) {
  if (!callerPartPinCache.has(root)) {
    let glyphs = new Set();
    const manifest = join(root, CALLER_PART_PIN);
    if (existsSync(manifest) && existsSync(join(root, CALLER_PART_PIN_CONTRACT))) {
      try {
        const parsed = JSON.parse(readFileSync(manifest, 'utf8'));
        if (Array.isArray(parsed.glyphs)) glyphs = new Set(parsed.glyphs.filter((entry) => typeof entry === 'string'));
      } catch {
        glyphs = new Set();
      }
    }
    callerPartPinCache.set(root, glyphs);
  }
  return callerPartPinCache.get(root);
}

/**
 * What a factory-parameter tag is bound to at the call site: an in-repo
 * component target, `{ pinned }` for a package export the runtime pin
 * enumerates, or undefined (an unpinned package, or anything unresolvable).
 */
function boundComponent(argument, root) {
  const value = unwrapTransparent(argument.expression);
  if (!ts.isIdentifier(value)) return undefined;
  const declared = declarationOf(value.text, value);
  if (!declared) return undefined;
  const holder = declared.parent;
  const importDeclaration = ts.isImportClause(holder) ? holder.parent
    : ts.isImportSpecifier(holder) ? holder.parent.parent.parent : undefined;
  const specifier = importDeclaration && ts.isStringLiteral(importDeclaration.moduleSpecifier)
    ? importDeclaration.moduleSpecifier.text
    : undefined;
  if (specifier && !resolveModuleSpecifier(specifier, argument.file, root)) {
    if (specifier.startsWith('.') || specifier.startsWith('@/') || specifier.startsWith('@ui/')) return undefined;
    const exported = ts.isImportClause(holder) ? 'default' : (holder.propertyName ?? holder.name).text;
    const key = `${specifier}#${exported}`;
    return pinnedPackageGlyphs(root).has(key) ? { pinned: key } : undefined;
  }
  return componentTarget(resolveDeclared(argument.file, declared, root), root);
}

const NO_CONSUMPTION = Object.freeze({ direct: false, props: new Set() });

/**
 * The literal a constant expression evaluates to, through const aliases,
 * imports and object-literal member paths (`TYPOGRAPHY_DEFAULTS.text.as`), or
 * undefined when any step is not a constant this reader can see.
 */
function constantOf(expression, root, depth = 0) {
  const node = expression && unwrapTransparent(expression);
  if (!node || depth > 8) return undefined;
  if (ts.isStringLiteralLike(node) || ts.isObjectLiteralExpression(node)) return node;
  if (ts.isIdentifier(node)) {
    const declared = declarationOf(node.text, node);
    if (!declared) return undefined;
    const holder = declared.parent;
    if (ts.isVariableDeclaration(holder) && holder.name === declared && holder.initializer) {
      return constantOf(holder.initializer, root, depth + 1);
    }
    if (ts.isImportClause(holder) || ts.isImportSpecifier(holder)) {
      const resolved = resolveDeclared(node.getSourceFile().fileName, declared, root);
      return resolved && ts.isVariableDeclaration(resolved.node)
        ? constantOf(resolved.node.initializer, root, depth + 1)
        : undefined;
    }
    return undefined;
  }
  if (ts.isPropertyAccessExpression(node)) {
    const object = constantOf(node.expression, root, depth + 1);
    const member = object && ts.isObjectLiteralExpression(object) && propertyNamed(object, node.name.text);
    return member && ts.isPropertyAssignment(member) ? constantOf(member.initializer, root, depth + 1) : undefined;
  }
  return undefined;
}
/** `a ?? b`, `a || b`, `a && b` and `c ? a : b` evaluate to one of their operands. */
const VALUE_CHOICE_OPERATORS = new Set([
  ts.SyntaxKind.QuestionQuestionToken,
  ts.SyntaxKind.BarBarToken,
  ts.SyntaxKind.AmpersandAmpersandToken,
]);
const isValueChoice = (node) => ts.isConditionalExpression(node)
  || (ts.isBinaryExpression(node) && VALUE_CHOICE_OPERATORS.has(node.operatorToken.kind));
const choices = (node) => (ts.isConditionalExpression(node) ? [node.whenTrue, node.whenFalse] : [node.left, node.right]);
const keyText = (name) => name.getText().replace(/^['"]|['"]$/gu, '');

/**
 * A component whose render function returns `null` unless its caller names it
 * or declares it decorative: it destructures `label` and `decorative` from its
 * props and guards an early `return null` on values derived from BOTH. The
 * semantic icon is that shape -- an icon with neither (or with both) renders
 * nothing, so a caller part handed to it lands on no element.
 */
const accessibilityGateCache = new Map();
function rendersOnlyNamedOrDecorative(target) {
  const fn = target?.fn;
  if (!fn?.body || !ts.isBlock(fn.body)) return false;
  if (accessibilityGateCache.has(fn)) return accessibilityGateCache.get(fn);
  const props = fn.parameters[0];
  const tainted = { label: new Set(), decorative: new Set() };
  const seed = (pattern) => {
    for (const element of pattern.elements) {
      const key = element.propertyName ? keyText(element.propertyName) : element.name.getText();
      if ((key === 'label' || key === 'decorative') && ts.isIdentifier(element.name)) tainted[key].add(element.name.text);
    }
  };
  const reads = (node, names) => {
    let found = false;
    const visit = (child) => {
      if (ts.isIdentifier(child) && names.has(child.text)) found = true;
      else ts.forEachChild(child, visit);
    };
    visit(node);
    return found;
  };
  if (props && ts.isObjectBindingPattern(props.name)) seed(props.name);
  const returnsNull = (statement) => (ts.isReturnStatement(statement)
    ? statement.expression?.kind === ts.SyntaxKind.NullKeyword
    : ts.isBlock(statement) && statement.statements.some(returnsNull));
  let gated = false;
  for (const statement of fn.body.statements) {
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        const fromProps = props && ts.isIdentifier(props.name) && declaration.initializer
          && ts.isIdentifier(declaration.initializer) && declaration.initializer.text === props.name.text;
        if (ts.isObjectBindingPattern(declaration.name)) {
          if (fromProps) seed(declaration.name);
        } else if (ts.isIdentifier(declaration.name) && declaration.initializer) {
          for (const key of ['label', 'decorative']) {
            if (reads(declaration.initializer, tainted[key])) tainted[key].add(declaration.name.text);
          }
        }
      }
    } else if (ts.isIfStatement(statement) && returnsNull(statement.thenStatement)
      && reads(statement.expression, tainted.label) && reads(statement.expression, tainted.decorative)) {
      gated = true;
    }
  }
  accessibilityGateCache.set(fn, gated);
  return gated;
}

/** A value no static reading settles: the runtime owns it. */
const UNSETTLED = Symbol('unsettled');

/**
 * The constant an expression evaluates to, or UNSETTLED. Literals, `undefined`,
 * `void x`, `!x`, a conditional whose test is constant, and `||` / `&&` / `??`
 * whose left side is constant are settled; everything else is the runtime's.
 */
function settledValue(expression) {
  const node = expression && unwrapTransparent(expression);
  if (!node) return undefined;
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isIdentifier(node) && node.text === 'undefined') return undefined;
  if (ts.isVoidExpression(node)) return undefined;
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.ExclamationToken) {
    const operand = settledValue(node.operand);
    return operand === UNSETTLED ? UNSETTLED : !operand;
  }
  if (ts.isConditionalExpression(node)) {
    const test = settledValue(node.condition);
    return test === UNSETTLED ? UNSETTLED : settledValue(test ? node.whenTrue : node.whenFalse);
  }
  if (ts.isBinaryExpression(node)) {
    const operator = node.operatorToken.kind;
    const left = settledValue(node.left);
    if (left === UNSETTLED) return UNSETTLED;
    if (operator === ts.SyntaxKind.BarBarToken) return left ? left : settledValue(node.right);
    if (operator === ts.SyntaxKind.AmpersandAmpersandToken) return left ? settledValue(node.right) : left;
    if (operator === ts.SyntaxKind.QuestionQuestionToken) return left === null || left === undefined ? settledValue(node.right) : left;
  }
  return UNSETTLED;
}

/** `decorative` is supplied only when it is provably `true`: the guard reads `=== true`. */
const declaresDecorative = (expression) => settledValue(expression) === true;

/**
 * `label` as the guard reads it: 'named', 'empty' or -- when no static reading
 * settles it -- 'runtime'. A conditional whose test is the runtime's still
 * settles when both arms agree (`open ? '' : undefined` is empty either way).
 */
function labelReading(expression) {
  const value = settledValue(expression);
  if (value !== UNSETTLED) return typeof value === 'string' && value.trim().length > 0 ? 'named' : 'empty';
  const node = unwrapTransparent(expression);
  if (ts.isConditionalExpression(node)) {
    const [whenTrue, whenFalse] = [labelReading(node.whenTrue), labelReading(node.whenFalse)];
    if (whenTrue === whenFalse) return whenTrue;
  }
  return 'runtime';
}

/**
 * What a call site hands a component under `decorative` and `label`: the props
 * the component RECEIVES, one of four readings per name.
 *
 *   'unset'     no setter writes the name: it is proven absent.
 *   'absent'    a setter writes it with a value that is no declaration or no
 *               name (`decorative={false}`, `label=""`): proven absent, and --
 *               unlike 'unset' -- it overwrites what an earlier setter wrote
 *               when the props are spread on.
 *   'supplied'  `decorative` provably `true`; a `label` that settles to a name
 *               ('named') or that only the runtime can settle ('runtime': the
 *               call site did hand a name expression, and an authored name
 *               that happens to be empty at runtime is the component's own
 *               guard to catch, not anatomy this gate can prove dead).
 *   'unknown'   the name's last setter is a spread nobody can read: it may
 *               carry the name with any value, or not at all.
 *
 * The setters are taken in source order and, per name, the LAST one decides: an
 * explicit attribute after a spread wins, and a spread after an explicit
 * attribute wins for the names it carries. `setters` is that ordered list --
 * `{ name, value }` for an attribute (`value` undefined for a bare attribute or
 * an empty `{}`; `bare` true for the former) and `{ spread }` for a spread or a
 * `createElement` props object.
 *
 * A spread is read as far as it can be proven:
 *   an object literal   writes exactly the names it writes, in order;
 *   the props or rest   of the enclosing component (`kindOf`, its lexical
 *                       reader) carries a name only if it was not destructured
 *                       out, and then only what THIS component's caller
 *                       provably did NOT hand it (`received`, the same readings
 *                       one call site up): 'unset' leaves the name as it
 *                       stands, 'absent' overwrites it as absent. The caller's
 *                       state is proof of ABSENCE only -- a name the caller
 *                       does hand through stays 'unknown', so a component
 *                       still answers for a name at its own call site. With no
 *                       known caller the name is 'unknown';
 *   anything else       leaves both names 'unknown'.
 */
function receivedNameAndDecorative(setters, kindOf, received) {
  const state = { decorative: 'unset', label: 'unset' };
  const assign = (name, value, bare = false) => {
    if (name === 'decorative') {
      state.decorative = bare || declaresDecorative(value) ? 'supplied' : 'absent';
    } else if (name === 'label') {
      const reading = bare ? 'empty' : labelReading(value);
      state.label = reading === 'empty' ? 'absent' : reading;
    }
  };
  const spread = (expression) => {
    const node = expression && unwrapTransparent(expression);
    if (node && ts.isObjectLiteralExpression(node)) {
      for (const member of node.properties) {
        if (ts.isSpreadAssignment(member)) {
          spread(member.expression);
        } else if (member.name && ts.isComputedPropertyName(member.name) && !ts.isStringLiteralLike(member.name.expression)) {
          state.decorative = 'unknown';
          state.label = 'unknown';
        } else if (ts.isPropertyAssignment(member)) {
          assign(keyText(member.name), member.initializer);
        } else if (ts.isShorthandPropertyAssignment(member)) {
          assign(member.name.text, member.name);
        } else if (member.name) {
          /* A method or an accessor under one of the two names is a value only the runtime settles. */
          if (keyText(member.name) === 'decorative') state.decorative = 'absent';
          else if (keyText(member.name) === 'label') state.label = 'runtime';
        }
      }
      return;
    }
    const rest = node && kindOf?.(node)?.rest;
    for (const name of ['decorative', 'label']) {
      if (rest?.has(name)) continue;
      /* The component's own props: a name its caller never wrote is not in the spread at all. */
      const carried = rest ? received?.[name] : undefined;
      if (carried !== 'unset') state[name] = carried === 'absent' ? 'absent' : 'unknown';
    }
  };
  for (const setter of setters) {
    if ('spread' in setter) spread(setter.spread);
    else assign(setter.name, setter.value, setter.bare);
  }
  return state;
}

/**
 * Whether a call site gives such a component what it needs to render: EXACTLY
 * ONE of `decorative` and a name is supplied AND the other is PROVEN absent.
 * 'unknown' on either side is no credit: the guard renders nothing when it is
 * handed both, so a name that may be there cannot be assumed away.
 */
function suppliesNameOrDecorative(setters, kindOf, received) {
  const { decorative, label } = receivedNameAndDecorative(setters, kindOf, received);
  const absent = (reading) => reading === 'unset' || reading === 'absent';
  const named = label === 'named' || label === 'runtime';
  return (decorative === 'supplied' && absent(label)) || (named && absent(decorative));
}

/** A JSX element's attributes as the ordered setters {@link suppliesNameOrDecorative} reads. */
function jsxSetters(attributes) {
  return attributes.map((attribute) => {
    if (ts.isJsxSpreadAttribute(attribute)) return { spread: attribute.expression };
    const initializer = attribute.initializer;
    return {
      name: attributeName(attribute),
      value: initializer && ts.isJsxExpression(initializer) ? initializer.expression : initializer,
      bare: !initializer,
    };
  });
}

/**
 * What ONE component function does with the anatomy its caller hands it --
 * `direct` when the caller's `data-part` reaches a DOM `data-part`, `props`
 * naming each object prop whose `'data-part'` reaches one. Every identifier is
 * resolved LEXICALLY to its declaration, so only the component's own first
 * parameter is the caller's props; a nested callback, a handler, a helper or a
 * shadowing name binds nothing. A stamp is an intrinsic element (a lowercase
 * tag, a string `createElement` tag, or a polymorphic tag bound to a string or
 * to a prop with an intrinsic default). A composed child is followed by name
 * into its own component: the caller's part counts only where that child is
 * itself shown to stamp it. What cannot be followed earns nothing.
 */
function functionConsumption(target, root, active = new Set(), received = undefined) {
  if (!target) return NO_CONSUMPTION;
  const cacheKey = target.key ?? target.fn;
  /* What the component stamps can turn on what its caller handed it (N1), so the reading is cached per caller state. */
  const receivedKey = received ? `${received.decorative}|${received.label}` : '';
  const cached = consumptionCache.get(cacheKey);
  if (cached?.has(receivedKey)) return cached.get(receivedKey);
  if (active.has(cacheKey)) return NO_CONSUMPTION;
  active.add(cacheKey);
  const result = { direct: false, props: new Set() };
  const { tagOf, kindOf, partValue, spreadSetter } = componentScope(target, root);
  const record = (setter) => {
    if (setter === 'direct') result.direct = true;
    else if (setter?.startsWith('prop:')) result.props.add(setter.slice(5));
  };
  /** Records one rendered element: its attributes in source order as [name | undefined (spread), expression], and its N1 setters. */
  const element = (tag, attributes, setters) => {
    const kind = tagOf(tag);
    if (!kind) return;
    /* A child that renders nothing without a name or `decorative` stamps nothing unless this call site supplies one. */
    if (kind !== 'intrinsic' && !kind.pinned && rendersOnlyNamedOrDecorative(kind)
      && !suppliesNameOrDecorative(setters, kindOf, received)) {
      return;
    }
    let last;
    for (const [name, expression] of attributes) {
      if (name === undefined) last = spreadSetter(expression) ?? last;
      else if (name === 'data-part') last = (expression && partValue(expression)) ?? 'own';
    }
    if (kind === 'intrinsic') {
      record(last);
      return;
    }
    /* A pinned package glyph is proven, at runtime, to stamp the caller part on its svg. */
    const child = kind.pinned
      ? { direct: true, props: new Set() }
      : functionConsumption(kind, root, active, receivedNameAndDecorative(setters, kindOf, received));
    if (child.direct) record(last);
    /* A hand-off reaches the child under the SAME prop name; the last setter wins. */
    for (const name of child.props) {
      let carried;
      for (const [attribute, expression] of attributes) {
        if (attribute === undefined) {
          const spread = kindOf(expression);
          if (spread?.rest) carried = spread.rest.has(name) ? undefined : `prop:${name}`;
        } else if (attribute === name) {
          const value = expression && kindOf(expression);
          carried = value?.object ? `prop:${value.object}` : undefined;
        }
      }
      record(carried);
    }
  };
  const stamp = (node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      element(node.tagName, node.attributes.properties.map((attribute) => (ts.isJsxSpreadAttribute(attribute)
        ? [undefined, attribute.expression]
        : [attributeName(attribute), attribute.initializer && ts.isJsxExpression(attribute.initializer)
          ? attribute.initializer.expression
          : undefined])), jsxSetters(node.attributes.properties));
    }
    /* `createElement(tag, props)` renders its props object exactly like a JSX element. */
    if (ts.isCallExpression(node) && /(^|\.)createElement$/u.test(node.expression.getText()) && node.arguments[1]) {
      element(node.arguments[0], [[undefined, node.arguments[1]]], [{ spread: node.arguments[1] }]);
    }
    ts.forEachChild(node, stamp);
  };
  if (target.fn.parameters[0] && target.fn.body) stamp(target.fn.body);
  active.delete(cacheKey);
  if (!consumptionCache.has(cacheKey)) consumptionCache.set(cacheKey, new Map());
  consumptionCache.get(cacheKey).set(receivedKey, result);
  return result;
}

/**
 * The lexical readers of ONE component function: only its first parameter is
 * the caller's props. `kindOf` says what an expression carries ({ rest } the
 * props object minus destructured keys, { object } one prop, { direct } the
 * caller part, { prop } a prop's part, { setter } an attribute object);
 * `tagOf` says what a tag renders ('intrinsic', a followed component target,
 * or undefined).
 */
function componentScope({ file, fn, bindings }, root) {
  const props = fn?.parameters?.[0];
  const visiting = new Set();

  /** What an identifier USE carries: { rest: Set<excluded> } (the props object), { object: key } (a prop), DIRECT, { prop: key }. */
  const kindOfIdentifier = (use) => {
    const declared = declarationOf(use.text, use);
    if (!declared || visiting.has(declared)) return undefined;
    visiting.add(declared);
    try {
      return kindOfDeclared(declared);
    } finally {
      visiting.delete(declared);
    }
  };
  const patternSource = (pattern) => {
    const holder = pattern.parent;
    if (ts.isParameter(holder)) return holder === props ? { rest: new Set() } : undefined;
    if (ts.isVariableDeclaration(holder)) return holder.initializer ? kindOf(holder.initializer) : undefined;
    if (ts.isBindingElement(holder)) return elementKind(holder);
    return undefined;
  };
  const elementKind = (element) => {
    const pattern = element.parent;
    if (!ts.isObjectBindingPattern(pattern)) return undefined;
    const from = patternSource(pattern);
    if (!from) return undefined;
    if (element.dotDotDotToken) {
      if (!from.rest) return undefined;
      const excluded = new Set(from.rest);
      for (const sibling of pattern.elements) {
        if (sibling === element) continue;
        excluded.add(sibling.propertyName ? keyText(sibling.propertyName) : sibling.name.getText());
      }
      return { rest: excluded };
    }
    const key = element.propertyName ? keyText(element.propertyName) : element.name.getText();
    if (from.rest) return from.rest.has(key) ? undefined : key === 'data-part' ? { direct: true } : { object: key };
    if (from.object && key === 'data-part') return { prop: from.object };
    return undefined;
  };
  const kindOfDeclared = (declared) => {
    const holder = declared.parent;
    if (ts.isParameter(holder)) return holder === props ? { rest: new Set() } : undefined;
    if (ts.isBindingElement(holder)) return elementKind(holder);
    if (ts.isVariableDeclaration(holder) && holder.initializer) return kindOf(holder.initializer);
    return undefined;
  };
  /** The kind an expression carries (see kindOfIdentifier), or { setter } for an object of part attributes. */
  const kindOf = (expression) => {
    const node = unwrapTransparent(expression);
    if (!node) return undefined;
    if (ts.isIdentifier(node)) return kindOfIdentifier(node);
    if (ts.isElementAccessExpression(node) || ts.isPropertyAccessExpression(node)) {
      const key = ts.isPropertyAccessExpression(node) ? node.name.text
        : ts.isStringLiteralLike(node.argumentExpression) ? node.argumentExpression.text : undefined;
      if (key === undefined) return undefined;
      const base = kindOf(node.expression);
      if (base?.rest && !base.rest.has(key)) return key === 'data-part' ? { direct: true } : { object: key };
      if (base?.object && key === 'data-part') return { prop: base.object };
      return undefined;
    }
    if (isValueChoice(node)) return choices(node).map(kindOf).find(Boolean);
    if (ts.isObjectLiteralExpression(node)) {
      const setter = objectSetter(node);
      return setter ? { setter } : undefined;
    }
    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText();
      if ((callee === 'partAttributes' || callee.endsWith('.partAttributes')) && node.arguments[0]) {
        return { setter: partValue(node.arguments[0]) ?? 'own' };
      }
    }
    return undefined;
  };
  /** What a `data-part` VALUE expression carries: 'direct', `prop:<key>`, or undefined (its own literal / unknown). */
  const partValue = (expression) => {
    let found;
    const walk = (node) => {
      if (found || ts.isFunctionLike(node)) return;
      if (ts.isIdentifier(node) || ts.isElementAccessExpression(node) || ts.isPropertyAccessExpression(node)) {
        const kind = kindOf(node);
        if (kind?.direct) { found = 'direct'; return; }
        if (kind?.prop) { found = `prop:${kind.prop}`; return; }
        if (kind?.setter && kind.setter !== 'own') { found = kind.setter; return; }
      }
      ts.forEachChild(node, walk);
    };
    walk(expression);
    return found;
  };
  /** The part setter a SPREAD contributes: 'direct', `prop:<key>`, 'own', or undefined (sets no part). */
  const spreadSetter = (expression) => {
    const kind = kindOf(expression);
    if (kind?.rest) return kind.rest.has('data-part') ? undefined : 'direct';
    if (kind?.object) return `prop:${kind.object}`;
    return kind?.setter;
  };
  const objectSetter = (object) => {
    let last;
    for (const member of object.properties) {
      if (ts.isSpreadAssignment(member)) last = spreadSetter(member.expression) ?? last;
      else if (ts.isPropertyAssignment(member) && keyText(member.name) === 'data-part') last = partValue(member.initializer) ?? 'own';
    }
    return last;
  };
  /** `slots?.Grid`, `props.as`: a member read off a caller prop is itself caller-supplied. */
  const isPropMember = (node) => (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node))
    && Boolean(kindOf(node.expression)?.object || kindOf(node.expression)?.rest || isPropMember(unwrapTransparent(node.expression)));
  /** A polymorphic tag variable whose every value is a string or a caller prop, with a string among them. */
  const intrinsicValued = (expression, depth = 0) => {
    const leaves = [];
    const collect = (node) => {
      const value = unwrapTransparent(node);
      if (isValueChoice(value)) for (const operand of choices(value)) collect(operand);
      else leaves.push(value);
    };
    collect(expression);
    let strings = 0;
    for (const leaf of leaves) {
      if (ts.isStringLiteralLike(leaf) || ts.isTemplateExpression(leaf)) { strings += 1; continue; }
      const constant = constantOf(leaf, root);
      if (constant && ts.isStringLiteralLike(constant)) { strings += 1; continue; }
      const kind = kindOf(leaf) ?? (isPropMember(leaf) ? { object: true } : undefined);
      if (kind?.object) {
        const declared = ts.isIdentifier(leaf) ? declarationOf(leaf.text, leaf) : undefined;
        const fallback = declared && ts.isBindingElement(declared.parent) && declared.parent.initializer;
        if (fallback && depth < 4 && intrinsicValued(fallback, depth + 1)) strings += 1;
        continue;
      }
      if (ts.isIdentifier(leaf) && depth < 4) {
        const declared = declarationOf(leaf.text, leaf);
        const initializer = declared && ts.isVariableDeclaration(declared.parent) && declared.parent.initializer;
        if (initializer && intrinsicValued(initializer, depth + 1)) { strings += 1; continue; }
      }
      return false;
    }
    return strings > 0;
  };
  /** The call-site argument a factory parameter (or a const alias of one: `const Glyph = glyph`) is bound to. */
  const boundArgument = (identifier, depth = 0) => {
    const declared = declarationOf(identifier.text, identifier);
    if (!declared || depth > 4) return undefined;
    if (bindings?.parameters.has(declared)) return bindings.parameters.get(declared);
    const holder = declared.parent;
    const value = ts.isVariableDeclaration(holder) && holder.name === declared && unwrapTransparent(holder.initializer);
    return value && ts.isIdentifier(value) ? boundArgument(value, depth + 1) : undefined;
  };
  /** 'intrinsic', a followed component target, `{ pinned }`, or undefined (not followable). */
  const tagOf = (tag) => {
    const node = unwrapTransparent(tag);
    if (ts.isStringLiteralLike(node)) return 'intrinsic';
    if (!ts.isIdentifier(node)) return undefined;
    if (/^[a-z]/u.test(node.text)) return 'intrinsic';
    const declared = declarationOf(node.text, node);
    if (!declared) return undefined;
    const holder = declared.parent;
    const atModuleScope = ts.isFunctionDeclaration(holder) || ts.isImportClause(holder) || ts.isImportSpecifier(holder)
      || (ts.isVariableDeclaration(holder) && ts.isSourceFile(holder.parent.parent.parent));
    if (atModuleScope) return componentTarget(resolveDeclared(file, declared, root), root);
    const argument = boundArgument(node);
    if (argument) return boundComponent(argument, root);
    if (ts.isVariableDeclaration(holder) && holder.initializer && intrinsicValued(holder.initializer)) return 'intrinsic';
    if (ts.isBindingElement(holder) && holder.initializer && kindOfDeclared(declared)?.object
      && intrinsicValued(holder.initializer)) {
      return 'intrinsic';
    }
    return undefined;
  };
  return { tagOf, kindOf, partValue, spreadSetter };
}

/**
 * What a composed component does with the anatomy a caller hands it, resolved
 * PER NAME: `file` is the module the caller imports from and `name` the binding
 * it imports (`'default'` for a default import), followed through re-exports,
 * wrappers and the engine factories to the one render function the caller's
 * tag reaches. A module exporting a consuming `Y` beside a P-88-closed `X`
 * answers for `X` and `Y` separately. Returns `{ direct, props }` (see
 * `functionConsumption`); an unresolvable binding consumes nothing.
 */
export function composedConsumption(file, name = 'default', root = DEFAULT_ROOT) {
  return functionConsumption(componentTarget(resolveExport(file, name, root), root), root);
}

/**
 * How a COMPOSED tag in a family source treats the caller's anatomy: an
 * intrinsic element in disguise (a polymorphic `Tag` bound to a string or to
 * a prop with an intrinsic default) is `'intrinsic'`; a tag resolving by name
 * to a component gives that component's consumption; anything else gives no
 * consumption at all (fail closed).
 */
function composedTagConsumption(file, element, root) {
  let enclosing;
  for (let node = element.parent; node; node = node.parent) if (ts.isFunctionLike(node)) enclosing = node;
  const scope = componentScope({ file, fn: enclosing }, root);
  const kind = scope.tagOf(element.tagName);
  if (kind === 'intrinsic') return kind;
  if (!kind) return NO_CONSUMPTION;
  /* A semantic icon handed neither a name nor `decorative` renders nothing: its stamp is not rendered anatomy. */
  if (!kind.pinned && rendersOnlyNamedOrDecorative(kind)
    && !suppliesNameOrDecorative(jsxSetters(element.attributes.properties), scope.kindOf)) {
    return NO_CONSUMPTION;
  }
  /* The family's element is the wrapper's caller: hand down what it provably passes. */
  return functionConsumption(kind, root, new Set(), receivedNameAndDecorative(jsxSetters(element.attributes.properties), scope.kindOf));
}

/**
 * The parts a composed DS primitive stamps in its OWN source. `<ModernButton
 * data-part="event">` renders the Button's anatomy inside the family's element,
 * so a skin rule `[data-part='event'] > [data-part='content']` reads a stamp the
 * Button makes -- the part twin of the variant and state credits above. The
 * credit is exact: the specifier must resolve to ONE module file under
 * `src/components/primitives/` (a frozen engine never backs it), and only the
 * literal parts that module stamps are credited. A barrel resolves to a file
 * that stamps nothing, so it credits nothing.
 */
function composedPrimitiveStampedParts(specifier, fromFile, root) {
  let base;
  if (specifier.startsWith('.')) base = resolve(dirname(fromFile), specifier);
  else if (specifier.startsWith('@/')) base = join(root, 'src', specifier.slice(2));
  else return undefined;
  const file = [`${base}.tsx`, `${base}.ts`, join(base, 'index.tsx'), join(base, 'index.ts')]
    .find((candidate) => existsSync(candidate));
  if (!file) return undefined;
  const primitives = join(root, 'src', 'components', 'primitives') + sep;
  if (!file.startsWith(primitives) || FROZEN_ENGINE_SEGMENT.test(toPosix(file)) || !isFamilySource(file)) {
    return undefined;
  }
  if (!composedPartStampCache.has(file)) {
    const parts = analyzeSource(file).parts;
    composedPartStampCache.set(file, parts.size > 0
      ? { name: toPosix(relative(root, file)), parts }
      : undefined);
  }
  return composedPartStampCache.get(file);
}

const kebabOf = (tag) => tag.replace(/([a-z0-9])([A-Z])/gu, '$1-$2').toLowerCase();

const composedStateStampCache = new Map();

/**
 * The states a composed primitive stamps on the element a family reaches
 * through the primitive's class. The Button kernel writes the part attribute
 * and the state attribute in the SAME `partAttributes` call, so a rule whose
 * owning compound carries `.ds-button` paints a state the composed primitive
 * really serializes -- the twin of the `data-variant` credit above.
 */
function composedPrimitiveStampsState(token, root) {
  const name = withoutTier(token.slice(token.indexOf('-') + 1)).replace(/--.*$/u, '');
  const key = `${root}\0${name}`;
  if (!composedStateStampCache.has(key)) {
    const owners = findComponentDirs(root, name);
    const frozenOnly = collectFrozenOnlyModules(owners);
    const sources = owners.length === 1
      ? walkFiles(owners[0], isFamilySource)
        .filter((file) => !frozenOnly.has(file))
        .map((file) => analyzeSource(file))
        .filter((entry) => entry.stampsStateAttribute)
      : [];
    composedStateStampCache.set(key, sources.length > 0
      ? { name, states: new Set(sources.flatMap((entry) => [...entry.states])) }
      : undefined);
  }
  return composedStateStampCache.get(key);
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

/**
 * The pointer transport's bags own only the press. Keeping them a separate set
 * leaves every HTML5 attachment measured exactly as before: a later
 * `onPointerDown` discards a pointer bag and nothing else.
 */
const POINTER_OWNED_PROPS = new Set(['onPointerDown']);

const KERNEL_HOOKS = new Set(['useDragSession', 'useFileDropZone', 'useResizeSession']);
const KERNEL_BAG_CALL = /(?:^|\.)(?:getSourceProps|getTargetProps|getPointerSourceProps|getHandleProps)$/u;
const POINTER_BAG_CALL = /(?:^|\.)(?:getPointerSourceProps|getHandleProps)$/u;
const POINTER_LISTENED = new Set(['pointermove', 'pointerup']);
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
  pointer: ['onPointerDown'],
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
  let capturesPointer = false;
  let listensPointer = false;

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
      if (name === 'setPointerCapture') capturesPointer = true;
      if (name === 'addEventListener' && ts.isCallExpression(node.parent) && node.parent.expression === node) {
        const [type] = node.parent.arguments;
        if (type && ts.isStringLiteralLike(type) && POINTER_LISTENED.has(type.text)) listensPointer = true;
      }
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
  /* An independent pointer transport, BY SHAPE: it captures the pointer, follows
   * it on a window-level listener and starts from a press it attaches itself. */
  const pointerTransportOwner = capturesPointer && listensPointer && attributeNames.has('onPointerDown');
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

  const ownedPropsOf = (expression) => {
    const current = unwrapTransparent(expression);
    return current && ts.isCallExpression(current) && POINTER_BAG_CALL.test(text(current.expression))
      ? POINTER_OWNED_PROPS
      : KERNEL_OWNED_PROPS;
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
      if (POINTER_BAG_CALL.test(text(current.expression))) return 'pointer';
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
    let owned = KERNEL_OWNED_PROPS;
    const overridden = [];
    for (const property of literal.properties) {
      if (ts.isSpreadAssignment(property)) {
        if (isKernelBag(property.expression)) {
          seen = true;
          owned = ownedPropsOf(property.expression);
          continue;
        }
        if (!seen) continue;
        const keys = enumerableKeys(property.expression);
        if (keys === null) return { kernel: true, overridden, unverified: true, owned };
        overridden.push(...keys.filter((key) => owned.has(key)));
        continue;
      }
      if (!seen || !property.name) continue;
      const key = text(property.name).replace(/^['"]|['"]$/gu, '');
      if (owned.has(key)) overridden.push(key);
    }
    return seen ? { kernel: true, overridden, unverified: false, owned } : undefined;
  };

  /** The kernel bag spread at ONE position, raw or assembled into a local. */
  const kernelSpreadAt = (properties, position) => {
    const property = properties[position];
    if (!property || !ts.isJsxSpreadAttribute(property)) return undefined;
    if (isKernelBag(property.expression)) {
      return { overridden: [], unverified: false, owned: ownedPropsOf(property.expression) };
    }
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
    let owned = new Set();
    for (let position = 0; position < properties.length; position += 1) {
      const bag = kernelSpreadAt(properties, position);
      if (!bag) continue;
      index = position;
      overwritten = [...bag.overridden];
      unverified = bag.unverified;
      owned = new Set(bag.owned);
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
        for (const key of bag.owned) owned.add(key);
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
        if (!KERNEL_OWNED_PROPS.has(name) && !POINTER_OWNED_PROPS.has(name)) continue;
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
        if (owned.has(name)) overwritten.push(name);
        continue;
      }
      const keys = enumerableKeys(property.expression);
      if (keys === null) { unverified = true; continue; }
      overwritten.push(...keys.filter((key) => owned.has(key)));
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
    pointerTransportOwner,
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
    pointerTransportOwners: analyses.filter((entry) => entry.pointerTransportOwner).map((entry) => rel(entry.file)),
    declared: analyses.some((entry) => entry.declaresKernel),
    wired,
    rows,
    frozen,
  };
}

export function measureFamily(resolved, { producers, compiled, scopes, callerParts } = {}) {
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
  /* A default part a structural primitive lets a caller rename (P-88) is read
   * through the owned `data-component` on the same element, never the part. */
  const consumedComponents = union(skins, 'components');
  const anchoredParts = new Set(sources.flatMap((entry) => entry.componentAnchors)
    .filter((anchor) => consumedComponents.has(anchor.component))
    .map((anchor) => anchor.part));
  const consumedParts = new Set([...union(skins, 'parts'), ...anchoredParts]);
  /* G1 (WO-ARC-12, review-arc12-rfc §3): a `data-part` this family stamps on a COMPOSED SKINNED DS
   * CHILD is a P-88 caller part, not this family's anatomy. Which elements those are is the
   * pass-through census's caller enumeration, imported (./p88), never re-derived here. The four
   * anatomy values below (stamped, consumed and their two differences) exclude them; the
   * occurrences are counted, by file:line, in their own decrease-only arm `p88CallerParts`,
   * which the 1b engine lots drain to 0. Native anatomy -- intrinsic elements, partAttributes,
   * spread objects, and any child the census does not resolve to a skinned family -- is
   * unchanged. The BLOCKING arms keep reading the full sets. */
  const p88Index = callerParts ?? callerPartIndex(root);
  const callerOccurrences = [];
  const anatomyStamped = new Set();
  /* F1 (WO-ARC-12): a part the family writes on a COMPOSED tag -- an attribute literal, or an
   * object handed down in a prop -- renders only if that component's own source consumes it.
   * It joins the anatomy ONLY when `composedConsumption` backs the channel: a literal when the
   * component stamps the caller `data-part` (`direct`), a hand-off when it stamps THAT prop's
   * part. A tag that resolves to an intrinsic element (a polymorphic `Tag`) is anatomy as
   * before; a tag nothing resolves backs nothing. A skin read of an unbacked part therefore
   * surfaces as consumed-not-stamped. Census caller elements stay with G1 above. */
  const unbackedParts = new Set();
  const backingOf = (entry, element) => composedTagConsumption(entry.file, element, root);
  for (const entry of sources) {
    for (const value of entry.nonElementParts) anatomyStamped.add(value);
    for (const occurrence of entry.partOccurrences) {
      const use = callerElementOf(p88Index, entry.file, occurrence);
      if (use) {
        callerOccurrences.push({ ...occurrence, file: toPosix(relative(root, entry.file)), childFamily: use.childFamily });
        continue;
      }
      const tag = occurrence.element?.tagName;
      const composed = tag && !(ts.isIdentifier(tag) && /^[a-z]/u.test(tag.text));
      const backing = composed ? backingOf(entry, occurrence.element) : 'intrinsic';
      if (backing === 'intrinsic' || backing.direct) anatomyStamped.add(occurrence.part);
      else unbackedParts.add(occurrence.part);
    }
    for (const handoff of entry.anatomyHandoffs) {
      const backing = backingOf(entry, handoff.element);
      if (backing !== 'intrinsic' && backing.props.has(handoff.prop)) anatomyStamped.add(handoff.part);
      else unbackedParts.add(handoff.part);
    }
  }
  for (const part of stampedParts) {
    if (!anatomyStamped.has(part) && !unbackedParts.has(part)
      && !callerOccurrences.some((occurrence) => occurrence.part === part)) {
      throw new Error(`family-cut: G1 lost track of the stamped part \`${part}\` in ${family}`);
    }
  }
  const callerOnlyParts = new Set(callerOccurrences.map((occurrence) => occurrence.part)
    .filter((part) => !anatomyStamped.has(part)));
  const anatomyConsumed = new Set([...consumedParts].filter((part) => !callerOnlyParts.has(part)));
  const p88CallerParts = callerOccurrences
    .map((occurrence) => `${occurrence.file}:${occurrence.line} <${occurrence.tag}> ${occurrence.part} (-> ${occurrence.childFamily})`)
    .sort();
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
  /* A state painted on a compound that carries a composed primitive's class is
   * stamped by that primitive, not by this family: the class and the state land
   * on the same element (P-88). The occurrences that reach no such primitive are
   * kept, because they name the parts this family still owes a stamp. */
  const stateComposedFrom = new Set();
  const composedStampedStates = new Set();
  const statesNotComposed = [];
  /* A part this family declares but hands to another component to render. The
   * anatomy that carries its own `data-state` is NOT one of these: there the
   * family is the decider, and crediting the component would hide the day the
   * family stops stamping. */
  const partKeyedBackers = new Map();
  for (const entry of sources) {
    for (const handoff of entry.anatomyHandoffs) {
      if (handoff.decidesState) continue;
      const specifier = entry.imports.get(handoff.tag);
      if (!specifier) continue;
      const backer = composedComponentStampsPart(handoff, specifier, entry.file);
      if (backer) partKeyedBackers.set(handoff.part, backer);
    }
  }
  for (const occurrence of skins.flatMap((skin) => skin.stateCompounds)) {
    const backer = occurrence.tokens
      .filter((token) => !ownsClass(token))
      .map((token) => composedPrimitiveStampsState(token, root))
      .find((entry) => entry?.states.has(occurrence.state))
      ?? occurrence.parts
        .map((part) => partKeyedBackers.get(part))
        .find((entry) => entry?.states.has(occurrence.state));
    if (backer) {
      stateComposedFrom.add(backer.name);
      composedStampedStates.add(occurrence.state);
    } else {
      statesNotComposed.push({
        state: occurrence.state,
        compound: [
          occurrence.tokens.join(' '),
          ...occurrence.parts.map((part) => `[data-part='${part}']`),
        ].join(''),
        line: occurrence.line,
        file: occurrence.file,
      });
    }
  }
  const usesPartAttributes = sources.some((entry) => entry.usesPartAttributes);
  const dynamicParts = sources.reduce((total, entry) => total + entry.dynamicParts, 0);
  const skinUsesStateAttribute = consumedStates.size > 0;
  const stampsPartAttribute = sources.some((entry) => entry.stampsPartAttribute) || usesPartAttributes;
  const stampsStateAttribute = sources.some((entry) => entry.stampsStateAttribute);
  const stampsVariantAttribute = sources.some((entry) => entry.stampsVariantAttribute);

  const classTokens = new Set([...union(sources, 'classTokens'), ...union(skins, 'classTokens'), ...recipeTokens]);
  const namedClassTokens = [...classTokens].filter((token) => {
    const remainder = token.slice(token.indexOf('-') + 1);
    return remainder === family || remainder.startsWith(`${family}-`);
  }).sort();
  /* The class window retired (WO-FAM-11, 2026-10-02): the canonical spelling
   * is the only one stamped, so the census counts tokens directly. */
  const ownClassTokens = namedClassTokens;
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

  const partsStampedNotConsumed = [...anatomyStamped].filter((part) => !anatomyConsumed.has(part)).sort();
  /* A part the family does not stamp is credited to a primitive it RENDERS only
   * when every skin read of it is anchored on that rendered element: the read's
   * selector names a part or class the family hands the element, and the
   * primitive's own source stamps the part (see `composedPrimitiveStampedParts`). */
  const composedInstances = [];
  for (const entry of sources) {
    for (const render of entry.composedRenders) {
      const specifier = entry.imports.get(render.tag);
      if (!specifier) continue;
      const backer = composedPrimitiveStampedParts(specifier, entry.file, root);
      /* The family's root identity and the engine scope sit on every rule of
       * the skin, so neither names the element the primitive renders. */
      const classes = render.classes.filter((token) => !ownsClass(token) && !token.startsWith('ds-engine-'));
      if (!backer) continue;
      /* Evidence, not the prop list: a literal anchors only when the component
       * consumes and stamps a caller `data-part`, a hand-off only when it reads
       * THAT prop and stamps the handed part. A P-88-closed component that
       * stamps its own canonical part anchors nothing on the caller's literal. */
      const backing = composedTagConsumption(entry.file, render.element, root);
      const consumed = backing === 'intrinsic' ? NO_CONSUMPTION : backing;
      const parts = [
        ...(consumed.direct ? render.parts : []),
        ...render.handoffs.filter((handoff) => consumed.props.has(handoff.prop)).map((handoff) => handoff.part),
      ];
      composedInstances.push({ backer, parts: new Set(parts), classes: new Set(classes) });
    }
  }
  const partReads = skins.flatMap((skin) => skin.partReads);
  const composedBackerOf = (part) => {
    const reads = partReads.filter((read) => read.part === part);
    const backers = reads.map((read) => composedInstances.find((instance) => instance.backer.parts.has(part)
      && (read.anchorParts.some((anchor) => instance.parts.has(anchor))
        || read.anchorClasses.some((anchor) => instance.classes.has(anchor)))));
    return reads.length > 0 && backers.every(Boolean) ? backers[0].backer.name : undefined;
  };
  const partsComposedFrom = [...anatomyConsumed]
    .filter((part) => !anatomyStamped.has(part))
    .sort()
    .map((part) => ({ part, primitive: composedBackerOf(part) }))
    .filter((entry) => entry.primitive);
  const composedStampedParts = new Set(partsComposedFrom.map((entry) => entry.part));
  const partsConsumedNotStamped = dynamicParts > 0
    ? []
    : [...anatomyConsumed]
      .filter((part) => !anatomyStamped.has(part) && !composedStampedParts.has(part))
      .sort();
  const statesConsumedNotStamped = [...consumedStates]
    .filter((state) => !stampedStates.has(state) && !composedStampedStates.has(state))
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
      partsStamped: anatomyStamped.size,
      partsConsumed: anatomyConsumed.size,
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
      p88CallerParts: p88CallerParts.length,
    },
    detail: {
      p88CallerParts,
      p88Census: p88Index.measured,
      vocabularies,
      legacyNamespaceClasses,
      partsStampedNotConsumed,
      partsConsumedNotStamped,
      statesConsumedNotStamped,
      unpairedStatePseudo,
      colorLiteralsInSkin,
      maskAlphaStops,
      variantComposedFrom: [...variantComposedFrom].sort(),
      stateComposedFrom: [...stateComposedFrom].sort(),
      partsComposedFrom,
      statesNotComposed,
      stateSides: {
        familyStamps: stampsStateAttribute,
        familyGoverns: usesPartAttributes,
        skinPaints: skinUsesStateAttribute,
      },
      partsReadThroughComponent: [...anchoredParts].sort(),
      readWithoutProducer: readWithoutProducer.debt,
      readChannels: [...readNames].sort(),
      fanOut,
      dndTransportOwners: dnd.transportOwners,
      dndDropZoneOwners: dnd.dropZoneOwners,
      dndPointerTransportOwners: dnd.pointerTransportOwners,
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
  p88CallerParts: 'P-88 caller parts: literal `data-part` values handed to a skinned DS child (G1, owner WO-ARC-12; the 1b engine lots drain it to 0)',
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

/**
 * The composed-stamp amendment to the two state arms (WO-FAM-08, registered for
 * splitter and list-toolbar). `stateContract` and `stateGoverned` read the
 * family's own source: the family stamps `data-state`, through `partAttributes`.
 * A family that hands a part to a composed primitive which stamps it is honest
 * without that text, and the gate already MEASURES the hand-off
 * (`stateComposedFrom`, `statesNotComposed`). The credit reaches the arms only
 * under all three of:
 *
 *   1. the roster row DECLARES it: `composedStateCredit` names the stampers
 *      (`from`), the lot that made them stamp (`mover`), the recorded
 *      measurement (`receipt`) and why (`note`) -- an undeclared credit is never
 *      inferred, so a new hand-off stays red until someone writes it down;
 *   2. the declaration IS the measurement: `from` equals the live
 *      `stateComposedFrom`, so a receipt that does not measure what it declares
 *      is red, today and on the day the hand-off moves;
 *   3. it is NARROW: every state the skin paints is stamped by a declared
 *      stamper (`statesNotComposed` empty) whenever the family source stamps
 *      nothing itself. One painted occurrence nobody stamps keeps both arms red.
 *
 * A family whose own source already holds the arms may still declare the credit
 * it receives; there it changes nothing and is checked as a record.
 */
export function judgeComposedStateCredit(measured, pinned) {
  const declared = pinned?.composedStateCredit;
  if (!declared) return { covers: false, findings: [] };
  const { family, detail } = measured;
  const findings = [];
  const from = Array.isArray(declared.from) ? [...declared.from].sort() : [];
  if (from.length === 0) findings.push(`${family}: \`composedStateCredit\` names no stamper in \`from\``);
  if (!/^[0-9a-f]{7,40}$/u.test(declared.mover ?? '')) {
    findings.push(`${family}: \`composedStateCredit\` names no \`mover\` commit -- a credit states the lot that made the primitive stamp`);
  }
  if (!String(declared.receipt ?? '').trim() || !String(declared.note ?? '').trim()) {
    findings.push(`${family}: \`composedStateCredit\` carries no \`receipt\` or no \`note\` -- a credit without its recorded measurement is a claim`);
  }
  const measuredFrom = detail.stateComposedFrom ?? [];
  if (JSON.stringify(from) !== JSON.stringify(measuredFrom)) {
    findings.push(
      `${family}: \`composedStateCredit\` declares ${JSON.stringify(from)} but the gate measures ${JSON.stringify(measuredFrom)} -- `
        + 'the receipt does not measure what the row declares',
    );
  }
  const sides = detail.stateSides ?? {};
  const familyHolds = Boolean(sides.familyStamps && sides.familyGoverns);
  const uncovered = detail.statesNotComposed ?? [];
  if (!familyHolds && uncovered.length > 0) {
    findings.push(
      `${family}: \`composedStateCredit\` cannot stand in for the family source: ${uncovered.length} painted state occurrence(s) `
        + `no declared stamper answers for (${uncovered.map((row) => `${row.state} ${row.compound}`).join('; ')})`,
    );
  }
  return { covers: findings.length === 0 && Boolean(sides.skinPaints), findings };
}

/** `blockingDebt` after a VALID composed-stamp credit: only the two state arms can move. */
export function creditedBlockingDebt(measured, pinned) {
  const debt = blockingDebt(measured);
  if (!judgeComposedStateCredit(measured, pinned).covers) return debt;
  return { ...debt, stateContract: 0, stateGoverned: 0 };
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
  const measuredDebt = creditedBlockingDebt(measured, pinned);
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
  const credit = judgeComposedStateCredit(measured, pinned);
  findings.push(...credit.findings);
  const measuredDebt = creditedBlockingDebt(measured, pinned);

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
  waivable('stateContract', () => (blocking.stateContract || credit.covers
    ? []
    : [`${family}: BLOCKING \`data-state\` is on exactly one side of the contract -- stamped with no rule, or painted with no stamp`]));
  waivable('stateGoverned', () => (blocking.stateGoverned || credit.covers
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
    for (const file of measured.detail.dndPointerTransportOwners ?? []) {
      console.log(`family-cut DND ${measured.family}: POINTER-TRANSPORT ${file} (own pointer drag, not the kernel)`);
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
