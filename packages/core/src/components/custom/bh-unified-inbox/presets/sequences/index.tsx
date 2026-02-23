'use client';

/**
 * BhUnifiedInbox - Sequences Preset
 * Sequence management view with sequence cards, step timelines,
 * status filtering, progress tracking, and create sequence flow.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Mail,
  MessageSquare,
  MessageCircle,
  Linkedin,
  MessagesSquare,
  Plus,
  Play,
  Pause,
  CheckCircle2,
  FileText,
  Zap,
  Target,
  BarChart3,
  ArrowRight,
  Clock,
  Users,
  TrendingUp,
  Eye,
  Reply,
  Send,
  ChevronDown,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createCardHoverStyles,
  createBadgeStyle,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createEntranceAnimation,
  createPersonalitySkeletonStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createProgressBarStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  getAccentAwareLayout,
  getCardPadding,
  clickableProps,
  listProps,
  listItemProps,
  formatDistanceToNow,
  formatPercent,
  ICON_SIZES,
} from '../../../helpers';
import type {
  BhUnifiedInboxProps,
  InboxSequence,
  SequenceStep,
  InboxChannel,
} from '../../core';
import { getSequenceStatusColor, getChannelColor } from '../../core';

/* ------------------------------------------------------------------ */
/*  Channel helpers                                                    */
/* ------------------------------------------------------------------ */

function ChannelIcon({ channel, size = ICON_SIZES.section }: { channel: InboxChannel; size?: number }) {
  switch (channel) {
    case 'email': return <Mail size={size} />;
    case 'sms': return <MessageSquare size={size} />;
    case 'whatsapp': return <MessageCircle size={size} />;
    case 'linkedin': return <Linkedin size={size} />;
    case 'internal': return <MessagesSquare size={size} />;
    default: return <Mail size={size} />;
  }
}

function getChannelLabel(channel: InboxChannel): string {
  switch (channel) {
    case 'email': return 'Email';
    case 'sms': return 'SMS';
    case 'whatsapp': return 'WhatsApp';
    case 'linkedin': return 'LinkedIn';
    case 'internal': return 'Internal';
    default: return channel;
  }
}

function getStatusIcon(status: InboxSequence['status']) {
  switch (status) {
    case 'active': return Play;
    case 'paused': return Pause;
    case 'completed': return CheckCircle2;
    case 'draft': return FileText;
    default: return FileText;
  }
}

function getStatusLabel(status: InboxSequence['status']): string {
  switch (status) {
    case 'active': return 'Active';
    case 'paused': return 'Paused';
    case 'completed': return 'Completed';
    case 'draft': return 'Draft';
    default: return status;
  }
}

function formatDelay(delay: number, unit: 'hours' | 'days'): string {
  if (unit === 'hours') return delay === 1 ? '1 hour' : `${delay} hours`;
  return delay === 1 ? '1 day' : `${delay} days`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const SequencesBhUnifiedInbox = createPreset<BhUnifiedInboxProps>(
  'SequencesBhUnifiedInbox',
  ({ primitives: { Box, Text, Button }, props, tokens }: PresetContext<BhUnifiedInboxProps>) => {
    const {
      sequences = [],
      loading = false,
      onCreateSequence,
      onToggleSequence,
      className,
      style,
    } = props;

    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [expandedSequence, setExpandedSequence] = useState<string | null>(null);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const cardHover = useMemo(() => createCardHoverStyles(tokens), [tokens]);

    // Filter sequences
    const filteredSequences = useMemo(() => {
      let result = [...sequences];
      if (statusFilter !== 'all') {
        result = result.filter(s => s.status === statusFilter);
      }
      // Active first, then by updated date
      result.sort((a, b) => {
        const order: Record<string, number> = { active: 0, paused: 1, draft: 2, completed: 3 };
        const diff = (order[a.status] ?? 4) - (order[b.status] ?? 4);
        if (diff !== 0) return diff;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
      return result;
    }, [sequences, statusFilter]);

    const statusOptions = ['all', 'active', 'paused', 'completed', 'draft'];

    const toggleExpand = useCallback((sequenceId: string) => {
      setExpandedSequence(prev => prev === sequenceId ? null : sequenceId);
    }, []);

    // ---- Styles ----
    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.spacing[5],
      height: '100%',
      ...style,
    };

    const headerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: tokens.spacing[3],
    };

    const filtersRowStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[2],
      flexWrap: 'wrap',
    };

    const gridStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.spacing[3],
    };

    // ---- Loading State ----
    if (loading) {
      const skeletonStyle = createPersonalitySkeletonStyle(tokens);
      return (
        <Box style={containerStyle} className={className}>
          <Box style={headerStyle}>
            <Box style={{ ...skeletonStyle, width: 200, height: 32 }} />
            <Box style={{ ...skeletonStyle, width: 150, height: 36, borderRadius: tokens.borderRadius.md }} />
          </Box>
          <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
            {[1, 2, 3, 4, 5].map(i => (
              <Box key={i} style={{ ...skeletonStyle, width: 80, height: 28, borderRadius: tokens.borderRadius.full }} />
            ))}
          </Box>
          <Box style={gridStyle}>
            {[1, 2, 3].map(i => (
              <Box key={i} style={{ ...skeletonStyle, height: 140, borderRadius: tokens.borderRadius.lg }} />
            ))}
          </Box>
        </Box>
      );
    }

    // ---- Empty State ----
    if (sequences.length === 0) {
      return (
        <Box style={containerStyle} className={className}>
          <Box style={createEmptyStateStyle(tokens)}>
            <Box style={createIconContainerStyle(tokens, { size: 56, color: tokens.colors.primaryScale[50] })}>
              <Zap size={ICON_SIZES.hero} style={{ color: tokens.colors.primaryScale[500] }} />
            </Box>
            <Text style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
              marginTop: tokens.spacing[3],
            }}>
              No Sequences Yet
            </Text>
            <Text style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              marginTop: tokens.spacing[1],
              maxWidth: 400,
            }}>
              Create automated outreach sequences to engage candidates across multiple channels with timed follow-ups.
            </Text>
            {onCreateSequence && (
              <Button
                onClick={() => onCreateSequence({ name: '', steps: [] })}
                style={{
                  marginTop: tokens.spacing[4],
                  backgroundColor: tokens.colors.primaryScale[600],
                  color: tokens.colors.common.white,
                  border: 'none',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                }}
              >
                <Plus size={ICON_SIZES.section} />
                Create Sequence
              </Button>
            )}
          </Box>
        </Box>
      );
    }

    // ---- Sequence Card Renderer ----
    const renderSequenceCard = (sequence: InboxSequence, index: number) => {
      const StatusIcon = getStatusIcon(sequence.status);
      const statusColor = getSequenceStatusColor(sequence.status);
      const isExpanded = expandedSequence === sequence.id;
      const isHovered = hoveredCard === sequence.id;
      const entrance = createEntranceAnimation(tokens, { index });
      const accentBar = createPersonalityAccentBar(tokens);
      const layout = getAccentAwareLayout(tokens);

      const completionPercent = sequence.targetCount > 0
        ? Math.round((sequence.completedCount / sequence.targetCount) * 100)
        : 0;
      const progressBar = createProgressBarStyle(tokens, { percent: completionPercent });

      const cardBaseStyle: React.CSSProperties = {
        ...createCardStyle(tokens, { elevation: 'sm' }),
        ...cardHover.base,
        ...(isHovered ? cardHover.hover : {}),
        ...layout.outer,
        overflow: 'hidden',
        ...entrance.animate,
        transition: entrance.transition,
      };

      return (
        <Box
          key={sequence.id}
          style={cardBaseStyle}
          onMouseEnter={() => setHoveredCard(sequence.id)}
          onMouseLeave={() => setHoveredCard(null)}
          {...listItemProps()}
        >
          {accentBar && <Box style={accentBar} />}

          <Box style={{
            ...layout.inner,
            padding: getCardPadding(tokens),
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[3],
          }}>
            {/* Card header */}
            <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: tokens.spacing[2] }}>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1], flex: 1, minWidth: 0 }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <Text style={{
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: ptypo.headingWeight,
                    color: tokens.colors.neutral[900],
                    letterSpacing: ptypo.headingLetterSpacing,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {sequence.name}
                  </Text>
                  <Box style={createBadgeStyle(tokens, statusColor)}>
                    <StatusIcon size={ICON_SIZES.inline} />
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, marginLeft: 4 }}>
                      {getStatusLabel(sequence.status)}
                    </Text>
                  </Box>
                </Box>
                {sequence.description && (
                  <Text style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[500],
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {sequence.description}
                  </Text>
                )}
              </Box>

              {/* Actions */}
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], flexShrink: 0 }}>
                {sequence.status === 'active' && onToggleSequence && (
                  <Button
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); onToggleSequence(sequence.id, 'pause'); }}
                    style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      backgroundColor: 'transparent',
                      border: `1px solid ${tokens.colors.warningScale[300]}`,
                      borderRadius: tokens.borderRadius.md,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      color: tokens.colors.warningScale[700],
                      fontSize: tokens.typography.fontSize.xs,
                    }}
                  >
                    <Pause size={ICON_SIZES.label} />
                    Pause
                  </Button>
                )}
                {sequence.status === 'paused' && onToggleSequence && (
                  <Button
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); onToggleSequence(sequence.id, 'resume'); }}
                    style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      backgroundColor: 'transparent',
                      border: `1px solid ${tokens.colors.successScale[300]}`,
                      borderRadius: tokens.borderRadius.md,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      color: tokens.colors.successScale[700],
                      fontSize: tokens.typography.fontSize.xs,
                    }}
                  >
                    <Play size={ICON_SIZES.label} />
                    Resume
                  </Button>
                )}
              </Box>
            </Box>

            {/* Stats row */}
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[4],
              flexWrap: 'wrap',
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <Zap size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[400] }} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                  {sequence.steps.length} step{sequence.steps.length !== 1 ? 's' : ''}
                </Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <Target size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[400] }} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                  {sequence.targetCount} target{sequence.targetCount !== 1 ? 's' : ''}
                </Text>
              </Box>
              {sequence.openRate != null && (
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <Eye size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[400] }} />
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                    {formatPercent(sequence.openRate)} open
                  </Text>
                </Box>
              )}
              {sequence.replyRate != null && (
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <Reply size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[400] }} />
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                    {formatPercent(sequence.replyRate)} reply
                  </Text>
                </Box>
              )}
            </Box>

            {/* Progress bar */}
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  Completion
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>
                  {sequence.completedCount}/{sequence.targetCount} ({completionPercent}%)
                </Text>
              </Box>
              <Box style={progressBar.track}>
                <Box style={progressBar.fill} />
              </Box>
            </Box>

            {/* Expand/Collapse */}
            <Box
              onClick={() => toggleExpand(sequence.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                cursor: 'pointer',
                color: tokens.colors.primaryScale[600],
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
              }}
              {...clickableProps(() => toggleExpand(sequence.id), `${isExpanded ? 'Collapse' : 'Expand'} sequence steps`)}
            >
              {isExpanded ? <ChevronDown size={ICON_SIZES.label} /> : <ChevronRight size={ICON_SIZES.label} />}
              {isExpanded ? 'Hide steps' : 'Show steps'}
            </Box>

            {/* Step Timeline */}
            {isExpanded && (
              <Box style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
                paddingLeft: tokens.spacing[2],
                borderLeft: `2px solid ${tokens.colors.neutral[200]}`,
                marginLeft: tokens.spacing[2],
              }}>
                {sequence.steps.map((step, stepIdx) => {
                  const channelColorName = getChannelColor(step.channel);
                  const channelScale = tokens.colors[`${channelColorName}Scale` as keyof typeof tokens.colors] as Record<number, string> | undefined;
                  const stepEntrance = createEntranceAnimation(tokens, { index: stepIdx });

                  return (
                    <Box key={stepIdx} style={{
                      display: 'flex',
                      gap: tokens.spacing[3],
                      padding: `${tokens.spacing[3]}px 0`,
                      paddingLeft: tokens.spacing[3],
                      position: 'relative',
                      ...stepEntrance.animate,
                      transition: stepEntrance.transition,
                    }}>
                      {/* Dot indicator */}
                      <Box style={{
                        position: 'absolute',
                        left: -7,
                        top: tokens.spacing[3],
                        width: 12,
                        height: 12,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: channelScale?.[100] ?? tokens.colors.neutral[100],
                        border: `2px solid ${channelScale?.[500] ?? tokens.colors.neutral[400]}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Box style={{
                          width: 4,
                          height: 4,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: channelScale?.[500] ?? tokens.colors.neutral[400],
                        }} />
                      </Box>

                      {/* Step content */}
                      <Box style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: tokens.spacing[2],
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: tokens.colors.neutral[50],
                        border: `1px solid ${tokens.colors.neutral[100]}`,
                      }}>
                        {/* Step header */}
                        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                            <Box style={{
                              ...createBadgeStyle(tokens, channelColorName),
                              gap: tokens.spacing[1],
                            }}>
                              <ChannelIcon channel={step.channel} size={ICON_SIZES.inline} />
                              {getChannelLabel(step.channel)}
                            </Box>
                            <Text style={{
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.neutral[700],
                            }}>
                              Step {step.order}
                            </Text>
                          </Box>
                          {stepIdx > 0 && (
                            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                              <Clock size={ICON_SIZES.inline} style={{ color: tokens.colors.neutral[400] }} />
                              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                                Wait {formatDelay(step.delay, step.delayUnit)}
                              </Text>
                            </Box>
                          )}
                        </Box>

                        {/* Template preview */}
                        {step.subject && (
                          <Text style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: tokens.colors.neutral[700],
                          }}>
                            Subject: {step.subject}
                          </Text>
                        )}
                        <Text style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                          lineHeight: 1.5,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}>
                          {step.template}
                        </Text>

                        {/* Step stats */}
                        {(step.sentCount > 0 || step.openCount > 0 || step.replyCount > 0) && (
                          <Box style={{
                            display: 'flex',
                            gap: tokens.spacing[3],
                            paddingTop: tokens.spacing[1],
                            borderTop: `1px solid ${tokens.colors.neutral[100]}`,
                          }}>
                            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                              <Send size={ICON_SIZES.inline} style={{ color: tokens.colors.neutral[400] }} />
                              <Text style={{ fontSize: 10, color: tokens.colors.neutral[500] }}>
                                {step.sentCount} sent
                              </Text>
                            </Box>
                            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                              <Eye size={ICON_SIZES.inline} style={{ color: tokens.colors.neutral[400] }} />
                              <Text style={{ fontSize: 10, color: tokens.colors.neutral[500] }}>
                                {step.openCount} opened
                              </Text>
                            </Box>
                            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                              <Reply size={ICON_SIZES.inline} style={{ color: tokens.colors.neutral[400] }} />
                              <Text style={{ fontSize: 10, color: tokens.colors.neutral[500] }}>
                                {step.replyCount} replied
                              </Text>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      );
    };

    // ---- Main Render ----
    return (
      <Box style={containerStyle} className={className}>
        {/* Header */}
        <Box style={headerStyle}>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
            <Text style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: ptypo.headingWeight,
              color: tokens.colors.neutral[900],
              letterSpacing: ptypo.headingLetterSpacing,
            }}>
              Sequences
            </Text>
            <Text style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
            }}>
              Automated outreach campaigns across channels
            </Text>
          </Box>
          {onCreateSequence && (
            <Button
              onClick={() => onCreateSequence({ name: '', steps: [] })}
              style={{
                backgroundColor: tokens.colors.primaryScale[600],
                color: tokens.colors.common.white,
                border: 'none',
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
              }}
            >
              <Plus size={ICON_SIZES.section} />
              New Sequence
            </Button>
          )}
        </Box>

        {/* Filters */}
        <Box style={filtersRowStyle}>
          {statusOptions.map(opt => {
            const count = opt === 'all' ? sequences.length : sequences.filter(s => s.status === opt).length;
            return (
              <Box
                key={opt}
                onClick={() => setStatusFilter(opt)}
                style={createFilterPillStyle(tokens, { active: statusFilter === opt })}
                {...clickableProps(() => setStatusFilter(opt), `Filter by ${opt}`)}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                <Box style={{
                  marginLeft: 4,
                  fontSize: 10,
                  color: statusFilter === opt ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400],
                }}>
                  {count}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Sequence List */}
        <Box style={gridStyle} {...listProps('Outreach sequences')}>
          {filteredSequences.length === 0 ? (
            <Box style={createEmptyStateStyle(tokens)}>
              <Filter size={ICON_SIZES.feature} style={{ color: tokens.colors.neutral[300] }} />
              <Text style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[400],
                marginTop: tokens.spacing[2],
              }}>
                No sequences match the current filter
              </Text>
            </Box>
          ) : (
            filteredSequences.map((seq, index) => renderSequenceCard(seq, index))
          )}
        </Box>
      </Box>
    );
  }
);
