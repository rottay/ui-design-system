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

import { type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';

import { NavigationBackIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-back';
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

// Tab-active background is STATE-SELECTED in the skin: the root carries
// `data-archetype`, so per-archetype rules reach the sibling tab strip without
// any inline custom property (the root stamp replaced the old JS ternary).

function renderAvatarNode(avatar: string | ReactNode, title: string) {
  if (typeof avatar === 'string') {
    if (avatar.startsWith('http') || avatar.startsWith('/')) {
      return (
        <Box data-part="avatar" data-variant="image">
          <img src={avatar} alt={title} />
        </Box>
      );
    }

    return (
      <Box data-part="avatar" data-variant="initials">
        <Text data-part="avatar-initials">{avatar}</Text>
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
  const renderHrefAnchor = (href: string, content: ReactNode) => {
    if (NavLink) {
      return <NavLink href={href}>{content}</NavLink>;
    }
    return <a href={href}>{content}</a>;
  };

  const breadcrumbItems = breadcrumb?.map((item, index) => ({
    key: String(index),
    label: item.href ? renderHrefAnchor(item.href, item.label) : item.label,
  }));
  const visibleMetadata = metadata?.filter((item) => item.value) || [];

  return (
    <Box data-part="root" data-archetype={archetype} className="ds-structure ds-detail-header">
      <Box data-part="top-bar">
        <Flex justify="between" align="center" gap={16} wrap="wrap">
          <Flex align="center" gap={16} wrap="wrap">
            {renderHrefAnchor(
              backHref,
              <Flex data-part="back-button" align="center" gap={8}>
                {/* Governed semantic role (autoMirror: the arrow flips in
                    RTL); the retired catalog ArrowLeftIcon carried no
                    mirroring contract. The chip's visible label makes the
                    glyph decorative. */}
                <NavigationBackIcon data-part="back-icon" decorative size={14} />
                <Text data-part="back-label" size="xs" color="secondary">
                  {resolvedBackLabel}
                </Text>
              </Flex>,
            )}

            {breadcrumbItems && breadcrumbItems.length > 0 ? (
              <>
                <Box data-part="breadcrumb-divider" />
                <Breadcrumb items={breadcrumbItems} />
              </>
            ) : null}
          </Flex>

          {actions.length > 0 ? (
            <Flex data-part="actions" align="center" gap={8} wrap="wrap">
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

      <Box data-part="hero-panel" data-archetype={archetype}>
        <Flex align="start" justify="between" gap={22} wrap="wrap">
          <Flex align="start" gap={18} style={{ minWidth: 0, flex: 1 }}>
            {avatar ? renderAvatarNode(avatar, title) : null}

            <Stack spacing="sm" style={{ minWidth: 0, flex: 1 }}>
              {eyebrow ? (
                <Text data-part="eyebrow" size="xs" weight="bold" color="subtle">
                  {eyebrow}
                </Text>
              ) : null}

              <Flex align="center" gap={12} wrap="wrap">
                <Box data-part="title" data-archetype={archetype} as="h1">
                  {title}
                </Box>
                {status ? <Badge variant={status.variant}>{status.label}</Badge> : null}
              </Flex>

              {subtitle ? (
                <Text data-part="subtitle" size="sm" color="secondary">
                  {subtitle}
                </Text>
              ) : null}

              {contextRail ? <Box data-part="context-rail">{contextRail}</Box> : null}
            </Stack>
          </Flex>
        </Flex>

        {visibleMetadata.length > 0 || children ? (
          <Box data-part="metadata-card">
            {visibleMetadata.length > 0 ? (
              <Flex gap={12} wrap="wrap">
                {visibleMetadata.map((item, index) => (
                  <Flex
                    data-part="metadata-chip"
                    key={`${item.label}-${index}`}
                    align="center"
                    gap={8}
                  >
                    {item.icon ? <item.icon style={{ width: 14, height: 14 }} /> : null}
                    <Text data-part="metadata-chip-label" size="xs" weight="bold" color="subtle">
                      {item.label}
                    </Text>
                    <Text
                      data-part="metadata-chip-value"
                      data-mono={item.mono ? 'true' : 'false'}
                      size="sm"
                      weight="medium"
                    >
                      {item.value}
                    </Text>
                  </Flex>
                ))}
              </Flex>
            ) : null}

            {children ? (
              <Box data-part="metadata-card-children">{children}</Box>
            ) : null}
          </Box>
        ) : null}
      </Box>

      {tabs && tabs.length > 0 ? (
        <Box data-part="tab-strip" role="tablist" aria-label={tabStripLabel}>
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
                >
                  <Flex align="center" gap={8}>
                    {TabIcon ? <TabIcon data-part="tab-icon" data-active={isActive} /> : null}
                    <Text
                      data-part="tab-label"
                      data-active={isActive}
                      size="sm"
                      weight={isActive ? 'medium' : undefined}
                      color={isActive ? undefined : 'secondary'}
                    >
                      {tab.label}
                    </Text>
                    {tab.count !== undefined ? (
                      <Box data-part="tab-count">
                        <Text data-part="tab-count-text" data-active={isActive} size="xs" weight="medium" color={isActive ? undefined : 'secondary'}>
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
