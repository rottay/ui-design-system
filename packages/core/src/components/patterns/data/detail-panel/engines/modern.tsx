'use client';

/**
 * @fileoverview Modern engine for the DetailPanel pattern.
 *
 * Premium entity detail view with:
 * - Breadcrumbs: clean, small, muted with "/" separators
 * - Header: back button + avatar + title + status badge + action buttons
 * - Tab navigation: token-driven bordered tabs with badge support
 * - Tab content area: clean rendering with proper padding
 * - Sidebar: clean panel with `var(--ds-surface-panel)` background
 * - Loading skeleton: premium pulse animation with proper shapes
 * - Footer: subtle top border separator
 *
 * All visuals use `--ds-*` CSS custom properties. Zero DaisyUI dependency.
 * Supports controlled and uncontrolled tab state.
 *
 * @module Patterns/DetailPanel/Engines/Modern
 * @category Patterns
 * @package @rottay/design-system
 */

import React, { useState } from 'react';
import type { DetailPanelProps, DetailAction } from '../DetailPanel.types';

/* ------------------------------------------------------------------ */
/* Shared style constants                                              */
/* ------------------------------------------------------------------ */

const TRANSITION_FAST =
  'var(--ds-motion-fast) var(--ds-motion-ease-out)';

const PULSE_STYLE: React.CSSProperties = {
  animation: 'pulse 1.5s ease-in-out infinite',
};

/* ------------------------------------------------------------------ */
/* SkeletonBlock                                                       */
/* ------------------------------------------------------------------ */

function SkeletonBlock(props: {
  width: number | string;
  height: number;
  part:
    | 'skeleton-action'
    | 'skeleton-avatar'
    | 'skeleton-badge'
    | 'skeleton-breadcrumb'
    | 'skeleton-content'
    | 'skeleton-sidebar'
    | 'skeleton-subtitle'
    | 'skeleton-tab'
    | 'skeleton-title';
  style?: React.CSSProperties;
}) {
  return (
    <div
      data-part={
        props.part === 'skeleton-action'
          ? 'skeleton-action'
          : props.part === 'skeleton-avatar'
            ? 'skeleton-avatar'
            : props.part === 'skeleton-badge'
              ? 'skeleton-badge'
              : props.part === 'skeleton-breadcrumb'
                ? 'skeleton-breadcrumb'
                : props.part === 'skeleton-content'
                  ? 'skeleton-content'
                  : props.part === 'skeleton-sidebar'
                    ? 'skeleton-sidebar'
                    : props.part === 'skeleton-subtitle'
                      ? 'skeleton-subtitle'
                      : props.part === 'skeleton-tab'
                        ? 'skeleton-tab'
                        : 'skeleton-title'
      }
      style={{
        width: props.width,
        height: props.height,
        ...PULSE_STYLE,
        ...props.style,
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* ActionButton                                                        */
/* ------------------------------------------------------------------ */

/**
 * Renders a single action button with token-driven variant styling.
 * Supports primary, danger, ghost, and default variants with hover states.
 */
function ActionButton({ action }: { action: DetailAction }) {
  const variant = action.variant ?? 'default';

  return (
    <button
      type="button"
      data-part="action-button"
      data-variant={variant}
      data-loading={action.loading ? 'true' : 'false'}
      disabled={action.disabled || action.loading}
      onClick={action.onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 14px',
        fontSize: 13,
        fontWeight: 500,
        lineHeight: 1.4,
        cursor: action.disabled || action.loading ? 'not-allowed' : 'pointer',
        opacity: action.disabled ? 0.5 : 1,
        transition: `color ${TRANSITION_FAST}, background ${TRANSITION_FAST}, border-color ${TRANSITION_FAST}, box-shadow ${TRANSITION_FAST}`,
      }}
    >
      {action.loading && (
        <span
          data-part="action-spinner"
          style={{
            display: 'inline-block',
            width: 14,
            height: 14,
            animation: 'spin var(--ds-motion-glacial) linear infinite',
            flexShrink: 0,
          }}
        />
      )}
      {action.icon && !action.loading && (
        <span style={{ display: 'inline-flex', fontSize: 14, flexShrink: 0 }}>
          {action.icon}
        </span>
      )}
      {action.label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* BackButton                                                          */
/* ------------------------------------------------------------------ */

/**
 * Clean back navigation button with ghost styling.
 */
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      data-part="back-button"
      onClick={onClick}
      aria-label="Go back"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        flexShrink: 0,
        cursor: 'pointer',
        padding: 0,
        transition: `color ${TRANSITION_FAST}, background ${TRANSITION_FAST}`,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        style={{ width: 16, height: 16 }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
        />
      </svg>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* TabButton                                                           */
/* ------------------------------------------------------------------ */

/**
 * Individual tab button with hover state, active indicator, badge support,
 * and proper ARIA attributes for accessible tab navigation.
 */
function TabButton({
  tabKey,
  label,
  icon,
  badge,
  isActive,
  disabled,
  onClick,
}: {
  tabKey: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
  isActive: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={`tab-${tabKey}`}
      data-part="tab-button"
      data-active={isActive ? 'true' : 'false'}
      data-disabled={disabled ? 'true' : 'false'}
      aria-selected={isActive}
      aria-controls={`panel-${tabKey}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 16px',
        fontSize: 13,
        fontWeight: isActive ? 600 : 500,
        lineHeight: 1.4,
        marginBottom: -1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: `color ${TRANSITION_FAST}, background ${TRANSITION_FAST}, border-color ${TRANSITION_FAST}`,
      }}
    >
      {icon && (
        <span style={{ display: 'inline-flex', fontSize: 14, flexShrink: 0 }}>
          {icon}
        </span>
      )}
      {label}
      {badge != null && (
        <span
          data-part="tab-badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1px 7px',
            fontSize: 11,
            fontWeight: 600,
            lineHeight: 1.4,
            minWidth: 18,
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Breadcrumbs                                                         */
/* ------------------------------------------------------------------ */

/**
 * Clean breadcrumb trail with "/" separators and hover states.
 */
function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string; onClick?: () => void }[];
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      data-part="breadcrumbs"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
        fontSize: 12,
        lineHeight: 1.4,
      }}
    >
      {items.map((crumb, idx) => {
        const isLast = idx === items.length - 1;
        const isClickable = !isLast && (crumb.href || crumb.onClick);

        return (
          <React.Fragment key={`crumb-${idx}`}>
            {idx > 0 && (
              <span
                data-part="breadcrumb-separator"
                style={{
                  userSelect: 'none',
                  fontSize: 11,
                }}
                aria-hidden="true"
              >
                /
              </span>
            )}
            {crumb.href && !isLast ? (
              <a
                href={crumb.href}
                onClick={crumb.onClick}
                data-part="breadcrumb-link"
                style={{
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: `color ${TRANSITION_FAST}`,
                }}
              >
                {crumb.label}
              </a>
            ) : (
              <span
                data-part="breadcrumb-current"
                style={{
                  fontWeight: isLast ? 600 : 500,
                  cursor: isClickable ? 'pointer' : 'default',
                }}
                onClick={crumb.onClick}
              >
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

/**
 * Modern DetailPanel engine.
 *
 * Premium entity detail view with token-driven styling. Zero DaisyUI
 * dependency. Supports controlled and uncontrolled tab state.
 *
 * Features:
 * - Breadcrumb trail with "/" separators
 * - Back navigation ghost button
 * - Avatar + title (large, bold) + status pill badge
 * - Action buttons with primary/danger/ghost/default variants
 * - Tab navigation with badges and icon support
 * - Optional sidebar with panel background
 * - Loading skeleton with pulse animation
 * - Footer with subtle top border
 *
 * @typeParam T - Shape of the entity data object being displayed.
 * @param props - {@link DetailPanelProps}
 * @returns The rendered detail panel.
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
  const [internalActiveTab, setInternalActiveTab] = useState<string>(
    tabs?.[0]?.key ?? '',
  );
  const activeTab = controlledActiveTab ?? internalActiveTab;

  // Only update internal state when uncontrolled. Always fire onTabChange
  // so controlled consumers can sync their own state.
  const handleTabChange = (key: string) => {
    if (!controlledActiveTab) setInternalActiveTab(key);
    onTabChange?.(key);
  };

  /* ---- Loading skeleton ---- */
  if (loading) {
    return (
      <div
        className={`ds-pattern-detail-panel ds-engine-modern ${className ?? ''}`}
        data-part="root"
        data-loading="true"
        style={style}
      >
        <div style={{ padding: '20px 24px' }}>
          {/* Breadcrumb skeleton */}
          <SkeletonBlock part="skeleton-breadcrumb" width={180} height={12} style={{ marginBottom: 14 }} />

          {/* Header skeleton */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            {/* Avatar skeleton */}
            <SkeletonBlock
              part="skeleton-avatar"
              width={48}
              height={48}
              style={{
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <SkeletonBlock part="skeleton-title" width={180} height={22} />
                <SkeletonBlock
                  part="skeleton-badge"
                  width={64}
                  height={22}
                />
              </div>
              <SkeletonBlock part="skeleton-subtitle" width={140} height={14} />
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <SkeletonBlock
                part="skeleton-action"
                width={80}
                height={34}
              />
              <SkeletonBlock
                part="skeleton-action"
                width={80}
                height={34}
              />
            </div>
          </div>

          {/* Tab bar skeleton */}
          <div style={{ marginTop: 20, display: 'flex', gap: 4 }}>
            <SkeletonBlock part="skeleton-tab" width={72} height={34} />
            <SkeletonBlock part="skeleton-tab" width={72} height={34} />
            <SkeletonBlock part="skeleton-tab" width={72} height={34} />
          </div>

          {/* Content skeleton */}
          <div style={{ marginTop: 20, display: 'flex', gap: 16 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SkeletonBlock part="skeleton-content" width="100%" height={120} />
              <SkeletonBlock part="skeleton-content" width="100%" height={80} />
            </div>
            <SkeletonBlock
              part="skeleton-sidebar"
              width={sidebarWidth}
              height={200}
              style={{
                flexShrink: 0,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Resolve the active tab object so we can render its content below the tab bar.
  const activeTabObj = tabs?.find((t) => t.key === activeTab);

  return (
    <div
      className={`ds-pattern-detail-panel ds-engine-modern ${className ?? ''}`}
      data-part="root"
      style={style}
    >
      <div style={{ padding: '20px 24px' }}>
        {/* ---- Breadcrumbs ---- */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs items={breadcrumbs} />
        )}

        {/* ---- Header ---- */}
        <div
          data-part="header"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          {/* Left: back + avatar + title group */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flex: 1,
              minWidth: 0,
            }}
          >
            {onBack && <BackButton onClick={onBack} />}

            {avatar && (
              <div style={{ flexShrink: 0 }}>{avatar}</div>
            )}

            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                {/* Only render the heading when a title is actually provided.
                    When DetailPanel is wrapped by PageShell, title is suppressed
                    to avoid a double heading -- the shell owns the page title. */}
                {title != null && title !== '' && (
                  <h2
                    data-part="title"
                    style={{
                      margin: 0,
                      fontSize: 20,
                      fontWeight: 600,
                      lineHeight: 1.3,
                      letterSpacing: '-0.02em',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {title}
                  </h2>
                )}

                {/* Status pill badge */}
                {status && (
                  <span
                    data-part="status-badge"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '2px 10px',
                      fontSize: 12,
                      fontWeight: 600,
                      lineHeight: 1.5,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {status.label}
                  </span>
                )}
              </div>

              {/* Subtitle */}
              {subtitle && (
                <p
                  data-part="subtitle"
                  style={{
                    margin: '4px 0 0',
                    fontSize: 13,
                    lineHeight: 1.4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: actions + headerExtra */}
          {(actions || headerExtra) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexShrink: 0,
              }}
            >
              {headerExtra}
              {actions?.map((a) => <ActionButton key={a.key} action={a} />)}
            </div>
          )}
        </div>

        {/* ---- Body: tabs + content + sidebar ---- */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 20,
            flexDirection: sidebarPosition === 'left' ? 'row-reverse' : 'row',
          }}
        >
          {/* Main content area */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Tab navigation */}
            {tabs && tabs.length > 0 && (
              <>
                <div
                  role="tablist"
                  aria-label="Detail panel tabs"
                  data-part="tab-list"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0,
                    marginBottom: 16,
                  }}
                  onKeyDown={(e) => {
                    const enabledTabs = tabs.filter((t) => !t.disabled);
                    if (enabledTabs.length === 0) return;
                    const currentIdx = enabledTabs.findIndex((t) => t.key === activeTab);
                    let nextIdx = -1;
                    if (e.key === 'ArrowRight') {
                      nextIdx = currentIdx < enabledTabs.length - 1 ? currentIdx + 1 : 0;
                    } else if (e.key === 'ArrowLeft') {
                      nextIdx = currentIdx > 0 ? currentIdx - 1 : enabledTabs.length - 1;
                    } else if (e.key === 'Home') {
                      nextIdx = 0;
                    } else if (e.key === 'End') {
                      nextIdx = enabledTabs.length - 1;
                    }
                    if (nextIdx >= 0) {
                      e.preventDefault();
                      const nextTab = enabledTabs[nextIdx];
                      handleTabChange(nextTab.key);
                      // Move focus to the newly activated tab button
                      const tabEl = document.getElementById(`tab-${nextTab.key}`);
                      tabEl?.focus();
                    }
                  }}
                >
                  {tabs.map((tab) => (
                    <TabButton
                      key={tab.key}
                      tabKey={tab.key}
                      label={tab.label}
                      icon={tab.icon}
                      badge={tab.badge}
                      isActive={activeTab === tab.key}
                      disabled={tab.disabled}
                      onClick={() => !tab.disabled && handleTabChange(tab.key)}
                    />
                  ))}
                </div>
                <div
                  role="tabpanel"
                  id={`panel-${activeTab}`}
                  aria-labelledby={`tab-${activeTab}`}
                  data-part="tab-panel"
                >
                  {activeTabObj?.content}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          {sidebar && (
            <div
              style={{
                width: sidebarWidth,
                flexShrink: 0,
                order: sidebarPosition === 'left' ? 1 : undefined,
              }}
            >
              <div
                data-part="sidebar"
                style={{
                  padding: 16,
                }}
              >
                {sidebar}
              </div>
            </div>
          )}
        </div>

        {/* ---- Footer ---- */}
        {footer && (
          <div
            data-part="footer"
            style={{
              marginTop: 20,
              paddingTop: 16,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
