'use client';

/**
 * @fileoverview EnvironmentToggle -- Rustic engine (Vanilla / CSS variables).
 * Provides an environment switching UI using authored engine CSS and bounded
 * runtime layout values backed by --ds-* design tokens. Supports three
 * display variants: radio-style toggle (default), pill buttons, and
 * a custom dropdown. Includes a colored banner for non-production
 * environments and a production-safety confirmation modal.
 *
 * @example
 * <RusticEnvironmentToggle
 *   environments={[{ id: 'dev', name: 'Development', color: '#3b82f6' }]}
 *   activeEnvironment="dev"
 *   onChange={(envId) => setEnv(envId)}
 * />
 */

import React, { useState, useRef, useEffect, useCallback, type CSSProperties } from 'react';
import type { EnvironmentToggleProps, EnvironmentDef } from '../EnvironmentToggle.types';

/** Base banner style -- centered flex row for the environment warning strip */
const bannerBaseStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '6px 16px',
  fontSize: 'var(--ds-font-size-xs, 12px)',
  fontWeight: 500,
};

/** Colored indicator dot -- optionally animated with a CSS pulse keyframe.
 *  The color rides the --ds-envtoggle-accent hatch; the skin paints it. */
const dotStyle = (color: string, animate?: boolean): CSSProperties => ({
  '--ds-envtoggle-accent': color,
  width: 8,
  height: 8,
  display: 'inline-block',
  flexShrink: 0,
  animation: animate ? 'ds-pulse 2s infinite' : undefined,
} as CSSProperties);

/** Container for the default (radio-group style) toggle variant */
const toggleContainerStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  overflow: 'hidden',
};

const pillContainerStyle: CSSProperties = {
  display: 'flex',
  gap: 4,
  alignItems: 'center',
};

/** Absolute-positioned dropdown menu -- appears below the trigger button */
const dropdownStyle: CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  marginTop: 4,
  zIndex: 50,
  minWidth: 180,
  padding: '4px 0',
};

/** Full-screen overlay backdrop for the production confirmation modal */
const modalOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

/** Modal dialog box -- centered with elevated background and shadow */
const modalBoxStyle: CSSProperties = {
  padding: 24,
  maxWidth: 380,
  width: '90%',
};

/** Toggle button style -- active state uses the environment color as background
 *  (the color rides the --ds-envtoggle-accent hatch; the skin paints it). */
const btnStyle = (active: boolean, color: string): CSSProperties => ({
  '--ds-envtoggle-accent': color,
  padding: '4px 12px',
  fontSize: 'var(--ds-font-size-sm, 14px)',
  fontWeight: active ? 600 : 400,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  transition: 'all 0.15s',
} as CSSProperties);

/** Pill button style -- similar to toggle but with individual border radius per button */
const pillBtnStyle = (active: boolean, color: string): CSSProperties => ({
  '--ds-envtoggle-accent': color,
  padding: '4px 12px',
  fontSize: 'var(--ds-font-size-sm, 14px)',
  fontWeight: active ? 600 : 400,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  transition: 'all 0.15s',
} as CSSProperties);

/**
 * Rustic (Vanilla CSS) implementation of the EnvironmentToggle pattern.
 * Styling combines authored engine CSS with bounded runtime layout values.
 * Manages its own dropdown open/close and click-outside detection.
 *
 * @param props - See {@link EnvironmentToggleProps} for the full prop contract.
 * @returns The rendered environment toggle with optional banner and modal.
 */
export default function RusticEnvironmentToggle(props: EnvironmentToggleProps) {
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
  /* Tracks pending production confirmation (null = no pending switch) */
  const [confirmEnv, setConfirmEnv] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeEnv = environments.find(e => e.id === activeEnvironment);
  /* Controls whether the non-production warning banner is visible */
  const isProduction = activeEnvironment === productionId;

  /** Closes the dropdown when user clicks outside the container element */
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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
   * If the target is production and confirmation is configured, opens a modal.
   */
  const handleSwitch = useCallback(
    (envId: string) => {
      if (envId === activeEnvironment) return;
      if (envId === productionId && confirmProductionSwitch) {
        setConfirmEnv(envId);
      } else {
        onChange(envId);
        setDropdownOpen(false);
      }
    },
    [activeEnvironment, productionId, confirmProductionSwitch, onChange],
  );

  /** Renders a small uppercase badge label for environments that have one */
  const renderBadge = (env: EnvironmentDef) => {
    if (!env.badge) return null;
    return (
      <span data-part="badge" style={{
        fontSize: 9,
        fontWeight: 600,
        padding: '1px 5px',
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
      }}>
        {env.badge}
      </span>
    );
  };

  /** Renders the appropriate toggle control based on the variant prop */
  const renderToggle = () => {
    /* Dropdown variant: positioned absolutely below the trigger button */
    if (variant === 'dropdown') {
      return (
        <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }} data-part="toggle" data-variant="dropdown">
          <button
            data-part="trigger"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 'var(--ds-font-size-sm, 14px)',
            }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            data-testid="env-toggle-trigger"
          >
            <span data-part="dot" style={dotStyle(activeEnv?.color ?? 'var(--ds-color-border-secondary, var(--ds-color-border-primary))')} />
            {activeEnv?.name ?? 'Select'}
            {activeEnv?.badge && (
              <span data-part="badge" style={{
                fontSize: 9,
                fontWeight: 600,
                padding: '1px 5px',
                '--ds-envtoggle-accent': activeEnv.color,
              } as CSSProperties}>
                {activeEnv.badge}
              </span>
            )}
            <span style={{ fontSize: 10, opacity: 0.5 }}>{'\u25BC'}</span>
          </button>

          {dropdownOpen && (
            <div style={dropdownStyle} data-part="panel">
              {environments.map(env => (
                <button
                  key={env.id}
                  data-part="option"
                  data-active={env.id === activeEnvironment}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    width: '100%',
                    cursor: 'pointer',
                    fontSize: 'var(--ds-font-size-sm, 14px)',
                    fontWeight: env.id === activeEnvironment ? 600 : 400,
                    textAlign: 'left',
                  }}
                  onClick={() => handleSwitch(env.id)}
                  data-testid={`env-option-${env.id}`}
                >
                  <span data-part="dot" style={dotStyle(env.color)} />
                  <span style={{ flex: 1 }}>{env.name}</span>
                  {env.badge && (
                    <span data-part="badge" style={{
                      fontSize: 9,
                      fontWeight: 600,
                      padding: '1px 5px',
                      '--ds-envtoggle-accent': env.color,
                    } as CSSProperties}>
                      {env.badge}
                    </span>
                  )}
                  {env.id === activeEnvironment && (
                    <span data-part="check" style={{ fontSize: 12 }}>{'\u2713'}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    /* Pills variant: individually rounded buttons with active color highlight */
    if (variant === 'pills') {
      return (
        <div style={pillContainerStyle} data-part="toggle" data-variant="pills" data-testid="env-toggle-trigger">
          {environments.map(env => (
            <button
              key={env.id}
              data-part="option"
              data-active={env.id === activeEnvironment}
              style={pillBtnStyle(env.id === activeEnvironment, env.color)}
              onClick={() => handleSwitch(env.id)}
              data-testid={`env-option-${env.id}`}
            >
              {env.icon}
              {env.name}
              {env.id === activeEnvironment && renderBadge(env)}
            </button>
          ))}
        </div>
      );
    }

    /* Default: radio-style toggle -- buttons share the container's border radius via overflow:hidden */
    return (
      <div style={toggleContainerStyle} data-part="toggle" data-variant="toggle" data-testid="env-toggle-trigger">
        {environments.map(env => (
          <button
            key={env.id}
            data-part="option"
            data-active={env.id === activeEnvironment}
            style={btnStyle(env.id === activeEnvironment, env.color)}
            onClick={() => handleSwitch(env.id)}
            data-testid={`env-option-${env.id}`}
          >
            {env.icon}
            {env.name}
            {env.id === activeEnvironment && renderBadge(env)}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={`ds-pattern-environment-toggle ds-engine-rustic ${className ?? ''}`} data-part="root" style={style}>
      {/* Banner */}
      {showBanner && !isProduction && activeEnv && (
        <div
          data-part="banner"
          style={{
            ...bannerBaseStyle,
            '--ds-envtoggle-accent': activeEnv.color,
            '--ds-envtoggle-accent-soft': activeEnv.color + '15',
          } as CSSProperties}
          data-testid="env-banner"
        >
          <span data-part="banner-dot" style={dotStyle(activeEnv.color, true)} />
          {bannerMessage ?? `You are viewing the ${activeEnv.name} environment`}
        </div>
      )}

      {/* Toggle control */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {renderToggle()}
      </div>

      {/* Production confirmation modal -- overlay click dismisses, inner box stops propagation */}
      {confirmEnv && (
        <div style={modalOverlayStyle} data-part="confirm-overlay" onClick={() => setConfirmEnv(null)}>
          {/* stopPropagation prevents the overlay's dismiss handler from catching inner clicks */}
          <div style={modalBoxStyle} data-part="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 'var(--ds-font-size-lg, 16px)', fontWeight: 700, marginBottom: 12 }}>
              Switch to Production
            </div>
            <div data-part="confirm-message" style={{
              fontSize: 'var(--ds-font-size-sm, 14px)',
              marginBottom: 20,
              lineHeight: 1.5,
            }}>
              {confirmProductionSwitch}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                data-part="confirm-cancel"
                style={{
                  padding: '6px 14px',
                  cursor: 'pointer',
                  fontSize: 'var(--ds-font-size-sm, 14px)',
                }}
                onClick={() => setConfirmEnv(null)}
              >
                Cancel
              </button>
              <button
                data-part="confirm-submit"
                style={{
                  padding: '6px 14px',
                  cursor: 'pointer',
                  fontSize: 'var(--ds-font-size-sm, 14px)',
                  fontWeight: 500,
                }}
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
        </div>
      )}
    </div>
  );
}
