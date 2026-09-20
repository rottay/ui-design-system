/**
 * tree node-padding authority probe — reads the three consumer sites of the
 * tree node-padding capability in a real Chromium, from the probe's own
 * `fresh` bundle (recomposed in memory from `src/foundation/tokens/css/**`),
 * so an arm is the SOURCE tree it runs in and nothing has to be regenerated.
 *
 * Sites:
 *   modern-row       the Modern skin's row part   (engines/modern renders it)
 *   modern-node      the Modern engine's node wrapper (`.rottay-tree-node`)
 *   compound-node    the engine-agnostic `Tree.TreeNode` compound
 *   classic-treenode the Classic theme's `.ant-tree .ant-tree-treenode`
 *
 * Usage: node measure.mjs <out.json> [--density=compact|spacious]
 */
import { writeFileSync } from 'node:fs';

import { launchBrowser } from '../../../scripts/check/tokens/cascade/probe/runtime/browser/index.mjs';
import { resolveBundle } from '../../../scripts/check/tokens/cascade/probe/runtime/bundle/index.mjs';
import {
  rootAttributes,
  rootAttributesToHtml,
} from '../../../scripts/check/tokens/cascade/probe/foundation/scope/index.mjs';

const OUT = process.argv[2] ?? 'reading.json';
const densityArg = process.argv.find((a) => a.startsWith('--density='));
const density = densityArg ? densityArg.split('=')[1] : null;

const VERTICALS = ['bithire', 'evnto', 'rottay'];
const MODES = ['light', 'dark'];

const SCENE = `
<div id="modern" class="rottay-tree rottay-tree--modern" data-part="root" role="tree" aria-label="t">
  <div class="rottay-tree-node relative" data-part="node" data-key="k1" id="modern-node">
    <div id="modern-row" role="treeitem" data-part="row" data-selected="false" aria-level="1" tabindex="-1">
      <span data-part="title">node</span>
    </div>
  </div>
</div>
<div id="compound-host">
  <div id="compound-node" class="rottay-tree-node" role="treeitem">
    <span class="rottay-tree-node__title">node</span>
  </div>
</div>
<div id="control-orphan-treenode" class="ant-tree-treenode">
  <span class="ant-tree-node-content-wrapper">orphan</span>
</div>
<div id="control-bare">bare</div>
<div class="ant-tree" style="--ds-tree-node-padding: initial">
  <div id="control-iacvt-treenode" class="ant-tree-treenode">
    <span class="ant-tree-node-content-wrapper">iacvt</span>
  </div>
</div>
<div id="classic" class="ant-tree rottay-tree rottay-tree--classic">
  <div class="ant-tree-list"><div class="ant-tree-list-holder"><div class="ant-tree-list-holder-inner">
    <div id="classic-treenode" class="ant-tree-treenode">
      <span class="ant-tree-node-content-wrapper"><span class="ant-tree-title">node</span></span>
    </div>
  </div></div></div>
</div>`;

const SITES = [
  'modern-row',
  'modern-node',
  'compound-node',
  'classic-treenode',
  // `.ant-tree-treenode` with NO `.ant-tree` ancestor: the Classic rule does
  // not match it at all, so it reads 0px in both arms. Kept as the proof that
  // the scoped producer is not reaching outside its own box either.
  'control-orphan-treenode',
  // NON-VACUITY FLOOR. Same node, inside an `.ant-tree` that clears the
  // channel to the guaranteed-invalid value, so the Classic rule matches and
  // its `var()` is unresolvable. It MUST read 0px -- that is what `padding`
  // does when it is invalid at computed-value time. If this reads 4px/8px the
  // instrument cannot see IACVT and the real node's 4px/8px proves nothing.
  'control-iacvt-treenode',
  // A node outside every tree: the `:root` reach of the legacy shorthand.
  'control-bare',
];
const CHANNELS = [
  '--ds-tree-node-padding',
  '--ds-tree-node-padding-block',
  '--ds-tree-node-padding-inline',
  '--ds-spacing-1',
  '--ds-spacing-2',
  '--ds-density-effective-scale',
  '--ds-density-mode-factor',
];

function read(args) {
  const [sites, channels] = args;
  const out = { sites: {}, root: {}, fontSize: null };
  const rootStyle = getComputedStyle(document.documentElement);
  out.fontSize = rootStyle.fontSize;
  for (const c of channels) out.root[c] = rootStyle.getPropertyValue(c).trim();
  for (const id of sites) {
    const el = document.getElementById(id);
    if (!el) {
      out.sites[id] = null;
      continue;
    }
    const cs = getComputedStyle(el);
    out.sites[id] = {
      paddingTop: cs.paddingTop,
      paddingRight: cs.paddingRight,
      paddingBottom: cs.paddingBottom,
      paddingLeft: cs.paddingLeft,
      // the channel as this element resolves it (inherited or own)
      nodePadding: cs.getPropertyValue('--ds-tree-node-padding').trim(),
      nodePaddingBlock: cs.getPropertyValue('--ds-tree-node-padding-block').trim(),
      nodePaddingInline: cs.getPropertyValue('--ds-tree-node-padding-inline').trim(),
    };
  }
  return out;
}

const { browser, provenance } = await launchBrowser();
const context = await browser.newContext();
const result = { provenance, density, bundles: {}, readings: [] };

for (const vertical of VERTICALS) {
  const bundle = await resolveBundle({ vertical, mode: 'fresh' });
  result.bundles[vertical] = { sha256: bundle.provenance.sha256, bytes: bundle.css.length };
  for (const theme of MODES) {
    const attrs = rootAttributesToHtml(rootAttributes({ vertical, theme }));
    const extra = density === null ? '' : ` data-density="${density}"`;
    const page = await context.newPage();
    await page.setContent(
      `<!doctype html><html ${attrs}${extra}><head><style>${bundle.css}</style></head>` +
        `<body>${SCENE}</body></html>`,
      { waitUntil: 'load' },
    );
    const reading = await page.evaluate(read, [SITES, CHANNELS]);
    result.readings.push({ vertical, theme, ...reading });
    await page.close();
  }
}

await context.close();
await browser.close();
writeFileSync(OUT, `${JSON.stringify(result, null, 2)}\n`);

for (const r of result.readings) {
  const cell = `${r.vertical}/${r.theme}`;
  for (const id of SITES) {
    const s = r.sites[id];
    if (s === null) continue;
    console.log(
      `${cell.padEnd(14)} ${id.padEnd(17)} ` +
        `${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft}` +
        `   [shorthand='${s.nodePadding}' block='${s.nodePaddingBlock}' inline='${s.nodePaddingInline}']`,
    );
  }
  console.log(`${cell.padEnd(14)} root font-size ${r.fontSize}  scale=${r.root['--ds-density-effective-scale']}  sp1=${r.root['--ds-spacing-1']} sp2=${r.root['--ds-spacing-2']}`);
}
