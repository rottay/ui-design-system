'use client';

/**
 * BhCandidateOutreach - Tracker Preset
 * Campaign tracking with metrics funnel chart SVG, recipient status timeline, and analytics
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
import type { BhCandidateOutreachProps, OutreachChannel, CampaignMetrics, OutreachRecipient } from '../../core';
import {
  getChannelColors,
  getMetricColors,
  getRecipientInitials,
  getChannelLabel,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Mail,
  MessageSquare,
  Smartphone,
  Linkedin,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Send,
  Eye,
  MessageCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Activity,
  RefreshCw,
  Filter,
} from 'lucide-react';

function getChannelIcon(channel: OutreachChannel, size: number) {
  switch (channel) {
    case 'email': return <Mail size={size} />;
    case 'sms': return <Smartphone size={size} />;
    case 'whatsapp': return <MessageSquare size={size} />;
    case 'linkedin': return <Linkedin size={size} />;
  }
}

export const TrackerBhCandidateOutreach = createPreset<BhCandidateOutreachProps>({
  name: 'BhCandidateOutreach.Tracker',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhCandidateOutreachProps>) => {
    const { Box, Stack } = primitives;
    const channelColors = getChannelColors(tokens);
    const metricColors = getMetricColors(tokens);

    const {
      channel: controlledChannel,
      onChannelChange,
      recipients = [],
      campaignMetrics: controlledMetrics,
      variants = [],
      onSend,
      loading,
      className,
      style,
    } = props;

    const [internalChannel, setInternalChannel] = useState<OutreachChannel>(controlledChannel ?? 'email');
    const [expandedRecipient, setExpandedRecipient] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'name' | 'status'>('name');
    const [timelineView, setTimelineView] = useState<'list' | 'funnel'>('funnel');

    const channel = controlledChannel ?? internalChannel;

    const handleChannelChange = (ch: OutreachChannel) => {
      setInternalChannel(ch);
      onChannelChange?.(ch);
    };

    const campaignMetrics = controlledMetrics ?? { sent: 0, opened: 0, replied: 0, bounced: 0 };
    const totalSent = campaignMetrics.sent || 1;
    const openRate = Math.round((campaignMetrics.opened / totalSent) * 100);
    const replyRate = Math.round((campaignMetrics.replied / totalSent) * 100);
    const bounceRate = Math.round((campaignMetrics.bounced / totalSent) * 100);

    const glassStyle = tokens.surface.useGlass && tokens.glass
      ? { backdropFilter: tokens.glass.blur, WebkitBackdropFilter: tokens.glass.blur, backgroundColor: tokens.glass.bg }
      : {};

    const surfaceStyle = useMemo(() => createSurfaceStyle(tokens, { elevation: 'md', glass: tokens.surface.useGlass }), [tokens, engine]);

    const channels: OutreachChannel[] = ['email', 'sms', 'whatsapp', 'linkedin'];

    const metricCards: { key: keyof CampaignMetrics; label: string; color: 'primary' | 'info' | 'success' | 'error'; icon: React.ReactNode; rate: number }[] = [
      { key: 'sent', label: 'Sent', color: 'primary', icon: <Send size={16} />, rate: 100 },
      { key: 'opened', label: 'Opened', color: 'info', icon: <Eye size={16} />, rate: openRate },
      { key: 'replied', label: 'Replied', color: 'success', icon: <MessageCircle size={16} />, rate: replyRate },
      { key: 'bounced', label: 'Bounced', color: 'error', icon: <AlertTriangle size={16} />, rate: bounceRate },
    ];

    /* Funnel SVG dimensions */
    const funnelWidth = 400;
    const funnelHeight = 260;
    const funnelStepHeight = 52;
    const funnelPadding = 20;

    const funnelSteps = [
      { label: 'Sent', value: campaignMetrics.sent, color: tokens.colors.primaryScale[400] },
      { label: 'Opened', value: campaignMetrics.opened, color: tokens.colors.infoScale[400] },
      { label: 'Replied', value: campaignMetrics.replied, color: tokens.colors.successScale[400] },
    ];

    const maxFunnelValue = Math.max(funnelSteps[0].value, 1);

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.common.white, ...surfaceStyle, ...style }}>
        {/* Header */}
        <Box style={{
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          ...glassStyle,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <BarChart3 size={18} style={{ color: tokens.colors.primaryScale[600] }} />
            <h2 style={{
              margin: 0,
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
            }}>
              Campaign Tracker
            </h2>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            {/* Channel tabs compact */}
            {channels.map((ch) => {
              const isActive = ch === channel;
              const colors = channelColors[ch];
              return (
                <button
                  key={ch}
                  onClick={() => handleChannelChange(ch)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isActive ? colors.border : tokens.colors.neutral[200]}`,
                    backgroundColor: isActive ? colors.bgColor : tokens.colors.common.white,
                    color: isActive ? colors.color : tokens.colors.neutral[500],
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    ...createHoverStyle(tokens),
                  }}
                >
                  {getChannelIcon(ch, 12)}
                  {getChannelLabel(ch)}
                </button>
              );
            })}
          </Box>
        </Box>

        <Box style={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box style={{ textAlign: 'center' as const, padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>Loading...</Box>
          ) : (
            <Box style={{ padding: tokens.spacing[4] }}>
              {/* Metric cards row */}
              <Box style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: tokens.spacing[3],
                marginBottom: tokens.spacing[4],
              }}>
                {metricCards.map((card) => {
                  const scaleKey = `${card.color}Scale` as const;
                  const scale = (tokens.colors as any)[scaleKey];
                  return (
                    <Box key={card.key} style={{
                      ...createCardStyle(tokens, { elevation: 'sm', glass: tokens.surface.useGlass }),
                      padding: tokens.spacing[3],
                    }}>
                      <Box style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: tokens.spacing[2],
                      }}>
                        <Box style={{
                          width: tokens.spacing[8],
                          height: tokens.spacing[8],
                          borderRadius: tokens.borderRadius.md,
                          backgroundColor: scale[50],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: scale[600],
                        }}>
                          {card.icon}
                        </Box>
                        <Box style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: card.rate >= 50 ? tokens.colors.successScale[600] : card.key === 'bounced' ? tokens.colors.errorScale[600] : tokens.colors.neutral[500],
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[0],
                        }}>
                          {card.key !== 'sent' && (
                            <>
                              {card.rate >= 50 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                              {card.rate}%
                            </>
                          )}
                        </Box>
                      </Box>
                      <Box style={{
                        fontSize: tokens.typography.fontSize['2xl'],
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.neutral[900],
                        lineHeight: tokens.typography.lineHeight.tight,
                      }}>
                        {campaignMetrics[card.key]}
                      </Box>
                      <Box style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[500],
                        marginTop: tokens.spacing[1],
                      }}>
                        {card.label}
                      </Box>
                      {/* Progress bar */}
                      <Box style={{
                        marginTop: tokens.spacing[2],
                        height: 4,
                        backgroundColor: tokens.colors.neutral[100],
                        borderRadius: tokens.borderRadius.full,
                        overflow: 'hidden',
                      }}>
                        <Box style={{
                          width: `${card.rate}%`,
                          height: '100%',
                          backgroundColor: scale[400],
                          borderRadius: tokens.borderRadius.full,
                          transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                        }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              {/* Funnel / Timeline toggle */}
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: tokens.spacing[3],
              }}>
                <Box style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                }}>
                  <Activity size={14} />
                  Campaign Flow
                </Box>
                <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
                  {(['funnel', 'list'] as const).map((view) => (
                    <button
                      key={view}
                      onClick={() => setTimelineView(view)}
                      style={{
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${timelineView === view ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                        backgroundColor: timelineView === view ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                        color: timelineView === view ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: timelineView === view ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        fontFamily: 'inherit',
                        textTransform: 'capitalize' as const,
                      }}
                    >
                      {view}
                    </button>
                  ))}
                </Box>
              </Box>

              {timelineView === 'funnel' ? (
                /* Funnel chart SVG */
                <Box style={{
                  ...createCardStyle(tokens, { elevation: 'sm', glass: tokens.surface.useGlass }),
                  padding: tokens.spacing[4],
                  marginBottom: tokens.spacing[4],
                  display: 'flex',
                  justifyContent: 'center',
                }}>
                  <svg
                    width={funnelWidth}
                    height={funnelHeight}
                    viewBox={`0 0 ${funnelWidth} ${funnelHeight}`}
                    style={{ overflow: 'visible' }}
                  >
                    {funnelSteps.map((step, index) => {
                      const widthPercent = step.value / maxFunnelValue;
                      const barWidth = (funnelWidth - funnelPadding * 2) * widthPercent;
                      const barX = (funnelWidth - barWidth) / 2;
                      const barY = funnelPadding + index * (funnelStepHeight + 12);
                      const barHeight = funnelStepHeight - 8;
                      const radius = 6;

                      return (
                        <g key={step.label}>
                          {/* Funnel bar */}
                          <rect
                            x={barX}
                            y={barY}
                            width={Math.max(barWidth, 40)}
                            height={barHeight}
                            rx={radius}
                            ry={radius}
                            fill={step.color}
                            opacity={0.85}
                          />
                          {/* Label */}
                          <text
                            x={funnelWidth / 2}
                            y={barY + barHeight / 2 - 6}
                            textAnchor="middle"
                            fill={tokens.colors.common.white}
                            fontSize={tokens.typography.fontSize.sm}
                            fontWeight={tokens.typography.fontWeight.semibold}
                          >
                            {step.label}
                          </text>
                          {/* Value */}
                          <text
                            x={funnelWidth / 2}
                            y={barY + barHeight / 2 + 10}
                            textAnchor="middle"
                            fill={tokens.colors.common.white}
                            fontSize={tokens.typography.fontSize.xs}
                            fontWeight={tokens.typography.fontWeight.normal}
                            opacity={0.9}
                          >
                            {step.value} ({maxFunnelValue > 0 ? Math.round((step.value / maxFunnelValue) * 100) : 0}%)
                          </text>
                          {/* Connector arrow */}
                          {index < funnelSteps.length - 1 && (
                            <g>
                              <line
                                x1={funnelWidth / 2}
                                y1={barY + barHeight}
                                x2={funnelWidth / 2}
                                y2={barY + barHeight + 12}
                                stroke={tokens.colors.neutral[300]}
                                strokeWidth={2}
                                strokeDasharray="4 2"
                              />
                              <polygon
                                points={`${funnelWidth / 2 - 4},${barY + barHeight + 6} ${funnelWidth / 2 + 4},${barY + barHeight + 6} ${funnelWidth / 2},${barY + barHeight + 12}`}
                                fill={tokens.colors.neutral[300]}
                              />
                            </g>
                          )}
                        </g>
                      );
                    })}

                    {/* Bounced indicator at bottom */}
                    <g>
                      <rect
                        x={funnelWidth / 2 - 60}
                        y={funnelPadding + funnelSteps.length * (funnelStepHeight + 12)}
                        width={120}
                        height={28}
                        rx={6}
                        ry={6}
                        fill={tokens.colors.errorScale[100]}
                        stroke={tokens.colors.errorScale[300]}
                        strokeWidth={1}
                      />
                      <text
                        x={funnelWidth / 2}
                        y={funnelPadding + funnelSteps.length * (funnelStepHeight + 12) + 18}
                        textAnchor="middle"
                        fill={tokens.colors.errorScale[700]}
                        fontSize={tokens.typography.fontSize.xs}
                        fontWeight={tokens.typography.fontWeight.medium}
                      >
                        {campaignMetrics.bounced} Bounced
                      </text>
                    </g>
                  </svg>
                </Box>
              ) : (
                /* List view of recipients with status */
                <Box style={{
                  ...createCardStyle(tokens, { elevation: 'sm', glass: tokens.surface.useGlass }),
                  padding: 0,
                  marginBottom: tokens.spacing[4],
                  overflow: 'hidden',
                }}>
                  {/* List header */}
                  <Box style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 100px 100px',
                    gap: tokens.spacing[2],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    backgroundColor: tokens.colors.neutral[50],
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                  }}>
                    <Box>Recipient</Box>
                    <Box>Status</Box>
                    <Box>Time</Box>
                  </Box>

                  {/* Recipient rows */}
                  {recipients.map((recipient, idx) => {
                    const isExpanded = expandedRecipient === recipient.id;
                    /* Derive a pseudo status based on position for demo */
                    const statuses = ['sent', 'opened', 'replied', 'bounced'] as const;
                    const pseudoStatus = statuses[idx % statuses.length];
                    const statusColorMap: Record<string, { color: string; bgColor: string; label: string; icon: React.ReactNode }> = {
                      sent: { color: tokens.colors.primaryScale[700], bgColor: tokens.colors.primaryScale[50], label: 'Sent', icon: <Send size={10} /> },
                      opened: { color: tokens.colors.infoScale[700], bgColor: tokens.colors.infoScale[50], label: 'Opened', icon: <Eye size={10} /> },
                      replied: { color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[50], label: 'Replied', icon: <CheckCircle2 size={10} /> },
                      bounced: { color: tokens.colors.errorScale[700], bgColor: tokens.colors.errorScale[50], label: 'Bounced', icon: <XCircle size={10} /> },
                    };
                    const sc = statusColorMap[pseudoStatus];

                    return (
                      <Box key={recipient.id}>
                        <Box
                          onClick={() => setExpandedRecipient(isExpanded ? null : recipient.id)}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 100px 100px',
                            gap: tokens.spacing[2],
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                            cursor: 'pointer',
                            backgroundColor: isExpanded ? tokens.colors.primaryScale[50] : 'transparent',
                            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                            alignItems: 'center',
                            ...createHoverStyle(tokens),
                          }}
                        >
                          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                            {recipient.avatar ? (
                              <img src={recipient.avatar} alt="" style={{
                                width: tokens.spacing[7],
                                height: tokens.spacing[7],
                                borderRadius: tokens.borderRadius.full,
                                objectFit: 'cover' as const,
                              }} />
                            ) : (
                              <Box style={{
                                width: tokens.spacing[7],
                                height: tokens.spacing[7],
                                borderRadius: tokens.borderRadius.full,
                                backgroundColor: tokens.colors.neutral[200],
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.neutral[600],
                                fontWeight: tokens.typography.fontWeight.semibold,
                              }}>
                                {getRecipientInitials(recipient.name)}
                              </Box>
                            )}
                            <Box>
                              <Box style={{
                                fontSize: tokens.typography.fontSize.sm,
                                fontWeight: tokens.typography.fontWeight.medium,
                                color: tokens.colors.neutral[800],
                              }}>
                                {recipient.name}
                              </Box>
                              <Box style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.neutral[500],
                              }}>
                                {recipient.email ?? recipient.phone ?? ''}
                              </Box>
                            </Box>
                            {isExpanded ? <ChevronUp size={12} style={{ color: tokens.colors.neutral[400] }} /> : <ChevronDown size={12} style={{ color: tokens.colors.neutral[400] }} />}
                          </Box>
                          <Box>
                            <Box style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: tokens.spacing[1],
                              padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.full,
                              backgroundColor: sc.bgColor,
                              color: sc.color,
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                            }}>
                              {sc.icon}
                              {sc.label}
                            </Box>
                          </Box>
                          <Box style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                          }}>
                            2m ago
                          </Box>
                        </Box>

                        {/* Expanded timeline */}
                        {isExpanded && (
                          <Box style={{
                            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px ${tokens.spacing[3]}px ${tokens.spacing[8]}px`,
                            backgroundColor: tokens.colors.neutral[50],
                            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                          }}>
                            <Box style={{
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.neutral[600],
                              marginBottom: tokens.spacing[2],
                            }}>
                              Activity Timeline
                            </Box>
                            {/* Timeline entries */}
                            <Stack direction="vertical" spacing="none">
                              {[
                                { time: '10:00 AM', event: 'Message sent', icon: <Send size={10} />, color: tokens.colors.primaryScale[500] },
                                { time: '10:15 AM', event: 'Email opened', icon: <Eye size={10} />, color: tokens.colors.infoScale[500] },
                                ...(pseudoStatus === 'replied' ? [{ time: '10:42 AM', event: 'Replied', icon: <MessageCircle size={10} />, color: tokens.colors.successScale[500] }] : []),
                                ...(pseudoStatus === 'bounced' ? [{ time: '10:01 AM', event: 'Bounced', icon: <XCircle size={10} />, color: tokens.colors.errorScale[500] }] : []),
                              ].map((entry, entryIdx) => (
                                <Box key={entryIdx} style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: tokens.spacing[2],
                                  paddingBottom: tokens.spacing[2],
                                  position: 'relative' as const,
                                }}>
                                  {/* Timeline dot + line */}
                                  <Box style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    flexShrink: 0,
                                    width: tokens.spacing[5],
                                  }}>
                                    <Box style={{
                                      width: tokens.spacing[5],
                                      height: tokens.spacing[5],
                                      borderRadius: tokens.borderRadius.full,
                                      backgroundColor: entry.color,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: tokens.colors.common.white,
                                    }}>
                                      {entry.icon}
                                    </Box>
                                  </Box>
                                  <Box>
                                    <Box style={{
                                      fontSize: tokens.typography.fontSize.sm,
                                      fontWeight: tokens.typography.fontWeight.medium,
                                      color: tokens.colors.neutral[800],
                                    }}>
                                      {entry.event}
                                    </Box>
                                    <Box style={{
                                      fontSize: tokens.typography.fontSize.xs,
                                      color: tokens.colors.neutral[500],
                                    }}>
                                      {entry.time}
                                    </Box>
                                  </Box>
                                </Box>
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Box>
                    );
                  })}

                  {recipients.length === 0 && (
                    <Box style={{
                      textAlign: 'center' as const,
                      padding: tokens.spacing[6],
                      color: tokens.colors.neutral[400],
                      fontSize: tokens.typography.fontSize.sm,
                    }}>
                      No recipients in this campaign
                    </Box>
                  )}
                </Box>
              )}

              {/* A/B Variant comparison */}
              {variants.length > 0 && (
                <Box>
                  <Box style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                    marginBottom: tokens.spacing[3],
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                  }}>
                    <BarChart3 size={14} />
                    A/B Test Results
                  </Box>
                  <Box style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${Math.min(variants.length, 3)}, 1fr)`,
                    gap: tokens.spacing[3],
                  }}>
                    {variants.map((variant, idx) => {
                      const variantTotal = variant.metrics?.sent || 1;
                      const varOpenRate = variant.metrics ? Math.round((variant.metrics.opened / variantTotal) * 100) : 0;
                      const varReplyRate = variant.metrics ? Math.round((variant.metrics.replied / variantTotal) * 100) : 0;
                      const isWinner = variants.every((v, i) => {
                        if (i === idx) return true;
                        const otherTotal = v.metrics?.sent || 1;
                        return (variant.metrics?.replied ?? 0) / variantTotal >= (v.metrics?.replied ?? 0) / otherTotal;
                      });

                      return (
                        <Box key={variant.id} style={{
                          ...createCardStyle(tokens, { elevation: 'sm', glass: tokens.surface.useGlass }),
                          padding: tokens.spacing[3],
                          border: isWinner && variant.metrics ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[400]}` : undefined,
                        }}>
                          <Box style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: tokens.spacing[2],
                          }}>
                            <Box style={{
                              fontSize: tokens.typography.fontSize.sm,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.neutral[800],
                            }}>
                              {variant.name}
                            </Box>
                            {isWinner && variant.metrics && (
                              <Box style={{
                                ...createBadgeStyle(tokens, 'success'),
                                gap: tokens.spacing[1],
                              }}>
                                <CheckCircle2 size={10} />
                                Winner
                              </Box>
                            )}
                          </Box>

                          <Box style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                            marginBottom: tokens.spacing[2],
                          }}>
                            {variant.splitPercent}% split
                          </Box>

                          {variant.metrics ? (
                            <Stack direction="vertical" spacing="sm">
                              {[
                                { label: 'Open rate', value: varOpenRate, color: tokens.colors.infoScale[400] },
                                { label: 'Reply rate', value: varReplyRate, color: tokens.colors.successScale[400] },
                              ].map((stat) => (
                                <Box key={stat.label}>
                                  <Box style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: tokens.typography.fontSize.xs,
                                    color: tokens.colors.neutral[600],
                                    marginBottom: tokens.spacing[1],
                                  }}>
                                    <span>{stat.label}</span>
                                    <span style={{ fontWeight: tokens.typography.fontWeight.semibold }}>{stat.value}%</span>
                                  </Box>
                                  <Box style={{
                                    height: 4,
                                    backgroundColor: tokens.colors.neutral[100],
                                    borderRadius: tokens.borderRadius.full,
                                    overflow: 'hidden',
                                  }}>
                                    <Box style={{
                                      width: `${stat.value}%`,
                                      height: '100%',
                                      backgroundColor: stat.color,
                                      borderRadius: tokens.borderRadius.full,
                                    }} />
                                  </Box>
                                </Box>
                              ))}
                            </Stack>
                          ) : (
                            <Box style={{
                              textAlign: 'center' as const,
                              padding: tokens.spacing[3],
                              color: tokens.colors.neutral[400],
                              fontSize: tokens.typography.fontSize.xs,
                            }}>
                              No data yet
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
