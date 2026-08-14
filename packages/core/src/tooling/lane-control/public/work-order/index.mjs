#!/usr/bin/env node
/**
 * @fileoverview DELIVERABLE 3 — the work-order validator.
 *
 * The schema beside this file states the SHAPE. This states the rules a shape
 * cannot: that the model reason is a sentence somebody wrote rather than a
 * field somebody filled, that a sonnet lane's pre-pass evidence EXISTS on
 * disk, that the verification commands can run while the build is red, that
 * the mandatory sentence is the law's sentence and not a paraphrase of it,
 * and that the commit pathspecs cannot reach another lane's files.
 *
 * WHY THE VALIDATOR READS THE LAW INSTEAD OF QUOTING IT. §2's mandatory
 * sentence is checked against the copy in the Modern Rescue README, not only
 * against the constant below. If the law is amended and this file is not, the
 * validator says so rather than enforcing a sentence the programme has
 * retired. A gate that quietly enforces a stale law is worse than no gate.
 *
 * NO JSON-SCHEMA LIBRARY. The shape check is hand-rolled against
 * `schema.json` because every check in this folder must run with no build,
 * no install step and no dependency the repository has not already paid for.
 *
 * USAGE
 *   node .../work-order/index.mjs --work-order <wo.json> [--json]
 *
 * The command always loads the canonical catalog. There is no flag that turns
 * the repository checks off: a verdict reached without the catalog is not a
 * verdict about a lane, and issuing one as exit 0 is worse than not running.
 *
 * EXIT 0 valid · 1 invalid · 2 could not run.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  isUnderOrEqual,
  normalizePath,
  pathEscapeReason,
  territoryOf,
  territoryOverlap,
} from '../../foundation/glob/index.mjs';
import { repoRoot } from '../../foundation/git/index.mjs';
import { assertNoCatalogOverride } from '../../runtime/ownership-rows/index.mjs';
import { buildSingleOwnerSet, singleOwnerHits } from '../../runtime/shared-files/index.mjs';
import { laneCovers, loadContext, resolveLane } from '../../composition/plan/index.mjs';
import { conclude, createFindings, EXIT, parseArgs } from '../../foundation/report/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const SCHEMA_PATH = resolve(HERE, 'schema.json');

export const PROGRAM_STATE_PATH = 'packages/core/scripts/quality-evidence/programs/modern-rescue/README.md';

/** §2 of the programme law, verbatim. Compared, never assumed. */
export const MANDATORY_SENTENCE =
  'Make only the edits enumerated in the substitution table. Never declare a token name that is not in ' +
  'your table — above all, never declare a name that currently appears only inside `var()` fallbacks. ' +
  'Do not reorder, reformat, dedupe, rename, or fix anything adjacent; every out-of-scope observation ' +
  'is a written finding, not an edit.';

/** The build-free verification §2 requires of every lane. */
export const REQUIRED_VERIFICATION = 'channel-wiring-zero-delta-gate.mjs';

/**
 * Commands that need a build. The build has been red for this programme's
 * whole life, so a work order whose verification needs `dist/` cannot be
 * verified by the agent that runs it.
 */
const BUILD_BOUND = [
  { pattern: /\bpnpm\s+(?:-\w+\s+\S+\s+)?(?:run\s+)?build\b/, why: 'runs the package build' },
  { pattern: /\bvite\s+build\b/, why: 'runs vite build' },
  { pattern: /\bnpm\s+run\s+build\b/, why: 'runs the package build' },
  { pattern: /\btsup\b/, why: 'runs a bundler' },
  { pattern: /(^|[^\w-])dist\//, why: 'reads dist/, which only exists after a build' },
  { pattern: /\btsc\b(?![^|;&]*--noEmit)/, why: 'runs tsc in emitting mode; --noEmit is build-free, emitting is not' },
];

const PLACEHOLDER_REASON = [
  /^\s*(todo|tbd|n\/?a|none|-{1,3})\s*$/i,
  /\bfill (this )?in\b/i,
  /\blorem ipsum\b/i,
  /^\s*because it is mechanical\.?\s*$/i,
  /^\s*mechanical\.?\s*$/i,
];

/**
 * The schema's minLength can be satisfied by padding — `"Mechanical" + 51
 * dots` clears sixty characters and says nothing. Distinct words cannot be
 * padded into existence, so the floor is on those. Twelve is the point below
 * which no reason in this programme has ever actually explained a routing
 * decision; a lane that cannot reach it is missing its pre-pass, which is
 * exactly what §1.2 says the field is for.
 */
const DISTINCT_WORD_FLOOR = 12;

function distinctWords(text) {
  const words = String(text).toLowerCase().match(/[a-zà-ÿ][a-zà-ÿ'-]+/g) ?? [];
  return new Set(words);
}

function normalizeSentence(text) {
  return String(text).replace(/\s+/g, ' ').trim();
}

/**
 * The law lives in a markdown blockquote in italics and wraps across four
 * lines, so a raw substring search finds "…is not in > your table…" and
 * reports drift that is really typography. Strip the quote markers and the
 * emphasis, then compare.
 */
function normalizeLaw(text) {
  return String(text)
    .replace(/^[ \t]*>[ \t]?/gm, '')
    .replace(/[*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * The LEADING magic-free portion of a pattern — the region it is anchored in.
 * Leading, not "every magic-free segment": `a/**` + `/b.css` anchors at `a`,
 * and filtering magic out of the middle would invent the anchor `a/b.css`.
 */
function staticAnchor(pattern) {
  const segments = normalizePath(pattern).split('/');
  const anchor = [];
  for (const segment of segments) {
    if (/[*?[\]{}]/.test(segment)) break;
    anchor.push(segment);
  }
  return anchor.join('/');
}

/**
 * A territory printed back as the pattern it stands for. Resolved territories
 * normally carry the `source` string they were compiled from; this is the
 * fallback for the ones that do not, so a finding never has to describe a
 * region as `[object Object]`.
 */
function describeTerritory(territory) {
  if (territory.kind === 'file') return territory.path;
  if (!territory.filter) return territory.dir;
  return territory.kind === 'shallow'
    ? `${territory.dir}/${territory.filter}`
    : `${territory.dir}/**/${territory.filter}`;
}

/** Minimal JSON Schema shape checker: enough for this schema, nothing more. */
export function validateShape(value, schema, path = '$', findings = []) {
  const add = (message) => findings.push({ rule: 'S-shape', message: `${path}: ${message}` });

  if (schema.const !== undefined && value !== schema.const) {
    add(`must be exactly ${JSON.stringify(schema.const)} (found ${JSON.stringify(value)})`);
    return findings;
  }
  if (schema.enum && !schema.enum.includes(value)) {
    add(`must be one of ${schema.enum.map((entry) => JSON.stringify(entry)).join(', ')} (found ${JSON.stringify(value)})`);
    return findings;
  }
  if (schema.oneOf) {
    const matches = schema.oneOf.filter((option) => validateShape(value, option, path, []).length === 0);
    if (matches.length !== 1) add(`must match exactly one of the permitted shapes (matched ${matches.length})`);
    return findings;
  }

  const type = schema.type;
  if (type === 'object') {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      add('must be an object');
      return findings;
    }
    for (const key of schema.required ?? []) {
      if (value[key] === undefined) add(`missing required field "${key}"`);
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!schema.properties?.[key]) add(`unknown field "${key}"`);
      }
    }
    for (const [key, subSchema] of Object.entries(schema.properties ?? {})) {
      if (value[key] === undefined) continue;
      validateShape(value[key], subSchema, `${path}.${key}`, findings);
    }
    return findings;
  }
  if (type === 'array') {
    if (!Array.isArray(value)) {
      add('must be an array');
      return findings;
    }
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      add(`must hold at least ${schema.minItems} item(s)`);
    }
    value.forEach((entry, index) => validateShape(entry, schema.items ?? {}, `${path}[${index}]`, findings));
    return findings;
  }
  if (type === 'string') {
    if (typeof value !== 'string') {
      add('must be a string');
      return findings;
    }
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      add(`must be at least ${schema.minLength} characters (found ${value.length})`);
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      add(`must match ${schema.pattern} (found "${value}")`);
    }
    return findings;
  }
  if (type === 'integer') {
    if (!Number.isInteger(value)) add('must be an integer');
    else if (schema.minimum !== undefined && value < schema.minimum) add(`must be at least ${schema.minimum}`);
    return findings;
  }
  if (type === 'boolean' && typeof value !== 'boolean') add('must be a boolean');
  return findings;
}

export function validateWorkOrder(workOrder, { root, schema, context = null, skipRepoChecks = false } = {}) {
  const { add, findings } = createFindings();

  for (const finding of validateShape(workOrder, schema)) add(finding);
  if (findings.length > 0) {
    return { findings, summary: 'shape check failed; semantic rules were not reached' };
  }

  // W1 — the model reason has to be a reason.
  const reason = workOrder.model.reason;
  if (PLACEHOLDER_REASON.some((pattern) => pattern.test(reason.trim()))) {
    add({ rule: 'W1-model-reason', message: `model.reason is boilerplate ("${reason.trim().slice(0, 48)}…"), which §1.2 treats as a missing pre-pass` });
  }
  const words = distinctWords(reason);
  if (words.size < DISTINCT_WORD_FLOOR) {
    add({
      rule: 'W1-model-reason',
      message: `model.reason holds ${words.size} distinct word(s), below the floor of ${DISTINCT_WORD_FLOOR}. Length can be padded; distinct words cannot. §1.2 wants the pre-pass, not the character count.`,
      details: [`reason as written: "${reason.trim().slice(0, 96)}${reason.trim().length > 96 ? '…' : ''}"`],
    });
  }
  if (workOrder.model.name === 'sonnet') {
    if (!workOrder.model.prePassEvidence) {
      add({
        rule: 'W1-model-reason',
        message: 'model is sonnet but no prePassEvidence is named. §1.2: sonnet receives work already PROVEN mechanical, never work that looks mechanical.',
      });
    } else if (!skipRepoChecks && !existsSync(`${root}/${normalizePath(workOrder.model.prePassEvidence)}`)) {
      add({
        rule: 'W1-model-reason',
        message: `model.prePassEvidence "${workOrder.model.prePassEvidence}" does not exist. A cited pre-pass that is not on disk is a claim, not evidence.`,
      });
    }
  }

  // W2 — editClass drives which fields are mandatory.
  const table = workOrder.substitutionTable;
  if (workOrder.editClass === 'substitution') {
    if (table.length === 0) add({ rule: 'W2-edit-class', message: 'editClass is "substitution" but substitutionTable is empty' });
    table.forEach((entry, index) => {
      if (entry.old === entry.new) {
        add({ rule: 'W2-edit-class', message: `substitutionTable[${index}]: old and new are identical ("${entry.old}")` });
      }
    });
  } else if (table.length > 0) {
    add({
      rule: 'W2-edit-class',
      message: `editClass is "${workOrder.editClass}" but substitutionTable holds ${table.length} entr${table.length === 1 ? 'y' : 'ies'}; only a substitution lane may carry one`,
    });
  }
  if (workOrder.editClass === 'deletion-with-death-proof' && !workOrder.deathProof) {
    add({ rule: 'W2-edit-class', message: 'editClass is "deletion-with-death-proof" but no deathProof is present' });
  }
  if (workOrder.editClass !== 'deletion-with-death-proof' && workOrder.deathProof) {
    add({ rule: 'W2-edit-class', message: `deathProof is present but editClass is "${workOrder.editClass}"` });
  }

  // W3 — the mandatory sentence, byte-compared against the law itself.
  const declared = normalizeSentence(workOrder.mandatorySentence);
  if (declared !== normalizeSentence(MANDATORY_SENTENCE)) {
    add({
      rule: 'W3-mandatory-sentence',
      message: '§2 requires the mandatory sentence VERBATIM; this work order carries a paraphrase',
      details: [`expected: ${normalizeSentence(MANDATORY_SENTENCE)}`, `found:    ${declared}`],
    });
  }
  if (!skipRepoChecks) {
    const lawPath = `${root}/${PROGRAM_STATE_PATH}`;
    if (existsSync(lawPath)) {
      const law = normalizeLaw(readFileSync(lawPath, 'utf8'));
      if (!law.includes(normalizeLaw(MANDATORY_SENTENCE))) {
        add({
          rule: 'W3-mandatory-sentence',
          message: `the sentence this validator enforces is no longer present in ${PROGRAM_STATE_PATH}. The law moved and the gate did not; fix the constant before trusting this check.`,
        });
      }
    }
  }

  // W4 — verification must be runnable while the build is red.
  const commands = workOrder.verificationCommands;
  for (const command of commands) {
    for (const rule of BUILD_BOUND) {
      if (rule.pattern.test(command)) {
        add({ rule: 'W4-build-free', message: `verification command is not build-free (${rule.why}): ${command}` });
      }
    }
  }
  if (!commands.some((command) => command.includes(REQUIRED_VERIFICATION))) {
    add({
      rule: 'W4-build-free',
      message: `§2 makes ${REQUIRED_VERIFICATION} mandatory for every lane, and no verification command runs it`,
    });
  }

  // THE LANE IS RESOLVED HERE, BEFORE W5 — not with W7 where it used to be.
  //
  // W5 asks whether a commit pathspec can reach a file this lane may not write,
  // and that question cannot be answered from the document. The document lists
  // the exclusions its author typed; the CATALOG derives the rest — every family
  // nested inside this one carves itself out of the outer subtree. Reading only
  // the typed half is how an outer directory pathspec walked over a nested
  // family and exited 0. Same resolution the plan checker performs, so a work
  // order cannot be admissible here and inadmissible there.
  const claims = (workOrder.claimsSharedFiles ?? []).map((entry) => normalizePath(entry));
  const singleOwner = buildSingleOwnerSet();
  let lane = null;
  let laneError = null;
  if (context) {
    try {
      lane = resolveLane(
        {
          id: workOrder.id,
          laneRole: workOrder.laneRole,
          row: workOrder.row,
          writeRoot: workOrder.writeRoot,
          writeSet: workOrder.writeSet,
          writeExcludes: workOrder.writeExcludes,
          claimsSharedFiles: workOrder.claimsSharedFiles,
        },
        context,
      );
    } catch (error) {
      laneError = error;
    }
  }

  // W5 — commit pathspecs may not reach outside the write set.
  //
  // THE UNIT OF THIS RULE IS THE TERRITORY, NOT THE STRING. `git commit --
  // <path>` stages the working tree under that path, so a directory pathspec
  // commits its whole subtree: every file in it, whoever wrote them. Two shapes
  // defeated the earlier string test, both reproduced as exit 0:
  //
  //   · `writeSet: [".../Avatar/**/*.test.tsx"]` with pathspec `.../Avatar`.
  //     The pattern's static anchor IS that directory, so containment held —
  //     while the grant covered 2 of the 16 files the commit would stage.
  //   · a row whose DERIVED excludes carve a nested family out of an outer
  //     subtree, with the outer directory as the pathspec. Exclusions were read
  //     off `workOrder.writeExcludes`, so the ones only the catalog knows about
  //     were invisible to this check.
  //
  // A directory therefore passes only when the write set grants the ENTIRE
  // subtree and nothing inside it is excluded. Narrower grants are still
  // legitimate lanes — they just cannot be committed by naming the directory.
  for (const pathspec of workOrder.commitPathspecs) {
    const normalized = normalizePath(pathspec);
    if (['.', '..', '-A', '-a', '*', './'].includes(normalized)) {
      add({
        rule: 'W5-commit-pathspec',
        message: `commitPathspecs contains "${pathspec}", which in a shared tree commits another agent's work`,
      });
      continue;
    }
    // Canonical BEFORE containment. The containment test below is a prefix
    // relation over strings, and `Avatar/../../inputs/Button` satisfies it
    // while git commits Button. Refuse the shape rather than trying to compare
    // around it.
    const escape = pathEscapeReason(pathspec);
    if (escape) {
      add({
        rule: 'W5-commit-pathspec',
        message: `commitPathspec "${pathspec}" ${escape}; it would be checked as one path and committed as another`,
      });
      continue;
    }
    if (!lane) {
      // DOCUMENT-ONLY FALLBACK, and strictly weaker than the check below: it
      // sees the typed exclusions and not the derived ones, and it compares a
      // string prefix instead of a territory. It runs only where there is no
      // catalog to resolve against — the in-process drill path — which is
      // exactly why the public command refuses to run without one.
      const inside = workOrder.writeSet.some((pattern) => isUnderOrEqual(normalized, staticAnchor(pattern)));
      if (!inside) {
        add({
          rule: 'W5-commit-pathspec',
          message: `commitPathspec "${pathspec}" is not inside any writeSet pattern; committing it would carry files this lane never declared`,
        });
        continue;
      }
      const typedExcludes = (workOrder.writeExcludes ?? []).filter((entry) => isUnderOrEqual(staticAnchor(entry), normalized));
      if (typedExcludes.length > 0) {
        add({
          rule: 'W5-commit-pathspec',
          message: `commitPathspec "${pathspec}" contains excluded region(s) ${typedExcludes.join(', ')}; \`git commit -- <path>\` stages the working tree under that path, excluded or not`,
        });
      }
      continue;
    }

    const spec = territoryOf(normalized, { isDirectory: context.isDirectory });
    if (spec.kind === 'file') {
      if (!laneCovers(lane, spec.path)) {
        add({
          rule: 'W5-commit-pathspec',
          message: `commitPathspec "${pathspec}" is not granted by this lane's resolved write set; committing it would carry a file this lane never declared`,
        });
      }
      continue;
    }

    // Every exclusion of the RESOLVED lane — the row's derived ones included —
    // that INTERSECTS the subtree this pathspec would stage. This is a territory
    // intersection, not a prefix test, and the difference is a third false green:
    // an exclusion ANCHORED ABOVE the pathspec still reaches inside it whenever
    // it carries a filter. `packages/core/scripts/**/*-gate.mjs` is anchored at
    // `packages/core/scripts`, which is NOT under `packages/core/scripts/codemods`,
    // so the prefix reading called them disjoint and let the directory through —
    // and the first `codemods/foo-gate.mjs` anyone adds is a file this lane may
    // not write, staged by a pathspec that passed.
    //
    // The witness may name a file that does not exist yet. That is the point: a
    // boundary is a property of the region, and a pathspec justified only by
    // today's `ls` is not bounded, merely lucky.
    const swallowed = [];
    for (const exclude of lane.excludeTerritories) {
      const overlap = territoryOverlap(spec, exclude, []);
      if (!overlap) continue;
      const region = exclude.source ?? describeTerritory(exclude);
      if (swallowed.some((entry) => entry.region === region)) continue;
      swallowed.push({
        region,
        witness: overlap.witness.replace(/\/$/, ''),
        anchoredAbove: !isUnderOrEqual(exclude.kind === 'file' ? exclude.path : exclude.dir, spec.dir),
        declared: (workOrder.writeExcludes ?? []).map((entry) => normalizePath(entry)).includes(region),
      });
    }
    if (swallowed.length > 0) {
      add({
        rule: 'W5-commit-pathspec',
        message: `commitPathspec "${pathspec}" overlaps excluded region(s) ${swallowed.map((entry) => entry.region).join(', ')}; \`git commit -- <path>\` stages the working tree under that path, excluded or not`,
        details: swallowed.map(({ region, witness, anchoredAbove, declared }) => {
          const head = declared
            ? `· ${region}`
            : `· ${region} is derived from row "${workOrder.row}", not declared in this work order`;
          return anchoredAbove
            ? `${head} — anchored above this pathspec, it still reaches inside it: ${witness} would be staged`
            : head;
        }),
      });
      continue;
    }

    const staged = context.universe.filter((file) => file === spec.dir || file.startsWith(`${spec.dir}/`));
    const ungranted = staged.filter((file) => !laneCovers(lane, file));
    if (ungranted.length > 0) {
      add({
        rule: 'W5-commit-pathspec',
        message: `commitPathspec "${pathspec}" names a directory, so the commit stages its whole subtree — ${staged.length} file(s), of which ${ungranted.length} are outside this lane's write set`,
        details: ungranted.slice(0, 8).map((file) => `· ${file}`),
      });
      continue;
    }

    // The subtree holds no ungranted file TODAY. That is a fact about the tree
    // this afternoon, not a boundary: a filtered grant such as `dir/**/*.test.tsx`
    // starts granting the whole directory the moment somebody adds a file that
    // does not match. Require the grant itself to cover the subtree. An
    // APPROXIMATED territory is a widened reading of a narrower pattern, so it
    // cannot be the thing that grants — widening is safe when it blocks and
    // unsafe when it permits.
    const grantsWholeSubtree = lane.territories.some(
      (territory) =>
        territory.kind === 'subtree' &&
        !territory.filter &&
        !territory.approximated &&
        isUnderOrEqual(spec.dir, territory.dir),
    );
    if (!grantsWholeSubtree) {
      add({
        rule: 'W5-commit-pathspec',
        message: `commitPathspec "${pathspec}" names a directory, but no writeSet pattern grants that whole subtree — only filtered or partial claims reach into it, and \`git commit -- <path>\` does not honour a filter`,
        details: [
          `writeSet as resolved: ${lane.declaredWriteSet.join(', ')}`,
          `${staged.length} file(s) sit under this pathspec today; the grant is narrower than the directory`,
        ],
      });
    }
  }

  // W6 — the findings destination must exist before the lane starts.
  if (!skipRepoChecks) {
    const findingsDir = `${root}/${normalizePath(workOrder.findingsFile)}`.replace(/\/[^/]+$/, '');
    if (!existsSync(findingsDir) || !statSync(findingsDir).isDirectory()) {
      add({
        rule: 'W6-findings-file',
        message: `findingsFile "${workOrder.findingsFile}" has no directory to land in (${findingsDir}); an out-of-scope observation would have nowhere to go but the diff`,
      });
    }
  }

  // W7 — the write set must sit inside the row's bound. Same machinery the
  // intersection checker uses, so a work order cannot be admissible here and
  // inadmissible there. The resolution itself happened above, because W5 needs
  // it; this is where its bound verdicts are reported.
  if (laneError) {
    add({ rule: 'W7-bound', message: `write set could not be resolved against row "${workOrder.row}": ${laneError.message}` });
  }
  if (lane) {
    for (const violation of lane.boundViolations) {
      add({
        rule: 'W7-bound',
        message:
          violation.kind === 'pattern-escapes-writeRoot'
            ? `writeSet pattern "${violation.pattern}" reaches outside the row's writeRoot (${violation.writeRoot})`
            : `writeSet pattern "${violation.pattern}" lands inside writeExclude ${violation.exclude}`,
      });
    }
    if (lane.files.length === 0 && workOrder.editClass !== 'headers-only') {
      add({
        rule: 'W7-bound',
        message: 'the write set matches no file that exists today; a lane that scans nothing passes everything',
      });
    }
  }

  // W8 — the lane role. A plan may INFER a role from the row a lane names; a
  // work order may not. This is the delegable unit — it is handed to an agent
  // that will not be present for the inference — so the role is declared, and
  // it decides which bound fields are mandatory.
  //
  // These conditions are computed WITHOUT the repo on purpose: role legality is
  // a property of the document, and `--skip-repo-checks` must not be the way an
  // unbounded lane gets through. The two conditions that genuinely need the
  // catalog — whether the named row is really a family, and whether a declared
  // root really lies in a shared region — come from `resolveLane` below, which
  // is the same computation the plan checker runs.
  const role = workOrder.laneRole;
  if (role === 'family' || role === 'domain') {
    if (workOrder.row === undefined) {
      add({
        rule: 'W8-lane-role',
        message: `a ${role} lane must name an ownership row — that row IS its bound, and an unbounded lane cannot be checked`,
      });
    }
    if (workOrder.writeRoot !== undefined) {
      add({
        rule: 'W8-lane-role',
        message: `a ${role} lane may not declare writeRoot "${workOrder.writeRoot}" — it inherits the row's bound, and a declared root is how the catalog gets bypassed`,
      });
    }
  }
  if (role === 'integrator') {
    if (workOrder.writeRoot === undefined) {
      add({ rule: 'W8-lane-role', message: 'an integrator lane must declare its writeRoot' });
    }
    if (workOrder.row !== undefined) {
      add({
        rule: 'W8-lane-role',
        message: `an integrator lane may not name row "${workOrder.row}" — it exists to hold shared regions no row owns`,
      });
    }
    if (claims.length === 0) {
      add({
        rule: 'W8-lane-role',
        message: 'an integrator lane claims nothing; holding a shared region is the whole reason this role may declare its own root, so a claimless integrator is an undeclared root with a label on it',
      });
    }
  }
  if (lane) {
    // Only the catalog-dependent verdicts — the rest are already reported above
    // and would arrive twice.
    for (const violation of lane.roleViolations) {
      if (violation.kind !== 'role-row-mismatch' && violation.kind !== 'root-outside-integrator-domains') continue;
      add({ rule: 'W8-lane-role', message: `[${lane.laneRole}] ${violation.message}` });
    }
  }

  // W9 — shared-region claims, the half a single work order can decide. The
  // other half is cross-lane (one claimant per file, one integrator per shared
  // domain) and belongs to write-set-intersection, which is the only checker
  // that sees the batch's siblings.
  for (const claim of claims) {
    if (singleOwnerHits(claim, singleOwner).length === 0) {
      add({
        rule: 'W9-shared-claim',
        message: `claimsSharedFiles names "${claim}", which is not in an architecturally shared region — the claim is meaningless and hides what the lane is really writing`,
      });
      continue;
    }
    const covered = lane
      ? lane.files.includes(claim) || lane.declaredWriteSet.includes(claim)
      : workOrder.writeSet.map((entry) => normalizePath(entry)).includes(claim);
    if (!covered) {
      add({ rule: 'W9-shared-claim', message: `claimsSharedFiles names "${claim}" but the writeSet does not cover it` });
    }
  }
  if (lane) {
    const claimed = new Set(claims);
    const silent = lane.files.filter((file) => !claimed.has(file) && singleOwnerHits(file, singleOwner).length > 0);
    if (silent.length > 0) {
      add({
        rule: 'W9-shared-claim',
        message: `the write set covers ${silent.length} file(s) in an architecturally shared region without claiming them`,
        details: silent.slice(0, 12).map((file) => `· ${file}`),
      });
    }
  }

  const certification = skipRepoChecks ? 'NOT CERTIFIED (repo checks skipped) · ' : '';
  return {
    findings,
    certified: !skipRepoChecks,
    summary: `${certification}${workOrder.id} · ${workOrder.editClass} · ${workOrder.model.name} · ${table.length} substitution(s)`,
  };
}

function main(argv) {
  const { flags } = parseArgs(argv);
  const target = flags.get('work-order') ?? flags.get('wo');
  if (!target || target === true) {
    console.error('usage: work-order --work-order <wo.json> [--json]');
    return EXIT.USAGE;
  }

  let workOrder;
  let schema;
  let root = null;
  let context = null;
  try {
    // THERE IS NO PUBLIC SUCCESS WITHOUT THE CATALOG. `--skip-repo-checks` used
    // to answer "valid, exit 0" for a work order naming a row that does not
    // exist and a write set outside every bound — a green certificate for a
    // document nothing had been checked against. The skip survives only as an
    // in-process argument to `validateWorkOrder`, where the caller is a drill
    // that holds no repository, and even there the summary says NOT CERTIFIED.
    assertNoCatalogOverride(flags);
    if (flags.get('skip-repo-checks') !== undefined) {
      throw new Error(
        '--skip-repo-checks is refused: it produced a passing verdict for work orders that were never checked against the catalog. '
          + 'Run this command in the repository, where the row, the bound and the shared-file claims are real.',
      );
    }
    workOrder = JSON.parse(readFileSync(String(target), 'utf8'));
    schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf8'));
    root = repoRoot();
    context = loadContext({ root });
  } catch (error) {
    console.error(`✗ work-order could not run: ${error.message}`);
    return EXIT.USAGE;
  }

  const result = validateWorkOrder(workOrder, { root, schema, context });
  return conclude({ name: 'work-order', findings: result.findings, json: flags.get('json'), summary: result.summary });
}

/**
 * Exact entrypoint identity.
 *
 * A suffix test (`argv[1].endsWith("x/index.mjs")`) matches ANY path ending
 * that way. The drill folder for this module ends the same way, so importing
 * this file from its own drill ran main() and exited the process before a
 * single drill executed. Compare the resolved URL instead.
 */
function isEntrypoint(moduleUrl) {
  return process.argv[1] !== undefined && moduleUrl === pathToFileURL(process.argv[1]).href;
}

if (isEntrypoint(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
