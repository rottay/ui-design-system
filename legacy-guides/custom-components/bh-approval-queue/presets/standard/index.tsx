'use client';

/**
 * BhApprovalQueue - Standard Preset
 * Pending approvals dashboard with stats bar, category tabs, approval cards,
 * detail panel with approval chain, action buttons, and history timeline.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
  createSurfaceStyle,
  getHoverTransform,
  createEntranceAnimation,
  createStaggerDelay,
  createCardHoverStyles,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createPersonalitySectionHeaderStyle,
  createIconContainerStyle,

  createDividerStyle,
  createPersonalitySkeletonStyle,
  formatAbbreviated,
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

const EMPTY_ITEMS: ApprovalItem[] = [];
const EMPTY_HISTORY: ApprovalHistory[] = [];

export const StandardBhApprovalQueue = createPreset<BhApprovalQueueProps>({
  name: 'BhApprovalQueue.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhApprovalQueueProps>) => {
    const { Box, Text, Stack } = primitives;
    const t = tokens;
    const isGlass = t.surface.useGlass && !!t.glass;
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);

    const {
      stats: externalStats,
      items: rawExternalItems = [],
      detail: externalDetail,
      history: rawExternalHistory = [],
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

    const externalItems = Array.isArray(rawExternalItems) ? rawExternalItems : EMPTY_ITEMS;
    const externalHistory = Array.isArray(rawExternalHistory) ? rawExternalHistory : EMPTY_HISTORY;

    const [activeCategory, setActiveCategory] = useState<ApprovalCategory>(externalActiveCategory ?? 'clients');
    const [selectedApproval, setSelectedApproval] = useState<string | null>(externalSelectedApproval ?? null);
    const [showHistory, setShowHistory] = useState(externalShowHistory ?? false);
    const [approvalNotes, setApprovalNotes] = useState(externalApprovalNotes ?? '');
    const [rejectReason, setRejectReason] = useState(externalRejectReason ?? '');

    const handleCategoryChange = useCallback((category: ApprovalCategory) => {
      setActiveCategory(category); setSelectedApproval(null); onCategoryChange?.(category); onApprovalSelect?.(null);
    }, [onCategoryChange, onApprovalSelect]);

    const handleApprovalSelect = useCallback((id: string | null) => {
      setSelectedApproval(id); onApprovalSelect?.(id); setApprovalNotes(''); setRejectReason(''); onNotesChange?.(''); onRejectReasonChange?.('');
    }, [onApprovalSelect, onNotesChange, onRejectReasonChange]);

    const handleNotesChange = useCallback((value: string) => { setApprovalNotes(value); onNotesChange?.(value); }, [onNotesChange]);
    const handleRejectReasonChange = useCallback((value: string) => { setRejectReason(value); onRejectReasonChange?.(value); }, [onRejectReasonChange]);
    const handleHistoryToggle = useCallback(() => { const next = !showHistory; setShowHistory(next); onHistoryToggle?.(); }, [showHistory, onHistoryToggle]);
    const handleApprove = useCallback((id: string) => { onApprove?.(id, approvalNotes || undefined); setApprovalNotes(''); setSelectedApproval(null); }, [onApprove, approvalNotes]);
    const handleReject = useCallback((id: string) => { if (!rejectReason.trim()) return; onReject?.(id, rejectReason); setRejectReason(''); setSelectedApproval(null); }, [onReject, rejectReason]);

    const handleKeyAction = useCallback((e: React.KeyboardEvent, action: () => void) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); action(); }
    }, []);

    const urgencyColors = useMemo(() => getUrgencyColors(t), [t]);
    const categoryColors = useMemo(() => getCategoryColors(t), [t]);
    const outcomeColors = useMemo(() => getOutcomeColors(t), [t]);
    const chainStepColors = useMemo(() => getChainStepColors(t), [t]);
    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const cardInteractive = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass, interactive: true }), [t, isGlass]);
    const hoverTransition = useMemo(() => createHoverStyle(t), [t]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const bdr = `${t.surface.borderWidth} ${t.surface.borderStyle}`;

    const containerStyle: React.CSSProperties = useMemo(() => ({
      ...createSurfaceStyle(t, { elevation: 'sm', glass: isGlass }),
      padding: t.spacing[5],
      backgroundColor: t.colors.neutral[50],
      minHeight: '100%',
      ...entrance.animate,
      transition: entrance.transition,
      ...style,
    }), [t, isGlass, entrance, style]);

    const sectionTitleStyle: React.CSSProperties = useMemo(() => ({
      fontSize: t.typography.fontSize.lg,
      fontWeight: ptypo.headingWeight,
      letterSpacing: ptypo.headingLetterSpacing,
      color: t.colors.neutral[900],
      margin: 0,
    }), [t, ptypo]);

    const textareaStyle: React.CSSProperties = useMemo(() => ({
      width: '100%', minHeight: 60, padding: t.spacing[3], borderRadius: t.borderRadius.md,
      border: `${bdr} ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white,
      fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800], fontFamily: 'inherit',
      resize: 'vertical' as const, outline: 'none', boxSizing: 'border-box' as const,
      transition: `all ${t.motion.hover}`,
    }), [t, bdr]);

    const filteredItems = useMemo(() => externalItems.filter((item) => item.type === activeCategory), [externalItems, activeCategory]);
    const selectedItem = useMemo(() => externalItems.find((item) => item.id === selectedApproval), [externalItems, selectedApproval]);

    /* ---- Stats Bar ---- */
    const renderStatsBar = useCallback(() => {
      if (!externalStats) return null;
      const totalPending = Object.values(externalStats.pending ?? {}).reduce((a, b) => a + b, 0);
      const statItems = [
        { label: 'Total Pending', value: totalPending.toString(), icon: <Layers size={16} color={t.colors.primaryScale[600]} />, bg: t.colors.primaryScale[50] },
        { label: 'Oldest Pending', value: `${externalStats.oldestPendingDays ?? 0}d`, icon: <Timer size={16} color={t.colors.warningScale[600]} />, bg: t.colors.warningScale[50] },
        { label: 'Avg Approval Time', value: `${(externalStats.avgApprovalTime ?? 0).toFixed(1)}h`, icon: <TrendingUp size={16} color={t.colors.successScale[600]} />, bg: t.colors.successScale[50] },
      ];

      return (
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: t.spacing[3] }}>
          {statItems.map((item, idx) => {
            const itemEntrance = createEntranceAnimation(t, { index: idx });
            return (
              <Box key={item.label} style={{ ...animStyle(idx), ...cardBase, ...itemEntrance.animate, transition: itemEntrance.transition }}>
                <Stack direction="horizontal" align="center" gap={t.spacing[3]}>
                  <Box style={{ ...createIconContainerStyle(t, { size: 28 }), backgroundColor: item.bg }}>{item.icon}</Box>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                    <Text style={{ ...sectionHeader, marginBottom: 0, display: 'block' }}>{item.label}</Text>
                    <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>{item.value}</Text>
                  </Box>
                </Stack>
              </Box>
            );
          })}
        </Box>
      );
    }, [externalStats, cardBase, sectionHeader, t]);

    /* ---- Category Tabs ---- */
    const renderCategoryTabs = useCallback(() => (
      <Box style={cardBase} role="tablist" aria-label="Approval categories">
        <Stack direction="horizontal" align="center" justify="space-between">
          <Stack direction="horizontal" align="center" gap={t.spacing[1]}>
            {ALL_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              const catColor = categoryColors[cat];
              const count = externalStats?.pending[cat] ?? externalItems.filter((i) => i.type === cat).length;
              return (
                <Box key={cat} role="tab" tabIndex={0} aria-selected={isActive} aria-label={`${CATEGORY_LABELS[cat]} category`}
                  onClick={() => handleCategoryChange(cat)} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => handleCategoryChange(cat))}
                  onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
                  onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
                  style={{ ...hoverTransition, display: 'inline-flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.md, border: isActive ? `${bdr} ${catColor.border}` : `${t.surface.borderWidth} solid transparent`, backgroundColor: isActive ? catColor.bg : 'transparent', color: isActive ? catColor.color : t.colors.neutral[600], fontSize: t.typography.fontSize.sm, fontWeight: isActive ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium, cursor: 'pointer', transition: `all ${t.motion.hover}` }}
                >
                  {CATEGORY_ICONS[cat]}
                  <Text style={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit' }}>{CATEGORY_LABELS[cat]}</Text>
                  {count > 0 && (
                    <Text style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 20, height: 20, borderRadius: t.borderRadius.full, backgroundColor: isActive ? catColor.color : t.colors.neutral[300], color: t.colors.common.white, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, padding: `0 ${t.spacing[1]}px` }}>{count}</Text>
                  )}
                </Box>
              );
            })}
          </Stack>
          <Box role="button" tabIndex={0} aria-label="Toggle history" aria-pressed={showHistory}
            onClick={handleHistoryToggle} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, handleHistoryToggle)}
            style={{ ...hoverTransition, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, border: `${bdr} ${showHistory ? t.colors.primaryScale[300] : t.colors.neutral[200]}`, backgroundColor: showHistory ? t.colors.primaryScale[50] : t.colors.common.white, color: showHistory ? t.colors.primaryScale[700] : t.colors.neutral[600], fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer', transition: `all ${t.motion.hover}` }}
          >
            <History size={14} />
            <Text style={{ fontSize: 'inherit', color: 'inherit' }}>History</Text>
          </Box>
        </Stack>
      </Box>
    ), [activeCategory, showHistory, categoryColors, externalStats, externalItems, cardBase, hoverTransition, t, bdr, handleCategoryChange, handleHistoryToggle, handleKeyAction]);

    /* ---- Approval Cards ---- */
    const renderApprovalCards = useCallback(() => {
      if (filteredItems.length === 0) {
        return (
          <Box style={{ ...cardBase, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: `${t.spacing[8]}px ${t.spacing[4]}px`, textAlign: 'center' as const }}>
            <CheckCircle size={32} color={t.colors.successScale[300]} style={{ marginBottom: t.spacing[3] }} />
            <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[600], marginBottom: t.spacing[1] }}>All clear!</Text>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>No pending approvals in {CATEGORY_LABELS[activeCategory]}</Text>
          </Box>
        );
      }

      return (
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
          {filteredItems.map((item, idx) => {
            const isSelected = selectedApproval === item.id;
            const uColor = urgencyColors[item.urgency];
            const catColor = categoryColors[item.type];
            const itemEntrance = createEntranceAnimation(t, { index: idx });

            return (
              <Box key={item.id} role="button" tabIndex={0} aria-label={`Approval: ${item.entityName}`} aria-selected={isSelected}
                onClick={() => handleApprovalSelect(item.id)} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => handleApprovalSelect(item.id))}
                style={{ ...animStyle(idx), ...createCardStyle(t, { elevation: isSelected ? 'md' : 'sm', glass: isGlass, interactive: true }), borderLeft: `4px solid ${uColor.dot}`, cursor: 'pointer', transition: `all ${t.motion.hover}`, ...(isSelected ? { outline: `${bdr} ${t.colors.primaryScale[400]}` } : {}), ...itemEntrance.animate }}
              >
                <Stack direction="horizontal" align="start" justify="space-between" style={{ marginBottom: t.spacing[2] }}>
                  <Box style={{ flex: 1 }}>
                    <Stack direction="horizontal" align="center" gap={t.spacing[2]} style={{ marginBottom: t.spacing[1] }}>
                      <Text style={{ display: 'inline-flex', alignItems: 'center', padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: t.borderRadius.full, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, backgroundColor: catColor.bg, color: catColor.color, border: `${bdr} ${catColor.border}` }}>{CATEGORY_LABELS[item.type]}</Text>
                      <Box style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: uColor.dot, flexShrink: 0 }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: uColor.color, fontWeight: t.typography.fontWeight.medium, textTransform: 'capitalize' as const }}>{item.urgency}</Text>
                    </Stack>
                    <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], display: 'block', marginBottom: t.spacing[1] }}>{item.entityName}</Text>
                    <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600], lineHeight: t.typography.lineHeight.relaxed }}>{item.summary}</Text>
                  </Box>
                  <Box style={{ textAlign: 'right' as const, flexShrink: 0, marginLeft: t.spacing[4] }}>
                    <Box style={{ width: 44, height: 44, borderRadius: t.borderRadius.full, background: `conic-gradient(${t.colors.primaryScale[500]} ${item.approvalChainProgress * 3.6}deg, ${t.colors.neutral[100]} 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' }} role="img" aria-label={`${item.approvalChainProgress}% approved`}>
                      <Box style={{ width: 34, height: 34, borderRadius: t.borderRadius.full, backgroundColor: t.colors.common.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.primaryScale[700] }}>
                        <Text style={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit' }}>{item.approvalChainProgress}%</Text>
                      </Box>
                    </Box>
                  </Box>
                </Stack>
                <Stack direction="horizontal" align="center" justify="space-between">
                  <Stack direction="horizontal" align="center" gap={t.spacing[2]}>
                    {item.requesterAvatar ? (
                      <img src={item.requesterAvatar} alt={item.requesterName} style={{ width: 24, height: 24, borderRadius: t.borderRadius.full, objectFit: 'cover' as const }} />
                    ) : (
                      <Box style={{ width: 24, height: 24, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[200], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={12} color={t.colors.neutral[500]} />
                      </Box>
                    )}
                    <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>{item.requesterName}</Text>
                  </Stack>
                  <Stack direction="horizontal" align="center" gap={t.spacing[1]}>
                    <Clock size={12} color={t.colors.neutral[400]} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{formatDaysAgo(item.submittedDate)}</Text>
                  </Stack>
                </Stack>
              </Box>
            );
          })}
        </Box>
      );
    }, [filteredItems, selectedApproval, activeCategory, urgencyColors, categoryColors, isGlass, t, bdr, handleApprovalSelect, handleKeyAction]);

    /* ---- Detail Panel ---- */
    const renderDetailPanel = useCallback(() => {
      if (!selectedItem) return null;
      const uColor = urgencyColors[selectedItem.urgency];

      return (
        <Box style={cardBase}>
          <Stack direction="horizontal" align="center" justify="space-between" style={{ marginBottom: t.spacing[4] }}>
            <Box>
              <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: ptypo.headingWeight, letterSpacing: ptypo.headingLetterSpacing, color: t.colors.neutral[900], display: 'block' }}>{selectedItem.entityName}</Text>
              <Stack direction="horizontal" align="center" gap={t.spacing[2]} style={{ marginTop: t.spacing[1] }}>
                <Text style={createBadgeStyle(t, 'primary')}>{CATEGORY_LABELS[selectedItem.type]}</Text>
                <Stack direction="horizontal" align="center" gap={t.spacing[1]}>
                  <Box style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: uColor.dot }} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: uColor.color, fontWeight: t.typography.fontWeight.medium, textTransform: 'capitalize' as const }}>{selectedItem.urgency} urgency</Text>
                </Stack>
              </Stack>
            </Box>
            <Box role="button" tabIndex={0} aria-label="Close detail panel" onClick={() => handleApprovalSelect(null)} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => handleApprovalSelect(null))} style={{ ...hoverTransition, padding: t.spacing[1], border: 'none', backgroundColor: 'transparent', color: t.colors.neutral[400], cursor: 'pointer', transition: `all ${t.motion.hover}`, display: 'flex', alignItems: 'center' }}>
              <X size={18} />
            </Box>
          </Stack>

          {externalDetail && (
            <>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], ...createSurfaceStyle(t, { elevation: 'sm', glass: isGlass }), padding: t.spacing[4], backgroundColor: t.colors.common.white, marginBottom: t.spacing[4] }}>
                <Text style={{ ...sectionHeader, display: 'block', marginBottom: t.spacing[2] }}>Context</Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], lineHeight: t.typography.lineHeight.relaxed }}>{externalDetail.context}</Text>
              </Box>

              {externalDetail.requesterNotes && (
                <Box style={{ ...createSurfaceStyle(t, { elevation: 'sm', glass: isGlass }), padding: t.spacing[4], backgroundColor: t.colors.infoScale[50], borderLeft: `3px solid ${t.colors.infoScale[400]}`, marginBottom: t.spacing[4] }}>
                  <Stack direction="horizontal" align="center" gap={t.spacing[1]} style={{ marginBottom: t.spacing[2] }}>
                    <MessageSquare size={14} color={t.colors.infoScale[600]} />
                    <Text style={{ ...sectionHeader, marginBottom: 0 }}>Requester Notes</Text>
                  </Stack>
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], lineHeight: t.typography.lineHeight.relaxed, fontStyle: 'italic' as const }}>{externalDetail.requesterNotes}</Text>
                </Box>
              )}

              {(externalDetail.relatedData ?? []).length > 0 && (
                <Box style={{ marginBottom: t.spacing[4] }}>
                  <Text style={{ ...sectionHeader, display: 'block', marginBottom: t.spacing[2] }}>Related Data</Text>
                  <Box style={{ borderRadius: t.borderRadius.md, overflow: 'hidden', border: `${bdr} ${t.colors.neutral[200]}` }}>
                    {(externalDetail.relatedData ?? []).map((data, idx) => (
                      <Box key={idx} style={{ ...animStyle(idx), display: 'grid', gridTemplateColumns: '160px 1fr', borderBottom: idx < (externalDetail.relatedData ?? []).length - 1 ? `${bdr} ${t.colors.neutral[100]}` : 'none' }}>
                        <Box style={{ padding: `${t.spacing[2]}px ${t.spacing[3]}px`, backgroundColor: t.colors.neutral[50], fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[600], borderRight: `${bdr} ${t.colors.neutral[200]}` }}>
                          <Text style={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit' }}>{data.label}</Text>
                        </Box>
                        <Box style={{ padding: `${t.spacing[2]}px ${t.spacing[3]}px`, fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800] }}>
                          <Text style={{ fontSize: 'inherit', color: 'inherit' }}>{data.value}</Text>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {(externalDetail.chainSteps ?? []).length > 0 && (
                <Box style={{ marginBottom: t.spacing[5] }}>
                  <Text style={{ ...sectionHeader, display: 'block', marginBottom: t.spacing[3] }}>Approval Chain</Text>
                  <Stack direction="horizontal" align="center" gap={0} style={{ overflowX: 'auto' as const }}>
                    {(externalDetail.chainSteps ?? []).map((step, idx) => {
                      const stepColor = chainStepColors[step.status ?? 'pending'];
                      return (
                        <React.Fragment key={idx}>
                          {idx > 0 && (
                            <Box style={{ ...animStyle(idx), width: 32, height: 2, backgroundColor: step.status === 'approved' || (externalDetail.chainSteps ?? [])[idx - 1]?.status === 'approved' ? t.colors.successScale[300] : t.colors.neutral[200], flexShrink: 0 }} />
                          )}
                          <Box style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: t.spacing[1], flexShrink: 0 }}>
                            <Box style={{ width: 36, height: 36, borderRadius: t.borderRadius.full, backgroundColor: stepColor.bg, border: `${bdr} ${stepColor.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stepColor.color }}>
                              {step.status === 'approved' ? <Check size={16} /> : step.status === 'rejected' ? <X size={16} /> : <Clock size={16} />}
                            </Box>
                            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: stepColor.color, textAlign: 'center' as const, maxWidth: 80 }}>{step.role}</Text>
                            {step.name && <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textAlign: 'center' as const, maxWidth: 80 }}>{step.name}</Text>}
                          </Box>
                        </React.Fragment>
                      );
                    })}
                  </Stack>
                </Box>
              )}
            </>
          )}

          {/* Action Buttons */}
          <Box style={{ borderTop: `${bdr} ${t.colors.neutral[200]}`, paddingTop: t.spacing[4] }}>
            <Box style={{ marginBottom: t.spacing[4] }}>
              <Text style={{ ...sectionHeader, display: 'block', marginBottom: t.spacing[2] }}>Approve</Text>
              <textarea aria-label="Approval notes" value={approvalNotes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleNotesChange(e.target.value)} placeholder="Add optional notes..." style={textareaStyle} />
              <Box role="button" tabIndex={0} aria-label="Approve this item" onClick={() => handleApprove(selectedItem.id)} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => handleApprove(selectedItem.id))} style={{ ...hoverTransition, display: 'inline-flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.md, border: 'none', backgroundColor: t.colors.successScale[600], color: t.colors.common.white, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, cursor: 'pointer', transition: `all ${t.motion.hover}`, marginTop: t.spacing[2] }}>
                <CheckCircle size={16} /> <Text style={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit' }}>Approve</Text>
              </Box>
            </Box>

            <Box style={{ marginBottom: t.spacing[4] }}>
              <Text style={{ ...sectionHeader, display: 'block', marginBottom: t.spacing[2] }}>Reject</Text>
              <textarea aria-label="Rejection reason" value={rejectReason} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleRejectReasonChange(e.target.value)} placeholder="Reason for rejection (required)..." style={{ ...textareaStyle, border: `${bdr} ${rejectReason.trim() ? t.colors.neutral[200] : t.colors.errorScale[200]}` }} />
              <Box role="button" tabIndex={0} aria-label="Reject this item" aria-disabled={!rejectReason.trim()} onClick={() => handleReject(selectedItem.id)} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => handleReject(selectedItem.id))} style={{ ...hoverTransition, display: 'inline-flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.md, border: 'none', backgroundColor: rejectReason.trim() ? t.colors.errorScale[600] : t.colors.neutral[200], color: rejectReason.trim() ? t.colors.common.white : t.colors.neutral[400], fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, cursor: rejectReason.trim() ? 'pointer' : 'not-allowed', marginTop: t.spacing[2] }}>
                <XCircle size={16} /> <Text style={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit' }}>Reject</Text>
              </Box>
            </Box>

            {onDelegate && (
              <Box>
                <Text style={{ ...sectionHeader, display: 'block', marginBottom: t.spacing[2] }}>Delegate</Text>
                <Box role="button" tabIndex={0} aria-label="Delegate this approval" onClick={() => onDelegate(selectedItem.id, '')} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => onDelegate(selectedItem.id, ''))} style={{ ...hoverTransition, display: 'inline-flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.md, border: `${bdr} ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, color: t.colors.neutral[700], fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
                  <UserPlus size={16} /> <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Delegate to...</Text>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      );
    }, [selectedItem, externalDetail, approvalNotes, rejectReason, urgencyColors, chainStepColors, cardBase, sectionHeader, hoverTransition, textareaStyle, t, bdr, ptypo, isGlass, handleApprovalSelect, handleNotesChange, handleRejectReasonChange, handleApprove, handleReject, handleKeyAction, onDelegate]);

    /* ---- History Panel ---- */
    const renderHistory = useCallback(() => {
      if (!showHistory) return null;

      return (
        <Box style={cardBase}>
          <Stack direction="horizontal" align="center" justify="space-between" style={{ marginBottom: t.spacing[4] }}>
            <Stack direction="horizontal" align="center" gap={t.spacing[2]}>
              <History size={18} color={t.colors.neutral[600]} />
              <Text style={sectionTitleStyle}>Recent Decisions</Text>
            </Stack>
            <Box role="button" tabIndex={0} aria-label="Close history" onClick={handleHistoryToggle} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, handleHistoryToggle)} style={{ ...hoverTransition, padding: t.spacing[1], border: 'none', backgroundColor: 'transparent', color: t.colors.neutral[400], cursor: 'pointer', transition: `all ${t.motion.hover}`, display: 'flex', alignItems: 'center' }}>
              <X size={18} />
            </Box>
          </Stack>

          {externalHistory.length === 0 ? (
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400], textAlign: 'center' as const, padding: t.spacing[4] }}>No recent decisions</Text>
          ) : (
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3], position: 'relative' as const }}>
              <Box style={{ position: 'absolute' as const, left: 15, top: 8, bottom: 8, width: 2, backgroundColor: t.colors.neutral[200] }} />
              {externalHistory.map((h, i) => {
                const oColor = outcomeColors[h.outcome];
                const catColor = categoryColors[h.type];
                return (
                  <Box key={h.id} style={{ ...animStyle(i), display: 'flex', gap: t.spacing[3], position: 'relative' as const }}>
                    <Box style={{ width: 32, flexShrink: 0, display: 'flex', justifyContent: 'center', paddingTop: t.spacing[2], zIndex: 1 }}>
                      <Box style={{ width: 12, height: 12, borderRadius: t.borderRadius.full, backgroundColor: h.outcome === 'approved' ? t.colors.successScale[500] : t.colors.errorScale[500], border: `${bdr} ${t.colors.common.white}` }} />
                    </Box>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], ...createSurfaceStyle(t, { elevation: 'sm', glass: isGlass }), padding: t.spacing[3], backgroundColor: t.colors.common.white, flex: 1 }}>
                      <Stack direction="horizontal" align="center" justify="space-between" style={{ marginBottom: t.spacing[1] }}>
                        <Stack direction="horizontal" align="center" gap={t.spacing[2]}>
                          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>{h.entityName}</Text>
                          <Text style={{ display: 'inline-flex', alignItems: 'center', padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: t.borderRadius.full, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, backgroundColor: oColor.bg, color: oColor.color, border: `${bdr} ${oColor.border}` }}>
                            {h.outcome === 'approved' ? <CheckCircle size={10} style={{ marginRight: 4 }} /> : <XCircle size={10} style={{ marginRight: 4 }} />}
                            {h.outcome}
                          </Text>
                        </Stack>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{formatDaysAgo(h.decidedAt)}</Text>
                      </Stack>
                      <Stack direction="horizontal" align="center" gap={t.spacing[3]}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>by {h.decidedBy}</Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{h.timing}h turnaround</Text>
                        <Text style={{ display: 'inline-flex', alignItems: 'center', padding: `0 ${t.spacing[1]}px`, borderRadius: t.borderRadius.sm, fontSize: t.typography.fontSize.xs, backgroundColor: catColor.bg, color: catColor.color }}>{CATEGORY_LABELS[h.type]}</Text>
                      </Stack>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      );
    }, [showHistory, externalHistory, outcomeColors, categoryColors, cardBase, sectionTitleStyle, hoverTransition, t, bdr, isGlass, handleHistoryToggle, handleKeyAction]);

    /* ---- Main Layout ---- */
    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    return (
      <Box className={className} style={containerStyle}>
        {accentBar && <Box style={accentBar} />}
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5], maxWidth: 1400, margin: '0 auto' }}>
          {renderStatsBar()}
          {renderCategoryTabs()}
          <Box style={{ display: 'grid', gridTemplateColumns: selectedItem ? 'minmax(0, 1fr) minmax(0, 1fr)' : '1fr', gap: t.spacing[5] }}>
            {renderApprovalCards()}
            {renderDetailPanel()}
          </Box>
          {renderHistory()}
        </Box>
      </Box>
    );
  },
});
