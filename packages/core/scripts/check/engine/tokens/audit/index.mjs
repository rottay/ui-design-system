#!/usr/bin/env node
/**
 * engine-token-audit — the modern-engine motion/token ratchet (WO-ENG-01..12 gate).
 *
 * Counts the motion + token literals the Quiet Premium spec (engines/modern/README.md
 * section 12) drives to zero, and enforces a DECREASE-ONLY ratchet: no counter may rise above
 * its recorded baseline. WO-ENG-01 seeds the motion counters, WO-ENG-03 the depth counters,
 * WO-ENG-07 the scale counters (radius-scale-declarations, fallback-parity), WO-ENG-04 the
 * interaction-state counters (dark-focus-ring-defects, inline-state-literals), WO-ENG-06 the
 * color-purity counters (modernHexLiterals, modernRgbaLiterals), WO-ENG-08 the theme.css
 * drain counter (unreferencedSelectors), WO-ENG-09 the content-integrity counter
 * (content.magicZIndex), WO-ENG-10 the cross-engine layout counter; later WOs extend this
 * file with the remaining section-12 counters (responsive).
 *
 * WO-GAT-02 (package-side quality gates, proposal P-14) extends this same file rather than
 * forking a second script: (1) generalizes WO-ENG-08's modern-only theme.css dead-selector scan
 * into a shared `auditEngineTheme()` helper reused by two new decrease-only counters,
 * `themeCss.deadSelectorsClassic` and `themeCss.deadSelectorsRustic`, over the classic/rustic
 * engine theme files (classic allowlists `.ant-*` Ant Design runtime classes by prefix -- see
 * `auditEngineTheme`'s doc comment); (2) adds a `--coverage` mode/report (informational, not
 * gated) listing per-component-file `--ds-*` token consumption vs. hardcoded literals, plus a
 * one-line summary appended to `--check`/report output.
 *
 * Usage:
 *   node scripts/check/engine/tokens/audit/index.mjs            # print the current counts
 *   node scripts/check/engine/tokens/audit/index.mjs --check    # exit 1 if any counter rose above baseline
 *   node scripts/check/engine/tokens/audit/index.mjs --update-baseline   # tighten existing ceilings only
 *   node scripts/check/engine/tokens/audit/index.mjs --coverage # write the token-coverage report (informational)
 *   node scripts/check/engine/tokens/audit/index.mjs --current-json # emit current counters for reviewed tooling
 *   node scripts/check/engine/tokens/audit/index.mjs --check --quiet     # concise CI output
 */
import { argumentValue, quiet } from './context/arguments/index.mjs';
import { hardcodeFixtureActive } from './context/fixtures/index.mjs';
import { collectAuditState } from './collection/index.mjs';
import { describeApcaOutcome } from './counters/contrast/index.mjs';
import { runBaselineUpdate, runCheck } from './ratchet/index.mjs';
import { writeContrastReport } from './reports/contrast/index.mjs';
import { buildTokenCoverage, writeCoverageArtifacts } from './reports/token-coverage/index.mjs';
import { printReportDetail, printSummary } from './reports/summary/index.mjs';

const { files, counters, themeCssAudit, classicThemeAudit, rusticThemeAudit, apca, evasionProbe } =
  collectAuditState();

const mode = process.argv.includes('--current-json')
  ? 'current-json'
  : process.argv.includes('--check')
  ? 'check'
  : process.argv.includes('--update-baseline')
  ? 'update'
  : process.argv.includes('--coverage')
  ? 'coverage'
  : process.argv.includes('--apca-report')
  ? 'apca-report'
  : 'report';

if (mode === 'update') {
  runBaselineUpdate({
    counters,
    fixtureActive: Boolean(argumentValue('--gat07-evasion-fixture') || hardcodeFixtureActive),
  });
}

if (mode === 'coverage') {
  const coverage = buildTokenCoverage();
  const { jsonPath, mdPath } = writeCoverageArtifacts(coverage);
  console.log('engine-token-audit --coverage: wrote');
  console.log(`  ${jsonPath}`);
  console.log(`  ${mdPath}`);
  console.log(
    `engine-token-audit — token coverage: ${coverage.filesScanned} files scanned, ${coverage.tokensConsumedUnique} unique --ds-* tokens consumed, ${coverage.literalsOutstandingTotal} hardcoded literals outstanding`
  );
  process.exit(0);
}

if (mode === 'apca-report') {
  const { jsonPath, mdPath } = writeContrastReport(apca);
  console.log('engine-token-audit --apca-report: wrote');
  console.log(`  ${jsonPath}`);
  console.log(`  ${mdPath}`);
  console.log(`engine-token-audit — APCA pairings: ${describeApcaOutcome(apca)}`);
  process.exit(0);
}

if (mode === 'current-json') {
  process.stdout.write(`${JSON.stringify(counters, null, 2)}\n`);
  // Let Node drain stdout naturally. An immediate process.exit() truncates
  // piped JSON at the platform's 64 KiB high-water mark, which made the
  // path-relocation tool parse an incomplete object once the corpus grew.
  process.exitCode = 0;
}

printSummary({ files, counters, apca, quiet });

if (mode === 'report') {
  printReportDetail({ apca, themeCssAudit, classicThemeAudit, rusticThemeAudit });
}

if (mode === 'check') {
  runCheck({ counters, evasionProbe });
}

// collectSkinFiles lives in libraries/engine/skins/files (one walker, importable
// without executing this module's top-level census). Re-exported for compat.
export { collectSkinFiles } from '../../../../libraries/engine/skins/files/index.mjs';
