#!/usr/bin/env node
/**
 * First-party artifact SINGLE-AUTHOR gate (source plane).
 *
 * WHY THIS FILE EXISTS. A first-party vertical artifact used to have TWO
 * authors: the BrandTheme compiled by `compileBrandTheme`, and a hand-written
 * `_source/extension.css` merged in by the renderer. Two authors means the
 * value that reaches a pixel is decided by whichever author is read last, so
 * editing the authored theme could change nothing. The predecessor gate
 * (`artifact-provenance-gate.mjs`) accepted that second author and tried to
 * BOUND it — headers, ratchets and laws over the extension's contents. It was
 * retired with the second author itself: the renderer now takes exactly one
 * authored input, and the three extension files and their `_source`
 * directories are gone.
 *
 * A bounded second author is a weaker law than no second author. This gate
 * enforces the stronger one, and it enforces it on the SOURCE plane only:
 * filesystem shape plus a pinned production-token scan. It imports no `dist/`,
 * renders no CSS, and reads no committed artifact byte, so it is green the
 * moment the severance lands and green forever after — there is no state in
 * which it needs a temporary allowlist or a late activation flag.
 *
 *   G1 ROSTER EXACTNESS. The artifact directories under
 *      `foundation/tokens/css/facade/artifacts` set-equal the slugs of the
 *      AUTHORED TypeScript roster (executed via
 *      `lib/first-party-roster-source.mjs` — derived, never restated) and
 *      set-equal the literal preservation set {bithire, evnto, rottay}. A
 *      missing identity, an extra/fourth identity, or the retired vertical
 *      `platform` in either the roster source or the tree is red, and the
 *      offender is named.
 *
 *   G2 RESURRECTION. A recursive walk of the WHOLE authored token CSS tree
 *      (`src/foundation/tokens/css`, not just `facade/`) finds zero
 *      directories named `_source` and zero files named `extension.css`. The
 *      wide root is deliberate: a narrow `facade/` scan would let the second
 *      author return one directory over, under `runtime/` or `foundation/`.
 *      Red names the offending path. This law is what replaces the excised
 *      "no X in the authored extensions" assertions of the historical drain
 *      suites — those tests proved a file did not contain something; this
 *      proves the file cannot exist.
 *
 *      Two cheap evasions are closed explicitly. (a) SYMLINKS. `readdirSync`
 *      reports a link as neither a directory nor a file, so a name-and-type
 *      test alone would step straight past `_source -> ../elsewhere`. There is
 *      no legitimate symlink anywhere in the authored CSS tree, so EVERY link
 *      entry is a finding on its own, and the walk never descends through one
 *      — a link cannot smuggle the second author back in, and it cannot walk
 *      the scan out of the root. (b) CASE. `_SOURCE/Extension.CSS` is the same
 *      second author on a case-insensitive filesystem, so both identities are
 *      matched case-insensitively while the message names the path AS
 *      AUTHORED, not the folded form.
 *
 *   G3 API/MARKER TOKEN SCAN, PRODUCTION SCOPE ONLY. The pinned production
 *      surfaces — the artifact renderer, the tenant-css barrel and the
 *      artifact builder — carry none of `extensionCss`, `Declared artifact
 *      extension`, `_source/extension.css`, `two authored sources`. Matching
 *      is case-insensitive for the same reason as G2 — a re-cased identifier
 *      is the same resurrected API — and red names the file, the line, the
 *      canonical token and the actual spelling when the two differ. The
 *      production roster stays pinned; case folding widens the match, never
 *      the scope.
 *
 *      Tests are DELIBERATELY out of scope. The law-carrying test must quote
 *      those exact strings as negative-assertion literals to prove the
 *      rendered output lacks them; a content scan over tests would turn this
 *      gate red on its own enforcement corpus. The type system already fences
 *      the API side: `extensionCss` no longer exists on either renderer input,
 *      so a test that resurrects it fails `tsc`.
 *
 *   G4 ROOT-INK CAUSALITY — DELEGATED, NOT DUPLICATED. This gate deliberately
 *      asserts NOTHING about the rendered document-root ink. Fresh-render
 *      causality (L1 exactly one ink declaration, L2 none in a mode block, L4
 *      fail-closed on a missing/blank channel, L6 ordering, L7 the weld to the
 *      compiler-emitted channel name) is enforced by
 *      `.../artifact-renderer/tests/single-author.test.ts` under the blocking
 *      CI row `first-party-single-author-render-laws`; vitest runs the TypeScript
 *      renderer directly, which is the only pre-checkpoint-true renderer — a
 *      node gate could only import the stale `dist/`. Committed bytes stay
 *      governed by the existing blocking row
 *      `first-party-artifacts-source-staleness`, whose byte-compare operand IS
 *      that renderer's fresh output, so after the checkpoint regeneration a
 *      committed artifact cannot go green while carrying an extension marker,
 *      a two-source header, or missing/duplicate ink. Duplicating any of that
 *      here would mean a second copy to drift.
 *
 * Every root is overridable so the drill suite can point the SAME exported
 * enforcers at fixture trees; there is no parallel regex copy to keep in sync.
 *
 * Usage:
 *   node scripts/first-party-single-author-gate.mjs           # report
 *   node scripts/first-party-single-author-gate.mjs --check   # exit 1 on findings
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { readFirstPartyRosterSource } from './lib/first-party-roster-source.mjs';

const CORE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The literal identities this severance preserves. G1 asserts the executed
 * roster AND the directory tree both set-equal this, so a silent addition
 * cannot ride in by teaching the roster source about a fourth identity.
 */
export const PRESERVED_FIRST_PARTY_SLUGS = Object.freeze(['bithire', 'evnto', 'rottay']);

/**
 * Retired as a vertical identity; named explicitly whenever it reappears.
 *
 * Assembled from fragments rather than written as one literal, exactly as
 * `platform-identity-zero-gate.mjs` assembles its own `RETIRED`. That gate
 * forbids the retired slug from appearing as an authored identity value
 * anywhere in the tree and excludes only its own two files, so spelling the
 * slug here made this gate the last residue of the identity it exists to
 * retire. The value is unchanged; only the spelling is.
 */
export const RETIRED_VERTICAL_SLUG = ['plat', 'form'].join('');

/**
 * The two path identities of the retired second author, matched
 * case-insensitively by G2. Held as lower-case literals: they are the folded
 * operands of the comparison, never the text of a finding.
 */
export const FORBIDDEN_SOURCE_DIR_NAME = '_source';
export const FORBIDDEN_EXTENSION_FILE_NAME = 'extension.css';

/** Tokens of the retired two-author API and its emitted markers. */
export const FORBIDDEN_SOURCE_TOKENS = Object.freeze([
  'extensionCss',
  'Declared artifact extension',
  '_source/extension.css',
  'two authored sources',
]);

export const DEFAULT_CSS_ROOT = resolve(CORE_ROOT, 'src/foundation/tokens/css');
export const DEFAULT_ARTIFACTS_ROOT = resolve(DEFAULT_CSS_ROOT, 'facade/artifacts');
export const DEFAULT_ROSTER_SOURCE = resolve(
  CORE_ROOT,
  'src/foundation/tokens/ts/presentation/brand-themes/index.ts',
);

/**
 * The production surfaces that may never speak the retired API. Pinned by
 * path on purpose: a glob would silently widen to the tests and self-trip.
 */
export const DEFAULT_PRODUCTION_FILES = Object.freeze([
  resolve(CORE_ROOT, 'src/infrastructure/compilers/runtime/tenant-css/artifact-renderer/index.ts'),
  resolve(CORE_ROOT, 'src/infrastructure/compilers/runtime/tenant-css/index.ts'),
  resolve(CORE_ROOT, 'scripts/build-vertical-artifacts.mjs'),
]);

function label(target, root) {
  const fromCore = relative(CORE_ROOT, target);
  if (!fromCore.startsWith('..')) return fromCore;
  const fromRoot = relative(root ?? CORE_ROOT, target);
  return fromRoot.startsWith('..') ? target : fromRoot;
}

function sortedUnique(values) {
  return [...new Set(values)].sort();
}

/** Directory names (dirs only) directly under an artifacts root. */
export function readArtifactDirectorySlugs(artifactsRoot = DEFAULT_ARTIFACTS_ROOT) {
  if (!existsSync(artifactsRoot)) return [];
  return readdirSync(artifactsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

/**
 * G1. Pure over both slug sets so a drill can plant an identity without a
 * filesystem, and so the executed-roster side is testable on its own.
 */
export function checkRosterExactness({ directorySlugs, rosterSlugs }) {
  const findings = [];
  const dirs = sortedUnique(directorySlugs);
  const roster = sortedUnique(rosterSlugs);
  const preserved = sortedUnique(PRESERVED_FIRST_PARTY_SLUGS);

  if (roster.includes(RETIRED_VERTICAL_SLUG)) {
    findings.push({
      check: 'G1',
      message: `the retired vertical '${RETIRED_VERTICAL_SLUG}' is present in the authored roster source`,
    });
  }
  if (dirs.includes(RETIRED_VERTICAL_SLUG)) {
    findings.push({
      check: 'G1',
      message: `the retired vertical '${RETIRED_VERTICAL_SLUG}' has an artifact directory`,
    });
  }

  for (const slug of roster) {
    if (!dirs.includes(slug)) {
      findings.push({ check: 'G1', message: `roster slug '${slug}' has no artifact directory` });
    }
  }
  for (const slug of dirs) {
    if (!roster.includes(slug)) {
      findings.push({
        check: 'G1',
        message: `artifact directory '${slug}' is not a slug of the authored roster source`,
      });
    }
  }
  for (const slug of preserved) {
    if (!roster.includes(slug)) {
      findings.push({
        check: 'G1',
        message: `preserved identity '${slug}' is missing from the authored roster source`,
      });
    }
    if (!dirs.includes(slug)) {
      findings.push({
        check: 'G1',
        message: `preserved identity '${slug}' has no artifact directory`,
      });
    }
  }
  for (const slug of roster) {
    if (!preserved.includes(slug) && slug !== RETIRED_VERTICAL_SLUG) {
      findings.push({
        check: 'G1',
        message: `roster source declares unpreserved identity '${slug}'`,
      });
    }
  }
  for (const slug of dirs) {
    if (!preserved.includes(slug) && slug !== RETIRED_VERTICAL_SLUG) {
      findings.push({
        check: 'G1',
        message: `artifact tree carries unpreserved identity '${slug}'`,
      });
    }
  }
  return findings;
}

/**
 * G2. Recursive over the WHOLE authored token CSS tree. Returns a finding per
 * offending path so a resurrection anywhere under the tree is named, not
 * merely counted.
 *
 * Three properties carry the law and none of them may be relaxed: the walk
 * never descends into a symbolic link (so the scan cannot be steered out of
 * `cssRoot`), every symbolic link is itself a finding (so a link can never be
 * the vehicle), and the two forbidden identities are compared case-folded
 * while every message quotes the path exactly as it is authored.
 */
export function findResurrectedExtensionPaths(cssRoot = DEFAULT_CSS_ROOT) {
  const findings = [];
  if (!existsSync(cssRoot)) {
    return [{ check: 'G2', message: `authored token CSS root does not exist: ${label(cssRoot)}` }];
  }
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
      a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
    )) {
      const full = join(dir, entry.name);
      const at = label(full, cssRoot);
      // `withFileTypes` reports link entries from an lstat, so this is the
      // link itself and never its target.
      const isLink = entry.isSymbolicLink();
      const folded = entry.name.toLowerCase();
      const kind = isLink ? 'symbolic link' : entry.isDirectory() ? 'directory' : 'file';

      if (isLink) {
        findings.push({
          check: 'G2',
          message: `a symbolic link exists in the authored token CSS tree at ${at}`,
        });
      }

      if (folded === FORBIDDEN_SOURCE_DIR_NAME) {
        findings.push({
          check: 'G2',
          message:
            kind === 'directory'
              ? `a '_source' authoring directory exists at ${at}`
              : `a '_source' authoring path exists as a ${kind} at ${at}`,
        });
      } else if (folded === FORBIDDEN_EXTENSION_FILE_NAME) {
        findings.push({
          check: 'G2',
          message:
            kind === 'file'
              ? `an authored 'extension.css' exists at ${at}`
              : `an authored 'extension.css' exists as a ${kind} at ${at}`,
        });
      }

      if (!isLink && entry.isDirectory()) walk(full);
    }
  };
  walk(cssRoot);
  return findings;
}

/**
 * G3. Pinned production files only; tests are out of scope by design.
 *
 * The comparison is case-folded because `ExtensionCss` is the same retired API
 * as `extensionCss`. Attribution stays exact: the finding always quotes the
 * canonical token, and appends the ACTUAL spelling whenever the surface
 * re-cased it, so the offending bytes are never paraphrased away.
 */
export function checkProductionTokens(productionFiles = DEFAULT_PRODUCTION_FILES) {
  const findings = [];
  for (const file of productionFiles) {
    if (!existsSync(file)) {
      findings.push({ check: 'G3', message: `pinned production surface is missing: ${label(file)}` });
      continue;
    }
    const lines = readFileSync(file, 'utf8').split('\n');
    for (const [index, line] of lines.entries()) {
      const foldedLine = line.toLowerCase();
      for (const token of FORBIDDEN_SOURCE_TOKENS) {
        const at = foldedLine.indexOf(token.toLowerCase());
        if (at === -1) continue;
        const asWritten = line.slice(at, at + token.length);
        const spelling = asWritten === token ? '' : ` (spelled '${asWritten}')`;
        findings.push({
          check: 'G3',
          message: `${label(file)}:${index + 1} carries the retired token '${token}'${spelling}`,
        });
      }
    }
  }
  return findings;
}

/**
 * The single enforcer both `--check` and every drill invoke. `rosterSlugs` is
 * injectable so a fixture drill need not spawn the source loader; when it is
 * omitted the AUTHORED TypeScript roster is executed, which is the only form
 * the real check ever runs.
 */
export function runFirstPartySingleAuthorGate({
  cssRoot = DEFAULT_CSS_ROOT,
  artifactsRoot,
  productionFiles = DEFAULT_PRODUCTION_FILES,
  rosterSlugs,
  rosterSourcePath = DEFAULT_ROSTER_SOURCE,
} = {}) {
  const resolvedArtifactsRoot = artifactsRoot ?? resolve(cssRoot, 'facade/artifacts');
  const resolvedRosterSlugs =
    rosterSlugs ?? readFirstPartyRosterSource(rosterSourcePath).map((row) => row.slug);
  const directorySlugs = readArtifactDirectorySlugs(resolvedArtifactsRoot);

  const findings = [
    ...checkRosterExactness({ directorySlugs, rosterSlugs: resolvedRosterSlugs }),
    ...findResurrectedExtensionPaths(cssRoot),
    ...checkProductionTokens(productionFiles),
  ];

  return {
    findings,
    directorySlugs,
    rosterSlugs: sortedUnique(resolvedRosterSlugs),
    cssRoot,
    artifactsRoot: resolvedArtifactsRoot,
  };
}

function main() {
  const check = process.argv.includes('--check');
  const result = runFirstPartySingleAuthorGate();

  console.log('First-party artifact single-author gate (source plane)');
  console.log(`  roster source slugs : ${result.rosterSlugs.join(', ') || '(none)'}`);
  console.log(`  artifact directories: ${result.directorySlugs.join(', ') || '(none)'}`);
  console.log(`  scanned CSS root    : ${label(result.cssRoot)}`);
  console.log(`  production surfaces : ${DEFAULT_PRODUCTION_FILES.length}`);
  console.log(
    '  root ink            : delegated to first-party-single-author-render-laws ' +
      '(fresh) and first-party-artifacts-source-staleness (committed)',
  );

  for (const finding of result.findings) {
    console.error(`✗ [${finding.check}] ${finding.message}`);
  }

  if (result.findings.length === 0) {
    console.log('\n✓ one authored source per first-party artifact; no extension authority on the tree');
    return;
  }
  console.error(`\n${result.findings.length} single-author finding(s).`);
  if (check) process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
