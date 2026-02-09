'use client';

/**
 * GroupHierarchyTree - Org Chart Preset
 * Visual card-based hierarchy with top-down connector lines
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { GroupHierarchyTreeProps, GroupNode } from '../../core';
import { getGroupDepthColor, getGroupDepthBgColor, getGroupDepthBorderColor } from '../../core';
import {
  createBadgeStyle,
  createCardStyle,
  createPanelHeaderStyle,
} from '../../../helpers';

export const OrgChartGroupHierarchyTree = createPreset<GroupHierarchyTreeProps>({
  name: 'GroupHierarchyTree.OrgChart',
  render: ({ primitives, props, tokens, engine }: PresetContext<GroupHierarchyTreeProps>) => {
    const { Box } = primitives;

    const {
      groups,
      onSelectGroup,
      onCreateGroup,
      selectedGroupId: selectedGroupIdProp,
      title = 'Group Hierarchy',
      subtitle,
      loading,
      className,
      style,
    } = props;

    const [internalSelectedId, setInternalSelectedId] = useState(selectedGroupIdProp ?? '');
    const selectedGroupId = selectedGroupIdProp ?? internalSelectedId;

    const handleSelect = (groupId: string) => {
      setInternalSelectedId(groupId);
      onSelectGroup?.(groupId);
    };

    const renderNodeCard = (node: GroupNode, depth: number): React.ReactElement => {
      const isSelected = node.id === selectedGroupId;
      const depthColor = getGroupDepthColor(tokens, depth);
      const depthBgColor = getGroupDepthBgColor(tokens, depth);
      const depthBorderColor = getGroupDepthBorderColor(tokens, depth);
      const hasChildren = node.children.length > 0;

      return (
        <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Node card */}
          <div
            onClick={() => handleSelect(node.id)}
            style={{
              ...createCardStyle(tokens, { elevation: 'sm' }),
              width: 200,
              padding: tokens.spacing[3],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              borderColor: isSelected ? tokens.colors.primaryScale[400] : tokens.colors.neutral[200],
              borderWidth: isSelected ? 2 : undefined,
              backgroundColor: isSelected ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
              textAlign: 'center',
            }}
          >
            {/* Icon */}
            <div style={{
              width: tokens.spacing[8],
              height: tokens.spacing[8],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: tokens.borderRadius.full,
              backgroundColor: depthBgColor,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${depthBorderColor}`,
              margin: '0 auto',
              marginBottom: tokens.spacing[2],
              fontSize: tokens.typography.fontSize.lg,
            }}>
              {node.icon || '\u25A0'}
            </div>

            {/* Name */}
            <div style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: isSelected ? tokens.colors.primaryScale[700] : tokens.colors.neutral[900],
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginBottom: tokens.spacing[1],
            }}>
              {node.name}
            </div>

            {/* Description */}
            {node.description && (
              <div style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginBottom: tokens.spacing[2],
              }}>
                {node.description}
              </div>
            )}

            {/* Stats row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: tokens.spacing[2],
            }}>
              <span style={{
                ...createBadgeStyle(tokens, 'info'),
                fontSize: tokens.typography.fontSize.xs,
              }}>
                {node.memberCount}
              </span>
              <span style={{
                ...createBadgeStyle(tokens, 'secondary'),
                fontSize: tokens.typography.fontSize.xs,
              }}>
                {node.permissions.length} perm{node.permissions.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Connector line down */}
          {hasChildren && (
            <div style={{
              width: 2,
              height: tokens.spacing[4],
              backgroundColor: tokens.colors.neutral[300],
            }} />
          )}

          {/* Children row */}
          {hasChildren && (
            <div style={{ position: 'relative' }}>
              {/* Horizontal connector line */}
              {node.children.length > 1 && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: `calc(100% - 200px)`,
                  height: 2,
                  backgroundColor: tokens.colors.neutral[300],
                }} />
              )}

              <div style={{
                display: 'flex',
                gap: tokens.spacing[4],
                justifyContent: 'center',
              }}>
                {node.children.map(child => (
                  <div key={child.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Vertical connector from horizontal line */}
                    <div style={{
                      width: 2,
                      height: tokens.spacing[4],
                      backgroundColor: tokens.colors.neutral[300],
                    }} />
                    {renderNodeCard(child, depth + 1)}
                  </div>
                ))}
              </div>
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

        {/* Org chart content */}
        <Box style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[6] }}>
          {loading ? (
            <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
              Loading...
            </Box>
          ) : groups.length === 0 ? (
            <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
              No groups found
            </Box>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
              {groups.map(group => renderNodeCard(group, 0))}
            </div>
          )}
        </Box>
      </Box>
    );
  },
});
