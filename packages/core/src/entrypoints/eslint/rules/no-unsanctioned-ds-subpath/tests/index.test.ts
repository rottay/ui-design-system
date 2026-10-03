import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { rules } from '../../..';
import { createNoUnsanctionedDsSubpath, noUnsanctionedDsSubpath } from '..';
import {
  CONTRACT_ROWS,
  PUBLISHED_SUBPATHS,
  UNPUBLISHED_SUBPATHS,
  classifySubpath,
  classifySubpathIn,
  subpathOfSpecifier,
} from '../contract';
import {
  labLedgerProblems,
  parseConsumerContract,
  parseContractMeasurements,
} from '../contract/parse';

const PACKAGE_ROOT = resolve(__dirname, '../../../../../..');
const DOCUMENT_PATH = resolve(PACKAGE_ROOT, 'docs/consumer-contract/index.md');
const PACKAGE_PATH = resolve(PACKAGE_ROOT, 'package.json');
const REGISTRY_PATH = resolve(PACKAGE_ROOT, '../../roadmap/registry.json');

const SHOWROOM_CONFIG_PATH = resolve(
  PACKAGE_ROOT,
  '../showroom/eslint.config.mjs',
);

const documentMarkdown = readFileSync(DOCUMENT_PATH, 'utf8');
const showroomConfig = readFileSync(SHOWROOM_CONFIG_PATH, 'utf8');
const parsed = parseConsumerContract(documentMarkdown);
const measuredBySubpath = new Map(
  parseContractMeasurements(documentMarkdown).map((row) => [row.subpath, row]),
);
const packageJson = JSON.parse(readFileSync(PACKAGE_PATH, 'utf8')) as {
  version: string;
  exports: Record<string, unknown>;
  releaseSync?: { lab?: unknown };
};
const exportKeys = Object.keys(packageJson.exports);
const workOrderStatuses = new Map(
  (
    JSON.parse(readFileSync(REGISTRY_PATH, 'utf8')) as {
      workOrders: Array<{ id: string; status: string }>;
    }
  ).workOrders.map((workOrder) => [workOrder.id, workOrder.status]),
);
const workOrderStatus = (id: string): string | null =>
  workOrderStatuses.get(id) ?? null;

/** A document with one published row's disposition cells rewritten. */
function withRow(
  markdown: string,
  subpath: string,
  disposition: string,
  workOrder: string,
): string {
  const row = new RegExp(
    `^\\| \`${subpath.replace(/[.*/]/g, '\\$&')}\` \\| [a-z-]+ \\| \\S+ \\|`,
    'm',
  );
  if (!row.test(markdown))
    throw new Error(`the document has no ${subpath} row to drill on`);
  return markdown.replace(
    row,
    `| \`${subpath}\` | ${disposition} | ${workOrder} |`,
  );
}

/**
 * The live document with `./spatial` rewritten, for the lab drills. Every
 * drill states the row it needs, so none depends on what the row says today.
 */
function withSpatialRow(disposition: string, workOrder: string): string {
  return withRow(documentMarkdown, './spatial', disposition, workOrder);
}

const LAB_FIXTURE = parseConsumerContract(withSpatialRow('lab', 'WO-CRA-15'));
const LAB_FIXTURE_LEDGER = {
  './spatial': { owner: 'WO-CRA-15', reviewBy: '4.0' },
};

function labFixtureProblems(
  overrides: Partial<Parameters<typeof labLedgerProblems>[0]> = {},
): string[] {
  return labLedgerProblems({
    published: LAB_FIXTURE.published,
    ledger: LAB_FIXTURE_LEDGER,
    packageVersion: '2.19.36',
    workOrderStatus: (id) => (id === 'WO-CRA-15' ? 'todo' : null),
    ...overrides,
  });
}

function visitors(
  options: unknown[] = [],
  filename = '/app/src/example.tsx',
): {
  created: Record<string, (node: any) => void>;
  reports: Array<{ messageId?: string; data?: Record<string, string> }>;
} {
  const reports: Array<{
    messageId?: string;
    data?: Record<string, string>;
  }> = [];
  const created = noUnsanctionedDsSubpath.create({
    filename,
    options,
    report: (descriptor) => reports.push(descriptor),
  });
  return { created, reports };
}

function importFrom(specifier: string, options: unknown[] = []): string[] {
  const { created, reports } = visitors(options);
  created.ImportDeclaration?.({ source: { value: specifier } });
  return reports.map((report) => report.messageId ?? '');
}

describe('consumer contract: document is the single source', () => {
  it('mirrors the published table of the document exactly', () => {
    expect(PUBLISHED_SUBPATHS).toEqual(parsed.published);
  });

  it('mirrors the unpublished table of the document exactly', () => {
    expect(UNPUBLISHED_SUBPATHS).toEqual(parsed.unpublished);
  });

  it('covers every published subpath, in export-map order', () => {
    expect(parsed.published.map((row) => row.subpath)).toEqual(exportKeys);
  });

  it('publishes 40 subpaths and states that count in the document', () => {
    // The export map, disposition table and prose carry the same live count.
    expect(exportKeys).toHaveLength(40);
    expect(parsed.published).toHaveLength(40);
    expect(documentMarkdown).toContain(
      '| Subpaths publicados | 40 |',
    );
    expect(documentMarkdown).toContain(
      '## 1. Superficie de importación sancionada (40/40)',
    );
  });

  it('states the disposition split the table actually has', () => {
    expect(statedTally(documentMarkdown)).toEqual(
      expectedTally(parsed.published),
    );
    expect(expectedTally(parsed.published)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^\| `guaranteed` \| \d+ \|$/),
      ]),
    );
  });

  it('tallies lab rows on their own line, apart from guaranteed', () => {
    const retiring = withSpatialRow('retire-by', 'WO-RET-01');
    const oneLab = withSpatialRow('lab', 'WO-CRA-15');
    const twoLab = withRow(oneLab, './motion', 'lab', 'WO-CRA-15');
    const tallyOf = (markdown: string) =>
      expectedTally(parseConsumerContract(markdown).published);
    const count = (lines: string[], label: string) => {
      const line = lines.find((entry) => entry.startsWith(`| \`${label}\` |`));
      return line ? Number(/\| (\d+) \|$/.exec(line)?.[1]) : 0;
    };

    expect(count(tallyOf(retiring), 'lab')).toBe(0);
    expect(count(tallyOf(oneLab), 'lab')).toBe(1);
    expect(count(tallyOf(oneLab), 'guaranteed')).toBe(
      count(tallyOf(retiring), 'guaranteed'),
    );
    expect(count(tallyOf(oneLab), 'retire-by WO-RET-01')).toBe(
      count(tallyOf(retiring), 'retire-by WO-RET-01') - 1,
    );

    // A guaranteed door moved to lab leaves the guaranteed count.
    expect(count(tallyOf(twoLab), 'lab')).toBe(2);
    expect(count(tallyOf(twoLab), 'guaranteed')).toBe(
      count(tallyOf(oneLab), 'guaranteed') - 1,
    );

    // Each regrouping is refused while the summary still says what it said,
    // and accepted once the summary is restated. The live table is one of
    // `retiring` / `oneLab`, so exactly that one is the identity.
    const live = expectedTally(parsed.published);
    const regrouped = [retiring, oneLab, twoLab].filter(
      (markdown) => tallyOf(markdown).join() !== live.join(),
    );
    expect(regrouped).toHaveLength(2);
    expect(regrouped).toContain(twoLab);

    for (const markdown of regrouped) {
      expect(statedTally(markdown)).toEqual(live);
      expect(statedTally(markdown)).not.toEqual(tallyOf(markdown));
      expect(statedTally(restateTally(markdown))).toEqual(tallyOf(markdown));
    }
  });

  it('records commercial.css as forbidden with no DS retirement action', () => {
    const commercial = UNPUBLISHED_SUBPATHS.filter((row) =>
      row.subpath.startsWith('./commercial'),
    );
    expect(commercial.map((row) => row.subpath)).toEqual([
      './commercial',
      './commercial.css',
    ]);
    expect(
      commercial.every(
        (row) => row.disposition === 'forbidden' && row.retiredBy === null,
      ),
    ).toBe(true);
    expect(exportKeys).not.toContain('./commercial');
    expect(exportKeys).not.toContain('./commercial.css');
  });

  it('rejects a document whose table drifts from its own grammar', () => {
    const broken = documentMarkdown.replace(
      '| `./styles/modern` | retire-by | WO-CAN-03 |',
      '| `./styles/modern` | retire-by | — |',
    );
    expect(() => parseConsumerContract(broken)).toThrow(
      /retire-by but names no work order/,
    );

    const invented = documentMarkdown.replace(
      '| `./styles/modern` | retire-by | WO-CAN-03 |',
      '| `./styles/modern` | allowed | — |',
    );
    expect(() => parseConsumerContract(invented)).toThrow(
      /unknown disposition "allowed"/,
    );

    // N1: a lab door with no owning work order.
    expect(() => parseConsumerContract(withSpatialRow('lab', '—'))).toThrow(
      /\.\/spatial is lab but names no work order/,
    );
    expect(() => parseConsumerContract(withSpatialRow('lab', '4.0'))).toThrow(
      /not a work order id/,
    );
    expect(() =>
      parseConsumerContract(
        withSpatialRow('experimental', 'WO-CRA-15'),
      ),
    ).toThrow(/unknown disposition "experimental"/);
    expect(() =>
      parseConsumerContract(
        documentMarkdown.replace(
          '| `./surfaces` | forbidden | — |',
          '| `./surfaces` | lab | WO-CRA-15 |',
        ),
      ),
    ).toThrow(/\.\/surfaces is lab but is not a published subpath/);

    const unfenced = documentMarkdown.replace(
      '<!-- consumer-contract:published:end -->',
      '',
    );
    expect(() => parseConsumerContract(unfenced)).toThrow(/missing end fence/);
  });
});

describe('lab doors: the review ledger cannot drift from the table', () => {
  it('holds on the live table, package.json and roadmap registry', () => {
    expect(
      labLedgerProblems({
        published: parsed.published,
        ledger: packageJson.releaseSync?.lab,
        packageVersion: packageJson.version,
        workOrderStatus,
      }),
    ).toEqual([]);
  });

  it('P1: accepts a lab row with an open owner and a later review line', () => {
    expect(
      LAB_FIXTURE.published.find((row) => row.subpath === './spatial'),
    ).toEqual({
      subpath: './spatial',
      disposition: 'lab',
      retiredBy: 'WO-CRA-15',
    });
    expect(labFixtureProblems()).toEqual([]);
    expect(labFixtureProblems({ packageVersion: '3.9.12' })).toEqual([]);
  });

  it('N2: rejects a lab owner that is done or unknown', () => {
    expect(labFixtureProblems({ workOrderStatus: () => 'done' })).toEqual([
      './spatial lab owner WO-CRA-15 is done',
    ]);
    expect(labFixtureProblems({ workOrderStatus: () => null })).toEqual([
      './spatial lab owner WO-CRA-15 is not a work order',
    ]);
  });

  it('N3: rejects a ledger whose key set is not the lab rows', () => {
    expect(labFixtureProblems({ ledger: undefined })).toEqual([
      './spatial is lab but has no releaseSync.lab entry',
    ]);
    expect(labFixtureProblems({ ledger: {} })).toEqual([
      './spatial is lab but has no releaseSync.lab entry',
    ]);
    expect(
      labFixtureProblems({
        ledger: {
          ...LAB_FIXTURE_LEDGER,
          './motion': { owner: 'WO-CRA-15', reviewBy: '4.0' },
        },
      }),
    ).toEqual(['releaseSync.lab names ./motion, which is not a lab row']);
    expect(
      labFixtureProblems({
        published: parseConsumerContract(
          withSpatialRow('retire-by', 'WO-RET-01'),
        ).published,
      }),
    ).toEqual(['releaseSync.lab names ./spatial, which is not a lab row']);
    expect(
      labFixtureProblems({
        ledger: { './spatial': { owner: 'WO-GAT-10', reviewBy: '4.0' } },
      }),
    ).toEqual([
      'releaseSync.lab ./spatial owner is not the table owner WO-CRA-15',
    ]);
    expect(
      labFixtureProblems({
        ledger: {
          './spatial': { owner: 'WO-CRA-15', reviewBy: '4.0', certified: true },
        },
      }),
    ).toEqual(['releaseSync.lab ./spatial has unknown key certified']);
    expect(labFixtureProblems({ ledger: ['./spatial'] })).toEqual([
      'releaseSync.lab is not an object keyed by subpath',
    ]);
  });

  it('N4: rejects a missing, malformed or already reached review line', () => {
    const withReviewBy = (reviewBy: unknown) =>
      labFixtureProblems({
        ledger: { './spatial': { owner: 'WO-CRA-15', reviewBy } },
      });

    expect(
      labFixtureProblems({ ledger: { './spatial': { owner: 'WO-CRA-15' } } }),
    ).toEqual(['./spatial is lab but has no reviewBy release line']);
    expect(withReviewBy('next major')).toEqual([
      './spatial reviewBy "next major" is not a release line (major.minor)',
    ]);
    expect(withReviewBy('4.0.0')).toHaveLength(1);
    expect(withReviewBy('2.19')).toEqual([
      './spatial reviewBy 2.19 is not later than 2.19.36',
    ]);
    expect(withReviewBy('2.4')).toHaveLength(1);
    expect(withReviewBy('2.20')).toEqual([]);
    expect(
      labFixtureProblems({ packageVersion: '4.0.0' }),
    ).toEqual(['./spatial reviewBy 4.0 is not later than 4.0.0']);
  });
});

/**
 * The showroom is the only consumer inside this repository, so its baseline is
 * the design system's own to keep honest. Reading the config as text keeps the
 * assertion independent of the showroom's Next/ESLint dependency tree.
 */
function tallyLabel(row: { disposition: string; retiredBy: string | null }) {
  return row.disposition === 'retire-by'
    ? `retire-by ${row.retiredBy}`
    : row.disposition;
}

/** The summary lines §1.1 must carry for a published table, sorted. */
function expectedTally(
  published: ReadonlyArray<{ disposition: string; retiredBy: string | null }>,
): string[] {
  const counts = new Map<string, number>();
  for (const row of published) {
    const label = tallyLabel(row);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts]
    .map(([label, count]) => `| \`${label}\` | ${count} |`)
    .sort();
}

/** The document with §1.1 rewritten to the tally its own table has. */
function restateTally(markdown: string): string {
  const lines = markdown
    .split('\n')
    .filter((line) => !TALLY_LINE.test(line));
  const anchor = lines.findIndex((line) =>
    line.startsWith('| Subpaths publicados |'),
  );
  if (anchor === -1) throw new Error('the document has no §1.1 summary');
  lines.splice(
    anchor + 1,
    0,
    ...expectedTally(parseConsumerContract(markdown).published),
  );
  return lines.join('\n');
}

const TALLY_LINE =
  /^\| `(?:guaranteed|lab|forbidden|retire-by [^`]+)` \| \d+ \|$/;

/** The disposition summary lines a document actually states, sorted. */
function statedTally(markdown: string): string[] {
  return (
    markdown.match(new RegExp(TALLY_LINE.source, 'gm')) ?? []
  ).sort();
}

describe('showroom mounts the rule with a decrease-only baseline', () => {
  const SHOWROOM_BASELINE_CAP = 7;

  function showroomAllowSubpaths(config: string): string[] {
    const block = /allowSubpaths:\s*\[([^\]]*)\]/.exec(config);
    if (!block) throw new Error('showroom config declares no allowSubpaths');
    return [...block[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
  }

  it('mounts the contract rule from the published entrypoint', () => {
    expect(showroomConfig).toContain("from '@rottay/design-system/eslint'");
    expect(showroomConfig).toContain("'@rottay/no-unsanctioned-ds-subpath'");
    expect(showroomConfig).toContain("'error'");
  });

  it('mounts only the contract rule, not the recommended preset', () => {
    expect(showroomConfig).not.toContain('configs.recommended');
    for (const other of Object.keys(rules)) {
      if (other === 'no-unsanctioned-ds-subpath') continue;
      expect(showroomConfig).not.toContain(`'@rottay/${other}'`);
    }
  });

  it('baselines only unsanctioned subpaths the showroom actually imports', () => {
    const baseline = showroomAllowSubpaths(showroomConfig);

    expect(baseline).toHaveLength(SHOWROOM_BASELINE_CAP);
    expect(new Set(baseline).size).toBe(baseline.length);

    for (const subpath of baseline) {
      const row = classifySubpath(subpath);
      expect(row, `${subpath} is not a contract row`).not.toBeNull();
      expect(row?.disposition, subpath).not.toBe('guaranteed');
      expect(
        measuredBySubpath.get(subpath)?.showroom ?? 0,
        `${subpath} has no measured showroom consumer`,
      ).toBeGreaterThan(0);
    }
  });

  it('refuses a widened, guaranteed or unconsumed baseline', () => {
    const baseline = showroomAllowSubpaths(showroomConfig);

    // A guaranteed subpath must never be baselined -- it already passes.
    expect(classifySubpath('./icons')?.disposition).toBe('guaranteed');

    // An unsanctioned subpath with no showroom consumer must never be baselined.
    expect(classifySubpath('./styles/modern')?.disposition).toBe('retire-by');
    expect(measuredBySubpath.get('./styles/modern')?.showroom).toBe(0);

    // The cap is the current measurement: the list may only shrink.
    expect(baseline.length).toBeLessThanOrEqual(SHOWROOM_BASELINE_CAP);
  });
});

describe('no-unsanctioned-ds-subpath', () => {
  it('passes on every guaranteed subpath', () => {
    const guaranteed = CONTRACT_ROWS.filter(
      (row) => row.disposition === 'guaranteed',
    ).map((row) => row.subpath);

    expect(guaranteed).toHaveLength(19);
    for (const subpath of guaranteed) {
      const specifier =
        subpath === '.'
          ? '@rottay/design-system'
          : `@rottay/design-system${subpath.slice(1)}`;
      expect(importFrom(specifier), specifier).toEqual([]);
    }
  });

  it('fails on a governed subpath scheduled for retirement', () => {
    const { created, reports } = visitors();
    created.ImportDeclaration?.({
      source: { value: '@rottay/design-system/patterns/charts' },
    });

    expect(reports).toHaveLength(1);
    expect(reports[0]?.messageId).toBe('retireBy');
    expect(reports[0]?.data).toMatchObject({
      specifier: '@rottay/design-system/patterns/charts',
      subpath: './patterns/charts',
      retiredBy: 'WO-RET-01',
    });
  });

  it('fails on the published test fixture', () => {
    expect(
      importFrom('@rottay/design-system/tenant-theme-canary-fixtures'),
    ).toEqual(['retireBy']);
  });

  it('fails on an unpublished forbidden subpath and names no work order', () => {
    const { created, reports } = visitors();
    created.ImportDeclaration?.({
      source: { value: '@rottay/design-system/commercial.css' },
    });

    expect(reports[0]?.messageId).toBe('forbidden');
    expect(reports[0]?.data?.retiredBy).toBe('');
  });

  it('is fail-closed on a subpath that is in no table at all', () => {
    expect(importFrom('@rottay/design-system/does-not-exist')).toEqual([
      'unknown',
    ]);
  });

  it('ignores specifiers that address a different package', () => {
    expect(importFrom('@rottay/design-system-extras/button')).toEqual([]);
    expect(importFrom('react')).toEqual([]);
    expect(importFrom('./local/module')).toEqual([]);
  });

  it('resolves wildcard rows and prefers an exact row', () => {
    expect(classifySubpath('./icons/roles/action')?.subpath).toBe(
      './icons/roles/*',
    );
    expect(classifySubpath('./dist/bithire.css')?.subpath).toBe('./dist/*.css');
    expect(classifySubpath('./icons/roles/')).toBeNull();
    expect(classifySubpath('./icons')?.subpath).toBe('./icons');
    expect(subpathOfSpecifier('@rottay/design-system')).toBe('.');
    expect(subpathOfSpecifier('@rottay/design-systemx')).toBeNull();
  });

  it('covers re-exports, require and dynamic import', () => {
    const { created, reports } = visitors();
    const source = { value: '@rottay/design-system/styles/modern' };

    created.ExportAllDeclaration?.({ source });
    created.ExportNamedDeclaration?.({ source });
    created.ImportExpression?.({ source });
    created.CallExpression?.({
      callee: { type: 'Identifier', name: 'require' },
      arguments: [{ value: '@rottay/design-system/styles/modern' }],
    });
    created.CallExpression?.({
      callee: { type: 'Import' },
      arguments: [{ value: '@rottay/design-system/styles/modern' }],
    });
    created.ExportNamedDeclaration?.({});

    expect(reports).toHaveLength(5);
    expect(reports.every((report) => report.messageId === 'retireBy')).toBe(
      true,
    );
  });

  describe('lab doors', () => {
    const labRule = createNoUnsanctionedDsSubpath((subpath) =>
      classifySubpathIn(
        [...LAB_FIXTURE.published, ...LAB_FIXTURE.unpublished],
        subpath,
      ),
    );

    function lint(options: unknown[] = []) {
      const reports: Array<{
        messageId?: string;
        data?: Record<string, string>;
      }> = [];
      labRule
        .create({
          filename: '/app/src/scene/index.tsx',
          options,
          report: (descriptor) => reports.push(descriptor),
        })
        .ImportDeclaration?.({
          source: { value: '@rottay/design-system/spatial' },
        });
      return reports;
    }

    it('N5: fails an app import of a lab door that is not opted in', () => {
      const reports = lint();

      expect(reports).toHaveLength(1);
      expect(reports[0]?.messageId).toBe('lab');
      expect(reports[0]?.data).toMatchObject({
        specifier: '@rottay/design-system/spatial',
        subpath: './spatial',
        retiredBy: 'WO-CRA-15',
      });
      expect(
        lint([{ allowSubpaths: ['./icons/presets/bithire'] }]),
      ).toHaveLength(1);
    });

    it('P1: passes once the app lists the lab door in allowSubpaths', () => {
      expect(lint([{ allowSubpaths: ['./spatial'] }])).toEqual([]);
    });

    it('names the lab status, the owner and the opt-in in its message', () => {
      const message = labRule.meta.messages?.lab ?? '';

      expect(message).toContain('disposition: lab, owner {{retiredBy}}');
      expect(message).toContain('not counted as productive or certified');
      expect(message).toContain("'{{subpath}}' in allowSubpaths");
    });

    it('never treats a lab door as guaranteed in the live table', () => {
      for (const row of PUBLISHED_SUBPATHS) {
        if (row.disposition !== 'lab') continue;
        const specifier = `@rottay/design-system${row.subpath.slice(1)}`;
        expect(importFrom(specifier), specifier).toEqual(['lab']);
        expect(
          importFrom(specifier, [{ allowSubpaths: [row.subpath] }]),
          specifier,
        ).toEqual([]);
      }
    });

    it('has a message for every disposition the rule reports', () => {
      const messages = Object.keys(noUnsanctionedDsSubpath.meta.messages ?? {});
      expect(messages.sort()).toEqual([
        'forbidden',
        'lab',
        'retireBy',
        'unknown',
      ]);
    });
  });

  it('honours the decrease-only per-app baseline and file exemptions', () => {
    expect(
      importFrom('@rottay/design-system/icons/presets/bithire', [
        { allowSubpaths: ['./icons/presets/bithire'] },
      ]),
    ).toEqual([]);

    expect(
      importFrom('@rottay/design-system/styles/modern', [
        { allowSubpaths: ['./icons/presets/bithire'] },
      ]),
    ).toEqual(['retireBy']);

    const exempted = visitors(
      [{ exempt: ['**/src/components/landing/**'] }],
      '/app/src/components/landing/hero/index.tsx',
    );
    expect(Object.keys(exempted.created)).toEqual([]);
  });
});
