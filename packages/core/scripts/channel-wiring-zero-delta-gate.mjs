/**
 * Proves that newly wired tenant channels are ZERO-DELTA WHEN UNSET.
 *
 * The reach programme wires a dead channel by turning a paint site into
 * `var(--ds-<channel>, <the exact expression that site already carried>)`. The
 * claim that buys is precise: a tenant that authors nothing sees exactly what
 * it saw before. That claim is cheap to make, easy to believe, and wrong the
 * moment a fallback is retyped by hand instead of moved -- a `300px` that
 * becomes `320px` inside a fallback arm is invisible in review and changes the
 * default for every tenant on the system.
 *
 * This drill decides it mechanically. For each changed stylesheet it collapses
 * every channel the change ADDED a read for back to that read's fallback arm --
 * which is, by definition, what the property resolves to while the channel is
 * unauthored -- and requires the result to be byte-identical to the baseline.
 * Whitespace and comments are normalised away because reflowing a declaration
 * cannot change a resolved value; nothing else is forgiven.
 *
 * WHY THE BASELINE IS A REF AND DEFAULTS TO A PINNED COMMIT
 * --------------------------------------------------------
 * The obvious baseline is `HEAD`, and it is a trap. Once the wiring commit
 * lands, HEAD CONTAINS the wiring, so the drill collapses the working tree and
 * compares it against a baseline that already has the same reads -- it passes
 * vacuously and proves nothing. That failure mode cost this programme three
 * separate times in one day, always by looking green. So the baseline is an
 * explicit `--baseline=<ref>` and its default is the PRE-WAVE commit; point it
 * at the commit immediately before the wiring you are checking, never at a ref
 * that moves with your own work.
 *
 * WHAT COUNTS AS A CHANNEL
 * ------------------------
 * Derived, not declared: any `--ds-*` the working tree reads through `var()`
 * in a file where the baseline did not read it. A hand-maintained list would
 * drift out of agreement with the diff it claims to describe, and would let a
 * forgotten entry pass unchecked.
 *
 * NEW SOCKETS
 * -----------
 * A wiring may legitimately add a declaration with no prior expression -- a
 * socket whose neutral resolves to the initial value the element already had,
 * e.g. `box-shadow: var(--ds-x, none)` on an element that painted no shadow.
 * Those cannot collapse into the baseline, so each must be named through
 * `allowNew` / `--allow-new=`, and an allowance no file consumes is itself a
 * failure: a stale allowance is how a real delta gets waved past.
 *
 * An allowance may be scoped to one file as `<path-suffix>#<declaration>`.
 * Scoping matters as soon as a run covers more than one file: an unscoped
 * allowance is offered to every file, so a socket that is legitimate in one
 * sheet would otherwise have to be legitimate in all of them.
 *
 * DELETIONS
 * ---------
 * The collapse-and-compare drill above judges what a change ADDED. It cannot
 * represent a REMOVAL: deleting a declaration is a byte difference that no
 * amount of collapsing restores, so a deletion wave reads red no matter how
 * inert it is. That is not a small gap — the drain waves are deletion-heavy,
 * and an instrument that cannot express the dominant operation gets routed
 * around, or teaches its readers to ignore its red.
 *
 * So a removal is adjudicated instead of diffed, on one principle:
 *
 *     deleting a declaration that LOSES today changes nothing;
 *     deleting a declaration that WINS today changes what renders.
 *
 * Deciding which requires resolving the cascade, so this file resolves it —
 * see `resolveWinners`. The resolution is deliberately narrow and FAILS
 * CLOSED, because the blind spot here has a direction: a false "this loses"
 * licenses the deletion of a live declaration, while a false "this wins" only
 * costs an argument. It therefore compares LIKE WITH LIKE and nothing else —
 * same cascade layer, same at-rule context, identical selector text — so no
 * specificity arithmetic is ever performed. Anything outside that model
 * (`!important` in the group, a file no entrypoint imports, a selector that
 * appears only once) is refused rather than guessed.
 *
 * The byte comparison is not weakened to buy this. A file with removals must
 * still match its baseline EXACTLY once those removals are accounted for; only
 * then is each removal put to the winner test. A retyped fallback sitting
 * beside a legitimate deletion still fails, which is the whole point.
 *
 * NOT a CI gate. This is a lane instrument, invoked against a specific wave by
 * whoever is doing the wiring; it is deliberately absent from
 * `ci-gates.manifest.mjs`.
 *
 * Usage:
 *   node scripts/channel-wiring-zero-delta-gate.mjs --check
 *   node scripts/channel-wiring-zero-delta-gate.mjs --check --baseline=9c8f1030c
 *   node scripts/channel-wiring-zero-delta-gate.mjs --check \
 *     --file=src/.../collection-workspace.css --allow-new=box-shadow:none
 *   node scripts/channel-wiring-zero-delta-gate.mjs --check --entrypoint=src/.../base.css
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import postcss from 'postcss';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(SCRIPT_DIR, '..');

/**
 * The commit immediately BEFORE the W1 reach wave wired its first channel.
 * Override with `--baseline=<ref>` for a later wave; see the header on why this
 * must never default to a moving ref such as HEAD.
 */
export const DEFAULT_BASELINE = '9c8f1030c';

/**
 * Generated output, excluded from the default sweep.
 *
 * `styles/**` and the tenant artifacts are BUILD PRODUCTS regenerated from the
 * authored skins and the brand themes, so they legitimately change for reasons
 * that have nothing to do with channel wiring — a recompiled tint ramp, a new
 * typography role. Collapsing the channels a wave added can never restore their
 * baseline, and reporting that as a wiring defect trains the reader to ignore
 * the instrument. Audit the authored source; the build product is downstream of
 * it. Pass `--file=` explicitly to check one anyway.
 */
export const DEFAULT_EXCLUDES = [
  'packages/core/styles/',
  '/dist/',
  'foundation/tokens/css/facade/artifacts/',
];

function git(root, args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

/**
 * Repo-root-relative path, since `git show <ref>:<path>` is anchored there.
 *
 * Both sides are realpath'd first. On macOS the temp dir and `/var` are
 * symlinks, so git reports `/private/var/...` while a caller-supplied path says
 * `/var/...`; `path.relative` then yields a `../../..` escape, `git show` fails,
 * and the file is written off as "absent at the baseline" — a SILENT SKIP that
 * reports success for a file nobody checked. Caught by the file-scoped
 * allowance test, which failed because both of its files were skipped.
 */
function repoRelative(top, absolutePath) {
  const real = fs.existsSync(absolutePath) ? fs.realpathSync(absolutePath) : absolutePath;
  return path.relative(top, real).split(path.sep).join('/');
}

function baselineSource(root, ref, repoPath) {
  try {
    return git(root, ['show', `${ref}:${repoPath}`]);
  } catch {
    return null; // absent at the baseline: a wholly new file has nothing to preserve
  }
}

/**
 * Every `--ds-*` read through `var()` in a stylesheet. Comments are blanked
 * first so prose describing a chain is never mistaken for a read.
 */
export function channelReads(css) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '));
  const found = new Set();
  for (const match of withoutComments.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)) found.add(match[1]);
  return found;
}

/**
 * Replace `var(--name, FALLBACK)` with FALLBACK for every name in `names`.
 *
 * A real brace walk, not a regex: fallback arms legitimately contain commas
 * (a box-shadow list), nested `var()` chains and nested functions, all of which
 * a regex either truncates or over-consumes. Collapsing innermost-outward via
 * repeated first-match handles a fallback that itself reads a collapsed name.
 *
 * A read with NO fallback arm is left ALONE rather than treated as fatal. Not
 * every newly read `--ds-*` is a wired tenant channel: adopting an existing
 * foundation token bare, `var(--ds-color-bg-elevated)`, is ordinary practice and
 * flagging it produced false positives on four sheets that had done nothing
 * wrong. Leaving it uncollapsed is also strictly safe — the byte comparison
 * still sees whatever the bare read replaced, so a genuine delta is reported as
 * a divergence with its context instead of a style complaint.
 */
export function collapseChannels(css, names) {
  const targets = new Set(names);
  if (targets.size === 0) return css;
  /* Names proven to have no fallback arm at some site; dropped from the
     alternation so the scan terminates instead of re-finding the same read. */
  const uncollapsible = new Set();
  /* One alternation built once, rather than a fresh RegExp per name per pass:
     the per-name form is quadratic in the channel count and a wave that wires
     hundreds of names made a whole-tree run unusable. Longest-first so a name
     that prefixes another cannot match the shorter alternative. */
  const build = () => {
    const live = [...targets].filter((name) => !uncollapsible.has(name));
    if (live.length === 0) return null;
    return new RegExp(
      `var\\(\\s*(${live
        .sort((a, b) => b.length - a.length)
        .map((name) => name.replace(/-/g, '\\-'))
        .join('|')})(?=[\\s,)])`,
    );
  };

  let alternation = build();
  let out = css;

  for (;;) {
    if (!alternation) return out;
    const found = alternation.exec(out);
    if (!found) return out;
    const at = found.index;
    const hit = found[1];

    const open = out.indexOf('(', at);
    let depth = 0;
    let close = -1;
    for (let i = open; i < out.length; i += 1) {
      if (out[i] === '(') depth += 1;
      else if (out[i] === ')') {
        depth -= 1;
        if (depth === 0) {
          close = i;
          break;
        }
      }
    }
    if (close === -1) throw new Error(`unbalanced var() for ${hit}`);

    const inner = out.slice(open + 1, close);
    const comma = inner.indexOf(',');
    if (comma === -1) {
      /* No fallback: nothing to collapse TO. Retire the name and let the byte
         comparison judge whatever this bare read replaced. */
      uncollapsible.add(hit);
      alternation = build();
      continue;
    }
    out = out.slice(0, at) + inner.slice(comma + 1).trim() + out.slice(close + 1);
  }
}

/**
 * Whitespace- and comment-insensitive. Reflowing a declaration to fit a line
 * budget, or documenting what the wiring did, cannot change a resolved value;
 * every other difference is real and must fail.
 */
export function normalise(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};:,])\s*/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim();
}

function firstDivergence(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i += 1;
  return {
    index: i,
    baseline: a.slice(Math.max(0, i - 90), i + 120),
    collapsed: b.slice(Math.max(0, i - 90), i + 120),
  };
}

/* ==========================================================================
   DELETION CERTIFICATION
   ========================================================================== */

/** Every shipped bundle. A removal must be inert in ALL of them, not one. */
export const DEFAULT_ENTRYPOINT_DIR = 'src/foundation/tokens/css/facade/entrypoints';

const IMPORT_RE = /@import\s+(['"])([^'"]+)\1\s*(?:layer\(([^)]*)\))?\s*;/g;

/** The layer an entrypoint puts a file in; `null` means UNLAYERED, which is a
 *  real and distinct cascade position, not "unknown". */
const UNLAYERED = '(unlayered)';

/**
 * Files an entrypoint pulls in, in document order, each with its cascade layer.
 *
 * `@import` inlines at its own position and CSS requires every import to
 * precede the importing file's own rules, so depth-first pre-order IS document
 * order. A nested import inherits the layer its parent import declared, which
 * is how `base/index.css` puts all six base sheets in `rottay-tokens`.
 *
 * Non-relative specifiers (`antd/dist/reset.css`) are not resolved and are
 * reported, never silently treated as empty.
 */
export function bundleOrder(entrypoint, { layer = UNLAYERED, seen = new Set(), out = [], unresolved = [] } = {}) {
  const full = path.resolve(entrypoint);
  if (seen.has(full)) return { files: out, unresolved };
  seen.add(full);
  if (!fs.existsSync(full)) {
    unresolved.push(full);
    return { files: out, unresolved };
  }
  const css = fs.readFileSync(full, 'utf8');
  for (const match of css.matchAll(IMPORT_RE)) {
    const specifier = match[2];
    const declared = match[3]?.trim();
    if (!specifier.startsWith('.')) {
      unresolved.push(specifier);
      continue;
    }
    /* An inner import cannot escape the layer its outer import assigned. */
    const childLayer = layer === UNLAYERED ? (declared || UNLAYERED) : layer;
    bundleOrder(path.resolve(path.dirname(full), specifier), { layer: childLayer, seen, out, unresolved });
  }
  out.push({ path: full, layer });
  return { files: out, unresolved };
}

/** At-rule ancestry of a node, as a stable string. `''` means unconditional. */
function atRuleContext(node) {
  const chain = [];
  for (let n = node.parent; n && n.type !== 'root'; n = n.parent) {
    if (n.type === 'atrule') chain.unshift(`@${n.name} ${n.params}`.replace(/\s+/g, ' ').trim());
  }
  return chain.join(' && ');
}

/**
 * Custom-property declarations of one stylesheet, in document order.
 *
 * `astKey` identifies the physical node (whole selector list, plus an ordinal so
 * a property declared twice at one selector stays two distinct rows). The
 * per-selector `winnerKeys` are what the cascade is resolved on.
 */
export function indexDeclarations(css, from) {
  const rows = [];
  const ordinals = new Map();
  let root;
  try {
    root = postcss.parse(css, { from });
  } catch {
    return null; // unparseable: the caller must fail closed, never assume empty
  }
  root.walkDecls((decl) => {
    if (!decl.prop.startsWith('--')) return;
    if (decl.parent?.type !== 'rule') return;
    const atRule = atRuleContext(decl);
    const selector = decl.parent.selector.replace(/\s+/g, ' ').trim();
    const stem = `${atRule}||${selector}||${decl.prop}`;
    const ordinal = ordinals.get(stem) ?? 0;
    ordinals.set(stem, ordinal + 1);
    rows.push({
      astKey: `${stem}||#${ordinal}`,
      winnerKeys: decl.parent.selectors.map(
        (s) => `${atRule}||${s.replace(/\s+/g, ' ').trim()}||${decl.prop}`,
      ),
      prop: decl.prop,
      selector,
      atRule,
      value: decl.value.replace(/\s+/g, ' ').trim(),
      important: decl.important === true,
    });
  });
  return rows;
}

/**
 * Last-writer-wins per (layer, at-rule context, selector, property).
 *
 * Only ever compares declarations that share all four, so document order alone
 * decides and no specificity is computed. A group containing `!important` is
 * POISONED: order no longer decides it, and this resolver will not pretend to
 * know. An unparseable file poisons every key it could have touched, by
 * poisoning the whole map.
 */
export function resolveWinners(orderedFiles, readSource) {
  const winners = new Map();
  const poisoned = new Set();
  let fatal = null;
  orderedFiles.forEach(({ path: filePath, layer }, fileIndex) => {
    const source = readSource(filePath);
    if (source === null) return; // not in this bundle's baseline; nothing to resolve
    const rows = indexDeclarations(source, filePath);
    if (rows === null) {
      fatal = `unparseable stylesheet in the bundle: ${filePath}`;
      return;
    }
    rows.forEach((row, declIndex) => {
      for (const key of row.winnerKeys) {
        const full = `${layer}||${key}`;
        if (row.important) poisoned.add(full);
        winners.set(full, { value: row.value, file: filePath, layer, fileIndex, declIndex });
      }
    });
  });
  return { winners, poisoned, fatal };
}

/**
 * Declarations present in the baseline and absent from the working tree.
 * `null` when either side will not parse — the caller must fail closed.
 */
export function removalsBetween(before, after, from) {
  const b = indexDeclarations(before, from);
  const a = indexDeclarations(after, from);
  if (b === null || a === null) return null;
  const survived = new Set(a.map((row) => row.astKey));
  return b
    .map((row, index) => ({
      ...row,
      /* Keys this declaration ALREADY lost within its own sheet. Needed because
         a same-file winner cannot be ranked against it by file order alone. */
      lostInFile: new Set(
        row.winnerKeys.filter((key) =>
          b.slice(index + 1).some((later) => later.winnerKeys.includes(key))),
      ),
    }))
    .filter((row) => !survived.has(row.astKey));
}

/**
 * The baseline with exactly `removed` taken out, normalised.
 *
 * Matching this proves the ONLY byte differences are those removals — which is
 * what keeps the strict comparison strict. `null` if a plain re-stringify of
 * the baseline does not already normalise back to itself, since then the
 * reconstruction is not trustworthy and must not be used to excuse anything.
 */
export function baselineMinusRemovals(before, removed, from) {
  let root;
  try {
    root = postcss.parse(before, { from });
  } catch {
    return null;
  }
  if (normalise(root.toString()) !== normalise(before)) return null;

  const doomed = new Set(removed.map((row) => row.astKey));
  const ordinals = new Map();
  const nodes = [];
  root.walkDecls((decl) => {
    if (!decl.prop.startsWith('--')) return;
    if (decl.parent?.type !== 'rule') return;
    const stem = `${atRuleContext(decl)}||${decl.parent.selector.replace(/\s+/g, ' ').trim()}||${decl.prop}`;
    const ordinal = ordinals.get(stem) ?? 0;
    ordinals.set(stem, ordinal + 1);
    if (doomed.has(`${stem}||#${ordinal}`)) nodes.push(decl);
  });
  for (const node of nodes) node.remove();
  return normalise(root.toString());
}

/**
 * Decide each removal. Returns `[]` when every one is inert.
 *
 * The test is POSITIONAL, never a comparison of winning values, and that
 * distinction is the whole correctness of this function. Comparing values asks
 * "did the winner move?" — but in a mixed wave the winner routinely moves for a
 * reason that has nothing to do with this removal (a re-alias, a retune, a hook
 * wrapped around the winner two files away), and blaming the removal for it
 * reports a defect in the wrong file. The first cut of this gate did exactly
 * that: it failed `spacing.css` and `typography.css` for edits that lived in
 * `default.css`, which then correctly failed on its own account.
 *
 * The question a removal must answer is narrower: *was this declaration already
 * losing, and is it still losing?* Both halves are required. "Already losing"
 * rules out deleting something live. "Still losing" rules out the case where
 * the declaration that used to outrank it is being deleted in the same wave,
 * which would silently promote this one. Neither half looks at a value, so an
 * unrelated retune elsewhere cannot make a genuinely inert deletion read red.
 */
export function certifyRemovals({ removed, filePath, bundles }) {
  const objections = [];
  const covering = bundles.filter((b) => b.orderedFiles.some((f) => f.path === filePath));
  if (covering.length === 0) {
    return [
      `${path.basename(filePath)}: no entrypoint imports this file, so its cascade winners cannot be `
        + 'resolved — a removal here is UNCERTIFIABLE, not innocent',
    ];
  }

  for (const bundle of covering) {
    if (bundle.before.fatal) { objections.push(`${bundle.name}: ${bundle.before.fatal}`); continue; }
    if (bundle.after.fatal) { objections.push(`${bundle.name}: ${bundle.after.fatal}`); continue; }

    const ownIndex = bundle.orderedFiles.findIndex((f) => f.path === filePath);

    for (const row of removed) {
      for (const key of row.winnerKeys) {
        const full = `${bundle.layerOf.get(filePath)}||${key}`;
        if (bundle.before.poisoned.has(full) || bundle.after.poisoned.has(full)) {
          objections.push(
            `${row.prop} at \`${row.selector}\` carries !important somewhere in its cascade group `
              + `(${bundle.name}) — order no longer decides the winner, so the removal is not certifiable`,
          );
          continue;
        }

        /* Outranked iff the winner sits in a LATER file, or in this same file
           after this declaration. Anything else means the removal is the thing
           that decides the value. */
        const outranks = (winner) => {
          if (!winner) return false;
          if (winner.fileIndex !== ownIndex) return winner.fileIndex > ownIndex;
          return row.lostInFile.has(key);
        };

        if (!outranks(bundle.before.winners.get(full))) {
          objections.push(
            `${row.prop} at \`${row.selector}\` WON in ${bundle.name} before this change — `
              + 'deleting it deletes a live value',
          );
          continue;
        }
        const after = bundle.after.winners.get(full);
        if (!after) {
          objections.push(
            `${row.prop} at \`${row.selector}\` WON in ${bundle.name}: nothing declares it after the `
              + 'removal, so this deletes a live value',
          );
          continue;
        }
        if (!outranks(after)) {
          objections.push(
            `${row.prop} at \`${row.selector}\` is PROMOTED in ${bundle.name}: the declaration that `
              + `outranked it is gone too, so the surviving winner is now `
              + `${path.relative(process.cwd(), after.file)} — this removal is not inert`,
          );
        }
      }
    }
  }
  return objections;
}

/**
 * @param {object}   options
 * @param {string}   [options.root]      package root (defaults to packages/core)
 * @param {string}   [options.baseline]  git ref the default must still match
 * @param {string[]} [options.files]     paths to check; defaults to the CSS the
 *                                       working tree changed since `baseline`
 * @param {string[]} [options.allowNew]  normalised declarations legitimately
 *                                       added with no prior expression
 * @param {string[]} [options.entrypoints] bundles a removal must be inert in;
 *                                       defaults to every entrypoint stylesheet
 * @param {boolean}  [options.silent]
 */
export function runChannelWiringZeroDeltaGate({
  root = DEFAULT_ROOT,
  baseline = DEFAULT_BASELINE,
  files,
  allowNew = [],
  entrypoints,
  silent = false,
} = {}) {
  const top = fs.realpathSync(git(root, ['rev-parse', '--show-toplevel']).trim());
  const targets =
    files ??
    git(root, ['diff', '--name-only', baseline, '--', '*.css'])
      .split('\n')
      .filter(Boolean)
      .filter((repoPath) => !DEFAULT_EXCLUDES.some((fragment) => `/${repoPath}`.includes(fragment)))
      .map((repoPath) => path.resolve(top, repoPath));

  /* Files whose working content may differ from the baseline. Everything else
     is byte-identical to it, so the bundle's baseline can be read straight off
     disk instead of paying `git show` for ~420 stylesheets. */
  const maybeChanged = new Set(
    [
      ...git(root, ['diff', '--name-only', baseline]).split('\n'),
      ...git(root, ['ls-files', '--others', '--exclude-standard']).split('\n'),
    ].filter(Boolean),
  );
  const readBaselineFor = (filePath) => {
    const repoPath = repoRelative(top, filePath);
    if (!maybeChanged.has(repoPath)) {
      return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
    }
    return baselineSource(root, baseline, repoPath);
  };
  const readWorkingFor = (filePath) =>
    (fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null);

  /* Built only when a removal actually needs adjudicating: resolving every
     bundle costs real time, and the common wiring-only run must not pay it. */
  let bundleCache = null;
  const getBundles = () => {
    if (bundleCache) return bundleCache;
    const entryPaths =
      entrypoints
      ?? (() => {
        const dir = path.resolve(root, DEFAULT_ENTRYPOINT_DIR);
        if (!fs.existsSync(dir)) return [];
        return fs.readdirSync(dir).filter((f) => f.endsWith('.css')).map((f) => path.join(dir, f));
      })();
    bundleCache = entryPaths.map((entry) => {
      const { files: orderedFiles } = bundleOrder(entry);
      const layerOf = new Map(orderedFiles.map((f) => [f.path, f.layer]));
      return {
        name: path.basename(entry),
        orderedFiles,
        layerOf,
        before: resolveWinners(orderedFiles, readBaselineFor),
        after: resolveWinners(orderedFiles, readWorkingFor),
      };
    });
    return bundleCache;
  };

  /* `<path-suffix>#<declaration>`, or a bare declaration offered to every file.
   * Consumption is counted so an allowance nothing used still fails below. */
  const allowances = allowNew.map((entry) => {
    const hash = entry.indexOf('#');
    return hash === -1
      ? { file: null, declaration: entry, consumed: 0 }
      : { file: entry.slice(0, hash), declaration: entry.slice(hash + 1), consumed: 0 };
  });

  const failures = [];
  const report = [];
  let channelsChecked = 0;

  for (const absolute of targets) {
    const repoPath = repoRelative(top, absolute);
    const before = baselineSource(root, baseline, repoPath);
    if (before === null) {
      report.push({ file: repoPath, skipped: 'absent at baseline' });
      continue;
    }
    const after = fs.readFileSync(absolute, 'utf8');

    /* Hoisted: computing the baseline read set inside the filter re-scanned the
       whole baseline once per candidate name, which turned a whole-tree run into
       minutes. */
    const baselineReads = channelReads(before);
    const added = [...channelReads(after)].filter((name) => !baselineReads.has(name));

    /* The byte comparison now runs unconditionally.
     *
     * It used to be reached only when the file ADDED a channel, so two whole
     * classes of change were reported as "no channel added" and exited green
     * without being inspected at all: a pure deletion wave, and a pure retune.
     * Both are precisely what this gate claims to rule out, and the second was
     * found by a drill in this file asserting the first. A file that changed at
     * all is now compared; only a file that normalises back to its baseline
     * passes without an argument. */
    const removed = removalsBetween(before, after, absolute);
    if (removed === null) {
      failures.push(`${repoPath}: could not be parsed on both sides, so nothing about it is certified`);
      continue;
    }
    channelsChecked += added.length;

    let collapsed;
    try {
      collapsed = normalise(collapseChannels(after, added));
    } catch (error) {
      failures.push(`${repoPath}: ${error.message}`);
      continue;
    }

    const expected = normalise(before);
    for (const allowance of allowances) {
      if (allowance.file && !repoPath.endsWith(allowance.file)) continue;
      const needle = `;${allowance.declaration}`;
      if (!collapsed.includes(needle)) continue;
      collapsed = collapsed.replace(needle, '');
      allowance.consumed += 1;
    }

    if (collapsed === expected) {
      report.push({ file: repoPath, added: added.length, channels: added, removed: 0 });
      continue;
    }

    /* The bytes differ. Before reporting that, find out whether the difference
       IS the removals and nothing else — `expectedAfterRemovals` is the
       baseline with exactly those declarations taken out, so matching it proves
       no other byte moved. Only then is each removal put to the winner test. */
    if (removed.length > 0) {
      const expectedAfterRemovals = baselineMinusRemovals(before, removed, absolute);
      if (expectedAfterRemovals !== null && collapsed === expectedAfterRemovals) {
        const objections = certifyRemovals({ removed, filePath: absolute, bundles: getBundles() });
        if (objections.length === 0) {
          report.push({
            file: repoPath, added: added.length, channels: added, removed: removed.length,
          });
          continue;
        }
        failures.push(
          `${repoPath}: ${removed.length} removal(s), ${objections.length} NOT certifiable as inert\n`
            + objections.map((o) => `    - ${o}`).join('\n'),
        );
        continue;
      }
    }

    const where = firstDivergence(expected, collapsed);
    failures.push(
      `${repoPath}: collapsing ${added.length} added channel(s) does NOT restore the baseline`
        + (removed.length > 0
          ? `\n    (${removed.length} removal(s) present, but the remaining bytes diverge beyond them)`
          : '')
        + `\n    first divergence at char ${where.index}\n`
        + `    baseline : ...${where.baseline}\n`
        + `    collapsed: ...${where.collapsed}`,
    );
  }

  for (const allowance of allowances) {
    if (allowance.consumed > 0) continue;
    failures.push(
      `allowNew "${allowance.file ? `${allowance.file}#` : ''}${allowance.declaration}" was never `
        + 'consumed — a stale allowance hides a real delta',
    );
  }

  if (failures.length > 0) {
    throw new Error(`Channel wiring is not zero-delta:\n- ${failures.join('\n- ')}`);
  }
  const removalsCertified = report.reduce((sum, row) => sum + (row.removed ?? 0), 0);
  if (!silent) {
    for (const row of report) {
      const inert = row.removed ? `, ${row.removed} removal(s) certified inert` : '';
      if (row.skipped) console.log(`SKIP ${row.file} (${row.skipped})`);
      else if (row.added === 0 && !row.removed) console.log(`OK   ${row.file} (no channel added)`);
      else if (row.added === 0) console.log(`OK   ${row.file} (${row.removed} removal(s) certified inert)`);
      else console.log(`OK   ${row.file} (${row.added}: ${row.channels.join(', ')}${inert})`);
    }
    console.log(
      `PASS channel-wiring-zero-delta baseline=${baseline} files=${targets.length} `
        + `channels=${channelsChecked} removals-certified=${removalsCertified}`,
    );
  }
  return { files: targets.length, channelsChecked, removalsCertified, report };
}

function parseArgs(argv) {
  const options = { allowNew: [] };
  for (const token of argv) {
    if (token === '--check') continue;
    else if (token.startsWith('--baseline=')) options.baseline = token.slice('--baseline='.length);
    else if (token.startsWith('--file=')) (options.files ??= []).push(path.resolve(token.slice('--file='.length)));
    else if (token.startsWith('--allow-new=')) options.allowNew.push(token.slice('--allow-new='.length));
    else if (token.startsWith('--entrypoint=')) (options.entrypoints ??= []).push(path.resolve(token.slice('--entrypoint='.length)));
  }
  return options;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    runChannelWiringZeroDeltaGate(parseArgs(process.argv.slice(2)));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
