'use client';

/**
 * BhCandidateProfile - Full Preset
 * Comprehensive candidate view with tabbed navigation covering profile,
 * applications, interviews, scores, notes, activity, and documents.
 *
 * Slite-inspired: generous spacing, warm tones, section cards,
 * proficiency rings, timeline dots, and clean tab navigation.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createProgressBarStyle,
  createCardHoverStyles,
  getPersonalityBadgeRadius,
  getCardPadding,
  createMetadataFieldStyle,
  createMetadataValueStyle,
  createStatValueStyle,
  ICON_SIZES,
} from '../../../helpers';
import type {
  BhCandidateProfileProps,
  CandidateTab,
  CandidateApplication,
  CandidateInterview,
  ScoreCard,
  CandidateNote,
  CandidateEvent,
  CandidateStats,
} from '../../core';
import {
  getCandidateFullName, getCandidateRole, getCandidateLocation,
  getCandidateSkills, getCandidateLanguages, getCandidateLinks, getCandidateCompensation,
} from '../../core';
import type { DBCandidate } from '@rottay/recruiter';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Briefcase, MapPin, Mail, Phone, ExternalLink, Star, Edit2,
  Calendar, FileText, MessageSquare, Activity, ChevronRight,
  User, ClipboardList, Mic, BarChart3, StickyNote, Clock,
  Upload, Download, Trash2, Plus, Play, Send, AlertTriangle,
  Building, GraduationCap, Globe, Award, DollarSign,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (name || '').charAt(0).toUpperCase();
}

function getStatusConfig(status: string, t: DesignTokens) {
  const map: Record<string, { dot: string; label: string; bg: string; text: string }> = {
    active: { dot: t.colors.successScale[500], label: 'Active', bg: t.colors.successScale[50], text: t.colors.successScale[700] },
    passive: { dot: t.colors.infoScale[500], label: 'Passive', bg: t.colors.infoScale[50], text: t.colors.infoScale[700] },
    hired: { dot: t.colors.primaryScale[500], label: 'Hired', bg: t.colors.primaryScale[50], text: t.colors.primaryScale[700] },
    inactive: { dot: t.colors.neutral[400], label: 'Inactive', bg: t.colors.neutral[100], text: t.colors.neutral[600] },
    do_not_contact: { dot: t.colors.errorScale[500], label: 'DNC', bg: t.colors.errorScale[50], text: t.colors.errorScale[700] },
  };
  return map[status] ?? map['inactive'];
}

function getScoreColor(score: number, t: DesignTokens): string {
  if (score >= 80) return t.colors.successScale[500];
  if (score >= 60) return t.colors.warningScale[500];
  return t.colors.errorScale[500];
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 0) return `in ${Math.abs(hours)}h`;
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function getAppStageColor(status: string, t: DesignTokens) {
  const map: Record<string, { bg: string; text: string }> = {
    screening: { bg: t.colors.neutral[100], text: t.colors.neutral[600] },
    reviewing: { bg: t.colors.infoScale[50], text: t.colors.infoScale[700] },
    interviewing: { bg: t.colors.primaryScale[50], text: t.colors.primaryScale[700] },
    offer_pending: { bg: t.colors.warningScale[50], text: t.colors.warningScale[700] },
    hired: { bg: t.colors.successScale[50], text: t.colors.successScale[700] },
    rejected: { bg: t.colors.errorScale[50], text: t.colors.errorScale[700] },
  };
  return map[status] ?? map['screening'];
}

/* ------------------------------------------------------------------ */
/*  Score Ring                                                         */
/* ------------------------------------------------------------------ */

function ScoreRing({ score, tokens: t, size = 64 }: { score: number; tokens: DesignTokens; size?: number }) {
  const color = getScoreColor(score, t);
  const r = (size / 2) - 5;
  const circumference = 2 * Math.PI * r;
  const strokeOffset = circumference - (score / 100) * circumference;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.colors.neutral[100]} strokeWidth="4" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circumference} strokeDashoffset={strokeOffset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 9, color: t.colors.neutral[400], lineHeight: 1, marginTop: t.spacing[1] }}>avg</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */

const TAB_CONFIG: { key: CandidateTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'applications', label: 'Applications', icon: ClipboardList },
  { key: 'interviews', label: 'Interviews', icon: Mic },
  { key: 'scores', label: 'Scores', icon: BarChart3 },
  { key: 'notes', label: 'Notes', icon: StickyNote },
  { key: 'activity', label: 'Activity', icon: Activity },
  { key: 'documents', label: 'Documents', icon: FileText },
];

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const FullBhCandidateProfile = createPreset<BhCandidateProfileProps>({
  name: 'BhCandidateProfile.Full',
  render: ({ primitives, props, tokens: t }: PresetContext<BhCandidateProfileProps>) => {
    const { Box, Text } = primitives;
    const candidate = props.candidate ?? {} as Partial<DBCandidate> as DBCandidate;
    const fullName = useMemo(() => getCandidateFullName(candidate), [candidate]);
    const role = useMemo(() => getCandidateRole(candidate), [candidate]);
    const location = useMemo(() => getCandidateLocation(candidate), [candidate]);
    const skills = useMemo(() => getCandidateSkills(candidate), [candidate]);
    const candidateLanguages = useMemo(() => getCandidateLanguages(candidate), [candidate]);
    const candidateLinks = useMemo(() => getCandidateLinks(candidate), [candidate]);
    const compensationRange = useMemo(() => getCandidateCompensation(candidate) ?? { min: 0, max: 0, currency: 'USD' }, [candidate]);
    const applications = props.applications ?? [];
    const interviews = props.interviews ?? [];
    const notes = props.notes ?? [];
    const events = props.events ?? [];
    const stats = props.stats ?? {} as Partial<CandidateStats> as CandidateStats;
    const documents = props.documents ?? [
      { id: 'd-1', name: 'Resume_Sarah_Johnson.pdf', type: 'pdf', uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { id: 'd-2', name: 'Cover_Letter.pdf', type: 'pdf', uploadedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) },
    ];

    const scoreCards = props.scoreCards ?? [];
    const documentLinks = props.documentLinks;

    const [activeTab, setActiveTab] = useState<CandidateTab>(props.defaultTab ?? 'profile');
    const [newNoteContent, setNewNoteContent] = useState('');

    const statusConfig = getStatusConfig((candidate.status as string) ?? 'active', t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const handleTabChange = useCallback((tab: CandidateTab) => {
      setActiveTab(tab);
      props.onTabChange?.(tab);
    }, [props.onTabChange]);

    /* -- Section Card wrapper ---------------------------------------- */
    const SectionCard = ({ children, title, extra }: { children: React.ReactNode; title?: string; extra?: React.ReactNode }) => (
      <Box style={{
        ...createCardStyle(t, { elevation: 'sm' }),
        padding: `${t.spacing[6]}px`, border: `1px solid ${t.colors.neutral[100]}`,
        backgroundColor: t.colors.common.white, marginBottom: t.spacing[4],
      }}>
        {title && (
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[4] }}>
            <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>
              {title}
            </Text>
            {extra}
          </Box>
        )}
        {children}
      </Box>
    );

    /* -- Profile Tab ------------------------------------------------- */
    const renderProfileTab = () => (
      <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[4] }}>
        {/* Skills */}
        <SectionCard title="Skills">
          <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
            {skills.map(skill => {
              const yoe = skill.yearsOfExperience ?? 0;
              const proficiency = Math.min(100, yoe * 12); // approximate proficiency from years
              const pb = createProgressBarStyle(t, { percent: proficiency, color: getScoreColor(proficiency, t) });
              return (
                <Box key={skill.name} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], width: 120, flexShrink: 0, fontWeight: t.typography.fontWeight.medium }}>{skill.name}</Text>
                  <Box style={{ flex: 1 }}><Box style={{ ...pb.track, height: 6 }}><Box style={{ ...pb.fill, height: 6 }} /></Box></Box>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[600], width: 48, textAlign: 'right' }}>{skill.level ?? `${yoe}y`}</Text>
                </Box>
              );
            })}
          </Box>
        </SectionCard>

        {/* Experience summary */}
        {(role || candidate.yearsOfExperience != null) && (
          <SectionCard title="Experience">
            <Box style={{ display: 'flex', gap: t.spacing[4] }}>
              <Box style={{
                width: 40, height: 40, borderRadius: t.borderRadius.lg, flexShrink: 0,
                backgroundColor: t.colors.primaryScale[50], display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Building size={18} color={t.colors.primaryScale[500]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1 }}>
                {role && <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>{role}</Text>}
                {candidate.yearsOfExperience != null && (
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600] }}>{candidate.yearsOfExperience} years of experience</Text>
                )}
                {candidate.headline && (
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], marginTop: t.spacing[2], lineHeight: t.typography.lineHeight.relaxed }}>{candidate.headline}</Text>
                )}
              </Box>
            </Box>
          </SectionCard>
        )}

        {/* Availability info */}
        {props.availability && (props.availability.availableFrom || props.availability.noticePeriodDays != null) && (
          <SectionCard title="Availability">
            <Box style={{ display: 'flex', gap: t.spacing[4], flexWrap: 'wrap' }}>
              {props.availability.availableFrom && (
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                  <Calendar size={14} color={t.colors.infoScale[500]} />
                  <Box style={createMetadataFieldStyle(t)}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>Available from</Text>
                    <Text style={createMetadataValueStyle(t, { weight: 'semibold' })}>
                      {formatDate(props.availability.availableFrom)}
                    </Text>
                  </Box>
                </Box>
              )}
              {props.availability.noticePeriodDays != null && (
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                  <Clock size={14} color={t.colors.warningScale[500]} />
                  <Box style={createMetadataFieldStyle(t)}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>Notice period</Text>
                    <Text style={createMetadataValueStyle(t, { weight: 'semibold' })}>
                      {props.availability.noticePeriodDays} days
                    </Text>
                  </Box>
                </Box>
              )}
              {props.availability.requiresVisaSponsorship != null && (
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                  <Globe size={14} color={props.availability.requiresVisaSponsorship ? t.colors.warningScale[500] : t.colors.successScale[500]} />
                  <Box style={createMetadataFieldStyle(t)}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>Visa sponsorship</Text>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: props.availability.requiresVisaSponsorship ? t.colors.warningScale[700] : t.colors.successScale[700] }}>
                      {props.availability.requiresVisaSponsorship ? 'Required' : 'Not required'}
                    </Text>
                  </Box>
                </Box>
              )}
            </Box>
          </SectionCard>
        )}

        {/* Additional info: compensation, languages, links */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: t.spacing[4] }}>
          <SectionCard title="Compensation">
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <DollarSign size={ICON_SIZES.section} color={t.colors.successScale[500]} />
              <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                ${((compensationRange.min ?? 0) / 1000).toFixed(0)}k - ${((compensationRange.max ?? 0) / 1000).toFixed(0)}k
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{compensationRange.currency}</Text>
            </Box>
            {props.compensation?.currentSalary != null && (
              <Box style={{ marginTop: t.spacing[2] }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>Current: ${((props.compensation.currentSalary) / 1000).toFixed(0)}k {props.compensation.currentSalaryCurrency ?? ''}</Text>
              </Box>
            )}
          </SectionCard>
          <SectionCard title="Languages">
            <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
              {candidateLanguages.length > 0 ? candidateLanguages.map(lang => (
                <Box key={lang.language} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>{lang.language}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{lang.proficiency}</Text>
                </Box>
              )) : (
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>No languages listed</Text>
              )}
            </Box>
          </SectionCard>
          <SectionCard title="Links">
            <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
              {candidateLinks.length > 0 ? candidateLinks.map(link => (
                <Box key={link.label} onClick={() => {}} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], cursor: 'pointer', color: t.colors.primaryScale[600] }}>
                  <Globe size={14} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium }}>{link.label}</Text>
                  <ExternalLink size={ICON_SIZES.label} />
                </Box>
              )) : null}
              {/* Document Links from prop (portfolio, github, website, linkedin) */}
              {documentLinks && (
                <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2], marginTop: candidateLinks.length > 0 ? t.spacing[2] : 0 }}>
                  {documentLinks.portfolioUrl && (
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], color: t.colors.primaryScale[600] }}>
                      <Award size={14} />
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium }}>Portfolio</Text>
                      <ExternalLink size={ICON_SIZES.label} />
                    </Box>
                  )}
                  {documentLinks.githubUrl && (
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], color: t.colors.primaryScale[600] }}>
                      <Globe size={14} />
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium }}>GitHub</Text>
                      <ExternalLink size={ICON_SIZES.label} />
                    </Box>
                  )}
                  {documentLinks.websiteUrl && (
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], color: t.colors.primaryScale[600] }}>
                      <Globe size={14} />
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium }}>Website</Text>
                      <ExternalLink size={ICON_SIZES.label} />
                    </Box>
                  )}
                  {documentLinks.linkedinUrl && (
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], color: t.colors.primaryScale[600] }}>
                      <Globe size={14} />
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium }}>LinkedIn</Text>
                      <ExternalLink size={ICON_SIZES.label} />
                    </Box>
                  )}
                </Box>
              )}
              {candidateLinks.length === 0 && !documentLinks && (
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>No links available</Text>
              )}
            </Box>
          </SectionCard>
        </Box>
      </Box>
    );

    /* -- Applications Tab -------------------------------------------- */
    const renderApplicationsTab = () => (
      <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
        {applications.map(app => {
          const stageColors = getAppStageColor(app.status, t);
          const pb = createProgressBarStyle(t, { percent: app.pipelineProgress * 100 });
          return (
            <Box key={app.id} onClick={() => props.onApplicationClick?.(app.id)} style={{
              ...createCardStyle(t, { elevation: 'sm', interactive: true }),
              padding: `${t.spacing[5]}px`, border: `1px solid ${t.colors.neutral[100]}`,
              backgroundColor: t.colors.common.white, cursor: 'pointer',
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
                <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>{app.jobName}</Text>
                <Box style={{ padding: `2px ${t.spacing[3]}px`, borderRadius: badgeRadius, backgroundColor: stageColors.bg, color: stageColors.text, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium }}>
                  {app.stage}
                </Box>
              </Box>
              <Box style={{ marginBottom: t.spacing[3] }}>
                <Box style={{ ...pb.track, height: 6, marginBottom: t.spacing[1] }}><Box style={{ ...pb.fill, height: 6 }} /></Box>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{Math.round(app.pipelineProgress * 100)}% complete</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Score:</Text>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: getScoreColor(app.scorePercent, t) }}>{app.scorePercent}%</Text>
                </Box>
                {app.recruiterName && (
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>Recruiter: {app.recruiterName}</Text>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    );

    /* -- Interviews Tab ---------------------------------------------- */
    const renderInterviewsTab = () => (
      <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
        {interviews.map(interview => {
          const isUpcoming = interview.status === 'scheduled';
          const statusColor = interview.status === 'completed' ? t.colors.successScale : interview.status === 'scheduled' ? t.colors.primaryScale : t.colors.neutral;
          return (
            <Box key={interview.id} onClick={() => props.onInterviewClick?.(interview.id)} style={{
              ...createCardStyle(t, { elevation: 'sm', interactive: true }),
              padding: `${t.spacing[5]}px`, border: `1px solid ${isUpcoming ? t.colors.primaryScale[200] : t.colors.neutral[100]}`,
              backgroundColor: isUpcoming ? t.colors.primaryScale[50] : t.colors.common.white, cursor: 'pointer',
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                  <Box style={{
                    width: 40, height: 40, borderRadius: t.borderRadius.lg,
                    backgroundColor: interview.type === 'ai' ? t.colors.primaryScale[100] : t.colors.infoScale[100],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Mic size={18} color={interview.type === 'ai' ? t.colors.primaryScale[600] : t.colors.infoScale[600]} />
                  </Box>
                  <Box>
                    <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>
                      {interview.type === 'ai' ? 'AI Interview' : 'Panel Interview'}
                    </Text>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{formatDate(interview.date)}</Text>
                      {interview.duration && <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{interview.duration}</Text>}
                    </Box>
                  </Box>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                  {interview.scorePercent !== undefined && (
                    <Text style={{ ...createStatValueStyle(t, { size: 'lg' }), color: getScoreColor(interview.scorePercent, t) }}>{interview.scorePercent}%</Text>
                  )}
                  <Box style={{ padding: `2px ${t.spacing[3]}px`, borderRadius: badgeRadius, backgroundColor: (statusColor as any)[50], color: (statusColor as any)[700], fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, textTransform: 'capitalize' }}>
                    {interview.status}
                  </Box>
                  {interview.hasReplay && (
                    <button onClick={(e) => { e.stopPropagation(); props.onReplayClick?.(interview.id); }} style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                      borderRadius: t.borderRadius.md, border: `1px solid ${t.colors.neutral[200]}`,
                      backgroundColor: t.colors.common.white, color: t.colors.neutral[600],
                      fontSize: t.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                      <Play size={ICON_SIZES.label} /> Replay
                    </button>
                  )}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    );

    /* -- Notes Tab --------------------------------------------------- */
    const renderNotesTab = () => (
      <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[4] }}>
        {/* Add note */}
        <Box style={{
          ...createCardStyle(t, { elevation: 'sm' }), padding: `${t.spacing[4]}px`,
          border: `1px solid ${t.colors.neutral[100]}`, backgroundColor: t.colors.common.white,
        }}>
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Add a note about this candidate..."
            style={{
              width: '100%', minHeight: 80, padding: t.spacing[3], borderRadius: t.borderRadius.md,
              border: `1px solid ${t.colors.neutral[200]}`, fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[700], fontFamily: 'inherit', outline: 'none', resize: 'vertical',
            }}
          />
          <Box style={{ display: 'flex', justifyContent: 'flex-end', marginTop: t.spacing[2] }}>
            <button onClick={() => { props.onNoteAdd?.(newNoteContent); setNewNoteContent(''); }} style={{
              padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.md,
              border: 'none', backgroundColor: t.colors.primaryScale[500], color: t.colors.common.white,
              fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium,
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: t.spacing[1],
            }}>
              <Send size={14} /> Add Note
            </button>
          </Box>
        </Box>

        {notes.map(note => (
          <Box key={note.id} style={{
            ...createCardStyle(t, { elevation: 'sm' }), padding: `${t.spacing[5]}px`,
            border: `1px solid ${t.colors.neutral[100]}`, backgroundColor: t.colors.common.white,
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                <Box style={{
                  width: 32, height: 32, borderRadius: t.borderRadius.full,
                  backgroundColor: t.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.primaryScale[700],
                }}>
                  {getInitials(note.authorName)}
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>{note.authorName}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{timeAgo(note.timestamp)}</Text>
                </Box>
              </Box>
              {note.isEditable && (
                <Box style={{ display: 'flex', gap: t.spacing[1] }}>
                  <button style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: t.colors.neutral[400], display: 'flex', padding: 4 }}><Edit2 size={14} /></button>
                  <button onClick={() => props.onNoteDelete?.(note.id)} style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: t.colors.neutral[400], display: 'flex', padding: 4 }}><Trash2 size={14} /></button>
                </Box>
              )}
            </Box>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], lineHeight: t.typography.lineHeight.relaxed }}>{note.content}</Text>
          </Box>
        ))}
      </Box>
    );

    /* -- Activity Tab ------------------------------------------------ */
    const renderActivityTab = () => (
      <Box style={{ display: 'flex', flexDirection: 'column' }}>
        {events.map((event, idx) => (
          <Box key={event.id} style={{ display: 'flex', gap: t.spacing[4], position: 'relative' }}>
            {/* Timeline line */}
            {idx < events.length - 1 && (
              <Box style={{
                position: 'absolute', left: 15, top: 32, bottom: 0, width: 1,
                backgroundColor: t.colors.neutral[200],
              }} />
            )}
            {/* Dot */}
            <Box style={{
              width: 32, height: 32, borderRadius: t.borderRadius.full, flexShrink: 0,
              backgroundColor: t.colors.primaryScale[50], border: `2px solid ${t.colors.primaryScale[200]}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
            }}>
              <Activity size={14} color={t.colors.primaryScale[500]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1, paddingBottom: t.spacing[5] }}>
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], marginBottom: t.spacing[1] }}>{event.message}</Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{timeAgo(event.timestamp)}</Text>
            </Box>
          </Box>
        ))}
      </Box>
    );

    /* -- Documents Tab ----------------------------------------------- */
    const renderDocumentsTab = () => (
      <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
        {documents.map(doc => (
          <Box key={doc.id} onClick={() => props.onDocumentClick?.(doc.id)} style={{
            ...createCardStyle(t, { elevation: 'sm', interactive: true }),
            padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
            border: `1px solid ${t.colors.neutral[100]}`, backgroundColor: t.colors.common.white,
            display: 'flex', alignItems: 'center', gap: t.spacing[3], cursor: 'pointer',
          }}>
            <Box style={{
              width: 40, height: 40, borderRadius: t.borderRadius.lg,
              backgroundColor: t.colors.errorScale[50], display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileText size={18} color={t.colors.errorScale[500]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1 }}>
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{doc.name}</Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>Uploaded {formatDate(doc.uploadedAt)}</Text>
            </Box>
            <Download size={ICON_SIZES.section} color={t.colors.neutral[400]} />
          </Box>
        ))}
      </Box>
    );

    /* -- Scores Tab -------------------------------------------------- */
    const renderScoresTab = () => (
      <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[4] }}>
        {scoreCards.length > 0 ? scoreCards.map(sc => {
          const overallColor = getScoreColor(sc.overallScore, t);
          return (
            <Box key={sc.applicationId} style={{
              ...createCardStyle(t, { elevation: 'sm' }),
              padding: `${t.spacing[5]}px`, border: `1px solid ${t.colors.neutral[100]}`,
              backgroundColor: t.colors.common.white,
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
                <Box>
                  <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>{sc.jobName}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{sc.date}</Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                  <Text style={{ ...createStatValueStyle(t), color: overallColor }}>{sc.overallScore}%</Text>
                </Box>
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                {sc.dimensions.map(dim => {
                  const dimMax = (dim as any).maxScore ?? 100;
                  const dimPct = dimMax > 0 ? Math.round((dim.score / dimMax) * 100) : 0;
                  const dimColor = getScoreColor(dimPct, t);
                  const pb = createProgressBarStyle(t, { percent: dimPct, color: dimColor });
                  return (
                    <Box key={dim.name} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700], width: 120, flexShrink: 0, fontWeight: t.typography.fontWeight.medium }}>{dim.name}</Text>
                      <Box style={{ flex: 1 }}><Box style={{ ...pb.track, height: 6 }}><Box style={{ ...pb.fill, height: 6 }} /></Box></Box>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[600], width: 48, textAlign: 'right' }}>{dim.score}/{dimMax}</Text>
                      {dim.weight > 0 && (
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], width: 36, textAlign: 'right' }}>{Math.round(dim.weight * 100)}%</Text>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
        }) : (
          <Box style={{
            padding: `${t.spacing[8]}px`, textAlign: 'center',
          }}>
            <BarChart3 size={32} color={t.colors.neutral[300]} style={{ marginBottom: t.spacing[2] }} />
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>No score cards available</Text>
          </Box>
        )}
      </Box>
    );

    /* -- Tab content router ------------------------------------------ */
    const renderTabContent = () => {
      switch (activeTab) {
        case 'profile': return renderProfileTab();
        case 'applications': return renderApplicationsTab();
        case 'interviews': return renderInterviewsTab();
        case 'notes': return renderNotesTab();
        case 'activity': return renderActivityTab();
        case 'documents': return renderDocumentsTab();
        case 'scores': return renderScoresTab();
        default: return renderProfileTab();
      }
    };

    /* -- Main Render ------------------------------------------------- */
    return (
      <Box className={props.className} style={{
        display: 'flex', flexDirection: 'column', height: '100%',
        backgroundColor: t.colors.neutral[50], ...props.style,
      }}>
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[6]}px ${t.spacing[7]}px`,
          backgroundColor: t.colors.common.white,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[5] }}>
            {/* Avatar */}
            <Box style={{
              width: 72, height: 72, borderRadius: t.borderRadius.full, flexShrink: 0,
              overflow: 'hidden', backgroundColor: t.colors.primaryScale[100],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold,
              color: t.colors.primaryScale[700],
            }}>
              {candidate.avatarUrl
                ? <img src={candidate.avatarUrl} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : getInitials(fullName)
              }
            </Box>

            {/* Name + info */}
            <Box style={{ flex: 1 }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                  {fullName}
                </Text>
                <Box style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: `2px ${t.spacing[3]}px`, borderRadius: badgeRadius,
                  backgroundColor: statusConfig.bg, fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.medium, color: statusConfig.text,
                }}>
                  <Box style={{ width: 6, height: 6, borderRadius: t.borderRadius.full, backgroundColor: statusConfig.dot }} />
                  {statusConfig.label}
                </Box>
                {candidate.status === 'do_not_contact' && (
                  <Box style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: `2px ${t.spacing[3]}px`, borderRadius: badgeRadius,
                    backgroundColor: t.colors.errorScale[50], fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.medium, color: t.colors.errorScale[700],
                  }}>
                    <AlertTriangle size={ICON_SIZES.label} /> Do Not Contact
                  </Box>
                )}
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4], marginBottom: t.spacing[2] }}>
                {role && (
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                    <Briefcase size={14} color={t.colors.neutral[400]} />
                    <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600] }}>{role}</Text>
                  </Box>
                )}
                {location && (
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                    <MapPin size={14} color={t.colors.neutral[400]} />
                    <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>{location}</Text>
                  </Box>
                )}
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
                {candidate.email && (
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                    <Mail size={13} color={t.colors.neutral[400]} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{candidate.email}</Text>
                  </Box>
                )}
                {candidate.phone && (
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                    <Phone size={13} color={t.colors.neutral[400]} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{candidate.phone}</Text>
                  </Box>
                )}
                {candidate.source && (
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>Source: {candidate.source}</Text>
                )}
              </Box>
            </Box>

            {/* Score + edit */}
            <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: t.spacing[2] }}>
              <ScoreRing score={stats.avgScore} tokens={t} />
              {props.onEditProfile && (
                <button onClick={props.onEditProfile} style={{
                  padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md,
                  border: `1px solid ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white,
                  color: t.colors.neutral[600], fontSize: t.typography.fontSize.xs, cursor: 'pointer',
                  fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <Edit2 size={ICON_SIZES.label} /> Edit
                </button>
              )}
            </Box>
          </Box>

          {/* Stats row */}
          <Box style={{
            display: 'flex', gap: t.spacing[6], marginTop: t.spacing[5],
            padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
            backgroundColor: t.colors.neutral[50], borderRadius: t.borderRadius.lg,
          }}>
            {[
              { label: 'Active Applications', value: stats.activeApplications, color: t.colors.primaryScale[500] },
              { label: 'Total Interviews', value: stats.totalInterviews, color: t.colors.infoScale[500] },
              { label: 'Avg Score', value: `${stats.avgScore}%`, color: t.colors.successScale[500] },
              { label: 'Last Activity', value: timeAgo(stats.lastActivityDate), color: t.colors.warningScale[500] },
            ].map(stat => (
              <Box key={stat.label}>
                <Text style={createStatValueStyle(t)}>{stat.value}</Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{stat.label}</Text>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Tabs */}
        <Box style={{
          display: 'flex', gap: 0,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.common.white,
          padding: `0 ${t.spacing[7]}px`,
        }}>
          {TAB_CONFIG.map(tab => {
            const isActive = activeTab === tab.key;
            const TabIcon = tab.icon;
            return (
              <Box
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[2],
                  padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                  borderBottom: `2px solid ${isActive ? t.colors.primaryScale[500] : 'transparent'}`,
                  color: isActive ? t.colors.primaryScale[600] : t.colors.neutral[500],
                  fontSize: t.typography.fontSize.sm, fontWeight: isActive ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium,
                  cursor: 'pointer', transition: `all ${t.motion.hover}`,
                  marginBottom: -1,
                }}
              >
                <TabIcon size={ICON_SIZES.section} />
                {tab.label}
              </Box>
            );
          })}
        </Box>

        {/* Tab Content */}
        <Box style={{ flex: 1, overflow: 'auto', padding: `${t.spacing[5]}px ${t.spacing[7]}px` }}>
          {renderTabContent()}
        </Box>
      </Box>
    );
  },
});
