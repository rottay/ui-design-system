/**
 * Sighted capture of the tree node-padding sites, one PNG per vertical/mode.
 *
 * The scene is the Modern engine's own markup (`engines/modern/index.tsx`
 * renders `.rottay-tree--modern[data-part=root]` > `.rottay-tree-node
 * [data-part=node]` > `[data-part=row][role=treeitem]`) and the Classic
 * theme's Ant markup, side by side on one page, so the declared Modern move
 * and Classic's byte-identity are visible in the SAME image.
 *
 * Usage: node capture.mjs <out-dir> <label>
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { launchBrowser } from '../../../scripts/check/tokens/cascade/probe/runtime/browser/index.mjs';
import { resolveBundle } from '../../../scripts/check/tokens/cascade/probe/runtime/bundle/index.mjs';
import {
  rootAttributes,
  rootAttributesToHtml,
} from '../../../scripts/check/tokens/cascade/probe/foundation/scope/index.mjs';

const OUT = process.argv[2];
const LABEL = process.argv[3] ?? 'arm';
mkdirSync(OUT, { recursive: true });

const rows = ['Documents', 'Projects', 'Archive', 'Shared', 'Trash'];

const modernNodes = rows
  .map(
    (label, i) => `
  <div class="rottay-tree-node relative" data-part="node" data-key="k${i}">
    <div role="treeitem" data-part="row" data-selected="${i === 1 ? 'true' : 'false'}"
         aria-level="1" aria-posinset="${i + 1}" aria-setsize="${rows.length}" tabindex="-1">
      <span data-part="title">${label}</span>
    </div>
  </div>`,
  )
  .join('');

const classicNodes = rows
  .map(
    (label, i) => `
      <div class="ant-tree-treenode${i === 1 ? ' ant-tree-treenode-selected' : ''}">
        <span class="ant-tree-node-content-wrapper"><span class="ant-tree-title">${label}</span></span>
      </div>`,
  )
  .join('');

const SCENE = `
<div class="probe-grid">
  <section>
    <p class="probe-caption">Modern — skin row part (<code>[data-part=row]</code>)</p>
    <div class="rottay-tree rottay-tree--modern" data-part="root" role="tree" aria-label="modern">${modernNodes}</div>
  </section>
  <section>
    <p class="probe-caption">Classic — <code>.ant-tree .ant-tree-treenode</code> (must not move)</p>
    <div class="ant-tree rottay-tree rottay-tree--classic">
      <div class="ant-tree-list"><div class="ant-tree-list-holder"><div class="ant-tree-list-holder-inner">${classicNodes}</div></div></div>
    </div>
  </section>
</div>`;

const PROBE_CSS = `
  body { margin: 0; padding: 24px; font: 13px/1.4 -apple-system, system-ui, sans-serif; }
  .probe-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start; }
  .probe-caption { margin: 0 0 8px; opacity: 0.7; font-size: 11px; letter-spacing: 0.02em; }
  /* A hairline on every measured box so its padding is visible as a box, not
     as a number. Outline, so it adds no geometry of its own. */
  [data-part='row'], .ant-tree-treenode { outline: 1px dashed rgba(255, 0, 128, 0.85); }
  .rottay-tree-node { outline: 1px dotted rgba(0, 160, 255, 0.7); }
  .probe-legend { margin-top: 20px; font-size: 11px; opacity: 0.75; }
`;

const { browser } = await launchBrowser();
const context = await browser.newContext({ deviceScaleFactor: 2 });
for (const vertical of ['bithire', 'evnto', 'rottay']) {
  const bundle = await resolveBundle({ vertical, mode: 'fresh' });
  for (const theme of ['light', 'dark']) {
    const attrs = rootAttributesToHtml(rootAttributes({ vertical, theme }));
    const page = await context.newPage();
    await page.setViewportSize({ width: 860, height: 420 });
    await page.setContent(
      `<!doctype html><html ${attrs}><head><style>${bundle.css}</style><style>${PROBE_CSS}</style></head>` +
        `<body style="background: var(--ds-color-background); color: var(--ds-color-text)">${SCENE}` +
        `<p class="probe-legend">${LABEL} — ${vertical}/${theme} · pink = measured padding box (Modern row / Classic treenode), blue = Modern node wrapper</p>` +
        `</body></html>`,
      { waitUntil: 'load' },
    );
    await page.screenshot({ path: join(OUT, `${LABEL}-${vertical}-${theme}.png`) });
    await page.close();
  }
}
await context.close();
await browser.close();
console.log(`captured -> ${OUT}`);
