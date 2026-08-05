/**
 * Shared, dependency-free I/O primitives for every R1 harness tool that
 * writes a receipt: atomic writes, source/self hashing, server identity, and
 * output-directory hygiene.
 *
 * WHY THIS FILE EXISTS. `capture-lab.mjs` used to `writeFileSync` its receipt
 * directly at the end of the run: a crash between "compute the JSON" and "the
 * write finishes" leaves either nothing (fine) or a HALF-WRITTEN JSON file
 * that a downstream reader may parse as valid-but-truncated (not fine — a
 * corrupt receipt must never be mistaken for a real one). It also asserted no
 * verifiable link between a capture and the exact source/server state that
 * produced it: two runs an hour apart, one against stale code, were
 * indistinguishable in the receipt. This module exists so every tool that
 * emits evidence shares the SAME fail-closed answer to both problems, rather
 * than each harness inventing (or forgetting to invent) its own.
 *
 * Every function here is pure I/O plus hashing — no Playwright, no product
 * knowledge — so it is safe for a non-browser tool (the i18n receipt emitter)
 * to import the identical module a browser-driving tool uses.
 */

import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Repo-root derivation — PORTABILITY.
//
// The previous harness hardcoded `/Users/daniel/Developer/Rottay/ui-design-system`
// directly in an `import()` specifier. That breaks on any other checkout path
// (another engineer, another agent sandbox, CI). This walks up from the
// calling file's own location instead, which is invariant: this receipts/
// directory's depth under the repo root is an architectural fact of where the
// R1 evidence tree lives, not a fact about any one machine's home directory.
//
// It verifies each expected ancestor NAME while it climbs (not just the final
// depth) so a future physical move of this file fails LOUDLY, here, with a
// clear diagnostic — instead of silently resolving to the wrong root and
// hashing or serving from the wrong tree.
//
// MIGRATED 2026-08-05 (R1 outside-layout adjudication). These instruments used
// to live in R1/tools/, which was outside the evidence contract's roundLayout
// allowlist. The adjudicated remedy was a forward migration into R1/receipts/.
// The move was deliberately FLAT rather than into a receipts/tools/ subfolder:
// R1/receipts sits at the IDENTICAL depth to the old R1/tools, so every tool's
// fixed `path.resolve(HERE, '..', ...)` walk still resolves to packages/core
// untouched. A nested move would have added one level and forced an edit to
// overlay-causality-probe.mjs, which is FROZEN under
// receipts/cohort-1-instrument-freeze-handoff.json — editing it would have
// destroyed its FINAL_SHA. This ancestor guard is the ONLY source change the
// migration required; index 0 changed 'tools' -> 'receipts'.
// ---------------------------------------------------------------------------

const EXPECTED_ANCESTORS = [
  'receipts',
  'R1',
  'wo-cra-23',
  'quality-evidence',
  'test-artifacts',
  'core',
  'packages',
];

/**
 * @param {string} fromDir absolute directory of the calling tool (its `HERE`)
 */
export function deriveRepoRoot(fromDir) {
  let cursor = fromDir;
  // EXPECTED_ANCESTORS[0] ('tools') names `fromDir` itself; the loop below
  // climbs past it, so start the name-check at index 1.
  const actualBase = path.basename(cursor);
  if (actualBase !== EXPECTED_ANCESTORS[0]) {
    throw new Error(
      `deriveRepoRoot: expected the calling tool to live directly under a "${EXPECTED_ANCESTORS[0]}" ` +
      `directory, found "${actualBase}" at ${cursor}. This derivation is a fixed relative-depth walk, ` +
      `not a search — if this tool moved, update EXPECTED_ANCESTORS in receipt-io.mjs to match.`
    );
  }
  for (let i = 1; i < EXPECTED_ANCESTORS.length; i += 1) {
    cursor = path.dirname(cursor);
    const base = path.basename(cursor);
    if (base !== EXPECTED_ANCESTORS[i]) {
      throw new Error(
        `deriveRepoRoot: expected ancestor #${i} of the calling tool to be "${EXPECTED_ANCESTORS[i]}", ` +
        `found "${base}" at ${cursor}. Refusing to guess a repo root — fix EXPECTED_ANCESTORS or the tool's location.`
      );
    }
  }
  const repoRoot = path.dirname(cursor); // one more level up past 'packages'
  if (!existsSync(path.join(repoRoot, 'pnpm-workspace.yaml'))) {
    throw new Error(
      `deriveRepoRoot: climbed to ${repoRoot} but it has no pnpm-workspace.yaml — this does not look like ` +
      'the ui-design-system workspace root. Refusing to proceed with an unverified root.'
    );
  }
  return repoRoot;
}

// ---------------------------------------------------------------------------
// Playwright resolution — PORTABILITY.
//
// Resolved through Node's own module resolution (via `createRequire` rooted
// at the showroom package's OWN package.json), not a hand-assembled path.
// This is correct whether the dependency is hoisted to a workspace root,
// nested under packages/showroom/node_modules, or living in a pnpm
// content-addressed store — the exact case a literal path cannot express
// portably. `@playwright/test` re-exports `chromium`; the harness never talks
// to `playwright-core` directly, matching what the showroom package.json
// actually declares as its devDependency.
// ---------------------------------------------------------------------------

export async function resolvePlaywrightChromium(repoRoot) {
  const showroomPkgJson = path.join(repoRoot, 'packages', 'showroom', 'package.json');
  if (!existsSync(showroomPkgJson)) {
    throw new Error(`resolvePlaywrightChromium: no package.json at ${showroomPkgJson}`);
  }
  const { createRequire } = await import('node:module');
  const showroomRequire = createRequire(showroomPkgJson);
  const { pathToFileURL } = await import('node:url');

  // `require.resolve('@playwright/test')` follows the package's "require"
  // export condition (its CJS entry, `index.js`), NOT "import" (`index.mjs`).
  // `import()`-ing the CJS file directly is unreliable here: Node's CJS-named-
  // exports detection cannot always see a re-export like `chromium` through
  // whatever `index.js` does internally, which is exactly what happened on
  // Playwright 1.61 — the import succeeded but the module had no `chromium`
  // property. The package's OWN `exports["."].import` field is the correct,
  // version-agnostic answer for "what is this package's real ESM entry", so
  // that is read from `package.json` directly rather than assumed to be
  // `index.mjs` (which is what the harness this replaces hardcoded).
  let pkgJsonPath;
  try {
    pkgJsonPath = showroomRequire.resolve('@playwright/test/package.json');
  } catch (error) {
    throw new Error(
      `resolvePlaywrightChromium: could not resolve "@playwright/test/package.json" from ${showroomPkgJson} — ` +
      `is @playwright/test installed (pnpm install in packages/showroom)? Original error: ${error.message}`
    );
  }
  const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
  const pkgDir = path.dirname(pkgJsonPath);
  const exportsRoot = pkg.exports?.['.'];
  const attempted = [];
  const candidates = [];
  if (typeof exportsRoot === 'string') {
    candidates.push(path.join(pkgDir, exportsRoot));
  } else if (exportsRoot && typeof exportsRoot === 'object') {
    for (const key of ['import', 'module', 'default']) {
      const rel = typeof exportsRoot[key] === 'string' ? exportsRoot[key] : exportsRoot[key]?.default;
      if (rel) candidates.push(path.join(pkgDir, rel));
    }
  }
  // Last-resort fallback: the CJS entry itself, in case a future package
  // version's CJS build DOES expose named exports Node can statically detect.
  try {
    candidates.push(showroomRequire.resolve('@playwright/test'));
  } catch {
    /* already reported above if this also fails */
  }

  for (const candidate of candidates) {
    if (!existsSync(candidate)) {
      attempted.push({ path: candidate, error: 'file does not exist' });
      continue;
    }
    try {
      const mod = await import(pathToFileURL(candidate).href);
      if (mod.chromium) {
        return { chromium: mod.chromium, resolvedFrom: candidate };
      }
      attempted.push({ path: candidate, error: 'module has no "chromium" export' });
    } catch (error) {
      attempted.push({ path: candidate, error: error.message });
    }
  }
  throw new Error(
    `resolvePlaywrightChromium: could not obtain a "chromium" export from @playwright/test (package.json at ` +
    `${pkgJsonPath}). Attempted: ${JSON.stringify(attempted, null, 2)}`
  );
}

// ---------------------------------------------------------------------------
// Hashing
// ---------------------------------------------------------------------------

function walkFiles(rootDir) {
  const out = [];
  const stack = [rootDir];
  while (stack.length > 0) {
    const dir = stack.pop();
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue; // directory vanished mid-walk (concurrent edit) — skip, don't crash the walk
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) out.push(full);
    }
  }
  return out.sort();
}

/**
 * Full content hash of a directory tree: every file's sha256, plus one
 * combined digest over (relative path, digest) pairs so the whole tree
 * collapses to one comparable string. Used for trees small enough to hash by
 * CONTENT — this harness's own scene tree, not the whole design system.
 */
export function hashTree(rootDir) {
  if (!existsSync(rootDir)) {
    return { rootDir, exists: false, fileCount: 0, combinedSha256: null, entries: [] };
  }
  const files = walkFiles(rootDir);
  const combined = createHash('sha256');
  const entries = [];
  for (const file of files) {
    const rel = path.relative(rootDir, file).split(path.sep).join('/');
    const content = readFileSync(file);
    const digest = createHash('sha256').update(content).digest('hex');
    entries.push({ path: rel, sha256: digest, bytes: content.length });
    combined.update(rel);
    combined.update(digest);
  }
  return { rootDir, exists: true, fileCount: entries.length, combinedSha256: combined.digest('hex'), entries };
}

/**
 * Coarse (path, size, mtime) fingerprint over one or more directory trees —
 * NOT a content hash. This exists for trees too large to hash by content on
 * every run (the whole `foundation/tokens`, `ui`, `graphics` surface a
 * capture's rendered pixels transitively depend on) while still being able to
 * say, honestly, whether ANYTHING under them moved between two points in
 * time. It proves absence of drift, not identity of content — the receipt
 * that reports it says exactly that, not more.
 */
export function statFingerprint(rootDirs) {
  const combined = createHash('sha256');
  let fileCount = 0;
  const perRoot = [];
  for (const rootDir of rootDirs) {
    if (!existsSync(rootDir)) {
      perRoot.push({ rootDir, exists: false, fileCount: 0 });
      continue;
    }
    const files = walkFiles(rootDir);
    for (const file of files) {
      const rel = path.relative(rootDir, file).split(path.sep).join('/');
      const st = statSync(file);
      combined.update(`${rootDir}::${rel}::${st.size}::${st.mtimeMs}`);
    }
    perRoot.push({ rootDir, exists: true, fileCount: files.length });
    fileCount += files.length;
  }
  return { fileCount, combinedFingerprint: combined.digest('hex'), perRoot };
}

export function sha256File(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

/** Hashes the harness's own source files — "the harness's own hash." */
export function hashSelf(filePaths) {
  const combined = createHash('sha256');
  const entries = [];
  for (const filePath of filePaths) {
    const digest = sha256File(filePath);
    entries.push({ path: filePath, sha256: digest });
    combined.update(filePath);
    combined.update(digest);
  }
  return { combinedSha256: combined.digest('hex'), entries };
}

// ---------------------------------------------------------------------------
// Server / process identity
// ---------------------------------------------------------------------------

/**
 * Identifies the OS process bound to a TCP port via `lsof`, then reads its
 * wall-clock start time via `ps -o lstart=`. Two runs whose captures must be
 * comparable need to have hit the SAME server process the whole time — a
 * hot-reload restart mid-run (a different `lstart`, even under the same PID
 * if PIDs get reused, though `lsof` returning a new PID is the common case)
 * invalidates the comparison. Both `lsof` and `ps` are standard on macOS and
 * Linux; if neither is present this returns `found: false` with a reason
 * rather than throwing, so a receipt can record "could not verify" instead of
 * crashing before it can explain why.
 */
export function getPortProcessIdentity(port) {
  let pids;
  try {
    const out = execFileSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'], {
      encoding: 'utf8',
      timeout: 5000,
    });
    pids = out.split('\n').map((s) => s.trim()).filter(Boolean);
  } catch (error) {
    return { found: false, reason: `lsof failed or is unavailable: ${error.message}` };
  }
  if (pids.length === 0) {
    return { found: false, reason: `no process is listening on TCP:${port}` };
  }
  const pid = pids[0];
  const identity = { found: true, pid, allListeningPids: pids, port };
  if (pids.length > 1) {
    identity.note = `lsof reported ${pids.length} PIDs listening on :${port}; recording all, using the first (${pid}) as identity`;
  }
  try {
    identity.lstart = execFileSync('ps', ['-o', 'lstart=', '-p', pid], { encoding: 'utf8', timeout: 5000 }).trim();
  } catch (error) {
    identity.lstart = null;
    identity.lstartError = error.message;
  }
  try {
    const parsed = identity.lstart ? new Date(identity.lstart) : null;
    identity.lstartEpochMs = parsed && !Number.isNaN(parsed.getTime()) ? parsed.getTime() : null;
  } catch {
    identity.lstartEpochMs = null;
  }
  try {
    identity.command = execFileSync('ps', ['-o', 'command=', '-p', pid], { encoding: 'utf8', timeout: 5000 }).trim();
  } catch (error) {
    identity.command = null;
    identity.commandError = error.message;
  }
  return identity;
}

/** This harness process's own identity, for the same before/after comparison. */
export function getSelfProcessIdentity() {
  const pid = String(process.pid);
  let lstart = null;
  try {
    lstart = execFileSync('ps', ['-o', 'lstart=', '-p', pid], { encoding: 'utf8', timeout: 5000 }).trim();
  } catch {
    /* best effort */
  }
  return { pid: process.pid, lstart, nodeVersion: process.version, cwd: process.cwd() };
}

/**
 * Compares two identity snapshots taken at the start and end of a run.
 * Returns `{ stable: boolean, reasons: string[] }` — never throws, so the
 * caller can decide how to fail closed and still write a receipt explaining
 * exactly what drifted.
 */
export function compareIdentity(before, after, label) {
  const reasons = [];
  if (before.found !== after.found) {
    reasons.push(`${label}: presence changed (before found=${before.found}, after found=${after.found})`);
  } else if (before.found && after.found) {
    if (before.pid !== after.pid) {
      reasons.push(`${label}: PID changed (before=${before.pid}, after=${after.pid}) — the process was restarted`);
    }
    if (before.lstart && after.lstart && before.lstart !== after.lstart) {
      reasons.push(`${label}: process start time changed (before="${before.lstart}", after="${after.lstart}")`);
    }
  }
  return { stable: reasons.length === 0, reasons };
}

// ---------------------------------------------------------------------------
// Atomic, source-bound receipt write
// ---------------------------------------------------------------------------

/**
 * Writes JSON to a temp file in the SAME directory (so the rename is on one
 * filesystem and therefore atomic), fsyncs it, then renames it into place.
 * A reader can never observe a partially-written receipt: it either sees the
 * previous complete file or the new complete file, never a half-written one.
 */
export function atomicWriteJSON(filePath, data) {
  const dir = path.dirname(filePath);
  mkdirSync(dir, { recursive: true });
  const tmpPath = path.join(dir, `.${path.basename(filePath)}.tmp-${randomUUID()}`);
  const json = `${JSON.stringify(data, null, 2)}\n`;
  const fd = openSync(tmpPath, 'w');
  try {
    writeFileSync(fd, json);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  renameSync(tmpPath, filePath);
  return filePath;
}

// ---------------------------------------------------------------------------
// Output-directory hygiene — CLEAN POST-RUN.
// ---------------------------------------------------------------------------

/**
 * Before a run starts, decide what belongs to THIS run and quarantine
 * everything else instead of leaving it to mix silently into the new
 * manifest:
 *
 *  - a file whose name this run does NOT intend to (re)produce is moved into
 *    a timestamped `.stale-<epoch>/` sibling folder and listed, never
 *    silently deleted and never silently left in place;
 *  - a file whose name this run DOES intend to (re)produce is deleted now
 *    (not quarantined), so a capture that fails partway through this run
 *    cannot be masked by a stale SUCCESS sitting under the same filename from
 *    an earlier run.
 *
 * Nested directories are left untouched (never descended into or deleted) —
 * this only adjudicates flat capture files in `outDir` itself.
 */
export function quarantineStaleLeftovers(outDir, expectedFilenames) {
  if (!existsSync(outDir)) return { quarantined: [], preRemovedExpected: [], quarantineDir: null };
  const expected = new Set(expectedFilenames);
  const quarantined = [];
  const preRemovedExpected = [];
  let quarantineDir = null;
  for (const name of readdirSync(outDir)) {
    if (name.startsWith('.stale-')) continue; // never re-quarantine a previous quarantine
    const full = path.join(outDir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) continue;
    if (expected.has(name)) {
      unlinkSync(full);
      preRemovedExpected.push(name);
    } else {
      if (!quarantineDir) {
        quarantineDir = path.join(outDir, `.stale-${Date.now()}`);
        mkdirSync(quarantineDir, { recursive: true });
      }
      renameSync(full, path.join(quarantineDir, name));
      quarantined.push(name);
    }
  }
  return { quarantined, preRemovedExpected, quarantineDir };
}

/** Throws on the FIRST collision, by design — a silent overwrite is exactly the bug this guards against. */
export function makeLabelRegistry() {
  const seen = new Map(); // label -> filename, so a collision error can show both
  return {
    claim(label, filename) {
      if (seen.has(label)) {
        throw new Error(
          `LABEL COLLISION — "${label}" was already claimed by ${seen.get(label)}, now also claimed by ${filename}. ` +
          'Every captured mode must have a unique label; two modes must never collide into one artifact.'
        );
      }
      seen.set(label, filename);
    },
    size() {
      return seen.size;
    },
  };
}

// ---------------------------------------------------------------------------
// Process cleanup — no orphaned browser processes.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Absolute-path redaction — receipts must never carry a machine-specific
// filesystem path.
// ---------------------------------------------------------------------------

/**
 * `deriveRepoRoot` and friends resolve paths PROPERLY (through real
 * filesystem checks, never a hardcoded literal) — but "resolved properly"
 * and "safe to persist verbatim" are different questions. The repo root
 * itself, `process.cwd()`, and — critically — the dev server's OWN `ps`
 * command line (which the OS reports as the full absolute path it was
 * launched with) all surface an absolute, machine-specific path if written
 * through unmodified. This walks an already-assembled JSON-serializable
 * value and replaces every occurrence of each `needle` (longest first, so a
 * longer path is never left partially replaced by a shorter prefix match)
 * wherever it appears in ANY string — a field value, a stack trace, a `ps`
 * command line — in one centralized pass, run once immediately before a
 * receipt is written, rather than trusting every call site to have
 * individually relativized its own paths.
 */
export function redactAbsolutePaths(value, replacements) {
  const sorted = [...replacements]
    .filter(([needle]) => typeof needle === 'string' && needle.length > 0)
    .sort((a, b) => b[0].length - a[0].length);

  function redactString(input) {
    let out = input;
    for (const [needle, replacement] of sorted) {
      out = out.split(needle).join(replacement);
    }
    return out;
  }

  function walk(input) {
    if (typeof input === 'string') return redactString(input);
    if (Array.isArray(input)) return input.map(walk);
    if (input && typeof input === 'object') {
      const out = {};
      for (const [key, val] of Object.entries(input)) out[key] = walk(val);
      return out;
    }
    return input;
  }

  return walk(value);
}

/**
 * Best-effort signal handling so Ctrl-C / a supervisor SIGTERM closes the
 * launched browser instead of orphaning it. This is NOT a complete guarantee:
 * SIGKILL cannot be caught by any process on POSIX, so a `kill -9` on this
 * harness (or the host dying) can still orphan a Chromium child. That is a
 * platform limitation, not something this function can close, and the
 * receipt this harness writes says so rather than implying a stronger
 * guarantee than actually exists.
 */
export function registerBrowserCleanupOnSignal(getBrowser) {
  let cleaning = false;
  const cleanup = async (signal) => {
    if (cleaning) return;
    cleaning = true;
    process.stderr.write(`\n[capture-lab] received ${signal} — closing the browser before exit (SIGKILL cannot be caught; this is best-effort).\n`);
    try {
      const browser = getBrowser();
      if (browser && browser.isConnected()) await browser.close();
    } catch {
      /* best effort */
    }
    process.exit(130);
  };
  process.once('SIGINT', () => void cleanup('SIGINT'));
  process.once('SIGTERM', () => void cleanup('SIGTERM'));
}
