/**
 * Design-cards generator.
 *
 * Boots the showroom Next server, reads the registry-driven card manifest, and
 * harvests one chrome-free preview per component into a self-contained Claude
 * Design card under packages/showroom/build/design-cards/.
 *
 * The output directory is the localDir handed to DesignSync.finalize_plan.
 *
 *   node scripts/design-cards/generate.mjs
 */

import { spawn } from 'node:child_process';
import { mkdir, writeFile, copyFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCardHtml, buildIndexHtml, groupLabelFor } from './template.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const showroomDir = path.resolve(here, '../../');
const repoRoot = path.resolve(showroomDir, '../../');
const outDir = path.join(showroomDir, 'build/design-cards');
const cssSrc = path.join(repoRoot, 'packages/core/dist/styles.css');

const PORT = process.env.DS_CARD_PORT || '7123';
const BASE = `http://127.0.0.1:${PORT}`;
const READY_TIMEOUT_MS = Number(process.env.DS_CARD_READY_TIMEOUT || 240000);

function log(...args) {
  console.log('[design-cards]', ...args);
}

async function waitForServer(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // server still booting
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error(`Next server not ready after ${timeoutMs}ms at ${url}`);
}

/** Slice the harvested DOM between the sentinel spans rendered by CardClient. */
function extractBody(html) {
  const startIdx = html.indexOf('id="ds-card-start"');
  if (startIdx === -1) return null;
  // Skip past the self-closed start sentinel: <span id="ds-card-start" ...></span>
  const startClose = html.indexOf('</span>', startIdx);
  if (startClose === -1) return null;
  const contentStart = startClose + '</span>'.length;
  const endIdx = html.indexOf('id="ds-card-end"', contentStart);
  if (endIdx === -1) return null;
  // Walk back to the opening "<" of the end sentinel's tag.
  const endTagStart = html.lastIndexOf('<', endIdx);
  return html
    .slice(contentStart, endTagStart)
    .replace(/^(?:<!--\/?\$-->)+/, '')
    .replace(/(?:<!--\/?\$-->)+$/, '')
    .trim();
}

async function main() {
  if (!existsSync(cssSrc)) {
    throw new Error(`Missing DS CSS bundle at ${cssSrc} — run "pnpm --filter @rottay/design-system build" first.`);
  }

  if (existsSync(outDir)) await rm(outDir, { recursive: true, force: true });
  await mkdir(path.join(outDir, 'components'), { recursive: true });
  await mkdir(path.join(outDir, '_assets'), { recursive: true });
  await copyFile(cssSrc, path.join(outDir, '_assets', 'ds.css'));

  log(`starting next dev on :${PORT} (first compile can take a minute)`);
  const server = spawn(
    path.join(showroomDir, 'node_modules/.bin/next'),
    ['dev', '--webpack', '--port', PORT],
    { cwd: showroomDir, env: { ...process.env }, stdio: 'ignore' }
  );
  let serverExited = false;
  server.on('exit', () => {
    serverExited = true;
  });

  const summary = { ok: 0, missing: 0, failed: 0, missingSlugs: [] };
  const produced = [];

  try {
    await waitForServer(`${BASE}/design-cards/manifest`, READY_TIMEOUT_MS);
    const manifest = await (await fetch(`${BASE}/design-cards/manifest`)).json();
    log(`manifest: ${manifest.count} cards from ${manifest.generatedFrom}`);

    for (const card of manifest.cards) {
      const url = `${BASE}/design-cards/${card.tier}/${card.slug}`;
      try {
        const html = await (await fetch(url)).text();
        const body = extractBody(html);
        if (!body || body.includes('data-missing="true"')) {
          summary.missing += 1;
          summary.missingSlugs.push(card.slug);
          continue;
        }
        const cardId = `${card.tier}-${card.slug}`;
        const cardHtml = buildCardHtml({
          group: card.group,
          name: card.name,
          subtitle: card.description,
          cardId,
          bodyHtml: body,
          cssHref: '../../../_assets/ds.css',
        });
        const dir = path.join(outDir, 'components', card.tier, card.slug);
        await mkdir(dir, { recursive: true });
        await writeFile(path.join(dir, 'index.html'), cardHtml, 'utf8');
        produced.push({
          slug: card.slug,
          cardId,
          name: card.name,
          group: card.group,
          tier: card.tier,
          tierLabel: card.tierLabel ?? card.tier,
        });
        summary.ok += 1;
      } catch (error) {
        summary.failed += 1;
        log(`  ✗ ${card.slug}: ${error.message}`);
      }
    }
  } finally {
    if (!serverExited) server.kill('SIGTERM');
  }

  // Local browsing gallery: menu by tier + category, grid of all cards.
  const tierOrder = { Primitives: 0, Patterns: 1, Structures: 2, Surfaces: 3 };
  const slugify = (value) =>
    String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const groupMap = new Map();
  for (const item of produced) {
    const key = `${item.tierLabel}::${item.group}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, { tierLabel: item.tierLabel, group: item.group, items: [] });
    }
    groupMap.get(key).items.push(item);
  }
  const groups = [...groupMap.values()].map((entry) => ({
    key: slugify(`${entry.tierLabel}-${entry.group}`),
    label: entry.group,
    tierLabel: entry.tierLabel,
    items: entry.items.sort((a, b) => a.name.localeCompare(b.name)),
  }));
  groups.sort((a, b) => {
    const tierDiff = (tierOrder[a.tierLabel] ?? 9) - (tierOrder[b.tierLabel] ?? 9);
    return tierDiff !== 0 ? tierDiff : a.label.localeCompare(b.label);
  });
  await writeFile(
    path.join(outDir, 'index.html'),
    buildIndexHtml({ groups, total: produced.length }),
    'utf8'
  );

  await writeFile(
    path.join(outDir, 'report.json'),
    JSON.stringify(
      {
        engine: 'modern',
        ok: summary.ok,
        missing: summary.missing,
        failed: summary.failed,
        missingSlugs: summary.missingSlugs,
      },
      null,
      2
    ),
    'utf8'
  );

  log(`done → ${path.relative(repoRoot, outDir)}`);
  log(`  ✓ ${summary.ok} cards  ·  ${summary.missing} no-fixture  ·  ${summary.failed} failed`);
  if (summary.missingSlugs.length) {
    log(`  no-fixture slugs: ${summary.missingSlugs.join(', ')}`);
  }
}

main().catch((error) => {
  console.error('[design-cards] fatal:', error);
  process.exit(1);
});
