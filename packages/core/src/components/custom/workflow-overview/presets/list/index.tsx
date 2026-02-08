'use client';

/**
 * WorkflowOverview - List Preset
 * Linear pipeline view with drag-to-reorder steps
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { WorkflowOverviewProps } from '../../core';
import { getNodeStatusColors, getNodeTypeColors } from '../../core';
import {
  createEmptyStateStyle,
  createHoverStyle,
} from '../../../helpers';

export const ListWorkflowOverview = createPreset<WorkflowOverviewProps>({
  name: 'WorkflowOverview.List',
  render: ({ primitives, props, tokens, engine }: PresetContext<WorkflowOverviewProps>) => {
    const { Box, Stack } = primitives;
    const statusColors = getNodeStatusColors(tokens);
    const typeColors = getNodeTypeColors(tokens);

    const {
      nodes,
      tabs = [],
      activeTab,
      onTabChange,
      onNodeClick,
      onNodeAction,
      onAddNode,
      title = 'Workflow',
      loading,
      className,
      style,
      onNodeDelete,
      onNodeEdit,
      onStepReorder,
      selectedNodeId: selectedNodeIdProp,
      onNodeSelect,
    } = props;

    const statusLabels: Record<string, string> = {
      idle: 'Idle',
      running: 'Running',
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
    };

    // Selection
    const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
    const selectedNodeId = selectedNodeIdProp ?? internalSelectedId;
    const selectNode = (id: string | null) => {
      setInternalSelectedId(id);
      onNodeSelect?.(id);
    };

    // Drag reorder state
    const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // Inline editing
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    const handleDragStart = (e: React.DragEvent, nodeId: string) => {
      if (!onStepReorder) return;
      setDraggedNodeId(nodeId);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', nodeId);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverIndex(index);
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      if (draggedNodeId && onStepReorder) {
        onStepReorder(draggedNodeId, targetIndex);
      }
      setDraggedNodeId(null);
      setDragOverIndex(null);
    };

    const handleDragEnd = () => {
      setDraggedNodeId(null);
      setDragOverIndex(null);
    };

    const startEditing = (nodeId: string) => {
      if (!onNodeEdit) return;
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      setEditingNodeId(nodeId);
      setEditValue(node.label);
    };

    const commitEdit = () => {
      if (editingNodeId && editValue.trim()) {
        onNodeEdit?.(editingNodeId, editValue.trim());
      }
      setEditingNodeId(null);
    };

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.common.white, ...style }}>
        {/* Header */}
        <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            {selectedNodeId && onNodeDelete && (
              <button onClick={() => { onNodeDelete(selectedNodeId); selectNode(null); }} style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                backgroundColor: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700],
                fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: `all ${tokens.motion.hover}`,
              }}>
                Delete
              </button>
            )}
            <button onClick={onAddNode} style={{
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md, border: 'none',
              backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white,
              fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: `all ${tokens.motion.hover}`,
            }}>
              + Add step
            </button>
          </div>
        </div>

        {/* Tabs */}
        {tabs.length > 0 && (
          <div style={{ padding: `0 ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, display: 'flex', gap: tokens.spacing[0] }}>
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => onTabChange?.(tab.key)} style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, border: 'none',
                borderBottom: tab.key === activeTab ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[900]}` : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} transparent`,
                backgroundColor: 'transparent',
                color: tab.key === activeTab ? tokens.colors.neutral[900] : tokens.colors.neutral[500],
                fontWeight: tab.key === activeTab ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit',
                transition: `all ${tokens.motion.hover}`,
              }}>
                {tab.icon && <span style={{ marginRight: tokens.spacing[1] }}>{tab.icon}</span>}
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Pipeline list */}
        <div style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[4] }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>Loading...</div>
          ) : (
            <Stack direction="vertical" spacing="none">
              {nodes.map((node, index) => {
                const sColors = statusColors[node.status];
                const tColors = typeColors[node.type];
                const isLast = index === nodes.length - 1;
                const isSelected = selectedNodeId === node.id;
                const isDraggedOver = dragOverIndex === index;
                const isDragging = draggedNodeId === node.id;
                const isEditing = editingNodeId === node.id;

                return (
                  <div
                    key={node.id}
                    draggable={!!onStepReorder}
                    onDragStart={(e) => handleDragStart(e, node.id)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    style={{
                      display: 'flex', gap: tokens.spacing[3],
                      opacity: isDragging ? 0.4 : 1,
                      borderTop: isDraggedOver && draggedNodeId !== node.id
                        ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[500]}`
                        : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} transparent`,
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    {/* Timeline connector */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: tokens.spacing[6] }}>
                      <div style={{
                        width: tokens.spacing[3], height: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: sColors.color,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}`,
                        boxShadow: `0 0 0 2px ${sColors.border}`,
                        flexShrink: 0, marginTop: tokens.spacing[3],
                      }} />
                      {!isLast && (
                        <div style={{ flex: 1, width: tokens.spacing[1], backgroundColor: tokens.colors.neutral[200], minHeight: tokens.spacing[5] }} />
                      )}
                    </div>

                    {/* Node card */}
                    <div
                      onClick={() => { selectNode(node.id); onNodeClick?.(node.id); }}
                      onDoubleClick={() => startEditing(node.id)}
                      style={{
                        flex: 1, padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.md,
                        border: isSelected
                          ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[500]}`
                          : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        backgroundColor: tokens.colors.common.white,
                        marginBottom: tokens.spacing[2],
                        cursor: onStepReorder ? 'grab' : 'pointer',
                        boxShadow: isSelected ? tokens.shadows.sm : undefined,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flex: 1, minWidth: 0 }}>
                          {/* Drag handle */}
                          {onStepReorder && (
                            <span style={{
                              fontSize: tokens.typography.fontSize.sm,
                              color: tokens.colors.neutral[400],
                              cursor: 'grab',
                              userSelect: 'none',
                              flexShrink: 0,
                            }}>
                              ⠿
                            </span>
                          )}
                          <div style={{
                            width: tokens.spacing[7], height: tokens.spacing[7],
                            borderRadius: tokens.borderRadius.sm,
                            backgroundColor: tColors.bgColor,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            {node.icon ?? <span style={{ fontSize: tokens.typography.fontSize.xs, color: tColors.icon }}>
                              {node.type === 'source' ? '⬇' : node.type === 'action' ? '⚡' : '⬆'}
                            </span>}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            {isEditing ? (
                              <input
                                autoFocus
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={(e) => {
                                  commitEdit();
                                  e.currentTarget.style.boxShadow = 'none';
                                  e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') commitEdit();
                                  if (e.key === 'Escape') setEditingNodeId(null);
                                  e.stopPropagation();
                                }}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  width: '100%',
                                  fontWeight: tokens.typography.fontWeight.semibold,
                                  fontSize: tokens.typography.fontSize.sm,
                                  color: tokens.colors.neutral[900],
                                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}`,
                                  borderRadius: tokens.borderRadius.sm,
                                  padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`,
                                  outline: 'none',
                                  fontFamily: 'inherit',
                                  background: tokens.colors.common.white,
                                }}
                              
                                onFocus={(e) => {
                                  e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                                  e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                                }}
                              />
                            ) : (
                              <div style={{
                                fontWeight: tokens.typography.fontWeight.semibold,
                                fontSize: tokens.typography.fontSize.sm,
                                color: tokens.colors.neutral[900],
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              }}>
                                {node.label}
                              </div>
                            )}
                            {node.description && (
                              <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
                                {node.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flexShrink: 0 }}>
                          {node.rowCount !== undefined && (
                            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{node.rowCount.toLocaleString()} rows</span>
                          )}
                          {node.columnCount !== undefined && (
                            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{node.columnCount} cols</span>
                          )}
                          <span style={{
                            padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.sm,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: sColors.color, backgroundColor: sColors.bgColor,
                          }}>
                            {statusLabels[node.status] ?? node.status}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      {node.actions && node.actions.length > 0 && (
                        <div style={{ display: 'flex', gap: tokens.spacing[2], marginTop: tokens.spacing[2], paddingTop: tokens.spacing[2], borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                          {node.actions.map((action) => (
                            <button key={action.key} onClick={(e) => { e.stopPropagation(); onNodeAction?.(node.id, action.key); }} style={{
                              padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.sm,
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                              backgroundColor: 'transparent',
                              fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600],
                              cursor: 'pointer', fontFamily: 'inherit',
                              transition: `all ${tokens.motion.hover}`,
                              display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
                            }}>
                              {action.icon && <span>{action.icon}</span>}
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </Stack>
          )}
        </div>
      </Box>
    );
  },
});
