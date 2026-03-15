'use client';

/**
 * WorkflowOverview - Canvas Preset
 * Interactive node graph with SVG connections, drag-to-move, connection creation, pan/zoom
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { WorkflowOverviewProps, WorkflowNode } from '../../core';
import { getNodeStatusColors, getNodeTypeColors, calculateConnectionPath } from '../../core';
import {
  createCardStyle,
  createEmptyStateStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
} from '../../../helpers';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;

export const CanvasWorkflowOverview = createPreset<WorkflowOverviewProps>({
  name: 'WorkflowOverview.Canvas',
  render: ({ primitives, props, tokens, engine }: PresetContext<WorkflowOverviewProps>) => {
    const { Box } = primitives;
    const statusColors = getNodeStatusColors(tokens);
    const typeColors = getNodeTypeColors(tokens);

    const {
      nodes,
      connections,
      tabs: rawTabs = [],
      activeTab,
      onTabChange,
      onNodeClick,
      onNodeAction,
      onAddNode,
      title = 'Workflow',
      zoomLevel: zoomLevelProp,
      onZoomChange,
      loading,
      className,
      style,
      onNodeMove,
      onConnectionCreate,
      onConnectionDelete,
      onNodeDelete,
      onNodeEdit,
      selectedNodeId: selectedNodeIdProp,
      onNodeSelect,
      pannable = true,
      gridSnap = 0,
    } = props;

    const tabs = Array.isArray(rawTabs) ? rawTabs : [];

    // Zoom
    const [internalZoom, setInternalZoom] = useState(zoomLevelProp ?? 100);
    const zoomLevel = zoomLevelProp ?? internalZoom;

    const handleZoom = (delta: number) => {
      const newZoom = Math.max(25, Math.min(200, zoomLevel + delta));
      setInternalZoom(newZoom);
      onZoomChange?.(newZoom);
    };

    // Selection
    const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
    const selectedNodeId = selectedNodeIdProp ?? internalSelectedId;
    const selectNode = (id: string | null) => {
      setInternalSelectedId(id);
      onNodeSelect?.(id);
    };

    // Node dragging
    const [dragState, setDragState] = useState<{
      nodeId: string;
      startX: number;
      startY: number;
      nodeStartX: number;
      nodeStartY: number;
    } | null>(null);
    const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    // Connection creation
    const [connectionDrag, setConnectionDrag] = useState<{
      sourceNodeId: string;
      mouseX: number;
      mouseY: number;
    } | null>(null);

    // Pan
    const [panState, setPanState] = useState<{
      startX: number;
      startY: number;
      scrollStartX: number;
      scrollStartY: number;
    } | null>(null);

    // Inline editing
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    const canvasRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const snapToGrid = useCallback((val: number) => {
      if (gridSnap <= 0) return val;
      return Math.round(val / gridSnap) * gridSnap;
    }, [gridSnap]);

    // Get current node position (accounting for drag)
    const getNodePosition = useCallback((node: WorkflowNode) => {
      const baseX = node.position?.x ?? 0;
      const baseY = node.position?.y ?? 0;
      if (dragState && dragState.nodeId === node.id) {
        return {
          x: snapToGrid(baseX + dragOffset.x),
          y: snapToGrid(baseY + dragOffset.y),
        };
      }
      return { x: baseX, y: baseY };
    }, [dragState, dragOffset, snapToGrid]);

    // Mouse move handler for dragging / panning / connection
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
      const scale = zoomLevel / 100;

      if (dragState) {
        const dx = (e.clientX - dragState.startX) / scale;
        const dy = (e.clientY - dragState.startY) / scale;
        setDragOffset({ x: dx, y: dy });
      }

      if (connectionDrag && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const scrollEl = containerRef.current;
        const scrollX = scrollEl?.scrollLeft ?? 0;
        const scrollY = scrollEl?.scrollTop ?? 0;
        setConnectionDrag(prev => prev ? {
          ...prev,
          mouseX: (e.clientX - rect.left + scrollX) / scale,
          mouseY: (e.clientY - rect.top + scrollY) / scale,
        } : null);
      }

      if (panState && containerRef.current) {
        containerRef.current.scrollLeft = panState.scrollStartX - (e.clientX - panState.startX);
        containerRef.current.scrollTop = panState.scrollStartY - (e.clientY - panState.startY);
      }
    }, [dragState, connectionDrag, panState, zoomLevel]);

    // Mouse up handler
    const handleMouseUp = useCallback(() => {
      if (dragState) {
        const node = nodes.find(n => n.id === dragState.nodeId);
        if (node && (dragOffset.x !== 0 || dragOffset.y !== 0)) {
          const baseX = node.position?.x ?? 0;
          const baseY = node.position?.y ?? 0;
          onNodeMove?.(dragState.nodeId, {
            x: snapToGrid(baseX + dragOffset.x),
            y: snapToGrid(baseY + dragOffset.y),
          });
        }
        setDragState(null);
        setDragOffset({ x: 0, y: 0 });
      }

      if (connectionDrag) {
        // Check if mouse is over a target node
        const scale = zoomLevel / 100;
        for (const node of nodes) {
          if (node.id === connectionDrag.sourceNodeId) continue;
          const pos = node.position ?? { x: 0, y: 0 };
          if (
            connectionDrag.mouseX >= pos.x &&
            connectionDrag.mouseX <= pos.x + NODE_WIDTH &&
            connectionDrag.mouseY >= pos.y &&
            connectionDrag.mouseY <= pos.y + NODE_HEIGHT
          ) {
            onConnectionCreate?.(connectionDrag.sourceNodeId, node.id);
            break;
          }
        }
        setConnectionDrag(null);
      }

      if (panState) {
        setPanState(null);
      }
    }, [dragState, dragOffset, connectionDrag, panState, nodes, zoomLevel, onNodeMove, onConnectionCreate, snapToGrid]);

    // Keyboard handler for delete and escape
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (editingNodeId) {
          if (e.key === 'Escape') {
            setEditingNodeId(null);
          }
          return;
        }
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (selectedNodeId) {
            onNodeDelete?.(selectedNodeId);
            selectNode(null);
          }
        }
        if (e.key === 'Escape') {
          selectNode(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedNodeId, editingNodeId, onNodeDelete]);

    // Scroll-to-zoom
    const handleWheel = useCallback((e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -5 : 5;
        handleZoom(delta);
      }
    }, [zoomLevel]);

    // Canvas background click to deselect
    const handleCanvasClick = (e: React.MouseEvent) => {
      if (e.target === canvasRef.current) {
        selectNode(null);
      }
    };

    // Canvas background mousedown for panning
    const handleCanvasMouseDown = (e: React.MouseEvent) => {
      if (!pannable) return;
      if (e.target !== canvasRef.current) return;
      // Pan with Cmd+left-click or middle-click
      const shouldPan = (e.button === 0 && e.metaKey) || e.button === 1;
      if (shouldPan) {
        setPanState({
          startX: e.clientX,
          startY: e.clientY,
          scrollStartX: containerRef.current?.scrollLeft ?? 0,
          scrollStartY: containerRef.current?.scrollTop ?? 0,
        });
        e.preventDefault();
      }
    };

    // Node mousedown to start drag
    const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
      if (e.button !== 0) return;
      if (editingNodeId === nodeId) return;
      e.stopPropagation();
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      selectNode(nodeId);
      setDragState({
        nodeId,
        startX: e.clientX,
        startY: e.clientY,
        nodeStartX: node.position?.x ?? 0,
        nodeStartY: node.position?.y ?? 0,
      });
    };

    // Port mousedown to start connection creation
    const handlePortMouseDown = (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation();
      e.preventDefault();
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      const pos = node.position ?? { x: 0, y: 0 };
      setConnectionDrag({
        sourceNodeId: nodeId,
        mouseX: pos.x + NODE_WIDTH,
        mouseY: pos.y + NODE_HEIGHT / 2,
      });
    };

    // Double click to edit node label
    const handleNodeDoubleClick = (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation();
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

    // Calculate canvas bounds
    const maxX = Math.max(...nodes.map(n => (n.position?.x ?? 0) + NODE_WIDTH + 100), 800);
    const maxY = Math.max(...nodes.map(n => (n.position?.y ?? 0) + NODE_HEIGHT + 100), 500);

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.neutral[50], ...style }}>
        {/* Header */}
        <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              + Add node
            </button>
          </div>
        </div>

        {/* Canvas area */}
        <div
          ref={containerRef}
          style={{ flex: 1, overflow: 'auto', position: 'relative', cursor: panState ? 'grabbing' : undefined }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>Loading...</div>
          ) : (
            <div
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseDown={handleCanvasMouseDown}
              style={{
                width: maxX * (zoomLevel / 100),
                height: maxY * (zoomLevel / 100),
                position: 'relative',
                backgroundImage: gridSnap > 0
                  ? `radial-gradient(circle, ${tokens.colors.neutral[300]} 1px, transparent 1px)`
                  : undefined,
                backgroundSize: gridSnap > 0 ? `${gridSnap * (zoomLevel / 100)}px ${gridSnap * (zoomLevel / 100)}px` : undefined,
              }}
            >
              {/* Content scaled container */}
              <div style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top left',
                width: maxX,
                height: maxY,
                position: 'absolute',
                top: 0,
                left: 0,
              }}>
                {/* SVG layer for connections */}
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
                  {connections.map((conn) => {
                    const sourceNode = nodes.find(n => n.id === conn.sourceNodeId);
                    const targetNode = nodes.find(n => n.id === conn.targetNodeId);
                    if (!sourceNode || !targetNode) return null;
                    const sourcePos = getNodePosition(sourceNode);
                    const targetPos = getNodePosition(targetNode);
                    const path = calculateConnectionPath(sourcePos, targetPos, NODE_WIDTH, NODE_HEIGHT);

                    return (
                      <g key={conn.id}>
                        {/* Click target (wider invisible line) */}
                        {onConnectionDelete && (
                          <path
                            d={path}
                            fill="none"
                            stroke="transparent"
                            strokeWidth={12}
                            style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                            onClick={(e) => { e.stopPropagation(); onConnectionDelete(conn.id); }}
                          />
                        )}
                        <path
                          d={path}
                          fill="none"
                          stroke={tokens.colors.neutral[300]}
                          strokeWidth={2}
                        />
                        {/* Arrow */}
                        <circle
                          cx={targetPos.x - 4}
                          cy={targetPos.y + NODE_HEIGHT / 2}
                          r={3}
                          fill={tokens.colors.neutral[400]}
                        />
                      </g>
                    );
                  })}

                  {/* In-progress connection */}
                  {connectionDrag && (() => {
                    const sourceNode = nodes.find(n => n.id === connectionDrag.sourceNodeId);
                    if (!sourceNode) return null;
                    const sourcePos = getNodePosition(sourceNode);
                    const startX = sourcePos.x + NODE_WIDTH;
                    const startY = sourcePos.y + NODE_HEIGHT / 2;
                    const midX = (startX + connectionDrag.mouseX) / 2;
                    return (
                      <path
                        d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${connectionDrag.mouseY}, ${connectionDrag.mouseX} ${connectionDrag.mouseY}`}
                        fill="none"
                        stroke={tokens.colors.primaryScale[400]}
                        strokeWidth={2}
                        strokeDasharray="6 3"
                      />
                    );
                  })()}
                </svg>

                {/* Nodes */}
                {nodes.map((node) => {
                  const sColors = statusColors[node.status];
                  const tColors = typeColors[node.type];
                  const pos = getNodePosition(node);
                  const isSelected = selectedNodeId === node.id;
                  const isDragging = dragState?.nodeId === node.id;
                  const isEditing = editingNodeId === node.id;

                  return (
                    <div
                      key={node.id}
                      onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                      onDoubleClick={(e) => handleNodeDoubleClick(e, node.id)}
                      onClick={(e) => { e.stopPropagation(); onNodeClick?.(node.id); }}
                      style={{
                        position: 'absolute',
                        left: pos.x,
                        top: pos.y,
                        width: NODE_WIDTH,
                        minHeight: NODE_HEIGHT,
                        backgroundColor: tokens.colors.common.white,
                        borderRadius: tokens.borderRadius.lg,
                        border: isSelected
                          ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[500]}`
                          : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${sColors.border}`,
                        boxShadow: isDragging ? tokens.shadows.lg : isSelected ? tokens.shadows.md : tokens.shadows.sm,
                        cursor: isDragging ? 'grabbing' : 'grab',
                        overflow: 'visible',
                        zIndex: isDragging ? 100 : isSelected ? 50 : 1,
                        userSelect: 'none',
                        transition: isDragging ? 'none' : `all ${tokens.motion.hover}`,
                      }}
                    >
                      {/* Input port (left) */}
                      <div
                        style={{
                          position: 'absolute',
                          left: -5,
                          top: NODE_HEIGHT / 2 - 5,
                          width: 10,
                          height: 10,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.neutral[300],
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}`,
                          zIndex: 2,
                        }}
                      />

                      {/* Output port (right) - draggable for connection creation */}
                      <div
                        onMouseDown={(e) => handlePortMouseDown(e, node.id)}
                        style={{
                          position: 'absolute',
                          right: -5,
                          top: NODE_HEIGHT / 2 - 5,
                          width: 10,
                          height: 10,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.primaryScale[500],
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}`,
                          cursor: 'crosshair',
                          zIndex: 2,
                        }}
                      />

                      {/* Node header */}
                      <div style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      }}>
                        <div style={{
                          width: tokens.spacing[6], height: tokens.spacing[6],
                          borderRadius: tokens.borderRadius.sm,
                          backgroundColor: tColors.bgColor,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          {node.icon ?? <span style={{ fontSize: tokens.typography.fontSize.xs, color: tColors.icon }}>
                            {node.type === 'source' ? '⬇' : node.type === 'action' ? '⚡' : '⬆'}
                          </span>}
                        </div>
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
                            onMouseDown={(e) => e.stopPropagation()}
                            style={{
                              flex: 1,
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
                          <span style={{
                            fontWeight: tokens.typography.fontWeight.semibold,
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[900],
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            flex: 1,
                          }}>
                            {node.label}
                          </span>
                        )}
                        <span style={{
                          width: tokens.spacing[2], height: tokens.spacing[2],
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: sColors.color, flexShrink: 0,
                        }} />
                      </div>

                      {/* Node body */}
                      <div style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                        {(node.rowCount !== undefined || node.columnCount !== undefined) && (
                          <div style={{
                            display: 'flex', gap: tokens.spacing[3],
                            fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500],
                            marginBottom: node.actions?.length ? tokens.spacing[2] : 0,
                          }}>
                            {node.rowCount !== undefined && <span>{node.rowCount.toLocaleString()} rows</span>}
                            {node.columnCount !== undefined && <span>{node.columnCount} cols</span>}
                          </div>
                        )}
                        {node.description && (
                          <div style={{
                            fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500],
                            marginBottom: node.actions?.length ? tokens.spacing[2] : 0,
                          }}>
                            {node.description}
                          </div>
                        )}
                        {node.actions && node.actions.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                            {node.actions.map((action) => (
                              <div
                                key={action.key}
                                onClick={(e) => { e.stopPropagation(); onNodeAction?.(node.id, action.key); }}
                                onMouseDown={(e) => e.stopPropagation()}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
                                  padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`,
                                  borderRadius: tokens.borderRadius.sm,
                                  fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600],
                                  cursor: 'pointer',
                                  transition: `all ${tokens.motion.hover}`,
                                }}
                              >
                                {action.icon && <span>{action.icon}</span>}
                                {action.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Zoom controls */}
          <div style={{
            position: 'sticky', bottom: tokens.spacing[4], float: 'right', marginRight: tokens.spacing[4],
            display: 'flex', gap: tokens.spacing[1], backgroundColor: tokens.colors.common.white,
            borderRadius: tokens.borderRadius.md, boxShadow: tokens.shadows.md, padding: tokens.spacing[1],
            zIndex: 200,
          }}>
            <button onClick={() => handleZoom(-10)} style={{
              width: tokens.spacing[7], height: tokens.spacing[7], border: 'none',
              borderRadius: tokens.borderRadius.sm, backgroundColor: 'transparent',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: tokens.typography.fontSize.md,
              transition: `all ${tokens.motion.hover}`,
              color: tokens.colors.neutral[600], display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>−</button>
            <span style={{
              display: 'flex', alignItems: 'center', fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500], padding: `0 ${tokens.spacing[1]}px`,
            }}>{zoomLevel}%</span>
            <button onClick={() => handleZoom(10)} style={{
              width: tokens.spacing[7], height: tokens.spacing[7], border: 'none',
              borderRadius: tokens.borderRadius.sm, backgroundColor: 'transparent',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: tokens.typography.fontSize.md,
              transition: `all ${tokens.motion.hover}`,
              color: tokens.colors.neutral[600], display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>+</button>
          </div>
        </div>

        {/* Bottom tabs */}
        {tabs.length > 0 && (
          <div style={{
            padding: `0 ${tokens.spacing[4]}px`, borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white, display: 'flex', gap: tokens.spacing[0],
          }}>
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => onTabChange?.(tab.key)} style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, border: 'none',
                borderTop: tab.key === activeTab ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[500]}` : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} transparent`,
                backgroundColor: 'transparent',
                color: tab.key === activeTab ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500],
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
      </Box>
    );
  },
});
