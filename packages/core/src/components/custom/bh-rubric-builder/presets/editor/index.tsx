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
  createCardHoverStyles,
  createEmptyStateStyle,
  createEntranceAnimation,
  createFilterPillStyle,
  createHoverStyle,
  createIconContainerStyle,
  createPanelHeaderStyle,
  createPersonalityAccentBar,
  createPersonalitySectionHeaderStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
  createStaggerDelay,
  createSurfaceStyle,
  getHoverTransform,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  getAccentAwareLayout,
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
  n,
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
    const { Box, Flex, Stack, Text } = primitives;

    const {
      rubricName = '',
      industry = '',
      scorableType = 'interview' as const,
      status = 'draft',
      dimensions: rawDimensionsProp = [],
      scoreLevels: scoreLevelsProp = [{ label: 'Low', minScore: 0, color: '#ef4444' }, { label: 'Medium', minScore: 40, color: '#f59e0b' }, { label: 'High', minScore: 70, color: '#22c55e' }],
      selectedDimension: selectedDimensionProp = null,
      validationErrors: validationErrorsProp = [],
      isDirty: isDirtyProp,
      systemPrompt,
      scoringInstructions,
      evidenceInstructions,
      outputFormat,
      minScore,
      maxScore,
      passingScore,
      isTemplate,
      timesUsed,
      avgScore,
      lastUsedAt,
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

    const dimensionsProp = Array.isArray(rawDimensionsProp) ? rawDimensionsProp : [];

    /* ── Local State ──────────────────────────────────────────────── */
    const [localDimensions, setLocalDimensions] = useState<ScoringDimension[]>(dimensionsProp);
    const [localSelectedDimension, setLocalSelectedDimension] = useState<string | null>(selectedDimensionProp);
    const [dragState, setDragState] = useState<{ dragging: string | null; over: string | null }>({
      dragging: null,
      over: null,
    });
    const [localScoreLevels, setLocalScoreLevels] = useState<ScoreLevel[]>(scoreLevelsProp);
    const [localValidationErrors, setLocalValidationErrors] = useState<ValidationError[]>(validationErrorsProp ?? []);
    const [localShowPreview, setLocalShowPreview] = useState(showPreviewProp);
    const [localIsDirty, setLocalIsDirty] = useState(isDirtyProp);

    /* ── Derived ──────────────────────────────────────────────────── */
    const sortedDimensions = useMemo(
      () => [...localDimensions].sort((a, b) => n(a.order) - n(b.order)),
      [localDimensions]
    );

    const totalWeight = useMemo(
      () => localDimensions.reduce((sum, d) => sum + n(d.weight), 0),
      [localDimensions]
    );

    const weightIsValid = useMemo(
      () => Math.abs(totalWeight - 100) < 1,
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
      const codes = localDimensions.map((d, i) => d.code);
      return new Set(codes).size === codes.length;
    }, [localDimensions]);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;

    /* ── Mounted state for entrance animation ────────────────────── */

    const statusColors = useMemo(() => getRubricStatusColors(tokens), [tokens]);
    const scorableColors = useMemo(() => getScorableTypeColors(tokens), [tokens]);
    const dimColors = useMemo(() => getDimensionColors(tokens), [tokens]);

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const cardInteractive = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass, interactive: true }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    /* ── Personality + Animation ──────────────────────────────────── */
    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const cardHover = useMemo(() => createCardHoverStyles(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens), [tokens]);
    const accentLayout = useMemo(() => getAccentAwareLayout(tokens), [tokens]);
    const entrance = useMemo(() => createEntranceAnimation(tokens), [tokens]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(tokens, index)}ms`,
    });
    const sectionHeaderStyle = useMemo(() => createPersonalitySectionHeaderStyle(tokens), [tokens]);

    /* ── Glass header style ───────────────────────────────────────── */
    const headerGlassStyle = useMemo(() => {
      const s: React.CSSProperties = {};
      if (isGlass && tokens.glass) {
        s.backdropFilter = tokens.glass.blur;
        s.WebkitBackdropFilter = tokens.glass.blur;
        s.backgroundColor = tokens.glass.bg;
      }
      return s;
    }, [isGlass, tokens]);

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
          prev.map((d, i) => (d.id === dimId ? { ...d, weight: newWeight } : d))
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
          onDimensionReorder?.((fromDim.id ?? ''), (toDim.order ?? 0));
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
        sortedDimensions.map((d, i) => ({
          label: d.code || (d.name ?? '').substring(0, 4),
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
        role="region"
        aria-label={`Rubric editor: ${rubricName}`}
        style={{
          ...animStyle(0),
          display: 'flex',
          flexDirection: 'column' as const,
          height: '100%',
          backgroundColor: tokens.colors.neutral[50],
          fontFamily: 'inherit',
          ...entrance.animate,
          transition: entrance.transition,
          width: '100%',
          ...style,
        }}
      >
        {/* Accent bar */}
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>

        {/* ── Rubric Header ────────────────────────────────────────── */}
        <Flex
          align="center"
          justify="between"
          style={{
            ...cardBase,
            padding: tokens.spacing[4],
            borderRadius: tokens.borderRadius.none,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            ...headerGlassStyle,
          }}
        >
          <Flex align="center" gap={12} style={{ flex: 1 }}>
            <Target size={20} color={tokens.colors.primaryScale[600]} strokeWidth={1.5} />
            <input
              type="text"
              value={rubricName}
              aria-label="Rubric name"
              onChange={(e) => {
                onChange?.('rubricName', e.target.value);
                setLocalIsDirty(true);
              }}
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: ptypo.headingWeight,
                letterSpacing: ptypo.headingLetterSpacing,
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
            <Text style={{ ...createBadgeStyle(tokens, 'secondary'), borderRadius: badgeRadius }}>{industry}</Text>

            {/* Scorable type badge */}
            <Text
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: badgeRadius,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: (scorableColors as Record<string, any>)[scorableType]?.bg,
                color: (scorableColors as Record<string, any>)[scorableType]?.color,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${(scorableColors as Record<string, any>)[scorableType]?.border}`,
              }}
            >
              {formatScorableType(scorableType)}
            </Text>

            {/* Status badge */}
            <Text
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: badgeRadius,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: (statusColors as Record<string, any>)[status]?.bg,
                color: (statusColors as Record<string, any>)[status]?.color,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${(statusColors as Record<string, any>)[status]?.border}`,
                gap: tokens.spacing[1],
              }}
            >
              <CircleDot size={10} aria-hidden="true" />
              {(status || '').charAt(0).toUpperCase() + (status || '').slice(1)}
            </Text>
          </Flex>

          <Flex align="center" gap={8}>
            {localIsDirty && (
              <Text
                aria-live="polite"
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.warningScale[600],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                Unsaved changes
              </Text>
            )}
            <button
              onClick={handlePreviewToggle}
              aria-label={localShowPreview ? 'Hide preview' : 'Show preview'}
              aria-pressed={localShowPreview}
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
              aria-label="Save rubric"
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
              <Save size={14} aria-hidden="true" />
              Save
            </button>
            <button
              onClick={onPublish}
              aria-label="Publish rubric"
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
              <Send size={14} aria-hidden="true" />
              Publish
            </button>
          </Flex>
        </Flex>

        {/* ── Main Content ─────────────────────────────────────────── */}
        <Box style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* ── Left: Dimensions + Weight ─────────────────────────── */}
          <Box
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
            <Box>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: tokens.spacing[3],
                }}
              >
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <Sliders size={16} color={tokens.colors.primaryScale[600]} aria-hidden="true" />
                  <Text
                    style={{
                      ...sectionHeaderStyle,
                      marginBottom: 0,
                    }}
                  >
                    Dimensions ({sortedDimensions.length})
                  </Text>
                </Box>
                <button
                  onClick={() => {
                    onDimensionAdd?.();
                    setLocalIsDirty(true);
                  }}
                  aria-label="Add scoring dimension"
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
                  <Plus size={12} aria-hidden="true" />
                  Add Dimension
                </button>
              </Box>

              <Box role="list" aria-label="Scoring dimensions" style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                {sortedDimensions.map((dim, idx) => {
                  const dimEntrance = createEntranceAnimation(tokens, { index: idx });
                  return (
                  <Box
                    key={dim.id}
                    role="listitem"
                    aria-selected={localSelectedDimension === dim.id}
                    aria-label={`Dimension: ${dim.name}${dim.isKnockout ? ' (knockout)' : ''}, weight ${n(dim.weight).toFixed(0)}%`}
                    draggable
                    onDragStart={() => handleDragStart((dim.id ?? ''))}
                    onDragOver={(e: React.DragEvent) => {
                      e.preventDefault();
                      handleDragOver((dim.id ?? ''));
                    }}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleDimensionSelect(dim.id!)}
                    style={{
                      ...animStyle(idx),
                      ...cardInteractive,
                      ...cardHover.base,
                      ...dimEntrance.animate,
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
                    <Box
                      aria-label="Drag to reorder"
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
                      <GripVertical size={14} color={tokens.colors.neutral[400]} aria-hidden="true" />
                      <Box
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: dimColors[idx % dimColors.length],
                        }}
                      />
                    </Box>

                    {/* Content */}
                    <Box
                      style={{
                        flex: 1,
                        padding: tokens.spacing[3],
                        display: 'flex',
                        flexDirection: 'column' as const,
                        gap: tokens.spacing[2],
                      }}
                    >
                      {/* Name + code */}
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[2],
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: ptypo.headingWeight,
                            color: tokens.colors.neutral[900],
                          }}
                        >
                          {dim.name}
                        </Text>
                        <Text
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: tokens.spacing[1],
                            padding: `1px ${tokens.spacing[2]}px`,
                            borderRadius: badgeRadius,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            backgroundColor: tokens.colors.neutral[100],
                            color: tokens.colors.neutral[600],
                            fontFamily: 'monospace',
                          }}
                        >
                          <Hash size={10} aria-hidden="true" />
                          {dim.code}
                        </Text>
                        {dim.isRequired && (
                          <Text
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: tokens.spacing[1],
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.primaryScale[600],
                            }}
                          >
                            Required
                          </Text>
                        )}
                        {dim.isKnockout && (
                          <Text
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: tokens.spacing[1],
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.errorScale[600],
                            }}
                          >
                            <Flag size={10} color={tokens.colors.errorScale[500]} aria-hidden="true" />
                            Knockout
                          </Text>
                        )}
                      </Box>

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

                      {/* Keywords */}
                      {dim.keywords && dim.keywords.length > 0 && (
                        <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[1] }}>
                          {dim.keywords.map((kw, ki) => (
                            <Text
                              key={ki}
                              style={{
                                ...animStyle(ki),
                                display: 'inline-block',
                                padding: `1px ${tokens.spacing[2]}px`,
                                borderRadius: badgeRadius,
                                fontSize: '10px',
                                backgroundColor: tokens.colors.neutral[100],
                                color: tokens.colors.neutral[600],
                              }}
                            >
                              {kw}
                            </Text>
                          ))}
                        </Box>
                      )}

                      {/* Weight slider */}
                      <Box
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
                            textTransform: ptypo.labelTransform,
                            letterSpacing: ptypo.labelLetterSpacing,
                            minWidth: 40,
                          }}
                        >
                          Weight:
                        </Text>
                        <Box
                          style={{
                            flex: 1,
                            height: 6,
                            backgroundColor: tokens.colors.neutral[100],
                            borderRadius: tokens.borderRadius.full,
                            position: 'relative' as const,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            style={{
                              position: 'absolute' as const,
                              left: 0,
                              top: 0,
                              height: '100%',
                              width: `${n(dim.weight)}%`,
                              backgroundColor: dimColors[idx % dimColors.length],
                              borderRadius: tokens.borderRadius.full,
                              transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                            }}
                          />
                        </Box>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={Math.round(n(dim.weight))}
                          aria-label={`Weight for ${dim.name}`}
                          onChange={(e) => handleWeightChange((dim.id ?? ''), Number(e.target.value))}
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
                          {n(dim.weight).toFixed(0)}%
                        </Text>
                      </Box>

                      {/* Knockout threshold */}
                      {dim.isKnockout && dim.knockoutThreshold !== undefined && (
                        <Box
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
                        </Box>
                      )}
                    </Box>

                    {/* Remove */}
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        padding: tokens.spacing[2],
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDimensionRemove((dim.id ?? ''));
                        }}
                        aria-label={`Remove dimension ${dim.name}`}
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
                        <Trash2 size={14} color={tokens.colors.neutral[400]} aria-hidden="true" />
                      </button>
                    </Box>
                  </Box>
                  );
                })}

                {sortedDimensions.length === 0 && (
                  <Box
                    style={{
                      ...cardBase,
                      display: 'flex',
                      flexDirection: 'column' as const,
                      alignItems: 'center',
                      padding: tokens.spacing[6],
                      color: tokens.colors.neutral[400],
                    }}
                  >
                    <Box style={createIconContainerStyle(tokens, { size: 48 })}>
                      <Sliders size={24} color={tokens.colors.neutral[300]} aria-hidden="true" />
                    </Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[400],
                        marginTop: tokens.spacing[2],
                      }}
                    >
                      No dimensions added yet
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>

            {/* ── Weight Visualization (Pie Chart) ────────────────── */}
            {sortedDimensions.length > 0 && (
              <Box>
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  <BarChart3 size={16} color={tokens.colors.infoScale[600]} aria-hidden="true" />
                  <Text
                    style={{
                      ...sectionHeaderStyle,
                      marginBottom: 0,
                    }}
                  >
                    Weight Distribution
                  </Text>
                  {/* Validation indicator */}
                  <Box
                    aria-live="polite"
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
                      <CheckCircle2 size={14} color={tokens.colors.successScale[500]} aria-hidden="true" />
                    ) : (
                      <XCircle size={14} color={tokens.colors.errorScale[500]} aria-hidden="true" />
                    )}
                    Sum: {totalWeight.toFixed(0)}%
                  </Box>
                </Box>

                <Box
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
                        label: d.name ?? '',
                        value: n(d.weight),
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
                      {totalWeight.toFixed(0)}%
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
                  <Box role="list" aria-label="Dimension weight legend" style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                    {sortedDimensions.map((d, i) => (
                      <Box
                        key={d.id}
                        role="listitem"
                        tabIndex={0}
                        onClick={() => handleDimensionSelect(d.id!)}
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDimensionSelect(d.id!); } }}
                        aria-label={`${d.name}: ${n(d.weight).toFixed(0)}%`}
                        style={{
                          ...animStyle(i),
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
                      >
                        <Box
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: dimColors[i % dimColors.length],
                            flexShrink: 0,
                          }}
                        />
                        <Text style={{ flex: 1 }}>{d.name}</Text>
                        <Text style={{ fontWeight: tokens.typography.fontWeight.semibold }}>
                          {(d.weight || 0).toFixed(0)}%
                        </Text>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}

            {/* ── Score Level Config ──────────────────────────────── */}
            <Box>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  marginBottom: tokens.spacing[3],
                }}
              >
                <BarChart3 size={16} color={tokens.colors.warningScale[600]} aria-hidden="true" />
                <Text
                  style={{
                    ...sectionHeaderStyle,
                    marginBottom: 0,
                  }}
                >
                  Score Levels
                </Text>
              </Box>

              <Box
                role="table"
                aria-label="Score level configuration"
                style={{
                  ...cardBase,
                  padding: 0,
                  overflow: 'hidden',
                }}
              >
                {/* Table header */}
                <Box
                  role="row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '24px 1fr 100px',
                    gap: tokens.spacing[3],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    backgroundColor: tokens.colors.neutral[50],
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    ...sectionHeaderStyle,
                    marginBottom: 0,
                  }}
                >
                  <Box role="columnheader" aria-label="Color" />
                  <Box role="columnheader"><Text>Label</Text></Box>
                  <Box role="columnheader"><Text>Min Score</Text></Box>
                </Box>

                {/* Table rows */}
                {(localScoreLevels ?? []).map((level, idx) => (
                  <Box
                    key={idx}
                    role="row"
                    style={{
                      ...animStyle(idx),
                      display: 'grid',
                      gridTemplateColumns: '24px 1fr 100px',
                      gap: tokens.spacing[3],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      alignItems: 'center',
                      borderBottom:
                        idx < (localScoreLevels?.length ?? 0) - 1
                          ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
                          : 'none',
                    }}
                  >
                    {/* Color dot */}
                    <Box
                      role="cell"
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
                      aria-label={`Score level ${idx + 1} label`}
                      role="cell"
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
                      aria-label={`Score level ${idx + 1} minimum score`}
                      role="cell"
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
                  </Box>
                ))}
              </Box>
            </Box>

            {/* ── Knockout Rules Panel ────────────────────────────── */}
            <Box>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  marginBottom: tokens.spacing[3],
                }}
              >
                <Flag size={16} color={tokens.colors.errorScale[600]} aria-hidden="true" />
                <Text
                  style={{
                    ...sectionHeaderStyle,
                    marginBottom: 0,
                  }}
                >
                  Knockout Rules ({knockoutDimensions.length})
                </Text>
              </Box>

              <Box
                style={{
                  ...cardBase,
                  padding: tokens.spacing[3],
                }}
              >
                {knockoutDimensions.length === 0 ? (
                  <Box
                    style={{
                      textAlign: 'center' as const,
                      padding: tokens.spacing[3],
                      color: tokens.colors.neutral[400],
                      fontSize: tokens.typography.fontSize.sm,
                    }}
                  >
                    No knockout dimensions configured
                  </Box>
                ) : (
                  <Box role="list" aria-label="Knockout rules" style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                    {knockoutDimensions.map((dim, i) => (
                      <Box
                        key={dim.id}
                        role="listitem"
                        style={{
                          ...animStyle(i),
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[2],
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                          borderRadius: tokens.borderRadius.md,
                          backgroundColor: tokens.colors.errorScale[50],
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                        }}
                      >
                        <Flag size={14} color={tokens.colors.errorScale[500]} aria-hidden="true" />
                        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.sm,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.errorScale[700],
                              display: 'block',
                            }}
                          >
                            {dim.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.errorScale[600],
                              display: 'block',
                            }}
                          >
                            {dim.knockoutThreshold !== undefined
                              ? `Auto-reject if score < ${dim.knockoutThreshold}`
                              : 'Knockout threshold not set'}
                          </Text>
                        </Box>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.errorScale[700],
                            fontFamily: 'monospace',
                          }}
                        >
                          {dim.code}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* ── Right Panel: Preview + Validation ─────────────────── */}
          <Box
            style={{
              width: 360,
              borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column' as const,
              gap: tokens.spacing[4],
              padding: tokens.spacing[4],
              ...headerGlassStyle,
            }}
          >
            {/* ── Scorecard Preview ───────────────────────────────── */}
            {localShowPreview && sortedDimensions.length >= 3 && (
              <Box>
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  <Radar size={16} color={tokens.colors.primaryScale[600]} aria-hidden="true" />
                  <Text
                    style={{
                      ...sectionHeaderStyle,
                      marginBottom: 0,
                    }}
                  >
                    Scorecard Preview
                  </Text>
                </Box>

                <Box
                  style={{
                    ...cardBase,
                    padding: tokens.spacing[4],
                  }}
                >
                  {/* Mock scorecard */}
                  <Box
                    role="list"
                    aria-label="Sample dimension scores"
                    style={{
                      display: 'flex',
                      flexDirection: 'column' as const,
                      gap: tokens.spacing[3],
                      marginBottom: tokens.spacing[4],
                    }}
                  >
                    {sortedDimensions.map((dim, idx) => {
                      const sampleScore = sampleScores[idx]?.value ?? 75;
                      const matchingLevel = [...(localScoreLevels ?? [])]
                        .sort((a, b) => b.minScore - a.minScore)
                        .find((l) => sampleScore >= l.minScore);

                      return (
                        <Box key={dim.id} role="listitem" aria-label={`${dim.name}: score ${sampleScore}`}>
                          <Box
                            style={{
                              ...animStyle(idx),
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
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                fontWeight: tokens.typography.fontWeight.semibold,
                                color: matchingLevel?.color ?? tokens.colors.neutral[600],
                              }}
                            >
                              {sampleScore} - {matchingLevel?.label ?? 'N/A'}
                            </Text>
                          </Box>
                          <Box
                            role="progressbar"
                            aria-valuenow={sampleScore}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${dim.name} score`}
                            style={{
                              height: 6,
                              backgroundColor: tokens.colors.neutral[100],
                              borderRadius: tokens.borderRadius.full,
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              style={{
                                height: '100%',
                                width: `${sampleScore}%`,
                                backgroundColor: matchingLevel?.color ?? tokens.colors.neutral[400],
                                borderRadius: tokens.borderRadius.full,
                                transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                              }}
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Radar Chart */}
                  <Box
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
                            {(sampleScores ?? []).map((_, i) => {
                              const angle = -Math.PI / 2 + (i * 2 * Math.PI) / (sampleScores?.length || 1);
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
                  </Box>
                </Box>
              </Box>
            )}

            {/* ── Scoring Config ────────────────────────────────── */}
            {(passingScore !== undefined || minScore !== undefined || maxScore !== undefined || outputFormat) && (
              <Box>
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  <Target size={16} color={tokens.colors.infoScale[600]} aria-hidden="true" />
                  <Text
                    style={{
                      ...sectionHeaderStyle,
                      marginBottom: 0,
                    }}
                  >
                    Scoring Config
                  </Text>
                  {isTemplate && (
                    <Text style={{
                      ...createBadgeStyle(tokens, 'primary'),
                      borderRadius: badgeRadius,
                      marginLeft: 'auto',
                    }}>
                      Template
                    </Text>
                  )}
                </Box>
                <Box
                  style={{
                    ...cardBase,
                    padding: tokens.spacing[3],
                    display: 'flex',
                    flexDirection: 'column' as const,
                    gap: tokens.spacing[2],
                  }}
                >
                  {minScore !== undefined && (
                    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Min Score</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{minScore}</Text>
                    </Box>
                  )}
                  {maxScore !== undefined && (
                    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Max Score</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{maxScore}</Text>
                    </Box>
                  )}
                  {passingScore !== undefined && (
                    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Passing Score</Text>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.successScale[700],
                      }}>{passingScore}</Text>
                    </Box>
                  )}
                  {outputFormat && (
                    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Output Format</Text>
                      <Text style={{
                        ...createBadgeStyle(tokens, 'secondary'),
                        borderRadius: badgeRadius,
                        fontSize: tokens.typography.fontSize.xs,
                      }}>{outputFormat}</Text>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* ── Usage Stats ────────────────────────────────── */}
            {(timesUsed !== undefined || avgScore !== undefined || lastUsedAt) && (
              <Box>
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  <BarChart3 size={16} color={tokens.colors.primaryScale[600]} aria-hidden="true" />
                  <Text
                    style={{
                      ...sectionHeaderStyle,
                      marginBottom: 0,
                    }}
                  >
                    Usage Stats
                  </Text>
                </Box>
                <Box
                  style={{
                    ...cardBase,
                    padding: tokens.spacing[3],
                    display: 'flex',
                    flexDirection: 'column' as const,
                    gap: tokens.spacing[2],
                  }}
                >
                  {timesUsed !== undefined && (
                    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Times Used</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{timesUsed}</Text>
                    </Box>
                  )}
                  {avgScore !== undefined && (
                    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Avg Score</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{avgScore.toFixed(1)}</Text>
                    </Box>
                  )}
                  {lastUsedAt && (
                    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Last Used</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                        {new Date(lastUsedAt).toLocaleDateString()}
                      </Text>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* ── Validation Panel ────────────────────────────────── */}
            <Box>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  marginBottom: tokens.spacing[3],
                }}
              >
                <Shield size={16} color={tokens.colors.successScale[600]} aria-hidden="true" />
                <Text
                  style={{
                    ...sectionHeaderStyle,
                    marginBottom: 0,
                  }}
                >
                  Validation
                </Text>
              </Box>

              <Box
                role="status"
                aria-label="Rubric validation status"
                style={{
                  ...cardBase,
                  padding: tokens.spacing[3],
                  display: 'flex',
                  flexDirection: 'column' as const,
                  gap: tokens.spacing[2],
                }}
              >
                {/* Weight sum check */}
                <Box
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
                    <CheckCircle2 size={16} color={tokens.colors.successScale[500]} aria-hidden="true" />
                  ) : (
                    <XCircle size={16} color={tokens.colors.errorScale[500]} aria-hidden="true" />
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
                    Weights sum to {totalWeight.toFixed(0)}%
                    {weightIsValid ? '' : ' (should be 100%)'}
                  </Text>
                </Box>

                {/* Codes unique check */}
                <Box
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
                    <CheckCircle2 size={16} color={tokens.colors.successScale[500]} aria-hidden="true" />
                  ) : (
                    <XCircle size={16} color={tokens.colors.errorScale[500]} aria-hidden="true" />
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
                </Box>

                {/* Score levels valid check */}
                {(() => {
                  const sortedLevels = [...(localScoreLevels ?? [])].sort((a, b) => b.minScore - a.minScore);
                  const thresholdsValid = sortedLevels.every(
                    (l, i) => i === 0 || l.minScore < sortedLevels[i - 1].minScore
                  );
                  return (
                    <Box
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
                        <CheckCircle2 size={16} color={tokens.colors.successScale[500]} aria-hidden="true" />
                      ) : (
                        <XCircle size={16} color={tokens.colors.errorScale[500]} aria-hidden="true" />
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
                    </Box>
                  );
                })()}

                {/* Custom validation errors */}
                {(localValidationErrors?.length ?? 0) > 0 && (
                  <Box
                    role="alert"
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
                    {(localValidationErrors ?? []).map((err, idx) => (
                      <Box
                        key={idx}
                        style={{
                          ...animStyle(idx),
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: tokens.spacing[2],
                          padding: `${tokens.spacing[1]}px 0`,
                        }}
                      >
                        <AlertCircle
                          size={14}
                          color={tokens.colors.errorScale[500]}
                          style={{ flexShrink: 0, marginTop: tokens.spacing[1] }}
                          aria-hidden="true"
                        />
                        <Box>
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
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>

            {/* ── Publish Action ──────────────────────────────────── */}
            <Box>
              <Box
                style={{
                  ...cardBase,
                  padding: tokens.spacing[4],
                  backgroundColor: tokens.colors.warningScale[50],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
                }}
              >
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: tokens.spacing[3],
                  }}
                >
                  <AlertTriangle
                    size={20}
                    color={tokens.colors.warningScale[500]}
                    style={{ flexShrink: 0, marginTop: tokens.spacing[1] }}
                    aria-hidden="true"
                  />
                  <Box style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: ptypo.headingWeight,
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
                      aria-label="Publish rubric"
                      aria-disabled={!weightIsValid || !codesUnique}
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
                      <Send size={14} aria-hidden="true" />
                      Publish Rubric
                    </button>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
