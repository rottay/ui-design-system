'use client';

/**
 * SprintBoard - By Project Preset
 * Notion-style task board grouped by project
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { SprintBoardProps, SprintTask, TaskStatus, TaskPriority } from '../../core';

export const ByProjectSprintBoard = createPreset<SprintBoardProps>({
  name: 'SprintBoard.ByProject',
  render: ({ primitives, props, tokens, engine }: PresetContext<SprintBoardProps>) => {
    const { Box, Stack } = primitives;

    const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bgColor: string; dotColor: string }> = {
      'not-started': { label: 'Not started', color: tokens.colors.neutral[600], bgColor: tokens.colors.neutral[100], dotColor: tokens.colors.neutral[400] },
      'in-progress': { label: 'In progress', color: tokens.colors.infoScale[700], bgColor: tokens.colors.infoScale[50], dotColor: tokens.colors.infoScale[500] },
      'done': { label: 'Done', color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[50], dotColor: tokens.colors.successScale[500] },
      'blocked': { label: 'Blocked', color: tokens.colors.errorScale[700], bgColor: tokens.colors.errorScale[50], dotColor: tokens.colors.errorScale[500] },
      'cancelled': { label: 'Cancelled', color: tokens.colors.neutral[600], bgColor: tokens.colors.neutral[200], dotColor: tokens.colors.neutral[400] },
    };

    const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
      urgent: { label: 'Urgent', color: tokens.colors.errorScale[700], bgColor: tokens.colors.errorScale[50] },
      high: { label: 'High', color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[50] },
      medium: { label: 'Medium', color: tokens.colors.warningScale[800], bgColor: tokens.colors.warningScale[100] },
      low: { label: 'Low', color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[50] },
    };

    const {
      groups,
      tabs = [
        { key: 'by-project', label: 'By project' },
        { key: 'all-tasks', label: 'All tasks' },
        { key: 'backlog', label: 'Backlog' },
        { key: 'mine', label: 'Mine' },
        { key: 'people', label: 'People' },
      ],
      activeTab = 'by-project',
      onTabChange,
      filters = [
        { key: 'status', label: 'Status' },
        { key: 'assignee', label: 'Assignee' },
        { key: 'due', label: 'Due' },
        { key: 'sprint', label: 'Sprint' },
        { key: 'project', label: 'Project' },
      ],
      onFilterChange,
      onAddFilter,
      onTaskClick,
      onNewTask,
      onGroupToggle,
      title = 'Tasks',
      headerActions,
      showCompletionCount = true,
      columns,
      searchable,
      onSearch,
      loading,
      className,
      style,
      onTaskMove,
      draggable: draggableProp,
    } = props;

    const canDrag = draggableProp ?? !!onTaskMove;

    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [draggedTask, setDraggedTask] = useState<{ taskId: string; groupId: string } | null>(null);
    const [dragOverTarget, setDragOverTarget] = useState<{ groupId: string; index: number } | null>(null);

    const toggleGroup = (groupId: string) => {
      const next = new Set(collapsedGroups);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      setCollapsedGroups(next);
      onGroupToggle?.(groupId);
    };

    const defaultColumns = columns ?? [
      { key: 'taskId', label: 'Task ID', icon: 'N°', width: 100 },
      { key: 'name', label: 'Task name', icon: 'Aa', width: undefined },
      { key: 'status', label: 'Status', icon: '◉', width: 140 },
      { key: 'assignee', label: 'Assignee', icon: '👤', width: 140 },
      { key: 'due', label: 'Due', icon: '📅', width: 140 },
      { key: 'priority', label: 'Priority', icon: '◆', width: 100 },
      { key: 'sprint', label: 'Sprint', icon: '⚡', width: 120 },
      { key: 'summary', label: 'Summary', icon: '≡', width: 200 },
    ];

    const getDoneCount = (tasks: SprintTask[]) => tasks.filter(t => t.status === 'done').length;

    const renderStatusBadge = (status: TaskStatus) => {
      const config = STATUS_CONFIG[status];
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.sm, color: config.color, backgroundColor: config.bgColor }}>
          <span style={{ width: tokens.spacing[2], height: tokens.spacing[2], borderRadius: tokens.borderRadius.full, backgroundColor: config.dotColor }} />
          {config.label}
        </span>
      );
    };

    const renderPriorityBadge = (priority?: TaskPriority) => {
      if (!priority) return <span style={{ color: tokens.colors.neutral[400] }}>—</span>;
      const config = PRIORITY_CONFIG[priority];
      return (
        <span style={{ display: 'inline-block', padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.sm, color: config.color, backgroundColor: config.bgColor, fontWeight: tokens.typography.fontWeight.medium }}>
          {config.label}
        </span>
      );
    };

    const renderAssignee = (task: SprintTask) => {
      if (!task.assignee) return <span style={{ color: tokens.colors.neutral[400] }}>—</span>;
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], fontSize: tokens.typography.fontSize.sm }}>
          {task.assignee.avatar ? (
            <img src={task.assignee.avatar} alt="" style={{ width: tokens.spacing[5], height: tokens.spacing[5], borderRadius: tokens.borderRadius.full }} />
          ) : (
            <span style={{ width: tokens.spacing[5], height: tokens.spacing[5], borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[300], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
              {task.assignee.name.charAt(0)}
            </span>
          )}
          {task.assignee.name}
        </span>
      );
    };

    const renderCellValue = (task: SprintTask, colKey: string) => {
      switch (colKey) {
        case 'taskId': return <span style={{ color: tokens.colors.neutral[500], fontSize: tokens.typography.fontSize.sm }}>{task.taskId}</span>;
        case 'name': return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.normal }}>
            <span style={{ color: tokens.colors.neutral[400] }}>📄</span>
            {task.name}
          </span>
        );
        case 'status': return renderStatusBadge(task.status);
        case 'assignee': return renderAssignee(task);
        case 'due': return <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{task.dueDate ?? '—'}</span>;
        case 'priority': return renderPriorityBadge(task.priority);
        case 'sprint': return task.sprint ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
            ⚡ {task.sprint}
          </span>
        ) : <span style={{ color: tokens.colors.neutral[400] }}>—</span>;
        case 'summary': return <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180, display: 'inline-block' }}>{task.summary ?? ''}</span>;
        default: return null;
      }
    };

    return (
      <Box className={className} style={{
        boxShadow: tokens.shadows.md, display: 'flex', height: '100%', backgroundColor: tokens.colors.common.white, ...style }}>
        {/* Left Sidebar */}
        <Box style={{ width: 240, borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, display: 'flex', flexDirection: 'column', backgroundColor: tokens.colors.neutral[50], flexShrink: 0 }}>
          <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], fontWeight: tokens.typography.fontWeight.semibold, fontSize: tokens.typography.fontSize.sm }}>
              <span style={{ width: tokens.spacing[5], height: tokens.spacing[5], borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.neutral[800], color: tokens.colors.common.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs }}>M</span>
              Mobbin Team
              <span style={{ marginLeft: 'auto', color: tokens.colors.neutral[400], cursor: 'pointer' }}>⌄</span>
            </div>
          </Box>
          <Box style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px` }}>
            <Stack direction="vertical" spacing="none">
              {['Search', 'Updates', 'New page'].map((item) => (
                <div key={item} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], cursor: 'pointer' }}>
                  {item}
                </div>
              ))}
            </Stack>
          </Box>
          <Box style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px` }}>
            <div style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[400], textTransform: 'uppercase', padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px ${tokens.spacing[1]}px`, letterSpacing: '0.5px' }}>Teamspaces</div>
            <Stack direction="vertical" spacing="none">
              {[
                { label: 'Mobbin Team HQ', indent: 0, bold: true },
                { label: 'Tasks', indent: 1, active: true },
                { label: 'Projects', indent: 1 },
                { label: 'Sprint board', indent: 1 },
                { label: 'Sprints', indent: 1 },
                { label: 'Wiki', indent: 1 },
                { label: 'Meetings', indent: 1 },
                { label: 'Docs', indent: 1 },
              ].map((item) => (
                <div key={item.label} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, paddingLeft: `${10 + item.indent * 16}px`, borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.sm, color: item.active ? tokens.colors.neutral[900] : tokens.colors.neutral[600], backgroundColor: item.active ? tokens.colors.neutral[200] : 'transparent', fontWeight: item.bold || item.active ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal, cursor: 'pointer' }}>
                  {item.indent > 0 && <span style={{ marginRight: tokens.spacing[1] }}>{'>'}</span>}
                  {item.label}
                </div>
              ))}
            </Stack>
          </Box>
          <Box style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, marginTop: 'auto' }}>
            <div style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[400], textTransform: 'uppercase', padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px ${tokens.spacing[1]}px`, letterSpacing: '0.5px' }}>Private</div>
            <Stack direction="vertical" spacing="none">
              {['Getting Started', 'Settings', 'Calendar', 'Templates', 'Import', 'Trash'].map((item) => (
                <div key={item} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], cursor: 'pointer' }}>
                  {item}
                </div>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* Main Content */}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[6]}px ${tokens.spacing[0]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[2] }}>
              <span>🏠 Mobbin Team HQ</span>
              <span style={{ margin: `${tokens.spacing[0]}px ${tokens.spacing[1]}px` }}>/</span>
              <span>☑️ Tasks</span>
            </div>
            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
              <h1 style={{ fontSize: tokens.typography.fontSize['3xl'], fontWeight: tokens.typography.fontWeight.bold, margin: 0, display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <span>☑️</span> {title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                {headerActions}
                <button style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  New <span style={{ fontSize: tokens.typography.fontSize.xs }}>▼</span>
                </button>
              </div>
            </div>
            {/* Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[0], borderBottom: 'none' }}>
              {tabs.map((tab) => (
                <button key={tab.key} onClick={() => onTabChange?.(tab.key)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, border: 'none', borderBottom: tab.key === activeTab ? `2px solid ${tokens.colors.neutral[900]}` : '2px solid transparent', backgroundColor: 'transparent', fontSize: tokens.typography.fontSize.sm, fontWeight: tab.key === activeTab ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal, color: tab.key === activeTab ? tokens.colors.neutral[900] : tokens.colors.neutral[500], cursor: 'pointer' }}>
                  {tab.icon && <span style={{ marginRight: tokens.spacing[1] }}>{tab.icon}</span>}
                  {tab.label}
                </button>
              ))}
              <button style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`, border: 'none', backgroundColor: 'transparent', color: tokens.colors.neutral[400], cursor: 'pointer', fontSize: tokens.typography.fontSize.md }}>+</button>
            </div>
          </Box>

          {/* Filter bar */}
          <Box style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[6]}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], flexWrap: 'wrap' }}>
              {filters.map((filter) => (
                <button key={filter.key} onClick={() => onFilterChange?.(filter.key, filter.value ?? '')} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], cursor: 'pointer', display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  {filter.icon && <span>{filter.icon}</span>}
                  {filter.label}
                  <span style={{ fontSize: tokens.typography.fontSize.xs, marginLeft: tokens.spacing[0] }}>▼</span>
                </button>
              ))}
              <button onClick={onAddFilter} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, border: 'none', backgroundColor: 'transparent', fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400], cursor: 'pointer' }}>
                + Add filter
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], cursor: 'pointer' }}>Filter</span>
              <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], cursor: 'pointer' }}>Sort</span>
              {searchable && (
                <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], cursor: 'pointer' }}>🔍</span>
              )}
              <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], cursor: 'pointer' }}>⋯</span>
            </div>
          </Box>

          {/* Table content */}
          <Box style={{ flex: 1, overflow: 'auto', padding: `${tokens.spacing[0]}px ${tokens.spacing[6]}px ${tokens.spacing[6]}px` }}>
            {loading ? (
              <Box style={{ padding: tokens.spacing[8], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
            ) : (
              <Stack direction="vertical" spacing="md">
                {groups.map((group) => {
                  const isCollapsed = collapsedGroups.has(group.id) || group.collapsed;
                  const doneCount = getDoneCount(group.tasks);

                  return (
                    <Box key={group.id} style={{ marginTop: tokens.spacing[4] }}>
                      {/* Group header */}
                      <div onClick={() => toggleGroup(group.id)} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px ${tokens.spacing[0]}px`, cursor: 'pointer', userSelect: 'none' }}>
                        <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: `all ${tokens.motion.hover}`, display: 'inline-block' }}>▼</span>
                        {group.icon && <span>{group.icon}</span>}
                        <span style={{ fontWeight: tokens.typography.fontWeight.semibold, fontSize: tokens.typography.fontSize.md }}>{group.name}</span>
                        <span style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>{group.tasks.length}</span>
                        <span style={{ marginLeft: tokens.spacing[1], color: tokens.colors.neutral[400], cursor: 'pointer', fontSize: tokens.typography.fontSize.sm }}>⋯</span>
                        <span style={{ color: tokens.colors.neutral[400], cursor: 'pointer', fontSize: tokens.typography.fontSize.sm }}>+</span>
                      </div>

                      {!isCollapsed && (
                        <>
                          {/* Column headers */}
                          <div style={{ display: 'grid', gridTemplateColumns: defaultColumns.map(c => c.width ? `${c.width}px` : '1fr').join(' '), borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, padding: `${tokens.spacing[1]}px ${tokens.spacing[0]}px` }}>
                            {defaultColumns.map((col) => (
                              <div key={col.key} style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium, display: 'flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px` }}>
                                {col.icon && <span style={{ fontSize: tokens.typography.fontSize.xs }}>{col.icon}</span>}
                                {col.label}
                              </div>
                            ))}
                          </div>

                          {/* Task rows */}
                          {group.tasks.map((task, taskIndex) => {
                            const isDragging = draggedTask?.taskId === task.id;
                            const isDragOver = dragOverTarget?.groupId === group.id && dragOverTarget?.index === taskIndex && draggedTask?.taskId !== task.id;
                            return (
                            <div
                              key={task.id}
                              draggable={canDrag}
                              onDragStart={(e) => {
                                setDraggedTask({ taskId: task.id, groupId: group.id });
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('text/plain', task.id);
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'move';
                                setDragOverTarget({ groupId: group.id, index: taskIndex });
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (draggedTask && onTaskMove) {
                                  onTaskMove(draggedTask.taskId, draggedTask.groupId, group.id, taskIndex);
                                }
                                setDraggedTask(null);
                                setDragOverTarget(null);
                              }}
                              onDragEnd={() => { setDraggedTask(null); setDragOverTarget(null); }}
                              onClick={() => onTaskClick?.(task)}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: defaultColumns.map(c => c.width ? `${c.width}px` : '1fr').join(' '),
                                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                                borderTop: isDragOver ? `2px solid ${tokens.colors.primaryScale[500]}` : '2px solid transparent',
                                padding: `${tokens.spacing[2]}px ${tokens.spacing[0]}px`,
                                cursor: canDrag ? 'grab' : 'pointer',
                                alignItems: 'center',
                                opacity: isDragging ? 0.4 : 1,
                                transition: `all ${tokens.motion.hover}`,
                              }}
                              onMouseEnter={(e) => { if (!isDragging) (e.currentTarget as HTMLDivElement).style.backgroundColor = tokens.colors.neutral[50]; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; }}
                            >
                              {defaultColumns.map((col) => (
                                <div key={col.key} style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {renderCellValue(task, col.key)}
                                </div>
                              ))}
                            </div>
                            );
                          })}

                          {/* Drop zone at end of group */}
                          {canDrag && draggedTask && draggedTask.groupId !== group.id && (
                            <div
                              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverTarget({ groupId: group.id, index: group.tasks.length }); }}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (draggedTask && onTaskMove) {
                                  onTaskMove(draggedTask.taskId, draggedTask.groupId, group.id, group.tasks.length);
                                }
                                setDraggedTask(null);
                                setDragOverTarget(null);
                              }}
                              style={{
                                padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                                borderTop: dragOverTarget?.groupId === group.id && dragOverTarget?.index === group.tasks.length
                                  ? `2px solid ${tokens.colors.primaryScale[500]}`
                                  : '2px solid transparent',
                                color: tokens.colors.primaryScale[400],
                                fontSize: tokens.typography.fontSize.xs,
                                textAlign: 'center',
                                transition: `all ${tokens.motion.hover}`,
                              }}
                            >
                              Drop here
                            </div>
                          )}

                          {/* New task row */}
                          <div onClick={() => onNewTask?.(group.id)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }} onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.color = tokens.colors.neutral[600]; }} onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.color = tokens.colors.neutral[400]; }}>
                            + New
                          </div>

                          {/* Completion count */}
                          {showCompletionCount && (
                            <div style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[0]}px`, textAlign: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[400], textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              COMPLETE {doneCount}/{group.tasks.length}
                            </div>
                          )}
                        </>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>
        </Box>
      </Box>
    );
  },
});
