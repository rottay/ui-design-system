'use client';

/**
 * TeamSurface
 *
 * Team member management surface with role assignment, invite, and remove
 * actions. Supports table and card layouts. The app owns the actual team
 * operations; this surface standardizes how team management pages are composed.
 */

import React from 'react';
import { Box, Button, Card, Flex, Select, Stack, Tag, Text } from '../../primitives';
import type { TeamSurfaceConfig, TeamMember } from '../types';
import { PageShellSurface } from '../page-shell';
import { SurfaceActionBar } from '../shared';
import { SurfaceEmptyState } from '../states';

export interface TeamSurfaceProps {
  config: TeamSurfaceConfig;
  loading?: boolean;
}

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
      justify="between"
      align="center"
      style={{ padding: '12px 0', borderBottom: '1px solid var(--ds-color-border)' }}
    >
      <Flex gap={12} align="center" style={{ flex: 1 }}>
        {member.avatar}
        <Stack spacing="xs">
          <Text style={{ fontWeight: 600 }}>{member.name}</Text>
          <Text style={{ color: 'var(--ds-color-text-muted)', fontSize: 13 }}>
            {member.email}
          </Text>
        </Stack>
      </Flex>

      <Flex gap={12} align="center">
        {member.status && (
          <Tag color={statusColor(member.status)}>{member.status}</Tag>
        )}

        {config.behavior.onRoleChange ? (
          <Select
            value={member.role}
            onChange={(value: any) => config.behavior.onRoleChange?.(member.id, String(value))}
            options={config.behavior.roles.map((r) => ({ label: r.label, value: r.id }))}
            style={{ minWidth: 120 }}
            size="sm"
          />
        ) : (
          <Text style={{ color: 'var(--ds-color-text-muted)', fontSize: 13 }}>
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
        <Card variant="outlined">
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
        <Card variant="outlined">
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
