'use client';

/**
 * BhWorkflowNotification - Config Preset
 * Full notification rule configuration with channel icons,
 * toggle switches, recipient lists, and add/edit actions.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Bell, Mail, MessageSquare, Inbox,
  Plus, Settings, ToggleLeft, ToggleRight,
  Users, ChevronRight,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createEmptyStateStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
} from '../../../helpers';
import type { BhWorkflowNotificationProps, NotificationRule } from '../../core';
import type { DesignTokens } from '../../../../../types';

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

function getChannelLabel(channel: NotificationRule['channel']): string {
  switch (channel) {
    case 'email': return 'Email';
    case 'slack': return 'Slack';
    case 'in-app': return 'In-App';
    default: return String(channel ?? '');
  }
}

function getChannelColor(channel: NotificationRule['channel'], t: DesignTokens) {
  switch (channel) {
    case 'email': return { fg: t.colors.primaryScale[600], bg: t.colors.primaryScale[50] };
    case 'slack': return { fg: t.colors.warningScale[600], bg: t.colors.warningScale[50] };
    case 'in-app': return { fg: t.colors.infoScale[600], bg: t.colors.infoScale[50] };
    default: return { fg: t.colors.neutral[600], bg: t.colors.neutral[50] };
  }
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_RULES: NotificationRule[] = [
  { id: 'n-1', event: 'Candidate Applied', channel: 'email', recipients: ['recruiter@company.com', 'hiring-mgr@company.com'], enabled: true, template: 'new-application' },
  { id: 'n-2', event: 'Interview Scheduled', channel: 'slack', recipients: ['#hiring-updates'], enabled: true, template: 'interview-scheduled' },
  { id: 'n-3', event: 'Offer Extended', channel: 'email', recipients: ['hr@company.com'], enabled: true, template: 'offer-notification' },
  { id: 'n-4', event: 'Assessment Completed', channel: 'in-app', recipients: ['panel-members'], enabled: false, template: 'assessment-complete' },
  { id: 'n-5', event: 'Appeal Submitted', channel: 'email', recipients: ['compliance@company.com'], enabled: true, template: 'appeal-alert' },
  { id: 'n-6', event: 'SLA Breach Warning', channel: 'slack', recipients: ['#ops-alerts'], enabled: true },
];

/* ================================================================== */
/*  Config Preset                                                      */
/* ================================================================== */

export const ConfigBhWorkflowNotification = createPreset<BhWorkflowNotificationProps>({
  name: 'BhWorkflowNotification.Config',
  render: (ctx: PresetContext<BhWorkflowNotificationProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      rules = MOCK_RULES,
      onRuleToggle,
      onRuleEdit,
      onAddRule,
      loading,
      className,
      style,
    } = props;

    const [hoveredRule, setHoveredRule] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const handleToggle = useCallback((id: string) => {
      onRuleToggle?.(id);
    }, [onRuleToggle]);

    const handleEdit = useCallback((id: string) => {
      onRuleEdit?.(id);
    }, [onRuleEdit]);

    const handleAdd = useCallback(() => {
      onAddRule?.();
    }, [onAddRule]);

    const enabledCount = useMemo(() => rules.filter(r => r.enabled).length, [rules]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: `${entrance.transition}, background-color ${t.motion.hover}, opacity ${t.motion.hover}`,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: t.colors.neutral[50],
          fontFamily: 'inherit',
          overflow: 'auto',
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[6]}px ${t.spacing[7]}px`,
          backgroundColor: t.colors.common.white,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
              <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.primaryScale[50] })}>
                <Bell size={22} color={t.colors.primaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xl,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  Workflow Notifications
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
                  {enabledCount} of {rules.length} rules active
                </Text>
              </Box>
            </Box>
            <Box
              role="button"
              tabIndex={0}
              aria-label="Add notification rule"
              onClick={handleAdd}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAdd(); } }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: t.spacing[2],
                padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                backgroundColor: t.colors.primaryScale[600],
                color: t.colors.common.white,
                borderRadius: t.borderRadius.md,
                cursor: 'pointer',
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.medium,
                transition: `background-color ${t.motion.hover}`,
              }}
            >
              <Plus size={16} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.common.white }}>Add Rule</Text>
            </Box>
          </Box>
        </Box>

        {/* Rules List */}
        <Box style={{ padding: t.spacing[7], flex: 1 }}>
          <Box style={{ ...card, padding: 0 }}>
            <Box role="list" aria-label="Notification rules">
              {rules.length === 0 && (
                <Box style={createEmptyStateStyle(t)}>
                  <Bell size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                    No notification rules configured
                  </Text>
                </Box>
              )}
              {rules.map((rule, i) => {
                const ChannelIcon = getChannelIcon(rule.channel);
                const channelColor = getChannelColor(rule.channel, t);
                const isHovered = hoveredRule === rule.id;

                return (
                  <Box
                    key={rule.id}
                    role="listitem"
                    aria-label={`${rule.event} via ${getChannelLabel(rule.channel)}, ${rule.enabled ? 'enabled' : 'disabled'}`}
                    onMouseEnter={() => setHoveredRule((rule.id ?? null))}
                    onMouseLeave={() => setHoveredRule(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: t.spacing[3],
                      padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
                      borderBottom: `1px solid ${t.colors.neutral[100]}`,
                      backgroundColor: isHovered ? t.colors.neutral[50] : t.colors.common.white,
                      opacity: rule.enabled ? 1 : 0.6,
                      ...animStyle(i),
                    }}
                  >
                    {/* Channel icon */}
                    <Box style={createIconContainerStyle(t, { size: 36, color: channelColor.bg })}>
                      <ChannelIcon size={16} color={channelColor.fg} />
                    </Box>

                    {/* Rule info */}
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{
                        fontSize: t.typography.fontSize.sm,
                        fontWeight: t.typography.fontWeight.semibold,
                        color: t.colors.neutral[900],
                      }}>
                        {rule.event}
                      </Text>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginTop: t.spacing[1] }}>
                        <Box style={{
                          ...createBadgeStyle(t, 'primary'),
                          borderRadius: badgeRadius,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>{getChannelLabel(rule.channel)}</Text>
                        </Box>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                          <Users size={10} color={t.colors.neutral[400]} />
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                            {(rule.recipients ?? []).length} recipient{(rule.recipients ?? []).length !== 1 ? 's' : ''}
                          </Text>
                        </Box>
                      </Box>
                    </Box>

                    {/* Toggle + Edit */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexShrink: 0 }}>
                      <Box
                        role="switch"
                        tabIndex={0}
                        aria-checked={rule.enabled}
                        aria-label={`Toggle ${rule.event}`}
                        onClick={() => handleToggle((rule.id ?? ''))}
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggle((rule.id ?? '')); } }}
                        style={{
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {rule.enabled
                          ? <ToggleRight size={24} color={t.colors.successScale[500]} />
                          : <ToggleLeft size={24} color={t.colors.neutral[300]} />
                        }
                      </Box>
                      <Box
                        role="button"
                        tabIndex={0}
                        aria-label={`Edit ${rule.event} rule`}
                        onClick={() => handleEdit((rule.id ?? ''))}
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleEdit((rule.id ?? '')); } }}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: t.borderRadius.md,
                          border: `1px solid ${t.colors.neutral[200]}`,
                          backgroundColor: t.colors.common.white,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: `background-color ${t.motion.hover}`,
                        }}
                      >
                        <Settings size={13} color={t.colors.neutral[500]} />
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
