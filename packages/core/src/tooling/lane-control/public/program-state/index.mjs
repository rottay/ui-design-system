#!/usr/bin/env node
/**
 * @fileoverview DELIVERABLE 4 — the state-file writer.
 *
 * `PROGRAM-STATE.md` opens by declaring its own rule: *nothing in this file
 * may be a number a command could produce*. A rule a document states about
 * itself is enforced by whoever last edited it, which is to say by nobody.
 * This command is the enforcement.
 *
 * THE TRANSITION IS THE WRITE. §4 is not edited; it is RENDERED, from an
 * intent file plus a derivation performed at write time. The intent file
 * holds only what a human decides — which wave, what blocks it, which lane
 * gets which model and why. Every figure comes from the derivation and is
 * interpolated through a `{{derived.…}}` placeholder.
 *
 * THE RULE IS ENFORCED ON THE INTENT, NOT ON THE OUTPUT. Before rendering,
 * every prose string in the intent is scanned: a commit-sha-shaped token is
 * refused outright, and any integer equal to a value the derivation just
 * produced is refused with the placeholder that should have been used
 * instead. That is why the rule is checkable at all — by the time a figure
 * reaches the document, nothing can tell whether it was derived or typed.
 *
 * `--check` FAILS ON FOUR DIFFERENT THINGS, and says which:
 *   · §4 carries no stamp — it was hand-written, not transitioned
 *   · HEAD has moved since the stamp, so every derived figure is stale
 *   · the intent file changed and §4 was not re-rendered
 *   · a fresh render disagrees with the file byte-for-byte — either §4 was
 *     hand-edited, or a derived figure no longer matches the repository
 *
 * USAGE
 *   node .../program-state/index.mjs --write --intent <intent.json> [--target <PROGRAM-STATE.md>]
 *   node .../program-state/index.mjs --check --intent <intent.json> [--target <PROGRAM-STATE.md>]
 *
 * EXIT 0 clean · 1 refused / drifted · 2 could not run.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { headMeta, isDirty, repoRoot } from '../../foundation/git/index.mjs';
import { loadContext, readPlan, resolveLane } from '../../composition/plan/index.mjs';
import { buildSingleOwnerSet } from '../../runtime/shared-files/index.mjs';
import { conclude, createFindings, EXIT, parseArgs } from '../../foundation/report/index.mjs';

export const DEFAULT_TARGET = 'packages/core/test-artifacts/quality-evidence/wo-cra-23/PROGRAM-STATE.md';
const SECTION_HEADING = '## 4. STATE';
const STAMP_OPEN = '<!-- lane-control:program-state v1';
const STAMP_CLOSE = '-->';

function digest(text) {
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

/**
 * Everything §4 is allowed to state as a figure. Each entry carries the
 * command that produces it, so the rendered table is auditable line by line
 * without trusting this file.
 */
export function derive({ root, planPath }) {
  const head = headMeta(root);
  const context = loadContext({ root });
  const ledger = context.rows.ledger;

  const derived = {
    'head.short': { value: head.short, how: 'git rev-parse --short HEAD' },
    'head.committedAt': { value: head.committedAt, how: 'git log -1 --format=%cI' },
    'head.subject': { value: head.subject, how: 'git log -1 --format=%s' },
    'tree.dirty': { value: isDirty(root) ? 'yes' : 'no', how: 'git status --porcelain' },
    'ledger.families': { value: context.rows.familyRows.length, how: 'family-ledger.json rows.length' },
    'ledger.syntheticRows': { value: context.rows.syntheticRows.length, how: 'synthetic-rows.json rows.length' },
    'ledger.sharedSkinFiles': {
      value: context.rows.derivedSharedSkinFiles.size,
      how: 're-derived from rows[].skinFiles: files claimed by more than one family',
    },
    'ledger.driftClean': { value: context.rows.drift.clean ? 'yes' : 'no', how: 'derived sharedSkinFiles vs the recorded map' },
    'singleOwner.entries': {
      value: buildSingleOwnerSet(context.rows.derivedSharedSkinFiles).length,
      how: 'seeded single-owner regions + files derived as multi-owner from the ledger',
    },
    'universe.files': { value: context.universe.length, how: 'git ls-files --cached --others --exclude-standard' },
  };

  for (const [state, count] of Object.entries(ledger.counts?.byState ?? {})) {
    derived[`ledger.byState.${state}`] = { value: count, how: `family-ledger.json counts.byState.${state}` };
  }
  for (const [layer, count] of Object.entries(ledger.counts?.byLayer ?? {})) {
    derived[`ledger.byLayer.${layer}`] = { value: count, how: `family-ledger.json counts.byLayer.${layer}` };
  }

  if (planPath) {
    const plan = readPlan(`${root}/${planPath}`);
    const lanes = plan.lanes.map((lane) => resolveLane(lane, context));
    derived['plan.lanes'] = { value: lanes.length, how: `${planPath} lanes.length` };
    derived['plan.coveredFiles'] = {
      value: lanes.reduce((total, lane) => total + lane.files.length, 0),
      how: `${planPath} — files resolved by every lane's writeSet`,
    };
  }

  return derived;
}

const SHA_SHAPED = /\b[0-9a-f]{7,40}\b/g;
const INTEGER = /\b\d+\b/g;
const PLACEHOLDER = /\{\{derived\.[a-zA-Z0-9_.]+\}\}/g;

/**
 * The strings that actually reach the document, with the path each came from.
 *
 * The typed-figure rule is scoped to these and only these, because a field
 * the renderer never reads cannot put a figure into §4. Scoping it this way
 * removes the noise from annotations without licensing a single false
 * negative: everything rendered is scanned.
 */
export function collectRenderedStrings(intent) {
  const out = [];
  const push = (path, value) => {
    if (typeof value === 'string') out.push({ path, text: value });
  };
  push('$.currentWave', intent.currentWave);
  push('$.blockedOn', intent.blockedOn);
  push('$.laneTableCaption', intent.laneTableCaption);
  push('$.refusedCaption', intent.refusedCaption);
  (intent.lanes ?? []).forEach((lane, index) => {
    for (const field of ['id', 'work', 'model', 'modelReason']) push(`$.lanes[${index}].${field}`, lane[field]);
  });
  (intent.refused ?? []).forEach((entry, index) => push(`$.refused[${index}]`, entry));
  (intent.notes ?? []).forEach((entry, index) => push(`$.notes[${index}]`, entry));
  return out;
}

/**
 * Refuse any figure in the intent that the derivation could have produced.
 * This is the rule §4 states about itself, made executable.
 */
export function auditIntentForTypedFigures(intent, derived) {
  const findings = [];
  const allowed = new Map((intent.allowedLiterals ?? []).map((entry) => [String(entry.value), entry.reason ?? '']));
  const derivedNumbers = new Map();
  for (const [key, entry] of Object.entries(derived)) {
    if (typeof entry.value === 'number') derivedNumbers.set(entry.value, key);
  }

  for (const { path, text } of collectRenderedStrings(intent)) {
    const prose = text.replace(PLACEHOLDER, ' ');
    for (const match of prose.match(SHA_SHAPED) ?? []) {
      if (allowed.has(match)) continue;
      findings.push({
        rule: 'P1-typed-figure',
        message: `${path}: "${match}" is commit-sha-shaped. A sha is always derivable; use {{derived.head.short}}.`,
      });
    }
    for (const match of prose.match(INTEGER) ?? []) {
      const numeric = Number(match);
      if (!derivedNumbers.has(numeric)) continue;
      if (allowed.has(match)) continue;
      findings.push({
        rule: 'P1-typed-figure',
        message: `${path}: the figure ${match} is exactly what {{derived.${derivedNumbers.get(numeric)}}} produces. A figure a command could produce must not be typed — or, if it genuinely is not that figure, add it to allowedLiterals with a written reason.`,
      });
    }
  }

  for (const [value, reason] of allowed) {
    if (reason.trim().length < 20) {
      findings.push({
        rule: 'P1-typed-figure',
        message: `allowedLiterals entry "${value}" carries no written reason. An exception without a reason is an exemption, and this programme has none.`,
      });
    }
  }
  return findings;
}

function interpolate(text, derived, missing) {
  return String(text).replace(PLACEHOLDER, (token) => {
    const key = token.slice('{{derived.'.length, -2);
    if (!(key in derived)) {
      missing.push(key);
      return token;
    }
    return String(derived[key].value);
  });
}

/** Render §4 exactly. The stamp is inserted separately, after digesting. */
export function renderBody(intent, derived) {
  const missing = [];
  const fill = (text) => interpolate(text, derived, missing);
  const lines = [];

  lines.push(SECTION_HEADING);
  lines.push('');
  lines.push('*Everything in this section is intent. Anything derivable is derived by command, not typed here.*');
  lines.push('');
  lines.push(`**Current wave:** ${fill(intent.currentWave)}`);
  lines.push('');
  lines.push(`**Blocked on:** ${fill(intent.blockedOn)}`);
  lines.push('');

  if (intent.lanes?.length) {
    lines.push(fill(intent.laneTableCaption ?? 'Lanes:'));
    lines.push('');
    lines.push('| Lane | Work | Model | Reason for the model |');
    lines.push('|---|---|---|---|');
    for (const lane of intent.lanes) {
      lines.push(`| ${fill(lane.id)} | ${fill(lane.work)} | ${fill(lane.model)} | ${fill(lane.modelReason)} |`);
    }
    lines.push('');
  }

  if (intent.refused?.length) {
    lines.push(`**${fill(intent.refusedCaption ?? 'Refused')}:** ${intent.refused.map(fill).join(' · ')}`);
    lines.push('');
  }

  for (const note of intent.notes ?? []) {
    lines.push(fill(note));
    lines.push('');
  }

  lines.push('### Derived at write time');
  lines.push('');
  lines.push('*Produced by the command that wrote this section. Never typed, never edited.*');
  lines.push('');
  lines.push('| Fact | Value | Derivation |');
  lines.push('|---|---|---|');
  for (const key of intent.derivedFacts ?? []) {
    if (!(key in derived)) {
      missing.push(key);
      continue;
    }
    lines.push(`| \`${key}\` | ${derived[key].value} | ${derived[key].how} |`);
  }
  lines.push('');

  return { body: `${lines.join('\n')}\n`, missing };
}

export function buildStamp({ head, writtenAt, intentDigest, renderDigest }) {
  return (
    `${STAMP_OPEN} — DO NOT EDIT BY HAND. Rewrite it with:\n` +
    '     node packages/core/src/tooling/lane-control/program-state/index.mjs --write --intent <intent.json>\n' +
    `     head=${head} written=${writtenAt} intent=${intentDigest} render=${renderDigest} ${STAMP_CLOSE}`
  );
}

export function parseStamp(section) {
  const start = section.indexOf(STAMP_OPEN);
  if (start === -1) return null;
  const end = section.indexOf(STAMP_CLOSE, start);
  if (end === -1) return null;
  const text = section.slice(start, end + STAMP_CLOSE.length);
  const read = (field) => new RegExp(`${field}=([^\\s]+)`).exec(text)?.[1] ?? null;
  return { text, head: read('head'), writtenAt: read('written'), intent: read('intent'), render: read('render') };
}

/** Split a document into everything before §4, §4 itself, and everything after. */
export function splitSection(document) {
  const start = document.indexOf(SECTION_HEADING);
  if (start === -1) return null;
  const rest = document.slice(start + SECTION_HEADING.length);
  const nextHeading = rest.search(/\n## /);
  const end = nextHeading === -1 ? document.length : start + SECTION_HEADING.length + nextHeading + 1;
  return { before: document.slice(0, start), section: document.slice(start, end), after: document.slice(end) };
}

function stripStamp(section) {
  const stamp = parseStamp(section);
  if (!stamp) return section;
  return section.replace(stamp.text, '').replace(/\n{3,}/g, '\n\n');
}

function loadIntent(path) {
  const raw = readFileSync(path, 'utf8');
  return { intent: JSON.parse(raw), digest: digest(raw) };
}

function run(argv) {
  const { flags } = parseArgs(argv);
  const mode = flags.get('write') ? 'write' : flags.get('check') ? 'check' : null;
  const intentPath = flags.get('intent');
  if (!mode || !intentPath || intentPath === true) {
    console.error(
      'usage: program-state --write|--check --intent <intent.json> [--target <PROGRAM-STATE.md>] [--plan <plan.json>] [--json]',
    );
    return EXIT.USAGE;
  }

  let root;
  let intent;
  let intentDigest;
  let derived;
  let targetPath;
  let document;
  try {
    root = repoRoot();
    ({ intent, digest: intentDigest } = loadIntent(String(intentPath)));
    targetPath = typeof flags.get('target') === 'string' ? String(flags.get('target')) : `${root}/${DEFAULT_TARGET}`;
    document = readFileSync(targetPath, 'utf8');
    derived = derive({ root, planPath: typeof flags.get('plan') === 'string' ? String(flags.get('plan')) : intent.plan ?? null });
  } catch (error) {
    console.error(`✗ program-state could not run: ${error.message}`);
    return EXIT.USAGE;
  }

  const { add, findings } = createFindings();

  for (const finding of auditIntentForTypedFigures(intent, derived)) add(finding);

  const { body, missing } = renderBody(intent, derived);
  for (const key of [...new Set(missing)]) {
    add({ rule: 'P2-unknown-derivation', message: `the intent references {{derived.${key}}}, which no derivation produces` });
  }

  const split = splitSection(document);
  if (!split) {
    add({ rule: 'P3-no-section', message: `${targetPath} has no "${SECTION_HEADING}" section to transition` });
    return conclude({ name: 'program-state', findings, json: flags.get('json'), summary: '' });
  }

  if (findings.length > 0 && mode === 'write') {
    return conclude({
      name: 'program-state',
      findings,
      json: flags.get('json'),
      summary: 'refused to write: the intent has to be clean before it can become the document',
    });
  }

  const head = derived['head.short'].value;
  const renderDigest = digest(body);

  if (mode === 'write') {
    const writtenAt = new Date().toISOString();
    const stamp = buildStamp({ head, writtenAt, intentDigest, renderDigest });
    const stamped = body.replace(`${SECTION_HEADING}\n\n`, `${SECTION_HEADING}\n\n${stamp}\n\n`);
    writeFileSync(targetPath, `${split.before}${stamped}\n${split.after.replace(/^\n+/, '')}`);
    console.log(`✓ program-state: §4 written against HEAD ${head} (intent ${intentDigest}, render ${renderDigest})`);
    console.log(`  target: ${targetPath}`);
    return EXIT.OK;
  }

  const stamp = parseStamp(split.section);
  if (!stamp) {
    add({
      rule: 'P4-unstamped',
      message: `§4 carries no stamp: it was hand-written rather than transitioned. Run --write to make it a command output.`,
    });
  } else {
    if (stamp.head !== head) {
      add({
        rule: 'P5-head-moved',
        message: `§4 was written against HEAD ${stamp.head}; HEAD is now ${head}. Every derived figure in it is stale until it is re-written.`,
      });
    }
    if (stamp.intent !== intentDigest) {
      add({
        rule: 'P6-intent-drift',
        message: `the intent file has changed (stamp ${stamp.intent}, now ${intentDigest}) and §4 was not re-rendered`,
      });
    }
    if (stamp.render !== renderDigest) {
      add({
        rule: 'P7-render-drift',
        message: `a fresh render digests to ${renderDigest}; the stamp says ${stamp.render}. Either §4 was hand-edited, or a derived figure no longer matches the repository.`,
      });
    }
  }

  const actual = stripStamp(split.section).trimEnd();
  const expected = body.trimEnd();
  if (actual !== expected) {
    const actualLines = actual.split('\n');
    const expectedLines = expected.split('\n');
    const first = actualLines.findIndex((line, index) => line !== expectedLines[index]);
    add({
      rule: 'P8-body-mismatch',
      message: '§4 does not byte-match a fresh render from the intent',
      details: [
        `first difference at line ${first + 1} of the section`,
        `in the file : ${JSON.stringify(actualLines[first] ?? '<end of section>')}`,
        `fresh render: ${JSON.stringify(expectedLines[first] ?? '<end of section>')}`,
      ],
    });
  }

  return conclude({
    name: 'program-state',
    findings,
    json: flags.get('json'),
    summary: `target ${targetPath} · HEAD ${head}`,
  });
}

if (process.argv[1]?.endsWith('program-state/index.mjs')) {
  process.exit(run(process.argv.slice(2)));
}

export { run };
