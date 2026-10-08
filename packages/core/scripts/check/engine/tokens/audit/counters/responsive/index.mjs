import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, sep } from 'node:path';
import postcss from 'postcss';
import { packageRoot as findPackageRoot } from '../../../../../../libraries/repo-root/index.mjs';
import { auditDir, root } from '../../context/paths/index.mjs';

// ---------------------------------------------------------------------------
// WO-ENG-12 — responsive counters (spec section 13)
// ---------------------------------------------------------------------------

/**
 * The content box a 360px viewport actually offers: 360 minus the capture
 * route's page padding (2 x 24) and card padding (2 x 16), minus the card
 * borders. A `width`/`min-width` literal at or above this cannot fit on a
 * phone no matter what its ancestors do — it is a horizontal-overflow source
 * by arithmetic, not by taste.
 *
 * The threshold is deliberately NOT a smaller, rounder number. A control-sized
 * literal (a 48px table checkbox column, a 32px close button, a 20px chevron)
 * fits a phone and is not a responsive defect; counting it would bury the real
 * defect class in noise and invite the counter to be gamed rather than fixed.
 */
const RESPONSIVE_WIDTH_THRESHOLD_PX = 278;

/**
 * Literals exempt from the counter, each with the reason it cannot overflow.
 * Keyed by `<path from src/>:<px>` — every modern skin file is named
 * `modern.tsx`, so a basename key would silently exempt unrelated components.
 *
 * The only sanctioned reason is the one below: a panel rendered in a portal and
 * anchored to the VIEWPORT is bounded by 360px, not by the 278px content box, so
 * a width under 360 fits a phone. An exemption is a claim a reviewer can check —
 * never add one to silence an in-flow fixed width; make that width intrinsic.
 */
const FIXED_WIDTH_EXEMPTIONS = new Set([
  // Popover content: portaled, viewport-anchored, 300 < 360.
  'src/components/patterns/data/list-toolbar/engines/modern/index.tsx:300',
  // Hover overlay: portaled, viewport-anchored, 288 < 360.
  'src/components/primitives/overlay/HoverCard/engines/modern/index.tsx:288',
  // Calendar panel: portaled, viewport-anchored, 288 < 360.
  'src/components/primitives/inputs/DatePicker/engines/modern/index.tsx:288',
]);

/**
 * Fixed-width literals across the modern skin files and the modern engine
 * theme.css. `max-width` is never counted: it is an upper bound, which is the
 * fix, not the defect. Decrease-only; target 0 above the allowlist.
 */
function countFixedWidthLiterals(skinFiles, modernThemeCss) {
  let count = 0;

  const tally = (file, value) => {
    if (value < RESPONSIVE_WIDTH_THRESHOLD_PX) return;
    const fromSrc = file.slice(file.indexOf(`${sep}src${sep}`) + 1);
    if (FIXED_WIDTH_EXEMPTIONS.has(`${fromSrc}:${value}`)) return;
    count += 1;
  };

  // Inline styles: `width: '180px'` / `minWidth: 180` (the numeric form is px in React).
  const inlineQuoted = /\b(?:minWidth|width)\s*:\s*(['"])(\d+)px\1/g;
  const inlineNumeric = /\b(?:minWidth|width)\s*:\s*(\d+)\s*[,}]/g;
  for (const file of skinFiles) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(inlineQuoted)) tally(file, Number(match[2]));
    for (const match of source.matchAll(inlineNumeric)) tally(file, Number(match[1]));
  }

  // Stylesheet declarations: `width: 180px` / `min-width: 180px`.
  if (existsSync(modernThemeCss)) {
    const css = readFileSync(modernThemeCss, 'utf8');
    for (const match of css.matchAll(/(?:^|[\s;{])(?:min-)?width\s*:\s*(\d+)px/gm)) {
      tally(modernThemeCss, Number(match[1]));
    }
  }

  return count;
}

/**
 * Capture cells (component x tenant palette) that still overflow a 360px
 * viewport, read from the probe baseline the showroom responsive spec owns
 * (`e2e/responsive/overflow-baseline.json`). The browser probe measures;
 * this counter is what makes the measurement a blocking, decrease-only ratchet
 * in the same place as every other section-12 number. A missing file counts 0 —
 * the spec bootstraps it on first run.
 */
function countResponsiveOverflowCells() {
  const baselineFile = join(findPackageRoot(auditDir), '../showroom/e2e/responsive/overflow-baseline.json');
  if (!existsSync(baselineFile)) {
    // Never return 0 for a missing file: a vacuous zero would report a green
    // ratchet for a gate that is not wired at all.
    throw new Error(`responsive overflow baseline missing at ${baselineFile}`);
  }
  const parsed = JSON.parse(readFileSync(baselineFile, 'utf8'));
  return Array.isArray(parsed.overflowing) ? parsed.overflowing.length : 0;
}

/**
 * WO-ARC-05: viewport media queries inside the engine SKIN stylesheets.
 *
 * A design system renders the same component at rail width, half width and full
 * width inside one viewport. A viewport media query cannot tell those apart, so
 * `@container` is the sanctioned mechanism for a skin that must adapt to its box.
 * This counts only width-conditioned `@media` rules -- `prefers-reduced-motion`,
 * `pointer: coarse` and `prefers-color-scheme` are answers to the user and the
 * device, not to a box, and they are not what this gate is about.
 *
 * Decrease-only. Baseline measured at 0: the two skins that exist adapt through
 * their tokens and their anatomy, not through a breakpoint.
 */

function countViewportMediaQueriesInSkins() {
  const skins = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.css') && full.includes(`${sep}skin${sep}`)) skins.push(full);
    }
  };
  walk(join(root, 'src/foundation/tokens/css/runtime/engines'));
  // WO-ARC-09: the engine-agnostic skin home for structures + shared files.
  walk(join(root, 'src/foundation/tokens/css/presentation/components/skin'));

  let count = 0;
  for (const file of skins) {
    const css = readFileSync(file, 'utf8');
    const root = postcss.parse(css, { from: file });
    root.walkAtRules('media', (rule) => {
      if (/\b(min-width|max-width|width)\b/.test(rule.params)) count += 1;
    });
  }
  return count;
}

export {
  countFixedWidthLiterals,
  countResponsiveOverflowCells,
  countViewportMediaQueriesInSkins,
};
