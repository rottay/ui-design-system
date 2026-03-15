'use client';

/**
 * DependencyGraph - Canvas Preset
 * Interactive node graph with SVG connections, node dragging, connection creation, pan/zoom
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { DependencyGraphProps, DependencyNode } from '../../core';
import {
  getNodeStatusColors,
  getNodeStatusLabel,
  getLinkColors,
  formatLinkLabel,
  calculateConnectionPath,
  calculateArrowHead,
  calculateLinkLabelPosition,
  calculateCanvasBounds,
} from '../../core';
import {
  createCardStyle,
  createEmptyStateStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
} from '../../../helpers';

const NODE_WIDTH = 280;
const NODE_HEIGHT = 100;

export const CanvasDependencyGraph = createPreset<DependencyGraphProps>({
  name: 'DependencyGraph.Canvas',
  render: ({ primitives, props, tokens, engine }: PresetContext<DependencyGraphProps>) => {
    const { Box } = primitives;
    const statusColors = getNodeStatusColors(tokens);
    const linkColors = getLinkColors(tokens);

    const {
      nodes,
      links,
      breadcrumbs: rawBreadcrumbs = [],
      filters: rawFilters = [],
      onFilterChange,
      selectedNodeId: selectedNodeIdProp,
      onNodeSelect,
      onNodeClick,
      onNodeAction,
      onLinkClick,
      onAddDependency,
      zoomLevel: zoomLevelProp,
      onZoomChange,
      onZoomFit,
      onZoomReset,
      hasUnsavedChanges = false,
      onSave,
      title = 'Dependencies',
      loading,
      className,
      style,
      onNodeMove,
      onLinkCreate,
      onLinkDelete,
      onNodeDelete,
      pannable = true,
      gridSnap = 0,
    } = props;

    const breadcrumbs = Array.isArray(rawBreadcrumbs) ? rawBreadcrumbs : [];
    const filters = Array.isArray(rawFilters) ? rawFilters : [];

    // Zoom
    const [internalZoom, setInternalZoom] = useState(zoomLevelProp ?? 100);
    const zoomLevel = zoomLevelProp ?? internalZoom;

    const handleZoom = (delta: number) => {
      const newZoom = Math.max(25, Math.min(200, zoomLevel + delta));
      setInternalZoom(newZoom);
      onZoomChange?.(newZoom);
    };

    // Selection
    const [internalSelectedNodeId, setInternalSelectedNodeId] = useState<string | null>(selectedNodeIdProp ?? null);
    const selectedNodeId = selectedNodeIdProp ?? internalSelectedNodeId;
    const selectNode = (id: string | null) => {
      setInternalSelectedNodeId(id);
      onNodeSelect?.(id);
    };

    // Action menu
    const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);

    // Node dragging
    const [dragState, setDragState] = useState<{
      nodeId: string;
      startX: number;
      startY: number;
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

    const canvasRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const snapToGrid = useCallback((val: number) => {
      if (gridSnap <= 0) return val;
      return Math.round(val / gridSnap) * gridSnap;
    }, [gridSnap]);

    const getNodePosition = useCallback((node: DependencyNode) => {
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

    // Mouse move
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

    // Mouse up
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
        for (const node of nodes) {
          if (node.id === connectionDrag.sourceNodeId) continue;
          const pos = node.position ?? { x: 0, y: 0 };
          if (
            connectionDrag.mouseX >= pos.x &&
            connectionDrag.mouseX <= pos.x + NODE_WIDTH &&
            connectionDrag.mouseY >= pos.y &&
            connectionDrag.mouseY <= pos.y + NODE_HEIGHT
          ) {
            onLinkCreate?.(connectionDrag.sourceNodeId, node.id);
            break;
          }
        }
        setConnectionDrag(null);
      }

      if (panState) {
        setPanState(null);
      }
    }, [dragState, dragOffset, connectionDrag, panState, nodes, onNodeMove, onLinkCreate, snapToGrid]);

    // Keyboard
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (selectedNodeId && onNodeDelete) {
            onNodeDelete(selectedNodeId);
            selectNode(null);
          }
        }
        if (e.key === 'Escape') {
          selectNode(null);
          setActiveActionMenu(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedNodeId, onNodeDelete]);

    // Scroll-to-zoom
    const handleWheel = useCallback((e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        handleZoom(e.deltaY > 0 ? -5 : 5);
      }
    }, [zoomLevel]);

    const handleCanvasClick = (e: React.MouseEvent) => {
      if (e.target === canvasRef.current) {
        selectNode(null);
        setActiveActionMenu(null);
      }
    };

    const handleCanvasMouseDown = (e: React.MouseEvent) => {
      if (!pannable) return;
      if (e.target !== canvasRef.current) return;
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

    const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      selectNode(nodeId);
      setActiveActionMenu(null);
      if (onNodeMove) {
        setDragState({
          nodeId,
          startX: e.clientX,
          startY: e.clientY,
        });
      }
    };

    const handlePortMouseDown = (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation();
      e.preventDefault();
      if (!onLinkCreate) return;
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      const pos = node.position ?? { x: 0, y: 0 };
      setConnectionDrag({
        sourceNodeId: nodeId,
        mouseX: pos.x + NODE_WIDTH,
        mouseY: pos.y + NODE_HEIGHT / 2,
      });
    };

    const bounds = calculateCanvasBounds(nodes, NODE_WIDTH, NODE_HEIGHT, 100);

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.neutral[50], ...style }}>
        {/* Header */}
        <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white }}>
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], marginBottom: tokens.spacing[2], fontSize: tokens.typography.fontSize.sm }}>
              {breadcrumbs.map((crumb, idx) => (
                <span key={crumb.key}>
                  {idx > 0 && <span style={{ color: tokens.colors.neutral[400], margin: `0 ${tokens.spacing[1]}px` }}>/</span>}
                  <span
                    onClick={crumb.onClick}
                    style={{
                      color: idx === breadcrumbs.length - 1 ? tokens.colors.neutral[900] : tokens.colors.primaryScale[600],
                      cursor: crumb.onClick ? 'pointer' : 'default',
                      fontWeight: idx === breadcrumbs.length - 1 ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                    }}
                  >
                    {crumb.label}
                  </span>
                </span>
              ))}
            </div>
          )}

          {/* Actions row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{title}</h2>
              {hasUnsavedChanges && (
                <span style={{
                  display: 'inline-block',
                  padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.sm,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.warningScale[700],
                  backgroundColor: tokens.colors.warningScale[50],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
                }}>
                  Unsaved changes
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              {filters.map((filter) => (
                <select
                  key={filter.key}
                  value={filter.value ?? ''}
                  onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    backgroundColor: tokens.colors.common.white,
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[700],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    fontFamily: 'inherit',
                  }}
                >
                  <option value="">{filter.label}</option>
                  {filter.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ))}

              {selectedNodeId && onNodeDelete && (
                <button
                  onClick={() => { onNodeDelete(selectedNodeId); selectNode(null); }}
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                    backgroundColor: tokens.colors.errorScale[50],
                    color: tokens.colors.errorScale[700],
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    fontFamily: 'inherit',
                  }}
                >
                  Delete
                </button>
              )}

              {hasUnsavedChanges && onSave && (
                <button
                  onClick={onSave}
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[500]}`,
                    backgroundColor: tokens.colors.common.white,
                    color: tokens.colors.primaryScale[600],
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    fontFamily: 'inherit',
                  }}
                >
                  Save
                </button>
              )}

              <button
                onClick={onAddDependency}
                style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: 'none',
                  backgroundColor: tokens.colors.primaryScale[500],
                  color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  fontFamily: 'inherit',
                }}
              >
                + Add dependency
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
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
                width: bounds.width * (zoomLevel / 100),
                height: bounds.height * (zoomLevel / 100),
                position: 'relative',
                backgroundImage: gridSnap > 0
                  ? `radial-gradient(circle, ${tokens.colors.neutral[300]} 1px, transparent 1px)`
                  : undefined,
                backgroundSize: gridSnap > 0 ? `${gridSnap * (zoomLevel / 100)}px ${gridSnap * (zoomLevel / 100)}px` : undefined,
              }}
            >
              <div style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top left',
                width: bounds.width,
                height: bounds.height,
                position: 'absolute',
                top: 0,
                left: 0,
              }}>
                {/* SVG connection layer */}
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
                  {links.map((link) => {
                    const sourceNode = nodes.find(n => n.id === link.sourceNodeId);
                    const targetNode = nodes.find(n => n.id === link.targetNodeId);
                    if (!sourceNode || !targetNode) return null;

                    const sourcePos = getNodePosition(sourceNode);
                    const targetPos = getNodePosition(targetNode);
                    if (!sourceNode.position && !targetNode.position) return null;

                    const path = calculateConnectionPath(sourcePos, targetPos, NODE_WIDTH, NODE_HEIGHT);
                    const arrowPoints = calculateArrowHead(targetPos, NODE_HEIGHT, 8);
                    const labelPos = calculateLinkLabelPosition(sourcePos, targetPos, NODE_WIDTH, NODE_HEIGHT);
                    const colors = link.critical ? linkColors.critical : linkColors.normal;
                    const labelText = formatLinkLabel(link.type, link.label);

                    return (
                      <g key={link.id}>
                        {/* Click target for deletion */}
                        {onLinkDelete && (
                          <path
                            d={path}
                            fill="none"
                            stroke="transparent"
                            strokeWidth={14}
                            style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                            onClick={(e) => { e.stopPropagation(); onLinkDelete(link.id); }}
                          />
                        )}
                        <path
                          d={path}
                          fill="none"
                          stroke={colors.stroke}
                          strokeWidth={2}
                          style={{ pointerEvents: onLinkClick ? 'stroke' : 'none', cursor: onLinkClick ? 'pointer' : 'default' }}
                          onClick={() => onLinkClick?.(link.id)}
                        />
                        <polygon points={arrowPoints} fill={colors.stroke} />
                        <foreignObject x={labelPos.x - 60} y={labelPos.y - 12} width={120} height={24} style={{ pointerEvents: 'none' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`,
                            borderRadius: tokens.borderRadius.sm,
                            fontSize: tokens.typography.fontSize.xs,
                            color: colors.labelColor,
                            backgroundColor: colors.labelBg,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${link.critical ? tokens.colors.errorScale[200] : tokens.colors.neutral[200]}`,
                            whiteSpace: 'nowrap',
                            textAlign: 'center',
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {labelText}
                          </span>
                        </foreignObject>
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

                {/* Node cards */}
                {nodes.map((node) => {
                  const sColors = statusColors[node.status];
                  const pos = getNodePosition(node);
                  const isSelected = selectedNodeId === node.id;
                  const isDragging = dragState?.nodeId === node.id;

                  return (
                    <div
                      key={node.id}
                      onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
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
                          : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        boxShadow: isDragging ? tokens.shadows.lg : isSelected ? tokens.shadows.md : tokens.shadows.sm,
                        cursor: onNodeMove ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
                        overflow: 'visible',
                        zIndex: isDragging ? 100 : isSelected ? 50 : 1,
                        userSelect: 'none',
                        transition: isDragging ? 'none' : `all ${tokens.motion.hover}`,
                      }}
                    >
                      {/* Input port (left) */}
                      <div style={{
                        position: 'absolute', left: -5, top: NODE_HEIGHT / 2 - 5,
                        width: 10, height: 10, borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.neutral[300],
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}`, zIndex: 2,
                      }} />

                      {/* Output port (right) */}
                      <div
                        onMouseDown={(e) => handlePortMouseDown(e, node.id)}
                        style={{
                          position: 'absolute', right: -5, top: NODE_HEIGHT / 2 - 5,
                          width: 10, height: 10, borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.primaryScale[500],
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}`,
                          cursor: onLinkCreate ? 'crosshair' : 'default', zIndex: 2,
                        }}
                      />

                      {/* Node header */}
                      <div style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], flexShrink: 0 }}>
                          <div style={{ width: tokens.spacing[2], height: tokens.spacing[2], borderRadius: tokens.borderRadius.full, backgroundColor: sColors.dot }} />
                          <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[500] }}>{node.taskId}</span>
                        </div>
                        <span style={{
                          fontWeight: tokens.typography.fontWeight.semibold,
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[900],
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                        }}>
                          {node.title}
                        </span>

                        {/* Action menu */}
                        {node.actions && node.actions.length > 0 && (
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveActionMenu(activeActionMenu === node.id ? null : node.id);
                              }}
                              onMouseDown={(e) => e.stopPropagation()}
                              style={{
                                width: tokens.spacing[5], height: tokens.spacing[5],
                                border: 'none', borderRadius: tokens.borderRadius.sm,
                                backgroundColor: 'transparent', cursor: 'pointer',
                                transition: `all ${tokens.motion.hover}`,
                                fontFamily: 'inherit', fontSize: tokens.typography.fontSize.md,
                                color: tokens.colors.neutral[400],
                                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                              }}
                            >
                              ...
                            </button>
                            {activeActionMenu === node.id && (
                              <div style={{
                                position: 'absolute', top: '100%', right: 0, zIndex: 10,
                                minWidth: 160, backgroundColor: tokens.colors.common.white,
                                borderRadius: tokens.borderRadius.md,
                                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                                boxShadow: tokens.shadows.lg,
                                padding: `${tokens.spacing[1]}px 0`,
                              }}>
                                {node.actions.map((action) => (
                                  <button
                                    key={action.key}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveActionMenu(null);
                                      onNodeAction?.(node.id, action.key);
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
                                      width: '100%',
                                      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                                      border: 'none', backgroundColor: 'transparent',
                                      fontSize: tokens.typography.fontSize.sm,
                                      color: action.destructive ? tokens.colors.errorScale[600] : tokens.colors.neutral[700],
                                      cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                                      transition: `all ${tokens.motion.hover}`,
                                    }}
                                  >
                                    {action.icon && <span>{action.icon}</span>}
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Node body */}
                      <div style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                        {(node.startDate || node.endDate) && (
                          <div style={{ display: 'flex', gap: tokens.spacing[2], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[2] }}>
                            {node.startDate && <span>{node.startDate}</span>}
                            {node.startDate && node.endDate && <span style={{ color: tokens.colors.neutral[300] }}>&rarr;</span>}
                            {node.endDate && <span>{node.endDate}</span>}
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.sm,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: sColors.color, backgroundColor: sColors.bgColor,
                            letterSpacing: '0.025em',
                          }}>
                            {getNodeStatusLabel(node.status)}
                          </span>

                          {node.tags && node.tags.length > 0 && (
                            <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                              {node.tags.map((tag) => (
                                <span key={tag} style={{
                                  padding: `0 ${tokens.spacing[1]}px`,
                                  borderRadius: tokens.borderRadius.sm,
                                  fontSize: tokens.typography.fontSize.xs,
                                  color: tokens.colors.neutral[500],
                                  backgroundColor: tokens.colors.neutral[100],
                                }}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
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
            alignItems: 'center', zIndex: 200,
          }}>
            <button onClick={() => handleZoom(-10)} style={{
              width: tokens.spacing[7], height: tokens.spacing[7], border: 'none',
              borderRadius: tokens.borderRadius.sm, backgroundColor: 'transparent',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: tokens.typography.fontSize.md,
              transition: `all ${tokens.motion.hover}`,
              color: tokens.colors.neutral[600], display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              &minus;
            </button>
            <span style={{ display: 'flex', alignItems: 'center', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], padding: `0 ${tokens.spacing[1]}px`, minWidth: tokens.spacing[8], justifyContent: 'center' }}>{zoomLevel}%</span>
            <button onClick={() => handleZoom(10)} style={{
              width: tokens.spacing[7], height: tokens.spacing[7], border: 'none',
              borderRadius: tokens.borderRadius.sm, backgroundColor: 'transparent',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: tokens.typography.fontSize.md,
              transition: `all ${tokens.motion.hover}`,
              color: tokens.colors.neutral[600], display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              +
            </button>
            <div style={{ width: 1, height: tokens.spacing[5], backgroundColor: tokens.colors.neutral[200] }} />
            <button onClick={onZoomFit} style={{
              height: tokens.spacing[7], border: 'none', borderRadius: tokens.borderRadius.sm,
              backgroundColor: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
              transition: `all ${tokens.motion.hover}`,
              fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600],
              padding: `0 ${tokens.spacing[2]}px`,
            }}>
              Fit
            </button>
            <button onClick={onZoomReset} style={{
              height: tokens.spacing[7], border: 'none', borderRadius: tokens.borderRadius.sm,
              backgroundColor: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
              transition: `all ${tokens.motion.hover}`,
              fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600],
              padding: `0 ${tokens.spacing[2]}px`,
            }}>
              Reset
            </button>
          </div>
        </div>
      </Box>
    );
  },
});
