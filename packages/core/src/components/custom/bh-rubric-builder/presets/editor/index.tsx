'use client';

/**
 * BhRubricBuilder - Editor Preset
 * Full rubric editing experience with dimension list, weight visualization,
 * score level config, knockout rules, scorecard preview, and validation panel.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
import type {
  BhRubricBuilderProps,
  ScoringDimension,
  ScoreLevel,
  ValidationError,
  RubricStatus,
  ScorableType,
} from '../../core';
import {
  getRubricStatusColors,
  getScorableTypeColors,
  getDimensionColors,
  formatScorableType,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  Send,
  Flag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Target,
  Eye,
  EyeOff,
  BarChart3,
  Sliders,
  Shield,
  CircleDot,
  Hash,
  Type,
  FileText,
  AlertCircle,
  Radar,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helper: generate SVG pie chart paths                               */
/* ------------------------------------------------------------------ */
function generatePieSlices(
  weights: { label: string; value: number; color: string }[],
  cx: number,
  cy: number,
  radius: number
): { d: string; color: string; label: string; value: number }[] {
  const total = weights.reduce((sum, w) => sum + w.value, 0);
  if (total === 0) return [];

  const slices: { d: string; color: string; label: string; value: number }[] = [];
  let currentAngle = -Math.PI / 2;

  for (const w of weights) {
    const sliceAngle = (w.value / total) * 2 * Math.PI;
    const x1 = cx + radius * Math.cos(currentAngle);
    const y1 = cy + radius * Math.sin(currentAngle);
    const x2 = cx + radius * Math.cos(currentAngle + sliceAngle);
    const y2 = cy + radius * Math.sin(currentAngle + sliceAngle);
    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const d = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    slices.push({ d, color: w.color, label: w.label, value: w.value });
    currentAngle += sliceAngle;
  }

  return slices;
}

/* ------------------------------------------------------------------ */
/*  Helper: generate SVG radar chart                                   */
/* ------------------------------------------------------------------ */
function generateRadarPoints(
  values: { label: string; value: number; maxValue: number }[],
  cx: number,
  cy: number,
  radius: number
): { polygon: string; gridLines: string[][]; labels: { x: number; y: number; label: string }[] } {
  const count = values.length;
  if (count < 3) {
    return { polygon: '', gridLines: [], labels: [] };
  }

  const angleStep = (2 * Math.PI) / count;
  const startAngle = -Math.PI / 2;

  const points: string[] = [];
  const labels: { x: number; y: number; label: string }[] = [];
  const gridLines: string[][] = [];

  /* Grid levels: 25%, 50%, 75%, 100% */
  for (const pct of [0.25, 0.5, 0.75, 1]) {
    const ring: string[] = [];
    for (let i = 0; i < count; i++) {
      const angle = startAngle + i * angleStep;
      const x = cx + radius * pct * Math.cos(angle);
      const y = cy + radius * pct * Math.sin(angle);
      ring.push(`${x},${y}`);
    }
    gridLines.push(ring);
  }

  for (let i = 0; i < count; i++) {
    const angle = startAngle + i * angleStep;
    const normalizedValue = values[i].maxValue > 0 ? values[i].value / values[i].maxValue : 0;
    const clampedValue = Math.min(Math.max(normalizedValue, 0), 1);
    const x = cx + radius * clampedValue * Math.cos(angle);
    const y = cy + radius * clampedValue * Math.sin(angle);
    points.push(`${x},${y}`);

    const labelRadius = radius + 18;
    const lx = cx + labelRadius * Math.cos(angle);
    const ly = cy + labelRadius * Math.sin(angle);
    labels.push({ x: lx, y: ly, label: values[i].label });
  }

  return {
    polygon: points.join(' '),
    gridLines,
    labels,
  };
}

/* ------------------------------------------------------------------ */
/*  Editor Preset                                                      */
/* ------------------------------------------------------------------ */
export const EditorBhRubricBuilder = createPreset<BhRubricBuilderProps>({
  name: 'BhRubricBuilder.Editor',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhRubricBuilderProps>) => {
    const { Box, Text } = primitives;

    const {
      rubricName,
      industry,
      scorableType,
      status,
      dimensions: dimensionsProp,
      scoreLevels: scoreLevelsProp,
      selectedDimension: selectedDimensionProp = null,
      validationErrors: validationErrorsProp,
      isDirty: isDirtyProp,
      onChange,
      onDimensionAdd,
      onDimensionRemove,
      onDimensionReorder,
      onDimensionSelect,
      onPublish,
      onSave,
      showPreview: showPreviewProp = false,
      onPreviewToggle,
      className,
      style,
    } = props;

    /* ── Local State ──────────────────────────────────────────────── */
    const [localDimensions, setLocalDimensions] = useState<ScoringDimension[]>(dimensionsProp);
    const [localSelectedDimension, setLocalSelectedDimension] = useState<string | null>(selectedDimensionProp);
    const [dragState, setDragState] = useState<{ dragging: string | null; over: string | null }>({
      dragging: null,
      over: null,
    });
    const [localScoreLevels, setLocalScoreLevels] = useState<ScoreLevel[]>(scoreLevelsProp);
    const [localValidationErrors, setLocalValidationErrors] = useState<ValidationError[]>(validationErrorsProp);
    const [localShowPreview, setLocalShowPreview] = useState(showPreviewProp);
    const [localIsDirty, setLocalIsDirty] = useState(isDirtyProp);

    /* ── Derived ──────────────────────────────────────────────────── */
    const sortedDimensions = useMemo(
      () => [...localDimensions].sort((a, b) => a.order - b.order),
      [localDimensions]
    );

    const totalWeight = useMemo(
      () => localDimensions.reduce((sum, d) => sum + d.weight, 0),
      [localDimensions]
    );

    const weightIsValid = useMemo(
      () => Math.abs(totalWeight - 1.0) < 0.01,
      [totalWeight]
    );

    const activeDimension = useMemo(
      () => localDimensions.find((d) => d.id === localSelectedDimension) ?? null,
      [localDimensions, localSelectedDimension]
    );

    const knockoutDimensions = useMemo(
      () => localDimensions.filter((d) => d.isKnockout),
      [localDimensions]
    );

    const codesUnique = useMemo(() => {
      const codes = localDimensions.map((d) => d.code);
      return new Set(codes).size === codes.length;
    }, [localDimensions]);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;

    const statusColors = useMemo(() => getRubricStatusColors(tokens), [tokens]);
    const scorableColors = useMemo(() => getScorableTypeColors(tokens), [tokens]);
    const dimColors = useMemo(() => getDimensionColors(tokens), [tokens]);

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const cardInteractive = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass, interactive: true }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    /* ── Handlers ─────────────────────────────────────────────────── */
    const handleDimensionSelect = useCallback(
      (dimId: string | null) => {
        setLocalSelectedDimension(dimId);
        onDimensionSelect?.(dimId);
      },
      [onDimensionSelect]
    );

    const handleDimensionRemove = useCallback(
      (dimId: string) => {
        setLocalDimensions((prev) => prev.filter((d) => d.id !== dimId));
        if (localSelectedDimension === dimId) setLocalSelectedDimension(null);
        onDimensionRemove?.(dimId);
        setLocalIsDirty(true);
      },
      [onDimensionRemove, localSelectedDimension]
    );

    const handleWeightChange = useCallback(
      (dimId: string, newWeight: number) => {
        setLocalDimensions((prev) =>
          prev.map((d) => (d.id === dimId ? { ...d, weight: newWeight } : d))
        );
        onChange?.(`dimensions.${dimId}.weight`, newWeight);
        setLocalIsDirty(true);
      },
      [onChange]
    );

    const handleDragStart = useCallback((dimId: string) => {
      setDragState({ dragging: dimId, over: null });
    }, []);

    const handleDragOver = useCallback(
      (dimId: string) => {
        if (dragState.dragging && dragState.dragging !== dimId) {
          setDragState((prev) => ({ ...prev, over: dimId }));
        }
      },
      [dragState.dragging]
    );

    const handleDragEnd = useCallback(() => {
      if (dragState.dragging && dragState.over) {
        const fromDim = localDimensions.find((d) => d.id === dragState.dragging);
        const toDim = localDimensions.find((d) => d.id === dragState.over);
        if (fromDim && toDim) {
          onDimensionReorder?.(fromDim.id, toDim.order);
          setLocalIsDirty(true);
        }
      }
      setDragState({ dragging: null, over: null });
    }, [dragState, localDimensions, onDimensionReorder]);

    const handleScoreLevelChange = useCallback(
      (idx: number, field: keyof ScoreLevel, value: string | number) => {
        setLocalScoreLevels((prev) =>
          prev.map((sl, i) => (i === idx ? { ...sl, [field]: value } : sl))
        );
        onChange?.(`scoreLevels.${idx}.${field}`, value);
        setLocalIsDirty(true);
      },
      [onChange]
    );

    const handleSave = useCallback(() => {
      onSave?.();
      setLocalIsDirty(false);
    }, [onSave]);

    const handlePreviewToggle = useCallback(() => {
      setLocalShowPreview((prev) => !prev);
      onPreviewToggle?.();
    }, [onPreviewToggle]);

    /* ── Sample scores for preview radar chart ────────────────────── */
    const sampleScores = useMemo(
      () =>
        sortedDimensions.map((d) => ({
          label: d.code || d.name.substring(0, 4),
          value: 60 + Math.floor(Math.random() * 35),
          maxValue: 100,
        })),
      [sortedDimensions]
    );

    /* ================================================================ */
    /*  RENDER                                                          */
    /* ================================================================ */
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
        {/* ── Rubric Header ────────────────────────────────────────── */}
        <div
          style={{
            ...cardBase,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: tokens.spacing[4],
            borderRadius: tokens.borderRadius.none,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flex: 1 }}>
            <Target size={20} color={tokens.colors.primaryScale[600]} strokeWidth={1.5} />
            <input
              type="text"
              value={rubricName}
              onChange={(e) => {
                onChange?.('rubricName', e.target.value);
                setLocalIsDirty(true);
              }}
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                border: 'none',
                outline: 'none',
                background: 'transparent',
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.md,
                minWidth: 200,
              }}
              placeholder="Rubric Name"
            
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = tokens.colors.neutral[300];
              }}
            />

            {/* Industry badge */}
            <span style={{ ...createBadgeStyle(tokens, 'secondary') }}>{industry}</span>

            {/* Scorable type badge */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: scorableColors[scorableType].bg,
                color: scorableColors[scorableType].color,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${scorableColors[scorableType].border}`,
              }}
            >
              {formatScorableType(scorableType)}
            </span>

            {/* Status badge */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: statusColors[status].bg,
                color: statusColors[status].color,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusColors[status].border}`,
                gap: tokens.spacing[1],
              }}
            >
              <CircleDot size={10} />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            {localIsDirty && (
              <span
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.warningScale[600],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                Unsaved changes
              </span>
            )}
            <button
              onClick={handlePreviewToggle}
              style={{
                ...hoverStyle,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: localShowPreview
                  ? tokens.colors.primaryScale[50]
                  : tokens.colors.common.white,
                color: localShowPreview
                  ? tokens.colors.primaryScale[700]
                  : tokens.colors.neutral[700],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              {localShowPreview ? <EyeOff size={14} /> : <Eye size={14} />}
              {localShowPreview ? 'Hide Preview' : 'Preview'}
            </button>
            <button
              onClick={handleSave}
              style={{
                ...hoverStyle,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
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
              <Save size={14} />
              Save
            </button>
            <button
              onClick={onPublish}
              style={{
                ...hoverStyle,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: 'none',
                backgroundColor: tokens.colors.primaryScale[600],
                color: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <Send size={14} />
              Publish
            </button>
          </div>
        </div>

        {/* ── Main Content ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* ── Left: Dimensions + Weight ─────────────────────────── */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: tokens.spacing[5],
              display: 'flex',
              flexDirection: 'column' as const,
              gap: tokens.spacing[5],
            }}
          >
            {/* Dimensions List */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: tokens.spacing[3],
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <Sliders size={16} color={tokens.colors.primaryScale[600]} />
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[500],
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.05em',
                    }}
                  >
                    Dimensions ({sortedDimensions.length})
                  </Text>
                </div>
                <button
                  onClick={() => {
                    onDimensionAdd?.();
                    setLocalIsDirty(true);
                  }}
                  style={{
                    ...hoverStyle,
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    backgroundColor: tokens.colors.common.white,
                    color: tokens.colors.neutral[600],
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  <Plus size={12} />
                  Add Dimension
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                {sortedDimensions.map((dim, idx) => (
                  <div
                    key={dim.id}
                    draggable
                    onDragStart={() => handleDragStart(dim.id)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      handleDragOver(dim.id);
                    }}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleDimensionSelect(dim.id)}
                    style={{
                      ...cardInteractive,
                      display: 'flex',
                      alignItems: 'stretch',
                      gap: 0,
                      padding: 0,
                      overflow: 'hidden',
                      borderColor:
                        localSelectedDimension === dim.id
                          ? tokens.colors.primaryScale[400]
                          : dragState.over === dim.id
                          ? tokens.colors.primaryScale[200]
                          : tokens.colors.neutral[200],
                      borderWidth: localSelectedDimension === dim.id ? '2px' : tokens.surface.borderWidth,
                      borderStyle: 'solid',
                      opacity: dragState.dragging === dim.id ? 0.6 : 1,
                    }}
                  >
                    {/* Color indicator + drag handle */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column' as const,
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        backgroundColor: tokens.colors.neutral[50],
                        borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        cursor: 'grab',
                        gap: tokens.spacing[1],
                      }}
                    >
                      <GripVertical size={14} color={tokens.colors.neutral[400]} />
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: dimColors[idx % dimColors.length],
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div
                      style={{
                        flex: 1,
                        padding: tokens.spacing[3],
                        display: 'flex',
                        flexDirection: 'column' as const,
                        gap: tokens.spacing[2],
                      }}
                    >
                      {/* Name + code */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[2],
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.neutral[900],
                          }}
                        >
                          {dim.name}
                        </Text>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: tokens.spacing[1],
                            padding: `1px ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.md,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            backgroundColor: tokens.colors.neutral[100],
                            color: tokens.colors.neutral[600],
                            fontFamily: 'monospace',
                          }}
                        >
                          <Hash size={10} />
                          {dim.code}
                        </span>
                        {dim.isKnockout && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: tokens.spacing[1],
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.errorScale[600],
                            }}
                          >
                            <Flag size={10} color={tokens.colors.errorScale[500]} />
                            Knockout
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {dim.description && (
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                            lineHeight: tokens.typography.lineHeight.normal,
                          }}
                        >
                          {dim.description}
                        </Text>
                      )}

                      {/* Weight slider */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[2],
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                            minWidth: 40,
                          }}
                        >
                          Weight:
                        </Text>
                        <div
                          style={{
                            flex: 1,
                            height: 6,
                            backgroundColor: tokens.colors.neutral[100],
                            borderRadius: tokens.borderRadius.full,
                            position: 'relative' as const,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              position: 'absolute' as const,
                              left: 0,
                              top: 0,
                              height: '100%',
                              width: `${dim.weight * 100}%`,
                              backgroundColor: dimColors[idx % dimColors.length],
                              borderRadius: tokens.borderRadius.full,
                              transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                            }}
                          />
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={Math.round(dim.weight * 100)}
                          onChange={(e) => handleWeightChange(dim.id, Number(e.target.value) / 100)}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            width: 80,
                            accentColor: dimColors[idx % dimColors.length],
                          }}
                        />
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.neutral[700],
                            minWidth: 36,
                            textAlign: 'right' as const,
                          }}
                        >
                          {(dim.weight * 100).toFixed(0)}%
                        </Text>
                      </div>

                      {/* Knockout threshold */}
                      {dim.isKnockout && dim.knockoutThreshold !== undefined && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: tokens.spacing[2],
                          }}
                        >
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.errorScale[600],
                            }}
                          >
                            Knockout threshold: &lt;{dim.knockoutThreshold}
                          </Text>
                        </div>
                      )}
                    </div>

                    {/* Remove */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        padding: tokens.spacing[2],
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDimensionRemove(dim.id);
                        }}
                        style={{
                          ...hoverStyle,
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          padding: tokens.spacing[1],
                          borderRadius: tokens.borderRadius.md,
                        }}
                      >
                        <Trash2 size={14} color={tokens.colors.neutral[400]} />
                      </button>
                    </div>
                  </div>
                ))}

                {sortedDimensions.length === 0 && (
                  <div
                    style={{
                      ...cardBase,
                      display: 'flex',
                      flexDirection: 'column' as const,
                      alignItems: 'center',
                      padding: tokens.spacing[6],
                      color: tokens.colors.neutral[400],
                    }}
                  >
                    <Sliders size={28} color={tokens.colors.neutral[300]} />
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[400],
                        marginTop: tokens.spacing[2],
                      }}
                    >
                      No dimensions added yet
                    </Text>
                  </div>
                )}
              </div>
            </div>

            {/* ── Weight Visualization (Pie Chart) ────────────────── */}
            {sortedDimensions.length > 0 && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  <BarChart3 size={16} color={tokens.colors.infoScale[600]} />
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[500],
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.05em',
                    }}
                  >
                    Weight Distribution
                  </Text>
                  {/* Validation indicator */}
                  <div
                    style={{
                      marginLeft: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: weightIsValid
                        ? tokens.colors.successScale[600]
                        : tokens.colors.errorScale[600],
                    }}
                  >
                    {weightIsValid ? (
                      <CheckCircle2 size={14} color={tokens.colors.successScale[500]} />
                    ) : (
                      <XCircle size={14} color={tokens.colors.errorScale[500]} />
                    )}
                    Sum: {(totalWeight * 100).toFixed(0)}%
                  </div>
                </div>

                <div
                  style={{
                    ...cardBase,
                    padding: tokens.spacing[4],
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[4],
                  }}
                >
                  {/* Pie chart */}
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    {(() => {
                      const weights = sortedDimensions.map((d, i) => ({
                        label: d.name,
                        value: d.weight,
                        color: dimColors[i % dimColors.length],
                      }));
                      const slices = generatePieSlices(weights, 80, 80, 70);
                      return slices.map((slice, i) => (
                        <path
                          key={i}
                          d={slice.d}
                          fill={slice.color}
                          stroke={tokens.colors.common.white}
                          strokeWidth={2}
                          opacity={
                            localSelectedDimension
                              ? sortedDimensions[i]?.id === localSelectedDimension
                                ? 1
                                : 0.4
                              : 1
                          }
                        />
                      ));
                    })()}
                    {/* Center donut */}
                    <circle
                      cx="80"
                      cy="80"
                      r="35"
                      fill={tokens.colors.common.white}
                      stroke={tokens.colors.neutral[100]}
                      strokeWidth={1}
                    />
                    <text
                      x="80"
                      y="75"
                      textAnchor="middle"
                      fontSize={tokens.typography.fontSize.lg}
                      fontWeight={tokens.typography.fontWeight.bold}
                      fill={
                        weightIsValid
                          ? tokens.colors.successScale[600]
                          : tokens.colors.errorScale[600]
                      }
                    >
                      {(totalWeight * 100).toFixed(0)}%
                    </text>
                    <text
                      x="80"
                      y="92"
                      textAnchor="middle"
                      fontSize="9"
                      fill={tokens.colors.neutral[400]}
                    >
                      total
                    </text>
                  </svg>

                  {/* Legend */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                    {sortedDimensions.map((d, i) => (
                      <div
                        key={d.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[2],
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[600],
                          padding: `2px ${tokens.spacing[1]}px`,
                          borderRadius: tokens.borderRadius.sm,
                          backgroundColor:
                            localSelectedDimension === d.id
                              ? tokens.colors.primaryScale[50]
                              : 'transparent',
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          ...hoverStyle,
                        }}
                        onClick={() => handleDimensionSelect(d.id)}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: dimColors[i % dimColors.length],
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ flex: 1 }}>{d.name}</span>
                        <span style={{ fontWeight: tokens.typography.fontWeight.semibold }}>
                          {(d.weight * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Score Level Config ──────────────────────────────── */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  marginBottom: tokens.spacing[3],
                }}
              >
                <BarChart3 size={16} color={tokens.colors.warningScale[600]} />
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                  }}
                >
                  Score Levels
                </Text>
              </div>

              <div
                style={{
                  ...cardBase,
                  padding: 0,
                  overflow: 'hidden',
                }}
              >
                {/* Table header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '24px 1fr 100px',
                    gap: tokens.spacing[3],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    backgroundColor: tokens.colors.neutral[50],
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                  }}
                >
                  <span />
                  <span>Label</span>
                  <span>Min Score</span>
                </div>

                {/* Table rows */}
                {localScoreLevels.map((level, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '24px 1fr 100px',
                      gap: tokens.spacing[3],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      alignItems: 'center',
                      borderBottom:
                        idx < localScoreLevels.length - 1
                          ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
                          : 'none',
                    }}
                  >
                    {/* Color dot */}
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: level.color,
                      }}
                    />
                    {/* Label */}
                    <input
                      type="text"
                      value={level.label}
                      onChange={(e) => handleScoreLevelChange(idx, 'label', e.target.value)}
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[800],
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        padding: `${tokens.spacing[1]}px 0`,
                        width: '100%',
                      }}
                    
                      onFocus={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                        e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                      }}
                    />
                    {/* Min score */}
                    <input
                      type="number"
                      value={level.minScore}
                      onChange={(e) =>
                        handleScoreLevelChange(idx, 'minScore', Number(e.target.value))
                      }
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[800],
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        backgroundColor: tokens.colors.common.white,
                        outline: 'none',
                        width: '100%',
                      }}
                      min={0}
                      max={100}
                    
                      onFocus={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                        e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ── Knockout Rules Panel ────────────────────────────── */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  marginBottom: tokens.spacing[3],
                }}
              >
                <Flag size={16} color={tokens.colors.errorScale[600]} />
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                  }}
                >
                  Knockout Rules ({knockoutDimensions.length})
                </Text>
              </div>

              <div
                style={{
                  ...cardBase,
                  padding: tokens.spacing[3],
                }}
              >
                {knockoutDimensions.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center' as const,
                      padding: tokens.spacing[3],
                      color: tokens.colors.neutral[400],
                      fontSize: tokens.typography.fontSize.sm,
                    }}
                  >
                    No knockout dimensions configured
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                    {knockoutDimensions.map((dim) => (
                      <div
                        key={dim.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[2],
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                          borderRadius: tokens.borderRadius.md,
                          backgroundColor: tokens.colors.errorScale[50],
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                        }}
                      >
                        <Flag size={14} color={tokens.colors.errorScale[500]} />
                        <div style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.sm,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.errorScale[700],
                            }}
                          >
                            {dim.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.errorScale[600],
                            }}
                          >
                            {dim.knockoutThreshold !== undefined
                              ? `Auto-reject if score < ${dim.knockoutThreshold}`
                              : 'Knockout threshold not set'}
                          </Text>
                        </div>
                        <span
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.errorScale[700],
                            fontFamily: 'monospace',
                          }}
                        >
                          {dim.code}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right Panel: Preview + Validation ─────────────────── */}
          <div
            style={{
              width: 360,
              borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column' as const,
              gap: tokens.spacing[4],
              padding: tokens.spacing[4],
            }}
          >
            {/* ── Scorecard Preview ───────────────────────────────── */}
            {localShowPreview && sortedDimensions.length >= 3 && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  <Radar size={16} color={tokens.colors.primaryScale[600]} />
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[500],
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.05em',
                    }}
                  >
                    Scorecard Preview
                  </Text>
                </div>

                <div
                  style={{
                    ...cardBase,
                    padding: tokens.spacing[4],
                  }}
                >
                  {/* Mock scorecard */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column' as const,
                      gap: tokens.spacing[3],
                      marginBottom: tokens.spacing[4],
                    }}
                  >
                    {sortedDimensions.map((dim, idx) => {
                      const sampleScore = sampleScores[idx]?.value ?? 75;
                      const matchingLevel = [...localScoreLevels]
                        .sort((a, b) => b.minScore - a.minScore)
                        .find((l) => sampleScore >= l.minScore);

                      return (
                        <div key={dim.id}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: tokens.spacing[1],
                            }}
                          >
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                fontWeight: tokens.typography.fontWeight.medium,
                                color: tokens.colors.neutral[700],
                              }}
                            >
                              {dim.name}
                            </Text>
                            <span
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                fontWeight: tokens.typography.fontWeight.semibold,
                                color: matchingLevel?.color ?? tokens.colors.neutral[600],
                              }}
                            >
                              {sampleScore} - {matchingLevel?.label ?? 'N/A'}
                            </span>
                          </div>
                          <div
                            style={{
                              height: 6,
                              backgroundColor: tokens.colors.neutral[100],
                              borderRadius: tokens.borderRadius.full,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${sampleScore}%`,
                                backgroundColor: matchingLevel?.color ?? tokens.colors.neutral[400],
                                borderRadius: tokens.borderRadius.full,
                                transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Radar Chart */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="260" height="260" viewBox="0 0 260 260">
                      {(() => {
                        const radar = generateRadarPoints(sampleScores, 130, 130, 90);

                        return (
                          <>
                            {/* Grid rings */}
                            {radar.gridLines.map((ring, ri) => (
                              <polygon
                                key={ri}
                                points={ring.join(' ')}
                                fill="none"
                                stroke={tokens.colors.neutral[200]}
                                strokeWidth={1}
                              />
                            ))}

                            {/* Axis lines */}
                            {sampleScores.map((_, i) => {
                              const angle = -Math.PI / 2 + (i * 2 * Math.PI) / sampleScores.length;
                              const x2 = 130 + 90 * Math.cos(angle);
                              const y2 = 130 + 90 * Math.sin(angle);
                              return (
                                <line
                                  key={i}
                                  x1={130}
                                  y1={130}
                                  x2={x2}
                                  y2={y2}
                                  stroke={tokens.colors.neutral[200]}
                                  strokeWidth={1}
                                />
                              );
                            })}

                            {/* Data polygon */}
                            {radar.polygon && (
                              <polygon
                                points={radar.polygon}
                                fill={tokens.colors.primaryScale[100]}
                                fillOpacity={0.5}
                                stroke={tokens.colors.primaryScale[500]}
                                strokeWidth={2}
                              />
                            )}

                            {/* Data points */}
                            {radar.polygon &&
                              radar.polygon.split(' ').map((pt, i) => {
                                const [px, py] = pt.split(',').map(Number);
                                return (
                                  <circle
                                    key={i}
                                    cx={px}
                                    cy={py}
                                    r={4}
                                    fill={tokens.colors.primaryScale[500]}
                                    stroke={tokens.colors.common.white}
                                    strokeWidth={2}
                                  />
                                );
                              })}

                            {/* Labels */}
                            {radar.labels.map((lbl, i) => (
                              <text
                                key={i}
                                x={lbl.x}
                                y={lbl.y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize="9"
                                fill={tokens.colors.neutral[500]}
                                fontWeight={tokens.typography.fontWeight.medium}
                              >
                                {lbl.label}
                              </text>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* ── Validation Panel ────────────────────────────────── */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  marginBottom: tokens.spacing[3],
                }}
              >
                <Shield size={16} color={tokens.colors.successScale[600]} />
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                  }}
                >
                  Validation
                </Text>
              </div>

              <div
                style={{
                  ...cardBase,
                  padding: tokens.spacing[3],
                  display: 'flex',
                  flexDirection: 'column' as const,
                  gap: tokens.spacing[2],
                }}
              >
                {/* Weight sum check */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: weightIsValid
                      ? tokens.colors.successScale[50]
                      : tokens.colors.errorScale[50],
                  }}
                >
                  {weightIsValid ? (
                    <CheckCircle2 size={16} color={tokens.colors.successScale[500]} />
                  ) : (
                    <XCircle size={16} color={tokens.colors.errorScale[500]} />
                  )}
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: weightIsValid
                        ? tokens.colors.successScale[700]
                        : tokens.colors.errorScale[700],
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}
                  >
                    Weights sum to {(totalWeight * 100).toFixed(0)}%
                    {weightIsValid ? '' : ' (should be 100%)'}
                  </Text>
                </div>

                {/* Codes unique check */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: codesUnique
                      ? tokens.colors.successScale[50]
                      : tokens.colors.errorScale[50],
                  }}
                >
                  {codesUnique ? (
                    <CheckCircle2 size={16} color={tokens.colors.successScale[500]} />
                  ) : (
                    <XCircle size={16} color={tokens.colors.errorScale[500]} />
                  )}
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: codesUnique
                        ? tokens.colors.successScale[700]
                        : tokens.colors.errorScale[700],
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}
                  >
                    {codesUnique ? 'Dimension codes are unique' : 'Duplicate dimension codes found'}
                  </Text>
                </div>

                {/* Score levels valid check */}
                {(() => {
                  const sortedLevels = [...localScoreLevels].sort((a, b) => b.minScore - a.minScore);
                  const thresholdsValid = sortedLevels.every(
                    (l, i) => i === 0 || l.minScore < sortedLevels[i - 1].minScore
                  );
                  return (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: thresholdsValid
                          ? tokens.colors.successScale[50]
                          : tokens.colors.errorScale[50],
                      }}
                    >
                      {thresholdsValid ? (
                        <CheckCircle2 size={16} color={tokens.colors.successScale[500]} />
                      ) : (
                        <XCircle size={16} color={tokens.colors.errorScale[500]} />
                      )}
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: thresholdsValid
                            ? tokens.colors.successScale[700]
                            : tokens.colors.errorScale[700],
                          fontWeight: tokens.typography.fontWeight.medium,
                        }}
                      >
                        {thresholdsValid
                          ? 'Score level thresholds are valid'
                          : 'Overlapping score level thresholds'}
                      </Text>
                    </div>
                  );
                })()}

                {/* Custom validation errors */}
                {localValidationErrors.length > 0 && (
                  <div
                    style={{
                      marginTop: tokens.spacing[2],
                      borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      paddingTop: tokens.spacing[2],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[500],
                        marginBottom: tokens.spacing[2],
                        display: 'block',
                      }}
                    >
                      Additional Errors
                    </Text>
                    {localValidationErrors.map((err, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: tokens.spacing[2],
                          padding: `${tokens.spacing[1]}px 0`,
                        }}
                      >
                        <AlertCircle
                          size={14}
                          color={tokens.colors.errorScale[500]}
                          style={{ flexShrink: 0, marginTop: 2 }}
                        />
                        <div>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.errorScale[700],
                            }}
                          >
                            {err.field}
                          </Text>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.errorScale[600],
                            }}
                          >
                            {err.message}
                          </Text>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Publish Action ──────────────────────────────────── */}
            <div>
              <div
                style={{
                  ...cardBase,
                  padding: tokens.spacing[4],
                  backgroundColor: tokens.colors.warningScale[50],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: tokens.spacing[3],
                  }}
                >
                  <AlertTriangle
                    size={20}
                    color={tokens.colors.warningScale[500]}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <div style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.warningScale[800],
                        marginBottom: tokens.spacing[1],
                        display: 'block',
                      }}
                    >
                      Publish Rubric
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.warningScale[700],
                        lineHeight: tokens.typography.lineHeight.normal,
                        marginBottom: tokens.spacing[3],
                        display: 'block',
                      }}
                    >
                      Publishing this rubric will make it available for use in evaluation templates.
                      Existing scorecards using previous versions will not be affected.
                    </Text>
                    <button
                      onClick={onPublish}
                      disabled={!weightIsValid || !codesUnique}
                      style={{
                        ...hoverStyle,
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: 'none',
                        backgroundColor:
                          weightIsValid && codesUnique
                            ? tokens.colors.primaryScale[600]
                            : tokens.colors.neutral[300],
                        color: tokens.colors.common.white,
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        cursor: weightIsValid && codesUnique ? 'pointer' : 'not-allowed',
                        opacity: weightIsValid && codesUnique ? 1 : 0.6,
                      }}
                    >
                      <Send size={14} />
                      Publish Rubric
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Box>
    );
  },
});
