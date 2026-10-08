import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Strips CSS `/* ... *\/` block comments (replacing their content with spaces, so offsets/line
 * counts are unaffected) before CSS color-literal counting. JSDoc `@example` blocks on several
 * patterns (EnvironmentToggle, CalendarView, TenantPreview, Rate, ColorPicker) illustrate a
 * free-form `color`/`primaryColor` prop with a sample hex; that sample documents a prop SHAPE
 * for arbitrary consumer data, not a hardcoded engine chrome color, and a comment is never a
 * rendered color regardless. Script sources use the TypeScript-scanner-backed
 * `stripScriptComments` helper instead, so `//` inside strings and URLs remains data. */
function stripBlockComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

/** Recursively collect every `.css` file under a directory. */
function cssFilesUnder(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...cssFilesUnder(full));
    else if (full.endsWith('.css')) out.push(full);
  }
  return out;
}

/** NTSC perceived luminance (0-255) of a 6-digit hex color. */
function luminanceHex(hex) {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return r * 0.299 + g * 0.587 + b * 0.114;
}

/**
 * Extract `--name: value;` declarations from the unscoped `:root { ... }`
 * blocks of a CSS file (skips dark-mode/tenant/@media-nested `:root` overrides
 * so only the base scale is captured - a nested block reads as a DIFFERENT
 * selector, e.g. "@media (...) {" or "html.dark", never bare ":root").
 */
function rootScopedDeclarations(text) {
  const out = [];
  const declRe = /(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let i = 0;
  while (i < text.length) {
    if (text[i] === '{') {
      let depth = 1;
      let j = i + 1;
      while (j < text.length && depth > 0) {
        if (text[j] === '{') depth += 1;
        else if (text[j] === '}') depth -= 1;
        j += 1;
      }
      const content = text.slice(i + 1, j - 1);
      const prevClose = text.lastIndexOf('}', i - 1);
      const selStart = prevClose === -1 ? 0 : prevClose + 1;
      const selector = text
        .slice(selStart, i)
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .trim();
      if (selector === ':root') {
        for (const m of content.matchAll(declRe)) out.push([m[1], m[2].trim()]);
      }
      i = j;
    } else {
      i += 1;
    }
  }
  return out;
}

/** Given the index of an opening `{`, return the index just past its
 * matching `}` (brace-depth matching). */
function matchBrace(text, openIdx) {
  let depth = 1;
  let j = openIdx + 1;
  while (j < text.length && depth > 0) {
    if (text[j] === '{') depth += 1;
    else if (text[j] === '}') depth -= 1;
    j += 1;
  }
  return j;
}

/** Binary-searchable char-offset -> 1-based line-number index. */
function buildLineIndex(text) {
  const offsets = [0];
  for (let k = 0; k < text.length; k++) if (text[k] === '\n') offsets.push(k + 1);
  return (charIdx) => {
    let lo = 0,
      hi = offsets.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (offsets[mid] <= charIdx) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
}

/** Split `text[start, end)` into top-level CSS rules (selector text + body
 * offsets), via brace-depth matching -- generic enough to recurse into an
 * `@media` rule's body as its own set of top-level rules. */
function parseCssRules(text, start, end) {
  const rules = [];
  let selStart = start;
  let i = start;
  while (i < end) {
    if (text[i] === '{') {
      const rawSlice = text.slice(selStart, i);
      const selector = rawSlice.trim();
      // Report the offset of the selector text itself (skip the leading
      // whitespace/blanked-comment run between the previous rule's `}` and
      // this one), so line numbers point at the visible selector, not at
      // the gap/comment-banner before it.
      const leadingWs = rawSlice.length - rawSlice.trimStart().length;
      const trimmedStart = selStart + leadingWs;
      let depth = 1;
      let j = i + 1;
      while (j < end && depth > 0) {
        if (text[j] === '{') depth += 1;
        else if (text[j] === '}') depth -= 1;
        j += 1;
      }
      rules.push({
        selector,
        bodyStart: i + 1,
        bodyEnd: j - 1,
        selStart: trimmedStart,
        ruleEnd: j,
      });
      selStart = j;
      i = j;
    } else {
      i += 1;
    }
  }
  return rules;
}

export {
  stripBlockComments,
  cssFilesUnder,
  luminanceHex,
  rootScopedDeclarations,
  matchBrace,
  buildLineIndex,
  parseCssRules,
};
