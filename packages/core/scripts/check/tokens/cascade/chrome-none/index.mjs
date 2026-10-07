#!/usr/bin/env node
/**
 * @fileoverview Computed-style gate for `chrome="none"` controls: the guarded chrome is gone, the kept arms are not.
 *
 * Loads every scope's freshly recomposed bundle (tenant-less and each first-party vertical) in Chromium and
 * reads each rostered owner in each rostered cell under fine light/dark, coarse, forced colours and print. Fails on
 * chrome left on a chrome-less owner, a kept arm (focus ring, forced outline/frame/ink, touch floor, disabled
 * dimming) that differs from the standard control, a host that changes a kept arm, and a guarded selector
 * that is unrostered or unexercised. `--self-check` plants each defect per owner and host and requires it caught.
 *
 * Exit codes: 0 pass, 1 a finding or an uncaught plant, 2 bad invocation.
 * Usage: node scripts/check/tokens/cascade/chrome-none/index.mjs [--self-check] [--scope <key>]
 */

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { launchBrowser } from '../probe/runtime/browser/index.mjs';
import { resolveBundle } from '../probe/runtime/bundle/index.mjs';
import { rootAttributes, rootAttributesToHtml, rootClassNames, SCOPE_KEYS, VERTICAL_KEYS } from '../probe/foundation/scope/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const postcss = require('postcss');

const ROSTER = JSON.parse(readFileSync(join(HERE, 'roster/index.json'), 'utf8'));
const GUARD = ROSTER.guard;

const ENVIRONMENTS = [
  { id: 'fine-light', theme: 'light', context: { viewport: { width: 1200, height: 900 } }, media: {} },
  { id: 'fine-dark', theme: 'dark', context: { viewport: { width: 1200, height: 900 } }, media: {} },
  { id: 'coarse-light', theme: 'light', context: { viewport: { width: 420, height: 900 }, hasTouch: true, isMobile: true }, media: {} },
  { id: 'forced-light', theme: 'light', context: { viewport: { width: 1200, height: 900 } }, media: { forcedColors: 'active' } },
  { id: 'print-light', theme: 'light', context: { viewport: { width: 1200, height: 900 } }, media: { media: 'print' } },
];

const FREEZE = '<style>*,*::before,*::after{transition:none!important;animation:none!important}</style>';

function parseArguments(argv) {
  const options = { selfCheck: false, scopes: ['none', ...VERTICAL_KEYS] };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--self-check') options.selfCheck = true;
    else if (argument === '--scope') {
      const scope = argv[++index];
      if (!SCOPE_KEYS.includes(scope)) throw new UsageError(`--scope must be one of ${SCOPE_KEYS.join(', ')}`);
      options.scopes = [scope];
    } else throw new UsageError(`unknown argument ${argument}`);
  }
  return options;
}

class UsageError extends Error {}

const atRuleChain = (node) => {
  const chain = [];
  for (let parent = node.parent; parent && parent.type !== 'root'; parent = parent.parent) {
    if (parent.type === 'atrule') chain.unshift({ name: parent.name, params: parent.params });
  }
  return chain;
};

function lastCompound(selector) {
  let depth = 0;
  let start = 0;
  for (let index = 0; index < selector.length; index += 1) {
    const character = selector[index];
    if (character === '[' || character === '(') depth += 1;
    else if (character === ']' || character === ')') depth -= 1;
    else if (depth === 0 && /[\s>+~]/.test(character)) start = index + 1;
  }
  return selector.slice(start);
}

export function guardedSelectors(css) {
  const found = [];
  postcss.parse(css).walkRules((rule) => {
    const media = atRuleChain(rule).filter((at) => at.name === 'media').map((at) => at.params);
    for (const selector of rule.selectors) {
      const at = selector.indexOf(GUARD);
      if (at === -1) continue;
      const head = selector.slice(0, at);
      const compound = lastCompound(head);
      const classes = [...compound.matchAll(/\.([\w-]+)/g)].map((hit) => hit[1]);
      const owner = ROSTER.owners.find((candidate) =>
        candidate.subjectPart
          ? compound.includes(`[data-part='${candidate.subjectPart}']`) && head.includes(`.${candidate.scopeClass}`)
          : classes.includes(candidate.subjectClass));
      found.push({ selector, match: head.replace(/::[\w-]+/g, ''), owner: owner?.id ?? null, media: media.join(' and ') });
    }
  });
  return found;
}

const cellOf = (value) => (value.attrs || value.root || value.fixtures ? { attrs: {}, root: {}, ...value } : { attrs: value, root: {} });

function cellMarkup(owner) {
  const cells = [];
  for (const [fixture, html] of Object.entries(owner.fixtures)) {
    for (const [cell, value] of Object.entries(owner.cells)) {
      const { attrs, root, fixtures } = cellOf(value);
      if (fixtures && !fixtures.includes(fixture)) continue;
      for (const chrome of ['none', 'standard']) {
        cells.push(`<div data-probe-owner="${owner.id}" data-probe-fixture="${fixture}" data-probe-cell="${cell}" data-probe-chrome="${chrome}" data-probe-attrs='${JSON.stringify({ attrs, root })}'>${html}</div>`);
      }
    }
  }
  return cells.join('\n');
}

function hostMarkup(host) {
  const owner = ROSTER.owners.find((candidate) => candidate.id === host.owner);
  return host.cells
    .map((cell) => {
      const { attrs, root } = cellOf(owner.cells[cell]);
      return `<div data-probe-host="${host.id}" data-probe-owner="${owner.id}" data-probe-cell="${cell}" data-probe-attrs='${JSON.stringify({ attrs, root })}'>${host.context.replace('{markup}', host.markup)}</div>`;
    })
    .join('\n');
}

function page(css, scope, environment) {
  const attributes = rootAttributes({ vertical: scope, theme: environment.theme });
  const classes = rootClassNames({ theme: environment.theme }).join(' ');
  const body = [...ROSTER.owners.map(cellMarkup), ...(ROSTER.hosts ?? []).map(hostMarkup)].join('\n');
  return `<!doctype html><html ${rootAttributesToHtml(attributes)} class="${classes}"><head><link rel="stylesheet" href="${pathToFileURL(css).href}">${FREEZE}</head><body style="margin:0">${body}</body></html>`;
}

function measureInPage({ owners, guarded }) {
  const stamp = (host, owner) => {
    const shell = host.querySelector(owner.fixtureShell?.[host.dataset.probeFixture] ?? owner.shell);
    const { attrs, root } = JSON.parse(host.dataset.probeAttrs);
    for (const [name, value] of Object.entries(attrs)) shell.setAttribute(name, value);
    if (owner.root) for (const [name, value] of Object.entries(root)) host.querySelector(owner.root).setAttribute(name, value);
    return shell;
  };
  const read = (element) => {
    const style = getComputedStyle(element);
    const pick = (property) => style.getPropertyValue(property);
    return {
      padding: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'].map(pick),
      border: ['border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width'].map(pick),
      backgroundColor: pick('background-color'),
      backgroundImage: pick('background-image'),
      boxShadow: pick('box-shadow'),
      outline: `${pick('outline-style')} ${pick('outline-width')} ${pick('outline-color')}`,
      minBlockSize: pick('min-block-size'),
      minHeight: pick('min-height'),
      opacity: pick('opacity'),
      color: pick('color'),
      borderColor: pick('border-top-color'),
      beforeContent: getComputedStyle(element, '::before').getPropertyValue('content'),
    };
  };
  const exercised = new Set();
  const rows = [];
  for (const host of document.querySelectorAll('[data-probe-host]')) {
    const owner = owners.find((candidate) => candidate.id === host.dataset.probeOwner);
    const shell = stamp(host, owner);
    const systemFill = owner.keep.forcedFill?.[host.dataset.probeCell];
    const swatch = systemFill ? host.appendChild(document.createElement('span')) : null;
    if (swatch) swatch.style.backgroundColor = systemFill;
    const systemFillColor = swatch ? getComputedStyle(swatch).backgroundColor : null;
    swatch?.remove();
    rows.push({ host: host.dataset.probeHost, owner: owner.id, cell: host.dataset.probeCell, shell: read(shell), systemFillColor });
  }
  for (const host of document.querySelectorAll('[data-probe-owner]:not([data-probe-host])')) {
    const owner = owners.find((candidate) => candidate.id === host.dataset.probeOwner);
    const shell = stamp(host, owner);
    const field = owner.field ? host.querySelector(owner.field) : shell.parentElement;
    if (host.dataset.probeChrome === 'standard') {
      for (const element of host.querySelectorAll('[data-chrome]')) element.removeAttribute('data-chrome');
    } else {
      guarded.forEach((entry, index) => {
        if (entry.owner !== owner.id || (entry.media && !matchMedia(entry.media).matches)) return;
        try {
          if (shell.matches(entry.match)) exercised.add(index);
        } catch {
          /* a UA-only pseudo-class the page cannot evaluate */
        }
      });
    }
    const systemFill = owner.keep.forcedFill?.[host.dataset.probeCell];
    let systemFillColor = null;
    if (systemFill) {
      const swatch = document.createElement('span');
      swatch.style.backgroundColor = systemFill;
      host.append(swatch);
      systemFillColor = getComputedStyle(swatch).backgroundColor;
      swatch.remove();
    }
    rows.push({ owner: owner.id, fixture: host.dataset.probeFixture, cell: host.dataset.probeCell, chrome: host.dataset.probeChrome, shell: read(shell), fieldColor: getComputedStyle(field).color, systemFillColor });
  }
  return { rows, exercised: [...exercised] };
}

function judge({ rows }, environment, scope) {
  const findings = [];
  const forced = environment.id.startsWith('forced');
  const coarse = environment.id.startsWith('coarse');
  const standardOf = new Map(rows.filter((row) => row.chrome === 'standard').map((row) => [`${row.owner}|${row.fixture}|${row.cell}`, row.shell]));
  for (const row of rows.filter((candidate) => candidate.host)) {
    const host = ROSTER.hosts.find((candidate) => candidate.id === row.host);
    const owner = ROSTER.owners.find((candidate) => candidate.id === row.owner);
    const standard = standardOf.get(`${row.owner}|${host.fixture}|${row.cell}`);
    const where = `${scope}/${environment.id} host ${row.host}:${row.cell}`;
    const fail = (detail) => findings.push({ kind: 'host-arm', where, detail });
    const { shell } = row;
    if (owner.keep.ring.includes(row.cell) && shell.boxShadow !== standard.boxShadow) fail(`focus ring ${shell.boxShadow.slice(0, 50)} != ${standard.boxShadow.slice(0, 50)}`);
    if (owner.keep.ring.includes(row.cell) && forced && shell.outline !== standard.outline) fail(`forced outline ${shell.outline} != ${standard.outline}`);
    if (forced && owner.keep.forcedFrame.includes(row.cell) && shell.border.join(' ') !== standard.border.join(' ')) fail(`forced frame ${shell.border.join(' ')} != ${standard.border.join(' ')}`);
    if (forced && owner.keep.forcedInk.includes(row.cell) && (shell.color !== standard.color || shell.borderColor !== standard.borderColor)) fail(`forced ink ${shell.color}/${shell.borderColor} != ${standard.color}/${standard.borderColor}`);
    if (forced && row.systemFillColor && shell.backgroundColor !== row.systemFillColor) fail(`forced fill ${shell.backgroundColor} != ${owner.keep.forcedFill[row.cell]} ${row.systemFillColor}`);
    if (coarse && Math.max(parseFloat(shell.minBlockSize) || 0, parseFloat(shell.minHeight) || 0) < owner.keep.touchFloorPx) fail(`touch floor lost (${shell.minBlockSize}/${shell.minHeight})`);
  }
  for (const row of rows.filter((candidate) => candidate.chrome === 'none')) {
    const owner = ROSTER.owners.find((candidate) => candidate.id === row.owner);
    const standard = standardOf.get(`${row.owner}|${row.fixture}|${row.cell}`);
    const where = `${scope}/${environment.id} ${row.owner}:${row.fixture}:${row.cell}`;
    const fail = (kind, detail) => findings.push({ kind, where, detail });
    const { shell } = row;
    const ring = owner.keep.ring.includes(row.cell);
    const reserve = owner.keep.arrowReserve?.includes(row.fixture);
    if (shell.padding.some((value, side) => parseFloat(value) !== 0 && !(reserve && side === 1))) fail('chrome', `padding ${shell.padding.join(' ')}`);
    if (shell.backgroundImage !== 'none') fail('chrome', `background-image ${shell.backgroundImage.slice(0, 60)}`);
    if (!['none', 'normal'].includes(shell.beforeContent)) fail('chrome', `::before content ${shell.beforeContent.slice(0, 40)}`);
    if (!forced && !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(shell.backgroundColor)) fail('chrome', `background-color ${shell.backgroundColor}`);
    const framed = forced && owner.keep.forcedFrame.includes(row.cell);
    if (!framed && shell.border.some((value) => parseFloat(value) !== 0)) fail('chrome', `border-width ${shell.border.join(' ')}`);
    if (framed && (shell.border.join(' ') !== standard.border.join(' ') || shell.borderColor !== standard.borderColor)) fail('kept-arm', `forced frame ${shell.border.join(' ')} ${shell.borderColor} != ${standard.border.join(' ')} ${standard.borderColor}`);
    if (!ring && shell.boxShadow !== 'none') fail('chrome', `box-shadow ${shell.boxShadow.slice(0, 60)}`);
    if (!forced && shell.color !== row.fieldColor) fail('chrome', `ink ${shell.color} is not the field's ${row.fieldColor}`);
    if (coarse) {
      if (Math.max(parseFloat(shell.minBlockSize) || 0, parseFloat(shell.minHeight) || 0) < owner.keep.touchFloorPx) fail('kept-arm', `touch floor lost (${shell.minBlockSize}/${shell.minHeight})`);
    } else if (!(shell.minBlockSize === 'auto' || parseFloat(shell.minBlockSize) === 0)) fail('chrome', `min-block-size ${shell.minBlockSize}`);
    if (ring && shell.boxShadow !== standard.boxShadow) fail('kept-arm', `focus ring ${shell.boxShadow.slice(0, 50)} != ${standard.boxShadow.slice(0, 50)}`);
    if (ring && forced && shell.outline !== standard.outline) fail('kept-arm', `forced outline ${shell.outline} != ${standard.outline}`);
    if (shell.opacity !== standard.opacity) fail('kept-arm', `opacity ${shell.opacity} != ${standard.opacity}`);
    if (forced && owner.keep.forcedInk.includes(row.cell) && (shell.color !== standard.color || shell.borderColor !== standard.borderColor)) fail('kept-arm', `forced ink ${shell.color}/${shell.borderColor} != ${standard.color}/${standard.borderColor}`);
    if (forced && row.systemFillColor && shell.backgroundColor !== row.systemFillColor) fail('kept-arm', `forced fill ${shell.backgroundColor} != ${owner.keep.forcedFill[row.cell]} ${row.systemFillColor}`);
  }
  return findings;
}

async function runScope(browser, scope, css, guarded) {
  const dir = mkdtempSync(join(tmpdir(), 'chrome-none-'));
  const findings = [];
  const exercised = new Set();
  let measured = 0;
  try {
    writeFileSync(join(dir, 'bundle.css'), css);
    for (const environment of ENVIRONMENTS) {
      writeFileSync(join(dir, `${environment.id}.html`), page(join(dir, 'bundle.css'), scope, environment));
      const context = await browser.newContext(environment.context);
      try {
        const tab = await context.newPage();
        await tab.emulateMedia(environment.media);
        await tab.goto(pathToFileURL(join(dir, `${environment.id}.html`)).href, { waitUntil: 'load', timeout: 120_000 });
        const result = await tab.evaluate(measureInPage, { owners: ROSTER.owners, guarded });
        measured += result.rows.length;
        result.exercised.forEach((index) => exercised.add(index));
        findings.push(...judge(result, environment, scope));
      } finally {
        await context.close();
      }
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  return { findings, exercised, measured };
}

function coverageFindings(guarded, exercised) {
  const findings = [];
  guarded.forEach((entry, index) => {
    if (entry.owner === null) findings.push({ kind: 'coverage', where: 'roster', detail: `guarded selector with no rostered owner: ${entry.selector}` });
    else if (!exercised.has(index)) {
      const owner = ROSTER.owners.find((candidate) => candidate.id === entry.owner);
      if (!owner.unexercisable?.[entry.match]) findings.push({ kind: 'coverage', where: entry.owner, detail: `no cell exercises ${entry.media ? `@media ${entry.media} ` : ''}${entry.selector}` });
    }
  });
  return findings;
}

export async function check({ scopes, transform = (css) => css }) {
  const { browser, close, provenance } = await launchBrowser();
  const findings = [];
  const report = { browser: provenance.browserVersion, scopes: {} };
  try {
    for (const scope of scopes) {
      const bundle = await resolveBundle({ vertical: scope, mode: 'fresh' });
      const css = transform(bundle.css);
      const guarded = guardedSelectors(css);
      const result = await runScope(browser, scope, css, guarded);
      findings.push(...result.findings, ...coverageFindings(guarded, result.exercised));
      report.scopes[scope] = { sha256: bundle.provenance.sha256, guarded: guarded.length, exercised: result.exercised.size, measured: result.measured };
    }
  } finally {
    await close();
  }
  return { findings, report };
}

function retarget(css, predicate, rewrite) {
  const root = postcss.parse(css);
  let hits = 0;
  root.walkRules((rule) => {
    if (!predicate(rule)) return;
    rule.selectors = rule.selectors.map(rewrite);
    hits += 1;
  });
  if (hits !== 1) throw new Error(`self-check: a plant matched ${hits} rules instead of one`);
  return root.toString();
}

const outsideMedia = (rule) => !atRuleChain(rule).some((at) => at.name === 'media');
const flat = (selector) => selector.replace(/\s+/g, ' ').replace(/\( /g, '(').replace(/ \)/g, ')');
const names = (rule, selector) => rule.selectors.map(flat).includes(flat(selector));
const insideForced = (rule) => atRuleChain(rule).some((at) => at.name === 'media' && /forced-colors: ?active/.test(at.params));

function dropRule(css, predicate) {
  const root = postcss.parse(css);
  let hits = 0;
  root.walkRules((rule) => {
    if (!predicate(rule)) return;
    rule.remove();
    hits += 1;
  });
  if (hits !== 1) throw new Error(`self-check: a plant matched ${hits} rules instead of one`);
  return root.toString();
}

function plants() {
  const [input] = ROSTER.owners;
  const perOwner = ROSTER.owners.flatMap((owner) => [
    {
      id: `${owner.id}: unguarded owner rule`,
      expect: 'chrome',
      transform: (css) => retarget(css, (rule) => names(rule, owner.plant.unguard) && outsideMedia(rule), (selector) => (flat(selector) === flat(owner.plant.unguard) ? selector.replace(GUARD, '') : selector)),
    },
    {
      id: `${owner.id}: over-guarded focus ring`,
      expect: 'kept-arm',
      transform: (css) => retarget(css, (rule) => names(rule, owner.plant.overguard) && outsideMedia(rule), (selector) => `${selector}${GUARD}`),
    },
    {
      id: `${owner.id}: over-guarded forced frame`,
      expect: 'kept-arm',
      transform: (css) => retarget(css, (rule) => names(rule, owner.plant.forcedFrame) && insideForced(rule), (selector) => `${selector}${GUARD}`),
    },
  ]);
  const perHost = (ROSTER.hosts ?? []).map((host) => (host.plant.dropForced
    ? {
        id: `${host.id}: forced state arm not restated`,
        expect: 'host-arm',
        transform: (css) => dropRule(css, (rule) => names(rule, host.plant.dropForced) && insideForced(rule)),
      }
    : {
        id: `${host.id}: host repaints a kept arm`,
        expect: 'host-arm',
        transform: (css) => `${css}\n${host.plant.inject}\n`,
      }));
  return [
    ...perOwner,
    ...perHost,
    {
      id: 'guarded rule for an unrostered owner',
      expect: 'coverage',
      transform: (css) => `${css}\n.ds-probe-unrostered${GUARD} { padding: 1px; }\n`,
    },
    {
      id: 'guarded rule no cell exercises',
      expect: 'coverage',
      transform: (css) => `${css}\n${input.shell}[data-size='xxl']${GUARD} { padding: 1px; }\n`,
    },
  ];
}

async function main() {
  let options;
  try {
    options = parseArguments(process.argv.slice(2));
  } catch (error) {
    console.error(`chrome-none: ${error.message}`);
    process.exit(2);
  }
  const { findings, report } = await check({ scopes: options.scopes });
  console.log('measured:', JSON.stringify(report));
  if (options.selfCheck) {
    for (const plant of plants()) {
      const planted = await check({ scopes: ['none'], transform: plant.transform });
      const caught = planted.findings.filter((finding) => finding.kind === plant.expect);
      console.log(`self-check [${plant.id}]: ${caught.length} ${plant.expect} finding(s)${caught[0] ? ` e.g. ${caught[0].where}: ${caught[0].detail}` : ''}`);
      if (caught.length === 0) findings.push({ kind: 'self-check', where: plant.id, detail: `the plant produced no ${plant.expect} finding` });
    }
  }
  if (findings.length > 0) {
    console.error(`chrome-none: FAIL (${findings.length})\n${findings.slice(0, 40).map((finding) => `- [${finding.kind}] ${finding.where}: ${finding.detail}`).join('\n')}`);
    process.exit(1);
  }
  console.log('chrome-none: PASS');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main();
}
