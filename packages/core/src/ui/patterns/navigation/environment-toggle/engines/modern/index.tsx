'use client';

/**
 * @fileoverview EnvironmentToggle -- Modern engine (token-driven).
 * Provides a UI control for switching between deployment environments.
 * Supports three display variants: segmented toggle (default), pill
 * buttons, and a custom dropdown with click-outside dismissal.
 * A colored banner warns when a non-production environment is active.
 * Production switches can require a confirmation dialog.
 *
 * The pattern COMPOSES public DS primitives — Button (trigger and every
 * option across the three variants) and ConfirmDialog (the production
 * confirmation, previously a hand-rolled modal) — and never recreates a
 * control with its own HTML/CSS. Option STATE paint (active accent, joined
 * segmented corners, banner) stays in the unlayered modern skin, keyed on
 * the `data-part`/`data-*` contract this file stamps. Own copy resolves
 * through the optional `components` i18n channel with an English floor.
 *
 * @example
 * <ModernEnvironmentToggle
 *   environments={[{ id: 'dev', name: 'Development', color: '#3b82f6' }]}
 *   activeEnvironment="dev"
 *   onChange={(envId) => setEnv(envId)}
 * />
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { EnvironmentToggleProps } from '../../contracts';
import { pillBadgeSmStyle } from '../../../../foundation/engine-styles/modern';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { NavigationExpandIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-expand';
import ModernButton from '../../../../../primitives/inputs/Button/engines/modern';
import ModernConfirmDialog from '../../../../../primitives/overlay/ConfirmDialog/engines/modern';

/**
 * Modern (token-driven) implementation of the EnvironmentToggle pattern.
 * Uses a segmented control for the default toggle, a dropdown with
 * outside-click detection, and the composed ConfirmDialog primitive for
 * production confirmation.
 *
 * @param props - See {@link EnvironmentToggleProps} for the full prop contract.
 * @returns The rendered environment toggle with optional banner and confirmation dialog.
 */
export default function ModernEnvironmentToggle(props: EnvironmentToggleProps) {
  // Optional channel with an English floor: the toggle renders standalone
  // (no I18nProvider) without crashing, and never echoes a raw key.
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, floor: string, params?: Record<string, string | number>): string =>
    i18n?.tOr(key, floor, params) ?? floor;

  const {
    environments,
    activeEnvironment,
    onChange,
    variant = 'toggle',
    showBanner = true,
    bannerMessage,
    productionId,
    confirmProductionSwitch,
    loading,
    className,
    style,
  } = props;

  /* Dropdown open/close state for the dropdown variant */
  const [dropdownOpen, setDropdownOpen] = useState(false);
  /* Tracks which environment needs production confirmation (null = no pending confirmation) */
  const [confirmEnv, setConfirmEnv] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeEnv = environments.find(e => e.id === activeEnvironment);
  const isProduction = activeEnvironment === productionId;
  const confirmEnvName = environments.find(e => e.id === confirmEnv)?.name ?? confirmEnv ?? '';

  const copy = {
    select: tOr('environmentToggle.select', 'Select'),
    banner: activeEnv
      ? tOr('environmentToggle.banner', 'You are viewing the {name} environment', { name: activeEnv.name })
      : '',
    confirmTitle: tOr('environmentToggle.confirmTitle', 'Switch to {name}', { name: confirmEnvName }),
    cancel: tOr('environmentToggle.cancel', 'Cancel'),
  };

  /** Closes dropdown when user clicks outside the dropdown container */
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    },
    [],
  );

  /* Register/unregister click-outside listener only while dropdown is open */
  useEffect(() => {
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen, handleClickOutside]);

  /**
   * Handles environment switching with production safety gate.
   * Routes to a confirmation dialog if switching to production.
   */
  const handleSwitch = useCallback(
    (envId: string) => {
      if (envId === activeEnvironment) return;
      if (envId === productionId && confirmProductionSwitch) {
        /* Show confirmation dialog instead of switching immediately */
        setConfirmEnv(envId);
      } else {
        onChange(envId);
        setDropdownOpen(false);
      }
    },
    [activeEnvironment, productionId, confirmProductionSwitch, onChange],
  );

  /** Renders the appropriate toggle control based on the variant prop */
  const renderToggle = () => {
    /* Dropdown variant: positioned menu with click-outside dismissal */
    if (variant === 'dropdown') {
      return (
        <div ref={dropdownRef} data-part="toggle" data-variant="dropdown">
          <ModernButton
            variant="ghost"
            size="sm"
            data-part="trigger"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            data-testid="env-toggle-trigger"
          >
            <span
              data-part="dot"
              style={{ '--ds-envtoggle-accent': activeEnv?.color ?? 'var(--ds-color-neutral-400)' } as React.CSSProperties}
            />
            {activeEnv?.name ?? copy.select}
            {activeEnv?.badge && (
              <span
                data-part="badge"
                style={{ ...pillBadgeSmStyle, '--ds-envtoggle-accent': activeEnv.color } as React.CSSProperties}
              >
                {activeEnv.badge}
              </span>
            )}
            <NavigationExpandIcon decorative size={12} />
          </ModernButton>

          {dropdownOpen && (
            <div data-part="panel">
              {environments.map(env => (
                <ModernButton
                  key={env.id}
                  variant="ghost"
                  size="sm"
                  data-part="option"
                  data-active={env.id === activeEnvironment}
                  onClick={() => handleSwitch(env.id)}
                  data-testid={`env-option-${env.id}`}
                >
                  <span data-part="dot" style={{ '--ds-envtoggle-accent': env.color } as React.CSSProperties} />
                  <span data-part="option-name">{env.name}</span>
                  {env.badge && (
                    <span data-part="badge" style={{ ...pillBadgeSmStyle, padding: '1px 5px', fontSize: 10, '--ds-envtoggle-accent': env.color } as React.CSSProperties}>{env.badge}</span>
                  )}
                  {env.id === activeEnvironment && (
                    <svg xmlns="http://www.w3.org/2000/svg" data-part="check" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </ModernButton>
              ))}
            </div>
          )}
        </div>
      );
    }

    /* Pills variant: individual buttons with environment color applied to active button */
    if (variant === 'pills') {
      return (
        <div data-part="toggle" data-variant="pills" data-testid="env-toggle-trigger">
          {environments.map(env => (
            <ModernButton
              key={env.id}
              variant="ghost"
              size="sm"
              data-part="option"
              data-active={env.id === activeEnvironment}
              style={{ '--ds-envtoggle-accent': env.color } as React.CSSProperties}
              onClick={() => handleSwitch(env.id)}
              data-testid={`env-option-${env.id}`}
            >
              {env.icon}
              {env.name}
              {env.badge && (
                <span data-part="badge" style={{ ...pillBadgeSmStyle, padding: '1px 5px', fontSize: 10, opacity: 0.8 }}>{env.badge}</span>
              )}
            </ModernButton>
          ))}
        </div>
      );
    }

    /* Default: segmented control -- buttons share borders for a joined look */
    return (
      <div data-part="toggle" data-variant="toggle" data-testid="env-toggle-trigger">
        {environments.map((env, idx) => (
          <ModernButton
            key={env.id}
            variant="ghost"
            size="sm"
            data-part="option"
            data-active={env.id === activeEnvironment}
            data-position={idx === 0 ? 'first' : idx === environments.length - 1 ? 'last' : 'middle'}
            style={{ '--ds-envtoggle-accent': env.color } as React.CSSProperties}
            onClick={() => handleSwitch(env.id)}
            data-testid={`env-option-${env.id}`}
          >
            <span className="flex items-center gap-1.5">
              {env.icon}
              {env.name}
              {env.badge && (
                <span data-part="badge" style={{ ...pillBadgeSmStyle, padding: '1px 5px', fontSize: 10 }}>{env.badge}</span>
              )}
            </span>
          </ModernButton>
        ))}
      </div>
    );
  };

  return (
    <div className={`ds-pattern-environment-toggle ds-engine-modern ${className ?? ''}`} data-part="root" style={style}>
      {/* Banner -- pulsing dot + message in env color; only for non-production environments.
          The soft tint rides the consumer-supplied accent hatch (config data). */}
      {showBanner && !isProduction && activeEnv && (
        <div
          data-part="banner"
          style={{
            '--ds-envtoggle-accent': activeEnv.color,
            '--ds-envtoggle-accent-soft': activeEnv.color + '15',
          } as React.CSSProperties}
          data-testid="env-banner"
        >
          {/* Pulsing dot for visual attention (cadence rides the Tailwind
              animate-pulse utility; the skin owns dot geometry and fill) */}
          <span
            className="animate-pulse"
            data-part="banner-dot"
            style={{ '--ds-envtoggle-accent': activeEnv.color } as React.CSSProperties}
          />
          {bannerMessage ?? copy.banner}
        </div>
      )}

      {/* Toggle control */}
      <div data-part="toggle-row">
        {renderToggle()}
      </div>

      {/* Production confirmation: the composed ConfirmDialog primitive owns
          the top layer, focus trap, glass scrim and action chrome. Confirming
          fires onChange and resets both dialog and dropdown state; Escape,
          backdrop click and Cancel dismiss without switching. */}
      {confirmEnv && (
        <ModernConfirmDialog
          open
          variant="danger"
          title={copy.confirmTitle}
          description={confirmProductionSwitch}
          confirmLabel={copy.confirmTitle}
          cancelLabel={copy.cancel}
          onConfirm={() => {
            onChange(confirmEnv);
            setConfirmEnv(null);
            setDropdownOpen(false);
          }}
          onCancel={() => setConfirmEnv(null)}
        />
      )}
    </div>
  );
}
