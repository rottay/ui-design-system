'use client';

/**
 * @fileoverview PageShell -- Modern engine (token-driven).
 *
 * Clean page frame with optional breadcrumbs, title area, action buttons,
 * tab navigation, and content slot. All visuals use `--ds-*` CSS custom
 * properties. Zero DaisyUI dependency.
 *
 * Features:
 * - Breadcrumb trail with "/" separators, muted color, hover state
 * - Title area with strong heading bound to the authored page-title
 *   typography role (`--ds-type-page-title-*`, exact fallbacks)
 * - Subtitle in secondary color; optional metadata register line (caption
 *   role, muted ink, tabular numerals)
 * - Actions slot right-aligned with proper spacing
 * - Optional tab navigation with active indicator
 * - Back navigation button (ghost, token-driven)
 * - Optional sticky header posture with safe-area offset and governed stuck
 *   elevation (data-sticky / data-stuck)
 * - Transparent background (content cards provide their own)
 * - Optional bottom border separator
 *
 * @module Patterns/PageShell/Engines/Modern
 * @category Patterns
 * @package @rottay/design-system
 *
 * @example
 * <ModernPageShell
 *   title="Users"
 *   subtitle="Manage platform users"
 *   breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Users' }]}
 *   actions={<Button>Add User</Button>}
 * >
 *   <UserTable />
 * </ModernPageShell>
 */

import React from 'react';
import type { PageShellProps } from '../../contracts';
import Button from '../../../../../primitives/inputs/Button/engines/modern';
import { NavigationBackIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-back';
import { NavigationForwardIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-forward';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/* ------------------------------------------------------------------ */
/* RTL-aware direction reading (same contract as the data-table engine) */
/* ------------------------------------------------------------------ */

function readDirectionAt(node: Element): 'ltr' | 'rtl' {
  const explicit = node.closest('[dir]')?.getAttribute('dir');
  if (explicit === 'rtl' || explicit === 'ltr') return explicit;
  return getComputedStyle(node).direction === 'rtl' ? 'rtl' : 'ltr';
}

/* ------------------------------------------------------------------ */
/* BreadcrumbLink                                                      */
/* ------------------------------------------------------------------ */

/**
 * Individual breadcrumb link/text with hover state for interactive items.
 */
function BreadcrumbItem({
  label,
  href,
  onClick,
  isLast,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  isLast: boolean;
}) {
  const isInteractive = !isLast && (href || onClick);

  if (isInteractive) {
    return (
      <a
        href={href ?? '#'}
        data-part="crumb"
        data-interactive="true"
        data-last="false"
        onClick={
          onClick
            ? (e: React.MouseEvent) => {
                e.preventDefault();
                onClick();
              }
            : undefined
        }
      >
        {label}
      </a>
    );
  }

  return (
    <span
      data-part="crumb"
      data-interactive="false"
      data-last={isLast ? 'true' : 'false'}
      /* The terminal crumb is the current page: announce it (APG breadcrumb). */
      aria-current={isLast ? 'page' : undefined}
    >
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* TabButton                                                           */
/* ------------------------------------------------------------------ */

/**
 * Tab button with token-driven active indicator and hover state.
 */
function TabButton({
  label,
  isActive,
  onClick,
  id,
  controls,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  /** APG wiring: the tab's own id (the tabpanel's aria-labelledby target). */
  id: string;
  /** APG wiring: the tabpanel id this tab controls. */
  controls: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-controls={controls}
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={onClick}
      data-part="tab"
      data-active={isActive ? 'true' : 'false'}
    >
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* BackButton                                                          */
/* ------------------------------------------------------------------ */

/**
 * Ghost back navigation button with token-driven hover state.
 */
function BackButton({
  label,
  ariaLabel,
  fallbackLabel,
  onClick,
}: {
  label?: string;
  ariaLabel?: string;
  /** i18n-resolved English-floor label used when neither label nor ariaLabel is set. */
  fallbackLabel: string;
  onClick: () => void;
}) {
  return (
    <span
      data-part="back"
      data-has-label={label ? 'true' : 'false'}
    >
      <Button
        htmlType="button"
        variant="ghost"
        size="sm"
        shape={label ? 'default' : 'circle'}
        onClick={onClick}
        aria-label={ariaLabel ?? label ?? fallbackLabel}
        icon={(
          <NavigationBackIcon size={15} decorative />
        )}
      >
        {label ?? <span className="ds-sr-only">{ariaLabel ?? fallbackLabel}</span>}
      </Button>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

/**
 * Modern PageShell engine.
 *
 * Token-driven page frame for all application pages. No DaisyUI classes --
 * every color, radius, and spacing value references a `--ds-*` CSS custom
 * property.
 *
 * @param props - {@link PageShellProps}
 * @returns The rendered page shell layout.
 */
export default function ModernPageShell(props: PageShellProps) {
  const {
    title,
    eyebrow,
    icon,
    hideHeader = false,
    subtitle,
    metadata,
    headerContent,
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
    sticky = false,
    className,
    style,
  } = props;

  /* ---- Sticky posture (cockpit-header idiom): the header opts into
          position:sticky through the prop; a passive window-scroll listener
          stamps data-stuck once the scrollport has moved, so the governed
          stuck elevation only appears when content can actually pass beneath
          the panel. Known boundary (same as cockpit-header): the viewport is
          the assumed scroll root — a shell inside a nested scroller keeps
          data-stuck='false' until the window itself scrolls.

          C1 progressive separation: the same listener also reports a
          continuous 0→1 progress across the first 48px past the stuck
          threshold, written straight to the header node (no per-frame
          re-render) on the private runtime-instance channel
          `--_ds-page-shell-stuck-progress`. The skin reads it with the
          exact current render as fallback, so an engine that never writes
          it keeps the binary stuck treatment. The value follows the user's
          own scroll position — scroll-linked STATE, not autonomous motion —
          so reduced-motion needs no extra guard. ---- */
  const [isStuck, setIsStuck] = React.useState(false);
  const stuckProgressRef = React.useRef(0);
  const headerNodeRef = React.useRef<HTMLDivElement | null>(null);

  const headerRef = React.useCallback((node: HTMLDivElement | null) => {
    headerNodeRef.current = node;
    /* Node swap (loading → loaded): restore the last known progress so the
       ramp never resets mid-scroll. */
    if (node) {
      node.style.setProperty(
        '--_ds-page-shell-stuck-progress',
        String(stuckProgressRef.current),
      );
    }
  }, []);

  React.useEffect(() => {
    if (!sticky) return;

    const handleScroll = () => {
      setIsStuck(window.scrollY > 4);
      /* 48px governed ramp past the 4px stuck threshold. */
      const progress = Math.min(1, Math.max(0, (window.scrollY - 4) / 44));
      stuckProgressRef.current = progress;
      headerNodeRef.current?.style.setProperty(
        '--_ds-page-shell-stuck-progress',
        String(progress),
      );
    };
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sticky]);

  /* ---- Guarded i18n channel (K4 idiom): chrome labels resolve through the
          catalogs when an I18nProvider is mounted; without one the documented
          English floor renders, byte-identical to the pre-i18n contract. ---- */
  const i18nCommon = useOptionalTranslation('common');
  const i18nComponents = useOptionalTranslation('components');
  const breadcrumbLabel = i18nCommon?.tOr('breadcrumb', 'Breadcrumb') ?? 'Breadcrumb';
  const backFallbackLabel = i18nCommon?.tOr('back', 'Back') ?? 'Back';
  const pageTabsLabel =
    i18nComponents?.tOr('pageShell.tabs.label', 'Page tabs') ?? 'Page tabs';

  /* APG tab/tabpanel pairing: stable per-instance ids (useId), so concurrent
     shells never collide. The shell renders ONE tabpanel whose labelledby
     follows the active tab (automatic activation). Hook order law: this hook
     sits above the loading early-return. */
  const shellId = React.useId();

  /* ---- Loading skeleton: geometry lives in the skin keyed on data-block
          (cockpit-header idiom); the pulse cadence rides the skin's motion
          channel. The two action blocks keep their divergent radius on the
          sanctioned inline custom-property channel. The skeleton mirrors the
          anatomy the caller actually requested (breadcrumb / eyebrow / title
          / subtitle / actions / tabs), so the late content lands on the
          footprint the skeleton reserved instead of jumping. ---- */
  if (loading) {
    return (
      <div
        className={`ds-pattern-page-shell ds-pattern-page-shell--loading ds-engine-modern ${className ?? ''}`}
        data-part="root"
        data-loading="true"
        aria-busy="true"
        style={{
          '--ds-page-shell-max-width': maxWidth,
          ...style,
        } as React.CSSProperties}
      >
        <div className="ds-pattern-page-shell__loading-skeleton" data-part="skeleton-group">
          {/* Breadcrumb skeleton */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div data-part="skeleton" data-block="breadcrumb" />
          )}
          {/* Eyebrow skeleton */}
          {eyebrow ? <div data-part="skeleton" data-block="eyebrow" /> : null}
          {/* Title skeleton */}
          <div data-part="skeleton-title-row">
            <div data-part="skeleton-title-copy">
              {/* In-flow skeleton: 280px exceeds the content box a 360px
                  viewport offers, so it is bounded rather than pinned. */}
              <div data-part="skeleton" data-block="title" />
              {subtitle ? <div data-part="skeleton" data-block="subtitle" /> : null}
              {/* C1: the metadata register line joins the mirrored anatomy —
                  its block reserves the caption footprint so a late register
                  never pushes the actions/tabs down on hydrate. */}
              {metadata ? <div data-part="skeleton" data-block="metadata" /> : null}
            </div>
            {actions ? (
              <div data-part="skeleton-action-row">
                <div
                  data-part="skeleton"
                  data-block="action-sm"
                  style={{ '--ds-page-shell-skeleton-radius': 'var(--ds-radius-md)' } as React.CSSProperties}
                />
                <div
                  data-part="skeleton"
                  data-block="action-md"
                  style={{ '--ds-page-shell-skeleton-radius': 'var(--ds-radius-md)' } as React.CSSProperties}
                />
              </div>
            ) : null}
          </div>
          {/* Tab strip skeleton: one block per declared tab (capped at four)
              reserves the strip's final width and row height. */}
          {tabs && tabs.length > 0 && (
            <div data-part="skeleton-tabs-row">
              {tabs.slice(0, 4).map((tab) => (
                <div key={`skeleton-tab-${tab.key}`} data-part="skeleton" data-block="tab" />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* Default to the first tab when no activeTab is explicitly set */
  const activeTabKey = activeTab ?? tabs?.[0]?.key;

  const hasTabs = Boolean(tabs && tabs.length > 0);
  /* The tablist lives inside the header, so `hideHeader` removes it. Without
     this guard the content area still claimed `role="tabpanel"` and pointed
     `aria-labelledby` at tab ids that were never rendered. */
  const tabsRendered = hasTabs && !hideHeader;
  const tabDomId = (key: string) => `${shellId}-tab-${key}`;
  const panelDomId = `${shellId}-panel`;

  /* ---- APG tabs keyboard contract: roving focus with automatic activation.
          Arrow keys are logical (RTL mirrors Left/Right); Home/End jump. ---- */
  const handleTabsKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!tabs || tabs.length === 0) return;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const list = event.currentTarget;
    const buttons = Array.from(list.querySelectorAll<HTMLButtonElement>('[data-part="tab"]'));
    if (buttons.length === 0) return;
    const focusedIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const fromIndex =
      focusedIndex >= 0 ? focusedIndex : tabs.findIndex((tab) => tab.key === activeTabKey);
    let nextIndex = fromIndex;
    if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = buttons.length - 1;
    } else {
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      const logicalDelta = readDirectionAt(list) === 'rtl' ? -delta : delta;
      nextIndex = (fromIndex + logicalDelta + buttons.length) % buttons.length;
    }
    const target = buttons[nextIndex];
    if (!target) return;
    target.focus();
    const targetKey = tabs[nextIndex]?.key;
    if (targetKey && targetKey !== activeTabKey) onTabChange?.(targetKey);
  };

  return (
    <div
      className={`ds-pattern-page-shell ds-engine-modern ${className ?? ''}`}
      data-part="root"
      data-loading="false"
      style={{
        /* The caller's max-width rides a quoted custom-property channel; the
           skin applies it (with margin-inline: auto), so the engine carries
           no layout inline. */
        '--ds-page-shell-max-width': maxWidth,
        ...style,
      } as React.CSSProperties}
    >
      {/* ---- Page header area ---- */}
      {!hideHeader && (
        <div
          ref={headerRef}
          data-part="header"
          data-has-actions={actions ? 'true' : 'false'}
          data-has-tabs={tabs && tabs.length > 0 ? 'true' : 'false'}
          data-has-rich-content={headerContent ? 'true' : 'false'}
          data-sticky={sticky ? 'true' : 'false'}
          data-stuck={sticky && isStuck ? 'true' : 'false'}
        >
        {/* ---- Breadcrumb trail (pattern-owned framed-pill grammar — see the
                skin header; the Breadcrumb primitive was evaluated and the
                cockpit-header framed-pill minimal contract applies) ---- */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label={breadcrumbLabel}
            data-part="breadcrumb"
          >
            {breadcrumbs.map((bc, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={`crumb-${idx}`}>
                  {idx > 0 && (
                    <span
                      data-part="separator"
                      aria-hidden="true"
                    >
                      <NavigationForwardIcon size={11} decorative />
                    </span>
                  )}
                  <BreadcrumbItem
                    label={bc.label}
                    href={bc.href}
                    onClick={bc.onClick}
                    isLast={isLast}
                  />
                </React.Fragment>
              );
            })}
          </nav>
        )}

        {/* ---- Header row: back + title group | actions ---- */}
        <div data-part="header-row">
          {/* Left cluster: back button + title group */}
          <div data-part="lead">
            {back && (
              <BackButton
                label={back.label}
                ariaLabel={back.ariaLabel}
                fallbackLabel={backFallbackLabel}
                onClick={back.onClick}
              />
            )}

            {icon ? (
              <span data-part="header-icon" aria-hidden="true">
                {icon}
              </span>
            ) : null}

            {/* Title + badge + subtitle */}
            <div data-part="titles">
              {eyebrow ? (
                <div data-part="eyebrow">{eyebrow}</div>
              ) : null}
              <div data-part="title-row">
                {/* String titles also advertise their full text on hover: the
                    32ch measure + balanced wrap can still clip long names in
                    narrow containers (cockpit-header idiom). */}
                <h1
                  data-part="title"
                  title={typeof title === 'string' ? title : undefined}
                >
                  {title}
                </h1>
                {badge}
              </div>
              {subtitle && (
                <p
                  data-part="subtitle"
                >
                  {subtitle}
                </p>
              )}
              {metadata && (
                /* Register line: counts, timestamps, owners. Deliberately
                   subordinate — caption role and muted ink live in the skin. */
                <div data-part="metadata">
                  {metadata}
                </div>
              )}
            </div>
          </div>

          {/* Right: action buttons */}
          {actions && (
            <div data-part="actions">
              {actions}
            </div>
          )}
        </div>

        {headerContent && (
          <div data-part="header-content">
            {headerContent}
          </div>
        )}

        {/* ---- Bottom border separator ---- */}
        {(tabs && tabs.length > 0) ? (
          /* Tab strip acts as the separator */
          <div
            role="tablist"
            aria-label={pageTabsLabel}
            data-part="tabs"
            onKeyDown={handleTabsKeyDown}
          >
            {tabs.map((tab) => (
              <TabButton
                key={tab.key}
                label={tab.label}
                isActive={activeTabKey === tab.key}
                onClick={() => onTabChange?.(tab.key)}
                id={tabDomId(tab.key)}
                controls={panelDomId}
              />
            ))}
          </div>
        ) : (
          /* Subtle separator when no tabs */
          <div data-part="rule" />
        )}
        </div>
      )}

      {/* ---- Content area: the single APG tabpanel when tabs drive it ---- */}
      <div
        data-part="content"
        role={tabsRendered ? 'tabpanel' : undefined}
        id={tabsRendered ? panelDomId : undefined}
        aria-labelledby={tabsRendered && activeTabKey ? tabDomId(activeTabKey) : undefined}
      >
        {tabs && tabs.length > 0
          ? tabs.find((t) => t.key === activeTabKey)?.content
          : children}
      </div>
    </div>
  );
}
