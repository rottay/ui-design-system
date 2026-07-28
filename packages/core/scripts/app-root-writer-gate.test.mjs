/**
 * NEGATIVE DRILLS for the root-state ownership gate.
 *
 * A gate that has never been seen to fail is a decoration, and this one is
 * cheap to fool in both directions. Too narrow and it misses the writer it
 * exists for -- the historical offender computed its attribute names from
 * tenant data and aliased the root behind a local `const`. Too broad and it
 * fails on every application that touches `<html>` for a scroll lock, which
 * gets it suppressed rather than fixed.
 *
 * So every drill below asserts BOTH directions: the finding that must fire, and
 * the neighbouring shape that must stay quiet.
 */

import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import {
  DEFAULT_APP_ROOT,
  FINDINGS,
  formatReport,
  isGovernedAttribute,
  resolveCorpusRoot,
  runGate,
  scanSource,
} from './app-root-writer-gate.mjs';

function tempDirectory(prefix) {
  const directory = mkdtempSync(join(tmpdir(), `${prefix}-`));
  test.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

/** Run the gate over a single synthetic source file. */
function gateOn(source, { fileName = 'feature/index.ts' } = {}) {
  const root = tempDirectory('root-writer-gate');
  const full = join(root, 'src', fileName);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, source, 'utf8');
  return runGate({ appRoot: root });
}

function flatFindings(result) {
  return Object.values(result.fileFindings).flat();
}

/** Assert the gate fired for exactly the expected channels, and nothing else. */
function assertFindings(result, expected) {
  const actual = flatFindings(result).map((finding) => `${finding.kind}:${finding.channel}`);
  assert.deepEqual(actual.sort(), [...expected].sort(), formatReport(result));
}

function assertClean(result) {
  assert.equal(result.ok, true, formatReport(result));
  assert.equal(result.total, 0, formatReport(result));
}

// --------------------------------------------------------------------------
// The writer this gate exists for
// --------------------------------------------------------------------------

test('RED: the historical reconciler, in the shape it actually had', () => {
  // Attribute names computed from a projection, the root behind a local alias,
  // and a removal path in a second function. Nothing here is a string literal a
  // grep could find.
  const result = gateOn(`
    export function syncAnatomy(next: Record<string, string>, owned: string[]): void {
      const root = document.documentElement;
      for (const key of owned) {
        if (!(key in next) && root.hasAttribute(key)) root.removeAttribute(key);
      }
      for (const [key, value] of Object.entries(next)) {
        if (root.getAttribute(key) !== value) root.setAttribute(key, value);
      }
    }
  `);

  assertFindings(result, [
    `${FINDINGS.rawWrite}:<computed>`,
    `${FINDINGS.rawWrite}:<computed>`,
  ]);
  assert.ok(
    flatFindings(result).every((finding) => /computed/.test(finding.detail)),
    'a computed channel name must be reported as unprovable, not silently skipped',
  );
});

test('RED: a literal governed channel written directly', () => {
  const result = gateOn(`
    export function stamp(mode: string): void {
      document.documentElement.setAttribute("data-tenant-theme-mode", mode);
    }
  `);
  assertFindings(result, [`${FINDINGS.rawWrite}:data-tenant-theme-mode`]);
});

test('RED: the root reached through a destructured binding', () => {
  const result = gateOn(`
    export function stamp(): void {
      const { documentElement } = document;
      documentElement.setAttribute("data-theme", "dark");
    }
  `);
  assertFindings(result, [`${FINDINGS.rawWrite}:data-theme`]);
});

test('RED: a governed channel written through a named constant', () => {
  const result = gateOn(`
    const CHANNEL = "data-anatomy-card";
    export function stamp(value: string): void {
      document.documentElement.setAttribute(CHANNEL, value);
    }
  `);
  assertFindings(result, [`${FINDINGS.rawWrite}:data-anatomy-card`]);
});

test('RED: dataset and delete reach the same attributes', () => {
  const result = gateOn(`
    export function stamp(): void {
      const root = document.documentElement;
      root.dataset.tenantThemeMode = "dark";
      delete root.dataset.anatomyCard;
    }
  `);
  assertFindings(result, [
    `${FINDINGS.rawWrite}:data-tenant-theme-mode`,
    `${FINDINGS.rawWrite}:data-anatomy-card`,
  ]);
});

test('RED: the theme class and the theme style property', () => {
  const result = gateOn(`
    export function paint(dark: boolean): void {
      const root = document.documentElement;
      root.classList.toggle("dark", dark);
      root.style.colorScheme = dark ? "dark" : "light";
      root.style.setProperty("color-scheme", "dark");
    }
  `);
  assertFindings(result, [
    `${FINDINGS.rawWrite}:dark`,
    `${FINDINGS.rawWrite}:color-scheme`,
    `${FINDINGS.rawWrite}:color-scheme`,
  ]);
});

test('RED: lang, dir and a wholesale className replacement', () => {
  const result = gateOn(`
    export function localize(lang: string): void {
      document.documentElement.lang = lang;
      document.documentElement.dir = "rtl";
      document.documentElement.className = "reset";
    }
  `);
  assertFindings(result, [
    `${FINDINGS.rawWrite}:lang`,
    `${FINDINGS.rawWrite}:dir`,
    `${FINDINGS.rawWrite}:class`,
  ]);
});

// --------------------------------------------------------------------------
// The supported path, and the neighbours that must not be caught with it
// --------------------------------------------------------------------------

test('GREEN: the claim API is the supported path', () => {
  const result = gateOn(`
    import { claimRootAttribute, claimRootAttributeSet } from "@rottay/design-system";

    export function own(mode: string, anatomy: Record<string, string>) {
      const root = document.documentElement;
      const set = claimRootAttributeSet(root, "data-anatomy-");
      set.reconcile(anatomy);
      const release = claimRootAttribute(root, "data-tenant-theme-mode", mode);
      return () => {
        release();
        set.release();
      };
    }
  `);
  assertClean(result);
  assert.ok(result.rootReferences > 0, 'the scan must have seen the root, or it proves nothing');
  assert.ok(result.claimUsages > 0, 'the fixture must exercise the claim API');
});

test('GREEN: an application channel the design system does not govern', () => {
  // A feature marking the root for its own CSS is not a governed channel, and a
  // gate that failed here would be turned off rather than obeyed.
  const result = gateOn(`
    export function mark(): void {
      document.documentElement.dataset.bithireDetailDictationEnhancer = "true";
      delete document.documentElement.dataset.bithireDetailDictationEnhancer;
    }
  `);
  assertClean(result);
  assert.ok(result.rootReferences > 0, 'the scan must have seen the root');
});

test('GREEN: root style the design system does not own', () => {
  const result = gateOn(`
    export function lock(): void {
      const { documentElement } = document;
      documentElement.style.overflow = "hidden";
      documentElement.style.overscrollBehavior = "contain";
      documentElement.classList.add("rt-scroll-locked");
    }
  `);
  assertClean(result);
});

test('GREEN: reading a governed channel is not writing it', () => {
  const result = gateOn(`
    export function read(): string {
      const root = document.documentElement;
      const observer = new MutationObserver(() => {});
      observer.observe(root, { attributeFilter: ["data-theme"] });
      return root.getAttribute("data-theme") ?? root.lang;
    }
  `);
  assertClean(result);
  assert.ok(result.rootReferences > 0, 'the scan must have seen the root');
});

test('GREEN: a governed name written to some other element', () => {
  // The channel is the root's. The same attribute on a panel is that panel's
  // own scope, which is how tenant-scoped subtrees are supposed to work.
  const result = gateOn(`
    export function scope(panel: HTMLElement): void {
      panel.setAttribute("data-theme", "dark");
      panel.classList.toggle("dark", true);
    }
  `);
  assertClean(result);
});

// --------------------------------------------------------------------------
// Claim provenance
// --------------------------------------------------------------------------

test('RED: a claim re-implemented inside the application', () => {
  const result = gateOn(`
    export function claimRootAttribute(element: Element, name: string, value: string) {
      const previous = element.getAttribute(name);
      element.setAttribute(name, value);
      return () => {
        if (previous === null) element.removeAttribute(name);
        else element.setAttribute(name, previous);
      };
    }
  `);
  assertFindings(result, [`${FINDINGS.localClaim}:claimRootAttribute`]);
});

test('RED: a claim imported from anywhere but the design system', () => {
  const result = gateOn(`
    import { claimRootAttribute } from "@/core/lib/root-attributes";
    export const release = claimRootAttribute(document.documentElement, "data-theme", "dark");
  `);
  assertFindings(result, [`${FINDINGS.localClaim}:claimRootAttribute`]);
});

// --------------------------------------------------------------------------
// The gate's own integrity
// --------------------------------------------------------------------------

test('a missing corpus is a hard failure, never a pass', () => {
  assert.throws(
    () => resolveCorpusRoot(join(tempDirectory('root-writer-absent'), 'nowhere')),
    /corpus MISSING/,
  );
});

test('the governed channel set covers families, not just exact names', () => {
  assert.equal(isGovernedAttribute('data-tenant'), true);
  assert.equal(isGovernedAttribute('data-tenant-theme-mode'), true);
  assert.equal(isGovernedAttribute('data-anatomy-sidebar'), true);
  assert.equal(isGovernedAttribute('data-bithire-detail-dictation-enhancer'), false);
  assert.equal(isGovernedAttribute('data-rt-tone'), false);
});

test('the scanner reports a line for every finding', () => {
  const { findings } = scanSource({
    fileName: 'probe.ts',
    text: '\n\ndocument.documentElement.setAttribute("data-theme", "dark");\n',
  });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].line, 3);
});

test('the real application corpus holds zero direct writers', () => {
  // The gate ships with no baseline, so this is the assertion that makes the
  // remediation permanent rather than momentary.
  const result = runGate({ appRoot: DEFAULT_APP_ROOT });
  assert.ok(result.files > 100, `expected a real corpus, scanned ${result.files} files`);
  assert.ok(result.rootReferences > 0, 'the scan saw no document root at all in the app');
  assert.ok(result.claimUsages > 0, 'the app no longer uses the claim API; check the corpus root');
  assertClean(result);
});
