'use client';

/**
 * BhPipelineSimulator - Library Preset
 * Saved scenarios library with scenario cards, compare mode,
 * clone/delete actions, search, and filtering.
 *
 * Layout:
 * - Header: title, search bar, filter by job
 * - Compare mode toggle and selection
 * - Scenario cards grid with key metrics, status badges, and actions
 * - Empty state when no scenarios exist
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Search,
  Copy,
  Trash2,
  BarChart3,
  GitCompare,
  Filter,
  Calendar,
  Target,
  Clock,
  Users,
  CheckCircle2,
  FileText,
  Archive,
  Edit3,
  Loader2,
  X,
  FolderOpen,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createCardHoverStyles,
  createBadgeStyle,
  createEmptyStateStyle,
  createPanelHeaderStyle,
  createDividerStyle,
  getPersonalityTypography,
  clickableProps,
  formatDistanceToNow,
  ICON_SIZES,
  numericValue,
} from '../../../helpers';
import type {
  BhPipelineSimulatorProps,
  ScenarioItem,
} from '../../core';
import { formatPercentage, getProbabilityColor } from '../../core';

/* ------------------------------------------------------------------ */
/*  Status config                                                      */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG: Record<ScenarioItem['status'], { label: string; color: 'success' | 'warning' | 'secondary' }> = {
  completed: { label: 'Completed', color: 'success' },
  draft: { label: 'Draft', color: 'warning' },
  archived: { label: 'Archived', color: 'secondary' },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const LibraryBhPipelineSimulator = createPreset<BhPipelineSimulatorProps>(
  'LibraryBhPipelineSimulator',
  ({ primitives: { Box, Text, Button, Input }, props, tokens }: PresetContext<BhPipelineSimulatorProps>) => {
    const {
      scenarios = [],
      onDeleteScenario,
      onCloneScenario,
      onCompareScenarios,
      onLoadScenario,
      loading = false,
      className,
      style,
    } = props;

    // ========================================================================
    // STATE
    // ========================================================================

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<ScenarioItem['status'] | 'all'>('all');
    const [compareMode, setCompareMode] = useState(false);
    const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
    const [cloneTargetId, setCloneTargetId] = useState<string | null>(null);
    const [cloneName, setCloneName] = useState('');

    // ========================================================================
    // DERIVED
    // ========================================================================

    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const cardHover = useMemo(() => createCardHoverStyles(tokens), [tokens]);

    const filteredScenarios = useMemo(() => {
      let result = scenarios;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        result = result.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.jobTitle?.toLowerCase().includes(q) ||
            s.description?.toLowerCase().includes(q)
        );
      }

      if (statusFilter !== 'all') {
        result = result.filter((s) => s.status === statusFilter);
      }

      return result;
    }, [scenarios, searchQuery, statusFilter]);

    // ========================================================================
    // HANDLERS
    // ========================================================================

    const toggleCompareSelection = useCallback((id: string) => {
      setSelectedForCompare((prev) => {
        if (prev.includes(id)) return prev.filter((s) => s !== id);
        if (prev.length >= 3) return prev;
        return [...prev, id];
      });
    }, []);

    const handleCompare = useCallback(() => {
      if (selectedForCompare.length >= 2) {
        onCompareScenarios?.(selectedForCompare);
      }
    }, [onCompareScenarios, selectedForCompare]);

    const handleClone = useCallback((scenarioId: string) => {
      if (!cloneName.trim()) return;
      onCloneScenario?.(scenarioId, cloneName);
      setCloneTargetId(null);
      setCloneName('');
    }, [onCloneScenario, cloneName]);

    // ========================================================================
    // STYLES
    // ========================================================================

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: numericValue(tokens.spacing[6]),
      padding: numericValue(tokens.spacing[6]),
      background: tokens.colors.common.white,
      borderRadius: numericValue(tokens.borderRadius.lg),
      border: `1px solid ${tokens.colors.neutral[200]}`,
      ...style,
    };

    const headerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: numericValue(tokens.spacing[4]),
      flexWrap: 'wrap' as const,
    };

    const searchBarStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: numericValue(tokens.spacing[2]),
      flex: 1,
      maxWidth: 360,
    };

    const filtersStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: numericValue(tokens.spacing[2]),
      flexWrap: 'wrap' as const,
    };

    const gridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(340, 1fr))',
      gap: numericValue(tokens.spacing[4]),
    };

    const scenarioCardStyle: React.CSSProperties = {
      ...createCardStyle(tokens),
      display: 'flex',
      flexDirection: 'column',
      gap: numericValue(tokens.spacing[2]),
      padding: numericValue(tokens.spacing[4]),
      cursor: 'pointer',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    };

    const badgeColorMap: Record<string, React.CSSProperties> = {
      success: {
        background: tokens.colors.successScale?.[100] ?? tokens.colors.success,
        color: tokens.colors.successScale?.[700] ?? tokens.colors.success,
        border: `1px solid ${tokens.colors.successScale?.[200] ?? tokens.colors.success}`,
      },
      warning: {
        background: tokens.colors.warningScale?.[100] ?? tokens.colors.warning,
        color: tokens.colors.warningScale?.[700] ?? tokens.colors.warning,
        border: `1px solid ${tokens.colors.warningScale?.[200] ?? tokens.colors.warning}`,
      },
      secondary: {
        background: tokens.colors.secondaryScale?.[100] ?? tokens.colors.secondary,
        color: tokens.colors.secondaryScale?.[700] ?? tokens.colors.secondary,
        border: `1px solid ${tokens.colors.secondaryScale?.[200] ?? tokens.colors.secondary}`,
      },
      error: {
        background: tokens.colors.errorScale?.[100] ?? tokens.colors.error,
        color: tokens.colors.errorScale?.[700] ?? tokens.colors.error,
        border: `1px solid ${tokens.colors.errorScale?.[200] ?? tokens.colors.error}`,
      },
    };

    const filterPillStyle = (active: boolean): React.CSSProperties => ({
      padding: '4px 12px',
      borderRadius: numericValue(tokens.borderRadius.full),
      fontSize: 12,
      fontWeight: active ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
      background: active
        ? tokens.colors.primaryScale?.[50] ?? tokens.colors.primary
        : tokens.colors.common.white,
      color: active
        ? tokens.colors.primaryScale?.[700] ?? tokens.colors.primary
        : tokens.colors.neutral[500],
      border: `1px solid ${active
        ? tokens.colors.primaryScale?.[200] ?? tokens.colors.primary
        : tokens.colors.neutral[200]}`,
      cursor: 'pointer',
      userSelect: 'none' as const,
    });

    // ========================================================================
    // RENDER HELPERS
    // ========================================================================

    const renderScenarioCard = (scenario: ScenarioItem) => {
      const isSelected = selectedForCompare.includes(scenario.id);
      const statusConf = STATUS_CONFIG[scenario.status];
      const badgeColors = badgeColorMap[statusConf.color] ?? badgeColorMap.secondary;

      const cardBorder = isSelected
        ? `2px solid ${tokens.colors.primaryScale?.[500] ?? tokens.colors.primary}`
        : `1px solid ${tokens.colors.neutral[200]}`;

      return (
        <Box
          key={scenario.id}
          style={{
            ...scenarioCardStyle,
            border: cardBorder,
          }}
          {...clickableProps(() => {
            if (compareMode) {
              toggleCompareSelection(scenario.id);
            } else {
              onLoadScenario?.(scenario);
            }
          })}
        >
          {/* Card Header */}
          <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: numericValue(tokens.spacing[2]) }}>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                {scenario.name}
              </Text>
              {scenario.jobTitle && (
                <Text style={{ fontSize: 12, color: tokens.colors.neutral[500] }}>
                  {scenario.jobTitle}
                </Text>
              )}
            </Box>
            <Box
              style={{
                ...badgeColors,
                padding: '2px 8px',
                borderRadius: numericValue(tokens.borderRadius.full),
                fontSize: 10,
                fontWeight: tokens.typography.fontWeight.semibold,
                textTransform: 'uppercase' as const,
                flexShrink: 0,
              }}
            >
              <Text style={{ fontSize: 10, color: badgeColors.color }}>{statusConf.label}</Text>
            </Box>
          </Box>

          {/* Description */}
          {scenario.description && (
            <Text style={{ fontSize: 12, color: tokens.colors.neutral[500], lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
              {scenario.description}
            </Text>
          )}

          {/* Metrics */}
          {scenario.results && (
            <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: numericValue(tokens.spacing[2]), paddingTop: numericValue(tokens.spacing[1]) }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Users size={12} color={tokens.colors.neutral[500]} />
                <Text style={{ fontSize: 11, color: tokens.colors.neutral[500] }}>
                  {scenario.results.outcomes.expectedHires} hires
                </Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} color={tokens.colors.neutral[500]} />
                <Text style={{ fontSize: 11, color: tokens.colors.neutral[500] }}>
                  {scenario.results.outcomes.expectedTimeToFill}d
                </Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Target size={12} color={tokens.colors.neutral[500]} />
                <Text style={{ fontSize: 11, color: tokens.colors.neutral[500] }}>
                  {formatPercentage(scenario.results.outcomes.probabilityOfMeetingTarget, 0)}
                </Text>
              </Box>
              {scenario.results.bottlenecks.length > 0 && (
                <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Box
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: numericValue(tokens.borderRadius.full),
                      background: scenario.results.bottlenecks.some((b) => b.severity === 'high')
                        ? tokens.colors.errorScale?.[500] ?? tokens.colors.error
                        : tokens.colors.warningScale?.[500] ?? tokens.colors.warning,
                    }}
                  />
                  <Text style={{ fontSize: 11, color: tokens.colors.neutral[500] }}>
                    {scenario.results.bottlenecks.length} bottleneck(s)
                  </Text>
                </Box>
              )}
            </Box>
          )}

          {/* Footer: date + actions */}
          <Box style={{ ...createDividerStyle(tokens), marginTop: numericValue(tokens.spacing[1]) }} />
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={11} color={tokens.colors.neutral[500]} />
              <Text style={{ fontSize: 11, color: tokens.colors.neutral[500] }}>
                {formatDistanceToNow(new Date(scenario.createdAt))}
              </Text>
            </Box>

            {!compareMode && (
              <Box style={{ display: 'flex', gap: numericValue(tokens.spacing[1]) }}>
                <div
                  {...clickableProps(() => {
                    setCloneTargetId(scenario.id);
                    setCloneName(`${scenario.name} (Copy)`);
                  })}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setCloneTargetId(scenario.id);
                    setCloneName(`${scenario.name} (Copy)`);
                  }}
                  style={{
                    padding: 4,
                    borderRadius: numericValue(tokens.borderRadius.sm),
                    color: tokens.colors.neutral[500],
                    cursor: 'pointer',
                  }}
                  title="Clone"
                >
                  <Copy size={14} />
                </div>
                <div
                  {...clickableProps(() => {
                    onDeleteScenario?.(scenario.id);
                  })}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    onDeleteScenario?.(scenario.id);
                  }}
                  style={{
                    padding: 4,
                    borderRadius: numericValue(tokens.borderRadius.sm),
                    color: tokens.colors.errorScale?.[500] ?? tokens.colors.error,
                    cursor: 'pointer',
                  }}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </div>
              </Box>
            )}

            {compareMode && (
              <Box
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: numericValue(tokens.borderRadius.sm),
                  border: `2px solid ${isSelected
                    ? tokens.colors.primaryScale?.[500] ?? tokens.colors.primary
                    : tokens.colors.neutral[200]}`,
                  background: isSelected
                    ? tokens.colors.primaryScale?.[500] ?? tokens.colors.primary
                    : tokens.colors.common.white,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isSelected && <CheckCircle2 size={14} color={tokens.colors.common.white} />}
              </Box>
            )}
          </Box>
        </Box>
      );
    };

    const renderCloneModal = () => {
      if (!cloneTargetId) return null;

      return (
        <Box
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          {...clickableProps(() => { setCloneTargetId(null); setCloneName(''); })}
        >
          <Box
            style={{
              background: tokens.colors.common.white,
              borderRadius: numericValue(tokens.borderRadius.lg),
              padding: numericValue(tokens.spacing[6]),
              width: 380,
              maxWidth: '90vw',
              display: 'flex',
              flexDirection: 'column',
              gap: numericValue(tokens.spacing[4]),
              boxShadow: tokens.shadows?.lg ?? '0 8px 32px rgba(0,0,0,0.15)',
            }}
            {...clickableProps(() => {})}
          >
            <Text style={{ fontSize: 16, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
              Clone Scenario
            </Text>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: numericValue(tokens.spacing[2]) }}>
              <Text style={{ fontSize: 12, color: tokens.colors.neutral[500] }}>New Name</Text>
              <Input
                value={cloneName}
                onChange={(value: string) => setCloneName(value)}
                placeholder="Scenario name..."
                style={{ width: '100%' }}
              />
            </Box>
            <Box style={{ display: 'flex', justifyContent: 'flex-end', gap: numericValue(tokens.spacing[2]) }}>
              <Button
                variant="default"
                size="sm"
                onClick={() => { setCloneTargetId(null); setCloneName(''); }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleClone(cloneTargetId)}
                disabled={!cloneName.trim()}
              >
                Clone
              </Button>
            </Box>
          </Box>
        </Box>
      );
    };

    // ========================================================================
    // MAIN RENDER
    // ========================================================================

    if (loading) {
      return (
        <Box style={{ ...containerStyle, ...createEmptyStateStyle(tokens) }} className={className}>
          <Loader2
            size={ICON_SIZES.feature}
            color={tokens.colors.primaryScale?.[500] ?? tokens.colors.primary}
            style={{ animation: 'spin 1s linear infinite' }}
          />
          <Text style={{ fontSize: 14, color: tokens.colors.neutral[500] }}>
            Loading scenarios...
          </Text>
        </Box>
      );
    }

    return (
      <Box style={containerStyle} className={className}>
        {/* Header */}
        <Box style={headerStyle}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: numericValue(tokens.spacing[2]) }}>
            <FolderOpen size={ICON_SIZES.section} color={tokens.colors.primaryScale?.[600] ?? tokens.colors.primary} />
            <Text style={{ fontSize: 18, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
              Saved Scenarios
            </Text>
            <Box
              style={{
                background: tokens.colors.primaryScale?.[100] ?? tokens.colors.primary,
                color: tokens.colors.primaryScale?.[700] ?? tokens.colors.primary,
                padding: '2px 8px',
                borderRadius: numericValue(tokens.borderRadius.full),
                fontSize: 12,
                fontWeight: tokens.typography.fontWeight.semibold,
              }}
            >
              <Text style={{ fontSize: 12, color: tokens.colors.primaryScale?.[700] ?? tokens.colors.primary }}>
                {scenarios.length}
              </Text>
            </Box>
          </Box>

          <Box style={{ display: 'flex', gap: numericValue(tokens.spacing[2]) }}>
            <Button
              variant={compareMode ? 'primary' : 'default'}
              size="sm"
              onClick={() => {
                setCompareMode(!compareMode);
                setSelectedForCompare([]);
              }}
              style={compareMode ? {
                background: tokens.colors.primaryScale?.[600] ?? tokens.colors.primary,
                color: tokens.colors.common.white,
              } : undefined}
            >
              <GitCompare size={14} style={{ marginRight: 6 }} />
              {compareMode ? 'Exit Compare' : 'Compare'}
            </Button>
          </Box>
        </Box>

        {/* Compare bar */}
        {compareMode && (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: numericValue(tokens.spacing[2]),
              background: tokens.colors.primaryScale?.[50] ?? tokens.colors.common.white,
              borderRadius: numericValue(tokens.borderRadius.md),
              border: `1px solid ${tokens.colors.primaryScale?.[200] ?? tokens.colors.neutral[200]}`,
            }}
          >
            <Text style={{ fontSize: 13, color: tokens.colors.primaryScale?.[700] ?? tokens.colors.neutral[900] }}>
              Select 2-3 scenarios to compare ({selectedForCompare.length}/3 selected)
            </Text>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCompare}
              disabled={selectedForCompare.length < 2}
              style={{
                background: tokens.colors.primaryScale?.[600] ?? tokens.colors.primary,
                color: tokens.colors.common.white,
              }}
            >
              Compare Selected
            </Button>
          </Box>
        )}

        {/* Search & Filters */}
        <Box style={filtersStyle}>
          <Box style={searchBarStyle}>
            <Search size={16} color={tokens.colors.neutral[500]} />
            <Input
              value={searchQuery}
              onChange={(value: string) => setSearchQuery(value)}
              placeholder="Search scenarios..."
              style={{ flex: 1 }}
            />
            {searchQuery && (
              <div
                {...clickableProps(() => setSearchQuery(''))}
                style={{ cursor: 'pointer', padding: 2 }}
              >
                <X size={14} color={tokens.colors.neutral[500]} />
              </div>
            )}
          </Box>

          <Box style={{ display: 'flex', gap: 6 }}>
            {(['all', 'completed', 'draft', 'archived'] as const).map((status) => (
              <div
                key={status}
                style={filterPillStyle(statusFilter === status)}
                {...clickableProps(() => setStatusFilter(status))}
              >
                {status === 'all' ? 'All' : STATUS_CONFIG[status].label}
              </div>
            ))}
          </Box>
        </Box>

        {/* Scenarios Grid */}
        {filteredScenarios.length === 0 ? (
          <Box style={{ ...createEmptyStateStyle(tokens), padding: numericValue(tokens.spacing[8]) }}>
            {scenarios.length === 0 ? (
              <>
                <FolderOpen size={40} color={tokens.colors.primaryScale?.[200] ?? tokens.colors.primary} />
                <Text style={{ fontSize: 14, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[500] }}>
                  No saved scenarios yet
                </Text>
                <Text style={{ fontSize: 12, color: tokens.colors.neutral[500], textAlign: 'center' as const, maxWidth: 300 }}>
                  Run a simulation and save it as a scenario to see it here.
                </Text>
              </>
            ) : (
              <>
                <Search size={40} color={tokens.colors.primaryScale?.[200] ?? tokens.colors.primary} />
                <Text style={{ fontSize: 14, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[500] }}>
                  No scenarios match your filters
                </Text>
              </>
            )}
          </Box>
        ) : (
          <Box style={gridStyle}>
            {filteredScenarios.map(renderScenarioCard)}
          </Box>
        )}

        {/* Clone Modal */}
        {renderCloneModal()}
      </Box>
    );
  }
);
