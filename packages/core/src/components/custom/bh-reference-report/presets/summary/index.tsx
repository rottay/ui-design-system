'use client';

/**
 * BhReferenceReport - Summary Preset
 * Overview of all references for a candidate with aggregate scoring.
 *
 * Layout:
 * - Candidate header: name, total references (completed/pending/declined)
 * - Overall score gauge (SVG circular, color-coded)
 * - Overall sentiment badge
 * - Verification status badge
 * - Dimension scores: horizontal bars with color coding
 * - Strengths list (successScale left border)
 * - Red flags section (errorScale left border, each flag with severity indicator)
 * - Reference cards: name, role, relationship, status badge, completed date
 * - AI-generated summary
 * - Actions: schedule remaining, export report
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Users,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Star,
  TrendingUp,
  Flag,
  Download,
  Calendar,
  Phone,
  ChevronRight,
  Zap,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Award,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createEntranceAnimation,
  createPersonalitySkeletonStyle,
  createProgressBarStyle,
  createEmptyStateStyle,
  createDividerStyle,
  createListItemStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  clickableProps,
  ICON_SIZES,
} from '../../../helpers';
import type {
  BhReferenceReportProps,
  ReferenceCheck,
  ReferenceDimension,
} from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getScoreColor(score: number): 'success' | 'warning' | 'error' {
  if (score >= 75) return 'success';
  if (score >= 50) return 'warning';
  return 'error';
}

function getSentimentIcon(sentiment: string): typeof ThumbsUp {
  switch (sentiment) {
    case 'positive': return ThumbsUp;
    case 'negative': return ThumbsDown;
    case 'mixed': return AlertTriangle;
    default: return Minus;
  }
}

function getStatusIcon(status: string): typeof CheckCircle2 {
  switch (status) {
    case 'completed': return CheckCircle2;
    case 'scheduled': return Clock;
    case 'declined': return XCircle;
    default: return Clock;
  }
}

function getStatusColor(status: string): 'success' | 'warning' | 'error' | 'secondary' {
  switch (status) {
    case 'completed': return 'success';
    case 'scheduled': return 'warning';
    case 'declined': return 'error';
    default: return 'secondary';
  }
}

function getVerificationIcon(status: string): typeof ShieldCheck {
  switch (status) {
    case 'verified': return ShieldCheck;
    case 'partial': return ShieldAlert;
    default: return ShieldQuestion;
  }
}

function getVerificationColor(status: string): 'success' | 'warning' | 'error' {
  switch (status) {
    case 'verified': return 'success';
    case 'partial': return 'warning';
    default: return 'error';
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const SummaryBhReferenceReport = createPreset<BhReferenceReportProps>(
  'SummaryBhReferenceReport',
  ({ primitives: { Box, Text, Button, Input }, props, tokens }: PresetContext<BhReferenceReportProps>) => {
    const {
      report,
      loading = false,
      onContactReference,
      onScheduleCall,
      onExport,
      className,
      style,
    } = props;

    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const cardStyle = useMemo(() => createCardStyle(tokens), [tokens]);
    const dividerStyle = useMemo(() => createDividerStyle(tokens), [tokens]);
    const skeletonStyle = useMemo(() => createPersonalitySkeletonStyle(tokens), [tokens]);
    const entranceAnim = useMemo(() => createEntranceAnimation(tokens), [tokens]);

    const colorScale = useCallback((scale: string, shade: number) => {
      const key = `${scale}Scale` as keyof typeof tokens.colors;
      const scaleObj = tokens.colors[key] as Record<number, string> | undefined;
      return scaleObj?.[shade] ?? (tokens.colors.neutral as unknown as Record<number, string>)?.[shade] ?? '#888';
    }, [tokens]);

    // Loading skeleton
    if (loading) {
      return (
        <Box className={className} style={{ ...cardStyle, padding: tokens.spacing?.[6] ?? 24, ...style }}>
          <Box style={{ ...skeletonStyle, height: 28, width: '40%', marginBottom: 16 }} />
          <Box style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
            <Box style={{ ...skeletonStyle, height: 120, width: 120, borderRadius: tokens.borderRadius?.full ?? '50%' }} />
            <Box style={{ flex: 1 }}>
              <Box style={{ ...skeletonStyle, height: 16, width: '80%', marginBottom: 12 }} />
              <Box style={{ ...skeletonStyle, height: 16, width: '60%', marginBottom: 12 }} />
              <Box style={{ ...skeletonStyle, height: 16, width: '70%' }} />
            </Box>
          </Box>
          <Box style={{ ...skeletonStyle, height: 200, width: '100%' }} />
        </Box>
      );
    }

    if (!report) {
      return (
        <Box className={className} style={{ ...cardStyle, ...createEmptyStateStyle(tokens), ...style }}>
          <Users size={32} color={tokens.colors.neutral?.[300] ?? '#d1d5db'} />
          <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral?.[500] ?? '#6b7280', marginTop: 12 }}>
            No reference report available
          </Text>
        </Box>
      );
    }

    const completedCount = report.references.filter((r) => r.status === 'completed').length;
    const pendingCount = report.references.filter((r) => r.status === 'pending' || r.status === 'scheduled').length;
    const declinedCount = report.references.filter((r) => r.status === 'declined').length;
    const scoreColor = getScoreColor(report.overallScore);
    const verColor = getVerificationColor(report.verificationStatus);
    const VerIcon = getVerificationIcon(report.verificationStatus);

    // SVG gauge calculations
    const gaugeRadius = 44;
    const gaugeCircumference = 2 * Math.PI * gaugeRadius;
    const gaugeProgress = (report.overallScore / 100) * gaugeCircumference;

    return (
      <Box className={className} style={{ ...cardStyle, padding: 0, overflow: 'hidden', ...entranceAnim, ...style }}>
        {/* ============================================================ */}
        {/* HEADER                                                        */}
        {/* ============================================================ */}
        <Box style={{
          padding: `${tokens.spacing?.[5] ?? 20}px ${tokens.spacing?.[6] ?? 24}px`,
          borderBottom: `1px solid ${tokens.colors.neutral?.[200] ?? '#e5e7eb'}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Text style={{
                fontSize: 20,
                color: tokens.colors.neutral?.[900] ?? '#111',
                margin: 0,
              }}>
                {report.candidateName}
              </Text>
              <Box style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <UserCheck size={14} color={colorScale('success', 500)} />
                  <Text style={{ fontSize: 12, color: tokens.colors.neutral?.[600] ?? '#4b5563', margin: 0 }}>
                    {completedCount} completed
                  </Text>
                </Box>
                {pendingCount > 0 && (
                  <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={14} color={colorScale('warning', 500)} />
                    <Text style={{ fontSize: 12, color: tokens.colors.neutral?.[600] ?? '#4b5563', margin: 0 }}>
                      {pendingCount} pending
                    </Text>
                  </Box>
                )}
                {declinedCount > 0 && (
                  <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <XCircle size={14} color={colorScale('error', 500)} />
                    <Text style={{ fontSize: 12, color: tokens.colors.neutral?.[600] ?? '#4b5563', margin: 0 }}>
                      {declinedCount} declined
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
            <Box style={{ display: 'flex', gap: 8 }}>
              {/* Verification badge */}
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: badgeRadius,
                background: colorScale(verColor, 50),
                border: `1px solid ${colorScale(verColor, 200)}`,
              }}>
                <VerIcon size={14} color={colorScale(verColor, 600)} />
                <Text style={{
                  fontSize: 12,
                  fontWeight: tokens.typography?.fontWeight?.semibold ?? 600,
                  color: colorScale(verColor, 700),
                  margin: 0,
                  textTransform: 'capitalize' as const,
                }}>
                  {report.verificationStatus}
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ============================================================ */}
        {/* SCORE GAUGE + SENTIMENT                                       */}
        {/* ============================================================ */}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing?.[6] ?? 24,
          padding: `${tokens.spacing?.[5] ?? 20}px ${tokens.spacing?.[6] ?? 24}px`,
          borderBottom: `1px solid ${tokens.colors.neutral?.[200] ?? '#e5e7eb'}`,
        }}>
          {/* Circular gauge */}
          <Box style={{ position: 'relative' as const, flexShrink: 0 }}>
            <svg width={104} height={104} viewBox="0 0 104 104">
              <circle
                cx={52}
                cy={52}
                r={gaugeRadius}
                fill="none"
                stroke={tokens.colors.neutral?.[100] ?? '#f3f4f6'}
                strokeWidth={8}
              />
              <circle
                cx={52}
                cy={52}
                r={gaugeRadius}
                fill="none"
                stroke={colorScale(scoreColor, 500)}
                strokeWidth={8}
                strokeDasharray={`${gaugeProgress} ${gaugeCircumference}`}
                strokeLinecap="round"
                transform="rotate(-90 52 52)"
              />
            </svg>
            <Box style={{
              position: 'absolute' as const,
              inset: 0,
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{
                fontSize: 24,
                fontWeight: tokens.typography?.fontWeight?.bold ?? 700,
                color: colorScale(scoreColor, 700),
                margin: 0,
                lineHeight: 1,
              }}>
                {report.overallScore}
              </Text>
              <Text style={{
                fontSize: 10,
                color: tokens.colors.neutral?.[400] ?? '#9ca3af',
                margin: 0,
              }}>
                /100
              </Text>
            </Box>
          </Box>

          {/* Sentiment + stats */}
          <Box style={{ flex: 1 }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              {(() => {
                const SentIcon = getSentimentIcon(report.overallSentiment);
                const sentColor = report.overallSentiment === 'positive' ? 'success'
                  : report.overallSentiment === 'negative' ? 'error'
                  : 'warning';
                return (
                  <Box style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: badgeRadius,
                    background: colorScale(sentColor, 50),
                    border: `1px solid ${colorScale(sentColor, 200)}`,
                  }}>
                    <SentIcon size={14} color={colorScale(sentColor, 600)} />
                    <Text style={{
                      fontSize: 12,
                      fontWeight: tokens.typography?.fontWeight?.medium ?? 500,
                      color: colorScale(sentColor, 700),
                      margin: 0,
                      textTransform: 'capitalize' as const,
                    }}>
                      {report.overallSentiment}
                    </Text>
                  </Box>
                );
              })()}
            </Box>
            <Text style={{
              fontSize: 13,
              color: tokens.colors.neutral?.[500] ?? '#6b7280',
              margin: 0,
            }}>
              Based on {completedCount} of {report.references.length} references
            </Text>
          </Box>
        </Box>

        {/* ============================================================ */}
        {/* DIMENSION SCORES                                              */}
        {/* ============================================================ */}
        {report.dimensions.length > 0 && (
          <Box style={{
            padding: `${tokens.spacing?.[4] ?? 16}px ${tokens.spacing?.[6] ?? 24}px`,
            borderBottom: `1px solid ${tokens.colors.neutral?.[200] ?? '#e5e7eb'}`,
          }}>
            <Text style={{
              fontSize: 11,
              fontWeight: tokens.typography?.fontWeight?.semibold ?? 600,
              color: tokens.colors.neutral?.[400] ?? '#9ca3af',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
              margin: 0,
              marginBottom: 12,
            }}>
              Dimension Scores
            </Text>
            {report.dimensions.map((dim, idx) => {
              const dimColor = getScoreColor(dim.score);
              return (
                <Box key={idx} style={{ marginBottom: 10 }}>
                  <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{
                      fontSize: 13,
                      color: tokens.colors.neutral?.[700] ?? '#374151',
                      margin: 0,
                    }}>
                      {dim.name}
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: tokens.typography?.fontWeight?.semibold ?? 600,
                      color: colorScale(dimColor, 700),
                      margin: 0,
                    }}>
                      {dim.score}%
                    </Text>
                  </Box>
                  <Box style={{
                    height: 6,
                    borderRadius: 3,
                    background: tokens.colors.neutral?.[100] ?? '#f3f4f6',
                    overflow: 'hidden',
                  }}>
                    <Box style={{
                      height: '100%',
                      width: `${dim.score}%`,
                      borderRadius: 3,
                      background: colorScale(dimColor, 500),
                      transition: 'width 300ms ease',
                    }} />
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        {/* ============================================================ */}
        {/* STRENGTHS                                                     */}
        {/* ============================================================ */}
        {report.strengths.length > 0 && (
          <Box style={{
            padding: `${tokens.spacing?.[4] ?? 16}px ${tokens.spacing?.[6] ?? 24}px`,
            borderBottom: `1px solid ${tokens.colors.neutral?.[200] ?? '#e5e7eb'}`,
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Star size={14} color={colorScale('success', 500)} />
              <Text style={{
                fontSize: 11,
                fontWeight: tokens.typography?.fontWeight?.semibold ?? 600,
                color: tokens.colors.neutral?.[400] ?? '#9ca3af',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
                margin: 0,
              }}>
                Strengths
              </Text>
            </Box>
            {report.strengths.map((s, idx) => (
              <Box key={idx} style={{
                padding: '8px 12px',
                marginBottom: 4,
                borderLeft: `3px solid ${colorScale('success', 400)}`,
                background: colorScale('success', 50),
                borderRadius: `0 ${tokens.borderRadius?.sm ?? 4}px ${tokens.borderRadius?.sm ?? 4}px 0`,
              }}>
                <Text style={{
                  fontSize: 13,
                  color: tokens.colors.neutral?.[700] ?? '#374151',
                  margin: 0,
                }}>
                  {s}
                </Text>
              </Box>
            ))}
          </Box>
        )}

        {/* ============================================================ */}
        {/* RED FLAGS                                                     */}
        {/* ============================================================ */}
        {report.redFlags.length > 0 && (
          <Box style={{
            padding: `${tokens.spacing?.[4] ?? 16}px ${tokens.spacing?.[6] ?? 24}px`,
            borderBottom: `1px solid ${tokens.colors.neutral?.[200] ?? '#e5e7eb'}`,
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Flag size={14} color={colorScale('error', 500)} />
              <Text style={{
                fontSize: 11,
                fontWeight: tokens.typography?.fontWeight?.semibold ?? 600,
                color: tokens.colors.neutral?.[400] ?? '#9ca3af',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
                margin: 0,
              }}>
                Red Flags
              </Text>
              <Box style={{
                ...createBadgeStyle(tokens, 'error'),
                fontSize: 11,
                padding: '1px 6px',
              }}>
                {report.redFlags.length}
              </Box>
            </Box>
            {report.redFlags.map((flag, idx) => (
              <Box key={idx} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '8px 12px',
                marginBottom: 4,
                borderLeft: `3px solid ${colorScale('error', 400)}`,
                background: colorScale('error', 50),
                borderRadius: `0 ${tokens.borderRadius?.sm ?? 4}px ${tokens.borderRadius?.sm ?? 4}px 0`,
              }}>
                <AlertTriangle size={14} color={colorScale('error', 500)} style={{ flexShrink: 0, marginTop: 1 }} />
                <Text style={{
                  fontSize: 13,
                  color: tokens.colors.neutral?.[700] ?? '#374151',
                  margin: 0,
                }}>
                  {flag}
                </Text>
              </Box>
            ))}
          </Box>
        )}

        {/* ============================================================ */}
        {/* REFERENCE CARDS                                               */}
        {/* ============================================================ */}
        <Box style={{
          padding: `${tokens.spacing?.[4] ?? 16}px ${tokens.spacing?.[6] ?? 24}px`,
          borderBottom: `1px solid ${tokens.colors.neutral?.[200] ?? '#e5e7eb'}`,
        }}>
          <Text style={{
            fontSize: 11,
            fontWeight: tokens.typography?.fontWeight?.semibold ?? 600,
            color: tokens.colors.neutral?.[400] ?? '#9ca3af',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            margin: 0,
            marginBottom: 10,
          }}>
            References ({report.references.length})
          </Text>
          {report.references.map((ref) => {
            const StatusIcon = getStatusIcon(ref.status);
            const sColor = getStatusColor(ref.status);
            return (
              <Box key={ref.id} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 12px',
                marginBottom: 6,
                borderRadius: tokens.borderRadius?.md ?? 6,
                border: `1px solid ${tokens.colors.neutral?.[100] ?? '#f3f4f6'}`,
                transition: 'background 100ms ease',
              }}>
                <Box style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: tokens.typography?.fontWeight?.semibold ?? 600,
                    color: tokens.colors.neutral?.[800] ?? '#1f2937',
                    margin: 0,
                  }}>
                    {ref.referenceeName}
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: tokens.colors.neutral?.[500] ?? '#6b7280',
                    margin: 0,
                    marginTop: 2,
                  }}>
                    {ref.referenceRole} at {ref.company} - {ref.relationship} ({ref.duration})
                  </Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Box style={{
                    ...createBadgeStyle(tokens, sColor),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    padding: '2px 8px',
                  }}>
                    <StatusIcon size={12} />
                    {ref.status}
                  </Box>
                  {ref.status === 'completed' && ref.completedAt && (
                    <Text style={{
                      fontSize: 11,
                      color: tokens.colors.neutral?.[400] ?? '#9ca3af',
                      margin: 0,
                    }}>
                      {formatDate(ref.completedAt)}
                    </Text>
                  )}
                  {ref.status === 'pending' && onScheduleCall && (
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 10px',
                        borderRadius: badgeRadius,
                        background: colorScale('primary', 50),
                        border: `1px solid ${colorScale('primary', 200)}`,
                        cursor: 'pointer',
                      }}
                      {...clickableProps(() => onScheduleCall(ref.id))}
                    >
                      <Calendar size={12} color={colorScale('primary', 600)} />
                      <Text style={{ fontSize: 11, color: colorScale('primary', 700), margin: 0 }}>
                        Schedule
                      </Text>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* ============================================================ */}
        {/* AI SUMMARY                                                    */}
        {/* ============================================================ */}
        {report.summary && (
          <Box style={{
            padding: `${tokens.spacing?.[4] ?? 16}px ${tokens.spacing?.[6] ?? 24}px`,
            borderBottom: `1px solid ${tokens.colors.neutral?.[200] ?? '#e5e7eb'}`,
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Zap size={14} color={colorScale('primary', 500)} />
              <Text style={{
                fontSize: 12,
                fontWeight: tokens.typography?.fontWeight?.semibold ?? 600,
                color: tokens.colors.neutral?.[700] ?? '#374151',
                margin: 0,
              }}>
                AI Summary
              </Text>
            </Box>
            <Text style={{
              fontSize: 13,
              color: tokens.colors.neutral?.[600] ?? '#4b5563',
              margin: 0,
              lineHeight: 1.6,
              background: tokens.colors.neutral?.[50] ?? '#f9fafb',
              padding: 12,
              borderRadius: tokens.borderRadius?.md ?? 6,
              border: `1px solid ${tokens.colors.neutral?.[100] ?? '#f3f4f6'}`,
            }}>
              {report.summary}
            </Text>
          </Box>
        )}

        {/* ============================================================ */}
        {/* ACTIONS                                                       */}
        {/* ============================================================ */}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 8,
          padding: `${tokens.spacing?.[3] ?? 12}px ${tokens.spacing?.[6] ?? 24}px`,
        }}>
          {pendingCount > 0 && onScheduleCall && (
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: badgeRadius,
                background: colorScale('primary', 50),
                border: `1px solid ${colorScale('primary', 200)}`,
                cursor: 'pointer',
              }}
              {...clickableProps(() => {
                const pending = report.references.find((r) => r.status === 'pending');
                if (pending) onScheduleCall(pending.id);
              })}
            >
              <Calendar size={14} color={colorScale('primary', 600)} />
              <Text style={{ fontSize: 13, color: colorScale('primary', 700), margin: 0 }}>
                Schedule Remaining
              </Text>
            </Box>
          )}
          {onExport && (
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: badgeRadius,
                background: tokens.colors.neutral?.[50] ?? '#f9fafb',
                border: `1px solid ${tokens.colors.neutral?.[200] ?? '#e5e7eb'}`,
                cursor: 'pointer',
              }}
              {...clickableProps(onExport)}
            >
              <Download size={14} color={tokens.colors.neutral?.[600] ?? '#4b5563'} />
              <Text style={{ fontSize: 13, color: tokens.colors.neutral?.[700] ?? '#374151', margin: 0 }}>
                Export Report
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    );
  }
);
