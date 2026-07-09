'use client';

/**
 * @fileoverview EnvironmentToggle -- Rustic engine (Vanilla / CSS variables).
 * Provides an environment switching UI using only inline styles with
 * --ds-* design tokens. No CSS framework dependency. Supports three
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

/** Colored indicator dot -- optionally animated with a CSS pulse keyframe */
const dotStyle = (color: string, animate?: boolean): CSSProperties => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: color,
  display: 'inline-block',
  flexShrink: 0,
  animation: animate ? 'ds-pulse 2s infinite' : undefined,
});

/** Container for the default (radio-group style) toggle variant */
const toggleContainerStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 'var(--ds-radius-md, 8px)',
  border: '1px solid var(--ds-color-border-primary, var(--ds-color-neutral-200))',
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
  background: 'var(--ds-color-bg-elevated, var(--ds-color-bg-primary))',
  border: '1px solid var(--ds-color-border-primary, var(--ds-color-neutral-200))',
  borderRadius: 'var(--ds-radius-md, 8px)',
  boxShadow: 'var(--ds-shadow-lg)',
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
  background: 'var(--ds-color-alpha-black-40)',
};

/** Modal dialog box -- centered with elevated background and shadow */
const modalBoxStyle: CSSProperties = {
  background: 'var(--ds-color-bg-elevated, var(--ds-color-bg-primary))',
  borderRadius: 'var(--ds-radius-lg, 12px)',
  padding: 24,
  maxWidth: 380,
  width: '90%',
  boxShadow: 'var(--ds-shadow-2xl)',
};

/** Toggle button style -- active state uses the environment color as background */
const btnStyle = (active: boolean, color: string): CSSProperties => ({
  padding: '4px 12px',
  fontSize: 'var(--ds-font-size-sm, 14px)',
  fontWeight: active ? 600 : 400,
  background: active ? color : 'transparent',
  color: active ? 'var(--ds-color-text-on-primary, var(--ds-color-text-inverse))' : 'var(--ds-color-text-primary, var(--ds-color-text))',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  transition: 'all 0.15s',
});

/** Pill button style -- similar to toggle but with individual border radius per button */
const pillBtnStyle = (active: boolean, color: string): CSSProperties => ({
  padding: '4px 12px',
  fontSize: 'var(--ds-font-size-sm, 14px)',
  fontWeight: active ? 600 : 400,
  background: active ? color : 'transparent',
  color: active ? 'var(--ds-color-text-on-primary, var(--ds-color-text-inverse))' : 'var(--ds-color-text-primary, var(--ds-color-text))',
  border: active ? 'none' : '1px solid var(--ds-color-border-primary, var(--ds-color-neutral-200))',
  borderRadius: 'var(--ds-radius-md, 8px)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  transition: 'all 0.15s',
});

/**
 * Rustic (Vanilla CSS) implementation of the EnvironmentToggle pattern.
 * All styling uses inline CSSProperties with --ds-* token fallbacks.
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
      <span style={{
        fontSize: 9,
        fontWeight: 600,
        padding: '1px 5px',
        borderRadius: 'var(--ds-radius-sm, 6px)',
        background: 'var(--ds-color-alpha-white-20)',
        color: 'var(--ds-color-text-on-primary, var(--ds-color-text-inverse))',
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
        <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              background: 'none',
              border: '1px solid var(--ds-color-border-primary, var(--ds-color-neutral-200))',
              borderRadius: 'var(--ds-radius-md, 8px)',
              cursor: 'pointer',
              fontSize: 'var(--ds-font-size-sm, 14px)',
              color: 'var(--ds-color-text-primary, var(--ds-color-text))',
            }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            data-testid="env-toggle-trigger"
          >
            <span style={dotStyle(activeEnv?.color ?? 'var(--ds-color-border-secondary, var(--ds-color-border-primary))')} />
            {activeEnv?.name ?? 'Select'}
            {activeEnv?.badge && (
              <span style={{
                fontSize: 9,
                fontWeight: 600,
                padding: '1px 5px',
                borderRadius: 3,
                background: activeEnv.color,
                color: 'var(--ds-color-text-on-primary, var(--ds-color-text-inverse))',
              }}>
                {activeEnv.badge}
              </span>
            )}
            <span style={{ fontSize: 10, opacity: 0.5 }}>{'\u25BC'}</span>
          </button>

          {dropdownOpen && (
            <div style={dropdownStyle}>
              {environments.map(env => (
                <button
                  key={env.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    width: '100%',
                    background: env.id === activeEnvironment ? 'var(--ds-color-bg-muted, var(--ds-color-neutral-100))' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 'var(--ds-font-size-sm, 14px)',
                    fontWeight: env.id === activeEnvironment ? 600 : 400,
                    color: 'var(--ds-color-text-primary, var(--ds-color-text))',
                    textAlign: 'left',
                  }}
                  onClick={() => handleSwitch(env.id)}
                  data-testid={`env-option-${env.id}`}
                >
                  <span style={dotStyle(env.color)} />
                  <span style={{ flex: 1 }}>{env.name}</span>
                  {env.badge && (
                    <span style={{
                      fontSize: 9,
                      fontWeight: 600,
                      padding: '1px 5px',
                      borderRadius: 3,
                      background: env.color,
                      color: 'var(--ds-color-text-on-primary, var(--ds-color-text-inverse))',
                    }}>
                      {env.badge}
                    </span>
                  )}
                  {env.id === activeEnvironment && (
                    <span style={{ color: 'var(--ds-color-primary)', fontSize: 12 }}>{'\u2713'}</span>
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
        <div style={pillContainerStyle} data-testid="env-toggle-trigger">
          {environments.map(env => (
            <button
              key={env.id}
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
      <div style={toggleContainerStyle} data-testid="env-toggle-trigger">
        {environments.map(env => (
          <button
            key={env.id}
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
    <div className={className} style={style}>
      {/* Banner */}
      {showBanner && !isProduction && activeEnv && (
        <div
          style={{
            ...bannerBaseStyle,
            background: activeEnv.color + '15',
            borderBottom: `2px solid ${activeEnv.color}`,
            color: activeEnv.color,
          }}
          data-testid="env-banner"
        >
          <span style={dotStyle(activeEnv.color, true)} />
          {bannerMessage ?? `You are viewing the ${activeEnv.name} environment`}
        </div>
      )}

      {/* Toggle control */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {renderToggle()}
      </div>

      {/* Production confirmation modal -- overlay click dismisses, inner box stops propagation */}
      {confirmEnv && (
        <div style={modalOverlayStyle} onClick={() => setConfirmEnv(null)}>
          {/* stopPropagation prevents the overlay's dismiss handler from catching inner clicks */}
          <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 'var(--ds-font-size-lg, 16px)', fontWeight: 700, marginBottom: 12 }}>
              Switch to Production
            </div>
            <div style={{
              fontSize: 'var(--ds-font-size-sm, 14px)',
              color: 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))',
              marginBottom: 20,
              lineHeight: 1.5,
            }}>
              {confirmProductionSwitch}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                style={{
                  padding: '6px 14px',
                  background: 'none',
                  border: '1px solid var(--ds-color-border-secondary, var(--ds-color-border-primary))',
                  borderRadius: 'var(--ds-radius-md, 8px)',
                  cursor: 'pointer',
                  fontSize: 'var(--ds-font-size-sm, 14px)',
                  color: 'var(--ds-color-text-primary, var(--ds-color-text))',
                }}
                onClick={() => setConfirmEnv(null)}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: '6px 14px',
                  background: 'var(--ds-color-error)',
                  border: 'none',
                  borderRadius: 'var(--ds-radius-md, 8px)',
                  cursor: 'pointer',
                  fontSize: 'var(--ds-font-size-sm, 14px)',
                  color: 'var(--ds-color-text-on-primary, var(--ds-color-text-inverse))',
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
