import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tokenAuditDir } from '../../context/paths/index.mjs';
import { APCA_BODY_MIN, APCA_UI_MIN } from '../../counters/contrast/index.mjs';

/** Render the APCA evidence Markdown (written by --apca-report; also the shape
 * printed in report mode). */
function renderApcaMarkdown(apca) {
  const lines = [];
  lines.push('# APCA contrast pairings (WO-GAT-04)');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push(
    `Thresholds: body-text |Lc| >= ${APCA_BODY_MIN}; large-text/UI |Lc| >= ${APCA_UI_MIN}. ` +
      `Failures (below threshold): ${apca.failures}. Skipped (unresolvable, counted): ${apca.skipped}. ` +
      `Evaluated: ${apca.evaluated}.`
  );
  lines.push('');
  lines.push('| Palette | Pairing | Kind | Text | Bg | Lc | Floor | Status |');
  lines.push('| --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const r of apca.results) {
    lines.push(
      `| ${r.palette} | ${r.pair} | ${r.kind} | ${r.textColor ?? r.textToken} | ${r.bgColor ?? r.bgToken} | ${
        r.lc ?? '—'
      } | ${r.threshold} | ${r.status} |`
    );
  }
  lines.push('');
  return lines.join('\n');
}

/** `--apca-report`: write the contrast evidence beneath the engine-token audit owner. */
function writeContrastReport(apca) {
  const outDir = join(tokenAuditDir, 'contrast');
  const jsonPath = join(outDir, 'data/index.json');
  const mdPath = join(outDir, 'overview/index.md');
  mkdirSync(dirname(jsonPath), { recursive: true });
  mkdirSync(dirname(mdPath), { recursive: true });
  writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        thresholds: { body: APCA_BODY_MIN, ui: APCA_UI_MIN },
        ...apca,
      },
      null,
      2
    ) + '\n'
  );
  writeFileSync(mdPath, renderApcaMarkdown(apca));
  return { jsonPath, mdPath };
}

export { renderApcaMarkdown, writeContrastReport };
