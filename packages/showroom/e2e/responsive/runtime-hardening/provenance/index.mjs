import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/** The raw Playwright report of a live capture; the capture itself dirties this path and no other. */
export const REPORT_RELATIVE =
  "test-artifacts/craft/cra-15/live-playwright-report.json";

const BUILD_KEYS = Object.freeze(["showroomBuildId", "coreDistSha256"]);

function git(repoRoot, args) {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function readShowroomBuildId(repoRoot) {
  const path = join(repoRoot, "packages", "showroom", ".next", "BUILD_ID");
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf8").trim() || null;
}

function listFiles(root) {
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(root, join(entry.parentPath, entry.name)))
    .sort();
}

function digestTree(root) {
  if (!existsSync(root)) return null;
  const files = listFiles(root);
  if (files.length === 0) return null;
  const digest = createHash("sha256");
  for (const file of files) {
    digest.update(`${file}\0`);
    digest.update(
      createHash("sha256")
        .update(readFileSync(join(root, file)))
        .digest()
    );
  }
  return digest.digest("hex");
}

/**
 * Identity of the build under measurement: the showroom BUILD_ID and a content digest of core dist.
 * A value is null when that output does not exist, and a null never satisfies the binding.
 */
export function readBuildIdentity(repoRoot) {
  return {
    showroomBuildId: readShowroomBuildId(repoRoot),
    coreDistSha256: digestTree(join(repoRoot, "packages", "core", "dist")),
  };
}

/**
 * Compares a recorded `buildBinding` with the build being assembled and returns the mismatch, or null.
 * The comparison is exact: a partial from before the binding existed has none, and so never matches.
 */
export function partialBindingError(name, partial, build) {
  const recorded = partial?.buildBinding;
  if (!recorded) return `${name} carries no build binding`;
  for (const key of BUILD_KEYS) {
    if (!build[key]) return `the current build has no ${key}`;
    if (recorded[key] !== build[key])
      return `${name} measured ${key} ${JSON.stringify(
        recorded[key]
      )}, the current build is ${build[key]}`;
  }
  return null;
}

/**
 * The showroom bundles core dist when it builds, so a dist newer than BUILD_ID is not what the probes
 * ran. Equal hashes cannot show this: both sides would read the same outdated pair.
 */
export function buildOrderError(repoRoot) {
  const dist = join(repoRoot, "packages", "core", "dist");
  const builtAt = statSync(
    join(repoRoot, "packages", "showroom", ".next", "BUILD_ID")
  ).mtimeMs;
  const newer = listFiles(dist).filter(
    (file) => statSync(join(dist, file)).mtimeMs > builtAt
  );
  return newer.length === 0
    ? null
    : `${newer.length} core dist file(s) are newer than the showroom BUILD_ID, e.g. ${newer[0]}`;
}

/** Every path Git reports as changed or untracked. Throws when Git cannot answer, so an unknown tree is never clean. */
export function listDirtyPaths(repoRoot) {
  return git(repoRoot, [
    "status",
    "--porcelain=v1",
    "-z",
    "--untracked-files=all",
    "--no-renames",
  ])
    .split("\0")
    .filter(Boolean)
    .map((record) => record.slice(3))
    .sort();
}

/**
 * States what was built. `dirtyPaths` keeps every real row, and only REPORT_RELATIVE, the capture's
 * own output, may be among them while `workingTreeClean` stays true.
 */
export function treeProvenance(repoRoot, build) {
  const dirtyPaths = listDirtyPaths(repoRoot);
  return {
    headCommit: git(repoRoot, ["rev-parse", "HEAD"]).trim(),
    workingTreeClean: dirtyPaths.every((path) => path === REPORT_RELATIVE),
    uncommittedFiles: dirtyPaths.length,
    dirtyPaths,
    ...build,
  };
}
