/**
 * MODERN-TENANT-VALUE-FREE — the Modern engine owns no tenant color.
 *
 * The product rule this pins: colors always come from the tenant (a static
 * BrandTheme or a DB Appearance document), and the Modern engine consumes
 * semantic channels without owning a light/dark identity of its own. The
 * failure mode is quiet and expensive: a tenant's literal gets copied into an
 * engine stylesheet as a "default", and from then on that tenant's color is
 * everyone's color — changing the BrandTheme moves the channel while the
 * engine keeps painting the old value underneath.
 *
 * The test collects every literal color value the three first-party
 * BrandThemes author (palette bodies AND `modes` overlays, since a mode
 * overlay is just as much tenant identity as the base palette) and asserts
 * none of them appears as a DECLARED VALUE inside the Modern engine CSS tree
 * or `foundation/themes/default.css`.
 *
 * Pre-existing state is pinned, not failed on: KNOWN_TENANT_LITERALS is a
 * decrease-only inventory keyed by file + normalized value. A NEW tenant
 * literal in either tree is red immediately; draining an old one and failing
 * to update the pin is also red, so the list cannot quietly stay stale.
 */
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/bithire';
import { evntoBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/evnto';
import { rottayBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/platform';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(HERE, '../../..');
const MODERN_CSS_ROOT = join(SRC, 'foundation/tokens/css/runtime/engines/modern');
const DEFAULT_THEME_CSS = join(SRC, 'foundation/tokens/css/foundation/themes/default.css');

/**
 * Achromatic values (pure white, pure black, any r=g=b gray, and transparent)
 * are not tenant identity. Every palette in the system contains them and no
 * product could avoid them; treating `#ffffff` in a stylesheet as "rottay's
 * primary leaked" would make the inventory noise instead of signal. Untokenized
 * neutral paint is a real problem, but it is the paint-literal gate's problem
 * (`engine-token-audit`), not this one.
 */
function isAchromatic(normalized: string): boolean {
  if (normalized === 'transparent' || normalized === 'currentcolor') return true;
  const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/.exec(normalized);
  if (hex) return hex[1] === hex[2] && hex[2] === hex[3];
  const rgb = /^rgba?\((\d+),(\d+),(\d+)/.exec(normalized);
  if (rgb) return rgb[1] === rgb[2] && rgb[2] === rgb[3];
  // oklch with zero chroma is a gray regardless of hue.
  const oklch = /^oklch\(([^ ]+) ([^ ]+)/.exec(normalized);
  if (oklch) return Number.parseFloat(oklch[2]) === 0;
  return false;
}

const COLOR_LITERAL =
  /#[0-9a-fA-F]{3,8}\b|\brgba?\(\s*[^)]*\)|\boklch\(\s*[^)]*\)|\bhsla?\(\s*[^)]*\)/g;

/** One canonical spelling per color so `#FFF`, `#ffffff` and `rgb( 1, 2,3 )` compare. */
function normalizeColor(raw: string): string | null {
  const value = raw.trim().toLowerCase();
  const hex = /^#([0-9a-f]{3,8})$/.exec(value);
  if (hex) {
    const digits = hex[1];
    if (digits.length === 3) return `#${digits.replace(/(.)/g, '$1$1')}`;
    if (digits.length === 4) return `#${digits.slice(0, 3).replace(/(.)/g, '$1$1')}`;
    if (digits.length === 6 || digits.length === 8) return `#${digits}`;
    return null;
  }
  const fn = /^(rgba?|oklch|hsla?)\(([^)]*)\)$/.exec(value);
  if (!fn) return null;
  // `var(--x)` inside a color function is a channel reference, not a literal.
  if (fn[2].includes('var(')) return null;
  return `${fn[1]}(${fn[2].replace(/\s*[,/]\s*/g, ',').replace(/\s+/g, ' ').trim()})`;
}

function colorsIn(text: string): string[] {
  const found: string[] = [];
  for (const match of text.matchAll(COLOR_LITERAL)) {
    const normalized = normalizeColor(match[0]);
    if (normalized && !isAchromatic(normalized)) found.push(normalized);
  }
  return found;
}

/** Every color literal reachable from a BrandTheme object, base body and modes alike. */
function themeColors(theme: unknown, sink: Set<string>): void {
  if (typeof theme === 'string') {
    for (const color of colorsIn(theme)) sink.add(color);
    return;
  }
  if (Array.isArray(theme)) {
    for (const item of theme) themeColors(item, sink);
    return;
  }
  if (theme && typeof theme === 'object') {
    for (const value of Object.values(theme)) themeColors(value, sink);
  }
}

function cssFilesUnder(root: string): string[] {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.css')) files.push(full);
    }
  };
  if (statSync(root).isDirectory()) walk(root);
  else files.push(root);
  return files.sort();
}

/** A declared value is the right-hand side of `prop: value;` — not a selector or comment. */
function declaredValues(css: string): { value: string; line: number }[] {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, (comment) =>
    comment.replace(/[^\n]/g, ' ')
  );
  const out: { value: string; line: number }[] = [];
  for (const match of stripped.matchAll(/:\s*([^;{}]+)[;}]/g)) {
    const line = stripped.slice(0, match.index).split('\n').length;
    out.push({ value: match[1], line });
  }
  return out;
}

const TENANT_COLORS = (() => {
  const sink = new Set<string>();
  for (const theme of [bithireBrandTheme, evntoBrandTheme, rottayBrandTheme]) {
    themeColors(theme, sink);
  }
  return sink;
})();

interface Finding {
  file: string;
  value: string;
}

function scan(files: string[]): Finding[] {
  const findings: Finding[] = [];
  for (const file of files) {
    const rel = relative(SRC, file);
    const seen = new Set<string>();
    for (const { value } of declaredValues(readFileSync(file, 'utf-8'))) {
      for (const color of colorsIn(value)) {
        if (!TENANT_COLORS.has(color) || seen.has(color)) continue;
        seen.add(color);
        findings.push({ file: rel, value: color });
      }
    }
  }
  return findings.sort((a, b) => (a.file + a.value).localeCompare(b.file + b.value));
}

const key = (finding: Finding) => `${finding.file} :: ${finding.value}`;

/**
 * Tenant literals declared as global defaults TODAY (decrease-only).
 *
 * Every entry sits in `foundation/themes/default.css`, and that is the whole
 * point: the Modern engine tree is already at zero, so the entire debt is one
 * file asserting tenant color as the system-wide default. Two shapes live here.
 *
 * Vertical identity — rottay's own canvas and neutrals, shipped as everyone's
 * default ground:
 *   #0c0c0e #0d0d10 #18181c #6b6b72 #a0a0a5 #475569 #7a6a5a #f8fafc
 *
 * Semantic ramps — the green/amber/red/blue steps the BrandThemes also author.
 * A shared provenance does not make them shared property: a tenant that moves
 * its success ramp still finds these underneath.
 *
 * Draining an entry means deleting its line here in the same change; the
 * staleness assertion below refuses a pin that no longer matches reality, so
 * the list cannot silently rot in either direction.
 */
const KNOWN_TENANT_LITERALS: readonly string[] = [
  'foundation/tokens/css/foundation/themes/default.css :: #0c0c0e',
  'foundation/tokens/css/foundation/themes/default.css :: #0d0d10',
  // Not new debt: these two ground literals predate the inventory but became
  // CLASSIFIABLE as tenant values when the rottay palette claimed them
  // (backgroundSecondaryColor/backgroundTertiaryColor, R1-P ground migration).
  // File content did not change; the drain belongs to the default.css
  // neutralization owner decision (wddefault-state.md).
  'foundation/tokens/css/foundation/themes/default.css :: #0f0f12',
  'foundation/tokens/css/foundation/themes/default.css :: #141417',
  'foundation/tokens/css/foundation/themes/default.css :: #14532d',
  'foundation/tokens/css/foundation/themes/default.css :: #15803d',
  'foundation/tokens/css/foundation/themes/default.css :: #166534',
  'foundation/tokens/css/foundation/themes/default.css :: #16a34a',
  'foundation/tokens/css/foundation/themes/default.css :: #18181c',
  'foundation/tokens/css/foundation/themes/default.css :: #1d4ed8',
  'foundation/tokens/css/foundation/themes/default.css :: #1e3a8a',
  'foundation/tokens/css/foundation/themes/default.css :: #1e40af',
  'foundation/tokens/css/foundation/themes/default.css :: #22c55e',
  'foundation/tokens/css/foundation/themes/default.css :: #2563eb',
  'foundation/tokens/css/foundation/themes/default.css :: #3b82f6',
  'foundation/tokens/css/foundation/themes/default.css :: #475569',
  'foundation/tokens/css/foundation/themes/default.css :: #4ade80',
  'foundation/tokens/css/foundation/themes/default.css :: #60a5fa',
  'foundation/tokens/css/foundation/themes/default.css :: #6b6b72',
  'foundation/tokens/css/foundation/themes/default.css :: #78350f',
  'foundation/tokens/css/foundation/themes/default.css :: #7a6a5a',
  'foundation/tokens/css/foundation/themes/default.css :: #7f1d1d',
  'foundation/tokens/css/foundation/themes/default.css :: #86efac',
  'foundation/tokens/css/foundation/themes/default.css :: #92400e',
  'foundation/tokens/css/foundation/themes/default.css :: #93c5fd',
  'foundation/tokens/css/foundation/themes/default.css :: #991b1b',
  'foundation/tokens/css/foundation/themes/default.css :: #a0a0a5',
  'foundation/tokens/css/foundation/themes/default.css :: #b45309',
  'foundation/tokens/css/foundation/themes/default.css :: #b91c1c',
  'foundation/tokens/css/foundation/themes/default.css :: #bbf7d0',
  'foundation/tokens/css/foundation/themes/default.css :: #bfdbfe',
  'foundation/tokens/css/foundation/themes/default.css :: #d97706',
  'foundation/tokens/css/foundation/themes/default.css :: #dc2626',
  'foundation/tokens/css/foundation/themes/default.css :: #ef4444',
  'foundation/tokens/css/foundation/themes/default.css :: #f59e0b',
  'foundation/tokens/css/foundation/themes/default.css :: #f87171',
  'foundation/tokens/css/foundation/themes/default.css :: #f8fafc',
  'foundation/tokens/css/foundation/themes/default.css :: #fbbf24',
  'foundation/tokens/css/foundation/themes/default.css :: #fca5a5',
  'foundation/tokens/css/foundation/themes/default.css :: #fcd34d',
  'foundation/tokens/css/foundation/themes/default.css :: #fde68a',
  'foundation/tokens/css/foundation/themes/default.css :: #fecaca',
  'foundation/tokens/css/foundation/themes/default.css :: rgba(239,68,68,0.08)',
  'foundation/tokens/css/foundation/themes/default.css :: rgba(245,158,11,0.08)',
  'foundation/tokens/css/foundation/themes/default.css :: rgba(34,197,94,0.08)',
];

describe('MODERN-TENANT-VALUE-FREE · the engine declares no tenant color', () => {
  const modernFiles = cssFilesUnder(MODERN_CSS_ROOT);
  const files = [...modernFiles, DEFAULT_THEME_CSS];

  it('reads a non-trivial tenant palette and a non-trivial engine tree', () => {
    expect(TENANT_COLORS.size).toBeGreaterThan(50);
    expect(modernFiles.length).toBeGreaterThan(50);
  });

  it('the Modern engine tree declares zero tenant literals — a floor, not a ratchet', () => {
    // Unlike default.css this side is already clean, so it is pinned at zero
    // outright. There is nothing here to drain and therefore no budget to spend.
    expect(scan(modernFiles)).toEqual([]);
  });

  it('declares no tenant literal beyond the pinned decrease-only inventory', () => {
    const observed = scan(files).map(key);
    if (process.env.PIN_REPORT) {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify({ tenantColors: TENANT_COLORS.size, observed }, null, 2));
    }
    const pinned = new Set(KNOWN_TENANT_LITERALS);
    expect(observed.filter((entry) => !pinned.has(entry))).toEqual([]);
  });

  it('the pinned inventory has no stale entry', () => {
    const observed = new Set(scan(files).map(key));
    expect(KNOWN_TENANT_LITERALS.filter((entry) => !observed.has(entry))).toEqual([]);
  });

  it('drill · a planted tenant hex in a copied Modern skin turns the floor red', () => {
    const donor = modernFiles.find((file) => file.endsWith('skin/card.css'));
    expect(donor).toBeDefined();

    const tmp = mkdtempSync(join(tmpdir(), 'ds-modern-tenant-drill-'));
    const planted = join(tmp, 'card.css');
    const rottayCanvas = rottayBrandTheme.palette!.darkBackgroundColor!;
    const bithirePrimary = bithireBrandTheme.palette!.primaryColor!;
    writeFileSync(
      planted,
      `${readFileSync(donor!, 'utf-8')}\n.ds-card-drill {\n  background: ${rottayCanvas};\n  border-color: ${bithirePrimary};\n}\n`
    );

    const found = scan([planted]).map((finding) => finding.value);
    expect(found).toContain(normalizeColor(rottayCanvas));
    expect(found).toContain(normalizeColor(bithirePrimary));

    // The undrilled donor is what green looks like, so the drill is measuring
    // the plant and not a pre-existing literal in the file it copied.
    expect(scan([donor!])).toEqual([]);
    rmSync(tmp, { recursive: true, force: true });
  });
});
