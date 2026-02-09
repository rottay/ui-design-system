'use client';

/**
 * GroupHierarchyTree - Flat Preset
 * Flat list with breadcrumb hierarchy path, search/filter, and sortable columns
 */

import { useState, useMemo } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { GroupHierarchyTreeProps } from '../../core';
import { flattenGroups, getGroupDepthColor, getGroupDepthBgColor } from '../../core';
import {
  createBadgeStyle,
  createCardStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createFilterPillStyle,
} from '../../../helpers';

export const FlatGroupHierarchyTree = createPreset<GroupHierarchyTreeProps>({
  name: 'GroupHierarchyTree.Flat',
  render: ({ primitives, props, tokens, engine }: PresetContext<GroupHierarchyTreeProps>) => {
    const { Box } = primitives;

    const {
      groups,
      onSelectGroup,
      onCreateGroup,
      onEditGroup,
      onDeleteGroup,
      selectedGroupId: selectedGroupIdProp,
      title = 'Group Hierarchy',
      subtitle,
      loading,
      className,
      style,
    } = props;

    const [internalSelectedId, setInternalSelectedId] = useState(selectedGroupIdProp ?? '');
    const [search, setSearch] = useState('');

    const selectedGroupId = selectedGroupIdProp ?? internalSelectedId;

    const handleSelect = (groupId: string) => {
      setInternalSelectedId(groupId);
      onSelectGroup?.(groupId);
    };

    const flatList = useMemo(() => flattenGroups(groups), [groups]);

    const filteredList = useMemo(() => {
      if (!search) return flatList;
      const lower = search.toLowerCase();
      return flatList.filter(item =>
        item.group.name.toLowerCase().includes(lower) ||
        item.path.join(' > ').toLowerCase().includes(lower) ||
        item.group.description?.toLowerCase().includes(lower)
      );
    }, [flatList, search]);

    const columns = [
      { key: 'name', label: 'Name' },
      { key: 'path', label: 'Path' },
      { key: 'members', label: 'Members', width: '100px' },
      { key: 'permissions', label: 'Permissions', width: '120px' },
      { key: 'actions', label: '', width: '140px' },
    ];

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
              <span style={{
                fontWeight: tokens.typography.fontWeight.normal,
                color: tokens.colors.neutral[400],
                fontSize: tokens.typography.fontSize.sm,
                marginLeft: tokens.spacing[2],
              }}>
                ({filteredList.length})
              </span>
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

        {/* Search bar */}
        <div style={{
          padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groups..."
            style={{
              width: '100%',
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              fontSize: tokens.typography.fontSize.sm,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.neutral[50],
              color: tokens.colors.neutral[900],
              outline: 'none',
              fontFamily: 'inherit',
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
              e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = tokens.colors.neutral[300];
            }}
          />
        </div>

        {/* Table */}
        <Box style={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
              Loading...
            </Box>
          ) : filteredList.length === 0 ? (
            <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
              {search ? 'No groups match your search' : 'No groups found'}
            </Box>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      style={{
                        textAlign: 'left',
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[500],
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        backgroundColor: tokens.colors.neutral[50],
                        userSelect: 'none',
                        width: col.width,
                      }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredList.map(({ group, path, depth }) => {
                  const isSelected = group.id === selectedGroupId;
                  const depthColor = getGroupDepthColor(tokens, depth);
                  const depthBgColor = getGroupDepthBgColor(tokens, depth);

                  return (
                    <tr
                      key={group.id}
                      onClick={() => handleSelect(group.id)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                        transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                      }}
                    >
                      {/* Name */}
                      <td style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                          <span style={{
                            width: tokens.spacing[5],
                            height: tokens.spacing[5],
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: tokens.borderRadius.sm,
                            backgroundColor: depthBgColor,
                            fontSize: tokens.typography.fontSize.xs,
                            flexShrink: 0,
                          }}>
                            {group.icon || '\u25A0'}
                          </span>
                          <span style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: isSelected ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                            color: isSelected ? tokens.colors.primaryScale[700] : tokens.colors.neutral[900],
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {group.name}
                          </span>
                        </div>
                      </td>

                      {/* Path breadcrumb */}
                      <td style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                        }}>
                          {path.map((segment, idx) => (
                            <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                              {idx > 0 && (
                                <span style={{ color: tokens.colors.neutral[300] }}>{'\u203A'}</span>
                              )}
                              <span style={{
                                color: idx === path.length - 1 ? tokens.colors.neutral[700] : tokens.colors.neutral[400],
                                fontWeight: idx === path.length - 1 ? tokens.typography.fontWeight.medium : tokens.typography.fontWeight.normal,
                              }}>
                                {segment}
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Members */}
                      <td style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      }}>
                        <span style={{
                          ...createBadgeStyle(tokens, 'info'),
                        }}>
                          {group.memberCount}
                        </span>
                      </td>

                      {/* Permissions */}
                      <td style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      }}>
                        <span style={{
                          ...createBadgeStyle(tokens, 'secondary'),
                        }}>
                          {group.permissions.length} perm{group.permissions.length !== 1 ? 's' : ''}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      }}>
                        <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                          {onEditGroup && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onEditGroup(group.id); }}
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
                              onClick={(e) => { e.stopPropagation(); onDeleteGroup(group.id); }}
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Box>
      </Box>
    );
  },
});
