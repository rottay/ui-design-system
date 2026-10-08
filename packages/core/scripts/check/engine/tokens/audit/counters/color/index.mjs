import { readFileSync } from 'node:fs';
import { stripScriptComments } from '../../../../../../libraries/comments/index.mjs';
import { componentRelOf, withSourceFixture } from '../../context/fixtures/index.mjs';
import { sparse } from '../../context/sparse/index.mjs';
import { stripBlockComments } from '../../parsing/index.mjs';

/**
 * Count hardcoded hex and rgba/rgb color literals across the color-purity file set (WO-ENG-06,
 * spec section 6: "Zero hardcoded colors in engine component files"). Counting method:
 *  - hex: `#` + 3, 4, 6, or 8 hex digits at a word boundary, EXCLUDING a `#` immediately
 *    preceded by `&` -- that is an HTML numeric character entity (`&#10003;` a checkmark,
 *    `&#171;`/`&#187;` guillemets, `&#9654;`/`&#9660;` triangles -- literal glyph content in a
 *    few components, never a color) and would otherwise false-positive (`&#10003;` reads as
 *    hex digits 1/0/0/0/3).
 *  - rgba: `rgb(` or `rgba(` as a literal function call.
 *  - Both are counted after stripBlockComments() removes comment content (see above).
 *  - NOT exempted -- counts as real, tracked residual: hex/rgba used as color-MATH
 *    inputs/outputs over arbitrary, non-token data. Two concrete cases, both left in place and
 *    documented in the WO-ENG-06 report rather than routed through a token:
 *      1. TenantPreview's mixColor()/hexToRgb()/getContrastColor() helpers interpolate a
 *         TENANT-SUPPLIED brand hex toward true white/black to derive a live preview palette,
 *         then display the literal computed hex in a tooltip (`title={`${step}: ${color}`}`) --
 *         the value must be a real hex string, and "true white"/"true black" are
 *         theme-invariant interpolation endpoints, not chrome that should shift with branding.
 *      2. ColorPicker's toRgbString() conversion and its native `<input type="color">`
 *         defaultValue -- the DOM color input's value attribute requires a literal `#rrggbb`
 *         string; `var(--ds-color-*)` is not a valid value there.
 *  - Data URIs are exempt implicitly: this codebase's modern-engine files contain none, so no
 *    special-case was needed, but a `data:` URI hex/rgba (e.g. inside an inlined SVG or base64
 *    image) would be a false positive the same way HTML entities are, not a real color.
 * Target: 0 / 0. Current documented residual: 13 hex (TenantPreview 12 + ColorPicker 1) + 1
 * rgba (ColorPicker) -- see the WO-ENG-06 report for the full per-file accounting.
 *
 * The scan itself lives in `countColorLiteralsInText()` (per-text, below), factored out so the
 * WO-GAT-02 `--coverage` report can reuse the EXACT same detection rule per file instead of
 * forking a second regex that could drift from this counter's definition of "a color literal".
 * Callers must pass text already run through `stripBlockComments()`.
 */
/**
 * Attributes whose value is text a user reads, not a colour a component paints.
 * A hex inside one of these is copy. WO-ENG-06 changed `placeholder="#000000"`
 * to `placeholder="#RRGGBB"` to lower this counter, which lowered the counter
 * and changed what the ColorPicker shows the user; its test had been red ever
 * since. A counter that cannot tell a style from a string will be paid in copy.
 */
const CONTENT_ATTRIBUTE_RE =
  /\b(?:placeholder|aria-label|aria-placeholder|title|alt)\s*=\s*(?:"[^"]*"|'[^']*'|\{`[^`]*`\})/g;

function countColorLiteralsInText(strippedText) {
  const withoutContentAttributes = strippedText.replace(CONTENT_ATTRIBUTE_RE, '');
  const hexRe = /(?<!&)#[0-9a-fA-F]{3,8}\b/g;
  // `rgb(${r}, ...)` is a CONSTRUCTOR serializing the user's own picked
  // channels (ColorPicker), not paint: a template interpolation right after
  // the paren is excluded, or this counter is structurally unable to reach 0.
  const rgbaRe = /\brgba?\((?!\$\{)/g;
  return {
    hex: (withoutContentAttributes.match(hexRe) || []).length,
    rgba: (withoutContentAttributes.match(rgbaRe) || []).length,
  };
}

/** Aggregate `countColorLiteralsInText()` across a file list -- see that function's doc for the
 * counting method. */
function countColorLiterals(files) {
  let hex = 0;
  let rgba = 0;
  for (const file of files) {
    const raw = readFileSync(file, 'utf8');
    const text = /\.(?:[cm]?[jt]sx?)$/i.test(file)
      ? stripScriptComments(raw, file)
      : stripBlockComments(raw);
    const perFile = countColorLiteralsInText(text);
    hex += perFile.hex;
    rgba += perFile.rgba;
  }
  return { hex, rgba };
}

/**
 * HARD-2: the colour-purity corpus widened from `engines/modern` to every
 * productive component source (classic/rustic/agnostic engines, patterns,
 * structures, surfaces). Same per-text rule as `color.modern*`; per-file keys
 * are hex+rgba combined, the two totals split them.
 */
function componentColorCounters(sourceFiles) {
  const out = {};
  const perPath = new Map();
  let hex = 0;
  let rgba = 0;
  for (const file of withSourceFixture(sourceFiles)) {
    const perFile = countColorLiterals([file]);
    hex += perFile.hex;
    rgba += perFile.rgba;
    const key = `color.componentLiterals.${componentRelOf(file)}`;
    perPath.set(key, (perPath.get(key) ?? 0) + perFile.hex + perFile.rgba);
  }
  for (const [key, count] of perPath) sparse(out, key, count);
  out['color.componentHexLiterals'] = hex;
  out['color.componentRgbaLiterals'] = rgba;
  return out;
}

export {
  countColorLiteralsInText,
  countColorLiterals,
  componentColorCounters,
};
