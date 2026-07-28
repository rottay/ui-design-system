'use client';

/**
 * @fileoverview DetailHeader — structures-tier detail-page header with back
 * navigation, breadcrumb trail, hero title cluster, status badge, action
 * rail, optional metadata strip, optional tab strip, and optional
 * context-rail slot.
 *
 * @description
 * Engine-free structures family for entity-detail pages. Pairs with the
 * `record` building blocks (`RecordField`, `RecordFieldGrid`)
 * and with `form-sections` (`FormSections`) to compose a full
 * detail screen.
 *
 * DetailHeader is chrome, not a surface: it is a structural widget that
 * wraps the top of a detail page. The heavier DS `DetailSurface` is a
 * full-page config object (EntityAdapter + tabs + sidebar + footer +
 * breadcrumbs + a config-driven API). DetailHeader is just the header
 * strip — consumers compose it with their own body content. Use this
 * when you want a rich detail-page header without committing to the
 * full surface config contract.
 *
 * Features:
 *   - Back button (uses NavigationLinkProvider Link adapter when
 *     mounted, falls back to native `<a>`)
 *   - Breadcrumb trail (uses NavigationLinkProvider Link adapter for
 *     items with hrefs)
 *   - Hero title cluster: optional eyebrow chip, title, optional
 *     status badge, optional subtitle, optional context-rail slot
 *   - Optional avatar (string for URL or initials, or any ReactNode)
 *   - Action rail with structured DetailHeaderAction[] (uses the
 *     shared header-actions semantic vocabulary)
 *   - Optional metadata strip (label/value pairs with optional icon
 *     and monospace mode)
 *   - Optional children slot inside the metadata card
 *   - Optional tab strip with active state, count badge, and icon
 *   - 4 archetype variants (control, editorial, technical, governance)
 *     each with their own gradient + grid background pattern
 *
 * The family stays domain-agnostic. All copy is consumer-supplied; the
 * component knows nothing about tenants, users, or any specific entity.
 * Status badge variants follow the standard DS Badge vocabulary.
 */

import { type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';

import { ArrowLeftIcon } from '@/graphics/icons/presentation/catalog/navigation';
import type { ComponentType } from 'react';
type DetailHeaderIcon = ComponentType<any>;

import { Badge, Box, Breadcrumb, Button, Flex, Stack, Text, Tooltip } from '../../../primitives';
import { useNavigationLink } from '../../../../infrastructure/runtime/adapters/presentation/react/navigation';
import {
  type SharedHeaderActionKind,
  resolveSharedHeaderActionIcon,
  resolveSharedHeaderActionTooltip,
  resolveSharedHeaderActionVariant,
} from '../../../patterns/foundation/header-actions';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

export type DetailHeaderArchetype = 'editorial' | 'control' | 'technical' | 'governance';

export interface DetailHeaderAction {
  label: string;
  kind?: SharedHeaderActionKind;
  icon?: DetailHeaderIcon;
  onClick?: () => void;
  href?: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'error';
  tooltip?: string;
}

export interface DetailHeaderTab {
  id: string;
  label: string;
  count?: number;
  icon?: DetailHeaderIcon;
}

export interface DetailHeaderProps {
  title: string;
  subtitle?: string;
  avatar?: string | ReactNode;
  status?: {
    label: string;
    variant: 'primary' | 'success' | 'error' | 'warning' | 'secondary';
  };
  backHref: string;
  backLabel?: string;
  breadcrumb?: Array<{ label: string; href?: string }>;
  actions?: DetailHeaderAction[];
  tabs?: DetailHeaderTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  metadata?: Array<{ label: string; value: string; icon?: DetailHeaderIcon; mono?: boolean }>;
  eyebrow?: string;
  archetype?: DetailHeaderArchetype;
  contextRail?: ReactNode;
  children?: ReactNode;
}

// Only the tab-active background still rides the engine: it is archetype-selected
// but the tab strip is a SIBLING of the hero-panel, so no `data-archetype` ancestor
// can reach it from CSS. Everything else the archetype used to compute (hero
// gradient, fade mask, grid) lives in detail-header.css keyed on `data-archetype`.
function getArchetypeTabActiveBackground(archetype: DetailHeaderArchetype) {
  switch (archetype) {
    case 'editorial':
      return 'color-mix(in srgb, var(--ds-color-bg-primary) 32%, transparent)';
    case 'technical':
      return 'color-mix(in srgb, var(--ds-color-bg-primary) 36%, transparent)';
    case 'governance':
      return 'color-mix(in srgb, var(--ds-color-bg-primary) 42%, transparent)';
    case 'control':
    default:
      return 'color-mix(in srgb, var(--ds-color-bg-primary) 28%, transparent)';
  }
}

function renderAvatarNode(avatar: string | ReactNode, title: string) {
  if (typeof avatar === 'string') {
    if (avatar.startsWith('http') || avatar.startsWith('/')) {
      return (
        <Box
          data-part="avatar"
          data-variant="image"
          style={{
            width: 68,
            height: 68,
            overflow: 'hidden',
          }}
        >
          <img
            src={avatar}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
      );
    }

    return (
      <Box
        data-part="avatar"
        data-variant="initials"
        style={{
          width: 68,
          height: 68,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: 700 }}>{avatar}</Text>
      </Box>
    );
  }

  return avatar;
}

export function DetailHeader({
  title,
  subtitle,
  avatar,
  status,
  backHref,
  backLabel,
  breadcrumb,
  actions = [],
  tabs,
  activeTab,
  onTabChange,
  metadata,
  eyebrow,
  archetype = 'control',
  contextRail,
  children,
}: DetailHeaderProps) {
  const i18n = useOptionalTranslation('common');
  const resolvedBackLabel = backLabel ?? i18n?.tOr('back', 'Back') ?? 'Back';
  const tabStripLabel = i18n?.tOr('tabs', 'Tabs') ?? 'Tabs';
  // Resolve the framework-specific Link component once. Falls back to a
  // native <a> tag when no NavigationLinkProvider is mounted, which keeps
  // the DS package framework-agnostic.
  const NavLink = useNavigationLink();
  const renderHrefAnchor = (href: string, content: ReactNode, style?: CSSProperties) => {
    if (NavLink) {
      return (
        <NavLink href={href} style={style}>
          {content}
        </NavLink>
      );
    }
    return (
      <a href={href} style={style}>
        {content}
      </a>
    );
  };

  const breadcrumbItems = breadcrumb?.map((item, index) => ({
    key: String(index),
    label: item.href ? renderHrefAnchor(item.href, item.label) : item.label,
  }));
  const tabActiveBackground = getArchetypeTabActiveBackground(archetype);
  const visibleMetadata = metadata?.filter((item) => item.value) || [];

  return (
    <Box
      data-part="root"
      className="ds-structure ds-detail-header"
      style={{
        width: '100%',
        marginBottom: 24,
        overflow: 'hidden',
      }}
    >
      <Box
        data-part="top-bar"
        style={{
          padding: '12px 24px',
        }}
      >
        <Flex justify="between" align="center" gap={16} wrap="wrap">
          <Flex align="center" gap={16} wrap="wrap">
            {renderHrefAnchor(
              backHref,
              <Flex
                data-part="back-button"
                align="center"
                gap={8}
                style={{
                  padding: '7px 12px',
                }}
              >
                <ArrowLeftIcon data-part="back-icon" style={{ width: 14, height: 14 }} />
                <Text data-part="back-label" size="xs">
                  {resolvedBackLabel}
                </Text>
              </Flex>,
              { textDecoration: 'none' },
            )}

            {breadcrumbItems && breadcrumbItems.length > 0 ? (
              <>
                <Box data-part="breadcrumb-divider" style={{ width: 1, height: 18 }} />
                <Breadcrumb items={breadcrumbItems} />
              </>
            ) : null}
          </Flex>

          {actions.length > 0 ? (
            <Flex align="center" gap={8} wrap="wrap">
              {actions.map((action, index) => {
                const ActionIcon = resolveSharedHeaderActionIcon(action);

                return (
                  <Tooltip key={`${action.label}-${index}`} content={resolveSharedHeaderActionTooltip(action)}>
                    <Button
                      variant={resolveSharedHeaderActionVariant(action)}
                      size="sm"
                      icon={ActionIcon ? <ActionIcon style={{ width: 14, height: 14 }} /> : undefined}
                      onClick={action.onClick}
                      href={action.href}
                      loading={action.loading}
                      disabled={action.disabled}
                    >
                      {action.label}
                    </Button>
                  </Tooltip>
                );
              })}
            </Flex>
          ) : null}
        </Flex>
      </Box>

      <Box
        data-part="hero-panel"
        data-archetype={archetype}
        style={{
          padding: 28,
        }}
      >
        <Flex align="start" justify="between" gap={22} wrap="wrap">
          <Flex align="start" gap={18} style={{ minWidth: 0, flex: 1 }}>
            {avatar ? renderAvatarNode(avatar, title) : null}

            <Stack spacing="sm" style={{ minWidth: 0, flex: 1 }}>
              {eyebrow ? (
                <Text
                  data-part="eyebrow"
                  size="xs"
                  weight="bold"
                  style={{
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--ds-font-family-mono, monospace)',
                  }}
                >
                  {eyebrow}
                </Text>
              ) : null}

              <Flex align="center" gap={12} wrap="wrap">
                <Box
                  data-part="title"
                  data-archetype={archetype}
                  as="h1"
                  style={{
                    margin: 0,
                  }}
                >
                  {title}
                </Box>
                {status ? <Badge variant={status.variant}>{status.label}</Badge> : null}
              </Flex>

              {subtitle ? (
                <Text data-part="subtitle" size="sm" style={{ lineHeight: 1.65, maxWidth: 780 }}>
                  {subtitle}
                </Text>
              ) : null}

              {contextRail ? (
                <Box data-part="context-rail" style={{ marginTop: 2 }}>
                  {contextRail}
                </Box>
              ) : null}
            </Stack>
          </Flex>
        </Flex>

        {visibleMetadata.length > 0 || children ? (
          <Box
            data-part="metadata-card"
            style={{
              marginTop: 24,
              padding: '16px 18px 18px',
            }}
          >
            {visibleMetadata.length > 0 ? (
              <Flex gap={12} wrap="wrap">
                {visibleMetadata.map((item, index) => (
                  <Flex
                    data-part="metadata-chip"
                    key={`${item.label}-${index}`}
                    align="center"
                    gap={8}
                    style={{
                      minWidth: 0,
                      padding: '9px 12px',
                    }}
                  >
                    {item.icon ? <item.icon style={{ width: 14, height: 14 }} /> : null}
                    <Text
                      data-part="metadata-chip-label"
                      size="xs"
                      weight="bold"
                      style={{
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--ds-font-family-mono, monospace)',
                      }}
                    >
                      {item.label}
                    </Text>
                    <Text
                      data-part="metadata-chip-value"
                      size="sm"
                      weight="medium"
                      style={{
                        fontFamily: item.mono ? 'var(--ds-font-family-mono, monospace)' : undefined,
                        wordBreak: item.mono ? 'break-all' : 'break-word',
                      }}
                    >
                      {item.value}
                    </Text>
                  </Flex>
                ))}
              </Flex>
            ) : null}

            {children ? (
              <Box data-part="metadata-card-children" style={{ marginTop: visibleMetadata.length > 0 ? 18 : 0 }}>
                {children}
              </Box>
            ) : null}
          </Box>
        ) : null}
      </Box>

      {tabs && tabs.length > 0 ? (
        <Box
          data-part="tab-strip"
          role="tablist"
          aria-label={tabStripLabel}
          style={{
            padding: '10px 18px 0',
          }}
        >
          <Flex align="center" gap={10} wrap="wrap">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const TabIcon = tab.icon;

              // APG tab keyboard contract: Enter/Space activates; the arrow
              // keys (direction-aware under RTL), Home and End move focus
              // between tabs without activating them.
              const handleTabKeyDown = (event: ReactKeyboardEvent) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onTabChange?.(tab.id);
                  return;
                }
                const navKeys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
                if (!navKeys.includes(event.key)) {
                  return;
                }
                event.preventDefault();
                const currentTab = event.currentTarget as HTMLElement;
                const strip = currentTab.closest('[data-part="tab-strip"]');
                const stripTabs = Array.from(
                  strip?.querySelectorAll<HTMLElement>('[data-part="tab"]') ?? [],
                );
                const currentIndex = stripTabs.indexOf(currentTab);
                if (currentIndex < 0) {
                  return;
                }
                const rtl = Boolean(currentTab.closest('[dir="rtl"]'));
                let nextIndex = currentIndex;
                if (event.key === 'Home') {
                  nextIndex = 0;
                } else if (event.key === 'End') {
                  nextIndex = stripTabs.length - 1;
                } else {
                  const forward = event.key === 'ArrowRight' ? !rtl : rtl;
                  nextIndex =
                    (currentIndex + (forward ? 1 : -1) + stripTabs.length) % stripTabs.length;
                }
                stripTabs[nextIndex]?.focus();
              };

              return (
                <Box
                  data-part="tab"
                  data-active={isActive}
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => onTabChange?.(tab.id)}
                  onKeyDown={handleTabKeyDown}
                  style={{
                    cursor: 'pointer',
                    padding: '10px 12px 12px',
                    '--ds-detail-header-tab-active-bg': tabActiveBackground,
                  } as CSSProperties}
                >
                  <Flex align="center" gap={8}>
                    {TabIcon ? (
                      <TabIcon
                        data-part="tab-icon"
                        data-active={isActive}
                        style={{
                          width: 14,
                          height: 14,
                        }}
                      />
                    ) : null}
                    <Text
                      data-part="tab-label"
                      data-active={isActive}
                      size="sm"
                      weight={isActive ? 'medium' : undefined}
                    >
                      {tab.label}
                    </Text>
                    {tab.count !== undefined ? (
                      <Box
                        data-part="tab-count"
                        style={{
                          padding: '2px 6px',
                        }}
                      >
                        <Text data-part="tab-count-text" data-active={isActive} size="xs" weight="medium">
                          {tab.count}
                        </Text>
                      </Box>
                    ) : null}
                  </Flex>
                </Box>
              );
            })}
          </Flex>
        </Box>
      ) : null}
    </Box>
  );
}

export default DetailHeader;
