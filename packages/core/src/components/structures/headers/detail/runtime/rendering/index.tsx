'use client';

/**
 * @fileoverview DetailHeader shared rendering — the one DOM tree every engine
 * composes: back navigation, breadcrumb trail, hero identity cluster, status
 * badge, action rail, metadata region, optional tab strip and context rail.
 *
 * @description
 * DetailHeader is chrome, not a surface: it wraps the top of an entity-detail
 * page. The heavier `DetailSurface` is a full-page config object; this family
 * is only the header, composed by consumers with their own body content.
 *
 * The family stays domain-agnostic. All copy is consumer-supplied; the
 * component knows nothing about tenants, users, or any specific entity.
 *
 * PAINT OWNERSHIP: this file stamps parts and state only. All paint lives in
 * `presentation/components/skin/detail-header/index.css`, anchored on the root's
 * `ds-structure ds-detail-header` scope classes. The family is engine-free —
 * it composes engine-switched primitives, so one tree serves every engine.
 *
 * @module Structures/Headers/DetailHeader
 * @category Structure
 * @package @rottay/design-system
 */

import { type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';

import { NavigationBackIcon } from '@/graphics/icons/semantic/generated/roles/navigation-back';
import { partAttributes, useInteractionState } from '@/foundation/behavior';
import { Badge, Box, Breadcrumb, Button, Flex, Stack, Text, Tooltip } from '@/components/primitives';
import { useNavigationLink } from '@/infrastructure/runtime/adapters/presentation/react/navigation';
import {
  resolveSharedHeaderActionIcon,
  resolveSharedHeaderActionTooltip,
  resolveSharedHeaderActionVariant,
} from '@/components/patterns/foundation/header-actions';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

import type { DetailHeaderProps, DetailHeaderTab } from '../../contracts';

// Tab-active background is STATE-SELECTED in the skin: the root carries
// `data-archetype`, so per-archetype rules reach the sibling tab strip without
// any inline custom property.

// Hover and press on the back chip are decided once, by the shared
// interaction kernel, and read off `data-state`. The KEYBOARD ring is not:
// the focusable element is the anchor ABOVE the chip and the chip sits inside
// it, so focus events never propagate down to the chip's handlers — the same
// measurement the form/edit header contract recorded. `a:focus-visible` stays
// the platform's own (and only) authority there, stated in the skin where the
// rule is declared. The tabs ARE the focusable element, so their ring is
// kernel-decided and paired. The platform pseudo-classes remain in the skin
// as the fallback arm of each paired rule (F-37).

function renderAvatarNode(avatar: string | ReactNode) {
  if (typeof avatar === 'string') {
    if (avatar.startsWith('http') || avatar.startsWith('/')) {
      return (
        <Box data-part="avatar" data-variant="image">
          {/* The hero h1 carries the identity name one line away, so the
              portrait is decorative: an `alt` echoing the title made every
              screen reader announce the record twice. */}
          <img src={avatar} alt="" aria-hidden="true" />
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

function DetailTab({
  tab,
  isActive,
  onSelect,
}: {
  tab: DetailHeaderTab;
  isActive: boolean;
  onSelect: (tabId: string) => void;
}) {
  // The APG tab keyboard contract: Enter/Space activates; the arrow keys
  // (direction-aware under RTL), Home and End move focus between tabs without
  // activating them.
  const interaction = useInteractionState();
  const TabIcon = tab.icon;

  const handleTabKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(tab.id);
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
      {...interaction.handlers}
      {...partAttributes('tab', interaction.state)}
      data-active={isActive}
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={() => onSelect(tab.id)}
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
      {/* Selection rail: the state is a structural edge, not a
          background wash. */}
      <Box data-part="tab-rail" data-active={isActive} aria-hidden="true" />
    </Box>
  );
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
  className,
}: DetailHeaderProps) {
  const i18n = useOptionalTranslation('common');
  const resolvedBackLabel = backLabel ?? i18n?.tOr('back', 'Back') ?? 'Back';
  const tabStripLabel = i18n?.tOr('tabs', 'Tabs') ?? 'Tabs';
  const metadataRegionLabel = i18n?.tOr('details', 'Details') ?? 'Details';
  // Resolve the framework-specific Link component once. Falls back to a
  // native <a> tag when no NavigationLinkProvider is mounted, which keeps
  // the DS package framework-agnostic.
  const NavLink = useNavigationLink();
  const backInteraction = useInteractionState();
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
  const rootClassName = ['ds-structure', 'ds-detail-header', className]
    .filter(Boolean)
    .join(' ');

  return (
    <Box data-part="root" data-archetype={archetype} className={rootClassName}>
      <Box data-part="top-bar">
        <Flex justify="between" align="center" gap={16} wrap="wrap">
          <Flex align="center" gap={16} wrap="wrap">
            {renderHrefAnchor(
              backHref,
              <Flex
                {...backInteraction.handlers}
                {...partAttributes('back-button', backInteraction.state)}
                align="center"
                gap={8}
              >
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
              /* The trail is one addressable region so a narrow container can
                 retire the whole ancestor path in a single rule — hiding the
                 divider alone would leave a floating crumb list. */
              <Flex data-part="breadcrumb-trail" align="center" gap={16}>
                <Box data-part="breadcrumb-divider" />
                <Breadcrumb items={breadcrumbItems} />
              </Flex>
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
                      /* Icon geometry rides the Button's governed icon channel
                         (`--ds-button-sm-icon-size`), not an inline override —
                         the same contract the record action rail uses. */
                      icon={ActionIcon ? <ActionIcon /> : undefined}
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
        {/* The hero's accent stroke — where the tenant's
            `--ds-detail-hero-spine` lands. */}
        <Box data-part="hero-spine" aria-hidden="true" />

        <Flex align="start" justify="between" gap={22} wrap="wrap">
          <Flex data-part="hero-cluster" align="start" gap={18}>
            {avatar ? renderAvatarNode(avatar) : null}

            <Stack data-part="hero-copy" spacing="sm">
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
          /* The region is named for assistive technology: without it the
             label/value pairs read as a run of unrelated strings between the
             title and the tab strip. */
          <Box data-part="metadata-card" role="group" aria-label={metadataRegionLabel}>
            {visibleMetadata.length > 0 ? (
              <Flex gap={12} wrap="wrap">
                {visibleMetadata.map((item, index) => (
                  <Flex
                    data-part="metadata-chip"
                    key={`${item.label}-${index}`}
                    align="center"
                    gap={8}
                  >
                    {item.icon ? (
                      /* Icon frame drained from the retired inline 14px: the
                         skin owns the well and the glyph inherits
                         currentColor from the chip's muted ink. */
                      <Box data-part="metadata-chip-icon" aria-hidden>
                        <item.icon />
                      </Box>
                    ) : null}
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
          {/* Wrapping is skin-owned, not composed inline: a narrow container
              turns the lane from a wrapping stack of rows into one swipeable
              row, and an inline `flex-wrap` would outrank every engine. */}
          <Flex data-part="tab-list" align="center" gap={10}>
            {tabs.map((tab) => (
              <DetailTab
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onSelect={(tabId) => onTabChange?.(tabId)}
              />
            ))}
          </Flex>
        </Box>
      ) : null}
    </Box>
  );
}

DetailHeader.displayName = 'DetailHeader';

export default DetailHeader;
