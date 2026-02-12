'use client';

/**
 * BhInterviewPrep - Standard Preset
 * Slite-inspired interview preparation briefing with interview info hero,
 * candidate summary with SVG bar chart, evaluation rubric, script accordion,
 * and pre-interview checklist.
 */

import { useState, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle } from '../../../helpers';
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

    const cardBase: React.CSSProperties = {
      ...createCardStyle(tokens, { elevation: 'sm', padding: 0 }),
      borderRadius: tokens.borderRadius.lg,
      border: `1px solid ${tokens.colors.neutral[100]}`,
      padding: `${tokens.spacing[5]}px`,
    };

    return (
      <Box className={className} style={{
        padding: `${tokens.spacing[6]}px`, backgroundColor: tokens.colors.neutral[50],
        minHeight: '100%', ...style,
      }}>
        <Box style={{
          display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[5],
          maxWidth: 900, margin: '0 auto',
        }}>
          {/* Interview Info Hero */}
          {interviewBrief && (
            <Box style={{
              ...createCardStyle(tokens, { elevation: 'sm', padding: 0 }),
              borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.neutral[100]}`,
              padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
              background: `linear-gradient(135deg, ${tokens.colors.primaryScale[50]}, ${tokens.colors.primaryScale[100]})`,
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
                <Briefcase size={20} color={tokens.colors.primaryScale[600]} />
                <Text style={{
                  fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                }}>
                  {interviewBrief.jobTitle}
                </Text>
              </Box>

              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flexWrap: 'wrap' as const }}>
                <Box style={{
                  ...createBadgeStyle(tokens, 'primary'),
                  fontSize: tokens.typography.fontSize.sm,
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm }}>{interviewBrief.stageName}</Text>
                </Box>
                <Box style={{
                  ...createBadgeStyle(tokens, interviewBrief.type === 'ai' ? 'info' : 'secondary'),
                  fontSize: tokens.typography.fontSize.sm,
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1],
                }}>
                  {interviewBrief.type === 'ai' ? <Bot size={14} /> : <User size={14} />}
                  <Text style={{ fontSize: tokens.typography.fontSize.sm }}>
                    {interviewBrief.type === 'ai' ? 'AI Interview' : 'Human Interview'}
                  </Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <Calendar size={14} color={tokens.colors.neutral[600]} />
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                    {formatDateTime(interviewBrief.dateTime)}
                  </Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <Clock size={14} color={tokens.colors.neutral[600]} />
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                    {interviewBrief.estimatedDuration} min
                  </Text>
                </Box>
              </Box>
            </Box>
          )}

          {/* Two-column layout */}
          <Box style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)', gap: tokens.spacing[5] }}>
            {/* Left column */}
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[5] }}>
              {/* Candidate Briefing */}
              {candidateBrief && (
                <Box style={cardBase}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                    <User size={18} color={tokens.colors.neutral[600]} />
                    <Text style={{
                      fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                    }}>
                      Candidate Briefing
                    </Text>
                  </Box>

                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
                    <Box style={{
                      width: 48, height: 48, borderRadius: tokens.borderRadius.full,
                      backgroundColor: tokens.colors.primaryScale[200],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', flexShrink: 0,
                    }}>
                      {candidateBrief.avatar ? (
                        <img src={candidateBrief.avatar} alt={candidateBrief.name} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} />
                      ) : (
                        <User size={22} color={tokens.colors.primaryScale[600]} />
                      )}
                    </Box>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                    }}>
                      {candidateBrief.name}
                    </Text>
                  </Box>

                  <Box style={{
                    padding: `${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.lg,
                    backgroundColor: tokens.colors.neutral[50],
                    border: `1px solid ${tokens.colors.neutral[100]}`, marginBottom: tokens.spacing[4],
                  }}>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700],
                      lineHeight: tokens.typography.lineHeight.relaxed,
                    }}>
                      {candidateBrief.summary}
                    </Text>
                  </Box>

                  {candidateBrief.resumeHighlights.length > 0 && (
                    <Box style={{ marginBottom: tokens.spacing[4] }}>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.neutral[500], textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em', marginBottom: tokens.spacing[2],
                      }}>
                        Resume Highlights
                      </Text>
                      <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[2] }}>
                        {candidateBrief.resumeHighlights.map((highlight, idx) => (
                          <Box key={idx} style={{
                            display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                            borderRadius: tokens.borderRadius.lg,
                            backgroundColor: tokens.colors.common.white,
                            border: `1px solid ${tokens.colors.neutral[100]}`,
                          }}>
                            <Star size={12} color={tokens.colors.warningScale[500]} />
                            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{highlight}</Text>
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
                        <Text style={{
                          fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.neutral[500], textTransform: 'uppercase' as const,
                          letterSpacing: '0.05em', marginBottom: tokens.spacing[2],
                        }}>
                          Previous Scores
                        </Text>
                        <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 24}`} width="100%" height={chartHeight + 24} style={{ display: 'block' }}>
                          {candidateBrief.previousScores.map((score, idx) => {
                            const x = 10 + idx * ((chartWidth - 20) / candidateBrief.previousScores.length) + ((chartWidth - 20) / candidateBrief.previousScores.length - barWidth) / 2;
                            const barHeight = (score.score / maxScore) * (chartHeight - 10);
                            const y = chartHeight - barHeight;
                            const fillColor = score.score >= 80 ? tokens.colors.successScale[500]
                              : score.score >= 50 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500];

                            return (
                              <g key={idx}>
                                <rect x={x} y={y} width={barWidth} height={barHeight} rx={4} fill={fillColor} opacity={0.8} />
                                <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" fontSize={tokens.typography.fontSize.xs}
                                  fill={tokens.colors.neutral[700]} fontWeight={tokens.typography.fontWeight.medium as any}>
                                  {score.score}%
                                </text>
                                <text x={x + barWidth / 2} y={chartHeight + 16} textAnchor="middle" fontSize="10" fill={tokens.colors.neutral[500]}>
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
                <Box style={cardBase}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                    <BookOpen size={18} color={tokens.colors.neutral[600]} />
                    <Text style={{
                      fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                    }}>
                      Script Overview
                    </Text>
                  </Box>

                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                    {scriptOverview.sections.map((section, idx) => {
                      const isExpanded = expandedSections.includes(section.title);

                      return (
                        <Box key={idx} style={{
                          borderRadius: tokens.borderRadius.lg,
                          backgroundColor: tokens.colors.common.white,
                          border: `1px solid ${tokens.colors.neutral[100]}`,
                          overflow: 'hidden' as const,
                        }}>
                          <Box
                            onClick={() => handleSectionToggle(section.title)}
                            style={{
                              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                            }}
                          >
                            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                              <Box style={{
                                width: 24, height: 24, borderRadius: tokens.borderRadius.full,
                                backgroundColor: tokens.colors.primaryScale[100],
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              }}>
                                <Text style={{
                                  fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
                                  color: tokens.colors.primaryScale[700],
                                }}>
                                  {idx + 1}
                                </Text>
                              </Box>
                              <Text style={{
                                fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold,
                                color: tokens.colors.neutral[900],
                              }}>
                                {section.title}
                              </Text>
                              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                                {section.keyQuestions.length} questions
                              </Text>
                            </Box>
                            {isExpanded ? <ChevronDown size={16} color={tokens.colors.neutral[500]} /> : <ChevronRight size={16} color={tokens.colors.neutral[500]} />}
                          </Box>

                          {isExpanded && (
                            <Box style={{
                              padding: `0 ${tokens.spacing[4]}px ${tokens.spacing[3]}px`,
                              borderTop: `1px solid ${tokens.colors.neutral[100]}`,
                              paddingTop: tokens.spacing[3],
                            }}>
                              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                                {section.keyQuestions.map((question, qIdx) => (
                                  <Box key={qIdx} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[2],
                                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                                    borderRadius: tokens.borderRadius.lg, backgroundColor: tokens.colors.neutral[50],
                                  }}>
                                    <HelpCircle size={14} color={tokens.colors.primaryScale[500]} style={{ flexShrink: 0, marginTop: 2 }} />
                                    <Text style={{
                                      fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800],
                                      lineHeight: tokens.typography.lineHeight.normal,
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
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[5] }}>
              {/* Evaluation Focus */}
              {evaluationFocus && evaluationFocus.dimensions.length > 0 && (() => {
                const maxWeight = Math.max(...evaluationFocus.dimensions.map((d) => d.weight));

                return (
                  <Box style={cardBase}>
                    <Box style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: tokens.spacing[4],
                    }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <Target size={18} color={tokens.colors.neutral[600]} />
                        <Text style={{
                          fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[900],
                        }}>
                          Evaluation Focus
                        </Text>
                      </Box>
                      <Box
                        onClick={handleRubricToggle}
                        style={{
                          display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.lg,
                          backgroundColor: tokens.colors.common.white,
                          border: `1px solid ${tokens.colors.neutral[200]}`,
                          cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                        }}
                      >
                        <Eye size={12} color={tokens.colors.primaryScale[600]} />
                        <Text style={{
                          fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.primaryScale[600],
                        }}>
                          {showFullRubric ? 'Collapse' : 'Full Rubric'}
                        </Text>
                      </Box>
                    </Box>

                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
                      {evaluationFocus.dimensions.map((dim, idx) => {
                        const weightPercent = (dim.weight / maxWeight) * 100;

                        return (
                          <Box key={idx} style={{
                            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                            borderRadius: tokens.borderRadius.lg,
                            backgroundColor: dim.isKnockout ? tokens.colors.errorScale[50] : tokens.colors.common.white,
                            border: `1px solid ${dim.isKnockout ? tokens.colors.errorScale[200] : tokens.colors.neutral[100]}`,
                          }}>
                            <Box style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              marginBottom: tokens.spacing[2],
                            }}>
                              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                                <Text style={{
                                  fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold,
                                  color: tokens.colors.neutral[900],
                                }}>
                                  {dim.name}
                                </Text>
                                {dim.isKnockout && (
                                  <Box style={{
                                    ...createBadgeStyle(tokens, 'error'),
                                    fontSize: tokens.typography.fontSize.xs,
                                    display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1],
                                  }}>
                                    <Shield size={10} />
                                    <Text style={{ fontSize: tokens.typography.fontSize.xs }}>Knockout</Text>
                                  </Box>
                                )}
                              </Box>
                              <Text style={{
                                fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
                                color: tokens.colors.neutral[600], fontVariantNumeric: 'tabular-nums',
                              }}>
                                Weight: {dim.weight}
                              </Text>
                            </Box>

                            <Box style={{
                              width: '100%', height: 6, backgroundColor: tokens.colors.neutral[100],
                              borderRadius: tokens.borderRadius.full, overflow: 'hidden' as const,
                            }}>
                              <Box style={{
                                width: `${weightPercent}%`, height: '100%',
                                borderRadius: tokens.borderRadius.full,
                                backgroundColor: dim.isKnockout ? tokens.colors.errorScale[500] : tokens.colors.primaryScale[500],
                                transition: `width ${tokens.motion.hover}`,
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
                  <Box style={cardBase}>
                    <Box style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: tokens.spacing[4],
                    }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <ListChecks size={18} color={tokens.colors.neutral[600]} />
                        <Text style={{
                          fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[900],
                        }}>
                          Pre-Interview Checklist
                        </Text>
                      </Box>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
                        color: passCount === totalCount ? tokens.colors.successScale[600] : tokens.colors.neutral[500],
                      }}>
                        {passCount}/{totalCount} passed
                      </Text>
                    </Box>

                    <Box style={{
                      width: '100%', height: 4, backgroundColor: tokens.colors.neutral[100],
                      borderRadius: tokens.borderRadius.full, marginBottom: tokens.spacing[4], overflow: 'hidden' as const,
                    }}>
                      <Box style={{
                        width: `${totalCount > 0 ? (passCount / totalCount) * 100 : 0}%`,
                        height: '100%',
                        backgroundColor: passCount === totalCount ? tokens.colors.successScale[500] : tokens.colors.primaryScale[500],
                        borderRadius: tokens.borderRadius.full, transition: `width ${tokens.motion.hover}`,
                      }} />
                    </Box>

                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                      {externalChecklist.map((item) => {
                        const currentStatus = checklistStatus[item.key] ?? item.status;
                        const statusCfg = CHECKLIST_STATUS_CONFIG[currentStatus];
                        const scale = tokens.colors[`${statusCfg.colorKey}Scale` as const] as any;

                        const StatusIcon = currentStatus === 'pass' ? CheckCircle : currentStatus === 'fail' ? XCircle : AlertTriangle;
                        const nextStatus: ChecklistItem['status'] = currentStatus === 'pending' ? 'pass' : currentStatus === 'pass' ? 'fail' : 'pending';

                        return (
                          <Box
                            key={item.key}
                            onClick={() => handleChecklistUpdate(item.key, nextStatus)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: tokens.spacing[3],
                              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                              borderRadius: tokens.borderRadius.lg,
                              backgroundColor: currentStatus === 'pass' ? tokens.colors.successScale[50]
                                : currentStatus === 'fail' ? tokens.colors.errorScale[50] : tokens.colors.common.white,
                              border: `1px solid ${currentStatus === 'pass' ? tokens.colors.successScale[200]
                                : currentStatus === 'fail' ? tokens.colors.errorScale[200] : tokens.colors.neutral[100]}`,
                              cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                            }}
                          >
                            <StatusIcon size={18} color={scale[500]} />
                            <Text style={{
                              flex: 1, fontSize: tokens.typography.fontSize.sm,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: currentStatus === 'pass' ? tokens.colors.neutral[500] : tokens.colors.neutral[900],
                              textDecoration: currentStatus === 'pass' ? 'line-through' : 'none',
                            }}>
                              {item.label}
                            </Text>
                            <Text style={{
                              fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
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
