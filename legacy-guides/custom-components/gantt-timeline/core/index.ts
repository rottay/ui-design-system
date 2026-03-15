/**
 * GanttTimeline - Core Interface
 * Project gantt chart with task bars, dependencies, today marker,
 * time scale controls, and hierarchical task tree
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

// ============================================================================
// Type Aliases
// ============================================================================

export type GanttTimelinePreset = 'standard' | 'compact';

export type TimeScale = 'day' | 'week' | 'month' | 'quarter';

export type GanttTaskStatus = 'not-started' | 'in-progress' | 'done' | 'behind' | 'blocked';

export type GanttTaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type DependencyType = 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';

// ============================================================================
// Data Interfaces
// ============================================================================

export interface DateRange {
  start: string;
  end: string;
}

export interface GanttTask {
  id: string;
  taskKey: string;
  name: string;
  startDate: string;
  endDate: string;
  progress?: number;
  status: GanttTaskStatus;
  priority?: GanttTaskPriority;
  assignee?: {
    name: string;
    avatar?: string;
  };
  parentId?: string;
  barColor?: string;
  endIcon?: ReactNode;
  expandable?: boolean;
}

export interface GanttDependency {
  id: string;
  fromTaskId: string;
  toTaskId: string;
  type?: DependencyType;
}

// ============================================================================
// Filter / Toolbar
// ============================================================================

export interface GanttFilter {
  key: string;
  label: string;
  active?: boolean;
}

export interface GanttToolbarAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
}

// ============================================================================
// Tree Node (internal)
// ============================================================================

export interface GanttTaskNode {
  task: GanttTask;
  children: GanttTaskNode[];
  depth: number;
}

// ============================================================================
// Props
// ============================================================================

export interface GanttTimelineProps extends EngineAwareProps {
  preset?: GanttTimelinePreset;
  tasks: GanttTask[];
  dependencies?: GanttDependency[];
  timeScale?: TimeScale;
  onTimeScaleChange?: (scale: TimeScale) => void;
  dateRange?: DateRange;
  selectedTaskId?: string;
  onTaskSelect?: (taskId: string | null) => void;
  expandedTaskIds?: string[];
  onExpandToggle?: (taskId: string) => void;
  checkedTaskIds?: string[];
  onCheckToggle?: (taskId: string) => void;
  onCreateTask?: () => void;
  onTaskClick?: (task: GanttTask) => void;
  toolbarActions?: GanttToolbarAction[];
  filters?: GanttFilter[];
  onFilterClick?: (key: string) => void;
  showTodayMarker?: boolean;
  showTodayButton?: boolean;
  showDependencies?: boolean;
  selectable?: boolean;
  rowHeight?: number;
  loading?: boolean;
  title?: string;
  className?: string;
  style?: CSSProperties;
  // Interactive props
  onTaskDateChange?: (taskId: string, newStartDate: string, newEndDate: string) => void;
  onTaskProgressChange?: (taskId: string, newProgress: number) => void;
  draggable?: boolean;
  resizable?: boolean;
}

// ============================================================================
// Defaults
// ============================================================================

export const GANTT_TIMELINE_DEFAULTS: Partial<GanttTimelineProps> = {
  preset: 'standard',
  timeScale: 'week',
  showTodayMarker: true,
  showTodayButton: true,
  showDependencies: true,
  selectable: true,
  title: 'Timeline',
};

// ============================================================================
// Utilities - Status Colors
// ============================================================================

export function getTaskStatusColors(tokens: DesignTokens) {
  return {
    'not-started': {
      bar: tokens.colors.neutral[300],
      fill: tokens.colors.neutral[200],
      text: tokens.colors.neutral[700],
      bg: tokens.colors.neutral[100],
      border: tokens.colors.neutral[300],
    },
    'in-progress': {
      bar: tokens.colors.infoScale[500],
      fill: tokens.colors.infoScale[400],
      text: tokens.colors.infoScale[700],
      bg: tokens.colors.infoScale[50],
      border: tokens.colors.infoScale[200],
    },
    done: {
      bar: tokens.colors.successScale[500],
      fill: tokens.colors.successScale[400],
      text: tokens.colors.successScale[700],
      bg: tokens.colors.successScale[50],
      border: tokens.colors.successScale[200],
    },
    behind: {
      bar: tokens.colors.warningScale[500],
      fill: tokens.colors.warningScale[400],
      text: tokens.colors.warningScale[700],
      bg: tokens.colors.warningScale[50],
      border: tokens.colors.warningScale[200],
    },
    blocked: {
      bar: tokens.colors.errorScale[500],
      fill: tokens.colors.errorScale[400],
      text: tokens.colors.errorScale[700],
      bg: tokens.colors.errorScale[50],
      border: tokens.colors.errorScale[200],
    },
  };
}

export function getTodayMarkerColors(tokens: DesignTokens) {
  return {
    line: tokens.colors.errorScale[500],
    dot: tokens.colors.errorScale[500],
    label: tokens.colors.errorScale[600],
    labelBg: tokens.colors.errorScale[50],
  };
}

// ============================================================================
// Utilities - Time Scale Config
// ============================================================================

const MS_PER_DAY = 86400000;
const MS_PER_WEEK = MS_PER_DAY * 7;

export interface TimeScaleConfig {
  label: string;
  msPerUnit: number;
  columnWidth: number;
  headerFormat: 'day' | 'week' | 'month' | 'quarter';
}

export function getTimeScaleConfig(scale: TimeScale): TimeScaleConfig {
  switch (scale) {
    case 'day':
      return { label: 'Days', msPerUnit: MS_PER_DAY, columnWidth: 40, headerFormat: 'day' };
    case 'week':
      return { label: 'Weeks', msPerUnit: MS_PER_WEEK, columnWidth: 120, headerFormat: 'week' };
    case 'month':
      return { label: 'Months', msPerUnit: MS_PER_DAY * 30, columnWidth: 160, headerFormat: 'month' };
    case 'quarter':
      return { label: 'Quarters', msPerUnit: MS_PER_DAY * 91, columnWidth: 200, headerFormat: 'quarter' };
  }
}

export function getTimeScaleOptions(): Array<{ key: TimeScale; label: string }> {
  return [
    { key: 'day', label: 'Days' },
    { key: 'week', label: 'Weeks' },
    { key: 'month', label: 'Months' },
    { key: 'quarter', label: 'Quarters' },
  ];
}

// ============================================================================
// Utilities - Date Helpers
// ============================================================================

function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatQuarterYear(date: Date): string {
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `Q${quarter} ${date.getFullYear()}`;
}

function formatDayLabel(date: Date): string {
  return String(date.getDate());
}

function formatWeekLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short' });
}

export function isToday(dateStr: string): boolean {
  const today = new Date();
  const d = parseDate(dateStr);
  return d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
}

// ============================================================================
// Utilities - Bar Position Calculation
// ============================================================================

export function calculateBarPosition(
  taskStart: string,
  taskEnd: string,
  timelineStart: string,
  msPerUnit: number,
  columnWidth: number,
): { left: number; width: number } {
  const start = parseDate(taskStart).getTime();
  const end = parseDate(taskEnd).getTime();
  const origin = parseDate(timelineStart).getTime();

  const left = ((start - origin) / msPerUnit) * columnWidth;
  const width = Math.max(((end - start) / msPerUnit) * columnWidth, columnWidth * 0.3);

  return { left, width };
}

export function getTodayPosition(
  timelineStart: string,
  timelineEnd: string,
  msPerUnit: number,
  columnWidth: number,
): number | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const start = parseDate(timelineStart).getTime();
  const end = parseDate(timelineEnd).getTime();

  if (today < start || today > end) return null;

  return ((today - start) / msPerUnit) * columnWidth;
}

// ============================================================================
// Utilities - Auto Range
// ============================================================================

export function computeAutoRange(tasks: GanttTask[], scale: TimeScale): DateRange {
  if (tasks.length === 0) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 3, 0);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  }

  const starts = tasks.map(t => parseDate(t.startDate).getTime());
  const ends = tasks.map(t => parseDate(t.endDate).getTime());
  const minTime = Math.min(...starts);
  const maxTime = Math.max(...ends);

  // Add padding based on scale
  const paddingMs = scale === 'day' ? MS_PER_WEEK
    : scale === 'week' ? MS_PER_WEEK * 2
    : scale === 'month' ? MS_PER_DAY * 30
    : MS_PER_DAY * 91;

  const startDate = new Date(minTime - paddingMs);
  const endDate = new Date(maxTime + paddingMs);

  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0],
  };
}

// ============================================================================
// Utilities - Time Columns
// ============================================================================

export interface TimeColumn {
  key: string;
  label: string;
  groupLabel: string;
  date: Date;
  isToday: boolean;
}

export function generateTimeColumns(range: DateRange, scale: TimeScale): TimeColumn[] {
  const columns: TimeColumn[] = [];
  const start = parseDate(range.start);
  const end = parseDate(range.end);
  const current = new Date(start);

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const todayNow = new Date();
    const isTodayCol = current.getFullYear() === todayNow.getFullYear() &&
      current.getMonth() === todayNow.getMonth() &&
      current.getDate() === todayNow.getDate();

    let label: string;
    let groupLabel: string;

    switch (scale) {
      case 'day':
        label = formatDayLabel(current);
        groupLabel = formatMonthYear(current);
        break;
      case 'week':
        label = formatWeekLabel(current);
        groupLabel = formatMonthYear(current);
        break;
      case 'month':
        label = formatMonthLabel(current);
        groupLabel = String(current.getFullYear());
        break;
      case 'quarter':
        label = formatQuarterYear(current);
        groupLabel = String(current.getFullYear());
        break;
    }

    columns.push({
      key: dateStr,
      label,
      groupLabel,
      date: new Date(current),
      isToday: isTodayCol,
    });

    // Advance
    switch (scale) {
      case 'day':
        current.setDate(current.getDate() + 1);
        break;
      case 'week':
        current.setDate(current.getDate() + 7);
        break;
      case 'month':
        current.setMonth(current.getMonth() + 1);
        break;
      case 'quarter':
        current.setMonth(current.getMonth() + 3);
        break;
    }
  }

  return columns;
}

// ============================================================================
// Utilities - Task Tree
// ============================================================================

export function buildTaskTree(tasks: GanttTask[]): GanttTaskNode[] {
  const taskMap = new Map<string, GanttTaskNode>();
  const roots: GanttTaskNode[] = [];

  // Create nodes
  for (const task of tasks) {
    taskMap.set(task.id, { task, children: [], depth: 0 });
  }

  // Build tree
  for (const task of tasks) {
    const node = taskMap.get(task.id)!;
    if (task.parentId && taskMap.has(task.parentId)) {
      const parent = taskMap.get(task.parentId)!;
      node.depth = parent.depth + 1;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function flattenTaskTree(
  tasks: GanttTask[],
  expandedIds: Set<string>,
): Array<{ task: GanttTask; depth: number }> {
  const tree = buildTaskTree(tasks);
  const result: Array<{ task: GanttTask; depth: number }> = [];

  function walk(nodes: GanttTaskNode[]) {
    for (const node of nodes) {
      result.push({ task: node.task, depth: node.depth });
      if (node.children.length > 0 && expandedIds.has(node.task.id)) {
        walk(node.children);
      }
    }
  }

  walk(tree);
  return result;
}

// ============================================================================
// Utilities - Dependency Path
// ============================================================================

export function pixelOffsetToMs(
  pxOffset: number,
  msPerUnit: number,
  columnWidth: number,
): number {
  return (pxOffset / columnWidth) * msPerUnit;
}

export function msToDateString(ms: number): string {
  const d = new Date(ms);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateDependencyPath(
  fromRight: number,
  fromY: number,
  toLeft: number,
  toY: number,
  rowHeight: number,
): string {
  const offset = rowHeight * 0.3;

  if (toLeft > fromRight + 10) {
    // Standard S-curve
    const midX = (fromRight + toLeft) / 2;
    return `M ${fromRight} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toLeft} ${toY}`;
  }

  // Route around when target is to the left
  const detourX = Math.max(fromRight, toLeft) + offset;
  return [
    `M ${fromRight} ${fromY}`,
    `L ${detourX} ${fromY}`,
    `Q ${detourX + offset} ${fromY}, ${detourX + offset} ${fromY + (toY > fromY ? offset : -offset)}`,
    `L ${detourX + offset} ${toY - (toY > fromY ? offset : -offset)}`,
    `Q ${detourX + offset} ${toY}, ${detourX} ${toY}`,
    `L ${toLeft} ${toY}`,
  ].join(' ');
}
