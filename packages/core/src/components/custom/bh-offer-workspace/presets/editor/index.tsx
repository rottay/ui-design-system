'use client';

/**
 * BhOfferWorkspace - Editor Preset
 * Full offer management workspace: compensation editing, benefits, approvals,
 * negotiation history, document management, and status pipeline tracker
 */

import {useState, useCallback, useMemo} from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createFilterPillStyle,
  createHoverStyle,
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
import type {
  BhOfferWorkspaceProps,
  CompensationData,
  BenefitCategory,
  ApprovalStep,
  NegotiationVersion,
  DocumentInfo,
  OfferStatus,
} from '../../core';
import { getOfferStatusConfig, getOfferPipelineSteps, formatCurrency } from '../../core';
import {
  DollarSign, Gift, Truck, Briefcase, Shield, Clock,
  Check, X, ChevronDown, ChevronUp, Edit3, Save,
  Send, FileText, Upload, PenTool, Eye, EyeOff,
  ArrowLeftRight, History, AlertCircle, User, MapPin,
  Building2, Calendar, TrendingUp, Award, BarChart3,
  Plus, Minus, ToggleLeft, ToggleRight, ChevronRight,
} from 'lucide-react';

/** Pipeline status ordering for comparison */
const STATUS_ORDER: OfferStatus[] = ['draft', 'pending_approval', 'approved', 'sent', 'viewed', 'accepted', 'declined'];

export const EditorBhOfferWorkspace = createPreset<BhOfferWorkspaceProps>({
  name: 'BhOfferWorkspace.Editor',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhOfferWorkspaceProps>) => {
    const { Box, Stack } = primitives;

    const {
      candidateName,
      jobTitle,
      status,
      compensation,
      benefits,
      relocationPackage,
      employmentTerms,
      approvalSteps,
      negotiationHistory,
      documents,
      onSave,
      onSubmitApproval,
      onSendOffer,
      isEditing,
      onEditToggle,
      currentVersion,
      showNegotiationHistory,
      onHistoryToggle,
      showComparison,
      onComparisonToggle,
      signatureStatus,
      className,
      style,
    } = props;

    /* ── Local State ─────────────────────────────────────────── */
    const [offerData, setOfferData] = useState<CompensationData>(compensation);
    const [localCurrentVersion] = useState(currentVersion);
    const [approvalStatus] = useState(approvalSteps);
    const [localShowHistory, setLocalShowHistory] = useState(showNegotiationHistory);
    const [activeSection, setActiveSection] = useState<string>('compensation');
    const [localDocuments] = useState<DocumentInfo[]>(documents);
    const [localIsEditing, setLocalIsEditing] = useState(isEditing);
    const [localShowComparison, setLocalShowComparison] = useState(showComparison);
    const [localSignatureStatus] = useState(signatureStatus);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;

    /* ── Styles ──────────────────────────────────────────────── */
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const surfaceMd = useMemo(() => createSurfaceStyle(tokens, { elevation: 'md', glass: isGlass }), [tokens, isGlass]);
    const hoverTransition = useMemo(() => createHoverStyle(tokens), [tokens]);
    const hoverLift = getHoverTransform(tokens);
    const statusConfig = getOfferStatusConfig(status);

    const containerStyle: React.CSSProperties = {
      ...surfaceMd,
      minHeight: '100%',
      backgroundColor: tokens.colors.neutral[50],
      position: 'relative' as const,
      overflow: 'hidden',
      ...style,
    };

    const sectionTitleStyle: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.lg,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[900],
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[2],
    };

    const labelStyle: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.medium,
      color: tokens.colors.neutral[600],
      marginBottom: tokens.spacing[1],
    };

    const inputStyle: React.CSSProperties = {
      width: '100%',
      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
      borderRadius: tokens.borderRadius.md,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
      fontSize: tokens.typography.fontSize.sm,
      color: tokens.colors.neutral[900],
      backgroundColor: tokens.colors.common.white,
      outline: 'none',
      transition: `border-color ${tokens.transitions?.fast || tokens.motion.hover}`,
      boxSizing: 'border-box' as const,
    };

    const readOnlyStyle: React.CSSProperties = {
      ...inputStyle,
      backgroundColor: tokens.colors.neutral[50],
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      cursor: 'default',
    };

    const buttonPrimaryStyle: React.CSSProperties = {
      ...hoverTransition,
      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
      borderRadius: tokens.borderRadius.md,
      backgroundColor: tokens.colors.primaryScale[600],
      color: tokens.colors.common.white,
      border: 'none',
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.semibold,
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing[2],
    };

    const buttonSecondaryStyle: React.CSSProperties = {
      ...hoverTransition,
      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
      borderRadius: tokens.borderRadius.md,
      backgroundColor: tokens.colors.common.white,
      color: tokens.colors.neutral[700],
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.medium,
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing[2],
    };

    const sectionNavItemStyle = (isActive: boolean): React.CSSProperties => ({
      ...hoverTransition,
      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
      borderRadius: tokens.borderRadius.md,
      backgroundColor: isActive ? tokens.colors.primaryScale[50] : 'transparent',
      color: isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
      fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
      fontSize: tokens.typography.fontSize.sm,
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[2],
      textAlign: 'left' as const,
      width: '100%',
    });

    const handleCompensationChange = useCallback((field: keyof CompensationData, value: number | string) => {
      setOfferData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const toggleEditing = () => {
      setLocalIsEditing(!localIsEditing);
      onEditToggle?.();
    };

    const toggleHistory = () => {
      setLocalShowHistory(!localShowHistory);
      onHistoryToggle?.();
    };

    const toggleComparison = () => {
      setLocalShowComparison(!localShowComparison);
      onComparisonToggle?.();
    };

    /* ── Header ──────────────────────────────────────────────── */
    const renderHeader = () => {
      const badgeStyle = useMemo(() => createBadgeStyle(tokens, statusConfig.color), [tokens]);

      return (
        <div style={{
          ...cardBase,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap' as const,
          gap: tokens.spacing[3],
        }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[2] }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.primaryScale[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <User size={20} color={tokens.colors.primaryScale[600]} />
              </div>
              <div>
                <h2 style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  margin: 0,
                }}>
                  {candidateName}
                </h2>
                <p style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                  margin: 0,
                }}>
                  {jobTitle} &middot; Version {localCurrentVersion}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flexWrap: 'wrap' as const }}>
            <span style={badgeStyle}>
              {statusConfig.label}
            </span>

            <button
              onClick={toggleEditing}
              style={buttonSecondaryStyle}
            >
              {localIsEditing ? <Eye size={14} /> : <Edit3 size={14} />}
              {localIsEditing ? 'Preview' : 'Edit'}
            </button>

            <button
              onClick={toggleHistory}
              style={buttonSecondaryStyle}
            >
              <History size={14} />
              History
            </button>

            <button
              onClick={toggleComparison}
              style={buttonSecondaryStyle}
            >
              <ArrowLeftRight size={14} />
              Compare
            </button>

            {status === 'draft' && (
              <button onClick={onSubmitApproval} style={buttonPrimaryStyle}>
                <Shield size={14} />
                Submit for Approval
              </button>
            )}

            {status === 'approved' && (
              <button onClick={onSendOffer} style={buttonPrimaryStyle}>
                <Send size={14} />
                Send Offer
              </button>
            )}

            {localIsEditing && (
              <button onClick={onSave} style={buttonPrimaryStyle}>
                <Save size={14} />
                Save
              </button>
            )}
          </div>
        </div>
      );
    };

    /* ── Section Navigation ──────────────────────────────────── */
    const sections = [
      { key: 'compensation', label: 'Compensation', icon: <DollarSign size={16} /> },
      { key: 'benefits', label: 'Benefits', icon: <Gift size={16} /> },
      { key: 'relocation', label: 'Relocation', icon: <Truck size={16} /> },
      { key: 'terms', label: 'Terms', icon: <Briefcase size={16} /> },
      { key: 'approval', label: 'Approval Chain', icon: <Shield size={16} /> },
      { key: 'documents', label: 'Documents', icon: <FileText size={16} /> },
      { key: 'pipeline', label: 'Status Pipeline', icon: <BarChart3 size={16} /> },
    ];

    const renderSectionNav = () => (
      <div style={{
        ...cardBase,
        padding: tokens.spacing[3],
        display: 'flex',
        flexDirection: 'column' as const,
        gap: tokens.spacing[1],
        minWidth: 200,
      }}>
        {sections.map((section) => (
          <button
            key={section.key}
            onClick={() => setActiveSection(section.key)}
            style={sectionNavItemStyle(activeSection === section.key)}
          >
            {section.icon}
            {section.label}
          </button>
        ))}
      </div>
    );

    /* ── Compensation Section ────────────────────────────────── */
    const renderCompensation = () => {
      const salaryPercent = offerData.marketRangeMax > offerData.marketRangeMin
        ? ((offerData.baseSalary - offerData.marketRangeMin) / (offerData.marketRangeMax - offerData.marketRangeMin)) * 100
        : 50;
      const clampedPercent = Math.max(0, Math.min(100, salaryPercent));

      return (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[5] }}>
          <h3 style={sectionTitleStyle}>
            <DollarSign size={20} color={tokens.colors.primaryScale[600]} />
            Compensation Package
          </h3>

          {/* Base Salary with Market Range */}
          <div style={cardBase}>
            <div style={{ marginBottom: tokens.spacing[3] }}>
              <label style={labelStyle}>Base Salary ({offerData.currency})</label>
              {localIsEditing ? (
                <input
                  type="number"
                  value={offerData.baseSalary}
                  onChange={(e) => handleCompensationChange('baseSalary', Number(e.target.value))}
                  style={inputStyle}
                />
              ) : (
                <p style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  margin: 0,
                }}>
                  {formatCurrency(offerData.baseSalary, offerData.currency)}
                </p>
              )}
            </div>

            {/* Market Range SVG Bar */}
            <div style={{ marginTop: tokens.spacing[3] }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}>
                <span>Min: {formatCurrency(offerData.marketRangeMin, offerData.currency)}</span>
                <span>Max: {formatCurrency(offerData.marketRangeMax, offerData.currency)}</span>
              </div>
              <svg width="100%" height="32" viewBox="0 0 400 32" preserveAspectRatio="none" style={{ display: 'block' }}>
                {/* Background track */}
                <rect x="0" y="10" width="400" height="12" rx="6" fill={tokens.colors.neutral[200]} />
                {/* Filled range */}
                <rect x="0" y="10" width={clampedPercent * 4} height="12" rx="6" fill={tokens.colors.primaryScale[400]} />
                {/* Indicator marker */}
                <circle
                  cx={clampedPercent * 4}
                  cy="16"
                  r="8"
                  fill={tokens.colors.primaryScale[600]}
                  stroke={tokens.colors.common.white}
                  strokeWidth="3"
                />
                {/* Labels on track */}
                <text
                  x={clampedPercent * 4}
                  y="6"
                  textAnchor="middle"
                  fill={tokens.colors.primaryScale[700]}
                  fontSize="10"
                  fontWeight={tokens.typography.fontWeight.semibold}
                >
                  {formatCurrency(offerData.baseSalary, offerData.currency)}
                </text>
              </svg>
            </div>
          </div>

          {/* Bonus and Signing */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4] }}>
            <div style={cardBase}>
              <label style={labelStyle}>Signing Bonus</label>
              {localIsEditing ? (
                <input
                  type="number"
                  value={offerData.signingBonus}
                  onChange={(e) => handleCompensationChange('signingBonus', Number(e.target.value))}
                  style={inputStyle}
                />
              ) : (
                <p style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  margin: 0,
                }}>
                  {formatCurrency(offerData.signingBonus, offerData.currency)}
                </p>
              )}
            </div>

            <div style={cardBase}>
              <label style={labelStyle}>Annual Bonus Target</label>
              {localIsEditing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <input
                    type="number"
                    value={offerData.annualBonusPercent}
                    onChange={(e) => handleCompensationChange('annualBonusPercent', Number(e.target.value))}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>%</span>
                </div>
              ) : (
                <p style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  margin: 0,
                }}>
                  {offerData.annualBonusPercent}%
                </p>
              )}
            </div>
          </div>

          {/* Commission */}
          {offerData.commissionStructure !== undefined && (
            <div style={cardBase}>
              <label style={labelStyle}>Commission Structure</label>
              {localIsEditing ? (
                <input
                  type="text"
                  value={offerData.commissionStructure ?? ''}
                  onChange={(e) => handleCompensationChange('commissionStructure', e.target.value)}
                  style={inputStyle}
                  placeholder="e.g., 10% of quarterly sales"
                />
              ) : (
                <p style={{
                  fontSize: tokens.typography.fontSize.md,
                  color: tokens.colors.neutral[700],
                  margin: 0,
                }}>
                  {offerData.commissionStructure || 'Not configured'}
                </p>
              )}
            </div>
          )}

          {/* Equity */}
          {(offerData.equityShares !== undefined || localIsEditing) && (
            <div style={cardBase}>
              <h4 style={{
                ...sectionTitleStyle,
                fontSize: tokens.typography.fontSize.md,
                marginBottom: tokens.spacing[3],
              }}>
                <Award size={18} color={tokens.colors.primaryScale[600]} />
                Equity Package
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4] }}>
                <div>
                  <label style={labelStyle}>Shares</label>
                  {localIsEditing ? (
                    <input
                      type="number"
                      value={offerData.equityShares ?? 0}
                      onChange={(e) => handleCompensationChange('equityShares', Number(e.target.value))}
                      style={inputStyle}
                    />
                  ) : (
                    <p style={{
                      fontSize: tokens.typography.fontSize.lg,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.neutral[900],
                      margin: 0,
                    }}>
                      {(offerData.equityShares ?? 0).toLocaleString()} shares
                    </p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Vesting (years)</label>
                  {localIsEditing ? (
                    <input
                      type="number"
                      value={offerData.vestingYears ?? 4}
                      onChange={(e) => handleCompensationChange('vestingYears', Number(e.target.value))}
                      style={inputStyle}
                    />
                  ) : (
                    <p style={{
                      fontSize: tokens.typography.fontSize.lg,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.neutral[900],
                      margin: 0,
                    }}>
                      {offerData.vestingYears ?? 4} years
                    </p>
                  )}
                </div>
              </div>

              {/* Vesting Timeline SVG */}
              {!localIsEditing && (offerData.equityShares ?? 0) > 0 && (
                <div style={{ marginTop: tokens.spacing[4] }}>
                  <p style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    marginBottom: tokens.spacing[2],
                    margin: `0 0 ${tokens.spacing[2]}px 0`,
                  }}>
                    Vesting Schedule (1-year cliff)
                  </p>
                  <svg width="100%" height="60" viewBox="0 0 400 60" preserveAspectRatio="none" style={{ display: 'block' }}>
                    {/* Timeline track */}
                    <line x1="20" y1="30" x2="380" y2="30" stroke={tokens.colors.neutral[200]} strokeWidth="3" strokeLinecap="round" />

                    {/* Cliff marker at year 1 */}
                    {Array.from({ length: offerData.vestingYears ?? 4 }, (_, i) => {
                      const yearCount = offerData.vestingYears ?? 4;
                      const xPos = 20 + ((i + 1) / yearCount) * 360;
                      const isCliff = i === 0;
                      const sharesPer = Math.floor((offerData.equityShares ?? 0) / yearCount);

                      return (
                        <g key={i}>
                          {/* Filled segment */}
                          <line
                            x1={20 + (i / yearCount) * 360}
                            y1="30"
                            x2={xPos}
                            y2="30"
                            stroke={tokens.colors.primaryScale[400]}
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                          {/* Year marker */}
                          <circle
                            cx={xPos}
                            cy="30"
                            r={isCliff ? 7 : 5}
                            fill={tokens.colors.primaryScale[isCliff ? 600 : 400]}
                            stroke={tokens.colors.common.white}
                            strokeWidth="2"
                          />
                          {/* Year label */}
                          <text
                            x={xPos}
                            y="52"
                            textAnchor="middle"
                            fill={tokens.colors.neutral[600]}
                            fontSize="9"
                          >
                            Y{i + 1}{isCliff ? ' (cliff)' : ''}
                          </text>
                          {/* Shares label */}
                          <text
                            x={xPos}
                            y="16"
                            textAnchor="middle"
                            fill={tokens.colors.primaryScale[700]}
                            fontSize="9"
                            fontWeight={tokens.typography.fontWeight.semibold}
                          >
                            {sharesPer.toLocaleString()}
                          </text>
                        </g>
                      );
                    })}

                    {/* Start dot */}
                    <circle cx="20" cy="30" r="4" fill={tokens.colors.neutral[400]} />
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>
      );
    };

    /* ── Benefits Section ────────────────────────────────────── */
    const renderBenefits = () => (
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
        <h3 style={sectionTitleStyle}>
          <Gift size={20} color={tokens.colors.primaryScale[600]} />
          Benefits Package
        </h3>
        {benefits.map((category, catIdx) => (
          <div key={catIdx} style={cardBase}>
            <h4 style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[800],
              margin: `0 0 ${tokens.spacing[3]}px 0`,
              textTransform: 'capitalize' as const,
            }}>
              {category.category}
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: tokens.spacing[2],
            }}>
              {category.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  style={{
                    ...hoverTransition,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: item.included
                      ? tokens.colors.successScale[50]
                      : tokens.colors.neutral[50],
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${item.included
                      ? tokens.colors.successScale[200]
                      : tokens.colors.neutral[200]}`,
                  }}
                >
                  <span style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: item.included
                      ? tokens.colors.successScale[800]
                      : tokens.colors.neutral[500],
                    fontWeight: tokens.typography.fontWeight.medium,
                  }}>
                    {item.name}
                  </span>
                  {localIsEditing ? (
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {item.included ? (
                        <ToggleRight size={22} color={tokens.colors.successScale[500]} />
                      ) : (
                        <ToggleLeft size={22} color={tokens.colors.neutral[400]} />
                      )}
                    </button>
                  ) : (
                    item.included ? (
                      <Check size={16} color={tokens.colors.successScale[600]} />
                    ) : (
                      <X size={16} color={tokens.colors.neutral[400]} />
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );

    /* ── Relocation Section ──────────────────────────────────── */
    const renderRelocation = () => {
      if (!relocationPackage && !localIsEditing) {
        return (
          <div style={cardBase}>
            <h3 style={sectionTitleStyle}>
              <Truck size={20} color={tokens.colors.primaryScale[600]} />
              Relocation Package
            </h3>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              marginTop: tokens.spacing[3],
              margin: `${tokens.spacing[3]}px 0 0 0`,
            }}>
              No relocation package included in this offer.
            </p>
          </div>
        );
      }

      const relo = relocationPackage ?? { budget: 0, movingAllowance: 0, tempHousing: false };

      return (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
          <h3 style={sectionTitleStyle}>
            <Truck size={20} color={tokens.colors.primaryScale[600]} />
            Relocation Package
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4] }}>
            <div style={cardBase}>
              <label style={labelStyle}>Relocation Budget</label>
              {localIsEditing ? (
                <input
                  type="number"
                  value={relo.budget}
                  style={inputStyle}
                  readOnly={!localIsEditing}
                />
              ) : (
                <p style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  margin: 0,
                }}>
                  {formatCurrency(relo.budget, compensation.currency)}
                </p>
              )}
            </div>
            <div style={cardBase}>
              <label style={labelStyle}>Moving Allowance</label>
              {localIsEditing ? (
                <input
                  type="number"
                  value={relo.movingAllowance}
                  style={inputStyle}
                  readOnly={!localIsEditing}
                />
              ) : (
                <p style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  margin: 0,
                }}>
                  {formatCurrency(relo.movingAllowance, compensation.currency)}
                </p>
              )}
            </div>
          </div>
          <div style={cardBase}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <p style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[800],
                  margin: 0,
                }}>
                  Temporary Housing
                </p>
                <p style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  margin: `${tokens.spacing[1]}px 0 0 0`,
                }}>
                  Cover housing for the first 90 days
                </p>
              </div>
              {localIsEditing ? (
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  {relo.tempHousing ? (
                    <ToggleRight size={26} color={tokens.colors.successScale[500]} />
                  ) : (
                    <ToggleLeft size={26} color={tokens.colors.neutral[400]} />
                  )}
                </button>
              ) : (
                <span style={createBadgeStyle(tokens, relo.tempHousing ? 'success' : 'secondary')}>
                  {relo.tempHousing ? 'Included' : 'Not Included'}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    };

    /* ── Employment Terms Section ─────────────────────────────── */
    const renderTerms = () => {
      const arrangementColors: Record<string, 'primary' | 'success' | 'warning'> = {
        onsite: 'primary',
        remote: 'success',
        hybrid: 'warning',
      };

      return (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
          <h3 style={sectionTitleStyle}>
            <Briefcase size={20} color={tokens.colors.primaryScale[600]} />
            Employment Terms
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.spacing[4] }}>
            {/* Start Date */}
            <div style={cardBase}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                <Calendar size={16} color={tokens.colors.infoScale[500]} />
                <label style={{ ...labelStyle, marginBottom: 0 }}>Start Date</label>
              </div>
              {localIsEditing ? (
                <input type="date" value={employmentTerms.startDate} style={inputStyle} readOnly={!localIsEditing} />
              ) : (
                <p style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  margin: 0,
                }}>
                  {employmentTerms.startDate}
                </p>
              )}
            </div>

            {/* Probation Period */}
            <div style={cardBase}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                <Clock size={16} color={tokens.colors.warningScale[500]} />
                <label style={{ ...labelStyle, marginBottom: 0 }}>Probation Period</label>
              </div>
              {localIsEditing ? (
                <input type="text" value={employmentTerms.probationPeriod} style={inputStyle} readOnly={!localIsEditing} />
              ) : (
                <p style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  margin: 0,
                }}>
                  {employmentTerms.probationPeriod}
                </p>
              )}
            </div>

            {/* Notice Period */}
            <div style={cardBase}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                <AlertCircle size={16} color={tokens.colors.errorScale[500]} />
                <label style={{ ...labelStyle, marginBottom: 0 }}>Notice Period</label>
              </div>
              {localIsEditing ? (
                <input type="text" value={employmentTerms.noticePeriod} style={inputStyle} readOnly={!localIsEditing} />
              ) : (
                <p style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  margin: 0,
                }}>
                  {employmentTerms.noticePeriod}
                </p>
              )}
            </div>

            {/* Work Arrangement */}
            <div style={cardBase}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                <MapPin size={16} color={tokens.colors.primaryScale[500]} />
                <label style={{ ...labelStyle, marginBottom: 0 }}>Work Arrangement</label>
              </div>
              {localIsEditing ? (
                <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
                  {(['onsite', 'remote', 'hybrid'] as const).map((arr) => (
                    <button
                      key={arr}
                      style={{
                        ...hoverTransition,
                        flex: 1,
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${employmentTerms.workArrangement === arr
                          ? tokens.colors.primaryScale[300]
                          : tokens.colors.neutral[200]}`,
                        backgroundColor: employmentTerms.workArrangement === arr
                          ? tokens.colors.primaryScale[50]
                          : tokens.colors.common.white,
                        color: employmentTerms.workArrangement === arr
                          ? tokens.colors.primaryScale[700]
                          : tokens.colors.neutral[600],
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        textTransform: 'capitalize' as const,
                      }}
                    >
                      {arr}
                    </button>
                  ))}
                </div>
              ) : (
                <span style={createBadgeStyle(tokens, arrangementColors[employmentTerms.workArrangement] ?? 'primary')}>
                  {employmentTerms.workArrangement}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    };

    /* ── Approval Workflow Section ────────────────────────────── */
    const renderApproval = () => {
      const getStepColor = (step: ApprovalStep) => {
        if (step.status === 'approved') return tokens.colors.successScale;
        if (step.status === 'rejected') return tokens.colors.errorScale;
        return tokens.colors.warningScale;
      };

      const getStepIcon = (step: ApprovalStep) => {
        if (step.status === 'approved') return <Check size={14} color={tokens.colors.common.white} />;
        if (step.status === 'rejected') return <X size={14} color={tokens.colors.common.white} />;
        return <Clock size={14} color={tokens.colors.common.white} />;
      };

      return (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
          <h3 style={sectionTitleStyle}>
            <Shield size={20} color={tokens.colors.primaryScale[600]} />
            Approval Workflow
          </h3>

          <div style={cardBase}>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
              {approvalStatus.map((step, idx) => {
                const scale = getStepColor(step);
                return (
                  <div key={idx}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[3],
                      padding: `${tokens.spacing[3]}px 0`,
                    }}>
                      {/* Approval circle */}
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: scale[500],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {getStepIcon(step)}
                      </div>

                      {/* Avatar */}
                      {step.approverAvatar ? (
                        <img
                          src={step.approverAvatar}
                          alt={step.approverName}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: tokens.borderRadius.full,
                            objectFit: 'cover' as const,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${scale[200]}`,
                          }}
                        />
                      ) : (
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: scale[100],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: scale[700],
                        }}>
                          {step.approverName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      {/* Info */}
                      <div style={{ flex: 1 }}>
                        <p style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[900],
                          margin: 0,
                        }}>
                          {step.approverName}
                        </p>
                        <p style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                          margin: 0,
                        }}>
                          {step.role}
                        </p>
                      </div>

                      {/* Status badge */}
                      <span style={createBadgeStyle(tokens,
                        step.status === 'approved' ? 'success'
                          : step.status === 'rejected' ? 'error'
                            : 'warning'
                      )}>
                        {step.status === 'approved' ? 'Approved' : step.status === 'rejected' ? 'Rejected' : 'Pending'}
                        {step.date ? ` - ${step.date}` : ''}
                      </span>
                    </div>

                    {/* Connecting line */}
                    {idx < approvalStatus.length - 1 && (
                      <div style={{
                        marginLeft: 18,
                        width: 2,
                        height: 20,
                        backgroundColor: approvalStatus[idx + 1].status !== 'pending'
                          ? tokens.colors.successScale[300]
                          : tokens.colors.neutral[200],
                        transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    };

    /* ── Negotiation History Section ──────────────────────────── */
    const renderNegotiationHistory = () => {
      if (!localShowHistory || negotiationHistory.length === 0) return null;

      return (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
          <h3 style={sectionTitleStyle}>
            <History size={20} color={tokens.colors.primaryScale[600]} />
            Negotiation History
          </h3>

          {negotiationHistory.map((version, vIdx) => (
            <div key={vIdx} style={{
              ...cardBase,
              borderLeft: `3px solid ${tokens.colors.primaryScale[400]}`,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: tokens.spacing[3],
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <span style={createBadgeStyle(tokens, 'primary')}>
                    v{version.version}
                  </span>
                  <span style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[500],
                  }}>
                    {version.date}
                  </span>
                </div>
              </div>

              {/* Changes diff */}
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                {version.changes.map((change, cIdx) => (
                  <div key={cIdx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[3],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.neutral[50],
                  }}>
                    <span style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[700],
                      minWidth: 120,
                    }}>
                      {change.field}
                    </span>
                    <span style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.errorScale[600],
                      backgroundColor: tokens.colors.errorScale[50],
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.sm,
                      textDecoration: 'line-through',
                    }}>
                      {change.oldValue}
                    </span>
                    <ChevronRight size={14} color={tokens.colors.neutral[400]} />
                    <span style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.successScale[700],
                      backgroundColor: tokens.colors.successScale[50],
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.sm,
                    }}>
                      {change.newValue}
                    </span>
                  </div>
                ))}
              </div>

              {/* Counter-offer note */}
              {version.counterOffer && (
                <div style={{
                  marginTop: tokens.spacing[3],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.warningScale[50],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
                }}>
                  <p style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.warningScale[700],
                    margin: `0 0 ${tokens.spacing[1]}px 0`,
                  }}>
                    Counter-Offer
                  </p>
                  <p style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.warningScale[800],
                    margin: 0,
                  }}>
                    {version.counterOffer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    };

    /* ── Documents Section ────────────────────────────────────── */
    const renderDocuments = () => {
      const docStatusColors: Record<string, 'success' | 'warning' | 'secondary'> = {
        signed: 'success',
        pending: 'warning',
        draft: 'secondary',
      };

      return (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
          <h3 style={sectionTitleStyle}>
            <FileText size={20} color={tokens.colors.primaryScale[600]} />
            Documents
          </h3>

          {/* Document cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: tokens.spacing[3],
          }}>
            {localDocuments.map((doc, idx) => (
              <div key={idx} style={{
                ...cardBase,
                ...hoverTransition,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: tokens.spacing[2],
                }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.primaryScale[50],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <FileText size={18} color={tokens.colors.primaryScale[600]} />
                  </div>
                  <span style={createBadgeStyle(tokens, docStatusColors[doc.status] ?? 'secondary')}>
                    {doc.status}
                  </span>
                </div>
                <p style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  margin: 0,
                }}>
                  {doc.name}
                </p>
                {doc.uploadDate && (
                  <p style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    margin: `${tokens.spacing[1]}px 0 0 0`,
                  }}>
                    Uploaded: {doc.uploadDate}
                  </p>
                )}
              </div>
            ))}

            {/* Upload area */}
            {localIsEditing && (
              <div style={{
                ...hoverTransition,
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                justifyContent: 'center',
                padding: tokens.spacing[4],
                borderRadius: tokens.borderRadius.lg,
                border: `2px dashed ${tokens.colors.neutral[300]}`,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                minHeight: 100,
              }}>
                <Upload size={24} color={tokens.colors.neutral[400]} />
                <p style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                  marginTop: tokens.spacing[2],
                  margin: `${tokens.spacing[2]}px 0 0 0`,
                }}>
                  Upload Document
                </p>
              </div>
            )}
          </div>

          {/* E-Signature Status */}
          <div style={cardBase}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              marginBottom: tokens.spacing[3],
            }}>
              <PenTool size={18} color={tokens.colors.primaryScale[600]} />
              <h4 style={{
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                margin: 0,
              }}>
                E-Signature Status
              </h4>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[3] }}>
              <div style={{
                padding: `${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: localSignatureStatus.companySigned
                  ? tokens.colors.successScale[50]
                  : tokens.colors.neutral[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${localSignatureStatus.companySigned
                  ? tokens.colors.successScale[200]
                  : tokens.colors.neutral[200]}`,
              }}>
                <p style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  margin: `0 0 ${tokens.spacing[1]}px 0`,
                }}>
                  Company Signature
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  {localSignatureStatus.companySigned
                    ? <Check size={16} color={tokens.colors.successScale[600]} />
                    : <Clock size={16} color={tokens.colors.neutral[400]} />}
                  <span style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: localSignatureStatus.companySigned
                      ? tokens.colors.successScale[700]
                      : tokens.colors.neutral[600],
                  }}>
                    {localSignatureStatus.companySigned ? 'Signed' : 'Pending'}
                  </span>
                </div>
              </div>
              <div style={{
                padding: `${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: localSignatureStatus.candidateSigned
                  ? tokens.colors.successScale[50]
                  : tokens.colors.neutral[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${localSignatureStatus.candidateSigned
                  ? tokens.colors.successScale[200]
                  : tokens.colors.neutral[200]}`,
              }}>
                <p style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  margin: `0 0 ${tokens.spacing[1]}px 0`,
                }}>
                  Candidate Signature
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  {localSignatureStatus.candidateSigned
                    ? <Check size={16} color={tokens.colors.successScale[600]} />
                    : <Clock size={16} color={tokens.colors.neutral[400]} />}
                  <span style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: localSignatureStatus.candidateSigned
                      ? tokens.colors.successScale[700]
                      : tokens.colors.neutral[600],
                  }}>
                    {localSignatureStatus.candidateSigned ? 'Signed' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
            {localSignatureStatus.signedDate && (
              <p style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[2],
                margin: `${tokens.spacing[2]}px 0 0 0`,
              }}>
                Signed on: {localSignatureStatus.signedDate}
              </p>
            )}
          </div>

          {/* Legal Review Checkbox */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[3]}px`,
            borderRadius: tokens.borderRadius.md,
            backgroundColor: tokens.colors.infoScale[50],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.infoScale[200]}`,
          }}>
            <input type="checkbox" style={{
              width: 18,
              height: 18,
              accentColor: tokens.colors.primaryScale[600],
            }} />
            <span style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.infoScale[800],
              fontWeight: tokens.typography.fontWeight.medium,
            }}>
              Legal review completed
            </span>
          </div>
        </div>
      );
    };

    /* ── Status Pipeline ─────────────────────────────────────── */
    const renderPipeline = () => {
      const pipelineSteps = getOfferPipelineSteps();
      const currentIdx = pipelineSteps.findIndex((s) => s.key === status);
      const isDeclined = status === 'declined';
      const isNegotiating = status === 'negotiating';

      return (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
          <h3 style={sectionTitleStyle}>
            <BarChart3 size={20} color={tokens.colors.primaryScale[600]} />
            Offer Status Pipeline
          </h3>

          <div style={{
            ...cardBase,
            padding: `${tokens.spacing[5]}px ${tokens.spacing[4]}px`,
            overflowX: 'auto' as const,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minWidth: 500,
            }}>
              {pipelineSteps.map((step, idx) => {
                const isPast = idx < currentIdx;
                const isCurrent = idx === currentIdx;
                const isFuture = idx > currentIdx;

                let circleColor = tokens.colors.neutral[300];
                let labelColor = tokens.colors.neutral[400];
                if (isPast) {
                  circleColor = tokens.colors.successScale[500];
                  labelColor = tokens.colors.successScale[700];
                } else if (isCurrent && !isDeclined) {
                  circleColor = tokens.colors.primaryScale[500];
                  labelColor = tokens.colors.primaryScale[700];
                } else if (isDeclined && step.key === 'accepted') {
                  circleColor = tokens.colors.errorScale[500];
                  labelColor = tokens.colors.errorScale[700];
                }

                return (
                  <div key={step.key} style={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: idx < pipelineSteps.length - 1 ? 1 : 'none',
                  }}>
                    {/* Step circle + label */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column' as const,
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                    }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: circleColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: `all ${tokens.motion.hover}`,
                        boxShadow: isCurrent ? `0 0 0 4px ${tokens.colors.primaryScale[100]}` : 'none',
                      }}>
                        {isPast ? (
                          <Check size={14} color={tokens.colors.common.white} />
                        ) : isDeclined && step.key === 'accepted' ? (
                          <X size={14} color={tokens.colors.common.white} />
                        ) : (
                          <span style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.bold,
                            color: isCurrent ? tokens.colors.common.white : tokens.colors.neutral[500],
                          }}>
                            {idx + 1}
                          </span>
                        )}
                      </div>
                      <span style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: isCurrent
                          ? tokens.typography.fontWeight.semibold
                          : tokens.typography.fontWeight.medium,
                        color: labelColor,
                        whiteSpace: 'nowrap' as const,
                      }}>
                        {isDeclined && step.key === 'accepted' ? 'Declined' : step.label}
                      </span>
                    </div>

                    {/* Connecting line */}
                    {idx < pipelineSteps.length - 1 && (
                      <div style={{
                        flex: 1,
                        height: 2,
                        marginTop: -20,
                        backgroundColor: isPast
                          ? tokens.colors.successScale[300]
                          : tokens.colors.neutral[200],
                        transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                        marginLeft: tokens.spacing[2],
                        marginRight: tokens.spacing[2],
                      }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Negotiating indicator */}
            {isNegotiating && (
              <div style={{
                marginTop: tokens.spacing[4],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.warningScale[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
              }}>
                <TrendingUp size={16} color={tokens.colors.warningScale[600]} />
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.warningScale[700],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}>
                  Offer is currently in negotiation
                </span>
              </div>
            )}
          </div>
        </div>
      );
    };

    /* ── Active Section Router ───────────────────────────────── */
    const renderActiveSection = () => {
      switch (activeSection) {
        case 'compensation':
          return renderCompensation();
        case 'benefits':
          return renderBenefits();
        case 'relocation':
          return renderRelocation();
        case 'terms':
          return renderTerms();
        case 'approval':
          return renderApproval();
        case 'documents':
          return renderDocuments();
        case 'pipeline':
          return renderPipeline();
        default:
          return renderCompensation();
      }
    };

    /* ── Main Render ─────────────────────────────────────────── */
    return (
      <Box className={className} style={containerStyle}>
        <style>{`
          @keyframes bhOfferPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        `}</style>

        <div style={{
          display: 'flex',
          flexDirection: 'column' as const,
          gap: tokens.spacing[4],
          padding: tokens.spacing[5],
        }}>
          {/* Header */}
          {renderHeader()}

          {/* Main Content Area */}
          <div style={{
            display: 'flex',
            gap: tokens.spacing[4],
            alignItems: 'flex-start',
          }}>
            {/* Section Navigation Sidebar */}
            {renderSectionNav()}

            {/* Active Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {renderActiveSection()}

              {/* Negotiation History (below main content when toggled) */}
              {localShowHistory && negotiationHistory.length > 0 && activeSection !== 'pipeline' && (
                <div style={{ marginTop: tokens.spacing[5] }}>
                  {renderNegotiationHistory()}
                </div>
              )}
            </div>
          </div>
        </div>
      </Box>
    );
  },
});
