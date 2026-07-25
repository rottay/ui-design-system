#!/usr/bin/env node
/**
 * Local DS dev orchestrator.
 *
 * Keeps the JS bundle in watch mode and also refreshes the CSS artifacts that
 * symlinked apps consume through the public `styles/*` entrypoints.
 *
 * This avoids the "local DS works only after a manual build" trap while
 * preserving the production contract (`styles/platform` -> built bundle).
 */

import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const isWindows = process.platform === 'win32';

let activeCssBuild = null;
let cssBuildQueued = false;
let shutdownRequested = false;

function spawnCommand(command, args, options = {}) {
  return spawn(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: isWindows,
    ...options,
  });
}

function runCssBuild() {
  if (shutdownRequested) return;

  if (activeCssBuild) {
    cssBuildQueued = true;
    return;
  }

  cssBuildQueued = false;

  const modern = spawnCommand('pnpm', ['build:modern-css']);
  activeCssBuild = modern;

  modern.on('exit', (modernCode) => {
    if (shutdownRequested) return;

    if (modernCode !== 0) {
      console.error(`[ds-dev] build:modern-css failed with code ${modernCode ?? 'unknown'}`);
      activeCssBuild = null;
      if (cssBuildQueued) {
        runCssBuild();
      }
      return;
    }

    const vertical = spawnCommand('pnpm', ['build:vertical-css']);
    activeCssBuild = vertical;

    vertical.on('exit', (verticalCode) => {
      if (shutdownRequested) return;

      if (verticalCode !== 0) {
        console.error(`[ds-dev] build:vertical-css failed with code ${verticalCode ?? 'unknown'}`);
      }

      activeCssBuild = null;
      if (cssBuildQueued) {
        runCssBuild();
      }
    });
  });
}

function debounce(fn, delayMs) {
  let timeoutId = null;

  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn();
    }, delayMs);
  };
}

function normalizePath(value) {
  return value.replaceAll('\\', '/');
}

const scheduleCssBuild = debounce(runCssBuild, 150);

const cssWatcher = watch(
  resolve(root, 'src/foundation/tokens/css'),
  { recursive: true },
  (_eventType, filename) => {
    const normalized = normalizePath(String(filename || ''));
    if (!normalized) return;

    // `build:vertical-css` regenerates these facade artifacts. Watching the
    // generated output turns one source edit into an infinite build loop and
    // can leave `dist` half-written when the watcher is interrupted.
    const isGeneratedVerticalArtifact = normalized.startsWith('facade/artifacts/')
      || normalized.includes('/facade/artifacts/');

    if (!isGeneratedVerticalArtifact) {
      scheduleCssBuild();
    }
  }
);

const modernEngineWatcher = watch(resolve(root, 'src/ui'), { recursive: true }, (_eventType, filename) => {
  const normalized = normalizePath(String(filename || ''));
  if (!normalized) return;

  const isModernEngineFile = normalized.includes('/engines/modern')
    && (normalized.endsWith('.ts') || normalized.endsWith('.tsx') || normalized.endsWith('.css'));

  if (isModernEngineFile) {
    scheduleCssBuild();
  }
});

const viteWatcher = spawnCommand('pnpm', ['exec', 'vite', 'build', '--watch']);

viteWatcher.on('exit', (code, signal) => {
  if (shutdownRequested) return;

  if (code !== 0) {
    console.error(`[ds-dev] vite watch exited with code ${code ?? 'unknown'}${signal ? ` (signal ${signal})` : ''}`);
    process.exit(code ?? 1);
  }
});

function cleanupAndExit(exitCode = 0) {
  shutdownRequested = true;
  cssWatcher.close();
  modernEngineWatcher.close();

  if (activeCssBuild && !activeCssBuild.killed) {
    activeCssBuild.kill('SIGINT');
  }

  if (!viteWatcher.killed) {
    viteWatcher.kill('SIGINT');
  }

  process.exit(exitCode);
}

process.on('SIGINT', () => cleanupAndExit(0));
process.on('SIGTERM', () => cleanupAndExit(0));

runCssBuild();
