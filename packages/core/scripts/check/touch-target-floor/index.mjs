/**
 * The 44px touch-target FLOOR VALUE contract (WO-INV-03, F-47).
 *
 * NOT the same authority as its peer `scripts/check/touch-targets/`, which
 * discovers WHICH boxes are interactive and proves each has a floor on its own
 * row. This measures WHAT THE FLOOR RESOLVES TO: one canonical channel, a
 * physical pixel length, reaching every component channel a Modern skin reads
 * AFTER the three compiled tenant artifacts overlay it. A per-selector proof
 * over a channel that resolves to 41.25px is a proof of nothing, which is why
 * the two are separate questions and neither subsumes the other.
 *
 * WHY PHYSICAL PIXELS. The DS root font-size is fluid and resolves to 15px at
 * narrow widths, so `2.75rem` -- the spelling this corpus is full of -- is
 * 41.25px exactly where a coarse pointer is being used. The floor block in
 * `facade/entrypoints/base/index.css` states this law in its own docblock; this
 * gate is what makes it fail.
 *
 * FOUR LEGS
 *   (a) declaration   one authored declaration of `--ds-touch-target-min`, a
 *                     physical px at or above EXPRESSIVE_A11Y_FLOORS, and no
 *                     artifact redeclaring it
 *   (b) reach         every touch channel read under a coarse pointer resolves
 *                     to the floor in ALL THREE verticals, judged per cascade
 *                     context by `reach/`
 *   (c) exclusions    the floor block's six documented opt-outs are closed,
 *                     each carries a written reason, and the four indicator
 *                     roles carry a named compensating per-component floor
 *   (d) engine scope  the block keeps the all-engine selector roster it shipped
 *                     with, Classic rows included -- INV-03 gates the floor and
 *                     narrows nothing
 *
 * CONTRACT, NOT RATCHET: there is no `ratchet:` on the manifest row and no
 * debtRatio. The Q11 ledger (`ledger/index.json`) was decrease-only and has
 * drained to zero rows, so the file is gone and recreating it is refused.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildCascade, collectDeclarations, collectTouchReads, reachesFloor } from './reach/index.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = resolve(here, '../../..');
const CSS_ROOT = resolve(CORE_ROOT, 'src/foundation/tokens/css');
const ENTRYPOINT = resolve(CSS_ROOT, 'facade/entrypoints/base/index.css');
const FLOORS_TS = resolve(CORE_ROOT, 'src/foundation/tokens/ts/presentation/expressive-profiles/index.ts');
const LEDGER = resolve(here, 'ledger/index.json');
const VERTICALS = ['bithire', 'evnto', 'rottay'];
const CANONICAL = '--ds-touch-target-min';
const SKIN_DIR = 'runtime/engines/modern/skin/';

/** The floor is the TS constant's, read from source so the two cannot drift. */
export function readFloorPx(source) {
  const match = /touchTargetMinPx:\s*(\d+)/.exec(source);
  if (!match) throw new Error('EXPRESSIVE_A11Y_FLOORS.touchTargetMinPx not found — the extraction rotted, not the floor');
  return Number(match[1]);
}

const IMPORT_RULE = /@import\s+(?:url\()?["']([^"']+)["']\)?[^;]*;/g;

/** The real cascade: the entrypoint's `@import` graph, in source order. */
export function loadImportGraph(entry, seen = new Set(), out = []) {
  if (seen.has(entry) || !existsSync(entry)) return out;
  seen.add(entry);
  const content = readFileSync(entry, 'utf8');
  IMPORT_RULE.lastIndex = 0;
  for (let match = IMPORT_RULE.exec(content); match; match = IMPORT_RULE.exec(content)) {
    loadImportGraph(resolve(dirname(entry), match[1]), seen, out);
  }
  out.push({ name: relative(CORE_ROOT, entry), content });
  return out;
}

function artifact(vertical) {
  const path = resolve(CSS_ROOT, `facade/artifacts/${vertical}/index.css`);
  return { name: relative(CORE_ROOT, path), content: readFileSync(path, 'utf8') };
}

// --- (a) -------------------------------------------------------------------

export function auditDeclaration(declarations, floorPx) {
  const problems = [];
  const authored = declarations.filter(
    (row) => row.channel === CANONICAL && !row.file.includes('facade/artifacts/')
  );
  const emitted = declarations.filter(
    (row) => row.channel === CANONICAL && row.file.includes('facade/artifacts/')
  );
  if (authored.length !== 1) {
    problems.push(
      `${CANONICAL} must be declared exactly once in authored CSS; found ${authored.length}` +
        (authored.length > 0 ? ` at ${authored.map((row) => `${row.file}:${row.line}`).join(', ')}` : '')
    );
  }
  for (const row of emitted) {
    problems.push(
      `${row.file}:${row.line} redeclares ${CANONICAL}. The canonical floor is not a tenant decision; an artifact that states it can lower it below ${floorPx}px for one vertical only.`
    );
  }
  for (const row of authored) {
    if (!row.file.endsWith('foundation/themes/default/index.css')) {
      problems.push(`${CANONICAL} is declared at ${row.file}:${row.line}; its one home is foundation/themes/default/index.css`);
    }
    const pixels = /^(-?\d+(?:\.\d+)?)px$/.exec(row.value);
    if (!pixels) {
      problems.push(
        `${CANONICAL} = ${row.value} at ${row.file}:${row.line}. The floor must be a bare physical pixel length: this tree's fluid root resolves to 15px at narrow widths, where 2.75rem is 41.25px.`
      );
      continue;
    }
    if (Number(pixels[1]) < floorPx) {
      problems.push(`${CANONICAL} = ${row.value} at ${row.file}:${row.line}, below the ${floorPx}px floor`);
    }
  }
  return problems;
}

// --- (b) -------------------------------------------------------------------

export function auditReach(authoredSources, artifacts, floorPx, ledgerRows) {
  const reads = collectTouchReads(authoredSources.filter((source) => source.name.includes(SKIN_DIR)));
  const problems = [];
  const failing = new Map();
  for (const { vertical, source } of artifacts) {
    const cascade = buildCascade(collectDeclarations([...authoredSources, source]));
    for (const read of reads) {
      const verdict = reachesFloor(read.expression, cascade, floorPx);
      if (verdict.reached) continue;
      const row = failing.get(read.channel) ?? { verticals: new Set(), sites: new Set(), why: verdict.why };
      row.verticals.add(vertical);
      row.sites.add(`${read.file}:${read.line}`);
      failing.set(read.channel, row);
    }
  }
  const ledgered = new Set(ledgerRows.map((row) => row.channel));
  for (const [channel, row] of failing) {
    if (ledgered.has(channel)) continue;
    problems.push(
      `${channel} does not reach the ${floorPx}px floor in ${[...row.verticals].join('/')} — read at ${[...row.sites].join(', ')}. ${row.why}`
    );
  }
  for (const channel of ledgered) {
    if (failing.has(channel)) continue;
    problems.push(
      `ledger/index.json still carries ${channel}, which now reaches the floor. The ledger is decrease-only: delete the row and record the commit that repaired it.`
    );
  }
  return { problems, reads: reads.length, failing };
}

// --- (c) + (d) -------------------------------------------------------------

/**
 * The four roles the floor block hands to a per-component floor, and the skin
 * that owes it. `[role="option"]` and `[role="row"]` are deliberately absent:
 * the block excludes them because a virtualized list computes its offsets from
 * a configured row height that a CSS floor would desynchronize, so there is no
 * compensating 44px floor to demand and demanding one would be wrong.
 */
export const COMPENSATED_EXCLUSIONS = Object.freeze({
  '[role="checkbox"]': { skin: 'checkbox', channel: '--ds-checkbox-touch-target-min' },
  '[role="radio"]': { skin: 'radio', channel: '--ds-radio-touch-target-min' },
  '[role="switch"]': { skin: 'toggle', channel: '--ds-toggle-touch-target-min' },
  '[role="slider"]': { skin: 'slider', channel: '--ds-slider-touch-target-min' },
});

export const UNCOMPENSATED_EXCLUSIONS = Object.freeze(['[role="option"]', '[role="row"]']);

/** The all-engine roster the block shipped with, Classic rows included. */
export const FLOOR_SELECTORS = Object.freeze([
  'button',
  '[role="button"]',
  'a',
  '[data-ds-interactive="true"]',
  'input[type="checkbox"]',
  'input[type="radio"]',
  'select',
  '[role="combobox"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  'summary',
  '.ant-btn',
  '.ant-select-selector',
  '.ant-tabs-tab',
  '.ant-pagination-item',
  '.ant-tag',
]);

const BLOCK_START = /@media\s*\(\s*pointer\s*:\s*coarse\s*\)\s*\{/;

/** The floor block's text, its selector roster, and whether a `@layer` encloses it. */
export function readFloorBlock(entrypointCss) {
  const match = BLOCK_START.exec(entrypointCss);
  if (!match) return null;
  const openIndex = match.index + match[0].length - 1;
  let depth = 0;
  let end = -1;
  for (let cursor = openIndex; cursor < entrypointCss.length; cursor += 1) {
    if (entrypointCss[cursor] === '{') depth += 1;
    else if (entrypointCss[cursor] === '}') {
      depth -= 1;
      if (depth === 0) {
        end = cursor;
        break;
      }
    }
  }
  if (end === -1) return null;
  const before = entrypointCss.slice(0, match.index).replace(/\/\*[\s\S]*?\*\//g, '');
  // An unclosed `@layer name { … }` anywhere above would enclose the block.
  const opens = (before.match(/@layer[^;{]*\{/g) ?? []).length;
  const closes = (before.match(/\}/g) ?? []).length;
  const selectors = entrypointCss
    .slice(openIndex + 1, entrypointCss.indexOf('{', openIndex + 1))
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  const docblockEnd = match.index;
  const docblockStart = entrypointCss.lastIndexOf('/*', docblockEnd);
  return {
    body: entrypointCss.slice(match.index, end + 1),
    docblock: docblockStart === -1 ? '' : entrypointCss.slice(docblockStart, docblockEnd),
    selectors,
    layered: opens > closes,
  };
}

export function auditFloorBlock(entrypointCss, skinSources, cascade, floorPx) {
  const problems = [];
  const block = readFloorBlock(entrypointCss);
  if (!block) {
    return [`no \`@media (pointer: coarse)\` floor block in facade/entrypoints/base/index.css — the shared floor is gone`];
  }
  if (block.layered) {
    problems.push(
      'the coarse-pointer floor block sits inside an @layer. Layered, it lands in a named layer below rottay-engines and any skin declaring its own min-block-size silently defeats it.'
    );
  }
  for (const selector of FLOOR_SELECTORS) {
    if (!block.selectors.includes(selector)) {
      problems.push(`the floor block no longer selects ${selector}; the roster is a superset contract, not a menu`);
    }
  }
  for (const value of [`var(${CANONICAL})`]) {
    if (!block.body.includes(value)) problems.push(`the floor block no longer sizes from ${value}`);
  }
  // Only the paragraph that DECLARES the exclusions is read: the prose above
  // it names `[role="combobox"]` as a roster inclusion.
  const exclusionMarker = block.docblock.indexOf('Deliberately EXCLUDED');
  if (exclusionMarker === -1) {
    problems.push(
      'the floor block docblock no longer carries its `Deliberately EXCLUDED` paragraph. The six opt-outs are only safe while each is written down with the reason a 44px floor would redesign the control rather than enlarge it.'
    );
  }
  const exclusionProse = exclusionMarker === -1 ? '' : block.docblock.slice(exclusionMarker);
  for (const role of [...Object.keys(COMPENSATED_EXCLUSIONS), ...UNCOMPENSATED_EXCLUSIONS]) {
    if (block.selectors.includes(role)) {
      problems.push(`${role} is both excluded in the docblock and present in the selector roster`);
    }
    if (!exclusionProse.includes(role)) {
      problems.push(`${role} is excluded from the floor but the docblock no longer states why. An exclusion with no written reason is an omission.`);
    }
  }
  const declaredRoles = [...exclusionProse.matchAll(/\[role="([a-z]+)"\]/g)].map((match) => match[1]);
  const known = new Set(
    [...Object.keys(COMPENSATED_EXCLUSIONS), ...UNCOMPENSATED_EXCLUSIONS].map((role) => /"([a-z]+)"/.exec(role)[1])
  );
  for (const role of new Set(declaredRoles)) {
    if (!known.has(role)) {
      problems.push(
        `the docblock excludes [role="${role}"], which this contract does not know. A new exclusion needs a compensating per-component floor or a written reason it cannot have one.`
      );
    }
  }
  for (const [role, { skin, channel }] of Object.entries(COMPENSATED_EXCLUSIONS)) {
    const source = skinSources.find((entry) => entry.name.includes(`${SKIN_DIR}${skin}/`));
    if (!source) {
      problems.push(`${role} is compensated by the ${skin} skin, which is not in the entrypoint's import graph`);
      continue;
    }
    const reads = collectTouchReads([source]).filter((read) => read.channel === channel);
    const coarse = reads.filter((read) => read.conditions.some((condition) => /pointer:\s*coarse|hover:\s*none/.test(condition)));
    if (coarse.length === 0) {
      problems.push(
        `${role} is excluded from the shared floor and the ${skin} skin declares no coarse-pointer floor on ${channel}. The exclusion is uncompensated: nothing floors that control.`
      );
      continue;
    }
    const unreached = coarse.filter((read) => !reachesFloor(read.expression, cascade, floorPx).reached);
    for (const read of unreached) {
      problems.push(`${role}'s compensating floor at ${read.file}:${read.line} does not reach ${floorPx}px: ${read.expression}`);
    }
  }
  return problems;
}

// --- ledger ----------------------------------------------------------------

export function readLedger(path = LEDGER) {
  if (!existsSync(path)) return { rows: [], problems: [] };
  const ledger = JSON.parse(readFileSync(path, 'utf8'));
  const problems = [];
  for (const field of ['purpose', 'owner', 'provenance', 'retire']) {
    if (typeof ledger[field] !== 'string' || ledger[field].trim().length < 24) {
      problems.push(`ledger/index.json: \`${field}\` must be a written statement, not a placeholder`);
    }
  }
  for (const row of ledger.rows ?? []) {
    for (const field of ['channel', 'class', 'owner', 'reason']) {
      if (typeof row[field] !== 'string' || row[field].trim().length === 0) {
        problems.push(`ledger/index.json: row ${row.channel ?? '(unnamed)'} is missing \`${field}\``);
      }
    }
  }
  return { rows: ledger.rows ?? [], problems };
}

// --- run -------------------------------------------------------------------

/** The drills inject a ledger path and a rewritten artifact; the gate reads the tree. */
export function audit({ ledgerPath = LEDGER, rewriteArtifact = (_vertical, source) => source } = {}) {
  const floorPx = readFloorPx(readFileSync(FLOORS_TS, 'utf8'));
  const entrypointCss = readFileSync(ENTRYPOINT, 'utf8');
  const authored = loadImportGraph(ENTRYPOINT);
  const artifacts = VERTICALS.map((vertical) => ({ vertical, source: rewriteArtifact(vertical, artifact(vertical)) }));
  const declarations = collectDeclarations([...authored, ...artifacts.map((entry) => entry.source)]);
  const cascade = buildCascade(declarations);
  const ledger = readLedger(ledgerPath);
  if (existsSync(ledgerPath)) {
    ledger.problems.push(
      'ledger/index.json: the Q11 ledger drained to zero rows and was deleted; a new row is a new exemption, not debt. Repair the channel instead.'
    );
  }
  const reach = auditReach(authored, artifacts, floorPx, ledger.rows);
  const legs = [
    ['(a) declaration', auditDeclaration(declarations, floorPx)],
    ['(b) reach', reach.problems],
    [
      '(c)+(d) floor block',
      auditFloorBlock(entrypointCss, authored.filter((source) => source.name.includes(SKIN_DIR)), cascade, floorPx),
    ],
    ['ledger shape', ledger.problems],
  ];
  return { floorPx, legs, reads: reach.reads, ledgered: ledger.rows.length, sources: authored.length };
}

function main(argv = process.argv.slice(2)) {
  // A flag the script silently ignores is a flag that could have meant
  // anything; the inventory asserts every flag it passes is parsed here.
  for (const flag of argv) {
    if (flag !== '--check') {
      console.error(`unknown flag: ${flag}. This gate takes '--check' and nothing else.`);
      process.exit(2);
    }
  }
  const report = audit();
  console.log(`touch-target floor contract — ${report.floorPx}px, ${report.sources} authored files, ${report.reads} skin reads x ${VERTICALS.length} verticals`);
  let failed = 0;
  for (const [leg, problems] of report.legs) {
    console.log(`  ${problems.length === 0 ? 'ok  ' : 'FAIL'} ${leg}${problems.length === 0 ? '' : ` (${problems.length})`}`);
    for (const problem of problems) console.log(`       - ${problem}`);
    failed += problems.length;
  }
  if (failed > 0) {
    console.error(`\ntouch-target floor contract FAILED with ${failed} problem(s).`);
    process.exit(1);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) main();
