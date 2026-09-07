import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { rules } from '../../..';
import { noUnsanctionedDsSubpath } from '..';
import {
  CONTRACT_ROWS,
  PUBLISHED_SUBPATHS,
  UNPUBLISHED_SUBPATHS,
  classifySubpath,
  subpathOfSpecifier,
} from '../contract';
import {
  parseConsumerContract,
  parseContractMeasurements,
} from '../contract/parse';

const PACKAGE_ROOT = resolve(__dirname, '../../../../../..');
const DOCUMENT_PATH = resolve(PACKAGE_ROOT, 'docs/consumer-contract/index.md');
const PACKAGE_PATH = resolve(PACKAGE_ROOT, 'package.json');

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
const exportKeys = Object.keys(
  (JSON.parse(readFileSync(PACKAGE_PATH, 'utf8')) as {
    exports: Record<string, unknown>;
  }).exports,
);

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

  it('publishes 120 subpaths and states that count in the document', () => {
    // 121 until `./surfaces/oauth-transition` left the package with WO-CAN-04
    // (F-18: a parallel design system with product identity and its own private
    // token namespace). The count is asserted three ways on purpose -- the export
    // map, the parsed table and the prose -- so a retirement that updates only
    // one of them is a failure rather than a silent drift.
    expect(exportKeys).toHaveLength(120);
    expect(parsed.published).toHaveLength(120);
    expect(documentMarkdown).toContain(
      '| Subpaths publicados | 120 |',
    );
    expect(documentMarkdown).toContain(
      '## 1. Superficie de importación sancionada (120/120)',
    );
  });

  it('states the disposition split the table actually has', () => {
    const tally = (disposition: string, retiredBy: string | null) =>
      parsed.published.filter(
        (row) =>
          row.disposition === disposition && row.retiredBy === retiredBy,
      ).length;

    expect(documentMarkdown).toContain(
      `| \`guaranteed\` | ${tally('guaranteed', null)} |`,
    );
    expect(documentMarkdown).toContain(
      `| \`retire-by WO-RET-01\` | ${tally('retire-by', 'WO-RET-01')} |`,
    );
    expect(documentMarkdown).toContain(
      `| \`retire-by WO-CAN-03\` | ${tally('retire-by', 'WO-CAN-03')} |`,
    );
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
      '| `./effects` | retire-by | WO-RET-01 |',
      '| `./effects` | retire-by | — |',
    );
    expect(() => parseConsumerContract(broken)).toThrow(
      /retire-by but names no work order/,
    );

    const invented = documentMarkdown.replace(
      '| `./effects` | retire-by | WO-RET-01 |',
      '| `./effects` | allowed | — |',
    );
    expect(() => parseConsumerContract(invented)).toThrow(
      /unknown disposition "allowed"/,
    );

    const unfenced = documentMarkdown.replace(
      '<!-- consumer-contract:published:end -->',
      '',
    );
    expect(() => parseConsumerContract(unfenced)).toThrow(/missing end fence/);
  });
});

/**
 * The showroom is the only consumer inside this repository, so its baseline is
 * the design system's own to keep honest. Reading the config as text keeps the
 * assertion independent of the showroom's Next/ESLint dependency tree.
 */
describe('showroom mounts the rule with a decrease-only baseline', () => {
  const SHOWROOM_BASELINE_CAP = 9;

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
    expect(classifySubpath('./effects')?.disposition).toBe('retire-by');
    expect(measuredBySubpath.get('./effects')?.showroom).toBe(0);

    // The cap is the current measurement: the list may only shrink.
    expect(baseline.length).toBeLessThanOrEqual(SHOWROOM_BASELINE_CAP);
  });
});

describe('no-unsanctioned-ds-subpath', () => {
  it('passes on every guaranteed subpath', () => {
    const guaranteed = CONTRACT_ROWS.filter(
      (row) => row.disposition === 'guaranteed',
    ).map((row) => row.subpath);

    expect(guaranteed).toHaveLength(17);
    for (const subpath of guaranteed) {
      const specifier =
        subpath === '.'
          ? '@rottay/design-system'
          : `@rottay/design-system${subpath.slice(1)}`;
      expect(importFrom(specifier), specifier).toEqual([]);
    }
  });

  it('fails on a per-component subpath scheduled for retirement', () => {
    const { created, reports } = visitors();
    created.ImportDeclaration?.({
      source: { value: '@rottay/design-system/primitives/button' },
    });

    expect(reports).toHaveLength(1);
    expect(reports[0]?.messageId).toBe('retireBy');
    expect(reports[0]?.data).toMatchObject({
      specifier: '@rottay/design-system/primitives/button',
      subpath: './primitives/button',
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
    const source = { value: '@rottay/design-system/effects' };

    created.ExportAllDeclaration?.({ source });
    created.ExportNamedDeclaration?.({ source });
    created.ImportExpression?.({ source });
    created.CallExpression?.({
      callee: { type: 'Identifier', name: 'require' },
      arguments: [{ value: '@rottay/design-system/effects' }],
    });
    created.CallExpression?.({
      callee: { type: 'Import' },
      arguments: [{ value: '@rottay/design-system/effects' }],
    });
    created.ExportNamedDeclaration?.({});

    expect(reports).toHaveLength(5);
    expect(reports.every((report) => report.messageId === 'retireBy')).toBe(
      true,
    );
  });

  it('honours the decrease-only per-app baseline and file exemptions', () => {
    expect(
      importFrom('@rottay/design-system/icons/presets/bithire', [
        { allowSubpaths: ['./icons/presets/bithire'] },
      ]),
    ).toEqual([]);

    expect(
      importFrom('@rottay/design-system/effects', [
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
