'use client';

/**
 * BhWorkflowNotification - Compact Preset
 * Condensed notification rules summary for sidebar or widget.
 */

import { useMemo, useCallback } from 'react';
import {
  Bell, Mail, MessageSquare, Inbox,
  ToggleLeft, ToggleRight,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createEmptyStateStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,

  createCardHoverStyles,
  createDividerStyle,
  createPersonalitySectionHeaderStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type { BhWorkflowNotificationProps, NotificationRule } from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getChannelIcon(channel: NotificationRule['channel']) {
  switch (channel) {
    case 'email': return Mail;
    case 'slack': return MessageSquare;
    case 'in-app': return Inbox;
    default: return Mail;
  }
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhWorkflowNotification = createPreset<BhWorkflowNotificationProps>({
  name: 'BhWorkflowNotification.Compact',
  render: (ctx: PresetContext<BhWorkflowNotificationProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      rules: rawRules = [],
      onRuleToggle,
      className,
      style,
    } = props;

    const rules = Array.isArray(rawRules) ? rawRules : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const handleToggle = useCallback((id: string) => {
      onRuleToggle?.(id);
    }, [onRuleToggle]);

    const enabledCount = useMemo(() => rules.filter(r => r.enabled).length, [rules]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const divider = useMemo(() => createDividerStyle(t), [t]);

    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);


    return (
      <Box
        className={className}
        onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
        style={{
          ...card,
          width: '100%',
          padding: 0,
          overflow: 'hidden',
          ...animStyle,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Bell size={16} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Notifications
            </Text>
          </Box>
          <Box style={{
            ...createBadgeStyle(t, 'success'),
            borderRadius: badgeRadius,
            padding: `1px ${t.spacing[2]}px`,
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs }}>{enabledCount} active</Text>
          </Box>
        </Box>

        {/* Rules */}
        <Box role="list" aria-label="Notification rules">
          {rules.slice(0, 5).map((rule) => {
            const ChannelIcon = getChannelIcon(rule.channel);

            return (
              <Box
                key={rule.id}
                role="listitem"
                aria-label={`${rule.event}, ${rule.enabled ? 'enabled' : 'disabled'}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  borderBottom: `1px solid ${t.colors.neutral[50]}`,
                  opacity: rule.enabled ? 1 : 0.5,
                  transition: `opacity ${t.motion.hover}`,
                }}
              >
                <ChannelIcon size={12} color={t.colors.neutral[400]} />
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.neutral[700],
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {rule.event}
                  </Text>
                </Box>
                <Box
                  role="switch"
                  tabIndex={0}
                  aria-checked={rule.enabled}
                  aria-label={`Toggle ${rule.event}`}
                  onClick={() => handleToggle((rule.id ?? ''))}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggle((rule.id ?? '')); } }}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                >
                  {rule.enabled
                    ? <ToggleRight size={18} color={t.colors.successScale[500]} />
                    : <ToggleLeft size={18} color={t.colors.neutral[300]} />
                  }
                </Box>
              </Box>
            );
          })}
          {rules.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                No rules
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
