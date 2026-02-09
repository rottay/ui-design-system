'use client';

/**
 * BhOfferWorkspace - Tracker Preset
 * Status tracking focused view: pipeline visualization, approval chain,
 * signature status, and timeline summary for offer management
 */

import {useState, useMemo} from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createHoverStyle,
  createPanelHeaderStyle,
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
import type {
  BhOfferWorkspaceProps,
  ApprovalStep,
  NegotiationVersion,
  DocumentInfo,
  OfferStatus,
} from '../../core';
import { getOfferStatusConfig, getOfferPipelineSteps, formatCurrency } from '../../core';
import {
  DollarSign, Shield, Clock, Check, X, Send, FileText,
  PenTool, Eye, History, User, TrendingUp, BarChart3,
  ChevronRight, ArrowRight, Calendar, AlertCircle,
  Award, Gift, Briefcase, ChevronDown, ChevronUp,
} from 'lucide-react';

export const TrackerBhOfferWorkspace = createPreset<BhOfferWorkspaceProps>({
  name: 'BhOfferWorkspace.Tracker',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhOfferWorkspaceProps>) => {
    const { Box, Stack } = primitives;

    const {
      candidateName,
      jobTitle,
      status,
      compensation,
      benefits,
      employmentTerms,
      approvalSteps,
      negotiationHistory,
      documents,
      onSendOffer,
      currentVersion,
      signatureStatus,
      className,
      style,
    } = props;

    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
      pipeline: true,
      approval: true,
      compensation: false,
      documents: false,
      history: false,
    });

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const surfaceMd = useMemo(() => createSurfaceStyle(tokens, { elevation: 'md', glass: isGlass }), [tokens, isGlass]);
    const hoverTransition = useMemo(() => createHoverStyle(tokens), [tokens]);
    const statusConfig = getOfferStatusConfig(status);

    const toggleSection = (key: string) => {
      setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const containerStyle: React.CSSProperties = {
      ...surfaceMd,
      minHeight: '100%',
      backgroundColor: tokens.colors.neutral[50],
      position: 'relative' as const,
      overflow: 'hidden',
      ...style,
    };

    const sectionHeaderStyle = (key: string): React.CSSProperties => ({
      ...hoverTransition,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
      borderRadius: tokens.borderRadius.md,
      backgroundColor: tokens.colors.common.white,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
    });

    const sectionTitleStyle: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.md,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[900],
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[2],
    };

    /* ── Header Card ─────────────────────────────────────────── */
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
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.primaryScale[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <User size={22} color={tokens.colors.primaryScale[600]} />
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
                {jobTitle} &middot; v{currentVersion}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <span style={badgeStyle}>{statusConfig.label}</span>

            {status === 'approved' && (
              <button
                onClick={onSendOffer}
                style={{
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
                }}
              >
                <Send size={14} />
                Send Offer
              </button>
            )}
          </div>
        </div>
      );
    };

    /* ── Summary Stats ───────────────────────────────────────── */
    const renderSummaryStats = () => {
      const totalComp = compensation.baseSalary + compensation.signingBonus +
        Math.round(compensation.baseSalary * (compensation.annualBonusPercent / 100));
      const approvedCount = approvalSteps.filter((s) => s.status === 'approved').length;
      const signedDocs = documents.filter((d) => d.status === 'signed').length;

      const stats = [
        {
          label: 'Total Compensation',
          value: formatCurrency(totalComp, compensation.currency),
          icon: <DollarSign size={18} />,
          color: tokens.colors.primaryScale,
        },
        {
          label: 'Approvals',
          value: `${approvedCount}/${approvalSteps.length}`,
          icon: <Shield size={18} />,
          color: approvedCount === approvalSteps.length ? tokens.colors.successScale : tokens.colors.warningScale,
        },
        {
          label: 'Documents',
          value: `${signedDocs}/${documents.length} signed`,
          icon: <FileText size={18} />,
          color: tokens.colors.infoScale,
        },
        {
          label: 'Signatures',
          value: signatureStatus.candidateSigned && signatureStatus.companySigned ? 'Complete' : 'Pending',
          icon: <PenTool size={18} />,
          color: signatureStatus.candidateSigned && signatureStatus.companySigned
            ? tokens.colors.successScale
            : tokens.colors.warningScale,
        },
      ];

      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: tokens.spacing[3],
        }}>
          {stats.map((stat, idx) => (
            <div key={idx} style={{
              ...cardBase,
              textAlign: 'center' as const,
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: stat.color[50],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                marginBottom: tokens.spacing[2],
                color: stat.color[600],
              }}>
                {stat.icon}
              </div>
              <p style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                margin: 0,
              }}>
                {stat.value}
              </p>
              <p style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                margin: `${tokens.spacing[1]}px 0 0 0`,
              }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      );
    };

    /* ── Pipeline Section ────────────────────────────────────── */
    const renderPipeline = () => {
      const pipelineSteps = getOfferPipelineSteps();
      const currentIdx = pipelineSteps.findIndex((s) => s.key === status);
      const isDeclined = status === 'declined';

      return (
        <div>
          <div onClick={() => toggleSection('pipeline')} style={sectionHeaderStyle('pipeline')}>
            <h3 style={sectionTitleStyle}>
              <BarChart3 size={18} color={tokens.colors.primaryScale[600]} />
              Status Pipeline
            </h3>
            {expandedSections.pipeline ? <ChevronUp size={18} color={tokens.colors.neutral[400]} /> : <ChevronDown size={18} color={tokens.colors.neutral[400]} />}
          </div>
          {expandedSections.pipeline && (
            <div style={{
              ...cardBase,
              marginTop: tokens.spacing[2],
              padding: `${tokens.spacing[5]}px ${tokens.spacing[4]}px`,
              overflowX: 'auto' as const,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minWidth: 480,
              }}>
                {pipelineSteps.map((step, idx) => {
                  const isPast = idx < currentIdx;
                  const isCurrent = idx === currentIdx;

                  let circleColor = tokens.colors.neutral[300];
                  let textColor = tokens.colors.neutral[400];
                  if (isPast) {
                    circleColor = tokens.colors.successScale[500];
                    textColor = tokens.colors.successScale[700];
                  } else if (isCurrent && !isDeclined) {
                    circleColor = tokens.colors.primaryScale[500];
                    textColor = tokens.colors.primaryScale[700];
                  } else if (isDeclined && step.key === 'accepted') {
                    circleColor = tokens.colors.errorScale[500];
                    textColor = tokens.colors.errorScale[700];
                  }

                  return (
                    <div key={step.key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      flex: idx < pipelineSteps.length - 1 ? 1 : 'none',
                    }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column' as const,
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                      }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: circleColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isCurrent ? `0 0 0 4px ${tokens.colors.primaryScale[100]}` : 'none',
                          transition: `all ${tokens.motion.hover}`,
                        }}>
                          {isPast ? (
                            <Check size={16} color={tokens.colors.common.white} />
                          ) : isDeclined && step.key === 'accepted' ? (
                            <X size={16} color={tokens.colors.common.white} />
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
                          fontWeight: isCurrent ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                          color: textColor,
                          whiteSpace: 'nowrap' as const,
                        }}>
                          {isDeclined && step.key === 'accepted' ? 'Declined' : step.label}
                        </span>
                      </div>
                      {idx < pipelineSteps.length - 1 && (
                        <div style={{
                          flex: 1,
                          height: 2,
                          marginTop: -20,
                          backgroundColor: isPast ? tokens.colors.successScale[300] : tokens.colors.neutral[200],
                          marginLeft: tokens.spacing[2],
                          marginRight: tokens.spacing[2],
                          transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    };

    /* ── Approval Chain Section ───────────────────────────────── */
    const renderApprovalChain = () => (
      <div>
        <div onClick={() => toggleSection('approval')} style={sectionHeaderStyle('approval')}>
          <h3 style={sectionTitleStyle}>
            <Shield size={18} color={tokens.colors.primaryScale[600]} />
            Approval Chain ({approvalSteps.filter((s) => s.status === 'approved').length}/{approvalSteps.length})
          </h3>
          {expandedSections.approval ? <ChevronUp size={18} color={tokens.colors.neutral[400]} /> : <ChevronDown size={18} color={tokens.colors.neutral[400]} />}
        </div>
        {expandedSections.approval && (
          <div style={{
            ...cardBase,
            marginTop: tokens.spacing[2],
          }}>
            {approvalSteps.map((step, idx) => {
              const statusColor = step.status === 'approved'
                ? tokens.colors.successScale
                : step.status === 'rejected'
                  ? tokens.colors.errorScale
                  : tokens.colors.warningScale;

              return (
                <div key={idx}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[3],
                    padding: `${tokens.spacing[3]}px 0`,
                  }}>
                    {/* Status circle */}
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: statusColor[500],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {step.status === 'approved'
                        ? <Check size={14} color={tokens.colors.common.white} />
                        : step.status === 'rejected'
                          ? <X size={14} color={tokens.colors.common.white} />
                          : <Clock size={14} color={tokens.colors.common.white} />}
                    </div>

                    {/* Avatar */}
                    {step.approverAvatar ? (
                      <img
                        src={step.approverAvatar}
                        alt={step.approverName}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: tokens.borderRadius.full,
                          objectFit: 'cover' as const,
                        }}
                      />
                    ) : (
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: statusColor[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: statusColor[700],
                      }}>
                        {step.approverName.charAt(0)}
                      </div>
                    )}

                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[800],
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

                    <span style={createBadgeStyle(tokens,
                      step.status === 'approved' ? 'success'
                        : step.status === 'rejected' ? 'error'
                          : 'warning'
                    )}>
                      {step.status}
                    </span>

                    {step.date && (
                      <span style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[400],
                      }}>
                        {step.date}
                      </span>
                    )}
                  </div>

                  {idx < approvalSteps.length - 1 && (
                    <div style={{
                      marginLeft: 16,
                      width: 2,
                      height: 16,
                      backgroundColor: approvalSteps[idx + 1].status !== 'pending'
                        ? tokens.colors.successScale[300]
                        : tokens.colors.neutral[200],
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );

    /* ── Compensation Summary ────────────────────────────────── */
    const renderCompensationSummary = () => (
      <div>
        <div onClick={() => toggleSection('compensation')} style={sectionHeaderStyle('compensation')}>
          <h3 style={sectionTitleStyle}>
            <DollarSign size={18} color={tokens.colors.primaryScale[600]} />
            Compensation Summary
          </h3>
          {expandedSections.compensation ? <ChevronUp size={18} color={tokens.colors.neutral[400]} /> : <ChevronDown size={18} color={tokens.colors.neutral[400]} />}
        </div>
        {expandedSections.compensation && (
          <div style={{
            ...cardBase,
            marginTop: tokens.spacing[2],
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: tokens.spacing[3],
            }}>
              {[
                { label: 'Base Salary', value: formatCurrency(compensation.baseSalary, compensation.currency) },
                { label: 'Signing Bonus', value: formatCurrency(compensation.signingBonus, compensation.currency) },
                { label: 'Annual Bonus', value: `${compensation.annualBonusPercent}%` },
                { label: 'Equity', value: compensation.equityShares ? `${compensation.equityShares.toLocaleString()} shares` : 'N/A' },
              ].map((item, idx) => (
                <div key={idx} style={{
                  padding: `${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.neutral[50],
                }}>
                  <p style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    margin: `0 0 ${tokens.spacing[1]}px 0`,
                  }}>
                    {item.label}
                  </p>
                  <p style={{
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                    margin: 0,
                  }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Terms row */}
            <div style={{
              marginTop: tokens.spacing[3],
              display: 'flex',
              gap: tokens.spacing[3],
              flexWrap: 'wrap' as const,
            }}>
              <span style={createBadgeStyle(tokens, 'info')}>
                <Calendar size={12} style={{ marginRight: tokens.spacing[1] }} />
                Start: {employmentTerms.startDate}
              </span>
              <span style={createBadgeStyle(tokens, 'secondary')}>
                <Briefcase size={12} style={{ marginRight: tokens.spacing[1] }} />
                {employmentTerms.workArrangement}
              </span>
              <span style={createBadgeStyle(tokens, 'warning')}>
                <Clock size={12} style={{ marginRight: tokens.spacing[1] }} />
                Probation: {employmentTerms.probationPeriod}
              </span>
            </div>
          </div>
        )}
      </div>
    );

    /* ── Documents Summary ───────────────────────────────────── */
    const renderDocumentsSummary = () => (
      <div>
        <div onClick={() => toggleSection('documents')} style={sectionHeaderStyle('documents')}>
          <h3 style={sectionTitleStyle}>
            <FileText size={18} color={tokens.colors.primaryScale[600]} />
            Documents ({documents.filter((d) => d.status === 'signed').length}/{documents.length})
          </h3>
          {expandedSections.documents ? <ChevronUp size={18} color={tokens.colors.neutral[400]} /> : <ChevronDown size={18} color={tokens.colors.neutral[400]} />}
        </div>
        {expandedSections.documents && (
          <div style={{
            ...cardBase,
            marginTop: tokens.spacing[2],
          }}>
            {documents.map((doc, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `${tokens.spacing[2]}px 0`,
                borderBottom: idx < documents.length - 1
                  ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
                  : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <FileText size={16} color={tokens.colors.neutral[400]} />
                  <span style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[800],
                  }}>
                    {doc.name}
                  </span>
                </div>
                <span style={createBadgeStyle(tokens,
                  doc.status === 'signed' ? 'success'
                    : doc.status === 'pending' ? 'warning'
                      : 'secondary'
                )}>
                  {doc.status}
                </span>
              </div>
            ))}

            {/* Signature summary */}
            <div style={{
              marginTop: tokens.spacing[3],
              padding: `${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: signatureStatus.candidateSigned && signatureStatus.companySigned
                ? tokens.colors.successScale[50]
                : tokens.colors.neutral[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${signatureStatus.candidateSigned && signatureStatus.companySigned
                ? tokens.colors.successScale[200]
                : tokens.colors.neutral[200]}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <PenTool size={16} color={
                  signatureStatus.candidateSigned && signatureStatus.companySigned
                    ? tokens.colors.successScale[600]
                    : tokens.colors.neutral[400]
                } />
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[700],
                }}>
                  E-Signatures
                </span>
              </div>
              <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
                <span style={createBadgeStyle(tokens, signatureStatus.companySigned ? 'success' : 'secondary')}>
                  Company {signatureStatus.companySigned ? 'Signed' : 'Pending'}
                </span>
                <span style={createBadgeStyle(tokens, signatureStatus.candidateSigned ? 'success' : 'secondary')}>
                  Candidate {signatureStatus.candidateSigned ? 'Signed' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );

    /* ── Negotiation History Summary ─────────────────────────── */
    const renderHistorySummary = () => {
      if (negotiationHistory.length === 0) return null;

      return (
        <div>
          <div onClick={() => toggleSection('history')} style={sectionHeaderStyle('history')}>
            <h3 style={sectionTitleStyle}>
              <History size={18} color={tokens.colors.primaryScale[600]} />
              Negotiation History ({negotiationHistory.length} versions)
            </h3>
            {expandedSections.history ? <ChevronUp size={18} color={tokens.colors.neutral[400]} /> : <ChevronDown size={18} color={tokens.colors.neutral[400]} />}
          </div>
          {expandedSections.history && (
            <div style={{
              ...cardBase,
              marginTop: tokens.spacing[2],
            }}>
              {negotiationHistory.map((version, vIdx) => (
                <div key={vIdx} style={{
                  padding: `${tokens.spacing[3]}px 0`,
                  borderBottom: vIdx < negotiationHistory.length - 1
                    ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
                    : 'none',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: tokens.spacing[2],
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <span style={createBadgeStyle(tokens, 'primary')}>v{version.version}</span>
                      <span style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}>
                        {version.date}
                      </span>
                    </div>
                    <span style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[400],
                    }}>
                      {version.changes.length} change{version.changes.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {version.changes.map((change, cIdx) => (
                    <div key={cIdx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      fontSize: tokens.typography.fontSize.xs,
                      padding: `${tokens.spacing[1]}px 0`,
                    }}>
                      <span style={{
                        color: tokens.colors.neutral[600],
                        minWidth: 80,
                        fontWeight: tokens.typography.fontWeight.medium,
                      }}>
                        {change.field}
                      </span>
                      <span style={{
                        color: tokens.colors.errorScale[600],
                        textDecoration: 'line-through',
                      }}>
                        {change.oldValue}
                      </span>
                      <ArrowRight size={12} color={tokens.colors.neutral[400]} />
                      <span style={{ color: tokens.colors.successScale[700] }}>
                        {change.newValue}
                      </span>
                    </div>
                  ))}

                  {version.counterOffer && (
                    <div style={{
                      marginTop: tokens.spacing[2],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.sm,
                      backgroundColor: tokens.colors.warningScale[50],
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.warningScale[700],
                    }}>
                      Counter: {version.counterOffer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };

    /* ── Main Render ─────────────────────────────────────────── */
    return (
      <Box className={className} style={containerStyle}>
        <div style={{
          display: 'flex',
          flexDirection: 'column' as const,
          gap: tokens.spacing[4],
          padding: tokens.spacing[5],
        }}>
          {renderHeader()}
          {renderSummaryStats()}
          {renderPipeline()}
          {renderApprovalChain()}
          {renderCompensationSummary()}
          {renderDocumentsSummary()}
          {renderHistorySummary()}
        </div>
      </Box>
    );
  },
});
