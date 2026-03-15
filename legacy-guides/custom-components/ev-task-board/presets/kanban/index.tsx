'use client';

/**
 * EvTaskBoard - Kanban Preset
 * 5-column kanban board: Backlog, Today, In Progress, Review, Done.
 * Task cards show title, department badge, assignee, priority indicator, checklist progress.
 * Priority colors: urgent=error, high=warning, medium=info, low=neutral.
 * Department filter pills and column counts.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createProgressBarStyle,
  createStatusDotStyle,
} from '../../../helpers';
import type { TaskBoardProps, OperationalTask } from '../../core';

const MOCK_TASKS: OperationalTask[] = [
  {
    id: 'task1',
    title: 'Setup main stage sound system',
    description: 'Install and test all audio equipment',
    department: 'Audio',
    assignee: 'Carlos M.',
    status: 'today',
    priority: 'urgent',
    dueDate: new Date('2026-02-10'),
    checklist: [
      { item: 'Install speakers', done: true },
      { item: 'Run cables', done: true },
      { item: 'Sound check', done: false },
    ],
  },
  {
    id: 'task2',
    title: 'Coordinate security team deployment',
    description: 'Assign zones and shifts',
    department: 'Security',
    assignee: 'Ana R.',
    status: 'in-progress',
    priority: 'high',
    dueDate: new Date('2026-02-10'),
    checklist: [
      { item: 'Review floor plan', done: true },
      { item: 'Assign zones', done: false },
      { item: 'Brief team', done: false },
    ],
  },
  {
    id: 'task3',
    title: 'Stock bar inventory',
    description: 'Verify all beverage stock levels',
    department: 'Bar',
    assignee: 'Diego P.',
    status: 'today',
    priority: 'medium',
    dueDate: new Date('2026-02-10'),
    checklist: [
      { item: 'Count beer stock', done: false },
      { item: 'Count spirits', done: false },
    ],
  },
  {
    id: 'task4',
    title: 'Review vendor contracts',
    department: 'Operations',
    status: 'backlog',
    priority: 'low',
    dueDate: new Date('2026-02-12'),
  },
  {
    id: 'task5',
    title: 'Test emergency exit lighting',
    department: 'Safety',
    assignee: 'Laura S.',
    status: 'review',
    priority: 'high',
    dueDate: new Date('2026-02-09'),
    checklist: [
      { item: 'North exit', done: true },
      { item: 'South exit', done: true },
      { item: 'East exit', done: true },
      { item: 'West exit', done: true },
    ],
  },
  {
    id: 'task6',
    title: 'Update digital signage content',
    department: 'Marketing',
    assignee: 'Sofia T.',
    status: 'done',
    priority: 'medium',
    dueDate: new Date('2026-02-09'),
  },
  {
    id: 'task7',
    title: 'Inspect stage rigging',
    department: 'Production',
    assignee: 'Pedro K.',
    status: 'in-progress',
    priority: 'urgent',
    dueDate: new Date('2026-02-10'),
    checklist: [
      { item: 'Visual inspection', done: true },
      { item: 'Load test', done: false },
    ],
    dependencies: ['task1'],
  },
  {
    id: 'task8',
    title: 'Prepare VIP lounge',
    department: 'Hospitality',
    status: 'today',
    priority: 'medium',
    dueDate: new Date('2026-02-10'),
  },
  {
    id: 'task9',
    title: 'Update event schedule in app',
    department: 'Tech',
    assignee: 'Marco A.',
    status: 'review',
    priority: 'medium',
    dueDate: new Date('2026-02-10'),
  },
  {
    id: 'task10',
    title: 'Clean restroom facilities',
    department: 'Facilities',
    assignee: 'Elena R.',
    status: 'done',
    priority: 'low',
    dueDate: new Date('2026-02-09'),
  },
  {
    id: 'task11',
    title: 'Brief medical staff',
    department: 'Medical',
    status: 'backlog',
    priority: 'high',
    dueDate: new Date('2026-02-11'),
  },
  {
    id: 'task12',
    title: 'Configure parking lot signage',
    department: 'Transport',
    assignee: 'Roberto G.',
    status: 'in-progress',
    priority: 'medium',
    dueDate: new Date('2026-02-10'),
  },
];

const DEPARTMENTS = [
  'All',
  'Audio',
  'Security',
  'Bar',
  'Operations',
  'Safety',
  'Marketing',
  'Production',
  'Hospitality',
  'Tech',
  'Facilities',
  'Medical',
  'Transport',
];

const PRIORITY_CONFIG: Record<string, { color: 'error' | 'warning' | 'info' | 'secondary'; label: string }> = {
  urgent: { color: 'error', label: 'Urgent' },
  high: { color: 'warning', label: 'High' },
  medium: { color: 'info', label: 'Medium' },
  low: { color: 'secondary', label: 'Low' },
};

export const KanbanEvTaskBoard = createPreset<TaskBoardProps>({
  name: 'EvTaskBoard.Kanban',
  render: ({ primitives, props, tokens }: PresetContext<TaskBoardProps>) => {
    const { Box, Text } = primitives;
    const { tasks, onTaskClick, onStatusChange, onCreateTask, className, style } = props;

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const data = tasks?.length ? tasks : MOCK_TASKS;

    const [deptFilter, setDeptFilter] = useState('All');
    const [hoveredTask, setHoveredTask] = useState<string | null>(null);

    const filteredData = useMemo(() => {
      if (deptFilter === 'All') return data;
      return data.filter((t) => t.department === deptFilter);
    }, [data, deptFilter]);

    const columns = [
      { key: 'backlog', label: 'Backlog', color: tokens.colors.neutral[400], status: 'backlog' as const },
      { key: 'today', label: 'Today', color: tokens.colors.infoScale[500], status: 'today' as const },
      { key: 'in-progress', label: 'In Progress', color: tokens.colors.warningScale[500], status: 'in-progress' as const },
      { key: 'review', label: 'Review', color: tokens.colors.primaryScale[500], status: 'review' as const },
      { key: 'done', label: 'Done', color: tokens.colors.successScale[500], status: 'done' as const },
    ];

    const getChecklistProgress = (task: OperationalTask) => {
      if (!task.checklist?.length) return null;
      const done = task.checklist.filter((c) => c.done).length;
      const total = task.checklist.length;
      const percent = (done / total) * 100;
      return { done, total, percent };
    };

    const formatDate = (d: Date) => {
      const today = new Date();
      const diffDays = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
      <Box
        className={className}
        style={{
          height: '100%',
          overflow: 'auto',
          backgroundColor: tokens.colors.neutral[50],
          padding: tokens.spacing[5],
          ...style,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: tokens.spacing[4],
          }}
        >
          <div>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                display: 'block',
              }}
            >
              {'📋'} Task Board
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {data.length} tasks {'·'} {filteredData.length} shown
            </Text>
          </div>
          <div
            onClick={() => onCreateTask?.()}
            style={{
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.primaryScale[500],
              color: tokens.colors.common.white,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              cursor: 'pointer',
              ...hoverStyle,
            }}
          >
            + Create Task
          </div>
        </div>

        {/* Department Filters */}
        <div
          style={{
            ...cardBase,
            padding: tokens.spacing[3],
            marginBottom: tokens.spacing[4],
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flexWrap: 'wrap' as const }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[600],
              }}
            >
              Department:
            </Text>
            {DEPARTMENTS.map((dept) => (
              <div
                key={dept}
                onClick={() => setDeptFilter(dept)}
                style={createFilterPillStyle(tokens, { active: deptFilter === dept })}
              >
                {dept}
              </div>
            ))}
          </div>
        </div>

        {/* Kanban Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: tokens.spacing[3],
            alignItems: 'flex-start',
          }}
        >
          {columns.map((col) => {
            const colTasks = filteredData.filter((t) => t.status === col.status);
            return (
              <div key={col.key}>
                {/* Column Header */}
                <div
                  style={{
                    ...cardBase,
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    marginBottom: tokens.spacing[3],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    {col.label}
                  </Text>
                  <span
                    style={{
                      padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: col.color,
                      color: tokens.colors.common.white,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.bold,
                    }}
                  >
                    {colTasks.length}
                  </span>
                </div>

                {/* Task Cards */}
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                  {colTasks.map((task) => {
                    const isHovered = hoveredTask === task.id;
                    const progress = getChecklistProgress(task);
                    const priorityConfig = PRIORITY_CONFIG[task.priority];
                    const progressBar = progress ? createProgressBarStyle(tokens, { percent: progress.percent }) : null;

                    return (
                      <div
                        key={task.id}
                        onMouseEnter={() => setHoveredTask(task.id)}
                        onMouseLeave={() => setHoveredTask(null)}
                        onClick={() => onTaskClick?.(task.id)}
                        style={{
                          ...cardBase,
                          padding: tokens.spacing[3],
                          borderLeft: `3px solid ${col.color}`,
                          transform: isHovered ? 'translateY(-2px)' : 'none',
                          boxShadow: isHovered ? tokens.shadows.md : tokens.shadows.sm,
                          transition: `all ${tokens.motion.hover}`,
                          cursor: 'pointer',
                        }}
                      >
                        {/* Priority Badge */}
                        <div style={{ marginBottom: tokens.spacing[2] }}>
                          <span style={createBadgeStyle(tokens, priorityConfig.color)}>
                            {priorityConfig.label}
                          </span>
                        </div>

                        {/* Title */}
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.neutral[900],
                            display: 'block',
                            marginBottom: tokens.spacing[2],
                          }}
                        >
                          {task.title}
                        </Text>

                        {/* Department */}
                        <div style={{ marginBottom: tokens.spacing[2] }}>
                          <span style={createBadgeStyle(tokens, 'info')}>{task.department}</span>
                        </div>

                        {/* Assignee */}
                        {task.assignee && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], marginBottom: tokens.spacing[2] }}>
                            <div
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: tokens.borderRadius.full,
                                backgroundColor: tokens.colors.primaryScale[100],
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: tokens.typography.fontSize.xs,
                                fontWeight: tokens.typography.fontWeight.bold,
                                color: tokens.colors.primaryScale[700],
                              }}
                            >
                              {task.assignee.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                              {task.assignee}
                            </Text>
                          </div>
                        )}

                        {/* Due Date */}
                        {task.dueDate && (
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[500],
                              display: 'block',
                              marginBottom: tokens.spacing[2],
                            }}
                          >
                            {'📅'} {formatDate(task.dueDate)}
                          </Text>
                        )}

                        {/* Checklist Progress */}
                        {progress && progressBar && (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                                Checklist
                              </Text>
                              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                                {progress.done}/{progress.total}
                              </Text>
                            </div>
                            <div style={progressBar.track}>
                              <div style={progressBar.fill} />
                            </div>
                          </div>
                        )}

                        {/* Dependencies */}
                        {task.dependencies && task.dependencies.length > 0 && (
                          <div style={{ marginTop: tokens.spacing[2] }}>
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.warningScale[600],
                              }}
                            >
                              {'⚠️'} Blocked by {task.dependencies.length} task(s)
                            </Text>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div
                      style={{
                        padding: tokens.spacing[4],
                        textAlign: 'center' as const,
                        color: tokens.colors.neutral[400],
                        border: `2px dashed ${tokens.colors.neutral[200]}`,
                        borderRadius: tokens.borderRadius.md,
                      }}
                    >
                      <Text style={{ fontSize: tokens.typography.fontSize.xs }}>No tasks</Text>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Box>
    );
  },
});
