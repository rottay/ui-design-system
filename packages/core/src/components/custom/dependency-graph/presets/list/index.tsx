'use client';

/**
 * DependencyGraph - List Preset
 * Flat dependency table with sorting
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { DependencyGraphProps } from '../../core';
import {
  getNodeStatusColors,
  getLinkColors,
  getLinkTypeLabel,
  formatLinkLabel,
} from '../../core';

export const ListDependencyGraph = createPreset<DependencyGraphProps>({
  name: 'DependencyGraph.List',
  render: ({ primitives, props, tokens, engine }: PresetContext<DependencyGraphProps>) => {
    const { Box } = primitives;
    const statusColors = getNodeStatusColors(tokens);
    const linkColors = getLinkColors(tokens);

    const {
      nodes,
      links,
      breadcrumbs = [],
      onLinkClick,
      onAddDependency,
      title = 'Dependencies',
      loading,
      className,
      style,
    } = props;

    type SortKey = 'source' | 'relationship' | 'offset' | 'target' | 'critical';
    const [sortColumn, setSortColumn] = useState<SortKey | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSort = (col: SortKey) => {
      if (sortColumn === col) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortColumn(col);
        setSortDirection('asc');
      }
    };

    const getNodeById = (id: string) => nodes.find(n => n.id === id);

    const getSortValue = (link: typeof links[0], key: SortKey): string => {
      switch (key) {
        case 'source': {
          const node = getNodeById(link.sourceNodeId);
          return node ? `${node.taskId} ${node.title}` : '';
        }
        case 'relationship':
          return getLinkTypeLabel(link.type);
        case 'offset':
          return link.label ? `${link.label.offsetValue}${link.label.offsetUnit}` : '';
        case 'target': {
          const node = getNodeById(link.targetNodeId);
          return node ? `${node.taskId} ${node.title}` : '';
        }
        case 'critical':
          return link.critical ? '1' : '0';
        default:
          return '';
      }
    };

    const sortedLinks = sortColumn
      ? [...links].sort((a, b) => {
          const valA = getSortValue(a, sortColumn);
          const valB = getSortValue(b, sortColumn);
          const result = valA.localeCompare(valB, undefined, { numeric: true });
          return sortDirection === 'asc' ? result : -result;
        })
      : links;

    const columns: { key: SortKey; label: string; width?: string }[] = [
      { key: 'source', label: 'Source' },
      { key: 'relationship', label: 'Relationship', width: '160px' },
      { key: 'offset', label: 'Offset', width: '120px' },
      { key: 'target', label: 'Target' },
      { key: 'critical', label: 'Critical', width: '80px' },
    ];

    const renderNodeCell = (nodeId: string) => {
      const node = getNodeById(nodeId);
      if (!node) return <span style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>Unknown</span>;

      const sColors = statusColors[node.status];
      return (
        <Box style={{
          boxShadow: tokens.shadows.md, display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
            borderRadius: tokens.borderRadius.sm,
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.medium,
            color: sColors.color,
            backgroundColor: sColors.bgColor,
            flexShrink: 0,
          }}>
            <Box style={{ width: tokens.spacing[1], height: tokens.spacing[1], borderRadius: tokens.borderRadius.full, backgroundColor: sColors.dot }} />
            {node.taskId}
          </span>
          <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.title}</span>
        </Box>
      );
    };

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.common.white, ...style }}>
        {/* Header */}
        <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
          {breadcrumbs.length > 0 && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], marginBottom: tokens.spacing[2], fontSize: tokens.typography.fontSize.sm }}>
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
            </Box>
          )}
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
              {title}
              <span style={{ fontWeight: tokens.typography.fontWeight.normal, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm, marginLeft: tokens.spacing[2] }}>({links.length})</span>
            </h2>
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
                fontFamily: 'inherit',
              }}
            >
              + Add dependency
            </button>
          </Box>
        </Box>

        {/* Table */}
        <Box style={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>Loading...</Box>
          ) : links.length === 0 ? (
            <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>No dependencies found</Box>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      style={{
                        textAlign: col.key === 'critical' ? 'center' : 'left',
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[500],
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        backgroundColor: tokens.colors.neutral[50],
                        cursor: 'pointer',
                        userSelect: 'none',
                        width: col.width,
                      }}
                    >
                      {col.label}
                      {sortColumn === col.key && (
                        <span style={{ marginLeft: tokens.spacing[1] }}>{sortDirection === 'asc' ? '\u2191' : '\u2193'}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedLinks.map((link) => {
                  const offsetText = link.label
                    ? `${link.label.approximate ? '~' : ''}${link.label.offsetValue}${link.label.offsetUnit}`
                    : '\u2014';

                  return (
                    <tr
                      key={link.id}
                      onClick={() => onLinkClick?.(link.id)}
                      style={{
                        cursor: onLinkClick ? 'pointer' : 'default',
                      }}
                    >
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                        {renderNodeCell(link.sourceNodeId)}
                      </td>
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                        <span style={{
                          display: 'inline-block',
                          padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.sm,
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[700],
                          backgroundColor: tokens.colors.neutral[100],
                        }}>
                          {getLinkTypeLabel(link.type)}
                        </span>
                      </td>
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                        {offsetText}
                      </td>
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                        {renderNodeCell(link.targetNodeId)}
                      </td>
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, textAlign: 'center' }}>
                        {link.critical && (
                          <Box style={{
                            width: tokens.spacing[2],
                            height: tokens.spacing[2],
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: tokens.colors.errorScale[500],
                            display: 'inline-block',
                          }} />
                        )}
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
