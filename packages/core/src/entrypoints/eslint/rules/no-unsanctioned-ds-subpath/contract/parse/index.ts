/**
 * Pure markdown reader for the consumer-contract tables.
 *
 * Used by the drift test (which owns the filesystem read) so the document in
 * `docs/consumer-contract/index.md` stays the single source of the disposition
 * table. Never imported by the rule itself.
 *
 * Also the pure check of the lab review ledger (`package.json`
 * `releaseSync.lab`) against the table's `lab` rows. No gate script reads that
 * key, so the drift test calling `labLedgerProblems` is its only guard.
 */

import type { ContractRow, SubpathDisposition } from '..';

const DISPOSITIONS: readonly SubpathDisposition[] = [
  'guaranteed',
  'retire-by',
  'lab',
  'forbidden',
];

const WORK_ORDER_DISPOSITIONS: readonly SubpathDisposition[] = [
  'retire-by',
  'lab',
];

export type ContractTableName = 'published' | 'unpublished';

/** Per-app specifier counts a table row carries. Dated snapshot, not normative. */
export interface ContractMeasurement {
  subpath: string;
  bithire: number;
  showroom: number;
}

interface ParsedRow extends ContractRow, ContractMeasurement {}

export function fenceMarkers(table: ContractTableName): {
  start: string;
  end: string;
} {
  return {
    start: `<!-- consumer-contract:${table}:start -->`,
    end: `<!-- consumer-contract:${table}:end -->`,
  };
}

function fail(message: string): never {
  throw new Error(`consumer-contract: ${message}`);
}

function parseRows(markdown: string, table: ContractTableName): ParsedRow[] {
  const { start, end } = fenceMarkers(table);
  const from = markdown.indexOf(start);
  const to = markdown.indexOf(end);
  if (from === -1) fail(`missing start fence for the ${table} table`);
  if (to === -1) fail(`missing end fence for the ${table} table`);
  if (to < from) fail(`fences of the ${table} table are inverted`);
  if (markdown.indexOf(start, from + 1) !== -1)
    fail(`duplicate start fence for the ${table} table`);

  const body = markdown
    .slice(from + start.length, to)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|'));

  if (body.length < 3) fail(`the ${table} table has no rows`);

  const header = body[0];
  if (
    header !==
    '| Subpath | Disposition | Retire-by | app-bithire | showroom |'
  )
    fail(`unexpected header in the ${table} table: ${header}`);
  if (body[1] !== '| --- | --- | --- | --- | --- |')
    fail(`unexpected separator in the ${table} table: ${body[1]}`);

  const rows: ParsedRow[] = [];
  const seen = new Set<string>();

  for (const line of body.slice(2)) {
    const cells = line
      .slice(1, line.endsWith('|') ? -1 : undefined)
      .split('|')
      .map((cell) => cell.trim());
    if (cells.length !== 5) fail(`row with ${cells.length} cells: ${line}`);

    const [rawSubpath, rawDisposition, rawRetiredBy] = cells;
    const subpath = /^`(.+)`$/.exec(rawSubpath)?.[1];
    if (!subpath) fail(`subpath cell is not code-quoted: ${line}`);
    if (subpath !== '.' && !subpath.startsWith('./'))
      fail(`subpath is not an export-map key: ${subpath}`);
    if (seen.has(subpath)) fail(`duplicate subpath row: ${subpath}`);
    seen.add(subpath);

    if (!DISPOSITIONS.includes(rawDisposition as SubpathDisposition))
      fail(`unknown disposition "${rawDisposition}" for ${subpath}`);
    const disposition = rawDisposition as SubpathDisposition;

    const retiredBy = rawRetiredBy === '—' ? null : rawRetiredBy;
    const needsWorkOrder = WORK_ORDER_DISPOSITIONS.includes(disposition);
    if (needsWorkOrder && retiredBy === null)
      fail(`${subpath} is ${disposition} but names no work order`);
    if (!needsWorkOrder && retiredBy !== null)
      fail(`${subpath} is ${disposition} but names a work order`);
    if (retiredBy !== null && !/^WO-[A-Z]+-\d+$/.test(retiredBy))
      fail(`${subpath} names "${retiredBy}", which is not a work order id`);
    if (disposition === 'lab' && table !== 'published')
      fail(`${subpath} is lab but is not a published subpath`);

    for (const count of cells.slice(3)) {
      if (!/^\d+$/.test(count))
        fail(`${subpath} has a non-numeric measured count: ${count}`);
    }

    rows.push({
      subpath,
      disposition,
      retiredBy,
      bithire: Number(cells[3]),
      showroom: Number(cells[4]),
    });
  }

  return rows;
}

/** Extract one fenced table and parse its rows. Throws on any malformed row. */
export function parseContractTable(
  markdown: string,
  table: ContractTableName,
): ContractRow[] {
  return parseRows(markdown, table).map(({ subpath, disposition, retiredBy }) => ({
    subpath,
    disposition,
    retiredBy,
  }));
}

/** The dated measured counts of every row, across both tables. */
export function parseContractMeasurements(
  markdown: string,
): ContractMeasurement[] {
  return [
    ...parseRows(markdown, 'published'),
    ...parseRows(markdown, 'unpublished'),
  ].map(({ subpath, bithire, showroom }) => ({ subpath, bithire, showroom }));
}

/** Parse both fenced tables in document order. */
export function parseConsumerContract(markdown: string): {
  published: ContractRow[];
  unpublished: ContractRow[];
} {
  return {
    published: parseContractTable(markdown, 'published'),
    unpublished: parseContractTable(markdown, 'unpublished'),
  };
}

/** One `releaseSync.lab` entry: who owns the lab door and when it is reviewed. */
export interface LabReview {
  owner: string;
  reviewBy: string;
}

export interface LabLedgerInput {
  /** Parsed published rows of the contract document. */
  published: readonly ContractRow[];
  /** `package.json` `releaseSync.lab`, as read from JSON (absent = undefined). */
  ledger: unknown;
  /** `package.json` `version`. */
  packageVersion: string;
  /** Roadmap status of a work order, or null when the registry has no such id. */
  workOrderStatus: (id: string) => string | null;
}

const RELEASE_LINE = /^(\d+)\.(\d+)$/;
const LAB_REVIEW_KEYS: readonly string[] = ['owner', 'reviewBy'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isLaterReleaseLine(reviewBy: string, packageVersion: string): boolean {
  const line = RELEASE_LINE.exec(reviewBy);
  const current = /^(\d+)\.(\d+)\./.exec(packageVersion);
  if (!line || !current) return false;
  const [major, minor] = [Number(line[1]), Number(line[2])];
  const [currentMajor, currentMinor] = [Number(current[1]), Number(current[2])];
  return major > currentMajor || (major === currentMajor && minor > currentMinor);
}

/**
 * Every way the lab review ledger disagrees with the table's `lab` rows.
 * Empty means: same key set, each entry names the row's owner, the owner is an
 * open work order, and `reviewBy` is a release line after the package version.
 */
export function labLedgerProblems({
  published,
  ledger,
  packageVersion,
  workOrderStatus,
}: LabLedgerInput): string[] {
  const problems: string[] = [];
  const labRows = published.filter((row) => row.disposition === 'lab');

  if (ledger !== undefined && !isRecord(ledger)) {
    return ['releaseSync.lab is not an object keyed by subpath'];
  }
  const entries = ledger ?? {};

  for (const subpath of Object.keys(entries)) {
    if (!labRows.some((row) => row.subpath === subpath))
      problems.push(`releaseSync.lab names ${subpath}, which is not a lab row`);
  }

  for (const row of labRows) {
    const status = row.retiredBy === null ? null : workOrderStatus(row.retiredBy);
    if (status === null)
      problems.push(`${row.subpath} lab owner ${row.retiredBy} is not a work order`);
    else if (status === 'done')
      problems.push(`${row.subpath} lab owner ${row.retiredBy} is done`);

    if (!Object.keys(entries).includes(row.subpath)) {
      problems.push(`${row.subpath} is lab but has no releaseSync.lab entry`);
      continue;
    }
    const entry = entries[row.subpath];
    if (!isRecord(entry)) {
      problems.push(`releaseSync.lab ${row.subpath} is not an object`);
      continue;
    }
    for (const key of Object.keys(entry)) {
      if (!LAB_REVIEW_KEYS.includes(key))
        problems.push(`releaseSync.lab ${row.subpath} has unknown key ${key}`);
    }
    if (entry.owner !== row.retiredBy)
      problems.push(
        `releaseSync.lab ${row.subpath} owner is not the table owner ${row.retiredBy}`,
      );
    if (typeof entry.reviewBy !== 'string')
      problems.push(`${row.subpath} is lab but has no reviewBy release line`);
    else if (!RELEASE_LINE.test(entry.reviewBy))
      problems.push(
        `${row.subpath} reviewBy "${entry.reviewBy}" is not a release line (major.minor)`,
      );
    else if (!isLaterReleaseLine(entry.reviewBy, packageVersion))
      problems.push(
        `${row.subpath} reviewBy ${entry.reviewBy} is not later than ${packageVersion}`,
      );
  }

  return problems;
}
