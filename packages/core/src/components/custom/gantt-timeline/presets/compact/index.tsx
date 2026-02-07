'use client';

/**
 * GanttTimeline - Compact Preset
 * Simplified timeline with inline task name bars,
 * today marker, and time scale controls. No left panel,
 * no dependencies, no checkboxes.
 */

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { GanttTimelineProps, TimeScale } from '../../core';
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
  pixelOffsetToMs,
  msToDateString,
} from '../../core';

export const CompactGanttTimeline = createPreset<GanttTimelineProps & Record<string, unknown>>({
  name: 'GanttTimeline.Compact',
  render: ({ primitives, props, tokens, engine }: PresetContext<GanttTimelineProps>) => {
    const { Box } = primitives;

    const {
      tasks,
      timeScale: timeScaleProp,
      onTimeScaleChange,
      dateRange: dateRangeProp,
      selectedTaskId: selectedTaskIdProp,
      onTaskSelect,
      onTaskClick,
      showTodayMarker = GANTT_TIMELINE_DEFAULTS.showTodayMarker,
      rowHeight: rowHeightProp,
      loading,
      title = GANTT_TIMELINE_DEFAULTS.title,
      className,
      style,
      onTaskDateChange,
      draggable: draggableProp,
      resizable: resizableProp,
    } = props;

    const canDrag = draggableProp ?? !!onTaskDateChange;
    const canResize = resizableProp ?? !!onTaskDateChange;

    // ========================================================================
    // Internal State
    // ========================================================================
    const [internalTimeScale, setInternalTimeScale] = useState<TimeScale>(
      timeScaleProp ?? (GANTT_TIMELINE_DEFAULTS.timeScale as TimeScale),
    );
    const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
    const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

    // Drag/resize state
    const [dragState, setDragState] = useState<{
      type: 'move' | 'resize';
      taskId: string;
      startX: number;
      originalLeft: number;
      originalWidth: number;
    } | null>(null);
    const [dragOffset, setDragOffset] = useState(0);
    const [resizeOffset, setResizeOffset] = useState(0);

    const timeScale = timeScaleProp ?? internalTimeScale;
    const selectedTaskId = selectedTaskIdProp ?? internalSelectedId;

    const chartRef = useRef<HTMLDivElement>(null);

    const rowHeight = rowHeightProp ?? 36;
    const headerRowHeight = 28;

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

    // Bar drag/resize handlers
    const handleBarMouseDown = useCallback((e: React.MouseEvent, taskId: string, type: 'move' | 'resize', barLeft: number, barWidth: number) => {
      if (type === 'move' && !canDrag) return;
      if (type === 'resize' && !canResize) return;
      e.stopPropagation();
      e.preventDefault();
      setDragState({ type, taskId, startX: e.clientX, originalLeft: barLeft, originalWidth: barWidth });
      setDragOffset(0);
      setResizeOffset(0);
    }, [canDrag, canResize]);

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
      }

      setDragState(null);
      setDragOffset(0);
      setResizeOffset(0);
    }, [dragState, dragOffset, resizeOffset, timeScale, tasks, onTaskDateChange]);

    const mouseUpRef = useRef(handleBarMouseUp);
    mouseUpRef.current = handleBarMouseUp;

    useEffect(() => {
      if (!dragState) return;
      const onMove = (e: MouseEvent) => {
        const dx = e.clientX - dragState.startX;
        if (dragState.type === 'move') setDragOffset(dx);
        else if (dragState.type === 'resize') setResizeOffset(dx);
      };
      const onUp = () => mouseUpRef.current();
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      return () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
    }, [dragState]);

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

    const totalChartWidth = timeColumns.length * scaleConfig.columnWidth;
    const totalChartHeight = tasks.length * rowHeight;

    const todayX = useMemo(
      () => showTodayMarker
        ? getTodayPosition(dateRange.start, dateRange.end, scaleConfig.msPerUnit, scaleConfig.columnWidth)
        : null,
      [showTodayMarker, dateRange, scaleConfig],
    );

    // Group time columns for top header row
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

    // Bar positions
    const barPositions = useMemo(() => {
      return tasks.map((task, index) => {
        const pos = calculateBarPosition(
          task.startDate,
          task.endDate,
          dateRange.start,
          scaleConfig.msPerUnit,
          scaleConfig.columnWidth,
        );
        return {
          task,
          left: pos.left,
          width: pos.width,
          top: index * rowHeight + (rowHeight - 18) / 2,
        };
      });
    }, [tasks, dateRange, scaleConfig, rowHeight]);

    // ========================================================================
    // Render: Top Bar
    // ========================================================================
    const renderTopBar = () => (
      <Box style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        backgroundColor: tokens.colors.common.white,
        minHeight: tokens.spacing[8],
      }}>
        <span style={{
          fontSize: tokens.typography.fontSize.md,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.neutral[900],
        }}>
          {title}
        </span>

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
                padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                border: 'none',
                borderLeft: idx > 0 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` : 'none',
                backgroundColor: timeScale === opt.key ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                color: timeScale === opt.key ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: timeScale === opt.key ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                cursor: 'pointer',
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
    // Render: Chart
    // ========================================================================
    const renderChart = () => (
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
          {/* Group labels row */}
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

          {/* Column labels row */}
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
          {/* Grid lines */}
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
          {tasks.map((task, index) => {
            const isSelected = selectedTaskId === task.id;
            const isHovered = hoveredTaskId === task.id;
            let bg = 'transparent';
            if (isSelected) bg = tokens.colors.primaryScale[50];
            else if (isHovered) bg = tokens.colors.neutral[50];
            else if (index % 2 === 1) bg = tokens.colors.neutral[50];

            return (
              <Box
                key={`row-${task.id}`}
                onMouseEnter={() => setHoveredTaskId(task.id)}
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

          {/* Task bars with inline names */}
          {barPositions.map(({ task, left, width, top }) => {
            const sColors = statusColors[task.status];
            const barColor = task.barColor ?? sColors.bar;
            const isSelected = selectedTaskId === task.id;
            const progress = task.progress ?? 0;
            const isDragging = dragState?.taskId === task.id;
            const isDragMove = isDragging && dragState?.type === 'move';
            const isDragResize = isDragging && dragState?.type === 'resize';

            const barLeft = isDragMove ? left + dragOffset : left;
            const barWidth = isDragResize ? Math.max(20, width + resizeOffset) : width;

            return (
              <div
                key={`bar-${task.id}`}
                onMouseDown={(e) => {
                  if (e.button !== 0) return;
                  if (canDrag) handleBarMouseDown(e, task.id, 'move', left, width);
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
                  top,
                  width: barWidth,
                  height: 18,
                  borderRadius: tokens.borderRadius.sm,
                  backgroundColor: barColor,
                  opacity: isDragMove ? 0.7 : (task.status === 'not-started' ? 0.6 : 1),
                  cursor: canDrag ? (isDragMove ? 'grabbing' : 'grab') : 'pointer',
                  overflow: 'hidden',
                  boxShadow: isSelected ? `0 0 0 2px ${tokens.colors.primaryScale[400]}` : 'none',
                  zIndex: isDragging ? 10 : 2,
                  display: 'flex',
                  alignItems: 'center',
                  userSelect: 'none',
                }}
              >
                {/* Progress fill */}
                {progress > 0 && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: `${Math.min(progress, 100)}%`,
                    height: '100%',
                    backgroundColor: sColors.fill,
                    opacity: 0.5,
                    borderRadius: tokens.borderRadius.sm,
                  }} />
                )}

                {/* Inline task name (always shown, truncated) */}
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
                  lineHeight: '18px',
                  pointerEvents: 'none',
                }}>
                  {task.name}
                </span>

                {/* Resize handle (right edge) */}
                {canResize && (
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleBarMouseDown(e, task.id, 'resize', left, width);
                    }}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: 6,
                      height: '100%',
                      cursor: 'ew-resize',
                      zIndex: 4,
                      borderRight: isDragResize ? `2px solid ${tokens.colors.common.white}` : 'none',
                    }}
                  />
                )}
              </div>
            );
          })}

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
                left: todayX - 3,
                top: 0,
                width: 8,
                height: 8,
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
        {renderTopBar()}

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
          renderChart()
        )}
      </Box>
    );
  },
});
