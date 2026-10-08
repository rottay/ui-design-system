import { existsSync, readFileSync } from 'node:fs';
import { stripScriptComments } from '../../../../../../libraries/comments/index.mjs';
import { frameworkBridgeCssPath, themeCssPath } from '../../context/paths/index.mjs';
import { buildLineIndex, matchBrace, parseCssRules, stripBlockComments } from '../../parsing/index.mjs';

/* ============================================================================
   theme.css drain gate (WO-ENG-08, spec section 8): every remaining selector
   in modern/theme.css must be proven-consumed by a real modern-engine class
   render, or it is dead DaisyUI-mapping weight the drain must remove.
   ============================================================================ */


/** Split already-unwrapped string content on whitespace and add every
 * class-shaped token to `set`. */
function addTokensFromContent(content, set) {
  for (const tok of content.split(/\s+/)) {
    if (/^[A-Za-z][A-Za-z0-9_-]*$/.test(tok)) set.add(tok);
  }
}

/**
 * Extract class-name-shaped tokens out of every quoted string ("...", '...')
 * and template-literal static segment (`...`, with `${...}` interpolations
 * blanked out) found WITHIN `text`, adding each to `set`. `text` must be raw
 * source text that still contains the quote/backtick delimiters (e.g. a
 * `className={...}` expression body) -- for content that has ALREADY been
 * unwrapped from its quotes (e.g. a regex capture group), call
 * `addTokensFromContent` directly instead, or this finds nothing (there are
 * no quote characters left to match).
 */
function extractClassTokens(text, set) {
  const stringRe = /"([^"\n]*)"|'([^'\n]*)'/g;
  for (const m of text.matchAll(stringRe)) {
    addTokensFromContent(m[1] !== undefined ? m[1] : m[2], set);
  }
  const templateRe = /`([^`]*)`/g;
  for (const m of text.matchAll(templateRe)) {
    addTokensFromContent(m[1].replace(/\$\{[^}]*\}/g, ' '), set);
  }
}

/**
 * Resolve a same-file `const/let/var NAME = <RHS>;` (optionally with a `:
 * Type` annotation between the name and `=`) to its RHS source text, via a
 * balanced `(){}[]`-depth scan out to the terminating top-level `;`. Used to
 * follow a bare `className={someLocal}` identifier back to its definition
 * (e.g. Avatar's `const containerClass = \`avatar ${status ? 'online' : ''}
 * ${className}\`;`, referenced later as `className={containerClass}` --
 * one hop, no `.join(` involved, so the join-block scan alone would miss
 * it). Returns null if no such same-file declaration exists.
 */
function findVarRHS(text, name) {
  const re = new RegExp(`\\b(?:const|let|var)\\s+${name}\\b\\s*(?::[^=;]+)?=\\s*`, 'g');
  const m = re.exec(text);
  if (!m) return null;
  let k = re.lastIndex;
  let depth = 0;
  while (k < text.length) {
    const c = text[k];
    if (c === '(' || c === '[' || c === '{') depth += 1;
    else if (c === ')' || c === ']' || c === '}') {
      if (depth === 0) break;
      depth -= 1;
    } else if (c === ';' && depth === 0) break;
    k += 1;
  }
  return text.slice(re.lastIndex, k);
}

/**
 * Resolve a same-file `function NAME(...) { ... }` to its body source text.
 * The `const/let/var` resolver above cannot see a function declaration, and a
 * `className={getFloatButtonClassName(className)}` site reaches its class
 * list only through one. Returns null when no such declaration exists.
 */
function findFunctionBody(text, name) {
  const re = new RegExp(`\\bfunction\\s+${name}\\b`, 'g');
  const m = re.exec(text);
  if (!m) return null;
  const openIdx = text.indexOf('{', re.lastIndex);
  if (openIdx === -1) return null;
  const endIdx = matchBrace(text, openIdx);
  return text.slice(openIdx + 1, endIdx - 1);
}

/**
 * The class tokens every modern-engine component
 * (`engines/modern/index.tsx`) actually renders -- the theme.css gate's ground
 * truth for "has a consumer." Scoped extraction, NOT a whole-file string
 * scan: an earlier whole-file version measurably leaked non-class prose
 * into the consumed set (a `// ... "completed" ...` line comment in
 * Stepper, and the UI status string `'File selected'` in FormBuilder both
 * produced clean-looking but bogus class tokens -- "completed" and
 * "selected" -- that then falsely "proved" a consumer for otherwise-dead
 * theme.css selectors). Four scoped passes per file instead:
 *  1. `className="..."` / `className='...'` (also bare `class=`) -- direct
 *     literal.
 *  2. `className={...}` / `class={...}` (balanced-brace-scanned) -- covers
 *     ternaries and inline arrays written directly in the JSX attribute.
 *  3. Every bare identifier referenced inside one of those `{...}`
 *     expressions is resolved against its same-file declaration -- a
 *     `const/let/var` initializer (`findVarRHS`) or a `function NAME(...)
 *     {...}` body (`findFunctionBody`) -- and the resolved text is scanned
 *     the same way, to a bounded depth. That covers a local built earlier in
 *     the component (Avatar's `const containerClass = \`avatar ${status ?
 *     'online' : ''} ${className}\`;`, later `className={containerClass}`)
 *     AND the `[...].filter(Boolean).join(' ')` idiom inside a helper several
 *     hops away (FloatButton's `getFloatButtonClassName()`).
 *
 * WHY THERE IS NO FILE-WIDE PASS. An earlier version also scanned the
 * smallest enclosing `{...}` block around EVERY `.join(` call in the file,
 * whether or not that block was reachable from a `className`. That is how the
 * gate certified the opposite of what it measures: FloatButton's
 * `getFloatButtonClassName` documents the DaisyUI DRAIN in a `//` comment that
 * names `btn`, `btn-primary`, `btn-ghost`; the comment sits inside the block
 * the join scan picked up, so ten dead `.btn*` rules in `modern/theme.css`
 * read as consumed and `themeCss.unreferencedSelectors` was 0 next to
 * `daisy.classConsumers: 0`. Both halves are closed here: comments are
 * removed by the TypeScript-scanner-backed `stripScriptComments` (the
 * offset-preserving stripper this file already uses elsewhere) instead of the
 * block-comment-only `stripBlockComments`, and every remaining reader starts
 * at a `className`/`class` expression.
 */
/** JS literals/keywords that can appear as a bare identifier inside a
 * `className={...}` expression but are never a same-file variable
 * declaration worth resolving. */
const JS_KEYWORDS = new Set(['true', 'false', 'null', 'undefined', 'this', 'typeof', 'void']);

/** How many declaration hops a `className` expression is followed through.
 * Two is what the corpus needs: `className={getX()}` -> the helper body ->
 * the chained locals that body composes. Unbounded following would walk back
 * into unrelated module text and reintroduce the leak this scoping removes. */
const CLASS_RESOLUTION_DEPTH = 2;

function buildConsumedClassSet(files) {
  const consumed = new Set();
  for (const file of files) {
    const text = stripScriptComments(readFileSync(file, 'utf8'), file);

    const attrStringRe = /class(?:Name)?\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
    for (const m of text.matchAll(attrStringRe)) {
      addTokensFromContent(m[1] !== undefined ? m[1] : m[2], consumed);
    }

    const resolvedDeclarations = new Set();
    const scanExpression = (exprText, depth) => {
      extractClassTokens(exprText, consumed);
      if (depth === 0) return;
      const seenIdents = new Set();
      for (const im of exprText.matchAll(/[A-Za-z_$][\w$]*/g)) {
        const ident = im[0];
        if (JS_KEYWORDS.has(ident) || seenIdents.has(ident)) continue;
        seenIdents.add(ident);
        if (resolvedDeclarations.has(ident)) continue;
        const declaration = findVarRHS(text, ident) ?? findFunctionBody(text, ident);
        if (!declaration) continue;
        resolvedDeclarations.add(ident);
        scanExpression(declaration, depth - 1);
      }
    };

    const attrBraceRe = /class(?:Name)?\s*=\s*\{/g;
    let am;
    while ((am = attrBraceRe.exec(text))) {
      const openIdx = attrBraceRe.lastIndex - 1;
      const endIdx = matchBrace(text, openIdx);
      scanExpression(text.slice(openIdx + 1, endIdx - 1), CLASS_RESOLUTION_DEPTH);
    }
  }
  return consumed;
}

/**
 * Generic UI state/status words that are real, common CSS class MODIFIERS
 * (DaisyUI and this codebase both use bare `.active`/`.disabled` as state
 * hooks) but are ALSO common non-class prose: status enums (`status ===
 * 'error'`), UI copy ("File selected"), aria attribute values, etc. Proven
 * leak sources (WO-ENG-08 investigation): "completed" only ever appears
 * inside a `//` line comment in Stepper (never stripped -- matches this
 * script's existing stripBlockComments convention of not touching `//`,
 * see its module doc), and "selected" only ever appears inside the UI
 * string `'File selected'` in FormBuilder -- neither is a class anywhere.
 * "active"/"disabled" ARE genuinely rendered as bare classes elsewhere
 * (AutoComplete, Mentions, Cascader, Dropdown, file-manager), so they
 * correctly belong in the consumed set -- the risk isn't that these words
 * are never real, it's that a GLOBAL consumed-set means "active" being
 * real for Menu/Tabs can wrongly "prove" a consumer for an unrelated dead
 * selector like `.calendar-day.active` that merely happens to share the
 * modifier. Selector classification below only lets one of these words
 * stand in for a whole compound selector when there is no more specific
 * sibling class token to check instead -- it never removes a word from the
 * consumed set itself, so a selector whose ONLY class token is one of
 * these (e.g. a hypothetical bare `.active { ... }`) is still evaluated
 * fairly via the fallback branch.
 */
const GENERIC_MODIFIER_TOKENS = new Set([
  'active',
  'disabled',
  'selected',
  'completed',
  'error',
  'success',
  'warning',
  'info',
  'checked',
  'open',
  'closed',
  'expanded',
  'collapsed',
  'hidden',
  'visible',
  'loading',
  'focused',
  'hovered',
  'pressed',
  'empty',
]);

/** Every `.class` token referenced anywhere in a (possibly comma-separated)
 * selector, ignoring combinators, elements, pseudo-classes, and attribute
 * selectors (e.g. `label.input input, [data-tenant] .avatar.placeholder >
 * div` yields `["input", "avatar", "placeholder"]`). */
function selectorClassTokens(selector) {
  return [...selector.matchAll(/\.([A-Za-z_-][A-Za-z0-9_-]*)/g)].map((m) => m[1]);
}

/**
 * Walk an engine theme.css file (`themeFile`) and classify every selector as:
 *  - exempt (the bare `[data-tenant]` engine-token root block, `@keyframes`,
 *    or any selector with NO class token at all -- a pure element/attribute
 *    hook like `[data-tenant] select` / `input[type="color"]` / classic's
 *    `html[data-tenant]` root scope, which is not a "class hook" this gate
 *    drains and is proven-consumed separately by direct source inspection,
 *    not by this mechanical counter)
 *  - allowlisted (WO-GAT-02: every class token on the selector starts with one of
 *    `opts.allowlistPrefixes`. For classic this is `["ant-", "anticon", "slick-"]` -- NOT just
 *    `.ant-*`: investigation while measuring the baseline found classic/theme.css also targets
 *    `.anticon` (Ant Design's icon-font class -- no hyphen after "ant", so it needs its own
 *    prefix entry, not just "ant-") and `.slick-*` (react-slick, the carousel library antd's
 *    `Carousel` wraps internally). All three are rendered by antd (or its vendored
 *    dependencies) at runtime and never appear literally in DS `className`/`class` output, so
 *    the consumed-class heuristic below can neither prove nor disprove them -- they are
 *    tallied separately in `allowlisted` and NEVER reported dead. A first pass allowlisting
 *    only "ant-" measured 29 "dead" selectors for classic; 18 of those were actually `anticon`/
 *    `slick-*` compound selectors (e.g. `.ant-carousel .slick-dots li.slick-active button`) --
 *    alive via antd, not dead -- which is why the prefix list is broadened here instead of left
 *    as a single string.)
 *  - referenced (>= 1 class token appears in the consumed-class set)
 *  - unreferenced (every class token is absent from the consumed-class set)
 * `@media` bodies are recursed into so each nested selector is judged on its
 * own rather than the whole media query being treated as one opaque unit.
 *
 * Generalized (WO-GAT-02) from the modern-only `auditThemeCss()` below (WO-ENG-08's original
 * scan target) -- this is the ONE shared selector-scan implementation for all three engines;
 * never fork a second one. `consumerFiles` is that engine's own component file set (see
 * `collectEngineFiles`), so "consumed" always means "rendered by THIS engine's source", never
 * a different engine's.
 */
function auditEngineTheme(themeFile, consumerFiles, opts = {}) {
  const allowlistPrefixes = opts.allowlistPrefixes ?? [];
  if (!existsSync(themeFile)) {
    return {
      lineCount: 0,
      unreferencedSelectors: 0,
      unreferenced: [],
      consumedSize: 0,
      allowlisted: 0,
    };
  }
  const raw = readFileSync(themeFile, 'utf8');
  const lineCount = (raw.match(/\n/g) || []).length;
  const stripped = stripBlockComments(raw);
  const lineOf = buildLineIndex(raw);
  const consumed = buildConsumedClassSet(consumerFiles);

  const unreferenced = [];
  const referencedDebug = [];
  let unreferencedCount = 0;
  let allowlistedCount = 0;

  function walk(start, end) {
    for (const rule of parseCssRules(stripped, start, end)) {
      if (!rule.selector) continue;
      if (rule.selector === '[data-tenant]') continue; // root engine-token block (modern)
      if (/^@keyframes\b/.test(rule.selector)) continue; // opaque, exempt
      if (/^@media\b/.test(rule.selector)) {
        walk(rule.bodyStart, rule.bodyEnd);
        continue;
      }
      const tokens = rule.selector.split(',').flatMap((part) => selectorClassTokens(part));
      if (tokens.length === 0) continue; // pure element/attribute hook (e.g. classic's `html[data-tenant]` root), not a class selector
      if (allowlistPrefixes.length > 0 && tokens.every((t) => allowlistPrefixes.some((p) => t.startsWith(p)))) {
        allowlistedCount += 1; // e.g. classic's ant-/anticon/slick- families -- externally consumed, never dead
        continue;
      }
      // Prefer specific (non-generic-modifier) tokens when the selector has
      // any: a generic word riding along with a dead anchor class (e.g.
      // `.calendar-day.selected` when `.calendar-day` itself is unreferenced
      // everywhere else) should not alone prove a consumer. Falls back to
      // the full token set when EVERY token is a generic modifier, so a
      // selector with no specific anchor at all is still judged fairly.
      const specific = tokens.filter((t) => !GENERIC_MODIFIER_TOKENS.has(t));
      const checkSet = specific.length > 0 ? specific : tokens;
      const matched = checkSet.filter((t) => consumed.has(t));
      // EVERY specific token must be live, not merely one of them. `.join .btn`
      // read as referenced because `btn` is rendered elsewhere while no component
      // renders `join` at all; `.toast .alert-success` read as referenced because
      // `toast` is live via Notification and Message while `alert-success` is
      // rendered by nobody. A compound selector only matches when all of its
      // parts do, so a counter that accepts one of them is measuring a different
      // question than the one it is named after.
      if (matched.length < checkSet.length) {
        unreferencedCount += 1;
        unreferenced.push({
          selector: rule.selector,
          line: lineOf(rule.selStart),
        });
      } else if (process.env.DEBUG_REFERENCED) {
        referencedDebug.push({
          selector: rule.selector,
          line: lineOf(rule.selStart),
          matched,
        });
      }
    }
  }
  walk(0, stripped.length);
  if (process.env.DEBUG_UNREFERENCED) {
    for (const r of unreferenced) console.log(`${themeFile}:${r.line}  ${r.selector}`);
  }
  if (process.env.DEBUG_REFERENCED) {
    console.log(`\n--- DEBUG referenced (${referencedDebug.length}) in ${themeFile} ---`);
    for (const r of referencedDebug) {
      console.log(`  line ${r.line}: ${r.selector.replace(/\s+/g, ' ')}  <-- [${r.matched.join(', ')}]`);
    }
  }

  return {
    lineCount,
    unreferencedSelectors: unreferencedCount,
    unreferenced,
    consumedSize: consumed.size,
    allowlisted: allowlistedCount,
  };
}

/** Modern-engine caller of `auditEngineTheme()` (WO-ENG-08's original scan target). Kept as a
 * named function so the existing call site/output shape below is unchanged. `lineCount` also
 * weighs the framework bridge, whose utilities only app renders consume (a size ratchet). */
function auditThemeCss(files) {
  const theme = auditEngineTheme(themeCssPath, files);
  const bridgeLines = existsSync(frameworkBridgeCssPath)
    ? (readFileSync(frameworkBridgeCssPath, 'utf8').match(/\n/g) || []).length
    : 0;
  return { ...theme, lineCount: theme.lineCount + bridgeLines };
}

export {
  auditEngineTheme,
  auditThemeCss,
};
