'use client';

/**
 * DetailPanel - Modern Engine (DaisyUI/Tailwind)
 */

import React, { useState } from 'react';
import type { DetailPanelProps, DetailAction } from '../../types';

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

  const [internalActiveTab, setInternalActiveTab] = useState<string>(tabs?.[0]?.key ?? '');
  const activeTab = controlledActiveTab ?? internalActiveTab;

  const handleTabChange = (key: string) => {
    if (!controlledActiveTab) setInternalActiveTab(key);
    onTabChange?.(key);
  };

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
                  <div className={`badge ${status.color ? '' : 'badge-neutral'}`} style={status.color ? { backgroundColor: status.color, color: '#fff' } : undefined}>
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

        {/* Body with optional sidebar */}
        <div className="mt-4 flex gap-4" style={{ flexDirection: sidebarPosition === 'left' ? 'row-reverse' : 'row' }}>
          {/* Main content */}
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

          {/* Sidebar */}
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
