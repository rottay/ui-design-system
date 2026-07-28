/**
 * Independent measurement of custom-property overlap between the
 * compiled-from-BrandTheme block of each first-party vertical artifact and its
 * hand-authored _source/extension.css.
 *
 * READ-ONLY. Reads only the frozen snapshots under ../snapshots and writes only
 * JSON into the audit directory. postcss is require()'d from the repo's own
 * node_modules by absolute path; nothing in the repo is modified.
 *
 *   node scripts/extract-declarations.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const postcss = require('/Users/daniel/Developer/Rottay/ui-design-system/packages/core/node_modules/postcss');
const POSTCSS_VERSION = require('/Users/daniel/Developer/Rottay/ui-design-system/packages/core/node_modules/postcss/package.json').version;

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUDIT_ROOT = resolve(__dirname, '..');
const SNAP = resolve(AUDIT_ROOT, 'snapshots');

const VERTICALS = [
  { slug: 'bithire', verticalKey: 'bithire' },
  { slug: 'evnto', verticalKey: 'evnto' },
  { slug: 'rottay', verticalKey: 'platform' },
];

const COMPILED_MARKER = '/* === Compiled from BrandTheme via compileBrandTheme — do not edit === */';
const EXTENSION_MARKER = '/* === Declared artifact extension (authored source, mechanically scoped) === */';

const sha256 = (s) => createHash('sha256').update(s, 'utf-8').digest('hex');

/* Optional strongest-form correspondence: re-render the artifact from dist and
 * byte-compare. Read-only import; failure degrades to null, never to a pass. */
const DIST = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core/dist';
let reproduction = null;
try {
  const { compileBrandTheme } = await import(`${DIST}/infrastructure/compilers/kernel/runtime/brand-theme/index.js`);
  const rendererMod = await import(`${DIST}/infrastructure/compilers/runtime/tenant-css/artifact-renderer/index.js`);
  const themes = {
    bithire: (await import(`${DIST}/foundation/tokens/ts/presentation/brand-themes/bithire/index.js`)).bithireBrandTheme,
    evnto: (await import(`${DIST}/foundation/tokens/ts/presentation/brand-themes/evnto/index.js`)).evntoBrandTheme,
    rottay: (await import(`${DIST}/foundation/tokens/ts/presentation/brand-themes/platform/index.js`)).rottayBrandTheme,
  };
  reproduction = { compileBrandTheme, rendererMod, themes };
} catch (error) {
  reproduction = { error: String(error && error.message ? error.message : error) };
}

/* ------------------------------------------------------------------ *
 * Port of projectFirstPartyArtifactScopes (scope-projection/index.ts) *
 * ------------------------------------------------------------------ */

const isWs = (c) => c === ' ' || c === '\n' || c === '\r' || c === '\t' || c === '\f';
const isTypeBoundary = (c) =>
  c === undefined || isWs(c) || c === ',' || c === '>' || c === '+' || c === '~' || c === '(';

function skipComment(src, start) {
  const close = src.indexOf('*/', start + 2);
  return close === -1 ? src.length : close + 2;
}
function skipString(src, start) {
  const quote = src[start];
  let i = start + 1;
  while (i < src.length) {
    if (src[i] === '\\') { i += 2; continue; }
    if (src[i] === quote) return i + 1;
    i += 1;
  }
  return src.length;
}
function skipAttrTrivia(src, start) {
  let i = start;
  while (i < src.length) {
    if (isWs(src[i])) { i += 1; continue; }
    if (src[i] === '/' && src[i + 1] === '*') { i = skipComment(src, i); continue; }
    break;
  }
  return i;
}
function matchOwnedTenantSelector(sel, start, slug) {
  if (!isTypeBoundary(sel[start - 1])) return undefined;
  if (!sel.startsWith('html[', start)) return undefined;
  let i = skipAttrTrivia(sel, start + 5);
  if (!sel.startsWith('data-tenant', i)) return undefined;
  i += 'data-tenant'.length;
  const after = sel[i];
  if (!isWs(after) && after !== '=' && !(after === '/' && sel[i + 1] === '*')) return undefined;
  i = skipAttrTrivia(sel, i);
  if (sel[i] !== '=') return undefined;
  i = skipAttrTrivia(sel, i + 1);
  let value = '';
  const q = sel[i];
  if (q === "'" || q === '"') {
    const vs = i + 1;
    const ve = skipString(sel, i) - 1;
    if (ve < vs || sel[ve] !== q) return undefined;
    value = sel.slice(vs, ve);
    i = ve + 1;
  } else {
    const vs = i;
    while (i < sel.length && !isWs(sel[i]) && sel[i] !== ']' && !(sel[i] === '/' && sel[i + 1] === '*')) i += 1;
    value = sel.slice(vs, i);
  }
  if (value !== slug) return undefined;
  i = skipAttrTrivia(sel, i);
  if (sel[i] !== ']') return undefined;
  return { end: i + 1, source: sel.slice(start, i + 1) };
}
function projectSelectorPrelude(prelude, slug, verticalKey) {
  const providerRoot = `:where([data-ds-root][data-vertical='${verticalKey}'])`;
  const chunks = [];
  let copyFrom = 0;
  let i = 0;
  while (i < prelude.length) {
    if (prelude[i] === '/' && prelude[i + 1] === '*') { i = skipComment(prelude, i); continue; }
    if (prelude[i] === "'" || prelude[i] === '"') { i = skipString(prelude, i); continue; }
    const m = prelude[i] === 'h' ? matchOwnedTenantSelector(prelude, i, slug) : undefined;
    if (!m) { i += 1; continue; }
    chunks.push(prelude.slice(copyFrom, i));
    chunks.push(`:is(${m.source}, ${providerRoot})`);
    i = m.end;
    copyFrom = i;
  }
  if (chunks.length === 0) return prelude;
  chunks.push(prelude.slice(copyFrom));
  return chunks.join('');
}
function firstSignificant(src) {
  let i = 0;
  while (i < src.length) {
    if (isWs(src[i])) { i += 1; continue; }
    if (src[i] === '/' && src[i + 1] === '*') { i = skipComment(src, i); continue; }
    return src[i];
  }
  return undefined;
}
function projectFirstPartyArtifactScopes(css, slug, verticalKey) {
  const chunks = [];
  let copyFrom = 0, stmtStart = 0, i = 0, paren = 0, bracket = 0;
  while (i < css.length) {
    const c = css[i];
    if (c === '/' && css[i + 1] === '*') { i = skipComment(css, i); continue; }
    if (c === "'" || c === '"') { i = skipString(css, i); continue; }
    if (c === '(') { paren += 1; i += 1; continue; }
    if (c === ')' && paren > 0) { paren -= 1; i += 1; continue; }
    if (c === '[') { bracket += 1; i += 1; continue; }
    if (c === ']' && bracket > 0) { bracket -= 1; i += 1; continue; }
    if (paren === 0 && bracket === 0 && c === '{') {
      const prelude = css.slice(stmtStart, i);
      if (firstSignificant(prelude) !== '@') {
        const projected = projectSelectorPrelude(prelude, slug, verticalKey);
        if (projected !== prelude) {
          chunks.push(css.slice(copyFrom, stmtStart), projected);
          copyFrom = i;
        }
      }
      stmtStart = i + 1;
    } else if (paren === 0 && bracket === 0 && (c === '}' || c === ';')) {
      stmtStart = i + 1;
    }
    i += 1;
  }
  if (chunks.length === 0) return css;
  chunks.push(css.slice(copyFrom));
  return chunks.join('');
}

/* ------------------------------------------------------------------ *
 * Declaration extraction                                             *
 * ------------------------------------------------------------------ */

function atRuleChain(node) {
  const chain = [];
  let p = node.parent;
  while (p && p.type !== 'root') {
    if (p.type === 'atrule') chain.unshift(`@${p.name}${p.params ? ` ${p.params}` : ''}`);
    p = p.parent;
  }
  return chain;
}

function ownerSelector(node) {
  let p = node.parent;
  while (p && p.type !== 'root') {
    if (p.type === 'rule') return p.selector.replace(/\s+/g, ' ').trim();
    if (p.type === 'atrule') return `@${p.name}${p.params ? ` ${p.params}` : ''}`;
    p = p.parent;
  }
  return '(root)';
}

/** Normalize a selector for mode classification (quotes + whitespace). */
const norm = (s) => s.replace(/"/g, "'").replace(/\s+/g, ' ').trim();

function modeFromContext(selector, chain) {
  const s = norm(selector);
  const at = chain.map(norm).join(' ');
  const negatedDark = /:not\(\[data-theme='dark'\]\)|:not\(\.dark\)/.test(s);
  const negatedLight = /:not\(\[data-theme='light'\]\)|:not\(\.light\)/.test(s);
  // strip negations before looking for positive tokens
  const positive = s.replace(/:not\([^)]*\)/g, '');
  const hasDark = /\[data-theme='dark'\]|\.dark\b/.test(positive) || /prefers-color-scheme\s*:\s*dark/.test(at);
  const hasLight = /\[data-theme='light'\]|\.light\b/.test(positive) || /prefers-color-scheme\s*:\s*light/.test(at);
  const flags = [];
  if (hasDark) flags.push('dark-selector');
  if (hasLight) flags.push('light-selector');
  if (negatedDark) flags.push('not-dark');
  if (negatedLight) flags.push('not-light');
  let mode = 'mode-agnostic';
  if (hasDark && !hasLight) mode = 'dark';
  else if (hasLight && !hasDark) mode = 'light';
  else if (negatedDark && !hasDark) mode = 'light';   // light-by-negation
  else if (negatedLight && !hasLight) mode = 'dark';  // dark-by-negation
  else if (hasDark && hasLight) mode = 'both';
  return { mode, flags };
}

/** Root-level comments become named banner sections. */
function collectBanners(root, totalLines) {
  const comments = [];
  root.each((node) => {
    if (node.type === 'comment') {
      comments.push({
        startLine: node.source.start.line,
        endLine: node.source.end.line,
        raw: `/*${node.raws.left ?? ''}${node.text}${node.raws.right ?? ''}*/`,
        text: node.text,
      });
    }
  });
  return comments.map((c, idx) => {
    const lines = c.text.split('\n').map((l) => l.trim()).filter(Boolean);
    const decorative = (l) => /^=+$/.test(l.replace(/[*\s]/g, ''));
    const isBannerStyle = lines.some((l) => /^=+$/.test(l) && l.length >= 8);
    const titleLine = lines.find((l) => !decorative(l) && l !== '') ?? '';
    return {
      index: idx,
      startLine: c.startLine,
      endLine: c.endLine,
      appliesToLine: c.endLine + 1,
      nextBoundaryLine: idx + 1 < comments.length ? comments[idx + 1].startLine - 1 : totalLines,
      isBannerStyle,
      title: titleLine.replace(/^\*+\s?/, '').trim(),
      raw: c.raw.length > 900 ? `${c.raw.slice(0, 900)}…` : c.raw,
    };
  });
}

function extractCustomProps(css, fileLabel, { lineOffset = 0, lineFrom = 1, lineTo = Infinity } = {}) {
  const root = postcss.parse(css, { from: fileLabel });
  const decls = [];
  let order = 0;
  root.walkDecls((decl) => {
    if (!decl.prop.startsWith('--')) return;
    const line = decl.source.start.line + lineOffset;
    if (line < lineFrom || line > lineTo) return;
    decls.push({
      order: order++,
      prop: decl.prop,
      value: decl.value.replace(/\s+/g, ' ').trim(),
      important: decl.important === true,
      selector: ownerSelector(decl),
      atRules: atRuleChain(decl),
      file: fileLabel,
      line,
      endLine: decl.source.end.line + lineOffset,
    });
  });
  return { root, decls };
}

/* ------------------------------------------------------------------ *
 * Per-vertical run                                                   *
 * ------------------------------------------------------------------ */

function lineOf(text, needle) {
  const idx = text.indexOf(needle);
  if (idx === -1) return { line: -1, offset: -1 };
  return { line: text.slice(0, idx).split('\n').length, offset: idx };
}

const summary = [];

for (const { slug, verticalKey } of VERTICALS) {
  const artifactPath = resolve(SNAP, slug, 'index.css');
  const extensionPath = resolve(SNAP, slug, '_source', 'extension.css');
  const artifact = readFileSync(artifactPath, 'utf-8');
  const extension = readFileSync(extensionPath, 'utf-8');

  const artifactLines = artifact.split('\n');
  const compiledMarker = lineOf(artifact, COMPILED_MARKER);
  const extMarker = lineOf(artifact, EXTENSION_MARKER);
  if (compiledMarker.line === -1 || extMarker.line === -1) {
    throw new Error(`${slug}: marker not found`);
  }

  /* --- compiled block boundaries: marker line .. line before extension marker --- */
  const compiledSelectorLine = compiledMarker.line + 1;
  // last non-blank line before the extension marker must be the closing brace
  let compiledCloseLine = extMarker.line - 1;
  while (compiledCloseLine > 0 && artifactLines[compiledCloseLine - 1].trim() === '') compiledCloseLine -= 1;
  const compiledCloseText = artifactLines[compiledCloseLine - 1];

  const compiledSlice = artifactLines.slice(compiledMarker.line - 1, compiledCloseLine).join('\n');
  const compiled = extractCustomProps(compiledSlice, `${slug}/index.css`, {
    lineOffset: compiledMarker.line - 1,
  });

  /* --- extension --- */
  const ext = extractCustomProps(extension, `${slug}/_source/extension.css`);
  const banners = collectBanners(ext.root, extension.split('\n').length);

  const bannerFor = (line, onlyBannerStyle) => {
    let found = null;
    for (const b of banners) {
      if (onlyBannerStyle && !b.isBannerStyle) continue;
      if (b.startLine <= line) found = b; else break;
    }
    return found;
  };

  for (const d of ext.decls) {
    const nearest = bannerFor(d.line, false);
    const section = bannerFor(d.line, true);
    d.nearestComment = nearest ? { line: nearest.startLine, title: nearest.title } : null;
    d.section = section ? { line: section.startLine, title: section.title } : null;
    d.sectionTitle = section ? section.title : '(pre-banner / unbannered)';
    const m = modeFromContext(d.selector, d.atRules);
    d.mode = m.mode;
    d.modeFlags = m.flags;
  }
  for (const d of compiled.decls) {
    const m = modeFromContext(d.selector, d.atRules);
    d.mode = m.mode;
    d.modeFlags = m.flags;
    d.sectionTitle = 'compiled-from-brandtheme';
  }

  /* --- unique names + overlap --- */
  const compiledNames = [...new Set(compiled.decls.map((d) => d.prop))].sort();
  const extNames = [...new Set(ext.decls.map((d) => d.prop))].sort();
  const compiledSet = new Set(compiledNames);
  const shared = extNames.filter((n) => compiledSet.has(n));
  const sharedSet = new Set(shared);

  const overlapRecords = shared.map((name) => ({
    name,
    compiledDeclarations: compiled.decls.filter((d) => d.prop === name)
      .map(({ prop, ...rest }) => rest),
    extensionDeclarations: ext.decls.filter((d) => d.prop === name)
      .map(({ prop, ...rest }) => rest),
    extensionSections: [...new Set(ext.decls.filter((d) => d.prop === name).map((d) => d.sectionTitle))],
    extensionModes: [...new Set(ext.decls.filter((d) => d.prop === name).map((d) => d.mode))],
  }));

  /* --- buckets (non-disjoint subsets of the shared set) --- */
  const declsByName = new Map();
  for (const d of ext.decls) {
    if (!sharedSet.has(d.prop)) continue;
    if (!declsByName.has(d.prop)) declsByName.set(d.prop, []);
    declsByName.get(d.prop).push(d);
  }

  const bucketByPredicate = (pred) => {
    const names = [];
    for (const [name, ds] of declsByName) if (ds.some(pred)) names.push(name);
    return names.sort();
  };

  const sectionTitles = [...new Set(ext.decls.map((d) => d.sectionTitle))];
  const perSectionBuckets = {};
  for (const title of sectionTitles) {
    perSectionBuckets[title] = bucketByPredicate((d) => d.sectionTitle === title);
  }
  const perSectionAllDecls = {};
  for (const title of sectionTitles) {
    perSectionAllDecls[title] = {
      declarations: ext.decls.filter((d) => d.sectionTitle === title).length,
      uniqueNames: new Set(ext.decls.filter((d) => d.sectionTitle === title).map((d) => d.prop)).size,
    };
  }

  const buckets = {
    light: bucketByPredicate((d) => d.mode === 'light'),
    dark: bucketByPredicate((d) => d.mode === 'dark'),
    'mode-agnostic': bucketByPredicate((d) => d.mode === 'mode-agnostic'),
    'dark-selector-any': bucketByPredicate((d) => d.modeFlags.includes('dark-selector')),
    'light-selector-any': bucketByPredicate((d) => d.modeFlags.includes('light-selector')),
  };
  // banner-derived buckets, keyed by a normalized short id
  for (const [title, names] of Object.entries(perSectionBuckets)) {
    buckets[`section:${title}`] = names;
  }
  // Codex-comparable composite buckets for bithire semantics
  const clearGuardTitle = sectionTitles.find((t) => /CLEAR MODE GUARD/i.test(t));
  const guardrailsTitle = sectionTitles.find((t) => /PRODUCTION GUARDRAILS/i.test(t));
  const darkBannerTitle = sectionTitles.find((t) => /DARK MODE|DARK THEME/i.test(t));
  const lightBannerTitle = sectionTitles.find((t) => /LIGHT MODE|LIGHT THEME|Light Mode Default/i.test(t));

  const codexComparable = {
    'light (mode=light by selector)': buckets.light.length,
    'dark (mode=dark by selector, includes clear-guard block)': buckets.dark.length,
    'dark (banner section only)': darkBannerTitle ? perSectionBuckets[darkBannerTitle].length : null,
    'dark (dark selector minus clear-guard section)': bucketByPredicate(
      (d) => d.mode === 'dark' && d.sectionTitle !== clearGuardTitle,
    ).length,
    'clear guard (banner section)': clearGuardTitle ? perSectionBuckets[clearGuardTitle].length : null,
    'production guardrails (banner section)': guardrailsTitle ? perSectionBuckets[guardrailsTitle].length : null,
    'light (banner section)': lightBannerTitle ? perSectionBuckets[lightBannerTitle].length : null,
  };

  /* --- correspondence validation --- */
  const expectedExtSection = projectFirstPartyArtifactScopes(
    `${EXTENSION_MARKER}\n${extension.replace(/^\s+/, '').replace(/\s+$/, '')}`,
    slug,
    verticalKey,
  );
  const actualExtSection = artifact.slice(extMarker.offset);
  const correspondence = {
    extensionMarkerLine: extMarker.line,
    extensionMarkerByteOffset: extMarker.offset,
    verbatimSubstring: artifact.includes(extension.replace(/^\s+/, '').replace(/\s+$/, '')),
    transformedMatch: actualExtSection === `${expectedExtSection}\n`,
    transformation:
      "renderVerticalArtifact trims leading/trailing whitespace from extension.css, prefixes the extension marker, then projectFirstPartyArtifactScopes() rewrites every `html[data-tenant='<slug>']` compound appearing in a RULE PRELUDE (never in a declaration value, comment, or string) into `:is(html[data-tenant='<slug>'], :where([data-ds-root][data-vertical='<verticalKey>']))`.",
    trailingNewlineOnly: actualExtSection.trimEnd() === expectedExtSection.trimEnd(),
  };
  if (reproduction && !reproduction.error) {
    const spec = reproduction.rendererMod.FIRST_PARTY_ARTIFACT_SPECS.find((s) => s.slug === slug);
    const compiledVars = reproduction.compileBrandTheme({ brandTheme: reproduction.themes[slug], tenantSlug: slug });
    const rendered = reproduction.rendererMod.renderVerticalArtifact({
      tenantSlug: spec.slug,
      verticalKey: spec.verticalKey,
      authoredThemePath: spec.authoredThemePath,
      displayName: spec.displayName,
      selector: spec.selector,
      compiledCssVariables: compiledVars.cssVariables,
      extensionCss: extension,
      regenerateCommand: reproduction.rendererMod.FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND,
    });
    correspondence.fullArtifactReproduction = {
      method:
        'Re-rendered the whole artifact from dist compileBrandTheme(<slug>BrandTheme) + the snapshot extension.css through the same renderVerticalArtifact used by build-vertical-artifacts.mjs, then byte-compared to the snapshot index.css.',
      compiledVarCountFromCompiler: Object.keys(compiledVars.cssVariables).length,
      byteIdentical: rendered === artifact,
      renderedSha256: sha256(rendered),
      snapshotSha256: sha256(artifact),
      match: sha256(rendered) === sha256(artifact),
    };
  } else {
    correspondence.fullArtifactReproduction = { attempted: true, failed: reproduction?.error ?? 'unavailable' };
  }

  if (!correspondence.transformedMatch) {
    // locate first divergence for diagnostics
    const a = actualExtSection, b = `${expectedExtSection}\n`;
    let i = 0;
    while (i < Math.min(a.length, b.length) && a[i] === b[i]) i += 1;
    correspondence.firstDivergenceOffset = i;
    correspondence.actualAround = a.slice(Math.max(0, i - 120), i + 120);
    correspondence.expectedAround = b.slice(Math.max(0, i - 120), i + 120);
  }

  /* --- contradiction check: color-scheme dark then light for same selector --- */
  const colorSchemeDecls = [];
  const scanColorScheme = (css, label, offset = 0) => {
    const r = postcss.parse(css, { from: label });
    r.walkDecls((decl) => {
      if (decl.prop.trim() !== 'color-scheme') return;
      colorSchemeDecls.push({
        file: label,
        line: decl.source.start.line + offset,
        selector: ownerSelector(decl),
        normalizedSelector: norm(ownerSelector(decl)),
        atRules: atRuleChain(decl),
        value: decl.value.trim(),
      });
    });
  };
  scanColorScheme(extension, `${slug}/_source/extension.css`);
  scanColorScheme(artifact, `${slug}/index.css`);

  const bySelector = {};
  for (const d of colorSchemeDecls.filter((d) => d.file.endsWith('_source/extension.css'))) {
    (bySelector[d.normalizedSelector] ||= []).push(d);
  }
  const sameSelectorConflicts = Object.entries(bySelector)
    .filter(([, ds]) => new Set(ds.map((d) => d.value)).size > 1)
    .map(([sel, ds]) => ({
      selector: sel,
      declarations: ds,
      lastWins: ds[ds.length - 1].value,
    }));

  /* --- cascade analysis: which same-selector redeclarations actually win --- */
  const darkRules = [];
  ext.root.walkRules((r) => {
    const s = norm(r.selector);
    const positive = s.replace(/:not\([^)]*\)/g, '');
    if (/\[data-theme='dark'\]|\.dark\b/.test(positive)) {
      darkRules.push({ startLine: r.source.start.line, endLine: r.source.end.line, selector: s });
    }
  });
  const identicalSelectorGroups = {};
  for (const r of darkRules) (identicalSelectorGroups[r.selector] ||= []).push(r);

  const namesInRange = (a, b) =>
    new Set(ext.decls.filter((d) => d.line >= a && d.line <= b).map((d) => d.prop));

  let cascadeAnalysis = null;
  if (sameSelectorConflicts.length > 0 && darkRules.length >= 2) {
    const firstRule = darkRules[0];
    const laterRules = darkRules.slice(1);
    const firstNames = namesInRange(firstRule.startLine, firstRule.endLine);
    const laterNames = new Set();
    for (const r of laterRules) for (const n of namesInRange(r.startLine, r.endLine)) laterNames.add(n);
    const overridden = [...firstNames].filter((n) => laterNames.has(n)).sort();
    const surviving = [...firstNames].filter((n) => !laterNames.has(n)).sort();
    cascadeAnalysis = {
      note:
        'All rules carrying a dark-matching selector in this extension share one byte-identical selector list, so specificity is equal and pure source order decides the winner. A name declared in the first (dark) rule survives only if no later rule in the group redeclares it.',
      darkMatchingRules: darkRules,
      identicalSelectorListCount: Object.keys(identicalSelectorGroups).length,
      firstDarkRule: firstRule,
      firstDarkRuleUniqueNames: firstNames.size,
      overriddenByLaterRulesCount: overridden.length,
      survivingDarkValuesCount: surviving.length,
      overriddenByLaterRules: overridden,
      survivingDarkValues: surviving,
      verdict:
        overridden.length < firstNames.size
          ? `The clear-mode guard neutralizes color-scheme and ${overridden.length} of ${firstNames.size} dark-block custom properties; the remaining ${surviving.length} dark values STILL APPLY under [data-theme=dark]/.dark. The "dark blocks never operate" reading is therefore not literally true.`
          : 'Every declaration of the first dark rule is overridden by a later same-selector rule.',
    };
  }

  // comments asserting the vertical pins light
  const pinComments = [];
  const commentRe = /\/\*[\s\S]*?\*\//g;
  let cm;
  while ((cm = commentRe.exec(extension))) {
    const text = cm[0];
    if (/clear mode|stays in a light|pins? light|never operate|even when the shell receives/i.test(text)) {
      pinComments.push({
        file: `${slug}/_source/extension.css`,
        line: extension.slice(0, cm.index).split('\n').length,
        text: text.length > 700 ? `${text.slice(0, 700)}…` : text,
      });
    }
  }

  /* --- coarse "region between MAJOR banners" buckets (Codex's implicit definition) --- */
  const bannerStyle = banners.filter((b) => b.isBannerStyle);
  const coarseRegions = [];
  {
    // region 0: everything before the first banner-style comment
    const firstBanner = bannerStyle[0];
    if (firstBanner && firstBanner.startLine > 1) {
      coarseRegions.push({ title: '(pre-banner light block)', startLine: 1, endLine: firstBanner.startLine - 1 });
    }
    for (let i = 0; i < bannerStyle.length; i += 1) {
      coarseRegions.push({
        title: bannerStyle[i].title,
        startLine: bannerStyle[i].startLine,
        endLine: i + 1 < bannerStyle.length ? bannerStyle[i + 1].startLine - 1 : extension.split('\n').length,
      });
    }
  }
  const MAJOR = /DARK MODE|DARK THEME|LIGHT MODE|LIGHT THEME|CLEAR MODE GUARD|PRODUCTION GUARDRAILS|BRAND COLORS|pre-banner/i;
  const majorRegions = [];
  for (const r of coarseRegions) {
    if (MAJOR.test(r.title)) majorRegions.push({ ...r });
    else if (majorRegions.length > 0) majorRegions[majorRegions.length - 1].endLine = r.endLine;
  }
  const sharedNamesInRange = (a, b) =>
    [...new Set(ext.decls.filter((d) => d.line >= a && d.line <= b && sharedSet.has(d.prop)).map((d) => d.prop))].sort();
  const coarseBuckets = majorRegions.map((r) => {
    const names = sharedNamesInRange(r.startLine, r.endLine);
    return { ...r, sharedNameCount: names.length, sharedNames: names };
  });

  /* --- naive flat-regex control: what a regex-only audit would over-count --- */
  const flatNames = new Set();
  const flatRe = /(--[A-Za-z0-9_-]+)\s*:/g;
  let fm;
  while ((fm = flatRe.exec(extension))) flatNames.add(fm[1]);
  const regexArtifacts = [...flatNames].filter((n) => !extNames.includes(n)).sort().map((n) => {
    const idx = extension.indexOf(n);
    const line = extension.slice(0, idx).split('\n').length;
    return { name: n, firstLine: line, sourceLine: extension.split('\n')[line - 1].trim() };
  });

  const out = {
    vertical: slug,
    verticalKey,
    generatedAt: new Date().toISOString(),
    method: {
      parser: `postcss ${POSTCSS_VERSION} (required read-only from ui-design-system/packages/core/node_modules/postcss)`,
      description:
        'Custom properties are collected with postcss walkDecls() over (a) the compiled block of the snapshot index.css, sliced by the two generated marker comments and re-parsed as standalone CSS with a line offset so reported line numbers are absolute in index.css, and (b) the whole snapshot _source/extension.css. Selectors and at-rule chains come from the postcss AST (parent walk), not from regex over text. Banner sections are the ROOT-LEVEL comments of extension.css; a declaration belongs to the nearest preceding banner-style root comment (a root comment containing a rule of >=8 "=" characters).',
      buckets:
        'Buckets are subsets of the shared-name set and are NOT disjoint: a name counts in every bucket that at least one of its extension declarations satisfies. mode=light means the owning selector carries [data-theme=light]/.light or is light-by-negation (:not([data-theme=dark]):not(.dark)), or the at-rule chain carries prefers-color-scheme: light; mode=dark is the mirror image. section:<title> buckets are membership in that banner section.',
    },
    snapshots: {
      [`${slug}/index.css`]: { sha256: sha256(artifact), bytes: Buffer.byteLength(artifact, 'utf-8'), lines: artifactLines.length },
      [`${slug}/_source/extension.css`]: { sha256: sha256(extension), bytes: Buffer.byteLength(extension, 'utf-8'), lines: extension.split('\n').length },
    },
    markers: {
      compiled: { text: COMPILED_MARKER, line: compiledMarker.line, byteOffset: compiledMarker.offset },
      extension: { text: EXTENSION_MARKER, line: extMarker.line, byteOffset: extMarker.offset },
      compiledBlock: {
        selectorLine: compiledSelectorLine,
        selectorText: artifactLines[compiledSelectorLine - 1],
        closingBraceLine: compiledCloseLine,
        closingBraceText: compiledCloseText,
        declarationLineRange: [compiledSelectorLine + 1, compiledCloseLine - 1],
      },
    },
    correspondence,
    counts: {
      compiledDeclarations: compiled.decls.length,
      compiledUniqueNames: compiledNames.length,
      extensionDeclarations: ext.decls.length,
      extensionUniqueNames: extNames.length,
      intersection: shared.length,
      compiledOnly: compiledNames.filter((n) => !sharedSet.has(n)).length,
      extensionOnly: extNames.filter((n) => !compiledSet.has(n)).length,
    },
    names: {
      compiledUnique: compiledNames,
      extensionUnique: extNames,
      intersection: shared,
    },
    banners: banners.map((b, i) => {
      const nextBannerStyle = banners.slice(i + 1).find((x) => x.isBannerStyle);
      return {
        startLine: b.startLine,
        endLine: b.endLine,
        isBannerStyle: b.isBannerStyle,
        title: b.title,
        raw: b.raw,
        commentCoversLines: [b.startLine, b.nextBoundaryLine],
        sectionCoversLines: b.isBannerStyle
          ? [b.startLine, nextBannerStyle ? nextBannerStyle.startLine - 1 : extension.split('\n').length]
          : null,
      };
    }),
    sectionInventory: perSectionAllDecls,
    bucketCounts: Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length])),
    buckets,
    coarseBannerRegionBuckets: {
      definition:
        'A MAJOR banner region runs from one major banner-style comment (DARK MODE / DARK THEME / LIGHT MODE / LIGHT THEME / CLEAR MODE GUARD / PRODUCTION GUARDRAILS / BRAND COLORS) to the next MAJOR banner, absorbing any minor banner-style comments in between. This is the definition that reproduces the Codex bucket numbers.',
      regions: coarseBuckets,
    },
    codexComparable,
    regexArtifacts: {
      note:
        'Names a naive flat regex /(--[A-Za-z0-9_-]+)\\s*:/ finds in extension.css that are NOT custom-property declarations. Each is a false positive that inflates a regex-only count.',
      naiveFlatRegexUniqueCount: flatNames.size,
      astUniqueCount: extNames.length,
      falsePositives: regexArtifacts,
    },
    overlapRecords,
    contradictionCheck: {
      allColorSchemeDeclarations: colorSchemeDecls,
      sameSelectorConflicts,
      pinLightComments: pinComments,
      cascadeAnalysis,
    },
  };

  const outPath = resolve(AUDIT_ROOT, `${slug}-overlap.json`);
  writeFileSync(outPath, JSON.stringify(out, null, 2));

  summary.push({
    slug,
    compiledUnique: compiledNames.length,
    compiledDecls: compiled.decls.length,
    extUnique: extNames.length,
    extDecls: ext.decls.length,
    intersection: shared.length,
    correspondence: correspondence.transformedMatch ? 'PASS' : 'FAIL',
    fullArtifactReproduction: correspondence.fullArtifactReproduction?.byteIdentical === true ? 'BYTE-IDENTICAL' : 'NOT-REPRODUCED',
    verbatim: correspondence.verbatimSubstring,
    codexComparable,
    coarseRegions: coarseBuckets.map((r) => `${r.title} [L${r.startLine}-${r.endLine}] = ${r.sharedNameCount}`),
    regexFalsePositives: regexArtifacts.map((r) => `${r.name} @L${r.firstLine}`),
    conflicts: sameSelectorConflicts.length,
    cascade: cascadeAnalysis
      ? `${cascadeAnalysis.overriddenByLaterRulesCount} of ${cascadeAnalysis.firstDarkRuleUniqueNames} dark names overridden, ${cascadeAnalysis.survivingDarkValuesCount} survive`
      : null,
    outPath,
  });
}

console.log(JSON.stringify(summary, null, 2));
