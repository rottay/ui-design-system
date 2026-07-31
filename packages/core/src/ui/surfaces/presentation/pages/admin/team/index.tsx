'use client';

/**
 * @fileoverview TeamSurface -- team member management page.
 * @description Composes the member roster (table rows or a responsive card
 * grid), role assignment, invite and remove actions. The app owns CRUD
 * operations; this surface standardizes page composition, state handling and
 * action presentation.
 *
 * @remarks
 * Composition: PageShellSurface chrome + Card + Tag/Select/Button primitives +
 * the shared state kits (loading skeleton, empty, error with retry). Visible
 * copy resolves through `tSurfaceOr` under `surfaces.team.*` with an English
 * floor, and visual defaults cascade config -> product profile -> DS defaults
 * via `useSurfaceProfileDefaultsWithOverrides` (entrance animation, card
 * variant, section spacing, density).
 */

import React from 'react';
import { Box, Button, Card, Flex, Grid, Select, Stack, Tag, Text } from '../../../../../primitives';
import type { CardVariant } from '../../../../../primitives/display/Card/contracts';
import { FadeIn } from '@/graphics/motion';
import { AccessRoleIcon } from '@/graphics/icons/presentation/semantic/generated/roles/access-role';
import { ActionAddIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-add';
import { ActionDeleteIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-delete';
import { ActionEditIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-edit';
import { densityScopeAttributes } from '@/infrastructure/runtime/foundation/density';
import { useCollectionStagger } from '../../../../../patterns/foundation/motion';
import type { TeamMember, TeamSurfaceConfig } from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import { resolveStackSpacing } from '../../../../runtime/profile-defaults/personality';
import { useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import { SurfaceActionBar } from '../../../../runtime/helpers/rendering';
import {
  SurfaceEmptyState,
  SurfaceErrorState,
  SurfaceLoadingSkeleton,
} from '../../../../runtime/helpers/states';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';

export interface TeamSurfaceProps {
  config: TeamSurfaceConfig;
  loading?: boolean;
  /** Load/render failure surfaced as an error state (ListSurface prop precedent). */
  error?: unknown;
  /** Retry handler rendered inside the error state when provided. */
  onRetry?: () => void | Promise<void>;
}

/** `tSurfaceOr` signature shared by the member sub-components. */
type TSurfaceOr = (
  key: string,
  fallback: string,
  params?: Record<string, string | number>
) => string;

// Maps member status onto the semantic Tag tone channel (the previous
// `color=` prop expects a custom CSS color, so 'success'/'warning' rendered
// broken). 'invited' reads as warning because the member has not accepted
// yet, signaling an action may be needed; 'disabled' and unknown statuses
// share the neutral tone. The status string itself is app data rendered
// verbatim -- only its tone is mapped (integration idiom).
function statusTone(status: NonNullable<TeamMember['status']>): 'success' | 'warning' | 'neutral' {
  switch (status) {
    case 'active':
      return 'success';
    case 'invited':
      return 'warning';
    default:
      return 'neutral';
  }
}

function MemberIdentity({ member }: { member: TeamMember }): React.ReactElement {
  return (
    <Flex gap="md" align="center" minWidth={0} flex={1}>
      {member.avatar}
      {/*
        minWidth 0 lets the text column shrink below content width so long
        names/emails wrap (Typography already wraps anywhere globally) instead
        of overflowing the row -- the flex-row equivalent of minmax(0, 1fr).
      */}
      <Flex direction="column" gap="xs" minWidth={0}>
        <Text weight="semibold">{member.name}</Text>
        {/*
          The class is the pinned anatomy hook (SurfacesLongTailBatch) and
          stays as a pure landing target; the muted ink rides the Typography
          `color` channel (SU01/SU06 idiom).
        */}
        <Text className="ds-team__muted-text" size="sm" color="muted">
          {member.email}
        </Text>
      </Flex>
    </Flex>
  );
}

function MemberMeta({
  member,
  tSurfaceOr,
}: {
  member: TeamMember;
  tSurfaceOr: TSurfaceOr;
}): React.ReactElement {
  return (
    <>
      {member.joinedAt && (
        <Text className="ds-team__muted-text" size="xs" color="muted">
          {tSurfaceOr('team.member_joined', 'Joined {date}', { date: member.joinedAt })}
        </Text>
      )}
      {member.status && (
        <Tag tone={statusTone(member.status)} size="sm">
          {member.status}
        </Tag>
      )}
    </>
  );
}

function MemberRoleControl({
  member,
  config,
  tSurfaceOr,
}: {
  member: TeamMember;
  config: TeamSurfaceConfig;
  tSurfaceOr: TSurfaceOr;
}): React.ReactElement {
  // When onRoleChange is provided the role displays as an editable dropdown;
  // otherwise it renders as static text. This dual rendering avoids showing a
  // dropdown the user cannot interact with.
  if (!config.behavior.onRoleChange) {
    // Fall back to the role label from the roles list; if not found (stale
    // data), show the raw role id as last resort.
    return (
      <Text className="ds-team__muted-text" size="sm" color="muted">
        {config.behavior.roles.find((role) => role.id === member.role)?.label ?? member.role}
      </Text>
    );
  }
  return (
    <Select
      className="ds-team__role-select"
      aria-label={tSurfaceOr('team.role_select_aria', 'Role for {name}', { name: member.name })}
      value={member.role}
      onChange={(value) => config.behavior.onRoleChange?.(member.id, String(value))}
      options={config.behavior.roles.map((role) => ({ label: role.label, value: role.id }))}
      size="sm"
    />
  );
}

function MemberActions({
  member,
  config,
  tSurfaceOr,
}: {
  member: TeamMember;
  config: TeamSurfaceConfig;
  tSurfaceOr: TSurfaceOr;
}): React.ReactElement | null {
  const { onEditMember, onRemove } = config.behavior;
  if (!onEditMember && !onRemove) return null;
  return (
    <Flex gap="xs" align="center">
      {onEditMember && (
        <Button
          variant="ghost"
          size="sm"
          icon={<ActionEditIcon decorative size={15} />}
          onClick={() => onEditMember(member.id)}
        >
          {tSurfaceOr('team.action_edit', 'Edit')}
        </Button>
      )}
      {onRemove && (
        <Button
          variant="danger"
          size="sm"
          icon={<ActionDeleteIcon decorative size={15} />}
          onClick={() => onRemove(member.id)}
        >
          {tSurfaceOr('team.action_remove', 'Remove')}
        </Button>
      )}
    </Flex>
  );
}

function MemberRow({
  member,
  config,
  tSurfaceOr,
  staggerItem,
  staggerIndex,
}: {
  member: TeamMember;
  config: TeamSurfaceConfig;
  tSurfaceOr: TSurfaceOr;
  staggerItem: boolean;
  staggerIndex: number;
}): React.ReactElement {
  return (
    <Flex
      className="ds-team__divider"
      role="listitem"
      justify="between"
      align="center"
      gap="md"
      wrap="wrap"
      data-ds-stagger-item={staggerItem ? '' : undefined}
      // Sanctioned custom-property passthrough: the stagger index is
      // per-instance choreography data consumed by the collection-stagger
      // preset, not paint (data/list idiom).
      style={
        staggerItem
          ? ({ '--ds-stagger-index': staggerIndex } as React.CSSProperties)
          : undefined
      }
    >
      <MemberIdentity member={member} />
      <Flex gap="md" align="center" wrap="wrap">
        <MemberMeta member={member} tSurfaceOr={tSurfaceOr} />
        <MemberRoleControl member={member} config={config} tSurfaceOr={tSurfaceOr} />
        <MemberActions member={member} config={config} tSurfaceOr={tSurfaceOr} />
      </Flex>
    </Flex>
  );
}

function MemberCard({
  member,
  config,
  cardVariant,
  tSurfaceOr,
  staggerItem,
  staggerIndex,
}: {
  member: TeamMember;
  config: TeamSurfaceConfig;
  cardVariant: CardVariant;
  tSurfaceOr: TSurfaceOr;
  staggerItem: boolean;
  staggerIndex: number;
}): React.ReactElement {
  return (
    <Card
      className="ds-team__member-card"
      variant={cardVariant}
      data-ds-stagger-item={staggerItem ? '' : undefined}
      style={
        staggerItem
          ? ({ '--ds-stagger-index': staggerIndex } as React.CSSProperties)
          : undefined
      }
    >
      <Card.Body>
        <Stack spacing="md">
          <MemberIdentity member={member} />
          {(member.joinedAt || member.status) && (
            <Flex gap="sm" align="center" wrap="wrap">
              <MemberMeta member={member} tSurfaceOr={tSurfaceOr} />
            </Flex>
          )}
          <Flex justify="between" align="center" gap="md" wrap="wrap">
            <MemberRoleControl member={member} config={config} tSurfaceOr={tSurfaceOr} />
            <MemberActions member={member} config={config} tSurfaceOr={tSurfaceOr} />
          </Flex>
        </Stack>
      </Card.Body>
    </Card>
  );
}

export function TeamSurface({
  config,
  loading = false,
  error,
  onRetry,
}: TeamSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(config.visual?.profileOverrides);
  const { isMobile } = useSurfaceResponsiveLayout();
  const { tSurfaceOr } = useSurfaceTranslations();
  const members = config.behavior.members;
  const hasMembers = members.length > 0;
  const layout = config.visual.layout ?? 'table';
  const isCompact = profileDefaults.density === 'compact';
  const stagger = useCollectionStagger(members.length);
  const applyStagger = profileDefaults.animateEntrance && stagger.animated && !loading && hasMembers;
  const chrome = {
    ...config.presentation.chrome,
    // `??` keeps the chrome's own maxWidth when the visual slot is absent --
    // the old spread always overwrote it with undefined.
    maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
  };

  // Invite is rendered alongside the generic actions when the app provides
  // the handler. It always appears first (primary prominence) because
  // inviting new members is the highest-value action on a team page.
  const actionsNode = config.behavior.onInvite ? (
    <Flex gap="sm" wrap="wrap" justify="end">
      <Button
        variant="primary"
        size="sm"
        icon={<ActionAddIcon decorative size={15} />}
        onClick={config.behavior.onInvite}
      >
        {tSurfaceOr('team.action_invite', 'Invite Member')}
      </Button>
      <SurfaceActionBar actions={config.behavior.actions} access={config.access} />
    </Flex>
  ) : (
    <SurfaceActionBar actions={config.behavior.actions} access={config.access} />
  );

  // Error keeps the real page chrome and action bar so a retry never loses
  // context (ListSurface precedent). The shared contract stays untouched:
  // error/onRetry arrive as component props, like ListSurface/AuditSurface.
  if (error) {
    return (
      <PageShellSurface chrome={chrome} actions={actionsNode} loading={false}>
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  const renderMember = (member: TeamMember, index: number) => {
    // Custom member renderers keep their Box landing seam (pre-existing
    // contract escape hatch); the stagger index still lands so a mixed roster
    // choreographs like the stock rows/cards.
    if (config.presentation.renderMember) {
      return (
        <Box
          key={member.id}
          role={layout === 'table' ? 'listitem' : undefined}
          data-ds-stagger-item={applyStagger ? '' : undefined}
          style={
            applyStagger
              ? ({ '--ds-stagger-index': index } as React.CSSProperties)
              : undefined
          }
        >
          {config.presentation.renderMember(member)}
        </Box>
      );
    }
    return layout === 'cards' ? (
      <MemberCard
        key={member.id}
        member={member}
        config={config}
        cardVariant={profileDefaults.cardVariant}
        tSurfaceOr={tSurfaceOr}
        staggerItem={applyStagger}
        staggerIndex={index}
      />
    ) : (
      <MemberRow
        key={member.id}
        member={member}
        config={config}
        tSurfaceOr={tSurfaceOr}
        staggerItem={applyStagger}
        staggerIndex={index}
      />
    );
  };

  /*
    Loading keeps the real page chrome and renders a roster-shaped body
    skeleton inside the same card frame the loaded table uses:
    PatternPageShell's `loading` early return never renders children, so a
    structural skeleton can only exist here. Row count scales with density to
    mirror the final roster footprint and avoid layout shift.
  */
  const contentBody = loading ? (
    <Card variant={profileDefaults.cardVariant}>
      <Card.Body>
        <SurfaceLoadingSkeleton rows={isCompact ? 8 : 5} />
      </Card.Body>
    </Card>
  ) : !hasMembers ? (
    <Card variant={profileDefaults.cardVariant}>
      <Card.Body>
        {config.presentation.emptyState ?? (
          <SurfaceEmptyState
            title={tSurfaceOr('team.empty_title', 'No team members')}
            description={tSurfaceOr(
              'team.empty_description',
              'Invite your first team member to get started.'
            )}
            icon={<AccessRoleIcon decorative size={32} />}
          />
        )}
      </Card.Body>
    </Card>
  ) : layout === 'cards' ? (
    <Grid
      className={applyStagger ? stagger.containerClassName : undefined}
      style={
        applyStagger
          ? ({
              '--ds-stagger-step': stagger.stepCss,
              '--ds-stagger-max': stagger.maxCss,
            } as React.CSSProperties)
          : undefined
      }
      // auto-fit collapses empty tracks; min(100%, ...) keeps the minimum
      // from overflowing narrow viewports. The card minimum is private
      // implementation geometry (see team.css), never a public --ds-* channel.
      templateColumns="repeat(auto-fit, minmax(min(100%, var(--_ds-team-card-min-inline-size, 16rem)), 1fr))"
      gap="lg"
    >
      {members.map(renderMember)}
    </Grid>
  ) : (
    <Card variant={profileDefaults.cardVariant}>
      <Card.Body>
        <Stack
          spacing="none"
          role="list"
          aria-label={tSurfaceOr('team.members_list_aria', 'Team members')}
          className={applyStagger ? stagger.containerClassName : undefined}
          style={
            applyStagger
              ? ({
                  '--ds-stagger-step': stagger.stepCss,
                  '--ds-stagger-max': stagger.maxCss,
                } as React.CSSProperties)
              : undefined
          }
        >
          {members.map(renderMember)}
        </Stack>
      </Card.Body>
    </Card>
  );

  const teamContent = (
    <Stack
      className={`ds-surface ds-team ds-team--${hasMembers ? 'populated' : 'empty'}`}
      data-part="root"
      data-layout={layout}
      data-mobile={isMobile ? 'true' : 'false'}
      data-loading={loading ? 'true' : 'false'}
      {...densityScopeAttributes(profileDefaults.density)}
      aria-busy={loading}
      spacing={resolveStackSpacing(profileDefaults.sectionSpacing)}
    >
      {contentBody}
    </Stack>
  );

  return (
    <PageShellSurface chrome={chrome} actions={actionsNode} loading={false}>
      {profileDefaults.animateEntrance ? (
        <FadeIn durationMs={profileDefaults.entranceDuration}>{teamContent}</FadeIn>
      ) : (
        teamContent
      )}
    </PageShellSurface>
  );
}
