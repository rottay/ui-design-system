import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildOrderError,
  partialBindingError,
  readBuildIdentity,
  REPORT_RELATIVE,
  treeProvenance,
} from "../responsive/runtime-hardening/provenance/index.mjs";

const SEALED_REPORT = "test-artifacts/craft/cra-15/playwright-report.json";
const OWNER = new URL("../responsive/runtime-hardening/", import.meta.url);
const ASSEMBLER = new URL("assembler/index.mjs", OWNER);
const assembler = readFileSync(ASSEMBLER, "utf8");
const recorder = readFileSync(new URL("measurements/index.ts", OWNER), "utf8");
const BUILD = { showroomBuildId: "build-a", coreDistSha256: "a".repeat(64) };

function write(root, path, content = "x\n") {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), content);
}

function withTemp(run) {
  const root = mkdtempSync(join(tmpdir(), "cra15-provenance-"));
  try {
    return run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function withRepository(run) {
  return withTemp((root) => {
    const git = (...args) =>
      execFileSync(
        "git",
        ["-c", "user.name=t", "-c", "user.email=t@t", ...args],
        { cwd: root, stdio: "ignore" }
      );
    git("init", "-q");
    write(root, "tracked.txt");
    write(root, SEALED_REPORT, "{}\n");
    git("add", ".");
    git("commit", "-q", "-m", "seed");
    return run(root, git);
  });
}

test("the assembler parses, since it runs on import and no test can load it", () => {
  execFileSync(process.execPath, ["--check", fileURLToPath(ASSEMBLER)], {
    stdio: "pipe",
  });
});

test("the live report path is the assembler's, and the sealed report is not", () => {
  assert.equal(
    REPORT_RELATIVE,
    "test-artifacts/craft/cra-15/live-playwright-report.json"
  );
  assert.equal(assembler.includes(SEALED_REPORT), false);
  assert.match(assembler, /join\(REPO_ROOT, REPORT_RELATIVE\)/u);
  assert.match(assembler, /path: REPORT_RELATIVE,/u);
});

test("a clean tree is clean and lists nothing", () => {
  withRepository((root) => {
    const tree = treeProvenance(root, BUILD);
    assert.equal(tree.workingTreeClean, true);
    assert.deepEqual(tree.dirtyPaths, []);
    assert.equal(tree.uncommittedFiles, 0);
    assert.match(tree.headCommit, /^[a-f0-9]{40}$/u);
  });
});

test("the live report alone leaves the tree clean and is still listed", () => {
  withRepository((root) => {
    write(root, REPORT_RELATIVE, "{}\n");
    const tree = treeProvenance(root, BUILD);
    assert.equal(tree.workingTreeClean, true);
    assert.deepEqual(tree.dirtyPaths, [REPORT_RELATIVE]);
    assert.equal(tree.uncommittedFiles, 1);
  });
});

test("any other dirty path keeps the tree unclean and is listed exactly", async (t) => {
  const cases = [
    [
      "a modified tracked file, whose row starts with a space",
      (root) => write(root, "tracked.txt", "changed\n"),
      ["tracked.txt"],
    ],
    [
      "the sealed report",
      (root) => write(root, SEALED_REPORT, "changed\n"),
      [SEALED_REPORT],
    ],
    [
      "an untracked file in a new folder",
      (root) => write(root, "new/nested/file.txt"),
      ["new/nested/file.txt"],
    ],
    [
      "a path Git would quote",
      (root) => write(root, 'with space "q".txt'),
      ['with space "q".txt'],
    ],
    [
      "a staged rename",
      (root, git) => {
        renameSync(join(root, "tracked.txt"), join(root, "moved.txt"));
        git("add", "-A");
      },
      ["moved.txt", "tracked.txt"],
    ],
  ];
  for (const [name, dirty, expected] of cases) {
    await t.test(name, () => {
      withRepository((root, git) => {
        dirty(root, git);
        const tree = treeProvenance(root, BUILD);
        assert.equal(tree.workingTreeClean, false);
        assert.deepEqual(tree.dirtyPaths, expected);
      });
      withRepository((root, git) => {
        dirty(root, git);
        write(root, REPORT_RELATIVE, "{}\n");
        const tree = treeProvenance(root, BUILD);
        assert.equal(tree.workingTreeClean, false);
        assert.deepEqual(
          tree.dirtyPaths,
          [...expected, REPORT_RELATIVE].sort()
        );
      });
    });
  }
});

test("a tree Git cannot describe is an error, not a clean tree", () => {
  withTemp((root) => {
    assert.throws(() => treeProvenance(root, BUILD));
  });
});

test("cleanBuild is the tree's answer and the W3 prose is gone", () => {
  assert.match(assembler, /cleanBuild: tree\.workingTreeClean,/u);
  assert.doesNotMatch(assembler, /cleanBuild: true/u);
  assert.doesNotMatch(assembler, /W3|motion-adoption/u);
});

test("the build identity follows the content of both outputs", () => {
  withTemp((root) => {
    assert.deepEqual(readBuildIdentity(root), {
      showroomBuildId: null,
      coreDistSha256: null,
    });

    mkdirSync(join(root, "packages/core/dist"), { recursive: true });
    assert.equal(readBuildIdentity(root).coreDistSha256, null);

    write(root, "packages/showroom/.next/BUILD_ID", "build-a\n");
    write(root, "packages/core/dist/index.js", "a\n");
    write(root, "packages/core/dist/nested/chunk.js", "b\n");
    const first = readBuildIdentity(root);
    assert.equal(first.showroomBuildId, "build-a");
    assert.match(first.coreDistSha256, /^[a-f0-9]{64}$/u);
    assert.deepEqual(readBuildIdentity(root), first);

    write(root, "packages/core/dist/nested/chunk.js", "c\n");
    const edited = readBuildIdentity(root);
    assert.notEqual(edited.coreDistSha256, first.coreDistSha256);

    renameSync(
      join(root, "packages/core/dist/nested/chunk.js"),
      join(root, "packages/core/dist/nested/moved.js")
    );
    assert.notEqual(
      readBuildIdentity(root).coreDistSha256,
      edited.coreDistSha256
    );

    write(root, "packages/showroom/.next/BUILD_ID", "build-b\n");
    assert.equal(readBuildIdentity(root).showroomBuildId, "build-b");
  });
});

test("a partial is admitted only by an exact match with the current build", async (t) => {
  assert.equal(
    partialBindingError("p", { buildBinding: { ...BUILD } }, BUILD),
    null
  );
  const refused = [
    ["recorded before the binding existed", { maxDpr: 2 }, BUILD, /no build/u],
    ["no partial", undefined, BUILD, /no build/u],
    [
      "another BUILD_ID",
      { buildBinding: { ...BUILD, showroomBuildId: "build-b" } },
      BUILD,
      /showroomBuildId/u,
    ],
    [
      "another core dist",
      { buildBinding: { ...BUILD, coreDistSha256: "b".repeat(64) } },
      BUILD,
      /coreDistSha256/u,
    ],
    [
      "half a binding",
      { buildBinding: { showroomBuildId: BUILD.showroomBuildId } },
      BUILD,
      /coreDistSha256/u,
    ],
    [
      "null on both sides",
      { buildBinding: { ...BUILD, coreDistSha256: null } },
      { ...BUILD, coreDistSha256: null },
      /has no coreDistSha256/u,
    ],
  ];
  for (const [name, partial, build, reason] of refused) {
    await t.test(name, () => {
      assert.match(partialBindingError("p", partial, build) ?? "", reason);
    });
  }
});

test("a core dist newer than the showroom build is refused", () => {
  withTemp((root) => {
    const buildId = "packages/showroom/.next/BUILD_ID";
    const file = "packages/core/dist/nested/chunk.js";
    write(root, file);
    write(root, buildId, "build-a\n");
    const stamp = (path, seconds) =>
      utimesSync(join(root, path), seconds, seconds);

    stamp(file, 1_000);
    stamp(buildId, 1_000);
    assert.equal(buildOrderError(root), null);

    stamp(buildId, 2_000);
    assert.equal(buildOrderError(root), null);

    stamp(file, 3_000);
    assert.match(buildOrderError(root) ?? "", /newer than the showroom/u);
    assert.match(buildOrderError(root) ?? "", /nested\/chunk\.js/u);
  });
});

test("the assembler checks every read against one build and keeps .run", () => {
  assert.match(
    assembler,
    /return requireBound\(name, JSON\.parse\(readFileSync\(file, "utf8"\)\), build\);/u
  );
  assert.match(
    assembler,
    /"the build after the gzip closures",\s+\{ buildBinding: readBuildIdentity\(REPO_ROOT\) \},\s+measuredBuild\s+\);/u
  );
  assert.match(
    assembler,
    /= buildOrderError\(REPO_ROOT\);\n\s+if \(outdated\)/u
  );
  assert.match(assembler, /treeProvenance\(REPO_ROOT, measuredBuild\)/u);
  assert.match(assembler, /^ +tree,$/mu);
  assert.doesNotMatch(assembler, /rmSync|unlinkSync/u);
});

test("the recorder stamps the binding where the assembler reads it", () => {
  const rootOf = (source) =>
    /resolve\(HERE, (["'])([./]+)\1\)/u.exec(source)?.[2];
  assert.equal(rootOf(recorder), rootOf(assembler));
  assert.match(recorder, /buildBinding: readBuildIdentity\(REPOSITORY_ROOT\)/u);

  const reads = [
    ...assembler.matchAll(/readPartial\(\s*"[^"]+"(,\s*measuredBuild)?\s*\)/gu),
  ];
  assert.equal(reads.length, 10);
  assert.equal(
    reads.every(([, bound]) => bound),
    true
  );
});
