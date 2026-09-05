/**
 * Pure markdown reader for the consumer-contract tables.
 *
 * Used by the drift test (which owns the filesystem read) so the document in
 * `docs/consumer-contract/index.md` stays the single source of the disposition
 * table. Never imported by the rule itself.
 */

import type { ContractRow, SubpathDisposition } from '..';

const DISPOSITIONS: readonly SubpathDisposition[] = [
  'guaranteed',
  'retire-by',
  'forbidden',
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
    if (disposition === 'retire-by' && retiredBy === null)
      fail(`${subpath} is retire-by but names no work order`);
    if (disposition !== 'retire-by' && retiredBy !== null)
      fail(`${subpath} is ${disposition} but names a work order`);

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
