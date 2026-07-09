import { test, expect, type Page } from '@playwright/test';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// WO-GAT-04 axis 3 — focus-visible sweep (proposal P-10).
//
// On each flagship gallery page, under a dark-surface tenant (rottay) AND a
// light-surface tenant (bithire), press Tab through the interactive parts
// (buttons incl. icon-only, inputs, select triggers, tab hits, and — on the
// modal flagship — the dialog close/footer buttons) and assert every
// keyboard-focused control paints a VISIBLE indicator: a computed `outline`
// (style != none, width > 0, non-transparent color) OR a `box-shadow`
// (!= none) — the WO-ENG-04 `--ds-focus-ring` contract. Keyboard Tab (not
// programmatic .focus()) is used so `:focus-visible` styles actually apply.
//
// No baseline: the ENG-04 contract guarantees the ring tokens exist before
// this WO runs, so any control without an indicator is a hard failure. Styling
// is asserted by COMPUTED STYLE, never by pixel diff (GAT-01 owns pixels).
// ---------------------------------------------------------------------------

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../../..');
const evidenceDir = join(repoRoot, 'test-artifacts', 'gates', 'gat-04');

const FLAGSHIP_SLUGS = ['button', 'input', 'select', 'card', 'badge', 'table', 'tabs', 'modal'] as const;
const TENANTS = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
] as const;

interface SweepResult {
  misses: string[];
  visitedInteractive: number;
}

/**
 * Tab from the top of the document, and for every interactive control the
 * keyboard focus lands on, record whether it shows a visible outline/box-shadow.
 * Dedupes by a position+label signature and stops on a repeat (focus-trap wrap)
 * or when focus leaves the interactive set.
 */
async function focusSweep(page: Page): Promise<SweepResult> {
  const MAX_TABS = 50;
  const misses: string[] = [];
  const seen = new Set<string>();
  let interactiveCount = 0;
  let consecutiveExits = 0;

  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur?.());

  const INTERACTIVE_SELECTOR =
    'button, [role="button"], a[href], input, select, textarea, [role="tab"], [role="switch"], [role="checkbox"], [contenteditable="true"], [tabindex]:not([tabindex="-1"]):not([role="tabpanel"])';

  for (let i = 0; i < MAX_TABS; i++) {
    await page.keyboard.press('Tab');
    // Several modern engines paint the ring as an INLINE outline driven by React
    // focus state (e.g. Button's `isFocused` -> outline), so the style lands one
    // render tick after the focus event. Wait deterministically until the focused
    // control's indicator settles — resolve as soon as an outline/box-shadow
    // appears (or the target is non-interactive / focus left the page). A
    // genuinely ring-less control never resolves and falls through after the
    // timeout, where it is then recorded as a real miss.
    await page
      .waitForFunction(
        (sel) => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body || el === document.documentElement) return true;
          if (!el.matches(sel)) return true;
          const cs = getComputedStyle(el);
          const ow = parseFloat(cs.outlineWidth) || 0;
          const alphaOf = (color: string): number => {
            if (color === 'transparent') return 0;
            const m = /rgba?\([^)]*?[,/]\s*([0-9.]+)\s*\)$/.exec(color);
            return m ? parseFloat(m[1]) : 1;
          };
          const outlineVisible = cs.outlineStyle !== 'none' && ow > 0 && alphaOf(cs.outlineColor) > 0;
          const boxShadowVisible = !!cs.boxShadow && cs.boxShadow !== 'none';
          return outlineVisible || boxShadowVisible;
        },
        INTERACTIVE_SELECTOR,
        { timeout: 1200, polling: 50 },
      )
      .catch(() => undefined);
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body || el === document.documentElement) return { exit: true as const };

      const cs = getComputedStyle(el);
      const alphaOf = (color: string): number => {
        if (color === 'transparent') return 0;
        const m = /rgba?\([^)]*?[,/]\s*([0-9.]+)\s*\)$/.exec(color);
        return m ? parseFloat(m[1]) : 1;
      };
      const outlineWidth = parseFloat(cs.outlineWidth) || 0;
      const outlineVisible =
        cs.outlineStyle !== 'none' && outlineWidth > 0 && alphaOf(cs.outlineColor) > 0;
      const boxShadowVisible = !!cs.boxShadow && cs.boxShadow !== 'none';

      const interactiveSelector =
        'button, [role="button"], a[href], input, select, textarea, [role="tab"], [role="switch"], [role="checkbox"], [contenteditable="true"], [tabindex]:not([tabindex="-1"]):not([role="tabpanel"])';
      const isInteractive = el.matches(interactiveSelector);

      const rect = el.getBoundingClientRect();
      const label = (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 32);

      return {
        exit: false as const,
        isInteractive,
        indicator: outlineVisible || boxShadowVisible,
        tag: el.tagName.toLowerCase(),
        role: el.getAttribute('role') || '',
        label,
        outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`,
        boxShadow: cs.boxShadow,
        sig: `${el.tagName}:${el.getAttribute('role') || ''}:${Math.round(rect.x)},${Math.round(rect.y)}:${label}`,
      };
    });

    if (info.exit) {
      // Focus transiently parked on the document/body (e.g. the Next dev overlay
      // sits between controls) — do NOT stop on the first exit, or the sweep
      // under-covers the grid. Only bail once focus is clearly stuck off-page.
      consecutiveExits += 1;
      if (consecutiveExits >= 6) break;
      continue;
    }
    consecutiveExits = 0;
    if (seen.has(info.sig)) break; // cycled (wrap or focus trap) — every control seen once
    seen.add(info.sig);
    if (!info.isInteractive) continue;

    interactiveCount += 1;
    if (!info.indicator) {
      misses.push(
        `${info.tag}${info.role ? `[role=${info.role}]` : ''} "${info.label}" — outline:(${info.outline}) box-shadow:(${info.boxShadow})`,
      );
    }
  }

  return { misses, visitedInteractive: interactiveCount };
}

for (const tenant of TENANTS) {
  for (const slug of FLAGSHIP_SLUGS) {
    test(`focus indicator: ${tenant.id} (${tenant.ground}) / ${slug}`, async ({ page }) => {
      test.setTimeout(90_000);
      await page.goto(`/probe/engine-modern?tenant=${tenant.id}&slug=${slug}`, { waitUntil: 'networkidle' });
      await page.getByRole('heading', { name: /modern engine evidence/i }).waitFor({ timeout: 30_000 });

      const misses: string[] = [];
      const first = await focusSweep(page);
      misses.push(...first.misses);
      let visited = first.visitedInteractive;

      // The modal flagship's close/footer controls only exist once the dialog is
      // open — sweep again inside the (focus-trapped) dialog.
      if (slug === 'modal') {
        await page.getByRole('button', { name: /open modal/i }).first().click();
        await page.getByRole('dialog').waitFor({ timeout: 10_000 }).catch(() => undefined);
        const dialogSweep = await focusSweep(page);
        misses.push(...dialogSweep.misses);
        visited += dialogSweep.visitedInteractive;
      }

      // Evidence: capture the focused state of the button gallery on each ground.
      if (slug === 'button') {
        await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur?.());
        await page.keyboard.press('Tab');
        await page.screenshot({ path: join(evidenceDir, `focus-${tenant.id}-${tenant.ground}-button.png`) });
      }

      // No `visited > 0` assertion: some flagship galleries (card, badge) render
      // only non-interactive display components, so zero focusable controls is
      // legitimate there. The gate is that every control we DO focus shows a ring.
      console.log(`focus sweep ${tenant.id}/${slug}: ${visited} interactive control(s), ${misses.length} miss(es)`);
      expect(
        misses,
        `Interactive parts with NO visible focus indicator on ${tenant.id} (${tenant.ground}) / ${slug}:\n${misses.join('\n')}`,
      ).toEqual([]);
    });
  }
}
