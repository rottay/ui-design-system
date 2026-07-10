import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-GAT-03 — hostile-tenant whitelabel proof (proposal P-05).
//
// Whitelabel used to be true by construction. This makes it true by proof.
//
// The probe drives /probe/whitelabel-torture three times: once under each of
// two hostile BrandTheme proof fixtures (torture-dark, torture-light) and once
// under the real `rottay` tenant, which is the REFERENCE load. The fixtures are
// never registered as product tenants and never generate an artifact — their
// slugs are absent from BUNDLED_TENANT_SLUGS, so DesignSystemProvider compiles
// them at render time through generateTenantCssFromResolvedVisualConfig, the
// same path a DB-driven customer tenant takes.
//
// COUNTING METHOD (the whole contract; read before touching a probe)
// ------------------------------------------------------------------
// For every entry in PROBES — a (component part, CSS property) pair — the probe
// reads the part's COMPUTED value on each load, plus the value the tenant's
// BrandTheme ASKED for on that channel (`themePath`, read from the theme object
// the surface publishes on `window`). Two independent checks then run, and
// either one failing records ONE violation keyed `<slug>/<part>/<property>`:
//
//   1. `static-across-tenants` — computed(torture-dark) === computed(rottay).
//      The two tenants disagree on this channel by construction, so a part that
//      paints the same value under both is not reading the tenant at all. This
//      is the hardcode detector.
//
//   2. `not-derived` — computed(torture-dark) !== the value torture-dark's
//      BrandTheme specifies at `themePath`. The part moved, but not to what the
//      tenant asked for: a later rule overwrote the token, or the part reads a
//      different channel, or it paints its own literal.
//
// The expectation for (2) MUST come from the theme object, never from reading
// the `--ds-*` variable back off <html>. That read only proves the component
// consumes the variable: when a more specific rule overwrites the variable, the
// component and the read move together and the check passes while the tenant's
// value is silently gone. That is exactly the failure this WO exists to catch.
//
// The differential in (1) can only detect a hardcode on a channel where the two
// themes actually DISAGREE. That precondition is not assumed, it is gated: the
// unit test packages/core/src/compilers/brand-theme/tests/torture-fixtures.test.ts
// asserts every variable in TORTURE_PROBE_VARS compiles to a different value
// under a torture fixture than under the matching first-party theme. Weakening a
// fixture turns that test red instead of silently voiding a probe here.
//
// Derivation (2) is asserted on torture-dark only, so `themePath` entries name
// the dark side of the palette where a channel has light/dark variants.
//
// The differential axis is deliberately torture-dark vs rottay: BOTH render on
// data-theme=dark, so any difference is attributable to the tenant and never to
// the light/dark mode. torture-light exists to prove the light compile path, to
// carry the RTL column, and to be checked for declaring every probed token.
//
// A probe whose element is MISSING is a hard failure, never a violation and
// never baselined — a probe that cannot find its target has silently stopped
// proving anything, which is worse than a red gate.
//
// Violations are recorded in torture-baseline.json and the baseline is
// DECREASE-ONLY: the run fails when a violation appears that the baseline does
// not already list. Fix the hardcode; never widen the baseline to absorb one.
// `TORTURE_UPDATE_BASELINE=1` rewrites the file to the INTERSECTION of the old
// baseline and the current run, so fixed entries drop out and new ones can never
// be added. (When the file does not exist at all it is bootstrapped from the
// current run — that is the one-time implementation measurement.)
//
// Screenshots land in test-artifacts/gates/gat-03/ on every run. They are
// informational: a human confirms the torture tenant is legibly themed and the
// RTL column mirrors without clipping. They are NOT pixel-diffed — a garish
// fixture is a probe target, not visual canon.
// ---------------------------------------------------------------------------

type Fixture = 'torture-dark' | 'torture-light' | 'rottay';

const FIXTURES: readonly Fixture[] = ['torture-dark', 'torture-light', 'rottay'];
const DIFFERENTIAL_FIXTURE: Fixture = 'torture-dark';
const REFERENCE_FIXTURE: Fixture = 'rottay';

type ProbeKind = 'color' | 'length' | 'font';

interface Probe {
  /** `<slug>/<part>/<property>` — the stable violation key. Semantic, not a CSS chain. */
  key: string;
  /** CSS selector, scoped by a `data-testid` the probe page owns (the dialog is portaled). */
  selector: string;
  /** The computed longhand to read. Longhands only — shorthands are not comparable. */
  property: string;
  /** Dot path into the tenant's BrandTheme naming the channel this part must paint from. */
  themePath: string | null;
  kind: ProbeKind;
  /** Only reachable once the flagship's modal is opened (it renders in a portal). */
  requiresModal?: boolean;
}

// The documented probe list. Every entry was verified against the modern-engine
// source: the element named here is the one that actually paints the property,
// and the themePath names the BrandTheme channel whose value it must land on.
const PROBES: readonly Probe[] = [
  // Button — VARIANT_STYLES drives bg/color per variant; radius resolves
  // --ds-radius-button, which the foundation aliases onto --ds-radius-md.
  { key: 'button/primary/background-color', selector: '[data-testid="probe-button"] .rottay-button--primary', property: 'background-color', themePath: 'chrome.controls.buttonPrimary.bg', kind: 'color' },
  { key: 'button/primary/color', selector: '[data-testid="probe-button"] .rottay-button--primary', property: 'color', themePath: 'chrome.controls.buttonPrimary.color', kind: 'color' },
  { key: 'button/primary/border-radius', selector: '[data-testid="probe-button"] .rottay-button--primary', property: 'border-top-left-radius', themePath: 'surfaces.borderRadius.md', kind: 'length' },
  { key: 'button/secondary/background-color', selector: '[data-testid="probe-button"] .rottay-button--secondary', property: 'background-color', themePath: 'chrome.controls.buttonSecondary.bg', kind: 'color' },

  // Input — the Default cell's bare input paints its own shell (no addons).
  { key: 'input/default/background-color', selector: '[data-testid="probe-input"] input', property: 'background-color', themePath: 'chrome.controls.input.bg', kind: 'color' },
  { key: 'input/default/color', selector: '[data-testid="probe-input"] input', property: 'color', themePath: 'chrome.controls.input.color', kind: 'color' },
  { key: 'input/default/border-color', selector: '[data-testid="probe-input"] input', property: 'border-top-color', themePath: 'chrome.controls.input.border', kind: 'color' },
  { key: 'input/default/border-radius', selector: '[data-testid="probe-input"] input', property: 'border-top-left-radius', themePath: 'surfaces.borderRadius.md', kind: 'length' },

  // Ground — the page canvas. Before WO-TOK-06 a tenant could not choose the
  // surface its product sits on: `palette.darkBackgroundColor` compiled only to
  // --ds-color-dark-bg, which nothing consumes, and the generator's dark block
  // wrote a literal. torture-dark asked for #050307 and the canvas painted
  // #0a0a0a. The differential runs on torture-dark, so the channel named here is
  // the dark ground; torture-light's clear ground is `palette.backgroundColor`.
  { key: 'ground/canvas/background-color', selector: '[data-testid="probe-ground"]', property: 'background-color', themePath: 'palette.darkBackgroundColor', kind: 'color' },

  // Select — the gallery's simple select takes the NATIVE <select> path. It
  // reads --ds-select-bg falling back to --ds-surface-control, which derives
  // from --ds-color-bg-input, which the compiler emits from the tenant's own
  // `chrome.controls.input.bg`. The whole chain terminates in the BrandTheme,
  // so the derivation check applies and not only the differential. (Before
  // WO-TOK-08 nothing emitted --ds-color-bg-input, the chain terminated in the
  // DS dark default, and this probe's comment claimed there was no channel.)
  { key: 'select/native/background-color', selector: '[data-testid="probe-select"] select', property: 'background-color', themePath: 'chrome.controls.input.bg', kind: 'color' },

  // Card — the default `elevated` variant has border-width 0, so its border is
  // unobservable; the outlined card in the extras block carries the border.
  { key: 'card/root/background-color', selector: '[data-testid="probe-card"] .ds-card', property: 'background-color', themePath: 'chrome.cardComponent.bg', kind: 'color' },
  { key: 'card/outlined/border-color', selector: '[data-testid="probe-extras"] .ds-card--outlined', property: 'border-top-color', themePath: 'chrome.cardComponent.border', kind: 'color' },

  // Badge — probed through the extras block's `content` badge, the only form
  // that reaches Badge's standalone branch and actually paints chrome. It reads
  // the palette directly, and the dark fixture's palette is the dark side.
  { key: 'badge/primary/background-color', selector: '[data-testid="probe-extras"] .rottay-badge', property: 'background-color', themePath: 'palette.darkPrimaryColor', kind: 'color' },
  { key: 'badge/primary/font-family', selector: '[data-testid="probe-extras"] .rottay-badge', property: 'font-family', themePath: 'typography.fontFamilyBase', kind: 'font' },
  { key: 'badge/primary/border-radius', selector: '[data-testid="probe-extras"] .rottay-badge', property: 'border-top-left-radius', themePath: 'surfaces.borderRadius.sm', kind: 'length' },

  // Table — the primitive only paints its border when `bordered`, which is why
  // the extras block renders a bordered table.
  { key: 'table/root/border-color', selector: '[data-testid="probe-extras"] table', property: 'border-top-color', themePath: 'chrome.table.border', kind: 'color' },
  { key: 'table/header/border-color', selector: '[data-testid="probe-extras"] th', property: 'border-bottom-color', themePath: 'chrome.table.border', kind: 'color' },

  // Tabs — the active underline is a separate span; the tab itself carries color.
  { key: 'tabs/active/color', selector: '[data-testid="probe-tabs"] [role="tab"][aria-selected="true"]', property: 'color', themePath: 'chrome.tabs.colorActive', kind: 'color' },
  { key: 'tabs/list/border-color', selector: '[data-testid="probe-tabs"] [role="tablist"]', property: 'border-bottom-color', themePath: 'chrome.tabs.border', kind: 'color' },

  // Modal — portaled, so it is selected at document scope after being opened.
  { key: 'modal/dialog/background-color', selector: '[role="dialog"]', property: 'background-color', themePath: 'chrome.modal.bg', kind: 'color', requiresModal: true },
  { key: 'modal/dialog/border-radius', selector: '[role="dialog"]', property: 'border-top-left-radius', themePath: 'surfaces.borderRadius.lg', kind: 'length', requiresModal: true },

  // Toast — the modern engine's `default` variant has no chrome.toast.*
  // BrandTheme section of its own (WO-ENG-21), so it reads the card surface
  // pair, the only BrandTheme-reachable neutral elevated surface today.
  { key: 'toast/default/background-color', selector: '[data-testid="probe-extras"] [role="alert"]', property: 'background-color', themePath: 'chrome.cardComponent.bg', kind: 'color' },
];

interface Reading {
  computed: string | null;
  declared: string | null;
  missing: boolean;
}

type Readings = Record<string, Reading>;

interface Violation {
  key: string;
  reason: 'static-across-tenants' | 'not-derived';
}

interface Baseline {
  countingMethod: string;
  violations: Violation[];
}

// --- repo paths -------------------------------------------------------------

function repoRoot(): string {
  let dir = test.info().project.testDir;
  while (!existsSync(join(dir, 'pnpm-workspace.yaml'))) {
    const parent = dirname(dir);
    if (parent === dir) throw new Error('pnpm-workspace.yaml not found above testDir');
    dir = parent;
  }
  return dir;
}

const baselinePath = (): string => join(test.info().project.testDir, 'whitelabel', 'torture-baseline.json');
const artifactDir = (): string => join(repoRoot(), 'test-artifacts', 'gates', 'gat-03');

// --- browser-side reader ----------------------------------------------------

/**
 * Reads every probe on the current load. `computed` is what the COMPONENT
 * actually painted; `declared` is what the TENANT'S BrandTheme asked for at the
 * probe's `themePath`, taken from the theme object the surface publishes on
 * `window` rather than from the CSS cascade. Both are normalized by the same
 * browser that did the painting, so `#FF00AA` and `rgb(255, 0, 170)` compare
 * equal — but a value the cascade has since overwritten cannot.
 */
async function readProbes(page: Page, probes: Probe[]): Promise<Readings> {
  return page.evaluate((probeList: Probe[]) => {
    // Let the browser parse a theme value (e.g. '#FF00AA') into the same
    // normalized form getComputedStyle returns. Null when it is not a legal
    // declaration for that property.
    const resolveThrough = (value: string, property: string): string | null => {
      const probeEl = document.createElement('span');
      probeEl.style.position = 'absolute';
      probeEl.style.opacity = '0';
      probeEl.style.pointerEvents = 'none';
      probeEl.style.setProperty(property, value);
      if (probeEl.style.getPropertyValue(property) === '') return null;
      document.body.appendChild(probeEl);
      const resolved = window.getComputedStyle(probeEl).getPropertyValue(property);
      probeEl.remove();
      return resolved || null;
    };

    const normalizeFont = (value: string): string =>
      value.replace(/["']/g, '').replace(/\s*,\s*/g, ',').trim().toLowerCase();

    const brandTheme = (window as Window & { __probeBrandTheme?: unknown }).__probeBrandTheme;

    const atPath = (path: string): string | null => {
      let cursor: unknown = brandTheme;
      for (const segment of path.split('.')) {
        if (typeof cursor !== 'object' || cursor === null) return null;
        cursor = (cursor as Record<string, unknown>)[segment];
      }
      return typeof cursor === 'string' ? cursor : null;
    };

    const out: Record<string, { computed: string | null; declared: string | null; missing: boolean }> = {};

    for (const probe of probeList) {
      const element = document.querySelector(probe.selector);
      if (!element) {
        out[probe.key] = { computed: null, declared: null, missing: true };
        continue;
      }

      let computed = window.getComputedStyle(element).getPropertyValue(probe.property).trim();
      if (probe.kind === 'font') computed = normalizeFont(computed);

      let declared: string | null = null;
      if (probe.themePath) {
        const asked = atPath(probe.themePath);
        if (asked) {
          declared =
            probe.kind === 'color'
              ? resolveThrough(asked, 'color')
              : probe.kind === 'font'
                ? normalizeFont(asked)
                : asked;
        }
      }

      out[probe.key] = { computed, declared, missing: false };
    }

    return out;
  }, probes);
}

// --- page driving -----------------------------------------------------------

/**
 * The DOM is ground truth over any screenshot. TenantProvider writes
 * `data-tenant` and ThemeProvider injects the compiled tenant CSS as
 * `<style id="ds-chrome-<slug>">`, both in effects after hydration, so a page
 * that has already painted its heading can still be showing the default
 * palette. Those two DOM facts are the causal signal that the tenant is live.
 *
 * Ground LUMINANCE cannot serve as that signal here: the app canvas
 * (--ds-color-bg-primary) is not a BrandTheme channel. A dynamic tenant's
 * palette.darkBackgroundColor compiles to --ds-color-dark-bg and never reaches
 * the canvas, and BrandPalette has no light background field at all, so both
 * torture fixtures paint the DS default canvas regardless of their theme mode.
 * Only generated first-party artifacts set the canvas per tenant.
 */
async function gotoFixture(page: Page, fixture: Fixture, extraParams = ''): Promise<void> {
  await page.goto(`/probe/whitelabel-torture?fixture=${fixture}${extraParams}`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /whitelabel torture/i }).waitFor({ timeout: 30_000 });

  await page.waitForFunction(
    ({ slug, dynamic }: { slug: string; dynamic: boolean }) => {
      if (document.documentElement.getAttribute('data-tenant') !== slug) return false;
      // The surface publishes the active fixture's BrandTheme in the same commit
      // that mounts the providers, so its presence pairs with the tenant attrs.
      if (!(window as Window & { __probeBrandTheme?: unknown }).__probeBrandTheme) return false;
      // Bundled tenants (rottay) get their variables from the static styles
      // bundle and never emit a chrome style tag; dynamic tenants must have one.
      if (dynamic && !document.getElementById(`ds-chrome-${slug}`)) return false;
      return window.getComputedStyle(document.documentElement).getPropertyValue('--ds-button-primary-bg').trim().length > 0;
    },
    { slug: fixture, dynamic: fixture !== 'rottay' },
    { timeout: 20_000 },
  );

  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
}

async function openModal(page: Page): Promise<void> {
  await page.locator('[data-testid="probe-modal"]').getByRole('button', { name: /open modal/i }).first().click();
  await page.getByRole('dialog').waitFor({ timeout: 10_000 });
}

// --- baseline ---------------------------------------------------------------

const COUNTING_METHOD =
  'One violation per (component part, CSS property) probe in e2e/whitelabel/torture.spec.ts PROBES. ' +
  'reason=static-across-tenants: the part computes the SAME value under torture-dark and under rottay, ' +
  'two tenants that declare different values for that channel, so the part ignores the tenant. ' +
  'reason=not-derived: the part computes a value different from the one torture-dark declared for the ' +
  'token that drives it. A missing element is a hard failure, never a violation. Decrease-only: a run ' +
  'fails on any violation absent from this file; TORTURE_UPDATE_BASELINE=1 rewrites it to the ' +
  'intersection with the current run, so entries can only be removed.';

function readBaseline(): Baseline | null {
  const path = baselinePath();
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8')) as Baseline;
}

function writeBaseline(violations: Violation[]): void {
  const sorted = [...violations].sort((a, b) => a.key.localeCompare(b.key) || a.reason.localeCompare(b.reason));
  const body = JSON.stringify({ countingMethod: COUNTING_METHOD, violations: sorted }, null, 2);
  writeFileSync(baselinePath(), `${body}\n`);
}

const fingerprint = (violation: Violation): string => `${violation.key}|${violation.reason}`;

function requireReadings(store: Map<Fixture, Readings>, fixture: Fixture): Readings {
  const found = store.get(fixture);
  if (!found) throw new Error(`${fixture} readings missing — the collection test did not run`);
  return found;
}

// --- suite ------------------------------------------------------------------

const readings = new Map<Fixture, Readings>();

test.describe.configure({ mode: 'serial' });

test.describe('whitelabel torture probe', () => {
  for (const fixture of FIXTURES) {
    test(`collect computed values under ${fixture}`, async ({ page }) => {
      test.setTimeout(90_000);

      await page.setViewportSize({ width: 1280, height: 900 });
      await gotoFixture(page, fixture);

      mkdirSync(artifactDir(), { recursive: true });
      await page.screenshot({ path: join(artifactDir(), `${fixture}.png`), fullPage: true });

      const collected = await readProbes(page, PROBES.filter((probe) => !probe.requiresModal));

      await openModal(page);
      Object.assign(collected, await readProbes(page, PROBES.filter((probe) => probe.requiresModal === true)));
      await page.screenshot({ path: join(artifactDir(), `${fixture}-modal.png`) });

      readings.set(fixture, collected);

      const missing = Object.entries(collected)
        .filter(([, reading]) => reading.missing)
        .map(([key]) => key);
      expect(missing, `probe elements vanished under ${fixture} — fix the selector, never baseline this`).toEqual([]);
    });
  }

  test('every probed channel derives from the tenant, and none is hardcoded', async () => {
    const torture = requireReadings(readings, DIFFERENTIAL_FIXTURE);
    const reference = requireReadings(readings, REFERENCE_FIXTURE);

    const violations: Violation[] = [];

    for (const probe of PROBES) {
      const observed = torture[probe.key];
      const control = reference[probe.key];

      if (observed.computed !== null && observed.computed === control.computed) {
        violations.push({ key: probe.key, reason: 'static-across-tenants' });
        continue;
      }

      if (probe.themePath) {
        expect(
          observed.declared,
          `torture-dark's BrandTheme sets nothing at ${probe.themePath}; the probe for ${probe.key} has no anchor`,
        ).not.toBeNull();

        if (observed.computed !== observed.declared) {
          violations.push({ key: probe.key, reason: 'not-derived' });
        }
      }
    }

    const baseline = readBaseline();

    if (process.env.TORTURE_UPDATE_BASELINE === '1') {
      // Intersection only: fixed entries drop out, new ones can never be added.
      // A missing file is the one-time implementation measurement.
      const next = baseline
        ? baseline.violations.filter((entry) => violations.some((found) => fingerprint(found) === fingerprint(entry)))
        : violations;
      writeBaseline(next);
      test.info().annotations.push({ type: 'baseline', description: `wrote ${next.length} violations` });
      return;
    }

    if (!baseline) {
      throw new Error('torture-baseline.json missing — bootstrap it with TORTURE_UPDATE_BASELINE=1');
    }

    const allowed = new Set(baseline.violations.map(fingerprint));
    const novel = violations.filter((violation) => !allowed.has(fingerprint(violation)));
    const fixed = baseline.violations.filter(
      (entry) => !violations.some((found) => fingerprint(found) === fingerprint(entry)),
    );

    if (fixed.length > 0) {
      test.info().annotations.push({
        type: 'ratchet',
        description: `${fixed.length} baselined violation(s) no longer reproduce: ${fixed
          .map(fingerprint)
          .join(', ')}. Shrink the baseline with TORTURE_UPDATE_BASELINE=1.`,
      });
    }

    expect(
      novel.map(fingerprint),
      'new whitelabel violations: these component parts do not follow the tenant. Fix the hardcode; do not widen the baseline.',
    ).toEqual([]);
  });

  test('torture-light defines every probed channel', async () => {
    const light = requireReadings(readings, 'torture-light');

    const undefinedChannels = PROBES.filter(
      (probe) => probe.themePath !== null && light[probe.key].declared === null,
    ).map((probe) => probe.key);

    expect(undefinedChannels, 'torture-light leaves these probed channels unset').toEqual([]);
  });

  test('RTL mirrors the surface without clipping', async ({ page }) => {
    test.setTimeout(90_000);

    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoFixture(page, 'torture-dark', '&rtl=1');

    await expect(page.locator('[data-testid="probe-rtl"]')).toBeVisible();

    const direction = await page.evaluate(() => {
      const block = document.querySelector('[data-testid="probe-rtl"]');
      return {
        html: document.documentElement.getAttribute('dir'),
        block: block ? window.getComputedStyle(block).direction : null,
      };
    });
    expect(direction.html, 'the ar locale must flip <html dir>').toBe('rtl');
    expect(direction.block, 'the RTL block must compute direction: rtl').toBe('rtl');

    // Nothing inside the width-constrained RTL block may spill past it, and the
    // long strings must not force a horizontal scrollbar on the document.
    const overflow = await page.evaluate(() => {
      const block = document.querySelector('[data-testid="probe-rtl"]');
      if (!block) return null;
      const blockRect = block.getBoundingClientRect();
      const spilled = Array.from(block.querySelectorAll('*'))
        .filter((child) => {
          const rect = child.getBoundingClientRect();
          return rect.width > 0 && (rect.left < blockRect.left - 1 || rect.right > blockRect.right + 1);
        })
        .map((child) => `${child.tagName.toLowerCase()}.${child.getAttribute('class') ?? ''}`);
      return {
        spilled,
        documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    expect(overflow, 'the RTL block did not render').not.toBeNull();
    expect(overflow?.spilled, 'RTL content spilled outside the constrained block').toEqual([]);
    expect(overflow?.documentOverflow, 'RTL content forced a horizontal scrollbar').toBeLessThanOrEqual(1);

    mkdirSync(artifactDir(), { recursive: true });
    await page.screenshot({ path: join(artifactDir(), 'torture-dark-rtl.png'), fullPage: true });
  });
});
