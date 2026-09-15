#!/usr/bin/env node
/**
 * preset-without-derivable-values — a first-party vertical preset is a set of
 * DECISIONS, and nothing the compiler already produces from them (WO-DER-06).
 *
 * WHAT IT REFUSES, by name:
 *  - a document that is not a v2 decision document on a known plan, or a
 *    manifest that disagrees with it;
 *  - a decision outside the 29 rows of the typed catalog, a tier the plan does
 *    not entitle, or a value outside its CLOSED domain (enum, scale bounds,
 *    colour-set roles, record keys) -- the domains are read from the catalog
 *    source, so this gate and the door hold one table;
 *  - a raw channel anywhere in the document (`--ds-*`, `var(...)`): v2 admits
 *    no raw override (D-03), and a preset is not a place to smuggle one;
 *  - a sanctioned override leaf with no written reason in the manifest, and a
 *    reason that names no leaf: every override is closed and argued;
 *  - with the published door built: a document the door refuses, an override
 *    that moves NOTHING, an override on a channel the decisions ALREADY
 *    PRODUCE (the value is derivable), and an override that merely restates a
 *    value the decisions already derive for another channel.
 *
 * Usage:
 *   node scripts/check/verticals/preset-without-derivable-values/index.mjs
 *   node scripts/check/verticals/preset-without-derivable-values/index.mjs --json
 *   node scripts/check/verticals/preset-without-derivable-values/index.mjs --structural-only
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';
import { CATALOG_SOURCE, readThemeCatalog } from '../../../libraries/theme-catalog/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);

export const PRESETS_ROOT = 'src/foundation/presets/verticals';
export const FIRST_PARTY_VERTICALS = Object.freeze(['rottay', 'bithire', 'evnto']);
export const DOCUMENT_FIELDS = Object.freeze(['version', 'plan', 'decisions', 'overrides']);
export const PLANS = Object.freeze(['standard', 'pro', 'internal']);
export const PLAN_TIERS = Object.freeze({
  standard: ['standard'],
  pro: ['standard', 'pro'],
  internal: ['standard', 'pro'],
});
export const MIN_REASON_LENGTH = 24;
export const COMPILER_MODULE = 'dist/server.js';

const HEX_COLOUR = /^#[0-9a-fA-F]{6}$/u;
const RAW_CHANNEL = /--ds-|var\(/u;

const finding = (preset, rule, path, message) => ({ preset, rule, path, message });

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/** The first-party presets on disk: one folder per vertical, a document and a manifest beside it. */
export function readPresets(root = CORE_ROOT, presetsRoot = PRESETS_ROOT) {
  const presets = [];
  const findings = [];
  for (const vertical of FIRST_PARTY_VERTICALS) {
    const dir = join(root, presetsRoot, vertical);
    const documentPath = join(dir, 'document/index.json');
    const manifestPath = join(dir, 'manifest/index.json');
    if (!existsSync(documentPath)) {
      findings.push(finding(vertical, 'missing', 'document/index.json', `no decision document at ${presetsRoot}/${vertical}/document/index.json`));
      continue;
    }
    if (!existsSync(manifestPath)) {
      findings.push(finding(vertical, 'missing', 'manifest/index.json', `no manifest at ${presetsRoot}/${vertical}/manifest/index.json`));
      continue;
    }
    let document;
    let manifest;
    try {
      document = readJson(documentPath);
      manifest = readJson(manifestPath);
    } catch (error) {
      findings.push(finding(vertical, 'unreadable', dir, error instanceof Error ? error.message : String(error)));
      continue;
    }
    presets.push({ vertical, dir, document, manifest, documentPath, manifestPath });
  }
  return { presets, findings };
}

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

/** Every primitive leaf of a nested object, as [dotted path, value]. */
export function leavesOf(value, prefix = []) {
  if (!isPlainObject(value)) return [[prefix.join('.'), value]];
  return Object.entries(value).flatMap(([key, child]) => leavesOf(child, [...prefix, key]));
}

function rawChannelFindings(preset, value, path) {
  return leavesOf(value, path.split('.'))
    .filter(([leafPath, leaf]) => (typeof leaf === 'string' && RAW_CHANNEL.test(leaf)) || leafPath.includes('--ds-'))
    .map(([leafPath, leaf]) => finding(preset.vertical, 'raw-channel', leafPath, `raw channel ${JSON.stringify(leafPath.includes('--ds-') ? leafPath : leaf)}; v2 admits no --ds-* name or value (D-03)`));
}

function domainFindings(preset, row, value) {
  const path = `decisions.${row.id}`;
  const domain = row.domain ?? {};
  const out = [];
  switch (domain.kind) {
    case 'enum':
      if (!domain.values.includes(value)) {
        out.push(finding(preset.vertical, 'domain', path, `${JSON.stringify(value)} is outside the closed domain ${domain.values.join(' | ')}`));
      }
      break;
    case 'scale': {
      const { min, max } = domain.bounds ?? {};
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        out.push(finding(preset.vertical, 'domain', path, `${JSON.stringify(value)} is not a number`));
      } else if ((typeof min === 'number' && value < min) || (typeof max === 'number' && value > max)) {
        out.push(finding(preset.vertical, 'domain', path, `${value} is outside the catalog bounds ${min}..${max}`));
      }
      break;
    }
    case 'color-set':
      if (!isPlainObject(value)) {
        out.push(finding(preset.vertical, 'domain', path, 'a colour set must be an object of roles'));
        break;
      }
      for (const [role, colour] of Object.entries(value)) {
        if (!domain.roles.includes(role)) out.push(finding(preset.vertical, 'domain', `${path}.${role}`, `role ${JSON.stringify(role)} is not one of ${domain.roles.join(' | ')}`));
        else if (typeof colour !== 'string' || !HEX_COLOUR.test(colour)) out.push(finding(preset.vertical, 'domain', `${path}.${role}`, `${JSON.stringify(colour)} is not a #RRGGBB seed`));
      }
      break;
    case 'record':
      if (!isPlainObject(value)) {
        out.push(finding(preset.vertical, 'domain', path, `a record decision must be an object of ${domain.keys.join(' | ')}`));
        break;
      }
      // A record's VALUES belong to its family contract (the door's
      // assertExpressiveOverrides / chrome anatomy); this gate closes the KEYS.
      for (const key of Object.keys(value)) {
        if (!domain.keys.includes(key)) out.push(finding(preset.vertical, 'domain', `${path}.${key}`, `key ${JSON.stringify(key)} is not one of ${domain.keys.join(' | ')}`));
      }
      break;
    case 'registered':
      if (domain.registry === 'TENANT_THEME_FONT_PACK_IDS') {
        if (!isPlainObject(value)) out.push(finding(preset.vertical, 'domain', path, 'typography.families must be an object of roles'));
        else for (const [role, pack] of Object.entries(value)) {
          if (typeof pack !== 'string' || pack.length === 0) out.push(finding(preset.vertical, 'domain', `${path}.${role}`, 'a font pack id must be a non-empty registered id'));
        }
      } else if (typeof value !== 'string' || value.length === 0) {
        out.push(finding(preset.vertical, 'domain', path, `a ${domain.registry} id must be a non-empty string`));
      }
      break;
    default:
      break;
  }
  return out;
}

/** The override leaves of a document as [chrome path, value]; only `chrome` is sanctioned. */
export function overrideLeaves(document) {
  const overrides = document?.overrides;
  if (overrides === undefined) return { leaves: [], invalid: [] };
  if (!isPlainObject(overrides)) return { leaves: [], invalid: ['overrides must be an object'] };
  const invalid = Object.keys(overrides).filter((group) => group !== 'chrome').map((group) => `override group ${JSON.stringify(group)} is not sanctioned; D-03 sanctions chrome.<family>.<channel> only`);
  const chrome = overrides.chrome;
  const leaves = chrome === undefined ? [] : leavesOf(chrome, ['chrome']);
  return { leaves, invalid };
}

/** The findings that need no build: shape, closed domains, raw channels, override reasons. */
export function structuralFindings(preset, catalog = readThemeCatalog(CATALOG_SOURCE)) {
  const out = [];
  const { vertical, document, manifest } = preset;
  if (!isPlainObject(document)) return [finding(vertical, 'shape', 'document', 'the document must be an object')];
  for (const key of Object.keys(document)) {
    if (!DOCUMENT_FIELDS.includes(key)) out.push(finding(vertical, 'shape', key, `unsupported field ${JSON.stringify(key)}; a v2 document is { version, plan, decisions, overrides? }`));
  }
  if (document.version !== 2) out.push(finding(vertical, 'shape', 'version', `version ${JSON.stringify(document.version)} is not the v2 decision document`));
  if (!PLANS.includes(document.plan)) out.push(finding(vertical, 'shape', 'plan', `plan ${JSON.stringify(document.plan)} is not one of ${PLANS.join(' | ')}`));
  if (!isPlainObject(manifest)) {
    out.push(finding(vertical, 'manifest', 'manifest', 'the manifest must be an object'));
    return out;
  }
  if (manifest.vertical !== vertical) out.push(finding(vertical, 'manifest', 'vertical', `manifest names ${JSON.stringify(manifest.vertical)}, the folder is ${vertical}`));
  if (manifest.plan !== document.plan) out.push(finding(vertical, 'manifest', 'plan', `manifest plan ${JSON.stringify(manifest.plan)} != document plan ${JSON.stringify(document.plan)}`));
  const decisions = document.decisions;
  if (!isPlainObject(decisions)) {
    out.push(finding(vertical, 'shape', 'decisions', 'decisions must be an object'));
    return out;
  }
  const rows = new Map(catalog.map((row) => [row.id, row]));
  const entitled = PLAN_TIERS[document.plan] ?? [];
  for (const [id, value] of Object.entries(decisions)) {
    const row = rows.get(id);
    if (!row) {
      out.push(finding(vertical, 'decision', `decisions.${id}`, `${JSON.stringify(id)} is not a decision of the catalog (${catalog.length} rows)`));
      continue;
    }
    if (!entitled.includes(row.tier)) out.push(finding(vertical, 'tier', `decisions.${id}`, `tier ${row.tier} is not entitled by plan ${document.plan}`));
    out.push(...domainFindings(preset, row, value));
  }
  out.push(...rawChannelFindings(preset, decisions, 'decisions'));
  const { leaves, invalid } = overrideLeaves(document);
  for (const message of invalid) out.push(finding(vertical, 'override', 'overrides', message));
  if (document.overrides !== undefined) out.push(...rawChannelFindings(preset, document.overrides, 'overrides'));
  const reasons = isPlainObject(manifest.overrideReasons) ? manifest.overrideReasons : null;
  if (reasons === null) out.push(finding(vertical, 'manifest', 'overrideReasons', 'the manifest must carry an overrideReasons object (empty when there is no override)'));
  const leafPaths = new Set(leaves.map(([path]) => path));
  for (const [path, value] of leaves) {
    const reason = reasons?.[path];
    if (typeof reason !== 'string' || reason.trim().length < MIN_REASON_LENGTH) {
      out.push(finding(vertical, 'unreasoned-override', path, `override ${path} = ${JSON.stringify(value)} carries no written reason of at least ${MIN_REASON_LENGTH} characters in the manifest`));
    }
  }
  for (const path of Object.keys(reasons ?? {})) {
    if (!leafPaths.has(path)) out.push(finding(vertical, 'orphan-reason', path, `the manifest reasons ${path}, which the document does not override`));
  }
  return out;
}

const normalizeValue = (value) => String(value).trim().toLowerCase().replace(/\s+/g, ' ');

function withPath(target, segments, value) {
  const [head, ...rest] = segments;
  return { ...target, [head]: rest.length === 0 ? value : withPath(isPlainObject(target?.[head]) ? target[head] : {}, rest, value) };
}

/** Every emitted channel of one compilation, mode-prefixed so a dark value and a base value never collide. */
export function flattenArtifact(artifact) {
  const flat = { ...artifact.variables };
  for (const delta of artifact.modeDeltas ?? []) {
    for (const [name, value] of Object.entries(delta.variables ?? {})) flat[`${delta.mode}:${name}`] = value;
  }
  return flat;
}

async function loadDoor(root) {
  const modulePath = resolve(root, COMPILER_MODULE);
  if (!existsSync(modulePath)) return null;
  const door = await import(pathToFileURL(modulePath).href);
  if (typeof door.compileTenantThemeDocumentV2 !== 'function' || typeof door.admitDocument !== 'function') {
    throw new Error(`preset-without-derivable-values: ${COMPILER_MODULE} exports no compileTenantThemeDocumentV2/admitDocument`);
  }
  return door;
}

/**
 * The findings that need the published door: admission, and the derivability
 * of every override against the decisions alone.
 */
export async function derivableFindings(preset, { root = CORE_ROOT, door = null } = {}) {
  const opened = door ?? (await loadDoor(root));
  if (!opened) return { checked: false, findings: [] };
  const { vertical, document } = preset;
  const out = [];
  try {
    opened.admitDocument({ vertical, document });
  } catch (error) {
    out.push(finding(vertical, 'admission', 'document', error instanceof Error ? error.message : String(error)));
    return { checked: true, findings: out };
  }
  const compile = (candidate) => flattenArtifact(opened.compileTenantThemeDocumentV2({
    document: candidate, tenantId: `preset-${vertical}`, slug: `preset-${vertical}`, verticalKey: vertical, rowVersion: 1,
  }).artifact);
  const { overrides: _overrides, ...decisionsOnly } = document;
  let derived;
  try {
    derived = compile(decisionsOnly);
  } catch (error) {
    out.push(finding(vertical, 'compile', 'decisions', error instanceof Error ? error.message : String(error)));
    return { checked: true, findings: out };
  }
  const derivedValues = new Map();
  for (const [name, value] of Object.entries(derived)) {
    const key = normalizeValue(value);
    if (!derivedValues.has(key)) derivedValues.set(key, []);
    derivedValues.get(key).push(name);
  }
  for (const [path, value] of overrideLeaves(document).leaves) {
    const single = { ...decisionsOnly, overrides: withPath({}, path.split('.'), value) };
    let compiled;
    try {
      compiled = compile(single);
    } catch (error) {
      out.push(finding(vertical, 'compile', path, error instanceof Error ? error.message : String(error)));
      continue;
    }
    const names = new Set([...Object.keys(derived), ...Object.keys(compiled)]);
    const moved = [...names].filter((name) => derived[name] !== compiled[name]).sort();
    if (moved.length === 0) {
      out.push(finding(vertical, 'inert-override', path, `override ${path} = ${JSON.stringify(value)} moves no channel: the decisions already produce it`));
      continue;
    }
    const alreadyDerived = moved.filter((name) => name in derived);
    if (alreadyDerived.length > 0) {
      out.push(finding(vertical, 'derivable', path, `override ${path} = ${JSON.stringify(value)} repaints ${alreadyDerived.join(', ')}, which the compiler already produces from the decisions`));
      continue;
    }
    const restated = derivedValues.get(normalizeValue(value));
    if (restated) {
      out.push(finding(vertical, 'restated-derived-value', path, `override ${path} = ${JSON.stringify(value)} restates the value the decisions already derive for ${restated.slice(0, 4).join(', ')}; read that channel instead`));
    }
  }
  try {
    compile(document);
  } catch (error) {
    out.push(finding(vertical, 'compile', 'document', error instanceof Error ? error.message : String(error)));
  }
  return { checked: true, findings: out };
}

export async function runGate({
  root = CORE_ROOT,
  presetsRoot = PRESETS_ROOT,
  /* Where the built door lives; a sandbox of presets still measures against the real dist. */
  distRoot = root,
  structuralOnly = false,
  catalog = readThemeCatalog(CATALOG_SOURCE),
} = {}) {
  const { presets, findings } = readPresets(root, presetsRoot);
  const seen = new Set(presets.map((preset) => preset.vertical));
  for (const preset of presets) findings.push(...structuralFindings(preset, catalog));
  let doorChecked = false;
  if (!structuralOnly) {
    const door = await loadDoor(distRoot);
    if (door) {
      doorChecked = true;
      for (const preset of presets) {
        if (findings.some((entry) => entry.preset === preset.vertical)) continue;
        findings.push(...(await derivableFindings(preset, { root: distRoot, door })).findings);
      }
    }
  }
  return { ok: findings.length === 0, findings, presets: [...seen], doorChecked };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const structuralOnly = process.argv.includes('--structural-only');
  const result = await runGate({ structuralOnly });
  if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
  if (!result.ok) {
    for (const entry of result.findings) console.error(`${entry.preset} [${entry.rule}] ${entry.path}: ${entry.message}`);
    console.error(`preset-without-derivable-values: FAIL (${result.findings.length} finding(s); door ${result.doorChecked ? 'checked' : 'NOT checked'})`);
    process.exitCode = 1;
  } else if (!result.doorChecked && !structuralOnly) {
    console.error(`preset-without-derivable-values: FAIL — ${COMPILER_MODULE} is absent, so admission and derivability were not checked; build first or pass --structural-only`);
    process.exitCode = 1;
  } else {
    console.log(`preset-without-derivable-values: PASS (${result.presets.join(', ')}; structure, closed domains, override reasons${result.doorChecked ? ', admission and derivability through dist/server.js' : ''})`);
  }
}
