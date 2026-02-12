'use client';

/**
 * BhAgentGallery - List Preset
 * Table-based agent browse and select with inline preview panel,
 * tab navigation, filter bar, and sortable columns.
 *
 * Design: Dense data table layout with sticky headers, inline sparklines,
 * collapsible preview sidebar, and personality-driven badge styling.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createDividerStyle,
  createHoverStyle,
  createSectionHeaderStyle,
  getCardPadding,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
} from '../../../helpers';
import type {
  BhAgentGalleryProps,
  AgentFilter,
  AgentTab,
  AgentViewMode,
  AgentType,
  AgentStatus,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Bot,
  Users,
  Store,
  Search,
  Grid3X3,
  List as ListIcon,
  Copy,
  Pencil,
  Trash2,
  Eye,
  Star,
  Phone,
  MessageSquare,
  Calendar,
  Mail,
  Compass,
  Settings,
  Filter,
  X,
  ArrowUpDown,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helper: sparkline polyline points                                  */
/* ------------------------------------------------------------------ */
function sparklinePoints(data: number[], width: number, height: number, padding: number): string {
  if (!data.length) return '';
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = (width - padding * 2) / (data.length - 1 || 1);
  return data
    .map((v, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((v - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');
}

/* ------------------------------------------------------------------ */
/*  Helper: agent type icon                                            */
/* ------------------------------------------------------------------ */
function getAgentTypeIcon(type: AgentType, size: number) {
  const iconProps = { size, strokeWidth: 1.5 };
  switch (type) {
    case 'screener': return <Phone {...iconProps} />;
    case 'interviewer': return <MessageSquare {...iconProps} />;
    case 'scheduler': return <Calendar {...iconProps} />;
    case 'outreach': return <Mail {...iconProps} />;
    case 'sourcer': return <Compass {...iconProps} />;
    case 'custom': return <Settings {...iconProps} />;
    default: return <Bot {...iconProps} />;
  }
}

/* ------------------------------------------------------------------ */
/*  Helper: language label                                             */
/* ------------------------------------------------------------------ */
function getLanguageLabel(language: string): string {
  return language.toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  Helper: status info                                                */
/* ------------------------------------------------------------------ */
function getStatusInfo(status: AgentStatus, tokens: DesignTokens): { color: string; bg: string; label: string } {
  switch (status) {
    case 'active':
      return { color: tokens.colors.successScale[600], bg: tokens.colors.successScale[100], label: 'Active' };
    case 'inactive':
      return { color: tokens.colors.neutral[500], bg: tokens.colors.neutral[100], label: 'Inactive' };
    case 'draft':
      return { color: tokens.colors.warningScale[600], bg: tokens.colors.warningScale[100], label: 'Draft' };
    case 'error':
      return { color: tokens.colors.errorScale[600], bg: tokens.colors.errorScale[100], label: 'Error' };
    default:
      return { color: tokens.colors.neutral[500], bg: tokens.colors.neutral[100], label: status };
  }
}

/* ------------------------------------------------------------------ */
/*  List Preset                                                        */
/* ------------------------------------------------------------------ */
export const ListBhAgentGallery = createPreset<BhAgentGalleryProps>({
  name: 'BhAgentGallery.List',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhAgentGalleryProps>) => {
    const { Box, Text } = primitives;

    const {
      agents = [],
      activeTab: controlledTab,
      onTabChange,
      filters: controlledFilters,
      onFilterChange,
      selectedAgent: controlledSelected,
      onAgentSelect,
      onDuplicate,
      onEdit,
      onDelete,
      viewMode: controlledViewMode,
      onViewModeChange,
      showPreview: controlledShowPreview,
      onPreviewToggle,
      previewData,
      tabCounts,
      className,
      style,
    } = props;

    /* ---- Local state ---- */
    const [localTab, setLocalTab] = useState<AgentTab>('my');
    const [localFilters, setLocalFilters] = useState<AgentFilter>({ type: 'all', language: 'all', provider: 'all', tone: 'all', status: 'all', search: '' });
    const [localSelected, setLocalSelected] = useState<string | null>(null);
    const [localShowPreview, setLocalShowPreview] = useState(false);
    const [localViewMode, setLocalViewMode] = useState<AgentViewMode>('list');

    const activeTab = controlledTab ?? localTab;
    const filters = controlledFilters ?? localFilters;
    const selectedAgent = controlledSelected ?? localSelected;
    const showPreview = controlledShowPreview ?? localShowPreview;
    const viewMode = controlledViewMode ?? localViewMode;

    const handleTabChange = (tab: AgentTab) => { onTabChange?.(tab); if (controlledTab === undefined) setLocalTab(tab); };
    const handleFilterChange = (f: AgentFilter) => { onFilterChange?.(f); if (controlledFilters === undefined) setLocalFilters(f); };
    const handleSelect = (id: string) => { onAgentSelect?.(id); if (controlledSelected === undefined) setLocalSelected(id); };
    const handlePreviewToggle = (show: boolean) => { onPreviewToggle?.(show); if (controlledShowPreview === undefined) setLocalShowPreview(show); };
    const handleViewModeChange = (mode: AgentViewMode) => { onViewModeChange?.(mode); if (controlledViewMode === undefined) setLocalViewMode(mode); };

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const typo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const padding = useMemo(() => getCardPadding(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const divider = useMemo(() => createDividerStyle(tokens), [tokens]);

    /* ---- Filtering ---- */
    const filteredAgents = useMemo(() => {
      return agents.filter((a) => {
        if (filters.type && filters.type !== 'all' && a.type !== filters.type) return false;
        if (filters.language && filters.language !== 'all' && a.language !== filters.language) return false;
        if (filters.provider && filters.provider !== 'all' && a.voiceProvider !== filters.provider) return false;
        if (filters.status && filters.status !== 'all' && a.status !== filters.status) return false;
        if (filters.search) {
          const q = filters.search.toLowerCase();
          if (!a.name.toLowerCase().includes(q) && !a.type.toLowerCase().includes(q)) return false;
        }
        return true;
      });
    }, [agents, filters]);

    const selectedAgentData = useMemo(() => agents.find((a) => a.id === selectedAgent), [agents, selectedAgent]);
    const counts = tabCounts ?? { my: agents.length, team: 0, marketplace: 0 };

    const tabs: { key: AgentTab; label: string; icon: React.ReactNode; count: number }[] = [
      { key: 'my', label: 'My Agents', icon: <Bot size={16} strokeWidth={1.5} />, count: counts.my },
      { key: 'team', label: 'Team Agents', icon: <Users size={16} strokeWidth={1.5} />, count: counts.team },
      { key: 'marketplace', label: 'Marketplace', icon: <Store size={16} strokeWidth={1.5} />, count: counts.marketplace },
    ];

    const selectStyle: React.CSSProperties = {
      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
      borderRadius: tokens.borderRadius.md,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      backgroundColor: tokens.colors.common.white,
      color: tokens.colors.neutral[700],
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.medium,
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
      outline: 'none',
      appearance: 'none' as const,
      WebkitAppearance: 'none' as const,
      minWidth: 120,
    };

    const thStyle: React.CSSProperties = {
      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[500],
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      textAlign: 'left' as const,
      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      backgroundColor: tokens.colors.neutral[50],
      position: 'sticky' as const,
      top: 0,
      zIndex: 1,
    };

    /* ---- Reusable icon button ---- */
    const iconBtn = (color: string, bg?: string): React.CSSProperties => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: tokens.spacing[7],
      height: tokens.spacing[7],
      borderRadius: tokens.borderRadius.md,
      border: bg ? 'none' : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      backgroundColor: bg || tokens.colors.common.white,
      color,
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
    });

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column' as const,
          height: '100%',
          backgroundColor: tokens.colors.neutral[50],
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {/* =========================================================== */}
        {/*  1. Tab Bar                                                  */}
        {/* =========================================================== */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
            backgroundColor: tokens.colors.common.white,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            ...(isGlass ? { backdropFilter: tokens.glass?.blur, WebkitBackdropFilter: tokens.glass?.blur, backgroundColor: tokens.glass?.bg } : {}),
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Box
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderRadius: badgeRadius,
                  border: isActive ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}` : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} transparent`,
                  backgroundColor: isActive ? tokens.colors.primaryScale[50] : 'transparent',
                  color: isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                <Box style={{ display: 'flex', alignItems: 'center', color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400] }}>{tab.icon}</Box>
                <Text>{tab.label}</Text>
                <Box
                  style={{
                    padding: `0 ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: isActive ? tokens.colors.primaryScale[100] : tokens.colors.neutral[100],
                    color: isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500],
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    minWidth: tokens.spacing[5],
                    textAlign: 'center' as const,
                  }}
                >
                  <Text>{tab.count}</Text>
                </Box>
              </Box>
            );
          })}
          <Box style={{ marginLeft: 'auto', display: 'flex', gap: tokens.spacing[1] }}>
            {(['grid', 'list'] as const).map((mode) => (
              <Box
                key={mode}
                onClick={() => handleViewModeChange(mode)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: tokens.spacing[8],
                  height: tokens.spacing[8],
                  borderRadius: tokens.borderRadius.md,
                  border: viewMode === mode ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}` : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: viewMode === mode ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                  color: viewMode === mode ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                {mode === 'grid' ? <Grid3X3 size={16} strokeWidth={1.5} /> : <ListIcon size={16} strokeWidth={1.5} />}
              </Box>
            ))}
          </Box>
        </Box>

        {/* =========================================================== */}
        {/*  2. Filter Bar                                               */}
        {/* =========================================================== */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
            padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
            backgroundColor: tokens.colors.common.white,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          }}
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              flex: 1,
              maxWidth: 320,
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.neutral[50],
            }}
          >
            <Search size={16} strokeWidth={1.5} style={{ color: tokens.colors.neutral[400], flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search agents..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
              style={{
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                flex: 1,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[800],
                fontFamily: 'inherit',
              }}
            />
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', color: tokens.colors.neutral[400] }}>
            <Filter size={16} strokeWidth={1.5} />
          </Box>
          <select value={filters.type || 'all'} onChange={(e) => handleFilterChange({ ...filters, type: e.target.value as AgentType | 'all' })} style={selectStyle}>
            <option value="all">All Types</option>
            <option value="screener">Screener</option>
            <option value="interviewer">Interviewer</option>
            <option value="scheduler">Scheduler</option>
            <option value="outreach">Outreach</option>
            <option value="sourcer">Sourcer</option>
            <option value="custom">Custom</option>
          </select>
          <select value={filters.status || 'all'} onChange={(e) => handleFilterChange({ ...filters, status: e.target.value as AgentStatus | 'all' })} style={selectStyle}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
            <option value="error">Error</option>
          </select>
        </Box>

        {/* =========================================================== */}
        {/*  3. Content: Table + Inline Preview                          */}
        {/* =========================================================== */}
        <Box style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Table section */}
          <Box style={{ flex: 1, overflow: 'auto' as const, minWidth: 0 }}>
            {filteredAgents.length === 0 ? (
              <Box style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: `${tokens.spacing[10]}px ${tokens.spacing[4]}px`, textAlign: 'center' as const }}>
                <Bot size={48} strokeWidth={1} style={{ color: tokens.colors.neutral[300], marginBottom: tokens.spacing[4] }} />
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[2] }}>
                  No agents found
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
                  Try adjusting your filters or create a new agent
                </Text>
              </Box>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' as const, backgroundColor: tokens.colors.common.white }}>
                <thead>
                  <tr>
                    <th style={thStyle}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                        <Text>Agent</Text>
                        <ArrowUpDown size={12} strokeWidth={1.5} style={{ color: tokens.colors.neutral[400] }} />
                      </Box>
                    </th>
                    <th style={thStyle}><Text>Type</Text></th>
                    <th style={thStyle}><Text>Language</Text></th>
                    <th style={thStyle}><Text>Provider</Text></th>
                    <th style={thStyle}><Text>Status</Text></th>
                    <th style={thStyle}><Text>Usage</Text></th>
                    {activeTab === 'marketplace' && <th style={thStyle}><Text>Rating</Text></th>}
                    <th style={{ ...thStyle, textAlign: 'right' as const }}><Text>Actions</Text></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.map((agent) => {
                    const statusInfo = getStatusInfo(agent.status, tokens);
                    const isSelected = selectedAgent === agent.id;

                    return (
                      <tr
                        key={agent.id}
                        onClick={() => handleSelect(agent.id)}
                        style={{
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          backgroundColor: isSelected ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.backgroundColor = tokens.colors.neutral[50];
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.backgroundColor = tokens.colors.common.white;
                        }}
                      >
                        {/* Agent name column */}
                        <td style={{ padding: `${tokens.spacing[3]}px` }}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                            <Box
                              style={{
                                width: tokens.spacing[8],
                                height: tokens.spacing[8],
                                borderRadius: tokens.borderRadius.md,
                                backgroundColor: tokens.colors.primaryScale[50],
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: tokens.colors.primaryScale[600],
                                flexShrink: 0,
                              }}
                            >
                              {getAgentTypeIcon(agent.type, 16)}
                            </Box>
                            <Box style={{ minWidth: 0 }}>
                              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: typo.headingWeight, color: tokens.colors.neutral[900], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                                  {agent.name}
                                </Text>
                                {agent.isDefault && (
                                  <Box style={{ ...createBadgeStyle(tokens, 'primary'), fontSize: tokens.typography.fontSize.xs, padding: `0 ${tokens.spacing[1]}px` }}>
                                    <Text>Default</Text>
                                  </Box>
                                )}
                              </Box>
                              {agent.author && (
                                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>by {agent.author}</Text>
                              )}
                            </Box>
                          </Box>
                        </td>

                        {/* Type */}
                        <td style={{ padding: `${tokens.spacing[3]}px` }}>
                          <Box style={{ ...createBadgeStyle(tokens, 'info'), fontSize: tokens.typography.fontSize.xs, padding: `0 ${tokens.spacing[2]}px`, textTransform: 'capitalize' as const, display: 'inline-flex' }}>
                            <Text>{agent.type}</Text>
                          </Box>
                        </td>

                        {/* Language */}
                        <td style={{ padding: `${tokens.spacing[3]}px` }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                            {getLanguageLabel(agent.language)}
                          </Text>
                        </td>

                        {/* Provider */}
                        <td style={{ padding: `${tokens.spacing[3]}px` }}>
                          <Box style={{ ...createBadgeStyle(tokens, 'secondary'), fontSize: tokens.typography.fontSize.xs, padding: `0 ${tokens.spacing[2]}px`, display: 'inline-flex' }}>
                            <Text>{agent.voiceProvider}</Text>
                          </Box>
                        </td>

                        {/* Status */}
                        <td style={{ padding: `${tokens.spacing[3]}px` }}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                            <Box style={{ width: tokens.spacing[2], height: tokens.spacing[2], borderRadius: tokens.borderRadius.full, backgroundColor: statusInfo.color }} />
                            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: statusInfo.color, fontWeight: tokens.typography.fontWeight.medium }}>
                              {statusInfo.label}
                            </Text>
                          </Box>
                        </td>

                        {/* Sparkline */}
                        <td style={{ padding: `${tokens.spacing[3]}px` }}>
                          {agent.usageSparkline.length > 0 && (
                            <svg width={80} height={24} viewBox="0 0 80 24" style={{ display: 'block' }}>
                              <polyline
                                points={sparklinePoints(agent.usageSparkline, 80, 24, 2)}
                                fill="none"
                                stroke={tokens.colors.primaryScale[400]}
                                strokeWidth={1.5}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </td>

                        {/* Marketplace: Rating */}
                        {activeTab === 'marketplace' && (
                          <td style={{ padding: `${tokens.spacing[3]}px` }}>
                            {agent.rating !== undefined && (
                              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                                <Star size={12} strokeWidth={2} style={{ color: tokens.colors.warningScale[500], fill: tokens.colors.warningScale[500] }} />
                                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                                  {agent.rating.toFixed(1)}
                                </Text>
                              </Box>
                            )}
                          </td>
                        )}

                        {/* Actions */}
                        <td style={{ padding: `${tokens.spacing[3]}px`, textAlign: 'right' as const }}>
                          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: tokens.spacing[1] }}>
                            <Box
                              onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleSelect(agent.id); handlePreviewToggle(true); }}
                              title="Preview"
                              style={iconBtn(tokens.colors.neutral[500])}
                            >
                              <Eye size={14} strokeWidth={1.5} />
                            </Box>
                            {onEdit && (
                              <Box onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEdit(agent.id); }} title="Edit" style={iconBtn(tokens.colors.neutral[500])}>
                                <Pencil size={14} strokeWidth={1.5} />
                              </Box>
                            )}
                            {onDuplicate && (
                              <Box onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDuplicate(agent.id); }} title="Duplicate" style={iconBtn(tokens.colors.neutral[500])}>
                                <Copy size={14} strokeWidth={1.5} />
                              </Box>
                            )}
                            {onDelete && (
                              <Box onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete(agent.id); }} title="Delete" style={iconBtn(tokens.colors.errorScale[600], tokens.colors.errorScale[50])}>
                                <Trash2 size={14} strokeWidth={1.5} />
                              </Box>
                            )}
                          </Box>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Box>

          {/* =========================================================== */}
          {/*  4. Inline Preview Sidebar                                   */}
          {/* =========================================================== */}
          {showPreview && selectedAgentData && (
            <Box
              style={{
                width: 360,
                flexShrink: 0,
                borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
                overflow: 'auto' as const,
                display: 'flex',
                flexDirection: 'column' as const,
                ...(isGlass ? { backdropFilter: tokens.glass?.blur, WebkitBackdropFilter: tokens.glass?.blur, backgroundColor: tokens.glass?.bgHeavy } : {}),
              }}
            >
              {/* Preview header */}
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${tokens.spacing[4]}px`,
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}
              >
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                  Agent Preview
                </Text>
                <Box
                  onClick={() => handlePreviewToggle(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: tokens.spacing[6],
                    height: tokens.spacing[6],
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: 'transparent',
                    color: tokens.colors.neutral[400],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  <X size={16} strokeWidth={1.5} />
                </Box>
              </Box>

              {/* Agent info */}
              <Box style={{ padding: tokens.spacing[4] }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
                  <Box
                    style={{
                      width: tokens.spacing[10],
                      height: tokens.spacing[10],
                      borderRadius: tokens.borderRadius.lg,
                      backgroundColor: tokens.colors.primaryScale[50],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: tokens.colors.primaryScale[600],
                    }}
                  >
                    {getAgentTypeIcon(selectedAgentData.type, 20)}
                  </Box>
                  <Box>
                    <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: typo.headingWeight, letterSpacing: typo.headingLetterSpacing, color: tokens.colors.neutral[900], display: 'block' }}>
                      {selectedAgentData.name}
                    </Text>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginTop: tokens.spacing[1] }}>
                      <Box style={{ ...createBadgeStyle(tokens, 'info'), fontSize: tokens.typography.fontSize.xs, padding: `0 ${tokens.spacing[2]}px`, textTransform: 'capitalize' as const }}>
                        <Text>{selectedAgentData.type}</Text>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                        <Box style={{ width: tokens.spacing[2], height: tokens.spacing[2], borderRadius: tokens.borderRadius.full, backgroundColor: getStatusInfo(selectedAgentData.status, tokens).color }} />
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: getStatusInfo(selectedAgentData.status, tokens).color }}>
                          {getStatusInfo(selectedAgentData.status, tokens).label}
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Details */}
                <Box
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.neutral[50],
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    marginBottom: tokens.spacing[4],
                  }}
                >
                  {[
                    { label: 'Language', value: getLanguageLabel(selectedAgentData.language) },
                    { label: 'Provider', value: selectedAgentData.voiceProvider },
                    ...(selectedAgentData.author ? [{ label: 'Author', value: selectedAgentData.author }] : []),
                  ].map((item) => (
                    <Box key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: `${tokens.spacing[2]}px 0`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{item.label}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>{item.value}</Text>
                    </Box>
                  ))}
                </Box>

                {/* Sample conversation preview */}
                {previewData && previewData.sampleConversation.length > 0 && (
                  <Box style={{ marginBottom: tokens.spacing[4] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600], display: 'block', marginBottom: tokens.spacing[2] }}>
                      Sample Conversation
                    </Text>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                      {previewData.sampleConversation.slice(0, 4).map((line, i) => {
                        const isAgent = i % 2 === 1;
                        return (
                          <Box key={i} style={{ display: 'flex', justifyContent: isAgent ? 'flex-start' : 'flex-end' }}>
                            <Box
                              style={{
                                maxWidth: '80%',
                                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                                borderRadius: tokens.borderRadius.md,
                                backgroundColor: isAgent ? tokens.colors.neutral[100] : tokens.colors.primaryScale[600],
                                color: isAgent ? tokens.colors.neutral[700] : tokens.colors.common.white,
                                fontSize: tokens.typography.fontSize.xs,
                                lineHeight: tokens.typography.lineHeight.relaxed,
                              }}
                            >
                              <Text>{line}</Text>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}

                {/* Cost */}
                {previewData && (
                  <Box
                    style={{
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.infoScale[50],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.infoScale[200]}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: tokens.spacing[4],
                    }}
                  >
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.infoScale[700], fontWeight: tokens.typography.fontWeight.medium }}>Est. Cost</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.infoScale[800] }}>
                      ${previewData.estimatedCost.toFixed(2)}
                    </Text>
                  </Box>
                )}

                {/* Actions */}
                <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
                  {onEdit && (
                    <Box
                      onClick={() => onEdit(selectedAgentData.id)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: tokens.colors.primaryScale[600],
                        color: tokens.colors.common.white,
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      <Pencil size={14} strokeWidth={1.5} />
                      <Text>Edit</Text>
                    </Box>
                  )}
                  {onDuplicate && (
                    <Box
                      onClick={() => onDuplicate(selectedAgentData.id)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        backgroundColor: tokens.colors.common.white,
                        color: tokens.colors.neutral[700],
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      <Copy size={14} strokeWidth={1.5} />
                      <Text>Duplicate</Text>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
