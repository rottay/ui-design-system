'use client';

/**
 * BhInterviewPrep - Standard Preset
 * Slite-inspired interview preparation briefing with interview info hero,
 * candidate summary with SVG bar chart, evaluation rubric, script accordion,
 * and pre-interview checklist.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
} from '../../../helpers';
import type {
  BhInterviewPrepProps,
  ChecklistItem,
} from '../../core';
import {
  Bot, User, Calendar, Clock, Target, AlertTriangle,
  CheckCircle, XCircle, HelpCircle, ChevronDown, ChevronRight,
  Briefcase, BookOpen, ListChecks, Star, Shield, Eye,
} from 'lucide-react';

const CHECKLIST_STATUS_CONFIG: Record<ChecklistItem['status'], { colorKey: 'success' | 'error' | 'warning'; label: string }> = {
  pass: { colorKey: 'success', label: 'Pass' },
  fail: { colorKey: 'error', label: 'Fail' },
  pending: { colorKey: 'warning', label: 'Pending' },
};

function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

export const StandardBhInterviewPrep = createPreset<BhInterviewPrepProps>({
  name: 'BhInterviewPrep.Standard',
  render: ({ primitives, props, tokens }: PresetContext<BhInterviewPrepProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;
    const isGlass = t.surface.useGlass;
    const bdr = `${t.surface.borderWidth} ${t.surface.borderStyle}`;

    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);


    const glassCard = useMemo(() =>
      isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg, border: `${bdr} ${t.glass.border}` } : {},
      [isGlass, t, bdr]
    );

    const handleKeyNav = useCallback((e: React.KeyboardEvent, action: () => void) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); action(); }
    }, []);

    const animStyle = useCallback((index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    }), [entrance, t]);

    const {
      interviewBrief, candidateBrief, evaluationFocus, scriptOverview,
      checklist: externalChecklist = [], onChecklistUpdate,
      expandedSections: externalExpandedSections, onSectionToggle,
      showFullRubric: externalShowFullRubric = false, onRubricToggle,
      className, style,
    } = props;

    const [checklistStatus, setChecklistStatus] = useState<Record<string, ChecklistItem['status']>>(() => {
      const map: Record<string, ChecklistItem['status']> = {};
      externalChecklist.forEach((item) => { map[item.key] = item.status; });
      return map;
    });
    const [expandedSections, setExpandedSections] = useState<string[]>(externalExpandedSections ?? []);
    const [showFullRubric, setShowFullRubric] = useState(externalShowFullRubric);

    const handleChecklistUpdate = useCallback((key: string, status: ChecklistItem['status']) => {
      setChecklistStatus((prev) => ({ ...prev, [key]: status }));
      onChecklistUpdate?.(key, status);
    }, [onChecklistUpdate]);

    const handleSectionToggle = useCallback((title: string) => {
      setExpandedSections((prev) => prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title]);
      onSectionToggle?.(title);
    }, [onSectionToggle]);

    const handleRubricToggle = useCallback(() => {
      const next = !showFullRubric;
      setShowFullRubric(next);
      onRubricToggle?.(next);
    }, [showFullRubric, onRubricToggle]);

    const cardBase = useMemo<React.CSSProperties>(() => ({
      ...createCardStyle(t, { elevation: 'sm', padding: 0 }),
      borderRadius: t.borderRadius.lg,
      border: `${bdr} ${t.colors.neutral[100]}`,
      padding: `${t.spacing[5]}px`,
      ...glassCard,
      ...accentBar,
    }), [t, bdr, glassCard, accentBar]);

    return (
      <Box className={className} style={{
        padding: `${t.spacing[6]}px`, backgroundColor: t.colors.neutral[50],
        minHeight: '100%', width: '100%', ...style,
      }}>
        <Box style={{
          display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5],
          maxWidth: 900, margin: '0 auto',
        }}>
          {/* Interview Info Hero */}
          {interviewBrief && (
            <Box style={{
              ...createCardStyle(t, { elevation: 'sm', padding: 0 }),
              borderRadius: t.borderRadius.lg, border: `${bdr} ${t.colors.neutral[100]}`,
              padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
              background: `linear-gradient(135deg, ${t.colors.primaryScale[50]}, ${t.colors.primaryScale[100]})`,
              ...glassCard,
              ...animStyle(0),
            }} role="region" aria-label="Interview brief">
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[3] }}>
                <Briefcase size={20} color={t.colors.primaryScale[600]} />
                <Text style={{
                  fontSize: t.typography.fontSize['2xl'], fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900], letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  {interviewBrief.jobTitle}
                </Text>
              </Box>

              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], flexWrap: 'wrap' as const }}>
                <Box style={{
                  ...createBadgeStyle(t, 'primary'),
                  fontSize: t.typography.fontSize.sm,
                  padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                  borderRadius: badgeRadius,
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.sm }}>{interviewBrief.stageName}</Text>
                </Box>
                {(() => {
                  const isAi = interviewBrief.type === 'ai' || interviewBrief.type === 'ai_voice' || interviewBrief.type === 'ai_chat';
                  const modeLabels: Record<string, string> = { ai: 'AI', ai_voice: 'AI Voice', ai_chat: 'AI Chat', human: 'Human', human_video: 'Video', human_phone: 'Phone', in_person: 'In Person' };
                  return (
                    <Box style={{
                      ...createBadgeStyle(t, isAi ? 'info' : 'secondary'),
                      fontSize: t.typography.fontSize.sm,
                      padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                      display: 'inline-flex', alignItems: 'center', gap: t.spacing[1],
                      borderRadius: badgeRadius,
                    }}>
                      {isAi ? <Bot size={14} /> : <User size={14} />}
                      <Text style={{ fontSize: t.typography.fontSize.sm }}>
                        {modeLabels[interviewBrief.type] ?? interviewBrief.type} Interview
                      </Text>
                    </Box>
                  );
                })()}
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <Calendar size={14} color={t.colors.neutral[600]} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600] }}>
                    {formatDateTime(interviewBrief.dateTime)}
                  </Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <Clock size={14} color={t.colors.neutral[600]} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600] }}>
                    {interviewBrief.estimatedDuration} min
                  </Text>
                </Box>
              </Box>
            </Box>
          )}

          {/* Two-column layout */}
          <Box style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)', gap: t.spacing[5] }}>
            {/* Left column */}
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5] }}>
              {/* Candidate Briefing */}
              {candidateBrief && (
                <Box style={{ ...cardBase, ...animStyle(1) }} role="region" aria-label="Candidate briefing">
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
                    <User size={18} color={t.colors.neutral[600]} />
                    <Text style={{
                      fontSize: t.typography.fontSize.lg, fontWeight: ptypo.headingWeight,
                      color: t.colors.neutral[900], letterSpacing: ptypo.headingLetterSpacing,
                    }}>
                      Candidate Briefing
                    </Text>
                  </Box>

                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[4] }}>
                    <Box style={{
                      width: 48, height: 48, borderRadius: t.borderRadius.full,
                      backgroundColor: t.colors.primaryScale[200],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', flexShrink: 0,
                      backgroundImage: candidateBrief.avatar ? `url(${candidateBrief.avatar})` : 'none',
                      backgroundSize: 'cover', backgroundPosition: 'center',
                    }}>
                      {!candidateBrief.avatar && <User size={22} color={t.colors.primaryScale[600]} />}
                    </Box>
                    <Text style={{
                      fontSize: t.typography.fontSize.lg, fontWeight: ptypo.headingWeight,
                      color: t.colors.neutral[900], letterSpacing: ptypo.headingLetterSpacing,
                    }}>
                      {candidateBrief.name}
                    </Text>
                  </Box>

                  <Box style={{
                    padding: `${t.spacing[3]}px`, borderRadius: t.borderRadius.lg,
                    backgroundColor: t.colors.neutral[50],
                    border: `${bdr} ${t.colors.neutral[100]}`, marginBottom: t.spacing[4],
                  }}>
                    <Text style={{
                      fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700],
                      lineHeight: t.typography.lineHeight.relaxed,
                      wordBreak: 'break-word' as const,
                    }}>
                      {candidateBrief.summary}
                    </Text>
                  </Box>

                  {candidateBrief.resumeHighlights.length > 0 && (
                    <Box style={{ marginBottom: t.spacing[4] }}>
                      <Text style={{ ...sectionLabel, marginBottom: t.spacing[2] }}>
                        Resume Highlights
                      </Text>
                      <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: t.spacing[2] }}>
                        {candidateBrief.resumeHighlights.map((highlight, idx) => (
                          <Box key={idx} style={{
                            display: 'flex', alignItems: 'center', gap: t.spacing[2],
                            padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                            borderRadius: badgeRadius,
                            backgroundColor: t.colors.common.white,
                            border: `${bdr} ${t.colors.neutral[100]}`,
                          }}>
                            <Star size={12} color={t.colors.warningScale[500]} />
                            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800] }}>{highlight}</Text>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {candidateBrief.previousScores.length > 0 && (() => {
                    const maxScore = Math.max(...candidateBrief.previousScores.map((s) => s.score), 100);
                    const chartWidth = 300;
                    const chartHeight = 80;
                    const barWidth = candidateBrief.previousScores.length > 0
                      ? Math.min(40, (chartWidth - 20) / candidateBrief.previousScores.length - 4)
                      : 40;

                    return (
                      <Box>
                        <Text style={{ ...sectionLabel, marginBottom: t.spacing[2] }}>
                          Previous Scores
                        </Text>
                        <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 24}`} width="100%" height={chartHeight + 24} style={{ display: 'block' }} role="img" aria-label="Previous scores chart">
                          {candidateBrief.previousScores.map((score, idx) => {
                            const x = 10 + idx * ((chartWidth - 20) / candidateBrief.previousScores.length) + ((chartWidth - 20) / candidateBrief.previousScores.length - barWidth) / 2;
                            const barHeight = (score.score / maxScore) * (chartHeight - 10);
                            const y = chartHeight - barHeight;
                            const fillColor = score.score >= 80 ? t.colors.successScale[500]
                              : score.score >= 50 ? t.colors.warningScale[500] : t.colors.errorScale[500];

                            return (
                              <g key={idx}>
                                <rect x={x} y={y} width={barWidth} height={barHeight} rx={4} fill={fillColor} opacity={0.8} />
                                <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" fontSize={t.typography.fontSize.xs}
                                  fill={t.colors.neutral[700]} fontWeight={t.typography.fontWeight.medium as any}>
                                  {score.score}%
                                </text>
                                <text x={x + barWidth / 2} y={chartHeight + 16} textAnchor="middle" fontSize="10" fill={t.colors.neutral[500]}>
                                  {score.stage.length > 8 ? score.stage.slice(0, 7) + '...' : score.stage}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </Box>
                    );
                  })()}
                </Box>
              )}

              {/* Script Overview */}
              {scriptOverview && scriptOverview.sections.length > 0 && (
                <Box style={{ ...cardBase, ...animStyle(2) }} role="region" aria-label="Script overview">
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
                    <BookOpen size={18} color={t.colors.neutral[600]} />
                    <Text style={{
                      fontSize: t.typography.fontSize.lg, fontWeight: ptypo.headingWeight,
                      color: t.colors.neutral[900], letterSpacing: ptypo.headingLetterSpacing,
                    }}>
                      Script Overview
                    </Text>
                  </Box>

                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
                    {scriptOverview.sections.map((section, idx) => {
                      const isExpanded = expandedSections.includes(section.title);

                      return (
                        <Box key={idx} style={{
                          borderRadius: t.borderRadius.lg,
                          backgroundColor: t.colors.common.white,
                          border: `${bdr} ${t.colors.neutral[100]}`,
                          overflow: 'hidden' as const,
                        }}>
                          <Box
                            role="button"
                            tabIndex={0}
                            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} section: ${section.title}`}
                            aria-expanded={isExpanded}
                            onClick={() => handleSectionToggle(section.title)}
                            onKeyDown={(e: React.KeyboardEvent) => handleKeyNav(e, () => handleSectionToggle(section.title))}
                            style={{
                              padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              cursor: 'pointer', transition: `all ${t.motion.hover}`, outline: 'none',
                            }}
                          >
                            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                              <Box style={{
                                ...createIconContainerStyle(t, { size: 24 }),
                              }}>
                                <Text style={{
                                  fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold,
                                  color: t.colors.primaryScale[700],
                                }}>
                                  {idx + 1}
                                </Text>
                              </Box>
                              <Text style={{
                                fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight,
                                color: t.colors.neutral[900], letterSpacing: ptypo.headingLetterSpacing,
                              }}>
                                {section.title}
                              </Text>
                              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                                {section.keyQuestions.length} questions
                              </Text>
                            </Box>
                            {isExpanded ? <ChevronDown size={16} color={t.colors.neutral[500]} /> : <ChevronRight size={16} color={t.colors.neutral[500]} />}
                          </Box>

                          {isExpanded && (
                            <Box style={{
                              padding: `0 ${t.spacing[4]}px ${t.spacing[3]}px`,
                              borderTop: `${bdr} ${t.colors.neutral[100]}`,
                              paddingTop: t.spacing[3],
                            }}>
                              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
                                {section.keyQuestions.map((question, qIdx) => (
                                  <Box key={qIdx} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: t.spacing[2],
                                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                                    borderRadius: t.borderRadius.lg, backgroundColor: t.colors.neutral[50],
                                  }}>
                                    <HelpCircle size={14} color={t.colors.primaryScale[500]} style={{ flexShrink: 0, marginTop: t.spacing[1] }} />
                                    <Text style={{
                                      fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800],
                                      lineHeight: t.typography.lineHeight.normal,
                                      wordBreak: 'break-word' as const,
                                    }}>
                                      {question}
                                    </Text>
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Box>

            {/* Right column */}
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5] }}>
              {/* Evaluation Focus */}
              {evaluationFocus && evaluationFocus.dimensions.length > 0 && (() => {
                const maxWeight = Math.max(...evaluationFocus.dimensions.map((d) => d.weight));

                return (
                  <Box style={{ ...cardBase, ...animStyle(3) }} role="region" aria-label="Evaluation focus">
                    <Box style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: t.spacing[4],
                    }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Target size={18} color={t.colors.neutral[600]} />
                        <Text style={{
                          fontSize: t.typography.fontSize.lg, fontWeight: ptypo.headingWeight,
                          color: t.colors.neutral[900], letterSpacing: ptypo.headingLetterSpacing,
                        }}>
                          Evaluation Focus
                        </Text>
                      </Box>
                      <Box
                        role="button"
                        tabIndex={0}
                        aria-label={showFullRubric ? 'Collapse rubric' : 'Show full rubric'}
                        aria-pressed={showFullRubric}
                        onClick={handleRubricToggle}
                        onKeyDown={(e: React.KeyboardEvent) => handleKeyNav(e, handleRubricToggle)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: t.spacing[1],
                          padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                          borderRadius: badgeRadius,
                          backgroundColor: t.colors.common.white,
                          border: `${bdr} ${t.colors.neutral[200]}`,
                          cursor: 'pointer', transition: `all ${t.motion.hover}`, outline: 'none',
                        }}
                      >
                        <Eye size={12} color={t.colors.primaryScale[600]} />
                        <Text style={{
                          fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
                          color: t.colors.primaryScale[600],
                        }}>
                          {showFullRubric ? 'Collapse' : 'Full Rubric'}
                        </Text>
                      </Box>
                    </Box>

                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
                      {evaluationFocus.dimensions.map((dim, idx) => {
                        const weightPercent = (dim.weight / maxWeight) * 100;

                        return (
                          <Box key={idx} style={{
                            padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                            borderRadius: t.borderRadius.lg,
                            backgroundColor: dim.isKnockout ? t.colors.errorScale[50] : t.colors.common.white,
                            border: `${bdr} ${dim.isKnockout ? t.colors.errorScale[200] : t.colors.neutral[100]}`,
                          }} role="article" aria-label={`Dimension: ${dim.name}, weight ${dim.weight}`}>
                            <Box style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              marginBottom: t.spacing[2],
                            }}>
                              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                                <Text style={{
                                  fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight,
                                  color: t.colors.neutral[900], letterSpacing: ptypo.headingLetterSpacing,
                                }}>
                                  {dim.name}
                                </Text>
                                {dim.isKnockout && (
                                  <Box style={{
                                    ...createBadgeStyle(t, 'error'),
                                    fontSize: t.typography.fontSize.xs,
                                    display: 'inline-flex', alignItems: 'center', gap: t.spacing[1],
                                    borderRadius: badgeRadius,
                                  }}>
                                    <Shield size={10} />
                                    <Text style={{ fontSize: t.typography.fontSize.xs }}>Knockout</Text>
                                  </Box>
                                )}
                              </Box>
                              <Text style={{
                                fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold,
                                color: t.colors.neutral[600], fontVariantNumeric: 'tabular-nums',
                              }}>
                                Weight: {dim.weight}
                              </Text>
                            </Box>

                            <Box style={{
                              width: '100%', height: 6, backgroundColor: t.colors.neutral[100],
                              borderRadius: t.borderRadius.full, overflow: 'hidden' as const,
                            }}>
                              <Box style={{
                                width: `${weightPercent}%`, height: '100%',
                                borderRadius: t.borderRadius.full,
                                backgroundColor: dim.isKnockout ? t.colors.errorScale[500] : t.colors.primaryScale[500],
                                transition: `width ${t.motion.hover}`,
                              }} />
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                );
              })()}

              {/* Checklist */}
              {externalChecklist.length > 0 && (() => {
                const passCount = externalChecklist.filter((item) => (checklistStatus[item.key] ?? item.status) === 'pass').length;
                const totalCount = externalChecklist.length;

                return (
                  <Box style={{ ...cardBase, ...animStyle(4) }} role="region" aria-label="Pre-interview checklist">
                    <Box style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: t.spacing[4],
                    }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <ListChecks size={18} color={t.colors.neutral[600]} />
                        <Text style={{
                          fontSize: t.typography.fontSize.lg, fontWeight: ptypo.headingWeight,
                          color: t.colors.neutral[900], letterSpacing: ptypo.headingLetterSpacing,
                        }}>
                          Pre-Interview Checklist
                        </Text>
                      </Box>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
                        color: passCount === totalCount ? t.colors.successScale[600] : t.colors.neutral[500],
                      }}>
                        {passCount}/{totalCount} passed
                      </Text>
                    </Box>

                    <Box style={{
                      width: '100%', height: 4, backgroundColor: t.colors.neutral[100],
                      borderRadius: t.borderRadius.full, marginBottom: t.spacing[4], overflow: 'hidden' as const,
                    }}>
                      <Box style={{
                        width: `${totalCount > 0 ? (passCount / totalCount) * 100 : 0}%`,
                        height: '100%',
                        backgroundColor: passCount === totalCount ? t.colors.successScale[500] : t.colors.primaryScale[500],
                        borderRadius: t.borderRadius.full, transition: `width ${t.motion.hover}`,
                      }} />
                    </Box>

                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
                      {externalChecklist.map((item) => {
                        const currentStatus = checklistStatus[item.key] ?? item.status;
                        const statusCfg = CHECKLIST_STATUS_CONFIG[currentStatus] || CHECKLIST_STATUS_CONFIG.pending;
                        const scale = t.colors[`${statusCfg.colorKey}Scale` as const] as any;

                        const StatusIcon = currentStatus === 'pass' ? CheckCircle : currentStatus === 'fail' ? XCircle : AlertTriangle;
                        const nextStatus: ChecklistItem['status'] = currentStatus === 'pending' ? 'pass' : currentStatus === 'pass' ? 'fail' : 'pending';

                        return (
                          <Box
                            key={item.key}
                            role="button"
                            tabIndex={0}
                            aria-label={`${item.label}: ${statusCfg.label}. Click to change status.`}
                            onClick={() => handleChecklistUpdate(item.key, nextStatus)}
                            onKeyDown={(e: React.KeyboardEvent) => handleKeyNav(e, () => handleChecklistUpdate(item.key, nextStatus))}
                            style={{
                              display: 'flex', alignItems: 'center', gap: t.spacing[3],
                              padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                              borderRadius: t.borderRadius.lg,
                              backgroundColor: currentStatus === 'pass' ? t.colors.successScale[50]
                                : currentStatus === 'fail' ? t.colors.errorScale[50] : t.colors.common.white,
                              border: `${bdr} ${currentStatus === 'pass' ? t.colors.successScale[200]
                                : currentStatus === 'fail' ? t.colors.errorScale[200] : t.colors.neutral[100]}`,
                              cursor: 'pointer', transition: `all ${t.motion.hover}`, outline: 'none',
                            }}
                          >
                            <StatusIcon size={18} color={scale[500]} />
                            <Text style={{
                              flex: 1, fontSize: t.typography.fontSize.sm,
                              fontWeight: t.typography.fontWeight.medium,
                              color: currentStatus === 'pass' ? t.colors.neutral[500] : t.colors.neutral[900],
                              textDecoration: currentStatus === 'pass' ? 'line-through' : 'none',
                            }}>
                              {item.label}
                            </Text>
                            <Text style={{
                              fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
                              color: scale[700],
                            }}>
                              {statusCfg.label}
                            </Text>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                );
              })()}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
