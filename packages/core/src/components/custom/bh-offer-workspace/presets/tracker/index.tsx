'use client';

/**
 * BhOfferWorkspace - Tracker Preset
 * Status tracking focused view: pipeline visualization, approval chain,
 * signature status, and timeline summary for offer management
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle, createCardStyle, createHoverStyle, createSurfaceStyle,
  createEntranceAnimation, createStaggerDelay, createCardHoverStyles,
  createPersonalitySectionHeaderStyle, createIconContainerStyle,
  createDividerStyle, getPersonalityTypography, getPersonalityBadgeRadius,
  getCardPadding, createMetadataFieldStyle, createMetadataGridStyle,
  createMetadataLabelStyle, createMetadataValueStyle,
  createStatValueStyle, createStatLabelStyle, ICON_SIZES,
} from '../../../helpers';
import type { BhOfferWorkspaceProps, ApprovalStep } from '../../core';
import { getOfferStatusConfig, getOfferPipelineSteps, formatCurrency, getOfferCompensation } from '../../core';
import {
  DollarSign, Shield, Clock, Check, X, Send, FileText,
  PenTool, History, User, BarChart3, ArrowRight,
  Calendar, Briefcase, ChevronDown, ChevronUp, Scale,
  GitBranch, ExternalLink, Link2, Award,
} from 'lucide-react';

export const TrackerBhOfferWorkspace = createPreset<BhOfferWorkspaceProps>({
  name: 'BhOfferWorkspace.Tracker',
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
      approvalSteps: rawApprovalSteps = [], negotiationHistory: rawNegotiationHistory = [],
      documents: rawDocuments = [], onSendOffer, currentVersion: currentVersionProp,
      signatureStatus, className, style,
      // Previously unrendered fields
      equityType: equityTypeProp, equityPercentage: equityPercentageProp,
      equityCliffMonths: equityCliffMonthsProp,
      relocationType: relocationTypeProp,
      contractType: contractTypeProp, contractDurationMonths: contractDurationMonthsProp,
      legalReviewRequired: legalReviewRequiredProp, legalReviewStatus: legalReviewStatusProp,
      offerLetterUrl: offerLetterUrlProp, signedOfferUrl: signedOfferUrlProp,
      signedAt: signedAtProp,
      isCounterOffer: isCounterOfferProp, previousOfferId: previousOfferIdProp,
    } = props;

    const approvalSteps = Array.isArray(rawApprovalSteps) ? rawApprovalSteps : [];
    const negotiationHistory = Array.isArray(rawNegotiationHistory) ? rawNegotiationHistory : [];
    const documents = Array.isArray(rawDocuments) ? rawDocuments : [];

    const candidateName = candidateNameProp ?? '';
    const jobTitle = jobTitleProp ?? offer?.jobTitleOffered ?? '';
    const status = statusProp ?? offer?.status ?? 'draft';
    const currentVersion = currentVersionProp ?? offer?.version ?? 1;
    const compensation = getOfferCompensation(offer);
    const startDate = offer?.proposedStartDate ? new Date(offer.proposedStartDate).toLocaleDateString() : 'TBD';
    const workLocation = offer?.remoteType ?? offer?.workLocation ?? 'TBD';
    const probationDays = offer?.probationPeriodDays ?? 90;

    // Resolved values for previously unrendered fields
    const equityType = equityTypeProp ?? compensation.equityType ?? undefined;
    const equityPercentage = equityPercentageProp ?? (offer?.equityPercentage != null ? Number(offer.equityPercentage) : undefined);
    const equityCliffMonths = equityCliffMonthsProp ?? compensation.cliffMonths ?? 12;
    const contractType = contractTypeProp ?? offer?.contractType ?? undefined;
    const contractDurationMonths = contractDurationMonthsProp ?? offer?.contractDurationMonths ?? undefined;
    const legalReviewRequired = legalReviewRequiredProp ?? offer?.legalReviewRequired ?? false;
    const legalReviewStatus = legalReviewStatusProp ?? offer?.legalReviewStatus ?? undefined;
    const offerLetterUrl = offerLetterUrlProp ?? offer?.offerLetterUrl ?? undefined;
    const signedOfferUrl = signedOfferUrlProp ?? offer?.signedOfferUrl ?? undefined;
    const signedAt = signedAtProp ?? (offer?.signedAt ? new Date(offer.signedAt).toLocaleDateString() : undefined);
    const isCounterOffer = isCounterOfferProp ?? offer?.isCounterOffer ?? false;
    const previousOfferId = previousOfferIdProp ?? offer?.previousOfferId ?? undefined;

    const [expanded, setExpanded] = useState<Record<string, boolean>>({
      pipeline: true, approval: true, compensation: false, documents: false, history: false,
    });
    const toggle = useCallback((k: string) => setExpanded((prev) => ({ ...prev, [k]: !prev[k] })), []);

    const isGlass = t.surface.useGlass && !!t.glass;
    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const surfMd = useMemo(() => createSurfaceStyle(t, { elevation: 'md', glass: isGlass }), [t, isGlass]);
    const hov = useMemo(() => createHoverStyle(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });
    const typo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const cardPadding = useMemo(() => getCardPadding(t), [t]);
    const divider = useMemo(() => createDividerStyle(t), [t]);
    const sectionHeaderStyle = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
    const statusCfg = getOfferStatusConfig(status);

    const secHdr = useMemo(() => ((): React.CSSProperties => ({
      ...hov, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: `${sp[3]}px ${sp[4]}px`,
      borderRadius: t.borderRadius.md, backgroundColor: c.common.white,
      border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${n[100]}`,
    }))(), [hov, sp, t.borderRadius.md, c.common.white, t.surface.borderWidth, t.surface.borderStyle, n]);

    /* Summary Stats */
    const base = compensation.baseSalary;
    const signing = compensation.signingBonus;
    const bonusPct = compensation.annualBonusPercent;
    const totalComp = base + signing + Math.round(base * (bonusPct / 100));
    const approvedCt = approvalSteps.filter((s) => s.status === 'approved').length;
    const signedDocs = documents.filter((d) => d.status === 'signed').length;
    const allSigned = signatureStatus?.candidateSigned && signatureStatus?.companySigned;

    const stats = useMemo(() => [
      { label: 'Total Compensation', value: formatCurrency(totalComp, compensation.currency), Icon: DollarSign, color: p },
      { label: 'Approvals', value: `${approvedCt}/${approvalSteps.length}`, Icon: Shield, color: approvedCt === approvalSteps.length ? c.successScale : c.warningScale },
      { label: 'Documents', value: `${signedDocs}/${documents.length} signed`, Icon: FileText, color: c.infoScale },
      { label: 'Signatures', value: allSigned ? 'Complete' : 'Pending', Icon: PenTool, color: allSigned ? c.successScale : c.warningScale },
    ], [totalComp, compensation.currency, approvedCt, approvalSteps.length, signedDocs, documents.length, allSigned, p, c]);

    /* Accordion Section wrapper */
    const Section = useCallback(({ k, icon, title, extra, children }: {
      k: string; icon: React.ReactNode; title: string; extra?: string; children: React.ReactNode;
    }) => (
      <Box>
        <Box
          role="button"
          tabIndex={0}
          aria-expanded={expanded[k]}
          aria-label={`Toggle ${title} section`}
          onClick={() => toggle(k)}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(k); } }}
          style={secHdr}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: sp[2] }}>
            {icon}
            <Text style={{
              fontSize: ty.fontSize.md,
              fontWeight: typo.headingWeight,
              letterSpacing: typo.headingLetterSpacing,
              color: n[900],
            }}>
              {title}{extra ? ` (${extra})` : ''}
            </Text>
          </Box>
          {expanded[k] ? <ChevronUp size={18} color={n[400]} /> : <ChevronDown size={18} color={n[400]} />}
        </Box>
        {expanded[k] && <Box style={{ ...card, marginTop: sp[2] }}>{children}</Box>}
      </Box>
    ), [expanded, toggle, secHdr, sp, ty, typo, n, card, Box, Text]);

    /* Pipeline */
    const renderPipeline = () => {
      const steps = getOfferPipelineSteps();
      const curIdx = steps.findIndex((s) => s.key === status);
      const declined = status === 'declined';
      return (
        <Section k="pipeline" icon={<BarChart3 size={18} color={p[600]} />} title="Status Pipeline">
          <Box style={{ padding: `${sp[3]}px 0`, overflowX: 'auto' as const }}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 480 }}>
              {steps.map((step, idx) => {
                const past = idx < curIdx, cur = idx === curIdx;
                let cc = n[300], tc = n[400];
                if (past) { cc = c.successScale[500]; tc = c.successScale[700]; }
                else if (cur && !declined) { cc = p[500]; tc = p[700]; }
                else if (declined && step.key === 'accepted') { cc = c.errorScale[500]; tc = c.errorScale[700]; }
                return (
                  <Box key={step.key} style={{ display: 'flex', alignItems: 'center', flex: idx < steps.length - 1 ? 1 : 'none' }}>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: sp[2] }}>
                      <Box style={{
                        width: 36, height: 36, borderRadius: t.borderRadius.full,
                        backgroundColor: cc, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: cur ? `0 0 0 4px ${p[100]}` : 'none',
                        transition: `all ${t.motion.hover}`,
                      }}>
                        {past ? <Check size={16} color={c.common.white} /> : declined && step.key === 'accepted' ? <X size={16} color={c.common.white} /> : (
                          <Text style={{ fontSize: ty.fontSize.xs, fontWeight: ty.fontWeight.bold, color: cur ? c.common.white : n[500] }}>{idx + 1}</Text>
                        )}
                      </Box>
                      <Text style={{
                        fontSize: ty.fontSize.xs,
                        fontWeight: cur ? ty.fontWeight.semibold : ty.fontWeight.medium,
                        color: tc, whiteSpace: 'nowrap' as const,
                      }}>
                        {declined && step.key === 'accepted' ? 'Declined' : step.label}
                      </Text>
                    </Box>
                    {idx < steps.length - 1 && (
                      <Box style={{
                        flex: 1, height: 2, marginTop: -20,
                        backgroundColor: past ? c.successScale[300] : n[200],
                        marginLeft: sp[2], marginRight: sp[2],
                        transition: `background-color ${t.motion.hover}`,
                      }} />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Section>
      );
    };

    const stepBadge = (s: ApprovalStep) => s.status === 'approved' ? 'success' as const : s.status === 'rejected' ? 'error' as const : 'warning' as const;
    const stepScale = (s: ApprovalStep) => s.status === 'approved' ? c.successScale : s.status === 'rejected' ? c.errorScale : c.warningScale;

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
            <Box style={{ display: 'flex', alignItems: 'center', gap: sp[3] }}>
              <Box style={createIconContainerStyle(t, { size: 48, color: p[100] })}>
                <User size={22} color={p[600]} />
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
                  {jobTitle} - v{currentVersion}
                </Text>
              </Box>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: sp[3], flexWrap: 'wrap' as const }}>
              <Box style={createBadgeStyle(t, statusCfg.color)}>
                <Text style={{ fontSize: ty.fontSize.xs, fontWeight: ty.fontWeight.medium, color: 'inherit' }}>
                  {statusCfg.label}
                </Text>
              </Box>
              {isCounterOffer && (
                <Box style={{ ...createBadgeStyle(t, 'warning'), display: 'inline-flex', alignItems: 'center', gap: sp[1] }}>
                  <GitBranch size={ICON_SIZES.label} />
                  <Text style={{ fontSize: ty.fontSize.xs, color: 'inherit' }}>Counter Offer</Text>
                </Box>
              )}
              {previousOfferId && (
                <Box style={{ ...createBadgeStyle(t, 'secondary'), display: 'inline-flex', alignItems: 'center', gap: sp[1] }}>
                  <History size={ICON_SIZES.label} />
                  <Text style={{ fontSize: ty.fontSize.xs, color: 'inherit' }}>
                    Prev: {previousOfferId.substring(0, 8)}...
                  </Text>
                </Box>
              )}
              {status === 'approved' && onSendOffer && (
                <Box
                  role="button"
                  tabIndex={0}
                  aria-label="Send offer to candidate"
                  onClick={onSendOffer}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSendOffer(); } }}
                  style={{
                    ...hov, padding: `${sp[2]}px ${sp[4]}px`, borderRadius: t.borderRadius.md,
                    backgroundColor: p[600], color: c.common.white,
                    fontSize: ty.fontSize.sm, fontWeight: ty.fontWeight.semibold,
                    fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: sp[2],
                    outline: 'none',
                  }}
                >
                  <Send size={14} color={c.common.white} />
                  <Text style={{ fontSize: ty.fontSize.sm, fontWeight: ty.fontWeight.semibold, color: c.common.white }}>Send Offer</Text>
                </Box>
              )}
            </Box>
          </Box>

          {/* Stats */}
          <Box style={createMetadataGridStyle(t, { columns: 4 })}>
            {stats.map((s, i) => {
              const statEntrance = createEntranceAnimation(t, { index: i });
              return (
                <Box key={i} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
                  ...animStyle(i),
                  ...card, textAlign: 'center' as const,
                  ...statEntrance.animate, transition: statEntrance.transition,
                }}>
                  <Box style={{
                    ...createIconContainerStyle(t, { size: 36, color: s.color[50] }),
                    margin: '0 auto', marginBottom: sp[2],
                  }}>
                    <s.Icon size={ICON_SIZES.section} color={s.color[600]} />
                  </Box>
                  <Text style={createStatValueStyle(t, { size: 'lg' })}>
                    {s.value}
                  </Text>
                  <Text style={{ ...createStatLabelStyle(t, { personality: typo }), marginTop: sp[1] }}>
                    {s.label}
                  </Text>
                </Box>
              );
            })}
          </Box>

          {renderPipeline()}

          {/* Approval Chain */}
          <Section k="approval" icon={<Shield size={18} color={p[600]} />} title="Approval Chain" extra={`${approvedCt}/${approvalSteps.length}`}>
            {approvalSteps.map((step, idx) => {
              const sc = stepScale(step);
              return (
                <Box key={idx}>
                  <Box style={{ ...animStyle(idx), display: 'flex', alignItems: 'center', gap: sp[3], padding: `${sp[3]}px 0` }}>
                    <Box style={{
                      ...createIconContainerStyle(t, { size: 32, color: sc[500] }),
                      backgroundColor: sc[500],
                    }}>
                      {step.status === 'approved' ? <Check size={14} color={c.common.white} /> : step.status === 'rejected' ? <X size={14} color={c.common.white} /> : <Clock size={14} color={c.common.white} />}
                    </Box>
                    {step.approverAvatar ? (
                      <Box style={{
                        width: 28, height: 28, borderRadius: t.borderRadius.full,
                        backgroundImage: `url(${step.approverAvatar})`,
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        flexShrink: 0,
                      }} />
                    ) : (
                      <Box style={{
                        ...createIconContainerStyle(t, { size: 28, color: sc[100] }),
                      }}>
                        <Text style={{ fontSize: ty.fontSize.xs, fontWeight: ty.fontWeight.semibold, color: sc[700] }}>{(step.approverName || '?').charAt(0)}</Text>
                      </Box>
                    )}
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1 }}>
                      <Text style={{ fontSize: ty.fontSize.sm, fontWeight: ty.fontWeight.medium, color: n[800] }}>{step.approverName}</Text>
                      <Text style={{ fontSize: ty.fontSize.xs, color: n[500] }}>{step.role}</Text>
                    </Box>
                    <Box style={createBadgeStyle(t, stepBadge(step))}>
                      <Text style={{ fontSize: ty.fontSize.xs, fontWeight: ty.fontWeight.medium, color: 'inherit' }}>{step.status}</Text>
                    </Box>
                    {step.date && <Text style={{ fontSize: ty.fontSize.xs, color: n[400] }}>{step.date}</Text>}
                  </Box>
                  {idx < approvalSteps.length - 1 && (
                    <Box style={{ marginLeft: 16, width: 2, height: 16, backgroundColor: approvalSteps[idx + 1].status !== 'pending' ? c.successScale[300] : n[200] }} />
                  )}
                </Box>
              );
            })}
          </Section>

          {/* Compensation Summary */}
          <Section k="compensation" icon={<DollarSign size={18} color={p[600]} />} title="Compensation Summary">
            <Box style={createMetadataGridStyle(t, { columns: 2 })}>
              {[
                { label: 'Base Salary', value: formatCurrency(compensation.baseSalary, compensation.currency) },
                { label: 'Signing Bonus', value: formatCurrency(compensation.signingBonus, compensation.currency) },
                { label: 'Annual Bonus', value: `${compensation.annualBonusPercent}%` },
                { label: 'Equity', value: compensation.equityShares ? `${compensation.equityShares.toLocaleString()} shares` : 'N/A' },
              ].map((item, i) => (
                <Box key={i} style={createMetadataFieldStyle(t, { withBackground: true })}>
                  <Text style={createMetadataLabelStyle(t, { personality: typo })}>
                    {item.label}
                  </Text>
                  <Text style={createMetadataValueStyle(t, { size: 'md', weight: 'semibold' })}>
                    {item.value}
                  </Text>
                </Box>
              ))}
            </Box>
            {/* Equity details row */}
            {(equityType || equityPercentage != null) && (
              <Box style={{ display: 'flex', gap: sp[2], flexWrap: 'wrap' as const, marginTop: sp[2] }}>
                {equityType && (
                  <Box style={{ ...createBadgeStyle(t, 'primary'), display: 'inline-flex', alignItems: 'center', gap: sp[1] }}>
                    <Award size={ICON_SIZES.label} />
                    <Text style={{ fontSize: ty.fontSize.xs, color: 'inherit', textTransform: 'capitalize' as const }}>
                      {equityType.replace(/_/g, ' ')}
                    </Text>
                  </Box>
                )}
                {equityPercentage != null && (
                  <Box style={{ ...createBadgeStyle(t, 'info'), display: 'inline-flex', alignItems: 'center', gap: sp[1] }}>
                    <Text style={{ fontSize: ty.fontSize.xs, color: 'inherit' }}>{equityPercentage}% equity</Text>
                  </Box>
                )}
                <Box style={{ ...createBadgeStyle(t, 'secondary'), display: 'inline-flex', alignItems: 'center', gap: sp[1] }}>
                  <Clock size={ICON_SIZES.label} />
                  <Text style={{ fontSize: ty.fontSize.xs, color: 'inherit' }}>{equityCliffMonths}mo cliff</Text>
                </Box>
              </Box>
            )}
            {/* Terms badges row */}
            <Box style={{ marginTop: sp[3], display: 'flex', gap: sp[3], flexWrap: 'wrap' as const }}>
              <Box style={{ ...createBadgeStyle(t, 'info'), display: 'inline-flex', alignItems: 'center', gap: sp[1] }}>
                <Calendar size={ICON_SIZES.label} />
                <Text style={{ fontSize: ty.fontSize.xs, color: 'inherit' }}>Start: {startDate}</Text>
              </Box>
              <Box style={{ ...createBadgeStyle(t, 'secondary'), display: 'inline-flex', alignItems: 'center', gap: sp[1] }}>
                <Briefcase size={ICON_SIZES.label} />
                <Text style={{ fontSize: ty.fontSize.xs, color: 'inherit' }}>{workLocation}</Text>
              </Box>
              <Box style={{ ...createBadgeStyle(t, 'warning'), display: 'inline-flex', alignItems: 'center', gap: sp[1] }}>
                <Clock size={ICON_SIZES.label} />
                <Text style={{ fontSize: ty.fontSize.xs, color: 'inherit' }}>Probation: {probationDays} days</Text>
              </Box>
              {contractType && (
                <Box style={{ ...createBadgeStyle(t, 'primary'), display: 'inline-flex', alignItems: 'center', gap: sp[1] }}>
                  <Briefcase size={ICON_SIZES.label} />
                  <Text style={{ fontSize: ty.fontSize.xs, color: 'inherit', textTransform: 'capitalize' as const }}>
                    {contractType.replace(/_/g, ' ')}
                  </Text>
                </Box>
              )}
              {contractDurationMonths != null && (
                <Box style={{ ...createBadgeStyle(t, 'warning'), display: 'inline-flex', alignItems: 'center', gap: sp[1] }}>
                  <Calendar size={ICON_SIZES.label} />
                  <Text style={{ fontSize: ty.fontSize.xs, color: 'inherit' }}>{contractDurationMonths}mo contract</Text>
                </Box>
              )}
            </Box>
          </Section>

          {/* Documents */}
          <Section k="documents" icon={<FileText size={18} color={p[600]} />} title="Documents" extra={`${signedDocs}/${documents.length}`}>
            {documents.map((doc, i) => (
              <Box key={i} style={{
                ...animStyle(i),
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: `${sp[2]}px 0`,
                borderBottom: i < documents.length - 1 ? `${t.surface.borderWidth} ${t.surface.borderStyle} ${n[100]}` : 'none',
              }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: sp[2] }}>
                  <FileText size={16} color={n[400]} />
                  <Text style={{ fontSize: ty.fontSize.sm, color: n[800] }}>{doc.name}</Text>
                </Box>
                <Box style={createBadgeStyle(t, doc.status === 'signed' ? 'success' : doc.status === 'pending' ? 'warning' : 'secondary')}>
                  <Text style={{ fontSize: ty.fontSize.xs, color: 'inherit' }}>{doc.status}</Text>
                </Box>
              </Box>
            ))}
            {/* E-Signatures */}
            <Box style={{
              marginTop: sp[3], padding: `${sp[3]}px`, borderRadius: t.borderRadius.md,
              backgroundColor: allSigned ? c.successScale[50] : n[50],
              border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${allSigned ? c.successScale[200] : n[200]}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap' as const, gap: sp[2],
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: sp[2] }}>
                <PenTool size={16} color={allSigned ? c.successScale[600] : n[400]} />
                <Text style={{ fontSize: ty.fontSize.sm, fontWeight: ty.fontWeight.medium, color: n[700] }}>E-Signatures</Text>
                {signedAt && <Text style={{ fontSize: ty.fontSize.xs, color: c.successScale[600] }}>(signed: {signedAt})</Text>}
              </Box>
              <Box style={{ display: 'flex', gap: sp[2] }}>
                <Box style={createBadgeStyle(t, signatureStatus?.companySigned ? 'success' : 'secondary')}>
                  <Text style={{ fontSize: ty.fontSize.xs, color: 'inherit' }}>Company {signatureStatus?.companySigned ? 'Signed' : 'Pending'}</Text>
                </Box>
                <Box style={createBadgeStyle(t, signatureStatus?.candidateSigned ? 'success' : 'secondary')}>
                  <Text style={{ fontSize: ty.fontSize.xs, color: 'inherit' }}>Candidate {signatureStatus?.candidateSigned ? 'Signed' : 'Pending'}</Text>
                </Box>
              </Box>
            </Box>
            {/* Document Links */}
            {(offerLetterUrl || signedOfferUrl) && (
              <Box style={{ marginTop: sp[2], display: 'flex', gap: sp[2], flexWrap: 'wrap' as const }}>
                {offerLetterUrl && (
                  <Box style={{
                    display: 'inline-flex', alignItems: 'center', gap: sp[2],
                    padding: `${sp[2]}px ${sp[3]}px`, borderRadius: t.borderRadius.md,
                    backgroundColor: n[50],
                    border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${n[200]}`,
                  }}>
                    <FileText size={14} color={p[500]} />
                    <Text style={{ fontSize: ty.fontSize.xs, color: n[700] }}>Offer Letter</Text>
                    <ExternalLink size={12} color={p[500]} />
                  </Box>
                )}
                {signedOfferUrl && (
                  <Box style={{
                    display: 'inline-flex', alignItems: 'center', gap: sp[2],
                    padding: `${sp[2]}px ${sp[3]}px`, borderRadius: t.borderRadius.md,
                    backgroundColor: c.successScale[50],
                    border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${c.successScale[200]}`,
                  }}>
                    <PenTool size={14} color={c.successScale[600]} />
                    <Text style={{ fontSize: ty.fontSize.xs, color: c.successScale[700] }}>Signed Document</Text>
                    <ExternalLink size={12} color={c.successScale[500]} />
                  </Box>
                )}
              </Box>
            )}
            {/* Legal Review */}
            <Box style={{
              marginTop: sp[2], padding: `${sp[2]}px ${sp[3]}px`, borderRadius: t.borderRadius.md,
              backgroundColor: legalReviewRequired ? c.infoScale[50] : n[50],
              border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${legalReviewRequired ? c.infoScale[200] : n[200]}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: sp[2] }}>
                <Scale size={14} color={legalReviewRequired ? c.infoScale[600] : n[400]} />
                <Text style={{ fontSize: ty.fontSize.xs, fontWeight: ty.fontWeight.medium, color: legalReviewRequired ? c.infoScale[800] : n[600] }}>
                  Legal Review {legalReviewRequired ? 'Required' : 'Not Required'}
                </Text>
              </Box>
              {legalReviewStatus && (
                <Box style={createBadgeStyle(t,
                  legalReviewStatus === 'approved' ? 'success'
                    : legalReviewStatus === 'changes_requested' ? 'error'
                    : legalReviewStatus === 'in_review' ? 'warning'
                    : 'secondary'
                )}>
                  <Text style={{ fontSize: ty.fontSize.xs, color: 'inherit', textTransform: 'capitalize' as const }}>
                    {legalReviewStatus.replace(/_/g, ' ')}
                  </Text>
                </Box>
              )}
            </Box>
          </Section>

          {/* Negotiation History */}
          {negotiationHistory.length > 0 && (
            <Section k="history" icon={<History size={18} color={p[600]} />} title="Negotiation History" extra={`${negotiationHistory.length} versions`}>
              {negotiationHistory.map((ver, vi) => (
                <Box key={vi} style={{
                  ...animStyle(vi),
                  padding: `${sp[3]}px 0`,
                  borderBottom: vi < negotiationHistory.length - 1 ? `${t.surface.borderWidth} ${t.surface.borderStyle} ${n[100]}` : 'none',
                }}>
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: sp[2] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: sp[2] }}>
                      <Box style={createBadgeStyle(t, 'primary')}>
                        <Text style={{ fontSize: ty.fontSize.xs, color: 'inherit' }}>v{ver.version}</Text>
                      </Box>
                      <Text style={{ fontSize: ty.fontSize.xs, color: n[500] }}>{ver.date}</Text>
                    </Box>
                    <Text style={{ fontSize: ty.fontSize.xs, color: n[400] }}>{ver.changes.length} change{ver.changes.length !== 1 ? 's' : ''}</Text>
                  </Box>
                  {ver.changes.map((ch, ci) => (
                    <Box key={ci} style={{ display: 'flex', flexDirection: 'row' as const, alignItems: 'center', gap: sp[2], fontSize: ty.fontSize.xs, padding: `${sp[1]}px 0` }}>
                      <Text style={{ color: n[600], minWidth: 80, fontWeight: ty.fontWeight.medium, fontSize: ty.fontSize.xs }}>{ch.field}</Text>
                      <Text style={{ color: c.errorScale[600], textDecoration: 'line-through', fontSize: ty.fontSize.xs }}>{ch.oldValue}</Text>
                      <ArrowRight size={12} color={n[400]} />
                      <Text style={{ color: c.successScale[700], fontSize: ty.fontSize.xs }}>{ch.newValue}</Text>
                    </Box>
                  ))}
                  {ver.counterOffer && (
                    <Box style={{
                      marginTop: sp[2], padding: `${sp[2]}px ${sp[3]}px`,
                      borderRadius: t.borderRadius.sm,
                      backgroundColor: c.warningScale[50],
                    }}>
                      <Text style={{ fontSize: ty.fontSize.xs, color: c.warningScale[700] }}>
                        Counter: {ver.counterOffer}
                      </Text>
                    </Box>
                  )}
                </Box>
              ))}
            </Section>
          )}
        </Box>
      </Box>
    );
  },
});
