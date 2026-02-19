'use client';

/**
 * BhInterviewScheduler - Standard Preset
 * Interview scheduling flow with candidate selector, type picker,
 * scheduling controls, AI agent configuration, and confirmation summary.
 * Personality-driven, glass-aware, accessible.
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

  createDividerStyle,
  createPersonalitySkeletonStyle,
  formatAbbreviated,
} from '../../../helpers';
import type { BhInterviewSchedulerProps, ScheduleCandidate, InterviewTypeConfig, ScheduleData, AgentOverride } from '../../core';
import type { DesignTokens } from '../../../../../types';
import {
  Bot, User, Calendar, Clock, Globe, Timer, Settings, Send, X,
  Sparkles, DollarSign, Mail, CheckCircle, AlertCircle, Tag,
  Thermometer, MessageSquare, FileText, Search, Shield,
} from 'lucide-react';

const TIMEZONE_OPTIONS = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Sao_Paulo', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Australia/Sydney',
];
const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

export const StandardBhInterviewScheduler = createPreset<BhInterviewSchedulerProps>({
  name: 'BhInterviewScheduler.Standard',
  render: ({ primitives, props, tokens }: PresetContext<BhInterviewSchedulerProps>) => {
    const { Box, Text } = primitives;
    const { candidate: externalCandidate, interviewType: externalType, onTypeChange, templateStage, scheduleData: externalSchedule, onScheduleChange, agentConfig: externalAgentConfig, onAgentConfigChange, agents: rawAgents = [], interviewers: rawInterviewers = [], onConfirm, onCancel, estimatedCost, showConfirmation: externalShowConfirmation = false, className, style } = props;

    const agents = Array.isArray(rawAgents) ? rawAgents : [];
    const interviewers = Array.isArray(rawInterviewers) ? rawInterviewers : [];

    const [selectedCandidate, setSelectedCandidate] = useState<ScheduleCandidate | null>(externalCandidate ?? null);
    const [interviewType, setInterviewType] = useState<InterviewTypeConfig>(externalType ?? { type: 'ai' });
    const [scheduleData, setScheduleData] = useState<ScheduleData>(externalSchedule ?? { date: '', time: '', timezone: 'America/New_York', estimatedDuration: 30 });
    const [agentConfig, setAgentConfig] = useState<AgentOverride>(externalAgentConfig ?? {});
    const [showConfirmation, setShowConfirmation] = useState(externalShowConfirmation);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const t = tokens;

    const personalityTypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const sectionHeaderStyle = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(tokens), [tokens]);

    const handleTypeChange = useCallback((c: InterviewTypeConfig) => { setInterviewType(c); onTypeChange?.(c); }, [onTypeChange]);
    const handleScheduleChange = useCallback((d: Partial<ScheduleData>) => { const u = { ...scheduleData, ...d }; setScheduleData(u); onScheduleChange?.(u); }, [scheduleData, onScheduleChange]);
    const handleAgentConfigChange = useCallback((c: Partial<AgentOverride>) => { const u = { ...agentConfig, ...c }; setAgentConfig(u); onAgentConfigChange?.(u); }, [agentConfig, onAgentConfigChange]);

    const handleConfirm = useCallback(() => {
      setShowConfirmation(true);
      onConfirm?.();
    }, [onConfirm]);
    const bdr = `${t.surface.borderWidth} ${t.surface.borderStyle}`;
    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);

    const inputStyle: React.CSSProperties = useMemo(() => ({
      width: '100%', padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, border: `${bdr} ${t.colors.neutral[300]}`, backgroundColor: t.colors.common.white, fontSize: t.typography.fontSize.sm, color: t.colors.neutral[900], outline: 'none', boxSizing: 'border-box' as const,
    }), [t, bdr]);

    const selectStyle: React.CSSProperties = useMemo(() => ({
      ...inputStyle, appearance: 'none' as const, cursor: 'pointer', transition: `all ${t.motion.hover}`,
    }), [inputStyle, t]);

    const primaryBtnStyle: React.CSSProperties = useMemo(() => ({
      padding: `${t.spacing[2]}px ${t.spacing[5]}px`, borderRadius: t.borderRadius.md, backgroundColor: t.colors.primaryScale[600], color: t.colors.common.white, border: 'none', fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer', transition: `all ${t.motion.hover}`, display: 'inline-flex' as const, alignItems: 'center' as const, gap: t.spacing[2],
    }), [t]);

    const secondaryBtnStyle: React.CSSProperties = useMemo(() => ({
      ...primaryBtnStyle, backgroundColor: t.colors.common.white, color: t.colors.neutral[700], border: `${bdr} ${t.colors.neutral[300]}`,
    }), [primaryBtnStyle, t, bdr]);

    const labelStyle: React.CSSProperties = useMemo(() => ({
      fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], marginBottom: t.spacing[1], display: 'block' as const,
    }), [t]);

    const summaryRows = useMemo((): [string, string][] => [
      ['Candidate', selectedCandidate?.name ?? 'Not selected'],
      ['Type', interviewType.type === 'ai' ? `AI - ${interviewType.agentName ?? 'No agent'}` : `Human - ${interviewType.interviewerName ?? 'No interviewer'}`],
      ['Date & Time', scheduleData.date && scheduleData.time ? `${scheduleData.date} at ${scheduleData.time} (${scheduleData.timezone.replace(/_/g, ' ')})` : 'Not scheduled'],
      ['Duration', `${scheduleData.estimatedDuration} minutes`],
      ...(templateStage ? [['Stage', templateStage] as [string, string]] : []),
    ], [selectedCandidate, interviewType, scheduleData, templateStage]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const divider = useMemo(() => createDividerStyle(t), [t]);

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);
    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    return (
      <Box className={className} style={{ padding: t.spacing[5], backgroundColor: t.colors.neutral[50], minHeight: '100%', width: '100%', ...style }}>
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5], maxWidth: 800, margin: '0 auto' }}>
          {/* Candidate */}
          <Box style={{ ...cardBase, ...createEntranceAnimation(t, { index: 0 }).animate }}>
            {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
              <Box style={createIconContainerStyle(t, { size: 32, color: t.colors.neutral[100] })}>
                <User size={18} color={t.colors.neutral[600]} />
              </Box>
              <Text style={{
                fontSize: t.typography.fontSize.lg,
                fontWeight: personalityTypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: personalityTypo.headingLetterSpacing,
              }}>Candidate</Text>
            </Box>
            {selectedCandidate ? (
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], padding: t.spacing[3], borderRadius: t.borderRadius.md, backgroundColor: t.colors.primaryScale[50], border: `${bdr} ${t.colors.primaryScale[200]}` }}>
                <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.primaryScale[200] })}>
                  <User size={20} color={t.colors.primaryScale[600]} />
                </Box>
                <Box style={{ flex: 1 }}>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>{selectedCandidate.name}</Text>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginTop: t.spacing[1] }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{selectedCandidate.jobTitle}</Text>
                    <Box style={{ ...createBadgeStyle(t, 'info'), borderRadius: badgeRadius, fontSize: t.typography.fontSize.xs }}>{selectedCandidate.currentStage}</Box>
                    {selectedCandidate.aiMatchScore != null && (
                      <Box style={{ ...createBadgeStyle(t, selectedCandidate.aiMatchScore >= 80 ? 'success' : selectedCandidate.aiMatchScore >= 50 ? 'warning' : 'error'), borderRadius: badgeRadius, fontSize: t.typography.fontSize.xs }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs }}>AI Match: {selectedCandidate.aiMatchScore}%</Text>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: t.spacing[2], color: t.colors.neutral[400], cursor: 'pointer' }}>
                <Search size={14} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>Search for a candidate...</Text>
              </Box>
            )}
          </Box>

          {/* Interview Type */}
          <Box style={{ ...cardBase, ...createEntranceAnimation(t, { index: 1 }).animate }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
              <Box style={createIconContainerStyle(t, { size: 32, color: t.colors.neutral[100] })}>
                <Sparkles size={18} color={t.colors.neutral[600]} />
              </Box>
              <Text style={{
                fontSize: t.typography.fontSize.lg,
                fontWeight: personalityTypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: personalityTypo.headingLetterSpacing,
              }}>Interview Type</Text>
            </Box>
            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[3], marginBottom: t.spacing[4] }}>
              {(['ai', 'human'] as const).map((typeKey) => {
                const sel = interviewType.type === typeKey;
                const Icon = typeKey === 'ai' ? Bot : User;
                const label = typeKey === 'ai' ? 'AI Interview' : 'Human Interview';
                const desc = typeKey === 'ai' ? 'Automated AI agent conducts the interview' : 'Live interviewer conducts the session';
                return (
                  <Box
                    key={typeKey}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select ${label}`}
                    aria-pressed={sel}
                    onClick={() => handleTypeChange({ ...interviewType, type: typeKey })}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleTypeChange({ ...interviewType, type: typeKey });
                      }
                    }}
                    onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
                    onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
                    style={{
                      ...cardHover.base,
                      padding: t.spacing[4],
                      textAlign: 'center' as const,
                      backgroundColor: sel ? t.colors.primaryScale[50] : t.colors.common.white,
                      border: `${bdr} ${sel ? t.colors.primaryScale[400] : t.colors.neutral[200]}`,
                      borderRadius: t.borderRadius.lg,
                    }}
                  >
                    <Box style={{ ...createIconContainerStyle(t, { size: 48, color: sel ? t.colors.primaryScale[100] : t.colors.neutral[100] }), margin: `0 auto ${t.spacing[3]}px` }}>
                      <Icon size={24} color={sel ? t.colors.primaryScale[600] : t.colors.neutral[500]} />
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: sel ? t.colors.primaryScale[700] : t.colors.neutral[900] }}>{label}</Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginTop: t.spacing[1] }}>{desc}</Text>
                  </Box>
                );
              })}
            </Box>
            {interviewType.type === 'ai' && agents.length > 0 && (
              <Box>
                <Text style={labelStyle}>Select AI Agent</Text>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
                  {agents.map((a, i) => {
                    const sel = interviewType.agentId === a.id;
                    return (
                      <Box
                        key={a.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`Select agent ${a.name}`}
                        aria-pressed={sel}
                        onClick={() => handleTypeChange({ ...interviewType, agentId: a.id, agentName: a.name })}
                        onKeyDown={(e: React.KeyboardEvent) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleTypeChange({ ...interviewType, agentId: a.id, agentName: a.name });
                          }
                        }}
                        style={{
                          ...animStyle(i),
                          padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md,
                          backgroundColor: sel ? t.colors.primaryScale[50] : t.colors.common.white,
                          border: `${bdr} ${sel ? t.colors.primaryScale[300] : t.colors.neutral[200]}`,
                          cursor: 'pointer', transition: `all ${t.motion.hover}`,
                          display: 'flex', alignItems: 'center', gap: t.spacing[3],
                        }}
                      >
                        <Bot size={16} color={sel ? t.colors.primaryScale[600] : t.colors.neutral[500]} />
                        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1 }}>
                          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[900] }}>{a.name}</Text>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{a.type} {'\u00B7'} {a.language}</Text>
                        </Box>
                        {sel && <CheckCircle size={16} color={t.colors.primaryScale[600]} />}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
            {interviewType.type === 'human' && interviewers.length > 0 && (
              <Box>
                <Text style={labelStyle}>Select Interviewer</Text>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
                  {interviewers.map((interviewer, idx) => {
                    const sel = interviewType.interviewerId === interviewer.id;

                    return (
                      <Box
                        key={interviewer.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`Select interviewer ${interviewer.name}`}
                        aria-pressed={sel}
                        onClick={() => handleTypeChange({ ...interviewType, interviewerId: interviewer.id, interviewerName: interviewer.name })}
                        onKeyDown={(e: React.KeyboardEvent) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleTypeChange({ ...interviewType, interviewerId: interviewer.id, interviewerName: interviewer.name });
                          }
                        }}
                        style={{
                          ...animStyle(idx),
                          padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md,
                          backgroundColor: sel ? t.colors.primaryScale[50] : t.colors.common.white,
                          border: `${bdr} ${sel ? t.colors.primaryScale[300] : t.colors.neutral[200]}`,
                          cursor: 'pointer', transition: `all ${t.motion.hover}`,
                          display: 'flex', alignItems: 'center', gap: t.spacing[3],
                        }}
                      >
                        <User size={16} color={sel ? t.colors.primaryScale[600] : t.colors.neutral[500]} />
                        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1 }}>
                          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[900] }}>{interviewer.name}</Text>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{interviewer.role}</Text>
                        </Box>
                        {sel && <CheckCircle size={16} color={t.colors.primaryScale[600]} />}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>

          {/* Template Stage */}
          <Box style={{ ...cardBase, ...createEntranceAnimation(t, { index: 2 }).animate }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
              <Box style={createIconContainerStyle(t, { size: 32, color: t.colors.neutral[100] })}>
                <Tag size={18} color={t.colors.neutral[600]} />
              </Box>
              <Text style={{
                fontSize: t.typography.fontSize.lg,
                fontWeight: personalityTypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: personalityTypo.headingLetterSpacing,
              }}>Template Stage</Text>
            </Box>
            <Box style={{ ...(templateStage ? createBadgeStyle(t, 'success') : createBadgeStyle(t, 'warning')), borderRadius: badgeRadius, fontSize: t.typography.fontSize.sm, padding: `${t.spacing[2]}px ${t.spacing[3]}px` }}>
              {templateStage ? <CheckCircle size={14} style={{ marginRight: t.spacing[1] }} /> : <AlertCircle size={14} style={{ marginRight: t.spacing[1] }} />}
              <Text style={{ fontSize: t.typography.fontSize.sm }}>{templateStage ? `Auto-detected: ${templateStage}` : 'No stage detected'}</Text>
            </Box>
          </Box>

          {/* Schedule */}
          <Box style={{ ...cardBase, ...createEntranceAnimation(t, { index: 3 }).animate }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
              <Box style={createIconContainerStyle(t, { size: 32, color: t.colors.neutral[100] })}>
                <Calendar size={18} color={t.colors.neutral[600]} />
              </Box>
              <Text style={{
                fontSize: t.typography.fontSize.lg,
                fontWeight: personalityTypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: personalityTypo.headingLetterSpacing,
              }}>Schedule</Text>
            </Box>
            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[3], marginBottom: t.spacing[3] }}>
              <Box>
                <Text style={labelStyle}>Date</Text>
                <input type="date" value={scheduleData.date} onChange={(e: any) => handleScheduleChange({ date: e.target.value })} style={inputStyle} aria-label="Interview date" />
              </Box>
              <Box>
                <Text style={labelStyle}>Time</Text>
                <input type="time" value={scheduleData.time} onChange={(e: any) => handleScheduleChange({ time: e.target.value })} style={inputStyle} aria-label="Interview time" />
              </Box>
            </Box>
            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[3], marginBottom: t.spacing[3] }}>
              <Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], ...labelStyle }}>
                  <Globe size={12} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>Timezone</Text>
                </Box>
                <select value={scheduleData.timezone} onChange={(e: any) => handleScheduleChange({ timezone: e.target.value })} style={selectStyle} aria-label="Timezone">
                  {TIMEZONE_OPTIONS.map((tz, i) => (
                    <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </Box>
              <Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], ...labelStyle }}>
                  <Timer size={12} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>Duration</Text>
                </Box>
                <select value={scheduleData.estimatedDuration} onChange={(e: any) => handleScheduleChange({ estimatedDuration: parseInt(e.target.value, 10) })} style={selectStyle} aria-label="Duration">
                  {DURATION_OPTIONS.map((d, i) => (
                    <option key={d} value={d}>{d} minutes</option>
                  ))}
                </select>
              </Box>
            </Box>
            {scheduleData.date && scheduleData.time && (
              <Box style={{ padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, backgroundColor: t.colors.successScale[50], border: `${bdr} ${t.colors.successScale[200]}`, display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                <CheckCircle size={14} color={t.colors.successScale[600]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.successScale[700], fontWeight: t.typography.fontWeight.medium }}>Time slot available</Text>
              </Box>
            )}
          </Box>

          {/* Configuration */}
          <Box style={{ ...cardBase, ...createEntranceAnimation(t, { index: 4 }).animate }}>
            {interviewType.type === 'ai' ? (
              <>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
                  <Box style={createIconContainerStyle(t, { size: 32, color: t.colors.neutral[100] })}>
                    <Settings size={18} color={t.colors.neutral[600]} />
                  </Box>
                  <Text style={{
                    fontSize: t.typography.fontSize.lg,
                    fontWeight: personalityTypo.headingWeight,
                    color: t.colors.neutral[900],
                    letterSpacing: personalityTypo.headingLetterSpacing,
                  }}>Agent Configuration</Text>
                </Box>
                <Box style={{ marginBottom: t.spacing[3] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], ...labelStyle }}>
                    <Thermometer size={12} />
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>Temperature: {agentConfig.temperature ?? 0.7}</Text>
                  </Box>
                  <input type="range" min="0" max="1" step="0.1" value={agentConfig.temperature ?? 0.7} onChange={(e: any) => handleAgentConfigChange({ temperature: parseFloat(e.target.value) })} style={{ width: '100%', accentColor: t.colors.primaryScale[500] }} aria-label="Temperature slider" />
                  <Box style={{ display: 'flex', justifyContent: 'space-between', marginTop: t.spacing[1] }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>Focused</Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>Creative</Text>
                  </Box>
                </Box>
                <Box style={{ marginBottom: t.spacing[3] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], ...labelStyle }}>
                    <Timer size={12} />
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>Max Duration (minutes)</Text>
                  </Box>
                  <input type="number" min="10" max="120" step="5" value={agentConfig.maxDuration ?? scheduleData.estimatedDuration} onChange={(e: any) => handleAgentConfigChange({ maxDuration: parseInt(e.target.value, 10) })} style={inputStyle} aria-label="Max duration" />
                </Box>
                <Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], ...labelStyle }}>
                    <MessageSquare size={12} />
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>Custom Prompt (optional)</Text>
                  </Box>
                  <textarea value={agentConfig.customPrompt ?? ''} onChange={(e: any) => handleAgentConfigChange({ customPrompt: e.target.value })} placeholder="Add specific instructions for the AI agent..." rows={4} style={{ ...inputStyle, resize: 'vertical' as const, fontFamily: 'inherit' }} aria-label="Custom prompt" />
                </Box>
              </>
            ) : (
              <>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
                  <Box style={createIconContainerStyle(t, { size: 32, color: t.colors.neutral[100] })}>
                    <FileText size={18} color={t.colors.neutral[600]} />
                  </Box>
                  <Text style={{
                    fontSize: t.typography.fontSize.lg,
                    fontWeight: personalityTypo.headingWeight,
                    color: t.colors.neutral[900],
                    letterSpacing: personalityTypo.headingLetterSpacing,
                  }}>Interviewer Notes</Text>
                </Box>
                <textarea placeholder="Add notes for the interviewer..." rows={6} style={{ ...inputStyle, resize: 'vertical' as const, fontFamily: 'inherit' }} aria-label="Interviewer notes" />
              </>
            )}
          </Box>

          {/* Preview & Confirm */}
          <Box style={{ ...cardBase, borderLeft: `4px solid ${t.colors.primaryScale[500]}`, ...createEntranceAnimation(t, { index: 5 }).animate }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
              <Box style={createIconContainerStyle(t, { size: 32, color: t.colors.primaryScale[50] })}>
                <Send size={18} color={t.colors.primaryScale[600]} />
              </Box>
              <Text style={{
                fontSize: t.typography.fontSize.lg,
                fontWeight: personalityTypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: personalityTypo.headingLetterSpacing,
              }}>Preview & Confirm</Text>
            </Box>
            <Box style={{ padding: t.spacing[4], borderRadius: t.borderRadius.md, backgroundColor: t.colors.neutral[50], border: `${bdr} ${t.colors.neutral[200]}`, marginBottom: t.spacing[4] }}>
              <Box style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: `${t.spacing[2]}px ${t.spacing[4]}px`, fontSize: t.typography.fontSize.sm }}>
                {summaryRows.map(([label, value]) => (
                  <React.Fragment key={label}>
                    <Text style={{ color: t.colors.neutral[500], fontWeight: t.typography.fontWeight.medium, fontSize: t.typography.fontSize.sm }}>{label}</Text>
                    <Text style={{ color: t.colors.neutral[900], fontSize: t.typography.fontSize.sm }}>{value}</Text>
                  </React.Fragment>
                ))}
              </Box>
            </Box>
            {(interviewType.type === 'ai' && estimatedCost !== undefined) || interviewType.estimatedCost != null ? (
              <Box style={{ padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, backgroundColor: t.colors.infoScale[50], border: `${bdr} ${t.colors.infoScale[200]}`, display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
                <DollarSign size={14} color={t.colors.infoScale[600]} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.infoScale[700], fontWeight: t.typography.fontWeight.medium }}>
                  Estimated cost: ${(interviewType.estimatedCost ?? estimatedCost ?? 0).toFixed(2)}
                  {interviewType.billingMode ? ` (${interviewType.billingMode.replace(/_/g, ' ')})` : ''}
                </Text>
              </Box>
            ) : null}
            {interviewType.proctoringEnabled && (
              <Box style={{ padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, backgroundColor: t.colors.warningScale[50], border: `${bdr} ${t.colors.warningScale[200]}`, display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
                <Shield size={14} color={t.colors.warningScale[600]} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.warningScale[700], fontWeight: t.typography.fontWeight.medium }}>Proctoring enabled for this interview</Text>
              </Box>
            )}
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
              <Mail size={14} color={t.colors.neutral[600]} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>Send invitation email to candidate</Text>
            </Box>
            <Box style={{ display: 'flex', gap: t.spacing[3], justifyContent: 'flex-end' }}>
              {onCancel && (
                <Box
                  role="button"
                  tabIndex={0}
                  aria-label="Cancel scheduling"
                  onClick={onCancel}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCancel(); } }}
                  style={secondaryBtnStyle}
                >
                  <X size={14} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>Cancel</Text>
                </Box>
              )}
              <Box
                role="button"
                tabIndex={0}
                aria-label="Schedule interview"
                onClick={handleConfirm}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleConfirm(); } }}
                style={primaryBtnStyle}
              >
                <Send size={14} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.common.white }}>Schedule Interview</Text>
              </Box>
            </Box>
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
