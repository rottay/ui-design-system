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
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState<string | null>(null);

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
          bg: tokens.colors.successScale[100],
          text: tokens.colors.successScale[700],
          border: tokens.colors.successScale[200],
        };
      case 'pending':
        return {
          bg: tokens.colors.warningScale[100],
          text: tokens.colors.warningScale[700],
          border: tokens.colors.warningScale[200],
        };
      case 'deactivated':
        return {
          bg: tokens.colors.neutral[100],
          text: tokens.colors.neutral[600],
          border: tokens.colors.neutral[200],
        };
      default:
        return {
          bg: tokens.colors.neutral[100],
          text: tokens.colors.neutral[600],
          border: tokens.colors.neutral[200],
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

      {/* Table */}
      <Box
        style={{
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          borderRadius: tokens.borderRadius.lg,
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
              <th
                style={{
                  textAlign: 'left',
                  padding: tokens.spacing[4],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}
              >
                Member
              </th>
              <th
                style={{
                  textAlign: 'left',
                  padding: tokens.spacing[4],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}
              >
                Role
              </th>
              <th
                style={{
                  textAlign: 'left',
                  padding: tokens.spacing[4],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}
              >
                Status
              </th>
              <th
                style={{
                  textAlign: 'left',
                  padding: tokens.spacing[4],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}
              >
                Joined
              </th>
              <th
                style={{
                  textAlign: 'right',
                  padding: tokens.spacing[4],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const statusColors = getStatusColor(member.status);
              const isHovered = hoveredRow === member.id;

              return (
                <tr
                  key={member.id}
                  onMouseEnter={() => setHoveredRow(member.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    backgroundColor: isHovered ? tokens.colors.neutral[50] : tokens.colors.common.white,
                    transition: `background-color ${tokens.motion.hover}`,
                  }}
                >
                  <td
                    style={{
                      padding: tokens.spacing[4],
                      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: tokens.borderRadius.full,
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <Box
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: tokens.colors.primaryScale[100],
                            color: tokens.colors.primaryScale[700],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.semibold,
                          }}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </Box>
                      )}
                      <Box>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: tokens.colors.neutral[900],
                          }}
                        >
                          {member.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                          }}
                        >
                          {member.email}
                        </Text>
                      </Box>
                    </Box>
                  </td>
                  <td
                    style={{
                      padding: tokens.spacing[4],
                      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    }}
                  >
                    <Box style={{ position: 'relative', width: 'fit-content' }}>
                      <button
                        onClick={() => setRoleDropdownOpen(roleDropdownOpen === member.id ? null : member.id)}
                        style={{
                          padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                          borderRadius: tokens.borderRadius.md,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                          backgroundColor: tokens.colors.common.white,
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[900],
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                        }}
                      >
                        {roles.find((r) => r.key === member.role)?.label || member.role}
                      </button>
                      {roleDropdownOpen === member.id && (
                        <Box
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            marginTop: tokens.spacing[1],
                            backgroundColor: tokens.colors.common.white,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                            borderRadius: tokens.borderRadius.md,
                            boxShadow: tokens.shadows.md,
                            zIndex: 10,
                            minWidth: '150px',
                          }}
                        >
                          {roles.map((role) => (
                            <button
                              key={role.key}
                              onClick={() => {
                                onRoleChange?.(member.id, role.key);
                                setRoleDropdownOpen(null);
                              }}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: tokens.spacing[2],
                                border: 'none',
                                backgroundColor: role.key === member.role ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                                cursor: 'pointer',
                                fontSize: tokens.typography.fontSize.sm,
                                color: tokens.colors.neutral[900],
                                transition: `background-color ${tokens.motion.hover}`,
                              }}
                              onMouseEnter={(e) => {
                                if (role.key !== member.role) {
                                  e.currentTarget.style.backgroundColor = tokens.colors.neutral[50];
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (role.key !== member.role) {
                                  e.currentTarget.style.backgroundColor = tokens.colors.common.white;
                                }
                              }}
                            >
                              {role.label}
                            </button>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </td>
                  <td
                    style={{
                      padding: tokens.spacing[4],
                      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    }}
                  >
                    <Box
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: statusColors.bg,
                        color: statusColors.text,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusColors.border}`,
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                      }}
                    >
                      {member.status || 'active'}
                    </Box>
                  </td>
                  <td
                    style={{
                      padding: tokens.spacing[4],
                      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[500],
                    }}
                  >
                    {member.joinedAt || '-'}
                  </td>
                  <td
                    style={{
                      padding: tokens.spacing[4],
                      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      textAlign: 'right',
                    }}
                  >
                    <Box style={{ display: 'flex', gap: tokens.spacing[1], justifyContent: 'flex-end' }}>
                      {member.status === 'pending' && onResendInvite && (
                        <button
                          onClick={() => onResendInvite(member.id)}
                          style={{
                            padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                            borderRadius: tokens.borderRadius.md,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                            backgroundColor: tokens.colors.common.white,
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[900],
                            cursor: 'pointer',
                            transition: `all ${tokens.motion.hover}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = tokens.colors.neutral[50];
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = tokens.colors.common.white;
                          }}
                        >
                          Resend
                        </button>
                      )}
                      {member.id !== currentUserId && onRemove && (
                        <button
                          onClick={() => onRemove(member.id)}
                          style={{
                            padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                            borderRadius: tokens.borderRadius.md,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[300]}`,
                            backgroundColor: tokens.colors.common.white,
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.errorScale[600],
                            cursor: 'pointer',
                            transition: `all ${tokens.motion.hover}`,
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Box>
    </Box>
  );
});
