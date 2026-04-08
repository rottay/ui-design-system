'use client';

/**
 * @fileoverview DetailHeader pattern -- premium detail-page header with
 * back navigation, breadcrumb trail, hero title cluster, status badge,
 * action rail, optional metadata strip, optional tab strip, and
 * optional context-rail slot.
 *
 * @description
 * Engine-free pattern for premium entity-detail pages. Pairs with the
 * `SurfaceReadField` / `SurfaceFieldGrid` / `PremiumFormSections` body
 * patterns to compose a full detail screen.
 *
 * Different from the heavier DS `DetailSurface` pattern: DetailSurface
 * is a full-page detail container with EntityAdapter + tabs + sidebar +
 * footer + breadcrumbs + a config-driven API. DetailHeader is just the
 * header chrome -- consumers compose it with their own body content.
 * Use this when you want premium header chrome without committing to
 * the EntityAdapter / config pattern.
 *
 * Features:
 *   - Back button (uses NavigationLinkProvider Link adapter when
 *     mounted, falls back to native `<a>`)
 *   - Breadcrumb trail (uses NavigationLinkProvider Link adapter for
 *     items with hrefs)
 *   - Hero title cluster: optional eyebrow chip, title, optional
 *     status badge, optional subtitle, optional context-rail slot
 *   - Optional avatar (string for URL or initials, or any ReactNode)
 *   - Action rail with structured DetailHeaderAction[] (uses
 *     header-actions semantic vocabulary from DS)
 *   - Optional metadata strip (label/value pairs with optional icon
 *     and monospace mode)
 *   - Optional children slot inside the metadata card
 *   - Optional tab strip with active state, count badge, and icon
 *   - 4 archetype variants (control, editorial, technical, governance)
 *     each with their own gradient + grid background pattern
 *
 * The pattern stays domain-agnostic. All copy is consumer-supplied;
 * the component knows nothing about tenants, users, or any specific
 * entity. Status badge variants follow the same DS Badge vocabulary.
 */

import { type CSSProperties, type ReactNode } from 'react';

import { ArrowLeft, type LucideIcon } from 'lucide-react';

import { Badge, Box, Breadcrumb, Button, Flex, Stack, Text, Tooltip } from '../../primitives';
import { useNavigationLink } from '../../../runtime/navigation';
import {
  type SharedHeaderActionKind,
  resolveSharedHeaderActionIcon,
  resolveSharedHeaderActionTooltip,
  resolveSharedHeaderActionVariant,
} from '../header-actions';

export type DetailHeaderArchetype = 'editorial' | 'control' | 'technical' | 'governance';

export interface DetailHeaderAction {
  label: string;
  kind?: SharedHeaderActionKind;
  icon?: LucideIcon;
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
  icon?: LucideIcon;
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
  metadata?: Array<{ label: string; value: string; icon?: LucideIcon; mono?: boolean }>;
  eyebrow?: string;
  archetype?: DetailHeaderArchetype;
  contextRail?: ReactNode;
  children?: ReactNode;
}

const sharedBorder = 'var(--ds-color-border-secondary)';
const sharedTextMuted = 'var(--ds-color-text-muted)';
const sharedTextSecondary = 'var(--ds-color-text-secondary)';
const sharedTextPrimary = 'var(--ds-color-text-primary)';

function getArchetypeStyles(archetype: DetailHeaderArchetype) {
  switch (archetype) {
    case 'editorial':
      return {
        accent: 'color-mix(in srgb, var(--ds-color-text-primary) 14%, transparent)',
        accentSecondary: 'color-mix(in srgb, var(--ds-color-text-secondary) 9%, transparent)',
        gridColor: 'color-mix(in srgb, var(--ds-color-text-muted) 24%, transparent)',
        gridSize: 26,
        heroBackground: 'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-secondary) 84%, transparent) 0%, color-mix(in srgb, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%, transparent) 100%)',
        fadeMask: 'linear-gradient(180deg, transparent 0%, transparent 40%, color-mix(in srgb, var(--ds-surface-card, var(--ds-color-bg-elevated)) 52%, transparent) 100%)',
        tabActiveBackground: 'color-mix(in srgb, var(--ds-color-bg-primary) 32%, transparent)',
      };
    case 'technical':
      return {
        accent: 'color-mix(in srgb, var(--ds-color-text-secondary) 16%, transparent)',
        accentSecondary: 'color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent)',
        gridColor: 'color-mix(in srgb, var(--ds-color-text-muted) 28%, transparent)',
        gridSize: 22,
        heroBackground: 'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-secondary) 82%, transparent) 0%, color-mix(in srgb, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%, transparent) 100%)',
        fadeMask: 'linear-gradient(180deg, transparent 0%, transparent 38%, color-mix(in srgb, var(--ds-surface-card, var(--ds-color-bg-elevated)) 54%, transparent) 100%)',
        tabActiveBackground: 'color-mix(in srgb, var(--ds-color-bg-primary) 36%, transparent)',
      };
    case 'governance':
      return {
        accent: 'color-mix(in srgb, var(--ds-color-text-primary) 14%, transparent)',
        accentSecondary: 'color-mix(in srgb, var(--ds-color-text-secondary) 8%, transparent)',
        gridColor: 'color-mix(in srgb, var(--ds-color-text-muted) 24%, transparent)',
        gridSize: 24,
        heroBackground: 'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-secondary) 84%, transparent) 0%, color-mix(in srgb, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%, transparent) 100%)',
        fadeMask: 'linear-gradient(180deg, transparent 0%, transparent 42%, color-mix(in srgb, var(--ds-surface-card, var(--ds-color-bg-elevated)) 52%, transparent) 100%)',
        tabActiveBackground: 'color-mix(in srgb, var(--ds-color-bg-primary) 42%, transparent)',
      };
    case 'control':
    default:
      return {
        accent: 'color-mix(in srgb, var(--ds-color-text-secondary) 15%, transparent)',
        accentSecondary: 'color-mix(in srgb, var(--ds-color-text-primary) 7%, transparent)',
        gridColor: 'color-mix(in srgb, var(--ds-color-text-muted) 22%, transparent)',
        gridSize: 28,
        heroBackground: 'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-secondary) 86%, transparent) 0%, color-mix(in srgb, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%, transparent) 100%)',
        fadeMask: 'linear-gradient(180deg, transparent 0%, transparent 42%, color-mix(in srgb, var(--ds-surface-card, var(--ds-color-bg-elevated)) 52%, transparent) 100%)',
        tabActiveBackground: 'color-mix(in srgb, var(--ds-color-bg-primary) 28%, transparent)',
      };
  }
}

function buildPatternStyle(archetype: DetailHeaderArchetype): CSSProperties {
  const tone = getArchetypeStyles(archetype);

  return {
    backgroundImage: [
      `radial-gradient(circle at 12% 16%, ${tone.accent} 0%, transparent 48%)`,
      `radial-gradient(circle at 84% 2%, ${tone.accentSecondary} 0%, transparent 32%)`,
      `radial-gradient(circle at 72% 100%, color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent) 0%, transparent 42%)`,
      'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent) 0%, transparent 28%)',
      tone.fadeMask,
      tone.heroBackground,
      `linear-gradient(${tone.gridColor} 1px, transparent 1px)`,
      `linear-gradient(90deg, ${tone.gridColor} 1px, transparent 1px)`,
    ].join(', '),
    backgroundSize: [
      '100% 100%',
      '100% 100%',
      '100% 100%',
      '100% 100%',
      '100% 100%',
      '100% 100%',
      `${tone.gridSize}px ${tone.gridSize}px`,
      `${tone.gridSize}px ${tone.gridSize}px`,
    ].join(', '),
    backgroundPosition: '0 0, 0 0, 0 0, 0 0, 0 0, 0 0, 0 0, 0 0',
  };
}

function renderAvatarNode(avatar: string | ReactNode, title: string) {
  if (typeof avatar === 'string') {
    if (avatar.startsWith('http') || avatar.startsWith('/')) {
      return (
        <Box
          style={{
            width: 68,
            height: 68,
            borderRadius: 18,
            overflow: 'hidden',
            border: `1px solid ${sharedBorder}`,
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
        style={{
          width: 68,
          height: 68,
          borderRadius: 18,
          background: 'color-mix(in srgb, var(--ds-color-bg-secondary) 88%, transparent)',
          border: `1px solid ${sharedBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: 700, color: sharedTextPrimary }}>{avatar}</Text>
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
  backLabel = 'Back',
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
  const archetypeTone = getArchetypeStyles(archetype);
  const visibleMetadata = metadata?.filter((item) => item.value) || [];

  return (
    <Box
      style={{
        width: '100%',
        background: 'var(--ds-surface-card, var(--ds-color-bg-elevated))',
        border: `1px solid ${sharedBorder}`,
        borderRadius: 22,
        marginBottom: 24,
        overflow: 'hidden',
        boxShadow: '0 14px 36px color-mix(in srgb, var(--ds-color-text-primary) 10%, transparent)',
      }}
    >
      <Box
        style={{
          padding: '12px 24px',
          borderBottom: `1px solid ${sharedBorder}`,
          background: 'color-mix(in srgb, var(--ds-color-bg-secondary) 94%, transparent)',
        }}
      >
        <Flex justify="between" align="center" gap={16} wrap="wrap">
          <Flex align="center" gap={16} wrap="wrap">
            {renderHrefAnchor(
              backHref,
              <Flex
                align="center"
                gap={8}
                style={{
                  padding: '7px 12px',
                  border: `1px solid ${sharedBorder}`,
                  borderRadius: 11,
                  background: 'transparent',
                }}
              >
                <ArrowLeft style={{ width: 14, height: 14, color: sharedTextSecondary }} />
                <Text size="xs" style={{ color: sharedTextSecondary }}>
                  {backLabel}
                </Text>
              </Flex>,
              { textDecoration: 'none' },
            )}

            {breadcrumbItems && breadcrumbItems.length > 0 ? (
              <>
                <Box style={{ width: 1, height: 18, background: sharedBorder }} />
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
        style={{
          padding: 28,
          ...buildPatternStyle(archetype),
        }}
      >
        <Flex align="start" justify="between" gap={22} wrap="wrap">
          <Flex align="start" gap={18} style={{ minWidth: 0, flex: 1 }}>
            {avatar ? renderAvatarNode(avatar, title) : null}

            <Stack spacing="sm" style={{ minWidth: 0, flex: 1 }}>
              {eyebrow ? (
                <Text
                  size="xs"
                  weight="bold"
                  style={{
                    color: sharedTextMuted,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--ds-font-family-mono, monospace)',
                  }}
                >
                  {eyebrow}
                </Text>
              ) : null}

              <Flex align="center" gap={12} wrap="wrap">
                <Text
                  style={{
                    fontSize: archetype === 'editorial' ? 34 : archetype === 'technical' ? 30 : 32,
                    fontWeight: 720,
                    letterSpacing: '-0.04em',
                    lineHeight: 1.02,
                    color: sharedTextPrimary,
                  }}
                >
                  {title}
                </Text>
                {status ? <Badge variant={status.variant}>{status.label}</Badge> : null}
              </Flex>

              {subtitle ? (
                <Text size="sm" style={{ color: sharedTextSecondary, lineHeight: 1.65, maxWidth: 780 }}>
                  {subtitle}
                </Text>
              ) : null}

              {contextRail ? (
                <Box style={{ marginTop: 2 }}>
                  {contextRail}
                </Box>
              ) : null}
            </Stack>
          </Flex>
        </Flex>

        {visibleMetadata.length > 0 || children ? (
          <Box
            style={{
              marginTop: 24,
              padding: '16px 18px 18px',
              borderRadius: 18,
              border: `1px solid ${sharedBorder}`,
              background: 'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-secondary) 58%, transparent) 0%, color-mix(in srgb, var(--ds-color-bg-secondary) 74%, transparent) 100%)',
              backgroundImage: [
                'radial-gradient(circle at 18% 0%, color-mix(in srgb, var(--ds-color-text-primary) 7%, transparent) 0%, transparent 34%)',
                'radial-gradient(circle at 82% 100%, color-mix(in srgb, var(--ds-color-text-secondary) 6%, transparent) 0%, transparent 36%)',
                'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-secondary) 54%, transparent) 0%, color-mix(in srgb, var(--ds-color-bg-secondary) 74%, transparent) 100%)',
                'linear-gradient(color-mix(in srgb, var(--ds-color-text-muted) 15%, transparent) 1px, transparent 1px)',
                'linear-gradient(90deg, color-mix(in srgb, var(--ds-color-text-muted) 15%, transparent) 1px, transparent 1px)',
              ].join(', '),
              backgroundSize: '100% 100%, 100% 100%, 100% 100%, 24px 24px, 24px 24px',
              backgroundPosition: '0 0, 0 0, 0 0, 0 0, 0 0',
              boxShadow: 'inset 0 1px 0 color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {visibleMetadata.length > 0 ? (
              <Flex gap={12} wrap="wrap">
                {visibleMetadata.map((item, index) => (
                  <Flex
                    key={`${item.label}-${index}`}
                    align="center"
                    gap={8}
                    style={{
                      minWidth: 0,
                      padding: '9px 12px',
                      borderRadius: 14,
                      border: `1px solid ${sharedBorder}`,
                      background: 'color-mix(in srgb, var(--ds-color-bg-secondary) 58%, transparent)',
                    }}
                  >
                    {item.icon ? <item.icon style={{ width: 14, height: 14, color: sharedTextMuted }} /> : null}
                    <Text
                      size="xs"
                      weight="bold"
                      style={{
                        color: sharedTextMuted,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--ds-font-family-mono, monospace)',
                      }}
                    >
                      {item.label}
                    </Text>
                    <Text
                      size="sm"
                      weight="medium"
                      style={{
                        color: sharedTextPrimary,
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
              <Box style={{ marginTop: visibleMetadata.length > 0 ? 18 : 0 }}>
                {children}
              </Box>
            ) : null}
          </Box>
        ) : null}
      </Box>

      {tabs && tabs.length > 0 ? (
        <Box
          style={{
            borderTop: `1px solid ${sharedBorder}`,
            padding: '10px 18px 0',
            background: 'color-mix(in srgb, var(--ds-color-bg-secondary) 96%, transparent)',
          }}
        >
          <Flex align="center" gap={10} wrap="wrap">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const TabIcon = tab.icon;

              return (
                <Box
                  key={tab.id}
                  onClick={() => onTabChange?.(tab.id)}
                  style={{
                    cursor: 'pointer',
                    padding: '10px 12px 12px',
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    border: isActive ? `1px solid ${sharedBorder}` : '1px solid transparent',
                    borderBottom: 'none',
                    background: isActive ? archetypeTone.tabActiveBackground : 'transparent',
                    transition: 'background 160ms ease, border-color 160ms ease, transform 160ms ease',
                    transform: `translateY(${isActive ? 1 : 0}px)`,
                  }}
                >
                  <Flex align="center" gap={8}>
                    {TabIcon ? (
                      <TabIcon
                        style={{
                          width: 14,
                          height: 14,
                          color: isActive ? sharedTextPrimary : sharedTextMuted,
                        }}
                      />
                    ) : null}
                    <Text
                      size="sm"
                      weight={isActive ? 'medium' : undefined}
                      style={{ color: isActive ? sharedTextPrimary : sharedTextSecondary }}
                    >
                      {tab.label}
                    </Text>
                    {tab.count !== undefined ? (
                      <Box
                        style={{
                          padding: '2px 6px',
                          borderRadius: 999,
                          background: 'color-mix(in srgb, var(--ds-color-bg-primary) 36%, transparent)',
                        }}
                      >
                        <Text size="xs" weight="medium" style={{ color: isActive ? sharedTextPrimary : sharedTextSecondary }}>
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
