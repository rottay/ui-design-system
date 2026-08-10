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
 * sentence is checked against the copy in `PROGRAM-STATE.md`, not only
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
 *   node .../work-order/index.mjs --work-order <wo.json> --skip-repo-checks
 *
 * EXIT 0 valid · 1 invalid · 2 could not run.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isUnderOrEqual, normalizePath } from '../../foundation/glob/index.mjs';
import { repoRoot } from '../../foundation/git/index.mjs';
import { loadContext, resolveLane } from '../../composition/plan/index.mjs';
import { conclude, createFindings, EXIT, parseArgs } from '../../foundation/report/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const SCHEMA_PATH = resolve(HERE, 'schema.json');

export const PROGRAM_STATE_PATH = 'packages/core/test-artifacts/quality-evidence/wo-cra-23/PROGRAM-STATE.md';

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

  // W5 — commit pathspecs may not reach outside the write set.
  for (const pathspec of workOrder.commitPathspecs) {
    const normalized = normalizePath(pathspec);
    if (['.', '..', '-A', '-a', '*', './'].includes(normalized)) {
      add({
        rule: 'W5-commit-pathspec',
        message: `commitPathspecs contains "${pathspec}", which in a shared tree commits another agent's work`,
      });
      continue;
    }
    const inside = workOrder.writeSet.some((pattern) => isUnderOrEqual(normalized, staticAnchor(pattern)));
    if (!inside) {
      add({
        rule: 'W5-commit-pathspec',
        message: `commitPathspec "${pathspec}" is not inside any writeSet pattern; committing it would carry files this lane never declared`,
      });
      continue;
    }
    // `git commit -- <path>` commits the WORKING TREE under that path, so a
    // pathspec that contains an excluded region carries that region too —
    // even though the lane was never allowed to write it.
    const swallowed = (workOrder.writeExcludes ?? []).filter((entry) => isUnderOrEqual(staticAnchor(entry), normalized));
    if (swallowed.length > 0) {
      add({
        rule: 'W5-commit-pathspec',
        message: `commitPathspec "${pathspec}" contains excluded region(s) ${swallowed.join(', ')}; \`git commit -- <path>\` stages the working tree under that path, excluded or not`,
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
  // inadmissible there.
  if (context) {
    try {
      const lane = resolveLane(
        {
          id: workOrder.id,
          row: workOrder.row,
          writeSet: workOrder.writeSet,
          writeExcludes: workOrder.writeExcludes,
        },
        context,
      );
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
    } catch (error) {
      add({ rule: 'W7-bound', message: `write set could not be resolved against row "${workOrder.row}": ${error.message}` });
    }
  }

  return { findings, summary: `${workOrder.id} · ${workOrder.editClass} · ${workOrder.model.name} · ${table.length} substitution(s)` };
}

function main(argv) {
  const { flags } = parseArgs(argv);
  const target = flags.get('work-order') ?? flags.get('wo');
  if (!target || target === true) {
    console.error('usage: work-order --work-order <wo.json> [--json] [--skip-repo-checks]');
    return EXIT.USAGE;
  }

  let workOrder;
  let schema;
  let root = null;
  let context = null;
  const skipRepoChecks = Boolean(flags.get('skip-repo-checks'));
  try {
    workOrder = JSON.parse(readFileSync(String(target), 'utf8'));
    schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf8'));
    if (!skipRepoChecks) {
      root = repoRoot();
      context = loadContext({ root });
    }
  } catch (error) {
    console.error(`✗ work-order could not run: ${error.message}`);
    return EXIT.USAGE;
  }

  const result = validateWorkOrder(workOrder, { root, schema, context, skipRepoChecks });
  return conclude({ name: 'work-order', findings: result.findings, json: flags.get('json'), summary: result.summary });
}

if (process.argv[1]?.endsWith('work-order/index.mjs')) {
  process.exit(main(process.argv.slice(2)));
}
