#!/usr/bin/env node
/**
 * Storybook tenant acceptance: under `tenant=bithire` the preview's <html> computes the bithire
 * preset's primary as `--ds-color-primary`, through the mounted root stamp and the vertical CSS.
 *
 * Usage (from packages/core):
 *   node .storybook/acceptance/tenant-primary/index.mjs                      # the built output
 *   node .storybook/acceptance/tenant-primary/index.mjs --dir <storybook-static>
 *   node .storybook/acceptance/tenant-primary/index.mjs --url http://localhost:6006
 *   node .storybook/acceptance/tenant-primary/index.mjs --story primitives-feedback-message--default
 *
 * The default story mounts no provider of its own, so the global decorator owns <html>.
 *
 * Exit 0 when every tenant row holds, 1 otherwise.
 */
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CORE = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const at = args.indexOf(`--${name}`);
  return at >= 0 ? args[at + 1] : fallback;
};

function loadPlaywright() {
  for (const from of [join(CORE, 'package.json'), join(CORE, '../showroom/package.json'), join(CORE, '../../package.json')]) {
    try {
      return createRequire(from)('@playwright/test');
    } catch {
      // not installed from this workspace member
    }
  }
  throw new Error('@playwright/test is not resolvable from packages/core, packages/showroom or the repo root');
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };

function serve(dir) {
  const root = resolve(dir);
  const server = createServer((req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
    let file = join(root, path || 'index.html');
    if (!file.startsWith(root) || !existsSync(file)) {
      res.writeHead(404).end();
      return;
    }
    if (statSync(file).isDirectory()) file = join(file, 'index.html');
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

const expected = JSON.parse(
  readFileSync(join(CORE, 'src/foundation/presets/verticals/bithire/document/index.json'), 'utf8'),
);
const presetPrimary = JSON.stringify(expected).match(/"primary"\s*:\s*"(#[0-9a-fA-F]{3,8})"/)?.[1];
if (!presetPrimary) throw new Error('the bithire preset document declares no palette primary');

let server = null;
let base = arg('url');
if (!base) {
  const dir = arg('dir', join(CORE, 'artifacts/local/previews/storybook'));
  if (!existsSync(join(dir, 'iframe.html'))) throw new Error(`no built Storybook at ${dir} (run build-storybook first)`);
  server = await serve(dir);
  base = `http://127.0.0.1:${server.address().port}`;
}
const story = arg('story', 'primitives-feedback-message--default');

const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const rows = [];
for (const tenant of ['bithire', 'rottay']) {
  const page = await browser.newPage();
  await page.goto(`${base}/iframe.html?id=${story}&viewMode=story&globals=tenant:${tenant}`, { waitUntil: 'load', timeout: 180_000 });
  await page.waitForFunction(
    (slug) => document.documentElement.getAttribute('data-tenant') === slug && (document.querySelector('#storybook-root')?.childElementCount ?? 0) > 0,
    tenant,
    { timeout: 180_000 },
  );
  rows.push(
    await page.evaluate(([slug, preset]) => {
      const root = document.documentElement;
      const asColor = (value) => {
        const probe = document.createElement('span');
        probe.style.color = value;
        document.body.appendChild(probe);
        const color = getComputedStyle(probe).color;
        probe.remove();
        return color;
      };
      const primary = getComputedStyle(root).getPropertyValue('--ds-color-primary').trim();
      return {
        tenant: slug,
        root: Object.fromEntries([...root.attributes].filter((a) => a.name !== 'class' && a.name !== 'style').map((a) => [a.name, a.value])),
        primary,
        primaryColor: asColor(primary),
        presetColor: asColor(preset),
      };
    }, [tenant, presetPrimary]),
  );
  await page.close();
}
await browser.close();
server?.close();

const bithire = rows.find((row) => row.tenant === 'bithire');
const ok =
  bithire.primaryColor === bithire.presetColor &&
  rows.every((row) => row.root['data-vertical'] === row.tenant && row.root['data-tenant'] === row.tenant);
console.log(JSON.stringify({ story, presetPrimary, rows, ok }, null, 2));
process.exit(ok ? 0 : 1);
