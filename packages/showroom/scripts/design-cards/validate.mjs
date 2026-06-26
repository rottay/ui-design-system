/**
 * Anti-drift guard for the Claude Design card pipeline.
 *
 * Reads the generator's report.json and fails when a registry-listed component
 * lost its fixture (unless explicitly allowlisted) or when any harvest failed.
 * This keeps the registry, the COMPONENT_MAP fixtures, and the published cards
 * in lockstep: register a new primitive without a fixture and CI goes red.
 *
 *   node scripts/design-cards/validate.mjs
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const showroomDir = path.resolve(here, '../../');
const outDir = path.join(showroomDir, 'build/design-cards');
const reportPath = path.join(outDir, 'report.json');
const allowlistPath = path.join(here, 'no-fixture-allowlist.json');

function fail(message) {
  console.error(`[design-cards:validate] ✗ ${message}`);
  process.exit(1);
}

async function main() {
  if (!existsSync(reportPath)) {
    fail('report.json not found — run "pnpm design:cards" first.');
  }

  const report = JSON.parse(await readFile(reportPath, 'utf8'));
  const allowlist = new Set(JSON.parse(await readFile(allowlistPath, 'utf8')).slugs ?? []);

  const problems = [];

  if (report.failed > 0) {
    problems.push(`${report.failed} card(s) failed to harvest`);
  }

  const unexpectedMissing = (report.missingSlugs ?? []).filter((slug) => !allowlist.has(slug));
  if (unexpectedMissing.length) {
    problems.push(
      `registry components without a fixture (add a COMPONENT_MAP entry or allowlist): ${unexpectedMissing.join(', ')}`
    );
  }

  // Every produced card file must be non-trivially sized (no empty harvests).
  // Layout is components/<tier>/<slug>/index.html.
  const componentsDir = path.join(outDir, 'components');
  if (existsSync(componentsDir)) {
    const tiers = await readdir(componentsDir);
    for (const tier of tiers) {
      const tierDir = path.join(componentsDir, tier);
      if (!(await stat(tierDir)).isDirectory()) continue;
      const slugs = await readdir(tierDir);
      for (const slug of slugs) {
        const file = path.join(tierDir, slug, 'index.html');
        if (!existsSync(file)) {
          problems.push(`card ${tier}/${slug} is missing index.html`);
          continue;
        }
        const { size } = await stat(file);
        if (size < 600) {
          problems.push(`card ${tier}/${slug} looks empty (${size} bytes)`);
        }
      }
    }
  } else {
    problems.push('no components/ directory in build output');
  }

  if (problems.length) {
    problems.forEach((p) => console.error(`[design-cards:validate] ✗ ${p}`));
    process.exit(1);
  }

  console.log(
    `[design-cards:validate] ✓ ${report.ok} cards valid · ${report.missing} allowlisted no-fixture · 0 failures`
  );
}

main().catch((error) => {
  console.error('[design-cards:validate] fatal:', error);
  process.exit(1);
});
