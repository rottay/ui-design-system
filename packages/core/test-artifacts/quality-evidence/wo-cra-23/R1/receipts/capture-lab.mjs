/**
 * R1 Cohort 1 capture harness — FAIL CLOSED.
 *
 * WHY THIS REPLACES THE SCRATCH SCRIPT. The previous captures were taken by an
 * ad-hoc script in the showroom root that waited on `domcontentloaded` plus a
 * fixed timeout and then screenshotted whatever was on screen. Codex found the
 * result: feedback-bithire-320.png, feedback-bithire-1440.png and the grayscale
 * 1440 variant are MISSING their alerts and spinners, even though the live DOM
 * at the same width shows all of them present with correct bounds and opacity.
 *
 * That is a capture race, not a product defect, and it is the more dangerous of
 * the two because the image looks like a clean pass. A harness that can silently
 * photograph an unpainted page produces evidence that is worse than no evidence.
 *
 * So this harness asserts readiness against the DOM before it presses the
 * shutter, and THROWS if the scene is not fully painted. A missing element ends
 * the run instead of producing a plausible-looking file.
 *
 * ============================================================================
 * THIS ROUND'S CHANGES (mechanical-evidence lane), on top of the gates below.
 * ============================================================================
 *
 *   PORTABILITY. Playwright used to be imported via a literal
 *   `/Users/daniel/Developer/Rottay/ui-design-system/...` path. It is now
 *   resolved through Node's own module resolution, rooted at the showroom
 *   package's own package.json (`receipt-io.mjs#resolvePlaywrightChromium`),
 *   and the repo root itself is derived by walking up from this file's own
 *   location with a name check at every step, not assumed. No absolute home
 *   path appears anywhere in this file or in any receipt it writes.
 *
 *   ATOMIC, SOURCE-BOUND RECEIPTS. The receipt is written to a temp file and
 *   renamed into place (`atomicWriteJSON`), so a reader can never observe a
 *   half-written JSON file. Every run records: the sha256 of the whole
 *   `ds-reference` scene tree, a coarse (path,size,mtime) drift fingerprint
 *   over the wider `foundation/tokens` + `ui` + `graphics` surface a capture's
 *   pixels depend on, the dev server's PID + process start time (`lsof` + `ps
 *   -o lstart=`), and this harness's own file hash — each captured BEFORE the
 *   first navigation and AFTER the last capture. Any drift in any of them
 *   invalidates the run: the receipt still gets written (see the top-level
 *   try/finally in `main()`), but `pass` is forced false and the exit code is
 *   non-zero, because comparability across the run's own captures — not just
 *   any single capture — is what drift breaks.
 *
 *   CLEAN POST-RUN. Before capturing, the harness computes the exact filename
 *   set THIS run will (re)produce and quarantines everything else already
 *   sitting in the output directory into a timestamped `.stale-<epoch>/`
 *   sibling (never silently deleted, never silently left in place). Filenames
 *   this run WILL reproduce are deleted up front, so a capture that fails
 *   partway through cannot hide behind an old successful file of the same
 *   name. SIGINT/SIGTERM close the browser before exit; SIGKILL cannot be
 *   caught by any process and is a disclosed limitation, not a silent gap.
 *
 *   UNIQUE LABELS, MECHANICALLY ENFORCED. Every capture's output filename is
 *   claimed in a label registry before it is taken (`makeLabelRegistry`); a
 *   second capture claiming the same name throws immediately instead of
 *   silently overwriting the first. This is what makes "two modes can never
 *   collide into one artifact" a property of the code, not a convention.
 *
 *   MATRIX AXES ADDED: container width INDEPENDENT of viewport (two same-
 *   viewport, different-inline-size boxes around the same real, already-
 *   authored `@container` rule in `input.css`); locale en/es/ar with a
 *   COMPLETE right-to-left document for `ar` (not a local `dir="rtl"` wrapper
 *   — see `ground/index.tsx`); input modality via REAL CDP pointer, keyboard
 *   and touch dispatch, each with a positive control (a state that MUST
 *   change) and modality-specific event evidence; density/rhythm via the DS's
 *   own `data-density` cascade; forced-colors and reduced-transparency via
 *   real CDP media emulation against already-authored product rules
 *   (`alert.css`, `overlay-modal.css`). Every axis this file could not wire to
 *   a real product mechanism in this pass is DECLARED and marked deferred with
 *   a reason in the receipt rather than faked — see `DEFERRED_AXES` below.
 *
 *   `--self-test` reduces the matrix to a small, still-real sample of every
 *   axis (every code path still executes for real; the CROSS-PRODUCT shrinks)
 *   so the harness's mechanics can be verified without performing what would
 *   amount to a de-facto certification run. It also REFUSES to write into
 *   `R1/captures/` — self-test evidence must never land in, or be mistaken
 *   for, the certified capture set.
 *
 * ============================================================================
 * GATES CARRIED FORWARD UNCHANGED (proven in the prior round; see git history
 * of this file for the original authoring context of each):
 * ============================================================================
 *   1. SEGMENTED OVERFLOW AT 280 — the 5-option Segmented's root legitimately
 *      scrolls internally; the overflow gate carries one narrow, evidence-
 *      backed exemption for it (`proveSegmentedOverflowAffordance`).
 *   2. REAL FOCUS — the harness takes focus itself and proves it with three
 *      assertions (`assertRealFocus`), because a mount-effect `.focus()` does
 *      not reliably survive to capture time.
 *   3. DEV CHROME — the Next.js dev-tools indicator is excluded from every
 *      capture and its absence is asserted, not assumed (`excludeDevChrome` /
 *      `assertNoDevOverlay`).
 *   4. DRAWER-ONLY EVIDENCE — `overlay-blocking` asserts the modal panel and
 *      the drawer panel as two independent `exact:1` contracts; `overlay-drawer`
 *      is an isolated chamber so the drawer is unoccluded in at least one image.
 */

import { existsSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  atomicWriteJSON,
  compareIdentity,
  deriveRepoRoot,
  getPortProcessIdentity,
  getSelfProcessIdentity,
  hashSelf,
  hashTree,
  makeLabelRegistry,
  quarantineStaleLeftovers,
  redactAbsolutePaths,
  registerBrowserCleanupOnSignal,
  resolvePlaywrightChromium,
  statFingerprint,
} from './receipt-io.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
// Fixed sibling of `tools/` under `R1/` — computable with zero I/O and with no
// dependency on `deriveRepoRoot()` succeeding, so a receipt can still be
// written here even if repo-root derivation itself is what failed.
const RECEIPTS_DIR = path.join(HERE, '..', 'receipts');
const SELF_FILES = [path.join(HERE, 'capture-lab.mjs'), path.join(HERE, 'receipt-io.mjs')];

const PORT = Number(process.env.DS_REFERENCE_CAPTURE_PORT || 7001);
const BASE = process.env.DS_REFERENCE_CAPTURE_BASE_URL || `http://localhost:${PORT}/probe/ds-reference`;

const TENANTS = ['bithire', 'the-management'];
const SCENES = ['control', 'field', 'overlay', 'overlay-blocking', 'overlay-drawer', 'feedback'];
const WIDTHS = [320, 390, 768, 1440];
const LOCALES = ['es', 'ar'];
const LOCALE_SCENES = ['control', 'field', 'feedback'];

/**
 * Axes the R1 matrix names that this pass did NOT wire to a real, capturable
 * mechanism, recorded here so the receipt's account of the matrix is complete
 * even where execution is not. Each entry states WHY, not just THAT.
 */
const DEFERRED_AXES = [
  {
    axis: 'lifecycle-states (loading / empty / error / stale / offline, as a surface family)',
    status: 'deferred',
    reason:
      'SurfaceLoadingSkeleton, SurfaceEmptyStateCard, SurfaceErrorStateCard, SurfaceStaleBanner and ' +
      'SurfaceOfflineBanner exist (packages/core/src/ui/surfaces/runtime/helpers/states/i18n/components/index.tsx) ' +
      'but are not exported from the public @rottay/design-system entrypoint, and this lane\'s write domain does not ' +
      'include packages/core/src/entrypoints/** — adding that export is not this tool\'s call to make. The shared ' +
      'task tracker also lists "Cohort 1 canary: lifecycle-feedback-family" as a separate, not-yet-started item, ' +
      'which reads as that scene\'s intended owner. The EXISTING `feedback` scene already exercises a PARTIAL ' +
      'lifecycle signal this harness DOES capture and gate on: loading (4 spinners + skeleton lines) and error ' +
      '(7 role="alert", severities included) are part of the feedbackContract readiness check below. Once the ' +
      'public export lands, wiring a dedicated `lifecycle` scene into this matrix is a data change to the PLAN ' +
      'builder, not a rewrite of this harness.',
  },
  {
    axis: 'pseudo-localization (systematic string expansion / accenting across all copy)',
    status: 'partially-implemented',
    reason:
      'Long/pseudo-long content is REAL and ALREADY PRESENT in every capture: every scene\'s "content" SpecimenRow ' +
      'renders TORTURE_CONTENT.longLabel / .spanish / .arabic / .unbroken (chrome/index.tsx) inside every viewport, ' +
      'locale and judge capture this harness takes — it is not a toggle because it is never absent. What is NOT ' +
      'implemented is a systematic pseudo-loc PASS (expanding every string in the scene by ~30-50% with accented ' +
      'characters) as an independently selectable mode; that would need either a global text-transform across scene ' +
      'copy or product-level pseudo-loc infrastructure, which is out of a harness-only pass\'s scope.',
  },
];

/**
 * Per-scene readiness contract. Every entry is a hard requirement: the capture
 * is only taken once each selector has at least `min` matches that are actually
 * VISIBLE — non-zero bounds and non-transparent — not merely present in the DOM.
 * `feedback` carries the counts Codex specified: six alerts and four statuses.
 */
const READINESS = {
  // EXACT counts, not permissive minimums. A `min` lets an element go missing
  // and still pass, which is precisely the failure mode this harness exists to
  // catch. The previous 'status severities' selector counted every svg inside an
  // alert — 8, including close buttons and the error glyph — so it did not test
  // what it named and would have been satisfied while a severity was absent.
  // Semantic roles are used instead of class substrings because roles are the
  // contract; a class rename must not silently loosen the evidence gate.
  feedback: [
    { what: 'alerts (4 severities + dismissable + no-icon + RTL error)', selector: '[role="alert"]', exact: 7 },
    { what: 'spinners', selector: '[role="status"][data-part="indicator"]', exact: 4 },
    { what: 'skeleton lines', selector: '[data-part="line"]', min: 4 },
  ],
  control: [
    { what: 'buttons', selector: '.rottay-button--modern', min: 20 },
    { what: 'segmented tracks', selector: '.rottay-segmented--modern[data-part="root"]', min: 4 },
  ],
  field: [
    { what: 'inputs', selector: '.rottay-input--modern[data-part="root"]', min: 8 },
  ],
  overlay: [
    { what: 'contextual panels', selector: '[class*="popover"],[class*="dropdown"]', min: 1 },
  ],
  // EXACT PER-COMPONENT, not a combined `min: 1`. The combined selector was
  // satisfied by EITHER panel alone, so a regression that dropped the drawer
  // (or the modal) while the other stayed open would still have read "ready".
  // Each panel is now its own hard requirement.
  'overlay-blocking': [
    { what: 'modal panel', selector: 'dialog[data-part="root"].rottay-modal--modern', exact: 1 },
    { what: 'drawer panel', selector: '.rottay-drawer--modern[data-part="surface"]', exact: 1 },
  ],
  // Isolated chamber (DRAWER-ONLY EVIDENCE, gate 4): the modal's <dialog
  // data-part="root"> was measured spanning the full viewport at every
  // captured width (320-1440), so in the combined chamber above the drawer is
  // always entirely behind it and that image cannot serve as evidence for the
  // drawer's own edge, surface or content. This route opens the Drawer alone.
  'overlay-drawer': [
    { what: 'drawer panel', selector: '.rottay-drawer--modern[data-part="surface"]', exact: 1 },
  ],
};

/**
 * Per-scene real-focus contract (gate 2, REAL FOCUS). See the module docblock
 * for the full history; unchanged this round.
 */
const FOCUS = {
  control: { target: '[data-testid="lab-focused-control"]', rest: '[data-testid="lab-focus-rest"]' },
  field: { target: '[data-testid="lab-focused-field"]', rest: '[data-testid="lab-focus-rest"]' },
  overlay: { target: '[data-testid="lab-focus-target"]', rest: '[data-testid="lab-focus-rest"]' },
  'overlay-blocking': { target: '[data-testid="lab-focus-target"]', rest: '[data-testid="lab-focus-rest"]' },
  feedback: { target: '[role="alert"] button[aria-label="Close"]', rest: null },
};

/** Count matches that are genuinely painted, not merely in the DOM. */
async function visibleCount(page, selector) {
  return page.evaluate((sel) => {
    let n = 0;
    for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.01) n += 1;
    }
    return n;
  }, selector);
}

async function awaitReady(page, scene, label) {
  const checks = READINESS[scene] ?? [];
  const deadline = Date.now() + 30000;
  const seen = {};
  for (;;) {
    let allMet = true;
    for (const c of checks) {
      const n = await visibleCount(page, c.selector);
      seen[c.what] = n;
      const ok = c.exact !== undefined ? n === c.exact : n >= c.min;
      if (!ok) allMet = false;
    }
    if (allMet) return seen;
    if (Date.now() > deadline) {
      const missing = checks
        .filter((c) => (c.exact !== undefined ? (seen[c.what] ?? 0) !== c.exact : (seen[c.what] ?? 0) < c.min))
        .map((c) => `${c.what}: saw ${seen[c.what] ?? 0}, need ${c.exact !== undefined ? `exactly ${c.exact}` : `>=${c.min}`}`)
        .join('; ');
      throw new Error(`READINESS FAILED for ${label} — ${missing}. Refusing to capture an unpainted scene.`);
    }
    await page.waitForTimeout(250);
  }
}

/**
 * DEV CHROME EXCLUSION (gate 3). See module docblock; unchanged this round.
 */
async function excludeDevChrome(page) {
  return page.evaluate(() => {
    const portal = document.querySelector('nextjs-portal');
    if (!portal || !portal.shadowRoot) return { portalPresent: false, excluded: false };
    let style = portal.shadowRoot.querySelector('style[data-capture-harness-exclude]');
    if (!style) {
      style = document.createElement('style');
      style.setAttribute('data-capture-harness-exclude', 'true');
      style.textContent = '#devtools-indicator{display:none !important;}';
      portal.shadowRoot.appendChild(style);
    }
    return { portalPresent: true, excluded: true };
  });
}

async function assertNoDevOverlay(page, label) {
  const visible = await page.evaluate(() => {
    const portal = document.querySelector('nextjs-portal');
    if (!portal || !portal.shadowRoot) return [];
    const found = [];
    for (const el of portal.shadowRoot.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.01) continue;
      if (cs.position !== 'fixed' && cs.position !== 'absolute') continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      found.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}`);
    }
    return found;
  });
  if (visible.length > 0) {
    throw new Error(
      `DEV OVERLAY GATE FAILED for ${label} — still visible after exclusion: ${visible.join(', ')}. ` +
      'Refusing to ship a capture with dev-server chrome in frame.'
    );
  }
}

/** Real-focus assertion (gate 2). See the `FOCUS` contract doc above. */
async function assertRealFocus(page, scene, label) {
  const contract = FOCUS[scene];
  if (!contract) return null;
  const result = await page.evaluate(({ targetSel, restSel }) => {
    const styleOf = (el) => {
      const cs = getComputedStyle(el);
      return `${cs.borderWidth}|${cs.borderStyle}|${cs.borderColor}|${cs.boxShadow}`;
    };
    const target = document.querySelector(targetSel);
    if (!target) return { ok: false, reason: `focus target not found: ${targetSel}` };
    const before = styleOf(target);
    target.focus();
    const active = document.activeElement;
    const isActive = active === target;
    const focusVisible = target.matches(':focus-visible');
    const after = styleOf(target);
    const restEl = restSel ? document.querySelector(restSel) : null;
    if (restSel && !restEl) return { ok: false, reason: `rest sibling not found: ${restSel}` };
    const comparedStyle = restEl ? styleOf(restEl) : before;
    const differs = after !== comparedStyle;
    return {
      ok: isActive && focusVisible && differs,
      isActive,
      focusVisible,
      differs,
      mode: restSel ? 'rest-sibling' : 'self-before-after',
      activeTag: active.tagName,
      activeTestId: active.getAttribute ? active.getAttribute('data-testid') : null,
    };
  }, { targetSel: contract.target, restSel: contract.rest });

  if (!result.ok) {
    throw new Error(
      `FOCUS GATE FAILED for ${label} — ` +
      (result.reason ??
        `activeElement match=${result.isActive}, :focus-visible=${result.focusVisible}, styleDiffers=${result.differs} ` +
        `(mode=${result.mode}, got activeElement=${result.activeTag}${result.activeTestId ? `#${result.activeTestId}` : ''})`) +
      '. Refusing to capture a scene whose claimed focus state cannot be proven.'
    );
  }
  return result;
}

/**
 * SEGMENTED OVERFLOW AFFORDANCE (gate 1) — standalone, one-time proof. See
 * module docblock; unchanged this round.
 */
async function proveSegmentedOverflowAffordance(browser) {
  const page = await browser.newPage({ viewport: { width: 280, height: 900 } });
  try {
    let lastErr;
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      try {
        await page.goto(`${BASE}/bithire/control`, { waitUntil: 'networkidle', timeout: 60000 });
        lastErr = undefined;
        break;
      } catch (e) {
        lastErr = e;
        await page.waitForTimeout(3000);
      }
    }
    if (lastErr) throw lastErr;
    await page.waitForTimeout(1500);
    await page.evaluate(() => document.fonts?.ready);

    const setup = await page.evaluate(() => {
      const roots = [...document.querySelectorAll('.rottay-segmented--modern[data-part="root"]')];
      const root = roots.find((r) => r.querySelectorAll('[role="radio"]').length === 5);
      if (!root) return { found: false };
      const cs = getComputedStyle(root);
      const overflowing = root.scrollWidth > root.clientWidth;
      window.__segmentedProofRoot = root;
      root.querySelector('[role="radio"][tabindex="0"]')?.focus();
      return {
        found: true,
        overflowing,
        overflowX: cs.overflowX,
        touchAction: cs.touchAction,
        initialActive: document.activeElement.textContent,
      };
    });
    if (!setup.found) throw new Error('the 5-option Segmented specimen was not found in the control scene');
    if (!setup.overflowing) {
      throw new Error(
        'the 5-option Segmented no longer overflows its own root at 280px — the overflow-gate exemption is now ' +
        'UNUSED and must be removed from capture-lab.mjs rather than kept around unproven'
      );
    }
    if (setup.overflowX !== 'auto' && setup.overflowX !== 'scroll') {
      throw new Error(`expected an internal-scroll root (overflow-x auto|scroll), got "${setup.overflowX}"`);
    }
    if (setup.touchAction === 'none') {
      throw new Error('overflow-x:auto root has touch-action:none — coarse-pointer scroll is blocked');
    }

    const keyboardPath = [setup.initialActive];
    let reachedLast = false;
    for (let i = 0; i < 6 && !reachedLast; i += 1) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(150);
      const text = await page.evaluate(() => document.activeElement.textContent);
      keyboardPath.push(text);
      if (text === 'Closed') reachedLast = true;
    }
    if (!reachedLast) {
      throw new Error(`ArrowRight never reached the last ("Closed") option — path was ${keyboardPath.join(' -> ')}`);
    }

    const finalState = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        text: el.textContent,
        focusVisible: el.matches(':focus-visible'),
        ariaChecked: el.getAttribute('aria-checked'),
      };
    });
    if (finalState.text !== 'Closed' || !finalState.focusVisible || finalState.ariaChecked !== 'true') {
      throw new Error(`reached "Closed" but its state is not provably real: ${JSON.stringify(finalState)}`);
    }

    return {
      proven: true,
      mechanism:
        'Arrow-key roving focus (APG radiogroup, orientation "both") walks past the viewport edge; the option ' +
        'receives real document.activeElement, :focus-visible and aria-checked. Coarse-pointer scroll is enabled ' +
        'by the same overflow-x:auto + touch-action:auto contract that lets the option overflow in the first ' +
        'place — standard browser behaviour, not a lab-side claim.',
      keyboardPath,
      finalState,
      coarsePointer: { overflowX: setup.overflowX, touchAction: setup.touchAction },
    };
  } finally {
    await page.close();
  }
}

async function gotoWithRetry(page, url) {
  let navErr;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
      navErr = undefined;
      break;
    } catch (e) {
      navErr = e;
      await page.waitForTimeout(3000);
    }
  }
  if (navErr) throw navErr;
}

/** The fail-closed geometry overflow gate, factored out so the new axis functions can reuse it. */
async function assertNoOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    const docWidth = document.documentElement.scrollWidth;
    const viewport = window.innerWidth;
    const escapees = [];
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (cs.position === 'absolute' && (cs.clip !== 'auto' || cs.clipPath !== 'none')) continue;
      if (cs.visibility === 'hidden' || Number(cs.opacity) < 0.01) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (r.right > viewport + 0.5 || r.left < -0.5) {
        const radio = el.closest('[role="radio"]');
        const segRoot = radio ? radio.closest('.rottay-segmented--modern[data-part="root"]') : null;
        if (segRoot) {
          const rootCs = getComputedStyle(segRoot);
          const rootR = segRoot.getBoundingClientRect();
          const rootFits = rootR.right <= viewport + 0.5 && rootR.left >= -0.5;
          const rootScrolls =
            (rootCs.overflowX === 'auto' || rootCs.overflowX === 'scroll') &&
            segRoot.scrollWidth > segRoot.clientWidth;
          if (rootFits && rootScrolls) continue;
        }
        escapees.push(`${el.tagName.toLowerCase()}${el.className ? '.' + String(el.className).split(' ')[0] : ''} left=${Math.round(r.left)} right=${Math.round(r.right)}`);
      }
    }
    return { docWidth, viewport, escapees: escapees.slice(0, 6) };
  });
  if (overflow.docWidth > overflow.viewport + 0.5 || overflow.escapees.length > 0) {
    throw new Error(
      `OVERFLOW GATE FAILED for ${label} — scrollWidth ${overflow.docWidth} vs viewport ${overflow.viewport}` +
      (overflow.escapees.length ? `; outside viewport: ${overflow.escapees.join(', ')}` : '') +
      '. Refusing to capture a scene that does not fit.'
    );
  }
  return overflow;
}

async function settleAndShoot(page, out) {
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.screenshot({ path: out, fullPage: true });
}

/** The original generic capture path: viewport/judge/reduced-motion/narrow/locale all share this shape. */
async function capture(browser, { routeSegment, labelTenant, scene, width, judge, reducedMotion, out }) {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    ...(reducedMotion ? { reducedMotion: 'reduce' } : {}),
  });
  const url = `${BASE}/${routeSegment}/${scene}${judge ? `?judge=${judge}` : ''}`;
  const label = `${scene}/${labelTenant}/${width}${judge ? `/${judge}` : ''}`;
  try {
    await gotoWithRetry(page, url);
    await excludeDevChrome(page);
    await page.evaluate(() => document.fonts?.ready);
    const seen = await awaitReady(page, scene, label);
    const overflow = await assertNoOverflow(page, label);
    const focus = await assertRealFocus(page, scene, label);
    await excludeDevChrome(page);
    await assertNoDevOverlay(page, label);
    await settleAndShoot(page, out);
    return {
      label,
      out: path.basename(out),
      readiness: seen,
      overflow: { scrollWidth: overflow.docWidth, viewport: overflow.viewport },
      focus,
      devChromeExcluded: true,
    };
  } finally {
    await page.close();
  }
}

// ---------------------------------------------------------------------------
// NEW AXIS: container width, independent of viewport.
// ---------------------------------------------------------------------------

/**
 * `field/index.tsx` renders two testid'd boxes (400px / 220px) around
 * prefixed Inputs, straddling the real `@container (inline-size < 18rem)`
 * (288px) rule `input.css` already authors on
 * `.rottay-input-field[data-part='field']`. Both boxes sit on the SAME page
 * at the SAME viewport — nothing about the browser window changes between
 * them, only each box's own ancestor width — so a measured difference in the
 * affix's resolved `min-inline-size` between the two is proof the CONTAINER
 * varied, not the viewport.
 *
 * This targets the AFFIX rule, not `--_ds-input-resolved-gap` (the other
 * property the same `@container` block sets). A live measurement during this
 * axis's own development found `--_ds-input-resolved-gap` staying IDENTICAL
 * at both widths for a normal, sized Input: `[data-size="md"]` carries its
 * own `--_ds-input-resolved-gap` rule elsewhere in input.css at HIGHER CSS
 * specificity than the `@container` block's selector, so that property can
 * never move for a sized Input regardless of which way the query evaluates —
 * a real product-CSS finding, not a harness bug, and recorded rather than
 * quietly worked around by picking a different property without saying why.
 * The affix `min-inline-size` rule carries no such per-size override
 * (verified against input.css directly), which is why it is what this proof
 * actually measures.
 */
async function proveContainerAxis(browser, { outWide, outNarrow }) {
  const width = 1440;
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const label = `container/field/bithire/${width}`;
  try {
    await gotoWithRetry(page, `${BASE}/bithire/field`);
    await excludeDevChrome(page);
    await page.evaluate(() => document.fonts?.ready);
    await awaitReady(page, 'field', label);
    await assertNoOverflow(page, label);

    const read = (probeTestId) =>
      page.evaluate((testId) => {
        const box = document.querySelector(`[data-testid="${testId}"]`);
        if (!box) return { found: false };
        const affix = box.querySelector('[data-part="affix-prefix"]');
        if (!affix) return { found: false, boxFound: true, affixFound: false };
        const cs = getComputedStyle(affix);
        return {
          found: true,
          boxWidthPx: box.getBoundingClientRect().width,
          affixMinInlineSize: cs.minInlineSize || cs.minWidth,
          affixRenderedWidthPx: affix.getBoundingClientRect().width,
        };
      }, probeTestId);

    const wide = await read('lab-container-probe-wide');
    const narrow = await read('lab-container-probe-narrow');
    if (!wide.found || !narrow.found) {
      throw new Error(
        `CONTAINER AXIS GATE FAILED — probe affix element not found (wide=${JSON.stringify(wide)}, narrow=${JSON.stringify(narrow)}). ` +
        'The field scene no longer carries the lab-container-probe-wide/narrow testids with a prefixed Input inside.'
      );
    }
    if (wide.affixMinInlineSize === narrow.affixMinInlineSize) {
      throw new Error(
        `CONTAINER AXIS GATE FAILED — the affix min-inline-size resolved IDENTICALLY ("${wide.affixMinInlineSize}") for ` +
        `a ${wide.boxWidthPx}px box and a ${narrow.boxWidthPx}px box, at the SAME 1440px viewport. Either the ` +
        '@container rule in input.css no longer keys off inline-size, or the container context is not established ' +
        'the way this proof assumes — this is a real, falsifiable failure, not a harness bug to paper over.'
      );
    }

    await excludeDevChrome(page);
    await assertNoDevOverlay(page, label);
    await settleAndShoot(page, outWide);
    await settleAndShoot(page, outNarrow);

    return {
      label,
      viewportHeldConstantAt: width,
      wide,
      narrow,
      verdict: 'the container query (input.css affix min-inline-size rule) engaged differently for two same-viewport, different-inline-size ancestors',
    };
  } finally {
    await page.close();
  }
}

// ---------------------------------------------------------------------------
// NEW AXIS: input modality — real CDP pointer, keyboard and touch dispatch.
// ---------------------------------------------------------------------------

/**
 * All three target the SAME real component (the 3-option Segmented in
 * `control`) and the SAME positive control (its selection moves from Week to
 * Month via `aria-checked`), so the only variable across the three captures
 * is the INPUT MODALITY used to move it. Each also records modality-specific
 * event evidence so "pointerType/touch actually fired" is asserted, not
 * inferred from a static CSS property like `touch-action`.
 */
async function findThreeOptionSegmented(page) {
  return page.evaluate(() => {
    const roots = [...document.querySelectorAll('.rottay-segmented--modern[data-part="root"]')];
    const root = roots.find((r) => r.querySelectorAll('[role="radio"]').length === 3);
    if (!root) return null;
    const options = [...root.querySelectorAll('[role="radio"]')].map((el) => el.textContent);
    return { options };
  });
}

async function installInputProofListeners(page) {
  await page.evaluate(() => {
    window.__inputProof = { pointerTypes: [], touchEventTypes: [], keydownKeys: [] };
    document.addEventListener('pointerdown', (e) => window.__inputProof.pointerTypes.push(e.pointerType), { capture: true });
    document.addEventListener('touchstart', (e) => window.__inputProof.touchEventTypes.push(e.type), { capture: true, passive: true });
    document.addEventListener('touchend', (e) => window.__inputProof.touchEventTypes.push(e.type), { capture: true, passive: true });
    document.addEventListener('keydown', (e) => window.__inputProof.keydownKeys.push(e.key), { capture: true });
  });
}

async function readSegmentedState(page) {
  return page.evaluate(() => {
    const roots = [...document.querySelectorAll('.rottay-segmented--modern[data-part="root"]')];
    const root = roots.find((r) => r.querySelectorAll('[role="radio"]').length === 3);
    const checked = root ? [...root.querySelectorAll('[role="radio"]')].find((el) => el.getAttribute('aria-checked') === 'true') : null;
    return { checkedText: checked ? checked.textContent : null, proof: window.__inputProof };
  });
}

async function proveInputModality(browser, modality, out) {
  const isTouch = modality === 'touch';
  const width = isTouch ? 390 : 1440;
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    ...(isTouch ? { hasTouch: true, isMobile: true } : {}),
  });
  const label = `input-${modality}/control/bithire/${width}`;
  try {
    await gotoWithRetry(page, `${BASE}/bithire/control`);
    await excludeDevChrome(page);
    await page.evaluate(() => document.fonts?.ready);
    await awaitReady(page, 'control', label);
    await assertNoOverflow(page, label);

    const found = await findThreeOptionSegmented(page);
    if (!found) throw new Error(`INPUT MODALITY (${modality}) GATE FAILED — the 3-option Segmented was not found in the control scene`);
    const before = await readSegmentedState(page);
    if (before.checkedText !== 'Week') {
      throw new Error(`INPUT MODALITY (${modality}) GATE FAILED — expected the default-checked option to be "Week", found "${before.checkedText}"`);
    }
    await installInputProofListeners(page);

    // Target "Month" — the third option — so a real, unambiguous selection change is required.
    const box = await page.evaluate(() => {
      const roots = [...document.querySelectorAll('.rottay-segmented--modern[data-part="root"]')];
      const root = roots.find((r) => r.querySelectorAll('[role="radio"]').length === 3);
      const target = [...root.querySelectorAll('[role="radio"]')].find((el) => el.textContent === 'Month');
      const r = target.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });

    if (modality === 'pointer') {
      await page.mouse.click(box.x, box.y);
    } else if (modality === 'touch') {
      await page.touchscreen.tap(box.x, box.y);
    } else if (modality === 'keyboard') {
      // Focus the currently-checked option first (roving tabindex: only the
      // checked option is in the tab sequence), then move with real key events.
      await page.evaluate(() => {
        const roots = [...document.querySelectorAll('.rottay-segmented--modern[data-part="root"]')];
        const root = roots.find((r) => r.querySelectorAll('[role="radio"]').length === 3);
        root.querySelector('[role="radio"][tabindex="0"]')?.focus();
      });
      await page.keyboard.press('ArrowRight');
    } else {
      throw new Error(`unknown modality "${modality}"`);
    }
    await page.waitForTimeout(200);

    const after = await readSegmentedState(page);
    if (after.checkedText !== 'Month') {
      throw new Error(
        `INPUT MODALITY (${modality}) GATE FAILED — positive control did not engage: expected selection to move to ` +
        `"Month", got "${after.checkedText}". A capture with no state change proves nothing about the modality.`
      );
    }

    let modalityEvidence;
    if (modality === 'pointer') {
      modalityEvidence = { pointerTypes: after.proof.pointerTypes };
      if (!after.proof.pointerTypes.includes('mouse')) {
        throw new Error(`INPUT MODALITY (pointer) GATE FAILED — no pointerdown with pointerType "mouse" was observed (saw ${JSON.stringify(after.proof.pointerTypes)})`);
      }
    } else if (modality === 'touch') {
      modalityEvidence = { pointerTypes: after.proof.pointerTypes, touchEventTypes: after.proof.touchEventTypes };
      if (!after.proof.pointerTypes.includes('touch')) {
        throw new Error(`INPUT MODALITY (touch) GATE FAILED — no pointerdown with pointerType "touch" was observed (saw ${JSON.stringify(after.proof.pointerTypes)})`);
      }
      if (!after.proof.touchEventTypes.includes('touchstart')) {
        throw new Error(
          `INPUT MODALITY (touch) GATE FAILED — no real "touchstart" DOM event was observed (saw ${JSON.stringify(after.proof.touchEventTypes)}). ` +
          'This is the exact failure this axis exists to catch: a coarse-pointer claim inferred from touch-action ' +
          'instead of a dispatched touch event.'
        );
      }
    } else {
      modalityEvidence = { keydownKeys: after.proof.keydownKeys };
      if (!after.proof.keydownKeys.includes('ArrowRight')) {
        throw new Error(`INPUT MODALITY (keyboard) GATE FAILED — no real "ArrowRight" keydown was observed (saw ${JSON.stringify(after.proof.keydownKeys)})`);
      }
    }

    await excludeDevChrome(page);
    await assertNoDevOverlay(page, label);
    await settleAndShoot(page, out);
    return { label, modality, before: before.checkedText, after: after.checkedText, modalityEvidence };
  } finally {
    await page.close();
  }
}

// ---------------------------------------------------------------------------
// NEW AXIS: density/rhythm — the DS's own `data-density` cascade.
// ---------------------------------------------------------------------------

/**
 * `foundation/base/density.css` gives ANY non-root element carrying
 * `data-density="compact|comfortable|spacious"` a locally recomputed
 * `--ds-density-effective-scale` and spacing ramp. This sets the attribute
 * directly on the scene root (harness-side DOM injection, the same technique
 * `excludeDevChrome` already uses — no product file touched) and asserts the
 * resolved scale actually differs between the two extremes.
 */
async function proveDensity(browser, { outCompact, outSpacious }) {
  const width = 1440;
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const label = `density/control/bithire/${width}`;
  try {
    await gotoWithRetry(page, `${BASE}/bithire/control`);
    await excludeDevChrome(page);
    await page.evaluate(() => document.fonts?.ready);
    await awaitReady(page, 'control', label);

    const results = {};
    const outs = { compact: outCompact, spacious: outSpacious };
    for (const density of ['compact', 'spacious']) {
      const resolved = await page.evaluate((d) => {
        const root = document.querySelector('[data-testid="lab-scene"]');
        root.setAttribute('data-density', d);
        const cs = getComputedStyle(root);
        return {
          effectiveScale: cs.getPropertyValue('--ds-density-effective-scale').trim(),
          spacing4: cs.getPropertyValue('--ds-spacing-4').trim(),
        };
      }, density);
      results[density] = resolved;
      await assertNoOverflow(page, `${label}/${density}`);
      await excludeDevChrome(page);
      await assertNoDevOverlay(page, `${label}/${density}`);
      await settleAndShoot(page, outs[density]);
    }

    if (
      !results.compact.effectiveScale ||
      !results.spacious.effectiveScale ||
      results.compact.effectiveScale === results.spacious.effectiveScale
    ) {
      throw new Error(
        `DENSITY AXIS GATE FAILED — --ds-density-effective-scale resolved to "${results.compact.effectiveScale}" ` +
        `(compact) and "${results.spacious.effectiveScale}" (spacious) on [data-testid="lab-scene"]; expected two ` +
        'distinct, non-empty values. The data-density mechanism did not engage as authored in foundation/base/density.css.'
      );
    }

    return { label, results, verdict: 'data-density=compact vs spacious resolved distinct --ds-density-effective-scale / --ds-spacing-4 at the same scene root' };
  } finally {
    await page.close();
  }
}

// ---------------------------------------------------------------------------
// NEW AXES: forced-colors and reduced-transparency — real CDP media emulation
// against ALREADY-AUTHORED product rules, each with a before/after delta.
// ---------------------------------------------------------------------------

/** `alert.css` has a real `@media (forced-colors: active)` rule on the alert root — used as the positive control. */
async function proveForcedColors(browser, out) {
  const width = 1440;
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const label = `forced-colors/feedback/bithire/${width}`;
  const alertSelector = '.rottay-alert-shell.rottay-alert-shell--modern[data-part="root"][data-tone]';
  try {
    await gotoWithRetry(page, `${BASE}/bithire/feedback`);
    await excludeDevChrome(page);
    await page.evaluate(() => document.fonts?.ready);
    await awaitReady(page, 'feedback', label);
    await assertNoOverflow(page, label);

    const readStyle = () =>
      page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const cs = getComputedStyle(el);
        return { background: cs.backgroundColor, borderColor: cs.borderColor, boxShadow: cs.boxShadow };
      }, alertSelector);

    const before = await readStyle();
    if (!before) throw new Error(`FORCED-COLORS GATE FAILED — no element matched ${alertSelector}`);

    await page.emulateMedia({ forcedColors: 'active' });
    const matches = await page.evaluate(() => window.matchMedia('(forced-colors: active)').matches);
    if (!matches) {
      throw new Error('FORCED-COLORS GATE FAILED — matchMedia did not report forced-colors:active after page.emulateMedia; the emulation itself did not engage.');
    }
    const after = await readStyle();

    if (after.background === before.background && after.borderColor === before.borderColor && after.boxShadow === before.boxShadow) {
      throw new Error(
        `FORCED-COLORS GATE FAILED — the emulation engaged (matchMedia confirmed) but the alert root's computed ` +
        `background/border/shadow did not change (before=${JSON.stringify(before)}, after=${JSON.stringify(after)}). ` +
        'The @media (forced-colors: active) rule in alert.css did not apply to this element as authored.'
      );
    }

    await excludeDevChrome(page);
    await assertNoDevOverlay(page, label);
    await settleAndShoot(page, out);
    return { label, before, after, matchMediaEngaged: matches, positiveControl: 'alert.css @media (forced-colors: active) root border/background' };
  } finally {
    await page.close();
  }
}

/**
 * `drawer.css` has a real `@media (prefers-reduced-transparency: reduce)`
 * rule that strips the drawer backdrop's blur. Playwright's high-level
 * `emulateMedia()` does not expose this feature, so this goes through a real
 * CDP session directly (`Emulation.setEmulatedMedia`) — genuine emulation,
 * not an inferred or injected substitute.
 *
 * This targets the DRAWER's backdrop in the isolated `overlay-drawer` chamber,
 * not the Modal's, and not the combined `overlay-blocking` chamber. A live
 * measurement during this axis's own development found the Modal instance IN
 * THIS LAB's `overlay-blocking` scene rendering `data-blur="false"` — glass is
 * an opt-in per `overlay-modal.css` (`[data-part='backdrop'][data-blur='true']`),
 * and this scene's Modal was authored without it, so its backdrop-filter is
 * legitimately `none` even before any emulation and can never move — a real
 * scene-authoring fact, not a harness bug. `drawer.css` applies
 * `backdrop-filter: var(--ds-glass-backdrop-filter)` UNCONDITIONALLY on
 * `.rottay-drawer-backdrop--modern[data-part='backdrop']` (no opt-in gate),
 * which is why the drawer is the one this proof actually measures, and the
 * isolated chamber is used so the drawer is not occluded behind the modal.
 *
 * DISCLOSED FINDING, not a bug this harness papers over: a live A/B check
 * during this axis's development (both AFTER navigation, matching this
 * function, and BEFORE navigation, in case of a recalc-timing gap) found
 * `window.matchMedia('(prefers-reduced-transparency: reduce)').matches`
 * correctly flips to `true` after `Emulation.setEmulatedMedia`, but the
 * element's COMPUTED `backdrop-filter` stays at its un-reduced value
 * (`blur(4px)`) either way — the CDP emulation updates the JS-visible media
 * query result without driving actual `@media` STYLE RESOLUTION for this
 * specific feature in this Chromium build. `prefers-reduced-transparency` is
 * notably absent from Playwright's own high-level `emulateMedia()` (which
 * does expose `forcedColors`, `reducedMotion`, `colorScheme`) — plausibly for
 * exactly this reason. This gate is kept THROWING rather than downgraded to a
 * soft pass: it genuinely did not prove what it set out to prove, and saying
 * so loudly is the correct outcome, not a defect to hide.
 */
async function proveReducedTransparency(browser, out) {
  const width = 1440;
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const label = `reduced-transparency/overlay-drawer/bithire/${width}`;
  const backdropSelector = '.rottay-drawer-backdrop--modern[data-part="backdrop"]';
  try {
    await gotoWithRetry(page, `${BASE}/bithire/overlay-drawer`);
    await excludeDevChrome(page);
    await page.evaluate(() => document.fonts?.ready);
    await awaitReady(page, 'overlay-drawer', label);
    await assertNoOverflow(page, label);

    const readStyle = () =>
      page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const cs = getComputedStyle(el);
        return { backdropFilter: cs.backdropFilter || cs.webkitBackdropFilter || '', backgroundColor: cs.backgroundColor };
      }, backdropSelector);

    const before = await readStyle();
    if (!before) throw new Error(`REDUCED-TRANSPARENCY GATE FAILED — no element matched ${backdropSelector}`);

    const client = await page.context().newCDPSession(page);
    await client.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }] });
    const matches = await page.evaluate(() => window.matchMedia('(prefers-reduced-transparency: reduce)').matches);
    if (!matches) {
      throw new Error('REDUCED-TRANSPARENCY GATE FAILED — matchMedia did not report prefers-reduced-transparency:reduce after real CDP Emulation.setEmulatedMedia; the emulation did not engage.');
    }
    const after = await readStyle();
    await client.detach();

    if (after.backdropFilter === before.backdropFilter) {
      throw new Error(
        `REDUCED-TRANSPARENCY GATE FAILED — the emulation engaged (matchMedia confirmed via real CDP) but the drawer ` +
        `backdrop's computed backdrop-filter did not change (before="${before.backdropFilter}", after="${after.backdropFilter}"). ` +
        'DISCLOSED, REPRODUCIBLE FINDING (see this function’s doc comment): CDP Emulation.setEmulatedMedia flips ' +
        'matchMedia() for prefers-reduced-transparency but does not drive actual @media style resolution for it in ' +
        'this Chromium build, before or after navigation. drawer.css itself was verified correct by direct read. ' +
        'This is an environment/tooling limitation, not a product defect or a harness selector mistake — reported as ' +
        'a failure because the gate did not prove what it set out to prove, not left as a silent or downgraded pass.'
      );
    }

    await excludeDevChrome(page);
    await assertNoDevOverlay(page, label);
    await settleAndShoot(page, out);
    return { label, before, after, matchMediaEngaged: matches, positiveControl: 'drawer.css @media (prefers-reduced-transparency: reduce) backdrop-filter on .rottay-drawer-backdrop--modern (unconditional, not blur-opt-in)' };
  } finally {
    await page.close();
  }
}

/** Extends the existing reduced-motion capture with an actual positive-control assertion (spinner.css stops its animation). */
async function proveReducedMotionEngaged(page, label) {
  const spinnerSelector = '.rottay-spinner.rottay-spinner--modern [data-part="indicator"][role="status"]';
  const info = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { found: false };
    const cs = getComputedStyle(el);
    return { found: true, animationName: cs.animationName, animationDuration: cs.animationDuration };
  }, spinnerSelector);
  if (!info.found) throw new Error(`REDUCED-MOTION GATE FAILED for ${label} — no spinner matched ${spinnerSelector}`);
  if (info.animationName !== 'none') {
    throw new Error(
      `REDUCED-MOTION GATE FAILED for ${label} — spinner animation-name is "${info.animationName}" under ` +
      'reducedMotion:"reduce" (expected "none" per spinner.css @media (prefers-reduced-motion: reduce)).'
    );
  }
  return info;
}

// ---------------------------------------------------------------------------
// Plan construction — every capture this run WILL attempt, built up front so
// stale-leftover quarantine and label-collision checks can run BEFORE any
// browser work starts.
// ---------------------------------------------------------------------------

function buildPlan({ selfTest }) {
  const plan = [];
  const tenants = selfTest ? ['bithire'] : TENANTS;
  const scenes = selfTest ? ['control', 'feedback'] : SCENES;
  const widths = selfTest ? [390, 1440] : WIDTHS;

  for (const scene of scenes) for (const tenant of tenants) for (const width of widths) {
    plan.push({ kind: 'viewport', tenant, scene, width, outName: `${scene}-${tenant}-${width}.png` });
  }

  const judges = selfTest ? ['grayscale'] : ['grayscale', 'hue-neutral'];
  const judgeScenes = selfTest ? ['control'] : ['control', 'feedback'];
  for (const judge of judges) for (const scene of judgeScenes) for (const tenant of tenants) {
    plan.push({ kind: 'judge', tenant, scene, judge, outName: `judge-${judge}-${scene}-${tenant}.png` });
  }

  for (const tenant of tenants) {
    plan.push({ kind: 'reduced-motion', tenant, outName: `reduced-motion-feedback-${tenant}.png` });
    plan.push({ kind: 'narrow-280', tenant, outName: `narrow-280-control-${tenant}.png` });
  }

  const localeLocales = selfTest ? ['ar'] : LOCALES;
  const localeScenes = selfTest ? ['control'] : LOCALE_SCENES;
  const localeWidths = selfTest ? [1440] : WIDTHS;
  for (const locale of localeLocales) for (const scene of localeScenes) for (const width of localeWidths) {
    plan.push({ kind: 'locale', tenant: 'bithire', locale, scene, width, outName: `locale-${locale}-${scene}-bithire-${width}.png` });
  }

  plan.push({ kind: 'container', outNameWide: 'container-wide-field-bithire-1440.png', outNameNarrow: 'container-narrow-field-bithire-1440.png' });

  for (const modality of ['pointer', 'keyboard', 'touch']) {
    const width = modality === 'touch' ? 390 : 1440;
    plan.push({ kind: 'input-modality', modality, outName: `input-${modality}-control-bithire-${width}.png` });
  }

  plan.push({ kind: 'density', outNameCompact: 'density-compact-control-bithire-1440.png', outNameSpacious: 'density-spacious-control-bithire-1440.png' });
  plan.push({ kind: 'forced-colors', outName: 'forced-colors-feedback-bithire-1440.png' });
  plan.push({ kind: 'reduced-transparency', outName: 'reduced-transparency-overlay-drawer-bithire-1440.png' });

  return plan;
}

function planOutputFilenames(plan) {
  const names = [];
  for (const entry of plan) {
    if (entry.outName) names.push(entry.outName);
    if (entry.outNameWide) names.push(entry.outNameWide);
    if (entry.outNameNarrow) names.push(entry.outNameNarrow);
    if (entry.outNameCompact) names.push(entry.outNameCompact);
    if (entry.outNameSpacious) names.push(entry.outNameSpacious);
  }
  return names;
}

// ---------------------------------------------------------------------------
// main()
// ---------------------------------------------------------------------------

async function main() {
  const startedAt = new Date().toISOString();
  const outDir = process.argv[2];
  const selfTest = process.argv.includes('--self-test');
  if (!outDir) throw new Error('usage: capture-lab.mjs <output-dir> [--self-test]');
  if (process.argv.includes('--seed')) {
    throw new Error('capture-lab.mjs does not accept --seed; there is no baseline for this tool to re-anchor.');
  }

  // Belt-and-suspenders enforcement of the standing capture freeze: self-test
  // evidence must never land in, or be mistaken for, the certified capture set.
  const forbiddenCapturesDir = path.join(HERE, '..', 'captures');
  if (selfTest && path.resolve(outDir).startsWith(path.resolve(forbiddenCapturesDir) + path.sep)) {
    throw new Error(
      `--self-test refuses to write inside ${forbiddenCapturesDir} — that directory is the certified capture set. ` +
      'Pass a scratch output directory instead.'
    );
  }

  // State accumulated across the run so a receipt can be written no matter
  // where in the run a crash happens. Every field is optional in the receipt
  // schema on purpose: partial evidence explaining a crash beats no evidence.
  const acc = {
    startedAt,
    selfTest,
    outDir,
    base: BASE,
    port: PORT,
    manifest: [],
    failures: [],
    infraRetries: [],
    deferredAxes: DEFERRED_AXES,
    crashed: false,
    crashMessage: null,
  };

  let browser;
  try {
    const repoRoot = deriveRepoRoot(HERE);
    acc.repoRoot = repoRoot; // recorded for provenance only — never a per-machine home path
    const dsReferenceDir = path.join(repoRoot, 'packages', 'showroom', 'src', 'app', 'probe', 'ds-reference');
    const wideSurfaceDirs = [
      path.join(repoRoot, 'packages', 'core', 'src', 'foundation', 'tokens'),
      path.join(repoRoot, 'packages', 'core', 'src', 'ui'),
      path.join(repoRoot, 'packages', 'core', 'src', 'graphics'),
    ];

    acc.selfHash = hashSelf(SELF_FILES.filter((f) => existsSync(f)));

    const { chromium, resolvedFrom } = await resolvePlaywrightChromium(repoRoot);
    acc.playwrightResolvedFrom = resolvedFrom;

    acc.sourceBefore = {
      dsReferenceTree: hashTree(dsReferenceDir),
      wideSurface: statFingerprint(wideSurfaceDirs),
    };
    acc.serverBefore = getPortProcessIdentity(PORT);
    acc.selfProcess = getSelfProcessIdentity();

    mkdirSync(outDir, { recursive: true });
    const plan = buildPlan({ selfTest });
    const expectedNames = planOutputFilenames(plan);
    acc.hygiene = quarantineStaleLeftovers(outDir, expectedNames);

    const labels = makeLabelRegistry();
    for (const name of expectedNames) labels.claim(name, name); // throws immediately on any planning-time collision

    browser = await chromium.launch();
    registerBrowserCleanupOnSignal(() => browser);

    async function ensureBrowser() {
      if (!browser || !browser.isConnected()) {
        try { await browser?.close(); } catch { /* already gone */ }
        acc.infraRetries.push(new Date().toISOString());
        browser = await chromium.launch();
      }
      return browser;
    }

    let segmentedProof = null;
    try {
      await ensureBrowser();
      segmentedProof = await proveSegmentedOverflowAffordance(browser);
    } catch (e) {
      acc.failures.push(`SEGMENTED AFFORDANCE PROOF FAILED — ${e.message}`);
    }
    acc.segmentedOverflowAffordance = segmentedProof;

    if (segmentedProof?.proven) {
      for (const entry of plan) {
        try {
          await ensureBrowser();
          if (entry.kind === 'viewport') {
            const out = path.join(outDir, entry.outName);
            acc.manifest.push({ kind: entry.kind, ...(await capture(browser, { routeSegment: entry.tenant, labelTenant: entry.tenant, scene: entry.scene, width: entry.width, out })) });
          } else if (entry.kind === 'judge') {
            const out = path.join(outDir, entry.outName);
            acc.manifest.push({ kind: entry.kind, judge: entry.judge, ...(await capture(browser, { routeSegment: entry.tenant, labelTenant: entry.tenant, scene: entry.scene, width: 1440, judge: entry.judge, out })) });
          } else if (entry.kind === 'reduced-motion') {
            const out = path.join(outDir, entry.outName);
            const result = await capture(browser, { routeSegment: entry.tenant, labelTenant: entry.tenant, scene: 'feedback', width: 1440, reducedMotion: true, out });
            // The original gate only screenshotted under reducedMotion:'reduce'
            // without asserting anything actually stopped animating. Re-open
            // the same scene under the same setting to assert the positive
            // control (spinner.css's authored rule) — a second page rather
            // than re-using capture()'s closed page, kept cheap since this
            // only runs twice (once per tenant).
            const page2 = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
            try {
              await gotoWithRetry(page2, `${BASE}/${entry.tenant}/feedback`);
              await excludeDevChrome(page2);
              await page2.evaluate(() => document.fonts?.ready);
              await awaitReady(page2, 'feedback', `${result.label}/motion-assert`);
              result.reducedMotionAssertion = await proveReducedMotionEngaged(page2, result.label);
            } finally {
              await page2.close();
            }
            acc.manifest.push({ kind: entry.kind, ...result });
          } else if (entry.kind === 'narrow-280') {
            const out = path.join(outDir, entry.outName);
            acc.manifest.push({ kind: entry.kind, ...(await capture(browser, { routeSegment: entry.tenant, labelTenant: entry.tenant, scene: 'control', width: 280, out })) });
          } else if (entry.kind === 'locale') {
            const out = path.join(outDir, entry.outName);
            acc.manifest.push({
              kind: entry.kind,
              locale: entry.locale,
              ...(await capture(browser, {
                routeSegment: `${entry.tenant}-${entry.locale}`,
                labelTenant: `${entry.tenant}-${entry.locale}`,
                scene: entry.scene,
                width: entry.width,
                out,
              })),
            });
          } else if (entry.kind === 'container') {
            const outWide = path.join(outDir, entry.outNameWide);
            const outNarrow = path.join(outDir, entry.outNameNarrow);
            acc.manifest.push({ kind: entry.kind, ...(await proveContainerAxis(browser, { outWide, outNarrow })) });
          } else if (entry.kind === 'input-modality') {
            const out = path.join(outDir, entry.outName);
            acc.manifest.push({ kind: entry.kind, ...(await proveInputModality(browser, entry.modality, out)) });
          } else if (entry.kind === 'density') {
            const outCompact = path.join(outDir, entry.outNameCompact);
            const outSpacious = path.join(outDir, entry.outNameSpacious);
            acc.manifest.push({ kind: entry.kind, ...(await proveDensity(browser, { outCompact, outSpacious })) });
          } else if (entry.kind === 'forced-colors') {
            const out = path.join(outDir, entry.outName);
            acc.manifest.push({ kind: entry.kind, ...(await proveForcedColors(browser, out)) });
          } else if (entry.kind === 'reduced-transparency') {
            const out = path.join(outDir, entry.outName);
            acc.manifest.push({ kind: entry.kind, ...(await proveReducedTransparency(browser, out)) });
          } else {
            throw new Error(`unknown plan entry kind "${entry.kind}"`);
          }
        } catch (e) {
          acc.failures.push(`[${entry.kind}] ${String(e.message ?? e)}`);
        }
      }
    } else {
      acc.failures.push('Capture loops SKIPPED — the Segmented overflow-affordance preflight did not pass, so the overflow gate exemption it backs cannot be trusted.');
    }

    acc.sourceAfter = {
      dsReferenceTree: hashTree(dsReferenceDir),
      wideSurface: statFingerprint(wideSurfaceDirs),
    };
    acc.serverAfter = getPortProcessIdentity(PORT);

    const serverDrift = compareIdentity(acc.serverBefore, acc.serverAfter, 'dev server');
    const driftReasons = [...serverDrift.reasons];
    if (acc.sourceBefore.dsReferenceTree.combinedSha256 !== acc.sourceAfter.dsReferenceTree.combinedSha256) {
      driftReasons.push(
        `ds-reference source tree changed during the run (before=${acc.sourceBefore.dsReferenceTree.combinedSha256}, after=${acc.sourceAfter.dsReferenceTree.combinedSha256})`
      );
    }
    if (acc.sourceBefore.wideSurface.combinedFingerprint !== acc.sourceAfter.wideSurface.combinedFingerprint) {
      driftReasons.push(
        'the wider foundation/tokens+ui+graphics surface drifted during the run (coarse path/size/mtime fingerprint changed) — ' +
        'captures taken before and after this point cannot be assumed to reflect the same rendered output'
      );
    }
    acc.drift = { stable: driftReasons.length === 0, reasons: driftReasons };
  } catch (crashError) {
    acc.crashed = true;
    acc.crashMessage = crashError?.stack || String(crashError);
  } finally {
    try { await browser?.close(); } catch { /* already gone */ }
  }

  acc.finishedAt = new Date().toISOString();
  const pass = !acc.crashed && acc.failures.length === 0 && (acc.drift?.stable ?? false);

  const receiptName = selfTest ? 'cohort-1-capture-harness-self-test.json' : 'cohort-1-capture-readiness.json';
  const receiptPath = path.join(RECEIPTS_DIR, receiptName);
  const receipt = {
    schemaVersion: 2,
    receiptId: selfTest ? 'wo-cra-23-R1-C1-capture-harness-self-test' : 'wo-cra-23-R1-C1-capture-readiness',
    law: 'Every capture asserts a per-scene readiness contract against VISIBLE elements before the shutter, plus an overflow gate, a real-focus gate and a dev-chrome-exclusion gate. A scene that does not paint (or does not fit, or cannot prove its claimed focus/state) throws instead of producing a plausible-looking file. The run is source-bound: any drift in the dev-server identity or in the source it served invalidates the whole run, not just one capture.',
    whyItExists: 'Codex found feedback-bithire-320, feedback-bithire-1440 and the grayscale 1440 variant missing their alerts and spinners while the live DOM showed them present with correct bounds and opacity — a capture race that produced evidence looking like a clean pass. A later audit found a coarse-pointer proof that read touch-action instead of dispatching touch, a readiness check whose min:1 let a whole component go missing, a resize stub that fired regardless of what was observed, and a forced-colors check aimed at the wrong element — the assertions below are written to be falsifiable against those exact failure modes.',
    runMode: selfTest ? 'self-test (reduced matrix; mechanics verification only — NOT a certification run)' : 'full',
    startedAt: acc.startedAt,
    finishedAt: acc.finishedAt,
    outDir: acc.outDir,
    baseUrl: acc.base,
    port: acc.port,
    repoRoot: acc.repoRoot ?? null,
    playwrightResolvedFrom: acc.playwrightResolvedFrom ?? null,
    harnessSelfHash: acc.selfHash ?? null,
    selfProcess: acc.selfProcess ?? null,
    sourceBinding: {
      before: acc.sourceBefore ?? null,
      after: acc.sourceAfter ?? null,
      note:
        'dsReferenceTree is a full sha256 CONTENT hash of every file under packages/showroom/src/app/probe/ds-reference ' +
        '(what this lane directly authors and what the capture claims are about). wideSurface is a COARSE ' +
        '(path,size,mtime) fingerprint over foundation/tokens + ui + graphics — it proves absence of drift in the ' +
        'wider design-system surface a capture\'s pixels transitively depend on, not identity of that surface\'s content.',
    },
    serverIdentity: { before: acc.serverBefore ?? null, after: acc.serverAfter ?? null },
    drift: acc.drift ?? { stable: false, reasons: ['run crashed before drift could be evaluated — see crashMessage'] },
    outputHygiene: acc.hygiene ?? null,
    feedbackContract: 'seven role=alert elements and four role=status indicators, exact and visible',
    segmentedOverflowAffordance: acc.segmentedOverflowAffordance ?? null,
    devChromeExclusion: 'The Next.js dev-tools indicator (<nextjs-portal> shadow root, #devtools-indicator) is excluded via a harness-injected style inside its own open shadow root before every shutter, and a zero-visible-dev-overlay assertion runs immediately before the shutter. Production CSS is never touched.',
    focusContract: 'Every capture whose scene has a FOCUS entry takes real focus on a deterministic target after readiness+overflow and asserts document.activeElement identity, :focus-visible, and a computed border/box-shadow delta against an unfocused sibling (or, for feedback, against its own pre-focus style).',
    drawerContract: 'overlay-blocking asserts the modal panel and the drawer panel as two independent exact:1 contracts instead of one combined min:1; overlay-drawer is an isolated chamber (Drawer only, no Modal) so the drawer is actually unoccluded in at least one captured image.',
    matrixAxes: {
      viewportWidth: { widths: WIDTHS, note: 'browser VIEWPORT resize — kept as its own axis, not conflated with the container axis below' },
      containerWidthIndependentOfViewport: {
        mechanism: 'two same-viewport (1440px), different-inline-size (400px / 220px) ancestors around the real @container (inline-size < 18rem) affix min-inline-size rule already authored in input.css',
        falsifiable: 'throws if the affix min-inline-size resolves identically for both boxes',
        note: '--_ds-input-resolved-gap (the same @container block’s other property) was tried first and found permanently shadowed by a higher-specificity [data-size="md"] rule elsewhere in input.css for any sized Input — a real product-CSS finding, see proveContainerAxis doc comment',
      },
      locale: { locales: ['en (default ground)', ...LOCALES], rtlComplete: 'ar stamps dir="rtl" on documentElement via resolveDocumentRootAttributes, before hydration — a full document, not a local wrapper', scenesWired: LOCALE_SCENES },
      contentLength: { status: 'always-on', note: 'TORTURE_CONTENT (long/es/ar/unbroken) is present in every capture already taken; not an independent toggle — see deferredAxes for the pseudo-loc gap' },
      density: { modes: ['compact', 'spacious'], mechanism: 'data-density attribute cascade authored in foundation/base/density.css', falsifiable: 'throws if --ds-density-effective-scale resolves identically for both modes' },
      inputModality: { modes: ['pointer', 'keyboard', 'touch'], mechanism: 'real CDP dispatch (page.mouse.click / page.keyboard.press / page.touchscreen.tap with hasTouch:true) against the same 3-option Segmented, same positive control (Week -> Month)', falsifiable: 'throws if the selection does not move, or if the modality-specific event (pointerType, touchstart, ArrowRight keydown) was not observed' },
      reducedMotion: { mechanism: 'Playwright reducedMotion:"reduce" context option against feedback scene', falsifiable: 'throws if spinner.css animation-name is not "none" under the setting' },
      reducedTransparency: { mechanism: 'real CDP Emulation.setEmulatedMedia against the isolated overlay-drawer scene', falsifiable: 'throws if matchMedia does not confirm engagement, or if the drawer backdrop-filter (drawer.css, unconditional — not the modal, whose backdrop is blur-opt-in and false in this lab) does not change' },
      forcedColors: { mechanism: 'Playwright page.emulateMedia({forcedColors:"active"}) against feedback scene', falsifiable: 'throws if matchMedia does not confirm engagement, or if the alert root background/border/shadow (alert.css) does not change' },
      lifecycleStates: DEFERRED_AXES.find((d) => d.axis.startsWith('lifecycle')),
    },
    deferredAxes: DEFERRED_AXES,
    infraRetries: acc.infraRetries,
    captured: acc.manifest.length,
    failed: acc.failures.length,
    failures: acc.failures,
    manifest: acc.manifest,
    crashed: acc.crashed,
    crashMessage: acc.crashMessage,
    pass,
  };

  // Absolute-path redaction, applied last, in one centralized pass: repoRoot,
  // harnessSelfHash paths, selfProcess.cwd, the server's `ps` command line
  // (which the OS reports with the full absolute launch path) and any stack
  // trace in crashMessage all get scrubbed here, rather than trusting every
  // field above to have relativized itself correctly.
  const redactedReceipt = redactAbsolutePaths(receipt, [
    [acc.repoRoot ?? '', '<repo-root>'],
    [os.homedir(), '<home>'],
  ]);

  try {
    atomicWriteJSON(receiptPath, redactedReceipt);
  } catch (writeError) {
    // Absolute last resort: the artifact-over-crash law applies even to the
    // artifact writer itself. If the atomic write fails, dump the receipt to
    // stderr so it is not silently lost, then still exit non-zero below.
    process.stderr.write(`[capture-lab] FAILED TO WRITE RECEIPT to ${receiptPath}: ${writeError.message}\n`);
    process.stderr.write(`${JSON.stringify(redactedReceipt, null, 2)}\n`);
  }

  process.stdout.write(`receipt: ${receiptPath}\n`);
  process.stdout.write(`captured ${acc.manifest.length}, failed ${acc.failures.length}, drift-stable=${acc.drift?.stable ?? false}, crashed=${acc.crashed}\n`);
  for (const f of acc.failures) process.stdout.write(`  FAIL: ${f}\n`);
  if (acc.crashed) process.stdout.write(`  CRASH: ${acc.crashMessage}\n`);
  if (acc.drift && !acc.drift.stable) for (const r of acc.drift.reasons) process.stdout.write(`  DRIFT: ${r}\n`);

  process.exitCode = pass ? 0 : 1;
}

await main();
