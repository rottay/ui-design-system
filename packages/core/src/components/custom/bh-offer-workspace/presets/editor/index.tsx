'use client';

/**
 * BhOfferWorkspace - Editor Preset
 * Full offer management workspace: compensation editing, benefits, approvals,
 * negotiation history, document management, and status pipeline tracker
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle, createCardStyle, createHoverStyle, createSurfaceStyle,
  createEntranceAnimation, createStaggerDelay, createCardHoverStyles,
  createPersonalitySectionHeaderStyle, createIconContainerStyle,
  createDividerStyle, getPersonalityTypography, getPersonalityBadgeRadius,
  getCardPadding,
} from '../../../helpers';
import type {
  BhOfferWorkspaceProps, ApprovalStep,
} from '../../core';
import { getOfferStatusConfig, getOfferPipelineSteps, formatCurrency, getOfferCompensation } from '../../core';
import {
  DollarSign, Gift, Truck, Briefcase, Shield, Clock,
  Check, X, ChevronRight, Edit3, Save, Send, FileText,
  Upload, PenTool, Eye, ArrowLeftRight, History,
  AlertCircle, User, MapPin, Calendar, TrendingUp, Award,
  BarChart3, ToggleLeft, ToggleRight,
} from 'lucide-react';

export const EditorBhOfferWorkspace = createPreset<BhOfferWorkspaceProps>({
  name: 'BhOfferWorkspace.Editor',
  render: ({ primitives, props, tokens }: PresetContext<BhOfferWorkspaceProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;
    const sp = t.spacing;
    const ty = t.typography;
    const c = t.colors;
    const n = c.neutral;
    const p = c.primaryScale;

    const {
      offer,
      candidateName: candidateNameProp, jobTitle: jobTitleProp, status: statusProp,
      benefits = [],
      approvalSteps = [], negotiationHistory = [], documents = [],
      onSave, onSubmitApproval, onSendOffer, isEditing, onEditToggle,
      currentVersion: currentVersionProp, showNegotiationHistory, onHistoryToggle,
      showComparison, onComparisonToggle, signatureStatus, className, style,
    } = props;

    const candidateName = candidateNameProp ?? '';
    const jobTitle = jobTitleProp ?? offer?.jobTitleOffered ?? '';
    const status = statusProp ?? offer?.status ?? 'draft';
    const compensation = getOfferCompensation(offer);

    const relocationOffered = offer?.relocationOffered ?? false;
    const relocationAmount = offer?.relocationAmount ?? 0;
    const relocationCurrency = offer?.relocationCurrency ?? compensation.currency;
    const probationDays = offer?.probationPeriodDays ?? 90;
    const startDate = offer?.proposedStartDate ? new Date(offer.proposedStartDate).toLocaleDateString() : '';
    const workLocation = offer?.workLocation ?? '';
    const remoteType = offer?.remoteType ?? '';

    const [offerData, setOfferData] = useState(compensation);
    const [localCurrentVersion] = useState(currentVersionProp ?? offer?.version ?? 1);
    const [approvalStatus] = useState(approvalSteps);
    const [localShowHistory, setLocalShowHistory] = useState(showNegotiationHistory);
    const [activeSection, setActiveSection] = useState<string>('compensation');
    const [localDocuments] = useState(documents);
    const [localIsEditing, setLocalIsEditing] = useState(isEditing);
    const [localShowComparison, setLocalShowComparison] = useState(showComparison);
    const [localSignatureStatus] = useState(signatureStatus);

    const isGlass = t.surface.useGlass && !!t.glass;
    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const surfMd = useMemo(() => createSurfaceStyle(t, { elevation: 'md', glass: isGlass }), [t, isGlass]);
    const hov = useMemo(() => createHoverStyle(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const typo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const cardPadding = useMemo(() => getCardPadding(t), [t]);
    const sectionHeaderStyle = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
    const statusCfg = getOfferStatusConfig(status);

    const secTitle: React.CSSProperties = useMemo(() => ({
      fontSize: ty.fontSize.lg,
      fontWeight: typo.headingWeight,
      letterSpacing: typo.headingLetterSpacing,
      color: n[900],
      display: 'flex', alignItems: 'center', gap: sp[2],
    }), [ty, typo, n, sp]);

    const lbl: React.CSSProperties = useMemo(() => ({
      fontSize: ty.fontSize.sm, fontWeight: ty.fontWeight.medium,
      color: n[600], marginBottom: sp[1],
      textTransform: typo.labelTransform,
      letterSpacing: typo.labelLetterSpacing,
    }), [ty, n, sp, typo]);

    const inp: React.CSSProperties = useMemo(() => ({
      width: '100%', padding: `${sp[2]}px ${sp[3]}px`, borderRadius: t.borderRadius.md,
      border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${n[200]}`,
      fontSize: ty.fontSize.sm, color: n[900],
      backgroundColor: c.common.white, outline: 'none',
      transition: `border-color ${t.motion.hover}`,
      boxSizing: 'border-box' as const,
    }), [sp, t, n, ty, c]);

    const btnPri: React.CSSProperties = useMemo(() => ({
      ...hov, padding: `${sp[2]}px ${sp[4]}px`, borderRadius: t.borderRadius.md,
      backgroundColor: p[600], color: c.common.white,
      fontSize: ty.fontSize.sm, fontWeight: ty.fontWeight.semibold, fontFamily: 'inherit',
      display: 'inline-flex', alignItems: 'center', gap: sp[2], outline: 'none',
    }), [hov, sp, t, p, c, ty]);

    const btnSec: React.CSSProperties = useMemo(() => ({
      ...hov, padding: `${sp[2]}px ${sp[4]}px`, borderRadius: t.borderRadius.md,
      backgroundColor: c.common.white, color: n[700],
      border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${n[200]}`,
      fontSize: ty.fontSize.sm, fontWeight: ty.fontWeight.medium, fontFamily: 'inherit',
      display: 'inline-flex', alignItems: 'center', gap: sp[2], outline: 'none',
    }), [hov, sp, t, c, n, ty]);

    const navItem = useCallback((active: boolean): React.CSSProperties => ({
      ...hov, padding: `${sp[2]}px ${sp[3]}px`, borderRadius: t.borderRadius.md,
      backgroundColor: active ? p[50] : 'transparent',
      color: active ? p[700] : n[600],
      fontWeight: active ? ty.fontWeight.semibold : ty.fontWeight.medium,
      fontSize: ty.fontSize.sm,
      display: 'flex', alignItems: 'center', gap: sp[2],
      textAlign: 'left' as const, width: '100%', outline: 'none',
    }), [hov, sp, t, p, n, ty]);

    type CompFields = ReturnType<typeof getOfferCompensation>;
    const handleCompChange = useCallback((field: keyof CompFields, value: number | string) => {
      setOfferData((prev) => ({ ...prev, [field]: value }));
    }, []);
    const toggleEditing = useCallback(() => { setLocalIsEditing(!localIsEditing); onEditToggle?.(); }, [localIsEditing, onEditToggle]);
    const toggleHistory = useCallback(() => { setLocalShowHistory(!localShowHistory); onHistoryToggle?.(); }, [localShowHistory, onHistoryToggle]);
    const toggleComparison = useCallback(() => { setLocalShowComparison(!localShowComparison); onComparisonToggle?.(); }, [localShowComparison, onComparisonToggle]);

    /* Field helper: editable number or display */
    const Field = useCallback(({ label, field, value, suffix, fmt }: {
      label: string; field?: keyof CompFields; value: number | string;
      suffix?: string; fmt?: (v: number) => string;
    }) => (
      <Box style={{ ...card, display: 'flex', flexDirection: 'column' as const, gap: sp[1] }}>
        <Text style={lbl}>{label}</Text>
        {localIsEditing && field ? (
          <Box style={{ display: 'flex', alignItems: 'center', gap: sp[2] }}>
            <input
              type={typeof value === 'number' ? 'number' : 'text'}
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCompChange(field, typeof value === 'number' ? Number(e.target.value) : e.target.value)}
              style={{ ...inp, flex: 1 }}
            />
            {suffix && <Text style={{ fontSize: ty.fontSize.sm, color: n[500] }}>{suffix}</Text>}
          </Box>
        ) : (
          <Text style={{
            fontSize: ty.fontSize.xl,
            fontWeight: typo.headingWeight,
            letterSpacing: typo.headingLetterSpacing,
            color: n[900],
          }}>
            {fmt ? fmt(value as number) : value}{suffix && !fmt ? suffix : ''}
          </Text>
        )}
      </Box>
    ), [card, lbl, localIsEditing, sp, inp, ty, n, typo, handleCompChange, Box, Text]);

    const fmtC = useCallback((v: number) => formatCurrency(v, offerData.currency), [offerData.currency]);

    /* Sections */
    const sections = useMemo(() => [
      { key: 'compensation', label: 'Compensation', Icon: DollarSign },
      { key: 'benefits', label: 'Benefits', Icon: Gift },
      { key: 'relocation', label: 'Relocation', Icon: Truck },
      { key: 'terms', label: 'Terms', Icon: Briefcase },
      { key: 'approval', label: 'Approval Chain', Icon: Shield },
      { key: 'documents', label: 'Documents', Icon: FileText },
      { key: 'pipeline', label: 'Status Pipeline', Icon: BarChart3 },
    ], []);

    const renderCompensation = () => {
      const marketMin = 0;
      const marketMax = offerData.baseSalary > 0 ? Math.round(offerData.baseSalary * 1.3) : 100000;
      const pct = marketMax > marketMin
        ? Math.max(0, Math.min(100, ((offerData.baseSalary - marketMin) / (marketMax - marketMin)) * 100))
        : 50;

      return (
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[5] }}>
          <Box style={{ ...secTitle }}>
            <DollarSign size={20} color={p[600]} />
            <Text style={secTitle}>Compensation Package</Text>
          </Box>

          {/* Base Salary */}
          <Box style={card}>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[1], marginBottom: sp[3] }}>
              <Text style={lbl}>Base Salary ({offerData.currency})</Text>
              {localIsEditing ? (
                <input
                  type="number"
                  value={offerData.baseSalary}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCompChange('baseSalary', Number(e.target.value))}
                  style={inp}
                />
              ) : (
                <Text style={{
                  fontSize: ty.fontSize['2xl'],
                  fontWeight: typo.headingWeight,
                  letterSpacing: typo.headingLetterSpacing,
                  color: n[900],
                }}>
                  {fmtC(offerData.baseSalary)}
                </Text>
              )}
            </Box>
            <Box style={{ marginTop: sp[3] }}>
              <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: sp[1] }}>
                <Text style={{ fontSize: ty.fontSize.xs, color: n[500] }}>Min: {fmtC(marketMin)}</Text>
                <Text style={{ fontSize: ty.fontSize.xs, color: n[500] }}>Max: {fmtC(marketMax)}</Text>
              </Box>
              <svg width="100%" height="32" viewBox="0 0 400 32" preserveAspectRatio="none" style={{ display: 'block' }}>
                <rect x="0" y="10" width="400" height="12" rx="6" fill={n[200]} />
                <rect x="0" y="10" width={pct * 4} height="12" rx="6" fill={p[400]} />
                <circle cx={pct * 4} cy="16" r="8" fill={p[600]} stroke={c.common.white} strokeWidth="3" />
                <text x={pct * 4} y="6" textAnchor="middle" fill={p[700]} fontSize="10" fontWeight={ty.fontWeight.semibold}>
                  {fmtC(offerData.baseSalary)}
                </text>
              </svg>
            </Box>
          </Box>

          {/* Bonus row */}
          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: sp[4] }}>
            <Field label="Signing Bonus" field="signingBonus" value={offerData.signingBonus} fmt={fmtC} />
            <Field label="Annual Bonus Target" field="annualBonusPercent" value={offerData.annualBonusPercent} suffix="%" />
          </Box>

          {/* Commission */}
          {offerData.commissionStructure !== undefined && (
            <Field label="Commission Structure" field="commissionStructure"
              value={offerData.commissionStructure ?? 'Not configured'} />
          )}

          {/* Equity */}
          {(offerData.equityShares !== undefined || localIsEditing) && (
            <Box style={card}>
              <Box style={{ ...secTitle, fontSize: ty.fontSize.md, marginBottom: sp[3] }}>
                <Award size={18} color={p[600]} />
                <Text style={{ ...secTitle, fontSize: ty.fontSize.md }}>Equity Package</Text>
              </Box>
              <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: sp[4] }}>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[1] }}>
                  <Text style={lbl}>Shares</Text>
                  {localIsEditing ? (
                    <input
                      type="number"
                      value={offerData.equityShares ?? 0}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCompChange('equityShares', Number(e.target.value))}
                      style={inp}
                    />
                  ) : (
                    <Text style={{
                      fontSize: ty.fontSize.lg,
                      fontWeight: typo.headingWeight,
                      color: n[900],
                    }}>
                      {(offerData.equityShares ?? 0).toLocaleString()} shares
                    </Text>
                  )}
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[1] }}>
                  <Text style={lbl}>Vesting (months)</Text>
                  {localIsEditing ? (
                    <input
                      type="number"
                      value={offerData.vestingMonths ?? 48}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCompChange('vestingMonths', Number(e.target.value))}
                      style={inp}
                    />
                  ) : (
                    <Text style={{
                      fontSize: ty.fontSize.lg,
                      fontWeight: typo.headingWeight,
                      color: n[900],
                    }}>
                      {Math.round((offerData.vestingMonths ?? 48) / 12)} years
                    </Text>
                  )}
                </Box>
              </Box>
              {!localIsEditing && (offerData.equityShares ?? 0) > 0 && (() => {
                const yrs = Math.max(1, Math.round((offerData.vestingMonths ?? 48) / 12));
                const sharesPer = Math.floor((offerData.equityShares ?? 0) / yrs);
                return (
                  <Box style={{ marginTop: sp[4] }}>
                    <Text style={{
                      fontSize: ty.fontSize.xs, color: n[500], marginBottom: sp[2],
                      textTransform: typo.labelTransform,
                      letterSpacing: typo.labelLetterSpacing,
                    }}>
                      Vesting Schedule (1-year cliff)
                    </Text>
                    <svg width="100%" height="60" viewBox="0 0 400 60" preserveAspectRatio="none" style={{ display: 'block' }}>
                      <line x1="20" y1="30" x2="380" y2="30" stroke={n[200]} strokeWidth="3" strokeLinecap="round" />
                      {Array.from({ length: yrs }, (_, i) => {
                        const xPos = 20 + ((i + 1) / yrs) * 360;
                        const isCliff = i === 0;
                        return (
                          <g key={i}>
                            <line x1={20 + (i / yrs) * 360} y1="30" x2={xPos} y2="30" stroke={p[400]} strokeWidth="3" strokeLinecap="round" />
                            <circle cx={xPos} cy="30" r={isCliff ? 7 : 5} fill={p[isCliff ? 600 : 400]} stroke={c.common.white} strokeWidth="2" />
                            <text x={xPos} y="52" textAnchor="middle" fill={n[600]} fontSize="9">Y{i + 1}{isCliff ? ' (cliff)' : ''}</text>
                            <text x={xPos} y="16" textAnchor="middle" fill={p[700]} fontSize="9" fontWeight={ty.fontWeight.semibold}>{sharesPer.toLocaleString()}</text>
                          </g>
                        );
                      })}
                      <circle cx="20" cy="30" r="4" fill={n[400]} />
                    </svg>
                  </Box>
                );
              })()}
            </Box>
          )}
        </Box>
      );
    };

    const renderBenefits = () => (
      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[4] }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: sp[2] }}>
          <Gift size={20} color={p[600]} />
          <Text style={secTitle}>Benefits Package</Text>
        </Box>
        {benefits.map((cat, ci) => (
          <Box key={ci} style={card}>
            <Text style={{
              fontSize: ty.fontSize.md,
              fontWeight: typo.headingWeight,
              color: n[800],
              marginBottom: sp[3],
              textTransform: 'capitalize' as const,
            }}>
              {cat.category}
            </Text>
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: sp[2] }}>
              {cat.items.map((item, ii) => (
                <Box key={ii} style={{
                  ...hov,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: `${sp[3]}px`, borderRadius: t.borderRadius.md,
                  backgroundColor: item.included ? c.successScale[50] : n[50],
                  border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${item.included ? c.successScale[200] : n[200]}`,
                }}>
                  <Text style={{
                    fontSize: ty.fontSize.sm,
                    color: item.included ? c.successScale[800] : n[500],
                    fontWeight: ty.fontWeight.medium,
                  }}>
                    {item.name}
                  </Text>
                  {localIsEditing ? (
                    <Box
                      role="button"
                      tabIndex={0}
                      aria-label={`Toggle ${item.name}`}
                      style={{ display: 'flex', alignItems: 'center', outline: 'none', cursor: 'pointer' }}
                    >
                      {item.included ? <ToggleRight size={22} color={c.successScale[500]} /> : <ToggleLeft size={22} color={n[400]} />}
                    </Box>
                  ) : item.included ? <Check size={16} color={c.successScale[600]} /> : <X size={16} color={n[400]} />}
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    );

    const renderRelocation = () => {
      if (!relocationOffered && !localIsEditing) {
        return (
          <Box style={card}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: sp[2] }}>
              <Truck size={20} color={p[600]} />
              <Text style={secTitle}>Relocation Package</Text>
            </Box>
            <Text style={{ fontSize: ty.fontSize.sm, color: n[500], marginTop: sp[3] }}>No relocation package included in this offer.</Text>
          </Box>
        );
      }
      return (
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[4] }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: sp[2] }}>
            <Truck size={20} color={p[600]} />
            <Text style={secTitle}>Relocation Package</Text>
          </Box>
          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: sp[4] }}>
            <Field label="Relocation Amount" value={relocationAmount} fmt={(v) => formatCurrency(v, relocationCurrency)} />
            <Field label="Type" value={offer?.relocationType ?? 'N/A'} />
          </Box>
          {offer?.relocationDetails && (
            <Box style={card}>
              <Text style={{ fontSize: ty.fontSize.sm, color: n[700] }}>{offer.relocationDetails}</Text>
            </Box>
          )}
        </Box>
      );
    };

    const renderTerms = () => {
      const arrColors: Record<string, 'primary' | 'success' | 'warning'> = { onsite: 'primary', remote: 'success', hybrid: 'warning' };
      const termFields = [
        { label: 'Start Date', Icon: Calendar, iconColor: c.infoScale[500], value: startDate, type: 'date' },
        { label: 'Probation Period', Icon: Clock, iconColor: c.warningScale[500], value: probationDays ? `${probationDays} days` : '', type: 'text' },
        { label: 'Employment Type', Icon: AlertCircle, iconColor: c.errorScale[500], value: offer?.employmentType ?? '', type: 'text' },
      ];
      return (
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[4] }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: sp[2] }}>
            <Briefcase size={20} color={p[600]} />
            <Text style={secTitle}>Employment Terms</Text>
          </Box>
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: sp[4] }}>
            {termFields.map((tf) => (
              <Box key={tf.label} style={card}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: sp[2], marginBottom: sp[2] }}>
                  <tf.Icon size={16} color={tf.iconColor} />
                  <Text style={{ ...lbl, marginBottom: 0 }}>{tf.label}</Text>
                </Box>
                {localIsEditing ? (
                  <input
                    type={tf.type}
                    value={tf.value}
                    readOnly={!localIsEditing}
                    style={inp}
                  />
                ) : (
                  <Text style={{
                    fontSize: ty.fontSize.md,
                    fontWeight: typo.headingWeight,
                    color: n[900],
                  }}>
                    {tf.value}
                  </Text>
                )}
              </Box>
            ))}
            <Box style={card}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: sp[2], marginBottom: sp[2] }}>
                <MapPin size={16} color={p[500]} />
                <Text style={{ ...lbl, marginBottom: 0 }}>Work Arrangement</Text>
              </Box>
              {localIsEditing ? (
                <Box style={{ display: 'flex', gap: sp[2] }}>
                  {(['onsite', 'remote', 'hybrid'] as const).map((arr) => (
                    <Box
                      key={arr}
                      role="button"
                      tabIndex={0}
                      aria-label={`Select ${arr} arrangement`}
                      aria-pressed={remoteType === arr}
                      style={{
                        ...hov, flex: 1, padding: `${sp[2]}px`, borderRadius: t.borderRadius.md,
                        border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${remoteType === arr ? p[300] : n[200]}`,
                        backgroundColor: remoteType === arr ? p[50] : c.common.white,
                        color: remoteType === arr ? p[700] : n[600],
                        fontSize: ty.fontSize.xs, fontWeight: ty.fontWeight.medium,
                        textTransform: 'capitalize' as const, textAlign: 'center' as const,
                        outline: 'none',
                      }}
                    >
                      <Text style={{
                        fontSize: ty.fontSize.xs,
                        fontWeight: ty.fontWeight.medium,
                        color: remoteType === arr ? p[700] : n[600],
                        textTransform: 'capitalize' as const,
                      }}>
                        {arr}
                      </Text>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box style={createBadgeStyle(t, arrColors[remoteType] ?? 'primary')}>
                  <Text style={{ fontSize: ty.fontSize.xs, color: 'inherit' }}>{remoteType || workLocation || 'TBD'}</Text>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      );
    };

    const renderApproval = () => {
      const stepCfg = (s: ApprovalStep) => s.status === 'approved' ? { scale: c.successScale, Icon: Check, badge: 'success' as const }
        : s.status === 'rejected' ? { scale: c.errorScale, Icon: X, badge: 'error' as const }
        : { scale: c.warningScale, Icon: Clock, badge: 'warning' as const };

      return (
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[4] }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: sp[2] }}>
            <Shield size={20} color={p[600]} />
            <Text style={secTitle}>Approval Workflow</Text>
          </Box>
          <Box style={card}>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[1] }}>
              {approvalStatus.map((step, idx) => {
                const cfg = stepCfg(step);
                return (
                  <Box key={idx}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: sp[3], padding: `${sp[3]}px 0` }}>
                      <Box style={{
                        ...createIconContainerStyle(t, { size: 36, color: cfg.scale[500] }),
                        backgroundColor: cfg.scale[500],
                      }}>
                        <cfg.Icon size={14} color={c.common.white} />
                      </Box>
                      {step.approverAvatar ? (
                        <Box style={{
                          width: 32, height: 32, borderRadius: t.borderRadius.full,
                          backgroundImage: `url(${step.approverAvatar})`,
                          backgroundSize: 'cover', backgroundPosition: 'center',
                          border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${cfg.scale[200]}`,
                          flexShrink: 0,
                        }} />
                      ) : (
                        <Box style={createIconContainerStyle(t, { size: 32, color: cfg.scale[100] })}>
                          <Text style={{ fontSize: ty.fontSize.xs, fontWeight: ty.fontWeight.semibold, color: cfg.scale[700] }}>{(step.approverName || '?').charAt(0).toUpperCase()}</Text>
                        </Box>
                      )}
                      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1 }}>
                        <Text style={{ fontSize: ty.fontSize.sm, fontWeight: ty.fontWeight.semibold, color: n[900] }}>{step.approverName}</Text>
                        <Text style={{ fontSize: ty.fontSize.xs, color: n[500] }}>{step.role}</Text>
                      </Box>
                      <Box style={createBadgeStyle(t, cfg.badge)}>
                        <Text style={{ fontSize: ty.fontSize.xs, color: 'inherit' }}>
                          {step.status === 'approved' ? 'Approved' : step.status === 'rejected' ? 'Rejected' : 'Pending'}
                          {step.date ? ` - ${step.date}` : ''}
                        </Text>
                      </Box>
                    </Box>
                    {idx < approvalStatus.length - 1 && (
                      <Box style={{
                        marginLeft: 18, width: 2, height: 20,
                        backgroundColor: approvalStatus[idx + 1].status !== 'pending' ? c.successScale[300] : n[200],
                        transition: `background-color ${t.motion.hover}`,
                      }} />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      );
    };

    const renderNegotiationHistory = () => {
      if (!localShowHistory || negotiationHistory.length === 0) return null;
      return (
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[4] }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: sp[2] }}>
            <History size={20} color={p[600]} />
            <Text style={secTitle}>Negotiation History</Text>
          </Box>
          {negotiationHistory.map((ver, vi) => (
            <Box key={vi} style={{ ...card, borderLeft: `3px solid ${p[400]}` }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: sp[2], marginBottom: sp[3] }}>
                <Box style={createBadgeStyle(t, 'primary')}>
                  <Text style={{ fontSize: ty.fontSize.xs, color: 'inherit' }}>v{ver.version}</Text>
                </Box>
                <Text style={{ fontSize: ty.fontSize.sm, color: n[500] }}>{ver.date}</Text>
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[2] }}>
                {ver.changes.map((ch, ci) => (
                  <Box key={ci} style={{ display: 'flex', flexDirection: 'row' as const, alignItems: 'center', gap: sp[3], padding: `${sp[2]}px ${sp[3]}px`, borderRadius: t.borderRadius.md, backgroundColor: n[50] }}>
                    <Text style={{ fontSize: ty.fontSize.sm, fontWeight: ty.fontWeight.medium, color: n[700], minWidth: 120 }}>{ch.field}</Text>
                    <Text style={{ fontSize: ty.fontSize.sm, color: c.errorScale[600], backgroundColor: c.errorScale[50], padding: `${sp[1]}px ${sp[2]}px`, borderRadius: t.borderRadius.sm, textDecoration: 'line-through' }}>{ch.oldValue}</Text>
                    <ChevronRight size={14} color={n[400]} />
                    <Text style={{ fontSize: ty.fontSize.sm, color: c.successScale[700], backgroundColor: c.successScale[50], padding: `${sp[1]}px ${sp[2]}px`, borderRadius: t.borderRadius.sm }}>{ch.newValue}</Text>
                  </Box>
                ))}
              </Box>
              {ver.counterOffer && (
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
                  marginTop: sp[3], padding: `${sp[2]}px ${sp[3]}px`, borderRadius: t.borderRadius.md,
                  backgroundColor: c.warningScale[50],
                  border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${c.warningScale[200]}`,
                }}>
                  <Text style={{ fontSize: ty.fontSize.xs, fontWeight: ty.fontWeight.semibold, color: c.warningScale[700] }}>Counter-Offer</Text>
                  <Text style={{ fontSize: ty.fontSize.sm, color: c.warningScale[800] }}>{ver.counterOffer}</Text>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      );
    };

    const renderDocuments = () => {
      const docColor: Record<string, 'success' | 'warning' | 'secondary'> = { signed: 'success', pending: 'warning', draft: 'secondary' };
      const sigCard = (signed: boolean, label: string) => (
        <Box style={{
          display: 'flex', flexDirection: 'column' as const, gap: sp[1],
          padding: `${sp[3]}px`, borderRadius: t.borderRadius.md,
          backgroundColor: signed ? c.successScale[50] : n[50],
          border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${signed ? c.successScale[200] : n[200]}`,
        }}>
          <Text style={{
            fontSize: ty.fontSize.xs, color: n[500],
            textTransform: typo.labelTransform,
            letterSpacing: typo.labelLetterSpacing,
          }}>
            {label}
          </Text>
          <Box style={{ display: 'flex', alignItems: 'center', gap: sp[2] }}>
            {signed ? <Check size={16} color={c.successScale[600]} /> : <Clock size={16} color={n[400]} />}
            <Text style={{ fontSize: ty.fontSize.sm, fontWeight: ty.fontWeight.semibold, color: signed ? c.successScale[700] : n[600] }}>{signed ? 'Signed' : 'Pending'}</Text>
          </Box>
        </Box>
      );

      return (
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[4] }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: sp[2] }}>
            <FileText size={20} color={p[600]} />
            <Text style={secTitle}>Documents</Text>
          </Box>
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: sp[3] }}>
            {localDocuments.map((doc, i) => (
              <Box key={i} style={{ ...card, ...cardHover.base, cursor: 'pointer', display: 'flex', flexDirection: 'column' as const, gap: sp[1] }}>
                <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: sp[1] }}>
                  <Box style={createIconContainerStyle(t, { size: 36, color: p[50] })}>
                    <FileText size={18} color={p[600]} />
                  </Box>
                  <Box style={createBadgeStyle(t, docColor[doc.status] ?? 'secondary')}>
                    <Text style={{ fontSize: ty.fontSize.xs, color: 'inherit' }}>{doc.status}</Text>
                  </Box>
                </Box>
                <Text style={{ fontSize: ty.fontSize.sm, fontWeight: ty.fontWeight.semibold, color: n[900] }}>{doc.name}</Text>
                {doc.uploadDate && <Text style={{ fontSize: ty.fontSize.xs, color: n[500] }}>Uploaded: {doc.uploadDate}</Text>}
              </Box>
            ))}
            {localIsEditing && (
              <Box
                role="button"
                tabIndex={0}
                aria-label="Upload document"
                style={{
                  ...hov, display: 'flex', flexDirection: 'column' as const,
                  alignItems: 'center', justifyContent: 'center',
                  padding: sp[4], borderRadius: t.borderRadius.lg,
                  border: `2px dashed ${n[200]}`, minHeight: 100, outline: 'none',
                }}
              >
                <Upload size={24} color={n[400]} />
                <Text style={{ fontSize: ty.fontSize.sm, color: n[500], marginTop: sp[2] }}>Upload Document</Text>
              </Box>
            )}
          </Box>
          <Box style={card}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: sp[2], marginBottom: sp[3] }}>
              <PenTool size={18} color={p[600]} />
              <Text style={{
                fontSize: ty.fontSize.md,
                fontWeight: typo.headingWeight,
                color: n[900],
              }}>
                E-Signature Status
              </Text>
            </Box>
            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: sp[3] }}>
              {sigCard(localSignatureStatus?.companySigned!, 'Company Signature')}
              {sigCard(localSignatureStatus?.candidateSigned!, 'Candidate Signature')}
            </Box>
            {localSignatureStatus?.signedDate && <Text style={{ fontSize: ty.fontSize.xs, color: n[500], marginTop: sp[2] }}>Signed on: {localSignatureStatus.signedDate}</Text>}
          </Box>
          <Box style={{
            display: 'flex', alignItems: 'center', gap: sp[2],
            padding: `${sp[3]}px`, borderRadius: t.borderRadius.md,
            backgroundColor: c.infoScale[50],
            border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${c.infoScale[200]}`,
          }}>
            <input
              type="checkbox"
              aria-label="Legal review completed"
              style={{ width: 18, height: 18, accentColor: p[600] }}
            />
            <Text style={{ fontSize: ty.fontSize.sm, color: c.infoScale[800], fontWeight: ty.fontWeight.medium }}>Legal review completed</Text>
          </Box>
        </Box>
      );
    };

    const renderPipeline = () => {
      const steps = getOfferPipelineSteps();
      const curIdx = steps.findIndex((s) => s.key === status);
      const declined = status === 'declined';
      const negotiating = status === 'negotiating';

      return (
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[4] }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: sp[2] }}>
            <BarChart3 size={20} color={p[600]} />
            <Text style={secTitle}>Offer Status Pipeline</Text>
          </Box>
          <Box style={{ ...card, padding: `${sp[5]}px ${sp[4]}px`, overflowX: 'auto' as const }}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 500 }}>
              {steps.map((step, idx) => {
                const past = idx < curIdx, cur = idx === curIdx;
                let cc = n[300], lc = n[400];
                if (past) { cc = c.successScale[500]; lc = c.successScale[700]; }
                else if (cur && !declined) { cc = p[500]; lc = p[700]; }
                else if (declined && step.key === 'accepted') { cc = c.errorScale[500]; lc = c.errorScale[700]; }
                return (
                  <Box key={step.key} style={{ display: 'flex', alignItems: 'center', flex: idx < steps.length - 1 ? 1 : 'none' }}>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: sp[2] }}>
                      <Box style={{
                        width: 32, height: 32, borderRadius: t.borderRadius.full,
                        backgroundColor: cc, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: `all ${t.motion.hover}`,
                        boxShadow: cur ? `0 0 0 4px ${p[100]}` : 'none',
                      }}>
                        {past ? <Check size={14} color={c.common.white} /> : declined && step.key === 'accepted' ? <X size={14} color={c.common.white} /> : (
                          <Text style={{ fontSize: ty.fontSize.xs, fontWeight: ty.fontWeight.bold, color: cur ? c.common.white : n[500] }}>{idx + 1}</Text>
                        )}
                      </Box>
                      <Text style={{
                        fontSize: ty.fontSize.xs,
                        fontWeight: cur ? ty.fontWeight.semibold : ty.fontWeight.medium,
                        color: lc, whiteSpace: 'nowrap' as const,
                      }}>
                        {declined && step.key === 'accepted' ? 'Declined' : step.label}
                      </Text>
                    </Box>
                    {idx < steps.length - 1 && (
                      <Box style={{
                        flex: 1, height: 2, marginTop: -20,
                        backgroundColor: past ? c.successScale[300] : n[200],
                        transition: `background-color ${t.motion.hover}`,
                        marginLeft: sp[2], marginRight: sp[2],
                      }} />
                    )}
                  </Box>
                );
              })}
            </Box>
            {negotiating && (
              <Box style={{
                marginTop: sp[4], padding: `${sp[2]}px ${sp[3]}px`, borderRadius: t.borderRadius.md,
                backgroundColor: c.warningScale[50],
                border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${c.warningScale[200]}`,
                display: 'flex', alignItems: 'center', gap: sp[2],
              }}>
                <TrendingUp size={16} color={c.warningScale[600]} />
                <Text style={{ fontSize: ty.fontSize.sm, color: c.warningScale[700], fontWeight: ty.fontWeight.medium }}>Offer is currently in negotiation</Text>
              </Box>
            )}
          </Box>
        </Box>
      );
    };

    const sectionMap: Record<string, () => React.ReactNode> = {
      compensation: renderCompensation, benefits: renderBenefits,
      relocation: renderRelocation, terms: renderTerms,
      approval: renderApproval, documents: renderDocuments, pipeline: renderPipeline,
    };

    return (
      <Box className={className} style={{
        ...surfMd, minHeight: '100%', backgroundColor: n[50],
        position: 'relative' as const, overflow: 'hidden',
        ...entrance.animate, transition: entrance.transition,
        ...style,
      }}>
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[4], padding: sp[5] }}>
          {/* Header */}
          <Box style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: sp[3] }}>
            <Box style={{ flex: 1, minWidth: 200 }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: sp[3], marginBottom: sp[2] }}>
                <Box style={createIconContainerStyle(t, { size: 44, color: p[100] })}>
                  <User size={20} color={p[600]} />
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                  <Text style={{
                    fontSize: ty.fontSize.xl,
                    fontWeight: typo.headingWeight,
                    letterSpacing: typo.headingLetterSpacing,
                    color: n[900],
                  }}>
                    {candidateName}
                  </Text>
                  <Text style={{ fontSize: ty.fontSize.sm, color: n[500] }}>
                    {jobTitle} - Version {localCurrentVersion}
                  </Text>
                </Box>
              </Box>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: sp[2], flexWrap: 'wrap' as const }}>
              <Box style={createBadgeStyle(t, statusCfg.color)}>
                <Text style={{ fontSize: ty.fontSize.xs, color: 'inherit' }}>{statusCfg.label}</Text>
              </Box>
              <Box role="button" tabIndex={0} aria-label={localIsEditing ? 'Preview mode' : 'Edit mode'} onClick={toggleEditing}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleEditing(); } }}
                style={btnSec}>
                {localIsEditing ? <Eye size={14} /> : <Edit3 size={14} />}
                <Text style={{ fontSize: ty.fontSize.sm, color: 'inherit' }}>{localIsEditing ? 'Preview' : 'Edit'}</Text>
              </Box>
              <Box role="button" tabIndex={0} aria-label="Toggle history" onClick={toggleHistory}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleHistory(); } }}
                style={btnSec}>
                <History size={14} />
                <Text style={{ fontSize: ty.fontSize.sm, color: 'inherit' }}>History</Text>
              </Box>
              <Box role="button" tabIndex={0} aria-label="Toggle comparison" onClick={toggleComparison}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleComparison(); } }}
                style={btnSec}>
                <ArrowLeftRight size={14} />
                <Text style={{ fontSize: ty.fontSize.sm, color: 'inherit' }}>Compare</Text>
              </Box>
              {status === 'draft' && onSubmitApproval && (
                <Box role="button" tabIndex={0} aria-label="Submit for approval" onClick={onSubmitApproval}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSubmitApproval(); } }}
                  style={btnPri}>
                  <Shield size={14} color={c.common.white} />
                  <Text style={{ fontSize: ty.fontSize.sm, color: c.common.white }}>Submit for Approval</Text>
                </Box>
              )}
              {status === 'approved' && onSendOffer && (
                <Box role="button" tabIndex={0} aria-label="Send offer" onClick={onSendOffer}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSendOffer(); } }}
                  style={btnPri}>
                  <Send size={14} color={c.common.white} />
                  <Text style={{ fontSize: ty.fontSize.sm, color: c.common.white }}>Send Offer</Text>
                </Box>
              )}
              {localIsEditing && onSave && (
                <Box role="button" tabIndex={0} aria-label="Save changes" onClick={onSave}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSave(); } }}
                  style={btnPri}>
                  <Save size={14} color={c.common.white} />
                  <Text style={{ fontSize: ty.fontSize.sm, color: c.common.white }}>Save</Text>
                </Box>
              )}
            </Box>
          </Box>

          {/* Main layout */}
          <Box style={{ display: 'flex', gap: sp[4], alignItems: 'flex-start' }}>
            <Box style={{ ...card, padding: sp[3], display: 'flex', flexDirection: 'column' as const, gap: sp[1], minWidth: 200 }}>
              {sections.map((s) => (
                <Box
                  key={s.key}
                  role="button"
                  tabIndex={0}
                  aria-label={`Go to ${s.label} section`}
                  aria-pressed={activeSection === s.key}
                  onClick={() => setActiveSection(s.key)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveSection(s.key); } }}
                  style={navItem(activeSection === s.key)}
                >
                  <s.Icon size={16} />
                  <Text style={{
                    fontSize: ty.fontSize.sm,
                    fontWeight: activeSection === s.key ? ty.fontWeight.semibold : ty.fontWeight.medium,
                    color: activeSection === s.key ? p[700] : n[600],
                  }}>
                    {s.label}
                  </Text>
                </Box>
              ))}
            </Box>
            <Box style={{ flex: 1, minWidth: 0 }}>
              {(sectionMap[activeSection] ?? renderCompensation)()}
              {localShowHistory && negotiationHistory.length > 0 && activeSection !== 'pipeline' && (
                <Box style={{ marginTop: sp[5] }}>{renderNegotiationHistory()}</Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
