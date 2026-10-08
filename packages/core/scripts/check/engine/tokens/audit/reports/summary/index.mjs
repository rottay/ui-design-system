import { APCA_BODY_MIN, APCA_PALETTES, APCA_UI_MIN } from '../../counters/contrast/index.mjs';
import { buildTokenCoverage } from '../token-coverage/index.mjs';

/** The counter listing plus the one-line coverage and APCA summaries shared by report and --check. */
function printSummary({ files, counters, apca, quiet }) {
  if (!quiet) {
    console.log('engine-token-audit — modern engine files:', files.length);
    for (const [k, v] of Object.entries(counters)) console.log(`  ${k}: ${v}`);
  }

  // WO-GAT-02: one-line token-coverage summary, appended to both report and --check output
  // (computed unconditionally so --check callers see it too; the coverage report itself is
  // informational and never gates -- see buildTokenCoverage()'s doc comment).
  const coverageSummary = buildTokenCoverage();
  if (!quiet) {
    console.log(
      `engine-token-audit — token coverage: ${coverageSummary.filesScanned} files scanned, ${coverageSummary.tokensConsumedUnique} unique --ds-* tokens consumed, ${coverageSummary.literalsOutstandingTotal} hardcoded literals outstanding`
    );
  }

  // WO-GAT-04: one-line APCA summary, appended to both report and --check output.
  if (!quiet) {
    console.log(
      `engine-token-audit — APCA contrast: ${apca.failures} pairings below threshold (body>=${APCA_BODY_MIN}/ui>=${APCA_UI_MIN}), ${apca.skipped} skipped (unresolvable), ${apca.evaluated} evaluated across ${APCA_PALETTES.length} palettes`
    );
  }
}

/** Report mode only: the APCA pairing table and the three theme.css selector inventories. */
function printReportDetail({ apca, themeCssAudit, classicThemeAudit, rusticThemeAudit }) {
  console.log('\nengine-token-audit — APCA pairing detail:');
  console.log('  palette   pairing                 kind  Lc     floor  status');
  for (const r of apca.results) {
    const lc = r.status === 'skip' ? '  skip' : String(r.lc).padStart(5);
    console.log(
      `  ${r.palette.padEnd(9)} ${r.pair.padEnd(23)} ${r.kind.padEnd(4)}  ${lc}  ${String(r.threshold).padStart(4)}   ${
        r.status
      }`
    );
  }

  console.log(`\nengine-token-audit — theme.css consumed-class set: ${themeCssAudit.consumedSize} tokens`);
  console.log(`engine-token-audit — theme.css unreferenced selectors (${themeCssAudit.unreferenced.length}):`);
  for (const u of themeCssAudit.unreferenced) {
    console.log(`  line ${u.line}: ${u.selector.replace(/\s+/g, ' ')}`);
  }
  console.log(
    `\nengine-token-audit — classic/theme.css: ${classicThemeAudit.consumedSize} consumed classes, ${classicThemeAudit.allowlisted} externally-consumed (ant-/anticon/slick-) allowlisted, ${classicThemeAudit.unreferencedSelectors} dead:`
  );
  for (const u of classicThemeAudit.unreferenced) {
    console.log(`  line ${u.line}: ${u.selector.replace(/\s+/g, ' ')}`);
  }
  console.log(
    `\nengine-token-audit — rustic/theme.css: ${rusticThemeAudit.consumedSize} consumed classes, ${rusticThemeAudit.unreferencedSelectors} dead:`
  );
  for (const u of rusticThemeAudit.unreferenced) {
    console.log(`  line ${u.line}: ${u.selector.replace(/\s+/g, ' ')}`);
  }
}

export { printSummary, printReportDetail };
