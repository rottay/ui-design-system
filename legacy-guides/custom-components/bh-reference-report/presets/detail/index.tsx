'use client';

/**
 * BhReferenceReport - Detail Preset
 * Single reference deep dive with question-by-question breakdown.
 *
 * Layout:
 * - Reference info: name, role, company, relationship, duration
 * - Question-by-question breakdown: question text, answer text, sentiment, rating stars, flags
 * - Sentiment analysis per answer
 * - Timeline of the reference call
 * - Comparison with other references on same dimensions
 * - Notes section
 * - Contact reference button
 */

import { useState, useMemo, useCallback } from 'react';
import {
  User,
  Building2,
  Briefcase,
  Link2,
  Clock,
  CheckCircle2,
  Star,
  AlertTriangle,
  Flag,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Phone,
  Mail,
  MessageSquare,
  ChevronLeft,
  Edit3,
  BarChart3,
  HelpCircle,
  ShieldCheck,
  ArrowLeft,
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
  ReferenceResponse,
  ReferenceDimension,
} from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getSentimentColor(sentiment: string): 'success' | 'warning' | 'error' | 'secondary' {
  switch (sentiment) {
    case 'positive': return 'success';
    case 'negative': return 'error';
    case 'mixed': return 'warning';
    default: return 'secondary';
  }
}

function getSentimentIcon(sentiment: string): typeof ThumbsUp {
  switch (sentiment) {
    case 'positive': return ThumbsUp;
    case 'negative': return ThumbsDown;
    case 'mixed': return AlertTriangle;
    default: return Minus;
  }
}

function renderStars(rating: number, maxRating: number, filledColor: string, emptyColor: string): React.ReactElement[] {
  return Array.from({ length: maxRating }, (_, i) => (
    <Star
      key={i}
      size={14}
      color={i < rating ? filledColor : emptyColor}
      fill={i < rating ? filledColor : 'none'}
    />
  ));
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

export const DetailBhReferenceReport = createPreset<BhReferenceReportProps>(
  'DetailBhReferenceReport',
  ({ primitives: { Box, Text, Button, Input }, props, tokens }: PresetContext<BhReferenceReportProps>) => {
    const {
      report,
      loading = false,
      onContactReference,
      onVerify,
      selectedReferenceId,
      className,
      style,
    } = props;

    const [noteText, setNoteText] = useState('');
    const [editingNotes, setEditingNotes] = useState(false);

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
          <Box style={{ ...skeletonStyle, height: 24, width: '40%', marginBottom: 16 }} />
          <Box style={{ ...skeletonStyle, height: 60, width: '100%', marginBottom: 16 }} />
          {Array.from({ length: 4 }, (_, i) => (
            <Box key={i} style={{ ...skeletonStyle, height: 80, width: '100%', marginBottom: 12 }} />
          ))}
        </Box>
      );
    }

    if (!report) {
      return (
        <Box className={className} style={{ ...cardStyle, ...createEmptyStateStyle(tokens), ...style }}>
          <User size={32} color={tokens.colors.neutral?.[300] ?? '#d1d5db'} />
          <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral?.[500] ?? '#6b7280', marginTop: 12 }}>
            No reference report available
          </Text>
        </Box>
      );
    }

    // Find selected reference
    const selectedRef = report.references.find(
      (r) => r.id === selectedReferenceId
    ) ?? report.references.find((r) => r.status === 'completed') ?? report.references[0];

    if (!selectedRef) {
      return (
        <Box className={className} style={{ ...cardStyle, ...createEmptyStateStyle(tokens), ...style }}>
          <User size={32} color={tokens.colors.neutral?.[300] ?? '#d1d5db'} />
          <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral?.[500] ?? '#6b7280', marginTop: 12 }}>
            No reference selected
          </Text>
        </Box>
      );
    }

    // Collect all responses for this reference from dimensions
    const allResponses: ReferenceResponse[] = report.dimensions.flatMap((dim) => dim.responses);

    return (
      <Box className={className} style={{ ...cardStyle, padding: 0, overflow: 'hidden', ...entranceAnim, ...style }}>
        {/* ============================================================ */}
        {/* REFERENCE INFO HEADER                                         */}
        {/* ============================================================ */}
        <Box style={{
          padding: `${tokens.spacing?.[5] ?? 20}px ${tokens.spacing?.[6] ?? 24}px`,
          borderBottom: `1px solid ${tokens.colors.neutral?.[200] ?? '#e5e7eb'}`,
          background: tokens.colors.neutral?.[50] ?? '#f9fafb',
        }}>
          <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Text style={{
                fontSize: 18,
                color: tokens.colors.neutral?.[900] ?? '#111',
                margin: 0,
              }}>
                {selectedRef.referenceeName}
              </Text>
              <Text style={{
                fontSize: 14,
                color: tokens.colors.neutral?.[600] ?? '#4b5563',
                margin: 0,
                marginTop: 2,
              }}>
                {selectedRef.referenceRole}
              </Text>
            </Box>
            <Box style={{ display: 'flex', gap: 8 }}>
              {onContactReference && (
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: badgeRadius,
                    background: colorScale('primary', 50),
                    border: `1px solid ${colorScale('primary', 200)}`,
                    cursor: 'pointer',
                  }}
                  {...clickableProps(() => onContactReference(selectedRef.id))}
                >
                  <Phone size={14} color={colorScale('primary', 600)} />
                  <Text style={{ fontSize: 12, color: colorScale('primary', 700), margin: 0 }}>
                    Contact
                  </Text>
                </Box>
              )}
              {onVerify && (
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: badgeRadius,
                    background: colorScale('success', 50),
                    border: `1px solid ${colorScale('success', 200)}`,
                    cursor: 'pointer',
                  }}
                  {...clickableProps(() => onVerify(selectedRef.id))}
                >
                  <ShieldCheck size={14} color={colorScale('success', 600)} />
                  <Text style={{ fontSize: 12, color: colorScale('success', 700), margin: 0 }}>
                    Verify
                  </Text>
                </Box>
              )}
            </Box>
          </Box>

          {/* Meta info */}
          <Box style={{
            display: 'flex',
            flexWrap: 'wrap' as const,
            gap: 16,
            marginTop: 12,
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Building2 size={14} color={tokens.colors.neutral?.[400] ?? '#9ca3af'} />
              <Text style={{ fontSize: 12, color: tokens.colors.neutral?.[600] ?? '#4b5563', margin: 0 }}>
                {selectedRef.company}
              </Text>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Link2 size={14} color={tokens.colors.neutral?.[400] ?? '#9ca3af'} />
              <Text style={{ fontSize: 12, color: tokens.colors.neutral?.[600] ?? '#4b5563', margin: 0 }}>
                {selectedRef.relationship}
              </Text>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} color={tokens.colors.neutral?.[400] ?? '#9ca3af'} />
              <Text style={{ fontSize: 12, color: tokens.colors.neutral?.[600] ?? '#4b5563', margin: 0 }}>
                {selectedRef.duration}
              </Text>
            </Box>
            {selectedRef.completedAt && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={14} color={colorScale('success', 500)} />
                <Text style={{ fontSize: 12, color: tokens.colors.neutral?.[600] ?? '#4b5563', margin: 0 }}>
                  Completed {formatDate(selectedRef.completedAt)}
                </Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* ============================================================ */}
        {/* QUESTION-BY-QUESTION BREAKDOWN                                */}
        {/* ============================================================ */}
        <Box style={{
          padding: `${tokens.spacing?.[4] ?? 16}px ${tokens.spacing?.[6] ?? 24}px`,
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
            Response Details ({allResponses.length})
          </Text>

          {allResponses.length === 0 ? (
            <Box style={{ ...createEmptyStateStyle(tokens), padding: 40 }}>
              <HelpCircle size={24} color={tokens.colors.neutral?.[300] ?? '#d1d5db'} />
              <Text style={{ fontSize: 13, color: tokens.colors.neutral?.[400] ?? '#9ca3af', margin: 0, marginTop: 8 }}>
                No responses recorded
              </Text>
            </Box>
          ) : (
            allResponses.map((resp, idx) => {
              const sentColor = getSentimentColor(resp.sentiment);
              const SentIcon = getSentimentIcon(resp.sentiment);
              return (
                <Box
                  key={idx}
                  style={{
                    marginBottom: 12,
                    borderRadius: tokens.borderRadius?.md ?? 6,
                    border: `1px solid ${tokens.colors.neutral?.[100] ?? '#f3f4f6'}`,
                    overflow: 'hidden',
                  }}
                >
                  {/* Question */}
                  <Box style={{
                    padding: '10px 14px',
                    background: tokens.colors.neutral?.[50] ?? '#f9fafb',
                    borderBottom: `1px solid ${tokens.colors.neutral?.[100] ?? '#f3f4f6'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <Text style={{
                      fontSize: 13,
                      fontWeight: tokens.typography?.fontWeight?.semibold ?? 600,
                      color: tokens.colors.neutral?.[800] ?? '#1f2937',
                      margin: 0,
                      flex: 1,
                    }}>
                      {resp.question}
                    </Text>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 12 }}>
                      {/* Sentiment badge */}
                      <Box style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 8px',
                        borderRadius: badgeRadius,
                        background: colorScale(sentColor === 'secondary' ? 'primary' : sentColor, 50),
                        border: `1px solid ${colorScale(sentColor === 'secondary' ? 'primary' : sentColor, 200)}`,
                      }}>
                        <SentIcon size={12} color={colorScale(sentColor === 'secondary' ? 'primary' : sentColor, 600)} />
                        <Text style={{
                          fontSize: 11,
                          color: colorScale(sentColor === 'secondary' ? 'primary' : sentColor, 700),
                          margin: 0,
                          textTransform: 'capitalize' as const,
                        }}>
                          {resp.sentiment}
                        </Text>
                      </Box>
                      {/* Rating stars */}
                      {resp.rating !== undefined && resp.rating > 0 && (
                        <Box style={{ display: 'flex', gap: 2 }}>
                          {renderStars(resp.rating, 5, colorScale('warning', 500), tokens.colors.neutral?.[200] ?? '#e5e7eb')}
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Answer */}
                  <Box style={{ padding: '10px 14px' }}>
                    <Text style={{
                      fontSize: 13,
                      color: tokens.colors.neutral?.[700] ?? '#374151',
                      margin: 0,
                      lineHeight: 1.6,
                    }}>
                      {resp.answer}
                    </Text>

                    {/* Flags */}
                    {resp.flags.length > 0 && (
                      <Box style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' as const }}>
                        {resp.flags.map((flag, fIdx) => (
                          <Box
                            key={fIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '2px 8px',
                              borderRadius: badgeRadius,
                              background: colorScale('error', 50),
                              border: `1px solid ${colorScale('error', 200)}`,
                            }}
                          >
                            <Flag size={10} color={colorScale('error', 500)} />
                            <Text style={{
                              fontSize: 11,
                              color: colorScale('error', 700),
                              margin: 0,
                            }}>
                              {flag}
                            </Text>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })
          )}
        </Box>

        {/* ============================================================ */}
        {/* DIMENSION COMPARISON                                          */}
        {/* ============================================================ */}
        {report.dimensions.length > 0 && (
          <Box style={{
            padding: `${tokens.spacing?.[4] ?? 16}px ${tokens.spacing?.[6] ?? 24}px`,
            borderTop: `1px solid ${tokens.colors.neutral?.[200] ?? '#e5e7eb'}`,
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <BarChart3 size={14} color={tokens.colors.neutral?.[500] ?? '#6b7280'} />
              <Text style={{
                fontSize: 11,
                fontWeight: tokens.typography?.fontWeight?.semibold ?? 600,
                color: tokens.colors.neutral?.[400] ?? '#9ca3af',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
                margin: 0,
              }}>
                Dimension Comparison
              </Text>
            </Box>
            {report.dimensions.map((dim, idx) => {
              const dimColor = dim.score >= 75 ? 'success' : dim.score >= 50 ? 'warning' : 'error';
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
        {/* NOTES SECTION                                                 */}
        {/* ============================================================ */}
        <Box style={{
          padding: `${tokens.spacing?.[4] ?? 16}px ${tokens.spacing?.[6] ?? 24}px`,
          borderTop: `1px solid ${tokens.colors.neutral?.[200] ?? '#e5e7eb'}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Edit3 size={14} color={tokens.colors.neutral?.[500] ?? '#6b7280'} />
              <Text style={{
                fontSize: 11,
                fontWeight: tokens.typography?.fontWeight?.semibold ?? 600,
                color: tokens.colors.neutral?.[400] ?? '#9ca3af',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
                margin: 0,
              }}>
                Notes
              </Text>
            </Box>
            <Box
              style={{
                cursor: 'pointer',
                padding: '2px 8px',
                borderRadius: badgeRadius,
                background: editingNotes ? colorScale('primary', 50) : 'transparent',
              }}
              {...clickableProps(() => setEditingNotes((p) => !p))}
            >
              <Text style={{
                fontSize: 11,
                color: colorScale('primary', 600),
                margin: 0,
              }}>
                {editingNotes ? 'Done' : 'Edit'}
              </Text>
            </Box>
          </Box>
          {editingNotes ? (
            <Box style={{
              border: `1px solid ${tokens.colors.neutral?.[200] ?? '#e5e7eb'}`,
              borderRadius: tokens.borderRadius?.md ?? 6,
              overflow: 'hidden',
            }}>
              <Input
                value={noteText}
                onChange={(value: string) => setNoteText(value)}
                placeholder="Add notes about this reference..."
                style={{
                  width: '100%',
                  padding: 12,
                  fontSize: 13,
                  border: 'none',
                  outline: 'none',
                  minHeight: 80,
                }}
              />
            </Box>
          ) : (
            <Box style={{
              padding: 12,
              background: tokens.colors.neutral?.[50] ?? '#f9fafb',
              borderRadius: tokens.borderRadius?.md ?? 6,
              border: `1px solid ${tokens.colors.neutral?.[100] ?? '#f3f4f6'}`,
              minHeight: 60,
            }}>
              <Text style={{
                fontSize: 13,
                color: noteText
                  ? tokens.colors.neutral?.[700] ?? '#374151'
                  : tokens.colors.neutral?.[400] ?? '#9ca3af',
                margin: 0,
                lineHeight: 1.5,
              }}>
                {noteText || 'No notes yet. Click Edit to add notes.'}
              </Text>
            </Box>
          )}
        </Box>

        {/* ============================================================ */}
        {/* OTHER REFERENCES                                              */}
        {/* ============================================================ */}
        {report.references.length > 1 && (
          <Box style={{
            padding: `${tokens.spacing?.[4] ?? 16}px ${tokens.spacing?.[6] ?? 24}px`,
            borderTop: `1px solid ${tokens.colors.neutral?.[200] ?? '#e5e7eb'}`,
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
              Other References
            </Text>
            {report.references
              .filter((r) => r.id !== selectedRef.id)
              .map((ref) => {
                const sColor = ref.status === 'completed' ? 'success'
                  : ref.status === 'scheduled' ? 'warning'
                  : ref.status === 'declined' ? 'error'
                  : 'secondary';
                return (
                  <Box key={ref.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    marginBottom: 4,
                    borderRadius: tokens.borderRadius?.sm ?? 4,
                    border: `1px solid ${tokens.colors.neutral?.[100] ?? '#f3f4f6'}`,
                  }}>
                    <Box>
                      <Text style={{
                        fontSize: 13,
                        fontWeight: tokens.typography?.fontWeight?.medium ?? 500,
                        color: tokens.colors.neutral?.[700] ?? '#374151',
                        margin: 0,
                      }}>
                        {ref.referenceeName}
                      </Text>
                      <Text style={{
                        fontSize: 11,
                        color: tokens.colors.neutral?.[500] ?? '#6b7280',
                        margin: 0,
                      }}>
                        {ref.referenceRole} - {ref.relationship}
                      </Text>
                    </Box>
                    <Box style={{
                      ...createBadgeStyle(tokens, sColor),
                      fontSize: 11,
                      padding: '2px 8px',
                    }}>
                      {ref.status}
                    </Box>
                  </Box>
                );
              })}
          </Box>
        )}
      </Box>
    );
  }
);
