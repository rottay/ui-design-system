'use client';

/**
 * BhOfferWorkspace - Tracker Preset
 * Status tracking focused view: pipeline visualization, approval chain,
 * signature status, and timeline summary for offer management
 */

import {useState, useMemo} from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle, createCardStyle, createHoverStyle, createSurfaceStyle,
} from '../../../helpers';
import type { BhOfferWorkspaceProps, ApprovalStep } from '../../core';
import { getOfferStatusConfig, getOfferPipelineSteps, formatCurrency } from '../../core';
import {
  DollarSign, Shield, Clock, Check, X, Send, FileText,
  PenTool, History, User, BarChart3, ArrowRight,
  Calendar, Briefcase, ChevronDown, ChevronUp,
} from 'lucide-react';

export const TrackerBhOfferWorkspace = createPreset<BhOfferWorkspaceProps>({
  name: 'BhOfferWorkspace.Tracker',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhOfferWorkspaceProps>) => {
    const { Box } = primitives;
    const t = tokens;
    const bdr = '1px solid';
    const sp = t.spacing;
    const ty = t.typography;
    const c = t.colors;
    const n = c.neutral;
    const p = c.primaryScale;
    const trans = t.transitions?.fast || t.motion.hover;

    const {
      candidateName, jobTitle, status, compensation, employmentTerms,
      approvalSteps, negotiationHistory, documents, onSendOffer,
      currentVersion, signatureStatus, className, style,
    } = props;

    const [expanded, setExpanded] = useState<Record<string, boolean>>({
      pipeline: true, approval: true, compensation: false, documents: false, history: false,
    });
    const toggle = (k: string) => setExpanded((prev) => ({ ...prev, [k]: !prev[k] }));

    const isGlass = t.surface.useGlass && !!t.glass;
    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const surfMd = useMemo(() => createSurfaceStyle(t, { elevation: 'md', glass: isGlass }), [t, isGlass]);
    const hov = useMemo(() => createHoverStyle(t), [t]);
    const statusCfg = getOfferStatusConfig(status);

    const secHdr = (k: string): React.CSSProperties => ({
      ...hov, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      cursor: 'pointer', transition: `all ${t.motion.hover}`, padding: `${sp[3]}px ${sp[4]}px`,
      borderRadius: t.borderRadius.md, backgroundColor: c.common.white, border: `${bdr} ${n[100]}`,
    });
    const secTtl: React.CSSProperties = {
      fontSize: ty.fontSize.md, fontWeight: ty.fontWeight.semibold, letterSpacing: '-0.02em', color: n[900],
      margin: 0, display: 'flex', alignItems: 'center', gap: sp[2],
    };
    const Chev = ({ k }: { k: string }) => expanded[k] ? <ChevronUp size={18} color={n[400]} /> : <ChevronDown size={18} color={n[400]} />;

    /* ── Summary Stats ── */
    const totalComp = compensation.baseSalary + compensation.signingBonus + Math.round(compensation.baseSalary * (compensation.annualBonusPercent / 100));
    const approvedCt = approvalSteps.filter((s) => s.status === 'approved').length;
    const signedDocs = documents.filter((d) => d.status === 'signed').length;
    const allSigned = signatureStatus.candidateSigned && signatureStatus.companySigned;

    const stats = [
      { label: 'Total Compensation', value: formatCurrency(totalComp, compensation.currency), icon: <DollarSign size={18} />, color: p },
      { label: 'Approvals', value: `${approvedCt}/${approvalSteps.length}`, icon: <Shield size={18} />, color: approvedCt === approvalSteps.length ? c.successScale : c.warningScale },
      { label: 'Documents', value: `${signedDocs}/${documents.length} signed`, icon: <FileText size={18} />, color: c.infoScale },
      { label: 'Signatures', value: allSigned ? 'Complete' : 'Pending', icon: <PenTool size={18} />, color: allSigned ? c.successScale : c.warningScale },
    ];

    /* ── Accordion Section wrapper ── */
    const Section = ({ k, icon, title, extra, children }: {
      k: string; icon: React.ReactNode; title: string; extra?: string; children: React.ReactNode;
    }) => (
      <div>
        <div onClick={() => toggle(k)} style={secHdr(k)}>
          <h3 style={secTtl}>{icon}{title}{extra ? ` (${extra})` : ''}</h3>
          <Chev k={k} />
        </div>
        {expanded[k] && <div style={{ ...card, marginTop: sp[2] }}>{children}</div>}
      </div>
    );

    /* ── Pipeline ── */
    const renderPipeline = () => {
      const steps = getOfferPipelineSteps();
      const curIdx = steps.findIndex((s) => s.key === status);
      const declined = status === 'declined';
      return (
        <Section k="pipeline" icon={<BarChart3 size={18} color={p[600]} />} title="Status Pipeline">
          <div style={{ padding: `${sp[3]}px 0`, overflowX: 'auto' as const }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 480 }}>
              {steps.map((step, idx) => {
                const past = idx < curIdx, cur = idx === curIdx;
                let cc = n[300], tc = n[400];
                if (past) { cc = c.successScale[500]; tc = c.successScale[700]; }
                else if (cur && !declined) { cc = p[500]; tc = p[700]; }
                else if (declined && step.key === 'accepted') { cc = c.errorScale[500]; tc = c.errorScale[700]; }
                return (
                  <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: idx < steps.length - 1 ? 1 : 'none' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: sp[2] }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: cc, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: cur ? `0 0 0 4px ${p[100]}` : 'none', transition: `all ${t.motion.hover}` }}>
                        {past ? <Check size={16} color={c.common.white} /> : declined && step.key === 'accepted' ? <X size={16} color={c.common.white} /> : (
                          <span style={{ fontSize: ty.fontSize.xs, fontWeight: ty.fontWeight.bold, color: cur ? c.common.white : n[500] }}>{idx + 1}</span>
                        )}
                      </div>
                      <span style={{ fontSize: ty.fontSize.xs, fontWeight: cur ? ty.fontWeight.semibold : ty.fontWeight.medium, color: tc, whiteSpace: 'nowrap' as const }}>
                        {declined && step.key === 'accepted' ? 'Declined' : step.label}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div style={{ flex: 1, height: 2, marginTop: -20, backgroundColor: past ? c.successScale[300] : n[200], marginLeft: sp[2], marginRight: sp[2], transition: `background-color ${trans}` }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Section>
      );
    };

    const stepBadge = (s: ApprovalStep) => s.status === 'approved' ? 'success' as const : s.status === 'rejected' ? 'error' as const : 'warning' as const;
    const stepScale = (s: ApprovalStep) => s.status === 'approved' ? c.successScale : s.status === 'rejected' ? c.errorScale : c.warningScale;

    return (
      <Box className={className} style={{ ...surfMd, minHeight: '100%', backgroundColor: n[50], position: 'relative' as const, overflow: 'hidden', ...style }}>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[4], padding: sp[5] }}>
          {/* Header */}
          <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: sp[3] }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: sp[3] }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: p[100], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={22} color={p[600]} />
              </div>
              <div>
                <h2 style={{ fontSize: ty.fontSize.xl, fontWeight: ty.fontWeight.bold, color: n[900], margin: 0 }}>{candidateName}</h2>
                <p style={{ fontSize: ty.fontSize.sm, color: n[500], margin: 0 }}>{jobTitle} &middot; v{currentVersion}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: sp[3] }}>
              <span style={createBadgeStyle(t, statusCfg.color)}>{statusCfg.label}</span>
              {status === 'approved' && (
                <button onClick={onSendOffer} style={{ ...hov, padding: `${sp[2]}px ${sp[4]}px`, borderRadius: t.borderRadius.md, backgroundColor: p[600], color: c.common.white, border: 'none', fontSize: ty.fontSize.sm, fontWeight: ty.fontWeight.semibold, fontFamily: 'inherit', cursor: 'pointer', transition: `all ${t.motion.hover}`, display: 'inline-flex', alignItems: 'center', gap: sp[2] }}>
                  <Send size={14} />Send Offer
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: sp[3] }}>
            {stats.map((s, i) => (
              <div key={i} style={{ ...card, textAlign: 'center' as const }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: s.color[50], display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', marginBottom: sp[2], color: s.color[600] }}>{s.icon}</div>
                <p style={{ fontSize: ty.fontSize.lg, fontWeight: ty.fontWeight.bold, color: n[900], margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: ty.fontSize.xs, color: n[500], margin: `${sp[1]}px 0 0 0` }}>{s.label}</p>
              </div>
            ))}
          </div>

          {renderPipeline()}

          {/* Approval Chain */}
          <Section k="approval" icon={<Shield size={18} color={p[600]} />} title="Approval Chain" extra={`${approvedCt}/${approvalSteps.length}`}>
            {approvalSteps.map((step, idx) => {
              const sc = stepScale(step);
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: sp[3], padding: `${sp[3]}px 0` }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: sc[500], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {step.status === 'approved' ? <Check size={14} color={c.common.white} /> : step.status === 'rejected' ? <X size={14} color={c.common.white} /> : <Clock size={14} color={c.common.white} />}
                    </div>
                    {step.approverAvatar ? (
                      <img src={step.approverAvatar} alt={step.approverName} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' as const }} />
                    ) : (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: sc[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: ty.fontSize.xs, fontWeight: ty.fontWeight.semibold, color: sc[700] }}>{step.approverName.charAt(0)}</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: ty.fontSize.sm, fontWeight: ty.fontWeight.medium, color: n[800], margin: 0 }}>{step.approverName}</p>
                      <p style={{ fontSize: ty.fontSize.xs, color: n[500], margin: 0 }}>{step.role}</p>
                    </div>
                    <span style={createBadgeStyle(t, stepBadge(step))}>{step.status}</span>
                    {step.date && <span style={{ fontSize: ty.fontSize.xs, color: n[400] }}>{step.date}</span>}
                  </div>
                  {idx < approvalSteps.length - 1 && (
                    <div style={{ marginLeft: 16, width: 2, height: 16, backgroundColor: approvalSteps[idx + 1].status !== 'pending' ? c.successScale[300] : n[200] }} />
                  )}
                </div>
              );
            })}
          </Section>

          {/* Compensation Summary */}
          <Section k="compensation" icon={<DollarSign size={18} color={p[600]} />} title="Compensation Summary">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: sp[3] }}>
              {[
                { label: 'Base Salary', value: formatCurrency(compensation.baseSalary, compensation.currency) },
                { label: 'Signing Bonus', value: formatCurrency(compensation.signingBonus, compensation.currency) },
                { label: 'Annual Bonus', value: `${compensation.annualBonusPercent}%` },
                { label: 'Equity', value: compensation.equityShares ? `${compensation.equityShares.toLocaleString()} shares` : 'N/A' },
              ].map((item, i) => (
                <div key={i} style={{ padding: `${sp[3]}px`, borderRadius: t.borderRadius.md, backgroundColor: n[50] }}>
                  <p style={{ fontSize: ty.fontSize.xs, color: n[500], margin: `0 0 ${sp[1]}px 0` }}>{item.label}</p>
                  <p style={{ fontSize: ty.fontSize.md, fontWeight: ty.fontWeight.bold, color: n[900], margin: 0 }}>{item.value}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: sp[3], display: 'flex', gap: sp[3], flexWrap: 'wrap' as const }}>
              <span style={createBadgeStyle(t, 'info')}><Calendar size={12} style={{ marginRight: sp[1] }} />Start: {employmentTerms.startDate}</span>
              <span style={createBadgeStyle(t, 'secondary')}><Briefcase size={12} style={{ marginRight: sp[1] }} />{employmentTerms.workArrangement}</span>
              <span style={createBadgeStyle(t, 'warning')}><Clock size={12} style={{ marginRight: sp[1] }} />Probation: {employmentTerms.probationPeriod}</span>
            </div>
          </Section>

          {/* Documents */}
          <Section k="documents" icon={<FileText size={18} color={p[600]} />} title="Documents" extra={`${signedDocs}/${documents.length}`}>
            {documents.map((doc, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${sp[2]}px 0`, borderBottom: i < documents.length - 1 ? `${bdr} ${n[100]}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: sp[2] }}>
                  <FileText size={16} color={n[400]} />
                  <span style={{ fontSize: ty.fontSize.sm, color: n[800] }}>{doc.name}</span>
                </div>
                <span style={createBadgeStyle(t, doc.status === 'signed' ? 'success' : doc.status === 'pending' ? 'warning' : 'secondary')}>{doc.status}</span>
              </div>
            ))}
            <div style={{ marginTop: sp[3], padding: `${sp[3]}px`, borderRadius: t.borderRadius.md, backgroundColor: allSigned ? c.successScale[50] : n[50], border: `${bdr} ${allSigned ? c.successScale[200] : n[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: sp[2] }}>
                <PenTool size={16} color={allSigned ? c.successScale[600] : n[400]} />
                <span style={{ fontSize: ty.fontSize.sm, fontWeight: ty.fontWeight.medium, color: n[700] }}>E-Signatures</span>
              </div>
              <div style={{ display: 'flex', gap: sp[2] }}>
                <span style={createBadgeStyle(t, signatureStatus.companySigned ? 'success' : 'secondary')}>Company {signatureStatus.companySigned ? 'Signed' : 'Pending'}</span>
                <span style={createBadgeStyle(t, signatureStatus.candidateSigned ? 'success' : 'secondary')}>Candidate {signatureStatus.candidateSigned ? 'Signed' : 'Pending'}</span>
              </div>
            </div>
          </Section>

          {/* Negotiation History */}
          {negotiationHistory.length > 0 && (
            <Section k="history" icon={<History size={18} color={p[600]} />} title="Negotiation History" extra={`${negotiationHistory.length} versions`}>
              {negotiationHistory.map((ver, vi) => (
                <div key={vi} style={{ padding: `${sp[3]}px 0`, borderBottom: vi < negotiationHistory.length - 1 ? `${bdr} ${n[100]}` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: sp[2] }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: sp[2] }}>
                      <span style={createBadgeStyle(t, 'primary')}>v{ver.version}</span>
                      <span style={{ fontSize: ty.fontSize.xs, color: n[500] }}>{ver.date}</span>
                    </div>
                    <span style={{ fontSize: ty.fontSize.xs, color: n[400] }}>{ver.changes.length} change{ver.changes.length !== 1 ? 's' : ''}</span>
                  </div>
                  {ver.changes.map((ch, ci) => (
                    <div key={ci} style={{ display: 'flex', alignItems: 'center', gap: sp[2], fontSize: ty.fontSize.xs, padding: `${sp[1]}px 0` }}>
                      <span style={{ color: n[600], minWidth: 80, fontWeight: ty.fontWeight.medium }}>{ch.field}</span>
                      <span style={{ color: c.errorScale[600], textDecoration: 'line-through' }}>{ch.oldValue}</span>
                      <ArrowRight size={12} color={n[400]} />
                      <span style={{ color: c.successScale[700] }}>{ch.newValue}</span>
                    </div>
                  ))}
                  {ver.counterOffer && (
                    <div style={{ marginTop: sp[2], padding: `${sp[2]}px ${sp[3]}px`, borderRadius: t.borderRadius.sm, backgroundColor: c.warningScale[50], fontSize: ty.fontSize.xs, color: c.warningScale[700] }}>
                      Counter: {ver.counterOffer}
                    </div>
                  )}
                </div>
              ))}
            </Section>
          )}
        </div>
      </Box>
    );
  },
});
