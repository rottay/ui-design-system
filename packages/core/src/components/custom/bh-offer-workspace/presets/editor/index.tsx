'use client';

/**
 * BhOfferWorkspace - Editor Preset
 * Full offer management workspace: compensation editing, benefits, approvals,
 * negotiation history, document management, and status pipeline tracker
 */

import {useState, useCallback, useMemo} from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle, createCardStyle, createHoverStyle, createSurfaceStyle, getHoverTransform,
} from '../../../helpers';
import type {
  BhOfferWorkspaceProps, CompensationData, ApprovalStep, OfferStatus,
} from '../../core';
import { getOfferStatusConfig, getOfferPipelineSteps, formatCurrency } from '../../core';
import {
  DollarSign, Gift, Truck, Briefcase, Shield, Clock,
  Check, X, ChevronRight, Edit3, Save, Send, FileText,
  Upload, PenTool, Eye, ArrowLeftRight, History,
  AlertCircle, User, MapPin, Calendar, TrendingUp, Award,
  BarChart3, ToggleLeft, ToggleRight,
} from 'lucide-react';

export const EditorBhOfferWorkspace = createPreset<BhOfferWorkspaceProps>({
  name: 'BhOfferWorkspace.Editor',
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
      candidateName, jobTitle, status, compensation, benefits,
      relocationPackage, employmentTerms, approvalSteps,
      negotiationHistory, documents, onSave, onSubmitApproval,
      onSendOffer, isEditing, onEditToggle, currentVersion,
      showNegotiationHistory, onHistoryToggle, showComparison,
      onComparisonToggle, signatureStatus, className, style,
    } = props;

    const [offerData, setOfferData] = useState<CompensationData>(compensation);
    const [localCurrentVersion] = useState(currentVersion);
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
    const statusCfg = getOfferStatusConfig(status);

    const secTitle: React.CSSProperties = {
      fontSize: ty.fontSize.lg, fontWeight: ty.fontWeight.semibold, letterSpacing: '-0.02em',
      color: n[900], margin: 0, display: 'flex', alignItems: 'center', gap: sp[2],
    };
    const lbl: React.CSSProperties = {
      fontSize: ty.fontSize.sm, fontWeight: ty.fontWeight.medium,
      color: n[600], marginBottom: sp[1],
    };
    const inp: React.CSSProperties = {
      width: '100%', padding: `${sp[2]}px ${sp[3]}px`, borderRadius: t.borderRadius.md,
      border: `${bdr} ${n[200]}`, fontSize: ty.fontSize.sm, color: n[900],
      backgroundColor: c.common.white, outline: 'none', transition: `border-color ${trans}`,
      boxSizing: 'border-box' as const,
    };
    const btnPri: React.CSSProperties = {
      ...hov, padding: `${sp[2]}px ${sp[4]}px`, borderRadius: t.borderRadius.md,
      backgroundColor: p[600], color: c.common.white, border: 'none',
      fontSize: ty.fontSize.sm, fontWeight: ty.fontWeight.semibold, fontFamily: 'inherit',
      cursor: 'pointer', transition: `all ${t.motion.hover}`,
      display: 'inline-flex', alignItems: 'center', gap: sp[2],
    };
    const btnSec: React.CSSProperties = {
      ...hov, padding: `${sp[2]}px ${sp[4]}px`, borderRadius: t.borderRadius.md,
      backgroundColor: c.common.white, color: n[700], border: `${bdr} ${n[200]}`,
      fontSize: ty.fontSize.sm, fontWeight: ty.fontWeight.medium, fontFamily: 'inherit',
      cursor: 'pointer', transition: `all ${t.motion.hover}`,
      display: 'inline-flex', alignItems: 'center', gap: sp[2],
    };
    const navItem = (active: boolean): React.CSSProperties => ({
      ...hov, padding: `${sp[2]}px ${sp[3]}px`, borderRadius: t.borderRadius.md,
      backgroundColor: active ? p[50] : 'transparent',
      color: active ? p[700] : n[600],
      fontWeight: active ? ty.fontWeight.semibold : ty.fontWeight.medium,
      fontSize: ty.fontSize.sm, cursor: 'pointer', transition: `all ${t.motion.hover}`,
      border: 'none', display: 'flex', alignItems: 'center', gap: sp[2],
      textAlign: 'left' as const, width: '100%',
    });
    const bigVal: React.CSSProperties = {
      fontSize: ty.fontSize.xl, fontWeight: ty.fontWeight.bold, color: n[900], margin: 0,
    };

    const handleCompChange = useCallback((field: keyof CompensationData, value: number | string) => {
      setOfferData((prev) => ({ ...prev, [field]: value }));
    }, []);
    const toggleEditing = () => { setLocalIsEditing(!localIsEditing); onEditToggle?.(); };
    const toggleHistory = () => { setLocalShowHistory(!localShowHistory); onHistoryToggle?.(); };
    const toggleComparison = () => { setLocalShowComparison(!localShowComparison); onComparisonToggle?.(); };

    /* Field helper: editable number or display */
    const Field = ({ label, field, value, suffix, fmt }: {
      label: string; field?: keyof CompensationData; value: number | string;
      suffix?: string; fmt?: (v: number) => string;
    }) => (
      <div style={card}>
        <label style={lbl}>{label}</label>
        {localIsEditing && field ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: sp[2] }}>
            <input type={typeof value === 'number' ? 'number' : 'text'} value={value}
              onChange={(e) => handleCompChange(field, typeof value === 'number' ? Number(e.target.value) : e.target.value)}
              style={{ ...inp, flex: 1 }} />
            {suffix && <span style={{ fontSize: ty.fontSize.sm, color: n[500] }}>{suffix}</span>}
          </div>
        ) : (
          <p style={bigVal}>{fmt ? fmt(value as number) : value}{suffix && !fmt ? suffix : ''}</p>
        )}
      </div>
    );

    const fmtC = (v: number) => formatCurrency(v, offerData.currency);

    /* ── Sections ─── */
    const sections = [
      { key: 'compensation', label: 'Compensation', icon: <DollarSign size={16} /> },
      { key: 'benefits', label: 'Benefits', icon: <Gift size={16} /> },
      { key: 'relocation', label: 'Relocation', icon: <Truck size={16} /> },
      { key: 'terms', label: 'Terms', icon: <Briefcase size={16} /> },
      { key: 'approval', label: 'Approval Chain', icon: <Shield size={16} /> },
      { key: 'documents', label: 'Documents', icon: <FileText size={16} /> },
      { key: 'pipeline', label: 'Status Pipeline', icon: <BarChart3 size={16} /> },
    ];

    const renderCompensation = () => {
      const pct = offerData.marketRangeMax > offerData.marketRangeMin
        ? Math.max(0, Math.min(100, ((offerData.baseSalary - offerData.marketRangeMin) / (offerData.marketRangeMax - offerData.marketRangeMin)) * 100))
        : 50;

      return (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[5] }}>
          <h3 style={secTitle}><DollarSign size={20} color={p[600]} />Compensation Package</h3>

          {/* Base Salary */}
          <div style={card}>
            <div style={{ marginBottom: sp[3] }}>
              <label style={lbl}>Base Salary ({offerData.currency})</label>
              {localIsEditing ? (
                <input type="number" value={offerData.baseSalary}
                  onChange={(e) => handleCompChange('baseSalary', Number(e.target.value))} style={inp} />
              ) : (
                <p style={{ fontSize: ty.fontSize['2xl'], fontWeight: ty.fontWeight.bold, color: n[900], margin: 0 }}>
                  {fmtC(offerData.baseSalary)}
                </p>
              )}
            </div>
            <div style={{ marginTop: sp[3] }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: ty.fontSize.xs, color: n[500], marginBottom: sp[1] }}>
                <span>Min: {fmtC(offerData.marketRangeMin)}</span>
                <span>Max: {fmtC(offerData.marketRangeMax)}</span>
              </div>
              <svg width="100%" height="32" viewBox="0 0 400 32" preserveAspectRatio="none" style={{ display: 'block' }}>
                <rect x="0" y="10" width="400" height="12" rx="6" fill={n[200]} />
                <rect x="0" y="10" width={pct * 4} height="12" rx="6" fill={p[400]} />
                <circle cx={pct * 4} cy="16" r="8" fill={p[600]} stroke={c.common.white} strokeWidth="3" />
                <text x={pct * 4} y="6" textAnchor="middle" fill={p[700]} fontSize="10" fontWeight={ty.fontWeight.semibold}>
                  {fmtC(offerData.baseSalary)}
                </text>
              </svg>
            </div>
          </div>

          {/* Bonus row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: sp[4] }}>
            <Field label="Signing Bonus" field="signingBonus" value={offerData.signingBonus} fmt={fmtC} />
            <Field label="Annual Bonus Target" field="annualBonusPercent" value={offerData.annualBonusPercent} suffix="%" />
          </div>

          {/* Commission */}
          {offerData.commissionStructure !== undefined && (
            <Field label="Commission Structure" field="commissionStructure"
              value={offerData.commissionStructure ?? 'Not configured'} />
          )}

          {/* Equity */}
          {(offerData.equityShares !== undefined || localIsEditing) && (
            <div style={card}>
              <h4 style={{ ...secTitle, fontSize: ty.fontSize.md, marginBottom: sp[3] }}>
                <Award size={18} color={p[600]} />Equity Package
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: sp[4] }}>
                <div>
                  <label style={lbl}>Shares</label>
                  {localIsEditing ? (
                    <input type="number" value={offerData.equityShares ?? 0}
                      onChange={(e) => handleCompChange('equityShares', Number(e.target.value))} style={inp} />
                  ) : (
                    <p style={{ fontSize: ty.fontSize.lg, fontWeight: ty.fontWeight.bold, color: n[900], margin: 0 }}>
                      {(offerData.equityShares ?? 0).toLocaleString()} shares
                    </p>
                  )}
                </div>
                <div>
                  <label style={lbl}>Vesting (years)</label>
                  {localIsEditing ? (
                    <input type="number" value={offerData.vestingYears ?? 4}
                      onChange={(e) => handleCompChange('vestingYears', Number(e.target.value))} style={inp} />
                  ) : (
                    <p style={{ fontSize: ty.fontSize.lg, fontWeight: ty.fontWeight.bold, color: n[900], margin: 0 }}>
                      {offerData.vestingYears ?? 4} years
                    </p>
                  )}
                </div>
              </div>
              {!localIsEditing && (offerData.equityShares ?? 0) > 0 && (() => {
                const yrs = offerData.vestingYears ?? 4;
                const sharesPer = Math.floor((offerData.equityShares ?? 0) / yrs);
                return (
                  <div style={{ marginTop: sp[4] }}>
                    <p style={{ fontSize: ty.fontSize.xs, color: n[500], margin: `0 0 ${sp[2]}px 0` }}>Vesting Schedule (1-year cliff)</p>
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
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      );
    };

    const renderBenefits = () => (
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[4] }}>
        <h3 style={secTitle}><Gift size={20} color={p[600]} />Benefits Package</h3>
        {benefits.map((cat, ci) => (
          <div key={ci} style={card}>
            <h4 style={{ fontSize: ty.fontSize.md, fontWeight: ty.fontWeight.semibold, color: n[800], margin: `0 0 ${sp[3]}px 0`, textTransform: 'capitalize' as const }}>{cat.category}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: sp[2] }}>
              {cat.items.map((item, ii) => {
                const sc = item.included ? c.successScale : n;
                return (
                  <div key={ii} style={{ ...hov, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: `${sp[3]}px`, borderRadius: t.borderRadius.md,
                    backgroundColor: item.included ? c.successScale[50] : n[50],
                    border: `${bdr} ${item.included ? c.successScale[200] : n[200]}` }}>
                    <span style={{ fontSize: ty.fontSize.sm, color: item.included ? c.successScale[800] : n[500], fontWeight: ty.fontWeight.medium }}>{item.name}</span>
                    {localIsEditing ? (
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                        {item.included ? <ToggleRight size={22} color={c.successScale[500]} /> : <ToggleLeft size={22} color={n[400]} />}
                      </button>
                    ) : item.included ? <Check size={16} color={c.successScale[600]} /> : <X size={16} color={n[400]} />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );

    const renderRelocation = () => {
      if (!relocationPackage && !localIsEditing) {
        return (
          <div style={card}>
            <h3 style={secTitle}><Truck size={20} color={p[600]} />Relocation Package</h3>
            <p style={{ fontSize: ty.fontSize.sm, color: n[500], margin: `${sp[3]}px 0 0 0` }}>No relocation package included in this offer.</p>
          </div>
        );
      }
      const relo = relocationPackage ?? { budget: 0, movingAllowance: 0, tempHousing: false };
      return (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[4] }}>
          <h3 style={secTitle}><Truck size={20} color={p[600]} />Relocation Package</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: sp[4] }}>
            <Field label="Relocation Budget" value={relo.budget} fmt={(v) => formatCurrency(v, compensation.currency)} />
            <Field label="Moving Allowance" value={relo.movingAllowance} fmt={(v) => formatCurrency(v, compensation.currency)} />
          </div>
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: ty.fontSize.md, fontWeight: ty.fontWeight.medium, color: n[800], margin: 0 }}>Temporary Housing</p>
                <p style={{ fontSize: ty.fontSize.xs, color: n[500], margin: `${sp[1]}px 0 0 0` }}>Cover housing for the first 90 days</p>
              </div>
              {localIsEditing ? (
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  {relo.tempHousing ? <ToggleRight size={26} color={c.successScale[500]} /> : <ToggleLeft size={26} color={n[400]} />}
                </button>
              ) : (
                <span style={createBadgeStyle(t, relo.tempHousing ? 'success' : 'secondary')}>{relo.tempHousing ? 'Included' : 'Not Included'}</span>
              )}
            </div>
          </div>
        </div>
      );
    };

    const renderTerms = () => {
      const arrColors: Record<string, 'primary' | 'success' | 'warning'> = { onsite: 'primary', remote: 'success', hybrid: 'warning' };
      const termFields = [
        { label: 'Start Date', icon: <Calendar size={16} color={c.infoScale[500]} />, value: employmentTerms.startDate, type: 'date' },
        { label: 'Probation Period', icon: <Clock size={16} color={c.warningScale[500]} />, value: employmentTerms.probationPeriod, type: 'text' },
        { label: 'Notice Period', icon: <AlertCircle size={16} color={c.errorScale[500]} />, value: employmentTerms.noticePeriod, type: 'text' },
      ];
      return (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[4] }}>
          <h3 style={secTitle}><Briefcase size={20} color={p[600]} />Employment Terms</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: sp[4] }}>
            {termFields.map((tf) => (
              <div key={tf.label} style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: sp[2], marginBottom: sp[2] }}>
                  {tf.icon}<label style={{ ...lbl, marginBottom: 0 }}>{tf.label}</label>
                </div>
                {localIsEditing ? (
                  <input type={tf.type} value={tf.value} style={inp} readOnly={!localIsEditing} />
                ) : (
                  <p style={{ fontSize: ty.fontSize.md, fontWeight: ty.fontWeight.semibold, color: n[900], margin: 0 }}>{tf.value}</p>
                )}
              </div>
            ))}
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: sp[2], marginBottom: sp[2] }}>
                <MapPin size={16} color={p[500]} /><label style={{ ...lbl, marginBottom: 0 }}>Work Arrangement</label>
              </div>
              {localIsEditing ? (
                <div style={{ display: 'flex', gap: sp[2] }}>
                  {(['onsite', 'remote', 'hybrid'] as const).map((arr) => (
                    <button key={arr} style={{
                      ...hov, flex: 1, padding: `${sp[2]}px`, borderRadius: t.borderRadius.md,
                      border: `${bdr} ${employmentTerms.workArrangement === arr ? p[300] : n[200]}`,
                      backgroundColor: employmentTerms.workArrangement === arr ? p[50] : c.common.white,
                      color: employmentTerms.workArrangement === arr ? p[700] : n[600],
                      fontSize: ty.fontSize.xs, fontWeight: ty.fontWeight.medium,
                      cursor: 'pointer', transition: `all ${t.motion.hover}`, textTransform: 'capitalize' as const,
                    }}>{arr}</button>
                  ))}
                </div>
              ) : (
                <span style={createBadgeStyle(t, arrColors[employmentTerms.workArrangement] ?? 'primary')}>{employmentTerms.workArrangement}</span>
              )}
            </div>
          </div>
        </div>
      );
    };

    const renderApproval = () => {
      const stepCfg = (s: ApprovalStep) => s.status === 'approved' ? { scale: c.successScale, icon: <Check size={14} color={c.common.white} />, badge: 'success' as const }
        : s.status === 'rejected' ? { scale: c.errorScale, icon: <X size={14} color={c.common.white} />, badge: 'error' as const }
        : { scale: c.warningScale, icon: <Clock size={14} color={c.common.white} />, badge: 'warning' as const };

      return (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[4] }}>
          <h3 style={secTitle}><Shield size={20} color={p[600]} />Approval Workflow</h3>
          <div style={card}>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[1] }}>
              {approvalStatus.map((step, idx) => {
                const cfg = stepCfg(step);
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: sp[3], padding: `${sp[3]}px 0` }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: cfg.scale[500], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{cfg.icon}</div>
                      {step.approverAvatar ? (
                        <img src={step.approverAvatar} alt={step.approverName} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' as const, border: `${bdr} ${cfg.scale[200]}` }} />
                      ) : (
                        <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: cfg.scale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: ty.fontSize.xs, fontWeight: ty.fontWeight.semibold, color: cfg.scale[700] }}>{step.approverName.charAt(0).toUpperCase()}</div>
                      )}
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: ty.fontSize.sm, fontWeight: ty.fontWeight.semibold, color: n[900], margin: 0 }}>{step.approverName}</p>
                        <p style={{ fontSize: ty.fontSize.xs, color: n[500], margin: 0 }}>{step.role}</p>
                      </div>
                      <span style={createBadgeStyle(t, cfg.badge)}>
                        {step.status === 'approved' ? 'Approved' : step.status === 'rejected' ? 'Rejected' : 'Pending'}
                        {step.date ? ` - ${step.date}` : ''}
                      </span>
                    </div>
                    {idx < approvalStatus.length - 1 && (
                      <div style={{ marginLeft: 18, width: 2, height: 20, backgroundColor: approvalStatus[idx + 1].status !== 'pending' ? c.successScale[300] : n[200], transition: `background-color ${trans}` }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    };

    const renderNegotiationHistory = () => {
      if (!localShowHistory || negotiationHistory.length === 0) return null;
      return (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[4] }}>
          <h3 style={secTitle}><History size={20} color={p[600]} />Negotiation History</h3>
          {negotiationHistory.map((ver, vi) => (
            <div key={vi} style={{ ...card, borderLeft: `3px solid ${p[400]}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: sp[2], marginBottom: sp[3] }}>
                <span style={createBadgeStyle(t, 'primary')}>v{ver.version}</span>
                <span style={{ fontSize: ty.fontSize.sm, color: n[500] }}>{ver.date}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[2] }}>
                {ver.changes.map((ch, ci) => (
                  <div key={ci} style={{ display: 'flex', alignItems: 'center', gap: sp[3], padding: `${sp[2]}px ${sp[3]}px`, borderRadius: t.borderRadius.md, backgroundColor: n[50] }}>
                    <span style={{ fontSize: ty.fontSize.sm, fontWeight: ty.fontWeight.medium, color: n[700], minWidth: 120 }}>{ch.field}</span>
                    <span style={{ fontSize: ty.fontSize.sm, color: c.errorScale[600], backgroundColor: c.errorScale[50], padding: `${sp[1]}px ${sp[2]}px`, borderRadius: t.borderRadius.sm, textDecoration: 'line-through' }}>{ch.oldValue}</span>
                    <ChevronRight size={14} color={n[400]} />
                    <span style={{ fontSize: ty.fontSize.sm, color: c.successScale[700], backgroundColor: c.successScale[50], padding: `${sp[1]}px ${sp[2]}px`, borderRadius: t.borderRadius.sm }}>{ch.newValue}</span>
                  </div>
                ))}
              </div>
              {ver.counterOffer && (
                <div style={{ marginTop: sp[3], padding: `${sp[2]}px ${sp[3]}px`, borderRadius: t.borderRadius.md, backgroundColor: c.warningScale[50], border: `${bdr} ${c.warningScale[200]}` }}>
                  <p style={{ fontSize: ty.fontSize.xs, fontWeight: ty.fontWeight.semibold, color: c.warningScale[700], margin: `0 0 ${sp[1]}px 0` }}>Counter-Offer</p>
                  <p style={{ fontSize: ty.fontSize.sm, color: c.warningScale[800], margin: 0 }}>{ver.counterOffer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    };

    const renderDocuments = () => {
      const docColor: Record<string, 'success' | 'warning' | 'secondary'> = { signed: 'success', pending: 'warning', draft: 'secondary' };
      const sigCard = (signed: boolean, label: string) => (
        <div style={{ padding: `${sp[3]}px`, borderRadius: t.borderRadius.md, backgroundColor: signed ? c.successScale[50] : n[50], border: `${bdr} ${signed ? c.successScale[200] : n[200]}` }}>
          <p style={{ fontSize: ty.fontSize.xs, color: n[500], margin: `0 0 ${sp[1]}px 0` }}>{label}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: sp[2] }}>
            {signed ? <Check size={16} color={c.successScale[600]} /> : <Clock size={16} color={n[400]} />}
            <span style={{ fontSize: ty.fontSize.sm, fontWeight: ty.fontWeight.semibold, color: signed ? c.successScale[700] : n[600] }}>{signed ? 'Signed' : 'Pending'}</span>
          </div>
        </div>
      );

      return (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[4] }}>
          <h3 style={secTitle}><FileText size={20} color={p[600]} />Documents</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: sp[3] }}>
            {localDocuments.map((doc, i) => (
              <div key={i} style={{ ...card, ...hov, cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: sp[2] }}>
                  <div style={{ width: 36, height: 36, borderRadius: t.borderRadius.md, backgroundColor: p[50], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={18} color={p[600]} />
                  </div>
                  <span style={createBadgeStyle(t, docColor[doc.status] ?? 'secondary')}>{doc.status}</span>
                </div>
                <p style={{ fontSize: ty.fontSize.sm, fontWeight: ty.fontWeight.semibold, color: n[900], margin: 0 }}>{doc.name}</p>
                {doc.uploadDate && <p style={{ fontSize: ty.fontSize.xs, color: n[500], margin: `${sp[1]}px 0 0 0` }}>Uploaded: {doc.uploadDate}</p>}
              </div>
            ))}
            {localIsEditing && (
              <div style={{ ...hov, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: sp[4], borderRadius: t.borderRadius.lg, border: `2px dashed ${n[200]}`, cursor: 'pointer', transition: `all ${t.motion.hover}`, minHeight: 100 }}>
                <Upload size={24} color={n[400]} />
                <p style={{ fontSize: ty.fontSize.sm, color: n[500], margin: `${sp[2]}px 0 0 0` }}>Upload Document</p>
              </div>
            )}
          </div>
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: sp[2], marginBottom: sp[3] }}>
              <PenTool size={18} color={p[600]} />
              <h4 style={{ fontSize: ty.fontSize.md, fontWeight: ty.fontWeight.semibold, color: n[900], margin: 0 }}>E-Signature Status</h4>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: sp[3] }}>
              {sigCard(localSignatureStatus.companySigned, 'Company Signature')}
              {sigCard(localSignatureStatus.candidateSigned, 'Candidate Signature')}
            </div>
            {localSignatureStatus.signedDate && <p style={{ fontSize: ty.fontSize.xs, color: n[500], margin: `${sp[2]}px 0 0 0` }}>Signed on: {localSignatureStatus.signedDate}</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: sp[2], padding: `${sp[3]}px`, borderRadius: t.borderRadius.md, backgroundColor: c.infoScale[50], border: `${bdr} ${c.infoScale[200]}` }}>
            <input type="checkbox" style={{ width: 18, height: 18, accentColor: p[600] }} />
            <span style={{ fontSize: ty.fontSize.sm, color: c.infoScale[800], fontWeight: ty.fontWeight.medium }}>Legal review completed</span>
          </div>
        </div>
      );
    };

    const renderPipeline = () => {
      const steps = getOfferPipelineSteps();
      const curIdx = steps.findIndex((s) => s.key === status);
      const declined = status === 'declined';
      const negotiating = status === 'negotiating';

      return (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[4] }}>
          <h3 style={secTitle}><BarChart3 size={20} color={p[600]} />Offer Status Pipeline</h3>
          <div style={{ ...card, padding: `${sp[5]}px ${sp[4]}px`, overflowX: 'auto' as const }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 500 }}>
              {steps.map((step, idx) => {
                const past = idx < curIdx, cur = idx === curIdx;
                let cc = n[300], lc = n[400];
                if (past) { cc = c.successScale[500]; lc = c.successScale[700]; }
                else if (cur && !declined) { cc = p[500]; lc = p[700]; }
                else if (declined && step.key === 'accepted') { cc = c.errorScale[500]; lc = c.errorScale[700]; }
                return (
                  <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: idx < steps.length - 1 ? 1 : 'none' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: sp[2] }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: cc, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: `all ${t.motion.hover}`, boxShadow: cur ? `0 0 0 4px ${p[100]}` : 'none' }}>
                        {past ? <Check size={14} color={c.common.white} /> : declined && step.key === 'accepted' ? <X size={14} color={c.common.white} /> : (
                          <span style={{ fontSize: ty.fontSize.xs, fontWeight: ty.fontWeight.bold, color: cur ? c.common.white : n[500] }}>{idx + 1}</span>
                        )}
                      </div>
                      <span style={{ fontSize: ty.fontSize.xs, fontWeight: cur ? ty.fontWeight.semibold : ty.fontWeight.medium, color: lc, whiteSpace: 'nowrap' as const }}>
                        {declined && step.key === 'accepted' ? 'Declined' : step.label}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div style={{ flex: 1, height: 2, marginTop: -20, backgroundColor: past ? c.successScale[300] : n[200], transition: `background-color ${trans}`, marginLeft: sp[2], marginRight: sp[2] }} />
                    )}
                  </div>
                );
              })}
            </div>
            {negotiating && (
              <div style={{ marginTop: sp[4], padding: `${sp[2]}px ${sp[3]}px`, borderRadius: t.borderRadius.md, backgroundColor: c.warningScale[50], border: `${bdr} ${c.warningScale[200]}`, display: 'flex', alignItems: 'center', gap: sp[2] }}>
                <TrendingUp size={16} color={c.warningScale[600]} />
                <span style={{ fontSize: ty.fontSize.sm, color: c.warningScale[700], fontWeight: ty.fontWeight.medium }}>Offer is currently in negotiation</span>
              </div>
            )}
          </div>
        </div>
      );
    };

    const sectionMap: Record<string, () => React.ReactNode> = {
      compensation: renderCompensation, benefits: renderBenefits,
      relocation: renderRelocation, terms: renderTerms,
      approval: renderApproval, documents: renderDocuments, pipeline: renderPipeline,
    };

    return (
      <Box className={className} style={{ ...surfMd, minHeight: '100%', backgroundColor: n[50], position: 'relative' as const, overflow: 'hidden', ...style }}>
        <style>{`@keyframes bhOfferPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }`}</style>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: sp[4], padding: sp[5] }}>
          {/* Header */}
          <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: sp[3] }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: sp[3], marginBottom: sp[2] }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: p[100], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={20} color={p[600]} />
                </div>
                <div>
                  <h2 style={{ fontSize: ty.fontSize.xl, fontWeight: ty.fontWeight.bold, color: n[900], margin: 0 }}>{candidateName}</h2>
                  <p style={{ fontSize: ty.fontSize.sm, color: n[500], margin: 0 }}>{jobTitle} &middot; Version {localCurrentVersion}</p>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: sp[2], flexWrap: 'wrap' as const }}>
              <span style={createBadgeStyle(t, statusCfg.color)}>{statusCfg.label}</span>
              <button onClick={toggleEditing} style={btnSec}>{localIsEditing ? <Eye size={14} /> : <Edit3 size={14} />}{localIsEditing ? 'Preview' : 'Edit'}</button>
              <button onClick={toggleHistory} style={btnSec}><History size={14} />History</button>
              <button onClick={toggleComparison} style={btnSec}><ArrowLeftRight size={14} />Compare</button>
              {status === 'draft' && <button onClick={onSubmitApproval} style={btnPri}><Shield size={14} />Submit for Approval</button>}
              {status === 'approved' && <button onClick={onSendOffer} style={btnPri}><Send size={14} />Send Offer</button>}
              {localIsEditing && <button onClick={onSave} style={btnPri}><Save size={14} />Save</button>}
            </div>
          </div>

          {/* Main layout */}
          <div style={{ display: 'flex', gap: sp[4], alignItems: 'flex-start' }}>
            <div style={{ ...card, padding: sp[3], display: 'flex', flexDirection: 'column' as const, gap: sp[1], minWidth: 200 }}>
              {sections.map((s) => (
                <button key={s.key} onClick={() => setActiveSection(s.key)} style={navItem(activeSection === s.key)}>
                  {s.icon}{s.label}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {(sectionMap[activeSection] ?? renderCompensation)()}
              {localShowHistory && negotiationHistory.length > 0 && activeSection !== 'pipeline' && (
                <div style={{ marginTop: sp[5] }}>{renderNegotiationHistory()}</div>
              )}
            </div>
          </div>
        </div>
      </Box>
    );
  },
});
