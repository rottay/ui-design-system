/**
 * @fileoverview Badge modern engine — i18n + token-channel tests (R2+R3 batch B).
 *
 * Pins the accessible-name chain for the close control and the busy trigger:
 * caller copy wins, then the `common.remove` / `common.loading` catalogue
 * (all five locales), then the documented English floor — a removable or busy
 * badge never renders an unnamed control. Also pins the skin tokenization of
 * the optical highlight (no bare `white` literal).
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';

import ModernBadge from '../engines/modern';
import { I18nProvider } from '@/infrastructure/runtime/i18n';

const modernSkin = readFileSync(
  resolve(
    process.cwd(),
    'src/foundation/tokens/css/runtime/engines/modern/skin/badge.css'
  ),
  'utf8'
);

/**
 * A removable badge rendered WITHOUT `removeLabel`.
 *
 * `BadgeRemovalProps` makes `removeLabel` required under `removable: true`, so
 * a TypeScript caller must always name the close control. The catalogue chain
 * below it (`common.remove`, then the English floor) is the fail-safe for the
 * callers that escape that type -- JS consumers and the deprecated `closable`
 * path -- and naming the prop here would render that floor unreachable. The
 * two tests that use this alias assert the floor, so the ABSENT prop is the
 * shape under test: the cast is the assertion, not a way around the contract.
 */
const ModernBadgeUnnamedRemoval = ModernBadge as unknown as React.ComponentType<
  Omit<React.ComponentProps<typeof ModernBadge>, 'removable' | 'removeLabel'> & {
    removable?: boolean;
  }
>;

describe('Badge modern i18n (R2+R3)', () => {
  afterEach(async () => {
    // W4 idiom: locale observers re-fire on dir/lang removal; keep the
    // teardown inside act with a drain for pending follow-ups.
    await act(async () => {
      document.documentElement.removeAttribute('dir');
      document.documentElement.removeAttribute('lang');
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
  });

  it('names the close control from the English floor without a provider or prop', () => {
    render(
      <ModernBadgeUnnamedRemoval kind="chip" removable onClose={vi.fn()}>
        Remote only
      </ModernBadgeUnnamedRemoval>
    );

    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  it('resolves the close label from the active locale through the provider', () => {
    render(
      <I18nProvider locale="es" fallbackLocale="es">
        <ModernBadgeUnnamedRemoval kind="chip" removable onClose={vi.fn()}>
          Remoto
        </ModernBadgeUnnamedRemoval>
      </I18nProvider>
    );

    expect(screen.getByRole('button', { name: 'Quitar' })).toBeInTheDocument();
  });

  it('keeps the caller removeLabel ahead of the catalog', () => {
    render(
      <I18nProvider locale="es" fallbackLocale="es">
        <ModernBadge kind="chip" removable removeLabel="Descartar filtro" onClose={vi.fn()}>
          Remoto
        </ModernBadge>
      </I18nProvider>
    );

    expect(screen.getByRole('button', { name: 'Descartar filtro' })).toBeInTheDocument();
  });

  it('names the busy trigger from the English floor when loading has no copy', () => {
    render(
      <ModernBadge kind="chip" clickable onClick={vi.fn()} loading>
        Syncing
      </ModernBadge>
    );

    expect(screen.getByRole('button', { name: 'Loading' })).toBeDisabled();
  });

  it('resolves the busy name from the active locale through the provider', () => {
    render(
      <I18nProvider locale="es" fallbackLocale="es">
        <ModernBadge kind="chip" clickable onClick={vi.fn()} loading>
          Sincronizando
        </ModernBadge>
      </I18nProvider>
    );

    expect(screen.getByRole('button', { name: 'Cargando...' })).toBeDisabled();
  });

  it('keeps the caller loadingText ahead of the catalog', () => {
    render(
      <I18nProvider locale="es" fallbackLocale="es">
        <ModernBadge kind="chip" clickable onClick={vi.fn()} loading loadingText="Sincronizando">
          Sync
        </ModernBadge>
      </I18nProvider>
    );

    expect(screen.getByRole('button', { name: 'Sincronizando' })).toBeDisabled();
  });

  it('paints the optical highlight from the white token channel, never a bare literal', () => {
    expect(modernSkin).not.toMatch(/color-mix\(in srgb, white /);
    expect(modernSkin).toContain('var(--ds-color-white)');
    expect(modernSkin).not.toContain('var(--ds-color-white, white)');
  });
});
