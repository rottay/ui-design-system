'use client';

/**
 * PlPrivacyManager - Panel Preset
 * GDPR/Privacy compliance panel with consent management, data requests,
 * privacy score indicator, and action buttons.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
  createProgressBarStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  PlPrivacyManagerProps,
  ConsentRecord,
  ConsentStatus,
  DataCategory,
  DataRequest,
  DataRequestType,
  DataRequestStatus,
  LegalBasis,
} from '../../core';
import { PL_PRIVACY_MANAGER_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Trash2,
  Download,
  Edit,
  Lock,
  Unlock,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  User,
  Heart,
  BarChart3,
  Cpu,
  DollarSign,
  Info,
  ExternalLink,
  Scale,
} from 'lucide-react';

// ─── Category Config ────────────────────────────────────────────────────────

interface CategoryConfig {
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
}

function getCategoryConfig(category: DataCategory, tokens: DesignTokens): CategoryConfig {
  const iconSize = 16;
  switch (category) {
    case 'personal':
      return {
        label: 'Personal Data',
        icon: <User size={iconSize} />,
        color: tokens.colors.primaryScale[700],
        bgColor: tokens.colors.primaryScale[100],
        description: 'Name, email, address, and other identifying information',
      };
    case 'financial':
      return {
        label: 'Financial Data',
        icon: <DollarSign size={iconSize} />,
        color: tokens.colors.warningScale[700],
        bgColor: tokens.colors.warningScale[100],
        description: 'Payment methods, transaction history, and billing information',
      };
    case 'health':
      return {
        label: 'Health Data',
        icon: <Heart size={iconSize} />,
        color: tokens.colors.errorScale[700],
        bgColor: tokens.colors.errorScale[100],
        description: 'Health records, fitness data, and medical information',
      };
    case 'behavioral':
      return {
        label: 'Behavioral Data',
        icon: <BarChart3 size={iconSize} />,
        color: tokens.colors.infoScale[700],
        bgColor: tokens.colors.infoScale[100],
        description: 'Usage patterns, preferences, and interaction history',
      };
    case 'technical':
      return {
        label: 'Technical Data',
        icon: <Cpu size={iconSize} />,
        color: tokens.colors.secondaryScale[700],
        bgColor: tokens.colors.secondaryScale[100],
        description: 'Device info, IP addresses, and browser data',
      };
  }
}

// ─── Status Config ──────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  dotColor: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

function getConsentStatusConfig(status: ConsentStatus, tokens: DesignTokens): StatusConfig {
  switch (status) {
    case 'granted':
      return {
        label: 'Granted',
        dotColor: tokens.colors.successScale[500],
        bgColor: tokens.colors.successScale[50],
        textColor: tokens.colors.successScale[700],
        borderColor: tokens.colors.successScale[200],
      };
    case 'denied':
      return {
        label: 'Denied',
        dotColor: tokens.colors.errorScale[500],
        bgColor: tokens.colors.errorScale[50],
        textColor: tokens.colors.errorScale[700],
        borderColor: tokens.colors.errorScale[200],
      };
    case 'pending':
      return {
        label: 'Pending',
        dotColor: tokens.colors.warningScale[500],
        bgColor: tokens.colors.warningScale[50],
        textColor: tokens.colors.warningScale[700],
        borderColor: tokens.colors.warningScale[200],
      };
    case 'expired':
      return {
        label: 'Expired',
        dotColor: tokens.colors.neutral[400],
        bgColor: tokens.colors.neutral[50],
        textColor: tokens.colors.neutral[600],
        borderColor: tokens.colors.neutral[200],
      };
  }
}

// ─── Request Type Config ────────────────────────────────────────────────────

function getRequestTypeConfig(type: DataRequestType, tokens: DesignTokens): {
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
} {
  const iconSize = 16;
  switch (type) {
    case 'access':
      return {
        label: 'Data Access',
        icon: <Eye size={iconSize} />,
        color: tokens.colors.infoScale[700],
        bgColor: tokens.colors.infoScale[100],
      };
    case 'deletion':
      return {
        label: 'Data Deletion',
        icon: <Trash2 size={iconSize} />,
        color: tokens.colors.errorScale[700],
        bgColor: tokens.colors.errorScale[100],
      };
    case 'portability':
      return {
        label: 'Data Portability',
        icon: <Download size={iconSize} />,
        color: tokens.colors.primaryScale[700],
        bgColor: tokens.colors.primaryScale[100],
      };
    case 'rectification':
      return {
        label: 'Rectification',
        icon: <Edit size={iconSize} />,
        color: tokens.colors.warningScale[700],
        bgColor: tokens.colors.warningScale[100],
      };
  }
}

// ─── Request Status Config ──────────────────────────────────────────────────

function getRequestStatusConfig(status: DataRequestStatus, tokens: DesignTokens): StatusConfig {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending',
        dotColor: tokens.colors.warningScale[500],
        bgColor: tokens.colors.warningScale[50],
        textColor: tokens.colors.warningScale[700],
        borderColor: tokens.colors.warningScale[200],
      };
    case 'processing':
      return {
        label: 'Processing',
        dotColor: tokens.colors.infoScale[500],
        bgColor: tokens.colors.infoScale[50],
        textColor: tokens.colors.infoScale[700],
        borderColor: tokens.colors.infoScale[200],
      };
    case 'completed':
      return {
        label: 'Completed',
        dotColor: tokens.colors.successScale[500],
        bgColor: tokens.colors.successScale[50],
        textColor: tokens.colors.successScale[700],
        borderColor: tokens.colors.successScale[200],
      };
    case 'rejected':
      return {
        label: 'Rejected',
        dotColor: tokens.colors.errorScale[500],
        bgColor: tokens.colors.errorScale[50],
        textColor: tokens.colors.errorScale[700],
        borderColor: tokens.colors.errorScale[200],
      };
  }
}

// ─── Legal Basis Label ──────────────────────────────────────────────────────

function getLegalBasisLabel(basis: LegalBasis): string {
  switch (basis) {
    case 'consent': return 'Consent';
    case 'contract': return 'Contract';
    case 'legal_obligation': return 'Legal Obligation';
    case 'legitimate_interest': return 'Legitimate Interest';
  }
}

// ─── Expiry Helper ──────────────────────────────────────────────────────────

function isExpiringSoon(expiresAt?: Date): boolean {
  if (!expiresAt) return false;
  const now = Date.now();
  const expiryTime = expiresAt.getTime();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  return expiryTime > now && expiryTime - now < thirtyDaysMs;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ─── Panel Preset ───────────────────────────────────────────────────────────

export const PanelPlPrivacyManager = createPreset<PlPrivacyManagerProps>({
  name: 'PlPrivacyManager.Panel',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlPrivacyManagerProps>) => {
    const { Box, Stack, Spinner } = primitives;
    const isModern = tokens.surface.useGlass;

    const {
      consents,
      dataRequests: rawDataRequests = [],
      stats,
      onConsentToggle,
      onRequestAccess,
      onRequestDeletion,
      onExportData,
      onCreateDataRequest,
      onDownloadReport,
      loading = false,
      emptyText = PL_PRIVACY_MANAGER_DEFAULTS.emptyText,
      className,
      style,
    } = props;

    const dataRequests = Array.isArray(rawDataRequests) ? rawDataRequests : [];

    // ─── Internal State ─────────────────────────────────────────────────

    const [expandedConsents, setExpandedConsents] = useState<Set<string>>(new Set());
    const [hoveredConsentId, setHoveredConsentId] = useState<string | null>(null);
    const [hoveredRequestId, setHoveredRequestId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'consents' | 'requests'>('consents');

    // ─── Computed Values ────────────────────────────────────────────────

    const privacyScore = useMemo(() => {
      if (stats?.complianceScore !== undefined) return stats.complianceScore;
      if (consents.length === 0) return 0;
      const granted = consents.filter(c => c.status === 'granted').length;
      return Math.round((granted / consents.length) * 100);
    }, [consents, stats]);

    const consentStats = useMemo(() => {
      const total = consents.length;
      const granted = consents.filter(c => c.status === 'granted').length;
      const pending = consents.filter(c => c.status === 'pending').length;
      const expiringSoon = consents.filter(c => isExpiringSoon(c.expiresAt)).length;
      return { total, granted, pending, expiringSoon };
    }, [consents]);

    const groupedConsents = useMemo(() => {
      const groups = new Map<DataCategory, ConsentRecord[]>();
      consents.forEach(consent => {
        const existing = groups.get(consent.category) || [];
        groups.set(consent.category, [...existing, consent]);
      });
      const categoryOrder: DataCategory[] = ['personal', 'financial', 'health', 'behavioral', 'technical'];
      const result: Array<{ category: DataCategory; consents: ConsentRecord[] }> = [];
      categoryOrder.forEach(cat => {
        const items = groups.get(cat);
        if (items && items.length > 0) {
          result.push({ category: cat, consents: items });
        }
      });
      return result;
    }, [consents]);

    // ─── Handlers ───────────────────────────────────────────────────────

    const toggleExpanded = useCallback((consentId: string) => {
      setExpandedConsents(prev => {
        const next = new Set(prev);
        if (next.has(consentId)) {
          next.delete(consentId);
        } else {
          next.add(consentId);
        }
        return next;
      });
    }, []);

    const handleConsentToggle = useCallback((consentId: string, currentStatus: ConsentStatus) => {
      const newGranted = currentStatus !== 'granted';
      onConsentToggle?.(consentId, newGranted);
    }, [onConsentToggle]);

    // ─── Glass Style ────────────────────────────────────────────────────

    const glassCardStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blur,
      WebkitBackdropFilter: tokens.glass.blur,
      backgroundColor: tokens.glass.bg,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
    } : {};

    // ─── Score Color ────────────────────────────────────────────────────

    const getScoreColor = (score: number) => {
      if (score >= 80) return tokens.colors.successScale[500];
      if (score >= 60) return tokens.colors.warningScale[500];
      return tokens.colors.errorScale[500];
    };

    const getScoreBg = (score: number) => {
      if (score >= 80) return tokens.colors.successScale[50];
      if (score >= 60) return tokens.colors.warningScale[50];
      return tokens.colors.errorScale[50];
    };

    const getScoreLabel = (score: number) => {
      if (score >= 80) return 'Excellent';
      if (score >= 60) return 'Good';
      if (score >= 40) return 'Fair';
      return 'Needs Attention';
    };

    // ─── Loading State ──────────────────────────────────────────────────

    if (loading) {
      return (
        <div
          className={className}
          style={{
            padding: tokens.spacing[6],
            backgroundColor: tokens.colors.neutral[50],
            minHeight: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'inherit',
            ...style,
          }}
        >
          <Spinner size="lg" />
        </div>
      );
    }

    // ─── Render: Header ─────────────────────────────────────────────────

    const renderHeader = () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: tokens.spacing[6],
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: tokens.borderRadius.lg,
            backgroundColor: tokens.colors.primaryScale[50],
            color: tokens.colors.primaryScale[600],
          }}>
            <Shield size={24} />
          </div>
          <div>
            <h1 style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              margin: 0,
              lineHeight: tokens.typography.lineHeight.tight,
            }}>
              Privacy Manager
            </h1>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              margin: 0,
              marginTop: tokens.spacing[1],
            }}>
              Manage your consent preferences and data rights
            </p>
          </div>
        </div>
        {onDownloadReport && (
          <button
            onClick={onDownloadReport}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              backgroundColor: tokens.colors.common.white,
              color: tokens.colors.neutral[700],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
            }}
          >
            <FileText size={16} />
            Privacy Report
          </button>
        )}
      </div>
    );

    // ─── Render: Privacy Score ───────────────────────────────────────────

    const renderPrivacyScore = () => {
      const scoreColor = getScoreColor(privacyScore);
      const scoreBg = getScoreBg(privacyScore);
      const scoreLabel = getScoreLabel(privacyScore);
      const progressStyle = createProgressBarStyle(tokens, {
        color: scoreColor,
        percent: privacyScore,
      });

      return (
        <div style={{
          ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
          marginBottom: tokens.spacing[4],
          ...(isModern ? glassCardStyle : {}),
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[5],
          }}>
            {/* Circular score indicator */}
            <div style={{
              position: 'relative' as const,
              width: 80,
              height: 80,
              flexShrink: 0,
            }}>
              <svg width={80} height={80} viewBox="0 0 80 80">
                {/* Track */}
                <circle
                  cx={40}
                  cy={40}
                  r={34}
                  fill="none"
                  stroke={tokens.colors.neutral[100]}
                  strokeWidth={8}
                />
                {/* Fill */}
                <circle
                  cx={40}
                  cy={40}
                  r={34}
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth={8}
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - privacyScore / 100)}`}
                  transform="rotate(-90 40 40)"
                  style={{ transition: `stroke-dashoffset ${tokens.motion.hover}` }}
                />
              </svg>
              <div style={{
                position: 'absolute' as const,
                inset: 0,
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: scoreColor,
                  lineHeight: 1,
                }}>
                  {privacyScore}
                </span>
                <span style={{
                  fontSize: '9px',
                  color: tokens.colors.neutral[500],
                  fontWeight: tokens.typography.fontWeight.medium,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                }}>
                  score
                </span>
              </div>
            </div>

            {/* Score details */}
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                marginBottom: tokens.spacing[2],
              }}>
                <span style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                }}>
                  Privacy Health
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.full,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  backgroundColor: scoreBg,
                  color: scoreColor,
                }}>
                  {scoreLabel}
                </span>
              </div>
              <div style={{ ...progressStyle.track, marginBottom: tokens.spacing[3] }}>
                <div style={progressStyle.fill} />
              </div>
              <p style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                margin: 0,
                lineHeight: tokens.typography.lineHeight.relaxed,
              }}>
                {privacyScore >= 80
                  ? 'Your privacy settings are well configured. All required consents are active.'
                  : privacyScore >= 60
                    ? 'Some consents need your attention. Review pending items below.'
                    : 'Several privacy settings need attention. Please review your consents.'}
              </p>
            </div>
          </div>
        </div>
      );
    };

    // ─── Render: Stats Row ──────────────────────────────────────────────

    const renderStatsRow = () => {
      const statItems = [
        {
          label: 'Total Consents',
          value: consentStats.total,
          icon: <Shield size={18} />,
          color: tokens.colors.primaryScale[600],
          bgColor: tokens.colors.primaryScale[50],
        },
        {
          label: 'Granted',
          value: consentStats.granted,
          icon: <CheckCircle size={18} />,
          color: tokens.colors.successScale[600],
          bgColor: tokens.colors.successScale[50],
        },
        {
          label: 'Pending',
          value: consentStats.pending,
          icon: <Clock size={18} />,
          color: tokens.colors.warningScale[600],
          bgColor: tokens.colors.warningScale[50],
        },
        {
          label: 'Expiring Soon',
          value: consentStats.expiringSoon,
          icon: <AlertTriangle size={18} />,
          color: consentStats.expiringSoon > 0 ? tokens.colors.errorScale[600] : tokens.colors.neutral[400],
          bgColor: consentStats.expiringSoon > 0 ? tokens.colors.errorScale[50] : tokens.colors.neutral[50],
        },
      ];

      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: tokens.spacing[3],
          marginBottom: tokens.spacing[5],
        }}>
          {statItems.map((stat, idx) => (
            <div
              key={idx}
              style={{
                ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[3],
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                ...(isModern ? glassCardStyle : {}),
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: stat.bgColor,
                color: stat.color,
                flexShrink: 0,
              }}>
                {stat.icon}
              </div>
              <div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  lineHeight: 1,
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  marginTop: 2,
                }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    };

    // ─── Render: Tab Switcher ───────────────────────────────────────────

    const renderTabSwitcher = () => {
      const tabs: Array<{ key: 'consents' | 'requests'; label: string; count: number }> = [
        { key: 'consents', label: 'Your Consents', count: consents.length },
        { key: 'requests', label: 'Data Requests', count: dataRequests.length },
      ];

      return (
        <div style={{
          display: 'flex',
          gap: tokens.spacing[1],
          marginBottom: tokens.spacing[4],
          padding: tokens.spacing[1],
          backgroundColor: tokens.colors.neutral[100],
          borderRadius: tokens.borderRadius.lg,
        }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: activeTab === tab.key
                  ? tokens.typography.fontWeight.semibold
                  : tokens.typography.fontWeight.medium,
                backgroundColor: activeTab === tab.key
                  ? tokens.colors.common.white
                  : 'transparent',
                color: activeTab === tab.key
                  ? tokens.colors.neutral[900]
                  : tokens.colors.neutral[500],
                border: 'none',
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                outline: 'none',
                boxShadow: activeTab === tab.key ? tokens.shadows.sm : 'none',
              }}
            >
              {tab.label}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 20,
                height: 20,
                padding: `0 ${tokens.spacing[1]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                backgroundColor: activeTab === tab.key
                  ? tokens.colors.primaryScale[100]
                  : tokens.colors.neutral[200],
                color: activeTab === tab.key
                  ? tokens.colors.primaryScale[700]
                  : tokens.colors.neutral[600],
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      );
    };

    // ─── Render: Consent Toggle Switch ──────────────────────────────────

    const renderToggleSwitch = (consent: ConsentRecord) => {
      const isGranted = consent.status === 'granted';

      if (consent.required) {
        return (
          <div
            title="This consent is required and cannot be disabled"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.neutral[100],
              color: tokens.colors.neutral[500],
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
            }}
          >
            <Lock size={12} />
            Required
          </div>
        );
      }

      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleConsentToggle(consent.id, consent.status);
          }}
          title={isGranted ? 'Revoke consent' : 'Grant consent'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: isGranted ? 'flex-end' : 'flex-start',
            width: 44,
            height: 24,
            padding: 2,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: isGranted
              ? tokens.colors.successScale[500]
              : tokens.colors.neutral[300],
            border: 'none',
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
            outline: 'none',
            flexShrink: 0,
          }}
        >
          <div style={{
            width: 20,
            height: 20,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.common.white,
            boxShadow: tokens.shadows.sm,
            transition: `all ${tokens.motion.hover}`,
          }} />
        </button>
      );
    };

    // ─── Render: Consent Row ────────────────────────────────────────────

    const renderConsentRow = (consent: ConsentRecord) => {
      const statusCfg = getConsentStatusConfig(consent.status, tokens);
      const isExpiring = isExpiringSoon(consent.expiresAt);
      const isExpanded = expandedConsents.has(consent.id);
      const isHovered = hoveredConsentId === consent.id;
      const legalLabel = getLegalBasisLabel(consent.legalBasis);

      return (
        <div key={consent.id}>
          {/* Main row */}
          <div
            onMouseEnter={() => setHoveredConsentId(consent.id)}
            onMouseLeave={() => setHoveredConsentId(null)}
            onClick={() => toggleExpanded(consent.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              backgroundColor: isHovered ? tokens.colors.neutral[50] : 'transparent',
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            }}
          >
            {/* Expand chevron */}
            <div style={{
              color: tokens.colors.neutral[400],
              transition: `transform ${tokens.motion.hover}`,
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              flexShrink: 0,
            }}>
              <ChevronRight size={16} />
            </div>

            {/* Purpose info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                marginBottom: tokens.spacing[1],
              }}>
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                }}>
                  {consent.purpose || consent.name || 'Unnamed Consent'}
                </span>
                {consent.required && (
                  <Lock size={12} color={tokens.colors.neutral[400]} />
                )}
                {isExpiring && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    padding: `2px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.full,
                    fontSize: '10px',
                    fontWeight: tokens.typography.fontWeight.medium,
                    backgroundColor: tokens.colors.warningScale[100],
                    color: tokens.colors.warningScale[700],
                  }}>
                    <AlertTriangle size={10} />
                    Expiring Soon
                  </span>
                )}
              </div>
              <div style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap' as const,
              }}>
                {consent.description}
              </div>
            </div>

            {/* Legal basis badge */}
            <span style={{
              ...createBadgeStyle(tokens, 'secondary'),
              fontSize: '10px',
              padding: `2px ${tokens.spacing[2]}px`,
              flexShrink: 0,
            }}>
              <Scale size={10} style={{ marginRight: 3 }} />
              {legalLabel}
            </span>

            {/* Status badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: statusCfg.bgColor,
              flexShrink: 0,
            }}>
              <span style={createStatusDotStyle(tokens, statusCfg.dotColor)} />
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                color: statusCfg.textColor,
              }}>
                {statusCfg.label}
              </span>
            </div>

            {/* Toggle switch */}
            {renderToggleSwitch(consent)}
          </div>

          {/* Expanded details */}
          {isExpanded && (
            <div style={{
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px ${tokens.spacing[3]}px ${tokens.spacing[10]}px`,
              backgroundColor: tokens.colors.neutral[50],
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: tokens.spacing[4],
              }}>
                {/* Version */}
                <div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    marginBottom: tokens.spacing[1],
                  }}>
                    Version
                  </div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[800],
                    fontWeight: tokens.typography.fontWeight.medium,
                  }}>
                    {consent.version || 'v1.0'}
                  </div>
                </div>

                {/* Granted At */}
                <div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    marginBottom: tokens.spacing[1],
                  }}>
                    Granted At
                  </div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[800],
                    fontWeight: tokens.typography.fontWeight.medium,
                  }}>
                    {consent.grantedAt ? formatDate(consent.grantedAt) : 'Not granted'}
                  </div>
                </div>

                {/* Expires At */}
                <div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    marginBottom: tokens.spacing[1],
                  }}>
                    Expires At
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    fontSize: tokens.typography.fontSize.sm,
                    color: isExpiring ? tokens.colors.warningScale[700] : tokens.colors.neutral[800],
                    fontWeight: tokens.typography.fontWeight.medium,
                  }}>
                    {consent.expiresAt ? formatDate(consent.expiresAt) : 'No expiry'}
                    {isExpiring && <AlertTriangle size={12} color={tokens.colors.warningScale[500]} />}
                  </div>
                </div>
              </div>

              {/* Full description */}
              <div style={{
                marginTop: tokens.spacing[3],
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.common.white,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                  marginBottom: tokens.spacing[1],
                }}>
                  Description
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[700],
                  lineHeight: tokens.typography.lineHeight.relaxed,
                }}>
                  {consent.description}
                </div>
              </div>

              {/* Third parties */}
              {consent.thirdParties && consent.thirdParties.length > 0 && (
                <div style={{ marginTop: tokens.spacing[3] }}>
                  <div style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    marginBottom: tokens.spacing[2],
                  }}>
                    Shared With Third Parties
                  </div>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap' as const,
                    gap: tokens.spacing[2],
                  }}>
                    {consent.thirdParties.map((party, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.full,
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          backgroundColor: tokens.colors.neutral[100],
                          color: tokens.colors.neutral[700],
                        }}
                      >
                        <ExternalLink size={10} />
                        {party}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Data retention */}
              {consent.dataRetentionDays && (
                <div style={{
                  marginTop: tokens.spacing[3],
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}>
                  <Clock size={12} />
                  Data retained for {consent.dataRetentionDays} days
                </div>
              )}
            </div>
          )}
        </div>
      );
    };

    // ─── Render: Category Group ─────────────────────────────────────────

    const renderCategoryGroup = (group: { category: DataCategory; consents: ConsentRecord[] }) => {
      const catCfg = getCategoryConfig(group.category, tokens);
      const grantedInGroup = group.consents.filter(c => c.status === 'granted').length;

      return (
        <div
          key={group.category}
          style={{
            ...createCardStyle(tokens, { elevation: 'sm', glass: isModern, padding: 0 }),
            marginBottom: tokens.spacing[4],
            overflow: 'hidden' as const,
            ...(isModern ? glassCardStyle : {}),
          }}
        >
          {/* Category header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            backgroundColor: tokens.colors.neutral[50],
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: catCfg.bgColor,
              color: catCfg.color,
            }}>
              {catCfg.icon}
            </div>
            <div style={{ flex: 1 }}>
              <span style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
              }}>
                {catCfg.label}
              </span>
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginLeft: tokens.spacing[2],
              }}>
                {catCfg.description}
              </span>
            </div>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: `2px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              backgroundColor: grantedInGroup === group.consents.length
                ? tokens.colors.successScale[100]
                : tokens.colors.neutral[200],
              color: grantedInGroup === group.consents.length
                ? tokens.colors.successScale[700]
                : tokens.colors.neutral[700],
            }}>
              {grantedInGroup}/{group.consents.length} granted
            </span>
          </div>

          {/* Consent rows */}
          {group.consents.map(consent => renderConsentRow(consent))}
        </div>
      );
    };

    // ─── Render: Data Request Row ───────────────────────────────────────

    const renderDataRequestRow = (request: DataRequest, idx: number, total: number) => {
      const typeCfg = getRequestTypeConfig(request.type, tokens);
      const statusCfg = getRequestStatusConfig(request.status, tokens);
      const isHovered = hoveredRequestId === request.id;

      return (
        <div
          key={request.id}
          onMouseEnter={() => setHoveredRequestId(request.id)}
          onMouseLeave={() => setHoveredRequestId(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            backgroundColor: isHovered ? tokens.colors.neutral[50] : 'transparent',
            borderBottom: idx < total - 1
              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
              : 'none',
            transition: `all ${tokens.motion.hover}`,
          }}
        >
          {/* Type icon */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: tokens.borderRadius.md,
            backgroundColor: typeCfg.bgColor,
            color: typeCfg.color,
            flexShrink: 0,
          }}>
            {typeCfg.icon}
          </div>

          {/* Request info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: 2,
            }}>
              {typeCfg.label}
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
            }}>
              Requested by {request.requestedBy}
            </div>
          </div>

          {/* Status badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: statusCfg.bgColor,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusCfg.borderColor}`,
            flexShrink: 0,
          }}>
            <span style={createStatusDotStyle(tokens, statusCfg.dotColor)} />
            <span style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              color: statusCfg.textColor,
            }}>
              {statusCfg.label}
            </span>
          </div>

          {/* Dates */}
          <div style={{
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'flex-end',
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
            flexShrink: 0,
            minWidth: 90,
          }}>
            <span>{formatDate(request.requestedAt)}</span>
            {request.completedAt && (
              <span style={{
                color: tokens.colors.successScale[600],
                marginTop: 2,
              }}>
                Completed {formatDistanceToNow(request.completedAt, { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
      );
    };

    // ─── Render: Data Requests Section ──────────────────────────────────

    const renderDataRequests = () => {
      if (dataRequests.length === 0) {
        return (
          <div style={{
            ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            padding: `${tokens.spacing[8]}px ${tokens.spacing[6]}px`,
            textAlign: 'center' as const,
            ...(isModern ? glassCardStyle : {}),
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.infoScale[50],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: tokens.spacing[3],
            }}>
              <FileText size={24} color={tokens.colors.infoScale[400]} />
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
              marginBottom: tokens.spacing[1],
            }}>
              No Data Requests
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              marginBottom: tokens.spacing[4],
              maxWidth: 360,
              lineHeight: tokens.typography.lineHeight.relaxed,
            }}>
              You have not submitted any data requests yet. Use the action buttons below to exercise your data rights.
            </div>
          </div>
        );
      }

      return (
        <div style={{
          ...createCardStyle(tokens, { elevation: 'sm', glass: isModern, padding: 0 }),
          overflow: 'hidden' as const,
          ...(isModern ? glassCardStyle : {}),
        }}>
          {dataRequests.map((req, idx) => renderDataRequestRow(req, idx, dataRequests.length))}
        </div>
      );
    };

    // ─── Render: Action Buttons ─────────────────────────────────────────

    const renderActionButtons = () => {
      const actions = [
        {
          label: 'Request Data Access',
          icon: <Eye size={16} />,
          onClick: onRequestAccess || (onCreateDataRequest ? () => onCreateDataRequest('access') : undefined),
          color: tokens.colors.infoScale[600],
          bgColor: tokens.colors.infoScale[50],
          borderColor: tokens.colors.infoScale[200],
          description: 'Get a copy of all your personal data',
        },
        {
          label: 'Request Deletion',
          icon: <Trash2 size={16} />,
          onClick: onRequestDeletion || (onCreateDataRequest ? () => onCreateDataRequest('deletion') : undefined),
          color: tokens.colors.errorScale[600],
          bgColor: tokens.colors.errorScale[50],
          borderColor: tokens.colors.errorScale[200],
          description: 'Request erasure of your personal data',
        },
        {
          label: 'Export My Data',
          icon: <Download size={16} />,
          onClick: onExportData || (onCreateDataRequest ? () => onCreateDataRequest('portability') : undefined),
          color: tokens.colors.primaryScale[600],
          bgColor: tokens.colors.primaryScale[50],
          borderColor: tokens.colors.primaryScale[200],
          description: 'Download your data in a portable format',
        },
      ];

      return (
        <div style={{
          marginTop: tokens.spacing[5],
          marginBottom: tokens.spacing[5],
        }}>
          <div style={{
            ...createSectionHeaderStyle(tokens),
            marginBottom: tokens.spacing[3],
          }}>
            Your Data Rights
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: tokens.spacing[3],
          }}>
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                disabled={!action.onClick}
                style={{
                  display: 'flex',
                  flexDirection: 'column' as const,
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[4]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.lg,
                  backgroundColor: action.onClick ? action.bgColor : tokens.colors.neutral[50],
                  color: action.onClick ? action.color : tokens.colors.neutral[400],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${action.onClick ? action.borderColor : tokens.colors.neutral[200]}`,
                  cursor: action.onClick ? 'pointer' : 'not-allowed',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                  textAlign: 'center' as const,
                  opacity: action.onClick ? 1 : 0.6,
                }}
              >
                {action.icon}
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                }}>
                  {action.label}
                </span>
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  lineHeight: tokens.typography.lineHeight.relaxed,
                }}>
                  {action.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      );
    };

    // ─── Render: Legal Footer ───────────────────────────────────────────

    const renderLegalFooter = () => (
      <div style={{
        marginTop: tokens.spacing[6],
        padding: tokens.spacing[4],
        borderRadius: tokens.borderRadius.lg,
        backgroundColor: tokens.colors.neutral[50],
        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: tokens.spacing[3],
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.infoScale[50],
            color: tokens.colors.infoScale[500],
            flexShrink: 0,
            marginTop: 2,
          }}>
            <Info size={16} />
          </div>
          <div>
            <div style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[800],
              marginBottom: tokens.spacing[1],
            }}>
              Your Privacy Rights
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[600],
              lineHeight: tokens.typography.lineHeight.relaxed,
            }}>
              Under GDPR, CCPA, and other applicable privacy regulations, you have the right to access,
              correct, delete, and port your personal data. Required consents cannot be revoked as they are
              necessary for the service to function. Changes to consent preferences take effect immediately.
              Data requests are typically processed within 30 days of submission. For questions about your
              privacy rights, please contact our Data Protection Officer.
            </div>
            <div style={{
              display: 'flex',
              gap: tokens.spacing[3],
              marginTop: tokens.spacing[3],
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.primaryScale[600],
                fontWeight: tokens.typography.fontWeight.medium,
              }}>
                <ShieldCheck size={12} />
                GDPR Compliant
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.primaryScale[600],
                fontWeight: tokens.typography.fontWeight.medium,
              }}>
                <ShieldCheck size={12} />
                CCPA Compliant
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.primaryScale[600],
                fontWeight: tokens.typography.fontWeight.medium,
              }}>
                <Shield size={12} />
                ISO 27701
              </span>
            </div>
          </div>
        </div>
      </div>
    );

    // ─── Render: Empty State ────────────────────────────────────────────

    const renderEmptyState = () => (
      <div style={{
        ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${tokens.spacing[12]}px ${tokens.spacing[6]}px`,
        textAlign: 'center' as const,
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: tokens.borderRadius.full,
          backgroundColor: tokens.colors.primaryScale[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: tokens.spacing[4],
        }}>
          <Shield size={28} color={tokens.colors.primaryScale[400]} />
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.lg,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.neutral[800],
          marginBottom: tokens.spacing[2],
        }}>
          {emptyText}
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          maxWidth: 400,
          lineHeight: tokens.typography.lineHeight.relaxed,
        }}>
          No consent records have been configured yet. Contact your administrator to set up privacy management.
        </div>
      </div>
    );

    // ─── Main Render ────────────────────────────────────────────────────

    return (
      <div
        className={className}
        style={{
          padding: tokens.spacing[6],
          backgroundColor: tokens.colors.neutral[50],
          minHeight: '100%',
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {renderHeader()}
        {consents.length === 0 && dataRequests.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {renderPrivacyScore()}
            {renderStatsRow()}
            {renderTabSwitcher()}
            {activeTab === 'consents' && (
              groupedConsents.length === 0
                ? renderEmptyState()
                : groupedConsents.map(renderCategoryGroup)
            )}
            {activeTab === 'requests' && renderDataRequests()}
            {renderActionButtons()}
            {renderLegalFooter()}
          </>
        )}
      </div>
    );
  },
});
