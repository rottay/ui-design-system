'use client';

/**
 * @fileoverview Modern (DaisyUI / Tailwind) engine for the DetailPanel pattern.
 * Renders an entity detail view inside a DaisyUI card with a header (avatar, title,
 * status badge, action buttons), tab navigation (DaisyUI bordered tabs), an optional
 * sidebar, breadcrumbs, and a footer. Supports controlled and uncontrolled tab state.
 *
 * @example
 * <ModernDetailPanel
 *   data={project}
 *   title="Project Alpha"
 *   subtitle="Q1 2026 Roadmap"
 *   status={{ label: 'In Progress', color: '#3b82f6' }}
 *   tabs={[
 *     { key: 'tasks', label: 'Tasks', content: <TaskList />, badge: 5 },
 *     { key: 'files', label: 'Files', content: <FileList /> },
 *   ]}
 *   sidebar={<ProjectMeta />}
 *   sidebarPosition="right"
 *   onBack={() => router.back()}
 * />
 */

import React, { useState } from 'react';
import type { DetailPanelProps, DetailAction } from '../DetailPanel.types';

/**
 * Maps a DetailAction variant to the corresponding DaisyUI btn class.
 * Isolated as a small component to keep the main render body readable.
 */
function ActionButton({ action }: { action: DetailAction }) {
  const variantClasses: Record<string, string> = {
    default: 'btn-outline',
    primary: 'btn-primary',
    danger: 'btn-error',
    ghost: 'btn-ghost',
  };
  return (
    <button
      className={`btn btn-sm ${variantClasses[action.variant ?? 'default']} ${action.loading ? 'loading' : ''}`}
      disabled={action.disabled || action.loading}
      onClick={action.onClick}
    >
      {action.icon && <span className="mr-1">{action.icon}</span>}
      {action.label}
    </button>
  );
}

/**
 * Modern (DaisyUI) DetailPanel engine.
 *
 * Tab state can be controlled (activeTab + onTabChange) or uncontrolled (defaults
 * to the first tab). The sidebar is positioned via flex-direction reversal to
 * avoid duplicating DOM. Responsive grid columns on the sidebar keep the layout
 * readable on smaller screens.
 *
 * @typeParam T - Shape of the entity data object being displayed.
 * @param props - {@link DetailPanelProps} -- data, header info, tabs, sidebar, and actions.
 * @returns The detail view wrapped in a DaisyUI card.
 */
export default function ModernDetailPanel<T>(props: DetailPanelProps<T>) {
  const {
    data,
    title,
    subtitle,
    avatar,
    status,
    tabs,
    activeTab: controlledActiveTab,
    onTabChange,
    actions,
    sidebar,
    sidebarPosition = 'right',
    sidebarWidth = 300,
    onBack,
    headerExtra,
    footer,
    breadcrumbs,
    loading,
    className,
    style,
  } = props;

  // Uncontrolled tab state: falls back to the first tab key when the consumer
  // does not provide controlledActiveTab.
  const [internalActiveTab, setInternalActiveTab] = useState<string>(tabs?.[0]?.key ?? '');
  const activeTab = controlledActiveTab ?? internalActiveTab;

  // Only update internal state when uncontrolled. Always fire onTabChange
  // so controlled consumers can sync their own state.
  const handleTabChange = (key: string) => {
    if (!controlledActiveTab) setInternalActiveTab(key);
    onTabChange?.(key);
  };

  // Skeleton loading: mimics the header + tab layout with animated pulse blocks.
  if (loading) {
    return (
      <div className={`card bg-base-100 shadow-sm ${className ?? ''}`} style={style}>
        <div className="card-body">
          <div className="flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-base-300" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-base-300 rounded w-1/3" />
              <div className="h-3 bg-base-300 rounded w-1/4" />
            </div>
          </div>
          <div className="mt-6 space-y-3 animate-pulse">
            <div className="h-8 bg-base-300 rounded w-full" />
            <div className="h-32 bg-base-300 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Resolve the active tab object so we can render its content below the tab bar.
  const activeTabObj = tabs?.find((t) => t.key === activeTab);

  return (
    <div className={`card bg-base-100 shadow-sm ${className ?? ''}`} style={style}>
      <div className="card-body">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="text-sm breadcrumbs mb-2 p-0">
            <ul>
              {breadcrumbs.map((b, i) => (
                <li key={i}>
                  {b.href ? (
                    <a href={b.href} onClick={b.onClick}>{b.label}</a>
                  ) : (
                    <span className={b.onClick ? 'cursor-pointer' : ''} onClick={b.onClick}>
                      {b.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {onBack && (
              <button className="btn btn-ghost btn-sm btn-square" onClick={onBack}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            {avatar && <div className="flex-shrink-0">{avatar}</div>}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-semibold truncate">{title}</h2>
                {status && (
                  <div className={`badge ${status.color ? '' : 'badge-neutral'}`} style={status.color ? { backgroundColor: status.color, color: 'var(--ds-color-text-on-primary)' } : undefined}>
                    {status.label}
                  </div>
                )}
              </div>
              {subtitle && <p className="text-sm text-base-content/60 mt-1">{subtitle}</p>}
            </div>
          </div>
          {(actions || headerExtra) && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {headerExtra}
              {actions?.map((a) => <ActionButton key={a.key} action={a} />)}
            </div>
          )}
        </div>

        {/* Body with optional sidebar. flex-direction is reversed when sidebarPosition
            is 'left' so the sidebar DOM stays after main content (better for a11y reading
            order) while visually appearing on the left. */}
        <div className="mt-4 flex gap-4" style={{ flexDirection: sidebarPosition === 'left' ? 'row-reverse' : 'row' }}>
          {/* Main content -- minWidth:0 prevents long tab content from overflowing. */}
          <div className="flex-1 min-w-0" style={sidebarPosition === 'left' ? undefined : undefined}>
            {tabs && tabs.length > 0 && (
              <>
                <div className="tabs tabs-bordered mb-4">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      className={`tab ${activeTab === tab.key ? 'tab-active' : ''} ${tab.disabled ? 'tab-disabled' : ''}`}
                      onClick={() => !tab.disabled && handleTabChange(tab.key)}
                    >
                      {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
                      {tab.label}
                      {tab.badge != null && (
                        <span className="badge badge-sm ml-1.5">{tab.badge}</span>
                      )}
                    </button>
                  ))}
                </div>
                <div>{activeTabObj?.content}</div>
              </>
            )}
          </div>

          {/* Sidebar -- uses order:1 when position is 'left' as a fallback in case
              flex-direction reversal is overridden by a parent container. */}
          {sidebar && (
            <div className="flex-shrink-0" style={{ width: sidebarWidth, order: sidebarPosition === 'left' ? 1 : undefined }}>
              <div className="card bg-base-200/50 p-4 rounded-lg">{sidebar}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        {footer && (
          <div className="mt-4 pt-4 border-t border-base-300">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
