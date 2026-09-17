/**
 * Catalog gate: a directional glyph cannot be published through the legacy
 * named catalog without a mirroring decision.
 *
 * The legacy catalog renames its supplier freely (`Undo2Icon` is drawn by
 * `ArrowUUpLeft`, `LogOutIcon` by `SignOut`), so the decision must be derived
 * from the supplier module, never from the export name. This gate parses every
 * catalog `index.ts`, rebuilds the export -> supplier mapping the factory sees
 * at runtime, and fails on any export whose supplier belongs to a directional
 * family and is neither stamped nor adjudicated below with a reason.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  FROZEN_CORPUS_PREFIX_EXPORTS,
  isDirectionalGlyphFamily,
  mirrorsInRtl,
} from '../../../foundation/directionality';

const CATALOG_ROOT = join(
  process.cwd(),
  'src/graphics/icons/glyphs/presentation/catalog',
);

interface CatalogExport {
  readonly file: string;
  readonly exportName: string;
  readonly supplier: string;
}

/**
 * Directional-family suppliers that must NOT mirror, each with the reason.
 * A rotational or block-axis glyph does not encode the reading direction.
 */
const NON_MIRRORING: ReadonlyMap<string, string> = new Map([
  ['RefreshCwIcon', 'ArrowsClockwise is rotational; rotation direction is not reading direction.'],
  ['RefreshCcwIcon', 'ArrowsCounterClockwise is rotational; rotation direction is not reading direction.'],
  ['RotateCwIcon', 'ArrowClockwise is rotational; rotation direction is not reading direction.'],
  ['RotateCcwIcon', 'ArrowCounterClockwise is rotational; rotation direction is not reading direction.'],
  ['MoveIcon', 'ArrowsOutCardinal points at all four cardinals; it is symmetric about the inline axis.'],
  ['ArrowUpIcon', 'ArrowUp points along the block axis, which RTL does not flip.'],
  ['ArrowDownIcon', 'ArrowDown points along the block axis, which RTL does not flip.'],
  ['ChevronUpIcon', 'CaretUp points along the block axis, which RTL does not flip.'],
  ['ChevronDownIcon', 'CaretDown points along the block axis, which RTL does not flip.'],
  ['ArrowLeftRightIcon', 'ArrowsLeftRight spells both sides, so mirroring it is a no-op.'],
  ['ArrowUpDownIcon', 'ArrowsDownUp is a vertical pair; RTL does not flip the block axis.'],
]);

function collectCatalogFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) return entry.name === 'tests' ? [] : collectCatalogFiles(path);
    return entry.isFile() && /^index\.tsx?$/u.test(entry.name) ? [path] : [];
  });
}

function catalogExportsFrom(file: string): CatalogExport[] {
  const source = readFileSync(file, 'utf8');
  const display = relative(process.cwd(), file);
  const supplierByLocal = new Map<string, string>();

  const importExpression =
    /import\s*\{([^}]*)\}\s*from\s*['"]@phosphor-icons\/react\/dist\/ssr\/([A-Z][A-Za-z0-9]*)['"];?/gu;
  for (const match of source.matchAll(importExpression)) {
    for (const clause of match[1].split(',').map((part) => part.trim()).filter(Boolean)) {
      const [imported, local = imported] = clause.split(/\s+as\s+/u).map((part) => part.trim());
      supplierByLocal.set(local, match[2]);
    }
  }

  const exportExpression =
    /export\s+const\s+([A-Za-z0-9_]+)\s*=\s*createPhosphorCompatibilityIcon\(\s*([A-Za-z0-9_]+)\s*,/gu;
  return [...source.matchAll(exportExpression)].map(([, exportName, local]) => {
    const supplier = supplierByLocal.get(local);
    expect(supplier, `${display}:${exportName} has no pinned Phosphor supplier`).toBeDefined();
    return { file: display, exportName, supplier: supplier! };
  });
}

const catalogExports = collectCatalogFiles(CATALOG_ROOT).flatMap(catalogExportsFrom);

describe('legacy catalog directional stamping', () => {
  it('reads a supplier for every catalog export', () => {
    expect(catalogExports.length).toBeGreaterThan(0);
    expect(catalogExports.filter((entry) => !entry.supplier)).toEqual([]);
  });

  it('flags or adjudicates every directional-family export', () => {
    const unflagged: string[] = [];
    for (const entry of catalogExports) {
      if (!isDirectionalGlyphFamily(entry.supplier)) continue;
      if (mirrorsInRtl(entry.supplier) && !FROZEN_CORPUS_PREFIX_EXPORTS.has(entry.exportName)) {
        continue;
      }
      if (NON_MIRRORING.has(entry.exportName)) continue;
      if (FROZEN_CORPUS_PREFIX_EXPORTS.has(entry.exportName)) continue;
      unflagged.push(`${entry.exportName} (${entry.supplier}) in ${entry.file}`);
    }
    expect(unflagged).toEqual([]);
  });

  it('holds every adjudicated exception to a live export and a stated reason', () => {
    const exportNames = new Set(catalogExports.map((entry) => entry.exportName));
    for (const [exportName, reason] of [...NON_MIRRORING, ...FROZEN_CORPUS_PREFIX_EXPORTS]) {
      expect(exportNames.has(exportName), `${exportName} is listed but absent from the catalog`).toBe(
        true,
      );
      expect(reason.length, `${exportName} needs a stated reason`).toBeGreaterThanOrEqual(20);
    }
  });

  it('derives the decision from the supplier, not from the export name', () => {
    const renamed = new Map([
      ['Undo2Icon', 'ArrowUUpLeft'],
      ['LogOutIcon', 'SignOut'],
      ['ReplyIcon', 'ArrowBendUpLeft'],
    ]);
    for (const [exportName, supplier] of renamed) {
      const entry = catalogExports.find((candidate) => candidate.exportName === exportName);
      expect(entry?.supplier, exportName).toBe(supplier);
      expect(mirrorsInRtl(exportName), `${exportName} is invisible to the export-name rule`).toBe(
        false,
      );
      expect(mirrorsInRtl(supplier), `${supplier} must mirror`).toBe(true);
    }
  });

  it('refuses a planted directional export that carries no decision', () => {
    const planted: CatalogExport = {
      file: 'planted',
      exportName: 'SyncRetryIcon',
      supplier: 'ArrowsClockwise',
    };
    const unflagged: string[] = [];
    for (const entry of [...catalogExports, planted]) {
      if (!isDirectionalGlyphFamily(entry.supplier)) continue;
      if (mirrorsInRtl(entry.supplier) && !FROZEN_CORPUS_PREFIX_EXPORTS.has(entry.exportName)) {
        continue;
      }
      if (NON_MIRRORING.has(entry.exportName)) continue;
      if (FROZEN_CORPUS_PREFIX_EXPORTS.has(entry.exportName)) continue;
      unflagged.push(entry.exportName);
    }
    expect(unflagged).toEqual(['SyncRetryIcon']);
  });

  it('records the exports that now stamp data-icon-mirrored', () => {
    const stamped = catalogExports
      .filter(
        (entry) =>
          mirrorsInRtl(entry.supplier) && !FROZEN_CORPUS_PREFIX_EXPORTS.has(entry.exportName),
      )
      .map((entry) => entry.exportName)
      .sort();

    expect(stamped).toEqual([
      'ArrowDownLeftIcon',
      'ArrowDownRightIcon',
      'ArrowLeftIcon',
      'ArrowRightIcon',
      'ArrowUpRightIcon',
      'ChevronLeftIcon',
      'ChevronRightIcon',
      'LogOutIcon',
      'PanelLeftCloseIcon',
      'PanelLeftOpenIcon',
      'PanelRightCloseIcon',
      'ReplyIcon',
      'ToggleLeftIcon',
      'ToggleRightIcon',
      'Undo2Icon',
    ]);
  });
});
