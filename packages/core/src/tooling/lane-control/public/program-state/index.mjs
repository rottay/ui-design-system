#!/usr/bin/env node
/**
 * @fileoverview DELIVERABLE 4 — the state-file writer.
 *
 * The Modern Rescue README declares its own rule: *nothing in its generated
 * checkpoint may be a number a command could produce*. A rule a document states about
 * itself is enforced by whoever last edited it, which is to say by nobody.
 * This command is the enforcement.
 *
 * THE TRANSITION IS THE WRITE. The checkpoint is not edited; it is RENDERED, from an
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
 * `--check` reports provenance and FAILS ON THREE different contract drifts:
 *   · the checkpoint carries no stamp — it was hand-written, not transitioned
 *   · the intent file changed and the checkpoint was not re-rendered
 *   · a fresh render disagrees with the file byte-for-byte — either the checkpoint was
 *     hand-edited, or a derived figure no longer matches the repository
 * HEAD movement is reported as provenance but does not make the checkpoint
 * unsatisfiable after its own commit.
 *
 * USAGE
 *   node .../program-state/index.mjs --write --intent <intent.json> [--target <README.md>]
 *   node .../program-state/index.mjs --check --intent <intent.json> [--target <README.md>]
 *
 * EXIT 0 clean · 1 refused / drifted · 2 could not run.
 */
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { distanceFrom, headMeta, isDirty, pathChangedSince, repoRoot } from '../../foundation/git/index.mjs';
import { loadContext, readPlan, resolveLane } from '../../composition/plan/index.mjs';
import { buildSingleOwnerSet } from '../../runtime/shared-files/index.mjs';
import { conclude, createFindings, EXIT, parseArgs } from '../../foundation/report/index.mjs';

export const DEFAULT_TARGET = 'packages/core/scripts/quality-evidence/programs/modern-rescue/README.md';
export const MANIFEST_INDEX_PATH = 'packages/core/manifest/index.json';
export const FAMILY_INVENTORY_PATH = 'packages/core/scripts/quality-evidence/programs/modern-rescue/family-inventory.json';

/**
 * The exact CLI vocabulary this command parses — the single place that says so.
 *
 * It is also the contract the gate manifest is held to: `gates-manifest.flags.test.mjs`
 * reads THIS source to refuse a flag no target script recognises, and it looks for the
 * flag spelled with its dashes. `parseArgs` stores names stripped (`flags.get('check')`),
 * so before this list existed the dashed spelling appeared nowhere and every flag the
 * manifest handed this command read as phantom. The list is consumed by the usage
 * message below: a vocabulary nobody prints is a vocabulary nobody can be wrong about,
 * which is the exact failure that test exists to catch.
 */
export const FLAGS = Object.freeze(['--write', '--check', '--intent', '--target', '--plan', '--json']);
const SECTION_HEADING = '## Current checkpoint';
const STAMP_OPEN = '<!-- lane-control:program-state v1';
const STAMP_CLOSE = '-->';

function digest(text) {
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

/**
 * VOLATILITY — the field that decides whether a figure may be written INTO the
 * document, and the reason `--check` is satisfiable at all.
 *
 * The first version of this command pinned `head.short` into the rendered body
 * and byte-verified the body. Committing the render moved HEAD past the value
 * the render contained, so the document was stale the instant it was committed
 * and no sequence of operations could make the check green again. P5, P7 and P8
 * all fired, and all three were the same defect: a value that changes without
 * anybody deciding anything had been frozen into a document that claims to
 * state decisions.
 *
 * The cut is not "HEAD-sensitive" — it is:
 *
 *   PINNED      changes only when somebody changes what the checkpoint is ABOUT.
 *               Rendered into the body, byte-verified, full teeth. If one of
 *               these moves, the checkpoint genuinely needs rewriting and red is correct.
 *
 *   PROVENANCE  changes as a side effect of ordinary work — every commit, every
 *               new file, every lane that writes anything. NEVER rendered into
 *               the body. HEAD identity lives in the stamp, where it records
 *               what the render was produced against rather than making a claim
 *               about now; the rest is reported live by the check.
 *
 * `universe.files` and `plan.coveredFiles` are provenance for the same reason
 * `head.short` is: they move when a lane does its job. Pinning them would put
 * the check back where it started, one commit later.
 *
 * Removing these from the body does not weaken the check — it is what lets the
 * check be READ. While the checkpoint was permanently red over HEAD drift, a real
 * `inventory.families` disagreement was invisible underneath it.
 */
export const PINNED = 'pinned';
export const PROVENANCE = 'provenance';

export function derive({ root, planPath }) {
  const head = headMeta(root);
  const context = loadContext({ root });
  const manifestIndex = JSON.parse(readFileSync(`${root}/${MANIFEST_INDEX_PATH}`, 'utf8'));
  // The denominator is READ from the active family inventory, never restated here. This check
  // used to compare against a literal 252; when the catalog moved to 253 the literal became a
  // second, stale authority that could only fail. The inventory is the one place a family id
  // is declared, so agreement with it is the real invariant.
  const familyInventory = JSON.parse(readFileSync(`${root}/${FAMILY_INVENTORY_PATH}`, 'utf8'));
  const inventoryFamilies = familyInventory.rows.length;
  const inventoryCounts = familyInventory.counts ?? {};
  const familyReviews = manifestIndex?.rollups?.familyReviews;
  if (!familyReviews || manifestIndex?.denominators?.canonicalFamilies !== inventoryFamilies) {
    throw new Error(
      `lane-control: customization manifest index must carry a ${inventoryFamilies}-family review rollup, found ${manifestIndex?.denominators?.canonicalFamilies ?? 'none'}`,
    );
  }
  const reviewTotal =
    familyReviews.unreviewed
    + familyReviews.accepted
    + familyReviews.assessedNotElevated
    + familyReviews.blockedOwnerDecision;
  if (reviewTotal !== manifestIndex.denominators.canonicalFamilies) {
    throw new Error(
      `lane-control: customization manifest family review rollup totals ${reviewTotal}, expected ${manifestIndex.denominators.canonicalFamilies}`,
    );
  }

  const derived = {
    // Provenance — never pinned into the body.
    'head.short': { value: head.short, how: 'git rev-parse --short HEAD', volatility: PROVENANCE },
    'head.committedAt': { value: head.committedAt, how: 'git log -1 --format=%cI', volatility: PROVENANCE },
    'head.subject': { value: head.subject, how: 'git log -1 --format=%s', volatility: PROVENANCE },
    'tree.dirty': { value: isDirty(root) ? 'yes' : 'no', how: 'git status --porcelain', volatility: PROVENANCE },
    'universe.files': {
      value: context.universe.length,
      how: 'git ls-files --cached --others --exclude-standard',
      volatility: PROVENANCE,
    },

    // Pinned — a claim about the programme, byte-verified on every check.
    //
    // Every figure below is sourced from an ACTIVE, regenerated document. They were previously
    // read from `family-ledger.json` — sealed historical evidence from an earlier era of the
    // catalog. That made the archive an authority on the present: the checkpoint could not state
    // today's denominator until somebody rewrote history to agree with it, which is the opposite
    // of what an archive is for. The archive is now an input to nothing, including the lane
    // bounds; family lanes are bounded by the same inventory these figures come from.
    'inventory.families': {
      value: inventoryFamilies,
      how: `${FAMILY_INVENTORY_PATH} rows.length`,
      volatility: PINNED,
    },
    'manifest.controlFamilyCells': {
      value: manifestIndex.denominators.controlFamilyCells,
      how: `${MANIFEST_INDEX_PATH} denominators.controlFamilyCells`,
      volatility: PINNED,
    },
    'ownership.syntheticRows': {
      value: context.rows.syntheticRows.length,
      how: 'synthetic-rows.json rows.length — the non-family lanes',
      volatility: PINNED,
    },
    'singleOwner.entries': {
      value: buildSingleOwnerSet().length,
      how: 'architecturally shared regions no family source owner contains',
      volatility: PINNED,
    },
  };

  derived['adjudication.accepted'] = {
    value: familyReviews.accepted,
    how: `${MANIFEST_INDEX_PATH} rollups.familyReviews.accepted`,
    volatility: PINNED,
  };
  derived['adjudication.assessedNotElevated'] = {
    value: familyReviews.assessedNotElevated,
    how: `${MANIFEST_INDEX_PATH} rollups.familyReviews.assessedNotElevated`,
    volatility: PINNED,
  };
  derived['adjudication.unreviewed'] = {
    value: familyReviews.unreviewed,
    how: `${MANIFEST_INDEX_PATH} rollups.familyReviews.unreviewed`,
    volatility: PINNED,
  };
  // Per-layer counts follow the same rule as the total: derived from the active inventory,
  // whose five canonical layers are the ones the catalog actually has. The ledger's byLayer
  // table still carries the retired `commercial` and `surface-composition` buckets.
  for (const [layer, count] of Object.entries(inventoryCounts)) {
    derived[`inventory.byLayer.${layer}`] = {
      value: count,
      how: `${FAMILY_INVENTORY_PATH} counts.${layer}`,
      volatility: PINNED,
    };
  }

  if (planPath) {
    const plan = readPlan(`${root}/${planPath}`);
    const lanes = plan.lanes.map((lane) => resolveLane(lane, context));
    derived['plan.lanes'] = { value: lanes.length, how: `${planPath} lanes.length`, volatility: PINNED };
    derived['plan.coveredFiles'] = {
      value: lanes.reduce((total, lane) => total + lane.files.length, 0),
      how: `${planPath} — files resolved by every lane's writeSet`,
      volatility: PROVENANCE,
    };
  }

  return derived;
}

export function isProvenance(derived, key) {
  return derived[key]?.volatility === PROVENANCE;
}

// CASE-INSENSITIVE, because git is. `git rev-parse 68F258690` resolves the
// same commit as `68f258690`, so a lowercase-only rule refused one spelling of
// a frozen HEAD and wrote the other into the checkpoint. Hex is hex whichever
// case it is typed in.
const SHA_SHAPED = /\b[0-9a-f]{7,40}\b/gi;
const INTEGER = /\b\d+\b/g;
const PLACEHOLDER = /\{\{derived\.[a-zA-Z0-9_.]+\}\}/g;

/**
 * The strings that actually reach the document, with the path each came from.
 *
 * The typed-figure rule is scoped to these and only these, because a field
 * the renderer never reads cannot put a figure into the checkpoint. Scoping it this way
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
 * This is the rule the checkpoint states about itself, made executable.
 */
export function auditIntentForTypedFigures(intent, derived) {
  const findings = [];
  const allowed = new Map((intent.allowedLiterals ?? []).map((entry) => [String(entry.value), entry.reason ?? '']));
  // ONLY PINNED FIGURES PARTICIPATE.
  //
  // A provenance value is volatile, so comparing prose against it makes this
  // rule's verdict depend on unrelated repository activity: the same intent
  // passes this afternoon and fails after somebody adds a file. A check whose
  // answer flips with work it does not describe is the disease the volatility
  // model exists to cure, and it must not be reintroduced through the back
  // door of the typed-figure audit. Shas remain refused unconditionally below,
  // and P9 already stops a provenance value being placeheld into prose.
  const derivedNumbers = new Map();
  for (const [key, entry] of Object.entries(derived)) {
    if (entry.volatility === PROVENANCE) continue;
    if (typeof entry.value === 'number') derivedNumbers.set(entry.value, key);
  }

  for (const { path, text } of collectRenderedStrings(intent)) {
    const prose = text.replace(PLACEHOLDER, ' ');
    // A SHA IS REFUSED UNCONDITIONALLY, AND `allowedLiterals` CANNOT REACH IT.
    //
    // The exception list exists for one situation and one only: an integer that
    // happens to equal a derived figure while meaning something else — a wave
    // number colliding with a family count. A sha has no such reading. It is
    // always derivable, it is always provenance, and it is stale the moment it
    // is typed, so "explaining" one cannot make it correct. Consulting the
    // allowlist first made the unconditional rule conditional: `allowedLiterals:
    // [{value: "68f2586", reason: "…"}]` walked a frozen HEAD straight into a
    // document whose whole purpose is to not carry one.
    for (const match of prose.match(SHA_SHAPED) ?? []) {
      findings.push({
        rule: 'P1-typed-figure',
        message: `${path}: "${match}" is commit-sha-shaped. A sha is always derivable; use {{derived.head.short}}. allowedLiterals does not apply to shas — it covers integer collisions only.`,
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
    // The list is scoped at its own edge, not only where it is consulted: an
    // exception that is not an integer collision has nothing to be an exception
    // TO, and the only reason to write one is to launder a sha.
    if (!/^\d+$/.test(value)) {
      findings.push({
        rule: 'P1-typed-figure',
        message: `allowedLiterals entry "${value}" is not an integer. This list covers one case — an integer that collides with a derived figure while meaning something else. A sha, a path or a name is never an allowed literal.`,
      });
    }
    if (reason.trim().length < 20) {
      findings.push({
        rule: 'P1-typed-figure',
        message: `allowedLiterals entry "${value}" carries no written reason. An exception without a reason is an exemption, and this programme has none.`,
      });
    }
  }
  return findings;
}

function interpolate(text, derived, missing, pinnedProvenance) {
  return String(text).replace(PLACEHOLDER, (token) => {
    const key = token.slice('{{derived.'.length, -2);
    if (!(key in derived)) {
      missing.push(key);
      return token;
    }
    if (isProvenance(derived, key)) {
      // Interpolating a provenance value into prose freezes it into the body
      // just as surely as listing it in derivedFacts. This is the hole the
      // first version fell through, so it is closed on both paths.
      pinnedProvenance.push(key);
      return token;
    }
    return String(derived[key].value);
  });
}

/** Render the checkpoint exactly. The stamp is inserted separately, after digesting. */
export function renderBody(intent, derived) {
  const missing = [];
  const pinnedProvenance = [];
  const fill = (text) => interpolate(text, derived, missing, pinnedProvenance);
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
  lines.push('*These figures change only when somebody changes what this section is about, so a');
  lines.push('disagreement between them and the repository is a real finding. Facts that move with');
  lines.push('ordinary work — HEAD, the file count, what the lanes have written — are deliberately');
  lines.push('absent: pinning them here would make this document stale the moment it was committed.*');
  lines.push('');
  lines.push('| Fact | Value | Derivation |');
  lines.push('|---|---|---|');
  for (const key of intent.derivedFacts ?? []) {
    if (!(key in derived)) {
      missing.push(key);
      continue;
    }
    if (isProvenance(derived, key)) {
      pinnedProvenance.push(key);
      continue;
    }
    lines.push(`| \`${key}\` | ${derived[key].value} | ${derived[key].how} |`);
  }
  lines.push('');

  return { body: `${lines.join('\n')}\n`, missing, pinnedProvenance };
}

export function buildStamp({ head, writtenAt, intentDigest, renderDigest }) {
  return (
    `${STAMP_OPEN} — DO NOT EDIT BY HAND. Rewrite it with:\n` +
    '     node packages/core/src/tooling/lane-control/public/program-state/index.mjs --write --intent <intent.json>\n' +
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

/** Split a document around the generated checkpoint. */
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

/**
 * What the coordinator loses when HEAD drift stops being a violation: the
 * distance, and whether the file itself moved with it. Both are reported so
 * the signal survives without the unsatisfiable predicate.
 */
function describeDrift(root, stamp, head, targetPath) {
  if (stamp.head === head) return [`written against HEAD ${stamp.head}, which is still HEAD`];
  const distance = distanceFrom(root, stamp.head);
  const touched = pathChangedSince(root, stamp.head, targetPath);
  const lines = [
    distance === null
      ? `written against HEAD ${stamp.head}, which this clone cannot resolve (amended, rebased, or never here)`
      : `written against HEAD ${stamp.head}; HEAD is now ${head} — ${distance} commit(s) since`,
  ];
  if (touched === true) {
    lines.push(`${targetPath} has itself changed in a commit since the stamp — verified below by re-derivation, not by trust`);
  } else if (touched === false) {
    lines.push(`${targetPath} has not changed in any commit since the stamp`);
  }
  return lines;
}

function run(argv) {
  const { flags } = parseArgs(argv);
  const mode = flags.get('write') ? 'write' : flags.get('check') ? 'check' : null;
  const intentPath = flags.get('intent');
  if (!mode || !intentPath || intentPath === true) {
    console.error(
      'usage: program-state --write|--check --intent <intent.json> [--target <README.md>] [--plan <plan.json>] [--json]',
    );
    console.error(`accepted flags: ${FLAGS.join(' ')}`);
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
  const provenanceReport = [];

  for (const finding of auditIntentForTypedFigures(intent, derived)) add(finding);

  const { body, missing, pinnedProvenance } = renderBody(intent, derived);
  for (const key of [...new Set(missing)]) {
    add({ rule: 'P2-unknown-derivation', message: `the intent references {{derived.${key}}}, which no derivation produces` });
  }
  for (const key of [...new Set(pinnedProvenance)]) {
    add({
      rule: 'P9-provenance-pinned',
      message: `"${key}" is a PROVENANCE fact and may not be written into the checkpoint. It moves with ordinary work, so pinning it would make this document stale the moment it is committed — which is exactly the defect that made --check unsatisfiable.`,
      details: [`${key} is reported live by --check instead; HEAD identity is recorded in the stamp as provenance.`],
    });
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
    console.log(`✓ program-state: checkpoint written against HEAD ${head} (intent ${intentDigest}, render ${renderDigest})`);
    console.log(`  target: ${targetPath}`);
    return EXIT.OK;
  }

  const stamp = parseStamp(split.section);
  if (!stamp) {
    add({
      rule: 'P4-unstamped',
      message: `the checkpoint carries no stamp: it was hand-written rather than transitioned. Run --write to make it a command output.`,
    });
  } else {
    // HEAD DRIFT IS REPORTED, NOT REFUSED.
    //
    // It was a violation in the first version, and it made the check
    // unsatisfiable: committing the render moves HEAD past the stamp, so the
    // file was stale the instant it was committed. It was also the wrong
    // instrument. "Has HEAD moved?" is a PROXY for "is this document still
    // true?", and P7/P8 answer that question directly by re-deriving every
    // pinned fact and byte-comparing. With the volatile values out of the
    // body, the proxy reports nothing the direct measurement misses — it only
    // buried it. So the drift is printed, with its distance, and the
    // coordinator decides what it means.
    provenanceReport.push(...describeDrift(root, stamp, head, targetPath));
    if (stamp.intent !== intentDigest) {
      add({
        rule: 'P6-intent-drift',
        message: `the intent file has changed (stamp ${stamp.intent}, now ${intentDigest}) and the checkpoint was not re-rendered`,
      });
    }
    if (stamp.render !== renderDigest) {
      add({
        rule: 'P7-render-drift',
        message: `a fresh render digests to ${renderDigest}; the stamp says ${stamp.render}. Either the checkpoint was hand-edited, or a derived figure no longer matches the repository.`,
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
      message: 'the checkpoint does not byte-match a fresh render from the intent',
      details: [
        `first difference at line ${first + 1} of the section`,
        `in the file : ${JSON.stringify(actualLines[first] ?? '<end of section>')}`,
        `fresh render: ${JSON.stringify(expectedLines[first] ?? '<end of section>')}`,
      ],
    });
  }

  if (!flags.get('json')) {
    console.log('provenance (reported, never refused):');
    for (const entry of provenanceReport) console.log(`  · ${entry}`);
    for (const [key, entry] of Object.entries(derived)) {
      if (entry.volatility !== PROVENANCE) continue;
      console.log(`  · ${key} = ${entry.value}  (${entry.how})`);
    }
  }

  return conclude({
    name: 'program-state',
    findings,
    json: flags.get('json'),
    summary: `target ${targetPath} · HEAD ${head}`,
  });
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
  process.exit(run(process.argv.slice(2)));
}

export { run };
