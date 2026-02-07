'use client';

import { useState } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { TeamManagerProps, TeamMember } from '../../core';

export default createPreset<TeamManagerProps>((context: PresetContext<TeamManagerProps>) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;

  const {
    members,
    roles,
    currentUserId,
    onInvite,
    onRoleChange,
    onRemove,
    onResendInvite,
    title,
    maxMembers,
    className,
    style,
  } = props;

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState(roles[0]?.key || '');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const activeMembers = members.filter((m) => m.status !== 'deactivated');
  const canInviteMore = !maxMembers || activeMembers.length < maxMembers;

  const handleInvite = () => {
    if (inviteEmail && inviteRole && onInvite) {
      onInvite(inviteEmail, inviteRole);
      setInviteEmail('');
      setInviteRole(roles[0]?.key || '');
      setShowInviteForm(false);
    }
  };

  const getStatusColor = (status?: TeamMember['status']) => {
    switch (status) {
      case 'active':
        return {
          bg: tokens.colors.successScale[500],
        };
      case 'pending':
        return {
          bg: tokens.colors.warningScale[500],
        };
      case 'deactivated':
        return {
          bg: tokens.colors.neutral[400],
        };
      default:
        return {
          bg: tokens.colors.neutral[400],
        };
    }
  };

  return (
    <Box className={className} style={style}>
      {/* Header */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: tokens.spacing[6],
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
            }}
          >
            {title}
          </Text>
          <Box
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: tokens.colors.primaryScale[100],
              color: tokens.colors.primaryScale[700],
              borderRadius: tokens.borderRadius.full,
              padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
            }}
          >
            {members.length}
          </Box>
        </Box>
        {canInviteMore && (
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            style={{
              backgroundColor: tokens.colors.primaryScale[600],
              color: tokens.colors.common.white,
              padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
              borderRadius: tokens.borderRadius.md,
              border: 'none',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[700];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[600];
            }}
          >
            Invite Member
          </button>
        )}
      </Box>

      {/* Invite Form */}
      {showInviteForm && (
        <Box
          style={{
            backgroundColor: tokens.colors.neutral[50],
            padding: tokens.spacing[4],
            borderRadius: tokens.borderRadius.md,
            marginBottom: tokens.spacing[6],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}
        >
          <Box style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'flex-end' }}>
            <Box style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[1],
                  display: 'block',
                }}
              >
                Email
              </Text>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="member@company.com"
                style={{
                  width: '100%',
                  padding: tokens.spacing[2],
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                  fontSize: tokens.typography.fontSize.sm,
                  outline: 'none',
                }}
              />
            </Box>
            <Box style={{ width: '200px' }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[1],
                  display: 'block',
                }}
              >
                Role
              </Text>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: tokens.spacing[2],
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                  fontSize: tokens.typography.fontSize.sm,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {roles.map((role) => (
                  <option key={role.key} value={role.key}>
                    {role.label}
                  </option>
                ))}
              </select>
            </Box>
            <button
              onClick={handleInvite}
              disabled={!inviteEmail}
              style={{
                backgroundColor: inviteEmail ? tokens.colors.primaryScale[600] : tokens.colors.neutral[300],
                color: tokens.colors.common.white,
                padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                borderRadius: tokens.borderRadius.md,
                border: 'none',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: inviteEmail ? 'pointer' : 'not-allowed',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              Send Invite
            </button>
          </Box>
        </Box>
      )}

      {/* Cards Grid */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: tokens.spacing[4],
        }}
      >
        {members.map((member) => {
          const statusColors = getStatusColor(member.status);
          const isHovered = hoveredCard === member.id;

          return (
            <Box
              key={member.id}
              onMouseEnter={() => setHoveredCard(member.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                position: 'relative',
                backgroundColor: tokens.colors.common.white,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                borderRadius: tokens.borderRadius.lg,
                padding: tokens.spacing[4],
                transition: `all ${tokens.motion.hover}`,
                boxShadow: isHovered ? tokens.shadows.md : 'none',
              }}
            >
              {/* Avatar and Name */}
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                <Box style={{ position: 'relative' }}>
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: tokens.borderRadius.full,
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Box
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.primaryScale[100],
                        color: tokens.colors.primaryScale[700],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: tokens.typography.fontSize.lg,
                        fontWeight: tokens.typography.fontWeight.semibold,
                      }}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </Box>
                  )}
                  {/* Status Dot */}
                  <Box
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '12px',
                      height: '12px',
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: statusColors.bg,
                      border: `2px solid ${tokens.colors.common.white}`,
                    }}
                  />
                </Box>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {member.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[500],
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {member.email}
                  </Text>
                </Box>
                {/* Action Menu */}
                <Box style={{ position: 'relative' }}>
                  <button
                    onClick={() => setActionMenuOpen(actionMenuOpen === member.id ? null : member.id)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: tokens.borderRadius.md,
                      border: 'none',
                      backgroundColor: isHovered ? tokens.colors.neutral[100] : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: tokens.typography.fontSize.lg,
                      color: tokens.colors.neutral[500],
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    •••
                  </button>
                  {actionMenuOpen === member.id && (
                    <Box
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: tokens.spacing[1],
                        backgroundColor: tokens.colors.common.white,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        borderRadius: tokens.borderRadius.md,
                        boxShadow: tokens.shadows.md,
                        zIndex: 10,
                        minWidth: '150px',
                      }}
                    >
                      {member.status === 'pending' && onResendInvite && (
                        <button
                          onClick={() => {
                            onResendInvite(member.id);
                            setActionMenuOpen(null);
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: tokens.spacing[2],
                            border: 'none',
                            backgroundColor: tokens.colors.common.white,
                            cursor: 'pointer',
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[900],
                            transition: `background-color ${tokens.motion.hover}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = tokens.colors.neutral[50];
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = tokens.colors.common.white;
                          }}
                        >
                          Resend Invite
                        </button>
                      )}
                      {member.id !== currentUserId && onRemove && (
                        <button
                          onClick={() => {
                            onRemove(member.id);
                            setActionMenuOpen(null);
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: tokens.spacing[2],
                            border: 'none',
                            backgroundColor: tokens.colors.common.white,
                            cursor: 'pointer',
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.errorScale[600],
                            transition: `background-color ${tokens.motion.hover}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = tokens.colors.errorScale[50];
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = tokens.colors.common.white;
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Role Badge */}
              <Box
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.primaryScale[100],
                  color: tokens.colors.primaryScale[700],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  marginBottom: tokens.spacing[2],
                }}
              >
                {roles.find((r) => r.key === member.role)?.label || member.role}
              </Box>

              {/* Joined Date */}
              {member.joinedAt && (
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  Joined {member.joinedAt}
                </Text>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
});
