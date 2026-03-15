'use client';

/**
 * GroupHierarchyTree - Tree Preset
 * Recursive expandable/collapsible tree with indentation
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { GroupHierarchyTreeProps, GroupNode } from '../../core';
import { getGroupDepthColor, getGroupDepthBgColor, getGroupDepthBorderColor } from '../../core';
import {
  createBadgeStyle,
  createCardStyle,
  createListItemStyle,
  createPanelHeaderStyle,
} from '../../../helpers';

export const TreeGroupHierarchyTree = createPreset<GroupHierarchyTreeProps>({
  name: 'GroupHierarchyTree.Tree',
  render: ({ primitives, props, tokens, engine }: PresetContext<GroupHierarchyTreeProps>) => {
    const { Box } = primitives;

    const {
      groups,
      onSelectGroup,
      onCreateGroup,
      onEditGroup,
      onDeleteGroup,
      selectedGroupId: selectedGroupIdProp,
      expandedGroupIds: expandedGroupIdsProp,
      title = 'Group Hierarchy',
      subtitle,
      loading,
      className,
      style,
    } = props;

    const [internalSelectedId, setInternalSelectedId] = useState(selectedGroupIdProp ?? '');
    const [internalExpandedIds, setInternalExpandedIds] = useState<Set<string>>(
      new Set(expandedGroupIdsProp ?? groups.map(g => g.id))
    );

    const selectedGroupId = selectedGroupIdProp ?? internalSelectedId;
    const expandedIds = expandedGroupIdsProp ? new Set(expandedGroupIdsProp) : internalExpandedIds;

    const handleSelect = (groupId: string) => {
      setInternalSelectedId(groupId);
      onSelectGroup?.(groupId);
    };

    const handleToggleExpand = (groupId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!expandedGroupIdsProp) {
        setInternalExpandedIds(prev => {
          const next = new Set(prev);
          if (next.has(groupId)) next.delete(groupId);
          else next.add(groupId);
          return next;
        });
      }
    };

    const renderNode = (node: GroupNode, depth: number): React.ReactElement => {
      const isSelected = node.id === selectedGroupId;
      const isExpanded = expandedIds.has(node.id);
      const hasChildren = node.children.length > 0;
      const depthColor = getGroupDepthColor(tokens, depth);
      const depthBgColor = getGroupDepthBgColor(tokens, depth);
      const depthBorderColor = getGroupDepthBorderColor(tokens, depth);

      return (
        <div key={node.id}>
          {/* Node row */}
          <div
            onClick={() => handleSelect(node.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              paddingLeft: tokens.spacing[3] + depth * tokens.spacing[5],
              paddingRight: tokens.spacing[3],
              paddingTop: tokens.spacing[2],
              paddingBottom: tokens.spacing[2],
              backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
              borderLeft: isSelected ? `3px solid ${tokens.colors.primaryScale[600]}` : '3px solid transparent',
              cursor: 'pointer',
              transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            }}
          >
            {/* Expand/collapse arrow */}
            <span
              onClick={hasChildren ? (e) => handleToggleExpand(node.id, e) : undefined}
              style={{
                width: tokens.spacing[4],
                height: tokens.spacing[4],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: tokens.typography.fontSize.xs,
                color: hasChildren ? tokens.colors.neutral[500] : 'transparent',
                cursor: hasChildren ? 'pointer' : 'default',
                transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: `transform ${tokens.transitions?.fast || tokens.motion.hover}`,
                flexShrink: 0,
              }}
            >
              {hasChildren ? '\u25BE' : ''}
            </span>

            {/* Icon / color indicator */}
            <span style={{
              width: tokens.spacing[6],
              height: tokens.spacing[6],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: tokens.borderRadius.md,
              backgroundColor: depthBgColor,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${depthBorderColor}`,
              fontSize: tokens.typography.fontSize.sm,
              flexShrink: 0,
            }}>
              {node.icon || '\u25A0'}
            </span>

            {/* Name + description */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: isSelected ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                color: isSelected ? tokens.colors.primaryScale[700] : tokens.colors.neutral[900],
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {node.name}
              </div>
              {node.description && (
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {node.description}
                </div>
              )}
            </div>

            {/* Member count badge */}
            <span style={{
              ...createBadgeStyle(tokens, 'info'),
              flexShrink: 0,
            }}>
              {node.memberCount} {node.memberCount === 1 ? 'member' : 'members'}
            </span>

            {/* Permission count */}
            <span style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              flexShrink: 0,
            }}>
              {node.permissions.length} perm{node.permissions.length !== 1 ? 's' : ''}
            </span>

            {/* Actions */}
            <div style={{ display: 'flex', gap: tokens.spacing[1], flexShrink: 0 }}>
              {onEditGroup && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEditGroup(node.id); }}
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.sm,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    backgroundColor: 'transparent',
                    color: tokens.colors.neutral[600],
                    fontSize: tokens.typography.fontSize.xs,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  Edit
                </button>
              )}
              {onDeleteGroup && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteGroup(node.id); }}
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.sm,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                    backgroundColor: 'transparent',
                    color: tokens.colors.errorScale[600],
                    fontSize: tokens.typography.fontSize.xs,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Children */}
          {hasChildren && isExpanded && (
            <div>
              {node.children.map(child => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    };

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.common.white, ...style }}>
        {/* Header */}
        <Box style={{
          ...createPanelHeaderStyle(tokens),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
            }}>
              {title}
            </h2>
            {subtitle && (
              <div style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}>
                {subtitle}
              </div>
            )}
          </div>
          {onCreateGroup && (
            <button
              onClick={onCreateGroup}
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
              + New Group
            </button>
          )}
        </Box>

        {/* Tree content */}
        <Box style={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
              Loading...
            </Box>
          ) : groups.length === 0 ? (
            <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
              No groups found
            </Box>
          ) : (
            groups.map(group => renderNode(group, 0))
          )}
        </Box>
      </Box>
    );
  },
});
