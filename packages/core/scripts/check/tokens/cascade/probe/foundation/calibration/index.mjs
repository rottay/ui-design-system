/**
 * @fileoverview The live calibration table: what the probe measures a control
 * against, keyed by control id.
 *
 * A causal run needs more than a control's name. It needs the domain kind that
 * says how a stop is written, the ingress doors a tenant writes it through, the
 * channels the control declares, the normalized stops and the negative
 * controls it is forbidden to move. None of that is a control's IDENTITY: the
 * typed catalog (`src/contracts/theme/runtime/catalog`) is the only listing,
 * and this table may only describe controls the catalog recognises.
 *
 * THE VALIDATION IS FAIL-CLOSED AND RUNS ON EVERY READ. A key the catalog does
 * not recognise refuses the whole table, never only that row: a calibration
 * record for a control nobody lists is a second listing in disguise. An empty
 * table refuses too, because a probe with nothing to calibrate against would
 * report every control as "no negative controls declared" and pass.
 *
 * THE TABLE AND THE CATALOG ARE COMPARED BOTH WAYS. Where a calibrated row
 * is also a catalog row, its doors and channels must equal the catalog's
 * unless the row registers the difference in `carriedFromSeal` with an owner;
 * an unregistered difference refuses, and so does a registered one that no
 * longer holds. `domain.kind` is a different vocabulary (the probe's stimulus
 * kind), so it is checked through the table's `kindVocabulary` mapping instead.
 * Coverage is a property of the live table: every catalog row is calibrated or
 * listed in `uncalibrated`, and every mapped kind pair is witnessed. A drill
 * that plants a subset table gets the row checks and not the coverage.
 *
 * A record is returned in the shape the harness already consumes (`controlId`,
 * `domain`, `ingress`, `declaredOutputs`, `calibration`), so the id comes from
 * the key and a row may not restate it.
 *
 * @module Tooling/ResolutionProbe/Foundation/Calibration
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  readThemeCatalog,
  readThemeCatalogAnnex,
  readThemeCatalogRetired,
} from '../../../../../../libraries/theme-catalog/index.mjs';
import { CORE_ROOT } from '../paths/index.mjs';

/** Package-relative home of the table. */
export const CALIBRATION_TABLE_REL = 'governance/manifest/calibration/index.json';

/** The same file as receipts cite it, relative to the workspace root. */
export const CALIBRATION_TABLE_REPO_REL = `packages/core/${CALIBRATION_TABLE_REL}`;

export const CALIBRATION_TABLE = resolve(CORE_ROOT, CALIBRATION_TABLE_REL);

let recognisedCache = null;
let catalogRowsCache = null;

/** The typed catalog's rows, by id. */
export function catalogRowsById() {
  catalogRowsCache ??= new Map(readThemeCatalog().map((row) => [row.id, row]));
  return catalogRowsCache;
}

/** The fields a row may carry from the seal against the catalog, and how the catalog spells each. */
export const CARRIED_FIELDS = Object.freeze({
  'ingress.staticThemePath': {
    table: (row) => row.ingress?.staticThemePath ?? null,
    catalog: (entry) => entry.keypath?.brandTheme ?? null,
  },
  'ingress.dbTenantThemePath': {
    table: (row) => row.ingress?.dbTenantThemePath ?? null,
    catalog: (entry) => entry.keypath?.document ?? null,
  },
  'declaredOutputs.channels': {
    table: (row) => row.declaredOutputs?.channels ?? [],
    catalog: (entry) => entry.produces?.channels ?? [],
  },
});

const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);

/** Every control id the typed catalog recognises: rows, the annex and the retired set. */
export function catalogRecognisedIds() {
  recognisedCache ??= new Set([
    ...readThemeCatalog().map((row) => row.id),
    ...readThemeCatalogAnnex().map((entry) => entry.id),
    ...readThemeCatalogRetired().map((entry) => entry.id),
  ]);
  return recognisedCache;
}

const isStringArray = (value) =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string' && entry.length > 0);

/**
 * Every reason the table cannot be read, as sentences. Empty means readable.
 *
 * @param {object} table
 * @param {{recognisedIds?: Set<string>, catalogRows?: Map<string, object>, coverage?: boolean}} [options]
 * @returns {string[]}
 */
export function validateCalibrationTable(
  table,
  { recognisedIds = catalogRecognisedIds(), catalogRows = catalogRowsById(), coverage = true } = {},
) {
  const findings = [];
  const controls = table?.controls;
  if (!controls || typeof controls !== 'object' || Array.isArray(controls)) {
    return ['the calibration table has no `controls` map'];
  }
  const ids = Object.keys(controls);
  if (ids.length === 0) {
    findings.push('the calibration table is empty, so every causal run would calibrate against nothing');
  }
  for (const id of ids) {
    const row = controls[id];
    if (!recognisedIds.has(id)) {
      findings.push(
        `"${id}" is not a control the typed catalog recognises; a calibration row cannot introduce a control`,
      );
    }
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      findings.push(`"${id}" is not a calibration record`);
      continue;
    }
    if ('controlId' in row) {
      findings.push(`"${id}" restates controlId; the key is the id`);
    }
    if (typeof row.domain?.kind !== 'string' || row.domain.kind.length === 0) {
      findings.push(`"${id}" declares no domain.kind, so no stop of it can be written`);
    }
    if (!row.ingress || typeof row.ingress !== 'object') {
      findings.push(`"${id}" declares no ingress doors`);
    }
    if (!Array.isArray(row.declaredOutputs?.channels)) {
      findings.push(`"${id}" declares no declaredOutputs.channels list`);
    }
    if (!isStringArray(row.calibration?.negativeControls)) {
      findings.push(`"${id}" has no calibration.negativeControls list of phrases`);
    }
    if (!Array.isArray(row.calibration?.normalizedStops)) {
      findings.push(`"${id}" has no calibration.normalizedStops list`);
    }
    findings.push(...compareWithCatalog(id, row, table.kindVocabulary?.map, catalogRows.get(id)));
  }
  if (coverage) findings.push(...coverageFindings(table, catalogRows));
  return findings;
}

function compareWithCatalog(id, row, vocabulary, entry) {
  const findings = [];
  const kind = row.domain?.kind;
  if (!vocabulary || !Object.hasOwn(vocabulary, kind)) {
    findings.push(`"${id}" declares probe kind "${kind}", which kindVocabulary does not map`);
  } else if (entry && !vocabulary[kind].includes(entry.domain?.kind)) {
    findings.push(
      `"${id}" pairs probe kind "${kind}" with catalog kind "${entry.domain?.kind}", which kindVocabulary does not map`,
    );
  }
  const carried = row.carriedFromSeal ?? [];
  if (!Array.isArray(carried)) return [...findings, `"${id}" carriedFromSeal is not a list`];
  if (!entry) {
    if (carried.length > 0) {
      findings.push(`"${id}" registers carriedFromSeal but is not a catalog row, so nothing can verify it`);
    }
    return findings;
  }
  for (const [field, read] of Object.entries(CARRIED_FIELDS)) {
    const tableValue = read.table(row);
    const catalogValue = read.catalog(entry);
    const records = carried.filter((record) => record?.field === field);
    if (records.length > 1) findings.push(`"${id}" registers ${field} more than once`);
    const record = records[0];
    if (!record) {
      if (!same(tableValue, catalogValue)) {
        findings.push(
          `"${id}" ${field} is ${JSON.stringify(tableValue)} here and ${JSON.stringify(catalogValue)} in the ` +
            'typed catalog, and no carriedFromSeal record registers the difference',
        );
      }
      continue;
    }
    if (same(tableValue, catalogValue)) {
      findings.push(`"${id}" registers ${field} as carried from the seal, but it now equals the catalog; drop the record`);
    } else if (!same(record.carried, tableValue) || !same(record.catalog, catalogValue)) {
      findings.push(
        `"${id}" carriedFromSeal ${field} no longer describes the difference: the row holds ` +
          `${JSON.stringify(tableValue)} and the catalog ${JSON.stringify(catalogValue)}`,
      );
    }
    for (const key of ['owner', 'ruling', 'reason']) {
      if (typeof record[key] !== 'string' || record[key].trim().length === 0) {
        findings.push(`"${id}" carriedFromSeal ${field} names no ${key}`);
      }
    }
  }
  for (const record of carried) {
    if (!Object.hasOwn(CARRIED_FIELDS, record?.field)) {
      findings.push(`"${id}" carriedFromSeal names "${record?.field}", which is not a carried field`);
    }
  }
  return findings;
}

function coverageFindings(table, catalogRows) {
  const findings = [];
  const controls = table.controls ?? {};
  const listed = table.uncalibrated?.ids;
  if (!Array.isArray(listed)) return ['the calibration table declares no uncalibrated.ids list'];
  if (new Set(listed).size !== listed.length) findings.push('uncalibrated.ids lists a control twice');
  for (const id of listed) {
    if (!catalogRows.has(id)) findings.push(`uncalibrated "${id}" is not a typed catalog row`);
    if (Object.hasOwn(controls, id)) findings.push(`"${id}" is listed uncalibrated and has a calibration row`);
  }
  for (const id of catalogRows.keys()) {
    if (!Object.hasOwn(controls, id) && !listed.includes(id)) {
      findings.push(`catalog row "${id}" has no calibration row and is not listed uncalibrated`);
    }
  }
  const vocabulary = table.kindVocabulary?.map ?? {};
  for (const [kind, catalogKinds] of Object.entries(vocabulary)) {
    const rows = Object.entries(controls).filter(([, row]) => row?.domain?.kind === kind);
    if (rows.length === 0) findings.push(`kindVocabulary maps probe kind "${kind}", which no row uses`);
    for (const catalogKind of catalogKinds) {
      const witnessed = rows.some(([id]) => catalogRows.get(id)?.domain?.kind === catalogKind);
      if (!witnessed) {
        findings.push(`kindVocabulary pairs "${kind}" with catalog kind "${catalogKind}", which no row witnesses`);
      }
    }
  }
  return findings;
}

/** Coverage binds the live table; a planted drill table is a subset of it. */
export function coverageApplies(path) {
  return resolve(path) === CALIBRATION_TABLE;
}

/**
 * Reads and validates the table, and returns one record per control in id order.
 *
 * @param {{path?: string, recognisedIds?: Set<string>, coverage?: boolean}} [options]
 * @returns {{id: string, document: object}[]}
 */
export function readCalibrationRecords({
  path = CALIBRATION_TABLE,
  recognisedIds,
  coverage = coverageApplies(path),
} = {}) {
  const table = JSON.parse(readFileSync(path, 'utf8'));
  const findings = validateCalibrationTable(table, {
    ...(recognisedIds ? { recognisedIds } : {}),
    coverage,
  });
  if (findings.length > 0) {
    throw new Error(`resolution-probe: the calibration table is refused:\n  ${findings.join('\n  ')}`);
  }
  return Object.keys(table.controls)
    .sort()
    .map((id) => ({ id, document: { controlId: id, ...table.controls[id] } }));
}

/**
 * The calibration record of one control.
 *
 * @param {string} controlId
 * @param {{path?: string, recognisedIds?: Set<string>}} [options]
 */
export function readControlCalibration(controlId, options = {}) {
  const records = readCalibrationRecords(options);
  const record = records.find((entry) => entry.id === controlId);
  if (!record) {
    throw new Error(
      `resolution-probe: "${controlId}" has no calibration record. Calibrated: ` +
        `${records.map((entry) => entry.id).join(', ')}.`,
    );
  }
  return record.document;
}
