'use client';

/**
 * BhApprovalQueue - Standard Preset
 * Pending approvals dashboard with stats bar, category tabs, approval cards,
 * detail panel with approval chain, action buttons, and history timeline.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createSurfaceStyle,
  createHoverStyle,
  getHoverTransform,
  createSectionHeaderStyle,
} from '../../../helpers';
import type {
  BhApprovalQueueProps,
  ApprovalCategory,
  ApprovalItem,
  ApprovalDetail,
  ApprovalStats,
  ApprovalHistory,
} from '../../core';
import {
  getUrgencyColors,
  getCategoryColors,
  getOutcomeColors,
  getChainStepColors,
  formatDaysAgo,
  CATEGORY_LABELS,
} from '../../core';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Users,
  ArrowRight,
  ChevronRight,
  AlertCircle,
  Briefcase,
  FileText,
  DollarSign,
  MoreHorizontal,
  Send,
  MessageSquare,
  History,
  Timer,
  Award,
  BarChart3,
  TrendingUp,
  X,
  Check,
  UserPlus,
  Layers,
} from 'lucide-react';

const CATEGORY_ICONS: Record<ApprovalCategory, React.ReactNode> = {
  clients: <Briefcase size={16} />,
  positions: <Users size={16} />,
  offers: <DollarSign size={16} />,
  other: <MoreHorizontal size={16} />,
};

const ALL_CATEGORIES: ApprovalCategory[] = ['clients', 'positions', 'offers', 'other'];

export const StandardBhApprovalQueue = createPreset<BhApprovalQueueProps>({
  name: 'BhApprovalQueue.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhApprovalQueueProps>) => {
    const { Box, Stack } = primitives;

    const {
      stats: externalStats,
      items: externalItems = [],
      detail: externalDetail,
      history: externalHistory = [],
      activeCategory: externalActiveCategory,
      onCategoryChange,
      selectedApproval: externalSelectedApproval,
      onApprovalSelect,
      onApprove,
      onReject,
      onDelegate,
      approvalNotes: externalApprovalNotes = '',
      onNotesChange,
      rejectReason: externalRejectReason = '',
      onRejectReasonChange,
      showHistory: externalShowHistory = false,
      onHistoryToggle,
      className,
      style,
    } = props;

    const [activeCategory, setActiveCategory] = useState<ApprovalCategory>(
      externalActiveCategory ?? 'clients'
    );
    const [selectedApproval, setSelectedApproval] = useState<string | null>(
      externalSelectedApproval ?? null
    );
    const [showHistory, setShowHistory] = useState(externalShowHistory);
    const [approvalNotes, setApprovalNotes] = useState(externalApprovalNotes);
    const [rejectReason, setRejectReason] = useState(externalRejectReason);

    useEffect(() => {
      if (externalActiveCategory) setActiveCategory(externalActiveCategory);
    }, [externalActiveCategory]);
    useEffect(() => {
      if (externalSelectedApproval !== undefined) setSelectedApproval(externalSelectedApproval);
    }, [externalSelectedApproval]);
    useEffect(() => { setShowHistory(externalShowHistory); }, [externalShowHistory]);
    useEffect(() => { setApprovalNotes(externalApprovalNotes); }, [externalApprovalNotes]);
    useEffect(() => { setRejectReason(externalRejectReason); }, [externalRejectReason]);

    const handleCategoryChange = useCallback(
      (category: ApprovalCategory) => {
        setActiveCategory(category);
        setSelectedApproval(null);
        onCategoryChange?.(category);
        onApprovalSelect?.(null);
      },
      [onCategoryChange, onApprovalSelect]
    );

    const handleApprovalSelect = useCallback(
      (id: string | null) => {
        setSelectedApproval(id);
        onApprovalSelect?.(id);
        setApprovalNotes('');
        setRejectReason('');
        onNotesChange?.('');
        onRejectReasonChange?.('');
      },
      [onApprovalSelect, onNotesChange, onRejectReasonChange]
    );

    const handleNotesChange = useCallback(
      (value: string) => {
        setApprovalNotes(value);
        onNotesChange?.(value);
      },
      [onNotesChange]
    );

    const handleRejectReasonChange = useCallback(
      (value: string) => {
        setRejectReason(value);
        onRejectReasonChange?.(value);
      },
      [onRejectReasonChange]
    );

    const handleHistoryToggle = useCallback(() => {
      const next = !showHistory;
      setShowHistory(next);
      onHistoryToggle?.();
    }, [showHistory, onHistoryToggle]);

    const handleApprove = useCallback(
      (id: string) => {
        onApprove?.(id, approvalNotes || undefined);
        setApprovalNotes('');
        setSelectedApproval(null);
      },
      [onApprove, approvalNotes]
    );

    const handleReject = useCallback(
      (id: string) => {
        if (!rejectReason.trim()) return;
        onReject?.(id, rejectReason);
        setRejectReason('');
        setSelectedApproval(null);
      },
      [onReject, rejectReason]
    );

    const isGlass = engine === 'modern';
    const urgencyColors = getUrgencyColors(tokens);
    const categoryColors = getCategoryColors(tokens);
    const outcomeColors = getOutcomeColors(tokens);
    const chainStepColors = getChainStepColors(tokens);
    const cardBase = createCardStyle(tokens, { elevation: 'sm', glass: isGlass });
    const cardInteractive = createCardStyle(tokens, { elevation: 'sm', glass: isGlass, interactive: true });
    const hoverTransition = createHoverStyle(tokens);
    const sectionHeader = createSectionHeaderStyle(tokens);

    const containerStyle: React.CSSProperties = {
      ...createSurfaceStyle(tokens, { elevation: 'sm', glass: isGlass }),
      padding: tokens.spacing[5],
      backgroundColor: tokens.colors.neutral[50],
      minHeight: '100%',
      ...style,
    };

    const sectionTitleStyle: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.lg,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[900],
      margin: 0,
    };

    const filteredItems = useMemo(
      () => externalItems.filter((item) => item.type === activeCategory),
      [externalItems, activeCategory]
    );

    const selectedItem = useMemo(
      () => externalItems.find((item) => item.id === selectedApproval),
      [externalItems, selectedApproval]
    );

    /* ---- Stats Bar ---- */
    const renderStatsBar = () => {
      if (!externalStats) return null;

      const totalPending = Object.values(externalStats.pending).reduce((a, b) => a + b, 0);

      const statItems = [
        {
          label: 'Total Pending',
          value: totalPending.toString(),
          icon: <Layers size={16} color={tokens.colors.primaryScale[600]} />,
          bg: tokens.colors.primaryScale[50],
        },
        {
          label: 'Oldest Pending',
          value: `${externalStats.oldestPendingDays}d`,
          icon: <Timer size={16} color={tokens.colors.warningScale[600]} />,
          bg: tokens.colors.warningScale[50],
        },
        {
          label: 'Avg Approval Time',
          value: `${externalStats.avgApprovalTime.toFixed(1)}h`,
          icon: <TrendingUp size={16} color={tokens.colors.successScale[600]} />,
          bg: tokens.colors.successScale[50],
        },
      ];

      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: tokens.spacing[3],
          }}
        >
          {statItems.map((item) => (
            <div key={item.label} style={cardBase}>
              <Stack direction="horizontal" align="center" gap={tokens.spacing[3]}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: item.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <span style={{ ...sectionHeader, marginBottom: 0, display: 'block' }}>
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: tokens.typography.fontSize.xl,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              </Stack>
            </div>
          ))}
        </div>
      );
    };

    /* ---- Category Tabs ---- */
    const renderCategoryTabs = () => {
      return (
        <div style={cardBase}>
          <Stack direction="horizontal" align="center" justify="space-between">
            <Stack direction="horizontal" align="center" gap={tokens.spacing[1]}>
              {ALL_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                const catColor = categoryColors[cat];
                const count = externalStats?.pending[cat] ?? externalItems.filter((i) => i.type === cat).length;

                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    style={{
                      ...hoverTransition,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: isActive
                        ? `1px solid ${catColor.border}`
                        : `1px solid transparent`,
                      backgroundColor: isActive ? catColor.bg : 'transparent',
                      color: isActive ? catColor.color : tokens.colors.neutral[600],
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: isActive
                        ? tokens.typography.fontWeight.semibold
                        : tokens.typography.fontWeight.medium,
                      cursor: 'pointer',
                    }}
                  >
                    {CATEGORY_ICONS[cat]}
                    {CATEGORY_LABELS[cat]}
                    {count > 0 && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: 20,
                          height: 20,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: isActive
                            ? catColor.color
                            : tokens.colors.neutral[300],
                          color: tokens.colors.common.white,
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          padding: `0 ${tokens.spacing[1]}px`,
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </Stack>

            <button
              onClick={handleHistoryToggle}
              style={{
                ...hoverTransition,
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `1px solid ${
                  showHistory
                    ? tokens.colors.primaryScale[300]
                    : tokens.colors.neutral[200]
                }`,
                backgroundColor: showHistory
                  ? tokens.colors.primaryScale[50]
                  : tokens.colors.common.white,
                color: showHistory
                  ? tokens.colors.primaryScale[700]
                  : tokens.colors.neutral[600],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
              }}
            >
              <History size={14} />
              History
            </button>
          </Stack>
        </div>
      );
    };

    /* ---- Approval Cards ---- */
    const renderApprovalCards = () => {
      if (filteredItems.length === 0) {
        return (
          <div
            style={{
              ...cardBase,
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center',
              justifyContent: 'center',
              padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`,
              textAlign: 'center' as const,
            }}
          >
            <CheckCircle
              size={32}
              color={tokens.colors.successScale[300]}
              style={{ marginBottom: tokens.spacing[3] }}
            />
            <p
              style={{
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[600],
                margin: 0,
                marginBottom: tokens.spacing[1],
              }}
            >
              All clear!
            </p>
            <p
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[400],
                margin: 0,
              }}
            >
              No pending approvals in {CATEGORY_LABELS[activeCategory]}
            </p>
          </div>
        );
      }

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column' as const,
            gap: tokens.spacing[3],
          }}
        >
          {filteredItems.map((item) => {
            const isSelected = selectedApproval === item.id;
            const uColor = urgencyColors[item.urgency];
            const catColor = categoryColors[item.type];

            return (
              <div
                key={item.id}
                onClick={() => handleApprovalSelect(item.id)}
                style={{
                  ...createCardStyle(tokens, {
                    elevation: isSelected ? 'md' : 'sm',
                    glass: isGlass,
                    interactive: true,
                  }),
                  borderLeft: `4px solid ${uColor.dot}`,
                  cursor: 'pointer',
                  ...(isSelected
                    ? { outline: `2px solid ${tokens.colors.primaryScale[400]}` }
                    : {}),
                }}
              >
                <Stack
                  direction="horizontal"
                  align="start"
                  justify="space-between"
                  style={{ marginBottom: tokens.spacing[2] }}
                >
                  <div style={{ flex: 1 }}>
                    <Stack
                      direction="horizontal"
                      align="center"
                      gap={tokens.spacing[2]}
                      style={{ marginBottom: tokens.spacing[1] }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.full,
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          backgroundColor: catColor.bg,
                          color: catColor.color,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${catColor.border}`,
                        }}
                      >
                        {CATEGORY_LABELS[item.type]}
                      </span>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: uColor.dot,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: uColor.color,
                          fontWeight: tokens.typography.fontWeight.medium,
                          textTransform: 'capitalize' as const,
                        }}
                      >
                        {item.urgency}
                      </span>
                    </Stack>
                    <span
                      style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                        display: 'block',
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      {item.entityName}
                    </span>
                    <p
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[600],
                        margin: 0,
                        lineHeight: tokens.typography.lineHeight.relaxed,
                      }}
                    >
                      {item.summary}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' as const, flexShrink: 0, marginLeft: tokens.spacing[4] }}>
                    {/* Approval chain progress */}
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: tokens.borderRadius.full,
                        background: `conic-gradient(${tokens.colors.primaryScale[500]} ${item.approvalChainProgress * 3.6}deg, ${tokens.colors.neutral[100]} 0deg)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: 'auto',
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.common.white,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.primaryScale[700],
                        }}
                      >
                        {item.approvalChainProgress}%
                      </div>
                    </div>
                  </div>
                </Stack>

                <Stack
                  direction="horizontal"
                  align="center"
                  justify="space-between"
                >
                  <Stack direction="horizontal" align="center" gap={tokens.spacing[2]}>
                    {item.requesterAvatar ? (
                      <img
                        src={item.requesterAvatar}
                        alt={item.requesterName}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: tokens.borderRadius.full,
                          objectFit: 'cover' as const,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.neutral[200],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <User size={12} color={tokens.colors.neutral[500]} />
                      </div>
                    )}
                    <span
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                      }}
                    >
                      {item.requesterName}
                    </span>
                  </Stack>
                  <Stack direction="horizontal" align="center" gap={tokens.spacing[1]}>
                    <Clock size={12} color={tokens.colors.neutral[400]} />
                    <span
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      {formatDaysAgo(item.submittedDate)}
                    </span>
                  </Stack>
                </Stack>
              </div>
            );
          })}
        </div>
      );
    };

    /* ---- Detail Panel ---- */
    const renderDetailPanel = () => {
      if (!selectedItem) return null;

      const uColor = urgencyColors[selectedItem.urgency];

      return (
        <div style={cardBase}>
          {/* Header */}
          <Stack
            direction="horizontal"
            align="center"
            justify="space-between"
            style={{ marginBottom: tokens.spacing[4] }}
          >
            <div>
              <span
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  display: 'block',
                }}
              >
                {selectedItem.entityName}
              </span>
              <Stack direction="horizontal" align="center" gap={tokens.spacing[2]} style={{ marginTop: tokens.spacing[1] }}>
                <span style={createBadgeStyle(tokens, 'primary')}>
                  {CATEGORY_LABELS[selectedItem.type]}
                </span>
                <Stack direction="horizontal" align="center" gap={tokens.spacing[1]}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: uColor.dot,
                    }}
                  />
                  <span
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: uColor.color,
                      fontWeight: tokens.typography.fontWeight.medium,
                      textTransform: 'capitalize' as const,
                    }}
                  >
                    {selectedItem.urgency} urgency
                  </span>
                </Stack>
              </Stack>
            </div>
            <button
              onClick={() => handleApprovalSelect(null)}
              style={{
                ...hoverTransition,
                padding: tokens.spacing[1],
                border: 'none',
                backgroundColor: 'transparent',
                color: tokens.colors.neutral[400],
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={18} />
            </button>
          </Stack>

          {/* Context card */}
          {externalDetail && (
            <>
              <div
                style={{
                  ...createSurfaceStyle(tokens, { elevation: 'sm', glass: isGlass }),
                  padding: tokens.spacing[4],
                  backgroundColor: tokens.colors.common.white,
                  marginBottom: tokens.spacing[4],
                }}
              >
                <span style={{ ...sectionHeader, display: 'block', marginBottom: tokens.spacing[2] }}>
                  Context
                </span>
                <p
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[700],
                    margin: 0,
                    lineHeight: tokens.typography.lineHeight.relaxed,
                  }}
                >
                  {externalDetail.context}
                </p>
              </div>

              {/* Requester Notes */}
              {externalDetail.requesterNotes && (
                <div
                  style={{
                    ...createSurfaceStyle(tokens, { elevation: 'sm', glass: isGlass }),
                    padding: tokens.spacing[4],
                    backgroundColor: tokens.colors.infoScale[50],
                    borderLeft: `3px solid ${tokens.colors.infoScale[400]}`,
                    marginBottom: tokens.spacing[4],
                  }}
                >
                  <Stack direction="horizontal" align="center" gap={tokens.spacing[1]} style={{ marginBottom: tokens.spacing[2] }}>
                    <MessageSquare size={14} color={tokens.colors.infoScale[600]} />
                    <span style={{ ...sectionHeader, marginBottom: 0 }}>Requester Notes</span>
                  </Stack>
                  <p
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[700],
                      margin: 0,
                      lineHeight: tokens.typography.lineHeight.relaxed,
                      fontStyle: 'italic' as const,
                    }}
                  >
                    {externalDetail.requesterNotes}
                  </p>
                </div>
              )}

              {/* Related data table */}
              {externalDetail.relatedData.length > 0 && (
                <div style={{ marginBottom: tokens.spacing[4] }}>
                  <span style={{ ...sectionHeader, display: 'block', marginBottom: tokens.spacing[2] }}>
                    Related Data
                  </span>
                  <div
                    style={{
                      borderRadius: tokens.borderRadius.md,
                      overflow: 'hidden',
                      border: `1px solid ${tokens.colors.neutral[200]}`,
                    }}
                  >
                    {externalDetail.relatedData.map((data, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '160px 1fr',
                          borderBottom:
                            idx < externalDetail.relatedData.length - 1
                              ? `1px solid ${tokens.colors.neutral[100]}`
                              : 'none',
                        }}
                      >
                        <div
                          style={{
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                            backgroundColor: tokens.colors.neutral[50],
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: tokens.colors.neutral[600],
                            borderRight: `1px solid ${tokens.colors.neutral[200]}`,
                          }}
                        >
                          {data.label}
                        </div>
                        <div
                          style={{
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[800],
                          }}
                        >
                          {data.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Approval Chain */}
              {externalDetail.chainSteps.length > 0 && (
                <div style={{ marginBottom: tokens.spacing[5] }}>
                  <span style={{ ...sectionHeader, display: 'block', marginBottom: tokens.spacing[3] }}>
                    Approval Chain
                  </span>
                  <Stack
                    direction="horizontal"
                    align="center"
                    gap={0}
                    style={{ overflowX: 'auto' as const }}
                  >
                    {externalDetail.chainSteps.map((step, idx) => {
                      const stepColor = chainStepColors[step.status];
                      return (
                        <React.Fragment key={idx}>
                          {idx > 0 && (
                            <div
                              style={{
                                width: 32,
                                height: 2,
                                backgroundColor:
                                  step.status === 'approved' || externalDetail.chainSteps[idx - 1].status === 'approved'
                                    ? tokens.colors.successScale[300]
                                    : tokens.colors.neutral[200],
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column' as const,
                              alignItems: 'center',
                              gap: tokens.spacing[1],
                              flexShrink: 0,
                            }}
                          >
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: tokens.borderRadius.full,
                                backgroundColor: stepColor.bg,
                                border: `2px solid ${stepColor.border}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: stepColor.color,
                              }}
                            >
                              {step.status === 'approved' ? (
                                <Check size={16} />
                              ) : step.status === 'rejected' ? (
                                <X size={16} />
                              ) : (
                                <Clock size={16} />
                              )}
                            </div>
                            <span
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                fontWeight: tokens.typography.fontWeight.medium,
                                color: stepColor.color,
                                textAlign: 'center' as const,
                                maxWidth: 80,
                              }}
                            >
                              {step.role}
                            </span>
                            {step.name && (
                              <span
                                style={{
                                  fontSize: tokens.typography.fontSize.xs,
                                  color: tokens.colors.neutral[500],
                                  textAlign: 'center' as const,
                                  maxWidth: 80,
                                }}
                              >
                                {step.name}
                              </span>
                            )}
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </Stack>
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div
            style={{
              borderTop: `1px solid ${tokens.colors.neutral[200]}`,
              paddingTop: tokens.spacing[4],
            }}
          >
            {/* Approve section */}
            <div style={{ marginBottom: tokens.spacing[4] }}>
              <span style={{ ...sectionHeader, display: 'block', marginBottom: tokens.spacing[2] }}>
                Approve
              </span>
              <textarea
                value={approvalNotes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Add optional notes..."
                style={{
                  width: '100%',
                  minHeight: 60,
                  padding: tokens.spacing[3],
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${tokens.colors.neutral[200]}`,
                  backgroundColor: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[800],
                  fontFamily: 'inherit',
                  resize: 'vertical' as const,
                  outline: 'none',
                  boxSizing: 'border-box' as const,
                }}
              />
              <button
                onClick={() => handleApprove(selectedItem.id)}
                style={{
                  ...hoverTransition,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: 'none',
                  backgroundColor: tokens.colors.successScale[600],
                  color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  cursor: 'pointer',
                  marginTop: tokens.spacing[2],
                }}
              >
                <CheckCircle size={16} />
                Approve
              </button>
            </div>

            {/* Reject section */}
            <div style={{ marginBottom: tokens.spacing[4] }}>
              <span style={{ ...sectionHeader, display: 'block', marginBottom: tokens.spacing[2] }}>
                Reject
              </span>
              <textarea
                value={rejectReason}
                onChange={(e) => handleRejectReasonChange(e.target.value)}
                placeholder="Reason for rejection (required)..."
                style={{
                  width: '100%',
                  minHeight: 60,
                  padding: tokens.spacing[3],
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${
                    rejectReason.trim()
                      ? tokens.colors.neutral[200]
                      : tokens.colors.errorScale[200]
                  }`,
                  backgroundColor: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[800],
                  fontFamily: 'inherit',
                  resize: 'vertical' as const,
                  outline: 'none',
                  boxSizing: 'border-box' as const,
                }}
              />
              <button
                onClick={() => handleReject(selectedItem.id)}
                disabled={!rejectReason.trim()}
                style={{
                  ...hoverTransition,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: 'none',
                  backgroundColor: rejectReason.trim()
                    ? tokens.colors.errorScale[600]
                    : tokens.colors.neutral[200],
                  color: rejectReason.trim()
                    ? tokens.colors.common.white
                    : tokens.colors.neutral[400],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  cursor: rejectReason.trim() ? 'pointer' : 'not-allowed',
                  marginTop: tokens.spacing[2],
                }}
              >
                <XCircle size={16} />
                Reject
              </button>
            </div>

            {/* Delegate */}
            {onDelegate && (
              <div>
                <span style={{ ...sectionHeader, display: 'block', marginBottom: tokens.spacing[2] }}>
                  Delegate
                </span>
                <button
                  onClick={() => onDelegate(selectedItem.id, '')}
                  style={{
                    ...hoverTransition,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `1px solid ${tokens.colors.neutral[200]}`,
                    backgroundColor: tokens.colors.common.white,
                    color: tokens.colors.neutral[700],
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                  }}
                >
                  <UserPlus size={16} />
                  Delegate to...
                </button>
              </div>
            )}
          </div>
        </div>
      );
    };

    /* ---- History Panel ---- */
    const renderHistory = () => {
      if (!showHistory) return null;

      return (
        <div style={cardBase}>
          <Stack
            direction="horizontal"
            align="center"
            justify="space-between"
            style={{ marginBottom: tokens.spacing[4] }}
          >
            <Stack direction="horizontal" align="center" gap={tokens.spacing[2]}>
              <History size={18} color={tokens.colors.neutral[600]} />
              <span style={sectionTitleStyle}>Recent Decisions</span>
            </Stack>
            <button
              onClick={handleHistoryToggle}
              style={{
                ...hoverTransition,
                padding: tokens.spacing[1],
                border: 'none',
                backgroundColor: 'transparent',
                color: tokens.colors.neutral[400],
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={18} />
            </button>
          </Stack>

          {externalHistory.length === 0 ? (
            <p
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[400],
                textAlign: 'center' as const,
                padding: tokens.spacing[4],
                margin: 0,
              }}
            >
              No recent decisions
            </p>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column' as const,
                gap: tokens.spacing[3],
                position: 'relative' as const,
              }}
            >
              {/* Vertical timeline line */}
              <div
                style={{
                  position: 'absolute' as const,
                  left: 15,
                  top: 8,
                  bottom: 8,
                  width: 2,
                  backgroundColor: tokens.colors.neutral[200],
                }}
              />

              {externalHistory.map((h) => {
                const oColor = outcomeColors[h.outcome];
                const catColor = categoryColors[h.type];

                return (
                  <div
                    key={h.id}
                    style={{
                      display: 'flex',
                      gap: tokens.spacing[3],
                      position: 'relative' as const,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        flexShrink: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        paddingTop: tokens.spacing[2],
                        zIndex: 1,
                      }}
                    >
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor:
                            h.outcome === 'approved'
                              ? tokens.colors.successScale[500]
                              : tokens.colors.errorScale[500],
                          border: `2px solid ${tokens.colors.common.white}`,
                        }}
                      />
                    </div>

                    <div
                      style={{
                        ...createSurfaceStyle(tokens, { elevation: 'sm', glass: isGlass }),
                        padding: tokens.spacing[3],
                        backgroundColor: tokens.colors.common.white,
                        flex: 1,
                      }}
                    >
                      <Stack
                        direction="horizontal"
                        align="center"
                        justify="space-between"
                        style={{ marginBottom: tokens.spacing[1] }}
                      >
                        <Stack direction="horizontal" align="center" gap={tokens.spacing[2]}>
                          <span
                            style={{
                              fontSize: tokens.typography.fontSize.sm,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.neutral[900],
                            }}
                          >
                            {h.entityName}
                          </span>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.full,
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                              backgroundColor: oColor.bg,
                              color: oColor.color,
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${oColor.border}`,
                            }}
                          >
                            {h.outcome === 'approved' ? (
                              <CheckCircle size={10} style={{ marginRight: 4 }} />
                            ) : (
                              <XCircle size={10} style={{ marginRight: 4 }} />
                            )}
                            {h.outcome}
                          </span>
                        </Stack>
                        <span
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[400],
                          }}
                        >
                          {formatDaysAgo(h.decidedAt)}
                        </span>
                      </Stack>
                      <Stack direction="horizontal" align="center" gap={tokens.spacing[3]}>
                        <span
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                          }}
                        >
                          by {h.decidedBy}
                        </span>
                        <span
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[400],
                          }}
                        >
                          {h.timing}h turnaround
                        </span>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: `0 ${tokens.spacing[1]}px`,
                            borderRadius: tokens.borderRadius.sm,
                            fontSize: tokens.typography.fontSize.xs,
                            backgroundColor: catColor.bg,
                            color: catColor.color,
                          }}
                        >
                          {CATEGORY_LABELS[h.type]}
                        </span>
                      </Stack>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    };

    /* ---- Main Layout ---- */
    return (
      <div className={className} style={containerStyle}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column' as const,
            gap: tokens.spacing[5],
            maxWidth: 1400,
            margin: '0 auto',
          }}
        >
          {/* Stats Bar */}
          {renderStatsBar()}

          {/* Category Tabs */}
          {renderCategoryTabs()}

          {/* Main content: Cards + Detail */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: selectedItem
                ? 'minmax(0, 1fr) minmax(0, 1fr)'
                : '1fr',
              gap: tokens.spacing[5],
            }}
          >
            {/* Approval Cards */}
            {renderApprovalCards()}

            {/* Detail Panel */}
            {renderDetailPanel()}
          </div>

          {/* History */}
          {renderHistory()}
        </div>
      </div>
    );
  },
});
