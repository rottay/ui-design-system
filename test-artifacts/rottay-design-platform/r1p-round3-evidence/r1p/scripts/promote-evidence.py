#!/usr/bin/env python3
"""R1-P evidence promotion: cra-17-pattern manifest + curated copy into
ui-design-system/test-artifacts/rottay-design-platform/r1p-round3-evidence/.
Run ONCE at wave close. Idempotent (re-copies + rewrites manifest)."""
import hashlib, json, os, shutil, sys, datetime

SRC = "/private/tmp/rottay-design-platform-independent-audit-round-3"
DST = "/Users/daniel/Developer/Rottay/ui-design-system/test-artifacts/rottay-design-platform/r1p-round3-evidence"

INCLUDE = [
    "SUMMARY.md", "methodology.md", "classification.md", "classification.json",
    "bithire-overlap.json", "evnto-overlap.json", "rottay-overlap.json",
    "source-to-runtime-trace.md", "audit-postmortem.md", "single-authority-protocol.md",
    "negative-drill-design.md", "verification-notes.md", "claims-extraction.md",
    "compiler-capability-map.md", "sweep-1-compilers-artifacts-app-hooks.md",
    "sweep-2-recipes-typography-density-motion.md", "sweep-3-root-attrs-i18n-layers.md",
    "official-doc-round3.diff",
]
INCLUDE_DIRS = ["scripts", "snapshots", "r1p"]
EXCLUDE_BASENAMES = {"classification-core.json", "effective-before.json"}

def sha256(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()

def main():
    entries = []
    if os.path.isdir(DST):
        shutil.rmtree(DST)
    os.makedirs(DST)
    def copy_one(rel):
        src = os.path.join(SRC, rel)
        dst = os.path.join(DST, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(src, dst)
        entries.append({"file": rel, "bytes": os.path.getsize(dst), "sha256": sha256(dst)})
    for rel in INCLUDE:
        copy_one(rel)
    for d in INCLUDE_DIRS:
        for root, _, files in os.walk(os.path.join(SRC, d)):
            for fn in sorted(files):
                if fn in EXCLUDE_BASENAMES:
                    continue
                rel = os.path.relpath(os.path.join(root, fn), SRC)
                copy_one(rel)
    manifest = {
        "schemaVersion": 1,
        "auditId": "r1p-round3-static-theme-provenance",
        "producer": "claude-r1p-wave",
        "producedOn": datetime.date.today().isoformat(),
        "note": "cra-17-pattern evidence, pending formal EvidenceManifest v1 spec "
                "(mechanism confirmed absent 2026-07-27; this follows the closest "
                "implemented convention: per-file sha256 manifest + targeted "
                ".gitignore allowlist). Commit is an owner action.",
        "sourceBundle": SRC,
        "fileCount": len(entries),
        "totalBytes": sum(e["bytes"] for e in entries),
        "files": entries,
    }
    with open(os.path.join(DST, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=1)
    print(f"promoted {len(entries)} files, {manifest['totalBytes']} bytes -> {DST}")
    gi = "/Users/daniel/Developer/Rottay/ui-design-system/.gitignore"
    lines = open(gi).read()
    needed = [
        "!test-artifacts/rottay-design-platform/",
        "test-artifacts/rottay-design-platform/*",
        "!test-artifacts/rottay-design-platform/r1p-round3-evidence/",
    ]
    missing = [l for l in needed if l not in lines.splitlines()]
    if missing:
        with open(gi, "a") as f:
            f.write("\n# R1-P round-3 audit evidence (allowlisted individually; rest of "
                    "rottay-design-platform stays ignored)\n")
            for l in missing:
                f.write(l + "\n")
        print(f"gitignore: appended {len(missing)} allowlist lines")
    else:
        print("gitignore: allowlist already present")

if __name__ == "__main__":
    main()
