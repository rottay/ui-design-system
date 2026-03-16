'use client';

/**
 * @fileoverview PageShell -- Modern engine (DaisyUI / Tailwind).
 * Standard page layout shell with DaisyUI breadcrumbs, inline SVG
 * back-arrow button, title/subtitle header with optional badge and
 * actions, and DaisyUI bordered tabs for content switching.
 * Uses Tailwind utility classes for spacing and responsive layout.
 *
 * @example
 * <ModernPageShell
 *   title="Users"
 *   subtitle="Manage platform users"
 *   breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Users' }]}
 *   actions={<button className="btn btn-primary btn-sm">Add User</button>}
 * >
 *   <UserTable />
 * </ModernPageShell>
 */

import React from 'react';
import type { PageShellProps } from '../PageShell.types';

/**
 * Modern (DaisyUI/Tailwind) implementation of the PageShell pattern.
 * Uses DaisyUI's breadcrumbs and tabs-bordered components for
 * navigation chrome, with a flex header for title + actions.
 *
 * @param props - See {@link PageShellProps} for the full prop contract.
 * @returns The rendered page shell layout.
 */
export default function ModernPageShell(props: PageShellProps) {
  const {
    title,
    subtitle,
    breadcrumbs,
    actions,
    tabs,
    activeTab,
    onTabChange,
    children,
    back,
    badge,
    maxWidth,
    loading,
    className,
    style,
  } = props;

  /* Short-circuit: DaisyUI spinner shown while data is loading */
  if (loading) {
    return (
      <div className={`flex justify-center items-center py-12 ${className ?? ''}`} style={style}>
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  /* Default to the first tab when no activeTab is explicitly set */
  const activeTabKey = activeTab ?? tabs?.[0]?.key;

  return (
    <div
      className={`ds-pattern-page-shell ds-engine-modern ${className ?? ''}`}
      style={{ maxWidth: maxWidth ?? undefined, margin: maxWidth ? '0 auto' : undefined, ...style }}
    >
      {/* DaisyUI breadcrumbs -- supports href links and onClick handlers.
           When onClick is present alongside href, preventDefault avoids double navigation. */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="breadcrumbs text-sm mb-4">
          <ul>
            {breadcrumbs.map((bc, i) => (
              <li key={i}>
                {bc.href || bc.onClick ? (
                  <a
                    href={bc.href ?? '#'}
                    onClick={bc.onClick ? (e) => { e.preventDefault(); bc.onClick!(); } : undefined}
                  >
                    {bc.label}
                  </a>
                ) : (
                  bc.label
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Header row: title group on left, action buttons on right */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Back button with inline SVG arrow -- ghost variant keeps it unobtrusive */}
          {back && (
            <button className="btn btn-ghost btn-sm" onClick={back.onClick}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              {back.label}
            </button>
          )}
          <div>
            {/* Badge renders inline next to title (typically a status indicator) */}
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{title}</h1>
              {badge}
            </div>
            {subtitle && <p className="text-sm opacity-60 mt-1">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* DaisyUI bordered tabs -- renders active tab content below the tab bar */}
      {tabs && tabs.length > 0 && (
        <div>
          <div role="tablist" className="tabs tabs-bordered mb-6">
            {tabs.map((tab) => (
              <a
                key={tab.key}
                role="tab"
                className={`tab ${activeTabKey === tab.key ? 'tab-active' : ''}`}
                onClick={() => onTabChange?.(tab.key)}
              >
                {tab.label}
              </a>
            ))}
          </div>
          {/* Only the content of the active tab is rendered */}
          {tabs.find((t) => t.key === activeTabKey)?.content}
        </div>
      )}

      {/* Children render only when no tabs are present */}
      {(!tabs || tabs.length === 0) && children}
    </div>
  );
}
