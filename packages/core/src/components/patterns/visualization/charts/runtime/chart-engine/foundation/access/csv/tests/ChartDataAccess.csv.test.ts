import { describe, expect, it } from 'vitest';

import {
  sanitizeChartDataAccessCsvFilename,
  serializeChartDataAccessCsv,
} from '..';
import type { ChartDataAccessColumn } from '../..';

interface CsvRow {
  readonly name: string;
  readonly note: string;
  readonly amount: string | number;
}

const columns = [
  { id: 'name', label: 'Name', getValue: (row: CsvRow) => row.name },
  { id: 'note', label: 'Note', getValue: (row: CsvRow) => row.note },
  { id: 'amount', label: 'Amount', getValue: (row: CsvRow) => row.amount },
] as const satisfies readonly ChartDataAccessColumn<CsvRow>[];

describe('ChartDataAccess CSV', () => {
  it('uses CRLF records and RFC quoting for commas, quotes and line breaks', () => {
    expect(serializeChartDataAccessCsv([
      { name: 'Doe, "Jane"', note: 'line one\nline two', amount: -42 },
      { name: 'Safe', note: 'plain', amount: 7 },
    ], columns)).toBe(
      'Name,Note,Amount\r\n' +
      '"Doe, ""Jane""","line one\nline two",-42\r\n' +
      'Safe,plain,7\r\n',
    );
  });

  it('neutralizes every spreadsheet formula prefix after whitespace without changing numbers', () => {
    const formulaColumns = [
      { id: 'equals', label: '=Header', getValue: (row: readonly string[]) => row[0] },
      { id: 'plus', label: 'Plus', getValue: (row: readonly string[]) => row[1] },
      { id: 'minus', label: 'Minus', getValue: (row: readonly string[]) => row[2] },
      { id: 'at', label: 'At', getValue: (row: readonly string[]) => row[3] },
      { id: 'number', label: 'Number', getValue: () => -12 },
    ] as const satisfies readonly ChartDataAccessColumn<readonly string[]>[];

    expect(serializeChartDataAccessCsv([
      ['=2+2', '   +SUM(A:A)', '\t-1', ' @command'],
    ], formulaColumns)).toBe(
      "'=Header,Plus,Minus,At,Number\r\n" +
      "'=2+2,'   +SUM(A:A),'\t-1,' @command,-12\r\n",
    );
  });

  it('rejects missing localized headers, empty schemas and non-finite numbers', () => {
    expect(() => serializeChartDataAccessCsv([], [])).toThrow(/at least one column/i);
    expect(() => serializeChartDataAccessCsv([], [
      { id: 'name', label: ' ', getValue: () => 'value' },
    ])).toThrow(/localized label/i);
    expect(() => serializeChartDataAccessCsv([{}], [
      { id: 'score', label: 'Score', getValue: () => Number.NaN },
    ])).toThrow(/finite/i);
  });

  it('sanitizes traversal, reserved names, repeated extensions and bounded Unicode names', () => {
    expect(sanitizeChartDataAccessCsvFilename('../../CON.csv')).toBe('_CON.csv');
    expect(sanitizeChartDataAccessCsvFilename(' Résumé Q3?.CSV.csv ')).toBe('Résumé-Q3.csv');
    expect(sanitizeChartDataAccessCsvFilename('   ')).toBe('chart-data.csv');
    expect(sanitizeChartDataAccessCsvFilename('x'.repeat(140))).toBe(
      `${'x'.repeat(100)}.csv`,
    );
  });
});
