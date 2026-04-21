#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

import {
  buildManifest,
  buildProbeUrl,
  buildTargetUrl,
  DEFAULT_VIEWPORT,
  expandCaptureMatrix,
  fileNameForCapture,
  parseCliArgs,
  renderHtmlReport,
  SHOWROOM_PACKAGE_ROOT,
} from './showroom-visual-matrix.config.mjs';

function printHelp() {
  console.log(`Showroom visual QA matrix

Usage:
  node scripts/showroom-visual-matrix.mjs [options]

Options:
  --base-url <url>      Base showroom URL. Default: http://127.0.0.1:7001
  --output-dir <path>   Final artifact directory. Default: /tmp/showroom-visual-matrix/<run-id>
  --output-root <path>  Root folder used when --output-dir is omitted
  --run-id <id>         Stable run label appended under the output root
  --wait-ms <ms>        Extra settle time after redirect. Default: 3500
  --route <filter>      Filter route groups by id, label, or path. Repeatable.
  --variant <filter>    Filter variants by id, label, tenant, or engine. Repeatable.
  --list                Print the canonical matrix without running Playwright
  --help                Show this help text
`);
}

function printMatrix(captures) {
  const groups = new Map();

  for (const capture of captures) {
    if (!groups.has(capture.groupId)) {
      groups.set(capture.groupId, {
        label: capture.groupLabel,
        route: capture.route,
        focus: capture.focus,
        captures: [],
      });
    }

    groups.get(capture.groupId).captures.push(capture);
  }

  for (const [groupId, group] of groups) {
    console.log(`${groupId}  ${group.route}`);
    console.log(`  ${group.label}`);
    console.log(`  focus: ${group.focus}`);

    for (const capture of group.captures) {
      console.log(
        `  - ${capture.variant.id}  ${capture.variant.label}  (${capture.variant.rationale})`,
      );
    }
  }

  console.log(`\nTotal captures: ${captures.length}`);
}

function runCapture({ probeUrl, outputPath, waitMs }) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'pnpm',
      [
        'dlx',
        'playwright',
        'screenshot',
        `--viewport-size=${DEFAULT_VIEWPORT.width},${DEFAULT_VIEWPORT.height}`,
        `--wait-for-timeout=${waitMs}`,
        '--full-page',
        probeUrl,
        outputPath,
      ],
      {
        cwd: SHOWROOM_PACKAGE_ROOT,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: process.env,
      },
    );

    let output = '';

    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stdout.write(text);
    });

    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stderr.write(text);
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      resolve({
        code: code ?? 1,
        output,
      });
    });
  });
}

async function prewarmCapture({ baseUrl, capture }) {
  const targetUrl = buildTargetUrl(baseUrl, capture);

  try {
    const response = await fetch(targetUrl, {
      redirect: 'follow',
      headers: {
        'user-agent': 'showroom-visual-matrix-prewarm',
      },
    });

    if (!response.ok) {
      throw new Error(`prewarm failed with status ${response.status}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to prewarm ${targetUrl}: ${message}`);
  }
}

async function captureMatrix({ options, captures }) {
  await fs.mkdir(options.outputDir, { recursive: true });

  const startedAt = new Date().toISOString();
  const results = [];

  for (const [index, capture] of captures.entries()) {
    const outputPath = path.join(options.outputDir, fileNameForCapture(capture));
    const probeUrl = buildProbeUrl(options.baseUrl, capture);

    console.log(
      `\n[${index + 1}/${captures.length}] ${capture.groupId} :: ${capture.variant.id}`,
    );

    await prewarmCapture({
      baseUrl: options.baseUrl,
      capture,
    });

    const { code, output } = await runCapture({
      probeUrl,
      outputPath,
      waitMs: options.waitMs,
    });

    if (code === 0) {
      results.push({
        id: capture.id,
        groupId: capture.groupId,
        groupLabel: capture.groupLabel,
        route: capture.route,
        focus: capture.focus,
        variantId: capture.variant.id,
        tenant: capture.variant.tenant,
        engine: capture.variant.engine,
        variantLabel: capture.variant.label,
        variantRationale: capture.variant.rationale,
        probeUrl,
        fileName: path.basename(outputPath),
        status: 'captured',
      });
      continue;
    }

    results.push({
      id: capture.id,
      groupId: capture.groupId,
      groupLabel: capture.groupLabel,
      route: capture.route,
      focus: capture.focus,
      variantId: capture.variant.id,
      tenant: capture.variant.tenant,
      engine: capture.variant.engine,
      variantLabel: capture.variant.label,
      variantRationale: capture.variant.rationale,
      probeUrl,
      fileName: path.basename(outputPath),
      status: 'failed',
      error: output.trim() || `playwright screenshot exited with code ${code}`,
    });
  }

  const manifest = buildManifest({
    baseUrl: options.baseUrl,
    outputDir: options.outputDir,
    waitMs: options.waitMs,
    routeFilters: options.routeFilters,
    variantFilters: options.variantFilters,
    startedAt,
    finishedAt: new Date().toISOString(),
    captures: results,
  });

  await fs.writeFile(
    path.join(options.outputDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
  );
  await fs.writeFile(
    path.join(options.outputDir, 'index.html'),
    renderHtmlReport(manifest),
  );

  return manifest;
}

async function main() {
  let options;

  try {
    options = parseCliArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    printHelp();
    process.exit(1);
  }

  if (options.help) {
    printHelp();
    return;
  }

  const captures = expandCaptureMatrix({
    routeFilters: options.routeFilters,
    variantFilters: options.variantFilters,
  });

  if (!captures.length) {
    console.error('No captures matched the supplied filters.');
    process.exit(1);
  }

  if (options.listOnly) {
    printMatrix(captures);
    return;
  }

  console.log(`Capturing ${captures.length} canonical showroom screenshots...`);
  console.log(`Base URL: ${options.baseUrl}`);
  console.log(`Output directory: ${options.outputDir}`);

  const manifest = await captureMatrix({ options, captures });

  console.log('\nVisual matrix complete.');
  console.log(`Artifacts: ${options.outputDir}`);
  console.log(`Report: ${options.outputDir}/index.html`);
  console.log(`Manifest: ${options.outputDir}/manifest.json`);

  if (manifest.totalFailed > 0) {
    console.error(`\n${manifest.totalFailed} capture(s) failed.`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
