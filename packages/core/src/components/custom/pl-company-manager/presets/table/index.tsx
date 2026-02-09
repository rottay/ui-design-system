'use client';

/**
 * PlCompanyManager - Table Preset
 * Full-featured table view with stats ribbon, search, filters, and rich data columns
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createSurfaceStyle,
  createStatusDotStyle,
  createProgressBarStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  PlCompanyManagerProps,
  Company,
  CompanyStatus,
  CompanySize,
  Industry,
} from '../../core';
import { PL_COMPANY_MANAGER_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Building2,
  Search,
  Plus,
  Trash2,
  MoreHorizontal,
  ExternalLink,
  Mail,
  Phone,
  Users,
  TrendingUp,
  Activity,
  Globe,
  ChevronDown,
  X,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Heart,
  DollarSign,
  Calendar,
  MapPin,
  Briefcase,
} from 'lucide-react';

// ─── Status Config ───────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  dotColor: string;
  bgColor: string;
  textColor: string;
}

function getStatusConfig(status: CompanyStatus, tokens: DesignTokens): StatusConfig {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        dotColor: tokens.colors.successScale[500],
        bgColor: tokens.colors.successScale[50],
        textColor: tokens.colors.successScale[700],
      };
    case 'inactive':
      return {
        label: 'Inactive',
        dotColor: tokens.colors.neutral[400],
        bgColor: tokens.colors.neutral[50],
        textColor: tokens.colors.neutral[600],
      };
    case 'suspended':
      return {
        label: 'Suspended',
        dotColor: tokens.colors.errorScale[500],
        bgColor: tokens.colors.errorScale[50],
        textColor: tokens.colors.errorScale[700],
      };
    case 'pending':
      return {
        label: 'Pending',
        dotColor: tokens.colors.warningScale[500],
        bgColor: tokens.colors.warningScale[50],
        textColor: tokens.colors.warningScale[700],
      };
  }
}

// ─── Industry Config ─────────────────────────────────────────────────────

function getIndustryConfig(industry: Industry, tokens: DesignTokens): { label: string; color: string; bgColor: string } {
  switch (industry) {
    case 'technology':
      return { label: 'Technology', color: tokens.colors.primaryScale[700], bgColor: tokens.colors.primaryScale[100] };
    case 'finance':
      return { label: 'Finance', color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[100] };
    case 'healthcare':
      return { label: 'Healthcare', color: tokens.colors.errorScale[700], bgColor: tokens.colors.errorScale[100] };
    case 'education':
      return { label: 'Education', color: tokens.colors.infoScale[700], bgColor: tokens.colors.infoScale[100] };
    case 'retail':
      return { label: 'Retail', color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[100] };
    case 'manufacturing':
      return { label: 'Manufacturing', color: tokens.colors.secondaryScale[700], bgColor: tokens.colors.secondaryScale[100] };
    case 'other':
      return { label: 'Other', color: tokens.colors.neutral[700], bgColor: tokens.colors.neutral[100] };
  }
}

// ─── Size Config ─────────────────────────────────────────────────────────

function getSizeLabel(size: CompanySize): string {
  switch (size) {
    case 'startup': return 'Startup';
    case 'small': return 'Small';
    case 'medium': return 'Medium';
    case 'large': return 'Large';
    case 'enterprise': return 'Enterprise';
  }
}

// ─── Health Score Color ──────────────────────────────────────────────────

function getHealthColor(score: number, tokens: DesignTokens): string {
  if (score >= 75) return tokens.colors.successScale[500];
  if (score >= 50) return tokens.colors.warningScale[500];
  return tokens.colors.errorScale[500];
}

function getHealthBgColor(score: number, tokens: DesignTokens): string {
  if (score >= 75) return tokens.colors.successScale[50];
  if (score >= 50) return tokens.colors.warningScale[50];
  return tokens.colors.errorScale[50];
}

function getHealthTextColor(score: number, tokens: DesignTokens): string {
  if (score >= 75) return tokens.colors.successScale[700];
  if (score >= 50) return tokens.colors.warningScale[700];
  return tokens.colors.errorScale[700];
}

// ─── Currency Formatter ──────────────────────────────────────────────────

function formatMrr(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

// ─── Sort Types ──────────────────────────────────────────────────────────

type SortField = 'name' | 'employeeCount' | 'mrr' | 'healthScore' | 'lastActive';
type SortDirection = 'asc' | 'desc';

// ─── Table Preset ────────────────────────────────────────────────────────

export const TablePlCompanyManager = createPreset<PlCompanyManagerProps>({
  name: 'PlCompanyManager.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlCompanyManagerProps>) => {
    const { Box, Stack, Spinner } = primitives;
    const isModern = tokens.surface.useGlass;

    const {
      companies,
      onCompanyClick,
      onCreate,
      onDelete,
      searchQuery: controlledSearchQuery,
      onSearchChange,
      filterStatus: controlledFilterStatus,
      onFilterStatus,
      loading = false,
      className,
      style,
    } = props;

    // ─── Internal State ──────────────────────────────────────────────────

    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [internalFilterStatus, setInternalFilterStatus] = useState<CompanyStatus | null>(null);
    const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);

    const searchQuery = controlledSearchQuery ?? internalSearchQuery;
    const filterStatus = controlledFilterStatus ?? internalFilterStatus;

    // ─── Handlers ────────────────────────────────────────────────────────

    const handleSearchChange = useCallback((query: string) => {
      if (controlledSearchQuery === undefined) setInternalSearchQuery(query);
      onSearchChange?.(query);
    }, [controlledSearchQuery, onSearchChange]);

    const handleFilterStatus = useCallback((status: CompanyStatus | null) => {
      if (controlledFilterStatus === undefined) setInternalFilterStatus(status);
      onFilterStatus?.(status);
      setShowStatusDropdown(false);
    }, [controlledFilterStatus, onFilterStatus]);

    const handleSort = useCallback((field: SortField) => {
      if (sortField === field) {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    }, [sortField]);

    // ─── Filtered & Sorted Companies ─────────────────────────────────────

    const filteredCompanies = useMemo(() => {
      let result = [...companies];

      if (filterStatus) {
        result = result.filter(c => c.status === filterStatus);
      }

      if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        result = result.filter(c =>
          c.name.toLowerCase().includes(lower) ||
          c.contactName.toLowerCase().includes(lower) ||
          c.contactEmail.toLowerCase().includes(lower) ||
          c.country.toLowerCase().includes(lower) ||
          c.industry.toLowerCase().includes(lower)
        );
      }

      result.sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'employeeCount':
            comparison = a.employeeCount - b.employeeCount;
            break;
          case 'mrr':
            comparison = (a.mrr ?? 0) - (b.mrr ?? 0);
            break;
          case 'healthScore':
            comparison = (a.healthScore ?? 0) - (b.healthScore ?? 0);
            break;
          case 'lastActive':
            comparison = (a.lastActive?.getTime() ?? 0) - (b.lastActive?.getTime() ?? 0);
            break;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });

      return result;
    }, [companies, filterStatus, searchQuery, sortField, sortDirection]);

    // ─── Stats Computation ───────────────────────────────────────────────

    const stats = useMemo(() => {
      const totalCompanies = companies.length;
      const activeCompanies = companies.filter(c => c.status === 'active').length;
      const totalEmployees = companies.reduce((sum, c) => sum + c.employeeCount, 0);
      const companiesWithHealth = companies.filter(c => c.healthScore !== undefined);
      const avgHealth = companiesWithHealth.length > 0
        ? Math.round(companiesWithHealth.reduce((sum, c) => sum + (c.healthScore ?? 0), 0) / companiesWithHealth.length)
        : 0;

      return { totalCompanies, activeCompanies, totalEmployees, avgHealth };
    }, [companies]);

    // ─── Glass Style ─────────────────────────────────────────────────────

    const glassCardStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blur,
      WebkitBackdropFilter: tokens.glass.blur,
      backgroundColor: tokens.glass.bg,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
    } : {};

    // ─── Loading State ───────────────────────────────────────────────────

    if (loading) {
      return (
        <div
          className={className}
          style={{
            padding: tokens.spacing[6],
            backgroundColor: tokens.colors.neutral[50],
            minHeight: '100%',
            fontFamily: 'inherit',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            ...style,
          }}
        >
          <Spinner size="lg" />
        </div>
      );
    }

    // ─── Render: Stats Ribbon ────────────────────────────────────────────

    const renderStatsRibbon = () => {
      const statItems = [
        {
          label: 'Total Companies',
          value: stats.totalCompanies.toString(),
          icon: <Building2 size={18} />,
          color: tokens.colors.primaryScale[600],
          bgColor: tokens.colors.primaryScale[50],
        },
        {
          label: 'Active',
          value: stats.activeCompanies.toString(),
          icon: <Activity size={18} />,
          color: tokens.colors.successScale[600],
          bgColor: tokens.colors.successScale[50],
        },
        {
          label: 'Total Employees',
          value: stats.totalEmployees.toLocaleString(),
          icon: <Users size={18} />,
          color: tokens.colors.infoScale[600],
          bgColor: tokens.colors.infoScale[50],
        },
        {
          label: 'Avg Health',
          value: `${stats.avgHealth}%`,
          icon: <Heart size={18} />,
          color: getHealthColor(stats.avgHealth, tokens),
          bgColor: getHealthBgColor(stats.avgHealth, tokens),
        },
      ];

      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: tokens.spacing[4],
          marginBottom: tokens.spacing[5],
        }}>
          {statItems.map((stat, idx) => (
            <div
              key={idx}
              style={{
                ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
                padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[3],
                ...(isModern ? glassCardStyle : {}),
              }}
            >
              <div style={{
                width: 42,
                height: 42,
                borderRadius: tokens.borderRadius.lg,
                backgroundColor: stat.bgColor,
                color: stat.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {stat.icon}
              </div>
              <div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[500],
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                  marginBottom: tokens.spacing[1],
                }}>
                  {stat.label}
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  lineHeight: tokens.typography.lineHeight.tight,
                }}>
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    };

    // ─── Render: Header ──────────────────────────────────────────────────

    const renderHeader = () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: tokens.spacing[5],
      }}>
        <div>
          <h1 style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            margin: 0,
            lineHeight: tokens.typography.lineHeight.tight,
          }}>
            Company Manager
          </h1>
          <p style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            margin: 0,
            marginTop: tokens.spacing[1],
          }}>
            Manage and monitor all your companies
          </p>
        </div>
        {onCreate && (
          <button
            onClick={onCreate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              backgroundColor: tokens.colors.primaryScale[600],
              color: tokens.colors.common.white,
              border: 'none',
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              boxShadow: tokens.shadows.sm,
              outline: 'none',
            }}
          >
            <Plus size={16} />
            Add Company
          </button>
        )}
      </div>
    );

    // ─── Render: Filter Bar ──────────────────────────────────────────────

    const renderFilterBar = () => {
      const allStatuses: CompanyStatus[] = ['active', 'inactive', 'suspended', 'pending'];

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          marginBottom: tokens.spacing[4],
          flexWrap: 'wrap' as const,
        }}>
          {/* Status filter */}
          <div style={{ position: 'relative' as const }}>
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${filterStatus ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                backgroundColor: filterStatus ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                color: filterStatus ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                outline: 'none',
              }}
            >
              <Filter size={14} />
              {filterStatus ? getStatusConfig(filterStatus, tokens).label : 'All Statuses'}
              <ChevronDown size={14} />
            </button>
            {showStatusDropdown && (
              <div style={{
                position: 'absolute' as const,
                top: '100%',
                left: 0,
                marginTop: tokens.spacing[1],
                minWidth: 200,
                backgroundColor: tokens.colors.common.white,
                borderRadius: tokens.borderRadius.lg,
                boxShadow: tokens.shadows.lg,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                zIndex: 50,
                padding: `${tokens.spacing[1]}px 0`,
              }}>
                <div
                  onClick={() => handleFilterStatus(null)}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: !filterStatus ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                    backgroundColor: !filterStatus ? tokens.colors.primaryScale[50] : 'transparent',
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  All Statuses
                </div>
                {allStatuses.map(status => {
                  const cfg = getStatusConfig(status, tokens);
                  return (
                    <div
                      key={status}
                      onClick={() => handleFilterStatus(status)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        fontSize: tokens.typography.fontSize.sm,
                        color: filterStatus === status ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                        backgroundColor: filterStatus === status ? tokens.colors.primaryScale[50] : 'transparent',
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      <span style={{
                        ...createStatusDotStyle(tokens, cfg.dotColor),
                      }} />
                      {cfg.label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ flex: 1 }} />

          {/* Search input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            minWidth: 280,
            transition: `all ${tokens.motion.hover}`,
          }}>
            <Search size={16} color={tokens.colors.neutral[400]} />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[800],
                backgroundColor: 'transparent',
                flex: 1,
                padding: 0,
                fontFamily: 'inherit',
              }}
            />
            {searchQuery && (
              <X
                size={14}
                color={tokens.colors.neutral[400]}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSearchChange('')}
              />
            )}
          </div>
        </div>
      );
    };

    // ─── Render: Sort Header ─────────────────────────────────────────────

    const renderSortHeader = (label: string, field: SortField) => {
      const isActive = sortField === field;
      return (
        <div
          onClick={() => handleSort(field)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            cursor: 'pointer',
            userSelect: 'none' as const,
          }}
        >
          <span>{label}</span>
          {isActive ? (
            sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
          ) : (
            <ArrowUpDown size={12} style={{ opacity: 0.4 }} />
          )}
        </div>
      );
    };

    // ─── Render: Health Score Bar ────────────────────────────────────────

    const renderHealthBar = (score: number) => {
      const color = getHealthColor(score, tokens);
      const progressStyles = createProgressBarStyle(tokens, { color, percent: score });

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          minWidth: 100,
        }}>
          <div style={{ ...progressStyles.track, flex: 1, height: 6 }}>
            <div style={progressStyles.fill} />
          </div>
          <span style={{
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.medium,
            color: getHealthTextColor(score, tokens),
            minWidth: 30,
            textAlign: 'right' as const,
          }}>
            {score}%
          </span>
        </div>
      );
    };

    // ─── Render: Company Row ─────────────────────────────────────────────

    const renderCompanyRow = (company: Company, idx: number) => {
      const statusCfg = getStatusConfig(company.status, tokens);
      const industryCfg = getIndustryConfig(company.industry, tokens);
      const isHovered = hoveredRowId === company.id;
      const isLast = idx === filteredCompanies.length - 1;

      return (
        <tr
          key={company.id}
          onMouseEnter={() => setHoveredRowId(company.id)}
          onMouseLeave={() => {
            setHoveredRowId(null);
            if (actionMenuId === company.id) setActionMenuId(null);
          }}
          onClick={() => onCompanyClick?.(company.id)}
          style={{
            backgroundColor: isHovered ? tokens.colors.neutral[50] : tokens.colors.common.white,
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
          }}
        >
          {/* Logo + Name */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.primaryScale[50],
                color: tokens.colors.primaryScale[600],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: tokens.typography.fontWeight.bold,
                fontSize: tokens.typography.fontSize.sm,
                flexShrink: 0,
                overflow: 'hidden' as const,
              }}>
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' as const }}
                  />
                ) : (
                  company.name.charAt(0).toUpperCase()
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  whiteSpace: 'nowrap' as const,
                  overflow: 'hidden' as const,
                  textOverflow: 'ellipsis' as const,
                }}>
                  {company.name}
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                }}>
                  <MapPin size={10} />
                  {company.country}
                </div>
              </div>
            </div>
          </td>

          {/* Industry */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              backgroundColor: industryCfg.bgColor,
              color: industryCfg.color,
            }}>
              {industryCfg.label}
            </span>
          </td>

          {/* Status */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: statusCfg.bgColor,
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
          </td>

          {/* Size */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[600],
            fontWeight: tokens.typography.fontWeight.normal,
          }}>
            {getSizeLabel(company.size)}
          </td>

          {/* Employees */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[700],
              fontWeight: tokens.typography.fontWeight.medium,
            }}>
              <Users size={13} color={tokens.colors.neutral[400]} />
              {company.employeeCount.toLocaleString()}
            </div>
          </td>

          {/* MRR */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
          }}>
            {company.mrr !== undefined ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.successScale[700],
              }}>
                <DollarSign size={13} color={tokens.colors.successScale[500]} />
                {formatMrr(company.mrr)}
              </div>
            ) : (
              <span style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[400],
              }}>
                --
              </span>
            )}
          </td>

          {/* Health Score */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
          }}>
            {company.healthScore !== undefined ? (
              renderHealthBar(company.healthScore)
            ) : (
              <span style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[400],
              }}>
                --
              </span>
            )}
          </td>

          {/* Last Active */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
            }}>
              <Calendar size={12} />
              {company.lastActive
                ? formatDistanceToNow(company.lastActive, { addSuffix: true })
                : 'Never'
              }
            </div>
          </td>

          {/* Actions */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
            width: 48,
          }}>
            <div style={{
              position: 'relative' as const,
              opacity: isHovered ? 1 : 0,
              transition: `opacity ${tokens.motion.hover}`,
            }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActionMenuId(actionMenuId === company.id ? null : company.id);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 30,
                  height: 30,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.neutral[500],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                }}
              >
                <MoreHorizontal size={14} />
              </button>
              {actionMenuId === company.id && (
                <div style={{
                  position: 'absolute' as const,
                  top: '100%',
                  right: 0,
                  marginTop: tokens.spacing[1],
                  minWidth: 160,
                  backgroundColor: tokens.colors.common.white,
                  borderRadius: tokens.borderRadius.lg,
                  boxShadow: tokens.shadows.lg,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  zIndex: 50,
                  padding: `${tokens.spacing[1]}px 0`,
                }}>
                  {company.website && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(company.website, '_blank');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      <ExternalLink size={14} />
                      Visit Website
                    </div>
                  )}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `mailto:${company.contactEmail}`;
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[700],
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    <Mail size={14} />
                    Email Contact
                  </div>
                  {onDelete && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(company.id);
                        setActionMenuId(null);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.errorScale[600],
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                        marginTop: tokens.spacing[1],
                        paddingTop: tokens.spacing[2],
                      }}
                    >
                      <Trash2 size={14} />
                      Delete Company
                    </div>
                  )}
                </div>
              )}
            </div>
          </td>
        </tr>
      );
    };

    // ─── Render: Table ───────────────────────────────────────────────────

    const renderTable = () => (
      <div style={{
        ...createCardStyle(tokens, { elevation: 'sm', glass: isModern, padding: 0 }),
        overflow: 'hidden' as const,
        ...(isModern ? glassCardStyle : {}),
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse' as const,
        }}>
          <thead>
            <tr style={{
              backgroundColor: tokens.colors.neutral[50],
            }}>
              {[
                { label: 'Company', field: 'name' as SortField, width: undefined },
                { label: 'Industry', field: null, width: undefined },
                { label: 'Status', field: null, width: undefined },
                { label: 'Size', field: null, width: undefined },
                { label: 'Employees', field: 'employeeCount' as SortField, width: undefined },
                { label: 'MRR', field: 'mrr' as SortField, width: undefined },
                { label: 'Health', field: 'healthScore' as SortField, width: 140 },
                { label: 'Last Active', field: 'lastActive' as SortField, width: undefined },
                { label: '', field: null, width: 48 },
              ].map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    textAlign: 'left' as const,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    whiteSpace: 'nowrap' as const,
                    width: col.width,
                  }}
                >
                  {col.field ? renderSortHeader(col.label, col.field) : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map((company, idx) => renderCompanyRow(company, idx))}
          </tbody>
        </table>
      </div>
    );

    // ─── Render: Empty State ─────────────────────────────────────────────

    const renderEmptyState = () => (
      <div style={{
        ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${tokens.spacing[12]}px ${tokens.spacing[6]}px`,
        textAlign: 'center' as const,
        ...(isModern ? glassCardStyle : {}),
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
          <Building2 size={28} color={tokens.colors.primaryScale[400]} />
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.lg,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.neutral[800],
          marginBottom: tokens.spacing[2],
        }}>
          {searchQuery || filterStatus ? 'No companies match your filters' : 'No companies yet'}
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          marginBottom: tokens.spacing[6],
          maxWidth: 400,
          lineHeight: tokens.typography.lineHeight.relaxed,
        }}>
          {searchQuery || filterStatus
            ? 'Try adjusting your filters or search query to find what you are looking for.'
            : 'Start by adding your first company to manage contacts, subscriptions, and health metrics.'}
        </div>
        {onCreate && !(searchQuery || filterStatus) && (
          <button
            onClick={onCreate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              backgroundColor: tokens.colors.primaryScale[600],
              color: tokens.colors.common.white,
              border: 'none',
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              boxShadow: tokens.shadows.sm,
              outline: 'none',
            }}
          >
            <Plus size={16} />
            Add Your First Company
          </button>
        )}
      </div>
    );

    // ─── Render: Results Count ───────────────────────────────────────────

    const renderResultsCount = () => {
      if (filteredCompanies.length === companies.length && !searchQuery && !filterStatus) return null;

      return (
        <div style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          marginBottom: tokens.spacing[3],
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
        }}>
          Showing {filteredCompanies.length} of {companies.length} companies
          {(searchQuery || filterStatus) && (
            <button
              onClick={() => {
                handleSearchChange('');
                handleFilterStatus(null);
              }}
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.primaryScale[600],
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline' as const,
                padding: 0,
                fontFamily: 'inherit',
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      );
    };

    // ─── Main Render ─────────────────────────────────────────────────────

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
        {renderStatsRibbon()}
        {renderFilterBar()}
        {renderResultsCount()}
        {filteredCompanies.length === 0 ? renderEmptyState() : renderTable()}
      </div>
    );
  },
});
