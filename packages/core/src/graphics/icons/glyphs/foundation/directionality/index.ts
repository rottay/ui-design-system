/**
 * @fileoverview One naming rule for glyph directionality, shared by the
 * semantic corpus gate and the legacy compatibility catalog.
 *
 * Both callers only ever know a PascalCase glyph name: the corpus gate reads
 * the pinned supplier export (`ArrowBendUpLeftIcon`), the compatibility
 * factory reads the exported display name (`ChevronRightIcon`). Neither has a
 * path into the drawn geometry, so the rule is deliberately name-derived and
 * split in two:
 *
 *   - `isDirectionalGlyphFamily` is the wide catch net. Every governed corpus
 *     row it matches must either mirror or be listed as an adjudicated
 *     exception, so a new directional glyph cannot land unflagged.
 *   - `mirrorsInRtl` is the narrow, affirmative rule. It is true only for the
 *     names that encode a reading-direction side, and it is what actually
 *     stamps `data-icon-mirrored="auto"`.
 *
 * A glyph that spells both sides (`ArrowsLeftRight`) is symmetric about the
 * inline axis: mirroring it is a no-op, so the narrow rule leaves it alone.
 * Vertical, rotational and cyclic glyphs (`ArrowUp`, `ArrowsClockwise`,
 * `Repeat`) are never mirrored: their axis is not the reading axis.
 */

const DIRECTIONAL_FAMILY_PATTERNS: readonly RegExp[] = [
  /^Arrow/u,
  /^Arrows/u,
  /^Caret/u,
  /^Chevron/u,
  /^FlowArrow$/u,
  /^Sign(In|Out)$/u,
  /^Sidebar/u,
  /^(Back|Forward)$/u,
  /^(Undo|Redo)$/u,
  /^(Login|Logout)$/u,
  /^(Shipping|Delivery)$/u,
];

/**
 * Names that read a side without spelling `Left` or `Right`. Kept explicit:
 * an implicit rule here would silently mirror glyphs nobody adjudicated.
 */
const MIRRORING_NAMES: ReadonlySet<string> = new Set([
  'ArrowsSplit',
  'FlowArrow',
  'SignIn',
  'SignOut',
  'Login',
  'Logout',
  'Back',
  'Forward',
  'Undo',
  'Redo',
  'Sidebar',
  'SidebarSimple',
]);

/**
 * Names that spell a side but mean a physical one. A text-alignment command
 * keeps its physical edge in every direction: `AlignLeft` is "flush left",
 * not "flush to the start".
 */
const PHYSICAL_COMMAND_PATTERNS: readonly RegExp[] = [/^(Text)?Align/u];

/** Strips the catalog's `Icon` suffix so supplier and display names compare alike. */
export function normalizeGlyphName(name: string): string {
  return name.endsWith('Icon') ? name.slice(0, -4) : name;
}

/** True when a name belongs to a family whose mirroring must be adjudicated. */
export function isDirectionalGlyphFamily(name: string): boolean {
  const normalized = normalizeGlyphName(name);
  return DIRECTIONAL_FAMILY_PATTERNS.some((pattern) => pattern.test(normalized));
}

/** True when a name encodes a reading-direction side and must mirror under RTL. */
export function mirrorsInRtl(name: string): boolean {
  const normalized = normalizeGlyphName(name);
  if (PHYSICAL_COMMAND_PATTERNS.some((pattern) => pattern.test(normalized))) return false;
  const left = normalized.includes('Left');
  const right = normalized.includes('Right');
  if (left !== right) return true;
  if (left && right) return false;
  return MIRRORING_NAMES.has(normalized);
}

/**
 * Legacy catalog exports whose semantic twin is a row inside the fingerprinted
 * v4 corpus prefix, so that row cannot carry `autoMirror` yet. Stamping the
 * legacy export alone would make the two facades disagree on the same glyph,
 * so the decision is pinned here until the owner re-anchors the fingerprint.
 * Keyed by export name because that is what the catalog publishes.
 */
export const FROZEN_CORPUS_PREFIX_EXPORTS: ReadonlyMap<string, string> = new Map([
  [
    'ExternalLinkIcon',
    'ArrowSquareOut: its semantic twin action.open-external is row 54 of the fingerprinted v4 prefix and stays unflagged, so the legacy export must not diverge.',
  ],
  [
    'WorkflowIcon',
    'FlowArrow: its semantic twin system.workflow is row 99 of the fingerprinted v4 prefix and stays unflagged, so the legacy export must not diverge.',
  ],
]);
