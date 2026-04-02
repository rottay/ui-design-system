'use client';

/**
 * @fileoverview Modern (DaisyUI / Tailwind) engine for the WorkbenchHeader pattern.
 *
 * Renders a role-home / manager cockpit header inside a DaisyUI card with:
 * - Role greeting title and subtitle
 * - Exception/alert count badge (error indicator)
 * - Saved views tab strip for quick workspace switching
 * - Quick action buttons (primary, default, danger variants)
 * - Optional collapsible briefing panel for at-a-glance summaries
 *
 * Uses `--ds-*` CSS custom properties for colors and `--ds-duration-*` /
 * `--ds-ease-*` tokens for transitions to stay theme-consistent across
 * multi-tenant deployments.
 *
 * @example
 * ```tsx
 * <PatternWorkbenchHeader
 *   engine="modern"
 *   title="Good morning, Alex"
 *   subtitle="3 items need your attention today"
 *   exceptionCount={3}
 *   savedViews={[
 *     { id: 'overview', label: 'Overview' },
 *     { id: 'alerts', label: 'Alerts' },
 *   ]}
 *   activeViewId="overview"
 *   onViewChange={(id) => setView(id)}
 *   quickActions={[
 *     { label: 'New Event', onClick: handleCreate, icon: <PlusIcon />, variant: 'primary' },
 *     { label: 'Export', onClick: handleExport },
 *   ]}
 * />
 * ```
 *
 * @module Patterns/WorkbenchHeader/Engines/Modern
 * @category Patterns
 * @package @rottay/design-system
 */

import React from 'react';
import type { WorkbenchHeaderProps, WorkbenchQuickAction } from '../WorkbenchHeader.types';

/**
 * Maps a WorkbenchQuickAction variant to the corresponding DaisyUI button class.
 */
const variantClass: Record<string, string> = {
  primary: 'btn-primary',
  danger: 'btn-error',
  default: 'btn-ghost',
};

/**
 * Renders a single quick action button with the correct DaisyUI variant,
 * optional leading icon, and disabled state handling.
 */
function QuickActionButton({ action }: { action: WorkbenchQuickAction }) {
  return (
    <button
      className={`btn btn-sm ${variantClass[action.variant ?? 'default']} transition-all`}
      style={{
        transitionDuration: 'var(--ds-duration-normal, 200ms)',
        transitionTimingFunction: 'var(--ds-ease-out, cubic-bezier(0.33, 1, 0.68, 1))',
      }}
      disabled={action.disabled}
      onClick={action.onClick}
    >
      {action.icon && <span className="inline-flex">{action.icon}</span>}
      {action.label}
    </button>
  );
}

/**
 * Modern (DaisyUI / Tailwind) engine for the WorkbenchHeader pattern.
 *
 * Renders a card-based role-home header designed for manager cockpit pages.
 * Exception count is presented as a DaisyUI badge next to the title, saved
 * views appear as a bordered tab strip, and quick actions are laid out as
 * a button group on the right side of the header row.
 *
 * @param props - {@link WorkbenchHeaderProps}
 * @returns The rendered workbench header card.
 */
export default function ModernWorkbenchHeader(props: WorkbenchHeaderProps) {
  const {
    title,
    subtitle,
    exceptionCount,
    quickActions,
    savedViews,
    activeViewId,
    onViewChange,
    loading,
    className,
    style,
  } = props;

  /* ------------------------------------------------------------------ */
  /* Loading skeleton                                                    */
  /* ------------------------------------------------------------------ */
  if (loading) {
    return (
      <div
        className={`card bg-base-100 shadow-sm ${className ?? ''}`}
        style={style}
      >
        <div className="card-body p-6">
          <div className="flex items-center justify-between animate-pulse">
            <div className="space-y-2">
              <div
                className="rounded"
                style={{
                  width: 220,
                  height: 24,
                  background: 'var(--ds-color-bg-secondary, oklch(var(--b3)))',
                }}
              />
              <div
                className="rounded"
                style={{
                  width: 320,
                  height: 14,
                  background: 'var(--ds-color-bg-secondary, oklch(var(--b3)))',
                }}
              />
            </div>
            <div className="flex gap-2">
              <div
                className="rounded"
                style={{
                  width: 80,
                  height: 32,
                  background: 'var(--ds-color-bg-secondary, oklch(var(--b3)))',
                }}
              />
              <div
                className="rounded"
                style={{
                  width: 80,
                  height: 32,
                  background: 'var(--ds-color-bg-secondary, oklch(var(--b3)))',
                }}
              />
            </div>
          </div>
          <div
            className="mt-4 rounded animate-pulse"
            style={{
              width: '100%',
              height: 36,
              background: 'var(--ds-color-bg-secondary, oklch(var(--b3)))',
            }}
          />
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Main render                                                         */
  /* ------------------------------------------------------------------ */
  return (
    <div
      className={`card bg-base-100 shadow-sm ds-pattern-workbench-header ds-engine-modern ${className ?? ''}`}
      style={{
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'var(--ds-color-border, oklch(var(--b3)))',
        ...style,
      }}
    >
      <div className="card-body p-6">
        {/* ---- Header row: title + badge | quick actions ---- */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          {/* Left: title group */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h2
                className="text-2xl font-bold truncate"
                style={{ color: 'var(--ds-color-text-primary)' }}
              >
                {title}
              </h2>

              {/* Exception count badge */}
              {exceptionCount != null && exceptionCount > 0 && (
                <span
                  className="badge badge-error badge-sm font-semibold gap-1 transition-transform"
                  style={{
                    transitionDuration: 'var(--ds-duration-fast, 150ms)',
                    transitionTimingFunction: 'var(--ds-ease-out, cubic-bezier(0.33, 1, 0.68, 1))',
                    backgroundColor: 'var(--ds-color-error)',
                    color: 'var(--ds-color-text-on-error, #fff)',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {exceptionCount}
                </span>
              )}
            </div>

            {/* Subtitle */}
            {subtitle && (
              <p
                className="text-sm mt-1"
                style={{ color: 'var(--ds-color-text-muted)' }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Right: quick action buttons */}
          {quickActions && quickActions.length > 0 && (
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              {quickActions.map((action, idx) => (
                <QuickActionButton key={`qa-${idx}`} action={action} />
              ))}
            </div>
          )}
        </div>

        {/* ---- Saved views tab strip ---- */}
        {savedViews && savedViews.length > 0 && onViewChange && (
          <div
            className="mt-4 -mb-2"
            role="tablist"
            aria-label="Saved views"
          >
            <div className="tabs tabs-bordered">
              {savedViews.map((view) => {
                const isActive = view.id === activeViewId;
                return (
                  <button
                    key={view.id}
                    role="tab"
                    aria-selected={isActive}
                    className={`tab transition-colors ${isActive ? 'tab-active' : ''}`}
                    style={{
                      transitionDuration: 'var(--ds-duration-fast, 150ms)',
                      transitionTimingFunction: 'var(--ds-ease-out, cubic-bezier(0.33, 1, 0.68, 1))',
                      ...(isActive
                        ? { color: 'var(--ds-color-primary)', borderColor: 'var(--ds-color-primary)' }
                        : { color: 'var(--ds-color-text-muted)' }),
                    }}
                    onClick={() => onViewChange(view.id)}
                  >
                    {view.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
