'use client';

/**
 * @fileoverview TeamSurface -- team member management page.
 * @description Composes member list (table or card layout), role assignment, invite,
 * and remove actions. The app owns CRUD operations; this surface standardizes
 * the page composition and action presentation.
 */

import React from 'react';
import { Box, Button, Card, Flex, Select, Stack, Tag, Text } from '../../../../primitives';
import type { TeamSurfaceConfig, TeamMember } from '../../../foundation/types';
import { PageShellSurface } from '../../../layout/page-shell';
import { SurfaceActionBar } from '../../../foundation/shared';
import { SurfaceEmptyState } from '../../../foundation/states';

export interface TeamSurfaceProps {
  config: TeamSurfaceConfig;
  loading?: boolean;
}

// Maps member status to tag colors. 'invited' uses warning (amber) because
// these members have not yet accepted, signaling an action may be needed.
// 'disabled' and unknown statuses share the neutral default color.
function statusColor(status?: TeamMember['status']): string {
  switch (status) {
    case 'active':
      return 'success';
    case 'invited':
      return 'warning';
    case 'disabled':
      return 'default';
    default:
      return 'default';
  }
}

function MemberRow({
  member,
  config,
}: {
  member: TeamMember;
  config: TeamSurfaceConfig;
}): React.ReactElement {
  return (
    <Flex
      className="ds-team__divider"
      justify="between"
      align="center"
      style={{ padding: '12px 0' }}
    >
      <Flex gap={12} align="center" style={{ flex: 1 }}>
        {member.avatar}
        <Stack spacing="xs">
          <Text style={{ fontWeight: 600 }}>{member.name}</Text>
          <Text
            className="ds-team__muted-text"
            data-part="muted-text"
            style={{ fontSize: 13 }}
          >
            {member.email}
          </Text>
        </Stack>
      </Flex>

      <Flex gap={12} align="center">
        {member.status && (
          <Tag color={statusColor(member.status)}>{member.status}</Tag>
        )}

        {/* When onRoleChange is provided the role displays as an editable
            dropdown; otherwise it renders as static text. This dual rendering
            avoids showing a dropdown the user cannot interact with. */}
        {config.behavior.onRoleChange ? (
          <Select
            value={member.role}
            onChange={(value: any) => config.behavior.onRoleChange?.(member.id, String(value))}
            options={config.behavior.roles.map((r) => ({ label: r.label, value: r.id }))}
            style={{ minWidth: 120 }}
            size="sm"
          />
        ) : (
          // Fall back to the role label from the roles list; if not found
          // (stale data), show the raw role id as last resort.
          <Text
            className="ds-team__muted-text"
            data-part="muted-text"
            style={{ fontSize: 13 }}
          >
            {config.behavior.roles.find((r) => r.id === member.role)?.label ?? member.role}
          </Text>
        )}

        <Flex gap={4}>
          {config.behavior.onEditMember && (
            <Button variant="ghost" size="sm" onClick={() => config.behavior.onEditMember?.(member.id)}>
              <Text>Edit</Text>
            </Button>
          )}
          {config.behavior.onRemove && (
            <Button variant="danger" size="sm" onClick={() => config.behavior.onRemove?.(member.id)}>
              <Text>Remove</Text>
            </Button>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}

export function TeamSurface({
  config,
  loading = false,
}: TeamSurfaceProps): React.ReactElement {
  // Invite button is rendered alongside generic actions when the app provides
  // the handler. It always appears first (primary prominence) because
  // inviting new members is the highest-value action on a team page.
  const inviteAction = config.behavior.onInvite ? (
    <Flex gap={8} wrap="wrap" justify="end">
      <Button variant="primary" size="sm" onClick={config.behavior.onInvite}>
        <Text>Invite Member</Text>
      </Button>
      <SurfaceActionBar actions={config.behavior.actions} permissions={config.permissions} />
    </Flex>
  ) : (
    <SurfaceActionBar actions={config.behavior.actions} permissions={config.permissions} />
  );

  return (
    <PageShellSurface
      chrome={{ ...config.presentation.chrome, maxWidth: config.visual.maxWidth }}
      actions={inviteAction}
      loading={loading}
    >
      {config.behavior.members.length === 0 ? (
        <Card className="ds-surface ds-team ds-team--empty" variant="outlined">
          <Card.Body>
            {config.presentation.emptyState ?? (
              <SurfaceEmptyState
                title="No team members"
                description="Invite your first team member to get started."
              />
            )}
          </Card.Body>
        </Card>
      ) : (
        <Card className="ds-surface ds-team ds-team--populated" variant="outlined">
          <Card.Body>
            <Stack spacing="xs">
              {config.behavior.members.map((member) =>
                config.presentation.renderMember ? (
                  <Box key={member.id}>{config.presentation.renderMember(member)}</Box>
                ) : (
                  <MemberRow key={member.id} member={member} config={config} />
                )
              )}
            </Stack>
          </Card.Body>
        </Card>
      )}
    </PageShellSurface>
  );
}
