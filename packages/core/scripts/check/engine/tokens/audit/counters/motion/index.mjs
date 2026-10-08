import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { stripScriptComments } from '../../../../../../libraries/comments/index.mjs';
import { countMotionRecipeConsumers } from '../../../../../../libraries/engine/consumers/motion-recipes/index.mjs';
import { componentsDir } from '../../context/paths/index.mjs';
import { matchBrace, stripBlockComments } from '../../parsing/index.mjs';

/** The motion token names components consume that the canon must define (else they resolve to fallbacks). */
const ORPHAN_MOTION_NAMES = [
  '--ds-motion-duration-fast',
  '--ds-motion-duration-slow',
  '--ds-motion-base',
  '--ds-motion-gentle',
  '--ds-motion-easing-ease-in-out',
];

/**
 * Per-text motion-literal scan (cubic-bezier + raw interaction durations), factored out of
 * `countMotionLiterals()` so the WO-GAT-02 `--coverage` report can reuse the EXACT same
 * detection rules per file instead of forking a second regex set (see
 * `countColorLiteralsInText` above for the same rationale).
 */
function countMotionLiteralsInText(text, fileName = 'source.tsx') {
  const source = /\.(?:[cm]?[jt]sx?)$/i.test(fileName)
    ? stripScriptComments(text, fileName)
    : stripBlockComments(text);
  let cubicBezier = 0;
  let rawDuration = 0;
  const cubicRe = /cubic-bezier\(/g;
  // Forbidden = INTERACTION-motion literals (< 1s). Milliseconds are always interaction
  // durations; seconds are counted only when < 1s. Durations >= 1s are loop/shimmer/spinner
  // tempos that legitimately sit outside the 120/200/320 canon and are allowlisted.
  const msRe = /\b\d+(?:\.\d+)?ms\b/g;
  const sRe = /(?<![\w.])(\d*\.?\d+)s(?![\w])/g;
  cubicBezier += (source.match(cubicRe) || []).length;
  rawDuration += (source.match(msRe) || []).length;
  for (const m of source.matchAll(sRe)) {
    if (Number(m[1]) < 1) rawDuration += 1; // sub-second seconds are interaction durations
  }
  return { cubicBezier, rawDuration };
}

function countMotionLiterals(files) {
  let cubicBezier = 0;
  let rawDuration = 0;
  let orphanTokens = 0;
  const orphanRe = new RegExp(ORPHAN_MOTION_NAMES.map((n) => n.replace(/[-]/g, '\\-')).join('|'), 'g');
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const perFile = countMotionLiteralsInText(text, file);
    cubicBezier += perFile.cubicBezier;
    rawDuration += perFile.rawDuration;
    orphanTokens += (text.match(orphanRe) || []).length;
  }
  return { cubicBezier, rawDuration, orphanTokens };
}

/**
 * Count DISTINCT src/components components consuming the motion recipe canon
 * (WO-CRA-15): a production TS/TSX file calling `useMotionRecipe*(...)`. A
 * component's several engine files collapse to one owner, so the MIN floor
 * reads "at least N components", never "at least N files". Like the effect
 * floors, this is a wiring signal, not proof the motion renders; the
 * reduced-motion unit contracts and visual specs own that.
 */
function countRecipeConsumers() {
  const sourceFiles = [];
  function walk(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const rel = full.replace(/\\/g, '/');
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.tsx?$/.test(full)) continue;
      if (/__tests__|\.(test|spec|stories)\./.test(rel)) continue;
      sourceFiles.push(full);
    }
  }
  walk(componentsDir);
  return countMotionRecipeConsumers({ sourceFiles, componentsDir });
}

/* ============================================================================
   Compositor-only motion gate (WO-CRA-06, choreography layer, spec section 2
   "animate transform/opacity only"): flags `transition`/`animation` targeting
   a layout property (top, left, width, height, margin, padding, and their
   -top/-right/-bottom/-left edges) in modern-engine component source.
   Reflow-triggering properties are the opposite of what makes CSS motion
   cheap; `transform`/`opacity` are compositor-only and belong on every
   animated node instead. Two shapes are scanned, both narrowly:
    - inline `transition`/`transitionProperty` string values naming the
      property as the first token of a (possibly comma-separated) segment
      -- the CSS transition shorthand's own grammar (`<property> <duration>
      <easing> ...`), so a duration/easing token that merely CONTAINS one of
      these words never matches.
    - `@keyframes` block bodies (this codebase's established inline
      `<style>` template-literal pattern -- see Modal/Drawer/Toast/Dropdown/
      ContextMenu) whose steps declare the property.
   Does NOT trace an `animation-name` reference to a keyframe defined in a
   SEPARATE file (e.g. the shared foundation keyframes.css/transitions.css):
   every keyframe in those two foundation files was verified compositor-only
   by hand when this counter was introduced (WO-CRA-06); a modern-engine
   file's OWN inline `@keyframes` block is what this counter watches going
   forward. One count per defect SITE (a transition declaration or a
   keyframes block), not per property token within it. Decrease-only
   ratchet; target 0 in any file a future WO's own remit touches.
   ============================================================================ */

const LAYOUT_PROPERTY_TOKENS_KEBAB = [
  'top',
  'left',
  'width',
  'height',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
];

/** Same token set, camelCase (JS inline-style property names). */
const LAYOUT_PROPERTY_TOKENS_CAMEL = [
  'top',
  'left',
  'width',
  'height',
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
];

/** Count `@keyframes NAME { ... }` block bodies in `text` that declare one of LAYOUT_PROPERTY_TOKENS_KEBAB. */
function countLayoutPropertyKeyframes(text) {
  let count = 0;
  const kfRe = /@keyframes\s+[\w-]+\s*\{/g;
  const propRe = new RegExp(`(?:^|[\\s;{])(?:${LAYOUT_PROPERTY_TOKENS_KEBAB.join('|')})\\s*:`, 'i');
  let m;
  while ((m = kfRe.exec(text))) {
    const bodyStart = kfRe.lastIndex; // just past the opening `{`
    const bodyEnd = matchBrace(text, bodyStart - 1);
    const body = text.slice(bodyStart, bodyEnd - 1);
    if (propRe.test(body)) count += 1;
    kfRe.lastIndex = bodyEnd;
  }
  return count;
}

/**
 * Count `transition`/`transitionProperty` inline-style STRING VALUES in
 * `text` that name one of LAYOUT_PROPERTY_TOKENS_CAMEL as the transitioned
 * property (the first whitespace-separated token of a comma-separated
 * segment -- the CSS transition shorthand's own grammar, or the whole
 * segment for `transitionProperty`'s bare property list).
 */
function countLayoutPropertyTransitions(text) {
  let count = 0;
  const transRe = /transition(?:Property)?\s*:\s*(['"`])((?:(?!\1)[\s\S])*)\1/g;
  let m;
  while ((m = transRe.exec(text))) {
    const segments = m[2].split(',');
    for (const seg of segments) {
      const firstToken = seg.trim().split(/\s+/)[0] || '';
      if (LAYOUT_PROPERTY_TOKENS_CAMEL.includes(firstToken)) {
        count += 1;
        break; // one count per transition declaration, not per segment
      }
    }
  }
  return count;
}

/** Aggregate both shapes across a file list. See module doc above this section. */
function countCompositorOnlyViolations(fileList) {
  let count = 0;
  for (const file of fileList) {
    const text = readFileSync(file, 'utf8');
    count += countLayoutPropertyKeyframes(text) + countLayoutPropertyTransitions(text);
  }
  return count;
}

export {
  countMotionLiteralsInText,
  countMotionLiterals,
  countRecipeConsumers,
  countCompositorOnlyViolations,
};
