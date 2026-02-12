'use client';

/**
 * PageShell - Modern Engine (Tailwind/DaisyUI)
 */

import React from 'react';
import type { PageShellProps } from '../../types';

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

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-12 ${className ?? ''}`} style={style}>
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  const activeTabKey = activeTab ?? tabs?.[0]?.key;

  return (
    <div
      className={`ds-pattern-page-shell ds-engine-modern ${className ?? ''}`}
      style={{ maxWidth: maxWidth ?? undefined, margin: maxWidth ? '0 auto' : undefined, ...style }}
    >
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

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          {back && (
            <button className="btn btn-ghost btn-sm" onClick={back.onClick}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              {back.label}
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{title}</h1>
              {badge}
            </div>
            {subtitle && <p className="text-sm opacity-60 mt-1">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

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
          {tabs.find((t) => t.key === activeTabKey)?.content}
        </div>
      )}

      {(!tabs || tabs.length === 0) && children}
    </div>
  );
}
