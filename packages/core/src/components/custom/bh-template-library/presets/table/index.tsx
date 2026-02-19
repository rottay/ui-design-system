'use client';

/**
 * BhTemplateLibrary - Table Preset
 * Sortable table view with inline expandable details, filter bar,
 * and industry-colored badges for template browsing.
 *
 * Design: Clean data-dense table with personality-driven accents,
 * expandable row details showing stages/agents/rubrics, and
 * interactive sort headers with icon indicators.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createCardHoverStyles,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createIconContainerStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
  createDividerStyle,
  getCardPadding,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createEntranceAnimation,
  createStaggerDelay,

  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type { BhTemplateLibraryProps, TemplateItem, TemplateFilter } from '../../core';
import {
  Search,
  Filter,
  LayoutGrid,
  LayoutList,
  ChevronDown,
  ChevronRight,
  Copy,
  History,
  GitCompare,
  Layers,
  Clock,
  Users,
  TrendingUp,
  X,
  Eye,
  CheckCircle,
  AlertCircle,
  MinusCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type SortField = 'name' | 'industry' | 'category' | 'status' | 'stageCount' | 'usageCount' | 'version';
type SortDir = 'asc' | 'desc';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function getStatusConfig(status: TemplateItem['status'], tokens: any) {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        bg: tokens.colors.successScale[100],
        color: tokens.colors.successScale[700],
        border: tokens.colors.successScale[200],
        Icon: CheckCircle,
      };
    case 'draft':
      return {
        label: 'Draft',
        bg: tokens.colors.warningScale[100],
        color: tokens.colors.warningScale[700],
        border: tokens.colors.warningScale[200],
        Icon: AlertCircle,
      };
    case 'disabled':
      return {
        label: 'Disabled',
        bg: tokens.colors.neutral[100],
        color: tokens.colors.neutral[500],
        border: tokens.colors.neutral[200],
        Icon: MinusCircle,
      };
  }
}

function getIndustryScale(industry: string, tokens: any) {
  const hash = industry.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const scales = [
    tokens.colors.primaryScale,
    tokens.colors.secondaryScale,
    tokens.colors.infoScale,
    tokens.colors.successScale,
    tokens.colors.warningScale,
  ];
  return scales[hash % scales.length];
}

function getAgentInitials(name: string): string {
  return name.split(' ').map((w, i) => w[0]).join('').toUpperCase().slice(0, 2);
}

function filterTemplates(templates: TemplateItem[], filters: TemplateFilter): TemplateItem[] {
  return templates.filter((t) => {
    if (filters.industry && t.industry !== filters.industry) return false;
    if (filters.category && t.category !== filters.category) return false;
    if (filters.status && t.status !== filters.status) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !(t.name || '').toLowerCase().includes(q) &&
        !(t.industry || '').toLowerCase().includes(q) &&
        !(t.category || '').toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });
}

function sortTemplates(templates: TemplateItem[], field: SortField, dir: SortDir): TemplateItem[] {
  return [...templates].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    let cmp = 0;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      cmp = aVal.localeCompare(bVal);
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      cmp = aVal - bVal;
    } else {
      cmp = String(aVal).localeCompare(String(bVal));
    }
    return dir === 'asc' ? cmp : -cmp;
  });
}

/* ------------------------------------------------------------------ */
/*  Table Preset                                                       */
/* ------------------------------------------------------------------ */
export const TableBhTemplateLibrary = createPreset<BhTemplateLibraryProps>({
  name: 'BhTemplateLibrary.Table',
  render: ({ primitives, props, tokens }: PresetContext<BhTemplateLibraryProps>) => {
    const { Box, Text } = primitives;

    const {
      templates: rawTemplates = [],
      filters: controlledFilters,
      onFilterChange,
      selectedTemplate: controlledSelected,
      onTemplateSelect,
      onClone,
      onCompare,
      onViewHistory,
      viewMode,
      onViewModeChange,
      className,
      style,
    } = props;

    const templates = Array.isArray(rawTemplates) ? rawTemplates : [];

    /* ── Local state ──────────────────────────────────────────── */
    const [localFilters, setLocalFilters] = useState<TemplateFilter>({
      industry: '',
      category: '',
      status: '',
      search: '',
    });
    const [localSelected, setLocalSelected] = useState<TemplateItem | null>(null);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDir, setSortDir] = useState<SortDir>('asc');
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const filters = controlledFilters ?? localFilters;
    const selectedTemplate = controlledSelected ?? localSelected;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const cardHover = useMemo(() => createCardHoverStyles(tokens), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const sectionHdr = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);
    const typo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const padding = useMemo(() => getCardPadding(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const divider = useMemo(() => createDividerStyle(tokens), [tokens]);

    /* ── Handlers ─────────────────────────────────────────────── */
    const handleFilterChange = useCallback(
      (patch: Partial<TemplateFilter>) => {
        const next = { ...filters, ...patch };
        if (onFilterChange) onFilterChange(next);
        else setLocalFilters(next);
      },
      [filters, onFilterChange],
    );

    const handleSelect = useCallback(
      (t: TemplateItem) => {
        if (onTemplateSelect) onTemplateSelect(t);
        else setLocalSelected(t);
      },
      [onTemplateSelect],
    );

    const handleSort = useCallback(
      (field: SortField) => {
        if (sortField === field) {
          setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
          setSortField(field);
          setSortDir('asc');
        }
      },
      [sortField],
    );

    const toggleExpand = useCallback((id: string) => {
      setExpandedRow((prev) => (prev === id ? null : id));
    }, []);

    /* ── Derived data ─────────────────────────────────────────── */
    const filtered = useMemo(() => filterTemplates(templates, filters), [templates, filters]);
    const sorted = useMemo(() => sortTemplates(filtered, sortField, sortDir), [filtered, sortField, sortDir]);
    const industries = useMemo(() => Array.from(new Set(templates.map((t) => t.industry))), [templates]);
    const categories = useMemo(() => Array.from(new Set(templates.map((t) => t.category))), [templates]);
    const entrance = useMemo(() => createEntranceAnimation(tokens), [tokens]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(tokens, index)}ms`,
    });

    /* ── Reusable style helpers ───────────────────────────────── */
    const thBaseStyle: React.CSSProperties = {
      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
      textAlign: 'left' as const,
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[500],
      textTransform: typo.labelTransform,
      letterSpacing: typo.labelLetterSpacing,
      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      backgroundColor: tokens.colors.neutral[50],
      whiteSpace: 'nowrap' as const,
      userSelect: 'none' as const,
    };

    const tdBaseStyle: React.CSSProperties = {
      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
      fontSize: tokens.typography.fontSize.sm,
      color: tokens.colors.neutral[700],
      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
      verticalAlign: 'middle' as const,
    };

    const stageColors = [
      tokens.colors.primaryScale[400],
      tokens.colors.infoScale[400],
      tokens.colors.successScale[400],
      tokens.colors.warningScale[400],
      tokens.colors.secondaryScale[400],
    ];

    /* ── Sub-component: SortHeader ────────────────────────────── */
    const SortHeader = ({ label, field }: { label: string; field: SortField }) => (
      <Box
        as="th"
        role="columnheader"
        tabIndex={0}
        aria-sort={sortField === field ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
        style={{ ...thBaseStyle, cursor: 'pointer' }}
        onClick={() => handleSort(field)}
        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort(field); } }}
      >
        <Text style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit', letterSpacing: 'inherit' }}>
          {label}
        </Text>
        {sortField === field && (
          <Box style={{ display: 'inline-flex', marginLeft: tokens.spacing[1], verticalAlign: 'middle' }}>
            {sortDir === 'asc' ? (
              <ArrowUp size={10} color={tokens.colors.primaryScale[500]} />
            ) : (
              <ArrowDown size={10} color={tokens.colors.primaryScale[500]} />
            )}
          </Box>
        )}
      </Box>
    );

    /* ── Sub-component: AgentAvatarStack ──────────────────────── */
    const AgentAvatarStack = ({ names }: { names: string[] }) => (
      <Box style={{ display: 'flex', alignItems: 'center' }}>
        {names.slice(0, 3).map((name, i) => (
          <Box
            key={i}
            title={name}
            style={{
              ...animStyle(i),
              width: 24,
              height: 24,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.primaryScale[(100 + ((i * 100) % 400)) as 100 | 200 | 300 | 400],
              color: tokens.colors.primaryScale[700],
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '9px',
              fontWeight: tokens.typography.fontWeight.semibold,
              marginLeft: i > 0 ? -6 : 0,
              border: `2px solid ${tokens.colors.common.white}`,
              position: 'relative' as const,
              zIndex: 10 - i,
            }}
          >
            <Text style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>
              {getAgentInitials(name)}
            </Text>
          </Box>
        ))}
        {names.length > 3 && (
          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginLeft: tokens.spacing[1] }}>
            +{names.length - 3}
          </Text>
        )}
      </Box>
    );

    /* ── Sub-component: ActionButton ──────────────────────────── */
    const ActionButton = ({
      icon,
      label,
      primary,
      onClick,
    }: {
      icon: React.ReactNode;
      label?: string;
      primary?: boolean;
      onClick: (e: React.MouseEvent) => void;
    }) => (
      <Box
        role="button"
        tabIndex={0}
        aria-label={label}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onClick(e);
        }}
        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onClick(e as unknown as React.MouseEvent); } }}
        title={label}
        style={{
          ...hoverStyle,
          display: 'inline-flex',
          alignItems: 'center',
          gap: tokens.spacing[1],
          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
          borderRadius: tokens.borderRadius.md,
          fontSize: tokens.typography.fontSize.xs,
          fontWeight: tokens.typography.fontWeight.medium,
          cursor: 'pointer',
          ...(primary
            ? {
                backgroundColor: tokens.colors.primaryScale[500],
                color: tokens.colors.common.white,
                border: 'none',
              }
            : {
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[600],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }),
        }}
      >
        {icon}
        {label && <Text style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>{label}</Text>}
      </Box>
    );

    /* ── Sub-component: FilterPill ────────────────────────────── */
    const FilterPill = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
      <Box
        role="tab"
        tabIndex={0}
        aria-selected={active}
        onClick={onClick}
        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
        style={{
          ...createFilterPillStyle(tokens, { active }),
          borderRadius: badgeRadius,
          cursor: 'pointer',
        }}
      >
        <Text style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>{label}</Text>
      </Box>
    );

    /* ── Sub-component: ExpandedDetail ────────────────────────── */
    const ExpandedDetail = ({ template }: { template: TemplateItem }) => {
      const accentBar = createPersonalityAccentBar(tokens);
      const skeleton = useMemo(() => createPersonalitySkeletonStyle(tokens), [tokens]);

      return (
        <Box
          style={{
            padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
            backgroundColor: tokens.colors.neutral[50],
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}
        >
          {accentBar && (
            <Box style={{ ...accentBar, marginBottom: tokens.spacing[4], borderRadius: tokens.borderRadius.md }} />
          )}
          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[5] }}>
            {/* Left: Stages */}
            <Box>
              <Text style={{ ...sectionHdr }}>Stages</Text>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                {template.stages.map((stage, i) => (
                  <Box
                    key={i}
                    style={{
                      ...animStyle(i),
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      padding: `${tokens.spacing[1]}px 0`,
                    }}
                  >
                    <Box style={createStatusDotStyle(tokens, stageColors[i % stageColors.length])} />
                    <Text style={{ flex: 1, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>
                      {stage.name}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                      {stage.type}
                    </Text>
                  </Box>
                ))}
              </Box>

              {/* SLA Timeline */}
              <Box style={{ marginTop: tokens.spacing[4] }}>
                <Text style={{ ...sectionHdr }}>SLA Timeline</Text>
                <Box
                  style={{
                    display: 'flex',
                    height: 22,
                    borderRadius: tokens.borderRadius.md,
                    overflow: 'hidden' as const,
                    marginTop: tokens.spacing[2],
                    marginBottom: tokens.spacing[1],
                  }}
                >
                  {template.stages.map((stage, i) => (
                    <Box
                      key={i}
                      title={stage.name}
                      style={{
                        ...animStyle(i),
                        flex: 1,
                        backgroundColor: stageColors[i % stageColors.length] + '60',
                        borderRight:
                          i < template.stages.length - 1
                            ? `2px solid ${tokens.colors.common.white}`
                            : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden' as const,
                        padding: `0 ${tokens.spacing[1]}px`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: '9px',
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[700],
                          whiteSpace: 'nowrap' as const,
                          overflow: 'hidden' as const,
                          textOverflow: 'ellipsis' as const,
                        }}
                      >
                        {stage.name.slice(0, 8)}
                      </Text>
                    </Box>
                  ))}
                </Box>
                <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: '10px', color: tokens.colors.neutral[400] }}>Start</Text>
                  <Text style={{ fontSize: '10px', color: tokens.colors.neutral[400] }}>{template.estimatedDuration}</Text>
                </Box>
              </Box>
            </Box>

            {/* Right: Agents & Rubrics */}
            <Box>
              {template.agentNames.length > 0 && (
                <Box style={{ marginBottom: tokens.spacing[4] }}>
                  <Text style={{ ...sectionHdr }}>Agents</Text>
                  <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[1] }}>
                    {template.agentNames.map((name, i) => (
                      <Box
                        key={i}
                        style={{
                          ...animStyle(i),
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: badgeRadius,
                          fontSize: '10px',
                          fontWeight: tokens.typography.fontWeight.medium,
                          backgroundColor: tokens.colors.neutral[100],
                          color: tokens.colors.neutral[600],
                        }}
                      >
                        <Users size={10} />
                        <Text style={{ fontSize: 'inherit', color: 'inherit' }}>{name}</Text>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {template.rubricNames.length > 0 && (
                <Box style={{ marginBottom: tokens.spacing[4] }}>
                  <Text style={{ ...sectionHdr }}>Rubrics</Text>
                  <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[1] }}>
                    {template.rubricNames.map((name, i) => (
                      <Box
                        key={i}
                        style={{
                          ...animStyle(i),
                          display: 'inline-flex',
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: badgeRadius,
                          fontSize: '10px',
                          fontWeight: tokens.typography.fontWeight.medium,
                          backgroundColor: tokens.colors.neutral[100],
                          color: tokens.colors.neutral[600],
                        }}
                      >
                        <Text style={{ fontSize: 'inherit', color: 'inherit' }}>{name}</Text>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Inline actions */}
              <Box style={{ display: 'flex', gap: tokens.spacing[2], marginTop: tokens.spacing[3] }}>
                <ActionButton
                  icon={<Eye size={12} />}
                  label="Select"
                  primary
                  onClick={() => handleSelect(template)}
                />
                {onClone && (
                  <ActionButton icon={<Copy size={12} />} label="Clone" onClick={() => onClone(template)} />
                )}
                {onViewHistory && (
                  <ActionButton icon={<History size={12} />} label="History" onClick={() => onViewHistory(template)} />
                )}
                {onCompare && (
                  <ActionButton icon={<GitCompare size={12} />} label="Compare" onClick={() => onCompare(template)} />
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      );
    };

    /* ── Main Render ──────────────────────────────────────────── */
    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column' as const,
          width: '100%',
          height: '100%',
          backgroundColor: tokens.colors.neutral[50],
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {/* =========================================================== */}
        {/*  Filter Bar                                                  */}
        {/* =========================================================== */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
            padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
            backgroundColor: tokens.colors.common.white,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            flexWrap: 'wrap' as const,
          }}
        >
          {/* Search */}
          <Box
            style={{
              flex: 1,
              minWidth: 220,
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              backgroundColor: tokens.colors.neutral[50],
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}
          >
            <Search size={14} color={tokens.colors.neutral[400]} />
            <input
              type="text"
              placeholder="Search templates..."
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                flex: 1,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[700],
              }}
            />
            {filters.search && (
              <Box
                role="button"
                tabIndex={0}
                aria-label="Clear search"
                onClick={() => handleFilterChange({ search: '' })}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilterChange({ search: '' }); } }}
                style={{ ...hoverStyle, display: 'flex', padding: 2, borderRadius: tokens.borderRadius.sm, cursor: 'pointer' }}
              >
                <X size={12} color={tokens.colors.neutral[400]} />
              </Box>
            )}
          </Box>

          {/* Industry pills */}
          <Box style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' as const }}>
            <FilterPill label="All" active={filters.industry === ''} onClick={() => handleFilterChange({ industry: '' })} />
            {industries.map((ind, i) => (
              <FilterPill key={ind} label={ind} active={filters.industry === ind} onClick={() => handleFilterChange({ industry: ind })} />
            ))}
          </Box>

          {/* Category dropdown */}
          <Box style={{ position: 'relative' as const, display: 'flex', alignItems: 'center' }}>
            <select
              style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                paddingRight: tokens.spacing[6],
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[700],
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none' as const,
              }}
              value={filters.category}
              onChange={(e) => handleFilterChange({ category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown
              size={12}
              style={{ position: 'absolute' as const, right: tokens.spacing[2], pointerEvents: 'none' as const }}
              color={tokens.colors.neutral[400]}
            />
          </Box>

          {/* Status chips */}
          <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
            {(['', 'active', 'draft', 'disabled'] as const).map((s) => (
              <FilterPill
                key={s}
                label={s === '' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
                active={filters.status === s}
                onClick={() => handleFilterChange({ status: s })}
              />
            ))}
          </Box>

          {/* View mode toggle */}
          {onViewModeChange && (
            <Box
              style={{
                display: 'flex',
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                overflow: 'hidden' as const,
                marginLeft: 'auto',
              }}
            >
              {([
                { mode: 'cards' as const, Icon: LayoutGrid },
                { mode: 'table' as const, Icon: LayoutList },
              ]).map(({ mode, Icon }) => (
                <Box
                  key={mode}
                  role="tab"
                  tabIndex={0}
                  aria-selected={viewMode === mode}
                  aria-label={`${mode} view`}
                  onClick={() => onViewModeChange(mode)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewModeChange(mode); } }}
                  style={{
                    ...hoverStyle,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    backgroundColor: viewMode === mode ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                    color: viewMode === mode ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                    borderLeft: mode === 'table' ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={14} />
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* =========================================================== */}
        {/*  Table Content                                               */}
        {/* =========================================================== */}
        <Box style={{ flex: 1, overflowY: 'auto' as const, padding: tokens.spacing[5] }}>
          <Box style={{ ...cardBase, overflow: 'hidden' as const, padding: 0 }}>
            {sorted.length === 0 ? (
              <Box style={createEmptyStateStyle(tokens)}>
                <Layers size={40} color={tokens.colors.neutral[300]} style={{ marginBottom: tokens.spacing[3] }} />
                <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[500] }}>
                  No templates found
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400], marginTop: tokens.spacing[1] }}>
                  Try adjusting your filters
                </Text>
              </Box>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' as const, tableLayout: 'fixed' as const }}>
                <thead>
                  <tr>
                    <Box as="th" style={{ ...thBaseStyle, width: 36 }} />
                    <SortHeader label="Name" field="name" />
                    <SortHeader label="Industry" field="industry" />
                    <SortHeader label="Category" field="category" />
                    <SortHeader label="Status" field="status" />
                    <SortHeader label="Stages" field="stageCount" />
                    <SortHeader label="Usage" field="usageCount" />
                    <Box as="th" style={thBaseStyle}>
                      <Text style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>Agents</Text>
                    </Box>
                    <Box as="th" style={thBaseStyle}>
                      <Text style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>Duration</Text>
                    </Box>
                    <Box as="th" style={{ ...thBaseStyle, width: 110 }}>
                      <Text style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>Actions</Text>
                    </Box>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((template, i) => {
                    const statusCfg = getStatusConfig(template.status, tokens);
                    const indScale = getIndustryScale(template.industry, tokens);
                    const isExpanded = expandedRow === template.id;
                    const isSelected = selectedTemplate?.id === template.id;
                    const isHovered = hoveredRow === template.id;

                    return (
                      <React.Fragment key={template.id}>
                        <tr
                          style={{
                            ...animStyle(i),
                            cursor: 'pointer',
                            transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                            backgroundColor: isSelected
                              ? tokens.colors.primaryScale[50]
                              : isHovered
                              ? tokens.colors.neutral[50]
                              : tokens.colors.common.white,
                          }}
                          onMouseEnter={() => setHoveredRow(template.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                          onClick={() => handleSelect(template)}
                        >
                          {/* Expand toggle */}
                          <td style={{ ...tdBaseStyle, width: 36, textAlign: 'center' as const }}>
                            <Box
                              role="button"
                              tabIndex={0}
                              aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                              aria-expanded={isExpanded}
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                toggleExpand(template.id);
                              }}
                              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); toggleExpand(template.id); } }}
                              style={{ ...hoverStyle, display: 'inline-flex', padding: 2, borderRadius: tokens.borderRadius.sm, cursor: 'pointer' }}
                            >
                              {isExpanded ? (
                                <ChevronDown size={14} color={tokens.colors.neutral[500]} />
                              ) : (
                                <ChevronRight size={14} color={tokens.colors.neutral[400]} />
                              )}
                            </Box>
                          </td>

                          {/* Name */}
                          <td style={tdBaseStyle}>
                            <Text
                              style={{
                                fontWeight: typo.headingWeight,
                                color: tokens.colors.neutral[900],
                                fontSize: tokens.typography.fontSize.sm,
                                display: 'block',
                              }}
                            >
                              {template.name}
                            </Text>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                              v{template.version}
                            </Text>
                          </td>

                          {/* Industry */}
                          <td style={tdBaseStyle}>
                            <Box
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                                borderRadius: badgeRadius,
                                fontSize: tokens.typography.fontSize.xs,
                                fontWeight: tokens.typography.fontWeight.medium,
                                backgroundColor: indScale[100],
                                color: indScale[700],
                                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${indScale[200]}`,
                              }}
                            >
                              <Text style={{ fontSize: 'inherit', color: 'inherit' }}>{template.industry}</Text>
                            </Box>
                          </td>

                          {/* Category */}
                          <td style={tdBaseStyle}>
                            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>
                              {template.category}
                            </Text>
                          </td>

                          {/* Status */}
                          <td style={tdBaseStyle}>
                            <Box
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: tokens.spacing[1],
                                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                                borderRadius: badgeRadius,
                                fontSize: tokens.typography.fontSize.xs,
                                fontWeight: tokens.typography.fontWeight.medium,
                                backgroundColor: statusCfg.bg,
                                color: statusCfg.color,
                                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusCfg.border}`,
                              }}
                            >
                              <statusCfg.Icon size={10} />
                              <Text style={{ fontSize: 'inherit', color: 'inherit' }}>{statusCfg.label}</Text>
                            </Box>
                          </td>

                          {/* Stages */}
                          <td style={tdBaseStyle}>
                            <Box style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                              <Layers size={12} color={tokens.colors.infoScale[500]} />
                              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>
                                {template.stageCount}
                              </Text>
                            </Box>
                          </td>

                          {/* Usage */}
                          <td style={tdBaseStyle}>
                            <Box style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                              <TrendingUp size={12} color={tokens.colors.successScale[500]} />
                              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>
                                {template.usageCount}
                              </Text>
                            </Box>
                          </td>

                          {/* Agents */}
                          <td style={tdBaseStyle}>
                            <AgentAvatarStack names={template.agentNames} />
                          </td>

                          {/* Duration */}
                          <td style={tdBaseStyle}>
                            <Box style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                              <Clock size={12} color={tokens.colors.neutral[400]} />
                              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                                {template.estimatedDuration}
                              </Text>
                            </Box>
                          </td>

                          {/* Actions */}
                          <td style={{ ...tdBaseStyle, width: 110 }}>
                            <Box
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: tokens.spacing[1],
                                opacity: isHovered ? 1 : 0,
                                transition: `opacity ${tokens.transitions?.fast || tokens.motion.hover}`,
                              }}
                            >
                              <ActionButton icon={<Eye size={12} />} primary onClick={() => handleSelect(template)} />
                              {onClone && <ActionButton icon={<Copy size={12} />} onClick={() => onClone(template)} />}
                              {onViewHistory && <ActionButton icon={<History size={12} />} onClick={() => onViewHistory(template)} />}
                              {onCompare && <ActionButton icon={<GitCompare size={12} />} onClick={() => onCompare(template)} />}
                            </Box>
                          </td>
                        </tr>

                        {/* Expanded inline details */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={10} style={{ padding: 0, border: 'none' }}>
                              <ExpandedDetail template={template} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Box>
        </Box>
      </Box>
    );
  },
});
