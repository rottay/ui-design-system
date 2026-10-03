/**
 * Consumer-contract disposition table.
 *
 * Mirror of `packages/core/docs/consumer-contract/index.md` §1.2 and §1.3.
 * The document is the source; this file is the copy the lint rule imports so
 * the published rule never touches the filesystem. The adjacent test reparses
 * the document and fails on any difference, so the two cannot drift.
 */

export type SubpathDisposition = 'guaranteed' | 'retire-by' | 'lab' | 'forbidden';

export interface ContractRow {
  /** Export-map key, e.g. `.`, `./icons`, `./icons/roles/*`. */
  subpath: string;
  disposition: SubpathDisposition;
  /** Work order that adjudicates the retirement or owns the lab door, or null. */
  retiredBy: string | null;
}

/** Repo-relative path of the document this table mirrors. */
export const CONTRACT_DOCUMENT_PATH =
  'packages/core/docs/consumer-contract/index.md';

/** The package whose subpaths this contract governs. */
export const CONTRACT_PACKAGE = '@rottay/design-system';

/** §1.2 -- every key of `packages/core/package.json` `exports`, in file order. */
export const PUBLISHED_SUBPATHS: readonly ContractRow[] = [
  { subpath: '.', disposition: 'guaranteed', retiredBy: null },
  { subpath: './server', disposition: 'guaranteed', retiredBy: null },
  { subpath: './patterns/charts', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './public-entrypoints-manifest', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './icons', disposition: 'guaranteed', retiredBy: null },
  { subpath: './icons/presets/bithire', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './icons/roles/*', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './icons/foundation', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './icons/identity', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './icons/intelligence', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './icons/operations', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './marks', disposition: 'guaranteed', retiredBy: null },
  { subpath: './marks/brand', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './marks/cloud', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './pictograms', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './charts', disposition: 'guaranteed', retiredBy: null },
  { subpath: './charts/spec', disposition: 'guaranteed', retiredBy: null },
  { subpath: './charts/access', disposition: 'guaranteed', retiredBy: null },
  { subpath: './charts/renderers', disposition: 'guaranteed', retiredBy: null },
  { subpath: './motion', disposition: 'guaranteed', retiredBy: null },
  { subpath: './spatial', disposition: 'lab', retiredBy: 'WO-CRA-15' },
  { subpath: './styles.css', disposition: 'guaranteed', retiredBy: null },
  { subpath: './styles/bithire', disposition: 'retire-by', retiredBy: 'WO-CAN-03' },
  { subpath: './styles/evnto', disposition: 'retire-by', retiredBy: 'WO-CAN-03' },
  { subpath: './styles/rottay', disposition: 'retire-by', retiredBy: 'WO-CAN-03' },
  { subpath: './styles/modern', disposition: 'retire-by', retiredBy: 'WO-CAN-03' },
  { subpath: './styles/frozen-engines', disposition: 'guaranteed', retiredBy: null },
  { subpath: './eslint', disposition: 'guaranteed', retiredBy: null },
  { subpath: './supplier-contract', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './hooks-manifest', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './supplier-honesty-cli', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './fonts/arabic-text.css', disposition: 'guaranteed', retiredBy: null },
  { subpath: './fonts/editorial-display.css', disposition: 'guaranteed', retiredBy: null },
  { subpath: './fonts/editorial-text.css', disposition: 'guaranteed', retiredBy: null },
  { subpath: './fonts/grotesk-display.css', disposition: 'guaranteed', retiredBy: null },
  { subpath: './fonts/humanist-text.css', disposition: 'guaranteed', retiredBy: null },
  { subpath: './fonts/geometric-display.css', disposition: 'guaranteed', retiredBy: null },
  { subpath: './fonts/plex-mono.css', disposition: 'guaranteed', retiredBy: null },
  { subpath: './dist/*.css', disposition: 'retire-by', retiredBy: 'WO-CAN-03' },
  { subpath: './tenant-theme-canary-fixtures', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
];

/** §1.3 -- specifiers observed in app code that the package does not export. */
export const UNPUBLISHED_SUBPATHS: readonly ContractRow[] = [
  { subpath: './commercial', disposition: 'forbidden', retiredBy: null },
  { subpath: './commercial.css', disposition: 'forbidden', retiredBy: null },
  { subpath: './surfaces', disposition: 'forbidden', retiredBy: null },
];

export const CONTRACT_ROWS: readonly ContractRow[] = [
  ...PUBLISHED_SUBPATHS,
  ...UNPUBLISHED_SUBPATHS,
];

/** Export-map wildcard match: at most one `*`, matching a non-empty segment run. */
function matchesSubpath(pattern: string, subpath: string): boolean {
  const star = pattern.indexOf('*');
  if (star === -1) return pattern === subpath;
  const head = pattern.slice(0, star);
  const tail = pattern.slice(star + 1);
  return (
    subpath.length > head.length + tail.length &&
    subpath.startsWith(head) &&
    subpath.endsWith(tail)
  );
}

/**
 * Resolve a bare subpath (`.`, `./icons`, ...) to its contract row.
 * Exact rows win over wildcard rows. Returns null when the subpath is in
 * neither table -- the rule treats that as `unknown` and reports it.
 */
export function classifySubpath(subpath: string): ContractRow | null {
  return classifySubpathIn(CONTRACT_ROWS, subpath);
}

/** `classifySubpath` over an explicit table instead of the mirrored one. */
export function classifySubpathIn(
  rows: readonly ContractRow[],
  subpath: string,
): ContractRow | null {
  for (const row of rows) {
    if (row.subpath === subpath) return row;
  }
  for (const row of rows) {
    if (matchesSubpath(row.subpath, subpath)) return row;
  }
  return null;
}

/**
 * Turn a module specifier into the subpath the contract speaks about.
 * Returns null for specifiers that do not address this package.
 */
export function subpathOfSpecifier(specifier: string): string | null {
  if (specifier === CONTRACT_PACKAGE) return '.';
  if (!specifier.startsWith(`${CONTRACT_PACKAGE}/`)) return null;
  return `.${specifier.slice(CONTRACT_PACKAGE.length)}`;
}
