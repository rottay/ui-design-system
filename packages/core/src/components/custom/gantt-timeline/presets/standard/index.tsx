'use client';

/**
 * GanttTimeline - Standard Preset
 * Full gantt chart with left task panel, scrollable timeline grid,
 * dependency arrows, today marker, and time scale controls
 */

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { GanttTimelineProps, GanttTask, TimeScale } from '../../core';
import {
  GANTT_TIMELINE_DEFAULTS,
  getTaskStatusColors,
  getTodayMarkerColors,
  getTimeScaleConfig,
  getTimeScaleOptions,
  calculateBarPosition,
  computeAutoRange,
  generateTimeColumns,
  getTodayPosition,
  flattenTaskTree,
  calculateDependencyPath,
  pixelOffsetToMs,
  msToDateString,
} from '../../core';
import {
  createBadgeStyle,
  createCardStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
} from '../../../helpers';

export const StandardGanttTimeline = createPreset<GanttTimelineProps & Record<string, unknown>>({
  name: 'GanttTimeline.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<GanttTimelineProps>) => {
    const { Box } = primitives;

    const {
      tasks,
      dependencies = [],
      timeScale: timeScaleProp,
      onTimeScaleChange,
      dateRange: dateRangeProp,
      selectedTaskId: selectedTaskIdProp,
      onTaskSelect,
      expandedTaskIds: expandedIdsProp,
      onExpandToggle,
      checkedTaskIds: checkedIdsProp,
      onCheckToggle,
      onCreateTask,
      onTaskClick,
      toolbarActions = [],
      filters = [],
      onFilterClick,
      showTodayMarker = GANTT_TIMELINE_DEFAULTS.showTodayMarker,
      showTodayButton = GANTT_TIMELINE_DEFAULTS.showTodayButton,
      showDependencies = GANTT_TIMELINE_DEFAULTS.showDependencies,
      selectable = GANTT_TIMELINE_DEFAULTS.selectable,
      rowHeight: rowHeightProp,
      loading,
      title = GANTT_TIMELINE_DEFAULTS.title,
      className,
      style,
      onTaskDateChange,
      onTaskProgressChange,
      draggable: draggableProp,
      resizable: resizableProp,
    } = props;

    const canDrag = draggableProp ?? !!onTaskDateChange;
    const canResize = resizableProp ?? !!onTaskDateChange;

    // ========================================================================
    // Internal State (controlled/uncontrolled)
    // ========================================================================
    const [internalTimeScale, setInternalTimeScale] = useState<TimeScale>(
      timeScaleProp ?? (GANTT_TIMELINE_DEFAULTS.timeScale as TimeScale),
    );
    const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
    const [internalExpandedIds, setInternalExpandedIds] = useState<Set<string>>(new Set());
    const [internalCheckedIds, setInternalCheckedIds] = useState<Set<string>>(new Set());
    const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

    // Drag/resize/progress state
    const [dragState, setDragState] = useState<{
      type: 'move' | 'resize' | 'progress';
      taskId: string;
      startX: number;
      originalLeft: number;
      originalWidth: number;
      originalProgress: number;
    } | null>(null);
    const [dragOffset, setDragOffset] = useState(0);
    const [resizeOffset, setResizeOffset] = useState(0);
    const [progressDragValue, setProgressDragValue] = useState<number | null>(null);

    const timeScale = timeScaleProp ?? internalTimeScale;
    const selectedTaskId = selectedTaskIdProp ?? internalSelectedId;
    const expandedIds = expandedIdsProp ? new Set(expandedIdsProp) : internalExpandedIds;
    const checkedIds = checkedIdsProp ? new Set(checkedIdsProp) : internalCheckedIds;

    const chartRef = useRef<HTMLDivElement>(null);

    const rowHeight = rowHeightProp ?? 40;
    const panelWidth = 420;
    const headerRowHeight = 32;

    // ========================================================================
    // Handlers
    // ========================================================================
    const handleTimeScaleChange = useCallback((scale: TimeScale) => {
      if (!timeScaleProp) setInternalTimeScale(scale);
      onTimeScaleChange?.(scale);
    }, [timeScaleProp, onTimeScaleChange]);

    const handleTaskSelect = useCallback((taskId: string | null) => {
      if (selectedTaskIdProp === undefined) setInternalSelectedId(taskId);
      onTaskSelect?.(taskId);
    }, [selectedTaskIdProp, onTaskSelect]);

    const handleExpandToggle = useCallback((taskId: string) => {
      if (!expandedIdsProp) {
        setInternalExpandedIds(prev => {
          const next = new Set(prev);
          if (next.has(taskId)) next.delete(taskId);
          else next.add(taskId);
          return next;
        });
      }
      onExpandToggle?.(taskId);
    }, [expandedIdsProp, onExpandToggle]);

    const handleCheckToggle = useCallback((taskId: string) => {
      if (!checkedIdsProp) {
        setInternalCheckedIds(prev => {
          const next = new Set(prev);
          if (next.has(taskId)) next.delete(taskId);
          else next.add(taskId);
          return next;
        });
      }
      onCheckToggle?.(taskId);
    }, [checkedIdsProp, onCheckToggle]);

    const scrollToToday = useCallback(() => {
      if (!chartRef.current) return;
      const config = getTimeScaleConfig(timeScale);
      const range = dateRangeProp ?? computeAutoRange(tasks, timeScale);
      const todayX = getTodayPosition(range.start, range.end, config.msPerUnit, config.columnWidth);
      if (todayX !== null) {
        chartRef.current.scrollLeft = todayX - chartRef.current.clientWidth / 2;
      }
    }, [timeScale, dateRangeProp, tasks]);

    // ========================================================================
    // Bar Drag / Resize / Progress Handlers
    // ========================================================================
    const handleBarMouseDown = useCallback((e: React.MouseEvent, taskId: string, type: 'move' | 'resize' | 'progress', barLeft: number, barWidth: number, currentProgress: number) => {
      if (type === 'move' && !canDrag) return;
      if (type === 'resize' && !canResize) return;
      if (type === 'progress' && !onTaskProgressChange) return;
      e.stopPropagation();
      e.preventDefault();
      setDragState({ type, taskId, startX: e.clientX, originalLeft: barLeft, originalWidth: barWidth, originalProgress: currentProgress });
      setDragOffset(0);
      setResizeOffset(0);
    }, [canDrag, canResize, onTaskProgressChange]);

    const handleBarMouseUp = useCallback(() => {
      if (!dragState) return;
      const config = getTimeScaleConfig(timeScale);
      const task = tasks.find(t => t.id === dragState.taskId);
      if (!task) { setDragState(null); return; }

      if (dragState.type === 'move' && dragOffset !== 0) {
        const msShift = pixelOffsetToMs(dragOffset, config.msPerUnit, config.columnWidth);
        const origStart = new Date(task.startDate + 'T00:00:00').getTime();
        const origEnd = new Date(task.endDate + 'T00:00:00').getTime();
        onTaskDateChange?.(task.id, msToDateString(origStart + msShift), msToDateString(origEnd + msShift));
      } else if (dragState.type === 'resize' && resizeOffset !== 0) {
        const msShift = pixelOffsetToMs(resizeOffset, config.msPerUnit, config.columnWidth);
        const origEnd = new Date(task.endDate + 'T00:00:00').getTime();
        const newEnd = origEnd + msShift;
        const origStart = new Date(task.startDate + 'T00:00:00').getTime();
        if (newEnd > origStart) {
          onTaskDateChange?.(task.id, task.startDate, msToDateString(newEnd));
        }
      } else if (dragState.type === 'progress' && progressDragValue !== null) {
        onTaskProgressChange?.(task.id, progressDragValue);
      }

      setDragState(null);
      setDragOffset(0);
      setResizeOffset(0);
      setProgressDragValue(null);
    }, [dragState, dragOffset, resizeOffset, progressDragValue, timeScale, tasks, onTaskDateChange, onTaskProgressChange]);

    // Attach global mouse events for drag
    useEffect(() => {
      if (!dragState) return;
      const onMove = (e: MouseEvent) => {
        const dx = e.clientX - dragState.startX;
        if (dragState.type === 'move') {
          setDragOffset(dx);
        } else if (dragState.type === 'resize') {
          setResizeOffset(dx);
        } else if (dragState.type === 'progress') {
          const nw = dragState.originalWidth;
          const pxFromLeft = (dragState.originalProgress / 100) * nw + dx;
          const pct = Math.round(Math.max(0, Math.min(100, (pxFromLeft / nw) * 100)));
          setProgressDragValue(pct);
        }
      };
      const onUp = () => mouseUpRef.current();
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      return () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
    }, [dragState]);

    const mouseUpRef = useRef(handleBarMouseUp);
    mouseUpRef.current = handleBarMouseUp;

    // ========================================================================
    // Computed Data
    // ========================================================================
    const statusColors = getTaskStatusColors(tokens);
    const todayColors = getTodayMarkerColors(tokens);
    const scaleConfig = getTimeScaleConfig(timeScale);
    const scaleOptions = getTimeScaleOptions();

    const dateRange = useMemo(
      () => dateRangeProp ?? computeAutoRange(tasks, timeScale),
      [dateRangeProp, tasks, timeScale],
    );

    const timeColumns = useMemo(
      () => generateTimeColumns(dateRange, timeScale),
      [dateRange, timeScale],
    );

    const flatTasks = useMemo(
      () => flattenTaskTree(tasks, expandedIds),
      [tasks, expandedIds],
    );

    const totalChartWidth = timeColumns.length * scaleConfig.columnWidth;
    const totalChartHeight = flatTasks.length * rowHeight;

    const todayX = useMemo(
      () => showTodayMarker
        ? getTodayPosition(dateRange.start, dateRange.end, scaleConfig.msPerUnit, scaleConfig.columnWidth)
        : null,
      [showTodayMarker, dateRange, scaleConfig],
    );

    // Group time columns for header row 1
    const headerGroups = useMemo(() => {
      const groups: Array<{ label: string; span: number }> = [];
      for (const col of timeColumns) {
        const last = groups[groups.length - 1];
        if (last && last.label === col.groupLabel) {
          last.span++;
        } else {
          groups.push({ label: col.groupLabel, span: 1 });
        }
      }
      return groups;
    }, [timeColumns]);

    // ========================================================================
    // Task bar positions indexed by task id
    // ========================================================================
    const barPositions = useMemo(() => {
      const map = new Map<string, { left: number; width: number; top: number }>();
      flatTasks.forEach((item, index) => {
        const pos = calculateBarPosition(
          item.task.startDate,
          item.task.endDate,
          dateRange.start,
          scaleConfig.msPerUnit,
          scaleConfig.columnWidth,
        );
        map.set(item.task.id, {
          left: pos.left,
          width: pos.width,
          top: index * rowHeight + (rowHeight - tokens.spacing[5]) / 2,
        });
      });
      return map;
    }, [flatTasks, dateRange, scaleConfig, rowHeight]);

    // ========================================================================
    // Priority badge helper
    // ========================================================================
    const getPriorityColors = (priority?: GanttTask['priority']) => {
      switch (priority) {
        case 'urgent': return { bg: tokens.colors.errorScale[100], text: tokens.colors.errorScale[700], border: tokens.colors.errorScale[200] };
        case 'high': return { bg: tokens.colors.warningScale[100], text: tokens.colors.warningScale[700], border: tokens.colors.warningScale[200] };
        case 'medium': return { bg: tokens.colors.infoScale[100], text: tokens.colors.infoScale[700], border: tokens.colors.infoScale[200] };
        case 'low': return { bg: tokens.colors.neutral[100], text: tokens.colors.neutral[600], border: tokens.colors.neutral[200] };
        default: return null;
      }
    };

    // ========================================================================
    // Render: Toolbar
    // ========================================================================
    const renderToolbar = () => (
      <Box style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        backgroundColor: tokens.colors.common.white,
        minHeight: tokens.spacing[10],
        flexWrap: 'wrap',
        gap: tokens.spacing[2],
      }}>
        {/* Left side */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
          <span style={{
            fontSize: tokens.typography.fontSize.lg,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[900],
          }}>
            {title}
          </span>

          {showTodayButton && (
            <button
              onClick={scrollToToday}
              style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[700],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                fontFamily: 'inherit',
              }}
            >
              Today
            </button>
          )}

          {filters.length > 0 && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => onFilterClick?.(filter.key)}
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.sm,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${filter.active ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                    backgroundColor: filter.active ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                    color: filter.active ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: filter.active ? tokens.typography.fontWeight.medium : tokens.typography.fontWeight.normal,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    fontFamily: 'inherit',
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </Box>
          )}
        </Box>

        {/* Right side */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
          {toolbarActions.map((action) => (
            <button
              key={action.key}
              onClick={action.onClick}
              style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[700],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
              }}
            >
              {action.icon}
              {action.label}
            </button>
          ))}

          {/* Time scale toggle */}
          <Box style={{
            display: 'flex',
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            borderRadius: tokens.borderRadius.md,
            overflow: 'hidden',
          }}>
            {scaleOptions.map((opt, idx) => (
              <button
                key={opt.key}
                onClick={() => handleTimeScaleChange(opt.key)}
                style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  border: 'none',
                  borderLeft: idx > 0 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` : 'none',
                  backgroundColor: timeScale === opt.key ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                  color: timeScale === opt.key ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: timeScale === opt.key ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  fontFamily: 'inherit',
                }}
              >
                {opt.label}
              </button>
            ))}
          </Box>
        </Box>
      </Box>
    );

    // ========================================================================
    // Render: Left Panel - Task List
    // ========================================================================
    const renderLeftPanel = () => (
      <Box style={{
        width: panelWidth,
        minWidth: panelWidth,
        borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: tokens.colors.common.white,
      }}>
        {/* Panel header */}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          height: headerRowHeight * 2,
          padding: `0 ${tokens.spacing[3]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.neutral[50],
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flex: 1 }}>
            {selectable && (
              <Box style={{ width: tokens.spacing[5], flexShrink: 0 }} />
            )}
            <span style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[500],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
            }}>
              Task
            </span>
          </Box>
          <span style={{
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[500],
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            width: 80,
            textAlign: 'right' as const,
          }}>
            Status
          </span>
        </Box>

        {/* Task rows */}
        <Box style={{ flex: 1, overflow: 'auto' }}>
          {flatTasks.map((item) => {
            const { task, depth } = item;
            const isSelected = selectedTaskId === task.id;
            const isHovered = hoveredTaskId === task.id;
            const isChecked = checkedIds.has(task.id);
            const isExpanded = expandedIds.has(task.id);
            const hasChildren = task.expandable || tasks.some(t => t.parentId === task.id);
            const sColors = statusColors[task.status];
            const priorityC = getPriorityColors(task.priority);

            let rowBg = tokens.colors.common.white;
            if (isSelected) rowBg = tokens.colors.primaryScale[50];
            else if (isHovered) rowBg = tokens.colors.neutral[50];

            return (
              <Box
                key={task.id}
                onClick={() => {
                  handleTaskSelect(task.id);
                  onTaskClick?.(task);
                }}
                onMouseEnter={() => setHoveredTaskId(task.id)}
                onMouseLeave={() => setHoveredTaskId(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: rowHeight,
                  padding: `0 ${tokens.spacing[3]}px`,
                  paddingLeft: tokens.spacing[3] + depth * tokens.spacing[4],
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                  backgroundColor: rowBg,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  transform: isHovered ? tokens.motion.transform : 'none',
                }}
              >
                {/* Checkbox */}
                {selectable && (
                  <Box style={{ width: tokens.spacing[5], flexShrink: 0 }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleCheckToggle(task.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: 14,
                        height: 14,
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        accentColor: tokens.colors.primaryScale[600],
                      }}
                    />
                  </Box>
                )}

                {/* Expand arrow */}
                <Box style={{ width: tokens.spacing[4], flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {hasChildren && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExpandToggle(task.id);
                      }}
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        padding: 0,
                        color: tokens.colors.neutral[500],
                        fontSize: tokens.typography.fontSize.xs,
                        fontFamily: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: tokens.spacing[4],
                        height: tokens.spacing[4],
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                        style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: `all ${tokens.motion.hover}` }}>
                        <path d="M3 1.5L7 5L3 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                </Box>

                {/* Task key */}
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[400],
                  width: 64,
                  flexShrink: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {task.taskKey}
                </span>

                {/* Task name */}
                <span style={{
                  flex: 1,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: isSelected ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                  color: tokens.colors.neutral[900],
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginRight: tokens.spacing[2],
                }}>
                  {task.name}
                </span>

                {/* Priority badge */}
                {priorityC && (
                  <span style={{
                    padding: `0 ${tokens.spacing[1]}px`,
                    borderRadius: tokens.borderRadius.sm,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    backgroundColor: priorityC.bg,
                    color: priorityC.text,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${priorityC.border}`,
                    marginRight: tokens.spacing[2],
                    lineHeight: '18px',
                    whiteSpace: 'nowrap',
                    textTransform: 'capitalize' as const,
                  }}>
                    {task.priority}
                  </span>
                )}

                {/* Status badge */}
                <span style={{
                  width: 80,
                  textAlign: 'right' as const,
                  flexShrink: 0,
                }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `0 ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.full,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    backgroundColor: sColors.bg,
                    color: sColors.text,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${sColors.border}`,
                    lineHeight: '20px',
                    whiteSpace: 'nowrap',
                  }}>
                    <span style={{
                      width: 6,
                      height: 6,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: sColors.bar,
                      flexShrink: 0,
                    }} />
                    {task.status.replace(/-/g, ' ')}
                  </span>
                </span>
              </Box>
            );
          })}

          {/* Create task button */}
          {onCreateTask && (
            <Box style={{
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateTask();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.sm,
                  color: tokens.colors.neutral[500],
                  fontSize: tokens.typography.fontSize.sm,
                  fontFamily: 'inherit',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Create task
              </button>
            </Box>
          )}
        </Box>
      </Box>
    );

    // ========================================================================
    // Render: Chart Area (right panel)
    // ========================================================================
    const renderChartArea = () => (
      <div
        ref={chartRef}
        style={{
          flex: 1,
          overflow: 'auto',
          position: 'relative',
          backgroundColor: tokens.colors.common.white,
        }}
      >
        {/* Sticky header */}
        <Box style={{
          position: 'sticky',
          top: 0,
          zIndex: 3,
          backgroundColor: tokens.colors.neutral[50],
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}>
          {/* Header row 1: Group labels (Month/Year) */}
          <Box style={{
            display: 'flex',
            height: headerRowHeight,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          }}>
            {headerGroups.map((group, idx) => (
              <Box key={`${group.label}-${idx}`} style={{
                width: group.span * scaleConfig.columnWidth,
                minWidth: group.span * scaleConfig.columnWidth,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[700],
                borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
              }}>
                {group.label}
              </Box>
            ))}
          </Box>

          {/* Header row 2: Individual column labels */}
          <Box style={{
            display: 'flex',
            height: headerRowHeight,
          }}>
            {timeColumns.map((col) => (
              <Box key={col.key} style={{
                width: scaleConfig.columnWidth,
                minWidth: scaleConfig.columnWidth,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: col.isToday ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                color: col.isToday ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                backgroundColor: col.isToday ? tokens.colors.primaryScale[50] : 'transparent',
              }}>
                {col.label}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Chart body */}
        <Box style={{
          position: 'relative',
          width: totalChartWidth,
          minHeight: totalChartHeight,
        }}>
          {/* Grid lines (vertical) */}
          {timeColumns.map((col, idx) => (
            <Box key={`grid-${col.key}`} style={{
              position: 'absolute',
              left: idx * scaleConfig.columnWidth,
              top: 0,
              width: 1,
              height: '100%',
              backgroundColor: tokens.colors.neutral[100],
              pointerEvents: 'none',
            }} />
          ))}

          {/* Row stripes */}
          {flatTasks.map((item, index) => {
            const isSelected = selectedTaskId === item.task.id;
            const isHovered = hoveredTaskId === item.task.id;
            let bg = 'transparent';
            if (isSelected) bg = tokens.colors.primaryScale[50];
            else if (isHovered) bg = tokens.colors.neutral[50];
            else if (index % 2 === 1) bg = tokens.colors.neutral[50];

            return (
              <Box
                key={`row-${item.task.id}`}
                onMouseEnter={() => setHoveredTaskId(item.task.id)}
                onMouseLeave={() => setHoveredTaskId(null)}
                style={{
                  position: 'absolute',
                  top: index * rowHeight,
                  left: 0,
                  width: '100%',
                  height: rowHeight,
                  backgroundColor: bg,
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                  transition: `all ${tokens.motion.hover}`,
                }}
              />
            );
          })}

          {/* Task bars */}
          {flatTasks.map((item) => {
            const task = item.task;
            const pos = barPositions.get(task.id);
            if (!pos) return null;

            const sColors = statusColors[task.status];
            const progress = task.progress ?? 0;
            const barColor = task.barColor ?? sColors.bar;
            const isSelected = selectedTaskId === task.id;
            const isDragging = dragState?.taskId === task.id;
            const isDragMove = isDragging && dragState?.type === 'move';
            const isDragResize = isDragging && dragState?.type === 'resize';
            const isDragProgress = isDragging && dragState?.type === 'progress';

            const barLeft = isDragMove ? pos.left + dragOffset : pos.left;
            const barWidth = isDragResize ? Math.max(20, pos.width + resizeOffset) : pos.width;
            const displayProgress = isDragProgress && progressDragValue !== null ? progressDragValue : progress;

            return (
              <div
                key={`bar-${task.id}`}
                onMouseDown={(e) => {
                  if (e.button !== 0) return;
                  if (canDrag) handleBarMouseDown(e, task.id, 'move', pos.left, pos.width, progress);
                }}
                onClick={() => {
                  if (!isDragging) {
                    handleTaskSelect(task.id);
                    onTaskClick?.(task);
                  }
                }}
                style={{
                  position: 'absolute',
                  left: barLeft,
                  top: pos.top,
                  width: barWidth,
                  height: tokens.spacing[5],
                  borderRadius: tokens.borderRadius.sm,
                  backgroundColor: barColor,
                  opacity: isDragMove ? 0.7 : (task.status === 'not-started' ? 0.6 : 1),
                  cursor: canDrag ? (isDragMove ? 'grabbing' : 'grab') : 'pointer',
                  overflow: 'hidden',
                  boxShadow: isSelected ? `0 0 0 2px ${tokens.colors.primaryScale[400]}` : tokens.shadows.sm,
                  zIndex: isDragging ? 10 : 2,
                  display: 'flex',
                  alignItems: 'center',
                  userSelect: 'none',
                }}
              >
                {/* Progress fill */}
                {displayProgress > 0 && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: `${Math.min(displayProgress, 100)}%`,
                    height: '100%',
                    backgroundColor: sColors.fill,
                    opacity: 0.5,
                    borderRadius: tokens.borderRadius.sm,
                  }} />
                )}

                {/* Progress drag handle */}
                {onTaskProgressChange && displayProgress > 0 && displayProgress < 100 && (
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleBarMouseDown(e, task.id, 'progress', pos.left, pos.width, progress);
                    }}
                    style={{
                      position: 'absolute',
                      left: `${Math.min(displayProgress, 100)}%`,
                      top: 0,
                      width: 6,
                      height: '100%',
                      marginLeft: -3,
                      cursor: 'col-resize',
                      zIndex: 3,
                      backgroundColor: isDragProgress ? tokens.colors.common.white : 'transparent',
                      borderLeft: isDragProgress ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}` : 'none',
                    }}
                  />
                )}

                {/* Bar label (task name, shown if wide enough) */}
                {barWidth > 60 && (
                  <span style={{
                    position: 'relative',
                    zIndex: 1,
                    paddingLeft: tokens.spacing[1],
                    paddingRight: tokens.spacing[1],
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.common.white,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                  }}>
                    {task.name}
                  </span>
                )}

                {/* End icon */}
                {task.endIcon && (
                  <span style={{ position: 'absolute', right: tokens.spacing[1], zIndex: 1, pointerEvents: 'none' }}>
                    {task.endIcon}
                  </span>
                )}

                {/* Resize handle (right edge) */}
                {canResize && (
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleBarMouseDown(e, task.id, 'resize', pos.left, pos.width, progress);
                    }}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: 6,
                      height: '100%',
                      cursor: 'ew-resize',
                      zIndex: 4,
                      borderRight: isDragResize ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}` : 'none',
                    }}
                  />
                )}
              </div>
            );
          })}

          {/* Dependency arrows (SVG overlay) */}
          {showDependencies && dependencies.length > 0 && (
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: totalChartWidth,
                height: totalChartHeight,
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              <defs>
                <marker
                  id="gantt-arrowhead"
                  markerWidth="8"
                  markerHeight="6"
                  refX="8"
                  refY="3"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 8 3, 0 6"
                    fill={tokens.colors.neutral[400]}
                  />
                </marker>
              </defs>
              {dependencies.map((dep) => {
                const fromPos = barPositions.get(dep.fromTaskId);
                const toPos = barPositions.get(dep.toTaskId);
                if (!fromPos || !toPos) return null;

                const depType = dep.type ?? 'finish-to-start';
                let fromX: number;
                let toX: number;

                switch (depType) {
                  case 'finish-to-start':
                    fromX = fromPos.left + fromPos.width;
                    toX = toPos.left;
                    break;
                  case 'start-to-start':
                    fromX = fromPos.left;
                    toX = toPos.left;
                    break;
                  case 'finish-to-finish':
                    fromX = fromPos.left + fromPos.width;
                    toX = toPos.left + toPos.width;
                    break;
                  case 'start-to-finish':
                    fromX = fromPos.left;
                    toX = toPos.left + toPos.width;
                    break;
                }

                const fromY = fromPos.top + tokens.spacing[5] / 2;
                const toY = toPos.top + tokens.spacing[5] / 2;
                const path = calculateDependencyPath(fromX, fromY, toX, toY, rowHeight);

                return (
                  <path
                    key={dep.id}
                    d={path}
                    fill="none"
                    stroke={tokens.colors.neutral[400]}
                    strokeWidth={1.5}
                    markerEnd="url(#gantt-arrowhead)"
                  />
                );
              })}
            </svg>
          )}

          {/* Today marker */}
          {todayX !== null && (
            <>
              <Box style={{
                position: 'absolute',
                left: todayX,
                top: 0,
                width: 2,
                height: '100%',
                backgroundColor: todayColors.line,
                zIndex: 4,
                pointerEvents: 'none',
              }} />
              <Box style={{
                position: 'absolute',
                left: todayX - 4,
                top: 0,
                width: 10,
                height: 10,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: todayColors.dot,
                zIndex: 4,
                pointerEvents: 'none',
              }} />
            </>
          )}
        </Box>
      </div>
    );

    // ========================================================================
    // Render: Bottom Bar
    // ========================================================================
    const renderBottomBar = () => (
      <Box style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${tokens.spacing[1]}px ${tokens.spacing[4]}px`,
        borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        backgroundColor: tokens.colors.common.white,
        minHeight: tokens.spacing[8],
      }}>
        <span style={{
          fontSize: tokens.typography.fontSize.xs,
          color: tokens.colors.neutral[500],
        }}>
          {flatTasks.length} task{flatTasks.length !== 1 ? 's' : ''}
          {checkedIds.size > 0 && ` \u00b7 ${checkedIds.size} selected`}
        </span>

        {/* Bottom time scale segmented control */}
        <Box style={{
          display: 'flex',
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          borderRadius: tokens.borderRadius.md,
          overflow: 'hidden',
        }}>
          {scaleOptions.map((opt, idx) => (
            <button
              key={opt.key}
              onClick={() => handleTimeScaleChange(opt.key)}
              style={{
                padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                border: 'none',
                borderLeft: idx > 0 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` : 'none',
                backgroundColor: timeScale === opt.key ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                color: timeScale === opt.key ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500],
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: timeScale === opt.key ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                fontFamily: 'inherit',
              }}
            >
              {opt.label}
            </button>
          ))}
        </Box>
      </Box>
    );

    // ========================================================================
    // Main Render
    // ========================================================================
    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          borderRadius: tokens.borderRadius.md,
          overflow: 'hidden',
          backgroundColor: tokens.colors.common.white,
          boxShadow: tokens.shadows.sm,
          ...style,
        }}
      >
        {renderToolbar()}

        {loading ? (
          <Box style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tokens.colors.neutral[400],
            fontSize: tokens.typography.fontSize.sm,
          }}>
            Loading...
          </Box>
        ) : tasks.length === 0 ? (
          <Box style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tokens.colors.neutral[400],
            fontSize: tokens.typography.fontSize.sm,
          }}>
            No tasks to display
          </Box>
        ) : (
          <Box style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {renderLeftPanel()}
            {renderChartArea()}
          </Box>
        )}

        {renderBottomBar()}
      </Box>
    );
  },
});
