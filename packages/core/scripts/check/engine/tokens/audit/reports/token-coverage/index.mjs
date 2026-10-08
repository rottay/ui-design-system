import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { stripScriptComments } from '../../../../../../libraries/comments/index.mjs';
import { componentsDir, root, tokenAuditDir } from '../../context/paths/index.mjs';
import { countColorLiteralsInText } from '../../counters/color/index.mjs';
import { countMotionLiteralsInText } from '../../counters/motion/index.mjs';

/* ============================================================================
   Token-coverage report (WO-GAT-02, proposal P-14): informational visibility into which
   --ds-* tokens each component file consumes vs. what it still hardcodes. NOT a blocking
   gate -- the blocking gates remain the modern-scoped counters above; this report covers ALL
   engines under packages/core/src/components/ for visibility, reusing the exact same literal-
   detection rules (`countMotionLiteralsInText`, `countColorLiteralsInText`) so its numbers can
   never drift from what the blocking counters themselves count.
   ============================================================================ */

/** Every `.ts`/`.tsx` component source file, across all engines, excluding tests/stories (same
 * exclusion convention as the other per-file walks in this script -- e.g.
 * `countFallbackParityViolations`). */
function collectCoverageFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...collectCoverageFiles(full));
      continue;
    }
    if (!/\.tsx?$/.test(full)) continue;
    const rel = full.replace(/\\/g, '/');
    if (/__tests__|\.(test|spec|stories)\./.test(rel)) continue;
    out.push(full);
  }
  return out;
}

const DS_TOKEN_RE = /var\(\s*(--ds-[a-zA-Z0-9-]+)/g;

/**
 * Build the WO-GAT-02 token-coverage report: for every component source file, the set of
 * `--ds-*` custom properties it consumes (`var(--ds-...)`) and the hardcoded literal counts
 * the existing motion/color counters find (cubic-bezier, raw duration, hex, rgba). Cheap enough
 * (~1,000 small source files) to compute on every `--check`/report run for the one-line
 * summary; `--coverage` mode additionally persists the full detail to disk.
 */
function buildTokenCoverage() {
  const coverageFiles = collectCoverageFiles(componentsDir);
  const allTokens = new Set();
  const fileReports = [];
  let literalsOutstandingTotal = 0;

  for (const file of coverageFiles) {
    const raw = readFileSync(file, 'utf8');
    const stripped = stripScriptComments(raw, file);
    const rel = file.slice(root.length + 1).replace(/\\/g, '/');

    const tokens = new Set();
    for (const m of raw.matchAll(DS_TOKEN_RE)) tokens.add(m[1]);
    for (const t of tokens) allTokens.add(t);

    const motionLit = countMotionLiteralsInText(raw, file);
    const colorLit = countColorLiteralsInText(stripped);
    const literalsTotal = motionLit.cubicBezier + motionLit.rawDuration + colorLit.hex + colorLit.rgba;
    literalsOutstandingTotal += literalsTotal;

    fileReports.push({
      file: rel,
      dsTokensConsumed: [...tokens].sort(),
      literals: {
        cubicBezier: motionLit.cubicBezier,
        rawDuration: motionLit.rawDuration,
        hex: colorLit.hex,
        rgba: colorLit.rgba,
        total: literalsTotal,
      },
    });
  }

  fileReports.sort((a, b) => a.file.localeCompare(b.file));

  return {
    generatedAt: new Date().toISOString(),
    filesScanned: fileReports.length,
    tokensConsumedUnique: allTokens.size,
    literalsOutstandingTotal,
    files: fileReports,
  };
}

/** Render the human-readable Markdown summary written by `--coverage` mode. */
function renderCoverageMarkdown(coverage) {
  const topLiterals = coverage.files
    .filter((f) => f.literals.total > 0)
    .slice()
    .sort((a, b) => b.literals.total - a.literals.total)
    .slice(0, 25);

  const lines = [];
  lines.push('# Token coverage report (WO-GAT-02)');
  lines.push('');
  lines.push(`Generated: ${coverage.generatedAt}`);
  lines.push('');
  lines.push('Informational only -- this report is NOT a blocking gate. The blocking gates remain the');
  lines.push('modern-scoped counters in `node scripts/check/engine/tokens/audit/index.mjs --check` (motion/color/etc).');
  lines.push('This report lists, per component source file across ALL engines, which `--ds-*` custom');
  lines.push('properties it consumes and how many hardcoded literals (motion/hex/rgba, using the exact');
  lines.push('same detection rules as the blocking counters) it still carries.');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Files scanned: ${coverage.filesScanned}`);
  lines.push(`- Unique \`--ds-*\` tokens consumed: ${coverage.tokensConsumedUnique}`);
  lines.push(`- Hardcoded literals outstanding: ${coverage.literalsOutstandingTotal}`);
  lines.push('');
  lines.push(`## Top ${topLiterals.length} files by outstanding literals`);
  lines.push('');
  lines.push('| File | cubic-bezier | raw duration | hex | rgba | total |');
  lines.push('| --- | --- | --- | --- | --- | --- |');
  for (const f of topLiterals) {
    lines.push(
      `| ${f.file} | ${f.literals.cubicBezier} | ${f.literals.rawDuration} | ${f.literals.hex} | ${f.literals.rgba} | ${f.literals.total} |`
    );
  }
  lines.push('');
  lines.push('Full per-file detail (including files with zero outstanding literals and their full');
  lines.push('consumed-token list) is in the sibling `token-coverage.json`.');
  lines.push('');
  return lines.join('\n');
}

/** Write the coverage projection beneath the engine-token audit owner. */
function writeCoverageArtifacts(coverage) {
  const coverageDir = join(tokenAuditDir, 'coverage');
  const jsonPath = join(coverageDir, 'data/index.json');
  const mdPath = join(coverageDir, 'overview/index.md');
  mkdirSync(dirname(jsonPath), { recursive: true });
  mkdirSync(dirname(mdPath), { recursive: true });
  writeFileSync(jsonPath, JSON.stringify(coverage, null, 2) + '\n');
  writeFileSync(mdPath, renderCoverageMarkdown(coverage));
  return { jsonPath, mdPath };
}

export {
  buildTokenCoverage,
  writeCoverageArtifacts,
};
