/**
 * ActionDock structured-actions tests: priority grammar, overflow collapse
 * law, APG toolbar keyboard model, density boundary, and skin ownership pins.
 *
 * Portal pixel geometry of the overflow menu is not asserted (happy-dom
 * returns zeroed rects) — menu open/content behavior only.
 */

import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithEngine, STABLE_ENGINES } from '../../../../../tooling/testing/helpers/engine';
import { ResponsiveContext, type ResponsiveContextValue } from '../../../../../infrastructure/runtime/responsive';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { ActionDock } from '..';
import type { ActionDockAction } from '..';

const ACTION_DOCK_SKIN = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/presentation/components/skin/action-dock.css'),
  'utf8'
);
const NORMALIZED_ACTION_DOCK_SKIN = ACTION_DOCK_SKIN.replace(/\s+/g, ' ');

const DESKTOP_CONTEXT: ResponsiveContextValue = {
  hasResolvedViewport: true,
  deviceClass: 'desktop',
  activeBreakpoint: 'lg',
  isPhone: false,
  isTablet: false,
  isDesktop: true,
  pointer: 'fine',
  orientation: 'landscape',
  prefersReducedMotion: false,
  isPhoneOrTablet: false,
  isTabletOrDesktop: true,
  isTouchDevice: false,
  virtualKeyboardInset: 0,
  isVirtualKeyboardOpen: false,
};

const PHONE_CONTEXT: ResponsiveContextValue = {
  ...DESKTOP_CONTEXT,
  deviceClass: 'phone',
  activeBreakpoint: 'xs',
  isPhone: true,
  isDesktop: false,
  isTabletOrDesktop: false,
  pointer: 'coarse',
  orientation: 'portrait',
  isPhoneOrTablet: true,
  isTouchDevice: true,
};

const GRAMMAR_ACTIONS: ActionDockAction[] = [
  { key: 'advance', label: 'Advance', priority: 'primary' },
  { key: 'shortlist', label: 'Shortlist' },
  { key: 'message', label: 'Message' },
  { key: 'reject', label: 'Reject', priority: 'danger' },
];

function renderDock(ui: React.ReactElement, engine: (typeof STABLE_ENGINES)[number], context = DESKTOP_CONTEXT) {
  return renderWithEngine(
    <ResponsiveContext.Provider value={context}>{ui}</ResponsiveContext.Provider>,
    engine
  );
}

describe('ActionDock structured actions', () => {
  it.each(STABLE_ENGINES)('orders the priority grammar danger → secondary → primary under %s', async (engine) => {
    const { findByTestId } = renderDock(<ActionDock actions={GRAMMAR_ACTIONS} />, engine);
    const dock = await findByTestId('action-dock');
    const rendered = Array.from(dock.querySelectorAll('[data-action-key]'));

    expect(rendered.map((node) => node.getAttribute('data-action-key'))).toEqual([
      'reject',
      'shortlist',
      'message',
      'advance',
    ]);
    expect(rendered.map((node) => node.getAttribute('data-priority'))).toEqual([
      'danger',
      'secondary',
      'secondary',
      'primary',
    ]);
    expect(rendered.every((node) => node.classList.contains('rottay-action-dock__action'))).toBe(true);
  });

  it.each(STABLE_ENGINES)('runs a single-tab-stop roving tabindex under %s', async (engine) => {
    const { findByTestId } = renderDock(<ActionDock actions={GRAMMAR_ACTIONS} />, engine);
    const dock = await findByTestId('action-dock');
    const rendered = Array.from(dock.querySelectorAll<HTMLElement>('[data-action-key]'));

    expect(rendered.map((node) => node.tabIndex)).toEqual([0, -1, -1, -1]);
  });

  it('skips disabled actions in the roving tabindex and honors aria/busy forwarding', async () => {
    const { findByTestId } = renderDock(
      <ActionDock
        actions={[
          { key: 'reject', label: 'Reject', priority: 'danger', disabled: true },
          { key: 'save', label: 'Save', priority: 'primary', pending: true },
          { key: 'note', label: 'Add note' },
        ]}
      />,
      'modern'
    );
    const dock = await findByTestId('action-dock');
    const reject = dock.querySelector<HTMLElement>('[data-action-key="reject"]');
    const note = dock.querySelector<HTMLElement>('[data-action-key="note"]');
    const save = dock.querySelector<HTMLElement>('[data-action-key="save"]');

    // First ENABLED action owns the single tab stop; disabled gets none.
    expect(note?.tabIndex).toBe(0);
    expect(reject?.tabIndex).toBe(-1);
    expect(reject).toHaveAttribute('aria-disabled', 'true');
    expect(save).toHaveAttribute('aria-busy', 'true');
  });

  it('moves focus with direction-aware arrows, wraps, and supports Home/End (LTR)', async () => {
    const { findByTestId } = renderDock(<ActionDock actions={GRAMMAR_ACTIONS} />, 'modern');
    const dock = await findByTestId('action-dock');
    const byKey = (key: string) =>
      dock.querySelector<HTMLElement>(`[data-action-key="${key}"]`) as HTMLElement;

    act(() => byKey('reject').focus());
    fireEvent.keyDown(byKey('reject'), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(byKey('shortlist'));

    fireEvent.keyDown(byKey('shortlist'), { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(byKey('reject'));

    // Wrap backward from the first action lands on the last.
    fireEvent.keyDown(byKey('reject'), { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(byKey('advance'));

    fireEvent.keyDown(byKey('advance'), { key: 'Home' });
    expect(document.activeElement).toBe(byKey('reject'));

    fireEvent.keyDown(byKey('reject'), { key: 'End' });
    expect(document.activeElement).toBe(byKey('advance'));

    // Focus moved through dock-rendered controls syncs the roving tab stop.
    expect(byKey('advance').tabIndex).toBe(0);
    expect(byKey('reject').tabIndex).toBe(-1);
  });

  it('mirrors the arrow model in RTL (ArrowLeft moves forward)', async () => {
    const { findByTestId } = renderDock(
      <div dir="rtl">
        <ActionDock actions={GRAMMAR_ACTIONS} />
      </div>,
      'modern'
    );
    const dock = await findByTestId('action-dock');
    const byKey = (key: string) =>
      dock.querySelector<HTMLElement>(`[data-action-key="${key}"]`) as HTMLElement;

    act(() => byKey('reject').focus());
    fireEvent.keyDown(byKey('reject'), { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(byKey('shortlist'));

    fireEvent.keyDown(byKey('shortlist'), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(byKey('reject'));
  });

  it('keeps arrow-key focus movement across freeform children', async () => {
    const { findByTestId } = renderDock(
      <ActionDock>
        <button type="button">Cancel</button>
        <button type="button">Save</button>
      </ActionDock>,
      'modern'
    );
    const dock = await findByTestId('action-dock');
    const [cancel, save] = Array.from(dock.querySelectorAll('button')) as HTMLElement[];

    act(() => cancel.focus());
    fireEvent.keyDown(cancel, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(save);
  });

  it('collapses secondary actions into a more-actions menu on phone postures', async () => {
    const { findByTestId } = renderDock(
      <ActionDock actions={GRAMMAR_ACTIONS} />,
      'modern',
      PHONE_CONTEXT
    );
    const dock = await findByTestId('action-dock');

    // Danger and primary stay inline; secondaries leave the row.
    expect(dock.querySelector('[data-action-key="reject"]')).not.toBeNull();
    expect(dock.querySelector('[data-action-key="advance"]')).not.toBeNull();
    expect(dock.querySelector('[data-action-key="shortlist"]')).toBeNull();
    expect(dock.querySelector('[data-action-key="message"]')).toBeNull();

    const trigger = await findByTestId('action-dock-overflow');
    expect(trigger).toHaveAttribute('aria-label', 'More actions');
    expect(trigger).toHaveAttribute('data-action-key', '__overflow__');

    // Collapsed actions are reachable through the menu.
    fireEvent.click(trigger);
    expect(await screen.findByText('Shortlist')).toBeInTheDocument();
    expect(await screen.findByText('Message')).toBeInTheDocument();
  });

  it('keeps two actions inline on phone postures (no collapse at or below the threshold)', async () => {
    const { findByTestId, queryByTestId } = renderDock(
      <ActionDock
        actions={[
          { key: 'cancel', label: 'Cancel' },
          { key: 'save', label: 'Save', priority: 'primary' },
        ]}
      />,
      'modern',
      PHONE_CONTEXT
    );
    const dock = await findByTestId('action-dock');

    expect(dock.querySelector('[data-action-key="cancel"]')).not.toBeNull();
    expect(dock.querySelector('[data-action-key="save"]')).not.toBeNull();
    expect(queryByTestId('action-dock-overflow')).toBeNull();
  });

  it('never collapses when overflow="none", even on phone postures', async () => {
    const { findByTestId, queryByTestId } = renderDock(
      <ActionDock actions={GRAMMAR_ACTIONS} overflow="none" />,
      'modern',
      PHONE_CONTEXT
    );
    const dock = await findByTestId('action-dock');

    expect(dock.querySelectorAll('[data-action-key]')).toHaveLength(4);
    expect(queryByTestId('action-dock-overflow')).toBeNull();
  });

  it('keeps every action inline on desktop postures', async () => {
    const { findByTestId, queryByTestId } = renderDock(
      <ActionDock actions={GRAMMAR_ACTIONS} />,
      'rustic',
      DESKTOP_CONTEXT
    );
    const dock = await findByTestId('action-dock');

    expect(dock.querySelectorAll('[data-action-key]')).toHaveLength(4);
    expect(queryByTestId('action-dock-overflow')).toBeNull();
  });

  it('honors the overflowLabel contract for the trigger accessible name', async () => {
    const { findByTestId } = renderDock(
      <ActionDock actions={GRAMMAR_ACTIONS} overflowLabel="Más acciones" />,
      'classic',
      PHONE_CONTEXT
    );

    expect(await findByTestId('action-dock-overflow')).toHaveAttribute('aria-label', 'Más acciones');
  });

  it('stamps a local density boundary on the root', async () => {
    const { findByTestId } = renderDock(<ActionDock actions={GRAMMAR_ACTIONS} density="compact" />, 'modern');
    const dock = await findByTestId('action-dock');

    expect(dock).toHaveAttribute('data-density', 'compact');
  });

  it('renders structured actions before freeform children', async () => {
    const { findByTestId } = renderDock(
      <ActionDock actions={[{ key: 'save', label: 'Save', priority: 'primary' }]}>
        <button type="button">Extra</button>
      </ActionDock>,
      'modern'
    );
    const dock = await findByTestId('action-dock');
    const row = dock.querySelector('.rottay-action-dock__actions') as HTMLElement;

    expect(row.firstElementChild).toHaveAttribute('data-action-key', 'save');
    expect(row.lastElementChild).toHaveTextContent('Extra');
  });
});

describe('ActionDock skin ownership (structured grammar)', () => {
  it('paints the priority grammar as dock-owned layout, not inline or cross-component paint', () => {
    expect(NORMALIZED_ACTION_DOCK_SKIN).toMatch(
      /\.rottay-action-dock__actions > \* \{\s*min-inline-size: 0/
    );
    expect(NORMALIZED_ACTION_DOCK_SKIN).toContain(
      ".rottay-action-dock__actions > .rottay-action-dock__action[data-priority='primary'] { flex: 1 1 auto; }"
    );
    expect(NORMALIZED_ACTION_DOCK_SKIN).toContain(
      ".rottay-action-dock__actions > .rottay-action-dock__action[data-priority='danger'] { margin-inline-end: auto; }"
    );
    expect(NORMALIZED_ACTION_DOCK_SKIN).toContain(
      ".rottay-action-dock__actions > .rottay-action-dock__overflow-trigger { flex: 0 0 auto; }"
    );
    // No physical-properties leak in the grammar (RTL mirrors for free).
    const grammarRules = ACTION_DOCK_SKIN.match(/\.rottay-action-dock__action[^{]*\{[^}]*\}/g) ?? [];
    for (const rule of grammarRules) {
      expect(rule).not.toMatch(/\b(margin-left|margin-right|left:|right:|float)\b/);
    }
  });

  it('levels the 44px physical floor on coarse pointers', () => {
    const coarseBlock = ACTION_DOCK_SKIN.match(/@media \(pointer: coarse\)\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
    expect(coarseBlock).toContain('.rottay-action-dock__actions > :where(button, a)');
    expect(coarseBlock).toContain('.rottay-action-dock__overflow-trigger');
    expect(coarseBlock).toContain('min-block-size: max(44px, var(--ds-size-touch-target, 44px))');
  });

  it('carries a tokenized structural edge hairline that forced-colors inherits', () => {
    // The separation contract is structural (not a forced-colors retouch):
    // the UA forces the border color to CanvasText in forced-colors mode, so
    // one logical, tenant-tokenizable rule covers both postures.
    const bottomRule = ACTION_DOCK_SKIN.match(
      /\[data-placement=["']bottom["']\]\s*\{([^}]*)\}/
    )?.[1];
    const topRule = ACTION_DOCK_SKIN.match(
      /\[data-placement=["']top["']\]\s*\{([^}]*)\}/
    )?.[1];

    expect(bottomRule).toContain(
      'border-block-start: 1px solid var(--ds-action-dock-edge-color, var(--ds-color-border-primary, transparent))'
    );
    expect(topRule).toContain(
      'border-block-end: 1px solid var(--ds-action-dock-edge-color, var(--ds-color-border-primary, transparent))'
    );
    // No forced-colors retouch and no physical edge properties anywhere.
    expect(ACTION_DOCK_SKIN).not.toContain('@media (forced-colors');
    expect(ACTION_DOCK_SKIN).not.toMatch(/border-(top|bottom|left|right)\b/);
  });

  it('reads as a frosted chrome sheet with placement-aware elevation (W10)', () => {
    const rootRule = ACTION_DOCK_SKIN.match(
      /\.rottay-action-dock\[data-part=["']root["']\]\[data-placement\]\[data-mode\]\s*\{([^}]*)\}/
    )?.[1];
    const bottomRule = ACTION_DOCK_SKIN.match(
      /\[data-placement=["']bottom["']\]\s*\{([^}]*)\}/
    )?.[1];
    const topRule = ACTION_DOCK_SKIN.match(
      /\[data-placement=["']top["']\]\s*\{([^}]*)\}/
    )?.[1];

    // Frosted surface: translucent bg-primary mix + tokenized backdrop blur on
    // the glass channel (collapses to 0 under the reduced-effects intensity).
    expect(rootRule).toContain('--ds-action-dock-bg');
    expect(rootRule).toContain('color-mix(in srgb, var(--ds-color-bg-primary)');
    expect(rootRule).toContain('transparent');
    expect(rootRule).toContain('blur(var(--ds-glass-blur, 8px))');
    expect(rootRule).toContain('backdrop-filter');

    // Placement-aware elevation: a bottom dock casts UPWARD (the downward
    // navbar shadow is invisible beneath it); a top dock keeps the downward
    // navbar shadow. Both edges carry the neutral inset highlight.
    expect(bottomRule).toContain('--ds-action-dock-shadow-bottom');
    expect(bottomRule).toMatch(/0 -\d+px \d+px color-mix\(in srgb, var\(--ds-color-shadow\)/);
    expect(bottomRule).not.toContain('--ds-shadow-navbar');
    expect(topRule).toContain('var(--ds-action-dock-shadow-top, var(--ds-shadow-navbar))');
    for (const rule of [bottomRule, topRule]) {
      expect(rule).toContain('--ds-action-dock-edge-highlight');
      expect(rule).toContain('color-mix(in srgb, var(--ds-color-bg-elevated)');
    }

    // Theme/density channel switches transition; reduced motion silences it.
    expect(rootRule).toContain('transition:');
    expect(rootRule).toContain('var(--ds-motion-fast, 120ms)');
    expect(ACTION_DOCK_SKIN).toMatch(
      /@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*transition:\s*none/
    );
  });
});


describe('ActionDock guarded i18n channel (K4 idiom)', () => {
  const CATALOG_TRANSLATIONS = {
    components: {
      actionDock: {
        overflow: { label: 'Más acciones' },
        topLabel: 'Acciones superiores',
        bottomLabel: 'Acciones inferiores',
      },
    },
  } as const;

  function renderDockWithI18n(
    ui: React.ReactElement,
    i18nProps: Omit<React.ComponentProps<typeof I18nProvider>, 'children'>
  ) {
    // I18nProvider mounts closest to the dock so it wins over any ambient
    // provider, mirroring the Calendar/Pagination label pins.
    return renderWithEngine(
      <ResponsiveContext.Provider value={PHONE_CONTEXT}>
        <I18nProvider {...i18nProps}>{ui}</I18nProvider>
      </ResponsiveContext.Provider>,
      'modern'
    );
  }

  it('keeps the English labels without an I18nProvider (standalone fallback)', async () => {
    const { findByTestId } = renderDock(
      <ActionDock actions={GRAMMAR_ACTIONS} />,
      'modern',
      PHONE_CONTEXT
    );

    expect(await findByTestId('action-dock')).toHaveAttribute('aria-label', 'Bottom actions');
    expect(await findByTestId('action-dock-overflow')).toHaveAttribute('aria-label', 'More actions');
  });

  it('keeps the English labels when the catalog echoes the raw key (missing-key echo guard)', async () => {
    // All five shipped locales carry the actionDock keys, so the missing-key
    // posture is injected through the tenant tier: a locale JSON without the
    // keys makes t() return the raw key (provider: "return the raw key as a
    // last resort"), and the endsWith guard must fall back to English.
    const { findByTestId } = renderDockWithI18n(<ActionDock actions={GRAMMAR_ACTIONS} />, {
      locale: 'es',
      customTranslations: {
        components: {
          actionDock: {
            overflow: { label: 'actionDock.overflow.label' },
            topLabel: 'actionDock.topLabel',
            bottomLabel: 'actionDock.bottomLabel',
          },
        },
      },
    });

    expect(await findByTestId('action-dock')).toHaveAttribute('aria-label', 'Bottom actions');
    expect(await findByTestId('action-dock-overflow')).toHaveAttribute('aria-label', 'More actions');
  });

  it('resolves chrome labels through the components catalog once the keys land', async () => {
    const { findByTestId } = renderDockWithI18n(<ActionDock actions={GRAMMAR_ACTIONS} />, {
      locale: 'es',
      customTranslations: CATALOG_TRANSLATIONS,
    });

    expect(await findByTestId('action-dock')).toHaveAttribute('aria-label', 'Acciones inferiores');
    expect(await findByTestId('action-dock-overflow')).toHaveAttribute('aria-label', 'Más acciones');
  });

  it('resolves the placement-aware top label through the catalog', async () => {
    const { findByTestId } = renderDockWithI18n(
      <ActionDock position="top" actions={GRAMMAR_ACTIONS} />,
      { locale: 'es', customTranslations: CATALOG_TRANSLATIONS }
    );

    expect(await findByTestId('action-dock')).toHaveAttribute('aria-label', 'Acciones superiores');
  });

  it('lets explicit props win over the catalog', async () => {
    const { findByTestId } = renderDockWithI18n(
      <ActionDock actions={GRAMMAR_ACTIONS} aria-label="Dock del candidato" overflowLabel="Menú extra" />,
      { locale: 'es', customTranslations: CATALOG_TRANSLATIONS }
    );

    expect(await findByTestId('action-dock')).toHaveAttribute('aria-label', 'Dock del candidato');
    expect(await findByTestId('action-dock-overflow')).toHaveAttribute('aria-label', 'Menú extra');
  });
});
