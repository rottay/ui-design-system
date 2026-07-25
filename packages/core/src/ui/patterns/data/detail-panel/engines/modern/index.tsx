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
import type { DetailPanelProps, DetailAction } from '../../contracts';
import Button from '../../../../../primitives/inputs/Button/engines/modern';
import { NavigationBackIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-back';
import { NavigationForwardIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-forward';

/* ------------------------------------------------------------------ */
/* Shared style constants                                              */
/* ------------------------------------------------------------------ */

const TRANSITION_FAST =
  'var(--ds-motion-fast) var(--ds-motion-ease-out)';

const PULSE_STYLE: React.CSSProperties = {
  animation: 'ds-foundation-pulse 1.5s ease-in-out infinite',
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
    <span
      data-part="action-button"
      data-variant={variant}
      data-loading={action.loading ? 'true' : 'false'}
      style={{ display: 'contents' }}
    >
      <Button
        htmlType="button"
        size="sm"
        variant={variant}
        disabled={action.disabled || action.loading}
        aria-busy={action.loading ? 'true' : 'false'}
        onClick={action.onClick}
        style={{ flexShrink: 0 }}
        icon={action.loading ? (
          <span
            data-part="action-spinner"
            style={{
              display: 'inline-block',
              width: 'var(--ds-button-sm-icon-size)',
              height: 'var(--ds-button-sm-icon-size)',
              animation: 'ds-foundation-spin var(--ds-motion-glacial) linear infinite',
              flexShrink: 0,
            }}
          />
        ) : action.icon}
      >
        {action.label}
      </Button>
    </span>
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
    <span data-part="back-button" style={{ display: 'contents' }}>
      <Button
        htmlType="button"
        variant="ghost"
        size="sm"
        shape="circle"
        onClick={onClick}
        aria-label="Go back"
        style={{ flexShrink: 0 }}
        icon={(
          <NavigationBackIcon size={15} decorative />
        )}
      >
        <span className="ds-sr-only">Go back</span>
      </Button>
    </span>
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
        gap: 'var(--ds-tabs-item-gap)',
        minHeight: 'var(--ds-tabs-md-height)',
        padding: 'var(--ds-tabs-md-padding)',
        fontSize: 'var(--ds-tabs-md-font-size)',
        fontWeight: isActive
          ? 'var(--ds-tabs-item-font-weight-active)'
          : 'var(--ds-tabs-item-font-weight)',
        lineHeight: 'var(--ds-line-height-body)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: `color ${TRANSITION_FAST}, background ${TRANSITION_FAST}, border-color ${TRANSITION_FAST}, box-shadow ${TRANSITION_FAST}, transform ${TRANSITION_FAST}`,
      }}
    >
      {icon && (
        <span style={{ display: 'inline-flex', fontSize: 'var(--ds-tabs-md-icon-size)', flexShrink: 0 }}>
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
        gap: 'var(--ds-spacing-2, 8px)',
        marginBottom: 'var(--ds-spacing-3, 12px)',
        fontSize: 'var(--ds-font-size-xs)',
        lineHeight: 'var(--ds-line-height-body)',
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
                <NavigationForwardIcon size={10} decorative />
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
        <div style={{ padding: 'var(--ds-detail-panel-padding)' }}>
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
          <div style={{ marginTop: 'var(--ds-detail-panel-section-gap)', display: 'flex', gap: 'var(--ds-tabs-gap)' }}>
            <SkeletonBlock part="skeleton-tab" width={72} height={34} />
            <SkeletonBlock part="skeleton-tab" width={72} height={34} />
            <SkeletonBlock part="skeleton-tab" width={72} height={34} />
          </div>

          {/* Content skeleton */}
          <div style={{ marginTop: 'var(--ds-detail-panel-section-gap)', display: 'flex', gap: 'var(--ds-detail-panel-content-gap)' }}>
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
      <div style={{ padding: 'var(--ds-detail-panel-padding)' }}>
        {/* ---- Breadcrumbs ---- */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs items={breadcrumbs} />
        )}

        {/* ---- Header ---- */}
        <div
          data-part="header"
          data-has-actions={actions || headerExtra ? 'true' : 'false'}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--ds-detail-panel-content-gap)',
          }}
        >
          {/* Left: back + avatar + title group */}
          <div
            data-part="identity"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-detail-panel-item-gap)',
              flex: 1,
              minWidth: 0,
            }}
          >
            {onBack && <BackButton onClick={onBack} />}

            {avatar && (
              <div data-part="avatar" style={{ flexShrink: 0 }}>{avatar}</div>
            )}

            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                data-part="title-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-detail-panel-item-gap)',
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
                      fontSize: 'var(--ds-font-size-xl)',
                      fontWeight: 'var(--ds-font-weight-semibold)',
                      lineHeight: 'var(--ds-line-height-heading)',
                      letterSpacing: 'var(--ds-letter-spacing-heading)',
                      textWrap: 'balance',
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
                      fontSize: 'var(--ds-font-size-xs)',
                      fontWeight: 'var(--ds-font-weight-semibold)',
                      lineHeight: 'var(--ds-line-height-body)',
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
                    fontSize: 'var(--ds-font-size-sm)',
                    lineHeight: 'var(--ds-line-height-body)',
                    textWrap: 'pretty',
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
              data-part="actions"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-detail-panel-item-gap)',
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
          data-part="body"
          style={{
            display: 'flex',
            gap: 'var(--ds-detail-panel-content-gap)',
            marginTop: 'var(--ds-detail-panel-section-gap)',
            flexDirection: sidebarPosition === 'left' ? 'row-reverse' : 'row',
          }}
        >
          {/* Main content area */}
          <div data-part="main" style={{ flex: 1, minWidth: 0 }}>
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
                    gap: 'var(--ds-tabs-gap)',
                    marginBottom: 'var(--ds-detail-panel-content-gap)',
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
                  padding: 'var(--ds-workspace-card-padding)',
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
              marginTop: 'var(--ds-detail-panel-section-gap)',
              paddingTop: 'var(--ds-detail-panel-content-gap)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
