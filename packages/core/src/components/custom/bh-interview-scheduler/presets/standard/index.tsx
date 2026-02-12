'use client';

/**
 * BhInterviewScheduler - Standard Preset
 * Interview scheduling flow with candidate selector, type picker,
 * scheduling controls, AI agent configuration, and confirmation summary.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createBadgeStyle, createCardStyle, createHoverStyle, createSurfaceStyle } from '../../../helpers';
import type { BhInterviewSchedulerProps, ScheduleCandidate, InterviewTypeConfig, ScheduleData, AgentOverride } from '../../core';
import {
  Bot, User, Calendar, Clock, Globe, Timer, Settings, Send, X,
  Sparkles, DollarSign, Mail, CheckCircle, AlertCircle, Tag,
  Thermometer, MessageSquare, FileText, Search,
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
    const { Stack } = primitives;
    const { candidate: externalCandidate, interviewType: externalType, onTypeChange, templateStage, scheduleData: externalSchedule, onScheduleChange, agentConfig: externalAgentConfig, onAgentConfigChange, agents = [], interviewers = [], onConfirm, onCancel, estimatedCost, showConfirmation: externalShowConfirmation = false, className, style } = props;

    const [selectedCandidate, setSelectedCandidate] = useState<ScheduleCandidate | null>(externalCandidate ?? null);
    const [interviewType, setInterviewType] = useState<InterviewTypeConfig>(externalType ?? { type: 'ai' });
    const [scheduleData, setScheduleData] = useState<ScheduleData>(externalSchedule ?? { date: '', time: '', timezone: 'America/New_York', estimatedDuration: 30 });
    const [agentConfig, setAgentConfig] = useState<AgentOverride>(externalAgentConfig ?? {});
    const [showConfirmation, setShowConfirmation] = useState(externalShowConfirmation);

    const handleTypeChange = useCallback((c: InterviewTypeConfig) => { setInterviewType(c); onTypeChange?.(c); }, [onTypeChange]);
    const handleScheduleChange = useCallback((d: Partial<ScheduleData>) => { const u = { ...scheduleData, ...d }; setScheduleData(u); onScheduleChange?.(u); }, [scheduleData, onScheduleChange]);
    const handleAgentConfigChange = useCallback((c: Partial<AgentOverride>) => { const u = { ...agentConfig, ...c }; setAgentConfig(u); onAgentConfigChange?.(u); }, [agentConfig, onAgentConfigChange]);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const t = tokens;
    const bdr = `${t.surface.borderWidth} ${t.surface.borderStyle}`;
    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const cardInteractive = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass, interactive: true }), [t, isGlass]);

    const inputStyle: React.CSSProperties = { width: '100%', padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, border: `${bdr} ${t.colors.neutral[300]}`, backgroundColor: t.colors.common.white, fontSize: t.typography.fontSize.sm, color: t.colors.neutral[900], outline: 'none', boxSizing: 'border-box' };
    const selectStyle: React.CSSProperties = { ...inputStyle, appearance: 'none' as const, cursor: 'pointer', transition: `all ${t.motion.hover}` };
    const labelStyle: React.CSSProperties = { fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], marginBottom: t.spacing[1], display: 'block' };
    const titleStyle: React.CSSProperties = { fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], margin: 0 };
    const primaryBtn: React.CSSProperties = { padding: `${t.spacing[2]}px ${t.spacing[5]}px`, borderRadius: t.borderRadius.md, backgroundColor: t.colors.primaryScale[600], color: t.colors.common.white, border: 'none', fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer', transition: `all ${t.motion.hover}`, display: 'inline-flex', alignItems: 'center', gap: t.spacing[2] };
    const secondaryBtn: React.CSSProperties = { ...primaryBtn, backgroundColor: t.colors.common.white, color: t.colors.neutral[700], border: `${bdr} ${t.colors.neutral[300]}` };

    const SectionTitle = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
      <Stack direction="horizontal" align="center" gap={t.spacing[2]} style={{ marginBottom: t.spacing[4] }}>
        {icon}<h3 style={titleStyle}>{label}</h3>
      </Stack>
    );

    const TypeCard = ({ type, icon: Icon, label, desc }: { type: 'ai' | 'human'; icon: typeof Bot; label: string; desc: string }) => {
      const sel = interviewType.type === type;
      return (
        <div onClick={() => handleTypeChange({ ...interviewType, type })} style={{ ...cardInteractive, padding: t.spacing[4], textAlign: 'center' as const, backgroundColor: sel ? t.colors.primaryScale[50] : t.colors.common.white, border: `${bdr} ${sel ? t.colors.primaryScale[400] : t.colors.neutral[200]}` }}>
          <div style={{ width: 48, height: 48, borderRadius: t.borderRadius.lg, backgroundColor: sel ? t.colors.primaryScale[100] : t.colors.neutral[100], display: 'flex', alignItems: 'center', justifyContent: 'center', margin: `0 auto ${t.spacing[3]}px` }}>
            <Icon size={24} color={sel ? t.colors.primaryScale[600] : t.colors.neutral[500]} />
          </div>
          <p style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: sel ? t.colors.primaryScale[700] : t.colors.neutral[900], margin: 0 }}>{label}</p>
          <p style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], margin: `${t.spacing[1]}px 0 0` }}>{desc}</p>
        </div>
      );
    };

    const PersonRow = ({ id, name, subtitle, avatar, icon: Icon, selectedId, onSelect }: { id: string; name: string; subtitle: string; avatar?: string; icon: typeof Bot; selectedId?: string; onSelect: (id: string) => void }) => {
      const sel = selectedId === id;
      return (
        <div onClick={() => onSelect(id)} style={{ padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, backgroundColor: sel ? t.colors.primaryScale[50] : t.colors.common.white, border: `${bdr} ${sel ? t.colors.primaryScale[300] : t.colors.neutral[200]}`, cursor: 'pointer', transition: `all ${t.motion.hover}`, display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
          {avatar ? (
            <div style={{ width: 32, height: 32, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[200], overflow: 'hidden', flexShrink: 0 }}>
              <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <Icon size={16} color={sel ? t.colors.primaryScale[600] : t.colors.neutral[500]} />
          )}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[900], margin: 0 }}>{name}</p>
            <p style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], margin: 0 }}>{subtitle}</p>
          </div>
          {sel && <CheckCircle size={16} color={t.colors.primaryScale[600]} />}
        </div>
      );
    };

    const summaryRows: [string, React.ReactNode][] = [
      ['Candidate', selectedCandidate?.name ?? 'Not selected'],
      ['Type', <Stack key="t" direction="horizontal" align="center" gap={t.spacing[2]}>{interviewType.type === 'ai' ? <Bot size={14} color={t.colors.primaryScale[600]} /> : <User size={14} color={t.colors.primaryScale[600]} />}<span style={{ color: t.colors.neutral[900] }}>{interviewType.type === 'ai' ? `AI - ${interviewType.agentName ?? 'No agent'}` : `Human - ${interviewType.interviewerName ?? 'No interviewer'}`}</span></Stack>],
      ['Date & Time', scheduleData.date && scheduleData.time ? `${scheduleData.date} at ${scheduleData.time} (${scheduleData.timezone.replace(/_/g, ' ')})` : 'Not scheduled'],
      ['Duration', `${scheduleData.estimatedDuration} minutes`],
      ...(templateStage ? [['Stage', templateStage] as [string, React.ReactNode]] : []),
    ];

    return (
      <div className={className} style={{ ...createSurfaceStyle(t, { elevation: 'sm', glass: isGlass }), padding: t.spacing[5], backgroundColor: t.colors.neutral[50], minHeight: '100%', ...style }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[5], maxWidth: 800, margin: '0 auto' }}>
          {/* Candidate */}
          <div style={cardBase}>
            <SectionTitle icon={<User size={18} color={t.colors.neutral[600]} />} label="Candidate" />
            {selectedCandidate ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], padding: t.spacing[3], borderRadius: t.borderRadius.md, backgroundColor: t.colors.primaryScale[50], border: `${bdr} ${t.colors.primaryScale[200]}` }}>
                <div style={{ width: 44, height: 44, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[200], display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {selectedCandidate.avatar ? <img src={selectedCandidate.avatar} alt={selectedCandidate.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={20} color={t.colors.primaryScale[600]} />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], margin: 0 }}>{selectedCandidate.name}</p>
                  <Stack direction="horizontal" align="center" gap={t.spacing[2]} style={{ marginTop: t.spacing[1] }}>
                    <span style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{selectedCandidate.jobTitle}</span>
                    <span style={{ ...createBadgeStyle(t, 'info'), fontSize: t.typography.fontSize.xs }}>{selectedCandidate.currentStage}</span>
                  </Stack>
                </div>
              </div>
            ) : (
              <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: t.spacing[2], color: t.colors.neutral[400], cursor: 'pointer' }}><Search size={14} /><span>Search for a candidate...</span></div>
            )}
          </div>

          {/* Interview Type */}
          <div style={cardBase}>
            <SectionTitle icon={<Sparkles size={18} color={t.colors.neutral[600]} />} label="Interview Type" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[3], marginBottom: t.spacing[4] }}>
              <TypeCard type="ai" icon={Bot} label="AI Interview" desc="Automated AI agent conducts the interview" />
              <TypeCard type="human" icon={User} label="Human Interview" desc="Live interviewer conducts the session" />
            </div>
            {interviewType.type === 'ai' && agents.length > 0 && (
              <div><label style={labelStyle}>Select AI Agent</label><div style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                {agents.map((a) => <PersonRow key={a.id} id={a.id} name={a.name} subtitle={`${a.type} \u00B7 ${a.language}`} icon={Bot} selectedId={interviewType.agentId} onSelect={(id) => handleTypeChange({ ...interviewType, agentId: id, agentName: a.name })} />)}
              </div></div>
            )}
            {interviewType.type === 'human' && interviewers.length > 0 && (
              <div><label style={labelStyle}>Select Interviewer</label><div style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                {interviewers.map((i) => <PersonRow key={i.id} id={i.id} name={i.name} subtitle={i.role} avatar={i.avatar} icon={User} selectedId={interviewType.interviewerId} onSelect={(id) => handleTypeChange({ ...interviewType, interviewerId: id, interviewerName: i.name })} />)}
              </div></div>
            )}
          </div>

          {/* Template Stage */}
          <div style={cardBase}>
            <SectionTitle icon={<Tag size={18} color={t.colors.neutral[600]} />} label="Template Stage" />
            <span style={{ ...(templateStage ? createBadgeStyle(t, 'success') : createBadgeStyle(t, 'warning')), fontSize: t.typography.fontSize.sm, padding: `${t.spacing[2]}px ${t.spacing[3]}px` }}>
              {templateStage ? <><CheckCircle size={14} style={{ marginRight: t.spacing[1] }} />Auto-detected: {templateStage}</> : <><AlertCircle size={14} style={{ marginRight: t.spacing[1] }} />No stage detected</>}
            </span>
          </div>

          {/* Schedule */}
          <div style={cardBase}>
            <SectionTitle icon={<Calendar size={18} color={t.colors.neutral[600]} />} label="Schedule" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[3], marginBottom: t.spacing[3] }}>
              <div><label style={labelStyle}>Date</label><input type="date" value={scheduleData.date} onChange={(e) => handleScheduleChange({ date: e.target.value })} style={inputStyle} /></div>
              <div><label style={labelStyle}>Time</label><input type="time" value={scheduleData.time} onChange={(e) => handleScheduleChange({ time: e.target.value })} style={inputStyle} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[3], marginBottom: t.spacing[3] }}>
              <div><label style={labelStyle}><Globe size={12} style={{ marginRight: t.spacing[1], verticalAlign: 'middle' }} />Timezone</label><select value={scheduleData.timezone} onChange={(e) => handleScheduleChange({ timezone: e.target.value })} style={selectStyle}>{TIMEZONE_OPTIONS.map((tz) => <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>)}</select></div>
              <div><label style={labelStyle}><Timer size={12} style={{ marginRight: t.spacing[1], verticalAlign: 'middle' }} />Duration</label><select value={scheduleData.estimatedDuration} onChange={(e) => handleScheduleChange({ estimatedDuration: parseInt(e.target.value, 10) })} style={selectStyle}>{DURATION_OPTIONS.map((d) => <option key={d} value={d}>{d} minutes</option>)}</select></div>
            </div>
            {scheduleData.date && scheduleData.time && (
              <div style={{ padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, backgroundColor: t.colors.successScale[50], border: `${bdr} ${t.colors.successScale[200]}`, display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                <CheckCircle size={14} color={t.colors.successScale[600]} />
                <span style={{ fontSize: t.typography.fontSize.xs, color: t.colors.successScale[700], fontWeight: t.typography.fontWeight.medium }}>Time slot available</span>
              </div>
            )}
          </div>

          {/* Configuration */}
          <div style={cardBase}>
            {interviewType.type === 'ai' ? (
              <>
                <SectionTitle icon={<Settings size={18} color={t.colors.neutral[600]} />} label="Agent Configuration" />
                <div style={{ marginBottom: t.spacing[3] }}>
                  <label style={labelStyle}><Thermometer size={12} style={{ marginRight: t.spacing[1], verticalAlign: 'middle' }} />Temperature: {agentConfig.temperature ?? 0.7}</label>
                  <input type="range" min="0" max="1" step="0.1" value={agentConfig.temperature ?? 0.7} onChange={(e) => handleAgentConfigChange({ temperature: parseFloat(e.target.value) })} style={{ width: '100%', accentColor: t.colors.primaryScale[500] }} />
                  <Stack direction="horizontal" justify="space-between" style={{ marginTop: t.spacing[1] }}>
                    <span style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>Focused</span>
                    <span style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>Creative</span>
                  </Stack>
                </div>
                <div style={{ marginBottom: t.spacing[3] }}>
                  <label style={labelStyle}><Timer size={12} style={{ marginRight: t.spacing[1], verticalAlign: 'middle' }} />Max Duration (minutes)</label>
                  <input type="number" min="10" max="120" step="5" value={agentConfig.maxDuration ?? scheduleData.estimatedDuration} onChange={(e) => handleAgentConfigChange({ maxDuration: parseInt(e.target.value, 10) })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}><MessageSquare size={12} style={{ marginRight: t.spacing[1], verticalAlign: 'middle' }} />Custom Prompt (optional)</label>
                  <textarea value={agentConfig.customPrompt ?? ''} onChange={(e) => handleAgentConfigChange({ customPrompt: e.target.value })} placeholder="Add specific instructions for the AI agent..." rows={4} style={{ ...inputStyle, resize: 'vertical' as const, fontFamily: 'inherit' }} />
                </div>
              </>
            ) : (
              <>
                <SectionTitle icon={<FileText size={18} color={t.colors.neutral[600]} />} label="Interviewer Notes" />
                <textarea placeholder="Add notes for the interviewer..." rows={6} style={{ ...inputStyle, resize: 'vertical' as const, fontFamily: 'inherit' }} />
              </>
            )}
          </div>

          {/* Preview & Confirm */}
          <div style={{ ...cardBase, borderLeft: `4px solid ${t.colors.primaryScale[500]}` }}>
            <SectionTitle icon={<Send size={18} color={t.colors.primaryScale[600]} />} label="Preview & Confirm" />
            <div style={{ padding: t.spacing[4], borderRadius: t.borderRadius.md, backgroundColor: t.colors.neutral[50], border: `${bdr} ${t.colors.neutral[200]}`, marginBottom: t.spacing[4] }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: `${t.spacing[2]}px ${t.spacing[4]}px`, fontSize: t.typography.fontSize.sm }}>
                {summaryRows.map(([label, value]) => (
                  <React.Fragment key={label}>
                    <span style={{ color: t.colors.neutral[500], fontWeight: t.typography.fontWeight.medium }}>{label}</span>
                    <span style={{ color: t.colors.neutral[900] }}>{value}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
            {interviewType.type === 'ai' && estimatedCost !== undefined && (
              <div style={{ padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, backgroundColor: t.colors.infoScale[50], border: `${bdr} ${t.colors.infoScale[200]}`, display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
                <DollarSign size={14} color={t.colors.infoScale[600]} />
                <span style={{ fontSize: t.typography.fontSize.sm, color: t.colors.infoScale[700], fontWeight: t.typography.fontWeight.medium }}>Estimated cost: ${estimatedCost.toFixed(2)}</span>
              </div>
            )}
            <Stack direction="horizontal" align="center" gap={t.spacing[2]} style={{ marginBottom: t.spacing[4] }}>
              <Mail size={14} color={t.colors.neutral[600]} />
              <span style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>Send invitation email to candidate</span>
            </Stack>
            <Stack direction="horizontal" gap={t.spacing[3]} justify="end">
              {onCancel && <button onClick={onCancel} style={secondaryBtn}><X size={14} /> Cancel</button>}
              <button onClick={() => { setShowConfirmation(true); onConfirm?.(); }} style={primaryBtn}><Send size={14} /> Schedule Interview</button>
            </Stack>
          </div>
        </div>
      </div>
    );
  },
});
