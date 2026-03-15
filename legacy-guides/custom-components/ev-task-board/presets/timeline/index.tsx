'use client';

/**
 * EvTaskBoard - Timeline Preset
 * Gantt-style timeline view with rows=tasks, columns=time blocks.
 * Task bars colored by department. Dependency arrows shown as text indicators.
 * Critical path highlighted. Today marker line.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
} from '../../../helpers';
import type { TaskBoardProps, OperationalTask } from '../../core';

const MOCK_TASKS: OperationalTask[] = [
  {
    id: 'task1',
    title: 'Setup main stage sound system',
    department: 'Audio',
    assignee: 'Carlos M.',
    status: 'in-progress',
    priority: 'urgent',
    dueDate: new Date('2026-02-10T14:00:00'),
  },
  {
    id: 'task2',
    title: 'Coordinate security deployment',
    department: 'Security',
    assignee: 'Ana R.',
    status: 'in-progress',
    priority: 'high',
    dueDate: new Date('2026-02-10T12:00:00'),
  },
  {
    id: 'task3',
    title: 'Stock bar inventory',
    department: 'Bar',
    assignee: 'Diego P.',
    status: 'today',
    priority: 'medium',
    dueDate: new Date('2026-02-10T10:00:00'),
  },
  {
    id: 'task4',
    title: 'Inspect stage rigging',
    department: 'Production',
    assignee: 'Pedro K.',
    status: 'in-progress',
    priority: 'urgent',
    dueDate: new Date('2026-02-10T16:00:00'),
    dependencies: ['task1'],
  },
  {
    id: 'task5',
    title: 'Test emergency lighting',
    department: 'Safety',
    assignee: 'Laura S.',
    status: 'review',
    priority: 'high',
    dueDate: new Date('2026-02-11T09:00:00'),
  },
  {
    id: 'task6',
    title: 'Brief medical staff',
    department: 'Medical',
    status: 'backlog',
    priority: 'high',
    dueDate: new Date('2026-02-11T13:00:00'),
  },
  {
    id: 'task7',
    title: 'Configure parking signage',
    department: 'Transport',
    assignee: 'Roberto G.',
    status: 'in-progress',
    priority: 'medium',
    dueDate: new Date('2026-02-11T11:00:00'),
  },
  {
    id: 'task8',
    title: 'Prepare VIP lounge',
    department: 'Hospitality',
    status: 'today',
    priority: 'medium',
    dueDate: new Date('2026-02-11T15:00:00'),
  },
];

const DEPT_COLORS: Record<string, string> = {
  Audio: '#6366f1',
  Security: '#ef4444',
  Bar: '#f59e0b',
  Production: '#8b5cf6',
  Safety: '#10b981',
  Medical: '#ec4899',
  Transport: '#06b6d4',
  Hospitality: '#84cc16',
  Tech: '#3b82f6',
  Operations: '#64748b',
};

const TIME_BLOCKS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
];

export const TimelineEvTaskBoard = createPreset<TaskBoardProps>({
  name: 'EvTaskBoard.Timeline',
  render: ({ primitives, props, tokens }: PresetContext<TaskBoardProps>) => {
    const { Box, Text } = primitives;
    const { tasks, onTaskClick, className, style } = props;

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);

    const data = tasks?.length ? tasks : MOCK_TASKS;

    const [hoveredTask, setHoveredTask] = useState<string | null>(null);

    const now = new Date();
    const currentHour = now.getHours();

    const getTaskPosition = (task: OperationalTask) => {
      if (!task.dueDate) return null;
      const hour = task.dueDate.getHours();
      const idx = TIME_BLOCKS.findIndex((block) => parseInt(block.split(':')[0]) === hour);
      if (idx === -1) return null;
      // Task spans 2 hours by default
      return { start: idx, span: 2 };
    };

    const criticalPath = useMemo(() => {
      // Simple critical path: tasks with dependencies or urgent priority
      return data.filter((t) => t.dependencies?.length || t.priority === 'urgent').map((t) => t.id);
    }, [data]);

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
              {'📅'} Task Timeline
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {data.length} tasks scheduled
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: tokens.borderRadius.sm,
                backgroundColor: tokens.colors.errorScale[500],
              }}
            />
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
              Critical Path
            </Text>
          </div>
        </div>

        {/* Timeline Grid */}
        <div style={{ ...cardBase, padding: tokens.spacing[4], overflow: 'auto' }}>
          <div style={{ minWidth: 1000 }}>
            {/* Time Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '200px repeat(10, 1fr)',
                gap: tokens.spacing[0],
                marginBottom: tokens.spacing[3],
                position: 'sticky',
                top: 0,
                backgroundColor: tokens.colors.common.white,
                zIndex: 10,
                paddingBottom: tokens.spacing[2],
                borderBottom: `2px solid ${tokens.colors.neutral[200]}`,
              }}
            >
              <div />
              {TIME_BLOCKS.map((time, idx) => {
                const timeHour = parseInt(time.split(':')[0]);
                const isNow = timeHour === currentHour;
                return (
                  <div
                    key={time}
                    style={{
                      textAlign: 'center' as const,
                      position: 'relative' as const,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: isNow ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                      }}
                    >
                      {time}
                    </Text>
                    {isNow && (
                      <div
                        style={{
                          position: 'absolute' as const,
                          top: 24,
                          left: '50%',
                          width: 2,
                          height: 400,
                          backgroundColor: tokens.colors.primaryScale[500],
                          transform: 'translateX(-50%)',
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Task Rows */}
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
              {data.map((task) => {
                const position = getTaskPosition(task);
                const isHovered = hoveredTask === task.id;
                const isCritical = criticalPath.includes(task.id);
                const deptColor = DEPT_COLORS[task.department] || tokens.colors.neutral[400];

                return (
                  <div
                    key={task.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '200px repeat(10, 1fr)',
                      gap: tokens.spacing[0],
                      alignItems: 'center',
                      minHeight: 48,
                      position: 'relative' as const,
                    }}
                  >
                    {/* Task Info (Left) */}
                    <div
                      style={{
                        padding: tokens.spacing[2],
                        borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[900],
                          display: 'block',
                          marginBottom: tokens.spacing[0],
                        }}
                      >
                        {task.title}
                      </Text>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                        <span style={createBadgeStyle(tokens, 'info')}>{task.department}</span>
                        {task.assignee && (
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                            {task.assignee}
                          </Text>
                        )}
                      </div>
                    </div>

                    {/* Timeline Bar */}
                    <div
                      style={{
                        gridColumn: '2 / -1',
                        position: 'relative' as const,
                        height: 48,
                      }}
                    >
                      {position && (
                        <div
                          onMouseEnter={() => setHoveredTask(task.id)}
                          onMouseLeave={() => setHoveredTask(null)}
                          onClick={() => onTaskClick?.(task.id)}
                          style={{
                            position: 'absolute' as const,
                            left: `${(position.start / TIME_BLOCKS.length) * 100}%`,
                            width: `${(position.span / TIME_BLOCKS.length) * 100}%`,
                            height: 32,
                            top: 8,
                            backgroundColor: deptColor,
                            borderRadius: tokens.borderRadius.md,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: `all ${tokens.motion.hover}`,
                            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                            boxShadow: isHovered ? tokens.shadows.md : tokens.shadows.sm,
                            border: isCritical ? `3px solid ${tokens.colors.errorScale[500]}` : 'none',
                            zIndex: isHovered ? 5 : 1,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.common.white,
                            }}
                          >
                            {task.dueDate?.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </div>
                      )}

                      {/* Dependency Indicator */}
                      {task.dependencies && task.dependencies.length > 0 && (
                        <div
                          style={{
                            position: 'absolute' as const,
                            left: position ? `${(position.start / TIME_BLOCKS.length) * 100 - 5}%` : '0%',
                            top: 12,
                            fontSize: tokens.typography.fontSize.sm,
                          }}
                        >
                          {'⬅️'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div
          style={{
            ...cardBase,
            padding: tokens.spacing[3],
            marginTop: tokens.spacing[3],
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[600],
              display: 'block',
              marginBottom: tokens.spacing[2],
            }}
          >
            Departments
          </Text>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[2] }}>
            {Object.entries(DEPT_COLORS).map(([dept, color]) => (
              <div key={dept} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: tokens.borderRadius.sm,
                    backgroundColor: color,
                  }}
                />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                  {dept}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </Box>
    );
  },
});
