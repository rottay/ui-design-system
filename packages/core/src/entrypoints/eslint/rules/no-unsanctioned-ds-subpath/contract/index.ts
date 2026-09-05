/**
 * Consumer-contract disposition table.
 *
 * Mirror of `packages/core/docs/consumer-contract/index.md` §1.2 and §1.3.
 * The document is the source; this file is the copy the lint rule imports so
 * the published rule never touches the filesystem. The adjacent test reparses
 * the document and fails on any difference, so the two cannot drift.
 */

export type SubpathDisposition = 'guaranteed' | 'retire-by' | 'forbidden';

export interface ContractRow {
  /** Export-map key, e.g. `.`, `./icons`, `./icons/roles/*`. */
  subpath: string;
  disposition: SubpathDisposition;
  /** Work order that adjudicates the retirement, or null. */
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
  { subpath: './contracts/foundation', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './contracts/patterns', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './contracts/i18n', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './contracts/runtime', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './contracts/primitives', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './contracts/structures', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './contracts/surfaces', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './runtime/i18n', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './runtime/motion', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './runtime/navigation', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './runtime/forms', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './runtime/cross-tab-sync', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './runtime/provider', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './runtime/root-attributes', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './runtime/responsive', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './runtime/tenant', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './runtime/visual-authority', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './runtime/tenant-theme', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/button', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/checkbox', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/date-picker', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/input', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/input-number', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/radio', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/select', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/slider', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/switch', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/textarea', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/toggle', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/breadcrumb', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/float-button', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/segmented', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/steps', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/tabs', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/box', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/divider', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/flex', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/grid', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/responsive', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/stack', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/avatar', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/badge', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/card', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/empty', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/image', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/table', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/tag', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/tooltip', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/typography', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/alert', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/message', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/modal', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/progress', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/skeleton', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/spinner', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/toast', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './primitives/dropdown', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './patterns/presence', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './patterns/data-table', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './patterns/list-toolbar', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './patterns/record-facts', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './patterns/stats-grid', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './patterns/widget-board', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './patterns/adaptive-overlay', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './patterns/empty-state', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './patterns/command-palette', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './patterns/shortcuts-overlay', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './patterns/feature-workspace-frame', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './patterns/kanban-board', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './patterns/charts', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './structures/dashboard-header', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './structures/record-summary', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './structures/app-shell', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './structures/action-dock', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './structures/column-menu', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './surfaces/collection-workspace', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './surfaces/oauth-transition', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './public-entrypoints-manifest', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './icons', disposition: 'guaranteed', retiredBy: null },
  { subpath: './icons/full', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './icons/presets/bithire', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './icons/roles/*', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './icons/corpus', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './icons/foundation', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './icons/bithire', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
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
  { subpath: './effects', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './spatial', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './spatial/spec', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './styles', disposition: 'retire-by', retiredBy: 'WO-CAN-03' },
  { subpath: './styles.css', disposition: 'guaranteed', retiredBy: null },
  { subpath: './styles/default', disposition: 'retire-by', retiredBy: 'WO-CAN-03' },
  { subpath: './styles/bithire', disposition: 'retire-by', retiredBy: 'WO-CAN-03' },
  { subpath: './styles/evnto', disposition: 'retire-by', retiredBy: 'WO-CAN-03' },
  { subpath: './styles/rottay', disposition: 'retire-by', retiredBy: 'WO-CAN-03' },
  { subpath: './styles/modern', disposition: 'retire-by', retiredBy: 'WO-CAN-03' },
  { subpath: './eslint', disposition: 'guaranteed', retiredBy: null },
  { subpath: './supplier-contract', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './hooks-manifest', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
  { subpath: './supplier-honesty-cli', disposition: 'retire-by', retiredBy: 'WO-RET-01' },
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
  for (const row of CONTRACT_ROWS) {
    if (row.subpath === subpath) return row;
  }
  for (const row of CONTRACT_ROWS) {
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
