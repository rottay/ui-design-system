/**
 * The container doors' emitted-size ratchet (M4, WO-EVI-02).
 *
 * The container law restates, at a scope below the document root, whatever the
 * root resolves differently: the reached root aliases, their context rules, the
 * document-following mode rules and the DS root's own mode channels. Every one
 * of those sets is bounded by DS constants (the generated tables, the compiled
 * map), not by the draft, so a DS change can double what every preview panel
 * re-parses on each edit without any draft changing. The source-byte budget of
 * `./runtime/visual-authority` does not see emitted CSS; this file does.
 *
 * Each door below is a real consumer's emission on a fixed fixture, measured in
 * UTF-8 bytes and in declarations per rule kind (base, context, mode). The pins
 * live in `container-emission-budget.json` and are EXACT: growth and shrinkage
 * both stop here, so a pin never drifts loose.
 *
 * Re-anchor route (the governed door, as for the visual-authority budget):
 * update the door's pin to the measured value the failure prints AND append a
 * `history` entry naming the change, the reason and the new `totalBytes`. The
 * last history entry must equal the pinned total, so a pin cannot move without
 * a written reason.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { FirstPartyVerticalId } from '@/foundation/contracts/kernel/verticals';
import { BrandingPreviewSandbox } from '@/components/patterns/customization/branding-preview-sandbox';
import { surfaceScopeCss, tryBuildSurfaceVariables } from '@/components/patterns/customization/brand-studio';
import {
  buildTenantThemePreviewScope,
  compileTenantThemePreview,
} from '@/components/patterns/customization/brand-studio/runtime/tenant-theme-preview';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';

interface DoorPin {
  readonly bytes: number;
  readonly declarations: Readonly<Record<RuleKind, number>>;
}

interface Budget {
  readonly doors: Readonly<Record<string, DoorPin>>;
  readonly history: readonly { readonly date: string; readonly change: string; readonly reason: string; readonly totalBytes: number }[];
}

type RuleKind = 'base' | 'context' | 'mode';

const BUDGET: Budget = JSON.parse(
  readFileSync(resolve(__dirname, 'container-emission-budget.json'), 'utf8'),
) as Budget;

const VERTICALS: readonly FirstPartyVerticalId[] = ['bithire', 'evnto', 'rottay'];

const SANDBOX_APPEARANCES = {
  PRIMARY: { general: { palette: { primary: '#16a34a' } } },
  RICH: {
    general: {
      palette: { primary: '#1a56db', secondary: '#7c3aed', accent: '#0ea5e9' },
      shape: { buttonStyle: 'soft' },
      surfaces: { elevation: 'elevated' },
    },
  },
} as const;

const STUDIO_DRAFTS = {
  EMPTY: { id: 'empty', name: 'Empty' },
  RICH: {
    id: 'rich',
    name: 'Rich',
    palette: {
      primaryColor: '#1a56db', secondaryColor: '#7c3aed', accentColor: '#0ea5e9',
      textPrimaryColor: '#172033', textSecondaryColor: '#46536b', textMutedColor: '#68758d', textDisabledColor: '#8b95a8',
      borderPrimaryColor: '#cbd5e1', borderSecondaryColor: '#e2e8f0', backgroundColor: '#f8fafc',
      successColor: '#16a34a', warningColor: '#d97706', errorColor: '#dc2626', infoColor: '#2563eb',
    },
    typography: { fontFamilyBase: 'Inter, sans-serif', fontFamilyHeading: 'Inter, sans-serif' },
    chrome: {
      controls: { buttonPrimary: { bg: '#1a56db', color: '#ffffff' }, input: { bg: '#ffffff', border: '#e2e8f0' } },
      cardComponent: { bg: '#ffffff', color: '#0f172a', border: '#e2e8f0' },
      tabs: { colorActive: '#1a56db', border: '#e2e8f0' },
    },
  },
} as const;

/** The sandbox's injected `<style>`, its `useId` scope attribute spelled one fixed way. */
function sandboxCss(vertical: FirstPartyVerticalId, appearance: object): string {
  const { container, unmount } = render(
    <EngineProvider defaultEngine="modern">
      <BrandingPreviewSandbox vertical={vertical} appearance={appearance as never} />
    </EngineProvider>,
  );
  const scope = container
    .querySelector('.ds-pattern-branding-preview-sandbox')
    ?.getAttributeNames()
    .find((attribute) => attribute.startsWith('data-preview-'));
  const css = container.querySelector('style')?.textContent ?? '';
  unmount();
  if (!scope) throw new Error('the sandbox rendered no preview scope');
  return css.split(scope).join('data-preview-scope');
}

function tenantPreviewCss(vertical: FirstPartyVerticalId): string {
  const { artifact, issues } = compileTenantThemePreview({
    document: {
      schemaVersion: 1,
      mode: 'simple',
      appearance: { palette: { primary: '#A23B72' }, typography: { fontFamilyHeading: "'Fraunces', Georgia, serif" } },
    } as never,
    identity: { tenantId: 't', slug: 'preview-tenant', verticalKey: vertical, rowVersion: 1 } as never,
  });
  if (!artifact) throw new Error(JSON.stringify(issues));
  return buildTenantThemePreviewScope(artifact).css;
}

function studioCss(vertical: FirstPartyVerticalId, draft: object, ground: 'dark' | 'light'): string {
  const surface = { key: ground, baseTheme: ground, tenantSlug: `brand-studio-${ground}`, vertical };
  return surfaceScopeCss(tryBuildSurfaceVariables(draft as never, surface as never), `.brand-studio-${ground}-scope`);
}

const MODE_RULE = /^:where\(:where\(:root, \[data-ds-root\]\):is\(\[data-theme='(?:light|dark)'\], \.(?:light|dark)\)\) /u;

/** Declarations per rule kind: the scope's own rule, its document-mode rules, everything else. */
function measure(css: string, scopeSelector: string): DoorPin {
  const declarations: Record<RuleKind, number> = { base: 0, context: 0, mode: 0 };
  const visit = (text: string, atRule: boolean) => {
    let at = 0;
    while (at < text.length) {
      const open = text.indexOf('{', at);
      if (open < 0) break;
      const prelude = text.slice(at, open).trim();
      let depth = 1;
      let close = open + 1;
      for (; close < text.length && depth > 0; close += 1) {
        if (text[close] === '{') depth += 1;
        else if (text[close] === '}') depth -= 1;
      }
      const body = text.slice(open + 1, close - 1);
      if (prelude.startsWith('@')) {
        visit(body, true);
      } else {
        const count = [...body.matchAll(/^\s*--[\w-]+\s*:/gmu)].length;
        const kind: RuleKind =
          !atRule && prelude === scopeSelector ? 'base' : !atRule && MODE_RULE.test(prelude) ? 'mode' : 'context';
        declarations[kind] += count;
      }
      at = close;
    }
  };
  visit(css, false);
  return { bytes: Buffer.byteLength(css, 'utf8'), declarations };
}

function doors(): Record<string, DoorPin> {
  const measured: Record<string, DoorPin> = {};
  for (const vertical of VERTICALS) {
    for (const [name, appearance] of Object.entries(SANDBOX_APPEARANCES)) {
      measured[`sandbox:${vertical}:${name}`] = measure(sandboxCss(vertical, appearance), '[data-preview-scope]');
    }
    const preview = tenantPreviewCss(vertical);
    measured[`tenant-preview:${vertical}`] = measure(preview, preview.slice(0, preview.indexOf(' {')));
    for (const [name, draft] of Object.entries(STUDIO_DRAFTS)) {
      for (const ground of ['dark', 'light'] as const) {
        measured[`brand-studio:${vertical}:${name}:${ground}`] = measure(
          studioCss(vertical, draft, ground),
          `.brand-studio-${ground}-scope`,
        );
      }
    }
  }
  return measured;
}

describe("the container doors' emitted CSS is pinned per door (M4 ratchet)", () => {
  const measured = doors();

  it('measures exactly the pinned doors', () => {
    expect(Object.keys(measured).sort()).toEqual(Object.keys(BUDGET.doors).sort());
  });

  it('every door emits exactly its pinned bytes and declarations per rule kind', () => {
    const drift = Object.entries(measured).filter(
      ([door, pin]) => JSON.stringify(pin) !== JSON.stringify(BUDGET.doors[door]),
    );
    expect(
      Object.fromEntries(drift),
      'Re-anchor through the governed door: pin the measured value AND append a history entry with the reason.',
    ).toEqual({});
  });

  it("the pins' total is the one the last history entry records, so no pin moves without a reason", () => {
    const total = Object.values(BUDGET.doors).reduce((sum, pin) => sum + pin.bytes, 0);
    const last = BUDGET.history[BUDGET.history.length - 1];
    expect(last?.reason.trim().length ?? 0).toBeGreaterThan(0);
    expect(last?.totalBytes).toBe(total);
  });
});
