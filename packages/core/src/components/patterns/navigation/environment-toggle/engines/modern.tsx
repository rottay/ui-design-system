'use client';

/**
 * @fileoverview EnvironmentToggle -- Modern engine (token-driven).
 * Provides a UI control for switching between deployment environments.
 * Supports three display variants: segmented toggle (default), pill
 * buttons, and a custom dropdown with click-outside dismissal.
 * A colored banner warns when a non-production environment is active.
 * Production switches can require a confirmation modal.
 *
 * @example
 * <ModernEnvironmentToggle
 *   environments={[{ id: 'dev', name: 'Development', color: '#3b82f6' }]}
 *   activeEnvironment="dev"
 *   onChange={(envId) => setEnv(envId)}
 * />
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { EnvironmentToggleProps, EnvironmentDef } from '../EnvironmentToggle.types';
import { popupPanelStyle, pillBadgeSmStyle, inlineActionGroupStyle } from '../../../_internal/engines/modern/styles';

/**
 * Modern (token-driven) implementation of the EnvironmentToggle pattern.
 * Uses a segmented control for the default toggle, a custom dropdown with
 * outside-click detection, and a token-styled modal for production
 * confirmation.
 *
 * @param props - See {@link EnvironmentToggleProps} for the full prop contract.
 * @returns The rendered environment toggle with optional banner and confirmation modal.
 */
export default function ModernEnvironmentToggle(props: EnvironmentToggleProps) {
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
   * Routes to a confirmation modal if switching to production.
   */
  const handleSwitch = useCallback(
    (envId: string) => {
      if (envId === activeEnvironment) return;
      if (envId === productionId && confirmProductionSwitch) {
        /* Show confirmation modal instead of switching immediately */
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
        <div ref={dropdownRef} className="relative inline-block">
          <button
            style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            data-testid="env-toggle-trigger"
          >
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ background: activeEnv?.color ?? '#ccc' }}
            />
            {activeEnv?.name ?? 'Select'}
            {activeEnv?.badge && (
              <span
                style={{ ...pillBadgeSmStyle, background: activeEnv.color, color: 'var(--ds-color-text-on-primary)' }}
              >
                {activeEnv.badge}
              </span>
            )}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-50" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 min-w-[180px]" style={{ ...popupPanelStyle, boxShadow: 'var(--ds-elevation-3)' }}>
              {environments.map(env => (
                <button
                  key={env.id}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                    env.id === activeEnvironment ? 'font-semibold' : ''
                  }`}
                  style={env.id === activeEnvironment ? { background: 'var(--ds-surface-inset)' } : {}}
                  onClick={() => handleSwitch(env.id)}
                  data-testid={`env-option-${env.id}`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: env.color }} />
                  <span className="flex-1">{env.name}</span>
                  {env.badge && (
                    <span style={{ ...pillBadgeSmStyle, padding: '1px 5px', fontSize: 10, background: env.color, color: 'var(--ds-color-text-on-primary)' }}>{env.badge}</span>
                  )}
                  {env.id === activeEnvironment && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" style={{ color: 'var(--ds-color-primary)' }} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    /* Pills variant: individual buttons with environment color applied to active button */
    if (variant === 'pills') {
      return (
        <div className="flex gap-1" data-testid="env-toggle-trigger">
          {environments.map(env => (
            <button
              key={env.id}
              style={env.id === activeEnvironment
                ? { background: env.color, color: 'var(--ds-color-text-on-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: `1px solid ${env.color}`, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }
                : { background: 'transparent', color: 'var(--ds-color-text-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }
              }
              onClick={() => handleSwitch(env.id)}
              data-testid={`env-option-${env.id}`}
            >
              {env.icon}
              {env.name}
              {env.badge && (
                <span style={{ ...pillBadgeSmStyle, padding: '1px 5px', fontSize: 10, opacity: 0.8 }}>{env.badge}</span>
              )}
            </button>
          ))}
        </div>
      );
    }

    /* Default: segmented control -- buttons share borders for a joined look */
    return (
      <div style={{ display: 'inline-flex' }} data-testid="env-toggle-trigger">
        {environments.map((env, idx) => (
          <button
            key={env.id}
            style={env.id === activeEnvironment
              ? { background: env.color, color: 'var(--ds-color-text-on-primary)', height: 32, padding: '0 12px', fontSize: 13, border: `1px solid ${env.color}`, cursor: 'pointer', borderRadius: idx === 0 ? 'var(--ds-radius-md) 0 0 var(--ds-radius-md)' : idx === environments.length - 1 ? '0 var(--ds-radius-md) var(--ds-radius-md) 0' : 0 }
              : { background: 'transparent', color: 'var(--ds-color-text-primary)', height: 32, padding: '0 12px', fontSize: 13, border: '1px solid var(--ds-color-border)', cursor: 'pointer', borderRadius: idx === 0 ? 'var(--ds-radius-md) 0 0 var(--ds-radius-md)' : idx === environments.length - 1 ? '0 var(--ds-radius-md) var(--ds-radius-md) 0' : 0 }
            }
            onClick={() => handleSwitch(env.id)}
            data-testid={`env-option-${env.id}`}
          >
            <span className="flex items-center gap-1.5">
              {env.icon}
              {env.name}
              {env.badge && (
                <span style={{ ...pillBadgeSmStyle, padding: '1px 5px', fontSize: 10 }}>{env.badge}</span>
              )}
            </span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={`ds-pattern-environment-toggle ds-engine-modern ${className ?? ''}`} style={style}>
      {/* Banner -- pulsing dot + message in env color; only for non-production environments */}
      {/* Color suffix '15' gives ~9% hex opacity for a subtle background tint */}
      {showBanner && !isProduction && activeEnv && (
        <div
          className="flex items-center justify-center gap-2 py-1.5 px-4 text-xs font-medium"
          style={{
            background: activeEnv.color + '15',
            borderBottom: `2px solid ${activeEnv.color}`,
            color: activeEnv.color,
          }}
          data-testid="env-banner"
        >
          {/* Pulsing dot for visual attention */}
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: activeEnv.color }}
          />
          {bannerMessage ?? `You are viewing the ${activeEnv.name} environment`}
        </div>
      )}

      {/* Toggle control */}
      <div className="flex items-center">
        {renderToggle()}
      </div>

      {/* Production confirmation modal -- triggered by setting confirmEnv state.
          Confirming fires onChange and resets both modal and dropdown state.
          Clicking the backdrop or Cancel dismisses without switching. */}
      {confirmEnv && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--ds-surface-card)', borderRadius: 'var(--ds-radius-lg)', boxShadow: 'var(--ds-elevation-3)', padding: 24, maxWidth: 384, width: '100%', position: 'relative', zIndex: 1 }}>
            <h3 className="font-bold text-lg">Switch to Production</h3>
            <p className="py-4 text-sm opacity-70">{confirmProductionSwitch}</p>
            <div className="flex justify-end gap-2">
              <button
                style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer' }}
                onClick={() => setConfirmEnv(null)}
              >
                Cancel
              </button>
              <button
                style={{ background: 'var(--ds-color-error)', color: 'var(--ds-color-text-on-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer' }}
                onClick={() => {
                  /* Commit the environment switch and clean up all UI state */
                  onChange(confirmEnv);
                  setConfirmEnv(null);
                  setDropdownOpen(false);
                }}
                data-testid="env-confirm-production"
              >
                Switch to Production
              </button>
            </div>
          </div>
          {/* Transparent backdrop -- closes modal on click without switching */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setConfirmEnv(null)} />
        </div>
      )}
    </div>
  );
}
