'use client';

/**
 * BhCandidateBulkEmail - Compact Preset
 * Condensed bulk email widget with recipient count and send button.
 */

import { useState, useMemo, useEffect } from 'react';
import { Mail, Send, Users, CheckSquare, Square } from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhCandidateBulkEmailProps, BulkEmailRecipient } from '../../core';
import type { DesignTokens } from '../../../../../types';

const MOCK_RECIPIENTS: BulkEmailRecipient[] = [
  { id: 'br-1', name: 'Sarah Johnson', email: 'sarah@email.com', variables: { position: 'Senior Frontend Engineer' } },
  { id: 'br-2', name: 'Michael Chen', email: 'michael@email.com', variables: { position: 'Backend Developer' } },
  { id: 'br-3', name: 'Emily Rodriguez', email: 'emily@email.com', variables: { position: 'Product Designer' } },
];

export const CompactBhCandidateBulkEmail = createPreset<BhCandidateBulkEmailProps>({
  name: 'BhCandidateBulkEmail.Compact',
  render: (ctx: PresetContext<BhCandidateBulkEmailProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      recipients = MOCK_RECIPIENTS,
      subject = 'Interview Invitation',
      onRecipientToggle,
      onSend,
      selectedIds: propSelectedIds,
      className,
      style,
    } = props;

    const [localSelected, setLocalSelected] = useState<Set<string>>(
      new Set(propSelectedIds ?? recipients.map(r => r.id)),
    );

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const handleToggle = (id: string) => {
      setLocalSelected(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      onRecipientToggle?.(id);
    };

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    return (
      <Box
        className={className}
        style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          ...animStyle,
          ...style,
        }}
      >
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Mail size={14} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Bulk Email
            </Text>
          </Box>
          <Box
            tabIndex={0}
            role="button"
            aria-label={`Send to ${localSelected.size} recipients`}
            onClick={() => onSend?.()}
            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSend?.(); } }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: t.spacing[1],
              padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
              borderRadius: t.borderRadius.md,
              backgroundColor: localSelected.size > 0 ? t.colors.primaryScale[600] : t.colors.neutral[300],
              cursor: localSelected.size > 0 ? 'pointer' : 'default',
              transition: `all ${t.motion.hover}`,
            }}
          >
            <Send size={11} color={t.colors.common.white} />
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.common.white }}>
              {localSelected.size}
            </Text>
          </Box>
        </Box>

        {/* Subject line */}
        <Box style={{
          padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[50]}`,
        }}>
          <Text style={{
            fontSize: t.typography.fontSize.xs,
            fontWeight: t.typography.fontWeight.medium,
            color: t.colors.neutral[700],
          }}>
            {subject}
          </Text>
        </Box>

        {/* Recipients */}
        <Box role="list" aria-label="Recipients" style={{ maxHeight: 200, overflow: 'auto' }}>
          {recipients.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[3] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>No recipients</Text>
            </Box>
          )}
          {recipients.map((r) => {
            const isSelected = localSelected.has(r.id);
            return (
              <Box
                key={r.id}
                role="listitem"
                tabIndex={0}
                aria-label={`${r.name} (${r.email})`}
                onClick={() => handleToggle(r.id)}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggle(r.id);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  borderBottom: `1px solid ${t.colors.neutral[50]}`,
                  cursor: 'pointer',
                  backgroundColor: t.colors.common.white,
                  transition: `background-color ${t.motion.hover}`,
                }}
              >
                {isSelected ? (
                  <CheckSquare size={12} color={t.colors.primaryScale[500]} />
                ) : (
                  <Square size={12} color={t.colors.neutral[400]} />
                )}
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.neutral[800],
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {r.name}
                  </Text>
                </Box>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                  {r.email.split('@')[0]}
                </Text>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
