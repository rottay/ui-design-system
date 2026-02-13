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
} from '../../../helpers';
import type {
  BhCandidateProfileProps,
  CandidateTab,
  CandidateInfo,
  CandidateSkill,
  Experience,
  Education,
  CandidateApplication,
  CandidateInterview,
  ScoreCard,
  CandidateNote,
  CandidateEvent,
  CandidateStats,
} from '../../core';
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

const DEFAULT_CANDIDATE: CandidateInfo = {
  id: 'c-1', name: 'Sarah Johnson', avatar: '',
  currentRole: 'Senior Frontend Engineer at Google',
  location: 'San Francisco, CA', email: 'sarah.j@google.com',
  phone: '+1 (415) 555-0127', source: 'LinkedIn',
  status: 'active', doNotContact: false,
};

const DEFAULT_SKILLS: CandidateSkill[] = [
  { name: 'React', proficiency: 95 }, { name: 'TypeScript', proficiency: 92 },
  { name: 'Next.js', proficiency: 88 }, { name: 'GraphQL', proficiency: 80 },
  { name: 'Node.js', proficiency: 75 }, { name: 'System Design', proficiency: 70 },
  { name: 'Testing', proficiency: 85 }, { name: 'CI/CD', proficiency: 65 },
];

const DEFAULT_EXPERIENCE: Experience[] = [
  { company: 'Google', role: 'Senior Frontend Engineer', startDate: '2021-03', current: true, description: 'Leading frontend architecture for Google Cloud Console. Managing team of 5 engineers.' },
  { company: 'Stripe', role: 'Frontend Engineer', startDate: '2018-06', endDate: '2021-02', current: false, description: 'Built payment dashboard components used by 100k+ merchants.' },
  { company: 'Airbnb', role: 'Junior Developer', startDate: '2016-01', endDate: '2018-05', current: false, description: 'Worked on search and listing pages with React.' },
];

const DEFAULT_EDUCATION: Education[] = [
  { institution: 'Stanford University', degree: 'M.S.', field: 'Computer Science', year: 2016 },
  { institution: 'UC Berkeley', degree: 'B.S.', field: 'Computer Science', year: 2014 },
];

const DEFAULT_APPLICATIONS: CandidateApplication[] = [
  { id: 'a-1', jobName: 'Staff Frontend Engineer', stage: 'Technical Interview', scorePercent: 92, pipelineProgress: 0.6, recruiterName: 'Alex Rivera', status: 'interviewing' },
  { id: 'a-2', jobName: 'Frontend Lead', stage: 'Offer Pending', scorePercent: 88, pipelineProgress: 0.9, recruiterName: 'Jordan Park', status: 'offer_pending' },
  { id: 'a-3', jobName: 'Senior React Developer', stage: 'Screening', scorePercent: 75, pipelineProgress: 0.2, recruiterName: 'Sam Lee', status: 'screening' },
];

const DEFAULT_INTERVIEWS: CandidateInterview[] = [
  { id: 'i-1', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), type: 'ai', status: 'scheduled', duration: '45 min', hasReplay: false },
  { id: 'i-2', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), type: 'human', status: 'completed', scorePercent: 91, duration: '60 min', hasReplay: true },
  { id: 'i-3', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), type: 'ai', status: 'completed', scorePercent: 88, duration: '30 min', hasReplay: true },
];

const DEFAULT_NOTES: CandidateNote[] = [
  { id: 'n-1', authorName: 'Alex Rivera', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), content: 'Strong technical skills, excellent communication. Recommend advancing to final round.', isEditable: true },
  { id: 'n-2', authorName: 'Jordan Park', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), content: 'Initial screening went well. Candidate is enthusiastic about the role and team culture.', isEditable: false },
];

const DEFAULT_EVENTS: CandidateEvent[] = [
  { id: 'e-1', type: 'interview', message: 'Completed AI interview for Staff Frontend Engineer', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), entityName: 'Staff Frontend Engineer' },
  { id: 'e-2', type: 'application', message: 'Applied to Frontend Lead position', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), entityName: 'Frontend Lead' },
  { id: 'e-3', type: 'note', message: 'Alex Rivera added a note', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: 'e-4', type: 'stage', message: 'Moved to Technical Interview stage', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), entityName: 'Staff Frontend Engineer' },
];

const DEFAULT_STATS: CandidateStats = {
  activeApplications: 3, totalInterviews: 7, avgScore: 91,
  lastActivityDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.charAt(0).toUpperCase();
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
    const candidate = props.candidate ?? DEFAULT_CANDIDATE;
    const skills = props.skills ?? DEFAULT_SKILLS;
    const experience = props.experience ?? DEFAULT_EXPERIENCE;
    const education = props.education ?? DEFAULT_EDUCATION;
    const applications = props.applications ?? DEFAULT_APPLICATIONS;
    const interviews = props.interviews ?? DEFAULT_INTERVIEWS;
    const notes = props.notes ?? DEFAULT_NOTES;
    const events = props.events ?? DEFAULT_EVENTS;
    const stats = props.stats ?? DEFAULT_STATS;
    const compensationRange = props.compensationRange ?? { min: 180000, max: 220000, currency: 'USD' };
    const languages = props.languages ?? [{ name: 'English', level: 'Native' }, { name: 'Spanish', level: 'Conversational' }];
    const links = props.links ?? [{ label: 'LinkedIn', url: '#' }, { label: 'GitHub', url: '#' }, { label: 'Portfolio', url: '#' }];
    const documents = props.documents ?? [
      { id: 'd-1', name: 'Resume_Sarah_Johnson.pdf', type: 'pdf', uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { id: 'd-2', name: 'Cover_Letter.pdf', type: 'pdf', uploadedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) },
    ];

    const [activeTab, setActiveTab] = useState<CandidateTab>(props.defaultTab ?? 'profile');
    const [newNoteContent, setNewNoteContent] = useState('');

    const statusConfig = getStatusConfig(candidate.status ?? 'active', t);
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
              const pb = createProgressBarStyle(t, { percent: skill.proficiency, color: getScoreColor(skill.proficiency, t) });
              return (
                <Box key={skill.name} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], width: 120, flexShrink: 0, fontWeight: t.typography.fontWeight.medium }}>{skill.name}</Text>
                  <Box style={{ flex: 1 }}><Box style={{ ...pb.track, height: 6 }}><Box style={{ ...pb.fill, height: 6 }} /></Box></Box>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[600], width: 32, textAlign: 'right' }}>{skill.proficiency}</Text>
                </Box>
              );
            })}
          </Box>
        </SectionCard>

        {/* Experience */}
        <SectionCard title="Experience">
          <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[5] }}>
            {experience.map((exp, idx) => (
              <Box key={idx} style={{ display: 'flex', gap: t.spacing[4] }}>
                <Box style={{
                  width: 40, height: 40, borderRadius: t.borderRadius.lg, flexShrink: 0,
                  backgroundColor: t.colors.primaryScale[50], display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Building size={18} color={t.colors.primaryScale[500]} />
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1 }}>
                  <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], marginBottom: t.spacing[1] }}>{exp.role}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600], marginBottom: 4 }}>{exp.company}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], marginBottom: t.spacing[2] }}>
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </Text>
                  {exp.description && (
                    <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600], lineHeight: t.typography.lineHeight.relaxed }}>{exp.description}</Text>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </SectionCard>

        {/* Education */}
        <SectionCard title="Education">
          <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[4] }}>
            {education.map((edu, idx) => (
              <Box key={idx} style={{ display: 'flex', gap: t.spacing[4] }}>
                <Box style={{
                  width: 40, height: 40, borderRadius: t.borderRadius.lg, flexShrink: 0,
                  backgroundColor: t.colors.warningScale[50], display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <GraduationCap size={18} color={t.colors.warningScale[600]} />
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                  <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>
                    {edu.degree} in {edu.field}
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600] }}>{edu.institution}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>Class of {edu.year}</Text>
                </Box>
              </Box>
            ))}
          </Box>
        </SectionCard>

        {/* Additional info: compensation, languages, links */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: t.spacing[4] }}>
          <SectionCard title="Compensation">
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <DollarSign size={16} color={t.colors.successScale[500]} />
              <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                ${(compensationRange.min / 1000).toFixed(0)}k - ${(compensationRange.max / 1000).toFixed(0)}k
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{compensationRange.currency}</Text>
            </Box>
          </SectionCard>
          <SectionCard title="Languages">
            <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
              {languages.map(lang => (
                <Box key={lang.name} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>{lang.name}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{lang.level}</Text>
                </Box>
              ))}
            </Box>
          </SectionCard>
          <SectionCard title="Links">
            <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
              {links.map(link => (
                <Box key={link.label} onClick={() => {}} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], cursor: 'pointer', color: t.colors.primaryScale[600] }}>
                  <Globe size={14} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium }}>{link.label}</Text>
                  <ExternalLink size={12} />
                </Box>
              ))}
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
                    <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: getScoreColor(interview.scorePercent, t) }}>{interview.scorePercent}%</Text>
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
                      <Play size={12} /> Replay
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
            <Download size={16} color={t.colors.neutral[400]} />
          </Box>
        ))}
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
        case 'scores': return renderApplicationsTab(); // scores can share application view
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
              {candidate.avatar
                ? <img src={candidate.avatar} alt={candidate.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : getInitials(candidate.name)
              }
            </Box>

            {/* Name + info */}
            <Box style={{ flex: 1 }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                  {candidate.name}
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
                {candidate.doNotContact && (
                  <Box style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: `2px ${t.spacing[3]}px`, borderRadius: badgeRadius,
                    backgroundColor: t.colors.errorScale[50], fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.medium, color: t.colors.errorScale[700],
                  }}>
                    <AlertTriangle size={12} /> Do Not Contact
                  </Box>
                )}
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4], marginBottom: t.spacing[2] }}>
                {candidate.currentRole && (
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                    <Briefcase size={14} color={t.colors.neutral[400]} />
                    <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600] }}>{candidate.currentRole}</Text>
                  </Box>
                )}
                {candidate.location && (
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                    <MapPin size={14} color={t.colors.neutral[400]} />
                    <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>{candidate.location}</Text>
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
                  <Edit2 size={12} /> Edit
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
                <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>{stat.value}</Text>
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
                <TabIcon size={16} />
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
