'use client';

/**
 * BhInterviewScheduler - Compact Preset
 * Condensed single-column scheduling form with inline type toggle,
 * minimal card layout. Personality-driven, glass-aware, accessible.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createEmptyStateStyle,
  getAccentAwareLayout,
} from '../../../helpers';
import type { BhInterviewSchedulerProps, InterviewTypeConfig, ScheduleData, AgentOverride } from '../../core';
import type { DesignTokens } from '../../../../../types';
import {
  Bot, User, Calendar, Clock, Globe, Timer, Send, X,
  Sparkles, CheckCircle, Settings,
} from 'lucide-react';

const TIMEZONE_OPTIONS = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney',
];
const DURATION_OPTIONS = [15, 30, 45, 60, 90];

export const CompactBhInterviewScheduler = createPreset<BhInterviewSchedulerProps>({
  name: 'BhInterviewScheduler.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BhInterviewSchedulerProps>) => {
    const { Box, Text } = primitives;
    const { candidate: externalCandidate, interviewType: externalType, onTypeChange, templateStage, scheduleData: externalSchedule, onScheduleChange, agentConfig: externalAgentConfig, onAgentConfigChange, agents: rawAgents = [], interviewers: rawInterviewers = [], onConfirm, onCancel, estimatedCost, className, style } = props;

    const agents = Array.isArray(rawAgents) ? rawAgents : [];
    const interviewers = Array.isArray(rawInterviewers) ? rawInterviewers : [];

    const [interviewType, setInterviewType] = useState<InterviewTypeConfig>(externalType ?? { type: 'ai' });
    const [scheduleData, setScheduleData] = useState<ScheduleData>(externalSchedule ?? { date: '', time: '', timezone: 'America/New_York', estimatedDuration: 30 });
    const [agentConfig, setAgentConfig] = useState<AgentOverride>(externalAgentConfig ?? {});

    const personalityTypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const sectionHeaderStyle = useMemo(() => createPersonalitySectionHeaderStyle(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens), [tokens]);
    const accentLayout = useMemo(() => getAccentAwareLayout(tokens), [tokens]);
    const entranceAnim = useMemo(() => createEntranceAnimation(tokens, { index: 0 }), [tokens]);

    const handleTypeChange = useCallback((c: InterviewTypeConfig) => { setInterviewType(c); onTypeChange?.(c); }, [onTypeChange]);
    const handleScheduleChange = useCallback((d: Partial<ScheduleData>) => { const u = { ...scheduleData, ...d }; setScheduleData(u); onScheduleChange?.(u); }, [scheduleData, onScheduleChange]);
    const handleAgentConfigChange = useCallback((c: Partial<AgentOverride>) => { const u = { ...agentConfig, ...c }; setAgentConfig(u); onAgentConfigChange?.(u); }, [agentConfig, onAgentConfigChange]);
    const handleConfirm = useCallback(() => { onConfirm?.(); }, [onConfirm]);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const t = tokens;
    const bdr = `${t.surface.borderWidth} ${t.surface.borderStyle}`;

    const cardStyle = useMemo(() => ({
      ...createCardStyle(t, { elevation: 'sm', padding: 0, glass: isGlass }),
      borderRadius: t.borderRadius.lg,
      overflow: 'hidden' as const,
      maxWidth: 480,
      ...entranceAnim.animate,
      transition: entranceAnim.transition,
    }), [t, isGlass, entranceAnim]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    const inputStyle: React.CSSProperties = useMemo(() => ({
      width: '100%', padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, border: `${bdr} ${t.colors.neutral[300]}`, backgroundColor: t.colors.common.white, fontSize: t.typography.fontSize.sm, color: t.colors.neutral[900], outline: 'none', boxSizing: 'border-box' as const,
    }), [t, bdr]);

    const selectStyle: React.CSSProperties = useMemo(() => ({
      ...inputStyle, appearance: 'none' as const, cursor: 'pointer', transition: `all ${t.motion.hover}`,
    }), [inputStyle, t]);

    return (
      <Box className={className} style={{ ...cardStyle, ...style }}>
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>

        {/* Header */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Box style={createIconContainerStyle(t, { size: 28, color: t.colors.primaryScale[50] })}>
              <Calendar size={14} color={t.colors.primaryScale[600]} />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.md,
              fontWeight: personalityTypo.headingWeight,
              color: t.colors.neutral[900],
              letterSpacing: personalityTypo.headingLetterSpacing,
            }}>Quick Schedule</Text>
          </Box>
          {externalCandidate && (
            <Box style={{ ...createBadgeStyle(t, 'primary'), borderRadius: badgeRadius }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{externalCandidate.name}</Text>
            </Box>
          )}
        </Box>

        {/* Body */}
        <Box style={{ padding: `${t.spacing[4]}px ${t.spacing[5]}px`, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[4] }}>
          {/* Type toggle */}
          <Box>
            <Text style={sectionHeaderStyle}>Interview Type</Text>
            <Box style={{ display: 'flex', gap: t.spacing[2] }}>
              {(['ai', 'human'] as const).map(typeKey => {
                const sel = interviewType.type === typeKey;
                const Icon = typeKey === 'ai' ? Bot : User;
                return (
                  <Box
                    key={typeKey}
                    role="button"
                    tabIndex={0}
                    aria-label={`${typeKey === 'ai' ? 'AI' : 'Human'} interview`}
                    aria-pressed={sel}
                    onClick={() => handleTypeChange({ ...interviewType, type: typeKey })}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTypeChange({ ...interviewType, type: typeKey }); } }}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: t.spacing[2],
                      padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md,
                      backgroundColor: sel ? t.colors.primaryScale[50] : t.colors.common.white,
                      border: `${bdr} ${sel ? t.colors.primaryScale[400] : t.colors.neutral[200]}`,
                      cursor: 'pointer', transition: `all ${t.motion.hover}`,
                    }}
                  >
                    <Icon size={14} color={sel ? t.colors.primaryScale[600] : t.colors.neutral[500]} />
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: sel ? t.typography.fontWeight.semibold : t.typography.fontWeight.normal, color: sel ? t.colors.primaryScale[700] : t.colors.neutral[700] }}>
                      {typeKey === 'ai' ? 'AI' : 'Human'}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Schedule fields */}
          <Box>
            <Text style={sectionHeaderStyle}>Schedule</Text>
            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[2] }}>
              <Box>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], marginBottom: t.spacing[1] }}>Date</Text>
                <input type="date" value={scheduleData.date} onChange={(e: any) => handleScheduleChange({ date: e.target.value })} style={inputStyle} aria-label="Date" />
              </Box>
              <Box>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], marginBottom: t.spacing[1] }}>Time</Text>
                <input type="time" value={scheduleData.time} onChange={(e: any) => handleScheduleChange({ time: e.target.value })} style={inputStyle} aria-label="Time" />
              </Box>
              <Box>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], marginBottom: t.spacing[1] }}>Timezone</Text>
                <select value={scheduleData.timezone} onChange={(e: any) => handleScheduleChange({ timezone: e.target.value })} style={selectStyle} aria-label="Timezone">
                  {TIMEZONE_OPTIONS.map(tz => <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>)}
                </select>
              </Box>
              <Box>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], marginBottom: t.spacing[1] }}>Duration</Text>
                <select value={scheduleData.estimatedDuration} onChange={(e: any) => handleScheduleChange({ estimatedDuration: parseInt(e.target.value, 10) })} style={selectStyle} aria-label="Duration">
                  {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d} min</option>)}
                </select>
              </Box>
            </Box>
          </Box>

          {/* Agent selector (AI only, compact) */}
          {interviewType.type === 'ai' && agents.length > 0 && (
            <Box>
              <Text style={sectionHeaderStyle}>Agent</Text>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                {agents.slice(0, 3).map(a => {
                  const sel = interviewType.agentId === a.id;
                  return (
                    <Box
                      key={a.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Select ${a.name}`}
                      aria-pressed={sel}
                      onClick={() => handleTypeChange({ ...interviewType, agentId: a.id, agentName: a.name })}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTypeChange({ ...interviewType, agentId: a.id, agentName: a.name }); } }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: t.spacing[2],
                        padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: t.borderRadius.md,
                        backgroundColor: sel ? t.colors.primaryScale[50] : 'transparent',
                        cursor: 'pointer', transition: `all ${t.motion.hover}`,
                      }}
                    >
                      <Bot size={12} color={sel ? t.colors.primaryScale[600] : t.colors.neutral[400]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: sel ? t.colors.primaryScale[700] : t.colors.neutral[700], flex: 1 }}>{a.name}</Text>
                      {sel && <CheckCircle size={12} color={t.colors.primaryScale[600]} />}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box style={{
          display: 'flex', gap: t.spacing[2], justifyContent: 'flex-end',
          padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
          borderTop: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
        }}>
          {onCancel && (
            <Box
              role="button" tabIndex={0} aria-label="Cancel"
              onClick={onCancel}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCancel(); } }}
              style={{
                display: 'flex', alignItems: 'center', gap: t.spacing[1],
                padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md,
                backgroundColor: t.colors.common.white, border: `${bdr} ${t.colors.neutral[300]}`,
                cursor: 'pointer', transition: `all ${t.motion.hover}`,
              }}
            >
              <X size={12} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>Cancel</Text>
            </Box>
          )}
          <Box
            role="button" tabIndex={0} aria-label="Schedule interview"
            onClick={handleConfirm}
            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleConfirm(); } }}
            style={{
              display: 'flex', alignItems: 'center', gap: t.spacing[1],
              padding: `${t.spacing[1]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.md,
              backgroundColor: t.colors.primaryScale[600], border: 'none',
              cursor: 'pointer', transition: `all ${t.motion.hover}`,
            }}
          >
            <Send size={12} color={t.colors.common.white} />
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.common.white, fontWeight: t.typography.fontWeight.medium }}>Schedule</Text>
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
