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
 * NOT a CI gate. This is a lane instrument, invoked against a specific wave by
 * whoever is doing the wiring; it is deliberately absent from
 * `ci-gates.manifest.mjs`.
 *
 * Usage:
 *   node scripts/channel-wiring-zero-delta-gate.mjs --check
 *   node scripts/channel-wiring-zero-delta-gate.mjs --check --baseline=9c8f1030c
 *   node scripts/channel-wiring-zero-delta-gate.mjs --check \
 *     --file=src/.../collection-workspace.css --allow-new=box-shadow:none
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

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

/**
 * @param {object}   options
 * @param {string}   [options.root]      package root (defaults to packages/core)
 * @param {string}   [options.baseline]  git ref the default must still match
 * @param {string[]} [options.files]     paths to check; defaults to the CSS the
 *                                       working tree changed since `baseline`
 * @param {string[]} [options.allowNew]  normalised declarations legitimately
 *                                       added with no prior expression
 * @param {boolean}  [options.silent]
 */
export function runChannelWiringZeroDeltaGate({
  root = DEFAULT_ROOT,
  baseline = DEFAULT_BASELINE,
  files,
  allowNew = [],
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
    if (added.length === 0) {
      report.push({ file: repoPath, added: 0 });
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
      report.push({ file: repoPath, added: added.length, channels: added });
      continue;
    }
    const where = firstDivergence(expected, collapsed);
    failures.push(
      `${repoPath}: collapsing ${added.length} added channel(s) does NOT restore the baseline\n`
        + `    first divergence at char ${where.index}\n`
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
  if (!silent) {
    for (const row of report) {
      if (row.skipped) console.log(`SKIP ${row.file} (${row.skipped})`);
      else if (row.added === 0) console.log(`OK   ${row.file} (no channel added)`);
      else console.log(`OK   ${row.file} (${row.added}: ${row.channels.join(', ')})`);
    }
    console.log(
      `PASS channel-wiring-zero-delta baseline=${baseline} files=${targets.length} channels=${channelsChecked}`,
    );
  }
  return { files: targets.length, channelsChecked, report };
}

function parseArgs(argv) {
  const options = { allowNew: [] };
  for (const token of argv) {
    if (token === '--check') continue;
    else if (token.startsWith('--baseline=')) options.baseline = token.slice('--baseline='.length);
    else if (token.startsWith('--file=')) (options.files ??= []).push(path.resolve(token.slice('--file='.length)));
    else if (token.startsWith('--allow-new=')) options.allowNew.push(token.slice('--allow-new='.length));
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
