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
import Skeleton from '../../../../../primitives/feedback/Skeleton/engines/modern';
import { NavigationBackIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-back';
import { NavigationForwardIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-forward';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/* ------------------------------------------------------------------ */
/* SkeletonBlock                                                       */
/* ------------------------------------------------------------------ */

/**
 * Pattern-law composition: the Skeleton primitive owns the placeholder shape
 * (variant, pulse, reduced-motion); this wrapper only keeps the pattern's
 * per-part anatomy hook for LAYOUT spacing (margins/flex), never shape paint.
 */
const SKELETON_PART_VARIANT = {
  'skeleton-action': 'rounded',
  'skeleton-avatar': 'circular',
  'skeleton-badge': 'rounded',
  'skeleton-breadcrumb': 'rounded',
  'skeleton-content': 'rectangular',
  'skeleton-sidebar': 'rectangular',
  'skeleton-subtitle': 'rounded',
  'skeleton-tab': 'rounded',
  'skeleton-title': 'rounded',
} as const;

function SkeletonBlock(props: {
  width: number | string;
  height: number;
  part: keyof typeof SKELETON_PART_VARIANT;
  style?: React.CSSProperties;
}) {
  return (
    <div data-part={props.part} style={props.style}>
      <Skeleton
        variant={SKELETON_PART_VARIANT[props.part]}
        width={props.width}
        height={props.height}
      />
    </div>
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
    >
      <Button
        htmlType="button"
        size="sm"
        variant={variant}
        disabled={action.disabled || action.loading}
        aria-busy={action.loading ? 'true' : 'false'}
        onClick={action.onClick}
        icon={action.loading ? (
          /* Loading ring: the skin owns geometry + border ring
             ([data-part='action-spinner']); only the spin reference stays
             inline (sanctioned residual, see detail-panel.css). */
          <span
            data-part="action-spinner"
            style={{
              animation: 'ds-foundation-spin var(--ds-motion-glacial) linear infinite',
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
function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <span data-part="back-button">
      <Button
        htmlType="button"
        variant="ghost"
        size="sm"
        shape="circle"
        onClick={onClick}
        aria-label={label}
        icon={(
          <NavigationBackIcon size={15} decorative />
        )}
      />
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
    >
      {icon && (
        <span data-part="tab-icon">
          {icon}
        </span>
      )}
      {label}
      {badge != null && (
        <span data-part="tab-badge">
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
  navLabel,
}: {
  items: { label: string; href?: string; onClick?: () => void }[];
  navLabel: string;
}) {
  return (
    <nav
      aria-label={navLabel}
      data-part="breadcrumbs"
    >
      {items.map((crumb, idx) => {
        const isLast = idx === items.length - 1;
        const isClickable = !isLast && (crumb.href || crumb.onClick);

        return (
          <React.Fragment key={`crumb-${idx}`}>
            {idx > 0 && (
              <span
                data-part="breadcrumb-separator"
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
              >
                {crumb.label}
              </a>
            ) : (
              <span
                data-part="breadcrumb-current"
                data-clickable={isClickable ? 'true' : 'false'}
                data-last={isLast ? 'true' : 'false'}
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

  // Chrome copy: catalogued when an I18nProvider is mounted, the documented
  // English floor otherwise (a missing key echoes the full key back, which
  // the endsWith guard detects). Pattern-owned strings, never page copy.
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, fallback: string): string => {
    const translated = i18n?.t(key);
    return translated && !translated.endsWith(key) ? translated : fallback;
  };
  const labels = {
    back: tOr('detailPanel.back', 'Go back'),
    breadcrumb: tOr('detailPanel.breadcrumb', 'Breadcrumb'),
    tabs: tOr('detailPanel.tabs', 'Detail panel tabs'),
  };

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
        data-pattern="detail-panel"
        data-loading="true"
        style={style}
      >
        <div data-part="panel-inner">
          {/* Breadcrumb skeleton */}
          <SkeletonBlock part="skeleton-breadcrumb" width={180} height={12} />

          {/* Header skeleton */}
          <div
            data-part="skeleton-header"
          >
            {/* Avatar skeleton */}
            <SkeletonBlock
              part="skeleton-avatar"
              width={48}
              height={48}
            />
            <div data-part="skeleton-title-column">
              <div data-part="skeleton-title-row">
                <SkeletonBlock part="skeleton-title" width={180} height={22} />
                <SkeletonBlock
                  part="skeleton-badge"
                  width={64}
                  height={22}
                />
              </div>
              <SkeletonBlock part="skeleton-subtitle" width={140} height={14} />
            </div>
            <div data-part="skeleton-actions-row">
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
          <div data-part="skeleton-tabbar">
            <SkeletonBlock part="skeleton-tab" width={72} height={34} />
            <SkeletonBlock part="skeleton-tab" width={72} height={34} />
            <SkeletonBlock part="skeleton-tab" width={72} height={34} />
          </div>

          {/* Content skeleton */}
          <div data-part="skeleton-body">
            <div data-part="skeleton-content-column">
              <SkeletonBlock part="skeleton-content" width="100%" height={120} />
              <SkeletonBlock part="skeleton-content" width="100%" height={80} />
            </div>
            <SkeletonBlock
              part="skeleton-sidebar"
              width={sidebarWidth}
              height={200}
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
      data-pattern="detail-panel"
      style={style}
    >
      <div data-part="panel-inner">
        {/* ---- Breadcrumbs ---- */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs items={breadcrumbs} navLabel={labels.breadcrumb} />
        )}

        {/* ---- Header ---- */}
        <div
          data-part="header"
          data-has-actions={actions || headerExtra ? 'true' : 'false'}
        >
          {/* Left: back + avatar + title group */}
          <div
            data-part="identity"
          >
            {onBack && <BackButton onClick={onBack} label={labels.back} />}

            {avatar && (
              <div data-part="avatar">{avatar}</div>
            )}

            <div data-part="heading">
              <div
                data-part="title-row"
              >
                {/* Only render the heading when a title is actually provided.
                    When DetailPanel is wrapped by PageShell, title is suppressed
                    to avoid a double heading -- the shell owns the page title. */}
                {title != null && title !== '' && (
                  <h2
                    data-part="title"
                  >
                    {title}
                  </h2>
                )}

                {/* Status pill badge */}
                {status && (
                  <span
                    data-part="status-badge"
                  >
                    {status.label}
                  </span>
                )}
              </div>

              {/* Subtitle */}
              {subtitle && (
                <p
                  data-part="subtitle"
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
            >
              {headerExtra}
              {actions?.map((a) => <ActionButton key={a.key} action={a} />)}
            </div>
          )}
        </div>

        {/* ---- Body: tabs + content + sidebar ---- */}
        <div
          data-part="body"
          data-sidebar-position={sidebarPosition}
        >
          {/* Main content area */}
          <div data-part="main">
            {/* Tab navigation */}
            {tabs && tabs.length > 0 && (
              <>
                <div
                  role="tablist"
                  aria-label={labels.tabs}
                  data-part="tab-list"
                  onKeyDown={(e) => {
                    const enabledTabs = tabs.filter((t) => !t.disabled);
                    if (enabledTabs.length === 0) return;
                    const currentIdx = enabledTabs.findIndex((t) => t.key === activeTab);
                    // Direction-aware arrows (data-table/action-dock precedent):
                    // in RTL the visual-forward key is ArrowLeft, so the same
                    // physical cue always moves the selection the same way.
                    const isRtl =
                      getComputedStyle(e.currentTarget).direction === 'rtl';
                    const forwardKey = isRtl ? 'ArrowLeft' : 'ArrowRight';
                    const backwardKey = isRtl ? 'ArrowRight' : 'ArrowLeft';
                    let nextIdx = -1;
                    if (e.key === forwardKey) {
                      nextIdx = currentIdx < enabledTabs.length - 1 ? currentIdx + 1 : 0;
                    } else if (e.key === backwardKey) {
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
              data-part="sidebar-slot"
              /* The contract accepts a number (px) OR a CSS string ('300px',
                 '25%'): appending 'px' unconditionally produced invalid
                 declarations like '25%px' for the string form. */
              style={{
                '--ds-detail-panel-sidebar-width':
                  typeof sidebarWidth === 'number'
                    ? `${sidebarWidth}px`
                    : sidebarWidth,
              } as React.CSSProperties}
            >
              <div
                data-part="sidebar"
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
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
