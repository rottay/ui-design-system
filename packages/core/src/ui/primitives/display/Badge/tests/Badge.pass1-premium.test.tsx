import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LOCALE_CONFIGS, TRANSLATION_CATALOG } from '@/foundation/i18n/runtime/catalog';
import { resolveTranslation } from '@/foundation/i18n/runtime/resolution';
import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes';
import { themanagementmiamiBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/fixtures/themanagementmiami';
import { compileBrandTheme } from '@/infrastructure/compilers/kernel/runtime/brand-theme';

import ModernBadge from '../engines/modern';

const skin = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/badge.css'),
  'utf8',
);

describe('Modern Badge / Chip / Pill premium contract — Pass 1', () => {
  it('publishes one stable anatomy for avatar, icon, dot, label, count and remove', () => {
    render(
      <ModernBadge
        kind="chip"
        tone="primary"
        avatar={<img alt="" src="avatar.png" />}
        icon={<span data-testid="role-icon" />}
        count={12}
        dot
        removable
        removeLabel="Quitar filtro"
      >
        Diseño de producto
      </ModernBadge>,
    );

    const root = screen.getByText('Diseño de producto').closest('[data-part="root"]');
    expect(root).toHaveAttribute('data-kind', 'chip');
    expect(root).toHaveAttribute('data-has-avatar', 'true');
    expect(root).toHaveAttribute('data-has-icon', 'true');
    expect(root).toHaveAttribute('data-has-dot', 'true');
    expect(root).toHaveAttribute('data-has-count', 'true');
    expect(root).toHaveAttribute('data-removable', 'true');
    expect(root?.querySelector('[data-part="avatar"]')).not.toBeNull();
    expect(root?.querySelector('[data-part="icon"]')).not.toBeNull();
    expect(root?.querySelector('[data-part="dot"]')).not.toBeNull();
    expect(root?.querySelector('[data-part="label"]')).not.toBeNull();
    expect(root?.querySelector('[data-part="count"]')).toHaveTextContent('12');
    expect(root?.querySelector('[data-part="close"]')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Quitar filtro' })).toBeEnabled();
  });

  it('keeps the preferred removable API labelled while preserving closable compatibility', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <ModernBadge removable removeLabel="Quitar candidato" onClose={onClose}>
        Lucía Fernández
      </ModernBadge>,
    );

    const remove = screen.getByRole('button', { name: 'Quitar candidato' });
    expect(screen.getByText('Lucía Fernández').closest('[data-part="root"]'))
      .toHaveAttribute('data-removable', 'true');
    fireEvent.click(remove);
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(
      <ModernBadge closable removeLabel="Legacy remove" onClose={onClose}>
        Legacy
      </ModernBadge>,
    );
    expect(screen.getByRole('button', { name: 'Legacy remove' })).toBeEnabled();
  });

  it('uses native keyboard activation and keeps removal isolated from selection', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onSelectedChange = vi.fn();
    const onClose = vi.fn();

    render(
      <ModernBadge
        kind="pill"
        selected
        clickable
        onClick={onClick}
        onSelectedChange={onSelectedChange}
        removable
        onClose={onClose}
        removeLabel="Remove status"
        aria-label="Active status"
      >
        Active
      </ModernBadge>,
    );

    const trigger = screen.getByRole('button', { name: 'Active status' });
    expect(trigger).toHaveAttribute('aria-pressed', 'true');
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onSelectedChange).toHaveBeenCalledWith(false);

    await user.click(screen.getByRole('button', { name: 'Remove status' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onSelectedChange).toHaveBeenCalledTimes(1);
  });

  it('makes disabled and loading chips inert without losing state or accessible copy', () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <ModernBadge kind="chip" disabled onClick={onClick} aria-label="Disabled filter">
        Archived
      </ModernBadge>,
    );

    let root = screen.getByText('Archived').closest('[data-part="root"]');
    let trigger = screen.getByRole('button', { name: 'Disabled filter' });
    expect(root).toHaveAttribute('data-disabled', 'true');
    expect(trigger).toBeDisabled();
    fireEvent.click(trigger);
    expect(onClick).not.toHaveBeenCalled();

    rerender(
      <ModernBadge
        kind="chip"
        loading
        loadingText="Actualizando filtro"
        onClick={onClick}
        aria-label="Filtro activo"
      >
        Active
      </ModernBadge>,
    );
    root = screen.getByText('Actualizando filtro').closest('[data-part="root"]');
    trigger = screen.getByRole('button', { name: 'Actualizando filtro' });
    expect(root).toHaveAttribute('data-loading', 'true');
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(root?.querySelector('[data-part="spinner"]')).not.toBeNull();
    expect(trigger).toBeDisabled();
  });

  it('keeps long localized copy intact in the DOM and exposes logical RTL positions', () => {
    const longArabic = 'مرشح ذو خبرة واسعة في تصميم المنتجات والأنظمة المعقدة متعددة اللغات';
    const { container, rerender } = render(
      <div dir="rtl">
        <ModernBadge kind="chip" truncate removeLabel="إزالة المرشح" removable>
          {longArabic}
        </ModernBadge>
      </div>,
    );
    expect(screen.getByText(longArabic)).toHaveAttribute('data-part', 'label');
    expect(screen.getByRole('button', { name: 'إزالة المرشح' })).toBeInTheDocument();

    rerender(
      <div dir="rtl">
        <ModernBadge dot position="top-end">
          <span>الإشعارات</span>
        </ModernBadge>
      </div>,
    );
    const indicator = container.querySelector('[data-indicator="true"]');
    expect(indicator).toHaveAttribute('data-position', 'top-end');
    expect(indicator?.getAttribute('style')).toContain('inset-inline-end');
  });

  it('keeps brand and locale as independent axes while making the two real tenants diverge', () => {
    const bithire = compileBrandTheme({ brandTheme: bithireBrandTheme, tenantSlug: 'bithire' });
    const management = compileBrandTheme({
      brandTheme: themanagementmiamiBrandTheme,
      tenantSlug: 'themanagementmiami',
    });

    expect(bithire.personality.accent?.badgeShape).toBe('pill');
    expect(management.personality.accent?.badgeShape).toBe('square');
    for (const token of [
      '--ds-color-primary',
      '--ds-font-family-base',
      '--ds-badge-radius',
      '--ds-badge-chip-radius',
      '--ds-badge-count-radius',
      '--ds-badge-frame',
      '--ds-badge-surface-hover',
      '--ds-badge-hover-transform',
      '--ds-badge-motion-duration',
    ]) {
      expect(bithire.cssVariables[token], token).toBeDefined();
      expect(management.cssVariables[token], token).toBeDefined();
      expect(bithire.cssVariables[token], token).not.toBe(management.cssVariables[token]);
    }

    const labels = (['en', 'es', 'ar'] as const).map((locale) =>
      resolveTranslation({
        key: 'common.filter',
        locale,
        fallbackLocale: 'es',
        catalog: TRANSLATION_CATALOG,
      }),
    );
    expect(new Set(labels).size).toBe(3);
    expect(LOCALE_CONFIGS.en.direction).toBe('ltr');
    expect(LOCALE_CONFIGS.es.direction).toBe('ltr');
    expect(LOCALE_CONFIGS.ar.direction).toBe('rtl');
    expect(bithireBrandTheme).not.toHaveProperty('locale');
    expect(themanagementmiamiBrandTheme).not.toHaveProperty('locale');
  });

  it('encodes motion, accessibility and responsive safeguards in the skin', () => {
    expect(skin).toContain("[data-state~='focus-visible']");
    expect(skin).toContain("[data-selected='true']");
    expect(skin).toContain('@container (max-width: 12rem)');
    expect(skin).toContain('@media (pointer: coarse)');
    expect(skin).toContain('@media (prefers-reduced-motion: reduce)');
    expect(skin).toContain('@media (forced-colors: active)');
    expect(skin).toContain(':dir(rtl)');
    expect(skin).toContain('touch-action: manipulation');
    expect(skin).toContain('--ds-badge-surface-hover');
    expect(skin).toContain('--ds-badge-surface-pressed');
    expect(skin).toContain('animation: none');
    expect(skin).not.toMatch(/transition\s*:\s*all\b/);
    expect(skin).not.toMatch(/border-inline-start\s*:/);
    expect(skin).not.toMatch(/border-left\s*:/);
    expect(skin).not.toMatch(/margin-(left|right)\s*:/);
  });
});
